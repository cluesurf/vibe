// The torn husk, static (E-GRV-0108): a clean horizon for the bounded depth field. Where the husk cannot carry a lump's
// lines any further it TEARS, and the lump's flux passes down into the {3,4,3,4}'s shrinking bulk instead of wrapping
// (code/rule/horizon-husk; its header gives the rule, the windows and the bound).
//
// THE PROBLEM IT ANSWERS. E-GRV-0090's densest lumps demand a husk step past the trit window (M = 400: 2.05 on the husk
// alone), and the reversible wrap then slips (125,296 slips in 512 beats), keeping neither its energy (0 to 7,368) nor a
// single-valued depth: "a slipping shell, not yet a clean horizon". E-GRV-0094's growing bulk did not help (the M = 400
// lump demanded 2.30 and slipped 79,283 times).
//
// THE RULE, in one line: a husk dock whose 18 husk lateral links all carry a content line joins the horizon; its husk
// links tear (take no new value), so its only link is its vertical one and its content's whole flux goes down. The husk
// keeps its trit window; the vertical links, the bulk and the horizon's own docks hold 81 whole steps (a bounded
// register fixed by the rule). THE VERTICAL BOUND, derived: a horizon dock's static vertical step is its content, at most
// 18 (its 18 lateral lines), and at most twice that swinging from rest in one mode, 36 < 40.5. The bulk's lateral steps
// are not bounded by a derivation: they are measured, beside the linear solve.
//
// DISCLOSED PROBES (instrument only, before this file; tmp/horizon-probe1 .. 8): raising the vertical weight without a
// tear leaves the husk at 1.47 to 1.53 (probe 2, 3); tearing only between horizon docks leaves 2.1 to 6.6 (probe 4);
// tearing every link at a horizon dock gives the husk 0.25, 0.49, 1.39 static for M = 100, 400, 1600 (probe 4); the rule
// run 1024 beats on M = 400 and 1600 gave 0 wraps, husk 0.86 and 1.34, vertical 27.6 and 30.2, bulk laterals to 15.0,
// curl 0, reversal exact (probe 5); the torn lump's side-24 force is 0.29 .. 0.84 of the free lump's at r = 5 .. 10 and
// on a side-96 stack of 5 layers (linear solves) 0.993 .. 0.998 at r = 24 .. 40 (probe 6); line saturation is not quite
// monotone as a lump grows (probe 7); the stack's window radii (probe 8, theory). The horizon radii (probe 7) were seen
// before the prediction (probe 8) was computed; the prediction reads no measured number.
//
// GATES, fixed before the first run of this file. D 16, three digits, bulk window 81, the husk of side 24 backed by the
// warped shrinking stack of 3 layers (E-GRV-0102's; sides 24, 12, 6, 3). The lumps: E-GRV-0090's densest lumps
// (code/measure/step-depth compressLump on the side-24 husk, center (12, 12, 12), capacity 1, sinks the M farthest
// docks, one unit each), M = 100, 200, 400, 800, 1600 (100, 400, 1600 are E-GRV-0090's S4 cores). Each is run from zero
// field with its lines placed, 1024 beats, the Hann average, then 1024 back.
//  H1 exact on the lumps that wrapped, M = 400 and 1600: Gauss 0 off on every dock after every beat; 0 wraps (no register
//     ever left its window, so the husk never left its trit); curl 0 on every check over every live link, the vertical
//     links included; every remainder in its window; the energy kept, |E(t) - E(0)| <= 1e-4 of the torn statics' energy
//     |E_static| at every check (every 64 beats); every run reverses bit for bit; the largest vertical step within the
//     derived 36. CONTROL C1: the same lumps on the same stack and windows with no tear (256 beats) wrap.
//  H2 the horizon's radius (its farthest dock) for every M within 0.5 dock of the stack's window radius (code/measure/
//     horizon-husk stackWindowRadius: where 2 M |G'(r)| of the stack's layered Green's function reaches 3/2; theory),
//     and its log-log slope against M within 0.15 of the prediction's (sqrt(M) on the husk alone: slope 1/2; a
//     Schwarzschild radius would be 1). REPORTED: the husk alone's radius sqrt(M / 18 pi), the lines' count, the runs of
//     M = 100, 200, 800.
//  H3 the far field: (a) the rule reads its torn statics: the Hann average's husk force along the axes equals the torn
//     linear solve's (the Laplacian with the torn links' weights 0, a second method) within 1e-3 at every r = 5 .. 11,
//     for M = 400 and 1600; (b) the torn lump's far pull is the free lump's (the same content on the same stack, no tear,
//     the linear field of a lump that never saturates): on a side-96 stack of 5 layers (linear solves, the side-24 lump
//     at its center, sinks the M farthest docks), the force ratio torn / free within 1 percent at every r = 24 .. 40 and
//     closer to 1 at 40 than at 24. REPORTED: the ratio on side 24 at r = 5 .. 11, and the fitted 1/r coefficient.
// Verdict: pass if H1 to H3 hold with C1; partial if C1 fails; fail otherwise.
//
// FIRST RUN (tmp/torn-static-run1.log, 68 s, the record; run under the provisional code E-GRV-0106, renumbered 0108
// before registration because another experiment took 0106): pass on its gates, no gate moved. H1: M = 400 and 1600 run
// 1024 beats with 0 wraps, Gauss 0 off, curl 0 on 2,515,504 and 2,448,912 live link checks (252,288 of them vertical
// each), every remainder in its window, energy drift 3.9e-8 and 1.2e-8 of the statics' 481 and 1,803, reversal bit for
// bit; the husk's largest step 0.856 and 1.339, the vertical's 27.6 and 30.2 (derived bound 36, static 18.00 = the most
// content a dock holds, to 1.3e-3), the bulk's laterals 12.0, 2.1, 4.8 and 15.0, 7.1, 5.2 by layer. C1: untorn, the same
// lumps wrap 23,487 and 117,315 times in 256 beats. H2: the horizon's radius 1.000, 1.732, 2.236, 3.317, 4.690 for M =
// 100, 200, 400, 800, 1600 against the stack's window radius 1.277, 1.764, 2.415, 3.287, 4.461 (worst 0.277 dock; the
// husk alone's sqrt(M / 18 pi) is 1.330 .. 5.319, the lines' count 1.177 .. 4.709), log slope 0.540 against the
// prediction's 0.451: the sqrt(M) of a bound on the step, not a Schwarzschild M. H3: the rule's husk force equals its
// torn statics to 4.8e-4 at r = 5 .. 11; on the side-96 stack the torn over the free force is 0.9953 .. 0.9982 (M 400)
// and 0.9929 .. 0.9976 (M 1600) at r = 24 .. 40, rising with r. REPORTED, and the honest cost: (1) on side 24 the torn
// lump's force is only 0.667 .. 0.933 (M 400) and 0.290 .. 0.865 (M 1600) of the free lump's at r = 5 .. 11: the flux
// enters the bulk at layer 1 and comes back up spread, so the lump sources the bulk's massive modes from below and its
// near-field correction is gone; the far 1/r is restored only past r ~ 20. (2) THE M = 100 LUMP WRAPS, ungated but
// recorded: 1,126 wraps, curl 106, energy 0 to 5.9 of 137. Its content dock (12, 11, 11) holds 10 units with only 15
// of its 18 lines in use, so it stays on the husk with its 3 links to the horizon torn, and its static step (1.003,
// tmp/horizon-probe9) swings past 3/2 when the field is switched on from rest. The line criterion leaves a partly full
// dock beside the tear with fewer links to carry its content: the horizon is clean only where the lump is line
// saturated to its edge (M = 200 leaves a 2-unit dock outside and does not wrap; M = 400, 800, 1600 leave none).
// Title written after the run.
//
// Depth L2: a known construction (a massless scalar on a brane backed by a warped bulk; the brane-world horizon of
// Randall-Sundrum pictures) run as an integer reversible rule on bounded registers, with the tear added by hand. The
// horizon's radius law is derived from the step window and compared. DETERMINISM: every start and source is placed;
// nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { linearFit } from '@/code/measure/regression'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import { openMesh, warpClock, type OpenMesh } from '@/code/rule/open-husk'
import { horizonOf, horizonRule } from '@/code/rule/horizon-husk'
import { compressLump, CROSSING_DENSITY } from '@/code/measure/step-depth'
import { greenSolve, huskDistance, huskDock, stackModes } from '@/code/measure/open-husk'
import { horizonStaticRun, huskWindowRadius, newHorizonRecord, realHorizonDepth, stackWindowRadius, tornMesh, verticalOf, type HorizonRecord } from '@/code/measure/horizon-husk'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const SIDE = 24
const LAYERS = 3
const BEATS = 1024
const CONTROL_BEATS = 256
const MS: readonly number[] = [100, 200, 400, 800, 1600]
const WRAPPED: readonly number[] = [400, 1600]
const WINDOW = 1.5
const VERTICAL_BOUND = 36
const ENERGY_TOLERANCE = 1e-4
const STATIC_TOLERANCE = 1e-3
const STATIC_R: readonly number[] = [5, 6, 7, 8, 9, 10, 11]
const RADIUS_TOLERANCE = 0.5
const SLOPE_TOLERANCE = 0.15
const BIG = 96
const BIG_LAYERS = 5
const FAR_R: readonly number[] = [24, 26, 28, 30, 32, 34, 36, 38, 40]
const FAR_TOLERANCE = 0.01
const CENTER = [12, 12, 12]

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// the mean over the six axis docks at r of a dock field, and the force (its difference to r + 1)
const axisMean = (mesh: OpenMesh, x: ArrayLike<number>, center: readonly number[], r: number): number => AXES.reduce((t, a) => t + x[huskDock(mesh, a.map((v, i) => center[i]! + v * r))]!, 0) / AXES.length
const axisForce = (mesh: OpenMesh, x: ArrayLike<number>, center: readonly number[], r: number): number => axisMean(mesh, x, center, r + 1) - axisMean(mesh, x, center, r)

type Lump = {
  m: number
  record: HorizonRecord
  horizonDocks: number
  horizonRadius: number
  lumpRadius: number
  mostContent: number
  energyStatic: number
  verticalStatic: number
  verticalVsContent: number
  ruleVsSolve: number
  sideRatio: number[]
  control?: HorizonRecord
}

function runLump(mesh: OpenMesh, rule: ReturnType<typeof horizonRule>, m: number): Lump {
  const lump = compressLump(radionMesh([SIDE, SIDE, SIDE]), CENTER, m, 1)
  const rho = new Int32Array(mesh.docks)
  const line = new Int8Array(mesh.links)

  rho.set(lump.content)
  line.set(lump.line)

  const record = newHorizonRecord()
  const run = horizonStaticRun(mesh, rule, rho, line, BEATS, record)
  const horizon = run.horizon
  const depth = realHorizonDepth(mesh, run.mean, horizon)
  const torn = greenSolve(tornMesh(mesh, horizon), rho, 1e-12)
  const free = greenSolve(mesh, rho, 1e-12)
  const vertical = verticalOf(mesh)
  let horizonDocks = 0
  let horizonRadius = 0
  let lumpRadius = 0
  let mostContent = 0
  let verticalStatic = 0
  let verticalVsContent = 0
  let rhoX = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (rho[y]! > 0) (lumpRadius = Math.max(lumpRadius, huskDistance(mesh, y, CENTER))), (mostContent = Math.max(mostContent, rho[y]!))
    if (!horizon[y]) continue
    horizonDocks++
    horizonRadius = Math.max(horizonRadius, huskDistance(mesh, y, CENTER))
    verticalStatic = Math.max(verticalStatic, Math.abs(run.mean[vertical[y]!]!))
    verticalVsContent = Math.max(verticalVsContent, Math.abs(run.mean[vertical[y]!]! - rho[y]!))
  }
  for (let y = 0; y < mesh.docks; y++) if (rho[y] !== 0) rhoX += rho[y]! * torn.x[y]!

  const ruleVsSolve = Math.max(...STATIC_R.map(r => Math.abs(axisForce(mesh, depth, CENTER, r) / axisForce(mesh, torn.x, CENTER, r) - 1)))
  const sideRatio = STATIC_R.map(r => axisForce(mesh, torn.x, CENTER, r) / axisForce(mesh, free.x, CENTER, r))
  let control: HorizonRecord | undefined

  if (WRAPPED.includes(m)) {
    control = newHorizonRecord()
    horizonStaticRun(mesh, rule, rho, line, CONTROL_BEATS, control, 64, false)
  }

  return {
    m,
    record,
    horizonDocks,
    horizonRadius,
    lumpRadius,
    mostContent,
    // the torn statics' energy (pi / D)(1/2 sum F^2 / g - rho . x) = -(pi / D) rho . x / 2 at the solution
    energyStatic: -(Math.PI / DEPTH) * rhoX / 2,
    verticalStatic,
    verticalVsContent,
    ruleVsSolve,
    sideRatio,
    control,
  }
}

// the side-24 lump at the center of a larger stack, sinks the M farthest docks: the force ratio torn / free along the axes
function farField(m: number): { ratio: number[]; kFree: number; kTorn: number; seconds: number } {
  const started = Date.now()
  const small = openMesh(SIDE, 0, 'shrink')
  const lump = compressLump(radionMesh([SIDE, SIDE, SIDE]), CENTER, m, 1)
  const smallLine = new Int8Array(small.links)

  smallLine.set(lump.line)

  const smallHorizon = horizonOf(small, smallLine)
  const mesh = warpClock(openMesh(BIG, BIG_LAYERS, 'shrink'))
  const shift = BIG / 2 - SIDE / 2
  const center = [BIG / 2, BIG / 2, BIG / 2]
  const rho = new Float64Array(mesh.docks)
  const horizon = new Uint8Array(mesh.huskDocks)

  for (let y = 0; y < small.huskDocks; y++) {
    const z = huskDock(
      mesh,
      [y % SIDE, Math.floor(y / SIDE) % SIDE, Math.floor(y / (SIDE * SIDE))].map(v => v + shift),
    )

    if (lump.content[y]! > 0) rho[z] = lump.content[y]!
    if (smallHorizon[y]) horizon[z] = 1
  }

  const dist = Float64Array.from({ length: mesh.huskDocks }, (_, y) => huskDistance(mesh, y, center))
  const order = Array.from({ length: mesh.huskDocks }, (_, y) => y).sort((p, q) => dist[q]! - dist[p]! || p - q)

  for (let i = 0; i < m; i++) rho[order[i]!] = rho[order[i]!]! - 1

  const free = greenSolve(mesh, rho, 1e-10)
  const torn = greenSolve(tornMesh(mesh, horizon), rho, 1e-10)
  const fitR = Array.from({ length: 17 }, (_, i) => 24 + i)
  const k = (x: Float64Array): number => fitPowers(fitR, fitR.map(r => axisMean(mesh, x, center, r)), [1, 2])[1]!

  return { ratio: FAR_R.map(r => axisForce(mesh, torn.x, center, r) / axisForce(mesh, free.x, center, r)), kFree: k(free.x), kTorn: k(torn.x), seconds: (Date.now() - started) / 1000 }
}

export default experiment({
  id: 'gravity/torn-husk-static',
  code: 'E-GRV-0108',
  title:
    "tearing the husk where its lines are full, so a dense lump's flux leaves down into the shrinking bulk, gives a horizon with no wrap, pass on its gates: E-GRV-0090's lumps of 400 and 1600 units (which wrap 23,487 and 117,315 times untorn) run with 0 wraps, curl 0 through the vertical links, energy kept to 4e-8 and exact reversal, the husk's step at most 1.34 and the vertical's 30.2 under the derived 36; the horizon's radius 1.00, 1.73, 2.24, 3.32, 4.69 for M = 100 .. 1600 sits within 0.28 dock of where the free field's step reaches the window and grows as M^0.54 (predicted 0.45), the sqrt(M) of a bound on the field and not a Schwarzschild M; the far pull is the untorn lump's to 0.7 percent at r = 24 .. 40 on a side-96 stack, but only 0.29 .. 0.93 of it at r = 5 .. 11, and the M = 100 lump still wraps 1,126 times because a 10-unit dock left beside the tear swings past the trit from rest",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const rule = horizonRule(stepRule(DEPTH, LEVELS), BULK)
    const lumps = MS.map(m => {
      const l = runLump(mesh, rule, m)

      log(`M ${m}`)

      return l
    })
    const far = WRAPPED.map(m => {
      const f = farField(m)

      log(`far M ${m}`)

      return f
    })

    // H1
    const wrapsOf = (r: HorizonRecord): number => r.wraps.fWraps + r.wraps.vWraps
    const gated = lumps.filter(l => WRAPPED.includes(l.m))
    const exact = (l: Lump): boolean =>
      l.record.gaussOff === 0 &&
      wrapsOf(l.record) === 0 &&
      l.record.curl === 0 &&
      l.record.verticalChecked > 0 &&
      l.record.restOff === 0 &&
      l.record.energyDrift <= ENERGY_TOLERANCE * Math.abs(l.energyStatic) &&
      l.record.reversed &&
      l.record.verticalStep <= VERTICAL_BOUND
    const h1 = gated.every(exact)
    const c1 = gated.every(l => l.control !== undefined && wrapsOf(l.control) > 0)

    // H2
    const modes = stackModes(mesh.sides, 'clock')
    const predicted = MS.map(m => stackWindowRadius(modes, m, WINDOW))
    const huskAlone = MS.map(m => huskWindowRadius(m, WINDOW))
    const lineCount = MS.map(m => Math.sqrt(m / (4 * Math.PI * CROSSING_DENSITY)))
    const radii = lumps.map(l => l.horizonRadius)
    const radiusOff = Math.max(...radii.map((r, i) => Math.abs(r - predicted[i]!)))
    const slope = (ys: readonly number[]): number => linearFit({ xs: MS.map(Math.log), ys: ys.map(Math.log) }).slope
    const slopeMeasured = slope(radii)
    const slopePredicted = slope(predicted)
    const h2 = radiusOff <= RADIUS_TOLERANCE && Math.abs(slopeMeasured - slopePredicted) <= SLOPE_TOLERANCE

    // H3
    const ruleVsSolve = Math.max(...gated.map(l => l.ruleVsSolve))
    const farOff = Math.max(...far.map(f => Math.max(...f.ratio.map(v => Math.abs(v - 1)))))
    const converging = far.every(f => Math.abs(f.ratio[f.ratio.length - 1]! - 1) < Math.abs(f.ratio[0]! - 1))
    const h3 = ruleVsSolve <= STATIC_TOLERANCE && farOff <= FAR_TOLERANCE && converging

    const status = !c1 ? 'partial' : h1 && h2 && h3 ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(2)
    const metrics: Record<string, number> = {
      gate_H1: h1 ? 1 : 0,
      gate_H2: h2 ? 1 : 0,
      gate_H3: h3 ? 1 : 0,
      control_C1: c1 ? 1 : 0,
      side: SIDE,
      layers: LAYERS,
      bulkWindow: BULK,
      radiusOff,
      slopeMeasured,
      slopePredicted,
      ruleVsSolve,
      farOff,
      seconds: (Date.now() - started) / 1000,
    }

    lumps.forEach((l, i) => {
      const p = `M${l.m}_`

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
      l.record.bulkStep.forEach((v, k) => (metrics[`${p}bulkStep_layer${k}`] = v))
      metrics[`${p}huskRate`] = l.record.huskRate
      metrics[`${p}bulkRate`] = l.record.bulkRate
      metrics[`${p}horizonDocks`] = l.horizonDocks
      metrics[`${p}horizonRadius`] = l.horizonRadius
      metrics[`${p}predictedRadius`] = predicted[i]!
      metrics[`${p}huskAloneRadius`] = huskAlone[i]!
      metrics[`${p}lineCountRadius`] = lineCount[i]!
      metrics[`${p}lumpRadius`] = l.lumpRadius
      metrics[`${p}mostContent`] = l.mostContent
      metrics[`${p}verticalStatic`] = l.verticalStatic
      metrics[`${p}verticalVsContent`] = l.verticalVsContent
      metrics[`${p}ruleVsSolve`] = l.ruleVsSolve
      STATIC_R.forEach((r, j) => (metrics[`${p}side24Ratio_r${r}`] = l.sideRatio[j]!))
      if (l.control) (metrics[`${p}controlWraps`] = wrapsOf(l.control)), (metrics[`${p}controlHuskStep`] = l.control.huskStep)
    })
    far.forEach((fr, i) => {
      const p = `M${WRAPPED[i]}_`

      FAR_R.forEach((r, j) => (metrics[`${p}farRatio_r${r}`] = fr.ratio[j]!))
      metrics[`${p}kFree`] = fr.kFree
      metrics[`${p}kTorn`] = fr.kTorn
    })

    const at = (m: number): Lump => lumps.find(l => l.m === m)!

    return verdict({
      status,
      claim: `the bounded depth field on a side-${SIDE} husk backed by the warped shrinking stack (${LAYERS} layers), a husk dock whose 18 lateral lines are all in use tearing from the husk so its flux leaves down its vertical link: on E-GRV-0090's lumps ${WRAPPED.join(' and ')} (which wrap ${gated.map(l => wrapsOf(l.control!)).join(' and ')} times in ${CONTROL_BEATS} beats with no tear) the torn rule runs ${BEATS} beats with ${gated.map(l => wrapsOf(l.record)).join(' and ')} wraps, Gauss off ${gated.map(l => l.record.gaussOff).join(', ')}, curl ${gated.map(l => l.record.curl).join(', ')} on ${gated.map(l => l.record.liveChecked).join(', ')} live link checks (${gated.map(l => l.record.verticalChecked).join(', ')} of them vertical), energy drift ${gated.map(l => e(l.record.energyDrift / Math.abs(l.energyStatic))).join(', ')} of the statics', reversal ${gated.every(l => l.record.reversed)}; the husk's largest step ${gated.map(l => f(l.record.huskStep)).join(', ')}, the vertical's ${gated.map(l => f(l.record.verticalStep)).join(', ')} (bound ${VERTICAL_BOUND}; static ${gated.map(l => f(l.verticalStatic)).join(', ')}, the dock's content to ${e(Math.max(...gated.map(l => l.verticalVsContent)))}), the bulk's ${gated.map(l => l.record.bulkStep.map(f).join('/')).join(', ')}; the horizon's radius ${radii.map(f).join(', ')} for M = ${MS.join(', ')} against the step window's ${predicted.map(f).join(', ')} (off ${f(radiusOff)}; husk alone sqrt(M / 18 pi) ${huskAlone.map(f).join(', ')}), slope ${f(slopeMeasured)} against ${f(slopePredicted)} (sqrt(M): 0.5, Schwarzschild: 1); the rule's husk force equals the torn solve's to ${e(ruleVsSolve)}; the torn over the free force is ${at(400).sideRatio.map(f).join(', ')} (M 400) and ${at(1600).sideRatio.map(f).join(', ')} (M 1600) at r = 5 .. 11 on side ${SIDE}, and on side ${BIG} ${far.map(fr => `${f(fr.ratio[0]!)} .. ${f(fr.ratio[fr.ratio.length - 1]!)}`).join(' and ')} at r = ${FAR_R[0]} .. ${FAR_R[FAR_R.length - 1]}`,
      metrics,
      control: { c1: c1 ? 1 : 0, controlWraps400: wrapsOf(at(400).control!), controlWraps1600: wrapsOf(at(1600).control!) },
      notes: `L2. Gates H1 ${h1}, H2 ${h2} (radius off ${f(radiusOff)}, slope ${f(slopeMeasured)} vs ${f(slopePredicted)}), H3 ${h3} (rule vs solve ${e(ruleVsSolve)}, far off ${e(farOff)}, converging ${converging}); control C1 ${c1}. Per M: ${lumps.map(l => `M ${l.m}: horizon ${l.horizonDocks} docks to ${f(l.horizonRadius)} (lump ${f(l.lumpRadius)}, most ${l.mostContent} a dock), wraps ${wrapsOf(l.record)}, husk ${f(l.record.huskStep)}, vertical ${f(l.record.verticalStep)}, bulk ${l.record.bulkStep.map(f).join('/')}, rates ${e(l.record.huskRate)}/${e(l.record.bulkRate)}, drift ${e(l.record.energyDrift)} of ${f(l.energyStatic)}, reversed ${l.record.reversed}`).join('; ')}. Side-${BIG} fits (1/r and 1/r^2 on r = 24 .. 40): ${far.map((fr, i) => `M ${WRAPPED[i]} free ${f(fr.kFree)} torn ${f(fr.kTorn)} (${fr.seconds.toFixed(0)} s)`).join('; ')}. Lines' count radius sqrt(M / 4 pi sigma) ${lineCount.map(f).join(', ')}.`,
    })
  },
})
