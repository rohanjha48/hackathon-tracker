-- ==============================================================================
-- 🚀 HACKTRACK MASTER DATABASE SCHEMA
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. HACKATHONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    banner_url TEXT,
    prize_pool NUMERIC(12, 2) DEFAULT 0,
    prize_amount NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    prize_currency VARCHAR(10) DEFAULT 'USD',
    mode VARCHAR(50) DEFAULT 'online',               -- 'online', 'in-person', 'hybrid'
    location_type VARCHAR(50) DEFAULT 'Online',      -- 'Online', 'In-Person', 'Hybrid'
    location VARCHAR(255) DEFAULT 'Online (Worldwide)',
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    registration_end TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    source VARCHAR(50) DEFAULT 'Devpost',            -- 'Devpost', 'Unstop', 'MLH'
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_hackathons_is_active ON public.hackathons (is_active);
CREATE INDEX IF NOT EXISTS idx_hackathons_deadline ON public.hackathons (submission_deadline);
CREATE INDEX IF NOT EXISTS idx_hackathons_reg_end ON public.hackathons (registration_end);
CREATE INDEX IF NOT EXISTS idx_hackathons_source ON public.hackathons (source);
CREATE INDEX IF NOT EXISTS idx_hackathons_tags ON public.hackathons USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons (mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_country ON public.hackathons (country);
CREATE INDEX IF NOT EXISTS idx_hackathons_city ON public.hackathons (city);
CREATE INDEX IF NOT EXISTS idx_hackathons_loc_composite ON public.hackathons (country, city, mode);

-- ------------------------------------------------------------------------------
-- 2. USERS / TELEGRAM SUBSCRIBERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(100) UNIQUE NOT NULL,
    telegram_chat_id VARCHAR(100),
    username VARCHAR(100),
    filter_tags TEXT[] DEFAULT '{"All"}'::TEXT[],
    preferred_country VARCHAR(100),
    preferred_city VARCHAR(100),
    preferred_mode VARCHAR(50) DEFAULT 'both',      -- 'both', 'online', 'in-person'
    notify_days_before INT[] DEFAULT '{7, 3, 1}'::INT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_preferred_city ON public.users (preferred_city);
CREATE INDEX IF NOT EXISTS idx_users_preferred_country ON public.users (preferred_country);
CREATE INDEX IF NOT EXISTS idx_users_preferred_mode ON public.users (preferred_mode);

-- Compatibility View for Subscribers
CREATE OR REPLACE VIEW public.subscribers AS
    SELECT 
        id, 
        telegram_id AS telegram_chat_id, 
        username AS telegram_username, 
        filter_tags,
        preferred_country,
        preferred_city,
        preferred_mode,
        is_active, 
        created_at, 
        updated_at, 
        last_notified_at
    FROM public.users;

-- ------------------------------------------------------------------------------
-- 3. NOTIFICATION LOGS (Idempotency Engine)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) DEFAULT '48_hours',
    status VARCHAR(50) DEFAULT 'sent',
    telegram_message_id VARCHAR(100),
    sent_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_user_hackathon_alert UNIQUE (user_id, hackathon_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_lookup 
ON public.notification_logs (user_id, hackathon_id, notification_type);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for web client & scraper
DROP POLICY IF EXISTS "Public read active hackathons" ON public.hackathons;
CREATE POLICY "Public read active hackathons" ON public.hackathons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full access to hackathons" ON public.hackathons;
CREATE POLICY "Allow full access to hackathons" ON public.hackathons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to users" ON public.users;
CREATE POLICY "Allow full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to notification_logs" ON public.notification_logs;
CREATE POLICY "Allow full access to notification_logs" ON public.notification_logs FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. SYNCHRONIZATION TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_localization_and_deadline_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync deadlines
    IF NEW.registration_end IS NOT NULL AND NEW.submission_deadline IS NULL THEN
        NEW.submission_deadline = NEW.registration_end;
    ELSIF NEW.submission_deadline IS NOT NULL AND NEW.registration_end IS NULL THEN
        NEW.registration_end = NEW.submission_deadline;
    END IF;

    -- Sync telegram chat id
    IF NEW.telegram_chat_id IS NULL AND NEW.telegram_id IS NOT NULL THEN
        NEW.telegram_chat_id = NEW.telegram_id;
    END IF;

    -- Sync mode <-> location_type
    IF NEW.mode IS NOT NULL AND NEW.location_type IS NULL THEN
        NEW.location_type = CASE 
            WHEN LOWER(NEW.mode) = 'in-person' THEN 'In-Person'
            WHEN LOWER(NEW.mode) = 'hybrid' THEN 'Hybrid'
            ELSE 'Online'
        END;
    ELSIF NEW.location_type IS NOT NULL AND NEW.mode IS NULL THEN
        NEW.mode = LOWER(NEW.location_type);
    END IF;

    -- Sync prize_amount <-> prize_pool
    IF NEW.prize_amount IS NOT NULL AND (NEW.prize_pool IS NULL OR NEW.prize_pool = 0) THEN
        NEW.prize_pool = NEW.prize_amount;
    ELSIF NEW.prize_pool IS NOT NULL AND (NEW.prize_amount IS NULL OR NEW.prize_amount = 0) THEN
        NEW.prize_amount = NEW.prize_pool;
    END IF;

    -- Sync prize_currency <-> currency
    IF NEW.prize_currency IS NOT NULL AND NEW.currency IS NULL THEN
        NEW.currency = NEW.prize_currency;
    ELSIF NEW.currency IS NOT NULL AND NEW.prize_currency IS NULL THEN
        NEW.prize_currency = NEW.currency;
    END IF;

    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_hackathons_fields ON public.hackathons;
CREATE TRIGGER trg_sync_hackathons_fields
    BEFORE INSERT OR UPDATE ON public.hackathons
    FOR EACH ROW EXECUTE FUNCTION public.sync_localization_and_deadline_fields();
