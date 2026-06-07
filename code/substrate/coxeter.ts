// One machine for all the regular tessellations: the Coxeter (reflection-group)
// construction. Every regular tiling {p,q} or honeycomb {p,q,r} is the orbit of a
// fundamental cell under reflections, encoded by its Schlafli symbol. Changing the symbol
// gives a different tiling from the same construction, so {7,3}, {5,4}, and {5,3,4} are
// special cases of one thing. The 2D builder reflects a central polygon across its edges,
// the 3D builder reflects a central dodecahedron across its faces, both reflection-group
// orbits. See the choosing-the-base analysis.

import { Graph } from '~/core/graph'
import { hyperbolicTiling } from '~/substrate/hyperbolic-graph'
import { hyperbolicDodecagrid } from '~/substrate/hyperbolic-honeycomb'

// Generate the tessellation named by a Schlafli symbol. A two-symbol {p,q} is a 2D
// tiling, the three-symbol {5,3,4} is the 3D dodecagrid. Sensible per-symbol generation
// parameters are chosen so each comes out connected with exponential reach.
export function coxeterTessellation(input: { schlafli: number[]; maxVertices?: number }): Graph {
  const s = input.schlafli
  const cap = input.maxVertices ?? 2500
  if (s.length === 2) {
    const p = s[0] ?? 7
    const q = s[1] ?? 3
    if (1 / p + 1 / q >= 0.5) {
      throw new Error(`{${p},${q}} is not hyperbolic (need 1/p + 1/q < 1/2)`)
    }
    // Larger cells (small q) need a larger connection threshold to span a cell.
    const threshold = q <= 3 ? 0.8 : q === 4 ? 1.1 : 1.4
    return hyperbolicTiling({ p, q, depth: 6, connectThreshold: threshold, maxVertices: cap })
  }
  if (s.length === 3 && s[0] === 5 && s[1] === 3 && s[2] === 4) {
    return hyperbolicDodecagrid({ depth: 4, connectThreshold: 2.0, maxVertices: cap })
  }
  throw new Error(`unsupported Schlafli symbol {${s.join(',')}}`)
}
