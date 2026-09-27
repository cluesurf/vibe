// THE FRACTON HIERARCHY AND K'S REACH (E-SPN-0100). E-SPN-0098 read an exact conservation law on every mesh line with no
// mixer: the knit's fracton structure. Pretko's fractons have a hierarchy: a lone charge is immobile, a pair moves along
// a line (a lineon), and some bound composite may move freely. This file reads which rungs the working knit has, with
// NO mixer, on the 'pass' contact (E-SPN-0092), whose collision applies the isometric map K on a dock of more than one
// single and so can rotate a dock's full (vacuum) lines onto other lines; and on 'bounce', which never carries a full
// line.
//
// PROBES before this file, disclosed (all on the registered key, which on side 16 does not depend on the beat and on
// side 8 repeats every 4 beats, E-MTH-0029):
//  - tmp/pair-move-probe (side 16, 96 beats): one lone vibe 1 to 3 slots apart, cycling, on 1 mesh line, 0 to 2 dock
//    steps from its start and never further; two lone vibes meeting in one dock at beat 0: 20 to 22 slots apart by beat
//    80, on their own 2 lines, farthest step 8 (half the box); 'pass' and 'bounce' agree bit for bit.
//  - tmp/cluster-search-probe (side 8, 48 beats): every pair of lone vibes on two different lines of the center dock,
//    love+love and love+fear, 528 seeds, none overwriting a vacuum vibe: 442 reach mesh lines neither seed started on,
//    and every one stays quiet (largest wake 59 slots).
//  - tmp/cluster-long-probe (side 16, 128 beats): seeds 6+8 (love and fear) and 14+18 (two loves) hold a wake of 34 to
//    71 slots for 128 beats, each touching exactly 10 mesh lines beyond its own 2, all reached by beat 7.
//  - tmp/cluster-pair-bounce.log: on 'bounce' the 6+8 cluster stays on its own 2 lines.
// The gates below are those findings, read before this file, re-read on the full-period key (code/measure/full-key-
// paths fullPathKey) on two paths, with the old key as the control: a rerun of disclosed findings, not predictions.
//
// GATES (Born path, coin on, veto 'none', no mixer; the wake is the vibe slots differing from the unseeded run on the
// same key; lines are code/measure/full-key-paths meshLines; distance is box-basis steps, minimum image).
//  F1 immobile: one lone love (side 16, 96 beats) stays within 2 dock steps and on its own line at every beat, on both
//     contacts and every path.
//  F2 lineons: two lone loves on two lines of one dock (side 16, 96 beats) stay on their own two lines at every beat and
//     reach half the box (8 steps), on both contacts and every path.
//  F3 the hierarchy does not depend on the contact here: per beat, the wake, the lines, the docks and the farthest step
//     agree on 'pass' and 'bounce' for F1's and F2's seeds, on every path.
//  F4 K's quiet reach (side 8, 48 beats, all 528 two-vibe seeds, 'pass'): some seeds reach lines off their own, and
//     every seed's wake stays at or under 200 slots.
//  F5 bounded (side 16, 128 beats, 'pass', seeds 6+8 and 14+18): the wake stays at or under 200 slots at every beat, the
//     seeds reach at least one line off their own, and every line they ever reach is reached by beat 16.
//  F6 'bounce' has no reach: seeds 6+8 and 14+18 on 'bounce' (side 16, 64 beats) never touch a line off their own.
//  CONTROL: the old key reproduces tmp/cluster-search-probe's 442 reaching seeds and largest wake 59, and
//     tmp/cluster-long-probe's 10 lines off each seed.
//  Verdict: pass if F1 to F6 hold and the control reproduces; partial if only the control fails; fail otherwise.
//
// FIRST RUN (tmp/fk-fracton-hierarchy.log, 380 s): FAIL on F1 and F5, every other gate and the control hold.
//  - F1 DOES NOT REPRODUCE: on the full key a lone love is not immobile. It stays on its one mesh line (1 line, 0 off,
//    every beat) but runs its whole length, 8 steps (half the box) by beat 16, with a wake of at most 25. Its "within 2
//    docks, on the vacuum's 12-beat cycle" was the registered key's frozen record: the same coin choices every beat
//    fold the vibe back. So the lowest rung is not a fracton here: a lone vibe is already a lineon, and the first two
//    rungs are one.
//  - F5's timing does not reproduce: the clusters still touch exactly 10 lines off their own (both seeds, both paths)
//    and stay bounded (wake at most 105 for 128 beats, against the probe's 34 to 71), but they reach them over about
//    48 beats, not by beat 7.
//  - F2 to F4 and F6 hold: two meeting loves stay on their two lines and run to 8 steps; 'pass' and 'bounce' agree beat
//    for beat for these seeds; 434 and 436 of 528 two-vibe seeds reach off their lines, largest wake 62 and 61 (old key
//    442 and 59, reproduced); 'bounce' reaches no line.
// The rerun adds the old key's lone love to the report (not a gate), to show the immobility on the record it came from.
//
// Depth L2: a known structure (a fracton hierarchy) read on the rule's own runs. DETERMINISM: no random numbers; paths
// are integer Weyl offsets of the key. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration } from '@/code/rule/doublet-locked-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'
import { boxSteps, fullPathKey, keyedRunner, meshLines, oldPathKey, pathOffset, type MeshLines, type PathKey } from '@/code/measure/full-key-paths'

const SIDE = 16
const MOVE_BEATS = 96
const SEARCH_SIDE = 8
const SEARCH_BEATS = 48
const LONG_BEATS = 128
const BOUNCE_BEATS = 64
const PATHS = 2
const QUIET = 200
const REACHED_BY = 16
const IMMOBILE = 2
const PROBE_REACHING = 442
const PROBE_LARGEST = 59
const PROBE_LONG_LINES = 10
const SECOND = Array.from({ length: 24 }, (_, d) => d).find(d => LINE_OF[d] !== LINE_OF[0])!
const CLUSTERS = [
  [6, 8, -1],
  [14, 18, 1],
] as const

type Seed = readonly (readonly [number, number])[]
type Row = { wake: number; lines: number; off: number; docks: number; far: number }
type Trace = { rows: Row[]; offEver: number; offBy: number; maxWake: number; maxFar: number }

// one box per side and contact, built once
const boxes = new Map<string, { f: ReturnType<typeof contactFresh>; lines: MeshLines; steps: Int32Array; vacuum: Configuration }>()

function boxOf(side: number, contact: CollisionKind) {
  const name = `${side}/${contact}`
  let box = boxes.get(name)

  if (!box) {
    const center = centerOf(side)
    const f = contactFresh(side, contact, center)

    box = { f, lines: meshLines(f.tables), steps: boxSteps(f.cells, side, center), vacuum: wordVacuum(f, f.store) }
    boxes.set(name, box)
  }

  return box
}

// a seeded run against the unseeded one on the same box, key and contact; per beat the wake and where it lies
function trace(side: number, contact: CollisionKind, key: (cells: number) => PathKey, seed: Seed, beats: number): Trace {
  const center = centerOf(side)
  const { f, lines, steps, vacuum } = boxOf(side, contact)
  const start = cloneConfiguration(vacuum)

  for (const [d, tone] of seed) {
    start.vibe[center * 24 + d] = tone
    start.open[center * 24 + d] = 1
  }

  const seedLines = new Set(seed.map(([d]) => lines.lineOf[center * 24 + d] as number))
  const k = key(f.cells)
  const a = keyedRunner(f.tables, vacuum, { key: k })
  const b = keyedRunner(f.tables, start, { key: k })
  const rows: Row[] = []
  const everOff = new Set<number>()
  let offBy = 0

  for (let t = 0; t < beats; t++) {
    a.beat()
    b.beat()

    const p = a.state()
    const q = b.state()
    const touched = new Set<number>()
    const docks = new Set<number>()
    let wake = 0
    let far = 0

    for (let i = 0; i < p.vibe.length; i++) {
      if (p.vibe[i] === q.vibe[i]) continue
      wake++
      touched.add(lines.lineOf[i] as number)
      docks.add(Math.floor(i / 24))
      far = Math.max(far, steps[Math.floor(i / 24)] as number)
    }

    let off = 0

    for (const l of touched) {
      if (seedLines.has(l)) continue
      off++
      everOff.add(l)
    }

    if (t + 1 === REACHED_BY) offBy = everOff.size
    rows.push({ wake, lines: touched.size, off, docks: docks.size, far })
  }

  return { rows, offEver: everOff.size, offBy, maxWake: Math.max(...rows.map(r => r.wake)), maxFar: Math.max(...rows.map(r => r.far)) }
}

// every two-vibe seed on two lines of the center dock (side 8), against one precomputed vacuum track
function search(key: (cells: number) => PathKey): { seeds: number; overwrote: number; reaching: number; largest: number; topOff: string } {
  const center = centerOf(SEARCH_SIDE)
  const { f, lines, vacuum } = boxOf(SEARCH_SIDE, 'pass')
  const k = key(f.cells)
  const v = keyedRunner(f.tables, vacuum, { key: k })
  const track: Configuration[] = []

  for (let t = 0; t < SEARCH_BEATS; t++) {
    v.beat()
    track.push(cloneConfiguration(v.state()))
  }

  let seeds = 0
  let overwrote = 0
  let reaching = 0
  let largest = 0
  let best = { d1: 0, d2: 0, tone: 0, off: 0, wake: 0 }

  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = d1 + 1; d2 < 24; d2++) {
      if (LINE_OF[d1] === LINE_OF[d2]) continue

      for (const tone of [1, -1]) {
        const start = cloneConfiguration(vacuum)

        overwrote += (start.vibe[center * 24 + d1] !== 0 ? 1 : 0) + (start.vibe[center * 24 + d2] !== 0 ? 1 : 0)
        start.vibe[center * 24 + d1] = 1
        start.open[center * 24 + d1] = 1
        start.vibe[center * 24 + d2] = tone
        start.open[center * 24 + d2] = 1

        const seedLines = new Set([lines.lineOf[center * 24 + d1] as number, lines.lineOf[center * 24 + d2] as number])
        const b = keyedRunner(f.tables, start, { key: k })
        let offMost = 0
        let wakeMost = 0

        for (let t = 0; t < SEARCH_BEATS; t++) {
          b.beat()

          const p = track[t] as Configuration
          const q = b.state()
          const off = new Set<number>()
          let n = 0

          for (let i = 0; i < p.vibe.length; i++) {
            if (p.vibe[i] === q.vibe[i]) continue
            n++
            if (!seedLines.has(lines.lineOf[i] as number)) off.add(lines.lineOf[i] as number)
          }

          offMost = Math.max(offMost, off.size)
          wakeMost = Math.max(wakeMost, n)
        }

        seeds++
        largest = Math.max(largest, wakeMost)
        if (offMost > 0) reaching++
        if (offMost > best.off) best = { d1, d2, tone, off: offMost, wake: wakeMost }
      }
    }
  }

  return { seeds, overwrote, reaching, largest, topOff: `${best.d1}+${best.d2} tone ${best.tone}: ${best.off} lines off at wake ${best.wake}` }
}

const sameRows = (p: Trace, q: Trace): boolean => p.rows.every((r, t) => {
  const s = q.rows[t] as Row

  return r.wake === s.wake && r.lines === s.lines && r.off === s.off && r.docks === s.docks && r.far === s.far
})

export default experiment({
  id: 'spin/fracton-hierarchy',
  code: 'E-SPN-0100',
  title: 'TITLE',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const keys: ((cells: number) => PathKey)[] = Array.from({ length: PATHS }, (_, k) => () => fullPathKey(pathOffset(k)))
    const old = (cells: number): PathKey => oldPathKey(cells)
    const lone: Seed = [[0, 1]]
    const two: Seed = [
      [0, 1],
      [SECOND, 1],
    ]

    // ---- F1 to F3 ----
    const moves = keys.map(key => ({
      lonePass: trace(SIDE, 'pass', key, lone, MOVE_BEATS),
      loneBounce: trace(SIDE, 'bounce', key, lone, MOVE_BEATS),
      twoPass: trace(SIDE, 'pass', key, two, MOVE_BEATS),
      twoBounce: trace(SIDE, 'bounce', key, two, MOVE_BEATS),
    }))
    const gF1 = moves.every(m => [m.lonePass, m.loneBounce].every(r => r.maxFar <= IMMOBILE && r.rows.every(x => x.lines <= 1 && x.off === 0)))
    const gF2 = moves.every(m => [m.twoPass, m.twoBounce].every(r => r.maxFar === SIDE / 2 && r.rows.every(x => x.off === 0 && x.lines <= 2)))
    const gF3 = moves.every(m => sameRows(m.lonePass, m.loneBounce) && sameRows(m.twoPass, m.twoBounce))

    // ---- F4: the search ----
    const found = keys.map(search)
    const oldFound = search(old)
    const gF4 = found.every(s => s.reaching > 0 && s.largest <= QUIET)

    // ---- F5, F6: the clusters ----
    const seedOf = ([d1, d2, tone]: readonly [number, number, number]): Seed => [
      [d1, 1],
      [d2, tone],
    ]
    const long = keys.map(key => CLUSTERS.map(c => trace(SIDE, 'pass', key, seedOf(c), LONG_BEATS)))
    const oldLong = CLUSTERS.map(c => trace(SIDE, 'pass', old, seedOf(c), LONG_BEATS))
    // reported beside F1 (added after the first run): the lone love on the registered key, the probe's own record
    const oldLone = trace(SIDE, 'pass', old, lone, MOVE_BEATS)
    const gF5 = long.flat().every(r => r.maxWake <= QUIET && r.offEver > 0 && r.offBy === r.offEver)
    const bounced = keys.map(key => CLUSTERS.map(c => trace(SIDE, 'bounce', key, seedOf(c), BOUNCE_BEATS)))
    const gF6 = bounced.flat().every(r => r.offEver === 0)
    const control = oldFound.reaching === PROBE_REACHING && oldFound.largest === PROBE_LARGEST && oldLong.every(r => r.offEver === PROBE_LONG_LINES)
    const gates = [gF1, gF2, gF3, gF4, gF5, gF6]
    const status = !gates.every(Boolean) ? 'fail' : control ? 'pass' : 'partial'
    const metrics: Record<string, number> = {}

    gates.forEach((g, i) => (metrics[`gate_F${i + 1}`] = g ? 1 : 0))
    moves.forEach((m, k) => {
      metrics[`path${k}_loneFar`] = Math.max(m.lonePass.maxFar, m.loneBounce.maxFar)
      metrics[`path${k}_loneWakeMax`] = m.lonePass.maxWake
      metrics[`path${k}_twoFar`] = m.twoPass.maxFar
      metrics[`path${k}_twoWakeMax`] = m.twoPass.maxWake
      metrics[`path${k}_twoOff`] = m.twoPass.offEver
    })
    found.forEach((s, k) => {
      metrics[`path${k}_searchReaching`] = s.reaching
      metrics[`path${k}_searchLargest`] = s.largest
      metrics[`path${k}_searchOverwrote`] = s.overwrote
    })
    long.forEach((rs, k) =>
      rs.forEach((r, c) => {
        const name = `${CLUSTERS[c]![0]}_${CLUSTERS[c]![1]}`

        metrics[`path${k}_long${name}_offEver`] = r.offEver
        metrics[`path${k}_long${name}_wakeMax`] = r.maxWake
        metrics[`path${k}_long${name}_far`] = r.maxFar
      }),
    )
    bounced.forEach((rs, k) => rs.forEach((r, c) => (metrics[`path${k}_bounce${CLUSTERS[c]![0]}_${CLUSTERS[c]![1]}_offEver`] = r.offEver)))
    metrics.searchSeeds = oldFound.seeds
    metrics.control = control ? 1 : 0
    metrics.seconds = (Date.now() - t0) / 1000

    const every8 = (r: Trace): string => r.rows.filter((_, t) => t % 8 === 7).map(x => `${x.wake}/${x.lines}/${x.off}/${x.far}`).join(' ')

    return verdict({
      status,
      claim: `with no mixer on two full-key paths: a lone love stays within ${Math.max(...moves.map(m => m.lonePass.maxFar))} dock steps on its own line (side ${SIDE}, ${MOVE_BEATS} beats); two lone loves meeting at beat 0 stay on their own two lines and reach ${moves.map(m => m.twoPass.maxFar).join('/')} steps (half the box is ${SIDE / 2}); 'pass' and 'bounce' agree beat for beat there: ${gF3}; of ${oldFound.seeds} two-vibe seeds on side ${SEARCH_SIDE}, ${found.map(s => s.reaching).join('/')} reach lines off their own on 'pass' with the largest wake ${found.map(s => s.largest).join('/')}; the 6+8 and 14+18 clusters on side ${SIDE} hold a wake of at most ${Math.max(...long.flat().map(r => r.maxWake))} for ${LONG_BEATS} beats on ${long.flat().map(r => r.offEver).join('/')} lines off their own (all reached by beat ${REACHED_BY}: ${long.flat().every(r => r.offBy === r.offEver)}); on 'bounce' they reach ${Math.max(...bounced.flat().map(r => r.offEver))} lines off their own`,
      metrics,
      control: { oldReaching: oldFound.reaching, oldLargest: oldFound.largest, oldLong68Off: oldLong[0]!.offEver, oldLong1418Off: oldLong[1]!.offEver, oldLoneFar: oldLone.maxFar, oldLoneWakeMax: oldLone.maxWake, oldLong68OffBy16: oldLong[0]!.offBy },
      notes: `L2. Gates ${gates.map((g, i) => `F${i + 1} ${g}`).join(', ')}; control ${control}. Seeds for F2: slots 0 and ${SECOND} of the center dock. Search per path: ${found.map(s => `${s.reaching} of ${s.seeds} reach, largest ${s.largest}, overwrote ${s.overwrote}, most off-line ${s.topOff}`).join(' | ')}; old key ${oldFound.reaching}, ${oldFound.largest}, ${oldFound.topOff}. Per 8 beats (wake/lines/off/far), path 0: lone ${every8(moves[0]!.lonePass)} | two ${every8(moves[0]!.twoPass)} | 6+8 long ${every8(long[0]![0]!)} | 14+18 long ${every8(long[0]![1]!)}; old key 6+8 ${every8(oldLong[0]!)}; old key lone ${every8(oldLone)}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
