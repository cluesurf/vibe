// Option F (base-rule-options-for-a-self-level), the open-system route to a genuine arrow. The closed reversible
// bulk is a permutation, so it has no arrow, run it forward then backward and it returns exactly to the start.
// Growth makes the system OPEN. New cells are born at peace at the frontier every beat, a persistent low-entropy
// source (a reservoir). We model exactly that, the bulk evolves under the committed reversible pair table, and a
// frontier slab is held at peace each beat. The bulk rule stays a reversible permutation, the openness lives
// only at the growing frontier.
//
// We measure the arrow two robust ways, avoiding the limit-cycle and finite-sample pathologies that defeat a
// raw transition-asymmetry estimator on deterministic dynamics.
//  1. LOSCHMIDT ECHO. Run forward then run the exact inverse bulk rule backward. The closed bulk returns to the
//     start with ZERO error (it is a reversible permutation). The open growing system does NOT, because peace
//     was injected at the frontier, information the reversible bulk cannot restore. The irreversibility is
//     localized entirely at the growing boundary.
//  2. NON-EQUILIBRIUM STEADY-STATE GRADIENT. Run long and average the spatial occupancy profile. The closed bulk
//     relaxes to a flat profile (equilibrium, no current). The open growing system holds a persistent occupancy
//     GRADIENT from the frontier outward (a non-equilibrium steady state with a sustained current). The gradient
//     is the macroscopic footprint of the arrow.
//
// Depth L2, two arrow signatures measured on real dynamics with the closed bulk as the control. A nonzero open
// echo over a zero closed echo, and a steep open gradient over a flat closed one, is the genuine arrow that
// growth supplies, the open-system source of irreversibility a closed reversible permutation cannot have.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, fillWillPattern, type Will } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable, inverseBeat } from '@/code/rule/lattice-gas'
import { disagreementFraction } from '@/code/measure/agreement'
import { profileGradient } from '@/code/measure/profile'

const sideOf = (mesh: Mesh): number => Math.round(Math.pow(mesh.cellCount, 1 / 4))

// hold a frontier slab (cells at a fixed x-coordinate) at peace, modelling cells continuously born at peace.
function bornAtPeace(will: Will, frontierX: number): void {
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

// the Loschmidt echo, forward `beats` then the exact inverse bulk backward `beats`, the recovery error.
function loschmidtEcho(input: {
  init: Will
  forward: Collision
  inverse: Collision
  beats: number
  open: boolean
  frontierX: number
  table: Int32Array
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

// the time-averaged occupancy profile over the x-slabs, taken over the second half of a run (the steady state).
function occupancyProfile(input: {
  init: Will
  forward: Collision
  beats: number
  open: boolean
  frontierX: number
  table: Int32Array
}): number[] {
  const mesh = input.init.mesh
  const side = sideOf(mesh)
  const degree = mesh.degree
  const profile = new Array<number>(side).fill(0)
  let samples = 0
  let current = cloneWill(input.init)
  let scratch: Will = { mesh: current.mesh, data: new Int8Array(current.data.length) }
  for (let t = 0; t < input.beats; t++) {
    beatInto({ src: current, dst: scratch, table: input.table, collision: input.forward })
    const swap = current
    current = scratch
    scratch = swap
    if (input.open) bornAtPeace(current, input.frontierX)
    if (t >= input.beats / 2) {
      for (let cell = 0; cell < mesh.cellCount; cell++) {
        const x = cell % side
        const base = cell * degree
        for (let d = 0; d < degree; d++) if (current.data[base + d] !== 0) profile[x]!++
      }
      samples++
    }
  }
  return profile.map((p) => p / samples)
}

export default experiment({
  id: 'selves/growth-arrow-irreversibility',
  title: 'a growing open mesh carries an arrow of time (broken echo, steady gradient) that the closed reversible bulk does not',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 4
    const echoBeats = 200
    const profileBeats = 2000
    const mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) => mesh.opposite(d))
    const forward: Collision = pairCollision({ opposite, forward: true })
    const inverse: Collision = pairCollision({ opposite, forward: false })
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    // a deterministic structured fill (a fixed ternary function of the slot index, never random), the methodology
    // initial condition, with about a third peace so the create move has room to act.
    const init = makeWill(mesh)
    fillWillPattern(init)
    const frontierX = 0

    // 1, the Loschmidt echo. Closed returns exactly, open does not.
    const closedEcho = loschmidtEcho({ init, forward, inverse, beats: echoBeats, open: false, frontierX, table })
    const openEcho = loschmidtEcho({ init, forward, inverse, beats: echoBeats, open: true, frontierX, table })

    // 2, the steady-state occupancy gradient. Closed is flat, open holds a gradient.
    const closedProfile = occupancyProfile({ init, forward, beats: profileBeats, open: false, frontierX, table })
    const openProfile = occupancyProfile({ init, forward, beats: profileBeats, open: true, frontierX, table })
    const closedGradient = profileGradient(closedProfile)
    const openGradient = profileGradient(openProfile)

    const ok =
      closedEcho < 1e-12 &&
      openEcho > 0.01 &&
      openGradient > closedGradient + 0.2 &&
      closedGradient < 0.2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a growing open mesh, cells continuously born at peace at the frontier while the bulk evolves under the committed reversible rule, breaks the Loschmidt echo (forward then exact-inverse does not recover the start) and holds a persistent steady-state occupancy gradient, while the closed reversible bulk recovers exactly and relaxes to a flat profile, so the arrow comes from the open growing boundary, not from making the bulk irreversible',
      metrics: {
        closedEcho,
        openEcho,
        closedGradient,
        openGradient,
        echoBeats,
        profileBeats,
      },
      control: { closedEcho, closedGradient },
      notes:
        'the bulk rule stays a reversible permutation (closed echo is exactly zero), the irreversibility lives only at the growing frontier. The open echo is nonzero (peace injected cannot be un-mixed) and the open profile holds a gradient (a non-equilibrium steady state with a sustained current), the genuine arrow Option F supplies, the open-system source of the degeneracy a self-level needs',
    })
  },
})
