// The reversible discrete dynamics conserves the topological charge only at SMALL steps (fine resolution), and goes
// CHAOTIC at large (coarse) steps. This is the dynamics half of the discrete encoding, and it is the same
// coarse-versus-fine trilemma seen everywhere. The winding (selves/topological-winding-identity) conserved its
// charge because the clock's steps are small (a smooth field). A reversible spin/quaternion dynamics conserves the
// Skyrmion charge the same way, IF the step (the per-beat rotation) is small. Large steps (the coarse quaternion-
// group products, rotations of 60 to 120 degrees) are too violent and the charge is not conserved.
//
// Measured, a DM-stabilized Skyrmion under reversible precession, at a SMALL step the degree stays minus one (the
// dynamics holds the soliton, reversibly), at a LARGE step the degree blows up (chaos). So the fully discrete
// reversible dynamics needs SMALL steps, which means a FINE direction group (small rotations, the 600-cell or
// finer) or coarse-graining (emergent fineness), not the coarse 24-cell rotations alone.
//
// Depth L2, the reversible discrete dynamics conserves the charge at small steps and is chaotic at large steps.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeSkyrmionField,
  relaxSpins,
  precessSpins,
  skyrmionDegree,
  type Spin,
  type SkyrmionParams,
} from '@/code/dynamics/skyrmion-field'

export default experiment({
  id: 'selves/reversible-dynamics-step-threshold',
  title:
    'reversible discrete dynamics conserves the Skyrmion charge at small steps, chaotic at large (coarse) steps',
  category: 'selves',
  substrates: ['spin-field'],
  depth: 'L2',
  paper: true,
  run() {
    const params: SkyrmionParams = {
      size: 44,
      exchange: 1,
      dm: 0.6,
      field: 0.15,
    }
    const steps = 500

    // relax to the DM-stabilized Skyrmion.
    let base: Spin[] = makeSkyrmionField({
      size: params.size,
      coreRadius: 5,
    })
    for (let t = 0; t < 2000; t++) {
      base = relaxSpins({ spins: base, params, rate: 0.08 })
    }

    const startQ = skyrmionDegree(base, params.size)

    const chargeRange = (dt: number): { min: number; max: number } => {
      let s = base.map(v => [...v] as Spin)
      let min = startQ,
        max = startQ
      for (let t = 0; t < steps; t++) {
        s = precessSpins({ spins: s, params, dt, open: false })
        const q = skyrmionDegree(s, params.size)
        if (q < min) {
          min = q
        }

        if (q > max) {
          max = q
        }
      }

      return { min, max }
    }

    const small = chargeRange(0.008) // small step, fine resolution
    const large = chargeRange(0.06) // large step, the coarse-rotation regime

    // small step conserves the charge (stays near minus one), large step does NOT (it blows up).
    const smallConserves =
      Math.abs(small.min + 1) < 0.1 && Math.abs(small.max + 1) < 0.1
    const largeChaotic =
      Math.abs(large.min + 1) > 1 || Math.abs(large.max + 1) > 1
    const ok = smallConserves && largeChaotic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible discrete dynamics conserves the topological charge only at SMALL steps, a DM-stabilized Skyrmion under reversible precession keeps its degree at minus one at a small step (the dynamics holds the soliton reversibly) but the degree blows up at a large step (chaos), so the fully discrete reversible dynamics needs small per-beat rotations, which means a fine direction group (small rotations) or coarse-graining (emergent fineness), not the coarse 24-cell rotations alone, the same coarse-versus-fine trilemma that the winding avoided by having small clock steps',
      metrics: {
        startDegreeTimes100: Math.round(startQ * 100),
        smallStepMinTimes100: Math.round(small.min * 100),
        smallStepMaxTimes100: Math.round(small.max * 100),
        largeStepMinTimes100: Math.round(large.min * 100),
        largeStepMaxTimes100: Math.round(large.max * 100),
        smallConserves: smallConserves ? 1 : 0,
        largeChaotic: largeChaotic ? 1 : 0,
        steps,
      },
      control: {
        smallStepMaxTimes100: Math.round(small.max * 100),
        largeStepMaxTimes100: Math.round(large.max * 100),
      },
      notes:
        'the dynamics-chip result. Reversible discrete dynamics holds the soliton charge at small steps (fine resolution) and is chaotic at large (coarse) steps. So a fully discrete stable reversible self needs a FINE direction group (small rotations, the 600-cell or finer) or coarse-graining, the coarse 24-cell rotations alone are too large-stepped. Consistent with the two-layer picture, the stable self is emergent (fine), not at the coarse base',
    })
  },
})
