// Conformance for code/operator/evolution: the finite state space and the Hamiltonian
// read from a step permutation's cycle structure. We test the parts whose math is
// self-contained:
//   - makeStateSpace dimension = valueCount(alphabet)^cells (exact integer).
//   - hamiltonianFromPermutation: a non-permutation is rejected; a permutation's
//     eigen-phases are 2*pi*k/L per cycle of length L (identity -> all zero, an n-cycle
//     -> the n-th roots' phases, two transpositions -> {0,0,pi,pi}).
//
// permutationOfRule (which needs the full rule/substrate/configuration machinery) is
// covered indirectly: the experiments build their permutation through it and feed it here.

import {
  suite,
  check,
  equal,
  close,
  ok,
  notOk,
} from '@/test/code/harness'
import {
  makeStateSpace,
  hamiltonianFromPermutation,
} from '@/code/operator/evolution'

suite('operator/evolution: state space', [
  check('dimension is valueCount^cells', () => {
    equal(
      makeStateSpace({ cells: 2, alphabet: { form: 'ternary' } })
        .dimension,
      9,
      '3^2',
    )
    equal(
      makeStateSpace({ cells: 3, alphabet: { form: 'boolean' } })
        .dimension,
      8,
      '2^3',
    )
    equal(
      makeStateSpace({ cells: 2, alphabet: { form: 'clock', q: 4 } })
        .dimension,
      16,
      '4^2',
    )
  }),
])

suite('operator/evolution: Hamiltonian from a permutation', [
  check('a non-permutation is rejected', () => {
    // index 0 is hit twice, index 3 never: not a bijection.
    const out = hamiltonianFromPermutation({
      perm: Int32Array.from([0, 0, 1, 2]),
    })

    notOk(out.isPermutation, 'detected as not a permutation')
    notOk(out.boundedBelow, 'not bounded below')
    equal(out.eigenvalues.length, 0, 'no eigenvalues')
  }),
  check('the identity has all-zero eigen-phases', () => {
    const out = hamiltonianFromPermutation({
      perm: Int32Array.from([0, 1, 2, 3]),
    })

    ok(out.isPermutation, 'identity is a permutation')
    equal(out.eigenvalues.length, 4, 'one phase per state')

    for (const e of out.eigenvalues) {
      close(e, 0, 1e-12, 'every length-1 cycle contributes phase 0')
    }
  }),
  check('a single 4-cycle gives the four 4th-root phases', () => {
    const out = hamiltonianFromPermutation({
      perm: Int32Array.from([1, 2, 3, 0]),
    })

    const expected = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    equal(out.eigenvalues.length, 4, 'four phases')

    for (let k = 0; k < 4; k++) {
      close(
        out.eigenvalues[k]!,
        expected[k]!,
        1e-12,
        `phase 2*pi*${k}/4`,
      )
    }
  }),
  check('two transpositions give {0,0,pi,pi}', () => {
    const out = hamiltonianFromPermutation({
      perm: Int32Array.from([1, 0, 3, 2]),
    })

    const expected = [0, 0, Math.PI, Math.PI]

    for (let k = 0; k < 4; k++) {
      close(out.eigenvalues[k]!, expected[k]!, 1e-12, `phase ${k}`)
    }
  }),
])
