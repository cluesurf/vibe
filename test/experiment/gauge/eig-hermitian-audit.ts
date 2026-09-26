// An audit of code/algebra/linear/eig-hermitian. eigHermitian embeds a Hermitian H = A + iB as the real
// symmetric [[A, -B], [B, A]] and keeps every second column of its eigenvectors. Each complex eigenvector v
// appears in the embedding twice, as v and as i v, so inside a degenerate eigenspace two kept columns can be
// the same complex line and the returned vectors can fail to span it (found by E-FRC-0168 on a photon triplet).
// The eigenvalues are right. Anything built from the eigenvectors of a degenerate eigenspace is not:
// hermitianMatrixSign sums sign(lambda) |v><v| and then is not a sign matrix. hermitianEigen
// (code/measure/photon-modes) completes each eigenspace by complex Gram-Schmidt over every column.
//
// Every experiment whose import graph reaches eig-hermitian was re-run unedited with the corrected solver
// swapped in by a path mapping (tmp/eig-hermitian-fixed.ts, tmp/tsconfig.audit.json, tmp/run-audit.sh): 14
// experiments. The eigenvalue-only users (law, g-factor-3434, index, color-shader, color-needs-amplitudes,
// einselection-complementarity, objectivity-needs-redundant-records) cannot change and did not. Of the
// eigenvector users, E-FRC-0045 schwinger and E-FRC-0048 su2-condensate change from pass to fail,
// singlet-from-pair-exchange changes in its sixteenth digit, and the three edge-mode experiments and
// gravity-from-entropy-positive-lambda are unchanged.
//
// This file holds the two checks that need no swap, fixed before the run:
// 1. the defect itself: on a 4 x 4 Hermitian matrix with eigenvalues 1, 1, 1, 2, eigHermitian's vectors
//    overlap by more than 0.1 and its matrix sign squares to the identity with an error above 0.1, where
//    hermitianEigen's vectors are orthonormal and its sign is exact, both to 1e-12
// 2. what it did to the two overlap experiments: the free massless overlap on a periodic box has exact zero
//    modes at p = 0 and none elsewhere (the doublers get sign +gamma5 at m0 = 1), 2 per color, so its near-zero
//    density is 2 / (2 L^2) for U(1) on L = 5 (0.04) and 4 / (4 L^2) for SU(2) on L = 3 (1/9). The shipped
//    code path's free density must differ from these by more than 0.01 for the defect to be shown there
//
// Depth L1: linear algebra and the free lattice Dirac spectrum.

import { makeComplexMatrix, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian, hermitianMatrixSign } from '@/code/algebra/linear/eig-hermitian'
import { hermitianEigen } from '@/code/measure/photon-modes'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'
import { chiralCondensateSignalSU2 } from '@/code/operator/overlap-su2'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const N = 4

// H = I + |u><u|, u a fixed normalized complex vector: eigenvalues 1, 1, 1, 2
function degenerateMatrix(): ComplexMatrix {
  const u = [
    [0.5, 0.1],
    [0.3, -0.4],
    [-0.2, 0.5],
    [0.1, 0.45],
  ]
  const norm = Math.sqrt(u.reduce((s, [a = 0, b = 0]) => s + a * a + b * b, 0))
  const m = makeComplexMatrix({ rows: N, cols: N })

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const [ar = 0, ai = 0] = u[i] ?? []
      const [br = 0, bi = 0] = u[j] ?? []

      m.re[i * N + j] = (i === j ? 1 : 0) + (ar * br + ai * bi) / (norm * norm)
      m.im[i * N + j] = (ai * br - ar * bi) / (norm * norm)
    }
  }

  return m
}

function largestOverlap(e: { vectorsRe: Float64Array; vectorsIm: Float64Array }): number {
  let worst = 0

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      let re = 0
      let im = 0

      for (let k = 0; k < N; k++) {
        const xr = e.vectorsRe[k * N + a] ?? 0
        const xi = e.vectorsIm[k * N + a] ?? 0
        const yr = e.vectorsRe[k * N + b] ?? 0
        const yi = e.vectorsIm[k * N + b] ?? 0

        re += xr * yr + xi * yi
        im += xr * yi - xi * yr
      }

      worst = Math.max(worst, Math.hypot(re, im))
    }
  }

  return worst
}

// sum sign(lambda) |v><v| from an eigen decomposition, and the largest entry of its square minus I
function signSquaredError(e: { values: Float64Array; vectorsRe: Float64Array; vectorsIm: Float64Array } | ComplexMatrix): number {
  const s =
    'form' in e
      ? e
      : (() => {
          const out = makeComplexMatrix({ rows: N, cols: N })

          for (let i = 0; i < N; i++) {
            const sign = Math.sign(e.values[i] ?? 0)

            for (let a = 0; a < N; a++) {
              for (let b = 0; b < N; b++) {
                const ar = e.vectorsRe[a * N + i] ?? 0
                const ai = e.vectorsIm[a * N + i] ?? 0
                const br = e.vectorsRe[b * N + i] ?? 0
                const bi = e.vectorsIm[b * N + i] ?? 0

                out.re[a * N + b] = (out.re[a * N + b] ?? 0) + sign * (ar * br + ai * bi)
                out.im[a * N + b] = (out.im[a * N + b] ?? 0) + sign * (ai * br - ar * bi)
              }
            }
          }

          return out
        })()

  let worst = 0

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < N; k++) {
        re += (s.re[i * N + k] ?? 0) * (s.re[k * N + j] ?? 0) - (s.im[i * N + k] ?? 0) * (s.im[k * N + j] ?? 0)
        im += (s.re[i * N + k] ?? 0) * (s.im[k * N + j] ?? 0) + (s.im[i * N + k] ?? 0) * (s.re[k * N + j] ?? 0)
      }

      worst = Math.max(worst, Math.hypot(re - (i === j ? 1 : 0), im))
    }
  }

  return worst
}

export default experiment({
  id: 'gauge/eig-hermitian-audit',
  code: 'E-FRC-0178',
  title:
    "an audit of the Hermitian eigensolver: its eigenvectors fail to span a degenerate eigenspace, so the matrix sign built on them is not a sign, and the two overlap-fermion condensate experiments passed their free-theory control only because of it: the free overlap's exact zero modes at p = 0 (densities 0.04 and 1/9) vanish under the shipped solver",
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const m = degenerateMatrix()
    const shipped = eigHermitian({ matrix: m })
    const fixed = hermitianEigen(m)
    const shippedOverlap = largestOverlap(shipped)
    const fixedOverlap = largestOverlap(fixed)
    const shippedSign = signSquaredError(hermitianMatrixSign({ matrix: m }))
    const fixedSign = signSquaredError(fixed)
    const u1Free = chiralCondensateSignal({ length: 5, disorder: 0, configs: 1, rng: makeRng({ seed: 500 }) }).nearZeroDensity
    const su2Free = chiralCondensateSignalSU2({ length: 3, disorder: 0, configs: 1, rng: makeRng({ seed: 700 }) }).nearZeroDensity
    const u1Exact = 2 / (2 * 5 * 5)
    const su2Exact = 4 / (4 * 3 * 3)
    const ok =
      shippedOverlap > 0.1 &&
      shippedSign > 0.1 &&
      fixedOverlap < 1e-12 &&
      fixedSign < 1e-12 &&
      Math.abs(u1Free - u1Exact) > 0.01 &&
      Math.abs(su2Free - su2Exact) > 0.01

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on a Hermitian matrix with a threefold eigenvalue the shipped solver returns eigenvectors overlapping by 0.76 and a matrix sign whose square misses the identity by 1.04, where the completed solver is exact, and the shipped overlap code path reports a free near-zero density that misses the exact free zero-mode density of the massless overlap',
      metrics: {
        shippedLargestOverlap: shippedOverlap,
        fixedLargestOverlap: fixedOverlap,
        shippedSignSquaredError: shippedSign,
        fixedSignSquaredError: fixedSign,
        u1FreeDensityShipped: u1Free,
        u1FreeDensityExact: u1Exact,
        su2FreeDensityShipped: su2Free,
        su2FreeDensityExact: su2Exact,
      },
      notes:
        'L1. The full re-run (tmp/run-audit.sh, the corrected solver path-mapped in place of the shipped one, no experiment edited), 2026-09-25: E-FRC-0045 schwinger free density 0 -> 0.04 with strong density 0.0133 unchanged, pass -> fail, since its gate asks free < 0.02 and strong > free; E-FRC-0048 su2-condensate free 0 -> 0.1111 and max 0.0222 -> 0.1111, pass -> fail; singlet-from-pair-exchange chain overlap 1.0000000000000009 -> 1.0000000000000004; the other 11 identical. The corrected free densities are the exact p = 0 zero modes, so those two experiments need their free control rebuilt (antiperiodic boundaries, or the p = 0 modes counted apart), not only the solver fixed. The conformance test of eig-hermitian used no degenerate matrix, which is how the defect passed it.',
    })
  },
})
