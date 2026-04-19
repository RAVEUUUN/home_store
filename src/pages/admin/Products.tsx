import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getProducts, getProductByCode } from '@/services/supabaseProducts'
import { createProduct, updateProduct, deleteProduct, applyDiscount, removeDiscount } from '@/services/adminProducts'
import { uploadProductImage, deleteProductImage } from '@/services/storage'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'
import { AdminTableSkeleton } from '@/components/skeletons'
import { useEffect } from 'react'

export default function AdminProducts() {
    const [productsList, setProductsList] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editing, setEditing] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        brand: '',
        category: '',
        description: '',
        image: '',
        stock: '0',
        imageFile: null as File | null,
        features: [] as string[],
        specs: [] as { key: string, value: string }[]
    })

    const fetchProducts = async () => {
        setLoading(true)
        const data = await getProducts()
        setProductsList(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const filtered = productsList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    )

    const openAdd = () => {
        setEditing(null)
        setFormData({
            name: '',
            price: '',
            brand: '',
            category: '',
            description: '',
            image: '',
            stock: '0',
            imageFile: null,
            features: [],
            specs: []
        })
        setDialogOpen(true)
    }

    const openEdit = (product: Product) => {
        setEditing(product)
        setFormData({
            name: product.name,
            price: product.price.toString(),
            brand: product.brand,
            category: product.category,
            description: product.description,
            image: product.image,
            stock: (product.stock ?? 0).toString(),
            imageFile: null,
            features: product.features,
            specs: Object.entries(product.specs).map(([key, value]) => ({ key, value }))
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            toast.error('Name and price are required')
            return
        }

        try {
            setUploading(true)
            let imageUrl = formData.image

            // 1. Upload image if selected
            if (formData.imageFile) {
                const url = await uploadProductImage(formData.imageFile)
                if (url) {
                    imageUrl = url
                    // If editing and replacing image, delete old one? Optional safety.
                } else {
                    toast.error('Failed to upload image')
                    setUploading(false)
                    return
                }
            }

            // 2. Prepare payload
            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                brand: formData.brand,
                category: formData.category,
                description: formData.description,
                image: imageUrl,
                features: formData.features.filter(f => f.trim() !== ''),
                specs: formData.specs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>),
                stock: parseInt(formData.stock) || 0,
                inStock: (parseInt(formData.stock) || 0) > 0, // Auto-update inStock based on quantity
                productCode: editing ? editing.productCode : '', // DB trigger handles if empty/null, but we need to satisfy type
                isDiscounted: editing ? editing.isDiscounted : false,
                rating: editing ? editing.rating : 0,
                reviewCount: editing ? editing.reviewCount : 0
            }

            // 3. Insert or Update
            if (editing) {
                await updateProduct(editing.id, productData)
                toast.success('Product updated')
            } else {
                await createProduct(productData)
                toast.success('Product created')
            }

            // 4. Refresh & Close
            await fetchProducts()
            setDialogOpen(false)

        } catch (error) {
            console.error(error)
            toast.error('Failed to save product. Check permissions.')
        } finally {
            setUploading(false)
        }
    }

    const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
    const [discountForm, setDiscountForm] = useState({
        code: '',
        loadingProduct: false,
        foundProduct: null as Product | null,
        newPrice: '',
        error: ''
    })

    const handleLookupProduct = async () => {
        if (!discountForm.code) return
        setDiscountForm(prev => ({ ...prev, loadingProduct: true, error: '', foundProduct: null }))
        try {
            const product = await getProductByCode(discountForm.code)
            if (product) {
                setDiscountForm(prev => ({ ...prev, foundProduct: product, newPrice: product.discountPrice?.toString() || '' }))
            } else {
                setDiscountForm(prev => ({ ...prev, error: 'Product not found' }))
            }
        } catch (err) {
            setDiscountForm(prev => ({ ...prev, error: 'Error searching product' }))
        } finally {
            setDiscountForm(prev => ({ ...prev, loadingProduct: false }))
        }
    }

    const handleSaveDiscount = async () => {
        if (!discountForm.foundProduct) return
        const price = parseFloat(discountForm.newPrice)

        if (isNaN(price) || price < 0) {
            setDiscountForm(prev => ({ ...prev, error: 'Invalid price' }))
            return
        }

        if (price >= discountForm.foundProduct.price) {
            setDiscountForm(prev => ({ ...prev, error: 'Discount price must be lower than original price' }))
            return
        }

        try {
            await applyDiscount(discountForm.foundProduct.id, price)
            toast.success('Discount applied')
            setDiscountDialogOpen(false)
            fetchProducts()
        } catch (err) {
            toast.error('Failed to apply discount')
        }
    }

    const handleRemoveDiscount = async () => {
        if (!discountForm.foundProduct) return
        try {
            await removeDiscount(discountForm.foundProduct.id)
            toast.success('Discount removed')
            setDiscountDialogOpen(false)
            fetchProducts()
        } catch (err) {
            toast.error('Failed to remove discount')
        }
    }

    const handleDelete = async (product: Product) => {
        if (!confirm('Are you sure?')) return
        try {
            // Delete image first
            await deleteProductImage(product.image)
            // Delete row
            await deleteProduct(product.id)

            toast.success('Product deleted')
            fetchProducts()
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete product')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2"><div className="h-8 w-32 bg-slate-200/70 animate-pulse rounded-md" /><div className="h-4 w-48 bg-slate-200/70 animate-pulse rounded-md" /></div>
                    <div className="h-9 w-32 bg-slate-200/70 animate-pulse rounded-md" />
                </div>
                <AdminTableSkeleton rows={6} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-muted-foreground mt-1">{productsList.length} products total</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => {
                        setDiscountForm({ code: '', loadingProduct: false, foundProduct: null, newPrice: '', error: '' })
                        setDiscountDialogOpen(true)
                    }}>
                        <Tag className="size-4" /> Add Discount
                    </Button>
                    <Button className="gap-2" onClick={openAdd}>
                        <Plus className="size-4" /> Add Product
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} alt={product.name} className="size-10 rounded-md object-cover" />
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.brand} <span className="text-[10px] font-mono text-slate-400">#{product.productCode}</span></p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{product.category}</TableCell>
                                    <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                                    <TableCell className="text-sm font-semibold">{product.stock}</TableCell>
                                    <TableCell className="text-sm">⭐ {product.rating}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(product)}>
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(product)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock</Label>
                                <Input type="number" min="0" value={formData.stock} onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <Input value={formData.brand} onChange={e => setFormData(f => ({ ...f, brand: e.target.value }))} placeholder="Brand" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} placeholder="Category" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} placeholder="Category" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={formData.image}
                                        onChange={e => setFormData(f => ({ ...f, image: e.target.value }))}
                                        placeholder="https://example.com/image.jpg"
                                        disabled={!!formData.imageFile}
                                    />
                                    {/* File Input */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    setFormData(f => ({
                                                        ...f,
                                                        imageFile: file,
                                                        image: URL.createObjectURL(file) // Preview
                                                    }))
                                                }
                                            }}
                                        />
                                        {formData.imageFile && (
                                            <Button variant="ghost" size="sm" onClick={() => setFormData(f => ({ ...f, imageFile: null, image: editing?.image || '' }))}>
                                                Remove File
                                            </Button>
                                        )}
                                    </div>
                                    {formData.image && (
                                        <div className="relative w-full overflow-hidden rounded-md border bg-slate-100 flex justify-center">
                                            <img src={formData.image} alt="Preview" className="w-auto h-auto max-h-60 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                            <Label>Features</Label>
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={feature}
                                        onChange={e => {
                                            const newFeatures = [...formData.features]
                                            newFeatures[index] = e.target.value
                                            setFormData(f => ({ ...f, features: newFeatures }))
                                        }}
                                        placeholder="Feature"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        const newFeatures = formData.features.filter((_, i) => i !== index)
                                        setFormData(f => ({ ...f, features: newFeatures }))
                                    }}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => setFormData(f => ({ ...f, features: [...f.features, ''] }))}>
                                <Plus className="size-4 mr-2" /> Add Feature
                            </Button>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-2">
                            <Label>Specifications</Label>
                            {formData.specs.map((spec, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={spec.key}
                                        onChange={e => {
                                            const newSpecs = [...formData.specs]
                                            newSpecs[index].key = e.target.value
                                            setFormData(f => ({ ...f, specs: newSpecs }))
                                        }}
                                        placeholder="Key (e.g. Color)"
                                        className="w-1/3"
                                    />
                                    <Input
                                        value={spec.value}
                                        onChange={e => {
                                            const newSpecs = [...formData.specs]
                                            newSpecs[index].value = e.target.value
                                            setFormData(f => ({ ...f, specs: newSpecs }))
                                        }}
                                        placeholder="Value (e.g. Red)"
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        const newSpecs = formData.specs.filter((_, i) => i !== index)
                                        setFormData(f => ({ ...f, specs: newSpecs }))
                                    }}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => setFormData(f => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }))}>
                                <Plus className="size-4 mr-2" /> Add Specification
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={uploading}>
                            {uploading ? 'Saving...' : (editing ? 'Update' : 'Add')} Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Discount Dialog */}
            <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>manage Discount</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Product ID / Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter Product Code (e.g. HS-123)"
                                    value={discountForm.code}
                                    onChange={e => setDiscountForm(prev => ({ ...prev, code: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && handleLookupProduct()}
                                />
                                <Button variant="secondary" onClick={handleLookupProduct} disabled={discountForm.loadingProduct}>
                                    {discountForm.loadingProduct ? '...' : 'Search'}
                                </Button>
                            </div>
                            {discountForm.error && <p className="text-sm text-destructive">{discountForm.error}</p>}
                        </div>

                        {discountForm.foundProduct && (
                            <div className="bg-slate-50 p-4 rounded-md space-y-4 border">
                                <div>
                                    <p className="font-medium">{discountForm.foundProduct.name}</p>
                                    <p className="text-sm text-muted-foreground">Original Price: {formatPrice(discountForm.foundProduct.price)}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>New Discounted Price</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={discountForm.newPrice}
                                        onChange={e => setDiscountForm(prev => ({ ...prev, newPrice: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Must be less than {formatPrice(discountForm.foundProduct.price)}
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    {discountForm.foundProduct.isDiscounted && (
                                        <Button variant="destructive" size="sm" onClick={handleRemoveDiscount}>
                                            Remove Discount
                                        </Button>
                                    )}
                                    <Button onClick={handleSaveDiscount}>
                                        Save Discount
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
