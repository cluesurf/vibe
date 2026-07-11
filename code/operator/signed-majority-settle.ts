// Asynchronous (Hopfield-style) relaxation of the ternary signed-majority rule.
// One cell is picked at random per micro-update; its tone is set to the sign of its
// local field (sum over incident edges of coupling times neighbour tone). On a tie
// (zero field) the current tone is kept, which removes the energy-neutral plateau of
// the 0-state so symmetric couplings drive the dynamics to a genuine fixed point.
// With symmetric per-edge couplings this monotonically lowers the Hopfield energy and
// converges. Returns the converged state and the flip fraction in the final sweep
// (0 means a fixed point was reached).

import { Graph } from '@/code/tool/graph'
import { Rng } from '@/code/tool/rng'

export function settleAsync(input: {
  graph: Graph
  fills: Int8Array[]
  init: Int8Array
  sweeps: number
  rng: Rng
}): { state: Int8Array; finalFlip: number } {
  const { graph, fills, init, sweeps, rng } = input
  const n = graph.size
  const t = Int8Array.from(init)

  let finalFlip = 1

  for (let sweep = 0; sweep < sweeps; sweep++) {
    let flips = 0

    for (let s = 0; s < n; s++) {
      const v = rng.nextInt({ max: n })
      const nb = graph.neighbors[v] ?? new Uint32Array(0)
      const fl = fills[v] ?? new Int8Array(0)

      let h = 0

      for (let k = 0; k < nb.length; k++)
        h += (fl[k] ?? 0) * (t[nb[k] ?? 0] ?? 0)

      const nt: -1 | 0 | 1 =
        h > 0 ? 1 : h < 0 ? -1 : ((t[v] ?? 0) as -1 | 0 | 1)

      if (nt !== t[v]) {
        flips++
      }

      t[v] = nt
    }

    finalFlip = flips / Math.max(1, n)
  }

  return { state: t, finalFlip }
}
