// Reversible even/odd rule: update the even sublattice from the odd, then the
// odd from the even. Each half-step touches a sublattice while reading only the
// other, so the step is the composition of two block updates ('t Hooft's
// recipe).
//
// NOTE: this is a reversibility SCAFFOLD. True reversibility additionally
// requires `local` to be a BIJECTION on each sublattice's tone given the fixed
// neighborhood. The even/odd ordering guarantees the inputs to each half-step
// are held constant; the invertibility of the half-step is the caller's
// responsibility through the choice of `local`.

import { Rule, LocalMap } from '~/rule/rule'
import { adjacencyOf } from '~/tool/substrate'
import {
  Configuration,
  cloneConfiguration,
  getTone,
  setTone,
} from '~/tone/configuration'

// Update every element of one parity, reading neighborhood tones from the given
// source configuration and writing into the target.
function updateParity(input: {
  parity: 0 | 1
  source: Configuration
  target: Configuration
  adjacency: ReturnType<typeof adjacencyOf>
  local: LocalMap
}): void {
  for (
    let element = input.parity;
    element < input.source.size;
    element += 2
  ) {
    const self = getTone(input.source, { element })
    const neighborhood: number[] = []
    input.adjacency.forEachOut({
      node: element,
      visit: (to) => {
        neighborhood.push(getTone(input.source, { element: to }))
      },
    })
    const value = input.local({ self, neighborhood })
    setTone(input.target, { element, value })
  }
}

export function reversibleEvenOdd(input: {
  name: string
  local: LocalMap
}): Rule {
  return {
    form: 'rule',
    name: input.name,
    scheme: 'reversible-even-odd',
    step({ substrate, configuration }) {
      const adjacency = adjacencyOf({ substrate })

      // Half-step 1: even elements read the (unchanged) odd elements.
      const afterEven = cloneConfiguration(configuration)
      updateParity({
        parity: 0,
        source: configuration,
        target: afterEven,
        adjacency,
        local: input.local,
      })

      // Half-step 2: odd elements read the now-updated even elements.
      const afterOdd = cloneConfiguration(afterEven)
      updateParity({
        parity: 1,
        source: afterEven,
        target: afterOdd,
        adjacency,
        local: input.local,
      })

      return { configuration: afterOdd }
    },
  }
}
