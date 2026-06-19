// Valence drift, the approach-avoid response of a self to a tone gradient (the observer chunk, E4). A self is
// placed in a tone dipole, a plus-charge (pleasure) strip on one side and a minus-charge (pain) strip on the
// other, and its centroid is tracked. The lean makes the minus strip annihilate the self's facing edge while
// the plus strip nourishes it, so the self drifts toward pleasure and away from pain. The drift sign tracks
// the gradient, the magnitude is read off as a differential to cancel any baseline. Reuses the self-kit.

import {
  flatGraph,
  emergeSelf,
  beat,
  largestPositiveCluster,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

type Graph = { cellCount: number; offsets: Int32Array; adj: Int32Array }

// the self centroid x, with the clamped boundary strips masked out so the standing tone source is never
// mistaken for the self.
function selfCentroidX(
  tone: Int8Array,
  graph: Graph,
  L: number,
  margin: number,
): number {
  const masked = tone.slice()
  for (let c = 0; c < masked.length; c++) {
    const x = c % L
    if (x < margin || x >= L - margin) {
      masked[c] = 0
    }
  }

  const cells = largestPositiveCluster(masked, graph)
  let s = 0
  for (const c of cells) {
    s += c % L
  }

  return cells.length > 0 ? s / cells.length : L / 2
}

// Run a self in a tone dipole and return its centroid-x drift. With plusSide 'right' the plus strip is on the
// right and the minus strip on the left, so a self that approaches pleasure drifts right (positive). With
// dynamics off the self cannot move, the control.
export function valenceDrift(input: {
  L: number
  beats: number
  seed: number
  plusSide: 'right' | 'left'
  withDynamics: boolean
  margin?: number
  cohesion?: number
}): number {
  const { L, beats, seed, plusSide, withDynamics } = input
  const margin = input.margin ?? 5
  const cohesion = input.cohesion ?? 0.22
  const graph = flatGraph(L)
  const rng = makeRng({ seed })
  const moved = new Uint8Array(graph.cellCount)
  const { tone } = emergeSelf(graph, rng, moved, {
    beats: 60,
    density: 0.1,
  })
  const startX = selfCentroidX(tone, graph, L, margin)
  for (let t = 0; t < beats; t++) {
    for (let c = 0; c < graph.cellCount; c++) {
      const x = c % L
      if (x >= L - margin) {
        tone[c] = (plusSide === 'right' ? 1 : -1) as -1 | 1
      } else if (x < margin) {
        tone[c] = (plusSide === 'right' ? -1 : 1) as -1 | 1
      }
    }

    if (withDynamics) {
      beat(tone, graph, moved, rng, 0.01, cohesion)
    }
  }

  return selfCentroidX(tone, graph, L, margin) - startX
}

// The valence differential, drift toward a plus-right gradient minus drift toward a plus-left gradient. A
// self that approaches pleasure gives a large positive value, the baseline drift cancels out.
export function valenceDifferential(input: {
  L: number
  beats: number
  seed: number
  withDynamics: boolean
}): number {
  return (
    valenceDrift({ ...input, plusSide: 'right' }) -
    valenceDrift({ ...input, plusSide: 'left' })
  )
}
