// The honeycomb's own vacuum, found from the working rule (items vibe-roadmap-honeycomb-0002 and
// vibe-roadmap-board-0029, decision honeycomb/001). The box's working vacuum (E-RLT-0105) does not carry over: its store
// signs encode flat-box positions (tmp/union-store-class-probe.ts). So the candidates are read on the {3,4,3,4} ball
// itself (code/substrate/coxeter/exact-ball-mesh, the reflecting frontier) under the working rule: coinedVetoBeat 'none'
// on paths (code/measure/occupation-veto-readings vetoPathRunner, coin on, collision 'pass').
//
// THE GATES were fixed in board-0029's `what` (gate 9e09b0d036e8, 2026-11-13T21:32:01Z) before this file existed, and
// every probe runs through task/pre-register. They are restated here; the item's text is the one in force.
//
// CANDIDATES. V1 the empty mesh. V2 E-RLT-0105's store, not constructible here (counted as failing). V3 the love sea
// (every slot a love, open, point 0, no store; its lumps are holes). V4m, m = 0..15: the union store's held (class, line)
// keys with sign (-1)^popcount(c & m), c the dock's class mod 2 D4 relative to the base dock. V5m: every line held, the
// same signs.
//
// WHY A CLASS QUOTIENT IS EXACT. While no line holds exactly one vibe, no piece of the beat reads a point or a dock
// index for the occupation: the coin acts only on a lone open vibe, the like meeting exchanges points only, the 'none'
// pair move reads trits, and the dock collision reads the dock's own occupation. The class map k_a -> a mod 2 D4 is a
// homomorphism (E-GMT-0040, 0 conflicts), so an occupation that is a function of (class, line) evolves on the 16-dock
// Cayley graph of (Z/2)^4 (slot d of dock c streams to c XOR SLOT_CLASS[d]) exactly as on the infinite honeycomb, for as
// long as that run stays lone-free. A2 checks the ball's exact region against it, A3 runs it 96 beats.
//
// THE FRONTIER. A ball's frontier reflects (a slot facing out streams into its own dock's opposite slot), so the ball is
// the honeycomb only on E_t, the docks within R - t of the base after t beats. Every gate on the ball's dynamics is read
// there; the whole ball's numbers are reported.
//
// DETERMINISM: no random numbers; path choices are the integer Weyl key of (beat, dock, line). Exact integers; the
// entanglement reading is the one float. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  baseHub,
  classOf as boxClassOf,
  storeOfKind,
} from '@/code/measure/dense-hub'
import {
  lockedTables,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import {
  laws,
  lockedFresh,
  newPathTally,
  samePoints,
  vacuumConfiguration,
  THRESHOLD_BORN,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
} from '@/code/measure/doublet-locked-readings'
import { vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import {
  exactBallMesh,
  SLOT_CLASS,
  type ExactBallMesh,
} from '@/code/substrate/coxeter/exact-ball-mesh'

const FULL_RADIUS = 4
const LAW_RADIUS = 3
const LAW_BEATS = 96
const QUOTIENT_BEATS = 96
const WAKE_BOUND = 32
const SCRAMBLE_SHARE = 1 / 20
const TRITS_PER_DOCK = 36
const H_QUARTER = 0.811278
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const PATHS = [
  { name: 'keep', threshold: THRESHOLD_KEEP },
  { name: 'born', threshold: THRESHOLD_BORN },
  { name: 'exchange', threshold: THRESHOLD_EXCHANGE },
] as const

type PathName = (typeof PATHS)[number]['name']

type Candidate = {
  name: string
  kind: 'empty' | 'sea' | 'union' | 'full'
  mask: number
}

const CANDIDATES: Candidate[] = [
  { name: 'V1 empty', kind: 'empty', mask: 0 },
  { name: 'V3 love sea', kind: 'sea', mask: 0 },
  ...Array.from({ length: 16 }, (_, m) => ({
    name: `V4 union m${m}`,
    kind: 'union' as const,
    mask: m,
  })),
  ...Array.from({ length: 16 }, (_, m) => ({
    name: `V5 full m${m}`,
    kind: 'full' as const,
    mask: m,
  })),
]

const popcount = (v: number): number =>
  ((v >> 0) & 1) + ((v >> 1) & 1) + ((v >> 2) & 1) + ((v >> 3) & 1)

// the union store's held (class, line) keys, the class taken relative to the box hub (tmp/honeycomb-vacuum-check.ts)
function unionHeld(): Uint8Array {
  const side = 4
  const hub = baseHub(side, 0)
  const store = storeOfKind('union', side, hub)
  const held = new Uint8Array(16 * 12)

  for (let x = 0; x < side ** 4; x++) {
    const c = boxClassOf(x, side, hub)

    for (let l = 0; l < 12; l++) {
      if (store[x * 12 + l] !== 0) {
        held[c * 12 + l] = 1
      }
    }
  }

  return held
}

const HELD = unionHeld()
const BASE_CLASS = SLOT_CLASS[LINE_FIRSTS[0]!]!

// the store trit of line l on a dock of class k (relative to the base dock)
function storeTrit(cand: Candidate, k: number, l: number): number {
  if (cand.kind === 'empty' || cand.kind === 'sea') {
    return 0
  }

  if (cand.kind === 'union' && !HELD[(k ^ BASE_CLASS) * 12 + l]) {
    return 0
  }

  return popcount(k & cand.mask) % 2 === 0 ? 1 : -1
}

// the candidate's start on a mesh whose dock x has class classOf[x]
function startOf(
  cand: Candidate,
  cells: number,
  classOf: Uint8Array,
  layout: Int8Array,
): Configuration {
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      store[x * 12 + l] = storeTrit(cand, classOf[x]!, l)
    }
  }

  const c = toWords(vacuumConfiguration({ cells, store, layout }, 'all'))

  if (cand.kind === 'sea') {
    c.vibe.fill(1)
    c.open.fill(1)
    c.point.fill(0)
  }

  return c
}

// the 16-dock class quotient: slot d of dock c streams to dock c XOR SLOT_CLASS[d], identity links
function quotientTables(): LockedTables {
  const cells = 16
  const target = new Int32Array(cells * 24)
  const source = new Int32Array(cells * 24)
  const move = new Int8Array(cells * 24 * 9)
  const back = new Int8Array(cells * 24 * 9)

  for (let c = 0; c < cells; c++) {
    for (let d = 0; d < 24; d++) {
      const slot = c * 24 + d
      const to = (c ^ SLOT_CLASS[d]!) * 24 + d

      target[slot] = to
      source[to] = slot

      for (let p = 0; p < 9; p++) {
        move[slot * 9 + p] = p
        back[slot * 9 + p] = p
      }
    }
  }

  return {
    cells,
    collision: 'pass',
    veto: true,
    target,
    source,
    move,
    back,
  }
}

const QUOTIENT = quotientTables()
const QUOTIENT_CLASS = Uint8Array.from({ length: 16 }, (_, k) => k)

const cloneOccupation = (
  c: Configuration,
): { vibe: Int8Array; store: Int8Array } => ({
  vibe: Int8Array.from(c.vibe),
  store: Int8Array.from(c.store),
})

// lines holding exactly one vibe, on the given docks
function loneLines(c: Configuration, docks: readonly number[]): number {
  let n = 0

  for (const x of docks) {
    for (let l = 0; l < 12; l++) {
      const a = c.vibe[x * 24 + LINE_FIRSTS[l]!] !== 0
      const b = c.vibe[x * 24 + LINE_SECONDS[l]!] !== 0

      n += a !== b ? 1 : 0
    }
  }

  return n
}

// like meetings of unequal points on the given docks (where the superposed rule splits)
function unequalLike(c: Configuration, docks: readonly number[]): number {
  let n = 0

  for (const x of docks) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + LINE_SECONDS[l]!

      if (
        c.vibe[i] !== 0 &&
        c.vibe[i] === c.vibe[j] &&
        c.point[i] !== c.point[j]
      ) {
        n++
      }
    }
  }

  return n
}

// trits apart (vibe and store) on the given docks
function tritsOn(
  a: { vibe: Int8Array; store: Int8Array },
  b: { vibe: Int8Array; store: Int8Array },
  docks: readonly number[],
): number {
  let n = 0

  for (const x of docks) {
    for (let d = 0; d < 24; d++) {
      n += a.vibe[x * 24 + d] !== b.vibe[x * 24 + d] ? 1 : 0
    }

    for (let l = 0; l < 12; l++) {
      n += a.store[x * 12 + l] !== b.store[x * 12 + l] ? 1 : 0
    }
  }

  return n
}

// docks of the ball whose occupation differs from their class's quotient dock
function quotientDisagreements(
  c: { vibe: Int8Array; store: Int8Array },
  q: { vibe: Int8Array; store: Int8Array },
  classOf: Uint8Array,
  docks: readonly number[],
): number {
  let n = 0

  for (const x of docks) {
    const k = classOf[x]!

    let off = false

    for (let d = 0; d < 24 && !off; d++) {
      off = c.vibe[x * 24 + d] !== q.vibe[k * 24 + d]
    }

    for (let l = 0; l < 12 && !off; l++) {
      off = c.store[x * 12 + l] !== q.store[k * 12 + l]
    }

    n += off ? 1 : 0
  }

  return n
}

type Ball = {
  m: ExactBallMesh
  tables: LockedTables
  layout: Int8Array
  // E_t for t = 0..R, cone_t and cone_t AND E_t for t = 0..R
  exact: number[][]
  cone: number[][]
  coneExact: number[][]
  bijective: boolean
}

function ballOf(radius: number): Ball {
  const m = exactBallMesh({ radius })
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(m.cells * 12) })
  const tables = lockedTables(f.weave, 'pass')
  const seen = new Uint8Array(m.cells * 24)

  let bijective = true

  for (let i = 0; i < m.cells * 24; i++) {
    const t = tables.target[i]!

    bijective &&= seen[t] === 0 && tables.source[t] === i
    seen[t] = 1
  }

  const distance = m.ball.distance
  const exact: number[][] = []
  const cone: number[][] = []
  const coneExact: number[][] = []

  for (let t = 0; t <= radius; t++) {
    const e: number[] = []
    const c: number[] = []
    const ce: number[] = []

    for (let x = 0; x < m.cells; x++) {
      const r = distance[x]!

      if (r <= radius - t) {
        e.push(x)
      }

      if (r <= t) {
        c.push(x)
      }

      if (r <= radius - t && r <= t) {
        ce.push(x)
      }
    }

    exact.push(e)
    cone.push(c)
    coneExact.push(ce)
  }

  return { m, tables, layout: f.layout, exact, cone, coneExact, bijective }
}

type QuotientReading = {
  loneMax: number
  period: number
  made: number
  unmade: number
  units: number
  lawBreaks: number
  states: { vibe: Int8Array; store: Int8Array }[]
}

function readQuotient(cand: Candidate, threshold: number): QuotientReading {
  const start = startOf(cand, 16, QUOTIENT_CLASS, new Int8Array(16 * 12))
  const run = vetoPathRunner('none', QUOTIENT, start, threshold, 0, true)
  const tally = newPathTally()
  const l0 = laws(start)
  const all = Array.from({ length: 16 }, (_, k) => k)
  const states = [cloneOccupation(start)]

  let loneMax = loneLines(start, all)
  let period = 0
  let lawBreaks = 0

  for (let t = 1; t <= QUOTIENT_BEATS; t++) {
    run.beat(tally)

    const s = run.state()
    const l = laws(s)

    states.push(cloneOccupation(s))
    loneMax = Math.max(loneMax, loneLines(s, all))
    lawBreaks += l[0] !== l0[0] || l[1] !== l0[1] ? 1 : 0

    if (period === 0 && tritsOn(s, start, all) === 0) {
      period = t
    }
  }

  let units = 0

  for (const v of start.store) {
    units += v !== 0 ? 1 : 0
  }

  return {
    loneMax,
    period,
    made: tally.made,
    unmade: tally.unmade,
    units,
    lawBreaks,
    states,
  }
}

type LawReading = { lawBreaks: number; cBreaks: number; reverses: boolean }

function readLaws(cand: Candidate, b: Ball, threshold: number): LawReading {
  const start = startOf(cand, b.m.cells, b.m.classOf, b.layout)
  const conj = startOf(cand, b.m.cells, b.m.classOf, b.layout)

  for (let i = 0; i < conj.vibe.length; i++) {
    conj.vibe[i] = -conj.vibe[i]!
  }

  for (let i = 0; i < conj.store.length; i++) {
    conj.store[i] = -conj.store[i]!
  }

  const run = vetoPathRunner('none', b.tables, start, threshold, 0, true)
  const crun = vetoPathRunner('none', b.tables, conj, threshold, 0, true)
  const l0 = laws(start)

  let lawBreaks = 0
  let cBreaks = 0

  for (let t = 0; t < LAW_BEATS; t++) {
    run.beat()
    crun.beat()

    const s = run.state()
    const c = crun.state()
    const l = laws(s)

    lawBreaks += l[0] !== l0[0] || l[1] !== l0[1] ? 1 : 0

    let off = 0

    for (let i = 0; i < s.vibe.length && off === 0; i++) {
      off +=
        s.vibe[i] !== -c.vibe[i]! ||
        (s.vibe[i] !== 0 && s.point[i] !== c.point[i])
          ? 1
          : 0
    }

    for (let i = 0; i < s.store.length && off === 0; i++) {
      off +=
        s.store[i] !== -c.store[i]! ||
        (s.store[i] !== 0 && s.spoint[i] !== c.spoint[i])
          ? 1
          : 0
    }

    cBreaks += off > 0 ? 1 : 0
  }

  for (let t = 0; t < LAW_BEATS; t++) {
    run.back()
  }

  return { lawBreaks, cBreaks, reverses: samePoints(run.state(), start) }
}

type PathReading = {
  loneExact: number
  quotientOff: number
  crossedBall: number
  unequalExact: number[]
  firstSplit: number
  straddle: number[]
  quotient: QuotientReading
  laws: LawReading
  oneWorst: number
  lump3: number[]
  lump24: number[]
  lump3Ball: number
  lump24Ball: number
  oneBallWorst: number
}

// the start with a lump at the base dock: loves on empty slots, or holes on the love sea
function withLump(
  start: Configuration,
  cand: Candidate,
  slots: readonly number[],
  tone: number,
): Configuration {
  const c: Configuration = {
    vibe: Int8Array.from(start.vibe),
    point: Int8Array.from(start.point),
    open: Uint8Array.from(start.open),
    store: Int8Array.from(start.store),
    spoint: Int8Array.from(start.spoint),
    sopen: Uint8Array.from(start.sopen),
  }

  for (const d of slots) {
    if (cand.kind === 'sea') {
      c.vibe[d] = 0
      c.open[d] = 0
      c.point[d] = 0
    } else {
      c.vibe[d] = tone
      c.open[d] = 1
      c.point[d] = 0
    }
  }

  return c
}

function readPath(
  cand: Candidate,
  b: Ball,
  lawBall: Ball,
  threshold: number,
): PathReading {
  const R = b.m.radius
  const start = startOf(cand, b.m.cells, b.m.classOf, b.layout)
  const quotient = readQuotient(cand, threshold)
  const run = vetoPathRunner('none', b.tables, start, threshold, 0, true)
  const track = [cloneOccupation(start)]
  const unequalExact: number[] = []

  let loneExact = loneLines(start, b.exact[0]!)
  let quotientOff = 0
  let firstSplit = -1
  let straddle = [0, 0, 0, 0]

  for (let t = 0; t <= R; t++) {
    const s = run.state()

    if (t > 0) {
      loneExact += loneLines(s, b.exact[t]!)
      quotientOff += quotientDisagreements(
        s,
        quotient.states[t]!,
        b.m.classOf,
        b.exact[t]!,
      )
    }

    const u = unequalLike(s, b.exact[t]!)

    unequalExact.push(u)

    // the first splitting beat: each split meeting's two vibes after this beat's stream (a like full line passes)
    if (u > 0 && firstSplit < 0) {
      firstSplit = t
      straddle = [1, 2, 3, 4].map(w => {
        let n = 0

        for (const x of b.exact[t]!) {
          for (let l = 0; l < 12; l++) {
            const i = x * 24 + LINE_FIRSTS[l]!
            const j = x * 24 + LINE_SECONDS[l]!

            if (
              s.vibe[i] === 0 ||
              s.vibe[i] !== s.vibe[j] ||
              s.point[i] === s.point[j]
            ) {
              continue
            }

            const di = b.m.ball.distance[(b.tables.target[i]! / 24) | 0]!
            const dj = b.m.ball.distance[(b.tables.target[j]! / 24) | 0]!

            n += di <= w - 1 !== dj <= w - 1 ? 1 : 0
          }
        }

        return n
      })
    }

    if (t < R) {
      run.beat()
      track.push(cloneOccupation(run.state()))
    }
  }

  const crossedBall = run.crossed()

  // A5: one vibe on each base slot, love and fear (holes on the sea)
  const tones = cand.kind === 'sea' ? [1] : [1, -1]

  let oneWorst = 0
  let oneBallWorst = 0

  for (const tone of tones) {
    for (let d = 0; d < 24; d++) {
      const lone = vetoPathRunner(
        'none',
        b.tables,
        withLump(start, cand, [d], tone),
        threshold,
        0,
        true,
      )

      for (let t = 1; t <= R; t++) {
        lone.beat()
        oneWorst = Math.max(
          oneWorst,
          tritsOn(lone.state(), track[t]!, b.coneExact[t]!),
        )

        if (d === 0 && tone === 1) {
          oneBallWorst = Math.max(
            oneBallWorst,
            tritsOn(lone.state(), track[t]!, b.cone[t]!),
          )
        }
      }
    }
  }

  // A6: lumps of 3 and 24
  const lumpRun = (
    slots: readonly number[],
  ): { onCone: number[]; ball: number } => {
    const r = vetoPathRunner(
      'none',
      b.tables,
      withLump(start, cand, slots, 1),
      threshold,
      0,
      true,
    )
    const onCone: number[] = []

    let ball = 0

    for (let t = 1; t <= R; t++) {
      r.beat()

      const w = tritsOn(r.state(), track[t]!, b.cone[t]!)

      onCone.push(w)
      ball = Math.max(ball, w)
    }

    return { onCone, ball }
  }
  const lump3 = lumpRun([0, 1, 2])
  const lump24 = lumpRun(Array.from({ length: 24 }, (_, d) => d))

  return {
    loneExact,
    quotientOff,
    crossedBall,
    unequalExact,
    firstSplit,
    straddle,
    quotient,
    laws: readLaws(cand, lawBall, threshold),
    oneWorst,
    lump3: lump3.onCone,
    lump24: lump24.onCone,
    lump3Ball: lump3.ball,
    lump24Ball: lump24.ball,
    oneBallWorst,
  }
}

type CandidateReading = {
  cand: Candidate
  paths: Record<PathName, PathReading>
  gates: Record<string, boolean>
  qualifies: boolean
  chargePerDock: number
  countPerDock: number
  wakeScore: number
}

export function honeycombOwnVacuum(
  radius: number,
  log: (line: string) => void = () => {},
): Verdict {
  const started = Date.now()
  const b = ballOf(radius)
  const lawBall = radius > LAW_RADIUS ? ballOf(LAW_RADIUS) : b
  const half = Math.floor(radius / 2)
  const scrambleAt = (t: number): number =>
    SCRAMBLE_SHARE * TRITS_PER_DOCK * b.cone[t]!.length

  log(
    `ball R=${radius}: ${b.m.cells} docks, E_t sizes ${b.exact.map(e => e.length).join(', ')}, bijective ${b.bijective}, class conflicts ${b.m.classConflicts}`,
  )

  const readings: CandidateReading[] = CANDIDATES.map(cand => {
    const paths = Object.fromEntries(
      PATHS.map(p => [p.name, readPath(cand, b, lawBall, p.threshold)]),
    ) as Record<PathName, PathReading>
    const all = Object.values(paths)
    const gates = {
      A1: b.bijective,
      A2: all.every(p => p.loneExact === 0 && p.quotientOff === 0),
      A3: all.every(
        p =>
          p.quotient.loneMax === 0 &&
          p.quotient.period > 0 &&
          p.quotient.made === p.quotient.unmade &&
          p.quotient.made >= p.quotient.units &&
          p.quotient.lawBreaks === 0,
      ),
      A4: all.every(
        p => p.laws.lawBreaks === 0 && p.laws.cBreaks === 0 && p.laws.reverses,
      ),
      A5: all.every(p => p.oneWorst <= WAKE_BOUND),
      A6: all.every(p =>
        Array.from({ length: half }, (_, k) => k + 1).every(
          t =>
            p.lump3[t - 1]! <= scrambleAt(t) &&
            p.lump24[t - 1]! <= scrambleAt(t),
        ),
      ),
    }
    const start = startOf(cand, 16, QUOTIENT_CLASS, new Int8Array(16 * 12))
    const l = laws(start)
    const at = Math.max(half, 1) - 1
    const reading: CandidateReading = {
      cand,
      paths,
      gates,
      qualifies: Object.values(gates).every(Boolean),
      chargePerDock: l[0]! / 16,
      countPerDock: l[1]! / 16,
      wakeScore: all.reduce(
        (s, p) => s + p.oneWorst + (p.lump3[at] ?? 0) + (p.lump24[at] ?? 0),
        0,
      ),
    }

    log(
      `${cand.name}: ${JSON.stringify(gates)} charge/dock ${reading.chargePerDock} count/dock ${reading.countPerDock} wake score ${reading.wakeScore}; ${PATHS.map(p => {
        const r = paths[p.name]
        return `${p.name} lone(E) ${r.loneExact} quotOff ${r.quotientOff} crossed(ball) ${r.crossedBall} unequal(E) [${r.unequalExact.join(',')}] split@${r.firstSplit} straddle [${r.straddle.join(',')}] quotient lone ${r.quotient.loneMax} period ${r.quotient.period} made ${r.quotient.made}/${r.quotient.unmade} units ${r.quotient.units} laws ${r.laws.lawBreaks}/${r.laws.cBreaks}/${r.laws.reverses} one ${r.oneWorst} (ball ${r.oneBallWorst}) lump3 [${r.lump3.join(',')}] lump24 [${r.lump24.join(',')}]`
      }).join(' | ')} (${Math.round((Date.now() - started) / 1000)} s)`,
    )

    return reading
  })

  const index = (r: CandidateReading): number => CANDIDATES.indexOf(r.cand)
  const ranked = readings
    .filter(r => r.qualifies)
    .sort(
      (x, y) =>
        (x.chargePerDock === 0 ? 0 : 1) - (y.chargePerDock === 0 ? 0 : 1) ||
        x.wakeScore - y.wakeScore ||
        x.countPerDock - y.countPerDock ||
        index(x) - index(y),
    )
  const winner = ranked[0]
  const entanglement = (r: CandidateReading): string => {
    const k = r.paths.keep

    return k.firstSplit < 0 && k.loneExact === 0
      ? '0 on w = 1..4 (one branch)'
      : `first split at beat ${k.firstSplit}: ${k.straddle.map(n => (n * H_QUARTER).toFixed(3)).join(', ')} bits on w = 1..4`
  }
  const metrics: Record<string, number> = {
    radius,
    docks: b.m.cells,
    candidates: CANDIDATES.length + 1,
    qualifying: ranked.length,
    winnerIndex: winner ? index(winner) : -1,
    seconds: (Date.now() - started) / 1000,
  }

  for (const r of readings) {
    const key = r.cand.name.replace(/ /g, '_')

    metrics[`${key}_qualifies`] = r.qualifies ? 1 : 0
    metrics[`${key}_wakeScore`] = r.wakeScore
    metrics[`${key}_countPerDock`] = r.countPerDock
    metrics[`${key}_chargePerDock`] = r.chargePerDock
    metrics[`${key}_period`] = r.paths.keep.quotient.period
    metrics[`${key}_crossedBallMax`] = Math.max(
      ...PATHS.map(p => r.paths[p.name].crossedBall),
    )
  }

  const failing = readings
    .filter(r => !r.qualifies)
    .map(
      r =>
        `${r.cand.name} (${Object.entries(r.gates)
          .filter(([, ok]) => !ok)
          .map(([g]) => g)
          .join(', ')})`,
    )

  return verdict({
    status: winner ? 'pass' : 'fail',
    claim: winner
      ? `on the {3,4,3,4} ball at radius ${radius} under the working rule, ${ranked.length} of ${CANDIDATES.length + 1} vacuum candidates pass A1 to A6 and the winner by the registered order is ${winner.cand.name} (charge ${winner.chargePerDock} and count ${winner.countPerDock} a dock, wake score ${winner.wakeScore}, occupation period ${winner.paths.keep.quotient.period}); V2, E-RLT-0105's store, is not constructible here`
      : `on the {3,4,3,4} ball at radius ${radius} under the working rule no vacuum candidate passes A1 to A6`,
    metrics,
    notes: `L2. Gates: board-0029 what, gate 9e09b0d036e8. Qualifying in order: ${ranked.map(r => `${r.cand.name} (charge ${r.chargePerDock}, count ${r.countPerDock}, wake ${r.wakeScore}, entanglement ${entanglement(r)})`).join('; ')}. Failing: V2 (not constructible); ${failing.join('; ')}. Love sea entanglement: ${entanglement(readings[1]!)}. The ball is the honeycomb only on E_t; whole-ball wakes and coin crosses are reported in the log. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'relativity/honeycomb-own-vacuum',
  code: 'E-RLT-0121',
  title:
    "the honeycomb's own vacuum from the working rule, pass, winner the empty mesh: on the exact {3,4,3,4} ball at radius 4 (162,049 docks) under gates fixed before code, 34 of 35 candidates are lone-free orbits where the ball is exact (0 lone lines and 0 coin crosses on E_t, the class quotient matched dock for dock), keep the laws, C and 96 inverse beats, and stay unscrambled by 1, 3 and 24 vibes; every store that is a function of (class mod 2 D4, line) is such an orbit, period 4 (2 for the all-lines +1 store), made = unmade, one branch, entanglement 0; the love sea is one too but charged 24 a dock and splits 95,565 like meetings at beat 1; by the registered order (neutral, least lump wake 84 against 159 to 264, least density 0) the empty mesh wins; E-RLT-0105's store is not constructible here",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return honeycombOwnVacuum(FULL_RADIUS, line => console.error(line))
  },
})
