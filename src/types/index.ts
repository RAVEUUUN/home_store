export interface Product {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    image: string
    category: string
    brand: string
    rating: number
    reviewCount: number
    inStock: boolean
    stock: number
    productCode: string
    discountPrice?: number
    isDiscounted: boolean
    features: string[]
    specs: Record<string, string>
}

export interface CartItem {
    product: Product
    quantity: number
}

export interface User {
    id: string
    name: string
    email: string
    role: 'customer' | 'admin'
}

export interface Order {
    id: string
    userId: string
    customerName: string
    customerEmail: string
    items: CartItem[]
    total: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    shippingAddress: string
    createdAt: string
}
