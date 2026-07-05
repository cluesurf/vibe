// Convex-polytope combinatorics from a vertex set, with exact integer arithmetic. The one
// capability here is counting the facets (the top-dimensional cells) of the convex hull of a
// set of integer points in four dimensions, so a polytope's face vector is DERIVED from its
// vertices rather than asserted from a table. This is what lets self-duality (corners equal
// faces) be computed, not hardcoded.
//
// A facet of a 4-polytope is a three-dimensional cell, and it lies on a SUPPORTING hyperplane:
// a hyperplane that touches the hull and keeps every vertex on one side. So the algorithm is:
// take every four vertices, form the hyperplane through them, and keep it as a facet exactly
// when all remaining vertices lie on a single side (ties allowed, they are co-facet vertices).
// The facet is then the full set of vertices on that hyperplane, deduplicated. Everything is
// integer: the hyperplane normal is a generalized cross product of integer edge vectors, so
// the side test is an exact integer sign, never a float tolerance.

// The 3x3 determinant, expanded on the first row.
function determinant3(rows: number[][]): number {
  const [a, b, c] = rows as [number[], number[], number[]]

  return (
    a[0]! * (b[1]! * c[2]! - b[2]! * c[1]!) -
    a[1]! * (b[0]! * c[2]! - b[2]! * c[0]!) +
    a[2]! * (b[0]! * c[1]! - b[1]! * c[0]!)
  )
}

// The 4D vector orthogonal to three given 4D vectors, the generalized cross product. Component
// k is the signed 3x3 minor of the three vectors with coordinate k deleted, so the result n
// satisfies n . a = n . b = n . c = 0 exactly (n . x is the 4x4 determinant of x over a, b, c,
// which vanishes when x is any of a, b, c by a repeated row). Integer in, integer out.
export function orthogonalToThree(
  a: number[],
  b: number[],
  c: number[],
): number[] {
  const rows = [a, b, c]
  const normal = [0, 0, 0, 0]

  for (let k = 0; k < 4; k++) {
    const minor = rows.map(row => row.filter((_, i) => i !== k))
    normal[k] = (k % 2 === 0 ? 1 : -1) * determinant3(minor)
  }

  return normal
}

function subtract(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]!)
}

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, x, i) => sum + x * b[i]!, 0)
}

// The facets of the convex hull of a set of 4D integer points, each returned as the sorted
// list of vertex indices lying on that facet's supporting hyperplane. A facet plane is found
// by every four vertices that are affinely independent (a nonzero normal); it is kept only
// when no vertex lies strictly on both sides, which is exactly the supporting condition.
export function fourPolytopeFacets(vertices: number[][]): number[][] {
  const count = vertices.length
  const facets = new Map<string, number[]>()

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      for (let k = j + 1; k < count; k++) {
        for (let l = k + 1; l < count; l++) {
          const edgeOne = subtract(vertices[j]!, vertices[i]!)
          const edgeTwo = subtract(vertices[k]!, vertices[i]!)
          const edgeThree = subtract(vertices[l]!, vertices[i]!)
          const normal = orthogonalToThree(edgeOne, edgeTwo, edgeThree)

          // affinely dependent four points span no hyperplane, skip
          if (normal.every(x => x === 0)) {
            continue
          }

          const offset = dot(normal, vertices[i]!)

          let anyAbove = false
          let anyBelow = false

          const onPlane: number[] = []

          for (let m = 0; m < count; m++) {
            const side = dot(normal, vertices[m]!) - offset

            if (side === 0) {
              onPlane.push(m)
            } else if (side > 0) {
              anyAbove = true
            } else {
              anyBelow = true
            }
          }

          // a supporting hyperplane keeps every vertex on one side, so a facet has
          // vertices on at most one side plus the ones exactly on the plane
          if (anyAbove && anyBelow) {
            continue
          }

          // onPlane is ascending because m increased, so its join is a canonical key
          facets.set(onPlane.join(','), onPlane)
        }
      }
    }
  }

  return [...facets.values()]
}

// The number of facets of the convex hull of a 4D integer point set.
export function fourPolytopeFacetCount(vertices: number[][]): number {
  return fourPolytopeFacets(vertices).length
}
