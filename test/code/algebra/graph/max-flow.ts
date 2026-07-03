// Conformance for code/algebra/graph/max-flow: Dinic max-flow and the undirected
// min-cut (the discrete Ryu-Takayanagi surface). Every expected value is hand-derived
// from a small network by counting edge-disjoint paths / a separating edge set, and the
// max-flow min-cut theorem (max flow = min cut) is checked directly.

import { suite, check, equal } from '@/test/code/harness'
import {
  FlowNetwork,
  undirectedMinCut,
} from '@/code/algebra/graph/max-flow'

suite('algebra/graph/max-flow: directed max flow', [
  check('the classic CLRS network has max flow 23', () => {
    // nodes: s=0, v1=1, v2=2, v3=3, v4=4, t=5
    const net = new FlowNetwork(6)
    net.addArc(0, 1, 16)
    net.addArc(0, 2, 13)
    net.addArc(1, 2, 10)
    net.addArc(2, 1, 4)
    net.addArc(1, 3, 12)
    net.addArc(3, 2, 9)
    net.addArc(2, 4, 14)
    net.addArc(4, 3, 7)
    net.addArc(3, 5, 20)
    net.addArc(4, 5, 4)
    equal(net.maxFlow(0, 5), 23, 'CLRS max flow = 23')
  }),
  check('two unit-capacity parallel paths give flow 2', () => {
    // s=0 -> a=1 -> t=3 and s -> b=2 -> t, each arc capacity 1
    const net = new FlowNetwork(4)
    net.addArc(0, 1, 1)
    net.addArc(1, 3, 1)
    net.addArc(0, 2, 1)
    net.addArc(2, 3, 1)
    equal(net.maxFlow(0, 3), 2, 'two disjoint unit paths')
  }),
  check('a single bottleneck arc caps the flow', () => {
    // s -> a (cap 5) -> b (cap 2, the bottleneck) -> t (cap 5)
    const net = new FlowNetwork(4)
    net.addArc(0, 1, 5)
    net.addArc(1, 2, 2)
    net.addArc(2, 3, 5)
    equal(net.maxFlow(0, 3), 2, 'min over the path = bottleneck')
  }),
])

suite('algebra/graph/max-flow: undirected min cut (RT surface)', [
  check('a 4-cycle has min cut 2 between opposite corners', () => {
    // 0-1, 1-3, 0-2, 2-3 : two edge-disjoint paths 0-1-3 and 0-2-3
    const adjacency = [
      [1, 2], // 0
      [0, 3], // 1
      [0, 3], // 2
      [1, 2], // 3
    ]

    equal(
      undirectedMinCut({ adjacency, sources: [0], sinks: [3] }),
      2,
      '4-cycle min cut = 2',
    )
  }),
  check(
    'K4 has min cut 3 between two vertices (degree of the source)',
    () => {
      const adjacency = [
        [1, 2, 3],
        [0, 2, 3],
        [0, 1, 3],
        [0, 1, 2],
      ]

      equal(
        undirectedMinCut({ adjacency, sources: [0], sinks: [1] }),
        3,
        'K4 min cut = 3',
      )
    },
  ),
  check('a path graph has min cut 1 (cut any single edge)', () => {
    const adjacency = [[1], [0, 2], [1, 3], [2, 4], [3]]
    equal(
      undirectedMinCut({ adjacency, sources: [0], sinks: [4] }),
      1,
      'path min cut = 1',
    )
  }),
  check('multiple sources / sinks: a 2x3 ladder', () => {
    // two rows {0,1,2} and {3,4,5}, rungs 0-3,1-4,2-5, rails along each row.
    // separating the top row from the bottom row cuts the 3 rungs.
    const adjacency = [
      [1, 3], // 0
      [0, 2, 4], // 1
      [1, 5], // 2
      [0, 4], // 3
      [1, 3, 5], // 4
      [2, 4], // 5
    ]

    equal(
      undirectedMinCut({
        adjacency,
        sources: [0, 1, 2],
        sinks: [3, 4, 5],
      }),
      3,
      'three rungs separate the two rows',
    )
  }),
])
