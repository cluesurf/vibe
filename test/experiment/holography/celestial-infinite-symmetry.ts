// Celestial holography seed: the boundary conformal symmetry is a continuous,
// unbounded family, while the substrate's exact point symmetry is finite. This
// is the discrete seed of the fact that celestial (asymptotic) symmetry is
// infinite dimensional, sitting above the finite symmetry of the bulk.
//
// The substrate's exact point symmetry acts on a boundary configuration through
// the D4 reflections, and its orbit closes to a finite set. The boundary
// conformal maps, the hyperbolic boosts, form a continuous family: sampling
// boosts along a deterministic grid of axes and radii keeps producing distinct
// boundary configurations, every one preserving the conformal cross-ratio, so
// the conformal family does not close. The finite exact symmetry is the control.
//
// Depth L1. This is a known contrast (a discrete point group is finite, the
// conformal group of the boundary sphere is a continuous Lie group), measured on
// the committed substrate. It is a seed, not a claim that vibe realizes the BMS
// or Virasoro algebra, which would presuppose emergent Lorentzian spacetime.

import { normalize, scale, type Vec } from '@/code/algebra/vector'
import { rootsD4, reflectRoot } from '@/code/algebra/group/root-system'
import { ballIsometry } from '@/code/geometry/mobius'
import { crossRatio } from '@/code/measure/cross-ratio'
import { orbitClosure } from '@/code/tool/orbit'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const FOUR_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, -1],
]

// a deterministic grid of boost radii, no random anywhere. Ten radii over the
// twenty-four root axes give 240 distinct conformal samples, past the finite
// point-symmetry orbit, so the conformal family provably exceeds it and, since
// every sample is distinct, does not close.
const BOOST_RADII = [
  0.15, 0.25, 0.35, 0.45, 0.55, 0.6, 0.65, 0.75, 0.85, 0.9,
]

const ORBIT_CAP = 20000

// a configuration is the ordered tuple of its four boundary points
type Config = Vec[]

function hashConfig(config: Config): string {
  return config.map(p => p.map(c => c.toFixed(6)).join(',')).join(';')
}

export default experiment({
  id: 'holography/celestial-infinite-symmetry',
  code: 'E-HLG-0024',
  title:
    'the boundary conformal family is unbounded while the substrate point symmetry is finite, the seed of infinite-dimensional celestial symmetry',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const roots = rootsD4()
    const start: Config = FOUR_DIRECTIONS.map(normalize)

    // the exact point symmetry: close the configuration under all D4 reflections
    const reflectionMaps = roots.map(
      a => (config: Config) =>
        config.map(p => normalize(reflectRoot(p, a))),
    )

    const orbit = orbitClosure({
      seed: start,
      maps: reflectionMaps,
      hash: hashConfig,
      cap: ORBIT_CAP,
    })

    const pointSymmetryOrbit = orbit.length
    const pointSymmetryFinite = pointSymmetryOrbit < ORBIT_CAP

    // the boundary conformal family: distinct boosts along every root axis and
    // every grid radius, each checked to preserve the conformal cross-ratio
    const crStart = crossRatio(start)
    const boostConfigs = new Set<string>()

    let worstConformalError = 0
    let sampleCount = 0

    for (const axis of roots) {
      for (const radius of BOOST_RADII) {
        sampleCount++

        const boost = ballIsometry(scale(normalize(axis), radius))
        const moved = start.map(boost)

        worstConformalError = Math.max(
          worstConformalError,
          Math.abs(crossRatio(moved) - crStart),
        )
        boostConfigs.add(hashConfig(moved))
      }
    }

    const conformalFamily = boostConfigs.size
    const allConformal = worstConformalError < 1e-9

    // the family is strictly, unboundedly larger than the finite exact symmetry
    const familyExceedsPointSymmetry =
      conformalFamily === sampleCount &&
      conformalFamily > pointSymmetryOrbit

    const ok =
      pointSymmetryFinite && allConformal && familyExceedsPointSymmetry

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the substrate point symmetry closes to a finite orbit while the conformal boosts produce a distinct configuration for every sample, each preserving the cross-ratio, so the boundary conformal symmetry is unbounded above the finite bulk symmetry',
      metrics: {
        pointSymmetryOrbit,
        conformalFamily,
        sampleCount,
        worstConformalError,
      },
      control: { pointSymmetryOrbit },
    })
  },
})
