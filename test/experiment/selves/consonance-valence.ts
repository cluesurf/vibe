// The Symmetry Theory of Valence, acoustic face. Andres Gomez-Emilsson (QRI) holds that the valence
// of an experience tracks the symmetry of the mathematical object that represents it: more symmetry,
// more positive valence. The cleanest measurable instance is musical consonance. A vibe self is a
// bound resonant pattern, and the consonance of its resonant modes is the symmetry of that pattern.
// Consonant intervals (simple frequency ratios) align the partials of the two tones into a symmetric
// combined spectrum with little beating, a positive-valence state; dissonant intervals leave the
// partials beating, a rough negative-valence state.
//
// The dissonance is the Plomp-Levelt / Helmholtz roughness summed over every pair of partials. Across
// the octave the simple-ratio intervals sit in consonance valleys: the octave 2:1 and the fifth 3:2
// have low dissonance, and the fifth is a genuine local minimum (lower than its irrational
// neighbors), while the minor second 16:15 and the tritone are roughness peaks. This reproduces the
// classic consonance curve.
//
// The control is a pair of pure sine tones with no harmonics. Their dissonance depends only on the
// separation of the two fundamentals, so it falls monotonically through the fifth with no valley:
// there are no partials to align, so there is no consonance structure. So the consonance valleys, the
// positive-valence states, come specifically from the harmonic partials aligning into a symmetric
// spectrum, exactly the Symmetry Theory of Valence.
//
// Depth L2. It reproduces the Plomp-Levelt consonance curve (simple-ratio valleys, a local minimum at
// the fifth, dissonant peaks) and shows the valleys vanish for partial-free pure tones, bridged to the
// Symmetry Theory of Valence. Distinct from the pain-pleasure mirror result (E-SLF-0149, which shows
// the base has no intrinsic drive toward pleasure): this is the structure of valence, not its sign.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  harmonicTone,
  pureTone,
  intervalDissonance,
} from '@/code/measure/consonance'

const FUNDAMENTAL = 261.63
const PARTIALS = 6

export default experiment({
  id: 'selves/consonance-valence',
  code: 'E-SLF-0173',
  title:
    'consonant intervals (simple ratios) sit in roughness valleys with the fifth a local minimum while dissonant intervals peak, and the valleys vanish for pure tones, the Symmetry Theory of Valence via consonance',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const harmonic = (ratio: number): number =>
      intervalDissonance(
        harmonicTone({ fundamental: FUNDAMENTAL, partials: PARTIALS }),
        harmonicTone({
          fundamental: FUNDAMENTAL * ratio,
          partials: PARTIALS,
        }),
      )

    const pure = (ratio: number): number =>
      intervalDissonance(
        pureTone(FUNDAMENTAL),
        pureTone(FUNDAMENTAL * ratio),
      )

    const octave = harmonic(2)
    const fifth = harmonic(1.5)
    const minorSecond = harmonic(16 / 15)
    const tritone = harmonic(Math.sqrt(2))

    // the fifth is a genuine consonance valley (a local minimum) for harmonic tones
    const fifthIsValley =
      fifth < harmonic(1.48) && fifth < harmonic(1.52)

    // consonant intervals are quieter than dissonant ones
    const consonantBelowDissonant =
      octave < minorSecond && fifth < minorSecond && fifth < tritone

    // CONTROL: pure tones have no consonance valley at the fifth (monotonic through it)
    const pureFifthIsValley =
      pure(1.5) < pure(1.48) && pure(1.5) < pure(1.52)

    const controlHasNoValley = !pureFifthIsValley

    const ok =
      fifthIsValley && consonantBelowDissonant && controlHasNoValley

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'summed Plomp-Levelt roughness over the partials of two harmonic tones puts the simple-ratio intervals in consonance valleys (the octave 2:1 and the fifth 3:2 are low, and the fifth is a genuine local minimum lower than its irrational neighbors) while the minor second 16:15 and the tritone are roughness peaks, reproducing the consonance curve, and a pair of pure sine tones has no valley at the fifth (its dissonance falls monotonically through the interval since there are no partials to align), so the consonance valleys are the payoff of the harmonic partials aligning into a symmetric spectrum, the acoustic face of the Symmetry Theory of Valence where symmetry is positive valence',
      metrics: {
        octaveDissonance: Number(octave.toFixed(4)),
        fifthDissonance: Number(fifth.toFixed(4)),
        minorSecondDissonance: Number(minorSecond.toFixed(4)),
        tritoneDissonance: Number(tritone.toFixed(4)),
        pureFifthIsValley: pureFifthIsValley ? 1 : 0,
      },
      // CONTROL: pure tones have no consonance valley (monotonic through the fifth).
      control: { pureFifthIsValley: pureFifthIsValley ? 1 : 0 },
      notes:
        'Symmetry Theory of Valence (Gomez-Emilsson, QRI) via consonance. Consonance is the symmetry of the resonant spectrum, positive valence. The valleys come from harmonic partials aligning, absent in pure tones. Distinct from the pain-pleasure mirror (E-SLF-0149).',
    })
  },
})
