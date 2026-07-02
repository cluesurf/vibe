// Conformance for code/tool/graph: adjacency, CSR conversion, edge lists, and BFS.
// We re-derive every expected value independently of the implementation: CSR offsets
// by the prefix-sum definition, BFS distances by hand on a path / cycle, edges by the
// v < w rule. Counts and integer distances are exact, so no tolerance.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
  ok,
} from '@/test/code/harness'
import {
  makeGraph,
  degree,
  meanDegree,
  mostConnectedNode,
  toCsr,
  edgesFromCsr,
  edgesOf,
  adjacencyListsEqual,
  csrDistances,
  csrBfsOrder,
  largestComponentNodes,
} from '@/code/tool/graph'

// An undirected path 0-1-2-3. Neighbour lists, with degrees 1,2,2,1.
const PATH: number[][] = [[1], [0, 2], [1, 3], [2]]

// Independent CSR builder: offsets is the prefix sum of row lengths, adj is the rows concatenated.
function csrByHand(neighbors: number[][]): {
  offsets: number[]
  adj: number[]
} {
  const offsets = [0]
  const adj: number[] = []

  for (const row of neighbors) {
    for (const v of row) {
      adj.push(v)
    }

    offsets.push(adj.length)
  }

  return { offsets, adj }
}

suite('tool/graph: adjacency and CSR', [
  check('degree reads the neighbour-row length', () => {
    const g = makeGraph({ size: 4, directed: false, neighbors: PATH })
    equal(degree(g, { node: 0 }), 1, 'endpoint degree')
    equal(degree(g, { node: 1 }), 2, 'interior degree')
  }),
  check('meanDegree = total degree / size (= 2 * edges / size)', () => {
    const g = makeGraph({ size: 4, directed: false, neighbors: PATH })
    // degrees 1+2+2+1 = 6, six = 2*3 edges, mean 6/4 = 1.5
    close(meanDegree(g), 1.5, 1e-12, 'mean degree')
  }),
  check(
    'mostConnectedNode picks max degree, ties to lowest index',
    () => {
      // nodes 1 and 2 both have degree 2; lowest index wins => 1
      equal(mostConnectedNode(PATH), 1, 'most connected')
    },
  ),
  check('toCsr matches the prefix-sum CSR built by hand', () => {
    const want = csrByHand(PATH)
    const got = toCsr(PATH)
    exactArray(got.offsets, Uint32Array.from(want.offsets), 'offsets')
    exactArray(got.adj, Uint32Array.from(want.adj), 'adj')
  }),
  check('toCsr offsets end at the total neighbour count', () => {
    const got = toCsr(PATH)
    const totalNeighbours = PATH.reduce((s, row) => s + row.length, 0)
    equal(got.offsets[PATH.length]!, totalNeighbours, 'final offset')
  }),
  check(
    'edgesFromCsr returns each undirected edge once with eu < ev',
    () => {
      const { offsets, adj } = toCsr(PATH)
      const { eu, ev } = edgesFromCsr(offsets, adj, 4)
      // path edges: (0,1),(1,2),(2,3)
      exactArray(eu, Int32Array.from([0, 1, 2]), 'eu')
      exactArray(ev, Int32Array.from([1, 2, 3]), 'ev')
    },
  ),
  check('edgesOf returns each undirected edge once with v < w', () => {
    const g = makeGraph({ size: 4, directed: false, neighbors: PATH })
    const edges = edgesOf(g.neighbors)
    equal(edges.length, 3, 'edge count')
    exactArray(
      Int32Array.from(edges.flat()),
      Int32Array.from([0, 1, 1, 2, 2, 3]),
      'edges flat',
    )
  }),
  check(
    'adjacencyListsEqual is order-insensitive and detects a difference',
    () => {
      ok(
        adjacencyListsEqual(PATH, [[1], [2, 0], [3, 1], [2]]),
        'same up to order',
      )
      ok(
        !adjacencyListsEqual(PATH, [[1], [0], [1, 3], [2]]),
        'missing edge differs',
      )
    },
  ),
])

suite('tool/graph: BFS traversal', [
  check(
    'csrDistances on the path equal the hop count from node 0',
    () => {
      const { offsets, adj } = toCsr(PATH)
      const dist = csrDistances({ offsets, adj, size: 4, source: 0 })
      exactArray(dist, Int32Array.from([0, 1, 2, 3]), 'path distances')
    },
  ),
  check(
    'csrDistances with maxRadius stops after that many rings',
    () => {
      const { offsets, adj } = toCsr(PATH)
      const dist = csrDistances({
        offsets,
        adj,
        size: 4,
        source: 0,
        maxRadius: 1,
      })

      // only node 0 (0) and node 1 (1) reached; 2 and 3 stay -1
      exactArray(
        dist,
        Int32Array.from([0, 1, -1, -1]),
        'radius-1 distances',
      )
    },
  ),
  check(
    'csrDistances on a 6-cycle matches hand distances (min of both arcs)',
    () => {
      // cycle 0-1-2-3-4-5-0
      const cyc: number[][] = [
        [1, 5],
        [0, 2],
        [1, 3],
        [2, 4],
        [3, 5],
        [4, 0],
      ]

      const { offsets, adj } = toCsr(cyc)
      const dist = csrDistances({ offsets, adj, size: 6, source: 0 })
      // distances on a 6-cycle from 0: 0,1,2,3,2,1
      exactArray(
        dist,
        Int32Array.from([0, 1, 2, 3, 2, 1]),
        'cycle distances',
      )
    },
  ),
  check('csrBfsOrder lists every node once starting from 0', () => {
    const { offsets, adj } = toCsr(PATH)
    const order = csrBfsOrder({ offsets, adj, size: 4 })
    exactArray(order, Int32Array.from([0, 1, 2, 3]), 'bfs order')
  }),
  check(
    'largestComponentNodes returns a full component of a disconnected graph',
    () => {
      // two disjoint edges: {0,1} and {2,3}, first found (size 2) is kept
      const two: number[][] = [[1], [0], [3], [2]]
      const comp = largestComponentNodes(two)
      equal(comp.length, 2, 'component size')
      exactArray(
        Int32Array.from([...comp].sort((a, b) => a - b)),
        Int32Array.from([0, 1]),
        'members',
      )
    },
  ),
])
