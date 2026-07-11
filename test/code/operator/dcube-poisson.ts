// Conformance for code/operator/dcube-poisson: the discrete Poisson Green's function on a
// flat d-cube with Dirichlet boundary, solved by conjugate gradient. The solver returns x
// with (the positive lattice Laplacian) applied to x equal to the unit point source delta at
// the centre. Re-derivable facts, independent of the CG internals:
//   - Apply the SAME nearest-neighbour stencil (2d on the diagonal, -1 per in-bounds neighbour)
//     to the returned x; the result must equal delta (1 at centre, 0 elsewhere) to CG tolerance.
//   - The potential is positive at the source and decays monotonically along an axis toward the
//     Dirichlet wall (the lattice Newton/Coulomb falloff).

import { suite, check, ok, close } from '@/test/code/harness'
import { dCubePoissonGreens } from '@/code/operator/dcube-poisson'

// Re-derive the residual of the discrete Laplace equation independently of the solver.
function maxResidual(input: {
  side: number
  dimension: number
  x: Float64Array
  idx: (c: number[]) => number
  coord: (i: number) => number[]
}): number {
  const { side, dimension, x, idx, coord } = input
  const center =
    dimension === 3
      ? [side >> 1, side >> 1, side >> 1]
      : [side >> 1, side >> 1]

  const centerIdx = idx(center)

  let worst = 0

  for (let i = 0; i < x.length; i++) {
    const c = coord(i)

    let v = 2 * dimension * (x[i] ?? 0)

    for (let k = 0; k < dimension; k++) {
      for (const s of [-1, 1]) {
        const cc = c.slice()

        cc[k]! += s

        if (cc[k]! >= 0 && cc[k]! < side) v -= x[idx(cc)] ?? 0
      }
    }

    const b = i === centerIdx ? 1 : 0

    worst = Math.max(worst, Math.abs(v - b))
  }

  return worst
}

suite(
  'operator/dcube-poisson: the solve inverts the lattice Laplacian',
  [
    check(
      '2D: stencil applied to the solution returns the point source',
      () => {
        const side = 15
        const r = dCubePoissonGreens({
          side,
          dimension: 2,
          iterations: 5000,
          tolerance: 1e-9,
        })

        close(
          maxResidual({ side, dimension: 2, ...r }),
          0,
          1e-7,
          '2D Poisson residual',
        )
      },
    ),
    check(
      '3D: stencil applied to the solution returns the point source',
      () => {
        const side = 9
        const r = dCubePoissonGreens({
          side,
          dimension: 3,
          iterations: 5000,
          tolerance: 1e-9,
        })

        close(
          maxResidual({ side, dimension: 3, ...r }),
          0,
          1e-7,
          '3D Poisson residual',
        )
      },
    ),
    check(
      'the potential is positive at the source and decays toward the wall (2D)',
      () => {
        const side = 15
        const { x, idx } = dCubePoissonGreens({
          side,
          dimension: 2,
          iterations: 5000,
          tolerance: 1e-9,
        })

        const mid = side >> 1
        const atCenter = x[idx([mid, mid])] ?? 0

        ok(atCenter > 0, 'center potential positive')

        // along +x from the centre to the wall, the potential strictly decreases.
        for (let d = 0; mid + d + 1 < side; d++) {
          const here = x[idx([mid + d, mid])] ?? 0
          const next = x[idx([mid + d + 1, mid])] ?? 0

          ok(here > next - 1e-12, `decay at offset ${d}`)
        }
      },
    ),
  ],
)
