// JEANS ON THE COARSE LAYER (E-CSM-0062, OPEN-CSM-07, route I8a in ledger I "structure formation"). The route: the two
// conserved densities (love and fear, the only local conserved densities, E-FND-0170) plus the depth field give a coarse
// fluid; its Jeans length is the sound speed against the depth field's strength, and a density wave longer than it
// grows. Kill: no growing mode at any wavelength. This file builds that coarse fluid from measured pieces, writes its
// one-beat linear map at every wavenumber, runs a long density wave through it on a ring, and reads whether and how fast
// it grows.
//
// WHAT IS RUN. A coarse kinetic gas on the husk: the 24 husk shadows of the D4 roots (axes twice at speed 1, face
// diagonals once at sqrt 2, second moment 12 I, so c_s^2 = 1/2 exactly, E-MTH-0013). A density wave along a husk axis,
// uniform across it, is carried exactly by the shadows' axis components: 6 slots at +1, 12 at 0, 6 at -1, weights 1/4,
// 1/2, 1/4 (a D1Q3 gas with c_s^2 = 1/2). Two species, love and fear, each with its count kept by the collision. The
// collision is a single relaxation (BGK) at the rate that gives the knit's measured viscosity, nu = c_s^2 (1/w - 1/2) =
// 0.469 (E-FLD-0030), in two closures:
//   KNIT       the collision keeps the total momentum too (the knit's coarse layer, which carries sound);
//   REGISTER   the collision relaxes momentum to rest (the register rule keeps no local momentum density, E-FND-0170),
//              so the gas diffuses, D = c_s^2 (1/w - 1/2), with mobility 1/w - 1/2 (inertia 1 per unit of content).
// THE DEPTH FIELD, as E-GRV-0090 and 0091 have it: content (love + fear) sources the depth, and a unit of content at r
// feels the acceleration -(pi / D) grad G(r) per unit of source content, G the husk lattice Green's function (symbol
// lambda(k) = sum over the 24 shadows of 1 - cos(k . r_d), which is 12 (1 - cos k) along an axis), D = 16 the headroom
// (E-GRV-0091's closed form; inertia per unit of content is its stand-in, 1). On the ring the potential is Phi(k) =
// -(pi / D) n(k) / lambda(k) for k != 0; the uniform part is removed (the torus solve counts from the mean, as E-GRV-0148
// counts from the sea), and the gradient is the centered difference (symbol i sin k). The force on each species is its
// own density times -grad Phi (both fall alike, E-GRV-0091). The field is the content-solved depth, which acts at once;
// the radion carries it at about c (E-GRV-0091), which this coarse run leaves out.
// THE BEAT: compute n, j and Phi; collide with the force (Guo's scheme: the equilibrium velocity shifted by half the
// force, the forcing term (1 - w/2) w_v v F / c_s^2); stream one dock along v.
//
// DERIVED BEFORE THE GATE RUN (continuum, G = 1 / (24 D), 4 pi G = pi / (6 D)).
// 1. JEANS. Linearized about a uniform content n0: d^2 n / dt^2 = -c_s^2 k^2 n + Omega_J^2 n, Omega_J^2 = 4 pi G n0 =
//    pi n0 / (6 D). The marginal wavenumber is k_J = Omega_J / c_s = sqrt(pi n0 / (3 D)), lambda_J = sqrt(12 pi D / n0)
//    docks. The marginal point is a static balance, so it is the same in both closures. With the 1/r depth (lambda ~ 6
//    k^2) a growing mode exists at every k < k_J for any n0 > 0: the kill can fire only if the depth is screened.
// 2. THE GATE POINT: D = 16, n0 = 0.5 a dock (love 0.25, fear 0.25): Omega_J^2 = 0.016362, Omega_J = 0.12791 a beat,
//    k_J = 0.18090, lambda_J = 34.73 docks. On a ring of 256 docks the modes m = 1 .. 7 grow (k_7 = 0.1718) and m >= 8 do
//    not (k_8 = 0.1963). The lattice symbols (sin k, 12 (1 - cos k), the D1Q3 streaming) move k_J by order k^2 / 12, under
//    0.5%.
// 3. GROWTH. KNIT: gamma^2 + nu k^2 gamma = Omega_J^2 - c_s^2 k^2, so at m = 1 (k = 0.024544) gamma = 0.12659 a beat
//    (e-folding 7.9 beats). REGISTER (overdamped): gamma = (1/w - 1/2)(Omega_J^2 - c_s^2 k^2) = 0.938 x 0.016061 =
//    0.01507 a beat, slower by the relaxation, with the same marginal k.
// 4. THE CHARGE MODE. A love - fear wave carries no content, sources no depth and does not grow; the growing eigenvector
//    is pure content.
// 5. A SCREENED DEPTH (the control). E-GRV-0094's open husk screens the pull to a Yukawa of length 1.03 docks: lambda ->
//    lambda + 6 mu^2, mu = 1 / 1.03. Then Omega_J^2 k^2 / (k^2 + mu^2) against c_s^2 k^2 gives growth only for k^2 + mu^2
//    < k_J^2, so only above a content n_c = 3 D mu^2 / pi = 14.4 a dock (continuum): at n0 = 0.5 no wavelength grows.
//
// PROBES BEFORE THE GATES, disclosed. tmp/jn-probe1.ts (.log), written after the gates below and moving none of them:
//  every code path on a small plan (ring 64, 30 beats, the fit over beats 15 to 30, the stable wave at m 6), to find
//  coding errors. It found one (the map's start was scaled by 2 against the ring's; fixed) and then read: the largest
//  growing k 0.18041 in both closures against k_J 0.18090; at m 1 of 64 (k 0.0982) knit 0.10519 against the derived
//  0.10520, register 0.01066 against 0.01083; the ring against the map 1.4e-6 and 4.5e-7; the knit's late slope 0.985 of
//  the map's rate over beats 15 to 30, where the decaying branch has not died (the gate plan fits over 40 to 80); counts
//  kept to 2e-16; charge share 2e-32; the screened and the field-off maps grow nowhere; the m 6 wave at 0.084 of its
//  start; reads lambda_J 11.50 and 6.64 docks at n0 4.8 and 16 (continuum 11.21, 6.14), the screened lattice threshold
//  14.4018 (continuum 14.4018).
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  H1 (the route): in both closures the one-beat map has a growing mode (|lambda| > 1) at some k; the largest growing k
//     (bisected on the map) is within 2% of the continuum k_J = 0.18090; the knit closure's growth rate at m = 1 is
//     within 2% of 0.12659 and the register closure's within 10% of 0.01507 (the overdamped form is approximate).
//  P1 (the falsifier, the route's kill): no k in (0, pi] has a growing mode, in either closure. PREDICTED: does not fire.
//  I1 (instrument): the ring run (256 docks, a content wave of relative amplitude 1e-9 at m = 1, 80 beats) equals the
//     map's prediction M(k)^80 applied to the start within 1e-4 (relative); the late growth rate fitted over beats 40 to
//     80 equals ln max |lambda(k)| within 1e-3 (relative); the love and fear counts are kept to 1e-12 (relative); the
//     growing eigenvector's charge share is under 1e-10.
//  C1 (control: the instrument reads the kill's outcome): the screened depth at n0 = 0.5 has no growing mode at any k
//     (max |lambda| <= 1 + 1e-12 on 4096 k in (0, pi]), in both closures; and with the depth off, none either.
//  C2 (control: the run reads a stable wave): the m = 12 wave (k = 0.2945 > k_J) run 80 beats in the knit closure stays
//     within its start amplitude (|amplitude| <= 1.0 of the start at beat 80, to the map's prediction within 1e-4).
//  READ, gating nothing: lambda_J and Omega_J at n0 = 4.8 (the flip knit's fill 0.2, 24 slots) and 16 (occupation 2/3);
//  the screened depth's lattice threshold n_c (bisected on the map) and its growing window at n0 = 16; the growth rates
//  at m = 1 .. 7.
// VERDICT: pass if H1 holds, P1 does not fire, and I1, C1, C2 hold; partial if H1's growth exists but a rate or k_J
//  gate misses, or an instrument or control fails; fail if P1 fires.
//
// WHAT THIS CAN AND CANNOT SHOW. It shows whether the coarse fluid made of the two densities and the depth field (as the
// ledger holds them: the depth register added, inertia a stand-in) has a Jeans instability, at which length, and how
// fast. It does not derive the coarse fluid from the rule (the closure is a single relaxation at the knit's viscosity),
// does not carry the radion's finite speed, and grows nothing nonlinear: no halo, no structure, only the linear
// instability that structure formation starts from. Its numbers are in docks and beats at D = 16.
//
// Depth L2 (a linear coarse model in floats, its map's eigenvalues and a ring run). DETERMINISM: no random numbers;
// placed waves. NOTHING MOVES on the rule: this is a coarse equation, not the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'

const CS2 = 0.5
const NU = 0.469
const W = 1 / (NU / CS2 + 0.5)
const WEIGHTS: readonly number[] = [0.25, 0.5, 0.25]
const VEL: readonly number[] = [-1, 0, 1]
const YUKAWA = 1.03
const KJ_TOLERANCE = 0.02
const KNIT_TOLERANCE = 0.02
const REGISTER_TOLERANCE = 0.1
const RUN_TOLERANCE = 1e-4
const RATE_TOLERANCE = 1e-3
const COUNT_TOLERANCE = 1e-12
const CHARGE_TOLERANCE = 1e-10
const STABLE = 1e-12
const SCAN = 4096

export type Closure = 'knit' | 'register'

export type JeansPlan = {
  depth: number
  n0: number
  ring: number
  amplitude: number
  beats: number
  fitFrom: number
  longMode: number
  stableMode: number
  readDensities: readonly number[]
}

export const GATE_PLAN: JeansPlan = {
  depth: 16,
  n0: 0.5,
  ring: 256,
  amplitude: 1e-9,
  beats: 80,
  fitFrom: 40,
  longMode: 1,
  stableMode: 12,
  readDensities: [4.8, 16],
}

type Field = { coupling: number; mu2: number }

const flag = (b: boolean): number => (b ? 1 : 0)

// the husk symbol of a plane wave along an axis, with an optional screening 6 mu^2
const symbol = (k: number, f: Field): number => 12 * (1 - Math.cos(k)) + 6 * f.mu2

// THE ONE-BEAT MAP at wavenumber k, on (love v=-1, 0, +1, fear v=-1, 0, +1), linearized about n0 / 2 each at rest
export function beatMap(
  k: number,
  n0: number,
  closure: Closure,
  f: Field,
): { re: Float64Array; im: Float64Array } {
  const n = 6
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const half = n0 / 2

  for (let col = 0; col < n; col++) {
    // a unit perturbation in one population
    const dr = new Float64Array(n)
    const di = new Float64Array(n)

    dr[col] = 1

    const ns = [0, 1].map(s => [0, 1, 2].reduce((a, v) => [a[0]! + dr[3 * s + v]!, a[1]! + di[3 * s + v]!], [0, 0]))
    const js = [0, 1].map(s =>
      [0, 1, 2].reduce((a, v) => [a[0]! + VEL[v]! * dr[3 * s + v]!, a[1]! + VEL[v]! * di[3 * s + v]!], [0, 0]),
    )
    const nr = ns[0]![0]! + ns[1]![0]!
    const ni = ns[0]![1]! + ns[1]![1]!
    // Phi = -(c / D) n / lambda; F_s = -n0_s (i sin k) Phi = n0_s (i sin k) c n / lambda
    const lam = symbol(k, f)
    const g = (f.coupling / lam) * Math.sin(k)
    // i g n
    const Fr = -g * ni * half
    const Fi = g * nr * half
    const Ftr = 2 * Fr
    const Fti = 2 * Fi
    const ur = closure === 'knit' ? (js[0]![0]! + js[1]![0]! + Ftr / 2) / n0 : 0
    const ui = closure === 'knit' ? (js[0]![1]! + js[1]![1]! + Fti / 2) / n0 : 0

    for (let s = 0; s < 2; s++) {
      for (let v = 0; v < 3; v++) {
        const i = 3 * s + v
        const er = WEIGHTS[v]! * (ns[s]![0]! + (half * VEL[v]! * ur) / CS2)
        const ei = WEIGHTS[v]! * (ns[s]![1]! + (half * VEL[v]! * ui) / CS2)
        const pr = dr[i]! - W * (dr[i]! - er) + ((1 - W / 2) * WEIGHTS[v]! * VEL[v]! * Fr) / CS2
        const pi = di[i]! - W * (di[i]! - ei) + ((1 - W / 2) * WEIGHTS[v]! * VEL[v]! * Fi) / CS2
        // stream: new f_v(x) = old f_v(x - v), the factor e^(-i k v)
        const c = Math.cos(k * VEL[v]!)
        const sn = -Math.sin(k * VEL[v]!)

        re[i * n + col] = pr * c - pi * sn
        im[i * n + col] = pr * sn + pi * c
      }
    }
  }

  return { re, im }
}

export function growthOf(k: number, n0: number, closure: Closure, f: Field): number {
  const m = beatMap(k, n0, closure, f)
  const e = complexEigenvalues({ re: m.re, im: m.im, n: 6 })

  return Math.max(...e.re.map((x, i) => Math.hypot(x, e.im[i]!)))
}

// the largest k in (0, pi] with a growing mode (0 if none): a scan, then bisection at the last sign change
function marginal(n0: number, closure: Closure, f: Field): { k: number; worst: number } {
  let last = 0
  let worst = 0

  for (let i = 1; i <= SCAN; i++) {
    const k = (Math.PI * i) / SCAN
    const g = growthOf(k, n0, closure, f)

    worst = Math.max(worst, g)

    if (g > 1 + STABLE) {
      last = i
    }
  }

  if (last === 0 || last === SCAN) {
    return { k: last === 0 ? 0 : Math.PI, worst }
  }

  let lo = (Math.PI * last) / SCAN
  let hi = (Math.PI * (last + 1)) / SCAN

  for (let it = 0; it < 60; it++) {
    const mid = (lo + hi) / 2

    if (growthOf(mid, n0, closure, f) > 1 + STABLE) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return { k: (lo + hi) / 2, worst }
}

// the share of the growing eigenvector in the charge (love - fear) combination, by inverse iteration on M - lambda
function chargeShare(k: number, n0: number, closure: Closure, f: Field): number {
  const m = beatMap(k, n0, closure, f)
  // power iteration: the growing mode dominates
  let xr = Float64Array.from([1, 2, 1, 1, 2, 1])
  let xi = new Float64Array(6)

  for (let it = 0; it < 4000; it++) {
    const yr = new Float64Array(6)
    const yi = new Float64Array(6)

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        yr[i]! += m.re[i * 6 + j]! * xr[j]! - m.im[i * 6 + j]! * xi[j]!
        yi[i]! += m.re[i * 6 + j]! * xi[j]! + m.im[i * 6 + j]! * xr[j]!
      }
    }

    const nrm = Math.sqrt(yr.reduce((a, x) => a + x * x, 0) + yi.reduce((a, x) => a + x * x, 0))

    xr = yr.map(x => x / nrm)
    xi = yi.map(x => x / nrm)
  }

  let charge = 0
  let total = 0

  for (let v = 0; v < 3; v++) {
    charge += (xr[v]! - xr[3 + v]!) ** 2 + (xi[v]! - xi[3 + v]!) ** 2
    total += (xr[v]! + xr[3 + v]!) ** 2 + (xi[v]! + xi[3 + v]!) ** 2
  }

  return charge / (charge + total)
}

// ---------------- the ring run (real space, nonlinear) ----------------

type Ring = { f: Float64Array[]; L: number }

function ringStart(L: number, n0: number, amplitude: number, mode: number): Ring {
  const f = Array.from({ length: 6 }, () => new Float64Array(L))

  for (let x = 0; x < L; x++) {
    const n = (n0 / 2) * (1 + amplitude * Math.cos((2 * Math.PI * mode * x) / L))

    for (let s = 0; s < 2; s++) {
      for (let v = 0; v < 3; v++) {
        f[3 * s + v]![x] = WEIGHTS[v]! * n
      }
    }
  }

  return { f, L }
}

function ringBeat(r: Ring, closure: Closure, fd: Field): void {
  const { L, f } = r
  const n = [0, 1].map(s => Float64Array.from({ length: L }, (_, x) => f[3 * s]![x]! + f[3 * s + 1]![x]! + f[3 * s + 2]![x]!))
  const j = [0, 1].map(s => Float64Array.from({ length: L }, (_, x) => f[3 * s + 2]![x]! - f[3 * s]![x]!))
  const content = Float64Array.from({ length: L }, (_, x) => n[0]![x]! + n[1]![x]!)
  // Phi by the discrete Fourier transform (L is small): Phi(q) = -(c / D) n(q) / lambda(q), q != 0
  const phi = new Float64Array(L)

  for (let q = 1; q < L; q++) {
    const k = (2 * Math.PI * q) / L

    let cr = 0
    let ci = 0

    for (let x = 0; x < L; x++) {
      cr += content[x]! * Math.cos(k * x)
      ci -= content[x]! * Math.sin(k * x)
    }

    const a = -fd.coupling / symbol(k, fd) / L

    for (let x = 0; x < L; x++) {
      phi[x]! += a * (cr * Math.cos(k * x) - ci * Math.sin(k * x))
    }
  }

  const grad = Float64Array.from({ length: L }, (_, x) => (phi[(x + 1) % L]! - phi[(x - 1 + L) % L]!) / 2)
  const post = Array.from({ length: 6 }, () => new Float64Array(L))

  for (let x = 0; x < L; x++) {
    const F = [0, 1].map(s => -n[s]![x]! * grad[x]!)
    const u = closure === 'knit' ? (j[0]![x]! + j[1]![x]! + (F[0]! + F[1]!) / 2) / content[x]! : 0

    for (let s = 0; s < 2; s++) {
      for (let v = 0; v < 3; v++) {
        const i = 3 * s + v
        const eq = WEIGHTS[v]! * n[s]![x]! * (1 + (VEL[v]! * u) / CS2)

        post[i]![x] = f[i]![x]! - W * (f[i]![x]! - eq) + ((1 - W / 2) * WEIGHTS[v]! * VEL[v]! * F[s]!) / CS2
      }
    }
  }

  for (let i = 0; i < 6; i++) {
    const v = VEL[i % 3]!

    for (let x = 0; x < L; x++) {
      f[i]![(x + v + L) % L] = post[i]![x]!
    }
  }
}

// the content's Fourier amplitude at a mode (complex)
function amplitudeAt(r: Ring, mode: number): [number, number] {
  let cr = 0
  let ci = 0
  const k = (2 * Math.PI * mode) / r.L

  for (let x = 0; x < r.L; x++) {
    let c = 0

    for (let i = 0; i < 6; i++) {
      c += r.f[i]![x]!
    }

    cr += c * Math.cos(k * x)
    ci -= c * Math.sin(k * x)
  }

  return [cr, ci]
}

const counts = (r: Ring): [number, number] =>
  [0, 1].map(s => [0, 1, 2].reduce((a, v) => a + r.f[3 * s + v]!.reduce((b, x) => b + x, 0), 0)) as [number, number]

// the map's prediction for the content amplitude after T beats from the content wave at rest
function predicted(k: number, n0: number, closure: Closure, f: Field, T: number, a0: number): [number, number] {
  const m = beatMap(k, n0, closure, f)

  // each species carries half the content amplitude a0, split over the velocities by the weights
  let xr = Float64Array.from([0, 1, 2, 3, 4, 5], i => (WEIGHTS[i % 3]! * a0) / 2)
  let xi = new Float64Array(6)

  for (let t = 0; t < T; t++) {
    const yr = new Float64Array(6)
    const yi = new Float64Array(6)

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        yr[i]! += m.re[i * 6 + j]! * xr[j]! - m.im[i * 6 + j]! * xi[j]!
        yi[i]! += m.re[i * 6 + j]! * xi[j]! + m.im[i * 6 + j]! * xr[j]!
      }
    }

    xr = yr
    xi = yi
  }

  return [xr.reduce((a, x) => a + x, 0), xi.reduce((a, x) => a + x, 0)]
}

function runWave(plan: JeansPlan, closure: Closure, f: Field, mode: number) {
  const r = ringStart(plan.ring, plan.n0, plan.amplitude, mode)
  const k = (2 * Math.PI * mode) / plan.ring
  const start = counts(r)
  const a0 = Math.hypot(...amplitudeAt(r, mode))
  const logs: number[] = []

  for (let t = 0; t < plan.beats; t++) {
    ringBeat(r, closure, f)
    logs.push(Math.log(Math.hypot(...amplitudeAt(r, mode))))
  }

  const end = counts(r)
  const final = amplitudeAt(r, mode)
  // the start's content amplitude in the transform is a0 = L n0 amplitude / 2, at rest
  const [pr, pi] = predicted(k, plan.n0, closure, f, plan.beats, a0)
  const runGap = Math.hypot(final[0] - pr, final[1] - pi) / Math.hypot(pr, pi)
  // late growth: least-squares slope of log amplitude over the fit window
  const xs: number[] = []
  const ys: number[] = []

  for (let t = plan.fitFrom; t < plan.beats; t++) {
    xs.push(t + 1)
    ys.push(logs[t]!)
  }

  const mx = xs.reduce((a, x) => a + x, 0) / xs.length
  const my = ys.reduce((a, x) => a + x, 0) / ys.length
  const slope =
    xs.reduce((a, x, i) => a + (x - mx) * (ys[i]! - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0)

  return {
    k,
    runGap,
    slope,
    mapRate: Math.log(growthOf(k, plan.n0, closure, f)),
    countDrift: Math.max(Math.abs(end[0] / start[0] - 1), Math.abs(end[1] / start[1] - 1)),
    growth: Math.hypot(...final) / a0,
  }
}

export default experiment({
  id: 'cosmology/coarse-jeans',
  code: 'E-CSM-0062',
  title: 'Jeans on the coarse layer (route I8a)',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return coarseJeansRun(GATE_PLAN)
  },
})

export function coarseJeansRun(plan: JeansPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coupling = Math.PI / plan.depth
  const open: Field = { coupling, mu2: 0 }
  const screened: Field = { coupling, mu2: 1 / YUKAWA ** 2 }
  const off: Field = { coupling: 0, mu2: 0 }
  const omegaJ2 = (Math.PI * plan.n0) / (6 * plan.depth)
  const kJ = Math.sqrt(omegaJ2 / CS2)
  const kLong = (2 * Math.PI * plan.longMode) / plan.ring
  const knitWant = (() => {
    const b = NU * kLong * kLong
    const c = omegaJ2 - CS2 * kLong * kLong

    return (-b + Math.sqrt(b * b + 4 * c)) / 2
  })()
  const registerWant = (1 / W - 0.5) * (omegaJ2 - CS2 * kLong * kLong)

  // ---------------- the map ----------------
  const closures: Closure[] = ['knit', 'register']
  const margins = closures.map(c => marginal(plan.n0, c, open))
  const rates = closures.map(c => Math.log(growthOf(kLong, plan.n0, c, open)))
  const modeRates = closures.map(c =>
    Array.from({ length: 7 }, (_, i) => Math.log(growthOf((2 * Math.PI * (i + 1)) / plan.ring, plan.n0, c, open))),
  )
  const charge = closures.map(c => chargeShare(kLong, plan.n0, c, open))

  log('map')

  // ---------------- controls on the map ----------------
  const screenedMargins = closures.map(c => marginal(plan.n0, c, screened))
  const offMargins = closures.map(c => marginal(plan.n0, c, off))

  log('controls')

  // ---------------- the ring runs ----------------
  const runs = closures.map(c => runWave(plan, c, open, plan.longMode))
  const stable = runWave(plan, 'knit', open, plan.stableMode)

  log('runs')

  // ---------------- reads ----------------
  const reads = plan.readDensities.map(n0 => {
    const m = marginal(n0, 'knit', open)
    const s = marginal(n0, 'knit', screened)

    return {
      n0,
      kJ: m.k,
      lambdaJ: (2 * Math.PI) / m.k,
      continuumLambdaJ: Math.sqrt((12 * Math.PI * plan.depth) / n0),
      omegaJ: Math.sqrt((Math.PI * n0) / (6 * plan.depth)),
      screenedK: s.k,
    }
  })
  // the screened threshold on the lattice: the least n0 with a growing mode (bisection between 0.5 and 64)
  let lo = plan.n0
  let hi = 64

  for (let it = 0; it < 40; it++) {
    const mid = (lo + hi) / 2

    if (marginal(mid, 'knit', screened).k > 0) {
      hi = mid
    } else {
      lo = mid
    }
  }

  const threshold = (lo + hi) / 2
  const thresholdContinuum = (3 * plan.depth) / (Math.PI * YUKAWA ** 2)

  log('reads')

  // ---------------- gates ----------------
  const grows = margins.map(m => m.k > 0)
  const kJok = margins.every(m => Math.abs(m.k / kJ - 1) <= KJ_TOLERANCE)
  const knitOk = Math.abs(rates[0]! / knitWant - 1) <= KNIT_TOLERANCE
  const registerOk = Math.abs(rates[1]! / registerWant - 1) <= REGISTER_TOLERANCE
  const H1 = grows.every(Boolean) && kJok && knitOk && registerOk
  const P1 = !grows.some(Boolean)
  const I1 =
    runs.every(r => r.runGap <= RUN_TOLERANCE) &&
    runs.every(r => Math.abs(r.slope / r.mapRate - 1) <= RATE_TOLERANCE) &&
    [...runs, stable].every(r => r.countDrift <= COUNT_TOLERANCE) &&
    charge.every(c => c <= CHARGE_TOLERANCE)
  const C1 =
    screenedMargins.every(m => m.worst <= 1 + STABLE) && offMargins.every(m => m.worst <= 1 + STABLE)
  const C2 = stable.growth <= 1 && stable.runGap <= RUN_TOLERANCE
  const status = P1 ? 'fail' : H1 && I1 && C1 && C2 ? 'pass' : 'partial'
  const f5 = (v: number): string => v.toFixed(5)
  const e3 = (v: number): string => v.toExponential(3)

  return verdict({
    status,
    claim: `H1 ${H1}: growing modes knit ${grows[0]}, register ${grows[1]}; the largest growing k ${f5(margins[0]!.k)} (knit) and ${f5(margins[1]!.k)} (register) against k_J ${f5(kJ)} (lambda_J ${f5((2 * Math.PI) / margins[0]!.k)} docks against ${f5((2 * Math.PI) / kJ)}); growth at m ${plan.longMode} (k ${f5(kLong)}): knit ${f5(rates[0]!)} a beat against ${f5(knitWant)}, register ${f5(rates[1]!)} against ${f5(registerWant)}; P1 ${P1}; I1 ${I1} (run against the map ${runs.map(r => e3(r.runGap)).join(', ')}, late slope over the map's rate ${runs.map(r => f5(r.slope / r.mapRate)).join(', ')}, counts ${[...runs, stable].map(r => e3(r.countDrift)).join(', ')}, charge share ${charge.map(e3).join(', ')}); C1 ${C1} (screened largest |lambda| ${screenedMargins.map(m => (m.worst - 1).toExponential(2)).join(', ')} over 1, depth off ${offMargins.map(m => (m.worst - 1).toExponential(2)).join(', ')}); C2 ${C2} (the m ${plan.stableMode} wave after ${plan.beats} beats at ${f5(stable.growth)} of its start, map gap ${e3(stable.runGap)})`,
    metrics: {
      H1: flag(H1),
      P1: flag(P1),
      I1: flag(I1),
      C1: flag(C1),
      C2: flag(C2),
      kJ,
      omegaJ: Math.sqrt(omegaJ2),
      kMarginKnit: margins[0]!.k,
      kMarginRegister: margins[1]!.k,
      rateKnit: rates[0]!,
      rateKnitWant: knitWant,
      rateRegister: rates[1]!,
      rateRegisterWant: registerWant,
      runGapKnit: runs[0]!.runGap,
      runGapRegister: runs[1]!.runGap,
      slopeKnit: runs[0]!.slope,
      slopeRegister: runs[1]!.slope,
      chargeKnit: charge[0]!,
      chargeRegister: charge[1]!,
      screenedWorstKnit: screenedMargins[0]!.worst,
      screenedWorstRegister: screenedMargins[1]!.worst,
      stableGrowth: stable.growth,
      threshold,
      thresholdContinuum,
      ...Object.fromEntries(
        reads.flatMap(r => [
          [`lambdaJ_n${r.n0}`, r.lambdaJ],
          [`lambdaJContinuum_n${r.n0}`, r.continuumLambdaJ],
          [`omegaJ_n${r.n0}`, r.omegaJ],
          [`screenedK_n${r.n0}`, r.screenedK],
        ]),
      ),
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(I1) },
    notes: `L2. D ${plan.depth}, n0 ${plan.n0}, ring ${plan.ring}, w ${f5(W)} (nu ${NU}). Growth a beat at m 1 .. 7: knit ${modeRates[0]!.map(f5).join(' ')}; register ${modeRates[1]!.map(f5).join(' ')}. Reads: ${reads.map(r => `n0 ${r.n0}: lambda_J ${f5(r.lambdaJ)} docks (continuum ${f5(r.continuumLambdaJ)}), Omega_J ${f5(r.omegaJ)} a beat, screened depth grows below k ${f5(r.screenedK)}`).join('; ')}; the screened depth's lattice threshold n_c ${f5(threshold)} a dock (continuum ${f5(thresholdContinuum)}). ${((Date.now() - started) / 1000).toFixed(1)} s.`,
  })
}
