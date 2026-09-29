// THE REGISTER PAIR HELD BY THE HUSK LIGHT'S PULL (the experiment spin/register-coulomb-hold). Two members carrying
// E-SPN-0160's Cl+(4) register run in the exact coordinates of their moving block (code/measure/register-meson, E-SPN-0162:
// 256 states a relative site, the flats never coupled), on the HUSK QUOTIENT (the D4 mesh with depth period 2, whose
// docks are exactly Z^3: code/measure/husk-meson, E-SPN-0155, E-SPN-0167), with the husk light's Coulomb law in place of
// E-SPN-0162's string. This file supplies what that needs beside register-meson:
//
//   THE QUOTIENT BALL   huskRelBall(R): the relative coordinates within husk radius R, as register-meson's RelBall, the
//                       root shifts reduced to the quotient's representative (depth 0 or 1), V the rounded husk radius
//                       (only the profile reads it)
//   THE COUNT           coulombCounts: n(y) = floor(alpha G(y) / theta), the husk Green's function G = G(0) - D(y)
//                       (husk-meson's table and closed form) counted in steps of the ring unit rho's angle theta: an
//                       integer count with a threshold, never a rounding. The pair phase is rho^(-n(y)), exact in the
//                       ring; the count's own error is under one step theta at every site, and the smallest distance of
//                       any site's alpha G / theta from an integer is returned (so the count is unambiguous)
//   THE ENGINE          coulombEngine: register-meson's pairEngine with every site's beta replaced: beat 1 (S S) takes
//                       u^2 rho^(-n), beat 2 (D D) conj(u)^2 rho^(+n). The same sector-projector form as E-SPN-0162's
//                       string (so W (x) W stays exact), the profile now falling to 0 at infinity (the zero of the
//                       Coulomb energy), so a far pair is two free members in every sector
//   THE WITNESS         fullRuleQ / fullBeatQ / liftQ: E-SPN-0162's full 192 x 192 pair rule and its lift, on the quotient
//                       ball (every shift reduced), with a per-site pair phase; pieceAt is re-stated here (register-meson
//                       keeps it private) with the same arithmetic
//   THE DARWIN S        densityS: S = sum_k X(k) rhohat(k) / eps(k) / sum_k rhohat(k) / eps(k) for a MEASURED relative
//                       density on the side-T husk torus (E-SPN-0169's boundStateS with the bound state's own density in
//                       place of a Gaussian)
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces; the Green's function is transcendental, but the
// rule sees only the integer count n(y).

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import {
  coulombSymbol,
  darwinRatio,
} from '@/code/measure/darwin-exchange'
import {
  greenAt,
  huskPoint,
  type GreenTable,
} from '@/code/measure/husk-meson'
import {
  axpy,
  BLOCK,
  blackmanHarris,
  clonePair,
  inner,
  norm2,
  pairCycle,
  pairEngine,
  type PairEngine,
  type PairParams,
  type PairState,
  type RelBall,
} from '@/code/measure/register-meson'
import { gammaMatrices } from '@/code/measure/spinor-register'
import { fft3 } from '@/code/measure/standin-chemistry'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const REG = 8
const MODES = 24 * REG
const FULL = MODES * MODES
const SITE = 256
const PAIR = 64
const ROOTS = DOCK_ROOTS
const NR = ROOTS.length

const qkey = (a: number, b: number, c: number): string =>
  huskPoint(a, b, c).join(',')
const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

// ---- the quotient ball ----

export function huskRelBall(R: number): RelBall {
  const points: number[][] = []
  const R2 = R * R

  for (let a = -R; a <= R; a++) {
    for (let b = -R; b <= R; b++) {
      for (let c = -R; c <= R; c++) {
        if (a * a + b * b + c * c <= R2) {
          points.push(huskPoint(a, b, c))
        }
      }
    }
  }

  const index = new Map(points.map((p, i) => [p.join(','), i]))
  const plus = new Int32Array(points.length * NR)
  const minus = new Int32Array(points.length * NR)

  points.forEach((p, i) => {
    ROOTS.forEach((r, d) => {
      plus[i * NR + d] =
        index.get(qkey(p[0]! + r[0]!, p[1]! + r[1]!, p[2]! + r[2]!)) ??
        -1

      minus[i * NR + d] =
        index.get(qkey(p[0]! - r[0]!, p[1]! - r[1]!, p[2]! - r[2]!)) ??
        -1
    })
  })

  const V = Int32Array.from(
    points.map(p => Math.round(Math.hypot(p[0]!, p[1]!, p[2]!))),
  )

  let radius = 0

  for (const v of V) {
    radius = Math.max(radius, v)
  }

  return { radius, points, index, plus, minus, V }
}

export const huskR = (p: readonly number[]): number =>
  Math.hypot(p[0]!, p[1]!, p[2]!)

// ---- the Coulomb count ----

export type CoulombCount = {
  alpha: number
  theta: number
  counts: Int32Array
  nearest: number
  top: number
}

// G(y) = G(0) - D(y): the husk Green's function at a relative position
export const greenOf = (
  table: GreenTable,
  p: readonly number[],
): number => table.g0 - greenAt(table, p[0]!, p[1]!, p[2]!)

// n(y) = floor(alpha G(y) / theta): the pair's Coulomb energy counted in steps of the unit's angle
export function coulombCounts(
  ball: RelBall,
  table: GreenTable,
  alpha: number,
  theta: number,
): CoulombCount {
  const counts = new Int32Array(ball.points.length)

  let nearest = Infinity
  let top = 0

  ball.points.forEach((p, i) => {
    const x = (alpha * greenOf(table, p)) / theta
    const n = Math.floor(x)

    counts[i] = n
    top = Math.max(top, n)
    nearest = Math.min(nearest, x - n, n + 1 - x)
  })

  return { alpha, theta, counts, nearest, top }
}

// w^2 e^(i phi) - 2 w + 1 (register-meson's beta)
function betaOf(wr: number, wi: number, phi: number): [number, number] {
  const w2r = wr * wr - wi * wi
  const w2i = 2 * wr * wi
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  return [w2r * c - w2i * s - 2 * wr + 1, w2r * s + w2i * c - 2 * wi]
}

// THE TWO FORMS OF A PAIR PHASE. 'scalar' is E-SPN-0162's: phi on S S in beat 1 and -phi on D D in beat 2 (the D D
// pair's eps moves the other way, as a mass does), and nothing on S D or D S. 'vector' is the Coulomb form: every
// sector's eps moves the same way (V 1 (x) 1), so phi on S S in beat 1, phi on D D in beat 2, and phi on the S D and D S
// sectors, applied as the exact projector pieces coulombCross (after the cycle).
export type PairForm = 'scalar' | 'vector'

export type CoulombEngine = PairEngine & {
  form: PairForm
  phi: Float64Array
  cross: Float64Array
}

// the engine with the pair phase phi(y) = -theta n(y) in the chosen form
export function coulombEngine(
  ball: RelBall,
  u: readonly [number, number],
  K: readonly number[],
  count: CoulombCount,
  form: PairForm = 'vector',
): CoulombEngine {
  const params: PairParams = { u, tau: 0, cap: 0, K }
  const e = pairEngine(ball, params)
  const phi = Float64Array.from(count.counts, n => -count.theta * n)

  setPairPhases(e, Array.from(phi), form)

  // e^(i phi) - 1 per site, for the cross pieces
  const cross = new Float64Array(2 * phi.length)

  phi.forEach((ph, i) => {
    cross[2 * i] = Math.cos(ph) - 1
    cross[2 * i + 1] = Math.sin(ph)
  })

  return Object.assign(e, { form, phi, cross })
}

// every site's beta from the S S pair phase phi (beat 1) and, on D D (beat 2), -phi (scalar) or phi (vector)
export function setPairPhases(
  e: PairEngine,
  phi: readonly number[],
  form: PairForm = 'scalar',
): void {
  const [ur, ui] = e.params.u

  phi.forEach((ph, i) => {
    const b1 = betaOf(ur, ui, ph)
    const b2 = betaOf(ur, -ui, form === 'scalar' ? -ph : ph)

    e.beta1[2 * i] = b1[0]
    e.beta1[2 * i + 1] = b1[1]
    e.beta2[2 * i] = b2[0]
    e.beta2[2 * i + 1] = b2[1]
  })
}

// ---- the cross pieces: phi on the S D and D S sectors ----
//
// P_SD = sum_(x1, x2) e^(i phi(x1 - x2)) (|S_x1><S_x1| (x) |T D_x2><T D_x2|) acts on the pair as the orthogonal projector
// Q_S (x) Q_D' (Q_D' = T Q_D T^dag) weighted by the site's phase: the S_x are orthonormal, the T D_y are orthonormal, so
// every dock term is an orthogonal projector, the terms are mutually orthogonal, and 1 + sum (e^(i phi) - 1) P is
// unitary. In coordinates Q_S (a, b) = (a + C b, 0) and Q_D' (a, b) = (0, b + C^dag a), so the piece changes block B
// only: B += (e^(i phi) - 1) (B + C1 D + C2^dag A + C2^dag C1 X), and its mirror P_DS changes block X only: X += (e^(i
// phi) - 1) (X + C1^dag A + C2 D + C2 C1^dag B). Both map into S (x) T D and T D (x) S, inside W (x) W, and are the
// identity on its complement, so W (x) W stays exact. They are applied after the cycle, P_SD then P_DS.

// out = conv of a block (member m, C or C^dag), register-meson's conv re-stated
function conv(
  e: PairEngine,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
): void {
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
      const j = table[i * NR + d]!

      if (j < 0) {
        continue
      }

      const pr = e.halfRe[d]!
      const pi = sgn * e.halfIm[d]!
      const so = j * srcStride + srcOff
      const mm = mats[d] as {
        row: Int8Array
        col: Int8Array
        val: Float64Array
      }
      const L = mm.val.length

      for (let q = 0; q < L; q++) {
        const row = mm.row[q]!
        const col = mm.col[q]!
        const v = mm.val[q]!
        const wr = v * pr
        const wi = v * pi

        if (member === 1) {
          const ob = oo + row * 8
          const sb = so + col * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = srcRe[sb + r2]!
            const xi = srcIm[sb + r2]!

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = srcRe[so + r1 * 8 + col]!
            const xi = srcIm[so + r1 * 8 + col]!

            outRe[oo + r1 * 8 + row]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + row]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

// the projected field of one cross piece: 'SD' gives B + C1 D + C2^dag A + C2^dag C1 X, 'DS' gives X + C1^dag A + C2 D +
// C2 C1^dag B (each a block field of stride 64)
export function crossProjection(
  e: PairEngine,
  s: PairState,
  kind: 'SD' | 'DS',
): { re: Float64Array; im: Float64Array } {
  const N = e.ball.points.length
  const [t1r, t1i, t2r, t2i, t3r, t3i, t4r, t4i] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]
  const outRe = new Float64Array(N * PAIR)
  const outIm = new Float64Array(N * PAIR)
  const [own, viaA, viaD, viaOther] =
    kind === 'SD'
      ? [BLOCK.B, BLOCK.A, BLOCK.D, BLOCK.X]
      : [BLOCK.X, BLOCK.A, BLOCK.D, BLOCK.B]

  if (kind === 'SD') {
    conv(e, s.re, s.im, viaD, SITE, t1r, t1i, 1, false) // C1 D
    conv(e, s.re, s.im, viaA, SITE, t2r, t2i, 2, true) // C2^dag A
    conv(e, s.re, s.im, viaOther, SITE, t3r, t3i, 1, false) // C1 X
    conv(e, t3r, t3i, 0, PAIR, t4r, t4i, 2, true) // C2^dag C1 X
  } else {
    conv(e, s.re, s.im, viaA, SITE, t1r, t1i, 1, true) // C1^dag A
    conv(e, s.re, s.im, viaD, SITE, t2r, t2i, 2, false) // C2 D
    conv(e, s.re, s.im, viaOther, SITE, t3r, t3i, 1, true) // C1^dag B
    conv(e, t3r, t3i, 0, PAIR, t4r, t4i, 2, false) // C2 C1^dag B
  }

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k

      outRe[c] = s.re[i * SITE + own + k]! + t1r[c]! + t2r[c]! + t4r[c]!
      outIm[c] = s.im[i * SITE + own + k]! + t1i[c]! + t2i[c]! + t4i[c]!
    }
  }

  return { re: outRe, im: outIm }
}

// apply one cross piece in place: the own block += (e^(i phi) - 1) times the projected field
export function crossPiece(
  e: CoulombEngine,
  s: PairState,
  kind: 'SD' | 'DS',
): void {
  const N = e.ball.points.length
  const p = crossProjection(e, s, kind)
  const own = kind === 'SD' ? BLOCK.B : BLOCK.X

  for (let i = 0; i < N; i++) {
    const cr = e.cross[2 * i]!
    const ci = e.cross[2 * i + 1]!

    if (cr === 0 && ci === 0) {
      continue
    }

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const xr = p.re[c]!
      const xi = p.im[c]!

      s.re[i * SITE + own + k]! += cr * xr - ci * xi
      s.im[i * SITE + own + k]! += cr * xi + ci * xr
    }
  }
}

// one cycle of the Coulomb pair: the two beats (S S and D D in them), then, for the vector form, P_SD and P_DS
export function coulombCycle(e: CoulombEngine, s: PairState): void {
  pairCycle(e, s)

  if (e.form === 'vector') {
    crossPiece(e, s, 'SD')
    crossPiece(e, s, 'DS')
  }
}

// the filter and the level read on the Coulomb cycle (register-meson's filterPair / readLevel, with coulombCycle)
export function coulombFilter(
  e: CoulombEngine,
  psi: PairState,
  phase: number,
  S: number,
): PairState {
  const out: PairState = {
    re: new Float64Array(psi.re.length),
    im: new Float64Array(psi.im.length),
  }
  const s = clonePair(psi)

  for (let k = 0; k < S; k++) {
    const w = blackmanHarris(k, S)

    axpy(out, s, w * Math.cos(-phase * k), w * Math.sin(-phase * k))
    coulombCycle(e, s)
  }

  return out
}

export function coulombRead(
  e: CoulombEngine,
  v: PairState,
): { lambda: [number, number]; phase: number; residual: number } {
  const n = norm2(e, v)
  const Uv = clonePair(v)

  coulombCycle(e, Uv)

  const [lr, li] = inner(e, v, Uv).map(x => x / n) as [number, number]
  const r = clonePair(Uv)

  axpy(r, v, -lr, -li)

  return {
    lambda: [lr, li],
    phase: Math.atan2(li, lr),
    residual: Math.sqrt(norm2(e, r) / n),
  }
}

// ---- starts and readings ----

// both members in S with the hydrogenic profile exp(-r / a), the registers paired by delta (the W(F4)-symmetric sector)
export function hydrogenStart(ball: RelBall, a: number): PairState {
  const n = ball.points.length
  const s: PairState = {
    re: new Float64Array(n * SITE),
    im: new Float64Array(n * SITE),
  }

  ball.points.forEach((p, i) => {
    const f = Math.exp(-huskR(p) / a)

    for (let r = 0; r < REG; r++) {
      s.re[i * SITE + BLOCK.A + r * 8 + r] = f
    }
  })

  return s
}

// the coordinate weight per site (a profile: the Gram metric's cross terms spread it over neighbours)
export function siteWeights(ball: RelBall, s: PairState): Float64Array {
  const w = new Float64Array(ball.points.length)

  for (let i = 0; i < ball.points.length; i++) {
    let x = 0

    for (let k = 0; k < SITE; k++) {
      x += s.re[i * SITE + k]! ** 2 + s.im[i * SITE + k]! ** 2
    }

    w[i] = x
  }

  return w
}

// the weight in unit shells of husk radius, the mean radius, and the weight at the ball's outermost shell
export function shells(
  ball: RelBall,
  w: Float64Array,
): { shells: number[]; mean: number; edge: number } {
  const out = new Array<number>(ball.radius + 1).fill(0)

  let t = 0
  let m = 0

  ball.points.forEach((p, i) => {
    const r = huskR(p)

    out[ball.V[i]!]! += w[i]!
    t += w[i]!
    m += w[i]! * r
  })

  return {
    shells: out.map(x => x / t),
    mean: m / t,
    edge: out[ball.radius]! / t,
  }
}

// <G(y)> over a density: the mean Coulomb count and the mean Green's function
export function meanGreen(
  ball: RelBall,
  table: GreenTable,
  w: Float64Array,
): number {
  let t = 0
  let g = 0

  ball.points.forEach((p, i) => {
    t += w[i]!
    g += w[i]! * greenOf(table, p)
  })

  return g / t
}

// ---- the Darwin S of a measured density ----

// S on the side-T husk torus: the density wrapped onto it (minimum image), rhohat by the 3d FFT, then the weighted means
// of X(k) (E-SPN-0169's darwinRatio) over the nonzero torus momenta. Also the weighted mean k^2.
export function densityS(
  ball: RelBall,
  w: Float64Array,
  T: number,
): { S: number; meanK2: number; points: number; wrapped: number } {
  const re = new Float64Array(T * T * T)
  const im = new Float64Array(T * T * T)
  const m = (x: number): number => ((x % T) + T) % T

  let wrapped = 0
  let total = 0

  ball.points.forEach((p, i) => {
    const [a, b, c] = p as [number, number, number]

    total += w[i]!

    if (
      Math.abs(a) >= T / 2 ||
      Math.abs(b) >= T / 2 ||
      Math.abs(c) >= T / 2
    ) {
      wrapped += w[i]!
    }

    re[m(a) + T * m(b) + T * T * m(c)]! += w[i]!
  })

  fft3(re, im, T, false)

  const step = (2 * Math.PI) / T

  let num = 0
  let den = 0
  let k2 = 0
  let points = 0

  for (let c = 0; c < T; c++) {
    for (let b = 0; b < T; b++) {
      for (let a = 0; a < T; a++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        const k = [a, b, c].map(x => {
          const y = x * step

          return y > Math.PI ? y - 2 * Math.PI : y
        })
        const rho = re[a + T * b + T * T * c]!
        const weight = rho / coulombSymbol(k)
        const { X } = darwinRatio(k)

        num += X * weight
        den += weight
        k2 += (k[0]! ** 2 + k[1]! ** 2 + k[2]! ** 2) * weight
        points++
      }
    }
  }

  return {
    S: num / den,
    meanK2: k2 / den,
    points,
    wrapped: wrapped / total,
  }
}

// ---- the full rule on the quotient, for the witness ----

export type FullState = { re: Float64Array; im: Float64Array }
export type FullRuleQ = {
  ball: RelBall
  u: readonly [number, number]
  K: readonly number[]
  phi: Float64Array
  E: Float64Array
  phase: Float64Array
  target: Int32Array
  form: PairForm
}

// E[d][a][eta] = gamma(r_d)[eta][a] / (2 sqrt 12): the D basis (Q_D = E E^T)
function partnerBasis(): Float64Array {
  const g = gammaMatrices()
  const E = new Float64Array(MODES * REG)
  const f = 1 / (2 * Math.sqrt(12))

  ROOTS.forEach((r, d) => {
    for (let a = 0; a < REG; a++) {
      for (let eta = 0; eta < REG; eta++) {
        let s = 0

        for (let i = 0; i < 4; i++) {
          s += r[i]! * g[i]![eta]![a]!
        }

        E[(d * REG + a) * REG + eta] = f * s
      }
    }
  })

  return E
}

// the rule on a quotient ball: phi[i] the S S pair phase at site i (beat 1; D D takes -phi (scalar) or phi (vector) in
// beat 2). The cross pieces are not in it: the witness compares the two beats, and the cross pieces are checked as exact
// projectors in coordinates (their Gram self-adjointness and the norm)
export function fullRuleQ(
  ball: RelBall,
  u: readonly [number, number],
  K: readonly number[],
  phi: readonly number[],
  form: PairForm = 'scalar',
): FullRuleQ {
  const phase = new Float64Array(NR * NR * 2)
  const target = new Int32Array(ball.points.length * NR * NR)

  for (let d = 0; d < NR; d++) {
    for (let f = 0; f < NR; f++) {
      const ph =
        -(dot(K, ROOTS[d] as number[]) + dot(K, ROOTS[f] as number[])) /
        2

      phase[(d * NR + f) * 2] = Math.cos(ph)
      phase[(d * NR + f) * 2 + 1] = Math.sin(ph)
    }
  }

  ball.points.forEach((p, i) => {
    for (let d = 0; d < NR; d++) {
      for (let f = 0; f < NR; f++) {
        const r = ROOTS[d] as number[]
        const q = ROOTS[f] as number[]

        target[(i * NR + d) * NR + f] =
          ball.index.get(
            qkey(
              p[0]! + r[0]! - q[0]!,
              p[1]! + r[1]! - q[1]!,
              p[2]! + r[2]! - q[2]!,
            ),
          ) ?? -1
      }
    }
  })

  return {
    ball,
    u,
    K,
    phi: Float64Array.from(phi),
    E: partnerBasis(),
    phase,
    target,
    form,
  }
}

export const newFull = (ball: RelBall): FullState => ({
  re: new Float64Array(ball.points.length * FULL),
  im: new Float64Array(ball.points.length * FULL),
})

// the pair piece at one site: psi + alpha (Q psi + psi Q^T) + beta Q psi Q^T (register-meson's pieceAt, re-stated)
function pieceAt(
  psiRe: Float64Array,
  psiIm: Float64Array,
  o: number,
  sector: 'S' | 'D',
  wr: number,
  wi: number,
  br: number,
  bi: number,
  E: Float64Array,
): void {
  const q = (
    re: Float64Array,
    im: Float64Array,
    off: number,
    stride1: number,
    stride2: number,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    for (let s2 = 0; s2 < MODES; s2++) {
      if (sector === 'S') {
        for (let a = 0; a < REG; a++) {
          let sr = 0
          let si = 0

          for (let d = 0; d < 24; d++) {
            sr += re[off + (d * REG + a) * stride1 + s2 * stride2]!
            si += im[off + (d * REG + a) * stride1 + s2 * stride2]!
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
          const xr = re[off + s1 * stride1 + s2 * stride2]!
          const xi = im[off + s1 * stride1 + s2 * stride2]!

          if (xr === 0 && xi === 0) {
            continue
          }

          for (let eta = 0; eta < REG; eta++) {
            const w = E[s1 * REG + eta]!

            if (w === 0) {
              continue
            }

            cr[eta]! += w * xr
            ci[eta]! += w * xi
          }
        }

        for (let s1 = 0; s1 < MODES; s1++) {
          let sr = 0
          let si = 0

          for (let eta = 0; eta < REG; eta++) {
            const w = E[s1 * REG + eta]!

            sr += w * cr[eta]!
            si += w * ci[eta]!
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
  const tr = new Float64Array(FULL)
  const ti = new Float64Array(FULL)

  q(psiRe, psiIm, o, MODES, 1, q1r, q1i)
  q(psiRe, psiIm, o, 1, MODES, tr, ti)

  for (let s1 = 0; s1 < MODES; s1++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      q2r[s1 * MODES + s2] = tr[s2 * MODES + s1]!
      q2i[s1 * MODES + s2] = ti[s2 * MODES + s1]!
    }
  }

  q(q1r, q1i, 0, 1, MODES, tr, ti)

  for (let s1 = 0; s1 < MODES; s1++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      q12r[s1 * MODES + s2] = tr[s2 * MODES + s1]!
      q12i[s1 * MODES + s2] = ti[s2 * MODES + s1]!
    }
  }

  const alr = wr - 1
  const ali = wi

  for (let k = 0; k < FULL; k++) {
    const pr = q1r[k]! + q2r[k]!
    const pi = q1i[k]! + q2i[k]!
    const zr = q12r[k]!
    const zi = q12i[k]!

    psiRe[o + k]! += alr * pr - ali * pi + br * zr - bi * zi
    psiIm[o + k]! += alr * pi + ali * pr + br * zi + bi * zr
  }
}

// one beat of the full rule on the quotient: the pieces (S with u and the pair phase in beat 1, D with conj u and minus
// it in beat 2), the swap coin (slot d takes its opposite's value, the register kept), and the stream (the relative
// position moves r_d - r_e, reduced to the quotient; out of the ball is dropped)
export function fullBeatQ(
  f: FullRuleQ,
  s: FullState,
  beat: 1 | 2,
): FullState {
  const N = f.ball.points.length
  const [ur, ui] = f.u
  const w: [number, number] = beat === 1 ? [ur, ui] : [ur, -ui]

  for (let i = 0; i < N; i++) {
    const ph = (beat === 1 || f.form === 'vector' ? 1 : -1) * f.phi[i]!
    const [br, bi] = betaOf(w[0], w[1], ph)

    pieceAt(
      s.re,
      s.im,
      i * FULL,
      beat === 1 ? 'S' : 'D',
      w[0],
      w[1],
      br,
      bi,
      f.E,
    )
  }

  const out = newFull(f.ball)

  for (let i = 0; i < N; i++) {
    for (let d = 0; d < NR; d++) {
      const from1 = OPPOSITE[d]!

      for (let e = 0; e < NR; e++) {
        const j = f.target[(i * NR + d) * NR + e]!

        if (j < 0) {
          continue
        }

        const from2 = OPPOSITE[e]!
        const cr = f.phase[(d * NR + e) * 2]!
        const ci = f.phase[(d * NR + e) * 2 + 1]!

        for (let a = 0; a < REG; a++) {
          for (let b = 0; b < REG; b++) {
            const src =
              i * FULL + (from1 * REG + a) * MODES + from2 * REG + b
            const dst = j * FULL + (d * REG + a) * MODES + e * REG + b
            const xr = s.re[src]!
            const xi = s.im[src]!

            out.re[dst] = cr * xr - ci * xi
            out.im[dst] = cr * xi + ci * xr
          }
        }
      }
    }
  }

  return out
}

// the lift of coordinates into the full space on the quotient (register-meson's lift, every shift reduced)
export function liftQ(
  pairBall: RelBall,
  s: PairState,
  fullBall: RelBall,
  K: readonly number[],
): FullState {
  const out = newFull(fullBall)
  const E = partnerBasis()
  const sq = 1 / Math.sqrt(24)

  type Piece = { shift: number[]; mode: number; re: number; im: number }

  const member = (kind: 'a' | 'b', label: number): Piece[] => {
    const list: Piece[] = []

    if (kind === 'a') {
      for (let d = 0; d < 24; d++) {
        list.push({
          shift: [0, 0, 0, 0],
          mode: d * REG + label,
          re: sq,
          im: 0,
        })
      }
    } else {
      ROOTS.forEach((r, d) => {
        const ph = -dot(K, r) / 2

        for (let a = 0; a < REG; a++) {
          const x = E[(d * REG + a) * REG + label]!

          if (x !== 0) {
            list.push({
              shift: [...r],
              mode: d * REG + a,
              re: x * Math.cos(ph),
              im: x * Math.sin(ph),
            })
          }
        }
      })
    }

    return list
  }

  const pieces = {
    a: Array.from({ length: REG }, (_, l) => member('a', l)),
    b: Array.from({ length: REG }, (_, l) => member('b', l)),
  }
  const kinds: ['a' | 'b', 'a' | 'b'][] = [
    ['a', 'a'],
    ['a', 'b'],
    ['b', 'a'],
    ['b', 'b'],
  ]

  for (let i = 0; i < pairBall.points.length; i++) {
    const y = pairBall.points[i]!

    kinds.forEach(([k1, k2], blk) => {
      for (let r1 = 0; r1 < REG; r1++) {
        for (let r2 = 0; r2 < REG; r2++) {
          const cr = s.re[i * SITE + blk * PAIR + r1 * 8 + r2]!
          const ci = s.im[i * SITE + blk * PAIR + r1 * 8 + r2]!

          if (cr === 0 && ci === 0) {
            continue
          }

          for (const p1 of pieces[k1][r1]!) {
            for (const p2 of pieces[k2][r2]!) {
              const j = fullBall.index.get(
                qkey(
                  y[0]! + p1.shift[0]! - p2.shift[0]!,
                  y[1]! + p1.shift[1]! - p2.shift[1]!,
                  y[2]! + p1.shift[2]! - p2.shift[2]!,
                ),
              )

              if (j === undefined) {
                continue
              }

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

// the largest entry gap and both weights over the sites within husk radius `within`
export function fullGapQ(
  ball: RelBall,
  a: FullState,
  b: FullState,
  within = Infinity,
): { worst: number; weightA: number; weightB: number } {
  let worst = 0
  let wa = 0
  let wb = 0

  ball.points.forEach((p, s) => {
    if (huskR(p) > within) {
      return
    }

    for (let k = s * FULL; k < (s + 1) * FULL; k++) {
      worst = Math.max(
        worst,
        Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!),
      )
      wa += a.re[k]! ** 2 + a.im[k]! ** 2
      wb += b.re[k]! ** 2 + b.im[k]! ** 2
    }
  })

  return { worst, weightA: wa, weightB: wb }
}
