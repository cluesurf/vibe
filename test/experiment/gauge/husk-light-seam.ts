// THE SEAM OF THE 3D QUANTUM LIGHT, CALIBRATED ON THE LADDER (E-FRC-0282, OPEN-LGT-12, the route "the one-quantum
// sector" in routes/quantum-relativity-light-computation.md, section "D · a quantum photon that travels"). The route
// asks to build one quantum over the Gauss-invariant vacuum on a side-8 husk and read how much leaves the one-quantum
// sector per beat against D = 4 .. 16, killed if the leak per beat does not fall with D. That cannot be run as
// written: the 3D light has about N^(8V) states, and the leak is a property of the full, non-Gaussian vacuum. The
// ladder (E-FRC-0231, 0235) shows where every departure lives: the beat's drift phase zeta_M^(-c bal(e)^2) and the
// force phase are exact quadratic (metaplectic) maps away from each register's seam at +-D, and in that harmonic
// reading the one-quantum band IS the classical symbol exactly. So the departure is the vacuum's weight at the seams.
// This file computes that weight from the harmonic two-point function, calibrates it against the ladder's exact band
// misses, and carries it to the 3D husk light as a frozen prediction of the one-quantum leak per beat against D.
//
// WHAT IS RUN.
//  (a) THE LADDER, exact. quantum-ladder oneQuantumBand on E-FRC-0231's boxes, the split with the drift carrying
//      kappa = 2/N (c = 2, r = N: s = 2/N, f = 1): L = 2 at N = 9, 13, 17, 21, 25 and L = 3 at N = 9, 11, 13; and the
//      classical split (c = N, r = 2: s = 1, f = 2/N) at L = 2, N = 9, 13. The band error is E-FRC-0231's: the
//      largest |omega_quantum - omega_classical| / omega_classical over the box's momenta.
//  (b) THE LADDER, harmonic. code/measure/husk-light-seam on husk-balance's ladderLight at the same boxes and splits.
//  (c) THE HUSK, harmonic. The same measure on husk-balance's huskLight (9 link directions a dock, weights 1 on an
//      axis and 2 on a diagonal; 20 husk triangle types, n_P = 1 on 8 and 2 on 12; E-FRC-0262), on the side-8 box's
//      momenta (2 pi j / 8 per axis, the route's box), at D = 4 .. 16, N = 2D + 1, at the two candidate splits
//      rho = f / s = 0.4613818 (the average, E-FRC-0262) and 0.4146386 (the worst register, E-FRC-0269).
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE HARMONIC VACUUM. Per eigenmode of A(k) = W^(1/2) C^dag N C W^(1/2) (lambda > 0) the leapfrog y' = y + s pi,
//    pi' = pi - f A y' (y = W^(1/2) x, pi = W^(1/2) e) has 2 - 2 cos omega = s f lambda and invariant Gaussian
//    <|y|^2> = (hbar / 2) s / sin omega, <|pi|^2> = (hbar / 2) f lambda / sin omega, hbar = N / (2 pi). A link's
//    variance is the box average of (hbar / 2)(f lambda / sin omega)|v_l|^2 / w_l, a plaquette's of (hbar / 2)
//    (s / sin omega)|(C W^(1/2) v)_P|^2. On the ladder (w = n = 1, A = K = 4 - 2 cos k) this is quantum-ladder's
//    harmonicTwoPoint register by register: rails Gamma_mm(0), rung 2 (Gamma_mm(0) - Gamma_mm(1)), plaquette
//    Gamma_BB(0). The gauge directions (lambda = 0, at k = 0 also the static photon, the winding sector the ladder
//    holds at 0) carry no register variance and are left out.
// 2. THE HUSK'S SCALE. husk-balance's A is exactly twice E-FRC-0179's husk symbol M_h = C^T N C G^(-1) (G^(-1) =
//    W / 2): its axis photon lambda_A / 2 solves lambda^2 - 12 lambda + 8u = 0 (E-FRC-0235) and its massive branch
//    sits at 2 x 12. With E-FRC-0207's kappa = 2/(2D + 1) on M_h, the husk light in husk-balance's variables runs at
//    s f = kappa / 2 = 1 / N, so s = (1 / (N rho))^(1/2), f = (rho / N)^(1/2). kappa lambda_max(M_h) = 32 / N < 4 for
//    D >= 4. One modulus N reaches every husk register (E-FRC-0269), each read balanced in -D .. D, with the
//    quadratic phase exp(-i pi q bal(x)^2 / N), q = s w_l on a link and f n_P on a triangle (on the ladder q = s and f).
// 3. THE SEAM STATISTIC. The beat is the harmonic one times 1 + Delta per register, Delta(x) = exp(-i pi q (bal(x)^2
//    - x^2) / N) - 1, zero for |x| <= D. A one-quantum state of a mode that puts variance c on a register of variance
//    sigma^2 has that register's marginal p_0(x)(1 + beta (x^2 / sigma^2 - 1)), beta = c / sigma^2 (from <1|exp(itX)|1>
//    = chi_0(t)(1 - t^2 c)). So, to first order in Delta, the one-quantum level moves against the vacuum by
//       Phi = |Im sum_registers beta a| / omega,   a = E_0[(x^2 / sigma^2 - 1) Delta(x)]   (relative band shift)
//    and the quantum carries an excess seam kick per beat
//       ell = sum_registers beta b,                b = E_0[(x^2 / sigma^2 - 1) |Delta(x)|^2]   (the leak reading)
//    E_0 the integer Gaussian p_0(x) ~ exp(-x^2 / (2 sigma^2)). The box statistic is the largest over the box's modes.
//    Also read: the plain Gaussian seam weight w = P(|x| > D + 1/2) per register, its sum per dock and its maximum.
//    The prediction (argued, first order): Phi IS the exact band error, with no constant.
// 4. WHY THE ROUTE'S KILL CANNOT FIRE IN THE GAUSSIAN READING (argued before the run, gated as H1). With hbar = N / (2 pi)
//    and s f = 1 / N, a link's variance is about hbar (f / s)^(1/2) lambda^(1/2) ~ N rho^(1/2) and a triangle's about
//    N rho^(-1/2), while the seam sits at D ~ N / 2: D^2 / sigma^2 grows like N at a fixed split, so every Gaussian
//    seam weight falls like exp(-const N) and the leak with it. A light whose registers do NOT deepen with D (the
//    modulus held at 9 while kappa follows D) has variances nearly independent of kappa, so its seam weight does not
//    fall: the control C1b.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/ls-probe1.ts: husk-balance's husk A(k) along an axis (0.1197 at k = 0.3,
//    3.0557 at pi/2, 8 at pi; massive 24) and its largest eigenvalue on a 10-grid, 31.71; this showed the factor 2 of
//    point 2 before it was written. tmp/ls-probe2.ts timed oneQuantumBand: 9 s at N = 25, L = 2, 152 s at N = 13,
//    L = 3. tmp/ls-probe3.ts: the measure's ladder variances against harmonicTwoPoint at (N, L) = (9, 2), (25, 2),
//    (13, 3), equal to 12 digits (rails 0.949552, rung 1.519284, plaquette 0.759642 at N = 9, L = 2), erfc against
//    two reference values (1.2e-7 relative), and one husk reading's time (1.0 s). No seam statistic was printed for
//    any ladder box or any husk depth before the gates. NOT BLIND: E-FRC-0231's band errors were known (4.9e-3,
//    2.6e-4, 1.7e-4, 1.7e-5, 7.1e-6 at L = 2), and while designing, a hand estimate of the L = 2 rung's Gaussian seam
//    weight (variance 1.519 at N = 9, 6.12 at N = 25, so w = 2.6e-4 and 4.4e-7) put the band error at about 19 and 16
//    times w. That is why the calibration below is tested out of sample (L = 3, and the classical split).
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: (a) on every ladder box and split, the measure's rail, rung and plaquette variances equal
//     harmonicTwoPoint's within 1e-12 relative; (b) the harmonic two-point function is invariant under one classical
//     beat (classicalBeat), |M Gamma M^T - Gamma| / |Gamma| <= 1e-12, on every drift box; (c) the exact band errors
//     reproduce E-FRC-0231's recorded values (4.9e-3, 2.6e-4, 1.7e-4, 1.7e-5, 7.1e-6; 2.0e-3, 2.0e-3, 4.7e-4) within
//     4 percent (their two-digit rounding); (d) on the husk at k = pi j / 8 along an axis (j = 1 .. 8) the lowest
//     positive lambda_A / 2 solves lambda^2 - 12 lambda + 8u = 0 within 1e-9, and at k = 0 the positive eigenvalues
//     are 24 within 1e-9.
//  C1 CONTROLS, the instrument reads the other outcome: (a) on the classical split (L = 2, N = 9 and 13), where the
//     exact band misses by more than 10 times the drift split's (E-FRC-0231 S2), the seam statistic Phi is also more
//     than 10 times the drift split's at both N, and the exact miss is recomputed more than 10 times; (b) the husk
//     with its register modulus held at 9 while kappa = 2/(2D + 1) follows D (rho = 0.4613818): the seam weight per
//     dock at D = 16 is at least half its value at D = 4 (it does not fall).
//  HC THE CALIBRATION LAW, fixed: band error = A Phi, one constant. A is the geometric mean of error / Phi over the
//     five L = 2 drift boxes. Gate: on every L = 2 box error / (A Phi) is in [1/2, 2]; the least-squares slope of
//     ln error on ln Phi over the L = 2 boxes is in [0.75, 1.33]; and out of sample, on the three L = 3 boxes,
//     error / (A Phi) is in [1/3, 3]. Read, not gated: A itself (point 3 predicts A = 1), and the same fits on the
//     plain seam weight (the largest per register, and the sum per square) and on D^2 / sigma_max^2.
//  H1 THE ROUTE, frozen prediction: the calibrated leak per beat Lambda(D) = A ell_husk(D) and the calibrated band
//     shift A Phi_husk(D), at both candidate splits, fall at every step D -> D + 1 over D = 4 .. 16, and Lambda(16)
//     <= Lambda(4) / 100.
//  P1 THE FALSIFIER (the route's kill): at either split Lambda(16) >= Lambda(4), the leak per beat does not fall.
// READ: the husk's register variances and seam weights by class (axis links, diagonal links, n_P = 1 and n_P = 2
//    triangles), the mode the band and the leak peak at, and the two splits' seam per dock and Lambda against each
//    other at every D (OPEN-LGT-02: they "differ" if the ratio is outside [1/2, 2] at D = 16); the infinite-volume
//    variances (a 16-grid, midpoint) at D = 4 and 16.
// VERDICT: fail if P1 holds (the route is killed) or I1 or C1 fails; pass if I1, C1, HC and H1 hold; partial if I1
//    and C1 hold and P1 does not, but HC or H1 fails.
//
// WHAT THIS CAN AND CANNOT SHOW. Exact: the ladder's band errors (dense Floquet spectra of the rule) and the harmonic
// algebra (point 1, the variances, checked against harmonicTwoPoint). The Gaussian reading: the seam statistics (the
// vacuum is taken as the harmonic Gaussian; its true, non-Gaussian weight near the seam is what the ladder
// calibration is for), first order in Delta. Extrapolated: the 3D numbers, through (i) a quantum husk light that does
// not exist yet (one modulus N, the husk-balance energy, the quadratic register phases of point 2), (ii) the ladder's
// constant A carried from the ladder's split (rho = N / 2) to the husk's (about 0.4) and from 1D boxes to 3D, and
// (iii) the leak reading ell, which is a first-order excess kick, not the exact flow out of the sector. So a pass
// says the Gaussian seam reading, calibrated where it can be, predicts a leak that falls with D; it cannot show the
// 3D light is free in its one-quantum sector, and a non-Gaussian vacuum effect the ladder does not have would escape it.
//
// Depth L2: dense Floquet spectra of the model's ladder light and harmonic (Gaussian) algebra of its 3D husk light on
// a symbol grid, doubles with residuals.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  classicalBeat,
  harmonicTwoPoint,
  oneQuantumBand,
} from '@/code/measure/quantum-ladder'
import {
  inverseDepthSpec,
  splitOf,
  type LadderSpec,
} from '@/code/rule/plaquette-ladder'
import { huskLight, ladderLight } from '@/code/measure/husk-balance'
import {
  lightModes,
  registerVariances,
  seamReading,
  type Light,
  type SeamReading,
  type Split,
} from '@/code/measure/husk-light-seam'

const L2_NS = [9, 13, 17, 21, 25]
const L3_NS = [9, 11, 13]
const CONTROL_NS = [9, 13]
/** E-FRC-0231's recorded band errors (first run, two digits). */
const RECORDED: Record<string, number> = {
  N9L2: 4.9e-3,
  N13L2: 2.6e-4,
  N17L2: 1.7e-4,
  N21L2: 1.7e-5,
  N25L2: 7.1e-6,
  N9L3: 2.0e-3,
  N11L3: 2.0e-3,
  N13L3: 4.7e-4,
}
const SPLITS = [
  { tag: 'avg', rho: 0.4613818 },
  { tag: 'worst', rho: 0.4146386 },
] as const
const DEPTHS = Array.from({ length: 13 }, (_, i) => i + 4)
const HUSK_SIDE = 8
const CONTROL_MODULUS = 9

const ladderSplit = (spec: LadderSpec): Split => {
  const { s, f } = splitOf(spec)

  return { s, f, n: spec.n }
}

const huskSplit = (depth: number, rho: number, modulus?: number): Split => {
  const n = 2 * depth + 1
  const sf = 1 / n

  return {
    s: Math.sqrt(sf / rho),
    f: Math.sqrt(sf * rho),
    n: modulus ?? n,
  }
}

const bandError = (spec: LadderSpec): number => {
  const { band } = oneQuantumBand(spec)

  let worst = 0

  for (const b of band) {
    worst = Math.max(worst, Math.abs(b.omega - b.classical) / b.classical)
  }

  return worst
}

// the register variances from harmonicTwoPoint: rails, rung, plaquette; and the beat invariance of Gamma
function ladderReference(spec: LadderSpec): {
  rail: number
  rung: number
  plaquette: number
  invariance: number
} {
  const L = spec.plaquettes
  const W = harmonicTwoPoint(spec)
  const zero = (): { re: Float64Array; im: Float64Array } => ({
    re: new Float64Array(L),
    im: new Float64Array(L),
  })
  // Gamma (the real part of W) as a 2L x 2L matrix in (B, m) order
  const gamma: number[][] = []

  for (let j = 0; j < 2 * L; j++) {
    const cB = zero()
    const cm = zero()

    ;(j < L ? cB : cm).re[j % L] = 1

    const col = W(cB, cm)

    gamma.push([...col.B.re, ...col.m.re])
  }

  // M: one classical beat on unit vectors
  const beat: number[][] = []

  for (let j = 0; j < 2 * L; j++) {
    const B = zero()
    const m = zero()

    ;(j < L ? B : m).re[j % L] = 1
    classicalBeat(spec, B, m)
    beat.push([...B.re, ...m.re])
  }

  // beat[j] is column j of M, gamma[j] column j of Gamma (symmetric)
  const at = (mat: number[][], r: number, c: number): number => mat[c]![r]!
  let diff = 0
  let norm = 0

  for (let r = 0; r < 2 * L; r++) {
    for (let c = 0; c < 2 * L; c++) {
      let x = 0

      for (let a = 0; a < 2 * L; a++) {
        for (let b = 0; b < 2 * L; b++) {
          x += at(beat, r, a) * at(gamma, a, b) * at(beat, c, b)
        }
      }

      diff = Math.max(diff, Math.abs(x - at(gamma, r, c)))
      norm = Math.max(norm, Math.abs(at(gamma, r, c)))
    }
  }

  const gmm0 = at(gamma, L, L)
  const gmm1 = at(gamma, L, L + 1 < 2 * L ? L + 1 : L)

  return {
    rail: gmm0,
    rung: L === 1 ? 0 : 2 * (gmm0 - gmm1),
    plaquette: at(gamma, 0, 0),
    invariance: diff / norm,
  }
}

const relative = (a: number, b: number): number =>
  Math.abs(a - b) / Math.abs(b)

function fit(xs: number[], ys: number[]): { slope: number; scatter: number } {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  let sxy = 0
  let sxx = 0

  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i]! - my)
    sxx += (x - mx) ** 2
  })

  const slope = sxy / sxx
  const scatter = Math.max(
    ...xs.map((x, i) => Math.abs(ys[i]! - my - slope * (x - mx))),
  )

  return { slope, scatter }
}

export default experiment({
  id: 'gauge/husk-light-seam',
  code: 'E-FRC-0282',
  title:
    'the seam of the 3D quantum light, calibrated on the ladder: the harmonic vacuum weight past the column seam against the exact band misses, carried to the husk as a leak per beat against D',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const ladder: Light = ladderLight()

    // (a) + (b): the ladder boxes, exact and harmonic
    type Box = {
      tag: string
      n: number
      L: number
      error: number
      reading: SeamReading
      sigmaMax2: number
    }

    const boxes: Box[] = []

    let varianceWorst = 0
    let invarianceWorst = 0
    let recordWorst = 0

    const runBox = (
      n: number,
      L: number,
      carrier: 'drift' | 'force',
    ): Box => {
      const spec = inverseDepthSpec(n, L, carrier)
      const split = ladderSplit(spec)
      const reading = seamReading(ladder, split, L, 0)
      const ref = ladderReference(spec)
      const v = reading.variances

      varianceWorst = Math.max(
        varianceWorst,
        relative(v.link[0]!, ref.rail),
        relative(v.link[1]!, ref.rail),
        relative(v.link[2]!, ref.rung),
        relative(v.plaquette[0]!, ref.plaquette),
      )

      if (carrier === 'drift') {
        invarianceWorst = Math.max(invarianceWorst, ref.invariance)
      }

      const error = bandError(spec)
      const tag = `${carrier === 'drift' ? '' : 'force'}N${n}L${L}`

      metrics[`bandError${tag}`] = error
      metrics[`phi${tag}`] = reading.band
      metrics[`ell${tag}`] = reading.leak
      metrics[`seamMax${tag}`] = reading.seamMax
      metrics[`seamPerSquare${tag}`] = reading.seamPerDock
      metrics[`varRail${tag}`] = v.link[0]!
      metrics[`varRung${tag}`] = v.link[2]!
      metrics[`varPlaquette${tag}`] = v.plaquette[0]!

      if (carrier === 'drift') {
        recordWorst = Math.max(recordWorst, relative(error, RECORDED[tag]!))
      }

      return {
        tag,
        n,
        L,
        error,
        reading,
        sigmaMax2: Math.max(...v.link, ...v.plaquette),
      }
    }

    for (const n of L2_NS) {
      boxes.push(runBox(n, 2, 'drift'))
    }

    for (const n of L3_NS) {
      boxes.push(runBox(n, 3, 'drift'))
    }

    const controls = CONTROL_NS.map(n => runBox(n, 2, 'force'))

    metrics.varianceWorstRelative = varianceWorst
    metrics.twoPointInvariance = invarianceWorst
    metrics.recordWorstRelative = recordWorst

    // I1 (d): the husk symbol against E-FRC-0179 / 0235
    const husk: Light = huskLight()
    const axis = lightModes(husk, huskSplit(8, 0.4613818), 16, 0)

    let quadratic = 0
    let massive = 0

    for (let j = 0; j <= 8; j++) {
      const k = (Math.PI * j) / 8
      const at = axis.modes.filter(
        m =>
          Math.abs(m.k[0]! - k) < 1e-12 &&
          Math.abs(m.k[1]!) < 1e-12 &&
          Math.abs(m.k[2]!) < 1e-12,
      )

      if (j === 0) {
        for (const m of at) {
          massive = Math.max(massive, Math.abs(m.lambda - 24))
        }

        continue
      }

      const lambda = Math.min(...at.map(m => m.lambda)) / 2
      const u = 2 - 2 * Math.cos(k)

      quadratic = Math.max(
        quadratic,
        Math.abs(lambda * lambda - 12 * lambda + 8 * u),
      )
    }

    metrics.huskAxisQuadraticResidual = quadratic
    metrics.huskMassiveResidual = massive

    const i1 =
      varianceWorst <= 1e-12 &&
      invarianceWorst <= 1e-12 &&
      recordWorst <= 0.04 &&
      quadratic <= 1e-9 &&
      massive <= 1e-9

    // C1 (a): the classical split
    let c1a = true

    for (const c of controls) {
      const drift = boxes.find(b => b.n === c.n && b.L === 2)!

      metrics[`phiRatioForceN${c.n}`] = c.reading.band / drift.reading.band
      metrics[`errorRatioForceN${c.n}`] = c.error / drift.error
      c1a &&=
        c.reading.band > 10 * drift.reading.band && c.error > 10 * drift.error
    }

    // (c): the husk, and C1 (b): the modulus held at 9
    const huskReadings: Record<string, SeamReading[]> = {}

    for (const { tag, rho } of SPLITS) {
      huskReadings[tag] = DEPTHS.map(D =>
        seamReading(husk, huskSplit(D, rho), HUSK_SIDE, 0),
      )
    }

    const held = [DEPTHS[0]!, DEPTHS[DEPTHS.length - 1]!].map(D =>
      seamReading(
        husk,
        huskSplit(D, SPLITS[0].rho, CONTROL_MODULUS),
        HUSK_SIDE,
        0,
      ),
    )

    metrics.heldSeamPerDockD4 = held[0]!.seamPerDock
    metrics.heldSeamPerDockD16 = held[1]!.seamPerDock
    metrics.heldLeakD4 = held[0]!.leak
    metrics.heldLeakD16 = held[1]!.leak
    metrics.heldBandD4 = held[0]!.band
    metrics.heldBandD16 = held[1]!.band

    const c1b = held[1]!.seamPerDock >= 0.5 * held[0]!.seamPerDock
    const c1 = c1a && c1b

    // HC: the calibration law on the L = 2 boxes, tested on L = 3
    const l2 = boxes.filter(b => b.L === 2)
    const l3 = boxes.filter(b => b.L === 3)
    const A = Math.exp(
      l2.reduce((s, b) => s + Math.log(b.error / b.reading.band), 0) /
        l2.length,
    )
    const calibrated = (b: Box): number => b.error / (A * b.reading.band)
    const phiFit = fit(
      l2.map(b => Math.log(b.reading.band)),
      l2.map(b => Math.log(b.error)),
    )

    metrics.calibrationA = A
    metrics.calibrationSlope = phiFit.slope
    metrics.calibrationScatterLn = phiFit.scatter

    for (const b of boxes) {
      metrics[`calibratedRatio${b.tag}`] = calibrated(b)
    }

    const hc =
      l2.every(b => calibrated(b) >= 0.5 && calibrated(b) <= 2) &&
      phiFit.slope >= 0.75 &&
      phiFit.slope <= 1.33 &&
      l3.every(b => calibrated(b) >= 1 / 3 && calibrated(b) <= 3)

    // read: the plain seam weight and D^2 / sigma^2
    const wFit = fit(
      l2.map(b => Math.log(b.reading.seamMax)),
      l2.map(b => Math.log(b.error)),
    )
    const wSumFit = fit(
      l2.map(b => Math.log(b.reading.seamPerDock)),
      l2.map(b => Math.log(b.error)),
    )
    const zFit = fit(
      l2.map(b => ((b.n - 1) / 2 + 0.5) ** 2 / b.sigmaMax2),
      l2.map(b => Math.log(b.error)),
    )

    metrics.seamMaxSlope = wFit.slope
    metrics.seamMaxScatterLn = wFit.scatter
    metrics.seamSumSlope = wSumFit.slope
    metrics.seamSumScatterLn = wSumFit.scatter
    metrics.zSquaredSlope = zFit.slope
    metrics.zSquaredScatterLn = zFit.scatter

    // H1 / P1: the frozen 3D prediction
    let h1 = true
    let p1 = false

    const lines: string[] = []

    for (const { tag } of SPLITS) {
      const rs = huskReadings[tag]!

      rs.forEach((r, i) => {
        const D = DEPTHS[i]!

        metrics[`huskLeak${tag}D${D}`] = A * r.leak
        metrics[`huskBand${tag}D${D}`] = A * r.band
        metrics[`huskSeamPerDock${tag}D${D}`] = r.seamPerDock
        metrics[`huskSeamMax${tag}D${D}`] = r.seamMax

        if (i > 0) {
          h1 &&= r.leak < rs[i - 1]!.leak && r.band < rs[i - 1]!.band
        }
      })

      const first = rs[0]!
      const last = rs[rs.length - 1]!

      h1 &&= last.leak <= first.leak / 100
      p1 ||= last.leak >= first.leak

      for (const [i, r] of [
        [0, first],
        [rs.length - 1, last],
      ] as const) {
        const D = DEPTHS[i]!
        const v = r.variances
        const cls = (xs: number[], idx: number[]): number =>
          Math.max(...idx.map(j => xs[j]!))

        metrics[`huskVarAxis${tag}D${D}`] = cls(v.link, [0, 1, 2])
        metrics[`huskVarDiagonal${tag}D${D}`] = cls(v.link, [3, 4, 5, 6, 7, 8])
        metrics[`huskVarTri1${tag}D${D}`] = cls(
          v.plaquette,
          husk.n.flatMap((n, j) => (n === 1 ? [j] : [])),
        )
        metrics[`huskVarTri2${tag}D${D}`] = cls(
          v.plaquette,
          husk.n.flatMap((n, j) => (n === 2 ? [j] : [])),
        )
        metrics[`huskLeakModeLambda${tag}D${D}`] = r.leakMode.lambda
        metrics[`huskBandModeLambda${tag}D${D}`] = r.bandMode.lambda
        lines.push(
          `${tag} D ${D}: variances axis ${metrics[`huskVarAxis${tag}D${D}`]!.toFixed(3)}, diagonal ${metrics[`huskVarDiagonal${tag}D${D}`]!.toFixed(3)}, n=1 ${metrics[`huskVarTri1${tag}D${D}`]!.toFixed(3)}, n=2 ${metrics[`huskVarTri2${tag}D${D}`]!.toFixed(3)}; weights axis ${Math.max(...r.linkWeight.slice(0, 3)).toExponential(2)}, diagonal ${Math.max(...r.linkWeight.slice(3)).toExponential(2)}, triangles ${Math.max(...r.plaquetteWeight).toExponential(2)}; leak peaks at lambda ${r.leakMode.lambda.toFixed(3)} k (${r.leakMode.k.map(x => x.toFixed(3)).join(', ')}), band at lambda ${r.bandMode.lambda.toFixed(3)}`,
        )
      }
    }

    // read: the two splits against each other (OPEN-LGT-02)
    const ratios: string[] = []

    DEPTHS.forEach((D, i) => {
      const a = huskReadings.avg![i]!
      const w = huskReadings.worst![i]!

      metrics[`splitSeamRatioD${D}`] = w.seamPerDock / a.seamPerDock
      metrics[`splitLeakRatioD${D}`] = w.leak / a.leak
      ratios.push(
        `D ${D}: seam ${(w.seamPerDock / a.seamPerDock).toFixed(3)}, leak ${(w.leak / a.leak).toFixed(3)}`,
      )
    })

    const splitsDiffer =
      metrics.splitSeamRatioD16! < 0.5 || metrics.splitSeamRatioD16! > 2

    metrics.splitsDifferAtD16 = splitsDiffer ? 1 : 0

    // read: infinite-volume variances (16-grid, midpoint) at D = 4 and 16, the average split
    for (const D of [4, 16]) {
      const { modes, points } = lightModes(
        husk,
        huskSplit(D, SPLITS[0].rho),
        16,
        0.5,
      )
      const v = registerVariances(modes, points)

      metrics[`gridVarAxisD${D}`] = Math.max(...v.link.slice(0, 3))
      metrics[`gridVarDiagonalD${D}`] = Math.max(...v.link.slice(3))
      metrics[`gridVarTriangleD${D}`] = Math.max(...v.plaquette)
    }

    const gates = { I1: i1, C1: c1, HC: hc, H1: h1, P1: p1 }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok ? 1 : 0
    }

    const status =
      p1 || !i1 || !c1 ? 'fail' : hc && h1 ? 'pass' : 'partial'

    const leakSeries = (tag: string): string =>
      DEPTHS.map(D => metrics[`huskLeak${tag}D${D}`]!.toExponential(2)).join(
        ', ',
      )

    return verdict({
      status,
      claim: `ladder: the exact band errors ${l2.map(b => b.error.toExponential(2)).join(', ')} (L = 2, N = ${L2_NS.join(', ')}) against the first-order Gaussian seam shift ${l2.map(b => b.reading.band.toExponential(2)).join(', ')}, calibration A = ${A.toPrecision(3)}, slope ${phiFit.slope.toFixed(3)}, calibrated ratios ${l2.map(b => calibrated(b).toFixed(2)).join(', ')}; out of sample (L = 3, N = ${L3_NS.join(', ')}) ${l3.map(b => calibrated(b).toFixed(2)).join(', ')}; the classical split's seam shift ${controls.map(c => metrics[`phiRatioForceN${c.n}`]!.toPrecision(3)).join(' and ')} times the drift split's. Husk (side 8, kappa = 2/(2D + 1)): the calibrated leak per beat at D = 4 .. 16 is ${leakSeries('avg')} (rho 0.4614) and ${leakSeries('worst')} (rho 0.4146); with the modulus held at 9 the seam per dock goes ${held[0]!.seamPerDock.toExponential(2)} to ${held[1]!.seamPerDock.toExponential(2)}`,
      metrics,
      control: {
        phiRatioForceN9: metrics.phiRatioForceN9!,
        heldSeamPerDockD16: held[1]!.seamPerDock,
      },
      notes: `L2. Husk classes at the ends: ${lines.join('; ')}. Splits (worst over average): ${ratios.join('; ')}. Read fits on L = 2 (slope, largest ln residual): largest seam weight ${wFit.slope.toFixed(3)}, ${wFit.scatter.toFixed(3)}; seam per square ${wSumFit.slope.toFixed(3)}, ${wSumFit.scatter.toFixed(3)}; ln error on D^2 / sigma_max^2 ${zFit.slope.toFixed(3)}, ${zFit.scatter.toFixed(3)}; first-order Phi ${phiFit.slope.toFixed(3)}, ${phiFit.scatter.toFixed(3)}.`,
    })
  },
})
