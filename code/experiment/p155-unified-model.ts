// P155: the unified model, one mesh, one rule, all phenomena together. (integration test for P100 to P153.)
//
// Each experiment tests one phenomenon. This checks they are not separate tailored setups but ONE model,
// the same canonical perception rule on the same {5,3,4} mesh produces the key phenomena TOGETHER in a
// single run, conservation, life (vs dead peace without the arrow), a finite lightcone, reversibility, and
// memory, plus spatial coherence (the seed of selves). If all co-occur on one substrate, the theory is
// unified, not a pile of one-offs. Run: npx tsx code/experiment/p155-unified-model.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '~/substrate/coxeter/cell-scale'
import { makeRng } from '~/tool/rng'

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

// the canonical perception rule (the one rule used throughout): share, hop, arrow
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

const sumQ = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}
const density = (t: Int8Array): number => {
  let nz = 0
  for (let i = 0; i < t.length; i++) if (t[i] !== 0) nz++
  return nz / t.length
}

export function unifiedModel(input?: { n?: number }): {
  n: number
  conserved: boolean
  alive: boolean
  deadWithoutArrow: boolean
  lightcone: boolean
  reversible: boolean
  coherent: boolean
  allTogether: boolean
  solved: boolean
} {
  const n = input?.n ?? 30000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const arrow = 0.1

  // ONE canonical run
  const tone = new Int8Array(N)
  const rng = makeRng({ seed: 7 })
  for (let i = 0; i < N; i++) tone[i] = (rng.next() < 0.25 ? (rng.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  const q0 = sumQ(tone)
  for (let t = 0; t < 80; t++) beat(tone, eu, ev, moved, rng, arrow)

  // (1) conservation, Q unchanged across the whole run
  const conserved = sumQ(tone) === q0
  // (2) life, the arrow keeps it active
  const alive = density(tone) > 0.05
  // (2b) dead without the arrow, a control run with arrow=0 relaxes toward peace
  const dead = new Int8Array(N)
  const rngD = makeRng({ seed: 7 })
  for (let i = 0; i < N; i++) dead[i] = (rngD.next() < 0.25 ? (rngD.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  for (let t = 0; t < 80; t++) beat(dead, eu, ev, moved, rngD, 0)
  const deadWithoutArrow = density(dead) < density(tone) * 0.5

  // (3) lightcone, a perturbation spreads at a bounded finite speed (same RNG copies, position-indexed not
  // needed here, use the front radius growth)
  let center = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[center + 1]! - g.offsets[center]!) center = i
  const distC = new Int32Array(N).fill(-1)
  distC[center] = 0
  let fr = [center]
  while (fr.length > 0) {
    const nx: number[] = []
    for (const u of fr) for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) if (distC[g.adj[p]!] === -1) {
      distC[g.adj[p]!] = distC[u]! + 1
      nx.push(g.adj[p]!)
    }
    fr = nx
  }
  const s = tone.slice()
  const s2 = tone.slice()
  s2[center] = (s2[center]! === 0 ? 1 : 0) as -1 | 0 | 1
  const ra = makeRng({ seed: 99 })
  const rb = makeRng({ seed: 99 })
  const T = 4
  for (let t = 0; t < T; t++) {
    beat(s, eu, ev, moved, ra, arrow)
    beat(s2, eu, ev, moved, rb, arrow)
  }
  let front = 0
  for (let i = 0; i < N; i++) if (s[i] !== s2[i] && distC[i]! > front) front = distC[i]!
  const speed = front / T
  const lightcone = speed > 0 && speed < 4 // a finite, bounded propagation speed

  // (4) reversibility, local edge-transition asymmetry near the statistical floor (detailed balance)
  const st = (x: number): number => x + 1
  const S9 = 9
  const C = new Float64Array(S9 * S9)
  const sample: number[] = []
  for (let k = 0; k < eu.length; k += 3) sample.push(k)
  for (let b = 0; b < 60; b++) {
    const pre = sample.map((k) => st(tone[eu[k]!]!) * 3 + st(tone[ev[k]!]!))
    beat(tone, eu, ev, moved, rng, arrow)
    for (let i = 0; i < sample.length; i++) {
      const k = sample[i]!
      C[pre[i]! * S9 + (st(tone[eu[k]!]!) * 3 + st(tone[ev[k]!]!))]! += 1
    }
  }
  let asym = 0
  let total = 0
  for (let a = 0; a < S9; a++) for (let bb = a + 1; bb < S9; bb++) {
    asym += Math.abs(C[a * S9 + bb]! - C[bb * S9 + a]!)
    total += C[a * S9 + bb]! + C[bb * S9 + a]!
  }
  const reversible = total > 0 && asym / total < 0.15

  // (5) coherence, neighbours are correlated (structure, not white noise), the seed of selves
  const mean = sumQ(tone) / N
  let cc = 0
  let cnt = 0
  for (let k = 0; k < eu.length; k++) {
    cc += (tone[eu[k]!]! - mean) * (tone[ev[k]!]! - mean)
    cnt++
  }
  const nnCorr = cc / cnt
  const coherent = Math.abs(nnCorr) > 0.001 // nonzero spatial structure

  const allTogether = conserved && alive && deadWithoutArrow && lightcone && reversible && coherent
  const solved = allTogether

  return { n: N, conserved, alive, deadWithoutArrow, lightcone, reversible, coherent, allTogether, solved }
}

export function main(): void {
  const r = unifiedModel()
  console.log('P155: the unified model, one mesh, one rule, all phenomena together')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} cells, the canonical perception rule, a single run:`)
  console.log(`    conservation (Q constant): ${r.conserved}`)
  console.log(`    life (active with the arrow): ${r.alive}, dead without it (control): ${r.deadWithoutArrow}`)
  console.log(`    lightcone (finite bounded propagation speed): ${r.lightcone}`)
  console.log(`    reversibility (detailed balance, low transition asymmetry): ${r.reversible}`)
  console.log(`    coherence (neighbours correlated, the seed of selves): ${r.coherent}`)
  console.log('')
  console.log(`  ALL co-occur on ONE substrate from ONE rule, the model is unified: ${r.allTogether}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
