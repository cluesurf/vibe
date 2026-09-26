// P8 / A4: the chiral condensate in a dynamical gauge field (the Schwinger model).
// The overlap fermion is placed in random 2D U(1) gauge backgrounds, and we
// measure the near-zero spectral density of the gamma5-Hermitian overlap, which by
// Banks-Casher is proportional to the chiral condensate. The Schwinger condensate
// is nonzero purely from the anomaly and grows with gauge coupling, so the signal
// should rise with disorder. See note/questions/remaining-frontier-spec.md (A4).
//
// The free control is DERIVED, not assumed to be zero. The lattice is periodic in both directions
// (code/operator/overlap-condensate), so the free massless overlap has exact zero modes at p = 0. Per
// momentum the free H_ov = gamma5 D_ov has eigenvalues +/- sqrt(2 (1 + a / w)), with a = sum(1 - cos p) - m0,
// w = sqrt(sum sin^2 p + a^2), which vanish only at p = 0 (the doublers have a > 0 at m0 = 1). On L = 5 that
// is 2 zero modes of 2 L^2 = 50, a free density of 0.04, and the next free eigenvalue is 1.18, far above the
// 0.05 window. The gate asks the measured free density to equal this momentum sum exactly. The derived value
// was chosen over antiperiodic time boundaries because the boundary is fixed inside the shared operator,
// which this experiment does not own.
//
// The earlier pass (free density 0) was an artifact of E-FRC-0178: code/algebra/linear/eig-hermitian
// returned non-orthonormal eigenvectors inside degenerate eigenspaces, so the matrix sign built from them
// was not a sign and the exact zero modes were lost. The sign is now a Newton iteration (E-MTH-0011).
// Run: node_modules/.bin/tsx tmp/run-one.ts test/experiment/gauge/schwinger.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'

const LENGTH = 5
const M0 = 1
const TOLERANCE = 0.05
const COLORS = 1
const EXACT = 1e-12

// The free overlap's near-zero density on a periodic L x L lattice, from the momentum sum
function freeDensity(length: number, colors: number): number {
  let near = 0
  let total = 0

  for (let k1 = 0; k1 < length; k1++) {
    for (let k2 = 0; k2 < length; k2++) {
      const p = [(2 * Math.PI * k1) / length, (2 * Math.PI * k2) / length]
      const a = p.reduce((s, x) => s + 1 - Math.cos(x), 0) - M0
      const w = Math.sqrt(p.reduce((s, x) => s + Math.sin(x) ** 2, 0) + a * a)
      const lambda = Math.sqrt(Math.max(0, 2 * (1 + a / w)))

      // two spin eigenvalues, +/- lambda, per color
      if (lambda < TOLERANCE) {
        near += 2 * colors
      }

      total += 2 * colors
    }
  }

  return near / total
}

export default experiment({
  id: 'gauge/schwinger',
  code: 'E-FRC-0045',
  title:
    'the Schwinger chiral condensate signal: the free density equals the exact p = 0 zero-mode count, and the near-zero density rises above it with gauge disorder',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const disorders = [0, 0.25, 0.5, 0.75, 1.0]
    const densities = disorders.map(
      disorder =>
        chiralCondensateSignal({
          length: LENGTH,
          disorder,
          configs: 3,
          m0: M0,
          tolerance: TOLERANCE,
          rng: makeWeyl({ start: 500 + Math.round(disorder * 100) }),
        }).nearZeroDensity,
    )

    const free = densities[0] ?? 0
    const strong = densities[densities.length - 1] ?? 0
    const derived = freeDensity(LENGTH, COLORS)
    const control = Math.abs(free - derived) < EXACT
    const ok = control && strong > free

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the near-zero spectral density of the overlap fermion, proportional to the chiral condensate by Banks-Casher, equals the exact free zero-mode density in the free theory and rises above it with gauge disorder, the anomaly-induced Schwinger condensate',
      metrics: {
        freeDensity: free,
        strongDensity: strong,
        ...Object.fromEntries(disorders.map((d, i) => [`densityDisorder${Math.round(d * 100)}`, densities[i] ?? 0])),
      },
      control: {
        derivedFreeDensity: derived,
        freeMinusDerived: free - derived,
      },
      notes:
        'L2, known physics, the Schwinger-model chiral condensate from the anomaly. The gauge backgrounds are pseudo-random, so each density is a Monte Carlo estimate over an ensemble. The free control is the momentum sum of the free overlap on the same periodic lattice, 2 exact zero modes at p = 0 of 50, 0.04. The pass recorded before 2026-09-25 (free density 0) was an artifact of the E-FRC-0178 eigensolver defect.',
    })
  },
})
