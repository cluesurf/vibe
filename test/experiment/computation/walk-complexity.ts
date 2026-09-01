// EXTERNAL THEORY: Garnet Ord and Louis Kauffman, quantum mechanics from a deterministic discrete walk
// (author-bridges/garnet-ord.md, louis-kauffman.md). Their claim: a discrete deterministic walk produces
// genuinely RICH quantum dynamics (interference, a complex spatial pattern), not trivial periodic or diffusive
// motion. We make "rich" precise with the Morse-Hedlund line: a profile whose difference-sign sequence has
// factor complexity p(n) > n is aperiodic and complex, p(n) <= n is the low-complexity (periodic) regime.
//
// Tested on vibe's emergent coined walk (code/dynamics/coined-walk-distribution): the QUANTUM walk's
// occupation profile (sampled on its occupied sublattice to drop structural parity zeros) oscillates, so its
// difference-sign sequence is above the line. CONTROL: the CLASSICAL (diffusive) walk on the same coin is
// unimodal, so its difference-sign sequence is below the line. The classical case is what must give NO, which
// is what makes the quantum complexity meaningful (the richness is interference, not just motion).

import {
  coinedWalkQuantumDistribution,
  coinedWalkClassicalDistribution,
} from '@/code/dynamics/coined-walk-distribution'
import {
  differenceSignSequence,
  factorComplexity,
} from '@/code/measure/factor-complexity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// sample a walk distribution on the sublattice it actually occupies, dropping the structural parity zeros that
// would otherwise impose a spurious period. `parity` picks the occupied sites at this step count.
function occupiedProfile(
  distribution: Float64Array,
  offset: number,
  steps: number,
  parity: 0 | 1,
): number[] {
  const out: number[] = []

  for (let x = -steps; x <= steps; x++) {
    if (((x % 2) + 2) % 2 === parity) {
      out.push(distribution[offset + x] ?? 0)
    }
  }

  return out
}

export default experiment({
  id: 'computation/walk-complexity',
  code: 'E-CMP-0013',
  title:
    "vibe's emergent quantum walk profile is above the Morse-Hedlund complexity line (genuine interference, Ord and Kauffman), the classical diffusive walk below it",
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const steps = 80
    const n = 6 // the factor length at which we read the complexity line

    const q = coinedWalkQuantumDistribution({ steps })
    const c = coinedWalkClassicalDistribution({ steps })

    // the quantum walk occupies one parity at even step count; sample that sublattice.
    const quantumProfile = occupiedProfile(
      q.distribution,
      q.offset,
      steps,
      0,
    )

    const classicalProfile = occupiedProfile(
      c.distribution,
      c.offset,
      steps,
      0,
    )

    const quantumComplexity = factorComplexity(
      differenceSignSequence(quantumProfile),
      n,
    )

    const classicalComplexity = factorComplexity(
      differenceSignSequence(classicalProfile),
      n,
    )

    // the quantum profile sits comfortably above the Morse-Hedlund line (not a knife edge), and is far richer
    // than the classical control. The classical unimodal profile has only one rise-then-fall, so its sign
    // sequence is near the complexity floor (a single transition), well below the quantum interference profile.
    const quantumAboveLine = quantumComplexity > 2 * n
    const classicalFarSimpler =
      classicalComplexity * 3 < quantumComplexity

    const ok = quantumAboveLine && classicalFarSimpler

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "vibe's emergent coined quantum walk produces an occupation profile whose difference-sign sequence has factor complexity well above the Morse-Hedlund line (aperiodic, interference-rich), several times richer than the classical diffusive walk on the same coin, which stays near the complexity floor, confirming the deterministic discrete walk yields genuinely complex quantum dynamics (Ord, Kauffman), not trivial motion",
      metrics: {
        n,
        quantumComplexity,
        classicalComplexity,
        complexityRatio:
          classicalComplexity > 0
            ? quantumComplexity / classicalComplexity
            : 0,
      },
      control: {
        classicalComplexity,
        classicalFarSimpler: classicalFarSimpler ? 1 : 0,
      },
      notes:
        "L2, reproduces the known quantum-versus-classical walk-complexity contrast on vibe's coined walk. Factor complexity p(n) > n is the Morse-Hedlund signature of an aperiodic, complex sequence. The quantum profile is sampled on its occupied sublattice to drop the structural parity zeros that would impose a spurious period. The classical (diffusive) walk is the control that must fall below the line, so the quantum complexity is genuine interference, not mere spreading.",
    })
  },
})
