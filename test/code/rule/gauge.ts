// Conformance for code/rule/gauge: a Metropolis sweep over Z_q link phases on triangle plaquettes. The sweep is
// stochastic, so we check the EXACT structural invariants rather than a sampled value: the tone configuration
// passes through untouched, every link stays a valid Z_q element in [0, q), a triangle-FREE graph admits no move
// (links never leave the identity), and a fixed seed gives a reproducible sweep.

import { suite, check, equal, ok } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import { makeGaugeField } from '@/code/tool/gauge-field'
import {
  makeConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'
import { gaugeRule } from '@/code/rule/gauge'

// A triangle 0-1-2: each edge lies on one plaquette, so moves are possible.
const triangle = makeGraph({
  size: 3,
  directed: false,
  neighbors: [
    [1, 2],
    [0, 2],
    [0, 1],
  ],
})

// A 4-cycle 0-1-2-3-0: no two adjacent vertices share a common neighbour, so NO triangles.
const square = makeGraph({
  size: 4,
  directed: false,
  neighbors: [
    [1, 3],
    [0, 2],
    [1, 3],
    [0, 2],
  ],
})

const Q = 6

suite('rule/gauge: structural invariants of a sweep', [
  check('the tone configuration passes through unchanged', () => {
    const field = makeGaugeField({
      graph: triangle,
      group: { form: 'u1', q: Q },
    })

    const config = makeConfiguration({
      alphabet: { form: 'ternary' },
      size: 3,
    })

    setTone(config, { element: 0, value: 1 })
    setTone(config, { element: 2, value: -1 })

    const out = gaugeRule({ name: 'g', field, beta: 1 }).step({
      substrate: triangle,
      configuration: config,
      beat: 0,
      rng: makeRng({ seed: 7 }),
    })

    equal(
      getTone(out.configuration, { element: 0 }),
      1,
      'tone 0 unchanged',
    )
    equal(
      getTone(out.configuration, { element: 2 }),
      -1,
      'tone 2 unchanged',
    )
  }),
  check('every link stays a valid Z_q element in [0, q)', () => {
    const field = makeGaugeField({
      graph: triangle,
      group: { form: 'u1', q: Q },
    })

    const rule = gaugeRule({ name: 'g', field, beta: 0.5 })

    for (let sweep = 0; sweep < 10; sweep++) {
      rule.step({
        substrate: triangle,
        configuration: makeConfiguration({
          alphabet: { form: 'ternary' },
          size: 3,
        }),
        beat: sweep,
        rng: makeRng({ seed: sweep + 1 }),
      })
    }

    for (const k of field.link) {
      ok(k >= 0 && k < Q, `link element ${k} must be in [0, ${Q})`)
    }
  }),
  check(
    'a triangle-free graph admits no move (links stay at identity)',
    () => {
      const field = makeGaugeField({
        graph: square,
        group: { form: 'u1', q: Q },
      })

      gaugeRule({ name: 'g', field, beta: 1 }).step({
        substrate: square,
        configuration: makeConfiguration({
          alphabet: { form: 'ternary' },
          size: 4,
        }),
        beat: 0,
        rng: makeRng({ seed: 3 }),
      })

      for (const k of field.link) {
        equal(k, 0, 'no plaquette through any link, so no update')
      }
    },
  ),
])

suite('rule/gauge: determinism', [
  check('the same seed produces the same sweep', () => {
    const run = (): number[] => {
      const field = makeGaugeField({
        graph: triangle,
        group: { form: 'u1', q: Q },
      })

      gaugeRule({ name: 'g', field, beta: 0.8 }).step({
        substrate: triangle,
        configuration: makeConfiguration({
          alphabet: { form: 'ternary' },
          size: 3,
        }),
        beat: 0,
        rng: makeRng({ seed: 99 }),
      })

      return Array.from(field.link)
    }

    equal(
      JSON.stringify(run()),
      JSON.stringify(run()),
      'reproducible under a fixed seed',
    )
  }),
])
