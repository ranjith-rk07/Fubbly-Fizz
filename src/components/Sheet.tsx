import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from 'react'
import { useInView } from 'motion/react'
import { PAPER } from '@/data/flavours'

const SheetColor = createContext<(color: string) => void>(() => {})

/** Registers a section so the sheet background morphs to `color` while it crosses the viewport centre. */
export function useSectionColor(ref: RefObject<HTMLElement | null>, color: string) {
  const setColor = useContext(SheetColor)
  const inView = useInView(ref, { margin: '-50% 0px -50% 0px' })
  useEffect(() => {
    if (inView) setColor(color)
  }, [inView, color, setColor])
}

/**
 * The content sheet that slides up over the pinned hero. Its background colour
 * glides between section tints instead of cutting hard between them.
 */
export function Sheet({ children }: { children: ReactNode }) {
  const [color, setColor] = useState(PAPER)
  return (
    <SheetColor.Provider value={setColor}>
      <div
        className="relative z-10 -mt-[100vh] rounded-[36px] shadow-[0_-40px_90px_-30px_rgba(10,20,12,0.45)] transition-[background-color] duration-[1100ms] ease-out md:rounded-[56px]"
        style={{ backgroundColor: color }}
      >
        {children}
      </div>
    </SheetColor.Provider>
  )
}
