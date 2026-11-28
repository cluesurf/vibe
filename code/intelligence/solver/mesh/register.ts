/**
 * The M4 memory of level 4: a line register of spin-one tones run by a pair rule under the two-colour brick
 * schedule (pairs (2k, 2k + 1), then (2k + 1, 2k + 2), every round). Slot j sits at cell j * spacing; the other
 * cells hold the background 0. Under the static carrier `id.CBA.id` (the identity except that the sum-0 pairs
 * (-1, +1) and (+1, -1) trade cells) a lone tone stays put, so at spacing 2 no two slots share a pair and every
 * written tone is held forever (M4, E-CMP-0051); at spacing 1 two adjacent opposite tones trade cells.
 *
 * Writing and reading a slot are the register's ports, which M4 places outside the mesh (the decoder). The pair
 * table is the solver's own copy (a candidate may not import code/rule), certified against `id.CBA.id` of
 * code/rule/pair-rule.ts in E-CMP-0056. No imports, exact integers.
 */

/** Pair index p = (a + 1) * 3 + (b + 1); entry p is the image pair. `id.CBA.id`: A = 2 and C = 6 swap. */
export const STATIC_CARRIER_TABLE: readonly number[] = [0, 1, 6, 3, 4, 5, 2, 7, 8]

export interface LineRegister {
  spacing: number
  /** tones -1, 0, +1, one per cell */
  cells: number[]
  /** pair updates applied, every round */
  pairUpdates: number
  rounds: number
}

export function lineRegister(spacing: number): LineRegister {
  return { spacing, cells: [], pairUpdates: 0, rounds: 0 }
}

/** Make room for slot `slot` (cells up to its own, plus one background cell after it). */
export function growRegister(register: LineRegister, slot: number): void {
  const need = slot * register.spacing + 2

  while (register.cells.length < need) {
    register.cells.push(0)
  }
}

export function writeSlot(register: LineRegister, slot: number, tone: number): void {
  register.cells[slot * register.spacing] = tone
}

export function readSlot(register: LineRegister, slot: number): number {
  return register.cells[slot * register.spacing] ?? 0
}

/**
 * One round: both brick colours, every pair, through the table. Returns the pair updates that changed their pair:
 * the work a knockout of this round (the identity in its place) would undo. Zero means the round did nothing, so no
 * read anywhere can tell it from no round (provenance accounting, item 0030).
 */
export function registerRound(register: LineRegister, table: readonly number[]): number {
  const cells = register.cells

  let changed = 0

  for (let color = 0; color < 2; color++) {
    for (let i = color; i + 1 < cells.length; i += 2) {
      const p = (cells[i]! + 1) * 3 + cells[i + 1]! + 1
      const q = table[p]!
      const low = q % 3

      if (q !== p) {
        changed++
      }

      cells[i] = (q - low) / 3 - 1
      cells[i + 1] = low - 1
      register.pairUpdates++
    }
  }

  register.rounds++

  return changed
}
