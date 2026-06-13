// P106: integrated self-patches on the exact {5,3,4} at scale. (what-is-a-self.md.)
// USES COHESION (audit): this relies on a cohesion/maintenance term that is NOT one of the five base things.
// Per the discipline the PURE rule gives churn (P101), so this is a MID-LAYER-with-cohesion result, NOT pure
// substrate emergence. Honest when labeled as such, do not read it as the bare five base things producing selves.
//
// A higher self is a vibe-patch, a coherent integrated region, found BY ITS INTEGRATION, not drawn by
// hand. This scans the exact crystal after running the cohesive perception rule to its balance, finds
// the coherent domains (connected same-sign regions, the rule's attractors), and asks honestly whether
// they are real selves: significantly larger and more structured than a RANDOM null with the same tone
// counts, and whether a HIERARCHY of patch sizes appears (the tower).
//
// No patch is ever drawn by hand. Charge Q is conserved by the dynamics. Run: npx tsx code/experiment/p106-selves-at-scale.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import { cohesiveEdgeSweep } from '@/code/dynamics/cohesive-sweep'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// cohesive perception rule, one beat (conserving)
const beat = (tone: Int8Array, eu: Int32Array, ev: Int32Array, offsets: Int32Array, adj: Int32Array, moved: Uint8Array, rng: Rng, arrowProb: number): void =>
  cohesiveEdgeSweep({ tone, eu, ev, offsets, adj, moved, rng, annihilate: true, arrow: arrowProb })

// connected components of same-sign nonzero cells (coherent domains), return sorted sizes (desc)
function domainSizes(tone: Int8Array, offsets: Int32Array, adj: Int32Array, n: number): number[] {
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i
  const find = (x: number): number => {
    let r = x
    while (parent[r] !== r) r = parent[r]!
    while (parent[x] !== r) {
      const nx = parent[x]!
      parent[x] = r
      x = nx
    }
    return r
  }
  for (let v = 0; v < n; v++) {
    if (tone[v] === 0) continue
    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!
      if (w > v && tone[w] === tone[v]) parent[find(v)] = find(w)
    }
  }
  const size = new Map<number, number>()
  for (let i = 0; i < n; i++) {
    if (tone[i] === 0) continue
    const r = find(i)
    size.set(r, (size.get(r) ?? 0) + 1)
  }
  return Array.from(size.values()).sort((a, b) => b - a)
}

export function selvesAtScale(input?: { n?: number }): {
  n: number
  nonzero: number
  largestDomain: number
  largestRandom: number
  domainAdvantage: number
  patchesOver50: number
  patchesOver200: number
  hierarchy: boolean
  conserved: boolean
  selvesEmerge: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)

  // run the cohesive rule from all-peace to its dynamic balance
  const tone = new Int8Array(N)
  const q0 = sumTone(tone)
  const moved = new Uint8Array(N)
  const rng = makeRng({ seed: 9 })
  for (let b = 0; b < 100; b++) beat(tone, eu, ev, g.offsets, g.adj, moved, rng, 0.06)
  const conserved = sumTone(tone) === q0

  let nonzero = 0
  for (let i = 0; i < N; i++) if (tone[i] !== 0) nonzero++

  const sizes = domainSizes(tone, g.offsets, g.adj, N)
  const largestDomain = sizes[0] ?? 0
  const patchesOver50 = sizes.filter((s) => s >= 50).length
  const patchesOver200 = sizes.filter((s) => s >= 200).length

  // random null: same tones, shuffled positions, then find domains
  const shuffled = tone.slice()
  const rng2 = makeRng({ seed: 17 })
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng2.next() * (i + 1))
    const t = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = t
  }
  const randomSizes = domainSizes(shuffled, g.offsets, g.adj, N)
  const largestRandom = randomSizes[0] ?? 0

  const domainAdvantage = largestRandom > 0 ? largestDomain / largestRandom : largestDomain
  // a spread of medium-and-up patches is the hierarchy (the tower); absolute sizes scale with N, so the
  // robust evidence of real selves is the ADVANTAGE over the random null, not an absolute cell count.
  const hierarchy = patchesOver50 >= 3
  const selvesEmerge = domainAdvantage > 3 && largestDomain >= 100 && hierarchy

  const solved = conserved && selvesEmerge

  return {
    n: N,
    nonzero,
    largestDomain,
    largestRandom,
    domainAdvantage,
    patchesOver50,
    patchesOver200,
    hierarchy,
    conserved,
    selvesEmerge,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/selves-at-scale',
  title: 'coherent self-patches emerge on the exact {5,3,4}, far larger than random, with a size hierarchy',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = selvesAtScale({ n: 60000 })
    const ok =
      r.solved && r.conserved && r.selvesEmerge && r.domainAdvantage > 3 && r.hierarchy
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'after the cohesive perception rule the coherent domains are far larger than a random null with the same tone counts and show a hierarchy of sizes',
      metrics: {
        largestDomain: r.largestDomain,
        domainAdvantage: r.domainAdvantage,
        patchesOver50: r.patchesOver50,
      },
      control: { largestRandom: r.largestRandom },
      notes:
        'uses a cohesion maintenance term that is not one of the five base things, a mid-layer result not pure substrate emergence',
    })
  },
})
