// Conformance for code/measure/octonion-fermions: one Standard-Model generation from the
// complexified octonions. The construction must satisfy its defining algebra exactly: the
// seven left-multiplications form Cl(0,7), the three derived ladder operators satisfy the
// canonical anticommutation relations, the occupation spectrum is {0,1,2,3} with
// multiplicities 1,3,3,1 (singlet, triplet, anti-triplet, singlet), and the number
// operator's trace is 0*1+1*3+2*3+3*1 = 12. The electric charges are k/3.

import { suite, check, equal, close, ok, exactArray } from '@/test/code/harness'
import { octonionFermionGeneration } from '@/code/measure/octonion-fermions'

const generation = octonionFermionGeneration()

suite('measure/octonion-fermions: one generation', [
  check('the seven left-multiplications form the Clifford algebra Cl(0,7)', () => {
    ok(generation.leftMultsAreClifford, 'L^2 = -I and the L anticommute')
  }),
  check('the three ladder operators obey the canonical anticommutators', () => {
    ok(
      generation.ladderRelationsHold,
      '{a_i, a_j^dagger} = delta_ij and {a_i, a_j} = 0',
    )
  }),
  check('the occupation spectrum is exactly {0,1,2,3}', () => {
    ok(generation.spectrumQuantized, 'N(N-1)(N-2)(N-3) = 0')
  }),
  // 1,3,3,1: neutrino singlet, down triplet, up anti-triplet, electron singlet.
  check('the multiplicities are 1,3,3,1 (8 states)', () => {
    exactArray(generation.multiplicities, [1, 3, 3, 1])
  }),
  // Tr N = sum_k k * mult_k = 0*1 + 1*3 + 2*3 + 3*1 = 12.
  check('the number-operator trace is 12', () => {
    equal(generation.numberOperatorTrace, 12)
  }),
  // Q = k/3 for k = 0,1,2,3: the neutrino (0), down-type (1/3), up-type (2/3), electron (1).
  check('the electric charges are 0, 1/3, 2/3, 1', () => {
    close(generation.electricCharges[0]!, 0, 1e-12)
    close(generation.electricCharges[1]!, 1 / 3, 1e-12)
    close(generation.electricCharges[2]!, 2 / 3, 1e-12)
    close(generation.electricCharges[3]!, 1, 1e-12)
  }),
])
