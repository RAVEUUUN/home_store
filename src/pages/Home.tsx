import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Headphones, Star, ChevronRight, BadgeCheck, ShieldCheck } from 'lucide-react'
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
            <div className="bg-[#FAFAF8]">
                {/* ═══ 1. HERO ═══ */}
                {discountedProducts.length > 0 ? (
                    <HeroSlider products={discountedProducts} />
                ) : (
                    <section className="relative overflow-hidden border-b border-[#E7E5DF]">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
                            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                                <div className="space-y-8 animate-fade-in-up">
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/40 font-medium">
                                        New Season Collection — 2026
                                    </p>
                                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-[1.05]">
                                        Smart Home<br />
                                        <em className="italic font-normal text-foreground/50">Appliances</em>
                                    </h1>
                                    <p className="text-base text-foreground/50 max-w-md leading-relaxed">
                                        Premium brands at the best prices. Free delivery on orders over 1,500 TND, up to 2-year warranty, and hassle-free returns.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <Link to="/shop"
                                            className="inline-flex items-center gap-2.5 bg-[#1C1917] text-white px-8 py-4 text-sm font-semibold hover:bg-[#1C1917]/90 transition-colors">
                                            Explore Collection <ArrowRight className="size-4" />
                                        </Link>
                                        <Link to="/shop?sort=rating"
                                            className="inline-flex items-center gap-2.5 border border-[#E7E5DF] text-foreground px-8 py-4 text-sm font-medium hover:border-foreground/30 hover:bg-white transition-colors">
                                            <Star className="size-4 fill-[#B45309] text-[#B45309]" /> Best Sellers
                                        </Link>
                                    </div>
                                    <div className="flex gap-12 pt-2 border-t border-[#E7E5DF] pt-8">
                                        {[
                                            { val: '10,000+', label: 'Satisfied Clients' },
                                            { val: '500+', label: 'Products' },
                                            { val: '4.8', label: 'Average Rating' },
                                        ].map(s => (
                                            <div key={s.label}>
                                                <p className="text-2xl font-serif font-bold text-foreground">{s.val}</p>
                                                <p className="text-xs text-foreground/40 mt-0.5 uppercase tracking-wider">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden lg:block animate-fade-in-up stagger-3">
                                    <div className="relative bg-white border border-[#E7E5DF] overflow-hidden">
                                        <span className="absolute top-5 left-5 z-10 text-[10px] font-bold px-3 py-1.5 tracking-widest uppercase bg-[#1C1917] text-white">
                                            Limited Time
                                        </span>
                                        <img
                                            src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=400&fit=crop"
                                            alt="Featured appliance"
                                            className="w-full h-72 object-cover"
                                        />
                                        <div className="p-7 space-y-4">
                                            <h3 className="text-lg font-serif font-bold text-foreground">Samsung Smart Refrigerator</h3>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-2xl font-bold tracking-tight">{formatPrice(7749.97)}</span>
                                                <span className="text-sm text-foreground/30 line-through">{formatPrice(9299.97)}</span>
                                                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5">Save {formatPrice(1550)}</span>
                                            </div>
                                            <Link to="/product/1"
                                                className="inline-flex items-center gap-2 w-full justify-center border border-foreground/20 text-foreground py-3 text-sm font-medium hover:bg-foreground hover:text-[#FAFAF8] transition-colors">
                                                View Deal <ArrowRight className="size-4" />
                                            </Link>
                                            <div className="flex items-center justify-center gap-6 text-[11px] text-foreground/40 pt-1">
                                                <span className="flex items-center gap-1"><Truck className="size-3" /> Free Delivery</span>
                                                <span className="flex items-center gap-1"><Shield className="size-3" /> 2-Year Warranty</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══ 2. TRUST BAR ═══ */}
                <section className="border-b border-[#E7E5DF] bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E7E5DF]">
                            {[
                                { icon: Truck, title: 'Free Delivery', desc: 'Orders over 1,500 TND' },
                                { icon: ShieldCheck, title: '2-Year Warranty', desc: 'Full manufacturer coverage' },
                                { icon: Headphones, title: '24/7 Support', desc: 'Real experts, real help' },
                                { icon: BadgeCheck, title: 'Price Match', desc: "We'll beat any competitor" },
                            ].map(item => (
                                <div key={item.title} className="flex items-center gap-4 py-5 px-5 lg:px-7 group">
                                    <item.icon className="size-5 text-foreground/30 shrink-0 group-hover:text-foreground transition-colors duration-300" />
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-foreground">{item.title}</h4>
                                        <p className="text-xs text-foreground/40 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 3. FLASH DEALS ═══ */}
                {deals.length > 0 && (
                    <section className="py-20 sm:py-28 bg-[#FAFAF8]">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3 font-medium">Limited Time</p>
                                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Flash Deals</h2>
                                    <p className="text-sm text-foreground/50 mt-2">Curated savings on select items — while stock lasts</p>
                                </div>
                                <Link to="/shop"
                                    className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors">
                                    View All <ChevronRight className="size-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E7E5DF]">
                                {deals.map((product, i) => (
                                    <div key={product.id} className="bg-[#FAFAF8]">
                                        <ProductCard product={product} index={i} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══ 4. EDITORIAL BANNER ═══ */}
                <section className="bg-[#1C1917] text-white py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium">The HomeStore Difference</p>
                                <h2 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">
                                    Elevate your<br />
                                    <em className="italic font-normal text-white/60">living space</em>
                                </h2>
                                <p className="text-white/50 text-base leading-relaxed max-w-md">
                                    We believe that the kitchen is the heart of the home. Every appliance we carry is selected for its quality, performance, and design integrity.
                                </p>
                                <Link to="/shop"
                                    className="inline-flex items-center gap-2.5 border border-white/20 text-white px-7 py-3.5 text-sm font-medium hover:bg-white hover:text-[#1C1917] transition-colors">
                                    Discover the Collection <ArrowRight className="size-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-px bg-white/10">
                                {[
                                    { val: '10K+', label: 'Happy Families' },
                                    { val: '500+', label: 'Products Stocked' },
                                    { val: '98%', label: 'Satisfaction Rate' },
                                    { val: '5★', label: 'Expert Reviews' },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-[#1C1917] p-8">
                                        <p className="text-4xl font-serif font-bold text-white">{stat.val}</p>
                                        <p className="text-xs uppercase tracking-[0.2em] text-white/30 mt-2">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ 5. CATEGORIES ═══ */}
                <section className="py-20 sm:py-28 bg-[#FAFAF8]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3 font-medium">Explore</p>
                                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Browse by Category</h2>
                            </div>
                            <Link to="/shop"
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors">
                                All Products <ChevronRight className="size-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#E7E5DF]">
                            {dynamicCategories.map((catName, i) => (
                                <Link key={catName} to={`/shop?category=${catName}`}
                                    className={`group bg-white hover:bg-[#1C1917] transition-colors p-6 text-center animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">{catName}</h3>
                                    <p className="text-[11px] text-foreground/40 group-hover:text-white/50 mt-1.5 transition-colors">
                                        {products.filter(p => p.category === catName).length} products
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 6. FEATURED PRODUCTS ═══ */}
                <section className="py-20 sm:py-28 bg-white border-t border-[#E7E5DF]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-3 font-medium">Handpicked</p>
                                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Featured Products</h2>
                                <p className="text-sm text-foreground/50 mt-2">Curated for quality, value, and enduring design</p>
                            </div>
                            <Link to="/shop"
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors">
                                Shop All <ChevronRight className="size-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E7E5DF]">
                            {featuredProducts.map((product, i) => (
                                <div key={product.id} className="bg-white">
                                    <ProductCard product={product} index={i} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </PageTransition>
    )
}
