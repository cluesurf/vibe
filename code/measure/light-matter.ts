// THE LIGHT MEETING ONE MEMBER (E-FRC-0263, Compton and Thomson) AND A BOUND PAIR (E-FRC-0264, the photoelectric
// threshold). Measurement only, in doubles. The coupling is E-SPN-0169's: the husk light's link angle rides the stream as
// a Peierls phase e^(-i A . r) on every register component alike, which on a uniform field is EXACTLY the shift K -> K + A
// of the member's Bloch momentum (E-SPN-0169 G1, 2.2e-15). So a long-wave photon's field enters as a uniform A(t).
//
//   memberEps          the register member's band per BEAT, eps(q) = E(q, 0) / 2 with E code/measure/spinor-register's
//                      closed-form diracPhase on the husk slice K = (q, 0) (E-SPN-0167)
//   lightOmega         the husk light's transverse frequency per beat, 4 sin^2(w / 2) = kappa lambda(k), lambda the two
//                      transverse eigenvalues of the Hermitian husk curl-curl (code/measure/darwin-exchange huskModes)
//   comptonShift       the scattered photon's wave number k' at angle theta off a member at rest, from the rule's own
//                      dispersions and exact conservation of husk momentum and quasi-energy (a theorem of translation
//                      invariance, E-RLT-0109), by bisection
//   memberBeat         one beat of the register member's cycle at momentum K + A: the stream's Bloch phases times the
//                      beat's piece, on the 192 modes; with `current` the step's displacement sum |(P psi)_i|^2 r_i
//   driveResponse      a member at rest driven by a uniform A(t) = A0 w(t) sin(w t) (w(t) a cosine ramp): the cycle-averaged
//                      current's lock-in amplitude at w over A0, the Thomson amplitude's frequency dependence
//   photoDrive         E-SPN-0155's single-channel Floquet model of the heavy love-fear pair (code/measure/husk-meson
//                      floquetSpace), its relative momentum shifted by A(t) (opposite charges: q -> q + A), with an
//                      absorbing shell; the norm lost per beat is the ionization rate
//
// DETERMINISM: no random numbers. FLOATS: measurement.

import { huskModes } from '@/code/measure/darwin-exchange'
import { type CMatrix } from '@/code/measure/dock-mixer'
import {
  floquetApply,
  singletEpsClosed,
  type FloquetSpace,
} from '@/code/measure/husk-meson'
import {
  diracPhase,
  REGISTER_ROOTS,
} from '@/code/measure/spinor-register'

// ---- Compton kinematics ----

/** The register member's quasi-energy per beat at husk momentum q (3 components), from the rest midpoint. */
export const memberEps = (q: readonly number[], M: number): number =>
  diracPhase([q[0] ?? 0, q[1] ?? 0, q[2] ?? 0, 0], M) / 2

/** The husk light's two transverse frequencies per beat at wave vector k, for coupling kappa (lowest first). */
export function lightOmega(
  k: readonly number[],
  kappa: number,
): number[] {
  const modes = huskModes(k)
  const top = Math.max(...modes.values.map(Math.abs))
  const transverse = modes.values
    .filter(v => Math.abs(v) > 1e-9 * top)
    .slice(0, 2)

  return transverse.map(l => 2 * Math.asin(Math.sqrt(kappa * l) / 2))
}

/**
 * The scattered photon's wave number off a member at rest: incoming k along `n`, outgoing along `n2`, polarization index
 * `pol` (0 the lower transverse branch). Solves eps_m(k n - k' n2) + w(k' n2) = eps_m(0) + w(k n) for k' in (0, k] by
 * bisection to 1e-15.
 */
export function comptonK(input: {
  k: number
  n: readonly number[]
  n2: readonly number[]
  M: number
  kappa: number
  pol: number
}): number {
  const { k, n, n2, M, kappa, pol } = input
  const w = (kv: readonly number[]): number =>
    lightOmega(kv, kappa)[pol]!
  const target = memberEps([0, 0, 0], M) + w(n.map(x => x * k))
  const f = (kp: number): number =>
    memberEps(
      [0, 1, 2].map(i => k * n[i]! - kp * n2[i]!),
      M,
    ) +
    w(n2.map(x => x * kp)) -
    target

  let lo = 1e-9
  let hi = k

  // f(k) >= 0 (keeping the whole photon energy leaves the recoil unpaid), f(0+) < 0 (a photon near zero pays any recoil)
  for (let j = 0; j < 80; j++) {
    const mid = (lo + hi) / 2

    if (f(mid) > 0) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return (lo + hi) / 2
}

// ---- the register member driven by a uniform field ----

/** One beat: psi <- D(K + A) P psi, D the stream's Bloch phases e^(-i r . (K + A)); returns the step's displacement. */
export function memberBeat(
  P: CMatrix,
  K: readonly number[],
  A: readonly number[],
  re: Float64Array,
  im: Float64Array,
  tr: Float64Array,
  ti: Float64Array,
): number[] {
  const n = REGISTER_ROOTS.length
  const disp = [0, 0, 0, 0]

  for (let r = 0; r < n; r++) {
    let sr = 0
    let si = 0

    for (let q = 0; q < n; q++) {
      const a = P.re[r * n + q]!
      const b = P.im[r * n + q]!
      const x = re[q]!
      const y = im[q]!

      sr += a * x - b * y
      si += a * y + b * x
    }

    const root = REGISTER_ROOTS[r]!
    const w = sr * sr + si * si

    for (let k = 0; k < 4; k++) {
      disp[k]! += w * root[k]!
    }

    const ph = -root.reduce(
      (s, x, i) => s + x * ((K[i] ?? 0) + (A[i] ?? 0)),
      0,
    )
    const c = Math.cos(ph)
    const s = Math.sin(ph)

    tr[r] = c * sr - s * si
    ti[r] = c * si + s * sr
  }

  re.set(tr)
  im.set(ti)

  return disp
}

/**
 * A member at rest (psi0) driven by A(t) = A0 w(t) sin(omega t) along `axis` for `beats` beats (a cosine ramp over
 * `ramp` beats, then flat): the lock-in amplitude of the current along the axis at omega over the flat window, over
 * A0. The current is the cycle average of the steps' displacements (a cycle = P.length beats). Returns chi (in phase,
 * with A; the current's response per unit A) and the out-of-phase part, and the norm drift.
 */
export function driveResponse(input: {
  P: readonly CMatrix[]
  psi0: { re: Float64Array; im: Float64Array }
  axis: readonly number[]
  A0: number
  omega: number
  beats: number
  ramp: number
}): { chi: number; quadrature: number; norm: number } {
  const { P, psi0, axis, A0, omega, beats, ramp } = input
  const n = REGISTER_ROOTS.length
  const re = Float64Array.from(psi0.re)
  const im = Float64Array.from(psi0.im)
  const tr = new Float64Array(n)
  const ti = new Float64Array(n)
  const cyc = P.length

  let inPhase = 0
  let quad = 0
  let count = 0
  let acc = 0
  let accT = 0

  for (let t = 0; t < beats; t++) {
    const env =
      t < ramp ? 0.5 - 0.5 * Math.cos((Math.PI * t) / ramp) : 1
    const a = A0 * env * Math.sin(omega * (t + 0.5))
    const A = axis.map(x => x * a)
    const d = memberBeat(P[t % cyc]!, [0, 0, 0, 0], A, re, im, tr, ti)

    acc += axis.reduce((s, x, k) => s + x * d[k]!, 0)
    accT += t + 0.5

    if (t % cyc === cyc - 1) {
      // the cycle's mean step, at the cycle's mean time
      const j = acc / cyc
      const tm = accT / cyc

      if (t >= ramp) {
        inPhase += j * Math.sin(omega * tm)
        quad += j * Math.cos(omega * tm)
        count++
      }

      acc = 0
      accT = 0
    }
  }

  let norm = 0

  for (let i = 0; i < n; i++) {
    norm += re[i]! ** 2 + im[i]! ** 2
  }

  return {
    chi: (2 * inPhase) / count / A0,
    quadrature: (2 * quad) / count / A0,
    norm,
  }
}

// ---- the photoelectric drive on E-SPN-0155's single-channel Floquet model ----

export type PhotoSpace = {
  s: FloquetSpace
  Tx: Float64Array
  Txx: Float64Array
  mask: Float64Array
  radius: Float64Array
}

/**
 * The drive's extra pieces: dT/dq_x and d^2T/dq_x^2 of the pair's relative band T(q) = eps(q) + eps(-q) (central
 * differences of the closed form, step h, Richardson), and the absorbing mask e^(-gamma (r - rAbs)^2) beyond rAbs.
 */
export function photoSpace(
  s: FloquetSpace,
  m: number,
  rAbs: number,
  gamma: number,
): PhotoSpace {
  const N = s.N
  const size = N * N * N
  const w = (2 * Math.PI) / N
  const img = (x: number): number => (x >= N / 2 ? x - N : x)
  const T = (q: number[]): number =>
    singletEpsClosed(m, q) +
    singletEpsClosed(
      m,
      q.map(x => -x),
    )
  const Tx = new Float64Array(size)
  const Txx = new Float64Array(size)
  const mask = new Float64Array(size)
  const radius = new Float64Array(size)
  const h = 1e-3

  for (let c = 0; c < N; c++) {
    for (let b = 0; b < N; b++) {
      for (let a = 0; a < N; a++) {
        const i = a + N * b + N * N * c
        const q = [w * a, w * b, w * c]
        const at = (dx: number): number => T([q[0]! + dx, q[1]!, q[2]!])
        const t0 = at(0)
        const d1 = (at(h) - at(-h)) / (2 * h)
        const d1h = (at(h / 2) - at(-h / 2)) / h
        const d2 = (at(h) - 2 * t0 + at(-h)) / (h * h)
        const d2h = (at(h / 2) - 2 * t0 + at(-h / 2)) / ((h * h) / 4)

        Tx[i] = (4 * d1h - d1) / 3
        Txx[i] = (4 * d2h - d2) / 3

        const r = Math.hypot(img(a), img(b), img(c))

        radius[i] = r
        mask[i] = r > rAbs ? Math.exp(-gamma * (r - rAbs) ** 2) : 1
      }
    }
  }

  return { s, Tx, Txx, mask, radius }
}

/**
 * Drive the pair's level (vr, vi) with A(t) = A0 w(t) sin(omega t) along x (a cosine ramp over `ramp` beats), the band
 * T + A Tx + (A^2 / 2) Txx each beat, the mask after each beat. Returns the norm lost at each of `marks` beat counts.
 * `still`: a static field A0 w(t) instead (the control: a uniform static A is a gauge shift, it ionizes nothing).
 */
export function photoDrive(input: {
  p: PhotoSpace
  vr: Float64Array
  vi: Float64Array
  A0: number
  omega: number
  beats: number
  ramp: number
  marks: readonly number[]
  still?: boolean
}): number[] {
  const { p, A0, omega, beats, ramp, marks } = input
  const { s } = p
  const size = s.T.length
  const base = Float64Array.from(s.T)
  const xr = Float64Array.from(input.vr)
  const xi = Float64Array.from(input.vi)
  const or = new Float64Array(size)
  const oi = new Float64Array(size)
  const lost: number[] = []

  let norm0 = 0

  for (let i = 0; i < size; i++) {
    norm0 += xr[i]! ** 2 + xi[i]! ** 2
  }

  for (let t = 0; t < beats; t++) {
    const env =
      t < ramp ? 0.5 - 0.5 * Math.cos((Math.PI * t) / ramp) : 1
    const A = input.still
      ? A0 * env
      : A0 * env * Math.sin(omega * (t + 0.5))

    for (let i = 0; i < size; i++) {
      s.T[i] = base[i]! + A * p.Tx[i]! + 0.5 * A * A * p.Txx[i]!
    }

    floquetApply(s, xr, xi, or, oi)

    for (let i = 0; i < size; i++) {
      const mk = p.mask[i]!

      xr[i] = or[i]! * mk
      xi[i] = oi[i]! * mk
    }

    if (marks.includes(t + 1)) {
      let nn = 0

      for (let i = 0; i < size; i++) {
        nn += xr[i]! ** 2 + xi[i]! ** 2
      }

      lost.push(1 - nn / norm0)
    }
  }

  s.T.set(base)

  return lost
}

/** The weight of a state beyond radius R (the ball's outgoing part). */
export function beyondRadius(
  p: PhotoSpace,
  vr: Float64Array,
  vi: Float64Array,
  R: number,
): number {
  let w = 0
  let tot = 0

  for (let i = 0; i < vr.length; i++) {
    const x = vr[i]! ** 2 + vi[i]! ** 2

    tot += x

    if (p.radius[i]! > R) {
      w += x
    }
  }

  return w / tot
}
