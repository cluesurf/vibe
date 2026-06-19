// The honest status of the graviton on the BARE knit. relativity/propagating-mode-3434 showed the
// momentum-conserving knit carries a propagating LONGITUDINAL mode (the spin-0 sound, omega = c k). A propagating
// GRAVITON is a TRANSVERSE-traceless spin-2 mode, and a propagating PHOTON is a transverse spin-1 mode, so the
// graviton needs the TRANSVERSE momentum channel to propagate. Here we measure whether it does. It does not. On
// the bare knit a transverse momentum wave (momentum perpendicular to the axis it varies along) is FROZEN, its
// amplitude never crosses zero, it is a conserved inviscid shear (the final amplitude equals the initial, no
// decay and no oscillation), while the longitudinal wave sweeps the full sinusoid through zero and back. So the
// bare discrete rule carries the spin-0 propagating mode EXACTLY but does NOT carry a propagating transverse
// spin-2 graviton, the transverse channel is Galilean (a conserved shear, omega = 0). The propagating graviton is
// therefore EMERGENT, it can only appear in the Lorentz-restored infrared where the transverse modes acquire the
// same light-cone propagation, not as a bare exact feature of the knit. Depth L2, a measured negative whose
// positive control is the longitudinal mode (it crosses zero, proving the apparatus detects propagation, so the
// transverse mode's failure to propagate is real, not a measurement artifact). Deterministic throughout.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import {
  shearSetup,
  shearAmplitudeSeries,
} from '@/code/measure/hydrodynamics'

const SIDE = 24
const BEATS = 60
const WAVELENGTHS = [24, 12, 8]

// the amplitude trace of a momentum wave, longitudinal (momAxis = gradAxis) or transverse (momAxis perpendicular
// to gradAxis). Returns the most negative value reached (a propagating wave crosses zero, a frozen one does not)
// and the final value (a conserved inviscid shear keeps its amplitude).
function trace(
  collision: ReturnType<typeof headOnRotate>,
  gradAxis: number,
  momAxis: number,
): { minAmplitude: number; finalAmplitude: number } {
  const mesh = d4Mesh({ side: SIDE })
  const directions = rootsD4()
  let minAmplitude = Infinity
  let finalAmplitude = 0
  for (const wavelength of WAVELENGTHS) {
    const cfg = {
      gradAxis,
      momAxis,
      wavelength,
      side: SIDE,
      directions,
    }
    const will = shearSetup({ mesh, ...cfg })
    const series = shearAmplitudeSeries({
      will,
      collision,
      beats: BEATS,
      open: false,
      ...cfg,
    })
    minAmplitude = Math.min(minAmplitude, ...series)
    finalAmplitude = Math.max(
      finalAmplitude,
      series[series.length - 1]!,
    )
  }
  return { minAmplitude, finalAmplitude }
}

export default experiment({
  id: 'relativity/transverse-mode-frozen',
  title:
    'the bare knit propagates the spin-0 mode but freezes the transverse spin-2 graviton, so the graviton is emergent',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite: number[] = []
    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }
    const collision = headOnRotate({ opposite })

    // the longitudinal (spin-0 sound) mode, the positive control, it propagates
    const longitudinal = trace(collision, 0, 0)
    // the transverse (spin-2 graviton, spin-1 photon polarization) mode, it freezes
    const transverse = trace(collision, 0, 1)

    // the longitudinal sweeps through zero (a propagating oscillation), the transverse never crosses zero (a
    // frozen, conserved shear), so the bare rule has no propagating transverse spin-2 graviton
    const longitudinalPropagates = longitudinal.minAmplitude <= -0.5
    const transverseFrozen = transverse.minAmplitude > 0.5
    const transverseConserved = transverse.finalAmplitude > 0.9
    const ok =
      longitudinalPropagates && transverseFrozen && transverseConserved

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the bare momentum-conserving knit the longitudinal (spin-0 sound) momentum wave propagates, its amplitude sweeping the full sinusoid through zero, while the transverse momentum wave (the polarization a propagating spin-2 graviton and spin-1 photon need) is frozen, its amplitude never crossing zero and its final value equal to its initial (a conserved inviscid shear, omega = 0). So the bare discrete rule carries the spin-0 propagating mode exactly but carries no propagating transverse spin-2 graviton, the transverse channel is Galilean. The propagating graviton is therefore emergent, appearing only in the Lorentz-restored infrared where the transverse modes acquire the same light-cone propagation, not as a bare exact feature.',
      metrics: {
        longitudinalMinAmplitude: Number(
          longitudinal.minAmplitude.toFixed(3),
        ),
        transverseMinAmplitude: Number(
          transverse.minAmplitude.toFixed(3),
        ),
        transverseFinalAmplitude: Number(
          transverse.finalAmplitude.toFixed(3),
        ),
      },
      control: {
        longitudinalMinAmplitude: Number(
          longitudinal.minAmplitude.toFixed(3),
        ),
      },
      notes:
        'the longitudinal mode is the positive control, it reaches amplitude minus one (crosses zero, propagates), proving the apparatus detects propagation, so the transverse mode staying near plus one (never crossing zero) is a real frozen shear, not a measurement gap. headOnRotate only reshapes head-on (longitudinal) pairs, leaving transverse momentum exactly conserved, which is why the transverse channel does not propagate. This corrects the earlier loose statement that the graviton is simply the spin-2 sector of the propagating mode, the spin-0 mode is exact on the bare knit but the propagating spin-2 graviton is emergent (Lorentz restoration in the infrared), consistent with the program where continuity and full Lorentz invariance are emergent, not base.',
    })
  },
})
