import { conservingEdgeListSweepPumped, hashRand } from '@/code/dynamics/conserving-sweep'
import { edgesOf } from '@/code/tool/graph'
import { totalCharge } from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

// The genesis dynamics: the conserving perception rule run from a chosen initial tone, recording how much
// charge (life) exists after each beat. From an all-peace start (the void, Q = 0) with arrow > 0 this is the
// GENESIS curve, the count rising from nothing as the arrow polarizes peace into balanced (+1, -1) pairs and
// the other moves spread them into a dynamic balance. With arrow = 0 it stays dead peace. Conservation holds
// throughout (every move preserves the pair sum), so the total charge Q never leaves its starting value.

// The number of charged (nonzero, non-peace) cells, the amount of "life" in a configuration.
export function chargedCount(tone: Int8Array): number {
  let s = 0
  for (let i = 0; i < tone.length; i++) if (tone[i] !== 0) s++
  return s
}

// Run the conserving rule from `initial` for `beats`, returning the charged-count after each beat (the
// trajectory, length beats + 1 including the start), plus the conserved-charge check. Does not mutate
// `initial`. Deterministic given the seed (the rng only orders the edges and breaks the polarization coin).
export function chargeTrajectory(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  initial: Int8Array
  beats: number
  arrow: number
  seed: number
}): { trajectory: number[]; qStart: number; qEnd: number; conserved: boolean; end: Int8Array } {
  const { neighbors, initial, beats, arrow, seed } = input
  const tone = initial.slice()
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(tone.length)
  const rng = makeRng({ seed })
  const qStart = totalCharge(tone)
  const trajectory: number[] = [chargedCount(tone)]
  for (let b = 0; b < beats; b++) {
    conservingEdgeListSweepPumped({ tone, edges, moved, rng, arrow, pump: null })
    trajectory.push(chargedCount(tone))
  }
  const qEnd = totalCharge(tone)
  return { trajectory, qStart, qEnd, conserved: qStart === qEnd, end: tone }
}

// Whether a trajectory shows GENESIS: it starts empty (or near it), rises to a sustained living level, and
// holds there (a dynamic balance, not a spike that dies). Returns the diagnostic pieces and the verdict.
export function genesisProfile(input: {
  trajectory: number[]
  cells: number
  livingFraction?: number // the level the end must clear to count as "alive" (default 0.05 of cells)
  steadyWindow?: number // how stable the late curve must be (default within 30 percent of the peak)
}): { start: number; peak: number; end: number; alive: boolean; sustained: boolean; rose: boolean } {
  const { trajectory, cells } = input
  const livingFraction = input.livingFraction ?? 0.05
  const steadyWindow = input.steadyWindow ?? 0.3
  const start = trajectory[0]!
  const end = trajectory[trajectory.length - 1]!
  const peak = Math.max(...trajectory)
  const mid = trajectory[Math.floor(trajectory.length / 2)]!
  const alive = end > livingFraction * cells
  const rose = end > start && peak > start
  const sustained = alive && Math.abs(end - mid) < steadyWindow * Math.max(peak, 1)
  return { start, peak, end, alive, sustained, rose }
}

// One beat of the conserving rule with creation DRIVEN BY THE WAKE instead of a free arrow. The wake gives
// every cell a growth-depth (its radial distance from the seed, the order it was born in), and a per-beat
// growth `rate` (the fraction of the mesh that is fresh frontier, a geometric property of the expanding mesh).
// A peace-peace edge that straddles a depth gradient polarizes when a DETERMINISTIC per-edge-per-beat hash
// clears the rate (the moving frontier's desynchronization, reproducible, no Math.random), with the
// frontier-side (larger depth) cell becoming +1 and the inner cell -1, a balanced pair. So BOTH the creation
// rate and its direction are read off the growth geometry, not posited. Where there is no gradient (uniform
// depth) nothing is ever created. `beat` seeds the hash so successive beats hit different edges.
export function wakeDrivenSweep(input: {
  tone: Int8Array
  edges: ReadonlyArray<readonly [number, number]>
  moved: Uint8Array
  depth: Int32Array
  beat: number
  rate: number
}): void {
  const { tone, edges, moved, depth, beat, rate } = input
  moved.fill(0)
  for (const [v, w] of edges) {
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    const key = v * 131071 + w
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const charged = a === 0 ? w : v
      const empty = a === 0 ? v : w
      if (hashRand(key, beat, 1) < 0.5) {
        tone[empty] = tone[charged]!
        tone[charged] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0 && (depth[v] ?? 0) !== (depth[w] ?? 0) && hashRand(key, beat, 0) < rate) {
      const outer = (depth[v] ?? 0) > (depth[w] ?? 0) ? v : w
      const inner = outer === v ? w : v
      tone[outer] = 1
      tone[inner] = -1
      moved[v] = 1
      moved[w] = 1
    }
  }
}

// The per-beat growth rate read off the mesh, the fraction of cells that are fresh frontier (the outermost
// growth-shell). This is the wake's own creation rate, a geometric property of the expanding mesh, not a knob.
export function growthRate(depth: Int32Array): number {
  let maxD = 0
  for (let i = 0; i < depth.length; i++) if (depth[i]! > maxD) maxD = depth[i]!
  let frontier = 0
  for (let i = 0; i < depth.length; i++) if (depth[i]! === maxD) frontier++
  return frontier / depth.length
}

// The genesis trajectory under the WAKE-DRIVEN rule (no arrow parameter, deterministic via the hash). With a
// real growth-depth gradient and the growth-derived rate this brings a living balance out of the peace void,
// with a uniform (flat) depth, or zero rate (no growth), it stays dead.
export function wakeTrajectory(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  depth: Int32Array
  initial: Int8Array
  beats: number
  rate: number
}): { trajectory: number[]; qStart: number; qEnd: number; conserved: boolean; end: Int8Array } {
  const { neighbors, depth, initial, beats, rate } = input
  const tone = initial.slice()
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(tone.length)
  const qStart = totalCharge(tone)
  const trajectory: number[] = [chargedCount(tone)]
  for (let b = 0; b < beats; b++) {
    wakeDrivenSweep({ tone, edges, moved, depth, beat: b, rate })
    trajectory.push(chargedCount(tone))
  }
  const qEnd = totalCharge(tone)
  return { trajectory, qStart, qEnd, conserved: qStart === qEnd, end: tone }
}

// Run the conserving rule from all-peace until the FIRST charge appears, and report that first creation event:
// how many +1 and -1 cells it made, whether they are balanced and adjacent (a single conserving pair, the first
// distinction). Returns beatsToFirst = -1 if no charge ever appears (dead peace, e.g. arrow 0).
export function firstDistinction(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  cells: number
  arrow: number
  seed: number
  maxBeats: number
}): { beatsToFirst: number; plus: number; minus: number; balanced: boolean; adjacent: boolean } {
  const { neighbors, cells, arrow, seed, maxBeats } = input
  const tone = new Int8Array(cells)
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(cells)
  const rng = makeRng({ seed })
  for (let b = 0; b < maxBeats; b++) {
    conservingEdgeListSweepPumped({ tone, edges, moved, rng, arrow, pump: null })
    if (chargedCount(tone) > 0) {
      let plus = 0
      let minus = 0
      for (let i = 0; i < cells; i++) {
        if (tone[i] === 1) plus++
        else if (tone[i] === -1) minus++
      }
      let adjacent = false
      for (const [v, w] of edges) if (tone[v]! * tone[w]! === -1) { adjacent = true; break }
      return { beatsToFirst: b + 1, plus, minus, balanced: plus === minus, adjacent }
    }
  }
  return { beatsToFirst: -1, plus: 0, minus: 0, balanced: false, adjacent: false }
}
