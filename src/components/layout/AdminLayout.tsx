import { Link, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Alert Stocks', path: '/admin/alerts', icon: AlertTriangle },
]

export default function AdminLayout() {
    const location = useLocation()

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
                <div className="p-6">
                    <h2 className="font-bold text-lg">Admin Panel</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your store</p>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                    {adminLinks.map(link => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link key={link.path} to={link.path}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn('w-full justify-start gap-3', isActive && 'font-semibold')}
                                >
                                    <link.icon className="size-4" />
                                    {link.name}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-3 border-t">
                    <Link to="/">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                            <ArrowLeft className="size-4" />
                            Back to Store
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Mobile nav */}
            <div className="md:hidden border-b bg-muted/30 w-full fixed top-16 z-40">
                <div className="flex gap-1 p-2 overflow-x-auto">
                    {adminLinks.map(link => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link key={link.path} to={link.path}>
                                <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2 shrink-0">
                                    <link.icon className="size-3.5" />
                                    {link.name}
                                </Button>
                            </Link>
                        )
                    })}
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-2 shrink-0 text-muted-foreground">
                            <ArrowLeft className="size-3.5" /> Store
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}
