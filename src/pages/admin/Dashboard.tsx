import { useEffect, useState } from 'react'
import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import { AdminDashboardSkeleton } from '@/components/skeletons'
import { getDashboardStats, getRecentOrders, type DashboardStats, type DashboardOrder } from '@/services/adminDashboard'
import { toast } from 'sonner'

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    processing: 'secondary',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        avgOrderValue: 0
    })
    const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, ordersData] = await Promise.all([
                    getDashboardStats(),
                    getRecentOrders()
                ])
                setStats(statsData)
                setRecentOrders(ordersData)
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
                toast.error('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return <AdminDashboardSkeleton />

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, change: '100% Real' },
                    { title: 'Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, change: 'Lifetime' },
                    { title: 'Products', value: stats.totalProducts.toString(), icon: Package, change: 'Active' },
                    { title: 'Avg. Order Value', value: formatPrice(stats.avgOrderValue), icon: TrendingUp, change: 'Calculated' },
                ].map(stat => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <stat.icon className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No orders yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium text-xs font-mono">{order.id.slice(0, 8)}...</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{order.customerName}</p>
                                                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusColors[order.status] || 'outline'} className="capitalize">
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{order.createdAt}</TableCell>
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
