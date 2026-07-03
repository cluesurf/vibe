// Conformance for code/substrate/coxeter/minkowski: the linear-algebra core of the tessellation engine.
// A reflection is an involution with determinant -1; the identity is a multiplicative unit; the Minkowski
// inner product carries the signature; reflecting a point across a normal twice returns it. The cleanest
// checks are floating but exact in principle, so tolerances are tiny.

import {
  suite,
  check,
  close,
  closeArray,
} from '@/test/code/harness'
import {
  identity,
  matMul,
  matVec,
  reflectionMatrix,
  reflectPoint,
  determinant,
  innerJ,
} from '@/code/substrate/coxeter/minkowski'

const flat = (m: number[][]): number[] => m.flat()

suite('substrate/coxeter/minkowski: matrices and the metric', [
  check('identity is a left and right unit, with determinant 1', () => {
    const a = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ]

    closeArray(flat(matMul(identity(3), a)), flat(a), 1e-12, 'I*A')
    closeArray(flat(matMul(a, identity(3))), flat(a), 1e-12, 'A*I')
    close(determinant(identity(4)), 1, 1e-12, 'det I')
  }),
  check(
    'the Minkowski inner product carries the diagonal signature',
    () => {
      const metric = [1, 1, -1]
      close(
        innerJ([0, 0, 1], [0, 0, 1], metric),
        -1,
        1e-12,
        'timelike norm',
      )
      close(
        innerJ([1, 0, 0], [1, 0, 0], metric),
        1,
        1e-12,
        'spacelike norm',
      )
      close(
        innerJ([1, 2, 3], [0, 0, 0], metric),
        0,
        1e-12,
        'zero vector',
      )
    },
  ),
])

suite('substrate/coxeter/minkowski: reflections are involutions', [
  check('a Euclidean reflection matrix squares to the identity', () => {
    const metric = [1, 1, 1]
    const normal = [0.6, 0.8, 0] // a unit vector
    const r = reflectionMatrix(normal, metric)
    closeArray(flat(matMul(r, r)), flat(identity(3)), 1e-12, 'R^2 = I')
    close(determinant(r), -1, 1e-12, 'det R = -1')
  }),
  check('an axis reflection flips exactly its own axis', () => {
    const r = reflectionMatrix([1, 0, 0], [1, 1, 1])
    closeArray(
      flat(r),
      flat([
        [-1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
      1e-12,
      'diag(-1,1,1)',
    )
  }),
  check('reflecting a point twice across a normal returns it', () => {
    const metric = [1, 1, -1]
    const normal = [1, 1, 0]
    const p = [3, -2, 5]
    const once = reflectPoint(p, normal, metric)
    const twice = reflectPoint(once, normal, metric)
    closeArray(twice, p, 1e-12, 'reflect twice = identity')
  }),
  check('matVec of identity is the vector', () => {
    closeArray(
      matVec(identity(3), [7, -1, 4]),
      [7, -1, 4],
      1e-12,
      'I*v',
    )
  }),
])
