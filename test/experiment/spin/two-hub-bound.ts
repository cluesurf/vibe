// CAN A BOUND TWO-HUB COMPOSITE MOVE AS A UNIT (E-SPN-0120)? note/project/vibe/roadmap/research/remaining-pieces.md, "The star
// theorem (E-SPN-0119)": a composite whose lines all pass through one dock is pinned at every order, and two unbound hubs
// one diagonal apart set off a K-cascade that fills the box. That cascade is the only route left inside the rule for a
// composite to move off its lines. The question here: when a Z3-neutral two-hub set is joined by the drift cost's
// string (code/rule/bound-line-pieces, E-SPN-0104, 0111, 0112, 0115), does the string confine the cascade to a finite
// wake that travels with the composite, or does the cascade still run away?
//
// THE START. X the box's center, Y = X + b one diagonal along b = (1,1,0,0), a = (1,0,1,0), c = (0,1,1,0) (the lines
// and slots of E-SPN-0119's two-hub control). A love on a and a love on b at X, a fear on b and a fear on c at Y:
// charge 0, so Z3-neutral, with a love and a fear on the one line b that joins the hubs (the meson of E-SPN-0115).
// E-SPN-0119's control put loves in all four places (charge 4, not neutral); it is kept as control CU.
//
// DERIVED BEFORE THE RUN.
// 1. WHERE THE LINES CROSS. The composite's lines are a through X, b through X and Y, c through Y. Two lines of D4
//    share at most one dock: a and b meet at X, b and c at Y, and a and c never meet (s a - u c = b has no solution:
//    the e_3 coordinate needs s = u and the e_2 one u = -1, the e_1 one s = 1). So at the start K can fire only at X
//    and Y. The STARS of X and Y (their 24 lines) cross at X + r = Y - (b - r) for every root r with r . b = 1, the 8
//    common neighbors of X and Y (e_1 +- e_3, e_1 +- e_4, e_2 +- e_3, e_2 +- e_4), plus the box's wraps. K fires off
//    the hubs only where two singles meet, so the cascade needs vibes that K has recruited at X onto a line of star(X)
//    and at Y onto the matching line of star(Y) to reach one of those docks at one beat (a vibe leaving X along r at
//    beat t and one leaving Y along -(b - r) at beat t meet at X + r at t + 1), or recruits that wrap the box.
//    So the cascade has a TRIGGER: a coincidence of two recruiting firings at the two hubs. Before it the wake is the
//    hubs' stars (E-SPN-0119's pinned wake, twice); after it, K fires where the recruits cross and recruits more.
// 2. WHAT THE STRING CAN DO. The drift cost is a phase zeta^(-n) per beat, n the costly links, DIAGONAL in the
//    configuration (bound-line-pieces (a)). So it moves no vibe: every term of the sum over histories (every keyed
//    path) runs exactly as without it, at every tension. The cascade happens or not term by term, and its size on a
//    term does not depend on D. The string's only lever is interference: two terms that reach ONE configuration add
//    with phases zeta^(-k) and zeta^(-k'), and a coherent sum can raise the weight of bounded configurations (that is
//    how it holds the meson, E-SPN-0112, 0115) and so lower the runaway's by unitarity.
//     - Does each runaway single drag string? Yes, read against the vacuum run: a vibe K displaced writes flux the
//       vacuum's vibe did not, so a runaway term's costly links grow with its wake and its phase winds fast.
//     - But a fast-winding phase on a term suppresses nothing unless another term reaches the SAME configuration. The
//       cascade records its trigger (which beat, which dock, which recruits): two terms whose triggers differ reach
//       orthogonal configurations and cannot cancel. And before the trigger, a string that holds the constituents at
//       their hubs raises the rate of hub firings, so it brings the coincidence sooner, not later.
//    PREDICTION: on every term the wake is bounded (tens to a few hundred readings, the two stars) until a trigger,
//    then grows to the box, the same at every tension; no D gives a finite wake. The wake's size as a function of the
//    tension is the box's at every D, and a finite wake that travels with the composite does not exist.
// 3. WHAT IS NOT COMPUTED, stated plainly. The superposed state itself, where the interference would live, is out of
//    reach: the working vacuum's open pairs meet as like vibes of unequal points (read below as `vacuumSplits`, the most
//    at the start of any beat; 0 at the start itself). On side 4 the superposed beat stopped at 480 such meetings in
//    one beat against its guard of 16 (tmp/twohub-probe-window.log), a split into 2^480 branches before the composite
//    adds any. So the verdict is read on terms,
//    and the argument in 2 is what carries it to the superposed rule. That step is argued, not measured.
//
// GATES, fixed before the first gated run (side 8, 128 beats, 16 keyed paths on 'pass' at the Born threshold, the full
// key's offsets 0 to 15; each is one term and is the same term at every tension).
//  Q1 the wake saturates at a bounded size instead of growing to the box: on every term the wake's growth from beat 64
//     to beat 128 is under 10%, AND its footprint at beat 128 is under half the box's docks. The second clause is the
//     gate's "instead of growing to the box" (a wake that fills the box has stopped growing too), fixed here.
//  Q2 the composite drifts or spreads off every line class: on every term, the most its wake centroid moves off every
//     single line class from beat 1 (Cartesian, minimal image from X), OR the most the centroid of a beat's K firings
//     moves off every line class from the first firing, exceeds 100 times the one-hub control's same reading (the
//     largest over its 16 terms, floored at 1e-3).
//  Q3 if Q1 and Q2 hold: on every term the wake centroid's displacements have numerical rank at least 2.
// CONTROLS (a failed control or check makes the verdict partial).
//  CU E-SPN-0119's unbound two-hub start (four loves) reproduces its runaway: a wake of 39,184 readings and K on all
//     4,096 docks at beat 128, path 0.
//  C1 the one-hub trio stays pinned: E-SPN-0119's trio at X, path 0, 0 readings off the star and 0 firings off X; and
//     on all 16 terms K fires at X only.
//  CV the vacuum alone stays quiet: 0 single lines and 0 K firings in every vacuum run.
// CHECKS: the track's joint run equals keyedRunner bit for bit at beat 128 (path 0); b through X is b through Y; the
//  composite's three lines cross at no dock but X and Y.
// Verdict: partial if a check or control fails; pass if Q1, Q2 and Q3 hold; fail otherwise.
// READ, NOT GATED: each term's trigger (the first beat K has fired on more than 10 docks, the hubs and their 8 common
// neighbors), the drift cost's costly links and running count k, the two extreme terms (always exchange, the one the
// string favors most, and never exchange), side 12 on path 0, the star crossings of X and Y on the box.
// PROBES, disclosed (instrument only): tmp/twohub-probe-keyed.log (path 0: wake 171 at beat 32, 12,241 at 64, 39,160 at
// 128; the always-exchange and never-exchange terms stay under 100 readings with K on 1 or 2 docks),
// tmp/twohub-probe-terms.log (16 paths: every one cascades to the box by beat 128, triggers at beats 20 to 93),
// tmp/twohub-probe-window.log (the superposed beat on side 4 stops at the split guard in the vacuum alone).
//
// FIRST RUN (tmp/twohub-exp-run1.log, 25 s): FAIL on Q1 (and so Q3), every control and check passing. The header's
// line on the vacuum's splits said "thousands a beat", read at the start, where the count is 0. The reading was widened
// to the most at the start of any beat, and the sentence corrected. No gate, control or threshold moved, and every
// gate reading is unchanged. SECOND RUN (tmp/twohub-exp-run2.log, 27 s): FAIL, as predicted.
//  - All 16 terms run away. Each is bounded, at 50 to 200 readings with K on the two hubs and a few neighbors, until a
//    trigger at beats 20 to 94. After it K fires on 4,095 or 4,096 docks, and the footprint at beat 128 is 4,091 to
//    4,096 of 4,096. Growth from 64 to 128 runs 0.0006 to 527, so the numerical half of Q1 passes only on terms
//    whose box is already full. That is why the footprint clause is there.
//  - The mean wake is 94, 640, 24,134 and 39,064 at beats 16, 32, 64 and 128. Side 12, path 0, triggers at beat 50 and
//    fills 20,727 of 20,736 docks by beat 128.
//  - The string's cost counts grow with the wake: 354 costly links at beat 32 and 32,552 at 128 on average (running k
//    2.0e6). So the runaway terms pay a fast-winding phase, and it moves none of them.
//  - Q2 reads true only through the hubs reading. The one-hub control fires K at X alone, so its reading is 0 and
//    floored to a threshold of 0.1, and the composite's K centroid leaves every line by 0.67 to 1.41 because the
//    cascade fires K everywhere. That is the wake filling the box, not a particle drifting. The wake reading is
//    0.35 to 0.74 against a threshold of 107.
//  - The two extreme terms never trigger in 128 beats: always exchange (wake 22, K on 1 dock, 12 costly links) and
//    never exchange (wake 98, K on 2 docks). So a runaway-free history exists. Whether the string's interference can
//    concentrate weight on such histories is the superposed question this cannot compute (the vacuum holds 7,680
//    unequal-point like meetings at the start of a beat on side 8).
//  - Controls: CU reproduces E-SPN-0119 exactly (39,184 readings, 4,096 docks). The trio stays on its star with K at X
//    only on all 16 terms. The vacuum fires K 0 times with 0 singles. The track equals keyedRunner bit for bit. The
//    composite's lines cross nowhere but X and Y, and the two stars cross at exactly the 8 derived common neighbors
//    on the box.
// Title written after the run.
//
// Depth L1 by construction of the question: the rule's own terms, read exactly, with controls that can fail; the
// superposed statement rests on the argument in 2. DETERMINISM: no random numbers; the key is integer arithmetic and
// every start is placed. NOTHING MOVES: every piece hands a value to a slot, and the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import {
  fullPathKey,
  keyedRunner,
  meshLines,
  pathOffset,
} from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import {
  placeLoves,
  starCrossings,
  starLines,
  starRun,
} from '@/code/measure/hub-star'
import {
  lineCrossings,
  lineDirections,
  numericalRank,
  offLine,
  placeVibes,
  twoHubTrack,
  unequalLikeMeetings,
  type TwoHubTrack,
} from '@/code/measure/two-hub-bound'
import { type Configuration } from '@/code/rule/doublet-locked-knit'

const [B, A, C] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
].map(rootIndex) as [number, number, number]
const SIDE = 8
const BEATS = 128
const PATHS = 16
const GROWTH_FROM = 64
const GROWTH_LIMIT = 0.1
const BOX_SHARE = 0.5
const FACTOR = 100
const CONTROL_FLOOR = 1e-3
const RANK = 2
const TRIGGER_DOCKS = 10
const OTHER_SIDE = 12
const REPORT_AT = [16, 32, 64, 128]
// E-SPN-0119's recorded runaway (twoHubWake_128, twoHubDocks)
const CU_WAKE = 39184
const CU_DOCKS = 4096

const sub = (u: readonly number[], v: readonly number[]): number[] =>
  u.map((x, k) => x - v[k]!)

export default experiment({
  id: 'spin/two-hub-bound',
  code: 'E-SPN-0120',
  title:
    "a bound two-hub composite does not move as a unit, fail (Q1): the drift cost is a phase diagonal in the configuration, so it moves no vibe and every term of the rule runs as without it at every tension; a Z3-neutral set (loves on (1,0,1,0) and (1,1,0,0) at X, fears on (1,1,0,0) and (0,1,1,0) at Y = X + (1,1,0,0)) keeps a wake of 50 to 200 readings on its two stars until two hub firings coincide (trigger at beats 20 to 94 on 16 of 16 terms), then the K-cascade fills 4,091 to 4,096 of 4,096 docks by beat 128 (side 12: 20,727 of 20,736), while the string's costly links grow with the wake to 32,552, a fast-winding phase on every runaway term and no confinement on any; the stars of X and Y cross at exactly the 8 derived common neighbors, the unbound control reproduces E-SPN-0119's 39,184 readings, the one-hub trio stays pinned, the vacuum fires K 0 times; Q2 reads true only through the cascade's K centroid, not a drifting particle; whether interference in the superposed rule could favor the runaway-free histories (always and never exchange never trigger) is not computed, since the working vacuum holds 7,680 unequal-point like meetings a beat",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    const setup = (side: number) => {
      const X = centerOf(side)
      const f = contactFresh(side, 'pass', X)
      const vacuum = wordVacuum(f, f.store)
      const Y = Math.floor(f.tables.target[X * 24 + B]! / 24)
      const neutral = placeVibes(vacuum, [
        { dock: X, slot: A, vibe: 1 },
        { dock: X, slot: B, vibe: 1 },
        { dock: Y, slot: C, vibe: -1 },
        { dock: Y, slot: B, vibe: -1 },
      ])

      return { X, Y, f, vacuum, neutral, lines: meshLines(f.tables) }
    }

    const s = setup(SIDE)
    const track = (
      start: Configuration,
      path: number,
      threshold = THRESHOLD_BORN,
      g = s,
      side = SIDE,
    ): TwoHubTrack =>
      twoHubTrack({
        tables: g.f.tables,
        vacuum: g.vacuum,
        start,
        hub: g.X,
        key: fullPathKey(pathOffset(path)),
        threshold,
        beats: BEATS,
        side,
      })

    // ---- the terms ----
    const terms = Array.from({ length: PATHS }, (_, k) =>
      track(s.neutral, k),
    )

    log('terms')

    const trio = placeLoves(
      s.vacuum,
      [B, A, C].map(slot => ({ dock: s.X, slot })),
    )
    const trioTerms = Array.from({ length: PATHS }, (_, k) =>
      track(trio, k),
    )

    log('trio')

    // ---- Q1 ----
    const growthOf = (r: TwoHubTrack): number =>
      (r.wake[BEATS - 1]! - r.wake[GROWTH_FROM - 1]!) /
      Math.max(1, r.wake[GROWTH_FROM - 1]!)
    const bounded = (r: TwoHubTrack): boolean =>
      growthOf(r) < GROWTH_LIMIT &&
      r.footprint[BEATS - 1]! < BOX_SHARE * s.f.cells
    const Q1 = terms.every(bounded)

    // ---- Q2 ----
    const lines = lineDirections(s.f.tables, SIDE, s.X)
    const wakeDrift = (r: TwoHubTrack): number =>
      Math.max(
        ...r.centroid.map(c => offLine(sub(c, r.centroid[0]!), lines)),
      )

    const hubDrift = (r: TwoHubTrack): number => {
      const fired = r.kCentroid.filter(
        (c): c is number[] => c !== undefined,
      )

      return fired.length === 0
        ? 0
        : Math.max(...fired.map(c => offLine(sub(c, fired[0]!), lines)))
    }

    const controlWake = Math.max(...trioTerms.map(wakeDrift))
    const controlHub = Math.max(...trioTerms.map(hubDrift))
    const wakeThreshold = FACTOR * Math.max(controlWake, CONTROL_FLOOR)
    const hubThreshold = FACTOR * Math.max(controlHub, CONTROL_FLOOR)
    const Q2 = terms.every(
      r => wakeDrift(r) > wakeThreshold || hubDrift(r) > hubThreshold,
    )

    // ---- Q3 ----
    const ranks = terms.map(r =>
      numericalRank(r.centroid.map(c => sub(c, r.centroid[0]!))),
    )
    const Q3 = Q1 && Q2 && ranks.every(k => k >= RANK)

    // ---- controls ----
    const unbound = placeLoves(s.vacuum, [
      { dock: s.X, slot: A },
      { dock: s.X, slot: B },
      { dock: s.Y, slot: C },
      { dock: s.Y, slot: B },
    ])
    const cu = track(unbound, 0)
    const CU =
      cu.wake[BEATS - 1] === CU_WAKE &&
      cu.kDocks[BEATS - 1] === CU_DOCKS
    const pinned = starRun({
      tables: s.f.tables,
      vacuum: s.vacuum,
      start: trio,
      lines: s.lines,
      hub: [s.X],
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
      beats: BEATS,
      side: SIDE,
    })
    const trioOffX = trioTerms.reduce(
      (n, r) => n + r.events.filter(e => e.dock !== s.X).length,
      0,
    )
    const C1 =
      pinned.offStar === 0 && pinned.offHub === 0 && trioOffX === 0
    const everyRun = [...terms, ...trioTerms, cu]
    const vacuumEvents = everyRun.reduce(
      (n, r) => n + r.vacuumEvents,
      0,
    )
    const vacuumSingles = everyRun.reduce(
      (n, r) => n + r.vacuumSingles,
      0,
    )
    const CV = vacuumEvents === 0 && vacuumSingles === 0

    log('controls')

    // ---- checks ----
    const runner = keyedRunner(s.f.tables, s.neutral, {
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
    })

    for (let t = 0; t < BEATS; t++) {
      runner.beat()
    }

    const ref = runner.state()
    const last = terms[0]!.last

    let stepperDiffer = 0

    for (let i = 0; i < ref.vibe.length; i++) {
      if (
        ref.vibe[i] !== last.vibe[i] ||
        (ref.vibe[i] !== 0 &&
          (ref.point[i] !== last.point[i] ||
            ref.open[i] !== last.open[i]))
      ) {
        stepperDiffer++
      }
    }

    for (let i = 0; i < ref.store.length; i++) {
      if (
        ref.store[i] !== last.store[i] ||
        (ref.store[i] !== 0 &&
          (ref.spoint[i] !== last.spoint[i] ||
            ref.sopen[i] !== last.sopen[i]))
      ) {
        stepperDiffer++
      }
    }

    const lineA = s.lines.lineOf[s.X * 24 + A]!
    const lineB = s.lines.lineOf[s.X * 24 + B]!
    const lineC = s.lines.lineOf[s.Y * 24 + C]!
    const sharedB = s.lines.lineOf[s.Y * 24 + B] === lineB
    const compositeCrossings = lineCrossings(
      s.f.cells,
      s.lines.lineOf,
      [lineA, lineB, lineC],
      [s.X, s.Y],
    ).length
    const checks = {
      stepper: stepperDiffer === 0,
      sharedB,
      compositeCrossings: compositeCrossings === 0,
    }
    const checked = Object.values(checks).every(Boolean)
    const controlled = CU && C1 && CV
    const status =
      !checked || !controlled
        ? 'partial'
        : Q1 && Q2 && Q3
          ? 'pass'
          : 'fail'

    // ---- read, not gated ----
    const starCross = starCrossings(
      s.f.cells,
      s.lines,
      starLines(s.lines, [s.X, s.Y]),
      [s.X, s.Y],
    ).length
    const triggers = terms.map(
      r => r.kDocks.findIndex(n => n > TRIGGER_DOCKS) + 1,
    )
    const always = track(s.neutral, 0, 65536)
    const never = track(s.neutral, 0, 0)
    const g12 = setup(OTHER_SIDE)
    const wide = track(g12.neutral, 0, THRESHOLD_BORN, g12, OTHER_SIDE)
    const vacuumSplitsStart = unequalLikeMeetings(s.vacuum)
    const vacuumSplits = Math.max(...everyRun.map(r => r.vacuumSplits))
    const mean = (xs: number[]): number =>
      xs.reduce((u, v) => u + v, 0) / xs.length

    log('reads')

    const metrics: Record<string, number> = {
      Q1: Q1 ? 1 : 0,
      Q2: Q2 ? 1 : 0,
      Q3: Q3 ? 1 : 0,
      control_CU: CU ? 1 : 0,
      control_C1: C1 ? 1 : 0,
      control_CV: CV ? 1 : 0,
      terms: PATHS,
      boundedTerms: terms.filter(bounded).length,
      maxGrowth: Math.max(...terms.map(growthOf)),
      minGrowth: Math.min(...terms.map(growthOf)),
      minFootprint128: Math.min(
        ...terms.map(r => r.footprint[BEATS - 1]!),
      ),
      cells: s.f.cells,
      minTrigger: Math.min(...triggers),
      maxTrigger: Math.max(...triggers),
      untriggered: triggers.filter(t => t === 0).length,
      minWakeDrift: Math.min(...terms.map(wakeDrift)),
      minHubDrift: Math.min(...terms.map(hubDrift)),
      controlWakeDrift: controlWake,
      controlHubDrift: controlHub,
      wakeThreshold,
      hubThreshold,
      minRank: Math.min(...ranks),
      cuWake128: cu.wake[BEATS - 1]!,
      cuDocks128: cu.kDocks[BEATS - 1]!,
      trioOffStar: pinned.offStar,
      trioOffX: pinned.offHub + trioOffX,
      vacuumEvents,
      vacuumSingles,
      stepperDiffer,
      compositeCrossings,
      starCrossings: starCross,
      vacuumSplitsStart,
      vacuumSplits,
      alwaysWake128: always.wake[BEATS - 1]!,
      alwaysKDocks: always.kDocks[BEATS - 1]!,
      neverWake128: never.wake[BEATS - 1]!,
      neverKDocks: never.kDocks[BEATS - 1]!,
      side12Wake128: wide.wake[BEATS - 1]!,
      side12Footprint128: wide.footprint[BEATS - 1]!,
      side12Cells: g12.f.cells,
      side12Trigger: wide.kDocks.findIndex(n => n > TRIGGER_DOCKS) + 1,
      meanCostly32: mean(terms.map(r => r.costly[31]!)),
      meanCostly128: mean(terms.map(r => r.costly[BEATS - 1]!)),
      meanCost128: mean(terms.map(r => r.cost[BEATS - 1]!)),
      alwaysCostly128: always.costly[BEATS - 1]!,
      seconds: (Date.now() - started) / 1000,
    }

    REPORT_AT.forEach(
      t =>
        (metrics[`meanWake_${t}`] = mean(
          terms.map(r => r.wake[t - 1]!),
        )),
    )

    const perTerm = terms
      .map(
        (r, k) =>
          `p${k}: trigger ${triggers[k]}, wake ${REPORT_AT.map(t => r.wake[t - 1]).join('/')}, footprint ${r.footprint[BEATS - 1]}, K docks ${r.kDocks[BEATS - 1]}, costly ${r.costly[31]}/${r.costly[BEATS - 1]}, drift ${wakeDrift(r).toFixed(3)}/${hubDrift(r).toFixed(3)}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `a love on (1,0,1,0) and a love on (1,1,0,0) at X, a fear on (1,1,0,0) and a fear on (0,1,1,0) at Y = X + (1,1,0,0), charge 0, in the working knit with its vacuum: over ${PATHS} terms (side 8, 128 beats) ${terms.filter(bounded).length} keep a bounded wake; the cascade triggers at beats ${Math.min(...triggers)} to ${Math.max(...triggers)} (${triggers.filter(t => t === 0).length} untriggered) and the footprint at beat 128 is at least ${Math.min(...terms.map(r => r.footprint[BEATS - 1]!))} of ${s.f.cells} docks; the drift cost is diagonal, so every term is the same at every tension (Q1 ${Q1}, Q2 ${Q2}, Q3 ${Q3})`,
      metrics,
      control: {
        cuWake128: cu.wake[BEATS - 1]!,
        trioOffStar: pinned.offStar,
        vacuumEvents,
      },
      notes: `L1. Q1 ${Q1} (growth ${Math.min(...terms.map(growthOf)).toFixed(4)} to ${Math.max(...terms.map(growthOf)).toFixed(4)}), Q2 ${Q2} (wake drift min ${Math.min(...terms.map(wakeDrift)).toFixed(3)} vs ${wakeThreshold.toFixed(3)}, hub drift min ${Math.min(...terms.map(hubDrift)).toFixed(3)} vs ${hubThreshold.toFixed(3)}), Q3 ${Q3} (ranks ${ranks.join(',')}); CU ${CU} (wake ${cu.wake[BEATS - 1]}, K docks ${cu.kDocks[BEATS - 1]}), C1 ${C1}, CV ${CV}; checks ${JSON.stringify(checks)}. Star crossings of X and Y on the box: ${starCross}. Vacuum unequal-point open like meetings: ${vacuumSplitsStart} at the start, at most ${vacuumSplits} at the start of any beat. Terms: ${perTerm}. Always exchange: wake ${REPORT_AT.map(t => always.wake[t - 1]).join('/')}, K docks ${always.kDocks[BEATS - 1]}, costly ${always.costly[BEATS - 1]}. Never exchange: wake ${REPORT_AT.map(t => never.wake[t - 1]).join('/')}, K docks ${never.kDocks[BEATS - 1]}. Side 12 path 0: wake ${REPORT_AT.map(t => wide.wake[t - 1]).join('/')}, footprint ${wide.footprint[BEATS - 1]} of ${g12.f.cells}, trigger ${metrics.side12Trigger}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
