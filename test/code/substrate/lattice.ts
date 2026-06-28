// Conformance for code/substrate/lattice: the regular-lattice control. The riemannian case
// is the bounded hypercubic mesh, so interior cells have degree 2d and boundary cells fewer,
// and adjacency is symmetric. The lorentzian case is the diamond causal order, which must be
// a genuine strict partial order: irreflexive, antisymmetric, transitive. Every fact here is
// exact (integer degrees, boolean order relations).

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import { lattice } from '@/code/substrate/lattice'
import { Graph, degree } from '@/code/tool/graph'
import { Poset, precedes, relationCount } from '@/code/tool/poset'

function asGraph(input: {
  dimension: number
  extent: number
}): Graph {
  const s = lattice({ ...input, signature: 'riemannian' })
  if (s.form !== 'graph') {
    throw new Error('riemannian lattice must be a graph')
  }
  return s
}

function asPoset(input: {
  dimension: number
  extent: number
}): Poset {
  const s = lattice({ ...input, signature: 'lorentzian' })
  if (s.form !== 'poset') {
    throw new Error('lorentzian lattice must be a poset')
  }
  return s
}

suite('substrate/lattice: the riemannian mesh', [
  check('a 3x3 mesh has 9 cells and the expected degree profile', () => {
    // Row-major index: axis 0 fastest. The centre (1,1) is index 4 with degree 4 = 2d,
    // corner (0,0) index 0 has degree 2, edge (1,0) index 1 has degree 3.
    const g = asGraph({ dimension: 2, extent: 3 })
    equal(g.size, 9, 'cell count')
    equal(degree(g, { node: 4 }), 4, 'interior degree 2d')
    equal(degree(g, { node: 0 }), 2, 'corner degree')
    equal(degree(g, { node: 1 }), 3, 'edge degree')
  }),
  check('the degree sum equals twice the edge count (12 edges)', () => {
    // A 3x3 grid has 6 horizontal + 6 vertical edges = 12, so the degrees sum to 24.
    const g = asGraph({ dimension: 2, extent: 3 })
    let total = 0
    for (let i = 0; i < g.size; i++) {
      total += degree(g, { node: i })
    }
    equal(total, 24, 'sum of degrees')
  }),
  check('a 3x3x3 mesh centre has degree 2d = 6', () => {
    const g = asGraph({ dimension: 3, extent: 3 })
    equal(g.size, 27, 'cell count')
    equal(degree(g, { node: 13 }), 6, 'interior degree')
  }),
  check('adjacency is symmetric', () => {
    const g = asGraph({ dimension: 2, extent: 3 })
    const sets = g.neighbors.map(row => new Set(row))
    for (let i = 0; i < g.size; i++) {
      for (const j of g.neighbors[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} must be mutual`)
      }
    }
  }),
])

suite('substrate/lattice: the lorentzian causal order', [
  check('the diamond order is non-empty', () => {
    ok(relationCount(asPoset({ dimension: 2, extent: 3 })) > 0, 'has relations')
  }),
  check('the order is irreflexive', () => {
    const p = asPoset({ dimension: 2, extent: 3 })
    for (let i = 0; i < p.size; i++) {
      notOk(precedes(p, { a: i, b: i }), `no element precedes itself (${i})`)
    }
  }),
  check('the order is antisymmetric', () => {
    const p = asPoset({ dimension: 2, extent: 3 })
    for (let a = 0; a < p.size; a++) {
      for (let b = 0; b < p.size; b++) {
        if (precedes(p, { a, b })) {
          notOk(precedes(p, { a: b, b: a }), `${a}<${b} forbids ${b}<${a}`)
        }
      }
    }
  }),
  check('the order is transitive', () => {
    const p = asPoset({ dimension: 2, extent: 3 })
    for (let a = 0; a < p.size; a++) {
      for (let b = 0; b < p.size; b++) {
        if (!precedes(p, { a, b })) {
          continue
        }
        for (let c = 0; c < p.size; c++) {
          if (precedes(p, { a: b, b: c })) {
            ok(precedes(p, { a, b: c }), `${a}<${b}<${c} implies ${a}<${c}`)
          }
        }
      }
    }
  }),
])
