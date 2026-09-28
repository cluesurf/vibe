// THE LINKS' POINT MOVES ARE CURVATURE, AND THE WORKING BEAT READS THEM ONLY AT A LIKE MEETING (E-SPN-0132).
// note/research/vibe/roadmap/remaining-pieces.md, "The Pauli-blocked mixer (E-SPN-0130)": with FLAT links a filled love
// sea and the fermionic frame mixer let a lone hole move freely in 3d (inverse mass tensor isotropic to 3e-9); on the
// working links the stream's point moves split the sea's points, so a hole's frame is rarely one content. Two questions
// were left:
//  A. are the link point moves gauge (so "flat links" is a choice of frame) or curvature?
//  B. (Q3b) does a string-bound composite hold in the flat, or gauge-equivalent, love sea with the mixer?
//
// DERIVED BEFORE THE RUNS.
// 1. HOLONOMY DECIDES IT (code/measure/link-holonomy). A link (x, d) carries a point p to g(x, d) p, g in ASL(2, 3)
//    (216 elements, faithful on the 9 points). A frame change h(x) at every dock conjugates each loop's holonomy by
//    h(x), so a loop's holonomy is trivial in every frame or in none: the links are pure gauge exactly when every
//    contractible loop has the identity holonomy, and then h is built by transport from one dock along a spanning tree.
//    The elementary loops of D4 are the triangles (a . b = -1, three lines of three different frames), the squares
//    (a . b = 0, two lines of one frame) and the rhombi (a . b = +-1, two triangles glued): together they span every
//    contractible loop, and triangles and rhombi are the loops that mix line classes. Noncontractible loops are the
//    rings of the side-8 torus (6,144 of them, 8 links each).
// 2. THE LINKS ARE A WEYL SEQUENCE OF GROUP ELEMENTS (code/rule/vibe-weave linkStart), chosen link by link with no
//    relation between neighbours, so a product of 3 or 4 of them is the identity only by accident: PREDICTED, nearly
//    every elementary loop curved (a uniformly spread element is the identity 1 time in 216), CURVATURE.
// 3. WHAT THE WORKING BEAT CAN READ OF IT. The working keyed beat (code/measure/hub-star starBeat: coin, meeting, the
//    collision with veto 'none', stream) and E-SPN-0130's mixer read a point in exactly two places: the like meeting
//    asks whether its two points are EQUAL (equal: a phase; unequal: keep or exchange), and the mixer asks whether a
//    frame's vibes carry one point. Both are comparisons at ONE dock, so the beat commutes with every frame change
//    (the configuration's points and stored words mapped by h(x), the links conjugated): COVARIANCE, checked bit for
//    bit. And no piece's action on the OCCUPATION (vibe trits, store trits, open bits) reads a point: the meeting keeps
//    the occupation, the coin and the bounce read held-or-not, the pair move 'none' has no veto, the stream moves
//    values. So on every path the occupation is the SAME on any links: LINK-BLINDNESS, checked bit for bit. What the
//    curvature decides is which like meetings see equal points, and whether a sea frame is one content.
// 4. CONSEQUENCES FOR WHAT ELSE USES THE LINKS, derived from 3.
//    - the line law (E-SPN-0098) is a law of tones, an occupation law: link-blind, curvature plays no part
//    - the contact tables ('pass', the bounce, K) read occupations: link-blind; so E-SPN-0130's cascade of the
//      working vacuum under the mixer is not a curvature effect either (it is the vacuum's partial filling)
//    - E-SPN-0104's level sits on ONE mesh line: a line encloses no contractible loop, so transport along it is pure
//      gauge up to its ring's holonomy (E-SPN-0104's own finding); the contractible curvature cannot enter it
//    - E-SPN-0130's love sea: a frame's eight slots stream only along the frame's four orthogonal roots, so a one-
//      content sea needs, per frame, a point field that every frame link carries onto itself: it needs the frame's
//      SQUARES (and its rings) to fix a common point, and never looks at a triangle. That field is what E-SPN-0130
//      found missing (10,820 to 10,870 defects per frame component)
// 5. IF A FRAME FIELD h EXISTS, E-SPN-0130 CARRIES OVER: the flat links' gauge class is every h(y) h(x)^-1, and on
//    those links the love sea in the frame h (point h(x) 0 at dock x) is E-SPN-0130's flat run mapped by h, bit for bit
//    (covariance). Read on a Weyl frame field (linkStart at offset 1), whether or not the working links are in it.
// 6. B, THE COMPOSITE. Relative to the full love sea every change lowers L - F or keeps it: a hole is -1, a fear
//    (a love turned) is -2, a stored pair is 0. Nothing raises it, the sea holding every love it can: there is NO
//    OPPOSITE CHARGE of a hole, so no hole-antihole meson. The string is Z3 (the drift cost's register mod 3, E-GRV-0127):
//    a hole is -1 and a fear -2 = +1 mod 3, so the Z3-neutral pair IS a hole and a fear. But the fear is not an
//    excitation of the sea: it shares its dock line with a sea love, and the pair move (veto 'none', store empty)
//    unmakes that line at the fear's first collision, leaving a store and two holes (F + S and H - 2 S are kept,
//    E-SPN-0130 (d)). The mixer never reaches the fear first (its frame holds two contents) and the coin never does (its
//    line is full). So after one beat a hole and a fear ARE three holes and a static store: the love sea's smallest
//    string-bound composite is three holes, the particle-hole image of E-SPN-0104's three-love level, a three-body
//    problem. Its route-free stand-in (the Steiner length, the fewest frame links joining three docks, as the cost)
//    needs 512 slot triples per offset pair; E-SPN-0104's level spans R 4.2, so its window must reach a Steiner length
//    near 10, 5,482,753 offset pairs (2.8e9 amplitudes), where the two-body stand-in E-SPN-0131 used 16,641 x 64.
//    So H1 to H3 are NOT COMPUTED here: undecided, with the reason counted. The closest two-body reading is E-SPN-0131:
//    its route-free love-fear meson on the empty mesh (a hole is a love's particle-hole image) does not bind at the
//    working mixer angle (fidelity 0.26, tail 0.68), which bears on the three-hole case but does not decide it.
//
// GATES, fixed before the gated run.
//  G1 (A's verdict) the contractible loops with a nontrivial holonomy on the working links, side 8, every elementary
//     loop of every dock, counted: 0 is GAUGE (and the frame field is then built and read), more is CURVATURE. Where it
//     sits (per kind, per dock, fixing a point or not, element orders) and the rings are reported.
//  A2 covariance: the working keyed beat with and without the mixer, on the working vacuum with E-SPN-0115's meson,
//     path 0, 128 beats, equals its frame-changed run under h bit for bit (0 slots off).
//  A3 link-blindness: the same start on the working and on flat links, 4 paths, 128 beats, 0 occupation readings off;
//     the like meetings with equal and unequal points reported on both.
//  A4 carry-over: the E-SPN-0130 hole on pure-gauge links (h(y) h(x)^-1) in the love sea of frame h equals the flat
//     run mapped by h, 4 paths, 128 beats, 0 off, and touches the same mesh lines.
//  B0 the love sea's charges: a lone fear, and a hole with a fear at Y, on the flat sea, 4 paths, 128 beats: 0 fears
//     after beat 1 on every path, and F + S, H - 2 S constant at every beat.
//  H1, H2, H3 not computed (6): Q3b undecided.
// CHECKS (a failed check makes the verdict partial): every walk closes; flat links and pure-gauge links read 0 curved
// loops and 0 curved rings; the working links changed by the frame h read the working census exactly (a class
// function); ONE planted link (a translation, fixing no point) on flat links curves exactly the loops through its edge
// (8 triangles, 6 squares, 16 rhombi) and 1 ring; the root order agrees with the rule's own opposite slots.
// Verdict: partial if a check or A2 to A4 or B0 fails; otherwise open (A decided by G1, B undecided).
// PROBES, disclosed (instrument only): tmp/flat-probe1-8.log (the census on four link sets, 7 s), tmp/flat-probe2.log
// (covariance, blindness and carry-over at 32 beats, 0 off each; like meetings over 32 beats 6,087 equal and 78,362
// unequal on the working links against 66,927 and 17,522 on flat links).
// FIRST RUN (tmp/flat-exp-run1.log, 44 s): OPEN, as derived. Every check passes.
//  - G1: 399,485 of 401,408 contractible elementary loops are curved: triangles 130,419 of 131,072, squares 73,430 of
//    73,728, rhombi 195,636 of 196,608, at every one of 4,096 docks for every kind; element orders 2, 3, 4 and 6; about
//    a quarter fix no point (triangles 33,342, squares 19,544, rhombi 50,625). 6,121 of 6,144 rings are curved. CURVATURE.
//  - Checks: flat and pure-gauge links 0 curved loops and rings; the working links under the frame h read the same
//    census; one planted translation curves 8 triangles, 6 squares, 16 rhombi and 1 ring, as derived; 0 open walks.
//  - A2: 0 slots off with and without the mixer. A3: 0 occupation readings off on 4 of 4 paths, while the points
//    differ at 2,197,314 to 2,199,464 readings a path; like meetings with equal points 111,585 of 1,320,467 on the
//    working links against 1,047,847 on flat links (the vacuum's own layout points make the rest unequal).
//  - A4: the pure-gauge hole equals the flat run mapped by h, 0 off on 4 of 4 paths, touching 34 to 39 mesh lines
//    (mean 36.25) and gated on 128 of 128 beats; on the working links the same hole touches 1 line, gated 1.25 beats.
//    Point field defects: 10,820 to 10,870 working, 0 pure gauge.
//  - B0: a lone fear is 2 holes and 1 store after beat 1, a hole and a fear 3 holes and 1 store, 0 fears, on every
//    path; F + S and H - 2 S kept at every beat; on 2 of 8 tracks a fear comes back later (two holes returning to the
//    store's line remake the pair) and unmakes again. H1 to H3 not computed: the three-hole window at Steiner length
//    10 is 5,482,753 offset pairs x 512 slot triples (2.8e9) against the two-body 16,641 x 64.
//
// Depth L1: exact integer holonomies and exact equalities of runs of the rule (lattice gauge theory's classification of
// a connection, applied to the rule's own tables). DETERMINISM: no random numbers; the frame field is an integer Weyl
// sequence. NOTHING MOVES: a holonomy is read off the tables; in the runs each piece hands a value to a slot and the
// stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, meshLines, pathOffset } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { starBeat, type KEvent } from '@/code/measure/hub-star'
import { fermionTrack, keyedFermionMix, newFermionTally, placeInSea, pointFieldDefects, seaConfiguration } from '@/code/measure/pauli-mixer'
import {
  configurationsApart,
  fixedPoints,
  flatLinks,
  gaugeConfiguration,
  gaugeLinks,
  holonomyCensus,
  likeMeetings,
  LOOP_KINDS,
  LOOPS_THROUGH_EDGE,
  occupationsApart,
  plantedLinks,
  ringHolonomies,
  ROOT_OPPOSITE,
  seaCounts,
  steinerOffsetPairs,
  tablesOn,
  type HolonomyTally,
  type LoopKind,
} from '@/code/measure/link-holonomy'
import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { linkStart } from '@/code/rule/vibe-weave'

const SIDE = 8
const BEATS = 128
const PATHS = 4
const FRAME_OFFSET = 1
const STEINER_REACH = 10
const TWO_BODY_REACH = 12
const SLOT_TRIPLES = 512
const SLOT_PAIRS = 64

export default experiment({
  id: 'spin/link-holonomy',
  code: 'E-SPN-0132',
  title:
    "the links' point moves are curvature, not gauge, and the working beat reads them only where a like meeting compares two points, open (Q3b undecided): on side 8, 399,485 of 401,408 contractible elementary loops carry a nontrivial ASL(2,3) holonomy (triangles 130,419 of 131,072, squares 73,430 of 73,728, rhombi 195,636 of 196,608, curved at all 4,096 docks, orders 2 to 6, about a quarter fixing no point) and 6,121 of 6,144 rings, while flat and pure-gauge links read 0 and one planted translation curves exactly the 8, 6 and 16 loops through its edge; the working keyed beat, with or without the Pauli mixer, commutes with every frame change (0 slots off) and its occupation is the same on flat links on 4 of 4 paths over 128 beats (0 readings off), so the line law, the contacts, K and the working vacuum's cascade are link-blind and the curvature decides only which like meetings see equal points (111,585 of 1,320,467 against 1,047,847 on flat links) and whether a sea frame is one content, which needs the frame squares to fix a common point (10,820 to 10,870 defects per frame component); on pure-gauge links E-SPN-0130's hole is its flat run bit for bit (0 off, 34 to 39 mesh lines), on the working links a lineon; the love sea holds no opposite charge of a hole, and its Z3-neutral pair, a hole and a fear, is three holes and a store after one beat on every path, so the composite is a three-body question (2.8e9 amplitudes in a route-free window) left undecided",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const X = centerOf(SIDE)
    const fr = contactFresh(SIDE, 'pass', X)
    const w = fr.weave
    const cells = fr.cells
    const B = rootIndex([1, 1, 0, 0])
    const Y = Math.floor((fr.tables.target[X * 24 + B] as number) / 24)
    const h = Int16Array.from({ length: cells }, (_, x) => linkStart(x, w.moves.act.length, FRAME_OFFSET))
    const working = fr.tables
    const flat = tablesOn(w, 'pass', flatLinks(w))
    const pure = tablesOn(w, 'pass', gaugeLinks(w, flatLinks(w), h))
    const workingGauged = tablesOn(w, 'pass', gaugeLinks(w, w.links, h))

    // ---- A: the census ----
    const census = { working: holonomyCensus(working), flat: holonomyCensus(flat), pure: holonomyCensus(pure), gauged: holonomyCensus(workingGauged) }
    const rings = { working: ringHolonomies(working), flat: ringHolonomies(flat), pure: ringHolonomies(pure), gauged: ringHolonomies(workingGauged) }
    // the planted link: a pure translation (p -> p + (1, 0)), which fixes no point
    const shift = w.moves.act.findIndex(t => t.every((q, p) => q === ((p % 3) + 1) % 3 + 3 * Math.floor(p / 3)))
    const planted = tablesOn(w, 'pass', plantedLinks(w, X, B, shift))
    const plantedCensus = holonomyCensus(planted)
    const plantedRings = ringHolonomies(planted).filter(r => r.order !== 1).length
    const curvedOf = (c: Record<LoopKind, HolonomyTally>): number => LOOP_KINDS.reduce((s, k) => s + c[k].curved, 0)
    const loopsOf = (c: Record<LoopKind, HolonomyTally>): number => LOOP_KINDS.reduce((s, k) => s + c[k].loops, 0)
    const curvedRings = (r: { order: number }[]): number => r.filter(x => x.order !== 1).length
    const sameTally = (a: HolonomyTally, b: HolonomyTally): boolean => a.loops === b.loops && a.curved === b.curved && a.fixing === b.fixing && JSON.stringify(a.orders) === JSON.stringify(b.orders)
    const G1count = curvedOf(census.working)
    const verdictA = G1count === 0 ? 'gauge' : 'curvature'
    const fieldWorking = pointFieldDefects(working).flat()
    const fieldPure = pointFieldDefects(pure).flat()
    const instrument =
      LOOP_KINDS.every(k => census.working[k].open === 0 && census.flat[k].open === 0) &&
      curvedOf(census.flat) === 0 &&
      curvedOf(census.pure) === 0 &&
      curvedRings(rings.flat) === 0 &&
      curvedRings(rings.pure) === 0 &&
      LOOP_KINDS.every(k => sameTally(census.working[k], census.gauged[k])) &&
      JSON.stringify(rings.working.map(r => [r.order, r.fixed])) === JSON.stringify(rings.gauged.map(r => [r.order, r.fixed])) &&
      shift >= 0 &&
      LOOP_KINDS.every(k => plantedCensus[k].curved === LOOPS_THROUGH_EDGE[k] && plantedCensus[k].fixless === LOOPS_THROUGH_EDGE[k]) &&
      plantedRings === 1 &&
      ROOT_OPPOSITE.every((o, d) => o === OPPOSITE[d])

    log('census')

    // ---- the runs ----
    const run = (tables: LockedTables, start: Configuration, path: number, mix: boolean, each: (t: number, c: Configuration) => void): void => {
      let a = cloneConfiguration(start)
      let b = cloneConfiguration(start)
      const key = fullPathKey(pathOffset(path))
      const events: KEvent[] = []
      const tally = newFermionTally()

      for (let t = 0; t < BEATS; t++) {
        keyedFermionMix(tables, a, key, t, mix, tally)
        starBeat(tables, a, b, key, THRESHOLD_BORN, t, events)
        ;[a, b] = [b, a]
        each(t, a)
      }
    }
    const record = (tables: LockedTables, start: Configuration, path: number, mix: boolean): Configuration[] => {
      const out: Configuration[] = []

      run(tables, start, path, mix, (_, c) => out.push(cloneConfiguration(c)))

      return out
    }
    const vacuum = wordVacuum(fr, fr.store)
    const meson = placeVibes(vacuum, [
      { dock: X, slot: B, vibe: 1 },
      { dock: Y, slot: B, vibe: -1 },
    ])
    const paths = Array.from({ length: PATHS }, (_, k) => k)

    // A2: covariance
    const covariance = [false, true].map(mix => {
      const ref = record(working, meson, 0, mix)
      let off = 0

      run(workingGauged, gaugeConfiguration(w, meson, h), 0, mix, (t, c) => (off += configurationsApart(gaugeConfiguration(w, ref[t] as Configuration, h), c)))

      return off
    })
    const A2 = covariance.every(x => x === 0)

    log('A2')

    // A3: link-blindness, and the meetings
    const blind = paths.map(path => {
      const ref = record(working, meson, path, false)
      const mw = { equal: 0, unequal: 0 }
      const mf = { equal: 0, unequal: 0 }
      let occupation = 0
      let points = 0

      ref.forEach(c => {
        const m = likeMeetings(c, cells)

        mw.equal += m.equal
        mw.unequal += m.unequal
      })
      run(flat, meson, path, false, (t, c) => {
        occupation += occupationsApart(ref[t] as Configuration, c)
        points += configurationsApart(ref[t] as Configuration, c)

        const m = likeMeetings(c, cells)

        mf.equal += m.equal
        mf.unequal += m.unequal
      })

      return { occupation, points, mw, mf }
    })
    const A3 = blind.every(r => r.occupation === 0)

    log('A3')

    // A4: E-SPN-0130 on pure-gauge links
    const love = seaConfiguration(cells, 1)
    const hole = placeInSea(love, [{ dock: X, slot: B, vibe: 0 }])
    const lines = meshLines(flat)
    const carry = paths.map(path => {
      const ref = record(flat, hole, path, true)
      let off = 0

      run(pure, gaugeConfiguration(w, hole, h), path, true, (t, c) => (off += configurationsApart(gaugeConfiguration(w, ref[t] as Configuration, h), c)))

      const key = fullPathKey(pathOffset(path))
      const flatTrack = fermionTrack({ tables: flat, reference: love, start: hole, key, threshold: THRESHOLD_BORN, beats: BEATS, on: true, lines })
      const pureTrack = fermionTrack({ tables: pure, reference: gaugeConfiguration(w, love, h), start: gaugeConfiguration(w, hole, h), key, threshold: THRESHOLD_BORN, beats: BEATS, on: true, lines })
      const workingTrack = fermionTrack({ tables: working, reference: love, start: hole, key, threshold: THRESHOLD_BORN, beats: BEATS, on: true, lines })

      return { off, flatLines: flatTrack.linesTouched, pureLines: pureTrack.linesTouched, workingLines: workingTrack.linesTouched, pureGated: pureTrack.tally.gated, workingGated: workingTrack.tally.gated }
    })
    const A4 = carry.every(r => r.off === 0 && r.flatLines === r.pureLines)

    log('A4')

    // ---- B0: the love sea's charges ----
    const fear = placeInSea(love, [{ dock: Y, slot: B, vibe: -1 }])
    const holeFear = placeInSea(love, [
      { dock: X, slot: B, vibe: 0 },
      { dock: Y, slot: B, vibe: -1 },
    ])
    const charges = [fear, holeFear].flatMap(start =>
      paths.map(path => {
        const c0 = seaCounts(start)
        const fs0 = c0.fears + c0.stores
        const hs0 = c0.holes - 2 * c0.stores
        let fearsAfter = 0
        let kept = true
        let first = { fears: 0, holes: 0, stores: 0 }

        run(flat, start, path, true, (t, c) => {
          const n = seaCounts(c)

          if (t === 0) first = { fears: n.fears, holes: n.holes, stores: n.stores }
          else fearsAfter = Math.max(fearsAfter, n.fears)
          kept = kept && n.fears + n.stores === fs0 && n.holes - 2 * n.stores === hs0
        })

        return { first, fearsAfter, kept }
      }),
    )
    const B0 = charges.every(r => r.first.fears === 0 && r.kept)
    const steinerPairs = steinerOffsetPairs(STEINER_REACH)
    let twoBody = 0

    for (let a = -TWO_BODY_REACH; a <= TWO_BODY_REACH; a++)
      for (let b = -TWO_BODY_REACH; b <= TWO_BODY_REACH; b++)
        for (let c = -TWO_BODY_REACH; c <= TWO_BODY_REACH; c++) {
          const left = TWO_BODY_REACH - Math.abs(a) - Math.abs(b) - Math.abs(c)

          if (left >= 0) twoBody += 2 * left + 1
        }

    log('B0')

    // ---- verdict ----
    const status = !instrument || !A2 || !A3 || !A4 || !B0 ? 'partial' : 'open'
    const kindText = (c: Record<LoopKind, HolonomyTally>): string => LOOP_KINDS.map(k => `${k} ${c[k].curved} of ${c[k].loops} (fixing a point ${c[k].fixing}, none ${c[k].fixless}; orders ${Object.entries(c[k].orders).map(([o, n]) => `${o}:${n}`).join(' ')}; curved at ${c[k].curvedDocks} of ${cells} docks)`).join('; ')
    const ringText = (r: { length: number; order: number; fixed: number }[]): string => {
      const by: Record<string, number> = {}

      for (const x of r) by[`order ${x.order} fixing ${x.fixed}`] = (by[`order ${x.order} fixing ${x.fixed}`] ?? 0) + 1

      return Object.entries(by).map(([k, n]) => `${k}: ${n}`).join(', ')
    }
    const sum = (xs: number[]): number => xs.reduce((s, x) => s + x, 0)
    const meetW = { equal: sum(blind.map(r => r.mw.equal)), unequal: sum(blind.map(r => r.mw.unequal)) }
    const meetF = { equal: sum(blind.map(r => r.mf.equal)), unequal: sum(blind.map(r => r.mf.unequal)) }

    const metrics: Record<string, number> = {
      G1_curved: G1count,
      G1_loops: loopsOf(census.working),
      gauge: G1count === 0 ? 1 : 0,
      A2: A2 ? 1 : 0,
      A3: A3 ? 1 : 0,
      A4: A4 ? 1 : 0,
      B0: B0 ? 1 : 0,
      H_decided: 0,
      instrument: instrument ? 1 : 0,
      triangleCurved: census.working.triangle.curved,
      triangleLoops: census.working.triangle.loops,
      squareCurved: census.working.square.curved,
      squareLoops: census.working.square.loops,
      rhombusCurved: census.working.rhombus.curved,
      rhombusLoops: census.working.rhombus.loops,
      triangleFixless: census.working.triangle.fixless,
      squareFixless: census.working.square.fixless,
      rhombusFixless: census.working.rhombus.fixless,
      flatCurved: curvedOf(census.flat),
      pureCurved: curvedOf(census.pure),
      rings: rings.working.length,
      ringsCurved: curvedRings(rings.working),
      ringsFixless: rings.working.filter(r => r.fixed === 0).length,
      plantedTriangles: plantedCensus.triangle.curved,
      plantedSquares: plantedCensus.square.curved,
      plantedRhombi: plantedCensus.rhombus.curved,
      plantedRings,
      plantedShiftFixed: shift >= 0 ? fixedPoints(w.moves.act[shift] as Int8Array) : -1,
      pointFieldWorkingMin: Math.min(...fieldWorking),
      pointFieldWorkingMax: Math.max(...fieldWorking),
      pointFieldPure: Math.max(...fieldPure),
      covarianceOff: sum(covariance),
      blindOccupationOff: sum(blind.map(r => r.occupation)),
      blindPointsOff: sum(blind.map(r => r.points)),
      meetEqualWorking: meetW.equal,
      meetUnequalWorking: meetW.unequal,
      meetEqualFlat: meetF.equal,
      meetUnequalFlat: meetF.unequal,
      carryOff: sum(carry.map(r => r.off)),
      pureHoleLines: sum(carry.map(r => r.pureLines)) / PATHS,
      flatHoleLines: sum(carry.map(r => r.flatLines)) / PATHS,
      workingHoleLines: sum(carry.map(r => r.workingLines)) / PATHS,
      pureHoleGated: sum(carry.map(r => r.pureGated)) / PATHS,
      workingHoleGated: sum(carry.map(r => r.workingGated)) / PATHS,
      fearFirstBeatFears: Math.max(...charges.map(r => r.first.fears)),
      fearFirstBeatStores: Math.min(...charges.map(r => r.first.stores)),
      fearsLater: Math.max(...charges.map(r => r.fearsAfter)),
      steinerPairs,
      steinerAmplitudes: steinerPairs * SLOT_TRIPLES,
      twoBodyOffsets: twoBody,
      twoBodyAmplitudes: twoBody * SLOT_PAIRS,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `A (G1): ${G1count} of ${loopsOf(census.working)} contractible elementary loops of the working links carry a nontrivial holonomy (${kindText(census.working)}), and ${curvedRings(rings.working)} of ${rings.working.length} rings: the point moves are ${verdictA}, spread over every dock, not a gauge; the working beat commutes with every frame change (${sum(covariance)} slots off) and its occupation is the same on flat links on every path (${sum(blind.map(r => r.occupation))} readings off), so the curvature is read only where a like meeting compares two points (equal on ${meetW.equal} of ${meetW.equal + meetW.unequal} meetings against ${meetF.equal} on flat links) and where the mixer asks for one content; on pure-gauge links E-SPN-0130's hole is its flat run bit for bit (${sum(carry.map(r => r.off))} off, ${metrics.pureHoleLines} mesh lines); B: the love sea holds no opposite charge of a hole, and its Z3-neutral pair, a hole and a fear, is three holes and a store after one beat (fears ${metrics.fearFirstBeatFears} after beat 1 on every path), so Q3b is a three-body question left undecided (H1 to H3 not computed)`,
      metrics,
      control: { flatCurved: metrics.flatCurved as number, pureCurved: metrics.pureCurved as number, plantedTriangles: metrics.plantedTriangles as number, plantedSquares: metrics.plantedSquares as number, plantedRhombi: metrics.plantedRhombi as number },
      notes: `L1. Census (side ${SIDE}, ${cells} docks): working ${kindText(census.working)}; rings ${ringText(rings.working)}; flat ${curvedOf(census.flat)} curved, rings ${ringText(rings.flat)}; pure gauge ${curvedOf(census.pure)} curved; working under the frame h equal to working ${LOOP_KINDS.every(k => sameTally(census.working[k], census.gauged[k]))}; planted translation ${LOOP_KINDS.map(k => `${k} ${plantedCensus[k].curved}`).join(', ')}, rings ${plantedRings}. Point field defects per frame component: working ${fieldWorking.join(' ')}, pure gauge ${fieldPure.join(' ')}. Covariance off ${covariance.join(', ')} (without, with the mixer). Blindness per path (occupation off, points off): ${blind.map(r => `${r.occupation}/${r.points}`).join('; ')}; like meetings over ${BEATS} beats and ${PATHS} paths working ${meetW.equal} equal ${meetW.unequal} unequal, flat ${meetF.equal} equal ${meetF.unequal} unequal. Carry-over per path (off, lines flat/pure/working, gated pure/working): ${carry.map(r => `${r.off}, ${r.flatLines}/${r.pureLines}/${r.workingLines}, ${r.pureGated}/${r.workingGated}`).join('; ')}. B0 per start and path (beat-1 fears/holes/stores, later fears, kept): ${charges.map(r => `${r.first.fears}/${r.first.holes}/${r.first.stores}, ${r.fearsAfter}, ${r.kept}`).join('; ')}. Three-hole route-free window at Steiner length ${STEINER_REACH}: ${steinerPairs} offset pairs x ${SLOT_TRIPLES}; two-body at |n|_1 ${TWO_BODY_REACH}: ${twoBody} x ${SLOT_PAIRS}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
