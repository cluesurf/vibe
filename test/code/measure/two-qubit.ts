// Conformance for code/measure/two-qubit. Concurrence is 1 for a Bell state and 0 for a product
// state; the spin correlation matrix of |Phi+> is diag(1, -1, 1); and the Horodecki maximal CHSH
// is the Tsirelson value 2 sqrt 2 for a Bell state and 2 (no violation) for a product state. Every
// expected value is the textbook answer, re-derived independently of the implementation.

import { suite, check, close } from '@/test/code/harness'
import {
  twoQubitConcurrence,
  twoQubitCorrelationMatrix,
  horodeckiMaxChsh,
} from '@/code/measure/two-qubit'

const TIGHT = 1e-9
const INV_SQRT2 = 1 / Math.sqrt(2)

// |Phi+> = (|00> + |11>) / sqrt 2 in basis |00>,|01>,|10>,|11>.
const bell = {
  re: Float64Array.from([INV_SQRT2, 0, 0, INV_SQRT2]),
  im: new Float64Array(4),
}

// |00>, a product state.
const product = {
  re: Float64Array.from([1, 0, 0, 0]),
  im: new Float64Array(4),
}

// (|00> + |01>)/sqrt2 = |0> (x) (|0>+|1>)/sqrt2, also a product state.
const product2 = {
  re: Float64Array.from([INV_SQRT2, INV_SQRT2, 0, 0]),
  im: new Float64Array(4),
}

suite('measure/two-qubit: concurrence', [
  check('Bell state has concurrence 1 (maximally entangled)', () => {
    // C = 2|a00 a11 - a01 a10| = 2|0.5 - 0| = 1.
    close(twoQubitConcurrence(bell), 1, TIGHT)
  }),
  check('product state |00> has concurrence 0', () => {
    close(twoQubitConcurrence(product), 0, TIGHT)
  }),
  check('factorisable state |0>(|0>+|1>) has concurrence 0', () => {
    close(twoQubitConcurrence(product2), 0, TIGHT)
  }),
])

suite('measure/two-qubit: spin correlation matrix', [
  check('|Phi+> gives T = diag(1, -1, 1)', () => {
    const t = twoQubitCorrelationMatrix(bell)
    close(t[0]![0]!, 1, TIGHT) // <XX>
    close(t[1]![1]!, -1, TIGHT) // <YY>
    close(t[2]![2]!, 1, TIGHT) // <ZZ>
    // off-diagonal correlations vanish
    close(t[0]![1]!, 0, TIGHT)
    close(t[0]![2]!, 0, TIGHT)
    close(t[1]![2]!, 0, TIGHT)
  }),
  check('product state |00>: only <ZZ> = 1 survives', () => {
    const t = twoQubitCorrelationMatrix(product)
    close(t[2]![2]!, 1, TIGHT)
    close(t[0]![0]!, 0, TIGHT)
    close(t[1]![1]!, 0, TIGHT)
  }),
])

suite('measure/two-qubit: Horodecki maximal CHSH', [
  check('Bell state reaches the Tsirelson value 2 sqrt 2', () => {
    // T = diag(1,-1,1) -> M = T^T T = I, two largest eigenvalues 1+1=2, 2 sqrt 2.
    const t = twoQubitCorrelationMatrix(bell)
    close(horodeckiMaxChsh(t), 2 * Math.SQRT2, TIGHT)
  }),
  check('product state gives 2 (no Bell violation possible)', () => {
    // T = diag(0,0,1) -> two largest eigenvalues 1+0=1, 2 sqrt 1 = 2.
    const t = twoQubitCorrelationMatrix(product)
    close(horodeckiMaxChsh(t), 2, TIGHT)
  }),
])
