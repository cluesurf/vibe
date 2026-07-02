// Conformance for code/rule/reversible: the even/odd block update ('t Hooft's recipe). The even sublattice is
// updated from the unchanged odd sublattice, then the odd sublattice from the NOW-UPDATED even one. We verify
// that ordering by hand: the odd half-step must see the new even values, giving a result distinct from both the
// synchronous and the sequential-asynchronous result. The identity map is a no-op.

import { suite, check, equal, ok } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import {
  makeConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'
import { reversibleEvenOdd } from '@/code/rule/reversible'
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

function stepRev(local: LocalMap, values: number[]): number[] {
  const out = reversibleEvenOdd({ name: 'test', local }).step({
    substrate: graph,
    configuration: configFrom(values),
    beat: 0,
    rng: makeRng({ seed: 1 }),
  })

  return readAll(out.configuration)
}

suite('rule/reversible: even from old odd, then odd from new even', [
  check('the two half-steps match the hand derivation', () => {
    // input [1,0,0,1].
    // half 1 (even 0,2 read the ORIGINAL odd):
    //   0 <- {v1=0}=0;  2 <- {v1=0,v3=1}=1   -> afterEven [0,0,1,1]
    // half 2 (odd 1,3 read the UPDATED even):
    //   1 <- {v0=0,v2=1}=1;  3 <- {v2=1}=1   -> afterOdd [0,1,1,1]
    equal(
      JSON.stringify(stepRev(sumLocal, [1, 0, 0, 1])),
      JSON.stringify([0, 1, 1, 1]),
    )
  }),
  check(
    'the result differs from the synchronous step (odd sees the new even)',
    () => {
      const rev = stepRev(sumLocal, [1, 0, 0, 1])
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
        JSON.stringify(rev) !== JSON.stringify(sync),
        'block ordering changes the result',
      )
    },
  ),
  check('the identity local map is a no-op', () => {
    equal(
      JSON.stringify(stepRev(identityLocal, [1, -1, 0, 1])),
      JSON.stringify([1, -1, 0, 1]),
    )
  }),
])
