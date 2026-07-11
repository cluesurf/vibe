// Parallel tempering (replica exchange) for the causal-set sum over histories.
// A single chain gets stuck in a metastable basin near a first-order transition,
// which is exactly what confounded the warm-start study of P2. Here we run R
// replicas at a ladder of inverse temperatures, let each do local moves, and
// periodically swap adjacent replicas. Configurations migrate across the ladder
// and escape basins, giving true equilibrium. See p2-p6-optimal-path.md.

import { Poset, makePosetFromFuture } from '@/code/tool/poset'
import { Rng } from '@/code/tool/rng'
import { Action } from '@/code/dynamics/action'
import {
  State,
  makeState,
  isRelated,
  toggleKeepsValid,
  toggle,
} from '@/code/dynamics/uniform-sampler'

type Replica = {
  state: State
  poset: Poset
  action: number
}

// One local Metropolis move on a replica at its own beta. Toggle a SINGLE pair,
// keep it only if the result is still a transitive poset, and accept by the
// Euclidean weight. This is the symmetric single-pair move that samples the correct
// causal-set measure (the earlier raw-bit-then-closure move was multiplicity-biased,
// see mcmc.ts and uniform-sampler.ts).
function localMove(input: {
  replica: Replica
  size: number
  beta: number
  action: Action
  rng: Rng
}): void {
  const { replica, size, beta, action, rng } = input
  const a = rng.nextInt({ max: size })

  let b = rng.nextInt({ max: size })

  if (a === b) {
    b = (b + 1) % size
  }

  const lo = Math.min(a, b)
  const hi = Math.max(a, b)

  if (lo === hi) {
    return
  }

  const related = isRelated(replica.state, lo, hi)

  // A move that would break transitivity is rejected (the replica stays).
  if (!toggleKeepsValid(replica.state, lo, hi, related)) {
    return
  }

  toggle(replica.state, lo, hi)

  const candidatePoset = makePosetFromFuture({
    size,
    future: replica.state.future,
  })

  const candidateAction = action.value({ poset: candidatePoset })
  const deltaS = candidateAction - replica.action

  if (deltaS <= 0 || rng.next() < Math.exp(-beta * deltaS)) {
    replica.poset = candidatePoset
    replica.action = candidateAction
  } else {
    toggle(replica.state, lo, hi)
  } // revert
}

// Run parallel tempering. Returns, per beta slot, the samples of an observable
// taken in the second (equilibrated) half of the run, plus the swap acceptance.
export function parallelTempering(input: {
  size: number
  betas: readonly number[]
  action: Action
  sweeps: number
  movesPerSweep: number
  observe: (input: { poset: Poset }) => number
  rng: Rng
  start?: Poset
}): { samplesByBeta: number[][]; swapAcceptance: number } {
  const n = input.size
  const R = input.betas.length

  const replicas: Replica[] = []

  for (let r = 0; r < R; r++) {
    const state = makeState(n, input.start?.future)

    const poset = makePosetFromFuture({
      size: n,
      future: state.future,
    })

    replicas.push({
      state,
      poset,
      action: input.action.value({ poset }),
    })
  }

  const samplesByBeta: number[][] = input.betas.map(() => [])

  let swapAttempts = 0
  let swapAccepts = 0

  const burnIn = Math.floor(input.sweeps / 2)

  for (let sweep = 0; sweep < input.sweeps; sweep++) {
    // Local moves in every replica.
    for (let r = 0; r < R; r++) {
      const replica = replicas[r]
      const beta = input.betas[r]

      if (!replica || beta === undefined) {
        continue
      }

      for (let m = 0; m < input.movesPerSweep; m++) {
        localMove({
          replica,
          size: n,
          beta,
          action: input.action,
          rng: input.rng,
        })
      }
    }

    // Swap adjacent replicas. Alternate the starting parity each sweep.
    const startPair = sweep % 2

    for (let r = startPair; r + 1 < R; r += 2) {
      const ra = replicas[r]
      const rb = replicas[r + 1]
      const ba = input.betas[r]
      const bb = input.betas[r + 1]

      if (!ra || !rb || ba === undefined || bb === undefined) {
        continue
      }

      swapAttempts += 1

      // Accept with min(1, exp((beta_a - beta_b)(S_a - S_b))).
      const delta = (ba - bb) * (ra.action - rb.action)

      if (delta >= 0 || input.rng.next() < Math.exp(delta)) {
        replicas[r] = rb
        replicas[r + 1] = ra
        swapAccepts += 1
      }
    }

    // Record observables at each beta slot after burn-in.
    if (sweep >= burnIn) {
      for (let r = 0; r < R; r++) {
        const replica = replicas[r]

        if (replica) {
          ;(samplesByBeta[r] ?? []).push(
            input.observe({ poset: replica.poset }),
          )
        }
      }
    }
  }

  return {
    samplesByBeta,
    swapAcceptance: swapAttempts > 0 ? swapAccepts / swapAttempts : 0,
  }
}
