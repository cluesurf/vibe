// Metropolis Monte Carlo over labelled causal sets: the testbed's approximation
// of Bombelli's sum over histories. We use the Euclidean-style reweighting
// (weight e^{-beta*S} rather than the oscillatory e^{iS}) so the chain actually
// converges.

import { Poset, makePosetFromFuture } from '~/tool/poset'
import { BitMatrix, makeBitMatrix, getBit } from '~/tool/bitset'
import { Rng } from '~/tool/rng'
import { Action } from '~/dynamics/action'

// How often (in steps) we record the observable into the trace.
const OBSERVE_EVERY = 1

// Toggle the relation bit a -> b on a fixed labelling (a < b), then repair
// transitivity by recomputing the transitive closure over the labelling.
//
// Cost note: the repair is a Floyd-Warshall-style closure restricted to the
// total labelling order, O(size^3) per accepted move. That is the dominant cost,
// so this sampler is meant for modest size (<= ~200). Because a can only precede
// b when a < b, the relation is a strict upper-triangular DAG and acyclicity is
// automatic; closure is all the repair we need.
export function transitiveClosure(input: { size: number; relation: BitMatrix }): BitMatrix {
  const n = input.size
  const closed = makeBitMatrix({ rows: n, cols: n })
  const stride = closed.stride
  // Copy the raw relation into the working matrix.
  for (let i = 0; i < closed.words.length; i++) {
    closed.words[i] = input.relation.words[i] ?? 0
  }
  // Warshall: for each intermediate k, if a -> k then a inherits k's row.
  for (let k = 0; k < n; k++) {
    const kBase = k * stride
    for (let a = 0; a < n; a++) {
      if (!getBit(closed, { row: a, col: k })) {
        continue
      }
      const aBase = a * stride
      for (let w = 0; w < stride; w++) {
        closed.words[aBase + w] =
          (closed.words[aBase + w] ?? 0) | (closed.words[kBase + w] ?? 0)
      }
    }
  }
  return closed
}

export function sampleCausalSets(input: {
  size: number
  action: Action
  beta: number
  steps: number
  rng: Rng
  observe: (input: { poset: Poset }) => number
  // Optional warm start: begin from this order rather than the antichain. Its
  // labelling must be topological (a precedes b implies a < b), as sprinklings and
  // the layered-order generator both are.
  start?: Poset
}): { meanObservable: number; acceptanceRate: number; trace: Float64Array } {
  const n = input.size

  // The current order as a raw (untransitively-closed) relation on the labelling
  // a < b. We keep the raw relation so a toggle is a single bit flip; the closure
  // is rebuilt for evaluation and on accept.
  const relation = makeBitMatrix({ rows: n, cols: n })
  if (input.start) {
    // Seed the relation from the warm-start order's (already transitive) future.
    for (let i = 0; i < relation.words.length; i++) {
      relation.words[i] = input.start.future.words[i] ?? 0
    }
  }

  // Build the Poset for the current state from the transitive closure.
  let poset = makePosetFromFuture({
    size: n,
    future: transitiveClosure({ size: n, relation }),
  })
  let currentAction = input.action.value({ poset })

  const traceValues: number[] = []
  let observeCounter = 0
  let accepted = 0
  let proposed = 0

  for (let step = 0; step < input.steps; step++) {
    // Propose a move: pick a < b uniformly and toggle the raw relation bit.
    const a = input.rng.nextInt({ max: n })
    let b = input.rng.nextInt({ max: n })
    if (a === b) {
      b = (b + 1) % n
    }
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    if (lo === hi) {
      continue
    }
    proposed += 1

    // Toggle the raw bit (in place). A fresh closure derives the consequences.
    const i = lo * relation.stride + (hi >>> 5)
    relation.words[i] = (relation.words[i] ?? 0) ^ (1 << (hi & 31))

    const candidatePoset = makePosetFromFuture({
      size: n,
      future: transitiveClosure({ size: n, relation }),
    })
    const candidateAction = input.action.value({ poset: candidatePoset })
    const deltaS = candidateAction - currentAction

    // Metropolis acceptance with the Euclidean weight e^{-beta*S}.
    const accept =
      deltaS <= 0 || input.rng.next() < Math.exp(-input.beta * deltaS)

    if (accept) {
      poset = candidatePoset
      currentAction = candidateAction
      accepted += 1
    } else {
      // Revert the raw bit toggle.
      relation.words[i] = (relation.words[i] ?? 0) ^ (1 << (hi & 31))
    }

    observeCounter += 1
    if (observeCounter >= OBSERVE_EVERY) {
      observeCounter = 0
      traceValues.push(input.observe({ poset }))
    }
  }

  const trace = Float64Array.from(traceValues)
  let sum = 0
  for (let t = 0; t < trace.length; t++) {
    sum += trace[t] ?? 0
  }
  const meanObservable = trace.length > 0 ? sum / trace.length : 0
  const acceptanceRate = proposed > 0 ? accepted / proposed : 0

  return { meanObservable, acceptanceRate, trace }
}
