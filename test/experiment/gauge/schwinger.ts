// P8 / A4: the chiral condensate in a dynamical gauge field (the Schwinger model).
// The overlap fermion is placed in 2D U(1) gauge backgrounds of rising disorder, and we measure the
// near-zero spectral density of the gamma5-Hermitian overlap, which by Banks-Casher is proportional to the
// chiral condensate. The Schwinger condensate is nonzero purely from the anomaly and grows with gauge
// coupling, so the signal should rise with disorder. See note/questions/remaining-frontier-spec.md (A4).
//
// History. The pass recorded before 2026-09-25 (free density 0) was an artifact of E-FRC-0178: the matrix sign
// was built from eigenvectors that did not span degenerate eigenspaces, so the exact free zero modes were lost.
// With the sign fixed (Newton, E-MTH-0011) the shared operator (code/operator/overlap-condensate), periodic in
// both directions, has the free massless overlap's exact zero modes at p = 0: 2 of 2 L^2 = 50, a free
// density of 0.04. The first rebuild (2026-09-25) derived that count and kept the gate "the density rises above
// the free one with disorder": it FAILED (disorder 0.25 to 1: 0, 0, 0.0067, 0.0067 against 0.04), because
// any disorder lifts the p = 0 modes, which are a boundary artifact of a periodic fermion, not a condensate.
//
// The rebuild (2026-09-26, disclosed: the boundary changed after the periodic arm's fail; the comparison did
// not). The fermion is ANTIPERIODIC in time, the standard fermion boundary, through
// code/operator/overlap-boundary: time momenta (2 n + 1) pi / L, so the free overlap has no zero mode and its
// smallest |lambda| is sqrt(2 (1 - cos(pi / 5) / w)) = 0.618 on L = 5, far above the 0.05 window. The gauge
// backgrounds are the same Weyl draws as the shared operator's, config by config.
//
// Gates, fixed before this run:
// C1 the new operator with a PERIODIC time boundary reproduces the shared operator's density at every disorder
//    (the same backgrounds, the same Newton sign), exactly
// C2 the antiperiodic free density equals the momentum sum, 0, and the periodic one equals 0.04
// G  the antiperiodic near-zero density at the strongest disorder is above the free one (the registered claim)
// Reported: the periodic arm's comparison, and per disorder the exact zero modes (|lambda| < 1e-8) against the
// summed |Q| of the geometric U(1) charge, the index theorem on these rough fields.
// PREDICTION, written before the run: C1 and C2 hold, and G passes only if the rough fields carry exact zero
// modes or near-zero modes; with 3 configurations at L = 5 that is a thin statistic either way.
// Run: node_modules/.bin/tsx tmp/run-one.ts test/experiment/gauge/schwinger.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'
import { freeOverlapSpectrum, overlapCondensateWithBoundary } from '@/code/operator/overlap-boundary'

const LENGTH = 5
const M0 = 1
const TOLERANCE = 0.05
const CONFIGS = 3
const EXACT = 1e-12
const DISORDERS = [0, 0.25, 0.5, 0.75, 1.0]
const start = (disorder: number): number => 500 + Math.round(disorder * 100)

export default experiment({
  id: 'gauge/schwinger',
  code: 'E-FRC-0045',
  title:
    'the Schwinger chiral condensate signal with an antiperiodic fermion: the free overlap has no near-zero mode, and the near-zero density rises above it with gauge disorder',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const shared = DISORDERS.map(d => chiralCondensateSignal({ length: LENGTH, disorder: d, configs: CONFIGS, m0: M0, tolerance: TOLERANCE, rng: makeWeyl({ start: start(d) }) }).nearZeroDensity)
    const arm = (time: 'periodic' | 'antiperiodic') =>
      DISORDERS.map(d => overlapCondensateWithBoundary({ group: 'u1', length: LENGTH, disorder: d, configs: CONFIGS, m0: M0, tolerance: TOLERANCE, time, rng: makeWeyl({ start: start(d) }) }))
    const periodic = arm('periodic')
    const antiperiodic = arm('antiperiodic')
    const freePeriodic = freeOverlapSpectrum({ length: LENGTH, m0: M0, tolerance: TOLERANCE, time: 'periodic' })
    const freeAnti = freeOverlapSpectrum({ length: LENGTH, m0: M0, tolerance: TOLERANCE, time: 'antiperiodic' })

    const reproduces = periodic.every((r, i) => Math.abs(r.nearZeroDensity - shared[i]!) < EXACT)
    const freeControl = Math.abs(periodic[0]!.nearZeroDensity - freePeriodic.density) < EXACT && Math.abs(antiperiodic[0]!.nearZeroDensity - freeAnti.density) < EXACT
    const free = antiperiodic[0]!.nearZeroDensity
    const strong = antiperiodic[antiperiodic.length - 1]!.nearZeroDensity
    const ok = reproduces && freeControl && strong > free

    const metrics: Record<string, number> = { freeDensity: free, strongDensity: strong, freeLowestDerived: freeAnti.lowest }

    DISORDERS.forEach((d, i) => {
      const tag = Math.round(d * 100)

      metrics[`antiperiodicDensity${tag}`] = antiperiodic[i]!.nearZeroDensity
      metrics[`antiperiodicExactZero${tag}`] = antiperiodic[i]!.exactZeroModes
      metrics[`antiperiodicLowest${tag}`] = antiperiodic[i]!.lowestEigenvalue
      metrics[`absoluteCharge${tag}`] = antiperiodic[i]!.absoluteCharge
      metrics[`periodicDensity${tag}`] = periodic[i]!.nearZeroDensity
      metrics[`periodicExactZero${tag}`] = periodic[i]!.exactZeroModes
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with an antiperiodic fermion the free overlap has no near-zero mode (derived and measured ${free}, smallest free |lambda| ${freeAnti.lowest.toFixed(3)}), and the near-zero density at the strongest disorder is ${strong.toFixed(4)}, ${strong > free ? 'above' : 'not above'} it; the periodic fermion's p = 0 zero modes (free density ${freePeriodic.density}) are lifted by any disorder, so its comparison reads ${periodic[periodic.length - 1]!.nearZeroDensity.toFixed(4)} against ${periodic[0]!.nearZeroDensity}`,
      metrics,
      control: {
        periodicReproducesShared: reproduces ? 1 : 0,
        freeControl: freeControl ? 1 : 0,
        periodicFreeDerived: freePeriodic.density,
        antiperiodicFreeDerived: freeAnti.density,
      },
      notes:
        'L2, known physics, the Schwinger-model chiral condensate from the anomaly. The backgrounds are independent uniform link angles in [-pi d, pi d] drawn from a Weyl stream (deterministic), not a Wilson-action ensemble, so each density is an average over three fixed backgrounds, not a Monte Carlo estimate. The pass recorded before 2026-09-25 (free density 0) was an artifact of the E-FRC-0178 eigensolver defect. First run of the rebuild, 2026-09-26, FAIL: C1 and C2 hold (the periodic arm reproduces the shared operator exactly, free densities 0.04 and 0), but the antiperiodic near-zero density is 0, 0, 0, 0.0067, 0 over the disorders, so at the strongest disorder it is not above the free 0. One exact zero mode appears in 15 backgrounds (disorder 0.75), while the summed geometric |Q| is 0, 0, 3, 3, 2: the index theorem does not hold on these rough independent-link fields at m0 = 1, and they carry almost no topology the overlap can see. The honest reading is that this ensemble (3 backgrounds of 5 x 5, no gauge action) does not show the anomaly condensate, with either boundary; the earlier pass never did.',
    })
  },
})
