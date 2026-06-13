// P9: experience correlates.
// Locate the structural correlates of a self on a configuration: a Markov-blanket
// score and an integration proxy. This locates where a self would sit on the
// framework's terms, it does not claim to capture experience itself.
// Run: npx tsx code/experiment/p9-integration.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { makeConfiguration } from '@/code/tone/configuration'
import { integrationCorrelates } from '@/code/measure/integration'

export default defineExperiment({
  id: 'selves/integration',
  title: 'a configuration has a Markov-blanket score and an integration proxy',
  category: 'selves',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const c = main()
    const ok =
      Number.isFinite(c.markovBlanketScore) &&
      Number.isFinite(c.integrationPhi)
    return verdict({
      status: ok ? 'open' : 'fail',
      claim:
        'a configuration on the hyperbolic graph yields a finite Markov-blanket score and an integration proxy that locate where a self would sit on the framework terms',
      metrics: {
        markovBlanketScore: c.markovBlanketScore,
        integrationPhi: c.integrationPhi,
      },
      notes:
        'L0, open. This locates structural correlates of a self on a random configuration. It has no control and no measured emergence, and it relies on a pseudo-random fill, so the numbers are an ensemble proxy, not a property of the deterministic rule. It does not claim to capture experience itself.',
    })
  },
})
