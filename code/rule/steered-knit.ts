// Steering inside a knit's own schedule: a color-local knit (code/rule/color-local-weave) with the steering
// trade of E-FRC-0146 run on the same couples of lines, each beat, as a palindrome around the knit.
//
// A dock of the D4 box holds the 24 slots of the committed rule. Each undirected link, from the lower
// direction of each line, holds a flux E, changed by what crosses it as in code/rule/string-graph, and
// the link carries string when E is not a multiple of 3. A beat at dock x, beat t:
//
//   S_t, then the knit's own collision K_t, then S_t again, then every slot streams
//
// where S_t trades, on each couple of the knit's partition at beat t, each slot of one line with the
// matching slot of the other where exactly one of the two holds a charge and exactly one of the two links
// they point along carries string ('slot', E-FRC-0146's), or the two lines whole where together they hold
// exactly one charge and its slot and the matching one differ in string ('lone'). S_t reads only the flux, which no collision changes, and is its own
// inverse, so a beat reverses as stream back, then S_t, the knit's inverse, S_t. Charge negation leaves
// S_t alone (it asks only whether a slot holds a charge and whether a flux is a multiple of 3), so the
// palindrome S K S keeps whatever CPT the knit has whenever the partition at a beat and at its mirror is
// the same. There is no demon and no payment here: this rule asks whether steering can live in a schedule
// a knit could adopt. Binding runs in code/rule/reflecting-slots.
//
// Also here: the partitions a spec walks through, and the round robin folded into a 24-beat palindrome,
// a spec whose turn is the circle-method rotation of the 12 lines (line 11 fixed, the others cycled), so
// that every two lines are coupled once in 11 beats.

import { type Collision, TURN_COUPLES_ZERO } from '@/code/rule/collision'
import { colorLocalCollision, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { type Mesh } from '@/code/tool/mesh'
import { d4BoxMesh } from '@/code/substrate/d4-box'

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0

// the circle-method rotation: lines 0 to 10 cycled by one, line 11 fixed
export const ROUND_ROBIN_TURN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 11]

// the round robin's first matching: line 0 with 11, and 0 + k with 0 - k (mod 11) for k = 1 to 5
export const ROUND_ROBIN_ZERO: readonly (readonly [number, number])[] = [
  [0, 11],
  [1, 10],
  [2, 9],
  [3, 8],
  [4, 7],
  [5, 6],
]

// the walk out over 12 powers of the turn and back: a palindrome of period 24
export const FOLDED_WALK = [...Array.from({ length: 12 }, (_, k) => k), ...Array.from({ length: 12 }, (_, k) => 11 - k)]

// a spec's schedule with the round robin folded into it: its tables and swap order, the round robin's
// couples, turn and folded walk
export function foldRoundRobin(spec: ColorLocalSpec): ColorLocalSpec {
  return { ...spec, couplesZero: ROUND_ROBIN_ZERO, turn: ROUND_ROBIN_TURN, positionAt: FOLDED_WALK }
}

// the partition of the 12 lines a spec uses at beat t, each couple sorted as the knit sorts it
export function partitionAt(spec: ColorLocalSpec, t: number): (readonly [number, number])[] {
  const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
  const power = at(spec.positionAt, t)

  let current = spec.couplesZero.map(([a, b]) => norm(a, b))

  for (let k = 0; k < power; k++) {
    current = current.map(([a, b]) => norm(spec.turn[a] ?? a, spec.turn[b] ?? b))
  }

  return current
}

// how many of the 66 pairs of lines the spec couples at some beat of a period
export function couplesCovered(spec: ColorLocalSpec, period: number): number {
  const seen = new Set<number>()

  for (let t = 0; t < period; t++) {
    for (const [a, b] of partitionAt(spec, t)) {
      seen.add(a * 12 + b)
    }
  }

  return seen.size
}

export type SteeredKnit = {
  readonly mesh: Mesh
  readonly spec: ColorLocalSpec
  // no steering, E-FRC-0146's slot steering, or the whole-line steering of a lone charge
  readonly steer: KnitSteer
  readonly lines: readonly (readonly [number, number])[]
  readonly neighbour: Int32Array
  readonly opposite: readonly number[]
  readonly edges: readonly (readonly [number, number, number])[]
  // the link each slot (dock, direction) points along
  readonly edgeOf: Int32Array
  readonly forward: (t: number) => Collision
  readonly backward: (t: number) => Collision
}

export type KnitState = {
  readonly vibe: Int8Array
  readonly flux: Int32Array
}

export type KnitSteer = false | 'slot' | 'lone'

export function makeSteeredKnit(input: { side: number; spec: ColorLocalSpec; steer: KnitSteer }): SteeredKnit {
  const mesh = d4BoxMesh({ side: input.side })
  const opposite = Array.from({ length: 24 }, (_, d) => mesh.opposite(d))
  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

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

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const o = opposite[d] ?? d

      edgeOf[x * 24 + d] = d < o ? (edgeAt[x * 24 + d] ?? 0) : (edgeAt[(neighbour[x * 24 + d] ?? 0) * 24 + o] ?? 0)
    }
  }

  return {
    mesh,
    spec: input.spec,
    steer: input.steer,
    lines,
    neighbour,
    opposite,
    edges,
    edgeOf,
    forward: colorLocalCollision({ spec: input.spec, opposite }),
    backward: colorLocalCollision({ spec: input.spec, opposite, forward: false }),
  }
}

// the steering trade on one dock's 24 slots, given which of its 24 directions point along string.
// 'slot' is E-FRC-0146's: each slot pair on its own, where exactly one holds a charge. 'lone' trades the
// two lines whole, slot for slot, where together they hold exactly one charge, and the charge's slot and
// the matching slot of the other line differ in string. A line holding a pair never steers under 'lone'
export function steerDock(input: { knit: SteeredKnit; slots: Int8Array; base: number; string: (d: number) => boolean; t: number }): void {
  const { knit, slots, base, string, t } = input
  const swap = (i: number, j: number): void => {
    const v = slots[base + i] ?? 0

    slots[base + i] = slots[base + j] ?? 0
    slots[base + j] = v
  }

  for (const [p, q] of partitionAt(knit.spec, t)) {
    const a = knit.lines[p] ?? [0, 0]
    const b = knit.lines[q] ?? [0, 0]

    if (knit.steer === 'lone') {
      const charged = [a[0], a[1], b[0], b[1]].filter(d => slots[base + d] !== 0)
      const s = charged[0] === a[0] || charged[0] === b[0] ? 0 : 1

      if (charged.length === 1 && string(a[s]) !== string(b[s])) {
        swap(a[0], b[0])
        swap(a[1], b[1])
      }

      continue
    }

    for (const s of [0, 1] as const) {
      if ((slots[base + a[s]] !== 0) !== (slots[base + b[s]] !== 0) && string(a[s]) !== string(b[s])) {
        swap(a[s], b[s])
      }
    }
  }
}

// one dock's collision at beat t, forward (S K S) or back (S K^-1 S), given its string directions
export function knitDock(input: { knit: SteeredKnit; slots: Int8Array; base: number; string: (d: number) => boolean; t: number; forward: boolean }): void {
  const { knit, slots, base, string, t, forward } = input

  if (knit.steer) {
    steerDock({ knit, slots, base, string, t })
  }

  ;(forward ? knit.forward : knit.backward)(t)(slots, base, 24)

  if (knit.steer) {
    steerDock({ knit, slots, base, string, t })
  }
}

function collideAll(knit: SteeredKnit, state: KnitState, t: number, forward: boolean): void {
  for (let x = 0; x < knit.mesh.cellCount; x++) {
    const string = (d: number): boolean => mod3(state.flux[knit.edgeOf[x * 24 + d] ?? 0] ?? 0) !== 0

    knitDock({ knit, slots: state.vibe, base: x * 24, string, t, forward })
  }
}

export function knitBeat(knit: SteeredKnit, state: KnitState, t: number): KnitState {
  const vibe = Int8Array.from(state.vibe)
  const flux = Int32Array.from(state.flux)
  const work = { vibe, flux }

  collideAll(knit, work, t, true)

  knit.edges.forEach(([a, b, d], l) => {
    flux[l] = (flux[l] ?? 0) + (vibe[b * 24 + (knit.opposite[d] ?? d)] ?? 0) - (vibe[a * 24 + d] ?? 0)
  })

  const out = new Int8Array(vibe.length)

  for (let x = 0; x < knit.mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      out[(knit.neighbour[x * 24 + d] ?? 0) * 24 + d] = vibe[x * 24 + d] ?? 0
    }
  }

  return { vibe: out, flux }
}

export function knitBeatBack(knit: SteeredKnit, state: KnitState, t: number): KnitState {
  const vibe = new Int8Array(state.vibe.length)
  const flux = Int32Array.from(state.flux)

  for (let x = 0; x < knit.mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      vibe[x * 24 + d] = state.vibe[(knit.neighbour[x * 24 + d] ?? 0) * 24 + d] ?? 0
    }
  }

  knit.edges.forEach(([a, b, d], l) => {
    flux[l] = (flux[l] ?? 0) - (vibe[b * 24 + (knit.opposite[d] ?? d)] ?? 0) + (vibe[a * 24 + d] ?? 0)
  })

  const work = { vibe, flux }

  collideAll(knit, work, t, false)

  return work
}

export { TURN_COUPLES_ZERO }
