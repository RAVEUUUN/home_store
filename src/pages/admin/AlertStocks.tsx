import { useState, useEffect } from 'react'
import { AlertTriangle, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { AdminTableSkeleton } from '@/components/skeletons'

interface LowStockProduct {
    id: string
    name: string
    brand: string
    category: string
    stock: number
    image_url: string
}

export default function AlertStocks() {
    const [products, setProducts] = useState<LowStockProduct[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchLowStock() {
            const { data } = await supabase
                .from('products')
                .select('id, name, brand, category, stock, image_url')
                .lt('stock', 2)
                .order('stock', { ascending: true })

            setProducts(data || [])
            setLoading(false)
        }
        fetchLowStock()
    }, [])

    if (loading) return <AdminTableSkeleton rows={5} />

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-6" />
                <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
            </div>

            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-destructive">Products with less than 2 items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No low stock alerts. Good job!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img src={product.image_url} alt={product.name} className="size-10 rounded-md object-cover" />
                                                <div>
                                                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{product.category}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive" className="font-mono">
                                                {product.stock} left
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/admin/products')}>
                                                <Pencil className="size-3.5" /> Edit in Products
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
