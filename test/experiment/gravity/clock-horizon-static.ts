// The clock horizon, static (E-GRV-0111): the torn husk of E-GRV-0108 with its horizon joined by a bound on the CLOCK
// instead of the FIELD (code/rule/clock-horizon; its header gives the criterion, the reference and the derivations). A
// husk dock joins when the depth found by summing steps exceeds that of a reference dock by the metric register's cap:
// its clock can run no slower, and its links tear as in E-GRV-0108 (the tear, the stored bit, the vertical routing are
// E-GRV-0108's, unchanged).
//
// WHY (note/project/vibe/roadmap/research/discrete-gravity.md, "Why sqrt(M), and the fix: bound the clock, not the field"). The
// line criterion bounds the step, so its horizon's edge is where M over an area reaches the window: r ~ sqrt(M), E-GRV-
// 0108's slope 0.54. General relativity's horizon is where the POTENTIAL reaches a fixed value (a static clock stops),
// so r ~ M: Schwarzschild.
//
// DERIVED BEFORE THE RUN (the constants: stackModes of the 3-layer warped stack, zero-mode weight 0.0889 of the husk's
// 1/6, so a unit's far depth is k / r with k = 0.0889 / (4 pi) = 7.07e-3; near the husk's 1/(24 pi) = 1.33e-2):
//  - THE RADIUS, reference at infinity: M G(r_h) = CAP, so r_h = k M / CAP where G is 1/r: linear in M. With CAP = 3/2
//    and the zero mode's k, r_h = 4.72e-3 M (7.5 docks at M = 1600); the stack's G at 3 .. 6 docks is 1.10 .. 1.22
//    times the zero mode's (its massive modes), and falls faster than 1/r there, so the infinite stack's radius is
//    3.5 .. 8.4 docks for M = 600 .. 1600 at a log slope of about 0.85 (stackDepthRadius; REPORTED).
//  - THE STEP AT THE EDGE: on an axis link 2 k M / r_h^2 = 2 CAP / r_h = 3 / r_h, 0.5 at r_h = 6 and falling as 1 / M:
//    the edge is far inside the trit window, where the line criterion put it at the window's edge by construction.
//  - THE CAP, 3/2 whole steps of depth (the metric register's bound D_0 + 3/2, fixed by the rule for every lump), is
//    chosen so the M = 1600 horizon (6.0 docks on the box's statics) stays inside the 9 docks where the sinks begin.
//  - THE BOX. A finite closed box has no infinity: the excess is read against dock 0 (the husk corner, the dock
//    farthest from the lump, the root the depth is summed from), so the criterion is M (G(r_h) - G(r_ref)) = CAP less the
//    sinks' share, and the radius bends from r ~ M as r_h approaches r_ref. On this side-24 box the free statics'
//    radius (tmp/clock-probe2) is 3.16, 3.74, 5.10, 6.00 for the compressed M = 600 .. 1600, slope 0.67: THE BOX IS
//    EXPECTED TO FAIL C1. That is stated here before the run, and the gate is kept at 1 as posed.
//  - THE SINKS are spread (code/measure/clock-horizon spreadSinks: one unit on each of M husk docks taken evenly from
//    the docks 9 or more from the lump, dock 0 excluded), not E-GRV-0108's cluster at the corner: that cluster sits on
//    the reference and its own well is read as excess (1.53 of the M = 1600 lump's 6.64, tmp/clock-probe1).
//
// THE START IS PLACED, and why. Run from rest (every unit placed before beat 1, as E-GRV-0108 runs), a lump's steps
// reach the trit window within 5 beats, long before its depth builds (a step is one beat of two rates; the depth is
// their sum over the box, and it overshoots): the M = 600 and 1600 lumps wrap 104 and 32 times and their horizons run
// away to 10.2 and 13.6 docks as the overshoot passes (tmp/clock-probe3). A clock horizon is the horizon of a SETTLED
// lump. So each lump starts from its statics: the criterion read on the linear solve (code/measure/clock-horizon
// clockStatics: the free statics' excess, then the torn statics read again until no dock joins, a second method), the
// torn statics written into the registers (placeStatics: the depth to the nearest register unit, steps its gradient,
// torn links 0, rates and remainders 0), and the rule then run with the criterion read by the rule on its own found
// depth after EVERY beat. So C1 is the criterion's law on the statics, which the rule then holds; the rule forming a
// horizon itself is E-GRV-0112.
//
// DISCLOSED PROBES (instrument only, before this file; tmp/clock-probe1 .. 4): the free statics' excess profiles and
// radii for caps 1 .. 4 with the corner sinks (probe 1) and the spread sinks (probe 2); the from-rest runs (probe 3);
// the growth orders (probe 4). The lumps and the cap were chosen from probe 2: at CAP = 3/2 the compressed M >= 600 and
// the 4-a-dock spread M >= 600 leave no content outside their horizons.
//
// THE LUMPS, side 24, center (12, 12, 12), sinks spread from 9: COMPRESSED, E-GRV-0090's densest lumps
// (code/measure/step-depth compressLump, capacity 1) M = 600, 800, 1200, 1600, line saturated in the core; SPREAD, 4
// units a dock on the nearest docks (clock-horizon spreadLump, lines placed on the husk by placeOpenLines) M = 600,
// 800, 1200, not line saturated, so the field criterion should not fire on them. (The file was first written with
// spread M = 800, 1200, 1600, and that run stopped in setup before any gate was read: 1600 unit lines cannot leave a
// 4-a-dock ball of radius 4.58 on the husk, whose surface has about 4 pi r^2 sigma = 1,515 links. The spread family was
// moved to 600, 800, 1200, whose horizons probe 2 put outside their matter.)
//
// GATES, fixed before the first run of this file. D 16, three digits, bulk window 81, the warped shrinking stack of 3
// layers, CAP 3/2, the reference dock 0. Each lump run 1024 beats from its placed statics, the Hann average, then back.
//  C1 the horizon's radius (its farthest dock from the center, after the run) against M: the log-log slope within 0.15
//     of 1 for each family, compressed and spread. CONTROL K1: the field criterion (E-GRV-0108's horizonOf on the same
//     lumps' lines) gives a compressed slope more than 0.15 from 1, and no horizon dock at all on any spread lump.
//  C2 exact, on every lump: Gauss 0 off on every dock after every beat; 0 wraps; curl 0 on every check (every 64 beats
//     and the last) over every live link, the verticals included; every remainder in its window; the energy kept,
//     |E(t) - E(last join)| <= 1e-4 of the torn statics' |E_static| at every check and at every join; the run (with any
//     docks the rule joined) reversed bit for bit, the horizon's bits included.
//  C3 the far field: (a) the rule reads its statics: the Hann average's husk force along the axes equals the torn linear
//     solve's (held steps as sources) within 1e-3 at every r = 7 .. 11, on every lump; (b) Gauss counts the whole
//     content: each family's largest lump carried onto a side-96 stack of 5 layers with its horizon (linear
//     solves, the M farthest docks as sinks, E-GRV-0108's), the force torn over free within 1 percent at every
//     r = 24 .. 40 and closer to 1 at 40 than at 24.
// REPORTED: the docks the rule joined after placement; the step at the edge against 3 / r_h; the infinite stack's radius
// (stackDepthRadius) and its slope; the SAME criterion read on the statics of a side-96 stack of 5 layers (sinks spread
// from 9, reference its dock 0, 83 docks away), whose slope says how much of C1's shortfall is the box.
// Verdict: pass if C1 to C3 hold with K1; partial if K1 fails; fail otherwise.
//
// FIRST RUN (tmp/clock-static-run2.log, 187 s, the record; run 1 stopped in setup, above; run under the provisional
// code E-GRV-0110, renumbered 0111 before registration because another experiment took 0110): fail on C1, as stated before
// the run; no gate moved. C1: the horizon's radius 3.16, 3.74, 5.10, 5.83 for the compressed M = 600 .. 1600 (slope
// 0.644) and 3.16, 3.61, 4.69 for the spread M = 600 .. 1200 (slope 0.574), both more than 0.15 from 1. K1 holds: the
// field criterion's slope on the same compressed lumps is 0.467, and it finds 0 docks on every spread lump, where the
// clock criterion finds 127, 200, 461. WHERE THE SHORTFALL COMES FROM (reported): the same criterion on a side-96 stack's
// statics gives slopes 0.760 and 0.727, and on the infinite stack (reference at infinity) 0.877 and 0.866, radius 3.38 ..
// 7.98. So about half the gap to 1 is the box (a reference 21 docks away) and the rest is the stack's massive modes,
// which make the depth fall faster than 1/r at 3 .. 8 docks: r ~ M holds only where the depth is the zero mode's 1/r,
// past about 1 / 0.141 = 7 docks, which needs a bigger lump in a bigger box than this run. The clock bound does move the
// law from the field criterion's 0.47 toward 1 on the same lumps. C2 holds on every lump: 1024 beats, 0 wraps, Gauss 0
// off, curl 0 on about 2.4 to 2.5 million live link checks each (252,288 vertical), every remainder in its window,
// energy drift 2e-12 to 1.1e-11 of the statics, reversal bit for bit; the rule's own read joined 0 docks at placement
// and 0 over the run, so the placed horizon is the rule's fixed point. The husk's largest step 0.35 .. 0.44 on the
// compressed lumps (the edge step, against the derived 3 / r_h = 0.51 .. 0.95, so the derivation is an upper bound
// here) and 0.86 on spread M = 600, whose horizon (3.16) stops inside its matter (lump radius 3.32, 4 units a dock left
// outside); the verticals 18.0 compressed, 4.0 to 4.5 spread. C3 holds: the rule's husk force equals its statics to
// 3.3e-9 at r = 7 .. 11; on side 96 the torn over the free force is 0.9909 .. 0.9970 (compressed 1600) and 0.9928 ..
// 0.9978 (spread 1200) at r = 24 .. 40, rising with r. While it ran, the held steps of a dock the rule joins were
// changed to be read from the final state rather than the Hann mean (they are equal for a held link); no dock joined, so
// no number of this run depends on it. Title written after the run.
//
// Depth L1 for C1 (the criterion's radius law read on linear statics, a derivation checked), L2 for C2 and C3 (a known
// construction held exactly by an integer reversible rule on bounded registers, the tear and the cap added by hand).
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { linearFit } from '@/code/measure/regression'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import {
  emptyOpen,
  HUSK_LATERAL,
  huskOnly,
  openMesh,
  placeOpenLines,
  warpClock,
  type OpenMesh,
} from '@/code/rule/open-husk'
import {
  horizonOf,
  horizonRule,
  tornLink,
} from '@/code/rule/horizon-husk'
import {
  clockHorizonRule,
  clockJoin,
  foundExcess,
  type ClockHorizonRule,
} from '@/code/rule/clock-horizon'
import { compressLump } from '@/code/measure/step-depth'
import {
  greenSolve,
  huskDistance,
  stackModes,
} from '@/code/measure/open-husk'
import {
  horizonStaticRun,
  newHorizonRecord,
  realHorizonDepth,
  tornMesh,
  type HorizonRecord,
} from '@/code/measure/horizon-husk'
import {
  axisForce,
  axisMean,
  carryLump,
  clockStatics,
  placeStatics,
  spreadLump,
  spreadSinks,
  stackDepthRadius,
} from '@/code/measure/clock-horizon'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const SIDE = 24
const LAYERS = 3
const CAP = 1.5
const BEATS = 1024
const SINKS_FROM = 9
const PER = 4
const COMPRESSED: readonly number[] = [600, 800, 1200, 1600]
const SPREAD: readonly number[] = [600, 800, 1200]
const SLOPE_TOLERANCE = 0.15
const ENERGY_TOLERANCE = 1e-4
const STATIC_TOLERANCE = 1e-3
const STATIC_R: readonly number[] = [7, 8, 9, 10, 11]
const BIG = 96
const BIG_LAYERS = 5
const FAR_R: readonly number[] = [24, 26, 28, 30, 32, 34, 36, 38, 40]
const FAR_TOLERANCE = 0.01
const CENTER = [12, 12, 12]

type Family = 'compressed' | 'spread'

type Lump = {
  family: Family
  m: number
  rho: Int32Array
  record: HorizonRecord
  placedHorizon: number
  horizonDocks: number
  horizonRadius: number
  lumpRadius: number
  contentOutside: number
  staticsRounds: number
  placementJoins: number
  ruleJoins: number
  edgeStep: number
  placedLargest: number
  fieldDocks: number
  fieldRadius: number
  energyStatic: number
  ruleVsSolve: number
  horizon: Uint8Array
  held: Float64Array
}

function buildLump(
  mesh: OpenMesh,
  family: Family,
  m: number,
): { rho: Int32Array; line: Int8Array } {
  const sinks = spreadSinks(mesh, CENTER, m, SINKS_FROM)
  const rho = new Int32Array(mesh.docks)
  const line = new Int8Array(mesh.links)

  if (family === 'compressed') {
    const lump = compressLump(
      radionMesh([SIDE, SIDE, SIDE]),
      CENTER,
      m,
      1,
      sinks,
    )

    rho.set(lump.content)
    line.set(lump.line)
  } else {
    rho.set(spreadLump(mesh, CENTER, m, PER, sinks))
    line.set(placeOpenLines(mesh, rho, 1, huskOnly(mesh)))
  }

  return { rho, line }
}

function runLump(
  mesh: OpenMesh,
  rule: ClockHorizonRule,
  family: Family,
  m: number,
): Lump {
  const { rho, line } = buildLump(mesh, family, m)
  const statics = clockStatics(mesh, rule, rho)
  const s = emptyOpen(mesh)

  s.line.set(line)

  const placed = placeStatics(
    mesh,
    rule,
    s,
    statics.torn,
    statics.horizon,
  )
  // the rule's own read at placement: docks off the solve's horizon whose found excess reaches the cap
  const excess = foundExcess(mesh, rule, s.step, statics.horizon)

  let placementJoins = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (
      !statics.horizon[y] &&
      y !== rule.reference &&
      excess[y]! >= rule.capTwice
    ) {
      placementJoins++
    }
  }

  const record = newHorizonRecord()
  const run = horizonStaticRun(
    mesh,
    rule,
    rho,
    line,
    BEATS,
    record,
    64,
    false,
    {
      state: s,
      horizon: statics.horizon,
      afterBeat: (st, h) => clockJoin(mesh, rule, st, h),
    },
  )
  const horizon = run.horizon
  // the held steps (0 unless the rule joined docks during the run: then the value each torn link held) as sources
  const held = new Float64Array(mesh.docks)

  for (let l = 0; l < mesh.links; l++) {
    if (
      !tornLink(mesh, horizon, l) ||
      statics.horizon[mesh.tail[l]!] ||
      statics.horizon[mesh.head[l]!]
    ) {
      continue
    }

    // a link torn during the run holds the value it had at its join, which is its value at the end
    const v = run.finalStep[l]! / rule.unit

    held[mesh.tail[l]!] = held[mesh.tail[l]!]! - v
    held[mesh.head[l]!] = held[mesh.head[l]!]! + v
  }

  const source = Float64Array.from(rho, (v, y) => v + held[y]!)
  const torn = greenSolve(tornMesh(mesh, horizon), source, 1e-12)
  const depth = realHorizonDepth(mesh, run.mean, horizon)

  let horizonDocks = 0
  let horizonRadius = 0
  let lumpRadius = 0
  let contentOutside = 0
  let placedHorizon = 0
  let edgeStep = 0
  let rhoX = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (rho[y]! > 0) {
      lumpRadius = Math.max(lumpRadius, huskDistance(mesh, y, CENTER))
    }

    if (statics.horizon[y]) {
      placedHorizon++
    }

    if (horizon[y]) {
      horizonDocks++
      horizonRadius = Math.max(
        horizonRadius,
        huskDistance(mesh, y, CENTER),
      )
    } else if (rho[y]! > 0) {
      contentOutside = Math.max(contentOutside, rho[y]!)
    }
  }

  for (let l = 0; l < mesh.links; l++) {
    if (mesh.kind[l] === HUSK_LATERAL && !tornLink(mesh, horizon, l)) {
      edgeStep = Math.max(edgeStep, Math.abs(run.mean[l]!))
    }
  }

  for (let y = 0; y < mesh.docks; y++) {
    if (source[y] !== 0) {
      rhoX += source[y]! * torn.x[y]!
    }
  }

  const field = horizonOf(mesh, line)

  let fieldDocks = 0
  let fieldRadius = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (field[y]) {
      fieldDocks++
      fieldRadius = Math.max(fieldRadius, huskDistance(mesh, y, CENTER))
    }
  }

  return {
    family,
    m,
    rho,
    record,
    placedHorizon,
    horizonDocks,
    horizonRadius,
    lumpRadius,
    contentOutside,
    staticsRounds: statics.rounds,
    placementJoins,
    ruleJoins: run.joins,
    edgeStep,
    placedLargest: placed.largest,
    fieldDocks,
    fieldRadius,
    energyStatic: (-(Math.PI / DEPTH) * rhoX) / 2,
    ruleVsSolve: Math.max(
      ...STATIC_R.map(r =>
        Math.abs(
          axisForce(mesh, depth, CENTER, r) /
            axisForce(mesh, torn.x, CENTER, r) -
            1,
        ),
      ),
    ),
    horizon,
    held,
  }
}

const slopeOf = (
  ms: readonly number[],
  rs: readonly number[],
): number =>
  linearFit({ xs: ms.map(Math.log), ys: rs.map(Math.log) }).slope

export default experiment({
  id: 'gravity/clock-horizon-static',
  code: 'E-GRV-0111',
  title:
    "joining the horizon where a husk dock's found depth exceeds the reference's by the metric register's cap (the clock stops) moves the radius law from the field criterion's M^0.47 to M^0.64 on the same lumps, but not to Schwarzschild's M, fail on C1: radius 3.16 .. 5.83 for compressed M = 600 .. 1600 (slope 0.644) and 3.16 .. 4.69 for spread lumps the line criterion never tears (slope 0.574), because on this side-24 box the depth is read against a dock 21 away and the stack's massive modes make it fall faster than 1/r (the same criterion reads 0.76 on a side-96 stack and 0.88 on the infinite one); every placed lump runs 1024 beats with 0 wraps, curl 0, energy to 1e-11 and exact reversal, the rule joins no dock the statics did not, the husk's step at the edge is 0.35 .. 0.44, and the far pull is the untorn lump's to 0.9 percent at r = 24 .. 40",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const rule = clockHorizonRule(
      horizonRule(stepRule(DEPTH, LEVELS), BULK),
      CAP,
    )
    const lumps: Lump[] = []

    for (const m of COMPRESSED) {
      lumps.push(runLump(mesh, rule, 'compressed', m))
      log(`compressed ${m}`)
    }

    for (const m of SPREAD) {
      lumps.push(runLump(mesh, rule, 'spread', m))
      log(`spread ${m}`)
    }

    const family = (f: Family): Lump[] =>
      lumps.filter(l => l.family === f)

    // C1 and K1
    const slopeCompressed = slopeOf(
      COMPRESSED,
      family('compressed').map(l => l.horizonRadius),
    )
    const slopeSpread = slopeOf(
      SPREAD,
      family('spread').map(l => l.horizonRadius),
    )
    const c1 =
      Math.abs(slopeCompressed - 1) <= SLOPE_TOLERANCE &&
      Math.abs(slopeSpread - 1) <= SLOPE_TOLERANCE
    const fieldSlope = family('compressed').every(
      l => l.fieldRadius > 0,
    )
      ? slopeOf(
          COMPRESSED,
          family('compressed').map(l => l.fieldRadius),
        )
      : NaN
    const k1 =
      Math.abs(fieldSlope - 1) > SLOPE_TOLERANCE &&
      family('spread').every(l => l.fieldDocks === 0)

    // C2
    const wrapsOf = (r: HorizonRecord): number =>
      r.wraps.fWraps + r.wraps.vWraps
    const exact = (l: Lump): boolean =>
      l.record.gaussOff === 0 &&
      wrapsOf(l.record) === 0 &&
      l.record.curl === 0 &&
      l.record.verticalChecked > 0 &&
      l.record.restOff === 0 &&
      l.record.energyDrift <=
        ENERGY_TOLERANCE * Math.abs(l.energyStatic) &&
      l.record.reversed
    const c2 = lumps.every(exact)

    // C3 (b): the M = 1600 lumps on a side-96 stack
    const big = warpClock(openMesh(BIG, BIG_LAYERS, 'shrink'))
    const far = (['compressed', 'spread'] as const).map(f => {
      // each family's largest lump
      const l = family(f)[family(f).length - 1]!
      const source = Float64Array.from(
        { length: mesh.huskDocks },
        (_, y) => Math.max(l.rho[y]!, 0) + l.held[y]!,
      )
      const carried = carryLump(
        mesh,
        big,
        source,
        l.horizon,
        CENTER,
        l.m,
        'far',
      )
      const free = greenSolve(big, carried.rho, 1e-10)
      const torn = greenSolve(
        tornMesh(big, carried.horizon),
        carried.rho,
        1e-10,
      )
      const fitR = Array.from({ length: 17 }, (_, i) => 24 + i)
      const k = (x: Float64Array): number =>
        fitPowers(
          fitR,
          fitR.map(r => axisMean(big, x, carried.center, r)),
          [1, 2],
        )[1]!

      log(`far ${f}`)

      return {
        family: f,
        m: l.m,
        ratio: FAR_R.map(
          r =>
            axisForce(big, torn.x, carried.center, r) /
            axisForce(big, free.x, carried.center, r),
        ),
        kFree: k(free.x),
        kTorn: k(torn.x),
      }
    })
    const ruleVsSolve = Math.max(...lumps.map(l => l.ruleVsSolve))
    const farOff = Math.max(
      ...far.map(f => Math.max(...f.ratio.map(v => Math.abs(v - 1)))),
    )
    const converging = far.every(
      f =>
        Math.abs(f.ratio[f.ratio.length - 1]! - 1) <
        Math.abs(f.ratio[0]! - 1),
    )
    const c3 =
      ruleVsSolve <= STATIC_TOLERANCE &&
      farOff <= FAR_TOLERANCE &&
      converging

    // REPORTED: the infinite stack's radius, and the same criterion read on the statics of a side-96 stack
    const modes = stackModes(mesh.sides, 'clock')
    const infinite = (ms: readonly number[]): number[] =>
      ms.map(m => stackDepthRadius(modes, m, CAP))
    const infiniteCompressed = infinite(COMPRESSED)
    const infiniteSpread = infinite(SPREAD)
    const bigRule = clockHorizonRule(
      horizonRule(stepRule(DEPTH, LEVELS), BULK),
      CAP,
    )
    const bigRadius = lumps.map(l => {
      const source = Float64Array.from(
        { length: mesh.huskDocks },
        (_, y) => Math.max(l.rho[y]!, 0),
      )
      const carried = carryLump(
        mesh,
        big,
        source,
        new Uint8Array(mesh.huskDocks),
        CENTER,
        l.m,
        'spread',
        SINKS_FROM,
      )
      const statics = clockStatics(big, bigRule, carried.rho, 1e-10)

      let r = 0

      for (let y = 0; y < big.huskDocks; y++) {
        if (statics.horizon[y]) {
          r = Math.max(r, huskDistance(big, y, carried.center))
        }
      }

      log(`big statics ${l.family} ${l.m}`)

      return r
    })
    const bigSlopeCompressed = slopeOf(
      COMPRESSED,
      bigRadius.slice(0, COMPRESSED.length),
    )
    const bigSlopeSpread = slopeOf(
      SPREAD,
      bigRadius.slice(COMPRESSED.length),
    )

    const status = !k1 ? 'partial' : c1 && c2 && c3 ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const metrics: Record<string, number> = {
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      gate_C3: c3 ? 1 : 0,
      control_K1: k1 ? 1 : 0,
      cap: CAP,
      side: SIDE,
      layers: LAYERS,
      bulkWindow: BULK,
      slopeCompressed,
      slopeSpread,
      fieldSlope,
      ruleVsSolve,
      farOff,
      bigSlopeCompressed,
      bigSlopeSpread,
      infiniteSlopeCompressed: slopeOf(COMPRESSED, infiniteCompressed),
      infiniteSlopeSpread: slopeOf(SPREAD, infiniteSpread),
      seconds: (Date.now() - started) / 1000,
    }

    lumps.forEach((l, i) => {
      const p = `${l.family}${l.m}_`

      metrics[`${p}wraps`] = wrapsOf(l.record)
      metrics[`${p}gaussOff`] = l.record.gaussOff
      metrics[`${p}curl`] = l.record.curl
      metrics[`${p}liveChecked`] = l.record.liveChecked
      metrics[`${p}verticalChecked`] = l.record.verticalChecked
      metrics[`${p}restOff`] = l.record.restOff
      metrics[`${p}reversed`] = l.record.reversed ? 1 : 0
      metrics[`${p}energyDrift`] = l.record.energyDrift
      metrics[`${p}energyStatic`] = l.energyStatic
      metrics[`${p}huskStep`] = l.record.huskStep
      metrics[`${p}verticalStep`] = l.record.verticalStep
      l.record.bulkStep.forEach(
        (v, k) => (metrics[`${p}bulkStep_layer${k}`] = v),
      )
      metrics[`${p}horizonDocks`] = l.horizonDocks
      metrics[`${p}horizonRadius`] = l.horizonRadius
      metrics[`${p}placedHorizonDocks`] = l.placedHorizon
      metrics[`${p}staticsRounds`] = l.staticsRounds
      metrics[`${p}placementJoins`] = l.placementJoins
      metrics[`${p}ruleJoins`] = l.ruleJoins
      metrics[`${p}lumpRadius`] = l.lumpRadius
      metrics[`${p}contentOutside`] = l.contentOutside
      metrics[`${p}edgeStep`] = l.edgeStep
      metrics[`${p}edgeStepDerived`] = (2 * CAP) / l.horizonRadius
      metrics[`${p}placedLargest`] = l.placedLargest
      metrics[`${p}fieldDocks`] = l.fieldDocks
      metrics[`${p}fieldRadius`] = l.fieldRadius
      metrics[`${p}ruleVsSolve`] = l.ruleVsSolve
      metrics[`${p}bigRadius`] = bigRadius[i]!
      metrics[`${p}infiniteRadius`] =
        l.family === 'compressed'
          ? infiniteCompressed[COMPRESSED.indexOf(l.m)]!
          : infiniteSpread[SPREAD.indexOf(l.m)]!
    })

    far.forEach(fr => {
      FAR_R.forEach(
        (r, j) =>
          (metrics[`${fr.family}${fr.m}_farRatio_r${r}`] =
            fr.ratio[j]!),
      )
      metrics[`${fr.family}${fr.m}_kFree`] = fr.kFree
      metrics[`${fr.family}${fr.m}_kTorn`] = fr.kTorn
    })

    const radiiOf = (fam: Family): string =>
      family(fam)
        .map(l => f(l.horizonRadius))
        .join(', ')

    return verdict({
      status,
      claim: `a husk dock joining the horizon where its found depth exceeds dock 0's by the metric register's cap ${CAP} (side ${SIDE}, the warped shrinking stack of ${LAYERS} layers, sinks spread from ${SINKS_FROM}), each lump placed at its statics: the horizon's radius ${radiiOf('compressed')} for the compressed M = ${COMPRESSED.join(', ')} (slope ${f(slopeCompressed)}) and ${radiiOf('spread')} for the spread M = ${SPREAD.join(', ')} (slope ${f(slopeSpread)}), against the field criterion's slope ${f(fieldSlope)} on the same compressed lumps and ${family(
        'spread',
      )
        .map(l => l.fieldDocks)
        .join(
          ', ',
        )} docks on the spread ones; the same criterion on a side-${BIG} stack's statics gives slopes ${f(bigSlopeCompressed)} and ${f(bigSlopeSpread)}, the infinite stack's ${f(metrics.infiniteSlopeCompressed!)} and ${f(metrics.infiniteSlopeSpread!)}; ${BEATS} beats with ${lumps.map(l => wrapsOf(l.record)).join(', ')} wraps, Gauss off ${lumps.map(l => l.record.gaussOff).join(', ')}, curl ${lumps.map(l => l.record.curl).join(', ')}, energy drift ${lumps.map(l => e(l.record.energyDrift / Math.abs(l.energyStatic))).join(', ')} of the statics, reversal ${lumps.every(l => l.record.reversed)}, ${lumps.map(l => l.ruleJoins).join(', ')} docks joined by the rule after placement; the husk step at the edge ${lumps.map(l => f(l.edgeStep)).join(', ')} against 3 / r_h ${lumps.map(l => f((2 * CAP) / l.horizonRadius)).join(', ')}; the rule's force equals its statics to ${e(ruleVsSolve)} at r = 7 .. 11, and on side ${BIG} the torn over the free force is ${far.map(fr => `${f(fr.ratio[0]!)} .. ${f(fr.ratio[fr.ratio.length - 1]!)}`).join(' and ')} at r = ${FAR_R[0]} .. ${FAR_R[FAR_R.length - 1]} (k ${far.map(fr => `${f(fr.kTorn)} / ${f(fr.kFree)}`).join(', ')})`,
      metrics,
      control: {
        k1: k1 ? 1 : 0,
        fieldSlope,
        spreadFieldDocks: family('spread').reduce(
          (t, l) => t + l.fieldDocks,
          0,
        ),
      },
      notes: `L1 for C1 (the criterion's law on linear statics), L2 for C2 and C3. Gates C1 ${c1} (slopes ${f(slopeCompressed)}, ${f(slopeSpread)}), C2 ${c2}, C3 ${c3} (statics ${e(ruleVsSolve)}, far off ${e(farOff)}, converging ${converging}); control K1 ${k1} (field slope ${f(fieldSlope)}). Per lump: ${lumps.map((l, i) => `${l.family} ${l.m}: horizon ${l.horizonDocks} docks to ${f(l.horizonRadius)} (placed ${l.placedHorizon}, ${l.staticsRounds} solve rounds, placement read ${l.placementJoins}, rule joins ${l.ruleJoins}), lump ${f(l.lumpRadius)}, content outside ${l.contentOutside}, field criterion ${l.fieldDocks} docks to ${f(l.fieldRadius)}, side ${BIG} ${f(bigRadius[i]!)}, wraps ${wrapsOf(l.record)}, husk ${f(l.record.huskStep)} (placed ${f(l.placedLargest)}), vertical ${f(l.record.verticalStep)}, bulk ${l.record.bulkStep.map(f).join('/')}, drift ${e(l.record.energyDrift)} of ${f(l.energyStatic)}`).join('; ')}. Infinite stack radius: compressed ${infiniteCompressed.map(f).join(', ')}, spread ${infiniteSpread.map(f).join(', ')}.`,
    })
  },
})
