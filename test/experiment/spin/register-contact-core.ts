// WHY THE LIGHT REGISTER PAIR IS TOO HEAVY: ITS CONTACT WELL (E-SPN-0206, OPEN-MOT-01). On the candidate rule a lone
// hole obeys special relativity with inertia over energy R = tan m / m, but every bound register pair read so far is
// heavier: R 34.65 (E-SPN-0162), 8.5 to 16 (E-SPN-0173), and on one tracked level under the light's weak pull (E-SPN-
// 0200) R_static 2.719, 1.528, 2.188 and 1.254 at a_B 6, 8, 10 and 12 against static formulas of 1.178, 1.120, 1.096
// and 1.086. E-SPN-0176 placed the excess at the core (falling as about a_B^-4.8) and E-RLT-0111 showed it is not a
// stress. This file names the core and tests it.
//
// THE "MATTER AS MACHINE" READING. A particle's inertia is the number of states that must be updated for the whole to
// move. A bound pair moves when a member steps; where one step costs far more phase than a member's band holds, the
// step is off resonance, and the pair moves only at second order (the member steps out and back while its partner
// follows): hopping squared over the well, the strong-coupling lattice pair. E-SPN-0207 found exactly this in the
// flux-string clock: its lower level is a contact knot (0.92 of it on one dock under the meeting), three times heavier
// per unit energy than the string-held level above, which is why that moving clock ticks faster.
//
// THE CORE, READ BEFORE ANY RUN (tmp/spn-core-probe.log, code/measure/contact-core coreProfile). The pull is the
// count n(y) = floor(alpha G(y) / theta), G the husk light's lattice Green function. G is finite at contact and FAR
// deeper there than its 1/|y| tail: n(0) / n(first shell) = 242 / 57, 181 / 43, 121 / 28 at a_B 6, 8, 12 (4.2 to 4.3).
// In cycle phase the contact well is 1.459, 1.091, 0.729 against the first shell's 0.344, 0.259, 0.169: a step of
// 1.115, 0.832, 0.561 a cycle from contact to the first shell, 2.7, 2.0 and 1.4 times the 0.41 that separates the
// pair's level from the D F channel (E-SPN-0173), the member's room to step. Every other shell-to-shell step is 0.08 or
// less (first to second shell 0.078 at a_B 6). So the pull is a smooth 1/|y| with one deep on-site well added, a Hubbard U on the 1/r, and the K = 0 lines
// of E-SPN-0200 show its family: lines bound 2 to 8.7 times hydrogen's binding, and the tracked level itself at 2.21,
// 1.93, 1.73, 1.64 times hydrogen's (a_B 6, 8, 10, 12).
//
// THE HYPOTHESIS. The excess inertia is the contact well's: the level's share on the contact dock moves at second order.
//
// THE TEST: the same tracked scan (spin/register-coulomb-track's readZero and readMotion, the same reference, window,
// tracking rule, K reads and R), at a_B 6 (its clearest motion point after a_B 8: overlap 0.268 against the next 0.125),
// on three counts:
//   rule     the rule's own count (the witness: it must give E-SPN-0200's recorded tracked line exactly)
//   soften   n(0) set to the first shell's n (57): the contact well removed, every other dock's pull unchanged
//   cap2     n capped at its value at |y| = 2 (30): the pull flat inside radius 2, a softer core still
// Each is a DIAGNOSTIC count, not a rule piece: an integer count of the same unit, run by the same exact engine.
//
// PREDICTED (written before any softened read; the softened and capped runs started together with the witness):
//   P1 soften: the excess R_static / R_formula - 1 falls from the rule's 1.309 to below 0.3
//   P2 cap2: the excess below 0.15
//   P3 soften: the tracked level's binding falls toward hydrogen's, scaled E_b 2 mu a_B^2 (2M - E) between 0.8 and 1.5
//   KILL: the soften excess above 0.65 (half the rule's): the contact well is not the main cause
// GATES. W the witness: the rule read's tracked line equal to E-SPN-0200's recorded 1.6406597988563882 within 1e-12 and
//   its overlap within 1e-9 of 0.2676752332958895. P1, P2, P3 as above. INSTRUMENT (not hard): under each transform the
//   tracked line is unambiguous (overlap at least 0.2 and twice the next line's) and its K read is quadratic (d(K) /
//   d(K / 2) within 0.1 of 4).
//   READ, gating nothing: every other followed line's R (the "wrong level" question: is any line, or any mixture of the
//   lines the reference holds, light?), R_full with the Darwin exchange against tan m / m, and the register clock, the
//   K^2 coefficient of the beat between the tracked line and the next followed line against relativity's c*^2 /
//   (2 E1 E2) (whether the pair's internal and external motion add in quadrature).
// Verdict: fail if W or P1 fails; partial if P2, P3 or the instrument fails; pass if all hold.
//
// FIRST RUN (2026-10-19, tmp/spn-core-<form>-a<aB>.log and .json, the parts run one per process by tmp/spn-core-part.ts
// on the native kernel at 4 to 6 threads, the verdict by this file's combineCore in tmp/spn-0206-combine.ts, logged in
// tmp/spn-0206-verdict.log): FAIL on P1, as the pre-registered kill reads it. No gate moved and none was rerun.
//  - W holds: the rule's tracked line 1.6406597988563882, overlap 0.2676752332958895, both E-SPN-0200's to the bit.
//  - P1 FAILS at a_B 6: with n(0) set to 57 the excess is 1.843 (R 3.310 against 1.164, at K 0.02 after the K 0.04
//    continuation failed), above the rule's 1.309. But the instrument fails there too: the softened level is a near
//    triplet (1.648551, 1.648894, 1.650958, overlaps 0.215, 0.197, 0.209, each R 3.2 to 3.6), so no line is the level.
//    With the contact well gone the first shell (n 57, a 1/|y| value) is the core at a_B 6, and the levels it holds
//    still bind 1.95 times hydrogen's (P3 fails).
//  - P2 FAILS narrowly: the core flat inside radius 2 gives excess 0.226 (R 1.402 against 1.144), 0.17 of the rule's,
//    on a clean level (overlap 0.682, next 0.103, ratio 3.92), binding 1.56 times hydrogen's.
//  - READS ADDED AFTER THE GATED PARTS (not gates): flat inside radius 3, excess 0.745 on an ambiguous pair (0.484
//    against 0.379, R 1.98 and 2.41); and at a_B 8, where the softened level is clean (0.638 against 0.246), removing the
//    contact well alone takes the excess from 0.365 to 0.140 (R 1.2735 against 1.1168, R_full 1.224 against tan m / m
//    1.066), 0.38 of the rule's. There the next followed line (1.702698, the 2s-like level, overlap 0.256) has the SAME
//    R, 1.274, and the clock between them dilates at alpha 0.0692 against relativity's 0.0876 (0.79 times, the right
//    sign), where on the rule's count every other line at a_B 8 read R 8 to 15.
//  - "Wrong level" (read): no followed line is light, and every mixture of lines the reference holds is heavier than
//    the tracked line at a_B 6 (the rule's other lines R 5.1 to 8.6, E-SPN-0200's own followed lines).
//  - Quadrature (read): the rule's clock at a_B 6 (E-SPN-0200's tracked line and its line at 1.650899, R 2.72 and 5.12) is 27.9 times
//    relativity's, the softened a_B 6 clock 14.3 times,
//    cap3 1.58 times, the softened a_B 8 clock 0.79 times. The beat changes as K^2 on every lattice band (each band is
//    even in K), so a first-order "linear sum" of internal and external speeds cannot appear; what fails is the size,
//    and it is set by how unequal the two levels' excess inertia is.
//  - A boost-partner read (code/measure/boost-partner, tmp/spn-partner-*.log; x times the reference on the C4v sector
//    at K = 0): its weight sits 0.83 to 0.86 on one line, the 2p-like level at 1.6953 to 1.6954, for the rule, the
//    softened and the capped count alike. So the T1u partner is hydrogenic and far (0.035 to 0.055 away); the excess is
//    not a near T1u partner.
// MEANING. The excess inertia lives where the pull changes by more per link than a member's room to step: the contact
// well first (n(0) 4.2 times the first shell's), then at a_B 6 the first shells of the 1/|y| itself. A level held there
// is a knot that moves only at second order, and such levels come as near multiplets. Where the softened level is clean
// (a_B 8) removing the well leaves an excess of 0.14 and two levels of one inertia, whose clock dilates near
// relativity's rate. The excess left (R_full 1.224 against 1.066 at a_B 8) is what a_B 12 on the rule's own count still
// shows (1.235), so the next read is the softened count at a_B 12, and the question for the rule is whether the light's
// lattice Green function at contact is the rule's or a regulator the husk should not have.
//
// Depth L2 (a two-body quantum walk of register members on the husk quotient, exact in its moving block; the softened
// counts are controls, not the rule). DETERMINISM: no random numbers; the native kernel, byte for byte the JavaScript.


import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import {
  capCore,
  softenContact,
  type CountTransform,
} from '@/code/measure/contact-core'
import {
  readMotion,
  readZero,
  setup,
  TRACK_PLAN,
  type Follow,
  type MotionRead,
  type Setup,
  type ZeroRead,
} from '@/code/measure/register-track'

const C_STAR2 = 0.5
const RECORDED_E = 1.6406597988563882
const RECORDED_OVERLAP = 0.2676752332958895
// E-SPN-0200's recorded a_B 6 and 8 excess (tmp/track-a6.json, tmp/track-a8.json), the rule's side of each comparison
const RECORDED_EXCESS: Record<number, number> = {
  6: 1.3087281235858952,
  8: 0.36501078308290724,
}
const WITNESS_E = 1e-12
const WITNESS_OVERLAP = 1e-9
const SOFT_EXCESS = 0.3
const KILL_EXCESS = 0.65
const CAP_EXCESS = 0.15
const SCALED = [0.8, 1.5] as const
const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1

export type Form = 'rule' | 'soften' | 'cap2' | 'cap3'

export const FORMS: Record<Exclude<Form, 'rule'>, CountTransform> = {
  soften: softenContact,
  cap2: capCore(2),
  cap3: capCore(3),
}

// the gated parts, then the reads added after the gated run (cap3 at a_B 6, soften at a_B 8; see FIRST RUN)
export const PLAN: readonly { form: Form; aB: number }[] = [
  { form: 'rule', aB: 6 },
  { form: 'soften', aB: 6 },
  { form: 'cap2', aB: 6 },
  { form: 'cap3', aB: 6 },
  { form: 'soften', aB: 8 },
]

export type CorePart = {
  form: Form
  aB: number
  zero: ZeroRead
  motion: MotionRead | null
}

export function corePart(
  su: Setup,
  form: Form,
  aB: number,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): CorePart {
  const p = TRACK_PLAN.find(x => x.aB === aB)!
  const t = form === 'rule' ? undefined : FORMS[form]
  const zero = readZero(su, p, opts, log, 1, t)
  const motion = form === 'rule' ? null : readMotion(su, p, zero, opts, log, t)

  return { form, aB, zero, motion }
}

// the beat between two followed lines: Delta E(K) / Delta E(0) = 1 - alpha K^2, each line's K^2 coefficient a
const clock = (
  lo: Follow,
  hi: Follow,
): { alpha: number; alphaSR: number } => {
  const [a, b] = lo.E < hi.E ? [lo, hi] : [hi, lo]

  return {
    alpha: (a.a - b.a) / (b.E - a.E),
    alphaSR: C_STAR2 / (2 * a.E * b.E),
  }
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function combineCore(su: Setup, parts: CorePart[]): Verdict {
  const of = (f: Form, aB: number): CorePart =>
    parts.find(p => p.form === f && p.aB === aB)!
  const rule = of('rule', 6).zero
  const W =
    Math.abs(rule.tracked.E - RECORDED_E) <= WITNESS_E &&
    Math.abs(rule.tracked.overlap - RECORDED_OVERLAP) <= WITNESS_OVERLAP
  const soft = of('soften', 6)
  const cap = of('cap2', 6)
  const excess = (p: CorePart): number => p.motion?.tracked?.excess ?? NaN
  const P1 = excess(soft) < SOFT_EXCESS
  const killed = !(excess(soft) <= KILL_EXCESS)
  const P2 = excess(cap) < CAP_EXCESS
  const P3 =
    soft.zero.tracked.scaled >= SCALED[0] &&
    soft.zero.tracked.scaled <= SCALED[1]
  const clean = (p: CorePart): boolean =>
    p.zero.tracked.overlap >= IDENTITY &&
    p.zero.tracked.overlap >= AMBIGUOUS * p.zero.next &&
    p.motion?.tracked != null &&
    Math.abs(p.motion.tracked.ratio - 4) <= QUADRATIC
  const instrument = clean(soft) && clean(cap)
  const status =
    !W || !P1 ? 'fail' : !P2 || !P3 || !instrument ? 'partial' : 'pass'
  const metrics: Record<string, number> = {
    W: flag(W),
    P1: flag(P1),
    P2: flag(P2),
    P3: flag(P3),
    killed: flag(killed),
    instrument: flag(instrument),
    ruleE: rule.tracked.E,
    ruleOverlap: rule.tracked.overlap,
    ruleScaled: rule.tracked.scaled,
  }
  const describe = (p: CorePart): string => {
    const z = p.zero
    const m = p.motion
    const t = m?.tracked
    const tag = `${p.form}_a${p.aB}`
    const others = (m?.others ?? []).filter((f): f is Follow => f !== null)
    const next = others
      .filter(f => Math.abs(f.ratio - 4) <= QUADRATIC)
      .sort((x, y) => y.overlap - x.overlap)[0]
    const ck = t && next ? clock(t, next) : null

    metrics[`${tag}_E`] = z.tracked.E
    metrics[`${tag}_scaled`] = z.tracked.scaled
    metrics[`${tag}_overlap`] = z.tracked.overlap
    metrics[`${tag}_next`] = z.next
    metrics[`${tag}_countTop`] = z.countTop
    metrics[`${tag}_clean`] = flag(p.form === 'rule' || clean(p))

    if (t) {
      metrics[`${tag}_R`] = t.R
      metrics[`${tag}_Rformula`] = t.Rformula
      metrics[`${tag}_excess`] = t.excess
      metrics[`${tag}_excessOverRule`] = t.excess / RECORDED_EXCESS[p.aB]!
      metrics[`${tag}_ratio`] = t.ratio
      metrics[`${tag}_Rfull`] = m!.Rfull
    }

    if (ck) {
      metrics[`${tag}_clockAlpha`] = ck.alpha
      metrics[`${tag}_clockAlphaSR`] = ck.alphaSR
    }

    const lines = z.lines
      .filter(l => l.overlap >= 0.01)
      .map(
        l =>
          `${l.E.toFixed(6)} (${l.scaled.toFixed(3)}, ${l.overlap.toFixed(3)})`,
      )
      .join(' ')

    return `${p.form} at a_B ${p.aB}: count top ${z.countTop}, tracked ${z.tracked.E.toFixed(10)} (scaled E_b ${z.tracked.scaled.toFixed(4)}, overlap ${z.tracked.overlap.toFixed(4)}, next ${z.next.toFixed(4)}); lines of overlap 0.01 or more ${lines}${t ? `; R ${t.R.toFixed(4)} against the formula ${t.Rformula.toFixed(4)} (excess ${t.excess.toFixed(4)}, ${(t.excess / RECORDED_EXCESS[p.aB]!).toFixed(3)} of the rule's, K ${m!.kappa}, ratio ${t.ratio.toFixed(3)}), R_full ${m!.Rfull.toFixed(4)} against tan m / m ${su.tanOver.toFixed(4)}; other lines ${others.map(f => `E ${f.E.toFixed(6)} overlap ${f.overlap.toFixed(3)} R ${f.R.toFixed(3)} (ratio ${f.ratio.toFixed(2)})`).join(', ')}` : ''}${ck ? `; clock with ${next!.E.toFixed(6)}: alpha ${ck.alpha.toExponential(3)} against ${ck.alphaSR.toExponential(3)} (${(ck.alpha / ck.alphaSR).toFixed(2)} times)` : ''}`
  }
  const text = parts.map(describe).join('. ')
  const soft8 = parts.find(p => p.form === 'soften' && p.aB === 8)
  const cap3 = parts.find(p => p.form === 'cap3' && p.aB === 6)

  return verdict({
    status,
    claim: `at a_B 6 removing the register pair's contact well (n(0) ${rule.countTop} set to the first shell's) does not lower its excess inertia: ${excess(soft).toFixed(3)} against the rule's 1.309, on a level that is no longer isolated (overlap ${soft.zero.tracked.overlap.toFixed(3)} against the next ${soft.zero.next.toFixed(3)}), with its binding ${soft.zero.tracked.scaled.toFixed(2)} times hydrogen's (the rule's ${rule.tracked.scaled.toFixed(2)}); capping the whole core inside radius 2 takes the excess to ${excess(cap).toFixed(3)} on a clean level (R ${(cap.motion?.tracked?.R ?? NaN).toFixed(3)} against ${(cap.motion?.tracked?.Rformula ?? NaN).toFixed(3)})${cap3 ? `, and inside radius 3 to ${excess(cap3).toFixed(3)} on an ambiguous one` : ''}${soft8 ? `; at a_B 8, where the softened level is clean, removing the contact well takes the excess from 0.365 to ${excess(soft8).toFixed(3)}` : ''}. W ${W}, P1 ${P1}, P2 ${P2}, P3 ${P3}${killed ? '; the pre-registered kill holds at a_B 6' : ''}`,
    metrics,
    control: { rule_E: rule.tracked.E, rule_scaled: rule.tracked.scaled },
    notes: `L2. ${text}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 12 }

export default experiment({
  id: 'spin/register-contact-core',
  code: 'E-SPN-0206',
  title:
    "explores whether the light register pair's excess inertia is its contact well, the lattice light's on-site pull four times its first shell's: fail at a_B 6 as pre-registered (the well alone is not it there), but a core flattened inside radius 2 cuts the excess 5.8 times and the well removed at a_B 8 cuts it 2.6 times",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const su = setup()

    return combineCore(
      su,
      PLAN.map(p => corePart(su, p.form, p.aB, NATIVE)),
    )
  },
})
