import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import type { Product } from '@/types'

interface HeroSliderProps {
    products: Product[]
}

export default function HeroSlider({ products }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const sliderRef = useRef<HTMLElement>(null)
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const AUTO_PLAY_INTERVAL = 6000

    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            handleSlideChange((currentIndex + 1) % products.length)
        }, AUTO_PLAY_INTERVAL)

        return () => clearInterval(interval)
    }, [currentIndex, isAutoPlaying, products.length])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevSlide()
            if (e.key === 'ArrowRight') nextSlide()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentIndex])

    const handleSlideChange = (newIndex: number) => {
        setCurrentIndex(newIndex)
    }

    const nextSlide = () => {
        setIsAutoPlaying(false)
        handleSlideChange((currentIndex + 1) % products.length)
    }

    const prevSlide = () => {
        setIsAutoPlaying(false)
        handleSlideChange((currentIndex - 1 + products.length) % products.length)
    }

    const currentProduct = products[currentIndex]
    if (!currentProduct) return null

    return (
        <section
            ref={sliderRef}
            className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 group selection:bg-primary/10"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* ── Left Content ── */}
                    <div key={`content-${currentIndex}`} className="space-y-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">

                        {/* Pulse Badge */}
                        <div className="inline-flex">
                            <Badge variant="outline" className="relative overflow-hidden border-destructive/20 text-destructive bg-destructive/5 gap-1.5 text-sm py-1.5 px-3.5 font-medium shadow-sm">
                                <span className="absolute inset-0 bg-destructive/10 animate-pulse-slow" />
                                <Flame className="size-3.5 fill-current animate-pulse" />
                                <span className="relative">Limited Time Offer</span>
                            </Badge>
                        </div>

                        {/* Title */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                                <span className="block text-primary line-clamp-2 pb-2">{currentProduct.name}</span>
                            </h1>
                            <p className="text-2xl sm:text-3xl font-medium text-muted-foreground">
                                Save {formatPrice(currentProduct.price - (currentProduct.discountPrice || 0))} <span className="text-lg opacity-60 font-normal">this week</span>
                            </p>
                        </div>

                        <p className="text-base sm:text-lg text-muted-foreground/80 max-w-lg leading-relaxed line-clamp-3">
                            {currentProduct.description}
                        </p>

                        {/* Price Block */}
                        <div className="flex items-baseline gap-4 pt-2">
                            <span className="text-5xl font-extrabold text-foreground tracking-tight">
                                {formatPrice(currentProduct.discountPrice || currentProduct.price)}
                            </span>
                            {currentProduct.originalPrice && (
                                <span className="text-2xl text-muted-foreground/40 line-through decoration-2">
                                    {formatPrice(currentProduct.price)}
                                </span>
                            )}
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to={`/product/${currentProduct.id}`}>
                                <Button
                                    size="lg"
                                    className="h-14 px-8 rounded-full gap-2.5 bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_4px_14px_0_rgba(26,86,219,0.3)] hover:shadow-[0_6px_20px_0_rgba(26,86,219,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] text-[15px]"
                                    onClick={(e) => {
                                        if (!isAuthenticated) {
                                            e.preventDefault()
                                            navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
                                        }
                                    }}
                                >
                                    View Deal <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link to="/shop">
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full gap-2 border-border/60 bg-white/50 hover:bg-white text-foreground hover:text-primary active:scale-[0.98] transition-all duration-300 backdrop-blur-sm">
                                    Browse All
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* ── Right Content (Image Card) ── */}
                    <div className="hidden lg:block relative z-10 group/card">
                        {/* Nav Buttons (Overlay) */}
                        <div className="absolute inset-y-0 -left-6 -right-6 flex items-center justify-between pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={prevSlide}
                                className="pointer-events-auto p-3 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-primary shadow-lg backdrop-blur-md border border-white/50 transition-all duration-200 hover:scale-110 active:scale-95 translate-x-4 group-hover:translate-x-0"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="pointer-events-auto p-3 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-primary shadow-lg backdrop-blur-md border border-white/50 transition-all duration-200 hover:scale-110 active:scale-95 -translate-x-4 group-hover:translate-x-0"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="size-6" />
                            </button>
                        </div>

                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-900/5 rotate-2 hover:rotate-0 transition-transform duration-700 ease-out-expo">
                            <div key={`img-${currentIndex}`} className="absolute inset-0 animate-in fade-in zoom-in-105 duration-1000">
                                <img
                                    src={currentProduct.image}
                                    alt={currentProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating Discount Badge */}
                            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-white/50 flex flex-col items-center animate-in zoom-in-95 fade-in slide-in-from-top-4 duration-700 delay-200">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-0.5">Save</span>
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">
                                    {Math.round(((currentProduct.price - (currentProduct.discountPrice || 0)) / currentProduct.price) * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Slider Dots (Inside Hero) */}
                        <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2.5">
                            {products.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSlideChange(idx)}
                                    className={`relative h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex
                                            ? 'w-8 bg-primary shadow-sm'
                                            : 'w-2 bg-slate-300 hover:bg-slate-400 hover:w-3'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
