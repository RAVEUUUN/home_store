import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Instagram, Twitter, Youtube, ArrowUpRight } from 'lucide-react'

const footerCols = {
    'Navigate': [
        { name: 'Home', path: '/' },
        { name: 'Shop All', path: '/shop' },
        { name: 'Offers & Deals', path: '/shop' },
        { name: 'About HomeStore', path: '/' },
    ],
    'Collections': [
        { name: 'Refrigerators', path: '/shop?category=Refrigerators' },
        { name: 'Washing Machines', path: '/shop?category=Washing Machines' },
        { name: 'Ovens & Ranges', path: '/shop?category=Ovens' },
        { name: 'Dishwashers', path: '/shop?category=Dishwashers' },
    ],
    'Client Services': [
        { name: 'Contact Us', path: '/' },
        { name: 'Frequently Asked', path: '/' },
        { name: 'Shipping Policy', path: '/' },
        { name: 'Returns & Exchanges', path: '/' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-[#1C1917] text-white/60">
            {/* Top section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 border-b border-white/10 pb-12">
                    {/* Brand column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="group inline-block">
                            <span className="font-serif font-bold text-2xl text-white tracking-tight">
                                Home<span className="font-light italic text-white/60">Store</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-white/40 max-w-xs">
                            A curated collection of premium household appliances for the modern home. Crafted for those who demand the very best.
                        </p>
                        {/* Newsletter */}
                        <div className="space-y-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Join the Collection</p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="flex-1 bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
                                />
                                <button className="bg-white text-[#1C1917] px-5 py-3 text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-1.5">
                                    <ArrowUpRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-8">
                        {Object.entries(footerCols).map(([title, links]) => (
                            <div key={title} className="space-y-4">
                                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{title}</h4>
                                <ul className="space-y-3">
                                    {links.map(link => (
                                        <li key={link.name}>
                                            <Link to={link.path}
                                                className="text-sm text-white/50 hover:text-white transition-colors duration-200">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] text-white/25 tracking-wide">
                        © {new Date().getFullYear()} HomeStore. All rights reserved.
                    </p>

                    {/* Contact inline */}
                    <div className="flex flex-wrap items-center gap-6 text-[11px] text-white/30">
                        <span className="flex items-center gap-2"><Phone className="size-3" /> (555) 123-4567</span>
                        <span className="flex items-center gap-2"><Mail className="size-3" /> support@homestore.com</span>
                        <span className="flex items-center gap-2"><MapPin className="size-3" /> Tunis, Tunisia</span>
                    </div>

                    {/* Social */}
                    <div className="flex items-center gap-4">
                        {[Instagram, Twitter, Youtube].map((Icon, i) => (
                            <a key={i} href="#"
                                className="text-white/25 hover:text-white transition-colors duration-200">
                                <Icon className="size-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
