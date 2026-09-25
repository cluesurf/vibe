// The screen of a will: the coarse-graining that keeps, for every b^4 block of cells on a periodic D4
// mesh of side L, only the counts of its slots holding -1, 0 and +1 (code/coarse/tone-population), and
// forgets which slot holds which tone. Two questions are asked of it.
//
// HOW MANY-TO-ONE. A block of M = 24 b^4 slots with counts (n-, n0, n+) is the image of exactly
// M! / (n-! n0! n+!) microstates. The hidden information of a will at block size b is the log2 of the
// product of those multinomials over its blocks, per slot, counted exactly with a log-factorial table
// (no sampling). The visible information is the log2 of the number of distinct screen values a block
// can show, (M + 1)(M + 2) / 2, per slot, an upper bound on what the screen can carry.
//
// DOES THE SCREEN HAVE ITS OWN LAW. Take a will S and a will S' with the SAME screen at block size b
// but a different microstate: every block's slots, listed cell by cell and direction by direction, are
// cycled by a fixed shift, which moves tones between cells and directions and never between blocks.
// Run both with the same rule and measure D_b(t), the mean total-variation distance between their
// block populations. D_b = 0 at every beat would be a screen that evolves by its own law exactly. If
// the unseen detail acts only as independent fluctuations, D_b falls as the inverse square root of the
// slots per block, b^-2 on a 4D mesh. If the rule reads a hidden variable the shift changes
// coherently, D_b does not fall with b at all.

import { Will, cloneWill, makeWill } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import {
  blockToneFractions,
  cellToneCounts,
  meanBlockDistance,
} from '@/code/coarse/tone-population'

// The slot indices of every block, in a fixed order: cells of the block by (x, y, z, w) lexicographic
// within the block, and within a cell its directions in order. blocks[b] lists block b's slots.
export function blockSlots(input: { side: number; block: number; degree: number }): Int32Array[] {
  const { side, block, degree } = input
  const per = side / block
  const out: Int32Array[] = []

  for (let bw = 0; bw < per; bw++) {
    for (let bz = 0; bz < per; bz++) {
      for (let by = 0; by < per; by++) {
        for (let bx = 0; bx < per; bx++) {
          const slots = new Int32Array(block ** 4 * degree)

          let k = 0

          for (let w = 0; w < block; w++) {
            for (let z = 0; z < block; z++) {
              for (let y = 0; y < block; y++) {
                for (let x = 0; x < block; x++) {
                  const cell =
                    bx * block + x + side * (by * block + y + side * (bz * block + z + side * (bw * block + w)))

                  for (let d = 0; d < degree; d++) {
                    slots[k++] = cell * degree + d
                  }
                }
              }
            }
          }

          out.push(slots)
        }
      }
    }
  }

  return out
}

// The shift used inside a block of M slots: the nearest integer to M times the golden section, nudged
// off every multiple of the coin degree so that it always moves tones between directions.
export function goldenShift(input: { slots: number; degree: number }): number {
  const { slots, degree } = input

  let shift = Math.round((slots * (Math.sqrt(5) - 1)) / 2)

  while (shift % degree === 0 || shift % slots === 0) {
    shift++
  }

  return shift % slots
}

// S' from S: every block's slot contents cycled by the golden shift. Block populations are unchanged
// exactly, and so is every coarser screen whose blocks are unions of these.
export function permuteWithinBlocks(input: { will: Will; side: number; block: number }): Will {
  const { will, side, block } = input
  const degree = will.mesh.degree
  const out = cloneWill(will)
  const shift = goldenShift({ slots: block ** 4 * degree, degree })

  for (const slots of blockSlots({ side, block, degree })) {
    const m = slots.length

    for (let k = 0; k < m; k++) {
      out.data[slots[(k + shift) % m] ?? 0] = will.data[slots[k] ?? 0] ?? 0
    }
  }

  return out
}

// log2 n! for n = 0..max, summed exactly term by term.
export function log2Factorials(max: number): Float64Array {
  const table = new Float64Array(max + 1)

  for (let n = 1; n <= max; n++) {
    table[n] = (table[n - 1] ?? 0) + Math.log2(n)
  }

  return table
}

export type ScreenCount = {
  readonly block: number
  // log2 of the number of microstates with the observed screen, per slot
  readonly hiddenBitsPerSlot: number
  // log2 of the number of screen values a block can show, per slot
  readonly visibleBitsPerSlot: number
  // the multinomial ratio in the limit of large blocks: the Shannon entropy of the mean block populations
  readonly entropyBoundPerSlot: number
}

// The exact many-to-one count of the screen of `will` at block size `block`.
export function screenCount(input: { will: Will; side: number; block: number }): ScreenCount {
  const { will, side, block } = input
  const degree = will.mesh.degree
  const m = block ** 4 * degree
  const table = log2Factorials(m)
  const counts = cellToneCounts({ will })
  const fractions = blockToneFractions({ counts, side, block, degree })
  const blocks = fractions.length / 3

  let hidden = 0
  let entropy = 0

  for (let b = 0; b < blocks; b++) {
    const n = [0, 1, 2].map(v => Math.round((fractions[3 * b + v] ?? 0) * m))

    hidden += (table[m] ?? 0) - n.reduce((s, x) => s + (table[x] ?? 0), 0)
    entropy -= n.reduce((s, x) => (x > 0 ? s + (x / m) * Math.log2(x / m) : s), 0) * m
  }

  return {
    block,
    hiddenBitsPerSlot: hidden / (blocks * m),
    visibleBitsPerSlot: Math.log2(((m + 1) * (m + 2)) / 2) / m,
    entropyBoundPerSlot: entropy / (blocks * m),
  }
}

// A hash start in local equilibrium with a macroscopic profile: slot i is nonzero with the probability
// active(x) = mean + contrast cos(2 pi x / L) (x its cell's first coordinate), and then +1 or -1 by a
// second hash bit. With `paired`, the same slot marginals are laid down LINE by line instead: a line
// (d, -d) is (s, -s) with probability active(x), else (0, 0), so every line carries a hidden
// correlation the populations do not show.
export function profiledStart(input: {
  mesh: Mesh
  side: number
  mean: number
  contrast: number
  phase?: number
  salt: number
  paired?: boolean
  // a slot left at 0 in every cell, the hidden variable the gated calibration reads
  emptySlot?: number
}): Will {
  const { mesh, side, mean, contrast, salt } = input
  const phase = input.phase ?? 0
  const degree = mesh.degree
  const will = makeWill(mesh)
  const opposite: number[] = []

  for (let d = 0; d < degree; d++) {
    opposite.push(mesh.opposite(d))
  }

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % side
    const active = mean + contrast * Math.cos((2 * Math.PI * x) / side + phase)

    for (let d = 0; d < degree; d++) {
      const i = cell * degree + d

      if (input.paired === true) {
        const other = opposite[d] ?? d

        if (d > other) {
          continue
        }

        if (hashRand(i, 0, salt) < active) {
          const sign = hashRand(i, 1, salt) < 0.5 ? 1 : -1

          will.data[i] = sign
          will.data[cell * degree + other] = -sign
        }
      } else if (d !== input.emptySlot && hashRand(i, 0, salt) < active) {
        will.data[i] = hashRand(i, 1, salt) < 0.5 ? 1 : -1
      }
    }
  }

  return will
}

// The non-autonomous calibration: when slot `gate` of a cell holds 0, every other slot's tone turns one
// step round -1 -> 0 -> +1 -> -1, otherwise nothing happens. Reversible (the gate is never touched) and
// a pure function of one hidden slot, so a start whose gate slots are all empty and a same-screen copy
// whose gate slots are not evolve different populations at every block size.
export function gatedCycle(input: { gate: number }): Collision {
  const { gate } = input

  return (slots, base, degree) => {
    if ((slots[base + gate] ?? 0) !== 0) {
      return
    }

    for (let d = 0; d < degree; d++) {
      if (d !== gate) {
        const tone = slots[base + d] ?? 0

        slots[base + d] = tone === 1 ? -1 : tone + 1
      }
    }
  }
}

// The cell tone counts of a run at beats 1..beats.
export function countSeries(input: {
  start: Will
  beats: number
  schedule: (beatIndex: number) => Collision
}): Int32Array[] {
  const { start, beats, schedule } = input
  const table = streamSourceTable(start.mesh)

  let current = cloneWill(start)
  let next = makeWill(start.mesh)

  const out: Int32Array[] = []

  for (let t = 0; t < beats; t++) {
    beatInto({ src: current, dst: next, table, collision: schedule(t) })
    ;[current, next] = [next, current]
    out.push(cellToneCounts({ will: current }))
  }

  return out
}

// D_b(t) against a stored reference count series, at one block size.
export function disagreementWith(input: {
  reference: readonly Int32Array[]
  will: Will
  side: number
  block: number
  schedule: (beatIndex: number) => Collision
}): number[] {
  const { reference, will, side, block, schedule } = input

  return countDisagreement({
    a: countSeries({ start: will, beats: reference.length, schedule }),
    b: reference,
    side,
    block,
    degree: will.mesh.degree,
  })
}

// D_b(t) between two stored count series.
export function countDisagreement(input: {
  a: readonly Int32Array[]
  b: readonly Int32Array[]
  side: number
  block: number
  degree: number
}): number[] {
  const { a, b, side, block, degree } = input

  return a.map((c, t) =>
    meanBlockDistance({
      a: blockToneFractions({ counts: c, side, block, degree }),
      b: blockToneFractions({ counts: b[t] ?? new Int32Array(0), side, block, degree }),
    }),
  )
}

// The same-screen disagreement at each block size: S against S' permuted within blocks of that size,
// measured at that size, averaged over beats 1..beats. The run of S is shared.
export function sameScreenDisagreement(input: {
  start: Will
  side: number
  blocks: readonly number[]
  beats: number
  schedule: (beatIndex: number) => Collision
}): { block: number; mean: number; series: number[] }[] {
  const { start, side, blocks, beats, schedule } = input
  const reference = countSeries({ start, beats, schedule })

  return blocks.map(block => {
    const series = disagreementWith({
      reference,
      will: permuteWithinBlocks({ will: start, side, block }),
      side,
      block,
      schedule,
    })

    return { block, mean: series.reduce((s, v) => s + v, 0) / Math.max(1, series.length), series }
  })
}
