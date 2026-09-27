// THE LIFTED FRAME MIXER IN THE WORKING VACUUM (E-SPN-0097). E-SPN-0095 added G to the working vacuum on frames of
// exactly one open vibe, and on the sampled Born path a lone vibe's wake grew about 1.3 fold a beat (tmp/wake-probe2.log:
// 73 trits apart at beat 20, 66,538 at beat 45, near 560,000 by beat 60 on side 16; the coin alone 1 to 4). E-SPN-0096
// lifted G to a frame's whole occupation, Gamma(G) = (-1)^(N_u), and found it unitary and covariant only on frames of
// one content. Here Gamma(G) replaces G with NO OTHER CHANGE: code/rule/coined-locked-knit liftedVetoBeat (Gamma(G) on
// every frame whose vibes are all open and of one value and point, then the coined no-veto beat), on paths
// code/measure/occupation-veto-readings pathLift (the same 16 Born bins of the key (beat, dock, frame): on n vibes
// (4 - n)^2 bins keep and each of the n (8 - n) one-vibe hops takes one bin; for n = 1 exactly E-SPN-0095's bins).
//
// DERIVED BEFORE THE RUN.
//  - On a lone frame the lift is G, so a lone vibe leaves its line exactly as in E-SPN-0095 (on the empty mesh the same
//    numbers, 0.373 off its line by beat 4; the fermion sign of a hop counts other occupied modes of the dock, which the
//    empty mesh does not have).
//  - The vacuum's own history is no longer untouched: the census (tmp/lift-probe1.log) found 1,275 frames of two like
//    vibes of equal points on the Born path over 96 beats (none on the exchange path), where the lift keeps 1/4 of the
//    weight and hops a vibe in 12 of the 16 bins. A hop moves a vibe to an orthogonal root, which changes the occupation
//    momentum, one of the laws G1 reads: G1 should FAIL on the Born path and hold on the keep and exchange paths.
//  - The wake. The lift acts on the same lone frames as G, and E-SPN-0095's mechanism (each firing leaves new lone
//    vibes in neighbor frames) is untouched by it; the love-and-fear frames, where most of the vacuum's vibes are, stay
//    outside it (E-SPN-0096). So the chain reaction should remain: growth near 1.3 fold a beat.
//  - The electron (E-SPN-0093, reported, not gated). The lift adds a full line's keep of 1/2 to G's lone keep, so the
//    compressed one-line operator loses more: the one-beat return should fall below E-SPN-0095's 0.454.
//
// GATES, fixed before this file's first run.
//  Q1 the vacuum holds with the lift on (E-SPN-0095's readVacuumPath with the lift, side 8, 96 beats, on the keep, Born
//     and exchange paths): G1 laws at every beat; G2 96 inverse beats return the start; G3 C exact at every beat; G4 one
//     causal component, all 512 husk docks, covered by beat 12; G5 made = unmade and made >= units; every start on
//     every path. The lone wake's worst trits a period (E-SPN-0095's G6) is reported, not gated (Q3 is the wake's
//     gate). STARTS: the first run reads the first 3 of E-MTH-0028's 17 starts; if it takes under 30 minutes, a second
//     run on all 17 is the record, with the same gates
//  Q2 a lone love leaves its line: (a) the empty mesh (side 4, pass tables, no store), one seed per frame (roots
//     (1, 0, 0, 1), (1, 1, 0, 0), (1, 0, 1, 0)) at the center dock, 4 exact beats: with the lift the weight off the seed's
//     line is above 0 at beat 4 on 3 of 3, and the coin alone keeps 0 at every beat; (b) the vacuum (side 4, the love at
//     the center dock's slot 0, every start run): above 0 at beat 4 on every start; the coin alone keeps 0
//  Q3 the chain reaction is gone: one love at the center dock's slot 0 on side 16, the Born path, the coin on, 50 beats,
//     the trits apart from the unseeded run beat by beat; the least-squares slope of ln(trits apart) over beats 20 to 45
//     is under 0.05 a beat with the lift (a factor 3.5 over the 25 beats, below t^4's 25.6); reported beside it: the
//     same with E-SPN-0095's G and with no mixer
//  Q4 exact and reversible, bit for bit: every lone run of Q2 with the lift keeps the norm exact at every beat, runs
//     back to its start as one branch of amplitude 1, and a second run equals the first branch for branch; G2 of Q1
//  REPORT (not gated): E-SPN-0093's electron under one beat with the lift, compressed to its line (code/measure/
//     coined-line-bloch `lift`), with the instrument check of E-SPN-0095's I3 (one exact beat of the coined knit with
//     liftBranch against the compressed ring, side 6 axis line, four starts)
//  Verdict: fail if Q1, Q2 or Q4 fails; pass if Q1 to Q4 hold; partial if Q3 alone fails.
//
// PREDICTED: Q1 FAIL (G1 on the Born path; G2 to G5 hold); Q2 pass; Q3 FAIL (slope near 0.25); Q4 pass; the electron's
// return below 0.454: fail.
//
// RUNS. tmp/spn97-exp1.log (676 s, 3 starts, about 220 s a start, so 17 starts would pass 30 minutes: by the rule
// above the 3-start run is the record): fail on Q1, no gate moved. Q1 fails on G1 and G5 on the Born path alone, 3 of
// 3: the lift moves the vacuum's own history 146,698 to 148,268 times there (0 on keep and exchange), laws broken at
// 92 of 96 beats, made 160,551 to 162,991 against unmade 150,019 to 152,483. G1 was predicted; G5 was not. G2, G3,
// G4 hold on every path. Q2 and Q4 hold (0.373 off the line by beat 4 on the empty mesh, E-SPN-0095's number; 0.516
// in the vacuum; 6 of 6 lone runs exact and reversible). Q3 PASSES AS WRITTEN (slope 0.042 over beats 20 to 45) BUT
// THE GATE WAS WRONG FOR THIS CASE: the lifted wake fills the side-16 box by beat 25 (92,775 trits at beat 20, 568,454
// at 26, 620,202 at 45) and a saturated curve has no slope. Over beats 5 to 15, before the box fills, it grows 0.618
// a beat in ln (about 1.85 fold a beat) against G's 0.155: the chain reaction is not gone, it is faster, as predicted
// in substance. The early slope was added to the report after the first run and is not a gate; tmp/spn97-exp2.log
// (457 s) is that rerun, every gated number equal to the first run's. The electron's one-beat return with the lift is
// 0.121 (with G 0.454; instrument check 2.8e-17).
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; the path choices are integer Weyl numbers of the key.
// The rule is exact in Z[w][1/2]; weights, slopes and the compressed return are floats (measurement). Depth L2. HUSK
// FIRST: G4 is read on husk columns; the rest are bulk identities or counts that hold on every column by holding on
// every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { lockedState, lockedTables, mergeBranches, norm, cloneConfiguration, type Branch, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { toWords, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { coinedBeat, liftBranch } from '@/code/rule/coined-locked-knit'
import { THRESHOLD_BORN, THRESHOLD_EXCHANGE, THRESHOLD_KEEP, tritsApart, vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { contactFresh, vetoPathRunner, type MixKind } from '@/code/measure/occupation-veto-readings'
import { huskCoordinates, loneRun, loneRunsBack, loneStart, readVacuumPath, sameState, wordVacuum, type LoneRun, type PathReading } from '@/code/measure/mixed-vacuum-readings'
import { lineBasis, lineLightest, lineSurvival, ringBeat, ringKey, wholeBasis, type LineSector, type RingState } from '@/code/measure/coined-line-bloch'

const ROOTS = rootsD4()
const SIDE = 8
const BEATS = 96
const CAUSAL_BEATS = 24
const DESCENT_BOUND = 12
const STARTS = Number(process.env.SPN97_STARTS ?? 3)
const Q_SIDE = 4
const LONE_BEATS = 4
const WAKE_SIDE = 16
const WAKE_BEATS = 50
const SLOPE_FROM = 20
const SLOPE_TO = 45
const SLOPE_BOUND = 0.05
const BOX = 12
const KIND: VetoKind = 'none'
const LIFT = { coin: true, mix: 'lift' as const }
const PATHS = [
  { name: 'keep', threshold: THRESHOLD_KEEP },
  { name: 'born', threshold: THRESHOLD_BORN },
  { name: 'exchange', threshold: THRESHOLD_EXCHANGE },
] as const

type PathName = (typeof PATHS)[number]['name']

// E-SPN-0095's recorded return with G (tmp/spn95-exp2.log)
const RETURN_WITH_G = 0.454

const slotOfRoot = (r: readonly number[]): number => ROOTS.findIndex(v => v.every((x, k) => x === r[k]))

type LoneStudy = { lifted: LoneRun; control: LoneRun; back: boolean; again: boolean }

function loneStudy(tables: LockedTables, start: Configuration, slot: number, side: number, husk: number[][]): LoneStudy {
  const lifted = loneRun({ kind: KIND, tables, start, slot, beats: LONE_BEATS, mix: 'lift', side, husk })
  const control = loneRun({ kind: KIND, tables, start, slot, beats: LONE_BEATS, mix: false, side, husk })
  const again = sameState(lifted.final, loneRun({ kind: KIND, tables, start, slot, beats: LONE_BEATS, mix: 'lift', side, husk }).final)
  const back = loneRunsBack({ kind: KIND, tables, start, final: lifted.final, beats: LONE_BEATS, mix: 'lift' })

  return { lifted, control, back, again }
}

// ---- Q3: the wake beat by beat ----

function wakeCurve(mix: MixKind): { apart: number[]; seconds: number } {
  const t0 = Date.now()
  const center = centerOf(WAKE_SIDE)
  const f = contactFresh(WAKE_SIDE, 'pass', center)
  const vacuum = wordVacuum(f, f.store)
  const start = cloneConfiguration(vacuum)

  start.vibe[center * 24] = 1
  start.open[center * 24] = 1

  const a = vetoPathRunner(KIND, f.tables, vacuum, THRESHOLD_BORN, 0, true, mix)
  const b = vetoPathRunner(KIND, f.tables, start, THRESHOLD_BORN, 0, true, mix)
  const apart: number[] = []

  for (let t = 0; t < WAKE_BEATS; t++) {
    a.beat()
    b.beat()
    apart.push(tritsApart(b.state(), a.state()))
  }

  return { apart, seconds: (Date.now() - t0) / 1000 }
}

// least-squares slope of ln(trits apart) over beats from..to (beat t + 1 is apart[t])
function logSlope(apart: readonly number[], from: number, to: number): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let beat = from; beat <= to; beat++) {
    xs.push(beat)
    ys.push(Math.log(Math.max(1, apart[beat - 1] as number)))
  }

  const mx = xs.reduce((s, x) => s + x, 0) / xs.length
  const my = ys.reduce((s, y) => s + y, 0) / ys.length
  let sxy = 0
  let sxx = 0

  xs.forEach((x, i) => {
    sxy += (x - mx) * ((ys[i] as number) - my)
    sxx += (x - mx) ** 2
  })

  return sxy / sxx
}

// ---- the report: one exact beat of the coined knit with the lift against the compressed ring ----

function axisLine(side: number): { tables: LockedTables; first: number; second: number; ring: number[]; position: Map<number, number> } {
  const weave = makeColorWeave({ side, table: 'bind' })
  const flat = new Int16Array(weave.mesh.cellCount * 24).fill(weave.moves.identity)
  const tables = lockedTables(weave, 'pass', flat)
  const l = LINE_OF[slotOfRoot([1, 0, 0, 1])] as number
  const first = LINE_FIRSTS[l] as number
  const second = OPPOSITE[first] as number
  const ring: number[] = [0]
  const position = new Map<number, number>([[0, 0]])

  for (;;) {
    const next = Math.floor((tables.target[ring[ring.length - 1]! * 24 + first] as number) / 24)

    if (next === 0) break
    position.set(next, ring.length)
    ring.push(next)
  }

  return { tables, first, second, ring, position }
}

function oneBeatAgreement(starts: readonly (readonly [number, number][])[]): { worst: number; offLineWeight: number; L: number } {
  const m = axisLine(6)
  const L = m.ring.length
  const sec: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: L, unit: 0, mix: true, lift: true }
  let worst = 0
  let offLineWeight = 0

  for (const st of starts) {
    const c: Configuration = { vibe: new Int8Array(m.tables.cells * 24), point: new Int8Array(m.tables.cells * 24), open: new Uint8Array(m.tables.cells * 24), store: new Int8Array(m.tables.cells * 12), spoint: new Int8Array(m.tables.cells * 12), sopen: new Uint8Array(m.tables.cells * 12) }
    const ts = st.map(([x, j]) => ({ x, j, f: 0 }))
    let ringState: RingState = new Map()

    ringState.set(ringKey(ts), { ts: ts.map(t => ({ ...t })).sort((p, q) => 2 * p.x + (p.j === 0 ? 1 : 0) - (2 * q.x + (q.j === 0 ? 1 : 0))), amp: [1, 0] })

    for (const [x, j] of st) {
      const slot = m.ring[x]! * 24 + (j === 0 ? m.first : m.second)

      c.vibe[slot] = 1
      c.open[slot] = 1
    }

    const lifted: Branch[] = []

    for (const b of lockedState(c).branches) lifted.push(...liftBranch(m.tables.cells, b))

    const s = coinedBeat(m.tables, { branches: mergeBranches(lifted) }, 0, { fermion: true })

    ringState = ringBeat(sec, L, ringState)

    const knit = new Map<string, number>()

    for (const b of s.branches) {
      const toks: { x: number; j: number; f: number }[] = []
      let off = false

      for (let i = 0; i < b.vibe.length; i++) {
        if (b.vibe[i] === 0) continue

        const x = m.position.get(Math.floor(i / 24))
        const d = i % 24

        if (x === undefined || (d !== m.first && d !== m.second)) off = true
        else toks.push({ x, j: d === m.first ? 0 : 1, f: 0 })
      }

      const p = Number(norm(b.a, b.b)) / 4 ** b.k

      if (off) {
        offLineWeight += p / starts.length
        continue
      }

      const key = ringKey(toks)

      knit.set(key, (knit.get(key) ?? 0) + p)
    }

    for (const k of new Set([...knit.keys(), ...ringState.keys()])) {
      const r = ringState.get(k)
      const pr = r ? r.amp[0] ** 2 + r.amp[1] ** 2 : 0

      worst = Math.max(worst, Math.abs((knit.get(k) ?? 0) - pr))
    }
  }

  return { worst, offLineWeight, L }
}

export default experiment({
  id: 'spin/lifted-mixer-vacuum',
  code: 'E-SPN-0097',
  title:
    "the lifted frame mixer Gamma(G) in the working vacuum (every frame of one content, no occupation threshold): it acts on the vacuum's own history and the chain reaction is faster, fail on Q1: on the Born path the lift moves the vacuum's like pairs of equal points about 148,000 times in 96 beats, breaking the laws (occupation momentum) at 92 beats and made = unmade, on 3 of 3 starts (keep and exchange paths untouched, reversal, C and one causal component hold everywhere); a lone love leaves its line (0.373 by beat 4 on the empty mesh, 0.516 in the vacuum), exact and reversible on 6 of 6 lone runs; the wake slope over beats 20 to 45 reads 0.042 (gate passed) only because the wake has filled the side-16 box by beat 25: over beats 5 to 15 it grows 0.618 a beat in ln against the thresholded G's 0.155; E-SPN-0093's electron returns with 0.121 after one beat (0.454 with G)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16).slice(0, STARTS)

    // ---- the report first (no vacuum) ----
    const passSector: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: BOX, unit: 0 }
    const passBasis = lineBasis(passSector)
    const cluster = lineLightest(passBasis, wholeBasis(passBasis)).lightest
    const i3 = oneBeatAgreement([
      [
        [0, 0],
        [1, 1],
        [3, 0],
      ],
      [
        [0, 0],
        [0, 1],
        [2, 0],
      ],
      [
        [0, 0],
        [2, 0],
        [4, 1],
      ],
      [
        [1, 1],
        [2, 1],
        [5, 0],
      ],
    ])
    const withG = lineSurvival(lineBasis({ ...passSector, mix: true }), cluster)
    const withLift = lineSurvival(lineBasis({ ...passSector, mix: true, lift: true }), cluster)

    log('report')

    // ---- Q3: the wake ----
    const wake = { lift: wakeCurve('lift'), g: wakeCurve(true), none: wakeCurve(false) }
    const slopes = { lift: logSlope(wake.lift.apart, SLOPE_FROM, SLOPE_TO), g: logSlope(wake.g.apart, SLOPE_FROM, SLOPE_TO), none: logSlope(wake.none.apart, SLOPE_FROM, SLOPE_TO) }
    // REPORTED, added after the first run (not a gate): the slope over beats 5 to 15, before the side-16 box fills
    const early = { lift: logSlope(wake.lift.apart, 5, 15), g: logSlope(wake.g.apart, 5, 15) }
    const gQ3 = slopes.lift < SLOPE_BOUND

    log('wake')

    // ---- Q2a, Q4 on the empty mesh ----
    const empty = withStart(startFamily(16)[0]!, () => {
      const f = contactFresh(Q_SIDE, 'pass')
      const husk = huskCoordinates(f.cells, Q_SIDE)
      const center = centerOf(Q_SIDE)

      return [
        [1, 0, 0, 1],
        [1, 1, 0, 0],
        [1, 0, 1, 0],
      ].map(r => {
        const slot = center * 24 + slotOfRoot(r)

        return { root: r, ...loneStudy(f.tables, loneStart(f.cells, slot, 1), slot, Q_SIDE, husk) }
      })
    })
    const q2a = empty.every(e => e.lifted.beats[LONE_BEATS - 1]!.offLine > 0 && e.control.beats.every(b => b.offLine === 0))

    log('empty mesh')

    // ---- Q1, Q2b, Q4 per start ----
    const perStart = family.map(member =>
      withStart(member, () => {
        const f4 = contactFresh(Q_SIDE, 'pass')
        const husk = huskCoordinates(f4.cells, Q_SIDE)
        const slot = centerOf(Q_SIDE) * 24
        const lone = loneStudy(f4.tables, loneStart(f4.cells, slot, 1, toWords(vacuumConfiguration(f4, 'none'))), slot, Q_SIDE, husk)

        log(`lone ${member.name}`)

        const paths = Object.fromEntries(PATHS.map(p => [p.name, readVacuumPath({ kind: KIND, side: SIDE, threshold: p.threshold, beats: BEATS, causalBeats: CAUSAL_BEATS, flags: LIFT })])) as Record<PathName, PathReading>

        log(`start ${member.name}`)

        return { name: member.name, paths, lone }
      }),
    )

    const g = {
      G1: (r: PathReading) => r.lawBreaks === 0,
      G2: (r: PathReading) => r.reverses,
      G3: (r: PathReading) => r.cBreaks === 0,
      G4: (r: PathReading) => r.causalLargest === 1 && r.descentMin === 512 && r.coveredBy <= DESCENT_BOUND,
      G5: (r: PathReading) => r.made === r.unmade && r.made >= r.units,
    }
    const cases = (test: (r: PathReading) => boolean, path?: PathName): number => perStart.reduce((n, p) => n + PATHS.filter(x => !path || x.name === path).filter(x => test(p.paths[x.name])).length, 0)
    const gQ1 = Object.values(g).every(test => cases(test) === 3 * family.length)
    const q2b = perStart.every(p => p.lone.lifted.beats[LONE_BEATS - 1]!.offLine > 0 && p.lone.control.beats.every(b => b.offLine === 0))
    const gQ2 = q2a && q2b
    const loneRuns = [...empty.map(e => ({ run: e.lifted, back: e.back, again: e.again })), ...perStart.map(p => ({ run: p.lone.lifted, back: p.lone.back, again: p.lone.again }))]
    const gQ4 = loneRuns.every(r => r.back && r.again && r.run.beats.every(b => b.normExact)) && cases(g.G2) === 3 * family.length

    const status = !gQ1 || !gQ2 || !gQ4 ? 'fail' : gQ3 ? 'pass' : 'partial'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (name: PathName, fn: (r: PathReading) => number): string => range(perStart.map(p => fn(p.paths[name])))
    const f6 = (x: number): string => x.toFixed(6)
    const at = (xs: readonly number[], beat: number): number => xs[beat - 1] as number
    const metrics: Record<string, number> = {
      starts: family.length,
      gate_Q1: gQ1 ? 1 : 0,
      gate_Q2: gQ2 ? 1 : 0,
      gate_Q3: gQ3 ? 1 : 0,
      gate_Q4: gQ4 ? 1 : 0,
      gateQ2a: q2a ? 1 : 0,
      gateQ2b: q2b ? 1 : 0,
      slopeLift: slopes.lift,
      slopeG: slopes.g,
      slopeNone: slopes.none,
      earlySlopeLift: early.lift,
      earlySlopeG: early.g,
      liftApart20: at(wake.lift.apart, SLOPE_FROM),
      liftApart45: at(wake.lift.apart, SLOPE_TO),
      gApart20: at(wake.g.apart, SLOPE_FROM),
      gApart45: at(wake.g.apart, SLOPE_TO),
      noneApartMax: Math.max(...wake.none.apart),
      emptyOffLineMin: Math.min(...empty.map(e => e.lifted.beats[LONE_BEATS - 1]!.offLine)),
      vacuumOffLineMin: Math.min(...perStart.map(p => p.lone.lifted.beats[LONE_BEATS - 1]!.offLine)),
      vacuumOffLineMax: Math.max(...perStart.map(p => p.lone.lifted.beats[LONE_BEATS - 1]!.offLine)),
      vacuumLiftsMax: Math.max(...perStart.map(p => p.lone.lifted.mixes)),
      electronReturnG: withG.returned,
      electronReturnLift: withLift.returned,
      electronOnLineLift: withLift.onLine,
      i3Worst: i3.worst,
      i3OffLineWeight: i3.offLineWeight,
    }

    for (const [name, test] of Object.entries(g)) for (const p of PATHS) metrics[`${name}_${p.name}`] = cases(test, p.name)
    for (const p of PATHS) {
      metrics[`${p.name}_liftMovesMax`] = Math.max(...perStart.map(s => s.paths[p.name].mixed))
      metrics[`${p.name}_lawBreaksMax`] = Math.max(...perStart.map(s => s.paths[p.name].lawBreaks))
      metrics[`${p.name}_wakeWorstMax`] = Math.max(...perStart.map(s => Math.max(...s.paths[p.name].wake.worst.flat())))
    }

    metrics.seconds = (Date.now() - started) / 1000

    const pathLine = (name: PathName): string =>
      `${name}: laws broken at ${over(name, r => r.lawBreaks)} beats, reverses on ${perStart.filter(p => p.paths[name].reverses).length}, C broken ${over(name, r => r.cBreaks)}; lift moves ${over(name, r => r.mixed)}, coin crosses ${over(name, r => r.crossed)}; made ${over(name, r => r.made)}, unmade ${over(name, r => r.unmade)}, units ${over(name, r => r.units)}; causal largest ${over(name, r => r.causalLargest)}, descent ${over(name, r => r.descentMin)} of 512, covered by beat ${over(name, r => r.coveredBy)}; wake worst ${over(name, r => Math.max(...r.wake.worst.flat()))}, off line ${over(name, r => r.wake.offLine)}, off frame ${over(name, r => r.wake.offFrame)}`
    const loneLine = (r: LoneRun): string => r.beats.map(b => `${f6(b.offLine)}/${f6(b.offFrame)}/${b.lines}/${b.branches}`).join(' ')

    return verdict({
      status,
      claim: `with Gamma(G) on every frame of one content (${family.length} starts): the vacuum holds ${gQ1} (G1 to G5 on ${Object.values(g)
        .map(test => cases(test))
        .join(', ')} of ${3 * family.length}; lift moves on the vacuum's own history ${PATHS.map(p => metrics[`${p.name}_liftMovesMax`]).join('/')} on keep/Born/exchange); a lone love leaves its line (${f6(metrics.emptyOffLineMin!)} or more by beat ${LONE_BEATS} on the empty mesh, ${f6(metrics.vacuumOffLineMin!)} to ${f6(metrics.vacuumOffLineMax!)} in the vacuum; the coin alone 0); the wake on side ${WAKE_SIDE} grows ${slopes.lift.toFixed(3)} a beat in ln over beats ${SLOPE_FROM} to ${SLOPE_TO} (${at(wake.lift.apart, SLOPE_FROM)} to ${at(wake.lift.apart, SLOPE_TO)} trits apart; E-SPN-0095's G ${slopes.g.toFixed(3)}, ${at(wake.g.apart, SLOPE_FROM)} to ${at(wake.g.apart, SLOPE_TO)}; no mixer ${slopes.none.toFixed(3)}, at most ${metrics.noneApartMax}), so the slope gate ${gQ3 ? 'passes' : 'fails'}, but only because the lifted wake had already filled the box: over beats 5 to 15 it grows ${early.lift.toFixed(3)} a beat against G's ${early.g.toFixed(3)}, and it saturates near ${Math.max(...wake.lift.apart)} trits (beat ${wake.lift.apart.indexOf(Math.max(...wake.lift.apart)) + 1}) where G is still growing, so the chain reaction is not gone, it is faster; exact and reversible on ${loneRuns.filter(r => r.back && r.again).length} of ${loneRuns.length} lone runs; E-SPN-0093's electron returns with ${withLift.returned.toFixed(4)} after one beat with the lift (with G ${withG.returned.toFixed(4)})`,
      metrics,
      control: {
        emptyControlOffLineMax: Math.max(...empty.flatMap(e => e.control.beats.map(b => b.offLine))),
        vacuumControlOffLineMax: Math.max(...perStart.flatMap(p => p.lone.control.beats.map(b => b.offLine))),
        slopeNone: slopes.none,
        slopeG: slopes.g,
      },
      notes: `L2. Gates Q1 ${gQ1}, Q2 ${gQ2} (a ${q2a}, b ${q2b}), Q3 ${gQ3}, Q4 ${gQ4}. Path gates (keep/born/exchange of ${family.length}): ${Object.keys(g)
        .map(name => `${name} ${PATHS.map(p => metrics[`${name}_${p.name}`]).join('/')}`)
        .join(', ')}. ${PATHS.map(p => pathLine(p.name)).join('. ')}. Wake trits apart per beat, side ${WAKE_SIDE}, Born: lift ${wake.lift.apart.join(' ')} (${wake.lift.seconds.toFixed(0)} s) | G ${wake.g.apart.join(' ')} | none ${wake.none.apart.join(' ')}. Empty mesh per seed root (per beat: off line/off frame/lines/branches), lift then the coin alone: ${empty.map(e => `${e.root.join(',')}: ${loneLine(e.lifted)} || ${loneLine(e.control)}; back ${e.back}, again ${e.again}`).join(' | ')}. Vacuum lone love per start (lift; lifts; back, again): ${perStart.map(p => `${p.name} ${loneLine(p.lone.lifted)}; ${p.lone.lifted.mixes}; ${p.lone.back}, ${p.lone.again}`).join(' | ')}. Report: the electron (E ${cluster.unwrapped.toFixed(5)}, share ${cluster.spinHalf.toFixed(5)}) under one compressed beat: with G ${withG.returned.toFixed(6)} (E-SPN-0095 recorded ${RETURN_WITH_G}), with the lift ${withLift.returned.toFixed(6)}, left on its line ${withLift.onLine.toFixed(6)}; instrument check: one exact beat with liftBranch against the compressed ring, worst ${i3.worst.toExponential(1)} on ring ${i3.L}, weight leaving the line ${i3.offLineWeight.toFixed(6)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
