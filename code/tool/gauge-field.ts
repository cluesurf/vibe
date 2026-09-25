// A gauge field is a connection: a group element on every directed edge that
// parallel-transports along that link. Under monism it is a tone on relational
// vibes (the links).

import { Graph, edgeList } from '@/code/tool/graph'

// The group of a graph gauge field: a Z_q clock, the element exp(2 pi i k / q) stored as the integer
// k, which approximates U(1) as q grows. One integer per link cannot hold a non-abelian element, so
// SU(N) gauge fields live in code/dynamics/gauge-lattice, as N x N matrices on a hypercubic lattice.
export type GaugeGroup = { readonly form: 'u1'; readonly q: number }

// Directed edges are indexed; each carries an integer group element. For U(1)
// the integer k means phase 2*pi*k/q. The forward edge (a->b) is stored; the
// reverse (b->a) is the group inverse, computed on demand.
export type DirectedEdge = {
  readonly from: number
  readonly to: number
}

export type GaugeField = {
  readonly form: 'gauge-field'
  readonly group: GaugeGroup
  readonly edges: readonly DirectedEdge[]
  // edgeIndex.get(`${from},${to}`) -> index into edges
  readonly edgeIndex: ReadonlyMap<string, number>
  readonly link: Int32Array // one group element per directed edge
}

export function edgeKey(input: { from: number; to: number }): string {
  return `${input.from},${input.to}`
}

// Build a gauge field over a graph's undirected edges (one DirectedEdge a->b per
// edge, with the reverse handled as the inverse). Links start at identity (0).
export function makeGaugeField(input: {
  graph: Graph
  group: GaugeGroup
}): GaugeField {
  const edges: DirectedEdge[] = []
  const edgeIndex = new Map<string, number>()

  for (const e of edgeList(input.graph)) {
    const idx = edges.length

    edges.push({ from: e.a, to: e.b })
    edgeIndex.set(edgeKey({ from: e.a, to: e.b }), idx)
  }

  return {
    form: 'gauge-field',
    group: input.group,
    edges,
    edgeIndex,
    link: new Int32Array(edges.length),
  }
}

// The U(1) phase carried by traversing from -> to (sign flips on the reverse).
export function linkPhase(
  field: GaugeField,
  input: { from: number; to: number },
): number {
  const q = field.group.q
  const forward = field.edgeIndex.get(
    edgeKey({ from: input.from, to: input.to }),
  )

  if (forward !== undefined) {
    return (2 * Math.PI * (field.link[forward] ?? 0)) / q
  }

  const reverse = field.edgeIndex.get(
    edgeKey({ from: input.to, to: input.from }),
  )

  if (reverse !== undefined) {
    return (-2 * Math.PI * (field.link[reverse] ?? 0)) / q
  }

  return 0
}

// A plaquette set: the smallest oriented loops (faces) where field strength lives.
export type PlaquetteSet = {
  readonly form: 'plaquettes'
  // each loop is an ordered list of vertices forming a cycle
  readonly loops: readonly Uint32Array[]
}
