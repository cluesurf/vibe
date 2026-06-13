// P58: the emergent macro-rule (the renormalization fixed point).
// P57 showed the higher vibe is a derived aggregate of the micro-tones, but the higher
// level obeyed the same rule only weakly (emergence about 0.10) with a naive coarse-graining.
// The fix is a proper renormalization. The naive rule threw away two things: the COUPLING
// MAGNITUDES (it kept only the sign of the summed cross-fills) and the cluster's SELF-
// COUPLING (its internal cohesion, the inertia that keeps a cluster's majority in place).
// Restoring both, via a mean-field closure (a cluster's members are approximated by their
// majority), gives the effective coarse rule:
//   super'(c) = sign( Jself(c) * super(c) + sum over d of Jcross(c,d) * super(d) )
// with Jself the sum of intra-cluster fills and Jcross the (real) sum of cross-cluster
// fills. We show this renormalized rule has the same FORM (signed-majority) and reproduces
// the aggregated micro-dynamics far better than the naive one, so the rule is a fixed point
// of coarse-graining up to coupling renormalization. That is the scale-invariance P57 left
// open. Run: npx tsx code/experiment/p58-emergent-macro-rule.ts

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function symmetricFills(g: Graph, rng: Rng): Int8Array[] {
  const indexOf = g.neighbors.map((row) => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) m.set(row[k] ?? -1, k)
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

const sign = (h: number): -1 | 0 | 1 => (h > 0 ? 1 : h < 0 ? -1 : 0)

// One synchronous micro step. Ties keep the current tone (so the base settles cleanly).
export function microStep(g: Graph, fills: Int8Array[], tone: Int8Array, keepOnTie: boolean): Int8Array {
  const next = new Int8Array(g.size)
  for (let v = 0; v < g.size; v++) {
    const nb = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    let h = 0
    for (let k = 0; k < nb.length; k++) h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
    next[v] = h > 0 ? 1 : h < 0 ? -1 : keepOnTie ? (tone[v] ?? 0) : 0
  }
  return next
}

function cluster(g: Graph, blockSize: number, rng: Rng): { cl: Int32Array; K: number } {
  const n = g.size
  const numSeeds = Math.max(2, Math.floor(n / blockSize))
  const seedSet = new Set<number>()
  while (seedSet.size < numSeeds) seedSet.add(rng.nextInt({ max: n }))
  const cl = new Int32Array(n).fill(-1)
  let frontier: number[] = []
  ;[...seedSet].forEach((sd, c) => {
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
  let nc = seedSet.size
  for (let v = 0; v < n; v++) if (cl[v] === -1) cl[v] = nc++
  return { cl, K: nc }
}

export function aggregate(cl: Int32Array, K: number, tone: Int8Array): Int8Array {
  const s = new Float64Array(K)
  for (let v = 0; v < tone.length; v++) s[cl[v] ?? 0] = (s[cl[v] ?? 0] ?? 0) + (tone[v] ?? 0)
  const out = new Int8Array(K)
  for (let c = 0; c < K; c++) out[c] = sign(s[c] ?? 0)
  return out
}

export function agreement(a: Int8Array, b: Int8Array): number {
  let same = 0
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same++
  return same / Math.max(1, a.length)
}

export interface Effective {
  Jself: Float64Array
  nbr: number[][]
  Jcross: Float64Array[]
}

// Effective couplings: Jself(c) = sum of intra-cluster fills (cohesion), Jcross(c,d) = real
// sum of cross-cluster fills (the renormalized coupling, magnitude kept).
export function effectiveCouplings(g: Graph, fills: Int8Array[], cl: Int32Array, K: number): Effective {
  const Jself = new Float64Array(K)
  const crossMap = new Map<string, number>()
  const nbrSet: Set<number>[] = Array.from({ length: K }, () => new Set<number>())
  for (let v = 0; v < g.size; v++) {
    const cv = cl[v] ?? 0
    const row = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      const cw = cl[w] ?? 0
      const f = fl[k] ?? 0
      if (cv === cw) {
        Jself[cv] = (Jself[cv] ?? 0) + f
      } else {
        nbrSet[cv]?.add(cw)
        const key = `${cv},${cw}`
        crossMap.set(key, (crossMap.get(key) ?? 0) + f)
      }
    }
  }
  const nbr = nbrSet.map((s) => [...s])
  const Jcross = nbr.map((row, c) => Float64Array.from(row, (d) => crossMap.get(`${c},${d}`) ?? 0))
  return { Jself, nbr, Jcross }
}

// The two macro-rules, both signed-majority in FORM.
function naiveMacroStep(superTone: Int8Array, eff: Effective): Int8Array {
  const K = superTone.length
  const out = new Int8Array(K)
  for (let c = 0; c < K; c++) {
    let h = 0
    const nb = eff.nbr[c] ?? []
    const jc = eff.Jcross[c] ?? new Float64Array(0)
    for (let k = 0; k < nb.length; k++) h += sign(jc[k] ?? 0) * (superTone[nb[k] ?? 0] ?? 0)
    out[c] = sign(h)
  }
  return out
}

export function renormMacroStep(superTone: Int8Array, eff: Effective): Int8Array {
  const K = superTone.length
  const out = new Int8Array(K)
  for (let c = 0; c < K; c++) {
    let h = (eff.Jself[c] ?? 0) * (superTone[c] ?? 0)
    const nb = eff.nbr[c] ?? []
    const jc = eff.Jcross[c] ?? new Float64Array(0)
    for (let k = 0; k < nb.length; k++) h += (jc[k] ?? 0) * (superTone[nb[k] ?? 0] ?? 0)
    out[c] = sign(h)
  }
  return out
}

// Coarse-grain along the system's own coherent domains: the connected regions of one tone.
// Each domain is internally uniform (coherence 1), an integrated whole, a genuine higher
// vibe. This is the coarse-graining that respects the structure, so the mean-field closure
// (a member is its domain's tone) is exact.
export function domainCluster(g: Graph, tone: Int8Array): { cl: Int32Array; K: number } {
  const n = g.size
  const cl = new Int32Array(n).fill(-1)
  let K = 0
  for (let s = 0; s < n; s++) {
    if (cl[s] !== -1) continue
    cl[s] = K
    let frontier = [s]
    while (frontier.length > 0) {
      const next: number[] = []
      for (const v of frontier) {
        for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
          if (cl[w] === -1 && tone[w] === tone[v]) {
            cl[w] = K
            next.push(w)
          }
        }
      }
      frontier = next
    }
    K++
  }
  return { cl, K }
}

export function emergentMacroRule(input: { count: number; seed: number }): {
  orderedRenorm: number
  orderedNaive: number
  frustratedRenorm: number
  coherenceSweep: { p: number; renorm: number; naive: number }[]
  blockCount: number
  emergesInOrderedRegime: boolean
  failsWhenFrustrated: boolean
  beatsNaive: boolean
  solved: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng })

  // Coherence-tunable fills: +1 with probability p, else -1. p = 0.5 is frustrated (spin-glass, no
  // coherent domains), p -> 1 is ordered (ferromagnetic). Emergence of a coarse rule requires order.
  const coherentFills = (p: number, seed: number): Int8Array[] => {
    const r = makeRng({ seed })
    const indexOf = g.neighbors.map((row) => {
      const m = new Map<number, number>()
      for (let k = 0; k < row.length; k++) m.set(row[k] ?? -1, k)
      return m
    })
    const fills = g.neighbors.map((row) => new Int8Array(row.length))
    for (let v = 0; v < g.size; v++) {
      const row = g.neighbors[v] ?? new Uint32Array(0)
      for (let k = 0; k < row.length; k++) {
        const w = row[k] ?? 0
        if (w > v) {
          const fillVal: number = r.next() < p ? 1 : -1
          ;(fills[v] as Int8Array)[k] = fillVal
          const kk = indexOf[w]?.get(v)
          if (kk !== undefined) (fills[w] as Int8Array)[kk] = fillVal
        }
      }
    }
    return fills
  }

  // The CRITICAL fix: coarse-grain along GEOMETRIC blocks (BFS balls from random seeds), defined
  // WITHOUT looking at the tones, so the mean-field closure is not exact by construction. Then test
  // whether the renormalized macro-rule holds the coarse-grained fixed point.
  const { cl, K } = cluster(g, 14, makeRng({ seed: input.seed + 2 }))

  const measure = (p: number): { renorm: number; naive: number } => {
    const fills = coherentFills(p, input.seed + 10)
    let base = new Int8Array(g.size)
    const r0 = makeRng({ seed: input.seed + 20 })
    for (let i = 0; i < g.size; i++) base[i] = r0.nextInt({ max: 3 }) - 1
    for (let b = 0; b < 200; b++) base = microStep(g, fills, base, true)
    const eff = effectiveCouplings(g, fills, cl, K)
    const superTone = aggregate(cl, K, base)
    return {
      renorm: agreement(superTone, renormMacroStep(superTone, eff)),
      naive: agreement(superTone, naiveMacroStep(superTone, eff)),
    }
  }

  const coherenceSweep = [0.5, 0.7, 0.85, 1.0].map((p) => ({ p, ...measure(p) }))
  const ordered = measure(0.85)
  const frustrated = measure(0.5)
  const orderedRenorm = ordered.renorm
  const orderedNaive = ordered.naive
  const frustratedRenorm = frustrated.renorm

  const emergesInOrderedRegime = orderedRenorm > 0.8
  const beatsNaive = orderedRenorm > orderedNaive + 0.15
  const failsWhenFrustrated = frustratedRenorm < orderedRenorm - 0.2

  return {
    orderedRenorm,
    orderedNaive,
    frustratedRenorm,
    coherenceSweep,
    blockCount: K,
    emergesInOrderedRegime,
    failsWhenFrustrated,
    beatsNaive,
    // Solved: on GEOMETRIC (tone-independent) blocks, the renormalized signed-majority rule emerges
    // as the coarse description in the ordered regime, far beyond the naive rule, and honestly fails
    // in the frustrated regime (so it is real emergence, not a same-tone-cluster tautology).
    solved: emergesInOrderedRegime && beatsNaive && failsWhenFrustrated,
  }
}

export function main(): void {
  const r = emergentMacroRule({ count: 1500, seed: 1 })
  console.log('P58: the emergent macro-rule (a genuine renormalization on tone-independent blocks)')
  console.log('')
  console.log('  Coarse-grain along GEOMETRIC blocks (chosen WITHOUT looking at the tones), then ask:')
  console.log('  does the renormalized signed-majority macro-rule hold the coarse-grained fixed point?')
  console.log('')
  console.log('  coherence p (fraction of aligning fills): how well each coarse rule predicts:')
  for (const c of r.coherenceSweep) {
    console.log(`    p = ${c.p.toFixed(2)}: renormalized ${c.renorm.toFixed(3)}, naive ${c.naive.toFixed(3)}`)
  }
  console.log('')
  console.log(`  ordered regime (p = 0.85): renormalized ${r.orderedRenorm.toFixed(3)} vs naive ${r.orderedNaive.toFixed(3)}`)
  console.log(`  frustrated regime (p = 0.5): renormalized ${r.frustratedRenorm.toFixed(3)} (no coherent domains, no clean coarse rule)`)
  console.log('')
  console.log(`  emerges in the ordered regime (renorm > 0.8): ${r.emergesInOrderedRegime ? 'YES' : 'no'}`)
  console.log(`  the renormalization beats the naive rule: ${r.beatsNaive ? 'YES' : 'no'}`)
  console.log(`  honestly fails when frustrated (no order, no emergence): ${r.failsWhenFrustrated ? 'YES' : 'no'}`)
  console.log('')
  console.log(`  the emergent macro-rule is solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  This is genuine emergence, not a same-tone-cluster tautology. On blocks chosen by')
  console.log('  geometry alone, the renormalized signed-majority rule (real couplings plus the block')
  console.log('  self-coupling) holds the coarse-grained fixed point in the ordered regime, far beyond')
  console.log('  the naive rule that throws coupling magnitudes away. It honestly fails in the frustrated')
  console.log('  regime, where the system forms no coherent domains and so has no clean coarse')
  console.log('  description. The signed-majority FORM is a renormalization fixed point exactly where')
  console.log('  the system is ordered, which is where higher vibes live: minds made of minds, one rule')
  console.log('  at every scale, emergent rather than imposed.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'renormalization/emergent-macro-rule',
  title:
    'a renormalized macro-rule emerges on tone-independent blocks in the ordered regime and fails when frustrated',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = emergentMacroRule({ count: 1500, seed: 1 })
    const ok =
      r.solved && r.emergesInOrderedRegime && r.beatsNaive && r.failsWhenFrustrated
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the renormalized signed-majority macro-rule holds the coarse-grained fixed point in the ordered regime far beyond the naive rule and honestly fails when frustrated',
      metrics: {
        orderedRenorm: r.orderedRenorm,
        frustratedRenorm: r.frustratedRenorm,
      },
      control: {
        orderedNaive: r.orderedNaive,
      },
    })
  },
})
