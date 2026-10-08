// The horizon's flux budget, grown against placed (E-GRV-0116): under the held clock rule every slip-free growth order
// ends within 1.4 percent of every other, yet every one is 32 to 36 percent off the lump PLACED with its statics at
// r = 8 .. 11 (note/project/vibe/roadmap/research/discrete-gravity.md, "Measured, the wave horizon (E-GRV-0115 partial), and a
// reframe"). Where does the systematic gap come from, and which exterior is the right one?
//
// THE BUDGET (code/measure/horizon-flux). A horizon dock keeps only its vertical link live, so the content on the horizon
// leaves it by two routes: DOWN its verticals into the bulk, or OUT through the torn links on its rim, which carry a
// step only where one was held. A placed torn statics holds none, so all of it goes down. A grown lump's rim links tore
// while the lump was still filling and hold the step they had then.
//
// DISCLOSED PROBE (tmp/flux-probe1, before this file; diagnostic, the budget of E-GRV-0112's run on its own content):
// the grown horizon (894 docks, radius 6.08) holds 1600 units; 676 go down and 924 go OUT through held rim steps (407
// verticals point up). The placed statics on the SAME horizon sends all 1600 down; on its own horizon (779 docks, 5.83)
// also all 1600. The free statics (no horizon) would send 1105 out and 495 down through the same docks. So at r = 8 the
// husk carries 951 units in the grown field, 599 and 642 in the two placed ones, 1025 in the free one. Taking logs of the
// force at r = 8 (the worst radius): grown / held statics 0.9997 (waves 0.03 percent; the quarter means of the settle
// agree to under 1 percent, the horizon fixed at 894 docks from beat 320 of it), held statics / placed on the same
// horizon 1.36 (the partition: where the horizon's flux goes), placed same / placed own horizon 0.97 (the horizon's size
// and shape, 894 against 779 docks, pulls the other way by 3 percent). So the whole gap is FLUX GONE INTO THE BULK: the
// placed horizon sends 924 more units down, and the stack's massive modes (continuum masses 0.14, 0.32, 0.73) have not
// returned them to the husk by r = 8 .. 11: the husk's share of the flux through the sphere is 0.37, 0.47, 0.50, 0.52
// placed on the same horizon against 0.59, 0.61, 0.60, 0.59 grown, both heading to the zero mode's 8/15 = 0.533 from
// opposite sides, and the grown-over-placed husk flux (same horizon) falls 1.59, 1.30, 1.19, 1.14, 1.10, 1.08, 1.06
// over r = 8 .. 14.
//
// THE REFERENCE (derived). On the layered stack a source's husk field is its zero mode, which carries the total M
// whatever route the flux took, plus the massive modes, weighted by where the flux ENTERS (the husk or layer 1). So the
// continuum's exterior of a mass M with this kind of horizon is fixed by M and ONE more number, the fraction of the
// horizon's flux that leaves it along the husk rather than down, until r >> 1 / m_1 = 7.1 docks, where only M remains.
// The two one-number references each drop that number: THE PLACED LUMP sets it to 0 (the torn boundary value problem
// solved outright), THE FREE LUMP (Birkhoff: forming a horizon does not change the exterior) sets it to the no-horizon
// field's. Linearity gives the two-number law directly: the torn statics of a source rho with rim steps F_out held is
// x = x_P + G_torn(-div F_out), and the free statics is exactly x_P + G_torn(-div F_free) on the same torn mesh. If the
// held rim steps are the free ones scaled by one factor, beta = out_grown / out_free, then
//   x_grown = x_P + beta (x_free - x_P),
// a PREDICTION from the measured out-flux and two solves that read no held step. It holds if the rim tears with the
// free field's SHAPE frozen at a fraction of its size; it fails if the held steps carry the order's own pattern.
// From the probe's numbers by hand, beta = 924.8 / 1104.8 = 0.837 and the prediction is within 1.6 percent at r = 8 ..
// 11 on E-GRV-0112's own run (disclosed: run A below is that run, so A alone is not a test; B and C are).
//
// THE RUNS. E-GRV-0112's rule and schedule: D 16, three digits, bulk window 81, side 24, the warped shrinking stack of 3
// layers, cap 3/2 against dock 0, one unit every 2 beats, then 1024 beats with nothing added; the settled field the Hann
// average of the last 1024 beats.
//  A  M = 1600, the uniform accretion (code/measure/clock-horizon accretionOrder): E-GRV-0112's run.
//  B  M = 1600, outside-in (code/measure/wave-horizon outsideInOrder): E-GRV-0115's second order.
//  C  M = 1200, the uniform accretion, sinks spread from 9: a new content, horizon and beta.
//
// GATES, fixed before the first run of this file.
//  G1 each run: 0 wraps and reversed bit for bit (a slip-free history, the only kind the claim is about).
//  G2 THE TWO-NUMBER LAW: in each run the settled force along the axes within 3 percent of x_P + beta (x_free - x_P) at
//     every r = 8, 9, 10, 11, with beta that run's measured out-flux over the free statics' through the same rim, x_P the
//     torn statics on the run's own horizon with no held step, x_free the untorn statics.
//  G3 the instrument: Gauss over husk and bulk (content inside the 4d cylinder = flux out over every crossing link) to
//     1e-6 M at every r = 6 .. 14, for the grown, placed and free fields of every run; and on the horizon, content =
//     down + out to 1e-6 M.
//  CONTROLS, each must refuse in every run: K1 THE PLACED LUMP (clockStatics, its own horizon, the 32 percent reference)
//  more than 3 percent off the settled force at some r = 8 .. 11; K2 THE FREE LUMP more than 3 percent off at some r.
// Verdict: pass if G1 to G3 hold and both controls refuse in every run; partial if a control fails to refuse; fail
// otherwise.
// REPORTED: the budget per run (content, down, out, up verticals; husk and bulk flux through r = 6 .. 14 for the grown,
// placed and free fields), the horizon's shape (docks, radii, dipole, quadrupole), beta, the three factors of the gap
// (waves, partition, horizon), and run A's force by quarter of the settle.
//
// FIRST RUN (tmp/flux-budget-run1.log, 392 s, the record; no gate moved): FAIL, on G3 alone, and G3 failed on a gate
// written wrong, not on the physics. G1 holds: 0 wraps and bit-for-bit reversal in all three runs. G2 HOLDS: the
// two-number law is within 1.58, 1.78 and 0.59 percent (A, B, C) at every r = 8 .. 11, with beta 0.836, 0.890, 0.801.
// Both controls refuse in every run: the placed lump is 32.2, 34.1 and 22.4 percent off, the free lump 6.6, 5.3 and
// 5.1. G3 FAILS: Gauss is off by 0.025, 0.032, 0.035 units (the gate 1.6e-3 and 1.2e-3). WHY, read after the run from
// tmp/flux-probe1 (which printed each field's budget): the static solves close Gauss exactly (held statics 1600 =
// 675.20 + 924.80, the placed ones 1600 = 1600 + 0), and the miss is the GROWN field alone (1600 against 676.04 +
// 923.94). The rule's exact Gauss is div f = rho, on the lines. div F = rho, on the steps, holds only in a static
// field, and a Hann mean of a field still ringing misses it by the mean imbalance, here 1.6e-5 of M to 2.9e-5. The gate
// should have been set on the statics, or at the size of the settle's residual motion. It was not, so it stands as a
// fail.
// THE BUDGET, A (M = 1600): the grown horizon (894 docks to 6.08, dipole 45.5 docks, quadrupole 0.040) holds 1600;
// 676.0 go down and 923.9 go out through held rim steps, and 407 verticals point up. The placed one (779 docks to 5.83,
// dipole 134, quadrupole 0.025) sends all 1600 down. Husk flux through r = 6 .. 14: grown 917, 935, 951, 975, 853, 729,
// 568, 407, 285; placed 111, 417, 642, 779, 731, 651, 520, 380, 270; free 1103, 1054, 1025, 1023, 885, 751, 582, 415,
// 290; content inside 1600 to r = 9, then 1429, 1235, 982, 716, 499 as the sinks begin. The grown field is settled:
// its force equals the held statics' to 3e-4, and the quarter means of the settle agree to 0.9 percent.
// THE GAP at r = 8 (grown over placed, 1.3218) is waves 0.9997 x partition 1.3598 x horizon 0.9724: (a) flux sent into
// the bulk instead of along the husk, +36 percent; (b) horizon size and shape, -2.8 percent (894 docks against 779
// tear more rim and so pull the placed field down less, the wrong sign to explain the gap); (c) waves, -0.03 percent;
// (d) nothing else, since the three factors multiply to the whole exactly. B and C split the same way: partition 1.19
// to 1.44 and horizon 0.94 to 0.99.
// WHICH IS RIGHT. Neither one-number exterior is this rule's at r = 8 .. 11. The placed lump is the correct solution
// of the torn boundary problem, but no slip-free history reaches it. The free lump is Birkhoff's reference, the
// exterior unchanged by collapse, and it misses by 5 to 7 percent. What the rule does is freeze 80 to 89 percent of the
// free field's rim flux at the tear, in the free field's own shape, which is why every order agrees. The continuum's
// exterior of M with this horizon is M plus the fraction beta until r >> 1 / m_1 = 7.1 docks. Past that only M
// remains: the husk flux, grown over placed, falls 1.48, 1.25, 1.17, 1.12, 1.09, 1.07, 1.05 over r = 8 .. 14, both
// heading for the zero mode. On a side-24 box r = 8 .. 11 is 1.1 to 1.6 decay lengths out, so the box cannot reach the
// radius where the two agree. Grown is the closer of the two to the collapse-invariant exterior, and it is the one
// the rule can actually reach.
//
// Depth L2: a known construction (a brane-world horizon, and the layered stack's mode sum) read on an integer
// reversible rule; the two-number law is linear superposition on the stack, the claim is that the rule's history
// freezes the free field's shape.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; each unit of content added is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import {
  openMesh,
  warpClock,
  type OpenState,
} from '@/code/rule/open-husk'
import { horizonRule, tornLink } from '@/code/rule/horizon-husk'
import { clockHorizonRule, clockJoin } from '@/code/rule/clock-horizon'
import { compressLump } from '@/code/measure/step-depth'
import { greenSolve } from '@/code/measure/open-husk'
import {
  growthRun,
  newHorizonRecord,
  realHorizonDepth,
  tornMesh,
  type Addition,
} from '@/code/measure/horizon-husk'
import {
  accretionOrder,
  axisForce,
  clockStatics,
  routeUnits,
  spreadSinks,
} from '@/code/measure/clock-horizon'
import { outsideInOrder } from '@/code/measure/wave-horizon'
import {
  fluxBudget,
  horizonShape,
  stackDistance,
  staticFlux,
  type FluxBudget,
} from '@/code/measure/horizon-flux'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const SIDE = 24
const LAYERS = 3
const CAP = 1.5
const EVERY = 2
const SETTLE = 1024
const SAMPLE = 64
const SINKS_FROM = 9
const LAW_TOLERANCE = 0.03
const GAUSS_TOLERANCE = 1e-6
const RADII: readonly number[] = [8, 9, 10, 11]
const SPHERES: readonly number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14]
const CENTER = [12, 12, 12]
const QUARTERS = 4

type Plan = {
  name: string
  m: number
  order: 'accretion' | 'outside_in'
}

const PLANS: readonly Plan[] = [
  { name: 'A', m: 1600, order: 'accretion' },
  { name: 'B', m: 1600, order: 'outside_in' },
  { name: 'C', m: 1200, order: 'accretion' },
]

export default experiment({
  id: 'gravity/horizon-flux-budget',
  code: 'E-GRV-0116',
  title:
    "the held horizon's 32 percent gap from the placed lump is flux sent into the bulk, and its exterior is fixed by M plus one number, fail on G3 only (a Gauss gate set on a still-ringing field): E-GRV-0112's grown lump sends 924 of its 1600 units out through held rim steps and 676 down, where the placed lump sends all 1600 down; at r = 8 the gap is partition +36 percent, horizon size -2.8, waves -0.03; the settled force equals x_placed + beta (x_free - x_placed), beta the measured rim flux over the free lump's (0.84, 0.89, 0.80), to 1.6, 1.8 and 0.6 percent on accretion, outside-in and M = 1200, 0 wraps, while the placed lump (22 to 34 percent) and the free lump (5 to 7 percent) each refuse; grown and placed differ only in massive modes the side-24 box cannot outrun",
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
    const distance = stackDistance(mesh, CENTER)
    const forceAt = (x: ArrayLike<number>): number[] =>
      RADII.map(r => axisForce(mesh, x, CENTER, r))
    const off = (p: readonly number[], q: readonly number[]): number =>
      Math.max(...p.map((v, i) => Math.abs(v / q[i]! - 1)))
    const metrics: Record<string, number> = {}
    const lines: string[] = []
    const f = (v: number): string => v.toPrecision(4)

    let g1 = true
    let g2 = true
    let g3 = true
    let k1 = true
    let k2 = true

    for (const plan of PLANS) {
      const sinks = spreadSinks(mesh, CENTER, plan.m, SINKS_FROM)
      const lump = compressLump(
        radionMesh([SIDE, SIDE, SIDE]),
        CENTER,
        plan.m,
        1,
        sinks,
      )
      const order =
        plan.order === 'accretion'
          ? accretionOrder(mesh, lump.content, CENTER)
          : outsideInOrder(mesh, lump.content, CENTER)
      const additions: Addition[] = routeUnits(mesh, order, sinks).map(
        (u, i) => ({
          beat: EVERY * i,
          at: u.at,
          sink: u.sink,
          path: u.path,
        }),
      )
      const growEnd = EVERY * (plan.m - 1) + 1
      const beats = growEnd + SETTLE
      const quarter = SETTLE / QUARTERS
      const mean = new Float64Array(mesh.links)
      const quarterMean = Array.from(
        { length: QUARTERS },
        () => new Float64Array(mesh.links),
      )

      let weight = 0

      const record = newHorizonRecord()
      const run = growthRun(
        mesh,
        rule,
        additions,
        beats,
        record,
        CENTER,
        SAMPLE,
        (t: number, s: OpenState) => {
          if (t <= growEnd) {
            return
          }

          const w = Math.sin((Math.PI * (t - growEnd)) / SETTLE) ** 2
          const k = Math.min(
            QUARTERS - 1,
            Math.floor((t - growEnd - 1) / quarter),
          )

          for (let m = 0; m < mesh.links; m++) {
            const F = s.step[m]! / rule.unit

            mean[m] = mean[m]! + w * F
            quarterMean[k]![m] = quarterMean[k]![m]! + F / quarter
          }

          weight += w
        },
        false,
        (s, h) => clockJoin(mesh, rule, s, h),
      )

      for (let m = 0; m < mesh.links; m++) {
        mean[m] = mean[m]! / weight
      }

      log(`run ${plan.name}`)

      const rho = run.rho
      const horizon = run.horizon
      const torn = tornMesh(mesh, horizon)
      // the held steps as sources, for the held statics (the waves' share of the gap)
      const held = new Float64Array(mesh.links)
      const source = Float64Array.from(rho)

      for (let m = 0; m < mesh.links; m++) {
        if (!tornLink(mesh, horizon, m)) {
          continue
        }

        const v = run.final.step[m]! / rule.unit

        held[m] = v
        source[mesh.tail[m]!] = source[mesh.tail[m]!]! - v
        source[mesh.head[m]!] = source[mesh.head[m]!]! + v
      }

      const xGrown = realHorizonDepth(mesh, mean, horizon)
      const xHeld = greenSolve(torn, source, 1e-12).x
      const xPlaced = greenSolve(torn, rho, 1e-12).x
      const own = clockStatics(mesh, rule, rho)
      const xFree = greenSolve(mesh, rho, 1e-12).x
      const none = new Uint8Array(mesh.huskDocks)
      const bGrown = fluxBudget(
        mesh,
        mean,
        rho,
        horizon,
        distance,
        SPHERES,
      )
      const bHeld = fluxBudget(
        mesh,
        staticFlux(mesh, xHeld, horizon, held),
        rho,
        horizon,
        distance,
        SPHERES,
      )
      const bPlaced = fluxBudget(
        mesh,
        staticFlux(mesh, xPlaced, horizon),
        rho,
        horizon,
        distance,
        SPHERES,
      )
      const bOwn = fluxBudget(
        mesh,
        staticFlux(mesh, own.torn, own.horizon),
        rho,
        own.horizon,
        distance,
        SPHERES,
      )
      const bFree = fluxBudget(
        mesh,
        staticFlux(mesh, xFree, none),
        rho,
        horizon,
        distance,
        SPHERES,
      )
      const beta = bGrown.out / bFree.out
      const xLaw = Float64Array.from(
        xPlaced,
        (v, y) => v + beta * (xFree[y]! - v),
      )
      const fGrown = forceAt(xGrown)
      const fLaw = forceAt(xLaw)
      const fOwn = forceAt(own.torn)
      const fFree = forceAt(xFree)
      const fHeld = forceAt(xHeld)
      const fPlaced = forceAt(xPlaced)
      const wraps = record.wraps.fWraps + record.wraps.vWraps
      const lawOff = off(fGrown, fLaw)
      const ownOff = off(fGrown, fOwn)
      const freeOff = off(fGrown, fFree)
      const all: FluxBudget[] = [bGrown, bHeld, bPlaced, bOwn, bFree]
      const gaussOff = Math.max(
        ...all.map(b => b.gaussOff),
        ...all.map(b => Math.abs(b.horizonContent - b.down - b.out)),
      )
      const ok1 = wraps === 0 && run.reversed && record.reversed
      const ok2 = lawOff <= LAW_TOLERANCE
      const ok3 = gaussOff <= GAUSS_TOLERANCE * plan.m
      const r1 = ownOff > LAW_TOLERANCE
      const r2 = freeOff > LAW_TOLERANCE

      g1 &&= ok1
      g2 &&= ok2
      g3 &&= ok3
      k1 &&= r1
      k2 &&= r2

      const p = plan.name
      const shape = horizonShape(mesh, horizon, CENTER)
      const ownShape = horizonShape(mesh, own.horizon, CENTER)

      Object.assign(metrics, {
        [`${p}_M`]: plan.m,
        [`${p}_wraps`]: wraps,
        [`${p}_reversed`]: ok1 ? 1 : 0,
        [`${p}_beta`]: beta,
        [`${p}_lawOff`]: lawOff,
        [`${p}_placedOff`]: ownOff,
        [`${p}_freeOff`]: freeOff,
        [`${p}_placedSameHorizonOff`]: off(fGrown, fPlaced),
        [`${p}_heldStaticsOff`]: off(fGrown, fHeld),
        [`${p}_gaussOff`]: gaussOff,
        [`${p}_horizonContent`]: bGrown.horizonContent,
        [`${p}_down`]: bGrown.down,
        [`${p}_out`]: bGrown.out,
        [`${p}_upVerticals`]: bGrown.upVerticals,
        [`${p}_freeOut`]: bFree.out,
        [`${p}_freeDown`]: bFree.down,
        [`${p}_placedDown`]: bOwn.down,
        [`${p}_horizonDocks`]: shape.docks,
        [`${p}_horizonRMax`]: shape.rMax,
        [`${p}_horizonRMean`]: shape.rMean,
        [`${p}_horizonDipole`]: shape.dipole,
        [`${p}_horizonQuadrupole`]: shape.quadrupole,
        [`${p}_placedHorizonDocks`]: ownShape.docks,
        [`${p}_placedHorizonRMax`]: ownShape.rMax,
        [`${p}_placedHorizonDipole`]: ownShape.dipole,
        [`${p}_placedHorizonQuadrupole`]: ownShape.quadrupole,
      })

      RADII.forEach((r, i) => {
        metrics[`${p}_force_r${r}`] = fGrown[i]!
        metrics[`${p}_law_r${r}`] = fLaw[i]!
        metrics[`${p}_placed_r${r}`] = fOwn[i]!
        metrics[`${p}_free_r${r}`] = fFree[i]!
        // the three factors of grown over placed: waves, partition, horizon
        metrics[`${p}_waves_r${r}`] = fGrown[i]! / fHeld[i]!
        metrics[`${p}_partition_r${r}`] = fHeld[i]! / fPlaced[i]!
        metrics[`${p}_horizon_r${r}`] = fPlaced[i]! / fOwn[i]!
      })

      SPHERES.forEach((r, i) => {
        metrics[`${p}_inside_r${r}`] = bGrown.inside[i]!
        metrics[`${p}_huskGrown_r${r}`] = bGrown.husk[i]!
        metrics[`${p}_bulkGrown_r${r}`] = bGrown.bulk[i]!
        metrics[`${p}_huskPlaced_r${r}`] = bOwn.husk[i]!
        metrics[`${p}_bulkPlaced_r${r}`] = bOwn.bulk[i]!
        metrics[`${p}_huskFree_r${r}`] = bFree.husk[i]!
      })

      const quarters = quarterMean.map(q =>
        forceAt(realHorizonDepth(mesh, q, horizon)),
      )

      quarters.forEach((q, k) =>
        q.forEach(
          (v, i) => (metrics[`${p}_q${k + 1}_force_r${RADII[i]}`] = v),
        ),
      )

      const drift = Math.max(
        ...quarters.slice(1).map(q => off(q, quarters[0]!)),
      )

      metrics[`${p}_quarterDrift`] = drift
      lines.push(
        `${p} (M ${plan.m}, ${plan.order}): wraps ${wraps}, reversed ${ok1}; horizon ${shape.docks} docks to ${f(shape.rMax)} (placed ${ownShape.docks} to ${f(ownShape.rMax)}), dipole ${f(shape.dipole)}, quadrupole ${f(shape.quadrupole)}; content ${f(bGrown.horizonContent)} = down ${f(bGrown.down)} + out ${f(bGrown.out)} (${bGrown.upVerticals} verticals up), free out ${f(bFree.out)}, placed down ${f(bOwn.down)}; beta ${f(beta)}; force r = 8 .. 11 grown ${fGrown.map(f).join(', ')}, law ${fLaw.map(f).join(', ')} (off ${f(lawOff)}), placed ${fOwn.map(f).join(', ')} (off ${f(ownOff)}), free ${fFree.map(f).join(', ')} (off ${f(freeOff)}); factors waves ${RADII.map(r => f(metrics[`${p}_waves_r${r}`]!)).join(', ')}, partition ${RADII.map(r => f(metrics[`${p}_partition_r${r}`]!)).join(', ')}, horizon ${RADII.map(r => f(metrics[`${p}_horizon_r${r}`]!)).join(', ')}; husk flux r = 6 .. 14 grown ${bGrown.husk.map(f).join(', ')}, placed ${bOwn.husk.map(f).join(', ')}, free ${bFree.husk.map(f).join(', ')}; inside ${bGrown.inside.map(f).join(', ')}; Gauss off ${gaussOff.toExponential(2)}; quarter drift ${f(drift)}`,
      )
    }

    const status =
      !k1 || !k2 ? 'partial' : g1 && g2 && g3 ? 'pass' : 'fail'

    Object.assign(metrics, {
      gate_G1: g1 ? 1 : 0,
      gate_G2: g2 ? 1 : 0,
      gate_G3: g3 ? 1 : 0,
      control_K1: k1 ? 1 : 0,
      control_K2: k2 ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    })

    return verdict({
      status,
      claim: `the held clock horizon's settled exterior at r = 8 .. 11 against x_P + beta (x_free - x_P), beta the measured out-flux through the rim over the free statics': ${PLANS.map(pl => `${pl.name} (M ${pl.m}, ${pl.order}) beta ${f(metrics[`${pl.name}_beta`]!)}, law off ${f(metrics[`${pl.name}_lawOff`]!)}, placed off ${f(metrics[`${pl.name}_placedOff`]!)}, free off ${f(metrics[`${pl.name}_freeOff`]!)}`).join('; ')}`,
      metrics,
      control: { k1: k1 ? 1 : 0, k2: k2 ? 1 : 0 },
      notes: `L2. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}; controls K1 ${k1}, K2 ${k2}. ${lines.join(' | ')}`,
    })
  },
})
