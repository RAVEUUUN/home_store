import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Headphones, Star, ChevronRight, Clock, Lock, BadgeCheck, ShieldCheck } from 'lucide-react'
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
                    1 · HERO — database-driven discount slider only
                ═══════════════════════════════════════════════ */}
                {discountedProducts.length > 0 && <HeroSlider products={discountedProducts} />}

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
