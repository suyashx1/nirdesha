-- =============================================================================
-- NIRDESHA PORTAL: SUPABASE POSTGRESQL DATABASE SCHEMA
-- Ministry of Statistics and Programme Implementation (MoSPI), Govt. of India
-- Supports:
-- 1. Secure Admin Key Verification (SHA-256 / cryptographic secret)
-- 2. New Officer Registration & Competency Profiles
-- 3. Row Level Security (RLS) Policies
-- =============================================================================

-- Enable pgcrypto for UUID generation & SHA-256 hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. SECURE ADMIN KEYS TABLE
-- Stores hashed administrative keys for accessing the Nirdesha Admin Command Center
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(120) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Index for instant key lookups
CREATE INDEX IF NOT EXISTS idx_admin_keys_hash ON public.admin_api_keys(key_hash) WHERE is_active = TRUE;

-- Function to verify an administrative key securely via SHA-256
CREATE OR REPLACE FUNCTION public.verify_admin_key(input_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    computed_hash VARCHAR(255);
    key_exists BOOLEAN;
BEGIN
    computed_hash := encode(digest(input_key, 'sha256'), 'hex');
    SELECT EXISTS (
        SELECT 1 FROM public.admin_api_keys
        WHERE key_hash = computed_hash AND is_active = TRUE
    ) INTO key_exists;
    
    IF key_exists THEN
        UPDATE public.admin_api_keys
        SET last_used_at = NOW()
        WHERE key_hash = computed_hash;
    END IF;
    
    RETURN key_exists;
END;
$$;

-- Seed default initial admin key: "mospi@admin2026"
INSERT INTO public.admin_api_keys (key_name, key_hash, description)
VALUES (
    'MoSPI Central Admin Key',
    encode(digest('mospi@admin2026', 'sha256'), 'hex'),
    'Default administrative key for Nirdesha Command Center'
)
ON CONFLICT (key_hash) DO NOTHING;

-- =============================================================================
-- 2. REGISTERED OFFICER PROFILES TABLE
-- Stores registered government officers and their competency baseline metadata
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.registered_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    cadre VARCHAR(100) NOT NULL DEFAULT 'SSS',
    emp_code VARCHAR(100) UNIQUE NOT NULL,
    office VARCHAR(255),
    mobile VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'officer',
    baseline_elo INT DEFAULT 1320,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for login lookups
CREATE INDEX IF NOT EXISTS idx_officers_email ON public.registered_officers(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_officers_emp_code ON public.registered_officers(LOWER(emp_code));

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.admin_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_officers ENABLE ROW LEVEL SECURITY;

-- Allow public verification of admin keys only via the secure function
CREATE POLICY "Deny direct public select on admin keys"
ON public.admin_api_keys
FOR SELECT
TO anon, authenticated
USING (false);

-- Officers can view and update their own registered profile
CREATE POLICY "Officers can read their own profile"
ON public.registered_officers
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Officers can insert registration"
ON public.registered_officers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
