// WHERE A DISTURBANCE OF THE SEA REACHES, EXACTLY (E-FND-0157). The register rule (E-SPN-0160: the swap coin, the
// dock-wide mixer on the singlet sector, the Clifford partner, the 8-component Cl+(4) register) and its chiral Wilson
// variant (E-SPN-0166, E-SPN-0168: the Wilson units on one register half) run on a periodic D4 box, one member's
// amplitude at a time. On the full love sea one hole is exactly one member (E-SPN-0163, by Jacobi), so the support of a
// member's amplitude is the support of a hole's: where a disturbance of the vacuum reaches.
//
// THE ARITHMETIC IS EXACT. Every piece is P = X (1 + sum_k (u_k - 1) q_k), with q_k an integer matrix over a small scale
// (24 Q_S, 48 Q_D, 2 P+, 96 Q_D P+, 48 Q_S P+) and u_k a norm-one number of Z[w][1/42]. The map Z[w][1/42] -> F_p that
// sends w to a root of x^2 + x + 1 (p = 1 mod 3, p prime to 42) is a ring homomorphism, so the whole run maps to F_p
// exactly. A value NONZERO mod p is nonzero in the ring: support read mod p is a lower bound on the true support, and a
// PROOF of every entry it finds. A zero mod p is zero in the ring or a multiple of p, so two primes are run and a zero
// is only called a zero when both agree (for the gates that need a zero: the controls and the reversal).
//
//   primeField        the largest prime below a bound with p = 1 mod 3, and w mod p
//   ringValue         a + b w over den, mod p
//   fieldPiece        the 192 x 192 piece X (1 + sum (u_k - 1) q_k) mod p, sparse by row, and its inverse (1 + sum
//                     (conj u_k - 1) q_k) X
//   boxOf             the D4 box of the given side (lattice-basis cells, code/substrate/d4-box-integer), its stream table,
//                     and the root distance of every cell from cell 0 (breadth first on the 24 root steps)
//   fieldBeat         one beat mod p: the piece at every cell, then the stream (slot d of cell x to slot d of x + r_d)
//   fieldBeatBack     its exact inverse
//   lineCover         which (cell, line) pairs hold a nonzero amplitude, the 12 lines being the opposite-slot pairs
//   translate         the box translation by a root, on a state
//
// DETERMINISM: no random numbers; the primes are found by a fixed search. EXACT: everything mod p is integer arithmetic
// below 2^53 (p < 2^25, so a product and a sum stay below 2^51).

import { mod, powMod } from '@/code/algebra/linear/modular-linear'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { d4BoxMesh } from '@/code/substrate/d4-box-integer'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG

export type Field = { p: number; w: number }

const isPrime = (n: number): boolean => {
  if (n < 2) {
    return false
  }

  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      return false
    }
  }

  return true
}

export const invMod = (x: number, p: number): number =>
  powMod(x, p - 2, p)

// the largest prime p < bound with p = 1 mod 3, and a primitive cube root of unity w mod p (w != 1, w^3 = 1)
export function primeField(bound: number): Field {
  for (let p = bound - 1; p > 7; p--) {
    if (p % 3 !== 1 || !isPrime(p)) {
      continue
    }

    for (let g = 2; g < p; g++) {
      const w = powMod(g, (p - 1) / 3, p)

      if (w !== 1) {
        return { p, w }
      }
    }
  }

  throw new Error('no prime found')
}

// (a + b w) / den mod p
export function ringValue(
  f: Field,
  a: bigint,
  b: bigint,
  den: bigint,
): number {
  const p = BigInt(f.p)
  const A = Number(((a % p) + p) % p)
  const B = Number(((b % p) + p) % p)
  const D = Number(((den % p) + p) % p)

  return (mod(A + ((B * f.w) % f.p), f.p) * invMod(D, f.p)) % f.p
}

export const unitValue = (f: Field, u: RingUnit): number =>
  ringValue(f, u.num[0], u.num[1], u.den)

// conj(a + b w) = (a - b) - b w
export const conjUnit = (u: RingUnit): RingUnit => ({
  num: [u.num[0] - u.num[1], -u.num[1]],
  den: u.den,
})

export const mulUnit = (u: RingUnit, v: RingUnit): RingUnit => {
  const [a, b] = u.num
  const [c, d] = v.num

  // (a + b w)(c + d w) = ac + (ad + bc) w + bd w^2, w^2 = -1 - w
  return {
    num: [a * c - b * d, a * d + b * c - b * d],
    den: u.den * v.den,
  }
}

// an integer matrix (row-major 192 x 192) over its scale: the projector q = M / scale
export type IntProjector = { M: Float64Array; scale: number }

// a sparse matrix mod p by row
export type FieldMatrix = {
  start: Int32Array
  col: Int32Array
  val: Float64Array
}

function sparse(dense: Float64Array, p: number): FieldMatrix {
  const start = new Int32Array(MODES + 1)
  const col: number[] = []
  const val: number[] = []

  for (let i = 0; i < MODES; i++) {
    start[i] = col.length

    for (let j = 0; j < MODES; j++) {
      const x = mod(dense[i * MODES + j]!, p)

      if (x !== 0) {
        col.push(j)
        val.push(x)
      }
    }
  }

  start[MODES] = col.length

  return {
    start,
    col: Int32Array.from(col),
    val: Float64Array.from(val),
  }
}

export type FieldMixer = { q: IntProjector; unit: RingUnit }

// G = 1 + sum (u_k - 1) q_k mod p, as a dense matrix of residues
function fieldG(
  f: Field,
  mixers: readonly FieldMixer[],
  conjugate: boolean,
): Float64Array {
  const g = new Float64Array(MODES * MODES)

  for (let i = 0; i < MODES; i++) {
    g[i * MODES + i] = 1
  }

  for (const m of mixers) {
    const u = unitValue(f, conjugate ? conjUnit(m.unit) : m.unit)
    const c = (mod(u - 1, f.p) * invMod(m.q.scale, f.p)) % f.p

    for (let k = 0; k < MODES * MODES; k++) {
      const x = m.q.M[k]!

      if (x !== 0) {
        g[k] = mod(g[k]! + ((c * mod(x, f.p)) % f.p), f.p)
      }
    }
  }

  return g
}

// P = X G (row i of P is row X(i) of G: X sends slot d to its opposite and keeps the register) and P^-1 = G^-1 X
export function fieldPiece(
  f: Field,
  mixers: readonly FieldMixer[],
): { forward: FieldMatrix; back: FieldMatrix } {
  const G = fieldG(f, mixers, false)
  const Ginv = fieldG(f, mixers, true)
  const P = new Float64Array(MODES * MODES)
  const B = new Float64Array(MODES * MODES)

  for (let i = 0; i < MODES; i++) {
    const from = OPPOSITE[Math.floor(i / REG)]! * REG + (i % REG)

    for (let j = 0; j < MODES; j++) {
      P[i * MODES + j] = G[from * MODES + j]!
      // (G^-1 X)[i][j] = G^-1[i][X(j)]
      B[i * MODES + j] =
        Ginv[i * MODES + OPPOSITE[Math.floor(j / REG)]! * REG + (j % REG)]!
    }
  }

  return { forward: sparse(P, f.p), back: sparse(B, f.p) }
}

export type Box = {
  side: number
  cells: number
  // next[x * 24 + d] = the cell x + r_d, prev[x * 24 + d] = x - r_d
  next: Int32Array
  prev: Int32Array
  // the root distance of every cell from cell 0
  distance: Int32Array
}

export function boxOf(side: number): Box {
  const mesh = d4BoxMesh({ side })
  const cells = mesh.cellCount
  const next = new Int32Array(cells * SLOTS)
  const prev = new Int32Array(cells * SLOTS)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const y = mesh.neighbour(x, d)

      next[x * SLOTS + d] = y
      prev[y * SLOTS + d] = x
    }
  }

  const distance = new Int32Array(cells).fill(-1)
  let frontier = [0]

  distance[0] = 0

  while (frontier.length > 0) {
    const out: number[] = []

    for (const x of frontier) {
      for (let d = 0; d < SLOTS; d++) {
        const y = next[x * SLOTS + d]!

        if (distance[y]! < 0) {
          distance[y] = distance[x]! + 1
          out.push(y)
        }
      }
    }

    frontier = out
  }

  return { side, cells, next, prev, distance }
}

export const newState = (box: Box): Float64Array =>
  new Float64Array(box.cells * MODES)

function applyPiece(
  box: Box,
  P: FieldMatrix,
  v: Float64Array,
  p: number,
): Float64Array {
  const out = new Float64Array(v.length)

  for (let x = 0; x < box.cells; x++) {
    const off = x * MODES

    let any = false

    for (let j = 0; j < MODES; j++) {
      if (v[off + j] !== 0) {
        any = true
        break
      }
    }

    if (!any) {
      continue
    }

    for (let i = 0; i < MODES; i++) {
      let acc = 0

      for (let k = P.start[i]!; k < P.start[i + 1]!; k++) {
        const y = v[off + P.col[k]!]!

        if (y !== 0) {
          acc = (acc + P.val[k]! * y) % p
        }
      }

      out[off + i] = acc
    }
  }

  return out
}

// the stream: slot d of cell x is taken by slot d of cell x + r_d (forward) or of x - r_d (back)
function stream(box: Box, v: Float64Array, back: boolean): Float64Array {
  const out = new Float64Array(v.length)
  const table = back ? box.prev : box.next

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const y = table[x * SLOTS + d]!
      const from = x * MODES + d * REG
      const to = y * MODES + d * REG

      for (let a = 0; a < REG; a++) {
        out[to + a] = v[from + a]!
      }
    }
  }

  return out
}

export const fieldBeat = (
  box: Box,
  P: FieldMatrix,
  v: Float64Array,
  p: number,
): Float64Array => stream(box, applyPiece(box, P, v, p), false)

export const fieldBeatBack = (
  box: Box,
  Pinv: FieldMatrix,
  v: Float64Array,
  p: number,
): Float64Array => applyPiece(box, Pinv, stream(box, v, true), p)

// the line of each slot: 0 .. 11, a slot and its opposite share one
export const LINE_OF: Int32Array = (() => {
  const line = new Int32Array(SLOTS).fill(-1)

  let next = 0

  for (let d = 0; d < SLOTS; d++) {
    if (line[d]! < 0) {
      line[d] = next
      line[OPPOSITE[d]!] = next
      next++
    }
  }

  return line
})()

export type Cover = {
  // (cell, line) pairs holding a nonzero amplitude, of cells * 12
  pairs: number
  // cells holding any nonzero amplitude
  cells: number
  // the distinct lines reached anywhere
  lines: number
  // the largest root distance from cell 0 of a reached cell
  reach: number
}

export function lineCover(box: Box, v: Float64Array): Cover {
  let pairs = 0
  let cells = 0
  let reach = 0

  const anywhere = new Set<number>()

  for (let x = 0; x < box.cells; x++) {
    const seen = new Set<number>()

    for (let d = 0; d < SLOTS; d++) {
      for (let a = 0; a < REG; a++) {
        if (v[x * MODES + d * REG + a] !== 0) {
          seen.add(LINE_OF[d]!)
          break
        }
      }
    }

    if (seen.size > 0) {
      cells++
      pairs += seen.size
      reach = Math.max(reach, box.distance[x]!)
      seen.forEach(l => anywhere.add(l))
    }
  }

  return { pairs, cells, lines: anywhere.size, reach }
}

// the translation by root d: the value at cell x moves to cell x + r_d, every mode kept
export function translate(
  box: Box,
  v: Float64Array,
  d: number,
): Float64Array {
  const out = new Float64Array(v.length)

  for (let x = 0; x < box.cells; x++) {
    const y = box.next[x * SLOTS + d]!

    for (let i = 0; i < MODES; i++) {
      out[y * MODES + i] = v[x * MODES + i]!
    }
  }

  return out
}

export const sameState = (a: Float64Array, b: Float64Array): boolean =>
  a.every((x, i) => x === b[i])

// ---- the same beat in floats, as the instrument and for the weights ----

export type FloatState = { re: Float64Array; im: Float64Array }

export const newFloat = (box: Box): FloatState => ({
  re: new Float64Array(box.cells * MODES),
  im: new Float64Array(box.cells * MODES),
})

// one beat in floats: the float piece P (row-major [to][from], code/measure/wilson-register mixerPiece or
// code/measure/spinor-register registerPiece) at every cell, then the stream
export function floatBeat(
  box: Box,
  P: { re: Float64Array; im: Float64Array },
  v: FloatState,
): FloatState {
  const mid = newFloat(box)

  for (let x = 0; x < box.cells; x++) {
    const off = x * MODES

    let any = false

    for (let j = 0; j < MODES; j++) {
      if (v.re[off + j] !== 0 || v.im[off + j] !== 0) {
        any = true
        break
      }
    }

    if (!any) {
      continue
    }

    for (let i = 0; i < MODES; i++) {
      let yr = 0
      let yi = 0

      for (let j = 0; j < MODES; j++) {
        const pr = P.re[i * MODES + j]!
        const pi = P.im[i * MODES + j]!

        if (pr === 0 && pi === 0) {
          continue
        }

        const xr = v.re[off + j]!
        const xi = v.im[off + j]!

        yr += pr * xr - pi * xi
        yi += pr * xi + pi * xr
      }

      mid.re[off + i] = yr
      mid.im[off + i] = yi
    }
  }

  return {
    re: stream(box, mid.re, false),
    im: stream(box, mid.im, false),
  }
}

// the float support at a threshold, as a residue-free state (1 where |amplitude| > threshold): read through lineCover
export function floatSupport(
  v: FloatState,
  threshold: number,
): Float64Array {
  return v.re.map((x, i) => (Math.hypot(x, v.im[i]!) > threshold ? 1 : 0))
}

// the weight on cell 0 and the root-sum sum_d r_d |psi_d|^2 (the slots' directions weighted by their occupation)
export function floatReads(
  box: Box,
  v: FloatState,
  roots: readonly (readonly number[])[],
): { home: number; rootSum: number[]; total: number } {
  let home = 0
  let total = 0

  const rootSum = [0, 0, 0, 0]

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      let w = 0

      for (let a = 0; a < REG; a++) {
        const i = x * MODES + d * REG + a

        w += v.re[i]! ** 2 + v.im[i]! ** 2
      }

      total += w

      if (x === 0) {
        home += w
      }

      for (let k = 0; k < 4; k++) {
        rootSum[k]! += roots[d]![k]! * w
      }
    }
  }

  return { home, rootSum, total }
}
