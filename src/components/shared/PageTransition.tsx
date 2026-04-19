import type { ReactNode } from 'react'

interface PageTransitionProps {
    loading: boolean
    skeleton: ReactNode
    children: ReactNode
}

/**
 * Smoothly transitions from skeleton to real content.
 * Uses CSS opacity + transform for a polished fade effect.
 */
export default function PageTransition({ loading, skeleton, children }: PageTransitionProps) {
    return (
        <>
            {loading ? (
                <div className="animate-fade-in">{skeleton}</div>
            ) : (
                <div className="animate-fade-in">{children}</div>
            )}
        </>
    )
}
