// A gauge field is a connection: a group element on every directed edge that
// parallel-transports along that link. Under monism it is a tone on relational
// vibes (the links).

import { Graph, edgeList } from '@/code/tool/graph'

export type GaugeGroup =
  | { readonly form: 'u1'; readonly q: number } // Z_q clock, approximates U(1)
  | { readonly form: 'su2'; readonly q: number } // discretised SU(2) (placeholder dim)
  | { readonly form: 'su3'; readonly q: number } // discretised SU(3) (placeholder dim)

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
  if (field.group.form !== 'u1') return 0

  const q = field.group.q
  const forward = field.edgeIndex.get(
    edgeKey({ from: input.from, to: input.to }),
  )

  if (forward !== undefined)
    return (2 * Math.PI * (field.link[forward] ?? 0)) / q

  const reverse = field.edgeIndex.get(
    edgeKey({ from: input.to, to: input.from }),
  )

  if (reverse !== undefined)
    return (-2 * Math.PI * (field.link[reverse] ?? 0)) / q

  return 0
}

// A plaquette set: the smallest oriented loops (faces) where field strength lives.
export type PlaquetteSet = {
  readonly form: 'plaquettes'
  // each loop is an ordered list of vertices forming a cycle
  readonly loops: readonly Uint32Array[]
}
