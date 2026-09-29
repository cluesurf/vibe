// The signed even field, moving (E-GRV-0077): with the static energy of the even field counted negative
// (E-GRV-0076, code/measure/even-sign), do a light and a heavy lump fall alike, does radiation still carry positive
// energy at the light's speed, and does anything grow on a long run?
//
// THE CONSTRUCTION: code/measure/even-sign (header). A test lump of content m at distance r from a source of
// content M feels the force -dW'/dr, read off the rule's own flux (E-FRC-0241's six configurations, each placed
// and run 16 beats forward and back) at r = 3 and 5 on the side-16 husk: F(4) = -(W'(5) - W'(3)) / 2.
// INERTIA IS A STAND-IN: the even copy has no moving matter and no inertia of its own, so the acceleration is
// a = F / m with the inertial mass taken as the content (as code/rule/trit-kinetic's mass register is a stand-in).
// So F1 is NOT a test of the equivalence of inertial and gravitational mass. What it tests is the other half: that
// the pull per unit content is the same whatever the content and whatever its love and fear, which a charge-read
// field fails (the control).
//
// PREDICTIONS, fixed before the gated run:
//  F1: the source is 2 love and 2 fear (content 4, charge 0); the light lump is 1 love (content 1), the heavy lump
//      3 fear (content 3). Both accelerate TOWARD the source at the same a per unit content; the finite difference
//      of W' = c0 - k/r - b r^2 (E-GRV-0076) gives a = -(M / (24 D)) (1/15) + 8 M pi / (36 V D) = -6.81e-4 at r = 4
//      (the second term is the torus's uniform background, which pushes out). The unmodified even field pushes both
//      away by the same amount. The light, pulling the same two lumps from a charged source (3 love, 1 fear), pulls
//      them per unit content with opposite signs.
//  F2: the plane packet of E-GRV-0070 (D 16, amplitude 12, support 16 docks, line box 192 x 2 x 2) has no
//      divergence, so U_L = 0 and H' = I > 0 exactly; it moves at c(16) = 2 / sqrt(99) as there (1.00035 c).
//  F3: the negative part cannot grow while the sources stand (Gauss fixes it), but the transverse energy of a
//      standing lump DOES grow on the integer light: the probe of E-GRV-0076 (tmp/grv76-probe1.log) read U_T from
//      9.27 to 130.9 in 1024 beats with 342,416 field wraps. PREDICTED: F3's growth bound FAILS, and the growth is the
//      unmodified beat's own (the proposal changes no step, so the unmodified energy grows by the same amount).
//  R (reported): the pull's signal speed. When the source hops one dock at beat 0, E_L changes at once at every
//      dock, so the proposal's pull s (E~ - 2 E_L) changes at once everywhere, while the rule's own flux E~, and so
//      the unmodified pull s E~, changes at a dock only when the rule's front arrives.
//
// Gates, fixed before the first gated run of this file:
//  F1 alike: the even copy's a (per unit content) of the light and the heavy lump are both negative (toward the
//     source) and equal to a relative 1e-9; a zero source gives |a| < 1e-15; control: the light's per-content
//     accelerations of the same two lumps from the charged source have opposite signs
//  F2 radiation: the packet's U_L is 0 and its I > 0 at every sample (every 35 beats over 490), so H' = I > 0; its
//     speed between x = 60 and 100 is within 1 percent of c(16); the standing lump's U_T >= 0 at every sample of
//     4096 beats
//  F3 no growth: on 4096 beats of the lump (content 4, side 8, D 16, sampled every 128), U_L moves by less than 1e-9,
//     U_T >= 0, and U_T never exceeds twice its start; control: the zero-source run holds energy 0 at every sample
// Instrument: Gauss 0 on every beat and exact reversal on every run. Verdict: pass if F1 to F3 hold; partial if the
// instrument fails; fail otherwise.
//
// Reported, not gated: the unmodified field's accelerations; the charged source's total per-content pull (even
// plus light) on each lump; the packet's energy drift and wraps; the largest growth of U_T and of I on the lump at
// D 16 and at D 64 (a deeper column, whose light resolves smaller fields); R's changes and arrivals at d = 2 .. 7.
//
// FIRST RUN (tmp/grv0077-run1.log, 70 s, the record; after E-GRV-0076's instrument fix): fail on F3, as predicted,
// no gate moved. F1 holds: the light lump and the heavy lump accelerate toward the source at -6.41986e-4 per unit
// content each (alike to 5.0e-12), 1.5 percent under the closed form -6.518e-4 (the r^2 fit and the finite
// difference), the zero source gives exactly 0, the unmodified field pushes them away at +6.42e-4, and the light
// pulls them from a charged source at +3.21e-4 and -3.21e-4 per unit content (charge-read: composition dependent,
// so the check can fail); with both copies acting on that charged source the totals are -3.21e-4 and -9.63e-4.
// F2 holds: the packet has U_L = 0 and H' = I > 0 at every sample, and moves at 1.00035 c(16) (0 wraps); the
// standing lump's U_T never falls below its start. F3 fails on growth: U_L moves by 0 over 4096 beats and U_T stays
// positive, but U_T grows 52.9 fold (9.27 to 490.2, linear, about 0.117 a beat, 8,048,762 wraps); at D 64 the same
// lump grows 1.83 fold (2.32 to 4.24, 1,239,770 wraps). The zero-source run holds 0. R: when the source hops, E_L
// changes at once by 1.37e-2, 3.61e-3, 1.50e-3, 7.64e-4, 4.51e-4, 3.15e-4 at d = 2 .. 7, while the rule's own flux
// first changes there at beats 5, 9, 15, 20, 25, 30 (about 0.2 docks a beat, the light's c = 0.201): the unmodified
// pull is causal and the proposal's acts at a distance at once, by twice its final change.
// POST RUN (tmp/grv77-post.ts, written after the run, read by no gate): the packet's own invariant I is NOT kept
// by the integer rule: 4.570 at beat 0, 5.19 at 40, 57.7 at 490 with 0 wraps, while the linear leapfrog run from the
// same start holds 4.5696 on every beat (so the reading is right and the rule heats). So the growth of F3 is not
// only a standing string's: the integer light heats a clean wave too (E-FRC-0211 saw it after an impulse), and the
// packet's arrival survives it only because the half-maximum centroid reads the peak. None of it is the sign's: the
// proposal changes no step. Title written after the run.
//
// Depth: L1 for the sign (put in); L2 for F1 (the rule's flux against a closed form, with a stand-in inertia), F2
// and F3 (the rule's own runs). DETERMINISM: every source and packet is placed; nothing is drawn. NOTHING MOVES:
// each value takes its new value by the rule; the hop is a scheduled change of one string link.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { EVEN_DEPTH } from '@/code/measure/even-field'
import {
  DEEP,
  FALL_AT,
  FALL_CASES,
  FALL_LONG,
  FALL_R,
  fallSurvey,
  HOP_D,
  LUMP_CONTENT,
  SIGN_SIDE,
  type LongRun,
} from '@/code/measure/even-sign'
import {
  lightSpeed,
  type Run,
} from '@/code/measure/varying-depth-light'

const wrapsOf = (w: {
  angle: number
  field: number
  potential: number
}): number => w.angle + w.field + w.potential
const drift = (run: LongRun): number =>
  Math.max(
    ...run.samples.map(s =>
      Math.abs(s.longitudinal - run.samples[0]!.longitudinal),
    ),
  )
const leastTransverse = (run: LongRun): number =>
  Math.min(...run.samples.map(s => s.transverse))
const growth = (run: LongRun): number =>
  Math.max(...run.samples.map(s => s.transverse)) /
  run.samples[0]!.transverse
const invariantGrowth = (run: LongRun): number =>
  Math.max(...run.samples.map(s => s.invariant)) /
  run.samples[0]!.invariant

export default experiment({
  id: 'gravity/even-fall',
  code: 'E-GRV-0077',
  title:
    "with the even field's static energy counted negative, a light and a heavy lump fall alike and radiation stays positive, but the integer light heats and the pull acts at a distance at once, fail on F3 (as predicted): at r = 4 from a neutral source of content 4 on the side-16 husk, a lump of 1 love and a lump of 3 fear accelerate toward it at -6.41986e-4 per unit content each (alike to 5e-12, 1.5 percent from the closed form -6.52e-4; inertia taken as content, a stand-in, so this is the universality of the pull per unit content, not an equivalence of inertial mass), the unmodified field pushes them away by the same, and the light pulls the same two lumps from a charged source with opposite signs; a plane packet carries U_L = 0 and H' = I > 0 and moves at 1.00035 c; on 4096 beats of a standing lump the negative part does not move and the positive part stays positive, but grows 52.9 fold with 8 million field wraps (1.83 fold at D 64), and a post run shows the integer rule heats even a clean packet (4.57 to 57.7 in 490 beats, 0 wraps) while the linear leapfrog keeps it exactly, so the growth is the integer light's and not the sign's; and when the source hops one dock the proposal's pull changes at once at every distance (E_L by 1.4e-2 to 3.1e-4 at d = 2 .. 7) while the rule's own flux arrives at beats 5 to 30, about c: the sign breaks the cancellation that keeps the light's pull causal",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = fallSurvey(what => console.error(what))
    const caseOf = (name: string) =>
      FALL_CASES.find(c => c.name === name)!
    // W_L at FALL_R = [3, 5]: the force at 4 by the central difference, per unit content
    const force = (name: string, sign: number): number =>
      (-sign * (s.pairs[name]![1]! - s.pairs[name]![0]!)) /
      (FALL_R[1]! - FALL_R[0]!)

    // the proposal's energy on the even copy is -W_L (sign -1); the light keeps +W_L
    const perContent = (name: string): number => {
      const c = caseOf(name)

      return force(name, c.copy === 'even' ? -1 : 1) / c.content
    }

    const aLight = perContent('even_light')
    const aHeavy = perContent('even_heavy')
    const aZero = perContent('zero')
    const lightLight = perContent('light_light')
    const lightHeavy = perContent('light_heavy')
    const alike = Math.abs(aLight / aHeavy - 1)
    const g1 =
      aLight < 0 &&
      aHeavy < 0 &&
      alike < 1e-9 &&
      Math.abs(aZero) < 1e-15 &&
      Math.sign(lightLight) !== Math.sign(lightHeavy)
    const volume = SIGN_SIDE ** 3
    const aWant =
      (-(LUMP_CONTENT / (24 * EVEN_DEPTH)) *
        (1 / FALL_R[0]! - 1 / FALL_R[1]!)) /
        (FALL_R[1]! - FALL_R[0]!) +
      (LUMP_CONTENT * Math.PI * (FALL_R[1]! + FALL_R[0]!)) /
        (36 * volume * EVEN_DEPTH)

    const c = lightSpeed(EVEN_DEPTH)
    const speedRatio = s.packetSpeed / c
    const packetFine = s.packetEnergy.samples.every(
      x =>
        x.longitudinal === 0 &&
        x.invariant > 0 &&
        x.signed === x.invariant,
    )
    const g2 =
      packetFine &&
      Math.abs(speedRatio - 1) <= 0.01 &&
      leastTransverse(s.lump) >= 0

    const zeroEnergy = Math.max(
      ...s.zero.samples.map(
        x => Math.abs(x.invariant) + Math.abs(x.longitudinal),
      ),
    )
    const lumpGrowth = growth(s.lump)
    const g3 =
      drift(s.lump) < 1e-9 &&
      leastTransverse(s.lump) >= 0 &&
      lumpGrowth <= 2 &&
      zeroEnergy === 0

    const runs: Pick<Run, 'gauss' | 'reversed'>[] = [
      s.packet,
      s.packetEnergy,
      s.lump,
      s.lumpDeep,
      s.zero,
      s.hop,
    ]
    const instrument =
      s.tally.gauss === 0 &&
      s.tally.reversed &&
      runs.every(r => r.gauss === 0 && r.reversed)
    const status = !instrument
      ? 'partial'
      : g1 && g2 && g3
        ? 'pass'
        : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const last = (run: LongRun) => run.samples[run.samples.length - 1]!

    const metrics: Record<string, number> = {
      gate_F1: g1 ? 1 : 0,
      gate_F2: g2 ? 1 : 0,
      gate_F3: g3 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      depth: EVEN_DEPTH,
      fallAt: FALL_AT,
      aLight,
      aHeavy,
      alike,
      aWant,
      aZero,
      aUnmodified: -aLight,
      lightLight,
      lightHeavy,
      chargedTotalLight: aLight + lightLight,
      chargedTotalHeavy: aHeavy + lightHeavy,
      pairRuns: s.tally.runs,
      pairGauss: s.tally.gauss,
      pairDrift: s.tally.drift,
      pairWraps: s.tally.wraps,
      packetSpeed: s.packetSpeed,
      lightSpeed: c,
      speedRatio,
      packetEnergyStart: s.packetEnergy.samples[0]!.invariant,
      packetEnergyEnd: last(s.packetEnergy).invariant,
      packetWraps: wrapsOf(s.packet.wraps),
      longBeats: FALL_LONG,
      lumpDrift: drift(s.lump),
      lumpLeastTransverse: leastTransverse(s.lump),
      lumpTransverseStart: s.lump.samples[0]!.transverse,
      lumpTransverseEnd: last(s.lump).transverse,
      lumpTransverseGrowth: lumpGrowth,
      lumpInvariantGrowth: invariantGrowth(s.lump),
      lumpWraps: wrapsOf(s.lump.wraps),
      deepDepth: DEEP,
      deepTransverseStart: s.lumpDeep.samples[0]!.transverse,
      deepTransverseEnd: last(s.lumpDeep).transverse,
      deepTransverseGrowth: growth(s.lumpDeep),
      deepWraps: wrapsOf(s.lumpDeep.wraps),
      zeroEnergy,
      seconds: s.seconds,
    }

    HOP_D.forEach((d, i) => {
      metrics[`hopLongitudinalChange_d${d}`] =
        s.hop.longitudinalChange[i]!
      metrics[`hopRuleArrival_d${d}`] = s.hop.ruleArrival[i]!
    })

    return verdict({
      status,
      claim: `with the even field's static energy counted negative (D ${EVEN_DEPTH}): a light lump (1 love) and a heavy lump (3 fear) at r = ${FALL_AT} from a neutral source of content ${LUMP_CONTENT} accelerate ${aLight < 0 && aHeavy < 0 ? 'toward it' : 'NOT both toward it'} at ${f(aLight)} and ${f(aHeavy)} per unit content (alike to ${alike.toExponential(1)}; the closed form ${f(aWant)}), with inertia taken as content (a stand-in), while the light pulls the same lumps from a charged source at ${f(lightLight)} and ${f(lightHeavy)}; the packet carries H' = I = ${f(s.packetEnergy.samples[0]!.invariant)} with U_L = 0 and moves at ${f(speedRatio)} c; on ${FALL_LONG} beats of a standing lump U_L moves by ${drift(s.lump).toExponential(1)} and U_T stays positive but grows ${f(lumpGrowth)} fold (${f(s.lump.samples[0]!.transverse)} to ${f(last(s.lump).transverse)}, ${wrapsOf(s.lump.wraps)} wraps), the unmodified beat's own heating (${f(growth(s.lumpDeep))} fold at D ${DEEP}); when the source hops, E_L changes at once at d = ${HOP_D.join(', ')} (${s.hop.longitudinalChange.map(x => x.toExponential(2)).join(', ')}) while the rule's flux first changes there at beats ${s.hop.ruleArrival.join(', ')}: the proposal's pull acts at a distance at once`,
      metrics,
      control: {
        aUnmodified: -aLight,
        lightOppositeSigns:
          Math.sign(lightLight) !== Math.sign(lightHeavy) ? 1 : 0,
        zeroEnergy,
      },
      notes: `L2, inertia a stand-in (content). Gates F1 ${g1}, F2 ${g2}, F3 ${g3}, instrument ${instrument}. Pair energies W_L at r = ${FALL_R.join(', ')}: ${FALL_CASES.map(k => `${k.name} ${s.pairs[k.name]!.map(x => x.toExponential(6)).join(' ')}`).join('; ')}. Lump U_T by sample: ${s.lump.samples.map(x => x.transverse.toFixed(1)).join(' ')}. Deep lump U_T: ${s.lumpDeep.samples.map(x => x.transverse.toFixed(2)).join(' ')}. Wraps: packet ${JSON.stringify(s.packet.wraps)}, lump ${JSON.stringify(s.lump.wraps)}, deep ${JSON.stringify(s.lumpDeep.wraps)}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
