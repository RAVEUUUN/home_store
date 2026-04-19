import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    Menu, ShoppingCart, User, Search, LogOut, Settings,
    ChevronDown, Zap, Package, Heart, UserCircle, LogIn, UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { getProducts } from '@/services/supabaseProducts'
import { formatPrice } from '@/lib/utils'

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
]

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { itemCount, total } = useCart()
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [navCategories, setNavCategories] = useState<string[]>([])

    useEffect(() => {
        getProducts().then(data => {
            const cats = Array.from(new Set(data.map(p => p.category).filter(Boolean))).sort()
            setNavCategories(cats as string[])
        })
    }, [])

    // Track scroll for visual distinction
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
            setMobileSearchOpen(false)
        }
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* ─── Top announcement bar ─── */}
            <div className="bg-slate-900 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9 text-xs">
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-slate-400">📞 (555) 123-4567</span>
                        <span className="hidden md:inline text-slate-400">✉️ support@homestore.com</span>
                    </div>
                    <span className="font-medium text-slate-200">
                        Free shipping on orders 1,500 TND+
                    </span>
                </div>
            </div>

            {/* ─── Main navbar ─── */}
            <div className={`bg-white/95 backdrop-blur-md border-b transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-[4.25rem] gap-3 lg:gap-6">

                        {/* ── Mobile menu ── */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-2">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0 flex flex-col">
                                <SheetHeader className="p-5 pb-4 border-b bg-slate-900 text-white">
                                    <SheetTitle className="flex items-center gap-2.5 text-white">
                                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
                                            <Zap className="size-4" />
                                        </div>
                                        HomeStore
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex-1 overflow-y-auto py-2">
                                    {navLinks.map(link => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'hover:bg-muted'}`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <Separator className="my-2" />
                                    <p className="px-6 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Categories
                                    </p>
                                    {navCategories.map(catName => (
                                        <Link
                                            key={catName}
                                            to={`/shop?category=${catName}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-muted transition-colors"
                                        >
                                            <span className="flex-1">{catName}</span>
                                        </Link>
                                    ))}
                                    <Separator className="my-2" />
                                    {/* Mobile account links */}
                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-6 py-3 flex items-center gap-3">
                                                <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                    {user?.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{user?.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                                                </div>
                                            </div>
                                            {user?.role === 'admin' && (
                                                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-muted transition-colors">
                                                    <Settings className="size-4 text-muted-foreground" /> Admin Panel
                                                </Link>
                                            )}
                                            <button onClick={() => { logout(); setMobileMenuOpen(false) }}
                                                className="flex items-center gap-3 px-6 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-left">
                                                <LogOut className="size-4" /> Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-muted transition-colors">
                                            <LogIn className="size-4 text-muted-foreground" /> Sign In / Register
                                        </Link>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* ── Logo ── */}
                        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                            <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-white shadow-sm transition-shadow">
                                <Zap className="size-5" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="font-bold text-lg text-foreground tracking-tight">Home</span>
                                <span className="font-bold text-lg text-primary tracking-tight">Store</span>

                            </div>
                        </Link>

                        {/* ── Desktop navigation ── */}
                        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
                            {navLinks.map(link => (
                                <Link key={link.path} to={link.path}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-sm font-medium transition-colors ${isActive(link.path)
                                            ? 'text-primary bg-primary/5'
                                            : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {link.name}
                                    </Button>
                                </Link>
                            ))}

                            {/* Category mega-menu dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 gap-1">
                                        Categories <ChevronDown className="size-3.5 transition-transform" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[420px] p-4">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider pb-2">
                                        Shop by Category
                                    </DropdownMenuLabel>
                                    <div className="grid grid-cols-2 gap-1">
                                        {navCategories.map(catName => (
                                            <DropdownMenuItem
                                                key={catName}
                                                onClick={() => navigate(`/shop?category=${catName}`)}
                                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{catName}</p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                    <Separator className="my-2" />
                                    <DropdownMenuItem
                                        onClick={() => navigate('/shop')}
                                        className="justify-center text-sm font-medium text-primary hover:!text-primary cursor-pointer"
                                    >
                                        View All Products →
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>

                        {/* ── Desktop search ── */}
                        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-4 lg:mx-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search appliances, brands..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 h-10 bg-slate-50/80 border-slate-200 focus:bg-white focus:border-primary/40 focus:ring-primary/10 transition-all rounded-lg"
                                />
                            </div>
                        </form>

                        {/* ── Right actions ── */}
                        <div className="flex items-center gap-1 ml-auto">

                            {/* Mobile search button → Sheet */}
                            <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                                        <Search className="size-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="top" className="h-auto">
                                    <SheetHeader>
                                        <SheetTitle className="text-left">Search Products</SheetTitle>
                                    </SheetHeader>
                                    <form onSubmit={handleSearch} className="mt-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                placeholder="Search appliances, brands..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="pl-10 pr-4 h-12 text-base bg-slate-50"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button type="submit" className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white btn-pop">
                                                <Search className="size-4" /> Search
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setMobileSearchOpen(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </SheetContent>
                            </Sheet>

                            {/* Wishlist (desktop) */}
                            <Button variant="ghost" size="icon" className="hidden lg:inline-flex text-foreground/70 hover:text-primary hover:bg-primary/5">
                                <Heart className="size-5" />
                            </Button>

                            {/* Cart */}
                            <Link to="/cart">
                                <Button variant="ghost" size="sm" className="relative gap-2 hover:text-primary hover:bg-primary/5 btn-pop h-10 px-2.5 lg:px-3">
                                    <div className="relative">
                                        <ShoppingCart className="size-5" />
                                        {itemCount > 0 && (
                                            <Badge className="absolute -top-2 -right-2.5 size-[18px] flex items-center justify-center p-0 text-[10px] font-bold bg-primary hover:bg-primary text-white border-0 animate-scale-in">
                                                {itemCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-[10px] text-muted-foreground leading-none">Cart</p>
                                        <p className="text-xs font-bold leading-tight">{formatPrice(total)}</p>
                                    </div>
                                </Button>
                            </Link>

                            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

                            {/* Account */}
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-2 hover:text-primary hover:bg-primary/5 h-10">
                                            <div className="flex items-center justify-center size-7 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold ring-2 ring-primary/10">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden lg:block text-left">
                                                <p className="text-[10px] text-muted-foreground leading-none">Account</p>
                                                <p className="text-xs font-semibold leading-tight">{user?.name.split(' ')[0]}</p>
                                            </div>
                                            <ChevronDown className="size-3.5 hidden lg:block text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        {/* User info header */}
                                        <div className="px-3 py-3 flex items-center gap-3">
                                            <div className="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{user?.name}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/')} className="gap-2.5 py-2">
                                            <UserCircle className="size-4 text-muted-foreground" /> My Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/')} className="gap-2.5 py-2">
                                            <Package className="size-4 text-muted-foreground" /> My Orders
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/')} className="gap-2.5 py-2">
                                            <Heart className="size-4 text-muted-foreground" /> Wishlist
                                        </DropdownMenuItem>
                                        {user?.role === 'admin' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-2.5 py-2">
                                                    <Settings className="size-4 text-muted-foreground" /> Admin Panel
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logout} className="gap-2.5 py-2 text-destructive focus:text-destructive">
                                            <LogOut className="size-4" /> Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-2 hover:text-primary hover:bg-primary/5 h-10">
                                            <div className="flex items-center justify-center size-7 rounded-full bg-slate-100 text-muted-foreground">
                                                <User className="size-4" />
                                            </div>
                                            <span className="hidden lg:inline text-sm font-medium">Account</span>
                                            <ChevronDown className="size-3.5 hidden lg:block text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Welcome!</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigate('/login')} className="gap-2.5 py-2.5">
                                            <LogIn className="size-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Sign In</p>
                                                <p className="text-[11px] text-muted-foreground">Access your account</p>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/login')} className="gap-2.5 py-2.5">
                                            <UserPlus className="size-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Register</p>
                                                <p className="text-[11px] text-muted-foreground">Create a new account</p>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
