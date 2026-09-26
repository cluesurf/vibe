// The apparatus of the relational record (E-QTM-0135) taken from the knit itself: the pieces E-QTM-0137 to
// E-QTM-0139 share.
//
// E-QTM-0135's measurement is the reflection R through the frame direction on a love-love-fear triple, on
// stored points (code/measure/frame-covariant-meeting)
//
//   system x1' = x1 - x2 + x3,   record x2' = -x1 + x2 + x3,   reference x3' = -x1 - x2,
//
// with the record (a love) and the reference (a fear, at its stored point) OPENED on one line l, a stand-in:
// the pair's weight is 1 on each of the 9 joint points of l x l. Written in the pair's two points, R moves
// the system by the pair's color content u = x3 - x2 and writes the record at x2 + x3 - x1. So a pair held
// at ONE joint point (sr, sf) of l x l, a classical member of the stand-in, already writes the record: its
// label along l's direction d is [d, sr] + [d, sf] - [d, x1] = 2 [d, l] - [d, x1], the stand-in's bijection,
// for every one of the 9 members. What one member does not do is spread the system along d: it moves it by
// sf - sr, one point. The stand-in's flattening is the count over its 9 members, whose color contents are
// 0, d and 2 d three times each.
//
// Pieces:
// - LINES, LABEL, lineLabel, lineThrough: the 12 lines with their class, the label [d_c, x], the line
//   through two points
// - reflectionTable: R's table on the 729 stored joint points of a love-love-fear triple
// - memberRecord: the record, reference and system points one member writes, from R's formula
// - kernelNormBad, keepsDifference, keepsSum: exact checks of a meeting kernel (4 K or 3 K in integers)
// - meetThree: a two-token kernel applied to two of three coordinates (Float64, for the helper search)
//
// Deterministic and exact: integer tables, BigInt where a whole is read. The helper search is Float64 with a
// 1e-9 tolerance on an answer that is either 0 or at least 1/81 away.

import { type ColorWeave } from '@/code/rule/color-weave'
import { fearBeat, makeLattice, GRID_OF_PHASE } from '@/code/rule/fear-weave'
import { LINE_CLASSES } from '@/code/measure/sum-record'
import { addPoints, applyStoredLinear, frameReflection, pointForm, scalePoint } from '@/code/measure/frame-covariant-meeting'

export const directionPoint = (c: number): number => 3 * (LINE_CLASSES[c]?.direction[0] ?? 0) + (LINE_CLASSES[c]?.direction[1] ?? 0)

// LABEL[9 c + x] = [d_c, x]
export const LABEL = Int8Array.from({ length: 36 }, (_, k) => pointForm(directionPoint(Math.floor(k / 9)), k % 9))

export type ClassedLine = { readonly c: number; readonly points: readonly number[] }

// the 12 lines as (class, sorted points), classes in LINE_CLASSES order (role, tilt, diagonal, antidiagonal)
export const LINES: readonly ClassedLine[] = LINE_CLASSES.flatMap((c, ci) => c.lines.map(points => ({ c: ci, points: [...points] })))

export const lineLabel = (l: ClassedLine): number => LABEL[9 * l.c + (l.points[0] ?? 0)] ?? 0

// the line through two different points, sorted
export const lineThrough = (p: number, q: number): number[] =>
  [0, 1, 2].map(s => addPoints(p, scalePoint(s, addPoints(q, scalePoint(2, p))))).sort((a, b) => a - b)

// the index into LINES of the line through p != q
export function lineIndexThrough(p: number, q: number): number {
  const points = lineThrough(p, q)

  return LINES.findIndex(l => l.points.every((x, i) => x === points[i]))
}

// R's table on the 729 stored joint points of love-love-fear, index 81 x1 + 9 x2 + x3
export function reflectionTable(): Int16Array {
  const r = frameReflection([1, 1, -1])!
  const out = [0, 0, 0]
  const table = new Int16Array(729)

  for (let j = 0; j < 729; j++) {
    applyStoredLinear(r, [Math.floor(j / 81), Math.floor(j / 9) % 9, j % 9], out)
    table[j] = 81 * (out[0] ?? 0) + 9 * (out[1] ?? 0) + (out[2] ?? 0)
  }

  return table
}

// what one classical member (record at sr, reference stored at sf) writes for a system point x
export function memberRecord(x: number, sr: number, sf: number): { system: number; record: number; reference: number } {
  const neg = (p: number): number => scalePoint(2, p)

  return {
    system: addPoints(x, addPoints(sf, neg(sr))),
    record: addPoints(addPoints(sr, sf), neg(x)),
    reference: neg(addPoints(x, sr)),
  }
}

// the number of (column, column') pairs where K^T K differs from D^2 times the identity: 0 for the Wigner
// kernel of a unitary, which keeps the sum of squared weights
export function kernelNormBad(kernel: readonly (readonly number[])[], divisor: number): number {
  let bad = 0

  for (let c = 0; c < 81; c++) {
    for (let e = c; e < 81; e++) {
      let s = 0

      for (let r = 0; r < 81; r++) {
        s += (kernel[r]?.[c] ?? 0) * (kernel[r]?.[e] ?? 0)
      }

      bad += s === (c === e ? divisor * divisor : 0) ? 0 : 1
    }
  }

  return bad
}

// nonzero entries of a two-token kernel that change the stored difference y - x (keepsDifference) or the
// sum x + y (keepsSum)
export function differenceBreaks(kernel: readonly (readonly number[])[]): number {
  let bad = 0

  for (let r = 0; r < 81; r++) {
    for (let c = 0; c < 81; c++) {
      if ((kernel[r]?.[c] ?? 0) !== 0) {
        const d1 = addPoints(r % 9, scalePoint(2, Math.floor(r / 9)))
        const d0 = addPoints(c % 9, scalePoint(2, Math.floor(c / 9)))

        bad += d1 === d0 ? 0 : 1
      }
    }
  }

  return bad
}

export function sumBreaks(kernel: readonly (readonly number[])[]): number {
  let bad = 0

  for (let r = 0; r < 81; r++) {
    for (let c = 0; c < 81; c++) {
      if ((kernel[r]?.[c] ?? 0) !== 0) {
        bad += addPoints(r % 9, Math.floor(r / 9)) === addPoints(c % 9, Math.floor(c / 9)) ? 0 : 1
      }
    }
  }

  return bad
}

// entries where a kernel differs from itself with both coordinates translated by v, over all 9 v, or moved
// by a linear map M (as a table on the phase index) on both
export function diagonalCovarianceBad(kernel: readonly (readonly number[])[], maps: readonly (readonly number[])[]): number {
  let bad = 0

  for (const m of maps) {
    for (let r = 0; r < 81; r++) {
      const mr = 9 * (m[Math.floor(r / 9)] ?? 0) + (m[r % 9] ?? 0)

      for (let c = 0; c < 81; c++) {
        const mc = 9 * (m[Math.floor(c / 9)] ?? 0) + (m[c % 9] ?? 0)

        bad += (kernel[mr]?.[mc] ?? 0) === (kernel[r]?.[c] ?? 0) ? 0 : 1
      }
    }
  }

  return bad
}

// a two-token kernel (as a flat Float64Array of K itself) applied to coordinates a, b of a three-token vector
export function meetThree(w: Float64Array, a: number, b: number, kernel: Float64Array): Float64Array {
  const sa = 9 ** (2 - a)
  const sb = 9 ** (2 - b)
  const sc = 9 ** (2 - (3 - a - b))
  const out = new Float64Array(729)

  for (let z = 0; z < 9; z++) {
    for (let r = 0; r < 81; r++) {
      let m = 0

      for (let c = 0; c < 81; c++) {
        const kv = kernel[r * 81 + c] ?? 0

        if (kv !== 0) {
          m += kv * (w[Math.floor(c / 9) * sa + (c % 9) * sb + z * sc] ?? 0)
        }
      }

      out[Math.floor(r / 9) * sa + (r % 9) * sb + z * sc] = m
    }
  }

  return out
}

// An apparatus's own history on the color weave: a love and a fear placed on two slots of the lattice (the
// rest as `vibe` gives it), run by the knit's classical layer. The knit never reads a point, so each token's
// point after t beats is its start point moved by the grid moves of the links it crossed: `moves` holds, per
// beat, the two accumulated moves as tables on the PHASE index (9 entries each, love then fear), and
// `valid` whether the two tokens still hold a love and a fear. `points` is the lattice's start points
// (grid index), only so a caller can check that nothing depends on them.
export function apparatusHistory(input: {
  weave: ColorWeave
  vibe: Int8Array
  love: number
  fear: number
  beats: number
  points?: Int8Array
}): { moves: Int8Array; valid: Uint8Array; finalPoints: Int8Array } {
  const { weave, love, fear, beats } = input
  const slots = weave.mesh.cellCount * 24
  const open = new Uint8Array(slots)

  open[love] = 1
  open[fear] = 1

  let lattice = makeLattice({ vibe: input.vibe, point: input.points ?? new Int8Array(slots) })
  const grid = [Int8Array.from({ length: 9 }, (_, i) => i), Int8Array.from({ length: 9 }, (_, i) => i)]
  const moves = new Int8Array(beats * 18)
  const valid = new Uint8Array(beats)
  const where = new Int32Array(slots)

  for (let t = 0; t < beats; t++) {
    const r = fearBeat({ weave, links: weave.links, lattice, open, t })

    lattice = r.lattice

    for (const [tk, g] of r.record.crossings) {
      const k = tk === love ? 0 : tk === fear ? 1 : -1
      const move = weave.moves.act[g]

      if (k >= 0 && move) {
        const acc = grid[k]!

        for (let p = 0; p < 9; p++) {
          acc[p] = move[acc[p] ?? p] ?? 0
        }
      }
    }

    lattice.token.forEach((tk, slot) => {
      where[tk] = slot
    })
    valid[t] = lattice.vibe[where[love] ?? 0] === 1 && lattice.vibe[where[fear] ?? 0] === -1 ? 1 : 0

    for (let k = 0; k < 2; k++) {
      for (let q = 0; q < 9; q++) {
        // phase q -> grid -> moved -> phase
        moves[t * 18 + 9 * k + q] = GRID_OF_PHASE[grid[k]![GRID_OF_PHASE[q] ?? 0] ?? 0] ?? 0
      }
    }
  }

  return { moves, valid, finalPoints: lattice.point }
}
