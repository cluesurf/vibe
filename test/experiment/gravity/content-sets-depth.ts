// "Mass makes the column deeper", the source (E-GRV-0071): is there an existing way in the model for content to set its
// column's depth, so that a lump makes the deeper patch E-GRV-0070's medium needs, with a deficit falling as 1/r and
// the same for the lump flipped?
//
// WHERE THE DEPTH ENTERS THE LIGHT (read off code/rule/trit-column, stated before the run). The trit light reads D in
// five places: the counter modulus q = 2D + 1 (the counter column's own range, D trits), the counter centering h = D,
// the field modulus N_B = 4D, the angle windows 4D and 2D (the angle column's length), and the potential window n_P D.
// Every one is fixed when the bulk is built (makeTritLight's `depth`, the period 2D of the D4 lattice along x4), and
// none reads the state. The vibes sit on bulk docks, a register disjoint from every angle, potential and counter
// trit; the one place content enters the light is the strings, through their column sums (E-GRV-0059: odd in charge).
// So the model as it is has no mechanism for content to set a column's depth. This file checks that on the rule,
// against the most direct candidate, rather than leaving it to the reading.
//
// THE CANDIDATE: "a column's depth grows with the content it carries": each column at D + k, k the number of vibes its
// bulk column holds (lump and partners). THE CHECK: E-GRV-0062's trit light, lumps and pulse (code/measure/depth-lump:
// side 16, D 4, wave form, neutral lumps of 2, 4 and 12 vibes at the husk origin with every column sum zero, each
// flipped, and no lump; the +x angle column at (-3, 0, 0) raised by 7; 36 beats) is run on the trit rule, and its husk
// angles are compared on every beat with two husk media (code/measure/varying-depth-light, the per-column husk rule
// of E-GRV-0070) started from the same husk read: (i) every column at D, and (ii) the candidate, D + k.
//
// Gates, fixed before the first run of this file:
//  S1 instrument: every configuration keeps 0 bulk and 0 husk Gauss violations on every beat and its lump where it
//     was placed; the empty configuration's trit husk angles equal medium (i)'s on every beat; and for every lump,
//     media (i) and (ii) differ on some beat (the candidate, if the rule followed it, would have been seen)
//  S2 content sets depth: for some lump, the trit rule's husk angles equal medium (ii)'s on every beat and differ
//     from medium (i)'s on some beat
//  S3 charge-blind: every flipped lump's trit husk angles equal its unflipped lump's on every beat
//  S4 a 1/r deficit: evaluated only if S2 holds (the depth deficit per shell around the lump against a / r); if S2
//     fails there is no deficit to read and S4 fails with it
// Verdict: partial if S1 fails, or if S2 holds (S4's reader is then needed and is not built); fail otherwise. This
// file cannot pass: a fail on S2 is the expected result, fixed here before the run, and it is the answer: no existing
// mechanism lets content set depth.
//
// THE SMALLEST CHANGE THAT WOULD (stated, not built): make each husk triangle's counter modulus a function of its
// column's content, q_P = 2 (D + k_P) + 1. It needs (a) a counter column longer than the bulk's depth wherever
// content sits, that is new trits per column, since a column of D trits holds only -D .. D, and (b) the boundary
// machinery of E-GRV-0070 (the wave form's spatial term at mixed q). Even then the depth changes only in the columns
// that hold content: the gate is contact local, like E-GRV-0060's occupancy gate, so outside a lump every column
// is at D, the deficit is 0 at every r > 0, and a ray passing beside it is not bent (E-GRV-0070's V5 reading for a
// sharp patch). A deficit falling as 1/r needs the depth to be sourced like a potential (a Poisson field sourced by
// |content|), which is a second, even field: the third candidate of the solutions note, not a reading of this one.
// The reverse candidate (content OCCUPIES depth, q_P = 2 (D - k_P) + 1) makes a lump's columns shallower and its light
// FASTER, a diverging lens, and at k = D leaves no column at all.
//
// DISCLOSED: no probe was run for this file. It reuses E-GRV-0062's placement, pulse and beats unchanged, and
// E-GRV-0070's medium, whose probes are disclosed there.
//
// FIRST RUN (tmp/grv0071-run1.log, 37 s): partial on S1, the instrument, recorded as is, no gate moved. Even the
// empty configuration did not follow the fixed-depth medium, so neither medium matched any lump (0 of 7 each), while
// the lumps' trit husk angles differed from the empty's at 0 entries on every beat and every flip matched its lump.
// Diagnosis after the run (tmp/grv71-diag.ts, disclosed): huskLightBeat and fastBeat on the bulk's own husk geometry
// equal the trit rule on 12 of 12 beats; fastBeat and the medium on the TILED geometry of code/rule/trit-husk depart
// from beat 4 (21 entries, 820 by beat 12), since the tiling orients some triangles the other way and the field's
// seam at -N_B / 2 is not symmetric (a pulse of 7 at D = 4 reaches it). INSTRUMENT REPLACED for the second run: both
// media are built on the bulk's own geometry (geometryOfBulk); the gates are unchanged.
// SECOND RUN (tmp/grv0071-run2.log, 27 s, the record): fail on S2 (and S4, not reached), as fixed before the run.
// S1 and S3 hold: Gauss 0 on every beat, every lump kept, the empty configuration follows the fixed-depth medium,
// and the candidate departs from it from beat 10 (N = 2, 4) and beat 6 (N = 12), so the check could see it. The trit
// rule follows the fixed-depth medium on 7 of 7 configurations and the candidate (columns at D + their vibe count,
// up to D 8) on none of the six lumps; every lump's husk angles equal the empty's at every entry on every beat, and
// every flip equals its lump. Title written after the run.
//
// Depth: L1 (an identity of the rule, checked on the rule against a named alternative that the check can see).
// DETERMINISM: every configuration is placed; nothing is drawn. NOTHING MOVES: the light takes its column values by
// the rule; the trit light never reads or moves a vibe.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BEATS } from '@/code/measure/depth-lump'
import { sourceSurvey } from '@/code/measure/varying-depth-light'

export default experiment({
  id: 'gravity/content-sets-depth',
  code: 'E-GRV-0071',
  title:
    'content does not set its column depth in the model as it is, fail on S2: every depth parameter of the trit light (q = 2D + 1, h = D, N_B = 4D, the angle and potential windows) is fixed when the bulk is built and reads no state, and on the trit light (side 16, D 4, 36 beats) a pulse crossing neutral lumps of 2, 4 and 12 vibes follows the fixed-depth husk rule on 7 of 7 configurations and the content-deepened candidate (each column at D + its vibe count, up to D 8) on none of 6 lumps, though the candidate departs from the fixed rule by beat 6 to 10; lump and flip leave the light identical to the empty run at every entry, so there is no deeper patch and no deficit to fall as 1/r; the smallest change that would (q_P = 2 (D + k_P) + 1) needs new trits per column and is contact local, so it gives a sharp patch with no 1/r tail; a 1/r deficit needs a second, even field',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const survey = sourceSurvey(what => console.error(what))
    const readings = survey.readings
    const empty = readings.find(r => r.config.form === 'empty')!
    const lumps = readings.filter(r => r.config.form !== 'empty')

    const g1 = readings.every(r => r.gauss === 0 && r.lumpKept) && empty.followsFixed && lumps.every(r => r.candidateSeenAt <= BEATS)
    const g2 = lumps.some(r => r.followsCandidate && !r.followsFixed)
    const g3 = lumps.filter(r => r.config.flip).every(r => r.sameAsUnflipped === true)
    // S4 is read only if S2 holds, and its reader is not built (the closure of E-GRV-0062 makes S2 fail unless the
    // closure itself fails): if S2 holds the verdict is partial, never pass
    const g4 = false
    const status = !g1 || g2 ? 'partial' : 'fail'

    const metrics: Record<string, number> = {
      gate_S1: g1 ? 1 : 0,
      gate_S2: g2 ? 1 : 0,
      gate_S3: g3 ? 1 : 0,
      gate_S4: g4 ? 1 : 0,
      configurations: readings.length,
      followFixed: readings.filter(r => r.followsFixed).length,
      followCandidate: readings.filter(r => r.followsCandidate).length,
      worstGauss: Math.max(...readings.map(r => r.gauss)),
      seconds: survey.seconds,
    }

    for (const r of readings) {
      const name = r.config.name

      metrics[`followsFixed_${name}`] = r.followsFixed ? 1 : 0
      metrics[`followsCandidate_${name}`] = r.followsCandidate ? 1 : 0
      metrics[`candidateSeenAt_${name}`] = r.candidateSeenAt
      metrics[`candidateDepth_${name}`] = r.candidateDepth
      metrics[`contentColumns_${name}`] = r.contentColumns
      metrics[`mismatchTotal_${name}`] = r.mismatch.reduce((a, b) => a + b, 0)
    }

    return verdict({
      status,
      claim: `on the trit light (side 16, D 4, ${BEATS} beats) with a pulse crossing neutral lumps of 2, 4 and 12 vibes, the rule's husk angles follow the fixed-depth husk rule on ${metrics.followFixed} of ${readings.length} configurations and the content-deepened candidate (each column at D + its vibe count, up to D ${Math.max(...lumps.map(r => r.candidateDepth))}) on ${metrics.followCandidate}, although the candidate differs from the fixed rule from beat ${Math.min(...lumps.map(r => r.candidateSeenAt))}; flipped lumps identical: ${g3}; so content sets no column's depth and there is no deficit to fall as 1/r`,
      metrics,
      control: {
        emptyFollowsFixed: empty.followsFixed ? 1 : 0,
        candidateSeen: lumps.filter(r => r.candidateSeenAt <= BEATS).length,
      },
      notes: `L1. Gates S1 ${g1}, S2 ${g2}, S3 ${g3}, S4 ${g4} (S4 not reached: it needs S2). Per configuration: ${readings
        .map(
          r =>
            `${r.config.name}: follows fixed ${r.followsFixed}, follows candidate ${r.followsCandidate}, candidate seen at beat ${r.candidateSeenAt}, content columns ${r.contentColumns}, candidate depth up to ${r.candidateDepth}, angle entries differing from the empty over all beats ${r.mismatch.reduce((a, b) => a + b, 0)}, gauss ${r.gauss}, lump kept ${r.lumpKept}${r.sameAsUnflipped === undefined ? '' : `, same as unflipped ${r.sameAsUnflipped}`}`,
        )
        .join('; ')}. Survey ${survey.seconds.toFixed(0)} s.`,
    })
  },
})
