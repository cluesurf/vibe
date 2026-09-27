// Where the knit leaves a two-role whole after a long time: the fear-share distribution over deterministically
// enumerated starts, against the Haar-typical two-qutrit state.
//
// The fear share of a whole is f = F / (L + F) = (1 - 1 / s) / 2, s the Wigner norm (E-QTM-0121). The fear beat
// is a magic gate and the links are the Clifford group (E-QTM-0117, 0118), so the pair's role unitary is a
// product of Cliffords and swap phases; with enough meetings such a product is spread over the unitary group,
// and the whole should look like a typical pure state of two qutrits. The roadmap quotes 0.297 as the Haar
// mean fear share.
//
// Starts, enumerated, no sampling: the product of any two of the 21 one-role pure states the whole units can
// write, the 12 stabilizer states (W = 1/3 on a line of Z3^2, no fear) and the 9 Strange states (W = -1/3 at
// one point), so 441 ordered starts per pair, from fear share 0 (stabilizer x stabilizer) to 8/25 (Strange x
// Strange). Histories: every meeting pair of dock 0 on the side-3 color weave (E-QTM-0119), the vacuum and a
// golden-ratio Weyl matter background, 480 beats, both laws (the swap phase at 2 pi / 3, and the color law
// with its frames, E-QTM-0123). The long-time distribution is the fear share at every beat from 240 to 479.
// The Haar reference is computed here, not quoted: 20,000 pure states from golden Weyl directions on the
// sphere of C^9 (weylUnitVector, normal values, so the directions are uniform, which is the Haar measure on
// pure states), their mean fear share and histogram.
//
// Predictions, written 2026-09-26 before either distribution was computed:
// P1 the Haar mean fear share is 0.297 within 0.003 (the roadmap's figure)
// P2 over the pairs that meet at least 20 times before beat 240, the long-time mean fear share of the swap law
//    lies within 0.03 of the Haar mean: the fear beat scrambles the roles to a typical state
// P3 no long-time fear share of either law exceeds 8/25, the two-role ceiling E-QTM-0125 conjectures
// Reported, not gated: the same for the color law, for the pairs that meet fewer than 20 times, the two
// histograms in tenths of 1/3, and the total variation distance to the Haar histogram.
//
// Gates, fixed before the first run: P1, P2 and P3.
//
// Depth L2: the knit's own histories against a computed reference.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { advanceWhole, fearKernels, meetingKernel, swapPhase, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { classicalRecords, meetingPairs, pairRecords, vacuumBackground, weylBackground } from '@/code/measure/knit-magic'
import { gridWeights, phasePointOperators } from '@/code/measure/grid-weights'
import { weylUnitVector } from '@/code/tool/weyl'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const LONG_FROM = 240
const MIN_MEETINGS = 20
const HAAR_STATES = 20000
const BINS = 10

// the 21 one-role pure states in whole units on the phase index 3 a + b
function oneRoleStates(): bigint[][] {
  const out: bigint[][] = []

  for (const [da, db] of [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ] as const) {
    const seen = new Set<string>()

    for (let p = 0; p < 9; p++) {
      const line = [0, 1, 2].map(t => 3 * ((Math.floor(p / 3) + t * da) % 3) + ((p % 3) + t * db) % 3).sort((x, y) => x - y)
      const key = line.join(',')

      if (seen.has(key)) continue
      seen.add(key)
      out.push(Array.from({ length: 9 }, (_, q) => (line.includes(q) ? 1n : 0n)))
    }
  }

  for (let p = 0; p < 9; p++) {
    out.push(Array.from({ length: 9 }, (_, q) => (q === p ? -2n : 1n)))
  }

  return out
}

const shareOf = (w: Whole): number => {
  const { loves, fears } = wholeLovesAndFears(w)

  return Number(fears) / Number(loves + fears)
}

const binOf = (f: number): number => Math.min(BINS - 1, Math.floor((f / (1 / 3)) * BINS))

export default experiment({
  id: 'quantum/long-time-fear-share',
  code: 'E-QTM-0126',
  title:
    'the long-time fear share of the knit\'s two-role wholes, over all 441 products of the 21 one-role pure states as starts and every meeting pair of a dock, against the Haar-typical two-qutrit state computed from deterministic directions: does the fear beat scramble a pair of roles to a typical state',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the Haar reference
    const points2 = phasePointOperators(2)
    const haarHistogram = new Array<number>(BINS).fill(0)
    let haarSum = 0
    let haarMax = 0

    for (let k = 0; k < HAAR_STATES; k++) {
      const v = weylUnitVector({ dimension: 18, start: 90000 + k })
      const w = gridWeights({ re: Array.from(v.slice(0, 9)), im: Array.from(v.slice(9, 18)), points: points2 })
      const s = w.reduce((t, x) => t + Math.abs(x), 0)
      const f = (1 - 1 / s) / 2

      haarSum += f
      haarMax = Math.max(haarMax, f)
      haarHistogram[binOf(f)] = (haarHistogram[binOf(f)] ?? 0) + 1
    }

    const haarMean = haarSum / HAAR_STATES

    // the knit
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA })!
    const ones = oneRoleStates()
    const tally = ['swap', 'color'].map(() => ({
      busy: { sum: 0, count: 0, histogram: new Array<number>(BINS).fill(0) },
      quiet: { sum: 0, count: 0 },
      max: 0,
      startMax: 0,
    }))
    let busyPairs = 0
    let quietPairs = 0

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: 2.11 })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: Array.from({ length: 24 }, (_, d) => d), beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)
        const early = mine.slice(0, LONG_FROM).reduce((n, r) => n + r.meetings.length, 0)
        const busy = early >= MIN_MEETINGS

        busyPairs += busy ? 1 : 0
        quietPairs += busy ? 0 : 1

        for (const u of ones) {
          for (const v of ones) {
            const start: Whole = { tokens: [a, b], weight: u.flatMap(x => v.map(y => x * y)) }

            for (const li of [0, 1]) {
              const t = tally[li]!
              let whole: Whole = start

              t.startMax = Math.max(t.startMax, shareOf(start))

              mine.forEach((record, beat) => {
                whole = advanceWhole({
                  weave,
                  whole,
                  record,
                  kernel4: li === 0 ? kThird : [],
                  color: li === 1 ? colorOn : undefined,
                  fixed: false,
                  forward: true,
                })!

                if (beat < LONG_FROM) return

                const f = shareOf(whole)

                t.max = Math.max(t.max, f)

                if (busy) {
                  t.busy.sum += f
                  t.busy.count++
                  t.busy.histogram[binOf(f)] = (t.busy.histogram[binOf(f)] ?? 0) + 1
                } else {
                  t.quiet.sum += f
                  t.quiet.count++
                }
              })
            }
          }
        }
      }
    }

    const mean = (x: { sum: number; count: number }): number => (x.count > 0 ? x.sum / x.count : Number.NaN)
    const tv = (h: readonly number[]): number => {
      const n = h.reduce((s, x) => s + x, 0)

      return h.reduce((s, x, i) => s + Math.abs(x / n - (haarHistogram[i] ?? 0) / HAAR_STATES), 0) / 2
    }
    const swap = tally[0]!
    const color = tally[1]!
    const p1 = Math.abs(haarMean - 0.297) <= 0.003
    const p2 = Math.abs(mean(swap.busy) - haarMean) <= 0.03
    const p3 = swap.max <= 8 / 25 + 1e-12 && color.max <= 8 / 25 + 1e-12
    const ok = p1 && p2 && p3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the Haar mean fear share of two qutrits is ${haarMean.toFixed(4)} over ${HAAR_STATES} deterministic directions (the roadmap's 0.297${p1 ? '' : ' is not it'}); over all 441 enumerated starts on the ${busyPairs} pairs that meet at least ${MIN_MEETINGS} times before beat ${LONG_FROM}, the swap law's long-time mean fear share is ${mean(swap.busy).toFixed(4)} and the color law's ${mean(color.busy).toFixed(4)}, total variation to the Haar histogram ${tv(swap.busy.histogram).toFixed(3)} and ${tv(color.busy.histogram).toFixed(3)}; on the ${quietPairs} quieter pairs ${mean(swap.quiet).toFixed(4)} and ${mean(color.quiet).toFixed(4)}; no long-time share exceeds ${Math.max(swap.max, color.max).toFixed(4)} against the conjectured ceiling 8/25`,
      metrics: {
        haarMeanFearShare: haarMean,
        haarMaxFearShare: haarMax,
        busyPairs,
        quietPairs,
        swapBusyMean: mean(swap.busy),
        swapBusyWholes: swap.busy.count,
        swapBusyTotalVariation: tv(swap.busy.histogram),
        swapQuietMean: mean(swap.quiet),
        swapMax: swap.max,
        colorBusyMean: mean(color.busy),
        colorBusyTotalVariation: tv(color.busy.histogram),
        colorQuietMean: mean(color.quiet),
        colorMax: color.max,
        startMaxShare: swap.startMax,
        ...Object.fromEntries(haarHistogram.map((x, i) => [`haarBin${i}`, x / HAAR_STATES])),
        ...Object.fromEntries(swap.busy.histogram.map((x, i) => [`swapBin${i}`, x / Math.max(1, swap.busy.count)])),
        ...Object.fromEntries(color.busy.histogram.map((x, i) => [`colorBin${i}`, x / Math.max(1, color.busy.count)])),
        predictionP1: p1 ? 1 : 0,
        predictionP2: p2 ? 1 : 0,
        predictionP3: p3 ? 1 : 0,
      },
      control: {
        roadmapHaarMean: 0.297,
        conjecturedCeiling: 8 / 25,
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status pass as before; busy means 0.2794 -> 0.2748 (swap) and 0.2515 -> 0.2457 (color), quiet means 0.2601 -> 0.2587 and 0.2505 -> 0.2499, the histogram bins moved. " + ('L2. Bins are tenths of 1/3 in fear share. A long-time whole is every beat from 240 to 479 of every run, so wholes in one run are correlated; the means are of wholes, not of independent draws, and no error bar is claimed. The quiet pairs are reported to show what the cut does, since a pair that seldom meets keeps most of its start. First run, 2026-09-26 (904 s beside other jobs; the 200 s estimate was optimistic): pass, gates unchanged. Haar mean 0.2967 (the roadmap\'s 0.297 holds). Only 8 of 28 pairs meet 20 times before beat 240. On them the swap law\'s long-time mean is 0.2794, 0.017 below Haar, P2 passing with room, but its histogram is not Haar\'s (total variation 0.17): 1.6 percent of its long-time wholes sit at zero fear (stabilizer-like) and a tail runs down through the lower bins, where Haar puts 99.8 percent in the top three. The color law with frames is further off (mean 0.2515, total variation 0.49, 4.8 percent at zero fear): its love-fear meetings use the singlet phase, which scrambles less. So the fear beat drives a pair toward a typical state on average, not to the Haar distribution, within 480 beats.'),
    })
  },
})
