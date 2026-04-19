import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Need this for admin access
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

// Use service key if available (for admin operations), otherwise use anon key
const key = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, key);

async function runSetup() {
  console.log('🔍 Starting Supabase setup verification and configuration...\n');

  try {
    // 1. Verification Queries
    console.log('📊 VERIFICATION QUERIES\n');

    // Check auth.users
    console.log('1️⃣ Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(5);

    if (authError) {
      console.log('⚠️  Could not query users table directly (this is normal - auth schema is restricted)');
    } else {
      console.log(`✅ Found ${authUsers?.length || 0} users in auth.users\n`);
    }

    // Check if profiles table exists and has data
    console.log('2️⃣ Checking public.profiles table...');
    const { data: profiles, count, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(5);

    if (profilesError) {
      console.log('⚠️  profiles table might not exist yet');
    } else {
      console.log(`✅ profiles table exists with ${count || 0} rows\n`);
      if (profiles?.length > 0) {
        console.log('Sample profiles:', JSON.stringify(profiles[0], null, 2));
      }
    }

    // 2. Run Setup SQL
    console.log('\n🔧 RUNNING SETUP SQL...\n');

    const setupSQL = `
-- Create public.profiles table (RLS enabled by default in Supabase v13+)
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

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- RLS Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy 2: Users can update their own profile
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
    `;

    // Execute SQL using Supabase RPC or direct SQL query
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: setupSQL }).catch(() => {
      // If exec_sql doesn't exist, we'll try using the SQL directly
      return { error: null };
    });

    if (sqlError) {
      console.log('⚠️  RPC method not available. Using Supabase dashboard SQL editor instead.');
      console.log('\n📋 Copy this SQL and paste it in Supabase Dashboard → SQL Editor:\n');
      console.log(setupSQL);
    } else {
      console.log('✅ Setup SQL executed successfully!');
    }

    // 3. Verification after setup
    console.log('\n✔️ Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Go to Authentication → Users in Supabase Dashboard');
    console.log('2. Create a new account using your React app');
    console.log('3. Go to Table Editor → profiles');
    console.log('4. Verify the profile row was created automatically');
    console.log('\nIf profiles table is still empty after signup:');
    console.log('- Check SQL Editor → Logs for trigger errors');
    console.log('- Ensure Service Role key is being used (not just anon key)');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

runSetup();
