// Conformance for code/dynamics/gravity-field: the discrete integer gravity potential. Invariants:
//   - bulkMass marks only DENSE cells (an isolated mass is a test particle, not a source).
//   - relaxPotential and vacuumDensity stay BOUNDED in [-cap, cap] (the minimality commitment).
//   - gravityMoves is a set of hops: applying them conserves the occupied-cell count.
//   - DETERMINISM (no RNG).

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  bulkMass,
  relaxPotential,
  vacuumDensity,
  gravityMoves,
} from '@/code/dynamics/gravity-field'

const N = 24
// 1D line; direction 0 = c-1, 1 = c+1, clamped to self at the ends.
const neighbour = (c: number, d: number): number =>
  d === 0 ? (c - 1 >= 0 ? c - 1 : c) : c + 1 < N ? c + 1 : c

const base = { neighbour, cellCount: N, spatialDegree: 2 }
const countOccupied = (o: Uint8Array): number =>
  o.reduce((s, v) => s + v, 0)

suite('dynamics/gravity-field: bulkMass', [
  check('an isolated mass is not a source', () => {
    const occupied = new Uint8Array(N)

    occupied[10] = 1

    const source = bulkMass({ occupied, ...base, minNeighbours: 1 })

    equal(
      source.reduce((s, v) => s + v, 0),
      0,
      'lone mass sources nothing',
    )
  }),
  check('the interior of a dense block is a source', () => {
    const occupied = new Uint8Array(N)

    occupied[10] = 1
    occupied[11] = 1
    occupied[12] = 1

    const source = bulkMass({ occupied, ...base, minNeighbours: 2 })

    equal(source[11], 1, 'middle is dense')
    equal(source[10], 0, 'edge of block not dense (one neighbour)')
    equal(source[12], 0, 'edge of block not dense')
  }),
])

suite('dynamics/gravity-field: bounded fields', [
  check('relaxPotential stays within [-cap, cap]', () => {
    const source = new Int8Array(N)

    source[12] = 1

    const cap = 6
    const phi = relaxPotential({
      source,
      ...base,
      sweeps: 30,
      strength: 3,
      cap,
    })

    for (let c = 0; c < N; c++)
      ok(phi[c]! >= -cap && phi[c]! <= cap, `phi in range at ${c}`)
  }),
  check('vacuumDensity stays within [-cap, cap]', () => {
    const occupied = new Uint8Array(N)

    occupied[12] = 1

    const cap = 6
    const v = vacuumDensity({ occupied, ...base, sweeps: 30, cap })

    for (let c = 0; c < N; c++)
      ok(v[c]! >= -cap && v[c]! <= cap, `v in range at ${c}`)
  }),
])

suite('dynamics/gravity-field: gravityMoves conserve mass', [
  check('applying the moves preserves the occupied count', () => {
    const occupied = new Uint8Array(N)

    // a bulk block plus a displaced lone mass nearby
    occupied[10] = 1
    occupied[11] = 1
    occupied[12] = 1
    occupied[16] = 1

    const source = bulkMass({ occupied, ...base, minNeighbours: 2 })
    const phi = relaxPotential({
      source,
      ...base,
      sweeps: 20,
      strength: 3,
      cap: 6,
    })

    const before = countOccupied(occupied)
    const moves = gravityMoves({
      occupied,
      phi,
      ...base,
      minNeighbours: 2,
    })

    for (const [from, to] of moves) {
      equal(occupied[from], 1, 'move starts from an occupied cell')
      equal(occupied[to], 0, 'move targets an empty cell')
      occupied[from] = 0
      occupied[to] = 1
    }

    equal(countOccupied(occupied), before, 'count conserved')
  }),
])

suite('dynamics/gravity-field: determinism', [
  check('relaxPotential is reproducible', () => {
    const source = new Int8Array(N)

    source[12] = 1

    const run = (): Int32Array =>
      relaxPotential({
        source,
        ...base,
        sweeps: 15,
        strength: 2,
        cap: 6,
      })

    const a = run()
    const b = run()

    for (let c = 0; c < N; c++) equal(a[c]!, b[c]!, `phi ${c}`)
  }),
])
