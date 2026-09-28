// A STRING-GATED LINE MIXER (E-SPN-0121). note/research/vibe/roadmap/remaining-pieces.md, "Two hubs bound by the string"
// (E-SPN-0120): in the working rule bound matter moves freely only along a line class it wholly occupies, and every
// added line mixer cascades the vacuum (E-SPN-0094 .. 0099) because it acts on vacuum states. The first remedy named
// there: a line mixer that acts only on non-vacuum states and still cannot cascade. The minimal one is tested here.
//
// THE CHANGE (code/measure/string-gated-mixer). On a dock holding exactly one single, whose frame holds that vibe and
// nothing else, and where the drift cost's register on the frame's eight links differs from the vacuum's (the single
// drags string), apply M_n = I + (e^(i theta) - 1) J / 8 on the frame's eight slots, 2 - 2 cos theta = n. Gated run at
// n = 3, theta = 2 pi / 3: M = (1 + w)/2 I + (1 - w)/2 G, the working coin's own phases with the frame mixer G of
// E-SPN-0094 (the one W(F4)-covariant line mixer in the ring) in place of the coin's slot swap. On a keyed path it is
// keyedMix at move rate 21/64, read from the key's frame slot, restricted by the gate, and placed first in the beat.
// Only the frame's lines are mixed: E-SPN-0094 found no other covariant line mixer in the rule's ring.
//
// DERIVED BEFORE THE GATED RUN.
// 1. EXACT, UNITARY, REVERSIBLE, THE GATE INVARIANT. G = I - J/4 is an involution (J^2 = 8 J), so M_n = Pi_+ +
//    e^(i theta) Pi_- is unitary with inverse M_n^+; at n = 3 its entries (1 + (w - 1)/8 and (w - 1)/8) lie in Z[w][1/2].
//    M_n moves one vibe among the eight slots of one frame of one dock. Afterwards the frame still holds exactly one vibe,
//    the dock still exactly one single, and no link register has changed, so every clause of the gate is a function the
//    piece keeps: the piece is sum_g |g><g| (x) U_g, a controlled unitary, undone by the same control with M_n^+. The
//    single's own link alone would NOT be invariant (the single's line changes), so the gate reads the frame's eight
//    links at the dock, which include the single's own two.
// 2. THE VACUUM IS EXACTLY UNTOUCHED. The working vacuum holds no single line on any dock at any beat (condition Z,
//    E-SPN-0117, 0119), so the first clause is false on every vacuum dock and the piece is the identity there, with or
//    without the string clause. So a vacuum run and a vacuum-only box run bit for bit as before.
// 3. CAN IT CASCADE? The piece makes no single: it keeps the single count of the dock it acts on and touches no other
//    dock. Every other piece keeps the count dock by dock too: the coin and the meeting act inside one line, the pair
//    move makes a full line from an empty one or the reverse, and the bounce permutes a dock's lines as wholes. The
//    STREAM does not: it re-pairs slots across docks, so a vibe that sits on a line whose vacuum pairs it blocks leaves
//    the vacuum's partners unpaired a dock later. So "the count of singles is conserved" holds for the piece and fails for
//    the beat, and the failure is the stream's. Without the mixer the singles a lone love unpairs stay on its own line
//    (E-SPN-0117), a bounded handful. The gate cannot tell them from the love (each is a charged single on string, since
//    the vacuum vibe it lost wrote flux the joint run did not), so the mixer turns them off the line too, onto lines
//    whose vacuum pairs they disturb in turn, and where two singles meet K fires and recruits vacuum pairs
//    (E-SPN-0119). PREDICTED: a cascade from any start, a lone love included.
// 4. MOMENTUM ALONG LINES AWAY FROM MATTER. Where no dock holds a gated single the piece is the identity, so every
//    line-local law of the knit (momentum along a line, E-SPN-0098's line tone) holds exactly on every line with no
//    gated dock at that beat. On a line where the piece fires, a vibe leaves one line for another and the line tone
//    moves with it. The reading below counts the mesh lines whose tone differs from the vacuum's.
// 5. THE STAND-IN (code/measure/frame-meson): E-SPN-0115's love-fear meson (D = 6, the working coin, n = 1 on its joint
//    path) with the mixer, in the unbounded mesh with no vacuum. Each vibe keeps its frame, so both walk on the frame's
//    hypercubic lattice, and the register is held link by link. Gauss makes the string clause true whenever a vibe is
//    alone on its dock. At rate 0 it is the one-line meson exactly. WHAT IT CANNOT DO: a register of up to 13 links (the
//    gate's N) in four directions has far too many shapes (a window cut at 13 ran out of 4 GB before beat 4,
//    tmp/smix-probe3-n3.log); the window it can hold absorbs every register of more than C = 6 links, and a held level
//    with tail at most 1e-3 past 13 may still reach past 6. So on this window S2 can PASS (if the retained weight stays
//    at least 1 - 1e-3, the tail past 13 is smaller still) and cannot FAIL; a leak is reported, not gated.
//    S4 PREDICTED to fail: the four line copies of the one-line meson are degenerate at K = 0 by the frame's symmetry,
//    so any coupling between them, however weak, makes the level a mixture over the four lines, and along its own line
//    only its share on that line disperses: m* grows by the inverse of that share (4 for the symmetric level).
//
// GATES, fixed before the gated run.
//  S1 (a) the vacuum is untouched: in every track (sides 4, 8 and 12) the vacuum run holds 0 singles and the piece gates
//     0 vacuum docks; a vacuum-only box (start = the vacuum, the mixer on, sides 4 and 8, 128 beats) differs from the
//     vacuum run at 0 readings on every beat; and the vacuum run with the piece equals keyedRunner's vacuum bit for bit
//     at beat 128. (b) No cascade: the meson (a love at X and a fear at Y = X + (1,1,0,0) on the line (1,1,0,0)) on 16
//     terms (side 8, 128 beats, 'pass', the Born threshold, full-key offsets 0 .. 15): on every term the wake grows
//     under 10% from beat 64 to 128 AND its footprint at beat 128 is under half the box's docks.
//  S2 the meson holds as a level: in the stand-in at K = 0, from the four-line symmetric sum of E-SPN-0115's K = 0 level,
//     the weight past N = 13 links at most 1e-3 at every beat. Read on the window of point 5 over 24 beats: PASS if the
//     retained weight is at least 1 - 1e-3 at every beat; otherwise not decided on this window.
//  S3 (if S2) the band has curvature along at least two of six husk directions (e_1, e_2, e_3, (e_a + e_b)/sqrt 2): 2 dE /
//     K^2 at least a tenth of 1/(4 m*_line), the four-line average of the one-line meson's. Inverse mass tensor and its
//     anisotropy against the isotropy the frame's symmetry gives at quadratic order (the frame's eight roots are a 3-design,
//     the mesh's 24 a 5-design, so a quartic anisotropy is allowed in one frame and not in the average of three).
//  S4 (if S2) along (1,1,0,0), m*/E_rest within 5% of E-SPN-0115's 1.7931.
// CONTROLS (a failed control makes the verdict partial).
//  C0 rate 0 reproduces the record: the rule's track equals keyedRunner bit for bit (meson, path 0); E-SPN-0119's trio
//     wake 26, 52, 54, 60 at beats 8, 16, 32, 128 and its unbound two-hub 39,184 readings with K on 4,096 docks (path 0);
//     the stand-in's level energy is E-SPN-0115's 0.3188654375223234 to 1e-9 and its total m*/E_rest (second difference
//     at E_rest/64, E_rest = 2 pi/3 + E(0), as E-SPN-0115 reads it) is 1.7931 to 5e-5, and the level does not move
//     along e_3 (dE 0 to 1e-12): a lineon.
//  CU an unbound single's footprint (a lone love at rate 3, 4 terms) is reported with the rate-0 one beside it.
//  CT the two-hub start of E-SPN-0120 at rate 3 (4 terms): cascade or not, reported.
//  CS the stand-in with the cost off (the string removed) leaks as reported beside it.
// CHECKS (a failed check makes the verdict partial; added after run 2, see below): on every beat of every track the keyed
// piece applied twice gives the configuration back bit for bit (point 1: an involution on a path); the stand-in's held,
// escaped and dropped weight sum to 1 to 1e-10 (its beat is unitary).
// READ, NOT GATED: the per-piece single census (point 3) for a lone love over 24 beats at rates 0 and 3; the trio at
// rate 3; rate 1 (theta = pi/3) on the meson; the string clause dropped; side 12; the lines whose tone differs from the
// vacuum's at beat 128.
// Verdict: partial if a control fails; pass if S1, S2, S3 and S4 hold; fail if any gate fails; S2 undecided with S1
// failing reads fail on S1.
// PROBES, disclosed (instrument only): tmp/smix-probe1-8.log (side 8, paths 0 and 1: the vacuum lines are all empty at
// the start, stores holding its pairs; at rate 3 a lone love, the meson, the trio and the two-hub start each fill 4,083
// to 4,096 docks by beat 64, while rate 0 reproduces the records), tmp/smix-probe2.log (the census: only the stream
// changes the single count; at rate 0 a lone love holds 1 to 5 singles, all on its line; at rate 3 939 by beat 24),
// tmp/smix-probe3-n0.log (the stand-in at rate 0 is the one-line meson to 16 digits), tmp/smix-probe3-n3.log (a cut
// at 13 runs out of memory), tmp/smix-probe4-b.log and -free.log (the window at C = 6 holds 407,601 classes and loses
// 0.763 of the weight by beat 12 with the string and 0.772 without it).
//
// FIRST RUN (tmp/smix-exp-run1.log, 131 s): PARTIAL, on control C0 alone, which was mis-specified: it read the stand-in's
// m*/E_rest with E_rest = E(0) = 0.3189, where E-SPN-0115 reads E_rest = 2 m + E(0) (meson-crossing readPoint, m = pi/3)
// and takes its second difference at E_rest/64, not pi/57. The curvature itself was right (0.2311, so 13.57 x 0.3189 =
// 1.7931 x 2.4133). The control was corrected to E-SPN-0115's reading; no gate, threshold or other control moved, and
// every gate reading is unchanged (S1a pass, S1b fail on 16 of 16 terms, S2 undecided).
// SECOND RUN (tmp/smix-exp-run2.log, 130 s): PARTIAL, on C0's total alone, 1.79301 against 1.7931 (5e-5): the Ritz
// reading on 40 beats left E(+-K) unconverged by 7e-9 (residual 2.8e-5), which a second difference at K = 0.0377
// turns into 4e-5 of the total. tmp/smix-probe5.log reads 1.79301, 1.79308, 1.793082246, 1.793082260 at 40, 80, 120, 160
// beats against meson-band's own bandCurvature 1.793082236, so the reading was lengthened to 120 beats. Two checks were
// added (the keyed piece's reversal and the stand-in's weight balance). No gate, threshold or control moved; every
// gate reading is unchanged.
// THIRD RUN (tmp/smix-exp-run3.log, 134 s): FAIL on S1b, as derived; every control and check passes.
//  - S1a holds exactly: 0 vacuum singles and 0 gated vacuum docks on every track, vacuum-only boxes of side 4 and 8 at 0
//    readings on every beat, the vacuum run equal to keyedRunner's at beat 128.
//  - S1b fails on 16 of 16 terms: the meson fills 4,089 to 4,096 of 4,096 docks by beat 128, half the box at beats 26 to
//    32, wake 39,128 on average, K on every dock. A lone love does the same (4,095, against 6 at rate 0), and so do the
//    trio (4,094), the two-hub start (4,093), rate 1 (4,094, half the box by beat 32), the string clause dropped (4,094)
//    and side 12 (20,732 of 20,736). 4,738 of 6,144 mesh lines end off the vacuum's tone (0 at rate 0).
//  - The census confirms point 3: over 24 beats of a lone love the mixer, coin, meeting, pair move and bounce change 0
//    dock single counts at both rates; the stream changes 22 at rate 0 (net 2, all on the love's line) and 942 at rate
//    3 (net +938).
//  - S2 undecided: the stand-in's window keeps 0.9983, 0.9825, 0.9224, 0.4323, 0.0351 of the weight at beats 2, 3, 4, 8,
//    24, and 0.0646 at beat 24 with the string removed, so on the reachable window the string does nothing to hold the
//    mixed pair (mean string 3.99, 89% of it bent). Weight past 13 links cannot be read, so S3 and S4 are not reached.
//  - C0: rate 0 reproduces the rule bit for bit (0 slots off keyedRunner, the trio's 26/52/54/60, the unbound 39,184 on
//    4,096 docks) and E-SPN-0115 in the stand-in (E 0.3188654375223, m*/E_rest 1.7930822, dE 0 along e_3). Checks: the
//    piece undone by itself on every beat (0 slots off), the stand-in's weight balanced to 6e-12.
// Title written after the run.
//
// Depth L1 for S1 (exact on the rule's integer paths, derived, with rate 0 reproducing the record) and L2 for the
// stand-in. DETERMINISM: no random numbers; the key is integer arithmetic and every start is placed. NOTHING MOVES:
// the mixer hands a vibe to another slot of its own frame on its own dock; the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, keyedRunner, lineCharges, linesDiffering, meshLines, pathOffset } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { mixTrack, pieceCensus, type MixTrack } from '@/code/measure/string-gated-mixer'
import { meson, pairEmbed } from '@/code/measure/string-binding'
import { nrSeed, settle } from '@/code/measure/meson-band'
import { addStates, autocorrelation, axisOfLine, frameAxes, frameBeat, frameSpace, lineFrame, lineState, momentsOf, normalized, ritzLevels, weightOf, type FrameState } from '@/code/measure/frame-meson'
import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'

const [B, A, C] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
].map(rootIndex) as [number, number, number]
const RATE = 3
const SIDE = 8
const BEATS = 128
const PATHS = 16
const FEW = 4
const GROWTH_FROM = 64
const GROWTH_LIMIT = 0.1
const BOX_SHARE = 0.5
const WINDOW_SIDES = [4, 8]
const WIDE = 12
const CENSUS_BEATS = 24
const TRIO_WAKE: Record<number, number> = { 8: 26, 16: 52, 32: 54, 128: 60 }
const CU_WAKE = 39184
const CU_DOCKS = 4096
// the stand-in
const D = 6
const N = 2 * D + 1
const CUT = 6
const FLOOR = 1e-10
const HOLD_BEATS = 24
const TAIL = 1e-3
const E_REST = 0.3188654375223234
const TOTAL = 1.7931
const TOTAL_SAME = 5e-5
const ENERGY_SAME = 1e-9
const MASS = Math.PI / 3
const CURVE_FRAC = 1 / 64
const NORM_SAME = 1e-10
const RITZ_T = 120
const REPORT_AT = [8, 16, 32, 64, 128]

export default experiment({
  id: 'spin/string-gated-mixer',
  code: 'E-SPN-0121',
  title:
    "a line mixer gated on a dock's one single dragging string keeps the vacuum exactly but cascades, fail (S1b): M = (1 + w)/2 I + (1 - w)/2 G on the single's frame (the coin's phases on E-SPN-0094's frame mixer, move rate 21/64), gated on one single, a lone frame and string on the frame's eight links, is exact, unitary and an involution on every keyed path (0 slots off in two passes), and gates 0 vacuum docks, so the vacuum and vacuum-only boxes of side 4 and 8 run bit for bit; but every piece but the stream keeps each dock's single count exactly, while the stream leaves a vacuum vibe unpaired wherever matter blocks the vacuum's pairs, and the gate cannot tell such a vibe from the love (at rate 0 a lone love's run makes 22 single changes in 24 beats, all on its line; at rate 3, 942, net 938); the love-fear meson fills 4,089 to 4,096 of 4,096 docks by beat 128 on 16 of 16 terms (half the box at beats 26 to 32), as do a lone love (4,095 against 6 at rate 0), the trio, the two-hub start, rate 1 (theta pi/3), the string clause dropped and side 12 (20,732 of 20,736), with 4,738 of 6,144 mesh lines off the vacuum's tone; in a vacuum-free stand-in (E-SPN-0115's meson with the mixer, the register held link by link) the window of registers up to 6 links (407,601 classes) keeps 0.035 of the weight at beat 24 with the string and 0.065 without it, so the string does not hold the mixed pair there, though a hold past 13 links cannot be read and S2, S3, S4 stay undecided; rate 0 reproduces E-SPN-0115 (E 0.3188654375, m*/E_rest 1.79308) and E-SPN-0119 bit for bit",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- the rule ----
    const setup = (side: number) => {
      const X = centerOf(side)
      const f = contactFresh(side, 'pass', X)
      const vacuum = wordVacuum(f, f.store)
      const Y = Math.floor((f.tables.target[X * 24 + B] as number) / 24)

      return {
        side,
        X,
        f,
        vacuum,
        lines: meshLines(f.tables),
        starts: {
          meson: placeVibes(vacuum, [
            { dock: X, slot: B, vibe: 1 },
            { dock: Y, slot: B, vibe: -1 },
          ]),
          love: placeVibes(vacuum, [{ dock: X, slot: B, vibe: 1 }]),
          trio: placeVibes(vacuum, [B, A, C].map(slot => ({ dock: X, slot, vibe: 1 }))),
          twoHub: placeVibes(vacuum, [
            { dock: X, slot: A, vibe: 1 },
            { dock: X, slot: B, vibe: 1 },
            { dock: Y, slot: C, vibe: -1 },
            { dock: Y, slot: B, vibe: -1 },
          ]),
          unbound: placeVibes(vacuum, [
            { dock: X, slot: A, vibe: 1 },
            { dock: X, slot: B, vibe: 1 },
            { dock: Y, slot: C, vibe: 1 },
            { dock: Y, slot: B, vibe: 1 },
          ]),
        },
      }
    }
    type Setup = ReturnType<typeof setup>
    const s8 = setup(SIDE)
    const track = (g: Setup, start: Configuration, path: number, n: number, stringless = false): MixTrack =>
      mixTrack({ tables: g.f.tables, vacuum: g.vacuum, start, hub: g.X, key: fullPathKey(pathOffset(path)), threshold: THRESHOLD_BORN, beats: BEATS, side: g.side, n, stringless })

    const terms = Array.from({ length: PATHS }, (_, k) => track(s8, s8.starts.meson, k, RATE))

    log('meson terms')

    const growthOf = (r: MixTrack): number => ((r.wake[BEATS - 1] as number) - (r.wake[GROWTH_FROM - 1] as number)) / Math.max(1, r.wake[GROWTH_FROM - 1] as number)
    const bounded = (r: MixTrack, cells: number): boolean => growthOf(r) < GROWTH_LIMIT && (r.footprint[BEATS - 1] as number) < BOX_SHARE * cells
    const S1b = terms.every(r => bounded(r, s8.f.cells))

    // S1a: the vacuum
    const windows = WINDOW_SIDES.map(side => {
      const g = side === SIDE ? s8 : setup(side)
      const r = track(g, g.vacuum, 0, RATE)

      return { side, wake: r.wake.reduce((u, v) => u + v, 0), gated: r.gated.reduce((u, v) => u + v, 0) + r.vacuumGated, singles: r.vacuumSingles, last: r.last }
    })
    const runner = keyedRunner(s8.f.tables, s8.vacuum, { key: fullPathKey(0), threshold: THRESHOLD_BORN })

    for (let t = 0; t < BEATS; t++) runner.beat()

    const ref = runner.state()
    const vac8 = (terms[0] as MixTrack).vacuumLast
    let vacuumDiffer = 0

    for (let i = 0; i < ref.vibe.length; i++) if (ref.vibe[i] !== vac8.vibe[i] || (ref.vibe[i] !== 0 && (ref.point[i] !== vac8.point[i] || ref.open[i] !== vac8.open[i]))) vacuumDiffer++
    for (let i = 0; i < ref.store.length; i++) if (ref.store[i] !== vac8.store[i] || (ref.store[i] !== 0 && (ref.spoint[i] !== vac8.spoint[i] || ref.sopen[i] !== vac8.sopen[i]))) vacuumDiffer++

    log('vacuum')

    // ---- controls and reads on the rule ----
    const loves = Array.from({ length: FEW }, (_, k) => track(s8, s8.starts.love, k, RATE))
    const loves0 = Array.from({ length: FEW }, (_, k) => track(s8, s8.starts.love, k, 0))
    const twoHubs = Array.from({ length: FEW }, (_, k) => track(s8, s8.starts.twoHub, k, RATE))
    const trios = Array.from({ length: FEW }, (_, k) => track(s8, s8.starts.trio, k, RATE))
    const slow = Array.from({ length: FEW }, (_, k) => track(s8, s8.starts.meson, k, 1))
    const stringless = track(s8, s8.starts.meson, 0, RATE, true)
    const meson0 = track(s8, s8.starts.meson, 0, 0)
    const trio0 = track(s8, s8.starts.trio, 0, 0)
    const unbound0 = track(s8, s8.starts.unbound, 0, 0)
    const s12 = setup(WIDE)
    const wide = track(s12, s12.starts.meson, 0, RATE)

    log('reads')

    const mesonRunner = keyedRunner(s8.f.tables, s8.starts.meson, { key: fullPathKey(0), threshold: THRESHOLD_BORN })

    for (let t = 0; t < BEATS; t++) mesonRunner.beat()

    const mref = mesonRunner.state()
    let stepperDiffer = 0

    for (let i = 0; i < mref.vibe.length; i++) if (mref.vibe[i] !== meson0.last.vibe[i] || (mref.vibe[i] !== 0 && (mref.point[i] !== meson0.last.point[i] || mref.open[i] !== meson0.last.open[i]))) stepperDiffer++
    for (let i = 0; i < mref.store.length; i++) if (mref.store[i] !== meson0.last.store[i] || (mref.store[i] !== 0 && (mref.spoint[i] !== meson0.last.spoint[i] || mref.sopen[i] !== meson0.last.sopen[i]))) stepperDiffer++

    const trioAgrees = Object.entries(TRIO_WAKE).every(([t, w]) => trio0.wake[Number(t) - 1] === w)
    const unboundAgrees = unbound0.wake[BEATS - 1] === CU_WAKE && unbound0.kDocks[BEATS - 1] === CU_DOCKS

    const everyTrack = [...terms, ...loves, ...loves0, ...twoHubs, ...trios, ...slow, stringless, meson0, trio0, unbound0, wide]
    const vacuumSinglesAll = everyTrack.reduce((n, r) => n + r.vacuumSingles, 0)
    const vacuumGatedAll = everyTrack.reduce((n, r) => n + r.vacuumGated, 0)
    const S1a = vacuumSinglesAll === 0 && vacuumGatedAll === 0 && windows.every(w => w.wake === 0 && w.gated === 0 && w.singles === 0) && vacuumDiffer === 0 && wide.vacuumSingles === 0

    const census3 = pieceCensus({ tables: s8.f.tables, vacuum: s8.vacuum, start: s8.starts.love, key: fullPathKey(0), threshold: THRESHOLD_BORN, beats: CENSUS_BEATS, n: RATE })
    const census0 = pieceCensus({ tables: s8.f.tables, vacuum: s8.vacuum, start: s8.starts.love, key: fullPathKey(0), threshold: THRESHOLD_BORN, beats: CENSUS_BEATS, n: 0 })
    const toneDiffer = (r: MixTrack): number => linesDiffering(lineCharges(s8.lines, r.last).tone, lineCharges(s8.lines, r.vacuumLast).tone)

    log('census')

    // ---- the stand-in ----
    const F = lineFrame(B)
    const axisB = axisOfLine(F, LINE_OF[B] as number)
    const m = meson(D, 2 * N, 1)
    const level = settle(m, nrSeed(m))
    const full = pairEmbed(m, 0, level.block)
    const entries: { d: number; jl: number; jf: number; amp: [number, number] }[] = []

    for (let i = 0; i < m.b.size; i++) {
      if (full.re[i] === 0 && full.im[i] === 0) continue

      const c = Math.floor(i / m.b.labelCount)
      const r = i % m.b.labelCount

      entries.push({ d: m.b.configs[c]![1]!, jl: Math.floor(r / 2), jf: r % 2, amp: [full.re[i] as number, full.im[i] as number] })
    }

    // rate 0: the level's energy and its band along its line, and a transverse boost
    const s0 = frameSpace({ frame: F, n: 0, D, cut: 2 * N, floor: 1e-24 })
    const onB = lineState(s0, axisB, entries)
    const uB = frameAxes(F)[axisB] as number[]
    const energyAt = (space: ReturnType<typeof frameSpace>, K: readonly number[], start: FrameState): { energy: number; weight: number; residual: number } => {
      const ritz = ritzLevels(autocorrelation(space, K, start, RITZ_T).c).sort((x, y) => y.weight - x.weight)

      return ritz[0] as { energy: number; weight: number; residual: number }
    }
    const e0 = energyAt(s0, [0, 0, 0, 0], onB)
    // E-SPN-0115's rest energy counts the two constituents' gap: E_rest = 2 m + E(0), m = pi/3 on the working coin, and
    // its curvature step is E_rest / 64 (meson-crossing readPoint)
    const eRest = 2 * MASS + e0.energy
    const step = eRest * CURVE_FRAC
    const ePlus = energyAt(s0, uB.map(x => x * step), onB)
    const eMinus = energyAt(s0, uB.map(x => -x * step), onB)
    const curvature = (ePlus.energy + eMinus.energy - 2 * e0.energy) / (step * step)
    const total = 1 / (curvature * eRest)
    const eTrans = energyAt(s0, [0, 0, 1, 0].map(x => x * step), onB)
    const C0stand = Math.abs(e0.energy - E_REST) <= ENERGY_SAME && Math.abs(total - TOTAL) <= TOTAL_SAME && Math.abs(eTrans.energy - e0.energy) <= 1e-12

    log('stand-in rate 0')

    // rate 3 and the cost-off control on the window
    const hold = (n: number, cost: boolean): { retained: number[]; moments: ReturnType<typeof momentsOf>; classes: number; normGap: number } => {
      const space = frameSpace({ frame: F, n, D: cost ? D : 1e9, cut: CUT, floor: FLOOR })
      let sym: FrameState = new Map()

      for (let a = 0; a < 4; a++) sym = addStates(sym, lineState(space, a, entries))
      sym = normalized(sym)

      let s = sym
      const tally = { escaped: 0, dropped: 0 }
      const retained: number[] = []

      for (let t = 0; t < HOLD_BEATS; t++) {
        s = frameBeat(space, [0, 0, 0, 0], s, tally)
        retained.push(weightOf(s))
      }

      // unitarity of the stand-in's beat: what is held, escaped past the cut and dropped under the floor sums to 1
      return { retained, moments: momentsOf(space, s, N), classes: space.classes.length, normGap: Math.abs((retained[HOLD_BEATS - 1] as number) + tally.escaped + tally.dropped - 1) }
    }
    const held = hold(RATE, true)

    log('stand-in rate 3')

    const free = hold(RATE, false)

    log('stand-in cost off')

    const S2 = held.retained.every(w => w >= 1 - TAIL)
    const S2decided = S2
    // S3 and S4 need a held level; with S2 undecided they are not reached
    const S3 = false
    const S4 = false

    // ---- verdict ----
    const C0 = stepperDiffer === 0 && trioAgrees && unboundAgrees && C0stand
    // CHECKS: the keyed piece undone by itself on every beat of every track, and the stand-in's weight accounted
    const reversalDiffer = everyTrack.reduce((n, r) => n + r.reversalDiffer, 0)
    const checked = reversalDiffer === 0 && held.normGap <= NORM_SAME && free.normGap <= NORM_SAME
    const S1 = S1a && S1b
    const status = !C0 || !checked ? 'partial' : S1 && S2 && S3 && S4 ? 'pass' : 'fail'
    const mean = (xs: number[]): number => xs.reduce((u, v) => u + v, 0) / xs.length
    const at = (r: MixTrack, key: 'wake' | 'footprint' | 'kDocks' | 'singles'): string => REPORT_AT.map(t => r[key][t - 1]).join('/')
    const firstFill = (r: MixTrack, cells: number): number => r.footprint.findIndex(x => x >= BOX_SHARE * cells) + 1

    const metrics: Record<string, number> = {
      S1: S1 ? 1 : 0,
      S1a: S1a ? 1 : 0,
      S1b: S1b ? 1 : 0,
      S2: S2 ? 1 : 0,
      S2_decided: S2decided ? 1 : 0,
      S3: S3 ? 1 : 0,
      S4: S4 ? 1 : 0,
      control_C0: C0 ? 1 : 0,
      boundedTerms: terms.filter(r => bounded(r, s8.f.cells)).length,
      minFootprint128: Math.min(...terms.map(r => r.footprint[BEATS - 1] as number)),
      maxFootprint128: Math.max(...terms.map(r => r.footprint[BEATS - 1] as number)),
      cells: s8.f.cells,
      minHalfBoxBeat: Math.min(...terms.map(r => firstFill(r, s8.f.cells))),
      maxHalfBoxBeat: Math.max(...terms.map(r => firstFill(r, s8.f.cells))),
      meanWake128: mean(terms.map(r => r.wake[BEATS - 1] as number)),
      meanSingles32: mean(terms.map(r => r.singles[31] as number)),
      meanMoved: mean(terms.map(r => r.moved.reduce((u, v) => u + v, 0))),
      meanUngated: mean(terms.map(r => r.ungatedLone)),
      vacuumSingles: vacuumSinglesAll,
      vacuumGated: vacuumGatedAll,
      vacuumDiffer,
      windowWake4: (windows[0] as { wake: number }).wake,
      windowWake8: (windows[1] as { wake: number }).wake,
      stepperDiffer,
      trioAgrees: trioAgrees ? 1 : 0,
      unboundAgrees: unboundAgrees ? 1 : 0,
      loveFootprint128: mean(loves.map(r => r.footprint[BEATS - 1] as number)),
      loveFootprint128Rate0: mean(loves0.map(r => r.footprint[BEATS - 1] as number)),
      loveHalfBoxBeat: Math.min(...loves.map(r => firstFill(r, s8.f.cells))),
      twoHubFootprint128: mean(twoHubs.map(r => r.footprint[BEATS - 1] as number)),
      trioFootprint128: mean(trios.map(r => r.footprint[BEATS - 1] as number)),
      rate1Footprint128: mean(slow.map(r => r.footprint[BEATS - 1] as number)),
      rate1HalfBoxBeat: Math.min(...slow.map(r => firstFill(r, s8.f.cells))),
      stringlessFootprint128: stringless.footprint[BEATS - 1] as number,
      side12Footprint128: wide.footprint[BEATS - 1] as number,
      side12Cells: s12.f.cells,
      toneLinesRate3: toneDiffer(terms[0] as MixTrack),
      toneLinesRate0: toneDiffer(meson0),
      meshLines: s8.lines.count,
      censusMix3: census3.mix,
      censusCoin3: census3.coin,
      censusMeet3: census3.meet,
      censusPair3: census3.pair,
      censusBounce3: census3.bounce,
      censusStream3: census3.stream,
      censusStreamNet3: census3.streamNet,
      censusOther0: census0.mix + census0.coin + census0.meet + census0.pair + census0.bounce,
      censusStream0: census0.stream,
      standEnergy0: e0.energy,
      standResidual0: e0.residual,
      standTotal: total,
      standERest: eRest,
      standTransverse: eTrans.energy - e0.energy,
      heldRetained8: held.retained[7] as number,
      heldRetained24: held.retained[HOLD_BEATS - 1] as number,
      reversalDiffer,
      heldNormGap: held.normGap,
      freeNormGap: free.normGap,
      freeRetained8: free.retained[7] as number,
      freeRetained24: free.retained[HOLD_BEATS - 1] as number,
      heldMeanString: held.moments.meanString,
      heldBent: held.moments.bent,
      windowClasses: held.classes,
      seconds: (Date.now() - started) / 1000,
    }
    const perTerm = terms.map((r, k) => `p${k}: wake ${at(r, 'wake')}, footprint ${at(r, 'footprint')}, K docks ${at(r, 'kDocks')}, singles ${at(r, 'singles')}, growth ${growthOf(r).toFixed(4)}`).join('; ')

    return verdict({
      status,
      claim: `a line mixer gated on a dock's one single dragging string (M = (1 + w)/2 I + (1 - w)/2 G on its frame, move rate 21/64) leaves the vacuum untouched (${vacuumGatedAll} vacuum docks gated, ${vacuumDiffer} readings off keyedRunner) but cascades: the meson fills at least ${metrics.minFootprint128} of ${s8.f.cells} docks by beat 128 on ${PATHS} of ${PATHS} terms (${metrics.boundedTerms} bounded), a lone love ${metrics.loveFootprint128}; every piece but the stream keeps the single count, and the stream's unpaired vacuum vibes pass the gate; in the stand-in the window at ${CUT} links retains ${held.retained[HOLD_BEATS - 1]!.toFixed(4)} with the string and ${free.retained[HOLD_BEATS - 1]!.toFixed(4)} without it by beat ${HOLD_BEATS}`,
      metrics,
      control: { stepperDiffer, trioAgrees: trioAgrees ? 1 : 0, unboundAgrees: unboundAgrees ? 1 : 0, standEnergy0: e0.energy, standTotal: total, loveFootprint128Rate0: metrics.loveFootprint128Rate0 as number },
      notes: `L1 (S1) and L2 (stand-in). S1a ${S1a} (vacuum singles ${vacuumSinglesAll}, vacuum gated ${vacuumGatedAll}, windows ${windows.map(w => `side ${w.side}: wake ${w.wake}, gated ${w.gated}`).join('; ')}, keyedRunner vacuum differ ${vacuumDiffer}); S1b ${S1b}; S2 ${S2} (decided ${S2decided}: retained ${held.retained.map(w => w.toFixed(4)).join(' ')}; cost off ${free.retained.map(w => w.toFixed(4)).join(' ')}; mean string ${held.moments.meanString.toFixed(3)}, bent ${held.moments.bent.toFixed(3)}, ${held.classes} classes); S3, S4 not reached. C0 ${C0} (stepper ${stepperDiffer}, trio ${trioAgrees}, unbound ${unboundAgrees}, stand-in E ${e0.energy} residual ${e0.residual.toExponential(2)}, total ${total}, transverse ${eTrans.energy - e0.energy}). Census over ${CENSUS_BEATS} beats of a lone love: rate 3 ${JSON.stringify(census3)}, rate 0 ${JSON.stringify(census0)}. Meson terms: ${perTerm}. Lone love rate 3: ${loves.map(r => at(r, 'footprint')).join('; ')}; rate 0: ${loves0.map(r => at(r, 'footprint')).join('; ')}. Two-hub: ${twoHubs.map(r => at(r, 'footprint')).join('; ')}. Trio: ${trios.map(r => at(r, 'footprint')).join('; ')}. Rate 1: ${slow.map(r => at(r, 'footprint')).join('; ')}. Stringless: ${at(stringless, 'footprint')}. Side 12: ${at(wide, 'footprint')} of ${s12.f.cells}. Tone lines differing at 128: rate 3 ${metrics.toneLinesRate3}, rate 0 ${metrics.toneLinesRate0} of ${s8.lines.count}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
