// The attraction field as TERNARY TONES (plans/ternary-field-encoding). The first gravity field was a separate
// unbounded integer, a bolt-on, not part of the tone substrate. This shows the field is just TONES, as few as ONE
// ternary trit per cell. The potential phi is bounded to [-cap, cap], which is `ceil(log3(2 cap + 1))` balanced
// trits, the same {-1, 0, +1} primitive matter and radiation are made of. No bits, no unbounded integers.
//
// Measured here, a SINGLE trit (cap 1, phi in {-1, 0, +1}) repairs a piece displaced one or two cells (range 2),
// and THREE trits (cap 6) extend the range to three. A self only needs to repair small perturbations, so even a
// one-trit field is a working attraction. The force range grows with the trit count.
//
// So the attraction field lives in the tone substrate as a few ternary tones per cell, not a side integer. This is
// the vibe-native encoding, and binary plays no role, the trit carries meaning (pain, peace, pleasure), a bit does
// not.
//
// Depth L2, the attraction field encoded in ternary trits, one trit gives range 2, three trits range 3.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, d4MeshWithRest, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { bulkMass, relaxPotential, gravityMoves } from '@/code/dynamics/gravity-field'

export default experiment({
  id: 'selves/ternary-field-attraction',
  title: 'the attraction field is ternary tones: one trit per cell repairs range 2, three trits range 3 (no bits, no unbounded integers)',
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
    const opposite = Array.from({ length: degree }, (_, d) => coin.opposite(d))
    const rule = headOnRotate({ opposite })
    const table = streamSourceTable(coin) // precompute the stream gather once, reused for every beat
    const half = side / 2
    const coord = (c: number): [number, number, number, number] => [c % side, Math.floor(c / side) % side, Math.floor(c / (side * side)) % side, Math.floor(c / (side * side * side)) % side]
    const center = half + half * side + half * side * side + half * side * side * side
    const neighbour = (c: number, d: number): number => base.neighbour(c, d)
    const tritsFor = (cap: number): number => Math.round(Math.log(2 * cap + 1) / Math.log(3) + 0.49)

    const restBody = (): Will => { const will = makeWill(coin); for (let c = 0; c < coin.cellCount; c++) { const [x, y, z, w] = coord(c); if ((x - half) ** 2 + (y - half) ** 2 + (z - half) ** 2 + (w - half) ** 2 <= 4) will.data[c * degree + rest] = 1 } return will }
    const occupiedOf = (will: Will): Uint8Array => { const o = new Uint8Array(coin.cellCount); for (let c = 0; c < coin.cellCount; c++) o[c] = will.data[c * degree + rest]! > 0 ? 1 : 0; return o }
    const extent = (will: Will): number => { let e = 0; for (let c = 0; c < coin.cellCount; c++) { let on = false; const b = c * degree; for (let d = 0; d < degree; d++) if (will.data[b + d] !== 0) { on = true; break } if (on) { const [x, y, z, w] = coord(c); const dd = Math.abs(x - half) + Math.abs(y - half) + Math.abs(z - half) + Math.abs(w - half); if (dd > e) e = dd } } return e }
    const bodyExtent = extent(restBody())

    // run the cap-bounded (few-trit) attraction on a displaced body, return the final extent (returns to bodyExtent
    // if repaired). phi is bounded in [-cap, cap], i.e. ceil(log3(2 cap + 1)) balanced trits per cell.
    const repairFinalExtent = (cap: number, disp: number): number => {
      let will = cloneWill(restBody())
      let nb = center
      for (let k = 0; k < disp; k++) nb = base.neighbour(nb, 0)
      will.data[center * degree + rest] = 0
      will.data[nb * degree + rest] = 1
      let scratch: Will = { mesh: coin, data: new Int8Array(will.data.length) }
      let phi = relaxPotential({ source: bulkMass({ occupied: occupiedOf(will), neighbour, cellCount: coin.cellCount, spatialDegree, minNeighbours: 3 }), neighbour, cellCount: coin.cellCount, spatialDegree, sweeps: 24, strength: cap, cap })
      for (let t = 0; t < beats; t++) {
        beatInto({ src: will, dst: scratch, table, collision: rule })
        const swap = will
        will = scratch
        scratch = swap
        const occupied = occupiedOf(will)
        phi = relaxPotential({ source: bulkMass({ occupied, neighbour, cellCount: coin.cellCount, spatialDegree, minNeighbours: 3 }), neighbour, cellCount: coin.cellCount, spatialDegree, sweeps: 4, strength: cap, cap, warm: phi })
        for (const [from, to] of gravityMoves({ occupied, phi, neighbour, cellCount: coin.cellCount, spatialDegree, minNeighbours: 3 })) { will.data[from * degree + rest] = 0; will.data[to * degree + rest] = 1 }
      }
      return extent(will)
    }

    // one trit (cap 1, pure ternary) repairs displacements one and two (range 2).
    const oneTritDisp1 = repairFinalExtent(1, 1)
    const oneTritDisp2 = repairFinalExtent(1, 2)
    const oneTritDisp3 = repairFinalExtent(1, 3)
    // three trits (cap 6) extend the range to three.
    const threeTritDisp3 = repairFinalExtent(6, 3)

    const oneTritRepairsRange2 = oneTritDisp1 <= bodyExtent && oneTritDisp2 <= bodyExtent
    const oneTritFiniteRange = oneTritDisp3 > bodyExtent // honest, one trit does not reach range three
    const threeTritsRepairRange3 = threeTritDisp3 <= bodyExtent
    const ok = oneTritRepairsRange2 && threeTritsRepairRange3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the attraction field is ternary tones, not a side integer and not bits, a SINGLE ternary trit per cell (the potential bounded to {-1, 0, +1}) repairs a piece displaced one or two cells (range two), and THREE trits extend the range to three, the field stores in ceil(log3(2 cap + 1)) balanced trits, the same {-1, 0, +1} primitive matter and radiation are made of, so the attraction lives fully in the tone substrate with no bits and no unbounded integers, the force range grows with the trit count and even one trit is a working attraction since a self only repairs small perturbations',
      metrics: {
        bodyExtent,
        oneTritTrits: tritsFor(1),
        oneTritDisp1FinalExtent: oneTritDisp1,
        oneTritDisp2FinalExtent: oneTritDisp2,
        oneTritDisp3FinalExtent: oneTritDisp3,
        threeTritTrits: tritsFor(6),
        threeTritDisp3FinalExtent: threeTritDisp3,
        oneTritRepairsRange2: oneTritRepairsRange2 ? 1 : 0,
        oneTritFiniteRange: oneTritFiniteRange ? 1 : 0,
        threeTritsRepairRange3: threeTritsRepairRange3 ? 1 : 0,
        beats,
      },
      control: { oneTritDisp3FinalExtent: oneTritDisp3, threeTritDisp3FinalExtent: threeTritDisp3 },
      notes:
        'the attraction field encoded in the tone substrate as a few balanced trits per cell. One trit (pure ternary) gives range 2, three trits range 3. No bits, no unbounded integers. This is the vibe-native encoding, the trit carries meaning (pain, peace, pleasure) where a bit does not. The next rungs are a diffusing graviton tone gas and the active-vacuum density (plans/ternary-field-encoding)',
    })
  },
})
