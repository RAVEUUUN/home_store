import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    Menu, ShoppingCart, User, Search, LogOut, Settings,
    ChevronDown, Package, Heart, UserCircle, LogIn, UserPlus, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
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
    const [searchOpen, setSearchOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
            setSearchOpen(false)
        }
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* ─── Announcement Strip ─── */}
            <div className="bg-[#1C1917] text-white/70">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
                    <span className="hidden sm:inline text-[11px] tracking-widest uppercase font-medium text-white/40">
                        Free Delivery on Orders 1,500 TND+
                    </span>
                    <p className="text-[11px] text-center tracking-widest uppercase font-medium w-full sm:w-auto">
                        New Season — Premium Appliances Curated for You
                    </p>
                    <div className="hidden sm:flex items-center gap-6 text-[11px] text-white/40 tracking-wide">
                        <span>support@homestore.com</span>
                    </div>
                </div>
            </div>

            {/* ─── Main Navbar ─── */}
            <div className={`bg-[#FAFAF8]/96 backdrop-blur-lg border-b border-[#E7E5DF] transition-all duration-500 ${scrolled ? 'shadow-[0_1px_20px_rgba(28,25,23,0.08)]' : ''}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-[72px] gap-4 lg:gap-8">

                        {/* ── Mobile menu trigger ── */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <button className="lg:hidden shrink-0 -ml-1 p-2 text-foreground/70 hover:text-foreground transition-colors">
                                    <Menu className="size-5" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0 flex flex-col bg-[#FAFAF8] border-r border-[#E7E5DF]">
                                <SheetHeader className="p-6 pb-4 border-b border-[#E7E5DF]">
                                    <SheetTitle className="flex items-center gap-2 text-foreground text-left">
                                        <span className="font-serif font-bold text-xl tracking-tight">HomeStore</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex-1 overflow-y-auto py-4">
                                    {navLinks.map(link => (
                                        <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}
                                            className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive(link.path) ? 'text-foreground border-l-2 border-foreground bg-black/5' : 'text-foreground/60 hover:text-foreground hover:bg-black/5'}`}>
                                            {link.name}
                                        </Link>
                                    ))}
                                    <div className="px-6 pt-6 pb-2">
                                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-3">Categories</p>
                                        {navCategories.map(cat => (
                                            <Link key={cat} to={`/shop?category=${cat}`} onClick={() => setMobileMenuOpen(false)}
                                                className="block py-2.5 text-sm text-foreground/60 hover:text-foreground transition-colors">
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* ── Logo ── */}
                        <Link to="/" className="shrink-0 group">
                            <span className="font-serif font-bold text-xl tracking-tight text-foreground group-hover:opacity-75 transition-opacity">
                                Home<span className="font-light italic">Store</span>
                            </span>
                        </Link>

                        {/* ── Desktop Nav ── */}
                        <nav className="hidden lg:flex items-center gap-1 ml-4">
                            {navLinks.map(link => (
                                <Link key={link.path} to={link.path}
                                    className={`px-4 py-2 text-sm font-medium transition-colors rounded-sm ${isActive(link.path) ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'}`}>
                                    {link.name}
                                </Link>
                            ))}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors">
                                        Collections <ChevronDown className="size-3.5 mt-px" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 p-2 bg-[#FAFAF8] border-[#E7E5DF]">
                                    <DropdownMenuLabel className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] px-3 py-2">
                                        Shop by Category
                                    </DropdownMenuLabel>
                                    {navCategories.map(cat => (
                                        <DropdownMenuItem key={cat} onClick={() => navigate(`/shop?category=${cat}`)}
                                            className="px-3 py-2.5 text-sm text-foreground/70 hover:text-foreground cursor-pointer rounded-sm">
                                            {cat}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator className="bg-[#E7E5DF]" />
                                    <DropdownMenuItem onClick={() => navigate('/shop')}
                                        className="px-3 py-2.5 text-sm font-semibold cursor-pointer rounded-sm">
                                        View All →
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>

                        {/* ── Right Actions ── */}
                        <div className="flex items-center gap-1 ml-auto">

                            {/* Search */}
                            {searchOpen ? (
                                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search appliances..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 h-9 w-64 text-sm bg-[#F0EFE9] border border-[#E7E5DF] rounded-none focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30"
                                        />
                                    </div>
                                    <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-foreground/50 hover:text-foreground">
                                        <X className="size-4" />
                                    </button>
                                </form>
                            ) : (
                                <button onClick={() => setSearchOpen(true)} className="p-2.5 text-foreground/50 hover:text-foreground transition-colors">
                                    <Search className="size-[18px]" />
                                </button>
                            )}

                            {/* Wishlist */}
                            <button className="hidden sm:flex p-2.5 text-foreground/50 hover:text-foreground transition-colors">
                                <Heart className="size-[18px]" />
                            </button>

                            {/* Cart */}
                            <Link to="/cart" className="relative flex items-center gap-2.5 px-4 py-2 ml-1 bg-[#1C1917] text-[#FAFAF8] hover:bg-[#1C1917]/90 transition-colors group">
                                <div className="relative">
                                    <ShoppingCart className="size-[18px]" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex items-center justify-center size-4 text-[9px] font-bold bg-[#B45309] text-white rounded-full animate-scale-in">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-[10px] text-white/50 leading-none uppercase tracking-wider">Cart</p>
                                    <p className="text-xs font-semibold leading-snug">{formatPrice(total)}</p>
                                </div>
                            </Link>

                            {/* Account */}
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="hidden sm:flex items-center gap-2 ml-1 p-2 text-foreground/50 hover:text-foreground transition-colors">
                                            <div className="flex items-center justify-center size-7 rounded-full border border-[#E7E5DF] bg-[#F0EFE9] text-foreground/70 text-xs font-bold">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <ChevronDown className="size-3.5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 bg-[#FAFAF8] border-[#E7E5DF]">
                                        <div className="px-3 py-3 border-b border-[#E7E5DF]">
                                            <p className="text-sm font-semibold">{user?.name}</p>
                                            <p className="text-[11px] text-foreground/50 truncate">{user?.email}</p>
                                        </div>
                                        <DropdownMenuItem onClick={() => navigate('/')} className="gap-2.5 py-2.5 cursor-pointer">
                                            <UserCircle className="size-4 text-foreground/40" /> My Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/')} className="gap-2.5 py-2.5 cursor-pointer">
                                            <Package className="size-4 text-foreground/40" /> My Orders
                                        </DropdownMenuItem>
                                        {user?.role === 'admin' && (
                                            <>
                                                <DropdownMenuSeparator className="bg-[#E7E5DF]" />
                                                <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-2.5 py-2.5 cursor-pointer">
                                                    <Settings className="size-4 text-foreground/40" /> Admin Panel
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator className="bg-[#E7E5DF]" />
                                        <DropdownMenuItem onClick={logout} className="gap-2.5 py-2.5 text-destructive cursor-pointer">
                                            <LogOut className="size-4" /> Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="hidden sm:flex items-center gap-2 ml-1 p-2 text-foreground/50 hover:text-foreground transition-colors">
                                            <User className="size-[18px]" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-[#FAFAF8] border-[#E7E5DF]">
                                        <DropdownMenuItem onClick={() => navigate('/login')} className="gap-2.5 py-2.5 cursor-pointer">
                                            <LogIn className="size-4 text-foreground/40" />
                                            <div>
                                                <p className="font-medium text-sm">Sign In</p>
                                                <p className="text-[11px] text-foreground/50">Access your account</p>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-[#E7E5DF]" />
                                        <DropdownMenuItem onClick={() => navigate('/login')} className="gap-2.5 py-2.5 cursor-pointer">
                                            <UserPlus className="size-4 text-foreground/40" />
                                            <div>
                                                <p className="font-medium text-sm">Register</p>
                                                <p className="text-[11px] text-foreground/50">Create account</p>
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
