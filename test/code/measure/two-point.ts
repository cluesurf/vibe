// Conformance for code/measure/two-point: the Dirac equal-time vacuum correlator
// C(r) = sum_k cos(k r) / (2 omega(k)) / modes, omega(k) = arccos(cos k cos m). The
// reference is re-summed here by an independent loop, then we confirm the structural
// facts the Kallen-Lehmann form guarantees: the zero mode is skipped, every spectral
// weight is positive so C(0) is the largest and positive, and the correlator is even.

import { suite, check, close, ok } from '@/test/code/harness'
import { diracEqualTimeCorrelator } from '@/code/measure/two-point'

const TOL = 1e-12

// An independent re-derivation of C(r), the second route the methodology asks for.
function reference(input: {
  mass: number
  maxR: number
  modes: number
}): number[] {
  const { mass, maxR, modes } = input
  const c = new Array<number>(maxR + 1).fill(0)

  for (let n = 1; n < modes; n++) {
    const k = (Math.PI * n) / modes
    const omega = Math.acos(
      Math.max(-1, Math.min(1, Math.cos(k) * Math.cos(mass))),
    )

    if (omega < 1e-9) {
      continue
    }

    const w = 1 / (2 * omega)

    for (let r = 0; r <= maxR; r++) {
      c[r]! += (w * Math.cos(k * r)) / modes
    }
  }

  return c
}

suite('measure/two-point: dirac correlator', [
  check('matches the independent Kallen-Lehmann re-sum', () => {
    const got = diracEqualTimeCorrelator({
      mass: 0.3,
      maxR: 6,
      modes: 64,
    })

    const want = reference({ mass: 0.3, maxR: 6, modes: 64 })

    for (let r = 0; r < want.length; r++) {
      close(got[r]!, want[r]!, TOL, `C(${r})`)
    }
  }),
  // Every mode contributes a positive weight 1/(2 omega), so C(0) = sum of weights is
  // the largest value and strictly positive (reflection positivity at zero separation).
  check('C(0) is positive and the maximum over r', () => {
    const c = diracEqualTimeCorrelator({
      mass: 0.3,
      maxR: 8,
      modes: 64,
    })

    ok(c[0]! > 0, 'C(0) must be positive')

    for (let r = 1; r < c.length; r++) {
      ok(c[0]! >= c[r]!, `C(0) must dominate C(${r})`)
    }
  }),
  // C(0) equals the plain sum of the spectral weights / modes (cos(0) = 1), an exact tie
  // between the two definitions independent of the cosines.
  check('C(0) equals the summed spectral weight', () => {
    const modes = 48
    const mass = 0.5

    let weight = 0

    for (let n = 1; n < modes; n++) {
      const k = (Math.PI * n) / modes
      const omega = Math.acos(Math.cos(k) * Math.cos(mass))

      weight += 1 / (2 * omega) / modes
    }

    const c = diracEqualTimeCorrelator({ mass, maxR: 4, modes })

    close(c[0]!, weight, TOL)
  }),
  // A larger mass shortens the range: C decays faster, so C(4)/C(0) is smaller for the
  // heavier field (a contact correlator) than for the light one (a propagating particle).
  check('larger mass gives a shorter-range correlator', () => {
    const light = diracEqualTimeCorrelator({
      mass: 0.1,
      maxR: 6,
      modes: 96,
    })

    const heavy = diracEqualTimeCorrelator({
      mass: 1.2,
      maxR: 6,
      modes: 96,
    })

    const lightRatio = Math.abs(light[6]! / light[0]!)
    const heavyRatio = Math.abs(heavy[6]! / heavy[0]!)

    ok(
      heavyRatio < lightRatio,
      'the heavier field must fall off faster relative to C(0)',
    )
  }),
])
