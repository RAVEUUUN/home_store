import { Link } from 'react-router-dom'
import { Zap, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react'

const footerLinks = {
    'Quick Links': [
        { name: 'Home', path: '/' },
        { name: 'Shop All', path: '/shop' },
        { name: 'Deals', path: '/shop' },
        { name: 'About Us', path: '/' },
    ],
    Categories: [
        { name: 'Refrigerators', path: '/shop?category=Refrigerators' },
        { name: 'Washing Machines', path: '/shop?category=Washing Machines' },
        { name: 'Ovens & Ranges', path: '/shop?category=Ovens & Ranges' },
        { name: 'Dishwashers', path: '/shop?category=Dishwashers' },
    ],
    Support: [
        { name: 'Contact Us', path: '/' },
        { name: 'FAQs', path: '/' },
        { name: 'Shipping Info', path: '/' },
        { name: 'Returns', path: '/' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-slate-300">
            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-5">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-white shadow-sm">
                                <Zap className="size-5" />
                            </div>
                            <div>
                                <span className="font-bold text-lg text-white">Home</span>
                                <span className="font-bold text-lg text-white/70">Store</span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
                            Your one-stop shop for premium household appliances. Quality products, unbeatable prices, expert support.
                        </p>
                        <div className="flex items-center gap-2.5">
                            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex items-center justify-center size-9 rounded-lg bg-white/5 text-slate-400 hover:bg-primary hover:text-white transition-all duration-200 btn-pop"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title} className="space-y-3">
                            <h3 className="font-semibold text-sm text-white tracking-wide">{title}</h3>
                            <ul className="space-y-2.5">
                                {links.map(link => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="text-sm text-slate-400 hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                                        >
                                            <ChevronRightIcon className="size-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div className="space-y-3 col-span-2 sm:col-span-1">
                        <h3 className="font-semibold text-sm text-white tracking-wide">Contact Us</h3>
                        <div className="space-y-3">
                            {[
                                { icon: Phone, text: '(555) 123-4567' },
                                { icon: Mail, text: 'support@homestore.com' },
                                { icon: MapPin, text: '123 Appliance Ave, NY 10001' },
                            ].map(item => (
                                <div key={item.text} className="flex items-start gap-3 text-sm text-slate-400">
                                    <item.icon className="size-4 mt-0.5 text-primary shrink-0" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} HomeStore. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <span>·</span>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <span>·</span>
                        <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function ChevronRightIcon({ className }: { className?: string }) {
    return <ArrowRight className={className} />
}
