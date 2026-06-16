// Max-flow and min-cut on an integer-capacity graph (Dinic's algorithm). Used for the holographic bit-thread /
// Ryu-Takayanagi measurement, the entanglement entropy of a boundary region is the minimal cut through the bulk
// separating it from the rest of the boundary (the discrete minimal surface). By the max-flow min-cut theorem the
// min-cut equals the maximum number of edge-disjoint bulk threads from the region to its complement.

interface Arc {
  to: number
  cap: number
  flow: number
  twin: number
}

// A flow network on `nodeCount` nodes. Add directed arcs (each with a reverse residual arc) and run maxFlow.
export class FlowNetwork {
  readonly nodeCount: number
  readonly arcs: Arc[] = []
  readonly out: number[][]

  constructor(nodeCount: number) {
    this.nodeCount = nodeCount
    this.out = Array.from({ length: nodeCount }, () => [] as number[])
  }

  // a directed arc from -> to with capacity cap, plus its reverse residual arc (capacity reverseCap, default 0).
  // an UNDIRECTED unit edge is addArc(u, v, 1, 1).
  addArc(from: number, to: number, cap: number, reverseCap = 0): void {
    const forward = this.arcs.length
    this.arcs.push({ to, cap, flow: 0, twin: forward + 1 })
    this.out[from]!.push(forward)
    const backward = this.arcs.length
    this.arcs.push({ to: from, cap: reverseCap, flow: 0, twin: forward })
    this.out[to]!.push(backward)
  }

  private buildLevels(source: number, sink: number): Int32Array | null {
    const level = new Int32Array(this.nodeCount).fill(-1)
    level[source] = 0
    let frontier = [source]
    while (frontier.length) {
      const next: number[] = []
      for (const node of frontier) {
        for (const arcIndex of this.out[node]!) {
          const arc = this.arcs[arcIndex]!
          if (arc.cap - arc.flow > 0 && level[arc.to] === -1) {
            level[arc.to] = level[node]! + 1
            next.push(arc.to)
          }
        }
      }
      frontier = next
    }
    return level[sink] === -1 ? null : level
  }

  private blockingFlow(node: number, sink: number, pushed: number, level: Int32Array, iter: Int32Array): number {
    if (node === sink) return pushed
    for (; iter[node]! < this.out[node]!.length; iter[node]!++) {
      const arcIndex = this.out[node]![iter[node]!]!
      const arc = this.arcs[arcIndex]!
      const residual = arc.cap - arc.flow
      if (residual > 0 && level[arc.to] === level[node]! + 1) {
        const sent = this.blockingFlow(arc.to, sink, Math.min(pushed, residual), level, iter)
        if (sent > 0) {
          arc.flow += sent
          this.arcs[arc.twin]!.flow -= sent
          return sent
        }
      }
    }
    return 0
  }

  // the maximum flow from source to sink (equals the min-cut capacity by the max-flow min-cut theorem).
  maxFlow(source: number, sink: number): number {
    let total = 0
    for (;;) {
      const level = this.buildLevels(source, sink)
      if (level === null) break
      const iter = new Int32Array(this.nodeCount)
      for (;;) {
        const sent = this.blockingFlow(source, sink, Infinity, level, iter)
        if (sent === 0) break
        total += sent
      }
    }
    return total
  }
}

// The minimum cut (number of edges to remove) separating the `sources` set from the `sinks` set in an UNDIRECTED
// unit-capacity graph given by an adjacency list. A super-source feeds every source node and every sink node feeds
// a super-sink, both with unbounded capacity, so the cut falls entirely on the graph's own unit edges. This is the
// discrete Ryu-Takayanagi minimal surface, the fewest bulk threads that separate a boundary region from its
// complement.
export function undirectedMinCut(input: {
  adjacency: ReadonlyArray<ReadonlyArray<number>>
  sources: ReadonlyArray<number>
  sinks: ReadonlyArray<number>
}): number {
  const n = input.adjacency.length
  const superSource = n
  const superSink = n + 1
  const network = new FlowNetwork(n + 2)
  const big = n + 5 // larger than any possible cut of unit edges, so the super-arcs are never the bottleneck
  for (let u = 0; u < n; u++) {
    for (const v of input.adjacency[u]!) {
      if (u < v) network.addArc(u, v, 1, 1)
    }
  }
  for (const s of input.sources) network.addArc(superSource, s, big, 0)
  for (const t of input.sinks) network.addArc(t, superSink, big, 0)
  return network.maxFlow(superSource, superSink)
}
