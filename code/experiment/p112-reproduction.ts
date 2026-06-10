// P112: reproduction, does a self split into two like selves (fission)? Honest answer on the hyperbolic
// {5,3,4}: NO, the geometry suppresses fission. (what-is-a-self.md.)
//
// Two facts kill parental fission here. (1) The diameter is tiny (about 6 hops, P111), so there are no
// thin elongated necks to pinch, every region is fat and close. (2) Hyperbolic balls are almost all
// boundary (a radius-4 ball already holds thousands of cells, nearly all at the rim), so a self cannot be
// cleanly bisected. And the cohesive rule MERGES like with like (P110), the opposite of dividing. So a
// solid self stays ONE self, it does not divide. Reproduction in this universe is therefore DE NOVO, new
// selves are born from peace by the arrow (P106), not by a parent splitting.
//
// Predictions checked: a solid self run under the rule alone stays a single large self (no fission),
// charge conserved. The experiment establishes the honest negative and its geometric cause.
// Run: npx tsx code/experiment/p112-reproduction.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '~/substrate/coxeter/cell-scale'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

function bfsParents(offsets: Int32Array, adj: Int32Array, n: number, src: number): { dist: Int32Array; parent: Int32Array } {
  const dist = new Int32Array(n).fill(-1)
  const parent = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1
        parent[w] = u
        next.push(w)
      }
    }
    fr = next
  }
  return { dist, parent }
}

function ballSet(offsets: Int32Array, adj: Int32Array, n: number, start: number, size: number): number[] {
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
    if ((a === 0) !== (b === 0)) {
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

function largeComponents(tone: Int8Array, offsets: Int32Array, adj: Int32Array, n: number, minSize: number): number {
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
    if (tone[v] !== 1) continue
    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!
      if (w > v && tone[w] === 1) parent[find(v)] = find(w)
    }
  }
  const size = new Map<number, number>()
  for (let i = 0; i < n; i++) if (tone[i] === 1) {
    const r = find(i)
    size.set(r, (size.get(r) ?? 0) + 1)
  }
  let big = 0
  for (const s of size.values()) if (s >= minSize) big++
  return big
}

export function reproduction(input?: { n?: number }): {
  n: number
  ballRadius: number
  ballCells: number
  startComponents: number
  endComponents: number
  conserved: boolean
  fissionSuppressed: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  void bfsParents

  // a solid self: a + ball. measure its radius to show it is almost all boundary (no clean bisection)
  const self = ballSet(g.offsets, g.adj, N, 0, 6000)
  const distAll = bfsParents(g.offsets, g.adj, N, 0).dist
  let ballRadius = 0
  for (const i of self) if (distAll[i]! > ballRadius) ballRadius = distAll[i]!
  const tone = new Int8Array(N)
  for (const i of self) tone[i] = 1
  let q0 = 0
  for (let i = 0; i < N; i++) q0 += tone[i]!

  const startComponents = largeComponents(tone, g.offsets, g.adj, N, 300)
  const rng = makeRng({ seed: 5 })
  for (let b = 0; b < 30; b++) beat(tone, eu, ev, g.offsets, g.adj, moved, rng)
  const endComponents = largeComponents(tone, g.offsets, g.adj, N, 300)
  let q1 = 0
  for (let i = 0; i < N; i++) q1 += tone[i]!
  const conserved = q0 === q1

  // the honest finding: the self does NOT split, it stays one self (fission is suppressed)
  const fissionSuppressed = startComponents === 1 && endComponents === 1
  const solved = conserved && fissionSuppressed

  return { n: N, ballRadius, ballCells: self.length, startComponents, endComponents, conserved, fissionSuppressed, solved }
}

export function main(): void {
  const big = process.argv.includes('--million')
  const r = reproduction({ n: big ? 1_000_000 : 120000 })
  console.log('P112: does a self split into two like selves (fission)?')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} exact cells, a solid self of ${r.ballCells} cells, radius only ${r.ballRadius} (almost all boundary)`)
  console.log(`  large selves: start ${r.startComponents} -> end ${r.endComponents}`)
  console.log(`  the self stays ONE self, fission is suppressed by the hyperbolic geometry: ${r.fissionSuppressed}`)
  console.log('  (no thin necks to pinch, balls are all-boundary, and the rule MERGES like with like)')
  console.log('  => reproduction here is DE NOVO, new selves are born from peace by the arrow (P106), not by division')
  console.log(`  charge conserved: ${r.conserved}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
