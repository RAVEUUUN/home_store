import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'

// Re-export read functions
export { getProducts, getProductById } from './supabaseProducts'

// Helper to map UI Product to DB payload
function mapToDbPayload(product: Omit<Product, 'id' | 'createdAt'>) {
    return {
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice,
        image_url: product.image,
        category: product.category,
        brand: product.brand,
        rating: product.rating,
        review_count: product.reviewCount,
        in_stock: product.inStock,
        stock: product.stock,
        product_code: product.productCode || undefined, // Ensure undefined if empty to trigger DB default/trigger
        discount_price: product.discountPrice,
        is_discounted: product.isDiscounted,
        features: product.features,
        specs: product.specs // Record<string, string> maps directly to jsonb
    }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    const payload = mapToDbPayload(product)

    const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single()

    if (error) {
        console.error('Error creating product:', error)
        throw error
    }

    return data ? { ...product, id: data.id } : null
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    const payload: any = {}
    if (product.name) payload.name = product.name
    if (product.description) payload.description = product.description
    if (product.price !== undefined) payload.price = product.price
    if (product.originalPrice !== undefined) payload.original_price = product.originalPrice
    if (product.image) payload.image_url = product.image
    if (product.category) payload.category = product.category
    if (product.brand) payload.brand = product.brand
    if (product.rating !== undefined) payload.rating = product.rating
    if (product.reviewCount !== undefined) payload.review_count = product.reviewCount
    if (product.inStock !== undefined) payload.in_stock = product.inStock
    if (product.stock !== undefined) payload.stock = product.stock
    if (product.productCode) payload.product_code = product.productCode // Only update if truthy/non-empty
    if (product.discountPrice !== undefined) payload.discount_price = product.discountPrice
    if (product.isDiscounted !== undefined) payload.is_discounted = product.isDiscounted
    if (product.features) payload.features = product.features
    if (product.specs) payload.specs = product.specs

    const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating product:', error)
        throw error
    }

    return data ? { ...product, id: data.id } as Product : null
}

export async function deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting product:', error)
        throw error
    }

    return true
}

export async function applyDiscount(id: string, discountPrice: number): Promise<boolean> {
    const { error } = await supabase
        .from('products')
        .update({
            discount_price: discountPrice,
            is_discounted: true
        })
        .eq('id', id)

    if (error) {
        console.error('Error applying discount:', error)
        throw error
    }
    return true
}

export async function removeDiscount(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('products')
        .update({
            discount_price: null,
            is_discounted: false
        })
        .eq('id', id)

    if (error) {
        console.error('Error removing discount:', error)
        throw error
    }
    return true
}
