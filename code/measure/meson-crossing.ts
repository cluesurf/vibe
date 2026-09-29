// Measurement for E-SPN-0115 (test/experiment/spin/meson-crossing): what crosses the string-bound love-fear meson's
// band (code/measure/meson-band, the even-d block of string-binding's pair beat), and a diabatic reading of the band
// through it.
//
// THE EXCHANGE. Love and fear enter the pair beat alike: the same fine coin on each, a string that reads |d| only, a
// wall that flips both labels and keeps d, and no meeting. The block writes a pair of total momentum K with love at the
// origin, psi(x0, x1) = e^(iK x0) phi(x1 - x0) (pairColumn puts e^(-iK s0) on love's step s0). Swapping the tokens,
// psi'(x0, x1) = psi(x1, x0) with their labels swapped, is e^(iK x0) e^(iKd) phi(-d, j1, j0), so on the block
//   (X phi)(d, j0, j1) = e^(iKd) phi(-d, j1, j0),   X^2 = 1,
// and d -> -d keeps the parity of d, so X acts inside the even block. `exchangeMap` and `exchange` build it; the
// experiment measures |U X - X U| on a Weyl vector (and the wrong sign e^(-iKd), which must fail). X = +1 and X = -1
// are two sectors the beat never connects.
//
// THE NEAR SPECTRUM (`nearSpectrum`). k vectors, each round (U - s)^(-1) by the banded elimination factored once per K
// (`bandFactor`, meson-band's bandSolve split in two) with s the target energy's eigenvalue nudged off the circle by
// 1e-9, projected on one exchange sector, Gram-Schmidt twice;
// then Rayleigh-Ritz: the k x k matrix Q^dag U Q diagonalized by quantum-ladder's unitaryEigen. The Ritz levels are
// read with their residual |U v - lambda v|, so an unconverged one is visible.
//
// THE KLEIN PREDICTION. The lone walk's two branches at the fine coin are B (E_B in [0, pi - 2m]) and A = the other
// eigenphase; their product is the beat's determinant, the fine coin's keep^2 - cross^2 = zeta = e^(2 pi i/(3n)), so
// E_A = -E_B - 2m (mod 2 pi), m = pi/(3n). A pair with one
// token in each branch and the string sigma |d| has energy near -2m + sigma |d| (plus kinetic), so a level of that
// kind at energy E sits at |d| = (E + 2m)/sigma: where the string's energy pays for the gap. That is the Klein (Schwinger)
// channel of a Dirac particle in a linear potential. `kleinDistance` is the prediction, stated before it is read.
//
// NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line; the stream copies. The floats are
// measurement.

import { lightN } from '@/code/measure/drift-cost-bloch'
import {
  inner,
  unitaryEigen,
  type Vec,
} from '@/code/measure/quantum-ladder'
import {
  parityIndices,
  type Meson,
} from '@/code/measure/string-binding'
import {
  bandApply,
  overlapOf,
  pairBand,
  type PairBand,
} from '@/code/measure/meson-band'

export type Exchange = { partner: Int32Array; d: Int32Array }

export function exchangeMap(m: Meson): Exchange {
  const idx = parityIndices(m, 0)
  const at = new Map(idx.map((i, a) => [i, a]))
  const partner = new Int32Array(idx.length)
  const d = new Int32Array(idx.length)

  idx.forEach((i, a) => {
    const c = Math.floor(i / m.b.labelCount)
    const r = i % m.b.labelCount
    const dd = m.b.configs[c]![1]!

    d[a] = dd
    partner[a] = at.get(
      m.b.index(m.b.configOf([0, -dd]), (r & 1) * 2 + (r >> 1)),
    )!
  })

  return { partner, d }
}

// (X phi)(d, j0, j1) = e^(i sign K d) phi(-d, j1, j0); sign -1 is the wrong phase, for the control
export function exchange(
  x: Exchange,
  K: number,
  v: Vec,
  sign = 1,
): Vec {
  const n = v.re.length
  const out = { re: new Float64Array(n), im: new Float64Array(n) }

  for (let a = 0; a < n; a++) {
    const p = x.partner[a]!
    const th = sign * K * x.d[a]!
    const c = Math.cos(th)
    const s = Math.sin(th)

    out.re[a] = c * v.re[p]! - s * v.im[p]!
    out.im[a] = c * v.im[p]! + s * v.re[p]!
  }

  return out
}

// <v|X|v>/<v|v> (real for X Hermitian)
export function exchangeValue(x: Exchange, K: number, v: Vec): number {
  return inner(v, exchange(x, K, v))[0] / inner(v, v)[0]
}

// (1 + sector X)/2 v, in place
export function projectSector(
  x: Exchange,
  K: number,
  v: Vec,
  sector: 1 | -1,
): void {
  const w = exchange(x, K, v)

  for (let a = 0; a < v.re.length; a++) {
    v.re[a] = (v.re[a]! + sector * w.re[a]!) / 2
    v.im[a] = (v.im[a]! + sector * w.im[a]!) / 2
  }
}

// a deterministic spread vector (Weyl phases, Weyl moduli)
export function weylVector(n: number, a: number): Vec {
  const v = { re: new Float64Array(n), im: new Float64Array(n) }

  for (let i = 0; i < n; i++) {
    const th = 2 * Math.PI * (((i + 1) * a) % 1)
    const r = 1 + ((i * a * 7) % 1)

    v.re[i] = r * Math.cos(th)
    v.im[i] = r * Math.sin(th)
  }

  return v
}

// fractional parts of sqrt 2, sqrt 3, golden ratio, sqrt 5, sqrt 10, sqrt 11, e, pi, ln 2, Euler's gamma, sqrt 7
export const WEYL: readonly number[] = [
  0.4142135623730951, 0.7320508075688772, 0.6180339887498949,
  0.2360679774997898, 0.1622776601683795, 0.3166247903554,
  0.718281828459045, 0.14159265358979312, 0.6931471805599453,
  0.5772156649015329, 0.6457513110645907,
]

export function orthonormal(vs: readonly Vec[]): Vec[] {
  const out: Vec[] = []

  for (const v0 of vs) {
    const w = {
      re: Float64Array.from(v0.re),
      im: Float64Array.from(v0.im),
    }

    for (let pass = 0; pass < 2; pass++) {
      for (const q of out) {
        const [r, i] = inner(q, w)

        for (let k = 0; k < w.re.length; k++) {
          w.re[k] = w.re[k]! - (r * q.re[k]! - i * q.im[k]!)
          w.im[k] = w.im[k]! - (r * q.im[k]! + i * q.re[k]!)
        }
      }
    }

    const s = 1 / Math.sqrt(inner(w, w)[0])

    for (let k = 0; k < w.re.length; k++) {
      w.re[k] = w.re[k]! * s
      w.im[k] = w.im[k]! * s
    }

    out.push(w)
  }

  return out
}

// THE FACTOR, ONCE PER K. meson-band's bandSolve factors (U - s) on every call; the near spectrum solves k vectors for
// many rounds at one K and one shift, so `bandFactor` keeps the same banded elimination with partial pivoting (the same
// window of 2 kl + ku + 1 per row) and `factorSolve` applies it to one right-hand side. The experiment checks one solve
// against bandSolve.
export type BandLU = {
  n: number
  kl: number
  ku: number
  W: number
  ar: Float64Array
  ai: Float64Array
  pivot: Int32Array
}

export function bandFactor(
  op: PairBand,
  sr: number,
  si: number,
): BandLU {
  const { dim: n, kl, ku } = op
  const W = 2 * kl + ku + 1
  const ar = new Float64Array(n * W)
  const ai = new Float64Array(n * W)
  const pivot = new Int32Array(n)
  const slot = (i: number, j: number): number => i * W + (j - i + kl)

  for (let j = 0; j < n; j++) {
    for (let p = op.start[j]!; p < op.start[j + 1]!; p++) {
      const s = slot(op.rows[p]!, j)

      ar[s] = ar[s]! + op.re[p]!
      ai[s] = ai[s]! + op.im[p]!
    }

    ar[slot(j, j)] = ar[slot(j, j)]! - sr
    ai[slot(j, j)] = ai[slot(j, j)]! - si
  }

  for (let k = 0; k < n; k++) {
    const last = Math.min(n - 1, k + kl)
    const right = Math.min(n - 1, k + kl + ku)

    let p = k
    let best = ar[slot(k, k)]! ** 2 + ai[slot(k, k)]! ** 2

    for (let i = k + 1; i <= last; i++) {
      const g = ar[slot(i, k)]! ** 2 + ai[slot(i, k)]! ** 2

      if (g > best) {
        best = g
        p = i
      }
    }

    pivot[k] = p

    if (p !== k) {
      for (let j = k; j <= right; j++) {
        const a = slot(k, j)
        const b = slot(p, j)
        const tr = ar[a]!
        const ti = ai[a]!

        ar[a] = ar[b]!
        ai[a] = ai[b]!
        ar[b] = tr
        ai[b] = ti
      }
    }

    const pr = ar[slot(k, k)]!
    const pi = ai[slot(k, k)]!
    const pp = pr * pr + pi * pi

    for (let i = k + 1; i <= last; i++) {
      const s = slot(i, k)
      const fr = (ar[s]! * pr + ai[s]! * pi) / pp
      const fi = (ai[s]! * pr - ar[s]! * pi) / pp

      // the multiplier is kept in the eliminated slot
      ar[s] = fr
      ai[s] = fi

      if (fr === 0 && fi === 0) {
        continue
      }

      for (let j = k + 1; j <= right; j++) {
        const a = slot(k, j)
        const b = slot(i, j)

        ar[b] = ar[b]! - (fr * ar[a]! - fi * ai[a]!)
        ai[b] = ai[b]! - (fr * ai[a]! + fi * ar[a]!)
      }
    }
  }

  return { n, kl, ku, W, ar, ai, pivot }
}

// x = (U - s)^(-1) b with a factor from bandFactor; b is overwritten by x
export function factorSolve(
  lu: BandLU,
  bre: Float64Array,
  bim: Float64Array,
): void {
  const { n, kl, ku, W, ar, ai, pivot } = lu
  const slot = (i: number, j: number): number => i * W + (j - i + kl)

  for (let k = 0; k < n; k++) {
    const p = pivot[k]!

    if (p !== k) {
      const tr = bre[k]!
      const ti = bim[k]!

      bre[k] = bre[p]!
      bim[k] = bim[p]!
      bre[p] = tr
      bim[p] = ti
    }

    const last = Math.min(n - 1, k + kl)

    for (let i = k + 1; i <= last; i++) {
      const s = slot(i, k)
      const fr = ar[s]!
      const fi = ai[s]!

      if (fr === 0 && fi === 0) {
        continue
      }

      bre[i] = bre[i]! - (fr * bre[k]! - fi * bim[k]!)
      bim[i] = bim[i]! - (fr * bim[k]! + fi * bre[k]!)
    }
  }

  for (let k = n - 1; k >= 0; k--) {
    let sr2 = bre[k]!
    let si2 = bim[k]!

    const right = Math.min(n - 1, k + kl + ku)

    for (let j = k + 1; j <= right; j++) {
      const a = slot(k, j)

      sr2 -= ar[a]! * bre[j]! - ai[a]! * bim[j]!
      si2 -= ar[a]! * bim[j]! + ai[a]! * bre[j]!
    }

    const pr = ar[slot(k, k)]!
    const pi = ai[slot(k, k)]!
    const pp = pr * pr + pi * pi

    bre[k] = (sr2 * pr + si2 * pi) / pp
    bim[k] = (si2 * pr - sr2 * pi) / pp
  }
}

export type Ritz = {
  energy: number
  residual: number
  exchange: number
  vector: Vec
}

// the Ritz levels of one exchange sector nearest `energy` (see the header), energies unwrapped to the representative
// nearest `energy`, sorted by distance from it
export const shiftOf = (energy: number): [number, number] => [
  Math.cos(-energy) * (1 + 1e-9),
  Math.sin(-energy) * (1 + 1e-9),
]

export function nearSpectrum(
  m: Meson,
  x: Exchange,
  K: number,
  energy: number,
  starts: readonly Vec[],
  sector: 1 | -1,
  rounds = 8,
  op: PairBand = pairBand(m, K, 0),
  lu: BandLU = bandFactor(op, ...shiftOf(energy)),
): Ritz[] {
  const project = (v: Vec): Vec => {
    const w = {
      re: Float64Array.from(v.re),
      im: Float64Array.from(v.im),
    }

    projectSector(x, K, w, sector)

    return w
  }

  let Q = orthonormal(starts.map(project))

  for (let r = 0; r < rounds; r++) {
    Q = orthonormal(
      Q.map(q => {
        const w = {
          re: Float64Array.from(q.re),
          im: Float64Array.from(q.im),
        }

        factorSolve(lu, w.re, w.im)
        projectSector(x, K, w, sector)

        return w
      }),
    )
  }

  const k = Q.length
  const n = Q[0]!.re.length
  const images = Q.map(q => bandApply(op, q))
  const wre = new Float64Array(k * k)
  const wim = new Float64Array(k * k)

  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      const [re, im] = inner(Q[a]!, images[b]!)

      wre[a * k + b] = re
      wim[a * k + b] = im
    }
  }

  const eig = unitaryEigen(k, wre, wim)

  return eig.vectors
    .map(c => {
      const v = { re: new Float64Array(n), im: new Float64Array(n) }

      for (let a = 0; a < k; a++) {
        for (let i = 0; i < n; i++) {
          v.re[i] =
            v.re[i]! + c.re[a]! * Q[a]!.re[i]! - c.im[a]! * Q[a]!.im[i]!

          v.im[i] =
            v.im[i]! + c.re[a]! * Q[a]!.im[i]! + c.im[a]! * Q[a]!.re[i]!
        }
      }

      const uv = bandApply(op, v)
      const [lr, li] = inner(v, uv)

      let r2 = 0

      for (let i = 0; i < n; i++) {
        r2 +=
          (uv.re[i]! - (lr * v.re[i]! - li * v.im[i]!)) ** 2 +
          (uv.im[i]! - (lr * v.im[i]! + li * v.re[i]!)) ** 2
      }

      const e = -Math.atan2(li, lr)

      return {
        energy:
          e + 2 * Math.PI * Math.round((energy - e) / (2 * Math.PI)),
        residual: Math.sqrt(r2),
        exchange: exchangeValue(x, K, v),
        vector: v,
      }
    })
    .sort(
      (a, b) =>
        Math.abs(a.energy - energy) - Math.abs(b.energy - energy),
    )
}

export type Moments = { mean: number; tail: number; contact: number }

// mean |d|, weight at |d| >= N, weight at d = 0 of an even-block vector
export function blockMoments(m: Meson, v: Vec): Moments {
  const idx = parityIndices(m, 0)
  const N = lightN(m.D)

  let t = 0
  let mean = 0
  let tail = 0
  let contact = 0

  idx.forEach((i, a) => {
    const d = Math.abs(m.b.configs[Math.floor(i / m.b.labelCount)]![1]!)
    const p = v.re[a]! ** 2 + v.im[a]! ** 2

    t += p
    mean += p * d

    if (d >= N) {
      tail += p
    }

    if (d === 0) {
      contact += p
    }
  })

  return { mean: mean / t, tail: tail / t, contact: contact / t }
}

// |d| at which one token in each branch at rest has energy E under the string (see the header)
export function kleinDistance(m: Meson, energy: number): number {
  return (
    (energy + (2 * Math.PI) / (3 * m.fine)) / (Math.PI / lightN(m.D))
  )
}

export type DiabaticStep = {
  K: number
  // the Rayleigh energy of the diabatic vector, unwrapped by continuity
  energy: number
  // |<previous point|this point>|
  overlap: number
  // the largest-overlap Ritz level alone: its overlap with the previous point (the eigenvector rule)
  eigenOverlap: number
  // how many Ritz levels the window joined, and the weight of the largest-overlap one in the diabatic vector
  joined: number
  weight: number
  tail: number
  mean: number
  exchange: number
  residual: number
  // the joined level coupled most strongly: V = |<v|phi>| |E_v - E| (first order), its signed distance and |d|
  coupling: number
  partner: number
  partnerMean: number
  // the largest residual among the joined Ritz levels, and the rounds run
  ritzResidual: number
  rounds: number
  vector: Vec
}

// THE DIABATIC READING (fixed before E-SPN-0115's first run). From the level at K = 0, in exchange sector `sector`, at
// each K of the grid: the sector's near spectrum around the previous energy, started from the previous point and the
// Weyl vectors. The point is the unit vector of largest overlap with the previous point inside the span of the Ritz
// levels within `window` of the largest-overlap level (the normalized projection of the previous point on that span).
// Away from a crossing the span is that level plus levels the previous point barely touches, so the point is the
// eigenvector to O(overlap^2); at a narrow crossing the span holds both partners and the point is the one that keeps
// the previous point's character. The window is half the Klein ladder's spacing sigma (see the header), so it joins
// at most one Klein partner.
// CONVERGENCE. The near spectrum is iterated in chunks of `rounds` (each chunk restarted from the last Ritz vectors, the
// same subspace iteration continued) until the largest-overlap level's residual is at most PICK_RESIDUAL and every
// joined level's at most JOIN_RESIDUAL, or `chunks` chunks have run; the largest residual left is reported.
export const PICK_RESIDUAL = 1e-10
export const JOIN_RESIDUAL = 1e-8
// a level joins the span only if it carries at least this share of the previous point's weight: the rest are left
// out, which loses at most (count - 1) JOIN_WEIGHT of the previous point per step, far under the 1e-2 a hold allows
export const JOIN_WEIGHT = 1e-6

export function followDiabatic(
  m: Meson,
  x: Exchange,
  start: Vec,
  energy0: number,
  ks: readonly number[],
  sector: 1 | -1,
  window: number,
  stop: (s: DiabaticStep) => boolean = () => false,
  count = 10,
  rounds = 4,
  chunks = 12,
): DiabaticStep[] {
  const dim = start.re.length

  let rest = WEYL.slice(0, count - 1).map(a => weylVector(dim, a))
  let prev: Vec = {
    re: Float64Array.from(start.re),
    im: Float64Array.from(start.im),
  }
  let energy = energy0

  const out: DiabaticStep[] = []

  for (const K of ks) {
    const op = pairBand(m, K, 0)
    // the shift at the band's energy extrapolated linearly from its last two points, so the followed level is the one
    // nearest the shift (the previous energy lags by v dK, which on a light meson is several level spacings)
    const n = out.length
    const guess =
      n >= 2
        ? energy +
          ((out[n - 1]!.energy - out[n - 2]!.energy) *
            (K - out[n - 1]!.K)) /
            (out[n - 1]!.K - out[n - 2]!.K)
        : energy
    const lu = bandFactor(op, ...shiftOf(guess))

    // the previous point, then the previous K's other Ritz vectors (the Weyl vectors at the first K): the subspace
    // iteration continued in K
    let starts: Vec[] = [prev, ...rest]
    let rz: Ritz[] = []
    let best = 0
    let eigenOverlap = -1
    let joined: Ritz[] = []
    let chunk = 0

    for (; chunk < chunks; chunk++) {
      rz = nearSpectrum(m, x, K, guess, starts, sector, rounds, op, lu)
      eigenOverlap = -1
      rz.forEach((r, i) => {
        const o = overlapOf(prev, r.vector)

        if (o > eigenOverlap) {
          eigenOverlap = o
          best = i
        }
      })

      joined = rz.filter(
        r =>
          r === rz[best] ||
          (Math.abs(r.energy - rz[best]!.energy) <= window &&
            overlapOf(prev, r.vector) ** 2 >= JOIN_WEIGHT),
      )

      if (
        rz[best]!.residual <= PICK_RESIDUAL &&
        joined.every(r => r.residual <= JOIN_RESIDUAL)
      ) {
        break
      }

      starts = rz.map(r => r.vector)
    }

    const pick = rz[best]!
    const phi = { re: new Float64Array(dim), im: new Float64Array(dim) }

    rest = rz.filter(r => r !== pick).map(r => r.vector)

    for (const r of joined) {
      const [cr, ci] = inner(r.vector, prev)

      for (let i = 0; i < dim; i++) {
        phi.re[i] =
          phi.re[i]! + cr * r.vector.re[i]! - ci * r.vector.im[i]!

        phi.im[i] =
          phi.im[i]! + cr * r.vector.im[i]! + ci * r.vector.re[i]!
      }
    }

    const s = 1 / Math.sqrt(inner(phi, phi)[0])

    for (let i = 0; i < dim; i++) {
      phi.re[i] = phi.re[i]! * s
      phi.im[i] = phi.im[i]! * s
    }

    const uphi = bandApply(op, phi)
    const [lr, li] = inner(phi, uphi)
    const e = -Math.atan2(li, lr)

    let r2 = 0

    for (let i = 0; i < dim; i++) {
      r2 +=
        (uphi.re[i]! - (lr * phi.re[i]! - li * phi.im[i]!)) ** 2 +
        (uphi.im[i]! - (lr * phi.im[i]! + li * phi.re[i]!)) ** 2
    }

    let coupling = 0
    let partner = Number.NaN
    let partnerMean = Number.NaN

    for (const r of rz) {
      if (r === pick) {
        continue
      }

      const v =
        overlapOf(r.vector, phi) * Math.abs(r.energy - pick.energy)

      if (v > coupling || Number.isNaN(partner)) {
        coupling = v
        partner = r.energy - pick.energy
        partnerMean = blockMoments(m, r.vector).mean
      }
    }

    const mo = blockMoments(m, phi)
    const overlap = overlapOf(prev, phi)

    out.push({
      K,
      energy:
        e + 2 * Math.PI * Math.round((energy - e) / (2 * Math.PI)),
      overlap,
      eigenOverlap,
      joined: joined.length,
      weight: overlapOf(pick.vector, phi) ** 2,
      tail: mo.tail,
      mean: mo.mean,
      exchange: exchangeValue(x, K, phi),
      residual: Math.sqrt(r2),
      coupling,
      partner,
      partnerMean,
      ritzResidual: Math.max(...joined.map(r => r.residual)),
      rounds: Math.min(chunk + 1, chunks) * rounds,
      vector: phi,
    })
    prev = phi
    energy = out[out.length - 1]!.energy

    if (stop(out[out.length - 1]!)) {
      break
    }
  }

  return out
}

export type Closest = {
  K: number
  gap: number
  lower: Ritz
  upper: Ritz
}

// the least splitting of the two sector levels that carry the most of `reference` (the diabatic point near the
// crossing: the band and its partner) over [a, b], by golden section (a two-level avoided crossing's splitting
// sqrt((dv (K - K*))^2 + gap^2) is unimodal); `seed` starts each near spectrum
export function closestApproach(
  m: Meson,
  x: Exchange,
  a: number,
  b: number,
  energy: number,
  reference: Vec,
  seed: readonly Vec[],
  sector: 1 | -1,
  iterations = 36,
  rounds = 10,
): Closest {
  const r = (Math.sqrt(5) - 1) / 2

  let e = energy

  const at = (K: number): Closest => {
    const rz = nearSpectrum(m, x, K, e, seed, sector, rounds)
      .map(v => ({ v, o: overlapOf(reference, v.vector) }))
      .sort((p, q) => q.o - p.o)
      .slice(0, 2)
      .map(p => p.v)
      .sort((p, q) => p.energy - q.energy)

    return {
      K,
      gap: rz[1]!.energy - rz[0]!.energy,
      lower: rz[0]!,
      upper: rz[1]!,
    }
  }

  let lo = a
  let hi = b
  let c = hi - r * (hi - lo)
  let d = lo + r * (hi - lo)
  let fc = at(c)
  let fd = at(d)

  for (let i = 0; i < iterations; i++) {
    if (fc.gap < fd.gap) {
      hi = d
      d = c
      fd = fc
      c = hi - r * (hi - lo)
      e = (fd.lower.energy + fd.upper.energy) / 2
      fc = at(c)
    } else {
      lo = c
      c = d
      fc = fd
      d = lo + r * (hi - lo)
      e = (fc.lower.energy + fc.upper.energy) / 2
      fd = at(d)
    }
  }

  return fc.gap < fd.gap ? fc : fd
}
