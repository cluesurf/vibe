// The paid scatter weave: the scatter weave (code/rule/scatter-weave) whose pair clock is paid from demons,
// so the rule keeps an energy and keeps its arrow (E-FLD-0028).
//
// E-FLD-0027 proved that no rule that makes a love and a fear from calm keeps an additive energy over the
// slots. A demon escapes the proof by being a second kind of degree of freedom: every line of every dock
// holds a counter, a whole number at least zero, that does not stream. The wire step of the pair clock is
// paid from its line's counter: calm becomes a pair only when the counter holds the pair's mass, 2, and
// takes it; a pair annihilating to calm gives the 2 back; the flip is free. For the bind cycle this is a
// bijection on (wire state, counter): a calm wire whose counter holds 0 or 1 stays calm, and nothing else
// changes (the inverse runs the inverse table with the same payment), so reversal is exact. Then
//
//   E = (number of tones) + (sum of the counters)
//
// is kept exactly: streaming moves tones and keeps their number, the scatterings and exchanges move tones
// inside a dock, and the paid clock trades 2 tones for 2 counter units. The clock still runs wherever a
// line holds energy. Negation (charge conjugation) leaves the counters alone and turns the paid clock into
// its inverse as it did unpaid, so CPT holds at the base phase. Counters carry no role point and no color.
//
// Two beats: vibes and counters on any mesh (paidBeat, for the physics on d4Mesh), and vibes, role points,
// flows and counters on the D4 box of code/rule/vibe-weave (paidRoleBeat, for local color and reversal).

import { type Mesh } from '@/code/tool/mesh'
import { stream, streamInverse } from '@/code/rule/lattice-gas'
import { makeVibeWeave, type VibeWeave } from '@/code/rule/vibe-weave'
import { buildScatterWeave, dockCollide, type ScatterBuilt, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'

export const PAIR_MASS = 2

export type PaidState = { readonly vibe: Int8Array; readonly demon: Int32Array }
export type PaidRoleState = PaidState & { readonly role: Int8Array; readonly flow: Int32Array }

export type PaidWeave = { readonly mesh: Mesh; readonly spec: ScatterWeaveSpec; readonly built: ScatterBuilt }

export function makePaidWeave(input: { mesh: Mesh; spec: ScatterWeaveSpec }): PaidWeave {
  const opposite = Array.from({ length: 24 }, (_, d) => input.mesh.opposite(d))

  return { mesh: input.mesh, spec: input.spec, built: buildScatterWeave(input.spec, opposite) }
}

// the collision of beat t on every dock, in place, forward or inverse
export function paidCollide(weave: PaidWeave, vibe: Int8Array, role: Int8Array | undefined, demon: Int32Array, t: number, forward: boolean): void {
  for (let x = 0; x < weave.mesh.cellCount; x++) {
    dockCollide(weave.spec, weave.built, vibe, role, x * 24, t, forward, undefined, demon)
  }
}

export function paidBeat(weave: PaidWeave, state: PaidState, t: number): PaidState {
  const vibe = Int8Array.from(state.vibe)
  const demon = Int32Array.from(state.demon)

  paidCollide(weave, vibe, undefined, demon, t, true)

  return { vibe: stream({ mesh: weave.mesh, data: vibe }).data, demon }
}

export function paidBeatBack(weave: PaidWeave, state: PaidState, t: number): PaidState {
  const vibe = streamInverse({ mesh: weave.mesh, data: Int8Array.from(state.vibe) }).data
  const demon = Int32Array.from(state.demon)

  paidCollide(weave, vibe, undefined, demon, t, false)

  return { vibe, demon }
}

export type PaidRoleWeave = PaidWeave & { readonly vibeWeave: VibeWeave }

export function makePaidRoleWeave(input: { side: number; spec: ScatterWeaveSpec }): PaidRoleWeave {
  const vibeWeave = makeVibeWeave({ side: input.side })

  return { ...makePaidWeave({ mesh: vibeWeave.mesh, spec: input.spec }), vibeWeave }
}

// one beat with role points and flows, as code/rule/scatter-weave scatterBeat, with the counters
export function paidRoleBeat(weave: PaidRoleWeave, state: PaidRoleState, t: number): PaidRoleState {
  const { mesh, moves, links } = weave.vibeWeave
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)
  const flow = Int32Array.from(state.flow)
  const demon = Int32Array.from(state.demon)

  paidCollide(weave, vibe, role, demon, t, true)

  const moved = new Int8Array(role.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      moved[mesh.neighbour(x, d) * 24 + d] = moves.act[links[slot] ?? moves.identity]?.[role[slot] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) + (vibe[slot] ?? 0)
    }
  }

  return { vibe: stream({ mesh, data: vibe }).data, role: moved, flow, demon }
}

export function paidRoleBeatBack(weave: PaidRoleWeave, state: PaidRoleState, t: number): PaidRoleState {
  const { mesh, moves, links, opposite } = weave.vibeWeave
  const vibe = streamInverse({ mesh, data: Int8Array.from(state.vibe) }).data
  const role = new Int8Array(state.role.length)
  const flow = Int32Array.from(state.flow)
  const demon = Int32Array.from(state.demon)

  for (let y = 0; y < mesh.cellCount; y++) {
    for (let d = 0; d < 24; d++) {
      const x = mesh.neighbour(y, opposite[d] ?? d)
      const slot = x * 24 + d

      role[slot] = moves.act[moves.inverse[links[slot] ?? moves.identity] ?? moves.identity]?.[state.role[y * 24 + d] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) - (vibe[slot] ?? 0)
    }
  }

  paidCollide(weave, vibe, role, demon, t, false)

  return { vibe, role, flow, demon }
}

// the conserved energy: tones plus counters
export function paidEnergy(state: PaidState): number {
  let e = 0

  for (let i = 0; i < state.vibe.length; i++) {
    e += Math.abs(state.vibe[i] ?? 0)
  }

  for (let i = 0; i < state.demon.length; i++) {
    e += state.demon[i] ?? 0
  }

  return e
}

// counters for every line of every dock: a uniform value, or a deterministic hash fill of units
export function demonFill(input: { docks: number; uniform?: number; fraction?: number; salt?: number }): Int32Array {
  const golden = (Math.sqrt(5) - 1) / 2
  const salt = input.salt ?? 1

  return Int32Array.from({ length: input.docks * 12 }, (_, i) => {
    if (input.uniform !== undefined) {
      return input.uniform
    }

    return ((i + 1) * golden * (1 + salt * 0.37)) % 1 < (input.fraction ?? 0) ? PAIR_MASS : 0
  })
}
