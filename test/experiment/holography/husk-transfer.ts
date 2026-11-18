// DOES ANYTHING IN THE RULE CARRY CONTENT FROM ONE HUSK DOCK TO THE NEXT? (E-HLG-0042, quantum-coverage 0030,
// OPEN-QTM-13.) Physics is read on the 3d husk (the horosphere of one cusp of the {3,4,3,4} mesh). E-HLG-0039: every
// mesh line through a husk dock meets the husk in 1 or 2 docks and then goes down, so a lone vibe never moves along the
// husk. E-HLG-0040: a closed fear on every dock of a vibe's line (a fear stream) holds the vibe on the husk (13/16 or
// 9/16 exactly), two vibes on lines of one or two husk docks never interact, four on four lines of one dock fire the
// mixer K and move 0.24 of the weight onto other lines, and nothing moved more than 1 unit along the husk. K (the
// isometric map w_P of a dock holding two or more single lines, E-SPN-0157) is the rule's only line mixer. This file
// explores whether K, fired by vibes on several lines through NEIGHBORING husk docks held by fear streams, hands open
// weight from one husk dock to the next and on along the husk, and whether that weight stays on the husk.
//
// THE RULE: the full superposed rule (coin, meetings, pair move, the 'pass' collision with K, stream; veto 'none', every
// link the identity, exact in Z[w][1/2]), composed piece by piece in code/measure/husk-transfer transferBeat and
// checked bit for bit against code/rule/coined-locked-knit coinedVetoBeat on code/measure/husk-content growingPatch
// (gate I2). K OFF is code/measure/collective-modes lineLocalCollide: on a dock of two or more single lines only the
// full lines act and every single keeps its slot (E-SPN-0157's control).
//
// THE MESH: the true labelled mesh below one cusp (code/measure/husk-closure buildLazyCuspMesh), held as a compact
// patch of the docks that hold content (code/measure/husk-transfer compactPatch): every occupied slot's link is built
// before the stream, so there is no frontier above level lambda^E (lambda = 3 + 2 sqrt 2). Below it a vibe whose link
// is not built turns round; such a dock is more than E links from the husk when every link changes the level by at
// most lambda (read: linkRatio), so a turn reaches the husk no sooner than E beats later.
//
// THE SETUPS. A is the base husk dock, B its husk neighbour along A's first husk-link slot, C, D, E the next husk docks
// straight on (2, 3, 4 units from A). A love (open) starts at A on the A-B line moving toward B, with a closed fear on
// the opposite slot of every other dock of that line (E-HLG-0040's held vibe). A STREAM line carries a closed fear on
// the slot moving toward its first dock on every dock of the line, filled to positions -FILL..FILL. Setups:
//  wire   streams on B-C, C-D, D-E: a straight row of held lines.
//  plane  streams on every other husk link among the husk docks within 2 units of A in the plane of the first two husk
//         axes (15 lines).
//  box    the same within 2 units of A in 3d (35 lines).
//  loves  plane, with two more loves held on their own streams: at B on B-C (toward C) and at A on the link to A's
//         second-axis neighbour. Three open loves on lines through neighbouring husk docks.
// Each setup runs with K on and K off. Weight is the open vibes' Born weight (vibes plus open stored pairs); 'home' is
// the husk docks of the love lines; 'moved' is the open weight on husk docks outside home (handed to another husk
// dock); 'off line' is the open weight off every love line (husk or bulk); reach is the largest husk distance of open
// weight from the nearest love start dock.
//
// DERIVED BEFORE THE GATE RUN.
//  (a) A held love is a full line (love and fear) or a stored pair at almost every collision (E-HLG-0040: the stream
//      stores it at its dock every beat), so it is never a single. K acts on a dock only when two or more of its lines
//      are single; it then permutes the whole dock, a held love's full line included, onto other lines through the same
//      dock. So K can move a held love only to a line through the dock it is on, which meets the husk within 1 unit of
//      that dock. A second hop needs the love, once moved, to reach the next husk dock and be moved again there.
//  (b) With K off every piece acts inside one dock line (the line law, E-SPN-0098, E-SPN-0156), so a love never leaves
//      its line, the moved and off-line weights are 0, and each held love keeps 13/16 on the husk exactly.
//  (c) No prediction from (a) alone for whether a second hop happens: it depends on which lines are single when the
//      moved love sits on a new husk dock.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/hlg42-probe1.ts, tmp/hlg42-probe2.ts, logs test/record/E-HLG-0042/probe*.log).
//  The husk links of A run along +-x, +-y, +-z at unit distance. A wire of streams (B-C, C-D) fires K on fears only and
//  leaves the love at 13/16 as with K off (6 beats). A star of streams on A's and B's other links: K moves 0.75 of the
//  love off its line at beat 1, the husk share stays 13/16, no husk dock outside A and B (7 beats). Plane (fill 16, 16
//  beats): 0.75 off the line, husk share falls to about 0.245, open weight 0.18 on A's other x neighbour and 0.06 on
//  B, nothing beyond 1 unit. Box (fill 15, 14 beats): like the star. Loves (fill 15): branches 33,822 at beat 9 and 103
//  s, nearly doubling a beat, so its window is set to 10 beats with fill 11 here; to beat 9 moved 0.11, reach 1.
//  Pair setups (two loves on A-B and B-C only) were probed and dropped: with K off the second love's own line reaches
//  C, which reads as reach without any transfer. So H1 was seen in part (plane); the gates, the K off runs of plane,
//  box and loves, the window check runs and the bit-for-bit gate are new.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: the mesh reads 0 reciprocity misses and 0 off-integer levels; every link built changes the level by
//     at most lambda (1 + 1e-9); every branch of every run keeps the start's count and charge.
//  I2 THE COMPOSED BEAT IS THE RULE: transferBeat with K on equals growingPatch with coinedVetoBeat('none') bit for bit
//     (every configuration and its exact amplitude) at beats 1 to GATE_BEATS on the plane setup filled to GATE_FILL,
//     and K moves some vibe onto another line in that run.
//  I3 THE WINDOW IS EXACT: every main run (K on and off) has the same open weight on every husk dock, exactly, at
//     every beat of its window as the same run with fill and frontier one dock deeper.
//  C1 CONTROL, E-HLG-0040's held vibe exactly: on its line tube (code/measure/husk-content lineTube, coinedVetoBeat)
//     the open vibe's husk share is exactly 13/16 (husk-link line) and 9/16 (down line) at every beat 2 to 64; and on the
//     compact patch with transferBeat (K on and K off, equal bit for bit) exactly 13/16 and 9/16 at every beat 2 to
//     BEATS.
//  C2 CONTROL, K off: in every setup the open weight off the love lines and on husk docks outside home is 0 at every
//     beat, and the open husk share is exactly 13/16 at every beat 2 to the window's end.
//  KF K FIRES: every K-on run has K moving some vibe onto another line.
//  H1 HANDED ON: in some setup with K on, open weight sits on a husk dock outside home at some beat.
//  H2 CARRIED ALONG: in some setup with K on, open weight sits on a husk dock more than 1 unit from every love's start
//     dock at some beat of the window.
// VERDICT, fixed before the run: PASS when I1, I2, I3, C1, C2 and KF hold and H2 holds (something in the rule carries
//  content along the husk); FAIL when they hold and H2 fails; PARTIAL when one of them fails. PREDICTED: fail, with H1
//  holding (K hands weight to a neighbouring husk dock of the dock it acts on, and no further).
// READ, never gated: per setup and beat the open husk share, the moved weight (the transfer, and its rate: the moved
//  share at the window's end over the beats), the off-line weight and the share of it on the husk (does the moved
//  weight stay on the husk or drain into the bulk), the husk centroid along the A-B axis and the husk spread, the shadow
//  centroid (all open weight by horizontal position), K's firings and line moves.
// WHAT THIS CAN AND CANNOT SHOW. Windows: 14 beats (wire, plane, box) and 10 (loves), set by the stream's supply (a
//  fill of F docks feeds F beats) and by the float frames (dock identity checked to level about lambda^17.7 in
//  E-HLG-0040); the loves window by compute (the branches nearly double a beat). Never a shrunk parameter: the setups
//  were chosen so a hop takes 1 or 2 beats and a second hop would show inside the window. Trivial links, closed fear
//  streams from an unexplained supply, one cusp.
//
// GATE RUN 2026-10-27 (test/record/E-HLG-0042/run1.log, 398 s): FAIL, as predicted; every gate as registered, none
//  moved; title written after the run. I1: 0 reciprocity misses, 0 off-integer levels (deepest level 5.1e13), every
//  link ratio at most lambda, count and charge kept on every branch. I2: the composed beat equals coinedVetoBeat bit for
//  bit, 6 beats, K moving a vibe onto another line on 154 docks. I3: every run equals its one-dock-deeper twin exactly.
//  C1: 13/16 and 9/16 exactly (tube to 64, patch to 14, K on equal to K off). C2: K off moves nothing, 13/16 exactly.
//  KF: K moves vibes onto other lines in every K-on run (326 wire, 1,114 plane, 2,146 box, 498,052 loves dock events).
//  H1 HELD, H2 FAILED. wire: K acts on fears only, the love stays at 13/16, moved 0. box (60 lines): K takes 0.75 of the
//  love onto other lines at beat 1, all back on A and B, husk share 13/16, moved 0. plane (16 lines): 0.75 off the love
//  line, husk share 0.248 at beat 14 (against 13/16 with K off), moved 0.183 (first at beat 3, then flat: 0.141, 0.176,
//  0.183), all on A's other neighbour along the axis (centroid -0.49), reach 1.000; of the weight K moved off the line
//  only 0.248 is on the husk. loves (3 loves, 10 beats, 47,760 branches): moved 0.095 (first at beat 3), husk share
//  0.403, of the off-line weight 0.223 on the husk, reach 1.000. So K hands weight to a neighbouring husk dock of the
//  dock it acts on, once, at about 0.01 to 0.013 of the weight a beat averaged over the window, and the rest of what it
//  moves drains into the bulk; nothing reaches a husk dock 2 units away in 14 beats.
//
// Depth L2: a known mechanism (a collision that mixes channels, read as transport on a boundary), on the true mesh with
//  the rule's full beat, a K-off control and E-HLG-0040's held vibe reproduced.
// DETERMINISM: no random number; exact Eisenstein weights, float frames checked.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { buildLazyCuspMesh, type LazyCuspMesh } from '@/code/measure/husk-closure'
import {
  emptyConfiguration,
  growingPatch,
  huskContent,
  lineTube,
  placeOnLine,
  sameKeys,
} from '@/code/measure/husk-content'
import {
  aheadSlots,
  compactPatch,
  huskFractions,
  huskLinks,
  huskPositions,
  LAMBDA,
  meshKeys,
  newTransferTally,
  share,
  streamStart,
  transferBeat,
  transferReading,
  type StreamLine,
  type TransferReading,
} from '@/code/measure/husk-transfer'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { lockedState, type LockedState } from '@/code/rule/doublet-locked-knit'

const SLOTS = 24
const FILL = 15
const LEVEL_EXP = 16
const BEATS = FILL - 1
const LOVES_FILL = 11
const LOVES_EXP = 12
const LOVES_BEATS = LOVES_FILL - 1
const TUBE_BEATS = 64
const TUBE = 2 * TUBE_BEATS + 16
const GATE_FILL = 4
const GATE_BEATS = 6
const REACH = 1 + 1e-9

type Geometry = {
  A: number
  a: number
  B: number
  bc: number
  C: number
  cd: number
  D: number
  de: number
  down: number
  axis: number[]
}

function geometry(mesh: LazyCuspMesh): Geometry {
  const A = mesh.base
  const pos = mesh.position
  const dist = (x: number, y: number): number => Math.hypot(...pos(x).map((v, c) => v - pos(y)[c]!))
  const a = aheadSlots(mesh, A)[0]!
  const B = mesh.neighbour(A, a)
  const far = (from: number, prev: number): number =>
    aheadSlots(mesh, from)
      .filter(s => mesh.neighbour(from, s) !== prev)
      .sort((p, q) => dist(mesh.neighbour(from, q), A) - dist(mesh.neighbour(from, p), A))[0]!
  const bc = far(B, A)
  const C = mesh.neighbour(B, bc)
  const cd = far(C, B)
  const D = mesh.neighbour(C, cd)
  const de = far(D, C)
  const down = Array.from({ length: SLOTS }, (_, s) => s).find(s => huskPositions(mesh, A, s) === '0')!
  const raw = pos(B).map((v, c) => v - pos(A)[c]!)
  const n = Math.hypot(...raw)

  return { A, a, B, bc, C, cd, D, de, down, axis: raw.map(v => v / n) }
}

function setupLines(mesh: LazyCuspMesh, g: Geometry, name: string): StreamLine[] {
  const love: StreamLine = { dock: g.A, slot: g.a, love: true }

  if (name === 'wire') {
    return [
      love,
      { dock: g.B, slot: g.bc, love: false },
      { dock: g.C, slot: g.cd, love: false },
      { dock: g.D, slot: g.de, love: false },
    ]
  }

  const links = huskLinks({ mesh, center: g.A, radius: 2, plane: name !== 'box' })
  const is = (l: { dock: number; other: number }, x: number, y: number): boolean =>
    (l.dock === x && l.other === y) || (l.dock === y && l.other === x)
  const pos = mesh.position
  const second = aheadSlots(mesh, g.A).find(s => {
    const p = pos(mesh.neighbour(g.A, s))

    return Math.abs(p[1]! - pos(g.A)[1]! - 1) < 1e-6
  })!
  const Y = mesh.neighbour(g.A, second)
  const out: StreamLine[] = [love]

  for (const l of links) {
    if (is(l, g.A, g.B)) {
      continue
    }

    if (name === 'loves' && is(l, g.B, g.C)) {
      out.push({ dock: g.B, slot: g.bc, love: true })
    } else if (name === 'loves' && is(l, g.A, Y)) {
      out.push({ dock: g.A, slot: second, love: true })
    } else {
      out.push({ dock: l.dock, slot: l.slot, love: false })
    }
  }

  return out
}

type Run = {
  readings: TransferReading[]
  kDocks: number
  lineMoves: number
  linkRatio: number
  turns: number
  lines: number
  cells: number
  start: ReturnType<typeof streamStart>
}

function run(input: {
  mesh: LazyCuspMesh
  g: Geometry
  lines: readonly StreamLine[]
  fill: number
  exp: number
  beats: number
  kOff: boolean
}): Run {
  const { mesh, g, lines, fill, exp, beats, kOff } = input
  const patch = compactPatch(mesh, LAMBDA ** exp * (1 + 1e-9))
  const start = streamStart({ patch, lines, fill })
  const tally = newTransferTally()
  const readings: TransferReading[] = []

  let st: LockedState = lockedState(start.configuration)

  for (let t = 0; t < beats; t++) {
    st = transferBeat({ patch, state: st, beat: t, kOff, tally })
    readings.push(
      transferReading({
        state: st,
        dockOf: x => patch.docks[x]!,
        mesh,
        origin: mesh.position(g.A),
        axis: g.axis,
        starts: start.starts,
        home: start.home,
        startSlots: start.startSlots,
        count: start.count,
        charge: start.charge,
      }),
    )
  }

  return {
    readings,
    kDocks: tally.kDocks,
    lineMoves: tally.lineMoves,
    linkRatio: patch.linkRatio,
    turns: patch.turns,
    lines: lines.length,
    cells: patch.docks.length,
    start,
  }
}

const sameMaps = (x: ReadonlyMap<number, string>, y: ReadonlyMap<number, string>): boolean =>
  x.size === y.size && [...x].every(([k, v]) => y.get(k) === v)

// ---- C1: E-HLG-0040's held vibe on its tube ----

function tubeHeld(slot: number, husk: ReadonlySet<number>, sixteenths: bigint): boolean {
  const position = (i: number): number => (i <= TUBE / 2 ? i : i - TUBE)
  const tables = lineTube({ slot, length: TUBE })
  const c = emptyConfiguration(TUBE)
  const all = Array.from({ length: TUBE }, (_, i) => position(i))

  placeOnLine({
    configuration: c,
    dockAt: p => ((p % TUBE) + TUBE) % TUBE,
    slot,
    content: {
      vibes: [
        { position: 0, forward: true, value: 1, open: true },
        ...all.filter(p => p !== 0).map(p => ({ position: p, forward: false, value: -1 as const, open: false })),
      ],
      stores: [],
    },
  })

  let st: LockedState = lockedState(c)
  let ok = true

  for (let t = 1; t <= TUBE_BEATS; t++) {
    st = coinedVetoBeat('none', tables, st, t - 1)

    const h = huskContent({ state: st, isHusk: x => husk.has(position(x)), distance: () => 0, count: TUBE })

    if (t >= 2) {
      ok &&= h.openHusk * 16n === sixteenths * h.openTotal
    }
  }

  return ok
}

// ---- C1 on the compact patch: K on and off, equal bit for bit, exactly 13/16 or 9/16 ----

function patchHeld(mesh: LazyCuspMesh, g: Geometry, slot: number, sixteenths: bigint): boolean {
  const states: LockedState[][] = []
  const docks: number[][] = []
  let ok = true

  for (const kOff of [false, true]) {
    const patch = compactPatch(mesh, LAMBDA ** LEVEL_EXP * (1 + 1e-9))
    const start = streamStart({ patch, lines: [{ dock: g.A, slot, love: true }], fill: FILL })
    const seq: LockedState[] = []

    let st: LockedState = lockedState(start.configuration)

    for (let t = 0; t < BEATS; t++) {
      st = transferBeat({ patch, state: st, beat: t, kOff })
      seq.push(st)

      const r = transferReading({
        state: st,
        dockOf: x => patch.docks[x]!,
        mesh,
        origin: mesh.position(g.A),
        axis: g.axis,
        starts: start.starts,
        home: start.home,
        startSlots: start.startSlots,
        count: start.count,
        charge: start.charge,
      })

      if (t >= 1) {
        ok &&= r.openHusk * 16n === sixteenths * r.openTotal
      }

      ok &&= r.countKept && r.chargeKept
    }

    states.push(seq)
    docks.push(patch.docks)
  }

  for (let t = 0; t < BEATS; t++) {
    ok &&= sameKeys(
      meshKeys(states[0]![t]!, x => docks[0]![x]!),
      meshKeys(states[1]![t]!, x => docks[1]![x]!),
    )
  }

  return ok
}

// ---- I2: the composed beat against coinedVetoBeat on the growing patch ----

function composedIsRule(mesh: LazyCuspMesh, g: Geometry): { same: boolean; lineMoves: number } {
  const lines = setupLines(mesh, g, 'plane')
  const patch = compactPatch(mesh, Number.POSITIVE_INFINITY)
  const start = streamStart({ patch, lines, fill: GATE_FILL })
  const grow = growingPatch(mesh)
  const full = emptyConfiguration(mesh.size())

  for (let x = 0; x < patch.docks.length; x++) {
    for (let d = 0; d < SLOTS; d++) {
      full.vibe[patch.docks[x]! * SLOTS + d] = start.configuration.vibe[x * SLOTS + d]!
      full.open[patch.docks[x]! * SLOTS + d] = start.configuration.open[x * SLOTS + d]!
    }
  }

  const tally = newTransferTally()

  let sc: LockedState = lockedState(start.configuration)
  let sg: LockedState = lockedState(full)
  let same = true

  for (let t = 0; t < GATE_BEATS; t++) {
    sc = transferBeat({ patch, state: sc, beat: t, kOff: false, tally })
    sg = grow.beat(sg, t)
    same &&= sameKeys(meshKeys(sc, x => patch.docks[x]!), meshKeys(sg, x => x))
  }

  return { same, lineMoves: tally.lineMoves }
}

export function huskTransferRun(): Verdict {
  const started = Date.now()
  const mesh = buildLazyCuspMesh()
  const g = geometry(mesh)
  const metrics: Record<string, number> = {}
  const notes: string[] = []

  const gate = composedIsRule(mesh, g)
  const i2 = gate.same && gate.lineMoves > 0
  const c1 =
    tubeHeld(g.a, new Set([0, 1]), 13n) &&
    tubeHeld(g.down, new Set([0]), 9n) &&
    patchHeld(mesh, g, g.a, 13n) &&
    patchHeld(mesh, g, g.down, 9n)

  let i1 = true
  let i3 = true
  let c2 = true
  let kf = true
  let h1 = false
  let h2 = false

  for (const name of ['wire', 'plane', 'box', 'loves']) {
    const lines = setupLines(mesh, g, name)
    const loves = name === 'loves'
    const fill = loves ? LOVES_FILL : FILL
    const exp = loves ? LOVES_EXP : LEVEL_EXP
    const beats = loves ? LOVES_BEATS : BEATS
    const t0 = Date.now()

    for (const kOff of [false, true]) {
      const r = run({ mesh, g, lines, fill, exp, beats, kOff })
      const check = run({ mesh, g, lines, fill: fill + 1, exp: exp + 1, beats, kOff })
      const tag = `${name}_${kOff ? 'off' : 'on'}`

      for (let t = 0; t < beats; t++) {
        i3 &&= sameMaps(huskFractions(r.readings[t]!), huskFractions(check.readings[t]!))
      }

      for (const x of [r, check]) {
        i1 &&= x.readings.every(h => h.countKept && h.chargeKept) && x.linkRatio <= LAMBDA * (1 + 1e-9)
      }

      const husk = r.readings.map(h => share(h.openHusk, h.openTotal))
      const moved = r.readings.map(h => share(h.openMoved, h.openTotal))
      const off = r.readings.map(h => share(h.openOffLine, h.openTotal))
      const reach = Math.max(...r.readings.map(h => h.reach))
      const end = r.readings[beats - 1]!

      if (kOff) {
        c2 &&= r.readings.every(
          (h, t) => h.openMoved === 0n && h.openOffLine === 0n && (t === 0 || h.openHusk * 16n === 13n * h.openTotal),
        )
      } else {
        kf &&= r.lineMoves > 0
        h1 ||= r.readings.some(h => h.openMoved > 0n)
        h2 ||= reach > REACH
      }

      const firstMoved = moved.findIndex(m => m > 0)
      const offHusk = share(end.openOffLineHusk, end.openOffLine)

      metrics[`${tag}_lines`] = r.lines
      metrics[`${tag}_huskShareEnd`] = husk[beats - 1]!
      metrics[`${tag}_movedEnd`] = moved[beats - 1]!
      metrics[`${tag}_movedMax`] = Math.max(...moved)
      metrics[`${tag}_movedRatePerBeat`] = moved[beats - 1]! / beats
      metrics[`${tag}_firstMovedBeat`] = firstMoved < 0 ? -1 : firstMoved + 1
      metrics[`${tag}_offLineEnd`] = off[beats - 1]!
      metrics[`${tag}_offLineOnHuskEnd`] = offHusk
      metrics[`${tag}_reach`] = reach
      metrics[`${tag}_centroidEnd`] = end.centroid
      metrics[`${tag}_spreadEnd`] = end.spread
      metrics[`${tag}_shadowEnd`] = end.shadowCentroid
      metrics[`${tag}_kDocks`] = r.kDocks
      metrics[`${tag}_lineMoves`] = r.lineMoves
      metrics[`${tag}_branchesEnd`] = end.branches
      metrics[`${tag}_turns`] = r.turns
      notes.push(
        `${tag} (${r.lines} lines, ${beats} beats): husk ${husk.map(v => v.toFixed(4)).join(' ')}; moved ${moved.map(v => v.toFixed(4)).join(' ')}; off line ${off.map(v => v.toFixed(4)).join(' ')} (on the husk at the end ${Number.isNaN(offHusk) ? 'none' : offHusk.toFixed(4)}); centroid ${r.readings.map(h => h.centroid.toFixed(3)).join(' ')}; spread ${r.readings.map(h => h.spread.toFixed(3)).join(' ')}; shadow ${end.shadowCentroid.toFixed(3)}; reach ${reach.toFixed(3)}; K ${r.kDocks} docks, ${r.lineMoves} line moves; ${end.branches} branches; ${r.turns} frontier turns`,
      )
    }

    metrics[`${name}_seconds`] = (Date.now() - t0) / 1000
  }

  const health = mesh.health()

  i1 &&= health.reciprocityMisses === 0 && health.offInteger === 0

  const instruments = i1 && i2 && i3 && c1 && c2 && kf
  const status = instruments ? (h2 ? 'pass' : 'fail') : 'partial'
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `with fear streams holding vibes on lines through neighbouring husk docks of the true {3,4,3,4} mesh, K ${h1 ? 'hands open weight to a husk dock off the vibes\' own lines' : 'hands no open weight to another husk dock'} and ${h2 ? 'carries it beyond 1 unit along the husk' : 'carries nothing beyond 1 unit from a start dock'} within the window`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_I2: i2 ? 1 : 0,
      gate_I3: i3 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      gate_KF: kf ? 1 : 0,
      H1: h1 ? 1 : 0,
      H2: h2 ? 1 : 0,
      i2LineMoves: gate.lineMoves,
      reciprocityMisses: health.reciprocityMisses,
      offInteger: health.offInteger,
      deepestLevel: health.deepestLevel,
      meshDocks: mesh.size(),
      ...metrics,
      seconds,
    },
    control: { heldVibeExact: c1 ? 1 : 0, kOffMovesNothing: c2 ? 1 : 0 },
    notes: `L2. Gates I1 ${i1}, I2 ${i2}, I3 ${i3}, C1 ${c1}, C2 ${c2}, KF ${kf}; H1 ${h1}, H2 ${h2}. ${notes.join(' | ')}. ${seconds.toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'holography/husk-transfer',
  code: 'E-HLG-0042',
  title:
    'explores whether anything in the superposed rule carries content from one husk dock to the next on the true {3,4,3,4} mesh, fail: K fired by fear-held vibes on lines through neighbouring husk docks hands open weight once to a husk neighbour of the dock it acts on (0.18 in the plane of 16 streams, 0.09 with three held loves, first at beat 3, then flat) and carries nothing 2 units in 14 beats; of what K moves off the held line only 0.22 to 0.25 stays on the husk, the rest drains into the bulk (husk share 0.25 against 13/16 with K off); controls: K off moves nothing, E-HLG-0040 held vibe exact, composed beat equal to coinedVetoBeat bit for bit',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskTransferRun()
  },
})
