// Base-generator family A, the ALGEBRAIC seeds, the geometry as an algebra's output. The dock is reached by
// three algebraic seeds: the Hurwitz quaternions (A1, the 24 units are the group 2T with a genuine spinor),
// the F4 Coxeter diagram (A2, reflection closure rebuilds the dock and its dual), and the octonions / SO(8)
// triality (A3, the 24 split into a vector and two spinor octets). Plan: theory-v0.8.0/plans/the-base-generator.md.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  Quaternion,
  binaryTetrahedral,
  multiply,
  conjugate,
  quaternionKey,
  quaternion,
} from '@/code/algebra/group/quaternion'
import {
  closure,
  commutatorSubgroup,
  contains,
  GroupOps,
} from '@/code/algebra/group/finite-group'
import {
  reflectionClosure,
  rootsF4,
  rootsD4,
  vectorKey,
  dotVec,
} from '@/code/algebra/group/root-system'
import {
  vectorRep8,
  spinorRepEven8,
  spinorRepOdd8,
  applyTriality,
  vectorSetsEqual,
} from '@/code/algebra/group/so8-triality'

function sameSet(left: number[][], right: number[][]): boolean {
  const a = new Set(left.map(vectorKey))
  const b = new Set(right.map(vectorKey))

  return a.size === b.size && [...a].every(key => b.has(key))
}

// A1, the quaternion seed: the 24 Hurwitz units are the group 2T with a genuine (nonsplit) spinor double cover.
export default experiment({
  id: 'foundations/generator-quaternion-spinor',
  code: 'E-FND-0023',
  title:
    'the 24 Hurwitz quaternions are the group 2T with a genuine spinor (nonsplit double cover)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const ops: GroupOps<Quaternion> = {
      multiply,
      inverse: conjugate,
      key: quaternionKey,
    } // unit quaternion inverse = conjugate

    const units = binaryTetrahedral()
    const group = closure(units, ops)
    const minusOne = quaternion(-1, 0, 0, 0)
    const commutator = commutatorSubgroup(group, ops)
    const nonsplit = contains(commutator, minusOne, ops) // -1 in the commutator subgroup = genuine spinor
    const quotient = group.length / 2 // 2T / {+-1} = A4, order 12
    const ok =
      units.length === 24 &&
      group.length === 24 &&
      nonsplit &&
      quotient === 12

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 unit Hurwitz quaternions close under multiplication to the binary tetrahedral group 2T, whose double cover is nonsplit (minus one lies in the commutator subgroup), so the coin carries a real spinor',
      metrics: {
        units: units.length,
        groupOrder: group.length,
        quotientOrder: quotient,
        nonsplit: nonsplit ? 1 : 0,
      },
    })
  },
})

// A2, the Coxeter seed: reflection closure of the F4 simple roots rebuilds the dock and its dual.
experiment({
  id: 'foundations/generator-coxeter-closure',
  title:
    'reflecting the four F4 simple roots rebuilds the 24-cell dock and its dual (48 roots)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const simple = [
      [0, 1, -1, 0], // long
      [0, 0, 1, -1], // long
      [0, 0, 0, 1], // short
      [0.5, -0.5, -0.5, -0.5], // short
    ]

    const closed = reflectionClosure(simple)
    const longRoots = closed.filter(
      v => Math.abs(dotVec(v, v) - 2) < 1e-6,
    )

    const shortRoots = closed.filter(
      v => Math.abs(dotVec(v, v) - 1) < 1e-6,
    )

    const longIsDock = sameSet(longRoots, rootsD4())
    const matchesF4 = sameSet(closed, rootsF4())
    const ok =
      closed.length === 48 &&
      longRoots.length === 24 &&
      shortRoots.length === 24 &&
      longIsDock &&
      matchesF4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reflection closure of the four F4 Coxeter simple roots is the 48-root F4 system, whose 24 long roots are exactly the dock and 24 short roots its dual, so the geometry comes from four marked dots',
      metrics: {
        roots: closed.length,
        longRoots: longRoots.length,
        shortRoots: shortRoots.length,
      },
    })
  },
})

// A3, the octonion seed: SO(8) / octonion triality splits the dock into a vector and two spinor octets.
experiment({
  id: 'foundations/generator-octonion-triality',
  title:
    'octonion (SO(8)) triality splits the dock into 8v + 8s + 8c, a vector and two spinors',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const vector = vectorRep8()
    const spinorEven = spinorRepEven8()
    const spinorOdd = spinorRepOdd8()
    const octets =
      vector.length === 8 &&
      spinorEven.length === 8 &&
      spinorOdd.length === 8

    const union = [...vector, ...spinorEven, ...spinorOdd]
    const disjoint = new Set(union.map(vectorKey)).size === 24 // the 24-cell (Hurwitz / unit-norm form)
    const trialityStep = vectorSetsEqual(
      applyTriality(vector),
      spinorEven,
    ) // 8v -> 8s under triality

    const ok = octets && disjoint && trialityStep

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'SO(8) triality (the shadow of the octonions) splits the 24 dock directions into three disjoint octets, the vector 8v and the two spinors 8s and 8c, with the triality map carrying 8v to 8s',
      metrics: {
        vector: vector.length,
        spinorEven: spinorEven.length,
        spinorOdd: spinorOdd.length,
        unionSize: new Set(union.map(vectorKey)).size,
      },
    })
  },
})
