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

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'

// the exact 9-state perception permutation on an ordered pair
function perm(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]
  if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]
  if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]
  if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return [1, -1]
  if (a === 1 && b === -1) return [-1, 1]
  return [0, 0]
}

const SCALES = [0, 2, 4, 6] // tree depths, 0 is the fine per-cell scale, larger is coarser
const WARMUP = 80
const MEASURE = 60
const LAG = 12 // beats, the coarse pattern is compared with itself this many beats later

// pearson correlation of two equal-length vectors
function pearson(a: Float64Array, b: Float64Array): number {
  const m = a.length
  let ma = 0
  let mb = 0
  for (let i = 0; i < m; i++) {
    ma += a[i]!
    mb += b[i]!
  }
  ma /= m
  mb /= m
  let num = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < m; i++) {
    const da = a[i]! - ma
    const db = b[i]! - mb
    num += da * db
    va += da * da
    vb += db * db
  }
  return va > 0 && vb > 0 ? num / Math.sqrt(va * vb) : 0
}

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
  const dim = g.coords[0]!.length

  // CSR adjacency
  const off = new Int32Array(N + 1)
  for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!)
  {
    let p = 0
    for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w
  }

  // Busemann function (ideal point = farthest cell), the radial coordinate
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  let far = 0
  let fr = -1
  for (let i = 0; i < N; i++) {
    const r = norm(g.coords[i]!)
    if (r > fr) {
      fr = r
      far = i
    }
  }
  const fc = g.coords[far]!
  const fn = norm(fc)
  const xi = fc.map((v) => v / fn)
  const bus = g.coords.map((x) => {
    let d2 = 0
    for (let k = 0; k < dim; k++) d2 += (x[k]! - xi[k]!) ** 2
    return Math.log(d2 / Math.max(1e-12, 1 - x.reduce((s, v) => s + v * v, 0)))
  })

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
      acc += pearson(series[t]!, series[t + LAG]!)
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

export function main(): void {
  const r = radialCoherence()
  console.log('P187: radial coherence, does coarse-graining up the reflection tree reveal a persistence tower?')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} bulk cells, pure rule (no interventions), persistence = lag-${LAG} autocorrelation of the coarse field`)
  console.log('')
  console.log(`  ${'scale (depth)'.padEnd(16)} ${'groups'.padEnd(10)} ${'radial'.padEnd(10)} null`)
  for (let si = 0; si < r.scales.length; si++) {
    console.log(`  ${String(r.scales[si]).padEnd(16)} ${String(r.groupCounts[si]).padEnd(10)} ${r.radialPersistence[si]!.toFixed(3).padEnd(10)} ${r.nullPersistence[si]!.toFixed(3)}`)
  }
  console.log('')
  console.log(`  coarse persists far more than fine (a tower): ${r.coarseBeatsFine}`)
  console.log(`  radial beats the random-grouping null (the tree, not just averaging): ${r.radialBeatsNull}`)
  console.log('')
  console.log('  => if both hold, the substrate radial tree carries a real coherence tower the tangential')
  console.log('     dynamics could not make on its own, selfhood and the layers live on the scale axis.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
