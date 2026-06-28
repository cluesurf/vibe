// Conformance for code/rule/rule: runRule threads the configuration (and an optional rewritten substrate)
// through exactly `beats` applications of step. We use a counting rule whose effect after N beats is N
// applications (independently: a value incremented once per beat ends at start + N), and a substrate-returning
// rule to confirm the substrate is carried forward.

import { suite, check, equal } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import {
  makeConfiguration,
  cloneConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'
import { Rule, runRule } from '@/code/rule/rule'
import { synchronousRule } from '@/code/rule/synchronous'
import { Substrate } from '@/code/tool/substrate'

const graph = makeGraph({ size: 3, directed: false, neighbors: [[1], [0, 2], [1]] })

// A rule that adds 1 to element 0's tone each beat; the configuration otherwise passes through.
const incrementRule: Rule = {
  form: 'rule',
  name: 'increment',
  scheme: 'synchronous',
  step({ configuration }) {
    const next = cloneConfiguration(configuration)
    setTone(next, { element: 0, value: getTone(next, { element: 0 }) + 1 })

    return { configuration: next }
  },
}

suite('rule/rule: runRule applies step exactly `beats` times', [
  check('an incrementing rule ends at start + beats', () => {
    const start = makeConfiguration({ alphabet: { form: 'ternary' }, size: 3 })
    const out = runRule({
      rule: incrementRule,
      substrate: graph,
      configuration: start,
      beats: 5,
      rng: makeRng({ seed: 1 }),
    })

    equal(getTone(out.configuration, { element: 0 }), 5, 'five beats -> +5')
  }),
  check('zero beats leaves the configuration unchanged', () => {
    const start = makeConfiguration({ alphabet: { form: 'ternary' }, size: 3 })
    setTone(start, { element: 0, value: 1 })

    const out = runRule({
      rule: synchronousRule({ name: 'id', local: ({ self }) => self }),
      substrate: graph,
      configuration: start,
      beats: 0,
      rng: makeRng({ seed: 1 }),
    })

    equal(getTone(out.configuration, { element: 0 }), 1, 'no beats, no change')
  }),
])

suite('rule/rule: runRule carries a rewritten substrate forward', [
  check('a step that returns a new substrate replaces the running one', () => {
    const sentinel: Substrate = makeGraph({ size: 1, directed: false, neighbors: [[]] })
    const rewriting: Rule = {
      form: 'rule',
      name: 'rewrite',
      scheme: 'synchronous',
      step({ configuration }) {
        return { configuration, substrate: sentinel }
      },
    }

    const start = makeConfiguration({ alphabet: { form: 'ternary' }, size: 3 })
    const out = runRule({
      rule: rewriting,
      substrate: graph,
      configuration: start,
      beats: 2,
      rng: makeRng({ seed: 1 }),
    })

    equal(out.substrate, sentinel, 'the returned substrate is threaded out')
  }),
])
