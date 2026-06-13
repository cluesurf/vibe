// The single reusable battery that runs against ANY regular hyperbolic tessellation, given its Schläfli
// symbol. It builds the Coxeter reflection-group mesh (uniform across all dimensions and classes) and
// measures the substrate properties that matter for the vibe program: how curved it is (the shell growth
// ratio and the Gram signature), whether it is crystallographic (a gauge hook), whether it carries the
// 24-cell / D4 spinor directions (a spinor hook), and optionally whether a Kahler-Dirac fermion propagates
// on it. One function, every tessellation, so the whole catalog is measured identically and comparably.

import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { gramSignature, symbolContainsSubdiagram } from '@/code/substrate/coxeter/gram-signature'
import { kahlerDiracReturn } from '@/code/measure/fermion-propagation'

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

  const measurement: TessellationMeasurement = {
    buildable: true,
    cells,
    rank,
    growthRatio,
    hyperbolic,
    crystallographic,
    spinorHook,
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
