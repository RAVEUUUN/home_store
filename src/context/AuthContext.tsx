import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthResponse {
    success: boolean
    message?: string
    session?: Session | null
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<AuthResponse>
    register: (name: string, email: string, password: string) => Promise<AuthResponse>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email!)
            }
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email!)
            } else {
                setUser(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string, email: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            }

            if (data) {
                setUser({
                    id: data.id,
                    name: data.full_name || email.split('@')[0],
                    email: data.email || email,
                    role: data.role as 'customer' | 'admin'
                })
            } else {
                // Fallback if profile doesn't exist yet (rare due to trigger)
                setUser({
                    id: userId,
                    name: email.split('@')[0],
                    email: email,
                    role: 'customer'
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const login = async (email: string, password: string): Promise<AuthResponse> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
        })
        if (error) {
            console.error('Login error:', error.message)
            return { success: false, message: error.message }
        }
        return { success: true, session: data.session }
    }

    const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        })

        if (error) {
            console.error('Registration error:', error.message)
            return { success: false, message: error.message }
        }

        if (data.session) {
            return { success: true, session: data.session }
        } else {
            // Email confirmation required
            return { success: true, session: null, message: 'Account created. Please check your email to confirm.' }
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
