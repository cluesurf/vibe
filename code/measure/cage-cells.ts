// A STATIC Z3 CAGE ON LARGER CELLS OR FROM THE GRID MOVES? (moving-matter item 0082, research/outside-the-box.md 3.2,
// candidates B and G of 0062). 0058's uniform centre fields live on the one-dock cell, and their one all-non-flat class
// cf0 only slows a lone third (0074, C_inf 0.883). This file reads two families 0058 never enumerated, with 0074's cage
// engine and velocity definitions carried over to any cell and to 3 x 3 links.
//
// THE CELL. An index-p sublattice L of D4 (p = 1, 2, 3; p prime, so L = ker lambda for lambda: D4 -> Z_p, one per line
// of lambda) has p docks r_i (lambda(r_i) = i). Slot d of dock i reaches r_i + root_d = r_j + l with l in L; the Bloch
// phase is e^(-i theta . l) with theta in the basis coordinates of L, and metric[a][j] the Z^4 axis a of basis vector j,
// so dH / dk_a = sum_j metric[a][j] dH / dtheta_j as in cage-velocity. p = 1 is cage-velocity's own cell.
//
// THE FIELD. link(i, d) is an nc x nc unitary (nc 1: a centre phase omega^c, the three colours equal; nc 3: a 3 x 3
// matrix), and link(j, -d) = link(i, d)^-1, so the stream still squares to 1 and 0074's reduction holds unchanged:
// the cycle B = T P_D T P_S is 1 off the span of S (slot-uniform register vectors, 8 p nc) and F = T E, and on it the
// bands are +-eps(x), cos eps = cos mu + x (1 - cos mu), over the eigenvalues x of H = X X^dag, X = S^dag T E, with
//   X[(i, a, c), (j, e, c')] = (1 / sqrt 24) sum over d with next(i, d) = j of link(i, d)[c][c'] e^(-i theta . l) E[(-d, a), e]
// The velocity v^2 and the flat weight are cage-velocity's definitions (reducedPoint, gridVelocity), the start the
// one-dock colour-mixed slot-uniform register mode 0 (v^2 averaged over the nc colour starts).
//
// THE SETS (the screen of the item). The register walk of E-FRC-0267 on half + (chiralSlab, 96 modes a dock), plain and
// Wilson, as centre-flux centerBands builds it: U = T P1 T P0, T diagonal in the slot, here carrying link(i, d) and the
// cell's Bloch phase. Its start is the half's slot-uniform mode 0 (colorPieces' first range vector) at dock 0, every
// colour. The screen keeps a field only if every eigenphase that carries start weight is the same, to 1e-9, at all 8
// fixed generic momenta: flat on the start's span.
//
// FAMILY B: centre fields c(i, d) in Z3 on the cell, every oriented triangle non-flat, classes by the flux vector (the
// flux is gauge invariant and fixes the field up to gauge), modulo L's rotations and the cell's translations. Found by a
// depth-first search with a gauge slice (the 4 basis slots of dock 0 carry 0, which the 81 additive gauges always
// reach). FAMILY G: one dock, link(d) = D(v_d) the symmetric qutrit Weyl displacement omega^(2 a b) X^a Z^b of
// v_d = v(root_d), v: D4 -> Z3^2 linear (3^8 maps), D(-v) = D(v)^-1 exactly; plaquettes are central, omega^(+-[v_a, v_b]).
// Classes modulo SL(2, 3) (conjugation by the Clifford group, a global gauge) and the 192 rotations.
//
// DETERMINISM: no random numbers; enumerations exhaustive and ordered. FLOAT: measurement.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { TRIANGLES, sigmaTable } from '@/code/measure/color-gates'
import { ROTATIONS, basisCoords, type Rotation } from '@/code/measure/center-flux'
import { partnerBasis } from '@/code/measure/register-meson'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { d4Vector } from '@/code/substrate/d4-box-integer'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { unitaryEigenHouseholder } from '@/code/measure/spectral-flow'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { colorPieces } from '@/code/measure/color-slab'
import { denseVelocity } from '@/code/measure/cage-velocity'

const SLOTS = 24
const REG = 8
const HALF = 96
const TAU = 2 * Math.PI
const mod = (v: number, p: number): number => ((v % p) + p) % p
const ROOT_COORDS = DOCK_ROOTS.map(basisCoords)

// the slot whose root is basis vector j of D4
const BASIS_SLOTS = [0, 1, 2, 3].map(j => {
  const v = d4Vector([0, 1, 2, 3].map(k => (k === j ? 1 : 0)))
  const d = DOCK_ROOTS.findIndex(r => r.every((x, k) => x === v[k]))

  if (d < 0) {
    throw new Error('cage-cells: a D4 basis vector is not a root')
  }

  return d
})

// ---- the cell ----

export type Cell = {
  p: number
  lambda: number[]
  // next[i * 24 + d]: the dock slot d of dock i reaches; ell[(i * 24 + d) * 4 + j]: L coordinate j of the offset
  next: Int32Array
  ell: Int32Array
  metric: number[][]
  // lambda on each root
  q: Int8Array
  // dockMap[g * p + i]: the dock rotation g takes dock i to (only for rotations keeping L; -1 otherwise)
  dockMap: Int32Array
  // the rotations keeping L
  stabilizer: number[]
}

function inverseMod(a: number, p: number): number {
  for (let x = 1; x < p; x++) {
    if ((a * x) % p === 1) {
      return x
    }
  }

  throw new Error(`inverseMod: ${a} has no inverse mod ${p}`)
}

const rotateVector = (g: Rotation, r: readonly number[]): number[] => [0, 1, 2, 3].map(i => g.sign[i]! * r[g.perm[i]!]!)

export function makeCell(p: number, lambda: readonly number[]): Cell {
  let basis: number[][]
  let coordsL: (y: readonly number[]) => number[]
  let rep: (i: number) => number[]

  if (p === 1) {
    basis = [0, 1, 2, 3].map(j => [0, 1, 2, 3].map(k => (k === j ? 1 : 0)))
    coordsL = y => [...y]
    rep = () => [0, 0, 0, 0]
  } else {
    const j0 = lambda.findIndex(v => mod(v, p) !== 0)
    const inv = inverseMod(mod(lambda[j0]!, p), p)
    const t = [0, 1, 2, 3].map(j => mod(lambda[j]! * inv, p))

    basis = [0, 1, 2, 3].map(j =>
      [0, 1, 2, 3].map(k => (j === j0 ? (k === j0 ? p : 0) : k === j ? 1 : k === j0 ? -t[j]! : 0)),
    )
    coordsL = y =>
      [0, 1, 2, 3].map(j => {
        if (j !== j0) {
          return y[j]!
        }

        let s = y[j0]!

        for (let k = 0; k < 4; k++) {
          if (k !== j0) {
            s += y[k]! * t[k]!
          }
        }

        if (mod(s, p) !== 0) {
          throw new Error('makeCell: offset not in L')
        }

        return s / p
      })
    rep = i => [0, 1, 2, 3].map(k => (k === j0 ? mod(i * inv, p) : 0))
  }

  const dockOf = (y: readonly number[]): number => mod(y.reduce((s, v, k) => s + v * lambda[k]!, 0), p)
  const next = new Int32Array(p * SLOTS)
  const ell = new Int32Array(p * SLOTS * 4)

  for (let i = 0; i < p; i++) {
    const ri = rep(i)

    for (let d = 0; d < SLOTS; d++) {
      const y = ri.map((v, k) => v + ROOT_COORDS[d]![k]!)
      const j = dockOf(y)
      const rj = rep(j)
      const l = coordsL(y.map((v, k) => v - rj[k]!))

      next[i * SLOTS + d] = j
      l.forEach((v, k) => (ell[(i * SLOTS + d) * 4 + k] = v))
    }
  }

  const metric = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(j => d4Vector(basis[j]!)[a]!))
  const q = Int8Array.from(ROOT_COORDS, r => dockOf(r))
  const dockMap = new Int32Array(ROTATIONS.length * p).fill(-1)
  const stabilizer: number[] = []

  ROTATIONS.forEach((g, gi) => {
    // g keeps L when lambda(g r) = 0 for every root r with lambda(r) = 0, i.e. lambda o g is a multiple of lambda
    const lg = Int8Array.from(DOCK_ROOTS, r => dockOf(basisCoords(rotateVector(g, r))))
    const ratio = new Set<number>()
    let keeps = true

    for (let d = 0; d < SLOTS; d++) {
      if (q[d] === 0 && lg[d] !== 0) {
        keeps = false
      }

      if (q[d] !== 0) {
        ratio.add(mod(lg[d]! * inverseMod(q[d]!, p), p))
      }
    }

    if (!keeps || ratio.size > 1) {
      return
    }

    stabilizer.push(gi)

    for (let i = 0; i < p; i++) {
      dockMap[gi * p + i] = dockOf(basisCoords(rotateVector(g, d4Vector(rep(i)))))
    }
  })

  return { p, lambda: [...lambda], next, ell, metric, q, dockMap, stabilizer }
}

export type SublatticeClass = { p: number; lambda: number[]; orbit: number; stabilizer: number }

// the index-p sublattices of D4 modulo the 192 rotations (p = 1: D4 itself)
export function sublattices(p: number): SublatticeClass[] {
  if (p === 1) {
    return [{ p, lambda: [0, 0, 0, 0], orbit: 1, stabilizer: ROTATIONS.length }]
  }

  const keyOf = (q: Int8Array): string => {
    const f = q.find(v => v !== 0)!
    const inv = inverseMod(f, p)

    return Array.from(q, v => mod(v * inv, p)).join('')
  }
  const seen = new Set<string>()
  const out: SublatticeClass[] = []

  for (let n = 1; n < p ** 4; n++) {
    const lambda = [0, 1, 2, 3].map(j => Math.floor(n / p ** j) % p)

    if (lambda.find(v => v !== 0) !== 1) {
      continue
    }

    const q = Int8Array.from(ROOT_COORDS, r => mod(r.reduce((s, v, k) => s + v * lambda[k]!, 0), p))
    const key = keyOf(q)

    if (seen.has(key)) {
      continue
    }

    const orbit = new Set<string>()

    for (const g of ROTATIONS) {
      const r = new Int8Array(SLOTS)

      for (let d = 0; d < SLOTS; d++) {
        r[g.slot[d]!] = q[d]!
      }

      orbit.add(keyOf(r))
    }

    orbit.forEach(k => seen.add(k))
    out.push({ p, lambda, orbit: orbit.size, stabilizer: ROTATIONS.length / orbit.size })
  }

  return out
}

// ---- the field ----

export type CellField = {
  name: string
  cell: Cell
  nc: number
  // link[((i * 24 + d) * nc * nc + r * nc + s) * 2 + {0, 1}]
  link: Float64Array
}

export function centerCellField(name: string, cell: Cell, c: Int8Array): CellField {
  const link = new Float64Array(cell.p * SLOTS * 2)

  for (let l = 0; l < cell.p * SLOTS; l++) {
    link[2 * l] = Math.cos((TAU * c[l]!) / 3)
    link[2 * l + 1] = Math.sin((TAU * c[l]!) / 3)
  }

  return { name, cell, nc: 1, link }
}

// the symmetric Weyl displacement D(a, b) = omega^(2 a b) X^a Z^b, X|s> = |s + 1>, Z|s> = omega^s |s>, 3 x 3 interleaved
export function weylDisplacement(a: number, b: number): Float64Array {
  const out = new Float64Array(18)

  for (let s = 0; s < 3; s++) {
    const r = mod(s + a, 3)
    const ph = (TAU * mod(2 * a * b + b * s, 3)) / 3

    out[2 * (r * 3 + s)] = Math.cos(ph)
    out[2 * (r * 3 + s) + 1] = Math.sin(ph)
  }

  return out
}

// v on every root from v on the four basis vectors (8 Z3 values: v_j = (V[2j], V[2j + 1]))
export function rootDisplacements(V: readonly number[]): [number, number][] {
  return ROOT_COORDS.map(m => [
    mod(m.reduce((s, x, j) => s + x * V[2 * j]!, 0), 3),
    mod(m.reduce((s, x, j) => s + x * V[2 * j + 1]!, 0), 3),
  ])
}

export function gridMoveField(name: string, V: readonly number[]): CellField {
  const cell = makeCell(1, [0, 0, 0, 0])
  const v = rootDisplacements(V)
  const link = new Float64Array(SLOTS * 18)

  v.forEach(([a, b], d) => link.set(weylDisplacement(a, b), d * 18))

  return { name, cell, nc: 3, link }
}

// complex nc x nc helpers on interleaved arrays
function cmat(nc: number, A: Float64Array, ao: number, B: Float64Array, bo: number): Float64Array {
  const out = new Float64Array(2 * nc * nc)

  for (let r = 0; r < nc; r++) {
    for (let s = 0; s < nc; s++) {
      let re = 0
      let im = 0

      for (let k = 0; k < nc; k++) {
        const xr = A[ao + 2 * (r * nc + k)]!
        const xi = A[ao + 2 * (r * nc + k) + 1]!
        const yr = B[bo + 2 * (k * nc + s)]!
        const yi = B[bo + 2 * (k * nc + s) + 1]!

        re += xr * yr - xi * yi
        im += xr * yi + xi * yr
      }

      out[2 * (r * nc + s)] = re
      out[2 * (r * nc + s) + 1] = im
    }
  }

  return out
}

export type FieldCheck = {
  // max |link(j, -d) link(i, d) - 1|
  reverseGap: number
  // max |link^dag link - 1|
  unitarity: number
  // every link a Sigma(648) element (gridLifts as floats, to 1e-12)
  inGroup: boolean
  // oriented triangles per dock (p * 192) and those whose holonomy is not 1; whether every holonomy is central
  triangles: number
  nonflat: number
  central: boolean
  // max |h^3 - 1| over every triangle holonomy h (the triality-zero check: a charge-3 object sees no flux)
  cubeGap: number
}

export function checkField(f: CellField): FieldCheck {
  const { cell, nc, link } = f
  const sz = 2 * nc * nc
  const at = (i: number, d: number): number => (i * SLOTS + d) * sz
  const gap1 = (M: Float64Array): number => {
    let g = 0

    for (let r = 0; r < nc; r++) {
      for (let s = 0; s < nc; s++) {
        g = Math.max(g, Math.hypot(M[2 * (r * nc + s)]! - (r === s ? 1 : 0), M[2 * (r * nc + s) + 1]!))
      }
    }

    return g
  }
  const dagger = (o: number): Float64Array => {
    const out = new Float64Array(sz)

    for (let r = 0; r < nc; r++) {
      for (let s = 0; s < nc; s++) {
        out[2 * (r * nc + s)] = link[o + 2 * (s * nc + r)]!
        out[2 * (r * nc + s) + 1] = -link[o + 2 * (s * nc + r) + 1]!
      }
    }

    return out
  }

  let reverseGap = 0
  let unitarity = 0
  let inGroup = true
  const lifts = sigmaTable().lifts.floats

  for (let i = 0; i < cell.p; i++) {
    for (let d = 0; d < SLOTS; d++) {
      const j = cell.next[i * SLOTS + d]!

      reverseGap = Math.max(reverseGap, gap1(cmat(nc, link, at(j, OPPOSITE[d]!), link, at(i, d))))
      unitarity = Math.max(unitarity, gap1(cmat(nc, dagger(at(i, d)), 0, link, at(i, d))))

      // the element as a 3 x 3 (a centre phase times 1 when nc is 1)
      const g = new Float64Array(18)

      for (let r = 0; r < 3; r++) {
        for (let s = 0; s < 3; s++) {
          const src = nc === 3 ? at(i, d) + 2 * (r * 3 + s) : r === s ? at(i, d) : -1

          g[2 * (r * 3 + s)] = src < 0 ? 0 : link[src]!
          g[2 * (r * 3 + s) + 1] = src < 0 ? 0 : link[src + 1]!
        }
      }

      if (!lifts.some(m => m.every((x, k) => Math.abs(x - g[k]!) < 1e-12))) {
        inGroup = false
      }
    }
  }

  let nonflat = 0
  let central = true
  let cubeGap = 0

  for (let i = 0; i < cell.p; i++) {
    for (const [a, b, s] of TRIANGLES) {
      const ia = cell.next[i * SLOTS + a]!
      // around x -> x + a -> x + a + b -> x: link(x, a) link(x + a, b) link(x, s)^-1, read from the stream's side
      const h = cmat(nc, cmat(nc, link, at(i, a), link, at(ia, b)), 0, dagger(at(i, s)), 0)

      if (gap1(h) > 1e-12) {
        nonflat++
      }

      const z0r = h[0]!
      const z0i = h[1]!

      for (let r = 0; r < nc; r++) {
        for (let q = 0; q < nc; q++) {
          const wr = r === q ? z0r : 0
          const wi = r === q ? z0i : 0

          if (Math.hypot(h[2 * (r * nc + q)]! - wr, h[2 * (r * nc + q) + 1]! - wi) > 1e-12) {
            central = false
          }
        }
      }

      cubeGap = Math.max(cubeGap, gap1(cmat(nc, cmat(nc, h, 0, h, 0), 0, h, 0)))
    }
  }

  return { reverseGap, unitarity, inGroup, triangles: cell.p * TRIANGLES.length, nonflat, central, cubeGap }
}

// ---- the cage engine, reduced ----

type Engine = { E: Float64Array; u: [number, number]; cosMu: number }

let engine: Engine | undefined

function cageEngine(): Engine {
  if (!engine) {
    const th = unitAngle(ringUnit(-1, 4))

    engine = { E: partnerBasis(), u: [Math.cos(th), Math.sin(th)], cosMu: Math.cos(th) }
  }

  return engine
}

// X and dX_j (j the L basis coordinate), N = 8 p nc, index (i * 8 + a) * nc + c, interleaved complex
function overlapCell(f: CellField, theta: readonly number[], withD: boolean): { N: number; X: Float64Array; dX: Float64Array } {
  const { cell, nc, link } = f
  const { E } = cageEngine()
  const N = REG * cell.p * nc
  const X = new Float64Array(2 * N * N)
  const dX = new Float64Array(withD ? 8 * N * N : 0)
  const r24 = 1 / Math.sqrt(SLOTS)

  for (let i = 0; i < cell.p; i++) {
    for (let d = 0; d < SLOTS; d++) {
      const j = cell.next[i * SLOTS + d]!
      const o = (i * SLOTS + d) * 4

      let t = 0

      for (let k = 0; k < 4; k++) {
        t -= theta[k]! * cell.ell[o + k]!
      }

      const br = Math.cos(t)
      const bi = Math.sin(t)
      const lo = (i * SLOTS + d) * 2 * nc * nc

      for (let c = 0; c < nc; c++) {
        for (let c2 = 0; c2 < nc; c2++) {
          const lr = link[lo + 2 * (c * nc + c2)]!
          const li = link[lo + 2 * (c * nc + c2) + 1]!

          if (lr === 0 && li === 0) {
            continue
          }

          // link times the Bloch phase
          const pr = (lr * br - li * bi) * r24
          const pi = (lr * bi + li * br) * r24

          for (let a = 0; a < REG; a++) {
            const row = (i * REG + a) * nc + c

            for (let e = 0; e < REG; e++) {
              const w = E[(OPPOSITE[d]! * REG + a) * REG + e]!

              if (w === 0) {
                continue
              }

              const col = (j * REG + e) * nc + c2
              const x = 2 * (row * N + col)

              X[x]! += pr * w
              X[x + 1]! += pi * w

              if (withD) {
                for (let k = 0; k < 4; k++) {
                  const m = cell.ell[o + k]!

                  if (m !== 0) {
                    // (-i m)(pr + i pi) w = m w (pi - i pr)
                    dX[k * 2 * N * N + x]! += m * w * pi
                    dX[k * 2 * N * N + x + 1]! -= m * w * pr
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return { N, X, dX }
}

export type CellPoint = {
  // the colour-mixed start's v^2 (cage-velocity's definition, averaged over the nc colour starts)
  v2: number
  // H's eigenvalues ascending and the colour-mixed start's weight on each
  x: number[]
  w: number[]
  singular: number
}

const CLUSTER = 1e-9

export function cellPoint(f: CellField, theta: readonly number[]): CellPoint {
  const { N, X, dX } = overlapCell(f, theta, true)
  const { cosMu: cm } = cageEngine()
  const Hr = new Float64Array(N * N)
  const Hi = new Float64Array(N * N)

  // H = X X^dag
  for (let a = 0; a < N; a++) {
    for (let b = a; b < N; b++) {
      let hr = 0
      let hi = 0

      for (let e = 0; e < N; e++) {
        const xr = X[2 * (a * N + e)]!
        const xi = X[2 * (a * N + e) + 1]!
        const yr = X[2 * (b * N + e)]!
        const yi = -X[2 * (b * N + e) + 1]!

        hr += xr * yr - xi * yi
        hi += xr * yi + xi * yr
      }

      Hr[a * N + b] = hr
      Hi[a * N + b] = hi
      Hr[b * N + a] = hr
      Hi[b * N + a] = -hi
    }
  }

  // dH_ax = sum_j metric[ax][j] (dX_j X^dag + X dX_j^dag)
  const dHr = new Float64Array(4 * N * N)
  const dHi = new Float64Array(4 * N * N)

  for (let j = 0; j < 4; j++) {
    const off = j * 2 * N * N

    for (let a = 0; a < N; a++) {
      for (let b = 0; b < N; b++) {
        let hr = 0
        let hi = 0

        for (let e = 0; e < N; e++) {
          const pr = dX[off + 2 * (a * N + e)]!
          const pi = dX[off + 2 * (a * N + e) + 1]!
          const qr = X[2 * (b * N + e)]!
          const qi = -X[2 * (b * N + e) + 1]!
          const rr = X[2 * (a * N + e)]!
          const ri = X[2 * (a * N + e) + 1]!
          const sr = dX[off + 2 * (b * N + e)]!
          const si = -dX[off + 2 * (b * N + e) + 1]!

          hr += pr * qr - pi * qi + rr * sr - ri * si
          hi += pr * qi + pi * qr + rr * si + ri * sr
        }

        for (let ax = 0; ax < 4; ax++) {
          const c = f.cell.metric[ax]![j]!

          if (c !== 0) {
            dHr[ax * N * N + a * N + b]! += c * hr
            dHi[ax * N * N + a * N + b]! += c * hi
          }
        }
      }
    }
  }

  const h = hermitianEigenRows(N, Hr, Hi)
  const x = Array.from(h.values)
  const starts = Array.from({ length: f.nc }, (_, c) => c)
  const w = x.map((_, i) => starts.reduce((s, c) => s + h.vectorsRe[i * N + c]! ** 2 + h.vectorsIm[i * N + c]! ** 2, 0) / f.nc)

  let v2 = 0
  let singular = 0
  let start = 0

  while (start < N) {
    let end = start + 1

    while (end < N && x[end]! - x[end - 1]! <= CLUSTER) {
      end++
    }

    const xc = x.slice(start, end).reduce((s, v) => s + v, 0) / (end - start)
    const cosE = Math.min(1, Math.max(-1, cm + xc * (1 - cm)))
    const sinE = Math.sqrt(1 - cosE * cosE)

    if (sinE < 1e-7) {
      singular++
      start = end
      continue
    }

    const fp = -(1 - cm) / sinE

    for (const s0 of starts) {
      // p = Pi e_s0
      const pr = new Float64Array(N)
      const pi = new Float64Array(N)

      for (let i = start; i < end; i++) {
        const cr = h.vectorsRe[i * N + s0]!
        const ci = -h.vectorsIm[i * N + s0]!

        for (let a = 0; a < N; a++) {
          const vr = h.vectorsRe[i * N + a]!
          const vi = h.vectorsIm[i * N + a]!

          pr[a]! += vr * cr - vi * ci
          pi[a]! += vr * ci + vi * cr
        }
      }

      for (let ax = 0; ax < 4; ax++) {
        const qr = new Float64Array(N)
        const qi = new Float64Array(N)
        const o = ax * N * N

        for (let a = 0; a < N; a++) {
          for (let b = 0; b < N; b++) {
            const hr = dHr[o + a * N + b]!
            const hi = dHi[o + a * N + b]!

            qr[a]! += hr * pr[b]! - hi * pi[b]!
            qi[a]! += hr * pi[b]! + hi * pr[b]!
          }
        }

        let n2 = 0

        for (let i = start; i < end; i++) {
          let cr = 0
          let ci = 0

          for (let a = 0; a < N; a++) {
            const vr = h.vectorsRe[i * N + a]!
            const vi = -h.vectorsIm[i * N + a]!

            cr += vr * qr[a]! - vi * qi[a]!
            ci += vr * qi[a]! + vi * qr[a]!
          }

          n2 += cr * cr + ci * ci
        }

        v2 += (fp * fp * n2) / f.nc
      }
    }

    start = end
  }

  return { v2, x, w, singular }
}

export type CellGrid = {
  name: string
  nk: number
  points: number
  v2: number
  widths: number[]
  bandWeight: number[]
  flatWeight: number
  singular: number
  seconds: number
}

export function cellGrid(f: CellField, nk: number): CellGrid {
  const started = Date.now()
  const points = nk ** 4
  const N = REG * f.cell.p * f.nc
  const xmin = Array<number>(N).fill(Infinity)
  const xmax = Array<number>(N).fill(-Infinity)
  const wsum = Array<number>(N).fill(0)
  const { cosMu } = cageEngine()

  let v2 = 0
  let singular = 0

  for (let k = 0; k < points; k++) {
    const theta = [0, 1, 2, 3].map(q => (TAU * (Math.floor(k / nk ** q) % nk)) / nk)
    const pt = cellPoint(f, theta)

    v2 += pt.v2
    singular += pt.singular

    for (let i = 0; i < N; i++) {
      xmin[i] = Math.min(xmin[i]!, pt.x[i]!)
      xmax[i] = Math.max(xmax[i]!, pt.x[i]!)
      wsum[i]! += pt.w[i]!
    }
  }

  const eps = (x: number): number => Math.acos(Math.min(1, Math.max(-1, cosMu + x * (1 - cosMu))))
  const widths = xmin.map((v, i) => Math.abs(eps(xmax[i]!) - eps(v)))
  const bandWeight = wsum.map(v => v / points)

  return {
    name: f.name,
    nk,
    points,
    v2: v2 / points,
    widths,
    bandWeight,
    flatWeight: bandWeight.reduce((s, v, i) => s + (widths[i]! < 1e-9 ? v : 0), 0),
    singular,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the dense cage block on a cell, for the instrument ----

type V = { re: Float64Array; im: Float64Array }

export function cellFullBlock(f: CellField, theta: readonly number[]): { U: V; dU: V[]; n: number } {
  const { cell, nc, link } = f
  const { E, u } = cageEngine()
  const [ur, ui] = u
  const n = cell.p * SLOTS * REG * nc
  const idx = (i: number, d: number, a: number, c: number): number => ((i * SLOTS + d) * REG + a) * nc + c
  const sz = 2 * nc * nc
  const bloch = new Float64Array(cell.p * SLOTS * 2)

  for (let l = 0; l < cell.p * SLOTS; l++) {
    let t = 0

    for (let k = 0; k < 4; k++) {
      t -= theta[k]! * cell.ell[l * 4 + k]!
    }

    bloch[2 * l] = Math.cos(t)
    bloch[2 * l + 1] = Math.sin(t)
  }

  // (T v)(i, d, a, c) = sum_c' link(i, d)[c][c'] e^(-i theta . l) v(next(i, d), -d, a, c')
  const T = (v: V): V => {
    const o = { re: new Float64Array(n), im: new Float64Array(n) }

    for (let i = 0; i < cell.p; i++) {
      for (let d = 0; d < SLOTS; d++) {
        const j = cell.next[i * SLOTS + d]!
        const l = i * SLOTS + d
        const brr = bloch[2 * l]!
        const bii = bloch[2 * l + 1]!

        for (let c = 0; c < nc; c++) {
          for (let c2 = 0; c2 < nc; c2++) {
            const lr0 = link[l * sz + 2 * (c * nc + c2)]!
            const li0 = link[l * sz + 2 * (c * nc + c2) + 1]!
            const lr = lr0 * brr - li0 * bii
            const li = lr0 * bii + li0 * brr

            for (let a = 0; a < REG; a++) {
              const s = idx(j, OPPOSITE[d]!, a, c2)
              const t = idx(i, d, a, c)

              o.re[t]! += lr * v.re[s]! - li * v.im[s]!
              o.im[t]! += lr * v.im[s]! + li * v.re[s]!
            }
          }
        }
      }
    }

    return o
  }
  const PS = (v: V): V => {
    const o = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

    for (let i = 0; i < cell.p; i++) {
      for (let a = 0; a < REG; a++) {
        for (let c = 0; c < nc; c++) {
          let sr = 0
          let si = 0

          for (let d = 0; d < SLOTS; d++) {
            sr += v.re[idx(i, d, a, c)]! / SLOTS
            si += v.im[idx(i, d, a, c)]! / SLOTS
          }

          for (let d = 0; d < SLOTS; d++) {
            o.re[idx(i, d, a, c)]! += (ur - 1) * sr - ui * si
            o.im[idx(i, d, a, c)]! += (ur - 1) * si + ui * sr
          }
        }
      }
    }

    return o
  }
  const PD = (v: V): V => {
    const o = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }
    const wr = ur - 1
    const wi = -ui

    for (let i = 0; i < cell.p; i++) {
      for (let c = 0; c < nc; c++) {
        const cr = new Float64Array(REG)
        const ci = new Float64Array(REG)

        for (let m = 0; m < SLOTS * REG; m++) {
          const k = idx(i, Math.floor(m / REG), m % REG, c)

          for (let e = 0; e < REG; e++) {
            cr[e]! += E[m * REG + e]! * v.re[k]!
            ci[e]! += E[m * REG + e]! * v.im[k]!
          }
        }

        for (let m = 0; m < SLOTS * REG; m++) {
          const k = idx(i, Math.floor(m / REG), m % REG, c)

          let pr = 0
          let pi = 0

          for (let e = 0; e < REG; e++) {
            pr += E[m * REG + e]! * cr[e]!
            pi += E[m * REG + e]! * ci[e]!
          }

          o.re[k]! += wr * pr - wi * pi
          o.im[k]! += wr * pi + wi * pr
        }
      }
    }

    return o
  }
  const D = (v: V, ax: number): V => {
    const o = { re: new Float64Array(n), im: new Float64Array(n) }

    for (let i = 0; i < cell.p; i++) {
      for (let d = 0; d < SLOTS; d++) {
        let g = 0

        for (let k = 0; k < 4; k++) {
          g += cell.metric[ax]![k]! * cell.ell[(i * SLOTS + d) * 4 + k]!
        }

        for (let a = 0; a < REG; a++) {
          for (let c = 0; c < nc; c++) {
            const t = idx(i, d, a, c)

            o.re[t] = g * v.im[t]!
            o.im[t] = -g * v.re[t]!
          }
        }
      }
    }

    return o
  }
  const U = { re: new Float64Array(n * n), im: new Float64Array(n * n) }
  const dU = [0, 1, 2, 3].map(() => ({ re: new Float64Array(n * n), im: new Float64Array(n * n) }))

  for (let col = 0; col < n; col++) {
    const e: V = { re: new Float64Array(n), im: new Float64Array(n) }

    e.re[col] = 1

    const y = T(PS(e))
    const ue = T(PD(y))

    for (let i = 0; i < n; i++) {
      U.re[i * n + col] = ue.re[i]!
      U.im[i * n + col] = ue.im[i]!
    }

    for (let ax = 0; ax < 4; ax++) {
      const a1 = D(ue, ax)
      const a2 = T(PD(D(y, ax)))

      for (let i = 0; i < n; i++) {
        dU[ax]!.re[i * n + col] = a1.re[i]! + a2.re[i]!
        dU[ax]!.im[i * n + col] = a1.im[i]! + a2.im[i]!
      }
    }
  }

  return { U, dU, n }
}

export type CellInstrumentPoint = { field: string; theta: number[]; reducedV2: number; denseV2: number; unitarity: number; residual: number }

// the reduction against the dense block, colour-mixed: v^2 from denseVelocity averaged over the nc colour starts
export function cellInstrumentPoint(f: CellField, theta: number[]): CellInstrumentPoint {
  const r = cellPoint(f, theta)
  const { U, dU, n } = cellFullBlock(f, theta)

  let dense = 0
  let unitarity = 0
  let residual = 0

  for (let c = 0; c < f.nc; c++) {
    const phi = { re: new Float64Array(n), im: new Float64Array(n) }

    for (let d = 0; d < SLOTS; d++) {
      phi.re[(d * REG) * f.nc + c] = 1 / Math.sqrt(SLOTS)
    }

    const dv = denseVelocity(n, U, dU, phi)

    dense += dv.v2 / f.nc
    unitarity = Math.max(unitarity, dv.unitarity)
    residual = Math.max(residual, dv.residual)
  }

  return { field: f.name, theta, reducedV2: r.v2, denseV2: dense, unitarity, residual }
}

// ---- the sets (E-FRC-0267's register walk on half +), dense ----

export type SetPieces = { P: { re: Float64Array; im: Float64Array }[][]; start: Float64Array }

let setPieces: SetPieces | undefined

export function halfPlusPieces(): SetPieces {
  if (!setPieces) {
    const cs = chiralSlab(8)
    const pieces = colorPieces(cs.sets[0]!, cs.ranges[0]!.sR, cs.ranges[0]!.dR)
    const start = new Float64Array(HALF)

    for (let m = 0; m < HALF; m++) {
      start[m] = pieces.E[m * pieces.r]!
    }

    setPieces = { P: pieces.P.map(s => s.map(m => ({ re: Float64Array.from(m.re), im: Float64Array.from(m.im) }))), start }
  }

  return setPieces
}

// U = T P1 T P0 on the cell, n = 96 p nc, index (i * 96 + s) * nc + c
export function setBlock(f: CellField, set: 0 | 1, theta: readonly number[]): { n: number; re: Float64Array; im: Float64Array } {
  const { cell, nc, link } = f
  const { P } = halfPlusPieces()
  const n = HALF * cell.p * nc
  const sz = 2 * nc * nc
  const half = HALF / SLOTS
  // T P on the cell: row (i, s, c) = sum_c2 coef(i, d, c, c2) P[s][s'] at (next, s', c2)
  const tp = (Pm: { re: Float64Array; im: Float64Array }): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(n * n)
    const im = new Float64Array(n * n)

    for (let i = 0; i < cell.p; i++) {
      for (let d = 0; d < SLOTS; d++) {
        const j = cell.next[i * SLOTS + d]!
        const l = i * SLOTS + d

        let t = 0

        for (let k = 0; k < 4; k++) {
          t -= theta[k]! * cell.ell[l * 4 + k]!
        }

        const br = Math.cos(t)
        const bi = Math.sin(t)

        for (let c = 0; c < nc; c++) {
          for (let c2 = 0; c2 < nc; c2++) {
            const lr0 = link[l * sz + 2 * (c * nc + c2)]!
            const li0 = link[l * sz + 2 * (c * nc + c2) + 1]!

            if (lr0 === 0 && li0 === 0) {
              continue
            }

            const lr = lr0 * br - li0 * bi
            const li = lr0 * bi + li0 * br

            for (let m = 0; m < half; m++) {
              const s = d * half + m
              const row = (i * HALF + s) * nc + c

              for (let s2 = 0; s2 < HALF; s2++) {
                const pr = Pm.re[s * HALF + s2]!
                const pi = Pm.im[s * HALF + s2]!

                if (pr === 0 && pi === 0) {
                  continue
                }

                const col = (j * HALF + s2) * nc + c2

                re[row * n + col]! += lr * pr - li * pi
                im[row * n + col]! += lr * pi + li * pr
              }
            }
          }
        }
      }
    }

    return { re, im }
  }
  const A = tp(P[set]![0]!)
  const B = tp(P[set]![1]!)
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    for (let l = 0; l < n; l++) {
      const ar = B.re[r * n + l]!
      const ai = B.im[r * n + l]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let q = 0; q < n; q++) {
        re[r * n + q]! += ar * A.re[l * n + q]! - ai * A.im[l * n + q]!
        im[r * n + q]! += ar * A.im[l * n + q]! + ai * A.re[l * n + q]!
      }
    }
  }

  return { n, re, im }
}

// every eigenphase of the set block, ascending (the instrument against centre-flux centerBands)
export function setPhases(f: CellField, set: 0 | 1, theta: readonly number[]): number[] {
  const B = setBlock(f, set, theta)

  return [...unitaryEigenHouseholder(B.n, B.re, B.im).phases].sort((a, b) => a - b)
}

// the eigenphases of a block that carry the colour-mixed start's weight (above 1e-12), with their weight
// phases with start weight above 1e-12 and their weights, and every phase of the block (a flat band is there at every
// momentum whether or not the start weighs on it there)
export type WeightedPhases = { phases: number[]; weights: number[]; all: number[]; residual: number }

export function setWeightedPhases(f: CellField, set: 0 | 1, theta: readonly number[]): WeightedPhases {
  const { start } = halfPlusPieces()
  const B = setBlock(f, set, theta)
  const eig = unitaryEigenHouseholder(B.n, B.re, B.im)
  const phases: number[] = []
  const weights: number[] = []

  eig.phases.forEach((ph, k) => {
    const v = eig.vectors[k]!

    let w = 0

    for (let c = 0; c < f.nc; c++) {
      let r = 0
      let s = 0

      for (let m = 0; m < HALF; m++) {
        const x = m * f.nc + c

        r += v.re[x]! * start[m]!
        s += v.im[x]! * start[m]!
      }

      w += (r * r + s * s) / f.nc
    }

    if (w > 1e-12) {
      phases.push(ph)
      weights.push(w)
    }
  })

  return { phases, weights, all: Array.from(eig.phases), residual: eig.residual }
}

// the cage engine's weighted levels at one momentum, as eigenphases +-eps(x) collapsed to x (the start's weight on x)
export function cageWeightedLevels(f: CellField, theta: readonly number[]): WeightedPhases {
  const pt = cellPoint(f, theta)
  const phases: number[] = []
  const weights: number[] = []

  pt.x.forEach((x, i) => {
    if (pt.w[i]! > 1e-12) {
      phases.push(x)
      weights.push(pt.w[i]!)
    }
  })

  return { phases, weights, all: pt.x, residual: 0 }
}

const circ = (a: number, b: number): number => {
  const d = Math.abs(mod(a - b + Math.PI, TAU) - Math.PI)

  return d
}

// spread: the largest distance from a weighted phase at one momentum to the nearest phase at another, over all pairs. unmatched: the largest start weight, at one momentum, on phases with no partner within SCREEN_TOL at some other
// momentum (the weight the screen sees moving; the gate allows 1e-6 of it)
export function weightedSpread(
  reads: readonly WeightedPhases[],
  circular = true,
): { spread: number; unmatched: number } {
  let spread = 0
  let unmatched = 0

  for (const A of reads) {
    let moving = 0

    A.phases.forEach((a, i) => {
      let worst = 0

      for (const B of reads) {
        if (A === B) {
          continue
        }

        let best = Infinity

        for (const b of B.all) {
          best = Math.min(best, circular ? circ(a, b) : Math.abs(a - b))
        }

        worst = Math.max(worst, best)
      }

      spread = Math.max(spread, worst)

      if (worst >= SCREEN_TOL) {
        moving += A.weights[i]!
      }
    })

    unmatched = Math.max(unmatched, moving)
  }

  return { spread, unmatched }
}

// 8 fixed generic momenta (cage-velocity's Kronecker points, after its 20 special ones)
export const SCREEN_MOMENTA: readonly number[][] = (() => {
  const roots = [Math.SQRT2, Math.sqrt(3), Math.sqrt(5), Math.sqrt(7)]

  return Array.from({ length: 8 }, (_, i) => roots.map(r => TAU * (((i + 1) * r) % 1)))
})()

export type ScreenRead = {
  name: string
  // per engine: the spread of the weighted phases over the momenta read and the start weight on moving phases
  // (Infinity when not read); the cage engine reads x, never gated
  plain: { spread: number; unmatched: number }
  wilson: { spread: number; unmatched: number }
  cage: { spread: number; unmatched: number }
  // momenta read on the plain set (2 when the quick test already fails, else 8)
  plainMomenta: number
  kept: boolean
  residual: number
  seconds: number
}

export const SCREEN_TOL = 1e-9
// the gate allows the start 1e-6 of weight off flat bands, so the screen drops a field only above that
export const SCREEN_WEIGHT = 1e-6

const NOT_READ = { spread: Infinity, unmatched: Infinity }

export function screenField(f: CellField): ScreenRead {
  const started = Date.now()
  const cage = weightedSpread(SCREEN_MOMENTA.map(t => cageWeightedLevels(f, t)), false)
  // the plain set first on 2 momenta: moving weight there already fails the screen
  const quick = SCREEN_MOMENTA.slice(0, 2).map(t => setWeightedPhases(f, 0, t))
  let residual = Math.max(...quick.map(q => q.residual))
  let plain = weightedSpread(quick)
  let plainMomenta = 2
  let wilson = NOT_READ

  if (plain.unmatched < SCREEN_WEIGHT) {
    const all = [...quick, ...SCREEN_MOMENTA.slice(2).map(t => setWeightedPhases(f, 0, t))]

    plain = weightedSpread(all)
    plainMomenta = 8
    residual = Math.max(residual, ...all.map(q => q.residual))

    if (plain.unmatched < SCREEN_WEIGHT) {
      const w = SCREEN_MOMENTA.map(t => setWeightedPhases(f, 1, t))

      wilson = weightedSpread(w)
      residual = Math.max(residual, ...w.map(q => q.residual))
    }
  }

  return {
    name: f.name,
    plain,
    wilson,
    cage,
    plainMomenta,
    kept: plain.unmatched < SCREEN_WEIGHT && wilson.unmatched < SCREEN_WEIGHT,
    residual,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- FAMILY B: the centre fields of a cell with every triangle non-flat ----

export type CenterClass = {
  // c on every (dock, slot), the class's first member found
  c: number[]
  orbit: number
  // the flux at every dock the same (a one-dock field written on the cell)
  uniform: boolean
}

export type CenterCellEnumeration = {
  p: number
  lambda: number[]
  variables: number
  constraints: number
  // fields found in the gauge slice, distinct flux vectors, classes
  solutions: number
  fluxVectors: number
  classes: CenterClass[]
  complete: boolean
  nodes: number
  seconds: number
}

export function enumerateCenterCell(cell: Cell, limit = 2_000_000): CenterCellEnumeration {
  const started = Date.now()
  const { p } = cell
  const varOf = new Int32Array(p * SLOTS).fill(-1)
  const sgn = new Int8Array(p * SLOTS)

  let nv = 0

  for (let l = 0; l < p * SLOTS; l++) {
    if (varOf[l]! >= 0) {
      continue
    }

    const partner = cell.next[l]! * SLOTS + OPPOSITE[l % SLOTS]!

    varOf[l] = nv
    sgn[l] = 1
    varOf[partner] = nv
    sgn[partner] = -1
    nv++
  }

  // oriented triangle (i, t): flux = c(i, a) + c(next(i, a), b) - c(i, s), as coefficients on variables
  type Term = { v: number; k: number }
  const triTerms: Term[][] = []

  for (let i = 0; i < p; i++) {
    for (const [a, b, s] of TRIANGLES) {
      const ia = cell.next[i * SLOTS + a]!
      const raw: [number, number][] = [
        [varOf[i * SLOTS + a]!, sgn[i * SLOTS + a]!],
        [varOf[ia * SLOTS + b]!, sgn[ia * SLOTS + b]!],
        [varOf[i * SLOTS + s]!, -sgn[i * SLOTS + s]!],
      ]
      const m = new Map<number, number>()

      raw.forEach(([v, k]) => m.set(v, mod((m.get(v) ?? 0) + k, 3)))
      triTerms.push([...m].filter(([, k]) => k !== 0).map(([v, k]) => ({ v, k })))
    }
  }

  // distinct constraints (a triangle and its reverses: equal up to sign)
  const cons = new Map<string, Term[]>()

  for (const terms of triTerms) {
    const sorted = [...terms].sort((x, y) => x.v - y.v)
    const neg = sorted.map(t => ({ v: t.v, k: mod(-t.k, 3) }))
    const ka = sorted.map(t => `${t.v}:${t.k}`).join(',')
    const kb = neg.map(t => `${t.v}:${t.k}`).join(',')

    cons.set(ka < kb ? ka : kb, sorted)
  }

  const constraints = [...cons.values()]
  const empty = constraints.some(t => t.length === 0)
  // the gauge slice
  const fixed = new Map<number, number>(BASIS_SLOTS.map(d => [varOf[d]!, 0]))
  // the order: greedily the variable completing the most constraints
  const order: number[] = []
  const placed = new Set<number>(fixed.keys())

  while (placed.size < nv) {
    let best = -1
    let bestScore = -1

    for (let v = 0; v < nv; v++) {
      if (placed.has(v)) {
        continue
      }

      let complete = 0
      let touch = 0

      for (const c of constraints) {
        if (!c.some(t => t.v === v)) {
          continue
        }

        touch++

        if (c.every(t => t.v === v || placed.has(t.v))) {
          complete++
        }
      }

      const score = complete * 1000 + touch

      if (score > bestScore) {
        bestScore = score
        best = v
      }
    }

    order.push(best)
    placed.add(best)
  }

  // constraints checked when their last variable in the order is assigned (fixed-only ones checked at once)
  const pos = new Int32Array(nv).fill(-1)

  order.forEach((v, i) => (pos[v] = i))

  const checkAt: Term[][][] = order.map(() => [])
  const val = new Int8Array(nv)

  fixed.forEach((x, v) => (val[v] = x))

  let fixedOk = !empty

  for (const c of constraints) {
    const last = Math.max(...c.map(t => pos[t.v]!))

    if (last < 0) {
      if (c.reduce((s, t) => s + t.k * val[t.v]!, 0) % 3 === 0) {
        fixedOk = false
      }
    } else {
      checkAt[last]!.push(c)
    }
  }

  const fluxOf = (): Int8Array => {
    const out = new Int8Array(p * TRIANGLES.length)

    triTerms.forEach((terms, n) => {
      out[n] = mod(terms.reduce((s, t) => s + t.k * val[t.v]!, 0), 3)
    })

    return out
  }
  const raw = new Map<string, Int8Array>()

  let solutions = 0
  let nodes = 0
  let complete = true

  const dfs = (depth: number): void => {
    if (!complete) {
      return
    }

    if (depth === order.length) {
      solutions++

      const flux = fluxOf()
      const key = flux.join('')

      if (!raw.has(key)) {
        raw.set(key, Int8Array.from(val))

        if (raw.size > limit) {
          complete = false
        }
      }

      return
    }

    const v = order[depth]!

    for (let x = 0; x < 3; x++) {
      val[v] = x
      nodes++

      let ok = true

      for (const c of checkAt[depth]!) {
        let s = 0

        for (const t of c) {
          s += t.k * val[t.v]!
        }

        if (s % 3 === 0) {
          ok = false
          break
        }
      }

      if (ok) {
        dfs(depth + 1)
      }
    }

    val[v] = 0
  }

  if (fixedOk) {
    dfs(0)
  }

  // classes: flux vectors modulo L's rotations and the cell's translations
  const triIndex = new Map<number, number>(TRIANGLES.map(([a, b], t) => [a * SLOTS + b, t]))
  const transforms: ((flux: Int8Array) => Int8Array)[] = []

  for (const gi of cell.stabilizer) {
    const g = ROTATIONS[gi]!
    const tmap = Int32Array.from(TRIANGLES, ([a, b]) => triIndex.get(g.slot[a]! * SLOTS + g.slot[b]!)!)

    for (let tau = 0; tau < p; tau++) {
      transforms.push(flux => {
        const out = new Int8Array(flux.length)

        for (let i = 0; i < p; i++) {
          const j = mod(cell.dockMap[gi * p + i]! + tau, p)

          for (let t = 0; t < TRIANGLES.length; t++) {
            out[j * TRIANGLES.length + tmap[t]!] = flux[i * TRIANGLES.length + t]!
          }
        }

        return out
      })
    }
  }

  const seen = new Set<string>()
  const classes: CenterClass[] = []

  for (const [key, v] of raw) {
    if (seen.has(key)) {
      continue
    }

    const flux = Int8Array.from(key, ch => Number(ch))
    const orbit = new Set(transforms.map(T => T(flux).join('')))

    orbit.forEach(k => seen.add(k))

    const c = Array.from({ length: p * SLOTS }, (_, l) => mod(sgn[l]! * v[varOf[l]!]!, 3))
    const n = TRIANGLES.length
    const uniform = Array.from({ length: p }, (_, i) => i).every(i =>
      Array.from({ length: n }, (_, t) => t).every(t => flux[i * n + t] === flux[t]),
    )

    classes.push({ c, orbit: orbit.size, uniform })
  }

  return {
    p,
    lambda: cell.lambda,
    variables: nv,
    constraints: constraints.length,
    solutions,
    fluxVectors: raw.size,
    classes,
    complete,
    nodes,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- FAMILY G: the grid-move fields ----

export type GridMoveClass = {
  // v on the four basis vectors, (a, b) each
  V: number[]
  orbit: number
  // the map's rank (0, 1, 2) and the oriented triangles a dock with [v_a, v_b] = 0
  rank: number
  flatTriangles: number
}

export type GridMoveEnumeration = { maps: number; classes: GridMoveClass[]; allNonflat: number; seconds: number }

const SL23: readonly number[][] = (() => {
  const out: number[][] = []

  for (let n = 0; n < 81; n++) {
    const m = [Math.floor(n / 27), Math.floor(n / 9) % 3, Math.floor(n / 3) % 3, n % 3]

    if (mod(m[0]! * m[3]! - m[1]! * m[2]!, 3) === 1) {
      out.push(m)
    }
  }

  return out
})()

export function enumerateGridMoves(): GridMoveEnumeration {
  const started = Date.now()
  const keyOf = (v: [number, number][]): string => v.map(([a, b]) => a * 3 + b).join('')
  const seen = new Set<string>()
  const classes: GridMoveClass[] = []

  let allNonflat = 0

  for (let n = 0; n < 3 ** 8; n++) {
    const V = Array.from({ length: 8 }, (_, k) => Math.floor(n / 3 ** k) % 3)
    const v = rootDisplacements(V)
    const key = keyOf(v)

    if (seen.has(key)) {
      continue
    }

    const orbit = new Set<string>()

    for (const A of SL23) {
      const av = v.map(([a, b]): [number, number] => [mod(A[0]! * a + A[1]! * b, 3), mod(A[2]! * a + A[3]! * b, 3)])

      for (const g of ROTATIONS) {
        const r: [number, number][] = Array.from({ length: SLOTS }, () => [0, 0])

        for (let d = 0; d < SLOTS; d++) {
          r[g.slot[d]!] = av[d]!
        }

        orbit.add(keyOf(r))
      }
    }

    orbit.forEach(k => seen.add(k))

    const flatTriangles = TRIANGLES.filter(([a, b]) => mod(v[a]![0] * v[b]![1] - v[a]![1] * v[b]![0], 3) === 0).length
    // rank 2 when two values are independent ([u, w] != 0), 1 when some value is non-zero, else 0
    const rank = v.some(([a, b]) => v.some(([c, e]) => mod(a * e - b * c, 3) !== 0))
      ? 2
      : v.some(([a, b]) => a !== 0 || b !== 0)
        ? 1
        : 0

    if (flatTriangles === 0) {
      allNonflat++
    }

    classes.push({ V, orbit: orbit.size, rank, flatTriangles })
  }

  return { maps: 3 ** 8, classes, allNonflat, seconds: (Date.now() - started) / 1000 }
}
