import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { AdminTableSkeleton } from '@/components/skeletons'
import { getAdminOrders, updateOrderStatus, type AdminOrder } from '@/services/adminOrders'

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    processing: 'secondary',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const data = await getAdminOrders(statusFilter)
            setOrders(data)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [statusFilter])

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await updateOrderStatus(orderId, status)
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status } : null)
            }
            toast.success(`Order status updated to ${status}`)
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Failed to update status')
        }
    }

    if (loading && orders.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2"><div className="h-8 w-24 bg-slate-200/70 animate-pulse rounded-md" /><div className="h-4 w-40 bg-slate-200/70 animate-pulse rounded-md" /></div>
                    <div className="h-9 w-40 bg-slate-200/70 animate-pulse rounded-md" />
                </div>
                <AdminTableSkeleton rows={5} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-muted-foreground mt-1">{orders.length} orders found</p>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No orders yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{order.customer_name || 'Guest'}</p>
                                                <p className="text-xs text-muted-foreground">{order.customer_email || 'No email'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{(order.items || []).reduce((s: number, i: any) => s + i.quantity, 0)} items</TableCell>
                                        <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                                        <TableCell>
                                            <Select value={order.status} onValueChange={(v) => handleUpdateStatus(order.id, v)}>
                                                <SelectTrigger className="w-32 h-7 text-xs border-0 bg-transparent p-0">
                                                    <Badge variant={statusColors[order.status] || 'outline'} className="capitalize text-xs w-full justify-center">
                                                        {order.status}
                                                    </Badge>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="processing">Processing</SelectItem>
                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="size-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order {selectedOrder?.id.slice(0, 8)}...</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedOrder.customer_name}</p>
                                    <p className="text-muted-foreground text-xs">{selectedOrder.customer_email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant={statusColors[selectedOrder.status] || 'outline'} className="capitalize mt-1">{selectedOrder.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total</p>
                                    <p className="font-bold text-lg">{formatPrice(selectedOrder.total)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="font-medium mb-3">Items</p>
                                {(selectedOrder.items || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 py-2">
                                        <img src={item.image_url} alt={item.name} className="size-12 rounded-md object-cover bg-slate-100" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            {/* Would add Shipping Address display here if available in type/query */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
