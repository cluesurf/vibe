// SPECTRAL FLOW OF THE REGISTER'S CHIRAL HALVES UNDER A GAUGE WINDING (the member-number anomaly test). E-SPN-0160's
// member carries the Cl+(4) register, and E-FRC-0258's J (right multiplication by vol) splits it into two halves, each
// with its own Dirac structure. This file couples the member's hop to a link field and reads what a winding of that
// field does to each half's levels.
//
//   halfPieces          E-SPN-0160's two-beat pieces rotated to the chirality basis and cut to one half (96 modes), with
//                       the weight the rotation leaves between the halves (zero for a J-keeping piece)
//   halfCycle           the cycle S P2 S P1 of one half on a MAGNETIC SUPERCELL: q husk sites along x0 (classes of x0 mod
//                       q, representative p_j = (j, j, 0, 0), a D4 point), a uniform field F01 = B = 2 pi p / q in the
//                       Landau gauge A1 = B x0 (a hop by r from x picks the straight-line integral B r1 (x0 + r0 / 2)),
//                       Bloch momentum K on the sublattice {t in D4 : t0 = 0 mod q}, and an optional pure-gauge phase
//                       chi(j) per class. q = 1, B = 0 is the plain Bloch cycle, S = diag(exp(-i K . r)). A uniform
//                       vector potential (a flux threaded through the husk torus) is a shift of K
//   complexDeterminant  det of a complex matrix by LU with partial pivoting: its phase, and log |det|
//   windingOfDet        the net number of times det turns around the circle along a closed path of the matrix: for a
//                       unitary, the net spectral flow through ANY reference phase (the flow through two phases differs
//                       by the change in the number of levels between them, which a closed path returns)
//   halfPeriods         the 16 points pi D4* mod 2 pi D4*, where every exp(i K . r) is +-1: each a zero of the Dirac
//                       vector s(K) = sum_r r sin(K . r), with its Jacobian sum_r r r^T cos(K . r) (an integer matrix)
//                       and the Wilson count W(K) = sum_r (1 - cos(K . r))
//   scanZeros           every zero of s(K) on the Brillouin torus R^4 / 2 pi D4*, found from a grid of the double cover
//                       [0, 2 pi)^4 by Newton's method and deduplicated modulo 2 pi D4*
//
// DETERMINISM: no random numbers (grids and Weyl sequences). Floats, as measurement; the Jacobians and Wilson counts are
// integers.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import {
  sectorBlock,
  SECTOR_MODES,
} from '@/code/measure/chiral-register'
import { det4 } from '@/code/measure/chiral-register'

type Roots = readonly (readonly number[])[]

const SLOTS = 24
const HALF = SECTOR_MODES / SLOTS
const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)
const wrapAngle = (x: number): number =>
  Math.atan2(Math.sin(x), Math.cos(x))

// ---- one half's pieces ----

export type HalfPieces = { pieces: CMatrix[]; leak: number }

// each 192-mode piece rotated to the chirality basis and cut to one half; leak is the largest weight left between the
// halves over all pieces
export function halfPieces(
  pieces192: readonly CMatrix[],
  basis: readonly (readonly number[])[],
  half: 0 | 1,
): HalfPieces {
  let leak = 0

  const pieces = pieces192.map(P => {
    const b = sectorBlock(P, basis, half)

    leak = Math.max(leak, b.leak)

    return b.block
  })

  return { pieces, leak }
}

// ---- the magnetic supercell cycle of one half ----

export type Field = {
  /** Classes of x0 mod q in the supercell (1 for no magnetic field). */
  q: number
  /** The flux quantum count p of the field F01 = 2 pi p / q. */
  p: number
  /** A pure-gauge phase per class, or none. */
  chi?: readonly number[]
}

const representative = (j: number): number[] => [j, j, 0, 0]

// the stream of one half on the supercell: mode (j, d, a) goes to (j', d, a), j' = (j + r0) mod q, with the Peierls
// phase and the Bloch phase exp(-i K . (p_j + r_d - p_j')); returned as the target index and the phase of each mode
function stream(
  field: Field,
  K: readonly number[],
  roots: Roots,
): { to: Int32Array; re: Float64Array; im: Float64Array } {
  const q = field.q
  const B = (2 * Math.PI * field.p) / q
  const n = SECTOR_MODES * q
  const to = new Int32Array(n)
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  for (let j = 0; j < q; j++) {
    const pj = representative(j)

    for (let d = 0; d < SLOTS; d++) {
      const r = roots[d]!
      const jp = (((j + r[0]!) % q) + q) % q
      const pjp = representative(jp)
      const disp = [0, 1, 2, 3].map(k => pj[k]! + r[k]! - pjp[k]!)
      const peierls = B * r[1]! * (j + r[0]! / 2)
      const gauge = field.chi ? field.chi[jp]! - field.chi[j]! : 0
      const phase = peierls + gauge - dot(K, disp)

      for (let a = 0; a < HALF; a++) {
        const from = j * SECTOR_MODES + d * HALF + a

        to[from] = jp * SECTOR_MODES + d * HALF + a
        re[from] = Math.cos(phase)
        im[from] = Math.sin(phase)
      }
    }
  }

  return { to, re, im }
}

// out = S (P (x) 1_q) v for a column block: the piece acts within each class, then the stream moves and phases
function beatMatrix(
  piece: CMatrix,
  field: Field,
  K: readonly number[],
  roots: Roots,
): CMatrix {
  const m = SECTOR_MODES
  const q = field.q
  const n = m * q
  const s = stream(field, K, roots)
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  // (S P)[to(i), j-block col] = phase(i) P[i, col] within the class of i
  for (let j = 0; j < q; j++) {
    for (let i = 0; i < m; i++) {
      const from = j * m + i
      const row = s.to[from]!
      const cr = s.re[from]!
      const ci = s.im[from]!

      for (let c = 0; c < m; c++) {
        const pr = piece.re[i * m + c]!
        const pi = piece.im[i * m + c]!

        if (pr === 0 && pi === 0) {
          continue
        }

        re[row * n + j * m + c] = cr * pr - ci * pi
        im[row * n + j * m + c] = cr * pi + ci * pr
      }
    }
  }

  return { re, im }
}

function cmul(a: CMatrix, b: CMatrix, n: number): CMatrix {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j]!
        const bi = b.im[k * n + j]!

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// the half's cycle U = S P_N ... S P_1, beat 1 first
export function halfCycle(
  pieces: readonly CMatrix[],
  field: Field,
  K: readonly number[],
  roots: Roots = DOCK_ROOTS,
): { U: CMatrix; n: number } {
  const n = SECTOR_MODES * field.q

  let U = beatMatrix(pieces[0]!, field, K, roots)

  for (let b = 1; b < pieces.length; b++) {
    U = cmul(beatMatrix(pieces[b]!, field, K, roots), U, n)
  }

  return { U, n }
}

export function halfPhases(
  pieces: readonly CMatrix[],
  field: Field,
  K: readonly number[],
  roots: Roots = DOCK_ROOTS,
): number[] {
  const { U, n } = halfCycle(pieces, field, K, roots)
  const e = complexEigenvalues({ re: U.re, im: U.im, n })

  return e.re.map((x, i) => Math.atan2(e.im[i]!, x))
}

// ---- determinants and winding ----

export function complexDeterminant(
  M: CMatrix,
  n: number,
): { phase: number; logAbs: number } {
  const re = Float64Array.from(M.re)
  const im = Float64Array.from(M.im)

  let phase = 0
  let logAbs = 0

  for (let c = 0; c < n; c++) {
    let p = c
    let best = -1

    for (let r = c; r < n; r++) {
      const w = Math.hypot(re[r * n + c]!, im[r * n + c]!)

      if (w > best) {
        best = w
        p = r
      }
    }

    if (best === 0) {
      return { phase: NaN, logAbs: -Infinity }
    }

    if (p !== c) {
      for (let k = 0; k < n; k++) {
        const tr = re[c * n + k]!
        const ti = im[c * n + k]!

        re[c * n + k] = re[p * n + k]!
        im[c * n + k] = im[p * n + k]!
        re[p * n + k] = tr
        im[p * n + k] = ti
      }

      phase += Math.PI
    }

    const ar = re[c * n + c]!
    const ai = im[c * n + c]!
    const den = ar * ar + ai * ai

    phase += Math.atan2(ai, ar)
    logAbs += 0.5 * Math.log(den)

    for (let r = c + 1; r < n; r++) {
      const br = re[r * n + c]!
      const bi = im[r * n + c]!

      if (br === 0 && bi === 0) {
        continue
      }

      // f = b / a
      const fr = (br * ar + bi * ai) / den
      const fi = (bi * ar - br * ai) / den

      for (let k = c; k < n; k++) {
        const xr = re[c * n + k]!
        const xi = im[c * n + k]!

        re[r * n + k]! -= fr * xr - fi * xi
        im[r * n + k]! -= fr * xi + fi * xr
      }
    }
  }

  return { phase: wrapAngle(phase), logAbs }
}

export type Winding = {
  winding: number
  maxStep: number
  spread: number
  logAbsMax: number
}

// along a closed path of matrices (the last point equal to the first), the net turns of det; maxStep is the largest
// phase change between neighbors (the resolution), spread the largest departure of arg det from its start
export function windingOfDet(
  at: (t: number) => { U: CMatrix; n: number },
  steps: number,
): Winding {
  let total = 0
  let maxStep = 0
  let spread = 0
  let logAbsMax = 0

  const first = complexDeterminant(at(0).U, at(0).n)

  let prev = first.phase

  for (let s = 1; s <= steps; s++) {
    const m = at(s / steps)
    const d = complexDeterminant(m.U, m.n)
    const step = wrapAngle(d.phase - prev)

    total += step
    maxStep = Math.max(maxStep, Math.abs(step))
    spread = Math.max(
      spread,
      Math.abs(wrapAngle(d.phase - first.phase)),
    )
    logAbsMax = Math.max(logAbsMax, Math.abs(d.logAbs))
    prev = d.phase
  }

  return { winding: total / (2 * Math.PI), maxStep, spread, logAbsMax }
}

// ---- the zeros of the Dirac vector ----

export type HalfPeriod = {
  K: number[]
  sZero: boolean
  jacobian: number[][]
  det: number
  wilson: number
}

// the 16 classes of pi D4* / 2 pi D4*: the integer vectors in {0,1}^4 modulo adding (1,1,1,1), and the half-integer
// vectors (1/2)(+-1, ...) modulo the same, each times pi
export function halfPeriods(roots: Roots = DOCK_ROOTS): HalfPeriod[] {
  const reps: number[][] = []
  const seen = new Set<string>()

  const keyOf = (v: readonly number[]): string => {
    // reduce modulo 2 D4*: D4* = Z^4 u (Z^4 + h), so 2 D4* = 2 Z^4 u (2 Z^4 + 1); take the lexicographically least of v
    // and v + (1,1,1,1), each reduced mod 2
    const mod2 = (x: number): number => ((x % 2) + 2) % 2
    const a = v.map(mod2)
    const b = v.map(x => mod2(x + 1))

    return [a.join(','), b.join(',')].sort()[0]!
  }

  for (const half of [0, 0.5]) {
    for (let mask = 0; mask < 16; mask++) {
      const v = [0, 1, 2, 3].map(k => ((mask >> k) & 1) + half)
      const k = keyOf(v)

      if (seen.has(k)) {
        continue
      }

      seen.add(k)
      reps.push(v)
    }
  }

  return reps.map(v => {
    const K = v.map(x => Math.PI * x)
    const eps = roots.map(r => Math.round(Math.cos(dot(K, r))))
    const sZero = roots.every(
      r => Math.abs(Math.sin(dot(K, r))) < 1e-12,
    )
    const jacobian = [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j =>
        roots.reduce((s, r, d) => s + eps[d]! * r[i]! * r[j]!, 0),
      ),
    )

    return {
      K,
      sZero,
      jacobian,
      det: det4(jacobian),
      wilson: eps.reduce((s, e) => s + (1 - e), 0),
    }
  })
}

// s(K) = sum_r r sin(K . r) and its Jacobian
function sField(
  K: readonly number[],
  roots: Roots,
): { s: number[]; J: number[][] } {
  const s = [0, 0, 0, 0]
  const J = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

  for (const r of roots) {
    const t = dot(K, r)
    const sn = Math.sin(t)
    const cs = Math.cos(t)

    for (let i = 0; i < 4; i++) {
      s[i]! += r[i]! * sn

      for (let j = 0; j < 4; j++) {
        J[i]![j]! += r[i]! * r[j]! * cs
      }
    }
  }

  return { s, J }
}

// the determinant of a real 4 x 4 matrix, unrounded (det4 rounds to an integer, right only for integer matrices)
function floatDet4(m: readonly (readonly number[])[]): number {
  const a = m.map(r => [...r])

  let d = 1

  for (let c = 0; c < 4; c++) {
    let p = c

    for (let r = c + 1; r < 4; r++) {
      if (Math.abs(a[r]![c]!) > Math.abs(a[p]![c]!)) {
        p = r
      }
    }

    if (Math.abs(a[p]![c]!) < 1e-14) {
      return 0
    }

    if (p !== c) {
      ;[a[p], a[c]] = [a[c]!, a[p]!]
      d = -d
    }

    d *= a[c]![c]!

    for (let r = c + 1; r < 4; r++) {
      const f = a[r]![c]! / a[c]![c]!

      for (let k = c; k < 4; k++) {
        a[r]![k]! -= f * a[c]![k]!
      }
    }
  }

  return d
}

// solve J x = b (4 x 4, partial pivoting)
function solve4(
  J: readonly (readonly number[])[],
  b: readonly number[],
): number[] | null {
  const a = J.map((row, i) => [...row, b[i]!])

  for (let c = 0; c < 4; c++) {
    let p = c

    for (let r = c + 1; r < 4; r++) {
      if (Math.abs(a[r]![c]!) > Math.abs(a[p]![c]!)) {
        p = r
      }
    }

    if (Math.abs(a[p]![c]!) < 1e-12) {
      return null
    }

    ;[a[p], a[c]] = [a[c]!, a[p]!]

    for (let r = 0; r < 4; r++) {
      if (r === c) {
        continue
      }

      const f = a[r]![c]! / a[c]![c]!

      for (let k = c; k < 5; k++) {
        a[r]![k]! -= f * a[c]![k]!
      }
    }
  }

  return [0, 1, 2, 3].map(i => a[i]![4]! / a[i]![i]!)
}

// K modulo 2 pi D4*: (K - K') / 2 pi all integers, or all integers plus 1/2
function sameClass(
  a: readonly number[],
  b: readonly number[],
): boolean {
  const d = a.map((x, k) => (x - b[k]!) / (2 * Math.PI))
  const frac = (x: number): number => x - Math.round(x)
  const allInt = d.every(x => Math.abs(frac(x)) < 1e-7)
  const allHalf = d.every(x => Math.abs(frac(x + 0.5)) < 1e-7)

  return allInt || allHalf
}

export type Zero = {
  K: number[]
  det: number
  halfPeriod: boolean
  wilson: number
}

// W(K) = sum_r (1 - cos(K . r)), the Wilson count at a momentum
export const wilsonCount = (
  K: readonly number[],
  roots: Roots = DOCK_ROOTS,
): number => roots.reduce((s, r) => s + 1 - Math.cos(dot(K, r)), 0)

// every zero of s on the torus: grid minima of |s| on [0, 2 pi)^4 refined by Newton, kept when |s| < 1e-10, and
// deduplicated modulo 2 pi D4*
export function scanZeros(
  grid: number,
  roots: Roots = DOCK_ROOTS,
): { zeros: Zero[]; seeds: number } {
  const h = (2 * Math.PI) / grid
  const zeros: Zero[] = []

  let seeds = 0

  const norm = (K: readonly number[]): number =>
    Math.hypot(...sField(K, roots).s)
  const at = (i: number[]): number[] => i.map(x => x * h)

  for (let a = 0; a < grid; a++) {
    for (let b = 0; b < grid; b++) {
      for (let c = 0; c < grid; c++) {
        for (let d = 0; d < grid; d++) {
          const idx = [a, b, c, d]
          const v = norm(at(idx))

          let isMin = true

          for (let k = 0; k < 4 && isMin; k++) {
            for (const step of [-1, 1]) {
              const nb = idx.map((x, j) =>
                j === k ? (((x + step) % grid) + grid) % grid : x,
              )

              if (norm(at(nb)) < v) {
                isMin = false
                break
              }
            }
          }

          if (!isMin) {
            continue
          }

          seeds++

          let K = at(idx)

          for (let it = 0; it < 60; it++) {
            const f = sField(K, roots)

            if (Math.hypot(...f.s) < 1e-13) {
              break
            }

            const dx = solve4(f.J, f.s)

            if (!dx) {
              break
            }

            K = K.map((x, k) => x - dx[k]!)
          }

          const f = sField(K, roots)

          if (Math.hypot(...f.s) > 1e-10) {
            continue
          }

          if (zeros.some(z => sameClass(z.K, K))) {
            continue
          }

          const isHalf =
            K.every(
              x =>
                Math.abs(
                  (2 * x) / Math.PI - Math.round((2 * x) / Math.PI),
                ) < 1e-8,
            ) && roots.every(r => Math.abs(Math.sin(dot(K, r))) < 1e-9)

          zeros.push({
            K,
            det: floatDet4(f.J),
            halfPeriod: isHalf,
            wilson: wilsonCount(K, roots),
          })
        }
      }
    }
  }

  return { zeros, seeds }
}

// the second Chern number of a massive lattice Dirac operator with Dirac vector s and a mass m(K) at each zero of s:
// (1/2) sum over zeros of sign(det ds/dK) sign(m) (the standard count; its size, not its sign convention, is read)
export function chernFromZeros(
  zeros: readonly { det: number }[],
  masses: readonly number[],
): number {
  return (
    zeros.reduce(
      (s, z, i) => s + Math.sign(z.det) * Math.sign(masses[i]!),
      0,
    ) / 2
  )
}
