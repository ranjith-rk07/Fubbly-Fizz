export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Normalised position of `v` between `a` and `b`, clamped to 0..1. */
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInCubic = (t: number) => t * t * t
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Motion-style cubic bezier for `transition.ease`. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const

/**
 * Interpolates through (stops[i], values[i]) with a smoothstep inside each segment,
 * so motion eases in and out of every keyframe. Clamps outside the stops.
 */
export function keyframes(v: number, stops: readonly number[], values: readonly number[]) {
  const last = stops.length - 1
  if (v <= stops[0]) return values[0]
  if (v >= stops[last]) return values[last]
  let i = 1
  while (v > stops[i]) i++
  const t = smoothstep((v - stops[i - 1]) / (stops[i] - stops[i - 1]))
  return values[i - 1] + (values[i] - values[i - 1]) * t
}

export function wrap(min: number, max: number, v: number) {
  const span = max - min
  return ((((v - min) % span) + span) % span) + min
}

/** Small deterministic PRNG so decorative randomness is stable between renders. */
export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')
