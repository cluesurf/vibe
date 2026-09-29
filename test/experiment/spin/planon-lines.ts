// A DIPOLE OF LINEONS IS NOT A PLANON IN THIS RULE (E-SPN-0117). note/research/vibe/roadmap/remaining-pieces.md, "A bent
// string" (E-SPN-0116), asks the fracton question: in the X-cube model two lineons on parallel lines one dock apart
// move sideways as a unit (a planon) by making a pair on the next line over and unmaking the old member. Can the
// rule's own pair processes do that? Derived first, then checked exactly.
//
// (a) DOES ANY PROCESS MOVE A VIBE, A STORE OR A LOVE-FEAR PAIR BETWEEN TWO PARALLEL LINES? No. The working beat
//  (code/measure/full-key-paths keyedRunner: contact 'pass', E-SPN-0092; veto 'none'; coin on; no mixer) is:
//   - the coin and the meeting (keyedCoin, keyedMeet): each reads and writes the two slots of ONE dock line.
//   - the pair move (occupation-veto-knit pairPiece): unmakes a love and a fear on the two slots of ONE dock line into
//     that line's store, or makes them back from it. A pair is made and unmade only on one line: tone 0 on that line,
//     never a love on one line and a fear on another. There is no other creation or annihilation anywhere in the rule.
//   - the bounce (bounce-pair-knit bouncePermutation): a permutation of ONE dock's slots. With at most one single line
//     on the dock it is B: every full line turns (or keeps its slots, on 'pass', when its two vibes are alike), and the
//     non-full lines take w_P only when w_P keeps the full set; P is the one single's root r, and w_r fixes r, so the
//     single keeps its slot and every empty line goes to an empty line. With two or more singles ('pass', 'lone') it is
//     K = w_P on the whole dock, which does carry vibes between lines. But every line through one dock is of a
//     DIFFERENT class: one dock's 12 lines are the 12 classes, and two parallel mesh lines never share a dock.
//   - the stream: slot d of dock x to slot d of dock x + r_d, along its own mesh line.
//  So no single piece connects two parallel lines. A two-step route (A to a crossing line C at one dock, C to A' at
//  another) needs K, and K needs a second single on the dock, which (c) shows never appears.
//  THE KLEIN CHANNEL (E-SPN-0115) is not pair creation of vibes: it is a two-token level of the stand-in with one token
//  in each energy BRANCH of its own line's walk. The stand-in's space is (love's place on its line, fear's place on
//  its line, flux) with the token count fixed, so it has no amplitude to change a token's line at all.
// (b) The planon's sideways hop amplitude is therefore exactly 0, at every order, in the knit and in the stand-in.
//  There is no leading-order term to compute, so the hop experiment (a bound dipole band, its transverse dispersion and
//  mass tensor) has nothing to read, and this file checks the conservation law instead.
// (c) THE THEOREM. Let V be the vacuum's run on a key and S a set of mesh lines of ONE class. If (Z) V holds no single
//  line on any dock at any beat, and a start equals V's start off S, then on 'pass', 'lone' and 'bounce' with veto
//  'none' and no mixer, at every beat:
//   (1) CONFINEMENT: the run equals V on every slot and store of every line outside S;
//   (2) FACTORIZATION: on each line L of S the run equals the run started from V with only L's content replaced.
//  PROOF, by induction on the pieces of a beat. Suppose (1) holds before a piece. A dock x meets at most one line of S
//  (parallel lines share no dock), so x differs from V's dock x on at most one dock line l. The coin, the meeting and
//  the pair move act line by line, with a key that reads (beat, dock, line) only and not the content, so they keep
//  every line but l equal to V's. The bounce: V's dock has no single (Z), so the run's dock has at most one (on l).
//  Then 'pass' and 'lone' take B, as 'bounce' always does. If l is not single, P = 0 on both docks, w_0 = -1 keeps
//  every line, and each line is turned or kept by its own content. If l is single, P = r (its root), and on the other
//  lines B does what it does on V's dock: full lines turn or keep by their own content, empty lines stay empty (w_r,
//  if it acts, carries non-full lines to non-full lines and fixes r). So only l can differ after the bounce. The
//  stream carries each slot along its own mesh line. So (1) holds after every piece. For (2): in the argument above
//  the update of l at x reads only l's own content, x's key, and V's content on the other lines, which is the same in
//  the joint run and in L's own run; so the two agree on L at every beat. QED.
//  What it means: a composite on parallel lines is exactly independent lineons. They cannot bind through the knit (no
//  piece couples them), let alone hop sideways. Pair creation does not help, because it is line-local. The fracton
//  restriction on parallel lines is EXACT in this rule, with no mixer.
//  WHAT IT DOES NOT SAY, and the caller's finding overstates. "The rule conserves each composite's set of occupied
//  lines" is not true in general. Two singles on crossing lines at one dock take K on 'pass' (the whole dock turned by
//  w_P, vacuum pairs included), or B's swap at 90 and 120 degrees (E-SPN-0110). Control C2 counts these. So crossing
//  lines are not closed by this theorem. That case is E-SPN-0110 and E-SPN-0116's geometric theorem: the pair is held at
//  the crossing, since a common shift takes both from it.
//  Condition (Z) is a property of the vacuum's run, not of the rule, so it is checked at every beat (T0), not assumed.
//
// THE CHECK (L1: a derived theorem, read exactly on the rule's own runs). Side 8 (4,096 docks, 6,144 mesh lines), 128
// beats, 16 starts, each on 1 to 3 parallel lines of one class through the center dock and a chain of neighbors one dock
// apart. Start 0 is the planon candidate: a love on line A at the center, a fear on the parallel line A' one dock over.
// Starts 1 to 7 are sparse (a love, a fear, a full love-fear pair, or a stored pair on each line); starts 8 to 15 are
// dense (every slot and store of every line of S filled by an integer hash: vibes, points, open bits, stores, words).
// Paths: 'pass' on the full key offsets 0 and 7919 and the old key (Born threshold), 'pass' on the keep path and the
// exchange path (thresholds 0 and 65536), 'lone' and 'bounce' on the full key (Born). Seven variants in all.
//
// GATES, fixed before the first run.
//  T0 the premise: every mesh line has one class along its whole length, and the vacuum's run has 0 single lines on
//     every dock at every beat, on every variant.
//  T1 confinement: on every variant, every start's run equals the vacuum's on every slot and store off S at every beat
//     (0 differing readings in all).
//  T2 factorization: on every variant, every start with 2 or 3 lines equals its lines' own runs on S at every beat (0
//     differing readings in all).
//  T3 not vacuous: on 'pass' full key offset 0, some sparse start's difference from the vacuum reaches at least 2 box
//     steps from the center; and over all variants, S's stores change at least once where the vacuum's did not (pair
//     making and unmaking act on S).
// CONTROLS (a failed control makes the verdict partial).
//  C1 the gate can fail: on 'isometric' (K on every dock, the contact B replaced) start 0 leaves S.
//  C2 crossing lines are not closed: of the 44 starts with a love on the center's slot 0 and a love or fear on another
//     class's slot of the same dock ('pass', full key 0, 48 beats), at least one differs from the vacuum off its two
//     lines. Reported beside it, not gated: how many change the per-line tone excess from its start.
//  Verdict: pass if T0 to T3 and both controls hold; partial if only a control fails; fail otherwise.
//
// FIRST RUN (tmp/planon-run1.log, 163 s): PASS on every gate and control. The vacuum holds 0 single lines. Off S, 0
// readings differ from the vacuum, and on S, 0 differ from the lines' own runs, on all 7 variants. The sparse starts
// reach 4 box steps (half the box), and S's stores change 18,672 times where the vacuum's do not. 'isometric' leaves S
// at beat 1. Of the 44 crossing pairs, 32 reach lines off their own two, and all 44 change their per-line tone
// excess. So E-SPN-0098's line tone law, read there on a lone love, does NOT hold for two singles meeting on one dock.
// PROBE before this file, disclosed: tmp/planon-probe.ts (side 8, 64 beats, start 0 only) gave 0 vacuum singles and
// 0 off-S readings on 'pass' and 'bounce', and off S from beat 2 on 'isometric'.
//
// DETERMINISM: no random numbers; starts are integer hashes, paths integer Weyl keys. NOTHING MOVES: each slot takes the
// value a piece hands it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import {
  THRESHOLD_BORN,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
} from '@/code/measure/doublet-locked-readings'
import {
  cloneConfiguration,
  type Configuration,
} from '@/code/rule/doublet-locked-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import {
  boxSteps,
  fullPathKey,
  keyedRunner,
  meshLines,
  oldPathKey,
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import {
  hash,
  lineClasses,
  lineMembers,
  parallelRun,
  toneExcess,
  type ParallelReading,
} from '@/code/measure/planon-lines'

const SIDE = 8
const BEATS = 128
const STARTS = 16
const SPARSE = 8
const CROSS_BEATS = 48
const REACH = 2

type Variant = {
  name: string
  contact: CollisionKind
  key: (cells: number) => PathKey
  threshold: number
}

const VARIANTS: Variant[] = [
  {
    name: 'pass_full0',
    contact: 'pass',
    key: () => fullPathKey(0),
    threshold: THRESHOLD_BORN,
  },
  {
    name: 'pass_full7919',
    contact: 'pass',
    key: () => fullPathKey(7919),
    threshold: THRESHOLD_BORN,
  },
  {
    name: 'pass_old',
    contact: 'pass',
    key: cells => oldPathKey(cells),
    threshold: THRESHOLD_BORN,
  },
  {
    name: 'pass_keep',
    contact: 'pass',
    key: () => fullPathKey(0),
    threshold: THRESHOLD_KEEP,
  },
  {
    name: 'pass_exchange',
    contact: 'pass',
    key: () => fullPathKey(0),
    threshold: THRESHOLD_EXCHANGE,
  },
  {
    name: 'lone_full0',
    contact: 'lone',
    key: () => fullPathKey(0),
    threshold: THRESHOLD_BORN,
  },
  {
    name: 'bounce_full0',
    contact: 'bounce',
    key: () => fullPathKey(0),
    threshold: THRESHOLD_BORN,
  },
]

type Box = {
  f: ReturnType<typeof contactFresh>
  lines: MeshLines
  vacuum: Configuration
  steps: Int32Array
  center: number
}

const boxes = new Map<CollisionKind, Box>()

function boxOf(contact: CollisionKind): Box {
  let box = boxes.get(contact)

  if (!box) {
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, contact, center)

    box = {
      f,
      lines: meshLines(f.tables),
      vacuum: wordVacuum(f, f.store),
      steps: boxSteps(f.cells, SIDE, center),
      center,
    }
    boxes.set(contact, box)
  }

  return box
}

type Start = {
  start: Configuration
  set: number[]
  sparse: boolean
  slot: number
}

// start k: 1 to 3 parallel lines (the class of slot d0) through the center and a chain of neighbors one dock apart
function buildStart(box: Box, k: number): Start {
  const { f, lines, vacuum, center } = box
  const d0 = k === 0 ? 0 : (k * 7) % 24
  const c = LINE_OF[d0]!
  const count = k === 0 ? 2 : 1 + (k % 3)
  const others = Array.from({ length: 24 }, (_, d) => d).filter(
    d => LINE_OF[d] !== c,
  )
  const docks = [center]
  const set = [lines.lineOf[center * 24 + d0]!]

  for (let j = 1; set.length < count; j++) {
    const prev = docks[docks.length - 1]!

    let placed = false

    for (let m = 0; m < others.length && !placed; m++) {
      const e = others[(hash(k, j) + m) % others.length]!
      const y = f.weave.mesh.neighbour(prev, e)
      const L = lines.lineOf[y * 24 + d0]!

      if (set.includes(L)) {
        continue
      }

      docks.push(y)
      set.push(L)
      placed = true
    }

    if (!placed) {
      throw new Error(
        `planon-lines: start ${k} found no new parallel line`,
      )
    }
  }

  const start = cloneConfiguration(vacuum)
  const sparse = k < SPARSE

  if (sparse) {
    docks.forEach((x, j) => {
      const i = x * 24 + d0
      const o = x * 24 + OPPOSITE[d0]!
      const kind = k === 0 ? j : (k + j) % 4
      const l = LINE_OF[d0]!
      const first = x * 24 + LINE_FIRSTS[l]!
      const second = x * 24 + OPPOSITE[LINE_FIRSTS[l]!]!

      // clear the dock line, then place: 0 a love, 1 a fear, 2 a full love-fear pair, 3 a stored pair
      for (const s of [first, second]) {
        start.vibe[s] = 0
        start.open[s] = 0
      }

      start.store[x * 12 + l] = 0
      start.sopen[x * 12 + l] = 0

      if (kind === 0 || kind === 2) {
        start.vibe[i] = 1
        start.point[i] = hash(k, i) % 9
        start.open[i] = 1
      }

      if (kind === 1 || kind === 2) {
        start.vibe[o] = -1
        start.point[o] = hash(k, o) % 9
        start.open[o] = 1
      }

      if (kind === 3) {
        start.store[x * 12 + l] = hash(k, x) % 2 === 0 ? 1 : -1
        start.spoint[x * 12 + l] = hash(k, x + 1) % 81
        start.sopen[x * 12 + l] = 3
      }
    })
  } else {
    const members = lineMembers(lines, set)

    members.slots.flat().forEach(i => {
      const h = hash(k, i)

      start.vibe[i] = (h % 3) - 1
      start.point[i] = (h >> 2) % 9
      start.open[i] = (h >> 6) % 2
    })

    members.stores.flat().forEach(s => {
      const h = hash(k + 101, s)

      start.store[s] = (h % 3) - 1
      start.spoint[s] = (h >> 2) % 81
      start.sopen[s] = (h >> 9) % 4
    })
  }

  return { start, set, sparse, slot: d0 }
}

export default experiment({
  id: 'spin/planon-lines',
  code: 'E-SPN-0117',
  title:
    "a dipole of lineons on parallel mesh lines is not a planon, pass at L1: no piece of the working knit carries a vibe, a store or a love-fear pair between parallel lines (pairs are made and unmade on one dock line, and the bounce with at most one single on a dock keeps every line), so given a vacuum with no single line (Z), a start differing from it only on lines of one class stays equal to it off those lines and equals each line's own run on them, exactly; on side 8 over 128 beats, 16 starts (a love on A and a fear on A' one dock over, sparse pairs and stores, dense hashed fills) on 7 path variants of 'pass', 'lone' and 'bounce': 0 vacuum singles, 0 readings off S, 0 unfactored, reach 4 box steps, 18,672 store changes on S; so the sideways hop amplitude is exactly 0 and the Klein channel (one token per branch of its own line's walk) cannot supply it; K on every dock leaves S at beat 1, and 32 of 44 pairs on crossing lines at one dock reach other lines while all 44 move their per-line tone, so the occupied-line set and E-SPN-0098's line tone are conserved only for parallel composites",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const t0 = Date.now()
    const metrics: Record<string, number> = {}
    const lineNotes: string[] = []

    let constant = true
    let vacuumSingles = 0
    let off = 0
    let unfactored = 0
    let storeEvents = 0
    let sparseReach = 0

    for (const v of VARIANTS) {
      const box = boxOf(v.contact)
      const key = v.key(box.f.cells)
      const classes = lineClasses(box.lines)

      constant &&= classes.constant

      const readings: ParallelReading[] = []

      for (let k = 0; k < STARTS; k++) {
        const s = buildStart(box, k)
        const r = parallelRun({
          tables: box.f.tables,
          vacuum: box.vacuum,
          start: s.start,
          lines: box.lines,
          set: s.set,
          key,
          threshold: v.threshold,
          beats: BEATS,
          steps: box.steps,
          factor: s.set.length > 1,
        })

        readings.push(r)

        if (v.name === 'pass_full0' && s.sparse) {
          sparseReach = Math.max(sparseReach, r.reach)
        }

        if (v.name === 'pass_full0' && k < 4) {
          lineNotes.push(
            `start ${k} (${s.set.length} lines, class ${LINE_OF[s.slot]}, ${s.sparse ? 'sparse' : 'dense'}): wake at most ${r.wake}, reach ${r.reach}, store events ${r.storeEvents}`,
          )
        }
      }

      const vOff = readings.reduce((a, r) => a + r.off, 0)
      const vUnfactored = readings.reduce((a, r) => a + r.unfactored, 0)
      const vSingles = readings[0]!.vacuumSingles
      const vStore = readings.reduce((a, r) => a + r.storeEvents, 0)

      off += vOff
      unfactored += vUnfactored
      vacuumSingles += vSingles
      storeEvents += vStore
      metrics[`${v.name}_off`] = vOff
      metrics[`${v.name}_unfactored`] = vUnfactored
      metrics[`${v.name}_vacuumSingles`] = vSingles
      metrics[`${v.name}_storeEvents`] = vStore
      metrics[`${v.name}_wakeMax`] = Math.max(
        ...readings.map(r => r.wake),
      )
    }

    // ---- C1: K on every dock ----
    const iso = boxOf('isometric')
    const isoStart = buildStart(iso, 0)
    const isoRun = parallelRun({
      tables: iso.f.tables,
      vacuum: iso.vacuum,
      start: isoStart.start,
      lines: iso.lines,
      set: isoStart.set,
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
      beats: BEATS,
      steps: iso.steps,
      factor: false,
    })
    const gC1 = isoRun.off > 0

    // ---- C2: crossing lines at one dock ----
    const pass = boxOf('pass')
    const key = fullPathKey(0)
    const track: Configuration[] = []
    const plain = keyedRunner(pass.f.tables, pass.vacuum, { key })

    for (let t = 0; t < CROSS_BEATS; t++) {
      plain.beat()
      track.push(cloneConfiguration(plain.state()))
    }

    let crossSeeds = 0
    let crossLeaving = 0
    let crossToneMoved = 0

    for (let e = 0; e < 24; e++) {
      if (LINE_OF[e] === LINE_OF[0]) {
        continue
      }

      for (const tone of [1, -1]) {
        const start = cloneConfiguration(pass.vacuum)
        const a = pass.center * 24
        const b = pass.center * 24 + e

        start.vibe[a] = 1
        start.open[a] = 1
        start.vibe[b] = tone
        start.open[b] = 1

        const two = new Set([
          pass.lines.lineOf[a]!,
          pass.lines.lineOf[b]!,
        ])
        const run = keyedRunner(pass.f.tables, start, { key })
        const first = toneExcess(pass.lines, start, pass.vacuum)

        let leaves = false
        let moved = false

        for (let t = 0; t < CROSS_BEATS; t++) {
          run.beat()

          const q = run.state()
          const p = track[t]!

          for (let i = 0; i < q.vibe.length && !leaves; i++) {
            if (
              q.vibe[i] !== p.vibe[i] &&
              !two.has(pass.lines.lineOf[i]!)
            ) {
              leaves = true
            }
          }

          if (!moved && toneExcess(pass.lines, q, p) !== first) {
            moved = true
          }
        }

        crossSeeds++

        if (leaves) {
          crossLeaving++
        }

        if (moved) {
          crossToneMoved++
        }
      }
    }

    const gC2 = crossLeaving > 0
    const gT0 = constant && vacuumSingles === 0
    const gT1 = off === 0
    const gT2 = unfactored === 0
    const gT3 = sparseReach >= REACH && storeEvents > 0
    const gates = [gT0, gT1, gT2, gT3]
    const status = !gates.every(Boolean)
      ? 'fail'
      : gC1 && gC2
        ? 'pass'
        : 'partial'

    gates.forEach((g, i) => (metrics[`gate_T${i}`] = g ? 1 : 0))
    Object.assign(metrics, {
      control_C1: gC1 ? 1 : 0,
      control_C2: gC2 ? 1 : 0,
      linesSide8: boxOf('pass').lines.count,
      vacuumSingles,
      offTotal: off,
      unfactoredTotal: unfactored,
      storeEventsTotal: storeEvents,
      sparseReach,
      isometricOff: isoRun.off,
      isometricFirstOff: isoRun.firstOff,
      crossSeeds,
      crossLeaving,
      crossToneMoved,
      seconds: (Date.now() - t0) / 1000,
    })

    return verdict({
      status,
      claim: `on side ${SIDE} over ${BEATS} beats, ${STARTS} starts on 1 to 3 parallel mesh lines of one class (start 0 a love on A and a fear on the parallel A' one dock over), 7 path variants on 'pass', 'lone' and 'bounce': the vacuum holds ${vacuumSingles} single lines (condition Z), ${off} readings off S differ from the vacuum, and ${unfactored} readings on S differ from the lines' own runs; the S content moves (sparse reach ${sparseReach} box steps) and S's stores change where the vacuum's do not ${storeEvents} times; K on every dock ('isometric') takes start 0 off S from beat ${isoRun.firstOff} (${isoRun.off} readings); of ${crossSeeds} pairs on crossing lines at one dock, ${crossLeaving} reach lines off their own and ${crossToneMoved} move their per-line tone`,
      metrics,
      control: { isometricOff: isoRun.off, crossLeaving, crossSeeds },
      notes: `L1. Gates T0 ${gT0} (lines of one class ${constant}), T1 ${gT1}, T2 ${gT2}, T3 ${gT3}; controls C1 ${gC1}, C2 ${gC2}. ${lineNotes.join(' | ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
