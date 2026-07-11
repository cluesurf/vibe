// Metropolis Monte Carlo over labelled causal sets: the testbed's approximation
// of Bombelli's sum over histories. We use the Euclidean-style reweighting
// (weight e^{-beta*S} rather than the oscillatory e^{iS}) so the chain actually
// converges.

import { Poset, makePosetFromFuture } from '@/code/tool/poset'
import { BitMatrix, makeBitMatrix, getBit } from '@/code/tool/bitset'
import { Rng } from '@/code/tool/rng'
import { Action } from '@/code/dynamics/action'
import {
  makeState,
  isRelated,
  toggleKeepsValid,
  toggle,
} from '@/code/dynamics/uniform-sampler'

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
export function transitiveClosure(input: {
  size: number
  relation: BitMatrix
}): BitMatrix {
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
          (closed.words[aBase + w] ?? 0) |
          (closed.words[kBase + w] ?? 0)
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
}): {
  meanObservable: number
  acceptanceRate: number
  trace: Float64Array
} {
  const n = input.size

  // The state is a VALID (transitive) poset throughout, held as future/past bitsets.
  // A move toggles a SINGLE pair and is accepted only if the result is still
  // transitive (toggleKeepsValid). That proposal is symmetric over valid posets, so
  // with the weight e^{-beta S} the chain samples the causal-set Gibbs ensemble. The
  // earlier move (toggle a raw bit then take the transitive closure) changed many
  // pairs at once, and because closure is many-to-one it sampled a multiplicity-
  // biased measure rather than the intended one. The single-pair move (the same one
  // uniform-sampler uses) fixes that.
  const state = makeState(n, input.start?.future)

  let poset = makePosetFromFuture({ size: n, future: state.future })
  let currentAction = input.action.value({ poset })

  const traceValues: number[] = []
  // Discard the first half so the chain has left the start configuration before any
  // observable is recorded (the earlier sampler recorded from step zero).
  const burnIn = Math.floor(input.steps / 2)

  let observeCounter = 0
  let accepted = 0
  let proposed = 0

  for (let step = 0; step < input.steps; step++) {
    // Propose a single pair a < b uniformly.
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

    const related = isRelated(state, lo, hi)

    // A move that would break transitivity is an invalid proposal, rejected (the
    // chain stays where it is), exactly like a Metropolis rejection.
    if (toggleKeepsValid(state, lo, hi, related)) {
      toggle(state, lo, hi)

      const candidatePoset = makePosetFromFuture({
        size: n,
        future: state.future,
      })

      const candidateAction = input.action.value({
        poset: candidatePoset,
      })

      const deltaS = candidateAction - currentAction

      // Metropolis acceptance with the Euclidean weight e^{-beta*S}.
      if (
        deltaS <= 0 ||
        input.rng.next() < Math.exp(-input.beta * deltaS)
      ) {
        poset = candidatePoset
        currentAction = candidateAction
        accepted += 1
      } else {
        toggle(state, lo, hi)
      } // revert
    }

    observeCounter += 1

    if (step >= burnIn && observeCounter >= OBSERVE_EVERY) {
      observeCounter = 0
      traceValues.push(input.observe({ poset }))
    }
  }

  const trace = Float64Array.from(traceValues)

  let sum = 0

  for (const value of trace) {
    sum += value ?? 0
  }

  const meanObservable = trace.length > 0 ? sum / trace.length : 0
  const acceptanceRate = proposed > 0 ? accepted / proposed : 0

  return { meanObservable, acceptanceRate, trace }
}
