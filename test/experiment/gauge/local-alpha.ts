// Alpha in LOCAL units on the spanned light (E-FRC-0256). E-FRC-0254 read alpha = sqrt(3) / (24 q) on the spanned
// light in COORDINATE units, which would make alpha vary with gravitational depth at order one. The roadmap
// (discrete-gravity, Part 5b.2, "But it may be a units artifact, and likely is") argues that in local units (energy on
// matter's own clock, N ~ q^(-1/2), separation on the span, a ~ q^(1/2)) the Coulomb energy times the separation is
// independent of q, as in general relativity, where a static field is a medium with epsilon = mu = n and alpha does
// not vary locally. This experiment measures it.
//
// THE LOCAL UNITS, each defined by the matter that sits at the depth (code/measure/local-alpha):
//  clock   the rest rate omega_0 of a uniform lump of the matter form that belongs to the light (code/rule/depth-clock-
//          wave: 'span' beside the spanned light, 'clock' beside the unchanged one), read by restRate
//          (code/measure/depth-arena). Closed: acos(1 - m / (18 q)), q^(-1/2) on both.
//  ruler   the lump's Compton length lambda = c_m / omega_0, with c_m its long-wave speed read from a standing mode of
//          k = 2 pi / 16: c_m^2 = (omega_k^2 - omega_0^2) / k^2. How the span light's rule defines the span: a link's
//          register takes the flux divided by Q_l = D_y + D_z + 1, a link's stiffness divided by the count it spans,
//          so waves (light and span matter) run at 2 / (q sqrt 3) docks a beat, and a dock is q^(1/2) local rulers
//          (lambda = sqrt(12 / (m q)) docks); on the unchanged light lambda = sqrt(12 / m) at every depth.
//  action  one radian of matter phase. Matter reads the light through E-FRC-0252's Peierls hop zeta_(4D)^(-q A): the
//          hop holds phase as a count of the root zeta_M, the same at every depth, so a local observer's action
//          quantum is that radian, and every energy here is a matter FREQUENCY, with no energy unit chosen. (E-FRC-
//          0254 instead took hbar as E-FRC-0242's Weyl pair N = q against the light's invariant energy.)
//  c       the light's long-wave speed on the local clock and ruler, c / (lambda omega_0).
//
// THE COULOMB ENERGY. A static field makes the light's angle grow (E per beat unchanged, E / Q spanned, E-FRC-0254);
// the Peierls hop turns an angle unit into kappa = 2 pi / (4D) radians per unit charge, so the pair +1, -1 at
// separation r has the energy (over the coincident pair) Omega(r) = kappa Phi(r) / 2 radians per beat, Phi the line
// integral of the angle's measured growth over the x-links between them, the strings' harmonic flux removed (exact:
// it is the same on every beat). With the torus's exact husk Green's difference G(0) - G(r), long range 1 / (24 pi r),
//   alpha_local(r) = E_local / (c_local 24 pi (G(0) - G(r)) lambda),   E_local = Omega / omega_0
// which is E r / (hbar c) with the lattice Green's function in place of 1 / r.
//
// THE PREDICTION, derived before any run.
//  (i) The local units CANCEL. E_local = Omega / omega_0, the Green's difference on the ruler is (G0 - G) lambda, and
//      c_local = c / (lambda omega_0), so alpha_local = Omega / (24 pi c (G0 - G(r))): the coordinate alpha, exactly,
//      for any clock and ruler. A dimensionless number is the same in every consistent set of units. The roadmap's
//      product (E / N)(a r) is energy times length; it is flat on the spanned light but it is not alpha until it is
//      divided by hbar c, and c_local is 1 on both lights (matter and light share one speed), so what decides is
//      hbar, in the light's energy unit.
//  (ii) The rule's hbar in the light's energy unit is D / pi. The light's invariant pair energy is (G0 - G(r)) / Q
//      (E-FRC-0254) and its matter frequency is kappa Phi / 2 = kappa 2 (G0 - G(r)) / Q (the axis flux is 2 grad phi,
//      and the pair doubles it), so hbar_invariant = 1 / (2 kappa) = D / pi, the "pi / D at hbar = 1" of
//      code/measure/trit-kinetic-light. It grows with depth because the angle's compact window 4D does, and the
//      Peierls root is fixed by that window.
//  (iii) So alpha_local = kappa K / (24 pi c) with K = 2 / Q the growth potential per unit Green's difference:
//        spanned:    alpha_local = (2 pi / 4D)(2 / q) / (24 pi 2 / (q sqrt 3)) = sqrt(3) / (48 D)
//        unchanged:  alpha_local = (2 pi / 4D)(2) / (24 pi 2 / sqrt(3 q)) = sqrt(3 q) / (48 D)
//      1/110.9, 1/221.7, 1/443.4, 1/886.8 spanned and 1/36.95, 1/53.77, 1/77.19, 1/110.0 unchanged at D 4, 8, 16, 32
//      (E-FRC-0254's closed forms, with its hbar N = q replaced by the rule's Peierls 4D = 2 (q - 1): 1/457 against
//      1/443 at D 16). NOT flat: the spanned light's local alpha falls as 1 / D exactly (8, 4, 2, 1 against D 32; as
//      q^(-1.05) over q = 9 .. 65, q^(-1) at large q), the unchanged light's as sqrt(q) / D (q^(-1/2) with the same
//      Peierls factor q / (4D)). The units hypothesis is predicted to FAIL: A1 fails, A2 holds.
//  (iv) What the roadmap's product does read: (invariant energy / omega_0)(1 / ((G0 - G) lambda)) / (24 pi) =
//      sqrt(3) / (48 pi) on the spanned light at every depth, sqrt(3 q) / (48 pi) on the unchanged one. Reported.
// Expected discreteness error in alpha_local: the local units cancel identically, the light's c is its linear
// symbol's (E-GRV-0092 measured it to 1.00037), so the only D-dependent error is the growth's departure from the static
// field, 3.2e-5 at D 4 and under 3e-8 from D 16 (E-FRC-0254), 5.4e-6 in this probe; FLAT_TOLERANCE is 1e-3.
//
// PROBE BEFORE THE GATES, disclosed (tmp/local-alpha-probe1.log, probe2.log): E-FRC-0254's growth reading ignored the
// angle's compact window, so the unchanged light's angle (growing at E, not E / Q) crossed its window at D 4 and 8 and
// read -0.77 and -1.36 off; following the integer angle through its window (code/measure/local-alpha Unwrap) fixes D 8
// (1.7e-5) and leaves D 4 hot at three and five levels (-2.8, -0.62), as E-FRC-0252 and 0254 found. The spanned light
// at D 4 read 5.4e-6 from its static field, alpha 1.00000 of the closed form, hbar_invariant 1.2732 = 4 / pi.
//
// Gates, fixed before the run:
//  A0 the local units are the roadmap's: the rest rate goes as q^(-1/2) on both lights and the Compton length as
//     q^(-1/2) spanned and q^0 unchanged (log-log slopes over D 4 .. 32 within EXPONENT_TOLERANCE), every matter run
//     reversed.
//  A1 on the spanned light alpha_local is independent of D: at every r, alpha_local(D) / alpha_local(D 32) within
//     FLAT_TOLERANCE of 1 at every D.
//  A2 the control, a real variation: on the unchanged light, from D 8 up, alpha_local(D) / alpha_local(D 32) within
//     CONTROL_TOLERANCE of sqrt(q / 65) (128 / 4D) (q^(-1/2) with the Peierls factor), and the unchanged over the
//     spanned alpha within CONTROL_TOLERANCE of sqrt(q) (the medium's q^(-1/2) alone, the Peierls root shared).
//  A3 exact: both lights reverse bit for bit and keep Gauss on every beat at every depth; the spanned light never
//     wraps.
// Verdict: partial if A0 or A3 fails; pass if A1 and A2 hold; fail otherwise (the prediction).
//
// FIRST RUN (tmp/local-alpha-run1.log, 28 s, the record): fail on A1 alone, as predicted; no gate moved. A0: rest rate
// q^-0.5007 on both lights (0.9999998 to 1.0000000 of closed), Compton length q^-0.5007 spanned (0.663 to 0.247 docks)
// and q^-0.0011 unchanged (1.992 to 1.988), the light's local speed 1.0024 to 1.0060, every matter run reversed. A1:
// the spanned light's alpha_local is 1/110.9, 1/221.7, 1/443.4, 1/886.8 at D 4, 8, 16, 32, ratios 8.000, 4.000, 2.000,
// 1.000 to D 32 (D^-1.0000, q^-1.0508), each within 5.4e-6 of sqrt(3) / (48 D); local over coordinate within 4.4e-16.
// A2: the unchanged light reads 1/53.8, 1/77.2, 1/110.0 at D 8, 16, 32, within 1.4e-4 of the closed ratio and of
// sqrt(q) times the spanned alpha (D 4 hot: its growth reads -1.8 to -8.4 times its static field, 98 to 219 window crossings).
// A3: every run reversed, Gauss exact, the spanned light 0 wraps. The roadmap's product reads 0.01152, 0.01154,
// 0.01155, 0.01155 (sqrt(3) / (48 pi) = 0.011486 over the ruler's lattice factor), flat; hbar_invariant 1.2732,
// 2.5465, 5.0930, 10.1859 = D / pi. Title written after the run; the claim's display of the hot D 4 row was fixed
// after it (no gate or number changed).
//
// WHAT IT MEANS. The units hypothesis is refuted: a local observer's clock and ruler rescale exactly as the roadmap
// said, and they cancel from alpha, as they must from any dimensionless number. What the roadmap's argument left out
// is hbar c. c is 1 locally on both lights; hbar, the matter phase per unit of the light's energy, is D / pi, because
// the Peierls root is zeta_(4D) and the angle's window grows with the column. So alpha_local = sqrt(3) / (48 D) on the
// spanned light: d ln alpha / d (Phi / c^2) = 2.10 (1.07 on the unchanged light), six orders above the atomic-clock
// bounds (|k_alpha| of order 1e-6). In general relativity alpha is flat because e^2 / hbar reads no potential; here the
// matter's charge in phase (2 pi / 4D per angle unit) reads the column's depth. To be flat on the spanned light the
// phase a unit charge takes per unit of angle must not read depth, which the compact angle's window 4D forbids as the
// rule stands (a finer reading A + r / Q restores nothing, E-FRC-0254). This is a result about the Peierls coupling,
// as much as about the span change, which does not relieve it and doubles k (1.07 to 2.10).
//
// DEPTH L2: the Coulomb frequency is read from the rules' runs and the units from matter's, but the conclusion (i)
// is dimensional analysis, and (iii) rests on the Peierls coupling the rule was built with. DETERMINISM: every start
// is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { logLogSlope } from '@/code/measure/regression'
import {
  CONTROL_FROM,
  CONTROL_TOLERANCE,
  EXPONENT_TOLERANCE,
  FLAT_TOLERANCE,
  LOCAL_DEPTHS,
  LOCAL_SEPARATIONS,
  localAlphaSurvey,
  type LightKind,
} from '@/code/measure/local-alpha'

export default experiment({
  id: 'gauge/local-alpha',
  code: 'E-FRC-0256',
  title:
    "alpha read in local units on the spanned light is not flat, it falls as 1 / D, fail on A1 (the prediction): with the local clock a span lump's rest rate (q^-0.5007), the local ruler its Compton length (q^-0.5007 docks; q^-0.0011 beside the unchanged light), the action quantum one radian of matter phase and c the light's speed on those (1.002 to 1.006), the Coulomb energy of a +1, -1 pair read as the matter frequency of its Peierls phase (D 4 .. 32, r = 2 .. 4, Gauss exact, no wraps, reversed) gives alpha_local = 1/110.9, 1/221.7, 1/443.4, 1/886.8 at D 4, 8, 16, 32, sqrt(3) / (48 D) to 5.4e-6, equal to the coordinate alpha to 4.4e-16 because local units cancel from a dimensionless number; the roadmap's product (energy on the local clock times separation on the local ruler) is flat (0.01152 to 0.01155), but hbar in the light's energy unit is D / pi (the Peierls root zeta_(4D)); the unchanged light reads sqrt(q) / (4D) to 1.4e-4 from D 8; so alpha couples to the potential with k = 2.10 (1.07 unchanged), against atomic-clock bounds of order 1e-6",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = localAlphaSurvey(what => console.error(what))
    const x = s.readings
    const q = (d: number): number => 2 * d + 1
    const top = LOCAL_DEPTHS[LOCAL_DEPTHS.length - 1]!
    const of = (light: LightKind, d: number, r: number) =>
      x.find(
        a =>
          a.pair.light === light &&
          a.pair.depth === d &&
          a.pair.r === r,
      )!
    const unitsOf = (light: LightKind) =>
      s.units.filter(u => u.light === light)
    const qs = LOCAL_DEPTHS.map(q)
    const slope = (
      light: LightKind,
      f: (u: (typeof s.units)[number]) => number,
    ): number => logLogSlope(qs, unitsOf(light).map(f))
    const restSlope = {
      span: slope('span', u => u.rest),
      clock: slope('clock', u => u.rest),
    }
    const comptonSlope = {
      span: slope('span', u => u.compton),
      clock: slope('clock', u => u.compton),
    }
    const a0 =
      Math.abs(restSlope.span + 0.5) <= EXPONENT_TOLERANCE &&
      Math.abs(restSlope.clock + 0.5) <= EXPONENT_TOLERANCE &&
      Math.abs(comptonSlope.span + 0.5) <= EXPONENT_TOLERANCE &&
      Math.abs(comptonSlope.clock) <= EXPONENT_TOLERANCE &&
      s.units.every(u => u.reversed)
    const flat = LOCAL_SEPARATIONS.flatMap(r =>
      LOCAL_DEPTHS.map(
        d =>
          of('span', d, r).alphaLocal / of('span', top, r).alphaLocal,
      ),
    )
    const a1 = flat.every(v => Math.abs(v - 1) <= FLAT_TOLERANCE)
    const controlDepths = LOCAL_DEPTHS.filter(d => d >= CONTROL_FROM)
    const controlOff = LOCAL_SEPARATIONS.flatMap(r =>
      controlDepths.map(
        d =>
          of('clock', d, r).alphaLocal /
            of('clock', top, r).alphaLocal /
            (Math.sqrt(q(d) / q(top)) * (top / d)) -
          1,
      ),
    )
    const mediumOff = LOCAL_SEPARATIONS.flatMap(r =>
      controlDepths.map(
        d =>
          of('clock', d, r).alphaLocal /
            of('span', d, r).alphaLocal /
            Math.sqrt(q(d)) -
          1,
      ),
    )
    const a2 = [...controlOff, ...mediumOff].every(
      v => Math.abs(v) <= CONTROL_TOLERANCE,
    )
    const a3 = x.every(
      a =>
        a.pair.reversed &&
        a.pair.gauss === 0 &&
        (a.pair.light === 'clock' || a.pair.wraps === 0),
    )
    const status = !a0 || !a3 ? 'partial' : a1 && a2 ? 'pass' : 'fail'
    const mean = (light: LightKind, d: number): number =>
      LOCAL_SEPARATIONS.reduce(
        (acc, r) => acc + of(light, d, r).alphaLocal,
        0,
      ) / LOCAL_SEPARATIONS.length
    const alphaSlope = {
      span: logLogSlope(
        qs,
        LOCAL_DEPTHS.map(d => mean('span', d)),
      ),
    }
    const spanDepthSlope = logLogSlope(
      [...LOCAL_DEPTHS],
      LOCAL_DEPTHS.map(d => mean('span', d)),
    )
    const controlSlope = logLogSlope(
      controlDepths.map(q),
      controlDepths.map(d => mean('clock', d)),
    )
    // the coupling of alpha to the potential: Phi / c^2 = ln N = -(1/2) ln q + const on matter's clock, so
    // d ln alpha / d (Phi / c^2) = -2 d ln alpha / d ln q
    const kAlpha = {
      span: -2 * alphaSlope.span,
      clock: -2 * controlSlope,
    }
    const worst = (list: number[]): number =>
      Math.max(...list.map(v => Math.abs(v)))
    const metrics: Record<string, number> = {
      gate_A0: a0 ? 1 : 0,
      gate_A1: a1 ? 1 : 0,
      gate_A2: a2 ? 1 : 0,
      gate_A3: a3 ? 1 : 0,
      restSlope_span: restSlope.span,
      restSlope_clock: restSlope.clock,
      comptonSlope_span: comptonSlope.span,
      comptonSlope_clock: comptonSlope.clock,
      alphaSlope_span: alphaSlope.span,
      alphaSlopeD_span: spanDepthSlope,
      alphaSlope_clockFromControl: controlSlope,
      kAlpha_span: kAlpha.span,
      kAlpha_clock: kAlpha.clock,
      flatWorst: worst(flat.map(v => v - 1)),
      controlWorst: worst(controlOff),
      mediumWorst: worst(mediumOff),
      seconds: s.seconds,
    }

    for (const a of x) {
      const tag = `${a.pair.light}_D${a.pair.depth}_r${a.pair.r}`

      metrics[`alphaLocal_${tag}`] = a.alphaLocal
      metrics[`alphaOverClosed_${tag}`] = a.alphaLocal / a.alphaClosed
      metrics[`localMinusCoordinate_${tag}`] =
        a.alphaLocal / a.alphaCoordinate - 1
      metrics[`growthOff_${tag}`] = a.pair.phi / a.pair.phiStatic - 1
      metrics[`noteProduct_${tag}`] = a.noteProduct
      metrics[`hbarInvariant_${tag}`] = a.hbarInvariant
      metrics[`energyLocal_${tag}`] = a.energyLocal
      metrics[`turns_${tag}`] = a.pair.turns
    }

    for (const u of s.units) {
      const tag = `${u.light}_D${u.depth}`

      metrics[`rest_${tag}`] = u.rest
      metrics[`compton_${tag}`] = u.compton
      metrics[`cLocal_${tag}`] = u.cLocal
    }

    const f = (v: number, n = 4): string => v.toFixed(n)
    const e = (v: number): string => v.toExponential(2)
    const inv = (v: number): string => `1/${(1 / v).toFixed(1)}`
    const row = (light: LightKind, depths: readonly number[]): string =>
      depths.map(d => `D ${d} ${inv(mean(light, d))}`).join(', ')
    const hot = LOCAL_DEPTHS.filter(d => d < CONTROL_FROM)
    const hotNote = hot
      .map(
        d =>
          `D ${d} hot (its growth ${f(Math.min(...LOCAL_SEPARATIONS.map(r => of('clock', d, r).pair.phi / of('clock', d, r).pair.phiStatic)), 2)} to ${f(Math.max(...LOCAL_SEPARATIONS.map(r => of('clock', d, r).pair.phi / of('clock', d, r).pair.phiStatic)), 2)} of its static field, not read)`,
      )
      .join(', ')

    return verdict({
      status,
      claim: `alpha read in local units (energy as a matter frequency on the rest rate of a lump at the depth, separation on the lump's Compton length, action one radian of matter phase, c the light's speed on those) at uniform depths ${LOCAL_DEPTHS.join(', ')}: on the spanned light ${row('span', LOCAL_DEPTHS)}, ratios to D ${top} of ${LOCAL_DEPTHS.map(d => f(mean('span', d) / mean('span', top), 3)).join(', ')}, so alpha_local goes as D^${f(spanDepthSlope)} = q^${f(alphaSlope.span)}, not flat; on the unchanged light ${row('clock', controlDepths)}, q^${f(controlSlope)}, within ${e(worst(controlOff))} of the closed sqrt(q) / (4D) and ${e(worst(mediumOff))} of sqrt(q) times the spanned alpha (${hotNote}); the local units read as the roadmap assumed (rest rate q^${f(restSlope.span)} and q^${f(restSlope.clock)}, Compton length q^${f(comptonSlope.span)} spanned and q^${f(comptonSlope.clock)} unchanged, the light's local speed ${f(Math.min(...s.units.map(u => u.cLocal)))} to ${f(Math.max(...s.units.map(u => u.cLocal)))}) and cancel from alpha identically (local over coordinate within ${e(worst(x.map(a => a.alphaLocal / a.alphaCoordinate - 1)))}); the roadmap's product (energy on the local clock times separation on the local ruler) is flat on the spanned light (${LOCAL_DEPTHS.map(d => f(of('span', d, LOCAL_SEPARATIONS[0]!).noteProduct, 5)).join(', ')}) but alpha divides it by hbar, and hbar in the light's energy unit reads ${LOCAL_DEPTHS.map(d => f(of('span', d, LOCAL_SEPARATIONS[0]!).hbarInvariant, 4)).join(', ')} = D / pi, set by the Peierls root zeta_(4D); alpha's coupling to the potential d ln alpha / d (Phi / c^2) = ${f(kAlpha.span, 2)} spanned, ${f(kAlpha.clock, 2)} unchanged, against atomic-clock bounds of order 1e-6`,
      metrics,
      control: {
        controlWorst: worst(controlOff),
        mediumWorst: worst(mediumOff),
        unchangedAtD4OverClosed:
          of('clock', LOCAL_DEPTHS[0]!, LOCAL_SEPARATIONS[0]!)
            .alphaLocal /
          of('clock', LOCAL_DEPTHS[0]!, LOCAL_SEPARATIONS[0]!)
            .alphaClosed,
      },
      notes: `L2. Gates A0 ${a0}, A1 ${a1}, A2 ${a2}, A3 ${a3}. Per reading (light D r: alpha_local, over closed, growth off static, turns): ${x.map(a => `${a.pair.light} ${a.pair.depth} ${a.pair.r}: ${e(a.alphaLocal)}, ${f(a.alphaLocal / a.alphaClosed, 6)}, ${e(a.pair.phi / a.pair.phiStatic - 1)}, ${a.pair.turns}`).join('; ')}. Units (light D: rest over closed, Compton, c_local): ${s.units.map(u => `${u.light} ${u.depth}: ${f(u.rest / u.restClosed, 7)}, ${f(u.compton)}, ${f(u.cLocal)}`).join('; ')}. Worst spanned flatness ${e(worst(flat.map(v => v - 1)))}, control ${e(worst(controlOff))}, medium ${e(worst(mediumOff))}. Largest relax residual ${e(Math.max(...x.map(a => a.pair.residual)))}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
