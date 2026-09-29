// CAN A COMPOSITE HELD BY BOUNCE MEETINGS MOVE IN 3D (E-SPN-0118)? note/research/vibe/roadmap/remaining-pieces.md,
// "Parallel lineons, and the bounce that changes lines" (E-SPN-0117): K, the bounce on a dock with two or more singles,
// never fires on the vacuum (it has no single line) and carries vibes between lines, so it is a line mixer that acts
// only inside matter. Does a composite whose members keep meeting through K have a band with dispersion in more than
// one independent direction?
//
// DERIVED BEFORE THE RUN.
// 1. K ON TWO SINGLES, as a map on (line, slot). K = w_P, P = r_1 + r_2, and w_P fixes P. The census of the committed
//    table (E-SPN-0110, and `singlesCensus(2)` here over all 264 unordered pairs) is: roots at 60 degrees keep their
//    slots, at 90 and 120 degrees they swap (slot d_1 to d_2 and d_2 to d_1), nothing else. So on (line, slot) K is the
//    identity or the transposition of the two vibes: the pair's LINE SET {A, B} is invariant. With full lines on the
//    dock too, K = w_P still (P reads singles only), so the singles still keep or swap, and what changes line is a full
//    line: a vacuum pair recruited onto a new line (`twoSinglesCensus`). That is what E-SPN-0117's C2 counted.
// 2. K ON THREE SINGLES does change lines (576 of 1,760 triples of slots on distinct lines, `singlesCensus(3)`), but
//    K permutes the slots of ONE dock, so every new line passes through that dock. HUB THEOREM: a composite's own line
//    set changes only on a dock where at least three of its distinct lines meet (three singles, or two singles and a
//    full line of its own), and the new lines pass through that dock (a hub). Two distinct mesh lines share at most one
//    dock. So:
//     - a two-vibe composite on crossing lines A, B meets only at X = A n B, and its line set never changes;
//     - a three-vibe composite on three lines through X meets only at X (any two of its lines share only X), each K
//       meeting there sends it to three new lines through X, and so it is on lines through X forever;
//     - with at most five distinct lines, two hubs share at most one line, so at most two hubs exist at once. A line
//       changes only at a hub and the new one passes through it, so a line through no hub is one of the start's. A
//       second hub V can appear only where two of the start's lines already cross (it needs two lines not through the
//       first hub X, and a new line through X). Once there are two, every line passes through X or V, and a third dock
//       lies on at most one line through each: no third hub forms. So the hubs are docks where the start's lines
//       already cross, and they never move.
//    A bound composite stays within a string's length of its lines' crossing, since two non-parallel lines through a
//    hub diverge. So a composite of up to five vibes held on crossing lines is PINNED to its hubs whatever K does: the
//    translates of its hub are disconnected sectors, and its band E(K) is exactly flat (infinite mass in every
//    direction). A one-line composite still moves along its line (E-SPN-0105). What K adds is motion in LINE space at
//    a fixed hub, not in real space. WHAT THIS DOES NOT CLOSE: six or more lines (three hubs can seed a fourth), and
//    vacuum pairs that K recruits onto new lines at the hub, which then belong to the disturbance and are not counted
//    by the composite's own line count. Neither is in this stand-in, which has no vacuum.
// 3. THE GRAPH OF LINE STATES. From three loves on lines (1,1,0,0), (1,0,1,0), (0,1,1,0) (all three pairs at 60
//    degrees, spanning the husk's three axes), K at X reaches 4 line triples over every choice of slots
//    (`lineSetGraph`), 6 lines in all, all through X. It spans every husk direction as LINES, and moves the composite's
//    centroid nowhere.
// 4. WHAT BINDS IT. Two loves carry Z_3 charge 2 and admit no string (E-SPN-0110: 0 assignments on a closed figure
//    eight), so the composite is a neutral trio of loves (charge 3 = 0 mod 3): three strings from X, one along each
//    line, meeting at X. Since every vibe enters and leaves a line only at X, each closed excursion cancels on its links
//    and the flux is the string walked out from X to each vibe (`stringOf`), cost pi / 7 per costly link per beat.
// 5. THE STAND-IN (code/measure/bounce-mover): three loves on lines through X in the unbounded mesh, the working coin,
//    K read from the committed table on every branch, the stream, the cost; positions to +-40 docks. It keeps the full
//    4d dock of every vibe and counts any shared dock off X, and any branch with two vibes on one line at one dock,
//    rather than assuming the hub. The one-vibe level is E-SPN-0110's (a ring of 28, the level of least mean string,
//    0.65). The product of three of them on one line triple is an exact level with the contact off, and not with K
//    (K sends it to the other triples). The start is the equal sum of the products on the 4 reachable triples, the
//    analogue of E-SPN-0110's exchange-symmetric level; the controls start from the one-triple product.
// PROBES, disclosed (instrument only): tmp/kmove-probe.log (the triple census and the line-set graphs of every trio
// through slot 0's line: 1, 2 or 4 triples), tmp/kmove-probe2.log (the product: 32 beats, contact off fidelity 1 -
// 1e-8, with K 0.457 and 6 lines held, tail 1.7e-4, 0 off-hub, 0 clash; a boost along e_1 moved the peak by -0.001),
// tmp/kmove-probe3.log (floor 1e-14, 64 beats: the orbit sum is exact under K, fidelity 1 - 2e-8, tail 5e-5, at the
// energy of the contact-off product; 702,464 configurations, 113 s).
// PREDICTED: M1 holds (the string holds each vibe near X as in E-SPN-0110), M2 fails (dE = 0 in every direction, to the
// reading's resolution), M3 holds (condition Z).
//
// GATES, fixed before the first run.
//  M1 a bound level holds: with the contact K, over 128 beats, the weight with any vibe more than N = 7 docks from X is
//     at most 1e-3 at every beat.
//  M2 its band has curvature along at least two independent husk directions: boosted by e^(i K . centroid) with K =
//     pi/2 along six husk directions (the axes e_1, e_2, e_3 and (e_a + e_b)/sqrt 2, the husk read as the root frame's
//     first three axes as in E-SPN-0110's 3b), dE = E(K) - E(0) read by spectralPeak over 64 beats reaches at least 10
//     percent of the free prediction sum_v [E_1(K . u_v / 3) - E_1(0)] (E_1 the lone band) on at least two of the six
//     (any two of them are independent). The inverse mass tensor 2 dE / K^2 is reported, with its eigenvalues.
//  M3 the vacuum is untouched and a lone love keeps its line and front exactly, in the working knit (side 8, 64 beats,
//     full key, Born threshold): the vacuum holds 0 single lines at every beat, its run with K where two or more singles
//     meet ('lone') equals its run with B everywhere ('bounce') at every slot and store, and a lone love's run
//     likewise equals itself under 'bounce' (so K never touches its front) and differs from the vacuum only on its own
//     line ('lone' and the working 'pass').
// CONTROLS (a failed control makes the verdict partial).
//  C1 line-keeping contact (every vibe keeps its slot at X; on a dock with no full line B's formula is w_P as well, so
//     the line-keeping contact is the identity): the band is flat, |dE| below 10 percent of the prediction on the three
//     husk axes: E-SPN-0110's pinned pair, for three vibes.
//  C2 no string (cost off): nothing is held, the weight past N exceeds 1e-3 within 16 beats.
// CALIBRATION: the M2 reading on three free vibes (no cost, no contact; the beat factorizes, so the trio's
//  autocorrelation is the product of three one-vibe autocorrelations, each a packet of width 16 on a ring of 256) gives
//  each of the six predictions within 5 percent, over the same 64 beats.
// CHECKS: the pair census (0 line changes), the triple census (some line changes), no single leaves its two lines on
//  any two-single dock, the level's winding weight below 1e-8, 0 shared docks off X and 0 clashes on every run, the
//  product exact under C1 and the orbit sum exact under K (fidelity at least 1 - 1e-6 over their runs).
// Verdict: partial if a check, the calibration or a control fails; pass if M1, M2 and M3 hold; fail otherwise.
//
// FIRST RUN (tmp/kmove-run1.log, 1,314 s): FAIL on M2 only, as predicted; no gate moved. M1: the orbit level holds
// under K with tail at most 5.2e-5 and fidelity 1 - 4e-8 over 128 beats, while 7.63 of its weight passes through
// line-changing meetings and it holds 6 lines. The one-triple product falls to fidelity 0.457 under K, so the contact is
// real. M2: dE at K = pi/2 is -0.0011 on every axis and -0.0010 on every face diagonal, against a free prediction of
// 0.0774 and 0.1149, so 0 of 6 directions move. The same -0.0011 appears under the line-keeping contact (C1), so it is
// the reading's own offset for a boosted pinned state, not a band. The inverse mass tensor (diagonal -8.9e-4,
// off-diagonal 3.8e-5, eigenvalues -9.3e-4, -9.3e-4, -8.1e-4, anisotropy 0.12) is that offset divided by K^2 / 2. It is
// zero to the reading's resolution, and its "isotropy" measures nothing. The calibration reads the free trio at 0.0771
// and 0.1145 against 0.0774 and 0.1149 (0.4 percent). M3 holds exactly: the vacuum and a lone love run identically
// under 'lone' and 'bounce' for 64 beats (0 readings differ), the vacuum holds 0 single lines, and the love stays on
// its line (0 off-line readings, on 'lone' and on 'pass'). C2: with no string the tail reaches 0.33 in 16 beats.
// Censuses: pairs change no line (168 keep, 96 identity). Triples change lines in 576 of 1,760. On 270,336 two-single
// docks with full lines, 0 singles leave their two lines and a full line is moved on 141,312. So E-SPN-0117's C2 line
// changes are recruited vacuum pairs, not the meeting vibes. Title written after the run.
//
// Depth L2: a stand-in built from the rule's pieces (the committed bounce table read on every branch) with a derived
// prediction that could have been wrong, a calibration and controls; the censuses and M3 are exact (L1).
// DETERMINISM: no random numbers; every start is placed. NOTHING MOVES: the cost is a phase, the contact a slot
// permutation, and the stream takes each value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loneBand } from '@/code/measure/moving-level'
import { hermitianEigen } from '@/code/measure/quantum-ladder'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
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
  meshLines,
} from '@/code/measure/full-key-paths'
import { parallelRun } from '@/code/measure/planon-lines'
import {
  levelState,
  oneBody,
  oneLevels,
  placedPacket,
  rootIndex,
  runCross,
  spectralPeak,
  type Amp,
  type CrossSpec,
} from '@/code/measure/crossing-lines'
import {
  contactAgreement,
  hubBoost,
  hubOrbit,
  hubProduct,
  lineDirection,
  lineSetGraph,
  oneVibeProfile,
  runHub,
  singlesCensus,
  twoSinglesCensus,
} from '@/code/measure/bounce-mover'

const TRIO = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
]
const RING = 28
const N = 7
const TAIL = 1e-3
const HOLD = 128
const READ = 64
const CONTROL_BEATS = 16
const SHORT = 32
const FLOOR = 1e-14
const K = Math.PI / 2
const SHARE = 0.1
const TOL = 0.05
const EXACT = 1e-6
const WINDING = 1e-8
const CAL = { ring: 256, width: 16, radius: 48 }
const KNIT = { side: 8, beats: 64 }
const S2 = Math.SQRT1_2
const DIRECTIONS: { name: string; n: number[] }[] = [
  { name: 'e1', n: [1, 0, 0, 0] },
  { name: 'e2', n: [0, 1, 0, 0] },
  { name: 'e3', n: [0, 0, 1, 0] },
  { name: 'e12', n: [S2, S2, 0, 0] },
  { name: 'e13', n: [S2, 0, S2, 0] },
  { name: 'e23', n: [0, S2, S2, 0] },
]

const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x))
const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, c) => s + x * b[c]!, 0)
const e2 = (x: number): string => x.toExponential(2)
const f4 = (x: number): string => x.toFixed(4)
const spinor = (k: number): [Amp, Amp] =>
  loneBand(k).vector.map(c => [c[0], c[1]] as Amp) as [Amp, Amp]
const product = (series: Amp[][]): Amp[] =>
  series[0]!.map((_, t) =>
    series.reduce<Amp>(
      (acc, s) => [
        acc[0] * s[t]![0] - acc[1] * s[t]![1],
        acc[0] * s[t]![1] + acc[1] * s[t]![0],
      ],
      [1, 0],
    ),
  )

// the inverse mass tensor on the husk axes from the six directional readings 2 dE / K^2, and its eigenvalues
function massTensor(inverse: readonly number[]): {
  tensor: number[][]
  eigen: number[]
} {
  const [a, b, c, ab, ac, bc] = inverse as [
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  const tensor = [
    [a, ab - (a + b) / 2, ac - (a + c) / 2],
    [ab - (a + b) / 2, b, bc - (b + c) / 2],
    [ac - (a + c) / 2, bc - (b + c) / 2, c],
  ]
  const re = Float64Array.from(tensor.flat())
  const eigen = hermitianEigen(3, re, new Float64Array(9))
    .values.slice()
    .sort((x, y) => x - y)

  return { tensor, eigen }
}

export default experiment({
  id: 'spin/bounce-mover',
  code: 'E-SPN-0118',
  title:
    "a composite held by bounce meetings changes lines but not place, fail (M2): K on two singles only keeps or swaps them (0 of 264 pairs change the line set, and 0 of 270,336 two-single docks move a single off its lines; the lines K changes there are recruited vacuum pairs), and K on three singles changes lines (576 of 1,760) only onto lines through the same dock, so a composite's lines change only at a hub where three of its lines meet and, for up to five lines, its hubs never move; in a stand-in of three loves on (1,1,0,0), (1,0,1,0), (0,1,1,0) through X, with the drift cost's string, the working coin and the committed bounce table, the equal sum over the 4 line triples K reaches is an exact level (fidelity 1 - 4e-8, tail 5.2e-5 over 128 beats) that holds 6 lines and passes 7.6 of its weight through line-changing meetings, yet boosted to pi/2 along six husk directions its energy moves -0.0011 against 0.077 to 0.115 predicted, the same offset as with a line-keeping contact, while the reading gives a free trio 0.4 percent from prediction; the inverse mass tensor is zero to resolution, so its isotropy is not measurable; the vacuum and a lone love run identically with and without K and the love keeps its line; with no string the tail reaches 0.33",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const lines = TRIO.map(r => LINE_OF[rootIndex(r)]!)
    const units = lines.map(lineDirection)

    // ---- censuses and the line-set graph ----
    const pairs = singlesCensus(2)
    const triples = singlesCensus(3)
    const twoFull = twoSinglesCensus()
    const graph = lineSetGraph(lines)
    const reached = [...new Set(graph.sets.flat())]

    const rank = (vectors: number[][]): number => {
      const rows = vectors.map(v => v.slice())

      let r = 0

      for (
        let c = 0;
        c < (rows[0]?.length ?? 0) && r < rows.length;
        c++
      ) {
        const p = rows.findIndex(
          (row, i) => i >= r && Math.abs(row[c]!) > 1e-9,
        )

        if (p < 0) {
          continue
        }

        ;[rows[r], rows[p]] = [rows[p]!, rows[r]!]

        for (let i = 0; i < rows.length; i++) {
          if (i === r) {
            continue
          }

          const f = rows[i]![c]! / rows[r]![c]!

          rows[i] = rows[i]!.map((x, k) => x - f * rows[r]![k]!)
        }

        r++
      }

      return r
    }

    const reachedRank4 = rank(reached.map(lineDirection))
    const reachedRankHusk = rank(
      reached.map(l => lineDirection(l).slice(0, 3)),
    )

    log('censuses')

    // ---- the one-vibe level and the trio ----
    const spec: CrossSpec = {
      L: RING,
      roots: [rootIndex([1, 1, 0, 0]), rootIndex([1, 0, 1, 0])],
      charges: [1],
      cost: true,
      contact: 'rule',
      anchor: -1,
    }
    const one = oneBody(spec, 0)
    const { levels, residual } = oneLevels(one, N)
    const level = levels
      .slice()
      .sort((a, b) => a.meanString - b.meanString)[0]!
    const { profile, mismatch } = oneVibeProfile(
      spec,
      levelState(one, level.vector),
    )
    const start = hubOrbit(profile, graph.sets, [1, 1, 1])
    const single = hubProduct(profile, lines, [1, 1, 1])
    const rule = { n: 3, cost: true, contact: 'rule' as const }
    const keep = { n: 3, cost: true, contact: 'keep' as const }
    // the contact is real: the product on one line triple is not a level under K
    const singleUnderK = runHub(rule, single, SHORT, N, FLOOR)

    // ---- M1 and the rest energy ----
    const held = runHub(rule, start, HOLD, N, FLOOR)
    const rest = spectralPeak(held.overlap.slice(0, READ + 1))
    const M1 = Math.max(...held.tail) <= TAIL

    log('M1')

    // ---- M2: six husk directions ----
    const predictionOf = (n: readonly number[]): number =>
      units.reduce(
        (a, u) =>
          a + loneBand((K * dot(n, u)) / 3).energy - loneBand(0).energy,
        0,
      )
    const band = DIRECTIONS.map(d => {
      const r = runHub(
        rule,
        hubBoost(
          start,
          3,
          d.n.map(x => x * K),
        ),
        READ,
        N,
        FLOOR,
      )
      const peak = spectralPeak(r.overlap)
      const dE = wrap(peak.energy - rest.energy)
      const pred = predictionOf(d.n)

      log(`M2 ${d.name}`)

      return {
        name: d.name,
        dE,
        pred,
        share: peak.share,
        inverse: (2 * dE) / (K * K),
        offHub: r.offHub,
        clash: r.clash,
        lineChange: r.lineChange,
        size: r.size,
      }
    })
    const moving = band.filter(
      b => Math.abs(b.dE) >= SHARE * Math.abs(b.pred),
    )
    const M2 = moving.length >= 2
    const mass = massTensor(band.map(b => b.inverse))
    const maxEigen = Math.max(...mass.eigen.map(Math.abs))
    const anisotropy =
      maxEigen === 0
        ? 0
        : (Math.max(...mass.eigen) - Math.min(...mass.eigen)) / maxEigen

    // ---- the calibration: three free vibes, the same reading ----
    const free: CrossSpec = {
      L: CAL.ring,
      roots: spec.roots,
      charges: [1],
      cost: false,
      contact: 'off',
      anchor: -1,
    }
    const freeRun = (k: number): Amp[] =>
      runCross(
        free,
        placedPacket(
          free,
          [0],
          CAL.radius,
          x => Math.exp(-(x * x) / (2 * CAL.width * CAL.width)),
          [k],
          [spinor(k)],
        ),
        READ,
        N,
        1e-24,
      ).overlap
    const freeRest = spectralPeak(
      product([freeRun(0), freeRun(0), freeRun(0)]),
    )
    const calibration = DIRECTIONS.map(d => {
      const series = units.map(u => freeRun((K * dot(d.n, u)) / 3))
      const dE = wrap(
        spectralPeak(product(series)).energy - freeRest.energy,
      )

      return { name: d.name, dE, pred: predictionOf(d.n) }
    })
    const calibrated = calibration.every(
      c => Math.abs(c.dE - c.pred) <= TOL * Math.abs(c.pred),
    )

    log('calibration')

    // ---- C1: the line-keeping contact ----
    const kept = runHub(keep, single, READ, N, FLOOR)
    const keptRest = spectralPeak(kept.overlap)
    const keptBand = DIRECTIONS.slice(0, 3).map(d => {
      const r = runHub(
        keep,
        hubBoost(
          single,
          3,
          d.n.map(x => x * K),
        ),
        READ,
        N,
        FLOOR,
      )
      const dE = wrap(spectralPeak(r.overlap).energy - keptRest.energy)

      return { name: d.name, dE, pred: predictionOf(d.n) }
    })
    const C1 = keptBand.every(
      b => Math.abs(b.dE) < SHARE * Math.abs(b.pred),
    )

    log('C1')

    // ---- C2: no string ----
    const loose = runHub(
      { ...rule, cost: false },
      single,
      CONTROL_BEATS,
      N,
      FLOOR,
    )
    const C2 = Math.max(...loose.tail) > TAIL

    log('C2')

    // ---- M3: the working knit ----
    const center = centerOf(KNIT.side)
    const fresh = (contact: CollisionKind) =>
      contactFresh(KNIT.side, contact, center)
    const lone = fresh('lone')
    const bounce = fresh('bounce')
    const pass = fresh('pass')
    const key = fullPathKey(0)
    const vacuum = wordVacuum(lone, lone.store)
    const vacuumBounce = wordVacuum(bounce, bounce.store)
    const sameVacuum =
      vacuum.vibe.every((v, i) => v === vacuumBounce.vibe[i]) &&
      vacuum.store.every((v, i) => v === vacuumBounce.store[i])
    const vacuumAgree = contactAgreement(
      lone.tables,
      bounce.tables,
      vacuum,
      key,
      THRESHOLD_BORN,
      KNIT.beats,
    )
    const slot = LINE_FIRSTS[0]!

    // a lone love on the center's line 0: the dock line cleared (both slots and its store), then the love placed
    const loneLove = (v: Configuration): Configuration => {
      const s = cloneConfiguration(v)

      for (const d of [slot, OPPOSITE[slot]!]) {
        s.vibe[center * 24 + d] = 0
        s.open[center * 24 + d] = 0
      }

      s.store[center * 12 + 0] = 0
      s.sopen[center * 12 + 0] = 0
      s.vibe[center * 24 + slot] = 1
      s.open[center * 24 + slot] = 1

      return s
    }

    const loveAgree = contactAgreement(
      lone.tables,
      bounce.tables,
      loneLove(vacuum),
      key,
      THRESHOLD_BORN,
      KNIT.beats,
    )
    const confined = [lone, pass].map(f => {
      const ml = meshLines(f.tables)
      const v = wordVacuum(f, f.store)
      const s = loneLove(v)

      return parallelRun({
        tables: f.tables,
        vacuum: v,
        start: s,
        lines: ml,
        set: [ml.lineOf[center * 24 + slot]!],
        key,
        threshold: THRESHOLD_BORN,
        beats: KNIT.beats,
        steps: boxSteps(f.cells, KNIT.side, center),
        factor: false,
      })
    })
    const M3 =
      sameVacuum &&
      vacuumAgree.differ === 0 &&
      loveAgree.differ === 0 &&
      confined.every(r => r.off === 0 && r.vacuumSingles === 0)

    log('M3')

    // ---- checks ----
    const runs = [held, kept, loose, singleUnderK]
    const hubHolds =
      runs.every(r => r.offHub === 0 && r.clash === 0) &&
      band.every(b => b.offHub === 0 && b.clash === 0)
    const checks = {
      pairs: pairs.change === 0 && pairs.clash === 0,
      triples: triples.change > 0 && triples.clash === 0,
      singlesStay: twoFull.singlesLeft === 0,
      winding: mismatch < WINDING && residual < 1e-8,
      hub: hubHolds,
      exact: Math.min(...kept.fidelity) >= 1 - EXACT,
      orbitExact: Math.min(...held.fidelity) >= 1 - EXACT,
    }
    const checked = Object.values(checks).every(Boolean)
    const status =
      !checked || !calibrated || !C1 || !C2
        ? 'partial'
        : M1 && M2 && M3
          ? 'pass'
          : 'fail'

    const metrics: Record<string, number> = {
      M1: M1 ? 1 : 0,
      M2: M2 ? 1 : 0,
      M3: M3 ? 1 : 0,
      control_C1: C1 ? 1 : 0,
      control_C2: C2 ? 1 : 0,
      calibrated: calibrated ? 1 : 0,
      pairKeep: pairs.keep,
      pairChange: pairs.change,
      pairIdentity: pairs.identity,
      tripleKeep: triples.keep,
      tripleChange: triples.change,
      tripleIdentity: triples.identity,
      twoSingleDocks: twoFull.docks,
      twoSingleSinglesLeft: twoFull.singlesLeft,
      twoSingleFullMoved: twoFull.fullMoved,
      lineTriplesReached: graph.sets.length,
      linesReached: reached.length,
      reachedRank4,
      reachedRankHusk,
      oneLevelEnergy: level.energy,
      oneLevelMeanString: level.meanString,
      windingWeight: mismatch,
      startSize: start.size,
      heldMaxTail: Math.max(...held.tail),
      heldLeastFidelity: Math.min(...held.fidelity),
      heldLineChange: held.lineChange,
      heldLinesSeen: held.lines.size,
      heldSize: held.size,
      heldDropped: held.dropped,
      heldEscaped: held.escaped,
      restEnergy: rest.energy,
      restShare: rest.share,
      movingDirections: moving.length,
      inverseEigenMin: Math.min(...mass.eigen),
      inverseEigenMid: mass.eigen[1]!,
      inverseEigenMax: Math.max(...mass.eigen),
      anisotropy,
      keptLeastFidelity: Math.min(...kept.fidelity),
      singleUnderKLeastFidelity: Math.min(...singleUnderK.fidelity),
      singleUnderKLineChange: singleUnderK.lineChange,
      looseMaxTail: Math.max(...loose.tail),
      vacuumDiffer: vacuumAgree.differ,
      loveDiffer: loveAgree.differ,
      loneOff: confined[0]!.off,
      passOff: confined[1]!.off,
      vacuumSingles: confined.reduce((a, r) => a + r.vacuumSingles, 0),
      seconds: (Date.now() - started) / 1000,
    }

    band.forEach(b => {
      metrics[`${b.name}_dE`] = b.dE
      metrics[`${b.name}_predicted`] = b.pred
      metrics[`${b.name}_share`] = b.share
      metrics[`${b.name}_inverseMass`] = b.inverse
    })
    calibration.forEach(c => (metrics[`free_${c.name}_dE`] = c.dE))
    keptBand.forEach(b => (metrics[`keep_${b.name}_dE`] = b.dE))
    mass.tensor.forEach((row, i) =>
      row.forEach((x, j) => (metrics[`inverseMass_${i}${j}`] = x)),
    )

    return verdict({
      status,
      claim: `three loves on lines (1,1,0,0), (1,0,1,0), (0,1,1,0) through a hub X, held by the drift cost's string and meeting through the committed bounce K: K changes their lines (${f4(held.lineChange)} of the weight passes through a line-changing meeting over ${HOLD} beats, ${held.lines.size} lines held, ${graph.sets.length} line triples reachable, rank ${reachedRankHusk} on the husk) but every meeting is at X; held with tail at most ${e2(Math.max(...held.tail))} (M1 ${M1}); boosted to K = pi/2 along six husk directions dE = ${band.map(b => `${b.name} ${f4(b.dE)} (${f4(b.pred)})`).join(', ')} (M2 ${M2}, ${moving.length} of 6 moving); inverse mass eigenvalues ${mass.eigen.map(e2).join(', ')}; the vacuum and a lone love run identically with and without K and the love stays on its line (M3 ${M3}); line-keeping contact dE ${keptBand.map(b => f4(b.dE)).join(', ')}, no string tail ${e2(Math.max(...loose.tail))}; free trio reading ${calibration.map(c => `${f4(c.dE)} (${f4(c.pred)})`).join(', ')}`,
      metrics,
      control: {
        keepMaxAbsDE: Math.max(...keptBand.map(b => Math.abs(b.dE))),
        looseMaxTail: Math.max(...loose.tail),
      },
      notes: `L2. M1 ${M1}, M2 ${M2}, M3 ${M3}; C1 ${C1}, C2 ${C2}; calibrated ${calibrated}; checks ${JSON.stringify(checks)}. Pair census keep ${pairs.keep} change ${pairs.change} identity ${pairs.identity}; triple census keep ${triples.keep} change ${triples.change} identity ${triples.identity}; two singles with full lines: ${twoFull.docks} docks, singles off their lines ${twoFull.singlesLeft}, a full line moved on ${twoFull.fullMoved}. Line triples reached ${JSON.stringify(graph.sets)} (${graph.edges} changing edges), lines ${reached.length}, rank 4d ${reachedRank4}, husk ${reachedRankHusk}. One-vibe level E ${level.energy} mean string ${f4(level.meanString)} residual ${e2(residual)}, winding ${e2(mismatch)}; start ${start.size} configurations. Held: least fidelity ${f4(Math.min(...held.fidelity))}, size ${held.size}, dropped ${e2(held.dropped)}, escaped ${e2(held.escaped)}, rest E ${rest.energy} share ${f4(rest.share)}. Band: ${band.map(b => `${b.name} dE ${b.dE} pred ${f4(b.pred)} share ${f4(b.share)} 1/m ${e2(b.inverse)} lineChange ${f4(b.lineChange)} size ${b.size}`).join('; ')}. Inverse mass tensor ${JSON.stringify(mass.tensor.map(r => r.map(e2)))}, anisotropy ${f4(anisotropy)}. Keep: rest ${keptRest.energy}, least fidelity ${Math.min(...kept.fidelity)}. Knit M3: same vacuum ${sameVacuum}, vacuum lone/bounce differ ${vacuumAgree.differ} (first ${vacuumAgree.first}), lone love differ ${loveAgree.differ} (first ${loveAgree.first}), off its line on lone ${confined[0]?.off} and pass ${confined[1]?.off}, reach ${confined.map(r => r.reach).join(', ')} box steps, vacuum singles ${metrics.vacuumSingles}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
