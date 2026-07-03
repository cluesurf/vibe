// Conformance for code/rule/rewrite: a substrate-rewriting rule fires at the FIRST matching site only, commits
// one rewrite, and otherwise passes the substrate and configuration through unchanged. We instrument match/apply
// to record where they fire and confirm exactly one rewrite at the first matching index.

import { suite, check, equal, ok } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import {
  makeConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'
import { rewriteRule } from '@/code/rule/rewrite'
import { Substrate } from '@/code/tool/substrate'

const graph = makeGraph({
  size: 4,
  directed: false,
  neighbors: [[1], [0], [3], [2]],
})

const sentinel: Substrate = makeGraph({
  size: 1,
  directed: false,
  neighbors: [[]],
})

function makeConfig() {
  const c = makeConfiguration({
    alphabet: { form: 'ternary' },
    size: 4,
  })

  setTone(c, { element: 0, value: 1 })

  return c
}

suite('rule/rewrite: first-match, single rewrite', [
  check('the rewrite fires once at the first matching site', () => {
    const applied: number[] = []
    const rule = rewriteRule({
      name: 'test',
      // matches every site from index 1 on; first match must be 1.
      match: ({ at }) => at >= 1,
      apply: ({ at }) => {
        applied.push(at)

        return sentinel
      },
    })

    const out = rule.step({
      substrate: graph,
      configuration: makeConfig(),
      beat: 0,
      rng: makeRng({ seed: 1 }),
    })

    equal(applied.length, 1, 'exactly one rewrite per step')
    equal(applied[0], 1, 'fired at the FIRST matching index')
    equal(out.substrate, sentinel, 'returns the rewritten substrate')
  }),
  check('no match leaves substrate and configuration unchanged', () => {
    const config = makeConfig()
    const out = rewriteRule({
      name: 'test',
      match: () => false,
      apply: () => sentinel,
    }).step({
      substrate: graph,
      configuration: config,
      beat: 0,
      rng: makeRng({ seed: 1 }),
    })

    ok(
      out.substrate === undefined,
      'no substrate returned when nothing matches',
    )
    equal(
      getTone(out.configuration, { element: 0 }),
      1,
      'configuration passes through',
    )
  }),
])
