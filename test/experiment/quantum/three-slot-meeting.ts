// The three-slot meeting in the knit: the reflection through the frame direction (E-QTM-0134, the meeting
// that measures in E-QTM-0135) as a collision of three vibes in one dock of the color weave, and what it
// costs the knit's other laws.
//
// The rule is code/rule/three-slot-meeting: in every dock at beat t, the first three slots holding a vibe
// (scanning from slot t mod 24) meet when their signs are not all alike, and their role points move by R.
// The color weave's beat follows unchanged. The box and fill are E-QTM-0127 G8's: side-3 D4 box, bind table,
// a golden Weyl fill of loves and fears (a quarter of the slots), Weyl role points, 48 beats.
//
// On the classical layer a role point is one grid point, so R here is a deterministic permutation of three
// points: it measures nothing by itself (E-QTM-0135's measurement needs the apparatus opened on a line, a
// stand-in). What this experiment asks is whether the knit can carry such a meeting at all without breaking
// what it already keeps.
//
// Predictions, written before the first run: the step never changes a dock's weight W or color content Q
// (E-QTM-0134: B(A x, 1) = B(x, 1)); the vibes and the flow are the plain color weave's at every beat, since
// the step moves role points only; the beat reverses exactly; the step commutes with a frame change in every
// dock; it fires on a sizable share of dock-beats and changes points on most of them; about 8 in 9 fired
// triples have an axis (the odd token's point apart from both like tokens'). The SUM control breaks Q and
// the frame change.
//
// Gates, fixed before the first run:
//   G1 the ledger: over every dock-beat, (W, Q) unchanged by the step (0 docks changed), and at every beat
//      the vibes and the flow equal the plain color weave's (0 mismatches).
//   G2 reversal: 48 beats forward then 48 back return the start exactly (0 mismatches in vibe, role, flow).
//   G3 covariance: at every beat, a frame change in each dock (a golden Weyl choice of one of the 216 grid
//      moves, applied to all 24 role points of the dock) commutes with the step: 0 mismatched slots.
//   G4 it acts: it fires on at least one dock-beat and changes role points on at least one.
// Control, which must give NO:
//   C1 the SUM step changes (W, Q) on at least one dock-beat and fails the frame change on at least one slot.
// Readings: fires, knots left in place, short docks (fewer than three vibes), changed triples, triples with
// an axis, all per dock-beat.
//
// FIRST RUN (2026-09-26, 0.3 s): every gate and the control as fixed. 3,888 dock-beats (81 docks, 48
// beats): fires on 3,028 (0.779), leaves 860 knots of three in place, 0 short docks, moves points on 2,989.
// (W, Q) changed 0 times, vibes and flow 0 mismatches against the plain weave, reversal 0, frame 0. SUM:
// (W, Q) changed on 2,681 dock-beats, frame broken on 5,048 slots. One prediction was WRONG: triples with an
// axis (odd token apart from BOTH like tokens) are 0.793 of fired, not 8/9. The count asks two pairs to
// differ, (8/9)^2 = 0.790; the measurement needs only the odd token apart from its one apparatus partner.
//
// Depth L1: a construction shown to be carried by the knit with its laws intact, not a derivation. The husk
// is not read: the step acts on role points only; the box is the bulk D4 substrate.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave, colorBeat, cellColor } from '@/code/rule/color-weave'
import { type VibeState } from '@/code/rule/vibe-weave'
import { emptyStats, tripleBeat, tripleBeatBack, tripleStep, type TripleRule } from '@/code/rule/three-slot-meeting'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const BEATS = 48
const frac = (x: number): number => x - Math.floor(x)

export default experiment({
  id: 'quantum/three-slot-meeting',
  code: 'E-QTM-0136',
  title:
    'the three-slot meeting in the knit: the reflection through the frame direction, applied to three vibes of one dock that are not a knot, keeps every dock\'s weight and color content, leaves the vibes and the flow of the color weave untouched, reverses exactly and commutes with a frame change in every dock, where SUM breaks the color content and the frame',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: 3, table: 'bind' })
    const cells = weave.mesh.cellCount
    const slots = cells * 24
    const start: VibeState = {
      vibe: Int8Array.from({ length: slots }, (_, i) => (frac((i + 1) * GOLDEN) < 0.25 ? (frac((i + 1) * SILVER) < 0.5 ? 1 : -1) : 0)),
      role: Int8Array.from({ length: slots }, (_, i) => Math.floor(9 * frac((i + 3) * GOLDEN))),
      flow: new Int32Array(slots),
    }
    const moves = weave.moves
    const frameOf = (x: number, t: number): number => Math.floor(moves.act.length * frac((x + 1 + cells * t) * GOLDEN))
    const framed = (s: VibeState, t: number): Int8Array =>
      Int8Array.from(s.role, (p, i) => moves.act[frameOf(Math.floor(i / 24), t)]?.[p] ?? 0)

    const stats = emptyStats()
    const control = emptyStats()
    const counts = { dockBeats: 0, ledgerChanged: 0, plainMismatches: 0, frameMismatches: 0, sumLedgerChanged: 0, sumFrameMismatches: 0 }
    let state = start

    for (let t = 0; t < BEATS; t++) {
      const stepped = tripleStep({ weave, state, t, rule: 'reflection', stats })

      for (let x = 0; x < cells; x++) {
        const before = cellColor(weave, state.vibe, state.role, x)
        const after = cellColor(weave, stepped.vibe, stepped.role, x)

        counts.dockBeats++
        counts.ledgerChanged += before.every((c, i) => c === after[i]) ? 0 : 1
      }

      // the frame change commutes with the step, for each rule
      for (const rule of ['reflection', 'sum'] as TripleRule[]) {
        const direct = rule === 'reflection' ? stepped : tripleStep({ weave, state, t, rule, stats: control })
        const moved = framed(direct, t)
        const first = tripleStep({ weave, state: { vibe: state.vibe, role: framed(state, t), flow: state.flow }, t, rule })
        const bad = moved.reduce((s, p, i) => s + (p === first.role[i] ? 0 : 1), 0)

        if (rule === 'reflection') {
          counts.frameMismatches += bad
        } else {
          counts.sumFrameMismatches += bad

          for (let x = 0; x < cells; x++) {
            const before = cellColor(weave, state.vibe, state.role, x)
            const after = cellColor(weave, direct.vibe, direct.role, x)

            counts.sumLedgerChanged += before.every((c, i) => c === after[i]) ? 0 : 1
          }
        }
      }

      const next = tripleBeat(weave, state, t)
      const plain = colorBeat(weave, state, t)

      counts.plainMismatches += next.vibe.reduce((s, v, i) => s + (v === plain.vibe[i] ? 0 : 1), 0)
      counts.plainMismatches += next.flow.reduce((s, v, i) => s + (v === plain.flow[i] ? 0 : 1), 0)
      state = next
    }

    // reversal
    let back = state

    for (let t = BEATS - 1; t >= 0; t--) {
      back = tripleBeatBack(weave, back, t)
    }

    let reversalMismatches = 0

    for (let i = 0; i < slots; i++) {
      reversalMismatches += back.vibe[i] === start.vibe[i] ? 0 : 1
      reversalMismatches += back.role[i] === start.role[i] ? 0 : 1
      reversalMismatches += back.flow[i] === start.flow[i] ? 0 : 1
    }

    const gates = {
      G1: counts.ledgerChanged === 0 && counts.plainMismatches === 0,
      G2: reversalMismatches === 0,
      G3: counts.frameMismatches === 0,
      G4: stats.fired > 0 && stats.changed > 0,
      C1: counts.sumLedgerChanged > 0 && counts.sumFrameMismatches > 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the reflection through the frame direction as a three-slot collision of the color weave (side 3, ${BEATS} beats, ${counts.dockBeats} dock-beats): it fires on ${stats.fired} and moves points on ${stats.changed}, never changes a dock's weight or color content (${counts.ledgerChanged}), leaves the vibes and the flow exactly the plain weave's, reverses exactly (${reversalMismatches} mismatches) and commutes with a frame change in every dock (${counts.frameMismatches}); SUM in its place changes the color content in ${counts.sumLedgerChanged} dock-beats and breaks the frame on ${counts.sumFrameMismatches} slots`,
      metrics: {
        ...counts,
        reversalMismatches,
        fired: stats.fired,
        knotsLeft: stats.knots,
        shortDocks: stats.short,
        changedTriples: stats.changed,
        triplesWithAxis: stats.axis,
        firedShare: stats.fired / counts.dockBeats,
        axisShareOfFired: stats.axis / Math.max(1, stats.fired),
        sumFired: control.fired,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L1, exact integer arithmetic, golden and silver Weyl fills, no random numbers. On the classical layer R is a deterministic permutation of role points and measures nothing; the measurement of E-QTM-0135 needs the apparatus opened on a line (a stand-in). The triple is chosen from the vibes only, so the step is its own inverse.',
    })
  },
})
