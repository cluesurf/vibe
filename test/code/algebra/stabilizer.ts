// Conformance for code/algebra/stabilizer: the GF(2) symplectic algebra of stabilizer
// codes, exercised on the [[5,1,3]] perfect code (the HaPPY-code building block). Every
// expected number is re-derived from stabilizer-code theory, not the implementation:
//   - the 4 generators (cyclic shifts of XZZXI) pairwise COMMUTE (a valid code).
//   - the stabilizer group has 2^4 = 16 elements.
//   - the centralizer (normalizer) has 2^(2n - (n-k)) = 2^6 = 64 elements, so the
//     non-trivial logical operators number 64 - 16 = 48.
//   - the code distance (min logical weight) is 3.
//   - distance 3 => every erasure of <= 2 qubits is correctable, and some 3-qubit
//     erasure is not.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  popcount,
  pauliWeight,
  pauliCommute,
  stabilizerGroup,
  logicalOperators,
  codeDistance,
  erasureCorrectable,
  type Pauli,
} from '@/code/algebra/stabilizer'

const QUBITS = 5

// The five-qubit code: g1 = XZZXI and its cyclic shifts, in (x, z) bitmask form with
// qubit q = bit q. g1: X@0,3  Z@1,2 ; etc.
const GENERATORS: Pauli[] = [
  { x: 0b01001, z: 0b00110 }, // X Z Z X I
  { x: 0b10010, z: 0b01100 }, // I X Z Z X
  { x: 0b00101, z: 0b11000 }, // X I X Z Z
  { x: 0b01010, z: 0b10001 }, // Z X I X Z
]

suite('algebra/stabilizer: symplectic primitives', [
  check('popcount counts set bits', () => {
    equal(popcount(0), 0, '0')
    equal(popcount(0b1011), 3, '1011')
    equal(popcount(0b11111), 5, 'five ones')
  }),
  check('X and Z on the same qubit anticommute; on different qubits commute', () => {
    notOk(pauliCommute({ x: 1, z: 0 }, { x: 0, z: 1 }), 'X0 and Z0 anticommute')
    ok(pauliCommute({ x: 1, z: 0 }, { x: 0, z: 2 }), 'X0 and Z1 commute')
  }),
  check('a Y (x and z set on one qubit) has weight 1', () => {
    equal(pauliWeight({ x: 1, z: 1 }), 1, 'Y is weight 1')
    equal(pauliWeight({ x: 0b101, z: 0b010 }), 3, 'X0 Z1 X2 has weight 3')
  }),
])

suite('algebra/stabilizer: the [[5,1,3]] perfect code', [
  check('the four generators pairwise commute (a valid stabilizer)', () => {
    for (let i = 0; i < GENERATORS.length; i++) {
      for (let j = i + 1; j < GENERATORS.length; j++) {
        ok(
          pauliCommute(GENERATORS[i]!, GENERATORS[j]!),
          `g${i} and g${j} commute`,
        )
      }
    }
  }),
  check('every generator has weight 4', () => {
    for (const g of GENERATORS) {
      equal(pauliWeight(g), 4, 'XZZXI-type weight 4')
    }
  }),
  check('the stabilizer group has 2^4 = 16 elements', () => {
    const span = stabilizerGroup({ generators: GENERATORS, qubits: QUBITS })
    equal(span.size, 16, '|S| = 2^4')
  }),
  check('there are 48 non-trivial logical operators (64 - 16)', () => {
    const span = stabilizerGroup({ generators: GENERATORS, qubits: QUBITS })
    const logicals = logicalOperators({
      generators: GENERATORS,
      span,
      qubits: QUBITS,
    })
    equal(logicals.length, 48, 'normalizer (64) minus stabilizer (16)')
  }),
  check('the code distance is 3', () => {
    const span = stabilizerGroup({ generators: GENERATORS, qubits: QUBITS })
    const logicals = logicalOperators({
      generators: GENERATORS,
      span,
      qubits: QUBITS,
    })
    equal(codeDistance(logicals), 3, 'min logical weight = 3')
  }),
])

suite('algebra/stabilizer: erasure correctability from distance 3', [
  check('every 1- and 2-qubit erasure is correctable', () => {
    const span = stabilizerGroup({ generators: GENERATORS, qubits: QUBITS })
    const logicals = logicalOperators({
      generators: GENERATORS,
      span,
      qubits: QUBITS,
    })
    for (let a = 0; a < QUBITS; a++) {
      ok(
        erasureCorrectable({ logicals, erased: 1 << a }),
        `single erasure {${a}}`,
      )
      for (let b = a + 1; b < QUBITS; b++) {
        ok(
          erasureCorrectable({ logicals, erased: (1 << a) | (1 << b) }),
          `double erasure {${a},${b}}`,
        )
      }
    }
  }),
  check('some 3-qubit erasure is NOT correctable (distance exactly 3)', () => {
    const span = stabilizerGroup({ generators: GENERATORS, qubits: QUBITS })
    const logicals = logicalOperators({
      generators: GENERATORS,
      span,
      qubits: QUBITS,
    })
    let foundUncorrectable = false
    for (let a = 0; a < QUBITS; a++) {
      for (let b = a + 1; b < QUBITS; b++) {
        for (let c = b + 1; c < QUBITS; c++) {
          const erased = (1 << a) | (1 << b) | (1 << c)
          if (!erasureCorrectable({ logicals, erased })) {
            foundUncorrectable = true
          }
        }
      }
    }
    ok(foundUncorrectable, 'a weight-3 logical fits inside some 3-qubit set')
  }),
  check('erasing all 5 qubits is not correctable', () => {
    const span = stabilizerGroup({ generators: GENERATORS, qubits: QUBITS })
    const logicals = logicalOperators({
      generators: GENERATORS,
      span,
      qubits: QUBITS,
    })
    notOk(
      erasureCorrectable({ logicals, erased: 0b11111 }),
      'whole register erased',
    )
  }),
])
