import { supabase } from '@/lib/supabaseClient'

export async function uploadProductImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return null
    }

    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

    return data.publicUrl
}

export async function deleteProductImage(imageUrl: string) {
    if (!imageUrl) return

    // Extract file path from URL
    // URL format: .../storage/v1/object/public/product-images/products/filename.ext
    const path = imageUrl.split('/product-images/')[1]
    if (!path) return

    const { error } = await supabase.storage
        .from('product-images')
        .remove([path])

    if (error) {
        console.error('Error deleting image:', error)
    }
}
