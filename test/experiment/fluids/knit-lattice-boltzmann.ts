// The lattice Boltzmann equation the scatter weave implies, and its viscosity and sound speed predicted
// against the ones measured on the knit (E-FLD-0026, E-FLD-0027). Rung 3 of the multiscale ladder: from
// the exact integer knit to the ensemble-averaged kinetic equation, the classical FHP route (lattice gas,
// then lattice Boltzmann, then Navier-Stokes by Chapman-Enskog).
//
// 1. THE BACKGROUND. The pair-clock scatter weave keeps no tone count (E-FLD-0027), so its equilibrium
//    is not set by the start's fill. Any bijection of dock states keeps the uniform measure on all states,
//    and the uniform measure is the product measure with every slot love, calm and fear at one third each:
//    occupation 2/3. That is the argument; the knit is asked whether it goes there from the fill-0.2
//    start E-FLD-0026 uses (the mean occupation of every final state). The flip rule keeps the tone count,
//    so its background is the product state at the start's own mean occupation, read off the four starts.
// 2. THE EQUATION. code/coarse/knit-boltzmann: the linearized collision about the product background,
//    exact as a derivative, estimated over a deterministic ensemble of product draws (the conditional
//    estimator: one dock collision per draw, the change it makes sorted by the value each slot held),
//    400,000 draws per phase, for all 24 phases, under two salts. Each salt's matrices are kept apart for
//    the sampling error and averaged for the prediction. The estimator keeps what the knit's collision
//    keeps draw by draw, so charge, P and the line sum are kept by the matrices to rounding, and the tone
//    count is kept exactly when the rule keeps it.
// 3. PREDICTIONS, from the period map M(k) = prod S(k) A_t alone, no knit run in them:
//    - the census of exact slow modes at k = 0 (the additive invariants the equation keeps), and at k = 0.1
//      along each axis (slab invariants, below);
//    - the shear viscosity: the slow mode of momentum along axis 0 with k along axis 1 (picked by its
//      content on P0 at each k), nu = Gamma / k^2 at k = 0.02 and at the k of the knit runs, 2 pi / L;
//    - the sound speed on the flip rule: the propagating mode along axis 0, followed from k = 0.02 by the
//      nearest slow eigenvalue in steps of 0.005 with its frequency unwrapped, so its phase may pass pi a
//      period; its speed at k = 0.02, at each knit k, and extrapolated in k^2 over the knit k's as the
//      knit's is; and its attenuation Gamma / k^2.
// 4. THE KNIT, by the protocols of E-FLD-0026 and E-FLD-0027 run again here (their numbers are not typed
//    in): the shear at L = 12, 16, 20, 24 (fill 0.2, mode 1, 60 beats, the decay window fit) and the
//    flip rule's longitudinal wave at the same sizes (144 beats, the damped cosine fit, extrapolated in
//    k^2).
// 5. SLAB INVARIANTS, found by the equation: a combination of the line sum S and P that vanishes on every
//    slot moving along an axis is carried only inside the slabs across that axis, so each slab's sum of it
//    is exactly kept. The roots' side signs make S - P0 one for axis 0 and S - P0 - P1 - P2 one for axis
//    3, and no combination exists for axes 1 and 2 (code/coarse/knit-boltzmann slabInvariantVector). The
//    equation shows it as a mode with |lambda| = 1 at k != 0; the knit is checked slab by slab over 48
//    beats at L = 12, with S - P0 read across axis 1 as the control, which is not kept.
// 6. CORRELATIONS. Where the prediction misses, the Boltzmann closure (independent slots entering a
//    collision) is the first suspect, so the knit's equilibrium dock states are read for it: the share of
//    lines holding a pair against the product's 4 / 9, and the largest connected correlation of two slot
//    occupations in one dock, on the final state at L = 16.
//
// Gates. Fixed before this file ran, with one exception stated plainly: the probe that built the
// operator (tmp/bridge-lbe-probe) printed the shear viscosity 0.473 and the sound speed 0.709 to 0.712
// before these gates were written, so G3 and G4 are not blind. Everything else is.
// - G1 exactness: charge, P and the line sum kept by every matrix to 1e-12; the tone count kept to 1e-12
//   by the flip rule and broken by more than 0.1 by the pair clock; at k = 0, 6 slow modes within 1e-9 of 1
//   for the pair clock (charge, P, S, the Smith form of E-FLD-0027) and 7 for the flip rule (and the count).
// - G2 the background: every final knit state of the shear runs within 0.01 of occupation 2/3.
// - G3 viscosity: the prediction at k = 0.02 within 10 percent of the mean of the knit's four.
// - G4 sound: the predicted speed at k = 0.02 within 0.02 of the knit's extrapolated speed.
// - G5 (blind) the dispersion: the predicted speed at each knit k within 0.03 of the knit's, and the
//   predicted nu at each knit k within 10 percent of the knit's.
// - G6 (blind) the sampling: the two salts' viscosities and speeds within 2 percent of each other.
// - G7 (blind) the slab invariants: exact slow modes at k = 0.1 along axes 0 to 3 number 1, 0, 0, 1 on both
//   rules, and the knit keeps S - P0 per axis-0 slab and S - P0 - P1 - P2 per axis-3 slab exactly over 48
//   beats, while S - P0 per axis-1 slab drifts.
//
// THE FIRST RUN, and what changed after it (the gates did not). It used the forced estimator (three
// collisions per slot per draw) at 5,000 draws a phase, with hashRand draws. G6 failed: the two salts gave
// nu 0.474 and 0.491, 3.5 percent apart. G5 failed on a code error, not a result: the sound mode was
// continued by the nearest eigenvalue, which swaps the two sound branches where their phases cross pi a
// period (c k 24 = pi near k = 0.18), and printed speeds of 0.09 to 0.27. Probes then showed the spread
// is sampling noise of the relaxation rates (six salts at 50,000 draws: nu 0.471 to 0.496), not the hash
// (a full 32-bit finalizer gave the same spread), so the draws went to 400,000 per phase with the
// conditional estimator, and the continuation now extrapolates the eigenvalue's path. Every other number
// of that run was as below (nu 0.475 against the knit's 0.469, c 0.707 against 0.710, the census, the
// slab invariants, the background).
//
// Depth L2: the classical lattice-gas to lattice-Boltzmann reduction carried out on a constructed rule,
// with the knit as the witness; the slab invariants are a new exact property of this rule, found by the
// coarse equation and confirmed on the integer dynamics.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { makeWill } from '@/code/tone/will'
import { colorLocalCollision, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { decayRateFit } from '@/code/measure/shear-mode'
import { linearFit } from '@/code/measure/regression'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { FLIP_TABLE } from '@/code/rule/momentum-weave'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { dampedCosineFit, momentumWaveSeries, momentumWaveStart, type WaveGeometry } from '@/code/measure/momentum-transport'
import {
  CHARGE_VECTOR,
  COUNT_VECTOR,
  LINE_SUM_VECTOR,
  conservationDefect,
  linearizedSchedule,
  momentumVector,
  periodMap,
  slabDensity,
  slabInvariantVector,
  slowModes,
  trackMode,
  uniformBackground,
} from '@/code/coarse/knit-boltzmann'

const SAMPLES = 400000
const SALTS = [11, 29]
const SIDES = [12, 16, 20, 24]
const SHEAR_BEATS = 60
const SOUND_BEATS = 144
const SMALL_K = 0.02
const SHEAR: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }
const LONGITUDINAL: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }
const FLIP_BASE: ColorLocalSpec = { ...HEAD_TURN_SPEC, tables: [FLIP_TABLE] }
const OPPOSITE = rootsD4().map((r, _, all) => all.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))

const DENSITIES: Record<string, Float64Array> = {
  charge: CHARGE_VECTOR,
  count: COUNT_VECTOR,
  line: LINE_SUM_VECTOR,
  p0: momentumVector([1, 0, 0, 0]),
  p1: momentumVector([0, 1, 0, 0]),
  p2: momentumVector([0, 0, 1, 0]),
  p3: momentumVector([0, 0, 0, 1]),
}

function specOf(base: ColorLocalSpec): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: base, opposite: o, forward: f }))

  return { base, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

const mean = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length

function averaged(a: readonly Float64Array[], b: readonly Float64Array[]): Float64Array[] {
  return a.map((m, t) => m.map((v, i) => (v + (b[t]?.[i] ?? 0)) / 2))
}

function occupation(data: Int8Array): number {
  let n = 0

  for (let i = 0; i < data.length; i++) {
    n += data[i] !== 0 ? 1 : 0
  }

  return n / data.length
}

// the number of period eigenvalues within 1e-9 of the unit circle
function exactSlowCount(matrices: readonly Float64Array[], wave: readonly number[]): number {
  const map = periodMap({ matrices, wave })
  const ev = complexEigenvalues({ re: map.re, im: map.im, n: 48 })

  return ev.re.filter((re, i) => Math.abs(Math.hypot(re, ev.im[i] ?? 0) - 1) < 1e-9).length
}

// the shear viscosity of the P0 mode with k along axis 1
function shearNu(matrices: readonly Float64Array[], k: number): { nu: number; content: number } {
  const modes = slowModes({ map: periodMap({ matrices, wave: [0, k, 0, 0] }), period: 24, floor: 0.02, densities: DENSITIES })
  const best = modes.reduce((a, m) => ((m.content.p0 ?? 0) > (a.content.p0 ?? 0) ? m : a))

  return { nu: best.gamma / (k * k), content: best.content.p0 ?? 0 }
}

// the sound mode along axis 0 followed to each target k
function soundAt(matrices: readonly Float64Array[], targets: readonly number[]) {
  const top = Math.max(SMALL_K, ...targets)
  const ks: number[] = []

  for (let k = SMALL_K; k <= top + 1e-9; k += 0.005) {
    ks.push(k)
  }

  ks.push(...targets)
  ks.sort((a, b) => a - b)

  const track = trackMode({
    matrices,
    direction: [1, 0, 0, 0],
    ks,
    densities: DENSITIES,
    score: m => (m.omega > 0 ? (m.content.count ?? 0) + (m.content.p0 ?? 0) : 0),
  })
  const at = (k: number) => track.find(x => Math.abs(x.k - k) < 1e-12) ?? track[0]

  return { small: at(SMALL_K), targets: targets.map(k => at(k)) }
}

// the knit's equilibrium dock statistics: the share of lines holding a pair, and the largest connected
// correlation of two slot occupations in one dock
function dockCorrelations(data: Int8Array): { pairShare: number; maxCorrelation: number } {
  const docks = data.length / 24
  const single = new Float64Array(24)
  const joint = new Float64Array(24 * 24)
  let pairs = 0

  for (let x = 0; x < docks; x++) {
    for (let d = 0; d < 24; d++) {
      const a = data[x * 24 + d] !== 0 ? 1 : 0

      single[d] = (single[d] ?? 0) + a

      if (a === 0) {
        continue
      }

      for (let e = d + 1; e < 24; e++) {
        if (data[x * 24 + e] !== 0) {
          joint[d * 24 + e] = (joint[d * 24 + e] ?? 0) + 1
        }
      }

      if (d < (OPPOSITE[d] ?? d) && data[x * 24 + (OPPOSITE[d] ?? d)] !== 0) {
        pairs++
      }
    }
  }

  let worst = 0

  for (let d = 0; d < 24; d++) {
    for (let e = d + 1; e < 24; e++) {
      const pd = (single[d] ?? 0) / docks
      const pe = (single[e] ?? 0) / docks
      const c = ((joint[d * 24 + e] ?? 0) / docks - pd * pe) / Math.sqrt(pd * (1 - pd) * pe * (1 - pe))

      worst = Math.max(worst, Math.abs(c))
    }
  }

  return { pairShare: pairs / (docks * 12), maxCorrelation: worst }
}

// per-slab sums of the slab invariants on a knit run, their largest drift over 48 beats
function slabDrifts(spec: ScatterWeaveSpec, side: number) {
  const mesh = d4Mesh({ side })
  const collision = scatterCollision({ spec, opposite: meshOpposites(mesh) })
  const will = momentumWaveStart({ mesh, side, geometry: SHEAR, mode: 1, fill: 0.2, bias: 0.4, salt: 7 })
  const table = streamSourceTable(mesh)
  const axis0 = slabInvariantVector(0) ?? new Float64Array(48)
  const axis3 = slabInvariantVector(3) ?? new Float64Array(48)
  const read = (data: Int8Array) => ({
    a0: slabDensity({ data, side, axis: 0, left: axis0 }),
    a3: slabDensity({ data, side, axis: 3, left: axis3 }),
    control: slabDensity({ data, side, axis: 1, left: axis0 }),
  })
  const start = read(will.data)
  const drift = { a0: 0, a3: 0, control: 0 }

  let current = { mesh, data: will.data.slice() }
  let scratch = makeWill(mesh)

  for (let t = 0; t < 48; t++) {
    beatInto({ src: current, dst: scratch, table, collision: collision(t) })
    ;[current, scratch] = [scratch, current]

    const now = read(current.data)

    for (const key of ['a0', 'a3', 'control'] as const) {
      drift[key] = Math.max(drift[key], ...now[key].map((v, s) => Math.abs(v - (start[key][s] ?? 0))))
    }
  }

  return drift
}

export default experiment({
  id: 'fluids/knit-lattice-boltzmann',
  code: 'E-FLD-0030',
  title:
    'the lattice Boltzmann equation of the scatter weave, its collision linearized about the uniform third-each background the knit relaxes to and averaged over a deterministic ensemble of product draws, predicts the knit transport with no fitted number: shear viscosity 0.474 against the measured 0.469 (1.0 percent), sound speed 0.707 against 0.710, and the dispersive speeds 0.832, 0.775, 0.748, 0.735 against the measured 0.821, 0.776, 0.751, 0.737 at k = 0.52 to 0.26, so the Boltzmann closure is close to exact for this dense gas; the equation also finds two exact slab invariants of the knit (S - P0 across axis 0, S - P0 - P1 - P2 across axis 3, none across 1 and 2), which the integer dynamics keeps',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const clock = specOf(HEAD_TURN_SPEC)
    const flip = specOf(FLIP_BASE)
    const clockRule = scatterCollision({ spec: clock, opposite: OPPOSITE })
    const flipRule = scatterCollision({ spec: flip, opposite: OPPOSITE })

    // the knit: shear on the pair clock, sound on the flip rule
    const shearRuns = SIDES.map(side => {
      const mesh = d4Mesh({ side })
      const will = momentumWaveStart({ mesh, side, geometry: SHEAR, mode: 1, fill: 0.2, bias: 0.4, salt: 7 })
      const { series, final } = momentumWaveSeries({ will, collision: scatterCollision({ spec: clock, opposite: meshOpposites(mesh) }), beats: SHEAR_BEATS, side, geometry: SHEAR, mode: 1 })
      const fit = decayRateFit({ series })
      const k = (2 * Math.PI) / side

      return { side, k, nu: fit.gamma / (k * k), r2: fit.r2, occupation: occupation(final.data), final: side === 16 ? final.data : undefined }
    })
    const nuKnit = mean(shearRuns.map(r => r.nu))

    const soundRuns = SIDES.map(side => {
      const mesh = d4Mesh({ side })
      const will = momentumWaveStart({ mesh, side, geometry: LONGITUDINAL, mode: 1, fill: 0.2, bias: 0.4, salt: 7 })
      const { series } = momentumWaveSeries({ will, collision: scatterCollision({ spec: flip, opposite: meshOpposites(mesh) }), beats: SOUND_BEATS, side, geometry: LONGITUDINAL, mode: 1 })
      const s0 = series[0] ?? 1
      const fit = dampedCosineFit({ series: series.map(x => x / s0) })
      const k = (2 * Math.PI) / side

      return { side, k, speed: fit.omega / k, r2: fit.r2, occupation: occupation(will.data) }
    })
    const knitExtrapolation = linearFit({ xs: soundRuns.map(r => r.k * r.k), ys: soundRuns.map(r => r.speed) })
    const flipOccupation = mean(soundRuns.map(r => r.occupation))
    const flipOccupationSpread = Math.max(...soundRuns.map(r => r.occupation)) - Math.min(...soundRuns.map(r => r.occupation))

    // the equation
    const clockSalted = SALTS.map(salt => linearizedSchedule({ rule: clockRule, period: 24, background: uniformBackground(2 / 3), samples: SAMPLES, salt }))
    const flipSalted = SALTS.map(salt => linearizedSchedule({ rule: flipRule, period: 24, background: uniformBackground(flipOccupation), samples: SAMPLES, salt }))
    const clockMatrices = averaged(clockSalted[0] ?? [], clockSalted[1] ?? [])
    const flipMatrices = averaged(flipSalted[0] ?? [], flipSalted[1] ?? [])

    const defects = {
      clockCharge: conservationDefect(clockMatrices, CHARGE_VECTOR),
      clockLine: conservationDefect(clockMatrices, LINE_SUM_VECTOR),
      clockMomentum: Math.max(...[0, 1, 2, 3].map(a => conservationDefect(clockMatrices, DENSITIES[`p${a}`] ?? CHARGE_VECTOR))),
      clockCount: conservationDefect(clockMatrices, COUNT_VECTOR),
      flipCharge: conservationDefect(flipMatrices, CHARGE_VECTOR),
      flipLine: conservationDefect(flipMatrices, LINE_SUM_VECTOR),
      flipMomentum: Math.max(...[0, 1, 2, 3].map(a => conservationDefect(flipMatrices, DENSITIES[`p${a}`] ?? CHARGE_VECTOR))),
      flipCount: conservationDefect(flipMatrices, COUNT_VECTOR),
    }
    const census = {
      clockK0: exactSlowCount(clockMatrices, [0, 0, 0, 0]),
      flipK0: exactSlowCount(flipMatrices, [0, 0, 0, 0]),
      clockAxes: [0, 1, 2, 3].map(a => exactSlowCount(clockMatrices, [0, 1, 2, 3].map(i => (i === a ? 0.1 : 0)))),
      flipAxes: [0, 1, 2, 3].map(a => exactSlowCount(flipMatrices, [0, 1, 2, 3].map(i => (i === a ? 0.1 : 0)))),
    }

    const nuPredicted = shearNu(clockMatrices, SMALL_K)
    const nuSalted = clockSalted.map(m => shearNu(m, SMALL_K).nu)
    const nuAtKnit = shearRuns.map(r => shearNu(clockMatrices, r.k).nu)
    const sound = soundAt(flipMatrices, soundRuns.map(r => r.k))
    const soundSalted = flipSalted.map(m => soundAt(m, []).small)
    const cPredicted = (sound.small?.omega ?? 0) / SMALL_K
    const cSalted = soundSalted.map(s => (s?.omega ?? 0) / SMALL_K)
    const predictedSpeeds = sound.targets.map(t => (t?.omega ?? 0) / (t?.k ?? 1))
    const predictedExtrapolation = linearFit({ xs: soundRuns.map(r => r.k * r.k), ys: predictedSpeeds })
    const soundAttenuation = (sound.small?.gamma ?? 0) / (SMALL_K * SMALL_K)

    const slabs = slabDrifts(clock, 12)
    const correlations = dockCorrelations(shearRuns.find(r => r.final)?.final ?? new Int8Array(24))

    const g1 =
      Math.max(defects.clockCharge, defects.clockLine, defects.clockMomentum, defects.flipCharge, defects.flipLine, defects.flipMomentum, defects.flipCount) <= 1e-12 &&
      defects.clockCount > 0.1 &&
      census.clockK0 === 6 &&
      census.flipK0 === 7
    const g2 = shearRuns.every(r => Math.abs(r.occupation - 2 / 3) <= 0.01)
    const g3 = Math.abs(nuPredicted.nu - nuKnit) / nuKnit <= 0.1
    const g4 = Math.abs(cPredicted - knitExtrapolation.intercept) <= 0.02
    const g5 = soundRuns.every((r, i) => Math.abs((predictedSpeeds[i] ?? 0) - r.speed) <= 0.03) && shearRuns.every((r, i) => Math.abs((nuAtKnit[i] ?? 0) - r.nu) / r.nu <= 0.1)
    const g6 = Math.abs((nuSalted[0] ?? 0) - (nuSalted[1] ?? 0)) / nuPredicted.nu <= 0.02 && Math.abs((cSalted[0] ?? 0) - (cSalted[1] ?? 0)) / cPredicted <= 0.02
    const g7 =
      [census.clockAxes, census.flipAxes].every(a => a.join(',') === '1,0,0,1') && slabs.a0 === 0 && slabs.a3 === 0 && slabs.control > 0

    const metrics: Record<string, number> = {
      g1Exactness: g1 ? 1 : 0,
      g2Background: g2 ? 1 : 0,
      g3Viscosity: g3 ? 1 : 0,
      g4Sound: g4 ? 1 : 0,
      g5Dispersion: g5 ? 1 : 0,
      g6Sampling: g6 ? 1 : 0,
      g7SlabInvariants: g7 ? 1 : 0,
      nuPredicted: nuPredicted.nu,
      nuPredictedP0Content: nuPredicted.content,
      nuSaltA: nuSalted[0] ?? 0,
      nuSaltB: nuSalted[1] ?? 0,
      nuKnitMean: nuKnit,
      nuRelativeError: (nuPredicted.nu - nuKnit) / nuKnit,
      cPredicted,
      cSaltA: cSalted[0] ?? 0,
      cSaltB: cSalted[1] ?? 0,
      cKnitExtrapolated: knitExtrapolation.intercept,
      cPredictedExtrapolatedOverKnitK: predictedExtrapolation.intercept,
      cError: cPredicted - knitExtrapolation.intercept,
      soundAttenuationPredicted: soundAttenuation,
      flipOccupation,
      flipOccupationSpread,
      census_clockK0: census.clockK0,
      census_flipK0: census.flipK0,
      slabDrift_axis0: slabs.a0,
      slabDrift_axis3: slabs.a3,
      slabDrift_controlAxis1: slabs.control,
      knitPairShare: correlations.pairShare,
      productPairShare: 4 / 9,
      knitMaxSlotCorrelation: correlations.maxCorrelation,
      ...Object.fromEntries(Object.entries(defects).map(([k, v]) => [`defect_${k}`, v])),
    }

    census.clockAxes.forEach((v, a) => (metrics[`census_clockAxis${a}`] = v))
    census.flipAxes.forEach((v, a) => (metrics[`census_flipAxis${a}`] = v))
    shearRuns.forEach((r, i) => {
      metrics[`nuKnitL${r.side}`] = r.nu
      metrics[`nuPredictedL${r.side}`] = nuAtKnit[i] ?? 0
      metrics[`r2KnitL${r.side}`] = r.r2
      metrics[`occupationKnitL${r.side}`] = r.occupation
    })
    soundRuns.forEach((r, i) => {
      metrics[`cKnitL${r.side}`] = r.speed
      metrics[`cPredictedL${r.side}`] = predictedSpeeds[i] ?? 0
      metrics[`r2SoundL${r.side}`] = r.r2
    })

    return verdict({
      status: g1 && g2 && g3 && g4 && g5 && g6 && g7 ? 'pass' : 'fail',
      claim:
        'the linearized Boltzmann collision of the scatter weave keeps charge, P and the line sum to rounding (and the count on the flip rule), its period map has exactly the knit additive invariants as k = 0 slow modes, the knit relaxes to the uniform third-each background, and the predicted viscosity (pair clock) and sound speed (flip rule) at small k agree with the knit to 10 percent and 0.02, the speeds and viscosities at every knit wavenumber too; the equation finds slab invariants across axes 0 and 3 and none across 1 and 2, and the knit keeps both exactly',
      metrics,
      notes:
        'L2. Why molecular chaos works this well here: the pair clock drives every slot to one third each (occupation 0.666 to 0.667 at every size), the uniform measure, which every bijection keeps, so the equilibrium the Boltzmann closure assumes is the knit equilibrium itself, product over slots, and only correlations a collision builds between slots that meet again can spoil the closure. None is seen in the knit equilibrium dock: over 65,536 docks the pair share is 0.4435 against the product 4/9 = 0.4444, and the largest connected correlation of two slot occupations is 0.011, the size the largest of 276 pairs reaches from sampling alone (one standard deviation is 0.004). The remaining 1 percent in the viscosity is inside the knit fit spread (0.453 to 0.478 over the four sizes, the equation 0.450 to 0.470 at the same k). Sampling: the two salts give 0.4741 and 0.4753. The slab invariants are the E-FLD-0024 line sum S (kept because local color forces it) combined with P: the side sign of a slot is the sign of its first nonzero root component, so S - P0 vanishes on every slot moving along axis 0 and S - P0 - P1 - P2 on every slot moving along axis 3. What they count streams inside the slab, so each slab keeps its sum exactly, an HPP-like spurious invariant of the rule. A wave of P2 along axis 3 overlaps S - P0 - P1 - P2 (the slots 4 to 7 and 12 to 15 carry -e2), so part of it never decays: the seventh of E-FLD-0026 for that orientation is read against a plateau, not only a smaller viscosity (E-FLD-0031 follows it beat for beat). The equation is linear, so it says nothing about the finite amplitude of the bias 0.4 starts beyond the agreement itself.',
    })
  },
})
