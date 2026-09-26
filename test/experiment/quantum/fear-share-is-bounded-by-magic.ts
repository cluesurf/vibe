// What the identification fear = magic predicts: the largest fear share a two-role whole can hold.
//
// For a whole of L loves and F fears, sum |W| = (L + F) / (L - F), so the fear share f = F / (L + F) is
// f = (1 - 1 / s) / 2 with s = sum |W| = e^mana (E-QTM-0119). The largest fear share is therefore fixed by the
// largest Wigner norm, the maximum mana, of a pure state of two qutrits:
//
//   f_max = (1 - 1 / s_max) / 2,   s_max = max over |psi> of sum_x |<psi| A(x) |psi>| / 9.
//
// Cauchy-Schwarz with sum W^2 = 1/9 gives s <= 3 and f <= 1/3, the bound E-FRC-0122 and E-QTM-0099 gate
// on, reached only by a flat |W| = 1/27 on all 81 points (54 loves, 27 fears).
//
// PREDICTIONS, written 2026-09-25 before s_max was computed:
// P1. s_max < 3 strictly: no pure two-qutrit state has a flat Wigner function, so a two-role whole's fear
//     share never reaches 1/3. The reason offered: for one qutrit the same bound, sqrt 3 = 1.732, is not
//     reached either (the Strange state's 5/3 is the maximum).
// P2. every fear share the knit's two-role wholes reach under the swap phase is at most (1 - 1 / s_found) / 2.
//     (Set before the first run of this file, after E-QTM-0120's probe found the color law's wholes are not
//     always states: the bound is about states, so the color law's share is reported and not gated.)
// The only closed forms admitted for s_max, before seeing it: 3 and 25/9 (the Strange state on both roles).
// Any other value is reported as a number, with no closed form claimed (the E-MTH-0010 rule).
//
// Method: s_max = max over sign patterns sigma of the top eigenvalue of sum_x sigma_x A(x) / 9, and the
// alternating ascent (signs of the current W, then the top eigenvector of that sign pattern's operator)
// never lowers sum |W|. Checked on one qutrit first, where all 2^9 = 512 sign patterns are enumerated and
// the maximum must be 5/3. On two qutrits the ascent runs from 256 deterministic Weyl starts (weylUnitVector)
// and from the Strange state on both roles and the antisymmetric pair (|01> - |10>) / sqrt 2; the largest
// value found is a lower bound on s_max, and 3 the certified upper bound.
//
// The knit's side: every fear share of every two-role whole along the histories of E-QTM-0119 (both laws).
// Three roles, for comparison, derived: s <= 3^(3/2), f <= (1 - 3^(-3/2)) / 2 = 0.404; the three-role
// singlet of E-FRC-0120 holds 18 fears of 90 units, share 0.2.
//
// Gates, fixed before the first run: one qutrit's exhaustive maximum is 5/3 to 1e-12 and the ascent reaches it;
// on two qutrits the value found lies in [25/9, 3]; P1 holds (found below 3 - 1e-6) and P2 holds (no knit
// share above the predicted maximum by more than 1e-12).
//
// First run, 2026-09-25: status fail from a harness error in the first gate, not the measurement. The one-
// qutrit maximum was divided by 3 twice (signOperator already divides by the dimension), printing 5/9 where
// the enumeration gives 5/3, which the ascent also found. Corrected and rerun, gates unchanged. Every other
// number was the same in both runs: the largest two-qutrit norm found is 25/9 = 2.7778 (3 of 256 Weyl starts,
// and the Strange x Strange start, which does not climb), one of the two pre-registered closed forms, so the
// predicted ceiling is (1 - 9/25) / 2 = 0.32 = 8/25. P1 and P2 hold. The knit's 0.32 comes only from the
// Strange x Strange start (gain 0 over it); from |0>|1> the knit reaches 0.3076. 25/9 is a lower bound from
// search, not a proof that it is the maximum.
//
// Depth L1 for the bound (known phase-space mathematics, the maximum found by a deterministic search), L2 for
// the comparison with the knit.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { fearKernels, meetingKernel, swapPhase, wholeLovesAndFears } from '@/code/rule/fear-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  runWhole,
  vacuumBackground,
  weylBackground,
  type RoleState,
} from '@/code/measure/knit-magic'
import { gridWeights, operator, phasePointOperators, type Operator } from '@/code/measure/grid-weights'
import { hermitianSpectrum, topEigenvector } from '@/code/measure/qutrit-clifford'
import { weylUnitVector } from '@/code/tool/weyl'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const MATTER_SCALE = 2.11
const WEYL_STARTS = 256
const MAX_STEPS = 400
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]

type State = { re: number[]; im: number[] }

function norm(state: State): number {
  return state.re.reduce((s, x, i) => s + x * x + (state.im[i] ?? 0) ** 2, 0)
}

function signOperator(signs: readonly number[], points: readonly Operator[]): Operator {
  const n = points[0]?.n ?? 1
  const out = operator(n)

  points.forEach((a, p) => {
    const s = (signs[p] ?? 0) / n

    for (let i = 0; i < n * n; i++) {
      out.re[i] = (out.re[i] ?? 0) + s * (a.re[i] ?? 0)
      out.im[i] = (out.im[i] ?? 0) + s * (a.im[i] ?? 0)
    }
  })

  return out
}

// alternating ascent of sum |W| from a start; returns the value reached
function ascend(start: State, points: readonly Operator[]): number {
  const size = Math.sqrt(norm(start))
  let state: State = { re: start.re.map(x => x / size), im: start.im.map(x => x / size) }
  let value = 0

  for (let step = 0; step < MAX_STEPS; step++) {
    const w = gridWeights({ re: state.re, im: state.im, points })
    const current = w.reduce((s, x) => s + Math.abs(x), 0)

    if (step > 0 && current - value < 1e-14) {
      value = Math.max(value, current)
      break
    }

    value = current

    const top = topEigenvector(signOperator(w.map(x => (x >= 0 ? 1 : -1)), points))

    state = { re: top.re, im: top.im }
  }

  return value
}

export default experiment({
  id: 'quantum/fear-share-is-bounded-by-magic',
  code: 'E-QTM-0121',
  title:
    'the fear share of a two-role whole is (1 - e^(-mana)) / 2, so its ceiling is set by the most magic pure state of two qutrits: a deterministic search over sign patterns bounds that state\'s Wigner norm, which sets the predicted ceiling against the 1/3 of Cauchy-Schwarz, and every fear share the knit reaches is checked against it',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // one qutrit: every sign pattern, and the ascent
    const points1 = phasePointOperators(1)
    let exhaustive = 0

    for (let mask = 0; mask < 512; mask++) {
      const signs = Array.from({ length: 9 }, (_, p) => ((mask >> p) & 1 ? -1 : 1))
      const spectrum = hermitianSpectrum(signOperator(signs, points1))

      exhaustive = Math.max(exhaustive, spectrum[spectrum.length - 1] ?? 0)
    }

    let ascentOne = 0

    for (let k = 0; k < 64; k++) {
      const v = weylUnitVector({ dimension: 6, start: 1000 + k })

      ascentOne = Math.max(ascentOne, ascend({ re: Array.from(v.slice(0, 3)), im: Array.from(v.slice(3, 6)) }, points1))
    }

    // two qutrits
    const points2 = phasePointOperators(2)
    const s = Math.SQRT1_2
    const strange = [0, s, -s]
    const strangeStrange: State = {
      re: Array.from({ length: 9 }, (_, i) => (strange[Math.floor(i / 3)] ?? 0) * (strange[i % 3] ?? 0)),
      im: new Array<number>(9).fill(0),
    }
    const antisymmetric: State = { re: [0, s, 0, -s, 0, 0, 0, 0, 0], im: new Array<number>(9).fill(0) }
    const structured = [ascend(strangeStrange, points2), ascend(antisymmetric, points2)]
    const found: number[] = []

    for (let k = 0; k < WEYL_STARTS; k++) {
      const v = weylUnitVector({ dimension: 18, start: 2000 + k })

      found.push(ascend({ re: Array.from(v.slice(0, 9)), im: Array.from(v.slice(9, 18)) }, points2))
    }

    const best = Math.max(...found, ...structured)
    const startsAtBest = found.filter(x => Math.abs(x - best) < 1e-9).length
    const strangeStart = gridWeights({ re: strangeStrange.re, im: strangeStrange.im, points: points2 }).reduce((t, x) => t + Math.abs(x), 0)
    const predictedShare = (1 - 1 / best) / 2
    const bestMana = Math.log(best)

    // the knit's fear shares
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const dock0 = Array.from({ length: 24 }, (_, d) => d)
    let knitMaxShare = 0
    let knitWholes = 0
    // the color law's wholes are not always states (E-QTM-0120's probe), so its share is reported, not gated
    let colorMaxShare = 0
    // the largest share reached per start, and the largest reached after the start (so made by the knit)
    const perStart = STARTS.map(() => ({ max: 0, gainedOverStart: Number.NEGATIVE_INFINITY }))

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: MATTER_SCALE })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: dock0, beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)

        STARTS.forEach((start, si) => {
          const startWhole = productWhole([a, b], start)
          const startCounts = wholeLovesAndFears(startWhole)
          const startShare = Number(startCounts.fears) / Number(startCounts.loves + startCounts.fears)
          const tally = perStart[si] ?? { max: 0, gainedOverStart: 0 }

          for (const [li, law] of [{ kernel4: kThird }, { kernel4: [] as number[][], color: colorOn }].entries()) {
            for (const step of runWhole({ weave, start: startWhole, records: mine, kernel4: law.kernel4, color: law.color })) {
              const { loves, fears } = wholeLovesAndFears(step.whole)
              const share = Number(fears) / Number(loves + fears)

              knitWholes++

              if (li === 1) {
                colorMaxShare = Math.max(colorMaxShare, share)
                continue
              }

              knitMaxShare = Math.max(knitMaxShare, share)
              tally.max = Math.max(tally.max, share)
              tally.gainedOverStart = Math.max(tally.gainedOverStart, share - startShare)
            }
          }
        })
      }
    }

    const p1 = best < 3 - 1e-6
    const p2 = knitMaxShare <= predictedShare + 1e-12
    // signOperator already divides by the dimension, so its top eigenvalue is sum |W| itself
    const ok = Math.abs(exhaustive - 5 / 3) < 1e-12 && Math.abs(ascentOne - 5 / 3) < 1e-9 && best >= 25 / 9 - 1e-12 && best <= 3 + 1e-12 && p1 && p2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one qutrit\'s largest Wigner norm is 5/3 by all 512 sign patterns and the ascent finds it; on two qutrits the largest norm found from 258 starts is 25/9, the Strange state on both roles, below the Cauchy-Schwarz 3, predicting a fear-share ceiling of 8/25 = 0.32 against the gated 1/3; no fear share the knit reaches exceeds it, and the knit reaches 0.32 only from the Strange x Strange start',
      metrics: {
        oneQutritExhaustiveNorm: exhaustive,
        oneQutritAscentNorm: ascentOne,
        twoQutritBestNorm: best,
        twoQutritBestMana: bestMana,
        twoQutritStartsAtBest: startsAtBest,
        weylStarts: WEYL_STARTS,
        strangeStrangeStartNorm: strangeStart,
        strangeStrangeAscentNorm: structured[0] ?? 0,
        antisymmetricAscentNorm: structured[1] ?? 0,
        predictedMaxFearShare: predictedShare,
        knitWholes,
        knitMaxFearShare: knitMaxShare,
        colorLawMaxFearShare: colorMaxShare,
        knitMaxShareFromBasisStart: perStart[0]?.max ?? -1,
        knitMaxShareFromStrangeBasisStart: perStart[1]?.max ?? -1,
        knitMaxShareFromStrangeStrangeStart: perStart[2]?.max ?? -1,
        knitLargestGainOverStartBasis: perStart[0]?.gainedOverStart ?? -1,
        knitLargestGainOverStartStrangeBasis: perStart[1]?.gainedOverStart ?? -1,
        knitLargestGainOverStartStrangeStrange: perStart[2]?.gainedOverStart ?? -1,
        predictionP1Holds: p1 ? 1 : 0,
        predictionP2Holds: p2 ? 1 : 0,
        threeRoleShareBound: (1 - 3 ** -1.5) / 2,
      },
      control: {
        cauchySchwarzNorm: 3,
        cauchySchwarzShare: 1 / 3,
        strangeStrangeNorm: 25 / 9,
        strangeStrangeShare: (1 - 9 / 25) / 2,
      },
      notes:
        'L1 and L2. The maximum over pure states of sum |W| is the maximum over sign patterns of the top eigenvalue of sum sigma_x A(x) / 9, since sum |W| = max over sigma of sum sigma W; the ascent climbs that monotonely but can stop at a local maximum, so the value found is a lower bound on s_max and 3 is the only certified upper bound. P2 compares against that lower bound, so a knit share above it would mean the search missed, not that the identity failed.',
    })
  },
})
