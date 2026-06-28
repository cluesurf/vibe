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

import { chshShared } from '@/code/measure/bell'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/naturalness-shared-past',
  code: 'E-FND-0034',
  title:
    'an aligned shared past violates CHSH while a generic one does not',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const aligned = chshShared({
      eta: 1,
      mode: 'aligned',
      trials: 40000,
      seed: 7,
    })

    const random = chshShared({
      eta: 1,
      mode: 'random',
      trials: 40000,
      seed: 8,
    })

    const ok = aligned > 3.5 && random < 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an aligned shared past reaches the CHSH maximum while a generic shared past stays near classical',
      metrics: { alignedS: aligned, randomS: random },
    })
  },
})

experiment({
  id: 'foundations/naturalness-separation-decay',
  title: 'the CHSH violation decays with measurement separation',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const near = chshShared({
      eta: 1,
      mode: 'aligned',
      trials: 40000,
      seed: 1,
    })

    const far = chshShared({
      eta: Math.exp(-4 / 2),
      mode: 'aligned',
      trials: 40000,
      seed: 2,
    })

    const ok = near > 3.5 && far < 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in a natural mesh the CHSH violation decays with measurement separation as the shared past shrinks',
      metrics: { nearS: near, farS: far },
    })
  },
})
