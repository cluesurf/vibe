// The virtualized walking camera, HyperRogue's (View, centerover) with virtualRebase, made dimension-general.
//
// The trick that makes it cheap and infinite: a regular tessellation looks IDENTICAL from every cell, so the
// patch of cells within a fixed radius of the camera is always the same congruent set in camera-relative
// coordinates. We compute that bounded window ONCE and reuse it forever. Walking is a smooth Mobius glide from
// the current cell center toward a neighbor center. When the glide crosses the cell boundary we REBASE, the
// neighbor becomes the new origin and the camera coordinates reset to small, so coordinates never drift toward
// the floating-point wall no matter how far you walk. Memory is O(window), not O(distance). This works the same
// in 2D, 3D, and 4D (any buildable symbol), because it is all reflection-matrix math through the shared frame.
// See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import {
  buildCellShape,
  type CellShape,
} from '@/code/render/geometry/cell-shape'
import {
  Mat,
  matMul,
  matVec,
  toPoincare,
  pointKey,
  identity,
} from '@/code/substrate/coxeter/minkowski'
import {
  mobiusAdd,
  negate,
  gyroScale,
} from '@/code/render/geometry/isometry'
import type { Scene, SceneEdge, Vec } from '@/code/render/scene'

export interface CameraOptions {
  // the Schlafli symbol, e.g. [7,3] or [5,3,4]
  symbol: number[]
  // the window radius as a Poincare-ball norm cutoff (cells whose center is beyond this are not held), the
  // bounded working set. Larger shows more at once and costs more.
  windowNorm?: number
}

export class Camera {
  readonly symbol: number[]
  private readonly shape: CellShape
  private readonly faces: Mat[]
  private readonly c0: Vec
  private readonly timeAxis: number
  private readonly windowNorm: number
  // the fixed camera-relative window, the cell isometries within windowNorm of the origin (index 0 = center)
  private readonly window: Mat[]
  // the p neighbor-center directions from the central cell, and the "go straight" face map
  private readonly faceCenters: Vec[]
  private readonly straightAhead: number[]
  // the current walk state, gliding across face `forwardFace`, a fraction `t` of the way
  private forwardFace: number
  private t = 0

  constructor(input: CameraOptions) {
    this.symbol = input.symbol.slice()
    this.windowNorm = input.windowNorm ?? 0.9
    this.shape = buildCellShape(input.symbol)

    const frame = this.shape.frame
    this.faces = frame.faces
    this.c0 = frame.center
    this.timeAxis = frame.timeAxis
    this.window = this.buildWindow()
    this.faceCenters = this.faces.map(f =>
      toPoincare(matVec(f, this.c0), this.timeAxis),
    )
    this.straightAhead = this.faceCenters.map(dir =>
      this.mostOpposite(dir),
    )
    this.forwardFace = 0
  }

  // how many cells are currently held (the bounded working-set size, constant as you walk)
  get activeCount(): number {
    return this.window.length
  }

  // the largest camera-relative coordinate magnitude currently held, stays bounded by windowNorm forever (the
  // proof that rebasing keeps us off the precision wall)
  get maxCoordinate(): number {
    let m = 0

    for (const g of this.window) {
      const c = toPoincare(matVec(g, this.c0), this.timeAxis)
      m = Math.max(m, norm(c))
    }

    return m
  }

  // advance the walk by a fraction of a cell, rebasing across the boundary when we reach the next cell
  advance(fraction: number): void {
    this.t += fraction

    while (this.t >= 1) {
      this.t -= 1
      // we have arrived at the forward neighbor, it becomes the new center. The way back is the same face
      // (a reflection is an involution), so the next forward face is the one straight ahead of it.
      this.forwardFace = this.straightAhead[this.forwardFace]!
    }
  }

  // the Scene to render this frame, the window placed in the ball with the current sub-cell glide applied
  scene(): Scene {
    // the camera position within the current cell, gliding from the center toward the forward neighbor
    const target = this.faceCenters[this.forwardFace]!
    const eye = gyroScale(target, this.t)
    const shift = negate(eye)
    const place = (p: Vec): Vec => mobiusAdd(shift, p)

    const edges: SceneEdge[] = []
    const seen = new Set<string>()
    const ballDim = this.shape.frame.dim - 1

    for (const g of this.window) {
      const ballVerts = this.shape.vertices.map(v =>
        place(toPoincare(matVec(g, v), this.timeAxis)),
      )

      for (const [i, j] of this.shape.edges) {
        const a = ballVerts[i]!
        const b = ballVerts[j]!

        if (norm(a) > 0.9996 || norm(b) > 0.9996) {
          continue
        }

        const key = pairKey(a, b)

        if (seen.has(key)) {
          continue
        }

        seen.add(key)
        edges.push({ a, b })
      }
    }

    return {
      dim: ballDim,
      symbol: this.symbol.slice(),
      edges,
      cellCount: this.window.length,
    }
  }

  // BFS the camera-relative window once, every cell isometry whose center is within windowNorm of the origin
  private buildWindow(): Mat[] {
    const dim = this.shape.frame.dim
    const start = identity(dim)
    const window: Mat[] = [start]
    const seen = new Set<string>([
      pointKey(toPoincare(matVec(start, this.c0), this.timeAxis)),
    ])

    for (const g of window) {

      for (const f of this.faces) {
        const gp = matMul(g, f)
        const center = toPoincare(matVec(gp, this.c0), this.timeAxis)

        if (norm(center) > this.windowNorm) {
          continue
        }

        const k = pointKey(center)

        if (seen.has(k)) {
          continue
        }

        seen.add(k)
        window.push(gp)
      }

      if (window.length > 200000) {
        break
      } // safety, a huge window means windowNorm is too close to 1
    }

    return window
  }

  // the face index whose center direction is most opposite to `dir` (the "keep walking straight" choice)
  private mostOpposite(dir: Vec): number {
    let best = 0
    let bestDot = Infinity

    for (let i = 0; i < this.faceCenters.length; i++) {
      const d = dot(dir, this.faceCenters[i]!)

      if (d < bestDot) {
        bestDot = d
        best = i
      }
    }

    return best
  }
}

function dot(a: Vec, b: Vec): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }

  return s
}

function norm(v: Vec): number {
  return Math.sqrt(dot(v, v))
}

function pairKey(a: Vec, b: Vec): string {
  const ka = a.map(x => Math.round(x * 1e4)).join(',')
  const kb = b.map(x => Math.round(x * 1e4)).join(',')

  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}
