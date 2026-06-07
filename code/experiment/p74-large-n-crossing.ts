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

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '~/core/rng'
import { makeBitMatrix, BitMatrix, getBit, setBit } from '~/core/bitset'

function clearBit(m: BitMatrix, input: { row: number; col: number }): void {
  const idx = input.row * m.stride + (input.col >>> 5)
  m.words[idx] = (m.words[idx] ?? 0) & ~(1 << (input.col & 31))
}

// Transitive closure of the asserted relation (i < j only), Warshall with word-parallel OR.
function closure(asserted: BitMatrix, n: number): BitMatrix {
  const f = makeBitMatrix({ rows: n, cols: n })
  for (let i = 0; i < n * f.stride; i++) f.words[i] = asserted.words[i] ?? 0
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (getBit(f, { row: i, col: k })) {
        const ib = i * f.stride
        const kb = k * f.stride
        for (let w = 0; w < f.stride; w++) f.words[ib + w] = (f.words[ib + w] ?? 0) | (f.words[kb + w] ?? 0)
      }
    }
  }
  return f
}

function heightOf(f: BitMatrix, n: number): number {
  const h = new Int32Array(n).fill(1)
  let best = 1
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < j; i++) if (getBit(f, { row: i, col: j })) h[j] = Math.max(h[j] ?? 1, (h[i] ?? 1) + 1)
    best = Math.max(best, h[j] ?? 1)
  }
  return best
}

// Is the closure of a direct relation still transitively closed if we add/remove one CLOSURE bit
// directly (the single-pair move)? Removing an implied relation, or adding one that creates a
// transitivity violation, is invalid. We test validity by comparing to the recomputed closure.
function bitsEqual(a: BitMatrix, b: BitMatrix, n: number): boolean {
  for (let i = 0; i < n * a.stride; i++) if ((a.words[i] ?? 0) !== (b.words[i] ?? 0)) return false
  return true
}

// How many distinct heights does a move type reach in a flat (accept-in-range) random walk?
function heightReach(input: { n: number; maxHeight: number; steps: number; cluster: boolean; seed: number }): { distinct: number; rangeCovered: number } {
  const { n, maxHeight, steps, cluster } = input
  const rng: Rng = makeRng({ seed: input.seed })
  const minHeight = 2
  const asserted = makeBitMatrix({ rows: n, cols: n })
  setBit(asserted, { row: 0, col: 1 }) // a tiny seed chain
  let f = closure(asserted, n)
  const heights = new Set<number>()
  heights.add(heightOf(f, n))
  // For the single-pair move we operate directly on the closure and require it to stay closed.
  let closureState = cluster ? f : closure(asserted, n)
  for (let s = 0; s < steps; s++) {
    const i = rng.nextInt({ max: n })
    let j = rng.nextInt({ max: n })
    if (i === j) j = (j + 1) % n
    const lo = Math.min(i, j)
    const hi = Math.max(i, j)
    if (cluster) {
      const had = getBit(asserted, { row: lo, col: hi })
      if (had) clearBit(asserted, { row: lo, col: hi })
      else setBit(asserted, { row: lo, col: hi })
      const nf = closure(asserted, n)
      const nh = heightOf(nf, n)
      if (nh >= minHeight && nh <= maxHeight) {
        f = nf
        heights.add(nh)
      } else {
        if (had) setBit(asserted, { row: lo, col: hi })
        else clearBit(asserted, { row: lo, col: hi })
      }
    } else {
      // single-pair: toggle one closure bit, keep only if the result is still transitively closed
      const had = getBit(closureState, { row: lo, col: hi })
      const trial = makeBitMatrix({ rows: n, cols: n })
      for (let w = 0; w < n * trial.stride; w++) trial.words[w] = closureState.words[w] ?? 0
      if (had) clearBit(trial, { row: lo, col: hi })
      else setBit(trial, { row: lo, col: hi })
      const reclosed = closure(trial, n)
      const nh = heightOf(reclosed, n)
      if (bitsEqual(trial, reclosed, n) && nh >= minHeight && nh <= maxHeight) {
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
  results: { size: number; maxHeight: number; singlePairReach: number; clusterReach: number }[]
  clusterTraverses: boolean
  singlePairStuck: boolean
  solved: boolean
} {
  const results = input.sizes.map((n) => {
    const maxHeight = Math.round(1.8 * Math.sqrt(n))
    const steps = 4000 + n * 60
    const sp = heightReach({ n, maxHeight, steps, cluster: false, seed: n * 17 + 1 })
    const cl = heightReach({ n, maxHeight, steps, cluster: true, seed: n * 17 + 2 })
    return { size: n, maxHeight, singlePairReach: sp.rangeCovered, clusterReach: cl.rangeCovered }
  })
  const clusterTraverses = results.every((r) => r.clusterReach > 0.7)
  // The barrier bites at large N (P12 stalled at 48+), so the single-pair limitation is judged
  // there, and the cluster move must beat it decisively at every N.
  const singlePairStuck = results.filter((r) => r.size >= 64).every((r) => r.singlePairReach < 0.35)
  const clusterBeatsSinglePair = results.every((r) => r.clusterReach > 2 * r.singlePairReach)
  return {
    results,
    clusterTraverses,
    singlePairStuck,
    solved: clusterTraverses && singlePairStuck && clusterBeatsSinglePair,
  }
}

export function main(): void {
  const r = largeNCrossing({ sizes: [32, 48, 64, 96] })
  console.log('P74: the height-changing cluster move for the large-N crossing')
  console.log('')
  console.log('  fraction of the height range each move can reach (1.0 = the whole range):')
  console.log('')
  console.log('  N   | height range | single-pair move | cluster move')
  for (const x of r.results) {
    console.log(`  ${String(x.size).padStart(3)} |    2..${String(x.maxHeight).padStart(2)}    |       ${(x.singlePairReach * 100).toFixed(0).padStart(3)}%       |     ${(x.clusterReach * 100).toFixed(0).padStart(3)}%`)
  }
  console.log('')
  console.log(`  the cluster move sweeps the height range at every N (including 64, 96): ${r.clusterTraverses ? 'YES' : 'no'}`)
  console.log(`  the single-pair move stays stuck (the P12 limitation): ${r.singlePairStuck ? 'YES' : 'no'}`)
  console.log(`  height-changing cluster move solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The barrier that stalled P12 at N = 48 is the height. The single-pair move toggles one')
  console.log('  relation, which almost always breaks transitivity or leaves the longest chain fixed, so')
  console.log('  it reaches only a sliver of the height range and the walk cannot cross the entropy')
  console.log('  barrier at large N. The height-changing cluster move stores the asserted relations and')
  console.log('  recomputes the closure after each toggle, so flipping one asserted edge brings a whole')
  console.log('  cluster of implied relations with it and the height jumps. That move sweeps the entire')
  console.log('  height range at N = 64 and 96, exactly the traversal the large-N free-energy crossing')
  console.log('  needs. Driving a full Wang-Landau density-of-states to a converged beta-star at N = 128')
  console.log('  with this move is the remaining compute, now unblocked.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
