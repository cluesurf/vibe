// The clock horizon's radius law against the stack's massive modes and the box (E-GRV-0117): whether the shortfall of
// the radius-against-M slope from Schwarzschild's 1 is the reference dock's distance plus the stack's massive modes, and
// nothing else, read on the linear statics of the warped shrinking stack (code/rule/open-husk) for three stack depths
// under two warps and four boxes.
//
// WHY (note/research/vibe/roadmap/discrete-gravity.md, "Measured, the clock horizon" and E-GRV-0114). The slope is 0.64
// to 0.74 on boxes of side 24 to 48 and 0.88 on the infinite stack. The argument: the box costs part (the reference is
// only 21 to 42 docks away) and the massive modes (lightest mass 0.141, range 7.1) the rest, since they make the depth
// fall faster than 1/r near the lump. If that is the whole story, a formula with those two parts and no free number
// predicts the slope on every stack and box.
//
// DERIVED BEFORE THE RUN (code/measure/horizon-slope). A unit's husk depth on the stack is G(r) = (w_0 / 4 pi r) g(r),
// g(r) = 1 + sum_n beta_n e^(-r / l_n), beta_n = w_n / w_0 (code/measure/open-husk stackModes). The horizon is where
// M [G(r_h) - G(r_ref)] = CAP, so at fixed r_ref
//   s = d ln r_h / d ln M = [g(r_h) - rho g(r_ref)] / [1 + sum_n beta_n (1 + x_n) e^(-x_n)],  x_n = r_h / l_n,
//   rho = r_h / r_ref,
// and with one massive mode, to first order, 1 - s = rho + beta x e^(-x). The box costs rho = r_h / r_ref. The modes
// cost beta x e^(-x), which peaks at x = 1 and falls on both sides, so the slope climbs toward 1 with r_h / l only past
// r_h = l. The slope reaches 0.95 only where rho + beta x e^(-x) <= 0.05 (about): for E-GRV-0114's stack (beta 0.875,
// l 7.1) that is r_h >= 35 AND r_ref >= 3,500, a husk side of about 4,000.
// WHAT CAN MOVE l. On the octree stack each layer halves the side, so the lightest mass is set by the stack's DEPTH:
// 1, 2, 3 layers give l = 1.41, 3.31, 7.10 (one clock, whose statics the warped clock keeps) and 1.10, 2.45, 5.05 with
// the lapse in the links (code/rule/open-husk lapseLinks, RS's warp; its beta is 0.25 .. 0.33 against 0.50 .. 0.88).
// Finer layering does NOT make the modes heavier: the same profile cut into more slabs per doubling
// (code/measure/open-husk warpedLayering) keeps a continuum of light modes reaching down toward zero mass (RS II's
// gapless tower), reported below. So l is varied here by the stack's depth and by the warp.
//
// THE RUN (linear solves only, no beat). Stacks of 1, 2, 3 layers, one clock (warpClock) and lapse (lapseLinks), under
// husks of side 32, 48, 64, 96 (the largest a 2 GB process builds in seconds). One unit on the center dock and -1/N on
// each of the N husk docks at distance >= side / 4 from it (a far background, the reference excluded, as spreadSinks),
// solved once: by linearity the excess over the reference for any M is M times this one, so r_h(M) along the husk's six
// axes is exactly the r where M E(r) = CAP, with E(r) the six-axis mean of the unit excess. The radii read: the integers
// 4 .. side / 4 - 2 (inside the sink-free ball), where the lump would be M = CAP / E(r).
// THE MEASURED SLOPE of a (stack, box) point: the least-squares slope of ln r against ln M_r over those radii
// (code/measure/horizon-slope profileSlope). THE PREDICTED: the same fit of the derived excess g(r)/r - g(r_ref)/r_ref
// with the theory's modes ('clock' or 'lapse_upper') and r_ref the corner's own distance. Nothing is fitted to the
// solves; CAP and the normalization cancel.
// WHY r >= 4: the pair slope at r = 3 reads E(2), two docks from a point source, where the husk mesh's Green's function
// is not the continuum's; reported, not gated.
//
// GATES, fixed before the first run of this file.
//  S1 at every (stack, box) point the measured slope equals the predicted to within 0.03.
//  S2 (a) on the side-96 box, within each warp, the measured slope rises strictly as l falls (3, 2, 1 layers);
//     (b) the local slope at the largest r_h / l reached (the pair slope between r - 1 and r + 1 at the largest r / l
//     on side 96) exceeds 0.95.
//  K  (the field criterion, which reads no depth) E-GRV-0114's control: the compressed lumps M = 600 .. 1600 on sides
//     24 and 32, joined where all 18 husk links carry a line; the volume-radius slope lies within 0.1 of 0.5 on both.
//  K2 (S1 can refuse) the formula with the massive modes dropped (box only) and the formula with the reference at infinity
//     (modes only) each miss the measured slope by more than 0.03 at one (stack, box) point at least.
// Verdict: fail if S1 or K fails; partial if S1 and K hold but S2 or K2 fails; pass if all hold.
// REPORTED: every pair slope beside the derived local slope and the pair slope of the derived excess; the infinite
// stack's slopes; the husk side the formula needs for 0.95 per stack; the torn statics (clockStatics) for one stack as a
// cross-check of the free first round; the lightest mass of warpedLayering at 1, 2, 4, 8 slabs a doubling; the route
// scale (below).
// THE ROUTE SCALE (E-GRV-0116's beta hair): the same unit put one layer down (the layer-1 dock under the center, the
// route a placed lump's flux takes) minus the husk source; the zero mode carries the unit either way, so the difference
// on the husk is massive modes only, and its decay rate (a fit of ln (r D) against r, code/measure/horizon-slope
// yukawaRate) is the hair's range, reported against l on side 96.
//
// FIRST COMPLETE RUN (tmp/rh-run2.log, the record; tmp/rh-run1.log died before any gate on a zero-mode test too tight for
// a 4-layer stack's rounding, fixed in code/measure/horizon-slope; tmp/rh-run3.log, 165 s, fixed a double scaling in
// the REPORTED torn count and changed no gated number): FAIL on S1 and S2b.
//  - S1 fails, and on one side only: the measured slope sits 0.068 .. 0.094 UNDER the formula at all 24 points (worst
//    0.094, lapse L1 side 32). The shortfall is the BOX term's, not the modes': at a fixed box it hardly depends on the
//    stack (side 96: 0.068 .. 0.074 across l = 1.10 .. 7.10 and beta 0.25 .. 0.88; side 32: 0.073 .. 0.094), and the
//    local pair slopes at r = 21 on side 96 are 0.610 .. 0.621 for EVERY stack against 0.734 .. 0.748 derived. So the
//    modes' part is right to about 0.006 on the largest box (clock L3 against lapse L1: measured 0.046 apart, derived
//    0.052), and the box costs about 1.5 rho, not the rho of a reference at r_ref against a lone 1/r: the far background
//    (the -1/N sinks, and the images of a closed periodic husk) bends the excess too, and the formula leaves it out.
//  - S2a holds: on side 96 the slope rises as l falls within both warps (clock 0.744, 0.760, 0.784; lapse 0.782, 0.785,
//    0.790). S2b fails: at the largest r_h / l reached (19.2, lapse L1, r 21) the local slope is 0.621, the box's doing.
//    The largest local slope anywhere is 0.901 (lapse L1 side 96, r = 3 .. 4). By the formula (reference at infinity)
//    0.95 needs r_h 5.1 .. 23.8 and husk sides 149 .. 767 (lapse L1 .. clock L3), and with the box costing 1.5 rho more
//    than that, which a light run cannot build.
//  - K holds (field criterion 0.495, 0.495) and K2 holds (box-only 0.822 .. 0.866, modes-only 0.871 .. 0.998: each
//    misses by more than 0.03), so S1 could refuse and did.
//  - Reported: finer layering LOWERS the lightest mass (range 40.9, 70.9, 76.8, 87.2 at 1, 2, 4, 8 slabs a doubling), as
//    RS II's gapless tower says, so route (b) of the brief works only through a shallower bulk or the lapse. The torn
//    rounds join no dock beyond the free round (254, 907, 2,106 either way, volume slope 0.726). The route difference is
//    positive on the husk only for clock L2, L3 and lapse L3, decaying on 2.85, 3.67, 2.78 docks against l = 3.31, 7.10,
//    5.05; elsewhere it changes sign and no scale is read.
//
// Depth L1: a derivation checked against the linear statics of the rule's stack; no dynamics.
// DETERMINISM: every source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linearFit } from '@/code/measure/regression'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import { lapseLinks, layerDock, openMesh, warpClock, type OpenMesh } from '@/code/rule/open-husk'
import { horizonOf, horizonRule } from '@/code/rule/horizon-husk'
import { clockHorizonRule } from '@/code/rule/clock-horizon'
import { compressLump } from '@/code/measure/step-depth'
import { greenSolve, huskDistance, layeredModes, stackModes, warpedLayering, type StackMode } from '@/code/measure/open-husk'
import { axisMean, clockStatics, spreadSinks } from '@/code/measure/clock-horizon'
import { derivedSlope, lightestRange, massiveWeight, pairSlope, predictedExcess, profileSlope, sideFor, unitWithBackground, yukawaRate } from '@/code/measure/horizon-slope'

const CAP = 1.5
const TOLERANCE = 0.03
const TARGET = 0.95
const FIELD_CENTER = 0.5
const FIELD_BAND = 0.1
const SOLVE = 1e-12
const LAYERS: readonly number[] = [1, 2, 3]
const SIDES: readonly number[] = [32, 48, 64, 96]
const WARPS = [
  { name: 'clock', build: warpClock, theory: 'clock' },
  { name: 'lapse', build: lapseLinks, theory: 'lapse_upper' },
] as const
const FIELD_SIDES: readonly number[] = [24, 32]
const FIELD_MASSES: readonly number[] = [600, 800, 1200, 1600]
const TORN = { warp: 'clock', layers: 3, side: 48, radii: [4, 6, 8] } as const

const volumeRadius = (docks: number): number => Math.cbrt((3 * docks) / (4 * Math.PI))

// the unit source and its far background (code/measure/horizon-slope unitWithBackground): +1 at `at` (any dock), -1/N
// on each husk dock at distance >= side / 4 from the center, dock 0 (the reference) excluded
const unitSource = (mesh: OpenMesh, center: readonly number[], at: number): Float64Array => unitWithBackground(mesh, center, at)

type Point = {
  warp: string
  layers: number
  side: number
  range: number
  beta: number
  reference: number
  radii: number[]
  measured: number
  predicted: number
  boxOnly: number
  modesOnly: number
  pairs: { r: number; measured: number; derived: number; predictedPair: number }[]
}

export default experiment({
  id: 'gravity/horizon-slope-modes',
  code: 'E-GRV-0117',
  title:
    "the clock horizon's radius slope is the stack's massive modes plus a box that costs more than the reference's distance, fail on S1 and S2b: on the linear statics of 1, 2, 3 layer stacks under one clock and the lapse (l = 1.10 .. 7.10) and husks of side 32 .. 96, the measured slope sits 0.068 .. 0.094 under the derived [g(r_h) - rho g(r_ref)] / [1 + sum beta_n (1 + x_n) e^(-x_n)] at every point (gate 0.03), by an amount nearly the same for every stack at a fixed box (0.068 .. 0.074 on side 96), so the modes' part holds and the box's is about 1.5 rho, not rho; the slope rises as l falls (0.744 .. 0.790 on side 96) but at the largest r_h / l reached (19.2) it is 0.621 (gate 0.95), and the formula puts 0.95 on husks of side 149 .. 767; the field criterion stays at 0.495; finer layering lowers the lightest mass",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const points: Point[] = []
    const route: { warp: string; layers: number; range: number; scale: number }[] = []
    const lines: string[] = []
    let torn = { free: NaN, torn: NaN, docksFree: [] as number[], docksTorn: [] as number[] }

    for (const warp of WARPS) {
      for (const layers of LAYERS) {
        for (const side of SIDES) {
          const mesh = warp.build(openMesh(side, layers, 'shrink'))
          const modes: StackMode[] = stackModes(mesh.sides, warp.theory)
          const zeroOnly = [modes.reduce((a, m) => (m.mass < a.mass ? m : a), modes[0]!)]
          const c = side / 2
          const center = [c, c, c]
          const at = c + side * c + side * side * c
          const reference = huskDistance(mesh, 0, center)
          const x = greenSolve(mesh, unitSource(mesh, center, at), SOLVE).x
          const radii = Array.from({ length: side / 4 - 2 - 3 }, (_, i) => i + 4)
          const excess = (r: number): number => axisMean(mesh, x, center, r)
          const measured = profileSlope(
            radii,
            radii.map(r => excess(r)),
          )
          const fitOf = (m: readonly StackMode[], ref: number): number =>
            profileSlope(
              radii,
              radii.map(r => predictedExcess(m, r, ref)),
            )
          const pairs = [3, ...radii.slice(0, -1)].map(r => ({
            r,
            measured: pairSlope(r - 1, excess(r - 1), r + 1, excess(r + 1)),
            derived: derivedSlope(modes, r, reference),
            predictedPair: pairSlope(r - 1, predictedExcess(modes, r - 1, reference), r + 1, predictedExcess(modes, r + 1, reference)),
          }))

          points.push({
            warp: warp.name,
            layers,
            side,
            range: lightestRange(modes),
            beta: massiveWeight(modes),
            reference,
            radii,
            measured,
            predicted: fitOf(modes, reference),
            boxOnly: fitOf(zeroOnly, reference),
            modesOnly: fitOf(modes, Infinity),
            pairs,
          })

          // the route scale, on the largest box: the unit one layer down minus the unit on the husk
          if (side === SIDES[SIDES.length - 1]) {
            const down = greenSolve(mesh, unitSource(mesh, center, layerDock(mesh, 1, c / 2, c / 2, c / 2)), SOLVE).x
            const d = radii.map(r => excess(r) - axisMean(mesh, down, center, r))
            const rate = yukawaRate(radii, d)

            route.push({ warp: warp.name, layers, range: lightestRange(modes), scale: 1 / rate })
          }

          // the torn statics, one stack: the clock rule's rounds for the M that put the free horizon at r on the axes
          if (warp.name === TORN.warp && layers === TORN.layers && side === TORN.side) {
            const rule = clockHorizonRule(horizonRule(stepRule(16, 3), 81), CAP)
            const masses = TORN.radii.map(r => CAP / excess(r))
            const docksFree: number[] = []
            const docksTorn: number[] = []

            for (const m of masses) {
              const rho = unitSource(mesh, center, at).map(v => v * m)
              const read = clockStatics(mesh, rule, rho, SOLVE)
              let free = 0
              let all = 0

              for (let y = 1; y < mesh.huskDocks; y++) {
                if (read.free[y]! >= CAP) free++
                if (read.horizon[y]) all++
              }
              docksFree.push(free)
              docksTorn.push(all)
            }

            const slope = (docks: number[]): number => linearFit({ xs: masses.map(Math.log), ys: docks.map(n => Math.log(volumeRadius(n))) }).slope

            torn = { free: slope(docksFree), torn: slope(docksTorn), docksFree, docksTorn }
          }

          log(`${warp.name} layers ${layers} side ${side}`)
        }
      }
    }

    // the field criterion (the control): E-GRV-0114's compressed lumps and line saturation
    const fieldSlope: number[] = []

    for (const side of FIELD_SIDES) {
      const mesh = warpClock(openMesh(side, 3, 'shrink'))
      const center = [side / 2, side / 2, side / 2]
      const radius = FIELD_MASSES.map(m => {
        const lump = compressLump(radionMesh([side, side, side]), center, m, 1, spreadSinks(mesh, center, m, 9))
        const line = new Int8Array(mesh.links)

        line.set(lump.line)

        return volumeRadius(horizonOf(mesh, line).reduce((t, v) => t + v, 0))
      })

      fieldSlope.push(linearFit({ xs: FIELD_MASSES.map(Math.log), ys: radius.map(Math.log) }).slope)
      log(`field side ${side}`)
    }

    // THE GATES
    const s1 = points.every(p => Math.abs(p.measured - p.predicted) <= TOLERANCE)
    const biggest = SIDES[SIDES.length - 1]!
    const onBiggest = points.filter(p => p.side === biggest)
    const s2a = WARPS.every(w => {
      const byRange = onBiggest.filter(p => p.warp === w.name).sort((p, q) => q.range - p.range)

      return byRange.every((p, i) => i === 0 || p.measured > byRange[i - 1]!.measured)
    })
    let far = { x: -Infinity, slope: NaN, warp: '', layers: 0, r: 0 }

    for (const p of onBiggest) for (const pair of p.pairs) if (pair.r / p.range > far.x) far = { x: pair.r / p.range, slope: pair.measured, warp: p.warp, layers: p.layers, r: pair.r }

    const s2b = far.slope > TARGET
    const k = fieldSlope.every(s => Math.abs(s - FIELD_CENTER) <= FIELD_BAND)
    const boxRefuses = points.some(p => Math.abs(p.measured - p.boxOnly) > TOLERANCE)
    const modesRefuse = points.some(p => Math.abs(p.measured - p.modesOnly) > TOLERANCE)
    const k2 = boxRefuses && modesRefuse
    const status = !s1 || !k ? 'fail' : s2a && s2b && k2 ? 'pass' : 'partial'

    // REPORTED: the infinite stack, the side needed, finer layering
    for (const warp of WARPS) {
      for (const layers of LAYERS) {
        const modes = stackModes(
          Array.from({ length: layers + 1 }, (_, i) => biggest / 2 ** i),
          warp.theory,
        )
        const radii = Array.from({ length: biggest / 4 - 2 - 3 }, (_, i) => i + 4)
        const need = sideFor(modes, TARGET)
        const key = `${warp.name}_L${layers}`

        metrics[`${key}_infiniteSlope`] = profileSlope(
          radii,
          radii.map(r => predictedExcess(modes, r, Infinity)),
        )
        metrics[`${key}_sideFor95`] = need.side
        metrics[`${key}_radiusFor95`] = need.radius
        lines.push(`${key}: l ${lightestRange(modes).toFixed(2)}, beta ${massiveWeight(modes).toFixed(3)}, infinite stack slope over r 4 .. ${radii[radii.length - 1]} ${metrics[`${key}_infiniteSlope`]!.toFixed(3)}, 0.95 first reached on a side-${need.side} husk at r_h ${need.radius.toFixed(1)}`)
      }
    }

    const finer = [1, 2, 4, 8].map(per => {
      const { stiff, conduct } = warpedLayering(Math.LN2 / Math.sqrt(6), per, 1e-4)

      return lightestRange(layeredModes(stiff, conduct))
    })

    points.forEach(p => {
      const key = `${p.warp}_L${p.layers}_side${p.side}`

      metrics[`${key}_range`] = p.range
      metrics[`${key}_measured`] = p.measured
      metrics[`${key}_predicted`] = p.predicted
      metrics[`${key}_boxOnly`] = p.boxOnly
      metrics[`${key}_modesOnly`] = p.modesOnly
      metrics[`${key}_off`] = p.measured - p.predicted
      lines.push(`${key} (l ${p.range.toFixed(2)}, beta ${p.beta.toFixed(3)}, r_ref ${p.reference.toFixed(1)}, r_h ${p.radii[0]} .. ${p.radii[p.radii.length - 1]} = ${(p.radii[0]! / p.range).toFixed(2)} .. ${(p.radii[p.radii.length - 1]! / p.range).toFixed(2)} l): measured ${p.measured.toFixed(3)}, predicted ${p.predicted.toFixed(3)} (box only ${p.boxOnly.toFixed(3)}, modes only ${p.modesOnly.toFixed(3)}); pairs r: measured / derived / derived pair ${p.pairs.map(q => `${q.r}: ${q.measured.toFixed(3)}/${q.derived.toFixed(3)}/${q.predictedPair.toFixed(3)}`).join(', ')}`)
    })
    route.forEach(q => {
      metrics[`route_${q.warp}_L${q.layers}_scale`] = q.scale
      lines.push(`route hair ${q.warp} L${q.layers}: decay scale ${q.scale.toFixed(2)} against l ${q.range.toFixed(2)}`)
    })
    finer.forEach((l, i) => (metrics[`finer_per${[1, 2, 4, 8][i]}_range`] = l))
    lines.push(`warpedLayering at RS's curvature ln 2 / sqrt 6: lightest range ${finer.map(l => l.toFixed(1)).join(', ')} at 1, 2, 4, 8 slabs a doubling`)
    lines.push(`torn statics (${TORN.warp} L${TORN.layers} side ${TORN.side}, point source, M putting the free axis horizon at r = ${TORN.radii.join(', ')}): free first round docks ${torn.docksFree.join(', ')} (volume slope ${torn.free.toFixed(3)}), after the torn rounds ${torn.docksTorn.join(', ')} (${torn.torn.toFixed(3)})`)
    lines.push(`field criterion volume slope ${fieldSlope.map(s => s.toFixed(3)).join(', ')} on sides ${FIELD_SIDES.join(', ')}`)

    metrics.gate_S1 = s1 ? 1 : 0
    metrics.gate_S2a = s2a ? 1 : 0
    metrics.gate_S2b = s2b ? 1 : 0
    metrics.control_K = k ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.worstOff = Math.max(...points.map(p => Math.abs(p.measured - p.predicted)))
    metrics.farthestX = far.x
    metrics.farthestSlope = far.slope
    metrics.tornFreeSlope = torn.free
    metrics.tornSlope = torn.torn
    fieldSlope.forEach((s, i) => (metrics[`field_side${FIELD_SIDES[i]}_slope`] = s))
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `the clock horizon's slope d ln r_h / d ln M on ${points.length} (stack, box) points, l = ${[...new Set(points.map(p => p.range.toFixed(2)))].join(', ')}, sides ${SIDES.join(', ')}: worst |measured - derived| ${metrics.worstOff.toFixed(3)} (gate ${TOLERANCE}); at the largest r_h / l reached (${far.x.toFixed(1)}, ${far.warp} L${far.layers}, r ${far.r}, side ${biggest}) the local slope is ${far.slope.toFixed(3)} (gate ${TARGET}); field criterion ${fieldSlope.map(s => s.toFixed(3)).join(', ')}`,
      metrics,
      control: { k: k ? 1 : 0, k2: k2 ? 1 : 0, boxRefuses: boxRefuses ? 1 : 0, modesRefuse: modesRefuse ? 1 : 0 },
      notes: `L1. S1 ${s1}, S2a ${s2a}, S2b ${s2b}, K ${k}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
