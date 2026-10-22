// R AND g AS ONE MATCHING TABLE (E-SPN-0195, OPEN-MOT-01, OPEN-MAT-03; moving-matter item 0017, Key 1 of idea/keys.md).
// The working rule is R* (decision 0006) with the spinor lift L(s) as the member's rotation. E-SPN-0183 measured the
// bound register pair's R above the free member's tan m / m (a_B 8: 1.534, a_B 12 with the Darwin exchange: 1.2495
// against 1.0656). This file asks whether that excess is a coefficient mismatch of the ONE-body expansion: it reads the
// register member's NRQED coefficients M1, M2, M4, c_F, c_D at five masses, and predicts the pair's excess from them with
// no free parameter, before comparing with the measured R.
//
// DERIVED BEFORE THE RUN (code/measure/matching-table; per beat, the member's speed c^2 = 1/8, so the continuum Dirac
// member has M1 = M2 = M4 = m and R = M2 / M1 is E-SPN-0183's R).
// 1. THE ONE-BODY EXPANSION, EXACT. diracPhase is cos 2 eps = cos 2m - 2 cos^2 m g^2, g^2 = |s(K)|^2 / 4. The 24 D4 roots
//    give sum_r r r^T = 12 and sum_r r_i (K . r)^3 = 12 K_i K^2 (sum r_a^4 = 12 = 3 sum r_a^2 r_b^2: isotropic), so
//    g^2 = K^2 / 8 - K^4 / 24 + O(K^6) in every direction, and
//      eps = m + K^2 / (16 tan m) - [1 / (48 tan m) + cos 2m cos m / (512 sin^3 m)] K^4 + O(K^6)
//    M1 = m, M2 = tan m (so M2 / M1 = tan m / m, E-SPN-0145), and
//      (M2 / M4)^3 = (32 / 3) tan^2 m + cos 2m / cos^2 m = 1 + (29 / 3) m^2 + O(m^4)
//    The first term is the lattice's own K^4 (the sine's cubic), the second the Dirac band's. M4 / M2 -> 1 as m -> 0.
// 2. c_F BY LANDAU LEVELS. In a weak uniform B_z (Landau gauge A_y = B x, Peierls phase e^(i q B x_mid r_y) on the
//    stream) the member is a chain of x-slices with Bloch momenta in y, z, w. The register-link-field law cos E =
//    cos M - 2 cos^2(M / 2) mu, mu in spec(C C^dag), holds in any static field, and C C^dag is m-independent, so the
//    levels of all five masses come from one Hermitian matrix per B. Pauli: E(n, sigma) = M1 + (n + 1/2 - c_F sigma / 2)
//    q B / M2, so c_F = (E(0, -) - E(0, +)) / (E(1, +) - E(0, +)), read at q B = 0.02, 0.01, 0.005 and extrapolated to
//    B = 0 by the parabola. sigma is the SPINOR LIFT's: sigma_z = i L(b), L(s(phi)) = cos(phi/2) + sin(phi/2) L(b) for the
//    turn e1 -> e2 (decision 0006; the minors action would give integer spin and is not read). The doubler valley at
//    K_x = pi is removed by the slice-shift operator. EXPECTED: C C^dag ~ (gamma . Pi)^T (gamma . Pi) / 4, whose
//    commutator term is the Pauli term with the orbital's own weight, so c_F = 1 at every m up to O(B), and g1 = 2 c_F = 2.
// 3. c_D is read where the brief puts it, code/measure/darwin-exchange: the long-wave ratio X(k -> 0) of the light's
//    transverse to its Coulomb exchange (1 iff one Maxwell Lagrangian at the light's own speed). It enters the pair as
//    the Darwin inertia -(8/3) E_b S c_D (c_m / c_l)^2 at the state's own S (E-SPN-0169), with speed ratio 1 as
//    E-SPN-0183 used it.
// 4. THE PAIR'S KINETIC MASS, PARAMETER-FREE (Kronfeld 1997, the binding-energy inconsistency, first order in the bound
//    state). Two members with E_i = M1 + p_i^2 / 2 M2 - p_i^4 / 8 M4^3, p_1,2 = P / 2 +- p, in an s-state: the P^2 terms
//    are P^2 / (4 M2) - (5/3) <p^2> P^2 / (8 M4^3) (from (p_1^2)^2 + (p_2^2)^2 = ... + P^2 p^2 + 2 (P . p)^2, <(P . p)^2> =
//    P^2 <p^2> / 3). The virial theorem in the Coulomb pull gives <p^2> = M2 <T> = M2 E_b. The transverse exchange
//    (velocity p / M2 in the current) adds -(8/3) E_b S c_D with M2 cancelling. So, E_b per beat:
//      M_kin = 2 M2 + (5/3) E_b (M2 / M4)^3 - (8/3) E_b S c_D,      M_rest = 2 M1 - E_b
//      R_pred = M_kin / M_rest,      excess_pred = R_pred - M2 / M1
//    (S = 0 for the static R). c_F enters an s-wave pair's kinetic mass at zero weight at this order (sigma averages),
//    so the prediction carries M1, M2, M4 and c_D; c_F is the one-body g. With M2 = M4 the static form is E-SPN-0155's
//    staticR exactly, so the prediction differs from E-SPN-0183's formula only by (5/3) E_b ((M2 / M4)^3 - 1) / M_rest.
// 5. EVALUATED BY HAND at E-SPN-0183's member (m 0.427029, before the run): (M2 / M4)^3 = 3.00, so the M4 mismatch adds
//    0.066 to R at a_B 8 (static) and 0.025 at a_B 12 (Darwin): predicted excesses about 0.12 and 0.025 against the
//    measured 0.468 and 0.184. And at m = pi / 48, M4 / M2 = 0.9865. PREDICTED VERDICT: the kill fires (both off by more
//    than a factor 2), and the M4 sub-gate misses 0.01 at pi / 48 by its lattice K^4 term.
//
// THE MEASURED POINTS (E-SPN-0183's record, state.md baselines, like with like):
//   a_B 8:  the tracked bound line E 1.674964363 per cycle, R static 1.5340 (no Darwin reading exists there): the STATIC
//           prediction (S = 0) against it
//   a_B 12: the main line E 1.695612118, R static 1.2693, R with the Darwin exchange 1.2495: the DARWIN prediction against
//           1.2495, its S backed out of E-SPN-0183's own shift (1.2693 - 1.2495 = (8/3) E_b S / (2m - E_b))
//   0001 has logged no radius yet (its tmp/track-a8 log holds a level, no R), so no third point.
//
// GATES (fixed by the brief 2026-10-08, before any comparison):
//   PASS: the predicted excess within 20% of the measured at a_B 8 AND a_B 12, AND |c_F - 1| <= 0.01 at pi / 48 with
//         |c_F - 1| non-increasing as m falls over the five masses, AND |M4 / M2 - 1| <= 0.01 at pi / 48 with
//         |M4 / M2 - 1| non-increasing as m falls
//   KILL (fail): the prediction off by more than a factor 2 at BOTH a_B 8 and 12. Then the excess is not a coefficient
//         mismatch but strong coupling across one link (E-SPN-0173), and only 0001's large-a_B reading can close
//         OPEN-MOT-01
//   otherwise partial
//   CONTROL C1: continuum coefficients (M1 = M2 = M4, c_F = c_D = 1) predict zero excess (the Darwin-complete form at
//         S = 1); it must fail the 20% band at a_B 8
//   INSTRUMENT (a failure makes a pass partial): I1 memberCycle's eigenphases equal diracPhase's +-E within 1e-12 at
//         every mass; I2 the fitted K^2 and K^4 coefficients equal the closed form within 1e-6 (relative) on the axis, the
//         face diagonal and the body diagonal (isotropy); I3 the chain at B = 0, periodic with twist K_x, acts on a Bloch
//         state as register-meson's overlapAt within 1e-14; I4 the coordinate cycle in the field (16 n) has the law's
//         phases within 1e-9 (q B 0.02, a short chain); I5 magnetic translation: the levels at k_y = 5 q B equal those
//         at 0 within 1e-9; I6 the Landau spacing over q B / (4 tan m), extrapolated, within 1e-3 of 1 (the orbital
//         reads the same M2 as the band); I7 the valley and spin separations within 0.05 of +-1 and the clusters split
//         4 + 4 + 4 (or d + d + d); I8 c_D within 1e-3 of 1
//   NOT GATED: E-SPN-0174's static 1.43 (the string's own inertia is not a one-body coefficient)
//
// DETERMINISM: no random numbers. NOTHING MOVES on the base: one member's exact pieces, in doubles.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { darwinRatio } from '@/code/measure/darwin-exchange'
import { wrap } from '@/code/measure/dock-mixer'
import { overlapAt } from '@/code/measure/register-meson'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  bandExcess,
  bandPhase,
  cFAt,
  chain,
  chainSquare,
  closedForm,
  coordinateCycle,
  cycleGap,
  extrapolate,
  fitCoefficients,
  kineticR,
  landau,
  lawPhase,
  memberU,
  type Coefficients,
  type LandauRead,
} from '@/code/measure/matching-table'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'

export const MASSES: readonly { name: string; m: number }[] = [
  { name: 'pi/48', m: Math.PI / 48 },
  { name: 'pi/24', m: Math.PI / 24 },
  { name: 'pi/12', m: Math.PI / 12 },
  { name: 'pi/8', m: Math.PI / 8 },
  { name: '0.45pi', m: 0.45 * Math.PI },
]
export const FIELDS: readonly number[] = [0.02, 0.01, 0.005]

// E-SPN-0183's record (register-coulomb-weak header, FIRST RUN and AFTER THE RUN)
export const MEASURED = {
  a8: { E: 1.674964363, Rstatic: 1.534 },
  a12: { E: 1.695612118, Rstatic: 1.2693, Rdarwin: 1.2495 },
}

const LIGHT: readonly [number, number] = [-5, 1]
const BAND = 0.2
const KILL = 2
const TOL = {
  sub: 0.01,
  i1: 1e-12,
  i2: 1e-6,
  i3: 1e-14,
  i4: 1e-9,
  i5: 1e-9,
  i6: 1e-3,
  i7: 0.05,
  i8: 1e-3,
}

export default experiment({
  id: 'spin/matching-table',
  code: 'E-SPN-0195',
  title:
    "R and g as one matching table: the register member's NRQED coefficients M1 = m, M2 = tan m, (M2 / M4)^3 = (32/3) tan^2 m + cos 2m / cos^2 m and c_F from its Landau levels, read at five masses, predict a bound pair's excess R - tan m / m with no free parameter (Kronfeld's first-order kinetic mass), compared with E-SPN-0183's measured R at a_B 8 and 12",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return matchingTableRun()
  },
})

const flag = (b: boolean): number => (b ? 1 : 0)

export function measuredMember(): number {
  return wrap(unitAngle(ringUnit(LIGHT[0], LIGHT[1])) - Math.PI) / 2
}

const nonIncreasing = (xs: readonly number[], tol = 1e-12): boolean =>
  xs.every((x, i) => i === 0 || x <= xs[i - 1]! + tol)

export function matchingTableRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const m0 = measuredMember()
  const all = [...MASSES, { name: 'E-SPN-0183', m: m0 }]

  // ---------------- M1, M2, M4 ----------------
  const DIRS = [
    [1, 0, 0, 0],
    [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
    [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 0],
  ]
  const I1_MOMENTA = [
    [0, 0, 0, 0],
    [0.01, 0, 0, 0],
    [0.3, 0.1, -0.2, 0],
    [1.1, -0.7, 0.4, 0],
  ]

  let i1 = 0
  let i2 = 0

  const table: (Coefficients & { name: string })[] = all.map(({ name, m }) => {
    const k = closedForm(m)

    for (const K of I1_MOMENTA) {
      i1 = Math.max(
        i1,
        cycleGap(m, K),
        Math.abs(bandExcess(K, m) - (bandPhase(K, m) - m)),
      )
    }

    for (const n of DIRS) {
      const f = fitCoefficients(m, n, m / 20)

      i2 = Math.max(
        i2,
        Math.abs(f.c2 / k.c2 - 1),
        Math.abs(f.c4 / k.c4 - 1),
      )
    }

    return { ...k, name }
  })

  log('coefficients')

  // ---------------- c_F by Landau levels ----------------
  const reads: LandauRead[] = FIELDS.map(qB => {
    const ell = 1 / Math.sqrt(qB)
    const r = landau({ qB, ky: 0, half: Math.ceil(6 * ell) + 5 })

    log(`landau qB ${qB}: n ${r.n} low ${r.low} valley0 ${r.valley0} up ${r.up} down ${r.down} mu ${r.mu0Up.toExponential(6)} ${r.mu0Down.toExponential(6)} ${r.mu1Up.toExponential(6)} spread ${r.spread.toExponential(2)}`)

    return r
  })

  // I5 at the largest field: k_y = 5 q B shifts the centre five slices
  const shifted = landau({
    qB: FIELDS[0]!,
    ky: 5 * FIELDS[0]!,
    half: Math.ceil(6 / Math.sqrt(FIELDS[0]!)) + 5,
  })
  const i5 = Math.max(
    Math.abs(shifted.mu0Up - reads[0]!.mu0Up),
    Math.abs(shifted.mu0Down - reads[0]!.mu0Down),
    Math.abs(shifted.mu1Up - reads[0]!.mu1Up),
  )

  log('shifted')

  const cF = all.map(({ m }) => {
    const per = reads.map(r => cFAt(r, m))

    return {
      perField: per.map(p => p.cF),
      cF: extrapolate(FIELDS, per.map(p => p.cF)),
      spacing: extrapolate(FIELDS, per.map(p => p.spacing)),
    }
  })

  // I7: the separations and the cluster counts
  const i7Gap = Math.max(
    ...reads.flatMap(r => [r.valleyGap, r.spinGap]),
  )
  const i7Counts = reads.every(r => r.up === 2 * r.down && r.down > 0)

  // ---------------- I3: the chain at B = 0 is the Bloch overlap ----------------
  let i3 = 0

  for (const [kx, ky] of [
    [0.3, 0],
    [1.1, -0.4],
    [0, 0.7],
  ] as const) {
    const ch = chain({ half: 3, qB: 0, ky: ky!, periodicKx: kx })
    const N = 8 * ch.n
    const Ck = overlapAt([kx!, ky!, 0, 0])

    for (let e = 0; e < 8; e++) {
      // b_x = e_e e^(i kx x), x = xi - half
      for (let xi = 0; xi < ch.n; xi++) {
        for (let a = 0; a < 8; a++) {
          let sr = 0
          let si = 0

          for (let yi = 0; yi < ch.n; yi++) {
            const ph = kx! * (yi - ch.half)
            const cr = ch.re[(xi * 8 + a) * N + yi * 8 + e]!
            const ci = ch.im[(xi * 8 + a) * N + yi * 8 + e]!

            sr += cr * Math.cos(ph) - ci * Math.sin(ph)
            si += cr * Math.sin(ph) + ci * Math.cos(ph)
          }

          const ph = kx! * (xi - ch.half)
          const wr =
            Ck.re[a * 8 + e]! * Math.cos(ph) - Ck.im[a * 8 + e]! * Math.sin(ph)
          const wi =
            Ck.re[a * 8 + e]! * Math.sin(ph) + Ck.im[a * 8 + e]! * Math.cos(ph)

          i3 = Math.max(i3, Math.abs(sr - wr), Math.abs(si - wi))
        }
      }
    }
  }

  // ---------------- I4: the coordinate cycle in the field has the law's phases ----------------
  let i4 = 0

  {
    const ch = chain({ half: 10, qB: FIELDS[0]!, ky: 0 })
    const N = 8 * ch.n
    const H = chainSquare(ch)
    const mus = Array.from(hermitianEigenRows(N, H.re, H.im).values)

    for (const { m } of [MASSES[2]!, { name: 'E-SPN-0183', m: m0 }]) {
      const cyc = coordinateCycle(ch, memberU(m))
      const ev = complexEigenvalues({ re: cyc.re, im: cyc.im, n: cyc.dim })
      const got = ev.re
        .map((x, i) => Math.abs(wrap(Math.atan2(ev.im[i]!, x) - Math.PI)))
        .sort((a, b) => a - b)
      const want = mus
        .flatMap(mu => {
          const E = lawPhase(Math.max(0, mu), m)

          return [E, E]
        })
        .sort((a, b) => a - b)

      i4 = Math.max(i4, ...got.map((x, i) => Math.abs(x - want[i]!)))
    }
  }

  log('witnesses')

  // ---------------- c_D ----------------
  const X1 = darwinRatio([0.1, 0, 0]).X
  const X2 = darwinRatio([0.05, 0, 0]).X
  const cD = (4 * X2 - X1) / 3

  // ---------------- the prediction ----------------
  const k0 = table[table.length - 1]!
  const Eb8 = (4 * m0 - MEASURED.a8.E) / 2
  const Eb12 = (4 * m0 - MEASURED.a12.E) / 2
  const S12 =
    ((MEASURED.a12.Rstatic - MEASURED.a12.Rdarwin) * (2 * m0 - Eb12)) /
    ((8 / 3) * Eb12)
  const tanOver = Math.tan(m0) / m0
  const pred8 = kineticR(k0, Eb8, 0)
  const pred12 = kineticR(k0, Eb12, S12 * cD)
  const ex = {
    pred8: pred8 - tanOver,
    pred12: pred12 - tanOver,
    meas8: MEASURED.a8.Rstatic - tanOver,
    meas12: MEASURED.a12.Rdarwin - tanOver,
  }
  const off = (p: number, q: number): number =>
    Math.max(Math.abs(p / q), Math.abs(q / p))
  const within = (p: number, q: number): boolean =>
    Math.abs(p - q) <= BAND * Math.abs(q)
  const P8 = within(ex.pred8, ex.meas8)
  const P12 = within(ex.pred12, ex.meas12)
  const K8 = off(ex.pred8, ex.meas8) > KILL
  const K12 = off(ex.pred12, ex.meas12) > KILL

  // the control: continuum coefficients, Darwin-complete at S = 1: excess exactly 0
  const cont = { M1: m0, M2: m0, cube: 1 }
  const ctrl8 = kineticR(cont, Eb8, 1) - 1
  const C1 = !within(ctrl8, ex.meas8)

  // the sub-gates over the five masses (falling m: reverse order)
  const five = table.slice(0, MASSES.length)
  const devM4 = five.map(k => Math.abs(k.M4 / k.M2 - 1)).reverse()
  const devCF = cF
    .slice(0, MASSES.length)
    .map(c => Math.abs(c.cF - 1))
    .reverse()
  const subM4 = devM4[devM4.length - 1]! <= TOL.sub && nonIncreasing(devM4)
  const subCF = devCF[devCF.length - 1]! <= TOL.sub && nonIncreasing(devCF)

  const I1 = i1 <= TOL.i1
  const I2 = i2 <= TOL.i2
  const I3 = i3 <= TOL.i3
  const I4 = i4 <= TOL.i4
  const I5 = i5 <= TOL.i5
  const i6 = Math.max(...cF.map(c => Math.abs(c.spacing - 1)))
  const I6 = i6 <= TOL.i6
  const I7 = i7Gap <= TOL.i7 && i7Counts
  const I8 = Math.abs(cD - 1) <= TOL.i8
  const instrument = I1 && I2 && I3 && I4 && I5 && I6 && I7 && I8

  const status: Verdict['status'] =
    K8 && K12
      ? 'fail'
      : P8 && P12 && subM4 && subCF
        ? instrument && C1
          ? 'pass'
          : 'partial'
        : 'partial'

  const row = (k: Coefficients & { name: string }, i: number): string =>
    `${k.name} (m ${k.m.toFixed(6)}): M1 ${k.M1.toFixed(6)} M2 ${k.M2.toFixed(6)} M4 ${k.M4.toFixed(6)} M4/M2 ${(k.M4 / k.M2).toFixed(6)} (M2/M4)^3 ${k.cube.toFixed(6)} c_F ${cF[i]!.cF.toFixed(6)} (at qB ${FIELDS.join(', ')}: ${cF[i]!.perField.map(x => x.toFixed(6)).join(', ')}) g1 ${(2 * cF[i]!.cF).toFixed(6)}`

  const tableText = table.map(row).join('; ')

  log('done')

  return verdict({
    status,
    claim: `table: ${tableText}; c_D ${cD.toFixed(6)} (X at k 0.1, 0.05: ${X1.toFixed(6)}, ${X2.toFixed(6)}). Prediction at the measured member (tan m / m ${tanOver.toFixed(6)}): a_B 8 static R ${pred8.toFixed(4)} (E_b ${Eb8.toFixed(6)} a beat), excess ${ex.pred8.toFixed(4)} against the measured ${ex.meas8.toFixed(4)} (off by ${off(ex.pred8, ex.meas8).toFixed(2)}x); a_B 12 Darwin R ${pred12.toFixed(4)} (E_b ${Eb12.toFixed(6)}, S ${S12.toFixed(4)}), excess ${ex.pred12.toFixed(4)} against ${ex.meas12.toFixed(4)} (off by ${off(ex.pred12, ex.meas12).toFixed(2)}x). Gates: within 20% a_B 8 ${P8}, a_B 12 ${P12}; kill a_B 8 ${K8}, a_B 12 ${K12}; M4 sub-gate ${subM4} (|M4/M2 - 1| at pi/48 ${devM4[devM4.length - 1]!.toFixed(5)}), c_F sub-gate ${subCF} (|c_F - 1| at pi/48 ${devCF[devCF.length - 1]!.toExponential(2)}); control C1 ${C1} (continuum excess ${ctrl8.toExponential(2)}); instrument I1 ${I1} (${i1.toExponential(2)}) I2 ${I2} (${i2.toExponential(2)}) I3 ${I3} (${i3.toExponential(2)}) I4 ${I4} (${i4.toExponential(2)}) I5 ${I5} (${i5.toExponential(2)}) I6 ${I6} (${i6.toExponential(2)}) I7 ${I7} (gap ${i7Gap.toExponential(2)}, counts ${reads.map(r => `${r.up}+${r.down}`).join(', ')}) I8 ${I8}`,
    metrics: {
      pred8,
      pred12,
      excessPred8: ex.pred8,
      excessPred12: ex.pred12,
      excessMeas8: ex.meas8,
      excessMeas12: ex.meas12,
      off8: off(ex.pred8, ex.meas8),
      off12: off(ex.pred12, ex.meas12),
      S12,
      cD,
      M4overM2AtPi48: table[0]!.M4 / table[0]!.M2,
      cFAtPi48: cF[0]!.cF,
      cubeMeasuredMember: k0.cube,
      cFMeasuredMember: cF[cF.length - 1]!.cF,
      i1,
      i2,
      i3,
      i4,
      i5,
      i6,
      i7Gap,
      P8: flag(P8),
      P12: flag(P12),
      K8: flag(K8),
      K12: flag(K12),
      subM4: flag(subM4),
      subCF: flag(subCF),
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), continuumExcess8: ctrl8, instrument: flag(instrument) },
    notes: `L2. Working rule R* (decision 0006), spinor lift for the spin. Coefficients per beat with c^2 = 1/8. c_F is m-independent before the B -> 0 limit except through the law's acos. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
