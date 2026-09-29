// Matter reads the spanned light (E-FRC-0255): E-FRC-0252's test charge, a vibe whose hop carries the Peierls phase
// zeta_128^(-q A) of the light's integer axis angle, run on the spanned husk light (code/rule/depth-span-light,
// E-GRV-0092) instead of the unspanned one. E-FRC-0254 predicts (and reads on the shadow) that the spanned angle
// grows at E / Q, q = 65 at D 32, so the push on a test charge falls by q.
//
// THE PROBLEM. The integer angle A is the quotient of the link's A2 = Q A + r, so a field that moves A2 by under Q / 2
// in a run never moves A at all: E-FRC-0252's +4 source moves the shadow by about 4.6 units at r = 4 in 512 beats,
// which on the spanned light is 4.6 / 65 of a unit, held entirely in the remainder. Reading it needs about q times
// the beats (33,280 at D 32), or the phase read from A + r / Q, which is exact only over Z[zeta_(4 D Q)]: 4 D Q =
// 8,320 is not a power of two, so the walk's power-of-two cyclotomic ring (code/rule/husk-peierls-walk) cannot hold it,
// and 65 times E-FRC-0252's 406 s is out of reach. The field is linear in its source, so this file reads the same
// question with the SOURCE scaled by q: +4 q = +260 (strings of 130 units each way round the torus, no net winding),
// whose integer angle moves as E-FRC-0252's did; the reference is that source's own static field divided by Q. A
// CONTROL runs E-FRC-0252's own +4 on the spanned light: the prediction is that the integer angle cannot carry it.
//
// THE RUN. As E-FRC-0252: side 24, D 32, three shaped levels (here in the radix q^2 = 4,225), the partner charge at
// (12, 12, 12), the start relaxed (code/measure/span-coulomb spanRelaxStart, CONSTRUCTION from reals, disclosed),
// 512 beats; the test vibe on the line (x, 0, 0), order 1024, binomial packet C(16, .) at rest at r = 4 .. 8, charges
// +1, -1, 0, exact over Z[zeta_1024] (code/measure/peierls-reading, the walk E-FRC-0252 ran). The static reference
// runs the same walk in doubles reading A(t) = t E_static / Q; the shadow reference reads the spanned shadow angle.
// Dropped from E-FRC-0252: the gauged twin light (the spanned light's gauge covariance is E-GRV-0092's, 256 of 256
// beats, and the walker's is E-FRC-0252's), to hold the run to two lights.
//
// Gates, fixed before the gated run (no probe of this file):
//  P1 exact: both lights keep Gauss on every husk dock at every beat and run back to their start bit for bit; every
//     exact walker's norm trace is 4^hops times its start's; the walkers q = +1 at r = 4 and q = -1 at r = 6 of the
//     scaled run run back exactly. (Wraps are counted, not gated: a static charge drives the angles next to it round
//     their window, as it did E-FRC-0252's, and a wrap by 4D changes neither the field mod 4D nor zeta_128^(-q A).)
//  P3 THE PUSH: with the scaled source, at every r = 4 .. 8 the love moves away (move(+1) - move(0) > 0), the fear
//     toward (move(-1) - move(0) < 0), and the electric move is within [0.8, 1.25] of the spanned static reference
//     (E-FRC-0252's tolerance)
//  C  the control: with E-FRC-0252's +4 source on the spanned light the electric move is under 0.2 of its own static
//     reference at every r (the field sits in the remainders)
// Verdict: partial if P1 fails; pass if P3 and C hold; fail otherwise.
// Reported: the shadow reference, the scaled run's moves beside E-FRC-0252's recorded 0.568, 0.435, 0.317, 0.205,
// 0.121, the integer angles at the end.
//
// FIRST RUN (tmp/span-peierls-run1.log, 407 s, the record): FAIL on P3 at r = 8 alone and on C at r = 4, no gate moved.
// P1 exact (Gauss 0 failures on both lights, both reversed bit for bit, every norm trace exact, both walkers back;
// 800 wraps counted, all next to the charges, as disclosed). With the +260 source the love moves away and the fear
// toward at every r, and the electric move is 0.537, 0.383, 0.259, 0.165, 0.096 docks against the spanned static
// reference 0.538, 0.387, 0.270, 0.185, 0.126 (ratio 0.997, 0.989, 0.961, 0.895, 0.764: under 0.8 at r = 8, where
// E-FRC-0252 read 0.959); the shadow reference equals the static one to 5e-13. The integer angle at beat 512 is 3, 2,
// 1, 1, 1 on r = 4 .. 8, so at r = 7 and 8 the whole run is one step of the integer angle and the walker reads the
// field only through when that step happens: the push falls off where the angle has taken under two units. With
// E-FRC-0252's +4 on the spanned light the integer angle ends at 0 everywhere and the move is 0.34, 0.18, 0.07, 0.02,
// 0.007 of its reference: small, as predicted, but at r = 4 over the control's 0.2, because the angle there does step
// to +1 for part of the run. So matter reads the spanned light, at E / Q, wherever the integer angle takes a few units
// in the run; a unit source needs about q times E-FRC-0252's beats (or charges q times larger) to be read at all. Title
// written after the run.
//
// Depth L2 (the rule's own light against the lattice Coulomb field, a test vibe as a stand-in: it reads the light and
// does not source it, and hops on one line). DETERMINISM: no start is drawn. NOTHING MOVES: each value takes its new
// value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  PEIERLS_RS,
  PEIERLS_SCALED,
  PEIERLS_SOURCE,
  spanPeierlsLight,
  walkReadings,
} from '@/code/measure/span-coulomb'

// E-FRC-0252's recorded electric moves at r = 4 .. 8 (tmp/frc0252-run1.log), for comparison only
const OLD_ELECTRIC = [0.568, 0.435, 0.317, 0.205, 0.121]

export default experiment({
  id: 'gauge/span-peierls-test-charge',
  code: 'E-FRC-0255',
  title:
    "matter reads the spanned light at E / Q only where its integer angle takes a few units, fail on P3 at r = 8 and on the control at r = 4: E-FRC-0252's Peierls test vibe on the spanned light (D 32, side 24, 512 beats, exact over Z[zeta_1024], Gauss exact, both lights and the walkers reversed) with a source q = 65 times E-FRC-0252's is pushed 0.537, 0.383, 0.259, 0.165, 0.096 docks at r = 4 .. 8, love away and fear toward, at 0.997, 0.989, 0.961, 0.895, 0.764 of the static field divided by Q (gate 0.8 to 1.25), falling off where the integer angle ends at 1; with E-FRC-0252's own +4 the integer angle ends at 0 at every r and the push is 0.34 to 0.007 of its reference, so a unit charge on the spanned light needs about q times the beats to be read",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const scaled = spanPeierlsLight(PEIERLS_SCALED, what =>
      console.error(what),
    )
    const main = walkReadings(
      scaled,
      PEIERLS_RS,
      [1, -1, 0],
      (r, q) => (q === 1 && r === 4) || (q === -1 && r === 6),
    )

    console.error(`scaled walks ${(Date.now() - started) / 1000}s`)

    const plain = spanPeierlsLight(PEIERLS_SOURCE, what =>
      console.error(what),
    )
    const control = walkReadings(
      plain,
      PEIERLS_RS,
      [1, -1],
      () => false,
    )
    const p1 =
      [scaled, plain].every(l => l.gauss === 0 && l.reversed) &&
      main.normOk &&
      main.backOk &&
      control.normOk
    const p3 = main.readings.every(
      w =>
        w.love > 0 && w.fear < 0 && w.ratio >= 0.8 && w.ratio <= 1.25,
    )
    const c = control.readings.every(w => Math.abs(w.ratio) < 0.2)
    const status = !p1 ? 'partial' : p3 && c ? 'pass' : 'fail'
    const list = (
      f: (w: (typeof main.readings)[number]) => number,
      rs = main.readings,
      d = 3,
    ): string => rs.map(w => f(w).toExponential(d)).join(', ')
    const endAngles = (l: typeof scaled): string =>
      PEIERLS_RS.map(r => l.line[l.line.length - 1]![r]).join(', ')
    const metrics: Record<string, number> = {
      gate_P1: p1 ? 1 : 0,
      gate_P3: p3 ? 1 : 0,
      gate_C: c ? 1 : 0,
      gaussScaled: scaled.gauss,
      gaussPlain: plain.gauss,
      wraps: scaled.wraps + plain.wraps,
      reversedScaled: scaled.reversed ? 1 : 0,
      reversedPlain: plain.reversed ? 1 : 0,
      normExact: main.normOk && control.normOk ? 1 : 0,
      walkReversed: main.backOk ? 1 : 0,
      lightSecondsScaled: scaled.seconds,
      lightSecondsPlain: plain.seconds,
      harmonic: Math.max(scaled.harmonic, plain.harmonic),
    }

    main.readings.forEach((w, i) => {
      metrics[`electric_r${w.r}`] = w.electric
      metrics[`staticRef_r${w.r}`] = w.staticRef
      metrics[`shadowRef_r${w.r}`] = w.shadowRef
      metrics[`ratio_r${w.r}`] = w.ratio
      metrics[`love_r${w.r}`] = w.love
      metrics[`fear_r${w.r}`] = w.fear
      metrics[`overOld_r${w.r}`] = w.electric / OLD_ELECTRIC[i]!
      metrics[`E_static_r${w.r}`] = scaled.staticLine[w.r]!
    })

    control.readings.forEach(w => {
      metrics[`control_electric_r${w.r}`] = w.electric
      metrics[`control_staticRef_r${w.r}`] = w.staticRef
      metrics[`control_ratio_r${w.r}`] = w.ratio
    })
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a test vibe hopping with the Peierls phase of the spanned light's integer angle (D 32, side 24, 512 beats): with a +${PEIERLS_SCALED} source (q times E-FRC-0252's) the electric move is ${list(w => w.electric)} docks at r = 4 .. 8 against the spanned static reference t E / Q ${list(w => w.staticRef)} (ratio ${main.readings.map(w => w.ratio.toFixed(3)).join(', ')}), and ${main.readings.map((w, i) => (w.electric / OLD_ELECTRIC[i]!).toFixed(3)).join(', ')} of E-FRC-0252's moves with +${PEIERLS_SOURCE} on the unspanned light; with +${PEIERLS_SOURCE} on the spanned light the move is ${list(w => w.electric, control.readings)} against its reference ${list(w => w.staticRef, control.readings)}; Gauss ${scaled.gauss + plain.gauss} failures, ${scaled.wraps + plain.wraps} wraps, lights reversed ${scaled.reversed && plain.reversed}, norms ${main.normOk && control.normOk}`,
      metrics,
      control: {
        plainElectric: control.readings.reduce(
          (a, w) => a + Math.abs(w.electric),
          0,
        ),
      },
      notes: `L2. Gates P1 ${p1}, P3 ${p3}, C ${c}. Scaled run: love ${list(w => w.love)}; fear ${list(w => w.fear)}; shadow reference ${list(w => w.shadowRef)}; integer angle at beat 512 on r = 4 .. 8: ${endAngles(scaled)} (plain: ${endAngles(plain)}). Relax residual ${scaled.residual.toExponential(2)}, harmonic ${metrics.harmonic!.toExponential(2)}. Lights ${scaled.seconds.toFixed(0)} s and ${plain.seconds.toFixed(0)} s, total ${metrics.seconds.toFixed(0)} s.`,
    })
  },
})
