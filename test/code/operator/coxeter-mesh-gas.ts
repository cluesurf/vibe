// Conformance for code/operator/coxeter-mesh-gas: the reversible charge-conserving
// lattice gas on a Coxeter-matrix mesh. Exact integer facts:
//   - on an involutive adjacency (neighbour of neighbour is the cell) streaming twice
//     is the identity, and streaming conserves total charge.
//   - collide forward then backward (the cyclic shift and its inverse) is the identity,
//     and the forward shift matches the explicit per-slot rotation.
//   - the lossy erase control destroys exactly the charge that lands in slot 0.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  streamCoxeterMeshGas,
  collideCoxeterMeshGas,
  eraseCoxeterMeshGas,
  countCoxeterMeshGas,
} from '@/code/operator/coxeter-mesh-gas'

// A hand-built rank-2 involutive mesh: generator 0 swaps the two cells, generator 1
// is a boundary reflection (adjacency -1, stays put). Neighbour of neighbour is the cell.
const adjacency = [
  [1, -1],
  [0, -1],
]

const rank = 2

const stateEqual = (
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): boolean => a.every((row, i) => row.every((v, k) => v === b[i]![k]))

suite('operator/coxeter-mesh-gas: streaming', [
  check(
    'streaming twice is the identity on an involutive adjacency',
    () => {
      const state = [
        [3, 5],
        [7, 9],
      ]

      const once = streamCoxeterMeshGas({ state, adjacency, rank })
      const twice = streamCoxeterMeshGas({
        state: once,
        adjacency,
        rank,
      })

      ok(
        stateEqual(twice, state),
        'each generator is an involution, so stream^2 = id',
      )
    },
  ),
  check(
    'streaming generator 0 swaps cells, generator 1 stays put',
    () => {
      const state = [
        [1, 2],
        [10, 20],
      ]

      const out = streamCoxeterMeshGas({ state, adjacency, rank })

      equal(out[0]![0], 10, 'slot 0 of cell 0 came from cell 1 (swap)')
      equal(out[1]![0], 1, 'slot 0 of cell 1 came from cell 0 (swap)')
      equal(out[0]![1], 2, 'slot 1 (boundary) stays at cell 0')
      equal(out[1]![1], 20, 'slot 1 (boundary) stays at cell 1')
    },
  ),
  check('streaming conserves total charge', () => {
    const state = [
      [3, -4],
      [5, 6],
    ]

    const out = streamCoxeterMeshGas({ state, adjacency, rank })

    equal(
      countCoxeterMeshGas(out),
      countCoxeterMeshGas(state),
      'charge conserved',
    )
  }),
])

suite('operator/coxeter-mesh-gas: collide', [
  check('collide forward then backward is the identity', () => {
    const r = 3
    const state = [
      [1, 2, 3],
      [4, 5, 6],
    ]

    const fwd = collideCoxeterMeshGas({ state, rank: r, forward: true })
    const back = collideCoxeterMeshGas({
      state: fwd,
      rank: r,
      forward: false,
    })

    ok(
      stateEqual(back, state),
      'forward shift undone by backward shift',
    )
  }),
  check('forward shift matches the explicit per-slot rotation', () => {
    const r = 3
    // forward: out[d] = slots[(d + rank - 1) % rank], so [a,b,c] -> [c,a,b]
    const out = collideCoxeterMeshGas({
      state: [[1, 2, 3]],
      rank: r,
      forward: true,
    })

    equal(out[0]![0], 3, 'out[0] = slots[2]')
    equal(out[0]![1], 1, 'out[1] = slots[0]')
    equal(out[0]![2], 2, 'out[2] = slots[1]')
  }),
  check('collide conserves total charge', () => {
    const r = 3
    const state = [
      [1, 2, 3],
      [4, 5, 6],
    ]

    const out = collideCoxeterMeshGas({ state, rank: r, forward: true })

    equal(
      countCoxeterMeshGas(out),
      countCoxeterMeshGas(state),
      'cyclic shift conserves charge',
    )
  }),
])

suite('operator/coxeter-mesh-gas: erase control', [
  check(
    'erase destroys exactly the charge that lands in slot 0',
    () => {
      const r = 3
      const state = [
        [1, 2, 3],
        [4, 5, 6],
      ]

      const collided = collideCoxeterMeshGas({
        state,
        rank: r,
        forward: true,
      })

      const erased = eraseCoxeterMeshGas({
        state,
        rank: r,
        forward: true,
      })

      const lost = (collided[0]![0] ?? 0) + (collided[1]![0] ?? 0)

      equal(
        countCoxeterMeshGas(erased),
        countCoxeterMeshGas(collided) - lost,
        'erase removes the post-collide slot-0 charge',
      )
      ok(lost !== 0, 'the control genuinely loses charge here')
    },
  ),
])
