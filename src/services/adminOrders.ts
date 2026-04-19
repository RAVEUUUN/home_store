import { supabase } from '@/lib/supabaseClient'

export interface AdminOrder {
    id: string
    customer_name: string
    customer_email: string
    items: any[]
    total: number
    status: string
    created_at: string
}

export async function getAdminOrders(statusFilter?: string): Promise<AdminOrder[]> {
    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) throw error

    return data as AdminOrder[]
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    if (error) throw error
}
