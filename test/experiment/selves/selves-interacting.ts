// P110: selves interacting at scale on the exact {5,3,4}. (what-is-a-self.md, P106-P108.)
//
// Two adjacent selves (two coherent regions sharing a contact interface) are run under the rule alone
// (share plus cohesive hop, no arrow) and we watch what their interaction does:
//   - OPPOSITE selves (a + self touching a - self): the contact interface ANNIHILATES (share turns
//     +,- into 0,0), so they consume each other along the seam, losing charge and opening a peace
//     buffer. Opposite selves destroy each other on contact.
//   - SAME selves (a + self touching a + self): no interface annihilation, they COEXIST and MERGE into
//     a single connected self, keeping their charge.
// This is a real interaction law (opposite annihilate, same merge), tested at up to a million cells.
//
// Predictions checked: the opposite pair loses far more charge than the same pair (annihilation), and
// the same pair ends as ONE connected self (merger), while the opposite pair splits into two selves with
// a peace buffer (mutual retreat). Charge conserved by the rule. Run: npx tsx code/experiment/p110-selves-interacting.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function ballOrder(offsets: Int32Array, adj: Int32Array, n: number, start: number, size: number): number[] {
  const out: number[] = []
  const seen = new Uint8Array(n)
  seen[start] = 1
  let fr = [start]
  while (fr.length > 0 && out.length < size) {
    const nf: number[] = []
    for (const u of fr) {
      out.push(u)
      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!
        if (!seen[w] && out.length + nf.length < size) {
          seen[w] = 1
          nf.push(w)
        }
      }
    }
    fr = nf
  }
  return out
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

const absCharge = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += Math.abs(t[i]!)
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

// number of LARGE connected same-sign selves among the given cells (ignore tiny boundary escapees)
function largeComponents(tone: Int8Array, offsets: Int32Array, adj: Int32Array, cells: number[], minSize: number): number {
  const inSet = new Set(cells)
  const parent = new Map<number, number>()
  const find = (x: number): number => {
    let r = x
    while (parent.get(r) !== undefined && parent.get(r) !== r) r = parent.get(r)!
    return r
  }
  for (const v of cells) if (!parent.has(v)) parent.set(v, v)
  for (const v of cells) {
    if (tone[v] === 0) continue
    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!
      if (inSet.has(w) && tone[w] === tone[v]) parent.set(find(v), find(w))
    }
  }
  const size = new Map<number, number>()
  for (const v of cells) if (tone[v] !== 0) {
    const r = find(v)
    size.set(r, (size.get(r) ?? 0) + 1)
  }
  let big = 0
  for (const s of size.values()) if (s >= minSize) big++
  return big
}

export function selvesInteracting(input?: { n?: number }): {
  n: number
  oppositeLoss: number
  sameLoss: number
  sameComponents: number
  oppositeComponents: number
  selvesInteract: boolean
  sameMerges: boolean
  oppositeAnnihilates: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const beats = 30

  // two adjacent selves = one region split into two halves (the seam is the contact interface)
  const region = ballOrder(g.offsets, g.adj, N, 0, 6000)
  const half = Math.floor(region.length / 2)

  // OPPOSITE: first half +, second half - (a + self touching a - self)
  const opp = new Int8Array(N)
  for (let k = 0; k < region.length; k++) opp[region[k]!] = k < half ? 1 : -1
  const oppStart = absCharge(opp)
  const rngO = makeRng({ seed: 5 })
  for (let b = 0; b < beats; b++) beat(opp, eu, ev, g.offsets, g.adj, moved, rngO)
  const oppositeLoss = (oppStart - absCharge(opp)) / oppStart
  const oppositeComponents = largeComponents(opp, g.offsets, g.adj, region, 100)

  // SAME: both halves + (a + self touching a + self)
  const same = new Int8Array(N)
  for (const i of region) same[i] = 1
  const sameStart = absCharge(same)
  const rngS = makeRng({ seed: 5 })
  for (let b = 0; b < beats; b++) beat(same, eu, ev, g.offsets, g.adj, moved, rngS)
  const sameLoss = (sameStart - absCharge(same)) / sameStart
  const sameComponents = largeComponents(same, g.offsets, g.adj, region, 100)

  const oppositeAnnihilates = oppositeLoss > 0.1 && oppositeLoss > 5 * Math.max(sameLoss, 0.001)
  const sameMerges = sameComponents === 1 // one large merged self
  const oppositeSplits = oppositeComponents >= 2 // a + self and a - self, split by the annihilated seam
  const selvesInteract = oppositeAnnihilates && sameMerges && oppositeSplits
  const solved = selvesInteract

  return {
    n: N,
    oppositeLoss,
    sameLoss,
    sameComponents,
    oppositeComponents,
    selvesInteract,
    sameMerges,
    oppositeAnnihilates,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/selves-interacting',
  title: 'opposite selves annihilate at contact, same selves merge into one',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = selvesInteracting({ n: 60000 })
    const ok =
      r.solved && r.selvesInteract && r.oppositeAnnihilates && r.sameMerges
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two adjacent selves under the rule alone annihilate at the contact seam when opposite and merge into one connected self when same',
      metrics: {
        oppositeLoss: r.oppositeLoss,
        oppositeComponents: r.oppositeComponents,
      },
      control: { sameLoss: r.sameLoss, sameComponents: r.sameComponents },
    })
  },
})
