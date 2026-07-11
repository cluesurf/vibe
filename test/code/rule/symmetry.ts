// Conformance for code/rule/symmetry: the discrete C, P, T operations on a will. Each is exact (integer tone
// relabelling), so we check the algebraic facts directly:
//   - C (charge conjugation) negates every tone: an involution that flips the total charge.
//   - T (time/velocity reversal) permutes each cell's slots to opposite directions: an involution that preserves
//     the total charge and every per-cell tone (it only reshuffles a cell's own slots).
//   - P (parity) reflects one axis bijectively: an involution that preserves the total charge.
//   - CPT negates the charge (C flips it; P and T preserve it).

import { suite, check, equal, exactArray } from '@/test/code/harness'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  makeWill,
  fillWillPattern,
  charge,
  cellTone,
  Will,
} from '@/code/tone/will'
import {
  chargeConjugate,
  timeReverse,
  parityReflect,
  chargeParityTime,
} from '@/code/rule/symmetry'

const SIDE = 3
const mesh = d4Mesh({ side: SIDE })
const directions = rootsD4()

function sample(): Will {
  const will = makeWill(mesh)

  fillWillPattern(will, 1) // deterministic structured ternary fill

  return will
}

suite('rule/symmetry: charge conjugation C', [
  check('C is an involution', () => {
    const w = sample()

    exactArray(
      chargeConjugate(chargeConjugate(w)).data,
      w.data,
      'C(C(w)) = w',
    )
  }),
  check('C flips the total charge', () => {
    const w = sample()

    equal(
      charge(chargeConjugate(w)),
      -charge(w),
      'C negates the charge',
    )
  }),
  check('C negates a single known slot', () => {
    const w = makeWill(mesh)

    w.data[5] = 1
    equal(chargeConjugate(w).data[5], -1, 'a +1 tone becomes -1')
  }),
])

suite('rule/symmetry: time reversal T', [
  check('T is an involution', () => {
    const w = sample()

    exactArray(timeReverse(timeReverse(w)).data, w.data, 'T(T(w)) = w')
  }),
  check('T preserves the total charge and every per-cell tone', () => {
    const w = sample()
    const t = timeReverse(w)

    equal(charge(t), charge(w), 'T conserves total charge')

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      equal(
        cellTone(t, cell),
        cellTone(w, cell),
        `cell ${cell} tone preserved`,
      )
    }
  }),
])

suite('rule/symmetry: parity P', [
  check('P is an involution', () => {
    const w = sample()
    const p = parityReflect({
      will: w,
      directions,
      side: SIDE,
      axis: 0,
    })

    const pp = parityReflect({
      will: p,
      directions,
      side: SIDE,
      axis: 0,
    })

    exactArray(pp.data, w.data, 'P(P(w)) = w')
  }),
  check('P preserves the total charge', () => {
    const w = sample()
    const p = parityReflect({
      will: w,
      directions,
      side: SIDE,
      axis: 0,
    })

    equal(charge(p), charge(w), 'a spatial reflection conserves charge')
  }),
])

suite('rule/symmetry: combined CPT', [
  check('CPT negates the charge (C flips, P and T preserve)', () => {
    const w = sample()
    const cpt = chargeParityTime({
      will: w,
      directions,
      side: SIDE,
      axis: 0,
    })

    equal(charge(cpt), -charge(w), 'CPT charge = -charge')
  }),
])
