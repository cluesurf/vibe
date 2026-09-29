// DELAYED CHOICE AND THE ERASER ON THE RULE'S OWN GATES (E-QTM-0159). The ledger row "delayed choice and the eraser" (a
// later meeting deciding an earlier line's reading) was none. This file builds the quantum eraser from the rule's two
// splittings, read off the working rule bit for bit (code/measure/rule-gates), with the erasing choice made by a
// meeting that comes after the system's reading.
//
// THE CIRCUIT (every gate the rule's; the arrangement chosen here, which is what makes the result partial):
//  - a love A on the first slot of a line (direction R): the coin splits it, keep k on R, cross x on L (the beam splitter)
//  - on arm R, A shares its line with a love B: the line of two gives w U on the two points (the coin's determinant w,
//    then the meeting: keep k, exchange -x on unequal points, the phase w on equal ones). With A's point 0 and B's 1 the
//    exchange marks the arm: B holds 0 only if A passed on R. With equal points (0 and 0) it is a phase, no mark
//  - on arm L a phase w^j, j = 0, 1, 2 (on the rule: j equal-point partners on L's line give w^(2j), which covers all
//    three); three phases fix a fringe exactly, since P(phi) has harmonics 0 and 1 only
//  - the coin recombines, and A's direction is read: f = R or L (the system's reading)
//  - AFTER that reading, the choice: A and B meet once more (the line of two again, w U on their points), or not. Then
//    the points are read (the marker's reading)
//
// DERIVED, before this file's first run (tmp/qf-probe1):
//  - with no mark (equal points) the fringe's visibility is the interferometer's own, V0 (the coin is unbalanced, 1/4
//    against 3/4, so V0 < 1)
//  - with the mark and no second meeting, the arm-R marker state is w U|01> = -(1/2)|01> - ((1 + 2w)/2)|10> against
//    arm L's |01>: their overlap has size 1/2, so the unconditioned visibility drops below V0; and the reading "10" (B
//    holds A's point) comes from arm R alone, so its conditional visibility is 0
//  - the second meeting erases the mark: after it, arm R's marker is (w U)^2|01> = -(1/2)|01> + ((1 + 2w)/2)|10> and arm
//    L's is w U|01> = -(1/2)|01> - ((1 + 2w)/2)|10>. For each reading the two arms now carry EQUAL sizes (1/2 on 01, and
//    sqrt 3/2 on 10), so each conditional fringe has the full visibility V0 back, and the two differ by a sign on 10: a
//    fringe and an anti-fringe, which add up to the washed-out unconditioned pattern
//  - the choice changes nothing A reads: A's direction probabilities are exactly the same with and without the second
//    meeting (it acts on the points only, after A's reading). What it decides is which correlation the marker keeps
//  - (w U)^3 = I, so the marker's gate is a cube root of the identity: meeting once marks, twice erases, three times
//    undoes
//
// GATES, fixed before the first run:
//  G0 the three splittings read on the working rule (coin k, x; two unequal w k, -w x; two equal w^2) on 17 of 17 starts
//  E1 control, no mark (points 0, 0): A's visibility V0^2 for both readings f, and the second meeting changes nothing
//  E2 the mark (points 0, 1), no second meeting: the unconditioned visibility^2 < V0^2 for both f, and the reading 10 has
//     visibility 0 (one arm)
//  E3 the delayed erasure: with the second meeting after A's reading, both marker readings (01 and 10) give conditional
//     visibility^2 exactly V0^2 for both f, the two conditional fringes are opposite in phase (a difference of pi), and
//     their weighted sum equals the unconditioned pattern exactly
//  E4 no signal backward: A's direction probabilities P(f | j) are exactly equal with and without the second meeting,
//     at every j and f
//  E5 the marker gate cubes to the identity: (w U)^3 |01> = |01> exactly
// Verdict: fail if G0 or E1 fails; partial if every gate holds (the gates are the rule's, the schedule is arranged: no
// mesh configuration runs it on its own); fail if E2 to E5 fail.
//
// PROBES before this file, disclosed: tmp/qf-probe1 (the gates on integer+0 and golden; (w U)^n for n = 1, 2, 3; the
// erasing meeting's marker amplitudes: 01 R -1/2 L -1/2, 10 R (1 + 2w)/2 L -(1 + 2w)/2). tmp/qf-smoke-eraser.log ran
// this file as written with its placeholder title; the gates did not move after it.
//
// FIRST RUN (1.9 s, tmp/qf-exp-eraser-run1.log): partial as derived, every gate held, title written after the run.
// Visibility^2 on reading R: 9/25 unmarked, 9/100 marked (01 144/1369, 10 0), 9/25 and 9/25 erased with fringe phases
// pi and 0; on reading L: 1, 1/4 (01 16/25, 10 0), 1 and 1 erased with phases 0 and pi.
//
// DETERMINISM: no random number. Exact in Q(w); floats only in printed fringe phases. Depth L2: a quantum eraser (known
// physics) built from the rule's measured gates, with a no-mark control. Husk: the gates are read on one dock's line,
// which crosses one husk column. NOTHING MOVES: every gate is a take within one line of one dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { add, apply, armPhase, coinGate, dirOf, eq, float, gatesOnFamily, isZero, label, lineOfTwo, norm, pointsOf, show, start, visibility, weightWhere, ZERO, type Qw, type State } from '@/code/measure/rule-gates'

type Run = { withSecond: boolean; points: [number, number] }

// the circuit's final state for one phase setting
function circuit(run: Run, j: number): State {
  let s = start('R', run.points)

  s = apply(s, coinGate)
  s = apply(s, lineOfTwo(0, 1, 'R'))
  s = apply(s, armPhase('L', j))
  s = apply(s, coinGate)
  if (run.withSecond) s = apply(s, lineOfTwo(0, 1, null))

  return s
}

// P(f, marker reading) for every phase: marker reading null means traced
function pattern(run: Run, f: string, marker: string | null): Qw[] {
  return [0, 1, 2].map(j => weightWhere(circuit(run, j), l => dirOf(l) === f && (marker === null || pointsOf(l).join('') === marker)))
}

export default experiment({
  id: 'quantum/delayed-choice-eraser',
  code: 'E-QTM-0159',
  title:
    "delayed choice and the eraser on the rule's own gates, partial: a meeting on one arm marks it (visibility^2 9/25 -> 9/100 on reading R, 1 -> 1/4 on L); a second meeting of the two AFTER the love's direction is read erases the mark, both marker readings back to the full visibility^2 as a fringe and an anti-fringe, the love's own probabilities exactly unchanged by the later choice; the marker gate is a cube root of the identity, (w U)^3 = I; gates read bit for bit on 17 of 17 starts, the schedule arranged",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const gates = gatesOnFamily()
    const readings = ['01', '10']
    const dirs = ['R', 'L']
    const noMark: Run = { withSecond: false, points: [0, 0] }
    const noMarkSecond: Run = { withSecond: true, points: [0, 0] }
    const mark: Run = { withSecond: false, points: [0, 1] }
    const erase: Run = { withSecond: true, points: [0, 1] }
    const v0 = dirs.map(f => visibility(pattern(noMark, f, null)))
    const notes: string[] = []

    // E1
    const e1 = dirs.every((f, i) => {
      const a = pattern(noMark, f, null)
      const b = pattern(noMarkSecond, f, null)

      return a.every((x, j) => eq(x, b[j] as Qw)) && eq(visibility(b).v2, (v0[i] as { v2: Qw }).v2)
    })

    // E2
    let e2 = true

    dirs.forEach((f, i) => {
      const u = visibility(pattern(mark, f, null))
      const ten = visibility(pattern(mark, f, '10'))
      const one = visibility(pattern(mark, f, '01'))
      const smaller = (u.v2.a * (v0[i] as { v2: Qw }).v2.d) < ((v0[i] as { v2: Qw }).v2.a * u.v2.d)

      e2 &&= smaller && isZero(ten.v2)
      notes.push(`f ${f}: V0^2 ${show((v0[i] as { v2: Qw }).v2)}, marked unconditioned V^2 ${show(u.v2)}, marked 01 ${show(one.v2)}, marked 10 ${show(ten.v2)}`)
    })

    // E3
    let e3 = true

    dirs.forEach((f, i) => {
      const parts = readings.map(r => ({ r, p: pattern(erase, f, r) }))
      const whole = pattern(erase, f, null)
      const vis = parts.map(x => visibility(x.p))
      const sum = [0, 1, 2].map(j => add((parts[0] as { p: Qw[] }).p[j] as Qw, (parts[1] as { p: Qw[] }).p[j] as Qw))
      const opposite = Math.abs(Math.abs((vis[0] as { phase: number }).phase - (vis[1] as { phase: number }).phase) - Math.PI) < 1e-9

      e3 &&= vis.every(v => eq(v.v2, (v0[i] as { v2: Qw }).v2)) && opposite && sum.every((x, j) => eq(x, whole[j] as Qw))
      notes.push(`erased f ${f}: 01 V^2 ${show((vis[0] as { v2: Qw }).v2)} phase ${(vis[0] as { phase: number }).phase.toFixed(6)}, 10 V^2 ${show((vis[1] as { v2: Qw }).v2)} phase ${(vis[1] as { phase: number }).phase.toFixed(6)}, P(01) by phase ${(parts[0] as { p: Qw[] }).p.map(show).join(' ')}, P(10) by phase ${(parts[1] as { p: Qw[] }).p.map(show).join(' ')}`)
    })

    // E4
    const e4 = dirs.every(f => {
      const a = pattern(mark, f, null)
      const b = pattern(erase, f, null)

      return a.every((x, j) => eq(x, b[j] as Qw))
    })

    // E5
    let cube = start('-', [0, 1])

    for (let n = 0; n < 3; n++) cube = apply(cube, lineOfTwo(0, 1, null))

    const e5 = cube.size === 1 && eq(cube.get(label('-', [0, 1])) ?? ZERO, { a: 1n, b: 0n, d: 1n })

    const g = { G0: gates.passing === gates.of, E1: e1, E2: e2, E3: e3, E4: e4, E5: e5 }
    const status = !g.G0 || !g.E1 ? 'fail' : Object.values(g).every(Boolean) ? 'partial' : 'fail'
    const metrics: Record<string, number> = { startsReadingTheGates: gates.passing, starts: gates.of }

    for (const [k, v] of Object.entries(g)) metrics[`gate_${k}`] = v ? 1 : 0

    dirs.forEach((f, i) => {
      const read = (q: Qw): number => float(q).re

      metrics[`V0sq_${f}`] = read((v0[i] as { v2: Qw }).v2)
      metrics[`markedVsq_${f}`] = read(visibility(pattern(mark, f, null)).v2)
      metrics[`erased01Vsq_${f}`] = read(visibility(pattern(erase, f, '01')).v2)
      metrics[`erased10Vsq_${f}`] = read(visibility(pattern(erase, f, '10')).v2)
    })
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a quantum eraser from the working rule's own gates (read bit for bit on ${gates.passing} of ${gates.of} starts): a love's two arms, one shared with a second love, are marked by the meeting's point exchange, which drops the fringe's visibility^2 from ${metrics.V0sq_R?.toFixed(4)} to ${metrics.markedVsq_R?.toFixed(4)} (reading R); a SECOND meeting of the two, after the love's direction is read, erases the mark: each marker reading then shows the full visibility^2 ${metrics.erased01Vsq_R?.toFixed(4)} and ${metrics.erased10Vsq_R?.toFixed(4)}, as a fringe and an anti-fringe that sum to the washed-out pattern, while the love's own probabilities are exactly unchanged by the later choice; the marker gate is a cube root of the identity, (w U)^3 = I`,
      metrics,
      control: { noMarkVsqR: metrics.V0sq_R as number, noMarkUnchangedBySecondMeeting: e1 ? 1 : 0 },
      notes: `L2. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. Gates read: ${gates.read.join(' | ')}. ${notes.join('; ')}. The schedule is arranged (which arm meets B, and when the second meeting comes); every gate is the rule's. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
