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
            <Card
                className={`product-card group relative flex flex-col overflow-hidden py-0 gap-0 border border-border/40 bg-white h-full animate-fade-in-up stagger-${Math.min(index % 8 + 1, 8)}`}
            >
                {/* ── Quick action buttons ── */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                    <button
                        className={`flex items-center justify-center size-8 rounded-full shadow-sm backdrop-blur-md transition-all duration-200 ${wishlisted
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-red-100/50'
                            : 'bg-white/95 text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-md'
                            }`}
                        onClick={handleWishlist}
                    >
                        <Heart className={`size-3.5 transition-transform duration-200 hover:scale-110 ${wishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        className="flex items-center justify-center size-8 rounded-full shadow-sm bg-white/95 backdrop-blur-md text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-md transition-all duration-200"
                        onClick={handleQuickView}
                    >
                        <Eye className="size-3.5" />
                    </button>
                </div>

                {/* ── Image — dominant visual focus ── */}
                <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100/80">
                        {/* Skeleton placeholder */}
                        {!imgLoaded && (
                            <Skeleton className="absolute inset-0 rounded-none" />
                        )}
                        <img
                            src={product.image}
                            alt={product.name}
                            onLoad={() => setImgLoaded(true)}
                            className={`object-cover w-full h-full transition-transform duration-700 ease-out will-change-transform group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />

                        {/* Subtle bottom gradient for depth */}
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/[0.03] to-transparent pointer-events-none" />

                        {/* Badges — top-left, max 2, premium & minimal */}
                        {badges.length > 0 && (
                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                                {badges.map(badge => (
                                    <span
                                        key={badge.type}
                                        className={`inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-[3px] rounded-md ${badge.className}`}
                                    >
                                        {badge.icon}
                                        {badge.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Out of stock overlay */}
                        {!product.inStock && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] flex items-center justify-center">
                                <span className="text-slate-600 font-medium text-xs tracking-wide uppercase bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                    Sold Out
                                </span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* ── Content — flex-grow so card bottoms align ── */}
                <CardContent className="p-4 pt-3.5 flex flex-col flex-1 gap-0">
                    {/* Brand — subtle, secondary info */}
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-widest">{product.brand}</p>
                        <p className="text-[9px] text-muted-foreground/50 font-mono">{product.productCode}</p>
                    </div>

                    {/* Title — clear, balanced, always 2-line height */}
                    <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium text-[13px] leading-[1.4] mt-1.5 text-foreground hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Rating — visually subtle, informational */}
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                    key={i}
                                    className={`size-3 ${i < Math.floor(product.rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-slate-100 text-slate-100'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-[11px] text-muted-foreground/60 tabular-nums">{product.rating}</span>
                        <span className="text-[11px] text-muted-foreground/50">·</span>
                        <span className="text-[11px] text-muted-foreground/60">{product.reviewCount}</span>
                    </div>

                    {/* Spacer to push price + CTA to bottom */}
                    <div className="flex-1" />

                    {/* ── Price block — strongest visual emphasis ── */}
                    <div className="mt-4 pt-3.5 border-t border-border/30">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-xl tracking-tight text-foreground">
                                {formatPrice(effectivePrice)}
                            </span>

                            {(hasDiscount || product.originalPrice) && (
                                <span className="text-xs text-muted-foreground/50 line-through font-normal">
                                    {formatPrice(hasDiscount ? product.price : product.originalPrice!)}
                                </span>
                            )}

                            {hasDiscount && (
                                <span className="ml-auto text-[10px] font-medium text-destructive/80 bg-destructive/10 px-1.5 py-0.5 rounded">
                                    Save {formatPrice(product.price - effectivePrice)}
                                </span>
                            )}

                            {!hasDiscount && discount > 0 && (
                                <span className="ml-auto text-[10px] font-medium text-emerald-600/80 bg-emerald-50/60 px-1.5 py-0.5 rounded">
                                    -{discount}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Out of stock indicator */}
                    {!product.inStock && (
                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                                <stockStatus.icon className="size-2.5" />
                                Unavailable
                            </span>
                        </div>
                    )}

                    {/* ── CTA — clean, confident, always visible ── */}
                    <Button
                        size="sm"
                        className={`w-full gap-2 text-xs font-medium mt-3 transition-all duration-200 rounded-lg ${product.inStock
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_1px_3px_0_rgba(26,86,219,0.2)] hover:shadow-[0_2px_8px_0_rgba(26,86,219,0.25)] active:scale-[0.98]'
                            : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                            }`}
                        disabled={!product.inStock}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="size-3.5" />
                        {product.inStock ? 'Add to Cart' : 'Sold Out'}
                    </Button>
                </CardContent>
            </Card>

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
