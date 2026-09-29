// E-FRC-0263: ONE PHOTON OFF ONE CHARGED REGISTER MEMBER, READ ON THE HUSK: COMPTON'S SHIFT AND THOMSON'S LIMIT.
//
// THE QUESTION. E-SPN-0169 coupled the husk light to E-SPN-0160's register member exactly: the light's link angle rides
// the stream as a Peierls phase, register-blind, which on a uniform field is the shift K -> K + A of the member's Bloch
// momentum (to 2.2e-15), and the current the light reads is the group velocity. Does a photon then scatter off a member
// as Compton and Thomson say, and where does the lattice member differ from Dirac's electron?
//
// DERIVATION (written before the gate run; probes 1 and 3, disclosed below, were read first).
//
// 1. THE TWO DISPERSIONS, on the husk slice K = (q, 0) (E-SPN-0167). The member: eps(q) = E(q, 0) / 2 per beat, E the
//    closed-form band cos E = cos M - 2 cos^2(M/2) g^2 (E-SPN-0160), rest energy m = M / 2, one speed c_m = sqrt 2 / 4.
//    The photon: the husk light's transverse branch, 4 sin^2(w / 2) = kappa lambda(k), w -> c_l k with c_l^2 = 2 kappa / 3.
//    TWO LIGHTS: the loop light at kappa = 3/16, where c_l = c_m exactly (E-FRC-0260), and the trit column at depth 5,
//    kappa = 2/11, c_l 1.5% slow (E-FRC-0261).
// 2. KINEMATICS. Husk momentum and quasi-energy are conserved exactly by translation invariance (E-RLT-0109), so the
//    scattered wave number k' at angle theta off a member at rest solves eps(k n - k' n2) + w(k' n2) = m + w(k n): no
//    amplitude is needed for the shift. At low energy the recoil is p^2 / (2 m*), p^2 = 2 k^2 (1 - cos theta), 1 / m* =
//    eps'' the band's curvature, so dw = -k^2 (1 - cos theta) eps'' and the wavelength 2 pi / k shifts by
//      d lambda = lambda_C (1 - cos theta),   lambda_C = 2 pi eps'' / c_l.
//    THE INERTIA. E-SPN-0160's R = tan m / m (inertia over energy, c_m^2 units) gives eps'' = c_m^2 / (R m), isotropic
//    (the roots are a 5-design). So lambda_C = 2 pi c_m^2 / (R m c_l), against the standard 2 pi c / (m c^2) read with
//    c = c_m and rest energy m:  lambda_C,model / lambda_C,std = (c_m / c_l) / R. PREDICTED: 1 / R = 0.98792 on the
//    loop light, (c_m / c_l) / R = 1.00324 on the column; -> 1 for light members (R -> 1) on one speed.
//    FINITE k. The standard formula d lambda = lambda_C (1 - cos theta) is exact for Dirac's electron at every energy; the
//    lattice member (eps not sqrt(m^2 + c^2 p^2) beyond second order, R != 1) and the lattice light depart at order k^2.
//    PREDICTED: the departure of d lambda / ((1 - cos theta) lambda_C) from 1 scales as k^2.
// 3. THOMSON. A long-wave photon is a uniform A(t). The coupling is the shift, so a member at rest driven slowly follows
//    its band at K = A(t) and carries the current v = eps'' A: the forward amplitude's low-frequency limit is -q^2 eps''
//    = -q^2 / m*, Thomson's with the INERTIA in place of the rest mass. So sigma / sigma_T,std = (eps'' m / c_m^2)^2 =
//    1 / R^2 (0.97596 here), -> 1 for light members. THE FREQUENCY DEPENDENCE (the form written after probe 1 showed it):
//    the velocity couples the member's positive and negative branches (Zitterbewegung), whose gap is 2m per beat, so
//    below the pair threshold chi(w) = eps'' (2m)^2 / ((2m)^2 - w^2), Dirac's free-particle dipole response.
//
// GATES (pre-registered; tolerances set from probes 1 and 3, disclosed):
//   K1 inertia        eps'' along the axis, face and body diagonals equals c_m^2 / (R m) to 1e-8 (Richardson, h 1e-3)
//   K2 Compton        on both lights, 3 incoming directions x 4 angles (45, 90, 135, 180 degrees), the Richardson limit
//                     (4 f(0.01) - f(0.02)) / 3 of f(k) = d lambda / ((1 - cos theta) lambda_C) is 1 to 2e-5
//   K3 k^2 law        (1 - f(0.02)) / (1 - f(0.01)) in [3.6, 4.4] at every point of K2
//   K4 the ratio      lambda_C / lambda_C,std = (c_m / c_l) / R to 1e-8 on both lights (with K1, a consequence; gated so
//                     the number is on the record)
//   T1 Thomson        chi(w) / (eps'' Dirac(w)) = 1 to 2e-5 for w = 2 pi / P, P 2048, 1024, 512, on the light unit
//                     (-1, 4) and the lighter (2, 2)
//   T2 Dirac form     |chi / (eps'' Dirac) - 1| <= 1e-3 at P 256, 128, 64 (w up to 0.098, about half the threshold)
//   T3 linear         doubling A0 (1e-3 to 2e-3) moves chi by <= 2e-5 relative at every T1, T2 point
//   T4 in phase       |quadrature / chi| <= 1e-5 at every T1, T2 point (no absorption below the pair threshold)
// CONTROLS:
//   C1 coupling off   A0 = 0: every cycle's mean step is 0 to 1e-15 over the run (the member at rest carries no current)
//   C2 the light      the loop light's long-wave speed is sqrt 2 / 4 to 1e-7 at k 1e-3 (E-FRC-0260)
//   C3 E-SPN-0160     the rest energy memberEps(0) = m to 1e-15, and R read from eps'' is tan m / m to 1e-8
//   C4 heavier member the (2, 2) unit's chi(0) tracks ITS eps'' (T1 on both units), so the amplitude follows the inertia
// READ, gating nothing: chi near the pair threshold (P 32, 24), where the form holds to 0.2% and then the resonance.
//
// PREDICTED VERDICT: PARTIAL. The kinematics and the low-energy amplitude are the standard ones with the member's
// inertia R m / c_m^2 in place of its rest energy, the Compton wavelength 1 / R of the standard's on one speed, and the
// member's dipole response is Dirac's below the pair threshold. Not run: the angular distribution and the cross section at
// finite k (Klein-Nishina: the transverse polarization sums and the two-quantum amplitude on the rule), and the model's
// alpha (not fixed, E-FRC-0261), so the absolute Thomson cross section is a ratio, not a number.
//
// PROBES, disclosed: tmp/cmp-probe1.log (eps'' = c^2 / (R m) to 5e-10 in two directions; the lights' speeds; the Compton
// ratio f at k 0.01 to 0.1 on both lights; the drive at 4 frequencies, which showed chi following (2m)^2 / ((2m)^2 -
// w^2)); tmp/cmp-probe3.log (whole-period lock-in on both units: chi / (eps'' Dirac) = 1 to 8e-6 at P >= 512, 4e-4 at
// P 64, quadrature <= 2.3e-6, A0 doubling 5e-6). The gates' tolerances and the Dirac form were set from them.
//
// SMOKE (tmp/cmp-smoke.log, 2 s, one incoming direction, one period per band): every path, all as predicted; nothing
// changed after it.
//
// FIRST RUN (tmp/cmp-exp-run1.log, 12 s): PARTIAL, as predicted, every gate and control held. K1 eps'' = c^2 / (R m) =
// 0.6495190528 to 4.8e-10 on the axis, face and body diagonals; K2 the Compton limit to 5.0e-6 (3 directions x 4 angles x
// 2 lights); K3 the finite-k departure as k^2 (ratios 3.87 to 3.98; 4.4e-4 at k 0.02); K4 lambda_C / lambda_C,std =
// 0.987922 on the loop light (1 / R) and 1.003239 on the column; T1 chi / (eps'' Dirac) = 1 to 8.9e-6 at P 2048 to 512 on
// both units; T2 to 4.0e-4 up to P 64 (w 0.098); T3 A0 doubling 1.0e-5; T4 quadrature 2.3e-6; C1 the resting current
// 9.4e-17. sigma / sigma_T = 1 / R^2 = 0.97599. Read: near the pair threshold chi follows the Dirac form to 0.2% at w
// 0.196 on the light unit, and the lighter unit, 0.025 below its 2m, reads 7.24 against 6.02 (the resonance's width).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { comptonK, driveResponse, lightOmega, memberBeat, memberEps } from '@/code/measure/light-matter'
import { partnerProjector48, registerPiece, scaled, singletProjector24 } from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const C_M = Math.SQRT2 / 4
const LIGHT: readonly [number, number] = [-1, 4]
const LIGHTER: readonly [number, number] = [2, 2]
const KAPPAS = [3 / 16, 2 / 11]
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const INCOMING: readonly { n: number[]; e: number[] }[] = [
  { n: [1, 0, 0], e: [0, 1, 0] },
  { n: [s2, s2, 0], e: [-s2, s2, 0] },
  { n: [s3, s3, s3], e: [s2, -s2, 0] },
]
const ANGLES = [45, 90, 135, 180]
const K_SMALL = 0.01
const K_LARGE = 0.02

export type ComptonPlan = { thomsonPeriods: readonly number[]; formPeriods: readonly number[]; readPeriods: readonly number[]; incoming: number }

export const GATE_PLAN: ComptonPlan = { thomsonPeriods: [2048, 1024, 512], formPeriods: [256, 128, 64], readPeriods: [32, 24], incoming: 3 }

export const SMOKE_PLAN: ComptonPlan = { thomsonPeriods: [512], formPeriods: [64], readPeriods: [24], incoming: 1 }

const flag = (b: boolean): number => (b ? 1 : 0)

type Member = { unit: readonly [number, number]; m: number; M: number; theta: number; P: CMatrix[]; epp: number[] }

function member(unit: readonly [number, number]): Member {
  const theta = unitAngle(ringUnit(unit[0], unit[1]))
  const m = wrap(theta - Math.PI) / 2
  const M = 2 * m
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const P: CMatrix[] = [registerPiece(qS, [Math.cos(theta), Math.sin(theta)]), registerPiece(qD, [Math.cos(theta), -Math.sin(theta)])]
  const epp = [
    [1, 0, 0],
    [s2, s2, 0],
    [s3, s3, s3],
  ].map(d => {
    const second = (h: number): number => (memberEps(d.map(x => x * h), M) - 2 * memberEps([0, 0, 0], M) + memberEps(d.map(x => -x * h), M)) / (h * h)

    return (4 * second(5e-4) - second(1e-3)) / 3
  })

  return { unit, m, M, theta, P, epp }
}

// the member at rest: the singlet (uniform over the 24 slots) with the register's scalar blade
function restState(): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(192)
  const im = new Float64Array(192)

  for (let d = 0; d < 24; d++) re[d * 8] = 1 / Math.sqrt(24)

  return { re, im }
}

// the largest cycle-mean step of the member at rest with no field, over `beats` beats
function restCurrent(P: readonly CMatrix[], beats: number): number {
  const { re, im } = restState()
  const tr = new Float64Array(192)
  const ti = new Float64Array(192)
  let worst = 0
  let acc = 0

  for (let t = 0; t < beats; t++) {
    const d = memberBeat(P[t % P.length] as CMatrix, [0, 0, 0, 0], [0, 0, 0, 0], re, im, tr, ti)

    acc += d[0] as number
    if (t % P.length === P.length - 1) {
      worst = Math.max(worst, Math.abs(acc / P.length))
      acc = 0
    }
  }

  return worst
}

export function comptonRun(plan: ComptonPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const light = member(LIGHT)
  const lighter = member(LIGHTER)
  const R = Math.tan(light.m) / light.m
  const target = (C_M * C_M) / (R * light.m)

  // ---------------- K1, C3: the inertia ----------------
  const k1Gap = Math.max(...light.epp.map(e => Math.abs(e - target)))
  const K1 = k1Gap <= 1e-8
  const rFromCurvature = (C_M * C_M) / ((light.epp[0] as number) * light.m)
  const C3 = Math.abs(memberEps([0, 0, 0], light.M) - light.m) <= 1e-15 && Math.abs(rFromCurvature - R) <= 1e-8
  const epp = light.epp[0] as number

  log('K1 C3')

  // ---------------- K2, K3, K4, C2: Compton ----------------
  let k2Gap = 0
  let k3Lo = Infinity
  let k3Hi = -Infinity
  let k4Gap = 0
  const ratios: number[] = []
  const lights: { kappa: number; cl: number; lamC: number; ratio: number; worstF: number }[] = []

  for (const kappa of KAPPAS) {
    const cl = Math.sqrt((2 * kappa) / 3)
    const lamC = (2 * Math.PI * epp) / cl
    const lamStd = (2 * Math.PI * C_M) / light.m
    const ratio = lamC / lamStd
    let worstF = 0

    k4Gap = Math.max(k4Gap, Math.abs(ratio - C_M / cl / R))
    ratios.push(ratio)

    for (const { n, e } of INCOMING.slice(0, plan.incoming)) {
      for (const deg of ANGLES) {
        const th = (deg * Math.PI) / 180
        const n2 = [0, 1, 2].map(i => Math.cos(th) * (n[i] as number) + Math.sin(th) * (e[i] as number))
        const f = (k: number): number => {
          const kp = comptonK({ k, n, n2, M: light.M, kappa, pol: 0 })

          return (2 * Math.PI * (1 / kp - 1 / k)) / (1 - Math.cos(th)) / lamC
        }
        const fs = f(K_SMALL)
        const fl = f(K_LARGE)
        const limit = (4 * fs - fl) / 3
        const law = (1 - fl) / (1 - fs)

        k2Gap = Math.max(k2Gap, Math.abs(limit - 1))
        k3Lo = Math.min(k3Lo, law)
        k3Hi = Math.max(k3Hi, law)
        worstF = Math.max(worstF, Math.abs(1 - fl))
      }
    }

    lights.push({ kappa, cl, lamC, ratio, worstF })
  }

  const K2 = k2Gap <= 2e-5
  const K3 = k3Lo >= 3.6 && k3Hi <= 4.4
  const K4 = k4Gap <= 1e-8
  const c2Speed = (lightOmega([1e-3, 0, 0], 3 / 16)[0] as number) / 1e-3
  const C2 = Math.abs(c2Speed - C_M) <= 1e-7

  log('K2 K3 K4 C2')

  // ---------------- T1..T4, C4: Thomson ----------------
  let t1Gap = 0
  let t2Gap = 0
  let t3Gap = 0
  let t4Gap = 0
  const reads: string[] = []
  const table: string[] = []

  for (const mb of [light, lighter]) {
    const e2 = mb.epp[0] as number
    const drive = (period: number, A0: number): { chi: number; quadrature: number; norm: number } =>
      driveResponse({ P: mb.P, psi0: restState(), axis: [1, 0, 0, 0], A0, omega: (2 * Math.PI) / period, beats: 12 * period, ramp: 4 * period })
    const dirac = (period: number): number => {
      const w = (2 * Math.PI) / period

      return (4 * mb.m * mb.m) / (4 * mb.m * mb.m - w * w)
    }

    for (const [periods, which] of [
      [plan.thomsonPeriods, 'T1'],
      [plan.formPeriods, 'T2'],
    ] as const) {
      for (const period of periods) {
        const a = drive(period, 1e-3)
        const b = drive(period, 2e-3)
        const x = -a.chi / e2 / dirac(period)

        if (which === 'T1') t1Gap = Math.max(t1Gap, Math.abs(x - 1))
        else t2Gap = Math.max(t2Gap, Math.abs(x - 1))
        t3Gap = Math.max(t3Gap, Math.abs(b.chi / a.chi - 1))
        t4Gap = Math.max(t4Gap, Math.abs(a.quadrature / a.chi))
        table.push(`${mb.unit.join(',')} P ${period}: chi/eps'' ${(-a.chi / e2).toFixed(7)} Dirac ${dirac(period).toFixed(7)}`)
      }
    }

    for (const period of plan.readPeriods) {
      const a = drive(period, 1e-3)

      reads.push(`${mb.unit.join(',')} P ${period} (w ${((2 * Math.PI) / period).toFixed(4)}, 2m ${(2 * mb.m).toFixed(4)}): chi/eps'' ${(-a.chi / e2).toFixed(5)} Dirac ${dirac(period).toFixed(5)} quad/chi ${(a.quadrature / a.chi).toExponential(2)}`)
    }
  }

  const T1 = t1Gap <= 2e-5
  const T2 = t2Gap <= 1e-3
  const T3 = t3Gap <= 2e-5
  const T4 = t4Gap <= 1e-5
  const C4 = T1

  log('T')

  // ---------------- C1: coupling off ----------------
  const c1Gap = restCurrent(light.P, 512)
  const C1 = c1Gap <= 1e-15

  log('C1')

  const gates = { K1, K2, K3, K4, T1, T2, T3, T4 }
  const controls = { C1, C2, C3, C4 }
  const all = Object.values(gates).every(Boolean) && Object.values(controls).every(Boolean)
  const f = (x: number, d = 6): string => x.toFixed(d)
  const sigmaRatio = 1 / (R * R)

  return verdict({
    status: all ? 'partial' : 'fail',
    claim: `a photon off a charged register member at rest, read on the husk: the kinematics conserve husk momentum and quasi-energy exactly, and the wavelength shift is lambda_C (1 - cos theta) in the low-energy limit to ${k2Gap.toExponential(1)} (3 directions x 4 angles, both lights), with lambda_C = 2 pi eps'' / c_l set by the member's INERTIA (eps'' = c^2 / (R m) to ${k1Gap.toExponential(1)}): ${f(ratios[0] as number, 5)} of the standard Compton wavelength on the loop light (1 / R), ${f(ratios[1] as number, 5)} on the depth-5 trit column, the departure at finite k growing as k^2 (ratio ${f(k3Lo, 2)} to ${f(k3Hi, 2)}); the forward amplitude's low-frequency limit is Thomson's -q^2 / m* with m* the inertia (sigma / sigma_T = 1 / R^2 = ${f(sigmaRatio, 5)}), and below the pair threshold the member's dipole response is Dirac's eps'' (2m)^2 / ((2m)^2 - w^2), to ${t1Gap.toExponential(1)} at low frequency and ${t2Gap.toExponential(1)} up to w 0.098, linear and in phase; not run: the angular distribution and cross section at finite k (Klein-Nishina), and the absolute cross section, which needs the model's alpha`,
    metrics: {
      K1: flag(K1),
      K2: flag(K2),
      K3: flag(K3),
      K4: flag(K4),
      T1: flag(T1),
      T2: flag(T2),
      T3: flag(T3),
      T4: flag(T4),
      m: light.m,
      R,
      epp,
      k1Gap,
      k2Gap,
      k3Lo,
      k3Hi,
      k4Gap,
      lambdaRatioLoop: ratios[0] as number,
      lambdaRatioColumn: ratios[1] as number,
      sigmaRatio,
      t1Gap,
      t2Gap,
      t3Gap,
      t4Gap,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4), c1Gap, c2Speed, rFromCurvature },
    notes: `L2, deterministic (fixed directions and angles, whole-period drives; no draw). Gates ${JSON.stringify(gates)}, controls ${JSON.stringify(controls)}. Member u = ringUnit(${LIGHT.join(', ')}) m ${f(light.m, 8)}, R ${f(R, 8)}, eps'' ${light.epp.map(x => f(x, 10)).join(' ')} (axis, face, body) against c^2/(R m) ${f(target, 10)}. Lights: ${lights.map(l => `kappa ${f(l.kappa, 5)} c_l ${f(l.cl, 8)} lambda_C ${f(l.lamC, 5)} (ratio ${f(l.ratio, 6)}, worst finite-k departure at k ${K_LARGE} ${l.worstF.toExponential(2)})`).join('; ')}. Thomson table: ${table.join('; ')}. Read: ${reads.join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'gauge/compton-thomson',
  code: 'E-FRC-0263',
  title:
    'one photon off one charged register member, read on the husk, partial: exact conservation gives the Compton shift lambda_C (1 - cos theta) at low energy with lambda_C set by the member\'s inertia (1 / R of the standard on one speed, R = tan m / m), departing as k^2 at finite k; the low-frequency amplitude is Thomson\'s with the inertia in place of the rest mass (sigma / sigma_T = 1 / R^2), and below the pair threshold the dipole response is Dirac\'s; the finite-k cross section and the absolute value (alpha) are not run',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return comptonRun(GATE_PLAN)
  },
})
