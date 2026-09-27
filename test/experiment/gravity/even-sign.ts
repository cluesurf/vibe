// The signed even field, static (E-GRV-0076): the even field of E-GRV-0074 with its beat untouched and the energy
// of its static, Gauss-constraint part counted with the opposite sign. Do two even sources then attract as 1/r, is
// it still blind to charge and exact, and is its energy bounded below?
//
// THE PROPOSAL: code/measure/even-sign (header). The field energy I (the light's leapfrog invariant on the shadow)
// splits with no cross term into U_L, the energy of the gradient part E_L that Gauss fixes from the content, and
// U_T = I - U_L, the transverse electric and the magnetic energy. The proposal is H' = U_T - U_L. The split is
// Helmholtz in the energy's own metric 1/g: the one decomposition whose longitudinal part is set by the sources
// alone and which leaves no cross term, with no parameter in it. The beat is the rule's: H and H' differ only in the
// drift of a gradient angle, which no plaquette reads (a gauge drift). As in general relativity, where the
// constraint (conformal) part of the metric carries negative energy and the waves positive, the sign sits on the
// constraint and not on the radiation.
//
// WHAT IS PUT IN. The sign is chosen, not derived. So A1's sign is by construction: W' = -W of E-GRV-0074
// exactly, and A1 tests only that the rule's static field gives the 1/r law with the predicted coefficient on a
// larger husk. The questions that could fail are A1's coefficient and A4, whether a negative-energy sector leaves
// the energy bounded below on the states the rule reaches.
//
// PREDICTIONS, fixed before the gated run:
//  W'(r) on the side-8 husk: +0.00790, +0.00903, +0.00939, +0.00948 at r = 1 .. 4 (minus E-GRV-0074's W), rising
//  with r: the pair's energy falls as they approach, so they attract.
//  On the side-16 husk two sources of content 4 (3 love, 1 fear each) have W'(r) = const - k/r - b r^2 with
//  k = sa sb / (24 D) = 16 / 384 = 0.041667 (from G -> 1/(24 pi r), E-FRC-0241, times pi / D) and b = sa sb pi /
//  (36 V D) = 2.13e-5 (the torus's uniform background: L G = delta - 1/V with L -> -6 laplacian gives r^2 / (36 V)).
//  A4 holds: U_L is fixed by Gauss at every beat, so the negative part cannot grow while the sources stand.
//  The probe (below) showed the transverse energy GROWING on a long run; that growth is upward and is the
//  unmodified light's, the same beat.
//
// Gates, fixed before the first gated run of this file:
//  A1 attract: (i) W'(r) = -W(r) strictly increasing at r = 1 .. 4 on side 8 and at r = 1 .. 7 on side 16; (ii) the
//     side-16 rule energies equal the torus Green's -sa sb (pi/D)(G(0) - G(r)) to 1e-9; (iii) the fit
//     W' = c0 + c1 / r + c2 r^2 over r = 2 .. 6 gives k = -c1 within 5 percent of 1/24
//  A2 charge blind: a love and a fear source give W' equal to the love and love pair to 1e-12, the lump and its
//     charge flip run identically on every beat; the light is not changed: its love and fear pair energy is minus
//     the even like pair to 1e-9 and strictly increasing (opposite charges still attract)
//  A3 exact: Gauss against the source 0 on every beat of every run (E-GRV-0074's runs, the side-16 pair runs, the
//     long runs) and every run returns to its start bit for bit
//  A4 bounded below: on 2048 beats of the lump (content 4, sink at the antipode) and of a like pair (r = 2) on side
//     8, U_L changes by less than 1e-9 at every sample (every 64 beats), U_T >= 0 at every sample, so H' >= -U_L(0);
//     the lump's H' stays at or above minus the floor at every sample, the floor being the largest U_L its content
//     can hold with its sink ((pi/D) 16 times the largest G(0) - G(r) over every offset r of the side-8 torus: U_L
//     is convex in the placement, so it is largest with all the content on one dock); the zero-source run holds
//     energy 0 at every sample. Predicted and reported: the lump (sink at offset (4, 4, 4)) holds the floor itself
//  Control (inside A1 and A2): the unmodified even field's W is strictly decreasing at r = 1 .. 4 (it repels,
//     E-GRV-0074 F5, the same survey rerun)
// Verdict: pass if all hold; partial if A3 fails; fail otherwise.
//
// Reported, not gated: the fitted b and c0; the orthogonality of the split (sum E_L E_T / g); the largest growth
// of U_T and I on the long runs and their wraps; the minimum of H'.
//
// DISCLOSED: one probe before the gates, tmp/grv76-probe1.ts (tmp/grv76-probe1.log): the lump's split over 1024
// beats on side 8 (U_L 0.15538 at every sample, orthogonality below 7e-16, U_T from 9.27 to 130.9 with 342,416
// field wraps, Gauss 0, reversed), and a side-16 beat at 14.5 ms. No pair energy, force or arrival was read.
//
// FIRST RUN (tmp/grv0076-run1.log, 56 s): fail on A1 from a BUG IN THE INSTRUMENT, not a reading. The six-
// configuration pair energy placed its three cross dipoles at sa and sb units and then multiplied by sa sb, which
// counts sa^3 sb; E-GRV-0074 used only sources of +-1 and never met it. Side 16 read 4.93 to 4.98 against the torus
// Green's (off by 4.8). The formula was corrected to its own comment (unit cross dipoles); no gate was moved.
// SECOND RUN (tmp/grv0076-run2.log, 44 s, the record): pass, every gate as fixed. W' = 0.0079018, 0.0090259,
// 0.0093890, 0.0094811 at r = 1 .. 4 on side 8 (the unmodified field's exactly negated: it repels, the proposal
// attracts); on side 16 W' = 0.12658, 0.14507, 0.15189, 0.15518, 0.15703, 0.15809, 0.15866 at r = 1 .. 7, equal to
// the torus Green's to 7.3e-15; the fit gives k = 0.041822 against 1/24 = 0.041667 (0.37 percent) and b = 2.86e-5
// against 2.13e-5 (the r^2 term also absorbs the torus's higher images, reported only). A love and a fear source
// give identical W' (difference 0), and the light's own love and fear pair is minus the even like pair to 3.4e-16
// (it still attracts). Gauss 0 and exact reversal on all 42 side-16 runs, E-GRV-0074's runs and the three long
// runs. Over 2048 beats U_L moved by 0 on the lump and the pair, U_T never fell below its start (least 9.269 and
// 12.237), H' never fell below 9.114, and the lump's U_L 0.155377 is the floor its content allows (to 5e-16); the
// zero-source run held 0. What A4 found beside the gate: U_T GROWS, 26.9 fold on the lump and 21.0 fold on the pair
// in 2048 beats, steadily (about 0.12 a beat), with 2.9 and 3.3 million field wraps. That is the integer light
// heating at a standing string (the same beat as the unmodified field): it grows UP, so it does not threaten the
// bound, but it is growth, and E-GRV-0077 F3 gates it. Title written after the run.
//
// Depth: L1 for the sign (put in) and for A2 (the copy's source map); L2 for A1's coefficient and A3 (the rule's
// own flux against a closed form) and A4 (the rule's long runs). DETERMINISM: every source is placed; nothing is
// drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { EVEN_DEPTH } from '@/code/measure/even-field'
import { FIT_R, LIKE_R, LONG_BEATS, LUMP_CONTENT, SIGN_SIDE, staticSurvey, type LongRun } from '@/code/measure/even-sign'

const increasing = (xs: readonly number[]): boolean => xs.every((x, i) => i === 0 || x > xs[i - 1]!)
const decreasing = (xs: readonly number[]): boolean => xs.every((x, i) => i === 0 || x < xs[i - 1]!)
const worst = (a: readonly number[], b: readonly number[], f: (x: number, y: number) => number): number => Math.max(...a.map((x, i) => Math.abs(f(x, b[i]!))))
const wrapsOf = (w: { angle: number; field: number; potential: number }): number => w.angle + w.field + w.potential
const drift = (run: LongRun): number => Math.max(...run.samples.map(s => Math.abs(s.longitudinal - run.samples[0]!.longitudinal)))
const leastTransverse = (run: LongRun): number => Math.min(...run.samples.map(s => s.transverse))
const growth = (run: LongRun): number => Math.max(...run.samples.map(s => s.transverse)) / run.samples[0]!.transverse

export default experiment({
  id: 'gravity/even-sign',
  code: 'E-GRV-0076',
  title:
    "counting the even field's static energy negative makes like sources ATTRACT as 1/r with the predicted coefficient and leaves the energy bounded below, pass (the sign is put in, not derived): the even field of E-GRV-0074 with its beat untouched and its energy split by Helmholtz in its own metric (the gradient part Gauss fixes from the content, with no cross term against the rest, orthogonality 6e-16), the static part counted negative and the radiative part positive, gives two even sources W'(r) = +0.00790, +0.00903, +0.00939, +0.00948 at r = 1 .. 4 (minus E-GRV-0074's repulsion, by construction), and on a side-16 husk two sources of content 4 give W' equal to the torus Green's to 7e-15 and fit to c0 - k/r - b r^2 with k = 0.04182 against sa sb / (24 D) = 0.04167 (0.4 percent); a love and a fear source attract identically and the light's own opposite charges still attract; Gauss holds on every beat of every run and every run reverses bit for bit; on 2048 beats of a standing lump and a like pair the negative part does not move (drift 0), the positive part never falls below its start, and the lump already holds the lowest static energy its content can reach on the mesh, so H' is bounded below by the mesh's smallest distance; but the positive part GROWS 27 and 21 fold with millions of field wraps, the integer light heating at a standing string, which is the unmodified beat's own",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = staticSurvey(what => console.error(what))
    const e = s.even
    const signed8 = e.evenLike.map(w => -w)
    const signed16 = s.like16.map(w => -w)
    const kWant = (LUMP_CONTENT * LUMP_CONTENT) / (24 * EVEN_DEPTH)
    const bWant = (LUMP_CONTENT * LUMP_CONTENT * Math.PI) / (36 * SIGN_SIDE ** 3 * EVEN_DEPTH)
    const ruleVsGreen = worst(s.like16, s.green16, (x, y) => x - y)
    const kOff = Math.abs(s.fitK / kWant - 1)
    const g1 = increasing(signed8) && increasing(signed16) && ruleVsGreen < 1e-9 && kOff <= 0.05 && decreasing(e.evenLike)

    const loveFearVsLike = worst(e.evenLoveFear, e.evenLike, (x, y) => x - y)
    const oddPlusEven = worst(e.oddLoveFear, e.evenLike, (x, y) => x + y)
    const g2 = loveFearVsLike < 1e-12 && e.evenFlipIdentical && oddPlusEven < 1e-9 && increasing(e.oddLoveFear)

    const lumpRuns = [e.evenLump, e.evenFlip, e.oddLump, e.oddFlip]
    const longRuns = [s.lump, s.pair, s.zero]
    const g3 =
      lumpRuns.every(r => r.gauss === 0 && r.reversed) &&
      e.pairGauss === 0 &&
      e.pairReversed &&
      s.tally.gauss === 0 &&
      s.tally.reversed &&
      longRuns.every(r => r.gauss === 0 && r.reversed)

    const floorOff = Math.abs(s.lump.samples[0]!.longitudinal - s.floor)
    const zeroEnergy = Math.max(...s.zero.samples.map(x => Math.abs(x.invariant) + Math.abs(x.longitudinal)))
    const signedMin = Math.min(...[s.lump, s.pair].flatMap(r => r.samples.map(x => x.signed)))
    const g4 =
      [s.lump, s.pair].every(r => drift(r) < 1e-9 && leastTransverse(r) >= 0 && r.samples.every(x => x.signed >= -r.samples[0]!.longitudinal)) &&
      s.lump.samples.every(x => x.signed >= -s.floor - 1e-12) &&
      zeroEnergy === 0

    const status = !g3 ? 'partial' : g1 && g2 && g4 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const orthogonality = Math.max(...[s.lump, s.pair].flatMap(r => r.samples.map(x => Math.abs(x.orthogonality))))
    const invariantGrowth = (run: LongRun): number => run.samples[run.samples.length - 1]!.invariant - run.samples[0]!.invariant

    const metrics: Record<string, number> = {
      gate_A1: g1 ? 1 : 0,
      gate_A2: g2 ? 1 : 0,
      gate_A3: g3 ? 1 : 0,
      gate_A4: g4 ? 1 : 0,
      depth: EVEN_DEPTH,
      kFit: s.fitK,
      kWant,
      kOff,
      bFit: s.fitB,
      bWant,
      c0Fit: s.fitC0,
      ruleVsGreen,
      loveFearVsLike,
      oddPlusEven,
      side16Runs: s.tally.runs,
      side16Gauss: s.tally.gauss,
      side16Drift: s.tally.drift,
      side16Wraps: s.tally.wraps,
      longBeats: LONG_BEATS,
      lumpLongitudinal: s.lump.samples[0]!.longitudinal,
      floor: s.floor,
      floorOff,
      lumpDrift: drift(s.lump),
      pairDrift: drift(s.pair),
      lumpLeastTransverse: leastTransverse(s.lump),
      pairLeastTransverse: leastTransverse(s.pair),
      lumpTransverseGrowth: growth(s.lump),
      pairTransverseGrowth: growth(s.pair),
      lumpInvariantGrowth: invariantGrowth(s.lump),
      pairInvariantGrowth: invariantGrowth(s.pair),
      signedMin,
      orthogonality,
      zeroEnergy,
      lumpWraps: wrapsOf(s.lump.wraps),
      pairWraps: wrapsOf(s.pair.wraps),
      seconds: s.seconds,
    }

    signed8.forEach((w, i) => {
      metrics[`signed8_r${i + 1}`] = w
      metrics[`unmodified8_r${i + 1}`] = e.evenLike[i]!
    })
    LIKE_R.forEach((r, i) => {
      metrics[`signed16_r${r}`] = signed16[i]!
    })

    return verdict({
      status,
      claim: `the even field with its static (longitudinal) energy counted negative and its radiative energy positive (D ${EVEN_DEPTH}): two even sources have W'(r) = ${signed8.map(f).join(', ')} at r = 1 .. 4 on side 8 (${increasing(signed8) ? 'rising with r: they ATTRACT' : 'not rising'}), and two sources of content ${LUMP_CONTENT} on side 16 ${signed16.map(f).join(', ')} at r = ${LIKE_R.join(', ')}, the rule's energies equal to the torus Green's to ${ruleVsGreen.toExponential(1)}; the fit c0 - k/r - b r^2 over r = ${FIT_R.join(', ')} gives k = ${f(s.fitK)} against ${f(kWant)} (${(kOff * 100).toFixed(2)} percent) and b = ${s.fitB.toExponential(3)} against ${bWant.toExponential(3)}; a love and a fear source give the same W' (${loveFearVsLike.toExponential(1)}) and the light's own love and fear pair still attracts; Gauss ${g3 ? 'exact and reversal bit for bit on every run' : 'NOT exact on every run'}; over ${LONG_BEATS} beats U_L moves by ${Math.max(drift(s.lump), drift(s.pair)).toExponential(1)}, U_T never falls below ${f(Math.min(leastTransverse(s.lump), leastTransverse(s.pair)))}, so H' stays above -U_L (least ${f(signedMin)}), and the lump's U_L ${f(s.lump.samples[0]!.longitudinal)} ${floorOff < 1e-9 ? 'is' : 'is NOT'} the floor its content allows (${f(s.floor)}); U_T grows ${f(growth(s.lump))} fold on the lump (the unmodified beat's own growth)`,
      metrics,
      control: {
        unmodifiedRepels: decreasing(e.evenLike) ? 1 : 0,
        zeroEnergy,
      },
      notes: `L2 (the sign is put in: W' = -W by construction). Gates A1 ${g1}, A2 ${g2}, A3 ${g3}, A4 ${g4}. Side-16 runs ${s.tally.runs}, ${s.tally.wraps} wraps. Long-run wraps: lump ${JSON.stringify(s.lump.wraps)}, pair ${JSON.stringify(s.pair.wraps)}. Lump U_T by sample: ${s.lump.samples.map(x => x.transverse.toFixed(2)).join(' ')}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
