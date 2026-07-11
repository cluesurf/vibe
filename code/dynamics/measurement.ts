import type { Will } from '@/code/tone/will'
import { cloneWill } from '@/code/tone/will'
import type { Mesh } from '@/code/tool/mesh'
import type { Collision } from '@/code/rule/collision'
import { beatInto, inverseBeat } from '@/code/rule/lattice-gas'
import { disagreementFraction } from '@/code/measure/agreement'
import { profileGradient } from '@/code/measure/profile'

// Measurement as deterministic settling. A coherent body on the reversible lattice gas is coupled to the OPEN
// growing edge (cells held at peace at a frontier slab, the bath that the fine phase leaks into) or run CLOSED
// (no bath). The open system forms an irreversible, definite, stable coarse record (a pointer that settles),
// the closed one stays coherent and recoverable (the Loschmidt echo recovers it exactly), no record. No special
// collapse law is added, the record is deterministic relaxation plus loss of the fine phase to the wake.

const sideOf = (mesh: Mesh): number =>
  Math.round(Math.pow(mesh.cellCount, 1 / 4))

// Hold a frontier slab (cells at a fixed x-coordinate) at peace, the open bath the fine phase disperses into.
export function bornAtPeace(will: Will, frontierX: number): void {
  const mesh = will.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (cell % side === frontierX) {
      const base = cell * degree

      for (let d = 0; d < degree; d++) {
        will.data[base + d] = 0
      }
    }
  }
}

// The per-x-slab mean occupancy (|tone| averaged over the slots), the coarse macroscopic profile whose gradient
// is the pointer (the classical record).
export function slabOccupancy(will: Will, axis = 0): number[] {
  const mesh = will.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree
  const sum = new Array<number>(side).fill(0)
  const count = new Array<number>(side).fill(0)
  const coord = (cell: number): number =>
    axis === 0 ? cell % side : Math.floor(cell / side) % side

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = coord(cell)
    const base = cell * degree

    for (let d = 0; d < degree; d++) {
      sum[x]! += Math.abs(will.data[base + d]!)
      count[x]! += 1
    }
  }

  return sum.map((s, i) => s / Math.max(1, count[i]!))
}

// The coarse-POINTER trajectory, the occupancy gradient after each beat. Open holds the bath at the frontier.
export function pointerTrajectory(input: {
  init: Will
  forward: Collision
  table: Int32Array
  beats: number
  open: boolean
  frontierX: number
  axis?: number
}): number[] {
  const axis = input.axis ?? 0

  let current = cloneWill(input.init)
  let scratch: Will = {
    mesh: current.mesh,
    data: new Int8Array(current.data.length),
  }

  const trajectory: number[] = []

  for (let t = 0; t < input.beats; t++) {
    beatInto({
      src: current,
      dst: scratch,
      table: input.table,
      collision: input.forward,
    })

    const swap = current

    current = scratch
    scratch = swap

    if (input.open) {
      bornAtPeace(current, input.frontierX)
    }

    trajectory.push(profileGradient(slabOccupancy(current, axis)))
  }

  return trajectory
}

// The per-beat coarse SLAB-OCCUPANCY field (not just its scalar gradient), the spatial
// field a persistence measure reads. Same dynamics as pointerTrajectory (run the rule
// `beats` beats, optionally holding the frontier slab at peace so the fine phase leaks to
// the open edge), but it returns the whole occupancy profile each beat so its spatial
// pattern can be autocorrelated over time. A settled classical record holds its profile
// (high lag autocorrelation), a coherent closed system does not.
export function slabOccupancySeries(input: {
  init: Will
  forward: Collision
  table: Int32Array
  beats: number
  open: boolean
  frontierX: number
  axis?: number
}): number[][] {
  const axis = input.axis ?? 0

  let current = cloneWill(input.init)
  let scratch: Will = {
    mesh: current.mesh,
    data: new Int8Array(current.data.length),
  }

  const series: number[][] = []

  for (let t = 0; t < input.beats; t++) {
    beatInto({
      src: current,
      dst: scratch,
      table: input.table,
      collision: input.forward,
    })

    const swap = current

    current = scratch
    scratch = swap

    if (input.open) {
      bornAtPeace(current, input.frontierX)
    }

    series.push(slabOccupancy(current, axis))
  }

  return series
}

// The Loschmidt echo, forward `beats` then the exact inverse bulk backward `beats`, the recovery error. Zero for
// the closed reversible bulk (the coherence is intact, no record), nonzero for the open one (the fine phase has
// leaked to the bath, an irreversible record).
export function loschmidtEcho(input: {
  init: Will
  forward: Collision
  inverse: Collision
  table: Int32Array
  beats: number
  open: boolean
  frontierX: number
}): number {
  let current = cloneWill(input.init)
  let scratch: Will = {
    mesh: current.mesh,
    data: new Int8Array(current.data.length),
  }

  for (let t = 0; t < input.beats; t++) {
    beatInto({
      src: current,
      dst: scratch,
      table: input.table,
      collision: input.forward,
    })

    const swap = current

    current = scratch
    scratch = swap

    if (input.open) {
      bornAtPeace(current, input.frontierX)
    }
  }

  for (let t = 0; t < input.beats; t++) {
    current = inverseBeat(current, input.inverse)
  }

  return disagreementFraction(current.data, input.init.data)
}

// The settling time, the first beat after which the pointer stays within `tol` of its final value (the record
// has formed and held). Returns the trajectory length if it never settles.
export function settlingTime(
  trajectory: number[],
  tol: number,
): number {
  const final = trajectory[trajectory.length - 1] ?? 0

  for (let t = 0; t < trajectory.length; t++) {
    let settled = true

    for (let s = t; s < trajectory.length; s++) {
      if (Math.abs(trajectory[s]! - final) > tol) {
        settled = false
        break
      }
    }

    if (settled) {
      return t
    }
  }

  return trajectory.length
}

// The SIGNED coarse pointer, mean occupancy in the low-x half minus the high-x half,
// normalised to [-1, 1]. Positive means mass piled toward low x, negative toward high
// x. Unlike profileGradient (a magnitude) this DISTINGUISHES the two macroscopic
// outcomes of a two-sided measurement, so it can see a branch selection or its absence.
export function signedSlabPointer(will: Will, axis = 0): number {
  const occ = slabOccupancy(will, axis)
  const side = occ.length

  let lo = 0
  let hi = 0

  for (let x = 0; x < side; x++) {
    if (x < side / 2) {
      lo += occ[x]!
    } else {
      hi += occ[x]!
    }
  }

  const total = lo + hi

  return total > 0 ? (lo - hi) / total : 0
}

// Hold every slab in `frontiers` (x-coordinates) at peace, the open drains the fine
// phase disperses into. Generalises bornAtPeace to several drains, so a symmetric
// two-drain detector (both ends open) can be built.
export function drainSlabs(
  will: Will,
  frontiers: readonly number[],
): void {
  const mesh = will.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree
  const drain = new Set(frontiers)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (drain.has(cell % side)) {
      const base = cell * degree

      for (let d = 0; d < degree; d++) {
        will.data[base + d] = 0
      }
    }
  }
}

// Run the committed reversible rule for `beats`, holding the given `drains` slabs at
// peace each beat, and return the final SIGNED pointer. This is the settled outcome of
// a measurement with the chosen drain geometry (one-sided or symmetric two-sided).
export function settledSignedPointer(input: {
  init: Will
  forward: Collision
  table: Int32Array
  beats: number
  drains: readonly number[]
  axis?: number
}): number {
  const axis = input.axis ?? 0

  let current = cloneWill(input.init)
  let scratch: Will = {
    mesh: current.mesh,
    data: new Int8Array(current.data.length),
  }

  for (let t = 0; t < input.beats; t++) {
    beatInto({
      src: current,
      dst: scratch,
      table: input.table,
      collision: input.forward,
    })

    const swap = current

    current = scratch
    scratch = swap

    drainSlabs(current, input.drains)
  }

  return signedSlabPointer(current, axis)
}

// Mirror the high-x half of a will onto the low-x half so the coarse occupancy is
// exactly left-right symmetric, occ(x) = occ(side-1-x). The symmetric ready-state a
// two-sided detector starts from.
export function symmetriseLeftRight(will: Will): void {
  const mesh = will.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % side

    if (x >= side / 2) {
      const mirrorX = side - 1 - x
      const mirrorCell = cell - x + mirrorX
      const base = cell * degree
      const mirrorBase = mirrorCell * degree

      for (let d = 0; d < degree; d++) {
        will.data[base + d] = will.data[mirrorBase + d]!
      }
    }
  }
}

// The mean of the last `fraction` of a trajectory, the settled value.
export function tailMean(
  trajectory: number[],
  fraction = 0.25,
): number {
  const start = Math.floor(trajectory.length * (1 - fraction))
  const tail = trajectory.slice(start)

  return tail.reduce((a, b) => a + b, 0) / Math.max(1, tail.length)
}

// The growth of a single-slot perturbation under the reversible rule (no drains): flip one
// slot in `init`, evolve the base and the flipped copy for `beats` beats under the same rule,
// and return the PEAK fraction of slots that differ over the run. This is the scrambling /
// sensitive-dependence diagnostic. A deterministically CHAOTIC rule drives this toward about
// 0.5 (two microstates decorrelate, a macroscopic difference); a near-integrable rule keeps it
// MICROSCOPIC (order 1 / total-slots), so a microscopic seed never becomes a macroscopic branch.
// Deterministic and exact (integer slot counts, no tolerance, no randomness).
export function perturbationGrowth(input: {
  init: Will
  forward: Collision
  table: Int32Array
  beats: number
  slot: number
}): { peakFraction: number; finalFraction: number } {
  const flipped = cloneWill(input.init)
  const value = flipped.data[input.slot] ?? 0

  flipped.data[input.slot] = ((value + 2) % 3) - 1

  let base = cloneWill(input.init)
  let baseScratch: Will = {
    mesh: base.mesh,
    data: new Int8Array(base.data.length),
  }

  let perturbed = flipped
  let perturbedScratch: Will = {
    mesh: perturbed.mesh,
    data: new Int8Array(perturbed.data.length),
  }

  let peak = disagreementFraction(base.data, perturbed.data)

  for (let t = 0; t < input.beats; t++) {
    beatInto({
      src: base,
      dst: baseScratch,
      table: input.table,
      collision: input.forward,
    })

    beatInto({
      src: perturbed,
      dst: perturbedScratch,
      table: input.table,
      collision: input.forward,
    })

    const baseSwap = base

    base = baseScratch
    baseScratch = baseSwap

    const perturbedSwap = perturbed

    perturbed = perturbedScratch
    perturbedScratch = perturbedSwap

    const fraction = disagreementFraction(base.data, perturbed.data)

    if (fraction > peak) {
      peak = fraction
    }
  }

  return {
    peakFraction: peak,
    finalFraction: disagreementFraction(base.data, perturbed.data),
  }
}
