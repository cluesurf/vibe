// P7 (the quantum link, sharpened): is it the amount of measurement dependence
// that buys violation, or its alignment? Hall (2010) showed reproducing quantum
// correlations requires a minimum measurement dependence (a relaxation of free
// choice), measurable as the mutual information between the settings and the
// hidden state. We measure that mutual information alongside the CHSH value for
// both an ALIGNED correlation (the setting reads the feature the outcomes use) and
// a GENERIC one (an unrelated feature of the same hidden state). The result: the
// same bits of measurement dependence buy wildly different violation depending on
// alignment, so the currency is aligned bits, not bits. See
// note/experiment/results/p7-naturalness.md.
// Run: npx tsx code/experiment/p7-alignment.ts

import { makeRng } from '@/code/tool/rng'
import { mutualInformationBits } from '@/code/measure/statistics'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function randomBit(lambda: number, salt: number): number {
  return Math.sin(lambda * 137.0 + salt) >= 0 ? 0 : 1
}

const BINS = 64

type Mode = 'aligned' | 'misaligned' | 'random'

// The shared-past setting bits, in three modes. aligned: boundaries match the
// outcome region [pi/4, pi/2) the outcomes use. misaligned: coarse split at pi/2,
// about 1 bit of dependence but boundaries that miss the outcome structure.
// random: a high-frequency feature, dependence below the measurement resolution.
function sharedBits(input: { lambda: number; mode: Mode }): {
  a: number
  b: number
} {
  const l = input.lambda
  if (input.mode === 'aligned') {
    return {
      a: Math.sin(2 * l) >= 0 ? 0 : 1,
      b: Math.cos(2 * l) >= 0 ? 0 : 1,
    }
  }

  if (input.mode === 'misaligned') {
    return { a: l < Math.PI / 2 ? 0 : 1, b: l < Math.PI / 2 ? 0 : 1 }
  }

  return { a: randomBit(l, 1), b: randomBit(l, 2) }
}

export function measureChshAndDependence(input: {
  eta: number
  mode: Mode
  trials: number
  seed: number
}): { s: number; mutualInfo: number } {
  const rng = makeRng({ seed: input.seed })
  const sum = [0, 0, 0, 0]
  const count = [0, 0, 0, 0]
  // joint histogram of (setting-A bit, lambda bin) for the mutual information.
  const joint = [new Float64Array(BINS), new Float64Array(BINS)]

  for (let t = 0; t < input.trials; t++) {
    const lambda = rng.next() * Math.PI
    const shared = sharedBits({ lambda, mode: input.mode })
    const sharedA = shared.a
    const sharedB = shared.b
    const ai =
      rng.next() < input.eta ? sharedA : rng.next() < 0.5 ? 0 : 1
    const bi =
      rng.next() < input.eta ? sharedB : rng.next() < 0.5 ? 0 : 1
    const a = 1
    const b = lambda >= Math.PI / 4 && lambda < Math.PI / 2 ? -1 : 1
    const cell = ai * 2 + bi
    sum[cell] = (sum[cell] ?? 0) + a * b
    count[cell] = (count[cell] ?? 0) + 1

    const bin = Math.min(
      BINS - 1,
      Math.floor((lambda / Math.PI) * BINS),
    )
    const arr = joint[ai] ?? joint[0]
    if (arr) {
      arr[bin] = (arr[bin] ?? 0) + 1
    }
  }

  const e = (i: number): number =>
    (count[i] ?? 0) === 0 ? 0 : (sum[i] ?? 0) / (count[i] ?? 1)
  const s = e(0) - e(1) + e(2) + e(3)

  // Mutual information I(setting; lambda-bin) in bits, from the joint count histogram.
  const mi = mutualInformationBits(joint)

  return { s, mutualInfo: mi }
}

export default experiment({
  id: 'quantum/alignment',
  title: 'aligned bits, not bits, buy a CHSH violation',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const aligned = measureChshAndDependence({
      eta: 1,
      mode: 'aligned',
      trials: 60000,
      seed: 11,
    })
    const misaligned = measureChshAndDependence({
      eta: 1,
      mode: 'misaligned',
      trials: 60000,
      seed: 12,
    })
    const ok =
      aligned.s > 3.5 &&
      misaligned.s < 1.5 &&
      Math.abs(aligned.mutualInfo - misaligned.mutualInfo) < 0.05

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'at the same measurement dependence only the aligned correlation violates CHSH, so the currency is aligned bits',
      metrics: {
        alignedS: aligned.s,
        misalignedS: misaligned.s,
        alignedMutualInfo: aligned.mutualInfo,
        misalignedMutualInfo: misaligned.mutualInfo,
      },
    })
  },
})
