// Conformance for code/substrate/coxeter (the Gram-signature engine) and the reflection
// arithmetic it rests on. Two independent routes:
//
//  1. The Coxeter Gram matrix of {p,q,...} has off-diagonal entry -cos(pi/m). Its eigenvalue
//     signature decides the geometry: spherical (finite) is positive-definite (no negative,
//     no zero), Euclidean is positive-semidefinite (one zero), hyperbolic is Lorentzian
//     (exactly one negative, no zero). We assert the signature for one of each.
//  2. A reflection is an involution, and the product of two reflections has order m, the same
//     m whose Gram entry is -cos(pi/m). On the integer D4 roots this is EXACT (integer
//     arithmetic), so we test it with no tolerance; the eigenvalue counts are integers too.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
  close,
} from '@/test/code/harness'
import {
  gramSignature,
  symbolContainsSubdiagram,
} from '@/code/substrate/coxeter/gram-signature'
import { reflectRoot, dotVec } from '@/code/algebra/group/root-system'

const arraysEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i])

suite('substrate/coxeter: Gram signature classifies the geometry', [
  check('spherical (finite) honeycombs are positive-definite', () => {
    for (const symbol of [
      [3, 3],
      [3, 3, 3],
    ]) {
      const sig = gramSignature(symbol)
      equal(sig.negative, 0, `{${String(symbol)}} negative`)
      equal(sig.zero, 0, `{${String(symbol)}} zero`)
    }
  }),
  check(
    'Euclidean honeycombs are positive-semidefinite (one zero)',
    () => {
      for (const symbol of [
        [4, 4],
        [3, 6],
        [6, 3],
        [4, 3, 4],
      ]) {
        const sig = gramSignature(symbol)
        equal(sig.negative, 0, `{${String(symbol)}} negative`)
        equal(sig.zero, 1, `{${String(symbol)}} zero`)
      }
    },
  ),
  check(
    'hyperbolic honeycombs are Lorentzian (exactly one negative)',
    () => {
      for (const symbol of [
        [7, 3],
        [5, 3, 4],
        [3, 5, 3],
        [3, 4, 3, 4],
        [4, 3, 4, 3],
      ]) {
        const sig = gramSignature(symbol)
        equal(sig.negative, 1, `{${String(symbol)}} negative`)
        equal(sig.zero, 0, `{${String(symbol)}} zero`)
      }
    },
  ),
])

suite('substrate/coxeter: subdiagram detection', [
  check(
    'the [3,4,3] (F4 / 24-cell) substructure is found where present',
    () => {
      ok(symbolContainsSubdiagram([3, 4, 3, 4], [3, 4, 3]), '{3,4,3,4}')
      ok(symbolContainsSubdiagram([4, 3, 4, 3], [3, 4, 3]), '{4,3,4,3}')
      ok(symbolContainsSubdiagram([3, 4, 3], [3, 4, 3]), 'equal symbol')
    },
  ),
  check('it is absent where it should be', () => {
    notOk(symbolContainsSubdiagram([5, 3, 4], [3, 4, 3]), '{5,3,4}')
    notOk(
      symbolContainsSubdiagram([3, 4, 3], [3, 4, 3, 4]),
      'longer pattern',
    )
    notOk(symbolContainsSubdiagram([3, 4, 3], []), 'empty pattern')
  }),
])

suite('substrate/coxeter: reflections and the -cos(pi/m) entry', [
  check('reflecting twice in any D4 root is the identity', () => {
    const v = [1, 2, 3, 4]
    const roots = [
      [1, 1, 0, 0],
      [1, -1, 0, 0],
      [0, 1, 1, 0],
      [0, -1, 1, 0],
      [0, 0, 1, 1],
    ]

    for (const a of roots) {
      exactArray(reflectRoot(reflectRoot(v, a), a), v, `R_${String(a)}^2`)
    }
  }),
  check('the normalized Gram entry equals -cos(pi/m)', () => {
    // For unit-normalized roots the Gram off-diagonal is dot/|a||b| = dot/2 (|root|^2 = 2),
    // and for a root system this equals -cos(pi/m). Orthogonal roots give m=2 (entry 0),
    // roots at dot -1 give m=3 (entry -1/2).
    const orthogonal = dotVec([1, 1, 0, 0], [1, -1, 0, 0]) / 2
    close(orthogonal, -Math.cos(Math.PI / 2), 1e-12, 'm=2 entry')

    const obtuse = dotVec([1, 1, 0, 0], [0, -1, 1, 0]) / 2
    close(obtuse, -Math.cos(Math.PI / 3), 1e-12, 'm=3 entry')
  }),
  check(
    'the product of two reflections has order m (m=2 and m=3)',
    () => {
      const v = [1, 2, 3, 4]
      // Orthogonal pair (dot 0, m=2): (R_a R_b)^2 = identity.
      const a2 = [1, 1, 0, 0]
      const b2 = [1, -1, 0, 0]
      const rr2 = (x: number[]): number[] =>
        reflectRoot(reflectRoot(x, b2), a2)

      exactArray(rr2(rr2(v)), v, '(R_a R_b)^2 for m=2')

      // Pair at dot -1 (m=3): order is 3, not 2.
      const a3 = [1, 1, 0, 0]
      const b3 = [0, -1, 1, 0]
      const rr3 = (x: number[]): number[] =>
        reflectRoot(reflectRoot(x, b3), a3)

      exactArray(rr3(rr3(rr3(v))), v, '(R_a R_b)^3 for m=3')
      notOk(
        arraysEqual(rr3(rr3(v)), v),
        '(R_a R_b)^2 is not identity for m=3',
      )
    },
  ),
])
