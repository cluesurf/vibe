// Conformance for code/substrate/regular-graph: the configuration-model regular graph. The build is a pure
// function of the seed, so two builds with the same seed are byte-identical (determinism is a hard testbed
// requirement). Every node degree is at most the requested degree (self-loops are dropped), the CSR
// adjacency is symmetric, no edge is a self-loop, and the CSR row sizes match the edge multiset. EXACT.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import { buildRegularGraph } from '@/code/substrate/regular-graph'
import { makeRng } from '@/code/tool/rng'

suite('substrate/regular-graph: determinism', [
  check('the same seed yields an identical graph', () => {
    const a = buildRegularGraph({
      n: 200,
      degree: 4,
      rng: makeRng({ seed: 7 }),
    })

    const b = buildRegularGraph({
      n: 200,
      degree: 4,
      rng: makeRng({ seed: 7 }),
    })

    exactArray(a.eu, b.eu, 'eu identical')
    exactArray(a.ev, b.ev, 'ev identical')
    exactArray(a.offsets, b.offsets, 'offsets identical')
    exactArray(a.adj, b.adj, 'adj identical')
  }),
  check('a different seed yields a different graph', () => {
    const a = buildRegularGraph({
      n: 200,
      degree: 4,
      rng: makeRng({ seed: 7 }),
    })

    const c = buildRegularGraph({
      n: 200,
      degree: 4,
      rng: makeRng({ seed: 8 }),
    })

    let differs = false

    for (let i = 0; i < a.adj.length && i < c.adj.length; i++) {
      if (a.adj[i] !== c.adj[i]) {
        differs = true
        break
      }
    }

    ok(differs || a.adj.length !== c.adj.length, 'seeds 7 and 8 differ')
  }),
])

suite('substrate/regular-graph: structural invariants', [
  check('no self-loops and degree never exceeds the request', () => {
    const g = buildRegularGraph({
      n: 300,
      degree: 6,
      rng: makeRng({ seed: 11 }),
    })

    for (let e = 0; e < g.eu.length; e++) {
      notOk(g.eu[e] === g.ev[e], `edge ${e} is not a self-loop`)
    }

    for (let i = 0; i < 300; i++) {
      const deg = g.offsets[i + 1]! - g.offsets[i]!

      ok(deg <= 6, `node ${i} degree <= 6`)
    }
  }),
  check(
    'CSR adjacency is symmetric and consistent with the edge list',
    () => {
      const g = buildRegularGraph({
        n: 150,
        degree: 4,
        rng: makeRng({ seed: 3 }),
      })

      // total CSR entries = 2 * edge count.
      equal(g.adj.length, 2 * g.eu.length, 'undirected double counting')

      // build a neighbour-set view and verify mutuality.
      const sets: Set<number>[] = Array.from(
        { length: 150 },
        () => new Set<number>(),
      )

      for (let i = 0; i < 150; i++) {
        for (let p = g.offsets[i]!; p < g.offsets[i + 1]!; p++) {
          sets[i]!.add(g.adj[p]!)
        }
      }

      for (let i = 0; i < 150; i++) {
        for (const j of sets[i]!) {
          ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
        }
      }
    },
  ),
])
