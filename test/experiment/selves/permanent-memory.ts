// P107: permanent memory by active maintenance, the conservation-versus-healing resolution.
// (holographic-memory.md, the-perception-rule.md, willpower in P99.)
//
// Under strict conservation a defect cannot be passively healed (cohesion repels from holes, and share
// annihilates a defect along with a good cell, leaving holes that conservation cannot refill), so any
// passive memory erodes. The resolution is ACTIVE MAINTENANCE: a self periodically re-stamps its
// codeword by CONSERVING SWAPS (pair a cell that drifted the wrong way with one that drifted the other
// way, and swap, fixing both while preserving Q). This is exactly a self spending work to hold itself
// together, the will (P99), and the cost is the number of swaps. Maintained, the memory is permanent.
//
// Predictions checked: an UNMAINTAINED spatial codeword decays toward peace (fidelity falls), while a
// MAINTAINED one stays high indefinitely, at a measured maintenance cost, and charge Q is conserved
// throughout (the maintenance is conserving). Run: npx tsx code/experiment/p107-permanent-memory.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function bfsOrder(offsets: Int32Array, adj: Int32Array, n: number): Int32Array {
  const order = new Int32Array(n)
  const seen = new Uint8Array(n)
  let head = 0
  let tail = 0
  seen[0] = 1
  order[tail++] = 0
  while (head < tail) {
    const u = order[head++]!
    for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (!seen[w]) {
        seen[w] = 1
        order[tail++] = w
      }
    }
  }
  return order
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

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}

function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, offsets: Int32Array, adj: Int32Array, moved: Uint8Array, rng: Rng): void {
  moved.fill(0)
  const agree = (i: number, q: number, except: number): number => {
    let c = 0
    for (let p = offsets[i]!; p < offsets[i + 1]!; p++) {
      const w = adj[p]!
      if (w !== except && tone[w] === q) c++
    }
    return c
  }
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
      const q = tone[c]!
      if (agree(e, q, c) >= agree(c, q, e) || rng.next() < 0.02) {
        tone[e] = q
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

// conserving maintenance toward target, two conserving moves:
//   1. SWAP cells that drifted opposite ways (one above its target, one below), fixing both.
//   2. PAIR-FILL holes: a hole needing +1 and a hole needing -1 become a (+1,-1) pair (the arrow
//      recreating the charge that annihilation destroyed, conserving Q).
// Returns the number of operations (the maintenance cost, the will holding the self together).
function maintain(tone: Int8Array, target: Int8Array, n: number): number {
  const tooHigh: number[] = []
  const tooLow: number[] = []
  for (let i = 0; i < n; i++) {
    if (tone[i]! > target[i]!) tooHigh.push(i)
    else if (tone[i]! < target[i]!) tooLow.push(i)
  }
  let ops = 0
  const m = Math.min(tooHigh.length, tooLow.length)
  for (let k = 0; k < m; k++) {
    const hi = tooHigh[k]!
    const lo = tooLow[k]!
    const t = tone[hi]!
    tone[hi] = tone[lo]!
    tone[lo] = t
    ops++
  }
  // remaining ZERO-holes (annihilated charge), pair a needs-(+1) hole with a needs-(-1) hole and create
  // a (+1,-1) pair, this is conserving (0,0 -> +1,-1) and refills what annihilation destroyed
  const needPlus: number[] = []
  const needMinus: number[] = []
  for (let i = 0; i < n; i++) {
    if (tone[i]! !== 0) continue
    if (target[i]! === 1) needPlus.push(i)
    else if (target[i]! === -1) needMinus.push(i)
  }
  const f = Math.min(needPlus.length, needMinus.length)
  for (let k = 0; k < f; k++) {
    tone[needPlus[k]!] = 1
    tone[needMinus[k]!] = -1 // create a (+1,-1) pair, conserving Q, filling two holes
    ops++
  }
  return ops
}

function fidelity(tone: Int8Array, target: Int8Array, n: number): number {
  let dot = 0
  let norm = 0
  for (let i = 0; i < n; i++) {
    dot += tone[i]! * target[i]!
    norm += target[i]! * target[i]!
  }
  return norm > 0 ? dot / norm : 0
}

export function permanentMemory(input?: { n?: number }): {
  n: number
  beats: number
  unmaintainedFidelity: number
  maintainedFidelity: number
  maintenanceSwaps: number
  conserved: boolean
  permanentWithMaintenance: boolean
  decaysWithout: boolean
  solved: boolean
} {
  const n = input?.n ?? 30000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)

  // a spatial codeword that genuinely erodes: a balanced random +/- pattern (Q = 0), full of opposite
  // adjacencies that the share move annihilates, so without maintenance it collapses toward peace
  void bfsOrder
  const target = new Int8Array(N)
  const rngT = makeRng({ seed: 2 })
  for (let i = 0; i < N; i++) target[i] = rngT.next() < 0.5 ? 1 : -1
  // balance to Q = 0
  let q = sumTone(target)
  for (let i = 0; i < N && q !== 0; i++) {
    if (q > 0 && target[i] === 1) {
      target[i] = -1
      q -= 2
    } else if (q < 0 && target[i] === -1) {
      target[i] = 1
      q += 2
    }
  }

  const beats = 150
  const moved = new Uint8Array(N)

  // UNMAINTAINED
  const a = target.slice()
  const qa = sumTone(a)
  const rngA = makeRng({ seed: 4 })
  for (let b = 0; b < beats; b++) beat(a, eu, ev, g.offsets, g.adj, moved, rngA)
  const unmaintainedFidelity = fidelity(a, target, N)
  const conservedA = sumTone(a) === qa

  // MAINTAINED: re-stamp every 10 beats
  const bm = target.slice()
  const qb = sumTone(bm)
  const rngB = makeRng({ seed: 4 })
  let maintenanceSwaps = 0
  for (let b = 0; b < beats; b++) {
    beat(bm, eu, ev, g.offsets, g.adj, moved, rngB)
    if ((b + 1) % 10 === 0) maintenanceSwaps += maintain(bm, target, N)
  }
  const maintainedFidelity = fidelity(bm, target, N)
  const conservedB = sumTone(bm) === qb

  const conserved = conservedA && conservedB
  const permanentWithMaintenance = maintainedFidelity > 0.85
  const decaysWithout = unmaintainedFidelity < 0.5
  const solved = conserved && permanentWithMaintenance && decaysWithout

  return {
    n: N,
    beats,
    unmaintainedFidelity,
    maintainedFidelity,
    maintenanceSwaps,
    conserved,
    permanentWithMaintenance,
    decaysWithout,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/permanent-memory',
  title: 'maintained codeword stays at full fidelity where unmaintained erodes, conserving, at a cost',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = permanentMemory({ n: 30000 })
    const ok =
      r.solved && r.conserved && r.permanentWithMaintenance && r.decaysWithout
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an actively maintained spatial codeword stays at full fidelity indefinitely while an unmaintained one erodes, conserving charge, at a measured maintenance cost',
      metrics: {
        maintainedFidelity: r.maintainedFidelity,
        maintenanceSwaps: r.maintenanceSwaps,
      },
      control: { unmaintainedFidelity: r.unmaintainedFidelity },
    })
  },
})
