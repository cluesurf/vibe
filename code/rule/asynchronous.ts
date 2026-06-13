// Asynchronous rule: update one element at a time. Each update reads the
// CURRENT (partially updated) configuration, so earlier updates in the sweep
// influence later ones. This realizes "no global clock, only local causal
// coordination".

import { Rule, LocalMap } from '@/code/rule/rule'
import { adjacencyOf } from '@/code/tool/substrate'
import {
  cloneConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { Rng } from '@/code/tool/rng'

// Fisher-Yates permutation of [0, size) using the seeded rng.
function randomOrder(input: { size: number; rng: Rng }): number[] {
  const order: number[] = []
  for (let i = 0; i < input.size; i++) {
    order.push(i)
  }
  for (let i = input.size - 1; i > 0; i--) {
    const j = input.rng.nextInt({ max: i + 1 })
    const a = order[i] ?? 0
    const b = order[j] ?? 0
    order[i] = b
    order[j] = a
  }
  return order
}

export function asynchronousRule(input: {
  name: string
  local: LocalMap
  order: 'sequential' | 'random'
}): Rule {
  return {
    form: 'rule',
    name: input.name,
    scheme: 'asynchronous',
    step({ substrate, configuration, rng }) {
      // Mutate a single clone in place, so neighborhood reads see the running
      // state of the sweep.
      const next = cloneConfiguration(configuration)
      const adjacency = adjacencyOf({ substrate })

      const order =
        input.order === 'random'
          ? randomOrder({ size: configuration.size, rng })
          : Array.from({ length: configuration.size }, (_value, i) => i)

      for (const element of order) {
        const self = getTone(next, { element })
        const neighborhood: number[] = []
        adjacency.forEachOut({
          node: element,
          visit: (to) => {
            neighborhood.push(getTone(next, { element: to }))
          },
        })
        const value = input.local({ self, neighborhood })
        setTone(next, { element, value })
      }

      return { configuration: next }
    },
  }
}
