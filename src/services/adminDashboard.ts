import { supabase } from '@/lib/supabaseClient'

export interface DashboardStats {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    avgOrderValue: number
}

export interface DashboardOrder {
    id: string
    customerName: string
    customerEmail: string
    total: number
    status: string
    createdAt: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const [ordersResponse, productsResponse] = await Promise.all([
        supabase.from('orders').select('total, status'),
        supabase.from('products').select('id', { count: 'exact', head: true })
    ])

    if (ordersResponse.error) throw ordersResponse.error
    if (productsResponse.error) throw productsResponse.error

    const orders = ordersResponse.data || []

    // Revenue calculations now strictly based on DELIVERED orders
    const deliveredOrders = orders.filter(o => o.status === 'delivered')
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

    const totalOrders = orders.length
    const totalProducts = productsResponse.count || 0

    // Avg Order Value based on Delivered Revenue / Delivered Count
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0

    return {
        totalRevenue,
        totalOrders,
        totalProducts,
        avgOrderValue
    }
}

export async function getRecentOrders(): Promise<DashboardOrder[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) throw error

    return (data || []).map(order => ({
        id: order.id,
        customerName: order.customer_name || 'Guest',
        customerEmail: order.customer_email || 'No email',
        total: Number(order.total),
        status: order.status,
        createdAt: new Date(order.created_at).toLocaleDateString()
    }))
}
