// Dielectric optics from the clock-rate field. A slow-clock domain is, for a ray, a higher refractive
// index (more proper path per beat), the same reading that gives gravitational lensing in
// E-GRV-0037. Here the domain has a planar edge: a smoothed clock-rate step, uniform along the
// boundary, and the eikonal law (the tangent turns toward the transverse index gradient, Fermat)
// is integrated across it with NOTHING about refraction angles typed in. What comes out is Snell's
// law: n1 sin(theta1) = n2 sin(theta2) at four incidence angles to under a hundredth of a degree,
// and, running from the slow domain into the fast one, total internal reflection appears at the
// bisected critical angle asin(n1/n2) to under a tenth of a degree. The flat-index control does not
// bend. So a clock-rate domain refracts exactly like a dielectric: lensing and dielectric optics are
// one mechanism at two profile shapes. Depth L2: known optics recovered from the eikonal law on the
// model's clock-rate reading, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { boundaryRefraction } from '@/code/dynamics/optical-ray'

const NEAR = 1
const FAR = 1.5
const DEGREES = [10, 25, 40, 60]

const radians = (deg: number): number => (deg * Math.PI) / 180
const degrees = (rad: number): number => (rad * 180) / Math.PI

export default experiment({
  id: 'gauge/snell-refraction',
  code: 'E-FRC-0074',
  title:
    "Snell's law from the clock-rate step: the eikonal ray crossing a planar slow-clock boundary satisfies n1 sin theta1 = n2 sin theta2 at four incidence angles to under a hundredth of a degree with nothing about angles typed in, the dense-to-rare ray turns back at the bisected critical angle matching asin(n1/n2) to under a tenth of a degree (total internal reflection), and the flat-index control does not bend, so a clock-rate domain refracts exactly like a dielectric and lensing is the same mechanism at a different profile",
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // Snell across the step, rare to dense
    const errors = DEGREES.map(deg => {
      const { crossed, outgoing } = boundaryRefraction({
        nearIndex: NEAR,
        farIndex: FAR,
        incidence: radians(deg),
      })
      const snell = Math.asin((NEAR * Math.sin(radians(deg))) / FAR)

      return crossed ? Math.abs(degrees(outgoing) - degrees(snell)) : 999
    })

    // the critical angle, dense to rare, bisected to a hundredth of a degree
    let low = radians(20)
    let high = radians(80)

    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2
      const { crossed } = boundaryRefraction({
        nearIndex: FAR,
        farIndex: NEAR,
        incidence: mid,
      })

      if (crossed) {
        low = mid
      } else {
        high = mid
      }
    }

    const criticalMeasured = degrees((low + high) / 2)
    const criticalExpected = degrees(Math.asin(NEAR / FAR))

    // the control: no index step, no bending, at the steepest tested incidence
    const flat = boundaryRefraction({
      nearIndex: NEAR,
      farIndex: NEAR,
      incidence: radians(60),
    })

    const worstSnellError = Math.max(...errors)
    const criticalError = Math.abs(criticalMeasured - criticalExpected)
    const controlBend = Math.abs(degrees(flat.outgoing) - 60)

    const ok =
      worstSnellError < 0.01 &&
      criticalError < 0.1 &&
      flat.crossed &&
      controlBend < 1e-6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the eikonal ray across the clock-rate step obeys Snell to under a hundredth of a degree at four angles, turns back at the critical angle matching asin(n1/n2) to under a tenth of a degree, and does not bend when the step is removed',
      metrics: {
        worstSnellErrorDegrees: Number(worstSnellError.toFixed(5)),
        criticalMeasured: Number(criticalMeasured.toFixed(3)),
        criticalExpected: Number(criticalExpected.toFixed(3)),
        criticalErrorDegrees: Number(criticalError.toFixed(4)),
      },
      // CONTROL: the flat index field leaves the ray's angle untouched
      control: {
        flatControlBendDegrees: Number(controlBend.toExponential(2)),
        flatControlCrossed: flat.crossed,
      },
      notes:
        'the index field is the posited clock-rate reading (as in the lensing experiments), and the eikonal integrator knows only the gradient law, so the sine ratio and the critical angle are measured consequences, not inputs. The gas-native version (a sound pulse crossing a density domain) is the L3 follow-up.',
    })
  },
})
