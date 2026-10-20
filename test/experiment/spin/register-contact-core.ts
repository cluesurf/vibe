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
// FIRST RUN (below, after the run).
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
  TRACK_PLAN,
  type Follow,
  type MotionRead,
  type ZeroRead,
} from '@/test/experiment/spin/register-coulomb-track'
import { setup, type Setup } from '@/test/experiment/spin/register-coulomb-weak'

const C_STAR2 = 0.5
const RECORDED_E = 1.6406597988563882
const RECORDED_OVERLAP = 0.2676752332958895
const WITNESS_E = 1e-12
const WITNESS_OVERLAP = 1e-9
const SOFT_EXCESS = 0.3
const KILL_EXCESS = 0.65
const CAP_EXCESS = 0.15
const SCALED = [0.8, 1.5] as const
const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1
const A_B = 6

export const FORMS: Record<'soften' | 'cap2', CountTransform> = {
  soften: softenContact,
  cap2: capCore(2),
}

export type CorePart = {
  form: 'rule' | 'soften' | 'cap2'
  zero: ZeroRead
  motion: MotionRead | null
}

export function corePart(
  su: Setup,
  form: CorePart['form'],
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): CorePart {
  const p = TRACK_PLAN.find(x => x.aB === A_B)!
  const t = form === 'rule' ? undefined : FORMS[form]
  const zero = readZero(su, p, opts, log, 1, t)
  const motion = form === 'rule' ? null : readMotion(su, p, zero, opts, log, t)

  return { form, zero, motion }
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
  const of = (f: CorePart['form']): CorePart => parts.find(p => p.form === f)!
  const rule = of('rule').zero
  const W =
    Math.abs(rule.tracked.E - RECORDED_E) <= WITNESS_E &&
    Math.abs(rule.tracked.overlap - RECORDED_OVERLAP) <= WITNESS_OVERLAP
  const soft = of('soften')
  const cap = of('cap2')
  const excess = (p: CorePart): number => p.motion?.tracked?.excess ?? NaN
  const P1 = excess(soft) < SOFT_EXCESS
  const killed = !(excess(soft) <= KILL_EXCESS)
  const P2 = excess(cap) < CAP_EXCESS
  const P3 =
    soft.zero.tracked.scaled >= SCALED[0] &&
    soft.zero.tracked.scaled <= SCALED[1]
  const instrumentOf = (p: CorePart): boolean =>
    p.zero.tracked.overlap >= IDENTITY &&
    p.zero.tracked.overlap >= AMBIGUOUS * p.zero.next &&
    p.motion?.tracked != null &&
    Math.abs(p.motion.tracked.ratio - 4) <= QUADRATIC
  const instrument = instrumentOf(soft) && instrumentOf(cap)
  const status = !W || !P1 ? 'fail' : !P2 || !P3 || !instrument ? 'partial' : 'pass'
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
    const others = (m?.others ?? []).filter((f): f is Follow => f !== null)
    const next = others
      .filter(f => Math.abs(f.ratio - 4) <= QUADRATIC)
      .sort((x, y) => y.overlap - x.overlap)[0]
    const ck = t && next ? clock(t, next) : null

    metrics[`${p.form}_E`] = z.tracked.E
    metrics[`${p.form}_scaled`] = z.tracked.scaled
    metrics[`${p.form}_overlap`] = z.tracked.overlap
    metrics[`${p.form}_next`] = z.next
    metrics[`${p.form}_countTop`] = z.countTop

    if (t) {
      metrics[`${p.form}_R`] = t.R
      metrics[`${p.form}_Rformula`] = t.Rformula
      metrics[`${p.form}_excess`] = t.excess
      metrics[`${p.form}_ratio`] = t.ratio
      metrics[`${p.form}_Rfull`] = m!.Rfull
    }

    if (ck) {
      metrics[`${p.form}_clockAlpha`] = ck.alpha
      metrics[`${p.form}_clockAlphaSR`] = ck.alphaSR
    }

    const lines = z.lines
      .filter(l => l.overlap >= 0.01)
      .map(l => `${l.E.toFixed(6)} (${l.scaled.toFixed(3)}, ${l.overlap.toFixed(3)})`)
      .join(' ')

    return `${p.form}: count top ${z.countTop}, tracked ${z.tracked.E.toFixed(10)} (scaled E_b ${z.tracked.scaled.toFixed(4)}, overlap ${z.tracked.overlap.toFixed(4)}, next ${z.next.toFixed(4)}); lines of overlap 0.01 or more ${lines}${t ? `; R ${t.R.toFixed(4)} against the formula ${t.Rformula.toFixed(4)} (excess ${t.excess.toFixed(4)}, ratio ${t.ratio.toFixed(3)}), R_full ${m!.Rfull.toFixed(4)} against tan m / m ${su.tanOver.toFixed(4)}; other lines ${others.map(f => `E ${f.E.toFixed(6)} overlap ${f.overlap.toFixed(3)} R ${f.R.toFixed(3)} (ratio ${f.ratio.toFixed(2)})`).join(', ')}` : ''}${ck ? `; clock with ${next!.E.toFixed(6)}: alpha ${ck.alpha.toExponential(3)} against ${ck.alphaSR.toExponential(3)} (${(ck.alpha / ck.alphaSR).toFixed(2)} times)` : ''}`
  }
  const text = parts.map(describe).join('. ')

  return verdict({
    status,
    claim: `at a_B ${A_B}, removing the register pair's contact well (n(0) ${rule.countTop} to the first shell's) takes the tracked level's excess inertia from 1.309 to ${excess(soft).toFixed(3)} (R ${(soft.motion?.tracked?.R ?? NaN).toFixed(3)} against ${(soft.motion?.tracked?.Rformula ?? NaN).toFixed(3)}) and its binding from ${rule.tracked.scaled.toFixed(2)} to ${soft.zero.tracked.scaled.toFixed(2)} times hydrogen's; capping the pull inside radius 2 gives excess ${excess(cap).toFixed(3)}; W ${W}, P1 ${P1}, P2 ${P2}, P3 ${P3}${killed ? ', and the kill holds: the contact well is not the main cause' : ''}`,
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
    "explores whether the light register pair's excess inertia is its contact well, the lattice light's on-site pull four times its first shell's: the tracked scan at a_B 6 with the well removed and with the core capped",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const su = setup()

    return combineCore(su, [
      corePart(su, 'rule', NATIVE),
      corePart(su, 'soften', NATIVE),
      corePart(su, 'cap2', NATIVE),
    ])
  },
})
