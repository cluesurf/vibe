// IS THE BOUND REGISTER PAIR ONE BAND, OR TWELVE LINE BRANCHES WITH AN ISOTROPIC AVERAGE (E-RLT-0116)? E-RLT-0115 read
// the pair's K^2 coefficient the same in all 13 husk directions (spread 2.3e-6), but an equal-weight average of twelve
// lineon branches is isotropic at K^2 too (the D4 roots are a spherical 5-design), so a curvature cannot show that the pair
// leaves the line law. E-RLT-0115's own test of that (the one-cycle residual of a filtered state) failed as an instrument:
// the level's residual floor at K = 0 (1.5e-3) is three times the 4.7e-4 a twelve-branch splitting would add, and the
// reduced engine's sectors of the odd body diagonals ((1, 1, -1), (1, -1, 1)) grow without bound after about 600 cycles.
// This file asks the question with an instrument that resolves lines: filter diagonalization (code/algebra/linear/
// filter-diagonalization, E-MTR-0030) on the autocorrelation of the K = 0 level, unfolded and run at K = 0 and at
// K = kappa n.
//
// DERIVED BEFORE THE RUN (code/measure/lineon-branches' branchShifts). A composite whose parts keep their lines splits,
// at K = kappa n, into branches at E_L + 4 a kappa^2 (n . u)^2 (a the class-averaged curvature, so the branches' mean
// shift is a kappa^2). At kappa 0.32 with E-RLT-0115's a = 0.0183178 (a kappa^2 = 1.876e-3):
//   body diagonal (1, 1, 1): shifts 0 (3 classes), 1.25e-3 (6), 5.00e-3 (3), largest share 1/2
//   axis (1, 0, 0):          shifts 0 (6 classes), 3.75e-3 (6), largest share 1/2
// The closest branches sit 1.25e-3 apart, which filter diagonalization on 8,192 cycles resolves (E-MTR-0030 separated
// lines 3e-4 apart from 4,096). A single 3d band keeps the level whole: one line, shifted by a kappa^2 + b kappa^4 with
// E-RLT-0115's b (body -0.0025, axis -0.0037), which is 1.850e-3 on the body diagonal and 1.838e-3 on the axis.
//
// GATES, fixed before the run. The pair: E-SPN-0173's point (a_B 3.5, ball 16), the level of code/measure/pair-direction's
//  pairLevel. Each direction n in {(1, 0, 0), (1, 1, 1)} (both sectors stable over 4,096 cycles, E-RLT-0115's probe):
//  the correlation x_l, l = 0 .. 8,191, of the level unfolded into the sector of n's little group, at K = 0 and at K =
//  0.32 n; filterDiagonalize with S 4096, J 60, window [E_L - 0.004, E_L + 0.010].
//  I1 THE ENGINE STAYS BOUNDED: |x_l| <= 1 + 1e-6 at every l (the ball's edge may move the Gram norm slightly), in all four correlations.
//  I2 THE LINES ARE CONVERGED: the heaviest line at K = 0 and at K has |z| within 1e-6 of 1.
//  I3 THE INSTRUMENT RESOLVES BRANCHES (the control): the same solve on lineonCorrelation (twelve equal branches at
//     E_L + the shifts above) finds a heaviest line of weight within 0.02 of 1/2 and at least 3 lines of weight 0.05 or
//     more on the body diagonal (2 on the axis), each within 1e-5 of a derived shift; and on one line at E_L (a single
//     band) finds weight within 0.02 of 1.
//  With w0 the heaviest line's weight at K = 0 and w1, E1 the heaviest at K:
//  ONE BAND (pass on that direction): w1 >= 0.9 w0, and E1 - E0 within 0.1 a kappa^2 of a kappa^2 + b kappa^4.
//  BRANCHES (fail on that direction): w1 <= 0.6 w0.
//  VERDICT: open if I1, I2 or I3 fails; fail if the body diagonal reads BRANCHES (the pair keeps its lines); pass if both
//   directions read ONE BAND; partial if the body diagonal reads ONE BAND and the axis does not; open otherwise.
// PREDICTED: pass. The members are 3d Dirac bands under the dock mixer (E-SPN-0140, E-SPN-0145): the member's 16 phases
//  equal pi +- E(K) for generic K (E-RLT-0115's I1), not twelve line bands, so the pair built from them is one band.
//
// THE RUN AND ITS COST, estimated before the run: 32,768 cycles over 2,488 and 3,136 representatives, about 30 minutes
// at 6 threads (E-RLT-0115's 2,048-cycle reads took 200 s on 3,136), at 3 threads beside another run about an hour.
//
// FIRST RUN (2026-10-21, tmp/rlt116.log, .json and -verdict.log, 5,526 s at 3 native threads beside E-RLT-0115's stage
// 2): OPEN, as registered. No gate moved. I1, I2 and I3 hold: every correlation stays bounded, the lines converge, and
// the same solve on twelve line branches finds them exactly (axis 0 and 3.751e-3 at 0.50 each; body 0, 1.250e-3 and
// 5.002e-3 at 0.25, 0.50, 0.25).
//  - The K = 0 window is not one line: the main line (weight 0.8235) sits 1.06e-4 above E_L, with neighbors at -3.10e-3
//    (0.114) and +4.14e-3 (0.060). The derivation took the level as isolated, and at kappa 0.32 its shift (1.9e-3) is
//    comparable to that spacing, so the lines mix.
//  - Axis: the weight spreads over lines at +0.77e-3 (0.267), +2.22e-3 (0.271), +3.19e-3 (0.143) and +5.55e-3 (0.114)
//    from E_L, so the heaviest holds 0.27 of the 0.82 and the gate reads BRANCHES. But twelve line branches would put
//    0.41 at the unshifted energy and 0.41 at +3.86e-3, and neither line is there.
//  - Body: the heaviest line keeps 0.5685 (below the 0.9 x 0.82 whole-line bound, above the 0.6 x 0.82 split bound) at
//    a shift of 1.72e-3 from the main line, against the single band's 1.85e-3, with a near neighbor 2.0e-4 above it
//    (0.198). Twelve branches would leave 0.21 at the unshifted energy and 0.41 at +1.25e-3, and neither is there.
//  - So the registered whole-line test cannot decide, because the pair's own levels mix at this momentum. Read after
//    the run and not gated here: no line sits within 3.5e-4 of the K = 0 main line in either direction (the nearest
//    on the axis is 3.7e-4 away and weighs 0.011, on the body diagonal 1.07e-3 away and 0.004), which is where the
//    branches with n . u = 0 would stay. E-RLT-0117 gates that "still share" fresh.
//
// AFTER THE ENGINE FIX (2026-10-21, vibe-roadmap-moving-matter-0008). code/measure/register-reduced now builds the
// (1, 1, -1) and (1, -1, 1) sectors as images of (1, 1, 1)'s; this file reads only (1, 0, 0) and (1, 1, 1), whose tables
// are unchanged bit for bit (tmp/rrfix-tables.ts). Rerun after the fix (tmp/rrfix-rlt116.log): the level and the first
// 513 lags of the axis K = 0 and the body K = 0.32 correlations equal tmp/rlt116.json to the bit, and the verdict from the
// recorded part is unchanged, OPEN.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the lineon control is synthetic).
// DETERMINISM: no random numbers; the start is placed; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import {
  filterDiagonalize,
  type FilterLine,
} from '@/code/algebra/linear/filter-diagonalization'
import {
  branchShifts,
  lineonCorrelation,
} from '@/code/measure/lineon-branches'
import { pairCorrelation, pairLevel } from '@/code/measure/pair-direction'
import { setup } from '@/code/measure/register-track'

const STAGE = { aB: 3.5, R: 16 } as const
const KAPPA = 0.32
const S = 4096
const J = 60
const BELOW = 0.004
const ABOVE = 0.01
const A = 0.018317802430121526
const B: Record<string, number> = { axis: -0.0037, body: -0.0025 }
const DIRS: readonly { name: string; n: readonly number[] }[] = [
  { name: 'axis', n: [1, 0, 0] },
  { name: 'body', n: [1, 1, 1] },
]
const BOUNDED = 1e-6
const MODULUS = 1e-6
const HALF = 0.02
const SHARE = 0.05
const LOCATE = 1e-5
const WHOLE = 0.9
const SPLIT = 0.6
const SHIFT = 0.1

export const NATIVE: KernelOptions = { backend: 'native', threads: 3 }

type Correlation = { re: number[]; im: number[] }

export type SplitPart = {
  EL: number
  reads: { name: string; zero: Correlation; moved: Correlation; reps: number }[]
  seconds: number
}

export function splitRun(
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): SplitPart {
  const started = Date.now()
  const su = setup()
  const level = pairLevel({ su, aB: STAGE.aB, R: STAGE.R, opts })
  const reads = DIRS.map(d => {
    const at = (k: number) =>
      pairCorrelation({ su, level, direction: d.n, kappa: KAPPA, k, length: 2 * S - 1, opts })
    const zero = at(0)

    log(`${d.name} zero read`)

    const moved = at(KAPPA)

    log(`${d.name} moved read`)

    return { name: d.name, zero: { re: zero.re, im: zero.im }, moved: { re: moved.re, im: moved.im }, reps: zero.reps }
  })

  return { EL: level.EL, reads, seconds: (Date.now() - started) / 1000 }
}

const heaviest = (ls: FilterLine[]): FilterLine | undefined =>
  ls.length === 0 ? undefined : ls.reduce((b, l) => (l.weight > b.weight ? l : b))

const flag = (b: boolean): number => (b ? 1 : 0)

export function splitCombine(part: SplitPart): Verdict {
  const { EL } = part
  const solve = (x: Correlation): FilterLine[] =>
    filterDiagonalize({ x, lo: EL - BELOW, hi: EL + ABOVE, basis: J, length: S })
  const aK2 = A * KAPPA ** 2
  const rows = part.reads.map(r => {
    const bounded = [r.zero, r.moved].every(x =>
      x.re.every((v, l) => Math.hypot(v, x.im[l]!) <= 1 + BOUNDED),
    )
    const l0 = solve(r.zero)
    const l1 = solve(r.moved)
    const h0 = heaviest(l0)
    const h1 = heaviest(l1)
    const converged =
      !!h0 && !!h1 && Math.abs(h0.modulus - 1) <= MODULUS && Math.abs(h1.modulus - 1) <= MODULUS
    const dir = DIRS.find(d => d.name === r.name)!
    const shifts = branchShifts({ direction: dir.n, kappa: KAPPA, a: A })
    const distinct = [...new Set(shifts.map(s => s.toFixed(9)))].map(Number)
    const synthetic = solve(lineonCorrelation({ E: EL, shifts, length: 2 * S - 1 }))
    const single = solve(lineonCorrelation({ E: EL, shifts: [0], length: 2 * S - 1 }))
    const sh = heaviest(synthetic)
    const strong = synthetic.filter(l => l.weight >= SHARE)
    const located = strong.every(l => distinct.some(s => Math.abs(l.E - EL - s) <= LOCATE))
    const control =
      !!sh &&
      Math.abs(sh.weight - 0.5) <= HALF &&
      strong.length >= (r.name === 'body' ? 3 : 2) &&
      located &&
      Math.abs((heaviest(single)?.weight ?? 0) - 1) <= HALF
    const w0 = h0?.weight ?? NaN
    const w1 = h1?.weight ?? NaN
    const shift = (h1?.E ?? NaN) - (h0?.E ?? NaN)
    const want = aK2 + B[r.name]! * KAPPA ** 4
    const oneBand = w1 >= WHOLE * w0 && Math.abs(shift - want) <= SHIFT * aK2
    const branches = w1 <= SPLIT * w0

    return {
      name: r.name,
      reps: r.reps,
      bounded,
      converged,
      control,
      w0,
      w1,
      shift,
      want,
      oneBand,
      branches,
      lines0: l0.filter(l => l.weight >= 1e-3).map(l => `${(l.E - EL).toExponential(3)}:${l.weight.toFixed(4)}`),
      lines1: l1.filter(l => l.weight >= 1e-3).map(l => `${(l.E - EL).toExponential(3)}:${l.weight.toFixed(4)}`),
      synthetic: strong.map(l => `${(l.E - EL).toExponential(3)}:${l.weight.toFixed(4)}`),
    }
  })
  const I1 = rows.every(r => r.bounded)
  const I2 = rows.every(r => r.converged)
  const I3 = rows.every(r => r.control)
  const body = rows.find(r => r.name === 'body')!
  const axis = rows.find(r => r.name === 'axis')!
  const status: Verdict['status'] = !(I1 && I2 && I3)
    ? 'open'
    : body.branches
      ? 'fail'
      : body.oneBand && axis.oneBand
        ? 'pass'
        : body.oneBand
          ? 'partial'
          : 'open'

  return verdict({
    status,
    claim: `I1 ${I1}, I2 ${I2}, I3 ${I3}; ${rows.map(r => `${r.name} (${r.reps} reps): heaviest line weight ${r.w0.toFixed(4)} at K 0 and ${r.w1.toFixed(4)} at K ${KAPPA}, shift ${r.shift.toExponential(4)} against a single band's ${r.want.toExponential(4)} (one band ${r.oneBand}, branches ${r.branches}); twelve line branches through the same solve give ${r.synthetic.join(' ')}`).join('; ')}`,
    metrics: {
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      EL,
      aK2,
      ...Object.fromEntries(
        rows.flatMap(r => [
          [`${r.name}W0`, r.w0],
          [`${r.name}W1`, r.w1],
          [`${r.name}Shift`, r.shift],
          [`${r.name}Want`, r.want],
          [`${r.name}OneBand`, flag(r.oneBand)],
          [`${r.name}Branches`, flag(r.branches)],
        ]),
      ),
      seconds: part.seconds,
    },
    control: { I3: flag(I3) },
    notes: `L2. Lines (shift from E_L : weight, weight >= 1e-3): ${rows.map(r => `${r.name} K 0 [${r.lines0.join(' ')}], K ${KAPPA} [${r.lines1.join(' ')}]`).join('; ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

const PART = 'tmp/rlt116.json'

export default experiment({
  id: 'relativity/bound-pair-line-split',
  code: 'E-RLT-0116',
  title:
    "the bound register pair's lines at K 0.32, open (gates fixed before the run): filter diagonalization resolves twelve synthetic line branches exactly (axis 0 and 3.75e-3, body 0, 1.25e-3 and 5.0e-3), but the pair's K = 0 line (weight 0.82) has neighbors 3.1e-3 and 4.1e-3 away and mixes with them at this momentum, so the whole-line gate reads neither one band nor branches on the body diagonal (heaviest line 0.57, shift 1.72e-3 against 1.85e-3) and branches on the axis (0.27); no line stays near the K = 0 energy, where line branches with n . u = 0 would",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const part = existsSync(PART)
      ? (JSON.parse(readFileSync(PART, 'utf8')) as SplitPart)
      : splitRun(NATIVE)

    return splitCombine(part)
  },
})
