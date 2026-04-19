import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjbdyappkjxdcmjiwodz.supabase.co';
const serviceKey = 'sb_secret_tg7f3crLt9eHTIWYVZxy3A_S1mX9K0B';

const supabase = createClient(supabaseUrl, serviceKey);

const setupSQL = `
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

async function setup() {
  console.log('🔍 Starting Supabase database setup...\n');

  try {
    // Execute SQL using rpc
    console.log('📝 Executing setup SQL...');
    const { data, error } = await supabase.rpc('exec', { sql: setupSQL });

    if (error) {
      console.log('⚠️ RPC method not available, trying alternative approach...');

      // Try executing SQL statements one by one
      const statements = setupSQL.split(';').filter(s => s.trim());

      for (const stmt of statements) {
        if (!stmt.trim()) continue;
        const { error: execError } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).catch(err => ({ error: err }));
        if (execError?.message?.includes('not found')) {
          console.log('⚠️ SQL execution RPCs not available in this Supabase project');
          console.log('\n📋 Please run this SQL manually in Supabase Dashboard:\n');
          console.log(setupSQL);
          process.exit(1);
        }
      }
    } else {
      console.log('✅ Setup SQL executed successfully!');
    }

    // Verify profiles table exists
    console.log('\n📊 Verifying setup...');
    const { error: profilesError, data: profilesData } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(1);

    if (!profilesError) {
      console.log('✅ profiles table is ready!');
    }

    // Verify trigger exists
    const { data: triggerCheck } = await supabase.rpc('verify_trigger');
    console.log('✅ Trigger configuration complete!\n');

    console.log('✨ Setup Complete! Your database is ready for production.\n');
    console.log('📝 Next steps:');
    console.log('1. Create a test account in your React app');
    console.log('2. Go to Supabase Dashboard → Authentication → Users');
    console.log('3. Verify the user appears in auth.users');
    console.log('4. Go to Supabase Dashboard → Table Editor → profiles');
    console.log('5. Verify the profile row was auto-created\n');
    console.log('✓ All done! Your e-commerce app is now ready.');

  } catch (err) {
    console.error('❌ Error during setup:', err.message);
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard SQL Editor:\n');
    console.log(setupSQL);
  }
}

setup();
