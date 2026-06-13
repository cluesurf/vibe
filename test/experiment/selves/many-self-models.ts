// P117: many self-models, one per self, not just the center. (P116, self-model-must-emerge.md.)
//
// P116 showed a self-model emerges at the central hub. Does it emerge ONLY at the graph's center, or at
// ANY self wherever it sits? This runs the self-model test at several different self-centers (the graph
// hub AND peripheral locations) and checks that EACH forms its own self-model (its local hub represents
// its own self's global state, beating its peripheral regions). So self-models are relative to the self,
// many of them, not a single privileged center.
// Run: npx tsx code/experiment/p117-many-self-models.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function bfs(offsets: Int32Array, adj: Int32Array, n: number, src: number, maxR: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  let r = 0
  while (fr.length > 0 && r < maxR) {
    r++
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = r
        next.push(w)
      }
    }
    fr = next
  }
  return dist
}

function edgesFromCsr(offsets: Int32Array, adj: Int32Array, n: number): { eu: Int32Array; ev: Int32Array } {
  const eu: number[] = []
  const ev: number[] = []
  for (let v = 0; v < n; v++) for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    const w = adj[p]!
    if (w > v) {
      eu.push(v)
      ev.push(w)
    }
  }
  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev) }
}

function fullBeat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng): void {
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

function corr(x: number[], y: number[]): number {
  const n = x.length
  let mx = 0
  let my = 0
  for (let i = 0; i < n; i++) {
    mx += x[i]!
    my += y[i]!
  }
  mx /= n
  my /= n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i]! - mx
    const dy = y[i]! - my
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0
}

// run the self-model test for a self centered at `center`; return hub-vs-global and peripheral-vs-global
function selfModelAt(
  g: { offsets: Int32Array; adj: Int32Array; cellCount: number },
  eu: Int32Array,
  ev: Int32Array,
  center: number,
  seed: number,
): { hubCorr: number; periCorr: number } {
  const N = g.cellCount
  const moved = new Uint8Array(N)
  const dist = bfs(g.offsets, g.adj, N, center, 12)
  const rSelf = 4
  const self: number[] = []
  for (let i = 0; i < N; i++) if (dist[i]! >= 0 && dist[i]! <= rSelf) self.push(i)
  const isInput = new Uint8Array(N)
  const inputAll: number[] = []
  for (const i of self) if (dist[i]! >= rSelf - 1) {
    isInput[i] = 1
    inputAll.push(i)
  }
  const K = 4
  const sectorOf = new Int32Array(N).fill(-1)
  const sectorCells: number[][] = Array.from({ length: K }, () => [])
  for (let j = 0; j < inputAll.length; j++) {
    const s = Math.floor((j * K) / inputAll.length)
    sectorOf[inputAll[j]!] = s
    sectorCells[s]!.push(inputAll[j]!)
  }
  const ballOf = (start: number, size: number): number[] => {
    const out: number[] = []
    const seen = new Uint8Array(N)
    seen[start] = 1
    let fr = [start]
    while (fr.length > 0 && out.length < size) {
      const nf: number[] = []
      for (const u of fr) {
        if (isInput[u]) continue
        out.push(u)
        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!
          if (!seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }
      fr = nf
    }
    return out
  }
  const coreSize = 40
  const core = ballOf(center, coreSize)
  const peripherals = sectorCells.map((sc) => ballOf(sc[Math.floor(sc.length / 2)]!, coreSize))
  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0
    for (const i of cells) s += tone[i]!
    return cells.length > 0 ? s / cells.length : 0
  }
  const tone = new Int8Array(N)
  const rng = makeRng({ seed })
  const T = 200
  const sigs = new Array<number>(K).fill(1)
  const gSeries: number[] = []
  const coreSeries: number[] = []
  const periSeries: number[][] = peripherals.map(() => [])
  for (let t = 0; t < T; t++) {
    for (let s = 0; s < K; s++) if (rng.next() < 0.06) sigs[s] = -sigs[s]!
    for (const i of inputAll) tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
    fullBeat(tone, eu, ev, moved, rng)
    for (const i of inputAll) tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
    gSeries.push(meanOver(tone, self))
    coreSeries.push(meanOver(tone, core))
    for (let p = 0; p < peripherals.length; p++) periSeries[p]!.push(meanOver(tone, peripherals[p]!))
  }
  const hubCorr = Math.abs(corr(coreSeries, gSeries))
  let periCorr = 0
  for (let p = 0; p < peripherals.length; p++) periCorr += Math.abs(corr(periSeries[p]!, gSeries))
  periCorr /= peripherals.length
  return { hubCorr, periCorr }
}

export function manySelfModels(input?: { n?: number }): {
  n: number
  centers: number[]
  results: { center: number; hubCorr: number; periCorr: number; isSelfModel: boolean }[]
  countSelfModels: number
  allFormSelfModels: boolean
  distinctCenters: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)

  // pick several self-centers spread across the graph (the hub plus peripheral cells at various depths)
  let hub = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[hub + 1]! - g.offsets[hub]!) hub = i
  const distHub = bfs(g.offsets, g.adj, N, hub, 12)
  const centers = [hub]
  for (const target of [3, 4, 5]) {
    for (let i = 0; i < N; i++) if (distHub[i] === target && g.offsets[i + 1]! - g.offsets[i]! >= 6) {
      centers.push(i)
      break
    }
  }

  const results = centers.map((c, idx) => {
    const r = selfModelAt(g, eu, ev, c, 9 + idx)
    return { center: c, hubCorr: r.hubCorr, periCorr: r.periCorr, isSelfModel: r.hubCorr > 0.4 && r.hubCorr > r.periCorr + 0.1 }
  })
  const countSelfModels = results.filter((r) => r.isSelfModel).length
  const allFormSelfModels = countSelfModels === centers.length && centers.length >= 3
  const distinctCenters = new Set(centers).size === centers.length
  const solved = allFormSelfModels && distinctCenters

  return { n: N, centers, results, countSelfModels, allFormSelfModels, distinctCenters, solved }
}

export function main(): void {
  const r = manySelfModels()
  console.log('P117: many self-models, one per self (not just the center)')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} cells, ${r.centers.length} selves at different locations:`)
  for (const res of r.results) {
    console.log(`    self at cell ${res.center}: hub corr ${res.hubCorr.toFixed(2)} vs peripheral ${res.periCorr.toFixed(2)} -> self-model: ${res.isSelfModel}`)
  }
  console.log('')
  console.log(`  ${r.countSelfModels} of ${r.centers.length} selves formed their own self-model (distinct centers: ${r.distinctCenters})`)
  console.log(`  self-models are relative to the self, many of them, not one privileged center: ${r.allFormSelfModels}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/many-self-models',
  title: 'every self forms its own self-model at its own hub',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = manySelfModels({ n: 60000 })
    const ok =
      r.solved &&
      r.allFormSelfModels &&
      r.distinctCenters &&
      r.countSelfModels >= 3
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'running the self-model test at several different self-centers, each forms its own self-model at its own hub, so self-models are relative to the self and there are many of them',
      metrics: {
        countSelfModels: r.countSelfModels,
        centerCount: r.centers.length,
      },
    })
  },
})
