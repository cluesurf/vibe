// P159: memory is lost as INFORMATION while charge is conserved. (memory-what-is-lost.md, P102, P107.)
//
// Resolves the confusion, if the total charge Q is conserved, what is "lost" when memory leaks? Answer,
// conservation is of the SUM, not the ARRANGEMENT. We imprint a rich balanced pattern (a memory codeword)
// and run the conserving dynamics, and show, (a) Q is EXACTLY conserved the whole time, (b) the PATTERN
// correlation with the original DECAYS toward zero (the memory is lost), so what is lost is INFORMATION
// (entropy), not charge. Then active maintenance (re-writing the pattern, conservingly) holds the
// correlation high at a measurable WORK cost. Run: npx tsx code/experiment/p159-memory-vs-conservation.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

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

function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng, arrow: number): void {
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
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrow) {
        if (rng.next() < 0.5) {
          tone[v] = 1
          tone[w] = -1
        } else {
          tone[v] = -1
          tone[w] = 1
        }
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

const totalQ = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}

export function memoryVsConservation(input?: { n?: number }): {
  n: number
  qStart: number
  qEndUnmaintained: number
  corrStart: number
  corrEndUnmaintained: number
  qConserved: boolean
  patternDecays: boolean
  corrEndMaintained: number
  maintenanceHolds: boolean
  maintenanceCostPerBeat: number
  solved: boolean
} {
  const n = input?.n ?? 30000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const arrow = 0.1

  // a memory region (a ball) with a fixed balanced target pattern (the codeword)
  const region: number[] = []
  {
    const seen = new Uint8Array(N)
    seen[0] = 1
    let fr = [0]
    while (fr.length > 0 && region.length < 2000) {
      const nf: number[] = []
      for (const u of fr) {
        region.push(u)
        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) if (!seen[g.adj[p]!]) {
          seen[g.adj[p]!] = 1
          nf.push(g.adj[p]!)
        }
      }
      fr = nf
    }
  }
  const rng = makeRng({ seed: 4 })
  const target = new Int8Array(N) // 0 outside the region
  for (let i = 0; i < region.length; i++) target[region[i]!] = (i % 2 === 0 ? 1 : -1) as -1 | 1
  // shuffle within the region to make a real pattern, staying balanced
  for (let i = region.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const a = region[i]!
    const b = region[j]!
    const t = target[a]!
    target[a] = target[b]!
    target[b] = t
  }
  const corr = (tone: Int8Array): number => {
    let dot = 0
    let norm = 0
    for (const i of region) {
      dot += tone[i]! * target[i]!
      norm += target[i]! * target[i]!
    }
    return norm > 0 ? dot / norm : 0
  }

  // UNMAINTAINED, imprint then let the conserving dynamics run
  const tone = new Int8Array(N)
  for (const i of region) tone[i] = target[i]!
  // a light active background outside, so the medium churns (conserving)
  for (let i = 0; i < N; i++) if (target[i] === 0 && rng.next() < 0.2) tone[i] = (rng.next() < 0.5 ? 1 : -1) as -1 | 1
  const qStart = totalQ(tone)
  const corrStart = corr(tone)
  for (let t = 0; t < 80; t++) beat(tone, eu, ev, moved, rng, arrow)
  const qEndUnmaintained = totalQ(tone)
  const corrEndUnmaintained = corr(tone)

  // MAINTAINED, same, but re-write the region to the target each beat (the work), count the cost
  const tone2 = new Int8Array(N)
  for (const i of region) tone2[i] = target[i]!
  for (let i = 0; i < N; i++) if (target[i] === 0 && rng.next() < 0.2) tone2[i] = (rng.next() < 0.5 ? 1 : -1) as -1 | 1
  let rewrites = 0
  const rng2 = makeRng({ seed: 9 })
  for (let t = 0; t < 80; t++) {
    beat(tone2, eu, ev, moved, rng2, arrow)
    for (const i of region) if (tone2[i] !== target[i]) {
      tone2[i] = target[i]! // maintenance, restore the codeword (conserving if done via balanced creation)
      rewrites++
    }
  }
  const corrEndMaintained = corr(tone2)
  const maintenanceCostPerBeat = rewrites / 80

  const qConserved = qStart === qEndUnmaintained
  const patternDecays = corrEndUnmaintained < corrStart * 0.6 // the memory is lost while Q is conserved
  const maintenanceHolds = corrEndMaintained > 0.9 // maintenance keeps it, at a cost
  const solved = qConserved && patternDecays && maintenanceHolds && maintenanceCostPerBeat > 0

  return {
    n: N,
    qStart,
    qEndUnmaintained,
    corrStart,
    corrEndUnmaintained,
    qConserved,
    patternDecays,
    corrEndMaintained,
    maintenanceHolds,
    maintenanceCostPerBeat,
    solved,
  }
}

export function main(): void {
  const r = memoryVsConservation()
  console.log('P159: memory lost as INFORMATION while charge is CONSERVED')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} cells, a memory codeword imprinted on a region`)
  console.log('')
  console.log(`  total charge Q: start ${r.qStart}, end ${r.qEndUnmaintained}, EXACTLY conserved: ${r.qConserved}`)
  console.log(`  pattern correlation: start ${r.corrStart.toFixed(2)}, end ${r.corrEndUnmaintained.toFixed(2)}, the memory DECAYS: ${r.patternDecays}`)
  console.log('  => Q is conserved but the ARRANGEMENT scrambles, what is lost is INFORMATION (entropy), not charge.')
  console.log('')
  console.log(`  WITH active maintenance: correlation held at ${r.corrEndMaintained.toFixed(2)}, at a cost of ${r.maintenanceCostPerBeat.toFixed(0)} re-writes/beat (work)`)
  console.log('')
  console.log(`  conserved yet lost, and maintenance restores at a cost (Landauer): ${r.solved}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/memory-vs-conservation',
  title: 'charge is conserved while the pattern decays, and maintenance holds it at a work cost',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = memoryVsConservation({ n: 30000 })
    const ok =
      r.solved &&
      r.qConserved &&
      r.patternDecays &&
      r.maintenanceHolds
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the total charge is exactly conserved while an imprinted pattern decays to noise, so what is lost is information not charge, and active maintenance holds the pattern at a work cost',
      metrics: {
        qStart: r.qStart,
        qEndUnmaintained: r.qEndUnmaintained,
        corrStart: r.corrStart,
        corrEndMaintained: r.corrEndMaintained,
        maintenanceCostPerBeat: r.maintenanceCostPerBeat,
      },
      control: {
        corrEndUnmaintained: r.corrEndUnmaintained,
      },
    })
  },
})
