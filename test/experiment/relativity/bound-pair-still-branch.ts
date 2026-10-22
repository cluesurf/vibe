// DOES ANY PART OF THE BOUND REGISTER PAIR STAY BEHIND WHEN IT MOVES (E-RLT-0117)? The sharpest mark of a lineon
// composite: at total momentum K = kappa n, every line branch u with n . u = 0 carries 1d momentum exactly 0, so it does
// not move and its energy does not shift AT ANY ORDER. Such branches hold 3 of the 12 line classes on a body diagonal and 6
// of 12 on an axis. So a pair made of lineons keeps a "still share" of its K = 0 line, 1/4 of its weight on a body
// diagonal and 1/2 on an axis, at exactly the K = 0 energy, however far K moves it. A single 3d band keeps none there.
//
// WHY THIS FILE, AND WHAT WAS SEEN BEFORE IT (disclosed). E-RLT-0115 read the pair's K^2 coefficient isotropic in all 13
// husk directions (2.3e-6) but could not read mobility off lines. E-RLT-0116 resolved the pair's lines at K 0.32 by filter
// diagonalization and returned open: the K = 0 window holds the main line (weight 0.8235, at E_L + 1.06e-4) and two
// neighbors 3.1e-3 below and 4.1e-3 above, and at K 0.32 (a kappa^2 1.9e-3, comparable to that spacing) the main line
// mixes with them, so its registered whole-line test failed on the axis (weight 0.27) and missed on the body diagonal
// (weight 0.57, shift 1.72e-3 against 1.85e-3). Read AFTER that run, its line lists hold no line within 3.5e-4 of the
// K = 0 main line on either direction (the nearest weigh 0.011 and 0.004), where twelve line branches would leave 0.21
// (body) and 0.41 (axis). That reading was not gated there. This file gates it, fresh, at two momenta E-RLT-0116 did not read.
//
// THE READ. The pair of E-RLT-0115 stage 1 and E-RLT-0116 (a_B 3.5, ball 16, code/measure/pair-direction's pairLevel and
// pairCorrelation). For n the body diagonal (1, 1, 1) at kappa 0.20 and 0.24 and the axis (1, 0, 0) at kappa 0.24: the
// correlation x_l, l = 0 .. 8,191, of the K = 0 level unfolded into n's little-group sector and run at K = kappa n;
// filterDiagonalize with S 4096, J 60, window [E_L - 0.004, E_L + 0.010], exactly E-RLT-0116's settings. The K = 0
// correlation in each sector is E-RLT-0116's recorded one (test/record/E-RLT-0116/rlt116.json; same sector, start and engine, so the same
// bytes); E0 and w0 are its heaviest line's energy and weight.
//  STILL SHARE s = (sum of the weights of the lines within 2e-4 of E0 at K) / w0. A single band's own line has moved by
//  a kappa^2 = 7.3e-4 and 1.05e-3 at kappa 0.20 and 0.24, well outside 2e-4.
// GATES, fixed before the run.
//  I1 |x_l| <= 1 + 1e-6 at every l of every K correlation; I2 the K = 0 heaviest line has |z| within 1e-6 of 1.
//  I3 THE CONTROL: twelve equal line branches at E0 (code/measure/lineon-branches' branchShifts and lineonCorrelation,
//     a = 0.0183178) through the same solve read s within 0.03 of 1/4 (body) and 1/2 (axis) at each kappa.
//  NO STILL BRANCH (pass on a read): s <= 0.05.  A STILL BRANCH (fail on a read): s >= 0.15.
//  VERDICT: open if I1, I2 or I3 fails; fail if any read has a still branch; pass if every read has none; open
//   otherwise.
// PREDICTED: pass, s near 0 on every read (the members are 3d Dirac bands, so no part of the pair is held to a line).
//
// THE RUN AND ITS COST, estimated before the run: three 8,192-cycle correlations on 3,136, 3,136 and 2,488
// representatives at 3 native threads beside another run, about 1.2 hours (E-RLT-0116's took 1,100 to 2,300 s each).
//
// FIRST RUN (2026-10-21, test/record/E-RLT-0117/rlt117.log, .json and -verdict.log, 4,012 s at 3 native threads): OPEN, as registered, on
// the axis alone. No gate moved. I1, I2, I3 hold (the same solve on twelve line branches reads 0.2500 and 0.5000).
//  - BODY DIAGONAL, the direction no line casts: still share 0 at kappa 0.20 and at 0.24 (no line within 2e-4 of E0),
//    against 0.25 for line branches. The K = 0 line moves whole: weight 0.804 and 0.776 of its 0.8235, shifted 7.13e-4
//    and 1.013e-3 against a kappa^2 7.33e-4 and 1.055e-3 (the K^4 term, b -0.0025, takes those to 7.29e-4 and 1.047e-3,
//    so the reads sit 2% and 3% below). NO STILL BRANCH on both reads: the pair moves along a body diagonal as one band.
//  - AXIS at kappa 0.24: a line 1.4e-5 from E0 holds 0.104 (share 0.126), between the 0.05 and 0.15 bounds, while the
//    main line keeps 0.607 at a shift of 1.27e-3 (a kappa^2 1.055e-3), so the level mixes there with a neighbor. Line
//    branches would leave 0.5 at E0 and the main line would split in two; neither shows, but the registered bound is
//    not met, so the axis read is open and with it the verdict.
//
// AFTER THE ENGINE FIX (2026-10-21, vibe-roadmap-moving-matter-0008). code/measure/register-reduced now builds the
// (1, 1, -1) and (1, -1, 1) sectors as images of (1, 1, 1)'s; this file reads only (1, 0, 0) and (1, 1, 1), whose tables
// are unchanged bit for bit (tmp/rrfix-tables.ts), so its reads stand as recorded; the verdict recomputed from the
// recorded part after the fix is unchanged (test/record/E-RLT-0116/rrfix-rlt116.log).
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
const S = 4096
const J = 60
const BELOW = 0.004
const ABOVE = 0.01
const A = 0.018317802430121526
const NEAR = 2e-4
const NONE = 0.05
const STILL = 0.15
const CONTROL = 0.03
const BOUNDED = 1e-6
const MODULUS = 1e-6
const READS: readonly { name: string; n: readonly number[]; kappa: number; still: number }[] = [
  { name: 'body', n: [1, 1, 1], kappa: 0.2, still: 0.25 },
  { name: 'body', n: [1, 1, 1], kappa: 0.24, still: 0.25 },
  { name: 'axis', n: [1, 0, 0], kappa: 0.24, still: 0.5 },
]

export const NATIVE: KernelOptions = { backend: 'native', threads: 3 }

type Correlation = { re: number[]; im: number[] }

export type StillPart = {
  EL: number
  zero: Record<string, Correlation>
  moved: { name: string; kappa: number; x: Correlation }[]
  seconds: number
}

// the K = 0 correlations come from E-RLT-0116's recorded part when given, else they are read here
export function stillRun(input: {
  opts: KernelOptions
  zero?: Record<string, Correlation>
  log?: (what: string) => void
  landed?: (part: StillPart) => void
}): StillPart {
  const started = Date.now()
  const log = input.log ?? (() => {})
  const su = setup()
  const level = pairLevel({ su, aB: STAGE.aB, R: STAGE.R, opts: input.opts })
  const zero: Record<string, Correlation> = { ...(input.zero ?? {}) }
  const moved: StillPart['moved'] = []
  const now = (): StillPart => ({
    EL: level.EL,
    zero,
    moved: [...moved],
    seconds: (Date.now() - started) / 1000,
  })

  for (const r of READS) {
    const at = (k: number): Correlation => {
      const x = pairCorrelation({ su, level, direction: r.n, kappa: r.kappa, k, length: 2 * S - 1, opts: input.opts })

      return { re: x.re, im: x.im }
    }

    if (!zero[r.name]) {
      zero[r.name] = at(0)
      log(`${r.name} zero read`)
    }

    moved.push({ name: r.name, kappa: r.kappa, x: at(r.kappa) })
    log(`${r.name} kappa ${r.kappa} read`)
    input.landed?.(now())
  }

  return now()
}

const heaviest = (ls: FilterLine[]): FilterLine | undefined =>
  ls.length === 0 ? undefined : ls.reduce((b, l) => (l.weight > b.weight ? l : b))

const near = (ls: FilterLine[], E: number): number =>
  ls.filter(l => Math.abs(l.E - E) <= NEAR).reduce((s, l) => s + l.weight, 0)

const flag = (b: boolean): number => (b ? 1 : 0)

export function stillCombine(part: StillPart): Verdict {
  const { EL } = part
  const solve = (x: Correlation): FilterLine[] =>
    filterDiagonalize({ x, lo: EL - BELOW, hi: EL + ABOVE, basis: J, length: S })
  const zeroLines = Object.fromEntries(
    Object.entries(part.zero).map(([k, x]) => [k, solve(x)]),
  )
  const rows = part.moved.map(m => {
    const spec = READS.find(r => r.name === m.name && r.kappa === m.kappa)!
    const h0 = heaviest(zeroLines[m.name]!)!
    const lines = solve(m.x)
    const s = near(lines, h0.E) / h0.weight
    const bounded = m.x.re.every((v, l) => Math.hypot(v, m.x.im[l]!) <= 1 + BOUNDED)
    const synthetic = solve(
      lineonCorrelation({
        E: h0.E,
        shifts: branchShifts({ direction: spec.n, kappa: m.kappa, a: A }),
        length: 2 * S - 1,
      }),
    )
    const sControl = near(synthetic, h0.E)

    return {
      name: m.name,
      kappa: m.kappa,
      E0: h0.E,
      w0: h0.weight,
      modulus: h0.modulus,
      s,
      sControl,
      want: spec.still,
      bounded,
      none: s <= NONE,
      still: s >= STILL,
      lines: lines.filter(l => l.weight >= 1e-3).map(l => `${(l.E - h0.E).toExponential(3)}:${l.weight.toFixed(4)}`),
    }
  })
  const I1 = rows.every(r => r.bounded)
  const I2 = rows.every(r => Math.abs(r.modulus - 1) <= MODULUS)
  const I3 = rows.every(r => Math.abs(r.sControl - r.want) <= CONTROL)
  const complete = rows.length === READS.length
  const status: Verdict['status'] = !(I1 && I2 && I3)
    ? 'open'
    : rows.some(r => r.still)
      ? 'fail'
      : complete && rows.every(r => r.none)
        ? 'pass'
        : 'open'

  return verdict({
    status,
    claim: `I1 ${I1}, I2 ${I2}, I3 ${I3}; ${rows.map(r => `${r.name} kappa ${r.kappa}: still share ${r.s.toExponential(2)} of the K = 0 line (weight ${r.w0.toFixed(4)}), against ${r.want} for twelve line branches (the same solve on them reads ${r.sControl.toFixed(4)})`).join('; ')}${complete ? '' : `; ${rows.length} of ${READS.length} reads landed`}`,
    metrics: {
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      reads: rows.length,
      EL,
      ...Object.fromEntries(
        rows.flatMap(r => [
          [`${r.name}${r.kappa}Still`, r.s],
          [`${r.name}${r.kappa}Control`, r.sControl],
        ]),
      ),
      stillMax: Math.max(...rows.map(r => r.s)),
      seconds: part.seconds,
    },
    control: { I3: flag(I3) },
    notes: `L2. Lines at K (shift from E0 : weight, weight >= 1e-3): ${rows.map(r => `${r.name} ${r.kappa} [${r.lines.join(' ')}]`).join('; ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

const PART = 'test/record/E-RLT-0117/rlt117.json'
const ZERO = 'test/record/E-RLT-0116/rlt116.json'

export default experiment({
  id: 'relativity/bound-pair-still-branch',
  code: 'E-RLT-0117',
  title:
    "no part of the bound register pair stays behind on a body diagonal, open on the axis (gates fixed before the run): line branches with n . u = 0 would keep 1/4 of the K = 0 line at its energy on a body diagonal and 1/2 on an axis (the same solve reads 0.2500 and 0.5000 on them), and the pair keeps 0 at K 0.20 and 0.24 on the body diagonal, its line moving whole (0.80 and 0.78 of 0.82) by 2 to 3% less than a kappa^2 + b kappa^4; on the axis at 0.24 a neighboring level puts 0.126 there, between the 0.05 and 0.15 bounds",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    if (existsSync(PART)) {
      return stillCombine(JSON.parse(readFileSync(PART, 'utf8')) as StillPart)
    }

    const zero = existsSync(ZERO)
      ? Object.fromEntries(
          (JSON.parse(readFileSync(ZERO, 'utf8')) as { reads: { name: string; zero: Correlation }[] }).reads.map(
            r => [r.name, r.zero],
          ),
        )
      : undefined

    return stillCombine(stillRun({ opts: NATIVE, zero }))
  },
})
