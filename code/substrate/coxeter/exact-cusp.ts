// A CUSP NEIGHBORHOOD of the {3,4,3,4} honeycomb in exact arithmetic (item vibe-roadmap-board-0027): the cells near
// one ideal vertex of the base cell, modulo a lattice of the cusp's own translations, down to a floor. It is the mesh
// the working rule runs on (code/rule/vibe-weave makeVibeWeave on a mesh, lockedTables): degree 24, slots in rootsD4()
// order, every neighbour facing back by the opposite slot, -1 only below the floor.
//
// THE PIECES, all exact in Z[sqrt 2] (code/substrate/coxeter/exact-3434.ts):
//
// - the cusp v = (0, 1, sqrt 2, sqrt 2, 1) in the simple-root basis, the null vector fixed by s1..s4 (2B v is
//   (-1, 0, 0, 0, 0), so B(v, v) = 0 and v-perp is {x : x0 = 0}). The base cell has v as a vertex.
// - the LAYER: the cells that touch v, exactly the cells whose center c has B(c, v) = B(c0, v). They form the cubic
//   lattice of the vertex figure {4,3,4}: each layer cell has 6 layer neighbours, in 3 opposite pairs.
// - the unit translations u_j = k_a h (a a layer slot of the base cell, h the one element of H = W(F4) that makes k_a h
//   a parabolic translation: it fixes v and moves every vector of v-perp along v). They carry the base cell to its
//   layer neighbours. A translation is not a frame: phi(u_j) = h_j, where phi is the map s_i -> s_i (i < 4),
//   s4 -> Z whose kernel K is the group of frames. So a unit step TWISTS the labels by h_j, and the label-trivial
//   translations are the kernel of n -> h1^n1 h2^n2 h3^n3, which is 2 Z^3 when the h_j are three independent commuting
//   involutions (gated). The period is therefore even, 2L, and Lambda = 2L Z^3 = <u_j^(2L)> lies in K.
// - the QUOTIENT: two cells are one dock exactly when a translation of Lambda carries one to the other. A cell's
//   lattice position n(c) is read from the additive horospherical coordinates z_i(c) = B(c, a_i) / B(c, v) (each
//   shifts by a constant under a translation), in floats ONLY to choose which element of Lambda brings the cell into
//   the fundamental box [theta, theta + 2L)^3. That element is then applied exactly, and the dock is keyed by its exact
//   center. Every dock's distance from the box walls (in lattice units) is gated against a margin, and every dock is
//   checked exactly: its translates u_j^(2L) c land on the same dock.
// - the DEPTH: the graph distance from the layer, by breadth-first search from all layer docks. The FLOOR F keeps
//   the docks of depth at most F, and a slot of a depth-F dock that faces a depth F + 1 cell is -1: the rule reflects
//   it into the dock's own opposite slot (vibe-weave streamTarget), the only frontier that keeps the stream one to one.
//   The layer itself has no frontier: every slot of a layer dock reaches a cell of depth 0 or 1.
// - the ORDER: docks are numbered by breadth-first search from the base cell over the quotient, slot by slot in
//   rootsD4() order, as buildExactBall numbers the ball. So where the ball of radius r around the base embeds in the
//   quotient and lies above the floor, its docks carry the exact ball's indices.
//
// What the period and the floor change is stated in note/cusp-neighborhood.md. In short: the quotient by Lambda is the
// honeycomb's own dynamics on Lambda-periodic states, exactly and for every beat (Lambda keeps the labels), while the
// floor changes a dock at depth d from beat F - d + 1 on.
//
// NOTHING MOVES: this file builds a table.

import {
  exactCell,
  matrixProduct,
  matrixVector,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { SLOT_CLASS } from '@/code/substrate/coxeter/exact-ball-mesh'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { type Mesh } from '@/code/tool/mesh'

const DIM = 5
const ENTRIES = DIM * DIM
const SLOTS = 24

// the cusp: fixed by s1, s2, s3, s4
export const CUSP_VERTEX: ExactVector = [0n, 0n, 1n, 0n, 0n, 1n, 0n, 1n, 1n, 0n]

const keyOf = (values: bigint[]): string => values.join(',')

const sameValues = (a: bigint[], b: bigint[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

function identity(): ExactMatrix {
  const m = new Array<bigint>(2 * ENTRIES).fill(0n)

  for (let i = 0; i < DIM; i++) {
    m[2 * (i * DIM + i)] = 1n
  }

  return m
}

function unitVector(i: number): ExactVector {
  const v = new Array<bigint>(2 * DIM).fill(0n)

  v[2 * i] = 1n

  return v
}

const toFloat = ([x, y]: [bigint, bigint]): number =>
  Number(x) + Number(y) * Math.SQRT2

// true when g fixes v and moves every vector of v-perp (spanned by a1..a4) along v: a parabolic translation
function isTranslation(g: ExactMatrix): boolean {
  if (!sameValues(matrixVector(g, CUSP_VERTEX), CUSP_VERTEX)) {
    return false
  }

  for (let i = 1; i < DIM; i++) {
    const a = unitVector(i)
    const d = matrixVector(g, a).map((v, k) => v - a[k]!)
    // d must be lambda v, lambda = d_4 (v_4 = 1); v = (0, 1, sqrt 2, sqrt 2, 1)
    const lx = d[8]!
    const ly = d[9]!
    const expect: bigint[] = [
      0n,
      0n,
      lx,
      ly,
      2n * ly,
      lx,
      2n * ly,
      lx,
      lx,
      ly,
    ]

    if (!sameValues(d, expect)) {
      return false
    }
  }

  return true
}

export type CuspTranslations = {
  // the base cell's six layer slots, in label order
  readonly layerSlots: number[]
  // the three axes: a layer slot a with a < -a, the translation u = k_a h, its inverse, and phi(u) = h
  // the three axes: a layer slot a, the slot b of the opposite layer neighbour (u_b = u_a^-1), the translation
  // u_a = k_a h, its inverse, and phi(u_a) = h
  readonly axes: {
    slot: number
    partner: number
    translation: ExactMatrix
    inverse: ExactMatrix
    twist: ExactMatrix
  }[]
  // gates on them, each true
  readonly gates: {
    sixLayerSlots: boolean
    oneTranslationPerSlot: boolean
    slotsPairIntoInverses: boolean
    translationsCommute: boolean
    twistsInvolutions: boolean
    twistsCommute: boolean
    // h1^e1 h2^e2 h3^e3 = 1 only for e = 0 mod 2: the label-trivial translations are exactly 2 Z^3
    kernelIsTwoZ3: boolean
    // each twist is minus a reflection (Z times a reflection of H)
    twistsMinusReflections: boolean
  }
}

// The unit translations of the cusp and their label twists.
export function cuspTranslations(cell: ExactCell = exactCell()): CuspTranslations {
  const level0 = twiceForm(cell.center, CUSP_VERTEX)
  const layerSlots: number[] = []

  cell.transports.forEach((k, a) => {
    const level = twiceForm(matrixVector(k, cell.center), CUSP_VERTEX)

    if (level[0] === level0[0] && level[1] === level0[1]) {
      layerSlots.push(a)
    }
  })

  const one = identity()
  const inverseIn = (h: ExactMatrix): ExactMatrix =>
    cell.stabilizer.find(g => sameValues(matrixProduct(h, g), one))!

  let oneTranslationPerSlot = true
  const bySlot = new Map<number, { translation: ExactMatrix; twist: ExactMatrix }>()

  for (const a of layerSlots) {
    const found = cell.stabilizer.filter(h =>
      isTranslation(matrixProduct(cell.transports[a]!, h)),
    )

    oneTranslationPerSlot &&= found.length === 1

    if (found[0]) {
      bySlot.set(a, {
        translation: matrixProduct(cell.transports[a]!, found[0]),
        twist: found[0],
      })
    }
  }

  // the layer slots pair into inverse translations: the layer neighbour on the far side of the base cell from the one
  // across a is NOT across -a (a vertex never lies on two antipodal facets), it is across the slot b with u_b = u_a^-1
  const partnerOf = new Map<number, number>()

  for (const a of layerSlots) {
    for (const b of layerSlots) {
      const p = bySlot.get(a)
      const q = bySlot.get(b)

      if (p && q && a !== b && sameValues(matrixProduct(p.translation, q.translation), one)) {
        partnerOf.set(a, b)
      }
    }
  }

  const axes = layerSlots
    .filter(a => partnerOf.has(a) && a < partnerOf.get(a)!)
    .map(slot => {
      const { translation, twist } = bySlot.get(slot)!

      return {
        slot,
        partner: partnerOf.get(slot)!,
        translation,
        inverse: bySlot.get(partnerOf.get(slot)!)!.translation,
        twist,
      }
    })

  const slotsPairIntoInverses =
    axes.length === 3 &&
    partnerOf.size === 6 &&
    [...partnerOf].every(([a, b]) => partnerOf.get(b) === a) &&
    // and the inverse of u_a = k_a h is h^-1 k_-a, exactly
    axes.every(({ slot, inverse, twist }) =>
      sameValues(
        inverse,
        matrixProduct(inverseIn(twist), cell.transports[cell.opposite[slot]!]!),
      ),
    )

  const pairs = axes.flatMap((p, i) => axes.slice(i + 1).map(q => [p, q] as const))
  const translationsCommute = pairs.every(([p, q]) =>
    sameValues(
      matrixProduct(p.translation, q.translation),
      matrixProduct(q.translation, p.translation),
    ),
  )
  const twistsInvolutions = axes.every(
    ({ twist }) =>
      !sameValues(twist, one) && sameValues(matrixProduct(twist, twist), one),
  )
  const twistsCommute = pairs.every(([p, q]) =>
    sameValues(matrixProduct(p.twist, q.twist), matrixProduct(q.twist, p.twist)),
  )

  let kernelIsTwoZ3 = axes.length === 3

  for (let e = 1; e < 8 && kernelIsTwoZ3; e++) {
    let h = one

    axes.forEach(({ twist }, j) => {
      if ((e >> j) & 1) {
        h = matrixProduct(h, twist)
      }
    })

    kernelIsTwoZ3 = !sameValues(h, one)
  }

  // the reflections of H: its involutions fixing a hyperplane of the cell's span, i.e. -Z h is a reflection when
  // Z h is: test h Z, which must be an involution of trace (on R^5) 3, a reflection of H (trace 5 - 2 = 3)
  const trace = (m: ExactMatrix): [bigint, bigint] => {
    let x = 0n
    let y = 0n

    for (let i = 0; i < DIM; i++) {
      x += m[2 * (i * DIM + i)]!
      y += m[2 * (i * DIM + i) + 1]!
    }

    return [x, y]
  }
  const twistsMinusReflections = axes.every(({ twist }) => {
    const r = matrixProduct(twist, cell.inversion)
    const [x, y] = trace(r)

    return sameValues(matrixProduct(r, r), one) && x === 3n && y === 0n
  })

  return {
    layerSlots,
    axes,
    gates: {
      sixLayerSlots: layerSlots.length === 6,
      oneTranslationPerSlot,
      slotsPairIntoInverses,
      translationsCommute,
      twistsInvolutions,
      twistsCommute,
      kernelIsTwoZ3,
      twistsMinusReflections,
    },
  }
}

export type ExactCusp = {
  readonly mesh: Mesh
  readonly cells: number
  // the period 2L (the lattice Lambda = 2L Z^3 in unit translations) and the floor F
  readonly period: number
  readonly floor: number
  // cells * 24, -1 below the floor, slots in rootsD4() order
  readonly table: Int32Array
  // each dock's graph distance from the layer
  readonly depth: Uint8Array
  // docks per depth, depth 0 the layer ((2L)^3 docks)
  readonly depthCounts: number[]
  // each dock's distance from the base dock (dock 0), over the quotient
  readonly distance: Int32Array
  // slots that face the floor
  readonly floorSlots: number
  // each dock's class mod 2 D4 relative to the base dock (bit k for basis coordinate k), and the edges where the class
  // map k_a -> a mod 2 D4 disagrees (0 when it is well defined on the quotient)
  readonly classOf: Uint8Array
  readonly classConflicts: number
  // the smallest distance, in lattice units, of any dock's position from a wall of the fundamental box
  readonly margin: number
  readonly translations: CuspTranslations
  // the gates, each true (buildExactCusp throws otherwise)
  readonly gates: {
    translations: boolean
    layerSize: boolean
    layerDegreeSix: boolean
    // a step reaching a known dock with a different frame (the chamber point's image): 0
    consistent: boolean
    // u_j^(2L) applied to every dock's frame lands on the same dock
    periodic: boolean
    returnsExactly: boolean
    oppositeIsKnitOpposite: boolean
    marginPositive: boolean
    connected: boolean
  }
}

// The cusp neighborhood of the given even period and floor.
export function buildExactCusp(input: {
  period: number
  floor: number
  cell?: ExactCell
  // the offset of the fundamental box, in lattice units (default -0.4686, away from the integers and half-integers)
  offset?: number
}): ExactCusp {
  const { period, floor } = input

  if (!Number.isInteger(period) || period < 2 || period % 2 !== 0) {
    throw new Error(
      `buildExactCusp: the period must be even (a unit translation twists the labels): ${period}`,
    )
  }

  if (!Number.isInteger(floor) || floor < 0 || floor > 255) {
    throw new Error(`buildExactCusp: floor ${floor}`)
  }

  const cell = input.cell ?? exactCell()
  const theta = input.offset ?? -0.4686
  const translations = cuspTranslations(cell)
  const translationsOk = Object.values(translations.gates).every(Boolean)

  if (!translationsOk) {
    throw new Error(
      `buildExactCusp: translation gates fail ${JSON.stringify(translations.gates)}`,
    )
  }

  const axes = translations.axes
  const power = (m: ExactMatrix, n: number): ExactMatrix => {
    let out = identity()

    for (let i = 0; i < n; i++) {
      out = matrixProduct(out, m)
    }

    return out
  }
  // Lambda's generators U_j = u_j^(2L) and their inverses
  const up = axes.map(a => power(a.translation, period))
  const down = axes.map(a => power(a.inverse, period))

  // the additive coordinates z_i(c) = B(c, a_i) / B(c, v), i = 1..3, and the lattice position n = S^-1 (z - z0)
  const zOf = (c: ExactVector): number[] => {
    const level = toFloat(twiceForm(c, CUSP_VERTEX))

    return [1, 2, 3].map(i => toFloat(twiceForm(c, unitVector(i))) / level)
  }
  const z0 = zOf(cell.center)
  const shifts = axes.map(a => {
    const z = zOf(matrixVector(a.translation, cell.center))

    return z.map((v, i) => v - z0[i]!)
  })
  // S[i][j] = shift of z_i under u_j; invert the 3 x 3
  const S = [0, 1, 2].map(i => [0, 1, 2].map(j => shifts[j]![i]!))
  const det =
    S[0]![0]! * (S[1]![1]! * S[2]![2]! - S[1]![2]! * S[2]![1]!) -
    S[0]![1]! * (S[1]![0]! * S[2]![2]! - S[1]![2]! * S[2]![0]!) +
    S[0]![2]! * (S[1]![0]! * S[2]![1]! - S[1]![1]! * S[2]![0]!)
  const cof = (i: number, j: number): number => {
    const r = [0, 1, 2].filter(k => k !== i)
    const c = [0, 1, 2].filter(k => k !== j)
    const m =
      S[r[0]!]![c[0]!]! * S[r[1]!]![c[1]!]! -
      S[r[0]!]![c[1]!]! * S[r[1]!]![c[0]!]!

    return (i + j) % 2 === 0 ? m : -m
  }
  const Sinv = [0, 1, 2].map(i => [0, 1, 2].map(j => cof(j, i) / det))
  const positionOf = (c: ExactVector): number[] => {
    const z = zOf(c)
    const dz = z.map((v, i) => v - z0[i]!)

    return [0, 1, 2].map(i =>
      [0, 1, 2].reduce((s, j) => s + Sinv[i]![j]! * dz[j]!, 0),
    )
  }

  let margin = Number.POSITIVE_INFINITY

  // the element of Lambda (as exponents of U_j) that brings position n into the box, and the margin it leaves
  const wrapOf = (n: number[]): number[] =>
    n.map(v => {
      const q = (v - theta) / period
      const m = Math.floor(q)
      const frac = q - m

      margin = Math.min(margin, frac * period, (1 - frac) * period)

      return m
    })
  const shift = (g: ExactMatrix, m: number[]): ExactMatrix => {
    let out = g

    m.forEach((e, j) => {
      const step = e > 0 ? down[j]! : up[j]!

      for (let i = 0; i < Math.abs(e); i++) {
        out = matrixProduct(step, out)
      }
    })

    return out
  }

  const level0 = twiceForm(cell.center, CUSP_VERTEX)
  const stepCenter = cell.transports.map(k => matrixVector(k, cell.center))
  const stepChamber = cell.transports.map(k =>
    matrixVector(k, cell.chamberPoint),
  )

  // phase A: the layer, then the docks by depth (multi-source breadth-first search from the layer)
  const frames: (ExactMatrix | undefined)[] = []
  const chamberKeys: string[] = []
  const index = new Map<string, number>()
  const depthOf: number[] = []
  const rows: Int32Array[] = []
  let inconsistent = 0
  let periodic = true

  // the canonical frame of the cell g k_a: its center, chamber image and frame, brought into the box
  const canonical = (
    g: ExactMatrix,
    k: number,
  ): { key: string; chamber: string; frame: () => ExactMatrix; layer: boolean } => {
    const center = matrixVector(g, stepCenter[k]!)
    const m = wrapOf(positionOf(center))
    const moved = m.some(e => e !== 0)
    const lift = moved ? shift(identity(), m) : undefined
    const c = lift ? matrixVector(lift, center) : center
    const p = matrixVector(g, stepChamber[k]!)
    const level = twiceForm(center, CUSP_VERTEX)

    return {
      key: keyOf(c),
      chamber: keyOf(lift ? matrixVector(lift, p) : p),
      frame: () => {
        const f = matrixProduct(g, cell.transports[k]!)

        return lift ? matrixProduct(lift, f) : f
      },
      layer: level[0] === level0[0] && level[1] === level0[1],
    }
  }

  const add = (key: string, chamber: string, frame: ExactMatrix, depth: number): number => {
    const id = frames.length

    index.set(key, id)
    frames.push(frame)
    chamberKeys.push(chamber)
    depthOf.push(depth)

    return id
  }

  // the base cell is in the box (position 0, inside [theta, theta + 2L))
  wrapOf(positionOf(cell.center))
  add(keyOf(cell.center), keyOf(cell.chamberPoint), identity(), 0)

  // the layer, by breadth-first search over layer slots
  const layer: number[] = [0]
  let layerDegreeSix = true

  for (let head = 0; head < layer.length; head++) {
    const x = layer[head]!
    const g = frames[x]!
    let degree = 0

    for (let k = 0; k < SLOTS; k++) {
      const n = canonical(g, k)

      if (!n.layer) {
        continue
      }

      degree++

      if (!index.has(n.key)) {
        layer.push(add(n.key, n.chamber, n.frame(), 0))
      }
    }

    layerDegreeSix &&= degree === 6
  }

  const layerSize = layer.length === period ** 3

  // every dock by depth
  for (let head = 0; head < frames.length; head++) {
    const g = frames[head]!
    const here = depthOf[head]!
    const row = new Int32Array(SLOTS).fill(-1)

    for (let k = 0; k < SLOTS; k++) {
      const n = canonical(g, k)
      let id = index.get(n.key)

      if (id === undefined && here < floor) {
        id = add(n.key, n.chamber, n.frame(), here + 1)
      } else if (id !== undefined && chamberKeys[id] !== n.chamber) {
        inconsistent++
      }

      row[k] = id ?? -1
    }

    rows[head] = row

    // periodic, on every dock: U_j^(+-1) g c0, brought back into the box, is this dock's own key. So the canonical form
    // is a function of the Lambda orbit (a cell near a box wall cannot be split into two docks)
    const center = matrixVector(g, cell.center)

    for (const step of [...up, ...down]) {
      const c = matrixVector(step, center)
      const back = shift(identity(), wrapOf(positionOf(c)))

      periodic &&= index.get(keyOf(matrixVector(back, c))) === head
    }

    frames[head] = undefined
  }

  const cellsA = frames.length

  // phase B: renumber by breadth-first search from the base dock over the quotient
  const order: number[] = [0]
  const newOf = new Int32Array(cellsA).fill(-1)

  newOf[0] = 0

  for (let head = 0; head < order.length; head++) {
    const row = rows[order[head]!]!

    for (let k = 0; k < SLOTS; k++) {
      const y = row[k]!

      if (y >= 0 && newOf[y] === -1) {
        newOf[y] = order.length
        order.push(y)
      }
    }
  }

  const cells = order.length
  const connected = cells === cellsA
  const table = new Int32Array(cells * SLOTS)
  const depth = new Uint8Array(cells)

  order.forEach((old, x) => {
    const row = rows[old]!

    for (let k = 0; k < SLOTS; k++) {
      const y = row[k]!

      table[x * SLOTS + k] = y < 0 ? -1 : newOf[y]!
    }

    depth[x] = depthOf[old]!
  })

  let returnsExactly = true
  let floorSlots = 0

  for (let x = 0; x < cells; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (y < 0) {
        floorSlots++
        returnsExactly &&= depth[x] === floor
      } else {
        returnsExactly &&= table[y * SLOTS + OPPOSITE[k]!] === x
      }
    }
  }

  const distance = new Int32Array(cells).fill(-1)

  distance[0] = 0

  for (let x = 0; x < cells; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (y >= 0 && distance[y] === -1) {
        distance[y] = distance[x]! + 1
      }
    }
  }

  // the class map, breadth-first in dock order (already breadth-first from the base)
  const classOf = new Uint8Array(cells)
  const assigned = new Uint8Array(cells)

  assigned[0] = 1

  let classConflicts = 0

  for (let x = 0; x < cells; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (y < 0) {
        continue
      }

      const c = classOf[x]! ^ SLOT_CLASS[k]!

      if (!assigned[y]) {
        assigned[y] = 1
        classOf[y] = c
      } else if (classOf[y] !== c) {
        classConflicts++
      }
    }
  }

  const depthCounts: number[] = []

  for (const d of depth) {
    depthCounts[d] = (depthCounts[d] ?? 0) + 1
  }

  const oppositeIsKnitOpposite = cell.opposite.every((o, k) => o === OPPOSITE[k])

  const gates = {
    translations: translationsOk,
    layerSize,
    layerDegreeSix,
    consistent: inconsistent === 0,
    periodic,
    returnsExactly,
    oppositeIsKnitOpposite,
    // positions are read in floats from exact centers whose entries stay far below 2^53, so their error is near
    // 1e-12; a margin above 1e-9 keeps every floor() on the right side
    marginPositive: margin > 1e-9,
    connected,
  }

  const failed = Object.entries(gates)
    .filter(([, ok]) => !ok)
    .map(([name]) => name)

  if (failed.length > 0) {
    throw new Error(
      `buildExactCusp: period ${period} floor ${floor} fails ${failed.join(', ')}`,
    )
  }

  return {
    mesh: {
      id: `exact-3434-cusp-${period}-floor-${floor}`,
      degree: SLOTS,
      cellCount: cells,
      neighbour(c, direction) {
        return table[c * SLOTS + direction] ?? -1
      },
      opposite(direction) {
        return OPPOSITE[direction] ?? direction
      },
    },
    cells,
    period,
    floor,
    table,
    depth,
    depthCounts,
    distance,
    floorSlots,
    classOf,
    classConflicts,
    margin,
    translations,
    gates,
  }
}

// A sub-mesh: the docks `keep` marks, in their old relative order, every slot facing a dropped dock -1. Returns the
// table and the maps between old and new dock numbers. Used to lower a floor with the links and the layout of the
// larger mesh kept (the docks of depth at most F' come out in the same order as they stood).
export function restrictTable(
  table: Int32Array,
  keep: (dock: number) => boolean,
): { table: Int32Array; oldOf: Int32Array; newOf: Int32Array; mesh: Mesh } {
  const cellsA = table.length / SLOTS
  const newOf = new Int32Array(cellsA).fill(-1)
  const oldList: number[] = []

  for (let x = 0; x < cellsA; x++) {
    if (keep(x)) {
      newOf[x] = oldList.length
      oldList.push(x)
    }
  }

  const cells = oldList.length
  const out = new Int32Array(cells * SLOTS)

  oldList.forEach((old, x) => {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[old * SLOTS + k]!

      out[x * SLOTS + k] = y < 0 ? -1 : newOf[y]!
    }
  })

  return {
    table: out,
    oldOf: Int32Array.from(oldList),
    newOf,
    mesh: {
      id: `restricted-${cells}`,
      degree: SLOTS,
      cellCount: cells,
      neighbour(c, direction) {
        return out[c * SLOTS + direction] ?? -1
      },
      opposite(direction) {
        return OPPOSITE[direction] ?? direction
      },
    },
  }
}

// The covering map from a labelled ball (rootsD4() slots, -1 at its frontier, base cell 0) onto the cusp: pi(0) = 0 and
// pi(neighbour(c, a)) = cusp neighbour(pi(c), a), walked breadth-first. `conflicts` counts ball edges where the two
// disagree (0 when the ball's labelled graph maps onto the quotient's, the exact consequence of Lambda in K), and
// `missing` ball edges whose cusp image is below the floor.
export function coverBall(
  ballTable: Int32Array,
  cuspTable: Int32Array,
): { pi: Int32Array; conflicts: number; missing: number } {
  const cells = ballTable.length / SLOTS
  const pi = new Int32Array(cells).fill(-1)

  pi[0] = 0

  let conflicts = 0
  let missing = 0

  for (let c = 0; c < cells; c++) {
    const p = pi[c]!

    for (let k = 0; k < SLOTS; k++) {
      const y = ballTable[c * SLOTS + k]!

      if (y < 0) {
        continue
      }

      const image = p < 0 ? -1 : cuspTable[p * SLOTS + k]!

      if (image < 0) {
        missing++
        continue
      }

      if (pi[y] === -1) {
        pi[y] = image
      } else if (pi[y] !== image) {
        conflicts++
      }
    }
  }

  return { pi, conflicts, missing }
}
