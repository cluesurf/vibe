// THE LIGHTER MEMBER AT THE WEAKER PULL (E-SPN-0212, OPEN-MOT-01). E-SPN-0211 found the register pair's remainder (R_full
// minus E-SPN-0209's corrected reference, the contact well removed) at a_B 8 is 0.533, 0.143, 0.191 for members m 0.284,
// 0.427, 0.474: not one power of the pair's internal speed. The reading it left is two lattice pieces of the static
// engine, one set by the pair's internal speed (the coupling alpha_eff = 1 / (mu a_B), larger for a lighter member at
// fixed a_B) and one by the member's own lattice inertia, tan m / m - 1.
//
// THE TWO-PIECE PREDICTION, WRITTEN BEFORE THE RUN. At fixed a_B, alpha_eff scales as 1 / (m a_B). The point m 0.284 at
// a_B 12 has m a_B = 3.404, and m 0.427 at a_B 8 has 3.416: the SAME internal speed to 0.4%. So the speed piece there
// is the m 0.427, a_B 8 read's, and only the member's own lattice inertia differs. Taking the m 0.427, a_B 8 remainder
// (0.143) as carried by that inertia, it scales with tan m / m - 1: 0.0277 at m 0.284 against 0.0656 at m 0.427, a
// factor 0.423. PREDICTED REMAINDER: 0.143 x 0.423 = 0.060 (at least the drop from 0.533 to below m 0.427's own a_B 12
// value, 0.101). A pure speed law with no mass piece would instead give 0.143.
//
// THE RUN. code/measure/pair-mass-read softenedRead for ringUnit(-7, 2) (m 0.283682) at a_B 12 (ball 54, N 8192), on
// the native kernel at 12 threads (about 5 to 7 hours, under the 8-hour stop).
//
// GATES, fixed before the run:
//   I  A CLEAN READ: the tracked overlap at least 0.2 and at least twice the next genuine line's, and the K ratio
//      d(K) / d(K / 2) within 0.05 of 4
//   P  PASS: the remainder within 0.02 of 0.060, or below 0.05
//   H  PARTIAL: the remainder at most half of 0.533 (0.2665)
//   Verdict: pass if I and P; partial if I and H (not P), or P holds on a read that misses I only on the ratio within
//   0.1 of 4; fail otherwise.
//
// FIRST RUN (2026-10-20, test/record/E-SPN-0212/spn-light-m0284-a12.log and .json, the native kernel at 12 threads on a machine at load 40,
// 6.2 hours; the verdict by combineLightWeak in test/record/E-SPN-0212/run/spn-0212-combine.ts, test/record/E-SPN-0212/spn-0212-verdict.log): PASS, as
// predicted. No gate moved.
//  - I holds: the tracked line 1.1141074 (scaled binding 1.731), overlap 0.684 against the next 0.253, ratio 3.989 at
//    K 0.04 (at a_B 8 this member's read was not quadratic, 3.855 at K 0.02).
//  - P holds: R 1.1278, R_full 1.0785 against the corrected reference 1.0244, remainder 0.0541 against the predicted
//    0.060 (within 0.006), from 0.533 at a_B 8: a fall of ten times for a_B 8 to 12.
//  - R_full is 0.051 above the member's own tan m / m (1.0277), the closest any register pair has come.
// MEANING. At equal internal speed (m a_B 3.40 against 3.42) the remainder is the m 0.427, a_B 8 one scaled by the
// member's lattice inertia, tan m / m - 1, to 10%. So both pieces are lattice terms: one set by how fast the pair moves
// inside against the mesh, one by the member's own lattice mass, and both vanish where members are light against a
// dock and bound loosely (the continuum limit), as the lone member's tan m / m - 1 does.
//
// Depth L2 (a two-body quantum walk on the husk quotient; the softened count is a control). DETERMINISM: no random
// numbers; the native kernel, byte for byte the JavaScript.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import {
  correctedReference,
  softenedRead,
  type SoftenedRead,
} from '@/code/measure/pair-mass-read'
import { setupFor } from '@/code/measure/register-track'

export const UNIT: readonly [number, number] = [-7, 2]
export const A_B = 12
const PREDICTED = 0.06
const PASS_BAND = 0.02
const PASS_FLOOR = 0.05
const START = 0.533
const IDENTITY = 0.2
const AMBIGUOUS = 2
const RATIO = 0.05
const RATIO_LOOSE = 0.1

const flag = (b: boolean): number => (b ? 1 : 0)

export function combineLightWeak(read: SoftenedRead): Verdict {
  const su = setupFor(UNIT)
  const { zero: z, motion: m } = read
  const t = m.tracked
  const identity =
    z.tracked.overlap >= IDENTITY && z.tracked.overlap >= AMBIGUOUS * z.next
  const ratioOk = t !== null && Math.abs(t.ratio - 4) <= RATIO
  const ratioLoose = t !== null && Math.abs(t.ratio - 4) <= RATIO_LOOSE
  const I = identity && ratioOk
  const ref = t ? correctedReference(su, t.E, z.darwinS) : NaN
  const r = m.Rfull - ref
  const P = Math.abs(r - PREDICTED) <= PASS_BAND || r < PASS_FLOOR
  const H = r <= START / 2
  const status =
    I && P
      ? 'pass'
      : (I && H) || (identity && ratioLoose && P)
        ? 'partial'
        : 'fail'

  return verdict({
    status,
    claim: `m ${su.m.toFixed(4)} at a_B ${A_B} with the contact well removed: tracked overlap ${z.tracked.overlap.toFixed(3)} (next ${z.next.toFixed(3)}), ratio ${t ? t.ratio.toFixed(3) : 'none'} at K ${m.kappa}, R ${t ? t.R.toFixed(4) : 'none'}, R_full ${m.Rfull.toFixed(4)} against the corrected reference ${ref.toFixed(4)} (tan m / m ${su.tanOver.toFixed(4)}): remainder ${r.toFixed(4)} against the predicted ${PREDICTED} (a_B 8: ${START}). I ${I}, P ${P}, H ${H}`,
    metrics: {
      I: flag(I),
      P: flag(P),
      H: flag(H),
      overlap: z.tracked.overlap,
      next: z.next,
      scaled: z.tracked.scaled,
      ratio: t?.ratio ?? NaN,
      kappa: m.kappa,
      Rstatic: t?.R ?? NaN,
      Rfull: m.Rfull,
      reference: ref,
      remainder: r,
      tanOver: su.tanOver,
    },
    control: { predicted: PREDICTED },
    notes: `L2. Followed lines: ${m.others.map(f => (f ? `E ${f.E.toFixed(6)} overlap ${f.overlap.toFixed(3)} R ${f.R.toFixed(3)} ratio ${f.ratio.toFixed(2)}` : 'none')).join('; ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 12 }

export default experiment({
  id: 'spin/register-pair-light-weak',
  code: 'E-SPN-0212',
  title:
    "explores whether the lighter register member's large remainder is a lattice artifact: m 0.284 at a_B 12, the same internal speed as m 0.427 at a_B 8, with the contact well removed",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combineLightWeak(softenedRead(UNIT, A_B, NATIVE))
  },
})
