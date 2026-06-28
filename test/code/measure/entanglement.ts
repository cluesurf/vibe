// Conformance for code/measure/entanglement (free-fermion correlation-matrix method).
//   - The half-filled correlation matrix C is the orthogonal PROJECTOR onto the occupied modes:
//     it is symmetric, idempotent (C^2 = C), and its trace is the particle number floor(n/2).
//   - The region entropy S = -sum[ z ln z + (1-z) ln(1-z) ] over the restricted eigenvalues z:
//     a single mode at z = 1/2 contributes ln 2; modes at z in {0,1} contribute 0 (a product cut).
//   - The Page average entropy is checked against its closed form for small dimensions.

import { suite, check, close, closeArray } from '@/test/code/harness'
import {
  freeFermionCorrelationMatrix,
  regionEntanglementEntropy,
  crossCutConnectivity,
  pageAverageEntropy,
} from '@/code/measure/entanglement'
import { makeDense } from '@/code/algebra/linear/dense'

const TIGHT = 1e-9
const LN2 = Math.log(2)

// nearest-neighbour hopping chain of n sites, H[i,i+1] = H[i+1,i] = 1.
function hoppingChain(n: number) {
  const h = makeDense({ rows: n, cols: n })

  for (let i = 0; i + 1 < n; i++) {
    h.data[i * n + (i + 1)] = 1
    h.data[(i + 1) * n + i] = 1
  }

  return h
}

suite('measure/entanglement: correlation matrix is the occupied-mode projector', [
  check('trace equals the particle number floor(n/2)', () => {
    for (const n of [4, 6, 8]) {
      const c = freeFermionCorrelationMatrix({ h: hoppingChain(n), n })

      let tr = 0

      for (let i = 0; i < n; i++) {
        tr += c[i * n + i]!
      }

      close(tr, Math.floor(n / 2), TIGHT)
    }
  }),
  check('C is symmetric and idempotent (C^2 = C)', () => {
    const n = 6
    const c = freeFermionCorrelationMatrix({ h: hoppingChain(n), n })

    // symmetry
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(c[i * n + j]!, c[j * n + i]!, TIGHT)
      }
    }

    // idempotence: (C C)_ij = C_ij
    const c2 = new Float64Array(n * n)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0

        for (let k = 0; k < n; k++) {
          s += c[i * n + k]! * c[k * n + j]!
        }

        c2[i * n + j] = s
      }
    }

    closeArray(c2, c, 1e-8, 'C^2 must equal C')
  }),
])

suite('measure/entanglement: region entropy from restricted eigenvalues', [
  check('a single mode at occupation 1/2 gives ln 2', () => {
    const s = regionEntanglementEntropy({ c: Float64Array.from([0.5]), n: 1, region: [0] })
    close(s, LN2, TIGHT)
  }),
  check('two independent half-filled modes give 2 ln 2', () => {
    const c = Float64Array.from([0.5, 0, 0, 0.5])
    close(regionEntanglementEntropy({ c, n: 2, region: [0, 1] }), 2 * LN2, TIGHT)
  }),
  check('eigenvalues 0 and 1 (a product cut) give ~ 0 entropy', () => {
    const c = Float64Array.from([1, 0, 0, 0])
    close(regionEntanglementEntropy({ c, n: 2, region: [0, 1] }), 0, 1e-9)
  }),
])

suite('measure/entanglement: cross-cut connectivity', [
  check('sums |C_ij| over the region pair', () => {
    // c = [[a, b],[c, d]]; regionA={0}, regionB={1} -> |b|.
    const c = Float64Array.from([0.1, -0.7, 0.3, 0.4])
    close(
      crossCutConnectivity({ c, n: 2, regionA: [0], regionB: [1] }),
      0.7,
      TIGHT,
    )
  }),
])

suite('measure/entanglement: Page average entropy closed form', [
  check('a 1-dimensional subsystem has entropy 0', () => {
    close(pageAverageEntropy({ dimA: 1, dimB: 5 }), 0, TIGHT)
  }),
  check('S(2,2) = 1/3 + 1/4 - 1/4 = 1/3', () => {
    close(pageAverageEntropy({ dimA: 2, dimB: 2 }), 1 / 3, TIGHT)
  }),
  check('S(2,3) = (1/4 + 1/5 + 1/6) - 1/6 = 9/20', () => {
    close(pageAverageEntropy({ dimA: 2, dimB: 3 }), 0.45, TIGHT)
  }),
  check('is symmetric in its two dimensions', () => {
    close(
      pageAverageEntropy({ dimA: 3, dimB: 5 }),
      pageAverageEntropy({ dimA: 5, dimB: 3 }),
      TIGHT,
    )
  }),
])
