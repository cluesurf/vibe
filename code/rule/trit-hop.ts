// Matter hops on string trits (E-FRC-0210): a vibe crossing a bulk link flips that link's string trit, and a
// crossing that would carry the trit out of -1 .. 1 is refused. With the light of code/rule/trit-column this
// is the whole U(1) sector on trits: the charge moves, the string it drags is the current's record, and the
// light reads the strings through the relation E = s - C^T u.
//
// THE MOVE. A crossing swaps the vibes of the two docks x and y at the ends of one bulk link l (x its tail,
// y its head, along a first root). The net charge carried from x to y is J = v_x - v_y (in -2 .. 2), and the
// string pays it: s_l <- s_l - J. Refused when |s_l - J| > 1: the slot holds one trit. Nothing moves in the
// sense of a carried object: the two docks exchange values and the link between them records the exchange.
//
// WHY THIS KEEPS GAUSS'S LAW. The bulk divergence at x is the outflow of s - C^T u over x's links, and the
// curl part C^T u has none. The swap changes v_x by -J and v_y by +J, and s_l by -J changes the outflow at x
// by -J and at y by +J. So div E - v is unchanged at every dock, every beat, by construction. On the husk the
// same holds for the column sums: the husk current on a husk link is the column sum of the bulk crossings over
// it, and the continuity equation dQ + div J = 0 holds on the husk exactly, because the column sum commutes
// with the divergence.
//
// WHY IT IS REVERSIBLE. The crossing is an involution. If it happens, s' = s - J and the swapped vibes carry
// J' = -J, so s' - J' = s is in range and the same crossing undoes it. If it is refused the state is
// unchanged and it is refused again. A step applies the crossing on a set of links that share no dock (a
// matching), so the order inside a step does not matter, and the step is its own inverse.
//
// THE SCHEDULE. A step names one first root k and one phase: the matching is every other link of each orbit
// of the translation by root k (every orbit has even length on the torus, checked when the table is built).
// A gas runs the steps in a fixed cycle over the 12 roots and 2 phases. An emitter names its own links and
// beats. Both are data known to the forward and the backward run.
//
// WHAT THE REFUSAL MEANS. The string trit records the NET charge that has crossed its link since the start,
// so the cap is on the net transport through a bulk link, |net crossings| <= 1 from s = 0, not on the rate:
// a charge that goes forth and back crosses any number of times, and one that goes around a closed loop is
// refused on its second lap. The light never changes a string (its kick moves only potentials), so nothing
// but a crossing back relieves one.
//
// Integers only: no float, no trig, no rounding.

import { rootsD4 } from '@/code/algebra/group/root-system'
import type { TritBulk, TritState } from '@/code/rule/trit-column'

const ROOTS = rootsD4()

function rootIndex(r: readonly number[]): number {
  return ROOTS.findIndex(o => o.every((x, k) => x === (r[k] ?? 0)))
}

export type HopTable = {
  readonly bulk: TritBulk
  // per first root k (0 .. 11), the root index of rootsD4 it is
  readonly rootOf: Int32Array
  // per (k, phase): the tail docks of the matching, as offsets into `tails`
  readonly start: Int32Array // 24 + 1
  readonly tails: Int32Array
}

export function buildHopTable(bulk: TritBulk): HopTable {
  const rootOf = Int32Array.from({ length: 12 }, (_, k) => rootIndex(bulk.roots[k] ?? []))
  const lists: number[][] = Array.from({ length: 24 }, () => [])
  const seen = new Uint8Array(bulk.docks)

  for (let k = 0; k < 12; k++) {
    const d = rootOf[k] ?? 0

    seen.fill(0)

    for (let x0 = 0; x0 < bulk.docks; x0++) {
      if (seen[x0]) continue

      const orbit: number[] = []

      for (let x = x0; !seen[x]; x = bulk.neighbour[x * 24 + d] ?? 0) {
        seen[x] = 1
        orbit.push(x)
      }

      if (orbit.length % 2 !== 0) {
        throw new Error(`the orbit of root ${k} through dock ${x0} has odd length ${orbit.length}`)
      }

      orbit.forEach((x, i) => lists[k * 2 + (i % 2)]!.push(x))
    }
  }

  const start = new Int32Array(25)

  for (let i = 0; i < 24; i++) {
    start[i + 1] = (start[i] ?? 0) + (lists[i]?.length ?? 0)
  }

  return { bulk, rootOf, start, tails: Int32Array.from(lists.flat()) }
}

export type HopTally = { crossings: number; refused: number; carried: number }

export const emptyHopTally = (): HopTally => ({ crossings: 0, refused: 0, carried: 0 })

// one crossing on the link from tail x along first root k: returns J (0 when nothing crosses or the crossing
// is refused), and counts
export function cross(table: HopTable, state: TritState, x: number, k: number, tally?: HopTally): number {
  const bulk = table.bulk
  const y = bulk.neighbour[x * 24 + (table.rootOf[k] ?? 0)] ?? 0
  const vx = state.vibe[x] ?? 0
  const vy = state.vibe[y] ?? 0
  const j = vx - vy

  if (j === 0) return 0

  const l = x * 12 + k
  const s = (state.string[l] ?? 0) - j

  if (s < -1 || s > 1) {
    if (tally) tally.refused++

    return 0
  }

  state.vibe[x] = vy
  state.vibe[y] = vx
  state.string[l] = s

  if (tally) {
    tally.crossings++
    tally.carried += j < 0 ? -j : j
  }

  return j
}

// one step of the gas: every link of the matching (k, phase) tries its crossing. Its own inverse
export function hopStep(table: HopTable, state: TritState, k: number, phase: number, tally?: HopTally): void {
  const i = k * 2 + phase

  for (let at = table.start[i] ?? 0; at < (table.start[i + 1] ?? 0); at++) {
    cross(table, state, table.tails[at] ?? 0, k, tally)
  }
}

// the gas schedule: beat t runs root t mod 12 at phase floor(t / 12) mod 2
export const gasStep = (t: number): [number, number] => [t % 12, Math.floor(t / 12) % 2]

// the husk current of one bulk crossing: the husk link it lies over, and its column sum is the sum of these.
// With the columns of code/rule/trit-column, bulk link x * 12 + k lies over husk link column[x] * 9 + h(k)
export function huskLinkOf(bulk: TritBulk, x: number, k: number): number {
  return (bulk.column[x] ?? 0) * 9 + (bulk.firstHusk[k] ?? 0)
}
