// P147: the direction and intention checks. (computable-to-intentional.md.)
//
// INVALID / CIRCULAR (audit June 2026): the goal-directed search moves by COPYING the target bit, so the gap
// can only decrease and reaching the target is GUARANTEED BY CONSTRUCTION. This does NOT show the substrate
// emergently solves problems, the intention is the added search loop, not emergent from the five base things.
// Kept for the record, NOT evidence.
//
// Universal computation (P141) is goal-NEUTRAL, it can compute anything but has no reason to compute the
// SOLUTION rather than garbage. Adding the arrow (a goal-and-value) plus a selection loop (keep
// gap-reducing moves) turns computation into INTENTIONAL problem-solving. We verify both:
//   DIRECTION (Way 0), a goal-directed search reliably reaches a target pattern that an un-goaled search
//     does not, computation becomes goal-directed.
//   INTENTION, the goal-directed search solves in ~K steps a problem the un-goaled machine would only
//     solve by astronomically-unlikely chance (~2^K), the gap between aimless and intentional, quantified.
// The target is a pattern of K cells, the gap is the Hamming distance to it. Run: npx tsx code/experiment/p147-direction-intention.ts

import { makeRng } from '@/code/tool/rng'
import { solveGoalDirected, solveUndirected } from '@/code/dynamics/goal-directed-search'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function directionIntention(): {
  scan: { K: number; goalSteps: number; undirectedSolved: boolean; expectedUndirected: number }[]
  directionHolds: boolean
  intentionGap: number
  intentionHolds: boolean
  solved: boolean
} {
  const Ks = [10, 20, 30]
  const budget = 200000
  const rng = makeRng({ seed: 7 })
  const scan = Ks.map((K) => {
    const target = new Int8Array(K)
    for (let i = 0; i < K; i++) target[i] = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
    const goalSteps = solveGoalDirected({ target, rng })
    // average undirected success over a few trials
    let solvedCount = 0
    const trials = 3
    for (let t = 0; t < trials; t++) if (solveUndirected({ target, rng, budget }).solved) solvedCount++
    return { K, goalSteps, undirectedSolved: solvedCount > trials / 2, expectedUndirected: Math.pow(2, K) }
  })

  const last = scan[scan.length - 1]!
  // DIRECTION, the goal-directed search solves every K (roughly linear), the un-goaled fails on the large K
  const directionHolds = scan.every((s) => s.goalSteps < 50 * s.K) && !last.undirectedSolved
  // INTENTION, for the large K the expected aimless time vastly exceeds the goal-directed time
  const intentionGap = last.expectedUndirected / Math.max(last.goalSteps, 1)
  const intentionHolds = intentionGap > 1e6 // astronomical
  const solved = directionHolds && intentionHolds

  return { scan, directionHolds, intentionGap, intentionHolds, solved }
}

export default experiment({
  id: 'computation/direction-intention',
  title: 'a goal-directed search solves in K steps while an un-goaled one fails',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = directionIntention()
    const ok = r.solved && r.directionHolds && r.intentionHolds
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a goal-directed search reaches a K-cell target in about K steps while an un-goaled search needs about 2^K and fails',
      metrics: { intentionGap: r.intentionGap },
      notes:
        'invalid / circular, the goal-directed search reaches the target by construction, so this is not evidence the substrate emergently solves problems',
    })
  },
})
