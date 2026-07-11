// Conformance for code/operator/directional-lattice-gas: the four-charge reversible
// directional lattice gas. The load-bearing facts, all exact (integer state):
//   - collide is an involution (applying it twice is the identity).
//   - stream and streamInverse are exact inverses.
//   - a full beat (collide then stream) run forward then backward recovers the start.
//   - collide and a full beat conserve total charge and total momentum exactly.
//   - latticeIndex wraps periodically.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  makeLatticeGas,
  cloneLatticeGas,
  latticeIndex,
  collide,
  stream,
  streamInverse,
  latticeCharge,
  latticeMomentum,
  LatticeGasState,
} from '@/code/operator/directional-lattice-gas'
import { makeRng } from '@/code/tool/rng'

// A deterministic ternary fill of every slot, exercising both collide cases.
function fillGas(length: number, seed: number): LatticeGasState {
  const s = makeLatticeGas(length)
  const rng = makeRng({ seed })

  for (let i = 0; i < s.E.length; i++) {
    s.E[i] = rng.nextInt({ max: 3 }) - 1
    s.W[i] = rng.nextInt({ max: 3 }) - 1
    s.N[i] = rng.nextInt({ max: 3 }) - 1
    s.S[i] = rng.nextInt({ max: 3 }) - 1
  }

  return s
}

function gasEqual(a: LatticeGasState, b: LatticeGasState): boolean {
  for (const key of ['E', 'W', 'N', 'S'] as const) {
    for (let i = 0; i < a[key].length; i++) {
      if (a[key][i] !== b[key][i]) return false
    }
  }

  return true
}

suite('operator/directional-lattice-gas: indexing', [
  check('latticeIndex wraps periodically', () => {
    const L = 4

    equal(
      latticeIndex(L, -1, 0),
      latticeIndex(L, L - 1, 0),
      'x = -1 wraps to L-1',
    )

    equal(
      latticeIndex(L, 0, -1),
      latticeIndex(L, 0, L - 1),
      'y = -1 wraps to L-1',
    )

    equal(
      latticeIndex(L, L, 0),
      latticeIndex(L, 0, 0),
      'x = L wraps to 0',
    )
    equal(latticeIndex(L, 2, 3), 3 * L + 2, 'flat index row-major')
  }),
])

suite('operator/directional-lattice-gas: reversibility', [
  check('collide is an involution', () => {
    const start = fillGas(4, 7)
    const s = cloneLatticeGas(start)

    collide(s)
    collide(s)
    ok(gasEqual(s, start), 'collide applied twice is the identity')
  }),
  check('a head-on x-pair rotates to a y-pair and back', () => {
    const s = makeLatticeGas(2)

    s.E[0] = 1
    s.W[0] = 1
    collide(s)
    equal(s.E[0], 0, 'E cleared')
    equal(s.W[0], 0, 'W cleared')
    equal(s.N[0], 1, 'N set to the pair sign')
    equal(s.S[0], 1, 'S set to the pair sign')
    collide(s)
    equal(s.E[0], 1, 'rotates back to E')
    equal(s.W[0], 1, 'rotates back to W')
    equal(s.N[0], 0, 'N cleared on the way back')
  }),
  check('stream and streamInverse are exact inverses', () => {
    const start = fillGas(5, 11)
    const back = streamInverse(5, stream(5, start))

    ok(gasEqual(back, start), 'streamInverse undoes stream')
  }),
  check(
    'a full beat run forward then backward recovers the start',
    () => {
      const L = 4
      const start = fillGas(L, 21)
      // beat = collide then stream
      const after = cloneLatticeGas(start)

      collide(after)

      const streamed = stream(L, after)
      // inverse = streamInverse then collide
      const undone = streamInverse(L, streamed)

      collide(undone)
      ok(gasEqual(undone, start), 'the beat is exactly reversible')
    },
  ),
])

suite('operator/directional-lattice-gas: conservation', [
  check('collide conserves total charge and momentum', () => {
    const start = fillGas(4, 33)
    const c0 = latticeCharge(start)
    const [px0, py0] = latticeMomentum(start)
    const s = cloneLatticeGas(start)

    collide(s)
    equal(latticeCharge(s), c0, 'charge conserved by collide')

    const [px1, py1] = latticeMomentum(s)

    equal(px1, px0, 'x-momentum conserved by collide')
    equal(py1, py0, 'y-momentum conserved by collide')
  }),
  check('a full beat conserves total charge and momentum', () => {
    const L = 5
    const start = fillGas(L, 44)
    const c0 = latticeCharge(start)
    const [px0, py0] = latticeMomentum(start)
    const after = cloneLatticeGas(start)

    collide(after)

    const streamed = stream(L, after)

    equal(latticeCharge(streamed), c0, 'charge conserved by the beat')

    const [px1, py1] = latticeMomentum(streamed)

    equal(px1, px0, 'x-momentum conserved by the beat')
    equal(py1, py0, 'y-momentum conserved by the beat')
  }),
])
