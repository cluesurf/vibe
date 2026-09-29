// The radion, static (E-GRV-0079): the husk column's depth given a wave rule of its own, sourced by content. Does an
// even-spin field on the husk make like sources ATTRACT with positive field energy, where E-GRV-0074's copy of the
// light (spin 1) repelled?
//
// THE CONSTRUCTION: code/rule/trit-radion (header), measured by code/measure/radion. An integer scalar phi on the husk
// docks (the depth less its mean), with its fraction carried in three levels as the shaped light carries its own
// (E-FRC-0214), whose shadow runs x_(t+1) - 2 x_t + x_(t-1) = - kappa A x_t + kappa rho exactly up to a remainder
// under 1 / Q^3 per dock per beat. A is the husk Laplacian in the light's metric, kappa = 2 / (9 (2D + 1)), so the
// depth's waves run at the light's c(D) = 2 / sqrt(3 (2D + 1)); the static solution is x = G * rho, a well. A STAND-IN:
// E-GRV-0071 showed that nothing in the model makes the depth read any state, so this rule is added by hand. What is
// tested is what an even field on this mesh DOES, not whether the model has one.
//
// THE SIGN, DERIVED BEFORE ANY RUN (code/measure/radion header). The leapfrog keeps
//   E = (pi / D) [ 1/2 sum (x_(t+1) - x_t)^2 / kappa + 1/2 x_(t+1) . A x_t - rho . (x_(t+1) + x_t) / 2 ]
// At the static well A x = rho it is -(pi / D) 1/2 rho . G rho, and two sources share the cross term -(pi / D) sa sb G(r):
// NEGATIVE, and deeper as they approach. The field's own part (rho = 0) is (pi / D)[1/2 v (1/kappa - A/4) v + 1/2 m A m]
// >= 0 because kappa lambda_max(A) <= 48 kappa = 32 / 99 < 4 at D 16. So the static energy is negative exactly where
// the waves' energy is positive, with no sign put in by hand: the vector field of E-GRV-0076 needed its static part
// counted negative by fiat; here the source term enters the energy linearly (- rho . x), and minimizing a positive
// quadratic minus a linear term gives minus half the quadratic's inverse. The pi / D scale is a chosen normalization
// (the rule's equation of motion does not fix it), set so the coupling equals the light's Coulomb coupling.
//
// PREDICTIONS AND GATES, fixed before the gated run (the disclosed probe tmp/rad-probe1.ts read one pair energy at r = 3,
// 4e-11 from the prediction at T = 1024, the cost of a run, and the bump's energy over 512 beats at 3 levels and 1):
//  S1 attraction: two sources of content 4 on the side-16 husk at r = 1 .. 7 (E-FRC-0241's six configurations, each its
//     own rule run of 1024 beats from zero field, the well read as the Hann-weighted time average) have
//     W(r) = 16 (pi / D)(G(0) - G(r)), the torus Green's (the light's pair energy with the other sign): W rises with r at
//     every step (they fall toward each other), equals the prediction to 1e-3 relative at every r, and the fit
//     c0 - k/r - b r^2 on r = 2 .. 6 gives k > 0 within 2 percent of sa sb / (24 D) = 0.041667. CONTROL: the unmodified
//     vector even field (E-GRV-0074's copy of the light, its static energy through code/measure/even-sign
//     pairLongitudinal, 16 beats of the light per configuration) gives -W(r) to 1e-3 relative: it repels.
//  S2 charge-blind: a lump of 3 love and 1 fear and its flip (1 love, 3 fear) source the field through content (love plus
//     fear): identical states on 64 of 64 beats. CONTROL: the same rule fed the charge (love minus fear) gives lump and
//     flip states that differ on 64 of 64 beats (so the comparison can fail). By construction: an L1 consistency check.
//  S3 positive energy: kappa lambda_max(A) < 4 (lambda_max read off the side-16 symbol); a resting bump (amplitude 12,
//     radius 4, no source, 4096 beats, sampled every 64) keeps E > 0 at every sample and within 1e-6 of its start
//     relative; a standing lump (content 4 with its sink, side 8, from zero field, 4096 beats) keeps E within 1e-6 of its
//     static energy's size of its start and its field part >= 0. CONTROL (reported): the same two runs carried in ONE
//     level (the remainder at 1 / Q per beat).
//  S4 exact: every run reverses bit for bit.
// Verdict: pass if S1 to S4 and the controls hold; partial if a control fails; fail otherwise.
//
// FIRST RUN (tmp/grv79-run1.log, 91 s, the record): fail on S3's lump tolerance, no gate moved. S1 holds: W(r) =
// 0.126582, 0.145074, 0.151892, 0.155185, 0.157028, 0.158093, 0.158656 at r = 1 .. 7, rising at every step, the torus
// Green's to 1.3e-10, fit k = 0.0418217 against 0.0416667 (0.37 percent, E-GRV-0076's own fit residue); the vector even
// field gives exactly minus it (1.3e-10) and repels. S2 holds (64 of 64; fed the charge, 0 of 64). S4 holds on all 47
// static runs and the four long runs. S3: kappa lambda_max = 32 kappa = 0.2155 (the symbol's top is 32, under
// Gershgorin's 48); the free bump keeps E = 1441.99 to 2.0e-7 and stays positive; but the standing lump, started at E =
// 0, wanders to -2.0e-6, 1.9e-5 of its static energy -0.1554, 19 times the gate. It is not heating: the three-level
// samples wander in both directions (0, -7.1e-7, -1.0e-6, -2.0e-6, -1.1e-6), while one level climbs steadily to +5.27
// (34 times the static energy) and the bump at one level gains 1.8 percent. POST RUN (tmp/rad-post79.ts, read by no
// gate): the lump's largest excursion over |U| is 34, 6.7e-3, 1.9e-5, 9.2e-8, 2.5e-10 at 1 .. 5 levels, about a factor
// Q = 297 per level, as the remainder's bound 1 / Q^L has it; the gate asked for more than three levels give.
//
// Depth L2: a known construction (a massless scalar, exchange of an even field) run as an integer reversible rule on
// the husk, with a control that could fail. DETERMINISM: every start and source is placed; nothing is drawn.
// NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  newTally as vectorTally,
  pairLongitudinal,
  SIGN_BEATS,
} from '@/code/measure/even-sign'
import { makeMedium } from '@/code/measure/varying-depth-light'
import {
  BLIND_BEATS,
  FIT_R,
  kappaOf,
  LIKE_CONTENT,
  LIKE_R,
  radionStaticSurvey,
  RADION_DEPTH,
  STATIC_SIDE,
  type LongRadion,
} from '@/code/measure/radion'
import { radionRule } from '@/code/rule/trit-radion'

const drift = (run: LongRadion): number =>
  Math.max(
    ...run.samples.map(s =>
      Math.abs(s.energy - run.samples[0]!.energy),
    ),
  )

export default experiment({
  id: 'gravity/radion-static',
  code: 'E-GRV-0079',
  title:
    "an even-spin depth field makes like sources attract with positive wave energy, fail on S3's tolerance only: the husk column's depth given its own integer wave rule (a STAND-IN, added by hand; phi carried in three levels as the shaped light carries its remainder, kappa = 2 / (9 (2D + 1)) so its waves run at the light's c(D)) has static pair energy W(r) = 0.1266 .. 0.1587 at r = 1 .. 7 on the side-16 husk, rising with r (like sources attract, the sign derived from the source entering the energy linearly, not put in), equal to the torus Green's to 1.3e-10 and fitting k = 0.04182 against sa sb / (24 D) = 0.04167, where the vector even field of E-GRV-0074 gives exactly minus it and repels; love and fear source it identically (by construction); kappa lambda_max = 0.2155 < 4 so the wave energy is positive, a free bump keeps it to 2.0e-7 and every run reverses bit for bit, but a standing lump's energy wanders by 1.9e-5 of its static energy against a gate of 1e-6 (not heating: both signs; one level climbs 34 fold of it; the wander falls by about Q = 297 per level, 9.2e-8 at four)",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = radionStaticSurvey(what => console.error(what))
    const rule = radionRule(RADION_DEPTH, 3)
    const kappa = kappaOf(rule)

    // S1
    const rising = s.like.every((w, i) => i === 0 || w > s.like[i - 1]!)
    const agree = Math.max(
      ...s.like.map((w, i) => Math.abs(w / s.predicted[i]! - 1)),
    )
    const kWant = (LIKE_CONTENT * LIKE_CONTENT) / (24 * RADION_DEPTH)
    const s1 =
      rising &&
      agree <= 1e-3 &&
      s.fitK > 0 &&
      Math.abs(s.fitK / kWant - 1) <= 0.02

    // S1 control: the vector even field on the light
    const m16 = makeMedium(
      [STATIC_SIDE, STATIC_SIDE, STATIC_SIDE],
      () => RADION_DEPTH,
    )
    const vt = vectorTally()
    const vector = LIKE_R.map(r =>
      pairLongitudinal(
        m16,
        r,
        LIKE_CONTENT,
        LIKE_CONTENT,
        SIGN_BEATS,
        vt,
      ),
    )

    console.error(`vector control done`)

    const mirror = Math.max(
      ...vector.map((v, i) => Math.abs(v / -s.like[i]! - 1)),
    )
    const repels = vector.every((v, i) => i === 0 || v < vector[i - 1]!)
    const controlS1 =
      mirror <= 1e-3 && repels && vt.gauss === 0 && vt.reversed

    // S2
    const s2 = s.blindIdentical === BLIND_BEATS
    const controlS2 = s.chargeIdentical === 0

    // S3
    const stable = kappa * s.laplacianTop < 4
    const packetE0 = s.packet.samples[0]!.energy
    const packetDrift = drift(s.packet) / packetE0
    const packetPositive = s.packet.samples.every(
      x => x.energy > 0 && x.free > 0,
    )
    const lumpDrift = drift(s.lump) / Math.abs(s.lumpStatic)
    const lumpFree = Math.min(...s.lump.samples.map(x => x.free))
    const s3 =
      stable &&
      packetPositive &&
      packetDrift <= 1e-6 &&
      lumpDrift <= 1e-6 &&
      lumpFree >= 0
    const packetOneDrift =
      drift(s.packetOne) / s.packetOne.samples[0]!.energy
    const lumpOneDrift = drift(s.lumpOne) / Math.abs(s.lumpStatic)

    // S4
    const s4 =
      s.tally.reversed &&
      s.packet.reversed &&
      s.packetOne.reversed &&
      s.lump.reversed &&
      s.lumpOne.reversed

    const status = !(controlS1 && controlS2)
      ? 'partial'
      : s1 && s2 && s3 && s4
        ? 'pass'
        : 'fail'
    const e = (x: number): string => x.toExponential(2)
    const f = (x: number): string => x.toPrecision(6)
    const metrics: Record<string, number> = {
      gate_S1: s1 ? 1 : 0,
      gate_S2: s2 ? 1 : 0,
      gate_S3: s3 ? 1 : 0,
      gate_S4: s4 ? 1 : 0,
      control_S1: controlS1 ? 1 : 0,
      control_S2: controlS2 ? 1 : 0,
      depth: RADION_DEPTH,
      kappa,
      laplacianTop: s.laplacianTop,
      kappaLambda: kappa * s.laplacianTop,
      agree,
      fitK: s.fitK,
      kWant,
      fitB: s.fitB,
      fitC0: s.fitC0,
      vectorMirror: mirror,
      vectorGauss: vt.gauss,
      staticRuns: s.tally.runs,
      blindIdentical: s.blindIdentical,
      chargeIdentical: s.chargeIdentical,
      packetEnergy: packetE0,
      packetDrift,
      packetOneDrift,
      lumpStatic: s.lumpStatic,
      lumpDrift,
      lumpOneDrift,
      lumpLeastFree: lumpFree,
      seconds: s.seconds,
    }

    LIKE_R.forEach((r, i) => {
      metrics[`W_r${r}`] = s.like[i]!
      metrics[`Wpredicted_r${r}`] = s.predicted[i]!
      metrics[`Wvector_r${r}`] = vector[i]!
    })

    return verdict({
      status,
      claim: `the radion (integer depth wave, 3 carried levels, kappa = 2 / (9 (2D + 1)), D ${RADION_DEPTH}): two content-4 sources have W(r) = ${s.like.map(f).join(', ')} at r = ${LIKE_R.join(', ')} (${rising ? 'rising' : 'NOT rising'} with r: they ${rising ? 'attract' : 'do not attract'}), the torus Green's to ${e(agree)}, fit k = ${f(s.fitK)} against ${f(kWant)}; the vector even field gives ${vector.map(f).join(', ')} (minus W to ${e(mirror)}: it repels); lump and flip identical on ${s.blindIdentical} of ${BLIND_BEATS} beats (fed the charge: ${s.chargeIdentical}); kappa lambda_max = ${f(kappa * s.laplacianTop)}; a free bump keeps E = ${f(packetE0)} to ${e(packetDrift)} and a standing lump to ${e(lumpDrift)} of its static energy ${f(s.lumpStatic)} over 4096 beats (one level: ${e(packetOneDrift)} and ${e(lumpOneDrift)}); every run reverses: ${s4}`,
      metrics,
      control: {
        vectorMirror: mirror,
        vectorRepels: repels ? 1 : 0,
        chargeIdentical: s.chargeIdentical,
        packetOneDrift,
        lumpOneDrift,
      },
      notes: `L2. Gates S1 ${s1}, S2 ${s2}, S3 ${s3}, S4 ${s4}; controls S1 ${controlS1}, S2 ${controlS2}. Fit on r = ${FIT_R.join(', ')}: c0 ${f(s.fitC0)}, k ${f(s.fitK)}, b ${e(s.fitB)}. Bump E by sample (3 levels): ${s.packet.samples
        .filter((_, i) => i % 8 === 0)
        .map(x => x.energy.toPrecision(12))
        .join(' ')}; one level: ${s.packetOne.samples
        .filter((_, i) => i % 8 === 0)
        .map(x => x.energy.toPrecision(8))
        .join(' ')}. Lump E (3 levels): ${s.lump.samples
        .filter((_, i) => i % 8 === 0)
        .map(x => x.energy.toExponential(3))
        .join(' ')}; one level: ${s.lumpOne.samples
        .filter((_, i) => i % 8 === 0)
        .map(x => x.energy.toExponential(3))
        .join(' ')}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
