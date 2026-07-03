// Density-front measures for the lattice gas, the sound-speed toolkit. A quiescent
// deterministic thermal background (head-on pairs placed by a position-indexed hash, zero
// momentum everywhere) carries a localized density bump, and the outgoing pulse in the
// slab-averaged tone profile is tracked against a bump-free reference run of the same
// background, so the background dynamics subtracts exactly. The pulse position is the
// midpoint of the leading and trailing half-max crossings of the smoothed outgoing
// profile, an unbiased tracker (the leading edge alone runs ahead while the pulse
// broadens, the excess centroid drags behind on the trailing residual). The slope of
// midpoint versus beat is the front speed.

import { Will, makeWill, cellTone } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { coordAlong } from '@/code/measure/hydrodynamics'
import { coinLines } from '@/code/measure/sound-wave'
import { meshOpposites } from '@/code/tool/mesh'
import { hashRand } from '@/code/dynamics/conserving-sweep'

// the fixed hash salt for the background pair placement, so every gas built from the
// same mesh is the same deterministic state
export const PAIR_SALT = 11

// Fill the will with a deterministic disordered gas of head-on pairs, both ends of a
// line set to +1 wherever the position-indexed hash is below pairFill. Every pair has
// zero net momentum, so the gas is quiescent, and the hash disorder is what makes the
// gas mix under a collision (a slab-uniform fill reduces to an effectively 1D state
// that recurs). Deterministic, a fixed function of the (cell, line) index, no random.
export function pairGasFill(input: {
  will: Will
  pairFill: number
}): void {
  const { will, pairFill } = input
  const mesh = will.mesh
  const lines = coinLines(meshOpposites(mesh))

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const base = cell * mesh.degree

    for (let line = 0; line < lines.length; line++) {
      if (hashRand(cell, line, PAIR_SALT) < pairFill) {
        const [a, o] = lines[line]!
        will.data[base + a] = 1
        will.data[base + o] = 1
      }
    }
  }
}

// Add a pure density bump, every slot of every cell set to +1 in the slabs within
// halfWidth of center along the axis (periodic distance). Both ends of every line are
// filled, so the bump carries zero net momentum, it is a density excess only.
export function addDensitySlab(input: {
  will: Will
  side: number
  center: number
  halfWidth: number
  axis?: number
}): void {
  const { will, side, center, halfWidth } = input
  const axis = input.axis ?? 0
  const mesh = will.mesh

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = coordAlong(cell, axis, side)
    const dx = Math.min(
      Math.abs(x - center),
      side - Math.abs(x - center),
    )

    if (dx <= halfWidth) {
      const base = cell * mesh.degree

      for (let direction = 0; direction < mesh.degree; direction++) {
        will.data[base + direction] = 1
      }
    }
  }
}

// the mean cell tone per slab along the axis, the coarse density profile the sound
// pulse moves through
export function slabToneProfile(input: {
  will: Will
  side: number
  axis?: number
}): number[] {
  const { will, side } = input
  const axis = input.axis ?? 0
  const sum = new Array<number>(side).fill(0)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    sum[coordAlong(cell, axis, side)]! += cellTone(will, cell)
  }

  const cellsPerSlab = will.mesh.cellCount / side

  return sum.map(value => value / cellsPerSlab)
}

// Evolve the bumped state and the bump-free reference side by side under the same
// collision and return the excess profile (bumped minus reference) at every beat,
// index 0 the initial state. The reference subtraction removes the background exactly
// (both runs are deterministic), leaving only the disturbance the bump created.
export function excessProfileSeries(input: {
  reference: Will
  bumped: Will
  collision: Collision
  beats: number
  side: number
  axis?: number
}): number[][] {
  const { reference, bumped, collision, beats, side } = input
  const axis = input.axis ?? 0
  const mesh = reference.mesh
  const table = streamSourceTable(mesh)

  let referenceCurrent: Will = { mesh, data: reference.data.slice() }
  let referenceScratch = makeWill(mesh)
  let bumpedCurrent: Will = {
    mesh: bumped.mesh,
    data: bumped.data.slice(),
  }

  let bumpedScratch = makeWill(bumped.mesh)

  const excess = (): number[] => {
    const referenceProfile = slabToneProfile({
      will: referenceCurrent,
      side,
      axis,
    })

    const bumpedProfile = slabToneProfile({
      will: bumpedCurrent,
      side,
      axis,
    })

    return bumpedProfile.map(
      (value, slab) => value - referenceProfile[slab]!,
    )
  }

  const series: number[][] = [excess()]

  for (let step = 0; step < beats; step++) {
    beatInto({
      src: referenceCurrent,
      dst: referenceScratch,
      table,
      collision,
    })
    ;[referenceCurrent, referenceScratch] = [
      referenceScratch,
      referenceCurrent,
    ]
    beatInto({
      src: bumpedCurrent,
      dst: bumpedScratch,
      table,
      collision,
    })
    ;[bumpedCurrent, bumpedScratch] = [bumpedScratch, bumpedCurrent]
    series.push(excess())
  }

  return series
}

// the boxcar-smoothed excess at signed offset r from the bump center, periodic
function smoothedExcess(input: {
  excess: readonly number[]
  side: number
  center: number
  offset: number
  smooth: number
}): number {
  const { excess, side, center, offset, smooth } = input

  let sum = 0

  for (let d = -smooth; d <= smooth; d++) {
    const slab = (((center + offset + d) % side) + side) % side
    sum += excess[slab] ?? 0
  }

  return sum / (2 * smooth + 1)
}

// The position of the outgoing pulse on the positive-offset side of the bump, the
// midpoint of the leading and trailing half-max crossings of the smoothed excess. The
// midpoint is the unbiased pulse tracker, the leading half-max edge alone drifts ahead
// while the pulse broadens and the excess centroid drags on the trailing residual.
// Returns 0 when there is no positive excess to track.
export function pulseMidpoint(input: {
  excess: readonly number[]
  side: number
  center: number
  smooth?: number
}): number {
  const { excess, side, center } = input
  const smooth = input.smooth ?? 2
  const half = Math.floor(side / 2)

  let peakOffset = 0
  let peakValue = -Infinity

  for (let offset = 1; offset < half; offset++) {
    const value = smoothedExcess({
      excess,
      side,
      center,
      offset,
      smooth,
    })

    if (value > peakValue) {
      peakValue = value
      peakOffset = offset
    }
  }

  if (peakValue <= 0) {
    return 0
  }

  let leading = peakOffset

  for (let offset = half - 1; offset >= 1; offset--) {
    if (
      smoothedExcess({ excess, side, center, offset, smooth }) >=
      peakValue / 2
    ) {
      leading = offset
      break
    }
  }

  let trailing = 1

  for (let offset = peakOffset; offset >= 1; offset--) {
    if (
      smoothedExcess({ excess, side, center, offset, smooth }) <
      peakValue / 2
    ) {
      trailing = offset + 1
      break
    }
  }

  return (leading + trailing) / 2
}
