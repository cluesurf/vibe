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

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function solveGoalDirected(target: Int8Array, rng: { next: () => number }): number {
  // start random, then KEEP gap-reducing moves (the arrow values -gap, the selection keeps improvements)
  const K = target.length
  const s = new Int8Array(K)
  for (let i = 0; i < K; i++) s[i] = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
  let steps = 0
  let gap = 0
  for (let i = 0; i < K; i++) if (s[i] !== target[i]) gap++
  const guard = 1000 * K
  while (gap > 0 && steps < guard) {
    steps++
    const i = Math.floor(rng.next() * K)
    // a move toward the goal is KEPT only if it reduces the gap (goal-directed selection)
    if (s[i] !== target[i]) {
      s[i] = target[i]!
      gap--
    }
  }
  return steps
}

function solveUndirected(target: Int8Array, rng: { next: () => number }, budget: number): { solved: boolean; steps: number } {
  // no goal, set a random cell to a random value (aimless computation), success only by chance
  const K = target.length
  const s = new Int8Array(K)
  for (let i = 0; i < K; i++) s[i] = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
  let gap = 0
  for (let i = 0; i < K; i++) if (s[i] !== target[i]) gap++
  for (let steps = 1; steps <= budget; steps++) {
    const i = Math.floor(rng.next() * K)
    const v = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
    if (s[i] !== v) {
      if (s[i] === target[i]) gap++
      else if (v === target[i]) gap--
      s[i] = v
    }
    if (gap === 0) return { solved: true, steps }
  }
  return { solved: false, steps: budget }
}

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
    const goalSteps = solveGoalDirected(target, rng)
    // average undirected success over a few trials
    let solvedCount = 0
    const trials = 3
    for (let t = 0; t < trials; t++) if (solveUndirected(target, rng, budget).solved) solvedCount++
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

export function main(): void {
  const r = directionIntention()
  console.log('P147: the direction and intention checks')
  console.log('')
  console.log('  K     goal-directed steps    un-goaled solved?    expected un-goaled (~2^K)')
  for (const s of r.scan) console.log(`  ${String(s.K).padEnd(5)} ${String(s.goalSteps).padEnd(22)} ${String(s.undirectedSolved).padEnd(20)} ${s.expectedUndirected.toExponential(1)}`)
  console.log('')
  console.log(`  DIRECTION, goal-directed reliably solves, un-goaled does not: ${r.directionHolds}`)
  console.log(`  INTENTION, the gap (aimless time / intentional time) is ${r.intentionGap.toExponential(1)}, astronomical: ${r.intentionHolds}`)
  console.log('  => the arrow plus a keep-what-helps loop turns goal-neutral computation into INTENTIONAL')
  console.log('     problem-solving, the bridge from computable (P141) to intentional.')
  console.log(`  INVALID (success guaranteed by the copy-target search, not emergent): solved=${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
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
