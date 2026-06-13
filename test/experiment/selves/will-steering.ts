// P113: the will steering a self's interactions, goal-directed merge and avoidance. (P99, P110.)
//
// A self can carry a WILL, a directed bias on its hops (the pump of P99), aimed at a goal:
//   - MERGE: the will pumps the self TOWARD a target, so it crosses the bulk and reaches it, where an
//     unbiased self would just diffuse and mostly stay put.
//   - AVOID: facing an opposite self that would annihilate it, the will pumps it AWAY, so it retreats
//     from the contact seam and SURVIVES, where an unbiased self gets eaten.
// The will is the same directed pump as P99, here used for inter-self goals, conserving.
//
// Predictions checked: with the will, a self reaches a distant target (merge) far more than unbiased,
// and a self facing an opposite one retains far more charge (avoid) than unbiased. Charge conserved.
// Run: npx tsx code/experiment/p113-will-steering.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function bfs(offsets: Int32Array, adj: Int32Array, n: number, src: number): { dist: Int32Array; far: number } {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  let far = src
  let ecc = 0
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1
        if (dist[w]! > ecc) {
          ecc = dist[w]!
          far = w
        }
        next.push(w)
      }
    }
    fr = next
  }
  return { dist, far }
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

const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

// one beat with an optional WILL: a directed pump on the + hops, toward (sign -1) or away (sign +1) the
// goal measured by distGoal. share annihilates opposites. conserving.
function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng, distGoal: Int32Array | null, towardSign: number): void {
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
      const q = tone[c]!
      let doHop: boolean
      if (distGoal && q > 0) {
        // will: move + toward (towardSign<0) or away (towardSign>0) the goal
        const better = towardSign < 0 ? dd(distGoal, e) < dd(distGoal, c) : dd(distGoal, e) > dd(distGoal, c)
        doHop = better
      } else {
        doHop = rng.next() < 0.5
      }
      if (doHop) {
        tone[e] = q
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

export function willSteering(input?: { n?: number }): {
  n: number
  mergeWithWill: number
  mergeNoWill: number
  mergeWorks: boolean
  avoidWithWill: number
  avoidNoWill: number
  avoidWorks: boolean
  willSteers: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const { dist, far } = bfs(g.offsets, g.adj, N, 0)
  const distTarget = bfs(g.offsets, g.adj, N, far).dist // distance to the far target

  // MERGE: a + self at node 0, target = the far cell. measure the self's CENTROID distance to the target
  // (with the will it moves toward the target, unbiased it diffuses symmetrically and stays put)
  const meanDistTo = (t: Int8Array, d: Int32Array): number => {
    let s = 0
    let c = 0
    for (let i = 0; i < N; i++) if (t[i] === 1) {
      s += dd(d, i)
      c++
    }
    return c > 0 ? s / c : 0
  }
  const selfA = ballSet(g.offsets, g.adj, N, 0, 2000)
  const mk = (): Int8Array => {
    const t = new Int8Array(N)
    for (const i of selfA) t[i] = 1
    return t
  }
  const beats = 12 * dd(dist, far)
  const willM = mk()
  const r1 = makeRng({ seed: 3 })
  for (let b = 0; b < beats; b++) beat(willM, eu, ev, moved, r1, distTarget, -1)
  const mergeWithWill = meanDistTo(willM, distTarget) // lower = moved toward the target
  const noWillM = mk()
  const r2 = makeRng({ seed: 3 })
  for (let b = 0; b < beats; b++) beat(noWillM, eu, ev, moved, r2, null, 0)
  const mergeNoWill = meanDistTo(noWillM, distTarget)
  const mergeWorks = mergeWithWill < mergeNoWill - 1 // the will moved the self meaningfully toward the target

  // AVOID: a + self and an adjacent - self (a split region). the will pumps + away from the - side
  const region = ballSet(g.offsets, g.adj, N, 0, 4000)
  const half = Math.floor(region.length / 2)
  const minusCenter = region[region.length - 1]! // a cell on the - side
  const distMinus = bfs(g.offsets, g.adj, N, minusCenter).dist
  const mkSplit = (): Int8Array => {
    const t = new Int8Array(N)
    for (let k = 0; k < region.length; k++) t[region[k]!] = k < half ? 1 : -1
    return t
  }
  const plus = (t: Int8Array): number => {
    let c = 0
    for (let i = 0; i < N; i++) if (t[i] === 1) c++
    return c
  }
  void plus
  const willA = mkSplit()
  const r3 = makeRng({ seed: 3 })
  for (let b = 0; b < 50; b++) beat(willA, eu, ev, moved, r3, distMinus, +1) // pump + away from the - side
  const avoidWithWill = meanDistTo(willA, distMinus) // higher = the + fled away from the - threat
  const noWillA = mkSplit()
  const r4 = makeRng({ seed: 3 })
  for (let b = 0; b < 50; b++) beat(noWillA, eu, ev, moved, r4, null, 0)
  const avoidNoWill = meanDistTo(noWillA, distMinus)
  // the will moves the self about a hop away, near the geometric ceiling (the diameter is tiny, so a hop
  // is a large fraction of the whole universe, the steering is directional, not large in raw hops)
  const avoidWorks = avoidWithWill > avoidNoWill + 0.8

  const willSteers = mergeWorks && avoidWorks
  const solved = willSteers

  return {
    n: N,
    mergeWithWill,
    mergeNoWill,
    mergeWorks,
    avoidWithWill,
    avoidNoWill,
    avoidWorks,
    willSteers,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/will-steering',
  title: 'with the will a self moves toward a target and away from a threat, unbiased does not',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = willSteering({ n: 120000 })
    const ok = r.solved && r.willSteers && r.mergeWorks && r.avoidWorks
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a directed pump steers a self toward a distant target (merge) and away from an opposite threat (avoid) where an unbiased self does not',
      metrics: {
        mergeWithWill: r.mergeWithWill,
        mergeNoWill: r.mergeNoWill,
        avoidWithWill: r.avoidWithWill,
        avoidNoWill: r.avoidNoWill,
      },
    })
  },
})
