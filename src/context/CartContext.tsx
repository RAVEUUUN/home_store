import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Product, CartItem } from '@/types'

import { getEffectivePrice } from '@/lib/utils'

interface CartState {
    items: CartItem[]
    total: number
    itemCount: number
}

type CartAction =
    | { type: 'ADD_ITEM'; product: Product; quantity?: number }
    | { type: 'REMOVE_ITEM'; productId: string }
    | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; items: CartItem[] }

function calculateTotals(items: CartItem[]): { total: number; itemCount: number } {
    return {
        total: items.reduce((sum, item) => {
            const price = getEffectivePrice(item.product.price, item.product.discountPrice, item.product.isDiscounted)
            return sum + price * item.quantity
        }, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }
}

function cartReducer(state: CartState, action: CartAction): CartState {
    let newItems: CartItem[]

    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find(i => i.product.id === action.product.id)
            if (existing) {
                newItems = state.items.map(i =>
                    i.product.id === action.product.id
                        ? { ...i, quantity: i.quantity + (action.quantity || 1) }
                        : i
                )
            } else {
                newItems = [...state.items, { product: action.product, quantity: action.quantity || 1 }]
            }
            return { items: newItems, ...calculateTotals(newItems) }
        }
        case 'REMOVE_ITEM':
            newItems = state.items.filter(i => i.product.id !== action.productId)
            return { items: newItems, ...calculateTotals(newItems) }
        case 'UPDATE_QUANTITY':
            if (action.quantity <= 0) {
                newItems = state.items.filter(i => i.product.id !== action.productId)
            } else {
                newItems = state.items.map(i =>
                    i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
                )
            }
            return { items: newItems, ...calculateTotals(newItems) }
        case 'CLEAR_CART':
            return { items: [], total: 0, itemCount: 0 }
        case 'LOAD_CART':
            return { items: action.items, ...calculateTotals(action.items) }
        default:
            return state
    }
}

interface CartContextType extends CartState {
    addItem: (product: Product, quantity?: number) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 })

    useEffect(() => {
        try {
            const saved = localStorage.getItem('cart')
            if (saved) {
                dispatch({ type: 'LOAD_CART', items: JSON.parse(saved) })
            }
        } catch { /* ignore */ }
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.items))
    }, [state.items])

    const value: CartContextType = {
        ...state,
        addItem: (product, quantity) => dispatch({ type: 'ADD_ITEM', product, quantity }),
        removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
        updateQuantity: (productId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}
