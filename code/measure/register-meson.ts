// THE REGISTER MESON (E-SPN-0161): two members carrying E-SPN-0160's Cl+(4) register, bound by a string, in the
// coordinates of their exact moving block. E-SPN-0160 showed that one member's space splits into W = S + T D (the
// singlet sector S, eight register states at each dock, and the Clifford partner D carried one stream step, T D) and its
// complement F, on which the whole cycle U = T G2 T^dag G1 is the identity, for ANY field of mixer angles over the docks.
// A pair string built only from the sector projectors, a V-dependent phase on Q_S (x) Q_S in beat 1 and on
// Q_D (x) Q_D in beat 2 (V the D4 string length between the two members' docks), keeps W (x) W exactly invariant (it
// maps into S (x) S and T D (x) T D, which lie in W (x) W) and is the identity on F (x) anything. So the pair evolves
// EXACTLY inside W (x) W: 256 states a relative site (16 a member), not 192^2 = 36,864.
//
//   COORDINATES      a member in W is sum_x S_x a_x + sum_y T D_y b_y, a_x and b_y in C^8 (the register of S_x, the odd
//                    label of D_y). The two families overlap: <S_x a | T D_y b> = a^dag C(x - y) b, C(r_d) = c0
//                    gamma(r_d)^T with c0 = 1 / (2 sqrt 288) (S_x is uniform over the 24 slots, D_y's slot d is
//                    gamma(r_d)^T eta / (2 sqrt 12), and T carries slot d of dock y to y + r_d). The coordinates are
//                    exact but not orthonormal: norms and inner products use the Gram metric G = [[1, C], [C^dag, 1]]
//   ONE MEMBER       beat 1 (the mixer u on Q_S): a <- u a + (u - 1) C b; beat 2 (the mixer conj u on Q_D, conjugated
//                    by T): b <- conj(u) b + (conj(u) - 1) C^dag a. At momentum K, C(K) = -(i/2) gamma(s(K))^T
//   THE PAIR         blocks A (S (x) S), B (S (x) T D), X (T D (x) S), D (T D (x) T D), 64 register pairs each, over the
//                    relative position of the two coordinate docks at total momentum K. Beat 1 is
//                    1 + alpha (Q_S (x) 1 + 1 (x) Q_S) + beta(V) Q_S (x) Q_S, alpha = u - 1, beta(V) = u^2 e^(i tau V) -
//                    2 u + 1 (so a pair with both members in S takes u^2 e^(i tau V), one in S takes u); beat 2 the same
//                    with conj u, e^(-i tau V) and Q_D (the string raises the S-S pair and lowers the D-D pair alike)
//   THE BALL         the relative positions within a D4 ball; a shift out of it is dropped (the edge absorbs)
//   THE FULL RULE    for the witness: the same pair on the full 192 x 192 slot-and-register space of a smaller ball, beat
//                    by beat as the rule runs it (the pieces, the swap coin X, the stream), and the lift of the
//                    coordinates into it
//
// DETERMINISM: no random numbers. FLOATS: this is measurement on exact pieces (every projector is an integer or dyadic
// matrix over 24, 48; the coordinates' c0 is irrational only through the normalization).

import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { gammaMatrices, EVEN, ODD } from '@/code/measure/spinor-register'
import { d4Steps } from '@/code/measure/swap-sector'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const REG = 8
const PAIR = 64
const SITE = 4 * PAIR
const ROOTS = DOCK_ROOTS
const NR = ROOTS.length

export const C0 = 1 / (2 * Math.sqrt(288))

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

// ---- the overlap C(r_d) = c0 gamma(r_d)^T, [even row a][odd column eta], sparse ----

export type SparseEight = { row: Int8Array; col: Int8Array; val: Float64Array }

// gamma(r) = sum_i r_i gamma_i, gamma_i [odd][even]; C(r) [even a][odd eta] = c0 gamma(r)[eta][a]
export function overlapMatrices(): { dense: number[][][]; sparse: SparseEight[]; sparseT: SparseEight[] } {
  const g = gammaMatrices()
  const dense = ROOTS.map(r => {
    const m = Array.from({ length: REG }, () => Array<number>(REG).fill(0))

    for (let a = 0; a < REG; a++) {
      for (let eta = 0; eta < REG; eta++) {
        let s = 0

        for (let i = 0; i < 4; i++) s += (r[i] as number) * (((g[i] as number[][])[eta] as number[])[a] as number)
        ;(m[a] as number[])[eta] = C0 * s
      }
    }

    return m
  })
  const toSparse = (m: number[][], transpose: boolean): SparseEight => {
    const row: number[] = []
    const col: number[] = []
    const val: number[] = []

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        const x = transpose ? ((m[j] as number[])[i] as number) : ((m[i] as number[])[j] as number)

        if (x !== 0) {
          row.push(i)
          col.push(j)
          val.push(x)
        }
      }
    }

    return { row: Int8Array.from(row), col: Int8Array.from(col), val: Float64Array.from(val) }
  }

  return { dense, sparse: dense.map(m => toSparse(m, false)), sparseT: dense.map(m => toSparse(m, true)) }
}

// ---- one member at momentum K: the 16 x 16 cycle in coordinates, and its Gram metric ----

export type C16 = { re: Float64Array; im: Float64Array }

// C(K) = sum_d C(r_d) e^(-i K . r_d) (8 x 8 complex), the overlap's Bloch form
export function overlapAt(K: readonly number[]): C16 {
  const { dense } = overlapMatrices()
  const re = new Float64Array(64)
  const im = new Float64Array(64)

  ROOTS.forEach((r, d) => {
    const ph = -dot(K, r)
    const c = Math.cos(ph)
    const s = Math.sin(ph)
    const m = dense[d] as number[][]

    for (let a = 0; a < 8; a++) {
      for (let e = 0; e < 8; e++) {
        const x = (m[a] as number[])[e] as number

        re[a * 8 + e]! += c * x
        im[a * 8 + e]! += s * x
      }
    }
  })

  return { re, im }
}

// the one-member cycle as a 16 x 16 matrix on (a, b): a' = u a + (u - 1) C b, b' = conj(u) b + (conj(u) - 1) C^dag a'
export function memberCycle(u: readonly [number, number], K: readonly number[]): C16 {
  const C = overlapAt(K)
  const n = 16
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const set = (i: number, j: number, x: number, y: number): void => {
    re[i * n + j] = x
    im[i * n + j] = y
  }
  const [ur, ui] = u
  const am = [ur - 1, ui]
  const vb = [ur, -ui]
  const bm = [ur - 1, -ui]

  // beat 1 matrix M1: a' = u a + am C b, b' = b
  const M1re = new Float64Array(n * n)
  const M1im = new Float64Array(n * n)

  for (let a = 0; a < 8; a++) {
    M1re[a * n + a] = ur
    M1im[a * n + a] = ui
    M1re[(8 + a) * n + 8 + a] = 1
    for (let e = 0; e < 8; e++) {
      const cr = C.re[a * 8 + e] as number
      const ci = C.im[a * 8 + e] as number

      M1re[a * n + 8 + e] = (am[0] as number) * cr - (am[1] as number) * ci
      M1im[a * n + 8 + e] = (am[0] as number) * ci + (am[1] as number) * cr
    }
  }

  // beat 2 matrix M2: a' = a, b' = vb b + bm C^dag a
  const M2re = new Float64Array(n * n)
  const M2im = new Float64Array(n * n)

  for (let e = 0; e < 8; e++) {
    M2re[e * n + e] = 1
    M2re[(8 + e) * n + 8 + e] = vb[0] as number
    M2im[(8 + e) * n + 8 + e] = vb[1] as number
    for (let a = 0; a < 8; a++) {
      // C^dag [e][a] = conj(C[a][e])
      const cr = C.re[a * 8 + e] as number
      const ci = -(C.im[a * 8 + e] as number)

      M2re[(8 + e) * n + a] = (bm[0] as number) * cr - (bm[1] as number) * ci
      M2im[(8 + e) * n + a] = (bm[0] as number) * ci + (bm[1] as number) * cr
    }
  }

  // M = M2 M1
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const ar = M2re[i * n + k] as number
        const ai = M2im[i * n + k] as number
        const br = M1re[k * n + j] as number
        const bi = M1im[k * n + j] as number

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      set(i, j, sr, si)
    }
  }

  return { re, im }
}

// ---- the relative ball ----

export type RelBall = { radius: number; points: number[][]; index: Map<string, number>; plus: Int32Array; minus: Int32Array; V: Int32Array }

const key = (p: readonly number[]): string => p.join(',')

// the D4 points within `radius` root steps; plus[i * 24 + d] the index of p + r_d, minus of p - r_d (or -1 outside); V the
// D4 string length d4Steps(p)
export function relBall(radius: number): RelBall {
  const points: number[][] = []

  for (let a = -radius; a <= radius; a++) {
    for (let b = -radius; b <= radius; b++) {
      for (let c = -radius; c <= radius; c++) {
        for (let e = -radius; e <= radius; e++) {
          if ((((a + b + c + e) % 2) + 2) % 2 !== 0) continue

          const v = [a, b, c, e]

          if (d4Steps(v) <= radius) points.push(v)
        }
      }
    }
  }

  const index = new Map(points.map((p, i) => [key(p), i]))
  const plus = new Int32Array(points.length * NR)
  const minus = new Int32Array(points.length * NR)

  points.forEach((p, i) => {
    ROOTS.forEach((r, d) => {
      plus[i * NR + d] = index.get(key(p.map((x, k) => x + (r[k] as number)))) ?? -1
      minus[i * NR + d] = index.get(key(p.map((x, k) => x - (r[k] as number)))) ?? -1
    })
  })

  return { radius, points, index, plus, minus, V: Int32Array.from(points.map(p => d4Steps(p))) }
}

// ---- the pair state: blocks A, B, X, D at offsets 0, 64, 128, 192 of each site, index r1 * 8 + r2 ----

export type PairState = { re: Float64Array; im: Float64Array }

export const newPair = (ball: RelBall): PairState => ({ re: new Float64Array(ball.points.length * SITE), im: new Float64Array(ball.points.length * SITE) })
export const clonePair = (s: PairState): PairState => ({ re: Float64Array.from(s.re), im: Float64Array.from(s.im) })

export const BLOCK = { A: 0, B: 64, X: 128, D: 192 } as const

export type PairParams = {
  u: readonly [number, number]
  // the string angle per unit of D4 string length (the S-S pair takes e^(i tau min(V, cap)) a cycle), and its cap
  tau: number
  cap: number
  K: readonly number[]
  // the full rule only: read the string as E-SPN-0147's MEMBER mass string instead (each member's own unit u e^(i tau V /
  // 2), whatever the other member's sector), which does not keep W (x) W: a control for the witness
  member?: boolean
}

export type PairEngine = {
  ball: RelBall
  params: PairParams
  // per root: the half-step phases e^(-+ i K . r / 2)
  halfRe: Float64Array
  halfIm: Float64Array
  // per site: beta(V) for beat 1 and beta'(V) for beat 2 (complex)
  beta1: Float64Array
  beta2: Float64Array
  C: SparseEight[]
  CT: SparseEight[]
  // scratch blocks (one site-block field each)
  t: Float64Array[]
}

// beta = w^2 e^(i phi) - 2 w + 1 for w = (wr, wi)
function betaOf(wr: number, wi: number, phi: number): [number, number] {
  const w2r = wr * wr - wi * wi
  const w2i = 2 * wr * wi
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  return [w2r * c - w2i * s - 2 * wr + 1, w2r * s + w2i * c - 2 * wi]
}

export function pairEngine(ball: RelBall, params: PairParams): PairEngine {
  const N = ball.points.length
  const { sparse, sparseT } = overlapMatrices()
  const halfRe = new Float64Array(NR)
  const halfIm = new Float64Array(NR)
  const beta1 = new Float64Array(2 * N)
  const beta2 = new Float64Array(2 * N)
  const [ur, ui] = params.u

  ROOTS.forEach((r, d) => {
    const ph = -dot(params.K, r) / 2

    halfRe[d] = Math.cos(ph)
    halfIm[d] = Math.sin(ph)
  })
  for (let i = 0; i < N; i++) {
    const V = Math.min(ball.V[i] as number, params.cap)
    const b1 = betaOf(ur, ui, params.tau * V)
    const b2 = betaOf(ur, -ui, -params.tau * V)

    beta1[2 * i] = b1[0]
    beta1[2 * i + 1] = b1[1]
    beta2[2 * i] = b2[0]
    beta2[2 * i + 1] = b2[1]
  }

  return { ball, params, halfRe, halfIm, beta1, beta2, C: sparse, CT: sparseT, t: Array.from({ length: 12 }, () => new Float64Array(N * PAIR)) }
}

// out (a block field, re then im) = conv of a source block on member `m` (1 or 2) with C (dagger false) or C^dag
// (dagger true), the relative shift and half-step phase as derived in the file header:
//   C1: src at y - r_d, e^(-i K r_d / 2), C(r_d) on member 1     C2: src at y + r_d, e^(-i K r_d / 2), on member 2
//   C1^dag: src at y + r_d, e^(+i K r_d / 2), C^T on member 1    C2^dag: src at y - r_d, e^(+i K r_d / 2), on member 2
function conv(e: PairEngine, srcRe: Float64Array, srcIm: Float64Array, srcOff: number, srcStride: number, outRe: Float64Array, outIm: Float64Array, member: 1 | 2, dagger: boolean): void {
  const { ball } = e
  const N = ball.points.length
  const table = (member === 1) !== dagger ? ball.minus : ball.plus
  const mats = dagger ? e.CT : e.C
  const sgn = dagger ? -1 : 1

  outRe.fill(0)
  outIm.fill(0)
  for (let i = 0; i < N; i++) {
    const oo = i * PAIR

    for (let d = 0; d < NR; d++) {
      const j = table[i * NR + d] as number

      if (j < 0) continue

      const pr = e.halfRe[d] as number
      const pi = sgn * (e.halfIm[d] as number)
      const so = j * srcStride + srcOff
      const m = mats[d] as SparseEight
      const L = m.val.length

      for (let q = 0; q < L; q++) {
        const row = m.row[q] as number
        const col = m.col[q] as number
        const v = m.val[q] as number
        const wr = v * pr
        const wi = v * pi

        if (member === 1) {
          // out[row, r2] += w src[col, r2]
          const ob = oo + row * 8
          const sb = so + col * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = srcRe[sb + r2] as number
            const xi = srcIm[sb + r2] as number

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          // out[r1, row] += w src[r1, col]
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = srcRe[so + r1 * 8 + col] as number
            const xi = srcIm[so + r1 * 8 + col] as number

            outRe[oo + r1 * 8 + row]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + row]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

// copy a block of the state into a compact field (stride 64)
function blockOf(s: PairState, off: number, N: number, re: Float64Array, im: Float64Array): void {
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < PAIR; k++) {
      re[i * PAIR + k] = s.re[i * SITE + off + k] as number
      im[i * PAIR + k] = s.im[i * SITE + off + k] as number
    }
  }
}

// ONE CYCLE (two beats) in place
export function pairCycle(e: PairEngine, s: PairState): void {
  const N = e.ball.points.length
  const [ur, ui] = e.params.u
  const T = e.t as Float64Array[]
  const [t1r, t1i, t2r, t2i, er, ei, ar, ai, fr, fi, gr, gi] = T as [Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array, Float64Array]

  // ---- beat 1: alpha = u - 1 on Q_S (x) 1 and 1 (x) Q_S, beta1(V) on Q_S (x) Q_S ----
  {
    const al = [ur - 1, ui]

    // t1 = C1 X (A-shaped), t2 = C2 B (A-shaped), e = C2 D (X-shaped), f = C1 e (A-shaped), g = C1 D (B-shaped)
    conv(e, s.re, s.im, BLOCK.X, SITE, t1r, t1i, 1, false)
    conv(e, s.re, s.im, BLOCK.B, SITE, t2r, t2i, 2, false)
    conv(e, s.re, s.im, BLOCK.D, SITE, er, ei, 2, false)
    conv(e, er, ei, 0, PAIR, fr, fi, 1, false)
    conv(e, s.re, s.im, BLOCK.D, SITE, gr, gi, 1, false)

    for (let i = 0; i < N; i++) {
      const b1r = e.beta1[2 * i] as number
      const b1i = e.beta1[2 * i + 1] as number

      for (let k = 0; k < PAIR; k++) {
        const c = i * PAIR + k
        const A = i * SITE + BLOCK.A + k
        const B = i * SITE + BLOCK.B + k
        const X = i * SITE + BLOCK.X + k
        const aR = s.re[A] as number
        const aI = s.im[A] as number
        // A + t1, A + t2, pS = A + t1 + t2 + f
        const p1r = aR + (t1r[c] as number)
        const p1i = aI + (t1i[c] as number)
        const p2r = aR + (t2r[c] as number)
        const p2i = aI + (t2i[c] as number)
        const psr = p1r + (t2r[c] as number) + (fr[c] as number)
        const psi = p1i + (t2i[c] as number) + (fi[c] as number)

        s.re[A] = aR + (al[0] as number) * (p1r + p2r) - (al[1] as number) * (p1i + p2i) + b1r * psr - b1i * psi
        s.im[A] = aI + (al[0] as number) * (p1i + p2i) + (al[1] as number) * (p1r + p2r) + b1r * psi + b1i * psr

        // B + alpha (B + g)
        const bR = s.re[B] as number
        const bI = s.im[B] as number
        const qbr = bR + (gr[c] as number)
        const qbi = bI + (gi[c] as number)

        s.re[B] = bR + (al[0] as number) * qbr - (al[1] as number) * qbi
        s.im[B] = bI + (al[0] as number) * qbi + (al[1] as number) * qbr

        // X + alpha (X + e)
        const xR = s.re[X] as number
        const xI = s.im[X] as number
        const qxr = xR + (er[c] as number)
        const qxi = xI + (ei[c] as number)

        s.re[X] = xR + (al[0] as number) * qxr - (al[1] as number) * qxi
        s.im[X] = xI + (al[0] as number) * qxi + (al[1] as number) * qxr
      }
    }
  }

  // ---- beat 2: alpha' = conj(u) - 1 on Q_D' (x) 1 and 1 (x) Q_D', beta2(V) on Q_D' (x) Q_D' ----
  {
    const al = [ur - 1, -ui]

    // s1 = C1^dag B (D-shaped), s2 = C2^dag X (D-shaped), f = C2^dag A (B-shaped), s12 = C1^dag f (D-shaped),
    // h = C1^dag A (X-shaped)
    conv(e, s.re, s.im, BLOCK.B, SITE, t1r, t1i, 1, true)
    conv(e, s.re, s.im, BLOCK.X, SITE, t2r, t2i, 2, true)
    conv(e, s.re, s.im, BLOCK.A, SITE, er, ei, 2, true)
    conv(e, er, ei, 0, PAIR, fr, fi, 1, true)
    conv(e, s.re, s.im, BLOCK.A, SITE, gr, gi, 1, true)

    for (let i = 0; i < N; i++) {
      const b2r = e.beta2[2 * i] as number
      const b2i = e.beta2[2 * i + 1] as number

      for (let k = 0; k < PAIR; k++) {
        const c = i * PAIR + k
        const D = i * SITE + BLOCK.D + k
        const B = i * SITE + BLOCK.B + k
        const X = i * SITE + BLOCK.X + k
        const dR = s.re[D] as number
        const dI = s.im[D] as number
        const p1r = dR + (t1r[c] as number)
        const p1i = dI + (t1i[c] as number)
        const p2r = dR + (t2r[c] as number)
        const p2i = dI + (t2i[c] as number)
        const pdr = p1r + (t2r[c] as number) + (fr[c] as number)
        const pdi = p1i + (t2i[c] as number) + (fi[c] as number)

        s.re[D] = dR + (al[0] as number) * (p1r + p2r) - (al[1] as number) * (p1i + p2i) + b2r * pdr - b2i * pdi
        s.im[D] = dI + (al[0] as number) * (p1i + p2i) + (al[1] as number) * (p1r + p2r) + b2r * pdi + b2i * pdr

        // B + alpha' (B + C2^dag A)
        const bR = s.re[B] as number
        const bI = s.im[B] as number
        const qbr = bR + (er[c] as number)
        const qbi = bI + (ei[c] as number)

        s.re[B] = bR + (al[0] as number) * qbr - (al[1] as number) * qbi
        s.im[B] = bI + (al[0] as number) * qbi + (al[1] as number) * qbr

        // X + alpha' (X + C1^dag A)
        const xR = s.re[X] as number
        const xI = s.im[X] as number
        const qxr = xR + (gr[c] as number)
        const qxi = xI + (gi[c] as number)

        s.re[X] = xR + (al[0] as number) * qxr - (al[1] as number) * qxi
        s.im[X] = xI + (al[0] as number) * qxi + (al[1] as number) * qxr
      }
    }
  }
}

// G s (the Gram metric applied): member 1 then member 2, (a, b) -> (a + C b, b + C^dag a)
export function gram(e: PairEngine, s: PairState): PairState {
  const N = e.ball.points.length
  const T = e.t as Float64Array[]
  const [xr, xi, yr, yi] = T as [Float64Array, Float64Array, Float64Array, Float64Array]
  const g1 = clonePair(s)

  // member 1: A += C1 X, B += C1 D, X += C1^dag A, D += C1^dag B (all from s)
  const add = (out: PairState, off: number, fr: Float64Array, fi: Float64Array): void => {
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < PAIR; k++) {
        out.re[i * SITE + off + k]! += fr[i * PAIR + k] as number
        out.im[i * SITE + off + k]! += fi[i * PAIR + k] as number
      }
    }
  }

  conv(e, s.re, s.im, BLOCK.X, SITE, xr, xi, 1, false)
  add(g1, BLOCK.A, xr, xi)
  conv(e, s.re, s.im, BLOCK.D, SITE, xr, xi, 1, false)
  add(g1, BLOCK.B, xr, xi)
  conv(e, s.re, s.im, BLOCK.A, SITE, xr, xi, 1, true)
  add(g1, BLOCK.X, xr, xi)
  conv(e, s.re, s.im, BLOCK.B, SITE, xr, xi, 1, true)
  add(g1, BLOCK.D, xr, xi)

  // member 2 on g1: A += C2 B, X += C2 D, B += C2^dag A, D += C2^dag X
  const g2 = clonePair(g1)

  conv(e, g1.re, g1.im, BLOCK.B, SITE, yr, yi, 2, false)
  add(g2, BLOCK.A, yr, yi)
  conv(e, g1.re, g1.im, BLOCK.D, SITE, yr, yi, 2, false)
  add(g2, BLOCK.X, yr, yi)
  conv(e, g1.re, g1.im, BLOCK.A, SITE, yr, yi, 2, true)
  add(g2, BLOCK.B, yr, yi)
  conv(e, g1.re, g1.im, BLOCK.X, SITE, yr, yi, 2, true)
  add(g2, BLOCK.D, yr, yi)

  return g2
}

// <a | G b> (the physical inner product of two coordinate states)
export function inner(e: PairEngine, a: PairState, b: PairState): [number, number] {
  const gb = gram(e, b)
  let re = 0
  let im = 0

  for (let i = 0; i < a.re.length; i++) {
    const xr = a.re[i] as number
    const xi = a.im[i] as number
    const yr = gb.re[i] as number
    const yi = gb.im[i] as number

    re += xr * yr + xi * yi
    im += xr * yi - xi * yr
  }

  return [re, im]
}

export const norm2 = (e: PairEngine, s: PairState): number => inner(e, s, s)[0]

export function scalePair(s: PairState, fr: number, fi = 0): void {
  for (let i = 0; i < s.re.length; i++) {
    const r = s.re[i] as number
    const m = s.im[i] as number

    s.re[i] = fr * r - fi * m
    s.im[i] = fr * m + fi * r
  }
}

// y = y + (fr + i fi) x
export function axpy(y: PairState, x: PairState, fr: number, fi: number): void {
  for (let i = 0; i < y.re.length; i++) {
    const r = x.re[i] as number
    const m = x.im[i] as number

    y.re[i]! += fr * r - fi * m
    y.im[i]! += fr * m + fi * r
  }
}

// ---- starts, filters, levels ----

// both members in S with an s-wave profile exp(-(V / ell)^1.5), the registers paired by delta(a1, a2) (the orthogonal
// pairing, invariant under W(F4) acting on both registers at once: the start lies in the fully symmetric sector), or,
// given (ra, rb), in those two register states only
export function sStart(ball: RelBall, ell: number, pair?: readonly [number, number]): PairState {
  const s = newPair(ball)

  for (let i = 0; i < ball.points.length; i++) {
    const f = Math.exp(-(((ball.V[i] as number) / ell) ** 1.5))

    if (pair) s.re[i * SITE + BLOCK.A + pair[0] * 8 + pair[1]] = f
    else for (let a = 0; a < REG; a++) s.re[i * SITE + BLOCK.A + a * 8 + a] = f
  }

  return s
}

export const blackmanHarris = (s: number, S: number): number => {
  const x = (2 * Math.PI * s) / (S - 1)

  return 0.35875 - 0.48829 * Math.cos(x) + 0.14128 * Math.cos(2 * x) - 0.01168 * Math.cos(3 * x)
}

// v = sum_s w(s) e^(-i phase s) U^s psi over S cycles (the filter at a cycle phase)
export function filterPair(e: PairEngine, psi: PairState, phase: number, S: number): PairState {
  const out = newPair(e.ball)
  const s = clonePair(psi)

  for (let k = 0; k < S; k++) {
    const w = blackmanHarris(k, S)

    axpy(out, s, w * Math.cos(-phase * k), w * Math.sin(-phase * k))
    pairCycle(e, s)
  }

  return out
}

export type LevelRead = { lambda: [number, number]; phase: number; residual: number }

// lambda = <v | G U v> / <v | G v>, the residual |U v - lambda v|_G / |v|_G
export function readLevel(e: PairEngine, v: PairState): LevelRead {
  const n = norm2(e, v)
  const Uv = clonePair(v)

  pairCycle(e, Uv)

  const [lr, li] = inner(e, v, Uv).map(x => x / n) as [number, number]
  const r = clonePair(Uv)

  axpy(r, v, -lr, -li)

  return { lambda: [lr, li], phase: Math.atan2(li, lr), residual: Math.sqrt(norm2(e, r) / n) }
}

export function normalizePair(e: PairEngine, s: PairState): void {
  const n = Math.sqrt(norm2(e, s))

  scalePair(s, 1 / n)
}

// the weight by string length V (coordinate weight a site, the diagonal of the Gram metric: a profile, not the physical
// norm, which the Gram cross terms spread over neighbours)
export function profile(e: PairEngine, s: PairState): number[] {
  const out = Array<number>(e.ball.radius + 1).fill(0)

  for (let i = 0; i < e.ball.points.length; i++) {
    let w = 0

    for (let k = 0; k < SITE; k++) w += (s.re[i * SITE + k] as number) ** 2 + (s.im[i * SITE + k] as number) ** 2
    out[e.ball.V[i] as number]! += w
  }

  return out
}

// the share of the coordinate weight in each block (A, B, X, D)
export function blockShares(e: PairEngine, s: PairState): number[] {
  const out = [0, 0, 0, 0]

  for (let i = 0; i < e.ball.points.length; i++) {
    for (let b = 0; b < 4; b++) {
      for (let k = 0; k < PAIR; k++) out[b]! += (s.re[i * SITE + b * PAIR + k] as number) ** 2 + (s.im[i * SITE + b * PAIR + k] as number) ** 2
    }
  }

  const t = out.reduce((x, y) => x + y, 0)

  return out.map(x => x / t)
}

// ---- the full rule on a small ball, for the witness ----

const MODES = 24 * REG
const FULL = MODES * MODES

export type FullState = { re: Float64Array; im: Float64Array }

// E(eta) slot-d components: e[d][a][eta] = gamma(r_d)[eta][a] / (2 sqrt 12) (the D basis), with Q_D = E E^T
function partnerBasis(): Float64Array {
  const g = gammaMatrices()
  const E = new Float64Array(MODES * REG)
  const f = 1 / (2 * Math.sqrt(12))

  ROOTS.forEach((r, d) => {
    for (let a = 0; a < REG; a++) {
      for (let eta = 0; eta < REG; eta++) {
        let s = 0

        for (let i = 0; i < 4; i++) s += (r[i] as number) * (((g[i] as number[][])[eta] as number[])[a] as number)
        E[(d * REG + a) * REG + eta] = f * s
      }
    }
  })

  return E
}

export type FullRule = { ball: RelBall; params: PairParams; E: Float64Array; phase: Float64Array }

export function fullRule(ball: RelBall, params: PairParams): FullRule {
  // the stream phase for (d, e): e^(-i K (r_d + r_e) / 2)
  const phase = new Float64Array(NR * NR * 2)

  for (let d = 0; d < NR; d++) {
    for (let f = 0; f < NR; f++) {
      const ph = -(dot(params.K, ROOTS[d] as number[]) + dot(params.K, ROOTS[f] as number[])) / 2

      phase[(d * NR + f) * 2] = Math.cos(ph)
      phase[(d * NR + f) * 2 + 1] = Math.sin(ph)
    }
  }

  return { ball, params, E: partnerBasis(), phase }
}

export const newFull = (ball: RelBall): FullState => ({ re: new Float64Array(ball.points.length * FULL), im: new Float64Array(ball.points.length * FULL) })

// the pair piece at one site on the 192 x 192 matrix psi[s1][s2]: psi + alpha (Q psi + psi Q^T) + beta Q psi Q^T, Q = Q_S
// (the slot average) or Q_D (E E^T); w = the unit (alpha = w - 1)
function pieceAt(psiRe: Float64Array, psiIm: Float64Array, o: number, sector: 'S' | 'D', wr: number, wi: number, br: number, bi: number, E: Float64Array): void {
  const q = (re: Float64Array, im: Float64Array, off: number, stride1: number, stride2: number, outRe: Float64Array, outIm: Float64Array): void => {
    // apply Q to the first index of an array with element (s1, s2) at off + s1 * stride1 + s2 * stride2
    for (let s2 = 0; s2 < MODES; s2++) {
      if (sector === 'S') {
        for (let a = 0; a < REG; a++) {
          let sr = 0
          let si = 0

          for (let d = 0; d < 24; d++) {
            sr += re[off + (d * REG + a) * stride1 + s2 * stride2] as number
            si += im[off + (d * REG + a) * stride1 + s2 * stride2] as number
          }
          sr /= 24
          si /= 24
          for (let d = 0; d < 24; d++) {
            outRe[(d * REG + a) * MODES + s2] = sr
            outIm[(d * REG + a) * MODES + s2] = si
          }
        }
      } else {
        const cr = new Float64Array(REG)
        const ci = new Float64Array(REG)

        for (let s1 = 0; s1 < MODES; s1++) {
          const xr = re[off + s1 * stride1 + s2 * stride2] as number
          const xi = im[off + s1 * stride1 + s2 * stride2] as number

          if (xr === 0 && xi === 0) continue
          for (let eta = 0; eta < REG; eta++) {
            const w = E[s1 * REG + eta] as number

            if (w === 0) continue
            cr[eta]! += w * xr
            ci[eta]! += w * xi
          }
        }
        for (let s1 = 0; s1 < MODES; s1++) {
          let sr = 0
          let si = 0

          for (let eta = 0; eta < REG; eta++) {
            const w = E[s1 * REG + eta] as number

            sr += w * (cr[eta] as number)
            si += w * (ci[eta] as number)
          }
          outRe[s1 * MODES + s2] = sr
          outIm[s1 * MODES + s2] = si
        }
      }
    }
  }
  const q1r = new Float64Array(FULL)
  const q1i = new Float64Array(FULL)
  const q2r = new Float64Array(FULL)
  const q2i = new Float64Array(FULL)
  const q12r = new Float64Array(FULL)
  const q12i = new Float64Array(FULL)

  // Q psi (first index), psi Q^T (second index: Q on the transpose), Q psi Q^T
  q(psiRe, psiIm, o, MODES, 1, q1r, q1i)
  const tr = new Float64Array(FULL)
  const ti = new Float64Array(FULL)

  q(psiRe, psiIm, o, 1, MODES, tr, ti)
  for (let s1 = 0; s1 < MODES; s1++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      q2r[s1 * MODES + s2] = tr[s2 * MODES + s1] as number
      q2i[s1 * MODES + s2] = ti[s2 * MODES + s1] as number
    }
  }
  q(q1r, q1i, 0, 1, MODES, tr, ti)
  for (let s1 = 0; s1 < MODES; s1++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      q12r[s1 * MODES + s2] = tr[s2 * MODES + s1] as number
      q12i[s1 * MODES + s2] = ti[s2 * MODES + s1] as number
    }
  }

  const alr = wr - 1
  const ali = wi

  for (let k = 0; k < FULL; k++) {
    const pr = (q1r[k] as number) + (q2r[k] as number)
    const pi = (q1i[k] as number) + (q2i[k] as number)
    const zr = q12r[k] as number
    const zi = q12i[k] as number

    psiRe[o + k]! += alr * pr - ali * pi + br * zr - bi * zi
    psiIm[o + k]! += alr * pi + ali * pr + br * zi + bi * zr
  }
}

// one beat of the full rule: the piece (sector S with u in beat 1, sector D with conj u in beat 2, the string's beta at the
// site's V), the swap coin (slot d takes the value of its opposite, the register kept), and the stream (member 1's slot d
// one root r_d, member 2's slot e one root r_e: the relative position moves r_d - r_e, phase e^(-i K (r_d + r_e) / 2)).
// Anything streamed out of the ball is dropped.
export function fullBeat(f: FullRule, s: FullState, beat: 1 | 2): FullState {
  const N = f.ball.points.length
  const [ur, ui] = f.params.u
  const w: [number, number] = beat === 1 ? [ur, ui] : [ur, -ui]

  for (let i = 0; i < N; i++) {
    const V = Math.min(f.ball.V[i] as number, f.params.cap)
    const phi = (beat === 1 ? 1 : -1) * f.params.tau * V

    if (f.params.member) {
      // each member takes w e^(i phi / 2): alpha = w' - 1 on each, beta = alpha^2 on both (so S (x) S takes w'^2 = w^2
      // e^(i phi), the same pair phase, and one member in S takes w' rather than w)
      const wr = w[0] * Math.cos(phi / 2) - w[1] * Math.sin(phi / 2)
      const wi = w[0] * Math.sin(phi / 2) + w[1] * Math.cos(phi / 2)

      pieceAt(s.re, s.im, i * FULL, beat === 1 ? 'S' : 'D', wr, wi, (wr - 1) ** 2 - wi * wi, 2 * (wr - 1) * wi, f.E)
    } else {
      const [br, bi] = betaOf(w[0], w[1], phi)

      pieceAt(s.re, s.im, i * FULL, beat === 1 ? 'S' : 'D', w[0], w[1], br, bi, f.E)
    }
  }

  const out = newFull(f.ball)
  const target = new Int32Array(NR * NR)

  for (let i = 0; i < N; i++) {
    const p = f.ball.points[i] as number[]

    for (let d = 0; d < NR; d++) {
      for (let e = 0; e < NR; e++) {
        const r = ROOTS[d] as number[]
        const q = ROOTS[e] as number[]

        target[d * NR + e] = f.ball.index.get(key(p.map((x, k) => x + (r[k] as number) - (q[k] as number)))) ?? -1
      }
    }

    for (let d = 0; d < NR; d++) {
      const from1 = OPPOSITE[d] as number

      for (let e = 0; e < NR; e++) {
        const j = target[d * NR + e] as number

        if (j < 0) continue

        const from2 = OPPOSITE[e] as number
        const cr = f.phase[(d * NR + e) * 2] as number
        const ci = f.phase[(d * NR + e) * 2 + 1] as number

        for (let a = 0; a < REG; a++) {
          for (let b = 0; b < REG; b++) {
            const src = i * FULL + (from1 * REG + a) * MODES + from2 * REG + b
            const dst = j * FULL + (d * REG + a) * MODES + e * REG + b
            const xr = s.re[src] as number
            const xi = s.im[src] as number

            out.re[dst] = cr * xr - ci * xi
            out.im[dst] = cr * xi + ci * xr
          }
        }
      }
    }
  }

  return out
}

// the lift of coordinates into the full space: S_x a -> slots of dock x, a / sqrt 24 each; T D_y eta -> slot d of dock
// y + r_d, gamma(r_d)^T eta / (2 sqrt 12), with the half-step phase of the displaced member (e^(-i K r_d / 2) a step).
// `pairBall` is the coordinate ball, `fullBall` the full rule's (the coordinates must lie within it, less two steps)
export function lift(pairBall: RelBall, s: PairState, fullBall: RelBall, K: readonly number[]): FullState {
  const out = newFull(fullBall)
  const E = partnerBasis()
  const sq = 1 / Math.sqrt(24)
  // member vectors: for a coordinate index (kind, label) the list of (dock shift, full mode, amplitude re, im)
  type Piece = { shift: number[]; mode: number; re: number; im: number }
  const member = (kind: 'a' | 'b', label: number): Piece[] => {
    const out: Piece[] = []

    if (kind === 'a') {
      for (let d = 0; d < 24; d++) out.push({ shift: [0, 0, 0, 0], mode: d * REG + label, re: sq, im: 0 })
    } else {
      ROOTS.forEach((r, d) => {
        const ph = -dot(K, r) / 2

        for (let a = 0; a < REG; a++) {
          const w = E[(d * REG + a) * REG + label] as number

          if (w !== 0) out.push({ shift: [...r], mode: d * REG + a, re: w * Math.cos(ph), im: w * Math.sin(ph) })
        }
      })
    }

    return out
  }
  const pieces = { a: Array.from({ length: REG }, (_, l) => member('a', l)), b: Array.from({ length: REG }, (_, l) => member('b', l)) }
  const kinds: ['a' | 'b', 'a' | 'b'][] = [
    ['a', 'a'],
    ['a', 'b'],
    ['b', 'a'],
    ['b', 'b'],
  ]

  for (let i = 0; i < pairBall.points.length; i++) {
    const y = pairBall.points[i] as number[]

    kinds.forEach(([k1, k2], blk) => {
      for (let r1 = 0; r1 < REG; r1++) {
        for (let r2 = 0; r2 < REG; r2++) {
          const cr = s.re[i * SITE + blk * PAIR + r1 * 8 + r2] as number
          const ci = s.im[i * SITE + blk * PAIR + r1 * 8 + r2] as number

          if (cr === 0 && ci === 0) continue
          for (const p1 of pieces[k1][r1] as Piece[]) {
            for (const p2 of pieces[k2][r2] as Piece[]) {
              // member 1 moves by p1.shift, member 2 by p2.shift: the relative position y + shift1 - shift2
              const Y = y.map((x, k) => x + (p1.shift[k] as number) - (p2.shift[k] as number))
              const j = fullBall.index.get(key(Y))

              if (j === undefined) continue

              const wr = p1.re * p2.re - p1.im * p2.im
              const wi = p1.re * p2.im + p1.im * p2.re
              const at = j * FULL + p1.mode * MODES + p2.mode

              out.re[at]! += wr * cr - wi * ci
              out.im[at]! += wr * ci + wi * cr
            }
          }
        }
      }
    })
  }

  return out
}

// the largest entry gap and the two weights, over the sites of the full ball within `within` root steps (a truncated full
// ball is exact only where no value it dropped could have fed back: after one cycle, two steps inside its edge for a
// start that fills it)
export function fullGap(ball: RelBall, a: FullState, b: FullState, within = Infinity): { worst: number; weightA: number; weightB: number } {
  let worst = 0
  let wa = 0
  let wb = 0

  for (let s = 0; s < ball.points.length; s++) {
    if ((ball.V[s] as number) > within) continue
    for (let k = s * FULL; k < (s + 1) * FULL; k++) {
      worst = Math.max(worst, Math.hypot((a.re[k] as number) - (b.re[k] as number), (a.im[k] as number) - (b.im[k] as number)))
      wa += (a.re[k] as number) ** 2 + (a.im[k] as number) ** 2
      wb += (b.re[k] as number) ** 2 + (b.im[k] as number) ** 2
    }
  }

  return { worst, weightA: wa, weightB: wb }
}

export { EVEN, ODD, wrap }
