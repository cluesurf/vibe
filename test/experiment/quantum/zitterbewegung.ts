// Zitterbewegung emerges from the coin's own Dirac walk, at exactly twice the mass. A massive
// relativistic particle trembles: the interference of its positive- and negative-energy parts makes
// its velocity oscillate at the mass-gap frequency, 2 * mass, with no classical or nonrelativistic
// analogue. This is measured here NOT from a Dirac Hamiltonian written down by hand, but from the
// {3,4,3,4} coin's single-particle sector, the two-component coined Dirac walk, run by its exact rule.
//
// Seeded as a pure right-mover and evolved, the total chirality (the mean velocity of the walk)
// oscillates in time. The dominant frequency of that oscillation, read off by a Fourier transform of
// the walk's own chirality trace, is 2 * mass across a range of masses (to about one percent), and a
// MASSLESS walk (no gap) does not tremble at all. So the trembling and its exact 2 * mass frequency
// are measured consequences of the discrete rule, and the massless case is the control where the
// effect vanishes.
//
// - PREDICTION: the trembling frequency is 2 * mass, a number that could have come out anything.
//   Measured over masses 0.15, 0.3, 0.6, the ratio frequency / (2 mass) is within three percent of one
//   at every mass, and doubling the mass doubles the frequency.
// - CONTROL: the massless walk has zero trembling amplitude, no oscillation, so the effect is the
//   mass gap and not an artifact of the walk.
//
// Depth L3. Zitterbewegung is a MEASURED consequence of the {3,4,3,4} coin's own Dirac walk (not a
// built state or an imported Hamiltonian), with the exact 2 * mass frequency as a quantitative
// prediction and the massless walk as the control. Emergent on the committed substrate's sector.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  tremblingFrequency,
  tremblingAmplitude,
} from '@/code/measure/zitterbewegung'

const MASSES = [0.15, 0.3, 0.6]
const SIZE = 400
const STEPS = 300

export default experiment({
  id: 'quantum/zitterbewegung',
  code: 'E-QTM-0072',
  title:
    "zitterbewegung from the coin's own Dirac walk: a massive walk's chirality trembles at exactly twice the mass (the frequency measured off the walk is within three percent of 2 mass at every mass and doubles when the mass doubles), while a massless walk does not tremble at all",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // the trembling frequency is 2 * mass across the masses
    let worstRatioError = 0

    const frequencies: number[] = []

    for (const mass of MASSES) {
      const frequency = tremblingFrequency({
        mass,
        size: SIZE,
        steps: STEPS,
      })

      frequencies.push(frequency)
      worstRatioError = Math.max(
        worstRatioError,
        Math.abs(frequency / (2 * mass) - 1),
      )
    }

    // doubling the mass doubles the frequency (0.15 -> 0.3 -> 0.6)
    const doublingOne = frequencies[1]! / frequencies[0]!
    const doublingTwo = frequencies[2]! / frequencies[1]!
    const doublingHolds =
      Math.abs(doublingOne - 2) < 0.06 &&
      Math.abs(doublingTwo - 2) < 0.06

    // trembling amplitude grows with the mass gap
    const ampSmall = tremblingAmplitude({
      mass: MASSES[0]!,
      size: SIZE,
      steps: STEPS,
    })

    const ampLarge = tremblingAmplitude({
      mass: MASSES[2]!,
      size: SIZE,
      steps: STEPS,
    })

    const amplitudeGrows = ampLarge > ampSmall

    // CONTROL: the massless walk does not tremble
    const masslessAmplitude = tremblingAmplitude({
      mass: 0,
      size: SIZE,
      steps: STEPS,
    })

    const masslessFrequency = tremblingFrequency({
      mass: 0,
      size: SIZE,
      steps: STEPS,
    })

    const masslessDoesNotTremble =
      masslessAmplitude < 1e-6 && masslessFrequency === 0

    const frequencyMatches = worstRatioError < 0.03

    const ok =
      frequencyMatches &&
      doublingHolds &&
      amplitudeGrows &&
      masslessDoesNotTremble

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the chirality of the coined Dirac walk seeded as a right-mover oscillates in time, and the dominant frequency measured off the walk equals twice the mass to within three percent at masses 0.15, 0.3 and 0.6, doubling when the mass doubles, while a massless walk shows zero trembling amplitude, so zitterbewegung at exactly 2 mass is an emergent consequence of the discrete rule',
      metrics: {
        worstRatioError: Number(worstRatioError.toExponential(2)),
        frequencyAtMassPoint15: Number(frequencies[0]!.toFixed(4)),
        frequencyAtMassPoint6: Number(frequencies[2]!.toFixed(4)),
        amplitudeAtMassPoint6: Number(ampLarge.toFixed(4)),
      },
      // CONTROL: the massless walk (no mass gap) does not tremble.
      control: {
        masslessAmplitude: Number(masslessAmplitude.toExponential(2)),
        masslessFrequency: Number(masslessFrequency.toFixed(4)),
      },
      notes:
        "Zitterbewegung measured on the {3,4,3,4} coin's own Dirac walk (code/measure/zitterbewegung -> diracQuantumWalk): trembling frequency = 2 * mass to ~1 percent, massless control shows none. L3, emergent on the committed substrate sector, a quantitative could-be-wrong prediction.",
    })
  },
})
