import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, Truck, Check, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/context/CartContext'
import { formatPrice, getEffectivePrice } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

export default function Checkout() {
    const { items, total, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    })

    const shipping = total >= 1500 ? 0 : 150
    const tax = total * 0.08
    const grandTotal = total + shipping + tax

    // Check if all required fields are filled
    const isFormValid = Object.values(formData).every(value => value.trim() !== '')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return

        if (!user) {
            toast.error('Please log in to place an order')
            navigate('/login')
            return
        }

        setIsSubmitting(true)

        try {
            const orderItems = items.map(item => ({
                product_id: item.product.id,
                name: item.product.name,
                price: getEffectivePrice(item.product.price, item.product.discountPrice, item.product.isDiscounted),
                quantity: item.quantity,
                image_url: item.product.image
            }))

            const { error } = await supabase.rpc('process_order', {
                p_user_id: user.id,
                p_customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
                p_customer_email: formData.email,
                p_phone: formData.phone,
                p_address_line: formData.address,
                p_city: formData.city,
                p_state: formData.state,
                p_zip_code: formData.zip,
                p_payment_method: 'COD',
                p_items: orderItems,
                p_subtotal: total,
                p_shipping: shipping,
                p_tax: tax,
                p_total: grandTotal,
                p_status: 'pending'
            })

            if (error) throw error

            clearCart()
            toast.success('Order placed successfully! 🎉')
            navigate('/')

        } catch (error: any) {
            console.error('Order placement error:', error)
            toast.error(error.message || 'Failed to place order')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) {
        navigate('/cart')
        return null
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Lock className="size-3.5" />
                        <span>Secure SSL encrypted checkout</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping */}
                            <Card className="animate-fade-in-up">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="flex items-center justify-center size-8 rounded-lg bg-blue-50 text-blue-600">
                                            <Truck className="size-4" />
                                        </div>
                                        Shipping Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-xs font-semibold">First Name</Label>
                                            <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-xs font-semibold">Last Name</Label>
                                            <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                                            <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+216 XX XXX XXX" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-xs font-semibold">Street Address</Label>
                                        <Input id="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" required className="bg-slate-50 focus:bg-white" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-xs font-semibold">City</Label>
                                            <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="New York" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state" className="text-xs font-semibold">State</Label>
                                            <Input id="state" value={formData.state} onChange={handleInputChange} placeholder="NY" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zip" className="text-xs font-semibold">ZIP Code</Label>
                                            <Input id="zip" value={formData.zip} onChange={handleInputChange} placeholder="10001" required className="bg-slate-50 focus:bg-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="animate-fade-in-up stagger-2">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 text-emerald-600">
                                            <Banknote className="size-4" />
                                        </div>
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 border rounded-lg bg-slate-50 flex items-start gap-3">
                                        <div className="mt-0.5 flex items-center justify-center size-5 rounded-full bg-primary text-white shrink-0">
                                            <div className="size-2 rounded-full bg-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Cash on Delivery (COD)</p>
                                            <p className="text-xs text-muted-foreground mt-1">Pay in cash when your order is delivered.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary */}
                        <div>
                            <Card className="sticky top-40 animate-fade-in-up stagger-3">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.product.id} className="flex items-center gap-3">
                                            <div className="relative shrink-0">
                                                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-md" />
                                                <Badge className="absolute -top-1.5 -right-1.5 size-5 p-0 flex items-center justify-center text-[10px] bg-primary border-0">
                                                    {item.quantity}
                                                </Badge>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium line-clamp-1">{item.product.name}</p>
                                                <p className="text-[11px] text-muted-foreground">{item.product.brand}</p>
                                            </div>
                                            <span className="text-sm font-bold shrink-0">
                                                {formatPrice(getEffectivePrice(item.product.price, item.product.discountPrice, item.product.isDiscounted) * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">{formatPrice(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            {shipping === 0 ? (
                                                <Badge className="bg-green-50 text-green-600 border-green-200 hover:bg-green-50 text-xs">Free</Badge>
                                            ) : (
                                                <span className="font-medium">{formatPrice(shipping)}</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span className="font-medium">{formatPrice(tax)}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">{formatPrice(grandTotal)}</span>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm btn-pop"
                                        size="lg"
                                        disabled={isSubmitting || !isFormValid}
                                    >
                                        {isSubmitting ? (
                                            <span className="animate-pulse">Processing Order...</span>
                                        ) : (
                                            <><Check className="size-5" /> Place Order — {formatPrice(grandTotal)}</>
                                        )}
                                    </Button>
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="size-3.5" />
                                        <span>Your payment is secure. Pay upon delivery.</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
