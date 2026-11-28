// A NAMED FAMILY OF REVERSIBLE LINK UPDATES ON THE CUSP NEIGHBORHOOD (a board proposal's
// string half). Every gate, the family and its count were registered before this file existed
// (gate 2be6b63a895b, 2026-11-16T04:51:47Z), and every run goes through task/pre-register.
//
// THE QUESTION. A board proposal (amended after round 03) keeps one half: links become a dynamical
// field that can carry a confining string. Its falsifier: over a named family of reversible link updates, seeded from
// E-FRC-0110 (the one reversible Sigma(648) link rule on record), the cusp neighborhood (E-GMT-0041) shows no
// confining string with a Z3 centre under gates fixed first.
//
// THE FAMILY F35, COUNT 4. Every member is E-FRC-0110's kinetic demon rule moved from the flat 4^4 box onto any graph
// with plaquettes: one Sigma(648) element per link (the ninth-root lift, generators CLOCK SHIFT FOURIER NINTH), one
// integer demon per link in [0, c]. Links are updated in non-touching classes (a greedy colouring in link order, no
// two links of a class in one plaquette); each steps to the next element in group index order that its plaquette
// energy plus its demon can pay, the demon taking the difference, so every class step permutes each level set. Then
// demons trade one unit cyclically within their level set, in pairs of links at the docks of one parity (the dock
// graph is bipartite, so every link has exactly one dock of each parity) under 4 slot matchings (k xor 1, k xor 2,
// k xor 4, opposite), 8 substeps a sweep. Reversal runs the substeps backwards with the reverse shift, then the
// classes backwards with the previous element. The members differ only in the action and the capacity:
//   m1 A6 c = 6 x lowest + 6 (E-FRC-0110 itself, levels round(6 (1 - Re Tr U / 3)))
//   m2 A6 with capacity 48
//   m3 A12 (round(12 (1 - Re Tr U / 3))) with c = 6 x its lowest level + 6
//   m4 A12 with twice that capacity
//
// WHAT IT ADDS TO THE BASE, counted: a demon register per link (log2(c + 1) bits), a link update and its class
// schedule. Links stop being elements that never change. This file adopts nothing; it informs a later board review.
//
// NOT CLAIMED: orientation joining. A link field stores flux, not matter, and moves no value between the two
// orientation classes (round 03 P3-1). Nothing here tests it.
//
// THE INSTRUMENT. The cusp neighborhood's docks and slots (code/substrate/coxeter/exact-cusp). Plaquettes are the
// duals of the honeycomb's triangles: the 4-cycles through the base dock of the exact ball of radius 2, read as slot
// patterns (the labels are the same at every dock, since the kernel of the labelling acts simply transitively on
// cells), walked at every cusp dock. A plaquette that meets the floor is dropped (a free boundary for the field). The
// layer (depth 0) is the cubic lattice of the cusp's vertex figure, mod the period; its coordinates are built by
// transporting a frame through layer plaquettes, so rectangular Wilson loops and the wrap loops around the period are
// exact paths. The Z3 centre symmetry is a wall cochain on the layer coordinate n1 carried down to every dock.
//
// GRADE. An equilibrium ensemble on the cusp feels the floor at once, so every reading is mirrored grade (
// a recorded decision), never honeycomb grade; the floor is read by running floor 1 against floor 2.
//
// Depth L2: a reproduction of finite-group lattice gauge theory (Creutz, Jacobs and Rebbi 1979; Bhanot and Rebbi
// 1981) under a reversible demon rule, on the true mesh's cusp.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import {
  finitePlaquette,
  generateGroup,
  makeFiniteGaugeLattice,
  type FiniteGroup,
} from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  exchangeFiniteDemons,
  finiteKineticSweep,
  streamFiniteDemons,
  unitDemonBeta,
} from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'
import { buildExactCusp } from '@/code/substrate/coxeter/exact-cusp'
import { buildExactBall } from '@/code/substrate/coxeter/exact-3434'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const FILLS = [0.9, 0.6, 0.35, 0.2, 0.08]
const SWEEPS = 400
const SKIP = 150
const BIN = 25
const VACUUM_SWEEPS = 50
const REVERSAL_SWEEPS = 20
const FROZEN_PLAQUETTE = 0.9
const CUSP_SLOTS = 24

// ---------------------------------------------------------------------------------------------------------------
// the group

export type ColorGroup = {
  readonly group: FiniteGroup
  readonly traceRe: Float64Array
  readonly traceIm: Float64Array
  // the central elements, and omega I (the central element whose trace is 3 omega, Im > 0)
  readonly centre: number[]
  readonly omega: number
}

export function colorGroup(): ColorGroup {
  const group = generateGroup({
    generators: [...SU3_SUBGROUPS.sigma648.generators],
  })
  const { order, product, matrices } = group
  const traceRe = new Float64Array(order)
  const traceIm = new Float64Array(order)

  for (let g = 0; g < order; g++) {
    const m = matrices[g]!

    let re = 0
    let im = 0

    for (let i = 0; i < 3; i++) {
      re += m[2 * (3 * i + i)] ?? 0
      im += m[2 * (3 * i + i) + 1] ?? 0
    }

    traceRe[g] = re
    traceIm[g] = im
  }

  const centre: number[] = []

  for (let g = 0; g < order; g++) {
    let central = true

    for (let h = 0; h < order && central; h++) {
      central = product[g * order + h] === product[h * order + g]
    }

    if (central) {
      centre.push(g)
    }
  }

  const omega =
    centre.find(g => g !== group.identity && (traceIm[g] ?? 0) > 1) ?? -1

  return { group, traceRe, traceIm, centre, omega }
}

// ---------------------------------------------------------------------------------------------------------------
// the family

export type Member = {
  readonly name: string
  readonly scale: number
  readonly capacity: number
  readonly levels: Int32Array
}

export function familyF35(color: ColorGroup): Member[] {
  const levelsAt = (scale: number): Int32Array =>
    Int32Array.from(color.group.trace, t =>
      Math.round(scale * (1 - t / 3)),
    )
  const lowest = (levels: Int32Array): number =>
    Math.min(...Array.from(levels).filter(level => level > 0))
  const a6 = levelsAt(6)
  const a12 = levelsAt(12)
  const c12 = 6 * lowest(a12) + 6

  return [
    { name: 'm1', scale: 6, capacity: 6 * lowest(a6) + 6, levels: a6 },
    { name: 'm2', scale: 6, capacity: 48, levels: a6 },
    { name: 'm3', scale: 12, capacity: c12, levels: a12 },
    { name: 'm4', scale: 12, capacity: 2 * c12, levels: a12 },
  ]
}

// ---------------------------------------------------------------------------------------------------------------
// a graph with plaquettes, and the field on it

export type Layer = {
  readonly period: number
  // layer coordinates, -1 off the layer; at[n] the layer dock at position n (n0 + P n1 + P^2 n2)
  readonly pos: Int32Array
  readonly at: Int32Array
  // the half-edge (dock * slots + slot) of the layer step from dock x in direction d (2 j forward, 2 j + 1 back)
  readonly step: Int32Array
  readonly conflicts: number
  readonly straightFailures: number
  readonly layerLinks: number
  readonly layerPlaquettes: number
  readonly layerLinkPlaquettes: { min: number; max: number }
}

export type Graph = {
  readonly name: string
  readonly docks: number
  readonly slots: number
  readonly table: Int32Array
  readonly opposite: readonly number[]
  readonly matchings: readonly (readonly number[])[]
  // 4 half-edges per plaquette, in walking order
  readonly plaquettes: Int32Array
  readonly depth?: Uint8Array
  readonly floor?: number
  readonly layer?: Layer
  readonly gates: Record<string, number>
}

export type Field = {
  readonly graph: Graph
  readonly links: number
  // per half-edge: its link, and 1 when the half-edge walks the link from tail to head
  readonly linkOf: Int32Array
  readonly forward: Uint8Array
  readonly tail: Int32Array
  readonly head: Int32Array
  // per link, its staples: 3 (link, sign) per plaquette through it, ordered so that U_link times the staple is the
  // plaquette read from the link's tail
  readonly stapleStart: Int32Array
  readonly stapleLink: Int32Array
  readonly stapleSign: Int8Array
  readonly plaquetteLinks: Int32Array
  readonly plaquetteSigns: Int8Array
  readonly plaquettesPerLink: Int32Array
  readonly classes: Int32Array[]
  readonly classConflicts: number
  // the trade pairs of each of the 8 substeps, flat (a, b)
  readonly pairs: Int32Array[]
  readonly bipartiteConflicts: number
  readonly parity: Uint8Array
}

export function makeField(graph: Graph): Field {
  const { docks, slots, table, opposite, plaquettes } = graph
  const linkOf = new Int32Array(docks * slots).fill(-1)
  const forward = new Uint8Array(docks * slots)
  const tails: number[] = []
  const heads: number[] = []

  for (let x = 0; x < docks; x++) {
    for (let k = 0; k < slots; k++) {
      const h = x * slots + k
      const y = table[h]!

      if (y < 0 || linkOf[h] !== -1) {
        continue
      }

      const back = y * slots + opposite[k]!

      if (table[back] !== x || back === h) {
        throw new Error(`makeField: half-edge ${h} does not face back`)
      }

      const id = tails.length

      tails.push(x)
      heads.push(y)
      linkOf[h] = id
      linkOf[back] = id
      forward[h] = 1
      forward[back] = 0
    }
  }

  const links = tails.length
  const count = plaquettes.length / 4
  const plaquetteLinks = new Int32Array(plaquettes.length)
  const plaquetteSigns = new Int8Array(plaquettes.length)
  const plaquettesPerLink = new Int32Array(links)

  for (let i = 0; i < plaquettes.length; i++) {
    const h = plaquettes[i]!

    plaquetteLinks[i] = linkOf[h]!
    plaquetteSigns[i] = forward[h] === 1 ? 1 : -1
    plaquettesPerLink[linkOf[h]!]! += 1
  }

  const stapleStart = new Int32Array(links + 1)

  for (let l = 0; l < links; l++) {
    stapleStart[l + 1] = stapleStart[l]! + 3 * plaquettesPerLink[l]!
  }

  const stapleLink = new Int32Array(stapleStart[links]!)
  const stapleSign = new Int8Array(stapleStart[links]!)
  const fill = Int32Array.from(stapleStart.subarray(0, links))

  for (let p = 0; p < count; p++) {
    for (let i = 0; i < 4; i++) {
      const l = plaquetteLinks[4 * p + i]!
      const s = plaquetteSigns[4 * p + i]!

      for (let k = 1; k <= 3; k++) {
        // forward: the next three as walked; backward: the previous three, each reversed
        const j = s > 0 ? (i + k) % 4 : (i - k + 4) % 4

        stapleLink[fill[l]!] = plaquetteLinks[4 * p + j]!
        stapleSign[fill[l]!] = (s > 0 ? 1 : -1) * plaquetteSigns[4 * p + j]!
        fill[l]! += 1
      }
    }
  }

  // greedy colouring of the links: no two links of a class share a plaquette
  const linkPlaquettes: number[][] = Array.from({ length: links }, () => [])

  for (let p = 0; p < count; p++) {
    for (let i = 0; i < 4; i++) {
      linkPlaquettes[plaquetteLinks[4 * p + i]!]!.push(p)
    }
  }

  const colour = new Int32Array(links).fill(-1)
  const seen = new Int32Array(256).fill(-1)

  for (let l = 0; l < links; l++) {
    for (const p of linkPlaquettes[l]!) {
      for (let i = 0; i < 4; i++) {
        const m = plaquetteLinks[4 * p + i]!

        if (m !== l && colour[m]! >= 0) {
          seen[colour[m]!] = l
        }
      }
    }

    let c = 0

    while (seen[c] === l) {
      c++
    }

    colour[l] = c
  }

  const classCount = Math.max(0, ...Array.from(colour)) + 1
  const classes = Array.from({ length: classCount }, (_, c) =>
    Int32Array.from(
      Array.from({ length: links }, (__, l) => l).filter(
        l => colour[l] === c,
      ),
    ),
  )

  let classConflicts = 0

  for (let p = 0; p < count; p++) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const a = plaquetteLinks[4 * p + i]!
        const b = plaquetteLinks[4 * p + j]!

        if (a !== b && colour[a] === colour[b]) {
          classConflicts++
        }
      }
    }
  }

  // the dock parity by breadth-first search, and its conflicts
  const parity = new Uint8Array(docks)
  const reached = new Uint8Array(docks)

  let bipartiteConflicts = 0

  for (let start = 0; start < docks; start++) {
    if (reached[start]) {
      continue
    }

    reached[start] = 1

    const queue = [start]

    for (let head = 0; head < queue.length; head++) {
      const x = queue[head]!

      for (let k = 0; k < slots; k++) {
        const y = table[x * slots + k]!

        if (y < 0) {
          continue
        }

        if (!reached[y]) {
          reached[y] = 1
          parity[y] = parity[x]! ^ 1
          queue.push(y)
        } else if (parity[y] === parity[x]) {
          bipartiteConflicts++
        }
      }
    }
  }

  const pairs: Int32Array[] = []

  for (const matching of graph.matchings) {
    for (let side = 0; side < 2; side++) {
      const out: number[] = []

      for (let x = 0; x < docks; x++) {
        if (parity[x] !== side) {
          continue
        }

        for (let k = 0; k < slots; k++) {
          const q = matching[k]!

          if (q <= k) {
            continue
          }

          const a = linkOf[x * slots + k]!
          const b = linkOf[x * slots + q]!

          if (a >= 0 && b >= 0 && a !== b) {
            out.push(a, b)
          }
        }
      }

      pairs.push(Int32Array.from(out))
    }
  }

  return {
    graph,
    links,
    linkOf,
    forward,
    tail: Int32Array.from(tails),
    head: Int32Array.from(heads),
    stapleStart,
    stapleLink,
    stapleSign,
    plaquetteLinks,
    plaquetteSigns,
    plaquettesPerLink,
    classes,
    classConflicts,
    pairs,
    bipartiteConflicts,
    parity,
  }
}

export type State = {
  readonly values: Int32Array
  readonly demons: Int32Array
}

function value(
  group: FiniteGroup,
  values: Int32Array,
  link: number,
  sign: number,
): number {
  const u = values[link]!

  return sign > 0 ? u : group.inverse[u]!
}

// one kinetic pass over the classes: returns the number of links that moved
export function kineticPass(input: {
  field: Field
  group: FiniteGroup
  member: Member
  state: State
  reverse?: boolean
}): number {
  const { field, group, member, state } = input
  const { order, product } = group
  const { levels, capacity } = member
  const { values, demons } = state
  const reverse = input.reverse === true
  const staple = new Int32Array(64)
  const classOrder = field.classes.map((_, c) => c)

  if (reverse) {
    classOrder.reverse()
  }

  let moves = 0

  for (const c of classOrder) {
    const members = field.classes[c]!
    const updates: number[] = []

    for (const l of members) {
      const start = field.stapleStart[l]!
      const n = (field.stapleStart[l + 1]! - start) / 3

      for (let p = 0; p < n; p++) {
        const o = start + 3 * p
        const a = value(group, values, field.stapleLink[o]!, field.stapleSign[o]!)
        const b = value(group, values, field.stapleLink[o + 1]!, field.stapleSign[o + 1]!)
        const d = value(group, values, field.stapleLink[o + 2]!, field.stapleSign[o + 2]!)

        staple[p] = product[product[a * order + b]! * order + d]!
      }

      const local = (g: number): number => {
        let sum = 0

        for (let p = 0; p < n; p++) {
          sum += levels[product[g * order + staple[p]!]!]!
        }

        return sum
      }

      const current = values[l]!
      const total = local(current) + demons[l]!

      for (let shift = 1; shift < order; shift++) {
        const candidate = reverse
          ? (current - shift + order) % order
          : (current + shift) % order
        const demon = total - local(candidate)

        if (demon >= 0 && demon <= capacity) {
          updates.push(l, candidate, demon)
          break
        }
      }
    }

    for (let i = 0; i < updates.length; i += 3) {
      values[updates[i]!] = updates[i + 1]!
      demons[updates[i]!] = updates[i + 2]!
      moves += 1
    }
  }

  return moves
}

// the 8 demon trade substeps (or their inverse)
export function tradePass(input: {
  field: Field
  capacity: number
  demons: Int32Array
  reverse?: boolean
}): void {
  const { field, capacity, demons } = input
  const reverse = input.reverse === true
  const order = field.pairs.map((_, s) => s)

  if (reverse) {
    order.reverse()
  }

  for (const s of order) {
    const pairs = field.pairs[s]!

    for (let i = 0; i < pairs.length; i += 2) {
      const a = pairs[i]!
      const b = pairs[i + 1]!
      const sum = demons[a]! + demons[b]!
      const low = Math.max(0, sum - capacity)
      const high = Math.min(capacity, sum)
      const span = high - low + 1
      const shift = reverse ? span - 1 : 1
      const next = low + ((demons[a]! - low + shift) % span)

      demons[a] = next
      demons[b] = sum - next
    }
  }
}

export function sweep(input: {
  field: Field
  group: FiniteGroup
  member: Member
  state: State
  reverse?: boolean
}): number {
  const { field, member, state } = input

  if (input.reverse === true) {
    tradePass({ field, capacity: member.capacity, demons: state.demons, reverse: true })

    return kineticPass({ ...input, reverse: true })
  }

  const moves = kineticPass(input)

  tradePass({ field, capacity: member.capacity, demons: state.demons })

  return moves
}

export function plaquetteElement(
  field: Field,
  group: FiniteGroup,
  values: Int32Array,
  p: number,
): number {
  const { order, product } = group

  let g = group.identity

  for (let i = 0; i < 4; i++) {
    g = product[
      g * order +
        value(group, values, field.plaquetteLinks[4 * p + i]!, field.plaquetteSigns[4 * p + i]!)
    ]!
  }

  return g
}

export function totalEnergy(input: {
  field: Field
  group: FiniteGroup
  member: Member
  state: State
}): number {
  const { field, group, member, state } = input
  const count = field.plaquetteLinks.length / 4

  let energy = 0

  for (let p = 0; p < count; p++) {
    energy += member.levels[plaquetteElement(field, group, state.values, p)]!
  }

  for (const d of state.demons) {
    energy += d
  }

  return energy
}

export function coldState(field: Field, group: FiniteGroup, member: Member, fill: number): State {
  const values = new Int32Array(field.links).fill(group.identity)
  const demons = new Int32Array(field.links)

  for (let i = 0; i < demons.length; i++) {
    demons[i] = (i * GOLDEN) % 1 < fill ? member.capacity : 0
  }

  return { values, demons }
}

// ---------------------------------------------------------------------------------------------------------------
// the instruments

// the 4-cycles through the base dock of the exact ball of radius 2, as slot patterns
export function plaquettePatterns(): { patterns: number[][]; firstCounts: number[] } {
  const ball = buildExactBall({ radius: 2 })
  const nb = (x: number, k: number): number => ball.table[x * CUSP_SLOTS + k] ?? -1
  const patterns: number[][] = []

  for (let a = 0; a < CUSP_SLOTS; a++) {
    const y = nb(0, a)

    if (y < 0) {
      continue
    }

    for (let b = 0; b < CUSP_SLOTS; b++) {
      const z = nb(y, b)

      if (z < 0 || z === 0 || z === y) {
        continue
      }

      for (let c = 0; c < CUSP_SLOTS; c++) {
        const w = nb(z, c)

        if (w < 0 || w === 0 || w === y || w === z) {
          continue
        }

        for (let d = 0; d < CUSP_SLOTS; d++) {
          if (nb(w, d) === 0) {
            patterns.push([a, b, c, d])
          }
        }
      }
    }
  }

  const firstCounts = new Array<number>(CUSP_SLOTS).fill(0)

  for (const p of patterns) {
    firstCounts[p[0]!]! += 1
  }

  return { patterns, firstCounts }
}

const CUSP_MATCHINGS: number[][] = [
  Array.from({ length: CUSP_SLOTS }, (_, k) => k ^ 1),
  Array.from({ length: CUSP_SLOTS }, (_, k) => k ^ 2),
  Array.from({ length: CUSP_SLOTS }, (_, k) => k ^ 4),
  Array.from({ length: CUSP_SLOTS }, (_, k) => OPPOSITE[k]!),
]

export function cuspGraph(input: { period: number; floor: number }): Graph {
  const { period, floor } = input
  const cusp = buildExactCusp({ period, floor })
  const { table, depth, cells: docks } = cusp
  const slots = CUSP_SLOTS
  const { patterns, firstCounts } = plaquettePatterns()

  let walkFailures = 0

  const seen = new Set<string>()
  const out: number[] = []

  for (let x = 0; x < docks; x++) {
    for (const pattern of patterns) {
      let at = x

      const halves: number[] = []

      for (const k of pattern) {
        const next = at < 0 ? -1 : table[at * slots + k]!

        halves.push(at * slots + k)
        at = next

        if (at < 0) {
          break
        }
      }

      if (at < 0) {
        continue
      }

      if (at !== x) {
        walkFailures++
        continue
      }

      // the key: the 4 docks and 4 slots as a set of unordered edges
      const edges = halves
        .map(h => {
          const k = h % slots
          const b = table[h]!
          const back = b * slots + OPPOSITE[k]!

          return Math.min(h, back)
        })
        .sort((a, b) => a - b)
      const key = edges.join(',')

      if (!seen.has(key)) {
        seen.add(key)
        out.push(...halves)
      }
    }
  }

  const plaquettes = Int32Array.from(out)
  const graph: Graph = {
    name: `cusp-${period}-floor-${floor}`,
    docks,
    slots,
    table,
    opposite: OPPOSITE,
    matchings: CUSP_MATCHINGS,
    plaquettes,
    depth,
    floor,
    gates: {
      patterns: patterns.length,
      firstCountMin: Math.min(...firstCounts),
      firstCountMax: Math.max(...firstCounts),
      walkFailures,
    },
  }

  return { ...graph, layer: buildLayer(graph, period) }
}

function buildLayer(graph: Graph, period: number): Layer {
  const { docks, slots, table, plaquettes } = graph
  const depth = graph.depth!
  const onLayer = (x: number): boolean => x >= 0 && depth[x] === 0

  // layer plaquettes as dock cycles, and each layer dock's
  const cycles: number[][] = []
  const byDock = new Map<number, number[][]>()

  for (let p = 0; p < plaquettes.length / 4; p++) {
    const ds = [0, 1, 2, 3].map(i => Math.floor(plaquettes[4 * p + i]! / slots))

    if (ds.every(onLayer)) {
      cycles.push(ds)

      for (const d of ds) {
        const list = byDock.get(d) ?? []

        list.push(ds)
        byDock.set(d, list)
      }
    }
  }

  const rotated = (cycle: number[], x: number): number[] => {
    const i = cycle.indexOf(x)

    return [0, 1, 2, 3].map(k => cycle[(i + k) % 4]!)
  }

  // w with a layer plaquette x, y, w, u in cyclic order
  const fourth = (x: number, y: number, u: number): number => {
    for (const cycle of byDock.get(x) ?? []) {
      const [, a, b, c] = rotated(cycle, x)

      if ((a === y && c === u) || (a === u && c === y)) {
        return b!
      }
    }

    return -1
  }

  const layerNeighbours = (x: number): number[] => {
    const out: number[] = []

    for (let k = 0; k < slots; k++) {
      const y = table[x * slots + k]!

      if (onLayer(y) && !out.includes(y)) {
        out.push(y)
      }
    }

    return out
  }

  let straightFailures = 0

  const straight = (x: number, y: number): number => {
    const found = layerNeighbours(y).filter(
      z =>
        z !== x &&
        !(byDock.get(y) ?? []).some(cycle => {
          const [, a, , c] = rotated(cycle, y)

          return (a === x && c === z) || (a === z && c === x)
        }),
    )

    if (found.length !== 1) {
      straightFailures++

      return -1
    }

    return found[0]!
  }

  const pos = new Int32Array(docks * 3).fill(-1)
  const fwd = new Int32Array(docks * 3).fill(-1)
  const bwd = new Int32Array(docks * 3).fill(-1)
  const base = 0
  const first = layerNeighbours(base)
  const axes: number[] = []

  for (const y of first) {
    if (axes.length < 3 && axes.every(a => a !== y && straight(a, base) !== y)) {
      axes.push(y)
    }
  }

  let conflicts = 0

  for (let j = 0; j < 3; j++) {
    pos[base * 3 + j] = 0
    fwd[base * 3 + j] = axes[j] ?? -1
    bwd[base * 3 + j] = axes[j] === undefined ? -1 : straight(axes[j]!, base)
  }

  const queue = [base]
  const wrap = (n: number): number => ((n % period) + period) % period

  for (let head = 0; head < queue.length; head++) {
    const x = queue[head]!

    for (let j = 0; j < 3; j++) {
      for (const dir of [1, -1]) {
        const y = dir > 0 ? fwd[x * 3 + j]! : bwd[x * 3 + j]!

        if (y < 0) {
          conflicts++
          continue
        }

        const p = [0, 1, 2].map(i => wrap(pos[x * 3 + i]! + (i === j ? dir : 0)))
        const f = [0, 1, 2].map(i =>
          i === j
            ? dir > 0
              ? straight(x, y)
              : x
            : fourth(x, y, fwd[x * 3 + i]!),
        )
        const b = [0, 1, 2].map(i =>
          i === j
            ? dir > 0
              ? x
              : straight(x, y)
            : fourth(x, y, bwd[x * 3 + i]!),
        )

        if (pos[y * 3] === -1) {
          for (let i = 0; i < 3; i++) {
            pos[y * 3 + i] = p[i]!
            fwd[y * 3 + i] = f[i]!
            bwd[y * 3 + i] = b[i]!
          }

          queue.push(y)
        } else {
          for (let i = 0; i < 3; i++) {
            if (
              pos[y * 3 + i] !== p[i] ||
              fwd[y * 3 + i] !== f[i] ||
              bwd[y * 3 + i] !== b[i]
            ) {
              conflicts++
            }
          }
        }
      }
    }
  }

  const volume = period ** 3
  const at = new Int32Array(volume).fill(-1)

  for (const x of queue) {
    const n = pos[x * 3]! + period * pos[x * 3 + 1]! + period * period * pos[x * 3 + 2]!

    if (at[n] !== -1) {
      conflicts++
    }

    at[n] = x
  }

  if (queue.length !== volume || at.some(x => x < 0)) {
    conflicts++
  }

  const step = new Int32Array(docks * 6).fill(-1)

  for (const x of queue) {
    for (let j = 0; j < 3; j++) {
      for (const [d, y] of [
        [2 * j, fwd[x * 3 + j]!],
        [2 * j + 1, bwd[x * 3 + j]!],
      ] as const) {
        const ks: number[] = []

        for (let k = 0; k < slots; k++) {
          if (table[x * slots + k] === y) {
            ks.push(k)
          }
        }

        if (ks.length !== 1) {
          conflicts++
        }

        step[x * 6 + d] = ks.length > 0 ? x * slots + ks[0]! : -1
      }
    }
  }

  // layer links and their layer plaquette counts
  const layerLinkCount = new Map<string, number>()

  for (const cycle of cycles) {
    for (let i = 0; i < 4; i++) {
      const a = cycle[i]!
      const b = cycle[(i + 1) % 4]!
      const key = `${Math.min(a, b)},${Math.max(a, b)}`

      layerLinkCount.set(key, (layerLinkCount.get(key) ?? 0) + 1)
    }
  }

  let layerLinks = 0

  for (const x of queue) {
    for (const y of layerNeighbours(x)) {
      if (x < y) {
        layerLinks++

        if (!layerLinkCount.has(`${x},${y}`)) {
          layerLinkCount.set(`${x},${y}`, 0)
        }
      }
    }
  }

  const counts = Array.from(layerLinkCount.values())

  return {
    period,
    pos: Int32Array.from({ length: docks }, (_, x) =>
      pos[x * 3] === -1 ? -1 : pos[x * 3]! + period * pos[x * 3 + 1]! + period * period * pos[x * 3 + 2]!,
    ),
    at,
    step,
    conflicts,
    straightFailures,
    layerLinks,
    layerPlaquettes: cycles.length,
    layerLinkPlaquettes: { min: Math.min(...counts), max: Math.max(...counts) },
  }
}

// the flat box of side 4 in 4 dimensions: slot 2 mu steps +mu, 2 mu + 1 steps -mu
export function boxGraph(side: number): Graph {
  const dim = 4
  const docks = side ** dim
  const slots = 2 * dim
  const table = new Int32Array(docks * slots)
  const coordinate = (x: number, mu: number): number => Math.floor(x / side ** mu) % side
  const shift = (x: number, mu: number, by: number): number =>
    x + (((coordinate(x, mu) + by + side) % side) - coordinate(x, mu)) * side ** mu

  for (let x = 0; x < docks; x++) {
    for (let mu = 0; mu < dim; mu++) {
      table[x * slots + 2 * mu] = shift(x, mu, 1)
      table[x * slots + 2 * mu + 1] = shift(x, mu, -1)
    }
  }

  const out: number[] = []

  for (let x = 0; x < docks; x++) {
    for (let mu = 0; mu < dim; mu++) {
      for (let nu = mu + 1; nu < dim; nu++) {
        const xm = shift(x, mu, 1)
        const xmn = shift(xm, nu, 1)
        const xn = shift(x, nu, 1)

        out.push(
          x * slots + 2 * mu,
          xm * slots + 2 * nu,
          xmn * slots + 2 * mu + 1,
          xn * slots + 2 * nu + 1,
        )
      }
    }
  }

  const opposite = Array.from({ length: slots }, (_, k) => k ^ 1)

  return {
    name: `box-${side}`,
    docks,
    slots,
    table,
    opposite,
    matchings: [
      opposite,
      Array.from({ length: slots }, (_, k) => k ^ 2),
      Array.from({ length: slots }, (_, k) => k ^ 4),
      opposite,
    ],
    plaquettes: Int32Array.from(out),
    gates: {},
  }
}

// ---------------------------------------------------------------------------------------------------------------
// readings

type Complex = { re: number; im: number }

function loopElement(input: {
  field: Field
  group: FiniteGroup
  values: Int32Array
  start: number
  directions: number[]
}): number {
  const { field, group, values, directions } = input
  const layer = field.graph.layer!
  const { order, product } = group

  let x = input.start
  let g = group.identity

  for (const d of directions) {
    const h = layer.step[x * 6 + d]!
    const l = field.linkOf[h]!

    g = product[g * order + value(group, values, l, field.forward[h] === 1 ? 1 : -1)]!
    x = field.graph.table[h]!
  }

  return x === input.start ? g : -1
}

function rectangle(i: number, j: number, r: number, t: number): number[] {
  return [
    ...new Array<number>(r).fill(2 * i),
    ...new Array<number>(t).fill(2 * j),
    ...new Array<number>(r).fill(2 * i + 1),
    ...new Array<number>(t).fill(2 * j + 1),
  ]
}

export const LOOP_SIZES: readonly (readonly [number, number])[] = [
  [1, 1],
  [1, 2],
  [2, 2],
  [2, 3],
  [3, 3],
]

type SweepReading = {
  plaquette: number
  layerPlaquette: number
  loops: number[]
  imW11: number
  polyakov: Complex
  sectors: [number, number, number]
  lines: number
  demonMean: number
  loopFailures: number
}

function readSweep(input: {
  field: Field
  color: ColorGroup
  state: State
}): SweepReading {
  const { field, color, state } = input
  const { group, traceRe, traceIm } = color
  const graph = field.graph
  const count = field.plaquetteLinks.length / 4

  let plaquette = 0
  let layerSum = 0
  let layerCount = 0

  for (let p = 0; p < count; p++) {
    const re = traceRe[plaquetteElement(field, group, state.values, p)]! / 3

    plaquette += re

    if (graph.depth !== undefined) {
      const onLayer = [0, 1, 2, 3].every(
        i => graph.depth![Math.floor(graph.plaquettes[4 * p + i]! / graph.slots)] === 0,
      )

      if (onLayer) {
        layerSum += re
        layerCount++
      }
    }
  }

  const demonMean = state.demons.reduce((a, b) => a + b, 0) / state.demons.length
  const loops: number[] = []
  const sectors: [number, number, number] = [0, 0, 0]

  let imW11 = 0
  let loopFailures = 0
  let polyRe = 0
  let polyIm = 0
  let lines = 0

  const layer = graph.layer

  if (layer !== undefined) {
    const half = layer.period / 2

    for (const [r, t] of LOOP_SIZES) {
      if (r > half || t > half) {
        loops.push(Number.NaN)
        continue
      }

      let sum = 0
      let n = 0

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === j || (r === t && j < i)) {
            continue
          }

          const directions = rectangle(i, j, r, t)

          for (const start of layer.at) {
            const g = loopElement({ field, group, values: state.values, start, directions })

            if (g < 0) {
              loopFailures++
              continue
            }

            sum += traceRe[g]! / 3
            n++

            if (r === 1 && t === 1) {
              imW11 += traceIm[g]! / 3
            }
          }
        }
      }

      if (r === 1 && t === 1) {
        imW11 /= n
      }

      loops.push(sum / n)
    }

    for (let i = 0; i < 3; i++) {
      const directions = new Array<number>(layer.period).fill(2 * i)

      for (const start of layer.at) {
        const g = loopElement({ field, group, values: state.values, start, directions })

        if (g < 0) {
          loopFailures++
          continue
        }

        const re = traceRe[g]! / 3
        const im = traceIm[g]! / 3
        const angle = Math.atan2(im, re)
        const sector = ((Math.round(angle / ((2 * Math.PI) / 3)) % 3) + 3) % 3

        polyRe += re
        polyIm += im
        sectors[sector as 0 | 1 | 2] += 1
        lines++
      }
    }
  }

  return {
    plaquette: plaquette / count,
    layerPlaquette: layerCount > 0 ? layerSum / layerCount : Number.NaN,
    loops,
    imW11,
    polyakov: { re: lines > 0 ? polyRe / lines : Number.NaN, im: lines > 0 ? polyIm / lines : Number.NaN },
    sectors,
    lines,
    demonMean,
    loopFailures,
  }
}

export type RunReading = {
  instrument: string
  member: string
  fill: number
  links: number
  plaquettes: number
  classes: number
  freeLinks: number
  energyPerLink: number
  energyDrift: number
  plaquette: number
  layerPlaquette: number
  // the layer plaquette mean over the first and the second half of the measured sweeps (E-FRC-0318's S0)
  layerHalves: [number, number]
  beta: number
  loops: { value: number; error: number }[]
  chi22: { value: number; error: number }
  imW11: number
  polyakovAbs: number
  sectors: [number, number, number]
  loopFailures: number
  movesLastSweep: number
  melted: boolean
  seconds: number
}

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

export function runPoint(input: {
  field: Field
  color: ColorGroup
  member: Member
  fill: number
  log?: (line: string) => void
}): RunReading & { state: State } {
  const { field, color, member, fill } = input
  const started = Date.now()
  const state = coldState(field, color.group, member, fill)
  const e0 = totalEnergy({ field, group: color.group, member, state })
  const readings: SweepReading[] = []

  let movesLastSweep = 0

  for (let s = 0; s < SWEEPS; s++) {
    movesLastSweep = sweep({ field, group: color.group, member, state })

    if (s >= SKIP) {
      readings.push(readSweep({ field, color, state }))
    }
  }

  const drift = Math.abs(totalEnergy({ field, group: color.group, member, state }) - e0)
  const loops = LOOP_SIZES.map((_, k) =>
    jackknife({
      samples: readings,
      estimator: rs => mean(rs.map(r => r.loops[k] ?? Number.NaN)),
      binSize: BIN,
    }),
  )
  const chi22 = jackknife({
    samples: readings,
    estimator: rs => {
      const w11 = mean(rs.map(r => r.loops[0]!))
      const w12 = mean(rs.map(r => r.loops[1]!))
      const w22 = mean(rs.map(r => r.loops[2]!))

      return w22 > 0 && w11 > 0 ? -Math.log((w22 * w11) / (w12 * w12)) : Number.NaN
    },
    binSize: BIN,
  })
  const lines = readings.reduce((a, r) => a + r.lines, 0)
  const polyRe = readings.reduce((a, r) => a + r.polyakov.re * r.lines, 0) / lines
  const polyIm = readings.reduce((a, r) => a + r.polyakov.im * r.lines, 0) / lines
  const sectors = [0, 1, 2].map(
    k => readings.reduce((a, r) => a + r.sectors[k]!, 0) / lines,
  ) as [number, number, number]
  const layerPlaquette = mean(readings.map(r => r.layerPlaquette))
  const half = Math.floor(readings.length / 2)
  const layerHalves: [number, number] = [
    mean(readings.slice(0, half).map(r => r.layerPlaquette)),
    mean(readings.slice(half).map(r => r.layerPlaquette)),
  ]
  const reading: RunReading = {
    instrument: field.graph.name,
    member: member.name,
    fill,
    links: field.links,
    plaquettes: field.plaquetteLinks.length / 4,
    classes: field.classes.length,
    freeLinks: Array.from(field.plaquettesPerLink).filter(n => n === 0).length,
    energyPerLink: e0 / field.links,
    energyDrift: drift,
    plaquette: mean(readings.map(r => r.plaquette)),
    layerPlaquette,
    layerHalves,
    beta: unitDemonBeta({ meanDemon: mean(readings.map(r => r.demonMean)), capacity: member.capacity }),
    loops,
    chi22,
    imW11: mean(readings.map(r => r.imW11)),
    polyakovAbs: Math.hypot(polyRe, polyIm),
    sectors,
    loopFailures: readings.reduce((a, r) => a + r.loopFailures, 0),
    movesLastSweep,
    melted: layerPlaquette < FROZEN_PLAQUETTE,
    seconds: (Date.now() - started) / 1000,
  }

  input.log?.(
    `${reading.instrument} ${member.name} f ${fill}: E/link ${reading.energyPerLink.toFixed(3)} drift ${drift} plaq ${reading.plaquette.toFixed(4)} layer ${layerPlaquette.toFixed(4)} beta ${reading.beta.toFixed(3)} W ${loops.map(w => w.value.toExponential(3)).join(' ')} chi22 ${chi22.value.toFixed(4)} +- ${chi22.error.toFixed(4)} |P| ${reading.polyakovAbs.toFixed(4)} sectors ${sectors.map(s => s.toFixed(3)).join(' ')} ImW11 ${reading.imW11.toExponential(2)} ${reading.seconds.toFixed(0)} s`,
  )

  return { ...reading, state }
}

// ---------------------------------------------------------------------------------------------------------------
// the gates on a reading

export type PointGates = { s2: boolean; s3: boolean; s4: boolean; string: boolean }

export function pointGates(r: RunReading): PointGates {
  const s2 =
    Number.isFinite(r.chi22.value) &&
    Number.isFinite(r.chi22.error) &&
    (r.loops[2]?.value ?? 0) > 0 &&
    r.chi22.value >= 0.1 &&
    r.chi22.value >= 5 * r.chi22.error
  const s3 = r.polyakovAbs <= 0.1 && r.sectors.every(w => w >= 0.25 && w <= 0.42)
  const s4 = Math.abs(r.imW11) <= 0.01

  return { s2, s3, s4, string: s2 && s3 && s4 }
}

// ---------------------------------------------------------------------------------------------------------------
// the parts

export type SmallPart = {
  part: 'small'
  group: { order: number; centre: number; omegaFound: number }
  members: { name: string; scale: number; capacity: number; lowest: number; registerBits: number }[]
  instrument: Record<string, number>
  vacuum: { member: string; moves: number; plaquetteMoves: number; freeMoves: number; chi22: number; loopsAllOne: number }[]
  reversal: { member: string; moved: number; returns: number }[]
  centre: { closedFailures: number; wrapSums: number[]; energyEqual: number; axis1Max: number; otherMax: number; melted: number }
  runs: RunReading[]
  box: { fill: number; engine: number; seed: number; drift: number }[]
}

export type GridPart = { part: 'grid' | 'floor'; instrument: Record<string, number>; runs: RunReading[] }

export function instrumentGates(graph: Graph, field: Field): Record<string, number> {
  const layer = graph.layer!
  const depth = graph.depth!
  const floor = graph.floor ?? 0

  let interiorLinks = 0
  let interiorOff = 0

  for (let l = 0; l < field.links; l++) {
    if (depth[field.tail[l]!]! < floor && depth[field.head[l]!]! < floor) {
      interiorLinks++

      if (field.plaquettesPerLink[l] !== 8) {
        interiorOff++
      }
    }
  }

  return {
    ...graph.gates,
    docks: graph.docks,
    links: field.links,
    plaquettes: field.plaquetteLinks.length / 4,
    interiorLinks,
    interiorOff,
    freeLinks: Array.from(field.plaquettesPerLink).filter(n => n === 0).length,
    layerPlaquettes: layer.layerPlaquettes,
    layerPlaquettesExpected: 3 * layer.period ** 3,
    layerLinks: layer.layerLinks,
    layerLinkPlaquettesMin: layer.layerLinkPlaquettes.min,
    layerLinkPlaquettesMax: layer.layerLinkPlaquettes.max,
    layerConflicts: layer.conflicts,
    straightFailures: layer.straightFailures,
    classes: field.classes.length,
    classConflicts: field.classConflicts,
    bipartiteConflicts: field.bipartiteConflicts,
  }
}

export function i2Holds(g: Record<string, number>): boolean {
  return (
    g.patterns === 192 &&
    g.firstCountMin === 8 &&
    g.firstCountMax === 8 &&
    g.walkFailures === 0 &&
    g.interiorOff === 0 &&
    g.layerPlaquettes === g.layerPlaquettesExpected &&
    g.layerLinkPlaquettesMin === 4 &&
    g.layerLinkPlaquettesMax === 4 &&
    g.layerConflicts === 0 &&
    g.straightFailures === 0
  )
}

// the wall cochain on n1, and the centre symmetry check on a state
function centreCheck(input: {
  field: Field
  color: ColorGroup
  member: Member
  state: State
}): SmallPart['centre'] {
  const { field, color, member, state } = input
  const graph = field.graph
  const layer = graph.layer!
  const depth = graph.depth!
  const P = layer.period
  const n1 = new Int32Array(graph.docks).fill(-1)
  const order = Array.from({ length: graph.docks }, (_, x) => x).sort(
    (a, b) => depth[a]! - depth[b]! || a - b,
  )

  for (const x of order) {
    if (depth[x] === 0) {
      n1[x] = layer.pos[x]! % P
      continue
    }

    for (let k = 0; k < graph.slots; k++) {
      const y = graph.table[x * graph.slots + k]!

      if (y >= 0 && depth[y] === depth[x]! - 1) {
        n1[x] = n1[y]!
        break
      }
    }
  }

  const cochain = new Int8Array(field.links)

  for (let l = 0; l < field.links; l++) {
    const delta = n1[field.head[l]!]! - n1[field.tail[l]!]!

    let w = ((delta % P) + P) % P

    if (w >= P / 2) {
      w -= P
    }

    cochain[l] = (delta - w) / P
  }

  let closedFailures = 0

  for (let p = 0; p < field.plaquetteLinks.length / 4; p++) {
    let sum = 0

    for (let i = 0; i < 4; i++) {
      sum += field.plaquetteSigns[4 * p + i]! * cochain[field.plaquetteLinks[4 * p + i]!]!
    }

    if (sum !== 0) {
      closedFailures++
    }
  }

  const wrapSums: number[] = []

  for (const start of layer.at) {
    let x = start
    let sum = 0

    for (let s = 0; s < P; s++) {
      const h = layer.step[x * 6]!

      sum += (field.forward[h] === 1 ? 1 : -1) * cochain[field.linkOf[h]!]!
      x = graph.table[h]!
    }

    wrapSums.push(sum)
  }

  const t = wrapSums[0] ?? 0
  const { group, omega, traceRe, traceIm } = color
  const power = (z: number, e: number): number => {
    let g = group.identity

    for (let i = 0; i < ((e % 3) + 3) % 3; i++) {
      g = group.product[g * group.order + z]!
    }

    return g
  }
  const twisted = Int32Array.from(state.values, (u, l) =>
    group.product[power(omega, t * cochain[l]!) * group.order + u]!,
  )
  const before = totalEnergy({ field, group, member, state })
  const after = totalEnergy({ field, group, member, state: { values: twisted, demons: state.demons } })
  const w = { re: -0.5, im: Math.sqrt(3) / 2 }

  let axis1Max = 0
  let otherMax = 0

  for (let i = 0; i < 3; i++) {
    const directions = new Array<number>(P).fill(2 * i)

    for (const start of layer.at) {
      const g0 = loopElement({ field, group, values: state.values, start, directions })
      const g1 = loopElement({ field, group, values: twisted, start, directions })
      const a = { re: traceRe[g0]!, im: traceIm[g0]! }
      const b = { re: traceRe[g1]!, im: traceIm[g1]! }
      const expected = i === 0 ? { re: a.re * w.re - a.im * w.im, im: a.re * w.im + a.im * w.re } : a
      const off = Math.hypot(b.re - expected.re, b.im - expected.im)

      if (i === 0) {
        axis1Max = Math.max(axis1Max, off)
      } else {
        otherMax = Math.max(otherMax, off)
      }
    }
  }

  const layerMean = readSweep({ field, color, state }).layerPlaquette

  return {
    closedFailures,
    wrapSums: Array.from(new Set(wrapSums)),
    energyEqual: before === after ? 1 : 0,
    axis1Max,
    otherMax,
    melted: layerMean < FROZEN_PLAQUETTE ? 1 : 0,
  }
}

// E-FRC-0110's own automaton on the 4^4 box (code/dynamics/finite-kinetic), its plaquette at a fill
function seedAutomaton(group: FiniteGroup, levels: Int32Array, capacity: number, fill: number): number {
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: [4, 4, 4, 4],
    start: 'cold',
    rng: makeWeyl({ start: 1 }),
  })
  const demons = new Int32Array(lattice.links.length)

  for (let i = 0; i < demons.length; i++) {
    demons[i] = (i * GOLDEN) % 1 < fill ? capacity : 0
  }

  const samples: number[] = []

  for (let s = 0; s < SWEEPS; s++) {
    finiteKineticSweep({ lattice, levels, demons, capacity })
    streamFiniteDemons({ lattice, demons, step: s })

    for (let k = 0; k < 4; k++) {
      exchangeFiniteDemons({ lattice, demons, capacity, step: k })
    }

    if (s >= SKIP) {
      samples.push(finitePlaquette({ lattice }))
    }
  }

  return mean(samples)
}

const strip = ({ state: _, ...reading }: RunReading & { state: State }): RunReading => reading

export function smallPart(log: (line: string) => void): SmallPart {
  const color = colorGroup()
  const family = familyF35(color)
  const graph = cuspGraph({ period: 4, floor: 1 })
  const field = makeField(graph)
  const instrument = instrumentGates(graph, field)

  log(`I-A ${JSON.stringify(instrument)}`)

  // V0 first
  const vacuum = family.map(member => {
    const state: State = {
      values: new Int32Array(field.links).fill(color.group.identity),
      demons: new Int32Array(field.links),
    }

    let moves = 0

    for (let s = 0; s < VACUUM_SWEEPS; s++) {
      moves += sweep({ field, group: color.group, member, state })
    }

    let plaquetteMoves = 0
    let freeMoves = 0

    for (let l = 0; l < field.links; l++) {
      if (state.values[l] !== color.group.identity) {
        if (field.plaquettesPerLink[l] === 0) {
          freeMoves++
        } else {
          plaquetteMoves++
        }
      }
    }

    const r = readSweep({ field, color, state })
    const w11 = r.loops[0]!
    const w12 = r.loops[1]!
    const w22 = r.loops[2]!

    return {
      member: member.name,
      moves,
      plaquetteMoves,
      freeMoves,
      chi22: -Math.log((w22 * w11) / (w12 * w12)),
      loopsAllOne: r.loops.filter(Number.isFinite).every(x => x === 1) ? 1 : 0,
    }
  })

  log(`V0 ${JSON.stringify(vacuum)}`)

  const reversal = family.map(member => {
    const state = coldState(field, color.group, member, 0.35)
    const v0 = Int32Array.from(state.values)
    const d0 = Int32Array.from(state.demons)

    for (let s = 0; s < REVERSAL_SWEEPS; s++) {
      sweep({ field, group: color.group, member, state })
    }

    const moved = state.values.some((v, k) => v !== v0[k]) ? 1 : 0

    for (let s = 0; s < REVERSAL_SWEEPS; s++) {
      sweep({ field, group: color.group, member, state, reverse: true })
    }

    const returns =
      state.values.every((v, k) => v === v0[k]) && state.demons.every((v, k) => v === d0[k]) ? 1 : 0

    return { member: member.name, moved, returns }
  })

  log(`I5 ${JSON.stringify(reversal)}`)

  const runs: (RunReading & { state: State })[] = []

  for (const member of family) {
    for (const fill of FILLS) {
      runs.push(runPoint({ field, color, member, fill, log }))
    }
  }

  const meltedRun = runs.find(r => r.member === 'm1' && r.melted) ?? runs[0]!
  const centre = centreCheck({ field, color, member: family[0]!, state: meltedRun.state })

  log(`I7 ${JSON.stringify(centre)}`)

  const boxField = makeField(boxGraph(4))
  const m1 = family[0]!
  const box = FILLS.map(fill => {
    const engine = runPoint({ field: boxField, color, member: m1, fill })
    const seed = seedAutomaton(color.group, m1.levels, m1.capacity, fill)

    log(`C2 f ${fill}: engine ${engine.plaquette.toFixed(4)} seed ${seed.toFixed(4)} drift ${engine.energyDrift}`)

    return { fill, engine: engine.plaquette, seed, drift: engine.energyDrift }
  })

  return {
    part: 'small',
    group: { order: color.group.order, centre: color.centre.length, omegaFound: color.omega >= 0 ? 1 : 0 },
    members: family.map(m => ({
      name: m.name,
      scale: m.scale,
      capacity: m.capacity,
      lowest: Math.min(...Array.from(m.levels).filter(level => level > 0)),
      registerBits: Math.log2(m.capacity + 1),
    })),
    instrument: { ...instrument, i5Links: field.links },
    vacuum,
    reversal,
    centre,
    runs: runs.map(strip),
    box,
  }
}

export function gridPart(part: 'grid' | 'floor', log: (line: string) => void): GridPart {
  const color = colorGroup()
  const family = familyF35(color)
  const graph = part === 'grid' ? cuspGraph({ period: 8, floor: 1 }) : cuspGraph({ period: 4, floor: 2 })
  const field = makeField(graph)
  const instrument = instrumentGates(graph, field)

  log(`${part} ${JSON.stringify(instrument)}`)

  const runs: RunReading[] = []

  for (const member of part === 'grid' ? family : family.slice(0, 1)) {
    for (const fill of FILLS) {
      runs.push(strip(runPoint({ field, color, member, fill, log })))
    }
  }

  return { part, instrument, runs }
}

// ---------------------------------------------------------------------------------------------------------------
// the verdict, as registered

export function demonLinkVerdict(input: { small: SmallPart; grid: GridPart; floor: GridPart }): Verdict {
  const { small, grid, floor } = input
  const i1 = small.group.order === 648 && small.group.centre === 3 && small.group.omegaFound === 1
  const i2 = i2Holds(small.instrument) && i2Holds(grid.instrument) && i2Holds(floor.instrument)
  const i3 = [small.instrument, grid.instrument, floor.instrument].every(g => g.classConflicts === 0)
  const i4 = [small.instrument, grid.instrument, floor.instrument].every(g => g.bipartiteConflicts === 0)
  const i5 = small.reversal.every(r => r.moved === 1 && r.returns === 1)
  const allRuns = [...small.runs, ...grid.runs, ...floor.runs]
  const i6 =
    allRuns.every(r => r.energyDrift === 0) && small.box.every(b => b.drift === 0)
  const c = small.centre
  const i7 =
    c.closedFailures === 0 &&
    c.wrapSums.length === 1 &&
    Math.abs(c.wrapSums[0] ?? 0) === 1 &&
    c.energyEqual === 1 &&
    c.axis1Max <= 1e-12 &&
    c.otherMax <= 1e-12 &&
    c.melted === 1
  const loopsClean = allRuns.every(r => r.loopFailures === 0)
  const gridGates = grid.runs.map(r => ({ r, g: pointGates(r) }))
  const frozenFails = gridGates
    .filter(({ r }) => r.layerPlaquette >= FROZEN_PLAQUETTE)
    .every(({ g }) => !g.s2 || !g.s3)
  const vacuumFailsS2 = small.vacuum.every(v => !(v.chi22 >= 0.1))
  const c1 = frozenFails && vacuumFailsS2
  const boxAt = (f: number): boolean => {
    const b = small.box.find(x => x.fill === f)

    return b !== undefined && Math.abs(b.engine - b.seed) <= 0.02
  }
  const c2 = boxAt(0.9) && boxAt(0.08)
  const passing = gridGates.filter(({ g }) => g.string).map(({ r }) => r)
  const m1Passing = passing.filter(r => r.member === 'm1')
  const floorStable = m1Passing.filter(r => {
    const a = small.runs.find(x => x.member === 'm1' && x.fill === r.fill)
    const b = floor.runs.find(x => x.member === 'm1' && x.fill === r.fill)

    if (a === undefined || b === undefined) {
      return false
    }

    const ga = pointGates(a)
    const gb = pointGates(b)

    return ga.string && gb.string && Math.abs(b.chi22.value - a.chi22.value) <= 0.25 * Math.abs(a.chi22.value)
  })
  const instrumentsHold = i1 && i2 && i3 && i4 && i5 && i6 && i7 && loopsClean && c1 && c2
  const status: Verdict['status'] = !instrumentsHold
    ? 'partial'
    : passing.length === 0
      ? 'fail'
      : floorStable.length > 0
        ? 'pass'
        : 'partial'
  const lowestPassing = passing.length > 0 ? Math.min(...passing.map(r => r.energyPerLink)) : Number.NaN
  const meltAt = (instrumentRuns: RunReading[]): Record<string, number> =>
    Object.fromEntries(
      ['m1', 'm2', 'm3', 'm4'].map(m => {
        const melted = instrumentRuns.filter(r => r.member === m && r.melted)

        return [m, melted.length > 0 ? Math.min(...melted.map(r => r.energyPerLink)) : Number.NaN]
      }),
    )
  const meltGrid = meltAt(grid.runs)
  const v0Moves = small.vacuum.map(v => `${v.member} ${v.plaquetteMoves} plaquette links, ${v.freeMoves} free links`).join('; ')
  const metrics: Record<string, number> = {
    i1: i1 ? 1 : 0,
    i2: i2 ? 1 : 0,
    i3: i3 ? 1 : 0,
    i4: i4 ? 1 : 0,
    i5: i5 ? 1 : 0,
    i6: i6 ? 1 : 0,
    i7: i7 ? 1 : 0,
    loopsClean: loopsClean ? 1 : 0,
    c1: c1 ? 1 : 0,
    c2: c2 ? 1 : 0,
    passingPoints: passing.length,
    m1PassingPoints: m1Passing.length,
    floorStablePoints: floorStable.length,
    lowestPassingEnergyPerLink: lowestPassing,
  }

  for (const { r, g } of gridGates) {
    const key = `${r.member}_f${r.fill}`

    metrics[`${key}_energyPerLink`] = r.energyPerLink
    metrics[`${key}_layerPlaquette`] = r.layerPlaquette
    metrics[`${key}_chi22`] = r.chi22.value
    metrics[`${key}_chi22Error`] = r.chi22.error
    metrics[`${key}_polyakovAbs`] = r.polyakovAbs
    metrics[`${key}_string`] = g.string ? 1 : 0
  }

  for (const m of ['m1', 'm2', 'm3', 'm4']) {
    metrics[`${m}_meltEnergyPerLink`] = meltGrid[m] ?? Number.NaN
  }

  const v0Text = `V0 (the empty mesh, every link the identity and every demon 0) under every member: ${v0Moves} moved in ${VACUUM_SWEEPS} sweeps on I-A, every layer loop ${small.vacuum.every(v => v.loopsAllOne === 1) ? 'exactly 1' : 'NOT 1'}, so V0 is frozen and carries no string`

  return verdict({
    status,
    claim: `${v0Text}. ${
      passing.length > 0
        ? `A confining string with an unbroken Z3 centre (S2 to S4) holds at ${passing.length} of ${grid.runs.length} (member, fill) points on the period-8 cusp (${passing.map(r => `${r.member} f ${r.fill}`).join(', ')}), only at energy per link >= ${lowestPassing.toFixed(3)}, never in the vacuum`
        : `No (member, fill) point of F35 on the period-8 cusp gives a confining string with a Z3 centre`
    }; ${floorStable.length} m1 points floor-stable; instruments ${instrumentsHold ? 'hold' : 'FAIL'}. Base addition: a demon register per link (${small.members.map(m => `${m.name} ${m.registerBits.toFixed(2)} bits`).join(', ')}). Orientation joining not tested and not claimed`,
    metrics,
    control: {
      frozenFails: frozenFails ? 1 : 0,
      vacuumFailsS2: vacuumFailsS2 ? 1 : 0,
      ...Object.fromEntries(small.box.flatMap(b => [[`box_f${b.fill}_engine`, b.engine], [`box_f${b.fill}_seed`, b.seed]])),
    },
    notes: `L2, mirrored grade (the floor is felt). Gates registered before the run, gate 2be6b63a895b. Melting energy per link on I-B: ${JSON.stringify(meltGrid)}. Instruments: I-A ${JSON.stringify(small.instrument)}; I-B ${JSON.stringify(grid.instrument)}; I-C ${JSON.stringify(floor.instrument)}. Centre: ${JSON.stringify(small.centre)}. Reversal: ${JSON.stringify(small.reversal)}.`,
  })
}

export default experiment({
  id: 'gauge/demon-link-family',
  code: 'E-FRC-0317',
  title:
    'a named family of four reversible Sigma(648) demon link rules (F35, seeded from E-FRC-0110, a demon register per link counted as a base addition) on the {3,4,3,4} cusp neighborhood, partial: the vacuum (the empty mesh) is frozen under every member (0 plaquette links move, every layer loop 1), so it carries no string; on the period-8 cusp a confining string with an unbroken Z3 centre (Creutz chi22 >= 0.1 at >= 5 errors, |P| <= 0.1, three sectors 0.25 to 0.42, Im W11 <= 0.01) holds at 3 of 20 points (m2 f 0.08 chi22 1.38 +- 0.13, m3 f 0.2 1.18 +- 0.03, m4 f 0.08 0.78 +- 0.011), only at 3.8 or more units of energy per link, and never for m1 (E-FRC-0110 itself), whose registered fills jump from melted (chi22 1.94 +- 0.67) to frozen, so floor stability could not be read; every instrument gate and both controls hold (exact reversal, energy to the unit, exact Z3 twist, the flat box matching E-FRC-0110 within 0.003); orientation joining not claimed',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const log = (line: string): void => console.error(line)

    return demonLinkVerdict({
      small: smallPart(log),
      grid: gridPart('grid', log),
      floor: gridPart('floor', log),
    })
  },
})
