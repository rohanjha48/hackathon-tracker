-- ==============================================================================
-- 🚀 Supabase Migration: Location and Currency Localization
-- Phase 1: Database Schema Update
-- Adds mode, country, state, city, prize_currency, prize_amount to hackathons
-- Adds preferred_country, preferred_city, preferred_mode to users
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPDATE HACKATHONS TABLE
-- ------------------------------------------------------------------------------

-- Add mode column (online, in-person, hybrid)
ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'online';

-- Add location hierarchy: country, state, city
ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS state VARCHAR(100);

ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add currency & amount localization columns
ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS prize_currency VARCHAR(10) DEFAULT 'USD';

ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS prize_amount NUMERIC(12, 2) DEFAULT 0;

-- Backfill existing rows for seamless backwards compatibility
UPDATE public.hackathons
SET 
    mode = LOWER(COALESCE(location_type, 'online')),
    prize_currency = COALESCE(currency, 'USD'),
    prize_amount = COALESCE(prize_pool, 0)
WHERE mode IS NULL OR prize_currency IS NULL OR prize_amount IS NULL;

-- Backfill Bangalore / Indian cities if found in existing location strings
UPDATE public.hackathons
SET 
    city = 'Bangalore',
    state = 'Karnataka',
    country = 'India'
WHERE (location ILIKE '%Bangalore%' OR location ILIKE '%Bengaluru%') 
  AND (city IS NULL OR country IS NULL);

UPDATE public.hackathons
SET 
    country = 'India'
WHERE (location ILIKE '%India%' OR source = 'Unstop') 
  AND country IS NULL;

-- Performance Indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons (mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_country ON public.hackathons (country);
CREATE INDEX IF NOT EXISTS idx_hackathons_city ON public.hackathons (city);
CREATE INDEX IF NOT EXISTS idx_hackathons_prize_currency ON public.hackathons (prize_currency);
CREATE INDEX IF NOT EXISTS idx_hackathons_loc_composite ON public.hackathons (country, city, mode);

-- ------------------------------------------------------------------------------
-- 2. UPDATE USERS TABLE (Telegram Subscribers)
-- ------------------------------------------------------------------------------

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferred_country VARCHAR(100);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferred_city VARCHAR(100);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferred_mode VARCHAR(50) DEFAULT 'both'; -- 'both', 'online', 'in-person'

CREATE INDEX IF NOT EXISTS idx_users_preferred_city ON public.users (preferred_city);
CREATE INDEX IF NOT EXISTS idx_users_preferred_country ON public.users (preferred_country);
CREATE INDEX IF NOT EXISTS idx_users_preferred_mode ON public.users (preferred_mode);

-- ------------------------------------------------------------------------------
-- 3. UPDATE SUBSCRIBERS VIEW
-- ------------------------------------------------------------------------------
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
-- 4. UPDATE SYNC TRIGGER TO KEEP LEGACY & NEW COLUMNS SYNCHRONIZED
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
