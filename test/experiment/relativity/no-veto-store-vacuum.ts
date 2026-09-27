// The coset-union vacuum on the no-veto two-point store, under the bounce and the pass contacts (E-RLT-0103): E-RLT-0101's
// vacuum gates (E-RLT-0098's three paths) and its like study, rerun on the rule built and checked as E-RLT-0102 (code/rule/
// occupation-veto-knit, kind 'none'), once with the knit's own like contact ('lone', the bounce, u = -1) and once with
// E-SPN-0092's pass (u = +1), which E-SPN-0093 needs for the electron.
//
// WHAT IS PREDICTED, before any run:
//  - ONE OCCUPATION HISTORY ON EVERY TERM, both contacts (E-RLT-0102 N5, the autonomy theorem). So every gate that reads
//    occupation (laws, pair creation, the wake, the walls, the causal union) reads the same number on the keep, Born and
//    exchange paths. What is left to measure is whether that one classical history IS a vacuum: balanced, a lone vibe's
//    wake confined to its line, the C walls frozen.
//  - LONE CONTACT: from tmp/ov-probe4 (integer+0 only, disclosed), balanced (466,944 made and unmade over 96 beats) and a
//    lone wake of 13 to 15 trits on its line. Predicted to hold on every start. The walls were not probed.
//  - PASS CONTACT: not probed. The pass differs from the bounce on 47 of 48 beats of the old classical vacuum
//    (E-SPN-0092); whether the no-veto vacuum survives it is the question. No prediction is made for the pass beyond the
//    theorem's (one history on every path).
//  - Positions carry no amplitude under either contact (the theorem's price). The like knot is the meeting's, so sqrt 7;
//    norm and reversal are exact by construction.
//
// Gates, fixed before this file's first run, each read per contact on every start of E-MTH-0028's 17 and on each of the
// keep, Born-rate and exchange paths (thresholds 0, 49152, 65536 of the silver-rate key), exactly as E-RLT-0101 reads them:
//  G1 laws: charge, count (vibes and two per stored unit) and the 4 components of occupation momentum unchanged at every
//     one of 96 beats (side 8)
//  G2 reversal: 96 inverse beats return the start exactly (vibes, points, stores, stored words)
//  G3 charge conjugation: the path run from the conjugate vacuum is the exact negative at every one of 96 beats
//  G4 one causal component: E-RLT-0093 G1a as E-RLT-0098 K4 reads it (24 center seeds, 24 beats, largest husk component
//     count 1, all 512 husk docks reached, every husk column reached by beat 12)
//  G5 pair creation balanced: over 96 beats made = unmade and made >= the number of stored units
//  G6 bounded wake: E-RLT-0084's B6 with the path's choices in both runs (24 directions, love and fear, side 8, center
//     anchor, 96 beats): worst trits per 24-beat period at most 32 (twice the old 15 to 16), and 0 trits off the seed's
//     line
//  G7 frozen C walls: E-RLT-0095's charge-conjugation coset read by the B' reader along the path (side 12, beats 72 to
//     192, windows of 6): departure only beside the interface, never growing
//  W0 the wake reader, calibrated (integer+0, keep path, lone contact, the same 48 seeds): under the point veto (the old
//     knit, whose wake is 13 to 16) it reads at most 32 with 0 off the line, and under the occupation veto (E-RLT-0101's
//     melt) it reads more than 32. Without W0 a G6 pass or fail means nothing
// and per contact on every start (side 4, the like study of E-RLT-0099 on this rule: the rule's own first like meeting of
// two vacuum vibes with unequal points within 12 beats, found by running its classical history back, those two opened,
// 48 beats):
//  Q2 at the first split the two-vibe knot has Schmidt weights 3/4 and 1/4 (1e-12) and CHSH sqrt 7 (1e-9)
//  Q3 the norm is exact at every beat and the exact inverse returns amplitude 1 on the start
// A contact KEEPS THE VACUUM when G1 to G7 hold on all 51 (start, path) cases and Q2, Q3 on all 17. Verdict: fail if W0
// fails (the instrument is not calibrated); otherwise pass if both contacts keep the vacuum, partial if exactly one
// does, fail if neither. PREDICTED: pass for 'lone'; 'pass' not predicted.
// Reported, never gated: Q4 (the number of distinct occupations among the terms, predicted 1: positions carry no
// amplitude) and Q7 (the keep term's weight after its first three meetings against the dephased (1/4)^m); the point
// veto's wake under the pass contact (a reference for the reader there); per-path counts.
//
// PROBES before this file, disclosed: tmp/ov-probe3 (the reader under the point veto, integer+0, 4 directions: 13 to 15
// trits, 0 off the line; under the occupation veto 12, 16, 97, 126 ... in eight beats), tmp/ov-probe4 (the lead above),
// tmp/nv-probe1 (timing of E-RLT-0102's dock checks). No probe ran the pass contact on the no-veto vacuum.
//
// FIRST RUN (1,155 s, tmp/rlt103-run1.log): fail, no gate moved, on G7 alone and under BOTH contacts. W0 holds (point
// veto 15 to 16 trits, 0 off the line; occupation veto 41,766). Lone and pass alike: G1 to G6 on 51 of 51 (made =
// unmade = 466,944, 0 free vibes, one causal component covered by beat 9, the lone wake 13, 14, 15, 15 trits a period
// on every path and start, 0 off its line), Q2 17 (sqrt 7, weights 3/4 and 1/4), Q3 17; G7 on 0 of 51 (1,152 of 1,728
// husk columns outside, the departure "frozen" only because it already covers the box). Reported: Q4 0 (one occupation
// among the terms, 17 of 17, both contacts: positions carry no amplitude); Q7 17 under lone (1/4, 1/16, 1/16; 31/64 on
// integer+11) and 2 under pass (1/4, 1/16, 1/64 on 15 starts, the dephased value). The point veto under the pass reads
// a wake of about 40,000 trits (its classical vacuum is unbalanced, E-RLT-0102). Diagnosis after the run, a disclosed
// probe (tmp/nv-probe2, integer+0, keep path): with no veto the planted C wall departs from its own vacuum on the 1,728
// interface docks at beat 1 and on 12,096, 14,526, 18,306 ... 20,736 of 20,736 docks by beat 12, identically under
// both contacts; the point veto under lone keeps the departure on the 1,728 interface docks (the reader's control,
// passes), and the point veto under pass departs on every dock too. So without a veto a love and a fear meeting across
// the interface are unmade into one stored pair where the vacuum on either side would not, and the difference spreads
// along every line leaving the interface plane: the C-coset domains are not separate vacua that coexist. Title written
// after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; path choices are integer Weyl numbers of the key. The
// rule is exact in Z[w]; the Schmidt weights and CHSH are floats (measurement). Depth L2. Husk first: G4 and G7 are read
// on husk columns; the rest are bulk identities or counts that hold on every column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { boxHusk, causalRun, streamTarget } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { storeImage } from '@/code/measure/coset-walls'
import { coinsOnce } from '@/code/measure/dense-hub'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { d4BoxCoordinates } from '@/code/substrate/d4-box'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { lockedNorm, lockedState, newTally, norm, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { toWords, vetoBeat, vetoBeatBack, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { laws, newPathTally, registerKnot, sameOccupation, samePoints, vacuumConfiguration, THRESHOLD_BORN, THRESHOLD_EXCHANGE, THRESHOLD_KEEP, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { contactFresh, likePairStart, readVetoWall, vetoPathReplay, vetoPathRunner, vetoPathTrack, vetoPathWake } from '@/code/measure/occupation-veto-readings'

const SIDE = 8
const BEATS = 96
const CAUSAL_BEATS = 24
const DESCENT_BOUND = 12
const WALL_SIDE = 12
const WAKE_BOUND = 32
const Q_SIDE = 4
const Q_BEATS = 48
const SEARCH = 12
const KIND: VetoKind = 'none'
const CONTACTS: readonly CollisionKind[] = ['lone', 'pass']
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] as number)
const PATHS = [
  { name: 'keep', threshold: THRESHOLD_KEEP },
  { name: 'born', threshold: THRESHOLD_BORN },
  { name: 'exchange', threshold: THRESHOLD_EXCHANGE },
] as const

type PathName = (typeof PATHS)[number]['name']

const wordVacuum = (f: { cells: number; layout: Int8Array }, store: Int8Array): Configuration => toWords(vacuumConfiguration({ cells: f.cells, store, layout: f.layout }, 'all'))

// the lone wake of one veto on one path, all 24 directions, love and fear: worst per period [love, fear], off the line
function wakeOf(kind: VetoKind, g: LockedFresh, threshold: number): { worst: number[][]; offLine: number } {
  const center = centerOf(SIDE)
  const vacuum = wordVacuum(g, g.store)
  const track = vetoPathTrack(kind, g.tables, vacuum, threshold, BEATS).states
  const worst: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  let offLine = 0

  ;[1, -1].forEach((tone, k) => {
    for (let d = 0; d < 24; d++) {
      const w = vetoPathWake({ kind, tables: g.tables, vacuum, track, seedSlot: center * 24 + d, tone, threshold, beats: BEATS })

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
  exchanged: number
  units: number
  freeLast: number
  causalLargest: number
  descentMin: number
  coveredBy: number
  wakeWorst: number[][]
  wakeOffLine: number
  wallPasses: boolean
  wallOutsideColumns: number
  wallFrozen: boolean
}

function readPath(contact: CollisionKind, threshold: number): PathReading {
  const f = contactFresh(SIDE, contact)
  const vacuum = wordVacuum(f, f.store)
  const run = vetoPathRunner(KIND, f.tables, vacuum, threshold)
  const crun = vetoPathRunner(KIND, f.tables, wordVacuum(f, Int8Array.from(f.store, v => -v)), threshold)
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
      if (s.vibe[i] !== -(c.vibe[i] as number) || (s.vibe[i] !== 0 && s.point[i] !== c.point[i])) off++
    }

    for (let i = 0; i < s.store.length; i++) if (s.store[i] !== -(c.store[i] as number) || (s.store[i] !== 0 && s.spoint[i] !== c.spoint[i])) off++

    cBreaks += off > 0 ? 1 : 0
    freeLast = free
  }

  for (let t = 0; t < BEATS; t++) run.back()

  const back = run.state()
  let reverses = true

  for (let i = 0; i < back.vibe.length && reverses; i++) reverses = back.vibe[i] === vacuum.vibe[i] && (back.vibe[i] === 0 || back.point[i] === vacuum.point[i])
  for (let i = 0; i < back.store.length && reverses; i++) reverses = back.store[i] === vacuum.store[i] && (back.store[i] === 0 || back.spoint[i] === vacuum.spoint[i])

  let units = 0

  for (const v of f.store) units += v !== 0 ? 1 : 0

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

    const c = causalRun({ replay: vetoPathReplay(KIND, f.tables, start, threshold), husk, target, beats: CAUSAL_BEATS, seedDock: center })
    const first = new Int32Array(husk.columns).fill(-1)

    for (let x = 0; x < f.cells; x++) {
      const at = c.log.reachedAt[x] as number
      const col = husk.column[x] as number

      if (at >= 0 && (first[col] === -1 || at < (first[col] as number))) first[col] = at
    }

    causalLargest = Math.max(causalLargest, c.counts.husk)
    descentMin = Math.min(descentMin, c.counts.reachedHusk)
    coveredBy = Math.max(coveredBy, first.includes(-1) ? Number.POSITIVE_INFINITY : Math.max(...Array.from(first)))
  }

  // G6
  const wake = wakeOf(KIND, contactFresh(SIDE, contact, center), threshold)

  // G7
  const h = contactFresh(WALL_SIDE, contact)
  const coins = coinsOnce()
  const whusk = boxHusk(h.weave.mesh, WALL_SIDE)
  const inside = Uint8Array.from({ length: h.cells }, (_, x) => ((d4BoxCoordinates({ cell: x, side: WALL_SIDE })[0] ?? 0) >= WALL_SIDE / 2 ? 1 : 0))
  const image = storeImage(coins, WALL_SIDE, h.store, coins.table.identity, -1, [0, 0, 0, 0])
  const wall = readVetoWall({ kind: KIND, tables: h.tables, vacuum: store => wordVacuum(h, store), store: h.store, image, inside, column: whusk.column, columns: whusk.columns, from: 72, to: 192, window: 6, threshold })

  return {
    lawBreaks,
    reverses,
    cBreaks,
    made: tally.made,
    unmade: tally.unmade,
    exchanged: tally.exchanged,
    units,
    freeLast,
    causalLargest,
    descentMin,
    coveredBy,
    wakeWorst: wake.worst,
    wakeOffLine: wake.offLine,
    wallPasses: wall.passes,
    wallOutsideColumns: Math.max(0, ...wall.outsideColumns),
    wallFrozen: wall.frozen,
  }
}

// ---- the like study (E-RLT-0101's, on the rule's own like pair) ----

type Study = { found: boolean; clean: boolean; knot?: { weights: number[]; chsh: number }; normExact: boolean; reversed: boolean; occupations: number; branchesMax: number; splits: number; readings: string[]; differs: boolean }

function likeStudy(tables: LockedTables, f: LockedFresh): Study {
  const pick = likePairStart(KIND, tables, toWords(vacuumConfiguration(f, 'none')), SEARCH)

  if (!pick) return { found: false, clean: false, normExact: false, reversed: false, occupations: 0, branchesMax: 0, splits: 0, readings: [], differs: false }

  const start = pick.start
  const tally = newTally()
  // the keep term: the rule's classical history of this start (no exchange ever)
  const keep = vetoPathRunner(KIND, tables, start, THRESHOLD_KEEP)
  let s: LockedState = lockedState(start)
  let normExact = true
  let branchesMax = 1
  let knot: { weights: number[]; chsh: number } | undefined
  let keepMeetings = 0
  let cumulative = 0
  const readings: string[] = []
  let differs = false

  for (let t = 0; t < Q_BEATS; t++) {
    const before = tally.splitMeetings
    const pre = keep.state()
    const twinPre = s.branches.find(b => samePoints(b, pre))
    let onKeep = 0

    if (twinPre) {
      for (let x = 0; x < f.cells; x++) {
        for (let l = 0; l < 12; l++) {
          const i = x * 24 + (LINE_FIRSTS[l] as number)
          const j = x * 24 + (LINE_SECONDS[l] as number)

          if (twinPre.vibe[i] !== 0 && twinPre.vibe[i] === twinPre.vibe[j] && twinPre.open[i] && twinPre.open[j] && twinPre.point[i] !== twinPre.point[j]) onKeep++
        }
      }
    }

    s = vetoBeat(KIND, tables, s, t, tally)
    keep.beat()

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)

    if (!knot && tally.splitMeetings > before) {
      const b0 = s.branches[0]!
      const open: number[] = []

      for (let i = 0; i < b0.open.length; i++) if (b0.open[i]) open.push(i)

      const k = open.length === 2 ? registerKnot(s, open[0]!, open[1]!) : undefined

      if (k) knot = { weights: k.weights, chsh: k.chsh }
    }

    const now = keep.state()
    const twin = s.branches.find(b => samePoints(b, now))

    if (onKeep > 0 && keepMeetings < 3) {
      keepMeetings++
      cumulative += onKeep

      const w = twin ? norm(twin.a, twin.b) : 0n
      const k = twin ? twin.k : 0

      readings.push(`beat ${t}, m ${cumulative}: ${twin ? `${w}/4^${k}` : 'absent'}`)
      if (!twin || w * (1n << BigInt(2 * cumulative)) !== 1n << BigInt(2 * k)) differs = true
    }
  }

  const occupations: Configuration[] = []

  for (const b of s.branches) if (!occupations.some(o => sameOccupation(o, b))) occupations.push(b)

  let back = s

  for (let t = Q_BEATS - 1; t >= 0; t--) back = vetoBeatBack(KIND, tables, back, t)

  const b0 = back.branches[0]
  const reversed = back.branches.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && samePoints(b0, start)

  return { found: true, clean: pick.clean, knot, normExact, reversed, occupations: occupations.length, branchesMax, splits: tally.splitMeetings, readings, differs }
}

export default experiment({
  id: 'relativity/no-veto-store-vacuum',
  code: 'E-RLT-0103',
  title:
    'the coset-union vacuum on the no-veto two-point store, fail on the C walls alone, under both the bounce and the pass contacts: one occupation history on every path and start, laws, reversal, C and one causal component (51 of 51), pairs made = unmade = 466,944 with 0 free vibes, and a lone wake of 13 to 15 trits a period on its line (51 of 51, the reader calibrated at 16 on the old knit and 41,766 on the occupation veto); the like knot is sqrt 7 and the rule exact (17 of 17); but a C wall does not freeze (0 of 51, 1,152 of 1,728 husk columns outside): a love and a fear meeting across the interface are stored as one pair, and the departure covers the whole box by beat 12; positions carry no amplitude (1 occupation, 17 of 17), and under the pass the keep term reads the dephased 1/64 on 15 of 17 starts',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)

    // W0, on integer+0 (the first start), keep path, center anchor: the reader against the known bounded and melted wakes
    const calibration = withStart(family[0]!, () => {
      const lone = contactFresh(SIDE, 'lone', centerOf(SIDE))
      const pass = contactFresh(SIDE, 'pass', centerOf(SIDE))

      return {
        point: wakeOf('point', lone, THRESHOLD_KEEP),
        occupation: wakeOf('occupation', lone, THRESHOLD_KEEP),
        pointUnderPass: wakeOf('point', pass, THRESHOLD_KEEP),
      }
    })
    const peak = (w: { worst: number[][] }): number => Math.max(...w.worst.flat())
    const gW0 = peak(calibration.point) <= WAKE_BOUND && calibration.point.offLine === 0 && peak(calibration.occupation) > WAKE_BOUND

    log('W0')

    const perStart = family.map(member =>
      withStart(member, () => {
        const out = Object.fromEntries(
          CONTACTS.map(contact => {
            const paths = Object.fromEntries(PATHS.map(p => [p.name, readPath(contact, p.threshold)])) as Record<PathName, PathReading>
            const f4 = contactFresh(Q_SIDE, contact)
            const study = likeStudy(f4.tables, f4)

            return [contact, { paths, study }]
          }),
        ) as Record<CollisionKind, { paths: Record<PathName, PathReading>; study: Study }>

        log(`start ${member.name}`)

        return { name: member.name, ...out }
      }),
    )

    const g = {
      G1: (r: PathReading) => r.lawBreaks === 0,
      G2: (r: PathReading) => r.reverses,
      G3: (r: PathReading) => r.cBreaks === 0,
      G4: (r: PathReading) => r.causalLargest === 1 && r.descentMin === 512 && r.coveredBy <= DESCENT_BOUND,
      G5: (r: PathReading) => r.made === r.unmade && r.made >= r.units,
      G6: (r: PathReading) => r.wakeOffLine === 0 && r.wakeWorst.flat().every(x => x <= WAKE_BOUND),
      G7: (r: PathReading) => r.wallPasses,
    }
    const q = {
      Q2: (s: Study) => s.found && s.clean && !!s.knot && s.knot.weights.length === 2 && Math.abs((s.knot.weights[0] ?? 0) - 0.75) < 1e-12 && Math.abs((s.knot.weights[1] ?? 0) - 0.25) < 1e-12 && Math.abs(s.knot.chsh - Math.sqrt(7)) < 1e-9,
      Q3: (s: Study) => s.found && s.clean && s.normExact && s.reversed,
    }
    const reported = {
      Q4: (s: Study) => s.occupations > 1,
      Q7: (s: Study) => s.differs,
    }
    const cases = (contact: CollisionKind, test: (r: PathReading) => boolean, path?: PathName): number => perStart.reduce((n, p) => n + PATHS.filter(x => !path || x.name === path).filter(x => test(p[contact].paths[x.name])).length, 0)
    const keeps = (contact: CollisionKind): boolean => Object.values(g).every(test => cases(contact, test) === 3 * family.length) && Object.values(q).every(test => perStart.every(p => test(p[contact].study)))
    const kept = CONTACTS.filter(keeps)
    const status = !gW0 ? 'fail' : kept.length === CONTACTS.length ? 'pass' : kept.length > 0 ? 'partial' : 'fail'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (contact: CollisionKind, name: PathName, f: (r: PathReading) => number): string => range(perStart.map(p => f(p[contact].paths[name])))
    const metrics: Record<string, number> = {
      starts: family.length,
      gateW0: gW0 ? 1 : 0,
      calibrationPointPeak: peak(calibration.point),
      calibrationPointOffLine: calibration.point.offLine,
      calibrationOccupationPeak: peak(calibration.occupation),
      referencePointUnderPassPeak: peak(calibration.pointUnderPass),
      referencePointUnderPassOffLine: calibration.pointUnderPass.offLine,
    }

    for (const contact of CONTACTS) {
      metrics[`${contact}_keepsVacuum`] = keeps(contact) ? 1 : 0

      for (const [name, test] of Object.entries(g)) {
        for (const p of PATHS) metrics[`${contact}_${name}_${p.name}`] = cases(contact, test, p.name)
      }

      for (const [name, test] of Object.entries({ ...q, ...reported })) metrics[`${contact}_${name}`] = perStart.filter(p => test(p[contact].study)).length

      for (const p of PATHS) {
        metrics[`${contact}_${p.name}_madeMax`] = Math.max(...perStart.map(s => s[contact].paths[p.name].made))
        metrics[`${contact}_${p.name}_unmadeMin`] = Math.min(...perStart.map(s => s[contact].paths[p.name].unmade))
        metrics[`${contact}_${p.name}_freeLastMax`] = Math.max(...perStart.map(s => s[contact].paths[p.name].freeLast))
        metrics[`${contact}_${p.name}_wakeWorstMax`] = Math.max(...perStart.map(s => Math.max(...s[contact].paths[p.name].wakeWorst.flat())))
        metrics[`${contact}_${p.name}_wakeOffLineMax`] = Math.max(...perStart.map(s => s[contact].paths[p.name].wakeOffLine))
        metrics[`${contact}_${p.name}_wallOutsideColumnsMax`] = Math.max(...perStart.map(s => s[contact].paths[p.name].wallOutsideColumns))
      }

      metrics[`${contact}_chshMin`] = Math.min(...perStart.map(p => p[contact].study.knot?.chsh ?? 0))
      metrics[`${contact}_occupationsMax`] = Math.max(...perStart.map(p => p[contact].study.occupations))
    }

    metrics.seconds = (Date.now() - started) / 1000

    const pathLine = (contact: CollisionKind, name: PathName): string =>
      `${contact} ${name}: laws broken ${over(contact, name, r => r.lawBreaks)}, reverses on ${perStart.filter(p => p[contact].paths[name].reverses).length}, C broken ${over(contact, name, r => r.cBreaks)}; exchanged ${over(contact, name, r => r.exchanged)}; made ${over(contact, name, r => r.made)}, unmade ${over(contact, name, r => r.unmade)}, units ${over(contact, name, r => r.units)}; free vibes at beat 96 ${over(contact, name, r => r.freeLast)} of ${SIDE ** 4 * 24}; causal largest ${over(contact, name, r => r.causalLargest)}, descent ${over(contact, name, r => r.descentMin)} of 512, covered by beat ${over(contact, name, r => r.coveredBy)}; wake worst love ${JSON.stringify(perStart[0]![contact].paths[name].wakeWorst[0])} fear ${JSON.stringify(perStart[0]![contact].paths[name].wakeWorst[1])} (integer+0), max over starts ${over(contact, name, r => Math.max(...r.wakeWorst.flat()))}, off line ${over(contact, name, r => r.wakeOffLine)}; C wall passes on ${perStart.filter(p => p[contact].paths[name].wallPasses).length}, husk columns outside ${over(contact, name, r => r.wallOutsideColumns)} of 1728, frozen on ${perStart.filter(p => p[contact].paths[name].wallFrozen).length}`
    const studyLine = (contact: CollisionKind): string =>
      `${contact} like study per start (pick clean, splits, branches max, occupations, knot weights, CHSH, readings): ${perStart.map(p => `${p.name} ${p[contact].study.clean}, ${p[contact].study.splits}, ${p[contact].study.branchesMax}, ${p[contact].study.occupations}, ${JSON.stringify(p[contact].study.knot?.weights.map(w => Math.round(w * 1e6) / 1e6))}, ${p[contact].study.knot?.chsh.toFixed(4)}, [${p[contact].study.readings.join('; ')}]`).join(' | ')}`

    return verdict({
      status,
      claim: `wake reader calibrated ${gW0} (point veto ${peak(calibration.point)} trits, ${calibration.point.offLine} off line; occupation veto ${peak(calibration.occupation)}); ${CONTACTS.map(
        contact =>
          `${contact}: keeps the vacuum ${keeps(contact)} (G1 to G7 on ${Object.values(g)
            .map(test => cases(contact, test))
            .join(', ')} of ${3 * family.length}), knot sqrt 7 on ${metrics[`${contact}_Q2`]}, exact on ${metrics[`${contact}_Q3`]} of ${family.length}; reported: positions with amplitude on ${metrics[`${contact}_Q4`]}, interference on ${metrics[`${contact}_Q7`]}`,
      ).join('; ')}`,
      metrics,
      control: { referencePointUnderPassPeak: peak(calibration.pointUnderPass), calibrationOccupationPeak: peak(calibration.occupation) },
      notes: `L2. Calibration (integer+0, keep, 48 seeds): point veto lone ${JSON.stringify(calibration.point)}, occupation veto lone ${JSON.stringify(calibration.occupation)}, point veto pass ${JSON.stringify(calibration.pointUnderPass)}. Gates per contact (keep/born/exchange counts of 17): ${CONTACTS.map(contact => `${contact} ${Object.keys(g)
        .map(name => `${name} ${PATHS.map(p => metrics[`${contact}_${name}_${p.name}`]).join('/')}`)
        .join(', ')}; ${Object.keys({ ...q, ...reported })
        .map(name => `${name} ${metrics[`${contact}_${name}`]}`)
        .join(', ')}`).join('. ')}. ${CONTACTS.flatMap(contact => PATHS.map(p => pathLine(contact, p.name))).join('. ')}. ${CONTACTS.map(studyLine).join('. ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
