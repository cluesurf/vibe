// "Mass is depth, gravity is the delay depth causes": does a NEUTRAL lump held in the depth of the bulk (loves and
// fears whose column sums are zero, so the husk cannot see it) delay a husk light front that passes through its
// columns, and is any such delay charge-blind (E-GRV-0062)? E-GRV-0059 found a neutral lump invisible to the static husk
// light on 480 of 480 beats; the idea tested here is that a front, whose value is carried down the whole bulk column,
// might still be slowed by busy depth content in the columns it crosses.
//
// THE LIGHT, THE LUMP, THE FRONT AND THE READERS: code/measure/depth-lump (header). In short: the trit light (side 16,
// D 4, wave form, E-GRV-0059's rule and placement); lumps of N = 2, 4, 12 vibes at the husk origin, NEUTRAL (every
// column sum zero), FLIPPED (every sign negated) and SPLIT (the same vibes with the fears moved one column down in z, so
// the column sums are not zero: the ordinary-charge control); a twin run with the +x angle column at (-3, b, 0) raised
// by 7, read on the husk against the same run with no lump. Here b = 0: the front's straight path from (-3, 0, 0) to
// the detector (3, 0, 0) crosses the lump's columns.
// WHO HOLDS THE LUMP: the rule, with no stand-in. The trit light never reads or moves a vibe, so the lump stays put
// (checked). This is not binding: nothing in the light moves matter. On the adopted knit no lump can stay in its
// column one beat without the reflecting stand-in, since every root casts a husk step (reported), and E-GRV-0056
// proved the stand-in's content invisible outside.
//
// Gates, fixed before the first run of this file:
//  D1 instrument: every run of every configuration and impact keeps 0 bulk and 0 husk Gauss violations at every beat;
//     the husk integer rule run from the husk read at the start equals the husk read off the trit rule at every beat,
//     every field (the closure); every lump is where it was placed after every run; and the empty front reaches the
//     detector within 36 beats at every b
//  D2 a depth delay: for some neutral lump (N = 2, 4 or 12) at b = 0, the detector arrival differs from the empty's,
//     or its twin difference differs from the empty's at one husk entry or more on some beat
//  D3 charge-blind: for every N, the flipped neutral lump's arrival and per-beat mismatch count equal the neutral
//     lump's at b = 0
//  D4 sensitivity (the control that makes a null meaningful): some split lump (column sums not zero) at b = 0 has a
//     twin difference that differs from the empty's at one husk entry or more on some beat
// Verdict: pass if all hold; fail if D1 and D4 hold and D2 or D3 fails; partial if D1 or D4 fails (then the reading
// could not have seen a lump, so a null says nothing).
//
// Reported, not gated: per configuration the arrival, the front's reach per beat (FAR) against the empty's, and the
// mismatch per beat; the split lump flipped against the split lump (is the ordinary-charge effect even in the sign);
// KNIT_COLUMN_ROOTS.
//
// DISCLOSED: one probe before the gates (tmp/grv62-probe1.ts, the EMPTY configuration only, side 16): a single-column
// kick of 1, 2, 4, 5 or 6 stays held in the counters (support 1 to 17 links) for 9 to 30 beats, and kicks of 7 and 8
// spread, the front reaching x offset 6 at beat 24 for 7. PULSE = 7 and BEATS = 36 were set from it. No lump was read
// before the gates. The closure (D1) makes the neutral lump's invisibility a theorem the file checks, so D2's neutral
// clause is decided in advance unless the closure fails: disclosed here, before the run.
//
// FIRST RUN (tmp/grv0062-run1.log, 281 s, 4,680 trit beats, the record): fail on D2 alone, recorded as is, no gate
// moved. D1, D3 and D4 hold: Gauss 0 on every beat, the closure on 13 of 13 configurations at every impact, every lump
// kept. The neutral lumps (N = 2, 4, 12) and their flips arrive at 24, the empty's beat, with 0 husk entries differing
// from the empty front on any of the 36 beats. The split lumps are seen from beat 2 or 3 and make the front arrive
// EARLIER, not later: 22, 19, 16 (N = 2, 4, 12) and flipped 21, 21, 14, against 24, so the ordinary-charge effect
// grows with the charge content but is neither a delay nor even in the sign. Its likely cause is the transverse light
// the placed strings radiate (E-GRV-0059's reported total energy), which feeds the pulse's nonlinear spread, not a
// field that slows light. Title written after the run.
//
// Depth: L1 for D2 and D3 (an identity of the rule, checked on the rule), L2 for the split control (the rule's own
// response to a charged lump, against a no-lump control). DETERMINISM: every configuration is placed; nothing is drawn.
// NOTHING MOVES: the light takes its column values by the rule; no vibe moves.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  BEATS,
  CONTENTS,
  IMPACTS,
  KNIT_COLUMN_ROOTS,
  depthLumpSurvey,
  readingOf,
  type ImpactReading,
} from '@/code/measure/depth-lump'

export default experiment({
  id: 'gravity/depth-lump-front',
  code: 'E-GRV-0062',
  title:
    "a neutral lump in the depth of the bulk does not delay the husk light's front, fail on D2: on the trit light (side 16, D 4, 36 beats) a front kicked at (-3, 0, 0) crosses neutral lumps of 2, 4 and 12 vibes (every column sum zero, kept in place by the rule with no stand-in) and reaches (3, 0, 0) at beat 24 exactly as with no lump, with 0 husk entries differing on any beat, the lump flipped the same, because the husk integer rule is closed on column sums (checked every beat on 13 of 13 configurations); the same vibes placed with nonzero column sums are seen from beat 2 or 3 and make the front arrive EARLIER, at 22, 19, 16 (flipped 21, 21, 14), a charge effect that depends on the sign and speeds the front rather than delaying it; on the adopted knit no lump can stay in a column one beat, since 0 of the 24 roots has a zero husk step",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const survey = depthLumpSurvey(what => console.error(what))
    const through = IMPACTS.indexOf(0)
    const at = (name: string): ImpactReading =>
      readingOf(survey, name).impacts[through]!
    const empty = at('empty')
    const touched = (r: ImpactReading): boolean =>
      r.mismatch.some(m => m > 0)

    // D1
    const g1 =
      survey.readings.every(
        r => r.gauss === 0 && r.closure && r.lumpKept,
      ) &&
      readingOf(survey, 'empty').impacts.every(i => i.arrival <= BEATS)

    // D2, D3
    const neutralEffect = CONTENTS.filter(
      n =>
        at(`neutral${n}`).arrival !== empty.arrival ||
        touched(at(`neutral${n}`)),
    )
    const g2 = neutralEffect.length > 0
    const g3 = CONTENTS.every(n => {
      const a = at(`neutral${n}`)
      const f = at(`neutral${n}-flipped`)

      return (
        a.arrival === f.arrival &&
        a.mismatch.every((m, t) => m === f.mismatch[t])
      )
    })

    // D4
    const splitSeen = CONTENTS.filter(n => touched(at(`split${n}`)))
    const g4 = splitSeen.length > 0
    const status = !g1 || !g4 ? 'partial' : g2 && g3 ? 'pass' : 'fail'

    const metrics: Record<string, number> = {
      gate_D1: g1 ? 1 : 0,
      gate_D2: g2 ? 1 : 0,
      gate_D3: g3 ? 1 : 0,
      gate_D4: g4 ? 1 : 0,
      knitColumnRoots: KNIT_COLUMN_ROOTS,
      emptyArrival: empty.arrival,
      worstGauss: Math.max(...survey.readings.map(r => r.gauss)),
      closureRuns: survey.readings.filter(r => r.closure).length,
      lumpKeptRuns: survey.readings.filter(r => r.lumpKept).length,
      configurations: survey.readings.length,
      beatsRun: survey.beatsRun,
    }
    const notes: string[] = []

    for (const r of survey.readings) {
      const x = r.impacts[through]!
      const name = r.config.name
      const firstMismatch = x.mismatch.findIndex(m => m > 0)
      const farDiff = x.far.map((f, t) => f - empty.far[t]!)

      metrics[`arrival_${name}`] = x.arrival
      metrics[`delay_${name}`] = x.arrival - empty.arrival
      metrics[`mismatchTotal_${name}`] = x.mismatch.reduce(
        (a, b) => a + b,
        0,
      )
      metrics[`mismatchMax_${name}`] = Math.max(...x.mismatch)
      metrics[`firstMismatchBeat_${name}`] =
        firstMismatch < 0 ? BEATS + 1 : firstMismatch + 1
      metrics[`farDiffSum_${name}`] = farDiff.reduce((a, b) => a + b, 0)
      notes.push(
        `${name}: arrival ${x.arrival} (empty ${empty.arrival}), first mismatch beat ${firstMismatch < 0 ? 'none' : firstMismatch + 1}, mismatch per beat [${x.mismatch.join(' ')}], front reach minus empty per beat [${farDiff.join(' ')}]`,
      )
    }

    const splitEven = CONTENTS.map(n => {
      const a = at(`split${n}`)
      const f = at(`split${n}-flipped`)

      return (
        a.arrival === f.arrival &&
        a.mismatch.every((m, t) => m === f.mismatch[t])
      )
    })

    metrics.splitSignEven = splitEven.filter(Boolean).length
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a husk light front from (-3, 0, 0) through a lump at the origin to (3, 0, 0) (trit light, side 16, D 4, ${BEATS} beats): empty arrival ${empty.arrival}; neutral lumps N = ${CONTENTS.join(', ')} arrive at ${CONTENTS.map(n => at(`neutral${n}`).arrival).join(', ')} with ${CONTENTS.map(n => metrics[`mismatchTotal_neutral${n}`]).join(', ')} husk entries differing from the empty front over all beats; flipped neutral identical: ${g3}; split lumps (column sums not zero) arrive at ${CONTENTS.map(n => at(`split${n}`).arrival).join(', ')} with ${CONTENTS.map(n => metrics[`mismatchTotal_split${n}`]).join(', ')} entries differing; knit roots with no husk step ${KNIT_COLUMN_ROOTS} of 24`,
      metrics,
      control: {
        emptyArrival: empty.arrival,
        splitSeen: splitSeen.length,
      },
      notes: `L1 (D2, D3: an identity checked on the rule), L2 (the split control). Gates D1 ${g1}, D2 ${g2}, D3 ${g3}, D4 ${g4}. Neutral contents with any effect: [${neutralEffect.join(', ')}]; split contents seen: [${splitSeen.join(', ')}]; split lump equal to its flip (arrival and per-beat mismatch) at N = ${CONTENTS.join(', ')}: ${splitEven.join(', ')}. Per configuration at b = 0: ${notes.join('; ')}. Empty front reach per beat [${empty.far.join(' ')}]. Worst Gauss ${metrics.worstGauss}, closure on ${metrics.closureRuns} and lump kept on ${metrics.lumpKeptRuns} of ${survey.readings.length} configurations (all impacts). Knit roots with zero husk step: ${KNIT_COLUMN_ROOTS} of 24. Survey ${survey.seconds.toFixed(0)} s, ${survey.beatsRun} trit beats.`,
    })
  },
})
