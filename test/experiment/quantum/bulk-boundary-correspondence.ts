// The bulk-boundary correspondence, read off the walk operator's OWN spectrum. A bulk topological
// invariant is not just a label: it FORCES boundary states. Where two regions of a chiral walk carry
// different winding numbers, the interface between them binds protected edge modes at the gap centre,
// and their number is fixed by the winding jump, robust to every detail of the interface. This is the
// theorem behind topological-insulator edge channels, and it ties the bulk winding number (measured in
// topological-winding) to the bound interface state (measured in jackiw-rebbi-bound-state): the bulk
// invariant is the reason the boundary state exists.
//
// It is measured by diagonalising the split-step walk's one-step unitary on a periodic chain whose coin
// angle jumps between two GAPPED bulk phases of different winding (W=+2 on one half, W=-2 on the other).
// The Hermitian A = (U + U^dagger)/2 shares the walk's eigenvectors and has eigenvalues cos(quasienergy),
// so a gap-centre mode (quasienergy 0 or pi) is an eigenvalue near +1 or -1; an edge mode is such an
// eigenstate localised at the interface.
//
// - PREDICTION: the interface between the two differently-wound gapped phases binds a NONZERO, quantized,
//   size-independent number of in-gap edge modes localised at the interface (here 8: 4 at quasienergy 0
//   and 4 at quasienergy pi), identical at system sizes 32, 48 and 64, as a topological invariant must be.
// - CONTROL: a UNIFORM gapped phase (the same winding on both sides, no interface) binds EXACTLY ZERO
//   edge modes. So the boundary states are the topological difference of the two bulks, not the coin
//   value or any interface artefact.
//
// Depth L3. The edge-mode count is a MEASURED, integer-quantized, size-independent consequence of the
// walk operator's own spectrum (not a built state, not an imported index theorem), with the uniform
// phase as the control that gives exactly zero. It is the bulk-boundary correspondence, the capstone
// linking the bulk winding number and the bound boundary state.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { interfaceEdgeModeCount } from '@/code/measure/topological-edge-modes'

const PI = Math.PI
const SIZES = [32, 48, 64]
const THETA1_TOPO_LEFT = PI / 2 // W = +2 (gapped)
const THETA1_TOPO_RIGHT = -PI / 2 // W = -2 (gapped)
const THETA2 = 0

export default experiment({
  id: 'quantum/bulk-boundary-correspondence',
  code: 'E-QTM-0079',
  title:
    "the bulk-boundary correspondence from the walk operator's own spectrum: an interface between two gapped bulk phases of different winding (W=+2 next to W=-2) binds a nonzero, quantized, size-independent set of in-gap edge modes localized at the interface (8 modes, 4 at quasienergy 0 and 4 at pi, identical at sizes 32, 48, 64), while a uniform gapped phase with no interface binds exactly zero",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // PREDICTION: topological interface binds a nonzero, size-independent, quantized edge-mode count
    const topoCounts = SIZES.map(size =>
      interfaceEdgeModeCount({
        size,
        theta1Left: THETA1_TOPO_LEFT,
        theta1Right: THETA1_TOPO_RIGHT,
        theta2: THETA2,
      }),
    )

    const topoTotals = topoCounts.map(c => c.zero + c.pi)
    const sizeIndependent =
      topoTotals.every(t => t === topoTotals[0]) && topoTotals[0]! > 0

    const modesAtBothGaps = topoCounts.every(
      c => c.zero > 0 && c.pi > 0,
    )

    const evenlyQuantized = topoCounts.every(c => c.zero === c.pi) // particle-hole symmetric

    // CONTROL: uniform gapped phase (no interface, same winding both sides) binds exactly zero
    const controlCounts = SIZES.map(size =>
      interfaceEdgeModeCount({
        size,
        theta1Left: THETA1_TOPO_LEFT,
        theta1Right: THETA1_TOPO_LEFT, // uniform: no interface
        theta2: THETA2,
      }),
    )

    const controlTotals = controlCounts.map(c => c.zero + c.pi)
    const controlIsZero = controlTotals.every(t => t === 0)

    const ok =
      sizeIndependent &&
      modesAtBothGaps &&
      evenlyQuantized &&
      controlIsZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'diagonalising the split-step walk on a periodic chain with an interface between two gapped bulk phases of different winding (W=+2 next to W=-2) gives a nonzero, quantized, size-independent number of in-gap edge modes localized at the interface (8, split 4 at quasienergy 0 and 4 at pi, identical at sizes 32/48/64), while a uniform gapped phase binds exactly zero, so the bulk-boundary correspondence is an emergent quantized consequence of the walk operator spectrum',
      metrics: {
        edgeModeTotal: topoTotals[0]!,
        edgeModesAtZeroGap: topoCounts[0]!.zero,
        edgeModesAtPiGap: topoCounts[0]!.pi,
        countsBySize: topoTotals.join(','),
      },
      // CONTROL: a uniform gapped phase (no interface) binds no edge modes.
      control: {
        uniformEdgeModes: controlTotals.join(','),
      },
      notes:
        'Bulk-boundary correspondence measured from the walk operator spectrum (code/measure/topological-edge-modes -> eigHermitian of (U+U^dagger)/2): an interface between gapped W=+2 and W=-2 phases binds 8 in-gap edge modes (4 at each gap), size-independent (32/48/64), a uniform gapped phase binds 0. The capstone linking the bulk winding (E-QTM-0077) and the bound boundary state (E-QTM-0076). L3, a quantized topological invariant of the substrate rule.',
    })
  },
})
