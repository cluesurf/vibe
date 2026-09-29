// THREE FLAVORS ON THE CHIRAL REGISTER (E-FRC-0259). E-FRC-0258's member (24 slots x the Cl+(4) register, two mirror
// halves) gains a flavor index of size 3 that W(F4) does not touch: 24 x 8 x 3 = 576 modes, index (slot d, register a,
// flavor f) -> (d * 8 + a) * 3 + f. A mass step is now a 3 x 3 flavor unitary on each half's projector, and the ring's
// trimaximal mixing V_jk = w^(jk) / sqrt(-3) can sit on one half's mass. This file builds those pieces, the flavor-aware
// sector blocks, the register commutant that decides whether any piece can couple the two halves, and the exact rest
// dynamics of the one coupling there is.
//
//   QW                   exact numbers of Q(w), (a + b w) / d, w = e^(2 pi i / 3), in BigInt, and 3 x 3 / 6 x 6 matrices
//   flavorPiece          P = X (L (1 + sum_k (F_k - 1) (x) q_k)), q_k register projectors (192 x 192, real), F_k flavor
//                        unitaries, L an optional left factor 1 + (u - 1) q (x) 1 (the coupling), X the slot reversal
//   flavorSectorBlock    a 576-mode piece in the register's J eigenbasis, flavor rotated by V on the + half, cut to one
//                        (sector, flavor) block of 96 modes, with the largest weight it puts between blocks
//   rightMultiplication  R(x) w = w x on the even blades (8 x 8 integer): the commutant of every left multiplication
//   rankExact            the rank of an integer matrix (fraction-free Bareiss elimination in BigInt)
//   restToy              the exact rest-frame beat of the singlet's scalar pair (the blades 1 and vol) times flavor, with
//                        the chiral flavor masses and the one coupling of the halves, a phase on vol: 6 x 6 over Q(w)
//   transition           the exact probability, in Q, that weak flavor alpha in the - half is found as beta after t beats
//
// DETERMINISM: no random numbers. EXACT where it says so (BigInt); floats elsewhere, as measurement.

import { type CMatrix } from '@/code/measure/dock-mixer'
import { EVEN } from '@/code/measure/spinor-register'
import { eisConj, eisMul, type Eis } from '@/code/measure/swap-cone'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { type EisQ } from '@/code/measure/chiral-register'

const REG = 8
const SLOTS = 24
export const FLAVORS = 3
const RF = REG * FLAVORS
export const FLAVOR_MODES = SLOTS * RF
export const BLOCK_MODES = SLOTS * 4

type Roots = readonly (readonly number[])[]

/** A 3 x 3 (or n x n) complex matrix of floats, row-major arrays. */
export type Complex = { re: number[][]; im: number[][] }

// ---- exact Q(w) ----

/** (a + b w) / d, d > 0, reduced. */
export type QW = { a: bigint; b: bigint; d: bigint }

const bigAbs = (x: bigint): bigint => (x < 0n ? -x : x)
const gcd = (x: bigint, y: bigint): bigint => {
  let p = bigAbs(x)
  let q = bigAbs(y)

  while (q !== 0n) [p, q] = [q, p % q]

  return p
}

export function qw(a: bigint, b: bigint, d = 1n): QW {
  if (d < 0n) return qw(-a, -b, -d)

  const g = gcd(gcd(a, b), d)

  return g === 0n ? { a: 0n, b: 0n, d: 1n } : { a: a / g, b: b / g, d: d / g }
}

export const QW_ZERO = qw(0n, 0n)
export const QW_ONE = qw(1n, 0n)
export const qwAdd = (x: QW, y: QW): QW => qw(x.a * y.d + y.a * x.d, x.b * y.d + y.b * x.d, x.d * y.d)
export const qwSub = (x: QW, y: QW): QW => qw(x.a * y.d - y.a * x.d, x.b * y.d - y.b * x.d, x.d * y.d)
export const qwMul = (x: QW, y: QW): QW => {
  const p = eisMul([x.a, x.b], [y.a, y.b])

  return qw(p[0], p[1], x.d * y.d)
}
export const qwConj = (x: QW): QW => {
  const c = eisConj([x.a, x.b])

  return qw(c[0], c[1], x.d)
}
export const qwIsZero = (x: QW): boolean => x.a === 0n && x.b === 0n
export const qwEq = (x: QW, y: QW): boolean => qwIsZero(qwSub(x, y))
export const qwFromEisQ = (x: EisQ): QW => qw(x.num[0], x.num[1], x.den)
export const qwFromUnit = (u: RingUnit): QW => qw(u.num[0], u.num[1], u.den)
export const qwValue = (x: QW): [number, number] => [(Number(x.a) - Number(x.b) / 2) / Number(x.d), (Number(x.b) * Math.sqrt(3)) / 2 / Number(x.d)]
/** A real element of Q(w) (b = 0) as the fraction a / d. */
export const qwIsReal = (x: QW): boolean => x.b === 0n
/** The imaginary part's coefficient: Im(x) = (b / d) sqrt(3) / 2. */
export const qwImCoefficient = (x: QW): { num: bigint; den: bigint } => ({ num: x.b, den: x.d })

export type QWMatrix = QW[][]

export const qwMatMul = (A: QWMatrix, B: QWMatrix): QWMatrix => A.map(row => (B[0] as QW[]).map((_, j) => row.reduce((s, x, k) => qwAdd(s, qwMul(x, (B[k] as QW[])[j] as QW)), QW_ZERO)))
export const qwDagger = (A: QWMatrix): QWMatrix => (A[0] as QW[]).map((_, j) => A.map(row => qwConj(row[j] as QW)))
export const qwDiag = (xs: readonly QW[]): QWMatrix => xs.map((x, i) => xs.map((_, j) => (i === j ? x : QW_ZERO)))
export const qwIdentity = (n: number): QWMatrix => qwDiag(Array.from({ length: n }, () => QW_ONE))
export const qwMatEq = (A: QWMatrix, B: QWMatrix): boolean => A.every((row, i) => row.every((x, j) => qwEq(x, (B[i] as QW[])[j] as QW)))

// the 3 x 3 determinant
export function qwDet3(A: QWMatrix): QW {
  const a = (i: number, j: number): QW => (A[i] as QW[])[j] as QW
  const t1 = qwMul(a(0, 0), qwSub(qwMul(a(1, 1), a(2, 2)), qwMul(a(1, 2), a(2, 1))))
  const t2 = qwMul(a(0, 1), qwSub(qwMul(a(1, 0), a(2, 2)), qwMul(a(1, 2), a(2, 0))))
  const t3 = qwMul(a(0, 2), qwSub(qwMul(a(1, 0), a(2, 1)), qwMul(a(1, 1), a(2, 0))))

  return qwAdd(qwSub(t1, t2), t3)
}

export const qwToComplex = (A: QWMatrix): Complex => ({ re: A.map(r => r.map(x => qwValue(x)[0])), im: A.map(r => r.map(x => qwValue(x)[1])) })

// ---- the 576-mode pieces ----

export type FlavorPart = { q: Float64Array; F: Complex }

/**
 * P = X (L M), M = 1 + sum_k (F_k - 1) (x) q_k on the register (x) flavor, L = 1 + (u - 1) (x) q_L (x) 1 when a coupling
 * is given; row-major [to][from] on the 576 modes. X sends slot d to its opposite and keeps register and flavor.
 */
export function flavorPiece(parts: readonly FlavorPart[], coupling?: { q: Float64Array; u: readonly [number, number] }): CMatrix {
  const n = FLAVOR_MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const R = SLOTS * REG

  for (let i = 0; i < n; i++) {
    re[i * n + i] = 1
  }

  for (const { q, F } of parts) {
    for (let I = 0; I < R; I++) {
      for (let J = 0; J < R; J++) {
        const x = q[I * R + J] as number

        if (x === 0) continue
        for (let f = 0; f < FLAVORS; f++) {
          for (let g = 0; g < FLAVORS; g++) {
            const fr = ((F.re[f] as number[])[g] as number) - (f === g ? 1 : 0)
            const fi = (F.im[f] as number[])[g] as number

            re[(I * FLAVORS + f) * n + J * FLAVORS + g]! += x * fr
            im[(I * FLAVORS + f) * n + J * FLAVORS + g]! += x * fi
          }
        }
      }
    }
  }

  // the coupling, applied after: row (I, f) += (u - 1) sum_J q_L[I, J] M[(J, f), :]
  if (coupling) {
    const { q, u } = coupling
    const addRe = new Float64Array(n * n)
    const addIm = new Float64Array(n * n)

    for (let I = 0; I < R; I++) {
      for (let J = 0; J < R; J++) {
        const x = q[I * R + J] as number

        if (x === 0) continue

        const cr = (u[0] - 1) * x
        const ci = u[1] * x

        for (let f = 0; f < FLAVORS; f++) {
          const to = (I * FLAVORS + f) * n
          const from = (J * FLAVORS + f) * n

          for (let k = 0; k < n; k++) {
            const mr = re[from + k] as number
            const mi = im[from + k] as number

            if (mr === 0 && mi === 0) continue
            addRe[to + k]! += cr * mr - ci * mi
            addIm[to + k]! += cr * mi + ci * mr
          }
        }
      }
    }

    for (let k = 0; k < n * n; k++) {
      re[k]! += addRe[k] as number
      im[k]! += addIm[k] as number
    }
  }

  // X: row i of P is row X(i) of L M
  const outRe = new Float64Array(n * n)
  const outIm = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const d = Math.floor(i / RF)
    const from = (OPPOSITE[d] as number) * RF + (i % RF)

    outRe.set(re.subarray(from * n, from * n + n), i * n)
    outIm.set(im.subarray(from * n, from * n + n), i * n)
  }

  return { re: outRe, im: outIm }
}

/** The per-mode roots of the 576 modes. */
export const FLAVOR_ROOTS = (roots: Roots): Roots => Array.from({ length: FLAVOR_MODES }, (_, i) => roots[Math.floor(i / RF)] as readonly number[])

/**
 * The piece in the register's J eigenbasis (`basis`, eight vectors, the + half first), with the flavor of the + half
 * rotated by V (none: unrotated), cut to the (sector, flavor) block of 96 modes; `leak` is the largest weight the rotated
 * piece puts between any two different (sector, flavor) blocks.
 */
export function flavorSectorBlocks(P: CMatrix, basis: readonly (readonly number[])[], V: Complex | null): { blocks: CMatrix[][]; leak: number } {
  const n = FLAVOR_MODES
  // T[(a, f), (a', f')] = basis[a'][a] * (a' < 4 and V ? V[f][f'] : delta)
  const Tre = new Float64Array(RF * RF)
  const Tim = new Float64Array(RF * RF)

  for (let a = 0; a < REG; a++) {
    for (let ap = 0; ap < REG; ap++) {
      const o = (basis[ap] as number[])[a] as number

      if (o === 0) continue
      for (let f = 0; f < FLAVORS; f++) {
        for (let fp = 0; fp < FLAVORS; fp++) {
          const vr = ap < 4 && V ? ((V.re[f] as number[])[fp] as number) : f === fp ? 1 : 0
          const vi = ap < 4 && V ? ((V.im[f] as number[])[fp] as number) : 0

          Tre[(a * FLAVORS + f) * RF + ap * FLAVORS + fp] = o * vr
          Tim[(a * FLAVORS + f) * RF + ap * FLAVORS + fp] = o * vi
        }
      }
    }
  }

  // P' = T^dag P T, slot block by slot block
  const Pre = new Float64Array(n * n)
  const Pim = new Float64Array(n * n)
  const tmpRe = new Float64Array(RF * RF)
  const tmpIm = new Float64Array(RF * RF)

  for (let d = 0; d < SLOTS; d++) {
    for (let e = 0; e < SLOTS; e++) {
      // tmp = P_de T
      for (let i = 0; i < RF; i++) {
        for (let j = 0; j < RF; j++) {
          let sr = 0
          let si = 0

          for (let k = 0; k < RF; k++) {
            const pr = P.re[(d * RF + i) * n + e * RF + k] as number
            const pi = P.im[(d * RF + i) * n + e * RF + k] as number

            if (pr === 0 && pi === 0) continue

            const tr = Tre[k * RF + j] as number
            const ti = Tim[k * RF + j] as number

            sr += pr * tr - pi * ti
            si += pr * ti + pi * tr
          }

          tmpRe[i * RF + j] = sr
          tmpIm[i * RF + j] = si
        }
      }

      // out = T^dag tmp
      for (let i = 0; i < RF; i++) {
        for (let j = 0; j < RF; j++) {
          let sr = 0
          let si = 0

          for (let k = 0; k < RF; k++) {
            const tr = Tre[k * RF + i] as number
            const ti = -(Tim[k * RF + i] as number)

            if (tr === 0 && ti === 0) continue

            const xr = tmpRe[k * RF + j] as number
            const xi = tmpIm[k * RF + j] as number

            sr += tr * xr - ti * xi
            si += tr * xi + ti * xr
          }

          Pre[(d * RF + i) * n + e * RF + j] = sr
          Pim[(d * RF + i) * n + e * RF + j] = si
        }
      }
    }
  }

  const m = BLOCK_MODES
  const blocks: CMatrix[][] = [0, 1].map(() => [0, 1, 2].map(() => ({ re: new Float64Array(m * m), im: new Float64Array(m * m) })))
  const label = (i: number): { s: number; f: number; slot: number; c: number } => {
    const slot = Math.floor(i / RF)
    const a = Math.floor((i % RF) / FLAVORS)
    const f = i % FLAVORS

    return { s: a < 4 ? 0 : 1, f, slot, c: a % 4 }
  }
  let leak = 0

  for (let i = 0; i < n; i++) {
    const li = label(i)

    for (let j = 0; j < n; j++) {
      const lj = label(j)
      const wr = Pre[i * n + j] as number
      const wi = Pim[i * n + j] as number

      if (li.s === lj.s && li.f === lj.f) {
        const B = (blocks[li.s] as CMatrix[])[li.f] as CMatrix
        const bi = li.slot * 4 + li.c
        const bj = lj.slot * 4 + lj.c

        B.re[bi * m + bj] = wr
        B.im[bi * m + bj] = wi
      } else leak = Math.max(leak, Math.hypot(wr, wi))
    }
  }

  return { blocks, leak }
}

/** The (sector, all three flavors) block of 288 modes in the J eigenbasis, unrotated flavor: for spectra of one half. */
export function sectorFlavorBlock(P: CMatrix, basis: readonly (readonly number[])[], sector: 0 | 1): { block: CMatrix; leak: number } {
  const n = FLAVOR_MODES
  const m = BLOCK_MODES * FLAVORS
  const block: CMatrix = { re: new Float64Array(m * m), im: new Float64Array(m * m) }
  const rot = rotateOnly(P, basis)
  let leak = 0

  for (let i = 0; i < n; i++) {
    const si = Math.floor((i % RF) / FLAVORS) < 4 ? 0 : 1

    for (let j = 0; j < n; j++) {
      const sj = Math.floor((j % RF) / FLAVORS) < 4 ? 0 : 1
      const wr = rot.re[i * n + j] as number
      const wi = rot.im[i * n + j] as number

      if (si === sector && sj === sector) {
        const bi = Math.floor(i / RF) * 12 + (Math.floor((i % RF) / FLAVORS) % 4) * FLAVORS + (i % FLAVORS)
        const bj = Math.floor(j / RF) * 12 + (Math.floor((j % RF) / FLAVORS) % 4) * FLAVORS + (j % FLAVORS)

        block.re[bi * m + bj] = wr
        block.im[bi * m + bj] = wi
      } else if (si !== sj) leak = Math.max(leak, Math.hypot(wr, wi))
    }
  }

  return { block, leak }
}

// the piece in the J eigenbasis, flavor untouched
function rotateOnly(P: CMatrix, basis: readonly (readonly number[])[]): CMatrix {
  const n = FLAVOR_MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let d = 0; d < SLOTS; d++) {
    for (let e = 0; e < SLOTS; e++) {
      for (let f = 0; f < FLAVORS; f++) {
        for (let g = 0; g < FLAVORS; g++) {
          for (let ap = 0; ap < REG; ap++) {
            for (let bp = 0; bp < REG; bp++) {
              let sr = 0
              let si = 0

              for (let a = 0; a < REG; a++) {
                const oa = (basis[ap] as number[])[a] as number

                if (oa === 0) continue
                for (let b = 0; b < REG; b++) {
                  const ob = (basis[bp] as number[])[b] as number

                  if (ob === 0) continue

                  const k = ((d * REG + a) * FLAVORS + f) * n + (e * REG + b) * FLAVORS + g

                  sr += oa * ob * (P.re[k] as number)
                  si += oa * ob * (P.im[k] as number)
                }
              }

              re[((d * REG + ap) * FLAVORS + f) * n + (e * REG + bp) * FLAVORS + g] = sr
              im[((d * REG + ap) * FLAVORS + f) * n + (e * REG + bp) * FLAVORS + g] = si
            }
          }
        }
      }
    }
  }

  return { re, im }
}

/** The roots of a 288-mode (sector, three flavors) block: 12 modes a slot. */
export const SECTOR_FLAVOR_ROOTS = (roots: Roots): Roots => Array.from({ length: BLOCK_MODES * FLAVORS }, (_, i) => roots[Math.floor(i / 12)] as readonly number[])

// ---- the register commutant ----

// the Euclidean Clifford product of two sorted blades: the sign and the sorted blade
function clifford(a: readonly number[], b: readonly number[]): { sign: number; blade: number[] } {
  const w = [...a, ...b]
  let sign = 1

  for (let i = 0; i < w.length; i++) {
    for (let j = 0; j < w.length - 1 - i; j++) {
      if ((w[j] as number) > (w[j + 1] as number)) {
        ;[w[j], w[j + 1]] = [w[j + 1] as number, w[j] as number]
        sign = -sign
      }
    }
  }

  const out: number[] = []

  for (const x of w) {
    if (out.length > 0 && out[out.length - 1] === x) out.pop()
    else out.push(x)
  }

  return { sign, blade: out }
}

const bladeKey = (b: readonly number[]): string => b.join(',')

/** R(x) w = w x on the even blades, for the even blade x: an 8 x 8 integer matrix [row][col]. */
export function rightMultiplication(x: readonly number[]): number[][] {
  const index = new Map(EVEN.map((b, k) => [bladeKey(b), k]))
  const R = EVEN.map(() => Array<number>(REG).fill(0))

  EVEN.forEach((B, col) => {
    const p = clifford(B, x)

    ;(R[index.get(bladeKey(p.blade)) as number] as number[])[col] = p.sign
  })

  return R
}

/** The rank of an integer matrix (rows of BigInt), by fraction-free (Bareiss) elimination. */
export function rankExact(rows: readonly (readonly bigint[])[]): number {
  const m = rows.map(r => [...r])
  const cols = (m[0] as bigint[] | undefined)?.length ?? 0
  let rank = 0
  let prev = 1n

  for (let c = 0; c < cols && rank < m.length; c++) {
    const p = m.findIndex((r, i) => i >= rank && r[c] !== 0n)

    if (p < 0) continue
    ;[m[rank], m[p]] = [m[p] as bigint[], m[rank] as bigint[]]

    const pivot = (m[rank] as bigint[])[c] as bigint

    for (let i = rank + 1; i < m.length; i++) {
      const r = m[i] as bigint[]
      const f = r[c] as bigint

      for (let k = 0; k < cols; k++) r[k] = (pivot * (r[k] as bigint) - f * ((m[rank] as bigint[])[k] as bigint)) / prev
    }

    prev = pivot
    rank++
  }

  return rank
}

/**
 * The linear conditions X L = L X on an 8 x 8 unknown X (64 entries, row-major), one row per entry of the commutator, for
 * each matrix L given (entries integers after scaling by `scale`).
 */
export function commutantRows(Ls: readonly (readonly (readonly number[])[])[], scale: number): bigint[][] {
  const rows: bigint[][] = []

  for (const L of Ls) {
    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        // (X L - L X)[i][j] = sum_k X[i][k] L[k][j] - L[i][k] X[k][j]
        const row = Array<bigint>(REG * REG).fill(0n)

        for (let k = 0; k < REG; k++) {
          row[i * REG + k]! += BigInt(Math.round(scale * ((L[k] as number[])[j] as number)))
          row[k * REG + j]! -= BigInt(Math.round(scale * ((L[i] as number[])[k] as number)))
        }

        if (row.some(x => x !== 0n)) rows.push(row)
      }
    }
  }

  return rows
}

// ---- the exact rest toy: the singlet's scalar pair times flavor ----

/**
 * The rest-frame beat of the singlet's scalars (index s: 0 the blade 1, 1 the blade vol) times flavor, index s * 3 + f:
 * B = C (P+ (x) A+ + P- (x) A-), P+- = (1 +- J) / 2 = (1/2) [[1, +-1], [+-1, 1]] on span(1, vol), C = diag(1, uK) (x) 1
 * (uK = 1: no coupling). Exact over Q(w).
 */
export function restToy(Aplus: QWMatrix, Aminus: QWMatrix, uK: QW): QWMatrix {
  const half = qw(1n, 0n, 2n)
  const B: QWMatrix = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => QW_ZERO))

  for (let s = 0; s < 2; s++) {
    for (let t = 0; t < 2; t++) {
      const sign = s === t ? 1n : -1n

      for (let f = 0; f < 3; f++) {
        for (let g = 0; g < 3; g++) {
          const p = qwMul(half, (Aplus[f] as QW[])[g] as QW)
          const m = qwMul(half, (Aminus[f] as QW[])[g] as QW)
          // P+ (x) A+ contributes (1/2) A+ in every (s, t); P- (x) A- contributes +-(1/2) A-
          const v = qwAdd(p, sign === 1n ? m : qwSub(QW_ZERO, m))

          ;(B[s * 3 + f] as QW[])[t * 3 + g] = s === 1 ? qwMul(uK, v) : v
        }
      }
    }
  }

  return B
}

/**
 * The exact probability that weak flavor alpha, in the - half (the state (1 - vol) / sqrt 2 (x) alpha), is found in the -
 * half as beta after t beats of B: |(1/2) sum (1, -1) (x) beta^dag B^t (1, -1) (x) alpha|^2, an element of Q (b = 0).
 */
export function transition(B: QWMatrix, alpha: number, beta: number, beats: number): QW[] {
  let x: QW[] = Array.from({ length: 6 }, (_, i) => (i === alpha ? QW_ONE : i === 3 + alpha ? qw(-1n, 0n) : QW_ZERO))
  const out: QW[] = []
  const half = qw(1n, 0n, 2n)

  for (let t = 1; t <= beats; t++) {
    x = B.map(row => row.reduce((s, v, k) => qwAdd(s, qwMul(v, x[k] as QW)), QW_ZERO))

    const amp = qwMul(half, qwSub(x[beta] as QW, x[3 + beta] as QW))

    out.push(qwMul(amp, qwConj(amp)))
  }

  return out
}

/** The trimaximal V, and V's complex conjugate, as exact matrices. */
export const qwFromEisQMatrix = (V: readonly (readonly EisQ[])[]): QWMatrix => V.map(r => r.map(qwFromEisQ))

/** A real mixing exact over Z[1/3]: the reflection (1/3) [[-1, 2, 2], [2, -1, 2], [2, 2, -1]]. */
export const HOUSEHOLDER: QWMatrix = [
  [qw(-1n, 0n, 3n), qw(2n, 0n, 3n), qw(2n, 0n, 3n)],
  [qw(2n, 0n, 3n), qw(-1n, 0n, 3n), qw(2n, 0n, 3n)],
  [qw(2n, 0n, 3n), qw(2n, 0n, 3n), qw(-1n, 0n, 3n)],
]

/** Rephase a matrix: row 0 by a and column 0 by b (sixth roots of unity, Eisenstein units). */
export function rephase(V: QWMatrix, a: Eis, b: Eis): QWMatrix {
  return V.map((row, j) => row.map((x, k) => qwMul(qwMul(x, j === 0 ? qw(a[0], a[1]) : QW_ONE), k === 0 ? qw(b[0], b[1]) : QW_ONE)))
}
