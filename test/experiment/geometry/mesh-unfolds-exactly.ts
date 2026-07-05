// The mesh unfolds exactly and deterministically. Register two begins: the equipment is
// fixed (the 24-cell, forced in cell-is-forced), and now the wake GENERATES the whole
// {3,4,3,4} honeycomb from that single cell by reflection across faces. The unfolding is
// not drawn, it is computed: shell zero is one cell, shell one the 24 cells across its 24
// faces, shell two the cells reached from those, and so on. The reflective addressing
// construction realizes this, and the shell counts it returns are integer-exact and
// bit-for-bit reproducible, because the construction is fully deterministic (no
// randomness anywhere). The canonical sequence is 1, 24, 456, 8376, and the per-shell
// growth ratio climbs toward the bulk warp factor near 18.278 (exponential, the
// hyperbolic signature). So the infinite mesh is pinned exactly by the single cell and
// the reflection rule, with no freedom at any shell.
//
// CONTROL: the exponential unfolding must be distinguishable from a flat one. The
// Euclidean 4D lattice (the flat D4 cusp) grows polynomially, its shell ratio settling
// near a small constant rather than climbing to 18, so a flat mesh fails the exponential
// test. And determinism is itself a control against a sampled construction: two
// independent unfoldings to the same depth must return identical counts.
//
// Grade L2: the known hyperbolic honeycomb growth realized on the actual reflective
// construction, with the exact integer shell sequence and the flat lattice as the
// polynomial control. This is the generative face of E-GMT-0003 (which measures the warp
// factor): here the emphasis is that the unfolding is an exact, deterministic, freedom-
// free computation from the single forced cell.

import {
  unfoldMeshShells,
  shellRatios,
  unfoldingIsDeterministic,
  CANONICAL_SHELLS,
} from '@/code/substrate/mesh-unfolding'
import { euclideanL1ShellRatio } from '@/code/measure/shell-growth'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const THROUGH_SHELL = 4
const MAX_CELLS = 170000

export default experiment({
  id: 'geometry/mesh-unfolds-exactly',
  code: 'E-GMT-0027',
  title:
    'the {3,4,3,4} mesh unfolds exactly and deterministically from the single 24-cell by reflection: the shell counts are the integer-exact 1, 24, 456, 8376, 153192, the per-shell ratio descends monotonically (24, 19, 18.37, 18.29) into a tight band around the warp factor 18.278 (exponential), two runs agree bit for bit, and the flat 4D lattice growing polynomially is the control',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // unfold to shell 4 (needs about 162000 cells to close shell 4 exactly, about half a second)
    const counts = unfoldMeshShells({
      throughShell: THROUGH_SHELL,
      maxCells: MAX_CELLS,
    })

    const ratios = shellRatios(counts)

    // 1. the shell counts are the exact canonical integers 1, 24, 456, 8376, 153192
    const exact =
      counts.length >= 5 &&
      CANONICAL_SHELLS.every((c, i) => counts[i] === c)

    // 2. the growth is exponential and the outer ratio sits in a TIGHT band around the warp
    // factor 18.278 (the raw ratios descend 24, 19, 18.37, 18.29 toward it), not a loose >15.
    // The full Aitken extrapolation to 18.278 and the algebraic-degree bound live in E-GMT-0003.
    const outerRatio = ratios[ratios.length - 1] ?? 0
    const exponential = outerRatio > 18.0 && outerRatio < 18.6
    // the ratios descend monotonically toward the limit from above, the convergence signature
    const ratiosDescendTowardLimit = ratios
      .slice(1)
      .every((r, i) => r < ratios[i]!)

    // 3. the unfolding is deterministic: two runs agree bit for bit
    const deterministic = unfoldingIsDeterministic({
      throughShell: THROUGH_SHELL,
      maxCells: MAX_CELLS,
    })

    // 4. the control: the flat 4D lattice grows polynomially, ratio near a small
    // constant, not climbing to 18
    const flatRatio = euclideanL1ShellRatio({ dimension: 4, shell: 12 })
    const flatIsPolynomial = flatRatio < 2

    const solved =
      exact &&
      exponential &&
      ratiosDescendTowardLimit &&
      deterministic &&
      flatIsPolynomial

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'unfolding the {3,4,3,4} honeycomb from a single 24-cell by reflective addressing yields the integer-exact shell counts 1, 24, 456, 8376, with the per-shell growth ratio climbing toward the bulk warp factor near 18.278 (exponential, the hyperbolic signature), and two independent unfoldings to the same depth return bit-identical counts (deterministic, no randomness), while the flat 4D lattice grows polynomially with a shell ratio near a small constant, the control, so the entire mesh is generated exactly and freely-of-choice from the single forced cell and the reflection rule',
      metrics: {
        shell0: counts[0] ?? 0,
        shell1: counts[1] ?? 0,
        shell2: counts[2] ?? 0,
        shell3: counts[3] ?? 0,
        shell4: counts[4] ?? 0,
        outerShellRatio: Number(outerRatio.toFixed(4)),
        ratioDescends: ratiosDescendTowardLimit ? 1 : 0,
        flatLatticeRatio: Number(flatRatio.toFixed(3)),
        deterministic: deterministic ? 1 : 0,
      },
      control: {
        // the flat 4D lattice ratio (polynomial, near a small constant) versus the
        // hyperbolic outer ratio near 18, so the exponential unfolding is a real
        // property of the curved mesh, not of block counting
        flatLatticeRatio: Number(flatRatio.toFixed(3)),
        hyperbolicOuterRatio: Number(outerRatio.toFixed(3)),
      },
      notes:
        'L2, the hyperbolic honeycomb growth on the actual reflective construction, reusing code/substrate/mesh-unfolding (which wraps the {3,4,3,4} addressing). The shell counts are exact integers generated from the single cell, reproducible bit for bit because the base is deterministic. This is the generative companion to E-GMT-0003 (which fits the warp factor and its algebraic degree): the emphasis here is the exact, deterministic, choice-free unfolding from the forced 24-cell. The flat 4D lattice is the polynomial-growth control.',
    })
  },
})
