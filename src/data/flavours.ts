import canMango from '@/assets/can-raw-mango.webp'
import canJeera from '@/assets/can-jeera.webp'
import canMasala from '@/assets/can-masala.webp'
import mangoWedges from '@/assets/raw-mango-wedges.webp'
import cuminCluster from '@/assets/cumin-cluster.webp'
import cuminSeed from '@/assets/cumin-seed.webp'
import masalaSpices from '@/assets/masala-spices.webp'

export type FlavourId = 'raw-mango' | 'jeera' | 'masala'

export type Palette = {
  /** Signature background (matches the can body). */
  bg: string
  /** Highlight used for glows behind the product. */
  light: string
  /** Deeper shade for vignettes. */
  deep: string
  /** Text colour on top of `bg` and `pale`. */
  ink: string
  /** Soft tint for reading surfaces. */
  pale: string
  /** Logo colour on the can. */
  accent: string
  /** Sticker colour. */
  badge: string
}

/** Ingredient around the hero can. x / y / size are multiples of the can height. */
export type HeroPiece = {
  src: string
  x: number
  y: number
  size: number
  rotate: number
  /** Parallax depth: <1 sits behind, >1 rushes past the camera. */
  depth: number
  blur?: number
  front?: boolean
  flip?: boolean
  /** Hidden on portrait screens where it would fall off the edge. */
  wideOnly?: boolean
}

/** Ingredient inside a tasting-note stage, positioned in % of the stage. */
export type StagePiece = {
  src: string
  left: number
  top: number
  width: number
  rotate: number
  blur?: number
  front?: boolean
  flip?: boolean
  /** Scroll parallax strength. */
  speed: number
}

export type Flavour = {
  id: FlavourId
  index: string
  name: string
  nameLines: string[]
  heroLines: string[]
  native: string
  nativeRoman: string
  mood: string
  ghost: string
  tagline: string
  heroSub: string
  description: string
  ingredient: string
  finish: string
  pairsWith: string
  profile: { label: string; value: number }[]
  can: string
  palette: Palette
  heroPieces: HeroPiece[]
  stagePieces: StagePiece[]
}

export const PAPER = '#f6f4ea'
export const SKY_PALE = '#e6eef5'

export const FLAVOURS: Flavour[] = [
  {
    id: 'raw-mango',
    index: '01',
    name: 'Raw Mango',
    nameLines: ['Raw', 'Mango'],
    heroLines: ['RAW', 'MANGO'],
    native: 'कच्चा आम',
    nativeRoman: 'kachcha aam',
    mood: 'Tangy & bright',
    ghost: 'Tangy.',
    tagline: 'Tang with a kick.',
    heroSub: 'Sharp kachcha aam meets a lively, crisp fizz.',
    description:
      'That first bite of kachcha aam. Sharp raw mango meets a lively fizz that keeps the finish crisp.',
    ingredient: 'Raw mango',
    finish: 'Tart, then crisp',
    pairsWith: 'Chaat & sunny afternoons',
    profile: [
      { label: 'Tangy', value: 5 },
      { label: 'Earthy', value: 1 },
      { label: 'Spiced', value: 2 },
      { label: 'Sweet', value: 2 },
    ],
    can: canMango,
    palette: {
      bg: '#c8e95a',
      light: '#ecf9b4',
      deep: '#9fca38',
      ink: '#1d3a1e',
      pale: '#eef4cf',
      accent: '#e0157a',
      badge: '#f28dc4',
    },
    heroPieces: [
      { src: mangoWedges, x: 0.42, y: 0.12, size: 0.5, rotate: -6, depth: 1.25, front: true },
      { src: mangoWedges, x: -0.62, y: -0.02, size: 0.25, rotate: 28, depth: 0.75, blur: 1 },
      { src: mangoWedges, x: 0.6, y: -0.37, size: 0.24, rotate: -32, depth: 0.85, blur: 0.5, flip: true },
      { src: mangoWedges, x: -1.02, y: -0.5, size: 0.12, rotate: 50, depth: 0.5, blur: 3, wideOnly: true },
      { src: mangoWedges, x: 1.2, y: 0.28, size: 0.3, rotate: 18, depth: 1.8, blur: 7, front: true, wideOnly: true },
    ],
    stagePieces: [
      { src: mangoWedges, left: 67, top: 68, width: 40, rotate: -6, front: true, speed: 1 },
      { src: mangoWedges, left: 17, top: 23, width: 17, rotate: 32, blur: 2, speed: 0.5 },
      { src: mangoWedges, left: 86, top: 15, width: 12, rotate: -40, blur: 3.5, speed: 0.3, flip: true },
    ],
  },
  {
    id: 'jeera',
    index: '02',
    name: 'Jeera',
    nameLines: ['Jeera'],
    heroLines: ['JEERA'],
    native: 'जीरा',
    nativeRoman: 'jeera',
    mood: 'Earthy & savoury',
    ghost: 'Earthy.',
    tagline: 'Earthy to the last sip.',
    heroSub: 'Earthy cumin with a cool, savoury finish.',
    description:
      'A familiar jeera kick, straight from the first sip. Cumin brings an earthy, savoury note that lingers as the bubbles settle.',
    ingredient: 'Cumin (jeera)',
    finish: 'Warm and savoury',
    pairsWith: 'Rajma chawal & long lunches',
    profile: [
      { label: 'Tangy', value: 2 },
      { label: 'Earthy', value: 5 },
      { label: 'Spiced', value: 3 },
      { label: 'Sweet', value: 1 },
    ],
    can: canJeera,
    palette: {
      bg: '#ffc24b',
      light: '#ffe8a8',
      deep: '#f09f22',
      ink: '#4a2711',
      pale: '#fff0c9',
      accent: '#e8462d',
      badge: '#ff8463',
    },
    heroPieces: [
      { src: cuminCluster, x: 0.4, y: 0.16, size: 0.46, rotate: 4, depth: 1.25, front: true },
      { src: cuminCluster, x: -0.62, y: -0.14, size: 0.26, rotate: 150, depth: 0.75, blur: 1.5 },
      { src: cuminSeed, x: -0.44, y: 0.34, size: 0.075, rotate: 35, depth: 1.1, front: true },
      { src: cuminSeed, x: 0.6, y: -0.34, size: 0.07, rotate: -50, depth: 0.9 },
      { src: cuminSeed, x: -0.82, y: 0.08, size: 0.06, rotate: 80, depth: 0.7, blur: 1.5 },
      { src: cuminSeed, x: 0.24, y: -0.6, size: 0.055, rotate: 15, depth: 0.7, blur: 1 },
      { src: cuminSeed, x: -0.36, y: -0.52, size: 0.05, rotate: -20, depth: 0.6, blur: 2 },
      { src: cuminSeed, x: 0.98, y: 0.1, size: 0.07, rotate: 110, depth: 0.85, blur: 1, wideOnly: true },
      { src: cuminSeed, x: 1.18, y: 0.34, size: 0.12, rotate: -35, depth: 1.8, blur: 3, front: true, wideOnly: true },
      { src: cuminSeed, x: -1.05, y: -0.38, size: 0.09, rotate: 60, depth: 1.6, blur: 2.5, front: true, wideOnly: true },
    ],
    stagePieces: [
      { src: cuminCluster, left: 68, top: 70, width: 38, rotate: 0, front: true, speed: 1 },
      { src: cuminSeed, left: 18, top: 27, width: 6, rotate: 40, speed: 0.6 },
      { src: cuminSeed, left: 83, top: 19, width: 5, rotate: -30, blur: 1.5, speed: 0.4 },
      { src: cuminSeed, left: 40, top: 88, width: 7, rotate: 80, blur: 2.5, speed: 0.8, front: true },
      { src: cuminSeed, left: 90, top: 47, width: 4.5, rotate: 10, blur: 1, speed: 0.5 },
      { src: cuminCluster, left: 14, top: 60, width: 14, rotate: 120, blur: 2, speed: 0.3 },
    ],
  },
  {
    id: 'masala',
    index: '03',
    name: 'Masala',
    nameLines: ['Masala'],
    heroLines: ['MASALA'],
    native: 'मसाला',
    nativeRoman: 'masala',
    mood: 'Warm & spiced',
    ghost: 'Spiced.',
    tagline: 'Warmth in every bubble.',
    heroSub: 'Bright bubbles first, then a slow, warm spice.',
    description:
      'The first sip is bright and fizzy. The warmth of masala lingers a little longer. Reach for the red can when you’re in the mood for spice.',
    ingredient: 'Masala spices',
    finish: 'Warm and spiced',
    pairsWith: 'Pakoras & monsoon evenings',
    profile: [
      { label: 'Tangy', value: 2 },
      { label: 'Earthy', value: 3 },
      { label: 'Spiced', value: 5 },
      { label: 'Sweet', value: 1 },
    ],
    can: canMasala,
    palette: {
      bg: '#ff7b66',
      light: '#ffc3b3',
      deep: '#ea5640',
      ink: '#4a1c1f',
      pale: '#ffe3da',
      accent: '#3a93d2',
      badge: '#86c9ef',
    },
    heroPieces: [
      { src: masalaSpices, x: 0.42, y: 0.18, size: 0.48, rotate: -6, depth: 1.25, front: true },
      { src: masalaSpices, x: -0.64, y: -0.1, size: 0.26, rotate: -40, depth: 0.75, blur: 1.2, flip: true },
      { src: masalaSpices, x: 0.6, y: -0.4, size: 0.2, rotate: 55, depth: 0.85, blur: 1.5 },
      { src: cuminSeed, x: -0.4, y: 0.4, size: 0.06, rotate: 30, depth: 1.05, front: true },
      { src: cuminSeed, x: 0.2, y: -0.62, size: 0.05, rotate: -15, depth: 0.7, blur: 1.5 },
      { src: masalaSpices, x: -1.0, y: -0.5, size: 0.12, rotate: 20, depth: 0.5, blur: 3, wideOnly: true },
      { src: cuminSeed, x: 0.96, y: 0.06, size: 0.065, rotate: -70, depth: 0.85, wideOnly: true },
      { src: masalaSpices, x: 1.18, y: 0.34, size: 0.26, rotate: 15, depth: 1.8, blur: 7, front: true, wideOnly: true },
    ],
    stagePieces: [
      { src: masalaSpices, left: 67, top: 69, width: 38, rotate: -4, front: true, speed: 1 },
      { src: masalaSpices, left: 16, top: 24, width: 16, rotate: -35, blur: 2, speed: 0.5, flip: true },
      { src: masalaSpices, left: 87, top: 17, width: 11, rotate: 50, blur: 3, speed: 0.3 },
      { src: cuminSeed, left: 42, top: 88, width: 6, rotate: 30, blur: 2, speed: 0.8, front: true },
    ],
  },
]
