// Conformance for code/algebra/group/cell-24: the 24-cell as the unit Hurwitz
// quaternions and the order-3 triality that cycles the three cosets of Q8 in 2T.
// Re-derived facts: 24 unit vertices forming a multiplicative group, omega a
// primitive cube root of unity (omega^3 = 1, omega != 1, omega^2 != 1), and the
// three cosets partition the 24 vertices into three classes of 8.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  cell24Vertices,
  omega,
  trialityClasses,
} from '@/code/algebra/group/cell-24'
import {
  Quaternion,
  multiply,
  quaternionKey,
} from '@/code/algebra/group/quaternion'

const ONE: Quaternion = { w: 1, x: 0, y: 0, z: 0 }

const normSquared = (q: Quaternion): number =>
  q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z

const keysOf = (group: Quaternion[]): Set<string> =>
  new Set(group.map(quaternionKey))

suite('algebra/group/cell-24: the 24-cell vertices', [
  check('the 24-cell has 24 distinct unit-quaternion vertices', () => {
    const vertices = cell24Vertices()
    equal(vertices.length, 24, '24 vertices')
    equal(keysOf(vertices).size, 24, 'all distinct')

    for (const v of vertices) {
      close(normSquared(v), 1, 1e-12, 'a vertex is a unit quaternion')
    }
  }),
  check(
    'the 24 vertices are closed under the quaternion product (the group 2T)',
    () => {
      const vertices = cell24Vertices()
      const present = keysOf(vertices)

      for (const a of vertices) {
        for (const b of vertices) {
          ok(
            present.has(quaternionKey(multiply(a, b))),
            'the 24-cell vertices form a multiplicative group',
          )
        }
      }
    },
  ),
])

suite('algebra/group/cell-24: triality (omega cube root of unity)', [
  check('omega is a unit quaternion', () => {
    close(normSquared(omega), 1, 1e-12, '|omega|^2 = 1')
  }),
  check(
    'omega^3 = 1 but omega != 1 and omega^2 != 1 (primitive cube root)',
    () => {
      const omega2 = multiply(omega, omega)
      const omega3 = multiply(omega2, omega)
      close(omega3.w, 1, 1e-12, 'omega^3 w')
      close(omega3.x, 0, 1e-12, 'omega^3 x')
      close(omega3.y, 0, 1e-12, 'omega^3 y')
      close(omega3.z, 0, 1e-12, 'omega^3 z')
      ok(quaternionKey(omega) !== quaternionKey(ONE), 'omega != 1')
      ok(quaternionKey(omega2) !== quaternionKey(ONE), 'omega^2 != 1')
    },
  ),
])

suite('algebra/group/cell-24: the three triality cosets', [
  check('three classes of 8 partition the 24 vertices', () => {
    const [classVector, classA, classB] = trialityClasses()
    equal(classVector.length, 8, 'class 0 (Q8) has 8')
    equal(classA.length, 8, 'class 1 has 8')
    equal(classB.length, 8, 'class 2 has 8')

    const k0 = keysOf(classVector)
    const k1 = keysOf(classA)
    const k2 = keysOf(classB)
    equal(k0.size, 8, 'class 0 distinct')
    equal(k1.size, 8, 'class 1 distinct')
    equal(k2.size, 8, 'class 2 distinct')

    // pairwise disjoint
    ok(
      [...k0].every(k => !k1.has(k)),
      'class 0 and 1 disjoint',
    )
    ok(
      [...k0].every(k => !k2.has(k)),
      'class 0 and 2 disjoint',
    )
    ok(
      [...k1].every(k => !k2.has(k)),
      'class 1 and 2 disjoint',
    )

    // union is exactly the 24 vertices
    const union = new Set([...k0, ...k1, ...k2])
    equal(union.size, 24, 'the three cosets cover all 24 vertices')

    const vertices = keysOf(cell24Vertices())
    ok(
      [...union].every(k => vertices.has(k)),
      'union = 24-cell vertices',
    )
  }),
  check(
    'left multiplication by omega cycles class 0 -> class 1 -> class 2',
    () => {
      const [classVector, classA, classB] = trialityClasses()
      const omega0 = new Set(
        classVector.map(q => quaternionKey(multiply(omega, q))),
      )

      const omega1 = new Set(
        classA.map(q => quaternionKey(multiply(omega, q))),
      )

      const k1 = keysOf(classA)
      const k2 = keysOf(classB)
      ok(
        omega0.size === 8 && [...omega0].every(k => k1.has(k)),
        'omega . class0 = class1',
      )
      ok(
        omega1.size === 8 && [...omega1].every(k => k2.has(k)),
        'omega . class1 = class2',
      )
    },
  ),
])
