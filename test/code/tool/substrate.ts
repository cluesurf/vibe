// Conformance for code/tool/substrate: the shared adjacency view over a Poset (causal set) or a Graph (mesh).
// The facts are exact graph counts. adjacencyOf gives OUT adjacency (a poset's covering links, a graph's
// neighbours); undirectedAdjacency symmetrises (a poset always, a graph only when directed) and dedupes+sorts;
// the two mean-degree helpers average out-degree and undirected degree respectively. We build small substrates
// by hand and read every count back.

import {
  suite,
  check,
  equal,
  exactArray,
  ok,
} from '@/test/code/harness'
import { Graph, makeGraph } from '@/code/tool/graph'
import { Poset } from '@/code/tool/poset'
import {
  adjacencyOf,
  undirectedAdjacency,
  substrateMeanDegree,
  substrateUndirectedMeanDegree,
} from '@/code/tool/substrate'

// An undirected path 0-1-2-3 with symmetric neighbour lists (out-degrees 1,2,2,1).
const path: Graph = makeGraph({
  size: 4,
  directed: false,
  neighbors: [[1], [0, 2], [1, 3], [2]],
})

// A directed graph with a single arc 0 -> 1 (out-degrees 1, 0).
const directed: Graph = makeGraph({
  size: 2,
  directed: true,
  neighbors: [[1], []],
})

// A poset: 0 covers {1,2}, 1 covers {2}, 2 covers nothing. The substrate adjacency
// views read only `form`, `size`, and `links`, so the transitive-closure `future`
// matrix is irrelevant here and omitted via a cast.
const poset: Poset = {
  form: 'poset',
  size: 3,
  links: [
    Uint32Array.from([1, 2]),
    Uint32Array.from([2]),
    Uint32Array.from([]),
  ],
} as unknown as Poset

function collectOut(s: Graph | Poset, node: number): number[] {
  const out: number[] = []
  adjacencyOf({ substrate: s }).forEachOut({
    node,
    visit: to => out.push(to),
  })

  return out.sort((a, b) => a - b)
}

suite('tool/substrate: out-adjacency view', [
  check(
    'graph out-degree and out-neighbours match the neighbour lists',
    () => {
      const view = adjacencyOf({ substrate: path })
      equal(view.size, 4, 'size')
      equal(
        view.outDegree({ node: 1 }),
        2,
        'degree of an interior node',
      )
      equal(view.outDegree({ node: 0 }), 1, 'degree of an endpoint')
      exactArray(collectOut(path, 1), [0, 2], 'neighbours of node 1')
    },
  ),
  check('directed graph counts only outgoing arcs', () => {
    const view = adjacencyOf({ substrate: directed })
    equal(view.outDegree({ node: 0 }), 1, '0 -> 1 is one out-arc')
    equal(view.outDegree({ node: 1 }), 0, '1 has no out-arc')
  }),
  check('poset out-adjacency follows the covering links', () => {
    const view = adjacencyOf({ substrate: poset })
    equal(view.outDegree({ node: 0 }), 2, '0 covers two elements')
    exactArray(collectOut(poset, 0), [1, 2], 'covers of 0')
    equal(view.outDegree({ node: 2 }), 0, 'top element covers nothing')
  }),
])

suite('tool/substrate: undirected adjacency', [
  check(
    'an undirected graph keeps its symmetric lists (deduped, sorted)',
    () => {
      const adj = undirectedAdjacency({ substrate: path })
      exactArray(adj[1]!, [0, 2], 'node 1')
      exactArray(adj[3]!, [2], 'endpoint')
    },
  ),
  check('a directed graph gets symmetrised', () => {
    const adj = undirectedAdjacency({ substrate: directed })
    exactArray(adj[0]!, [1], '0 keeps its arc')
    exactArray(adj[1]!, [0], '1 gains the reverse')
  }),
  check('a poset is symmetrised over its links', () => {
    const adj = undirectedAdjacency({ substrate: poset })
    exactArray(adj[0]!, [1, 2], 'down-set of 0')
    exactArray(adj[1]!, [0, 2], 'links both ways at 1')
    exactArray(adj[2]!, [0, 1], 'top sees its two predecessors')
  }),
])

suite('tool/substrate: mean degree', [
  check('mean out-degree is total out-degree over size', () => {
    // path out-degrees 1+2+2+1 = 6 over 4 nodes.
    equal(
      substrateMeanDegree({ substrate: path }),
      6 / 4,
      'path mean out-degree',
    )
    // directed out-degrees 1+0 = 1 over 2 nodes.
    equal(
      substrateMeanDegree({ substrate: directed }),
      0.5,
      'directed mean out-degree',
    )
  }),
  check('undirected mean degree uses the symmetrised lists', () => {
    // directed symmetrised: degrees 1 and 1 -> mean 1, distinct from the out mean of 0.5.
    equal(
      substrateUndirectedMeanDegree({ substrate: directed }),
      1,
      'symmetrised mean degree',
    )
    ok(
      substrateUndirectedMeanDegree({ substrate: directed }) !==
        substrateMeanDegree({ substrate: directed }),
      'symmetrising changes the directed mean degree',
    )
    // poset symmetrised degrees: 2 + 2 + 2 = 6 over 3 -> 2.
    equal(
      substrateUndirectedMeanDegree({ substrate: poset }),
      2,
      'poset undirected mean',
    )
  }),
])
