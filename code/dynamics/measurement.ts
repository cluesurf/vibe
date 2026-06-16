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

const sideOf = (mesh: Mesh): number => Math.round(Math.pow(mesh.cellCount, 1 / 4))

// Hold a frontier slab (cells at a fixed x-coordinate) at peace, the open bath the fine phase disperses into.
export function bornAtPeace(will: Will, frontierX: number): void {
  const mesh = will.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (cell % side === frontierX) {
      const base = cell * degree
      for (let d = 0; d < degree; d++) will.data[base + d] = 0
    }
  }
}

// The per-x-slab mean occupancy (|tone| averaged over the slots), the coarse macroscopic profile whose gradient
// is the pointer (the classical record).
export function slabOccupancy(will: Will): number[] {
  const mesh = will.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree
  const sum = new Array<number>(side).fill(0)
  const count = new Array<number>(side).fill(0)
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % side
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
}): number[] {
  let current = cloneWill(input.init)
  let scratch: Will = { mesh: current.mesh, data: new Int8Array(current.data.length) }
  const trajectory: number[] = []
  for (let t = 0; t < input.beats; t++) {
    beatInto({ src: current, dst: scratch, table: input.table, collision: input.forward })
    const swap = current
    current = scratch
    scratch = swap
    if (input.open) bornAtPeace(current, input.frontierX)
    trajectory.push(profileGradient(slabOccupancy(current)))
  }
  return trajectory
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
  let scratch: Will = { mesh: current.mesh, data: new Int8Array(current.data.length) }
  for (let t = 0; t < input.beats; t++) {
    beatInto({ src: current, dst: scratch, table: input.table, collision: input.forward })
    const swap = current
    current = scratch
    scratch = swap
    if (input.open) bornAtPeace(current, input.frontierX)
  }
  for (let t = 0; t < input.beats; t++) current = inverseBeat(current, input.inverse)
  return disagreementFraction(current.data, input.init.data)
}

// The settling time, the first beat after which the pointer stays within `tol` of its final value (the record
// has formed and held). Returns the trajectory length if it never settles.
export function settlingTime(trajectory: number[], tol: number): number {
  const final = trajectory[trajectory.length - 1] ?? 0
  for (let t = 0; t < trajectory.length; t++) {
    let settled = true
    for (let s = t; s < trajectory.length; s++) {
      if (Math.abs(trajectory[s]! - final) > tol) { settled = false; break }
    }
    if (settled) return t
  }
  return trajectory.length
}

// The mean of the last `fraction` of a trajectory, the settled value.
export function tailMean(trajectory: number[], fraction = 0.25): number {
  const start = Math.floor(trajectory.length * (1 - fraction))
  const tail = trajectory.slice(start)
  return tail.reduce((a, b) => a + b, 0) / Math.max(1, tail.length)
}
