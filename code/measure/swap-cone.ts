// ONE LIMITING SPEED UNDER THE DOCK MIXER (E-SPN-0143). code/measure/dock-mixer builds a lone hole's (or love's) one-dock
// matrix P = C m under the fine coin C (zeta = e^(i phi)) and the dock-wide mixer m (angle theta), and U(K) = S(K) P its
// Bloch beat, S = diag(e^(-i K . r_d)). This file holds what the swap coin (zeta = -1, C = the line swap X) makes exact:
//
// THE REDUCTION. With C = X every line's 2 x 2 block of U0 = S X is [[0, e^(-i k)], [e^(i k), 0]], k = K . r_line: its
// eigenvalues are +1 and -1 at every K (U0^2 = I). U = U0 (I + (e^(-i theta) - 1) z^ z^*) (a hole, up to a global phase)
// is a rank-one change of U0, so 11 states stay at +1 and 11 at -1 for every K (FLAT, zero group velocity: the lineons
// bounce in place), and the other two live on span(P+ z, P- z). There, with g(K) = (1/24) sum_d cos(K . r_d) (the D4
// structure function, |P- z^|^2 - |P+ z^|^2 = g), the quasi-energies obey
//     sin w = sin(theta / 2) g(K)     (the pair is w and pi - w, so its midpoint is fixed: no K^2 shift).
// The love is the mirror (u in place of z, -g in place of g), with the same speeds.
//
// THE BOUND. v = sin(theta / 2) grad g / cos w, and by Cauchy-Schwarz on the 2-design sum_d (u . r_d)^2 = 12,
//     |grad g|^2 <= (1/48) sum_d sin^2(K . r_d) = (1 - <cos^2>) / 2 <= (1 - g^2) / 2,
// so |v| <= sin(theta/2) sqrt(1 - g^2) / (sqrt 2 sqrt(1 - sin^2(theta/2) g^2)) <= sin(theta/2) / sqrt 2 <= c / 2 (c = sqrt 2,
// one root a beat), approached only as K -> 0 at theta = pi. Every band of the swap coin moves at most c / 2.
//
// DETERMINISM: no random numbers. EXACT: the norm-one Eisenstein numbers are integer arithmetic; the bands are floats, as
// measurement. NOTHING MOVES: the coin and the mixer hand a value to another slot of the same dock; the stream takes it one
// dock along.

import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { DOCK_ROOTS, wrap, type CMatrix, type Multiplet } from '@/code/measure/dock-mixer'
import { polynomialAtZero } from '@/code/measure/singlet-kinematics'

type Roots = readonly (readonly number[])[]

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

// ---- the D4 structure function ----

// g(K) = (1/24) sum_d cos(K . r_d) and its gradient -(1/24) sum_d sin(K . r_d) r_d
export function structureFunction(K: readonly number[]): { g: number; grad: number[]; meanCos2: number } {
  let g = 0
  let c2 = 0
  const grad = [0, 0, 0, 0]

  for (const r of DOCK_ROOTS) {
    const p = dot(K, r)
    const c = Math.cos(p)
    const s = Math.sin(p)

    g += c / 24
    c2 += (c * c) / 24
    for (let k = 0; k < 4; k++) grad[k]! -= (s * (r[k] as number)) / 24
  }

  return { g, grad, meanCos2: c2 }
}

// the swap coin's moving pair: its group speed (coordinate units a beat) at K for mixer angle theta, from
// sin w = sin(theta / 2) g
export function swapPairSpeed(theta: number, K: readonly number[]): number {
  const { g, grad } = structureFunction(K)
  const s = Math.abs(Math.sin(theta / 2))

  return (s * Math.hypot(...grad)) / Math.sqrt(1 - s * s * g * g)
}

// the swap coin with the mixer angle alternating theta1, theta2 (beat 1 first): the pair's two-beat quasi-energy obeys
// cos W = cos((theta1 + theta2) / 2) + 2 sin(theta1 / 2) sin(theta2 / 2) (1 - g^2); its speed per beat |dW/dK| / 2
export function swapScheduleSpeed(theta1: number, theta2: number, K: readonly number[]): number {
  const { g, grad } = structureFunction(K)
  const a = 2 * Math.sin(theta1 / 2) * Math.sin(theta2 / 2)
  const cw = Math.cos((theta1 + theta2) / 2) + a * (1 - g * g)

  return (Math.abs(a * g) * Math.hypot(...grad)) / Math.sqrt(1 - cw * cw)
}

// ---- a periodic schedule of dock matrices (a Floquet cycle) ----

function cmulN(a: CMatrix, b: CMatrix, n: number): CMatrix {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k] as number
      const ai = a.im[i * n + k] as number

      if (ar === 0 && ai === 0) continue

      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j] as number
        const bi = b.im[k * n + j] as number

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// one beat's Bloch matrix S(K) P
function beatMatrix(P: CMatrix, roots: Roots, K: readonly number[]): CMatrix {
  const n = roots.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    const ph = -dot(roots[r] as readonly number[], K)
    const c = Math.cos(ph)
    const s = Math.sin(ph)

    for (let q = 0; q < n; q++) {
      const a = P.re[r * n + q] as number
      const b = P.im[r * n + q] as number

      re[r * n + q] = c * a - s * b
      im[r * n + q] = c * b + s * a
    }
  }

  return { re, im }
}

// U_N(K) = S P_N ... S P_1 (beat 1 first)
export function cycleMatrix(Ps: readonly CMatrix[], roots: Roots, K: readonly number[]): CMatrix {
  const n = roots.length
  let u = beatMatrix(Ps[0] as CMatrix, roots, K)

  for (let j = 1; j < Ps.length; j++) u = cmulN(beatMatrix(Ps[j] as CMatrix, roots, K), u, n)

  return u
}

export const cyclePhases = (Ps: readonly CMatrix[], roots: Roots, K: readonly number[]): number[] => {
  const u = cycleMatrix(Ps, roots, K)
  const e = complexEigenvalues({ re: u.re, im: u.im, n: roots.length })

  return e.re.map((x, i) => Math.atan2(e.im[i] as number, x))
}

// the cycle's eigenphases and each eigenvector's group velocity per beat: dE/dK with E = -phase / N is the mean over the
// cycle's N beats of sum_q |psi_j,q|^2 r_q, psi_j the state after beat j (Hellmann-Feynman on the product)
export function cycleBand(Ps: readonly CMatrix[], roots: Roots, K: readonly number[]): { phase: number[]; velocity: number[][] } {
  const n = roots.length
  const u = cycleMatrix(Ps, roots, K)
  const beats = Ps.map(P => beatMatrix(P, roots, K))
  const e = complexEigenvalues({ re: u.re, im: u.im, n })
  const phase: number[] = []
  const velocity: number[][] = []

  e.re.forEach((x, i) => {
    const y = e.im[i] as number
    let psi = complexEigenvector({ re: u.re, im: u.im, n, value: [x, y] })
    const v = [0, 0, 0, 0]

    for (const B of beats) {
      const re = new Float64Array(n)
      const im = new Float64Array(n)

      for (let r = 0; r < n; r++) {
        for (let q = 0; q < n; q++) {
          const a = B.re[r * n + q] as number
          const b = B.im[r * n + q] as number

          re[r]! += a * (psi.re[q] as number) - b * (psi.im[q] as number)
          im[r]! += a * (psi.im[q] as number) + b * (psi.re[q] as number)
        }
      }

      psi = { re, im }

      for (let q = 0; q < n; q++) {
        const w = ((re[q] as number) ** 2 + (im[q] as number) ** 2) / beats.length

        for (let k = 0; k < 4; k++) v[k]! += w * ((roots[q] as readonly number[])[k] as number)
      }
    }

    phase.push(Math.atan2(y, x))
    velocity.push(v)
  })

  return { phase, velocity }
}

// the largest group speed per beat over every band of the cycle at the given momenta
export function fastestCycleBand(Ps: readonly CMatrix[], roots: Roots, momenta: readonly (readonly number[])[]): { speed: number; at: number[] } {
  let speed = 0
  let at: number[] = []

  for (const K of momenta) {
    for (const v of cycleBand(Ps, roots, K).velocity) {
      const s = Math.hypot(...v)

      if (s > speed) {
        speed = s
        at = [...K]
      }
    }
  }

  return { speed, at }
}

// the cycle's K = 0 phases grouped within tol
export function cycleMultiplets(Ps: readonly CMatrix[], roots: Roots, tol = 1e-9): Multiplet[] {
  const ph = cyclePhases(Ps, roots, [0, 0, 0, 0]).sort((a, b) => a - b)
  const out: Multiplet[] = []

  for (const p of ph) {
    const m = out.find(g => Math.abs(wrap(p - g.center)) <= tol)

    if (m) m.size++
    else out.push({ center: p, size: 1 })
  }

  return out
}

export type CycleSinglet = { sizes: number[]; partnerSize: number; m: number; gap: number; c2: number; d: number; eta: number }

// THE SINGLET OF A CYCLE: the size-1 level at K = 0 and its nearest level (the partner), m half the gap PER BEAT, and
// along u the fit eps^2 = m^2 + c^2 K^2 + d K^4 (per beat, eps from the midpoint), read at K = s m u for s in scales
// through code/measure/singlet-kinematics polynomialAtZero; the branch is the eigenphase nearest the singlet's K = 0
// phase (the scales keep K well inside half the gap)
export function cycleSinglet(Ps: readonly CMatrix[], roots: Roots, u: readonly number[], scales: readonly number[]): CycleSinglet {
  const N = Ps.length
  const ms = cycleMultiplets(Ps, roots)
  const sizes = ms.map(x => x.size).sort((a, b) => a - b)
  const single = ms.findIndex(x => x.size === 1)

  if (single < 0) return { sizes, partnerSize: 0, m: 0, gap: 0, c2: NaN, d: NaN, eta: NaN }

  const cs = (ms[single] as Multiplet).center
  let partner = -1

  ms.forEach((x, i) => {
    if (i === single) return
    if (partner < 0 || Math.abs(wrap(x.center - cs)) < Math.abs(wrap((ms[partner] as Multiplet).center - cs))) partner = i
  })

  const half = wrap(cs - (ms[partner] as Multiplet).center) / 2
  const midPhase = (ms[partner] as Multiplet).center + half
  const sign = half > 0 ? -1 : 1
  const m = Math.abs(half) / N
  const eps = (K: readonly number[]): number => {
    const near = cyclePhases(Ps, roots, K).reduce((b, p) => (Math.abs(wrap(p - cs)) < Math.abs(wrap(b - cs)) ? p : b))

    return (sign * -wrap(near - midPhase)) / N
  }
  const xs = scales.map(s => s * s)
  const ys = scales.map(s => {
    const K = s * m
    const e = eps(u.map(x => x * K))

    return (e * e - m * m) / (K * K)
  })
  const p = polynomialAtZero(xs, ys)
  const d = p.slope / (m * m)

  return { sizes, partnerSize: (ms[partner] as Multiplet).size, m, gap: 2 * m, c2: p.value, d, eta: (d * m * m) / (p.value * p.value) }
}

// ---- norm-one Eisenstein numbers: the mixer angles a ring can hold ----

// a + b w, w = e^(2 pi i / 3), as bigints
export type Eis = [bigint, bigint]

export const eisMul = (x: Eis, y: Eis): Eis => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
export const eisConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
export const eisNorm = (x: Eis): bigint => x[0] * x[0] - x[0] * x[1] + x[1] * x[1]
export const eisPow = (x: Eis, k: number): Eis => {
  let r: Eis = [1n, 0n]

  for (let i = 0; i < k; i++) r = eisMul(r, x)

  return r
}

// the complex value of x / den
export const eisValue = (x: Eis, den: bigint): [number, number] => [(Number(x[0]) - Number(x[1]) / 2) / Number(den), (Number(x[1]) * Math.sqrt(3)) / 2 / Number(den)]

const UNITS: readonly Eis[] = [
  [1n, 0n],
  [1n, 1n],
  [0n, 1n],
  [-1n, 0n],
  [-1n, -1n],
  [0n, -1n],
]

export type RingAngle = { k: number; numerator: Eis; den: bigint; normExact: boolean; delta: number }

// the angles delta with e^(i delta) = w^j (p / conj p)^(+-k), for a prime p of Z[w] of norm q: numerator over q^k, the
// representative nearest 0 (ties to the positive side), and whether numerator times its conjugate is q^(2k) exactly
export function ringAngle(p: Eis, k: number): RingAngle {
  const q = eisNorm(p)
  const den = q ** BigInt(k)
  const up = eisPow(eisMul(p, p), k)
  const down = eisPow(eisMul(eisConj(p), eisConj(p)), k)
  let best: RingAngle | undefined

  for (const base of k === 0 ? [[1n, 0n] as Eis] : [up, down]) {
    for (const unit of UNITS) {
      const x = eisMul(base, unit)
      const [re, im] = eisValue(x, den)
      const delta = Math.atan2(im, re)

      if (!best || Math.abs(delta) < Math.abs(best.delta) - 1e-15 || (Math.abs(Math.abs(delta) - Math.abs(best.delta)) <= 1e-15 && delta > best.delta)) {
        best = { k, numerator: x, den, normExact: eisNorm(x) === den * den, delta }
      }
    }
  }

  return best as RingAngle
}
