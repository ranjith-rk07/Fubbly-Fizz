import { useId, useMemo, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn, EASE_OUT_EXPO, mulberry32 } from '@/lib/math'

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 10h11.5M10.5 5 15.5 10l-5 5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 0c.9 6.4 5.6 11.1 12 12-6.4.9-11.1 5.6-12 12-.9-6.4-5.6-11.1-12-12C6.4 11.1 11.1 6.4 12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Fades and lifts its content in once it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Masked line-by-line rise. The viewport trigger sits on the wrapper because the lines start clipped. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: ReactNode[]
  className?: string
  lineClassName?: string
  delay?: number
}) {
  return (
    <motion.span
      className={cn('block', className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
    >
      {lines.map((line, k) => (
        <span key={k} className={cn('-mb-[0.2em] block overflow-hidden pb-[0.2em]', lineClassName)}>
          <motion.span
            className="block"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              shown: { y: '0%', rotate: 0, transition: { duration: 1.05, ease: EASE_OUT_EXPO, delay: delay + k * 0.09 } },
            }}
            style={{ transformOrigin: '0% 100%' }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Circular sticker with a slowly spinning text ring. */
export function SpinBadge({
  text,
  bg,
  color,
  center,
  className,
}: {
  text: string
  bg: string
  color: string
  center?: ReactNode
  className?: string
}) {
  const id = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const ring = `${text} • ${text} • `.toUpperCase()
  return (
    <div className={cn('relative aspect-square', className)} aria-hidden="true">
      <div className="absolute inset-0 rounded-full shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)]" style={{ backgroundColor: bg }} />
      <div className="absolute inset-[7%] rounded-full border border-dashed opacity-40" style={{ borderColor: color }} />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id={id} d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" />
        </defs>
        <text fill={color} fontSize="17" fontWeight="760" letterSpacing="2.5" style={{ fontStretch: '90%' }}>
          <textPath href={`#${id}`} textLength="438" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 grid place-items-center" style={{ color }}>
        {center}
      </div>
    </div>
  )
}

/** Rising carbonation bubbles (pure CSS animation, disabled for reduced motion). */
export function Bubbles({ count = 24, seed = 3, className }: { count?: number; seed?: number; className?: string }) {
  const items = useMemo(() => {
    const rnd = mulberry32(seed)
    return Array.from({ length: count }, () => ({
      left: rnd() * 100,
      size: 4 + Math.pow(rnd(), 2.2) * 22,
      duration: 7 + rnd() * 10,
      delay: -rnd() * 17,
      sway: 2.2 + rnd() * 2.8,
      opacity: 0.35 + rnd() * 0.55,
    }))
  }, [count, seed])

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {items.map((b, k) => (
        <span
          key={k}
          className="bubble"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              '--o': b.opacity,
            } as CSSProperties
          }
        >
          <span style={{ animationDuration: `${b.sway}s` }} />
        </span>
      ))}
    </div>
  )
}

export function Grain() {
  return <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[70] opacity-[0.045]" />
}

/** Rounded-square lattice taken from the can artwork. */
export const GRID_PATTERN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect x='5' y='5' width='110' height='110' rx='24' fill='none' stroke='black' stroke-opacity='0.13' stroke-width='2'/></svg>")`
