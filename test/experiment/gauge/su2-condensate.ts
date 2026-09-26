// B2: the chiral overlap fermion in a dynamical NON-ABELIAN SU(2) gauge field.
// The full chiral gauge theory is open, but this reaches the rung below it: a
// vector-like overlap fermion coupled to a dynamical SU(2) field, with the chiral
// condensate measured by the Banks-Casher near-zero density. The non-Abelian
// analogue of the Schwinger condensate. See note/questions/remaining-frontier-spec.md (B2).
//
// The free control is DERIVED, not assumed to be zero. The lattice is periodic in both directions
// (code/operator/overlap-su2), so the free massless overlap has exact zero modes at p = 0. Per momentum and
// color the free H_ov = gamma5 D_ov has eigenvalues +/- sqrt(2 (1 + a / w)), with a = sum(1 - cos p) - m0,
// w = sqrt(sum sin^2 p + a^2), which vanish only at p = 0 (the doublers have a > 0 at m0 = 1). On L = 3 with
// 2 colors that is 4 zero modes of 4 L^2 = 36, a free density of 1/9, and the next free eigenvalue is sqrt(3) = 1.73,
// far above the 0.05 window. The gate asks the measured free density to equal this momentum sum exactly. The
// derived value was chosen over antiperiodic time boundaries because the boundary is fixed inside the shared
// operator, which this experiment does not own.
//
// The earlier pass (free density 0) was an artifact of E-FRC-0178: code/algebra/linear/eig-hermitian
// returned non-orthonormal eigenvectors inside degenerate eigenspaces, so the matrix sign built from them
// was not a sign and the exact zero modes were lost. The sign is now a Newton iteration (E-MTH-0011).
// Run: node_modules/.bin/tsx tmp/run-one.ts test/experiment/gauge/su2-condensate.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { chiralCondensateSignalSU2 } from '@/code/operator/overlap-su2'

const LENGTH = 3
const M0 = 1
const TOLERANCE = 0.05
const COLORS = 2
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
  id: 'gauge/su2-condensate',
  code: 'E-FRC-0048',
  title:
    'a chiral condensate in a dynamical non-abelian SU(2) gauge field: the free density equals the exact p = 0 zero-mode count, and the near-zero density exceeds it with the field',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const disorders = [0, 0.3, 0.6, 1.0]
    const densities = disorders.map(
      disorder =>
        chiralCondensateSignalSU2({
          length: LENGTH,
          disorder,
          configs: 10,
          m0: M0,
          tolerance: TOLERANCE,
          rng: makeRng({ seed: 600 + Math.round(disorder * 100) }),
        }).nearZeroDensity,
    )

    const free = densities[0] ?? 0
    const maxSignal = Math.max(...densities)
    const derived = freeDensity(LENGTH, COLORS)
    const control = Math.abs(free - derived) < EXACT
    const ok = control && maxSignal > free

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the overlap fermion near-zero density equals the exact free zero-mode density in the free theory and exceeds it in a dynamical SU(2) gauge field, the non-abelian analogue of the Schwinger chiral condensate',
      metrics: {
        freeDensity: free,
        maxDensity: maxSignal,
        ...Object.fromEntries(disorders.map((d, i) => [`densityDisorder${Math.round(d * 100)}`, densities[i] ?? 0])),
      },
      control: {
        derivedFreeDensity: derived,
        freeMinusDerived: free - derived,
      },
      notes:
        'L2, known physics, a vector-like overlap fermion in a dynamical SU(2) field. The gauge configurations are pseudo-random, so the densities are Monte Carlo estimates over an ensemble. The free control is the momentum sum of the free overlap on the same periodic lattice, 4 exact zero modes at p = 0 of 36, 1/9. The pass recorded before 2026-09-25 (free density 0) was an artifact of the E-FRC-0178 eigensolver defect.',
    })
  },
})
