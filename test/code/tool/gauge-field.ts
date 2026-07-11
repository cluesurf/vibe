// Conformance for code/tool/gauge-field: a connection that carries a Z_q phase on every directed link.
// The exact facts: makeGaugeField puts one stored edge per undirected graph edge and starts every link at the
// identity (0). linkPhase reads 2*pi*k/q forward and the GROUP INVERSE (negated phase) on the reverse traversal,
// and 0 on an absent edge. The phase is a genuine float, so those checks use a tight tolerance; counts are exact.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import {
  makeGaugeField,
  linkPhase,
  edgeKey,
} from '@/code/tool/gauge-field'

// A triangle 0-1-2 (three undirected edges), so the field has exactly three stored directed edges.
const graph = makeGraph({
  size: 3,
  directed: false,
  neighbors: [
    [1, 2],
    [0, 2],
    [0, 1],
  ],
})

suite('tool/gauge-field: edge key and construction', [
  check('edgeKey is the "from,to" pair', () => {
    equal(edgeKey({ from: 2, to: 5 }), '2,5', 'directed key')
  }),
  check(
    'one stored edge per undirected edge, links start at identity',
    () => {
      const field = makeGaugeField({
        graph,
        group: { form: 'u1', q: 4 },
      })

      equal(
        field.edges.length,
        3,
        'three undirected edges -> three stored edges',
      )
      equal(field.link.length, 3, 'one link integer per directed edge')

      for (const k of field.link) {
        equal(k, 0, 'every link starts at the identity element 0')
      }
    },
  ),
  check('the identity field has zero phase on every traversal', () => {
    const field = makeGaugeField({ graph, group: { form: 'u1', q: 4 } })

    for (const e of field.edges) {
      close(
        linkPhase(field, { from: e.from, to: e.to }),
        0,
        1e-12,
        'forward',
      )

      close(
        linkPhase(field, { from: e.to, to: e.from }),
        0,
        1e-12,
        'reverse',
      )
    }
  }),
])

suite('tool/gauge-field: U(1) link phase', [
  check('forward phase is 2*pi*k/q and reverse is its negation', () => {
    const q = 6
    const field = makeGaugeField({ graph, group: { form: 'u1', q } })
    // Pick the stored edge 0 -> its neighbour and set a known group element.
    const e = field.edges[0]!
    const idx = field.edgeIndex.get(
      edgeKey({ from: e.from, to: e.to }),
    )!

    field.link[idx] = 2

    const expected = (2 * Math.PI * 2) / q

    close(
      linkPhase(field, { from: e.from, to: e.to }),
      expected,
      1e-12,
      'forward phase 2*pi*k/q',
    )

    close(
      linkPhase(field, { from: e.to, to: e.from }),
      -expected,
      1e-12,
      'reverse phase is the group inverse (negated)',
    )
  }),
  check('an absent edge carries zero phase', () => {
    const field = makeGaugeField({ graph, group: { form: 'u1', q: 4 } })

    // 0 and a nonexistent vertex 99: neither direction is stored.
    close(
      linkPhase(field, { from: 0, to: 99 }),
      0,
      1e-12,
      'no such edge',
    )
  }),
  check(
    'a non-U(1) group reports zero phase (no clock structure)',
    () => {
      const field = makeGaugeField({
        graph,
        group: { form: 'su2', q: 4 },
      })

      const e = field.edges[0]!
      const idx = field.edgeIndex.get(
        edgeKey({ from: e.from, to: e.to }),
      )!

      field.link[idx] = 3
      ok(
        linkPhase(field, { from: e.from, to: e.to }) === 0,
        'su2 has no scalar phase',
      )
    },
  ),
])
