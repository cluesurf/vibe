// The bulk is the husk's heat bath: break the depth step the way the {3,4,3,4} cusp does, and the
// depth-uniform fill that E-SPN-0048 found frozen relaxes to the exclusive-slot equilibrium of E-SPN-0050.
//
// E-SPN-0056 shows why the husk sector is closed on a flat box: the cold weave commutes with the depth step.
// The real bulk is not flat in depth. The {3,4,3,4} ball grows by lambda = 18.2787 per shell (E-MTH-0007,
// the Perron root of x^3 - 21 x^2 + 51 x - 23), so a layer j shells inside the husk sheet holds lambda^-j
// of the ball. E-FRC-0177 put that measure into the PROJECTION as weights, which broke Gauss's law. Here it
// goes into the DYNAMICS and nowhere else (code/measure/husk-bath warpedBeatInPlace): a dock in layer j
// (j = min(w, 9 - w), the flat box read both ways from the sheet w = 0) collides on a Bresenham clock of rate
// lambda^(-s j), and the stream copies every slot every beat. A STAND-IN for the cusp's warped metric, labeled
// so: the measure is the cusp's, its use as each layer's clock rate (a lapse) is a choice. A skipped collision
// is the identity, so energy, charge and both momenta stay exact, and the husk read is the flat column sum
// unchanged.
//
// PREDICTIONS, before the run. With s > 0 the layers stop being copies of each other at the first beat a
// layer skips, and the gas is no longer confined to the husk sector, so the depth-uniform fill should relax
// to the Fermi-Dirac Fano factor 1 - n / g of independent exclusive slots, the same equilibrium from any
// fill, since a skipped collision keeps the uniform measure the collisions keep. s = 0 is the flat control and
// stays at 9 (1 - n / g). How fast it relaxes against s is not predicted.
//
// THE BOX: side 9 (6,561 docks), the E-FLD-0032 cold weave, density 0.4, stores 0 to 2. Runs: the
// depth-uniform fill at s = 0, 1/32, 1/8, 1/2 and 1, and the spread fill at s = 1. 1,500 beats each; the
// window is beats 1,000 to 1,500, every 5th beat. The relaxation is read every 5th beat from the SPATIAL Fano
// factor across the husk modes of one class (variance over mean of the mode counts at that beat), which a
// depth-uniform state holds at 9 (1 - n / g) and an equilibrium one at 1 - n / g.
//
// Gates, fixed before the first run:
//   G1 energy and charge exact in every run.
//   G2 the flat control (s = 0) keeps 0 slots off their depth-step image at every sampled beat, and its
//      window Fano is within 5 percent of 9 (1 - n / g) in both classes.
//   G3 the cusp warp (s = 1) relaxes the depth-uniform fill: window Fano within 0.05 of 1 - n / g in both
//      classes, and more than half the slots off their depth-step image at the end.
//   G4 the equilibrium is independent exclusive slots: the s = 1 depth-uniform run's husk histograms are
//      within total variation 0.02 of the binomial and at most half as far from it as from Poisson and from
//      the negative binomial, in both classes, and the s = 1 spread run agrees with it within 0.05 in each
//      class's Fano factor.
//   G5 every warp relaxes: for each s > 0 the axis class's spatial Fano over its Fermi-Dirac value falls
//      below 1.1 by beat 1,000.
// Reported: for each s, the first beat the spatial ratio falls below 1 + 8 / e (the excess down by e) and
// below 1.1, and the share of collisions the warp skips over the run.
//
// Depth L2: the knit's own gas under a symmetry breaking derived from the substrate's growth rate.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { makeColdWeave, type ColdWeave } from '@/code/rule/cold-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import {
  HUSK_KEYS,
  HUSK_SLOTS,
  coxeterWarp,
  depthMismatch,
  huskClass,
  layerFires,
  layerRates,
  makeHuskTally,
  periodicFill,
  sampleHusk,
  stateCharge,
  stateEnergy,
  warpedBeatInPlace,
  type HuskClass,
} from '@/code/measure/husk-bath'

const SIDE = 9
const BEATS = 1500
const FROM = 1000
const EVERY = 5
const WARPS = [0, 1 / 32, 1 / 8, 1 / 2, 1]

function coldSpec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// the spatial Fano factor of one class at one beat, over its Fermi-Dirac value (from that beat's fill)
function spatialRatio(counts: Int32Array, axis: boolean): number {
  const k = HUSK_KEYS.length
  let sum = 0
  let square = 0
  let n = 0

  for (let m = 0; m < counts.length; m++) {
    if ((HUSK_SLOTS[m % k] === 2) === axis) {
      const x = counts[m] ?? 0

      sum += x
      square += x * x
      n++
    }
  }

  const mean = sum / n
  const g = axis ? 2 * SIDE : SIDE

  return (square / n - mean * mean) / mean / (1 - mean / g)
}

type Run = {
  s: number
  classes: HuskClass[]
  maxOff: number
  finalOff: number
  beatExcessOverE: number
  beatNearOne: number
  ratioAt: Record<number, number>
  skippedShare: number
  energyExact: boolean
  chargeExact: boolean
}

function run(weave: ColdWeave, s: number, period: number, lambda: number): Run {
  const start = periodicFill({ side: SIDE, period })
  const state = { vibe: Int8Array.from(start.vibe), store: Int32Array.from(start.store), demon: Int32Array.from(start.demon) }
  const scratch = { vibe: new Int8Array(state.vibe.length), store: new Int32Array(state.store.length) }
  const e0 = stateEnergy(state)
  const q0 = stateCharge(state)
  const rates = layerRates(SIDE, lambda, s)
  const tally = makeHuskTally(SIDE)
  const probe = makeHuskTally(SIDE)
  let maxOff = 0
  let beatExcessOverE = -1
  let beatNearOne = -1
  let skipped = 0
  const ratioAt: Record<number, number> = {}

  for (let t = 0; t < BEATS; t++) {
    rates.forEach(r => {
      skipped += layerFires(r, t) ? 0 : 1
    })
    warpedBeatInPlace(weave, state, t, rates, scratch)

    const beat = t + 1

    if (beat % EVERY !== 0) {
      continue
    }

    maxOff = Math.max(maxOff, depthMismatch(state, SIDE, 1))
    sampleHusk(probe, state.vibe)

    const ratio = spatialRatio(probe.counts, true)

    if ([5, 25, 50, 100, 200, 500, 1000, 1500].includes(beat)) {
      ratioAt[beat] = ratio
    }

    if (beatExcessOverE < 0 && ratio < 1 + 8 / Math.E) {
      beatExcessOverE = beat
    }

    if (beatNearOne < 0 && ratio < 1.1) {
      beatNearOne = beat
    }

    if (beat > FROM) {
      sampleHusk(tally, state.vibe)
    }
  }

  return {
    s,
    classes: [huskClass(tally, 0), huskClass(tally, 1)],
    maxOff,
    finalOff: depthMismatch(state, SIDE, 1),
    beatExcessOverE,
    beatNearOne,
    ratioAt,
    skippedShare: skipped / (BEATS * SIDE),
    energyExact: stateEnergy(state) === e0,
    chargeExact: stateCharge(state) === q0,
  }
}

export default experiment({
  id: 'spin/husk-heat-bath',
  code: 'E-SPN-0057',
  title:
    'the bulk is the husk\'s heat bath, fail as gated: with the depth step broken by the {3,4,3,4} cusp\'s measure as each layer\'s collision clock (a stand-in for the warped metric), the depth-uniform fill that the flat box keeps at 9 times the Fermi-Dirac Fano factor leaves the husk sector at once and its depth-moving slots relax to independent exclusive slots in about 40 performed collision beats, but at the full warp the deep layers\' clocks (lambda^-j per beat) are so slow that their in-layer slots stay at the start for 1,500 beats (diagonal class 2.98 times Fermi-Dirac)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const lambda = coxeterWarp()
    const weave = makeColdWeave({ mesh: d4Mesh({ side: SIDE }), spec: coldSpec() })
    const uniform = WARPS.map(s => run(weave, s, 1, lambda))
    const spread = run(weave, 1, 0, lambda)
    const slots = SIDE ** 4 * 36
    const flat = uniform[0]!
    const cusp = uniform[uniform.length - 1]!
    const near = (x: HuskClass): number => Math.abs(x.fano - x.fermi)

    const g1 = [...uniform, spread].every(r => r.energyExact && r.chargeExact)
    const g2 = flat.maxOff === 0 && flat.classes.every(x => Math.abs(x.fano / x.fermi / 9 - 1) <= 0.05)
    const g3 = cusp.classes.every(x => near(x) <= 0.05) && cusp.finalOff > slots / 2
    const g4 =
      cusp.classes.every(x => x.tvBinomial <= 0.02 && x.tvBinomial <= x.tvPoisson / 2 && x.tvBinomial <= x.tvNegativeBinomial / 2) &&
      [0, 1].every(c => Math.abs((cusp.classes[c]?.fano ?? 0) - (spread.classes[c]?.fano ?? 0)) <= 0.05)
    const g5 = uniform.slice(1).every(r => r.beatNearOne > 0 && r.beatNearOne <= FROM)
    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5 }
    const ok = Object.values(gates).every(Boolean)
    const metrics: Record<string, number> = { lambda, slotsAndCounters: slots }
    const tag = (s: number): string => (s === 0 ? '0' : `1over${Math.round(1 / s)}`)

    for (const r of [...uniform, spread]) {
      const name = r === spread ? 'spreadS1' : `uniformS${tag(r.s)}`

      ;['axis', 'diagonal'].forEach((label, c) => {
        const x = r.classes[c]!

        metrics[`${name}_${label}Fano`] = Number(x.fano.toPrecision(6))
        metrics[`${name}_${label}FermiDirac`] = Number(x.fermi.toPrecision(6))
        metrics[`${name}_${label}FanoOverFermi`] = Number((x.fano / x.fermi).toPrecision(6))
        metrics[`${name}_${label}TvBinomial`] = Number(x.tvBinomial.toPrecision(4))
        metrics[`${name}_${label}TvPoisson`] = Number(x.tvPoisson.toPrecision(4))
        metrics[`${name}_${label}TvNegativeBinomial`] = Number(x.tvNegativeBinomial.toPrecision(4))
      })
      metrics[`${name}_maxOffDepthStep`] = r.maxOff
      metrics[`${name}_finalOffDepthStep`] = r.finalOff
      metrics[`${name}_beatExcessDownByE`] = r.beatExcessOverE
      metrics[`${name}_beatRatioBelow1p1`] = r.beatNearOne
      metrics[`${name}_skippedCollisionShare`] = Number(r.skippedShare.toPrecision(4))

      for (const [beat, ratio] of Object.entries(r.ratioAt)) {
        metrics[`${name}_spatialRatioBeat${beat}`] = Number(ratio.toPrecision(5))
      }

      metrics[`${name}_energyExact`] = r.energyExact ? 1 : 0
      metrics[`${name}_chargeExact`] = r.chargeExact ? 1 : 0
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the side-9 box the flat cold weave keeps a depth-uniform fill in the husk sector at 9 times the Fermi-Dirac Fano factor; the cusp\'s measure as each layer\'s collision clock (rates lambda^(-s j)) breaks the depth step for every s > 0, and the husk directions cast by depth-moving roots relax to independent exclusive slots (Fermi-Dirac, binomial to 0.016) within 45 to 390 beats, about 40 performed collision beats at every warp, with energy and charge exact and the husk read unchanged; at s = 1 the in-layer slots of layers whose clocks never tick in 1,500 beats keep the start, so the diagonal class stays at 2.98 times Fermi-Dirac and G3 and G4 fail: the husk thermalizes only through the bulk, and only as fast as the bulk layers collide',
      metrics: { ...metrics, ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])) },
      notes:
        'L2. FIRST RUN (2026-09-26, 85 s), gates as fixed: G1, G2, G5 pass, G3 and G4 fail, status fail. WHAT HOLDS: energy and charge exact in all six runs; the flat control keeps the depth-uniform fill in the husk sector (0 slots off, Fano 8.94 and 9.00 times Fermi-Dirac); every warp s > 0 breaks the sector at once and the AXIS class (the husk directions cast by the depth-moving roots +-e_i +- e_4) relaxes to independent exclusive slots (Fano 0.97 to 0.99 of 1 - n / g, total variation from the binomial 0.007 to 0.016 against 0.15 from Poisson and 0.25 from Bose-Einstein), and so does the diagonal class for s up to 1/8 (0.99) and nearly for s = 1/2 (1.08). WHAT FAILS: at the full cusp warp s = 1 the DIAGONAL class (the in-layer roots +-e_i +- e_j, which never change depth) stays at 2.98 times Fermi-Dirac with fill 0.444 against the axis class\'s 0.507, and the spread fill at s = 1 sits at 0.87 times on the diagonals. The reason is the clocks: at s = 1 layer j collides at lambda^-j per beat (1, 0.055, 0.0030, 1.6e-4, 9e-6), so over 1,500 beats layers 3 to 6 never collide at all and layers 2 and 7 about four times. A vibe on an in-layer slot of a silent layer streams in that layer forever, never meets the threshold, and keeps the start\'s density (0.4 against the equilibrium 0.49) and the start\'s depth copies. So the husk relaxes only through layers whose clocks run: the thermalization time of layer j\'s in-layer slots grows like lambda^(s j). G3 also asked for more than half the slots off their depth-step image, which repeats E-SPN-0056\'s threshold error (the equilibrium sits at 49.3 percent); the s = 1 run ends at 37.6 percent. THE RATE AGAINST THE COUPLING (observed, not pre-registered, no fit engaged): the axis class\'s spatial Fano falls within 10 percent of Fermi-Dirac by beat 45, 70, 235 and 390 at s = 1/32, 1/8, 1/2 and 1, while the warp skips 18, 50, 82 and 88 percent of the collisions; the beat times the share of collisions kept is 37, 35, 42 and 48, so the relaxation time is about 40 performed collision beats whatever the warp. The breaking of the depth step is instant for any s > 0; what the warp costs is collisions. Conclusion for the hypothesis: yes, the husk thermalizes only through the bulk (the flat box never does, any depth breaking does, and the equilibrium is exclusive slots, Fermi-Dirac), but with the cusp\'s own measure as the clock the deep layers are cold storage whose in-layer slots relax on times growing like lambda^j.',
    })
  },
})
