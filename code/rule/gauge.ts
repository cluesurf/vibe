// Gauge rule (P8): carry a Z_q phase on each directed link and update it by a
// local loop (plaquette) move toward lower Wilson action. The Rule interface
// acts on a Configuration, so the gauge field is held by closure and each step
// performs one Metropolis sweep that MUTATES field.link in place (acceptable for
// this research tool). The configuration passes through unchanged.
// See testbed/03-tones-rules-operators.md and testbed/08-path-to-gauge-and-matter.md.

import { Rule } from '~/rule/rule'
import {
  GaugeField,
  linkPhase,
} from '~/core/gauge-field'

// A triangle plaquette through an edge (a -> b): a third vertex c adjacent to
// both endpoints. The loop is a -> b -> c -> a. Its Wilson action term is
// (1 - cos(loop phase)), where the loop phase sums the three link phases.
interface Triangle {
  readonly a: number
  readonly b: number
  readonly c: number
}

// Wilson action term for the oriented triangle a -> b -> c -> a.
function trianglePhase(field: GaugeField, tri: Triangle): number {
  return (
    linkPhase(field, { from: tri.a, to: tri.b }) +
    linkPhase(field, { from: tri.b, to: tri.c }) +
    linkPhase(field, { from: tri.c, to: tri.a })
  )
}

// Build, per directed edge index, the list of triangle plaquettes that contain
// that edge. We derive adjacency purely from the gauge field's own edge list,
// so no graph reference is needed. SIMPLIFICATION: we use triangle (3-cycle)
// plaquettes, the smallest loops available on a general graph, rather than the
// square plaquettes of a hypercubic lattice. The staple-based local action is
// correct in spirit: changing one link changes only the loops through it.
function buildEdgeTriangles(field: GaugeField): Triangle[][] {
  // Undirected adjacency as a set of neighbors per vertex.
  let maxVertex = 0
  for (const e of field.edges) {
    if (e.from > maxVertex) {
      maxVertex = e.from
    }
    if (e.to > maxVertex) {
      maxVertex = e.to
    }
  }
  const neighbors: Set<number>[] = []
  for (let v = 0; v <= maxVertex; v++) {
    neighbors.push(new Set<number>())
  }
  for (const e of field.edges) {
    neighbors[e.from]?.add(e.to)
    neighbors[e.to]?.add(e.from)
  }

  const perEdge: Triangle[][] = field.edges.map(() => [])
  for (let i = 0; i < field.edges.length; i++) {
    const edge = field.edges[i]
    if (!edge) {
      continue
    }
    const a = edge.from
    const b = edge.to
    const na = neighbors[a]
    const nb = neighbors[b]
    if (!na || !nb) {
      continue
    }
    for (const c of na) {
      if (c !== b && nb.has(c)) {
        perEdge[i]?.push({ a, b, c })
      }
    }
  }
  return perEdge
}

export function gaugeRule(input: {
  name: string
  field: GaugeField
  beta: number
}): Rule {
  const field = input.field
  // Precompute the staple structure once (the substrate/edges are fixed).
  const edgeTriangles = buildEdgeTriangles(field)
  const q =
    field.group.form === 'u1' ||
    field.group.form === 'su2' ||
    field.group.form === 'su3'
      ? field.group.q
      : 1

  return {
    form: 'rule',
    name: input.name,
    // One link at a time, Monte Carlo style: the asynchronous scheme.
    scheme: 'asynchronous',
    step({ configuration, rng }) {
      // One sweep: try a +/-1 move on every link, accept by Metropolis.
      for (let i = 0; i < field.link.length; i++) {
        const triangles = edgeTriangles[i]
        if (!triangles || triangles.length === 0) {
          continue
        }

        // Local action before the move: sum over plaquettes through this link.
        let before = 0
        for (const tri of triangles) {
          before += 1 - Math.cos(trianglePhase(field, tri))
        }

        // Propose link[i] -> link[i] +/- 1 (mod q).
        const step = rng.next() < 0.5 ? -1 : 1
        const current = field.link[i] ?? 0
        const proposed = ((current + step) % q + q) % q
        field.link[i] = proposed

        // Local action after the move.
        let after = 0
        for (const tri of triangles) {
          after += 1 - Math.cos(trianglePhase(field, tri))
        }

        const deltaAction = after - before
        // Accept with min(1, exp(-beta * deltaS)); otherwise revert.
        if (deltaAction > 0 && rng.next() >= Math.exp(-input.beta * deltaAction)) {
          field.link[i] = current
        }
      }

      // The tone configuration is untouched; the field mutated by closure.
      return { configuration }
    },
  }
}
