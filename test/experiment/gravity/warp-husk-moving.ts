// The warped clock, moving (E-GRV-0103): E-GRV-0101's dynamics gates on the husk backed by shrinking layers whose
// clocks are warped with their scale (code/rule/open-husk warpClock: a layer-k dock divides by Q 4^k, its proper time
// running 2^-k as fast as the husk's; E-GRV-0102's header gives the schedule and the static derivation). E-GRV-0101 read
// the pull's front at 1.26 c (first 10 percent) and 1.40 c (first 25 percent) on the one-clock stack, which GW170817
// rules out. Does the warped clock bring the front to c, and never past it?
//
// THE DERIVATION, before any run (code/measure/open-husk stackSpeeds, tmp/warp-probe1.log). Per husk dock, layer k has
// lateral stiffness s_k = 6 / 2^k and, warped, inertia m_k = 8^-k 4^k = 2^-k, so s_k = 6 m_k on every layer: the
// stack's wave operator is m (d_t^2 / c^2 - lateral Laplacian) plus the vertical coupling, so every mode obeys
// omega^2 = c^2 (p^2 + mass^2) with E-GRV-0102's static masses (0, 0.068, 0.152, 0.320, 0.731 a husk dock). The zero
// mode runs at c EXACTLY (one clock: sqrt((31 / 16) / 1.14282) = 1.302 c), each layer's own waves at c (one clock: 2^k c),
// every massive mode's group velocity below c. No path through the bulk carries the pull faster than light on the husk:
// in the continuum limit the fastest wave anywhere in the stack is c. On the mesh, a coarse layer is more subluminal
// than the husk at the same husk momentum (its docks are larger, so its lattice dispersion bites sooner). PREDICTED: the
// first 10 and 25 percent of the hop's change arrive at c or a little under it. The rule's hard cone is still one link
// a beat over every link (a register can differ as soon as a path of links reaches it, through the bulk too), so the
// link cone is unchanged and gated as in E-GRV-0101; what the warp changes is the amplitude that runs ahead of c.
//  - D1: the bulk's larger inertia takes still less of the kicks' energy than E-GRV-0101's (0.04 .. 0.05 there);
//  - D3: the statics are E-GRV-0101's (the clock does not reach them), so a lump falls at E-GRV-0101's -5.0448e-4 per unit
//    content, up to the Hann average's residue;
//  - D4: the warped beat is one leapfrog with a diagonal inertia, so the energy with kinetic part 4^k v^2 / kappa on a
//    layer-k dock (code/measure/open-husk openEnergy) is kept as the one-clock stack's is.
//
// THE CALIBRATION, reported and not gated: the husk alone (no layer) read by the same front method on the same box, so
// the witness's own bias on a pure husk is on the page beside the stack's reading. E-GRV-0101's one-clock readings are
// reported as recorded.
//
// GATES, fixed before the first run of this file (D 16, three digits, kappa = 2 / 297, c(16) = 0.20101), E-GRV-0101's on
// the warped stack, D2 as the brief states it:
//  D1 exact and bounded over a moving source: a content-4 source on the side-32 husk (3 shrinking layers, warped), its sink
//     at the antipode, hopping one dock along x and back every 256 beats (15 hops of 4 units, on husk links only) over 4096
//     beats: Gauss 0 off on every dock of husk and bulk after every beat, curl 0 on every check, 0 wraps, every remainder
//     in its own window, the run reverses to its start bit for bit, lines included. REPORTED: the largest husk step in each
//     256-beat window and the husk's share of the field energy at the end of each.
//  D2 the front at c, never faster: a content-4 source at the origin of the side-64 husk (4 shrinking layers, warped), its
//     sink at the antipode; in one run it hops to (1, 0, 0) after beat 32, in the other it stays; compared for 128 beats
//     after the hop at (0, d, 0), d = 2 .. 12: (a) no register there (rate, remainder, the nine out-links' steps and lines,
//     the down-link's step) differs on the first beat after the hop; (b) none differs before the fewest links from the
//     hop's two docks to it, over husk and bulk; (c) the radial step's change (out-link +y) at its first 25 percent and
//     (d) at its first 10 percent, each fitted as t0 + rho / v on d = 3 .. 12 (rho from the hop's midpoint to the link's),
//     give v within 10 percent of c(16), and neither above 1.05 c (5 percent for reading integer beats; never faster);
//     both runs reverse bit for bit, Gauss 0 off. REPORTED: the half maximum (E-GRV-0101 found it swamped by the static
//     shift near the hop), the first change against the husk distance, the husk alone's readings.
//  D3 fall alike: the content-4 source at the origin of the side-32 warped stack and a test lump of 1 love or 3 fear at
//     (3, 0, 0) and (5, 0, 0), every content's sink at the antipode, W = E(A + B) - E(A) - E(B) from the Hann average of
//     1024 beats, a = -(W(5) - W(3)) / 2 / content (INERTIA IS A STAND-IN: content): both a < 0, alike to 1e-6, each
//     within 1e-3 of the linear solve's, reversal, Gauss, 0 wraps. REPORTED: a against E-GRV-0101's -5.0448e-4.
//  D4 energy: a content-4 lump on the side-16 husk (2 shrinking layers, warped) at (2, 2, 2), its sink at the antipode,
//     from zero field, 4096 beats, E of husk plus bulk every 64 beats (depth found from dock 0): at three digits max
//     |E - E(0)| at most 1e-4 of the size of its static energy, falling at every added digit from one to three; the field
//     part >= 0 at every sample; the found and local source terms agree to 1e-9.
// Verdict: pass if D1 to D4 hold; fail otherwise. (The one-clock stack, E-GRV-0101, is the case where D2 said no.)
//
// FIRST RUN (tmp/warp-moving-run1.log; 243 s, the record): fail on D2; no gate moved. D1 holds: 15 hops over 4,096 beats,
// Gauss 0 off in 4,096 checks, curl 0, 0 wraps, every remainder in its window, reversal bit for bit, the largest husk
// step per window 0.60 then 0.85 .. 0.89, the husk holding 0.88 .. 0.95 of the field energy. D2: nothing changes on the
// next beat, the first change (2, 3, 4, 5, 9, 13, 14, 18, 18, 26, 29 beats at d = 2 .. 12) is inside the link cone
// (2 .. 7), but the first 10 percent reads 1.140 c and the first 25 percent 1.229 c (half maximum 1.242 c), over the
// 1.05 c bound. THE CALIBRATION reads the husk ALONE, with no bulk at all, at 1.166 c (10 percent) and 1.397 c (25
// percent) by the same method, on nearly the same beats (10, 13, 19, 20, 26, 29, 33, 38, 43, 47, 52 for the 10 percent,
// against the stack's 10, 13, 19, 20, 26, 29, 33, 38, 43, 48, 53). So the stack's front is at or under the husk alone's,
// and the excess over c is the method's (the threshold of a change that is mostly the near field's static shift, fitted
// on d = 3 .. 12), not a path through the bulk; E-GRV-0101's 1.26 and 1.40 c sit on the same bias. D3 holds: -5.0448e-4
// per unit content for a 1-love and a 3-fear lump, alike to 2.2e-11, the linear solve's to 3e-9 (the one-clock stack's
// value, as the statics are). D4 holds: drift 2.6e2, 3.5e-3, 8.0e-6 of the static energy at 1 .. 3 digits, field part
// >= 0, found and local source terms 6.4e-16 apart. Title written after the run.
//
// Depth L2: the radion's known construction on bounded registers in a layered bulk with a warped clock. DETERMINISM:
// every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule; a hop
// is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linearFit } from '@/code/measure/regression'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { stepRule } from '@/code/rule/step-depth'
import { emptyOpen, huskOnly, openBeat, openMesh, openScratch, placeOpenLines, warpClock, type OpenMesh, type OpenState } from '@/code/rule/open-husk'
import { greenSolve, huskDock, huskMaxStep, linkDistance, newOpenRecord, openContent, openEnergy, openHopRun, openStaticRun, stackSpeeds, type OpenHop, type OpenRecord } from '@/code/measure/open-husk'

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
const NEVER_FASTER = 1.05
const FALL_SIDE = 32
const FALL_LAYERS = 3
const FALL_R: readonly number[] = [3, 5]
const STATIC_BEATS = 1024
const RECORDED_0101_FALL = -5.0448e-4
const RECORDED_0101_TENTH = 1.26
const RECORDED_0101_QUARTER = 1.4
const ENERGY_SIDE = 16
const ENERGY_LAYERS = 2
const ENERGY_BEATS = 4096
const ENERGY_EVERY = 64

type Watch = { v: number; r: number; steps: number[]; lines: number[]; down: number; radial: number }

const differs = (a: Watch, b: Watch): boolean => a.v !== b.v || a.r !== b.r || a.down !== b.down || a.steps.some((x, i) => x !== b.steps[i]) || a.lines.some((x, i) => x !== b.lines[i])

const firstAt = (series: number[], share: number): number => {
  const top = Math.max(...series.map(Math.abs))

  return series.findIndex(x => Math.abs(x) >= top * share) + 1
}

const antipode = (side: number): number[] => [side / 2, side / 2, side / 2]

type Front = { firstChange: number[]; cone: number[]; noInstant: boolean; inCone: boolean; half: number[]; quarter: number[]; tenth: number[]; speedHalf: number; speedQuarter: number; speedTenth: number }

// E-GRV-0101's D2 reading on any mesh: two runs, one with the hop and one without, compared at (0, d, 0)
function front(mesh: OpenMesh, rule: ReturnType<typeof stepRule>, record: OpenRecord): Front {
  const allow = huskOnly(mesh)
  const rho0 = openContent(mesh, [{ at: [0, 0, 0], units: SOURCE, to: antipode(HOP_SIDE) }])
  const docks = HOP_D.map(d => huskDock(mesh, [0, d, 0]))
  const reach = linkDistance(mesh, [huskDock(mesh, [0, 0, 0]), huskDock(mesh, [1, 0, 0])])
  const cone = docks.map(y => reach[y]!)
  const hasDown = mesh.sides.length > 1
  // the one vertical link of a husk dock (shrink: layer 0's verticals first, in dock order)
  const downOf = (y: number): number => mesh.docks * 9 + y
  const trace = (hops: OpenHop[]): Watch[][] => {
    const out: Watch[][] = []

    openHopRun(
      mesh,
      rule,
      rho0,
      hops,
      HOP_AT + HOP_WINDOW,
      record,
      (t: number, s: OpenState): void => {
        if (t <= HOP_AT) return
        out.push(
          docks.map(y => ({
            v: s.rate[y]!,
            r: s.rest[y]!,
            steps: Array.from({ length: 9 }, (_, h) => s.step[y * 9 + h]!),
            lines: Array.from({ length: 9 }, (_, h) => s.line[y * 9 + h]!),
            down: hasDown ? s.step[downOf(y)]! : 0,
            radial: s.step[y * 9 + 1]!,
          })),
        )
      },
      allow,
    )

    return out
  }
  const traceA = trace([])
  const traceB = trace([{ beat: HOP_AT, from: [0, 0, 0], to: [1, 0, 0], units: SOURCE }])
  const firstChange = HOP_D.map((_, i) => traceA.findIndex((w, k) => differs(w[i]!, traceB[k]![i]!)) + 1)
  const pulse = HOP_D.map((_, i) => traceA.map((w, k) => (traceB[k]![i]!.radial - w[i]!.radial) / rule.unit))
  const half = pulse.map(p => firstAt(p, 0.5))
  const quarter = pulse.map(p => firstAt(p, 0.25))
  const tenth = pulse.map(p => firstAt(p, 0.1))
  const rhoD = HOP_D.map(d => Math.sqrt(0.25 + (d + 0.5) ** 2))
  const from = HOP_D.indexOf(FIT_FROM)
  const speed = (t: number[]): number => 1 / linearFit({ xs: rhoD.slice(from), ys: t.slice(from) }).slope

  return {
    firstChange,
    cone,
    noInstant: HOP_D.every((_, i) => !differs(traceA[0]![i]!, traceB[0]![i]!)),
    inCone: firstChange.every((k, i) => k === 0 || k >= cone[i]!),
    half,
    quarter,
    tenth,
    speedHalf: speed(half),
    speedQuarter: speed(quarter),
    speedTenth: speed(tenth),
  }
}

export default experiment({
  id: 'gravity/warp-husk-moving',
  code: 'E-GRV-0103',
  title:
    "with the bulk's clock warped every layer and the zero mode run at c in the derivation, and the pull's front on the husk reads 1.14 c (first 10 percent) and 1.23 c (first 25 percent), fail on D2, but the husk alone with no bulk reads 1.17 c and 1.40 c by the same method on nearly the same beats, so the excess is the front method's near-field bias and not a path through the bulk (E-GRV-0101's 1.26 and 1.40 c sit on it too); nothing changes on the next beat and the first change stays inside the link cone; 15 hops over 4,096 beats keep Gauss, curl 0, 0 wraps, every remainder in its window and reverse bit for bit, the largest husk step 0.85 .. 0.89; lumps fall alike to 2.2e-11 at -5.04e-4 per unit content, the one-clock stack's value; energy drifts 8.0e-6 of the static at three digits",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const rule = stepRule(DEPTH, LEVELS)
    const c = lightSpeed(DEPTH)
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)

    // D1
    const longMesh = warpClock(openMesh(LONG_SIDE, LONG_LAYERS, 'shrink'))
    const longAllow = huskOnly(longMesh)
    const longRecord = newOpenRecord()
    const hops: OpenHop[] = []

    for (let k = 1; k * LONG_EVERY < LONG_BEATS; k++) hops.push({ beat: k * LONG_EVERY, from: k % 2 === 1 ? [0, 0, 0] : [1, 0, 0], to: k % 2 === 1 ? [1, 0, 0] : [0, 0, 0], units: SOURCE })

    const windowMax: number[] = []
    const windowShare: number[] = []
    let running = 0
    const longRun = openHopRun(
      longMesh,
      rule,
      openContent(longMesh, [{ at: [0, 0, 0], units: SOURCE, to: antipode(LONG_SIDE) }]),
      hops,
      LONG_BEATS,
      longRecord,
      (t, s, rho) => {
        if (t === 0) return
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
    const d1 = longRun.reversed && longRecord.gaussOff === 0 && longRecord.curl === 0 && longWraps === 0 && longRecord.restOff === 0

    log('long')

    // D2
    const mesh = warpClock(openMesh(HOP_SIDE, HOP_LAYERS, 'shrink'))
    const hopRecord = newOpenRecord()
    const stack = front(mesh, rule, hopRecord)

    log('hop')

    const aloneRecord = newOpenRecord()
    const alone = front(openMesh(HOP_SIDE, 0, 'shrink'), rule, aloneRecord)

    log('hop alone')

    const atC = (v: number): boolean => Math.abs(v / c - 1) <= SPEED_TOLERANCE && v / c <= NEVER_FASTER
    const hopWraps = hopRecord.wraps.fWraps + hopRecord.wraps.vWraps
    const d2 = stack.noInstant && stack.inCone && stack.firstChange.every(k => k > 0) && atC(stack.speedQuarter) && atC(stack.speedTenth) && hopRecord.reversed && hopRecord.gaussOff === 0 && hopWraps === 0 && hopRecord.restOff === 0
    const speeds = stackSpeeds(mesh.sides, 'clock')
    const speedsOne = stackSpeeds(mesh.sides, 'none')

    // D3
    const fallMesh = warpClock(openMesh(FALL_SIDE, FALL_LAYERS, 'shrink'))
    const fallAllow = huskOnly(fallMesh)
    const fallRecord = newOpenRecord()
    const z = antipode(FALL_SIDE)
    const run = (sources: { at: number[]; units: number }[]): number => openStaticRun(fallMesh, rule, openContent(fallMesh, sources.map(s => ({ ...s, to: z }))), STATIC_BEATS, fallRecord, fallAllow).energy
    const eA = run([{ at: [0, 0, 0], units: SOURCE }])
    const fall = (units: number): number[] =>
      FALL_R.map(r => {
        const eB = run([{ at: [r, 0, 0], units }])

        return run([{ at: [0, 0, 0], units: SOURCE }, { at: [r, 0, 0], units }]) - eA - eB
      })
    const light = fall(1)
    const heavy = fall(3)
    const accel = (w: number[], units: number): number => -(w[1]! - w[0]!) / (FALL_R[1]! - FALL_R[0]!) / units
    const aLight = accel(light, 1)
    const aHeavy = accel(heavy, 3)
    const g = greenSolve(fallMesh, openContent(fallMesh, [{ at: [0, 0, 0], units: SOURCE, to: z }]))
    const wLinear = FALL_R.map(r => -(Math.PI / DEPTH) * g.x[huskDock(fallMesh, [r, 0, 0])]!)
    const aWant = accel(wLinear, 1)
    const alike = Math.abs(aLight / aHeavy - 1)
    const d3 = aLight < 0 && aHeavy < 0 && alike <= 1e-6 && Math.abs(aLight / aWant - 1) <= 1e-3 && Math.abs(aHeavy / aWant - 1) <= 1e-3 && fallRecord.reversed && fallRecord.gaussOff === 0 && fallRecord.wraps.fWraps + fallRecord.wraps.vWraps === 0 && fallRecord.restOff === 0

    log('fall')

    // D4
    const eMesh = warpClock(openMesh(ENERGY_SIDE, ENERGY_LAYERS, 'shrink'))
    const lumpRho = openContent(eMesh, [{ at: [2, 2, 2], units: SOURCE, to: [2 + ENERGY_SIDE / 2, 2 + ENERGY_SIDE / 2, 2 + ENERGY_SIDE / 2] }])
    const eg = greenSolve(eMesh, lumpRho)
    let rx = 0

    for (let y = 0; y < eMesh.docks; y++) rx += lumpRho[y]! * eg.x[y]!

    const staticEnergy = -(Math.PI / DEPTH) * 0.5 * rx
    const energyRun = (levels: number): { drift: number; leastFree: number; sourceGap: number; samples: number[]; share: number[]; wraps: number } => {
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
        sourceGap = Math.max(sourceGap, Math.abs(en.sourceFound - en.sourceLocal) / Math.max(1e-300, Math.abs(en.sourceLocal)))
      }

      sample()
      for (let t = 1; t <= ENERGY_BEATS; t++) {
        openBeat(eMesh, r, s, sc, tally)
        if (t % ENERGY_EVERY === 0) sample()
      }

      return { drift: Math.max(...samples.map(x => Math.abs(x - samples[0]!))) / Math.abs(staticEnergy), leastFree, sourceGap, samples, share, wraps: tally.fWraps + tally.vWraps }
    }
    const byLevel = [1, 2, 3].map(energyRun)
    const three = byLevel[2]!
    const d4 = three.drift <= 1e-4 && byLevel[0]!.drift > byLevel[1]!.drift && byLevel[1]!.drift > three.drift && three.leastFree >= 0 && three.sourceGap <= 1e-9

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
      longRestOff: longRecord.restOff,
      longMaxStep: longRecord.maxStep,
      longReversed: longRun.reversed ? 1 : 0,
      scalarSpeed: c,
      zeroModeSpeedRatio: speeds.zeroMode,
      zeroModeSpeedRatioOneClock: speedsOne.zeroMode,
      fastestLayerRatio: Math.max(...speeds.layer),
      speedHalfRatio: stack.speedHalf / c,
      speedQuarterRatio: stack.speedQuarter / c,
      speedTenthRatio: stack.speedTenth / c,
      aloneHalfRatio: alone.speedHalf / c,
      aloneQuarterRatio: alone.speedQuarter / c,
      aloneTenthRatio: alone.speedTenth / c,
      oneClockQuarterRatioRecorded: RECORDED_0101_QUARTER,
      oneClockTenthRatioRecorded: RECORDED_0101_TENTH,
      hopReversed: hopRecord.reversed ? 1 : 0,
      hopWraps,
      hopRestOff: hopRecord.restOff,
      aloneReversed: aloneRecord.reversed ? 1 : 0,
      aLight,
      aHeavy,
      aWant,
      alike,
      aOneClockRecorded: RECORDED_0101_FALL,
      staticEnergy,
      seconds: (Date.now() - started) / 1000,
    }

    windowMax.forEach((v, i) => (metrics[`longWindowMax_${i + 1}`] = v))
    windowShare.forEach((v, i) => (metrics[`longWindowHuskShare_${i + 1}`] = v))
    HOP_D.forEach((d, i) => {
      metrics[`hopFirstChange_d${d}`] = stack.firstChange[i]!
      metrics[`hopLinkCone_d${d}`] = stack.cone[i]!
      metrics[`hopHalf_d${d}`] = stack.half[i]!
      metrics[`hopQuarter_d${d}`] = stack.quarter[i]!
      metrics[`hopTenth_d${d}`] = stack.tenth[i]!
      metrics[`aloneQuarter_d${d}`] = alone.quarter[i]!
      metrics[`aloneTenth_d${d}`] = alone.tenth[i]!
    })
    byLevel.forEach((b, i) => {
      metrics[`energyDrift_L${i + 1}`] = b.drift
      metrics[`energyWraps_L${i + 1}`] = b.wraps
    })

    return verdict({
      status,
      claim: `the bounded depth field on a husk backed by shrinking layers whose clocks are warped with their scale (a layer-k dock divides by Q 4^k), lines on the husk to an antipodal sink (D ${DEPTH}, ${LEVELS} digits): a content-4 source hopping ${hops.length} times over ${LONG_BEATS} beats on side ${LONG_SIDE} keeps Gauss on husk and bulk (${longRecord.gaussOff} off in ${longRecord.gaussChecks}), curl ${longRecord.curl}, ${longWraps} wraps, ${longRecord.restOff} remainders out of window, reversal ${longRun.reversed}, its largest husk step per 256 beats ${windowMax.map(v => v.toFixed(3)).join(', ')} with the husk holding ${windowShare.map(v => v.toFixed(3)).join(', ')} of the field energy; on side ${HOP_SIDE} after a hop nothing changes on the next beat at d = ${HOP_D.join(', ')} (${stack.noInstant ? 'none' : 'SOME'}), the first change ${stack.firstChange.join(', ')} beats after against the link cone ${stack.cone.join(', ')} (${stack.inCone ? 'inside' : 'OUTSIDE'}), the radial step's first 25 percent at ${stack.quarter.join(', ')} (${f(stack.speedQuarter / c)} c) and first 10 percent at ${stack.tenth.join(', ')} (${f(stack.speedTenth / c)} c), half maximum ${f(stack.speedHalf / c)} c, against the zero mode's derived ${f(speeds.zeroMode)} c (one clock ${f(speedsOne.zeroMode)} c, measured ${RECORDED_0101_TENTH} and ${RECORDED_0101_QUARTER} c) and the husk alone's ${f(alone.speedQuarter / c)} and ${f(alone.speedTenth / c)} c by the same method; a 1-love and a 3-fear lump fall at ${e(aLight)} and ${e(aHeavy)} per unit content (alike to ${e(alike)}, linear solve ${e(aWant)}, one clock ${RECORDED_0101_FALL}); energy of husk plus bulk drifts ${byLevel.map(b => e(b.drift)).join(', ')} of the static ${f(staticEnergy)} at 1 .. 3 digits over ${ENERGY_BEATS} beats`,
      metrics,
      control: { aloneQuarterRatio: alone.speedQuarter / c, aloneTenthRatio: alone.speedTenth / c },
      notes: `L2. Gates D1 ${d1}, D2 ${d2} (instant ${stack.noInstant}, cone ${stack.inCone}, quarter ${f(stack.speedQuarter / c)} c, tenth ${f(stack.speedTenth / c)} c, half ${f(stack.speedHalf / c)} c), D3 ${d3}, D4 ${d4}. Husk alone: quarter ${alone.quarter.join(' ')}, tenth ${alone.tenth.join(' ')}, half ${f(alone.speedHalf / c)} c, reversal ${aloneRecord.reversed}. Stack half maximum ${stack.half.join(' ')}. Layer speeds derived ${speeds.layer.map(f).join(' ')} c (one clock ${speedsOne.layer.map(f).join(' ')}). W at r = ${FALL_R.join(', ')}: light ${light.map(x => x.toExponential(8)).join(' ')}, heavy ${heavy.map(x => x.toExponential(8)).join(' ')}. Energy at 3 digits (every 512): ${three.samples.filter((_, i) => i % 8 === 0).map(x => x.toExponential(4)).join(' ')}; husk share ${three.share.filter((_, i) => i % 16 === 0).map(v => v.toFixed(3)).join(' ')}; least field part ${e(three.leastFree)}; found against local source ${e(three.sourceGap)}; wraps ${byLevel.map(b => b.wraps).join(', ')}. Hop runs wraps ${hopWraps}, reversal ${hopRecord.reversed}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
