// The horizon with no hair, growing (E-GRV-0113): E-GRV-0112's accreted lump under the clock criterion, with the torn
// links' held steps taken out of the beat and the horizon's docks sourcing only the COUNT of lines through its surface,
// spread evenly over its vertical links with carry (code/rule/count-horizon). Does the settled field outside forget how
// the lump grew?
//
// WHY (note/research/vibe/roadmap/discrete-gravity.md, "Measured, the clock horizon"). E-GRV-0112 ended the slip but a
// dock that tears mid-growth holds the step it had then: the settled force outside is 36 percent off the placed lump's
// (E-GRV-0109, the line criterion: 22). The held step is hair.
//
// THE RULE (derived in code/rule/count-horizon before this file): N = sum over the horizon of div f (found, bounded by the
// lines through the surface), spread as Q^L N over the horizon's h docks, floor(Q^L N / h) each and one more register
// unit on the first (Q^L N mod h) by index; a horizon dock's rate reads its share in place of its content; no dock reads
// a torn link. Reversible: the shares are fixed between events and the beat is the leapfrog with a fixed source. Bounded:
// a share is at most a dock's 18 units. Gauss: the shares sum to Q^L N in integers. WHAT IT CANNOT KEEP: the count alone
// cannot run the tear back (the steps at a tear are many numbers, the count one), so the torn registers keep their
// values unread: the history is kept and hidden. Control C3 is the rule that erases them.
//
// THE RUNS. E-GRV-0112's lump and schedule exactly: M = 1600 on the side-24 husk over the warped shrinking stack of 3
// layers (D 16, three digits, bulk window 81), sinks spread from 9, one unit every 2 beats, then 1024 beats with nothing
// added, the horizon joined by the clock criterion (cap 3/2 against dock 0) read after every beat.
//  A  the no-hair rule, E-GRV-0112's uniform accretion (code/measure/clock-horizon accretionOrder: round by round, nearest
//     the center first within a round).
//  B  the no-hair rule, the SWEEP order, stated here before any run (code/measure/count-horizon sweepOrder): the same
//     rounds, but within each round the docks by index, so each round lands slice by slice along the third axis, one side
//     of the lump before the other. Same final content, different history.
//  C1 E-GRV-0112 as is (held tears), order A. C2 held tears, order B. C3 the no-hair rule with the torn steps ERASED at
//     the tear (set to 0, the count the only record), order A, the first 700 units (the first join is near unit 589).
//
// THE REFERENCE, "the placed lump": the same content placed at once under the same rule, its horizon found by the clock
// criterion on its own statics, read again until no dock joins (no-hair: code/measure/count-horizon countStatics; held:
// code/measure/clock-horizon clockStatics, whose placed lump has 0 on every torn link, E-GRV-0111's start). This asks for
// the horizon's shape as well as its field to forget the history. Reported beside it, not gated: the same comparison on
// the run's own final horizon (E-GRV-0112's G3b read).
//
// GATES, fixed before the first run of this file.
//  H1 0 wraps over the whole of runs A and B.
//  H2 the settled force (the husk depth of the Hann average of the last 1024 beats, differenced along the six axes)
//     within 5 percent of the placed lump's at every r = 8, 9, 10, 11, run A (E-GRV-0112: 36 percent, E-GRV-0109: 22).
//  H3 THE NO-HAIR TEST: runs A and B's settled forces within 2 percent of each other at every r = 8 .. 11.
//  H4 runs A and B each: reversed bit for bit (the horizon's bits included); Gauss 0 off (div f = rho on every dock after
//     every beat, and the shares summing to Q^L N with N the content inside the horizon, after every beat); curl 0 on every
//     live link check; every remainder in its window; the energy kept between events within 1e-4 of the no-hair placed
//     statics' |E| on every beat (E-GRV-0112's carry level, measured there at 2.6e-9).
//  CONTROLS, each must REFUSE: C1 fails H2 (its force more than 5 percent off its own placed lump's); C1 and C2 fail H3
//  (more than 2 percent apart); C3 does not reverse.
// Verdict: pass if H1 to H4 hold and every control refuses; partial if a control does not refuse; fail otherwise.
//
// FIRST RUN (tmp/nohair-growth-run1.log, 511 s, the record; no probe before it, no gate moved): PARTIAL, and fail on
// H2 and H3 as a result. H1 HOLDS: 0 wraps in A and B, 4,223 beats each (the husk's largest step 0.93 and 1.16, the
// verticals 10.3 and 12.4 of the 40.5 window). H4 HOLDS: both runs reversed bit for bit with every join, Gauss 0 off on
// 4,223 beats each, the shares summing to Q^L N with N the content inside on every beat (0 off), curl 0 on 10,127,300
// live link checks, every remainder in its window, energy between events to 2.5e-8 of the statics. C3 refuses: the
// erasing rule does not run back, as derived. C1 refuses: the held rule is 32 percent off its placed lump (36 on its own
// horizon, E-GRV-0112's read). H2 FAILS, 2.83 (283 percent), and H3 FAILS, 0.65, BECAUSE THE HORIZON RUNS AWAY: A ends
// with 2,154 horizon docks to radius 11.2 and B with 2,119 to 15.1 (1,207 docks differ), against the placed lump's 779
// to 5.83 (the no-hair statics join exactly the held statics' docks). So r = 8 .. 11 lies INSIDE both horizons and the
// forces gated there read leaf depths, not an outside field (on A's own horizon, 1.006 off). tmp/nohair-probe1 (after
// the run, diagnostic, no gate reads it) times it: the horizon tracks the growth (8 docks at unit 640, 508 at unit 1600,
// radius 5.74, near the statics' 5.83) and then keeps growing through the settle, 624, 876, 1,031, 1,338, 1,378 docks,
// with the excess just off the horizon swinging 0.7 .. 1.5 against the cap 1.5. WHY: each join is now a JOLT (the docks
// outside lose at once the flux their torn links carried, and every share on the horizon moves), the leapfrog has no
// damping, the wave's overshoot carries the found depth past the cap on the next ring, and a dock that joined stays. The
// held tear was continuous and so was stable. C2 DOES NOT REFUSE: the held rule's two orders agree to 0.32 percent (both
// 32 percent off their placed lump), so the sweep is not a different enough history to make the held hair differ, and H3
// as posed could not have told a held horizon from a bald one on these orders. What holds: the no-hair rule is exact,
// reversible, bounded and slip free, the count is the only source the horizon presents, and the history is kept unread;
// what fails is the horizon's shape, which the jolted dynamics push far past the statics.
//
// Depth L2: a known construction (a brane-world horizon, and the no-hair picture of a horizon as a surface carrying only
// its charge) run as an integer reversible rule on bounded registers, with the tear, the cap and the spread added by hand.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; each unit of content added is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import {
  HUSK_LATERAL,
  openMesh,
  warpClock,
  type OpenState,
} from '@/code/rule/open-husk'
import { horizonRule, tornLink } from '@/code/rule/horizon-husk'
import { clockHorizonRule, clockJoin } from '@/code/rule/clock-horizon'
import { countShares } from '@/code/rule/count-horizon'
import { compressLump } from '@/code/measure/step-depth'
import { greenSolve, huskDistance } from '@/code/measure/open-husk'
import {
  growthRun,
  newHorizonRecord,
  realHorizonDepth,
  tornEngine,
  tornMesh,
  verticalOf,
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
import {
  countEngine,
  countSource,
  countStatics,
  lineDivergence,
  sweepOrder,
} from '@/code/measure/count-horizon'

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
const ERASE_UNITS = 700
const ENERGY_TOLERANCE = 1e-4
const PLACED_TOLERANCE = 0.05
const ORDER_TOLERANCE = 0.02
const RADII: readonly number[] = [8, 9, 10, 11]
const CENTER = [12, 12, 12]

type Settled = {
  record: HorizonRecord
  reversed: boolean
  horizon: Uint8Array
  rho: Int32Array
  final: OpenState
  mean: Float64Array
  depth: Float64Array
  countOff: number
  firstJoin: number
  downFlux: number
  upHorizon: number
  returnUp: number
}

export default experiment({
  id: 'gravity/count-horizon-growth',
  code: 'E-GRV-0113',
  title:
    "a horizon that presents only the count of lines through it stays exact and slip free, but each tear jolts the field and the horizon runs away, fail on H2 and H3 (partial: the held rule's two orders agree, so H3 could not refuse): E-GRV-0112's M = 1600 accreted lump with the count spread evenly over the horizon's verticals and the torn steps kept unread runs 4,223 beats with 0 wraps, curl 0, Gauss and the count's Gauss 0 off, energy to 2.5e-8 and exact reversal (the rule that erases the torn steps does not reverse); but the horizon grows through the settle to 2,154 docks at radius 11.2 (sweep order 2,119 at 15.1) against the placed lump's 779 at 5.83, so r = 8 .. 11 is inside it and the forces there are 283 percent off the placed lump's and 65 percent apart between orders",
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
    const scheduleOf = (order: readonly number[]): Addition[] =>
      routeUnits(mesh, order, sinks).map((u, i) => ({
        beat: EVERY * i,
        at: u.at,
        sink: u.sink,
        path: u.path,
      }))
    const accretion = scheduleOf(
      accretionOrder(mesh, lump.content, CENTER),
    )
    const sweep = scheduleOf(sweepOrder(mesh, lump.content))
    const growEnd = EVERY * (M - 1) + 1
    const beats = growEnd + SETTLE
    const vertical = verticalOf(mesh)
    const join = (s: OpenState, h: Uint8Array): number[] =>
      clockJoin(mesh, rule, s, h)
    const noHair = countEngine(mesh, rule)
    const held = tornEngine(mesh, rule)

    const grow = (
      engine: HorizonEngine,
      additions: Addition[],
      counted: boolean,
    ): Settled => {
      const record = newHorizonRecord()
      const mean = new Float64Array(mesh.links)

      let weight = 0
      let countOff = 0
      let firstJoin = -1

      const run = growthRun(
        mesh,
        rule,
        additions,
        beats,
        record,
        CENTER,
        SAMPLE,
        (t, s, horizon, rho) => {
          if (firstJoin < 0 && horizon.some(v => v === 1)) {
            firstJoin = Math.min(M, Math.floor((t - 1) / EVERY) + 1)
          }

          // Gauss through the horizon: the shares the beat read sum to Q^L N, N the content the events put inside
          if (counted) {
            const shares = countShares(
              mesh,
              rule,
              lineDivergence(mesh, s.line),
              horizon,
            )

            let inside = 0
            let sum = 0

            for (let y = 0; y < mesh.huskDocks; y++) {
              if (horizon[y]) {
                inside += rho[y]!
                sum += shares.share[y]!
              }
            }

            if (shares.count !== inside || sum !== rule.unit * inside) {
              countOff++
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

      let downFlux = 0
      let upHorizon = 0
      let returnUp = 0

      for (let y = 0; y < mesh.huskDocks; y++) {
        const F = mean[vertical[y]!]!

        if (run.horizon[y]) {
          if (F > 0) {
            downFlux += F
          } else {
            upHorizon++
          }
        } else if (F < 0) {
          returnUp -= F
        }
      }

      return {
        record,
        reversed: run.reversed && record.reversed,
        horizon: run.horizon,
        rho: run.rho,
        final: run.final,
        mean,
        depth: realHorizonDepth(mesh, mean, run.horizon),
        countOff,
        firstJoin,
        downFlux,
        upHorizon,
        returnUp,
      }
    }

    const a = grow(noHair, accretion, true)

    log('A')

    const b = grow(noHair, sweep, true)

    log('B')

    const c1 = grow(held, accretion, false)

    log('C1')

    const c2 = grow(held, sweep, false)

    log('C2')

    // C3: the no-hair rule with the torn steps erased at the tear: every husk link of a joined dock set to 0
    const c3Record = newHorizonRecord()

    const erase = (s: OpenState, h: Uint8Array): number[] => {
      const joined = clockJoin(mesh, rule, s, h)

      for (const y of joined) {
        for (
          let j = mesh.incStart[y]!;
          j < mesh.incStart[y + 1]!;
          j++
        ) {
          const m = mesh.incLink[j]!

          if (mesh.kind[m] === HUSK_LATERAL) {
            s.step[m] = 0
          }
        }
      }

      return joined
    }

    const c3 = growthRun(
      mesh,
      rule,
      accretion.slice(0, ERASE_UNITS),
      EVERY * ERASE_UNITS,
      c3Record,
      CENTER,
      SAMPLE * 8,
      undefined,
      false,
      erase,
      noHair,
    )

    log('C3')

    // the placed lumps (the same content: the orders differ only in history)
    const rho = a.rho
    const placedNoHair = countStatics(mesh, rule, rho)
    const placedHeld = clockStatics(mesh, rule, rho)
    const heldPlacedX = greenSolve(
      tornMesh(mesh, placedHeld.horizon),
      rho,
      1e-12,
    ).x
    const sameHorizonA = greenSolve(
      tornMesh(mesh, a.horizon),
      countSource(mesh, rule, rho, a.horizon),
      1e-12,
    ).x
    const sameHorizonC1 = greenSolve(
      tornMesh(mesh, c1.horizon),
      rho,
      1e-12,
    ).x

    log('statics')

    const off = (x: Float64Array, ref: Float64Array): number =>
      Math.max(
        ...RADII.map(r =>
          Math.abs(
            axisForce(mesh, x, CENTER, r) /
              axisForce(mesh, ref, CENTER, r) -
              1,
          ),
        ),
      )
    const sameContent =
      b.rho.every((v, y) => v === rho[y]) &&
      c1.rho.every((v, y) => v === rho[y]) &&
      c2.rho.every((v, y) => v === rho[y])
    const placedSource = countSource(
      mesh,
      rule,
      rho,
      placedNoHair.horizon,
    )

    let rhoX = 0

    for (let y = 0; y < mesh.docks; y++) {
      rhoX += placedSource[y]! * placedNoHair.x[y]!
    }

    const energyStatic = ((Math.PI / DEPTH) * Math.abs(rhoX)) / 2
    const wrapsOf = (r: HorizonRecord): number =>
      r.wraps.fWraps + r.wraps.vWraps
    const exact = (s: Settled): boolean =>
      s.reversed &&
      s.record.gaussOff === 0 &&
      s.countOff === 0 &&
      s.record.curl === 0 &&
      s.record.verticalChecked > 0 &&
      s.record.restOff === 0 &&
      s.record.energyDrift <= ENERGY_TOLERANCE * energyStatic

    const h1 = wrapsOf(a.record) === 0 && wrapsOf(b.record) === 0
    const placedOff = off(a.depth, placedNoHair.x)
    const h2 = placedOff <= PLACED_TOLERANCE
    const orderOff = off(a.depth, b.depth)
    const h3 = sameContent && orderOff <= ORDER_TOLERANCE
    const h4 = exact(a) && exact(b)
    const c1PlacedOff = off(c1.depth, heldPlacedX)
    const c1Refuses = c1PlacedOff > PLACED_TOLERANCE
    const heldOrderOff = off(c1.depth, c2.depth)
    const c2Refuses = heldOrderOff > ORDER_TOLERANCE
    const c3Refuses = !c3.reversed
    const status =
      !c1Refuses || !c2Refuses || !c3Refuses
        ? 'partial'
        : h1 && h2 && h3 && h4
          ? 'pass'
          : 'fail'

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

    let horizonDiffer = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (a.horizon[y] !== b.horizon[y]) {
        horizonDiffer++
      }
    }

    let heldMax = 0

    for (let m = 0; m < mesh.links; m++) {
      if (tornLink(mesh, a.horizon, m)) {
        heldMax = Math.max(
          heldMax,
          Math.abs(a.final.step[m]!) / rule.unit,
        )
      }
    }

    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const forces = (x: Float64Array): string =>
      RADII.map(r => f(axisForce(mesh, x, CENTER, r))).join(', ')
    const metrics: Record<string, number> = {
      gate_H1: h1 ? 1 : 0,
      gate_H2: h2 ? 1 : 0,
      gate_H3: h3 ? 1 : 0,
      gate_H4: h4 ? 1 : 0,
      control_C1: c1Refuses ? 1 : 0,
      control_C2: c2Refuses ? 1 : 0,
      control_C3: c3Refuses ? 1 : 0,
      units: M,
      beats,
      A_wraps: wrapsOf(a.record),
      B_wraps: wrapsOf(b.record),
      C1_wraps: wrapsOf(c1.record),
      C2_wraps: wrapsOf(c2.record),
      A_reversed: a.reversed ? 1 : 0,
      B_reversed: b.reversed ? 1 : 0,
      C3_reversed: c3.reversed ? 1 : 0,
      A_gaussOff: a.record.gaussOff,
      B_gaussOff: b.record.gaussOff,
      gaussChecks: a.record.gaussChecks,
      A_countOff: a.countOff,
      B_countOff: b.countOff,
      A_curl: a.record.curl,
      B_curl: b.record.curl,
      A_liveChecked: a.record.liveChecked,
      A_restOff: a.record.restOff,
      B_restOff: b.record.restOff,
      A_energyDrift: a.record.energyDrift,
      B_energyDrift: b.record.energyDrift,
      energyStatic,
      A_huskStep: a.record.huskStep,
      B_huskStep: b.record.huskStep,
      A_verticalStep: a.record.verticalStep,
      B_verticalStep: b.record.verticalStep,
      A_heldUnread: heldMax,
      A_firstJoin: a.firstJoin,
      B_firstJoin: b.firstJoin,
      A_horizonDocks: docksOf(a.horizon),
      B_horizonDocks: docksOf(b.horizon),
      placed_horizonDocks: docksOf(placedNoHair.horizon),
      C1_horizonDocks: docksOf(c1.horizon),
      C2_horizonDocks: docksOf(c2.horizon),
      heldPlaced_horizonDocks: docksOf(placedHeld.horizon),
      A_horizonRadius: radiusOf(a.horizon),
      B_horizonRadius: radiusOf(b.horizon),
      placed_horizonRadius: radiusOf(placedNoHair.horizon),
      horizonDiffer,
      placedOff,
      orderOff,
      sameHorizonOff: off(a.depth, sameHorizonA),
      c1PlacedOff,
      c1SameHorizonOff: off(c1.depth, sameHorizonC1),
      heldOrderOff,
      A_downFlux: a.downFlux,
      A_upHorizon: a.upHorizon,
      A_returnUp: a.returnUp,
      C1_downFlux: c1.downFlux,
      C1_upHorizon: c1.upHorizon,
      C1_returnUp: c1.returnUp,
      sameContent: sameContent ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    RADII.forEach(r => {
      metrics[`A_force_r${r}`] = axisForce(mesh, a.depth, CENTER, r)
      metrics[`B_force_r${r}`] = axisForce(mesh, b.depth, CENTER, r)
      metrics[`placed_force_r${r}`] = axisForce(
        mesh,
        placedNoHair.x,
        CENTER,
        r,
      )
      metrics[`C1_force_r${r}`] = axisForce(mesh, c1.depth, CENTER, r)
      metrics[`C2_force_r${r}`] = axisForce(mesh, c2.depth, CENTER, r)
      metrics[`heldPlaced_force_r${r}`] = axisForce(
        mesh,
        heldPlacedX,
        CENTER,
        r,
      )
    })

    return verdict({
      status,
      claim: `E-GRV-0112's M = ${M} lump grown one unit every ${EVERY} beats under the clock criterion (cap ${CAP}) with the horizon sourcing only the count of lines through it, spread evenly over its verticals with carry, then ${SETTLE} beats: wraps ${wrapsOf(a.record)} (accretion) and ${wrapsOf(b.record)} (sweep); the settled force at r = 8 .. 11 ${forces(a.depth)} against the placed lump's ${forces(placedNoHair.x)} (off ${f(placedOff)}; on the run's own horizon ${f(metrics.sameHorizonOff!)}), and the sweep's ${forces(b.depth)} (off ${f(orderOff)}); horizons ${docksOf(a.horizon)} and ${docksOf(b.horizon)} docks (placed ${docksOf(placedNoHair.horizon)}), ${horizonDiffer} differing; reversed ${a.reversed} and ${b.reversed}, Gauss off ${a.record.gaussOff} and ${b.record.gaussOff}, count Gauss off ${a.countOff} and ${b.countOff}, curl ${a.record.curl} and ${b.record.curl}, energy between events ${e(a.record.energyDrift / energyStatic)} and ${e(b.record.energyDrift / energyStatic)} of the statics; controls: held tears off their placed lump by ${f(c1PlacedOff)} and their two orders apart by ${f(heldOrderOff)}, the erasing rule reversed ${c3.reversed}`,
      metrics,
      control: {
        c1: c1Refuses ? 1 : 0,
        c1PlacedOff,
        c2: c2Refuses ? 1 : 0,
        heldOrderOff,
        c3: c3Refuses ? 1 : 0,
      },
      notes: `L2. Gates H1 ${h1}, H2 ${h2} (${f(placedOff)}), H3 ${h3} (${f(orderOff)}, same content ${sameContent}), H4 ${h4}; controls C1 ${c1Refuses} (${f(c1PlacedOff)}; on its own horizon ${f(metrics.c1SameHorizonOff!)}), C2 ${c2Refuses} (${f(heldOrderOff)}), C3 ${c3Refuses}. Held rule forces r = 8 .. 11: accretion ${forces(c1.depth)}, sweep ${forces(c2.depth)}, its placed lump ${forces(heldPlacedX)}. First join: A ${a.firstJoin}, B ${b.firstJoin}. Husk step A ${f(a.record.huskStep)}, B ${f(b.record.huskStep)}; vertical A ${f(a.record.verticalStep)}, B ${f(b.record.verticalStep)}; the unread torn registers of A up to ${f(heldMax)}. Settled flux down through A's horizon ${f(a.downFlux)} (count ${rho.reduce((n, v, y) => n + (y < mesh.huskDocks && a.horizon[y] ? v : 0), 0)}), ${a.upHorizon} horizon verticals up, ${f(a.returnUp)} up through the verticals outside (held: ${f(c1.downFlux)}, ${c1.upHorizon}, ${f(c1.returnUp)}). Wraps C1 ${wrapsOf(c1.record)}, C2 ${wrapsOf(c2.record)}.`,
    })
  },
})
