// Conformance for code/algebra/linear/eig-lanczos-complex: the matrix-free complex
// Lanczos. Two facts: largestEigenvalueOfSquare finds max lambda^2 of H (power
// iteration on H^2), and lowestAbsoluteEigenvalues finds the |lambda| nearest zero
// via folded Lanczos on C*I - H^2. We use a real diagonal Hermitian operator with
// values {-3, -1, 2, 4}: H^2 has spectrum {9, 1, 4, 16}, so the largest square is 16
// and the |lambda| sorted ascending are {1, 2, 3, 4}.

import { suite, check, close, closeArray } from '@/test/code/harness'
import {
  largestEigenvalueOfSquare,
  lowestAbsoluteEigenvalues,
  ComplexVector,
} from '@/code/algebra/linear/eig-lanczos-complex'
import { makeRng } from '@/code/tool/rng'

const DIAG = [-3, -1, 2, 4]

// H |x> with H = diag(DIAG), acting on the split complex vector.
function diagApply(input: ComplexVector, output: ComplexVector): void {
  for (let i = 0; i < DIAG.length; i++) {
    output.re[i] = DIAG[i]! * input.re[i]!
    output.im[i] = DIAG[i]! * input.im[i]!
  }
}

suite('algebra/linear/eig-lanczos-complex: diagonal Hermitian', [
  check('largestEigenvalueOfSquare(H) = max lambda^2 = 16', () => {
    const rng7 = makeRng({ seed: 7 })
    const lambda = largestEigenvalueOfSquare({
      apply: diagApply,
      dimension: DIAG.length,
      rand: (): number => rng7.next(),
    })

    close(lambda, 16, 1e-6, 'max(lambda^2)')
  }),
  check('lowestAbsoluteEigenvalues gives {1,2,3,4} ascending', () => {
    const rng11 = makeRng({ seed: 11 })
    const vals = lowestAbsoluteEigenvalues({
      apply: diagApply,
      dimension: DIAG.length,
      fold: 17, // just above max(lambda^2) = 16
      steps: DIAG.length,
      count: DIAG.length,
      rand: (): number => rng11.next(),
    })

    closeArray(
      vals,
      [1, 2, 3, 4],
      1e-6,
      '|lambda| nearest zero, ascending',
    )
  }),
  check('the two smallest |lambda| are {1, 2}', () => {
    const rng3 = makeRng({ seed: 3 })
    const vals = lowestAbsoluteEigenvalues({
      apply: diagApply,
      dimension: DIAG.length,
      fold: 17,
      steps: DIAG.length,
      count: 2,
      rand: (): number => rng3.next(),
    })

    closeArray(vals, [1, 2], 1e-6, 'two nearest zero')
  }),
])
