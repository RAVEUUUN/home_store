import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Lock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { CartSkeleton } from '@/components/skeletons'
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading'
import ProductCard from '@/components/shared/ProductCard'

export default function Cart() {
    const { items, total, itemCount, updateQuantity, removeItem } = useCart()
    const loading = useSimulatedLoading(400)

    if (loading) {
        return <CartSkeleton />
    }

    // "You may also like" — no longer shows (products are dynamic, fetched from DB)
    const crossSellProducts: typeof items[0]['product'][] = []

    if (items.length === 0) {
        return (
            <div className="bg-[#f8fafc] min-h-[60vh] flex items-center justify-center">
                <div className="text-center px-4 animate-fade-in-up">
                    <div className="flex items-center justify-center size-20 rounded-2xl bg-white border border-border/40 shadow-sm mx-auto mb-6">
                        <ShoppingBag className="size-10 text-muted-foreground/40" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                        Discover our curated collection of premium home appliances.
                    </p>
                    <Link to="/shop">
                        <Button className="gap-2 mt-6 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_2px_8px_0_rgba(26,86,219,0.25)] hover:shadow-[0_4px_16px_0_rgba(26,86,219,0.3)] active:scale-[0.98] transition-all duration-200 h-11 px-6">
                            <ShoppingBag className="size-4" /> Start Shopping
                        </Button>
                    </Link>

                    {/* Cross-sell even on empty cart */}
                    {crossSellProducts.length > 0 && (
                        <div className="mt-16 max-w-5xl mx-auto text-left">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-foreground">Popular Products</h2>
                                <Link to="/shop">
                                    <Button variant="outline" size="sm" className="gap-1 hover:text-primary hover:border-primary/40 active:scale-[0.98] transition-all duration-200">
                                        View All <ChevronRight className="size-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                {crossSellProducts.map((p, i) => (
                                    <ProductCard key={p.id} product={p} index={i} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const shipping = total >= 1500 ? 0 : 150
    const tax = total * 0.08
    const grandTotal = total + shipping + tax
    const freeShippingProgress = Math.min(total / 1500, 1)

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            {/* ── Page header ── */}
            <div className="bg-white border-b border-border/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Shopping Cart</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Cart items ── */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map((item, i) => (
                            <Card
                                key={item.product.id}
                                className={`py-0 border-border/40 bg-white overflow-hidden transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                            >
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex gap-5">
                                        {/* Product image */}
                                        <Link to={`/product/${item.product.id}`} className="shrink-0 group">
                                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/80">
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                />
                                            </div>
                                        </Link>

                                        {/* Product details */}
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">{item.product.brand}</p>
                                                    <Link to={`/product/${item.product.id}`}>
                                                        <h3 className="font-medium text-sm text-foreground hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">{item.product.name}</h3>
                                                    </Link>
                                                </div>
                                                {/* Remove button */}
                                                <button
                                                    className="flex items-center justify-center size-8 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-all duration-200 shrink-0"
                                                    onClick={() => removeItem(item.product.id)}
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>

                                            {/* Price per unit */}
                                            <p className="text-xs text-muted-foreground/50 mt-1">
                                                {formatPrice(item.product.price)} each
                                                {item.product.originalPrice && (
                                                    <span className="line-through ml-1.5">{formatPrice(item.product.originalPrice)}</span>
                                                )}
                                            </p>

                                            {/* Spacer */}
                                            <div className="flex-1" />

                                            {/* Quantity + line total */}
                                            <div className="flex items-center justify-between mt-3">
                                                {/* Quantity stepper */}
                                                <div className="flex items-center border border-border/50 rounded-lg overflow-hidden bg-white shadow-sm">
                                                    <button
                                                        className="flex items-center justify-center size-8 text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="size-3" />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-semibold tabular-nums select-none border-x border-border/50">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="flex items-center justify-center size-8 text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors duration-150"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="size-3" />
                                                    </button>
                                                </div>

                                                {/* Line total */}
                                                <span className="font-bold text-lg text-foreground tracking-tight tabular-nums">
                                                    {formatPrice(item.product.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ── Order Summary ── */}
                    <div>
                        <Card className="sticky top-40 border-border/40 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                                        <span className="font-medium tabular-nums">{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded-md">Free</span>
                                        ) : (
                                            <span className="font-medium tabular-nums">{formatPrice(shipping)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Estimated Tax</span>
                                        <span className="font-medium tabular-nums">{formatPrice(tax)}</span>
                                    </div>
                                </div>

                                <Separator className="bg-border/40" />

                                {/* Grand total */}
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-base">Total</span>
                                    <span className="font-bold text-2xl text-foreground tracking-tight tabular-nums">{formatPrice(grandTotal)}</span>
                                </div>

                                {/* Free shipping progress nudge */}
                                {shipping > 0 && (
                                    <div className="rounded-xl bg-[#f8fafc] border border-border/30 p-4 space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <Truck className="size-4 text-primary shrink-0" />
                                            <p className="text-xs text-muted-foreground">
                                                Add <span className="font-bold text-foreground">{formatPrice(1500 - total)}</span> for free shipping
                                            </p>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/70 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${freeShippingProgress * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Free shipping achieved */}
                                {shipping === 0 && (
                                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60 p-3">
                                        <Truck className="size-4 text-emerald-600 shrink-0" />
                                        <p className="text-xs text-emerald-700 font-medium">You've unlocked free shipping!</p>
                                    </div>
                                )}

                                {/* Primary CTA */}
                                <Link to="/checkout" className="block">
                                    <Button
                                        className="w-full gap-2.5 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_2px_8px_0_rgba(26,86,219,0.25)] hover:shadow-[0_4px_16px_0_rgba(26,86,219,0.3)] active:scale-[0.98] transition-all duration-200 h-12 text-[15px]"
                                        size="lg"
                                    >
                                        Proceed to Checkout <ArrowRight className="size-4" />
                                    </Button>
                                </Link>

                                {/* Secondary CTA */}
                                <Link to="/shop" className="block">
                                    <Button variant="outline" className="w-full active:scale-[0.98] transition-all duration-200 hover:border-primary/30 hover:text-primary" size="lg">
                                        Continue Shopping
                                    </Button>
                                </Link>

                                {/* Trust signals */}
                                <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><Lock className="size-3" /> SSL Encrypted</span>
                                    <span className="text-border">·</span>
                                    <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> Secure Checkout</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Cross-sell: "You may also like" ── */}
                {crossSellProducts.length > 0 && (
                    <div className="mt-16 sm:mt-20">
                        <Separator className="bg-border/30 mb-12 sm:mb-16" />
                        <div className="flex items-center justify-between mb-8 sm:mb-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">You May Also Like</h2>
                                <p className="text-sm text-muted-foreground mt-1">Handpicked based on your cart</p>
                            </div>
                            <Link to="/shop" className="hidden sm:block">
                                <Button variant="outline" size="sm" className="gap-1 hover:text-primary hover:border-primary/40 active:scale-[0.98] transition-all duration-200">
                                    Browse More <ChevronRight className="size-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                            {crossSellProducts.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
