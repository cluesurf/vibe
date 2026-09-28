// CAN A COMPOSITE'S HUB WALK BY RECRUITING VACUUM PAIRS (E-SPN-0119)? note/research/vibe/roadmap/remaining-pieces.md,
// "A composite held by bounce meetings" (E-SPN-0118): K on two singles only keeps or swaps them, K on three changes
// lines only through that dock, so a composite of five or fewer lines has hubs that never move. The 32 of 44 line
// changes of E-SPN-0117 were VACUUM PAIRS that K carries onto new lines. The idea tested here: at a hub, K moves a
// vacuum pair onto a new line, that line joins the composite, the old member returns to the vacuum, and the hub steps
// to a neighboring dock (the fracton-to-mobile mechanism, with the rule's own vacuum).
//
// DERIVED BEFORE THE RUN.
// 1. WHAT K DOES AT A DOCK OF SINGLES PLUS THE VACUUM'S FULL LINES. On 'pass' (and 'lone') a dock with two or more
//    singles gets K = w_P on ALL 24 slots, P the singles' momentum (full lines add 0). So a full line m (a vacuum pair)
//    is carried onto the line w_P(m) of the SAME dock, and the singles keep or swap (two singles, E-SPN-0118) or change
//    lines (three). `recruitCensus` counts it over every set of singles and every set of full lines among the dock's
//    other lines: the allowed vacuum-pair moves are exactly m -> w_P(m) with w_P(m) != m, and every image is a slot of
//    the dock (0 images leave it). A consequence E-SPN-0118's count missed: WITH the vacuum, TWO singles already make
//    a hub, since they recruit full lines onto new lines through their dock.
// 2. NO HUB STEP EXISTS: THE STAR THEOREM (code/measure/hub-star). Let S be the twelve mesh lines through X. If a
//    start equals the vacuum off S, the vacuum run has no single line on any dock at any beat (condition Z), and no
//    dock but X lies on two lines of S, then the run equals the vacuum off S at every beat. Induction on the pieces of
//    a beat: the keyed coin, the keyed meeting, the pair move (veto 'none') and the stream act line by line, and the
//    stream keeps every slot on its mesh line. The coin piece is the only piece that reads a whole dock:
//     - at X it permutes X's own 24 slots, and every one of them lies on a line of S;
//     - at a dock y != X at most one of y's lines is in S, so the rest of y is the vacuum's, which holds no single
//       (Z). So y holds at most one single, K does not fire, and B acts on y's other lines as in the vacuum: full
//       lines turn or pass line by line, a lone single of root r keeps its slot (w_r fixes r), and the other non-full
//       lines are empty.
//    So S is closed. A hub step needs a line of the composite that does not pass through X, and the only piece that
//    changes lines is a permutation of one dock's slots, so no finite sequence of recruitments produces one. The
//    order in the beats at which a hub step first appears: none. The leading hop amplitude: exactly 0 at every
//    order. The same induction holds term by term in the all-open rule (each term is a keyed path with the same
//    line-local pieces), so the amplitude, not only these paths, is 0.
// 3. THE GENERAL ARGUMENT. A composite of ANY size whose difference from the vacuum lies on the lines through one dock
//    (up to 12 lines) is pinned to that dock forever. What is NOT closed: composites whose lines pass through two
//    docks. Two singles now suffice for a hub, and lines through X and through Y = X + r cross off both (for
//    r = e_1 + e_2: X + (e_1 + e_3) = Y - (e_2 - e_3)), so hubs there can proliferate. That is route 1 of E-SPN-0118
//    with its threshold lowered from three singles to two, and it is read here as the positive control.
// 4. THE WINDOW. The smallest box the vacuum allows is side 4 (its store has period 4). `starCrossings` counts the
//    docks other than X on two lines of S: if it is 0 the star theorem holds on the box, and the box allows no hub
//    step at all for this start. The probes found 0 at sides 4, 8 and 12, so no window allows one.
// PREDICTED: H1 holds by the proof branch (0 off-star readings and 0 K firings off X, exactly, while K recruits vacuum
// pairs at X), H2 is not reached, H3 holds exactly. The two-hub control puts K firings off X.
//
// GATES, fixed before the first run.
//  H1 the hub moves or provably cannot: EITHER the fraction of the trio's K firings at docks other than X exceeds
//     100 times the vacuum-only control's (with a floor of 1e-3 on the control, since the vacuum fires K nowhere: a
//     threshold of 0.1), OR the proof branch is checked exactly: on every run (8 path offsets on 'pass' and 'lone' at
//     side 8, 128 beats, and path 0 on 'pass' at sides 4 and 12), 0 readings off the star, 0 K firings off X, 0
//     star crossings on the box, 0 vacuum singles and 0 vacuum K firings, and 0 K images off the dock in the census.
//  H2 if it moves (H1 by the first branch): the off-X firings' box offsets from X have rank at least 2 (dispersion
//     in two independent directions). If H1 holds only by the proof branch, H2 is not reached.
//  H3 the vacuum returns where the composite is not: 0 readings differing from the vacuum off the star at every
//     beat of every trio run. (The composite never leaves its star, so "where it has left" is off the star; the
//     star's own difference is reported, not gated.)
// CONTROLS (a failed control or check makes the verdict partial).
//  CV the vacuum alone stays quiet: 0 single lines and 0 K firings in every vacuum run.
//  CB the trio without the vacuum stays at X (E-SPN-0118): 0 readings off the star, 0 firings off X, and K fires
//     at X at least once.
//  CL a lone love keeps its line: its run differs from the vacuum only on its own mesh line (parallelRun, 'pass' and
//     'lone', side 8, 64 beats).
//  CP the instrument can see a hub off X: two loves at X on (1,0,1,0) and (1,1,0,0), two at Y = X + (1,1,0,0) on
//     (1,1,0,0) and (0,1,1,0), so the composite has hubs X and Y. It must put readings off the star of X and K firings
//     off X (side 8, path 0, 'pass').
// CHECKS: the stepper that records K equals keyedRunner bit for bit on every run; recruitCensus(2) equals E-SPN-0118's
//  twoSinglesCensus (docks, singles leaving their lines, docks moving a full line), a second method; the trio's K
//  firings at X recruit at least one vacuum pair over the runs (the mechanism the question asks about happens).
// Verdict: partial if a check or a control fails; pass if H1 and H3 hold and H2 holds or is not reached because H1
// holds by the proof branch; fail otherwise.
// PROBES, disclosed (instrument only): tmp/hub-probe-1.log (side 4: 0 star crossings, the trio fires K 3 times at X
// in 32 beats and recruits nothing; the two-hub start fires off X 7 times), tmp/hub-probe-2.log (sides 8 and 12, 128
// beats, path 0 on 'pass': 0 star crossings, the trio fires 67 and 60 times, all at X, recruiting 13 and 11 vacuum
// pairs, 0 off-star readings, all 12 star lines touched; the two-hub start fires K on every dock of the box).
//
//
// FIRST RUN (tmp/hub-exp-run1.log): PARTIAL, on the census check alone, which was mis-specified: it compared
// recruitCensus's `recruit` (a full line carried onto ANY other line, 165,888 docks, which includes two vacuum pairs
// swapping lines) with twoSinglesCensus's `fullMoved` (a full line carried onto a line that was NOT full, 141,312). The
// check was corrected to compare the same quantity (`recruitNew`); no gate, control or threshold moved, and every gate
// and control reading is unchanged. SECOND RUN (tmp/hub-exp-run2.log, 21 s): PASS, as predicted. Over 18 trio runs K
// fires 977 times, 0 off X, and recruits 195 vacuum pairs onto new lines (47 firings with only two singles recruit),
// every one through X; all 12 star lines carry a difference, the difference reaches 2, 4 and 6 box steps (half the
// box at sides 4, 8, 12) and its centroid spreads 0.51 steps along the lines, yet 0 readings differ from the vacuum
// off the star at any beat, the box has 0 star crossings, and the stepper equals keyedRunner bit for bit. The
// censuses: two singles, K fires on 172,032 of 270,336 docks and a vacuum pair takes a new line on 141,312 (E-SPN-0118's
// number), 0 singles leave their lines; three singles, K fires on 507,904 of 901,120 and recruits onto a new line on
// 439,296; at most 6 full lines move at once; 0 images leave the dock. Controls: the vacuum fires K 0 times with 0
// singles; the bare trio fires 8 times, all at X; a lone love is off its line 0 times on 'pass' and 'lone'; the two-hub
// start fires K off X from beat 0, on all 4,096 docks by beat 128, with a wake of 47, 64, 174 and 39,184 readings at
// beats 8, 16, 32 and 128 (the trio's: 26, 52, 54, 60). So two hubs one root apart do not walk: they cascade through
// the vacuum and fill the box. Title written after the run.
//
// Depth L1: an exact theorem on the committed rule, checked on its integer paths, with a positive control that can
// fail. DETERMINISM: no random numbers; the key is integer arithmetic and every start is placed. NOTHING MOVES: every
// piece hands a value to a slot, and the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { boxSteps, fullPathKey, meshLines, pathOffset } from '@/code/measure/full-key-paths'
import { parallelRun } from '@/code/measure/planon-lines'
import { rootIndex } from '@/code/measure/crossing-lines'
import { twoSinglesCensus } from '@/code/measure/bounce-mover'
import { placeLoves, recruitCensus, starCrossings, starLines, starRun, type StarReading } from '@/code/measure/hub-star'
import { d4BoxCoordinates } from '@/code/substrate/d4-box-integer'

const TRIO = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
].map(rootIndex)
const SIDE = 8
const BEATS = 128
const PATHS = 8
const CONTACTS: CollisionKind[] = ['pass', 'lone']
const OTHER_SIDES = [4, 12]
const LOVE_BEATS = 64
const CONTROL_FLOOR = 1e-3
const FACTOR = 100
const WAKE_AT = [8, 16, 32, 128]

type Run = { side: number; contact: CollisionKind; path: number; crossings: number; reading: StarReading }

const rankOf = (vectors: number[][]): number => {
  const rows = vectors.map(v => v.slice())
  let r = 0

  for (let c = 0; c < (rows[0]?.length ?? 0) && r < rows.length; c++) {
    const p = rows.findIndex((row, i) => i >= r && row[c] !== 0)

    if (p < 0) continue
    ;[rows[r], rows[p]] = [rows[p] as number[], rows[r] as number[]]
    for (let i = 0; i < rows.length; i++) {
      if (i === r) continue
      const f = (rows[i] as number[])[c]! / (rows[r] as number[])[c]!

      rows[i] = (rows[i] as number[]).map((x, k) => x - f * (rows[r] as number[])[k]!)
    }
    r++
  }

  return r
}

export default experiment({
  id: 'spin/hub-star',
  code: 'E-SPN-0119',
  title:
    "a composite's hub cannot walk by recruiting vacuum pairs, pass (H1 by the star theorem): at a dock of two or three singles plus the vacuum's full lines K = w_P carries full lines onto other lines of the same dock (a vacuum pair takes a new line on 141,312 of 270,336 two-single docks and 439,296 of 901,120 three-single docks, 0 images leave the dock), so with the vacuum two singles already make a hub, but every recruit lands on a line through that dock; since every other piece acts line by line and a dock off X meets at most one line through X, a difference on the twelve lines through X stays on them forever, so no hub step exists at any order and the hop amplitude is exactly 0; in the working knit with its vacuum, three loves on (1,1,0,0), (1,0,1,0), (0,1,1,0) at X fire K 977 times over 18 runs (8 paths on 'pass' and 'lone' at side 8, sides 4 and 12, 128 beats), 0 off X, recruiting 195 vacuum pairs, with 0 readings off the star; the vacuum fires K 0 times, the bare trio stays at X, a lone love keeps its line, and two hubs one root apart fire K off X from beat 0 and cascade over all 4,096 docks by beat 128 (one start, one path), a wake rather than a moving composite",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- the censuses ----
    const two = recruitCensus(2, 'pass')
    const three = recruitCensus(3, 'pass')
    const reference = twoSinglesCensus()
    const censusAgrees = two.docks === reference.docks && two.singlesLeft === reference.singlesLeft && two.recruitNew === reference.fullMoved

    log('censuses')

    // ---- the trio runs ----
    const setup = (side: number, contact: CollisionKind) => {
      const X = centerOf(side)
      const f = contactFresh(side, contact, X)
      const lines = meshLines(f.tables)
      const crossings = starCrossings(f.cells, lines, starLines(lines, [X]), [X]).length

      return { X, f, lines, crossings, vacuum: wordVacuum(f, f.store) }
    }
    const runs: Run[] = []
    const trioRun = (side: number, contact: CollisionKind, path: number): void => {
      const s = setup(side, contact)
      const start = placeLoves(s.vacuum, TRIO.map(slot => ({ dock: s.X, slot })))
      const reading = starRun({ tables: s.f.tables, vacuum: s.vacuum, start, lines: s.lines, hub: [s.X], key: fullPathKey(pathOffset(path)), threshold: THRESHOLD_BORN, beats: BEATS, side })

      runs.push({ side, contact, path, crossings: s.crossings, reading })
    }

    for (const contact of CONTACTS) for (let k = 0; k < PATHS; k++) trioRun(SIDE, contact, k)
    for (const side of OTHER_SIDES) trioRun(side, 'pass', 0)

    log('trio')

    const all = runs.map(r => r.reading)
    const events = all.reduce((a, r) => a + r.events.length, 0)
    const offHub = all.reduce((a, r) => a + r.offHub, 0)
    const offStar = all.reduce((a, r) => a + r.offStar, 0)
    const recruited = all.reduce((a, r) => a + r.recruited, 0)
    const vacuumEvents = all.reduce((a, r) => a + r.vacuumEvents, 0)
    const vacuumSingles = all.reduce((a, r) => a + r.vacuumSingles, 0)
    const stepperDiffer = all.reduce((a, r) => a + r.stepperDiffer, 0)
    const crossings = runs.reduce((a, r) => a + r.crossings, 0)
    const twoSingleEvents = all.reduce((a, r) => a + r.events.filter(e => e.singles === 2 && e.recruited > 0).length, 0)

    // ---- H1, H2, H3 ----
    const offHubFraction = events === 0 ? 0 : offHub / events
    // the vacuum has no hub, so every K firing in a vacuum run counts as off X
    const controlFraction = vacuumEvents === 0 ? 0 : 1
    const threshold = FACTOR * Math.max(controlFraction, CONTROL_FLOOR)
    const motion = offHubFraction > threshold
    const proof = offStar === 0 && offHub === 0 && crossings === 0 && vacuumSingles === 0 && vacuumEvents === 0 && three.offDock === 0 && two.offDock === 0
    const H1 = motion || proof
    const offsets = runs.flatMap(r => {
      const X = centerOf(r.side)
      const o = d4BoxCoordinates({ cell: X, side: r.side })

      return r.reading.events.filter(e => e.dock !== X).map(e => d4BoxCoordinates({ cell: e.dock, side: r.side }).map((v, k) => v - (o[k] as number)))
    })
    const offRank = offsets.length === 0 ? 0 : rankOf(offsets)
    const H2 = motion && offRank >= 2
    const H3 = offStar === 0

    // ---- CB: the trio without the vacuum ----
    const bare = setup(SIDE, 'pass')
    const empty: Configuration = { ...bare.vacuum, vibe: new Int8Array(bare.vacuum.vibe.length), store: new Int8Array(bare.vacuum.store.length), sopen: new Uint8Array(bare.vacuum.sopen.length) }
    const bareRun = starRun({ tables: bare.f.tables, vacuum: empty, start: placeLoves(empty, TRIO.map(slot => ({ dock: bare.X, slot }))), lines: bare.lines, hub: [bare.X], key: fullPathKey(0), threshold: THRESHOLD_BORN, beats: BEATS, side: SIDE })
    const CB = bareRun.offStar === 0 && bareRun.offHub === 0 && bareRun.events.length > 0

    log('CB')

    // ---- CL: a lone love keeps its line ----
    const slot = LINE_FIRSTS[0] as number
    const love = CONTACTS.map(contact => {
      const s = setup(SIDE, contact)

      return parallelRun({ tables: s.f.tables, vacuum: s.vacuum, start: placeLoves(s.vacuum, [{ dock: s.X, slot }]), lines: s.lines, set: [s.lines.lineOf[s.X * 24 + slot] as number], key: fullPathKey(0), threshold: THRESHOLD_BORN, beats: LOVE_BEATS, steps: boxSteps(s.f.cells, SIDE, s.X), factor: false })
    })
    const CL = love.every(r => r.off === 0 && r.vacuumSingles === 0)

    log('CL')

    // ---- CV: the vacuum alone ----
    const CV = vacuumSingles === 0 && vacuumEvents === 0

    // ---- CP: two hubs ----
    const Y = Math.floor((bare.f.tables.target[bare.X * 24 + (TRIO[0] as number)] as number) / 24)
    const twoHub = starRun({
      tables: bare.f.tables,
      vacuum: bare.vacuum,
      start: placeLoves(bare.vacuum, [
        { dock: bare.X, slot: TRIO[1] as number },
        { dock: bare.X, slot: TRIO[0] as number },
        { dock: Y, slot: TRIO[2] as number },
        { dock: Y, slot: TRIO[0] as number },
      ]),
      lines: bare.lines,
      hub: [bare.X],
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
      beats: BEATS,
      side: SIDE,
    })
    const CP = twoHub.offStar > 0 && twoHub.offHub > 0
    const twoHubDocks = new Set(twoHub.events.map(e => e.dock)).size
    const firstOffBeat = twoHub.events.find(e => e.dock !== bare.X)?.beat ?? -1

    log('CP')

    // ---- checks ----
    const checks = { stepper: stepperDiffer === 0 && bareRun.stepperDiffer === 0 && twoHub.stepperDiffer === 0, census: censusAgrees, recruitment: recruited > 0 }
    const checked = Object.values(checks).every(Boolean)
    const controlled = CV && CB && CL && CP
    const status = !checked || !controlled ? 'partial' : H1 && H3 && (H2 || (proof && !motion)) ? 'pass' : 'fail'

    const metrics: Record<string, number> = {
      H1: H1 ? 1 : 0,
      H1_motion: motion ? 1 : 0,
      H1_proof: proof ? 1 : 0,
      H2: H2 ? 1 : 0,
      H3: H3 ? 1 : 0,
      control_CV: CV ? 1 : 0,
      control_CB: CB ? 1 : 0,
      control_CL: CL ? 1 : 0,
      control_CP: CP ? 1 : 0,
      runs: runs.length,
      trioEvents: events,
      trioOffHub: offHub,
      offHubFraction,
      offHubThreshold: threshold,
      offRank,
      trioOffStar: offStar,
      trioRecruited: recruited,
      twoSingleRecruitEvents: twoSingleEvents,
      starCrossings: crossings,
      vacuumSingles,
      vacuumEvents,
      stepperDiffer,
      maxLinesTouched: Math.max(...all.map(r => r.linesTouched)),
      maxReach: Math.max(...all.map(r => r.reach)),
      meanCentroidSpread: all.reduce((a, r) => a + r.centroidSpread, 0) / all.length,
      meanOnStarLast: all.reduce((a, r) => a + r.onStarLast, 0) / all.length,
      maxOnStarPeak: Math.max(...all.map(r => r.onStarPeak)),
      census2Docks: two.docks,
      census2Fires: two.fires,
      census2Recruit: two.recruit,
      census2RecruitNew: two.recruitNew,
      census3RecruitNew: three.recruitNew,
      census2MaxRecruited: two.maxRecruited,
      census2SinglesLeft: two.singlesLeft,
      census3Docks: three.docks,
      census3Fires: three.fires,
      census3Recruit: three.recruit,
      census3MaxRecruited: three.maxRecruited,
      censusOffDock: two.offDock + three.offDock,
      referenceFullMoved: reference.fullMoved,
      bareEvents: bareRun.events.length,
      bareOffStar: bareRun.offStar,
      bareOffHub: bareRun.offHub,
      loveOffPass: (love[0] as (typeof love)[number]).off,
      loveOffLone: (love[1] as (typeof love)[number]).off,
      twoHubOffStar: twoHub.offStar,
      twoHubOffHub: twoHub.offHub,
      twoHubEvents: twoHub.events.length,
      twoHubDocks,
      twoHubRecruited: twoHub.recruited,
      twoHubFirstOffBeat: firstOffBeat,
      seconds: (Date.now() - started) / 1000,
    }

    WAKE_AT.forEach(t => (metrics[`twoHubWake_${t}`] = twoHub.wake[t - 1] as number))
    WAKE_AT.forEach(t => (metrics[`trioWake_${t}`] = (runs[0] as Run).reading.wake[t - 1] as number))

    const perRun = runs.map(r => `${r.contact}/s${r.side}/p${r.path}: K ${r.reading.events.length} (off X ${r.reading.offHub}, recruited ${r.reading.recruited}), off-star ${r.reading.offStar}, star lines ${r.reading.linesTouched}, reach ${r.reading.reach}, on-star last ${r.reading.onStarLast}`).join('; ')

    return verdict({
      status,
      claim: `three loves on (1,1,0,0), (1,0,1,0), (0,1,1,0) at a hub X in the working knit with its vacuum: over ${runs.length} runs K fires ${events} times, ${offHub} of them off X, and recruits ${recruited} vacuum pairs onto new lines, all through X; ${offStar} readings differ from the vacuum off the twelve lines through X (H1 ${H1} by ${motion ? 'motion' : proof ? 'the star theorem' : 'neither'}, H2 ${H2}, H3 ${H3}); the vacuum alone fires K ${vacuumEvents} times, the bare trio fires ${bareRun.events.length} times all at X, a lone love stays on its line; two hubs one root apart fire K off X ${twoHub.offHub} times on ${twoHubDocks} docks`,
      metrics,
      control: { vacuumEvents, bareOffStar: bareRun.offStar, twoHubOffHub: twoHub.offHub, twoHubOffStar: twoHub.offStar },
      notes: `L1. H1 ${H1} (motion ${motion}: off-X fraction ${offHubFraction} vs ${threshold}; proof ${proof}), H2 ${H2} (rank ${offRank}), H3 ${H3}; CV ${CV}, CB ${CB}, CL ${CL}, CP ${CP}; checks ${JSON.stringify(checks)}. Census, 2 singles: ${JSON.stringify(two)} (E-SPN-0118's twoSinglesCensus ${JSON.stringify(reference)}); 3 singles: ${JSON.stringify(three)}. Runs: ${perRun}. Two-singles K firings that recruited: ${twoSingleEvents}. Bare trio: K ${bareRun.events.length}, off-star ${bareRun.offStar}, off X ${bareRun.offHub}. Lone love: off ${love.map(r => r.off).join(', ')}, vacuum singles ${love.map(r => r.vacuumSingles).join(', ')}. Two hubs: K ${twoHub.events.length} on ${twoHubDocks} docks, first off X at beat ${firstOffBeat}, recruited ${twoHub.recruited}, wake ${WAKE_AT.map(t => `${t}:${twoHub.wake[t - 1]}`).join(' ')}; trio wake ${WAKE_AT.map(t => `${t}:${(runs[0] as Run).reading.wake[t - 1]}`).join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
