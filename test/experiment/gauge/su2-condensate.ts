// B2: the chiral overlap fermion in a dynamical NON-ABELIAN SU(2) gauge field.
// The full chiral gauge theory is open, but this reaches the rung below it: a vector-like overlap fermion
// coupled to an SU(2) field, with the chiral condensate measured by the Banks-Casher near-zero density. The
// non-abelian analogue of the Schwinger condensate. See note/questions/remaining-frontier-spec.md (B2).
//
// History. The pass recorded before 2026-09-25 (free density 0) was an artifact of E-FRC-0178: the matrix sign
// was built from eigenvectors that did not span degenerate eigenspaces, so the exact free zero modes were lost.
// With the sign fixed (Newton, E-MTH-0011) the shared operator (code/operator/overlap-su2), periodic in both
// directions, has the free massless overlap's exact zero modes at p = 0: 4 of 4 L^2 = 36, a free density of
// 1/9. The first rebuild (2026-09-25) derived that count and kept the gate "the density exceeds the free one
// with the field": it FAILED (disorder 0.3 to 1: 0.017, 0, 0 against 1/9), because any field lifts the p = 0
// modes, a boundary artifact of a periodic fermion, not a condensate.
//
// The rebuild (2026-09-26, disclosed: the boundary changed after the periodic arm's fail; the comparison did
// not). The fermion is ANTIPERIODIC in time through code/operator/overlap-boundary: time momenta
// (2 n + 1) pi / L, no free zero mode, smallest free |lambda| = 1 on L = 3 (p = (0, pi / 3): a = -1/2, w = 1).
// The SU(2) backgrounds are the same Weyl draws as the shared operator's, config by config.
//
// Gates, fixed before this run:
// C1 the new operator with a PERIODIC time boundary reproduces the shared operator's density at every disorder,
//    exactly
// C2 the antiperiodic free density equals the momentum sum, 0, and the periodic one equals 1/9
// G  the largest antiperiodic near-zero density over the disorders is above the free one (the registered claim)
// Reported: the periodic arm's comparison and the exact zero modes per disorder.
// PREDICTION, written before the run: C1 and C2 hold; G is likely to FAIL, since SU(2) in two dimensions has no
// topological charge (pi_1(SU(2)) = 0), so the overlap has no protected zero mode, and on a 3 x 3 lattice the
// smallest free |lambda| is 1, twenty times the window.
// Run: node_modules/.bin/tsx tmp/run-one.ts test/experiment/gauge/su2-condensate.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import { chiralCondensateSignalSU2 } from '@/code/operator/overlap-su2'
import { freeOverlapSpectrum, overlapCondensateWithBoundary } from '@/code/operator/overlap-boundary'

const LENGTH = 3
const M0 = 1
const TOLERANCE = 0.05
const CONFIGS = 10
const EXACT = 1e-12
const DISORDERS = [0, 0.3, 0.6, 1.0]
const start = (disorder: number): number => 600 + Math.round(disorder * 100)

export default experiment({
  id: 'gauge/su2-condensate',
  code: 'E-FRC-0048',
  title:
    'a chiral condensate in a non-abelian SU(2) gauge field with an antiperiodic fermion: the free overlap has no near-zero mode, and the near-zero density exceeds it with the field',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const shared = DISORDERS.map(d => chiralCondensateSignalSU2({ length: LENGTH, disorder: d, configs: CONFIGS, m0: M0, tolerance: TOLERANCE, rng: makeWeyl({ start: start(d) }) }).nearZeroDensity)
    const arm = (time: 'periodic' | 'antiperiodic') =>
      DISORDERS.map(d => overlapCondensateWithBoundary({ group: 'su2', length: LENGTH, disorder: d, configs: CONFIGS, m0: M0, tolerance: TOLERANCE, time, rng: makeWeyl({ start: start(d) }) }))
    const periodic = arm('periodic')
    const antiperiodic = arm('antiperiodic')
    const freePeriodic = freeOverlapSpectrum({ length: LENGTH, m0: M0, tolerance: TOLERANCE, time: 'periodic' })
    const freeAnti = freeOverlapSpectrum({ length: LENGTH, m0: M0, tolerance: TOLERANCE, time: 'antiperiodic' })

    const reproduces = periodic.every((r, i) => Math.abs(r.nearZeroDensity - shared[i]!) < EXACT)
    const freeControl = Math.abs(periodic[0]!.nearZeroDensity - freePeriodic.density) < EXACT && Math.abs(antiperiodic[0]!.nearZeroDensity - freeAnti.density) < EXACT
    const free = antiperiodic[0]!.nearZeroDensity
    const maxSignal = Math.max(...antiperiodic.map(r => r.nearZeroDensity))
    const ok = reproduces && freeControl && maxSignal > free

    const metrics: Record<string, number> = { freeDensity: free, maxDensity: maxSignal, freeLowestDerived: freeAnti.lowest }

    DISORDERS.forEach((d, i) => {
      const tag = Math.round(d * 100)

      metrics[`antiperiodicDensity${tag}`] = antiperiodic[i]!.nearZeroDensity
      metrics[`antiperiodicExactZero${tag}`] = antiperiodic[i]!.exactZeroModes
      metrics[`antiperiodicLowest${tag}`] = antiperiodic[i]!.lowestEigenvalue
      metrics[`periodicDensity${tag}`] = periodic[i]!.nearZeroDensity
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with an antiperiodic fermion the free SU(2) overlap has no near-zero mode (derived and measured ${free}, smallest free |lambda| ${freeAnti.lowest.toFixed(3)}), and the largest near-zero density over the disorders is ${maxSignal.toFixed(4)}, ${maxSignal > free ? 'above' : 'not above'} it; the periodic fermion's p = 0 zero modes (free density ${freePeriodic.density.toFixed(4)}) are lifted by the field`,
      metrics,
      control: {
        periodicReproducesShared: reproduces ? 1 : 0,
        freeControl: freeControl ? 1 : 0,
        periodicFreeDerived: freePeriodic.density,
        antiperiodicFreeDerived: freeAnti.density,
      },
      notes:
        'L2, known physics, a vector-like overlap fermion in an SU(2) field. The backgrounds are fixed Weyl draws of near-identity quaternions (q_i uniform in [-d, d], normalized), not a Wilson-action ensemble and not Haar at d = 1. The pass recorded before 2026-09-25 (free density 0) was an artifact of the E-FRC-0178 eigensolver defect. First run of the rebuild, 2026-09-26, FAIL, as predicted: C1 and C2 hold (the periodic arm reproduces the shared operator exactly, free densities 1/9 and 0), but the antiperiodic density is 0 at every disorder, the smallest |lambda| falling only from 1.00 to 0.60, twelve times the window, and no exact zero mode appears. On a 3 x 3 lattice with no topology in two-dimensional SU(2) nothing brings a mode near zero: the experiment as built cannot show a condensate.',
    })
  },
})
