// Two-self machinery for the multiscale interaction experiments (MS2). Emerge one self, capture its shape,
// then stamp two copies at a chosen separation and watch them interact under the passive cohesive beat. The
// separation between the two clusters over time is the interaction signal, an approach (attraction) when the
// cohesion bridges the gap, no net change when they are out of range. Reuses the self-kit engine.

import {
  flatGraph,
  emergeSelf,
  beat,
  largestPositiveCluster,
  positiveClusters,
  type Graph,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/coarse/self-trajectory'

export type SelfShape = {
  // cell offsets (dx, dy) of the self's plus-charge cells relative to its centroid.
  offsets: (readonly [number, number])[]
  size: number
  L: number
}

// Emerge a self on an L-lattice and return its shape as integer offsets from its centroid.
export function emergeSelfShape(input: {
  L: number
  seed: number
  beats?: number
  density?: number
}): SelfShape {
  const { L, seed } = input
  const graph = flatGraph(L)
  const rng = makeRng(seed)
  const moved = new Uint8Array(graph.cellCount)
  const { tone } = emergeSelf(graph, rng, moved, {
    beats: input.beats ?? 80,
    density: input.density ?? 0.1,
  })

  const cluster = largestPositiveCluster(tone, graph)

  let cx = 0
  let cy = 0

  for (const c of cluster) {
    cx += c % L
    cy += Math.floor(c / L)
  }

  cx /= cluster.length
  cy /= cluster.length

  const offsets = cluster.map(
    c =>
      [
        Math.round((c % L) - cx),
        Math.round(Math.floor(c / L) - cy),
      ] as const,
  )

  return { offsets, size: cluster.length, L }
}

// Stamp a charge shape (of the given sign, default plus) centered at (px, py) into a tone array on an
// L-lattice.
export function stampShape(input: {
  tone: Int8Array
  L: number
  offsets: (readonly [number, number])[]
  px: number
  py: number
  sign?: number
}): void {
  const { tone, L, offsets, px, py } = input
  const sign = (input.sign ?? 1) as -1 | 1

  for (const [dx, dy] of offsets) {
    const x = px + dx
    const y = py + dy

    if (x >= 0 && x < L && y >= 0 && y < L) {
      tone[y * L + x] = sign
    }
  }
}

// The number of plus-charge cells. Under the passive beat (arrow 0) the plus count is exactly conserved by
// hopping and changes ONLY through annihilation against minus charge, so its drop is a clean, exact measure
// of how much two selves have annihilated.
export function plusCount(tone: Int8Array): number {
  let n = 0

  for (const value of tone) {
    if (value === 1) {
      n++
    }
  }

  return n
}

// Stamp a plus self at the left and a self of rightSign at the right, separation d apart, run the passive beat
// (no vacuum churn), and return the plus-count each beat. With rightSign -1 the two selves annihilate where
// their spreading fronts meet, with rightSign +1 there is no annihilation (the control).
export function runTwoSelfAnnihilation(input: {
  shape: SelfShape
  d: number
  rightSign: number
  cohesion: number
  beats: number
  seed: number
}): number[] {
  const { shape, d, rightSign, cohesion, beats, seed } = input
  const L = shape.L
  const graph = flatGraph(L)
  const tone = new Int8Array(L * L)
  const cy = Math.floor(L / 2)
  stampShape({
    tone,
    L,
    offsets: shape.offsets,
    px: Math.round(L / 2 - d / 2),
    py: cy,
    sign: 1,
  })
  stampShape({
    tone,
    L,
    offsets: shape.offsets,
    px: Math.round(L / 2 + d / 2),
    py: cy,
    sign: rightSign,
  })

  const rng = makeRng(seed)
  const moved = new Uint8Array(L * L)
  const counts = [plusCount(tone)]

  for (let t = 0; t < beats; t++) {
    beat(tone, graph, moved, rng, 0, cohesion)
    counts.push(plusCount(tone))
  }

  return counts
}

// The separation between the two largest plus-charge clusters' centroids, or 0 if they have merged into one
// cluster (at or above minSize). The interaction observable.
export function twoSelfSeparation(input: {
  tone: Int8Array
  graph: Graph
  L: number
  minSize: number
}): number {
  const { tone, graph, L, minSize } = input
  const clusters = positiveClusters(tone, graph)
    .filter(c => c.length >= minSize)
    .sort((a, b) => b.length - a.length)

  if (clusters.length < 2) {
    return 0
  }

  const centroid = (cells: number[]): readonly [number, number] => {
    let cx = 0
    let cy = 0

    for (const c of cells) {
      cx += c % L
      cy += Math.floor(c / L)
    }

    return [cx / cells.length, cy / cells.length]
  }

  const [ax, ay] = centroid(clusters[0]!)
  const [bx, by] = centroid(clusters[1]!)

  return Math.hypot(ax - bx, ay - by)
}

// Run two stamped selves at initial horizontal separation d and record their separation each beat. arrow is 0
// (passive, no vacuum churn), so the only motion is the cohesion-driven hopping of the existing charge.
export function runTwoSelf(input: {
  shape: SelfShape
  d: number
  cohesion: number
  beats: number
  seed: number
  minSize: number
  arrow?: number
}): number[] {
  const { shape, d, cohesion, beats, seed, minSize } = input
  const arrow = input.arrow ?? 0.01
  const L = shape.L
  const graph = flatGraph(L)
  const tone = new Int8Array(L * L)
  const cy = Math.floor(L / 2)
  stampShape({
    tone,
    L,
    offsets: shape.offsets,
    px: Math.round(L / 2 - d / 2),
    py: cy,
  })
  stampShape({
    tone,
    L,
    offsets: shape.offsets,
    px: Math.round(L / 2 + d / 2),
    py: cy,
  })

  const rng = makeRng(seed)
  const moved = new Uint8Array(L * L)
  const seps = [twoSelfSeparation({ tone, graph, L, minSize })]

  for (let t = 0; t < beats; t++) {
    beat(tone, graph, moved, rng, arrow, cohesion)
    seps.push(twoSelfSeparation({ tone, graph, L, minSize }))
  }

  return seps
}
