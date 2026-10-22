// A MOVING CLOCK AT A CLEAN POINT (E-SPN-0214, OPEN-MOT-01). E-SPN-0213's clock at a_B 7 could not be read: its 1s-like
// level is a near pair and its 2s-like line has no clean continuation. The one clean 1s-2s clock on record, a_B 8 with
// the contact well removed (alpha 0.79 of relativity's), was read after E-SPN-0206's gated runs. This file chooses a
// point by the identity read alone, then reads the clock there under gates fixed first.
//
// THE CHOICE (fixed before any identity read here). Candidates, in this order: a_B 7.5, 9, 10, all with the contact
// well removed (code/measure/contact-core softenContact), m 0.427 (ringUnit(-5, 1)), ball ceil(4.5 a_B), N 8192. The
// chosen point is the first candidate whose identity read is CLEAN:
//   the tracked 1s-like line: overlap at least 0.2 and at least twice the next genuine line's
//   a 2s-like line exists (code/measure/pair-clock twoSLine): scaled binding in [0.15, 0.5], overlap at least 0.05,
//   at least twice any other genuine line in that band
// a_B 8 is the fallback if none is clean. Its clock is already known (the engine is deterministic, so a re-read gives
// 0.79 again), so a fallback read is a confirmation under fixed gates and not a blind test, and is reported as such.
// The identity reads run one at a time and stop at the first clean candidate.
//
// GATES ON THE MOTION READ (fixed before it):
//   I  the tracked line's K ratio within 0.1 of 4; the 2s line followed (code/measure/register-track readMotion's
//      others) with its own ratio within 0.1 of 4
//   C  THE CLOCK: alpha (code/measure/pair-clock clockOf) positive and alpha / alpha_SR in [0.75, 1.25],
//      alpha_SR = c*^2 / (2 E_1 E_2), c*^2 = 1/2 a cycle
//   Verdict: pass if the point is clean, I and C hold; partial if clean and I hold and alpha is positive outside the
//   band; fail otherwise.
// PREDICTED: alpha about 0.8 of relativity's at the chosen point, a pass.
//
// FIRST RUN (2026-10-20 to 21, tmp/spn-cleanclock.log and the saved reads tmp/spn-cleanclock-zero-7.5.json and
// -motion-7.5.json, 6 threads at load near 40, 1.4 hours; the verdict by combineCleanClock in tmp/spn-0214-combine.ts,
// tmp/spn-0214-verdict.log): FAIL. The gates did not move.
//  - The choice: a_B 7.5, the first candidate, is clean. The 1s-like line overlaps 0.617 against the next 0.241, and
//    the 2s-like line (scaled binding 0.342) overlaps 0.241 and is alone in its band. So the read is blind (not the
//    a_B 8 fallback).
//  - DEVIATION, disclosed. The run's own verdict matched the 2s line to the followed lines by an EXACT phase. But
//    readMotion follows the lines of its N / 2 lag count, which differ from the N-lag identity read in the last digits
//    (1.701456 here). So it reported "2s not followed". The match was then changed to the nearest followed line within
//    1e-4 in phase (PARTNER_MATCH) and the verdict recomputed from the saved reads, with no engine rerun and no gate
//    moved.
//  - I fails narrowly: the tracked line's ratio is 4.009, the 2s line's 3.896, just outside 0.1 of 4.
//  - C fails: the 2s line is LIGHTER per unit energy than the 1s line (R 1.283 against 1.337), so the beat rises with
//    K: alpha -0.0954 against relativity's +0.0879 (-1.09 times).
// MEANING. The clock's alpha is the difference of two levels' K^2 coefficients over a gap of 0.029. When the two levels
// have the same R, alpha is relativity's divided by R. A difference of a few percent between their R flips the sign.
// The levels' lattice remainders are 5 to 20 percent and differ from level to level (a_B 8: 1.274 and 1.274; a_B 7.5:
// 1.337 and 1.283). So a moving clock built from bound levels dilates as relativity says only once those remainders
// are below about 1 percent, the same continuum limit that R itself needs. At these Bohr radii the clock is not
// readable.
//
// Depth L2 (a two-body quantum walk on the husk quotient; the softened count is a control). DETERMINISM: no random
// numbers; the native kernel, byte for byte the JavaScript.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { softenContact } from '@/code/measure/contact-core'
import { clockOf, twoSLine } from '@/code/measure/pair-clock'
import {
  radiusOf,
  readMotion,
  readZero,
  setupFor,
  type Follow,
  type MotionRead,
  type TrackPoint,
  type ZeroRead,
} from '@/code/measure/register-track'

export const UNIT: readonly [number, number] = [-5, 1]
export const CANDIDATES: readonly number[] = [7.5, 9, 10]
export const FALLBACK = 8
const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1
const CLOCK_BAND = [0.75, 1.25] as const
// a followed line is the 2s line when its phase is within this of the identity read's (lines are 7.7e-4 apart at the
// finest, a bin of 8192 lags)
const PARTNER_MATCH = 1e-4

export const pointOf = (aB: number): TrackPoint => ({
  name: `c${aB}`,
  aB,
  R: radiusOf(aB),
  N: 8192,
  motion: true,
})

export function identityRead(aB: number, opts: KernelOptions, log: (what: string) => void = () => {}): ZeroRead {
  return readZero(setupFor(UNIT), pointOf(aB), opts, log, 1, softenContact)
}

export const isClean = (z: ZeroRead): boolean =>
  z.tracked.overlap >= IDENTITY &&
  z.tracked.overlap >= AMBIGUOUS * z.next &&
  twoSLine(z) !== null

export function motionRead(zero: ZeroRead, opts: KernelOptions, log: (what: string) => void = () => {}): MotionRead {
  return readMotion(setupFor(UNIT), pointOf(zero.aB), zero, opts, log, softenContact)
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function combineCleanClock(scanned: ZeroRead[], zero: ZeroRead, motion: MotionRead): Verdict {
  const clean = isClean(zero)
  const s = twoSLine(zero)
  const t = motion.tracked
  // the followed line nearest the 2s line in phase: readMotion follows the lines of its own lag count (N / 2 when the
  // identity read converged), whose phases differ from the N-lag identity read's in the last digits (FIRST RUN)
  const partner = s
    ? motion.others
        .filter((f): f is Follow => f !== null && Math.abs(f.E - s.E) <= PARTNER_MATCH)
        .sort((x, y) => Math.abs(x.E - s.E) - Math.abs(y.E - s.E))[0] ?? null
    : null
  const I =
    t !== null &&
    Math.abs(t.ratio - 4) <= QUADRATIC &&
    partner !== null &&
    Math.abs(partner.ratio - 4) <= QUADRATIC
  const ck = t && partner ? clockOf(t, partner) : null
  const C = ck !== null && ck.alpha > 0 && ck.ratio >= CLOCK_BAND[0] && ck.ratio <= CLOCK_BAND[1]
  const status = clean && I && C ? 'pass' : clean && I && ck !== null && ck.alpha > 0 ? 'partial' : 'fail'
  const blind = zero.aB !== FALLBACK

  return verdict({
    status,
    claim: `identity reads ${scanned.map(z => `a_B ${z.aB} ${isClean(z) ? 'clean' : 'not clean'} (1s ${z.tracked.overlap.toFixed(3)} against ${z.next.toFixed(3)}, 2s ${twoSLine(z) ? twoSLine(z)!.overlap.toFixed(3) : 'none'})`).join('; ')}; the clock at a_B ${zero.aB}${blind ? '' : ' (the fallback, a confirmation, not blind)'}: tracked ratio ${t ? t.ratio.toFixed(3) : 'none'} R ${t ? t.R.toFixed(4) : 'none'}, 2s ${partner ? `E ${partner.E.toFixed(6)} ratio ${partner.ratio.toFixed(3)} R ${partner.R.toFixed(4)}` : 'not followed'}, alpha ${ck ? ck.alpha.toExponential(3) : 'none'} against relativity's ${ck ? ck.alphaSR.toExponential(3) : 'none'} (${ck ? ck.ratio.toFixed(3) : 'none'} of it). clean ${clean}, I ${I}, C ${C}`,
    metrics: {
      aB: zero.aB,
      blind: flag(blind),
      clean: flag(clean),
      I: flag(I),
      C: flag(C),
      overlap: zero.tracked.overlap,
      next: zero.next,
      twoSOverlap: s?.overlap ?? NaN,
      twoSScaled: s?.scaled ?? NaN,
      ratio: t?.ratio ?? NaN,
      R: t?.R ?? NaN,
      Rfull: motion.Rfull,
      partnerRatio: partner?.ratio ?? NaN,
      partnerR: partner?.R ?? NaN,
      alpha: ck?.alpha ?? NaN,
      alphaSR: ck?.alphaSR ?? NaN,
      alphaOverSR: ck?.ratio ?? NaN,
    },
    control: { alphaSR: ck?.alphaSR ?? NaN },
    notes: `L2. Followed lines: ${motion.others.map(f => (f ? `E ${f.E.toFixed(6)} overlap ${f.overlap.toFixed(3)} R ${f.R.toFixed(3)} ratio ${f.ratio.toFixed(2)}` : 'none')).join('; ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

export default experiment({
  id: 'spin/register-pair-clean-clock',
  code: 'E-SPN-0214',
  title:
    "explores whether the register pair's 1s-2s clock, read at the first contact-well-removed point where both levels are clean single lines, ticks slower when it moves as relativity says",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const scanned: ZeroRead[] = []

    for (const aB of CANDIDATES) {
      const z = identityRead(aB, NATIVE)

      scanned.push(z)

      if (isClean(z)) {
        return combineCleanClock(scanned, z, motionRead(z, NATIVE))
      }
    }

    const z = identityRead(FALLBACK, NATIVE)

    return combineCleanClock(scanned, z, motionRead(z, NATIVE))
  },
})
