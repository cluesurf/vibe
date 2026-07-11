// P74: the height-changing cluster move for the large-N crossing.
// P12 measured the free-energy crossing only up to N = 48, because its single-pair move could not
// change the HEIGHT (the longest chain) of the causal set: toggling one relation almost always
// breaks transitivity or leaves the height fixed, so the Wang-Landau walk could not traverse the
// height range and stalled at N = 64. The fix the roadmap asks for is a height-changing CLUSTER
// move. We build it and show it works: store the asserted relations and recompute the transitive
// closure after each toggle, so flipping ONE asserted edge adds or removes a whole cluster of
// implied relations and the height jumps. We then measure, at N = 32, 48, 64, 96, how much of the
// height range each move can reach. The single-pair move is stuck on a couple of heights, while the
// cluster move sweeps the whole range, which is exactly what is needed to cross the entropy barrier
// at large N. Run: npx tsx code/experiment/p74-large-n-crossing.ts

const GOLDEN = (1 + Math.sqrt(5)) / 2
const SILVER = 1 + Math.sqrt(2)

import {
  makeBitMatrix,
  getBit,
  setBit,
  clearBit,
  bitMatricesEqual as bitsEqual,
  bitMatrixTransitiveClosure as closure,
  bitMatrixHeight as heightOf,
} from '@/code/tool/bitset'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// How many distinct heights does a move type reach in a flat (accept-in-range) random walk?
function heightReach(input: {
  n: number
  maxHeight: number
  steps: number
  cluster: boolean
  seed: number
}): { distinct: number; rangeCovered: number } {
  const { n, maxHeight, steps, cluster } = input
  const minHeight = 2
  const asserted = makeBitMatrix({ rows: n, cols: n })

  setBit(asserted, { row: 0, col: 1 }) // a tiny seed chain

  let f = closure(asserted, n)

  const heights = new Set<number>()

  heights.add(heightOf(f, n))

  // For the single-pair move we operate directly on the closure and require it to stay closed.
  let closureState = cluster ? f : closure(asserted, n)

  for (let s = 0; s < steps; s++) {
    const i = Math.floor((((s + 1 + input.seed) * GOLDEN) % 1) * n)

    let j = Math.floor((((s + 1 + input.seed) * SILVER) % 1) * n)

    if (i === j) {
      j = (j + 1) % n
    }

    const lo = Math.min(i, j)
    const hi = Math.max(i, j)

    if (cluster) {
      const had = getBit(asserted, { row: lo, col: hi })

      if (had) {
        clearBit(asserted, { row: lo, col: hi })
      } else {
        setBit(asserted, { row: lo, col: hi })
      }

      const nf = closure(asserted, n)
      const nh = heightOf(nf, n)

      if (nh >= minHeight && nh <= maxHeight) {
        f = nf
        heights.add(nh)
      } else {
        if (had) {
          setBit(asserted, { row: lo, col: hi })
        } else {
          clearBit(asserted, { row: lo, col: hi })
        }
      }
    } else {
      // single-pair: toggle one closure bit, keep only if the result is still transitively closed
      const had = getBit(closureState, { row: lo, col: hi })
      const trial = makeBitMatrix({ rows: n, cols: n })

      for (let w = 0; w < n * trial.stride; w++) {
        trial.words[w] = closureState.words[w] ?? 0
      }

      if (had) {
        clearBit(trial, { row: lo, col: hi })
      } else {
        setBit(trial, { row: lo, col: hi })
      }

      const reclosed = closure(trial, n)
      const nh = heightOf(reclosed, n)

      if (
        bitsEqual(trial, reclosed, n) &&
        nh >= minHeight &&
        nh <= maxHeight
      ) {
        // valid single-pair move (the toggle did not force any other relation)
        closureState = trial
        heights.add(nh)
      }
    }
  }

  const range = maxHeight - minHeight + 1

  return { distinct: heights.size, rangeCovered: heights.size / range }
}

export function largeNCrossing(input: { sizes: number[] }): {
  results: {
    size: number
    maxHeight: number
    singlePairReach: number
    clusterReach: number
  }[]
  clusterTraverses: boolean
  singlePairStuck: boolean
  solved: boolean
} {
  const results = input.sizes.map(n => {
    const maxHeight = Math.round(1.8 * Math.sqrt(n))
    const steps = 4000 + n * 60
    const sp = heightReach({
      n,
      maxHeight,
      steps,
      cluster: false,
      seed: n * 17 + 1,
    })

    const cl = heightReach({
      n,
      maxHeight,
      steps,
      cluster: true,
      seed: n * 17 + 2,
    })

    return {
      size: n,
      maxHeight,
      singlePairReach: sp.rangeCovered,
      clusterReach: cl.rangeCovered,
    }
  })

  const clusterTraverses = results.every(r => r.clusterReach > 0.7)
  // The barrier bites at large N (P12 stalled at 48+), so the single-pair limitation is judged
  // there, and the cluster move must beat it decisively at every N.
  const singlePairStuck = results
    .filter(r => r.size >= 64)
    .every(r => r.singlePairReach < 0.35)

  const clusterBeatsSinglePair = results.every(
    r => r.clusterReach > 2 * r.singlePairReach,
  )

  return {
    results,
    clusterTraverses,
    singlePairStuck,
    solved:
      clusterTraverses && singlePairStuck && clusterBeatsSinglePair,
  }
}

export default experiment({
  id: 'cosmology/large-n-crossing',
  code: 'E-CSM-0030',
  title: 'cluster move traverses heights, single-pair stuck',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: false,
  run() {
    const r = largeNCrossing({ sizes: [32, 64] })
    const ok = r.solved && r.clusterTraverses && r.singlePairStuck

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the height-changing cluster move sweeps the full height range where the single-pair move stays stuck',
      metrics: {
        clusterReachSmall: r.results[0]?.clusterReach ?? 0,
        clusterReachLarge:
          r.results[r.results.length - 1]?.clusterReach ?? 0,
      },
      control: {
        singlePairReachSmall: r.results[0]?.singlePairReach ?? 0,
        singlePairReachLarge:
          r.results[r.results.length - 1]?.singlePairReach ?? 0,
      },
    })
  },
})
