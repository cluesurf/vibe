// FD1, the measured bulk viscosity of the committed knit, and the answer is that it is essentially ZERO. The
// momentum-conserving collision (headOnRotate) rotates only zero-momentum pairs to empty partner lines, which is
// too sparse to thermalize momentum, so a transverse shear does NOT viscously decay in the bulk. Measured on the
// closed mesh, the shear amplitude OSCILLATES with a non-decaying envelope (it returns to its initial value over
// many beats at two wavelengths), the signature of an INVISCID bulk (a near-conserved ballistic-or-sound mode),
// not the exp(-nu k^2 t) decay of a viscous fluid. On the open mesh the same shear decays, so all the viscous
// dissipation in the model is BATH-SET (boundary loss), not bulk momentum diffusion. So the committed fluid is
// inviscid in the bulk with a measured bulk shear viscosity of essentially zero, a clean and honest result.
//
// Deterministic throughout (the shear is a fixed sinusoidal function of the cell coordinate, no random), with the
// non-decaying closed envelope versus the decaying open run as the discriminating contrast.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import {
  shearSetup,
  shearAmplitudeSeries,
} from '@/code/measure/hydrodynamics'

export default experiment({
  id: 'fluids/no-bulk-viscosity',
  code: 'E-FLD-0004',
  title:
    'the committed collision has no finite bulk shear viscosity, the shear envelope does not decay (inviscid bulk)',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const opposite = meshOpposites(mesh)

    const collision = headOnRotate({ opposite })
    const beats = 40

    // the bulk (closed) envelope at two wavelengths, the maximum amplitude reached in the last quarter of the run
    const closedEnvelope = (wavelength: number): number => {
      const shear = {
        gradAxis: 1,
        momAxis: 0,
        wavelength,
        side,
        directions,
      }

      const will = shearSetup({ mesh, ...shear })
      const series = shearAmplitudeSeries({
        will,
        collision,
        beats,
        open: false,
        ...shear,
      })

      return Math.max(
        ...series
          .slice(Math.floor((3 * beats) / 4))
          .map(a => Math.abs(a)),
      )
    }

    // the open run final amplitude (boundary loss), for contrast
    const openFinal = (wavelength: number): number => {
      const shear = {
        gradAxis: 1,
        momAxis: 0,
        wavelength,
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

      return Math.abs(series[series.length - 1]!)
    }

    const closedLong = closedEnvelope(side) // wavelength = side
    const closedShort = closedEnvelope(Math.floor(side / 2)) // half wavelength
    const openLong = openFinal(side)

    // inviscid bulk = the closed envelope stays near 1 at both wavelengths (no secular viscous decay)
    const bulkInviscid = closedLong > 0.9 && closedShort > 0.9
    // the open run still dissipates (boundary loss), confirming the open dissipation is bath-set, not bulk viscous
    const openDissipates = openLong < 0.8
    const ok = bulkInviscid && openDissipates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed momentum-conserving collision has no finite bulk shear viscosity, a transverse shear on the closed mesh oscillates with a non-decaying envelope at two wavelengths (it returns to its initial amplitude, an inviscid near-conserved mode, not the exp(-nu k^2 t) decay of a viscous fluid), while the same shear on the open mesh decays, so the model fluid is inviscid in the bulk and all viscous dissipation is bath-set boundary loss',
      metrics: {
        closedEnvelopeLongTimes1000: Math.round(closedLong * 1000),
        closedEnvelopeShortTimes1000: Math.round(closedShort * 1000),
        openFinalLongTimes1000: Math.round(openLong * 1000),
        beats,
        side,
      },
      control: { openFinalLongTimes1000: Math.round(openLong * 1000) },
      notes:
        'the open run is the contrast, it dissipates (boundary loss) while the closed bulk does not (inviscid). headOnRotate rotates only zero-momentum pairs to empty partner lines, too sparse to diffuse momentum, hence no bulk viscosity. A richer momentum-mixing collision could give a finite viscosity, that is the open extension.',
    })
  },
})
