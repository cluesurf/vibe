// The wave-shaped carried remainder (E-FRC-0185): the quantization noise put into the image of the
// leapfrog's own operator, where it is a change of variables and not a force.
//
// Candidate 2 of the E-FRC-0181 follow-up asked to carry each plaquette's error to its neighbors so the noise
// becomes pure gauge. E-FRC-0183 showed that cannot be done: every kick is a curl, and a curl is orthogonal to
// every gauge direction (C g = 0), so gauge noise would need a gradient kick and break Gauss's law. What CAN be
// done is its dynamical analogue. The error diffusion
//
//   f_t = kappa B_t + u_t - 2 u_(t-1) + u_(t-2) + kappa (C C^T u_(t-1))
//
// (two carried integers per plaquette, u in [0, 1), and each plaquette's previous error spread to the 24
// plaquettes that share a link with it, code/rule/photon-shaped `wave`) gives the kick noise C^T e_t = w_t -
// 2 w_(t-1) + w_(t-2) + kappa M w_(t-1), w = C^T u: the leapfrog's own wave operator applied to w. So the
// shifted field A~_t = A_t + C^T u_(t-1) obeys the exactly linear leapfrog with no noise at all, and the
// integer field is the linear photon field plus a bounded, non-propagating dither: A = A~ - w_(t-1) and
// E = E~ - (w_t - w_(t-1)). Its noise transfer function 1 - (2 - kappa M) z + z^2 is zero on every branch's
// shell (E-FRC-0183 G1, to 4e-16). The one noise left is the rounding of the spatial term to 1 / q: white,
// variance 1 / (12 q^2) per plaquette-beat, predicted heating 2.4e-7 per beat on the F1 box.
//
// Predictions, fixed before the run:
// - S: from an all-zero carried start the shadow (A + C^T u_(t-2), E + C^T (u_(t-1) - u_(t-2))) IS the
//   floating-point linear leapfrog from the same integer start, to the random walk of the rounding (of order
//   1e-3 flux units after 2,000 beats), wherever no plaquette crosses the linear table's seam at |B| = N / 2
// - F: no resonant heating at all, so the F1 growth and the F2 drift are set by the bounded dither's
//   fluctuation, far under the gates, unless the seam is crossed (wraps are counted)
// - D: the shadow reads the hot husk photon as the linear rule does; the raw flux carries the dither, whose
//   power is tiny beside a hot field's, so the raw reading follows
// - B: the raw flux carries the dither E - E~ = -(w_t - w_(t-1)), about 1.2 flux units rms per bulk link, which
//   a three-point reading of a small wave takes as a bias of order the dither's power over the wave's. At
//   peak |B| 1 or 2 the wave's flux is about 0.2 to 0.4 units per link, so B may fail there for that reason
//   alone while the shadow reading stays exact
// - E: x times the charge is the dither's time average, charge independent and far under 1.4 units, so E1 is
//   predicted to pass; E2 (falling with charge) is not predicted either way, because a floor that does not
//   depend on the charge neither rises nor falls with it
//
// Choices, fixed before the run: N = 8192, K = 80, p / q = 4021 / 65536, the linear table (E-FRC-0181). The
// carried integers start at ZERO, the start at which the shadow is the linear run itself; the golden Weyl
// start is reported beside. Boxes as E-FRC-0184 (side 8 for B to E, side 4 for F1), section D on side 8 with
// the floating-point linear rule and the E-FRC-0181 remainder beside it.
//
// Gates, the caller's battery (as E-FRC-0184) and two of this rule's own, fixed before the run:
// A  exact integer reversibility and Gauss's law, as E-FRC-0184 A
// B  coherent husk waves at m1, peak |B| 1 to 8: every reading of the flux within 1e-3 of the symbol
// C  every coherent husk wave at |B| 16 to 1024 (4 modes, both polarizations) within 1e-3
// D  the lagged hot-field estimator (at least one light branch) and the autocorrelation zero crossing within
//    2 percent, the linear control D0 within 2 percent on the same protocol
// E1 x times the charge under 1.4 flux units at e = 16, 64, 256. E2 falling with charge
// F1 shadow-energy growth at most half of the E-FRC-0164 rule's, F2 drift at most half
// S  the shadow tracks the linear leapfrog within 0.01 flux units on every link and beat, 2,000 beats from the
//    E-FRC-0164 start (side 4) and from the hot start (side 8)
// H  the carried integers are recomputed from the angle history alone (the running sums of copied flux) with
//    0 mismatches over 500 beats
// Status: pass if every gate passes, partial if A and S pass, fail otherwise.
//
// Depth L2: an error-feedback quantizer whose noise transfer function is the leapfrog's own operator, derived
// through the symbol (E-FRC-0183) and measured against the exact linear theory.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { controlMetrics, heatControls, hotHusk, sectionA, sectionBC, sectionE, sectionF, sectionH, sectionS } from '@/code/measure/photon-battery'

export default experiment({
  id: 'gauge/photon-noise-wave',
  code: 'E-FRC-0185',
  title:
    "the wave-shaped carried remainder: each plaquette's quantization error fed back through 1 - (2 - kappa M) z + z^2, second order in time and spread to the plaquettes sharing its links, so the integer field is the exactly linear photon field plus a bounded dither that does no dynamics, an exact integer bijection with Gauss exact, tested on the light battery",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const controls = heatControls()

    Object.assign(metrics, controlMetrics(controls))
    Object.assign(metrics, hotHusk('linear', 'd0Linear', { dither: 'zero', side: 8 }))
    Object.assign(metrics, hotHusk('remainder', 'dRemainder', { dither: 'weyl', side: 8 }))

    const d0 = Math.abs(metrics['d0LinearLaggedOverExact'] ?? 1) < 0.02 && Math.abs(metrics['d0LinearDirectOverExact'] ?? 1) < 0.02
    const a = sectionA('wave')
    const s = sectionS()
    const h = sectionH('wave')
    const f = sectionF('wave', { dither: 'zero' }, controls)
    const d = hotHusk('wave', 'd', { dither: 'zero', side: 8 })
    const dWeyl = hotHusk('wave', 'dWeyl', { dither: 'weyl', side: 8 })
    const bc = sectionBC('wave', { dither: 'zero', other: 'weyl', bound: 1e-3 })
    const e = sectionE('wave', { dither: 'zero', other: 'weyl', floor: 1.4 })
    const okD = (d['dLaggedLightBranches'] ?? 0) >= 1 && Math.abs(d['dLaggedOverExact'] ?? 1) < 0.02 && Math.abs(d['dDirectOverExact'] ?? 1) < 0.02
    const okS = (s['sF1ShadowFromLinearWorst'] ?? 1) < 0.01 && (s['sHotShadowFromLinearWorst'] ?? 1) < 0.01
    const gates = { A: a.ok, B: bc.okB, C: bc.okC, D: okD ? 1 : 0, D0: d0 ? 1 : 0, E1: e.okE1, E2: e.okE2, F1: f.okF1, F2: f.okF2, S: okS ? 1 : 0, H: h.ok }
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => !key.startsWith('ok')))

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok
    }

    return verdict({
      status: Object.values(gates).every(x => x === 1) ? 'pass' : a.ok === 1 && okS ? 'partial' : 'fail',
      claim:
        'with the error fed back through the leapfrog operator the beat stays an exact integer bijection with Gauss exact, the integer field shadows the exactly linear photon field to the rounding of one term, and the light battery passes: coherent husk waves within 1e-3 at |B| 1 to 1024, the lagged hot-field estimator within 2 percent, the love-fear floor under 1.4 flux units and falling with charge, at most half of the E-FRC-0164 heating, and carried integers that are a function of the copied history',
      metrics: { ...metrics, ...strip(a), ...strip(s), ...strip(h), ...strip(f), ...strip(d), ...strip(dWeyl), ...strip(bc), ...strip(e) },
      control: {
        e164F1Growth: controls.t1.growth,
        remainderF1Growth: controls.c1.growth,
        linearHuskLaggedOverExact: metrics['d0LinearLaggedOverExact'] ?? -1,
        remainderHuskLaggedOverExact: metrics['dRemainderLaggedOverExact'] ?? -1,
      },
      notes:
        "L2, exact integers, deterministic (zero and golden Weyl carried starts, hashed starts, no seeds). First run 2026-09-26 (tmp/frc0185.log, 1,182 s), FAIL by the status rule (S failed). Passes: A (0 failures over 536,870,912 pay pairs, 0 mismatches after 2,000 beats back on side 4 and 500 on side 5, both starts, 0 Gauss violations, 0 frame mismatches), H (0 mismatches over 8,192,000 carried values), D0 (the linear control reads the husk photon -0.05 percent), F1 (growth 129 per beat against the E-FRC-0164 rule's 570, ratio 0.23, where E-FRC-0181 reads 722), F2 (drift -5.6e-6 against 1.6e-2, ratio 3.5e-4: no heating at all on the hot start), E1 (x times the charge 0.089, 0.090, 0.092 flux units at e = 16, 64, 256, against E-FRC-0181's 2.8; 0.28 from the Weyl start). THE SHADOW IS EXACT LIGHT: read from E~ = E + C^T (u_(t-1) - u_(t-2)), every coherent husk wave from |B| 1 to 1024 reads the symbol within 2.3e-6 (C within 1.4e-7), the hot husk photon reads -0.053 percent lagged and +0.068 percent direct with 3 branches (identical to the linear rule), and the love-fear floor is 6e-5 flux units. Fails: S, the shadow tracks the linear run within 0.0022 flux units on the hot start (2,000 beats) but departs by 1,096 on the E-FRC-0164 start, where 2 sampled plaquettes crossed the linear table's seam at |B| = N / 2 (3 wraps in F1); the F1 growth of 129 is those wraps, not noise. B and C read from the RAW flux E fail badly from the zero start: +580 percent at |B| 1, +78 at 8, 29 to 51 percent at 16, 1.5 to 2.5 percent at 64, 7.6e-4 to 1.05e-3 at 256, 2e-5 to 1.3e-4 at 1024, falling as 1 / |B|^2, the dither-power-over-wave-power bias predicted in the header but far larger than predicted: from the zero start the fresh error follows the wave's own B pattern, so the dither is spatially coherent with the wave. The Weyl start breaks that (|B| 1, 4, 8: +1.4, +0.13, +0.04 percent, like E-FRC-0181's). D from the raw flux fails: lagged +15.2 percent with 8 branches (Weyl +15.4), direct -0.003 percent, where E-FRC-0181's rule on the same side-8 protocol reads +12.2 lagged and +2.6 direct. E2 fails as the header said it could not be predicted: the floor is flat in flux units (a charge-independent dither), falling only relative to the charge. DIAGNOSIS: E-FRC-0181's estimator failure was never heating. The wave form removes every resonant kick (F2 drift 3.5e-4 of E-FRC-0164's, the shadow exact) and the raw lagged estimator is still 15 percent fast, because the integer flux carries a non-propagating dither -(w_t - w_(t-1)), w = C^T u, of about one flux unit per link, broadband in space and time, which a correlation estimator counts as extra branches. An integer divergence-free flux cannot be closer to a real linear field than that. But the dither is a known function of the carried integers, so the flux the physics runs on is E~, which the rule carries exactly.",
    })
  },
})
