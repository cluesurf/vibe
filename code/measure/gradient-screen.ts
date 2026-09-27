// The population screen of code/coarse/screen tested on macrostates with a gradient inside a block.
//
// A profiled hash start has a slot activity a(x) that depends on the first cell coordinate x only: a
// triangle wave (linear ramps of slope +-s, kinks on block boundaries) or a square wave (two steps of
// height h, each falling inside a block). Two same-screen partners are compared with it, and one that
// shares more than the screen:
//
// - GOLDEN: every block's slots cycled by the golden shift (permuteWithinBlocks). Block populations
//   are kept exactly. The cycle runs over the flattened (x, y, z, w, direction) order, so it moves tones
//   between x slabs and changes the block's hidden x profile, and with it the first moment.
// - MIRROR: every block reflected in x (x -> b - 1 - x inside the block, every other coordinate and the
//   direction kept). Block populations and every even x moment are kept exactly, and the first moment
//   is negated exactly. The control that isolates the odd moments.
// - SLAB: every x slab of every block (the b^3 cells of one x value) cycled by the golden shift of its
//   own slot count. Block populations AND the block's whole x profile are kept exactly, so its first
//   moment along the gradient is shared. A fixed permutation that keeps the first moment of every
//   content must keep every slot's x coordinate, so this is the smallest fixed permutation that shares
//   the corrected screen (populations plus the first moment along the gradient). The y, z and w moments
//   it changes carry no macroscopic gradient.
//
// The first moment of a block, per tone, is the mean of (x - center) over its slots holding that tone,
// weighted by 1 / slots, so a block with a linear ramp of slope s in activity has |m1| about
// s b^2 / 12 in the nonzero tones.

import { Will, cloneWill, makeWill } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { blockSlots, goldenShift } from '@/code/coarse/screen'
import { weylCell } from '@/code/tool/weyl'

export type Profile = {
  readonly kind: 'ramp' | 'step' | 'uniform'
  // the triangle amplitude (ramp), the step height (step), unused (uniform)
  readonly size: number
}

// The slot activity at first coordinate x on a mesh of side L. A ramp is a triangle wave with its
// peaks at x = 0 and its trough at x = L / 2, slope 4 size / L per cell. A step is a square wave,
// activity mean + size / 2 on x in [1, 1 + L / 2) and mean - size / 2 elsewhere.
export function profileActivity(input: {
  profile: Profile
  mean: number
  side: number
  x: number
}): number {
  const { profile, mean, side, x } = input
  const half = side / 2

  if (profile.kind === 'ramp') {
    // +1 at x = 0, -1 at x = L / 2, linear between
    const distance = Math.min(x, side - x)

    return mean + profile.size * (1 - (2 * distance) / half)
  }

  if (profile.kind === 'step') {
    return x >= 1 && x < 1 + half
      ? mean + profile.size / 2
      : mean - profile.size / 2
  }

  return mean
}

// The slope of the activity per cell inside a monotone stretch of a profile.
export function profileSlope(input: { profile: Profile; side: number }): number {
  return input.profile.kind === 'ramp'
    ? (4 * input.profile.size) / input.side
    : 0
}

// A hash start: slot i nonzero with the probability a(x), then +1 or -1 by a second hash bit.
export function gradientStart(input: {
  mesh: Mesh
  side: number
  profile: Profile
  mean: number
  salt: number
}): Will {
  const { mesh, side, profile, mean, salt } = input
  const will = makeWill(mesh)
  const degree = mesh.degree

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const active = profileActivity({ profile, mean, side, x: cell % side })

    for (let d = 0; d < degree; d++) {
      const i = cell * degree + d

      if (weylCell(i, 0, salt) < active) {
        will.data[i] = weylCell(i, 1, salt) < 0.5 ? 1 : -1
      }
    }
  }

  return will
}

// MIRROR: every block reflected in its first coordinate.
export function mirrorWithinBlocks(input: {
  will: Will
  side: number
  block: number
}): Will {
  const { will, side, block } = input
  const degree = will.mesh.degree
  const out = cloneWill(will)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const x = cell % side
    const low = x - (x % block)
    const mirrored = cell - x + low + (block - 1 - (x - low))

    for (let d = 0; d < degree; d++) {
      out.data[mirrored * degree + d] = will.data[cell * degree + d] ?? 0
    }
  }

  return out
}

// SLAB: every x slab of every block cycled by the golden shift of its slot count.
export function shiftWithinSlabs(input: {
  will: Will
  side: number
  block: number
}): Will {
  const { will, side, block } = input
  const degree = will.mesh.degree
  const out = cloneWill(will)
  const perSlab = block ** 3 * degree
  const shift = goldenShift({ slots: perSlab, degree })

  for (const slots of blockSlots({ side, block, degree })) {
    // group the block's slots by x offset, keeping their (y, z, w, direction) order
    const slabs: number[][] = Array.from({ length: block }, () => [])

    for (const slot of slots) {
      const x = Math.floor(slot / degree) % side

      slabs[x % block]?.push(slot)
    }

    for (const slab of slabs) {
      const m = slab.length

      for (let k = 0; k < m; k++) {
        out.data[slab[(k + shift) % m] ?? 0] = will.data[slab[k] ?? 0] ?? 0
      }
    }
  }

  return out
}

// The mean over blocks of the total variation of the per-tone first moments along x between two wills:
// (1 / 2) sum over tones of |m1_a - m1_b|, with m1 = sum over the block's slots holding the tone of
// (x - center) / slots.
export function firstMomentDistance(input: {
  a: Will
  b: Will
  side: number
  block: number
}): number {
  const { a, b, side, block } = input
  const degree = a.mesh.degree
  const per = side / block
  const blocks = per ** 4
  const moments = new Float64Array(3 * blocks)
  const center = (block - 1) / 2
  const slots = block ** 4 * degree

  for (let cell = 0; cell < a.mesh.cellCount; cell++) {
    const x = cell % side
    const y = Math.floor(cell / side) % side
    const z = Math.floor(cell / (side * side)) % side
    const w = Math.floor(cell / (side * side * side)) % side
    const index =
      Math.floor(x / block) +
      per *
        (Math.floor(y / block) +
          per * (Math.floor(z / block) + per * Math.floor(w / block)))
    const offset = (x % block) - center

    for (let d = 0; d < degree; d++) {
      const i = cell * degree + d
      const ta = (a.data[i] ?? 0) + 1
      const tb = (b.data[i] ?? 0) + 1

      moments[3 * index + ta] = (moments[3 * index + ta] ?? 0) + offset
      moments[3 * index + tb] = (moments[3 * index + tb] ?? 0) - offset
    }
  }

  let total = 0

  for (const m of moments) {
    total += Math.abs(m)
  }

  return total / (2 * blocks * slots)
}
