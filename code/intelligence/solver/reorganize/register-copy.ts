/**
 * Level 5's copy of the M4 line register: spin-one tones run by a pair rule under the two-colour brick schedule (pairs
 * (2k, 2k + 1), then (2k + 1, 2k + 2), every round). It is this folder's own copy, not an import of solver/mesh (another
 * item extends that folder) nor of code/rule (check:layers rule 2 and the sandbox bundle refuse the rules to a
 * candidate); the level-5 experiment (test/experiment/intelligence/reorganize.ts) certifies the table against `id.CBA.id` of pairRulesFromFibers and the round against a judge
 * round built on pairTones.
 *
 * A value is stored in a block of BLOCK_DIGITS slots as balanced ternary (least significant digit first), so a block
 * holds every integer in [-VALUE_LIMIT, VALUE_LIMIT]. No imports, exact integers, no random numbers.
 */

/** Pair index p = (a + 1) * 3 + (b + 1); entry p is the image pair. `id.CBA.id`: the sum-0 pairs 2 and 6 swap. */
export const STATIC_CARRIER: readonly number[] = [0, 1, 6, 3, 4, 5, 2, 7, 8]

export const BLOCK_DIGITS = 6

/** (3^6 - 1) / 2 */
export const VALUE_LIMIT = 364

export interface Register {
  spacing: number
  /** tones -1, 0, +1, one per cell */
  cells: number[]
  pairUpdates: number
  rounds: number
}

export function newRegister(spacing: number): Register {
  return { spacing, cells: [], pairUpdates: 0, rounds: 0 }
}

/** Cells needed for `slots` slots: up to the last slot's cell, plus one background cell after it. */
export function cellsFor(slots: number, spacing: number): number {
  return slots === 0 ? 0 : (slots - 1) * spacing + 2
}

export function grow(register: Register, slots: number): void {
  const need = cellsFor(slots, register.spacing)

  while (register.cells.length < need) {
    register.cells.push(0)
  }
}

export function writeCell(register: Register, slot: number, tone: number): void {
  register.cells[slot * register.spacing] = tone
}

export function readCell(register: Register, slot: number): number {
  return register.cells[slot * register.spacing] ?? 0
}

/** One round of `table` on `cells`, both brick colours, in place; returns the pair updates made. */
export function roundOn(cells: number[], table: readonly number[]): number {
  let updates = 0

  for (let color = 0; color < 2; color++) {
    for (let i = color; i + 1 < cells.length; i += 2) {
      const q = table[(cells[i]! + 1) * 3 + cells[i + 1]! + 1]!
      const low = q % 3

      cells[i] = (q - low) / 3 - 1
      cells[i + 1] = low - 1
      updates++
    }
  }

  return updates
}

export function round(register: Register): void {
  register.pairUpdates += roundOn(register.cells, STATIC_CARRIER)
  register.rounds++
}

/** The balanced-ternary digits of `value`, least significant first; null outside the block's range. */
export function digitsOf(value: number): number[] | null {
  if (!Number.isInteger(value) || value > VALUE_LIMIT || value < -VALUE_LIMIT) {
    return null
  }

  const digits: number[] = []

  let rest = value

  for (let k = 0; k < BLOCK_DIGITS; k++) {
    const r = ((rest % 3) + 3) % 3
    const digit = r === 2 ? -1 : r

    digits.push(digit)
    rest = (rest - digit) / 3
  }

  return digits
}

export function valueOf(digits: readonly number[]): number {
  let value = 0

  for (let k = digits.length - 1; k >= 0; k--) {
    value = value * 3 + digits[k]!
  }

  return value
}

/** A digest of a cell row: a polynomial over the tones, mod 2^31 - 1. */
export function cellDigest(cells: readonly number[]): number {
  let h = cells.length % 2_147_483_647

  for (const tone of cells) {
    h = (h * 3 + tone + 1) % 2_147_483_647
  }

  return h
}
