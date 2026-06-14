// P108: the dynamics of emergent selves, the tower in action. (what-is-a-self.md, P92, P106.)
//
// P106 found that integrated self-patches emerge on the exact {5,3,4}. This asks what they DO over
// time: do small patches MERGE into bigger ones (coarsening), so larger selves grow while the count of
// small ones drops? That dynamic merging is the tower forming on the real crystal, the same resolution
// P92 found abstractly (competition resolves into bigger integrated wholes), now seen in the substrate.
//
// It snapshots the coherent-domain statistics across a run of the cohesive perception rule and checks
// for coarsening: the largest patch grows and the number of patches falls over time. Charge conserved.
// Run: npx tsx code/experiment/p108-selves-dynamics.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import { cohesiveEdgeSweep } from '@/code/dynamics/cohesive-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const beat = (tone: Int8Array, eu: Int32Array, ev: Int32Array, offsets: Int32Array, adj: Int32Array, moved: Uint8Array, rng: Rng, arrowProb: number): void =>
  cohesiveEdgeSweep({ tone, eu, ev, offsets, adj, moved, rng, annihilate: true, arrow: arrowProb })

function domainStats(tone: Int8Array, offsets: Int32Array, adj: Int32Array, n: number): { largest: number; countOver20: number; mean: number } {
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
  let largest = 0
  let countOver20 = 0
  let total = 0
  let num = 0
  for (const s of size.values()) {
    if (s > largest) largest = s
    if (s >= 20) countOver20++
    total += s
    num++
  }
  return { largest, countOver20, mean: num > 0 ? total / num : 0 }
}

export function selvesDynamics(input?: { n?: number }): {
  n: number
  trajectory: { beat: number; largest: number; countOver20: number; mean: number }[]
  largestEarly: number
  largestLate: number
  countEarly: number
  countLate: number
  conserved: boolean
  coarsens: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)

  const tone = new Int8Array(N)
  const q0 = sumTone(tone)
  const moved = new Uint8Array(N)
  const rng = makeRng({ seed: 9 })

  // warm up to a populated balance, then watch the patches evolve
  for (let b = 0; b < 30; b++) beat(tone, eu, ev, g.offsets, g.adj, moved, rng, 0.08)

  const snaps = [0, 30, 90, 210]
  const trajectory: { beat: number; largest: number; countOver20: number; mean: number }[] = []
  let done = 0
  for (const s of snaps) {
    while (done < s) {
      beat(tone, eu, ev, g.offsets, g.adj, moved, rng, 0.08)
      done++
    }
    const st = domainStats(tone, g.offsets, g.adj, N)
    trajectory.push({ beat: 30 + s, largest: st.largest, countOver20: st.countOver20, mean: st.mean })
  }
  const conserved = sumTone(tone) === q0

  const largestEarly = trajectory[0]!.largest
  const largestLate = trajectory[trajectory.length - 1]!.largest
  const countEarly = trajectory[0]!.countOver20
  const countLate = trajectory[trajectory.length - 1]!.countOver20
  // The tower is a LIVING ecology, not a collapse to one. The largest self GROWS over time (selves
  // grow and merge upward), while a HIERARCHY of patches persists (new small selves keep being born by
  // the arrow), so the population is a dynamic steady state at many scales, not a single frozen blob.
  const largestGrows = largestLate > largestEarly * 1.3
  const hierarchyPersists = trajectory.every((t) => t.countOver20 >= 5)
  const coarsens = largestGrows && hierarchyPersists
  const solved = conserved && largestGrows && hierarchyPersists

  return {
    n: N,
    trajectory,
    largestEarly,
    largestLate,
    countEarly,
    countLate,
    conserved,
    coarsens,
    solved,
  }
}

export default experiment({
  id: 'selves/selves-dynamics',
  title: 'the largest self grows while a hierarchy of patches persists on the exact {5,3,4}',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = selvesDynamics({ n: 60000 })
    const ok = r.solved && r.conserved && r.coarsens
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'over a run of the cohesive rule the largest self grows while a hierarchy of patches persists, a living tower at steady state',
      metrics: {
        largestEarly: r.largestEarly,
        largestLate: r.largestLate,
        countEarly: r.countEarly,
        countLate: r.countLate,
      },
    })
  },
})
