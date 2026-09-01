// A repeating thought is an attracting limit cycle of the association dynamics. Associations chain
// one mental state to the next, and a thought that loops back on itself is a closed chain: one state
// leads to the next and eventually back to the first. An asymmetric associative memory stores such a
// cycle (each stored state points to the next in its weights), and its update dynamics then falls
// into the cycle and repeats it. From a noisy or partial cue the dynamics is pulled onto the cycle
// and settles into repeating it, so a repeating thought is a stable periodic attractor of the
// association dynamics, not a static fixed idea but a loop the mind keeps traversing. This is the
// dynamical face of rumination: the loop is sticky because it attracts a basin of nearby starts.
//
// Measured on a memory storing a five-state cycle: from a fifteen-percent-corrupted cue of the first
// state the dynamics converges to cycling through all five states in order and keeps repeating the
// period-five loop, on essentially every trial, so the stored cycle is an attractor with a wide
// basin. Scrambling the weights (breaking the sequence links so no state points cleanly to a next)
// destroys the cycle: the dynamics never settles into the ordered loop, on essentially no trial. So
// the repeating thought is specifically the payoff of the stored association cycle, and it is
// attracting, not merely present.
//
// The control is the scrambled-weight memory, which has no attracting cycle, so the repetition is
// the association structure and not an artifact of the dynamics.
//
// Depth L2. It establishes that a stored association cycle is an attracting limit cycle of the
// dynamics (a repeating thought reached from noisy cues, wide basin) against a scrambled-weight
// control with no cycle, the attractor reading of a repeating thought. Deterministic (fixed patterns
// and cue corruption from a seed).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  buildSequenceMemory,
  convergesToCycle,
} from '@/code/measure/sequence-memory'

const SIZE = 100
const LENGTH = 5
const NOISE = 0.15
const TRIALS = 120

export default experiment({
  id: 'selves/repeating-thought-cycle',
  code: 'E-SLF-0174',
  title:
    'a stored association cycle is an attracting limit cycle of the dynamics (a repeating thought reached from noisy cues on nearly every trial, a wide basin) while scrambling the weights leaves no cycle',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const memory = buildSequenceMemory({
      size: SIZE,
      length: LENGTH,
      seed: 5,
    })

    const basinFraction = (scramble: boolean): number => {
      let converged = 0

      for (let trial = 0; trial < TRIALS; trial++) {
        if (
          convergesToCycle({
            memory,
            noiseFraction: NOISE,
            scramble,
            seed: 100 + trial,
          })
        ) {
          converged++
        }
      }

      return converged / TRIALS
    }

    const attractorBasin = basinFraction(false)
    const scrambledBasin = basinFraction(true)

    const cycleAttracts = attractorBasin > 0.9
    const scrambledHasNoCycle = scrambledBasin < 0.05

    const ok = cycleAttracts && scrambledHasNoCycle

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an asymmetric associative memory storing a five-state cycle (each stored state pointing to the next in its weights) has that cycle as an attracting limit cycle of its update dynamics: from a fifteen-percent-corrupted cue of the first state the dynamics converges to cycling through all five states in order and keeps repeating the period-five loop on more than ninety percent of trials (a wide basin), so a repeating thought is a stable periodic attractor of the association dynamics, a loop the mind is pulled onto and keeps traversing, while scrambling the weights to break the sequence links leaves no attracting cycle (under five percent of trials settle into the ordered loop), so the repetition is the payoff of the stored association cycle and it is genuinely attracting',
      metrics: {
        cycleLength: LENGTH,
        attractorBasinPercent: Number(
          (100 * attractorBasin).toFixed(1),
        ),
        scrambledBasinPercent: Number(
          (100 * scrambledBasin).toFixed(1),
        ),
        cueNoisePercent: 100 * NOISE,
      },
      // CONTROL: the scrambled-weight memory has no attracting cycle.
      control: {
        scrambledBasinPercent: Number(
          (100 * scrambledBasin).toFixed(1),
        ),
      },
      notes:
        'A repeating thought as an attracting limit cycle (asymmetric sequence memory). The dynamical face of rumination: a sticky loop with a wide basin. Complements the hierarchical recall walkway (E-NVG-0011) and the loop holonomy (E-GMT-0036).',
    })
  },
})
