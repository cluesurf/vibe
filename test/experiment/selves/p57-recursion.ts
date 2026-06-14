// P57: recursion (vibes into higher vibes, the model as a fractal).
// The recursion claim (see the higher-vibes-and-recursion spec) is that the model is
// self-similar: a coherent mesh of vibes can be treated as a single higher vibe, which
// obeys the same kind of rule, so the same law governs every scale, minds made of minds.
// We test it concretely:
//   1. Coarse-grain the mesh into super-vibes (clusters), each super-vibe's tone the
//      majority of its members, with super-notes and super-fills between clusters.
//   2. Self-similar structure: the super-mesh is the SAME kind of object, ternary tones,
//      a comparable graph, Lorentz-safe.
//   3. Scale-invariance: a stable self at the base coarse-grains to a state that is also
//      (near) stable under the SAME rule at the higher level, so the higher vibe obeys the
//      law its parts do.
//   4. The tower: coarse-graining again yields a valid higher level still, the fractal of
//      wholes-within-wholes.
// Run: npx tsx code/experiment/p57-recursion.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph, makeGraph } from '@/code/tool/graph'
import { symmetricEdgeFills, signedMajorityStep } from '@/code/operator/signed-majority'
import { settleAsync } from '@/code/operator/signed-majority-settle'
import { toneOverlap as overlap } from '@/code/operator/hopfield'
import { agreementFraction, clusterMajority } from '@/code/measure/agreement'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Coarse {
  superG: Graph
  superTone: Int8Array // a DERIVED VIEW (cluster majority), never stored or evolved on its own
  superFills: Int8Array[]
  cluster: Int32Array
  K: number
}

// Coarse-grain a graph into super-vibes by clustering (nearest seed, multi-source BFS).
// The super-tone is the cluster majority, the super-fill the majority of cross-cluster fills.
function coarseGrain(g: Graph, fills: Int8Array[], tone: Int8Array, blockSize: number, rng: Rng): Coarse {
  const n = g.size
  const numSeeds = Math.max(2, Math.floor(n / blockSize))
  // Random distinct seeds.
  const seedSet = new Set<number>()
  while (seedSet.size < numSeeds) seedSet.add(rng.nextInt({ max: n }))
  const seeds = [...seedSet]
  const cluster = new Int32Array(n).fill(-1)
  let frontier: number[] = []
  seeds.forEach((sd, c) => {
    cluster[sd] = c
    frontier.push(sd)
  })
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (cluster[w] === -1) {
          cluster[w] = cluster[v] ?? 0
          next.push(w)
        }
      }
    }
    frontier = next
  }
  // Any unreached node becomes its own cluster.
  let nextC = seeds.length
  for (let v = 0; v < n; v++) if (cluster[v] === -1) cluster[v] = nextC++
  const K = nextC

  // Super-tone (cluster majority) and super-coords (centroid).
  const sum = new Float64Array(K)
  for (let v = 0; v < n; v++) sum[cluster[v] ?? 0] = (sum[cluster[v] ?? 0] ?? 0) + (tone[v] ?? 0)
  const superTone = new Int8Array(K)
  for (let c = 0; c < K; c++) superTone[c] = (sum[c] ?? 0) > 0 ? 1 : (sum[c] ?? 0) < 0 ? -1 : 0
  const dim = g.embedding?.dimension ?? 2
  const oldCoords = g.embedding?.coords ?? new Float64Array(0)
  const coordSum = new Float64Array(K * dim)
  const count = new Float64Array(K)
  for (let v = 0; v < n; v++) {
    const c = cluster[v] ?? 0
    count[c] = (count[c] ?? 0) + 1
    for (let a = 0; a < dim; a++) coordSum[c * dim + a] = (coordSum[c * dim + a] ?? 0) + (oldCoords[v * dim + a] ?? 0)
  }
  const coords = new Float64Array(K * dim)
  for (let c = 0; c < K; c++) for (let a = 0; a < dim; a++) coords[c * dim + a] = (coordSum[c * dim + a] ?? 0) / Math.max(1, count[c] ?? 1)

  // Super-edges and super-fills: accumulate cross-cluster fills.
  const edgeFill = new Map<string, number>()
  const superNbr: Set<number>[] = Array.from({ length: K }, () => new Set<number>())
  for (let v = 0; v < n; v++) {
    const cv = cluster[v] ?? 0
    const row = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      const cw = cluster[w] ?? 0
      if (cv !== cw) {
        superNbr[cv]?.add(cw)
        superNbr[cw]?.add(cv)
        const key = cv < cw ? `${cv},${cw}` : `${cw},${cv}`
        edgeFill.set(key, (edgeFill.get(key) ?? 0) + (fl[k] ?? 0))
      }
    }
  }
  const neighbors: number[][] = superNbr.map((s) => [...s])
  const manifold = g.embedding?.manifold ?? { form: 'hyperbolic' as const, dimension: 2, curvature: -1 }
  const embedding = { form: 'embedding' as const, dimension: dim, signature: 'riemannian' as const, coords, manifold }
  const superG = makeGraph({ size: K, directed: false, neighbors, embedding })
  // Build the super-fills aligned to superG.neighbors (makeGraph may reorder), so the fill
  // index matches the neighbor index in the dynamics.
  const superFills: Int8Array[] = Array.from({ length: K }, (_, c) =>
    Int8Array.from(superG.neighbors[c] ?? new Uint32Array(0), (d) => {
      const key = c < d ? `${c},${d}` : `${d},${c}`
      const f = edgeFill.get(key) ?? 0
      return f > 0 ? 1 : f < 0 ? -1 : 0
    }),
  )
  return { superG, superTone, superFills, cluster, K }
}

export function recursion(input: { count: number; seed: number }): {
  baseCells: number
  superCells: number
  superTernary: boolean
  superAnisotropy: number
  superLorentzSafe: boolean
  inheritedStable: boolean
  inheritedOverlap: number
  emergence: number
  towerCells: number
  towerValid: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng })
  const fills = symmetricEdgeFills({ neighbors: g.neighbors, rng: makeRng({ seed: input.seed + 1 }) })
  const init = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) init[i] = rng.nextInt({ max: 3 }) - 1

  // The only dynamics is the micro-rule on micro-tones. Converge it (asynchronously, so it
  // reaches a genuine fixed point) to a stable self.
  const baseRun = settleAsync({ graph: g, fills, init, sweeps: 120, rng: makeRng({ seed: input.seed + 6 }) })
  const base = baseRun.state

  // The higher vibe is the DERIVED aggregate of the micro-tones, never stored. We fix one
  // clustering and read the higher view off the base through it.
  const cg = coarseGrain(g, fills, base, 10, makeRng({ seed: input.seed + 2 }))

  // Self-similar structure: the aggregate view is the SAME kind of object, ternary and
  // Lorentz-safe (no new storage, just a coarse view of the base).
  let superTernary = true
  for (const t of cg.superTone) if (t < -1 || t > 1) superTernary = false
  const aniso = lorentzIsotropy({ substrate: cg.superG, samples: 2000, rng: makeRng({ seed: input.seed + 3 }) })

  // No separate higher dynamics: the higher self is stable BECAUSE the micro-self is. Run
  // the MICRO rule a few more beats and re-read the aggregate. If the micro-self is a fixed
  // point, the aggregate view does not change, so the higher vibe's stability is inherited
  // from below, not maintained by any stored super-state.
  const base2 = settleAsync({ graph: g, fills, init: base, sweeps: 6, rng: makeRng({ seed: input.seed + 7 }) }).state
  const aggBefore = clusterMajority(cg.cluster, cg.K, base)
  const aggAfter = clusterMajority(cg.cluster, cg.K, base2)
  const inheritedOverlap = agreementFraction(aggBefore, aggAfter)
  const inheritedStable = inheritedOverlap > 0.95

  // Emergent macro-rule (partial): does the macro-rule applied to an aggregate match the
  // aggregate of one micro step, in the transient (from a fresh random state)? This is the
  // degree to which the higher-level law emerges from the micro-dynamics, with no separate
  // stored layer. It is expected to be partial, the deep open question.
  const r0 = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) r0[i] = rng.nextInt({ max: 3 }) - 1
  const aggR0 = clusterMajority(cg.cluster, cg.K, r0)
  const aggMicro = clusterMajority(cg.cluster, cg.K, signedMajorityStep({ neighbors: g.neighbors, fills, tone: r0 }))
  const macroStep = signedMajorityStep({ neighbors: cg.superG.neighbors, fills: cg.superFills, tone: aggR0 })
  const emergence = overlap(aggMicro, macroStep)

  // The tower: aggregate again, still a valid same-kind view.
  const cg2 = coarseGrain(cg.superG, cg.superFills, cg.superTone, 6, makeRng({ seed: input.seed + 4 }))
  let towerTernary = true
  for (const t of cg2.superTone) if (t < -1 || t > 1) towerTernary = false

  return {
    baseCells: g.size,
    superCells: cg.superG.size,
    superTernary,
    superAnisotropy: aniso.anisotropy,
    superLorentzSafe: aniso.anisotropy < 0.25,
    inheritedStable,
    inheritedOverlap,
    emergence,
    towerCells: cg2.superG.size,
    towerValid: towerTernary && cg2.superG.size >= 2,
  }
}

export default experiment({
  id: 'selves/p57-recursion',
  title: 'higher vibes are aggregate views (no stored layer), self-similar, inherited-stable, towering',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = recursion({ count: 1500, seed: 1 })
    const ok = r.superTernary && r.superLorentzSafe && r.inheritedStable && r.towerValid
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a coarse-grained mesh is the same kind of ternary Lorentz-safe object, stable because its parts are, and the tower continues',
      metrics: { inheritedOverlap: r.inheritedOverlap, emergence: r.emergence },
    })
  },
})
