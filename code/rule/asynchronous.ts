// Asynchronous rule: update one element at a time. Each update reads the
// CURRENT (partially updated) configuration, so earlier updates in the sweep
// influence later ones. This realizes "no global clock, only local causal
// coordination".
//
// Two visiting orders. 'sequential' visits 0, 1, 2, ... every beat. 'weyl' visits a
// permutation that changes with the beat, the Fisher-Yates shuffle driven by the
// Weyl stream at start = beat (code/tool/weyl), so the order is a fixed function of
// the beat and nothing else. Until 2026-09-25 the second order was 'random', a
// shuffle from a seeded generator carried in the step input.

import { Rule, LocalMap } from '@/code/rule/rule'
import { adjacencyOf } from '@/code/tool/substrate'
import {
  cloneConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { weylPermutation } from '@/code/tool/weyl'

export function asynchronousRule(input: {
  name: string
  local: LocalMap
  order: 'sequential' | 'weyl'
}): Rule {
  return {
    form: 'rule',
    name: input.name,
    scheme: 'asynchronous',
    step({ substrate, configuration, beat }) {
      // Mutate a single clone in place, so neighborhood reads see the running
      // state of the sweep.
      const next = cloneConfiguration(configuration)
      const adjacency = adjacencyOf({ substrate })

      const order =
        input.order === 'weyl'
          ? weylPermutation({ size: configuration.size, start: beat })
          : Array.from({ length: configuration.size }, (_value, i) => i)

      for (const element of order) {
        const self = getTone(next, { element })
        const neighborhood: number[] = []

        adjacency.forEachOut({
          node: element,
          visit: to => {
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
