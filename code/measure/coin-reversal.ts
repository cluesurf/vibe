// The working rule's beat rebuilt from its pieces, with the coin moved, split or switched off, for the motion reversal
// check of item vibe-roadmap-grounding-0014 (E-FND-0179). Nothing here changes the rule: the coin-before order with
// every piece on is the working rule (code/rule/value-phase valueBeat on code/rule/coined-locked-knit coinedVetoBeat,
// veto 'none'), and E-FND-0179's G0 checks it bit for bit.
//
// THE PIECES of one beat t, each dock-local except the stream:
//   W     the value phase zeta6^n (code/rule/value-phase), read on the configuration it multiplies
//   C     the coin (coinBranch): a line holding one open vibe keeps (1 + w)/2 or crosses (1 - w)/2, two open vibes w
//   D     the coin's square root on every line: keep (2 + w)/2, cross -w/2, two open vibes zeta6 = 1 + w. D D = C
//   Y_t   the like meeting (open vibes only), then beat t's collision (the pair move P and the bounce B in the order of
//         collisionOrder('alternate', t))
//   S     the stream
// THE ORDERS (right to left is time order inside one beat):
//   'before'  U_t = S W Y_t C W     the working rule
//   'after'   U_t = S W C Y_t W     the coin after the collision
//   'split'   U_t = S W D Y_t D W   the coin split around the collision, a palindrome
//   'none'    U_t = S W Y_t W       no coin
// Each piece has an exact inverse; a beat's inverse runs them backwards.
//
// NOTHING MOVES: every piece relabels which slot holds which value, or multiplies an amplitude.

import {
  coinBranch,
  halfCoinBranch,
} from '@/code/rule/coined-locked-knit'
import {
  mergeBranches,
  streamConfiguration,
  times,
  type Branch,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  coinPiece as bouncePiece,
  meetBranch,
  pairPiece,
} from '@/code/rule/occupation-veto-knit'
import {
  valueExponent,
  type ValuePiece,
} from '@/code/rule/value-phase'

export type CoinOrder = 'before' | 'after' | 'split' | 'none'

export type Switches = {
  readonly meeting: boolean
  readonly pair: boolean
  readonly bounce: boolean
}

export const ALL_ON: Switches = { meeting: true, pair: true, bounce: true }

export const cloneBranch = (b: Branch): Branch => ({
  vibe: Int8Array.from(b.vibe),
  point: Int8Array.from(b.point),
  open: Uint8Array.from(b.open),
  store: Int8Array.from(b.store),
  spoint: Int8Array.from(b.spoint),
  sopen: Uint8Array.from(b.sopen),
  a: b.a,
  b: b.b,
  k: b.k,
})

export const cloneState = (s: LockedState): LockedState => ({
  branches: s.branches.map(cloneBranch),
})

// ---- W ----

export function valueStep(
  piece: ValuePiece,
  tables: LockedTables,
  s: LockedState,
  inverse: boolean,
): LockedState {
  if (piece.kind === 'off') {
    return s
  }

  const out = cloneState(s)

  for (const br of out.branches) {
    const n = valueExponent(piece, tables, br)
    const m = ((((inverse ? -n : n) % 6) + 6) % 6)

    for (let i = 0; i < m; i++) {
      times(br, 1n, 1n)
    }
  }

  return out
}

// ---- C and D ----

export function coinStep(
  tables: LockedTables,
  s: LockedState,
  inverse: boolean,
): LockedState {
  const out: Branch[] = []

  for (const br of s.branches) {
    out.push(...coinBranch(tables.cells, cloneBranch(br), inverse))
  }

  return { branches: mergeBranches(out) }
}

// D = C^(1/2): the rule's own half coin (code/rule/coined-locked-knit halfCoinBranch)
export function halfCoinStep(
  tables: LockedTables,
  s: LockedState,
  inverse: boolean,
): LockedState {
  const out: Branch[] = []

  for (const br of s.branches) {
    out.push(...halfCoinBranch(tables.cells, cloneBranch(br), inverse))
  }

  return { branches: mergeBranches(out) }
}

// ---- Y_t ----

function collide(
  tables: LockedTables,
  br: Branch,
  beat: number,
  inverse: boolean,
  sw: Switches,
): void {
  const order = collisionOrder('alternate', beat)
  const pieces = inverse ? [...order].reverse() : order

  for (let x = 0; x < tables.cells; x++) {
    for (const piece of pieces) {
      if (piece === 'P') {
        if (sw.pair) {
          pairPiece('none', br, x)
        }
      } else if (sw.bounce) {
        bouncePiece(tables, br, x)
      }
    }
  }
}

export function collisionStep(
  tables: LockedTables,
  s: LockedState,
  beat: number,
  inverse: boolean,
  sw: Switches = ALL_ON,
): LockedState {
  const out: Branch[] = []

  for (const br of s.branches) {
    if (!inverse) {
      for (const b of sw.meeting ? meetBranch(cloneBranch(br), tables.cells, false) : [cloneBranch(br)]) {
        collide(tables, b, beat, false, sw)
        out.push(b)
      }
    } else {
      const b = cloneBranch(br)

      collide(tables, b, beat, true, sw)
      out.push(...(sw.meeting ? meetBranch(b, tables.cells, true) : [b]))
    }
  }

  return { branches: mergeBranches(out) }
}

// ---- S ----

export function streamStep(
  tables: LockedTables,
  s: LockedState,
  inverse: boolean,
): LockedState {
  const out = cloneState(s)

  for (const br of out.branches) {
    streamConfiguration(tables, br, inverse)
  }

  return out
}

// ---- one beat, and its inverse ----

type Step = (s: LockedState) => LockedState

function piecesOf(
  order: CoinOrder,
  piece: ValuePiece,
  tables: LockedTables,
  beat: number,
  sw: Switches,
  inverse: boolean,
): Step[] {
  const w: Step = s => valueStep(piece, tables, s, inverse)
  const c: Step = s => coinStep(tables, s, inverse)
  const d: Step = s => halfCoinStep(tables, s, inverse)
  const y: Step = s => collisionStep(tables, s, beat, inverse, sw)
  const block: Step[] =
    order === 'before'
      ? [c, y]
      : order === 'after'
        ? [y, c]
        : order === 'split'
          ? [d, y, d]
          : [y]
  const forward = [w, ...block, w]

  return inverse ? [...forward].reverse() : forward
}

export function orderBeat(
  order: CoinOrder,
  piece: ValuePiece,
  tables: LockedTables,
  s: LockedState,
  beat: number,
  sw: Switches = ALL_ON,
): LockedState {
  let out = s

  for (const step of piecesOf(order, piece, tables, beat, sw, false)) {
    out = step(out)
  }

  return streamStep(tables, out, false)
}

export function orderBeatBack(
  order: CoinOrder,
  piece: ValuePiece,
  tables: LockedTables,
  s: LockedState,
  beat: number,
  sw: Switches = ALL_ON,
): LockedState {
  let out = streamStep(tables, s, true)

  for (const step of piecesOf(order, piece, tables, beat, sw, true)) {
    out = step(out)
  }

  return out
}

// the coin and the beat's dock block Y_t on a state: [C Y_t psi, Y_t C psi] (each in time order: the right one first)
export function coinCommutator(
  tables: LockedTables,
  s: LockedState,
  beat: number,
  sw: Switches = ALL_ON,
): { yThenC: LockedState; cThenY: LockedState } {
  return {
    yThenC: coinStep(tables, collisionStep(tables, s, beat, false, sw), false),
    cThenY: collisionStep(tables, coinStep(tables, s, false), beat, false, sw),
  }
}
