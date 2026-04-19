import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/* ═══════════════════════════════════════════════════════════
   ProductCard skeleton — matches the upgraded ProductCard
   ═══════════════════════════════════════════════════════════ */
function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden py-0 gap-0 border border-border/60 bg-white h-full flex flex-col">
            {/* Image area 4:3 */}
            <Skeleton className="aspect-[4/3] rounded-none" />
            {/* Content */}
            <CardContent className="p-4 flex flex-col flex-1 gap-0">
                {/* Brand */}
                <Skeleton className="h-3 w-16" />
                {/* Title (2 lines) */}
                <Skeleton className="h-4 w-full mt-1.5" />
                <Skeleton className="h-4 w-3/4 mt-1" />
                {/* Rating row */}
                <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="size-3 rounded-sm" />
                    ))}
                    <Skeleton className="h-3 w-6 ml-1" />
                    <Skeleton className="h-3 w-10" />
                </div>
                {/* Spacer */}
                <div className="flex-1" />
                {/* Price row */}
                <div className="flex items-baseline gap-2 mt-3 pt-3 border-t border-dashed border-border/60">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16 ml-auto rounded-full" />
                </div>
                {/* Stock badge */}
                <Skeleton className="h-5 w-20 rounded-full mt-2" />
                {/* CTA button */}
                <Skeleton className="h-8 w-full rounded-md mt-3" />
            </CardContent>
        </Card>
    )
}

/* ═══════════════════════════════════════════════════════════
   Product grid skeleton — reusable
   ═══════════════════════════════════════════════════════════ */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <ProductCardSkeleton />
                </div>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   Section header skeleton — matches SectionHeader component
   ═══════════════════════════════════════════════════════════ */
function SectionHeaderSkeleton({ hasIcon = false }: { hasIcon?: boolean }) {
    return (
        <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div className="flex items-center gap-3">
                {hasIcon && <Skeleton className="size-10 rounded-lg shrink-0" />}
                <div className="space-y-1.5">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-md hidden sm:block" />
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE skeleton — matches exact Home layout
   ═══════════════════════════════════════════════════════════ */
export function HomePageSkeleton() {
    return (
        <div>
            {/* ── 1. HERO ── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-slate-100/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left copy */}
                        <div className="space-y-6">
                            <Skeleton className="h-6 w-44 rounded-full" />
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-72 bg-white/10" />
                                <Skeleton className="h-12 w-56 bg-white/10" />
                                <Skeleton className="h-8 w-48 bg-white/10" />
                            </div>
                            <Skeleton className="h-5 w-80 bg-white/10" />
                            <Skeleton className="h-5 w-64 bg-white/10" />
                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Skeleton className="h-11 w-40 rounded-md bg-white/10" />
                                <Skeleton className="h-11 w-36 rounded-md bg-white/10" />
                            </div>
                            {/* Stats */}
                            <div className="flex gap-8 pt-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="space-y-1">
                                        <Skeleton className="h-6 w-12 bg-white/10" />
                                        <Skeleton className="h-3 w-16 bg-white/10" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Right promo card */}
                        <div className="hidden lg:block">
                            <div className="relative rounded-2xl border border-white/10 p-8 bg-white/5">
                                <Skeleton className="h-5 w-24 rounded-full bg-white/10 absolute -top-3 left-6" />
                                <Skeleton className="w-full h-64 rounded-xl bg-white/10" />
                                <div className="mt-4 space-y-3">
                                    <Skeleton className="h-6 w-56 bg-white/10" />
                                    <div className="flex items-baseline gap-3">
                                        <Skeleton className="h-7 w-28 bg-white/10" />
                                        <Skeleton className="h-4 w-20 bg-white/10" />
                                    </div>
                                    <Skeleton className="h-10 w-full rounded-md bg-white/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. CATEGORY QUICK CHIPS ── */}
            <section className="bg-white border-b shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-hidden py-3">
                        <Skeleton className="h-8 w-24 rounded-md shrink-0" />
                        <div className="w-px h-5 bg-border mx-1 shrink-0" />
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-28 rounded-md shrink-0" />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. VALUE PROPS ── */}
            <section className="bg-slate-50 border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-border">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 py-5 px-4 lg:px-6">
                                <Skeleton className="size-10 rounded-lg shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. FLASH DEALS ── */}
            <section className="py-14 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeaderSkeleton hasIcon />
                    <ProductGridSkeleton count={4} />
                </div>
            </section>

            {/* ── 5. SHOP BY CATEGORY ── */}
            <section className="py-14 sm:py-20 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeaderSkeleton />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="py-0 border-border/60 bg-white overflow-hidden">
                                <CardContent className="p-5 flex flex-col items-center gap-2">
                                    <Skeleton className="size-10 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 6. FEATURED PRODUCTS ── */}
            <section className="py-14 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeaderSkeleton />
                    <ProductGridSkeleton count={8} />
                </div>
            </section>

            {/* ── 7. NEWSLETTER CTA ── */}
            <section className="bg-slate-50 border-y border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left space-y-4 max-w-lg">
                            <Skeleton className="h-5 w-28 rounded-full mx-auto lg:mx-0" />
                            <Skeleton className="h-10 w-80 mx-auto lg:mx-0" />
                            <Skeleton className="h-10 w-64 mx-auto lg:mx-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                        <div className="w-full max-w-md space-y-3">
                            <div className="flex gap-2">
                                <Skeleton className="h-12 flex-1 rounded-lg" />
                                <Skeleton className="h-12 w-28 rounded-lg" />
                            </div>
                            <Skeleton className="h-3 w-64 mx-auto lg:mx-0" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   SHOP PAGE skeleton — matches full filter panel
   ═══════════════════════════════════════════════════════════ */
export function ShopPageSkeleton() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-48 rounded-md" />
                            <Skeleton className="h-9 w-20 rounded-md lg:hidden" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-8">
                    {/* Sidebar filters skeleton */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <Card className="p-5 space-y-5">
                            {/* Search */}
                            <Skeleton className="h-9 w-full rounded-md" />
                            <div className="border-t" />
                            {/* Categories */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <Skeleton key={i} className="h-9 w-full rounded-md" />
                                ))}
                            </div>
                            <div className="border-t" />
                            {/* Brands */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <Skeleton className="size-4 rounded-sm" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                            <div className="border-t" />
                            {/* Price range */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-full rounded-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                            <div className="border-t" />
                            {/* Rating */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 w-full rounded-md" />
                                ))}
                            </div>
                            <div className="border-t" />
                            {/* Availability */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <div className="flex items-center gap-2.5">
                                    <Skeleton className="size-4 rounded-sm" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </Card>
                    </aside>
                    {/* Grid + pagination */}
                    <div className="flex-1">
                        <ProductGridSkeleton count={6} />
                        {/* Pagination skeleton */}
                        <div className="flex items-center justify-center gap-2 mt-10">
                            <Skeleton className="size-9 rounded-md" />
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="size-9 rounded-md" />
                            ))}
                            <Skeleton className="size-9 rounded-md" />
                        </div>
                        <Skeleton className="h-3 w-48 mx-auto mt-3" />
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT DETAILS skeleton
   ═══════════════════════════════════════════════════════════ */
export function ProductDetailsSkeleton() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-16" />
                                {i < 3 && <span className="text-muted-foreground">/</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image */}
                        <Skeleton className="aspect-square rounded-none" />
                        {/* Details */}
                        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                            <div className="space-y-3">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-3/4" />
                            </div>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="size-5 rounded-sm" />
                                ))}
                                <Skeleton className="h-5 w-20 ml-2" />
                            </div>
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="border-t" />
                            <Skeleton className="h-5 w-40" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-32 rounded-lg" />
                                <Skeleton className="h-10 flex-1 rounded-lg" />
                            </div>
                            <div className="border-t" />
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Tabs */}
                <div className="mt-8 bg-white rounded-xl border shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-28 rounded-md" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   CART skeleton
   ═══════════════════════════════════════════════════════════ */
export function CartSkeleton() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart items */}
                    <div className="lg:col-span-2 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="py-0">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shrink-0" />
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-5 w-48" />
                                                </div>
                                                <Skeleton className="size-8 rounded-md shrink-0" />
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <Skeleton className="h-8 w-28 rounded-lg" />
                                                <Skeleton className="h-5 w-20" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {/* Summary */}
                    <div>
                        <Card>
                            <CardContent className="p-5 space-y-4">
                                <Skeleton className="h-6 w-36" />
                                <div className="space-y-2.5">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <Skeleton className="h-11 w-full rounded-md" />
                                <Skeleton className="h-11 w-full rounded-md" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   ADMIN TABLE skeleton
   ═══════════════════════════════════════════════════════════ */
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-9 w-64 rounded-md" />
                    <Skeleton className="h-9 w-32 rounded-md ml-auto" />
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 border-b px-4 py-3 flex gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="px-4 py-3 border-b last:border-0 flex items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <Skeleton className="size-10 rounded-md shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <div className="flex gap-1 ml-auto">
                                <Skeleton className="size-8 rounded-md" />
                                <Skeleton className="size-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD skeleton
   ═══════════════════════════════════════════════════════════ */
export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="size-4" />
                            </div>
                            <Skeleton className="h-8 w-28" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <AdminTableSkeleton rows={5} />
        </div>
    )
}
