// THE PARTIAL CONTACT (E-SPN-0101, first built as tmp/partial-contact-probe): a collision between 'pass' and 'bounce'
// for the doublet-locked knit with the no-veto store. On a dock, read the occupation (EMPTY, SINGLE, FULL lines), the
// singles' occupation momentum P (the sum of their roots) and w = w_P from the bounce table, as B does. Then:
//  - a full line turns (its two slots exchange), or keeps when it holds two LIKE vibes (the pass), exactly as 'pass'
//    treats B's docks;
//  - a non-full line L whose image w(L) is also non-full takes w on its slots (the set of such lines is closed under w,
//    since w is an involution on lines);
//  - every other line is left alone.
// It reads the occupation only (so it is covariant as B and K are), it is a slot permutation and an involution (the
// occupation classes and P are unchanged by it), and unlike K it NEVER carries a full (vacuum) line onto another line.
// Occupation momentum is NOT guaranteed by construction (w fixes P on all singles, not on the singles it moves): a
// tally counts the docks where the moved singles' momentum changed.
//
// The beat's collision is code/rule/occupation-veto-knit's with this piece in place of the bounce piece: the pair move
// ('none' veto) and this piece in the alternating order of code/rule/living-pair-knit collisionOrder.
//
// NOTHING MOVES: each slot takes the value the permutation hands it.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import {
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  momentumKey,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { pairPiece } from '@/code/rule/occupation-veto-knit'

const ROOTS = rootsD4()
const SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const PERM = new Int32Array(24)
const SV = new Int8Array(24)
const SP = new Int8Array(24)
const SO = new Uint8Array(24)

export type PartialTally = { scatters: number; momentumBreaks: number }

export const newPartialTally = (): PartialTally => ({
  scatters: 0,
  momentumBreaks: 0,
})

// the partial piece at one dock
export function partialPiece(
  c: Configuration,
  x: number,
  tally?: PartialTally,
): void {
  const base = x * 24

  let full = 0
  let single = 0

  const p = [0, 0, 0, 0]

  for (let l = 0; l < 12; l++) {
    const a = c.vibe[base + LINE_FIRSTS[l]!] !== 0
    const b = c.vibe[base + SECONDS[l]!] !== 0

    if (a && b) {
      full |= 1 << l
    } else if (a || b) {
      single |= 1 << l

      const r = ROOTS[a ? LINE_FIRSTS[l]! : SECONDS[l]!]!

      for (let k = 0; k < 4; k++) {
        p[k]! += r[k]!
      }
    }
  }

  if (full === 0 && single === 0) {
    return
  }

  const w = BOUNCE_TABLE[momentumKey(p)]

  let moved = false

  for (let d = 0; d < 24; d++) {
    const l = LINE_OF[d]!

    if ((full >> l) & 1) {
      PERM[d] =
        c.vibe[base + d] === c.vibe[base + OPPOSITE[d]!]
          ? d
          : OPPOSITE[d]!
    } else if (w && !((full >> LINE_OF[w[d]!]!) & 1)) {
      PERM[d] = w[d]!

      if (w[d] !== d && c.vibe[base + d] !== 0) {
        moved = true
      }
    } else {
      PERM[d] = d
    }
  }

  const before = [0, 0, 0, 0]
  const after = [0, 0, 0, 0]

  for (let d = 0; d < 24; d++) {
    SV[PERM[d]!] = c.vibe[base + d]!
    SP[PERM[d]!] = c.point[base + d]!
    SO[PERM[d]!] = c.open[base + d]!
  }

  for (let d = 0; d < 24; d++) {
    if (c.vibe[base + d] !== 0 && !((full >> LINE_OF[d]!) & 1)) {
      for (let k = 0; k < 4; k++) {
        before[k]! += ROOTS[d]![k]!
      }
    }

    c.vibe[base + d] = SV[d]!
    c.point[base + d] = SP[d]!
    c.open[base + d] = SO[d]!
  }

  for (let d = 0; d < 24; d++) {
    if (c.vibe[base + d] !== 0 && !((full >> LINE_OF[d]!) & 1)) {
      for (let k = 0; k < 4; k++) {
        after[k]! += ROOTS[d]![k]!
      }
    }
  }

  if (tally) {
    if (moved) {
      tally.scatters++
    }

    if (before.some((v, k) => v !== after[k])) {
      tally.momentumBreaks++
    }
  }
}

// the beat's collision with the partial piece: the no-veto pair move and the partial piece, alternating by beat
export function collidePartial(
  tables: LockedTables,
  c: Configuration,
  beat: number,
  tally?: PartialTally,
): void {
  for (let x = 0; x < tables.cells; x++) {
    for (const piece of collisionOrder('alternate', beat)) {
      if (piece === 'P') {
        pairPiece('none', c, x)
      } else {
        partialPiece(c, x, tally)
      }
    }
  }
}
