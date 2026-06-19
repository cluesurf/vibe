// FD2, the FHP-not-HPP lesson, coin richness makes the fluid. A proper fluid needs enough momentum-mixing
// collision channels. The committed 24-direction D4 dock has 12 opposite lines, so the momentum-conserving
// collision (headOnRotate, which rotates a zero-momentum pair to a paired empty line) has many mixing channels and
// dissipates a transverse shear substantially on the open mesh. The impoverished 6-direction cubic coin has only 3
// lines (one rotatable pair), so it barely dissipates, its fluid is broken. This is the four-dimensional analogue
// of why the hexagonal FHP gas beat the square HPP gas, the GEOMETRY (the coin's richness and symmetry) decides
// whether a working fluid emerges. Deterministic throughout, the shear is a fixed function of the cell coordinate.
//
// Honest scope. This shows the coin-richness half of FD2 (a low-symmetry coin gives a broken fluid). The full
// isotropy claim (the D4 viscous response becoming direction-independent, the residual axis-versus-diagonal
// anisotropy shrinking toward zero with scale) is the open extension, a small residual anisotropy (about 0.06) is
// measured on D4 at this size and its scaling is not yet established.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, cubicMesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import {
  shearSetup,
  shearAmplitudeSeries,
} from '@/code/measure/hydrodynamics'

const cubicDirections = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

function openDissipation(
  mesh: ReturnType<typeof d4Mesh>,
  directions: number[][],
  side: number,
  beats: number,
): number {
  const opposite: number[] = []

  for (let d = 0; d < mesh.degree; d++) {
    opposite.push(mesh.opposite(d))
  }

  const collision = headOnRotate({ opposite })
  const shear = {
    gradAxis: 1,
    momAxis: 0,
    wavelength: side,
    side,
    directions,
  }

  const will = shearSetup({ mesh, ...shear })
  const series = shearAmplitudeSeries({
    will,
    collision,
    beats,
    open: true,
    ...shear,
  })

  return series[series.length - 1]! // final amplitude relative to start, low = dissipated
}

export default experiment({
  id: 'fluids/coin-richness-shear',
  title:
    'a shear dissipates on the rich 24-direction coin but barely on the impoverished cubic coin, coin richness makes the fluid',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const beats = 24
    const d4Final = openDissipation(
      d4Mesh({ side }),
      rootsD4(),
      side,
      beats,
    )

    const cubicFinal = openDissipation(
      cubicMesh({ side }),
      cubicDirections,
      side,
      beats,
    )

    const d4Dissipates = d4Final < 0.8 // the rich coin makes a working viscous fluid
    const cubicBroken = cubicFinal > 0.9 // the impoverished coin barely dissipates
    const ok = d4Dissipates && cubicBroken

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the open mesh a transverse shear dissipates substantially on the committed 24-direction D4 coin (many momentum-mixing collision channels, a working viscous fluid) but barely dissipates on the impoverished 6-direction cubic coin (too few channels, a broken fluid), so the geometry of the coin decides whether a proper fluid emerges, the four-dimensional FHP-not-HPP lesson',
      metrics: {
        d4FinalAmplitudeTimes1000: Math.round(d4Final * 1000),
        cubicFinalAmplitudeTimes1000: Math.round(cubicFinal * 1000),
        beats,
        side,
        d4Directions: 24,
        cubicDirections: 6,
      },
      control: {
        cubicFinalAmplitudeTimes1000: Math.round(cubicFinal * 1000),
      },
      notes:
        'the cubic coin is the control (the HPP-style broken fluid). This is the coin-richness half of FD2. The full isotropy claim (D4 axis-versus-diagonal anisotropy shrinking with scale) is the open extension, a small residual anisotropy near 0.06 is measured on D4 at this size.',
    })
  },
})
