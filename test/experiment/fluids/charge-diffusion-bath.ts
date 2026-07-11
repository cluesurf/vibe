// FD5, the conserved CHARGE current is NOT diffusive in the reversible bulk, like the momentum shear. A
// deterministic charge-density wave under the committed pair-table (the create move is charge-neutral per cell, so
// the net-cell-charge field is clean of vacuum churn) OSCILLATES with a non-decaying envelope on the closed mesh
// (it recurs, with the charge conserved exactly), so the charge mode does not diffuse in the reversible bulk. Both
// conserved currents, charge and momentum, are thus non-dissipative in the reversible bulk, and real hydrodynamic
// transport (diffusion and viscosity alike) needs the bath. This deterministically clarifies the charge mode, an
// earlier stochastic search (gauge/dynamic-dispersion) reported it diffusive with dynamic exponent z near two, but
// that diffusion comes from the RANDOMNESS of the stochastic rule, against the determinism rule, whereas the
// genuinely deterministic reversible rule gives a recurring (non-decaying) charge mode.
//
// Deterministic throughout, the charge wave is a fixed sinusoidal function of the cell coordinate, no random. The
// open-mesh charge run is NOT used as a contrast here, the absorbing boundary reshapes the profile rather than
// cleanly damping the mode, so the clean claim is the closed-bulk non-diffusivity. Real charge diffusion needs the
// bath, shown cleanly for momentum in shear-dissipation-bath.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { pairCollision } from '@/code/rule/collision'
import { charge, cloneWill } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import {
  chargeWaveSetup,
  chargeWaveSeries,
} from '@/code/measure/hydrodynamics'

export default experiment({
  id: 'fluids/charge-diffusion-bath',
  code: 'E-FLD-0002',
  title:
    'the conserved charge wave recurs in the reversible bulk (not diffusive), real charge diffusion needs the bath',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const mesh = d4Mesh({ side })
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++)
      opposite.push(mesh.opposite(d))

    const collision = pairCollision({ opposite, forward: true }) // the committed charge-conserving knit
    const beats = 56

    // the closed-bulk envelope, the maximum amplitude reached in the last quarter of the run (recurs => stays ~1)
    const closedEnvelope = (wavelength: number): number => {
      const will = chargeWaveSetup({
        mesh,
        side,
        gradAxis: 1,
        wavelength,
      })

      const series = chargeWaveSeries({
        will,
        collision,
        beats,
        open: false,
        side,
        gradAxis: 1,
        wavelength,
      })

      return Math.max(
        ...series
          .slice(Math.floor((3 * beats) / 4))
          .map(a => Math.abs(a)),
      )
    }

    const closedLong = closedEnvelope(side)
    const closedShort = closedEnvelope(Math.floor(side / 2))

    // charge is conserved EXACTLY over the run, so the recurrence is genuine, not leakage
    let chargeExact = true

    {
      const will0 = chargeWaveSetup({
        mesh,
        side,
        gradAxis: 1,
        wavelength: side,
      })

      const q0 = charge(will0)

      let w = cloneWill(will0)

      for (let t = 0; t < beats; t++) {
        w = beat(w, collision)

        if (charge(w) !== q0) {
          chargeExact = false
          break
        }
      }
    }

    // the charge wave recurs (non-decaying envelope at two wavelengths) => no bulk diffusion. A genuinely
    // diffusive mode would show a decaying envelope. Real diffusion needs the bath (shown for momentum).
    const bulkNonDiffusive = closedLong > 0.95 && closedShort > 0.95
    const ok = bulkNonDiffusive && chargeExact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a deterministic conserved charge-density wave under the committed pair-table recurs with a non-decaying envelope on the closed reversible bulk at two wavelengths, with the charge conserved exactly, so the charge mode is NOT diffusive in the reversible bulk (the same Poincare recurrence as the momentum shear), and the apparent diffusive z=2 of the earlier stochastic search comes from its randomness, not the reversible rule, with real diffusion needing the bath',
      metrics: {
        closedEnvelopeLongTimes1000: Math.round(closedLong * 1000),
        closedEnvelopeShortTimes1000: Math.round(closedShort * 1000),
        chargeConserved: chargeExact ? 1 : 0,
        beats,
        side,
      },
      control: {
        closedEnvelopeLongTimes1000: Math.round(closedLong * 1000),
      },
      notes:
        'a genuinely diffusive mode would show a decaying envelope, this one recurs (stays near 1). This corrects the apparent diffusivity of the charge mode, which in the stochastic gauge/dynamic-dispersion came from randomness (against the determinism rule), not the reversible bulk. The open-mesh charge run is not a clean contrast (the absorbing boundary reshapes the profile rather than cleanly damping the mode), so it is not used here. Real charge diffusion needs the bath, as shown cleanly for momentum in shear-dissipation-bath.',
    })
  },
})
