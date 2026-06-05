// P9: experience correlates.
// Locate the structural correlates of a self on a configuration: a Markov-blanket
// score and an integration proxy. This locates where a self would sit on the
// framework's terms, it does not claim to capture experience itself.
// Run: npx tsx code/experiment/p9-integration.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { makeConfiguration } from '~/tone/configuration'
import { integrationCorrelates } from '~/measure/integration'

export function main(): { markovBlanketScore: number; integrationPhi: number } {
  const rng = makeRng({ seed: 13 })
  const substrate = hyperbolicGraph({
    count: 400,
    radius: 5,
    connectThreshold: 1.4,
    rng,
  })
  const configuration = makeConfiguration({
    alphabet: { form: 'ternary' },
    size: substrate.size,
    rng,
  })
  const c = integrationCorrelates({ substrate, configuration })
  console.log('P9 integration correlates')
  console.log('  Markov-blanket score:', c.markovBlanketScore.toFixed(4))
  console.log('  integration (proxy) :', c.integrationPhi.toFixed(4))
  return c
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
