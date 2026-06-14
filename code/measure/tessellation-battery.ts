// The single reusable battery that runs against ANY regular hyperbolic tessellation, given its Schläfli
// symbol. It builds the Coxeter reflection-group mesh (uniform across all dimensions and classes) and
// measures the substrate properties that matter for the vibe program: how curved it is (the shell growth
// ratio and the Gram signature), whether it is crystallographic (a gauge hook), whether it carries the
// 24-cell / D4 spinor directions (a spinor hook), and optionally whether a Kahler-Dirac fermion propagates
// on it. One function, every tessellation, so the whole catalog is measured identically and comparably.

import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { gramSignature, symbolContainsSubdiagram } from '@/code/substrate/coxeter/gram-signature'
import { kahlerDiracReturn } from '@/code/measure/fermion-propagation'
import { bfsShells, geometricGrowthRatio } from '@/code/measure/shells'
import { makeAssociativeMemory, ternaryWord, storeWord } from '@/code/operator/associative-memory'
import { exactRecallRate, coverageRadius } from '@/code/measure/associative-recall'

// The fixed word width every tessellation's associative memory uses, so the recall column is comparable
// across the catalog. 21 ternary slots hold the full 32-bit decorrelating hash without collision.
const ASSOCIATIVE_WORD_BITS = 21

export interface TessellationMeasurement {
  buildable: boolean
  cells: number
  rank: number // the Coxeter rank, the number of reflection generators (= the mesh degree)
  growthRatio: number // shell-to-shell growth, the measured curvature signature (> 1 is hyperbolic)
  hyperbolic: boolean // the Gram signature is Lorentzian (one negative eigenvalue)
  crystallographic: boolean // every Schläfli entry is 3, 4, or 6 (the crystallographic restriction)
  spinorHook: boolean // contains the [3,4,3] (24-cell / F4 / D4) subdiagram, the spinor sectors
  cleanReturn?: number // the quantum return probability of the clean Kahler-Dirac fermion
  localizedReturn?: number // the same under a strong deterministic disorder (the localization control)
  fermionPropagates?: boolean // the clean fermion is in the extended phase and disorder localizes it
  associativeExactRecall: number // exact-recall rate of a one-word-per-cell content memory, 1.0 when perfect
  associativeGrowthRatio: number // geometric shell-growth from cell 0, the associative capacity per radius
  associativeCoverageRadius: number // max graph distance from cell 0, the broadcast search latency
}

export function measureTessellation(input: {
  schlafli: number[]
  maxCells?: number
  withPropagation?: boolean
}): TessellationMeasurement {
  const { schlafli } = input
  if (schlafli.length === 0) {
    // star (fractional) or apeirogonal (infinity) regulars, cataloged but not buildable by the integer engine
    return {
      buildable: false,
      cells: 0,
      rank: 0,
      growthRatio: 0,
      hyperbolic: false,
      crystallographic: false,
      spinorHook: false,
      associativeExactRecall: 0,
      associativeGrowthRatio: 0,
      associativeCoverageRadius: 0,
    }
  }

  const mesh = buildCoxeterMatrixMesh(schlafli, input.maxCells ?? 2000)
  const cells = mesh.adjacency.length
  const rank = schlafli.length + 1
  const shells = mesh.shells
  const growthRatio = shells.length < 4 ? 1 : shells[shells.length - 2]! / shells[shells.length - 3]!
  const signature = gramSignature(schlafli)
  const hyperbolic = signature.negative === 1 && signature.zero === 0
  const crystallographic = schlafli.every((n) => n === 3 || n === 4 || n === 6)
  const spinorHook = symbolContainsSubdiagram(schlafli, [3, 4, 3])

  // The associative-memory column, the same on every tessellation. Store a distinct ternary word on every
  // cell, then measure: exact recall (the engine is tessellation-agnostic, this is 1.0 everywhere), the
  // shell-growth from cell 0 (capacity reachable per search radius), and the coverage radius (search latency).
  const memory = makeAssociativeMemory({ neighbors: mesh.adjacency, wordBits: ASSOCIATIVE_WORD_BITS })
  for (let cell = 0; cell < cells; cell++) storeWord(memory, cell, ternaryWord(cell, ASSOCIATIVE_WORD_BITS))
  const associativeExactRecall = exactRecallRate(memory)
  const associativeShells = bfsShells({ neighbors: mesh.adjacency, root: 0 }).shellCounts
  const associativeGrowthRatio = geometricGrowthRatio(associativeShells)
  const associativeCoverageRadius = coverageRadius({ neighbors: mesh.adjacency, seed: 0 })

  const measurement: TessellationMeasurement = {
    buildable: true,
    cells,
    rank,
    growthRatio,
    hyperbolic,
    crystallographic,
    spinorHook,
    associativeExactRecall,
    associativeGrowthRatio,
    associativeCoverageRadius,
  }

  if (input.withPropagation) {
    const propagation = kahlerDiracReturn({ neighbors: mesh.adjacency })
    measurement.cleanReturn = propagation.clean
    measurement.localizedReturn = propagation.localized
    measurement.fermionPropagates =
      propagation.clean < 0.2 &&
      propagation.localized > 2 * propagation.clean &&
      propagation.normDrift < 0.05
  }

  return measurement
}
