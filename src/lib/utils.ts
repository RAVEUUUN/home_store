import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price) + ' TND'
}

export function getEffectivePrice(price: number, discountPrice?: number, isDiscounted?: boolean): number {
    if (isDiscounted && discountPrice !== undefined && discountPrice !== null) {
        return discountPrice
    }
    return price
}
