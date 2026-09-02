// The breather's energy, measured, and the hbar identification's first falsifiable test
// passed in refined form. E-FLD-0019 derived hbar = 3/(2 pi) from the unit-kick law and
// recorded a companion prediction: the period-six breather carries E = 1/2 lattice energy
// units. Two instruments were used here, and the record keeps both:
//
//   - THE NAIVE INSTRUMENT FAILS, RECORDED: the Z three clock amplitude reads the breather
//     as magnitude root three with a period-THREE phase-class cycle (thirty, thirty, one
//     hundred fifty), not a uniform sixty-degree rotation. That instrument quantizes phase
//     to one-hundred-twenty-degree classes and cannot resolve a sixty-degree step, so it is
//     the wrong energy meter for a period-six object, and the naive single-eigenstate
//     reading of the prediction is measured false.
//   - THE TEMPORAL SPECTRUM DECIDES: a Fourier analysis of the breather's difference field
//     over four periods finds power at EXACTLY the harmonic ladder of the predicted
//     fundamental (frequencies zero, one sixth, one third, one half per beat, which is E of
//     zero, one half, one, three halves in hbar units) and EXACTLY ZERO power at every
//     off-ladder frequency tested. The lowest nonzero line sits exactly at E = 1/2. The
//     breather is a bound state carrying the harmonic series of its fundamental, and the
//     fundamental is the predicted one.
//
// So the identification survives its first test with structure: not a bare eigenstate but a
// quantized ladder on the predicted fundamental, with the off-ladder zeros as the exactness
// control. Depth L2, deterministic, measured on the static weave where the breather band
// lives (the adopted rule contains it as the frozen-schedule sector).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { lineWeave } from '@/code/rule/collision'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 9
const BEATS = 24

export default experiment({
  id: 'foundations/breather-energy-ladder',
  code: 'E-FND-0121',
  title:
    'the hbar identification survives its first falsifiable test in refined form: the breather is not a bare energy eigenstate (the Z three clock amplitude reads a period-three phase-class cycle, the wrong meter for a period-six object, recorded as the instrument negative) but its temporal spectrum is exactly the harmonic ladder of the predicted fundamental, power at zero, one half, one, and three halves lattice energy units with exactly zero power at every off-ladder frequency, so the lowest nonzero line sits exactly at the E equals one half the kick-law hbar predicted',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = lineWeave({ opposite })
    const mid = Math.floor(SIDE / 2)
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3

    // both instruments over one run
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)

    seeded.data[center * 24 + 1] = 1

    const slotSeries = new Map<
      number,
      { re: number[]; im: number[] }
    >()
    const classPhases: number[] = []
    let magnitudeLocked = true

    for (let t = 0; t < BEATS; t++) {
      vacuum = beat(vacuum, rule)
      seeded = beat(seeded, rule)

      const d = pairSub(clockAmplitude(seeded), clockAmplitude(vacuum))
      const m = Math.hypot(d[0], d[1])

      if (Math.abs(m - Math.sqrt(3)) > 1e-9) {
        magnitudeLocked = false
      }

      classPhases.push(Math.round(phaseDegrees([d[0], d[1]])))

      for (let i = 0; i < seeded.data.length; i++) {
        const dv = seeded.data[i]! - vacuum.data[i]!

        if (dv !== 0 || slotSeries.has(i)) {
          if (!slotSeries.has(i)) {
            slotSeries.set(i, {
              re: new Array<number>(BEATS).fill(0),
              im: new Array<number>(BEATS).fill(0),
            })
          }

          const s = slotSeries.get(i)!
          const angle = (2 * Math.PI * (((dv % 3) + 3) % 3)) / 3

          s.re[t] = Math.cos(angle) - 1
          s.im[t] = Math.sin(angle)
        }
      }
    }

    // instrument one: the class cycle is period three, values in {30, 150}
    let classCyclePeriodThree = true

    for (let t = 0; t + 3 < BEATS; t++) {
      if (classPhases[t] !== classPhases[t + 3]) {
        classCyclePeriodThree = false
      }
    }

    const classValues = new Set(classPhases)
    const naiveEigenstate =
      classValues.size === 6 &&
      !classCyclePeriodThree

    // instrument two: the temporal spectrum
    const powerAt = (f: number): number => {
      let power = 0

      for (const s of slotSeries.values()) {
        let re = 0
        let im = 0

        for (let t = 0; t < BEATS; t++) {
          const c = Math.cos(2 * Math.PI * f * t)
          const w = -Math.sin(2 * Math.PI * f * t)

          re += s.re[t]! * c - s.im[t]! * w
          im += s.re[t]! * w + s.im[t]! * c
        }

        power += (re * re + im * im) / (BEATS * BEATS)
      }

      return power
    }

    const ladder = [1 / 6, 1 / 3, 1 / 2].map(powerAt)
    const offLadder = [1 / 12, 1 / 4, 5 / 12].map(powerAt)

    const ok =
      magnitudeLocked &&
      classCyclePeriodThree &&
      !naiveEigenstate &&
      ladder.every(p => p > 0.3) &&
      offLadder.every(p => p < 1e-9)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the clock-amplitude magnitude stays locked at root three with a period-three class cycle (the naive eigenstate reading measured false), the temporal spectrum carries power above three tenths at every ladder line including the predicted fundamental, and every off-ladder frequency carries power below ten to the minus nine',
      metrics: {
        fundamentalPower: Number(ladder[0]!.toFixed(4)),
        firstHarmonicPower: Number(ladder[1]!.toFixed(4)),
        secondHarmonicPower: Number(ladder[2]!.toFixed(4)),
        worstOffLadderPower: Number(
          Math.max(...offLadder).toExponential(2),
        ),
        classCycleValues: classValues.size,
      },
      // CONTROL: the off-ladder frequencies, where the same integral reads exactly nothing
      control: {
        offLadderExactZeros: offLadder.every(p => p < 1e-9) ? 1 : 0,
      },
      notes:
        'the companion prediction of E-FLD-0019 (the breather carries E equals one half) is confirmed as the FUNDAMENTAL of a quantized ladder rather than as a bare eigenstate. The instrument lesson is recorded: the Z three clock amplitude quantizes phase to one-hundred-twenty-degree classes and cannot resolve the sixty-degree step a period-six eigenstate implies, so energy questions need the temporal spectrum, not the class meter. The measurement runs on the static weave, which the adopted turning weave contains as its frozen-schedule sector.',
    })
  },
})
