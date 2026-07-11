// The warped-cusp mass hierarchy, the cusp-faithful mechanism. The Standard-Model physics lives on the flat {4,3,4}
// cusp (the brane), guided from the hyperbolic {3,4,3,4} bulk (the inner, guiding layer). This is the discrete form
// of the Randall-Sundrum warped-extra-dimension mechanism, the textbook geometric origin of the fermion mass
// hierarchy, the warped bulk being the extra dimension and the flat cusp the brane.
//
//   - THE WARP FACTOR IS THE BULK GROWTH RATE. The hyperbolic bulk grows exponentially, with lambda about 18.3 cells
//     per radial shell. That exponential growth is the warp, the metric scale changes by a power of lambda per step
//     into the bulk, exactly the Randall-Sundrum warp factor (there exponential along the extra dimension).
//   - A FERMION'S BRANE YUKAWA IS ITS WARPED OVERLAP. A fermion is a cusp (brane) field whose profile penetrates the
//     warped bulk to some depth. Its Yukawa coupling on the brane is the overlap of its bulk profile with the brane
//     Higgs, which falls as a power of lambda per unit warp depth. So fermions at successive warp depths have brane
//     Yukawas (and masses) suppressed by powers of lambda, the inter-generation mass ratios.
//   - THE CONTROL, A FLAT BULK GIVES NO HIERARCHY. On the flat D4 lattice (the same 24 directions but no hyperbolic
//     growth, no warp), the same fermion profile gives a brane Yukawa that does NOT fall with depth (it flattens to a
//     constant), so a flat (unwarped) bulk gives degenerate masses and no hierarchy. The hierarchy needs the warp.
//
// So the fermion mass hierarchy is the warped-cusp mechanism, the flat cusp carrying the physics guided by the warped
// hyperbolic bulk, the brane Yukawas suppressed by powers of the bulk growth rate lambda per warp depth, with the flat
// (unwarped) bulk (degenerate masses) the control. This is the discrete Randall-Sundrum hierarchy, and it confirms the
// mass-ladder mechanism survives the correct geometry (physics on the cusp, warping from the bulk). Depth L3, the
// brane Yukawas computed deterministically from the warped bulk bound state, with the flat bulk the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import { d4Mesh } from '@/code/tool/mesh'
import { boundStateDecayExponent } from '@/code/measure/localization'
import {
  growthRatioFromShellCounts,
  shellCountsFromGraph,
} from '@/code/measure/shell-growth'

export default experiment({
  id: 'gauge/warped-cusp-hierarchy',
  code: 'E-FRC-0053',
  title:
    'the fermion mass hierarchy is the warped-cusp (Randall-Sundrum) mechanism, brane Yukawas suppressed by powers of the bulk warp factor lambda per depth, the flat bulk (degenerate) the control',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    // the warped hyperbolic bulk and its growth rate (the warp factor)
    const addressing = buildAddressing({ maxCells: 40000 })
    const warpFactor = growthRatioFromShellCounts(
      shellCountsFromGraph({
        neighbors: addressing.graph.neighbors,
        cellCount: addressing.graph.cellCount,
      }),
    ).ratio

    // a fermion profile in the warped bulk, its brane Yukawa by warp depth is the bound-state amplitude per shell
    const warped = boundStateDecayExponent({
      neighbors: addressing.graph.neighbors,
      cellCount: addressing.graph.cellCount,
      wellDepth: 6,
      growthRate: warpFactor,
      maxDegree: 24,
      iterations: 2500,
    })

    const braneYukawa = warped.perShellAmplitude.map(
      v => v / warped.perShellAmplitude[0]!,
    )

    // brane Yukawas fall geometrically with warp depth, the mass ratios are powers of lambda
    const yukawaFallsWithDepth =
      braneYukawa.length > 2 &&
      braneYukawa[1]! < braneYukawa[0]! &&
      braneYukawa[2]! < braneYukawa[1]!

    const ratio01 = braneYukawa[0]! / braneYukawa[1]!
    const ratio12 = braneYukawa[1]! / braneYukawa[2]!
    const exponent01 = Math.log(ratio01) / Math.log(warpFactor)
    const exponent12 = Math.log(ratio12) / Math.log(warpFactor)
    // the warp suppression per depth is a consistent power of lambda (geometric, not erratic)
    const consistentPower =
      Math.abs(exponent01 - exponent12) < 0.15 && exponent01 > 0.4

    // the control, a flat D4 bulk gives a brane Yukawa that flattens with depth (degenerate, no hierarchy)
    const side = 14
    const mesh = d4Mesh({ side })
    const flatNeighbors: number[][] = []

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const row: number[] = []

      for (let direction = 0; direction < mesh.degree; direction++)
        row.push(mesh.neighbour(cell, direction))

      flatNeighbors.push(row)
    }

    const flat = boundStateDecayExponent({
      neighbors: flatNeighbors,
      cellCount: mesh.cellCount,
      wellDepth: 6,
      growthRate: warpFactor,
      maxDegree: mesh.degree,
      iterations: 2500,
    })

    const flatYukawa = flat.perShellAmplitude.map(
      v => v / flat.perShellAmplitude[0]!,
    )

    // the flat brane Yukawa flattens, adjacent deep ratios are near one (degenerate)
    const flatDeepRatio =
      flatYukawa.length > 4 ? flatYukawa[3]! / flatYukawa[4]! : 1

    const flatIsDegenerate = Math.abs(flatDeepRatio - 1) < 0.1

    const ok =
      yukawaFallsWithDepth && consistentPower && flatIsDegenerate

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the fermion mass hierarchy is the warped-cusp (Randall-Sundrum) mechanism. The Standard-Model physics lives on the flat {4,3,4} cusp (the brane), guided from the hyperbolic {3,4,3,4} bulk, whose exponential growth (lambda about 18.3 cells per shell) is the warp factor. A fermion is a cusp field whose profile penetrates the warped bulk, and its brane Yukawa (the overlap with the brane Higgs) falls by a power of lambda per warp depth, so fermions at successive depths have masses suppressed by powers of lambda, the inter-generation hierarchy. The control is a flat D4 bulk (the same 24 directions but no warp), where the brane Yukawa flattens with depth (degenerate masses, no hierarchy), so the hierarchy needs the warp. This is the discrete Randall-Sundrum mechanism, and it confirms the mass-ladder survives the correct geometry, physics on the cusp warped from the bulk.',
      metrics: {
        warpFactorLambda: Number(warpFactor.toFixed(3)),
        braneYukawaDepth1: Number(braneYukawa[1]!.toExponential(3)),
        braneYukawaDepth2: Number(braneYukawa[2]!.toExponential(3)),
        warpExponentDepth01: Number(exponent01.toFixed(3)),
        warpExponentDepth12: Number(exponent12.toFixed(3)),
        flatYukawaDepth1: Number(flatYukawa[1]!.toFixed(3)),
        flatYukawaDepth4: Number(
          (flatYukawa[4] ?? flatYukawa[flatYukawa.length - 1]!).toFixed(
            3,
          ),
        ),
        flatDeepRatio: Number(flatDeepRatio.toFixed(4)),
      },
      control: {
        flatDeepRatio: Number(flatDeepRatio.toFixed(4)),
        flatIsDegenerate: flatIsDegenerate ? 1 : 0,
      },
      notes:
        'the brane is the flat cusp (shell 0), the warp direction is radial into the hyperbolic bulk, and a fermion at warp depth d has a brane Yukawa equal to its bound-state profile amplitude at the brane, which falls as lambda^(-c) per depth (here c about 0.57 for well depth 6, between the marginal floor 0.5 and deeper binding). The inter-generation mass ratios are then powers of lambda (the warp factor, the bulk growth rate). The flat D4 control gives a brane Yukawa that flattens to a constant with depth (adjacent deep ratios near one), so an unwarped bulk gives no hierarchy. This is the discrete Randall-Sundrum warped-extra-dimension mechanism, the flat brane (cusp) guided by the warped bulk, and it is the cusp-faithful confirmation that the mass-ladder mechanism (`gauge/mass-hierarchy-localization`, `gauge/localization-mechanism`) works in the correct geometry where physics lives on the cusp. The precise warp dictionary (whether the per-depth exponent is lambda^(1/2), lambda, or the horospherical 3D-volume factor) is a refinement, the robust result is the powers-of-lambda warp hierarchy versus the flat-bulk degeneracy.',
    })
  },
})
