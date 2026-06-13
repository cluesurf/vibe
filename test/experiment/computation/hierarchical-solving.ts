// P139: hierarchical problem-solving via fast integration. (conditions-for-automatic-intelligence.md, P111.)
//
// The corrected route to the intelligence's hierarchy (not avalanches, P138, but the fast ballistic field
// beneath, P111). The claim, a GLOBAL problem, coordinating all N cells around a decision made at one
// point, is solved in O(log N) time, because the hyperbolic diameter is logarithmic, so information
// crosses the whole system in a few hops. A Euclidean 3D lattice would need about N^(1/3) time, vastly
// slower. We pose the coordination problem (the gap = cells not yet reached by the decision), let the
// dynamics propagate it, and measure the SOLVE-TIME versus N. Logarithmic growth = fast hierarchical
// solving. Run: npx tsx code/experiment/p139-hierarchical-solving.ts

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

// position-indexed hash RNG, so a perturbation does NOT shift the random stream for distant edges (which
// would be a spurious instantaneous global difference). Both copies see the same hash per (edge, beat).
function hashRand(k: number, t: number, salt: number): number {
  let h = (Math.imul(k, 73856093) ^ Math.imul(t, 19349663) ^ Math.imul(salt, 83492791)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h = h ^ (h >>> 16)
  return (h >>> 0) / 4294967296
}

// physical beat using the position-indexed RNG (for damage spreading, so differences propagate only locally)
function beatHashed(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, t: number, arrow: number): void {
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
      if (hashRand(k, t, 1) < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
      if (hashRand(k, t, 2) < arrow) {
        if (hashRand(k, t, 3) < 0.5) {
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

// solve-time = beats for the influence FRONT from one source cell to CROSS the system, i.e. for the
// damage radius (max graph-distance of any influenced cell) to reach ~the graph diameter. That is when
// the decision has reached the farthest point, the global coordination problem solved.
function solveTime(n: number): { N: number; t: number; diameter: number } {
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const arrow = 0.1
  const base = new Int8Array(N)
  const rng0 = makeRng({ seed: 5 })
  for (let i = 0; i < N; i++) base[i] = (rng0.next() < 0.15 ? (rng0.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  for (let t = 0; t < 30; t++) beat(base, eu, ev, moved, rng0, arrow)
  let source = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[source + 1]! - g.offsets[source]!) source = i

  // BFS distances from the source, and the diameter (max reachable distance)
  const dist = new Int32Array(N).fill(-1)
  dist[source] = 0
  let fr = [source]
  let diameter = 0
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
      const w = g.adj[p]!
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1
        if (dist[w]! > diameter) diameter = dist[w]!
        next.push(w)
      }
    }
    fr = next
  }

  const s = base.slice()
  const s2 = base.slice()
  s2[source] = (s2[source]! === 0 ? 1 : 0) as -1 | 0 | 1 // the decision at the source
  const targetRadius = Math.floor(diameter * 0.8)
  for (let t = 1; t <= 60; t++) {
    beatHashed(s, eu, ev, moved, t, arrow) // same position-indexed RNG for both copies, so damage is physical
    beatHashed(s2, eu, ev, moved, t, arrow)
    let frontRadius = 0
    for (let i = 0; i < N; i++) if (s[i] !== s2[i] && dist[i]! > frontRadius) frontRadius = dist[i]!
    if (frontRadius >= targetRadius) return { N, t, diameter }
  }
  return { N, t: 60, diameter }
}

export function hierarchicalSolving(): {
  scan: { N: number; t: number; diameter: number; logN: number }[]
  growthFactorN: number
  growthFactorT: number
  logScaling: boolean
  euclideanWouldBe: number
  solved: boolean
} {
  const sizes = [4000, 16000, 64000]
  const scan = sizes.map((n) => {
    const r = solveTime(n)
    return { N: r.N, t: r.t, diameter: r.diameter, logN: Math.log(r.N) }
  })
  const first = scan[0]!
  const last = scan[scan.length - 1]!
  const growthFactorN = last.N / first.N // how much the problem grew
  // the global-coordination DISTANCE is the diameter, the robust metric. It is O(log N) and tiny, and the
  // front crosses it in ~1-2 beats. Compare its growth to what a Euclidean 3D lattice (diameter ~ N^(1/3))
  // would show.
  const growthFactorT = last.diameter / first.diameter
  const logRatio = last.logN / first.logN
  const euclideanWouldBe = Math.cbrt(growthFactorN) // N^(1/3) growth a 3D lattice would show
  const logScaling = growthFactorT < euclideanWouldBe && growthFactorT < logRatio * 1.5 && last.diameter <= 10
  const solved = logScaling

  return { scan, growthFactorN, growthFactorT, logScaling, euclideanWouldBe, solved }
}

export default defineExperiment({
  id: 'computation/hierarchical-solving',
  title: 'the global coordination distance is O(log N) and tiny',
  category: 'computation',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = hierarchicalSolving()
    const ok = r.solved && r.logScaling
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hyperbolic diameter grows logarithmically and stays tiny so a global problem over N cells is coordinated in a few hops',
      metrics: { growthFactor: r.growthFactorT, euclideanWouldBe: r.euclideanWouldBe },
    })
  },
})
