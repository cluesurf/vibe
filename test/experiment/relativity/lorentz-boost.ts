// P84: a genuine Lorentz (boost) invariance test, replacing the spatial-rotation
// proxy used elsewhere. The earlier "Lorentz-safe" claims (P27 etc.) measured only
// the angular isotropy of spatial link directions, which is rotation, not boost. A
// real Lorentz test must probe boosts. Here it does.
//
// The boost parameter of a timelike causal link a->b is its rapidity
//   eta = atanh(dx / dt),   (dt, dx) = coord(b) - coord(a).
// A boost by xi shifts every rapidity by xi (rapidities add). So a structure with
// NO preferred frame has a rapidity distribution that is flat (translation
// invariant) in the bulk, and one with a preferred frame has a peaked distribution.
// A Poisson sprinkling of Minkowski is Lorentz invariant in distribution, so its
// causal-link rapidities are broad and flat; a regular lattice has a rest frame, so
// its timelike links pile up at rapidity 0. We measure the concentration of the
// rapidity distribution (normalized entropy: 1 = perfectly flat, 0 = a single
// value) and confirm the sprinkle's distribution is boost-covariant (its shape is
// unchanged under an actual boost of the coordinates).
// Run: npx tsx code/experiment/p84-lorentz-boost.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { causalLattice } from '@/code/substrate/causal-lattice'
import { histogramFlatness } from '@/code/measure/histogram'
import { linkRapidities, boostCoords } from '@/code/measure/rapidity'
import { standardDeviation as std } from '@/code/measure/statistics'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Normalized Shannon entropy of the rapidity histogram, 1 = flat (boost-invariant),
// near 0 = concentrated (preferred frame).
function flatness(etas: number[], range: number, bins: number): number {
  return histogramFlatness({ samples: etas, range, bins })
}

export function lorentzBoost(input: { seed: number }): {
  sprinkleFlatness: number
  latticeFlatness: number
  sprinkleStd: number
  latticeStd: number
  boostedFlatness: number
  flatnessUnderBoost: number
  sprinkleIsFlat: boolean
  latticeIsPeaked: boolean
  boostCovariant: boolean
  solved: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const poset = sprinkleMinkowski({ dimension: 2, count: 4000, rng })
  const coords = poset.embedding?.coords ?? new Float64Array(0)
  const band = { lo: 0.25, hi: 0.75 }
  const RANGE = 2.0
  const BINS = 16

  const sprinkleEtas = linkRapidities({
    coords,
    links: poset.links,
    band,
  })
  const sprinkleFlatness = flatness(sprinkleEtas, RANGE, BINS)
  const sprinkleStd = std(sprinkleEtas)

  const lat = causalLattice({ half: 14 })
  const latticeCoords = lat.embedding?.coords ?? new Float64Array(0)
  const latticeEtas = linkRapidities({
    coords: latticeCoords,
    links: lat.links,
    band: null,
  })
  const latticeFlatness = flatness(latticeEtas, RANGE, BINS)
  const latticeStd = std(latticeEtas)

  // Actual boost of the sprinkle by rapidity xi: t' = cosh xi * t + sinh xi * x,
  // x' = sinh xi * t + cosh xi * x. The causal order (hence links) is unchanged;
  // we recompute rapidities in the new frame, recentre the band on the boosted
  // slice, and check the distribution shape (flatness) is preserved.
  const xi = 1.0
  const ch = Math.cosh(xi)
  const boosted = boostCoords({ coords, rapidity: xi })
  // boosted time band: map the central band's centre through the boost
  const tc = 0.5
  const boostedCentre = ch * tc
  const boostedBand = {
    lo: boostedCentre - 0.25 * ch,
    hi: boostedCentre + 0.25 * ch,
  }
  const boostedEtas = linkRapidities({
    coords: boosted,
    links: poset.links,
    band: boostedBand,
  })
  // de-mean both so we compare shape, not the (expected) shift by xi
  const meanShift = boostedEtas.length
    ? boostedEtas.reduce((a, b) => a + b, 0) / boostedEtas.length
    : 0
  const boostedCentered = boostedEtas.map(e => e - meanShift)
  const boostedFlatness = flatness(boostedCentered, RANGE, BINS)
  const flatnessUnderBoost = Math.abs(
    boostedFlatness - sprinkleFlatness,
  )

  const sprinkleIsFlat = sprinkleFlatness > 0.9
  const latticeIsPeaked =
    latticeFlatness < 0.6 && sprinkleStd > 3 * latticeStd
  const boostCovariant = flatnessUnderBoost < 0.1

  return {
    sprinkleFlatness,
    latticeFlatness,
    sprinkleStd,
    latticeStd,
    boostedFlatness,
    flatnessUnderBoost,
    sprinkleIsFlat,
    latticeIsPeaked,
    boostCovariant,
    solved: sprinkleIsFlat && latticeIsPeaked && boostCovariant,
  }
}

export default experiment({
  id: 'relativity/lorentz-boost',
  title:
    'sprinkle rapidity is flat and boost-covariant while a lattice peaks at a rest frame',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = lorentzBoost({ seed: 1 })
    const ok =
      r.solved &&
      r.sprinkleIsFlat &&
      r.latticeIsPeaked &&
      r.boostCovariant

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the sprinkle causal-link rapidity distribution is flat and boost-covariant with no preferred frame while a lattice piles up at rapidity zero',
      metrics: {
        sprinkleFlatness: r.sprinkleFlatness,
        sprinkleStd: r.sprinkleStd,
        latticeFlatness: r.latticeFlatness,
        latticeStd: r.latticeStd,
        flatnessUnderBoost: r.flatnessUnderBoost,
      },
      control: {
        latticeFlatness: r.latticeFlatness,
        latticeStd: r.latticeStd,
      },
    })
  },
})
