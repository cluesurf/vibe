// Rung 4 (plans/ternary-field-encoding), the attraction with NO NEW FIELD. The arrow already fills empty space with
// vacuum tones (the active vacuum). Mass DEPLETES the vacuum (a mass cell excludes it). So the attraction can be
// read off the EXISTING vacuum density (a bounded ternary count of the tones already there), no new stored field,
// no new ingredient beyond the rest slot. Mass falls toward LOWER vacuum density (toward the depletion = toward the
// body), the Casimir/depletion attraction. This is the "derived from existing tones, no new slots" route.
//
// Measured, the vacuum-depletion attraction repairs a piece displaced one or two cells (RANGE 2) using no new field.
// A dedicated mass-emission gravity field (rung 3, a new field) reaches one cell further (range 3). So the no-new-
// field route closes the self for small perturbations, the dedicated field only buys extra range.
//
// This is the closest the self gets to the five base things, identity from the rest slot (a mesh enrichment), the
// radiation channel and bath from the base, and the binding from the arrow's own vacuum (depletion), no sixth
// field. Honest caveat, the vacuum density here is the coarse-grained (smooth) vacuum, the raw create-move vacuum is
// noisy, and the field-update (relaxation, down-gradient hop) is still effective (non-reversible), the reversible
// version is open.
//
// Depth L2, the attraction from the active vacuum (no new field) repairs range 2, mass-emission reaches range 3.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, d4MeshWithRest, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import {
  bulkMass,
  relaxPotential,
  vacuumDensity,
  gravityMoves,
} from '@/code/dynamics/gravity-field'

export default experiment({
  id: 'selves/vacuum-depletion-attraction',
  title:
    'attraction from the active vacuum (no new field): depletion repairs range 2, a dedicated emission field range 3',
  category: 'selves',
  substrates: ['3434-rest'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const beats = 30
    const cap = 6
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

    // rung 4, the field is the vacuum density (no new field), mass moves toward LOWER vacuum density (depletion).
    const repairVacuum = (disp: number): number => {
      let will = displaced(disp)
      let willScratch: Will = {
        mesh: coin,
        data: new Int8Array(will.data.length),
      }
      let v = vacuumDensity({
        occupied: occupiedOf(will),
        neighbour,
        cellCount: coin.cellCount,
        spatialDegree,
        sweeps: 24,
        cap,
      })
      for (let t = 0; t < beats; t++) {
        beatInto({
          src: will,
          dst: willScratch,
          table,
          collision: rule,
        })
        const swap = will
        will = willScratch
        willScratch = swap
        const occupied = occupiedOf(will)
        v = vacuumDensity({
          occupied,
          neighbour,
          cellCount: coin.cellCount,
          spatialDegree,
          sweeps: 4,
          cap,
          warm: v,
        })
        for (const [from, to] of gravityMoves({
          occupied,
          phi: v,
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

    // rung 3, a dedicated mass-emission gravity field (a new field), for the range comparison.
    const repairEmission = (disp: number): number => {
      let will = displaced(disp)
      let willScratch: Will = {
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
        beatInto({
          src: will,
          dst: willScratch,
          table,
          collision: rule,
        })
        const swap = will
        will = willScratch
        willScratch = swap
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

    const vacuumD1 = repairVacuum(1)
    const vacuumD2 = repairVacuum(2)
    const vacuumD3 = repairVacuum(3)
    const emissionD3 = repairEmission(3)

    const vacuumRepairsRange2 =
      vacuumD1 <= bodyExtent && vacuumD2 <= bodyExtent
    const vacuumFiniteRange = vacuumD3 > bodyExtent // honest, no new field reaches range 2, not 3
    const emissionReachesRange3 = emissionD3 <= bodyExtent
    const ok = vacuumRepairsRange2 && emissionReachesRange3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the attraction can come from the active vacuum with NO new field, the arrow fills empty space with vacuum tones and mass depletes it, so reading the existing vacuum density (a bounded ternary count of the tones already there) and moving mass toward lower density (toward the depletion) repairs a piece displaced one or two cells (range two) using no new stored field, only the arrow and the rest slot, while a dedicated mass-emission gravity field (a new field) reaches one cell further (range three), so the no-new-field route closes the self for small perturbations and the dedicated field only buys extra range',
      metrics: {
        bodyExtent,
        vacuumD1FinalExtent: vacuumD1,
        vacuumD2FinalExtent: vacuumD2,
        vacuumD3FinalExtent: vacuumD3,
        emissionD3FinalExtent: emissionD3,
        vacuumRepairsRange2: vacuumRepairsRange2 ? 1 : 0,
        vacuumFiniteRange: vacuumFiniteRange ? 1 : 0,
        emissionReachesRange3: emissionReachesRange3 ? 1 : 0,
        beats,
      },
      control: {
        vacuumD3FinalExtent: vacuumD3,
        emissionD3FinalExtent: emissionD3,
      },
      notes:
        'the closest the self gets to the five base things, the binding comes from the arrows own vacuum (depletion), read off the existing tones, no sixth field, range 2. A dedicated emission field reaches range 3 at the cost of a new field. Honest caveats, the vacuum density is the coarse-grained (smooth) vacuum not the raw noisy create-move gas, and the field update is still effective (non-reversible), a reversible version is open',
    })
  },
})
