// P217 (upper half, gauge): does the Standard-Model gauge algebra su(3) x su(2) x u(1) fit inside D4 = so(8),
// the {3,4,3,4} coin symmetry? The SM semisimple part is the root system A2 (+) A1 (su(3) x su(2)). It embeds
// iff D4 contains an A2 sub-root-system PLUS a root orthogonal to all of it (the commuting A1). We test D4
// against D5 = so(10) (the minimal SO(N) GUT). Clean finite root-system computation.
// Run: npx tsx code/experiment/p217-gauge-embedding.ts

import {
  rootsDn,
  standardModelEmbedsInRootSystem,
} from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function gaugeEmbedding(): { d4: boolean; d5: boolean } {
  return {
    d4: standardModelEmbedsInRootSystem(rootsDn(4)),
    d5: standardModelEmbedsInRootSystem(rootsDn(5)),
  }
}

export default experiment({
  id: 'gauge/gauge-embedding',
  title:
    'the Standard Model algebra does not fit in D4 = so(8) but does fit in D5 = so(10)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = gaugeEmbedding()
    const ok = r.d4 === false && r.d5 === true
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Standard Model semisimple algebra A2 plus A1 has no embedding in the coin symmetry D4 = so(8) but does embed in D5 = so(10)',
      metrics: {
        fitsInD4: r.d4 ? 1 : 0,
        fitsInD5: r.d5 ? 1 : 0,
      },
      notes:
        'L1, known math, and an honest negative for the coin. Rank matching 4 = 4 was necessary but not sufficient. The {3,4,3,4} coin symmetry alone cannot carry the Standard Model gauge group, it must grow D4 to D5.',
    })
  },
})
