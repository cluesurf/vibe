// The node raster renderer adapter.
//
// Takes a renderer-agnostic Scene (see ../scene.ts) and draws it to a PNG buffer on the CPU, with no three.js,
// no DOM, no GPU. This is the BACKEND renderer, the one the validation scripts use to prove the geometry is
// correct without a browser. It handles both a 2D tiling (dim 2, drawn straight to the Poincare disk) and a
// 3D honeycomb (dim 3, rotated, orthographically projected, depth-shaded and depth-sorted so near struts read
// in front of far ones). Other adapters (a three.js / react adapter, a webgpu adapter) will consume the same
// Scene. PNG encoding reuses the existing code/gpu/png helper.

import { encodePng } from '@/code/draw/png'
import type { Scene, Vec } from '@/code/render/scene'
import { geodesicPoints } from '@/code/render/geometry/isometry'

export type Rgb = [number, number, number]

const DEFAULT_SIZE = 1200
const DEFAULT_MARGIN = 0.96
const DEFAULT_LINE_WIDTH = 1.3
const DEFAULT_BACKGROUND: Rgb = [10, 10, 12]
const DEFAULT_NEAR: Rgb = [224, 224, 232] // struts toward the camera / centre, bright
const DEFAULT_FAR: Rgb = [70, 70, 82] // struts toward the boundary, dim
const DEFAULT_BOUNDARY: Rgb = [40, 40, 48]

export type RasterOptions = {
  scene: Scene
  // output image side length in pixels (square)
  size?: number
  // fraction of the half-size the unit ball fills
  margin?: number
  background?: Rgb
  // strut colour near the camera / disk centre, and toward the boundary, lerped per edge
  near?: Rgb
  far?: Rgb
  // strut thickness in pixels
  lineWidth?: number
  // view rotation for a 3D scene, radians (ignored for a 2D tiling)
  rotateX?: number
  rotateY?: number
  // draw the faint circle at infinity
  drawBoundary?: boolean
  // segments per edge, 1 draws a straight chord, higher draws the TRUE geodesic as a curved arc. A hyperbolic
  // geodesic is a circular arc in the Poincare model, so curves are needed for a faithful tiling.
  segments?: number
}

// render a Scene to a PNG buffer
export function renderSceneToPng(input: RasterOptions): Buffer {
  const {
    scene, size = DEFAULT_SIZE, margin = DEFAULT_MARGIN, lineWidth = DEFAULT_LINE_WIDTH,
    background = DEFAULT_BACKGROUND, near = DEFAULT_NEAR, far = DEFAULT_FAR,
    rotateX = 0.45, rotateY = 0.6, drawBoundary = true, segments = 24,
  } = input

  const rgba = new Uint8Array(size * size * 4)
  for (let i = 0; i < rgba.length; i += 4) { rgba[i] = background[0]; rgba[i + 1] = background[1]; rgba[i + 2] = background[2]; rgba[i + 3] = 255 }
  const half = size / 2
  const scale = half * margin

  // project a ball point to (screen x, screen y, depth). a 2D point projects straight, a 3D point is rotated
  // then orthographically projected, with z as depth (higher = nearer the camera).
  const project = (v: Vec): { x: number; y: number; z: number } => {
    let x = v[0] ?? 0, y = v[1] ?? 0, z = v[2] ?? 0
    if (scene.dim >= 3) {
      // rotate around y, then x
      const cy = Math.cos(rotateY), sy = Math.sin(rotateY)
      const x1 = cy * x + sy * z
      const z1 = -sy * x + cy * z
      const cx = Math.cos(rotateX), sx = Math.sin(rotateX)
      const y1 = cx * y - sx * z1
      const z2 = sx * y + cx * z1
      x = x1; y = y1; z = z2
    }
    return { x: half + scale * x, y: half - scale * y, z }
  }

  if (drawBoundary) strokeCircle(rgba, size, half, half, scale, DEFAULT_BOUNDARY)

  // build projected edges (as geodesic polylines) with a depth, then draw far-first so near struts land on
  // top (3D occlusion feel)
  const drawn = scene.edges.map((e) => {
    const samples = segments > 1 ? geodesicPoints(e.a, e.b, segments) : [e.a, e.b]
    const pts = samples.map(project)
    let depth = 0
    for (const p of pts) depth += p.z
    depth /= pts.length
    // shade by depth for 3D, by ball radius of the midpoint for 2D
    let t: number
    if (scene.dim >= 3) t = (depth + 1) / 2 // -1..1 -> 0..1, near (high z) -> 1
    else { const mr = midRadius(e.a, e.b); t = 1 - Math.min(1, mr) } // centre -> 1, boundary -> 0
    return { pts, depth, color: lerp(far, near, t) }
  })
  drawn.sort((p, q) => p.depth - q.depth)
  for (const d of drawn) {
    for (let i = 0; i + 1 < d.pts.length; i++) {
      drawLine(rgba, size, d.pts[i]!.x, d.pts[i]!.y, d.pts[i + 1]!.x, d.pts[i + 1]!.y, d.color, lineWidth)
    }
  }

  return encodePng(rgba, size, size)
}

function midRadius(a: Vec, b: Vec): number {
  let s = 0
  for (let i = 0; i < a.length; i++) { const m = (a[i]! + b[i]!) / 2; s += m * m }
  return Math.sqrt(s)
}

function lerp(a: Rgb, b: Rgb, t: number): Rgb {
  const u = Math.max(0, Math.min(1, t))
  return [Math.round(a[0] + (b[0] - a[0]) * u), Math.round(a[1] + (b[1] - a[1]) * u), Math.round(a[2] + (b[2] - a[2]) * u)]
}

// stamp a thick line between two screen points, a small filled disc swept along the segment
function drawLine(rgba: Uint8Array, size: number, x0: number, y0: number, x1: number, y1: number, color: Rgb, width: number): void {
  const dx = x1 - x0, dy = y1 - y0
  const len = Math.hypot(dx, dy)
  const steps = Math.max(1, Math.ceil(len))
  const rad = Math.max(0.6, width / 2)
  const r0 = Math.floor(rad)
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const cx = x0 + dx * t, cy = y0 + dy * t
    for (let oy = -r0; oy <= r0; oy++) for (let ox = -r0; ox <= r0; ox++) {
      if (ox * ox + oy * oy > rad * rad) continue
      const px = Math.round(cx) + ox, py = Math.round(cy) + oy
      if (px < 0 || px >= size || py < 0 || py >= size) continue
      const o = (py * size + px) * 4
      rgba[o] = color[0]; rgba[o + 1] = color[1]; rgba[o + 2] = color[2]
    }
  }
}

// stroke a faint circle (the boundary at infinity)
function strokeCircle(rgba: Uint8Array, size: number, cx: number, cy: number, r: number, color: Rgb): void {
  const steps = Math.ceil(2 * Math.PI * r)
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * 2 * Math.PI
    const px = Math.round(cx + r * Math.cos(th)), py = Math.round(cy + r * Math.sin(th))
    if (px < 0 || px >= size || py < 0 || py >= size) continue
    const o = (py * size + px) * 4
    rgba[o] = color[0]; rgba[o + 1] = color[1]; rgba[o + 2] = color[2]
  }
}
