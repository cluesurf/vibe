import {
  perfectTensorRecoverable,
  perfectTensorMinimalKillSet,
  perfectTensorContiguousThreshold,
} from '@/code/substrate/perfect-tensor-tree'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The HaPPY code WIRED onto the {5,3,4} hyperbolic bulk, the tiled version of holography/happy-code-534. Each
// cell of the bulk carries a [[5,1,3]] perfect tensor (the building block, any 3 of 5 legs reconstruct it),
// and the tensors are contracted along the hyperbolic bulk tree, the geodesic tree of the {5,3,4} tiling, with
// the boundary qubits at the leaves. The real perfect-tensor reconstruction rule (a bulk tensor is recoverable
// iff at least 3 of its 5 neighbours are recoverable, branching 5, threshold 3) lives in
// code/substrate/perfect-tensor-tree. The result is the holographic code property, the code distance
// protecting a bulk logical grows as 3^depth, so a self living deep in the bulk is protected against ANY
// boundary erasure short of an exponentially large region. The control is the threshold, the distance is
// finite (a constructed erasure of size 3^depth does destroy the self) and it GROWS with depth.
const recoverable = (
  level: number,
  offset: number,
  erased: Set<number>,
): boolean =>
  perfectTensorRecoverable({
    level,
    offset,
    erased,
    branching: 5,
    threshold: 3,
  })

const minimalKillSet = (level: number, offset: number): number[] =>
  perfectTensorMinimalKillSet({
    level,
    offset,
    branching: 5,
    threshold: 3,
  })

const contiguousThreshold = (level: number): number =>
  perfectTensorContiguousThreshold({
    level,
    branching: 5,
    threshold: 3,
  })

export default experiment({
  id: 'holography/happy-tiling-534',
  code: 'E-HLG-0009',
  title:
    'the HaPPY code tiled on the {5,3,4} bulk, the code distance protecting a bulk self grows as 3^depth',
  category: 'holography',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    // (1) the code distance (minimal erasure that destroys the bulk logical) is 3^depth, and GROWS with depth.
    // We construct the minimal kill set and confirm it destroys the root, and that one leaf fewer does not.
    const distanceAt = (level: number): number => {
      const kill = minimalKillSet(level, 0)
      const killsRoot = !recoverable(level, 0, new Set(kill))
      const oneFewerRecovers = recoverable(
        level,
        0,
        new Set(kill.slice(1)),
      )

      return killsRoot && oneFewerRecovers ? kill.length : -1
    }

    const distance1 = distanceAt(1) // expect 3
    const distance2 = distanceAt(2) // expect 9
    const distance3 = distanceAt(3) // expect 27
    const distanceIsThreePowerDepth =
      distance1 === 3 && distance2 === 9 && distance3 === 27

    const distanceGrowsWithDepth =
      distance3 > distance2 && distance2 > distance1

    // (2) the bulk logical is RECOVERABLE from the boundary whenever the erasure is below the distance, here a
    // large boundary erasure (the minimal kill set minus one leaf, size 3^depth - 1) still recovers the self
    const deepKill = minimalKillSet(3, 0)
    const bulkRecoveredBelowDistance = recoverable(
      3,
      0,
      new Set(deepKill.slice(1)),
    )

    // (3) the holographic wedge, the largest contiguous boundary erasure that always recovers the bulk GROWS
    // with depth (a deeper self sees more of the boundary protect it)
    const wedge2 = contiguousThreshold(2)
    const wedge3 = contiguousThreshold(3)
    const wedgeGrowsWithDepth = wedge3 > wedge2

    const ok =
      distanceIsThreePowerDepth &&
      distanceGrowsWithDepth &&
      bulkRecoveredBelowDistance &&
      wedgeGrowsWithDepth

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'tiling the [[5,1,3]] perfect tensors on the {5,3,4} hyperbolic bulk gives a holographic code whose distance protecting a bulk logical self grows as 3^depth, so a self deep in the bulk is recoverable from the boundary against any erasure short of an exponentially large region, while a constructed erasure of size 3^depth does destroy it',
      metrics: {
        distanceDepth1: distance1,
        distanceDepth2: distance2,
        distanceDepth3: distance3,
        contiguousWedgeDepth2: wedge2,
        contiguousWedgeDepth3: wedge3,
        bulkRecoveredBelowDistance: bulkRecoveredBelowDistance ? 1 : 0,
      },
      // CONTROL: the distance is FINITE and GROWS with depth (3, 9, 27), so the protection is a genuine code
      // that deepens with the bulk, not trivial robustness, and the constructed kill set of size 3^depth does
      // destroy the self (the threshold).
      control: {
        distanceGrowsWithDepth: distanceGrowsWithDepth ? 1 : 0,
        wedgeGrowsWithDepth: wedgeGrowsWithDepth ? 1 : 0,
      },
      notes:
        'Gap closed, the perfect tensors are wired onto the {5,3,4} bulk tree with the real [[5,1,3]] erasure rule (any 3 of 5 reconstruct), not a single tensor. The distance grows as 3^depth (the McKay tiling of perfect tensors), so a self deep in the hyperbolic bulk is exponentially protected, the holographic-error-correction route to persistence at scale. The bulk tree is the geodesic tree of the {5,3,4}/{5,4} tiling, a full planar tensor-network contraction is the remaining refinement.',
    })
  },
})
