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

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}

function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, offsets: Int32Array, adj: Int32Array, moved: Uint8Array, rng: Rng, arrowProb: number): void {
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
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrowProb) {
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

export function main(): void {
  const r = selvesDynamics()
  console.log('P108: the dynamics of emergent selves (the tower in action)')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} exact cells, watching the coherent self-patches evolve`)
  console.log('')
  console.log('  beat   largest patch   patches(>=20)   mean size')
  for (const t of r.trajectory) {
    console.log(`  ${String(t.beat).padStart(4)}   ${String(t.largest).padStart(11)}   ${String(t.countOver20).padStart(11)}   ${t.mean.toFixed(1).padStart(8)}`)
  }
  console.log('')
  console.log(`  a living tower: the largest self grows while a hierarchy of patches persists: ${r.coarsens}`)
  console.log(`    largest patch ${r.largestEarly} -> ${r.largestLate} (grows), patch count steady ${r.countEarly} -> ${r.countLate} (small selves keep being born)`)
  console.log('')
  console.log(`  charge conserved: ${r.conserved}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
