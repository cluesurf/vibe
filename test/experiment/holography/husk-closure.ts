// IS THE HUSK CLOSED UNDER THE SUPERPOSED RULE? (E-HLG-0039, quantum-coverage 0025, OPEN-QTM-13). Physics is read on the
// 3d husk (the horosphere of one cusp of the {3,4,3,4} mesh) and the 4d bulk below it is raw experience. Every quantum
// result of the rule so far (E-QTM-0157, 0184 and the rest) ran on a flat D4 box or a husk box with no bulk under it,
// but every husk dock has 6 links on the husk and 18 down (E-FRC-0279), a lone love moved at most 1.207 along the husk
// while going 4 docks down (E-SPN-0157), and the least cut under a husk region is a volume (E-HLG-0038). This file
// explores whether the husk is closed under the rule: whether one vibe started on a husk dock keeps all its weight on
// husk docks.
//
// THE RULE: the rule's one-body sector, exact in Z[w][1/2] (code/measure/husk-closure oneBodyBeat). On a lone vibe the
// superposed rule (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', tables on the pass contact, the rule of
// E-QTM-0157 and E-QTM-0184) is the coin on the vibe's line, keep (1 + w)/2 and reverse (1 - w)/2, then the stream (the
// meetings and the collision leave a lone vibe alone): E-QTM-0157 gate E0 read it bit for bit against the fear walk,
// and E-QTM-0184 showed the rule covariant under all of W(F4), so every slot is alike. On trivial links (the cusp mesh
// carries no link field), the vibe's slot d streams into slot d of the dock across facet d, the antipodal labels of
// code/substrate/coxeter/label-transport, which close round every loop of the mesh.
//
// THE PATCH. The true labelled mesh below the cusp, grown on demand from a husk dock (code/measure/husk-closure
// buildLazyCuspMesh): the cusp quotient of E-HLG-0038 is a graph only (its cubic translations do not carry the labels,
// probe 1 read 174 to 1,950 broken label pairs on it), so a stream needs the true frames. A one-body run touches only
// the docks its weight reaches, so the cost is linear in docks and the patch is the whole mesh within the run's cone.
// Floors: a dock deeper than the floor (Busemann level above it) is outside the patch, and weight streaming into it is
// tallied as absorbed. The float frames hold dock identity and integer levels to a depth of about 9 docks (level about
// 10^6, both checked); deeper, the same sector is run on the line itself (lineWalk), exactly, with no floor at all.
//
// DERIVED BEFORE THE GATE RUN. A lone vibe only ever holds the two slots of its line (the coin acts inside the line,
// the stream keeps the slot), so its support is its mesh line, a straight chain of antipodal crossings: a geodesic.
// E-SPN-0156 found that a line meets the husk in at most 2 docks. The husk is the top layer (no dock lies above the
// cusp's horosphere), so a line through a husk dock goes down on both sides and, being a geodesic, never comes back up:
// the husk docks of the line are the start and at most one neighbour. On the line the walk is the fear walk, ballistic,
// whose chance on a fixed dock falls about as 1/t. So the husk weight is predicted to fall, about as 1/t, with weight
// coming back from the bulk part of the line on many beats, and no husk dock beyond the line's 2 ever reached. Down
// links cut, the walk is confined to the line's husk docks and keeps everything.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/hc-probe1.ts (test/record/E-HLG-0039/probe1.log): the cusp quotient's labels
// are not translation invariant (above). tmp/hc-probe3.ts (probe3.log): on the lazy mesh the 12 lines through the
// base husk dock read levels 1 then 3, 17, 99, 577 .. on both sides (6 lines, x (3 + 2 sqrt 2) a dock) or a second husk
// dock 1 unit away then 5, 29, 169, 985 .. (6 lines, the husk's 6 links); one run of slots 0, 3 and 12 read husk
// shares 0.25, 0.75, 0.61, 0.33, 0.50, 0.15 .. (slot 0), weight coming back on most beats, every husk reach at most 1.
// So the leak was seen before the gates; the gates, the controls, the floors and the long line run are new.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every link the runs built leads back across its facet (0 reciprocity misses) and every dock's level is
//     an integer to 1e-7 (0 off); one beat is exactly unitary on the 168 one-vibe basis states of the base dock and its
//     6 husk neighbours (every image norm 1, every pair orthogonal), open and with down links cut; every floor run keeps
//     patch weight plus absorbed weight exactly 1 at every beat.
//  I2 THE LINE LAW ON THE PATCH: at every beat of every run every weight lies on the start's line and its two slots,
//     and with no floor the patch run equals lineWalk bit for bit at beats 1 to 8 on all 24 start slots.
//  C1 CONTROL (a closed husk reads closed): down links cut (a vibe whose link leaves the husk turns round on its line),
//     the husk weight is exactly 1 at every beat 1 to 64 on all 24 starts.
//  F  FLOORS (floors 17, 129, 1,025, 8,193, 65,537, 524,289, 64 beats): every floor run equals lineWalk bit for bit at
//     every beat before its first absorption, on all 24 starts. The window (beats before the first absorption) is
//     reported per floor, and the largest husk-share difference from the no-floor line after it.
//  H  THE QUESTION: CLOSED if the husk share stays within 1e-12 of 1 at every beat on every start (the floor runs to 64
//     beats inside their windows and lineWalk to 1,024 beats); LEAKING if it falls. Read either way: the share per beat,
//     the share leaving per beat, the fitted power of the share's fall over beats 64 to 1,024, the weight coming back.
//  R  RETURN, read: weight streams from a bulk dock onto a husk dock at some beat.
//  A  ARRIVAL, read: the husk docks a vibe ever reaches (the husk light cone), against the strict cone of one dock a
//     beat: breadth-first graph distances on the cusp quotient (floors 17 and 33, which need no labels) from a husk dock
//     to husk docks at husk offsets (D, 0, 0) for D 1 to 12, (D, D, 0) for D 1 to 6, (D, D, D) for D 1 to 4, against
//     the husk-only distances D, 2D, 3D.
// VERDICT, fixed before the run: PASS (closed) when I1, I2, C1, F hold and H reads closed; FAIL (leaking) when I1, I2,
//  C1, F hold and H reads leaking; PARTIAL otherwise. PREDICTED: fail, leaking about as 1/t.
// WHAT THIS CAN AND CANNOT SHOW. One vibe, trivial links, every start slot of one husk dock (every husk dock is alike
//  under the cusp's translations, which carry lines to lines). Many vibes meet, and a meeting can move weight between
//  lines; this run says nothing of them. The line beyond depth 9 is not built: the no-floor reading past beat 8 rests on
//  the line law (I2) and on the geodesic argument that the line never comes back to the husk (checked to depth 9).
//
// FIRST RUN 2026-10-27 (test/record/E-HLG-0039/run1.log, 5 s): FAIL, leaking, as predicted; every gate as registered.
//  I1: 0 reciprocity misses, 0 off-integer levels over 337 docks (deepest level 6,625,109), the Gram exact on 168
//  states open and cut, weight plus absorbed exactly 1 on every floor run. I2: every state on its line, the floorless
//  patch equal to lineWalk bit for bit to beat 8 on 24 of 24. C1: share exactly 1 to beat 64 on 24 of 24 with down
//  links cut. F: every floor equal to the line until weight reaches it; the windows are 1, 2, 4, 5, 6, 7 beats at
//  floors 17, 129, 1,025, 8,193, 65,537, 524,289 (one beat a dock, the line going x (3 + 2 sqrt 2) a dock in level),
//  and after the window an absorbing floor moves the husk share by 0.14 to 0.43, so no floor stands in for the bulk.
//  H: the 12 lines through a husk dock are of two kinds, 6 with one husk neighbour (12 starts reach 2 husk docks) and 6
//  with none (12 starts reach 1); only one husk dock holds weight at any beat. The husk share reads 0.25, 0.75, 0.61,
//  0.33, 0.50, 0.15 at beats 1 to 6 (husk-ahead start), 0.0717 at 16, 0.0174 at 64, 0.00108 at 1,024, so t H(t) ->
//  1.103 on every class (fitted power -1.002, -0.998, -1.000); the start on a down line reads 0 on every odd beat. The
//  share leaving a beat averages 0.50 over beats 1 to 64. R: weight comes back from the bulk part of the line on 1,023
//  of 1,024 beats (512 on the down lines), 3.5 to 4.0 times the start's weight in all. A: graph distances below the
//  cusp at floors 17 and 33 equal the husk distances exactly (D, 2D, 3D on axis, face and body): a horizontal step at
//  level l is about 1/l, so the bulk under a husk offers no shortcut between husk docks. The vibe never reaches a husk
//  dock farther than 1 unit, through the bulk or along the husk, and with down links cut it never moves along the
//  husk either (the husk's cubic directions are not mesh lines: the control holds 2 docks).
//
// Depth L2: a coined walk's escape from a boundary, the known physics, read on the true mesh with a control.
// DETERMINISM: no start, no random number; exact Eisenstein weights, float frames checked.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  basisGram,
  buildLazyCuspMesh,
  huskGraphDistances,
  huskReading,
  lineCells,
  lineHuskWeight,
  lineWalkBeat,
  lineWalkStart,
  oneBodyBeat,
  oneVibe,
  onLine,
  sameAsLine,
  type LineWalkState,
  type OneBodyState,
} from '@/code/measure/husk-closure'
import { buildCuspQuotient } from '@/code/measure/cusp-green'

const SLOTS = 24
const BEATS = 64
const OPEN_BEATS = 8
const LINE_BEATS = 1024
const LINE_REACH = 9
const FLOORS = [17, 129, 1025, 8193, 65537, 524289]
const CLOSED_TOLERANCE = 1e-12
const FIT_FROM = 64
const CHECKPOINTS = [1, 2, 3, 4, 5, 6, 8, 16, 32, 64, 128, 256, 512, 1024]
const GRAPH_FLOORS = [17, 33]
const AXIS_REACH = 12
const FACE_REACH = 6
const BODY_REACH = 4

// a whole number over 4^t as a float
const share = (w: bigint, t: number): number =>
  Number((w * 10n ** 15n) / 4n ** BigInt(t)) / 1e15

type LineRun = {
  husk: number[]
  out: number[]
  back: number[]
  states: LineWalkState[]
}

function runLine(husk: ReadonlySet<number>): LineRun {
  let state = lineWalkStart(true)

  const out = [Number.NaN]
  const back = [Number.NaN]
  const shares = [share(lineHuskWeight({ state, husk }), 0)]
  const states = [state]

  for (let t = 1; t <= LINE_BEATS; t++) {
    const step = lineWalkBeat({ state, husk })

    state = step.state
    shares.push(share(lineHuskWeight({ state, husk }), t))
    out.push(share(step.flow.out, t))
    back.push(share(step.flow.back, t))

    if (t <= BEATS) {
      states.push(state)
    }
  }

  return { husk: shares, out, back, states }
}

// least squares slope of log y against log t over the beats with y > 0
function powerOf(series: readonly number[], from: number): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let t = from; t < series.length; t++) {
    if (series[t]! > 0) {
      xs.push(Math.log(t))
      ys.push(Math.log(series[t]!))
    }
  }

  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  let sxy = 0
  let sxx = 0

  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my)
    sxx += (xs[i]! - mx) ** 2
  }

  return sxy / sxx
}

export function huskClosureRun(): Verdict {
  const started = Date.now()
  const mesh = buildLazyCuspMesh()
  const metrics: Record<string, number> = {}
  const base = mesh.base
  const huskNeighbours = Array.from({ length: SLOTS }, (_, d) =>
    mesh.neighbour(base, d),
  ).filter(x => mesh.level(x) === 1)

  // the start's line, its husk positions, and whether its levels only grow off the husk
  const lines = Array.from({ length: SLOTS }, (_, slot) => {
    const line = lineCells({ mesh, dock: base, slot, reach: LINE_REACH })
    const husk = new Set(
      [...line].filter(([x]) => mesh.level(x) === 1).map(([, s]) => s),
    )
    const at = new Map([...line].map(([x, s]) => [s, x]))

    let monotone = true

    for (let s = 1; s < LINE_REACH; s++) {
      for (const sign of [1, -1]) {
        const a = mesh.level(at.get(sign * s)!)
        const b = mesh.level(at.get(sign * (s + 1))!)

        monotone &&= b > a
      }
    }

    return { line, husk, monotone, key: [...husk].sort().join(',') }
  })
  const lineRuns = new Map<string, LineRun>()

  for (const l of lines) {
    if (!lineRuns.has(l.key)) {
      lineRuns.set(l.key, runLine(l.husk))
    }
  }

  let onLineAll = true
  let openSame = true
  let floorSame = true
  let conserved = true
  let c1 = true
  let minShare = 1
  let maxHuskDocks = 0
  let maxEverHuskDocks = 0
  let maxReach = 0
  let controlHuskDocks = 0
  let controlReach = 0

  const windows = new Map<number, number>()
  const floorDifference = new Map<number, number>()

  for (const [slot, l] of lines.entries()) {
    const run = lineRuns.get(l.key)!
    const everHusk = new Set<number>()

    minShare = Math.min(minShare, ...run.husk.slice(1))

    // no floor, to the float frames' depth
    let state: OneBodyState = oneVibe({ dock: base, slot })

    for (let t = 1; t <= OPEN_BEATS; t++) {
      state = oneBodyBeat({
        mesh,
        state,
        mode: { form: 'open', floor: Number.POSITIVE_INFINITY },
      }).state
      onLineAll &&= onLine({ state, line: l.line, slot })
      openSame &&= sameAsLine({
        state,
        line: l.line,
        slot,
        walk: run.states[t]!,
      })
    }

    for (const floor of FLOORS) {
      let s: OneBodyState = oneVibe({ dock: base, slot })
      let absorbed = 0n
      let window = BEATS
      let difference = 0

      for (let t = 1; t <= BEATS; t++) {
        const step = oneBodyBeat({
          mesh,
          state: s,
          mode: { form: 'open', floor },
        })

        s = step.state
        absorbed = absorbed * 4n + step.flow.absorbed

        const r = huskReading({ mesh, state: s, start: base })

        conserved &&= r.total + absorbed === 4n ** BigInt(t)
        onLineAll &&= onLine({ state: s, line: l.line, slot })
        maxHuskDocks = Math.max(maxHuskDocks, r.huskDocks)
        maxReach = Math.max(maxReach, r.huskReach)
        r.huskDockIds.forEach(x => everHusk.add(x))

        if (absorbed === 0n) {
          floorSame &&= sameAsLine({
            state: s,
            line: l.line,
            slot,
            walk: run.states[t]!,
          })
          minShare = Math.min(minShare, share(r.husk, t))
        } else {
          window = Math.min(window, t - 1)
        }

        difference = Math.max(
          difference,
          Math.abs(share(r.husk, t) - run.husk[t]!),
        )
      }

      windows.set(floor, Math.min(windows.get(floor) ?? BEATS, window))
      floorDifference.set(
        floor,
        Math.max(floorDifference.get(floor) ?? 0, difference),
      )
    }

    // C1: down links cut
    let k: OneBodyState = oneVibe({ dock: base, slot })
    const controlHusk = new Set<number>()

    for (let t = 1; t <= BEATS; t++) {
      k = oneBodyBeat({ mesh, state: k, mode: { form: 'husk-only' } }).state

      const r = huskReading({ mesh, state: k, start: base })

      c1 &&= r.husk === 4n ** BigInt(t) && r.total === r.husk
      controlReach = Math.max(controlReach, r.huskReach)
      r.huskDockIds.forEach(x => controlHusk.add(x))
    }

    controlHuskDocks = Math.max(controlHuskDocks, controlHusk.size)
    maxEverHuskDocks = Math.max(maxEverHuskDocks, everHusk.size)
    metrics[`everHuskDocks_slot${slot}`] = everHusk.size
  }

  const docks = [base, ...huskNeighbours]
  const gramOpen = basisGram({
    mesh,
    docks,
    mode: { form: 'open', floor: Number.POSITIVE_INFINITY },
  })
  const gramCut = basisGram({ mesh, docks, mode: { form: 'husk-only' } })
  const health = mesh.health()
  const i1 =
    health.reciprocityMisses === 0 &&
    health.offInteger === 0 &&
    gramOpen.badNorms === 0 &&
    gramOpen.badPairs === 0 &&
    gramCut.badNorms === 0 &&
    gramCut.badPairs === 0 &&
    conserved
  const i2 = onLineAll && openSame
  const f = floorSame
  const monotone = lines.every(l => l.monotone)
  const closed = minShare >= 1 - CLOSED_TOLERANCE

  // the reading per line class
  const classes = [...lineRuns.entries()].map(([key, run]) => {
    const name =
      key === '0' ? 'down' : key === '0,1' ? 'huskAhead' : 'huskBehind'
    const leaving = run.out
      .slice(1, BEATS + 1)
      .map((o, i) => (run.husk[i]! > 0 ? o / run.husk[i]! : 0))
    const backTotal = run.back.slice(1).reduce((a, b) => a + b, 0)
    const backBeats = run.back.slice(1).filter(b => b > 0).length

    for (const t of CHECKPOINTS) {
      metrics[`${name}_share_t${t}`] = run.husk[t]!
    }

    metrics[`${name}_power`] = powerOf(run.husk, FIT_FROM)
    metrics[`${name}_tTimesShare_t1024`] = LINE_BEATS * run.husk[LINE_BEATS]!
    metrics[`${name}_meanLeavingPerBeat_to64`] =
      leaving.reduce((a, b) => a + b, 0) / leaving.length
    metrics[`${name}_backTotal`] = backTotal
    metrics[`${name}_backBeats`] = backBeats
    metrics[`${name}_starts`] = lines.filter(l => l.key === key).length

    return { name, run, backTotal, backBeats }
  })
  const returns = classes.some(c => c.backTotal > 0)

  // A: graph distances through the bulk against the husk
  const graph: Record<string, number[]> = {}

  for (const floor of GRAPH_FLOORS) {
    const q = buildCuspQuotient(floor)
    const axis = Array.from(
      { length: AXIS_REACH },
      (_, i) => [i + 1, 0, 0] as const,
    )
    const face = Array.from(
      { length: FACE_REACH },
      (_, i) => [i + 1, i + 1, 0] as const,
    )
    const body = Array.from(
      { length: BODY_REACH },
      (_, i) => [i + 1, i + 1, i + 1] as const,
    )
    const d = huskGraphDistances({
      quotient: q,
      low: [-2, -2, -2],
      high: [AXIS_REACH + 2, FACE_REACH + 2, BODY_REACH + 2],
      targets: [...axis, ...face, ...body],
    })

    graph[`axis_floor${floor}`] = d.slice(0, AXIS_REACH)
    graph[`face_floor${floor}`] = d.slice(AXIS_REACH, AXIS_REACH + FACE_REACH)
    graph[`body_floor${floor}`] = d.slice(AXIS_REACH + FACE_REACH)
  }

  const shortcut = Object.entries(graph).some(([name, row]) => {
    const per = name.startsWith('axis') ? 1 : name.startsWith('face') ? 2 : 3

    return row.some((v, i) => v >= 0 && v < per * (i + 1))
  })

  for (const [name, row] of Object.entries(graph)) {
    row.forEach((v, i) => {
      metrics[`graph_${name}_D${i + 1}`] = v
    })
  }

  const status =
    i1 && i2 && c1 && f ? (closed ? 'pass' : 'fail') : 'partial'
  const ahead = classes.find(c => c.name === 'huskAhead')!
  const down = classes.find(c => c.name === 'down')!
  const seconds = (Date.now() - started) / 1000

  for (const floor of FLOORS) {
    metrics[`window_floor${floor}`] = windows.get(floor)!
    metrics[`floorDifference_floor${floor}`] = floorDifference.get(floor)!
  }

  return verdict({
    status,
    claim: `${closed ? 'the husk is closed' : 'the husk is not closed, it leaks'} under the superposed rule: one vibe started on a husk dock of the true {3,4,3,4} mesh keeps its weight on its mesh line, which meets the husk in at most ${maxEverHuskDocks} docks (${maxHuskDocks} at a time, husk reach ${maxReach.toFixed(3)}), so the husk share falls as about ${metrics.huskAhead_tTimesShare_t1024!.toFixed(2)} / t (fitted power ${(metrics.huskAhead_power ?? Number.NaN).toFixed(2)}, ${ahead.run.husk[LINE_BEATS]!.toExponential(2)} at beat ${LINE_BEATS}) while weight comes back from the bulk part of the line on ${ahead.backBeats} of ${LINE_BEATS} beats; no far husk dock is ever reached, and the mesh below the cusp offers no shorter path between husk docks than the husk (${shortcut ? 'a shortcut was found' : 'graph distance equals husk distance'}); with down links cut the husk keeps all of it (${c1 ? 'the control' : 'control failed'}), and every floor agrees with the floorless line until weight reaches it`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_I2: i2 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_F: f ? 1 : 0,
      gate_closed: closed ? 1 : 0,
      read_returns: returns ? 1 : 0,
      read_monotoneOffHusk: monotone ? 1 : 0,
      read_bulkShortcut: shortcut ? 1 : 0,
      minShare,
      maxHuskDocks,
      maxEverHuskDocks,
      maxReach,
      controlHuskDocks,
      controlReach,
      reciprocityMisses: health.reciprocityMisses,
      offInteger: health.offInteger,
      deepestLevel: health.deepestLevel,
      meshDocks: mesh.size(),
      gramOpenBadNorms: gramOpen.badNorms,
      gramOpenBadPairs: gramOpen.badPairs,
      gramCutBadNorms: gramCut.badNorms,
      gramCutBadPairs: gramCut.badPairs,
      gramStates: gramOpen.states,
      ...metrics,
      seconds,
    },
    control: { huskOnlyClosed: c1 ? 1 : 0, huskOnlyDocks: controlHuskDocks },
    notes: `L2. Gates I1 ${i1}, I2 ${i2}, C1 ${c1}, F ${f}, closed ${closed}; returns ${returns}; lines grow off the husk ${monotone}; bulk shortcut ${shortcut}. Husk share, ahead class: ${CHECKPOINTS.map(t => `${t}: ${ahead.run.husk[t]!.toPrecision(4)}`).join(', ')}; down class: ${CHECKPOINTS.map(t => `${t}: ${down.run.husk[t]!.toPrecision(4)}`).join(', ')}. Floor windows ${FLOORS.map(fl => `${fl}: ${windows.get(fl)}`).join(', ')}; largest share difference after ${FLOORS.map(fl => `${fl}: ${floorDifference.get(fl)!.toExponential(2)}`).join(', ')}. Graph distances ${Object.entries(graph).map(([n, r]) => `${n} ${r.join(' ')}`).join('; ')}. ${seconds.toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'holography/husk-closure',
  code: 'E-HLG-0039',
  title:
    'explores whether the husk is closed under the superposed rule, fail (leaking, as derived): one vibe on a husk dock of the true {3,4,3,4} mesh below a cusp keeps its weight on its mesh line, which meets the husk in at most 2 docks, so the husk share falls as 1.103 / t (0.0174 at beat 64, 0.00108 at 1,024, fitted power -1.00) while weight streams back from the bulk on 1,023 of 1,024 beats; no husk dock beyond 1 unit is ever reached, and graph distances through the bulk equal the husk distances (no shortcut below a cusp); controls: down links cut keeps share exactly 1 on 24 of 24, every floor matches the floorless line until weight reaches it (windows 1 to 7 beats at floors 17 to 524,289) and moves the share by up to 0.43 after; exact in Z[w][1/2], unitary on 168 basis states',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskClosureRun()
  },
})
