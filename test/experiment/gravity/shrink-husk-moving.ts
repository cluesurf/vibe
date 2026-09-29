// CORRECTION (read with E-GRV-0103): the front readings below (1.26 c, 1.40 c) are the front witness's near-field bias,
// not a path through the bulk. The husk ALONE, with no bulk, reads 1.166 c and 1.397 c by the same method (E-GRV-0103),
// and the warped stack reads at or under it. Any line of this header that blames the fast front on the unwarped bulk
// clock is superseded by that calibration. The gate D2 still fails as it was written; the record is unchanged.
//
// The shrinking husk, moving (E-GRV-0101): E-GRV-0095's dynamics gates on E-GRV-0100's geometry, the husk backed by
// layers that shrink inward (code/rule/open-husk growth 'shrink': the {3,4,3,4}'s orientation and Randall-Sundrum II's),
// content lines on the husk only and closed on a sink at the antipode (E-GRV-0100's header gives the geometry, the
// curvature length 3.53 husk docks, and why the antipode). Does a moving source keep the registers exact and bounded,
// does the pull's front run at c on the husk, do lumps fall alike, and is the energy kept?
//
// PREDICTIONS, stated before the run from the geometry alone:
//  - FRONT: every dock of every layer beats once a beat with the same kappa, so layer k's waves run at c(16) in ITS OWN
//    docks, 2^k c in husk docks. The zero mode (every layer moving together) has stiffness sum_k 6 / 2^k and inertia
//    sum_k 8^-k per husk dock, so it runs at c sqrt((31 / 16) / 1.14282) = 1.302 c for four layers (0.31 c for
//    E-GRV-0095's growing bulk, which read 0.54 .. 0.64 c at d = 3 .. 7). RS II keeps the brane's c because its bulk's
//    time is warped with its space; this stack's is not. So the long-wavelength pull is predicted FASTER than light by
//    up to 30 percent, and the short-range front, dominated by the husk and the first layer, somewhere between c and
//    that. The rule's hard cone is one link a beat over every link, and through the bulk the fewest links to (0, d, 0)
//    are fewer than d once d passes 4 (down, across a coarse layer, up): measured, and gated in link counts.
//  - D1: the shrinking stack is finite and closed (the bulk holds 1.14 times the husk's docks), so unlike E-GRV-0095 the
//    radiation has nowhere to go, as on E-GRV-0091's closed husk (which pumped to 1.48 and wrapped 30 times on side 16);
//    on side 32 the same kicks spread over 8 times the docks.
//
// RETURN TIME, stated: D2's husk is side 64; the hop's image is 64 docks away, so its radiation comes back to (0, d, 0)
// no sooner than (64 - d) / c = 259 beats at c for d = 12 and 199 beats at the zero mode's 1.302 c; the window is 128
// beats after the hop. The coarse layers run faster (layer 4 at 16 c crosses its side in 20 beats), but the hop moves
// content between two docks that share their dock in EVERY layer, so it reaches a coarse layer only through the husk's
// lateral difference: stated, not excluded. D1 is the opposite on purpose: side 32 (return 159 beats) over 4096 beats,
// the stress test of bounded registers in a closed box, not a reading.
//
// GATES, fixed before the first run of this file (D 16, three digits, kappa = 2 / 297, c(16) = 0.20101):
//  D1 exact and bounded over a moving source: a content-4 source on the side-32 husk (3 shrinking layers, sides 16, 8,
//     4), its sink at the antipode, hopping one dock along x and back every 256 beats (15 hops of 4 units, on husk links
//     only) over 4096 beats: Gauss 0 off on every dock of husk and bulk after every beat, curl 0 on every check, 0 wraps,
//     the run reverses to its start bit for bit, lines included. REPORTED: the largest husk step in each 256-beat window
//     and the husk's share of the field energy at the end of each.
//  D2 the front at c: a content-4 source at the origin of the side-64 husk (4 shrinking layers), its sink at the
//     antipode; in one run it hops to (1, 0, 0) after beat 32, in the other it stays; compared for 128 beats after the
//     hop at (0, d, 0), d = 2 .. 12: (a) no register there (rate, remainder, the nine out-links' steps and lines, the
//     down-link's step) differs on the first beat after the hop; (b) none differs before the fewest links from the hop's
//     two docks to it, over husk and bulk (the rule's one-link-a-beat cone); (c) the radial step's change (out-link +y)
//     read at its HALF MAXIMUM, (d) at its first 25 percent and (e) at its first 10 percent, each fitted as t0 + rho / v
//     on d = 3 .. 12 (rho from the hop's midpoint to the link's), give v within 10 percent of c(16), all three.
//     REPORTED: the first change against the husk distance d.
//  D3 fall alike: the content-4 source at the origin of the side-32 stack and a test lump of 1 love or 3 fear at
//     (3, 0, 0) and (5, 0, 0), every content's sink at the antipode, W = E(A + B) - E(A) - E(B) from the Hann average of
//     1024 beats (E(B) read at each r: the octree is not carried into itself by a one-dock translation), a = -(W(5) -
//     W(3)) / 2 / content (INERTIA IS A STAND-IN: content): both a < 0, alike to 1e-6, each within 1e-3 of the linear
//     solve's. REPORTED: a against E-GRV-0080's closed husk -6.41986e-4.
//  D4 energy: a content-4 lump on the side-16 husk (2 shrinking layers, sides 8, 4) at (2, 2, 2), its sink at the
//     antipode, from zero field, 4096 beats, E of husk plus bulk every 64 beats (depth found from dock 0): at three
//     digits max |E - E(0)| at most 1e-4 of the size of its static energy, falling at every added digit from one to
//     three; the field part >= 0 at every sample; the found and local source terms agree to 1e-9. REPORTED: the husk's
//     share of the field energy.
// FIRST RUN (tmp/grv98-run1.log, run as E-GRV-0098 and renumbered to E-GRV-0101 before registering; 211 s, the record):
// fail on D2, no gate moved. D1 holds: 15 hops of 4 units over 4,096 beats, Gauss 0 off on 4,096 beat checks, curl 0,
// 0 wraps, reversal bit for bit; the largest husk step per 256 beats is 0.60, then 0.87 and flat to slowly DOWN (0.80 ..
// 0.85), not climbing as E-GRV-0091's closed side-16 husk did, with the husk holding 0.95 .. 0.96 of the field energy
// (the bulk takes little: it has 0.14 of the husk's docks). D2: nothing changes on the next beat, the first change (2,
// 3, 4, 6, 8, 11, 14, 15, 18, 18, 22 beats at d = 2 .. 12) is inside the link cone (2 .. 7) and the husk's own d, but
// the front is FAST, as predicted: its first 10 percent reads 1.26 c and its first 25 percent 1.40 c, beside the zero
// mode's predicted 1.30 c; the half maximum is not a front here (44, 34, 106, 26, 51 .. 70 beats, 3.37 c by the fit)
// because near the hop the pulse's maximum is the static shift the window ends on. D3 holds: -5.0448e-4 per unit
// content for a 1-love and a 3-fear lump, alike to 3.7e-12, the linear solve's to 7e-9. D4 holds: drift 2.8e2, 3.0e-3,
// 1.4e-5 of the static energy at 1 .. 3 digits, field part >= 0, found and local source terms 6.1e-16 apart. Title
// written after the run.
//
// Verdict: pass if D1 to D4 hold; fail otherwise. (No control of its own: E-GRV-0094's B0 holds the open rule to
// E-GRV-0090's bit for bit, and E-GRV-0100's C0 holds the method.)
//
// Depth L2: the radion's known construction on bounded registers in a layered bulk. DETERMINISM: every start and
// source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule; a hop is a scheduled
// event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { stepRule } from '@/code/rule/step-depth'
import {
  emptyOpen,
  huskOnly,
  openBeat,
  openMesh,
  openScratch,
  placeOpenLines,
  type OpenState,
} from '@/code/rule/open-husk'
import {
  greenSolve,
  huskDock,
  huskMaxStep,
  linkDistance,
  newOpenRecord,
  openContent,
  openEnergy,
  openHopRun,
  openStaticRun,
  type OpenHop,
} from '@/code/measure/open-husk'

const DEPTH = 16
const LEVELS = 3
const SOURCE = 4
const LONG_SIDE = 32
const LONG_LAYERS = 3
const LONG_BEATS = 4096
const LONG_EVERY = 256
const HOP_SIDE = 64
const HOP_LAYERS = 4
const HOP_AT = 32
const HOP_WINDOW = 128
const HOP_D: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const FIT_FROM = 3
const SPEED_TOLERANCE = 0.1
const FALL_SIDE = 32
const FALL_LAYERS = 3
const FALL_R: readonly number[] = [3, 5]
const STATIC_BEATS = 1024
const RECORDED_0080 = -6.41986e-4
const ENERGY_SIDE = 16
const ENERGY_LAYERS = 2
const ENERGY_BEATS = 4096
const ENERGY_EVERY = 64

type Watch = {
  v: number
  r: number
  steps: number[]
  lines: number[]
  down: number
  radial: number
}

const differs = (a: Watch, b: Watch): boolean =>
  a.v !== b.v ||
  a.r !== b.r ||
  a.down !== b.down ||
  a.steps.some((x, i) => x !== b.steps[i]) ||
  a.lines.some((x, i) => x !== b.lines[i])

const firstAt = (series: number[], share: number): number => {
  const top = Math.max(...series.map(Math.abs))

  return series.findIndex(x => Math.abs(x) >= top * share) + 1
}

const slopeOf = (
  ys: readonly number[],
  xs: readonly number[],
): number => {
  const mx = xs.reduce((a, v) => a + v, 0) / xs.length
  const my = ys.reduce((a, v) => a + v, 0) / ys.length

  return (
    xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0) /
    xs.reduce((a, v) => a + (v - mx) ** 2, 0)
  )
}

const antipode = (side: number): number[] => [
  side / 2,
  side / 2,
  side / 2,
]

export default experiment({
  id: 'gravity/shrink-husk-moving',
  code: 'E-GRV-0101',
  title:
    "on a husk backed by shrinking layers the pull's front outruns light by about the zero mode's 1.30, fail on D2: after a hop nothing changes on the next beat and the first change stays inside the link cone, but the front's first 10 percent reads 1.26 c and its first 25 percent 1.40 c (the half maximum is swamped by the static shift near the hop), because every layer beats one clock so the coarser layers carry waves faster in husk docks; 15 hops of 4 units over 4,096 beats keep Gauss, curl 0, 0 wraps and reverse bit for bit, the largest husk step flat at 0.80 .. 0.87; lumps fall alike to 3.7e-12 at -5.04e-4 per unit content; energy drifts 1.4e-5 of the static at three digits",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const rule = stepRule(DEPTH, LEVELS)
    const c = lightSpeed(DEPTH)
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)

    // D1
    const longMesh = openMesh(LONG_SIDE, LONG_LAYERS, 'shrink')
    const longAllow = huskOnly(longMesh)
    const longRecord = newOpenRecord()
    const hops: OpenHop[] = []

    for (let k = 1; k * LONG_EVERY < LONG_BEATS; k++) {
      hops.push({
        beat: k * LONG_EVERY,
        from: k % 2 === 1 ? [0, 0, 0] : [1, 0, 0],
        to: k % 2 === 1 ? [1, 0, 0] : [0, 0, 0],
        units: SOURCE,
      })
    }

    const windowMax: number[] = []
    const windowShare: number[] = []

    let running = 0

    const longRun = openHopRun(
      longMesh,
      rule,
      openContent(longMesh, [
        { at: [0, 0, 0], units: SOURCE, to: antipode(LONG_SIDE) },
      ]),
      hops,
      LONG_BEATS,
      longRecord,
      (t, s, rho) => {
        if (t === 0) {
          return
        }

        running = Math.max(running, huskMaxStep(longMesh, rule, s))

        if (t % LONG_EVERY === 0) {
          const en = openEnergy(longMesh, rule, s, rho)

          windowMax.push(running)
          windowShare.push(en.huskFree / en.free)
          running = 0
        }
      },
      longAllow,
    )
    const longWraps = longRecord.wraps.fWraps + longRecord.wraps.vWraps
    const d1 =
      longRun.reversed &&
      longRecord.gaussOff === 0 &&
      longRecord.curl === 0 &&
      longWraps === 0

    log('long')

    // D2
    const mesh = openMesh(HOP_SIDE, HOP_LAYERS, 'shrink')
    const allow = huskOnly(mesh)
    const hopRecord = newOpenRecord()
    const rho0 = openContent(mesh, [
      { at: [0, 0, 0], units: SOURCE, to: antipode(HOP_SIDE) },
    ])
    const docks = HOP_D.map(d => huskDock(mesh, [0, d, 0]))
    const reach = linkDistance(mesh, [
      huskDock(mesh, [0, 0, 0]),
      huskDock(mesh, [1, 0, 0]),
    ])
    const cone = docks.map(y => reach[y]!)
    // the one vertical link of a husk dock (shrink: layer 0's verticals first, in dock order)
    const downOf = (y: number): number => mesh.docks * 9 + y
    const traceA: Watch[][] = []
    const traceB: Watch[][] = []

    const keep =
      (trace: Watch[][]) =>
      (t: number, s: OpenState): void => {
        if (t <= HOP_AT) {
          return
        }

        trace.push(
          docks.map(y => ({
            v: s.rate[y]!,
            r: s.rest[y]!,
            steps: Array.from(
              { length: 9 },
              (_, h) => s.step[y * 9 + h]!,
            ),
            lines: Array.from(
              { length: 9 },
              (_, h) => s.line[y * 9 + h]!,
            ),
            down: s.step[downOf(y)]!,
            radial: s.step[y * 9 + 1]!,
          })),
        )
      }

    openHopRun(
      mesh,
      rule,
      rho0,
      [],
      HOP_AT + HOP_WINDOW,
      hopRecord,
      keep(traceA),
      allow,
    )

    openHopRun(
      mesh,
      rule,
      rho0,
      [{ beat: HOP_AT, from: [0, 0, 0], to: [1, 0, 0], units: SOURCE }],
      HOP_AT + HOP_WINDOW,
      hopRecord,
      keep(traceB),
      allow,
    )

    const firstChange = HOP_D.map(
      (_, i) =>
        traceA.findIndex((w, k) => differs(w[i]!, traceB[k]![i]!)) + 1,
    )
    const noInstant = HOP_D.every(
      (_, i) => !differs(traceA[0]![i]!, traceB[0]![i]!),
    )
    const inCone = firstChange.every((k, i) => k === 0 || k >= cone[i]!)
    const pulse = HOP_D.map((_, i) =>
      traceA.map(
        (w, k) => (traceB[k]![i]!.radial - w[i]!.radial) / rule.unit,
      ),
    )
    const half = pulse.map(p => firstAt(p, 0.5))
    const quarter = pulse.map(p => firstAt(p, 0.25))
    const tenth = pulse.map(p => firstAt(p, 0.1))
    const rhoD = HOP_D.map(d => Math.sqrt(0.25 + (d + 0.5) ** 2))
    const from = HOP_D.indexOf(FIT_FROM)
    const speed = (t: number[]): number =>
      1 / slopeOf(t.slice(from), rhoD.slice(from))
    const speedHalf = speed(half)
    const speedQuarter = speed(quarter)
    const speedTenth = speed(tenth)
    const atC = (v: number): boolean =>
      Math.abs(v / c - 1) <= SPEED_TOLERANCE
    const d2 =
      noInstant &&
      inCone &&
      firstChange.every(k => k > 0) &&
      atC(speedHalf) &&
      atC(speedQuarter) &&
      atC(speedTenth) &&
      hopRecord.reversed &&
      hopRecord.gaussOff === 0
    const zeroModeSpeed =
      c *
      Math.sqrt(
        mesh.sides.reduce(
          (t, s) =>
            t + (6 * (s / HOP_SIDE) ** 3 * (HOP_SIDE / s) ** 2) / 6,
          0,
        ) / mesh.sides.reduce((t, s) => t + (s / HOP_SIDE) ** 3, 0),
      )

    log('hop')

    // D3
    const fallMesh = openMesh(FALL_SIDE, FALL_LAYERS, 'shrink')
    const fallAllow = huskOnly(fallMesh)
    const fallRecord = newOpenRecord()
    const z = antipode(FALL_SIDE)
    const run = (sources: { at: number[]; units: number }[]): number =>
      openStaticRun(
        fallMesh,
        rule,
        openContent(
          fallMesh,
          sources.map(s => ({ ...s, to: z })),
        ),
        STATIC_BEATS,
        fallRecord,
        fallAllow,
      ).energy
    const eA = run([{ at: [0, 0, 0], units: SOURCE }])
    const fall = (units: number): number[] =>
      FALL_R.map(r => {
        const eB = run([{ at: [r, 0, 0], units }])

        return (
          run([
            { at: [0, 0, 0], units: SOURCE },
            { at: [r, 0, 0], units },
          ]) -
          eA -
          eB
        )
      })
    const light = fall(1)
    const heavy = fall(3)
    const accel = (w: number[], units: number): number =>
      -(w[1]! - w[0]!) / (FALL_R[1]! - FALL_R[0]!) / units
    const aLight = accel(light, 1)
    const aHeavy = accel(heavy, 3)
    const g = greenSolve(
      fallMesh,
      openContent(fallMesh, [{ at: [0, 0, 0], units: SOURCE, to: z }]),
    )
    const wLinear = FALL_R.map(
      r => -(Math.PI / DEPTH) * g.x[huskDock(fallMesh, [r, 0, 0])]!,
    )
    const aWant = accel(wLinear, 1)
    const alike = Math.abs(aLight / aHeavy - 1)
    const d3 =
      aLight < 0 &&
      aHeavy < 0 &&
      alike <= 1e-6 &&
      Math.abs(aLight / aWant - 1) <= 1e-3 &&
      Math.abs(aHeavy / aWant - 1) <= 1e-3 &&
      fallRecord.reversed &&
      fallRecord.gaussOff === 0 &&
      fallRecord.wraps.fWraps + fallRecord.wraps.vWraps === 0

    log('fall')

    // D4
    const eMesh = openMesh(ENERGY_SIDE, ENERGY_LAYERS, 'shrink')
    const lumpRho = openContent(eMesh, [
      {
        at: [2, 2, 2],
        units: SOURCE,
        to: [
          2 + ENERGY_SIDE / 2,
          2 + ENERGY_SIDE / 2,
          2 + ENERGY_SIDE / 2,
        ],
      },
    ])
    const eg = greenSolve(eMesh, lumpRho)

    let rx = 0

    for (let y = 0; y < eMesh.docks; y++) {
      rx += lumpRho[y]! * eg.x[y]!
    }

    const staticEnergy = -(Math.PI / DEPTH) * 0.5 * rx

    const energyRun = (
      levels: number,
    ): {
      drift: number
      leastFree: number
      sourceGap: number
      samples: number[]
      share: number[]
      wraps: number
    } => {
      const r = stepRule(DEPTH, levels)
      const s = emptyOpen(eMesh)
      const sc = openScratch(eMesh)
      const tally = { vWraps: 0, fWraps: 0 }

      s.line.set(placeOpenLines(eMesh, lumpRho, 1, huskOnly(eMesh)))

      const samples: number[] = []
      const share: number[] = []

      let leastFree = Infinity
      let sourceGap = 0

      const sample = (): void => {
        const en = openEnergy(eMesh, r, s, lumpRho)

        samples.push(en.energy)
        share.push(en.free > 0 ? en.huskFree / en.free : 0)
        leastFree = Math.min(leastFree, en.free)
        sourceGap = Math.max(
          sourceGap,
          Math.abs(en.sourceFound - en.sourceLocal) /
            Math.max(1e-300, Math.abs(en.sourceLocal)),
        )
      }

      sample()

      for (let t = 1; t <= ENERGY_BEATS; t++) {
        openBeat(eMesh, r, s, sc, tally)

        if (t % ENERGY_EVERY === 0) {
          sample()
        }
      }

      return {
        drift:
          Math.max(...samples.map(x => Math.abs(x - samples[0]!))) /
          Math.abs(staticEnergy),
        leastFree,
        sourceGap,
        samples,
        share,
        wraps: tally.fWraps + tally.vWraps,
      }
    }

    const byLevel = [1, 2, 3].map(energyRun)
    const three = byLevel[2]!
    const d4 =
      three.drift <= 1e-4 &&
      byLevel[0]!.drift > byLevel[1]!.drift &&
      byLevel[1]!.drift > three.drift &&
      three.leastFree >= 0 &&
      three.sourceGap <= 1e-9

    log('energy')

    const status = d1 && d2 && d3 && d4 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(4)
    const e = (x: number): string => x.toExponential(2)
    const metrics: Record<string, number> = {
      gate_D1: d1 ? 1 : 0,
      gate_D2: d2 ? 1 : 0,
      gate_D3: d3 ? 1 : 0,
      gate_D4: d4 ? 1 : 0,
      longBeats: LONG_BEATS,
      longHops: hops.length,
      longGaussOff: longRecord.gaussOff,
      longGaussChecks: longRecord.gaussChecks,
      longCurl: longRecord.curl,
      longWraps,
      longMaxStep: longRecord.maxStep,
      longReversed: longRun.reversed ? 1 : 0,
      scalarSpeed: c,
      zeroModeSpeed,
      zeroModeSpeedRatio: zeroModeSpeed / c,
      speedHalf,
      speedHalfRatio: speedHalf / c,
      speedQuarter,
      speedQuarterRatio: speedQuarter / c,
      speedTenth,
      speedTenthRatio: speedTenth / c,
      hopReversed: hopRecord.reversed ? 1 : 0,
      hopWraps: hopRecord.wraps.fWraps + hopRecord.wraps.vWraps,
      aLight,
      aHeavy,
      aWant,
      alike,
      a0080: RECORDED_0080,
      staticEnergy,
      seconds: (Date.now() - started) / 1000,
    }

    windowMax.forEach((v, i) => (metrics[`longWindowMax_${i + 1}`] = v))
    windowShare.forEach(
      (v, i) => (metrics[`longWindowHuskShare_${i + 1}`] = v),
    )

    HOP_D.forEach((d, i) => {
      metrics[`hopFirstChange_d${d}`] = firstChange[i]!
      metrics[`hopLinkCone_d${d}`] = cone[i]!
      metrics[`hopHalf_d${d}`] = half[i]!
      metrics[`hopQuarter_d${d}`] = quarter[i]!
      metrics[`hopTenth_d${d}`] = tenth[i]!
      metrics[`hopLightCone_d${d}`] = rhoD[i]! / c
    })

    byLevel.forEach((b, i) => {
      metrics[`energyDrift_L${i + 1}`] = b.drift
      metrics[`energyWraps_L${i + 1}`] = b.wraps
    })

    return verdict({
      status,
      claim: `the bounded depth field on a husk backed by shrinking layers, lines on the husk to an antipodal sink (D ${DEPTH}, ${LEVELS} digits): a content-4 source hopping ${hops.length} times over ${LONG_BEATS} beats on side ${LONG_SIDE} keeps Gauss on husk and bulk (${longRecord.gaussOff} off in ${longRecord.gaussChecks}), curl ${longRecord.curl}, ${longWraps} wraps, reversal ${longRun.reversed}, its largest husk step per 256 beats ${windowMax.map(v => v.toFixed(3)).join(', ')} with the husk holding ${windowShare.map(v => v.toFixed(3)).join(', ')} of the field energy; on side ${HOP_SIDE} after a hop nothing changes on the next beat at d = ${HOP_D.join(', ')} (${noInstant ? 'none' : 'SOME'}), the first change ${firstChange.join(', ')} beats after against the link cone ${cone.join(', ')} (${inCone ? 'inside' : 'OUTSIDE'}), the radial step's half maximum at ${half.join(', ')} (${f(speedHalf / c)} c), first 25 percent at ${quarter.join(', ')} (${f(speedQuarter / c)} c), first 10 percent at ${tenth.join(', ')} (${f(speedTenth / c)} c), the zero mode predicted at ${f(zeroModeSpeed / c)} c; a 1-love and a 3-fear lump fall at ${e(aLight)} and ${e(aHeavy)} per unit content (alike to ${e(alike)}, linear solve ${e(aWant)}, E-GRV-0080's closed husk ${RECORDED_0080}); energy of husk plus bulk drifts ${byLevel.map(b => e(b.drift)).join(', ')} of the static ${f(staticEnergy)} at 1 .. 3 digits over ${ENERGY_BEATS} beats, the husk holding ${three.share
        .filter((_, i) => i % 16 === 0)
        .map(v => v.toFixed(3))
        .join(', ')} of the field energy`,
      metrics,
      notes: `L2. Gates D1 ${d1}, D2 ${d2} (instant ${noInstant}, cone ${inCone}, half ${f(speedHalf / c)} c, quarter ${f(speedQuarter / c)} c, tenth ${f(speedTenth / c)} c), D3 ${d3}, D4 ${d4}. Light-cone beats rho / c ${rhoD.map(r => (r / c).toFixed(1)).join(', ')}. Radial pulse peaks ${pulse.map(p => e(Math.max(...p.map(Math.abs)))).join(', ')}, final changes ${pulse.map(p => e(p[p.length - 1]!)).join(', ')}. W at r = ${FALL_R.join(', ')}: light ${light.map(x => x.toExponential(8)).join(' ')}, heavy ${heavy.map(x => x.toExponential(8)).join(' ')}, linear per unit ${wLinear.map(x => x.toExponential(8)).join(' ')}. Energy at 3 digits (every 512): ${three.samples
        .filter((_, i) => i % 8 === 0)
        .map(x => x.toExponential(4))
        .join(
          ' ',
        )}; least field part ${e(three.leastFree)}; found against local source ${e(three.sourceGap)}; wraps ${byLevel.map(b => b.wraps).join(', ')}. Hop runs wraps ${hopRecord.wraps.fWraps + hopRecord.wraps.vWraps}, reversal ${hopRecord.reversed}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
