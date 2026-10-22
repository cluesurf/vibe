// ONE MEMBER DRESSED BY AT MOST ONE HUSK PHOTON (item 0068 of roadmap/moving-matter, decision 015; code E-SPN-0201,
// free in the log and the registry when taken, recheck at merge). Item 0008 (the pair and the quantum light as one exact
// dynamics) closed OPEN: its kill needs the joint R to depart from the linear-response Darwin R by 25% of R - tan m / m
// (0.1026 at a_B 8, 0.0423 at a_B 12), about twice the whole Darwin shift, and the one piece estimated able to reach
// that is the member's own self-energy, which linear response leaves out. This file explores whether one-photon
// dressing could move one member's M2 / M1 that far.
//
// THE READ (decision 015 point 1; the model in code/measure/member-dressing). One member (m 0.427029, tan m / m
// 1.065572) and at most one non-gauge husk photon at fixed total K, on the light's box of the joint problem (side 72 at
// a_B 8's coupling, 108 at a_B 12's), q^2 = 24 pi alpha', alpha' = 1 / (mu a_B), mu = tan m (0.2747 and 0.1831). The
// lowest level of the cut Hamiltonian at K = 0 (O_h) is the dressed M1; on the x axis (C4v) at K 0.04, 0.02, 0.01 the
// curvature a by three-level Richardson of (E(K) - E(0)) / K^2 gives M2 / M1 = c*^2 / (2 a M1), c*^2 = 1/2 a cycle.
// D(a_B) = dressed M2 / M1 - tan m / m. The third K step (0.01) is added to 0001's two: with two the bare read misses
// tan m / m by 6.0e-7, with three by 9.6e-11 (tmp/dress-probe.log), which control C1 needs.
//
// GATES (decision 015 point 2, fixed 2026-10-09 before any run; status: UNREACHABLE pass, REACHABLE fail, OPEN open):
//   UNREACHABLE  |D| < 0.1026 at a_B 8 and < 0.0423 at a_B 12, with Z >= 0.8 at both
//   REACHABLE    |D| at or above either with Z >= 0.8
//   OPEN         Z < 0.8, or D moves by more than 25% of its threshold between the box and 3/4 of it (54, 81), or any
//                control fails. D is also reported against gate A's 0.05 band, as information.
// CONTROLS (decision 015 point 3), each to 1e-10:
//   C1 coupling 0 gives tan m / m (the read itself, at side 54)
//   C2 a gauge transform of the light leaves the dressed level: the gauge vector's second-order shift through the
//      member's own vertex and seagull, paths k and -k, is 0 over its absolute scale, at every box momentum; and every
//      non-gauge mode is orthogonal to the gauge vector
//   C3 E(K) = E(-K) at K 0.04 (read independently)
//   C4 the residual |H psi - E psi| / |psi| of every level
//   C5 every dressed level lies below its member-plus-photon threshold
// INSTRUMENTS: the O_h and C4v sums equal the unreduced sum (side 12, a_B 8's coupling), the 9 mode vectors orthonormal
// (1e-10). Reported, not gated: the bare level's second-order seagull against the rest energy, and the vacuum variance
// of one link's Peierls phase, q^2 <A~_h^2> / g_h, which says whether a second-order cut in q can hold at all.
//
// LIMITS: the reduced space is at most 8 states a box momentum (1.3e6 at side 108 on C4v, far under 1e9); a read is
// minutes. The cut keeps the bare level, every one-photon state and q^2 terms (paramagnetic and seagull); photon-photon
// scattering is outside it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  dressedLevel,
  dressingTerms,
  ratioFromLevels,
  type Sector,
  type Terms,
} from '@/code/measure/member-dressing'

const M = 0.427029
const MU = Math.tan(M)
const TAN_OVER = MU / M
const STEPS = [0.04, 0.02, 0.01] as const
const Z_MIN = 0.8
const DRIFT = 0.25
const BAND_A = 0.05
const TOL = 1e-10

export type DressingPoint = { aB: number; L: number; excess: number }

// E-SPN-0200's excess R_full - tan m / m (log.md, builder 0001 verdict); the threshold is 25% of it
export const POINTS: readonly DressingPoint[] = [
  { aB: 8, L: 72, excess: 0.41023 },
  { aB: 12, L: 108, excess: 0.16916 },
]

export const chargeOf = (aB: number): number =>
  Math.sqrt((24 * Math.PI) / (MU * aB))

export type BoxRead = {
  L: number
  q: number
  M1: number
  R: number
  D: number
  Z: number
  residual: number
  gauge: number
  gaugeOrthogonality: number
  orthonormality: number
  below: boolean
  symmetry: number
  seagull: number
  theta2: number
  levels: number[]
  E0: number
  thresholds: number[]
  seconds: number
}

const log = (s: string): void => {
  console.error(`${new Date().toISOString()} ${s}`)
}

export function readBox(L: number, q: number): BoxRead {
  const t0 = Date.now()
  const at = (K: number, sector: Sector): { t: Terms; E: number; Z: number; residual: number; below: boolean } => {
    const t = dressingTerms({ m: M, q, K: [K, 0, 0], L, sector })
    const l = dressedLevel(t)

    log(
      `L ${L} q ${q.toFixed(4)} K ${K}: E ${l.E} Z ${l.Z.toFixed(6)} residual ${l.residual.toExponential(2)} threshold ${t.threshold} seagull ${t.seagullDW.toFixed(6)} + ${t.seagull2.toFixed(6)} gauge ${t.gauge.toExponential(2)} theta2 ${t.theta2.toFixed(4)} orbits ${t.orbits}`,
    )

    return { t, E: l.E, Z: l.Z, residual: l.residual, below: l.belowThreshold }
  }
  const zero = at(0, 'oh')
  const steps = STEPS.map(K => at(K, 'c4v'))
  const back = at(-STEPS[0], 'c4v')
  const all = [zero, ...steps, back]
  const { R } = ratioFromLevels(
    zero.E,
    STEPS,
    steps.map(s => s.E),
  )

  return {
    L,
    q,
    M1: zero.E,
    R,
    D: R - TAN_OVER,
    Z: Math.min(...all.map(x => x.Z)),
    residual: Math.max(...all.map(x => x.residual)),
    gauge: Math.max(...all.map(x => x.t.gauge)),
    gaugeOrthogonality: Math.max(...all.map(x => x.t.gaugeOrthogonality)),
    orthonormality: Math.max(...all.map(x => x.t.orthonormality)),
    below: all.every(x => x.below),
    symmetry: Math.abs(steps[0]!.E - back.E),
    seagull: zero.t.seagullDW + zero.t.seagull2,
    theta2: zero.t.theta2,
    levels: all.map(x => x.E),
    E0: zero.t.E0,
    thresholds: all.map(x => x.t.threshold),
    seconds: (Date.now() - t0) / 1000,
  }
}

export function memberDressingRun(): Verdict {
  const t0 = Date.now()
  // instrument: the reductions against the unreduced sum
  const red = (K: number, sector: Sector): number => {
    const a = dressedLevel(dressingTerms({ m: M, q: chargeOf(8), K: [K, 0, 0], L: 12, sector })).E
    const b = dressedLevel(dressingTerms({ m: M, q: chargeOf(8), K: [K, 0, 0], L: 12, sector: 'none' })).E

    return Math.abs(a - b)
  }
  const reduction = Math.max(red(0, 'oh'), red(STEPS[0], 'c4v'))

  log(`reduction ${reduction.toExponential(2)}`)

  // C1: coupling 0
  const off = readBox(54, 0)
  const C1 = Math.abs(off.R - TAN_OVER) <= TOL

  const reads = POINTS.map(p => {
    const q = chargeOf(p.aB)
    const main = readBox(p.L, q)
    const small = readBox((3 * p.L) / 4, q)
    const threshold = 0.25 * p.excess

    return { p, q, main, small, threshold }
  })

  const controls = reads.flatMap(r => [r.main, r.small])
  const C2 = controls.every(b => b.gauge <= TOL && b.gaugeOrthogonality <= TOL)
  const C3 = controls.every(b => b.symmetry <= TOL)
  const C4 = controls.every(b => b.residual <= TOL)
  const C5 = controls.every(b => b.below)
  const I1 = reduction <= TOL
  const I2 = controls.every(b => b.orthonormality <= TOL)
  const controlsHold = C1 && C2 && C3 && C4 && C5
  const zOk = reads.every(r => r.main.Z >= Z_MIN)
  const drift = reads.map(r => Math.abs(r.main.D - r.small.D))
  const driftOk = reads.every((r, i) => drift[i]! <= DRIFT * r.threshold)
  const reach = reads.some(r => Math.abs(r.main.D) >= r.threshold)
  const outcome =
    !zOk || !driftOk || !controlsHold
      ? 'OPEN'
      : reach
        ? 'REACHABLE'
        : 'UNREACHABLE'
  const status: Verdict['status'] =
    outcome === 'OPEN' ? 'open' : outcome === 'REACHABLE' ? 'fail' : 'pass'
  const e = (x: number): string => x.toExponential(2)
  const box = (b: BoxRead): string =>
    `side ${b.L}: M1 ${b.M1.toFixed(6)} (bare ${b.E0.toFixed(6)}), R ${b.R.toFixed(6)}, D ${b.D.toFixed(6)}, Z ${b.Z.toFixed(4)}, seagull ${b.seagull.toFixed(4)}, link phase variance ${b.theta2.toFixed(4)}, levels ${b.levels.map(x => x.toFixed(9)).join('/')}, thresholds ${b.thresholds.map(x => x.toFixed(6)).join('/')}`

  log('done')

  return verdict({
    status,
    claim: `${outcome}. ${reads
      .map(
        (r, i) =>
          `a_B ${r.p.aB} (alpha' ${(1 / (MU * r.p.aB)).toFixed(4)}, q ${r.q.toFixed(4)}, threshold ${r.threshold.toFixed(4)}): ${box(r.main)}; ${box(r.small)}; drift ${drift[i]!.toFixed(6)} (limit ${(DRIFT * r.threshold).toFixed(4)}); |D| against gate A's ${BAND_A}: ${Math.abs(r.main.D) < BAND_A ? 'inside' : 'outside'}`,
      )
      .join('. ')}. Gates: Z ${zOk}, drift ${driftOk}, reach ${reach}. Controls: C1 ${C1} (R at q 0 off by ${e(off.R - TAN_OVER)}), C2 ${C2} (gauge ${e(Math.max(...controls.map(b => b.gauge)))}, orthogonality ${e(Math.max(...controls.map(b => b.gaugeOrthogonality)))}), C3 ${C3} (${e(Math.max(...controls.map(b => b.symmetry)))}), C4 ${C4} (${e(Math.max(...controls.map(b => b.residual)))}), C5 ${C5}. Instruments: I1 ${I1} (${e(reduction)}), I2 ${I2} (${e(Math.max(...controls.map(b => b.orthonormality)))}).`,
    metrics: {
      D8: reads[0]!.main.D,
      D12: reads[1]!.main.D,
      Z8: reads[0]!.main.Z,
      Z12: reads[1]!.main.Z,
      drift8: drift[0]!,
      drift12: drift[1]!,
      seagull8: reads[0]!.main.seagull,
      seagull12: reads[1]!.main.seagull,
      theta2_8: reads[0]!.main.theta2,
      theta2_12: reads[1]!.main.theta2,
      controls: [C1, C2, C3, C4, C5].filter(Boolean).length,
      instruments: [I1, I2].filter(Boolean).length,
    },
    notes: `L2. One member, at most one photon, q^2 terms; the one-photon cut is exact within itself (secular equation of the star). ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'spin/member-dressing',
  code: 'E-SPN-0201',
  title:
    "One member dressed by one husk photon: explores whether the R* member's one-photon self-energy at a_B 8 and 12's couplings moves its M2 / M1 far enough from tan m / m to reach item 0008's kill",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return memberDressingRun()
  },
})
