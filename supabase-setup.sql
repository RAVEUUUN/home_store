-- ============================================================================
-- SUPABASE PRODUCTION SETUP: PROFILES TABLE + AUTO-TRIGGER + RLS
-- ============================================================================
-- Paste this entire block into: Supabase Dashboard → SQL Editor → Run

-- Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- RLS Policy 1: Users can read their own profile only
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy 2: Users can update their own profile only
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy 3: Users can insert their own profile (backup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION QUERIES (run these AFTER setup to verify everything works)
-- ============================================================================

-- Check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Check RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- ============================================================================
-- OPTIONAL CLEANUP: REMOVE SHIPPING STATE FROM ORDERS (IF PRESENT)
-- ============================================================================

-- Drop legacy scalar state columns if they exist
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS state;
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS shipping_state;

-- Remove "state" key from JSON/JSONB shipping address payloads if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'shipping_address'
      AND data_type = 'jsonb'
  ) THEN
    EXECUTE '
      UPDATE public.orders
      SET shipping_address = shipping_address - ''state''
      WHERE shipping_address ? ''state''
    ';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'shipping_address'
      AND data_type = 'json'
  ) THEN
    EXECUTE '
      UPDATE public.orders
      SET shipping_address = (shipping_address::jsonb - ''state'')::json
      WHERE (shipping_address::jsonb ? ''state'')
    ';
  END IF;
END $$;
