import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return matches
}

/**
 * Sizes text so its widest `[data-fit]` line fills the element's width, capped so all lines
 * fit the element's height. Re-measures on resize and when web fonts finish loading.
 */
export function useFitText(
  ref: RefObject<HTMLElement | null>,
  { lineHeight, key, min = 28 }: { lineHeight: number; key: string; min?: number },
) {
  const [size, setSize] = useState(120)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0

    const measure = () => {
      const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-fit]'))
      const widest = Math.max(0, ...lines.map((line) => line.offsetWidth))
      if (!widest || !el.clientWidth) return
      const current = parseFloat(getComputedStyle(el).fontSize) || 120
      const byWidth = (current * el.clientWidth) / widest
      const byHeight = el.clientHeight / (lines.length * lineHeight)
      const next = Math.max(min, Math.floor(Math.min(byWidth, byHeight)))
      setSize((prev) => (Math.abs(prev - next) > 0.5 ? next : prev))
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    measure()
    const observer = new ResizeObserver(schedule)
    observer.observe(el)
    document.fonts?.ready.then(schedule)
    document.fonts?.addEventListener('loadingdone', schedule)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      document.fonts?.removeEventListener('loadingdone', schedule)
    }
  }, [ref, key, lineHeight, min])

  return size
}
