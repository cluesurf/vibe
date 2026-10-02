// ARE COMPOSITE SOURCES BAND-MIXED? (E-GRV-0152, OPEN-GRV-02, route H2c in ledger H "the equivalence principle"). Under
// the register count gravity acts as two fields, one per band: a hole feels only its own band's sector count
// (E-GRV-0147), so a band-A hole at rest sources (sigma_S, sigma_D) = (1, 0), a band-B hole (0, 1), and a hole of the
// other band hardly falls toward it (at most 0.082 of the like pull). As a lapse both bands fall alike, and at rest the
// principle is R = 1 (E-GRV-0149). The route H2c: every physical source is a composite, and if composites carry equal S
// and D weight the two fields average to one on any real source, so the failure would belong to bare holes only. The
// row's test: read the S and D weights of the register meson (E-SPN-0162) and the light pair (E-SPN-0173), then the
// cross-band pull toward each. Kill: the composite band weights differ by more than 10%, or the cross-band pull toward a
// composite stays under 0.5.
//
// WHAT IS RUN. (1) The two composites' levels, rebuilt with their own engines (code/measure/register-meson, register-
// coulomb) on balls smaller than their gate runs (the machine's budget, below). (2) Their sector counts at each beat's
// stage, read with exact projectors (code/measure/register-band-weights, new): sigma_S, the pair's weight in Q_S on
// either member at the start of beat 1, and sigma_D, its weight in the carried partner sector T D at the start of beat
// 2, the two counts E-GRV-0146's piece is sourced by. (3) The pull of a band-A and a band-B hole toward a static source
// with those counts, on E-GRV-0147's slab (side 40 by 2, r 10, sigma 3, 8 cycles), with the same engine and the same
// reading (packetRun, the mean offset against the free packet).
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE PROJECTORS. A member in W is S a + T D b; its S part is S (a + C b) and its T D part T D (b + C^dag a), C the
//    overlap of register-meson. On the pair blocks (A = S S, B = S TD, X = TD S, D = TD TD) Q_S on member 1 keeps A + C1 X
//    and B + C1 D, Q_D on member 1 keeps X + C1^dag A and D + C1^dag B, and member 2 alike with C2 (register-band-
//    weights). These are orthogonal projectors in the Gram metric up to the ball's edge. The engines' beats are functions
//    of them: beat 1 = 1 + (u - 1)(Q_S1 + Q_S2) + beta1(V) Q_S1 Q_S2, beat 2 the same with conj u, Q_D and beta2; the light
//    pair's cycle adds the S D and D S cross pieces after beat 2. So the counts are read on the level itself (sigma_S)
//    and on the level after beat 1 built from the projectors (sigma_D). The counts of a pair of HOLES are those of its
//    missing orbitals, so the hole composite with these orbitals carries the same (sigma_S, sigma_D); the reading does not
//    depend on whether the composite is read as members or as holes (only the sign of the piece does, E-GRV-0146).
// 2. WHY THE COMPOSITES SHOULD BE BAND-PURE. A pair level is an eigenvector of the cycle at one phase. Free, the pair
//    bands are S S near 2M (both members band A), D D near -2M (both band B), and S D within the S D width of 0 (E-SPN-
//    0162 point 2). The meson's string acts on S S and D D only, and its level sits at 1.979, in the S S well; the light
//    pair's level at 2M - E_b, below the S S threshold. Each member is then a band-A state spread over the momenta of the
//    bound wave, with s = 1 at rest falling as it moves (E-GRV-0147 G2), and with d = 1 - s for a band state. So sigma_S
//    is near 2 and sigma_D is the members' moving share plus whatever the binding mixes in, far from equal. PREDICTED:
//    sigma_D / sigma_S under 0.1 for both. The D D level (the meson's mirror, at -E_L) is the same with S and D exchanged.
// 3. THE CROSS-BAND PULL. A band-A hole at rest takes the angle phi sigma_S on its S unit and a band-B hole phi sigma_D on
//    its D unit (E-GRV-0147 point 5), so to first order the pulls are P_A = sigma_S L + sigma_D X and P_B = sigma_D L +
//    sigma_S X, L the like pull of a unit source (2.174e-2) and X the cross pull (1.2e-3 at cycle 8). PREDICTED: the
//    cross-band ratio min(P_A, P_B) / max(P_A, P_B) under 0.2 for both composites, and near 1 for a band-mixed (1, 1)
//    source.
//
// PROBES BEFORE THE GATES, disclosed (tmp/bm-probe1.ts, .log; no gate written before them, none moved after).
//  The projector beats reproduce the meson cycle (radius 4, generic start) to 1.0e-15 and the light pair's vector cycle
//  with its cross pieces (radius 5) to 8.3e-16. Speeds on this shared machine: meson radius 7, 1.23 s a cycle, radius 9
//  3.30 s; light pair radius 14, 2.81 s, radius 16, 4.47 s. So the gate runs cannot rebuild E-SPN-0162's radius-9 level
//  with filters 64, 256, 1024 or E-SPN-0173's radius-16 a_B 3.5 level with 128, 512, 2048 in the half hour a run is
//  allowed. The meson on radius 7 (filters 64, 128 at 2.005 then the read phase): E 1.970, 1.931, residual 9.0e-2,
//  3.2e-2; sigma_S 1.830, 1.847, sigma_D 0.128, 0.119 (each member 0.923 and 0.060); coordinate block shares 0.852,
//  0.071, 0.071, 0.007. The light pair at a_B 3 on radius 10 (filter 128): E 1.5714, residual 3.4e-2, sigma_S 1.969,
//  sigma_D 0.036, the projector check 5e-6 (the ball's edge). These set the plan below: the meson on radius 7, the light
//  pair at E-SPN-0173's stronger point a_B 3 (its clean level, residual 1.25e-4 there) on radius 12, and gates loose
//  enough for levels with percent residuals, which the 10% question allows.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  H1 (the route): for both composites the band weights agree within 10%, |sigma_S - sigma_D| <= 0.1 (sigma_S +
//     sigma_D) / 2, AND the cross-band pull toward each is at least 0.5 of its like-band pull. PREDICTED: FAILS on both
//     parts (sigma_D / sigma_S about 0.065 for the meson and 0.02 for the light pair; cross ratios under 0.2).
//  P1 (the falsifier, the row's kill): for either composite the weights differ by more than 10%, or the cross ratio is
//     under 0.5. PREDICTED: FIRES.
//  I1 (instrument): the projector-built cycle equals each engine's cycle on a generic Weyl start within 1e-12; on each
//     level the projector check |<psi|Q psi> - <Q psi|Q psi>| is at most 1e-5 of the norm (the ball's edge); each level's
//     residual is at most 5e-2, and its sigma_S and sigma_D move by at most 0.02 between the last two filters; every
//     slab packet keeps its norm within 1e-10, and the free packets' drift is under 0.01 of the like pull.
//  C1 (control: the weight reader can read the other band): the meson engine's D D start (the meson's profile in the D
//     block), filtered 64 cycles at minus the meson's level, reads sigma_D > 1.1 sigma_S.
//  C2 (control: the pull reader can read the outcome that saves the route): a band-mixed source (1, 1) gives a cross
//     ratio of at least 0.5, while a band-A hole's source (1, 0) gives under 0.2 (E-GRV-0147's two fields).
//  READ, gating nothing: each member's s and d, sigma_S + sigma_D against 2, the levels' phases against E-SPN-0162's
//  1.978945 and E-SPN-0173's 1.568, the pulls against the first-order form of point 3.
// VERDICT: fail if P1 fires and I1, C1, C2 hold (the route closed); partial if I1, C1 or C2 fails (the reading not
//  trusted); pass if H1 holds with I1, C1 and C2.
//
// WHAT THIS CAN AND CANNOT SHOW. It reads the two composites the row names, as levels of their own engines on smaller
// balls, in the test-particle limit of the pull (a static source with the composite's counts, one hole probe), as
// E-GRV-0147 did. It can close the route for these composites: a band-pure composite cannot average the two fields. It
// cannot rule out some other composite with equal weights (an S D pair, one member of each band, would carry about (1,
// 1)), and it says nothing about the lapse form of gravity (E-GRV-0149), where both bands already fall alike.
//
// Depth L2 (levels of two-body quantum walks in floats, read with exact projectors; the slab kernel is the depth
// register's float stand-in). DETERMINISM: no random numbers; placed starts, filtered levels, Weyl values. NOTHING
// MOVES: the pieces act inside a dock and the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { wrap } from '@/code/measure/dock-mixer'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import { huskGreenTable } from '@/code/measure/husk-meson'
import {
  BLOCK,
  clonePair,
  filterPair,
  memberCycle,
  newPair,
  normalizePair,
  pairCycle,
  pairEngine,
  readLevel,
  relBall,
  sStart,
  type PairEngine,
  type PairState,
} from '@/code/measure/register-meson'
import {
  coulombCounts,
  coulombCycle,
  coulombEngine,
  coulombFilter,
  coulombRead,
  crossPiece,
  huskRelBall,
  hydrogenStart,
} from '@/code/measure/register-coulomb'
import {
  beatFromProjectors,
  sectorWeights,
  type SectorWeights,
} from '@/code/measure/register-band-weights'
import {
  columnKernel,
  oneTorus,
  packetRun,
} from '@/code/measure/register-count'
import { sectorBases } from '@/code/measure/register-sea'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const MESON_LIGHT: readonly [number, number] = [-1, 4]
const MESON_STRING: readonly [number, number] = [-9, 6]
const MESON_CAP = 8
const MESON_GUESS = 2.005
const ELL = 2.5
const PAIR_LIGHT: readonly [number, number] = [-5, 1]
const PAIR_UNIT: readonly [number, number] = [11, 5]
const HOLE_LIGHT: readonly [number, number] = [-1, 4]
const HOLE_STRING: readonly [number, number] = [-2, 1]
const EQUAL = 0.1
const CROSS = 0.5
const PURE_CROSS = 0.2
const WITNESS = 1e-12
const PROJECTOR = 1e-5
const RESIDUAL = 5e-2
const STABLE = 0.02
const MIRROR = 1.1
const EXACT = 1e-10
const FREE_LIMIT = 1e-2

export type BandMixedPlan = {
  mesonRadius: number
  mesonFilters: readonly number[]
  mirrorFilter: number
  pairAB: number
  pairRadius: number
  pairFilters: readonly number[]
  slabSide: number
  separation: number
  sigma: number
  cycles: number
}

export const GATE_PLAN: BandMixedPlan = {
  mesonRadius: 7,
  mesonFilters: [64, 192],
  mirrorFilter: 64,
  pairAB: 3,
  pairRadius: 12,
  pairFilters: [128, 192],
  slabSide: 40,
  separation: 10,
  sigma: 3,
  cycles: 8,
}

const flag = (b: boolean): number => (b ? 1 : 0)
const unitValue = (a: number): [number, number] => [
  Math.cos(a),
  Math.sin(a),
]

function weylFill(s: PairState): void {
  let w = 0.5

  for (let k = 0; k < s.re.length; k++) {
    w = (w + 0.6180339887498949) % 1
    s.re[k] = w - 0.5
    w = (w + 0.4142135623730951) % 1
    s.im[k] = w - 0.5
  }
}

function maxGap(a: PairState, b: PairState): number {
  let m = 0
  let n = 0

  for (let i = 0; i < a.re.length; i++) {
    m = Math.max(
      m,
      Math.abs(a.re[i]! - b.re[i]!),
      Math.abs(a.im[i]! - b.im[i]!),
    )
    n = Math.max(n, Math.abs(a.re[i]!), Math.abs(a.im[i]!))
  }

  return m / n
}

type LevelReading = {
  phase: number
  residual: number
  phases: number[]
  residuals: number[]
  weights: SectorWeights
  previous: SectorWeights
}

// filter a start through the stages, reading the level and its sector counts after each
function buildLevel(input: {
  e: PairEngine
  start: PairState
  guess: number
  filters: readonly number[]
  filter: (
    e: PairEngine,
    v: PairState,
    phase: number,
    S: number,
  ) => PairState
  read: (
    e: PairEngine,
    v: PairState,
  ) => { phase: number; residual: number }
  log: (what: string) => void
  name: string
}): LevelReading {
  const { e, filter, read, log, name } = input
  const phases: number[] = []
  const residuals: number[] = []
  const weights: SectorWeights[] = []

  let v = input.start
  let phase = input.guess

  for (const S of input.filters) {
    v = filter(e, v, phase, S)
    normalizePair(e, v)

    const r = read(e, v)

    phase = r.phase
    phases.push(r.phase)
    residuals.push(r.residual)
    weights.push(sectorWeights(e, v, beatFromProjectors(e, v, 1)))
    log(
      `${name} S ${S}: E ${r.phase.toFixed(6)} residual ${r.residual.toExponential(2)} sigma_S ${weights[weights.length - 1]!.sigmaS.toFixed(5)} sigma_D ${weights[weights.length - 1]!.sigmaD.toFixed(5)}`,
    )
  }

  return {
    phase,
    residual: residuals[residuals.length - 1]!,
    phases,
    residuals,
    weights: weights[weights.length - 1]!,
    previous: weights[Math.max(0, weights.length - 2)]!,
  }
}

export default experiment({
  id: 'gravity/band-mixed-source',
  code: 'E-GRV-0152',
  title: 'are composite gravity sources band-mixed (route H2c)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return bandMixedRun(GATE_PLAN)
  },
})

export function bandMixedRun(plan: BandMixedPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  // ---------------- the meson (E-SPN-0162's engine) ----------------
  const thM = unitAngle(ringUnit(MESON_LIGHT[0], MESON_LIGHT[1]))
  const uM = unitValue(thM)
  const tau = unitAngle(ringUnit(MESON_STRING[0], MESON_STRING[1]))
  const mesonParams = { u: uM, tau, cap: MESON_CAP, K: [0, 0, 0, 0] }

  // I1 witness: the projector beats against the engine's cycle
  const witnessMeson = (() => {
    const ball = relBall(4)
    const e = pairEngine(ball, mesonParams)
    const s = newPair(ball)

    weylFill(s)

    const a = clonePair(s)

    pairCycle(e, a)

    return maxGap(
      a,
      beatFromProjectors(e, beatFromProjectors(e, s, 1), 2),
    )
  })()

  const mBall = relBall(plan.mesonRadius)
  const mE = pairEngine(mBall, mesonParams)
  const mStart = sStart(mBall, ELL)

  normalizePair(mE, mStart)

  const meson = buildLevel({
    e: mE,
    start: mStart,
    guess: MESON_GUESS,
    filters: plan.mesonFilters,
    filter: filterPair,
    read: readLevel,
    log,
    name: 'meson',
  })

  // C1: the D D start, the meson's profile in the D block, filtered at minus the level
  const dStart = newPair(mBall)

  for (let i = 0; i < mBall.points.length; i++) {
    for (let k = 0; k < 64; k++) {
      dStart.re[i * 256 + BLOCK.D + k] =
        mStart.re[i * 256 + BLOCK.A + k]!
    }
  }

  normalizePair(mE, dStart)

  const mirror = buildLevel({
    e: mE,
    start: dStart,
    guess: -meson.phase,
    filters: [plan.mirrorFilter],
    filter: filterPair,
    read: readLevel,
    log,
    name: 'mirror',
  })
  const C1 = mirror.weights.sigmaD > MIRROR * mirror.weights.sigmaS

  // ---------------- the light pair (E-SPN-0173's engine, the vector form) ----------------
  const th0 = unitAngle(ringUnit(PAIR_LIGHT[0], PAIR_LIGHT[1]))
  const uP = unitValue(th0)
  const M0 = wrap(th0 - Math.PI)
  const theta = unitAngle(ringUnit(PAIR_UNIT[0], PAIR_UNIT[1]))

  const phasesOf = (K: readonly number[]): number[] => {
    const c = memberCycle(uP, K)
    const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })

    return ev.re.map((x, i) => Math.atan2(ev.im[i]!, x))
  }

  const sEps = (k: number): number =>
    phasesOf([k, 0, 0, 0])
      .map(x => wrap(x - Math.PI))
      .reduce((b, x) => (Math.abs(x - M0) < Math.abs(b - M0) ? x : b))
  const aMember =
    (4 * ((sEps(0.01) - M0) / 0.01 ** 2) -
      (sEps(0.02) - M0) / 0.02 ** 2) /
    3
  const mu = 0.5 / (2 * aMember) / 2
  const G0 = infiniteGreenZero('husk', 64).value
  const table = huskGreenTable(128, 16, G0)
  const alpha = (24 * Math.PI) / (mu * plan.pairAB)
  const EbContinuum = (mu * (alpha / (24 * Math.PI)) ** 2) / 2

  const witnessPair = (() => {
    const ball = huskRelBall(5)
    const e = coulombEngine(
      ball,
      uP,
      [0, 0, 0, 0],
      coulombCounts(ball, table, alpha, theta),
      'vector',
    )
    const s = newPair(ball)

    weylFill(s)

    const a = clonePair(s)

    coulombCycle(e, a)

    const b = beatFromProjectors(e, beatFromProjectors(e, s, 1), 2)

    crossPiece(e, b, 'SD')
    crossPiece(e, b, 'DS')

    return maxGap(a, b)
  })()

  const pBall = huskRelBall(plan.pairRadius)
  const pE = coulombEngine(
    pBall,
    uP,
    [0, 0, 0, 0],
    coulombCounts(pBall, table, alpha, theta),
    'vector',
  )
  const pStart = hydrogenStart(pBall, plan.pairAB)

  normalizePair(pE, pStart)

  const light = buildLevel({
    e: pE,
    start: pStart,
    guess: 2 * M0 - EbContinuum,
    filters: plan.pairFilters,
    filter: (_e, v, ph, S) => coulombFilter(pE, v, ph, S),
    read: (_e, v) => coulombRead(pE, v),
    log,
    name: 'light pair',
  })

  // ---------------- the pulls on E-GRV-0147's slab ----------------
  const th = unitAngle(ringUnit(HOLE_LIGHT[0], HOLE_LIGHT[1]))
  const thG = -unitAngle(ringUnit(HOLE_STRING[0], HOLE_STRING[1]))
  const o = oneTorus(plan.slabSide, 2)
  const { column: k } = columnKernel(plan.slabSide)
  const bases = sectorBases()
  const run = (
    band: 'A' | 'B',
    source: readonly [number, number],
    sign: number,
  ): { x: number[]; drift: number } =>
    packetRun({
      o,
      band,
      angleS: Float64Array.from(
        o.column,
        c => sign * thG * k[c]! * source[0],
      ),
      angleD: Float64Array.from(
        o.column,
        c => -sign * thG * k[c]! * source[1],
      ),
      r: plan.separation,
      sigma: plan.sigma,
      cycles: plan.cycles,
      theta: th,
      bases,
    })
  const free = { A: run('A', [0, 0], 0), B: run('B', [0, 0], 0) }

  const pullOf = (
    source: readonly [number, number],
  ): { A: number; B: number; ratio: number; drift: number } => {
    const out = (['A', 'B'] as const).map(band => {
      const r = run(band, source, 1)
      const f = free[band].x

      return {
        pull: -(r.x[r.x.length - 1]! - f[f.length - 1]!),
        drift: r.drift,
      }
    })
    const [A, B] = [out[0]!.pull, out[1]!.pull]

    log(
      `pull toward (${source[0].toFixed(4)}, ${source[1].toFixed(4)}): A ${A.toExponential(4)} B ${B.toExponential(4)}`,
    )

    return {
      A,
      B,
      ratio: Math.min(A, B) / Math.max(A, B),
      drift: Math.max(out[0]!.drift, out[1]!.drift),
    }
  }

  const pure = pullOf([1, 0])
  const mixed = pullOf([1, 1])
  const mesonPull = pullOf([meson.weights.sigmaS, meson.weights.sigmaD])
  const lightPull = pullOf([light.weights.sigmaS, light.weights.sigmaD])

  // ---------------- gates ----------------
  const unequal = (w: SectorWeights): number =>
    Math.abs(w.sigmaS - w.sigmaD) / ((w.sigmaS + w.sigmaD) / 2)
  const equalMeson = unequal(meson.weights) <= EQUAL
  const equalLight = unequal(light.weights) <= EQUAL
  const crossMeson = mesonPull.ratio >= CROSS
  const crossLight = lightPull.ratio >= CROSS
  const H1 = equalMeson && equalLight && crossMeson && crossLight
  const P1 = !H1
  const C2 = mixed.ratio >= CROSS && pure.ratio < PURE_CROSS
  const moved = (l: LevelReading): number =>
    Math.max(
      Math.abs(l.weights.sigmaS - l.previous.sigmaS),
      Math.abs(l.weights.sigmaD - l.previous.sigmaD),
    )
  const drifts = [
    free.A.drift,
    free.B.drift,
    pure.drift,
    mixed.drift,
    mesonPull.drift,
    lightPull.drift,
  ]
  const freeWorst = Math.max(
    Math.abs(free.A.x[free.A.x.length - 1]!),
    Math.abs(free.B.x[free.B.x.length - 1]!),
  )
  const I1 =
    witnessMeson <= WITNESS &&
    witnessPair <= WITNESS &&
    Math.max(
      meson.weights.projector,
      light.weights.projector,
      mirror.weights.projector,
    ) <= PROJECTOR &&
    meson.residual <= RESIDUAL &&
    light.residual <= RESIDUAL &&
    moved(meson) <= STABLE &&
    moved(light) <= STABLE &&
    drifts.every(d => d <= EXACT) &&
    freeWorst <= FREE_LIMIT * pure.A

  const status = !I1 || !C1 || !C2 ? 'partial' : P1 ? 'fail' : 'pass'

  // the first-order form of point 3 from the pure source's like and cross pulls
  const firstOrder = (w: SectorWeights): { A: number; B: number } => ({
    A: w.sigmaS * pure.A + w.sigmaD * pure.B,
    B: w.sigmaD * pure.A + w.sigmaS * pure.B,
  })
  const foMeson = firstOrder(meson.weights)
  const foLight = firstOrder(light.weights)
  const e3 = (v: number): string => v.toExponential(3)
  const f5 = (v: number): string => v.toFixed(5)
  const wText = (w: SectorWeights): string =>
    `sigma_S ${f5(w.sigmaS)} (members ${f5(w.s[0])}, ${f5(w.s[1])}), sigma_D ${f5(w.sigmaD)} (${f5(w.d[0])}, ${f5(w.d[1])}), sum ${f5(w.sigmaS + w.sigmaD)}, D over S ${f5(w.sigmaD / w.sigmaS)}, unequal by ${f5(unequal(w))}, projector check ${e3(w.projector)}`

  return verdict({
    status,
    claim: `H1 ${H1}, P1 ${P1}: meson (radius ${plan.mesonRadius}, E ${meson.phase.toFixed(6)}, residual ${e3(meson.residual)}) ${wText(meson.weights)}, cross ratio ${f5(mesonPull.ratio)} (A ${e3(mesonPull.A)}, B ${e3(mesonPull.B)}); light pair (a_B ${plan.pairAB}, radius ${plan.pairRadius}, E ${light.phase.toFixed(6)}, residual ${e3(light.residual)}) ${wText(light.weights)}, cross ratio ${f5(lightPull.ratio)} (A ${e3(lightPull.A)}, B ${e3(lightPull.B)}); I1 ${I1} (witness ${e3(witnessMeson)}, ${e3(witnessPair)}; weights moved ${e3(moved(meson))}, ${e3(moved(light))}; norm drift ${e3(Math.max(...drifts))}; free ${e3(freeWorst)}); C1 ${C1} (the D D start: ${wText(mirror.weights)}); C2 ${C2} (mixed (1, 1) ratio ${f5(mixed.ratio)}, A ${e3(mixed.A)} B ${e3(mixed.B)}; pure (1, 0) ratio ${f5(pure.ratio)}, A ${e3(pure.A)} B ${e3(pure.B)})`,
    metrics: {
      H1: flag(H1),
      P1: flag(P1),
      I1: flag(I1),
      C1: flag(C1),
      C2: flag(C2),
      equalMeson: flag(equalMeson),
      equalLight: flag(equalLight),
      crossMeson: flag(crossMeson),
      crossLight: flag(crossLight),
      mesonPhase: meson.phase,
      mesonResidual: meson.residual,
      mesonSigmaS: meson.weights.sigmaS,
      mesonSigmaD: meson.weights.sigmaD,
      mesonUnequal: unequal(meson.weights),
      mesonCrossRatio: mesonPull.ratio,
      mesonPullA: mesonPull.A,
      mesonPullB: mesonPull.B,
      mesonFirstOrderA: foMeson.A,
      mesonFirstOrderB: foMeson.B,
      lightPhase: light.phase,
      lightResidual: light.residual,
      lightSigmaS: light.weights.sigmaS,
      lightSigmaD: light.weights.sigmaD,
      lightUnequal: unequal(light.weights),
      lightCrossRatio: lightPull.ratio,
      lightPullA: lightPull.A,
      lightPullB: lightPull.B,
      lightFirstOrderA: foLight.A,
      lightFirstOrderB: foLight.B,
      mirrorSigmaS: mirror.weights.sigmaS,
      mirrorSigmaD: mirror.weights.sigmaD,
      mirrorPhase: mirror.phase,
      pureA: pure.A,
      pureB: pure.B,
      pureRatio: pure.ratio,
      mixedA: mixed.A,
      mixedB: mixed.B,
      mixedRatio: mixed.ratio,
      witnessMeson,
      witnessPair,
      freeWorst,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(I1) },
    notes: `L2. Meson phases by filter ${meson.phases.map(x => x.toFixed(6)).join(', ')}, residuals ${meson.residuals.map(e3).join(', ')} (E-SPN-0162's level 1.978945 on radius 9); light pair phases ${light.phases.map(x => x.toFixed(6)).join(', ')}, residuals ${light.residuals.map(e3).join(', ')} (E-SPN-0173's a_B 3 level 2M - 0.13957 = ${(2 * M0 - 0.13957).toFixed(6)} on radius 14; continuum guess ${(2 * M0 - EbContinuum).toFixed(6)}). First-order pulls (point 3): meson A ${e3(foMeson.A)} B ${e3(foMeson.B)}, light A ${e3(foLight.A)} B ${e3(foLight.B)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
