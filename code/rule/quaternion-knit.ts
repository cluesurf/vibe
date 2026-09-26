// The quaternion knit: a period-one knit whose single collision commutes with the quaternion group Q8
// (left multiplication by the unit quaternions on R^4, which permutes the 24 D4 roots), so its symmetry
// acts irreducibly on R^4 at every beat, with no schedule, and CPT holds by construction. Built for
// E-RLT-0051 as the best knit a whole-dock collision allows once exact local color is kept.
//
// WHY Q8. Exact local color (E-FRC-0124) makes every beat keep the side sum D (tones on first slots minus
// tones on second slots). A collision that commutes with a group G then keeps D o g for every g in G too,
// and no irreducible subgroup of W(F4) keeps the side signs of any of the 4,096 side choices, so those
// images are new invariants. E-RLT-0051 proves that every irreducible G leaves at least 8 independent line
// momentum invariants (P and four more) and most leave all 12. The groups that leave 8 all hold -1 acting
// on vibes without charge conjugation, so a clock of (love, fear) pairs on a line cannot be invariant: the
// vacuum has to clock with LIKE pairs on two lines at once. Of those groups only the two Q8's keep a
// partition of the lines into couples (with the tone twist below), which is what lets the clock stay
// two-line local.
//
// THE BEAT. C = E B E, applied at every dock and every beat.
// - B, the couple clock. The twelve lines pair into six couples [plus line, minus line] (QUATERNION_COUPLES,
//   kept by Q8 with the twist that conjugates tones on the elements carrying plus lines to minus lines).
//   Each couple runs an 81-state table on its four slots, the same table on every couple of a Q8 orbit read
//   in a frame carried by the group (coupleFrames), so the collision commutes with Q8 by construction. On
//   the vacuum's states, with h = 0, +, - for calm, (1, 1), (-1, -1) on a line: calm -> (+, -) -> (-, +) ->
//   calm, a clock of like pairs. The plain table (defaultCoupleTable) also hops a like pair onto a calm
//   partner and leaves everything else; QUATERNION_TABLES, the default, is the search's choice off the
//   vacuum. Every table is N J with J an involution (so negating every tone turns B into its inverse), and
//   keeps charge and both line momenta, so B keeps P and every line functional.
// - E, the exchange. On the eight lines outside the frame e1 +- e2, e3 +- e4 (the frame whose line momenta
//   the forced invariants freeze): when exactly two of them hold a lone tone (one slot held, the opposite
//   calm), the tones are alike, and the pair (u, v) of their directions has exactly one partner (w, x) with
//   e_u + e_v = e_w + e_x that keeps every forced line functional, and the lines of w and x are wholly
//   calm, the two tones move to w and x. An involution that keeps charge, P and every forced functional
//   (so D, and local color with calm role points paired by side), negation-even.
// So N C N = E B^-1 E = C^-1: CPT with the identity coin map, exact.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { type Collision } from '@/code/rule/collision'

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
const FIRSTS: number[] = []
const LINE_OF: number[] = []

ROOTS.forEach((_, d) => {
  if (d < (OPPOSITE[d] ?? d)) {
    LINE_OF[d] = FIRSTS.length
    LINE_OF[OPPOSITE[d] ?? d] = FIRSTS.length
    FIRSTS.push(d)
  }
})

const SIDE = ROOTS.map((_, d) => (d < (OPPOSITE[d] ?? d) ? 1 : -1))

// left multiplication by i and by j on the quaternion coordinates (1, i, j, k), as integer matrices
export const Q8_GENERATORS: readonly (readonly (readonly number[])[])[] = [
  [
    [0, 0, 0, -1],
    [0, 0, 1, 0],
    [0, -1, 0, 0],
    [1, 0, 0, 0],
  ],
  [
    [0, 0, -1, 0],
    [0, 0, 0, -1],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
  ],
]

// the couples [plus line, minus line] (line l is FIRSTS[l] with its opposite), found by E-RLT-0051 among
// the 160 oriented couple partitions Q8 keeps under its twist: four couples join the frozen frame to the
// frame e1 +- e3, e2 +- e4, two lie in the frame e1 +- e4, e2 +- e3
export const QUATERNION_COUPLES: readonly (readonly [number, number])[] = [
  [0, 2],
  [9, 1],
  [10, 3],
  [5, 4],
  [6, 7],
  [8, 11],
]

// the lines whose momenta can move
export const EXCHANGE_LINES: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9]

const key = (v: readonly number[]): string => v.join(',')
const ROOT_INDEX = new Map(ROOTS.map((r, i) => [key(r), i]))

function permutationOf(matrix: readonly (readonly number[])[]): number[] {
  return ROOTS.map(r => ROOT_INDEX.get(key([0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + (matrix[i]?.[j] ?? 0) * (r[j] ?? 0), 0)))) ?? -1)
}

// the eight elements of Q8 as root permutations
export function quaternionGroup(): number[][] {
  const gens = Q8_GENERATORS.map(permutationOf)
  const identity = ROOTS.map((_, i) => i)
  const seen = new Map([[key(identity), identity]])
  const queue = [identity]

  while (queue.length > 0) {
    const x = queue.pop() ?? identity

    for (const g of gens) {
      const y = x.map(d => g[d] ?? d)

      if (!seen.has(key(y))) {
        seen.set(key(y), y)
        queue.push(y)
      }
    }
  }

  return [...seen.values()]
}

// the forced line functionals: P and D o g for g in Q8, as rows on the twelve line momenta
export function forcedFunctionals(): number[][] {
  const rows = [0, 1, 2, 3].map(k => FIRSTS.map(d => ROOTS[d]?.[k] ?? 0))

  for (const g of quaternionGroup()) {
    rows.push(FIRSTS.map(d => SIDE[g[d] ?? 0] ?? 0))
  }

  return rows
}

// partner[u * 24 + v] = w * 24 + x for the pairs of lone directions on the exchange lines whose class
// (equal sum, equal forced functionals) has exactly two members
function buildPartners(): Int32Array {
  const rows = forcedFunctionals()
  const partner = new Int32Array(24 * 24).fill(-1)
  const classes = new Map<string, [number, number][]>()

  for (let u = 0; u < 24; u++) {
    for (let v = u + 1; v < 24; v++) {
      const lu = LINE_OF[u] ?? 0
      const lv = LINE_OF[v] ?? 0

      if (lu === lv || !EXCHANGE_LINES.includes(lu) || !EXCHANGE_LINES.includes(lv)) continue

      const n = new Array<number>(12).fill(0)

      n[lu] = (n[lu] ?? 0) + (SIDE[u] ?? 0)
      n[lv] = (n[lv] ?? 0) + (SIDE[v] ?? 0)

      const sum = [0, 1, 2, 3].map(c => (ROOTS[u]?.[c] ?? 0) + (ROOTS[v]?.[c] ?? 0))
      const values = rows.map(r => r.reduce((a, c, l) => a + c * (n[l] ?? 0), 0))
      const k = `${key(sum)}|${key(values)}`

      classes.set(k, [...(classes.get(k) ?? []), [u, v]])
    }
  }

  for (const members of classes.values()) {
    if (members.length !== 2) continue

    const [a, b] = members

    if (!a || !b) continue

    partner[a[0] * 24 + a[1]] = b[0] * 24 + b[1]
    partner[a[1] * 24 + a[0]] = b[0] * 24 + b[1]
    partner[b[0] * 24 + b[1]] = a[0] * 24 + a[1]
    partner[b[1] * 24 + b[0]] = a[0] * 24 + a[1]
  }

  return partner
}

const PARTNER = buildPartners()

export type QuaternionKnitOptions = {
  // the exchange E on (the default) or off, for the control
  exchange?: boolean
  // the hops (+, 0) <-> (0, +) of the couple clock on (the default) or off
  hops?: boolean
  // which couples clock, as indices into QUATERNION_COUPLES (all six by default); a Q8-invariant choice is
  // a union of its couple orbits, {0, 1, 2, 3} and {4, 5}
  clocking?: readonly number[]
  // the forward couple tables of the two couple orbits, in the representatives' frames (defaultCoupleTable
  // by default); each must commute with its representative's stabilizer (stabilizerMaps)
  tables?: readonly (readonly number[])[]
  // the plain couple tables (defaultCoupleTable, the head-on cycle and the hops, everything else left)
  // instead of QUATERNION_TABLES, when no tables are given
  plain?: boolean
}

// head-on class of a line: 0 calm, 1 (1, 1), -1 (-1, -1), 2 anything else
function headOn(a: number, b: number): number {
  if (a === b) {
    return a
  }

  return 2
}

// the couple clock on the (plus, minus) head-on classes, forward or backward
function clockCouple(p: number, m: number, forward: boolean, hops: boolean): [number, number] {
  if (p === 0 && m === 0) return forward ? [1, -1] : [-1, 1]
  if (p === 1 && m === -1) return forward ? [-1, 1] : [0, 0]
  if (p === -1 && m === 1) return forward ? [0, 0] : [1, -1]

  if (hops && (p === 0) !== (m === 0) && p !== m) {
    return [m, p]
  }

  return [p, m]
}

function exchange(slots: Int8Array, base: number): void {
  let first = -1
  let second = -1
  let lone = 0

  for (const l of EXCHANGE_LINES) {
    const d = FIRSTS[l] ?? 0
    const o = OPPOSITE[d] ?? 0
    const a = slots[base + d] ?? 0
    const b = slots[base + o] ?? 0

    if ((a === 0) !== (b === 0)) {
      lone++

      const held = a !== 0 ? d : o

      if (first < 0) first = held
      else second = held
    }
  }

  if (lone !== 2) return

  const tone = slots[base + first] ?? 0

  if ((slots[base + second] ?? 0) !== tone) return

  const target = PARTNER[first * 24 + second] ?? -1

  if (target < 0) return

  const w = Math.floor(target / 24)
  const x = target % 24

  for (const d of [w, x]) {
    if ((slots[base + d] ?? 0) !== 0 || (slots[base + (OPPOSITE[d] ?? 0)] ?? 0) !== 0) return
  }

  slots[base + first] = 0
  slots[base + second] = 0
  slots[base + w] = tone
  slots[base + x] = tone
}

// A couple table: the image of each of the 81 states of a couple's four slots, read in its orbit
// representative's frame [plus first, plus second, minus first, minus second], state index
// sum (s_i + 1) 3^i
export type CoupleTable = readonly number[]

export const coupleState = (s: readonly number[]): number => s.reduce((a, x, i) => a + ((x ?? 0) + 1) * 3 ** i, 0)
export const coupleTones = (k: number): number[] => [0, 1, 2, 3].map(i => (Math.floor(k / 3 ** i) % 3) - 1)

// the committed-style default: the head-on cycle and the hops, everything else left
export function defaultCoupleTable(hops: boolean): number[] {
  return Array.from({ length: 81 }, (_, k) => {
    const [a, b, c, d] = coupleTones(k)
    const p = headOn(a ?? 0, b ?? 0)
    const m = headOn(c ?? 0, d ?? 0)

    if (p === 2 || m === 2) return k

    const [p2, m2] = clockCouple(p, m, true, hops)

    return coupleState([p2, p2, m2, m2])
  })
}

// the couple tables E-RLT-0051's search settled on: off the vacuum's three states (calm, (+, -), (-, +)),
// each table is N J with J an involution commuting with its representative's stabilizer, flipping charge and
// keeping both line momenta, chosen by hill climbing (four starts, 2,500 to 4,000 steps each) to make the
// first-period dressing of a lone love and a lone fear smallest; the best reached 289 (the committed knit: 33)
export const QUATERNION_TABLES: readonly (readonly number[])[] = [
  [0, 1, 54, 3, 36, 57, 18, 19, 72, 9, 10, 63, 12, 11, 14, 15, 64, 69, 6, 37, 22, 21, 20, 75, 24, 25, 78, 27, 28, 29, 30, 33, 48, 45, 34, 47, 4, 7, 38, 5, 8, 23, 42, 61, 76, 31, 46, 49, 32, 35, 50, 51, 52, 53, 2, 55, 56, 39, 60, 59, 58, 73, 74, 13, 16, 65, 66, 17, 68, 67, 70, 71, 40, 43, 62, 41, 44, 77, 26, 79, 80],
  [0, 1, 6, 3, 36, 39, 2, 37, 72, 9, 10, 15, 12, 63, 66, 11, 64, 67, 54, 55, 60, 57, 58, 59, 56, 61, 62, 27, 28, 33, 30, 45, 48, 29, 46, 49, 4, 7, 42, 5, 8, 75, 38, 73, 76, 31, 34, 51, 32, 35, 50, 47, 52, 53, 18, 19, 24, 21, 22, 23, 20, 25, 26, 13, 16, 69, 14, 17, 68, 65, 70, 71, 40, 43, 78, 41, 44, 77, 74, 79, 80],
]

export type CoupleFrame = {
  // the orbit (0: the four couples of QUATERNION_COUPLES[0], 1: the two of QUATERNION_COUPLES[3])
  readonly orbit: number
  // the dock slots of this couple in the representative's frame order
  readonly slots: readonly number[]
  // +1, or -1 when the carrying element conjugates tones
  readonly twist: number
}

const REPRESENTATIVES = [0, 3]
const repSlots = (c: number): number[] => {
  const [p, m] = QUATERNION_COUPLES[c] ?? [0, 0]
  const pd = FIRSTS[p] ?? 0
  const md = FIRSTS[m] ?? 0

  return [pd, OPPOSITE[pd] ?? 0, md, OPPOSITE[md] ?? 0]
}
const PLUS_LINES = new Set(QUATERNION_COUPLES.map(([p]) => p))

// the element's tone twist: +1 when it carries plus lines to plus lines
export const twistOf = (g: readonly number[]): number => (PLUS_LINES.has(LINE_OF[g[FIRSTS[QUATERNION_COUPLES[0]?.[0] ?? 0] ?? 0] ?? 0] ?? 0) ? 1 : -1)

// every couple's frame, carried from its representative by the first element of Q8 that reaches it
export function coupleFrames(): CoupleFrame[] {
  const group = quaternionGroup()
  const frames: (CoupleFrame | undefined)[] = QUATERNION_COUPLES.map(() => undefined)

  REPRESENTATIVES.forEach((r, orbit) => {
    const base = repSlots(r)

    for (const g of group) {
      const twist = twistOf(g)
      const image = base.map(d => g[d] ?? 0)
      const plusLine = LINE_OF[twist === 1 ? (image[0] ?? 0) : (image[2] ?? 0)] ?? 0
      const c = QUATERNION_COUPLES.findIndex(([p]) => p === plusLine)

      if (c >= 0 && !frames[c]) frames[c] = { orbit, slots: image, twist }
    }
  })

  return frames.map(f => f ?? { orbit: 0, slots: [0, 0, 0, 0], twist: 1 })
}

// the stabilizer of each representative couple as maps of its 81 states (with the twist), which a table
// must commute with
export function stabilizerMaps(): number[][][] {
  const group = quaternionGroup()

  return REPRESENTATIVES.map(r => {
    const base = repSlots(r)
    const maps: number[][] = []

    for (const g of group) {
      const twist = twistOf(g)
      const image = base.map(d => g[d] ?? 0)

      if (!image.every(d => base.includes(d))) continue

      const position = image.map(d => base.indexOf(d))

      maps.push(
        Array.from({ length: 81 }, (_, k) => {
          const s = coupleTones(k)
          const out = [0, 0, 0, 0]

          s.forEach((x, i) => (out[position[i] ?? 0] = twist * x))

          return coupleState(out)
        }),
      )
    }

    return maps
  })
}

const FRAMES = coupleFrames()

function clockTables(slots: Int8Array, base: number, tables: readonly (readonly number[])[], clocking: readonly number[]): void {
  const s = [0, 0, 0, 0]

  for (const c of clocking) {
    const frame = FRAMES[c]

    if (!frame) continue

    const table = tables[frame.orbit]

    if (!table) continue

    for (let i = 0; i < 4; i++) s[i] = frame.twist * (slots[base + (frame.slots[i] ?? 0)] ?? 0)

    const out = coupleTones(table[coupleState(s)] ?? 0)

    for (let i = 0; i < 4; i++) slots[base + (frame.slots[i] ?? 0)] = frame.twist * (out[i] ?? 0)
  }
}

export function invertCoupleTable(table: readonly number[]): number[] {
  const out = new Array<number>(81).fill(-1)

  table.forEach((image, k) => (out[image] = k))

  return out
}

// The collision (the same at every beat; the beat number is ignored). `opposite` must be the D4 root order
// of code/algebra/group/root-system rootsD4, which every D4 mesh here uses.
export function quaternionKnit(input: { opposite: readonly number[]; forward?: boolean } & QuaternionKnitOptions): (t: number) => Collision {
  const forward = input.forward ?? true
  const exchangeOn = input.exchange ?? true
  const hops = input.hops ?? true
  const clocking = input.clocking ?? [0, 1, 2, 3, 4, 5]
  const forwardTables = input.tables ?? (input.plain ? [defaultCoupleTable(hops), defaultCoupleTable(hops)] : QUATERNION_TABLES)
  const tables = forward ? forwardTables : forwardTables.map(invertCoupleTable)

  if (!input.opposite.every((o, d) => o === OPPOSITE[d])) {
    throw new Error('the quaternion knit needs the rootsD4 direction order')
  }

  const collision: Collision = (slots, base) => {
    if (exchangeOn) exchange(slots, base)

    clockTables(slots, base, tables, clocking)

    if (exchangeOn) exchange(slots, base)
  }

  return () => collision
}
