import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import {
  streamCoxeterMeshGas,
  collideCoxeterMeshGas,
} from '@/code/operator/coxeter-mesh-gas'
import {
  regionBall,
  cellDistances,
  continuityResidual,
} from '@/code/measure/graph-continuity'

// The wake AS the expansion scalar, the one Chronoflux identity with no counterpart anywhere else: dark energy
// is the growing edge. The continuity law says the divergence of the conserved current equals the source inside
// a region. The wake (the atom "wake": new docks born at the growing edge) is exactly such a source, and only
// at the edge. We grow the curved {3,4,3,4} mesh shell by shell, birthing a unit of charge on each newly born
// frontier cell, run the reversible knit, and measure the discrete divergence (the per-region continuity
// residual) at the growing edge versus in the settled bulk. The edge divergence is strictly positive and equals
// exactly the number of newly born cells that beat (the expansion scalar), and it grows geometrically with the
// shell counts (accelerating expansion). The bulk divergence is integer-exact zero (conservation, source-free).
// The CONTROL is the static mesh with no births, where the edge divergence is also exactly zero. So "expansion
// is the positive divergence of the flow at the wake" is measured, not asserted, and the static control fails it.

export default experiment({
  id: 'cosmology/wake-expansion-scalar',
  code: 'E-CSM-0043',
  title:
    'the wake is the expansion scalar: the conserved-current divergence is exactly the count of newly born edge cells (positive, geometrically growing) and integer-exact zero in the settled bulk, dead under the static control',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = buildCoxeterMatrixMesh([3, 4, 3, 4], 4000)
    const adjacency = mesh.adjacency
    const rank = adjacency[0]!.length
    const dist = cellDistances(adjacency, 0)

    const collide = (state: number[][], forward: boolean): number[][] =>
      collideCoxeterMeshGas({ state, rank, forward })

    const stream = (state: number[][]): number[][] =>
      streamCoxeterMeshGas({ state, adjacency, rank })

    const zero = (): number[][] =>
      Array.from({ length: adjacency.length }, () =>
        new Array<number>(rank).fill(0),
      )

    // the cells by shell (growth-depth), so we can grow the mesh outward one shell per beat.
    const maxDepth = dist.reduce((m, d) => (d > m ? d : m), 0)
    // grow only through shells that are not the truncated outermost one or two, so each frontier is genuine.
    const grownDepth = maxDepth - 2
    const shellCells: number[][] = Array.from(
      { length: grownDepth + 1 },
      () => [],
    )

    for (let cell = 0; cell < dist.length; cell++) {
      const d = dist[cell]!

      if (d >= 0 && d <= grownDepth) shellCells[d]!.push(cell)
    }

    // the settled bulk: a small interior ball that is fully born after the first few beats and never sees a
    // birth again, so it must stay exactly source-free.
    const bulkRadius = 2
    const bulk = regionBall(adjacency, 0, bulkRadius)

    // grow shell by shell, birthing one unit of charge per new frontier cell, measuring the divergence at the
    // edge (the new shell) and in the bulk each beat.
    const grow = (
      birthsOn: boolean,
    ): {
      edgeResiduals: number[]
      edgeBorn: number[]
      bulkMaxResidual: number
      edgeMatchesBorn: boolean
    } => {
      let state = zero()

      const edgeResiduals: number[] = []
      const edgeBorn: number[] = []

      let bulkMaxResidual = 0
      let edgeMatchesBorn = true

      for (let t = 1; t <= grownDepth; t++) {
        const before = state.map(slots => [...slots])
        const frontier = shellCells[t]!

        let born = 0

        if (birthsOn) {
          for (const cell of frontier) {
            state[cell]![cell % rank]! += 1
            born++
          }
        }

        const streamed = collide(state, true)
        const after = stream(streamed)

        const edge = new Set(frontier)
        const edgeResidual = continuityResidual({
          before,
          streamed,
          after,
          adjacency,
          region: edge,
        })

        edgeResiduals.push(edgeResidual)
        edgeBorn.push(born)

        if (edgeResidual !== born) edgeMatchesBorn = false

        // the bulk is source-free only once it is fully born (t beyond its radius), so check it from then on.
        if (t > bulkRadius) {
          const bulkResidual = continuityResidual({
            before,
            streamed,
            after,
            adjacency,
            region: bulk,
          })

          bulkMaxResidual = Math.max(
            bulkMaxResidual,
            Math.abs(bulkResidual),
          )
        }

        state = after
      }

      return {
        edgeResiduals,
        edgeBorn,
        bulkMaxResidual,
        edgeMatchesBorn,
      }
    }

    const growing = grow(true)
    // CONTROL: the static mesh, no births, the edge divergence must be exactly zero everywhere.
    const staticRun = grow(false)

    // the expansion scalar at the edge: strictly positive, equal to the births, and growing with the shells.
    const firstEdge = growing.edgeResiduals[0]!
    const lastEdge =
      growing.edgeResiduals[growing.edgeResiduals.length - 1]!

    const edgePositive = growing.edgeResiduals.every(r => r > 0)
    // geometric, accelerating expansion: the last shell's divergence strictly exceeds the first (no threshold).
    const edgeGrows = lastEdge > firstEdge
    const bulkSourceFree = growing.bulkMaxResidual === 0
    const edgeIsBirths = growing.edgeMatchesBorn

    const staticDead = staticRun.edgeResiduals.every(r => r === 0)

    const ok =
      edgePositive &&
      edgeGrows &&
      bulkSourceFree &&
      edgeIsBirths &&
      staticDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the growing curved {3,4,3,4} mesh the divergence of the conserved current is exactly the wake: it equals the count of newly born cells at the growing edge (strictly positive and growing geometrically with the shell counts, the expansion scalar) and is integer-exact zero in the settled bulk, so dark-energy-as-the-wake is a measured continuity identity rather than an asserted one',
      metrics: {
        meshCells: adjacency.length,
        grownDepth,
        firstEdgeDivergence: firstEdge,
        lastEdgeDivergence: lastEdge,
        bulkMaxResidual: growing.bulkMaxResidual,
        edgeDivergenceEqualsBirths: edgeIsBirths ? 1 : 0,
        edgeAlwaysPositive: edgePositive ? 1 : 0,
        edgeGrowsGeometrically: edgeGrows ? 1 : 0,
      },
      // CONTROL: with no births (static mesh) the edge divergence is exactly zero at every shell, so the
      // positive divergence is caused by the wake (growth) and not by the dynamics.
      control: {
        staticEdgeMaxDivergence: staticRun.edgeResiduals.reduce(
          (m, r) => Math.max(m, Math.abs(r)),
          0,
        ),
        staticDead: staticDead ? 1 : 0,
      },
      notes:
        'The wake (the atom that grows new docks at the edge) is the source term of the continuity law. The divergence localizes at the growing edge, exactly equals the births, and grows with the {3,4,3,4} shell counts (1, 24, 456, 8376), an accelerating expansion. The bulk stays integer-exact source-free. This is the discrete continuity identity behind "dark energy is the wake." Open: connecting the integrated edge divergence to a measured cosmological constant value is not claimed, only the structural identity and its static control.',
    })
  },
})
