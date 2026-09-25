// Waiting slots: the committed slot architecture with two slots per cell that do not stream, a line
// orientation that can return, local color, and a move paid from the string energy.
//
// This is the rule note/experiment/gauge/what-the-base-needs argues for in its last bullets ("two waiting
// slots per cell, and a returning orientation of the lines"), built as written so it can be measured.
//
// A cell of the D4 box has 26 slots. Slots 0 to 23 are the moving slots of the committed rule, one per
// direction, and every one of them streams one link along its direction on every beat. Slot 24 waits on
// the plus side and slot 25 on the minus side. Neither ever streams. Each slot holds a vibe (fear, calm,
// love as -1, 0, +1), a role point (one of the 9 points of the role grid) and a tag that the rule only
// carries, so a measurement can follow a charge.
//
// The orientation says, for each of the 12 lines, which of its two slots is the plus side. Mask bit k set
// puts the plus side on the higher direction of line k, as in E-FRC-0130. The committed orientation is
// mask 0. A slot's side is the sign of its color when it is calm (E-FRC-0124), so the color of a cell is
//
//   Q = sum over its 26 slots of w * p,   w = the vibe, or on a calm slot the slot's side.
//
// Each undirected link, from the lower direction of each line, holds a flux E and a demon, as in
// code/rule/string-graph. Gauss's law: the flux leaving a cell minus the flux entering it equals the sum of
// the vibes in its 26 slots. The energy
//
//   H = mass * (slots holding a vibe) + tension * (links with E mod 3 not 0) + sum of demons
//
// is conserved to the unit on every beat. A beat:
// 1. the clock on the waiting line (plus slot, minus slot), paid. The create, flip, annihilate cycle of the
//    bind table is written as two conditional involutions, (calm, calm) with (love, fear) keeping the role
//    points in place, then (calm, calm) with (fear, love) swapping them, each taken only where the demon on
//    the cell's link along direction 0 can pay the change in mass, staying at least zero before and after.
//    Every cell writes only its own link, so the order of cells does not matter
// 2. the decisions, per side. For each direction of that side, in index order rotated by the beat, the
//    waiting slot of that side and the moving slot trade contents when one holds a charge and the other is
//    calm, first where the charge can pay to cross that direction's link (a waiting charge leaves), then
//    where it cannot (a charge that cannot pay waits). The condition reads only the links, so each swap is
//    an involution and the two passes undo in reverse order. Every swap is between two slots of one side,
//    so the color of the cell is kept exactly. The passes can also run wait first, and a control pairs each
//    waiting slot with the other side's moving slots, which must leak color
// 3. the stream. Every moving slot moves one link, its role point moved by that link's grid move, as in
//    code/rule/color-weave. Each link's flux changes by what crossed it, and its demon pays the change in
//    string energy. Where it cannot, it pays anyway and goes below zero: that is a debt, counted, never
//    hidden. The demons then move one link along their direction, as in string-graph
// Every step is a bijection and the backward beat runs them in reverse.
//
// Why a debt can happen at all is the finding this rule was built to test (E-FRC-0132). The stream moves
// every charge in a moving slot. So in a cell where a charge can pay for none of the 12 directions of its
// side, the 12 states with it just arrived in a moving slot and the states with it already waiting must all
// end waiting, and the waiting slots hold fewer states than that. A rule that runs backward cannot merge
// them, so all but as many as the waiting slots hold must cross unpaid. More waiting slots do not help: they
// add as many states before the step as after it.

import { type Mesh } from '@/code/tool/mesh'
import { type GridMoves, makeVibeWeave } from '@/code/rule/vibe-weave'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'

export const SLOTS = 26
export const WAIT_PLUS = 24
export const WAIT_MINUS = 25

// which decision pass runs first. The note's rule leaves first, then waits
export type PassOrder = 'leave-first' | 'wait-first'

// which moving slots a waiting slot trades with: those of its own side (the rule), or those of the other
// side (the control, which moves a charge between slots of opposite sign and must leak color)
export type Pairing = 'same' | 'crossed'

export type WaitingSlots = {
  readonly mesh: Mesh
  readonly side: number
  readonly mass: number
  readonly tension: number
  readonly orientation: number
  readonly order: PassOrder
  readonly pairing: Pairing
  readonly opposite: readonly number[]
  readonly lines: readonly (readonly [number, number])[]
  // +1 or -1 for each of the 26 slots: the sign of its color when calm
  readonly sign: readonly number[]
  // the 12 moving directions of each side, plus then minus, in index order
  readonly classes: readonly (readonly number[])[]
  readonly moves: GridMoves
  // the grid move on each directed link (cell, direction), a link and its reverse inverse to each other
  readonly links: Int16Array
  // neighbour[x * 24 + d]
  readonly neighbour: Int32Array
  // the undirected links, [from, to, direction] with direction the lower of its line
  readonly edges: readonly (readonly [number, number, number])[]
  // for each moving slot (cell, direction): the edge it crosses, and +1 if it crosses it forward
  readonly edgeOf: Int32Array
  readonly forwardOf: Int8Array
  // where each edge's demon moves, and back
  readonly next: Int32Array
  readonly previous: Int32Array
}

export type WaitingState = {
  readonly vibe: Int8Array
  readonly role: Int8Array
  readonly tag: Int32Array
  readonly flux: Int32Array
  readonly demon: Int32Array
}

// what one forward beat did: crossings paid, crossings that could not be paid, clock steps taken
export type BeatLog = {
  paid: number
  unpaid: number
  created: number
  annihilated: number
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeWaitingSlots(input: {
  side: number
  orientation: number
  mass: number
  tension: number
  order?: PassOrder
  pairing?: Pairing
}): WaitingSlots {
  const { side, orientation, mass, tension } = input
  const order = input.order ?? 'leave-first'
  const pairing = input.pairing ?? 'same'
  const weave = makeVibeWeave({ side })
  const mesh = d4BoxMesh({ side })
  const { opposite, lines, moves, links } = weave
  const sign = new Array<number>(SLOTS).fill(0)

  lines.forEach(([d, o], k) => {
    const plus = (orientation >> k) & 1 ? o : d

    sign[d] = d === plus ? 1 : -1
    sign[o] = o === plus ? 1 : -1
  })

  sign[WAIT_PLUS] = 1
  sign[WAIT_MINUS] = -1

  const classes = [1, -1].map(s => Array.from({ length: 24 }, (_, d) => d).filter(d => sign[d] === s))
  const neighbour = new Int32Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      neighbour[x * 24 + d] = mesh.neighbour(x, d)
    }
  }

  const edges: [number, number, number][] = []
  const edgeAt = new Int32Array(mesh.cellCount * 24).fill(-1)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      if (d < (opposite[d] ?? d)) {
        edgeAt[x * 24 + d] = edges.length
        edges.push([x, neighbour[x * 24 + d] ?? 0, d])
      }
    }
  }

  const edgeOf = new Int32Array(mesh.cellCount * 24)
  const forwardOf = new Int8Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const o = opposite[d] ?? d

      if (d < o) {
        edgeOf[x * 24 + d] = edgeAt[x * 24 + d] ?? 0
        forwardOf[x * 24 + d] = 1
      } else {
        edgeOf[x * 24 + d] = edgeAt[(neighbour[x * 24 + d] ?? 0) * 24 + o] ?? 0
        forwardOf[x * 24 + d] = -1
      }
    }
  }

  const next = new Int32Array(edges.length)
  const previous = new Int32Array(edges.length)

  edges.forEach(([, b, d], l) => {
    const onward = edgeAt[b * 24 + d] ?? l

    next[l] = onward
    previous[onward] = l
  })

  return { mesh, side, mass, tension, orientation, order, pairing, opposite, lines, sign, classes, moves, links, neighbour, edges, edgeOf, forwardOf, next, previous }
}

// the zero-sum triangles inside the plus side of an orientation, as direction triples
export function plusTriangles(orientation: number): number[][] {
  const roots = rootsD4()
  const mesh = d4BoxMesh({ side: 3 })
  const plus = new Set<number>()
  let k = 0

  for (let d = 0; d < 24; d++) {
    if (d < mesh.opposite(d)) {
      plus.add((orientation >> k) & 1 ? mesh.opposite(d) : d)
      k += 1
    }
  }

  return zeroSumTriangles({ directions: roots }).filter(t => t.every(d => plus.has(d)))
}

// the returning orientation nearest the committed one: fewest lines flipped, then the lowest mask
export function nearestReturningOrientation(): number {
  const masks = Array.from({ length: 4096 }, (_, m) => m)
  const flipped = (m: number): number => m.toString(2).split('').filter(c => c === '1').length

  masks.sort((a, b) => flipped(a) - flipped(b) || a - b)

  return masks.find(m => plusTriangles(m).length > 0) ?? -1
}

export function emptyWaitingState(rule: WaitingSlots): WaitingState {
  const slots = rule.mesh.cellCount * SLOTS

  return {
    vibe: new Int8Array(slots),
    role: new Int8Array(slots),
    tag: new Int32Array(slots),
    flux: new Int32Array(rule.edges.length),
    demon: new Int32Array(rule.edges.length),
  }
}

export function copyWaitingState(state: WaitingState): WaitingState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    tag: Int32Array.from(state.tag),
    flux: Int32Array.from(state.flux),
    demon: Int32Array.from(state.demon),
  }
}

const tensionOf = (rule: WaitingSlots, e: number): number => (mod3(e) !== 0 ? rule.tension : 0)

// the change in string energy if a charge v crosses from cell x along direction d
export function crossingCost(rule: WaitingSlots, state: WaitingState, x: number, d: number, v: number): number {
  const l = rule.edgeOf[x * 24 + d] ?? 0
  const e = state.flux[l] ?? 0

  return tensionOf(rule, e - (rule.forwardOf[x * 24 + d] ?? 1) * v) - tensionOf(rule, e)
}

export function canPay(rule: WaitingSlots, state: WaitingState, x: number, d: number, v: number): boolean {
  return (state.demon[rule.edgeOf[x * 24 + d] ?? 0] ?? 0) >= crossingCost(rule, state, x, d, v)
}

function swapSlots(state: WaitingState, i: number, j: number): void {
  const { vibe, role, tag } = state
  const v = vibe[i] ?? 0
  const r = role[i] ?? 0
  const g = tag[i] ?? 0

  vibe[i] = vibe[j] ?? 0
  role[i] = role[j] ?? 0
  tag[i] = tag[j] ?? 0
  vibe[j] = v
  role[j] = r
  tag[j] = g
}

// the paid clock on the waiting line of cell x, forward (I1 then I2) or back (I2 then I1)
function clockCell(rule: WaitingSlots, state: WaitingState, x: number, forward: boolean, log?: BeatLog): void {
  const { vibe, role, demon } = state
  const i = x * SLOTS + WAIT_PLUS
  const j = x * SLOTS + WAIT_MINUS
  const l = rule.edgeOf[x * 24] ?? 0

  // one involution: (calm, calm) with (s, -s), roles kept (s = 1) or swapped (s = -1)
  const involution = (s: number): void => {
    const a = vibe[i] ?? 0
    const b = vibe[j] ?? 0
    const calm = a === 0 && b === 0
    const pair = a === s && b === -s

    if (!calm && !pair) {
      return
    }

    const cost = (calm ? 2 : -2) * rule.mass
    const d = (demon[l] ?? 0) - cost

    // both ends must be at least zero, so a demon in debt neither pays nor is paid, and the step stays
    // its own inverse
    if (d < 0 || (demon[l] ?? 0) < 0) {
      return
    }

    demon[l] = d
    vibe[i] = calm ? s : 0
    vibe[j] = calm ? -s : 0

    if (s === -1) {
      const r = role[i] ?? 0

      role[i] = role[j] ?? 0
      role[j] = r
    }

    if (log) {
      log.created += calm ? 1 : 0
      log.annihilated += calm ? 0 : 1
    }
  }

  if (forward) {
    involution(1)
    involution(-1)
  } else {
    involution(-1)
    involution(1)
  }
}

// the decisions of cell x at beat t: one pass of conditional swaps between a waiting slot and the moving
// slots of its side. `leave` swaps where the charge can pay, otherwise where it cannot
function decisionPass(rule: WaitingSlots, state: WaitingState, x: number, t: number, leave: boolean, reverse: boolean): void {
  const { vibe } = state

  for (let c = 0; c < 2; c++) {
    const wait = x * SLOTS + (c === 0 ? WAIT_PLUS : WAIT_MINUS)
    const order = rule.classes[rule.pairing === 'same' ? c : 1 - c] ?? []
    const offset = ((t % 12) + 12) % 12

    for (let k = 0; k < 12; k++) {
      const d = order[(offset + (reverse ? 11 - k : k)) % 12] ?? 0
      const slot = x * SLOTS + d
      const a = vibe[wait] ?? 0
      const b = vibe[slot] ?? 0

      if ((a === 0) === (b === 0)) {
        continue
      }

      if (canPay(rule, state, x, d, a !== 0 ? a : b) === leave) {
        swapSlots(state, wait, slot)
      }
    }
  }
}

function collideCell(rule: WaitingSlots, state: WaitingState, x: number, t: number, forward: boolean): void {
  const first = rule.order === 'leave-first'

  if (forward) {
    decisionPass(rule, state, x, t, first, false)
    decisionPass(rule, state, x, t, !first, false)
  } else {
    decisionPass(rule, state, x, t, !first, true)
    decisionPass(rule, state, x, t, first, true)
  }
}

// the collision of the whole box: the clock in every cell, then the decisions in every cell
export function waitingCollide(rule: WaitingSlots, state: WaitingState, t: number, log?: BeatLog): void {
  for (let x = 0; x < rule.mesh.cellCount; x++) {
    clockCell(rule, state, x, true, log)
  }

  for (let x = 0; x < rule.mesh.cellCount; x++) {
    collideCell(rule, state, x, t, true)
  }
}

export function waitingCollideBack(rule: WaitingSlots, state: WaitingState, t: number): void {
  for (let x = 0; x < rule.mesh.cellCount; x++) {
    collideCell(rule, state, x, t, false)
  }

  for (let x = 0; x < rule.mesh.cellCount; x++) {
    clockCell(rule, state, x, false)
  }
}

// the change of an edge's flux when v crosses it forward and u crosses it backward
const fluxChange = (v: number, u: number): number => u - v

export function waitingStream(rule: WaitingSlots, state: WaitingState, log?: BeatLog): WaitingState {
  const { mesh, moves, links, neighbour, edges, opposite, next } = rule
  const out = copyWaitingState(state)

  edges.forEach(([a, b, d], l) => {
    const v = state.vibe[a * SLOTS + d] ?? 0
    const u = state.vibe[b * SLOTS + (opposite[d] ?? d)] ?? 0

    if (v === 0 && u === 0) {
      return
    }

    const e = state.flux[l] ?? 0
    const change = fluxChange(v, u)
    const cost = tensionOf(rule, e + change) - tensionOf(rule, e)
    const demon = (state.demon[l] ?? 0) - cost

    out.flux[l] = e + change
    out.demon[l] = demon

    if (log && cost !== 0) {
      log.paid += (state.demon[l] ?? 0) >= cost ? 1 : 0
      log.unpaid += (state.demon[l] ?? 0) >= cost ? 0 : 1
    }
  })

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const from = x * SLOTS + d
      const to = (neighbour[x * 24 + d] ?? 0) * SLOTS + d

      out.vibe[to] = state.vibe[from] ?? 0
      out.role[to] = moves.act[links[x * 24 + d] ?? moves.identity]?.[state.role[from] ?? 0] ?? 0
      out.tag[to] = state.tag[from] ?? 0
    }
  }

  const demon = Int32Array.from(out.demon)

  for (let l = 0; l < edges.length; l++) {
    out.demon[next[l] ?? l] = demon[l] ?? 0
  }

  return out
}

export function waitingStreamBack(rule: WaitingSlots, state: WaitingState): WaitingState {
  const { mesh, moves, links, neighbour, edges, opposite, previous } = rule
  const out = copyWaitingState(state)

  for (let l = 0; l < edges.length; l++) {
    out.demon[previous[l] ?? l] = state.demon[l] ?? 0
  }

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const to = x * SLOTS + d
      const from = (neighbour[x * 24 + d] ?? 0) * SLOTS + d

      out.vibe[to] = state.vibe[from] ?? 0
      out.role[to] = moves.act[moves.inverse[links[x * 24 + d] ?? moves.identity] ?? moves.identity]?.[state.role[from] ?? 0] ?? 0
      out.tag[to] = state.tag[from] ?? 0
    }
  }

  const demon = Int32Array.from(out.demon)

  edges.forEach(([a, b, d], l) => {
    const v = out.vibe[a * SLOTS + d] ?? 0
    const u = out.vibe[b * SLOTS + (opposite[d] ?? d)] ?? 0

    if (v === 0 && u === 0) {
      return
    }

    const e = state.flux[l] ?? 0
    const before = e - fluxChange(v, u)

    out.flux[l] = before
    out.demon[l] = (demon[l] ?? 0) + tensionOf(rule, e) - tensionOf(rule, before)
  })

  return out
}

export function waitingBeat(rule: WaitingSlots, state: WaitingState, t: number, log?: BeatLog): WaitingState {
  const work = copyWaitingState(state)

  waitingCollide(rule, work, t, log)

  return waitingStream(rule, work, log)
}

export function waitingBeatBack(rule: WaitingSlots, state: WaitingState, t: number): WaitingState {
  const back = waitingStreamBack(rule, state)

  waitingCollideBack(rule, back, t)

  return back
}

export function waitingEnergy(rule: WaitingSlots, state: WaitingState): number {
  let total = 0

  for (let i = 0; i < state.vibe.length; i++) {
    total += state.vibe[i] !== 0 ? rule.mass : 0
  }

  for (let l = 0; l < rule.edges.length; l++) {
    total += tensionOf(rule, state.flux[l] ?? 0) + (state.demon[l] ?? 0)
  }

  return total
}

// Gauss's law at every cell, as a change from a start: the change in a cell's vibe equals the change in
// the flux entering it minus the change in the flux leaving it. Exact Gauss when the start satisfies it
export function waitingGaussHolds(rule: WaitingSlots, start: WaitingState, now: WaitingState): boolean {
  const balance = new Int32Array(rule.mesh.cellCount)

  rule.edges.forEach(([a, b], l) => {
    const change = (now.flux[l] ?? 0) - (start.flux[l] ?? 0)

    balance[a] = (balance[a] ?? 0) + change
    balance[b] = (balance[b] ?? 0) - change
  })

  for (let x = 0; x < rule.mesh.cellCount; x++) {
    let change = 0

    for (let s = 0; s < SLOTS; s++) {
      change += (now.vibe[x * SLOTS + s] ?? 0) - (start.vibe[x * SLOTS + s] ?? 0)
    }

    if (change !== balance[x]) {
      return false
    }
  }

  return true
}

// a cell's color content: [weight, x, y], each mod 3, with w the vibe or, on a calm slot, its sign
export function waitingCellColor(rule: WaitingSlots, state: WaitingState, x: number): [number, number, number] {
  let w = 0
  let qx = 0
  let qy = 0

  for (let s = 0; s < SLOTS; s++) {
    const v = state.vibe[x * SLOTS + s] ?? 0
    const weight = v !== 0 ? v : (rule.sign[s] ?? 1)
    const p = state.role[x * SLOTS + s] ?? 0

    w += weight
    qx += weight * (p % 3)
    qy += weight * Math.floor(p / 3)
  }

  return [mod3(w), mod3(qx), mod3(qy)]
}

// how many cells the collision alone changes the color content of, at beat t
export function waitingColorLeaks(rule: WaitingSlots, state: WaitingState, t: number): number {
  const work = copyWaitingState(state)
  const before = Array.from({ length: rule.mesh.cellCount }, (_, x) => waitingCellColor(rule, work, x))

  waitingCollide(rule, work, t)

  let leaks = 0

  for (let x = 0; x < rule.mesh.cellCount; x++) {
    const after = waitingCellColor(rule, work, x)

    leaks += before[x]?.every((c, i) => c === after[i]) ? 0 : 1
  }

  return leaks
}
