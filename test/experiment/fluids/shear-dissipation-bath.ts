// FD1 / FD3, the start of fluid dynamics on the committed knit. The knit is a lattice gas (collide then stream),
// so a sheared momentum profile is the natural object. The question, does the momentum-conserving knit relax a
// shear (viscous momentum diffusion), and where does the dissipation come from. The deterministic finding, the
// reversible bulk does NOT viscously relax a shear, the shear mode RECURS on the closed torus (Poincare
// recurrence, no net decay), while on the open mesh (the bath, the gradient-axis boundary absorbing) the shear
// DISSIPATES (it decays and does not return). So viscous momentum diffusion is bath-driven, the same arrow-from-
// the-wake principle that governs all dissipation in the model, not a property of the reversible bulk. A clean
// viscosity COEFFICIENT is not extractable here (the open decay plateaus), that needs a larger system and the
// coarse-grained hydrodynamic limit, the named open extension (the full FD1 with a measured viscosity).
//
// Deterministic throughout, the shear is a fixed sinusoidal function of the cell coordinate, no random anywhere,
// robustness comes from the open-versus-closed contrast, not from seeds.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import {
  shearSetup,
  shearAmplitudeSeries,
} from '@/code/measure/hydrodynamics'

export default experiment({
  id: 'fluids/shear-dissipation-bath',
  title:
    'a shear recurs on the reversible bulk but dissipates on the open mesh, so viscosity is bath-driven',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const opposite: number[] = []
    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const collision = headOnRotate({ opposite }) // the momentum-conserving collision
    const beats = 24
    const shear = {
      gradAxis: 1,
      momAxis: 0,
      wavelength: side,
      side,
      directions,
    }

    const will = shearSetup({ mesh, ...shear })
    const closed = shearAmplitudeSeries({
      will,
      collision,
      beats,
      open: false,
      ...shear,
    })
    const open = shearAmplitudeSeries({
      will,
      collision,
      beats,
      open: true,
      ...shear,
    })

    // the closed bulk recurs, the tail returns near the initial amplitude (no net dissipation)
    const closedTailMax = Math.max(...closed.slice(8))
    const closedRecurs = closedTailMax > 0.95
    // the open mesh dissipates, the shear decays well below the start and does not return
    const openFinal = open[open.length - 1]!
    const openTailMax = Math.max(...open.slice(8))
    const openDissipates = openFinal < 0.8 && openTailMax < 0.95

    const ok = closedRecurs && openDissipates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a deterministic transverse shear in the momentum-conserving lattice gas RECURS on the closed reversible bulk (the shear amplitude returns near its initial value, no net viscous decay, Poincare recurrence) but DISSIPATES on the open mesh (the bath, the gradient-axis boundary absorbing, the amplitude decays and does not return), so viscous momentum diffusion in the model is bath-driven like all dissipation, not a property of the reversible bulk, with a clean viscosity coefficient left as the open coarse-grained extension',
      metrics: {
        closedTailMaxTimes1000: Math.round(closedTailMax * 1000),
        openFinalTimes1000: Math.round(openFinal * 1000),
        openTailMaxTimes1000: Math.round(openTailMax * 1000),
        beats,
        side,
      },
      control: {
        closedTailMaxTimes1000: Math.round(closedTailMax * 1000),
      },
      notes:
        'the closed torus is the control, it recurs (no dissipation). The open mesh is the bath, it dissipates. This is the fluid face of the arrow-from-the-wake, viscosity needs the open boundary. The measured viscosity coefficient (a clean exp(-nu k^2 t) fit) is the named open extension, it needs a larger system and the coarse-grained hydrodynamic limit, the full FD1.',
    })
  },
})
