// The statistics of the slot at equilibrium in the cold vacuum: one vibe per slot, an energy ladder on the
// vibe, and pairs made and unmade, read on the husk and in the bulk, with Maxwell-Boltzmann, Bose-Einstein
// and an independent-level Fermi-Dirac as the rivals.
//
// E-SPN-0048 found the husk Fano factor at the Fermi-Dirac value from a low-discrepancy fill, and a
// depth-uniform fill that could not relax because the knit commutes with the depth step. This experiment
// asks the sharper questions that a Fano factor cannot: WHICH exclusive statistics, and whether pair making
// fixes the chemical potentials.
//
// THE MODEL OF THE SLOT, derived before the run. A slot holds nothing, or one vibe of charge sigma (love +1,
// fear -1) with a kinetic store s >= 0, energy 1 + s (code/rule/cold-weave: E = sum of (1 + store) plus the
// line counters). If the cold weave samples a Gibbs measure with one inverse temperature beta and one
// fugacity z_sigma per charge, then per slot
//   n(sigma, s) = z_sigma e^(-beta (1 + s)) / Z,   n(empty) = 1 / Z.
// Three consequences, each a test:
//   (a) THE LADDER. n(sigma, s + 1) / n(sigma, s) = e^(-beta), the same for every s. The rivals read other
//       ratios as constant: Fermi-Dirac with every (slot, level) an independent mode keeps
//       [n / (1 - n)](s + 1) / [n / (1 - n)](s) constant, Bose-Einstein keeps [n / (1 + n)](s + 1) /
//       [n / (1 + n)](s) constant. Only the exclusive slot, one vibe of ANY level, keeps the plain ratio.
//   (b) PAIRS. The threshold move makes and unmakes a love-fear pair at stores 0 from two units of kinetic
//       energy, so at equilibrium mu_love + mu_fear = 0, z_love z_fear = 1, and
//         R = n(+, 0) n(-, 0) / n(empty)^2 = e^(-2 beta),
//       the rest energy 1 of each vibe setting the exponent. DISCLOSED: this relation was checked on
//       E-SPN-0048's printed shares before this file was written (bulk fill 0.49, stores 0.676 / 0.221 /
//       0.071 give R about 0.105 against e^(-2 beta) about 0.106), so on the default rule it is a
//       replication on a new box and new starts, not a blind prediction. The control is blind: with the
//       threshold off no pair is ever made, the vibe count is fixed by the start, and nothing ties z_love
//       z_fear to 1.
//   (c) THE HUSK. A husk mode (a column of SIDE bulk docks and one husk direction, g = 2 SIDE slots on an
//       axis, SIDE on a diagonal) holds N of g exclusive slots. If the slots are independent, N is binomial
//       (g, n / g), against Poisson (Maxwell-Boltzmann) and the negative binomial of g bosonic states
//       (Bose-Einstein), all three with the measured mean.
//
// STARTS (Weyl, no seeds), on the D4 lattice of side 7 as in E-SPN-0048 (2,401 docks, 57,624 slots; a
// probe timed side 5 at 1.5 ms a beat, so side 7 costs seconds and keeps the comparison), density 0.4,
// stores 0 to 2:
//   SPREAD: each slot by the golden sequence along the slot index (E-SPN-0048's spread fill).
//   BROKEN: E-SPN-0048's depth-uniform coherent fill, then each slot emptied where the silver sequence at its
//     index falls under 1/8. That breaks the depth symmetry that froze E-SPN-0048's coherent run.
//   CONTROL: the spread fill under the cold weave with the threshold move off.
// Each runs 1,500 beats; the window is beats 1,000 to 1,500, every 5th beat.
//
// GATES, fixed before the first run:
//   G1 the husk Fano (E-SPN-0048's gate, now with a start that can relax): for SPREAD and BROKEN, each husk
//      class's Fano factor is within 0.05 of 1 - n / g and at least 0.2 from 1 and from 1 + n / g, and the
//      two fills agree within 0.05 per class.
//   G2 the husk distribution: for SPREAD, the axis and diagonal class histograms of N have total variation
//      at most 0.02 from the binomial, and at most half their total variation from Poisson and from the
//      negative binomial.
//   G3 the ladder: for SPREAD and BROKEN and each charge, the three ratios n(s + 1) / n(s), s = 0, 1, 2,
//      spread (largest minus smallest) by at most 0.01, and by at most half the spread of the independent
//      Fermi-Dirac ratios and of the Bose-Einstein ratios.
//   G4 pairs: for SPREAD and BROKEN, R is within 3 percent of e^(-2 beta), beta from the mean plain ratio
//      of both charges.
//   G5 the control: with the threshold off, R misses e^(-2 beta) by more than 10 percent.
//   G6 energy and charge are exact in every run.
// Reported: the fills, the store shares, the Maxwell-Boltzmann empty-slot prediction e^(-n) beside the
// measured n(empty), the per-level occupations.
//
// FIRST RUN (2026-09-26, 24 s): G1, G2, G4, G6 pass, G3 fails, and G5 PASSED BY A HARNESS ERROR, corrected
// and rerun (second run, same numbers): status fail.
//   HUSK. Fano 0.503 and 0.503 against Fermi-Dirac 0.511 and 0.509 (SPREAD), 0.542 and 0.545 against 0.551
//   and 0.550 (BROKEN, which now relaxes: E-SPN-0048's frozen coherent fill was the depth symmetry). The
//   distributions: total variation from the binomial 0.0023 and 0.0007 (axis, diagonal), from Poisson 0.163
//   and 0.169, from the Bose-Einstein negative binomial 0.258 and 0.259. The husk modes are g independent
//   exclusive slots, to a total variation of 0.002.
//   PAIRS. R = 0.10562 against e^(-2 beta) = 0.10591 (SPREAD, beta 1.1226, miss 0.27 percent), 0.08419
//   against 0.08321 (BROKEN, beta 1.2432, miss 1.2 percent): mu_love + mu_fear = 0, with the rest energy 1.
//   LADDER. BROKEN passes (spread of the plain ratios 0.0038 and 0.0072 against Fermi-Dirac 0.027 and 0.031,
//   Bose-Einstein 0.032 and 0.032). SPREAD fails: its top ratio n(3) / n(2) is 0.343 for loves and 0.310 for
//   fears, one high and one low, so the plain spread is 0.018 and the fear's Fermi-Dirac spread 0.019 is
//   not twice it. On the two lower ratios, where the counts are largest, the plain ratios are 0.3246, 0.3275
//   (loves) and 0.3279, 0.3199 (fears) while the independent Fermi-Dirac ratios are near 0.286 and 0.316, so
//   the exclusive slot wins there, but the gate asked for three ratios and the third is noise at 100 samples.
//   CONTROL. With the threshold off beta is not defined: no move but the threshold changes a store (every
//   exchange and scattering needs equal stores and carries them along), so the stores are a conserved
//   multiset and the ladder is the start's (loves at stores 1 and 2 only, 0.073 and 0.127, fears at 0.133,
//   0.061, 0.006). The first run's G5 read that as a miss of exactly 1 and passed; corrected to require a
//   finite beta, it fails. What it shows is stronger than the gate: the threshold is the only thermalizing
//   move, so the model has a temperature only because it makes pairs.
//
// Depth L2: equilibrium statistics of the knit's own gas, read on the husk first and the bulk beside it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { coldBeat, coldEnergy, makeColdWeave, type ColdState, type ColdWeave } from '@/code/rule/cold-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'

const SIDE = 7
const DENSITY = 0.4
const BEATS = 1500
const FROM = 1000
const EVERY = 5
const LEVELS = 5
const BROKEN_SHARE = 1 / 8
const ROOTS = rootsD4()

function coldSpec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// each root's husk direction (drop x4), and the number of roots that cast it (2 on an axis, 1 on a diagonal)
const HUSK_KEYS: string[] = []
const HUSK_OF = Int32Array.from(
  ROOTS.map(r => {
    const key = `${r[0]},${r[1]},${r[2]}`
    let h = HUSK_KEYS.indexOf(key)

    if (h < 0) {
      HUSK_KEYS.push(key)
      h = HUSK_KEYS.length - 1
    }

    return h
  }),
)
const HUSK_SLOTS = HUSK_KEYS.map((_, h) => HUSK_OF.filter(x => x === h).length)

type Reading = {
  // husk: histogram of N per class (0 axis, 1 diagonal), and Fano sums
  histogram: Float64Array[]
  fanoSum: number[]
  fillSum: number[]
  modeCount: number[]
  // bulk: occupation per (charge, level) and empty
  level: Float64Array[]
  empty: number
  samples: number
  energyExact: boolean
  chargeExact: boolean
}

function startState(weave: ColdWeave, kind: 'spread' | 'broken'): ColdState {
  const n = weave.mesh.cellCount * 24
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)
  const columns = SIDE ** 3

  for (let i = 0; i < n; i++) {
    const cell = Math.floor(i / 24)
    const d = i % 24
    const key = kind === 'broken' ? (cell % columns) * 24 + d : i

    if (weyl(key + 1, GOLDEN) < DENSITY && !(kind === 'broken' && weyl(i + 1, SILVER) < BROKEN_SHARE)) {
      vibe[i] = weyl(key + 1, SILVER) < 0.5 ? 1 : -1
      store[i] = Math.floor(weyl(key + 7, SILVER) * 3)
    }
  }

  return { vibe, store, demon: new Int32Array(weave.mesh.cellCount * 12) }
}

function run(weave: ColdWeave, kind: 'spread' | 'broken'): Reading {
  let s = startState(weave, kind)
  const e0 = coldEnergy(s)
  const q0 = s.vibe.reduce((a, b) => a + b, 0)
  const columns = SIDE ** 3
  const modes = columns * HUSK_KEYS.length
  const gOf = HUSK_SLOTS.map(k => SIDE * k)
  const classOf = HUSK_SLOTS.map(k => (k === 2 ? 0 : 1))
  const counts = new Int32Array(modes)
  const sum = new Float64Array(modes)
  const square = new Float64Array(modes)
  const histogram = [new Float64Array(2 * SIDE + 1), new Float64Array(SIDE + 1)]
  const level = [new Float64Array(LEVELS), new Float64Array(LEVELS)]
  let empty = 0
  let samples = 0
  const slots = s.vibe.length

  for (let t = 0; t < BEATS; t++) {
    s = coldBeat(weave, s, t)

    const beat = t + 1

    if (beat <= FROM || beat % EVERY !== 0) {
      continue
    }

    counts.fill(0)

    for (let i = 0; i < slots; i++) {
      const v = s.vibe[i] ?? 0

      if (v === 0) {
        empty++
        continue
      }

      const cell = (i / 24) | 0
      const mode = (cell % columns) * HUSK_KEYS.length + (HUSK_OF[i % 24] ?? 0)

      counts[mode] = (counts[mode] ?? 0) + 1

      const bin = level[v > 0 ? 0 : 1]!
      const l = Math.min(LEVELS - 1, s.store[i] ?? 0)

      bin[l] = (bin[l] ?? 0) + 1
    }

    for (let m = 0; m < modes; m++) {
      const n = counts[m] ?? 0
      const h = histogram[classOf[m % HUSK_KEYS.length] ?? 0]!

      sum[m] = (sum[m] ?? 0) + n
      square[m] = (square[m] ?? 0) + n * n
      h[n] = (h[n] ?? 0) + 1
    }

    samples++
  }

  const fanoSum = [0, 0]
  const fillSum = [0, 0]
  const modeCount = [0, 0]

  for (let m = 0; m < modes; m++) {
    const h = m % HUSK_KEYS.length
    const c = classOf[h] ?? 0
    const mean = (sum[m] ?? 0) / samples

    if (mean <= 0) {
      continue
    }

    fanoSum[c] = (fanoSum[c] ?? 0) + ((square[m] ?? 0) / samples - mean * mean) / mean
    fillSum[c] = (fillSum[c] ?? 0) + mean / (gOf[h] ?? 1)
    modeCount[c] = (modeCount[c] ?? 0) + 1
  }

  for (const b of level) {
    for (let l = 0; l < LEVELS; l++) {
      b[l] = (b[l] ?? 0) / (samples * slots)
    }
  }

  return {
    histogram,
    fanoSum,
    fillSum,
    modeCount,
    level,
    empty: empty / (samples * slots),
    samples,
    energyExact: coldEnergy(s) === e0,
    chargeExact: s.vibe.reduce((a, b) => a + b, 0) === q0,
  }
}

// log of a binomial, Poisson and negative-binomial probability
function logChoose(n: number, k: number): number {
  let x = 0

  for (let i = 1; i <= k; i++) {
    x += Math.log(n - k + i) - Math.log(i)
  }

  return x
}

function logFactorial(k: number): number {
  let x = 0

  for (let i = 2; i <= k; i++) {
    x += Math.log(i)
  }

  return x
}

function totalVariation(measured: Float64Array, model: (k: number) => number): number {
  const total = measured.reduce((a, b) => a + b, 0)
  let tv = 0
  let modelMass = 0

  measured.forEach((c, k) => {
    const p = model(k)

    modelMass += p
    tv += Math.abs(c / total - p)
  })

  // the model's mass beyond the histogram's range counts in full
  return (tv + Math.max(0, 1 - modelMass)) / 2
}

type ClassStats = { fano: number; fill: number; g: number; fermi: number; bose: number; tvBinomial: number; tvPoisson: number; tvNegativeBinomial: number }

function classStats(r: Reading, c: number): ClassStats {
  const g = c === 0 ? 2 * SIDE : SIDE
  const fano = (r.fanoSum[c] ?? 0) / (r.modeCount[c] ?? 1)
  const fill = (r.fillSum[c] ?? 0) / (r.modeCount[c] ?? 1)
  const h = r.histogram[c]!
  const mean = g * fill
  const p = fill
  // Bose-Einstein for g bosonic states: N is negative binomial with r = g, success chance q = mean / (g + mean)
  const q = mean / (g + mean)

  return {
    fano,
    fill,
    g,
    fermi: 1 - fill,
    bose: 1 + fill,
    tvBinomial: totalVariation(h, k => Math.exp(logChoose(g, k) + k * Math.log(p) + (g - k) * Math.log(1 - p))),
    tvPoisson: totalVariation(h, k => Math.exp(-mean + k * Math.log(mean) - logFactorial(k))),
    tvNegativeBinomial: totalVariation(h, k => Math.exp(logChoose(g + k - 1, k) + g * Math.log(1 - q) + k * Math.log(q))),
  }
}

type Ladder = { plain: number[]; fermi: number[]; bose: number[]; spread: { plain: number; fermi: number; bose: number } }

function ladder(level: Float64Array): Ladder {
  const plain: number[] = []
  const fermi: number[] = []
  const bose: number[] = []
  const x = (n: number, k: number): number => n / (1 - k * n)

  for (let s = 0; s < 3; s++) {
    const a = level[s] ?? 0
    const b = level[s + 1] ?? 0

    plain.push(b / a)
    fermi.push(x(b, 1) / x(a, 1))
    bose.push(x(b, -1) / x(a, -1))
  }

  const spread = (v: number[]): number => Math.max(...v) - Math.min(...v)

  return { plain, fermi, bose, spread: { plain: spread(plain), fermi: spread(fermi), bose: spread(bose) } }
}

function pairs(r: Reading): { beta: number; ratio: number; predicted: number; miss: number } {
  const love = ladder(r.level[0]!)
  const fear = ladder(r.level[1]!)
  const all = [...love.plain, ...fear.plain]
  const beta = -Math.log(all.reduce((a, b) => a + b, 0) / all.length)
  const ratio = ((r.level[0]?.[0] ?? 0) * (r.level[1]?.[0] ?? 0)) / r.empty ** 2
  const predicted = Math.exp(-2 * beta)

  return { beta, ratio, predicted, miss: Math.abs(ratio / predicted - 1) }
}

export default experiment({
  id: 'spin/slot-statistics',
  code: 'E-SPN-0050',
  title:
    'the statistics of the slot at equilibrium in the cold vacuum: husk modes are binomial (independent exclusive slots), not Poisson or Bose-Einstein, the slot is Gibbs with one vibe of any store level, pair making sets mu_love + mu_fear = 0 through the rest energy, and without the threshold move there is no temperature',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const spec = coldSpec()
    const weave = makeColdWeave({ mesh, spec })
    const frozen = makeColdWeave({ mesh, spec, threshold: false })
    const runs = { spread: run(weave, 'spread'), broken: run(weave, 'broken') }
    const control = run(frozen, 'spread')
    const metrics: Record<string, number> = {}
    const round = (x: number): number => Number(x.toPrecision(6))
    const classes = ['axis', 'diagonal']
    let g1 = true
    let g2 = true
    let g3 = true
    let g4 = true

    for (const [name, r] of Object.entries(runs)) {
      classes.forEach((label, c) => {
        const x = classStats(r, c)

        metrics[`${name}Husk${label}Fano`] = round(x.fano)
        metrics[`${name}Husk${label}FermiDirac`] = round(x.fermi)
        metrics[`${name}Husk${label}BoseEinstein`] = round(x.bose)
        metrics[`${name}Husk${label}Fill`] = round(x.fill)
        metrics[`${name}Husk${label}TvBinomial`] = round(x.tvBinomial)
        metrics[`${name}Husk${label}TvPoisson`] = round(x.tvPoisson)
        metrics[`${name}Husk${label}TvNegativeBinomial`] = round(x.tvNegativeBinomial)
        g1 = g1 && Math.abs(x.fano - x.fermi) <= 0.05 && Math.abs(x.fano - 1) >= 0.2 && Math.abs(x.fano - x.bose) >= 0.2

        if (name === 'spread') {
          g2 = g2 && x.tvBinomial <= 0.02 && x.tvBinomial <= x.tvPoisson / 2 && x.tvBinomial <= x.tvNegativeBinomial / 2
        }
      })

      const fill = r.level.reduce((a, b) => a + b.reduce((x, y) => x + y, 0), 0)

      metrics[`${name}BulkFill`] = round(fill)
      metrics[`${name}BulkEmpty`] = round(r.empty)
      metrics[`${name}MaxwellBoltzmannEmpty`] = round(Math.exp(-fill))
      ;['love', 'fear'].forEach((charge, k) => {
        const l = ladder(r.level[k]!)

        r.level[k]!.forEach((x, s) => {
          metrics[`${name}${charge}Level${s}`] = round(x)
        })
        l.plain.forEach((x, s) => {
          metrics[`${name}${charge}Ratio${s}`] = round(x)
        })
        metrics[`${name}${charge}SpreadPlain`] = round(l.spread.plain)
        metrics[`${name}${charge}SpreadFermiDirac`] = round(l.spread.fermi)
        metrics[`${name}${charge}SpreadBoseEinstein`] = round(l.spread.bose)
        g3 = g3 && l.spread.plain <= 0.01 && l.spread.plain <= l.spread.fermi / 2 && l.spread.plain <= l.spread.bose / 2
      })

      const p = pairs(r)

      metrics[`${name}Beta`] = round(p.beta)
      metrics[`${name}PairRatio`] = round(p.ratio)
      metrics[`${name}PairPredicted`] = round(p.predicted)
      metrics[`${name}PairMiss`] = round(p.miss)
      g4 = g4 && p.miss <= 0.03
    }

    classes.forEach((label, c) => {
      g1 = g1 && Math.abs(classStats(runs.spread, c).fano - classStats(runs.broken, c).fano) <= 0.05
      metrics[`fillsDiffer${label}Fano`] = round(Math.abs(classStats(runs.spread, c).fano - classStats(runs.broken, c).fano))
    })

    const pc = pairs(control)
    // corrected after the first run: there beta came out infinite (a level with no vibes), which made the
    // miss exactly 1 and passed G5 without any ladder to compare; the control now needs a finite beta
    const g5 = Number.isFinite(pc.beta) && pc.miss > 0.1
    const controlLevels: Record<string, number> = {}

    ;['love', 'fear'].forEach((charge, k) => {
      control.level[k]!.forEach((x, s) => {
        controlLevels[`thresholdOff${charge}Level${s}`] = round(x)
      })
    })
    const g6 = [runs.spread, runs.broken, control].every(r => r.energyExact && r.chargeExact)
    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5, G6: g6 }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the side-7 cold vacuum the husk modes are g independent exclusive slots (total variation 0.002 from the binomial, 0.16 from Maxwell-Boltzmann, 0.26 from Bose-Einstein, Fano at 1 - n/g from a spread fill and from a depth-broken coherent one), pair making sets mu_love + mu_fear = 0 (n(+,0) n(-,0) / n(empty)^2 = e^(-2 beta) to 0.3 and 1.2 percent), the broken fill\'s store ladder is the Gibbs measure of a slot holding one vibe of any level (ratio spread 0.004 to 0.007, against 0.03 for independent Fermi-Dirac and Bose-Einstein levels) while the spread fill\'s top rung is too noisy for the gate, and with the threshold off there is no temperature at all, because no other move changes a store',
      metrics: {
        ...metrics,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        thresholdOffBeta: round(pc.beta),
        thresholdOffPairRatio: round(pc.ratio),
        thresholdOffPairPredicted: round(pc.predicted),
        thresholdOffPairMiss: round(pc.miss),
        thresholdOffBulkEmpty: round(control.empty),
        ...controlLevels,
        samplesPerRun: runs.spread.samples,
      },
      notes:
        'L2, Weyl fills, no random numbers, side 7, 1,500 beats, 100 samples in beats 1,000 to 1,500. Status fail on G3 (the spread fill\'s third ladder ratio) and G5 (the threshold-off control has no temperature to compare, a harness error in the first run that passed it, corrected). The pair relation R = e^(-2 beta) had been checked on E-SPN-0048\'s printed shares before this file was written, so its pass on the spread fill is a replication, and on the broken fill a new case.',
    })
  },
})
