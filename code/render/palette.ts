// The reference colour palette for every renderer (PNG, GIF, the WebGPU React view, ...). The favoured hues,
// in order, are violet, emerald, blue, rose, yellow, with zinc as the neutral default. Values are the canonical
// Tailwind CSS stops (50 -> 950). Each colour is given as a hex string and as a normalized [r, g, b] in 0..1
// (what a shader or the rasterizer wants), so a renderer never hard-codes a colour, it reads one from here.
//
// Tailwind ships eleven stops per hue (50, 100, 200, ..., 900, 950). For a finer ramp use `shade(hue, t)` with
// t in 0..1, which linearly interpolates between the canonical stops, giving effective 50-unit (or any) steps.

export type Shade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950
export type Hue =
  | 'violet'
  | 'emerald'
  | 'blue'
  | 'rose'
  | 'yellow'
  | 'zinc'

// the preference order, violet first; zinc is the neutral default rather than a "favourite"
export const HUE_ORDER: Hue[] = [
  'violet',
  'emerald',
  'blue',
  'rose',
  'yellow',
]
export const DEFAULT_HUE: Hue = 'zinc'

export const SHADES: Shade[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
]

// the canonical Tailwind hex stops
export const PALETTE_HEX: Record<Hue, Record<Shade, string>> = {
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
}

// a hex string to a normalized [r, g, b] in 0..1
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '')

  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

// a hex string to an integer [r, g, b] in 0..255 (the rasterizer's Rgb)
export function hexToRgb255(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb01(hex)

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// the full palette pre-converted to normalized [r, g, b], the form a shader uniform or the rasterizer reads
export const PALETTE_RGB01: Record<
  Hue,
  Record<Shade, [number, number, number]>
> = Object.fromEntries(
  (Object.keys(PALETTE_HEX) as Hue[]).map(hue => [
    hue,
    Object.fromEntries(
      SHADES.map(s => [s, hexToRgb01(PALETTE_HEX[hue][s])]),
    ) as Record<Shade, [number, number, number]>,
  ]),
) as Record<Hue, Record<Shade, [number, number, number]>>

// a continuous shade: t in 0..1 maps across the eleven stops (t=0 -> 50, t=1 -> 950), linearly interpolated, so
// any number of steps (including 50-unit) can be sampled from the canonical ramp.
export function shade(hue: Hue, t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t))
  const span = SHADES.length - 1
  const x = clamped * span
  const lo = Math.floor(x)
  const hi = Math.min(span, lo + 1)
  const frac = x - lo
  const a = PALETTE_RGB01[hue][SHADES[lo]!]
  const b = PALETTE_RGB01[hue][SHADES[hi]!]

  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ]
}
