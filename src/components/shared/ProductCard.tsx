import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Eye, Heart, Check, AlertTriangle, XCircle, Flame, Sparkles, TrendingUp, Crown, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice, getEffectivePrice } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

/* ─────────────────────────────────────────────
   Badge system — derived from product data
   ───────────────────────────────────────────── */
type BadgeType = 'discount' | 'best-seller' | 'new-arrival' | 'limited-stock' | 'trending' | 'hot-deal' | 'exclusive'

interface ProductBadge {
    type: BadgeType
    label: string
    className: string
    icon?: React.ReactNode
    priority: number // lower = higher priority
}

const BADGE_STYLES: Record<BadgeType, { className: string; icon?: (props: { className?: string }) => React.ReactNode }> = {
    'discount': { className: 'bg-slate-900/85 text-white backdrop-blur-sm' },
    'hot-deal': { className: 'bg-amber-900/80 text-amber-50 backdrop-blur-sm', icon: (p) => <Flame {...p} /> },
    'best-seller': { className: 'bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm', icon: (p) => <Star {...p} /> },
    'new-arrival': { className: 'bg-primary/85 text-white backdrop-blur-sm', icon: (p) => <Sparkles {...p} /> },
    'trending': { className: 'bg-violet-600/80 text-white backdrop-blur-sm', icon: (p) => <TrendingUp {...p} /> },
    'exclusive': { className: 'bg-emerald-700/80 text-white backdrop-blur-sm', icon: (p) => <Crown {...p} /> },
    'limited-stock': { className: 'bg-amber-50/90 text-amber-700 backdrop-blur-sm shadow-sm', icon: (p) => <Clock {...p} /> },
}

function getProductBadges(product: Product, discount: number): ProductBadge[] {
    const badges: ProductBadge[] = []
    const id = parseInt(product.id)

    // Discount badge — always shown if applicable
    if (discount > 0) {
        badges.push({
            type: 'discount',
            label: `-${discount}%`,
            className: BADGE_STYLES['discount'].className,
            priority: 1,
        })
    }

    // Hot Deal — high discount
    if (discount >= 25) {
        const Icon = BADGE_STYLES['hot-deal'].icon!
        badges.push({
            type: 'hot-deal',
            label: 'Hot Deal',
            className: BADGE_STYLES['hot-deal'].className,
            icon: <Icon className="size-2.5" />,
            priority: 2,
        })
    }

    // Best Seller — high review count
    if (product.reviewCount >= 400 && product.rating >= 4.5) {
        const Icon = BADGE_STYLES['best-seller'].icon!
        badges.push({
            type: 'best-seller',
            label: 'Best Seller',
            className: BADGE_STYLES['best-seller'].className,
            icon: <Icon className="size-2.5 fill-amber-400 text-amber-400" />,
            priority: 3,
        })
    }

    // New Arrival — simulated from product id
    if (id >= 10) {
        const Icon = BADGE_STYLES['new-arrival'].icon!
        badges.push({
            type: 'new-arrival',
            label: 'New',
            className: BADGE_STYLES['new-arrival'].className,
            icon: <Icon className="size-2.5" />,
            priority: 4,
        })
    }

    // Trending — good rating with decent review volume
    if (product.rating >= 4.7 && product.reviewCount >= 150 && product.reviewCount < 400) {
        const Icon = BADGE_STYLES['trending'].icon!
        badges.push({
            type: 'trending',
            label: 'Trending',
            className: BADGE_STYLES['trending'].className,
            icon: <Icon className="size-2.5" />,
            priority: 5,
        })
    }

    // Exclusive — premium priced items without discounts
    if (product.price >= 2500 && !product.originalPrice) {
        const Icon = BADGE_STYLES['exclusive'].icon!
        badges.push({
            type: 'exclusive',
            label: 'Exclusive',
            className: BADGE_STYLES['exclusive'].className,
            icon: <Icon className="size-2.5" />,
            priority: 6,
        })
    }

    // Limited Stock — moderate discount (proxy for scarcity)
    if (discount > 15 && discount < 25 && product.inStock) {
        const Icon = BADGE_STYLES['limited-stock'].icon!
        badges.push({
            type: 'limited-stock',
            label: 'Limited',
            className: BADGE_STYLES['limited-stock'].className,
            icon: <Icon className="size-2.5" />,
            priority: 7,
        })
    }

    // Sort by priority and limit to 2 badges
    return badges.sort((a, b) => a.priority - b.priority).slice(0, 2)
}

/* ─────────────────────────────────────────────
   ProductCard — premium, conversion-optimized
   ───────────────────────────────────────────── */
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
    const { addItem } = useCart()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [imgLoaded, setImgLoaded] = useState(false)
    const [wishlisted, setWishlisted] = useState(false)
    const [quickView, setQuickView] = useState(false)

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    const effectivePrice = getEffectivePrice(product.price, product.discountPrice, product.isDiscounted)
    const hasDiscount = product.isDiscounted && product.discountPrice !== undefined && product.discountPrice < product.price

    const badges = getProductBadges(product, discount)

    const stockStatus = !product.inStock
        ? { label: 'Out of Stock', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle }
        : discount > 20
            ? { label: 'Low Stock', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle }
            : { label: 'In Stock', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: Check }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
            return
        }
        if (!product.inStock) return
        addItem(product)
        toast.success(`${product.name} added to cart`)
    }

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setWishlisted(prev => !prev)
        toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    }

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setQuickView(true)
    }

    return (
        <>
            <div className={`product-card group relative flex flex-col bg-white h-full animate-fade-in-up stagger-${Math.min(index % 8 + 1, 8)}`}>

                {/* ── Quick actions ── */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        className={`flex items-center justify-center size-8 bg-white shadow-sm transition-colors duration-200 border border-[#E7E5DF] ${wishlisted ? 'text-red-500' : 'text-foreground/30 hover:text-foreground'}`}
                        onClick={handleWishlist}
                    >
                        <Heart className={`size-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        className="flex items-center justify-center size-8 bg-white shadow-sm text-foreground/30 hover:text-foreground transition-colors border border-[#E7E5DF]"
                        onClick={handleQuickView}
                    >
                        <Eye className="size-3.5" />
                    </button>
                </div>

                {/* ── Image ── */}
                <Link to={`/product/${product.id}`} className="block overflow-hidden">
                    <div className="relative aspect-square overflow-hidden bg-[#F5F5F0]">
                        {!imgLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
                        <img
                            src={product.image}
                            alt={product.name}
                            onLoad={() => setImgLoaded(true)}
                            className={`object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />

                        {/* Badges */}
                        {badges.length > 0 && (
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                {badges.slice(0, 1).map(badge => (
                                    <span key={badge.type}
                                        className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 bg-[#1C1917] text-white">
                                        {badge.icon}{badge.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        {!product.inStock && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/50 bg-white px-4 py-2 border border-[#E7E5DF]">
                                    Sold Out
                                </span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* ── Content ── */}
                <div className="p-4 flex flex-col flex-1 border-t border-[#E7E5DF]">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-bold">{product.brand}</p>

                    <Link to={`/product/${product.id}`}>
                        <h3 className="text-sm font-medium text-foreground leading-snug mt-1.5 line-clamp-2 min-h-[2.5rem] hover:text-foreground/60 transition-colors">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`size-2.5 ${i < Math.floor(product.rating) ? 'fill-[#B45309] text-[#B45309]' : 'fill-foreground/10 text-foreground/10'}`} />
                        ))}
                        <span className="text-[10px] text-foreground/30 ml-1">{product.rating} ({product.reviewCount})</span>
                    </div>

                    <div className="flex-1" />

                    {/* Price */}
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-lg font-bold tracking-tight">{formatPrice(effectivePrice)}</span>
                        {(hasDiscount || product.originalPrice) && (
                            <span className="text-xs text-foreground/30 line-through">
                                {formatPrice(hasDiscount ? product.price : product.originalPrice!)}
                            </span>
                        )}
                        {!hasDiscount && discount > 0 && (
                            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <button
                        disabled={!product.inStock}
                        onClick={handleAddToCart}
                        className={`w-full mt-3 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                            product.inStock
                                ? 'bg-[#1C1917] text-white hover:bg-[#1C1917]/85'
                                : 'bg-[#F0EFE9] text-foreground/30 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingCart className="size-3.5" />
                        {product.inStock ? 'Add to Cart' : 'Sold Out'}
                    </button>
                </div>
            </div>

            {/* ── Quick View Dialog ── */}
            <Dialog open={quickView} onOpenChange={setQuickView}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">{product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid sm:grid-cols-2 gap-6 mt-2">
                        {/* Image */}
                        <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {/* Details */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-widest">{product.brand}</p>
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={`size-3.5 ${i < Math.floor(product.rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'fill-slate-100 text-slate-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">{product.rating}</span>
                                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                            </div>

                            <Separator />

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold text-foreground tracking-tight">{formatPrice(effectivePrice)}</span>
                                {(hasDiscount || product.originalPrice) && (
                                    <>
                                        <span className="text-sm text-muted-foreground/50 line-through">{formatPrice(hasDiscount ? product.price : product.originalPrice!)}</span>
                                        {hasDiscount ? (
                                            <span className="text-xs font-medium text-destructive/80 bg-destructive/10 px-2 py-0.5 rounded-md">
                                                Save {formatPrice(product.price - effectivePrice)}
                                            </span>
                                        ) : (
                                            product.originalPrice && discount > 0 && (
                                                <span className="text-xs font-medium text-emerald-600/80 bg-emerald-50/60 px-2 py-0.5 rounded-md">
                                                    -{discount}%
                                                </span>
                                            )
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Stock */}
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border w-fit ${stockStatus.color}`}>
                                <stockStatus.icon className="size-3.5" />
                                {stockStatus.label}
                            </span>

                            {/* Features */}
                            {product.features.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-foreground mb-1.5">Key Features</p>
                                    <ul className="grid grid-cols-1 gap-1">
                                        {product.features.slice(0, 4).map(f => (
                                            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Check className="size-3 text-emerald-500 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Dialog actions */}
                            <div className="flex gap-2 mt-auto pt-3">
                                <Button
                                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] transition-all duration-200"
                                    disabled={!product.inStock}
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="size-4" />
                                    Add to Cart
                                </Button>
                                <Link to={`/product/${product.id}`} className="contents">
                                    <Button variant="outline" className="gap-2 hover:text-primary hover:border-primary/40 transition-all duration-200">
                                        <Eye className="size-4" /> Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
