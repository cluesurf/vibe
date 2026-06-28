// Deterministic self-replication and heredity. A constructor copies a template pattern each generation, so the
// population of copies grows while every copy stays bit-identical to the template. A lossy constructor breaks the
// identity, so faithful copying (heredity) is the special property. No randomness, the only error is a fixed
// deterministic site flip.
//
// L2, a model of replication and heredity, with a control (the lossy constructor). Compute in code/dynamics/replication.

import { replicate } from '@/code/dynamics/replication'
import { ternaryVector } from '@/code/model/deliberation'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'computation/self-replication',
  code: 'E-CMP-0009',
  title:
    'a deterministic constructor makes a growing population of bit-identical copies, while a lossy one breaks heredity',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const template = ternaryVector(64, makeRng({ seed: 90011 })).map(
      v => (v === 0 ? 1 : v),
    )

    const generations = 8

    const faithful = replicate({
      template,
      generations,
      faithful: true,
    })

    const lossy = replicate({ template, generations, faithful: false })

    const grows = faithful.copies === 2 ** generations
    const heredityHolds =
      faithful.allIdentical && faithful.meanIdentity === 1

    const lossyBreaksHeredity =
      !lossy.allIdentical && lossy.meanIdentity < 0.999

    const ok = grows && heredityHolds && lossyBreaksHeredity

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the faithful constructor produces a population of copies growing as a power of two, every one bit-identical to the template, while a lossy constructor breaks the identity, so deterministic replication with faithful heredity is achievable and fidelity is what makes it heredity',
      metrics: {
        copies: faithful.copies,
        faithfulIdentity: faithful.meanIdentity,
      },
      control: { lossyIdentity: lossy.meanIdentity },
      notes:
        'L2 model of replication and heredity, the pattern is both the data and the thing copied (the von Neumann idea), deterministic',
    })
  },
})
