// The continuous bald horizon, growing (E-GRV-0115): E-GRV-0112's accreted lump under the clock criterion, with a tear
// that hands each torn link's flux to the horizon unchanged and a horizon that trades that source over its own surface
// as a reversible wave (code/rule/wave-horizon). Is the horizon continuous (no runaway) and bald (the settled field
// outside forgets the growth order)?
//
// WHY (note/research/vibe/roadmap/discrete-gravity.md, "Measured, the no-hair horizon"). Held tears (E-GRV-0112) keep a
// torn dock's step: hair, the settled field 36 percent off the placed lump's. Count tears (E-GRV-0113) are bald but
// each is a jolt; with no damping the overshoot pushes the next ring past the cap and the horizon runs away (2,154 docks
// against 779, the field 283 percent off). And E-GRV-0113's two orders could not tell hair apart: the held rule agreed
// with itself across them to 0.32 percent.
//
// THE RULE (derived in code/rule/wave-horizon before this file): only a link with both ends on the horizon tears; at the
// tear its step F moves into the shares, sigma_tail -= F and sigma_head += F, so every dock's kick X = a (S - div' F) is
// the same integer before and after (no jolt, exactly); the horizon's shares then move by a leapfrog on the inner links,
// J += mu g [lambda (S_t - S_h) - (x_t - x_h)] carried, sigma_t -= J, sigma_h += J, mu = a / Q (the rate's own), lambda
// = 4, x_t - x_h read down, across and up the two verticals. Sum over H of sigma is 0 exactly (Gauss); the whole beat is
// one kick-drift leapfrog, so it runs back exactly and keeps one energy to the carry level. It does not damp: what is
// tested is DEPHASING, a time average over the window below.
//
// THE RUNS. E-GRV-0112's lump and schedule exactly: M = 1600 on the side-24 husk over the warped shrinking stack of 3
// layers (D 16, three digits, bulk window 81), sinks spread from 9, one unit every 2 beats, then 1024 beats with nothing
// added, the horizon joined by the clock criterion (cap 3/2 against dock 0, read over the rule's own live links) after
// every beat.
//  A  the wave rule, E-GRV-0112's uniform accretion (code/measure/clock-horizon accretionOrder).
//  B  the wave rule, OUTSIDE-IN (outsideInOrder below): the docks farthest from the center first, each given all its
//     units in a row, so a shell forms and fills inward and the core comes last. Same final content, another history.
//  C1 the held rule (E-GRV-0112 as is) on the same two orders. C2 the count rule (E-GRV-0113) on order A.
// THE ORDER PAIR, DISCLOSED (tmp/wave-probe2, 2b, 2c: instrument probes of the HELD rule only, before this file was run
// and before any run of the wave rule's full growth). Against the accretion's held force at r = 8 .. 11 (-0.1657,
// -0.1131, -0.0493, -0.0209), the largest relative difference was: one hemisphere first (every round of z < 12, then of
// z >= 12) 1.35 percent; outside-in 1.43; the accretion at one unit every beat 0.52; the whole lump placed after beat 0
// and run (a burst) 867, but with 34 wraps and a horizon of 7,759 docks to radius 13.9, so r = 8 .. 11 lies inside it and
// the difference is a slip, not hair. No slip-free history found moves the held rule's settled force by C1's 10
// percent: its held steps are the local field at the moment each dock reaches the cap, which the criterion fixes more
// than the order does. So C1 is EXPECTED TO REFUSE TO REFUSE and the verdict to be at best partial: the pair used is the
// most different slip-free one found (outside-in), and G4 on it cannot tell a held horizon from a bald one to better than
// about 1.4 percent. Disclosed here, before the run, as the brief for this experiment asks.
// A DISCLOSED IMPLEMENTATION PROBE (tmp/wave-probe3, before this file): the wave rule on the first 700 units and 256 beats
// more, reversed; it checks exactness only and reads no gated quantity.
//
// THE WINDOW. The settled field is the Hann average (sin^2 weights) of the steps over the last 1024 beats, as in
// E-GRV-0112 and 0113; the depth is found from it over the final horizon's live links, and the force is its difference
// along the six axes. The slowest horizon mode is its l = 1 wave, about 2 pi R / (c sqrt 2) beats with R ~ 6 and the
// long-wave speed c = sqrt(6 mu (lambda - 1)) ~ 0.35 dock a beat, about 75 beats: the window holds over a dozen.
//
// THE REFERENCES. "The placed lump": the same content placed at once under the same rule, its horizon found by the clock
// criterion on its own statics (the wave's rest state), read again until no dock joins (code/measure/wave-horizon
// waveStatics). G2's number is the count rule's placed horizon (code/measure/count-horizon countStatics, 779 docks at
// 5.83 in E-GRV-0113; the held statics join the same docks).
//
// GATES, fixed before the first run of this file.
//  G1 0 wraps over the whole of runs A and B (every step, rate, share and flow register).
//  G2 the final horizon of A and of B each within 15 percent of the count rule's placed horizon's dock count.
//  G3 A's settled force within 5 percent of the wave rule's placed lump's at every r = 8, 9, 10, 11.
//  G4 THE NO-HAIR GATE: A's and B's settled forces within 3 percent of each other at every r = 8 .. 11 (same content).
//  G5 A and B each: reversed bit for bit (every register, the horizon's bits, and the wave's registers back at 0);
//     Gauss 0 off after every beat (div f = rho on every dock; sum over H of sigma 0 and sigma 0 off H); curl 0 on every
//     live link at every check (every 64 beats and the last), and the local path of every husk link agreeing with the
//     found depth there; every remainder in its window; energy between events within 1e-4 of the wave placed statics'
//     |E| on every beat.
//  CONTROLS, each must refuse: C1 the held rule's settled forces on A's and B's orders 10 percent or more apart at some
//  r = 8 .. 11 (so G4 could fail); C2 the count rule fails G2 on order A.
// Verdict: pass if G1 to G5 hold and both controls refuse; partial if a control does not refuse; fail otherwise.
// REPORTED: the wave's energy (the flow's kinetic part and the lambda part), its time course through the settle, and the
// dipole of the horizon's source S about the center, in quarters of the settle, against the placed statics'.
//
// FIRST RUN (tmp/wave-growth-run1.log, 763 s, the record; no gate moved): PARTIAL, and fail on G1, G2, G3 and G5.
// WHAT HOLDS: the handover is continuous as derived and the rest state is right. Both wave runs reverse bit for bit
// with every register and the wave's back at 0; Gauss 0 off on 4,223 beats each, and the shares sum to 0 over the
// horizon on every beat; the local path agrees with the found depth on every husk link at every check (0 off); no share
// or flow register wraps (sigma up to 21.7 and 19.3 units, flow up to 0.94 and 0.99). The placed lump under this rule
// joins exactly the count and held statics' 779 docks at 5.83, its fixed point converging at ratio 0.38 (so lambda = 4
// is above G_HH on the moves sigma makes, as needed). C2 refuses: the count rule runs away again (2,154 docks). G4
// "holds" (A and B 1.56 percent apart), BUT C1 DOES NOT REFUSE (the held rule's two orders 1.43 percent apart, as the
// probes said before the run), so G4 on this pair cannot tell hair from no hair, and it passes on a run that slips.
// WHAT FAILS: G1, 10,321 and 12,486 wraps, all on STEPS (no rate wraps). tmp/wave-probe4 (after the run, diagnostic, no
// gate reads it) times it: the first wrap is at unit 754 with 81 horizon docks, on a BOUNDARY link (horizon dock to a
// dock outside, the links this rule keeps live): the largest boundary step goes 0.28, 0.55, 1.48 at units 640, 704, 754,
// while the husk's other links stay at 0.79. It then sits at the window's edge (1.47 to 1.50) to the end, the shares
// on the rim climbing to 15 to 19 units. WHY: the rest state puts lambda S - x level over the horizon, and on a rim dock
// that is a large S, which the rest of the husk can take only through that dock's few live boundary links; a step of
// 1.5 on a link is the most the trit can carry, so the rim is where the horizon's flux must slip. Each slip then breaks
// the curl (6,310 and 7,224 live links off at the checks) and the energy (drift 6.8e-3 and 7.6e-3 of the statics, the
// gate 1e-4), so G5 fails through G1. The horizon grows to 1,145 and 1,175 docks (G2: 47 and 51 percent over 779),
// and the settled force is 7.6 percent off the placed lump's (G3: 5), much closer than E-GRV-0113's 283 or the held
// rule's 32, but on a slipping field. THE WAVE DOES NOT DEPHASE here: the flow's kinetic energy RISES through the
// settle, 1.20e3, 1.28e3, 1.33e3, 1.40e3 by quarter (B 1.36e3 .. 1.62e3), and the dipole of S stays at 210, 324, 333,
// 179 (B 534 .. 508) against the placed 275: the slips feed the wave every beat, so no window of this run can show
// ringdown. So the tear is continuous and the horizon's source is bald by construction, but keeping the boundary live
// moves the bottleneck from the tear to the rim: the next thing to fix is a rim that is not a leaf of the trit window,
// for instance the boundary links carried in the bulk's window as the verticals are.
//
// Depth L2: a known construction (a brane-world horizon, and the membrane picture of a horizon as a surface whose charge
// relaxes) run as an integer reversible rule on bounded registers, with the tear, the cap, the wave's stiffness and the
// handover added by hand.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; each unit of content added is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import {
  openMesh,
  openRestLow,
  warpClock,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import { horizonDepth, horizonRule } from '@/code/rule/horizon-husk'
import { clockHorizonRule, clockJoin } from '@/code/rule/clock-horizon'
import {
  innerLink,
  pathTwice,
  waveHorizonRule,
} from '@/code/rule/wave-horizon'
import { compressLump } from '@/code/measure/step-depth'
import {
  greenSolve,
  huskCoord,
  huskDistance,
} from '@/code/measure/open-husk'
import {
  growthRun,
  newHorizonRecord,
  realHorizonDepth,
  tornEngine,
  tornMesh,
  type Addition,
  type HorizonEngine,
  type HorizonRecord,
} from '@/code/measure/horizon-husk'
import {
  accretionOrder,
  axisForce,
  clockStatics,
  routeUnits,
  spreadSinks,
} from '@/code/measure/clock-horizon'
import { countEngine, countStatics } from '@/code/measure/count-horizon'
import {
  outsideInOrder,
  waveEnergy,
  waveEngine,
  waveStatics,
  type WaveEngine,
} from '@/code/measure/wave-horizon'

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
const ENERGY_TOLERANCE = 1e-4
const HORIZON_TOLERANCE = 0.15
const PLACED_TOLERANCE = 0.05
const ORDER_TOLERANCE = 0.03
const HELD_APART = 0.1
const RADII: readonly number[] = [8, 9, 10, 11]
const CENTER = [12, 12, 12]
const QUARTERS = 4

// the husk offset of dock y from the center, each axis taken the short way round
const offsetOf = (
  mesh: OpenMesh,
  y: number,
  center: readonly number[],
): number[] =>
  huskCoord(mesh, y).map((v, i) => {
    const d = v - center[i]!

    return d > mesh.side / 2
      ? d - mesh.side
      : d < -mesh.side / 2
        ? d + mesh.side
        : d
  })

type WaveTrace = {
  gaussOff: number
  curl: number
  pathOff: number
  liveChecked: number
  sigmaMax: number
  flowMax: number
  zeroAfter: boolean
  waveWraps: number
  flowKinetic: number[]
  flowMean: number[]
  dipole: number[][]
}

type Settled = {
  record: HorizonRecord
  reversed: boolean
  horizon: Uint8Array
  rho: Int32Array
  depth: Float64Array
  firstJoin: number
  eventEnergy: number
  trace?: WaveTrace
}

export default experiment({
  id: 'gravity/wave-horizon-growth',
  code: 'E-GRV-0115',
  title:
    "a tear that hands each torn link's flux to the horizon unchanged is continuous, and a reversible wave keeps the horizon's source exact, but the live rim slips, fail on G1, G2, G3 and G5 (partial: the held rule's two orders agree, so the no-hair gate could not refuse): E-GRV-0112's M = 1600 lump with only inner links torn, their flux moved into per-dock shares and traded by a leapfrog (lambda 4, mu a / Q) reverses bit for bit, Gauss and the shares' sum 0 off on every beat, no share or flow register wrapping, and its placed lump joins the 779 docks of the other rules; but from unit 754 the boundary links between horizon and outside carry the rim's shares at the trit window's edge and slip 10,321 times (outside-in 12,486), so curl breaks, energy drifts 7e-3, the horizon grows to 1,145 docks, the settled force is 7.6 percent off the placed lump's (held 32, count 283), and the wave's energy rises through the settle instead of dephasing",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const clock = clockHorizonRule(
      horizonRule(stepRule(DEPTH, LEVELS), BULK),
      CAP,
    )
    const rule = waveHorizonRule(clock)
    const sinks = spreadSinks(mesh, CENTER, M, SINKS_FROM)
    const lump = compressLump(
      radionMesh([SIDE, SIDE, SIDE]),
      CENTER,
      M,
      1,
      sinks,
    )
    const scheduleOf = (order: readonly number[]): Addition[] =>
      routeUnits(mesh, order, sinks).map((u, i) => ({
        beat: EVERY * i,
        at: u.at,
        sink: u.sink,
        path: u.path,
      }))
    const orderA = scheduleOf(
      accretionOrder(mesh, lump.content, CENTER),
    )
    const orderB = scheduleOf(
      outsideInOrder(mesh, lump.content, CENTER),
    )
    const growEnd = EVERY * (M - 1) + 1
    const beats = growEnd + SETTLE
    const quarter = SETTLE / QUARTERS

    // a settled run: the Hann average of the last SETTLE beats, its depth found over the final horizon's live links
    const grow = (
      engine: HorizonEngine,
      additions: Addition[],
      join: (s: OpenState, h: Uint8Array) => number[],
      we?: WaveEngine,
    ): Settled => {
      const wave = we !== undefined
      const record = newHorizonRecord()
      const mean = new Float64Array(mesh.links)
      const trace: WaveTrace = {
        gaussOff: 0,
        curl: 0,
        pathOff: 0,
        liveChecked: 0,
        sigmaMax: 0,
        flowMax: 0,
        zeroAfter: false,
        waveWraps: 0,
        flowKinetic: [],
        flowMean: new Array<number>(QUARTERS).fill(0),
        dipole: Array.from({ length: QUARTERS }, () => [0, 0, 0]),
      }

      let weight = 0
      let firstJoin = -1

      const run = growthRun(
        mesh,
        rule,
        additions,
        beats,
        record,
        CENTER,
        SAMPLE,
        (t, s, horizon) => {
          if (firstJoin < 0 && horizon.some(v => v === 1)) {
            firstJoin = Math.min(M, Math.floor((t - 1) / EVERY) + 1)
          }

          if (we) {
            const w = we.last()!

            let sum = 0

            for (let y = 0; y < mesh.huskDocks; y++) {
              if (horizon[y]) {
                sum += w.sigma[y]!
              } else if (w.sigma[y] !== 0) {
                trace.gaussOff++
              }

              trace.sigmaMax = Math.max(
                trace.sigmaMax,
                Math.abs(w.sigma[y]!) / rule.unit,
              )
            }

            if (sum !== 0) {
              trace.gaussOff++
            }

            for (let m = 0; m < mesh.huskDocks * 9; m++) {
              trace.flowMax = Math.max(
                trace.flowMax,
                Math.abs(w.flow[m]!) / rule.unit,
              )
            }

            if (t % SAMPLE === 0 || t === beats) {
              const d = horizonDepth(mesh, s.step, horizon, innerLink)

              trace.curl += d.curl
              trace.liveChecked += d.checked

              for (let m = 0; m < mesh.huskDocks * 9; m++) {
                if (
                  pathTwice(mesh, w.paths, s.step, m) !==
                  d.twice[mesh.tail[m]!]! - d.twice[mesh.head[m]!]!
                ) {
                  trace.pathOff++
                }
              }
            }

            if (t > growEnd) {
              const e = waveEnergy(mesh, rule, s, horizon, w)
              const k = Math.min(
                QUARTERS - 1,
                Math.floor((t - growEnd - 1) / quarter),
              )

              if ((t - growEnd) % 16 === 0) {
                trace.flowKinetic.push(e.flowKinetic)
              }

              trace.flowMean[k] =
                trace.flowMean[k]! + e.flowKinetic / quarter

              for (let y = 0; y < mesh.huskDocks; y++) {
                if (!horizon[y]) {
                  continue
                }

                const S = w.source[y]! / rule.unit
                const o = offsetOf(mesh, y, CENTER)

                for (let i = 0; i < 3; i++) {
                  trace.dipole[k]![i] =
                    trace.dipole[k]![i]! + (S * o[i]!) / quarter
                }
              }
            }
          }

          if (t <= growEnd) {
            return
          }

          const w = Math.sin((Math.PI * (t - growEnd)) / SETTLE) ** 2

          for (let m = 0; m < mesh.links; m++) {
            mean[m] = mean[m]! + (w * s.step[m]!) / rule.unit
          }

          weight += w
        },
        false,
        join,
        engine,
      )

      for (let m = 0; m < mesh.links; m++) {
        mean[m] = mean[m]! / weight
      }

      if (we) {
        const w = we.last()!

        trace.zeroAfter =
          w.sigma.every(v => v === 0) &&
          w.flow.every(v => v === 0) &&
          w.carry.every(v => v === 0) &&
          w.known.every(v => v === 0)
        trace.waveWraps = w.waveWraps
      }

      const depth = wave
        ? horizonDepth(mesh, mean, run.horizon, innerLink).twice.map(
            v => v / 2,
          )
        : realHorizonDepth(mesh, mean, run.horizon)

      return {
        record,
        reversed: run.reversed && record.reversed,
        horizon: run.horizon,
        rho: run.rho,
        depth,
        firstJoin,
        eventEnergy: Math.max(0, ...run.eventEnergy.map(Math.abs)),
        trace: wave ? trace : undefined,
      }
    }

    const waveJoin = (s: OpenState, h: Uint8Array): number[] =>
      clockJoin(mesh, rule, s, h, innerLink)
    const heldJoin = (s: OpenState, h: Uint8Array): number[] =>
      clockJoin(mesh, rule, s, h)

    // C1 first: the held rule on both orders
    const c1a = grow(tornEngine(mesh, rule), orderA, heldJoin)

    log('C1 A')

    const c1b = grow(tornEngine(mesh, rule), orderB, heldJoin)

    log('C1 B')

    const engineA = waveEngine(mesh, rule)
    const a = grow(engineA, orderA, waveJoin, engineA)

    log('A')

    const engineB = waveEngine(mesh, rule)
    const b = grow(engineB, orderB, waveJoin, engineB)

    log('B')

    const c2 = grow(countEngine(mesh, rule), orderA, heldJoin)

    log('C2')

    const rho = a.rho
    const placed = waveStatics(mesh, rule, rho)
    const placedCount = countStatics(mesh, rule, rho)
    const placedHeld = clockStatics(mesh, clock, rho)
    const heldPlacedX = greenSolve(
      tornMesh(mesh, placedHeld.horizon),
      rho,
      1e-12,
    ).x

    log('statics')

    const forceAt = (x: ArrayLike<number>): number[] =>
      RADII.map(r => axisForce(mesh, x, CENTER, r))

    const off = (
      x: ArrayLike<number>,
      ref: ArrayLike<number>,
    ): number => {
      const p = forceAt(x)
      const q = forceAt(ref)

      return Math.max(...p.map((v, i) => Math.abs(v / q[i]! - 1)))
    }

    const docksOf = (h: Uint8Array): number =>
      h.reduce((n, v) => n + v, 0)

    const radiusOf = (h: Uint8Array): number => {
      let r = 0

      for (let y = 0; y < mesh.huskDocks; y++) {
        if (h[y]) {
          r = Math.max(r, huskDistance(mesh, y, CENTER))
        }
      }

      return r
    }

    const wrapsOf = (r: HorizonRecord): number =>
      r.wraps.fWraps + r.wraps.vWraps
    const sameContent = [b, c1a, c1b, c2].every(run =>
      run.rho.every((v, y) => v === rho[y]),
    )
    const reference = docksOf(placedCount.horizon)

    let rhoX = 0

    for (let y = 0; y < mesh.docks; y++) {
      rhoX += placed.source[y]! * placed.x[y]!
    }

    const energyStatic = ((Math.PI / DEPTH) * Math.abs(rhoX)) / 2

    const exact = (s: Settled): boolean => {
      const t = s.trace!

      return (
        s.reversed &&
        t.zeroAfter &&
        s.record.gaussOff === 0 &&
        t.gaussOff === 0 &&
        s.record.curl === 0 &&
        t.curl === 0 &&
        t.pathOff === 0 &&
        t.liveChecked > 0 &&
        s.record.restOff === 0 &&
        s.record.energyDrift <= ENERGY_TOLERANCE * energyStatic
      )
    }

    const g1 =
      wrapsOf(a.record) === 0 &&
      wrapsOf(b.record) === 0 &&
      a.trace!.waveWraps === 0 &&
      b.trace!.waveWraps === 0
    const horizonOffA = Math.abs(docksOf(a.horizon) / reference - 1)
    const horizonOffB = Math.abs(docksOf(b.horizon) / reference - 1)
    const g2 =
      horizonOffA <= HORIZON_TOLERANCE &&
      horizonOffB <= HORIZON_TOLERANCE
    const placedOff = off(a.depth, placed.x)
    const g3 = placedOff <= PLACED_TOLERANCE
    const orderOff = off(a.depth, b.depth)
    const g4 = sameContent && orderOff <= ORDER_TOLERANCE
    const g5 = exact(a) && exact(b)
    const heldApart = off(c1b.depth, c1a.depth)
    const c1Refuses = heldApart >= HELD_APART
    const countOff = Math.abs(docksOf(c2.horizon) / reference - 1)
    const c2Refuses = countOff > HORIZON_TOLERANCE
    const status =
      !c1Refuses || !c2Refuses
        ? 'partial'
        : g1 && g2 && g3 && g4 && g5
          ? 'pass'
          : 'fail'

    // the placed statics' dipole of S about the center
    const placedDipole = [0, 0, 0]

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (!placed.horizon[y]) {
        continue
      }

      const o = offsetOf(mesh, y, CENTER)

      for (let i = 0; i < 3; i++) {
        placedDipole[i] = placedDipole[i]! + placed.source[y]! * o[i]!
      }
    }

    const norm = (v: readonly number[]): number => Math.hypot(...v)
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const forces = (x: ArrayLike<number>): string =>
      forceAt(x).map(f).join(', ')
    const metrics: Record<string, number> = {
      gate_G1: g1 ? 1 : 0,
      gate_G2: g2 ? 1 : 0,
      gate_G3: g3 ? 1 : 0,
      gate_G4: g4 ? 1 : 0,
      gate_G5: g5 ? 1 : 0,
      control_C1: c1Refuses ? 1 : 0,
      control_C2: c2Refuses ? 1 : 0,
      units: M,
      beats,
      lambda: rule.stiffTwice / 2,
      waveDivisor: rule.waveDivisor,
      A_wraps: wrapsOf(a.record),
      B_wraps: wrapsOf(b.record),
      A_waveWraps: a.trace!.waveWraps,
      B_waveWraps: b.trace!.waveWraps,
      C1A_wraps: wrapsOf(c1a.record),
      C1B_wraps: wrapsOf(c1b.record),
      C2_wraps: wrapsOf(c2.record),
      A_reversed: a.reversed && a.trace!.zeroAfter ? 1 : 0,
      B_reversed: b.reversed && b.trace!.zeroAfter ? 1 : 0,
      A_gaussOff: a.record.gaussOff + a.trace!.gaussOff,
      B_gaussOff: b.record.gaussOff + b.trace!.gaussOff,
      gaussChecks: a.record.gaussChecks,
      A_curl: a.trace!.curl,
      B_curl: b.trace!.curl,
      A_pathOff: a.trace!.pathOff,
      B_pathOff: b.trace!.pathOff,
      A_liveChecked: a.trace!.liveChecked,
      A_restOff: a.record.restOff,
      B_restOff: b.record.restOff,
      A_energyDrift: a.record.energyDrift,
      B_energyDrift: b.record.energyDrift,
      energyStatic,
      A_largestEventEnergy: a.eventEnergy,
      B_largestEventEnergy: b.eventEnergy,
      A_huskStep: a.record.huskStep,
      B_huskStep: b.record.huskStep,
      A_verticalStep: a.record.verticalStep,
      B_verticalStep: b.record.verticalStep,
      A_sigmaMax: a.trace!.sigmaMax,
      B_sigmaMax: b.trace!.sigmaMax,
      A_flowMax: a.trace!.flowMax,
      B_flowMax: b.trace!.flowMax,
      A_firstJoin: a.firstJoin,
      B_firstJoin: b.firstJoin,
      A_horizonDocks: docksOf(a.horizon),
      B_horizonDocks: docksOf(b.horizon),
      C1A_horizonDocks: docksOf(c1a.horizon),
      C1B_horizonDocks: docksOf(c1b.horizon),
      C2_horizonDocks: docksOf(c2.horizon),
      countPlaced_horizonDocks: reference,
      wavePlaced_horizonDocks: docksOf(placed.horizon),
      heldPlaced_horizonDocks: docksOf(placedHeld.horizon),
      A_horizonRadius: radiusOf(a.horizon),
      B_horizonRadius: radiusOf(b.horizon),
      C2_horizonRadius: radiusOf(c2.horizon),
      countPlaced_horizonRadius: radiusOf(placedCount.horizon),
      wavePlaced_horizonRadius: radiusOf(placed.horizon),
      placedRounds: placed.rounds,
      placedIterations: placed.iterations,
      placedRatio: placed.ratio,
      horizonOffA,
      horizonOffB,
      countOff,
      placedOff,
      orderOff,
      B_placedOff: off(b.depth, placed.x),
      heldApart,
      C1A_heldPlacedOff: off(c1a.depth, heldPlacedX),
      countPlacedOff: off(a.depth, placedCount.x),
      sameContent: sameContent ? 1 : 0,
      placedDipole: norm(placedDipole),
      seconds: (Date.now() - started) / 1000,
    }

    RADII.forEach(r => {
      metrics[`A_force_r${r}`] = axisForce(mesh, a.depth, CENTER, r)
      metrics[`B_force_r${r}`] = axisForce(mesh, b.depth, CENTER, r)
      metrics[`placed_force_r${r}`] = axisForce(
        mesh,
        placed.x,
        CENTER,
        r,
      )
      metrics[`C1A_force_r${r}`] = axisForce(mesh, c1a.depth, CENTER, r)
      metrics[`C1B_force_r${r}`] = axisForce(mesh, c1b.depth, CENTER, r)
      metrics[`C2_force_r${r}`] = axisForce(mesh, c2.depth, CENTER, r)
    })

    for (const [name, run] of [
      ['A', a],
      ['B', b],
    ] as const) {
      const t = run.trace!

      for (let k = 0; k < QUARTERS; k++) {
        metrics[`${name}_flowKinetic_q${k + 1}`] = t.flowMean[k]!
        metrics[`${name}_dipole_q${k + 1}`] = norm(t.dipole[k]!)
      }
    }

    const series = (t: WaveTrace): string =>
      t.flowKinetic
        .filter((_, i) => i % 8 === 0)
        .map(e)
        .join(' ')

    return verdict({
      status,
      claim: `E-GRV-0112's M = ${M} lump grown one unit every ${EVERY} beats under the clock criterion (cap ${CAP}) with a tear that hands each inner link's flux to the horizon's shares and a reversible wave (lambda ${rule.stiffTwice / 2}, mu a / Q) trading them over the horizon, then ${SETTLE} beats: wraps ${wrapsOf(a.record) + a.trace!.waveWraps} (accretion) and ${wrapsOf(b.record) + b.trace!.waveWraps} (outside-in); horizons ${docksOf(a.horizon)} and ${docksOf(b.horizon)} docks (count placed ${reference}, wave placed ${docksOf(placed.horizon)}); the settled force at r = 8 .. 11 ${forces(a.depth)} against the placed lump's ${forces(placed.x)} (off ${f(placedOff)}), the outside-in's ${forces(b.depth)} (off ${f(orderOff)}); reversed ${a.reversed && a.trace!.zeroAfter} and ${b.reversed && b.trace!.zeroAfter}, Gauss off ${metrics.A_gaussOff} and ${metrics.B_gaussOff}, curl ${a.trace!.curl} and ${b.trace!.curl}, energy between events ${e(a.record.energyDrift / energyStatic)} and ${e(b.record.energyDrift / energyStatic)} of the statics; controls: the held rule's two orders apart by ${f(heldApart)}, the count rule's horizon ${docksOf(c2.horizon)} docks (off ${f(countOff)})`,
      metrics,
      control: {
        c1: c1Refuses ? 1 : 0,
        heldApart,
        c2: c2Refuses ? 1 : 0,
        countOff,
      },
      notes: `L2. Gates G1 ${g1}, G2 ${g2} (${f(horizonOffA)}, ${f(horizonOffB)}), G3 ${g3} (${f(placedOff)}), G4 ${g4} (${f(orderOff)}, same content ${sameContent}), G5 ${g5}; controls C1 ${c1Refuses} (${f(heldApart)}), C2 ${c2Refuses} (${f(countOff)}). Held forces r = 8 .. 11: accretion ${forces(c1a.depth)}, outside-in ${forces(c1b.depth)}, held placed ${forces(heldPlacedX)}; count rule ${forces(c2.depth)}. First join A ${a.firstJoin}, B ${b.firstJoin}. Placed statics: ${placed.rounds} rounds, fixed point ${placed.iterations} iterations at ratio ${f(placed.ratio)}. Wave: sigma up to ${f(a.trace!.sigmaMax)} and ${f(b.trace!.sigmaMax)} units, flow up to ${f(a.trace!.flowMax)} and ${f(b.trace!.flowMax)}; the flow's kinetic energy by quarter of the settle A ${t4(metrics, 'A_flowKinetic')}, B ${t4(metrics, 'B_flowKinetic')}; the dipole of S by quarter A ${t4(metrics, 'A_dipole')}, B ${t4(metrics, 'B_dipole')}, placed ${f(norm(placedDipole))}. Flow kinetic every 128 beats of the settle A: ${series(a.trace!)}; B: ${series(b.trace!)}. Wraps C1 ${wrapsOf(c1a.record)}, ${wrapsOf(c1b.record)}, C2 ${wrapsOf(c2.record)}. Rest window low ${openRestLow(rule.waveDivisor)}.`,
    })
  },
})

const t4 = (metrics: Record<string, number>, key: string): string =>
  Array.from({ length: QUARTERS }, (_, k) =>
    (metrics[`${key}_q${k + 1}`] ?? NaN).toExponential(2),
  ).join(', ')
