// Does a husk light front passing BESIDE a neutral depth lump bend toward it, and does any bending or delay grow with
// the lump's depth content (its number of vibes) and fall with the impact parameter as a 1/r potential's would
// (E-GRV-0063)? The second half of "mass is depth, gravity is the delay depth causes", after E-GRV-0062 (the front
// through the lump).
//
// THE LIGHT, THE LUMP, THE FRONT AND THE READERS: code/measure/depth-lump (header), the survey E-GRV-0062 shares. The
// front runs from (-3, b, 0) to (3, b, 0) at b = 1, 2, 3, 4 beside lumps of N = 2, 4, 12 vibes at the husk origin
// (neutral, flipped, and split: the same vibes with column sums not zero). DEFLECTION: the y centroid of the twin
// difference's angle weight past the lump (x > 0) at the empty front's arrival beat, lump minus empty; negative is
// toward the lump. The lump is kept by the rule (the trit light moves no vibe), with no stand-in.
//
// Gates, fixed before the first run of this file:
//  E1 instrument: E-GRV-0062's D1 (Gauss, the closure, the lump kept, the empty front arriving at every b) and a
//     sensitivity control: some split lump's deflection is nonzero (magnitude above 1e-9) at some b = 1 .. 4
//  E2 bending: for some neutral content N, the deflection is nonzero (magnitude above 1e-9) and negative (toward the
//     lump) at every b = 1 .. 4
//  E3 depth content and range: for every b = 1 .. 4 the neutral deflection's magnitude rises strictly with N
//     (2 < 4 < 12), and at N = 12 it falls strictly with b from 1 to 4
// Verdict: pass if all hold; fail if E1 holds and E2 or E3 fails; partial if E1 fails.
//
// Reported, not gated: every deflection (neutral, flipped, split, split flipped) at every b; the delay (arrival minus
// the empty's) and the mismatch count at every b; for the split lump, b times the deflection (constant for a 1/b
// fall) and the log-log slope of |deflection| against b over the b with a nonzero deflection.
//
// FIRST RUN (tmp/grv0063-run1.log, 297 s, the record): fail on E2 and E3, recorded as is, no gate moved. E1 holds
// (the instrument, and every split lump bends the front). Every neutral lump and its flip, N = 2, 4, 12, gives a
// deflection of exactly 0, a delay of 0 and 0 husk entries differing at every b = 1 .. 4, so there is nothing to grow
// with content or fall with range. The split lumps (column sums not zero) move the front's centroid by columns, not
// fractions: N = 12 by +1.43, +0.46, -0.57, -1.48 at b = 1 .. 4 (flipped +1.49, +0.59, -0.48, -1.52), AWAY from the
// lump near it and toward y = 4 beyond, where the placed strings turn up in z and the partners sit; the flip changes it
// by at most 0.99 (N = 2, b = 1), so the bend is mostly even in the sign, but it is not a pull toward the lump and not
// 1/b (b times the bend 1.43, 0.92, -1.72, -5.90), and the front arrives 1 to 11 beats EARLY. It reads as the strings'
// radiated light pushing the pulse's nonlinear spread, set by where the strings run, not a potential. Title written
// after the run.
//
// DISCLOSED: the probe before the gates is E-GRV-0062's (the empty configuration only). The closure makes the neutral
// lump's twin difference equal the empty's at every beat, so E2 and E3 are decided in advance unless the closure fails:
// disclosed here, before the run. Depth: L1 for E2 and E3 (an identity checked on the rule), L2 for the split control.
// DETERMINISM: nothing is drawn. NOTHING MOVES: no vibe moves; the light takes its column values by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  BEATS,
  CONFIGS,
  CONTENTS,
  IMPACTS,
  deflection,
  depthLumpSurvey,
  readingOf,
} from '@/code/measure/depth-lump'
import { slope as fitSlope } from '@/code/measure/held-knot'

export default experiment({
  id: 'gravity/depth-lump-bending',
  code: 'E-GRV-0063',
  title:
    "no bending of the husk light by a neutral depth lump, fail on E2 and E3: on the trit light (side 16, D 4) a front passing a neutral lump of 2, 4 or 12 vibes at impact b = 1 to 4 is deflected by exactly 0, delayed by 0 and differs from the no-lump front at 0 husk entries on every beat, flipped or not, so nothing grows with the depth content or falls as 1/b; the same vibes with nonzero column sums shift the front's centroid by whole columns (N = 12: +1.43, +0.46, -0.57, -1.48 at b = 1 to 4, flipped +1.49, +0.59, -0.48, -1.52), away from the lump near it and toward where its strings run beyond, and bring it 1 to 11 beats early: the strings' radiated light, not a potential",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const survey = depthLumpSurvey(what => console.error(what))
    const beside = IMPACTS.map((b, i) => ({ b, i })).filter(
      x => x.b > 0,
    )
    const bend = (name: string, i: number): number =>
      deflection(survey, name, i)
    const big = (x: number): boolean =>
      Number.isFinite(x) && Math.abs(x) > 1e-9

    // E1
    const instrument =
      survey.readings.every(
        r => r.gauss === 0 && r.closure && r.lumpKept,
      ) &&
      readingOf(survey, 'empty').impacts.every(i => i.arrival <= BEATS)
    const splitBent = CONTENTS.filter(n =>
      beside.some(x => big(bend(`split${n}`, x.i))),
    )
    const g1 = instrument && splitBent.length > 0

    // E2
    const bendsToward = CONTENTS.filter(n =>
      beside.every(
        x =>
          big(bend(`neutral${n}`, x.i)) && bend(`neutral${n}`, x.i) < 0,
      ),
    )
    const g2 = bendsToward.length > 0

    // E3
    const growsWithContent = beside.every(x =>
      CONTENTS.every(
        (n, k) =>
          k === 0 ||
          Math.abs(bend(`neutral${n}`, x.i)) >
            Math.abs(bend(`neutral${CONTENTS[k - 1]}`, x.i)),
      ),
    )
    const fallsWithRange = beside.every(
      (x, k) =>
        k === 0 ||
        Math.abs(bend('neutral12', x.i)) <
          Math.abs(
            bend('neutral12', (beside[k - 1] as { i: number }).i),
          ),
    )
    const g3 = growsWithContent && fallsWithRange
    const status = !g1 ? 'partial' : g2 && g3 ? 'pass' : 'fail'

    const metrics: Record<string, number> = {
      gate_E1: g1 ? 1 : 0,
      gate_E2: g2 ? 1 : 0,
      gate_E3: g3 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      growsWithContent: growsWithContent ? 1 : 0,
      fallsWithRange: fallsWithRange ? 1 : 0,
    }
    const notes: string[] = []
    const f = (x: number): string =>
      Number.isFinite(x) ? x.toExponential(3) : 'none'

    for (const c of CONFIGS) {
      if (c.form === 'empty') {
        continue
      }

      const row: string[] = []

      for (const x of beside) {
        const d = bend(c.name, x.i)
        const own = readingOf(survey, c.name).impacts[x.i]!
        const empty = readingOf(survey, 'empty').impacts[x.i]!

        metrics[`bend_${c.name}_b${x.b}`] = d
        metrics[`delay_${c.name}_b${x.b}`] = own.arrival - empty.arrival
        metrics[`mismatch_${c.name}_b${x.b}`] = own.mismatch.reduce(
          (a, v) => a + v,
          0,
        )

        row.push(
          `b${x.b} bend ${f(d)} delay ${own.arrival - empty.arrival} mismatch ${metrics[`mismatch_${c.name}_b${x.b}`]}`,
        )
      }

      notes.push(`${c.name}: ${row.join(', ')}`)
    }

    const range: string[] = []

    for (const n of CONTENTS) {
      const pts = beside
        .map(x => ({ b: x.b, d: bend(`split${n}`, x.i) }))
        .filter(p => big(p.d))
      const slope =
        pts.length >= 2
          ? fitSlope(
              pts.map(p => Math.log(p.b)),
              pts.map(p => Math.log(Math.abs(p.d))),
            )
          : Number.NaN

      metrics[`splitSlope_N${n}`] = slope
      range.push(
        `split${n}: b x bend ${beside.map(x => f(x.b * bend(`split${n}`, x.i))).join(', ')}, log-log slope ${Number.isFinite(slope) ? slope.toFixed(2) : 'not evaluable'} over ${pts.length} b`,
      )
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a husk light front from (-3, b, 0) to (3, b, 0) beside a lump at the origin (trit light, side 16, D 4), b = 1 .. 4: neutral deflection N = 12 ${beside.map(x => f(bend('neutral12', x.i))).join(', ')}; neutral N = 2 ${beside.map(x => f(bend('neutral2', x.i))).join(', ')}; split (column sums not zero) N = 12 ${beside.map(x => f(bend('split12', x.i))).join(', ')}, flipped ${beside.map(x => f(bend('split12-flipped', x.i))).join(', ')}`,
      metrics,
      control: {
        splitBent: splitBent.length,
        instrument: instrument ? 1 : 0,
      },
      notes: `L1 (E2, E3: an identity checked on the rule), L2 (the split control). Gates E1 ${g1}, E2 ${g2}, E3 ${g3}. Neutral contents bending toward the lump at every b: [${bendsToward.join(', ')}]; split contents bent at some b: [${splitBent.join(', ')}]. Per configuration: ${notes.join('; ')}. Range: ${range.join('; ')}. Survey ${survey.seconds.toFixed(0)} s.`,
    })
  },
})
