// Lattice gauge dynamics on a substrate graph: the Wilson action over plaquettes
// (smallest oriented loops) and a Metropolis heat-bath sweep over the link
// integers. Under monism the gauge field is a tone on the relational vibes (the
// links).

import { Graph } from '~/core/graph'
import {
  GaugeField,
  PlaquetteSet,
  linkPhase,
  edgeKey,
} from '~/core/gauge-field'
import { Rng } from '~/core/rng'

// Above this triangle count we skip the (more numerous) 4-cycle enumeration to
// keep plaquette discovery bounded; triangles alone are a valid plaquette set.
const TRIANGLE_BUDGET = 50000

// Find small cycles to serve as plaquettes. We enumerate triangles (3-cliques)
// and, if there are few of them, also add 4-cycles. Each loop is an ordered
// vertex list; orientation is the listed order.
export function plaquettesOf(input: { graph: Graph }): PlaquetteSet {
  const g = input.graph
  const loops: Uint32Array[] = []
  const seen = new Set<string>()

  const has = (a: number, b: number): boolean => {
    const row = g.neighbors[a] ?? new Uint32Array(0)
    // neighbors are sorted; a linear scan is fine for small degrees.
    for (let k = 0; k < row.length; k++) {
      if ((row[k] ?? -1) === b) {
        return true
      }
    }
    return false
  }

  // Triangles: for each edge a < b, find common neighbours c > b.
  for (let a = 0; a < g.size; a++) {
    const rowA = g.neighbors[a] ?? new Uint32Array(0)
    for (let i = 0; i < rowA.length; i++) {
      const b = rowA[i] ?? 0
      if (b <= a) {
        continue
      }
      const rowB = g.neighbors[b] ?? new Uint32Array(0)
      for (let j = 0; j < rowB.length; j++) {
        const c = rowB[j] ?? 0
        if (c <= b) {
          continue
        }
        if (has(a, c)) {
          loops.push(Uint32Array.from([a, b, c]))
        }
      }
    }
  }

  // 4-cycles only when triangles are few, to bound cost. A 4-cycle is
  // a < b, a < d, with a common non-adjacent fourth vertex c (a-b-c-d-a).
  if (loops.length <= TRIANGLE_BUDGET) {
    for (let a = 0; a < g.size; a++) {
      const rowA = g.neighbors[a] ?? new Uint32Array(0)
      for (let i = 0; i < rowA.length; i++) {
        const b = rowA[i] ?? 0
        if (b <= a) {
          continue
        }
        for (let j = 0; j < rowA.length; j++) {
          const d = rowA[j] ?? 0
          if (d <= a || d === b) {
            continue
          }
          // c must be adjacent to both b and d, and distinct from a.
          const rowB = g.neighbors[b] ?? new Uint32Array(0)
          for (let m = 0; m < rowB.length; m++) {
            const c = rowB[m] ?? 0
            if (c === a || c === d || c <= a) {
              continue
            }
            if (!has(c, d)) {
              continue
            }
            // Skip if a-c or b-d already form a chord (that is a triangle).
            if (has(a, c) || has(b, d)) {
              continue
            }
            const key = [a, b, c, d].slice().sort((x, y) => x - y).join(',')
            if (seen.has(key)) {
              continue
            }
            seen.add(key)
            loops.push(Uint32Array.from([a, b, c, d]))
          }
        }
      }
    }
  }

  return { form: 'plaquettes', loops }
}

// The holonomy (total phase) accumulated traversing an ordered loop and closing
// it back to the start vertex.
function loopPhase(field: GaugeField, loop: Uint32Array): number {
  let phase = 0
  const len = loop.length
  for (let k = 0; k < len; k++) {
    const from = loop[k] ?? 0
    const to = loop[(k + 1) % len] ?? 0
    phase += linkPhase(field, { from, to })
  }
  return phase
}

// Wilson action: sum over plaquettes of beta * (1 - cos(holonomy)). Minimised
// when every plaquette has trivial holonomy (a flat connection).
export function wilsonAction(input: {
  field: GaugeField
  plaquettes: PlaquetteSet
  beta: number
}): number {
  let total = 0
  for (const loop of input.plaquettes.loops) {
    total += input.beta * (1 - Math.cos(loopPhase(input.field, loop)))
  }
  return total
}

// Build a map from a directed edge key to the indices of the plaquettes whose
// boundary traverses that edge. We register both orientations of each
// consecutive vertex pair so a lookup by the field's stored edge direction hits.
function buildEdgePlaquetteIndex(input: {
  plaquettes: PlaquetteSet
}): Map<string, number[]> {
  const index = new Map<string, number[]>()
  const loops = input.plaquettes.loops
  for (let p = 0; p < loops.length; p++) {
    const loop = loops[p] ?? new Uint32Array(0)
    const len = loop.length
    for (let k = 0; k < len; k++) {
      const u = loop[k] ?? 0
      const v = loop[(k + 1) % len] ?? 0
      for (const key of [
        edgeKey({ from: u, to: v }),
        edgeKey({ from: v, to: u }),
      ]) {
        const list = index.get(key)
        if (list) {
          list.push(p)
        } else {
          index.set(key, [p])
        }
      }
    }
  }
  return index
}

// One Metropolis heat-bath sweep over the link integers. For each directed link
// we propose +/-1 (mod q), compute the action change over only the plaquettes
// touching that edge, and accept with min(1, exp(-beta*deltaS)). Mutates
// field.link in place.
export function heatBathSweep(input: {
  field: GaugeField
  plaquettes: PlaquetteSet
  beta: number
  rng: Rng
}): void {
  const field = input.field
  const q = field.group.q
  const edgePlaquettes = buildEdgePlaquetteIndex({ plaquettes: input.plaquettes })

  // Local energy (the beta-free part of the action) of the plaquettes touching
  // one edge. The beta factor is applied once in the acceptance test below.
  const localEnergy = (plaquetteIndices: number[]): number => {
    let total = 0
    for (const p of plaquetteIndices) {
      const loop = input.plaquettes.loops[p] ?? new Uint32Array(0)
      total += 1 - Math.cos(loopPhase(field, loop))
    }
    return total
  }

  for (let e = 0; e < field.link.length; e++) {
    const edge = field.edges[e]
    if (!edge) {
      continue
    }
    const touching =
      edgePlaquettes.get(edgeKey({ from: edge.from, to: edge.to })) ?? []
    if (touching.length === 0) {
      continue
    }

    const before = localEnergy(touching)
    const old = field.link[e] ?? 0
    const delta = input.rng.next() < 0.5 ? 1 : -1
    // Wrap into [0, q) so the clock variable stays in range.
    const proposed = ((old + delta) % q + q) % q
    field.link[e] = proposed

    const after = localEnergy(touching)
    const deltaS = after - before
    const accept =
      deltaS <= 0 || input.rng.next() < Math.exp(-input.beta * deltaS)
    if (!accept) {
      field.link[e] = old
    }
  }
}
