// Reflecting slots: the committed slot architecture with a paid move, where a charge that cannot pay for its
// link bounces back instead of waiting. What E-FRC-0132 found does work, once waiting slots did not.
//
// A cell of the D4 box has the 24 moving slots of the committed rule and nothing else. Each slot holds a
// vibe (fear, calm, love as -1, 0, +1), a role point (one of the 9 points of the role grid), a sign (+1 or
// -1) and a tag that the rule only carries so a measurement can follow a charge. The color of a cell is
//
//   Q = sum over its 24 slots of w * p,   w = the vibe, or on a calm slot its sign.
//
// This is the color of E-FRC-0124 with one change: the sign of a calm slot's color belongs to what the
// slot holds, and moves with it, instead of belonging to the slot. At the start every calm slot's sign is
// its side of its line under a chosen orientation, so the vacuum is E-FRC-0124's. It stays so wherever
// nothing bounces.
//
// Each undirected link, from the lower direction of each line, holds a flux E and a demon, as in
// code/rule/string-graph, with Gauss's law and the energy
//
//   H = mass * (slots holding a vibe) + tension * (links with E mod 3 not 0) + sum of demons
//
// conserved to the unit. A beat:
// 1. across every link, the two slots that point along it (one in each cell) trade contents, which is
//    what streaming does, each role point moved by the link's grid move as in code/rule/color-weave. The
//    trade changes the flux by what crosses and is taken only where the link's demon can pay the change
//    in string energy and stay at least zero. The condition is the same read from either side, so each
//    trade is its own inverse
// 2. in every cell, the two slots of every line trade contents. Where the link trade was taken, 1 and 2
//    together are exactly the committed stream. Where it was not, the contents come back into their own
//    cell on the opposite slot: a bounce
// 3. the demons move one link along their direction, as in string-graph
// Every step is a bijection, and the beat runs backward as 3 back, then 2, then 1.
//
// Why the sign has to ride with what the slot holds: a bounce moves a calm slot's contents to the other
// side of its line. With the sign fixed by the slot, its color would change sign, and a bounce would make
// color from nothing. With the sign carried, every step only moves contents, whole, and color is local by
// construction. A charge's color weight is its vibe on either side, so a bouncing charge was never the
// problem. E-FRC-0133 runs the fixed-sign reading of the same rule as the control and counts the cells
// where color is not conserved.

import { type Mesh } from '@/code/tool/mesh'
import { type GridMoves, makeVibeWeave } from '@/code/rule/vibe-weave'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { G_TURN, TURN_COUPLES_ZERO, TURN_POS_MIRROR } from '@/code/rule/collision'

export type ReflectingSlots = {
  readonly mesh: Mesh
  readonly mass: number
  readonly tension: number
  // whether a beat begins with the turning step, and the couples of lines it uses at each schedule position
  readonly turn: boolean
  readonly couples: readonly (readonly (readonly [number, number])[])[]
  readonly opposite: readonly number[]
  readonly lines: readonly (readonly [number, number])[]
  readonly moves: GridMoves
  // the grid move on each directed link (cell, direction), a link and its reverse inverse to each other
  readonly links: Int16Array
  readonly neighbour: Int32Array
  // the undirected links, [from, to, direction] with direction the lower of its line
  readonly edges: readonly (readonly [number, number, number])[]
  readonly edgeAt: Int32Array
  readonly next: Int32Array
  readonly previous: Int32Array
}

export type ReflectingState = {
  readonly vibe: Int8Array
  readonly role: Int8Array
  readonly sign: Int8Array
  readonly tag: Int32Array
  readonly flux: Int32Array
  readonly demon: Int32Array
}

export type ReflectLog = {
  crossed: number
  bounced: number
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeReflectingSlots(input: { side: number; mass: number; tension: number; turn: boolean }): ReflectingSlots {
  const { side, mass, tension, turn } = input
  const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
  const couples: [number, number][][] = []

  let current = TURN_COUPLES_ZERO.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 4; i++) {
    couples.push(current)
    current = current.map(([a, b]) => norm(G_TURN[a] ?? a, G_TURN[b] ?? b))
  }

  const weave = makeVibeWeave({ side })
  const mesh = d4BoxMesh({ side })
  const { opposite, lines, moves, links } = weave
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

  const next = new Int32Array(edges.length)
  const previous = new Int32Array(edges.length)

  edges.forEach(([, b, d], l) => {
    const onward = edgeAt[b * 24 + d] ?? l

    next[l] = onward
    previous[onward] = l
  })

  return { mesh, mass, tension, turn, couples, opposite, lines, moves, links, neighbour, edges, edgeAt, next, previous }
}

// an empty state whose calm signs are the sides of an orientation (mask bit k set: plus on line k's
// higher direction, as in E-FRC-0130)
export function emptyReflectingState(rule: ReflectingSlots, orientation: number): ReflectingState {
  const slots = rule.mesh.cellCount * 24
  const sides = new Int8Array(24)

  rule.lines.forEach(([d, o], k) => {
    const plus = (orientation >> k) & 1 ? o : d

    sides[d] = d === plus ? 1 : -1
    sides[o] = o === plus ? 1 : -1
  })

  return {
    vibe: new Int8Array(slots),
    role: new Int8Array(slots),
    sign: Int8Array.from({ length: slots }, (_, i) => sides[i % 24] ?? 1),
    tag: new Int32Array(slots),
    flux: new Int32Array(rule.edges.length),
    demon: new Int32Array(rule.edges.length),
  }
}

export function copyReflectingState(state: ReflectingState): ReflectingState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    sign: Int8Array.from(state.sign),
    tag: Int32Array.from(state.tag),
    flux: Int32Array.from(state.flux),
    demon: Int32Array.from(state.demon),
  }
}

const tensionOf = (rule: ReflectingSlots, e: number): number => (mod3(e) !== 0 ? rule.tension : 0)

function trade(state: ReflectingState, i: number, j: number): void {
  const { vibe, role, sign, tag } = state
  const v = vibe[i] ?? 0
  const r = role[i] ?? 0
  const s = sign[i] ?? 1
  const g = tag[i] ?? 0

  vibe[i] = vibe[j] ?? 0
  role[i] = role[j] ?? 0
  sign[i] = sign[j] ?? 1
  tag[i] = tag[j] ?? 0
  vibe[j] = v
  role[j] = r
  sign[j] = s
  tag[j] = g
}

// step 1, in place: an involution on every link
function linkTrades(rule: ReflectingSlots, state: ReflectingState, log?: ReflectLog): void {
  const { moves, links, opposite, edges } = rule
  const { vibe, role, flux, demon } = state

  edges.forEach(([a, b, d], l) => {
    const i = a * 24 + d
    const j = b * 24 + (opposite[d] ?? d)
    const v = vibe[i] ?? 0
    const u = vibe[j] ?? 0
    const e = flux[l] ?? 0
    const change = u - v
    const cost = tensionOf(rule, e + change) - tensionOf(rule, e)
    const now = demon[l] ?? 0

    if (now < 0 || now - cost < 0) {
      if (log && (v !== 0 || u !== 0)) {
        log.bounced += 1
      }

      return
    }

    if (log && (v !== 0 || u !== 0)) {
      log.crossed += 1
    }

    trade(state, i, j)
    role[j] = moves.act[links[i] ?? moves.identity]?.[role[j] ?? 0] ?? 0
    role[i] = moves.act[links[j] ?? moves.identity]?.[role[i] ?? 0] ?? 0
    flux[l] = e + change
    demon[l] = now - cost
  })
}

// step 2, in place: every line of every cell trades its two slots. Its own inverse
function lineTrades(rule: ReflectingSlots, state: ReflectingState): void {
  for (let x = 0; x < rule.mesh.cellCount; x++) {
    for (const [d, o] of rule.lines) {
      trade(state, x * 24 + d, x * 24 + o)
    }
  }
}

function moveDemons(rule: ReflectingSlots, state: ReflectingState, forward: boolean): void {
  const demon = Int32Array.from(state.demon)
  const to = forward ? rule.next : rule.previous

  for (let l = 0; l < rule.edges.length; l++) {
    state.demon[to[l] ?? l] = demon[l] ?? 0
  }
}

// step 0, when the rule turns, in place: on each of the six couples of lines the committed turning weave
// pairs at beat t, the two lines trade contents slot for slot where one of them holds exactly one charge
// and the other holds none. The couples are disjoint and the condition reads the same after the trade, so
// the step is its own inverse
function turnTrades(rule: ReflectingSlots, state: ReflectingState, t: number): void {
  const couples = rule.couples[TURN_POS_MIRROR[((t % 8) + 8) % 8] ?? 0] ?? []
  const { vibe } = state

  for (let x = 0; x < rule.mesh.cellCount; x++) {
    for (const [p, q] of couples) {
      const a = rule.lines[p] ?? [0, 0]
      const b = rule.lines[q] ?? [0, 0]
      const na = (vibe[x * 24 + a[0]] !== 0 ? 1 : 0) + (vibe[x * 24 + a[1]] !== 0 ? 1 : 0)
      const nb = (vibe[x * 24 + b[0]] !== 0 ? 1 : 0) + (vibe[x * 24 + b[1]] !== 0 ? 1 : 0)

      if (na + nb === 1) {
        trade(state, x * 24 + a[0], x * 24 + b[0])
        trade(state, x * 24 + a[1], x * 24 + b[1])
      }
    }
  }
}

export function reflectBeat(rule: ReflectingSlots, state: ReflectingState, t: number, log?: ReflectLog): ReflectingState {
  const out = copyReflectingState(state)

  if (rule.turn) {
    turnTrades(rule, out, t)
  }

  linkTrades(rule, out, log)
  lineTrades(rule, out)
  moveDemons(rule, out, true)

  return out
}

export function reflectBeatBack(rule: ReflectingSlots, state: ReflectingState, t: number): ReflectingState {
  const out = copyReflectingState(state)

  moveDemons(rule, out, false)
  lineTrades(rule, out)
  linkTrades(rule, out)

  if (rule.turn) {
    turnTrades(rule, out, t)
  }

  return out
}

export function reflectEnergy(rule: ReflectingSlots, state: ReflectingState): number {
  let total = 0

  for (let i = 0; i < state.vibe.length; i++) {
    total += state.vibe[i] !== 0 ? rule.mass : 0
  }

  for (let l = 0; l < rule.edges.length; l++) {
    total += tensionOf(rule, state.flux[l] ?? 0) + (state.demon[l] ?? 0)
  }

  return total
}

// Gauss's law at every cell, as a change from a start (exact Gauss when the start satisfies it)
export function reflectGaussHolds(rule: ReflectingSlots, start: ReflectingState, now: ReflectingState): boolean {
  const balance = new Int32Array(rule.mesh.cellCount)

  rule.edges.forEach(([a, b], l) => {
    const change = (now.flux[l] ?? 0) - (start.flux[l] ?? 0)

    balance[a] = (balance[a] ?? 0) + change
    balance[b] = (balance[b] ?? 0) - change
  })

  for (let x = 0; x < rule.mesh.cellCount; x++) {
    let change = 0

    for (let d = 0; d < 24; d++) {
      change += (now.vibe[x * 24 + d] ?? 0) - (start.vibe[x * 24 + d] ?? 0)
    }

    if (change !== balance[x]) {
      return false
    }
  }

  return true
}

// a cell's color content [weight, x, y] mod 3. `fixed` reads a calm slot's sign from the slot's side
// under that orientation instead of from what it holds: the reading E-FRC-0124 used
export function reflectCellColor(input: { rule: ReflectingSlots; state: ReflectingState; x: number; fixed?: Int8Array }): [number, number, number] {
  const { state, x, fixed } = input

  let w = 0
  let qx = 0
  let qy = 0

  for (let d = 0; d < 24; d++) {
    const i = x * 24 + d
    const v = state.vibe[i] ?? 0
    const weight = v !== 0 ? v : fixed ? (fixed[d] ?? 1) : (state.sign[i] ?? 1)
    const p = state.role[i] ?? 0

    w += weight
    qx += weight * (p % 3)
    qy += weight * Math.floor(p / 3)
  }

  return [mod3(w), mod3(qx), mod3(qy)]
}
