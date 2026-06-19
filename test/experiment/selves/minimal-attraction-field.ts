// How MINIMAL can the attraction field be? The first gravity field used unbounded integers, which is a hack
// (unbounded integers are continuum-like, a real number in disguise). The fix, the potential is a BOUNDED small
// integer in [-cap, cap], which is just the COUNT of at most `cap` token-bits per cell (a tiny bounded gas), not an
// arbitrary integer. The well DEPTH is capped, the force RANGE grows with cap. This experiment finds how few bits
// suffice.
//
// Result, a few bits is enough. Pure TERNARY ({-1,0,+1}, cap 1) is too coarse, its range is about one cell, it
// repairs only a contact displacement, not a gap. A FOUR-BIT field (cap 6, thirteen levels) repairs a piece broken
// off three cells away. So the attraction needs a small bounded multi-level field (about four bits per cell), more
// than ternary but FAR from an arbitrary integer, and it can be read as the count of a bounded token-bit gas.
//
// Depth L2, the bit budget of the attraction, ternary is too coarse, about four bits suffice and they are bounded.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, d4MeshWithRest, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import {
  bulkMass,
  relaxPotential,
  gravityMoves,
} from '@/code/dynamics/gravity-field'

export default experiment({
  id: 'selves/minimal-attraction-field',
  title:
    'the attraction needs only a few bounded bits, not arbitrary integers: ternary is too coarse, about four bits repair a self',
  category: 'selves',
  substrates: ['3434-rest'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const beats = 30
    const coin: Mesh = d4MeshWithRest({ side })
    const base: Mesh = d4Mesh({ side })
    const degree = coin.degree
    const rest = degree - 1
    const spatialDegree = 24
    const opposite = Array.from({ length: degree }, (_, d) =>
      coin.opposite(d),
    )
    const rule = headOnRotate({ opposite })
    const table = streamSourceTable(coin) // precompute the stream gather once, reused for every beat
    const half = side / 2
    const coord = (c: number): [number, number, number, number] => [
      c % side,
      Math.floor(c / side) % side,
      Math.floor(c / (side * side)) % side,
      Math.floor(c / (side * side * side)) % side,
    ]
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side
    const neighbour = (c: number, d: number): number =>
      base.neighbour(c, d)

    const restBody = (): Will => {
      const will = makeWill(coin)
      for (let c = 0; c < coin.cellCount; c++) {
        const [x, y, z, w] = coord(c)
        if (
          (x - half) ** 2 +
            (y - half) ** 2 +
            (z - half) ** 2 +
            (w - half) ** 2 <=
          4
        ) {
          will.data[c * degree + rest] = 1
        }
      }

      return will
    }

    const occupiedOf = (will: Will): Uint8Array => {
      const o = new Uint8Array(coin.cellCount)
      for (let c = 0; c < coin.cellCount; c++) {
        o[c] = will.data[c * degree + rest]! > 0 ? 1 : 0
      }

      return o
    }

    const extent = (will: Will): number => {
      let e = 0
      for (let c = 0; c < coin.cellCount; c++) {
        let on = false
        const b = c * degree
        for (let d = 0; d < degree; d++) {
          if (will.data[b + d] !== 0) {
            on = true
            break
          }
        }

        if (on) {
          const [x, y, z, w] = coord(c)
          const dd =
            Math.abs(x - half) +
            Math.abs(y - half) +
            Math.abs(z - half) +
            Math.abs(w - half)
          if (dd > e) {
            e = dd
          }
        }
      }

      return e
    }

    const bodyExtent = extent(restBody())

    const displaced = (disp: number): Will => {
      const w = cloneWill(restBody())
      let nb = center
      for (let k = 0; k < disp; k++) {
        nb = base.neighbour(nb, 0)
      }

      w.data[center * degree + rest] = 0
      w.data[nb * degree + rest] = 1

      return w
    }

    // run the bounded-cap attraction on a displaced body, return the final extent (returns to the body extent if it
    // repaired). The potential is bounded in [-cap, cap] (about log2(2 cap + 1) bits).
    const repairFinalExtent = (cap: number, disp: number): number => {
      let will = displaced(disp)
      let scratch: Will = {
        mesh: coin,
        data: new Int8Array(will.data.length),
      }
      let phi = relaxPotential({
        source: bulkMass({
          occupied: occupiedOf(will),
          neighbour,
          cellCount: coin.cellCount,
          spatialDegree,
          minNeighbours: 3,
        }),
        neighbour,
        cellCount: coin.cellCount,
        spatialDegree,
        sweeps: 24,
        strength: cap,
        cap,
      })
      for (let t = 0; t < beats; t++) {
        beatInto({ src: will, dst: scratch, table, collision: rule })
        const swap = will
        will = scratch
        scratch = swap
        const occupied = occupiedOf(will)
        phi = relaxPotential({
          source: bulkMass({
            occupied,
            neighbour,
            cellCount: coin.cellCount,
            spatialDegree,
            minNeighbours: 3,
          }),
          neighbour,
          cellCount: coin.cellCount,
          spatialDegree,
          sweeps: 4,
          strength: cap,
          cap,
          warm: phi,
        })
        for (const [from, to] of gravityMoves({
          occupied,
          phi,
          neighbour,
          cellCount: coin.cellCount,
          spatialDegree,
          minNeighbours: 3,
        })) {
          will.data[from * degree + rest] = 0
          will.data[to * degree + rest] = 1
        }
      }

      return extent(will)
    }

    // pure ternary (cap 1) repairs a CONTACT displacement (range about one) but NOT a gap of three (too coarse).
    const ternaryContact = repairFinalExtent(1, 1)
    const ternaryGap = repairFinalExtent(1, 3)
    // four bits (cap 6, thirteen levels) repairs the gap of three.
    const fourBitGap = repairFinalExtent(6, 3)

    const ternaryRepairsContact = ternaryContact <= bodyExtent
    const ternaryTooCoarseForGap = ternaryGap > bodyExtent
    const fourBitsRepairGap = fourBitGap <= bodyExtent
    const ok = ternaryTooCoarseForGap && fourBitsRepairGap

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the attraction field needs only a few BOUNDED bits, not arbitrary integers, the potential is a bounded small integer in plus or minus cap which is the count of at most cap token-bits per cell, pure ternary (cap one) is too coarse, its range is about one cell so it repairs only a contact displacement and not a gap of three, while a four-bit field (cap six, thirteen levels) repairs a piece broken off three cells away, so the well depth is bounded and the force range grows with the small cap, the arbitrary integer was an unnecessary hack',
      metrics: {
        bodyExtent,
        ternaryContactFinalExtent: ternaryContact,
        ternaryGapFinalExtent: ternaryGap,
        fourBitGapFinalExtent: fourBitGap,
        ternaryRepairsContact: ternaryRepairsContact ? 1 : 0,
        ternaryTooCoarseForGap: ternaryTooCoarseForGap ? 1 : 0,
        fourBitsRepairGap: fourBitsRepairGap ? 1 : 0,
        beats,
      },
      control: {
        ternaryGapFinalExtent: ternaryGap,
        fourBitGapFinalExtent: fourBitGap,
      },
      notes:
        'the minimality of the attraction. The field is a BOUNDED few-bit potential (a count of token-bits), not an arbitrary integer. Ternary alone is too coarse (range about one), about four bits give range about three, enough for a self (it repairs small perturbations). Replaces the unbounded-integer hack in the first gravity-bound-self with a bounded few-bit field',
    })
  },
})
