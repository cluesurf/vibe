// The coset-union vacuum and the knit's quantum readings under the two exchange-blind vetoes (E-RLT-0101): E-RLT-0098's
// three paths and E-RLT-0099's like study rerun with the occupation veto (A) and the pairing veto (B) of
// code/rule/occupation-veto-knit (built and checked as E-RLT-0100).
//
// WHAT IS PREDICTED, from E-RLT-0100's theorems, before any run:
//  - A: every term of the all-open rule holds ONE occupation history, the old vacuum's (E-RLT-0100 T2, T5). So pair
//    creation and the frozen walls, which read occupation only, hold on the Born and exchange paths exactly as on the
//    keep path, where they are E-RLT-0093's and E-RLT-0095's. The lone wake reads occupation too, so it is one number for
//    every path; it is NOT the old wake, because a lone vibe makes its dock charged and A then freezes that dock's pair
//    move where the point veto would not (E-RLT-0100 reports the seeded runs differing). Predicted within the bound.
//    The price, by the same theorem: the terms of a like study never differ in occupation, so positions carry no
//    amplitude (E-RLT-0099 Q4 FAILS under A, necessarily). The knot at a like meeting is the meeting's, unchanged, so
//    sqrt 7 holds; norm and reversal are exact by construction. Interference is not predicted.
//  - B: B's decision at a dock is kept by an exchange there but not along a history (E-RLT-0100 T3), and tmp/ov-probe2
//    (disclosed: run before these gates, starts integer+0 and golden) found B's Born path making 13,378 pairs against
//    1,294 unmade. Predicted: B fails pair creation, the wake and the walls on the Born and exchange paths.
//
// Gates, fixed before this file's first run, each read per veto on every start of E-MTH-0028's 17 and on each of the
// keep, Born-rate and exchange paths (thresholds 0, 49152, 65536 of the silver-rate key, as E-RLT-0098):
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
// and per veto on every start (side 4, E-RLT-0099's like study: the first like meeting of two vacuum vibes with unequal
// points within 12 beats, those two vibes opened, 48 beats):
//  Q2 at the first split the two-vibe knot has Schmidt weights 3/4 and 1/4 (1e-12) and CHSH sqrt 7 (1e-9)
//  Q3 the norm is exact at every beat and the exact inverse returns amplitude 1 on the start
//  Q4 positions carry amplitude: the terms hold more than one occupation within 48 beats
//  Q7 interference: the weight of the keep term, read after each of its first three meetings of the pair, differs from
//     the dephased (1/4)^m at some reading
// A veto KEEPS THE VACUUM when G1 to G7 hold on all 51 (start, path) cases. Verdict: pass if some veto keeps the vacuum
// and holds Q2, Q3, Q4, Q7 on every start; partial if some veto keeps the vacuum but loses one of Q2, Q3, Q4, Q7; fail if
// no veto keeps the vacuum. PREDICTED: partial (A keeps the vacuum and loses Q4; B keeps neither).
//
// FIRST RUN (7,360 s on a shared machine, tmp/rlt101-run1.log): fail, no gate moved. Occupation veto: G1 to G5 and G7
// on 51 of 51 (made = unmade = 393,216, vetoed 147,456, identical on every path and start, as the theorem says), G6 on
// 0 of 51 (wake about 41,000 trits a period, about 1.4e8 off the line, the same on every path: the wake is a
// classical failure of the veto, not a branch effect); Q2 17, Q3 17, Q4 0 (as predicted), Q7 17 (the keep term reads
// 1/4, 1/16, 1/16 after its 1st, 2nd and 3rd meeting, 31/64 on integer+11). Pairing veto: G1 to G4 on 51, G5 and G7 on
// the keep path only (17 of 51), G6 on 0 of 51; Q2, Q3, Q4 on 17 (up to 6,917 occupations), Q7 on 0 (the keep term
// reads exactly 1/4, 1/16, 1/64). G6 was NOT predicted to fail under A. Calibration after the run (tmp/ov-probe3,
// integer+0, 4 directions): the same wake reader reads 13 to 15 trits, 0 off the line, under the point veto, and under
// A the wake grows 12, 16, 97, 126, 150, 385, 638, 797 trits in the first eight beats. A lead, probed after the run and
// NOT gated (tmp/ov-probe4, integer+0): with no veto at all and the two-point store the occupation is again one history
// on every path, the vacuum makes 466,944 pairs and unmakes 466,944 (not the old vacuum's 393,216), and the lone wake is
// 13 to 15 trits with 0 off the line, love and fear. Title written after the run.
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
import { lockedNorm, lockedState, newTally, norm, type Configuration, type LockedState } from '@/code/rule/doublet-locked-knit'
import { toWords, vetoBeat, vetoBeatBack, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { idRun, laws, lockedFresh, newPathTally, registerKnot, sameOccupation, samePoints, vacuumConfiguration, THRESHOLD_BORN, THRESHOLD_EXCHANGE, THRESHOLD_KEEP, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { readVetoWall, vetoPathReplay, vetoPathRunner, vetoPathTrack, vetoPathWake } from '@/code/measure/occupation-veto-readings'

const SIDE = 8
const BEATS = 96
const CAUSAL_BEATS = 24
const DESCENT_BOUND = 12
const WALL_SIDE = 12
const WAKE_BOUND = 32
const Q_SIDE = 4
const Q_BEATS = 48
const SEARCH = 12
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] as number)
const KINDS: readonly VetoKind[] = ['occupation', 'pairing']
const PATHS = [
  { name: 'keep', threshold: THRESHOLD_KEEP },
  { name: 'born', threshold: THRESHOLD_BORN },
  { name: 'exchange', threshold: THRESHOLD_EXCHANGE },
] as const

type PathName = (typeof PATHS)[number]['name']

const wordVacuum = (f: { cells: number; layout: Int8Array }, store: Int8Array): Configuration => toWords(vacuumConfiguration({ cells: f.cells, store, layout: f.layout }, 'all'))

type PathReading = {
  lawBreaks: number
  reverses: boolean
  cBreaks: number
  made: number
  unmade: number
  vetoed: number
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

function readPath(kind: VetoKind, threshold: number): PathReading {
  const f = lockedFresh(SIDE)
  const vacuum = wordVacuum(f, f.store)
  const run = vetoPathRunner(kind, f.tables, vacuum, threshold)
  const crun = vetoPathRunner(kind, f.tables, wordVacuum(f, Int8Array.from(f.store, v => -v)), threshold)
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

    const c = causalRun({ replay: vetoPathReplay(kind, f.tables, start, threshold), husk, target, beats: CAUSAL_BEATS, seedDock: center })
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
  const g = lockedFresh(SIDE, center)
  const gVacuum = wordVacuum(g, g.store)
  const track = vetoPathTrack(kind, g.tables, gVacuum, threshold, BEATS).states
  const wakeWorst: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  let wakeOffLine = 0

  ;[1, -1].forEach((tone, k) => {
    for (let d = 0; d < 24; d++) {
      const w = vetoPathWake({ kind, tables: g.tables, vacuum: gVacuum, track, seedSlot: center * 24 + d, tone, threshold, beats: BEATS })

      w.worst.forEach((x, p) => {
        wakeWorst[k]![p] = Math.max(wakeWorst[k]![p] ?? 0, x)
      })
      wakeOffLine += w.offLine
    }
  })

  // G7
  const h = lockedFresh(WALL_SIDE)
  const coins = coinsOnce()
  const whusk = boxHusk(h.weave.mesh, WALL_SIDE)
  const inside = Uint8Array.from({ length: h.cells }, (_, x) => ((d4BoxCoordinates({ cell: x, side: WALL_SIDE })[0] ?? 0) >= WALL_SIDE / 2 ? 1 : 0))
  const image = storeImage(coins, WALL_SIDE, h.store, coins.table.identity, -1, [0, 0, 0, 0])
  const wall = readVetoWall({ kind, tables: h.tables, vacuum: store => wordVacuum(h, store), store: h.store, image, inside, column: whusk.column, columns: whusk.columns, from: 72, to: 192, window: 6, threshold })

  return {
    lawBreaks,
    reverses,
    cBreaks,
    made: tally.made,
    unmade: tally.unmade,
    vetoed: tally.vetoed,
    exchanged: tally.exchanged,
    units,
    freeLast,
    causalLargest,
    descentMin,
    coveredBy,
    wakeWorst,
    wakeOffLine,
    wallPasses: wall.passes,
    wallOutsideColumns: Math.max(0, ...wall.outsideColumns),
    wallFrozen: wall.frozen,
  }
}

// ---- the like study (E-RLT-0099's, on the chosen veto's rule) ----

function findLikePair(f: LockedFresh): [number, number] | undefined {
  const all = new Map<number, [number, number]>()

  for (let line = 0; line < f.store.length; line++) if (f.store[line] !== 0) all.set(line, [2 * line, 2 * line + 1])

  // the no-open history of every veto is the old knit's (E-RLT-0100 T5), so the old id run names the vibes
  const r = idRun(f.tables, f.weave, vacuumConfiguration(f, 'none'), all)

  for (let t = 0; t < SEARCH; t++) {
    const c = r.state()
    const ids = r.ids()

    for (let x = 0; x < f.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + (LINE_FIRSTS[l] as number)
        const j = x * 24 + (LINE_SECONDS[l] as number)

        if (c.vibe[i] !== 0 && c.vibe[i] === c.vibe[j] && c.point[i] !== c.point[j] && (ids[i] as number) >= 0 && (ids[j] as number) >= 0) return [ids[i] as number, ids[j] as number]
      }
    }

    r.beat()
  }

  return undefined
}

type Study = { found: boolean; knot?: { weights: number[]; chsh: number }; normExact: boolean; reversed: boolean; occupations: number; branchesMax: number; splits: number; readings: string[]; differs: boolean }

function likeStudy(kind: VetoKind, f: LockedFresh): Study {
  const pick = findLikePair(f)

  if (!pick) return { found: false, normExact: false, reversed: false, occupations: 0, branchesMax: 0, splits: 0, readings: [], differs: false }

  const raw = vacuumConfiguration(f, 'none')

  for (const id of pick) raw.sopen[id >> 1] = (raw.sopen[id >> 1] as number) | (1 << (id & 1))

  const start = toWords(raw)
  const tally = newTally()
  // the keep term: the rule's classical history of this start (no exchange ever)
  const keep = vetoPathRunner(kind, f.tables, start, THRESHOLD_KEEP)
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

    s = vetoBeat(kind, f.tables, s, t, tally)
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

  for (let t = Q_BEATS - 1; t >= 0; t--) back = vetoBeatBack(kind, f.tables, back, t)

  const b0 = back.branches[0]
  const reversed = back.branches.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && samePoints(b0, start)

  return { found: true, knot, normExact, reversed, occupations: occupations.length, branchesMax, splits: tally.splitMeetings, readings, differs }
}

export default experiment({
  id: 'relativity/occupation-veto-vacuum',
  code: 'E-RLT-0101',
  title:
    'the coset-union vacuum under the two exchange-blind vetoes, fail: the occupation veto keeps the vacuum on every term (one occupation history on the keep, Born and exchange paths, pairs made = unmade = 393,216, 0 free vibes, frozen C walls, laws, reversal, C and one causal component, 51 of 51) but a single charged vibe melts it (the lone wake grows 12, 16, 97, 126 trits in four beats to about 41,000, 1.4e8 off its line, on every path and start), because a lone vibe charges its dock, the frozen pair move leaves an unmatched vibe, and that charges the next dock; the pairing veto melts the vacuum on the Born and exchange paths as the old one did (13,409 made against 1,165 unmade) and melts on a lone vibe too; the quantum readings split: the like knot is sqrt 7 and the rule exact under both, but under the occupation veto positions carry no amplitude (1 occupation, 17 of 17, the price the autonomy theorem names) while the keep term still interferes (1/16 after three meetings against the dephased 1/64), and under the pairing veto positions carry amplitude (up to 6,917 occupations) but the keep term reads exactly the dephased (1/4)^m',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const f4 = lockedFresh(Q_SIDE)
        const out = Object.fromEntries(
          KINDS.map(kind => {
            const paths = Object.fromEntries(PATHS.map(p => [p.name, readPath(kind, p.threshold)])) as Record<PathName, PathReading>
            const study = likeStudy(kind, f4)

            return [kind, { paths, study }]
          }),
        ) as Record<VetoKind, { paths: Record<PathName, PathReading>; study: Study }>

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
      Q2: (s: Study) => s.found && !!s.knot && s.knot.weights.length === 2 && Math.abs((s.knot.weights[0] ?? 0) - 0.75) < 1e-12 && Math.abs((s.knot.weights[1] ?? 0) - 0.25) < 1e-12 && Math.abs(s.knot.chsh - Math.sqrt(7)) < 1e-9,
      Q3: (s: Study) => s.found && s.normExact && s.reversed,
      Q4: (s: Study) => s.occupations > 1,
      Q7: (s: Study) => s.differs,
    }
    const cases = (kind: VetoKind, test: (r: PathReading) => boolean, path?: PathName): number => perStart.reduce((n, p) => n + PATHS.filter(x => !path || x.name === path).filter(x => test(p[kind].paths[x.name])).length, 0)
    const keeps = (kind: VetoKind): boolean => Object.values(g).every(test => cases(kind, test) === 3 * family.length)
    const quantum = (kind: VetoKind): boolean => Object.values(q).every(test => perStart.every(p => test(p[kind].study)))
    const status = KINDS.some(k => keeps(k) && quantum(k)) ? 'pass' : KINDS.some(k => keeps(k)) ? 'partial' : 'fail'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (kind: VetoKind, name: PathName, f: (r: PathReading) => number): string => range(perStart.map(p => f(p[kind].paths[name])))
    const metrics: Record<string, number> = { starts: family.length }

    for (const kind of KINDS) {
      metrics[`${kind}_keepsVacuum`] = keeps(kind) ? 1 : 0

      for (const [name, test] of Object.entries(g)) {
        for (const p of PATHS) metrics[`${kind}_${name}_${p.name}`] = cases(kind, test, p.name)
      }

      for (const [name, test] of Object.entries(q)) metrics[`${kind}_${name}`] = perStart.filter(p => test(p[kind].study)).length

      for (const p of PATHS) {
        metrics[`${kind}_${p.name}_madeMax`] = Math.max(...perStart.map(s => s[kind].paths[p.name].made))
        metrics[`${kind}_${p.name}_unmadeMin`] = Math.min(...perStart.map(s => s[kind].paths[p.name].unmade))
        metrics[`${kind}_${p.name}_freeLastMax`] = Math.max(...perStart.map(s => s[kind].paths[p.name].freeLast))
        metrics[`${kind}_${p.name}_wakeWorstMax`] = Math.max(...perStart.map(s => Math.max(...s[kind].paths[p.name].wakeWorst.flat())))
        metrics[`${kind}_${p.name}_wakeOffLineMax`] = Math.max(...perStart.map(s => s[kind].paths[p.name].wakeOffLine))
        metrics[`${kind}_${p.name}_wallOutsideColumnsMax`] = Math.max(...perStart.map(s => s[kind].paths[p.name].wallOutsideColumns))
      }

      metrics[`${kind}_chshMin`] = Math.min(...perStart.map(p => p[kind].study.knot?.chsh ?? 0))
      metrics[`${kind}_occupationsMax`] = Math.max(...perStart.map(p => p[kind].study.occupations))
    }

    metrics.seconds = (Date.now() - started) / 1000

    const pathLine = (kind: VetoKind, name: PathName): string =>
      `${kind} ${name}: laws broken ${over(kind, name, r => r.lawBreaks)}, reverses on ${perStart.filter(p => p[kind].paths[name].reverses).length}, C broken ${over(kind, name, r => r.cBreaks)}; exchanged ${over(kind, name, r => r.exchanged)}; made ${over(kind, name, r => r.made)}, unmade ${over(kind, name, r => r.unmade)}, vetoed ${over(kind, name, r => r.vetoed)}, units ${over(kind, name, r => r.units)}; free vibes at beat 96 ${over(kind, name, r => r.freeLast)} of ${SIDE ** 4 * 24}; causal largest ${over(kind, name, r => r.causalLargest)}, descent ${over(kind, name, r => r.descentMin)} of 512, covered by beat ${over(kind, name, r => r.coveredBy)}; wake worst love ${JSON.stringify(perStart[0]![kind].paths[name].wakeWorst[0])} fear ${JSON.stringify(perStart[0]![kind].paths[name].wakeWorst[1])} (integer+0), max over starts ${over(kind, name, r => Math.max(...r.wakeWorst.flat()))}, off line ${over(kind, name, r => r.wakeOffLine)}; C wall passes on ${perStart.filter(p => p[kind].paths[name].wallPasses).length}, husk columns outside ${over(kind, name, r => r.wallOutsideColumns)} of 1728, frozen on ${perStart.filter(p => p[kind].paths[name].wallFrozen).length}`
    const studyLine = (kind: VetoKind): string =>
      `${kind} like study per start (splits, branches max, occupations, knot weights, CHSH, readings): ${perStart.map(p => `${p.name} ${p[kind].study.splits}, ${p[kind].study.branchesMax}, ${p[kind].study.occupations}, ${JSON.stringify(p[kind].study.knot?.weights.map(w => Math.round(w * 1e6) / 1e6))}, ${p[kind].study.knot?.chsh.toFixed(4)}, [${p[kind].study.readings.join('; ')}]`).join(' | ')}`

    return verdict({
      status,
      claim: KINDS.map(
        kind =>
          `${kind}: keeps the vacuum ${keeps(kind)} (G1 to G7 on ${Object.values(g)
            .map(test => cases(kind, test))
            .join(', ')} of ${3 * family.length}), knot sqrt 7 on ${metrics[`${kind}_Q2`]}, exact on ${metrics[`${kind}_Q3`]}, positions with amplitude on ${metrics[`${kind}_Q4`]}, interference on ${metrics[`${kind}_Q7`]} of ${family.length}`,
      ).join('; '),
      metrics,
      notes: `L2. Gates per veto (keep/born/exchange counts of 17): ${KINDS.map(kind => `${kind} ${Object.keys(g)
        .map(name => `${name} ${PATHS.map(p => metrics[`${kind}_${name}_${p.name}`]).join('/')}`)
        .join(', ')}; ${Object.keys(q)
        .map(name => `${name} ${metrics[`${kind}_${name}`]}`)
        .join(', ')}`).join('. ')}. ${KINDS.flatMap(kind => PATHS.map(p => pathLine(kind, p.name))).join('. ')}. ${KINDS.map(studyLine).join('. ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
