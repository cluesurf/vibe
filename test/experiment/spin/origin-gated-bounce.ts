// AN ORIGIN-GATED BOUNCE (E-SPN-0128). note/research/vibe/roadmap/remaining-pieces.md, "Angle 4, the origin trit
// (E-SPN-0123)", "The star theorem" and "Two hubs bound by the string". E-SPN-0123 put a stored ORIGIN trit on every
// vibe (vacuum-born or matter-born) and let the line mixer turn only a matter-born single. The mixer's own cascade
// stopped (17 turns a meson term against 6,958), but the footprint still filled the box, because one turn puts the
// difference on two stars and K fires between VACUUM-born singles where their lines cross.
//
// THE CHANGE. E-SPN-0123's rule (the same trit, the same mixer, the same 48 trits a dock) with K gated on origin too
// (code/measure/origin-gated-bounce): on a dock of two or more singles, K (the isometric map w_P on the whole dock)
// fires only when at least two of the singles are MATTER-born; otherwise the dock bounces with B in its 'pass' form
// (-1 on a full line of a love and a fear, +1 on a full line of two like vibes, and w_P on the other lines when w_P
// carries the full lines onto themselves, the identity otherwise). On a dock of at most one single nothing changes:
// 'pass' already uses B there. The register is unchanged: the gate reads the trit the mixer already reads.
//
// DERIVED BEFORE THE RUN.
// 1. EXACT, UNITARY, REVERSIBLE, A GATE THE PIECE KEEPS. K and B each permute a dock's slots and carry lines onto lines
//    (w_P permutes lines; -1 and +1 keep a line). So a single line goes to a single line and a full line to a full line,
//    and the origin rides with the vibe (it is permuted with the slots, as in E-SPN-0123's K). So the number of singles
//    and the number of MATTER-born singles are the same after the map as before: the permutation of slots permutes the
//    gate's inputs and leaves the count, which is all the gate reads, invariant. w_P fixes P and B keeps the full set F,
//    so the same case of the same map is read again, and the map is an involution (w_P^2 = 1, (-1)^2 = (+1)^2 = 1). A
//    permutation of basis states is unitary; the piece is its own inverse, so every beat still reverses exactly. Exact
//    integers throughout; no amplitude is touched. Checked at every firing (`off`: the gate re-read after the map, the
//    same map, an involution).
// 2. THE VACUUM IS UNCHANGED, BIT FOR BIT. By condition Z (E-SPN-0117, 0119) no vacuum dock ever holds a single, so the
//    gate's first clause (two or more singles) is false on every vacuum dock at every beat, and the collision there is
//    the working rule's. No piece writes matter-born, so every vacuum vibe stays vacuum-born, and E-SPN-0123 already
//    showed the mixer never gates a vacuum dock.
// 3. THE FATE OF AN UNPAIRED VACUUM VIBE. Call a mesh line DISTURBED at a beat when any slot or store on it differs from
//    the vacuum run. The coin, the meeting, the pair move and the stream each act within one line; B on a dock of at
//    most one single reverses full lines as the vacuum does and fixes the lone single (w_r fixes r); so every beat acts
//    on a line that meets no dock of two singles as a fixed permutation U_t of that line's states, the SAME one the
//    vacuum's copy of the line undergoes. Then if the line differs from the vacuum at beat t it differs at t + 1:
//    U_t D != U_t V whenever D != V. So a disturbed line never heals while it evolves on its own. A vacuum-born single
//    that matter knocked loose streams along its own line at one dock a beat, B keeps it there, and the pair move can
//    store it with a vacuum partner of the other charge that meets it on its line: IT RE-PAIRS, BUT THE LINE NEVER
//    RETURNS TO THE VACUUM, and it cannot leave the line. In the unbounded mesh its reach grows at most one dock a beat
//    each way along that one line (a 1d trail, not a 3d spread); on the side-8 box a line is a closed loop of 8 docks
//    (4,096 docks x 12 lines / 6,144 lines), so a disturbed line holds at most 8 docks. There is no unbounded spread.
// 4. WHERE A LINE CAN STILL BE DISTURBED, AND THE BOUND. Only three events put a difference on a new line:
//    (a) a mixer turn (a matter single handed to another line of its frame): at most 1 new line,
//    (b) K at a dock of two matter-born singles: at most the dock's 12 lines,
//    (c) B at a dock of THREE or more singles, where w_P can carry a single onto an EMPTY line (at two singles w_P
//        keeps or swaps the two single lines, E-SPN-0118's census, so B there moves vibes only between disturbed lines).
//    So at every beat: lines(t) <= L0 + turns(t) + 12 K(t) + leaves(t), and footprint(t) <= 8 lines(t). Checked.
//    B IS NOT LINE-KEEPING VIBE BY VIBE: at two singles it may SWAP them, which moves each onto the other's line (so a
//    matter single can change line through B with a vacuum-born one); it keeps the dock's SET of single lines. Read.
// 5. CAN ANYTHING STILL CASCADE? A cascade needs the disturbed set to grow in proportion to itself. By 4 it grows only
//    by turns (bounded by the number of matter-born singles, conserved: 2 for the meson, 1 for a lone love), by K where
//    two matter-born singles meet (a lone love has one, so never; the meson only where love and fear sit on crossing
//    lines of one dock), and by B-leaves at three-single docks, which need two disturbed lines crossing a third at one
//    dock. The first two are linear in time, not in the disturbed set; the third is the only self-feeding term. So the
//    E-SPN-0119/0120 two-hub cascade is closed (K between vacuum-born singles no longer exists), and what remains is a
//    TRAIL: about one line of up to 8 docks per mixer turn, for as long as the mixer turns.
//    PREDICTED FOR O1, from point 4 and the probe below: the footprint stays near 2% of the box, far under half, but the
//    mixer keeps turning (about one turn per 8 beats), so the footprint keeps growing at about 5 docks a turn and the
//    growth clause (under 10% from beat 64 to 128) FAILS. O1's growth clause cannot tell a trail from a cascade, and it
//    was fixed before this derivation; it is not moved.
// 6. WHAT GATING K BREAKS IN THE WORKING RULE (mixer angle 0). (a) E-SPN-0115's meson lives on ONE line: every
//    difference lies on it, so no dock ever holds two singles and the gate is never reached. It is unchanged bit for
//    bit. (b) The one-line meson's stand-in has no K at all (code/measure/frame-meson), so it too is unchanged. (c) The
//    star theorem still holds (the gated B at X permutes X's slots, all on X's twelve lines; a dock off X meets one of
//    them), but E-SPN-0119's STAR CHANGES: K no longer fires at X when the singles there are vacuum-born recruits, or one
//    matter single and recruits, so it fires far less, and E-SPN-0117/0119's "the rule's own cross-line pair process"
//    (vacuum pairs recruited onto new lines) now happens only where two matter singles meet. (d) The two-hub cascade of
//    E-SPN-0119 (CP) and 0120 needs K between vacuum-born singles: it is gone. (e) Every K firing counted as a line change
//    by E-SPN-0117 among vacuum pairs off matter now bounces with B instead. Reported, not gated.
// 7. THE STAND-IN (O3, O4). code/measure/frame-meson holds the love and the fear with no vacuum and no K; both are
//    matter-born, so the gate changes nothing there and it IS E-SPN-0121/0123's stand-in. It kept 0.035 of the weight
//    by beat 24 at rate 3. New here, the WITNESS IS CALIBRATED: at rate 0 on the same window (cut 6 links) the one-line
//    level keeps at least 1 - 1e-3 over 24 beats, so a loss at rate n > 0 is the mixer's, not the window's (control CW).
//    Read, not gated: rates 1 and 1/4 (1/4 has no keyed version; the stand-in is a float measurement) from the one-line
//    level, to answer whether a smaller angle holds it.
//
// GATES, fixed before the run (the task's, with E-SPN-0123's instruments).
//  O1 no cascade: for the meson (a love at X, a fear at Y = X + (1,1,0,0) on the line (1,1,0,0)) and a lone love at X, on
//     16 terms each (side 8, 128 beats, 'pass', the Born threshold, full-key offsets 0 .. 15, rate 3), the footprint at
//     beat 128 is under half the box's docks AND grows under 10% from beat 64 to 128.
//  O2 the vacuum untouched: on every track the vacuum run holds 0 singles, its collision reaches the gate on 0 docks (0
//     K, 0 gated B), the mixer's first clauses pass on 0 vacuum docks, 0 vacuum vibes are matter-born; vacuum-only boxes
//     of sides 4 and 8 differ from the vacuum at 0 readings on every one of 128 beats; the vacuum run at beat 128 equals
//     keyedRunner's bit for bit.
//  O3 a bound meson: in the stand-in at K = 0, rate 3, from the four-line symmetric sum of E-SPN-0115's level, retained
//     weight at least 1 - 1e-3 at every one of 24 beats; and if held, at least two eigenvalues of the inverse mass tensor
//     on e_1, e_2, e_3 at least a tenth of the one-line meson's curvature / 4 (tensor and isotropy reported).
//  O4 (if O3) along (1,1,0,0), m*/E_rest within 5% of E-SPN-0115's 1.7931.
// CONTROLS (a failed control makes the verdict partial).
//  CK the K gate off reproduces E-SPN-0123: gate 'none' equals code/measure/origin-gated-mixer originTrack bit for bit
//     (wake, footprint and K docks on every beat, the last configuration and its origins) on 4 meson terms, and cascades
//     there (footprint at 128 at least half the box on each).
//  CA mixer angle 0 with K gated: the meson's track equals keyedRunner bit for bit at beat 128 on 4 paths and never
//     reaches the gate (0 K, 0 gated B); a lone love's footprint stays under half the box on 4 paths; the stand-in's level
//     energy is E-SPN-0115's 0.3188654375223234 to 1e-9, its m*/E_rest 1.7931 to 5e-5, 0 along e_3 to 1e-12.
//  CW the window holds the one-line level at rate 0: retained at least 1 - 1e-3 at every one of 24 beats at cut 6.
// CHECKS (a failed check makes the verdict partial): on every beat of every track 0 register mismatches, 0 matter-born
// drift, the mixer applied twice gives the state back (0 slots off), the collision's gate re-read after every firing
// gives the same involution (0 off); the line bound of point 4 on every beat of every track (0 beats over); the
// star theorem under the gate (E-SPN-0119's trio at rate 0, 4 paths: 0 readings off X's star); the stand-in's held,
// escaped and dropped weight sum to 1 to 1e-10.
// READ, NOT GATED: turns, K firings, the docks the gate took from K, B's kept/swapped/left singles, lines at 128 and
// footprint per line, vacuum-born singles at 128, beats where the disturbed line count fell; the star and two hubs at
// rate 0 with and without the gate (what gating K breaks); the stand-in at rates 1 and 1/4.
// Verdict: partial if a control or check fails; pass if O1 .. O4 hold; fail otherwise.
// PROBES, disclosed (instrument only): tmp/origk-probe1.log (meson and lone love, offsets 0 and 1, rates 3 and 0: the
// meson ends at 79 and 97 docks on 14 and 18 lines after 16 and 25 turns, the lone love at 60 and 55; 0 K firings, 0
// B-leaves, 0 mismatches; gate 'none' equals originTrack for 48 beats; growth 64 to 128 is 47 to 79 docks),
// tmp/origk-star1.log (trio at rate 0: K 67 -> 4 and 49 -> 7 firings, 0 off the star either way; two hubs: 4,092 and
// 4,095 docks ungated, 41 and 39 gated), tmp/origk-stand1.log (the window at rate 0 keeps 0.99977 at beat 24; rate 1
// keeps 0.293 from the one-line level).
//
// FIRST RUN (tmp/origk-exp-run1.log, 401 s): PARTIAL, because control CK fails on its cascade clause. O1 and O3 fail,
// O2 passes, O4 is not reached, CA and CW pass, and every check passes.
//  - CK: gate 'none' equals originTrack bit for bit on 4 of 4 meson terms (0 off). But the clause "and cascades there
//    (at least half the box on each)" fails on p2, which ends at 185 docks. E-SPN-0123 recorded the same 185 for p2, so
//    the clause was written against the wrong record (E-SPN-0121's, where every term filled). The reproduction holds.
//    The clause is not moved, so the verdict is partial.
//  - O1 fails on growth only, as point 5 predicted. All 32 terms stay under half the box: the meson ends at 59 to 132
//    of 4,096 docks (mean 88.9, from 49.4 at beat 64), the lone love at 31 to 60 (mean 44.8, from 24.8). Growth from
//    beat 64 to 128 is 0.185 to 1.30 for the meson and 0.192 to 2.14 for the love, so 0 of 32 terms meet 10%. K fires
//    once over 16 meson terms and never for the love. The gate refuses K 174 times a meson term, and B leaves 0 singles
//    on an empty line. 5.9 docks per disturbed line, 15.1 lines a meson term at 128 against 21.4 turns (10.5 after beat
//    64). 0 beats where the disturbed line count fell. What grows is a trail of mixer turns, not a cascade.
//  - O2 holds exactly.
//  - O3 is not held: the stand-in has no K, so it is E-SPN-0123's (retained 0.0351 at beat 24, mean string 3.99, bent
//    0.89). CW shows the window keeps the rate-0 level (0.99977), so the loss is the mixer's. Rate 1 keeps 0.293 and rate
//    1/4 keeps 0.955, still falling at beat 24 (0.989 at 8), so no tested angle holds it. Why, from the readings: after a
//    turn the two vibes sit on orthogonal axes and the register records the path (E-SPN-0116). Each turn lays string on
//    a new axis that only an exact retrace removes, so the string grows (mean 0.85 links at rate 0, about 4 at rates 1 to
//    3) and the weight leaves the window.
//  - CA: rate 0 with K gated equals keyedRunner bit for bit on 4 of 4 meson paths and never reaches the gate. The lone
//    love holds 6.25 docks. The stand-in gives E 0.3188654375223 and m*/E_rest 1.7930822, 0 along e_3.
//  - What gating K breaks at angle 0 (read): E-SPN-0119's trio fires K 15 times instead of 244 and recruits 5 vacuum
//    pairs instead of 48. It stays on the star (0 readings off either way), ends 195 vibes apart from the ungated run, and
//    B moves 163 singles onto empty star lines at X. Two hubs: 4,093.5 docks and 292,926 K firings ungated, 40 docks and
//    8 firings gated.
//  Checks: 0 register mismatches, 0 drift, 0 reversal slots off, 0 collide disagreements, 0 beats over the line bound,
//  norm gap 6e-12.
// Depth L1 for O1, O2 and the checks (exact on the rule's integer paths, derived, the controls reproducing the record),
// L2 for the stand-in. DETERMINISM: no random numbers; the key is integer arithmetic and every start is placed. NOTHING
// MOVES: every piece hands a vibe and its origin to a slot of its own dock; the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, keyedRunner, meshLines, pathOffset, type MeshLines } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { placeLoves, starLines } from '@/code/measure/hub-star'
import { storeLine } from '@/code/measure/planon-lines'
import { originTrack, type OriginTrack } from '@/code/measure/origin-gated-mixer'
import { gatedTrack, type GatedTrack, type KGate } from '@/code/measure/origin-gated-bounce'
import { meson, pairEmbed } from '@/code/measure/string-binding'
import { nrSeed, settle } from '@/code/measure/meson-band'
import { addStates, autocorrelation, axisOfLine, frameAxes, frameBeat, frameSpace, lineFrame, lineState, momentsOf, normalized, ritzLevels, weightOf, type FrameSpace, type FrameState } from '@/code/measure/frame-meson'
import { hermitianEigen } from '@/code/measure/quantum-ladder'
import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'

const B = rootIndex([1, 1, 0, 0])
const TRIO = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
].map(rootIndex)
const RATE = 3
const SIDE = 8
const BEATS = 128
const PATHS = 16
const FEW = 4
const HUB_PATHS = 2
const GROWTH_FROM = 64
const GROWTH_LIMIT = 0.1
const BOX_SHARE = 0.5
const WINDOW_SIDES = [4, 8]
const LINE_DOCKS = 8
const K_LINES = 12
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
const MASS_SAME = 0.05
const ENERGY_SAME = 1e-9
const MASS = Math.PI / 3
const CURVE_FRAC = 1 / 64
const CURVE_SHARE = 0.1
const NORM_SAME = 1e-10
const RITZ_T = 120
const READ_RATES = [1, 0.25]
const REPORT_AT = [8, 16, 32, 64, 128]

export default experiment({
  id: 'spin/origin-gated-bounce',
  code: 'E-SPN-0128',
  title:
    "gating K on origin too (K only where two matter-born singles share a dock, B elsewhere) ends the cascade but not the growth, partial (CK's cascade clause) with O1 and O3 failing: the piece is exact and an involution with a gate it keeps (0 disagreements at every firing), the vacuum runs bit for bit, and the meson now ends at 59 to 132 of 4,096 docks (mean 89, all 16 terms under half the box, against 185 to 4,095 in E-SPN-0123) and a lone love at 31 to 60, with K firing once over 16 meson terms and 0 lines ever healing; what grows is a trail, about 6 docks per disturbed line and one line per mixer turn (21 turns a meson term, 10.5 after beat 64), so the footprint still grows 18% to 130% from beat 64 to 128 and 0 of 32 terms meet the 10% clause; a knocked-loose vacuum vibe stays on its line forever (derived: a line that evolves on its own never returns to the vacuum), B swaps it with matter 4,960 times and never moves a single onto an empty line in these runs; the two-hub cascade of E-SPN-0119 is gone (4,093 docks to 40), E-SPN-0115's one-line meson is untouched bit for bit, but E-SPN-0119's star fires K 15 times instead of 244; the vacuum-free stand-in has no K and keeps 0.035 of the weight by beat 24 at rate 3, 0.293 at rate 1 and 0.955 at rate 1/4, against 0.99977 at rate 0 on the same window, so no mixer angle tested holds the pair; the ungated control equals E-SPN-0123 bit for bit on 4 of 4 terms but one of them (185 docks) does not fill half the box, so CK's cascade clause fails as written",
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
        meson: { start: placeVibes(vacuum, [{ dock: X, slot: B, vibe: 1 }, { dock: Y, slot: B, vibe: -1 }]), matter: [X * 24 + B, Y * 24 + B] },
        love: { start: placeVibes(vacuum, [{ dock: X, slot: B, vibe: 1 }]), matter: [X * 24 + B] },
      }
    }
    type Setup = ReturnType<typeof setup>
    type Start = { start: Configuration; matter: number[] }
    const s8 = setup(SIDE)
    const track = (g: Setup, s: Start, path: number, n: number, kGate: KGate = 'matter', star?: Uint8Array): GatedTrack =>
      gatedTrack({ tables: g.f.tables, vacuum: g.vacuum, start: s.start, matter: s.matter, key: fullPathKey(pathOffset(path)), threshold: THRESHOLD_BORN, beats: BEATS, n, gate: 'origin', kGate, lines: g.lines, star })

    // the lines where a start differs from the vacuum
    const linesOff = (lines: MeshLines, p: Configuration, q: Configuration): number => {
      const on = new Set<number>()

      for (let i = 0; i < p.vibe.length; i++) if (p.vibe[i] !== q.vibe[i] || (p.vibe[i] !== 0 && (p.point[i] !== q.point[i] || p.open[i] !== q.open[i]))) on.add(lines.lineOf[i] as number)
      for (let s = 0; s < p.store.length; s++) if (p.store[s] !== q.store[s] || (p.store[s] !== 0 && (p.spoint[s] !== q.spoint[s] || p.sopen[s] !== q.sopen[s]))) on.add(storeLine(lines, s))

      return on.size
    }
    // the line bound of point 4, beats over it
    const boundOver = (r: GatedTrack, L0: number): number => {
      let over = 0
      let turns = 0

      for (let t = 0; t < BEATS; t++) {
        turns += r.moved[t] as number

        const k = r.events.filter(e => e.beat <= t).length

        if ((r.lines[t] as number) > L0 + turns + K_LINES * k + r.collide.bLeft || (r.footprint[t] as number) > LINE_DOCKS * (r.lines[t] as number)) over++
      }

      return over
    }

    const mesons = Array.from({ length: PATHS }, (_, k) => track(s8, s8.meson, k, RATE))

    log('meson terms')

    const loves = Array.from({ length: PATHS }, (_, k) => track(s8, s8.love, k, RATE))

    log('love terms')

    const growthOf = (r: GatedTrack): number => ((r.footprint[BEATS - 1] as number) - (r.footprint[GROWTH_FROM - 1] as number)) / Math.max(1, r.footprint[GROWTH_FROM - 1] as number)
    const small = (r: GatedTrack): boolean => (r.footprint[BEATS - 1] as number) < BOX_SHARE * s8.f.cells
    const bounded = (r: GatedTrack): boolean => growthOf(r) < GROWTH_LIMIT && small(r)
    const O1 = mesons.every(bounded) && loves.every(bounded)

    // ---- O2: the vacuum ----
    const windows = WINDOW_SIDES.map(side => {
      const g = side === SIDE ? s8 : setup(side)
      const r = track(g, { start: g.vacuum, matter: [] }, 0, RATE)

      return { side, wake: r.wake.reduce((u, v) => u + v, 0), gated: r.vacuumGated + r.collide.k + r.collide.bMulti + r.vacuumCollide.k + r.vacuumCollide.bMulti, singles: r.vacuumRunSingles, matter: r.vacuumMatter }
    })
    const runner = keyedRunner(s8.f.tables, s8.vacuum, { key: fullPathKey(0), threshold: THRESHOLD_BORN })

    for (let t = 0; t < BEATS; t++) runner.beat()

    const differ = (p: Configuration, q: Configuration): number => {
      let n = 0

      for (let i = 0; i < p.vibe.length; i++) if (p.vibe[i] !== q.vibe[i] || (p.vibe[i] !== 0 && (p.point[i] !== q.point[i] || p.open[i] !== q.open[i]))) n++
      for (let i = 0; i < p.store.length; i++) if (p.store[i] !== q.store[i] || (p.store[i] !== 0 && (p.spoint[i] !== q.spoint[i] || p.sopen[i] !== q.sopen[i]))) n++

      return n
    }
    const vacuumDiffer = differ(runner.state(), (mesons[0] as GatedTrack).vacuumLast)

    log('vacuum')

    // ---- CK: the K gate off is E-SPN-0123 ----
    const ungated = Array.from({ length: FEW }, (_, k) => track(s8, s8.meson, k, RATE, 'none'))
    const old = Array.from({ length: FEW }, (_, k) => originTrack({ tables: s8.f.tables, vacuum: s8.vacuum, start: s8.meson.start, matter: s8.meson.matter, key: fullPathKey(pathOffset(k)), threshold: THRESHOLD_BORN, beats: BEATS, n: RATE, gate: 'origin' }))
    const ckOff = ungated.map((r, k) => {
      const m = old[k] as OriginTrack
      let off = 0

      for (let t = 0; t < BEATS; t++) if (r.wake[t] !== m.wake[t] || r.footprint[t] !== m.footprint[t] || r.kDocks[t] !== m.kDocks[t]) off++
      for (let i = 0; i < r.lastOrigins.slot.length; i++) if (r.lastOrigins.slot[i] !== m.lastOrigins.slot[i]) off++
      for (let i = 0; i < r.lastOrigins.store.length; i++) if (r.lastOrigins.store[i] !== m.lastOrigins.store[i]) off++

      return off + differ(r.last, m.last)
    })
    const CK = ckOff.every(x => x === 0) && ungated.every(r => !small(r))

    log('control CK')

    // ---- CA: mixer angle 0 with K gated ----
    const mesons0 = Array.from({ length: FEW }, (_, k) => track(s8, s8.meson, k, 0))
    const loves0 = Array.from({ length: FEW }, (_, k) => track(s8, s8.love, k, 0))
    const stepperDiffer = mesons0.map((r, k) => {
      const run = keyedRunner(s8.f.tables, s8.meson.start, { key: fullPathKey(pathOffset(k)), threshold: THRESHOLD_BORN })

      for (let t = 0; t < BEATS; t++) run.beat()

      return differ(run.state(), r.last)
    })
    const mesonGateReached0 = mesons0.reduce((n, r) => n + r.collide.k + r.collide.bMulti, 0)

    log('control CA rule')

    // ---- the star and two hubs at angle 0, gated and not ----
    const star = starLines(s8.lines, [s8.X])
    const Yt = Math.floor((s8.f.tables.target[s8.X * 24 + (TRIO[0] as number)] as number) / 24)
    const trioPlaced = TRIO.map(slot => ({ dock: s8.X, slot }))
    const hubPlaced = [
      { dock: s8.X, slot: TRIO[1] as number },
      { dock: s8.X, slot: TRIO[0] as number },
      { dock: Yt, slot: TRIO[2] as number },
      { dock: Yt, slot: TRIO[0] as number },
    ]
    const placed = (ps: { dock: number; slot: number }[]): Start => ({ start: placeLoves(s8.vacuum, ps), matter: ps.map(p => p.dock * 24 + p.slot) })
    const trio = placed(trioPlaced)
    const hubs = placed(hubPlaced)
    const trioGated = Array.from({ length: FEW }, (_, k) => track(s8, trio, k, 0, 'matter', star))
    const trioOpen = Array.from({ length: FEW }, (_, k) => track(s8, trio, k, 0, 'none', star))
    const hubsGated = Array.from({ length: HUB_PATHS }, (_, k) => track(s8, hubs, k, 0, 'matter'))
    const hubsOpen = Array.from({ length: HUB_PATHS }, (_, k) => track(s8, hubs, k, 0, 'none'))
    const starOff = trioGated.reduce((n, r) => n + r.offStar, 0)
    const trioStarOffOpen = trioOpen.reduce((n, r) => n + r.offStar, 0)
    const vibesApart = (p: Configuration, q: Configuration): number => {
      let n = 0

      for (let i = 0; i < p.vibe.length; i++) if (p.vibe[i] !== q.vibe[i]) n++

      return n
    }

    log('star and hubs')

    const everyTrack = [...mesons, ...loves, ...ungated, ...mesons0, ...loves0, ...trioGated, ...trioOpen, ...hubsGated, ...hubsOpen]
    const vacuumSinglesAll = everyTrack.reduce((n, r) => n + r.vacuumRunSingles, 0)
    const vacuumGatedAll = everyTrack.reduce((n, r) => n + r.vacuumGated, 0)
    const vacuumMatterAll = everyTrack.reduce((n, r) => n + r.vacuumMatter, 0)
    const vacuumCollideAll = everyTrack.reduce((n, r) => n + r.vacuumCollide.k + r.vacuumCollide.bMulti, 0)
    const O2 = vacuumSinglesAll === 0 && vacuumGatedAll === 0 && vacuumMatterAll === 0 && vacuumCollideAll === 0 && windows.every(w => w.wake === 0 && w.gated === 0 && w.singles === 0 && w.matter === 0) && vacuumDiffer === 0

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

    const energyAt = (space: FrameSpace, K: readonly number[], start: FrameState): { energy: number; weight: number; residual: number } => {
      const ritz = ritzLevels(autocorrelation(space, K, start, RITZ_T).c).sort((x, y) => y.weight - x.weight)

      return ritz[0] as { energy: number; weight: number; residual: number }
    }
    const uB = frameAxes(F)[axisB] as number[]
    const s0 = frameSpace({ frame: F, n: 0, D, cut: 2 * N, floor: 1e-24 })
    const onB = lineState(s0, axisB, entries)
    const e0 = energyAt(s0, [0, 0, 0, 0], onB)
    const eRest0 = 2 * MASS + e0.energy
    const step0 = eRest0 * CURVE_FRAC
    const curve0 = (energyAt(s0, uB.map(x => x * step0), onB).energy + energyAt(s0, uB.map(x => -x * step0), onB).energy - 2 * e0.energy) / (step0 * step0)
    const total0 = 1 / (curve0 * eRest0)
    const eTrans = energyAt(s0, [0, 0, step0, 0], onB)
    const CA = stepperDiffer.every(x => x === 0) && mesonGateReached0 === 0 && loves0.every(small) && Math.abs(e0.energy - E_REST) <= ENERGY_SAME && Math.abs(total0 - TOTAL) <= TOTAL_SAME && Math.abs(eTrans.energy - e0.energy) <= 1e-12

    log('stand-in rate 0')

    // a hold on the window: retained weight a beat, the balance, and the moments at the end
    const hold = (n: number, symmetric: boolean) => {
      const space = frameSpace({ frame: F, n, D, cut: CUT, floor: FLOOR })
      let s: FrameState = new Map()

      if (symmetric) for (let a = 0; a < 4; a++) s = addStates(s, lineState(space, a, entries))
      else s = lineState(space, axisB, entries)
      s = normalized(s)

      const start = s
      const tally = { escaped: 0, dropped: 0 }
      const retained: number[] = []

      for (let t = 0; t < HOLD_BEATS; t++) {
        s = frameBeat(space, [0, 0, 0, 0], s, tally)
        retained.push(weightOf(s))
      }

      return { space, start, retained, tally, gap: Math.abs((retained[HOLD_BEATS - 1] as number) + tally.escaped + tally.dropped - 1), moments: momentsOf(space, s, N), held: retained.every(w => w >= 1 - TAIL) }
    }

    // CW: the window holds the one-line level at rate 0
    const window0 = hold(0, false)
    const CW = window0.held

    const main = hold(RATE, true)

    log('stand-in rate 3')

    let tensor: number[][] = []
    let eigen: number[] = []
    let isotropy = Number.NaN
    let totalMixed = Number.NaN
    let curved = 0

    if (main.held) {
      const e3 = energyAt(main.space, [0, 0, 0, 0], main.start)
      const eRest = 2 * MASS + e3.energy
      const step = eRest * CURVE_FRAC
      const second = (u: readonly number[]): number => (energyAt(main.space, u.map(x => x * step), main.start).energy + energyAt(main.space, u.map(x => -x * step), main.start).energy - 2 * e3.energy) / (step * step)
      const unit = (a: number): number[] => [0, 1, 2, 3].map(k => (k === a ? 1 : 0))
      const diag = [0, 1, 2].map(a => second(unit(a)))

      tensor = [0, 1, 2].map(a => [0, 1, 2].map(b => (a === b ? (diag[a] as number) : second(unit(a).map((x, k) => (x + (unit(b)[k] as number)) / Math.SQRT2)) - ((diag[a] as number) + (diag[b] as number)) / 2)))
      eigen = hermitianEigen(3, Float64Array.from(tensor.flat()), new Float64Array(9)).values.slice().sort((x, y) => x - y)
      isotropy = (eigen[0] as number) / (eigen[2] as number)
      curved = eigen.filter(v => v >= (CURVE_SHARE * curve0) / 4).length
      totalMixed = 1 / (second(uB) * eRest)
    }

    const O3 = main.held && curved >= 2
    const O4 = O3 && Math.abs(totalMixed / TOTAL - 1) <= MASS_SAME

    // read: smaller mixer angles from the one-line level
    const smaller = READ_RATES.map(n => ({ n, ...hold(n, false) }))

    log('stand-in read rates')

    // ---- checks ----
    const mismatch = everyTrack.reduce((n, r) => n + r.mismatch, 0)
    const drift = everyTrack.reduce((n, r) => n + r.matterDrift, 0)
    const reversalDiffer = everyTrack.reduce((n, r) => n + r.reversalDiffer, 0)
    const collideOff = everyTrack.reduce((n, r) => n + r.collide.off + r.vacuumCollide.off, 0)
    const L0meson = linesOff(s8.lines, s8.meson.start, s8.vacuum)
    const L0love = linesOff(s8.lines, s8.love.start, s8.vacuum)
    const boundOff = [...mesons.map(r => boundOver(r, L0meson)), ...loves.map(r => boundOver(r, L0love)), ...mesons0.map(r => boundOver(r, L0meson)), ...loves0.map(r => boundOver(r, L0love))].reduce((u, v) => u + v, 0)
    const normGap = Math.max(main.gap, window0.gap, ...smaller.map(s => s.gap))
    const checked = mismatch === 0 && drift === 0 && reversalDiffer === 0 && collideOff === 0 && boundOff === 0 && starOff === 0 && normGap <= NORM_SAME
    const status = !CK || !CA || !CW || !checked ? 'partial' : O1 && O2 && O3 && O4 ? 'pass' : 'fail'

    // ---- readings ----
    const mean = (xs: number[]): number => xs.reduce((u, v) => u + v, 0) / xs.length
    const sum = (xs: number[]): number => xs.reduce((u, v) => u + v, 0)
    const at = (r: GatedTrack, key: 'footprint' | 'lines' | 'kDocks' | 'matterSingles' | 'vacuumSingles'): string => REPORT_AT.map(t => r[key][t - 1]).join('/')
    const firstTurn = (r: GatedTrack): number => r.moved.findIndex(x => x > 0) + 1
    const fell = (r: GatedTrack): number => r.lines.filter((v, t) => t > 0 && v < (r.lines[t - 1] as number)).length
    const turnsBetween = (r: GatedTrack, a: number, b: number): number => sum(r.moved.slice(a, b))
    const f128 = (rs: GatedTrack[]): number[] => rs.map(r => r.footprint[BEATS - 1] as number)

    const metrics: Record<string, number> = {
      O1: O1 ? 1 : 0,
      O2: O2 ? 1 : 0,
      O3: O3 ? 1 : 0,
      O3_held: main.held ? 1 : 0,
      O4: O4 ? 1 : 0,
      control_CK: CK ? 1 : 0,
      control_CA: CA ? 1 : 0,
      control_CW: CW ? 1 : 0,
      checked: checked ? 1 : 0,
      cells: s8.f.cells,
      meshLines: s8.lines.count,
      boundedMesons: mesons.filter(bounded).length,
      boundedLoves: loves.filter(bounded).length,
      smallMesons: mesons.filter(small).length,
      smallLoves: loves.filter(small).length,
      mesonMinFootprint128: Math.min(...f128(mesons)),
      mesonMaxFootprint128: Math.max(...f128(mesons)),
      mesonMeanFootprint128: mean(f128(mesons)),
      mesonMeanFootprint64: mean(mesons.map(r => r.footprint[GROWTH_FROM - 1] as number)),
      mesonMinGrowth: Math.min(...mesons.map(growthOf)),
      mesonMeanGrowth: mean(mesons.map(growthOf)),
      loveMinFootprint128: Math.min(...f128(loves)),
      loveMaxFootprint128: Math.max(...f128(loves)),
      loveMeanFootprint128: mean(f128(loves)),
      loveMeanFootprint64: mean(loves.map(r => r.footprint[GROWTH_FROM - 1] as number)),
      loveMinGrowth: Math.min(...loves.map(growthOf)),
      loveMeanGrowth: mean(loves.map(growthOf)),
      mesonMeanLines128: mean(mesons.map(r => r.lines[BEATS - 1] as number)),
      loveMeanLines128: mean(loves.map(r => r.lines[BEATS - 1] as number)),
      mesonMeanTurns: mean(mesons.map(r => sum(r.moved))),
      loveMeanTurns: mean(loves.map(r => sum(r.moved))),
      mesonMeanTurnsLate: mean(mesons.map(r => turnsBetween(r, GROWTH_FROM, BEATS))),
      loveMeanTurnsLate: mean(loves.map(r => turnsBetween(r, GROWTH_FROM, BEATS))),
      mesonDocksPerLine: sum(f128(mesons)) / sum(mesons.map(r => r.lines[BEATS - 1] as number)),
      mesonMeanFirstTurn: mean(mesons.map(firstTurn)),
      mesonK: sum(mesons.map(r => r.collide.k)),
      loveK: sum(loves.map(r => r.collide.k)),
      mesonMeanRefusedK: mean(mesons.map(r => r.collide.refusedK)),
      loveMeanRefusedK: mean(loves.map(r => r.collide.refusedK)),
      mesonBKept: sum(mesons.map(r => r.collide.bKept)),
      mesonBSwapped: sum(mesons.map(r => r.collide.bSwapped)),
      mesonBLeft: sum(mesons.map(r => r.collide.bLeft)),
      loveBLeft: sum(loves.map(r => r.collide.bLeft)),
      mesonMeanVacuumSingles128: mean(mesons.map(r => r.vacuumSingles[BEATS - 1] as number)),
      mesonMaxMatterSingles: Math.max(...mesons.map(r => Math.max(...r.matterSingles))),
      linesFellBeats: sum([...mesons, ...loves].map(fell)),
      L0meson,
      L0love,
      ungatedMinFootprint128: Math.min(...f128(ungated)),
      ckOff: sum(ckOff),
      stepperDiffer: sum(stepperDiffer),
      mesonGateReached0,
      loveFootprint128Rate0: mean(f128(loves0)),
      mesonFootprint128Rate0: mean(f128(mesons0)),
      trioKGated: sum(trioGated.map(r => r.events.length)),
      trioKOpen: sum(trioOpen.map(r => r.events.length)),
      trioRecruitedGated: sum(trioGated.map(r => r.events.reduce((u, e) => u + e.recruited, 0))),
      trioRecruitedOpen: sum(trioOpen.map(r => r.events.reduce((u, e) => u + e.recruited, 0))),
      trioStarOffGated: starOff,
      trioStarOffOpen,
      trioVibesApart: sum(trioGated.map((r, k) => vibesApart(r.last, (trioOpen[k] as GatedTrack).last))),
      trioBLeft: sum(trioGated.map(r => r.collide.bLeft)),
      hubsFootprint128Gated: mean(f128(hubsGated)),
      hubsFootprint128Open: mean(f128(hubsOpen)),
      hubsKGated: sum(hubsGated.map(r => r.events.length)),
      hubsKOpen: sum(hubsOpen.map(r => r.events.length)),
      vacuumSingles: vacuumSinglesAll,
      vacuumGated: vacuumGatedAll,
      vacuumMatter: vacuumMatterAll,
      vacuumCollide: vacuumCollideAll,
      vacuumDiffer,
      windowWake4: (windows[0] as { wake: number }).wake,
      windowWake8: (windows[1] as { wake: number }).wake,
      mismatch,
      drift,
      reversalDiffer,
      collideOff,
      boundOff,
      standEnergy0: e0.energy,
      standTotal0: total0,
      standTransverse: eTrans.energy - e0.energy,
      window0Retained24: window0.retained[HOLD_BEATS - 1] as number,
      heldRetained8: main.retained[7] as number,
      heldRetained24: main.retained[HOLD_BEATS - 1] as number,
      heldMeanString: main.moments.meanString,
      heldBent: main.moments.bent,
      windowClasses: main.space.classes.length,
      normGap,
      curvedDirections: curved,
      isotropy,
      totalMixed,
      seconds: (Date.now() - started) / 1000,
    }

    for (const s of smaller) {
      metrics[`rate${s.n}Retained8`] = s.retained[7] as number
      metrics[`rate${s.n}Retained24`] = s.retained[HOLD_BEATS - 1] as number
      metrics[`rate${s.n}MeanString`] = s.moments.meanString
      metrics[`rate${s.n}Bent`] = s.moments.bent
    }

    const perTerm = (rs: GatedTrack[]): string => rs.map((r, k) => `p${k}: footprint ${at(r, 'footprint')}, lines ${at(r, 'lines')}, vacuum-born singles ${at(r, 'vacuumSingles')}, turns ${sum(r.moved)} (${turnsBetween(r, GROWTH_FROM, BEATS)} after beat ${GROWTH_FROM}), K ${r.collide.k}, K refused ${r.collide.refusedK}, B kept/swapped/left ${r.collide.bKept}/${r.collide.bSwapped}/${r.collide.bLeft}, growth ${growthOf(r).toFixed(4)}`).join('; ')
    const retainedOf = (xs: number[]): string => [1, 2, 4, 8, 16, 24].map(t => (xs[t - 1] as number).toFixed(5)).join(' ')

    return verdict({
      status,
      claim: `E-SPN-0123's origin-gated mixer with K gated on origin too (K only where two matter-born singles share a dock, B elsewhere): the vacuum runs bit for bit (${vacuumCollideAll} vacuum docks reach the gate, ${vacuumDiffer} readings off keyedRunner); the meson ends at ${metrics.mesonMinFootprint128} to ${metrics.mesonMaxFootprint128} of ${s8.f.cells} docks (${metrics.smallMesons} of ${PATHS} under half the box, ${metrics.boundedMesons} bounded), a lone love at ${metrics.loveMinFootprint128} to ${metrics.loveMaxFootprint128} (${metrics.smallLoves} under half, ${metrics.boundedLoves} bounded); K fires ${metrics.mesonK} times over the meson terms; the stand-in keeps ${(main.retained[HOLD_BEATS - 1] as number).toFixed(4)} by beat ${HOLD_BEATS} at rate ${RATE} against ${(window0.retained[HOLD_BEATS - 1] as number).toFixed(5)} at rate 0`,
      metrics,
      control: { ckOff: sum(ckOff), stepperDiffer: sum(stepperDiffer), window0Retained24: metrics.window0Retained24 as number, standEnergy0: e0.energy, standTotal0: total0 },
      notes: `L1 (O1, O2, checks) and L2 (stand-in). O1 ${O1}; O2 ${O2} (windows ${windows.map(w => `side ${w.side}: wake ${w.wake}, gated ${w.gated}, singles ${w.singles}, matter ${w.matter}`).join('; ')}); O3 ${O3} (held ${main.held}: retained ${retainedOf(main.retained)}; mean string ${main.moments.meanString.toFixed(3)}, bent ${main.moments.bent.toFixed(3)}, ${main.space.classes.length} classes${main.held ? `; tensor ${JSON.stringify(tensor)}, eigenvalues ${eigen.join(', ')}, isotropy ${isotropy}` : ''}); O4 ${O4}${main.held ? ` (m*/E_rest ${totalMixed})` : ' (not reached)'}. CK ${CK} (off ${ckOff.join('/')}, ungated footprints ${f128(ungated).join('/')}); CA ${CA} (stepper ${stepperDiffer.join('/')}, gate reached ${mesonGateReached0}, lone love rate 0 ${f128(loves0).join('/')}, meson rate 0 ${f128(mesons0).join('/')}, E ${e0.energy}, total ${total0}, transverse ${eTrans.energy - e0.energy}); CW ${CW} (rate 0 one-line on the window: ${retainedOf(window0.retained)}). Checks: mismatch ${mismatch}, drift ${drift}, reversal ${reversalDiffer}, collide off ${collideOff}, line bound over ${boundOff} (L0 meson ${L0meson}, love ${L0love}), star off ${starOff}, norm gap ${normGap.toExponential(2)}. Smaller angles from the one-line level: ${smaller.map(s => `rate ${s.n}: ${retainedOf(s.retained)}, mean string ${s.moments.meanString.toFixed(3)}, bent ${s.moments.bent.toFixed(3)}, ${s.space.classes.length} classes`).join('; ')}. Star at rate 0 (trio, ${FEW} paths): K ${metrics.trioKOpen} ungated -> ${metrics.trioKGated} gated, recruited ${metrics.trioRecruitedOpen} -> ${metrics.trioRecruitedGated}, off the star ${trioStarOffOpen} -> ${starOff}, vibes apart at 128 ${metrics.trioVibesApart}, B-leaves ${metrics.trioBLeft}. Two hubs at rate 0 (${HUB_PATHS} paths): footprint ${f128(hubsOpen).join('/')} ungated -> ${f128(hubsGated).join('/')} gated, K ${metrics.hubsKOpen} -> ${metrics.hubsKGated}. Meson terms: ${perTerm(mesons)}. Lone love terms: ${perTerm(loves)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
