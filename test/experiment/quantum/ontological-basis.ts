// 't Hooft's ontological basis: in the Cellular Automaton Interpretation of quantum mechanics the
// deterministic microscopic law permutes a preferred set of ontological basis states (the beables),
// so every state lies on a finite cycle, information is never lost, and quantum superpositions are
// epistemic distributions over the beables rather than new ontological states. Gerard 't Hooft
// argues a reversible cellular automaton underlies quantum mechanics, and the committed rule is
// exactly such an automaton: it permutes the microstates.
//
// The committed reversible rule is a permutation of microstates on two counts. It is injective (it
// maps two distinct microstates to distinct successors, so it has an inverse), and iterating it
// returns any microstate to itself after a finite period (a beable cycle, Poincare recurrence). The
// preferred basis is the definite occupation microstate, and the dynamics shuffles those states
// among themselves.
//
// Measured on a small mesh: the pattern-filled microstate recurs after a finite period (a closed
// beable orbit), and the rule is injective (a state and its single-slot neighbor stay distinct after
// one beat). Both are the permutation signature.
//
// The control is the same rule with an information sink (one slot clamped to zero each beat, a
// dissipative measurement). It destroys information, so the microstate never recurs within a very
// long run, no beable cycle, not a permutation. So the ontological basis is specifically the payoff
// of reversibility, exactly 't Hooft's requirement that the underlying automaton preserve
// information.
//
// Depth L2. It measures the permutation signature (finite recurrence plus injectivity) of the
// committed rule against a lossy control, a model of 't Hooft's ontological basis. Distinct from the
// emergent no-cloning result (E-FND-0065, which reads unitarity on the emergent walk): this is the
// microscopic beable-permutation structure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { recurrencePeriod, ruleInjective } from '@/code/dynamics/permutation-orbit'

const SIDE = 3
const LIMIT = 200000

export default experiment({
  id: 'quantum/ontological-basis',
  code: 'E-QTM-0052',
  title:
    'the reversible rule permutes the microstates (finite recurrence plus injectivity, a beable cycle) while a lossy rule never recurs, the t Hooft ontological basis',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const reversiblePeriod = recurrencePeriod({ side: SIDE, limit: LIMIT, sink: false })
    const reversibleInjective = ruleInjective({ side: SIDE, sink: false })

    // control: the same rule with an information sink destroys the beable cycle
    const lossyPeriod = recurrencePeriod({ side: SIDE, limit: LIMIT, sink: true })

    const permutes = reversiblePeriod > 0 && reversibleInjective
    const lossyNeverRecurs = lossyPeriod === -1
    const ok = permutes && lossyNeverRecurs

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed reversible rule permutes the microstates: it is injective (a state and its single-slot neighbor stay distinct after one beat, so it has an inverse) and iterating it returns the microstate to itself after a finite period (a closed beable cycle, Poincare recurrence), so the preferred basis of definite occupation microstates is an ontological basis the dynamics shuffles among itself, exactly the Cellular Automaton Interpretation, while the same rule with an information sink never recurs within a very long run (no beable cycle), so the ontological basis is the payoff of reversibility',
      metrics: {
        reversiblePeriod,
        reversibleInjective: reversibleInjective ? 1 : 0,
        lossyPeriod,
      },
      // CONTROL: the lossy rule (information sink) never recurs, not a permutation.
      control: { lossyPeriod },
      notes:
        "'t Hooft Cellular Automaton Interpretation. The reversible rule permutes the ontological beable basis (finite recurrence, injective); a lossy rule destroys the cycle. Superposition is epistemic over the beables. Distinct from emergent no-cloning (E-FND-0065).",
    })
  },
})
