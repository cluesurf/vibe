// Composite light from two fear walks (E-FRC-0186): candidate 3 of the E-FRC-0181 follow-up. The fear walk is
// exactly linear and unitary, so a photon built as a bilinear of two walks, O_sigma(K) = sum_p psi(p)^dagger
// sigma phi(p + K), would need no force table at all. The hypothesis: the pair sector holds two transverse
// husk modes with a linear dispersion at small K.
//
// What the symbol says before any number (code/measure/composite-light): two free linear walks carry the pair
// amplitude at relative momentum p by U(p + K) R U(p)^dagger, so the pair sector at K is block diagonal in p
// and its spectrum is the set of differences theta_s'(p + K) - theta_s(p) over the whole Brillouin zone. An
// isolated branch needs a difference independent of p, which a walk with a rest mass (the fear walk's band
// bends as k^2 / (2 sqrt 3) in one dimension, E-CMP-0017) does not have. So the same-branch pairs form a
// continuum from -v_max |K| to v_max |K| (its EDGE is linear in K, the only linear thing in the sector), the
// opposite-branch pairs a gapped band near 2 pi / 3, and any bilinear dephases within about one period of
// the edge frequency. This is the lattice form of Pryce's objection to the neutrino theory of light: free
// constituents give a continuum, not a particle. The prediction is FAIL.
//
// The walk on the husk: the coin [[a, b], [b, a]], 2 a = 1 + omega, 2 b = 1 - omega, then a stream along one
// axis, in the palindrome x y z z y x per beat (the 3D analogue of the x y y x order of E-FRC-0176).
//
// Gates, fixed before the run:
// G0 the symbol is the fear walk: unitary to 1e-14 at every k of the side-16 torus, and with the single
//    substep x its eigenphases are pi / 3 +- W(k), cos W = cos(k) / 2 (E-CMP-0017), within 1e-12
// G1 the hypothesis: at K = (2 pi / L)(1, 0, 0), L = 16 and 32, at least two of the four bilinears sigma_0 ..
//    sigma_3 keep a correlator |C_sigma(t)| / |C_sigma(0)| of at least 0.5 averaged over t from 3 to 10
//    periods of the pair continuum's edge frequency (infinite temperature, every pair weighted equally)
// Status: pass if G0 and G1 pass, fail if G1 fails (the hypothesis is refuted), fail if G0 fails.
// Reported: the continuum edge over |K| at L = 8, 16, 32 and along (1,0,0), (1,1,0), (1,1,1), the count of
// pair frequencies below the edge, and the opposite-branch gap.
//
// Depth L2: the exact two-particle spectrum of a free walk, from its symbol.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { continuumEdge, correlator, crossGap, eigen2, pairSpectrum, PAULI, unitarityDefect, walkSymbol } from '@/code/measure/composite-light'

export default experiment({
  id: 'gauge/composite-light',
  code: 'E-FRC-0186',
  title:
    'composite light from two fear walks: the pair sector of two free linear walks at total momentum K is the continuum of differences theta(p + K) - theta(p), so a bilinear photon dephases within about one period instead of carrying two transverse modes with a linear dispersion',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // G0
    let unitary = 0
    let dispersion = 0
    const side = 16

    for (let i = 0; i < side ** 3; i++) {
      const k = [(i % side) * ((2 * Math.PI) / side), (Math.floor(i / side) % side) * ((2 * Math.PI) / side), Math.floor(i / (side * side)) * ((2 * Math.PI) / side)]

      unitary = Math.max(unitary, unitarityDefect(walkSymbol(k)))
    }

    for (let j = 0; j < 64; j++) {
      const k = -Math.PI + ((j + 0.5) * 2 * Math.PI) / 64
      const e = eigen2(walkSymbol([k, 0, 0], [0]))
      const w = Math.acos(Math.cos(k) / 2)
      const expected = [Math.PI / 3 - w, Math.PI / 3 + w].map(x => x - 2 * Math.PI * Math.round(x / (2 * Math.PI))).sort((a, b) => a - b)

      dispersion = Math.max(dispersion, Math.abs(e.theta[0] - expected[0]!), Math.abs(e.theta[1] - expected[1]!))
    }

    metrics['g0UnitarityDefect'] = unitary
    metrics['g0DispersionError'] = dispersion

    const okG0 = unitary < 1e-14 && dispersion < 1e-12

    // G1 and the reports
    let okG1 = true

    for (const L of [8, 16, 32]) {
      for (const [tag, kIndex] of [
        ['X', [1, 0, 0]],
        ['XY', [1, 1, 0]],
        ['XYZ', [1, 1, 1]],
      ] as const) {
        if (tag !== 'X' && L !== 16) {
          continue
        }

        const spectrum = pairSpectrum(L, kIndex)
        const edge = continuumEdge(spectrum)
        const kNorm = ((2 * Math.PI) / L) * Math.hypot(...kIndex)
        const prefix = `l${L}${tag}`

        metrics[`${prefix}EdgeOverK`] = edge.top / kNorm
        metrics[`${prefix}BottomOverK`] = edge.bottom / kNorm
        metrics[`${prefix}SameBranchPairs`] = edge.count
        metrics[`${prefix}CrossGap`] = crossGap(spectrum)

        if (tag !== 'X' || L === 8) {
          continue
        }

        const period = (2 * Math.PI) / edge.top
        const times = Array.from({ length: 40 }, (_, i) => Math.round(period * (3 + (7 * i) / 39)))
        let surviving = 0

        PAULI.forEach((_, n) => {
          const zero = correlator(spectrum, n, 0)
          const kept = times.reduce((s, t) => s + correlator(spectrum, n, t), 0) / times.length / zero

          metrics[`${prefix}Sigma${n}Kept`] = kept
          metrics[`${prefix}Sigma${n}AtOnePeriod`] = correlator(spectrum, n, Math.round(period)) / zero
          surviving += kept >= 0.5 ? 1 : 0
        })

        metrics[`${prefix}Surviving`] = surviving
        metrics[`${prefix}EdgePeriodBeats`] = period
        okG1 = okG1 && surviving >= 2
      }
    }

    metrics['gateG0'] = okG0 ? 1 : 0
    metrics['gateG1'] = okG1 ? 1 : 0

    return verdict({
      status: okG0 && okG1 ? 'pass' : 'fail',
      claim:
        'a bilinear of two free fear walks on the husk carries two transverse modes with a linear dispersion at small K: at least two of the four slot bilinears keep half their correlator from 3 to 10 periods of the pair continuum edge',
      metrics,
      notes:
        "L2, exact symbol, deterministic (no samples). Run 1 (tmp/frc0186.log) returned NaN for every correlator: at some k of the 3D palindromic walk the two eigenvalues coincide (U is a multiple of the identity there) and the projector formula divided by zero. Fixed in code/measure/composite-light (a degenerate unitary is one eigenspace), no gate changed, run 2 (tmp/frc0186-run2.log) is the result. G0 passes (unitary to 1.6e-15, the 1D dispersion to 4.4e-16). G1 FAILS: no bilinear survives. Averaged over 3 to 10 edge periods the four slot bilinears keep 8.2, 5.3, 7.6, 6.2 percent at L = 16 and 8.8, 2.1, 6.6, 2.7 percent at L = 32, and already only 2 to 24 percent at one period: the composite dephases within about one period. The only linear thing in the pair sector is the EDGE of the same-branch continuum, and it is anisotropic: edge / |K| = 0.98 along (1,0,0), 1.39 along (1,1,0), 1.70 along (1,1,1) at L = 16, i.e. the L1 norm of K, not |K|. A header prediction was wrong and is corrected here: the opposite-branch pairs are NOT gapped near 2 pi / 3 in 3D. Their smallest |omega| falls as 1 / L (0.72, 0.39, 0.20 at L = 8, 16, 32, and 0.056 along (1,1,1)), so the 3D walk's two bands touch, and the opposite-branch continuum also reaches zero. That only widens the continuum. Verdict: free fear walks give a pair continuum, not a photon (Pryce's objection on the lattice). A composite photon would need an interaction that binds the pair into an isolated branch, which is a force table again.",
    })
  },
})
