import { useParams, Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Star, ShoppingCart, Minus, Plus, Check, Truck, Shield, RotateCcw, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { getProductById } from '@/services/supabaseProducts'
import { formatPrice, getEffectivePrice } from '@/lib/utils'
import { ProductDetailsSkeleton } from '@/components/skeletons'
import { toast } from 'sonner'
import type { Product } from '@/types'

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>()
    const [quantity, setQuantity] = useState(1)
    const { addItem } = useCart()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            getProductById(id).then(data => {
                setProduct(data)
                setLoading(false)
            })
        }
    }, [id])

    if (loading) {
        return <ProductDetailsSkeleton />
    }

    if (!product) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <Link to="/shop"><Button className="mt-4 bg-primary hover:bg-primary/90 text-white btn-pop">Back to Shop</Button></Link>
            </div>
        )
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <span>/</span>
                        <Link to={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium truncate">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-fade-in-up">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 group">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="object-cover w-full h-full img-zoom"
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {discount > 0 && (
                                    <Badge className="bg-promo hover:bg-promo text-white border-0 text-sm px-3 py-1 shadow-md">
                                        Save {discount}%
                                    </Badge>
                                )}
                                {product.rating >= 4.7 && (
                                    <Badge className="bg-slate-800 hover:bg-slate-800 text-white border-0 text-sm px-3 py-1 gap-1">
                                        <Award className="size-3.5" /> Top Rated
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-8 sm:p-10 lg:p-12 space-y-7">
                            <div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{product.brand}</p>
                                    <span className="text-xs font-mono text-muted-foreground/60">ID: {product.productCode}</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2.5 text-foreground">{product.name}</h1>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star key={i} className={`size-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                    ))}
                                </div>
                                <span className="font-semibold">{product.rating}</span>
                                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                            </div>

                            <div className="flex items-baseline gap-3 p-5 bg-slate-50 rounded-xl border">
                                <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                                    {formatPrice(getEffectivePrice(product.price, product.discountPrice, product.isDiscounted))}
                                </span>
                                {(product.isDiscounted || product.originalPrice) && (
                                    <>
                                        <span className="text-lg text-muted-foreground line-through">
                                            {formatPrice(product.isDiscounted ? product.price : product.originalPrice!)}
                                        </span>
                                        {product.isDiscounted ? (
                                            <Badge className="bg-destructive hover:bg-destructive text-white border-0 text-sm px-3 py-1 shadow-md animate-pulse">
                                                Save {formatPrice(product.price - (product.discountPrice || 0))}
                                            </Badge>
                                        ) : (
                                            product.originalPrice && (
                                                <Badge className="bg-promo/10 text-promo border-promo/20 hover:bg-promo/10 text-xs font-bold">
                                                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                </Badge>
                                            )
                                        )}
                                    </>
                                )}
                            </div>

                            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                            <Separator />

                            {/* Stock & Quantity */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {product.inStock ? (
                                        <>
                                            <span className="flex items-center justify-center size-5 rounded-full bg-green-100">
                                                <Check className="size-3 text-green-600" />
                                            </span>
                                            <span className="text-sm font-semibold text-green-600">In Stock — Ready to Ship</span>
                                        </>
                                    ) : (
                                        <span className="text-sm font-semibold text-red-500">Out of Stock</span>
                                    )}
                                </div>

                                {product.inStock && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border rounded-lg overflow-hidden">
                                            <Button variant="ghost" size="icon" className="size-10 rounded-none border-r" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                                <Minus className="size-4" />
                                            </Button>
                                            <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                                            <Button variant="ghost" size="icon" className="size-10 rounded-none border-l" onClick={() => setQuantity(q => q + 1)}>
                                                <Plus className="size-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="gap-2 flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm btn-pop"
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
                                                    return
                                                }
                                                addItem(product, quantity)
                                                toast.success(`${quantity}x ${product.name} added to cart`)
                                            }}
                                        >
                                            <ShoppingCart className="size-5" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Benefits */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: Truck, title: 'Free Delivery', desc: 'Over 1,500 TND' },
                                    { icon: Shield, title: 'Warranty', desc: product.specs['Warranty'] || '1 Year' },
                                    { icon: RotateCcw, title: 'Easy Returns', desc: '30 Day Policy' },
                                ].map(item => (
                                    <div key={item.title} className="text-center p-4 rounded-xl bg-slate-50 border">
                                        <item.icon className="size-5 mx-auto mb-2 text-primary" />
                                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-10 bg-white rounded-xl border shadow-sm animate-fade-in-up stagger-2">
                    <Tabs defaultValue="features" className="p-8 sm:p-10">
                        <TabsList className="mb-8">
                            <TabsTrigger value="features">Features</TabsTrigger>
                            <TabsTrigger value="specs">Specifications</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        </TabsList>
                        <TabsContent value="features">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary/20 hover:bg-primary/5 transition-all">
                                        <span className="flex items-center justify-center size-6 rounded-full bg-green-100 shrink-0">
                                            <Check className="size-3.5 text-green-600" />
                                        </span>
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="specs">
                            <div className="border rounded-lg overflow-hidden">
                                {Object.entries(product.specs).map(([key, value], i) => (
                                    <div key={key} className={`flex ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                        <span className="w-44 shrink-0 p-3 text-sm font-semibold border-r bg-slate-50">{key}</span>
                                        <span className="p-3 text-sm text-muted-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="reviews">
                            <div className="text-center py-12 text-muted-foreground">
                                <div className="flex items-center justify-center gap-1 mb-4">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star key={i} className={`size-7 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                    ))}
                                </div>
                                <p className="text-2xl font-bold text-foreground">{product.rating}/5</p>
                                <p className="text-sm mt-1">Based on {product.reviewCount} reviews</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
