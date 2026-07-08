// Shared dynamics for the self experiments (P178 to P184). The cohesive perception beat, the conserving
// charge moves, cluster detection, and self emergence, factored out so each experiment reuses one engine.

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { buildHorosphere } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import { hashRand } from '@/code/dynamics/conserving-sweep'

const GOLDEN_SK = (1 + Math.sqrt(5)) / 2

export type Graph = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
  coords?: number[][]
}
export type Rng = { next: () => number }

// adjacency-list graph (e.g. the horosphere) to a CSR graph
export function toCSR(
  neighbors: number[][],
  coords?: number[][],
): Graph {
  const n = neighbors.length
  const offsets = new Int32Array(n + 1)

  for (let i = 0; i < n; i++) {
    offsets[i + 1] = offsets[i]! + neighbors[i]!.length
  }

  const adj = new Int32Array(offsets[n]!)

  let p = 0

  for (let i = 0; i < n; i++) {
    for (const w of neighbors[i]!) {
      adj[p++] = w
    }
  }

  return { cellCount: n, offsets, adj, coords }
}

export const bulkGraph = (maxCells: number): Graph => {
  const g = buildDodecagrid({ maxCells })

  return { cellCount: g.cellCount, offsets: g.offsets, adj: g.adj }
}

export const horosphereGraph = (
  maxCells: number,
  bandHalfWidth = 0.45,
): Graph => {
  const h = buildHorosphere({ maxCells, bandHalfWidth })

  return toCSR(h.neighbors, h.coords)
}

// the horosphere's INTRINSIC geometry is flat Euclidean 2D, so a flat triangular lattice (6-neighbour) is
// its faithful model (as the flat-layer experiments P157, P160 use). On it, unlike the hyperbolic bulk,
// compact low-boundary regions exist (the Euclidean isoperimetric law), so selves can be low-leak.
// the flat triangular horosphere lattice, built DIRECTLY as CSR (no intermediate per-cell arrays), so it
// scales to tens of millions of cells, far beyond any affordable hyperbolic bulk.
export const flatGraph = (L: number): Graph => {
  const N = L * L
  const dx = [1, -1, 0, 0, 1, -1]
  const dy = [0, 0, 1, -1, -1, 1]
  const offsets = new Int32Array(N + 1)

  // first pass, degree of each cell
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      let deg = 0

      for (let k = 0; k < 6; k++) {
        const a = x + dx[k]!
        const b = y + dy[k]!

        if (a >= 0 && a < L && b >= 0 && b < L) {
          deg++
        }
      }

      offsets[y * L + x + 1] = deg
    }
  }

  for (let i = 0; i < N; i++) {
    offsets[i + 1] = offsets[i + 1]! + offsets[i]!
  }

  const adj = new Int32Array(offsets[N]!)

  let p = 0

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      for (let k = 0; k < 6; k++) {
        const a = x + dx[k]!
        const b = y + dy[k]!

        if (a >= 0 && a < L && b >= 0 && b < L) {
          adj[p++] = b * L + a
        }
      }
    }
  }

  return { cellCount: N, offsets, adj }
}

// the EXACT {4,4} square horosphere of the paracompact honeycomb {4,4,3} (4-neighbour). Unlike the
// triangular flatGraph, which is an idealization of the {5,3,4} horosphere's flat geometry, this IS the
// regular horosphere tiling of {4,4,3} cell-for-cell. Used to validate that the flat-self physics depends on
// flat curvature, not on the lattice details. Built directly as CSR.
export const squareGraph = (L: number): Graph => {
  const N = L * L
  const dx = [1, -1, 0, 0]
  const dy = [0, 0, 1, -1]
  const offsets = new Int32Array(N + 1)

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      let deg = 0

      for (let k = 0; k < 4; k++) {
        const a = x + dx[k]!
        const b = y + dy[k]!

        if (a >= 0 && a < L && b >= 0 && b < L) {
          deg++
        }
      }

      offsets[y * L + x + 1] = deg
    }
  }

  for (let i = 0; i < N; i++) {
    offsets[i + 1] = offsets[i + 1]! + offsets[i]!
  }

  const adj = new Int32Array(offsets[N]!)

  let p = 0

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      for (let k = 0; k < 4; k++) {
        const a = x + dx[k]!
        const b = y + dy[k]!

        if (a >= 0 && a < L && b >= 0 && b < L) {
          adj[p++] = b * L + a
        }
      }
    }
  }

  return { cellCount: N, offsets, adj }
}

// a BFS ball of a given radius around a center cell, used to measure boundary-to-volume scaling
export function ball(
  g: Graph,
  center: number,
  radius: number,
): number[] {
  const seen = new Set<number>([center])

  let fr = [center]

  for (let r = 0; r < radius; r++) {
    const nf: number[] = []

    for (const u of fr) {
      for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
        const w = g.adj[p]!

        if (!seen.has(w)) {
          seen.add(w)
          nf.push(w)
        }
      }
    }

    fr = nf
  }

  return [...seen]
}

// boundary-to-volume ratio of a cell set, the leakiness of its shape. Low on a flat layer for a compact
// blob (falls as 1/sqrt(size)), high in the hyperbolic bulk (stays near constant, all boundary).
export function boundaryFraction(cells: number[], g: Graph): number {
  const inSet = new Set(cells)

  let boundary = 0

  for (const c of cells) {
    let hasOut = false

    for (let p = g.offsets[c]!; p < g.offsets[c + 1]!; p++) {
      if (!inSet.has(g.adj[p]!)) {
        hasOut = true
        break
      }
    }

    if (hasOut) {
      boundary++
    }
  }

  return cells.length > 0 ? boundary / cells.length : 1
}

export const degreeOf = (g: Graph, v: number): number =>
  g.offsets[v + 1]! - g.offsets[v]!

// the cohesive perception beat, conserving. opposite tones annihilate, a charge hops toward like company
// (cohesion>0) or aimlessly (cohesion=0, diffusion), peace spawns a balanced pair at the arrow rate.
export function beat(
  tone: Int8Array,
  g: Graph,
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
  cohesion: number,
): void {
  const { offsets, adj } = g
  const N = tone.length
  moved.fill(0)

  const start = Math.floor(rng.next() * N)

  for (let s = 0; s < N; s++) {
    const v = (start + s) % N

    if (moved[v]) {
      continue
    }

    const a = tone[v]!

    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!

      if (moved[w]) {
        continue
      }

      const b = tone[w]!

      if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
        break
      } else if (a !== 0 && b === 0) {
        let like = 0

        for (let q = offsets[w]!; q < offsets[w + 1]!; q++) {
          const u = adj[q]!

          if (u !== v && tone[u] === a) {
            like++
          }
        }

        const pHop = 0.1 + cohesion * Math.min(like, 4)

        if (rng.next() < pHop) {
          tone[w] = a
          tone[v] = 0
          moved[v] = 1
          moved[w] = 1
          break
        }
      } else if (a === 0 && b === 0) {
        if (arrow > 0 && rng.next() < arrow) {
          if (rng.next() < 0.5) {
            tone[v] = 1
            tone[w] = -1
          } else {
            tone[v] = -1
            tone[w] = 1
          }

          moved[v] = 1
          moved[w] = 1
          break
        }
      }
    }
  }
}

// The DETERMINISTIC version of beat: the sweep start rotates by the golden ratio each beat, and every
// probabilistic decision (the cohesion hop, the arrow pair creation, the pair sign) is decided by the
// stateless hash hashRand(edge pointer, beat, salt) instead of an RNG. A fixed rule, no seed, no hidden
// state, varying per edge and per beat exactly as the random version did. Callers pass the beat index.
export function beatHashed(
  tone: Int8Array,
  g: Graph,
  moved: Uint8Array,
  beat: number,
  arrow: number,
  cohesion: number,
): void {
  const { offsets, adj } = g
  const N = tone.length
  moved.fill(0)

  const start = Math.floor((((beat + 1) * GOLDEN_SK) % 1) * N)

  for (let s = 0; s < N; s++) {
    const v = (start + s) % N

    if (moved[v]) {
      continue
    }

    const a = tone[v]!

    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!

      if (moved[w]) {
        continue
      }

      const b = tone[w]!

      if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
        break
      } else if (a !== 0 && b === 0) {
        let like = 0

        for (let q = offsets[w]!; q < offsets[w + 1]!; q++) {
          const u = adj[q]!

          if (u !== v && tone[u] === a) {
            like++
          }
        }

        const pHop = 0.1 + cohesion * Math.min(like, 4)

        if (hashRand(p, beat, 1) < pHop) {
          tone[w] = a
          tone[v] = 0
          moved[v] = 1
          moved[w] = 1
          break
        }
      } else if (a === 0 && b === 0) {
        if (arrow > 0 && hashRand(p, beat, 2) < arrow) {
          if (hashRand(p, beat, 3) < 0.5) {
            tone[v] = 1
            tone[w] = -1
          } else {
            tone[v] = -1
            tone[w] = 1
          }

          moved[v] = 1
          moved[w] = 1
          break
        }
      }
    }
  }
}

export const totalCharge = (t: Int8Array): number => {
  let s = 0

  for (const value of t) {
    s += value
  }

  return s
}

// count of same-sign neighbors of cell c (its local self-density)
export function sameSignNeighbors(
  tone: Int8Array,
  g: Graph,
  c: number,
  sign: number,
): number {
  let k = 0

  for (let p = g.offsets[c]!; p < g.offsets[c + 1]!; p++) {
    if (tone[g.adj[p]!] === sign) {
      k++
    }
  }

  return k
}

export function largestPositiveCluster(
  tone: Int8Array,
  g: Graph,
): number[] {
  const { offsets, adj } = g
  const N = tone.length
  const seen = new Uint8Array(N)

  let best: number[] = []

  for (let s = 0; s < N; s++) {
    if (tone[s] !== 1 || seen[s]) {
      continue
    }

    const cells: number[] = []

    let fr = [s]
    seen[s] = 1

    while (fr.length) {
      const nf: number[] = []

      for (const u of fr) {
        cells.push(u)

        for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
          const w = adj[p]!

          if (tone[w] === 1 && !seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }

      fr = nf
    }

    if (cells.length > best.length) {
      best = cells
    }
  }

  return best
}

// Every connected cluster of positive-tone cells (not just the largest), each as a list of cell ids.
// Same single-sign flood as largestPositiveCluster, collecting all components.
export function positiveClusters(
  tone: Int8Array,
  g: Graph,
): number[][] {
  const { offsets, adj } = g
  const N = tone.length
  const seen = new Uint8Array(N)
  const out: number[][] = []

  for (let s = 0; s < N; s++) {
    if (tone[s] !== 1 || seen[s]) {
      continue
    }

    const cells: number[] = []

    let fr = [s]
    seen[s] = 1

    while (fr.length) {
      const nf: number[] = []

      for (const u of fr) {
        cells.push(u)

        for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
          const w = adj[p]!

          if (tone[w] === 1 && !seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }

      fr = nf
    }

    out.push(cells)
  }

  return out
}

// Count of connected same-sign tone components at least `minSize` cells big. With sign 'positive'
// only +1 cells are clustered (each cluster is one sign, +); with sign 'either' both +1 and -1
// cluster, an edge joining two cells of the SAME nonzero tone. When `cells` is given only those
// cells participate (and only edges with both endpoints inside it), otherwise the whole graph does.
// Union-find over the participating cells. Used to count how many distinct large selves survive.
export function countLargeSameSignComponents(input: {
  tone: Int8Array
  g: Graph
  minSize: number
  sign?: 'positive' | 'either'
  cells?: number[]
}): number {
  const { tone, g, minSize } = input
  const sign = input.sign ?? 'either'
  const { offsets, adj } = g
  const cells =
    input.cells ?? Array.from({ length: g.cellCount }, (_, i) => i)

  const inSet = input.cells ? new Set(input.cells) : null
  const active = (v: number): boolean =>
    sign === 'positive' ? tone[v] === 1 : tone[v] !== 0

  const parent = new Map<number, number>()

  for (const v of cells) {
    parent.set(v, v)
  }

  const find = (x: number): number => {
    let r = x

    while (parent.get(r) !== undefined && parent.get(r) !== r) {
      r = parent.get(r)!
    }

    return r
  }

  for (const v of cells) {
    if (!active(v)) {
      continue
    }

    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!

      if (inSet && !inSet.has(w)) {
        continue
      }

      if (tone[w] === tone[v]) {
        parent.set(find(v), find(w))
      }
    }
  }

  const size = new Map<number, number>()

  for (const v of cells) {
    if (!active(v)) {
      continue
    }

    const r = find(v)
    size.set(r, (size.get(r) ?? 0) + 1)
  }

  let big = 0

  for (const s of size.values()) {
    if (s >= minSize) {
      big++
    }
  }

  return big
}

// The integration measure Phi of a cluster: the fraction of its cells' edges that stay inside the
// cluster (internal connectivity). A lone speck has Phi 0, a dense blob approaches 1.
export function clusterIntegration(
  cluster: number[],
  g: Graph,
): number {
  const inCluster = new Set(cluster)

  let internal = 0
  let total = 0

  for (const u of cluster) {
    for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
      total++

      if (inCluster.has(g.adj[p]!)) {
        internal++
      }
    }
  }

  return total > 0 ? internal / total : 0
}

export const countPlus = (tone: Int8Array, cells: number[]): number => {
  let c = 0

  for (const i of cells) {
    if (tone[i] === 1) {
      c++
    }
  }

  return c
}

// emerge a self, net-positive low-density start, the -1 annihilate, the surviving +1 is concentrated by
// cohesion into a self below percolation. Returns the final tones and the emergent self's cells.
export function emergeSelf(
  g: Graph,
  rng: Rng,
  moved: Uint8Array,
  opts?: { beats?: number; density?: number },
): { tone: Int8Array; cluster: number[] } {
  const N = g.cellCount
  const density = opts?.density ?? 0.1
  const tone = new Int8Array(N)

  for (let i = 0; i < N; i++) {
    const r = rng.next()
    tone[i] = r < density ? 1 : r < density * 1.3 ? -1 : 0
  }

  for (let t = 0; t < (opts?.beats ?? 70); t++) {
    beat(tone, g, moved, rng, 0.01, 0.22)
  }

  return { tone, cluster: largestPositiveCluster(tone, g) }
}

// The DETERMINISTIC version of emergeSelf: the initial low-density tone is drawn from the stateless
// well-mixed hash hashRand(cell, 0, salt) (spatially decorrelated, like the random start but no seed),
// and the dynamics use beatHashed. No randomness, no hidden state.
export function emergeSelfHashed(
  g: Graph,
  moved: Uint8Array,
  opts?: { beats?: number; density?: number },
): { tone: Int8Array; cluster: number[] } {
  const N = g.cellCount
  const density = opts?.density ?? 0.1
  const tone = new Int8Array(N)

  for (let i = 0; i < N; i++) {
    const r = hashRand(i, 0, 7)
    tone[i] = r < density ? 1 : r < density * 1.3 ? -1 : 0
  }

  for (let t = 0; t < (opts?.beats ?? 70); t++) {
    beatHashed(tone, g, moved, t, 0.01, 0.22)
  }

  return { tone, cluster: largestPositiveCluster(tone, g) }
}

// Two measures of how well an emerged self holds together under the passive (arrow-off)
// rule on a given graph: the fraction of the self's +1 charge lost in a single beat
// (leakPerBeat), and the fraction still present after a long passive run (passiveFidelity).
// Lower leak and higher fidelity mean a more stable, compact self. Deterministic in `seed`.
export function selfLeakAndFidelity(input: {
  g: Graph
  seed: number
  settleBeats?: number
  cohesion?: number
}): {
  leakPerBeat: number
  passiveFidelity: number
} {
  const { g, seed } = input
  const cohesion = input.cohesion ?? 0.22
  const settle = input.settleBeats ?? 50
  const moved = new Uint8Array(g.cellCount)
  const rng = makeRng({ seed })
  const { tone, cluster } = emergeSelf(g, rng, moved)
  const tl = tone.slice()
  const before = countPlus(tl, cluster)
  beat(tl, g, moved, makeRng({ seed: seed + 1 }), 0, cohesion)

  const leakPerBeat =
    before > 0 ? 1 - countPlus(tl, cluster) / before : 1

  const t2 = tone.slice()
  const rng2 = makeRng({ seed: seed + 2 })

  for (let b = 0; b < settle; b++) {
    beat(t2, g, moved, rng2, 0, cohesion)
  }

  const passiveFidelity =
    cluster.length > 0 ? countPlus(t2, cluster) / cluster.length : 0

  return { leakPerBeat, passiveFidelity }
}

// The DISCRETE arrow (defining-the-arrow.md). The arrow is a committed +1 DIRECTION (creation, never the
// reverse) plus a MINIMAL DETERMINISTIC schedule, not a float probability and not random. Each beat it
// creates one balanced +1/-1 pair per `period` cells, choosing sites by index and a rotating beat phase, so
// the same cells are not always used, with no random source. Conserving (balanced pairs). `period` is the
// integer K (the only knob, an integer, ideally fixed by the growth rate), the old float rate was 1/period.
// Returns the number of pairs created.
export function discreteArrow(
  tone: Int8Array,
  g: Graph,
  beatIndex: number,
  period: number,
): number {
  const N = tone.length

  let created = 0

  const phase = ((beatIndex % period) + period) % period

  for (let i = phase; i < N; i += period) {
    if (tone[i] !== 0) {
      continue
    }

    for (let p = g.offsets[i]!; p < g.offsets[i + 1]!; p++) {
      const w = g.adj[p]!

      if (tone[w] === 0) {
        tone[i] = 1
        tone[w] = -1
        created++
        break
      }
    }
  }

  return created
}
