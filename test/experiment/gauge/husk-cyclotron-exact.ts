// The exact lattice Landau spectrum of the charged fear walk, and the cause of the E-FRC-0176 deficit.
// E-FRC-0176 put the palindromic fear walk in a uniform husk field (B = 2 pi 40 / 64^2 per plaquette, the
// Landau gauge theta_y = B x on a 64 x 64 torus) and read Landau levels spaced 0.909, 0.835 and 0.770 of the
// continuum 2 q B, with the zero point at 0.953 of q B, against 5 percent gates. Its own probe found the first
// spacing at 0.909, 0.953, 0.977 of 2 q B at 40, 20, 10 quanta: a shortfall in proportion to B.
//
// The derivation, done before the measurement below and with no time evolution (code/measure/walk-landau):
// - In the Landau gauge the beat keeps e^(i k_y y), so for each k_y it is a walk on the x line whose y
//   streams carry e^(+-i q B (x - c)), c = k_y / (q B) the orbit center. Cut to a strip with a reflecting wall
//   at each end it is a finite unitary, and its eigenphases, read through the Cayley transform
//   i (I - U)(I + U)^(-1) (eigenvalue tan(phi / 2)) with Hermitian eigenvectors, are the walk's exact lattice
//   Landau levels, a Hofstadter problem for the walk's own symbol. A level counts when its eigenvector lies
//   99.9 percent in the middle half of the strip
// - The strips, chosen so each holds one orbit center (the palindrome streams y twice at one x, so the beat
//   repeats when q B x moves by pi): width 160 at 10 quanta, 96 at 20, 64 at 40 (and 80 as the convergence
//   check), 48 for charge 2 at 40. Changed for the second run, after the first: 128 at 20, 80 at 40 (64 kept
//   for A2 and A3), 40 for charge 2, because 96 and 64 held only 4 bulk levels where the gates name 5 and 48
//   held two orbit centers for charge 2 (see the notes)
// - Onsager's rule with the walk's own band, S(E_n) = 2 pi q B (n + 1/2), S(E) the k-space area of the band
//   through 0 above phase E, and its first order: S = (2 pi / w0) |E| (1 + beta |E|), w0 = sqrt(det Q) = 2,
//   so the n-th spacing is short of omega_c = 2 q B by the fraction 2 beta omega_c (n + 1). The deficit is
//   the band's shape away from its bottom, which the curvature alone leaves out
//
// What the derivation gave, in a probe (tmp/landau-probe.ts) before these gates were written, and disclosed as
// such: at 40 quanta the exact levels are -0.058394, -0.170052, -0.272403, spacings 0.90987 and 0.83404 of
// 2 q B and the zero point 0.95168 of q B, against E-FRC-0176's measured 0.909, 0.835 and 0.953; Onsager with
// the band gives 0.90730, 0.83254 and 0.9746; beta = 0.4329. So the prediction is on record before the
// measurement: the deficit is the lattice band, exactly, and the continuum 2 q B is the wrong reference.
//
// Gates, fixed before the measurement (section B has not been run by this experiment's author):
// A. The exact carrier:
//    A1 every strip beat is unitary to 1e-12
//    A2 each of the first four bulk eigenstates at 40 quanta, lifted onto E-FRC-0176's 64 x 64 torus as
//       e^(i k_y y) phi(x), is turned by E-FRC-0176's own torus beat (code/measure/charged-walk) by exactly its
//       strip eigenphase: largest residual under 1e-9. This makes the strip levels the torus's levels, not a
//       model of them
//    A3 widths 64 and 80 give the same first four levels at 40 quanta to 1e-9
// B. The measurement: E-FRC-0176's return spectrum (its packet at x = 0, width 4, wave vector (0.3, 0), 2,048
//    beats, Hann window, peaks above 2 percent of the top on a 0.0005 grid, here refined by a parabola), at 10,
//    20 and 40 quanta, charge 1:
//    B1 every measured peak above the fifth exact level is within 0.002 of an exact level, at every field,
//       and at least 3 distinct levels are hit at every field
//    B2 each spacing between peaks on adjacent levels is within 1 percent of the exact spacing
//    Control: the continuum 2 q B misses the measured first spacing at 40 quanta by more than 5 percent. A
//    test that reads the continuum answer would fail here
// C. The closed form: C1 Onsager's spacings from the band are within 0.5 percent of the exact ones at 10 and
//    20 quanta (reported at 40), and C2 the exact first-spacing deficit at 10 quanta is within 5 percent of
//    2 beta omega_c. Reported: the zero point against Onsager's (the beyond-Onsager part, a Berry or orbital
//    moment term), the deficit ratios between fields, and E-FRC-0176's turn rates rerun at 40 quanta against
//    the exact spacing at the packet's band energy
//
// Depth L2: the Hofstadter and Onsager treatments of a charged lattice walk are known. What is measured is
// that the fear walk's own spectrum accounts for the whole E-FRC-0176 deficit. The charge is the fear walk,
// a stand-in for a charge that carries a phase: the knit's vibes carry none (E-FRC-0173). The field is
// written onto the husk plane directly, as E-FRC-0176 did, and a uniform field is static under any odd
// plaquette force (its curl vanishes on every link), so this reading does not depend on the light rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { bandCurvature, centroid, chargedBeat, packet, PALINDROME, uniformField, type Field } from '@/code/measure/charged-walk'
import {
  areaNonlinearity,
  bandPhase,
  bulkStates,
  landauStrip,
  liftToTorus,
  onsagerLevels,
  returnSpectrumPeaks,
  torusResidual,
  unitarityError,
} from '@/code/measure/walk-landau'

const SIDE = 64
const SIGMA = 4
const K0 = 0.3
const SPECTRUM_BEATS = 2048
const TURN_BEATS = 205
const PEAK_TOLERANCE = 0.002
const LEVELS = 5

const fieldOf = (quanta: number): number => (2 * Math.PI * quanta) / (SIDE * SIDE)

// the strip width for each field and charge, one orbit center per strip
// (second run: 20 and 40 quanta widened from 96 and 64, charge 2 narrowed from 48, see the notes)
const WIDTH: Record<string, number> = { '10:1': 160, '20:1': 128, '40:1': 80, '40:2': 40 }

// two strip states closer than this are one level (the even-dock and odd-dock copies); levels are at least
// 0.05 apart
const SAME_LEVEL = 1e-4

// the unwrapped angle of the centroid's velocity, beat by beat (E-FRC-0176's reading)
function turning(field: Field, charge: number): number[] {
  const w = packet({ side: SIDE, x0: 0, y0: SIDE / 2, sigma: SIGMA, kx: K0, ky: 0, target: 0, order: PALINDROME })
  const angles: number[] = []

  let previous = centroid(w, SIDE)
  let last = Number.NaN

  for (let t = 0; t < TURN_BEATS; t++) {
    chargedBeat(w, field, charge, PALINDROME)

    const now = centroid(w, SIDE)
    const d = [0, 1].map(i => ((((now[i] ?? 0) - (previous[i] ?? 0) + SIDE * 1.5) % SIDE) - SIDE / 2))
    const angle = Math.atan2(d[1] ?? 0, d[0] ?? 0)
    const unwrapped = Number.isNaN(last) ? angle : last + ((((angle - last + 3 * Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI

    angles.push(unwrapped)
    last = unwrapped
    previous = now
  }

  return angles
}

// the least-squares slope of a series against its index
function slope(xs: readonly number[]): number {
  const n = xs.length
  const mt = (n - 1) / 2
  const mx = xs.reduce((a, b) => a + b, 0) / n

  return xs.reduce((s, x, t) => s + (t - mt) * (x - mx), 0) / xs.reduce((s, _, t) => s + (t - mt) ** 2, 0)
}

export default experiment({
  id: 'gauge/husk-cyclotron-exact',
  code: 'E-FRC-0182',
  title:
    "the exact lattice Landau spectrum of the charged fear walk: in the Landau gauge each k_y reduces the walk to a strip whose eigenphases, lifted onto E-FRC-0176's torus, are that torus beat's own levels, and E-FRC-0176's measured Landau levels sit on them, so the 9 to 23 percent shortfall from 2 q B is the walk's lattice band, which Onsager's rule with the band's full shape reproduces and whose first order is 2 beta omega_c (n + 1)",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const bowl = bandCurvature(PALINDROME)
    const w0 = Math.sqrt(bowl.eigen[0] * bowl.eigen[1])
    const beta = areaNonlinearity({ w0, order: PALINDROME })
    const out: Record<string, number> = { w0, beta }

    // A and C: the exact levels
    let unitarity = 0

    const exact = new Map<string, number[]>()

    for (const key of Object.keys(WIDTH)) {
      const [quanta, charge] = key.split(':').map(Number) as [number, number]
      const width = WIDTH[key] as number
      const strip = landauStrip({ width, field: fieldOf(quanta), charge, center: width / 2, order: PALINDROME })
      const levels = bulkStates(strip, 0.05, -1, SAME_LEVEL).slice(0, LEVELS).map(s => s.phase)
      const wc = charge * fieldOf(quanta) * w0

      unitarity = Math.max(unitarity, unitarityError(strip.beat))
      exact.set(key, levels)
      out[`exact${quanta}Charge${charge}Levels`] = levels.length
      levels.forEach((l, n) => {
        out[`exact${quanta}Charge${charge}Level${n}`] = l
      })
      out[`exact${quanta}Charge${charge}ZeroPointOverHalf`] = -(levels[0] ?? 0) / (wc / 2)
      levels.slice(1).forEach((l, n) => {
        out[`exact${quanta}Charge${charge}Spacing${n}${n + 1}OverContinuum`] = ((levels[n] ?? 0) - l) / wc
      })

      const onsager = onsagerLevels({ field: fieldOf(quanta), charge, count: LEVELS, order: PALINDROME })

      out[`onsager${quanta}Charge${charge}ZeroPointOverHalf`] = -(onsager[0] ?? 0) / (wc / 2)
      onsager.slice(1, levels.length).forEach((l, n) => {
        out[`onsager${quanta}Charge${charge}Spacing${n}${n + 1}OverExact`] = ((onsager[n] ?? 0) - l) / ((levels[n] ?? 0) - (levels[n + 1] ?? 0))
      })
      out[`firstOrder${quanta}Charge${charge}Deficit01`] = 2 * beta * wc
      out[`exact${quanta}Charge${charge}Deficit01`] = 1 - ((levels[0] ?? 0) - (levels[1] ?? 0)) / wc
    }

    // A2: the strip states are the torus's
    const field40 = uniformField(SIDE, 40)
    const strip40 = landauStrip({ width: 64, field: fieldOf(40), charge: 1, center: 32, order: PALINDROME })
    const states40 = bulkStates(strip40, 0.05, -1, SAME_LEVEL).slice(0, 4)

    let residual = 0

    for (const state of states40) {
      const walk = liftToTorus({ state, strip: strip40, side: SIDE, x0: 0, field: fieldOf(40), charge: 1 })

      residual = Math.max(residual, torusResidual({ walk, field: field40, charge: 1, order: PALINDROME, phase: state.phase }))
    }

    // A3: width convergence
    const convergence = Math.max(...states40.map((s, n) => Math.abs(s.phase - (exact.get('40:1')?.[n] ?? 0))))

    out['a1WorstUnitarity'] = unitarity
    out['a2WorstTorusResidual'] = residual
    out['a2StatesChecked'] = states40.length
    out['a3WidthConvergence'] = convergence

    const okA = unitarity < 1e-12 && residual < 1e-9 && states40.length === 4 && convergence < 1e-9

    // B: the measurement
    let okB1 = true
    let okB2 = true
    let control = 0

    for (const quanta of [10, 20, 40]) {
      const levels = exact.get(`${quanta}:1`) ?? []
      const field = uniformField(SIDE, quanta)
      const start = packet({ side: SIDE, x0: 0, y0: SIDE / 2, sigma: SIGMA, kx: K0, ky: 0, target: 0, order: PALINDROME })
      const peaks = returnSpectrumPeaks({ start, field, charge: 1, order: PALINDROME, beats: SPECTRUM_BEATS })
      // below the last exact level by half a spacing (the first run read an undefined fifth level here and
      // compared every peak down to -0.6 with the fourth, see the notes)
      const last = levels.length - 1
      const bottom = (levels[last] ?? 0) - 0.5 * ((levels[last - 1] ?? 0) - (levels[last] ?? 0))
      const matched: { rank: number; phase: number }[] = []

      let worst = 0

      peaks.refined.forEach((p, i) => {
        if (p <= bottom) {
          return
        }

        const rank = levels.reduce((best, l, n) => (Math.abs(l - p) < Math.abs((levels[best] ?? 0) - p) ? n : best), 0)
        const miss = Math.abs(p - (levels[rank] ?? 0))

        worst = Math.max(worst, miss)
        matched.push({ rank, phase: p })
        out[`b${quanta}Peak${i}`] = p
        out[`b${quanta}Peak${i}Rank`] = rank
        out[`b${quanta}Peak${i}Height`] = peaks.power[i] ?? 0
        out[`b${quanta}Peak${i}GridPhase`] = peaks.grid[i] ?? 0
      })

      const ranks = new Set(matched.map(m => m.rank))
      const wc = fieldOf(quanta) * w0

      let worstSpacing = 0

      for (const m of matched) {
        const next = matched.find(o => o.rank === m.rank + 1)

        if (next) {
          const measured = m.phase - next.phase
          const theirs = (levels[m.rank] ?? 0) - (levels[m.rank + 1] ?? 0)

          worstSpacing = Math.max(worstSpacing, Math.abs(measured / theirs - 1))
          out[`b${quanta}MeasuredSpacing${m.rank}${m.rank + 1}OverContinuum`] = measured / wc

          if (quanta === 40 && m.rank === 0) {
            control = Math.abs(measured / wc - 1)
          }
        }
      }

      out[`b${quanta}WorstPeakMiss`] = worst
      out[`b${quanta}LevelsHit`] = ranks.size
      out[`b${quanta}WorstSpacingOverExact`] = worstSpacing
      okB1 = okB1 && worst < PEAK_TOLERANCE && ranks.size >= 3
      okB2 = okB2 && worstSpacing < 0.01
    }

    out['bControlContinuumMissAt40'] = control

    const okControl = control > 0.05

    // C
    const onsagerWorst = Math.max(
      ...[10, 20].flatMap(q => [0, 1, 2, 3].map(n => Math.abs((out[`onsager${q}Charge1Spacing${n}${n + 1}OverExact`] ?? 0) - 1))),
    )
    const firstOrder = (out['exact10Charge1Deficit01'] ?? 0) / (out['firstOrder10Charge1Deficit01'] ?? 1) - 1

    out['c1OnsagerWorstAt10And20'] = onsagerWorst
    out['c2FirstOrderMissAt10'] = firstOrder
    out['cDeficitRatio20Over10'] = (out['exact20Charge1Deficit01'] ?? 0) / (out['exact10Charge1Deficit01'] ?? 1)
    out['cDeficitRatio40Over20'] = (out['exact40Charge1Deficit01'] ?? 0) / (out['exact20Charge1Deficit01'] ?? 1)

    const okC = onsagerWorst < 0.005 && Math.abs(firstOrder) < 0.05

    // reported: E-FRC-0176's turn rates, against the exact spacing nearest the packet's band energy
    const up = slope(turning(field40, 1))
    const down = slope(turning(uniformField(SIDE, -40), 1))
    const two = slope(turning(field40, 2))
    const energy = bandPhase(K0, 0, PALINDROME)
    const levels40 = exact.get('40:1') ?? []
    const nearest = levels40.reduce((best, l, n) => (Math.abs(l - energy) < Math.abs((levels40[best] ?? 0) - energy) ? n : best), 0)
    const local = (levels40[Math.max(0, nearest - 1)] ?? 0) - (levels40[Math.max(0, nearest - 1) + 1] ?? 0)

    out['turnPacketBandEnergy'] = energy
    out['turnNearestLevel'] = nearest
    out['turnRateB'] = up
    out['turnRateMinusB'] = down
    out['turnRateCharge2'] = two
    out['turnRateBOverExactSpacing'] = Math.abs(up) / local
    out['turnRateMinusBOverExactSpacing'] = Math.abs(down) / local
    out['turnRateBOverContinuum'] = Math.abs(up) / (fieldOf(40) * w0)

    const ok = okA && okB1 && okB2 && okControl && okC

    return verdict({
      status: ok ? 'pass' : okB1 && okB2 ? 'partial' : 'fail',
      claim:
        "the fear walk's exact lattice Landau levels, from the k_y-reduced strip, are the E-FRC-0176 torus beat's own eigenphases (residual under 1e-9), and E-FRC-0176's return spectrum at 10, 20 and 40 quanta sits on them within 0.002 with every spacing within 1 percent, while missing the continuum 2 q B by more than 5 percent at 40 quanta, so the deficit is the lattice band; Onsager's rule with the band's full shape gives the spacings within 0.5 percent at 10 and 20 quanta and the first-order deficit 2 beta omega_c (n + 1) holds within 5 percent at 10",
      metrics: { ...out, sectionA: okA ? 1 : 0, sectionB1: okB1 ? 1 : 0, sectionB2: okB2 ? 1 : 0, sectionControl: okControl ? 1 : 0, sectionC: okC ? 1 : 0 },
      control: { continuumMissAt40: control },
      notes:
        'L2, stand-in charge (the fear walk). Exact diagonalization of the k_y-reduced strip (Cayley transform, Hermitian Jacobi), no time evolution for sections A and C; section B reruns the E-FRC-0176 protocol. The exact levels and the Onsager comparison were computed in a probe before the gates were written (disclosed in the header). First run 2026-09-26 (tmp/frc0182.log, 419 s): fail, on three construction errors and one threshold. (1) The width-96 strip at 20 quanta and the width-64 strip at 40 held only 4 bulk levels, so B1 compared every peak down to -0.6 with the fourth level (misses 0.19 and 0.17) where each peak below it sat within 2e-6 of an exact level that the wider strips (128, 80) give: -0.24830, -0.29740, -0.34466, -0.39022 against -0.248300, -0.297395, -0.344659, -0.390224 at 20 quanta, -0.45506, -0.53720 against -0.455059, -0.537205 at 40. (2) C1 divided by a fifth exact level that did not exist (-0.259, -0.240). (3) The width-48 charge-2 strip held two orbit centers, so its levels came in pairs 2e-7 to 4e-6 apart, reported only. These were fixed (wider strips, the peak cutoff from the last computed level, one level per 1e-4) with no gate changed. (4) A2 read a torus residual of 4.65e-9 against its 1e-9 gate: the Jacobi eigenvectors of the even-odd degenerate pairs carry that error, and the gate is kept, so A fails. First-run numbers that the fixes do not touch: every 10-quanta peak within 2.1e-6 of an exact level, 5 hit, spacings within 6.9e-5 of the exact; spacings at 20 and 40 within 2.3e-5; the continuum 2 q B misses the measured first spacing at 40 quanta by 9.0 percent; Onsager within 0.025 percent at 10 quanta; the first-order deficit 2 beta omega_c at 10 quanta 4.5 percent above the exact deficit; E-FRC-0176 turn rates 0.84 (+B) and 0.93 (-B) of the exact first spacing, 0.76 of 2 q B, a mixture of levels 0 to 5 (peak heights 1, 0.61, 0.81, 0.73, 0.50, 0.27).',
    })
  },
})
