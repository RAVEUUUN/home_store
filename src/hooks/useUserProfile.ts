import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AuthError } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!session) {
          setProfile(null)
          setLoading(false)
          return
        }

        // Fetch profile from public.profiles (with RLS, only own profile visible)
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') throw profileError
        setProfile(data || null)
      } catch (err) {
        setError(err as AuthError)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Subscribe to real-time updates
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single()

    if (updateError) throw updateError
    setProfile(data)
    return data
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    isAuthenticated: !!profile,
  }
}
