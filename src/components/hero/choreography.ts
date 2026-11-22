import { easeInOutSine, range } from '@/lib/math'

/** Height of the hero scroll track, in viewport heights. */
export const TRACK_VH = 480

/**
 * Share of the pinned scroll spent on the flavour sequence. The final viewport of the track
 * is reserved for the content sheet sliding up over the stage.
 */
export const SEQ_END = (TRACK_VH - 200) / (TRACK_VH - 100)

// Hold → transition → hold → transition → hold, as fractions of the sequence.
const STOPS = [0, 0.1, 0.42, 0.56, 0.88, 1].map((v) => v * SEQ_END)

/** Progress where each flavour is fully settled; used for the switcher and snapping. */
export const REST_P = [0, 0.44 * SEQ_END, 0.9 * SEQ_END]

/** Maps pinned scroll progress (0..1) to a continuous flavour position (0..2). */
export function progressToFlavour(p: number) {
  if (p <= STOPS[1]) return 0
  if (p < STOPS[2]) return easeInOutSine(range(p, STOPS[1], STOPS[2]))
  if (p <= STOPS[3]) return 1
  if (p < STOPS[4]) return 1 + easeInOutSine(range(p, STOPS[3], STOPS[4]))
  return 2
}
