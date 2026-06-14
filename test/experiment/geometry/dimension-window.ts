// P62: the dimension window (why the crystal substrate is low-dimensional).
// Is the substrate's 3D spatial form a choice or a constraint? The construction is fully
// general: a regular hyperbolic honeycomb {p, q, r, ...} can be written in any dimension. But
// requiring it to be a genuine CRYSTAL with finite cells (a compact regular hyperbolic
// honeycomb) is a hard constraint. A regular honeycomb {p1, ..., pk} tiles a k-dimensional
// space, and its type is read from the Schlafli (Gram) matrix of its reflection group:
//   positive definite  -> spherical (a finite polytope),
//   positive semidefinite (a zero eigenvalue) -> Euclidean (tiles flat space),
//   exactly one negative eigenvalue, signature (k, 1) -> hyperbolic (tiles H^k).
// It is COMPACT (finite cells, finite vertex figures) when both the cell (drop the last entry)
// and the vertex figure (drop the first) are spherical. Enumerating these shows compact
// regular hyperbolic honeycombs exist ONLY in dimensions 2, 3, and 4, and none at 5 and above.
// So the crystal substrate cannot be an arbitrary n-dimensional thing: finite cells force the
// spatial dimension into {2, 3, 4}, and 3 (four-dimensional spacetime) sits inside that window.
// Run: npx tsx code/experiment/p62-dimension-window.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { enumerateCompactHoneycombs } from '@/code/substrate/coxeter/schlafli'

export function dimensionWindow(input: { maxP: number; maxDimension: number }): {
  byDimension: { dimension: number; count: number; examples: string[] }[]
  compactWindow: number[]
  vanishesAbove: number
} {
  const byDimension: { dimension: number; count: number; examples: string[] }[] = []
  for (let n = 2; n <= input.maxDimension; n++) {
    const found = enumerateCompactHoneycombs({ dimension: n, maxEntry: input.maxP })
    byDimension.push({
      dimension: n,
      count: found.length,
      examples: found.slice(0, 6).map((s) => `{${s.join(',')}}`),
    })
  }
  const compactWindow = byDimension.filter((d) => d.count > 0).map((d) => d.dimension)
  const firstEmpty = byDimension.find((d) => d.count === 0)
  return {
    byDimension,
    compactWindow,
    vanishesAbove: (compactWindow[compactWindow.length - 1] ?? 0),
  }
}

export default experiment({
  id: 'geometry/dimension-window',
  title: 'compact hyperbolic crystals only in dimensions 2, 3, 4 (H3 = 4, H4 = 5, H5 plus = 0)',
  category: 'geometry',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const r = dimensionWindow({ maxP: 8, maxDimension: 6 })
    const count = (n: number): number =>
      r.byDimension.find((d) => d.dimension === n)?.count ?? -1
    const ok =
      count(3) === 4 &&
      count(4) === 5 &&
      count(5) === 0 &&
      count(6) === 0 &&
      r.compactWindow.join(',') === '2,3,4'
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'enumerating compact regular hyperbolic honeycombs reproduces the known classification and shows they exist only in dimensions two three and four',
      metrics: {
        h2: count(2),
        h3: count(3),
        h4: count(4),
        h5: count(5),
      },
    })
  },
})
