// Conformance for code/rule/synchronous: the global beat. Every element is updated at once, and every
// neighbourhood read comes from the SAME (input) configuration, so the step is a pure function of the input.
// We run a known local map on a known graph and compare against the by-hand result computed entirely from the
// input values (no running state), which is exactly what "synchronous" must mean.

import { suite, check, equal } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import { makeConfiguration, getTone, setTone } from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'
import { synchronousRule } from '@/code/rule/synchronous'
import { LocalMap } from '@/code/rule/rule'

// Undirected path 0-1-2-3 (symmetric neighbour lists).
const graph = makeGraph({
  size: 4,
  directed: false,
  neighbors: [[1], [0, 2], [1, 3], [2]],
})

function configFrom(values: number[]) {
  const c = makeConfiguration({ alphabet: { form: 'ternary' }, size: values.length })
  values.forEach((v, element) => setTone(c, { element, value: v }))

  return c
}

function readAll(c: ReturnType<typeof configFrom>): number[] {
  return Array.from({ length: c.size }, (_v, element) => getTone(c, { element }))
}

// Sum of the neighbourhood tones.
const sumLocal: LocalMap = ({ neighborhood }) =>
  neighborhood.reduce((a, b) => a + b, 0)

const identityLocal: LocalMap = ({ self }) => self

function stepOnce(local: LocalMap, values: number[]): number[] {
  const rule = synchronousRule({ name: 'test', local })
  const out = rule.step({
    substrate: graph,
    configuration: configFrom(values),
    beat: 0,
    rng: makeRng({ seed: 1 }),
  })

  return readAll(out.configuration)
}

suite('rule/synchronous: simultaneous update from the input state', [
  check('neighbour-sum map matches the hand result from input values', () => {
    // input [1,0,0,1]; each output reads ONLY the input:
    //   0 <- {v1=0}=0;  1 <- {v0=1,v2=0}=1;  2 <- {v1=0,v3=1}=1;  3 <- {v2=0}=0
    equal(JSON.stringify(stepOnce(sumLocal, [1, 0, 0, 1])), JSON.stringify([0, 1, 1, 0]))
  }),
  check('the identity local map is a no-op', () => {
    equal(JSON.stringify(stepOnce(identityLocal, [1, -1, 0, 1])), JSON.stringify([1, -1, 0, 1]))
  }),
  check('the step does not mutate the input configuration', () => {
    const input = configFrom([1, 0, 0, 1])
    synchronousRule({ name: 'test', local: sumLocal }).step({
      substrate: graph,
      configuration: input,
      beat: 0,
      rng: makeRng({ seed: 1 }),
    })
    equal(JSON.stringify(readAll(input)), JSON.stringify([1, 0, 0, 1]), 'input untouched')
  }),
])
