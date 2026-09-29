// The clock horizon, growing (E-GRV-0112): E-GRV-0109's growing lump with the horizon joined by the CLOCK criterion of
// E-GRV-0111 (code/rule/clock-horizon): a husk dock joins when the depth found by summing steps exceeds dock 0's by the
// metric register's cap, read by the rule after EVERY beat. Does the horizon form when the depth first reaches the cap,
// grow with the content, never slip, and leave the far field as the settled lump's? What comes back up through the bulk?
//
// THE RUN. E-GRV-0109's M = 1600 lump (code/measure/step-depth compressLump on the side-24 husk, center (12, 12, 12),
// capacity 1), with its sinks spread from 9 (E-GRV-0111's, so the reference dock 0 is not in a sink well), grown by
// UNIFORM ACCRETION (code/measure/clock-horizon accretionOrder: every dock of the final lump gets its first unit, nearest
// the center first, then every dock with two its second, and so on), each unit's line routed on the husk to the nearest
// sink with room (routeUnits), added after beat 2 i (one every 2 beats), then 1024 beats with nothing added.
// WHY NOT E-GRV-0109's ORDER, which fills each dock to its 18 lines before the next (derived, and seen in
// tmp/clock-probe4): a dock of 18 units alone demands a husk step past the trit window (the M = 100 core already demands
// 1.8 statically, tmp/clock-probe1), while its depth excess is still under the cap, so under the clock criterion that
// order must slip at its first full dock (probe 4: first wrap at unit 19, the horizon's first dock at unit 20). The line
// criterion tears that dock by counting its lines; the clock criterion cannot, because its bound is on the depth and the
// depth of one dock is small. So a clock horizon can form only in matter whose density keeps the steps inside the window
// until the depth reaches the cap: accretion that raises the density everywhere at once. E-GRV-0109's order is run as
// CONTROL K1.
//
// DERIVED BEFORE THE RUN (constants as E-GRV-0111): the horizon forms when the lump's excess at its center first reaches
// the cap 3/2; on the partial lump's statics (a linear solve, theory) that is unit U_s (found here by bisection over the
// accretion); it grows to where the partial lump's statics put the cap (clockStatics), 6.0 docks at M = 1600, with the
// step at its edge about 3 / r_h. The field lags the content by a crossing of the lump (a few beats at 2 beats a unit),
// so the rule's horizon should trail the statics by little.
//
// DISCLOSED PROBES (instrument only, before this file; tmp/clock-probe4): (a) E-GRV-0109's order, 300 units: 61 wraps,
// the first at unit 19; (b) the uniform accretion, the whole growth and 256 beats: 0 wraps, the first join at unit 589,
// the husk's largest step 1.11, the horizon 763 docks to 5.83 at the last unit and 884 to 6.08 after 256 more beats.
//
// GATES, fixed before the first run of this file. D 16, three digits, bulk window 81, side 24, the warped shrinking
// stack of 3 layers, CAP 3/2, the reference dock 0.
//  G1 no slip, exact, over the whole run: 0 wraps; Gauss 0 off on every dock after every beat; curl 0 on every check
//     (every 64 beats and the last) over every live link, the verticals included; every remainder in its window; the
//     energy kept between events (a unit added or a dock joined), |E(t) - E(last event)| <= 1e-4 of the final torn
//     statics' |E_static| on EVERY beat; the whole run reversed bit for bit, the horizon's bits included. CONTROLS: K1
//     E-GRV-0109's order under the same criterion wraps within its first 300 units; K2 the same accretion with no
//     horizon (no tear) wraps within the growth.
//  G2 the horizon forms when the depth first reaches the cap and grows with M: the unit of the first join within 10
//     percent of U_s; after the 800th, 1000th, 1200th, 1400th and 1600th unit the horizon's dock count strictly
//     increasing, and its radius within 0.5 dock of the partial lump's statics' radius (clockStatics) for that content.
//  G3 little frozen history: (a) the settled field (the Hann average of the last 1024 beats) reads its own statics, its
//     husk force along the axes equal to the torn linear solve's (the held steps as sources) within 1e-3 at every
//     r = 7 .. 11; (b) that force within 2 percent of the placed lump's (the torn statics of the same content and
//     horizon with no held steps, E-GRV-0111's start) at every r = 8 .. 11 (E-GRV-0109: 22 percent off).
// REPORTED (G4): what comes back up through the bulk, against E-GRV-0109 (719 units down through its horizon, 971 up
// outside it, 35 of 452 horizon verticals pointing up, the leaves' energy 304 to 330): the settled flux on each horizon
// vertical against its dock's source, how many point up, the flux up through the verticals outside the horizon; the
// leaves' energy at the start and end of the settle; the held steps' largest value.
// Verdict: pass if G1 to G3 hold with K1 and K2; partial if a control fails; fail otherwise.
//
// FIRST RUN (tmp/clock-growth-run1.log, 180 s, the record; run under the provisional code E-GRV-0111, renumbered 0112
// before registration because another experiment took 0110): fail on G2 and G3, no gate moved. G1 HOLDS, the slip E-GRV-
// 0109 could not avoid: 0 wraps over 4,223 beats (K1: E-GRV-0109's order under the same criterion wraps 61 times in 300
// units; K2: the accretion untorn wraps 9,852 times), Gauss 0 off, curl 0 on 10,167,844 live link checks (1,040,688
// vertical), every remainder in its window, energy between events kept to 2.6e-9 of the statics on every beat, the
// whole run with its 1,600 events and every join reversed bit for bit. The husk's largest step 1.114, flat from beat
// 2,048: nothing sits on the window's edge (E-GRV-0109: 1.499). G2 FAILS BY 0.05 DOCK: the horizon forms at unit 589,
// 2.5 percent before the statics reach the cap (unit 604; gate 10 percent), and holds 103, 236, 361, 464, 761 docks,
// strictly growing, to radius 3.00, 4.00, 4.58, 5.00, 5.83 at M = 800 .. 1600 against the statics' 2.45, 4.00, 4.69,
// 5.10, 5.83; the worst is M = 800, 0.55 dock ahead of the statics (gate 0.5): the dynamic depth overshoots its
// statics while the horizon is small and a dock that joins stays. G3 FAILS ON HISTORY, worse than E-GRV-0109: the
// settled force reads its own statics (held steps as sources) to 6.4e-4, but differs from the placed lump's (E-GRV-
// 0110's start, no held steps) by 36 percent at r = 8 .. 11 (E-GRV-0109: 22). WHY: a dock joins when the depth reaches
// the cap, which is while the lump is still filling, so its links tear holding the step they had then (up to 1.11),
// and those held steps are the growth history as fixed sources; the clock criterion moves the tear off the window's
// edge but does not stop it freezing the step it tore at. G4, REPORTED: 816 units go down through the horizon and 761
// come back up through the verticals outside it (E-GRV-0109: 719 and 971), 407 of 894 horizon verticals point UP in
// the settled field (E-GRV-0109: 35 of 452), each carrying its dock's source less its held steps' divergence to 0.12;
// the leaves' energy 424 to 430; the largest upward flux on a horizon vertical in the settle 2.09. Torn over free force
// 0.90 .. 0.96 at r = 7 .. 11. So what comes back up is again the held history, now on more docks: the no-slip half of
// the fix works, the no-history half does not. Title written after the run.
//
// Depth L2: a known construction (a brane-world horizon) run as an integer reversible rule on bounded registers, with the
// tear and the cap added by hand; the horizon here forms by the rule's own read of its own found depth.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; each unit of content added is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import { openMesh, warpClock } from '@/code/rule/open-husk'
import { horizonRule, tornLink } from '@/code/rule/horizon-husk'
import { clockHorizonRule, clockJoin } from '@/code/rule/clock-horizon'
import { compressLump } from '@/code/measure/step-depth'
import { greenSolve, huskDistance } from '@/code/measure/open-husk'
import {
  growthRun,
  horizonLeafEnergy,
  newHorizonRecord,
  realHorizonDepth,
  tornMesh,
  verticalOf,
  type Addition,
} from '@/code/measure/horizon-husk'
import {
  accretionOrder,
  axisForce,
  clockStatics,
  routeUnits,
  spreadSinks,
} from '@/code/measure/clock-horizon'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const SIDE = 24
const LAYERS = 3
const CAP = 1.5
const M = 1600
const EVERY = 2
const SETTLE = 1024
const SAMPLE = 64
const SINKS_FROM = 9
const CONTROL_UNITS = 300
const CHECKPOINTS: readonly number[] = [800, 1000, 1200, 1400, 1600]
const FORM_TOLERANCE = 0.1
const ENERGY_TOLERANCE = 1e-4
const RADIUS_TOLERANCE = 0.5
const STATIC_TOLERANCE = 1e-3
const STATIC_R: readonly number[] = [7, 8, 9, 10, 11]
const HISTORY_R: readonly number[] = [8, 9, 10, 11]
const HISTORY_TOLERANCE = 0.02
const CENTER = [12, 12, 12]

export default experiment({
  id: 'gravity/clock-horizon-growth',
  code: 'E-GRV-0112',
  title:
    "a lump accreted under the clock criterion forms its horizon without a slip but freezes more history into it, fail on G2 and G3: E-GRV-0109's M = 1600 lump built one unit every 2 beats with the horizon joined where the found depth exceeds the reference's by 3/2 runs 4,223 beats with 0 wraps (E-GRV-0109's order under the same criterion 61, untorn 9,852), curl 0, energy to 3e-9 and every event reversed bit for bit, the husk's step never above 1.11; the horizon forms at unit 589 (statics 604) and grows to 761 docks at radius 5.83, matching the statics except 0.55 dock ahead at M = 800 (gate 0.5); but docks tear while the lump fills and hold their steps (up to 1.11), so the settled force is 36 percent off the placed lump's at r = 8 .. 11 (E-GRV-0109: 22) and 407 of 894 horizon verticals carry flux back up, 761 units returning through the bulk outside the horizon",
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
    const sinks = spreadSinks(mesh, CENTER, M, SINKS_FROM)
    const lump = compressLump(
      radionMesh([SIDE, SIDE, SIDE]),
      CENTER,
      M,
      1,
      sinks,
    )
    const routed = routeUnits(
      mesh,
      accretionOrder(mesh, lump.content, CENTER),
      sinks,
    )
    const additions: Addition[] = routed.map((u, i) => ({
      beat: EVERY * i,
      at: u.at,
      sink: u.sink,
      path: u.path,
    }))
    const growEnd = EVERY * (M - 1) + 1
    const beats = growEnd + SETTLE
    const vertical = verticalOf(mesh)
    const record = newHorizonRecord()
    const checkpoints: { m: number; docks: number; radius: number }[] =
      []

    let firstJoin = -1

    const mean = new Float64Array(mesh.links)

    let weight = 0

    const leaf: number[] = []

    let upSettle = 0

    const join = (
      s: Parameters<typeof clockJoin>[2],
      h: Uint8Array,
    ): number[] => clockJoin(mesh, rule, s, h)

    const run = growthRun(
      mesh,
      rule,
      additions,
      beats,
      record,
      CENTER,
      SAMPLE,
      (t, s, horizon) => {
        const units = Math.min(M, Math.floor((t - 1) / EVERY) + 1)

        let docks = 0
        let radius = 0

        for (let y = 0; y < mesh.huskDocks; y++) {
          if (horizon[y]) {
            ;(docks++,
              (radius = Math.max(
                radius,
                huskDistance(mesh, y, CENTER),
              )))
          }
        }

        if (docks > 0 && firstJoin < 0) {
          firstJoin = units
        }

        // the horizon just before the next unit lands (after the last beat of this unit's pair)
        if (
          CHECKPOINTS.includes(units) &&
          t === (units === M ? growEnd : EVERY * units)
        ) {
          checkpoints.push({ m: units, docks, radius })
        }

        if (t > growEnd) {
          const w = Math.sin((Math.PI * (t - growEnd)) / SETTLE) ** 2

          for (let m = 0; m < mesh.links; m++) {
            mean[m] = mean[m]! + (w * s.step[m]!) / rule.unit
          }

          weight += w

          for (let y = 0; y < mesh.huskDocks; y++) {
            if (horizon[y] && s.step[vertical[y]!]! < 0) {
              upSettle = Math.max(
                upSettle,
                -s.step[vertical[y]!]! / rule.unit,
              )
            }
          }

          if (t === growEnd + 1 || t === beats) {
            leaf.push(
              horizonLeafEnergy(mesh, rule, s, horizon, vertical),
            )
          }
        }
      },
      false,
      join,
    )

    log('growth')

    // K1: E-GRV-0109's order (each dock filled to its lines' capacity) under the same criterion, the first units
    const k1Record = newHorizonRecord()
    const k1Additions: Addition[] = lump.units
      .slice(0, CONTROL_UNITS)
      .map((u, i) => ({
        beat: EVERY * i,
        at: u.at,
        sink: u.sink,
        path: u.path,
      }))

    growthRun(
      mesh,
      rule,
      k1Additions,
      EVERY * CONTROL_UNITS,
      k1Record,
      CENTER,
      SAMPLE * 8,
      undefined,
      false,
      join,
    )
    log('control K1')

    // K2: the same accretion with no horizon
    const k2Record = newHorizonRecord()

    growthRun(
      mesh,
      rule,
      additions,
      growEnd,
      k2Record,
      CENTER,
      SAMPLE * 8,
      undefined,
      false,
    )
    log('control K2')

    for (let m = 0; m < mesh.links; m++) {
      mean[m] = mean[m]! / weight
    }

    const horizon = run.horizon
    const rho = run.rho
    // the held steps' sources: rho' = rho - div F_torn (whole units)
    const source = Float64Array.from(rho)

    let heldMax = 0

    for (let m = 0; m < mesh.links; m++) {
      if (!tornLink(mesh, horizon, m)) {
        continue
      }

      const v = run.final.step[m]! / rule.unit

      heldMax = Math.max(heldMax, Math.abs(v))
      source[mesh.tail[m]!] = source[mesh.tail[m]!]! - v
      source[mesh.head[m]!] = source[mesh.head[m]!]! + v
    }

    const torn = tornMesh(mesh, horizon)
    const held = greenSolve(torn, source, 1e-12)
    const placed = greenSolve(torn, rho, 1e-12)
    const depth = realHorizonDepth(mesh, mean, horizon)

    let rhoX = 0

    for (let y = 0; y < mesh.docks; y++) {
      if (rho[y] !== 0) {
        rhoX += rho[y]! * placed.x[y]!
      }
    }

    const energyStatic = (-(Math.PI / DEPTH) * rhoX) / 2

    // the partial lump after u units: its content map (theory reads it)
    const partial = (u: number): Int32Array => {
      const p = new Int32Array(mesh.docks)

      for (let i = 0; i < u; i++) {
        ;(p[routed[i]!.at]!++, p[routed[i]!.sink]!--)
      }

      return p
    }

    // U_s: the first unit whose partial lump's free statics reach the cap anywhere on the husk (bisection; the excess
    // only grows as units are added near the center)
    const reaches = (u: number): boolean => {
      const x = greenSolve(mesh, partial(u), 1e-11).x

      for (let y = 0; y < mesh.huskDocks; y++) {
        if (y !== rule.reference && x[y]! - x[rule.reference]! >= CAP) {
          return true
        }
      }

      return false
    }

    let lo = 1
    let hi = M

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)

      if (reaches(mid)) {
        hi = mid
      } else {
        lo = mid + 1
      }
    }

    const formStatics = lo
    const staticsRadius = CHECKPOINTS.map(u => {
      const st = clockStatics(mesh, rule, partial(u))

      let r = 0

      for (let y = 0; y < mesh.huskDocks; y++) {
        if (st.horizon[y]) {
          r = Math.max(r, huskDistance(mesh, y, CENTER))
        }
      }

      return r
    })

    log('statics')

    // G1
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const g1 =
      wraps === 0 &&
      record.gaussOff === 0 &&
      record.curl === 0 &&
      record.verticalChecked > 0 &&
      record.restOff === 0 &&
      record.energyDrift <= ENERGY_TOLERANCE * Math.abs(energyStatic) &&
      run.reversed &&
      record.reversed
    const k1Wraps = k1Record.wraps.fWraps + k1Record.wraps.vWraps
    const k2Wraps = k2Record.wraps.fWraps + k2Record.wraps.vWraps
    const k1 = k1Wraps > 0
    const k2 = k2Wraps > 0

    // G2
    const found = CHECKPOINTS.map(m => checkpoints.find(c => c.m === m))
    const increasing = found.every(
      (c, i) =>
        c !== undefined && (i === 0 || c.docks > found[i - 1]!.docks),
    )
    const radiusOff = Math.max(
      ...found.map((c, i) =>
        c ? Math.abs(c.radius - staticsRadius[i]!) : Infinity,
      ),
    )
    const formOff = Math.abs(firstJoin / formStatics - 1)
    const g2 =
      firstJoin > 0 &&
      formOff <= FORM_TOLERANCE &&
      increasing &&
      radiusOff <= RADIUS_TOLERANCE

    // G3
    const ruleVsSolve = Math.max(
      ...STATIC_R.map(r =>
        Math.abs(
          axisForce(mesh, depth, CENTER, r) /
            axisForce(mesh, held.x, CENTER, r) -
            1,
        ),
      ),
    )
    const historyOff = Math.max(
      ...HISTORY_R.map(r =>
        Math.abs(
          axisForce(mesh, depth, CENTER, r) /
            axisForce(mesh, placed.x, CENTER, r) -
            1,
        ),
      ),
    )
    const g3 =
      ruleVsSolve <= STATIC_TOLERANCE && historyOff <= HISTORY_TOLERANCE

    // G4, reported: what comes back up through the bulk
    let leafOff = 0
    let leafUp = 0
    let leafDown = 0
    let returnUp = 0
    let returnDown = 0
    let horizonDocks = 0
    let horizonRadius = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      const F = mean[vertical[y]!]!

      if (horizon[y]) {
        horizonDocks++
        horizonRadius = Math.max(
          horizonRadius,
          huskDistance(mesh, y, CENTER),
        )
        leafOff = Math.max(leafOff, Math.abs(F - source[y]!))

        if (F < -STATIC_TOLERANCE) {
          leafUp++
        }

        if (F > 0) {
          leafDown += F
        }
      } else if (F < 0) {
        returnUp -= F
      } else {
        returnDown += F
      }
    }

    const free = greenSolve(mesh, rho, 1e-12)
    const sideRatio = STATIC_R.map(
      r =>
        axisForce(mesh, depth, CENTER, r) /
        axisForce(mesh, free.x, CENTER, r),
    )
    const status =
      !k1 || !k2 ? 'partial' : g1 && g2 && g3 ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const metrics: Record<string, number> = {
      gate_G1: g1 ? 1 : 0,
      gate_G2: g2 ? 1 : 0,
      gate_G3: g3 ? 1 : 0,
      control_K1: k1 ? 1 : 0,
      control_K2: k2 ? 1 : 0,
      cap: CAP,
      units: M,
      beats,
      events: additions.length,
      gaussOff: record.gaussOff,
      gaussChecks: record.gaussChecks,
      wraps,
      curl: record.curl,
      liveChecked: record.liveChecked,
      verticalChecked: record.verticalChecked,
      restOff: record.restOff,
      energyDrift: record.energyDrift,
      energyStatic,
      energyChecks: record.energyChecks,
      reversed: run.reversed && record.reversed ? 1 : 0,
      huskStep: record.huskStep,
      verticalStep: record.verticalStep,
      huskRate: record.huskRate,
      bulkRate: record.bulkRate,
      heldMax,
      k1Wraps,
      k1HuskStep: k1Record.huskStep,
      k2Wraps,
      k2HuskStep: k2Record.huskStep,
      firstJoin,
      formStatics,
      formOff,
      radiusOff,
      ruleVsSolve,
      historyOff,
      horizonDocks,
      horizonRadius,
      leafOff,
      leafUp,
      leafDown,
      returnUp,
      returnDown,
      upSettle,
      leafEnergyStart: leaf[0] ?? NaN,
      leafEnergyEnd: leaf[1] ?? NaN,
      largestJoinEnergy: Math.max(0, ...run.eventEnergy.map(Math.abs)),
      seconds: (Date.now() - started) / 1000,
    }

    record.bulkStep.forEach(
      (v, k) => (metrics[`bulkStep_layer${k}`] = v),
    )

    found.forEach((c, i) => {
      metrics[`M${CHECKPOINTS[i]}_horizonDocks`] = c?.docks ?? -1
      metrics[`M${CHECKPOINTS[i]}_horizonRadius`] = c?.radius ?? -1
      metrics[`M${CHECKPOINTS[i]}_staticsRadius`] = staticsRadius[i]!
    })

    STATIC_R.forEach(
      (r, j) => (metrics[`tornOverFree_r${r}`] = sideRatio[j]!),
    )

    run.samples.forEach(s => {
      if (s.beat % 512 === 0) {
        ;((metrics[`t${s.beat}_horizonDocks`] = s.horizonDocks),
          (metrics[`t${s.beat}_huskStep`] = s.huskStep),
          (metrics[`t${s.beat}_upFlux`] = s.upFlux))
      }
    })

    return verdict({
      status,
      claim: `E-GRV-0109's M = ${M} lump (sinks spread from ${SINKS_FROM}) accreted uniformly one unit every ${EVERY} beats on the torn husk (side ${SIDE}, the warped shrinking stack of ${LAYERS} layers) with a dock joining the horizon where its found depth exceeds dock 0's by ${CAP}, then ${SETTLE} beats: ${wraps} wraps (E-GRV-0109's order under the same criterion ${k1Wraps} in ${CONTROL_UNITS} units; the accretion untorn ${k2Wraps}), Gauss off ${record.gaussOff} of ${record.gaussChecks}, curl ${record.curl} on ${record.liveChecked} live link checks, energy between events kept to ${e(record.energyDrift / Math.abs(energyStatic))} of the statics, reversed ${run.reversed && record.reversed}; the horizon forms at unit ${firstJoin} (the statics reach the cap at unit ${formStatics}) and holds ${found.map(c => c?.docks ?? -1).join(', ')} docks to radius ${found.map(c => f(c?.radius ?? NaN)).join(', ')} at M = ${CHECKPOINTS.join(', ')} against the statics' ${staticsRadius.map(f).join(', ')} (off ${f(radiusOff)}), ${horizonDocks} to ${f(horizonRadius)} settled; the husk's largest step ${f(record.huskStep)}, held steps up to ${f(heldMax)}; the settled force equals its statics to ${e(ruleVsSolve)} and the placed lump's to ${e(historyOff)} at r = 8 .. 11; ${f(leafDown)} units go down through the horizon, ${leafUp} of its verticals point up, ${f(returnUp)} come back up through the verticals outside it (E-GRV-0109: 719, 35, 971)`,
      metrics,
      control: { k1: k1 ? 1 : 0, k1Wraps, k2: k2 ? 1 : 0, k2Wraps },
      notes: `L2. Gates G1 ${g1}, G2 ${g2} (first join ${firstJoin} vs statics ${formStatics}, off ${f(formOff)}, increasing ${increasing}, radius off ${f(radiusOff)}), G3 ${g3} (statics ${e(ruleVsSolve)}, history ${e(historyOff)}); controls K1 ${k1}, K2 ${k2}. Samples (beat:units:docks:radius:husk:vertical:down:up): ${run.samples
        .filter(s => s.beat % 256 === 0 || s.beat === beats)
        .map(
          s =>
            `${s.beat}:${s.units}:${s.horizonDocks}:${f(s.horizonRadius)}:${f(s.huskStep)}:${f(s.verticalStep)}:${f(s.downFlux)}:${f(s.upFlux)}`,
        )
        .join(
          ' ',
        )}. Largest upward instantaneous flux on a horizon vertical in the settle ${f(upSettle)}. Leaves' energy ${e(leaf[0] ?? NaN)} to ${e(leaf[1] ?? NaN)}. Flux down through verticals outside the horizon ${f(returnDown)}. Torn over free force r = 7 .. 11: ${sideRatio.map(f).join(', ')}. Energy jumps at events: largest ${e(metrics.largestJoinEnergy!)}.`,
    })
  },
})
