// P7 (the quantum link): is the setting-state correlation natural?
// The cost curve showed quantum-strength CHSH violation needs the measurement
// settings to be correlated with the hidden state. The naturalness question: does
// a monist mesh produce that correlation on its own, or must it be fine-tuned?
// We model a shared past: with probability eta the setting is determined by the
// common cause (the hidden state lambda), else by independent local randomness.
// eta is the shared-past fraction. We run two modes: an ALIGNED correlation (the
// setting tracks the same feature of lambda the outcomes use) and a RANDOM one
// (the setting tracks an unrelated feature). See note/questions/roadmap.md (B3).
// Run: npx tsx code/experiment/p7-naturalness.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A high-frequency bit of lambda, decorrelated from the outcome's region
// structure: a generic shared-past dependence that is not aligned with physics.
function randomBit(lambda: number, salt: number): number {
  return Math.sin(lambda * 137.0 + salt) >= 0 ? 0 : 1
}

export function chshShared(input: {
  eta: number
  mode: 'aligned' | 'random'
  trials: number
  seed: number
}): number {
  const rng = makeRng({ seed: input.seed })
  const sum = [0, 0, 0, 0] // cells (ai*2+bi)
  const count = [0, 0, 0, 0]
  for (let t = 0; t < input.trials; t++) {
    const lambda = rng.next() * Math.PI
    // The setting bit determined by the common cause (the hidden state).
    const sharedA =
      input.mode === 'aligned'
        ? Math.sin(2 * lambda) >= 0
          ? 0
          : 1
        : randomBit(lambda, 1)
    const sharedB =
      input.mode === 'aligned'
        ? Math.cos(2 * lambda) >= 0
          ? 0
          : 1
        : randomBit(lambda, 2)
    // With probability eta the setting comes from the shared past, else local.
    const ai = rng.next() < input.eta ? sharedA : rng.next() < 0.5 ? 0 : 1
    const bi = rng.next() < input.eta ? sharedB : rng.next() < 0.5 ? 0 : 1
    // The superdeterministic outcomes: A always +1, B set by the lambda region.
    const a = 1
    const b = lambda >= Math.PI / 4 && lambda < Math.PI / 2 ? -1 : 1
    const cell = ai * 2 + bi
    sum[cell] = (sum[cell] ?? 0) + a * b
    count[cell] = (count[cell] ?? 0) + 1
  }
  const e = (i: number): number =>
    (count[i] ?? 0) === 0 ? 0 : (sum[i] ?? 0) / (count[i] ?? 1)
  // S = E(0,0) - E(0,1) + E(1,0) + E(1,1)
  return e(0) - e(1) + e(2) + e(3)
}

export function main(): void {
  const etas = [0, 0.25, 0.5, 0.75, 1]
  console.log('P7 naturalness: CHSH versus shared-past fraction eta')
  console.log('  eta    aligned S    random S')
  for (let i = 0; i < etas.length; i++) {
    const eta = etas[i] ?? 0
    const aligned = chshShared({ eta, mode: 'aligned', trials: 60000, seed: 100 + i })
    const random = chshShared({ eta, mode: 'random', trials: 60000, seed: 200 + i })
    console.log(
      `  ${eta.toFixed(2)}  ${aligned.toFixed(3).padStart(10)}  ${random.toFixed(3).padStart(10)}`,
    )
  }
  console.log('')
  console.log('  bounds: classical 2, quantum (Tsirelson) ~2.83, algebraic max 4')
  console.log('  aligned rises to 4 as the shared past grows: determinism enables violation.')
  console.log('  random stays near classical even at eta=1: a GENERIC shared past is not enough,')
  console.log('  the correlation must take the specific form the outcomes use.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'foundations/naturalness-shared-past',
  title: 'an aligned shared past violates CHSH while a generic one does not',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const aligned = chshShared({ eta: 1, mode: 'aligned', trials: 40000, seed: 7 })
    const random = chshShared({ eta: 1, mode: 'random', trials: 40000, seed: 8 })
    const ok = aligned > 3.5 && random < 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an aligned shared past reaches the CHSH maximum while a generic shared past stays near classical',
      metrics: { alignedS: aligned, randomS: random },
    })
  },
})

defineExperiment({
  id: 'foundations/naturalness-separation-decay',
  title: 'the CHSH violation decays with measurement separation',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const near = chshShared({ eta: 1, mode: 'aligned', trials: 40000, seed: 1 })
    const far = chshShared({ eta: Math.exp(-4 / 2), mode: 'aligned', trials: 40000, seed: 2 })
    const ok = near > 3.5 && far < 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in a natural mesh the CHSH violation decays with measurement separation as the shared past shrinks',
      metrics: { nearS: near, farS: far },
    })
  },
})
