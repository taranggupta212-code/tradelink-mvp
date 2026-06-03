-- ============================================================
-- TradeLink Backend - Database Setup Script
-- ============================================================
-- This script creates all required tables and seeds initial data.
-- Run this once to initialize your Supabase database.
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS and INSERT ... WHERE NOT EXISTS.
-- ============================================================

-- 1. Enable the pgcrypto extension (needed for gen_random_uuid())
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the profiles table
-- ============================================================
-- Stores tradie profile information.
-- A row is automatically created when a user signs up via Supabase Auth,
-- using the trigger defined below.
CREATE TABLE IF NOT EXISTS public.profiles (
    -- Links to the Supabase Auth user (auth.users table)
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Tradie's full name (e.g. "Tarang Gupta")
    full_name text,
    -- Tradie's primary trade (e.g. "Carpentry", "Plumbing")
    trade_type text,
    -- Tradie's license/ABN number
    license_number text,
    -- When the profile was created
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create the jobs table
-- ============================================================
-- Stores job postings that tradies can browse and quote on.
-- This is seed/demo data populated below.
CREATE TABLE IF NOT EXISTS public.jobs (
    -- Human-readable job ID (e.g. "job-1")
    id text PRIMARY KEY,
    -- Short job title (e.g. "Kitchen Renovation")
    title text NOT NULL,
    -- Customer's full name
    customer_name text NOT NULL,
    -- Customer's initials for avatar display (e.g. "SM")
    customer_initials text,
    -- Job location (suburb, state)
    location text NOT NULL,
    -- Budget range minimum (in AUD dollars)
    budget_min integer NOT NULL,
    -- Budget range maximum (in AUD dollars)
    budget_max integer NOT NULL,
    -- Trade category (e.g. "Carpentry", "Plumbing", "Electrical")
    trade text NOT NULL,
    -- Whether the job is marked as urgent
    urgent boolean NOT NULL DEFAULT false,
    -- Human-readable time since posting (e.g. "2h ago", "1d ago")
    posted_time_ago text,
    -- Customer's rating (out of 5, e.g. 4.8)
    customer_rating numeric,
    -- Detailed description of the job
    description text,
    -- When the job was posted
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create the quotes table
-- ============================================================
-- Stores quotes submitted by tradies for specific jobs.
CREATE TABLE IF NOT EXISTS public.quotes (
    -- Unique quote ID (auto-generated)
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The tradie who submitted this quote (links to auth.users)
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- The job this quote is for (links to jobs.id)
    job_id text NOT NULL,
    -- Job title at time of quoting (denormalized for easy display)
    job_title text NOT NULL,
    -- Customer name at time of quoting
    customer_name text NOT NULL,
    -- Quoted amount in AUD dollars (must be positive)
    amount integer NOT NULL CHECK (amount > 0),
    -- Estimated duration (e.g. "3-5 days")
    duration text,
    -- Additional notes from the tradie
    notes text,
    -- When the quote was submitted
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create the saved_jobs table
-- ============================================================
-- Tracks which jobs each tradie has bookmarked/saved.
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    -- Unique saved-job ID (auto-generated)
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The tradie who saved this job (links to auth.users)
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- The job that was saved (links to jobs.id)
    job_id text NOT NULL,
    -- When the job was saved
    created_at timestamptz NOT NULL DEFAULT now(),
    -- Prevent duplicate saves (one save per user per job)
    UNIQUE (user_id, job_id)
);

-- 6. Create the trigger function for auto-creating profiles
-- ============================================================
-- This function is called automatically when a new user signs up
-- via Supabase Auth. It copies the user's metadata (full_name,
-- trade_type, license_number) into the profiles table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, trade_type, license_number)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'trade_type',
        NEW.raw_user_meta_data ->> 'license_number'
    );
    RETURN NEW;
END;
$$;

-- 7. Create the trigger (drop first if it exists, to allow re-running)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8. Seed the jobs table with demo data
-- ============================================================
-- Only inserts if the jobs table is empty (safe to re-run).
INSERT INTO public.jobs (id, title, customer_name, customer_initials, location, budget_min, budget_max, trade, urgent, posted_time_ago, customer_rating, description)
SELECT * FROM (VALUES
    (
        'job-1',
        'Kitchen Renovation',
        'Sarah M.',
        'SM',
        'Richmond VIC',
        4200,
        5500,
        'Carpentry',
        true,
        '2h ago',
        4.8,
        'Full kitchen renovation including cabinetry and benchtop.'
    ),
    (
        'job-2',
        'Bathroom Waterproofing',
        'Gupta T.',
        'GT',
        'South Yarra VIC',
        1800,
        2400,
        'Plumbing',
        false,
        '5h ago',
        4.6,
        'Waterproof membrane and surface prep to AS 3740 standards.'
    ),
    (
        'job-3',
        'Electrical Rewiring',
        'Priya K.',
        'PK',
        'Carlton VIC',
        3000,
        4000,
        'Electrical',
        true,
        '1d ago',
        4.9,
        'Full rewiring of 3-bedroom heritage home, switchboard upgrade.'
    ),
    (
        'job-4',
        'Roof Leak Repair',
        'Ishita L.',
        'IL',
        'Fitzroy VIC',
        800,
        1200,
        'Roofing',
        true,
        '30m ago',
        4.7,
        'Inspect and repair leak above master bedroom, replace terracotta tiles.'
    ),
    (
        'job-5',
        'Garden Landscaping',
        'Rohan W.',
        'RW',
        'Hawthorn VIC',
        2500,
        3500,
        'Landscaping',
        false,
        '3d ago',
        4.5,
        'New lawn, garden beds, 3m retaining wall, irrigation.'
    )
) AS v(id, title, customer_name, customer_initials, location, budget_min, budget_max, trade, urgent, posted_time_ago, customer_rating, description)
WHERE NOT EXISTS (SELECT 1 FROM public.jobs);

-- ============================================================
-- Setup complete!
-- Tables created: profiles, jobs, quotes, saved_jobs
-- Trigger created: on_auth_user_created (auto-creates profile on signup)
-- Seed data: 5 demo jobs
-- ============================================================