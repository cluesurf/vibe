// Conformance for code/tool/mesh: the uniform mesh interface. The properties that
// make streaming well defined are exact and we check them exactly: the coin size
// (degree), the cell count, opposite as a fixed-point-free involution, and the
// neighbour round-trip neighbour(neighbour(c,d), opposite(d)) === c on every cell and
// direction. The {3,4,3,4} coin MUST have degree exactly 24 (the D4 roots).

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  Mesh,
  squareMesh,
  cubicMesh,
  d4Mesh,
  d4MeshWithRest,
  b4Mesh,
  shellDistances,
} from '@/code/tool/mesh'

// opposite is an involution on the whole coin: opposite(opposite(d)) === d.
function oppositeInvolutes(mesh: Mesh): boolean {
  for (let d = 0; d < mesh.degree; d++) {
    if (mesh.opposite(mesh.opposite(d)) !== d) {
      return false
    }
  }
  return true
}

// On every cell, leaving by d then returning by opposite(d) lands back home. This is
// the law that makes a streamed charge keep its line of travel.
function neighbourRoundTrips(mesh: Mesh): boolean {
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    for (let d = 0; d < mesh.degree; d++) {
      const there = mesh.neighbour(cell, d)
      if (mesh.neighbour(there, mesh.opposite(d)) !== cell) {
        return false
      }
    }
  }
  return true
}

// Streaming is symmetric: if a -> b along d, then b -> a along opposite(d).
function streamingSymmetric(mesh: Mesh): boolean {
  for (let a = 0; a < mesh.cellCount; a++) {
    for (let d = 0; d < mesh.degree; d++) {
      const b = mesh.neighbour(a, d)
      if (mesh.neighbour(b, mesh.opposite(d)) !== a) {
        return false
      }
    }
  }
  return true
}

// Count of distinct cells reached from `cell` over the full coin.
function distinctNeighbours(mesh: Mesh, cell: number): number {
  const seen = new Set<number>()
  for (let d = 0; d < mesh.degree; d++) {
    seen.add(mesh.neighbour(cell, d))
  }
  return seen.size
}

suite('tool/mesh: degree and cell count', [
  check('squareMesh has degree 4 and side^2 cells', () => {
    const m = squareMesh({ side: 5 })
    equal(m.degree, 4, 'square degree')
    equal(m.cellCount, 25, 'square cells')
  }),
  check('cubicMesh has degree 6 and side^3 cells', () => {
    const m = cubicMesh({ side: 4 })
    equal(m.degree, 6, 'cubic degree')
    equal(m.cellCount, 64, 'cubic cells')
  }),
  check('d4Mesh has degree 24 (the {3,4,3,4} coin) and side^4 cells', () => {
    const m = d4Mesh({ side: 3 })
    equal(m.degree, 24, 'd4 degree is the 24 D4 roots')
    equal(m.cellCount, 81, 'd4 cells = 3^4')
  }),
  check('b4Mesh has degree 32 (24 long + 8 short) and side^4 cells', () => {
    const m = b4Mesh({ side: 3 })
    equal(m.degree, 32, 'b4 degree')
    equal(m.cellCount, 81, 'b4 cells = 3^4')
  }),
  check('d4MeshWithRest adds one rest slot: degree 25, same cell count', () => {
    const m = d4MeshWithRest({ side: 3 })
    equal(m.degree, 25, 'd4+rest degree')
    equal(m.cellCount, 81, 'd4+rest cells')
  }),
])

const directionalMeshes: { name: string; mesh: Mesh; fixedFree: boolean }[] = [
  { name: 'square', mesh: squareMesh({ side: 4 }), fixedFree: true },
  { name: 'cubic', mesh: cubicMesh({ side: 3 }), fixedFree: true },
  { name: 'd4', mesh: d4Mesh({ side: 3 }), fixedFree: true },
  { name: 'b4', mesh: b4Mesh({ side: 3 }), fixedFree: true },
  // the rest slot is its own opposite, so NOT fixed-point-free
  { name: 'd4-rest', mesh: d4MeshWithRest({ side: 3 }), fixedFree: false },
]

suite('tool/mesh: opposite is an involution', [
  ...directionalMeshes.map(({ name, mesh }) =>
    check(`${name}: opposite(opposite(d)) === d`, () => {
      ok(oppositeInvolutes(mesh), `${name} opposite must be an involution`)
    }),
  ),
  ...directionalMeshes
    .filter(m => m.fixedFree)
    .map(({ name, mesh }) =>
      check(`${name}: opposite has no fixed direction`, () => {
        for (let d = 0; d < mesh.degree; d++) {
          ok(mesh.opposite(d) !== d, `${name} direction ${d} is its own opposite`)
        }
      }),
    ),
  check('d4-rest: only the rest direction (24) is its own opposite', () => {
    const m = d4MeshWithRest({ side: 3 })
    for (let d = 0; d < 24; d++) {
      ok(m.opposite(d) !== d, `moving direction ${d} should not be self-opposite`)
    }
    equal(m.opposite(24), 24, 'rest is self-opposite')
    equal(m.neighbour(0, 24), 0, 'rest never streams (stays put)')
  }),
])

suite('tool/mesh: streaming round-trips and symmetry', [
  ...directionalMeshes.map(({ name, mesh }) =>
    check(`${name}: neighbour(neighbour(c,d), opposite(d)) === c`, () => {
      ok(neighbourRoundTrips(mesh), `${name} round-trip must return home`)
    }),
  ),
  ...directionalMeshes.map(({ name, mesh }) =>
    check(`${name}: streaming is symmetric (a->b implies b->a back)`, () => {
      ok(streamingSymmetric(mesh), `${name} streaming must be symmetric`)
    }),
  ),
  check('d4 coin reaches 24 distinct neighbours from a bulk cell', () => {
    const m = d4Mesh({ side: 3 })
    // the 24 D4 roots are distinct offsets, distinct mod side for side >= 3
    equal(distinctNeighbours(m, 0), 24, 'all 24 directions land on different cells')
  }),
])

suite('tool/mesh: shell distances', [
  check('shellDistances gives the source distance 0 and reaches every cell', () => {
    const m = squareMesh({ side: 5 })
    const d = shellDistances(m, 0)
    equal(d[0], 0, 'source is distance 0')
    for (let cell = 0; cell < m.cellCount; cell++) {
      ok(d[cell]! >= 0, `cell ${cell} unreached on a connected mesh`)
    }
  }),
  check('square shell distance is the L1 (taxicab) torus distance', () => {
    const side = 5
    const m = squareMesh({ side })
    const d = shellDistances(m, 0)
    const torus = (a: number) => Math.min(a, side - a)
    for (let cell = 0; cell < m.cellCount; cell++) {
      const x = cell % side
      const y = (cell - x) / side
      const expected = torus(x) + torus(y)
      equal(d[cell], expected, `taxicab distance to cell ${cell}`)
    }
  }),
])
