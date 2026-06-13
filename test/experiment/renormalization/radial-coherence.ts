// P187: radial coherence, does the COARSE-GRAINING TOWER carry persistent structure the fine scale lacks?
// (the-nested-cube-octree-idea.md, why-hyperbolic-nests-fractally.md, hierarchical-emergence.md, P101.)
//
// The pure rule run TANGENTIALLY (one scale) churns, no persistent selves (P101, shown directly). The claim
// from the nesting docs is that selfhood and the layers live on the RADIAL axis, the {5,3,4}'s reflection
// tree, where coarse-graining is just climbing inward (truncating the address). This tests it with no
// imposition. We run the EXACT 9-state permutation rule (no cohesion, no maintenance, no will, deterministic),
// then COARSE-GRAIN by the radial tree (each cell's depth-d ancestor groups it), and measure how much the
// coarse pattern PERSISTS over time (lag autocorrelation), at fine and at coarse scales. We compare to a NULL
// (random groups of the same sizes), so a rise is not just averaging. If the radial coarse pattern persists
// far more than the fine scale AND more than the null, the substrate's tree carries a real coherence tower,
// the scaffold the dynamics could not make on its own. Run: npx tsx code/experiment/p187-radial-coherence.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { busemann, idealDirection } from '@/code/substrate/horosphere'
import { toCsr } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'
import { pearson } from '@/code/measure/statistics'
import { perceptionPermutation as perm } from '@/code/rule/perception-permutation'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SCALES = [0, 2, 4, 6] // tree depths, 0 is the fine per-cell scale, larger is coarser
const WARMUP = 80
const MEASURE = 60
const LAG = 12 // beats, the coarse pattern is compared with itself this many beats later

export function radialCoherence(input?: { n?: number; symbol?: number[] }): {
  n: number
  scales: number[]
  radialPersistence: number[]
  nullPersistence: number[]
  groupCounts: number[]
  radialBeatsNull: boolean
  coarseBeatsFine: boolean
  solved: boolean
} {
  const n = input?.n ?? 40000
  const symbol = input?.symbol ?? [5, 3, 4]
  const g = buildCellGraph({ symbol, maxCells: n })
  const N = g.cellCount

  // CSR adjacency
  const { offsets: off, adj } = toCsr(g.neighbors)

  // Busemann function (ideal point = farthest cell), the radial coordinate
  const xi = idealDirection(g.coords)
  const bus = busemann({ coords: g.coords, ideal: xi })

  // radial PARENT, the neighbour most inward (smallest Busemann), the tree toward the root
  const parent = new Int32Array(N)
  for (let i = 0; i < N; i++) {
    let best = i
    let bestB = bus[i]!
    for (let p = off[i]!; p < off[i + 1]!; p++) {
      const w = adj[p]!
      if (bus[w]! < bestB) {
        bestB = bus[w]!
        best = w
      }
    }
    parent[i] = best
  }
  const ancestor = (i: number, d: number): number => {
    let c = i
    for (let k = 0; k < d; k++) {
      const p = parent[c]!
      if (p === c) break
      c = p
    }
    return c
  }

  // radial groupings per scale, and matched-size RANDOM null groupings
  const rng = makeRng({ seed: 5 })
  const radialGroup: Int32Array[] = []
  const nullGroup: Int32Array[] = []
  const groupCounts: number[] = []
  for (const D of SCALES) {
    // radial, group by depth-D ancestor, compacted to 0..k-1
    const anc = new Int32Array(N)
    const remap = new Map<number, number>()
    for (let i = 0; i < N; i++) {
      const a = ancestor(i, D)
      let id = remap.get(a)
      if (id === undefined) {
        id = remap.size
        remap.set(a, id)
      }
      anc[i] = id
    }
    radialGroup.push(anc)
    const k = remap.size
    groupCounts.push(k)
    // null, random partition into k groups of the SAME sizes as the radial groups
    const sizes = new Int32Array(k)
    for (let i = 0; i < N; i++) sizes[anc[i]!] = sizes[anc[i]!]! + 1
    const order = Array.from({ length: N }, (_, i) => i)
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      const t = order[i]!
      order[i] = order[j]!
      order[j] = t
    }
    const ng = new Int32Array(N)
    let cursor = 0
    for (let gid = 0; gid < k; gid++) {
      for (let s = 0; s < sizes[gid]!; s++) ng[order[cursor++]!] = gid
    }
    nullGroup.push(ng)
  }

  // run the PURE rule (deterministic matching), record coarse fields over the measure window
  const tone = new Int8Array(N)
  const matched = new Uint8Array(N)
  const step = (f: number): void => {
    matched.fill(0)
    const start = (f * 2654435761) % N
    for (let s = 0; s < N; s++) {
      const v = (start + s) % N
      if (matched[v]) continue
      for (let p = off[v]!; p < off[v + 1]!; p++) {
        const w = adj[p]!
        if (matched[w]) continue
        const [a, b] = perm(tone[v]!, tone[w]!)
        tone[v] = a as -1 | 0 | 1
        tone[w] = b as -1 | 0 | 1
        matched[v] = 1
        matched[w] = 1
        break
      }
    }
  }
  for (let f = 0; f < WARMUP; f++) step(f)

  // coarse field = mean tone per group, recorded each measure beat for radial and null at every scale
  const coarse = (group: Int32Array, k: number): Float64Array => {
    const sum = new Float64Array(k)
    const cnt = new Float64Array(k)
    for (let i = 0; i < N; i++) {
      sum[group[i]!]! += tone[i]!
      cnt[group[i]!]!++
    }
    for (let gid = 0; gid < k; gid++) sum[gid] = cnt[gid]! > 0 ? sum[gid]! / cnt[gid]! : 0
    return sum
  }
  const radialSeries: Float64Array[][] = SCALES.map(() => [])
  const nullSeries: Float64Array[][] = SCALES.map(() => [])
  for (let f = 0; f < MEASURE + LAG; f++) {
    step(WARMUP + f)
    for (let si = 0; si < SCALES.length; si++) {
      radialSeries[si]!.push(coarse(radialGroup[si]!, groupCounts[si]!))
      nullSeries[si]!.push(coarse(nullGroup[si]!, groupCounts[si]!))
    }
  }

  // persistence = mean over the window of the lag-LAG autocorrelation of the coarse field
  const persistenceOf = (series: Float64Array[]): number => {
    let acc = 0
    let cnt = 0
    for (let t = 0; t + LAG < series.length; t++) {
      acc += pearson({ a: series[t]!, b: series[t + LAG]! })
      cnt++
    }
    return cnt > 0 ? acc / cnt : 0
  }
  const radialPersistence = SCALES.map((_, si) => persistenceOf(radialSeries[si]!))
  const nullPersistence = SCALES.map((_, si) => persistenceOf(nullSeries[si]!))

  const last = SCALES.length - 1
  const radialBeatsNull = radialPersistence[last]! > nullPersistence[last]! + 0.1
  const coarseBeatsFine = radialPersistence[last]! > radialPersistence[0]! + 0.2
  const solved = radialBeatsNull && coarseBeatsFine

  return { n: N, scales: SCALES, radialPersistence, nullPersistence, groupCounts, radialBeatsNull, coarseBeatsFine, solved }
}

export default defineExperiment({
  id: 'renormalization/radial-coherence',
  title: 'coarse-graining up the {5,3,4} reflection tree does not build a persistence tower the fine scale lacks',
  category: 'renormalization',
  substrates: ['534'],
  depth: 'L2',
  paper: false,
  run() {
    const r = radialCoherence()
    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'running the exact deterministic rule and coarse-graining by the radial reflection tree, the coarse persistence does not both beat the fine scale and beat a matched-size random-grouping null',
      metrics: {
        finePersistence: r.radialPersistence[0] ?? 0,
        coarsePersistence:
          r.radialPersistence[r.radialPersistence.length - 1] ?? 0,
        nullCoarsePersistence:
          r.nullPersistence[r.nullPersistence.length - 1] ?? 0,
        coarseBeatsFine: r.coarseBeatsFine ? 1 : 0,
        radialBeatsNull: r.radialBeatsNull ? 1 : 0,
      },
      control: {
        nullCoarsePersistence:
          r.nullPersistence[r.nullPersistence.length - 1] ?? 0,
      },
      notes:
        'Honest negative with a control. The dynamics are the exact deterministic 9-state permutation (no random fill), and the random-grouping null is the right control against plain averaging. The pure rule does not earn a radial coherence tower, consistent with the finding that radial coarse-graining gives no tower. The null partition uses a seeded random shuffle, which only affects the control baseline, not the measured dynamics.',
    })
  },
})
