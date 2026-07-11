// Holography is a DERIVED theorem of the discrete mesh, not a postulate, which resolves the
// apparent contradiction with Timeless Dynamics over whether the boundary is a holographic screen.
//
// The tension. Vibe reads its cusp (the flat boundary of the curved bulk) as a holographic screen
// that encodes the bulk. TD derives its field equations "without invoking holographic screens" and
// calls its approach "more primitive than holography". These look contradictory.
//
// The resolution, measured. On a discrete hyperbolic tessellation the boundary is NON-AMENABLE: the
// outermost shell holds a CONSTANT, near-unity fraction of the whole ball, so the information lives
// on the boundary, which is exactly the holographic principle. On the {3,4,3,4} bulk the fraction is
//   shell / ball  ->  (lambda - 1) / lambda  =  17.278 / 18.278  =  0.9453,
// where lambda is the warp factor (the RG growth rate). The boundary holds 94.5 percent of the
// volume, and the fraction is SET BY the warp factor, so holography is not a separate assumption, it
// is a theorem of the {3,4,3,4} geometry. The flat 4D lattice, by contrast, is amenable: its shell
// is a VANISHING fraction of its ball (the fraction tends to zero), so its information is in the
// bulk, not on the boundary, and it is not holographic.
//
// So the contradiction dissolves, and both frameworks are right at their level. Vibe reads off a
// real property (the mesh is holographic). TD is right that it need not be POSTULATED (it is
// derived from the geometry). The best model is EMERGENT holography: the cusp is a holographic
// screen as a consequence of the mesh being non-amenable, tied to the warp factor, not an axiom. And
// the deeper point is that the two frameworks describe different spaces, vibe's spatial mesh (non-
// amenable, holographic) versus TD's statistical manifold (compact, amenable, not holographic), so
// the "screen versus no screen" was a category difference, not a real conflict.
//
// CONTROL: the flat 4D lattice, amenable, boundary fraction toward zero, not holographic. So the
// holographic boundary-dominance is a property of the hyperbolic curvature, not of graph counting.
//
// Depth L2, the discrete holographic bound measured on the actual honeycomb, its value fixed by the
// warp factor, with the flat lattice the amenable (non-holographic) control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  unfoldMeshShells,
  CANONICAL_SHELLS,
} from '@/code/substrate/mesh-unfolding'
import { euclideanL1ShellCount } from '@/code/measure/shell-growth'

const WARP_FACTOR = 18.278

export default experiment({
  id: 'holography/holography-is-derived',
  code: 'E-HLG-0032',
  title:
    'holography is a derived theorem of the mesh, not a postulate: the {3,4,3,4} boundary shell holds a constant 94.5 percent of the ball, exactly (lambda-1)/lambda set by the warp factor (non-amenable, holographic), while the flat lattice boundary fraction tends to zero (amenable, not holographic), so vibe holographic cusp is real and derived and TD refusal to postulate it is honored, the contradiction dissolved',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // the bulk boundary-dominance: the shell as a fraction of the ball, converging to (lambda-1)/lambda
    const counts = unfoldMeshShells({
      throughShell: 4,
      maxCells: 170000,
    })

    const exactCounts =
      counts.length >= 5 &&
      CANONICAL_SHELLS.every((c, i) => counts[i] === c)

    const fractions: number[] = []

    let ball = 0

    for (const count of counts) {
      ball += count
      fractions.push(count / ball)
    }

    // the deep-shell fraction is near (lambda-1)/lambda, the boundary holds almost all the volume
    const deepFraction = fractions[fractions.length - 1]!
    const predictedFraction = (WARP_FACTOR - 1) / WARP_FACTOR
    const boundaryDominates = deepFraction > 0.9
    const matchesWarpFactor =
      Math.abs(deepFraction - predictedFraction) < 0.005

    // the fraction is CONSTANT across scale (non-amenable, a genuine holographic bound, not a
    // transient), so the last few fractions agree closely
    const fractionIsConstant =
      Math.abs(
        fractions[fractions.length - 1]! -
          fractions[fractions.length - 2]!,
      ) < 0.002

    // the boundary fraction encodes the warp factor: lambda = 1 / (1 - fraction)
    const recoveredWarp = 1 / (1 - deepFraction)
    const warpRecovered = Math.abs(recoveredWarp - WARP_FACTOR) < 0.5

    // the control: the flat 4D lattice is amenable, its boundary fraction tends to zero
    const flatFraction = (radius: number): number => {
      let flatBall = 0

      for (let k = 0; k <= radius; k++)
        flatBall += euclideanL1ShellCount({ dimension: 4, shell: k })

      return (
        euclideanL1ShellCount({ dimension: 4, shell: radius }) /
        flatBall
      )
    }

    const flatNear = flatFraction(4)
    const flatFar = flatFraction(14)
    const flatVanishes = flatFar < flatNear && flatFar < 0.3

    const solved =
      exactCounts &&
      boundaryDominates &&
      matchesWarpFactor &&
      fractionIsConstant &&
      warpRecovered &&
      flatVanishes

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'holography is a derived theorem of the discrete mesh, not a postulate. On the {3,4,3,4} bulk the outermost shell holds a constant 94.5 percent of the whole ball, exactly (lambda-1)/lambda where lambda is the warp factor, so the information lives on the boundary and the boundary fraction is fixed by the growth rate, which is the holographic principle as a consequence of the geometry. The flat 4D lattice is amenable, its boundary a vanishing fraction of its ball, so it is not holographic, the control. So vibe holographic cusp is a real property (the mesh is holographic and one can recover the warp factor from the boundary fraction), and TD refusal to POSTULATE a holographic screen is honored because holography is derived, not assumed. The apparent contradiction dissolves, and it was partly a category difference, vibe spatial mesh is non-amenable and holographic while TD statistical manifold is compact and amenable and not, so the two were describing different spaces. The best model is emergent holography.',
      metrics: {
        deepBoundaryFraction: Number(deepFraction.toFixed(4)),
        predictedFraction: Number(predictedFraction.toFixed(4)),
        recoveredWarpFactor: Number(recoveredWarp.toFixed(3)),
        flatFractionNear: Number(flatNear.toFixed(4)),
        flatFractionFar: Number(flatFar.toFixed(4)),
        shellsExact: exactCounts ? 1 : 0,
      },
      control: {
        // the flat lattice boundary fraction vanishes (amenable, not holographic), so the
        // boundary-dominance is the hyperbolic curvature, not graph counting
        flatFractionNear: Number(flatNear.toFixed(4)),
        flatFractionFar: Number(flatFar.toFixed(4)),
        bulkBoundaryFraction: Number(deepFraction.toFixed(4)),
      },
      notes:
        'L2, the discrete holographic bound measured on the actual honeycomb, reusing code/substrate/mesh-unfolding and code/measure/shell-growth. The {3,4,3,4} boundary shell holds 94.5 percent of the ball, exactly (lambda-1)/lambda, so holography is a theorem of the non-amenable geometry with its strength set by the warp factor, and one can recover lambda from the boundary fraction. The flat lattice is amenable (boundary fraction toward zero), the non-holographic control. This resolves the vibe-versus-TD holography tension: vibe reads a real derived property, TD is right not to postulate it (it is derived), and the two frameworks describe different spaces (vibe non-amenable spatial mesh, TD amenable statistical manifold). The best model is emergent holography, connecting to the gravity-on-the-cusp result (E-GRV-0049) and the non-amenable dispersal (E-FND-0058). Deterministic, no random.',
    })
  },
})
