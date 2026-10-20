// THE LIGHT REGISTER PAIR AT a_B 12 WITH THE CONTACT WELL REMOVED (E-SPN-0208, OPEN-MOT-01). E-SPN-0206 traced the
// pair's excess inertia to where the pull is steep across one link: the light's lattice Green function at contact,
// n(0) 4.3 times the first shell's. Removing that one well (n(0) set to the first shell's n, every other dock's pull
// unchanged) took the excess at a_B 8 from 0.365 to 0.140 (R_full 1.476 to 1.224 against tan m / m 1.0656) on a clean
// level, and gave the 2s-like level the same R, with the pair's clock dilating at 0.79 of relativity's rate. On the
// rule's own count the tracked level at a_B 12 reads R 1.2544 (formula 1.0857, excess 0.155), R_full 1.2347, overlap
// 0.597 against the next 0.253 (E-SPN-0200). This file asks, at the weakest pull the engine has run: with the contact
// well removed, does the bound level's inertia reach the lone member's tan m / m, and does its clock dilate as
// relativity says? The trend a_B 6, 8, 12 then says whether the on-site Green value is a part of the binding the rule
// needs, or a lattice regulator that makes bound matter heavy.
//
// THE RUN: the tracked scan's own identity and motion reads (code/measure/register-track readZero and readMotion: the
// hydrogenic reference, the window, the largest-overlap tracking rule, K 0.04 and 0.02 on the axis, retried at 0.02
// and 0.01 where the first pair is not quadratic), at a_B 12 (ball 54, N 8192), on the count with n(0) softened
// (code/measure/contact-core softenContact: 121 to 28). One process on the native kernel, 12 threads (about 6 hours).
//
// GATES, fixed in this header before the run (2026-10-19), never moved after it:
//   I1 A CLEAN SINGLE LINE: the tracked line genuine, its overlap with the reference at least 0.2 and at least twice
//      the next genuine line's
//   I2 QUADRATIC: the continuation exists at K and K / 2 and d(K) / d(K / 2) is within 0.1 of 4
//   R  INERTIA EQUALS ENERGY: R_full (the tracked R_static with E-SPN-0169's Darwin exchange) within 0.05 of
//      tan m / m (1.0656): |R_full - 1.0656| <= 0.05
//   RP the partial band: R_full - tan m / m below half the rule's own at a_B 12 (1.2347 - 1.0656 = 0.169, so below 0.0846)
//   C  THE CLOCK: the beat between the tracked line and the clean followed line of largest overlap (overlap at least
//      0.02, its own ratio within 0.1 of 4) has alpha (Delta E(K) / Delta E(0) = 1 - alpha K^2) POSITIVE and alpha /
//      alpha_SR between 0.75 and 1.25, alpha_SR = c*^2 / (2 E1 E2), c*^2 = 1/2 a cycle
// Verdict: pass if I1, I2, R and C hold; partial if I1 and I2 hold and RP holds (R or C failing); fail otherwise (an
// unclean or non-quadratic level cannot be read, and an excess at least half the rule's means the well is not what is
// left).
// PREDICTED (before the run, from the a_B 8 pair 1.476 to 1.224 and the rule's a_B 12 1.235): R_full about 1.15, inside
// RP and outside R, so PARTIAL; the clock within C. A pass would say that, past the on-site well, the bound pair's
// inertia equals its energy to 5% at a_B 12.
//
// FIRST RUN (2026-10-19 to 20, tmp/spn-core-soften-a12.log and .json, tmp/spn-core-part.ts on the native kernel at 12
// threads, 4.6 hours; the verdict by this file's combineWeak in tmp/spn-0208-combine.ts, tmp/spn-0208-verdict.log):
// FAIL, against the predicted partial. No gate moved and none was rerun.
//  - I1 holds: the tracked line 1.6959015 (scaled E_b 1.601, the rule's 1.638), overlap 0.653 against the next 0.271.
//    Its N / 2 read differs by 1.8e-6 in phase, so the motion ran at 8192 lags, as the rule's a_B 12 read did.
//  - I2 holds: ratio 3.987 at K 0.04.
//  - R and RP FAIL: R_static 1.1922 against the formula 1.0853 (excess 0.0985, the rule's 0.155), R_full 1.1730 against
//    tan m / m 1.0656. The gap 0.107 is 0.64 of the rule's 0.169, above RP's half.
//  - C FAILS: the clean followed line of largest overlap is 1.707791 (overlap 0.271, R 1.130, ratio 3.99), bound by only
//    0.043 of hydrogen's binding, a line at the continuum's edge and not a 2s level. It is LIGHTER than the tracked
//    level, so the beat between them rises with K: alpha -0.493 against relativity's +0.0863 (-5.7 times). The two
//    inertias differ by 5%, but the gap between the lines is 0.012, which magnifies it.
// THE TREND (a_B 6, 8, 12; post-hoc arithmetic on the recorded reads): the rule's excess 1.309, 0.365, 0.155; with the
// contact well removed n/a (a_B 6 not a single line), 0.140, 0.0985, so the well carries 0.62 of the excess at a_B 8
// and 0.36 at a_B 12, a share that falls as the level leaves the core. What is left falls slowly: R_full - tan m / m
// 0.158 to 0.107 from a_B 8 to 12, about a_B^-0.96, where the well's own part (0.225 to 0.0565) fell as about a_B^-3.4. So the on-site
// Green value behaves as a lattice regulator (its effect vanishes as the binding loosens), and it is not what keeps R
// above tan m / m at a_B 12: a remainder falling as 1/a_B (first order in the coupling at fixed member mass) does.
//
// Depth L2 (a two-body quantum walk of register members on the husk quotient, exact in its moving block; the softened
// count is a control, not the rule). DETERMINISM: no random numbers; the native kernel, byte for byte the JavaScript.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { softenContact } from '@/code/measure/contact-core'
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
const A_B = 12
const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1
const R_BAND = 0.05
// E-SPN-0200's a_B 12 R_full (tmp/track-a12.json), the rule's side
const RULE_RFULL = 1.2347344914386658
const CLOCK_LINE = 0.02
const CLOCK_BAND = [0.75, 1.25] as const

export type WeakPart = { zero: ZeroRead; motion: MotionRead }

export function weakPart(
  su: Setup,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): WeakPart {
  const p = TRACK_PLAN.find(x => x.aB === A_B)!
  const zero = readZero(su, p, opts, log, 1, softenContact)

  return { zero, motion: readMotion(su, p, zero, opts, log, softenContact) }
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function combineWeak(su: Setup, part: WeakPart): Verdict {
  const { zero: z, motion: m } = part
  const t = m.tracked
  const I1 =
    Math.abs(z.tracked.modulus - 1) <= 1e-6 &&
    z.tracked.overlap >= IDENTITY &&
    z.tracked.overlap >= AMBIGUOUS * z.next
  const I2 = t !== null && Math.abs(t.ratio - 4) <= QUADRATIC
  const gap = m.Rfull - su.tanOver
  const R = Math.abs(gap) <= R_BAND
  const RP = gap < (RULE_RFULL - su.tanOver) / 2
  const partner = m.others
    .filter(
      (f): f is Follow =>
        f !== null &&
        f.overlap >= CLOCK_LINE &&
        Math.abs(f.ratio - 4) <= QUADRATIC,
    )
    .sort((x, y) => y.overlap - x.overlap)[0]
  const [lo, hi] =
    t && partner ? (t.E < partner.E ? [t, partner] : [partner, t]) : [null, null]
  const alpha = lo && hi ? (lo.a - hi.a) / (hi.E - lo.E) : NaN
  const alphaSR = lo && hi ? C_STAR2 / (2 * lo.E * hi.E) : NaN
  const C =
    alpha > 0 &&
    alpha / alphaSR >= CLOCK_BAND[0] &&
    alpha / alphaSR <= CLOCK_BAND[1]
  const status =
    I1 && I2 && R && C ? 'pass' : I1 && I2 && RP ? 'partial' : 'fail'

  return verdict({
    status,
    claim: `at a_B 12 with the contact well removed (n(0) ${z.countTop === 28 ? '121 to 28' : `to ${z.countTop}`}), the tracked level (overlap ${z.tracked.overlap.toFixed(3)}, next ${z.next.toFixed(3)}, scaled E_b ${z.tracked.scaled.toFixed(3)}) reads R ${t ? t.R.toFixed(4) : 'none'} against the formula ${t ? t.Rformula.toFixed(4) : 'none'} and R_full ${m.Rfull.toFixed(4)} against tan m / m ${su.tanOver.toFixed(4)} (the rule's ${RULE_RFULL.toFixed(4)}); its clock with the line at ${partner ? partner.E.toFixed(6) : 'none'} reads alpha ${alpha.toExponential(3)} against relativity's ${alphaSR.toExponential(3)} (${(alpha / alphaSR).toFixed(2)} times). I1 ${I1}, I2 ${I2}, R ${R}, RP ${RP}, C ${C}`,
    metrics: {
      I1: flag(I1),
      I2: flag(I2),
      R: flag(R),
      RP: flag(RP),
      C: flag(C),
      E: z.tracked.E,
      overlap: z.tracked.overlap,
      next: z.next,
      scaled: z.tracked.scaled,
      Rstatic: t?.R ?? NaN,
      Rformula: t?.Rformula ?? NaN,
      excess: t?.excess ?? NaN,
      ratio: t?.ratio ?? NaN,
      kappa: m.kappa,
      Rfull: m.Rfull,
      tanOver: su.tanOver,
      clockAlpha: alpha,
      clockAlphaSR: alphaSR,
      partnerE: partner?.E ?? NaN,
      partnerR: partner?.R ?? NaN,
      partnerOverlap: partner?.overlap ?? NaN,
    },
    control: { ruleRfull: RULE_RFULL },
    notes: `L2. Lines of overlap 0.01 or more at K = 0: ${z.lines
      .filter(l => l.overlap >= 0.01)
      .map(l => `${l.E.toFixed(6)} (${l.scaled.toFixed(3)}, ${l.overlap.toFixed(3)})`)
      .join(' ')}. Followed lines: ${m.others
      .map(f => (f ? `E ${f.E.toFixed(6)} overlap ${f.overlap.toFixed(3)} R ${f.R.toFixed(3)} ratio ${f.ratio.toFixed(2)}` : 'none'))
      .join('; ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 12 }

export default experiment({
  id: 'spin/register-contact-weak',
  code: 'E-SPN-0208',
  title:
    "explores whether the light register pair at a_B 12, with the light's contact well removed, has inertia equal to its energy (R_full within 0.05 of tan m / m) and a clock that dilates as relativity says: fail, R_full 1.173 against 1.066, the well now only 0.36 of the excess",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const su = setup()

    return combineWeak(su, weakPart(su, NATIVE))
  },
})
