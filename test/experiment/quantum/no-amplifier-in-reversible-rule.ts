// The measurement amplifier is absent from the committed rule, and WHY: the rule does not
// scramble. This locates the dynamical ROOT of the selection obstruction E-QTM-0043 named.
//
// The measurement problem's hardest clause is SELECTION: a detector must settle to ONE
// definite branch among symmetric alternatives, and a real detector does so because a tiny
// difference in its microstate is AMPLIFIED into a macroscopic pointer. E-QTM-0043 showed the
// committed reversible rule does not select on symmetry-PROTECTED ready states, and named the
// missing ingredient exactly: "a bistable detector needs a metastable amplifier the bare rule
// lacks." E-QTM-0044 and E-QTM-0045 supplied that amplifier only with toy models (a Curie-Weiss
// mean field, a nucleation threshold), leaving the tie to the committed rule open.
//
// This experiment pins the root, measured off the actual rule, deterministic throughout:
//
//   1. NO SCRAMBLING. Flip a single slot on a generic (non-symmetric) ready state and evolve
//      the base and the flipped copy under the committed reversible rule. The fraction of slots
//      that differ stays MICROSCOPIC over the whole run (peak far below one), across lattice
//      sizes. A deterministically chaotic rule would drive that fraction toward one half (two
//      microstates decorrelate); the committed lattice gas is near-integrable, so a microscopic
//      seed never becomes a macroscopic difference. This is the dynamical reason the rule cannot
//      amplify, and it is a positive measured fact about the rule, not just a failed search.
//
//   2. NO DISSIPATIVE SELECTION. Even with dissipation (symmetric drains at both ends), generic
//      microstates all settle to the NULL pointer, and a single-slot seed shifts the settled
//      pointer negligibly. So dissipation alone does not manufacture a bistable, microstate-
//      selected branch. This extends E-QTM-0043's no-selection from symmetry-protected states to
//      generic ones. The one-sided drain is the positive control: it DOES settle a definite
//      record, so the null is a real inability to select, not a dead pointer measure.
//
//   3. SELECTION NEEDS A METASTABLE ATTRACTOR (the case that gives YES). An attractor memory
//      (the emergent deliberation layer, two stored branches) settles two distinct deterministic
//      ready states into two DISTINCT definite branches: it is bistable and selects, exactly the
//      amplifier the reversible rule lacks. This is the control that could have failed and does
//      not, and it pins the required property: a metastable bistable attractor, which a
//      reversible non-scrambling rule cannot host and which coarse-graining supplies.
//
// So the "why this branch" cannot originate in the committed reversible rule (non-scrambling)
// or in simple dissipation (drains to null); it requires the emergent metastable-attractor
// (self) layer. This sharpens E-QTM-0043 to its dynamical root and supplies the missing
// dynamical half of E-QTM-0044/0045. E-QTM-0085 then locates the amplifier inside the committed
// base itself: with the arrow (the fifth base thing) on, the ACTIVE rule scrambles and does
// amplify, so the reversible rule alone lacking the amplifier is the point, not the whole base.
//
// Grade L2: measured dynamical properties of the committed rule (bounded perturbation growth,
// dissipative null) with controls (the one-sided definite record, and the attractor that DOES
// select), tying to and sharpening the known selection obstruction. Honest negative. The
// attractor control is a MODEL of the emergent self, so this locates the amplifier and names its
// required property without yet deriving that attractor from the committed rule's own coarse-
// graining, which stays the harder open step (E-QTM-0045). The Born WEIGHTS remain separate
// (E-QTM-0005, envariance E-QTM-0012).

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  perturbationGrowth,
  settledSignedPointer,
} from '@/code/dynamics/measurement'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import {
  makeSelfPattern,
  settle,
  ternaryPattern,
  hammingFraction,
} from '@/code/model/deliberation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a deterministic GENERIC (non-symmetric) ready state: a well-mixed ternary fill from the
// stateless hash, a fixed function of position, no randomness and no imposed symmetry.
function genericWill(
  mesh: ReturnType<typeof d4Mesh>,
  salt: number,
): Will {
  const will = makeWill(mesh)

  for (let i = 0; i < will.data.length; i++) {
    const r = hashRand(i, 0, salt)
    will.data[i] = r < 0.3 ? -1 : r < 0.6 ? 1 : 0
  }

  return will
}

export default experiment({
  id: 'quantum/no-amplifier-in-reversible-rule',
  code: 'E-QTM-0084',
  title:
    'the committed reversible rule cannot amplify a microstate into a definite branch because it does not scramble: a single-slot perturbation stays microscopic across sizes and generic microstates drain to the null pointer, while a metastable attractor (the case that gives YES) does select, pinning the dynamical root of the measurement-selection obstruction',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const sides = [6, 8]
    const beats = 150

    // PART 1: no scrambling. Peak single-slot perturbation fraction across sizes and a few
    // slot positions, on a generic ready state.
    let worstPeakFraction = 0

    for (const side of sides) {
      const mesh = d4Mesh({ side })
      const degree = mesh.degree
      const opposite = Array.from({ length: degree }, (_, d) =>
        mesh.opposite(d),
      )

      const forward: Collision = pairCollision({
        opposite,
        forward: true,
      })

      const table = streamSourceTable(mesh)
      const base = genericWill(mesh, 11)

      // several distinct slot positions (a fixed deterministic spread over the array)
      const slots = [
        degree,
        Math.floor(base.data.length / 3),
        Math.floor(base.data.length / 2),
        base.data.length - degree,
      ]

      for (const slot of slots) {
        const growth = perturbationGrowth({
          init: base,
          forward,
          table,
          beats,
          slot,
        })

        worstPeakFraction = Math.max(
          worstPeakFraction,
          growth.peakFraction,
        )
      }
    }

    // PART 2: no dissipative selection. Generic microstates with symmetric drains settle to
    // the null pointer, and a single-slot seed does not tip the branch. The one-sided drain
    // is the positive control (it DOES settle a definite record).
    const side = 6
    const mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })

    const table = streamSourceTable(mesh)

    // three distinct deterministic generic microstates (varied by a fixed index, not a seed)
    const microstates = [21, 22, 23].map(salt =>
      genericWill(mesh, salt),
    )

    let worstSymmetricPointer = 0
    let worstSeedShift = 0

    for (const state of microstates) {
      const bare = settledSignedPointer({
        init: cloneWill(state),
        forward,
        table,
        beats,
        drains: [0, side - 1],
      })

      worstSymmetricPointer = Math.max(
        worstSymmetricPointer,
        Math.abs(bare),
      )

      const seeded = cloneWill(state)
      seeded.data[degree] = ((seeded.data[degree]! + 2) % 3) - 1

      const tipped = settledSignedPointer({
        init: seeded,
        forward,
        table,
        beats,
        drains: [0, side - 1],
      })

      worstSeedShift = Math.max(worstSeedShift, Math.abs(tipped - bare))
    }

    // the one-sided drain settles a DEFINITE record on a generic state (the pointer works)
    const oneSidedRecord = Math.abs(
      settledSignedPointer({
        init: genericWill(mesh, 21),
        forward,
        table,
        beats,
        drains: [0],
      }),
    )

    // PART 3: selection needs a metastable attractor. Two stored branches, two distinct
    // deterministic ready states leaning each way, settle to two DISTINCT definite branches.
    const n = 240
    const patterns = makeSelfPattern({ n, patterns: 2, offset: 0 })
    const branchA = patterns[0]!
    const branchB = patterns[1]!
    const noUrge = new Int8Array(n)

    // a start biased toward each stored branch (a deterministic lean, half the pattern shown)
    const leanTo = (pattern: Int8Array): Int8Array => {
      const start = ternaryPattern(n, 4242)

      for (let i = 0; i < n / 2; i++) {
        start[i] = pattern[i]!
      }

      return start
    }

    const settledA = settle({
      patterns,
      coupling: 2,
      urge: noUrge,
      urgeWeight: 1,
      init: leanTo(branchA),
    }).state

    const settledB = settle({
      patterns,
      coupling: 2,
      urge: noUrge,
      urgeWeight: 1,
      init: leanTo(branchB),
    }).state

    // determinism of the attractor: the same start settles identically twice
    const settledArepeat = settle({
      patterns,
      coupling: 2,
      urge: noUrge,
      urgeWeight: 1,
      init: leanTo(branchA),
    }).state

    const attractorDeterministic =
      hammingFraction(settledA, settledArepeat) < 1e-12

    // the two branches are genuinely distinct, and each sits in a distinct stored basin
    const branchSeparation = hammingFraction(settledA, settledB)
    const aInBasinA =
      hammingFraction(settledA, branchA) <
      hammingFraction(settledA, branchB)

    const bInBasinB =
      hammingFraction(settledB, branchB) <
      hammingFraction(settledB, branchA)

    const attractorSelects =
      branchSeparation > 0.3 && aInBasinA && bInBasinB

    // the gates
    const ruleDoesNotScramble = worstPeakFraction < 0.02
    const noDissipativeSelection =
      worstSymmetricPointer < 0.02 && worstSeedShift < 0.02

    const pointerMeasureWorks = oneSidedRecord > 0.05

    const ok =
      ruleDoesNotScramble &&
      noDissipativeSelection &&
      pointerMeasureWorks &&
      attractorDeterministic &&
      attractorSelects

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed reversible rule cannot provide the measurement amplifier because it does not scramble: a single-slot perturbation on a generic ready state keeps the differing-slot fraction microscopic over the whole run across sizes (a chaotic rule would reach one half), and even with symmetric dissipative drains generic microstates all settle to the null pointer with a single-slot seed shifting it negligibly, while a one-sided drain still settles a definite record (the pointer measure works), so selection cannot come from the bare rule or simple dissipation; a metastable bistable attractor DOES select two distinct deterministic ready states into two distinct definite branches, pinning the required ingredient and the dynamical root of the E-QTM-0043 obstruction',
      metrics: {
        worstPeakPerturbationFraction: Number(
          worstPeakFraction.toExponential(2),
        ),
        worstSymmetricPointer: Number(
          worstSymmetricPointer.toExponential(2),
        ),
        worstSeedShift: Number(worstSeedShift.toExponential(2)),
        attractorBranchSeparation: Number(branchSeparation.toFixed(3)),
      },
      control: {
        // the one-sided drain settles a definite record (piece one works, so the null is a
        // real inability to select), and the attractor DOES select (the amplifier the rule
        // lacks), so both the no-selection and the required-ingredient are controlled.
        oneSidedDefiniteRecord: Number(oneSidedRecord.toFixed(4)),
        attractorBranchSeparation: Number(branchSeparation.toFixed(3)),
      },
      notes:
        'L2, measured on the committed reversible rule (pairCollision + stream, deterministic, exact integer slot counts, no randomness). Part 1 measures the scrambling diagnostic perturbationGrowth (peak differing-slot fraction after a single-slot flip): it stays near 1e-4 across sides 6 and 8 and four slot positions, so the rule is near-integrable (HPP-family) and cannot amplify; a chaotic rule would reach about 0.5. Part 2 extends E-QTM-0043 no-selection to generic (non-symmetric) states under symmetric drains (all drain to the null pointer, seed shift negligible), with the one-sided drain as the positive control that DOES register a definite record. Part 3 is the case that gives YES: an attractor memory (the deliberation layer, a MODEL of the emergent self) is bistable and selects two distinct deterministic ready states into two distinct definite branches, deterministically, which pins the required ingredient (a metastable bistable attractor) that the reversible rule lacks and coarse-graining supplies. This sharpens the E-QTM-0043 selection obstruction to its dynamical root (integrability, no chaos) and supplies the missing dynamical half of E-QTM-0044/0045. It does NOT derive the attractor from the committed rule coarse-graining (the open step, E-QTM-0045), and the Born weights stay separate (E-QTM-0005, E-QTM-0012).',
    })
  },
})
