// Instruments for asking whether a dock LINE (a slot and its stream target, joined with the opposite slot of its dock
// line) survives on the true mesh, the hyperbolic {3,4,3,4} honeycomb, as it does on the flat D4 box (E-SPN-0098's
// line law). Written for the line-holonomy experiment; each piece is general.
//
// - rootReflection, composePermutations, permutationOrder: exact integer W(F4) elements acting on the 24 D4 roots
//   (the slots), so a holonomy read off float frames can be checked against an integer product.
// - faceLoopPairs: the 96 pairs of slots (a, b) whose facets share a triangle (roots at 60 degrees, a . b = 1). Around
//   that triangle the edge figure of {3,4,3,4} puts four docks, and the loop is a, -b, a, -b in antipodal labels.
// - loopFrames: walk a closed loop of docks given by their centers, stepping each time across the facet whose
//   transport lands on the next center, for a chosen transport; returns the labels used and the frame that comes back.
// - leviCivitaHolonomy: the parallel transport of the tangent space around a loop of centers, as the product of the
//   transvections between successive centers (each the product of two point symmetries), independent of any label.
// - slotPermutation: the permutation of the 24 slot directions that a matrix fixing the base center induces, or
//   undefined when it does not permute them.
// - ballTables: the locked rule's stream tables on a ball of the honeycomb, with the frontier REFLECTING (a slot whose
//   stream target lies outside the ball streams into the opposite slot of its own dock, so the map stays a bijection
//   and a vibe turning at the wall stays on its dock line), and every link the identity grid move.
// - horosphericalChart: the horizontal position (in units of the cusp layer's cubic lattice) and the Busemann level
//   of a point, about the ideal vertex of the base cell that code/substrate/coxeter/label-transport cuspLayer uses.
// - countingCollide: the rule's collision (code/rule/occupation-veto-knit collideVeto, veto 'none'), dock by dock in
//   the same order, counting the docks where the isometric map K acts (two or more single lines) and every vibe the
//   bounce piece carries onto another dock line, split by K and B docks.
//
// MEASUREMENT: frames and centers are floats (the honeycomb's coordinates lie in Z[sqrt 2]); every verdict drawn from
// them is a permutation or a count, matched at 1e-9. The rule runs in exact integers. No random numbers.

import {
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  type Mat,
  type Vec,
  identity,
  innerJ,
  matMul,
  matVec,
  nullVector,
} from '@/code/substrate/coxeter/minkowski'
import {
  cuspLayer,
  type HyperbolicBall,
  type LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'

const ROOTS = rootsD4()
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f]!,
)
const dot4 = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)
const rootIndex = (r: readonly number[]): number =>
  ROOTS.findIndex(o => o.every((v, i) => v === r[i]))

// ---- exact W(F4) on the slots ----

// the reflection of the roots in root k: r -> r - (r . k) k (every root has norm 2), as a slot permutation
export function rootReflection(k: number): Int32Array {
  const root = ROOTS[k]!

  return Int32Array.from(ROOTS, r => {
    const c = dot4(r, root)

    return rootIndex(r.map((v, i) => v - c * (root[i] ?? 0)))
  })
}

// minus the reflection in root k (fixes k, negates its orthogonal complement): the antipodal transport's turn
export function minusRootReflection(k: number): Int32Array {
  const r = rootReflection(k)

  return Int32Array.from(r, d => OPPOSITE[d]!)
}

// (p q)(d) = p(q(d)): q first
export function composePermutations(
  p: Int32Array,
  q: Int32Array,
): Int32Array {
  return Int32Array.from(q, d => p[d]!)
}

export const isIdentityPermutation = (p: Int32Array): boolean =>
  p.every((v, d) => v === d)

export function permutationOrder(p: Int32Array): number {
  let q = Int32Array.from(p)

  for (let n = 1; n <= 1152; n++) {
    if (isIdentityPermutation(q)) {
      return n
    }

    q = composePermutations(p, q)
  }

  return -1
}

export function inversePermutation(p: Int32Array): Int32Array {
  const out = new Int32Array(p.length)

  p.forEach((v, d) => {
    out[v] = d
  })

  return out
}

export const samePermutation = (
  p: Int32Array,
  q: Int32Array,
): boolean => p.every((v, d) => v === q[d])

// the 96 slot pairs (a < b) at 60 degrees, one per triangle of the base cell
export function faceLoopPairs(): [number, number][] {
  const out: [number, number][] = []

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      if (dot4(ROOTS[a]!, ROOTS[b]!) === 1) {
        out.push([a, b])
      }
    }
  }

  return out
}

// the dock reached from `start` by stepping across the listed labels, on a labelled mesh
export function walkLabels(
  ball: HyperbolicBall,
  start: number,
  labels: readonly number[],
): number {
  let x = start

  for (const k of labels) {
    x = ball.mesh.neighbour(x, k)
  }

  return x
}

// ---- frames and parallel transport ----

const unitTime = (p: Vec, metric: number[]): Vec => {
  const n = Math.sqrt(-innerJ(p, p, metric))

  return p.map(v => v / n)
}

// the point symmetry about p: x -> -x + 2 <x, p> / <p, p> p
function pointSymmetry(p: Vec, metric: number[]): Mat {
  const pp = innerJ(p, p, metric)

  return p.map((_, a) =>
    p.map(
      (__, b) =>
        (a === b ? -1 : 0) +
        (2 * (p[a] ?? 0) * (metric[b] ?? 1) * (p[b] ?? 0)) / pp,
    ),
  )
}

// the transvection carrying p to q along their geodesic: the point symmetry about the midpoint after the one about p
export function transvection(p: Vec, q: Vec, metric: number[]): Mat {
  const a = unitTime(p, metric)
  const b = unitTime(q, metric)
  const m = a.map((v, i) => v + (b[i] ?? 0))

  return matMul(pointSymmetry(m, metric), pointSymmetry(a, metric))
}

// parallel transport around a closed loop of centers (first repeated implicitly at the end), as one matrix
export function leviCivitaHolonomy(
  centers: readonly Vec[],
  metric: number[],
): Mat {
  let h = identity(centers[0]!.length)

  for (let i = 0; i < centers.length; i++) {
    h = matMul(
      transvection(
        centers[i]!,
        centers[(i + 1) % centers.length]!,
        metric,
      ),
      h,
    )
  }

  return h
}

// the slot permutation a matrix fixing the base center induces on the base cell's 24 facet directions
export function slotPermutation(
  coin: LabelledCoin,
  h: Mat,
): Int32Array | undefined {
  const { metric } = coin.frame
  const scale = Math.sqrt(
    innerJ(coin.directions[0]!, coin.directions[0]!, metric),
  )
  const out = new Int32Array(24)

  for (let k = 0; k < 24; k++) {
    const image = matVec(h, coin.directions[k]!)
    const j = coin.directions.findIndex(d =>
      d.every((v, a) => Math.abs(v - (image[a] ?? 0)) < 1e-9 * scale),
    )

    if (j < 0) {
      return undefined
    }

    out[k] = j
  }

  return out
}

export function largestEntryGap(a: Mat, b: Mat): number {
  let worst = 0
  let size = 1

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      worst = Math.max(
        worst,
        Math.abs((a[i]?.[j] ?? 0) - (b[i]?.[j] ?? 0)),
      )
      size = Math.max(size, Math.abs(a[i]?.[j] ?? 0))
    }
  }

  return worst / size
}

// Walk a closed loop of docks given by their centers from the base frame, each step across the label whose transport
// lands on the next center. Returns the labels, the frame that comes back, and whether every step found its label.
export function loopFrames(input: {
  coin: LabelledCoin
  transports: readonly Mat[]
  centers: readonly Vec[]
}): { labels: number[]; frame: Mat; found: boolean } {
  const { coin, transports, centers } = input
  const { center, metric } = coin.frame
  const cc = -innerJ(center, center, metric)

  let g = identity(center.length)

  const labels: number[] = []

  let found = true

  for (let i = 0; i < centers.length; i++) {
    const next = centers[(i + 1) % centers.length]!
    const k = transports.findIndex(t => {
      const p = matVec(matMul(g, t), center)

      return Math.abs(-innerJ(p, next, metric) - cc) < 1e-9 * cc
    })

    if (k < 0) {
      found = false
      break
    }

    labels.push(k)
    g = matMul(g, transports[k]!)
  }

  return { labels, frame: g, found }
}

// ---- the husk chart ----

export type HorosphericalChart = {
  // the Busemann level -<p, v> (larger is deeper in the bulk; the cusp layer sits at `layerLevel`)
  readonly level: (p: Vec) => number
  readonly layerLevel: number
  // horizontal coordinates in cubic-lattice units about the base cell's center
  readonly coordinates: (p: Vec) => number[]
  // the three lattice axes are orthogonal and of one length, to this relative error
  readonly axesError: number
}

export function horosphericalChart(
  coin: LabelledCoin,
): HorosphericalChart {
  const { normals, metric, center: c0 } = coin.frame
  const dot = (a: Vec, b: Vec): number => innerJ(a, b, metric)

  let v = nullVector(normals.slice(1), metric)

  if (dot(c0, v) > 0) {
    v = v.map(x => -x)
  }

  const alpha = -1 / dot(c0, v)
  const beta = (-alpha * dot(c0, c0)) / (2 * dot(c0, v))
  const w = c0.map((x, a) => alpha * x + beta * (v[a] ?? 0))

  const horizontal = (p: Vec): Vec => {
    const q = p.map(x => x / -dot(p, v))
    const along = -dot(q, w)

    return q.map((x, a) => x - along * (v[a] ?? 0) - (w[a] ?? 0))
  }

  const origin = horizontal(c0)
  const layer = cuspLayer({ coin, skinRadius: 1 })
  const axes: Vec[] = []

  for (const m of layer.members.filter(x => x.skin === 1)) {
    const s = horizontal(matVec(m.frame, c0)).map(
      (x, a) => x - (origin[a] ?? 0),
    )

    if (
      !axes.some(
        u =>
          Math.abs(Math.abs(dot(s, u)) - dot(u, u)) < 1e-6 * dot(u, u),
      )
    ) {
      axes.push(s)
    }
  }

  let axesError = axes.length === 3 ? 0 : Number.POSITIVE_INFINITY

  for (let i = 0; i < axes.length; i++) {
    for (let j = 0; j < axes.length; j++) {
      axesError = Math.max(
        axesError,
        Math.abs(
          dot(axes[i]!, axes[j]!) -
            (i === j ? dot(axes[0]!, axes[0]!) : 0),
        ) / dot(axes[0]!, axes[0]!),
      )
    }
  }

  return {
    level: p => -dot(p, v),
    layerLevel: -dot(c0, v),
    coordinates: p => {
      const x = horizontal(p).map((y, a) => y - (origin[a] ?? 0))

      return axes.map(u => dot(x, u) / dot(u, u))
    },
    axesError,
  }
}

// ---- the rule on a ball ----

// the locked rule's tables on a ball, reflecting frontier, identity links (every point table the identity)
export function ballTables(
  ball: HyperbolicBall,
  collision: LockedTables['collision'],
): LockedTables {
  const cells = ball.cells
  const slots = cells * 24
  const target = new Int32Array(slots)
  const source = new Int32Array(slots).fill(-1)
  const move = new Int8Array(slots * 9)
  const back = new Int8Array(slots * 9)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d
      const n = ball.mesh.neighbour(x, d)
      const to = n < cells ? n * 24 + d : x * 24 + OPPOSITE[d]!

      target[slot] = to
      source[to] = slot

      for (let p = 0; p < 9; p++) {
        move[slot * 9 + p] = p
        back[slot * 9 + p] = p
      }
    }
  }

  if (source.some(s => s < 0)) {
    throw new Error(
      'ballTables: the reflecting stream is not a bijection',
    )
  }

  return { cells, collision, veto: true, target, source, move, back }
}

// ---- the collision, counted ----

export type CollideTally = {
  kDocks: number
  crossK: number
  crossB: number
}

export const newCollideTally = (): CollideTally => ({
  kDocks: 0,
  crossK: 0,
  crossB: 0,
})

const PERM = new Int32Array(24)

// the rule's collision (collideVeto with veto 'none'), counting K docks and cross-line moves before each bounce piece
export function countingCollide(
  tally: CollideTally,
): (t: LockedTables, c: Configuration, beat: number) => void {
  return (t, c, beat) => {
    const order = collisionOrder('alternate', beat)

    for (let x = 0; x < t.cells; x++) {
      for (const piece of order) {
        if (piece === 'P') {
          pairPiece('none', c, x)
          continue
        }

        const base = x * 24

        let singles = 0

        for (let l = 0; l < 12; l++) {
          const a = c.vibe[base + LINE_FIRSTS[l]!] !== 0
          const b = c.vibe[base + LINE_SECONDS[l]!] !== 0

          if (a !== b) {
            singles++
          }
        }

        if (
          bouncePermutation(
            BOUNCE_TABLE,
            t.collision,
            c.vibe,
            base,
            PERM,
          ) !== 0
        ) {
          let cross = 0

          for (let d = 0; d < 24; d++) {
            if (
              c.vibe[base + d] !== 0 &&
              LINE_OF[PERM[d]!] !== LINE_OF[d]
            ) {
              cross++
            }
          }

          if (singles > 1) {
            tally.kDocks++
            tally.crossK += cross
          } else {
            tally.crossB += cross
          }
        }

        coinPiece(t, c, x)
      }
    }
  }
}

// ---- starts on any mesh (deterministic fills keyed by integer Weyl numbers) ----

export type StoreFill = 'empty' | 'saturated' | 'sparse'

// a vacuum: 'empty' holds nothing; 'saturated' stores a pair on every dock line, its sign the key's top bit;
// 'sparse' stores one on the dock lines whose key falls in the lowest quarter. Every stored pair is open (the
// physical rule) with both points 0. `key` is an integer in [0, 65536) of (dock, line, use).
export function vacuumFill(
  cells: number,
  fill: StoreFill,
  key: (x: number, l: number, use: number) => number,
): Configuration {
  const store = new Int8Array(cells * 12)

  if (fill !== 'empty') {
    for (let x = 0; x < cells; x++) {
      for (let l = 0; l < 12; l++) {
        if (fill === 'sparse' && key(x, l, 1) >= 16384) {
          continue
        }

        store[x * 12 + l] = key(x, l, 0) < 32768 ? 1 : -1
      }
    }
  }

  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store,
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12).fill(3),
  }
}

// add one open love at (dock, slot), clearing the store of its dock line
export function addLove(
  c: Configuration,
  dock: number,
  slot: number,
): void {
  c.vibe[dock * 24 + slot] = 1
  c.open[dock * 24 + slot] = 1
  c.point[dock * 24 + slot] = 0
  c.store[dock * 12 + LINE_OF[slot]!] = 0
  c.sopen[dock * 12 + LINE_OF[slot]!] = 0
}
