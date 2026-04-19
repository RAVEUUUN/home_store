import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'

// Helper to map DB product to UI Product type
function mapProduct(dbProduct: any): Product {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        price: Number(dbProduct.price),
        originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
        image: dbProduct.image_url,
        category: dbProduct.category,
        brand: dbProduct.brand,
        rating: Number(dbProduct.rating || 0),
        reviewCount: Number(dbProduct.review_count || 0),
        inStock: dbProduct.in_stock,
        stock: dbProduct.stock ?? 0,
        productCode: dbProduct.product_code,
        discountPrice: dbProduct.discount_price ? Number(dbProduct.discount_price) : undefined,
        isDiscounted: dbProduct.is_discounted,
        features: dbProduct.features || [],
        specs: Array.isArray(dbProduct.specs)
            ? dbProduct.specs.reduce((acc: Record<string, string>, item: { key: string, value: string }) => {
                acc[item.key] = item.value
                return acc
            }, {})
            : (dbProduct.specs || {})
    }
}

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return (data || []).map(mapProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return mapProduct(data)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)

    if (error) {
        console.error('Error fetching products by category:', error)
        return []
    }

    return (data || []).map(mapProduct)
}

export async function getProductByCode(code: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_code', code)
        .single()

    if (error) {
        // console.error('Error fetching product by code:', error) // Optional: suppress 404 logs if intended
        return null
    }

    return mapProduct(data)
}

export async function getDiscountedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_discounted', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching discounted products:', error)
        return []
    }

    return (data || []).map(mapProduct)
}
