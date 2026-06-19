// Minimal visualization of the three curvatures, spherical (positive), Euclidean (flat), and hyperbolic
// (negative), as the gist-of-curvature geodesic triangle. On a positively curved surface a triangle's sides
// bow OUTWARD, on a flat surface they are straight, on a negatively curved surface they cave INWARD. Each
// is written as its own minimal SVG, just the three sides, the three vertices, and an inner shade, with no
// background, disc, or text. Drawn in shades of Tailwind zinc.
//
// Writes make/curvature-{spherical,euclidean,hyperbolic}.svg. Run: npx tsx code/viz/curvature.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// Tailwind zinc palette
const ZINC = {
  300: '#d4d4d8',
  800: '#27272a',
  900: '#18181b',
}

type Pt = [number, number]

// a triangle whose sides are quadratic Beziers bowing outward (bulge > 0), straight (bulge = 0), or inward
// (bulge < 0) by `bulge` pixels relative to the centroid. Returns an SVG path string.
function curvedTriangle(
  center: Pt,
  size: number,
  bulge: number,
): string {
  const verts = triVerts(center, size)
  const centroid: Pt = [
    (verts[0][0] + verts[1][0] + verts[2][0]) / 3,
    (verts[0][1] + verts[1][1] + verts[2][1]) / 3,
  ]
  const edges: [Pt, Pt][] = [
    [verts[0], verts[1]],
    [verts[1], verts[2]],
    [verts[2], verts[0]],
  ]
  let d = `M ${verts[0][0]} ${verts[0][1]} `
  for (const [a, b] of edges) {
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    const ox = mid[0] - centroid[0]
    const oy = mid[1] - centroid[1]
    const len = Math.hypot(ox, oy) || 1
    const ctrl: Pt = [
      mid[0] + (ox / len) * bulge,
      mid[1] + (oy / len) * bulge,
    ]
    d += `Q ${ctrl[0].toFixed(1)} ${ctrl[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)} `
  }

  return d + 'Z'
}

function triVerts(center: Pt, size: number): [Pt, Pt, Pt] {
  const [cx, cy] = center

  return [
    [cx, cy - size], // top
    [cx - size * 0.92, cy + size * 0.72], // bottom-left
    [cx + size * 0.92, cy + size * 0.72], // bottom-right
  ]
}

function vertexDots(center: Pt, size: number): string {
  return triVerts(center, size)
    .map(
      ([x, y]) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${ZINC[900]}"/>`,
    )
    .join('')
}

function buildSvg(bulge: number): string {
  const w = 240
  const h = 220
  const center: Pt = [w / 2, 110]
  const size = 84
  const tri = curvedTriangle(center, size, bulge)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path d="${tri}" fill="${ZINC[300]}" fill-opacity="0.55" stroke="${ZINC[800]}" stroke-width="3.5" stroke-linejoin="round"/>
  ${vertexDots(center, size)}
</svg>
`
}

function main(): void {
  const dir = '/Users/lancepollard/base/crew/cluesurf/deck/vibe/make'
  const panels: { name: string; bulge: number }[] = [
    { name: 'spherical', bulge: 24 }, // positive curvature, sides bow outward
    { name: 'euclidean', bulge: 0 }, // flat, straight sides
    { name: 'hyperbolic', bulge: -20 }, // negative curvature, sides cave inward
  ]
  for (const p of panels) {
    const out = `${dir}/curvature-${p.name}.svg`
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, buildSvg(p.bulge))
    console.log(`wrote ${out}`)
  }
}

main()
