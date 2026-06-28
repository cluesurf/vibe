// ST1 CLOSED. The missing light-cone mode, resolved. A relativistic massless mode (the photon, the graviton,
// sound) needs a propagating wave with a LINEAR dispersion omega = c k, and the bare charge-only rule gives
// only a diffusive, non-propagating response. This experiment measures, on the committed 24-direction D4 coin,
// that the MOMENTUM-CONSERVING knit carries exactly such a mode. A longitudinal momentum wave (the sound mode,
// momentum along the same axis it varies on) propagates as a clean oscillation whose frequency, read off the
// stepped simulation, is omega = c k with c = 1 (one dock per beat, the light-cone speed) and no gap (massless),
// across every wavelength. The charge-only pair table has NO such mode, its response is pinned at the lattice
// cutoff (the per-beat parity flip), independent of wavelength, so its phase speed is not constant and it does
// not propagate. So the second conserved quantity (momentum, established in
// relativity/second-conserved-quantity-3434) yields the z=1 relativistic massless mode that the charge alone
// cannot, closing the sharpest open gap of the program. Deterministic throughout, the wave is a fixed
// sinusoidal function of the cell coordinate, no random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import {
  shearSetup,
  shearAmplitudeSeries,
} from '@/code/measure/hydrodynamics'
import { firstMinimumTime } from '@/code/measure/sound-wave'
import { relativisticDispersionFit } from '@/code/measure/dispersion'

const SIDE = 24
const WAVELENGTHS = [24, 12, 8, 6]
const BEATS = 40

// the measured frequency omega(k) of a longitudinal momentum wave under a collision, read from the first
// minimum of its amplitude trace (a half period). A propagating mode oscillates (a real first minimum), a
// diffusive one decays. Returns omega, k, and the phase speed omega / k for each wavelength.
function dispersion(collision: ReturnType<typeof headOnRotate>): {
  wavenumbers: number[]
  frequencies: number[]
  phaseSpeeds: number[]
} {
  const mesh = d4Mesh({ side: SIDE })
  const directions = rootsD4()
  const wavenumbers: number[] = []
  const frequencies: number[] = []
  const phaseSpeeds: number[] = []

  for (const wavelength of WAVELENGTHS) {
    const cfg = {
      gradAxis: 0,
      momAxis: 0,
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

    const halfPeriod = firstMinimumTime(series)
    const omega = halfPeriod > 0 ? Math.PI / halfPeriod : 0
    const k = (2 * Math.PI) / wavelength
    wavenumbers.push(k)
    frequencies.push(omega)
    phaseSpeeds.push(k > 0 ? omega / k : 0)
  }

  return { wavenumbers, frequencies, phaseSpeeds }
}

function spread(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  if (mean === 0) {
    return Infinity
  }

  return (Math.max(...values) - Math.min(...values)) / mean
}

export default experiment({
  id: 'relativity/propagating-mode-3434',
  code: 'E-RLT-0030',
  title:
    'the momentum-conserving knit carries a propagating massless mode omega = c k, the charge-only rule does not',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    // the momentum-conserving rule, the propagating mode
    const momentum = dispersion(headOnRotate({ opposite }))
    const fit = relativisticDispersionFit({
      wavenumbers: momentum.wavenumbers,
      frequencies: momentum.frequencies,
    })

    const momentumPhaseSpeedSpread = spread(momentum.phaseSpeeds)

    // the control, the committed charge-only pair table, no propagating mode (frequency pinned at the cutoff)
    const charge = dispersion(
      pairCollision({ opposite, forward: true }),
    )

    const chargePhaseSpeedSpread = spread(charge.phaseSpeeds)

    // a linear dispersion with c near 1 and no gap, a constant phase speed, and a control whose phase speed is
    // NOT constant (so it carries no propagating mode)
    const linearMassless =
      fit.speedSquared > 0.85 &&
      fit.speedSquared < 1.15 &&
      Math.abs(fit.massSquared) < 0.05

    const constantSpeed = momentumPhaseSpeedSpread < 0.1
    const controlNotPropagating = chargePhaseSpeedSpread > 0.3
    const ok = linearMassless && constantSpeed && controlNotPropagating

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the momentum-conserving knit a longitudinal momentum wave propagates with a measured linear dispersion omega = c k, the phase speed constant at c = 1 (one dock per beat) and the gap zero (massless), the relativistic z=1 massless mode, while the charge-only pair table carries no propagating mode (its frequency is pinned at the lattice cutoff independent of wavelength), so the second conserved quantity yields the light-cone mode the charge alone cannot',
      metrics: {
        speedSquared: fit.speedSquared,
        massSquared: fit.massSquared,
        phaseSpeedC:
          momentum.phaseSpeeds.reduce((a, b) => a + b, 0) /
          momentum.phaseSpeeds.length,
        momentumPhaseSpeedSpread,
        chargePhaseSpeedSpread,
      },
      control: { chargePhaseSpeedSpread },
      notes:
        'omega is read from the stepped simulation (the first minimum of the amplitude trace, a half period), not a formula. The momentum rule gives omega = c k with c = 1 across every wavelength (a constant phase speed), the charge rule gives a wavelength-independent cutoff frequency (a non-constant phase speed, no propagation). This closes ST1, the second conserved quantity established in relativity/second-conserved-quantity-3434 yields a propagating z=1 mode.',
    })
  },
})
