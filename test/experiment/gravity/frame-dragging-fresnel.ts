// Frame dragging on the optical metric, the Lense-Thirring analog. A rotating mass drags inertial
// frames, so a prograde and a retrograde ray at the same impact parameter deflect by different
// amounts (the effect Gravity Probe B and LARES measure as precession). On the model's optical
// reading of gravity (the clock-rate well of E-GRV-0037), rotation means the slow-clock MEDIUM
// moves: a rigid core with the 1/r exterior tail, and a ray in a moving medium is carried with the
// Fresnel drag coefficient 1 - 1/n^2, the classic moving-medium optics that Fizeau measured in
// 1851. Nothing about rotation asymmetry is typed in: the drag term is isotropic and the well is
// central.
//
// Measured: with the well static the two deflections are equal and opposite to the last digit (the
// mirror control, asymmetry exactly zero), with the well rotating the asymmetry switches on, it is
// LINEAR in the spin (doubling the spin doubles it within a tenth of a percent), it reverses sign
// exactly under spin reversal (parity), and it falls off with impact parameter faster than the
// static deflection does (the drag lives near the core, as Lense-Thirring's J/r^3 exterior does
// against the mass's 1/r). Depth L2: known moving-medium optics reproducing the gravitomagnetic
// signature on the model's optical metric, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { draggedDeflection } from '@/code/dynamics/optical-ray'

const STRENGTH = 0.5
const SPIN = 0.005
const IMPACT = 16

function asymmetry(input: { spin: number; impact: number }): number {
  const { spin, impact } = input
  const up = draggedDeflection({
    impactParameter: impact,
    strength: STRENGTH,
    spin,
  })
  const down = draggedDeflection({
    impactParameter: -impact,
    strength: STRENGTH,
    spin,
  })

  return up + down
}

export default experiment({
  id: 'gravity/frame-dragging-fresnel',
  code: 'E-GRV-0055',
  title:
    'frame dragging from Fresnel drag on the rotating clock-rate well: the static well is mirror-symmetric to the last digit, rotation switches on a prograde-retrograde deflection asymmetry that is linear in the spin to a tenth of a percent, reverses exactly under spin reversal, and falls off faster with impact parameter than the static deflection (the gravitomagnetic near-field), so the Lense-Thirring signature is moving-medium optics on the emergent metric with nothing about rotation typed in',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const still = asymmetry({ spin: 0, impact: IMPACT })
    const once = asymmetry({ spin: SPIN, impact: IMPACT })
    const twice = asymmetry({ spin: 2 * SPIN, impact: IMPACT })
    const reversed = asymmetry({ spin: -SPIN, impact: IMPACT })
    const far = asymmetry({ spin: SPIN, impact: 2 * IMPACT })

    // the static deflection at the two impact parameters, for the fall-off comparison
    const staticNear = Math.abs(
      draggedDeflection({
        impactParameter: IMPACT,
        strength: STRENGTH,
        spin: 0,
      }),
    )
    const staticFar = Math.abs(
      draggedDeflection({
        impactParameter: 2 * IMPACT,
        strength: STRENGTH,
        spin: 0,
      }),
    )

    const linearRatio = twice / once
    const staticFallOff = staticNear / staticFar
    const dragFallOff = Math.abs(once) / Math.abs(far)

    const ok =
      still === 0 &&
      Math.abs(once) > 1e-6 &&
      Math.abs(linearRatio - 2) < 0.002 &&
      reversed === -once &&
      dragFallOff > staticFallOff

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the deflection asymmetry is exactly zero for the static well, nonzero and linear in the spin (doubling within a tenth of a percent) for the rotating one, exactly odd under spin reversal, and decays faster in impact parameter than the static deflection',
      metrics: {
        asymmetryAtSpin: Number(once.toExponential(4)),
        linearRatio: Number(linearRatio.toFixed(5)),
        dragFallOffOverOctave: Number(dragFallOff.toFixed(3)),
        staticFallOffOverOctave: Number(staticFallOff.toFixed(3)),
      },
      // CONTROL: the static well, the asymmetry identically zero and the reversal exactly odd
      control: {
        staticAsymmetry: still,
        reversalOdd: reversed === -once,
      },
      notes:
        'the Fresnel coefficient 1 - 1/n^2 is the standing moving-medium result (Fizeau), and the flow profile (rigid core, 1/r tail) is the stated model of the rotating source. The base-dynamics version (a rotating defect cluster dragging the traveller knit) is the L3 follow-up once the knit is adopted.',
    })
  },
})
