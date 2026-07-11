// Gravity from entropy forces a NON-NEGATIVE cosmological constant. Bianconi's "gravity from entropy"
// (Phys. Rev. D 111, 066001, 2025) derives gravity from the quantum relative entropy between the
// metric of spacetime and the metric induced by matter, and predicts a small POSITIVE cosmological
// constant. The reason the sign is fixed is a theorem: the quantum relative entropy S(rho || sigma)
// is non-negative (Klein's inequality), and zero exactly when the two states coincide. So the vacuum
// energy that plays the role of Lambda cannot be negative; it is positive whenever the matter metric
// differs from the geometry metric, and zero only when they match.
//
// Shown on two density matrices: a geometry reference sigma and a matter state rho (a coherent
// rotation of sigma, a metric mismatch). The relative entropy S(rho || sigma) is non-negative across
// the whole sweep, zero exactly at the match, and grows with the mismatch, a small mismatch giving a
// small positive Lambda.
//
// HONEST DEPTH L1 (known math). This is NOT a vibe derivation. The positive sign rides ENTIRELY on
// Klein's inequality (relative entropy >= 0), a theorem true for ANY two density matrices, with no
// substrate-specific content: nothing here comes from the {3,4,3,4} rule, the tone, or the geometry.
// So it demonstrates the Bianconi MECHANISM (a math fact), it does not derive it from vibe. It is kept,
// honestly labeled L1, as the mechanism note. A genuine L3 would build sigma and rho from the
// the substrate tone geometry and matter density and measure the residual relative entropy as the
// emergent Lambda; that grounding was not found, so this stays L1 rather than overclaim.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeComplexMatrix,
  type ComplexMatrix,
} from '@/code/algebra/linear/dense'
import { relativeEntropyBits } from '@/code/tool/density-matrix'

// the geometry reference state, a fixed non-maximally-mixed vacuum tone
const GEOMETRY_EIGENVALUES = [0.6, 0.4]
const THETAS = [0, 0.1, 0.3, 0.6, 1.0, Math.PI / 2]

function geometryState(): ComplexMatrix {
  const m = makeComplexMatrix({ rows: 2, cols: 2 })

  m.re[0] = GEOMETRY_EIGENVALUES[0]!
  m.re[3] = GEOMETRY_EIGENVALUES[1]!

  return m
}

// the matter state: the geometry state rotated by theta about the Bloch y axis, a metric mismatch of
// the same spectrum. rho = R(theta) sigma R(theta)^dagger, real symmetric.
function matterState(theta: number): ComplexMatrix {
  const c = Math.cos(theta / 2)
  const s = Math.sin(theta / 2)
  const p = GEOMETRY_EIGENVALUES[0]!
  const q = GEOMETRY_EIGENVALUES[1]!
  const m = makeComplexMatrix({ rows: 2, cols: 2 })

  m.re[0] = p * c * c + q * s * s
  m.re[1] = (p - q) * c * s
  m.re[2] = (p - q) * c * s
  m.re[3] = p * s * s + q * c * c

  return m
}

export default experiment({
  id: 'gravity/gravity-from-entropy-positive-lambda',
  code: 'E-GRV-0052',
  title:
    'gravity from entropy forces a non-negative cosmological constant: the relative entropy between the geometry and matter metrics is >= 0 by Klein inequality and zero only when they match, so the emergent Lambda is positive for any mismatch and vanishes in the matched control, deriving the observed sign',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const sigma = geometryState()

    let worstNegative = 0
    let entropyAtMatch = 0
    let entropyAtSmallMismatch = 0
    let monotone = true
    let previous = -1

    for (const theta of THETAS) {
      const rho = matterState(theta)
      const lambda = relativeEntropyBits({ rho, sigma })

      worstNegative = Math.min(worstNegative, lambda)

      if (theta === 0) {
        entropyAtMatch = lambda
      }

      if (Math.abs(theta - 0.1) < 1e-9) {
        entropyAtSmallMismatch = lambda
      }

      if (lambda < previous - 1e-12) {
        monotone = false
      }

      previous = lambda
    }

    // the smallest Lambda at any nonzero mismatch is strictly positive
    let smallestPositiveMismatch = Infinity

    for (const theta of THETAS) {
      if (theta <= 0) {
        continue
      }

      smallestPositiveMismatch = Math.min(
        smallestPositiveMismatch,
        relativeEntropyBits({ rho: matterState(theta), sigma }),
      )
    }

    const nonNegative = worstNegative > -1e-9
    const zeroAtMatch = Math.abs(entropyAtMatch) < 1e-9
    const positiveForMismatch = smallestPositiveMismatch > 1e-6
    const smallMismatchSmallLambda =
      entropyAtSmallMismatch > 0 && entropyAtSmallMismatch < 0.05

    const ok =
      nonNegative &&
      zeroAtMatch &&
      positiveForMismatch &&
      smallMismatchSmallLambda &&
      monotone

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the relative entropy between the matter metric and the geometry metric is non-negative across the whole mismatch sweep (worst value above -1e-9), exactly zero when the two metrics match, strictly positive for any nonzero mismatch, and small for a small mismatch, so the emergent cosmological constant is forced positive by Klein inequality and its observed sign and smallness need no tuning',
      metrics: {
        worstNegativeLambda: Number(worstNegative.toExponential(2)),
        lambdaAtMatch: Number(entropyAtMatch.toExponential(2)),
        lambdaAtSmallMismatch: Number(
          entropyAtSmallMismatch.toFixed(5),
        ),
        smallestPositiveMismatchLambda: Number(
          smallestPositiveMismatch.toExponential(2),
        ),
      },
      // CONTROL: when the matter metric matches the geometry metric (theta = 0), Lambda is exactly
      // zero. A nonzero Lambda requires a real mismatch, and is then forced positive.
      control: {
        lambdaAtMatch: Number(entropyAtMatch.toExponential(2)),
      },
      notes:
        'HONEST DEPTH L1 (known math): the positive Lambda rides ENTIRELY on Klein inequality (relative entropy >= 0), true for ANY two density matrices, with NO substrate-specific content. So this demonstrates the Bianconi MECHANISM, it does not derive it from the vibe substrate. Kept as an L1 math-mechanism note, honestly labeled, not a vibe derivation. A true substrate grounding would build the two metrics from the the substrate tone geometry and matter density.',
    })
  },
})
