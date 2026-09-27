// The even field (E-GRV-0074): the husk light run a second time, sourced by content (love PLUS fear, the number
// of filled slots) instead of charge (love minus fear). Is it exact, reversible and gauge covariant as the light
// is, is its static field the light's 1/(24 pi r), is it blind to the source's charge, and do like sources of it
// attract (gravity's sign) or repel (electromagnetism's)?
//
// THE CONSTRUCTION: code/measure/even-field (header). No new rule: the copy is mediumBeat (the husk integer rule's
// wave form, code/rule/trit-husk fastBeat) at one depth D0 = 16 on the side-8 husk, with its string field placed
// so that div S is each column's content. A closed husk cannot hold a source that never goes negative (div S sums
// to zero on a torus), so every even source is compensated at a far dock, the SINK (a disclosed stand-in; the
// physical compensator would be at infinity). The lump is one column of 3 love and 1 fear (content 4, charge +2);
// its flip is 1 love and 3 fear. The light (the odd copy) is run beside it on the same lump as the control.
//
// THE SIGN, stated before the run. The field energy is (pi / D) 1/2 sum E^2 / g, a sum of squares: positive
// definite, as any stable field's is. Two sources of one sign therefore have a positive cross term
// (pi / D) s_a s_b (G(r) - G(0)) that GROWS as they approach, so like sources REPEL. An even source is never
// negative, so every pair of even sources is a like pair: the reused machinery predicts REPULSION, and F5 tests
// that prediction; it is not the gravity sign.
//
// Gates, fixed before the first run of this file:
//  F1 exact: every run (the lump and its flip on both copies, and every pair configuration of F4 and F5, 48 beats
//     each) keeps div (S - C^T U) equal to its source map on every dock at every beat (0 violations), and returns
//     to its start bit for bit when run back
//  F2 gauge covariant: the integer gauge function lambda(y) = (5 y^2 + 3 y + 1 mod 11) - 5 carries no plaquette
//     field (largest weighted plaquette sum 0), and beat(gauge(s)) equals gauge(beat(s)) bit for bit on 48 of 48
//     beats of the even lump
//  F3 charge blind: the even copy of the lump and of its flip are identical bit for bit on every beat; control:
//     the light's two runs differ
//  F4 the static field is the light's: the source-sink energy at r = 1 .. 4 along the axis, read off the copy's own
//     flux, equals (pi / D)(G_8(0) - G_8(r)) of the side-8 husk torus to 1e-9, and the longitudinal energy of every
//     configuration is constant over 48 beats to 1e-9. The static operator is then E-FRC-0241's, whose infinite
//     husk Green's function is 1/(24 pi r) + A/r^5 with no 1/r^3 (cited, not rerun)
//  F5 the sign (PREDICTED: repulsion): the even copy's pair energy W(r) of two even sources is strictly decreasing
//     at r = 1 .. 4 (they repel) and equals minus the source-sink energy to 1e-9; a love and a fear source give
//     the same W to 1e-12 (charge blind); the light's pair energy of that love and fear is minus W to 1e-9 and
//     strictly increasing (they attract)
// Verdict: pass if all hold; partial if F1 fails; fail otherwise.
//
// Reported, not gated: wraps of every run; whether the light's flip is the exact negation of its lump (the
// wrap seam at -n / 2 is not odd, so it need not be).
//
// FIRST RUN (tmp/grv0074-run1.log, 15.8 s, the record): pass, every gate as fixed. Gauss 0 on the lump runs and on
// the 76 pair runs, all reversed, 0 wraps; gauge plaquette 0 and covariant on 48 of 48 beats; the even lump and
// flip identical on every beat, the light's flip its exact negation (reported); source-sink energies 0.0079018,
// 0.0090259, 0.0093890, 0.0094811 equal to the torus Green's to 1.6e-16, drift 0; W(r) = minus those (to 2.5e-16),
// the love and fear pair identical to the love and love pair (0 difference), the light's love and fear pair minus
// W (to 3.4e-16). Title written after the run.
//
// WHAT THE SIGN MEANS, and the smallest change (reasoned, not run). Repulsion is forced by the energy being a sum of
// squares, not by any detail of the rule. The smallest change that gives attraction is the opposite sign of the
// field's STATIC (longitudinal) energy, as matter reads it: W -> -W. That leaves the beat, and so reversibility,
// untouched (a sign in how an energy is counted is not a step of the rule), and F4's drift of 0 is the reason it
// is not a runaway: the longitudinal energy is fixed by Gauss at every beat and exchanges nothing with the waves
// while the sources stand still, as the negative Newtonian energy of general relativity lives in its constraint and
// not in its radiation. Flipping the sign of the whole copy's energy would instead give negative-energy waves,
// which coupled to positive-energy matter can grow without bound. The depth route of E-GRV-0075 needs neither: the
// lens's sign is set by depth rising where the potential is high, and the potential of an even source is positive.
//
// Depth: L2 for F1 to F3 (the rule's own integers, bit for bit); F4 and F5 are the rule's flux against a closed
// form. DETERMINISM: every source and gauge function is placed; nothing is drawn. NOTHING MOVES: each value takes
// its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { EVEN_BEATS, EVEN_DEPTH, evenSurvey } from '@/code/measure/even-field'

const decreasing = (xs: readonly number[]): boolean => xs.every((x, i) => i === 0 || x < xs[i - 1]!)
const increasing = (xs: readonly number[]): boolean => xs.every((x, i) => i === 0 || x > xs[i - 1]!)
const worst = (a: readonly number[], b: readonly number[], f: (x: number, y: number) => number): number => Math.max(...a.map((x, i) => Math.abs(f(x, b[i]!))))

export default experiment({
  id: 'gravity/even-field',
  code: 'E-GRV-0074',
  title:
    "the even field is the husk light sourced by content, and like sources of it REPEL, pass (the repulsion was the prediction): the light's own rule with div S set to each column's content (love plus fear) instead of its charge, compensated at a far sink since a closed husk cannot hold a never-negative source, keeps Gauss against the content on every beat of every run, reverses bit for bit, is gauge covariant on 48 of 48 beats, and is identical for a lump and its charge flip while the light's differ; its static field is the light's (source-sink energies equal (pi/D)(G(0) - G(r)) to 1.6e-16, so 1/(24 pi r) + A/r^5 with no 1/r^3, E-FRC-0241), and two even sources have W(r) = -0.00790, -0.00903, -0.00939, -0.00948 at r = 1 .. 4, rising as they approach: a sum-of-squares field energy makes every pair of one sign repel, and an even source has one sign, so a copy of the light repels where gravity attracts; a love and a fear source repel identically, while the light's own love and fear pair attracts with exactly the opposite energy",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = evenSurvey(what => console.error(what))
    const runs = [s.evenLump, s.evenFlip, s.oddLump, s.oddFlip]

    const g1 = runs.every(r => r.gauss === 0 && r.reversed) && s.pairGauss === 0 && s.pairReversed
    const g2 = s.gaugePlaquette === 0 && s.gaugeCovariant
    const g3 = s.evenFlipIdentical && s.oddFlipDiffers
    const dipoleVsGreen = worst(s.dipole, s.green, (x, y) => x - y)
    const g4 = dipoleVsGreen < 1e-9 && s.energyDrift < 1e-9 && s.evenLump.energyDrift < 1e-9 && s.evenFlip.energyDrift < 1e-9
    const likePlusDipole = worst(s.evenLike, s.dipole, (x, y) => x + y)
    const loveFearVsLike = worst(s.evenLoveFear, s.evenLike, (x, y) => x - y)
    const oddPlusEven = worst(s.oddLoveFear, s.evenLike, (x, y) => x + y)
    const g5 = decreasing(s.evenLike) && likePlusDipole < 1e-9 && loveFearVsLike < 1e-12 && oddPlusEven < 1e-9 && increasing(s.oddLoveFear)
    const status = !g1 ? 'partial' : g2 && g3 && g4 && g5 ? 'pass' : 'fail'
    const wrapsOf = (w: { angle: number; field: number; potential: number }): number => w.angle + w.field + w.potential
    const f = (x: number): string => x.toPrecision(6)

    const metrics: Record<string, number> = {
      gate_F1: g1 ? 1 : 0,
      gate_F2: g2 ? 1 : 0,
      gate_F3: g3 ? 1 : 0,
      gate_F4: g4 ? 1 : 0,
      gate_F5: g5 ? 1 : 0,
      depth: EVEN_DEPTH,
      beats: EVEN_BEATS,
      gaussLumpRuns: runs.reduce((a, r) => a + r.gauss, 0),
      gaussPairRuns: s.pairGauss,
      gaugePlaquette: s.gaugePlaquette,
      gaugeCovariantBeats: s.gaugeCovariantBeats,
      evenFlipIdentical: s.evenFlipIdentical ? 1 : 0,
      oddFlipDiffers: s.oddFlipDiffers ? 1 : 0,
      oddFlipNegated: s.oddFlipNegated ? 1 : 0,
      evenLumpEnergy: s.evenLump.energyStart,
      evenFlipEnergy: s.evenFlip.energyStart,
      dipoleVsGreen,
      energyDrift: Math.max(s.energyDrift, s.evenLump.energyDrift, s.evenFlip.energyDrift),
      likePlusDipole,
      loveFearVsLike,
      oddPlusEven,
      wrapsLumpRuns: runs.reduce((a, r) => a + wrapsOf(r.wraps), 0),
      seconds: s.seconds,
    }

    s.dipole.forEach((_, i) => {
      const r = i + 1

      metrics[`dipole_r${r}`] = s.dipole[i]!
      metrics[`green_r${r}`] = s.green[i]!
      metrics[`evenLike_r${r}`] = s.evenLike[i]!
      metrics[`evenLoveFear_r${r}`] = s.evenLoveFear[i]!
      metrics[`oddLoveFear_r${r}`] = s.oddLoveFear[i]!
    })

    return verdict({
      status,
      claim: `the husk light sourced by content (D ${EVEN_DEPTH}, side 8, ${EVEN_BEATS} beats): Gauss against the content ${g1 ? 'exact' : 'NOT exact'} on every run and exact reversal ${s.pairReversed && runs.every(r => r.reversed)}; gauge covariant on ${s.gaugeCovariantBeats} of ${EVEN_BEATS} beats (gauge plaquette ${s.gaugePlaquette}); the lump and its flip identical on the even copy (${s.evenFlipIdentical}) while the light's differ (${s.oddFlipDiffers}); source-sink energies ${s.dipole.map(f).join(', ')} against (pi/D)(G(0) - G(r)) ${s.green.map(f).join(', ')} (worst ${dipoleVsGreen.toExponential(1)}); two even sources W(r) = ${s.evenLike.map(f).join(', ')} at r = 1 .. 4, ${decreasing(s.evenLike) ? 'falling with distance: they REPEL' : 'not falling'}, the same for a love and a fear (${loveFearVsLike.toExponential(1)}), while the light's love and fear pair reads ${s.oddLoveFear.map(f).join(', ')} (attract)`,
      metrics,
      control: {
        oddFlipDiffers: s.oddFlipDiffers ? 1 : 0,
        oddLoveFear_r1: s.oddLoveFear[0]!,
      },
      notes: `L2. The copy is the light's own rule with a different source map: no new rule. STAND-IN: each even source is compensated at a far dock (a torus cannot hold a source that never goes negative). Gates F1 ${g1}, F2 ${g2}, F3 ${g3}, F4 ${g4}, F5 ${g5}. Wraps on the lump runs: ${runs.map(r => JSON.stringify(r.wraps)).join(' ')}. The light's flip is the exact negation of its lump: ${s.oddFlipNegated}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
