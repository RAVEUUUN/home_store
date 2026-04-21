import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: string } | null)?.from || '/'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const result = await login(email, password)
        setLoading(false)
        if (result.success) {
            toast.success('Welcome back!')
            navigate(from, { replace: true })
        } else {
            toast.error(result.message || 'Invalid email or password')
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
            <Card className="w-full max-w-md animate-fade-in-up shadow-lg">
                <CardHeader className="text-center space-y-4 pb-2">
                    <Link to="/" className="inline-flex items-center justify-center gap-2 mx-auto group">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white shadow-sm">
                            <Zap className="size-5" />
                        </div>
                    </Link>
                    <div>
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription className="mt-2">Sign in to your HomeStore account</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="bg-slate-50 focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="pr-10 bg-slate-50 focus:bg-white"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-0 size-9 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-semibold btn-pop shadow-sm" disabled={loading}>
                            {loading ? 'Signing in...' : <>Sign In <ArrowRight className="size-4" /></>}
                        </Button>
                    </form>

                    <Separator className="my-6" />

                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Create Account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
