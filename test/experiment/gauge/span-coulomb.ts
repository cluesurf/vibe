// Coulomb and alpha on the spanned light (E-FRC-0254). The spanned husk light (code/rule/depth-span-light, E-GRV-0092)
// divides each link's drift by the count it spans, Q = q on a uniform depth, to give light general relativity's
// bending factor 2 (E-GRV-0093). What does that do to electromagnetism's numbers, measured on E-FRC-0241 and 0252's
// terms?
//
// THE PREDICTION, derived before any run. On a uniform depth the spanned light is the unspanned one with its drift
// share s divided by q (A~_(t+1) = A~_t + E~ / Q; the kick, which reads C W A~, is unchanged). So:
//  (i) the STATIC FLUX is exactly the old one. Its divergence is the charge (Gauss, untouched), and a static solution
//      needs the kick to stay zero, C W (E / Q) = 0, the same condition as before on a uniform Q: the lattice Coulomb
//      field of E-FRC-0241, 1/(24 pi r) + A / r^5 with no 1/r^3, is a static solution of the spanned rule.
//  (ii) the FORCE ON A TEST CHARGE falls by q. A test charge reads the angle (E-FRC-0252's Peierls phase), and the
//      spanned angle grows at E / Q per beat where the old one grew at E.
//  (iii) the COULOMB ENERGY falls by q: the invariant the spanned rule keeps weights E^2 by w / (4 Q)
//      (code/measure/depth-span), so the pair energy is (G(0) - G(r)) / q in the old units.
//  (iv) ALPHA. With E-FRC-0242's C = s / (12 N) (the drift's phase per unit of e^2 / 2 is 2 pi s / N, times the husk
//      Green's 1 / (24 pi r)) and hbar kept at the column's Weyl pair N = q: the old light has s = 1, c = 2 / sqrt(3 q),
//      alpha = sqrt(3) / (24 sqrt q); the spanned light has s = 1 / q, c = 2 / (q sqrt 3), so
//        alpha_span = s / (12 N c) = sqrt(3) / (24 q) = alpha_old / sqrt(q)
//      (1/79.6 -> 1/457 at D 16; 1/112 -> 1/901 at D 32). The shape is kept and the numbers are rescaled, and the
//      scaling with depth changes from q^(-1/2) to q^(-1).
//
// THE RUN. A +1, -1 pair at separation r = 2 and 4 along x on the side-8 husk torus, uniform depth D = 4, 16, 32,
// three shaped levels. Relaxed start (code/measure/span-coulomb spanRelaxStart: the counters carry U - u in the radix
// q^2; CONSTRUCTION from reals, disclosed), 256 beats forward and back. Beside it the unspanned shaped light
// (code/rule/trit-husk-shaped) from the same strings with code/measure/trit-kinetic-light's relaxStart. And the
// spanned light from the STRUNG start (the strings' transverse part left as free light), whose invariant is read with
// the spanned weight 1 / Q and, as a control, with the unspanned weight.
//
// PROBE BEFORE THE GATES, disclosed (tmp/span-coul-probe1.log, D 4 r 2 and D 16 r 4): the spanned light's shadow flux
// stays at the static field to 5.3e-4 (D 4) and 1.1e-7 (D 16) of its largest value, its angle grows at E / Q to 2.2e-5
// and 2.5e-8; the unspanned light is hot at D 4 (its growth off by a factor 7, as E-FRC-0252 found for D 4) and
// tracks at D 16 (7.3e-4), the ratio 32.99975 against q = 33; the strung invariant drifts 7.1e-5 and 6.9e-9 with the
// spanned weight and 0.46 and 0.65 with the unspanned one. The gates were set knowing these, and the side-by-side
// ratio is gated from D 16 up.
//
// Gates:
//  K1 instrument: on every configuration the spanned light keeps Gauss on every beat, never wraps, and reverses bit
//     for bit (relaxed and strung starts); the unspanned light keeps Gauss and reverses.
//  K2 the Coulomb field is static on the spanned light (i): the shadow flux stays within 2e-3 of its largest value of
//     the static field on every link and beat (1e-5 from D 16 up).
//  K3 the test charge's reading falls by q (ii): on every link holding a twentieth of the largest field the spanned
//     angle grows at E / Q to 1e-4; from D 16 up the unspanned angle grows at E to 1e-2, and the unspanned over the
//     spanned growth is q to 1e-3 (mean) with a spread under 5e-3 of q.
//  K4 the energy's weight is the rule's own (iii): on the strung start the spanned invariant drifts under 1e-3 and the
//     same sum with the unspanned weight drifts over 0.1.
// Verdict: partial if K1 fails; pass if K2, K3, K4 hold; fail otherwise. Reported: the pair energy over (G(0) - G(r))
// / q (an identity given Gauss, a consistency number), and alpha from the closed form.
//
// FIRST RUN (tmp/span-coulomb-run1.log, 58 s, the record): pass, no gate moved. On every configuration Gauss exact, no
// wraps, both lights reversed. The Coulomb field stays static on the spanned light to 6.3e-4 (D 4), 1.1e-7 (D 16),
// 1.5e-9 (D 32); the spanned angle grows at E / Q to 3.2e-5, 2.5e-8, 3.8e-10; the unspanned over the spanned growth
// reads 32.9995 and 32.9998 (q = 33) and 65.0001 and 65.0001 (q = 65), the unspanned light hot at D 4 as the probe
// found; the strung invariant holds to 7.1e-5, 8.6e-9, 1.1e-10 with the spanned weight and drifts 0.46 to 0.66 with
// the unspanned one; the pair energy is (G(0) - G(r)) / q to 3e-14. Title written after the run.
//
// WHAT IT MEANS. The change does not break electromagnetism's shape: Gauss, the 1/r field and its r^-5 lattice term,
// like and unlike pairs are all E-FRC-0241's. It RESCALES the numbers: the medium is a dielectric of permittivity q,
// so energy and force per unit charge fall by q, and alpha by sqrt(q) at fixed hbar, and alpha's depth dependence goes
// from q^(-1/2) to q^(-1). Can the rescaling be absorbed? Reading A + r / Q (a finer root of unity, E-FRC-0255's
// header) makes the test charge exact but reads the SAME A~, so it restores nothing. Reading A2 = Q A + r at the old
// quantum zeta_(4D) is a charge q times larger: on a uniform depth it restores the old force exactly, but its gauge
// map moves the phase by Q_l lambda_l, which is a gradient only where Q is uniform, so on a varying depth it is not
// gauge covariant; and a charge that reads q times more must source q times more for action and reaction, which puts
// q^2 back into the energy. So on this rule alpha is a closed form in the depth, rescaled, not a number fixed by
// geometry; and in local units (energy in the matter's own clock, length in its own ruler, N = q^(-1/2), a = q^(1/2))
// alpha_local = C a / (N c_local) still goes as 1/q, so alpha would vary with the gravitational depth in both lights
// (as 1/sqrt(q) before, 1/q now): a derived statement, not run.
//
// Depth L2 (a known construction, a medium of permittivity q, on the model's light); (iv) is a closed form resting on
// E-FRC-0242's hbar, not a measurement. DETERMINISM: every start is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  alphaSpanned,
  alphaUnspanned,
  COULOMB_COMPARE_FROM,
  spanCoulombSurvey,
} from '@/code/measure/span-coulomb'

export default experiment({
  id: 'gauge/span-coulomb',
  code: 'E-FRC-0254',
  title:
    "Coulomb on the spanned light keeps E-FRC-0241's shape and falls by q, so alpha becomes sqrt(3) / (24 q), pass: on uniform depths 4, 16, 32 the lattice Coulomb field of a +1, -1 pair is a static solution of the spanned rule (to 6.3e-4, 1.1e-7, 1.5e-9; Gauss exact, no wraps, reversed), the angle a test charge reads grows at E / Q (to 3.2e-5, 2.5e-8, 3.8e-10), 32.9995 and 65.0001 times slower than the unspanned light's (q = 33, 65; the unspanned light hot at D 4), and the invariant the spanned rule keeps weights E^2 by 1 / Q (a strung pair held to 1.1e-10 at D 32, the unspanned weight drifting 0.46 to 0.66), so the pair energy is (G(0) - G(r)) / q; with E-FRC-0242's hbar the drift share s falls to 1 / q and alpha = s / (12 N c) = alpha_old / sqrt(q): 1/457 against 1/79.6 at D 16, 1/901 against 1/112 at D 32, a rescaling of a closed form in the depth (q^-1/2 to q^-1), not a break",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = spanCoulombSurvey(what => console.error(what))
    const x = s.readings
    const q = (d: number): number => 2 * d + 1
    const k1 = x.every(
      r =>
        r.gauss === 0 &&
        r.wraps === 0 &&
        r.reversed &&
        r.strungReversed &&
        r.oldGauss === 0 &&
        r.oldReversed,
    )
    const k2 = x.every(
      r => r.fluxOff <= (r.depth >= COULOMB_COMPARE_FROM ? 1e-5 : 2e-3),
    )
    const compared = x.filter(r => r.depth >= COULOMB_COMPARE_FROM)
    const k3 =
      x.every(r => r.growthOff <= 1e-4) &&
      compared.every(
        r =>
          r.oldGrowthOff <= 1e-2 &&
          Math.abs(r.ratioMean / q(r.depth) - 1) <= 1e-3 &&
          r.ratioSpread / q(r.depth) <= 5e-3,
      )
    const k4 = x.every(
      r => r.strungDrift <= 1e-3 && r.strungWrongDrift > 0.1,
    )
    const status = !k1 ? 'partial' : k2 && k3 && k4 ? 'pass' : 'fail'
    const depths = [...new Set(x.map(r => r.depth))]
    const metrics: Record<string, number> = {
      gate_K1: k1 ? 1 : 0,
      gate_K2: k2 ? 1 : 0,
      gate_K3: k3 ? 1 : 0,
      gate_K4: k4 ? 1 : 0,
      seconds: s.seconds,
    }

    for (const r of x) {
      const tag = `D${r.depth}_r${r.r}`

      metrics[`fluxOff_${tag}`] = r.fluxOff
      metrics[`growthOff_${tag}`] = r.growthOff
      metrics[`oldGrowthOff_${tag}`] = r.oldGrowthOff
      metrics[`ratio_${tag}`] = r.ratioMean
      metrics[`ratioSpread_${tag}`] = r.ratioSpread
      metrics[`energyOverGreen_${tag}`] = r.energyOverGreen
      metrics[`strungDrift_${tag}`] = r.strungDrift
      metrics[`strungWrongDrift_${tag}`] = r.strungWrongDrift
      metrics[`gauss_${tag}`] = r.gauss + r.oldGauss
    }

    for (const d of depths) {
      metrics[`alphaOld_D${d}`] = alphaUnspanned(d)
      metrics[`alphaSpan_D${d}`] = alphaSpanned(d)
      metrics[`alphaRatio_D${d}`] = alphaSpanned(d) / alphaUnspanned(d)
    }

    const e = (v: number): string => v.toExponential(2)
    const worst = (
      f: (r: (typeof x)[number]) => number,
      list = x,
    ): string => e(Math.max(...list.map(f)))

    return verdict({
      status,
      claim: `on uniform depths ${depths.join(', ')} the lattice Coulomb field of a +1, -1 pair is a static solution of the spanned light (shadow flux within ${worst(r => r.fluxOff)} of it over 256 beats; Gauss exact, no wraps, reversed); the angle a test charge reads grows at E / Q to ${worst(r => r.growthOff)}, and beside the unspanned light the ratio of growths is ${compared.map(r => r.ratioMean.toFixed(5)).join(', ')} against q = ${compared.map(r => q(r.depth)).join(', ')}; the spanned invariant (E^2 weighted 1 / Q) holds a strung pair to ${worst(r => r.strungDrift)} where the unspanned weight drifts by at least ${e(Math.min(...x.map(r => r.strungWrongDrift)))}; so the Coulomb energy and the force on a test charge fall by q and alpha = sqrt(3) / (24 q) = alpha_old / sqrt(q): ${depths.map(d => `1/${(1 / alphaSpanned(d)).toFixed(1)} against 1/${(1 / alphaUnspanned(d)).toFixed(1)} at D ${d}`).join(', ')}`,
      metrics,
      control: {
        strungWrongDriftMin: Math.min(
          ...x.map(r => r.strungWrongDrift),
        ),
        oldGrowthOffAtD4: Math.max(
          ...x
            .filter(r => r.depth < COULOMB_COMPARE_FROM)
            .map(r => r.oldGrowthOff),
        ),
      },
      notes: `L2. Gates K1 ${k1}, K2 ${k2}, K3 ${k3}, K4 ${k4}. Per configuration (D, r: flux off, spanned growth off, unspanned growth off, ratio, spread, energy over (G0 - G(r)) / q): ${x.map(r => `D ${r.depth} r ${r.r}: ${e(r.fluxOff)}, ${e(r.growthOff)}, ${e(r.oldGrowthOff)}, ${r.ratioMean.toFixed(5)}, ${e(r.ratioSpread)}, ${r.energyOverGreen.toFixed(12)}`).join('; ')}. Relax residual ${worst(r => r.residual)}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
