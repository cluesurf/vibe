// Conformance for code/substrate/coxeter/word: the word-problem engine. The Coxeter matrix has the right
// shape (1 on the diagonal, the symbol entries on the path, 2 off it); the ShortLex normal form cancels
// s_i s_i and is idempotent; and for a FINITE (spherical) symbol the enumerated chamber count equals the
// group order, which we re-derive independently: |I2(m)| = 2m, |A3| = 24, |B3| = 48. EXACT integers.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  coxeterMatrix,
  normalForm,
  buildWordMesh,
} from '@/code/substrate/coxeter/word'

suite('substrate/coxeter/word: the Coxeter matrix and normal form', [
  check('the Coxeter matrix is 1/diag, symbol/path, 2/elsewhere', () => {
    const m = coxeterMatrix([3, 4])
    equal(m[0]![0], 1, 'diag')
    equal(m[1]![1], 1, 'diag')
    equal(m[2]![2], 1, 'diag')
    equal(m[0]![1], 3, 'edge 0')
    equal(m[1]![2], 4, 'edge 1')
    equal(m[0]![2], 2, 'non-adjacent = 2')
    equal(m[1]![0], 3, 'symmetric')
  }),
  check('normal form cancels a repeated generator and is idempotent', () => {
    const m = coxeterMatrix([3])
    equal(normalForm([0, 0], m).length, 0, 's0 s0 cancels')
    equal(normalForm([1, 1], m).length, 0, 's1 s1 cancels')
    // s0 s1 s0 = s1 s0 s1 (the braid relation, length 3 either way), and the normal
    // form of either input is the same canonical reduced word.
    const a = normalForm([0, 1, 0], m)
    const b = normalForm([1, 0, 1], m)
    equal(a.join(','), b.join(','), 'braid-equivalent words share a normal form')
    equal(a.length, 3, 'reduced length 3')
    // idempotence: re-normalizing changes nothing.
    equal(normalForm(a, m).join(','), a.join(','), 'idempotent')
  }),
])

suite('substrate/coxeter/word: finite group orders', [
  check('dihedral groups I2(m) have order 2m', () => {
    for (const [m, order] of [[3, 6], [4, 8], [5, 10], [6, 12]] as const) {
      const mesh = buildWordMesh({ symbol: [m] })
      ok(mesh.finite, `I2(${m}) enumeration closed`)
      equal(mesh.chamberCount, order, `|I2(${m})| = ${order}`)
      equal(mesh.ballGrowth[0], 1, 'identity at length 0')
      equal(mesh.ballGrowth[1], 2, 'two generators at length 1')
    }
  }),
  check('A3 has order 24 and B3 has order 48', () => {
    const a3 = buildWordMesh({ symbol: [3, 3], maxLength: 16 })
    ok(a3.finite, 'A3 closed')
    equal(a3.chamberCount, 24, '|A3| = 24')
    const b3 = buildWordMesh({ symbol: [4, 3], maxLength: 16 })
    ok(b3.finite, 'B3 closed')
    equal(b3.chamberCount, 48, '|B3| = 48')
    equal(b3.ballGrowth[1], 3, 'three generators at length 1')
  }),
])
