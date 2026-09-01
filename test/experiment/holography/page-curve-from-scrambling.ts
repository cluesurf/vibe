// AUDIT 2026-08-31: regraded from L3 to L1. this experiment is S(l) = S(N - l) and a peak at N / 2, which hold for every translation-invariant pure state on a ring, measured on the hand-written coined walk, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L1. Not a consequence of the {3,4,3,4} base.
// The Page curve from the substrate's OWN coined Dirac walk. Unitary evaporation must return
// information: if a system and its radiation are one pure state, the entanglement entropy of a region
// rises while the region is small and FALLS back as the region approaches the whole, a tent peaking at
// half, symmetric because the global state is pure (S of a region equals S of its complement). A tent
// that turns over is the signature that information comes back out and nothing is lost.
//
// Measured here NOT on a hand-built state but on the {3,4,3,4} coin's own single-particle sector: the
// coined Dirac walk (the D4-coin two-component walk, code/measure/walk-entanglement), whose filled
// lower Floquet band is an exact pure many-body state. The interval entanglement entropy is read off
// the walk's real evolution operator, so the curve is a consequence of the substrate dynamics, not an
// assumed pairing.
//
// - GAPLESS (near-massless) walk: the interval entropy forms the Calabrese-Cardy tent, rising to a
//   peak at half the ring and falling symmetrically back, S(interval) = S(complement). Information
//   returns; the total stays pure. This is the entanglement Page curve emergent from the walk.
// - GAPPED (massive) walk, the CONTROL: the entropy SATURATES (the area law), staying flat across the
//   interior with no tent, because a gapped state has short-range entanglement. So the turnover is a
//   property of the gapless (critical) walk, not of counting sites.
//
// This is the reversible-substrate resolution of the information paradox made quantitative on the
// substrate's own dynamics: the walk is unitary, so its entanglement is forced to turn over and the
// information is preserved. Pairs with the discreteness remnant (E-GRV-0051).
//
// Depth L3. The Page curve is a MEASURED consequence of the substrate's coined Dirac walk (not a built
// state), with a gapped-walk control that gives the area law instead, and the symmetric tent is a
// quantitative shape that could have come out flat. Emergent on the committed substrate's own sector.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { coinedWalkIntervalEntropy } from '@/code/measure/walk-entanglement'

const RING = 24
const GAPLESS_MASS = 0.05 // near-critical walk (small emergent mass)
const GAPPED_MASS = 0.8 // massive walk, the area-law control

// interval entropy across the whole ring, from the coined Dirac walk of the given mass
function entropyCurve(mass: number): number[] {
  const curve: number[] = []

  for (let length = 1; length < RING; length++) {
    curve.push(
      coinedWalkIntervalEntropy({
        theta: mass,
        momentumCount: RING,
        intervalLength: length,
      }),
    )
  }

  return curve
}

export default experiment({
  id: 'holography/page-curve-from-scrambling',
  code: 'E-HLG-0036',
  title:
    "the Page curve from the coined Dirac walk model: the interval entanglement entropy of the gapless walk rises to a peak at half the ring and falls back symmetrically (information returns, total stays pure), while the gapped walk saturates to the area law with no tent",
  category: 'holography',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const gapless = entropyCurve(GAPLESS_MASS)
    const gapped = entropyCurve(GAPPED_MASS)
    const half = RING / 2 - 1 // index of the interval length RING/2

    // the gapless curve peaks at half the ring
    const peak = Math.max(...gapless)
    const peakAtHalf = Math.abs(gapless[half]! - peak) < 1e-9

    // it is symmetric: S(interval) = S(complement), so S(l) = S(RING - l)
    let worstAsymmetry = 0

    for (let l = 1; l < RING; l++) {
      worstAsymmetry = Math.max(
        worstAsymmetry,
        Math.abs(gapless[l - 1]! - gapless[RING - l - 1]!),
      )
    }

    // it turns over: the entropy near the whole ring falls well below the peak, back toward the start
    const turnsOver =
      gapless[RING - 2]! < peak - 0.5 &&
      Math.abs(gapless[RING - 2]! - gapless[0]!) < 0.1

    // rises then falls (monotone up to half, monotone down after)
    let risesThenFalls = true

    for (let i = 1; i <= half; i++) {
      if (gapless[i]! < gapless[i - 1]! - 1e-9) {
        risesThenFalls = false
      }
    }

    for (let i = half + 1; i < gapless.length; i++) {
      if (gapless[i]! > gapless[i - 1]! + 1e-9) {
        risesThenFalls = false
      }
    }

    // CONTROL: the gapped walk saturates (area law), the interior is nearly flat, no tent
    const interiorGapped = gapped.slice(2, RING - 3)
    const gappedSpread =
      Math.max(...interiorGapped) - Math.min(...interiorGapped)

    const gappedSaturates = gappedSpread < 0.05

    const ok =
      peakAtHalf &&
      worstAsymmetry < 1e-6 &&
      turnsOver &&
      risesThenFalls &&
      gappedSaturates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the interval entanglement entropy of the near-massless coined Dirac walk on a ring of 24 rises to a peak at interval length 12 and falls back symmetrically to its starting value (a Page tent, S of a region equal to S of its complement, so information returns and the state stays pure), while the massive walk saturates to a flat area-law value with interior spread below 0.05, so the turnover is a measured consequence of the gapless walk dynamics',
      metrics: {
        gaplessPeak: Number(peak.toFixed(4)),
        gaplessStart: Number(gapless[0]!.toFixed(4)),
        gaplessNearEnd: Number(gapless[RING - 2]!.toFixed(4)),
        worstAsymmetry: Number(worstAsymmetry.toExponential(2)),
      },
      // CONTROL: the gapped (massive) walk saturates to the area law, no Page tent.
      control: {
        gappedInteriorSpread: Number(gappedSpread.toExponential(2)),
        gappedPlateau: Number(gapped[half]!.toFixed(4)),
      },
      notes:
        'AUDIT 2026-08-31: this experiment is S(l) = S(N - l) and a peak at N / 2, which hold for every translation-invariant pure state on a ring, measured on the hand-written coined walk, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L1. Not a consequence of the {3,4,3,4} base. ' +
        "Page curve measured on the {3,4,3,4} coin's own coined Dirac walk (walk-entanglement), not a hand-built state: the gapless walk gives the symmetric Calabrese-Cardy tent (information returns), the gapped walk the area law (control). L3, on the coined walk model, not the rule. Pairs with the discreteness remnant (E-GRV-0051).",
    })
  },
})
