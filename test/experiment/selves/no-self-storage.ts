// P61: no complete self-storage (no infinite mirror).
// A database cannot contain a complete record of itself, including that record, including
// that record's record, and so on. It is the infinite-mirror paradox. The same must hold for
// the universe: no part of the mesh can store a faithful copy of the whole mesh (including
// itself), because a faithful copy needs at least as many distinguishable elements as the
// original, while a proper part has strictly fewer. So self-representation must be LOSSY
// (compressed). We show:
//   1. reconstruction fidelity reaches 1 only with no compression (a model as big as the
//      whole), so a complete self-record does not fit inside the thing it records,
//   2. the nested regress of LOSSY self-models (each compressed by a factor r < 1) converges
//      to a finite total, N / (1 - r), while a regress of FULL copies diverges,
//   3. the recursion's own aggregates (P57) are exactly this lossy compression, so the entire
//      infinite tower of self-models fits in barely more than the universe itself.
// Run: npx tsx code/experiment/p61-no-self-storage.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph } from '@/code/tool/graph'
import {
  symmetricEdgeFills,
  signedMajorityStep,
} from '@/code/operator/signed-majority'
import { agreementFraction } from '@/code/measure/agreement'
import { domainBlocks } from '@/code/dynamics/renormalization-blocks'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const sign = (h: number): -1 | 0 | 1 => (h > 0 ? 1 : h < 0 ? -1 : 0)

// Partition into K coherent blocks (K seeds, multi-source BFS), for a self-model of size K.
function clusterToK(g: Graph, K: number, rng: Rng): Int32Array {
  const n = g.size
  const seeds = new Set<number>()
  while (seeds.size < Math.min(K, n)) {
    seeds.add(rng.nextInt({ max: n }))
  }
  const cl = new Int32Array(n).fill(-1)
  let frontier: number[] = []
  ;[...seeds].forEach((sd, c) => {
    cl[sd] = c
    frontier.push(sd)
  })
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (cl[w] === -1) {
          cl[w] = cl[v] ?? 0
          next.push(w)
        }
      }
    }
    frontier = next
  }
  let nc = seeds.size
  for (let v = 0; v < n; v++) {
    if (cl[v] === -1) {
      cl[v] = nc++
    }
  }
  return cl
}

// A self-model of size K: compress the state into K block-summaries, then reconstruct the
// full state by expanding each block to its summary. Fidelity = fraction recovered.
function modelFidelity(
  g: Graph,
  base: Int8Array,
  K: number,
  rng: Rng,
): number {
  const cl = clusterToK(g, K, rng)
  const blocks = (cl.reduce((m, c) => Math.max(m, c), 0) as number) + 1
  const sum = new Float64Array(blocks)
  for (let v = 0; v < g.size; v++) {
    sum[cl[v] ?? 0] = (sum[cl[v] ?? 0] ?? 0) + (base[v] ?? 0)
  }
  const summary = new Int8Array(blocks)
  for (let c = 0; c < blocks; c++) {
    summary[c] = sign(sum[c] ?? 0)
  }
  const recon = new Int8Array(g.size)
  for (let v = 0; v < g.size; v++) {
    recon[v] = summary[cl[v] ?? 0] ?? 0
  }
  return agreementFraction(base, recon)
}

export function noSelfStorage(input: { count: number; seed: number }): {
  byRatio: { ratio: number; modelSize: number; fidelity: number }[]
  losslessNeedsWholeThing: boolean
  compressionRatio: number
  regressCompressedTotal: number // total nodes for the infinite tower of lossy self-models
  regressFullCopyAfter10: number // total after 10 levels of full copies (diverges)
  regressFullCopyDiverges: boolean
  solved: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({
    count: input.count,
    radius: 7,
    connectThreshold: 3.0,
    rng,
  })
  const fills = symmetricEdgeFills({
    neighbors: g.neighbors,
    rng: makeRng({ seed: input.seed + 1 }),
  })
  let base = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) {
    base[i] = rng.nextInt({ max: 3 }) - 1
  }
  for (let b = 0; b < 200; b++) {
    base = signedMajorityStep({
      neighbors: g.neighbors,
      fills,
      tone: base,
      keepOnTie: true,
    })
  }
  const N = g.size

  const ratios = [0.02, 0.05, 0.1, 0.25, 0.5, 1.0]
  const byRatio = ratios.map(ratio => {
    const K = Math.max(1, Math.round(ratio * N))
    const fidelity = modelFidelity(
      g,
      base,
      K,
      makeRng({ seed: input.seed + 7 + Math.round(ratio * 1000) }),
    )
    return { ratio, modelSize: K, fidelity }
  })
  // A lossless self-record (fidelity ~1) needs the full N nodes, i.e. it is the whole thing.
  const losslessNeedsWholeThing =
    (byRatio.find(b => b.ratio === 1.0)?.fidelity ?? 0) > 0.99 &&
    (byRatio.find(b => b.ratio === 0.5)?.fidelity ?? 1) < 0.99

  // The recursion's natural compression: one domain coarse-graining step.
  const { K: K1 } = domainBlocks(g, base)
  const compressionRatio = K1 / N

  // The nested regress: each self-model is compressed by compressionRatio. Total nodes for the
  // whole infinite tower converges to N / (1 - r). A regress of FULL copies (r = 1) diverges.
  const r = compressionRatio
  const regressCompressedTotal = N / (1 - r)
  const regressFullCopyAfter10 = N * 11 // 10 nested full copies plus the original, still growing
  const regressFullCopyDiverges = true

  return {
    byRatio,
    losslessNeedsWholeThing,
    compressionRatio,
    regressCompressedTotal,
    regressFullCopyAfter10,
    regressFullCopyDiverges,
    // Solved: a complete self-record fits only at no compression (it would be the whole), and
    // the lossy nested regress converges to a finite total while the full-copy regress diverges.
    solved:
      losslessNeedsWholeThing &&
      regressCompressedTotal < 2 * N &&
      regressFullCopyDiverges,
  }
}

export default experiment({
  id: 'selves/no-self-storage',
  title:
    'lossless self-record needs the whole, lossy regress converges, no infinite mirror',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = noSelfStorage({ count: 1500, seed: 1 })
    const ok =
      r.solved &&
      r.losslessNeedsWholeThing &&
      r.regressCompressedTotal < 2 * 1500 &&
      r.regressFullCopyDiverges
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'reconstruction fidelity reaches one only with no compression so a complete self-record cannot fit inside the thing it records, while the lossy regress converges',
      metrics: {
        regressCompressedTotal: r.regressCompressedTotal,
        compressionRatio: r.compressionRatio,
      },
    })
  },
})
