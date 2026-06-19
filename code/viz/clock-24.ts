// The 24-clock, two concentric rings of 12 radial tick-bars (12 outer nodes, 12 inner nodes, hence 24),
// with 12 faint spokes from the centre. The outer ring is dark, the inner ring lighter, the spokes lightest,
// in shades of Tailwind zinc, on a transparent background. Same minimal style as curvature.ts.
//
// Writes make/24-clock.svg. Run: npx tsx code/viz/clock-24.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// Tailwind zinc palette
const ZINC = {
  300: '#d4d4d8',
  400: '#a1a1aa',
  700: '#3f3f46',
  800: '#27272a',
}

const W = 1000
const CX = W / 2
const CY = W / 2
const R_OUT = 415
const R_IN = 207
const COUNT = 12

// position i sits at i * 30 degrees clockwise from the top (12 o'clock)
const angleDeg = (i: number): number => i * (360 / COUNT) - 90
const onCircle = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

// a radial tick-bar: a rounded rectangle of length `len` (along the radius) and width `wid` (tangential),
// centred on the circle at radius `r` and angle `deg`, rotated so its long axis is radial.
function tick(
  r: number,
  deg: number,
  len: number,
  wid: number,
  fill: string,
): string {
  const [px, py] = onCircle(r, deg)
  const rx = Math.min(wid, len) * 0.35
  return (
    `<rect x="${(px - len / 2).toFixed(2)}" y="${(py - wid / 2).toFixed(2)}" ` +
    `width="${len}" height="${wid}" rx="${rx.toFixed(2)}" fill="${fill}" ` +
    `transform="rotate(${deg.toFixed(2)} ${px.toFixed(2)} ${py.toFixed(2)})"/>`
  )
}

function buildSvg(): string {
  const parts: string[] = []

  // 12 spokes, centre to the outer ring (drawn first, behind)
  for (let i = 0; i < COUNT; i++) {
    const [ox, oy] = onCircle(R_OUT, angleDeg(i))
    parts.push(
      `<line x1="${CX}" y1="${CY}" x2="${ox.toFixed(2)}" y2="${oy.toFixed(2)}" ` +
        `stroke="${ZINC[300]}" stroke-width="1"/>`,
    )
  }

  // the two rings
  parts.push(
    `<circle cx="${CX}" cy="${CY}" r="${R_IN}" fill="none" stroke="${ZINC[400]}" stroke-width="1.4"/>`,
  )
  parts.push(
    `<circle cx="${CX}" cy="${CY}" r="${R_OUT}" fill="none" stroke="${ZINC[700]}" stroke-width="2.5"/>`,
  )

  // 12 inner ticks (lighter, smaller), then 12 outer ticks (dark, larger), on top
  for (let i = 0; i < COUNT; i++)
    parts.push(tick(R_IN, angleDeg(i), 30, 11, ZINC[400]))
  for (let i = 0; i < COUNT; i++)
    parts.push(tick(R_OUT, angleDeg(i), 46, 15, ZINC[800]))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">
  ${parts.join('\n  ')}
</svg>
`
}

function main(): void {
  const out =
    '/Users/lancepollard/base/crew/cluesurf/deck/vibe/make/24-clock.svg'
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, buildSvg())
  console.log(`wrote ${out}`)
}

main()
