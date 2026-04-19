import { useState, useEffect, useRef } from 'react'

/**
 * Simulates a loading delay for data fetching.
 * Resets on key change (e.g. route params).
 * Returns `true` while "loading", `false` after the delay.
 */
export function useSimulatedLoading(durationMs = 600, key?: string) {
    const [loading, setLoading] = useState(true)
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => {
        setLoading(true)
        timerRef.current = setTimeout(() => setLoading(false), durationMs)
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [durationMs, key])

    return loading
}
