// Conformance for code/dynamics/ternary-field: the Z3 second-order reversible CA,
// u(t+1) = (rule(left,c,right) - u(t-1)) mod 3. Invariants (all EXACT integer):
//   - REVERSIBILITY for ANY rule: u(t-1) = (rule(...) - u(t+1)) mod 3.
//   - DECOUPLED rule has period 3 per cell (2c - prev, no coupling) -> a disturbance never radiates.
//   - LINEAR rule = (left + right) before subtraction.
//   - wallCount, fieldDifference, spreadRadius are read correctly.
//   - all tones stay in {0,1,2}; determinism.

import {
  suite,
  check,
  exactArray,
  equal,
  ok,
} from '@/test/code/harness'
import {
  makeTernaryField,
  stepTernaryField,
  linearTernaryRule,
  decoupledTernaryRule,
  wallCount,
  fieldDifference,
  spreadRadius,
  TernaryField,
} from '@/code/dynamics/ternary-field'

const SIZE = 15
const periodic = { form: 'periodic' as const }
const fill = (i: number): number => (i * 2 + 1) % 3

suite('dynamics/ternary-field: exact reversibility (mod 3)', [
  check(
    'linear rule: forward then reversed beat recovers the previous slice',
    () => {
      const field = makeTernaryField({ size: SIZE, fill })
      const prev0 = field.prev.slice()
      const after = stepTernaryField({
        field,
        rule: linearTernaryRule,
        boundary: periodic,
      })

      const reversed: TernaryField = {
        prev: after.curr,
        curr: after.prev,
        size: SIZE,
      }

      const back = stepTernaryField({
        field: reversed,
        rule: linearTernaryRule,
        boundary: periodic,
      })

      exactArray(back.curr, prev0, 'recovered previous slice (linear)')
    },
  ),
  check('decoupled rule is also exactly reversible', () => {
    const field = makeTernaryField({ size: SIZE, fill })
    const prev0 = field.prev.slice()
    const after = stepTernaryField({
      field,
      rule: decoupledTernaryRule,
      boundary: periodic,
    })

    const reversed: TernaryField = {
      prev: after.curr,
      curr: after.prev,
      size: SIZE,
    }

    const back = stepTernaryField({
      field: reversed,
      rule: decoupledTernaryRule,
      boundary: periodic,
    })

    exactArray(back.curr, prev0, 'recovered previous slice (decoupled)')
  }),
])

suite('dynamics/ternary-field: decoupled period and range', [
  check(
    'the decoupled rule has period 3 per cell (no radiation)',
    () => {
      let field = makeTernaryField({ size: SIZE, fill })

      const start = field.curr.slice()

      // each cell evolves independently with period 3; after 3 beats the state repeats
      for (let t = 0; t < 3; t++) {
        field = stepTernaryField({
          field,
          rule: decoupledTernaryRule,
          boundary: periodic,
        })
      }

      exactArray(field.curr, start, 'state repeats after 3 beats')
    },
  ),
  check('every tone stays in {0,1,2}', () => {
    let field = makeTernaryField({ size: SIZE, fill })

    for (let t = 0; t < 20; t++) {
      field = stepTernaryField({
        field,
        rule: linearTernaryRule,
        boundary: periodic,
      })

      for (let i = 0; i < SIZE; i++) {
        ok(
          field.curr[i]! >= 0 && field.curr[i]! < 3,
          `tone in {0,1,2} at ${i}`,
        )
      }
    }
  }),
  check('two identical runs are bit-for-bit equal', () => {
    const a = stepTernaryField({
      field: makeTernaryField({ size: SIZE, fill }),
      rule: linearTernaryRule,
      boundary: periodic,
    })

    const b = stepTernaryField({
      field: makeTernaryField({ size: SIZE, fill }),
      rule: linearTernaryRule,
      boundary: periodic,
    })

    exactArray(a.curr, b.curr, 'deterministic')
  }),
])

suite('dynamics/ternary-field: measures', [
  check('wallCount counts adjacent differing cells', () => {
    equal(wallCount(Int8Array.from([0, 0, 1, 1, 2, 2])), 2, 'two walls')
    equal(
      wallCount(Int8Array.from([1, 1, 1, 1])),
      0,
      'uniform has none',
    )
  }),
  check('fieldDifference counts differing cells', () => {
    equal(
      fieldDifference(
        Int8Array.from([0, 1, 2, 0]),
        Int8Array.from([0, 2, 2, 1]),
      ),
      2,
      'two cells differ',
    )
  }),
  check(
    'spreadRadius is the max distance of a difference from the centre',
    () => {
      const clean = Int8Array.from([0, 0, 0, 0, 0, 0, 0])
      const perturbed = clean.slice()

      perturbed[1] = 1
      perturbed[5] = 2
      // centre 3: distances are |3-1|=2 and |5-3|=2
      equal(
        spreadRadius({ clean, perturbed, center: 3 }),
        2,
        'radius 2',
      )

      equal(
        spreadRadius({ clean, perturbed: clean.slice(), center: 3 }),
        0,
        'no spread when identical',
      )
    },
  ),
])
