// The renderer: the coarse-graining named and measured. The "screen" of a will is its block tone
// populations (code/coarse/screen): for every b^4 block of cells the counts of its 24 b^4 slots
// holding -1, 0 and +1, and nothing about which slot holds which. The "engine" is the committed
// turning weave. Two questions, both answered from runs of the committed rule.
//
// (a) How many-to-one is the screen. The number of microstates behind a block's screen value is the
// multinomial M! / (n-! n0! n+!), counted exactly with a log-factorial table on the actual states of a
// committed-rule run (the start and the state 48 beats later), per slot, at every block size, beside
// the most the screen itself can carry, log2 of its (M + 1)(M + 2) / 2 possible values per slot.
//
// (b) Does the screen have its own law. A start S and a start S' with the same screen at block size b:
// every block's slots cycled by a fixed golden-section shift, which keeps every block's populations
// and moves tones between cells and directions. Both run under the committed rule for two schedule
// periods, and D_b, the mean block total-variation distance of their screens, is averaged over the
// 48 beats. If what the screen hides acts only as independent fluctuations, D_b falls as the inverse
// square root of the slots per block, b^-2 on the 4D mesh, and larger screens are more autonomous. The
// exponent is fitted at L = 15 (b = 1, 3, 5, 15) and L = 9 (b = 1, 3, 9). Two references at each b:
// an independent start of the same macrostate (a different hash, the fluctuation level) and a start of
// a different macrostate (slot activity 0.6 against 0.5, what a screen difference looks like).
//
// Calibrations, each of which must come out as its construction says:
// - pure streaming keeps every whole-mesh population, so its whole-mesh screen is exactly autonomous:
//   D_L = 0 at every beat;
// - a gated cycle (every slot of a cell turns round the tone cycle when one fixed slot holds 0) reads a
//   hidden variable the shift changes coherently: on a start whose gate slots are all empty, D_b does
//   not fall with b, the shape of a screen with no law of its own;
// - the committed rule on a start whose lines carry a hidden correlation (each line (d, -d) is (s, -s)
//   or empty, the same slot marginals) must show the same failure at first, because the rule's
//   population changes are pair creation and annihilation, which read line states. Measured: the
//   whole-mesh D at the first beat, against the uniform start's, and its decay as the rule erases the
//   correlation.
//
// No random numbers: every start is a fixed hash of the slot index.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import {
  Collision,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import {
  countDisagreement,
  countSeries,
  gatedCycle,
  profiledStart,
  sameScreenDisagreement,
  screenCount,
} from '@/code/coarse/screen'
import { linearFit } from '@/code/measure/regression'
import { slopeError } from '@/code/measure/charge-mode'

const BEATS = 48
const ACTIVE = 0.5

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length)

function exponent(
  blocks: readonly number[],
  values: readonly number[],
): { slope: number; error: number } {
  const xs = blocks.map(b => Math.log(b))
  const ys = values.map(v => Math.log(v))
  const fit = linearFit({ xs, ys })

  return {
    slope: fit.slope,
    error: slopeError(xs, ys, fit.slope, fit.intercept),
  }
}

function autonomy(input: {
  side: number
  blocks: readonly number[]
  schedule: (beatIndex: number) => Collision
  kind?: 'uniform' | 'paired' | 'gated'
  references?: boolean
}) {
  const { side, blocks, schedule } = input
  const kind = input.kind ?? 'uniform'
  const mesh = d4Mesh({ side })
  const make = (salt: number, active: number) =>
    profiledStart({
      mesh,
      side,
      mean: active,
      contrast: 0,
      salt,
      paired: kind === 'paired',
      emptySlot: kind === 'gated' ? 0 : undefined,
    })
  const start = make(5, ACTIVE)
  const same = sameScreenDisagreement({
    start,
    side,
    blocks,
    beats: BEATS,
    schedule,
  })

  if (input.references !== true) {
    return {
      start,
      same,
      independent: [] as number[],
      macro: [] as number[],
    }
  }

  const reference = countSeries({ start, beats: BEATS, schedule })
  const independent = countSeries({
    start: make(6, ACTIVE),
    beats: BEATS,
    schedule,
  })
  const other = countSeries({
    start: make(6, ACTIVE + 0.1),
    beats: BEATS,
    schedule,
  })

  return {
    start,
    same,
    independent: blocks.map(block =>
      mean(
        countDisagreement({
          a: independent,
          b: reference,
          side,
          block,
          degree: mesh.degree,
        }),
      ),
    ),
    macro: blocks.map(block =>
      mean(
        countDisagreement({
          a: other,
          b: reference,
          side,
          block,
          degree: mesh.degree,
        }),
      ),
    ),
  }
}

export default experiment({
  id: 'renormalization/screen-renderer',
  code: 'E-SCL-0016',
  title:
    'the block-population screen of the committed rule hides 1.58 of the log2 3 bits per slot at the whole-mesh scale against a visible 0.00003, and it has its own law to the accuracy of the law of large numbers: two microstates with the same screen disagree later by a block distance falling as b^-2.1 at L = 15 and b^-2.0 at L = 9, no more than two independent draws of the macrostate, while a hidden variable the rule reads (a gated calibration, or coherent line correlations under the committed rule itself) breaks the law until the rule erases it',
  category: 'renormalization',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const blocks15 = [1, 3, 5, 15]
    const blocks9 = [1, 3, 9]
    const mesh15 = d4Mesh({ side: 15 })
    const mesh9 = d4Mesh({ side: 9 })
    const rule15 = turningWeave({ opposite: meshOpposites(mesh15) })
    const rule9 = turningWeave({ opposite: meshOpposites(mesh9) })

    // (b) the committed rule at two sizes
    const main = autonomy({
      side: 15,
      blocks: blocks15,
      schedule: rule15,
      references: true,
    })
    const small = autonomy({
      side: 9,
      blocks: blocks9,
      schedule: rule9,
      references: true,
    })
    const fit15 = exponent(
      blocks15,
      main.same.map(s => s.mean),
    )
    const fit9 = exponent(
      blocks9,
      small.same.map(s => s.mean),
    )

    // (a) the exact many-to-one count on the start and on the state two schedule periods later
    let later = main.start

    for (let t = 0; t < BEATS; t++) {
      later = run(later, rule15(t), 1)
    }

    const countStart = blocks15.map(block =>
      screenCount({ will: main.start, side: 15, block }),
    )
    const countLater = blocks15.map(block =>
      screenCount({ will: later, side: 15, block }),
    )
    const whole = countLater[countLater.length - 1]!
    const single = countLater[0]!

    // calibrations on L = 9
    const streaming = autonomy({
      side: 9,
      blocks: blocks9,
      schedule: () => passThrough,
    })
    const gated = gatedCycle({ gate: 0 })
    const gatedRun = autonomy({
      side: 9,
      blocks: blocks9,
      schedule: () => gated,
      kind: 'gated',
    })
    const gatedFit = exponent(
      blocks9,
      gatedRun.same.map(s => s.mean),
    )
    const paired = autonomy({
      side: 9,
      blocks: [9],
      schedule: rule9,
      kind: 'paired',
    })
    const pairedSeries = paired.same[0]?.series ?? []
    const uniformWholeSeries =
      small.same[small.same.length - 1]?.series ?? []
    const pairedFirst = pairedSeries[0] ?? 0
    const pairedLast = pairedSeries[pairedSeries.length - 1] ?? 0
    const uniformFirst = uniformWholeSeries[0] ?? 0

    // the committed rule: LLN exponent near -2 at both sizes, never worse than an independent draw
    // beyond single cells, far below a real screen difference at the whole-mesh scale
    const lawOfLargeNumbers =
      Math.abs(fit15.slope + 2) < 0.4 && Math.abs(fit9.slope + 2) < 0.4
    const noWorseThanIndependent = [main, small].every(r =>
      r.same.every(
        (s, i) =>
          s.block === 1 || s.mean <= 1.5 * (r.independent[i] ?? 0),
      ),
    )
    const wholeIndex = blocks15.length - 1
    const screenSeparates =
      (main.macro[wholeIndex] ?? 0) >
      5 * (main.same[wholeIndex]?.mean ?? 1)
    // many-to-one: hidden bits rise toward the entropy bound, visible bits fall
    const countsSensible =
      countLater.every(
        (c, i) =>
          i === 0 ||
          c.hiddenBitsPerSlot >
            (countLater[i - 1]?.hiddenBitsPerSlot ?? 0),
      ) &&
      Math.abs(whole.hiddenBitsPerSlot - whole.entropyBoundPerSlot) <
        1e-3 &&
      whole.visibleBitsPerSlot < 1e-4
    // calibrations
    const streamingExact = (
      streaming.same[streaming.same.length - 1]?.series ?? [1]
    ).every(v => v === 0)
    const gatedFlat = gatedFit.slope > -0.5
    const hiddenCorrelationBreaks =
      pairedFirst > 5 * uniformFirst && pairedLast < pairedFirst / 4
    const ok =
      lawOfLargeNumbers &&
      noWorseThanIndependent &&
      screenSeparates &&
      countsSensible &&
      streamingExact &&
      gatedFlat &&
      hiddenCorrelationBreaks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on runs of the committed rule the block-population screen is many-to-one by 1.32 to 1.58 hidden bits per slot two schedule periods in, rising with block size to the populations entropy, against visible bits falling from 0.35 to 0.00003, and two microstates sharing a screen disagree later by a block distance that falls as b^-2 at L = 15 and L = 9 (the law of large numbers), no more than two independent starts of the same macrostate, while streaming is exactly autonomous at the whole-mesh scale, a rule that reads a hidden slot is not autonomous at any scale, and coherent hidden line correlations break the committed rule screen at first and are erased by it',
      metrics: {
        exponentL15: fit15.slope,
        exponentErrorL15: fit15.error,
        exponentL9: fit9.slope,
        exponentErrorL9: fit9.error,
        sameScreenD1: main.same[0]?.mean ?? 0,
        sameScreenD3: main.same[1]?.mean ?? 0,
        sameScreenD5: main.same[2]?.mean ?? 0,
        sameScreenD15: main.same[3]?.mean ?? 0,
        independentD1: main.independent[0] ?? 0,
        independentD3: main.independent[1] ?? 0,
        independentD5: main.independent[2] ?? 0,
        independentD15: main.independent[3] ?? 0,
        otherMacrostateD15: main.macro[wholeIndex] ?? 0,
        hiddenBitsPerSlotB1: single.hiddenBitsPerSlot,
        hiddenBitsPerSlotB3: countLater[1]?.hiddenBitsPerSlot ?? 0,
        hiddenBitsPerSlotB5: countLater[2]?.hiddenBitsPerSlot ?? 0,
        hiddenBitsPerSlotB15: whole.hiddenBitsPerSlot,
        hiddenBitsPerSlotB15AtStart:
          countStart[wholeIndex]?.hiddenBitsPerSlot ?? 0,
        visibleBitsPerSlotB1: single.visibleBitsPerSlot,
        visibleBitsPerSlotB15: whole.visibleBitsPerSlot,
        entropyBoundB15: whole.entropyBoundPerSlot,
      },
      control: {
        streamingWholeMeshLargestD: Math.max(
          ...(streaming.same[streaming.same.length - 1]?.series ?? [1]),
        ),
        gatedExponent: gatedFit.slope,
        gatedD9: gatedRun.same[gatedRun.same.length - 1]?.mean ?? 0,
        pairedWholeMeshFirstBeat: pairedFirst,
        uniformWholeMeshFirstBeat: uniformFirst,
        pairedWholeMeshLastBeat: pairedLast,
      },
      notes:
        'L3: the committed rule runs through beat on the D4 mesh at two sizes, with three calibrations that come out as constructed. The b^-2 law is what independent fluctuations give, so the screen has its own law only in the statistical sense: knowing the microstate beyond the screen buys nothing over knowing the macrostate, to the law-of-large-numbers accuracy, and larger screens are more autonomous as the square root of their slot count. Only at the whole-mesh block does the shared screen beat an independent draw (about 0.0005 against 0.0013), where the one population vector nearly determines its own next value. The rule also drives the populations toward a third each, so the hidden bits rise over the run (1.50 per slot at the start, 1.58 two schedule periods later, against log2 3 = 1.585). That holds on starts whose hidden detail is typical. A start with a coherent hidden correlation the rule reads breaks it, and the committed rule itself restores it within two schedule periods (the paired start), the screen form of local equilibrium. Not tested: screens richer than populations (line states, currents), whose own laws would need their own test, and a profiled start with gradients inside a block, where a within-block shift changes the hidden gradient and adds a disagreement that does not fall with b (seen at L = 15, b = 5 in the design runs and excluded here by using uniform macrostates).',
    })
  },
})
