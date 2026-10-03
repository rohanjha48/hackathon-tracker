-- ==============================================================================
-- 🚀 100% Free Serverless Hackathon Tracker Schema
-- Supabase PostgreSQL Migration
-- Supports Hackathons (with registration_end) and Users (with telegram_id)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. HACKATHONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    banner_url TEXT,
    prize_pool NUMERIC(12, 2) DEFAULT 0,
    prize_amount NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    prize_currency VARCHAR(10) DEFAULT 'USD',
    mode VARCHAR(50) DEFAULT 'online', -- 'online', 'in-person', 'hybrid'
    location VARCHAR(255) DEFAULT 'Online (Worldwide)',
    location_type VARCHAR(50) DEFAULT 'Online', -- 'Online', 'In-Person', 'Hybrid'
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    start_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    registration_end TIMESTAMPTZ NOT NULL, -- Deadline queried for < 48 hours reminder
    submission_deadline TIMESTAMPTZ,       -- Synced with registration_end
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'Devpost', -- 'Devpost', 'Unstop', 'MLH', 'Devfolio'
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Case-insensitive views / table aliases for seamless queries:
CREATE INDEX IF NOT EXISTS idx_hackathons_reg_end ON public.hackathons (registration_end ASC);
CREATE INDEX IF NOT EXISTS idx_hackathons_active_reg ON public.hackathons (is_active, registration_end);
CREATE INDEX IF NOT EXISTS idx_hackathons_tags ON public.hackathons USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON public.hackathons (slug);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons (mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_country ON public.hackathons (country);
CREATE INDEX IF NOT EXISTS idx_hackathons_city ON public.hackathons (city);
CREATE INDEX IF NOT EXISTS idx_hackathons_prize_curr ON public.hackathons (prize_currency);

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE (Subscribed Telegram IDs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(100) UNIQUE NOT NULL,
    telegram_chat_id VARCHAR(100),
    username VARCHAR(100),
    filter_tags TEXT[] DEFAULT '{}',
    preferred_country VARCHAR(100),
    preferred_city VARCHAR(100),
    preferred_mode VARCHAR(50) DEFAULT 'both', -- 'both', 'online', 'in-person'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_pref_city ON public.users (preferred_city);
CREATE INDEX IF NOT EXISTS idx_users_pref_country ON public.users (preferred_country);
CREATE INDEX IF NOT EXISTS idx_users_pref_mode ON public.users (preferred_mode);

-- Provide view so queries to both 'users' and 'subscribers' work identically
CREATE OR REPLACE VIEW public.subscribers AS
    SELECT id, telegram_id AS telegram_chat_id, username AS telegram_username,
           filter_tags, preferred_country, preferred_city, preferred_mode,
           is_active, created_at, updated_at, last_notified_at
    FROM public.users;

-- ------------------------------------------------------------------------------
-- 3. NOTIFICATION LOGS (For Idempotent, Zero-Duplicate Delivery)
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
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active hackathons"
    ON public.hackathons FOR SELECT USING (true);

CREATE POLICY "Allow full access to hackathons"
    ON public.hackathons FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to users"
    ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to notification_logs"
    ON public.notification_logs FOR ALL USING (true) WITH CHECK (true);

-- Auto-fill submission_deadline from registration_end
CREATE OR REPLACE FUNCTION public.sync_deadline_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_end IS NOT NULL AND NEW.submission_deadline IS NULL THEN
        NEW.submission_deadline = NEW.registration_end;
    ELSIF NEW.submission_deadline IS NOT NULL AND NEW.registration_end IS NULL THEN
        NEW.registration_end = NEW.submission_deadline;
    END IF;
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_hackathons_fields ON public.hackathons;
CREATE TRIGGER trg_sync_hackathons_fields
    BEFORE INSERT OR UPDATE ON public.hackathons
    FOR EACH ROW EXECUTE FUNCTION public.sync_deadline_fields();
