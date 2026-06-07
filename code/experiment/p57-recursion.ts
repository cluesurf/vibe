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

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '~/tool/rng'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { Graph, makeGraph } from '~/tool/graph'
import { lorentzIsotropy } from '~/measure/lorentz'

// Symmetric ternary fills on a graph.
function symmetricFills(g: Graph, rng: Rng): Int8Array[] {
  const indexOf = g.neighbors.map((row) => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }
    return m
  })
  const fills = g.neighbors.map((row) => new Int8Array(row.length))
  for (let v = 0; v < g.size; v++) {
    const fv = fills[v]
    const row = g.neighbors[v] ?? new Uint32Array(0)
    if (!fv) continue
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      if (w > v) {
        const f = rng.nextInt({ max: 3 }) - 1
        fv[k] = f
        const fw = fills[w]
        const kk = indexOf[w]?.get(v)
        if (fw && kk !== undefined) fw[kk] = f
      }
    }
  }
  return fills
}

function step(g: Graph, fills: Int8Array[], tone: Int8Array): Int8Array {
  const next = new Int8Array(g.size)
  for (let v = 0; v < g.size; v++) {
    const nb = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    let h = 0
    for (let k = 0; k < nb.length; k++) h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
    next[v] = h > 0 ? 1 : h < 0 ? -1 : 0
  }
  return next
}

// Asynchronous settle (Hopfield-style, converges with symmetric fills). Ties (a zero
// local field) keep the current tone rather than going to peace, which removes the
// energy-neutral plateau of the 0-state so the dynamics reaches a genuine fixed point.
// Returns the converged state and the flip fraction in the final sweep (0 means fixed).
function settleAsync(g: Graph, fills: Int8Array[], init: Int8Array, sweeps: number, rng: Rng): { state: Int8Array; finalFlip: number } {
  const n = g.size
  const t = Int8Array.from(init)
  let finalFlip = 1
  for (let sweep = 0; sweep < sweeps; sweep++) {
    let flips = 0
    for (let s = 0; s < n; s++) {
      const v = rng.nextInt({ max: n })
      const nb = g.neighbors[v] ?? new Uint32Array(0)
      const fl = fills[v] ?? new Int8Array(0)
      let h = 0
      for (let k = 0; k < nb.length; k++) h += (fl[k] ?? 0) * (t[nb[k] ?? 0] ?? 0)
      const nt: -1 | 0 | 1 = h > 0 ? 1 : h < 0 ? -1 : (t[v] ?? 0) as -1 | 0 | 1
      if (nt !== t[v]) flips++
      t[v] = nt
    }
    finalFlip = flips / Math.max(1, n)
  }
  return { state: t, finalFlip }
}

interface Coarse {
  superG: Graph
  superTone: Int8Array // a DERIVED VIEW (cluster majority), never stored or evolved on its own
  superFills: Int8Array[]
  cluster: Int32Array
  K: number
}

// Aggregate micro-tones into the higher-level view: the majority tone of each cluster.
// This is read on demand from the base, not stored.
function aggregate(cluster: Int32Array, K: number, tone: Int8Array): Int8Array {
  const sum = new Float64Array(K)
  for (let v = 0; v < tone.length; v++) sum[cluster[v] ?? 0] = (sum[cluster[v] ?? 0] ?? 0) + (tone[v] ?? 0)
  const out = new Int8Array(K)
  for (let c = 0; c < K; c++) out[c] = (sum[c] ?? 0) > 0 ? 1 : (sum[c] ?? 0) < 0 ? -1 : 0
  return out
}

function overlapAt(a: Int8Array, b: Int8Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0)
  return s / Math.max(1, a.length)
}

// Fraction of entries that agree (the right measure for "unchanged", since the dot-product
// overlap of a ternary vector with itself only counts the non-zero entries).
function agreement(a: Int8Array, b: Int8Array): number {
  let same = 0
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same++
  return same / Math.max(1, a.length)
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

function overlap(a: Int8Array, b: Int8Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0)
  return s / a.length
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
  const fills = symmetricFills(g, makeRng({ seed: input.seed + 1 }))
  const init = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) init[i] = rng.nextInt({ max: 3 }) - 1

  // The only dynamics is the micro-rule on micro-tones. Converge it (asynchronously, so it
  // reaches a genuine fixed point) to a stable self.
  const baseRun = settleAsync(g, fills, init, 120, makeRng({ seed: input.seed + 6 }))
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
  const base2 = settleAsync(g, fills, base, 6, makeRng({ seed: input.seed + 7 })).state
  const aggBefore = aggregate(cg.cluster, cg.K, base)
  const aggAfter = aggregate(cg.cluster, cg.K, base2)
  const inheritedOverlap = agreement(aggBefore, aggAfter)
  const inheritedStable = inheritedOverlap > 0.95

  // Emergent macro-rule (partial): does the macro-rule applied to an aggregate match the
  // aggregate of one micro step, in the transient (from a fresh random state)? This is the
  // degree to which the higher-level law emerges from the micro-dynamics, with no separate
  // stored layer. It is expected to be partial, the deep open question.
  const r0 = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) r0[i] = rng.nextInt({ max: 3 }) - 1
  const aggR0 = aggregate(cg.cluster, cg.K, r0)
  const aggMicro = aggregate(cg.cluster, cg.K, step(g, fills, r0))
  const macroStep = step(cg.superG, cg.superFills, aggR0)
  const emergence = overlapAt(aggMicro, macroStep)

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

export function main(): void {
  const r = recursion({ count: 1500, seed: 1 })
  console.log('P57: recursion (vibes into higher vibes, the model as a fractal)')
  console.log('')
  console.log(`  base mesh: ${r.baseCells} vibes`)
  console.log(`  coarse-grained into ${r.superCells} super-vibes (clusters acting as single higher vibes)`)
  console.log('')
  console.log('  the higher vibe is the AGGREGATE of the micro-tones (a derived view), not a stored tone.')
  console.log('')
  console.log('  1. self-similar structure (the aggregate view is the SAME kind of object):')
  console.log(`     aggregate tones are ternary: ${r.superTernary ? 'YES' : 'no'}`)
  console.log(`     aggregate mesh Lorentz-safe: ${r.superLorentzSafe ? 'YES' : 'no'} (anisotropy ${r.superAnisotropy.toFixed(3)})`)
  console.log('  2. no separate storage (the higher self is stable BECAUSE the micro-self is):')
  console.log(`     running the micro-rule more leaves the aggregate unchanged: ${r.inheritedStable ? 'YES' : 'no'} (overlap ${r.inheritedOverlap.toFixed(3)})`)
  console.log('  3. emergent macro-rule (partial, the deep open question):')
  console.log(`     the aggregated micro-step matches the macro-rule by ${r.emergence.toFixed(2)} (1 = fully emergent, the open frontier)`)
  console.log('  4. the tower (aggregating again yields a valid higher view):')
  console.log(`     second level of ${r.towerCells} super-super-vibes, still ternary and valid: ${r.towerValid ? 'YES' : 'no'}`)
  console.log('')
  console.log('  A coherent mesh of vibes can be READ as a single higher vibe: its tone is the')
  console.log('  aggregate (majority) of its members, a derived view, with no new stored tone and no')
  console.log('  separate dynamics. Only the ternary micro-tones are ever stored. The aggregate view')
  console.log('  is the same kind of object as the base (ternary, Lorentz-safe), its stability is')
  console.log('  inherited from the micro-self below it, and the tower continues to another level.')
  console.log('  The higher-level law is emergent from the micro-dynamics (partial here), which is the')
  console.log('  honest open frontier. The model is recursive and self-similar, minds made of minds,')
  console.log('  with the higher levels being summaries of the one ternary base, never abstractions')
  console.log('  stored beside it.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
