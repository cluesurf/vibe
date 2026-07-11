// Synchronous rule: apply the local tone map to every element at once, reading
// every neighborhood tone from the SAME (input) configuration. This is the
// global beat.

import { Rule, LocalMap } from '@/code/rule/rule'
import { adjacencyOf } from '@/code/tool/substrate'
import {
  Configuration,
  cloneConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'

export function synchronousRule(input: {
  name: string
  local: LocalMap
}): Rule {
  return {
    form: 'rule',
    name: input.name,
    scheme: 'synchronous',
    step({ substrate, configuration }) {
      // The next configuration is committed only after every element is
      // computed, so all reads come from the unchanged input configuration.
      const next: Configuration = cloneConfiguration(configuration)
      const adjacency = adjacencyOf({ substrate })

      for (let element = 0; element < configuration.size; element++) {
        const self = getTone(configuration, { element })
        const neighborhood: number[] = []

        adjacency.forEachOut({
          node: element,
          visit: to => {
            neighborhood.push(getTone(configuration, { element: to }))
          },
        })

        const value = input.local({ self, neighborhood })

        setTone(next, { element, value })
      }

      return { configuration: next }
    },
  }
}
