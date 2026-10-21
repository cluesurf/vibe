// A MOVING CLOCK OF TWO BOUND LEVELS OF THE REGISTER PAIR (E-SPN-0213, OPEN-MOT-01). A clock is two levels of one bound
// state beating against each other: its rate is Delta E(K) = E_2(K) - E_1(K). Relativity with one speed says
// Delta E(K) / Delta E(0) = 1 - alpha K^2 with alpha = c*^2 / (2 E_1 E_2), c*^2 = 1/2 a cycle, positive: the moving
// clock ticks slower. E-SPN-0208's clock at a_B 12 used a line at the continuum's edge (bound by 0.04 of hydrogen's
// binding) and read the wrong sign. E-SPN-0206 read, after its gated runs, a clock at a_B 8 with the contact well
// removed between the tracked 1s-like level and a 2s-like level (scaled binding 0.316 against hydrogen's 2s 0.25, both
// lines of R 1.274): alpha 0.0692 against 0.0876, 0.79 of relativity's. This file pre-registers that clock at a point
// not yet read, a_B 7 (ball 32, N 8192), the contact well removed, m 0.427 (ringUnit(-5, 1)).
//
// THE TWO LEVELS. The tracked line (the largest overlap with the hydrogenic reference) and the 2S PARTNER: the
// followed genuine line of largest overlap among those with overlap at least 0.05, scaled binding 2 mu a_B^2 (2M - E)
// between 0.15 and 0.5 (hydrogen's 2s is 0.25), and its own K ratio within 0.1 of 4. A line outside that binding band
// is not a 2s level and is not used.
//
// GATES, fixed before the run:
//   I  the tracked line clean: overlap at least 0.2 and twice the next line's, K ratio within 0.1 of 4
//   S  a 2s partner exists (as defined above)
//   C  THE CLOCK: alpha = (a_1 - a_2) / (E_2 - E_1) positive, and alpha / alpha_SR between 0.75 and 1.25
//   Verdict: pass if I, S and C; partial if I and S hold and alpha is positive but outside the band; fail otherwise
//   (no clean 2s partner is a fail of the instrument, reported as such).
// PREDICTED: pass, alpha about 0.8 of relativity's, as at a_B 8.
// RUNTIME: about 2 hours at 6 threads (a_B 8 took 2.3 hours for three processes at 6 threads each; a_B 7's ball holds
// about 0.7 of a_B 8's representatives).
//
// FIRST RUN (2026-10-20, tmp/spn-clock-a7.log and .json, 6 threads at machine load near 40, 2.4 hours; the verdict by
// combineClock in tmp/spn-0213-combine.ts, tmp/spn-0213-verdict.log): FAIL, against the predicted pass. No gate moved.
//  - I fails: at a_B 7 the softened 1s-like level is a near pair, 1.666094 and 1.665332 (overlaps 0.398 and 0.256,
//    ratio 1.56, under the gate's 2), R 1.982 and 2.846, as at a_B 10 on the rule's count. Its K read retried at
//    K 0.02 and is quadratic there (ratio 4.054).
//  - S fails: the 2s-like line exists (1.699695, scaled binding 0.376, overlap 0.240) but has no clean continuation at
//    K (its ratio reads -35), so no clock can be read.
//  - So the clock is not read here. The one clean clock of a 1s and a 2s level on record remains E-SPN-0206's read at
//    a_B 8 (0.79 of relativity's rate, right sign), which was added after that file's gated runs.
// MEANING. Which points are clean depends on where near-degeneracies of the core family fall (a_B 7 and 10 are not,
// a_B 8 and 12 are). A clock test needs a point where both the 1s and the 2s lines are isolated. That is found from
// the K = 0 identity read alone, the first of the run's three reads (about a third of its time).
//
// Depth L2 (a two-body quantum walk on the husk quotient; the softened count is a control). DETERMINISM: no random
// numbers; the native kernel, byte for byte the JavaScript.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { softenedRead, type SoftenedRead } from '@/code/measure/pair-mass-read'
import { setupFor, type Follow } from '@/code/measure/register-track'

export const UNIT: readonly [number, number] = [-5, 1]
export const A_B = 7
const C_STAR2 = 0.5
const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1
const PARTNER_OVERLAP = 0.05
const PARTNER_BAND = [0.15, 0.5] as const
const CLOCK_BAND = [0.75, 1.25] as const

const flag = (b: boolean): number => (b ? 1 : 0)

export function combineClock(read: SoftenedRead): Verdict {
  const su = setupFor(UNIT)
  const { zero: z, motion: m } = read
  const t = m.tracked
  const scaledOf = (E: number): number => (2 * su.M0 - E) * 2 * su.mu * A_B * A_B
  const I =
    z.tracked.overlap >= IDENTITY &&
    z.tracked.overlap >= AMBIGUOUS * z.next &&
    t !== null &&
    Math.abs(t.ratio - 4) <= QUADRATIC
  const partner = m.others
    .filter(
      (f): f is Follow =>
        f !== null &&
        f.overlap >= PARTNER_OVERLAP &&
        scaledOf(f.E) >= PARTNER_BAND[0] &&
        scaledOf(f.E) <= PARTNER_BAND[1] &&
        Math.abs(f.ratio - 4) <= QUADRATIC,
    )
    .sort((x, y) => y.overlap - x.overlap)[0]
  const S = partner !== undefined
  const alpha = t && partner ? (t.a - partner.a) / (partner.E - t.E) : NaN
  const alphaSR = t && partner ? C_STAR2 / (2 * t.E * partner.E) : NaN
  const ratio = alpha / alphaSR
  const C = alpha > 0 && ratio >= CLOCK_BAND[0] && ratio <= CLOCK_BAND[1]
  const status =
    I && S && C ? 'pass' : I && S && alpha > 0 ? 'partial' : 'fail'

  return verdict({
    status,
    claim: `a_B ${A_B}, m ${su.m.toFixed(4)}, the contact well removed: the tracked level (overlap ${z.tracked.overlap.toFixed(3)}, next ${z.next.toFixed(3)}, ratio ${t ? t.ratio.toFixed(3) : 'none'}, R ${t ? t.R.toFixed(4) : 'none'}) and ${partner ? `the 2s partner at ${partner.E.toFixed(6)} (scaled binding ${scaledOf(partner.E).toFixed(3)}, overlap ${partner.overlap.toFixed(3)}, R ${partner.R.toFixed(4)})` : 'no 2s partner'} beat with alpha ${alpha.toExponential(3)} against relativity's ${alphaSR.toExponential(3)} (${ratio.toFixed(3)} of it). I ${I}, S ${S}, C ${C}`,
    metrics: {
      I: flag(I),
      S: flag(S),
      C: flag(C),
      overlap: z.tracked.overlap,
      next: z.next,
      ratio: t?.ratio ?? NaN,
      R: t?.R ?? NaN,
      Rfull: m.Rfull,
      partnerE: partner?.E ?? NaN,
      partnerR: partner?.R ?? NaN,
      partnerScaled: partner ? scaledOf(partner.E) : NaN,
      alpha,
      alphaSR,
      alphaOverSR: ratio,
    },
    control: { alphaSR },
    notes: `L2. Followed lines: ${m.others.map(f => (f ? `E ${f.E.toFixed(6)} (scaled ${scaledOf(f.E).toFixed(3)}) overlap ${f.overlap.toFixed(3)} R ${f.R.toFixed(3)} ratio ${f.ratio.toFixed(2)}` : 'none')).join('; ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

export default experiment({
  id: 'spin/register-pair-clock',
  code: 'E-SPN-0213',
  title:
    "explores whether a clock of the register pair's 1s-like and 2s-like levels, the contact well removed at a_B 7, ticks slower when it moves as relativity says",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combineClock(softenedRead(UNIT, A_B, NATIVE))
  },
})
