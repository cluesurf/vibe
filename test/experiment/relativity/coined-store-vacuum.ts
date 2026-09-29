// The working vacuum with the coin on (E-RLT-0105): the no-veto two-point store under the pass contact, chosen
// 2026-09-26 with no C walls, run with the covariant coin of E-SPN-0090, 0091 composed in (the rule E-RLT-0104 builds and
// checks: code/rule/coined-locked-knit coinedVetoBeat, and on paths code/measure/occupation-veto-readings with `coin`
// on). E-RLT-0103's vacuum gates are read on it, and the question the choice was held on is asked as gates: the
// autonomy theorem (positions carry no amplitude) was proved without the coin, and the coin puts an open vibe on both
// slots of its line at once, so do positions carry amplitude again, and does the vacuum still hold?
//
// THE C-WALLS GATE IS DROPPED. E-RLT-0103's G7 (frozen C walls) is not read here: the user chose no walls and one C
// domain (solutions.md section 1, "Chosen (2026-09-26)"), since frozen domain walls are a liability. G1 to G6, W0, Q2 and
// Q3 are E-RLT-0103's, read the same way.
//
// WHAT IS PREDICTED, before any run:
//  - THE COIN ACTS ONLY ON AN OPEN VIBE ALONE ON ITS LINE. In the dense vacuum a vacuum vibe is never alone on a line
//    (tmp/cv-probe1: 0 coin splits over the like pair's 48 beats on integer+0), so the vacuum itself is untouched and
//    the like pair runs as it did in E-RLT-0103. A lone vibe is alone on its line, and the coin splits it at once
//    (tmp/cv-probe2).
//  - SO: the vacuum gates hold as in E-RLT-0103 under the pass (G1 to G6 on 51 of 51, Q2 and Q3 on 17), the keep path
//    being bit for bit the coinless one (E-RLT-0104 C1) and the Born and exchange paths differing only where a lone vibe
//    crosses. The lone wake stays on its line, since the coin hands a vibe to its own line's other slot.
//  - Q4a (the like pair's positions carry amplitude): predicted to FAIL, 1 occupation, since no coin acts on it.
//  - Q4b (a lone love's positions carry amplitude): predicted to hold, from the probe.
//  - Q7a (the like pair's keep term interferes): predicted as E-RLT-0103 read it under the pass, 2 of 17, so FAIL.
//  - Q7b (the lone love's keep term interferes): not predicted. The probe read the keep twin at the dephased weight
//    through beat 23 on integer+0, and the all-keep history of a walk is its light-cone edge, which one history reaches.
//
// Gates, fixed before this file's first run, pass contact, coin on, each on every start of E-MTH-0028's 17 and on each
// of the keep, Born-rate and exchange paths (thresholds 0, 49152, 65536 of the silver-rate key, which now choose the
// coin's keep or cross as well as the meeting's keep or exchange):
//  G1 laws: charge, count (vibes and two per stored unit) and the 4 components of occupation momentum unchanged at every
//     one of 96 beats (side 8)
//  G2 reversal: 96 inverse beats return the start exactly (vibes, points, stores, stored words)
//  G3 charge conjugation: the path run from the conjugate vacuum is the exact negative at every one of 96 beats
//  G4 one causal component: 24 center seeds, 24 beats, largest husk component count 1, all 512 husk docks reached,
//     every husk column reached by beat 12
//  G5 pair creation balanced: over 96 beats made = unmade and made >= the number of stored units
//  G6 bounded wake: 24 directions, love and fear, side 8, center anchor, 96 beats, the path's choices in both runs:
//     worst trits per 24-beat period at most 32, and 0 trits off the seed's line
//  W0 the wake reader, calibrated as E-RLT-0103 did (integer+0, keep path, lone contact, no coin, 48 seeds): the point
//     veto reads at most 32 with 0 off the line, the occupation veto more than 32
// and per start, side 4, the superposed rule (the vacuum's stored pairs closed, as E-RLT-0103's like study):
//  Q2 the like knot: E-RLT-0103's like pair (the rule's own first unequal-point like meeting of two vacuum vibes within
//     12 beats, run back to beat 0), 48 beats. At the first beat with a meeting split, the branches are grouped by
//     occupation and each group's two-vibe knot is read (code/measure/doublet-locked-readings registerKnot on the group,
//     its two open slots); every group with two or more Schmidt weights reads 3/4 and 1/4 (1e-12) and CHSH sqrt 7
//     (1e-9), and at least one group does. (With one occupation this is E-RLT-0103's Q2 exactly.)
//  Q3 the norm is exact at every beat of the like run and the exact inverse returns amplitude 1 on the start
//  Q4a positions carry amplitude, the like pair: its run's terms hold more than one occupation at beat 48
//  Q4b positions carry amplitude, a lone love: one open love at the vacuum's center, 16 beats: more than one occupation
//  Q7a the keep term interferes, the like pair: E-RLT-0103's Q7 with the coin's splits counted: at each of the first
//      three beats where the keep term (the branch with the coined keep path's points) meets, its weight is compared with
//      the dephased control (1/4)^m, m the unequal-point like meetings plus the coin splits the keep term has passed;
//      it interferes when some reading differs
//  Q7b the keep term interferes, the lone love: the same reading on the lone run, at the first three beats where its
//      keep term has a coin split or an unequal-point like meeting
// THE VACUUM HOLDS when W0 holds, G1 to G6 hold on all 51 (start, path) cases, and Q2, Q3 on all 17. Verdict: fail if
// the vacuum does not hold; pass if it holds and Q4a, Q4b, Q7a, Q7b hold on all 17; partial if it holds and some of
// Q4a, Q4b, Q7a, Q7b do not. PREDICTED: partial (Q4a and Q7a fail, Q4b holds, Q7b open).
// Reported, never gated: coin crosses per path; merged terms in the lone run; the keep-term readings.
//
// PROBES before this file, disclosed: tmp/cv-probe1 and tmp/cv-probe2 (integer+0, pass; above and in E-RLT-0104's
// header). No probe ran any G gate with the coin on.
//
// FIRST RUN (641 s, tmp/rlt105-run1.log): partial, as predicted, no gate moved. W0 holds (point veto 16 trits, 0 off
// the line; occupation veto 41,766). THE VACUUM HOLDS WITH THE COIN ON: G1 to G6 on 51 of 51 (made = unmade = 466,944,
// 0 free vibes, one causal component covered by beat 9, lone wake at most 15, 16 and 8 trits a period on the keep, Born
// and exchange paths, 0 off its line), Q2 17 (weights 3/4 and 1/4, CHSH 2.6458), Q3 17. The coin makes 0 crosses on
// every vacuum path: no vacuum vibe is ever alone on its line, so the vacuum's own history is untouched. POSITIONS
// CARRY AMPLITUDE ONLY WHERE A VIBE IS ALONE: the like pair 0 of 17 (1 occupation, 0 coin splits), a lone love 17 of 17
// (105 to 124 occupations at beat 16, up to 310 terms). THE KEEP TERM DOES NOT INTERFERE: the like pair 2 of 17 (the
// same 2 as E-RLT-0103 under the pass), the lone love 0 of 17 (1/4, 1/16, 1/64 at beats 0, 5, 15: the dephased value,
// with 0 merged terms in 16 beats on every start). Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; path choices are integer Weyl numbers of the key. The
// rule is exact in Z[w]; the Schmidt weights and CHSH are floats (measurement). Depth L2. Husk first: G4 is read on
// husk columns; the rest are bulk identities or counts that hold on every column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  boxHusk,
  causalRun,
  streamTarget,
} from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  lockedNorm,
  lockedState,
  newTally,
  norm,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  toWords,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import {
  coinedVetoBeat,
  coinedVetoBeatBack,
  newCoinTally,
} from '@/code/rule/coined-locked-knit'
import {
  laws,
  newPathTally,
  registerKnot,
  sameOccupation,
  samePoints,
  vacuumConfiguration,
  THRESHOLD_BORN,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
  type LockedFresh,
} from '@/code/measure/doublet-locked-readings'
import {
  contactFresh,
  likePairStart,
  vetoPathReplay,
  vetoPathRunner,
  vetoPathTrack,
  vetoPathWake,
} from '@/code/measure/occupation-veto-readings'

const SIDE = 8
const BEATS = 96
const CAUSAL_BEATS = 24
const DESCENT_BOUND = 12
const WAKE_BOUND = 32
const Q_SIDE = 4
const Q_BEATS = 48
const LONE_BEATS = 16
const SEARCH = 12
const KIND: VetoKind = 'none'
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const PATHS = [
  { name: 'keep', threshold: THRESHOLD_KEEP },
  { name: 'born', threshold: THRESHOLD_BORN },
  { name: 'exchange', threshold: THRESHOLD_EXCHANGE },
] as const

type PathName = (typeof PATHS)[number]['name']

const wordVacuum = (
  f: { cells: number; layout: Int8Array },
  store: Int8Array,
): Configuration =>
  toWords(
    vacuumConfiguration(
      { cells: f.cells, store, layout: f.layout },
      'all',
    ),
  )

// the lone wake of one veto on one path, all 24 directions, love and fear: worst per period [love, fear], off the line
function wakeOf(
  kind: VetoKind,
  g: LockedFresh,
  threshold: number,
  coin: boolean,
): { worst: number[][]; offLine: number } {
  const center = centerOf(SIDE)
  const vacuum = wordVacuum(g, g.store)
  const track = vetoPathTrack(
    kind,
    g.tables,
    vacuum,
    threshold,
    BEATS,
    coin,
  ).states
  const worst: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]

  let offLine = 0

  ;[1, -1].forEach((tone, k) => {
    for (let d = 0; d < 24; d++) {
      const w = vetoPathWake({
        kind,
        tables: g.tables,
        vacuum,
        track,
        seedSlot: center * 24 + d,
        tone,
        threshold,
        beats: BEATS,
        coin,
      })

      w.worst.forEach((x, p) => {
        worst[k]![p] = Math.max(worst[k]![p] ?? 0, x)
      })
      offLine += w.offLine
    }
  })

  return { worst, offLine }
}

type PathReading = {
  lawBreaks: number
  reverses: boolean
  cBreaks: number
  made: number
  unmade: number
  units: number
  freeLast: number
  crossed: number
  causalLargest: number
  descentMin: number
  coveredBy: number
  wakeWorst: number[][]
  wakeOffLine: number
}

function readPath(threshold: number): PathReading {
  const f = contactFresh(SIDE, 'pass')
  const vacuum = wordVacuum(f, f.store)
  const run = vetoPathRunner(KIND, f.tables, vacuum, threshold, 0, true)
  const crun = vetoPathRunner(
    KIND,
    f.tables,
    wordVacuum(
      f,
      Int8Array.from(f.store, v => -v),
    ),
    threshold,
    0,
    true,
  )
  const tally = newPathTally()
  const l0 = laws(vacuum)

  let lawBreaks = 0
  let cBreaks = 0
  let freeLast = 0

  for (let t = 0; t < BEATS; t++) {
    run.beat(tally)
    crun.beat()

    const s = run.state()
    const c = crun.state()
    const l = laws(s)

    let off = 0
    let free = 0

    lawBreaks += l.some((v, k) => v !== l0[k]) ? 1 : 0

    for (let i = 0; i < s.vibe.length; i++) {
      free += s.vibe[i] !== 0 ? 1 : 0

      if (
        s.vibe[i] !== -c.vibe[i]! ||
        (s.vibe[i] !== 0 && s.point[i] !== c.point[i])
      ) {
        off++
      }
    }

    for (let i = 0; i < s.store.length; i++) {
      if (
        s.store[i] !== -c.store[i]! ||
        (s.store[i] !== 0 && s.spoint[i] !== c.spoint[i])
      ) {
        off++
      }
    }

    cBreaks += off > 0 ? 1 : 0
    freeLast = free
  }

  const crossed = run.crossed()

  for (let t = 0; t < BEATS; t++) {
    run.back()
  }

  const back = run.state()

  let reverses = true

  for (let i = 0; i < back.vibe.length && reverses; i++) {
    reverses =
      back.vibe[i] === vacuum.vibe[i] &&
      (back.vibe[i] === 0 || back.point[i] === vacuum.point[i])
  }

  for (let i = 0; i < back.store.length && reverses; i++) {
    reverses =
      back.store[i] === vacuum.store[i] &&
      (back.store[i] === 0 || back.spoint[i] === vacuum.spoint[i])
  }

  let units = 0

  for (const v of f.store) {
    units += v !== 0 ? 1 : 0
  }

  // G4
  const husk = boxHusk(f.weave.mesh, SIDE)
  const target = streamTarget(f.weave.mesh)
  const center = centerOf(SIDE)

  let causalLargest = 0
  let descentMin = Number.POSITIVE_INFINITY
  let coveredBy = 0

  for (let d = 0; d < 24; d++) {
    const start = wordVacuum(f, f.store)

    start.vibe[center * 24 + d] = 1
    start.open[center * 24 + d] = 1

    const c = causalRun({
      replay: vetoPathReplay(KIND, f.tables, start, threshold, true),
      husk,
      target,
      beats: CAUSAL_BEATS,
      seedDock: center,
    })
    const first = new Int32Array(husk.columns).fill(-1)

    for (let x = 0; x < f.cells; x++) {
      const at = c.log.reachedAt[x]!
      const col = husk.column[x]!

      if (at >= 0 && (first[col] === -1 || at < first[col]!)) {
        first[col] = at
      }
    }

    causalLargest = Math.max(causalLargest, c.counts.husk)
    descentMin = Math.min(descentMin, c.counts.reachedHusk)
    coveredBy = Math.max(
      coveredBy,
      first.includes(-1)
        ? Number.POSITIVE_INFINITY
        : Math.max(...Array.from(first)),
    )
  }

  // G6
  const wake = wakeOf(
    KIND,
    contactFresh(SIDE, 'pass', center),
    threshold,
    true,
  )

  return {
    lawBreaks,
    reverses,
    cBreaks,
    made: tally.made,
    unmade: tally.unmade,
    units,
    freeLast,
    crossed,
    causalLargest,
    descentMin,
    coveredBy,
    wakeWorst: wake.worst,
    wakeOffLine: wake.offLine,
  }
}

// ---- the superposed runs: the like pair (Q2, Q3, Q4a, Q7a) and a lone love (Q4b, Q7b) ----

type Knot = { weights: number[]; chsh: number }
type Study = {
  found: boolean
  clean: boolean
  knots: Knot[]
  normExact: boolean
  reversed: boolean
  occupations: number
  branchesMax: number
  splits: number
  coinSplits: number
  merged: number
  readings: string[]
  differs: boolean
}

// the number of splits the keep term meets this beat: unequal-point like meetings of two open vibes, and lines of one
// open vibe and an empty slot (the coin)
function keepSplits(b: Configuration, cells: number): number {
  let n = 0

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + LINE_SECONDS[l]!
      const hi = b.vibe[i] !== 0
      const hj = b.vibe[j] !== 0

      if (
        hi &&
        hj &&
        b.vibe[i] === b.vibe[j] &&
        b.open[i] &&
        b.open[j] &&
        b.point[i] !== b.point[j]
      ) {
        n++
      }

      if (hi !== hj && ((hi && b.open[i]) || (hj && b.open[j]))) {
        n++
      }
    }
  }

  return n
}

// the knots at a beat: the branches grouped by occupation, each group's two-vibe knot on its two open slots
function knotsOf(s: LockedState): Knot[] {
  const groups: Branch[][] = []

  for (const b of s.branches) {
    const g = groups.find(o => sameOccupation(o[0]!, b))

    if (g) {
      g.push(b)
    } else {
      groups.push([b])
    }
  }

  const out: Knot[] = []

  for (const g of groups) {
    const open: number[] = []

    for (let i = 0; i < g[0]!.open.length; i++) {
      if (g[0]!.vibe[i] !== 0 && g[0]!.open[i]) {
        open.push(i)
      }
    }

    const k =
      open.length === 2
        ? registerKnot({ branches: g }, open[0]!, open[1]!)
        : undefined

    if (k) {
      out.push({ weights: k.weights, chsh: k.chsh })
    }
  }

  return out
}

function study(
  tables: LockedTables,
  f: LockedFresh,
  start: Configuration,
  clean: boolean,
  beats: number,
): Study {
  const tally = newTally()
  const coins = newCoinTally()
  // the keep term: the coined rule's classical keep path of this start (no exchange, no cross)
  const keep = vetoPathRunner(
    KIND,
    tables,
    start,
    THRESHOLD_KEEP,
    0,
    true,
  )

  let s: LockedState = lockedState(start)
  let normExact = true
  let branchesMax = 1
  let knots: Knot[] | undefined
  let keepReadings = 0
  let cumulative = 0

  const readings: string[] = []

  let differs = false

  for (let t = 0; t < beats; t++) {
    const before = tally.splitMeetings
    const twinPre = s.branches.find(b => samePoints(b, keep.state()))
    const onKeep = twinPre ? keepSplits(twinPre, f.cells) : 0

    s = coinedVetoBeat(KIND, tables, s, t, tally, coins)
    keep.beat()

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)

    if (!knots && tally.splitMeetings > before) {
      knots = knotsOf(s)
    }

    const twin = s.branches.find(b => samePoints(b, keep.state()))

    if (onKeep > 0 && keepReadings < 3) {
      keepReadings++
      cumulative += onKeep

      const w = twin ? norm(twin.a, twin.b) : 0n
      const k = twin ? twin.k : 0

      readings.push(
        `beat ${t}, m ${cumulative}: ${twin ? `${w}/4^${k}` : 'absent'}`,
      )

      if (
        !twin ||
        w * (1n << BigInt(2 * cumulative)) !== 1n << BigInt(2 * k)
      ) {
        differs = true
      }
    }
  }

  const occupations: Configuration[] = []

  for (const b of s.branches) {
    if (!occupations.some(o => sameOccupation(o, b))) {
      occupations.push(b)
    }
  }

  let back = s

  for (let t = beats - 1; t >= 0; t--) {
    back = coinedVetoBeatBack(KIND, tables, back, t)
  }

  const b0 = back.branches[0]
  const reversed =
    back.branches.length === 1 &&
    !!b0 &&
    b0.a === 1n &&
    b0.b === 0n &&
    b0.k === 0 &&
    samePoints(b0, start)

  return {
    found: true,
    clean,
    knots: knots ?? [],
    normExact,
    reversed,
    occupations: occupations.length,
    branchesMax,
    splits: tally.splitMeetings,
    coinSplits: coins.splits,
    merged: tally.merged,
    readings,
    differs,
  }
}

const missing: Study = {
  found: false,
  clean: false,
  knots: [],
  normExact: false,
  reversed: false,
  occupations: 0,
  branchesMax: 0,
  splits: 0,
  coinSplits: 0,
  merged: 0,
  readings: [],
  differs: false,
}

function likeStudy(f: LockedFresh): Study {
  const pick = likePairStart(
    KIND,
    f.tables,
    toWords(vacuumConfiguration(f, 'none')),
    SEARCH,
  )

  return pick
    ? study(f.tables, f, pick.start, pick.clean, Q_BEATS)
    : missing
}

function loneStudy(f: LockedFresh): Study {
  const start = toWords(vacuumConfiguration(f, 'none'))
  const slot = centerOf(Q_SIDE) * 24

  start.vibe[slot] = 1
  start.open[slot] = 1

  return study(f.tables, f, start, true, LONE_BEATS)
}

export default experiment({
  id: 'relativity/coined-store-vacuum',
  code: 'E-RLT-0105',
  title:
    'the working vacuum with the covariant coin on, partial: the no-veto two-point store under the pass (no C walls, the gate dropped by the no-walls choice) holds every vacuum gate (laws, reversal, C, one causal component, made = unmade = 466,944, a lone wake of at most 16 trits a period on its line, 51 of 51; the like knot sqrt 7 and the rule exact, 17 of 17), because no vacuum vibe is ever alone on its line and the coin crosses 0 times on every path; positions carry amplitude only for a vibe alone on its line (a lone love: 105 to 124 occupations by beat 16, 17 of 17; the like pair: 1 occupation, 0 of 17), and the keep term does not interfere (the lone love reads the dephased 1/4, 1/16, 1/64 on 17 of 17; the like pair 2 of 17)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)

    // W0, on integer+0 (the first start), keep path, center anchor, no coin: the reader against the known bounded and
    // melted wakes, exactly as E-RLT-0103
    const calibration = withStart(family[0]!, () => {
      const lone = contactFresh(SIDE, 'lone', centerOf(SIDE))

      return {
        point: wakeOf('point', lone, THRESHOLD_KEEP, false),
        occupation: wakeOf('occupation', lone, THRESHOLD_KEEP, false),
      }
    })
    const peak = (w: { worst: number[][] }): number =>
      Math.max(...w.worst.flat())
    const gW0 =
      peak(calibration.point) <= WAKE_BOUND &&
      calibration.point.offLine === 0 &&
      peak(calibration.occupation) > WAKE_BOUND

    log('W0')

    const perStart = family.map(member =>
      withStart(member, () => {
        const paths = Object.fromEntries(
          PATHS.map(p => [p.name, readPath(p.threshold)]),
        ) as Record<PathName, PathReading>
        const f4 = contactFresh(Q_SIDE, 'pass')
        const like = likeStudy(f4)
        const lone = loneStudy(f4)

        log(`start ${member.name}`)

        return { name: member.name, paths, like, lone }
      }),
    )

    const g = {
      G1: (r: PathReading) => r.lawBreaks === 0,
      G2: (r: PathReading) => r.reverses,
      G3: (r: PathReading) => r.cBreaks === 0,
      G4: (r: PathReading) =>
        r.causalLargest === 1 &&
        r.descentMin === 512 &&
        r.coveredBy <= DESCENT_BOUND,
      G5: (r: PathReading) => r.made === r.unmade && r.made >= r.units,
      G6: (r: PathReading) =>
        r.wakeOffLine === 0 &&
        r.wakeWorst.flat().every(x => x <= WAKE_BOUND),
    }
    const knotOk = (k: Knot): boolean =>
      k.weights.length === 2 &&
      Math.abs((k.weights[0] ?? 0) - 0.75) < 1e-12 &&
      Math.abs((k.weights[1] ?? 0) - 0.25) < 1e-12 &&
      Math.abs(k.chsh - Math.sqrt(7)) < 1e-9

    type P = (typeof perStart)[number]

    const q = {
      Q2: (p: P) =>
        p.like.found &&
        p.like.clean &&
        p.like.knots.some(k => k.weights.length >= 2) &&
        p.like.knots.filter(k => k.weights.length >= 2).every(knotOk),
      Q3: (p: P) =>
        p.like.found &&
        p.like.clean &&
        p.like.normExact &&
        p.like.reversed,
    }
    const a = {
      Q4a: (p: P) => p.like.found && p.like.occupations > 1,
      Q4b: (p: P) => p.lone.occupations > 1,
      Q7a: (p: P) => p.like.found && p.like.differs,
      Q7b: (p: P) => p.lone.differs,
    }
    const cases = (
      test: (r: PathReading) => boolean,
      path?: PathName,
    ): number =>
      perStart.reduce(
        (n, p) =>
          n +
          PATHS.filter(x => !path || x.name === path).filter(x =>
            test(p.paths[x.name]),
          ).length,
        0,
      )
    const count = (test: (p: P) => boolean): number =>
      perStart.filter(test).length
    const holds =
      gW0 &&
      Object.values(g).every(
        test => cases(test) === 3 * family.length,
      ) &&
      Object.values(q).every(test => count(test) === family.length)
    const answered = Object.values(a).every(
      test => count(test) === family.length,
    )
    const status = !holds ? 'fail' : answered ? 'pass' : 'partial'
    const range = (xs: number[]): string =>
      Math.min(...xs) === Math.max(...xs)
        ? `${Math.min(...xs)}`
        : `${Math.min(...xs)} to ${Math.max(...xs)}`
    const over = (
      name: PathName,
      f: (r: PathReading) => number,
    ): string => range(perStart.map(p => f(p.paths[name])))
    const metrics: Record<string, number> = {
      starts: family.length,
      gateW0: gW0 ? 1 : 0,
      vacuumHolds: holds ? 1 : 0,
      calibrationPointPeak: peak(calibration.point),
      calibrationPointOffLine: calibration.point.offLine,
      calibrationOccupationPeak: peak(calibration.occupation),
    }

    for (const [name, test] of Object.entries(g)) {
      for (const p of PATHS) {
        metrics[`${name}_${p.name}`] = cases(test, p.name)
      }
    }

    for (const [name, test] of Object.entries({ ...q, ...a })) {
      metrics[name] = count(test)
    }

    for (const p of PATHS) {
      metrics[`${p.name}_madeMax`] = Math.max(
        ...perStart.map(s => s.paths[p.name].made),
      )

      metrics[`${p.name}_unmadeMin`] = Math.min(
        ...perStart.map(s => s.paths[p.name].unmade),
      )

      metrics[`${p.name}_freeLastMax`] = Math.max(
        ...perStart.map(s => s.paths[p.name].freeLast),
      )

      metrics[`${p.name}_crossedMax`] = Math.max(
        ...perStart.map(s => s.paths[p.name].crossed),
      )

      metrics[`${p.name}_wakeWorstMax`] = Math.max(
        ...perStart.map(s =>
          Math.max(...s.paths[p.name].wakeWorst.flat()),
        ),
      )

      metrics[`${p.name}_wakeOffLineMax`] = Math.max(
        ...perStart.map(s => s.paths[p.name].wakeOffLine),
      )
    }

    metrics.likeChshMin = Math.min(
      ...perStart.map(p => Math.min(...p.like.knots.map(k => k.chsh))),
    )

    metrics.likeOccupationsMax = Math.max(
      ...perStart.map(p => p.like.occupations),
    )

    metrics.likeCoinSplitsMax = Math.max(
      ...perStart.map(p => p.like.coinSplits),
    )

    metrics.loneOccupationsMin = Math.min(
      ...perStart.map(p => p.lone.occupations),
    )

    metrics.loneBranchesMax = Math.max(
      ...perStart.map(p => p.lone.branchesMax),
    )
    metrics.seconds = (Date.now() - started) / 1000

    const pathLine = (name: PathName): string =>
      `${name}: laws broken ${over(name, r => r.lawBreaks)}, reverses on ${perStart.filter(p => p.paths[name].reverses).length}, C broken ${over(name, r => r.cBreaks)}; coin crosses ${over(name, r => r.crossed)}; made ${over(name, r => r.made)}, unmade ${over(name, r => r.unmade)}, units ${over(name, r => r.units)}; free vibes at beat 96 ${over(name, r => r.freeLast)}; causal largest ${over(name, r => r.causalLargest)}, descent ${over(name, r => r.descentMin)} of 512, covered by beat ${over(name, r => r.coveredBy)}; wake worst love ${JSON.stringify(perStart[0]!.paths[name].wakeWorst[0])} fear ${JSON.stringify(perStart[0]!.paths[name].wakeWorst[1])} (integer+0), max over starts ${over(name, r => Math.max(...r.wakeWorst.flat()))}, off line ${over(name, r => r.wakeOffLine)}`
    const studyLine = (which: 'like' | 'lone'): string =>
      `${which} per start (splits meeting/coin, merged, branches max, occupations, knots, readings): ${perStart.map(p => `${p.name} ${p[which].splits}/${p[which].coinSplits}, ${p[which].merged}, ${p[which].branchesMax}, ${p[which].occupations}, ${JSON.stringify(p[which].knots.map(k => [...k.weights.map(w => Math.round(w * 1e6) / 1e6), Math.round(k.chsh * 1e4) / 1e4]))}, [${p[which].readings.join('; ')}]`).join(' | ')}`

    return verdict({
      status,
      claim: `wake reader calibrated ${gW0} (point veto ${peak(calibration.point)} trits, ${calibration.point.offLine} off line; occupation veto ${peak(calibration.occupation)}); the vacuum holds ${holds} (G1 to G6 on ${Object.values(
        g,
      )
        .map(test => cases(test))
        .join(
          ', ',
        )} of ${3 * family.length}; knot sqrt 7 on ${count(q.Q2)}, exact on ${count(q.Q3)} of ${family.length}; C walls not read, by the no-walls choice); positions carry amplitude: like pair ${count(a.Q4a)}, lone love ${count(a.Q4b)} of ${family.length}; the keep term interferes: like pair ${count(a.Q7a)}, lone love ${count(a.Q7b)} of ${family.length}`,
      metrics,
      control: {
        calibrationPointPeak: peak(calibration.point),
        calibrationOccupationPeak: peak(calibration.occupation),
      },
      notes: `L2. Calibration (integer+0, keep, lone contact, no coin, 48 seeds): point veto ${JSON.stringify(calibration.point)}, occupation veto ${JSON.stringify(calibration.occupation)}. Gates (keep/born/exchange counts of 17): ${Object.keys(
        g,
      )
        .map(
          name =>
            `${name} ${PATHS.map(p => metrics[`${name}_${p.name}`]).join('/')}`,
        )
        .join(', ')}; ${Object.keys({ ...q, ...a })
        .map(name => `${name} ${metrics[name]}`)
        .join(
          ', ',
        )}. ${PATHS.map(p => pathLine(p.name)).join('. ')}. ${studyLine('like')}. ${studyLine('lone')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
