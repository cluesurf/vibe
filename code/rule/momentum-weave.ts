// The turning weave's family written as one spec, with a momentum ledger, for the momentum question
// (E-FLD-0021 to E-FLD-0023).
//
// The committed rule (code/rule/collision turningWeave) keeps charge and not momentum (E-FLD-0020). Every
// rule of its design has the same architecture: the twelve lines of a cell pair into six couples of a
// line and a wire, the couple partition precesses on a schedule, every wire runs a sum-keeping 9-state
// table (the pair clock), and one couple per beat also runs a conditional exchange of its two lines'
// contents, slot for slot, around the clock (swap, clock, swap) or before it. This file writes that
// family as a spec with four freedoms, the table, the swap condition, the palindrome and the schedule,
// so it can be searched, and runs any member with an optional ledger that books the momentum each piece
// of the collision moves.
//
// Two momenta are booked, both integer 4-vectors in the coordinates of the D4 roots:
// - the particle momentum P, the sum over slots of |tone| times the slot's root: every love and every
//   fear is a unit mover, the momentum a lattice gas conserves (HPP, FHP);
// - the charge current J, the sum over slots of tone times the slot's root, the quantity E-FLD-0020
//   called momentum along x.
// A line's own share of P is n = |a| - |b| times its first root, n in {-1, 0, 1}.
//
// With the committed spec (pair table, lone-away condition, palindrome, the turning schedule) the
// collision is bit for bit turningWeave, and with the bind table it is turningWeave's 'bind' form;
// E-FLD-0021 checks both on every beat. MOMENTUM_WEAVE is the member E-FLD-0022 selects: the hop-free
// bind table, the committed schedule, and the committed lone-away exchange widened to LONE_WITH_CLOCK (a
// lone tone on either slot exchanges with a calm or paired line), so every piece keeps P. E-FLD-0022
// shows why any such member keeps all twelve line momenta separately, and E-FLD-0023 runs its battery.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import {
  BIND_MOVE_FORWARD,
  type Collision,
  G_TURN,
  PAIR_FORWARD,
  TURN_COUPLES_ZERO,
  TURN_POS_MIRROR,
  TURN_SWAP_ORDER,
} from '@/code/rule/collision'

export type LineTable = readonly (readonly [number, number])[]

// key of a line state (a, b), a on the line's first slot: 0..8
export const lineKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)
export const keyTones = (k: number): [number, number] => [Math.floor(k / 3) - 1, (k % 3) - 1]

// the line's share of the particle momentum, in units of its first root
export const lineMomentum = (k: number): number => {
  const [a, b] = keyTones(k)

  return Math.abs(a) - Math.abs(b)
}

// the line's share of the charge current, in units of its first root
export const lineCurrent = (k: number): number => {
  const [a, b] = keyTones(k)

  return a - b
}

export type MomentumWeaveSpec = {
  // the wire table, 9 entries indexed by lineKey
  readonly table: LineTable
  // fires[line * 9 + wire] = 1 when the couple's exchange fires; must be symmetric
  readonly fires: Uint8Array
  // swap, clock, swap (true) or swap then clock (false, inverted as clock then swap)
  readonly palindrome: boolean
  // the power of the turn on beat t, and the couple that swaps on beat t (-1 none), both mod length
  readonly positionAt: readonly number[]
  readonly swapAt: readonly number[]
  // the couples at beat zero and the line symmetry that turns them
  readonly couplesZero: readonly (readonly [number, number])[]
  readonly turn: readonly number[]
}

// a symmetric fires table from a predicate on (line key, wire key)
export function firesOf(when: (line: number, wire: number) => boolean): Uint8Array {
  const fires = new Uint8Array(81)

  for (let l = 0; l < 9; l++) {
    for (let w = 0; w < 9; w++) {
      fires[l * 9 + w] = when(l, w) || when(w, l) ? 1 : 0
    }
  }

  return fires
}

// the committed condition: one line holds a lone tone in its second (away) slot, the other is calm
export const LONE_AWAY = firesOf((l, w) => {
  const [a0, a1] = keyTones(l)

  return a0 === 0 && a1 !== 0 && w === 4
})

// the exchange that keeps momentum: the two lines carry equal momentum and differ
export const EQUAL_MOMENTUM = firesOf((l, w) => l !== w && lineMomentum(l) === lineMomentum(w))

// the head-on exchange of HPP and FHP: a zero-momentum like pair (s, s) with a calm line
export const HEAD_ON = firesOf((l, w) => {
  const [a0, a1] = keyTones(l)

  return a0 === a1 && a0 !== 0 && w === 4
})

export const NEVER = new Uint8Array(81)

// the calm class, the three states the pair clock cycles: calm, (1, -1), (-1, 1)
const CLOCK_CLASS = [lineKey(0, 0), lineKey(1, -1), lineKey(-1, 1)]
const lone = (k: number): boolean => {
  const [a, b] = keyTones(k)

  return (a === 0) !== (b === 0)
}

// the committed condition widened until it keeps momentum: a line holding one lone tone (on either slot,
// either sign) exchanges with a line in the clock class (calm or a pair). Under a hop-free table the clock
// class is closed, so the palindrome's second exchange always fires with the first: a lone tone never
// leaves its line, and the pair clock of the couple runs on the line without the lone tone when the tone
// sits on the wire and is skipped when it sits on the line
export const LONE_WITH_CLOCK = firesOf((l, w) => lone(l) && CLOCK_CLASS.includes(w))

export const MIRRORED_SWAP_ORDER: readonly number[] = [...TURN_SWAP_ORDER, ...[...TURN_SWAP_ORDER].reverse()]

export function weaveSpec(input: Partial<MomentumWeaveSpec> & { table: LineTable }): MomentumWeaveSpec {
  return {
    fires: LONE_AWAY,
    palindrome: true,
    positionAt: TURN_POS_MIRROR,
    swapAt: MIRRORED_SWAP_ORDER,
    couplesZero: TURN_COUPLES_ZERO,
    turn: G_TURN,
    ...input,
  }
}

export const COMMITTED_SPEC = weaveSpec({ table: PAIR_FORWARD })
export const BIND_SPEC = weaveSpec({ table: BIND_MOVE_FORWARD })
export const MOMENTUM_WEAVE = weaveSpec({ table: BIND_MOVE_FORWARD, fires: LONE_WITH_CLOCK })

export function invertLineTable(table: LineTable): LineTable {
  const inverse = new Array<[number, number]>(9)

  for (let k = 0; k < 9; k++) {
    const [a, b] = keyTones(k)
    const out = table[k] ?? [a, b]

    inverse[lineKey(out[0], out[1])] = [a, b]
  }

  return inverse
}

// every piece the collision books: how many times it acted, how many of those changed P, the net P and J
// it moved (4-vectors), and the summed L1 size of the P and J it moved per act (which net sums can hide)
export type LedgerEntry = { count: number; moved: number; p: number[]; j: number[]; pSize: number; jSize: number }
export type Ledger = Map<string, LedgerEntry>

function book(input: {
  ledger: Ledger
  piece: string
  directions: readonly (readonly number[])[]
  before: readonly number[]
  after: readonly number[]
  slots: readonly number[]
}): void {
  const { ledger, piece, directions, before, after, slots } = input
  const entry = ledger.get(piece) ?? { count: 0, moved: 0, p: [0, 0, 0, 0], j: [0, 0, 0, 0], pSize: 0, jSize: 0 }
  const p = [0, 0, 0, 0]
  const j = [0, 0, 0, 0]

  slots.forEach((d, i) => {
    const dp = Math.abs(after[i] ?? 0) - Math.abs(before[i] ?? 0)
    const dj = (after[i] ?? 0) - (before[i] ?? 0)

    for (let axis = 0; axis < 4; axis++) {
      p[axis] = (p[axis] ?? 0) + dp * (directions[d]?.[axis] ?? 0)
      j[axis] = (j[axis] ?? 0) + dj * (directions[d]?.[axis] ?? 0)
    }
  })

  const pSize = p.reduce((s, x) => s + Math.abs(x), 0)

  entry.count++
  entry.moved += pSize > 0 ? 1 : 0
  entry.pSize += pSize
  entry.jSize += j.reduce((s, x) => s + Math.abs(x), 0)

  for (let axis = 0; axis < 4; axis++) {
    entry.p[axis] = (entry.p[axis] ?? 0) + (p[axis] ?? 0)
    entry.j[axis] = (entry.j[axis] ?? 0) + (j[axis] ?? 0)
  }

  ledger.set(piece, entry)
}

// the name a wire transition is booked under
export function clockPiece(from: number, to: number): string {
  if (from === to) {
    return 'inert'
  }

  if (from === 4) {
    return 'create'
  }

  if (to === 4) {
    return 'annihilate'
  }

  const [a, b] = keyTones(from)

  if ((a === 0) !== (b === 0)) {
    return 'hop'
  }

  return 'flip'
}

// the couples of every position of the turn, as [line, wire] pairs of line indices
function positionsOf(spec: MomentumWeaveSpec): (readonly [number, number])[][] {
  const norm = (a: number, b: number): readonly [number, number] => (a < b ? [a, b] : [b, a])
  const out: (readonly [number, number])[][] = []

  let current = spec.couplesZero.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 12; i++) {
    out.push(current)
    current = current.map(([a, b]) => norm(spec.turn[a] ?? a, spec.turn[b] ?? b))
  }

  return out
}

const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0

function clockAt(slots: Int8Array, w0: number, w1: number, first: Int8Array, second: Int8Array): void {
  const from = ((slots[w0] ?? 0) + 1) * 3 + ((slots[w1] ?? 0) + 1)

  slots[w0] = first[from] ?? 0
  slots[w1] = second[from] ?? 0
}

function exchangeAt(slots: Int8Array, l0: number, l1: number, w0: number, w1: number, fires: Uint8Array): void {
  const a0 = slots[l0] ?? 0
  const a1 = slots[l1] ?? 0
  const b0 = slots[w0] ?? 0
  const b1 = slots[w1] ?? 0

  if (fires[((a0 + 1) * 3 + (a1 + 1)) * 9 + (b0 + 1) * 3 + (b1 + 1)] !== 1) {
    return
  }

  slots[l0] = b0
  slots[l1] = b1
  slots[w0] = a0
  slots[w1] = a1
}

// the member's collision on beat t, forward or inverse. With a ledger, every exchange and every wire
// transition is booked under its piece, prefixed 'bare:' on the plain couples and 'swap:' on the couple
// that swaps (whose exchanges are 'swap:out' and 'swap:back')
export function momentumWeave(input: {
  spec: MomentumWeaveSpec
  opposite: readonly number[]
  forward?: boolean
  ledger?: Ledger
}): (t: number) => Collision {
  const { spec, ledger } = input
  const forward = input.forward ?? true
  const lines: [number, number][] = []

  for (let d = 0; d < input.opposite.length; d++) {
    const o = input.opposite[d] ?? d

    if (d < o) {
      lines.push([d, o])
    }
  }

  const positions = positionsOf(spec)
  const table = forward ? spec.table : invertLineTable(spec.table)
  const directions = rootsD4()
  const firstImage = Int8Array.from(table, x => x[0])
  const secondImage = Int8Array.from(table, x => x[1])
  const fires = spec.fires
  // the four slots of every couple of every position, line first then wire
  const slotsOf = positions.map(couples =>
    Int32Array.from(
      couples.flatMap(([m, w]) => [lines[m]?.[0] ?? 0, lines[m]?.[1] ?? 0, lines[w]?.[0] ?? 0, lines[w]?.[1] ?? 0]),
    ),
  )

  return t => {
    const couples = positions[at(spec.positionAt, t)] ?? []
    const swapIndex = at(spec.swapAt, t)
    const four = slotsOf[at(spec.positionAt, t)] ?? new Int32Array(0)

    if (!ledger) {
      const palindrome = spec.palindrome

      return (slots, base) => {
        for (let k = 0; k < couples.length; k++) {
          const l0 = base + (four[4 * k] ?? 0)
          const l1 = base + (four[4 * k + 1] ?? 0)
          const w0 = base + (four[4 * k + 2] ?? 0)
          const w1 = base + (four[4 * k + 3] ?? 0)

          if (k !== swapIndex) {
            clockAt(slots, w0, w1, firstImage, secondImage)
          } else if (palindrome) {
            exchangeAt(slots, l0, l1, w0, w1, fires)
            clockAt(slots, w0, w1, firstImage, secondImage)
            exchangeAt(slots, l0, l1, w0, w1, fires)
          } else if (forward) {
            exchangeAt(slots, l0, l1, w0, w1, fires)
            clockAt(slots, w0, w1, firstImage, secondImage)
          } else {
            clockAt(slots, w0, w1, firstImage, secondImage)
            exchangeAt(slots, l0, l1, w0, w1, fires)
          }
        }
      }
    }

    return (slots, base) => {
      for (let k = 0; k < couples.length; k++) {
        const line = lines[couples[k]?.[0] ?? 0] ?? [0, 0]
        const wire = lines[couples[k]?.[1] ?? 0] ?? [0, 0]
        const quad = [line[0], line[1], wire[0], wire[1]]
        const read = (): number[] => quad.map(d => slots[base + d] ?? 0)

        const exchange = (piece: string): void => {
          const l = lineKey(slots[base + line[0]] ?? 0, slots[base + line[1]] ?? 0)
          const w = lineKey(slots[base + wire[0]] ?? 0, slots[base + wire[1]] ?? 0)

          if (spec.fires[l * 9 + w] !== 1) {
            return
          }

          const before = read()

          for (let s = 0; s < 2; s++) {
            const i = base + (line[s] ?? 0)
            const j = base + (wire[s] ?? 0)
            const v = slots[i] ?? 0

            slots[i] = slots[j] ?? 0
            slots[j] = v
          }

          book({ ledger, piece, directions, before, after: read(), slots: quad })
        }

        const clock = (prefix: string): void => {
          const a = slots[base + wire[0]] ?? 0
          const b = slots[base + wire[1]] ?? 0
          const from = lineKey(a, b)
          const image = table[from] ?? [a, b]

          slots[base + wire[0]] = image[0]
          slots[base + wire[1]] = image[1]
          book({
            ledger,
            piece: `${prefix}${clockPiece(from, lineKey(image[0], image[1]))}`,
            directions,
            before: [0, 0, a, b],
            after: [0, 0, image[0], image[1]],
            slots: quad,
          })
        }

        if (k !== swapIndex) {
          clock('bare:')
        } else if (spec.palindrome) {
          exchange('swap:out')
          clock('swap:')
          exchange('swap:back')
        } else if (forward) {
          exchange('swap:out')
          clock('swap:')
        } else {
          clock('swap:')
          exchange('swap:out')
        }
      }
    }
  }
}

// P and J of a whole state, as 4-vectors
export function momentumOf(data: Int8Array): { p: number[]; j: number[] } {
  const directions = rootsD4()
  const p = [0, 0, 0, 0]
  const j = [0, 0, 0, 0]

  for (let i = 0; i < data.length; i++) {
    const v = data[i] ?? 0

    if (v === 0) {
      continue
    }

    const e = directions[i % 24] ?? []

    for (let axis = 0; axis < 4; axis++) {
      p[axis] = (p[axis] ?? 0) + Math.abs(v) * (e[axis] ?? 0)
      j[axis] = (j[axis] ?? 0) + v * (e[axis] ?? 0)
    }
  }

  return { p, j }
}

// The line momenta N_L of a whole state: per line, the tones on its first slot minus those on its second
// (each counted by |tone|), so P = sum over lines of N_L times the line's first root
export function lineMomenta(data: Int8Array, opposite: readonly number[]): number[] {
  const lineOf = new Int32Array(24)
  const sign = new Int8Array(24)
  let count = 0

  for (let d = 0; d < 24; d++) {
    const o = opposite[d] ?? d

    if (d < o) {
      lineOf[d] = count
      lineOf[o] = count
      sign[d] = 1
      sign[o] = -1
      count++
    }
  }

  const out = new Array<number>(count).fill(0)

  for (let i = 0; i < data.length; i++) {
    const d = i % 24
    const L = lineOf[d] ?? 0

    out[L] = (out[L] ?? 0) + Math.abs(data[i] ?? 0) * (sign[d] ?? 0)
  }

  return out
}

// Every change of the line shares one collision piece can make on one couple, over the 81 couple states,
// every couple and every beat of one period: rows of Z^12, one per (beat, couple, state). `share` is
// lineMomentum for P or lineCurrent for J. With an inert state on every couple (there is always one),
// each row is realizable alone, so an integer quantity is conserved exactly when it vanishes on all rows.
export function coupleChanges(spec: MomentumWeaveSpec, share: (k: number) => number, beats = 24): number[][] {
  const positions = positionsOf(spec)
  const composite = coupleComposite(spec)
  const rows: number[][] = []

  for (let t = 0; t < beats; t++) {
    const couples = positions[at(spec.positionAt, t)] ?? []
    const swapIndex = at(spec.swapAt, t)

    couples.forEach(([line, wire], k) => {
      for (let x = 0; x < 81; x++) {
        const l = Math.floor(x / 9)
        const w = x % 9
        const image = spec.table[w] ?? keyTones(w)
        const y = k === swapIndex ? (composite[x] ?? x) : l * 9 + lineKey(image[0], image[1])
        const row = new Array<number>(12).fill(0)

        row[line] = share(Math.floor(y / 9)) - share(l)
        row[wire] = share(y % 9) - share(w)
        rows.push(row)
      }
    })
  }

  return rows
}

// The 24 sum-keeping 9-state tables: every permutation of the calm class {calm, (1, -1), (-1, 1)} with
// the lone-love pair {(1, 0), (0, 1)} and the lone-fear pair {(-1, 0), (0, -1)} each fixed or hopped
export function sumKeepingTables(): LineTable[] {
  const neutral = [lineKey(0, 0), lineKey(1, -1), lineKey(-1, 1)]
  const orders = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const out: LineTable[] = []

  for (const order of orders) {
    for (const hopLove of [false, true]) {
      for (const hopFear of [false, true]) {
        const table = Array.from({ length: 9 }, (_, k) => keyTones(k))

        neutral.forEach((k, i) => (table[k] = keyTones(neutral[order[i] ?? 0] ?? 4)))

        if (hopLove) {
          table[lineKey(1, 0)] = [0, 1]
          table[lineKey(0, 1)] = [1, 0]
        }

        if (hopFear) {
          table[lineKey(-1, 0)] = [0, -1]
          table[lineKey(0, -1)] = [-1, 0]
        }

        out.push(table)
      }
    }
  }

  return out
}

export const IDENTITY_TABLE: LineTable = Array.from({ length: 9 }, (_, k) => keyTones(k))
export const FLIP_TABLE: LineTable = IDENTITY_TABLE.map((x, k) =>
  k === lineKey(1, -1) ? [-1, 1] : k === lineKey(-1, 1) ? [1, -1] : x,
)
export const BIND_REVERSE_TABLE: LineTable = invertLineTable(BIND_MOVE_FORWARD)

// the swap couple keeps both line momenta on every one of its 81 states
const LINE_MOMENTUM = Array.from({ length: 9 }, (_, k) => lineMomentum(k))

export function keepsLineMomenta(spec: MomentumWeaveSpec, composite = coupleComposite(spec)): boolean {
  for (let x = 0; x < 81; x++) {
    const y = composite[x] ?? x

    if (LINE_MOMENTUM[Math.floor(y / 9)] !== LINE_MOMENTUM[Math.floor(x / 9)] || LINE_MOMENTUM[y % 9] !== LINE_MOMENTUM[x % 9]) {
      return false
    }
  }

  return true
}

// Every distinct momentum-keeping member with a negation-symmetric swap condition, on the given tables,
// palindromic and not, under the committed schedule. A condition is a set of the 36 exchange orbits (an
// unordered pair of distinct line states); negation pairs them into 20 groups, and a negation-symmetric
// condition is a union of groups (2^20 of them). Members are deduplicated by the swap couple's composite,
// since two conditions with one composite are one rule.
export function negationSymmetricMembers(tables: readonly (readonly [string, LineTable])[]): { id: string; spec: MomentumWeaveSpec }[] {
  const exchange = (x: number): number => (x % 9) * 9 + Math.floor(x / 9)
  const orbitOf = (x: number): number => Math.min(x, exchange(x))
  const negate = (x: number): number => (8 - Math.floor(x / 9)) * 9 + (8 - (x % 9))
  const groups: number[][] = []
  const seen = new Set<number>()

  for (let x = 0; x < 81; x++) {
    if (exchange(x) !== x && orbitOf(x) === x && !seen.has(x)) {
      const group = [...new Set([x, orbitOf(negate(x))])]

      group.forEach(o => seen.add(o))
      groups.push(group)
    }
  }

  const members: { id: string; spec: MomentumWeaveSpec }[] = []
  const fires = new Uint8Array(81)
  const composite = new Int32Array(81)
  const swapped = Int32Array.from({ length: 81 }, (_, x) => exchange(x))
  const groupMask = groups.map(group => group.flatMap(o => [o, exchange(o)]))

  for (const [name, table] of tables) {
    const clocked = Int32Array.from({ length: 81 }, (_, x) => {
      const image = table[x % 9] ?? keyTones(x % 9)

      return Math.floor(x / 9) * 9 + lineKey(image[0], image[1])
    })

    for (const palindrome of [true, false]) {
      const composites = new Set<string>()

      for (let mask = 0; mask < 1 << groups.length; mask++) {
        fires.fill(0)
        groupMask.forEach((slots, i) => {
          if ((mask >> i) & 1) {
            slots.forEach(o => (fires[o] = 1))
          }
        })

        let keeps = true

        for (let x = 0; x < 81 && keeps; x++) {
          const once = clocked[fires[x] === 1 ? (swapped[x] ?? x) : x] ?? x
          const y = palindrome && fires[once] === 1 ? (swapped[once] ?? once) : once

          composite[x] = y
          keeps =
            LINE_MOMENTUM[Math.floor(y / 9)] === LINE_MOMENTUM[Math.floor(x / 9)] && LINE_MOMENTUM[y % 9] === LINE_MOMENTUM[x % 9]
        }

        if (!keeps) {
          continue
        }

        const key = composite.join(',')

        if (!composites.has(key)) {
          composites.add(key)
          members.push({ id: `${name}:${palindrome ? 'palindrome' : 'once'}:${mask}`, spec: weaveSpec({ table, fires: Uint8Array.from(fires), palindrome }) })
        }
      }
    }
  }

  return members
}

// The swap couple's whole action on its 81 states (line key * 9 + wire key), as a map. Two specs whose
// tables and composites agree are the same rule on every couple.
export function coupleComposite(spec: MomentumWeaveSpec): Int32Array {
  const out = new Int32Array(81)
  const swap = (x: number): number => (spec.fires[x] === 1 ? (x % 9) * 9 + Math.floor(x / 9) : x)
  const clock = (x: number): number => {
    const w = x % 9
    const image = spec.table[w] ?? keyTones(w)

    return Math.floor(x / 9) * 9 + lineKey(image[0], image[1])
  }

  for (let x = 0; x < 81; x++) {
    out[x] = spec.palindrome ? swap(clock(swap(x))) : clock(swap(x))
  }

  return out
}
