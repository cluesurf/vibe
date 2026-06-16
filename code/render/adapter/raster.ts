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
import { applyModel, modelIsBounded, type ProjectionModel } from '@/code/render/geometry/projection'

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
  // the projection model for a 2D tiling, the same Scene rendered as a Poincare disk, a Klein disk, the upper
  // half-plane, a band, or the Gans plane (3D honeycombs always use the Poincare ball). Default poincare.
  model?: ProjectionModel
}

// render a Scene to a PNG buffer
export function renderSceneToPng(input: RasterOptions): Buffer {
  const { rgba, size } = renderSceneToRgba(input)
  return encodePng(rgba, size, size)
}

// render a Scene to a raw RGBA pixel buffer (size * size * 4), the shared core used by both the PNG encoder
// and the animation encoders. Returns the pixels and the side length.
export function renderSceneToRgba(input: RasterOptions): { rgba: Uint8Array; size: number } {
  const {
    scene, size = DEFAULT_SIZE, margin = DEFAULT_MARGIN, lineWidth = DEFAULT_LINE_WIDTH,
    background = DEFAULT_BACKGROUND, near = DEFAULT_NEAR, far = DEFAULT_FAR,
    rotateX = 0.45, rotateY = 0.6, drawBoundary = true, segments = 24, model = 'poincare',
  } = input

  const rgba = new Uint8Array(size * size * 4)
  for (let i = 0; i < rgba.length; i += 4) { rgba[i] = background[0]; rgba[i + 1] = background[1]; rgba[i + 2] = background[2]; rgba[i + 3] = 255 }
  const half = size / 2
  const threeD = scene.dim >= 3

  // map a ball point to PLANE coordinates plus a depth. A 2D point goes through the chosen projection model. A
  // 3D point is rotated then orthographically projected, with z as depth (higher = nearer the camera).
  const toPlane = (v: Vec): { x: number; y: number; z: number } => {
    if (threeD) {
      let x = v[0] ?? 0, y = v[1] ?? 0, z = v[2] ?? 0
      const cy = Math.cos(rotateY), sy = Math.sin(rotateY)
      const x1 = cy * x + sy * z
      const z1 = -sy * x + cy * z
      const cx = Math.cos(rotateX), sx = Math.sin(rotateX)
      x = x1; y = cx * y - sx * z1; z = sx * y + cx * z1
      return { x, y, z }
    }
    const p = applyModel(v, model)
    return { x: p[0] ?? 0, y: p[1] ?? 0, z: 0 }
  }

  // build the edges as plane-projected geodesic polylines (the geodesic is sampled in BALL space, where it is a
  // true arc, then each sample is mapped through the model, so curves stay curved in every model)
  const drawn = scene.edges.map((e) => {
    const samples = segments > 1 ? geodesicPoints(e.a, e.b, segments) : [e.a, e.b]
    const plane = samples.map(toPlane)
    let depth = 0
    for (const p of plane) depth += p.z
    depth /= plane.length
    let t: number
    if (threeD) t = (depth + 1) / 2 // -1..1 -> 0..1, near (high z) -> 1
    else { const mr = midRadius(e.a, e.b); t = 1 - Math.min(1, mr) } // centre -> 1, boundary -> 0
    return { plane, depth, color: lerp(far, near, t) }
  })

  // build the filled faces, each boundary edge sampled as a geodesic arc and projected through the model, so a
  // cell is bounded by true arcs in every model. Depth is the mean z (for 3D back-to-front fill).
  const faceSegments = Math.max(2, Math.floor(segments / 2))
  const faces = (scene.faces ?? []).map((f) => {
    const boundary: { x: number; y: number; z: number }[] = []
    for (let i = 0; i < f.polygon.length; i++) {
      const a = f.polygon[i]!
      const b = f.polygon[(i + 1) % f.polygon.length]!
      const samples = geodesicPoints(a, b, faceSegments)
      for (let k = 0; k < samples.length - 1; k++) boundary.push(toPlane(samples[k]!))
    }
    let depth = 0
    for (const p of boundary) depth += p.z
    depth /= boundary.length || 1
    return { boundary, depth, color: f.color }
  })

  // fit plane coordinates to the image. Disk models (and the 3D ball) use a fixed unit frame, so they stay
  // centered and circular. Unbounded models (Gans, half-plane, band) fit to the content's bounding box.
  const bounded = threeD || modelIsBounded(model)
  let cx = 0, cy = 0, scale = half * margin
  if (!bounded) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    const include = (x: number, y: number): void => {
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
    for (const d of drawn) for (const p of d.plane) include(p.x, p.y)
    for (const f of faces) for (const p of f.boundary) include(p.x, p.y)
    cx = (minX + maxX) / 2; cy = (minY + maxY) / 2
    const span = Math.max(maxX - minX, maxY - minY) || 1
    scale = (size * margin) / span
  }
  const sx = (x: number): number => half + scale * (x - cx)
  const sy = (y: number): number => half - scale * (y - cy)

  // filled faces first (under the struts), back-to-front so near cells cover far ones in 3D
  faces.sort((p, q) => p.depth - q.depth)
  for (const f of faces) {
    fillPolygon(rgba, size, f.boundary.map((p) => ({ x: sx(p.x), y: sy(p.y) })), f.color)
  }

  if (drawBoundary && (bounded || threeD)) strokeCircle(rgba, size, half, half, half * margin, DEFAULT_BOUNDARY)

  drawn.sort((p, q) => p.depth - q.depth)
  for (const d of drawn) {
    for (let i = 0; i + 1 < d.plane.length; i++) {
      drawLine(rgba, size, sx(d.plane[i]!.x), sy(d.plane[i]!.y), sx(d.plane[i + 1]!.x), sy(d.plane[i + 1]!.y), d.color, lineWidth)
    }
  }

  return { rgba, size }
}

// fill a screen-space polygon by even-odd scanline. The boundary is already a fine arc-sampled polyline.
function fillPolygon(rgba: Uint8Array, size: number, pts: { x: number; y: number }[], color: Rgb): void {
  if (pts.length < 3) return
  let minY = Infinity, maxY = -Infinity
  for (const p of pts) { if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y }
  const y0 = Math.max(0, Math.ceil(minY))
  const y1 = Math.min(size - 1, Math.floor(maxY))
  for (let y = y0; y <= y1; y++) {
    const xs: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!
      const b = pts[(i + 1) % pts.length]!
      const ay = a.y, by = b.y
      if ((ay <= y && by > y) || (by <= y && ay > y)) {
        xs.push(a.x + ((y - ay) / (by - ay)) * (b.x - a.x))
      }
    }
    if (xs.length < 2) continue
    xs.sort((p, q) => p - q)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k]!))
      const xb = Math.min(size - 1, Math.floor(xs[k + 1]!))
      for (let x = xa; x <= xb; x++) {
        const o = (y * size + x) * 4
        rgba[o] = color[0]; rgba[o + 1] = color[1]; rgba[o + 2] = color[2]
      }
    }
  }
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
