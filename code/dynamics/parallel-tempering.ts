// Parallel tempering (replica exchange) for the causal-set sum over histories.
// A single chain gets stuck in a metastable basin near a first-order transition,
// which is exactly what confounded the warm-start study of P2. Here we run R
// replicas at a ladder of inverse temperatures, let each do local moves, and
// periodically swap adjacent replicas. Configurations migrate across the ladder
// and escape basins, giving true equilibrium. See p2-p6-optimal-path.md.

import { Poset, makePosetFromFuture } from '~/core/poset'
import { BitMatrix, makeBitMatrix } from '~/core/bitset'
import { Rng } from '~/core/rng'
import { Action } from '~/dynamics/action'
import { transitiveClosure } from '~/dynamics/mcmc'

interface Replica {
  relation: BitMatrix
  poset: Poset
  action: number
}

// One local Metropolis move on a replica at its own beta: toggle a raw relation
// bit, rebuild the closure, and accept by the Euclidean weight.
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
  const i = lo * replica.relation.stride + (hi >>> 5)
  const bit = 1 << (hi & 31)
  replica.relation.words[i] = (replica.relation.words[i] ?? 0) ^ bit

  const candidatePoset = makePosetFromFuture({
    size,
    future: transitiveClosure({ size, relation: replica.relation }),
  })
  const candidateAction = action.value({ poset: candidatePoset })
  const deltaS = candidateAction - replica.action
  if (deltaS <= 0 || rng.next() < Math.exp(-beta * deltaS)) {
    replica.poset = candidatePoset
    replica.action = candidateAction
  } else {
    replica.relation.words[i] = (replica.relation.words[i] ?? 0) ^ bit
  }
}

// Run parallel tempering. Returns, per beta slot, the samples of an observable
// taken in the second (equilibrated) half of the run, plus the swap acceptance.
export function parallelTempering(input: {
  size: number
  betas: ReadonlyArray<number>
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
    const relation = makeBitMatrix({ rows: n, cols: n })
    if (input.start) {
      for (let i = 0; i < relation.words.length; i++) {
        relation.words[i] = input.start.future.words[i] ?? 0
      }
    }
    const poset = makePosetFromFuture({
      size: n,
      future: transitiveClosure({ size: n, relation }),
    })
    replicas.push({ relation, poset, action: input.action.value({ poset }) })
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
        localMove({ replica, size: n, beta, action: input.action, rng: input.rng })
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
          ;(samplesByBeta[r] ?? []).push(input.observe({ poset: replica.poset }))
        }
      }
    }
  }

  return {
    samplesByBeta,
    swapAcceptance: swapAttempts > 0 ? swapAccepts / swapAttempts : 0,
  }
}
