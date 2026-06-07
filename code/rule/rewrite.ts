// Rewrite rule: change the substrate (graph) itself, not just the tones. This is
// causal graph dynamics, the self-rewriting mesh that lets the substrate grow.

import { Rule } from '~/rule/rule'
import { Substrate } from '~/tool/substrate'

export function rewriteRule(input: {
  name: string
  match: (input: { substrate: Substrate; at: number }) => boolean
  apply: (input: { substrate: Substrate; at: number }) => Substrate
}): Rule {
  return {
    form: 'rule',
    // A rewrite is applied at one site per beat; the synchronous scheme is the
    // closest fit (the whole substrate is read, one rewrite committed).
    scheme: 'synchronous',
    name: input.name,
    step({ substrate, configuration }) {
      // Find the first site where the match fires, then rewrite there.
      for (let at = 0; at < substrate.size; at++) {
        if (input.match({ substrate, at })) {
          const next = input.apply({ substrate, at })
          return { configuration, substrate: next }
        }
      }
      // No match: the substrate and tones pass through unchanged.
      return { configuration }
    },
  }
}
