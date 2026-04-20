import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminLayout from '@/components/layout/AdminLayout'
import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import ProductDetails from '@/pages/ProductDetails'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/Products'
import AdminOrders from '@/pages/admin/Orders'
import AlertStocks from '@/pages/admin/AlertStocks'
import AuraChat from '@/components/AuraChat'

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function AdminWrapper() {
  return (
    <>
      <Navbar />
      <AdminLayout />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<AdminWrapper />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/alerts" element={<AlertStocks />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors />
          <AuraChat />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
