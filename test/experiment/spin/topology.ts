// P4 validation: spin from topology.
// The zero modes of the Kahler-Dirac operator D = d + delta are the harmonic
// forms, whose count is the sum of the surface's Betti numbers (b0 + b1 + b2).
// So the zero-mode count is a topological invariant, not a metric accident. We
// build a disk, a cylinder, and a torus and check the count matches the
// prediction: 1, 2, 4. If it does, spin (as a Dirac zero mode) is topological,
// the Bombelli / Friedman-Sorkin reading and the monist-spinor route.
// Run: npx tsx code/experiment/p4-topology.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { triangulatedSurface } from '@/code/substrate/triangulated-surface'
import {
  cellComplexOf,
  kahlerDiracZeroModes,
} from '@/code/operator/dirac'

function zeroModeCount(input: {
  width: number
  height: number
  wrapWidth: boolean
  wrapHeight: boolean
}): { zeroModes: number; smallest: number[]; cells: string } {
  const surface = triangulatedSurface(input)
  const complex = cellComplexOf({ substrate: surface, maxGrade: 2 })
  // The zero eigenvalue is degenerate (multiplicity = Betti sum), so the Krylov
  // dimension must be well above that multiplicity to resolve every copy.
  const totalCells = complex.cellCount.reduce((s, n) => s + n, 0)
  const result = kahlerDiracZeroModes({
    complex,
    count: 12,
    threshold: 5e-4,
    steps: Math.min(totalCells, 220),
  })

  return {
    zeroModes: result.zeroModes,
    smallest: result.smallestMagnitudes
      .slice(0, 6)
      .map(x => Math.round(x * 1000) / 1000),
    cells: complex.cellCount.join(','),
  }
}

export default experiment({
  id: 'spin/topology',
  code: 'E-SPN-0040',
  title:
    'the Kahler-Dirac zero-mode count matches the Betti sum across disk, cylinder, and torus',
  category: 'spin',
  substrates: ['any'],
  depth: 'L2',
  paper: true,
  run() {
    const disk = zeroModeCount({
      width: 9,
      height: 9,
      wrapWidth: false,
      wrapHeight: false,
    })

    const cylinder = zeroModeCount({
      width: 9,
      height: 9,
      wrapWidth: true,
      wrapHeight: false,
    })

    const torus = zeroModeCount({
      width: 9,
      height: 9,
      wrapWidth: true,
      wrapHeight: true,
    })

    // predicted Betti sums b0 + b1 + b2: disk 1, cylinder 2, torus 4.
    const diskOk = disk.zeroModes === 1
    const cylinderOk = cylinder.zeroModes === 2
    const torusOk = torus.zeroModes === 4
    const ok = diskOk && cylinderOk && torusOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the number of near-zero modes of the Kahler-Dirac operator equals the sum of the surface Betti numbers, one on a disk, two on a cylinder, four on a torus, so the zero-mode count is a topological invariant rather than a metric accident',
      metrics: {
        diskZeroModes: disk.zeroModes,
        cylinderZeroModes: cylinder.zeroModes,
        torusZeroModes: torus.zeroModes,
      },
      control: {
        // the three topologies are controls for one another: the same operator and
        // mesh size give different counts only because the topology (the wrapping)
        // differs, so a metric artifact is ruled out.
        cylinderZeroModes: cylinder.zeroModes,
        torusZeroModes: torus.zeroModes,
      },
      notes:
        'L2, known math (Hodge theory, the Kahler-Dirac zero modes equal the harmonic forms, counted by the Betti numbers). The disk, cylinder and torus are genuine controls, the count tracks the topology not the metric. This is an established theorem reproduced on the triangulated surfaces, not a novel emergence, so it is L2, not L3.',
    })
  },
})
