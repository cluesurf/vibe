// Coarse tone populations of a will, and how far the coarse dynamics of a rule is from commuting
// with a relabelling of the three tone values, block size by block size.
//
// A block is a b^4 cube of cells on a periodic 4D mesh of side L (b divides L). Its coarse variable
// is the tone population vector: the fractions of its b^4 x degree slots holding -1, 0 and +1. A
// relabelling pi of the three tone values (an element of S3, the Weyl group of SU(3)) acts on a will
// slot by slot and on a population vector by permuting its three entries.
//
// The rule's microscopic dynamics can break pi (E-FRC-0093 finds only the identity survives). The
// coarse question is whether the breaking survives coarse-graining: run the rule from a start s and
// from pi(s), coarse-grain both at block size b, and measure the total-variation distance between
// the populations of the relabelled run and the relabelled populations of the plain run,
//
//   D_b(t) = mean over blocks B of (1/2) | f_B(run(pi s), t) - pi f_B(run(s), t) |_1.
//
// D_b = 0 at every b for a rule that commutes with pi. A breaking that is irrelevant at long
// distance, the way lattice anisotropy is, would make D_b fall toward zero as b grows. A breaking
// that is coherent at every scale leaves D_b at the largest block, the whole mesh, a finite fraction
// of D_1. Every number here is an exact function of the start and the rule: no sampling.

import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { Will, cloneWill } from '@/code/tone/will'
import { LineRelabelling, relabelWill } from '@/code/check/tone-permutation-symmetry'

export type ToneRelabel = readonly [number, number, number]

// The tone counts of every cell, flat: out[3 * cell + (tone + 1)].
export function cellToneCounts(input: { will: Will }): Int32Array {
  const { will } = input
  const degree = will.mesh.degree
  const out = new Int32Array(3 * will.mesh.cellCount)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    for (let d = 0; d < degree; d++) {
      const k = 3 * cell + (will.data[cell * degree + d] ?? 0) + 1

      out[k] = (out[k] ?? 0) + 1
    }
  }

  return out
}

// The population fractions of every block of side `block`, from cell counts on a periodic 4D mesh
// of side `side`: out[3 * b + (tone + 1)], blocks indexed bx + P by + P^2 bz + P^3 bw with P = side /
// block. Cells are x + L y + L^2 z + L^3 w, as in d4Mesh.
export function blockToneFractions(input: {
  counts: Int32Array
  side: number
  block: number
  degree: number
}): Float64Array {
  const { counts, side, block, degree } = input
  const per = side / block
  const out = new Float64Array(3 * per ** 4)
  const cells = counts.length / 3
  const slotsPerBlock = block ** 4 * degree

  for (let cell = 0; cell < cells; cell++) {
    const x = cell % side
    const y = Math.floor(cell / side) % side
    const z = Math.floor(cell / (side * side)) % side
    const w = Math.floor(cell / (side * side * side)) % side
    const b =
      Math.floor(x / block) +
      per * (Math.floor(y / block) + per * (Math.floor(z / block) + per * Math.floor(w / block)))

    for (let v = 0; v < 3; v++) {
      out[3 * b + v] = (out[3 * b + v] ?? 0) + (counts[3 * cell + v] ?? 0)
    }
  }

  for (let k = 0; k < out.length; k++) {
    out[k] = (out[k] ?? 0) / slotsPerBlock
  }

  return out
}

// Permute a population field by a tone relabelling: the fraction of tone v moves to pi(v).
export function relabelFractions(input: {
  fractions: Float64Array
  relabel: ToneRelabel
}): Float64Array {
  const { fractions, relabel } = input
  const out = new Float64Array(fractions.length)

  for (let b = 0; b < fractions.length / 3; b++) {
    for (let v = 0; v < 3; v++) {
      out[3 * b + (relabel[v] ?? 0) + 1] = fractions[3 * b + v] ?? 0
    }
  }

  return out
}

// Mean over blocks of the total-variation distance between two population fields.
export function meanBlockDistance(input: { a: Float64Array; b: Float64Array }): number {
  const blocks = input.a.length / 3

  let total = 0

  for (let k = 0; k < input.a.length; k++) {
    total += Math.abs((input.a[k] ?? 0) - (input.b[k] ?? 0))
  }

  return total / (2 * blocks)
}

export type CoarseBreaking = {
  readonly relabel: ToneRelabel
  // D_b averaged over every start and every beat 1..beats, one per block size, in the order given
  readonly mean: number[]
}

// D_b for several relabellings (each the same on both ends of every line, so a relabelling of the
// tone values themselves), one schedule and a set of fixed starts on a periodic mesh of side
// `side`. The plain run of each start is shared by every relabelling.
export function coarseRelabellingBreaking(input: {
  starts: readonly Will[]
  schedule: (beatIndex: number) => Collision
  relabels: readonly ToneRelabel[]
  side: number
  blocks: readonly number[]
  beats: number
}): CoarseBreaking[] {
  const { starts, schedule, relabels, side, blocks, beats } = input
  const totals = relabels.map(() => blocks.map(() => 0))

  for (const start of starts) {
    const degree = start.mesh.degree
    const table = streamSourceTable(start.mesh)
    const runs = [
      start,
      ...relabels.map(relabel => {
        const relabelling: LineRelabelling = { leading: relabel, trailing: relabel }

        return relabelWill({ will: start, relabelling })
      }),
    ].map(will => ({ current: cloneWill(will), next: cloneWill(will) }))

    for (let t = 0; t < beats; t++) {
      for (const pair of runs) {
        beatInto({ src: pair.current, dst: pair.next, table, collision: schedule(t) })
        ;[pair.current, pair.next] = [pair.next, pair.current]
      }

      const counts = runs.map(pair => cellToneCounts({ will: pair.current }))

      blocks.forEach((block, i) => {
        const plain = blockToneFractions({ counts: counts[0] ?? new Int32Array(0), side, block, degree })

        relabels.forEach((relabel, r) => {
          const expected = relabelFractions({ fractions: plain, relabel })
          const actual = blockToneFractions({
            counts: counts[r + 1] ?? new Int32Array(0),
            side,
            block,
            degree,
          })
          const row = totals[r]

          if (row !== undefined) {
            row[i] = (row[i] ?? 0) + meanBlockDistance({ a: actual, b: expected })
          }
        })
      })
    }
  }

  return relabels.map((relabel, r) => ({
    relabel,
    mean: (totals[r] ?? []).map(total => total / (starts.length * beats)),
  }))
}

// A collision that turns every slot's tone one step round the cycle -1 -> 0 -> +1 -> -1. It commutes
// with the two 3-cycles of the tone values and breaks the three transpositions coherently at every
// scale (it turns a whole population vector the opposite way to its transposed image), the
// calibration of a breaking that cannot average out.
export const cycleTones: Collision = (slots, base, degree) => {
  for (let d = 0; d < degree; d++) {
    const k = base + d
    const tone = slots[k] ?? 0

    slots[k] = tone === 1 ? -1 : tone + 1
  }
}

// A collision that reverses a lone +1 on a line (a +1 with an empty opposite slot trades places
// with it) and leaves every other line state alone. At the scale of one cell it breaks every
// relabelling except exchanging 0 and +1 (which maps its condition to itself), yet it only moves
// tones between the slots of
// a cell, so every cell's populations are untouched by the collision and streaming only carries
// them to neighbours. The whole-mesh populations are therefore constant in time, and every
// relabelling commutes with them exactly: the calibration of a breaking that is real at the finest
// scale and gone at the coarsest.
export function reversePositive(input: { opposite: readonly number[] }): Collision {
  const lines: [number, number][] = []

  input.opposite.forEach((other, direction) => {
    if (direction < other) {
      lines.push([direction, other])
    }
  })

  return (slots, base) => {
    for (const [a, b] of lines) {
      const ta = slots[base + a] ?? 0
      const tb = slots[base + b] ?? 0

      if ((ta === 1 && tb === 0) || (ta === 0 && tb === 1)) {
        slots[base + a] = tb
        slots[base + b] = ta
      }
    }
  }
}
