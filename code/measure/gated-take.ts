// An occupancy-gated take on the adopted knit: a dock's slots take their neighbor's value less often where the dock is
// crowded (E-GRV-0060, the rule and its reversibility; E-GRV-0061, its effect read on the husk).
//
// THE KNIT. The coset-union vacuum under the lone bounce collision, run by the bounce kernel (code/measure/second-law-husk,
// code/measure/bounce-pair-kernel). Nothing in the collision is changed. What is added is one integer COUNTER per dock and
// one PARITY bit per dock (the dock's own count of takes, mod 2), and the stream is gated by the counter.
//
// THE RULE, beat by beat:
//   1. the gate: a dock is ACTIVE when its counter is 0, and PAUSED otherwise
//   2. every active dock collides (the knit's own pieces, in the order its parity picks: even P then K, odd K then P)
//   3. the take: an active dock's slot takes the value of its neighbor's slot along the root, as in the knit, when that
//      neighbor is active too. A paused dock's slots keep their values (they take nothing and give nothing). A slot of an
//      active dock whose neighbor along its root is paused TURNS BACK: its vibe takes the opposite slot of its own dock
//      (the held knot's reflection, code/measure/held-knot, for a held set that changes from beat to beat)
//   4. every active dock flips its parity
//   5. the counter: with E the dock's energy AFTER the take (held slots + 2 per stored unit, the knit's own conserved
//      energy, which the collision keeps per dock), the dock counts one beat toward its threshold L(E) and carries to 0
//      when it reaches it: c -> (c + 1) mod L(E) for c < L(E). Counter values at or above L(E) (never reached from the
//      rest start, see below) run their own cycle L(E), L(E) + 1, .., M - 1, L(E), which only exists to make the map a
//      permutation of 0 .. M - 1 for every E
// THE LAW. L(E) = 1 + max(0, E - threshold), so a dock at or below the threshold takes every beat, and a dock holding
// more takes once every L(E) beats. M = 1 + 48 - threshold is the largest L (a dock holds at most 24 + 2 x 12 = 48).
// A constant law (L the same for every E) is kept as a CONTROL of the machinery.
//
// WHY IT IS A BIJECTION. The gate reads only counters, which steps 2 to 4 do not change, and for a fixed active set steps
// 2 and 3 are the collision (a bijection) and the held-knot stream (a permutation of the slots for any held set). Step 5
// reads E, which it does not change, and applies a permutation of the counter for each E. The inverse undoes 5 (E read
// from the state), then reads the gate from the restored counters, undoes 4, 3 and 2. Every value is an integer; nothing
// rounds.
//
// FROM THE REST START (every counter 0) the upper cycle is never entered: E changes only on a dock's active beat (a
// paused dock's slots are untouched, and a turned-back vibe stays in its own, active, dock), and on that beat the counter
// is 0, so it moves into 0 .. L(E) - 1 and runs down its cycle with E fixed until the next take. So from rest a dock with
// energy E after a take takes again exactly L(E) beats later.
//
// THE TWO NATURAL DESIGNS THIS REPLACES, and why they are not bijections (witnesses below, run by E-GRV-0060):
//   N1 take-or-keep: each slot takes its neighbor's value when its dock's gate is open and keeps its own otherwise. Along
//      a closed stream line, slot j's old value survives once only if (1 - take[j]) + take[j + 1] = 1, i.e. take[j + 1] =
//      take[j]: the gate must be the same on the whole line, so any gate that differs between two neighbors loses a
//      value (and a vibe: charge is not kept)
//   N2 the carry gate: the counter advances by A - E and the dock takes on the beat it carries, E read at that beat. The
//      take changes E, so the inverse cannot tell a dock that took from one that did not: two different states map to
//      one (the witness: a paused dock holding one vibe, against an active empty dock receiving the same vibe)
//
// NO ROUNDING in the rule. Reals only in the readers and in the Weyl fills. DETERMINISM: Weyl fills, nothing drawn.
// NOTHING MOVES: a slot takes its neighbor's value, and a turned-back vibe takes the opposite slot of its own dock.

import { OPPOSITE } from '@/code/rule/isometric-knit'
import { coinMove, pairMove } from '@/code/measure/bounce-pair-kernel'
import {
  cloneReduced,
  sameReduced,
  type Reduced,
} from '@/code/measure/living-pair-kernel'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { type ArrowBox } from '@/code/measure/second-law-husk'
import { columnPosition, ring } from '@/code/measure/held-knot'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const frac = (x: number): number => x - Math.floor(x)

// the most energy a dock can hold: 24 slots and 12 stored units of 2
export const DOCK_ENERGY_MAX = 48

export type GateLaw = {
  readonly name: string
  // the counter runs over 0 .. top - 1
  readonly top: number
  // beats per take for a dock of energy e (1 .. top)
  readonly length: (e: number) => number
}

export function occupancyLaw(threshold: number): GateLaw {
  return {
    name: `occupancy>${threshold}`,
    top: 1 + DOCK_ENERGY_MAX - threshold,
    length: e => 1 + Math.max(0, e - threshold),
  }
}

export function constantLaw(beats: number): GateLaw {
  return { name: `constant${beats}`, top: beats, length: () => beats }
}

// the counter permutation for a cycle length L on 0 .. top - 1, and its inverse
export function counterStep(c: number, L: number, top: number): number {
  if (c < L) {
    return (c + 1) % L
  }

  return c + 1 < top ? c + 1 : L
}

export function counterStepBack(
  c: number,
  L: number,
  top: number,
): number {
  if (c < L) {
    return (c - 1 + L) % L
  }

  return c === L ? top - 1 : c - 1
}

export type GatedState = {
  s: Reduced
  counter: Uint8Array
  parity: Uint8Array
}

export type GatedTake = {
  readonly box: ArrowBox
  readonly law: GateLaw
  // per slot: the slot whose vibe the plain stream brings here
  readonly source: Int32Array
  // scratch: the active docks of the beat in hand
  readonly active: Uint8Array
}

export function gatedTake(box: ArrowBox, law: GateLaw): GatedTake {
  const target = box.kernel.target
  const source = new Int32Array(target.length).fill(-1)

  for (let slot = 0; slot < target.length; slot++) {
    const to = target[slot]!

    if (source[to] !== -1) {
      throw new Error('the stream is not a permutation')
    }

    source[to] = slot
  }

  return { box, law, source, active: new Uint8Array(box.cells) }
}

export function dockEnergy(s: Reduced, x: number): number {
  let e = 0

  for (let d = 0; d < 24; d++) {
    if (s.vibe[x * 24 + d] !== 0) {
      e++
    }
  }

  for (let l = 0; l < 12; l++) {
    if (s.store[x * 12 + l] !== 0) {
      e += 2
    }
  }

  return e
}

export function restState(s: Reduced, cells: number): GatedState {
  return {
    s: cloneReduced(s),
    counter: new Uint8Array(cells),
    parity: new Uint8Array(cells),
  }
}

export function cloneGated(g: GatedState): GatedState {
  return {
    s: cloneReduced(g.s),
    counter: Uint8Array.from(g.counter),
    parity: Uint8Array.from(g.parity),
  }
}

export function sameGated(a: GatedState, b: GatedState): boolean {
  if (!sameReduced(a.s, b.s)) {
    return false
  }

  for (let x = 0; x < a.counter.length; x++) {
    if (a.counter[x] !== b.counter[x] || a.parity[x] !== b.parity[x]) {
      return false
    }
  }

  return true
}

export type BeatTally = {
  active: number
  turned: number
  upper: number
}

// one beat forward: a (mutated by the collision) into b
export function gatedBeat(
  g: GatedTake,
  a: GatedState,
  b: GatedState,
  tally?: BeatTally,
): void {
  const kernel = g.box.kernel
  const cells = g.box.cells
  const active = g.active
  const top = g.law.top

  for (let x = 0; x < cells; x++) {
    active[x] = a.counter[x] === 0 ? 1 : 0
  }

  for (let x = 0; x < cells; x++) {
    if (!active[x]) {
      continue
    }

    for (const piece of collisionOrder(kernel.schedule, a.parity[x]!)) {
      if (piece === 'P') {
        pairMove(kernel, a.s, x)
      } else {
        coinMove(kernel, a.s, x)
      }
    }
  }

  b.s.vibe.fill(0)

  for (let slot = 0; slot < a.s.vibe.length; slot++) {
    const v = a.s.vibe[slot]!

    if (v === 0) {
      continue
    }

    const x = (slot / 24) | 0

    if (!active[x]) {
      b.s.vibe[slot] = v
      b.s.point[slot] = a.s.point[slot]!
      continue
    }

    const to = kernel.target[slot]!

    if (active[(to / 24) | 0]) {
      b.s.vibe[to] = v
      b.s.point[to] = kernel.move[slot]![a.s.point[slot]!]!
    } else {
      const back = x * 24 + OPPOSITE[slot % 24]!

      b.s.vibe[back] = v
      b.s.point[back] = a.s.point[slot]!

      if (tally) {
        tally.turned++
      }
    }
  }

  b.s.store.set(a.s.store)
  b.s.spoint.set(a.s.spoint)

  for (let x = 0; x < cells; x++) {
    b.parity[x] = a.parity[x]! ^ active[x]!

    const L = g.law.length(dockEnergy(b.s, x))
    const c = a.counter[x]!

    b.counter[x] = counterStep(c, L, top)

    if (tally) {
      if (active[x]) {
        tally.active++
      }

      if (b.counter[x]! >= L) {
        tally.upper++
      }
    }
  }
}

// the exact inverse: a (the state after the beat) into b (the state before it)
export function gatedBeatBack(
  g: GatedTake,
  a: GatedState,
  b: GatedState,
): void {
  const kernel = g.box.kernel
  const cells = g.box.cells
  const active = g.active
  const top = g.law.top

  for (let x = 0; x < cells; x++) {
    const L = g.law.length(dockEnergy(a.s, x))
    const c = counterStepBack(a.counter[x]!, L, top)

    b.counter[x] = c
    active[x] = c === 0 ? 1 : 0
    b.parity[x] = a.parity[x]! ^ active[x]!
  }

  b.s.vibe.fill(0)

  for (let z = 0; z < a.s.vibe.length; z++) {
    const v = a.s.vibe[z]!

    if (v === 0) {
      continue
    }

    const y = (z / 24) | 0

    if (!active[y]) {
      b.s.vibe[z] = v
      b.s.point[z] = a.s.point[z]!
      continue
    }

    const from = g.source[z]!

    if (active[(from / 24) | 0]) {
      b.s.vibe[from] = v
      b.s.point[from] = g.box.inverseMove[from]![a.s.point[z]!]!
    } else {
      const back = y * 24 + OPPOSITE[z % 24]!

      b.s.vibe[back] = v
      b.s.point[back] = a.s.point[z]!
    }
  }

  b.s.store.set(a.s.store)
  b.s.spoint.set(a.s.spoint)

  for (let x = 0; x < cells; x++) {
    if (!active[x]) {
      continue
    }

    const order = collisionOrder(kernel.schedule, b.parity[x]!)

    for (let i = order.length - 1; i >= 0; i--) {
      if (order[i] === 'P') {
        pairMove(kernel, b.s, x)
      } else {
        coinMove(kernel, b.s, x)
      }
    }
  }
}

export type GatedRunner = {
  state: () => GatedState
  time: () => number
  forward: (tally?: BeatTally) => void
  backward: () => void
}

export function gatedRunner(
  g: GatedTake,
  start: GatedState,
): GatedRunner {
  let a = cloneGated(start)
  let b = cloneGated(start)
  let t = 0

  const swap = (): void => {
    const c = a

    a = b
    b = c
  }

  return {
    state: () => a,
    time: () => t,
    forward: tally => {
      gatedBeat(g, a, b, tally)
      t++
      swap()
    },
    backward: () => {
      gatedBeatBack(g, a, b)
      t--
      swap()
    },
  }
}

// ---- the crowd, fills and transforms (Weyl, no draw) ----

// the husk ball of columns within `radius` of `center` (min image), at full depth: per dock 1 if in it
export function ballDocks(
  box: ArrowBox,
  radius: number,
  center: readonly number[],
): Uint8Array {
  const side = box.side

  return Uint8Array.from(box.column, c => {
    const p = columnPosition(c, side)

    return p.reduce(
      (acc, v, i) => acc + ring(v - center[i]!, side) ** 2,
      0,
    ) <=
      radius * radius
      ? 1
      : 0
  })
}

// THE CROWD: every slot and every store line of the docks in `docks` filled, love or fear by a Weyl value (times
// `sign`, so sign -1 is the same crowd with every charge flipped), role points by a second; the crowd's counters set to
// `counter` (a value below L of a full dock: the crowd prepared `counter` beats after its last take)
export function crowdStart(
  box: ArrowBox,
  base: GatedState,
  input: {
    docks: Uint8Array
    phase: number
    sign: 1 | -1
    counter: number
  },
): GatedState {
  const out = cloneGated(base)

  for (let x = 0; x < box.cells; x++) {
    if (!input.docks[x]) {
      continue
    }

    for (let d = 0; d < 24; d++) {
      const n = x * 24 + d + 1

      out.s.vibe[n - 1] =
        (frac(n * SILVER + input.phase * GOLDEN + 0.5 * GOLDEN) < 0.5
          ? 1
          : -1) * input.sign

      out.s.point[n - 1] = Math.floor(
        9 * frac(n * (GOLDEN + SILVER) + input.phase * GOLDEN * GOLDEN),
      )
    }

    for (let l = 0; l < 12; l++) {
      const n = x * 12 + l + 1

      out.s.store[n - 1] =
        (frac(n * GOLDEN + input.phase * SILVER + 0.25 * SILVER) < 0.5
          ? 1
          : -1) * input.sign

      out.s.spoint[n - 1] = Math.floor(
        9 * frac(n * SILVER * SILVER + input.phase * GOLDEN),
      )
    }

    out.counter[x] = input.counter
  }

  return out
}

// a Weyl gas on every dock: each calm slot held when its Weyl value falls below perDock / 24 (rate distinct from the
// crowd's), love or fear and a role point by further Weyl values
export function gasFill(
  box: ArrowBox,
  base: GatedState,
  input: { perDock: number; phase: number; only?: Uint8Array },
): GatedState {
  const out = cloneGated(base)
  const cut = input.perDock / 24

  for (let slot = 0; slot < out.s.vibe.length; slot++) {
    if (out.s.vibe[slot] !== 0) {
      continue
    }

    if (input.only && !input.only[(slot / 24) | 0]) {
      continue
    }

    const n = slot + 1

    if (
      frac(n * GOLDEN + input.phase * SILVER + 3 * GOLDEN * SILVER) >=
      cut
    ) {
      continue
    }

    out.s.vibe[slot] =
      frac(n * SILVER + input.phase * GOLDEN + 3 * SILVER * SILVER) <
      0.5
        ? 1
        : -1

    out.s.point[slot] = Math.floor(
      9 *
        frac(
          n * (GOLDEN + SILVER) +
            input.phase * GOLDEN * GOLDEN +
            3 * GOLDEN,
        ),
    )
  }

  return out
}

// global charge conjugation: every slot and store trit negated
export function conjugate(g: GatedState): GatedState {
  const out = cloneGated(g)

  for (let i = 0; i < out.s.vibe.length; i++) {
    out.s.vibe[i] = -out.s.vibe[i]!
  }

  for (let i = 0; i < out.s.store.length; i++) {
    out.s.store[i] = -out.s.store[i]!
  }

  return out
}

// the lattice translation x -> along[x] (the depth step 2 e4) applied to a state
export function translate(box: ArrowBox, g: GatedState): GatedState {
  const out = cloneGated(g)

  for (let x = 0; x < box.cells; x++) {
    const y = box.along[x]!

    for (let d = 0; d < 24; d++) {
      out.s.vibe[y * 24 + d] = g.s.vibe[x * 24 + d]!
      out.s.point[y * 24 + d] = g.s.point[x * 24 + d]!
    }

    for (let l = 0; l < 12; l++) {
      out.s.store[y * 12 + l] = g.s.store[x * 12 + l]!
      out.s.spoint[y * 12 + l] = g.s.spoint[x * 12 + l]!
    }

    out.counter[y] = g.counter[x]!
    out.parity[y] = g.parity[x]!
  }

  return out
}

// ---- the two natural designs, as maps, for their witnesses ----

// N1, the transport alone: a slot of a dock whose gate is open takes its stream source's value, and keeps its own
// otherwise (no turning back)
export function takeOrKeep(
  box: ArrowBox,
  source: Int32Array,
  s: Reduced,
  takes: Uint8Array,
): Reduced {
  const out = cloneReduced(s)

  out.vibe.fill(0)

  for (let z = 0; z < s.vibe.length; z++) {
    const y = (z / 24) | 0

    if (takes[y]) {
      const from = source[z]!

      out.vibe[z] = s.vibe[from]!
      out.point[z] =
        s.vibe[from] !== 0 ? box.kernel.move[from]![s.point[from]!]! : 0
    } else {
      out.vibe[z] = s.vibe[z]!
      out.point[z] = s.point[z]!
    }
  }

  return out
}

// N2, the carry gate: the counter advances by A - E (E the dock's energy at the start of the beat) mod M, and the dock
// takes (collides, and streams with the turning back of the rule above) on the beat it carries; global schedule t
export function carryBeat(
  box: ArrowBox,
  input: { advance: number; top: number },
  g: GatedState,
  t: number,
): GatedState {
  const kernel = box.kernel
  const a = cloneGated(g)
  const out = cloneGated(g)
  const active = new Uint8Array(box.cells)

  for (let x = 0; x < box.cells; x++) {
    const sum = a.counter[x]! + input.advance - dockEnergy(a.s, x)

    active[x] = sum >= input.top ? 1 : 0
    out.counter[x] = sum - input.top * active[x]!
  }

  for (let x = 0; x < box.cells; x++) {
    if (!active[x]) {
      continue
    }

    for (const piece of collisionOrder(kernel.schedule, t)) {
      if (piece === 'P') {
        pairMove(kernel, a.s, x)
      } else {
        coinMove(kernel, a.s, x)
      }
    }
  }

  out.s.vibe.fill(0)

  for (let slot = 0; slot < a.s.vibe.length; slot++) {
    const v = a.s.vibe[slot]!

    if (v === 0) {
      continue
    }

    const x = (slot / 24) | 0

    if (!active[x]) {
      out.s.vibe[slot] = v
      out.s.point[slot] = a.s.point[slot]!
      continue
    }

    const to = kernel.target[slot]!

    if (active[(to / 24) | 0]) {
      out.s.vibe[to] = v
      out.s.point[to] = kernel.move[slot]![a.s.point[slot]!]!
    } else {
      const back = x * 24 + OPPOSITE[slot % 24]!

      out.s.vibe[back] = v
      out.s.point[back] = a.s.point[slot]!
    }
  }

  out.s.store.set(a.s.store)
  out.s.spoint.set(a.s.spoint)

  return out
}

// the undoing of beat t's collision on dock x (the pieces in the other order, each its own inverse)
export function uncollide(
  box: ArrowBox,
  s: Reduced,
  x: number,
  t: number,
): void {
  const order = collisionOrder(box.kernel.schedule, t)

  for (let i = order.length - 1; i >= 0; i--) {
    if (order[i] === 'P') {
      pairMove(box.kernel, s, x)
    } else {
      coinMove(box.kernel, s, x)
    }
  }
}

// ---- readers (measurement; reals allowed) ----

// per husk column two independent 32-bit hashes of the column's slots and stores (content only), into a and b
export function contentHashes(
  box: ArrowBox,
  s: Reduced,
  a: Int32Array,
  b: Int32Array,
): void {
  a.fill(0)
  b.fill(0)

  for (let x = 0; x < box.cells; x++) {
    const c = box.column[x]!
    const d4 = box.depth[x]!

    let ha = a[c]!
    let hb = b[c]!

    for (let d = 0; d < 24; d++) {
      const v0 = s.vibe[x * 24 + d]!
      const v = v0 * 16 + (v0 !== 0 ? s.point[x * 24 + d]! : 0) + 40

      ha = Math.imul(ha ^ (v + d4 * 131 + d * 7), 0x9e3779b1)
      hb =
        Math.imul(hb + v * 31 + d4 * 17 + d, 0x85ebca6b) ^ (hb >>> 13)
    }

    for (let l = 0; l < 12; l++) {
      const v0 = s.store[x * 12 + l]!
      const v = v0 * 16 + (v0 !== 0 ? s.spoint[x * 12 + l]! : 0) + 40

      ha = Math.imul(ha ^ (v + d4 * 131 + l * 11 + 500), 0x9e3779b1)
      hb =
        Math.imul(hb + v * 37 + d4 * 19 + l + 500, 0x85ebca6b) ^
        (hb >>> 13)
    }

    a[c] = ha
    b[c] = hb
  }
}
