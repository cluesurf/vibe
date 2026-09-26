// The reconnection move (E-FRC-0213): a closed string loop moves into the potential of the triangle it
// bounds, so a circulating current can run lap after lap on string trits (code/rule/trit-hop) under the
// trit-column light (code/rule/trit-column).
//
// THE PROBLEM IT SOLVES. A crossing pays the charge it carries into its link's string trit, so the string
// records the NET charge through that link and is refused past one unit (E-FRC-0210). A charge sent around a
// closed triangle of links fills all three strings in one lap and is refused on the second.
//
// THE MOVE. For a bulk triangle t (links l_j, orientations c_j), the translation
//   s_(l_j) <- s_(l_j) - k c_j,   U_P <- U_P - k o
// (P the husk triangle t casts, o = +-1 its orientation in P's column, U_P P's potential column) leaves the
// husk flux E = S - C^T U unchanged on every husk link, because t casts P's links with the signs o C_P. So
// Gauss's law, the light's drift and its kick are untouched: the light reads only E and the angles.
// In the bulk, s moves by a curl and one potential trit moves by a curl, so the bulk flux changes by a
// difference of two curls and bulk Gauss holds too.
//
// WHY THE POTENTIAL COLUMN AND NOT t's OWN TRIT. The light pays its kick into U_P as a thermometer column
// (E-FRC-0207): value v is |v| trits at the top, and adding f moves the front by f. That code is what makes
// the light a bijection (a column read as a free register cannot be kicked reversibly: the number of
// arrangements with sum v is not the same for every v). A move that set t's own potential trit would leave
// a hole in the thermometer, and the next kick would rewrite the column and lose it. So the move writes U_P
// through the column's front: exactly one trit changes, the one at the front, and the column stays a
// thermometer. The literal form, t's own trit (`literalReconnect`), is kept as the control.
//
// THE CHAIN AND THE INVOLUTION. The states reachable from one another by the translation (varying k) form a
// chain: k is limited by the three strings (each a_j = c_j s_(l_j) - k must stay in -1 .. 1, so k lies in
// [max a - 1, min a + 1]) and by the column window (|U_P - k o| <= n_P D). The chain has 1, 2 or 3 states:
//   1 state   nothing moves
//   2 states  they swap: a string on one link <-> strings on the other two (the loop slides), U_P by -+o
//   3 states  all three a_j equal: the loop +, the empty triangle, the loop -. An involution on three
//             states fixes one. The move pairs the EMPTY triangle with the loop whose sense the magnetic
//             field B_P names, sigma = o sign(B_P), and fixes the other loop; with B_P = 0 nothing moves
// The rule depends only on the chain (the same from each of its states) and on B_P, which the move does not
// change (B is read from the angles), so every triangle's move is an involution.
//
// WHY B DECIDES. A loop of sense sigma on t is a husk string sigma o C_P, and the drift turns it into an
// angle whose curl B_P has the sign of sigma o. In a steady circulating current the light's kick moves U_P
// by sign(B_P) per unit of loop the current lays down (dE/dt = 0 with dS = -J forces C^T dU = dS), so the
// move is exactly the one that takes back what the kick added: the string and the potential both stay
// bounded. The other sense has no partner, because an involution on three states cannot pair both loops
// with the empty one: this is forced, and it is where the direction must come from.
//
// THE SCHEDULE. A step applies the move on one class of triangles: a set of bulk triangles that share no
// bulk link and no husk column, built greedily in triangle order once. Moves in a class touch disjoint
// trits (strings on disjoint links, fronts of distinct columns) and read B, which none of them changes, so
// the step is its own inverse. Steps cycle through the classes.
//
// Integers only: no float, no trig, no rounding.

import { centeredField, columnSumLinks, columnValue, huskCurlWeighted, writeColumn, type TritLight, type TritState } from '@/code/rule/trit-column'

export type ReconnectTable = {
  readonly light: TritLight
  // per bulk triangle: its husk triangle, its orientation in that column, and its position in the column
  readonly husk: Int32Array
  readonly orient: Int8Array
  // per class: the triangles, as offsets into `members`
  readonly classStart: Int32Array
  readonly members: Int32Array
  readonly classes: number
}

export function buildReconnectTable(light: TritLight): ReconnectTable {
  const bulk = light.bulk
  const husk = new Int32Array(bulk.triangles)
  const orient = new Int8Array(bulk.triangles)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    for (let k = bulk.triColumnStart[p] ?? 0; k < (bulk.triColumnStart[p + 1] ?? 0); k++) {
      const t = bulk.triColumn[k] ?? 0

      husk[t] = p
      orient[t] = bulk.triColumnSign[k] ?? 1
    }
  }

  // greedy classes: a triangle joins the first class holding none of its links and not its column
  const usedLinks: Uint8Array[] = []
  const usedColumns: Uint8Array[] = []
  const lists: number[][] = []

  for (let t = 0; t < bulk.triangles; t++) {
    const p = husk[t] ?? 0
    const l0 = bulk.triLinks[t * 3] ?? 0
    const l1 = bulk.triLinks[t * 3 + 1] ?? 0
    const l2 = bulk.triLinks[t * 3 + 2] ?? 0

    let c = 0

    for (; c < lists.length; c++) {
      const links = usedLinks[c]!

      if (!links[l0] && !links[l1] && !links[l2] && !usedColumns[c]![p]) break
    }

    if (c === lists.length) {
      usedLinks.push(new Uint8Array(bulk.links))
      usedColumns.push(new Uint8Array(bulk.huskTriangles))
      lists.push([])
    }

    usedLinks[c]![l0] = 1
    usedLinks[c]![l1] = 1
    usedLinks[c]![l2] = 1
    usedColumns[c]![p] = 1
    lists[c]!.push(t)
  }

  const classStart = new Int32Array(lists.length + 1)

  for (let c = 0; c < lists.length; c++) classStart[c + 1] = (classStart[c] ?? 0) + (lists[c]?.length ?? 0)

  return { light, husk, orient, classStart, members: Int32Array.from(lists.flat()), classes: lists.length }
}

// B_P for every husk triangle, centered, from the angle columns (the light's own field; the move reads it)
export function huskFields(light: TritLight, state: TritState): Int32Array {
  const angle = columnSumLinks(light, state.angle)
  const out = new Int32Array(light.bulk.huskTriangles)

  for (let p = 0; p < out.length; p++) out[p] = centeredField(light, huskCurlWeighted(light, angle, p))

  return out
}

export type ReconnectTally = { moves: number; loops: number; slides: number }

export const emptyReconnectTally = (): ReconnectTally => ({ moves: 0, loops: 0, slides: 0 })

// The chain of triangle t: the k interval and the translation k* the move applies (0 when nothing moves).
// Exposed for the exhaustive involution check.
export function reconnectShift(input: {
  a: readonly [number, number, number]
  potential: number
  window: number
  orient: number
  field: number
}): { lo: number; hi: number; shift: number } {
  const { a, potential: u, window: w, orient: o, field: b } = input
  let lo = Math.max(a[0], a[1], a[2]) - 1
  let hi = Math.min(a[0], a[1], a[2]) + 1

  // |u - k o| <= w  <=>  k o in [u - w, u + w]
  if (o > 0) {
    lo = Math.max(lo, u - w)
    hi = Math.min(hi, u + w)
  } else {
    lo = Math.max(lo, -u - w)
    hi = Math.min(hi, -u + w)
  }

  const length = hi - lo + 1

  if (length === 2) return { lo, hi, shift: lo + hi }

  if (length === 3) {
    const sigma = o * (b > 0 ? 1 : b < 0 ? -1 : 0)

    if (sigma === 0) return { lo, hi, shift: 0 }

    // the loop + sits at k = lo, the empty triangle at lo + 1, the loop - at hi (a_j - k = +1, 0, -1)
    const partner = sigma > 0 ? lo : hi
    const middle = lo + 1

    if (middle === 0) return { lo, hi, shift: partner }
    if (partner === 0) return { lo, hi, shift: middle }

    return { lo, hi, shift: 0 }
  }

  return { lo, hi, shift: 0 }
}

// the move on one bulk triangle; returns the translation applied
export function reconnect(table: ReconnectTable, state: TritState, t: number, fields: Int32Array, tally?: ReconnectTally): number {
  const light = table.light
  const bulk = light.bulk
  const l0 = bulk.triLinks[t * 3] ?? 0
  const l1 = bulk.triLinks[t * 3 + 1] ?? 0
  const l2 = bulk.triLinks[t * 3 + 2] ?? 0
  const c0 = bulk.triSigns[t * 3] ?? 0
  const c1 = bulk.triSigns[t * 3 + 1] ?? 0
  const c2 = bulk.triSigns[t * 3 + 2] ?? 0
  const a0 = c0 * (state.string[l0] ?? 0)
  const a1 = c1 * (state.string[l1] ?? 0)
  const a2 = c2 * (state.string[l2] ?? 0)

  // cheap exit: the empty triangle with no field moves only if the column window clips it, which it never
  // does at U = 0; a string pattern of spread 2 has a one-state chain
  if (Math.max(a0, a1, a2) - Math.min(a0, a1, a2) === 2) return 0

  const p = table.husk[t] ?? 0
  const o = table.orient[t] ?? 1
  const start = bulk.triColumnStart[p] ?? 0
  const length = (bulk.triColumnStart[p + 1] ?? 0) - start
  const u = columnValue(state.potential, bulk.triColumn, bulk.triColumnSign, start, length)
  const { shift: k } = reconnectShift({ a: [a0, a1, a2], potential: u, window: light.potentialWindow[p] ?? 0, orient: o, field: fields[p] ?? 0 })

  if (k === 0) return 0

  state.string[l0] = (state.string[l0] ?? 0) - k * c0
  state.string[l1] = (state.string[l1] ?? 0) - k * c1
  state.string[l2] = (state.string[l2] ?? 0) - k * c2
  writeColumn(state.potential, bulk.triColumn, bulk.triColumnSign, start, length, u - k * o)

  if (tally) {
    tally.moves++

    if (a0 === a1 && a1 === a2) {
      tally.loops++
    } else {
      tally.slides++
    }
  }

  return k
}

// one step: every triangle of class c. Its own inverse (for the same angles)
export function reconnectStep(table: ReconnectTable, state: TritState, c: number, fields: Int32Array, tally?: ReconnectTally): void {
  for (let at = table.classStart[c] ?? 0; at < (table.classStart[c + 1] ?? 0); at++) {
    reconnect(table, state, table.members[at] ?? 0, fields, tally)
  }
}

// THE CONTROL: the literal move on t's own potential trit u_t, (loop sigma, u_t = 0) <-> (no loop,
// u_t = -sigma), as the reflection of the chain in (strings, u_t). It keeps the bulk flux exactly and is an
// involution, but it caps each triangle at one lap per sense (u_t is one trit) and it leaves a hole in the
// potential column's thermometer code
export function literalReconnect(state: TritState, light: TritLight, t: number): number {
  const bulk = light.bulk
  const l = [0, 1, 2].map(j => bulk.triLinks[t * 3 + j] ?? 0)
  const c = [0, 1, 2].map(j => bulk.triSigns[t * 3 + j] ?? 0)
  const a = l.map((x, j) => (c[j] ?? 0) * (state.string[x] ?? 0))
  const u = state.potential[t] ?? 0
  const lo = Math.max(Math.max(...a) - 1, u - 1)
  const hi = Math.min(Math.min(...a) + 1, u + 1)
  const k = lo + hi

  if (k === 0 || lo > hi) return 0

  l.forEach((x, j) => (state.string[x] = (state.string[x] ?? 0) - k * (c[j] ?? 0)))
  state.potential[t] = u - k

  return k
}
