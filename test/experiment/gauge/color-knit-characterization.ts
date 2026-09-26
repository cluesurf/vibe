// What changes when the knit changes: the chosen color-local knit (E-FRC-0148 chose the color turn weave)
// run beside the committed turning weave through every test the committed knit was adopted on or has been
// characterized by. The runner-up of E-FRC-0148 (turn-schedule:bind-reverse:103:130542) is run beside them
// as a third column, reported and not gated, since the choice fell to a tie-break.
//
// Every rule is built by the same code (code/rule/color-local-weave), the committed one as the spec with
// the pair table, checked equal to turningWeave cell by cell as the first control. The instruments live in
// code/measure/knit-characterization (moved there from this file when E-FRC-0159 needed them too), each the
// instrument of the experiment named, generalized from the committed schedule to any schedule:
//
// 1. E-FND-0117. CPT searched over the 384-element torus group, the dense check at the identity, the
//    swap-edge graph, and how many of 24 directions interact (side 9).
// 2. E-FND-0118. The vacuum's exact period from birth; the kick law over every protected species and every
//    late-birth offset 1 to 11, direction 0 on its own; interference at the first kicking offset; wall
//    content in whole side-cubed sheets and its periodicity; the dressed profile at side 21.
// 3. E-FRC-0111's travel survey: reach in 6 beats, at full speed (6 sqrt 2) and at half or more.
// 4. The vacuum's line sectors, on the empty vacuum and on a dense background.
// 5. E-FRC-0113 and E-FRC-0142's ledger: 1,152 coin permutations x 6 tone relabellings x 24 phases, forward
//    and reversal, with orientation.
// 6. E-FRC-0142's handedness: the turn's left and right SO(3) angles, the response's chiral ratio.
// 7. E-SPN-0044's spin lift: the loop of turns, the schedule's net turns, antipodal currents.
// 8. E-FRC-0141's generation copies on the 16 A2 planes.
//
// Controls, gated: the committed rule's own numbers must come back from these generalized instruments
// (CPT at the identity and phase 23, a connected swap graph, 21 interacting directions, direction 0 blind
// at offsets 1 and 2 and kicked at 7 and 11, 12 travellers at half speed, a ledger holding only the
// identity forward, turn angles 90 and 180, a chiral ratio above 2 at both sides, a loop lift of (-1, +1),
// net turns 0 with lift (+1, +1), all 16 planes split). Everything about the chosen rule and the runner-up
// is reported, not gated: this file says what changes, not whether a change is good.
//
// Depth L2: exact measurements of constructed rules with the committed rule as the reproduced control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  characterizeKnit,
  committedNumbersReproduced,
  committedSpecIsTurningWeave,
  REFERENCE_KNITS,
  type Profile,
} from '@/code/measure/knit-characterization'

export default experiment({
  id: 'gauge/color-knit-characterization',
  code: 'E-FRC-0149',
  title:
    'what changes when the knit changes: the color turn weave chosen by E-FRC-0148, and its runner-up, beside the committed turning weave through the CPT search of E-FND-0117, the battery of E-FND-0118 with the kick law and protected species, the travel survey of E-FRC-0111, the vacuum line sectors, the symmetry ledger of E-FRC-0113 and E-FRC-0142, the handedness of E-FRC-0142, the spin lift of E-SPN-0044 and the generation copies of E-FRC-0141',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const committedAsSpec = committedSpecIsTurningWeave()
    const profiles = REFERENCE_KNITS.map(c => ({ name: c.name, profile: characterizeKnit(c) }))
    const of = (name: string): Profile => profiles.find(p => p.name === name)?.profile ?? {}
    const committed = of('committed')
    const chosen = of('chosen')
    const runnerUp = of('runnerUp')
    const controlsHold = committedAsSpec && committedNumbersReproduced(committed)
    const changed = Object.keys(chosen).filter(key => chosen[key] !== committed[key])

    return verdict({
      status: controlsHold ? 'pass' : 'fail',
      claim: `the generalized instruments give back the committed knit's own numbers, and against them the chosen color-local knit differs in ${changed.length} of ${Object.keys(chosen).length} measured quantities, every one printed beside the committed value, with the runner-up printed as a third column`,
      metrics: Object.fromEntries(Object.entries(chosen).map(([k, v]) => [`chosen_${k}`, v])),
      control: {
        committedWrittenAsSpecIsTurningWeave: committedAsSpec ? 1 : 0,
        ...Object.fromEntries(Object.entries(committed).map(([k, v]) => [`committed_${k}`, v])),
        ...Object.fromEntries(Object.entries(runnerUp).map(([k, v]) => [`runnerUp_${k}`, v])),
      },
      notes: `L2, exact, no random numbers. Changed against the committed knit: ${changed.join(', ')}. Regime codes for direction 0: 0 blind, 1 a kick of one clock unit, 2 absorbing, 3 other. Sector sizes are the component sizes written as digits, largest first. The kick law is generalized from direction 0 to every species the rule keeps at support 1 for 26 beats, with the slab across each species' path and the phase compared with the same species' free run, so its counts are over (species, offset) pairs. The travel count at full speed takes a reach of exactly 6 sqrt 2 in 6 beats. The characterization is reported, not gated: whether a change is better is the user's decision.`,
    })
  },
})
