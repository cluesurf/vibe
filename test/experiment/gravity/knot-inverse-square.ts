// Gravity from the second law, the law: does the drift of a test population toward a held knot fall as 1/r^2 on the
// husk, and is it the entropic force F = T dS/dr (E-GRV-0057)? The same survey as E-GRV-0056 (code/measure/held-knot,
// run once per process): the knot, the start, the blob and the profile are defined there and in that file's header.
//
// THE LAW. In the husk's three dimensions a force from a point source whose flux is conserved falls as 1/r^2. The drift
// D(r0) is E-GRV-0056's paired displacement toward the knot after 8 beats, at r0 = 4, 5, 6, 7, 8. Its exponent is the
// least-squares slope of ln D against ln r0. THE ENTROPIC RELATION: Verlinde's force is T dS/dr, pointing up the entropy
// gradient, so a pull toward the knot needs the settled entropy to rise toward it (dS/dr < 0 outside), and D(r0) must be
// proportional to -dS/dr at r0. dS/dr is the central difference of the settled forward slot-entropy contrast (knot minus
// no knot) at r0 +- 1.
//
// Gates, fixed before the first run of this file (and of E-GRV-0056):
//  H1 a pull to fit: E-GRV-0056's G1 (the instrument) and G3 (a forward drift toward the knot at every r0, 3 standard
//     errors)
//  H2 the exponent: with H1, the slope of ln D against ln r0 over r0 = 4 .. 8 lies in [-2.5, -1.5]. Without H1 there is
//     no positive D to take the log of, so H2 is not evaluable and FAILS (a gate that cannot evaluate a case does not
//     answer clean); the slope of ln |D| is still reported
//  H3 the entropic relation: at every r0 the gradient dS/dr is negative by at least 3 standard errors (over 17
//     members), and D(r0) / (-dS/dr) varies by at most a factor 1.5 across r0; not evaluable without H1, and then FAILS
// Verdict: pass if all hold; fail if the instrument holds and any fails; partial if the instrument fails.
//
// Reported, not gated: r0^2 D(r0) (constant for 1/r^2), the slope of ln |D|, the gradients with their errors, and the
// first beat at which the knot touches the blob at all against r0 (a causal arrival, which sets a floor on how early
// any force can act).
//
// FIRST RUN (shared with E-GRV-0056, 3,052 s, the record): fail on H1, H2, H3, recorded as is, no gate moved. The
// instrument holds. Title written after the run.
//
// Depth L2: a fit of a measured drift and a measured gradient on the adopted knit, with the controls of E-GRV-0056.
// DETERMINISM: Weyl fills and the 17 link starts; nothing is drawn. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { SURVEY, heldKnotSurvey, readSurvey, slope } from '@/code/measure/held-knot'

export default experiment({
  id: 'gravity/knot-inverse-square',
  code: 'E-GRV-0057',
  title:
    'no 1/r^2 entropic force toward a held knot on the adopted knit, fail on H1, H2 and H3: the drift of a test blob is a push away at every r0 = 4 to 8 (E-GRV-0056), so there is no pull to fit and the exponent is not evaluable; the push itself falls as r0^-2.92 over 8 beats (r0^2 D = -10.8, -6.7, -7.4, -5.3, -5.7), set by the causal arrival (the knot first touches the blob at beat 1, 2, 3, 3, 4) rather than a field; the settled entropy gradient dS/dr is within 3 standard errors of zero at every r0 (largest 1.1e-4 +- 6.2e-5), so F = T dS/dr has no gradient to be proportional to',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const members = heldKnotSurvey(log)
    const read = readSurvey(members)
    const r0s = [...SURVEY.distances]
    const drift = read.drift.forward
    const instrument = members.every(m => m.exact && m.returns && m.knotHeld && m.lumpBlind && m.lumpBlindBeats === SURVEY.settle)
    const pull = drift.every(x => x.mean > 0 && x.mean >= 3 * x.error)
    const h1 = instrument && pull
    const logR = r0s.map(r => Math.log(r))
    const absSlope = slope(
      logR,
      drift.map(x => Math.log(Math.abs(x.mean) + 1e-300)),
    )
    const exponent = h1 ? slope(logR, drift.map(x => Math.log(x.mean))) : Number.NaN
    const h2 = h1 && exponent >= -2.5 && exponent <= -1.5
    const gradientDown = read.gradient.every(g => g.mean < 0 && -g.mean >= 3 * g.error)
    const ratios = drift.map((x, i) => x.mean / -(read.gradient[i]!.mean))
    const spread = Math.max(...ratios) / Math.min(...ratios)
    const h3 = h1 && gradientDown && ratios.every(r => r > 0) && spread <= 1.5
    const status = !instrument ? 'partial' : h1 && h2 && h3 ? 'pass' : 'fail'
    const f = (x: { mean: number; error: number }): string => `${x.mean.toExponential(2)} +- ${x.error.toExponential(1)}`

    return verdict({
      status,
      claim: `the drift of a test blob toward a held knot on the adopted knit (side 24, 17 starts, 8 beats) at r0 = ${r0s.join(', ')}: ${drift.map(f).join(', ')}; ${h1 ? `exponent ${exponent.toFixed(3)}` : `no pull to fit (slope of ln |D| ${absSlope.toFixed(3)})`}; settled entropy gradient dS/dr ${read.gradient.map(f).join(', ')}`,
      metrics: {
        gate_H1: h1 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        gate_H3: h3 ? 1 : 0,
        instrument: instrument ? 1 : 0,
        exponent: h1 ? exponent : -999,
        absSlope,
        ratioSpread: Number.isFinite(spread) ? spread : -1,
        ...Object.fromEntries(r0s.map((r0, i) => [`r2DriftR${r0}`, r0 * r0 * drift[i]!.mean])),
        ...Object.fromEntries(r0s.map((r0, i) => [`gradientR${r0}`, read.gradient[i]!.mean])),
        ...Object.fromEntries(r0s.map((r0, i) => [`gradientErrorR${r0}`, read.gradient[i]!.error])),
        ...Object.fromEntries(r0s.map((r0, i) => [`arrivalR${r0}`, read.arrival.forward[i]!])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        noKnotDisplacementZero: read.plain.forward.every(x => Math.abs(x.mean) <= 3 * x.error) ? 1 : 0,
      },
      notes: `L2. Gates H1 ${h1} (instrument ${instrument}, pull ${pull}), H2 ${h2}, H3 ${h3}. Drift D(r0) forward ${drift.map(f).join(', ')}; r0^2 D ${r0s.map((r0, i) => (r0 * r0 * drift[i]!.mean).toExponential(2)).join(', ')}; slope of ln |D| on ln r0 ${absSlope.toFixed(3)}${h1 ? `, exponent ${exponent.toFixed(3)}` : ' (H2 not evaluable: no positive drift at every r0)'}. Gradient dS/dr of the settled slot-entropy contrast ${read.gradient.map(f).join(', ')}; D / (-dS/dr) ${ratios.map(r => r.toExponential(2)).join(', ')} (spread ${Number.isFinite(spread) ? spread.toFixed(2) : 'undefined'}). First beat the knot touches the blob: forward ${read.arrival.forward.join(', ')}, backward ${read.arrival.backward.join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
