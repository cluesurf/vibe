// Shared helpers for the tiling computation animations (the unary token machine and the binary 64-bit machine).
// Both lay registers out as angular wedges of a {7,3} tiling, draw faint cell outlines, and stamp a number that
// fits inside the central heptagon, so the drawing code lives here once.

import type { SceneEdge, Vec } from '@/code/render/scene'

// the deduplicated boundary edges of all cell polygons, drawn faintly under the coloured faces
export function cellOutlines(polygons: Vec[][]): SceneEdge[] {
  const edges: SceneEdge[] = []
  const seen = new Set<string>()

  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!
      const b = poly[(i + 1) % poly.length]!
      const ka = a.map(x => Math.round(x * 1e4)).join(',')
      const kb = b.map(x => Math.round(x * 1e4)).join(',')
      const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`

      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      edges.push({ a, b })
    }
  }

  return edges
}

// assign cells to `count` angular wedges (skipping the central cell 0, kept for the number), each ordered by
// radius so a register track grows outward from the centre
export function layoutWedges(
  centers: Vec[],
  count: number,
): number[][] {
  const wedges: { cell: number; radius: number }[][] = Array.from(
    { length: count },
    () => [],
  )

  for (let cell = 1; cell < centers.length; cell++) {
    const x = centers[cell]![0] ?? 0
    const y = centers[cell]![1] ?? 0
    const angle = Math.atan2(y, x) + Math.PI // 0..2pi
    const w = Math.min(
      count - 1,
      Math.floor((angle / (2 * Math.PI)) * count),
    )

    wedges[w]!.push({ cell, radius: Math.hypot(x, y) })
  }

  return wedges.map(list =>
    list.sort((p, q) => p.radius - q.radius).map(e => e.cell),
  )
}

// draw a number fitted INSIDE the central heptagon. The raster maps a ball point b to the pixel
// half + (half*margin)*b (the bounded Poincare frame), so the central tile's incircle in pixels is its ball
// inradius times that scale. The digits are sized to a fraction of that incircle, with a soft shadow for
// legibility over whatever colour the central tile carries.
export function drawCentralNumber(input: {
  rgba: Uint8Array
  size: number
  margin: number
  centralPolygon: Vec[]
  text: string
  fillFraction?: number
  color?: [number, number, number]
}): void {
  const { rgba, size, margin, centralPolygon, text } = input
  const fillFraction = input.fillFraction ?? 0.75
  const color = input.color ?? [245, 245, 248]

  let bx = 0,
    by = 0

  for (const v of centralPolygon) {
    bx += v[0] ?? 0
    by += v[1] ?? 0
  }

  bx /= centralPolygon.length
  by /= centralPolygon.length

  let inradiusBall = Infinity

  for (let i = 0; i < centralPolygon.length; i++) {
    const a = centralPolygon[i]!,
      b = centralPolygon[(i + 1) % centralPolygon.length]!

    const mx = ((a[0] ?? 0) + (b[0] ?? 0)) / 2 - bx
    const my = ((a[1] ?? 0) + (b[1] ?? 0)) / 2 - by
    inradiusBall = Math.min(inradiusBall, Math.hypot(mx, my))
  }

  const scalePx = (size / 2) * margin
  const centerX = size / 2 + scalePx * bx
  const centerY = size / 2 - scalePx * by
  const inPx = inradiusBall * scalePx

  const len = text.length
  const scale = Math.max(
    2,
    Math.floor(
      fillFraction *
        Math.min((inPx * 1.05) / 7, (inPx * 1.5) / (6 * len - 1)),
    ),
  )

  const shadow = Math.max(2, scale * 0.18)
  drawNumber(
    rgba,
    size,
    centerX + shadow,
    centerY + shadow,
    text,
    scale,
    [12, 12, 16],
  )
  drawNumber(rgba, size, centerX, centerY, text, scale, color)
}

// a tiny 5x7 bitmap font for the centre number
const FONT: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
}

function drawNumber(
  rgba: Uint8Array,
  size: number,
  centerX: number,
  centerY: number,
  text: string,
  scale: number,
  color: [number, number, number],
): void {
  const glyphW = 5 * scale
  const gap = scale
  const totalW = text.length * glyphW + (text.length - 1) * gap
  const x0 = Math.round(centerX - totalW / 2)
  const y0 = Math.round(centerY - (7 * scale) / 2)

  for (let d = 0; d < text.length; d++) {
    const rows = FONT[text[d]!]

    if (!rows) {
      continue
    }

    const gx = x0 + d * (glyphW + gap)

    for (let ry = 0; ry < 7; ry++) {
      for (let rx = 0; rx < 5; rx++) {
        if (rows[ry]![rx] !== '1') {
          continue
        }

        fillRect(
          rgba,
          size,
          gx + rx * scale,
          y0 + ry * scale,
          scale,
          scale,
          color,
        )
      }
    }
  }
}

function fillRect(
  rgba: Uint8Array,
  size: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: [number, number, number],
): void {
  for (let yy = y; yy < y + h; yy++) {
    if (yy < 0 || yy >= size) {
      continue
    }

    for (let xx = x; xx < x + w; xx++) {
      if (xx < 0 || xx >= size) {
        continue
      }

      const o = (yy * size + xx) * 4
      rgba[o] = color[0]
      rgba[o + 1] = color[1]
      rgba[o + 2] = color[2]
      rgba[o + 3] = 255
    }
  }
}
