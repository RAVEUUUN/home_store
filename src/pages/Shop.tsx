import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, PackageSearch, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import ProductCard from '@/components/shared/ProductCard'
import PageTransition from '@/components/shared/PageTransition'
import { ShopPageSkeleton } from '@/components/skeletons'

import { getProducts } from '@/services/supabaseProducts'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

type SortKey = 'featured' | 'newest' | 'popular' | 'price-asc' | 'price-desc'

const ITEMS_PER_PAGE = 12
const PRICE_MIN = 0
const PRICE_MAX = 8000

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialCategory = searchParams.get('category') || ''
    const initialSearch = searchParams.get('search') || ''

    // Filter state
    const [search, setSearch] = useState(initialSearch)
    const [selectedCategory, setSelectedCategory] = useState(initialCategory)
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX])
    const [inStockOnly, setInStockOnly] = useState(false)
    const [minRating, setMinRating] = useState(0)
    const [sortBy, setSortBy] = useState<SortKey>('featured')
    const [currentPage, setCurrentPage] = useState(1)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Derive categories and brands dynamically from real products
    const dynamicCategories = useMemo(() =>
        Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()
    , [products])

    const dynamicBrands = useMemo(() =>
        Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort()
    , [products])

    // Fetch products
    useEffect(() => {
        getProducts().then(data => {
            setProducts(data)
            setLoading(false)
        })
    }, [])

    // Sync state with URL params
    useEffect(() => {
        const cat = searchParams.get('category') || ''
        const q = searchParams.get('search') || ''
        if (cat !== selectedCategory) {
            setSelectedCategory(cat)
            setCurrentPage(1)
        }
        if (q !== search) {
            setSearch(q)
            setCurrentPage(1)
        }
    }, [searchParams])

    // Filtered + sorted products
    const filtered = useMemo(() => {
        let result = [...products]

        // Search
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            )
        }

        // Category
        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(p => p.category === selectedCategory)
        }

        // Brand (Single or Multi)
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brand))
        }

        // Price
        if (priceRange[0] > PRICE_MIN) {
            result = result.filter(p => p.price >= priceRange[0])
        }
        if (priceRange[1] < PRICE_MAX) {
            result = result.filter(p => p.price <= priceRange[1])
        }

        // Rating
        if (minRating > 0) {
            result = result.filter(p => p.rating >= minRating)
        }

        // Availability
        if (inStockOnly) {
            result = result.filter(p => p.inStock)
        }

        // Sort
        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break
            case 'price-desc': result.sort((a, b) => b.price - a.price); break
            case 'popular': result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break // Proxy rating count as popularity
            case 'newest':
                // Assuming newer items are at the top of the fetched list (order by created_at desc)
                // If sort modifies result in place, we rely on the initial order for 'newest' if we don't shuffle.
                // But getting from DB order by created_at desc means index 0 is newest.
                break
            default: break
        }

        return result
    }, [products, search, selectedCategory, selectedBrands, priceRange, inStockOnly, minRating, sortBy])

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginatedProducts = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Active filter count
    const activeFilterCount = [
        selectedCategory,
        selectedBrands.length > 0,
        priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX,
        inStockOnly,
        minRating > 0,
    ].filter(Boolean).length

    // Handlers
    const toggleBrand = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        )
        setCurrentPage(1)
    }

    const setCategory = (cat: string) => {
        setSelectedCategory(cat)
        setCurrentPage(1)
        if (cat) {
            setSearchParams(prev => { prev.set('category', cat); return prev })
        } else {
            setSearchParams(prev => { prev.delete('category'); return prev })
        }
    }

    const clearFilters = () => {
        setSelectedCategory('')
        setSelectedBrands([])
        setPriceRange([PRICE_MIN, PRICE_MAX])
        setInStockOnly(false)
        setMinRating(0)
        setSearch('')
        setCurrentPage(1)
        setSearchParams({})
    }

    // Remove simulated loading, use real state
    // const loading = useSimulatedLoading(500, selectedCategory)

    /* ────────────────────────────────────────────
       FilterPanel — shared between desktop & mobile
       ──────────────────────────────────────────── */
    const FilterPanelContent = (
        <div className="space-y-6">
            {/* Search (sidebar only) */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                    className="pl-10 h-9 text-sm bg-slate-50"
                />
            </div>

            <Separator />

            {/* Categories */}
            <div>
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" /> Category
                </h3>
                <div className="space-y-0.5">
                    <button
                        onClick={() => setCategory('')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${!selectedCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                        All Categories
                        <Badge variant="outline" className={`ml-auto float-right text-[10px] ${!selectedCategory ? 'border-white/30 text-white/80' : ''}`}>{products.length}</Badge>
                    </button>
                    {dynamicCategories.map(catName => {
                        const count = products.filter(p => p.category === catName).length
                        return (
                            <button
                                key={catName}
                                onClick={() => setCategory(catName)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${selectedCategory === catName ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                            >
                                {catName}
                                <Badge variant="outline" className={`ml-auto float-right text-[10px] ${selectedCategory === catName ? 'border-white/30 text-white/80' : ''}`}>{count}</Badge>
                            </button>
                        )
                    })}
                </div>
            </div>

            <Separator />

            {/* Brands (checkboxes) */}
            <div>
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" /> Brand
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {dynamicBrands.map(brand => (
                        <label
                            key={brand}
                            className="flex items-center gap-2.5 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Checkbox
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={() => toggleBrand(brand)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            {brand}
                        </label>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div>
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" /> Price Range
                </h3>
                <div className="px-1">
                    <Slider
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={50}
                        value={priceRange}
                        onValueChange={(val) => { setPriceRange(val as [number, number]); setCurrentPage(1) }}
                        className="mb-3"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{formatPrice(priceRange[0])}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="font-medium text-foreground">{formatPrice(priceRange[1])}</span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Rating */}
            <div>
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" /> Minimum Rating
                </h3>
                <div className="space-y-1">
                    {[4, 3, 2, 1, 0].map(rating => (
                        <button
                            key={rating}
                            onClick={() => { setMinRating(rating); setCurrentPage(1) }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${minRating === rating ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                        >
                            {rating > 0 ? (
                                <>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} className={`size-3 ${i < rating ? 'fill-amber-400 text-amber-400' : minRating === rating ? 'fill-white/30 text-white/30' : 'fill-slate-200 text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span>& up</span>
                                </>
                            ) : (
                                <span>All ratings</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Availability */}
            <div>
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" /> Availability
                </h3>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Checkbox
                        checked={inStockOnly}
                        onCheckedChange={(v) => { setInStockOnly(!!v); setCurrentPage(1) }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    In stock only
                </label>
            </div>

            {/* Clear all */}
            {activeFilterCount > 0 && (
                <>
                    <Separator />
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={clearFilters}>
                        <X className="size-3.5" /> Clear All Filters
                    </Button>
                </>
            )}
        </div>
    )

    return (
        <PageTransition loading={loading} skeleton={<ShopPageSkeleton />}>
            <div className="bg-slate-50 min-h-screen">
                {/* ── Page header ── */}
                <div className="bg-white border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                                    {selectedCategory || 'All Products'}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1.5">
                                    {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                                    {search && <> for "<span className="font-medium text-foreground">{search}</span>"</>}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Sort */}
                                <Select value={sortBy} onValueChange={v => { setSortBy(v as SortKey); setCurrentPage(1) }}>
                                    <SelectTrigger className="w-48 h-9 text-sm bg-white">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">Featured</SelectItem>
                                        <SelectItem value="newest">Newest</SelectItem>
                                        <SelectItem value="popular">Most Popular</SelectItem>
                                        <SelectItem value="price-asc">Price: Low → High</SelectItem>
                                        <SelectItem value="price-desc">Price: High → Low</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Mobile filter trigger */}
                                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="lg:hidden gap-2 btn-pop">
                                            <SlidersHorizontal className="size-4" /> Filters
                                            {activeFilterCount > 0 && (
                                                <Badge className="size-5 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-0">
                                                    {activeFilterCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-80 overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle className="flex items-center gap-2">
                                                <SlidersHorizontal className="size-4" /> Filters
                                                {activeFilterCount > 0 && (
                                                    <Badge className="bg-primary text-white border-0 text-[10px]">{activeFilterCount}</Badge>
                                                )}
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6">
                                            {FilterPanelContent}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-8">
                        {/* ── Desktop sidebar ── */}
                        <aside className="hidden lg:block w-64 shrink-0">
                            <Card className="sticky top-40">
                                <CardContent className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                    {FilterPanelContent}
                                </CardContent>
                            </Card>
                        </aside>

                        {/* ── Main content ── */}
                        <div className="flex-1 min-w-0">
                            {/* Active filter chips */}
                            {activeFilterCount > 0 && (
                                <div className="flex items-center gap-2 mb-6 flex-wrap">
                                    <span className="text-xs text-muted-foreground font-medium">Active:</span>
                                    {selectedCategory && (
                                        <FilterChip label={selectedCategory} onRemove={() => setCategory('')} />
                                    )}
                                    {selectedBrands.map(b => (
                                        <FilterChip key={b} label={b} onRemove={() => toggleBrand(b)} />
                                    ))}
                                    {(priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) && (
                                        <FilterChip
                                            label={`${formatPrice(priceRange[0])} – ${formatPrice(priceRange[1])}`}
                                            onRemove={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                                        />
                                    )}
                                    {inStockOnly && (
                                        <FilterChip label="In stock only" onRemove={() => setInStockOnly(false)} />
                                    )}
                                    {minRating > 0 && (
                                        <FilterChip label={`${minRating}★ & up`} onRemove={() => setMinRating(0)} />
                                    )}
                                    <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Products or empty state */}
                            {filtered.length === 0 ? (
                                <Card className="py-16 text-center border-dashed">
                                    <CardContent className="flex flex-col items-center gap-4">
                                        <div className="flex items-center justify-center size-16 rounded-full bg-slate-100">
                                            <PackageSearch className="size-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-foreground">No products found</p>
                                            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                                We couldn't find any products matching your filters. Try adjusting your criteria or clear all filters.
                                            </p>
                                        </div>
                                        <Button variant="outline" className="mt-2 gap-2 btn-pop" onClick={clearFilters}>
                                            <X className="size-4" /> Reset All Filters
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Product grid — 2 col mobile, 3 col desktop */}
                                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                                        {paginatedProducts.map((product, i) => (
                                            <ProductCard key={product.id} product={product} index={i} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-10">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-9 btn-pop"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                            >
                                                <ChevronLeft className="size-4" />
                                            </Button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <Button
                                                    key={page}
                                                    variant={page === currentPage ? 'default' : 'outline'}
                                                    size="sm"
                                                    className={`size-9 p-0 text-sm btn-pop ${page === currentPage ? 'bg-primary text-primary-foreground' : ''}`}
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-9 btn-pop"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                            >
                                                <ChevronRight className="size-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Page info */}
                                    <p className="text-center text-xs text-muted-foreground mt-3">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}

/* ── Active filter chip ── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <Badge variant="secondary" className="gap-1 text-xs pr-1 bg-primary/5 text-primary border-primary/10">
            {label}
            <button onClick={onRemove} className="ml-1 hover:text-destructive rounded-full transition-colors">
                <X className="size-3" />
            </button>
        </Badge>
    )
}
