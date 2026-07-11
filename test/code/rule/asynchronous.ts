// Conformance for code/rule/asynchronous: one element at a time, each reading the RUNNING (partially updated)
// state, so earlier updates in a sweep influence later ones. We compare a sequential sweep against the by-hand
// result computed WITH running state (which differs from the synchronous result), confirm a random sweep is
// deterministic under a fixed seed, and confirm the identity map is a no-op.

import { suite, check, equal, ok } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import {
  makeConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'
import { asynchronousRule } from '@/code/rule/asynchronous'
import { synchronousRule } from '@/code/rule/synchronous'
import { LocalMap } from '@/code/rule/rule'

const graph = makeGraph({
  size: 4,
  directed: false,
  neighbors: [[1], [0, 2], [1, 3], [2]],
})

function configFrom(values: number[]) {
  const c = makeConfiguration({
    alphabet: { form: 'ternary' },
    size: values.length,
  })

  values.forEach((v, element) => setTone(c, { element, value: v }))

  return c
}

function readAll(c: ReturnType<typeof configFrom>): number[] {
  return Array.from({ length: c.size }, (_v, element) =>
    getTone(c, { element }),
  )
}

const sumLocal: LocalMap = ({ neighborhood }) =>
  neighborhood.reduce((a, b) => a + b, 0)

const identityLocal: LocalMap = ({ self }) => self

function stepAsync(
  order: 'sequential' | 'random',
  values: number[],
  seed: number,
  local: LocalMap = sumLocal,
): number[] {
  const rule = asynchronousRule({ name: 'test', local, order })
  const out = rule.step({
    substrate: graph,
    configuration: configFrom(values),
    beat: 0,
    rng: makeRng({ seed }),
  })

  return readAll(out.configuration)
}

suite('rule/asynchronous: running-state sequential sweep', [
  check(
    'sequential sweep matches the hand result WITH running state',
    () => {
      // input [1,0,0,1], order 0,1,2,3, reads the running clone:
      //   0 <- {v1=0}=0          -> [0,0,0,1]
      //   1 <- {v0=0,v2=0}=0     -> [0,0,0,1]
      //   2 <- {v1=0,v3=1}=1     -> [0,0,1,1]
      //   3 <- {v2=1}=1          -> [0,0,1,1]
      equal(
        JSON.stringify(stepAsync('sequential', [1, 0, 0, 1], 1)),
        JSON.stringify([0, 0, 1, 1]),
      )
    },
  ),
  check(
    'the running-state result differs from the synchronous result',
    () => {
      const async = stepAsync('sequential', [1, 0, 0, 1], 1)
      const sync = (() => {
        const out = synchronousRule({
          name: 's',
          local: sumLocal,
        }).step({
          substrate: graph,
          configuration: configFrom([1, 0, 0, 1]),
          beat: 0,
          rng: makeRng({ seed: 1 }),
        })

        return readAll(out.configuration)
      })()

      ok(
        JSON.stringify(async) !== JSON.stringify(sync),
        'async propagates within the sweep',
      )
    },
  ),
  check('the identity local map is a no-op', () => {
    equal(
      JSON.stringify(
        stepAsync('sequential', [1, -1, 0, 1], 1, identityLocal),
      ),
      JSON.stringify([1, -1, 0, 1]),
    )
  }),
])

suite('rule/asynchronous: random order is deterministic per seed', [
  check('same seed gives the same result', () => {
    const a = stepAsync('random', [1, 0, 1, -1], 42)
    const b = stepAsync('random', [1, 0, 1, -1], 42)

    equal(
      JSON.stringify(a),
      JSON.stringify(b),
      'reproducible under a fixed seed',
    )
  }),
])
