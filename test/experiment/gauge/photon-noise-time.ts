// Noise shaping in time for the carried-remainder force (E-FRC-0184): candidate 1 of the E-FRC-0181
// follow-up. E-FRC-0181's first-order error diffusion made husk light exact in the mean but left a zero-mean
// kick of about one flux unit per plaquette per beat that heats (722 per beat against the E-FRC-0164 rule's
// 570), drives all 8 husk branches, fools the lagged estimator (+25.6 percent) and leaves a love-fear floor
// near 2.8 flux units. Here the fresh error enters through a higher-order noise transfer function in time
// (code/rule/photon-shaped), two or three carried integers per plaquette, still an exact integer bijection
// with Gauss's law:
// - second, NTF (1 - z)^2, taps [-2, 1]
// - third, NTF (1 - z)^3, taps [-3, 3, -1]
// - notch, NTF 1 - c z + z^2 with c = 1.3864440918 (E-FRC-0183: the lambda-weighted mean of 2 cos omega over
//   the side-8 bulk band, the best notch whose last tap is 1, so the kick still reverses), c rounded to
//   90,862 / 65,536, its product with the carried integer rounded to 1 / q
//
// Predictions, registered in E-FRC-0183 before this file was written (white-noise model through the symbol,
// its first-order heating 628 per beat against E-FRC-0181's measured 722, ratio 0.87):
// - (1 - z)^L buys a factor kappa lambda per order, near 1 on the massive branches (kappa lambda up to 0.98,
//   the band fills a third of the Nyquist range), so second order heats 0.66 and third 0.46 of first order on
//   the side-4 box: predicted F1 growth 478 and 333 per beat, both ABOVE the 285 gate. Both are predicted to
//   fail F1
// - the notch heats 0.049 of first order (predicted F1 growth 35 per beat, under the gate), but leaves 0.43 of
//   first order's noise on the photon branches, because its zero sits at the massive frequency
//
// Choices, fixed before the run: N = 8192, K = 80, p / q = 4021 / 65536 (E-FRC-0181), the linear table. The
// carried integers start as a golden-ratio Weyl sequence (E-FRC-0181's choice); the all-zero start is reported
// beside. The box is side 8 (husk 8^3) for B to E and side 4 for F1, as E-FRC-0181 ran them. Section D runs on
// the side-8 box, not E-FRC-0181's side 12 (machine load); the floating-point linear rule and the E-FRC-0181
// remainder rule are run on the same side-8 protocol beside it as the controls.
//
// Gates, the caller's battery, fixed before the run, per form:
// A  exact integer reversibility: the pay arithmetic exhaustively (every table value p centered(B) and every
//    dropped carried value, 536,870,912 pairs, 0 failures), 2,000 beats forward and back on the side-4 box and
//    500 on the side-5 box restore every angle, flux and carried integer (both starts), Gauss's law holds on
//    every beat (0 violations), and a Z_N frame change commutes with 48 beats (0 mismatches)
// B  coherent husk waves at m1, peak |B| 1 to 8: every three-point reading of the flux within 1e-3 of the
//    symbol
// C  coherent husk waves at m = (1,0,0), (2,0,0), (3,0,0), (2,2,1), both depth-even polarizations, peak |B|
//    16, 64, 256, 1024: every reading within 1e-3 of the symbol
// D  the hot field on the husk (E-FRC-0169 A protocol, side 8, 300 + 2,000 beats, lag 3): the lagged
//    estimator (mean of the light branches, at least one) and the autocorrelation zero crossing within 2
//    percent of the symbol's photon. D0, the estimator control: the floating-point linear rule on the same
//    protocol within 2 percent (if D0 fails, D does not discriminate and is reported as such)
// E  a love and a fear at r = 1 on the husk (4,000 beats, averaged over 400 to 4,000), against the linear
//    rule's averaged field: E1 x times the charge under 1.4 flux units (half of E-FRC-0181's 2.8) at e = 16,
//    64 and 256, E2 x times the charge falling with charge (e = 256 below e = 16)
// F  heating against the E-FRC-0164 rule on the same protocols: F1 the shadow energy's growth per beat on the
//    E-FRC-0164 start (side 4, 2,000 beats) at most half of the E-FRC-0164 rule's, F2 the drift on the hot
//    start (side 8, 500 + 2,000 beats) at most half of the E-FRC-0164 rule's in magnitude
// A form passes when it passes every gate. Status: pass if one form passes every gate, partial if every form
// passes A but none passes every gate, fail otherwise.
//
// Depth L2: sigma-delta noise shaping (a known device) on the exactly derived leapfrog, measured against its
// exact linear theory.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { controlMetrics, heatControls, hotHusk, sectionA, sectionBC, sectionE, sectionF, sectionH } from '@/code/measure/photon-battery'
import { type ShapedForm } from '@/code/rule/photon-shaped'

export const NOTCH = 1.3864440917966434

export default experiment({
  id: 'gauge/photon-noise-time',
  code: 'E-FRC-0184',
  title:
    'noise shaping in time for the carried-remainder force: second- and third-order sigma-delta and the best reversible notch 1 - c z + z^2 on each plaquette, still an exact integer bijection with Gauss exact, tested on the light battery (coherent husk waves at |B| 1 to 1024, the hot-field estimators, the love-fear floor, heating) against the symbol prediction that (1 - z)^L cannot halve the heating because the massive band fills a third of the Nyquist range',
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

    metrics['gateD0'] = d0 ? 1 : 0

    const passes: Record<string, boolean> = {}
    let everyA = true

    for (const form of ['second', 'third', 'notch'] as ShapedForm[]) {
      const notch = form === 'notch' ? NOTCH : undefined
      const put = (r: Record<string, number>): void => {
        for (const [key, value] of Object.entries(r)) {
          metrics[`${form}.${key}`] = value
        }
      }
      const a = sectionA(form, notch)
      const bc = sectionBC(form, { dither: 'weyl', other: 'zero', notch, bound: 1e-3 })
      const d = hotHusk(form, 'd', { dither: 'weyl', side: 8, notch })
      const e = sectionE(form, { dither: 'weyl', other: 'zero', notch, floor: 1.4 })
      const f = sectionF(form, { dither: 'weyl', notch }, controls)
      const h = sectionH(form, notch)
      const okD = (d['dLaggedLightBranches'] ?? 0) >= 1 && Math.abs(d['dLaggedOverExact'] ?? 1) < 0.02 && Math.abs(d['dDirectOverExact'] ?? 1) < 0.02
      const gates = { A: a.ok, B: bc.okB, C: bc.okC, D: okD ? 1 : 0, E1: e.okE1, E2: e.okE2, F1: f.okF1, F2: f.okF2 }

      put(a)
      put(bc)
      put(d)
      put(e)
      put(f)
      put(h)

      for (const [gate, ok] of Object.entries(gates)) {
        metrics[`${form}.gate${gate}`] = ok
      }

      passes[form] = Object.values(gates).every(x => x === 1)
      everyA = everyA && a.ok === 1
    }

    const any = Object.values(passes).some(x => x)

    return verdict({
      status: any ? 'pass' : everyA ? 'partial' : 'fail',
      claim:
        'a second- or third-order noise transfer function in time, or the best reversible notch, keeps the carried-remainder force an exact integer bijection with Gauss exact and moves its quantization noise off the band enough to pass the light battery: coherent husk waves within 1e-3 at |B| 1 to 1024, the lagged hot-field estimator within 2 percent, the love-fear floor under 1.4 flux units and falling with charge, and at most half of the E-FRC-0164 heating',
      metrics,
      control: {
        e164F1Growth: controls.t1.growth,
        remainderF1Growth: controls.c1.growth,
        linearHuskLaggedOverExact: metrics['d0LinearLaggedOverExact'] ?? -1,
        remainderHuskLaggedOverExact: metrics['dRemainderLaggedOverExact'] ?? -1,
      },
      notes:
        "L2, exact integers, deterministic (golden Weyl carried starts, zero beside, hashed starts, no seeds). First run 2026-09-26 (tmp/frc0184.log), PARTIAL: every form passes A (0 pay failures over 536,870,912 pairs, 0 mismatches back, 0 Gauss violations, 0 frame mismatches) and H, none passes every gate. The heating PREDICTIONS of E-FRC-0183 hold on the clean protocol, F2 (hot start, no wraps): drift relative to E-FRC-0181's 0.0101 is 0.68 for (1 - z)^2 (predicted 0.66), 0.45 for (1 - z)^3 (predicted 0.46) and 0.004 for the notch (predicted 0.049, better than the white model). F1 is contaminated by the linear table's seam (2 to 6 wraps of B across N / 2 on the E-FRC-0164 start for every carried rule), so its growths (second 299, third 466, notch 238 against E-FRC-0164's 570) mix noise with seam kicks. Per form: SECOND fails B (1.9 percent at |B| 1), D (lagged +16.4, direct +1.9), E1 (2.31 units), F1 (299 > 285), passes C (8.9e-5) and F2 (0.43). THIRD fails B (6.3 percent), D (no light branch admitted), E1 (1.97 to 2.04 units), F1 (466), passes C (3.4e-4) and F2 (0.28). NOTCH (1 - 1.38644 z + z^2) passes A, C (worst 2.1e-4), E1 (0.85 to 0.88 flux units, against E-FRC-0181's 2.8), E2 (0.850 at e = 256 below 0.871 at e = 16, a 2.5 percent fall that is within the spread of a flat floor, so E2's pass is not evidence of a charge dependence), F1 (238, ratio 0.42) and F2 (ratio 0.0025), and fails only B (5.5 percent at |B| 1, 0.59 at 4, 7e-5 at 8) and D (lagged +3.2 percent with 2 light branches, direct +0.18). The notch is the best time-only shaping: it removes the massive-branch heating as predicted, and what it leaves on the photon branches (0.43 of first order's) and the flux dither still bias the small-wave and hot-field readings. The zero carried start is again much worse than the Weyl start for small waves (second 387 percent, third 639, notch 44 at |B| 1). Section D ran on side 8, not E-FRC-0181's side 12; there the linear control reads -0.05 percent and E-FRC-0181's rule +12.2 lagged, +2.6 direct.",
    })
  },
})
