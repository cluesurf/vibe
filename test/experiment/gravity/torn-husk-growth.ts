// The torn husk, growing (E-GRV-0109): a lump driven past saturation over time, its content added unit by unit by
// scheduled events, on the torn husk of E-GRV-0108 (code/rule/horizon-husk). Does the horizon form, grow with the
// content, stay exact and reversible, and leave the far field alone? Does anything come back out through it?
//
// THE RUN. E-GRV-0090's M = 1600 lump (code/measure/step-depth compressLump on the side-24 husk, center (12, 12, 12),
// capacity 1, sinks the 1600 farthest docks) grown in the order it was placed: unit i, its +1 at its dock, its -1 at its
// sink and its line along its recorded path, is added after beat 2 i (one unit every 2 beats, so the last lands after
// beat 3198), then 1024 beats with nothing added. The horizon is read at every event from the lines (a dock joins when
// its 18 husk lines are all in use, and stays; the event records who joined). A torn link holds the step it had when it
// tore, so a held step is a fixed source from then on (code/measure/horizon-husk horizonEnergy counts it with the
// content). Windows as E-GRV-0108: the husk's trit, 81 whole steps for the verticals, the bulk and the horizon's docks.
//
// GATES, fixed before the first run of this file. D 16, three digits, side 24, the warped shrinking stack of 3 layers.
//  G1 exact over the whole run: Gauss 0 off on every dock after every beat; 0 wraps; curl 0 on every check (every 64
//     beats and the last) over every live link, the vertical links included; every remainder in its window; the energy
//     kept between events, |E(t) - E(just after the last event)| <= 1e-4 of the final torn statics' |E_static| on EVERY
//     beat; the whole run (every beat and every event, the horizon's bits included) reverses bit for bit. CONTROL C1: the
//     same growth with no tear wraps within its 3200 growth beats.
//  G2 the horizon forms and grows: no horizon dock before the first unit that saturates one; after the 200th, 400th,
//     800th, 1200th and 1600th unit the horizon's dock count strictly increasing, and its radius within 0.5 dock of the
//     stack's window radius for that M (E-GRV-0108's H2 prediction, theory).
//  G3 the far field: (a) the settled field (the Hann average of the last 1024 beats) reads its own statics: its husk force
//     along the axes equals the linear solve's (the torn links' weights 0, their held steps as sources) within 1e-3 at
//     every r = 5 .. 11; (b) the history adds nothing the far field sees: that force is within 2 percent of the torn
//     statics of the same content with no held steps (E-GRV-0108's placed lump) at every r = 8 .. 11. E-GRV-0108's H3
//     carries that on to the free lump's 1/r.
// REPORTED (not gated): whether anything comes back out through the horizon: (i) the settled flux on each horizon
// dock's vertical link against the dock's own source (a horizon dock is a leaf, so statically only its own source can
// pass it), and how many point up; (ii) the flux that comes back up to the husk through the vertical links OUTSIDE the
// horizon (the bulk is finite and closed, so everything that went down must return somewhere for Gauss's law on the
// husk's far spheres); (iii) the energy held in the horizon's leaves at the start and the end of the settle; (iv) the
// torn over the free force at r = 5 .. 11.
// Verdict: pass if G1 to G3 hold with C1; partial if C1 fails; fail otherwise.
//
// FIRST RUN (tmp/torn-growth-run1.log, 331 s, the record; run under the provisional code E-GRV-0107, renumbered 0109
// before registration because another experiment took 0106 and 0107): fail on G1 and G3, no gate moved. G2 holds: the
// horizon forms at unit 18, exactly the first unit that fills a dock's 18 lines, and holds 21, 56, 154, 280, 452 docks
// to radius 1.73, 2.24, 3.32, 4.12, 4.69 at M = 200 .. 1600 against the window radius 1.76, 2.42, 3.29, 3.93, 4.46
// (worst 0.23 dock). Gauss 0 off in 4,223 beats; every event and beat reverses bit for bit, the horizon's bits included.
// C1: untorn, the same growth wraps 747,060 times. G1 FAILS: 346 wraps and curl 197. WHY: a dock on the lump's edge
// fills over many events, and until its 18th line lands it is on the husk carrying a growing share of the lump's field
// with the dynamics driven every 2 beats; the husk's largest step sits at 1.490 .. 1.499 from beat 256 on, on the
// window's edge, and slips there. A dock that tears then HOLDS a step up to 1.499 (the value it tore at), and those held
// steps are fixed sources. The energy between events is kept only to 1.6e-3 of the statics (2.9 of 1,803), because a
// wrap breaks the leapfrog's invariant. G3 FAILS on history: the settled force reads its own statics (the held steps as
// sources) to 1.05e-3, just over the 1e-3 gate, but differs from the placed lump's statics by 22 percent at r = 8 .. 11:
// the held steps are the lump's growth history frozen into the tear, and they move flux the far field sees. REPORTED:
// each horizon vertical carries its own dock's source to 6.7e-4 in the settled field, but 35 of 452 point UP (their
// source, content less the held steps' divergence, is negative), and 971 units come back up through the verticals
// outside the horizon against 719 going down through it (everything down must come back: the bulk is closed); the
// largest upward flux on a horizon vertical in the settle is 2.87, and the leaves' energy rises 304 to 330. So something
// DOES come back out through the horizon: the held history, not the content. Title written after the run.
//
// Depth L2: a known construction run as an integer reversible rule on bounded registers, with the tear added by hand.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; each unit of content added is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import {
  openMesh,
  warpClock,
  type OpenMesh,
} from '@/code/rule/open-husk'
import { horizonRule, tornLink } from '@/code/rule/horizon-husk'
import { compressLump } from '@/code/measure/step-depth'
import {
  greenSolve,
  huskDistance,
  huskDock,
  stackModes,
} from '@/code/measure/open-husk'
import {
  growthRun,
  horizonLeafEnergy,
  newHorizonRecord,
  realHorizonDepth,
  stackWindowRadius,
  tornMesh,
  verticalOf,
  type Addition,
} from '@/code/measure/horizon-husk'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const SIDE = 24
const LAYERS = 3
const M = 1600
const EVERY = 2
const SETTLE = 1024
const SAMPLE = 64
const CHECKPOINTS: readonly number[] = [200, 400, 800, 1200, 1600]
const WINDOW = 1.5
const ENERGY_TOLERANCE = 1e-4
const RADIUS_TOLERANCE = 0.5
const STATIC_TOLERANCE = 1e-3
const STATIC_R: readonly number[] = [5, 6, 7, 8, 9, 10, 11]
const HISTORY_R: readonly number[] = [8, 9, 10, 11]
const HISTORY_TOLERANCE = 0.02
const CENTER = [12, 12, 12]

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

const axisMean = (
  mesh: OpenMesh,
  x: ArrayLike<number>,
  r: number,
): number =>
  AXES.reduce(
    (t, a) =>
      t +
      x[
        huskDock(
          mesh,
          a.map((v, i) => CENTER[i]! + v * r),
        )
      ]!,
    0,
  ) / AXES.length
const axisForce = (
  mesh: OpenMesh,
  x: ArrayLike<number>,
  r: number,
): number => axisMean(mesh, x, r + 1) - axisMean(mesh, x, r)

export default experiment({
  id: 'gravity/torn-husk-growth',
  code: 'E-GRV-0109',
  title:
    "a lump grown past saturation on the torn husk forms its horizon at the first full dock and grows it with the content, but is not clean while it grows, fail on G1 and G3: E-GRV-0090's M = 1600 lump added one unit every 2 beats tears at unit 18 and holds 21, 56, 154, 280, 452 docks to radius 1.73 .. 4.69, within 0.23 dock of the step window's radius, Gauss exact and every event and beat reversed bit for bit (untorn: 747,060 wraps), but edge docks carry the growing field on the husk until their 18th line lands, sit at 1.499 and wrap 346 times (curl 197, energy kept only to 1.6e-3), and the steps they tear at are held as sources, so the settled far force is 22 percent off the placed lump's at r = 8 .. 11 and 35 horizon verticals carry flux back up: the growth history comes back out through the tear",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const rule = horizonRule(stepRule(DEPTH, LEVELS), BULK)
    const lump = compressLump(
      radionMesh([SIDE, SIDE, SIDE]),
      CENTER,
      M,
      1,
    )
    const additions: Addition[] = lump.units.map((u, i) => ({
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

    let firstHorizon = -1
    let firstSaturating = -1

    const mean = new Float64Array(mesh.links)

    let weight = 0

    const leaf: number[] = []

    let upSettle = 0

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
            docks++
            radius = Math.max(radius, huskDistance(mesh, y, CENTER))
          }
        }

        if (docks > 0 && firstHorizon < 0) {
          firstHorizon = units
        }

        if (
          CHECKPOINTS.includes(units) &&
          t === EVERY * (units - 1) + 1
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
    )

    log('growth')

    // the first unit whose lines saturate a dock (replayed on the lines alone)
    {
      const line = new Int8Array(mesh.links)
      const busy = new Int32Array(mesh.huskDocks)

      for (
        let i = 0;
        i < additions.length && firstSaturating < 0;
        i++
      ) {
        for (const [l, sg] of additions[i]!.path) {
          const was = line[l] !== 0

          line[l] = line[l]! + sg

          if (was !== (line[l] !== 0)) {
            const d = line[l] !== 0 ? 1 : -1

            busy[mesh.tail[l]!]! += d
            busy[mesh.head[l]!]! += d
          }
        }

        if (busy.some(v => v === 18)) {
          firstSaturating = i + 1
        }
      }
    }

    const control = newHorizonRecord()

    growthRun(
      mesh,
      rule,
      additions,
      growEnd,
      control,
      CENTER,
      SAMPLE * 8,
      undefined,
      false,
    )
    log('control')

    for (let m = 0; m < mesh.links; m++) {
      mean[m] = mean[m]! / weight
    }

    const horizon = run.horizon
    const rho = run.rho
    // the held steps' sources: rho' = rho - div F_torn (whole units)
    const source = Float64Array.from(rho)

    for (let m = 0; m < mesh.links; m++) {
      if (!tornLink(mesh, horizon, m)) {
        continue
      }

      const v = run.final.step[m]! / rule.unit

      source[mesh.tail[m]!] = source[mesh.tail[m]!]! - v
      source[mesh.head[m]!] = source[mesh.head[m]!]! + v
    }

    const torn = tornMesh(mesh, horizon)
    const held = greenSolve(torn, source, 1e-12)
    const placed = greenSolve(torn, rho, 1e-12)
    const free = greenSolve(mesh, rho, 1e-12)
    const depth = realHorizonDepth(mesh, mean, horizon)

    let rhoX = 0

    for (let y = 0; y < mesh.docks; y++) {
      if (rho[y] !== 0) {
        rhoX += rho[y]! * placed.x[y]!
      }
    }

    const energyStatic = (-(Math.PI / DEPTH) * rhoX) / 2

    // G1
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const g1 =
      record.gaussOff === 0 &&
      wraps === 0 &&
      record.curl === 0 &&
      record.verticalChecked > 0 &&
      record.restOff === 0 &&
      record.energyDrift <= ENERGY_TOLERANCE * Math.abs(energyStatic) &&
      run.reversed &&
      record.reversed
    const controlWraps = control.wraps.fWraps + control.wraps.vWraps
    const c1 = controlWraps > 0

    // G2
    const modes = stackModes(mesh.sides, 'clock')
    const predicted = CHECKPOINTS.map(m =>
      stackWindowRadius(modes, m, WINDOW),
    )
    const found = CHECKPOINTS.map(m => checkpoints.find(c => c.m === m))
    const increasing = found.every(
      (c, i) =>
        c !== undefined && (i === 0 || c.docks > found[i - 1]!.docks),
    )
    const radiusOff = Math.max(
      ...found.map((c, i) =>
        c ? Math.abs(c.radius - predicted[i]!) : Infinity,
      ),
    )
    const g2 =
      firstHorizon === firstSaturating &&
      firstHorizon > 0 &&
      increasing &&
      radiusOff <= RADIUS_TOLERANCE

    // G3
    const ruleVsSolve = Math.max(
      ...STATIC_R.map(r =>
        Math.abs(
          axisForce(mesh, depth, r) / axisForce(mesh, held.x, r) - 1,
        ),
      ),
    )
    const historyOff = Math.max(
      ...HISTORY_R.map(r =>
        Math.abs(
          axisForce(mesh, depth, r) / axisForce(mesh, placed.x, r) - 1,
        ),
      ),
    )
    const g3 =
      ruleVsSolve <= STATIC_TOLERANCE && historyOff <= HISTORY_TOLERANCE

    // reported: does anything come back out through the horizon
    let leafOff = 0
    let leafUp = 0
    let leafDown = 0
    let returnUp = 0
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
      }
    }

    let heldMax = 0

    for (let m = 0; m < mesh.links; m++) {
      if (tornLink(mesh, horizon, m)) {
        heldMax = Math.max(
          heldMax,
          Math.abs(run.final.step[m]!) / rule.unit,
        )
      }
    }

    const sideRatio = STATIC_R.map(
      r => axisForce(mesh, depth, r) / axisForce(mesh, free.x, r),
    )
    const status = !c1 ? 'partial' : g1 && g2 && g3 ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const metrics: Record<string, number> = {
      gate_G1: g1 ? 1 : 0,
      gate_G2: g2 ? 1 : 0,
      gate_G3: g3 ? 1 : 0,
      control_C1: c1 ? 1 : 0,
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
      controlWraps,
      controlHuskStep: control.huskStep,
      firstHorizon,
      firstSaturating,
      radiusOff,
      ruleVsSolve,
      historyOff,
      horizonDocks,
      horizonRadius,
      leafOff,
      leafUp,
      leafDown,
      returnUp,
      upSettle,
      leafEnergyStart: leaf[0] ?? NaN,
      leafEnergyEnd: leaf[1] ?? NaN,
      seconds: (Date.now() - started) / 1000,
    }

    record.bulkStep.forEach(
      (v, k) => (metrics[`bulkStep_layer${k}`] = v),
    )

    found.forEach((c, i) => {
      metrics[`M${CHECKPOINTS[i]}_horizonDocks`] = c?.docks ?? -1
      metrics[`M${CHECKPOINTS[i]}_horizonRadius`] = c?.radius ?? -1
      metrics[`M${CHECKPOINTS[i]}_predictedRadius`] = predicted[i]!
    })

    STATIC_R.forEach(
      (r, j) => (metrics[`tornOverFree_r${r}`] = sideRatio[j]!),
    )

    run.samples.forEach(s => {
      if (s.beat % 512 === 0) {
        metrics[`t${s.beat}_horizonDocks`] = s.horizonDocks
        metrics[`t${s.beat}_huskStep`] = s.huskStep
        metrics[`t${s.beat}_upFlux`] = s.upFlux
      }
    })

    return verdict({
      status,
      claim: `E-GRV-0090's M = ${M} lump grown one unit every ${EVERY} beats on the torn husk (side ${SIDE}, the warped shrinking stack of ${LAYERS} layers), then ${SETTLE} beats: Gauss off ${record.gaussOff} of ${record.gaussChecks}, ${wraps} wraps (the same growth untorn wraps ${controlWraps} times), curl ${record.curl} on ${record.liveChecked} live link checks (${record.verticalChecked} vertical), the energy between events kept to ${e(record.energyDrift / Math.abs(energyStatic))} of the statics on every beat, the run with every event reversed ${run.reversed && record.reversed}; the horizon forms at unit ${firstHorizon} (the first saturated dock: unit ${firstSaturating}) and holds ${found.map(c => c?.docks ?? -1).join(', ')} docks to radius ${found.map(c => f(c?.radius ?? NaN)).join(', ')} at M = ${CHECKPOINTS.join(', ')} against the step window's ${predicted.map(f).join(', ')} (off ${f(radiusOff)}); the husk's largest step ${f(record.huskStep)}, the vertical's ${f(record.verticalStep)}, the bulk's ${record.bulkStep.map(f).join('/')}, held steps up to ${f(heldMax)}; the settled force equals its statics to ${e(ruleVsSolve)} and the placed lump's to ${e(historyOff)} at r = 8 .. 11; torn over free ${sideRatio.map(f).join(', ')} at r = 5 .. 11; each horizon vertical carries its dock's source down to ${e(leafOff)}, ${leafUp} point up, ${f(leafDown)} units go down through the horizon and ${f(returnUp)} come back up through the vertical links outside it; the leaves hold ${e(leaf[0] ?? NaN)} and ${e(leaf[1] ?? NaN)} of energy at the start and end of the settle`,
      metrics,
      control: { c1: c1 ? 1 : 0, controlWraps },
      notes: `L2. Gates G1 ${g1}, G2 ${g2} (first ${firstHorizon}/${firstSaturating}, increasing ${increasing}, radius off ${f(radiusOff)}), G3 ${g3} (statics ${e(ruleVsSolve)}, history ${e(historyOff)}); control C1 ${c1}. Samples (beat:units:docks:radius:husk:vertical:down:up): ${run.samples
        .filter(s => s.beat % 256 === 0 || s.beat === beats)
        .map(
          s =>
            `${s.beat}:${s.units}:${s.horizonDocks}:${f(s.horizonRadius)}:${f(s.huskStep)}:${f(s.verticalStep)}:${f(s.downFlux)}:${f(s.upFlux)}`,
        )
        .join(
          ' ',
        )}. Largest upward instantaneous flux on a horizon vertical in the settle ${f(upSettle)}. Energy jumps at events: largest ${e(Math.max(...run.eventEnergy.map(Math.abs)))}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
