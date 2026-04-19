import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Headphones, Star, ChevronRight, Flame, Clock, Lock, BadgeCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ProductCard from '@/components/shared/ProductCard'
import PageTransition from '@/components/shared/PageTransition'
import { HomePageSkeleton } from '@/components/skeletons'
import HeroSlider from '@/components/home/HeroSlider'
import { getProducts, getDiscountedProducts } from '@/services/supabaseProducts'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { useState, useEffect } from 'react'

export default function Home() {
    const [products, setProducts] = useState<Product[]>([])
    const [discountedProducts, setDiscountedProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const [allProducts, discounted] = await Promise.all([
                getProducts(),
                getDiscountedProducts()
            ])
            setProducts(allProducts)
            setDiscountedProducts(discounted)
            setLoading(false)
        }
        fetchData()
    }, [])

    const featuredProducts = products.filter(p => p.inStock).slice(0, 8)
    const deals = products.filter(p => p.originalPrice).slice(0, 4)
    const dynamicCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()

    return (
        <PageTransition loading={loading} skeleton={<HomePageSkeleton />}>
            <div>
                {/* ═══════════════════════════════════════════════
                    1 · HERO — Slider if discounts exist, else Static
                ═══════════════════════════════════════════════ */}
                {discountedProducts.length > 0 ? (
                    <HeroSlider products={discountedProducts} />
                ) : (
                    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-slate-100/60">
                        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Left copy */}
                                <div className="space-y-7 animate-fade-in-up">
                                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 gap-1.5 text-sm py-1 px-3 font-medium">
                                        <Flame className="size-3.5" /> New Season Arrivals
                                    </Badge>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                                        Smart Home
                                        <span className="block text-primary">Appliances</span>
                                        <span className="block text-muted-foreground text-2xl sm:text-3xl font-medium mt-3">
                                            Up to 40% Off This Season
                                        </span>
                                    </h1>
                                    <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                                        Premium brands at the best prices. Free delivery on orders over 1,500 TND, up to 2-year warranty, and hassle-free returns on every purchase.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-1">
                                        <Link to="/shop">
                                            <Button size="lg" className="gap-2.5 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_2px_8px_0_rgba(26,86,219,0.25)] hover:shadow-[0_4px_16px_0_rgba(26,86,219,0.3)] transition-all duration-200 active:scale-[0.98] h-12 px-7 text-[15px]">
                                                Browse All Products <ArrowRight className="size-4" />
                                            </Button>
                                        </Link>
                                        <Link to="/shop?sort=rating">
                                            <Button size="lg" variant="outline" className="gap-2 border-border text-foreground hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 h-12 px-6">
                                                <Star className="size-4 fill-amber-400 text-amber-400" /> Best Sellers
                                            </Button>
                                        </Link>
                                    </div>
                                    {/* Social proof stats */}
                                    <div className="flex gap-10 pt-4">
                                        {[
                                            { val: '10,000+', label: 'Happy Customers' },
                                            { val: '500+', label: 'Products' },
                                            { val: '4.8★', label: 'Avg. Rating' },
                                        ].map(s => (
                                            <div key={s.label}>
                                                <p className="text-2xl font-bold text-foreground tracking-tight">{s.val}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right — promo card (desktop only) */}
                                <div className="hidden lg:block animate-fade-in-up stagger-3">
                                    <div className="relative bg-white rounded-2xl border border-border/60 shadow-lg overflow-hidden">
                                        <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-900/85 text-white backdrop-blur-sm tracking-wide">
                                            LIMITED TIME
                                        </span>
                                        <img
                                            src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=400&fit=crop"
                                            alt="Featured appliance"
                                            className="w-full h-64 object-cover"
                                        />
                                        <div className="p-6 space-y-3">
                                            <h3 className="text-lg font-bold text-foreground">Samsung Smart Refrigerator</h3>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-2xl font-extrabold text-foreground tracking-tight">{formatPrice(7749.97)}</span>
                                                <span className="text-sm text-muted-foreground/50 line-through">{formatPrice(9299.97)}</span>
                                                <span className="text-xs font-medium text-emerald-600/80 bg-emerald-50/60 px-2 py-0.5 rounded-md">Save {formatPrice(1550)}</span>
                                            </div>
                                            <Link to="/product/1">
                                                <Button className="w-full mt-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_1px_3px_0_rgba(26,86,219,0.2)] hover:shadow-[0_2px_8px_0_rgba(26,86,219,0.25)] active:scale-[0.98] transition-all duration-200">
                                                    View Deal <ArrowRight className="size-4 ml-2" />
                                                </Button>
                                            </Link>
                                            {/* Mini trust signal */}
                                            <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1"><Truck className="size-3" /> Free Delivery</span>
                                                <span className="flex items-center gap-1"><Shield className="size-3" /> 2-Year Warranty</span>
                                                <span className="flex items-center gap-1"><Lock className="size-3" /> Secure Checkout</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══════════════════════════════════════════════
                    2 · CATEGORY QUICK CHIPS — horizontal scroll
                ═══════════════════════════════════════════════ */}
                <section className="bg-white border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            <Link to="/shop">
                                <Button variant="ghost" size="sm" className="shrink-0 text-sm hover:text-primary hover:bg-primary/5 gap-1.5 font-medium whitespace-nowrap">
                                    All Products
                                </Button>
                            </Link>
                            <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />
                            {dynamicCategories.map(catName => (
                                <Link key={catName} to={`/shop?category=${catName}`}>
                                    <Button variant="ghost" size="sm" className="shrink-0 text-sm hover:text-primary hover:bg-primary/5 gap-2 font-medium whitespace-nowrap">
                                        {catName}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    3 · TRUST SIGNALS — strong value props
                ═══════════════════════════════════════════════ */}
                <section className="bg-[#f8fafc] border-b border-border/50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-border/40">
                            {[
                                { icon: Truck, title: 'Free Delivery', desc: 'Orders over 1,500 TND ship free', color: 'text-primary bg-primary/8' },
                                { icon: ShieldCheck, title: '2-Year Warranty', desc: 'Full manufacturer coverage', color: 'text-emerald-600 bg-emerald-50' },
                                { icon: Headphones, title: '24/7 Expert Support', desc: 'Real people, real help', color: 'text-violet-600 bg-violet-50' },
                                { icon: BadgeCheck, title: 'Price Match Guarantee', desc: "We'll beat any competitor", color: 'text-primary bg-primary/8' },
                            ].map(item => (
                                <div key={item.title} className="flex items-center gap-3.5 py-6 px-5 lg:px-6 hover:bg-white/80 transition-colors duration-200 group cursor-default">
                                    <div className={`flex items-center justify-center size-10 rounded-xl shrink-0 ${item.color} group-hover:scale-105 transition-transform duration-300`}>
                                        <item.icon className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    4 · FLASH DEALS — premium urgency
                ═══════════════════════════════════════════════ */}
                {deals.length > 0 && (
                    <section className="py-16 sm:py-24 bg-white">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {/* Inner surface for visual grouping */}
                            <div className="rounded-2xl bg-gradient-to-b from-slate-50/50 to-transparent p-6 sm:p-8 -mx-2 sm:-mx-4">
                                <SectionHeader
                                    icon={<Clock className="size-5" />}
                                    iconColor="bg-amber-50 text-amber-600"
                                    title="Flash Deals"
                                    subtitle="Curated savings on select items — while stock lasts"
                                    href="/shop"
                                    linkLabel="View All Deals"
                                />
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                                    {deals.map((product, i) => (
                                        <ProductCard key={product.id} product={product} index={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══════════════════════════════════════════════
                    5 · SHOP BY CATEGORY — icon cards
                ═══════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 bg-[#f8fafc]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Shop by Category"
                            subtitle="Browse our curated collections"
                            href="/shop"
                            linkLabel="All Categories"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {dynamicCategories.map((catName, i) => (
                                <Link key={catName} to={`/shop?category=${catName}`}>
                                    <Card className={`product-card group py-0 border-border/40 bg-white overflow-hidden cursor-pointer shadow-sm animate-fade-in-up stagger-${i + 1}`}>
                                        <CardContent className="p-5 text-center space-y-3 flex flex-col items-center">
                                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{catName}</h3>
                                            <p className="text-[11px] text-muted-foreground">{products.filter(p => p.category === catName).length} products</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    6 · FEATURED PRODUCTS — clean grid
                ═══════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Inner surface for visual grouping */}
                        <div className="rounded-2xl bg-gradient-to-b from-slate-50/40 to-transparent p-6 sm:p-8 -mx-2 sm:-mx-4">
                            <SectionHeader
                                title="Featured Products"
                                subtitle="Handpicked by our team for quality and value"
                                href="/shop"
                                linkLabel="Shop All"
                            />
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                                {featuredProducts.map((product, i) => (
                                    <ProductCard key={product.id} product={product} index={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>



                {/* ═══════════════════════════════════════════════
                    8 · BOTTOM TRUST STRIP — reassurance before footer
                ═══════════════════════════════════════════════ */}
                <section className="bg-[#fafbfc] border-b border-border/40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Lock className="size-4 text-primary" />
                                <span><span className="font-medium text-foreground">Secure Payments</span> — SSL encrypted checkout</span>
                            </span>
                            <span className="hidden sm:block text-border">|</span>
                            <span className="flex items-center gap-2">
                                <Truck className="size-4 text-primary" />
                                <span><span className="font-medium text-foreground">Fast Delivery</span> — 2–5 business days</span>
                            </span>
                            <span className="hidden sm:block text-border">|</span>
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-primary" />
                                <span><span className="font-medium text-foreground">30-Day Returns</span> — no questions asked</span>
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </PageTransition>
    )
}

/* ──────────────────────────────────────────────
   Reusable section header with optional icon, badge & "View All" link
   ────────────────────────────────────────────── */
interface SectionHeaderProps {
    title: string
    subtitle: string
    icon?: React.ReactNode
    iconColor?: string
    badge?: React.ReactNode
    href?: string
    linkLabel?: string
}

function SectionHeader({ title, subtitle, icon, iconColor, badge, href, linkLabel }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-10 sm:mb-12">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className={`flex items-center justify-center size-10 rounded-xl ${iconColor ?? 'bg-muted text-muted-foreground'}`}>
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                        {title}
                        {badge}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                </div>
            </div>
            {href && (
                <Link to={href} className="hidden sm:block">
                    <Button variant="outline" size="sm" className="gap-1 hover:text-primary hover:border-primary/40 transition-colors active:scale-[0.98] duration-200">
                        {linkLabel ?? 'View All'} <ChevronRight className="size-4" />
                    </Button>
                </Link>
            )}
        </div>
    )
}
