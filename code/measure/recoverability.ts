// Herbert's recoverability functional R = accessible / total, the single currency that unifies thermodynamics
// (entropy as lost recoverability), decoherence (recoverability flowing into the environment), and horizons
// (recoverability bleeding across a boundary). Here it is measured directly on the vibe lattice gas. The
// "total" is the L1 tone-structure of a localized initial signal. The "accessible" part is what a given coarse
// observer can still recover, measured for three observers from one definition.
//
//   rGlobal  the fraction the unrestricted observer recovers. Under the reversible conserving knit the L1
//            structure is exactly conserved, so rGlobal = 1 at every beat (nothing is destroyed, only moved).
//            A lossy rule destroys structure, so its rGlobal falls below 1. This is the discriminator.
//   rWindow  the fraction inside a fixed central window. It falls as structure streams across the window
//            boundary, the horizon regime: recoverability bleeds across a boundary the observer cannot see past.
//   rCoarse  the fraction a block-averaging observer can resolve, the summed magnitude of net block charge over
//            the total structure. It stays far below the whole because the fine signed tone-current cancels
//            inside blocks, the decoherence and thermodynamic regime: coarse-graining costs recoverability even
//            when nothing leaves the system and nothing is destroyed.
//
// One functional, three observers, the three faces of Herbert's R on a discrete reversible substrate.

import { Will, cloneWill } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'

export type RecoverabilityPoint = {
  beat: number
  rGlobal: number
  rWindow: number
  rCoarse: number
}

// the 4D coordinates of a cell on a d4Mesh of side `meshSide`, index x + side*y + side^2*z + side^3*w.
function coordsOf(
  cell: number,
  meshSide: number,
): [number, number, number, number] {
  const area = meshSide * meshSide
  const volume = area * meshSide

  return [
    cell % meshSide,
    Math.floor(cell / meshSide) % meshSide,
    Math.floor(cell / area) % meshSide,
    Math.floor(cell / volume) % meshSide,
  ]
}

// the periodic Chebyshev distance of a cell from the mesh centre, on the 4D torus of side `meshSide`.
function centreChebyshev(cell: number, meshSide: number): number {
  const c = Math.floor(meshSide / 2)
  const coords = coordsOf(cell, meshSide)

  let m = 0

  for (const x of coords) {
    const raw = Math.abs(x - c)
    const wrapped = Math.min(raw, meshSide - raw)

    if (wrapped > m) {
      m = wrapped
    }
  }

  return m
}

// the 4D periodic block id of a cell, blocks of side `blockSide` (must divide meshSide).
function blockOf(
  cell: number,
  meshSide: number,
  blockSide: number,
): number {
  const [x, y, z, w] = coordsOf(cell, meshSide)
  const nb = meshSide / blockSide
  const bx = Math.floor(x / blockSide)
  const by = Math.floor(y / blockSide)
  const bz = Math.floor(z / blockSide)
  const bw = Math.floor(w / blockSide)

  return bx + nb * by + nb * nb * bz + nb * nb * nb * bw
}

// Trace the three recoverability fractions over `beats` beats of the rule, normalized by the total L1
// structure of the initial signal.
export function recoverabilityTrace(input: {
  will: Will
  collision: Collision
  meshSide: number
  windowRadius: number
  blockSide: number
  beats: number
}): RecoverabilityPoint[] {
  const { will, collision, meshSide, windowRadius, blockSide, beats } =
    input

  const mesh = will.mesh
  const degree = mesh.degree
  const cellCount = mesh.cellCount
  const nb = meshSide / blockSide
  const blockCount = nb * nb * nb * nb

  // the normalizer, the total L1 structure of the initial signal.
  let total = 0

  for (const value of will.data) {
    total += Math.abs(value)
  }

  total = Math.max(1, total)

  // precompute, per cell, whether it sits in the central window and which block it belongs to.
  const inWindow = new Uint8Array(cellCount)
  const blockId = new Int32Array(cellCount)

  for (let cell = 0; cell < cellCount; cell++) {
    inWindow[cell] =
      centreChebyshev(cell, meshSide) <= windowRadius ? 1 : 0
    blockId[cell] = blockOf(cell, meshSide, blockSide)
  }

  const measure = (state: Will, step: number): RecoverabilityPoint => {
    const data = state.data

    let global = 0
    let windowStructure = 0

    const blockNet = new Float64Array(blockCount)

    for (let cell = 0; cell < cellCount; cell++) {
      const base = cell * degree

      let cellAbs = 0
      let cellNet = 0

      for (let d = 0; d < degree; d++) {
        const t = data[base + d]!

        cellAbs += Math.abs(t)
        cellNet += t
      }

      global += cellAbs

      if (inWindow[cell]) {
        windowStructure += cellAbs
      }

      blockNet[blockId[cell]!] = blockNet[blockId[cell]!]! + cellNet
    }

    let coarse = 0

    for (let b = 0; b < blockCount; b++) {
      coarse += Math.abs(blockNet[b]!)
    }

    return {
      beat: step,
      rGlobal: global / total,
      rWindow: windowStructure / total,
      rCoarse: coarse / total,
    }
  }

  const points: RecoverabilityPoint[] = []

  let state = cloneWill(will)

  for (let step = 0; step <= beats; step++) {
    points.push(measure(state, step))

    if (step < beats) {
      state = beat(state, collision)
    }
  }

  return points
}

// The coarse observer's TIME SERIES, as opposed to a single coarse snapshot. At each beat the per-block
// total charge is read and serialized, so two runs can be compared for the first beat at which a coarse
// observer could tell them apart.
//
// This exists to separate two things that the recoverability discussion routinely conflates. A coarse
// SNAPSHOT loses information, because fine structure cancels inside a block. A coarse TRAJECTORY need
// not, because conservation plus streaming carries a hidden difference across block boundaries, after
// which it shows up in the block totals. Measuring the trajectory is therefore the honest test of what a
// coarse observer can eventually recover, and it gives a very different answer from the snapshot.
export function coarseChargeTrajectory(input: {
  will: Will
  collision: Collision
  beats: number
  regionOf: (cell: number) => number
  regionCount: number
}): string[] {
  const { will, collision, beats, regionOf, regionCount } = input
  const degree = will.mesh.degree

  let state = cloneWill(will)

  const series: string[] = []

  for (let step = 0; step < beats; step++) {
    state = beat(state, collision)

    const totals = new Int32Array(regionCount)

    for (let cell = 0; cell < state.mesh.cellCount; cell++) {
      const base = cell * degree

      let sum = 0

      for (let d = 0; d < degree; d++) {
        sum += state.data[base + d]!
      }

      totals[regionOf(cell)] = totals[regionOf(cell)]! + sum
    }

    series.push(totals.join(','))
  }

  return series
}

// The first beat (one-indexed) at which two coarse trajectories differ, or null when they never do
// within the measured window. Null is the interesting answer: it means a coarse observer with that
// resolution could not tell the two histories apart at all.
export function firstDistinguishedBeat(
  left: readonly string[],
  right: readonly string[],
): number | null {
  const length = Math.min(left.length, right.length)

  for (let index = 0; index < length; index++) {
    if (left[index] !== right[index]) {
      return index + 1
    }
  }

  return null
}
