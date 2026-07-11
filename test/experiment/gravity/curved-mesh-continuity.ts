import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import {
  streamCoxeterMeshGas,
  collideCoxeterMeshGas,
  eraseCoxeterMeshGas,
  countCoxeterMeshGas,
} from '@/code/operator/coxeter-mesh-gas'
import {
  regionBall,
  continuityResidual,
} from '@/code/measure/graph-continuity'

// Continuity OFF THE FLAT TORUS, on the actual curved {3,4,3,4} geometry. The coarse-block continuity anchor
// (gravity/coarse-continuity-closure, E-GRV-0039) confirms the discrete div J = 0 law on a periodic flat
// d4 torus. The honest gap was that the curved hyperbolic substrate the theory actually commits to was never
// the thing the law ran on. This closes that gap. We generate the genuine {3,4,3,4} cell graph from its
// Coxeter reflections (BFS over the reflection group, each cell a group element, adjacency by a generator,
// boundary bonds marked -1 and reflected in place), run the reversible charge-conserving knit directly on
// that irregular curved adjacency, and check the discrete continuity law on a region (a ball of cells): the
// change in the charge enclosed in the ball equals the net charge that crossed the ball's boundary bonds,
// exactly, at every region size and every beat. The control is the lossy rule, whose residual is nonzero and
// equals exactly the charge it destroys inside the ball, so the residual localizes the violation.

const growthRatio = (shells: number[]): number => {
  const count = shells.length

  if (count < 4) {
    return 1
  }

  return shells[count - 2]! / shells[count - 3]!
}

export default experiment({
  id: 'gravity/curved-mesh-continuity',
  code: 'E-GRV-0042',
  title:
    'the discrete continuity law div J = 0 holds exactly on the actual curved {3,4,3,4} mesh, not only the flat torus, and the lossy control breaks it by exactly the charge it destroys',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // (1) build the genuine curved {3,4,3,4} cell graph from its Coxeter reflections.
    const mesh = buildCoxeterMatrixMesh([3, 4, 3, 4], 4000)
    const adjacency = mesh.adjacency
    const cells = adjacency.length
    const rank = adjacency[0]!.length

    const stream = (state: number[][]): number[][] =>
      streamCoxeterMeshGas({ state, adjacency, rank })

    const collide = (state: number[][], forward: boolean): number[][] =>
      collideCoxeterMeshGas({ state, rank, forward })

    const erase = (state: number[][], forward: boolean): number[][] =>
      eraseCoxeterMeshGas({ state, rank, forward })

    // a deterministic initial charge pattern (no randomness): occupy direction (cell mod rank) at each cell.
    const makeState = (): number[][] =>
      Array.from({ length: cells }, (_, cell) =>
        Array.from({ length: rank }, (_, d) =>
          d === cell % rank ? 1 : 0,
        ),
      )

    // (2) the test regions: nested balls around cell 0, each a proper sub-ball of the mesh so that real
    // charge crosses their boundaries into cells still inside the mesh.
    const radii = [1, 2, 3, 4]
    const regions = radii.map(radius =>
      regionBall(adjacency, 0, radius),
    )

    const beats = 24

    // (3) the reversible knit: per-region continuity residual must be exactly zero at every region, every beat.
    let realState = makeState()

    const charge0 = countCoxeterMeshGas(realState)

    let realMaxResidual = 0
    let globallyConserved = true

    for (let t = 0; t < beats; t++) {
      const streamed = collide(realState, true)
      const after = stream(streamed)

      for (const region of regions) {
        const residual = continuityResidual({
          before: realState,
          streamed,
          after,
          adjacency,
          region,
        })

        realMaxResidual = Math.max(realMaxResidual, Math.abs(residual))
      }

      realState = after

      if (countCoxeterMeshGas(realState) !== charge0) {
        globallyConserved = false
      }
    }

    // reversibility: the inverse beat (stream-then-collide-backward) returns the start exactly.
    const forwardEnd = realState.map(slots => [...slots])

    let rewound = forwardEnd

    for (let t = 0; t < beats; t++) {
      rewound = collide(stream(rewound), false)
    }

    const start = makeState()
    const reversible = rewound.every((slots, cell) =>
      slots.every((value, d) => value === start[cell]![d]),
    )

    // (4) CONTROL: the lossy rule destroys charge inside cells. Its per-region residual is nonzero and equals
    // exactly the charge erased inside the region, so continuity is broken on the same curved mesh.
    let lossyState = makeState()
    let lossyMaxResidual = 0
    let lossyResidualMatchesErased = true

    for (let t = 0; t < beats; t++) {
      const before = lossyState.map(slots => [...slots])
      const streamed = erase(lossyState, true)
      const after = stream(streamed)

      // the charge erased this beat lands in slot 0 of each cell after collide, so it is what the lossy step
      // destroys. the per-region residual must equal minus the erased charge inside that region.
      const collided = collide(before, true)

      for (const region of regions) {
        const residual = continuityResidual({
          before,
          streamed,
          after,
          adjacency,
          region,
        })

        lossyMaxResidual = Math.max(
          lossyMaxResidual,
          Math.abs(residual),
        )

        let erasedInRegion = 0

        for (const cell of region) {
          erasedInRegion += collided[cell]![0]!
        }

        if (residual !== -erasedInRegion) {
          lossyResidualMatchesErased = false
        }
      }

      lossyState = after
    }

    // (5) curvature confirmation: the {3,4,3,4} mesh grows faster than the flat cubic {4,3,4} honeycomb, so
    // the law ran on a genuinely curved substrate, not a flat one in disguise.
    const meshRatio = growthRatio(mesh.shells)
    const flat = buildCoxeterMatrixMesh([4, 3, 4], 4000)
    const flatRatio = growthRatio(flat.shells)
    // the curvature signal is purely comparative, no magic threshold: the {3,4,3,4} mesh grows strictly
    // faster per shell than its flat cubic {4,3,4} sibling. The flat control is the only baseline.
    const curved = meshRatio > flatRatio

    const ranOnCurvedMesh =
      cells > 1000 && globallyConserved && reversible && curved

    const realContinuityExact = realMaxResidual === 0
    const lossyBreaksContinuity =
      lossyMaxResidual > 0 && lossyResidualMatchesErased

    const ok =
      ranOnCurvedMesh && realContinuityExact && lossyBreaksContinuity

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the genuine curved {3,4,3,4} cell graph the reversible charge-conserving knit obeys the discrete continuity law exactly: the change in the charge enclosed in any ball equals the net charge crossing its boundary bonds, residual exactly zero at every region size and every beat over thousands of curved cells, conserving globally and reversing exactly, so the conservation-is-continuity identity holds on the actual hyperbolic substrate and not only on the flat torus',
      metrics: {
        meshCells: cells,
        rank,
        regionsTested: regions.length,
        beats,
        realMaxResidual,
        chargeConserved: globallyConserved ? 1 : 0,
        reversible: reversible ? 1 : 0,
        meshGrowthRatio: meshRatio,
      },
      // CONTROL: the lossy rule breaks continuity on the same curved mesh, the residual equal to the charge
      // it destroys inside each ball, and the flat {4,3,4} mesh grows slower so the substrate is genuinely curved.
      control: {
        lossyMaxResidual,
        lossyResidualMatchesErased: lossyResidualMatchesErased ? 1 : 0,
        flatGrowthRatio: flatRatio,
        meshAboveFlat: curved ? 1 : 0,
      },
      notes:
        'Continuity moved off the flat torus. The coarse-block anchor E-GRV-0039 showed div J = 0 on a periodic flat d4 lattice. Here the same law is verified on the actual generated {3,4,3,4} hyperbolic mesh adjacency (thousands of irregular curved cells with reflective boundary), exactly and at every region size, with the lossy control breaking it by precisely the charge it destroys. Open: a full coarse-grained hydrodynamic limit (viscosity, the Navier-Stokes closure) on the curved mesh is not shown here, only the exact local conservation law.',
    })
  },
})
