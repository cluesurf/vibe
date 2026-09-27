// The clock horizon's radius law with the box taken out (E-GRV-0118): E-GRV-0117's statics read against the exact
// periodic Green's function of the stack's husk operator, so the box is subtracted and not guessed, and then the slope
// of r_h against M on the modes alone.
//
// WHY (note/research/vibe/roadmap/discrete-gravity.md, "Measured, the slope against the modes and the box"). E-GRV-0117
// found the modes' part of 1 - s = rho + beta x e^(-x) right to about 0.006, but on a closed periodic husk the box costs
// about 1.5 rho where the formula says rho (the far -1/N background and the husk's own images bend the excess too), so
// every measured slope sat 0.07 .. 0.09 under the formula and whether the slope goes to 1 stayed hidden.
//
// THE BOX, DERIVED (code/measure/husk-box). The stack's husk kernel K(p) = sum_n w_n / (lambda(p) / 6 + m_n^2), with
// lambda the husk mesh's own symbol and (w_n, m_n) code/measure/open-husk stackModes, summed exactly over the torus's
// momenta (periodicGreen: the zero mode's p = 0 left out, E-GRV-0117's -1/N background then placed on the docks it was
// placed on) gives the periodic excess E_N(r). The same kernel on the infinite husk is G_inf = G_N - imageShift, the
// images summed in the continuum (Ewald's split for the zero mode, direct sums for the Yukawas) plus the mesh's
// zero-mean offset w_0 / (12 N^3). The box correction is
//   Delta(r) = E_N(r) - G_inf(r) = imageShift(r) - B(r) - [G_N(c) - B_0],
// the images, the background's own well at r, and the reference dock's depth, with no free number.
// B1 tests it: the least-squares slope of E_N over E-GRV-0117's radii predicts that experiment's measured slope.
//
// THE BOX-FREE READING. The measured excess (the linear solve of the rule's stack, greenSolve) less Delta:
//   E_free(r) = E_measured(r) - Delta(r),
// the lump's own excess read against a reference at infinity, with the mesh's short-range structure left in it (Delta
// holds none: its lattice parts cancel between E_N and G_inf). Its pair slopes s(r) = ln((r+1)/(r-1)) / ln(E(r-1) /
// E(r+1)) are compared with THE FORMULA WITH THE REFERENCE AT INFINITY read the same way: the pair slope of
// g(r) / r = [1 + sum_n beta_n e^(-r / l_n)] / r, whose local form is
//   s = g(r) / [1 + sum_n beta_n (1 + x_n) e^(-x_n)],  x_n = r / l_n,
// that is 1 - s = sum_n beta_n x_n e^(-x_n) / [1 + sum_n beta_n (1 + x_n) e^(-x_n)], whose first order is the
// 1 - s = beta x e^(-x) of the brief. The gate reads the full form (the first order is off by 0.13 at beta 0.875, x = 1,
// which no reading could match); the first order is reported beside it. Pure 1/r reads a pair slope of exactly 1, so the
// stencil adds nothing for the zero mode.
//
// THE RUN (linear solves only, no beat). E-GRV-0117's 24 points: stacks of 1, 2, 3 layers under one clock (warpClock)
// and the lapse (lapseLinks), husks of side 32, 48, 64, 96, a unit at the center and -1/N on each husk dock at distance
// >= side / 4 (dock 0, the reference, excluded), solved once. Excess read along the six axes at r = 2 .. side / 4 - 2.
//
// GATES, fixed before the first run of this file.
//  C0 (the machinery) on the husk alone (no layers) of side 32, where the kernel is the mesh's exactly, the periodic
//     excess equals the linear solve's at r = 1 .. 7 to 1e-10.
//  B1 at every one of the 24 (stack, side) points, the slope of E_N over r = 4 .. side / 4 - 2 equals the measured slope
//     over the same radii (E-GRV-0117's reading) to within 0.01.
//  B2 for the stack with the smallest l (lapse, 1 layer, l = 1.10), every box-free pair slope at r >= 5 l on every side
//     that reaches it (r = 6 .. side / 4 - 3) is above 0.95.
//  B3 for every one of the 24 points, (a) every box-free pair slope at r >= 4 is within 0.01 of the formula's pair slope
//     at that r, and (b) the box-free pair slopes at r >= max(4, l) never fall as r grows.
//  K  (the field criterion, which reads no depth) E-GRV-0114's control: the compressed lumps M = 600 .. 1600 on sides
//     24 and 32; the volume-radius slope lies within 0.1 of 0.5 on both.
//  K2 (B1 can refuse) E-GRV-0117's formula with the box as rho, and the periodic kernel with a uniform background in
//     place of the far docks' (the images alone), each miss the measured slope by more than 0.01 at one point at least.
// Verdict: fail if C0, B1 or K fails; partial if they hold but B2, B3 or K2 fails; pass if all hold.
// REPORTED: per point the box's cost to the fitted slope against rho's (E-GRV-0117 read about 1.5); the box-free fitted
// slope beside the formula's; every pair slope (measured, box-free, the formula's, its first order, the infinite
// lattice kernel's); how far the box-free excess at r <= 6 moves between side 32 and side 96 (the correction's own
// check: a box-free reading has no side).
//
// FIRST RUN (tmp/box-run1.log, the record, 203 s): PARTIAL, B3 fails.
//  - C0 holds: the husk alone matches the linear solve to 3.9e-15. Machinery probe (tmp/box-probe1.log): G_inf from
//    sides 32, 64, 96 agrees to 5e-11 once the w_0 / (12 N^3) offset is in (without it the three differ by exactly
//    w_0 / 12 over the volume, which is how the offset was found; it was derived from the mesh's p^4 term before this
//    file ran).
//  - B1 holds: the periodic kernel predicts all 24 measured slopes to 0.0046 (worst clock L2 side 32; side 96: 0.0006 ..
//    0.0033), always a little above the measured. The box costs 1.496 .. 1.547 rho (E-GRV-0117's "about 1.5 rho"),
//    rising with the side toward what the images and background give in the limit.
//  - B2 holds: lapse L1's box-free pair slopes at r >= 5 l are 0.994 .. 1.012 on sides 48, 64, 96 (gate 0.95).
//  - B3 fails, on both clauses: the box-free pair slopes follow the formula to within 0.005 out to r = N / 10 on every
//    side, and every miss over 0.01 is at r >= 0.14 N (r 11 .. 13 of side 64, 14 .. 21 of side 96), where they
//    overshoot 1 toward the edge of the sink-free ball (1.010 .. 1.014 at r = 18 .. 21 on side 96 for lapse L1 .. L3,
//    worst 0.0143 against the formula, lapse L3 side 96 r 21), and wiggle there at the 1e-3 level (lapse L2 side 96:
//    1.0093, 1.0092, 1.0082, 1.0107 at r 14 .. 17), so (b) fails too. The same overshoot appears on every side at the
//    same r / N (1.009 at r 9 of side 48, 1.011 at r 13 of side 64), and the box-free excess at r <= 6 moves 0.6 ..
//    0.9 percent between side 32 and side 96, so what is left is a box-shaped residual of about 1 percent of the box
//    correction, largest where the reading comes within 2 docks of the far background: the kernel's short-range form near
//    the sinks is the translation-invariant mode kernel's, not the octree's. That is the likely source; this run does
//    not test it.
//  - K holds (field criterion 0.495, 0.495) and K2 holds (rho formula 0.732 .. 0.864 and uniform background 0.642 ..
//    0.770 against measured 0.659 .. 0.790: each misses by more than 0.01), so B1 could refuse and did not.
//
// Depth L1: a derivation checked against the linear statics of the rule's stack; no dynamics.
// DETERMINISM: every source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linearFit } from '@/code/measure/regression'
import { radionMesh } from '@/code/rule/trit-radion'
import { lapseLinks, openMesh, warpClock } from '@/code/rule/open-husk'
import { horizonOf } from '@/code/rule/horizon-husk'
import { compressLump } from '@/code/measure/step-depth'
import { greenSolve, huskCoord, huskDistance, stackModes, type StackMode } from '@/code/measure/open-husk'
import { axisMean, spreadSinks } from '@/code/measure/clock-horizon'
import { backgroundDocks, derivedSlope, lightestRange, massiveWeight, pairSlope, predictedExcess, profileSlope, unitWithBackground } from '@/code/measure/horizon-slope'
import { backgroundResponse, coulombImages, greenAt, imageShift, periodicExcess, periodicGreen, splitModes } from '@/code/measure/husk-box'

const B1_TOLERANCE = 0.01
const B3_TOLERANCE = 0.01
const TARGET = 0.95
const FAR_X = 5
const MACHINE = 1e-10
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
const MACHINE_SIDE = 32

const volumeRadius = (docks: number): number => Math.cbrt((3 * docks) / (4 * Math.PI))

// the formula's first order, 1 - sum_n beta_n x_n e^(-x_n)
function firstOrder(modes: readonly StackMode[], r: number): number {
  const { w0, massive } = splitModes(modes)

  return 1 - massive.reduce((t, m) => t + (m.weight / w0) * m.mass * r * Math.exp(-m.mass * r), 0)
}

type Pair = { r: number; measured: number; free: number; formula: number; local: number; first: number; lattice: number }

type Point = {
  warp: string
  layers: number
  side: number
  range: number
  beta: number
  reference: number
  measured: number
  predicted: number
  rhoFormula: number
  uniform: number
  formulaFit: number
  freeFit: number
  boxCost: number
  rhoCost: number
  free: Map<number, number>
  pairs: Pair[]
}

export default experiment({
  id: 'gravity/horizon-slope-box',
  code: 'E-GRV-0118',
  title:
    "with the box taken out the clock horizon's radius goes as M, partial, fail on B3: the stack's mode kernel summed exactly over the periodic husk, with E-GRV-0117's far background placed where it was, predicts all 24 measured slopes to 0.0046 (gate 0.01) with no free number, the box costing 1.50 .. 1.55 rho; subtracting it, the lapse L1 stack's local slope at r >= 5 l is 0.994 .. 1.012 (gate 0.95) and every stack follows 1 - s = sum beta x e^(-x) / [1 + sum beta (1 + x) e^(-x)] to 0.005 out to r = N / 10, but from r = 0.14 N toward the far background it overshoots 1 by up to 0.014 and wiggles at 1e-3 (gate 0.01, monotone); the field criterion stays at 0.495",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const points: Point[] = []
    const lines: string[] = []
    const coulomb = new Map<string, number>()
    const coulombAt = (side: number, r: number): number => {
      const key = `${side}:${r}`

      if (!coulomb.has(key)) coulomb.set(key, coulombImages(side, [r, 0, 0]))

      return coulomb.get(key)!
    }

    // C0: the husk alone, where the periodic kernel is the mesh's exactly
    let machine = 0
    {
      const side = MACHINE_SIDE
      const mesh = openMesh(side, 0, 'shrink')
      const c = side / 2
      const center = [c, c, c]
      const far = backgroundDocks(mesh, center)
      const x = greenSolve(mesh, unitWithBackground(mesh, center, c + side * c + side * side * c, far), SOLVE).x
      const g = periodicGreen(stackModes(mesh.sides, 'none'), side)
      const farAt = far.map(y => huskCoord(mesh, y))

      for (let r = 1; r <= side / 4 - 1; r++) machine = Math.max(machine, Math.abs(axisMean(mesh, x, center, r) - periodicExcess(g, center, farAt, r)))
      log('machinery')
    }

    for (const warp of WARPS) {
      for (const layers of LAYERS) {
        for (const side of SIDES) {
          const mesh = warp.build(openMesh(side, layers, 'shrink'))
          const modes = stackModes(mesh.sides, warp.theory)
          const c = side / 2
          const center = [c, c, c]
          const at = c + side * c + side * side * c
          const reference = huskDistance(mesh, 0, center)
          const far = backgroundDocks(mesh, center)
          const farAt = far.map(y => huskCoord(mesh, y))
          const x = greenSolve(mesh, unitWithBackground(mesh, center, at, far), SOLVE).x
          const g = periodicGreen(modes, side)
          const reads = Array.from({ length: side / 4 - 3 }, (_, i) => i + 2)
          const measured = new Map<number, number>()
          const periodic = new Map<number, number>()
          const uniform = new Map<number, number>()
          const infinite = new Map<number, number>()
          const free = new Map<number, number>()
          // the source's periodic response at dock 0, the reference
          const refResponse = backgroundResponse(g, center, farAt, [0, 0, 0])

          for (const r of reads) {
            const e = axisMean(mesh, x, center, r)
            const eN = periodicExcess(g, center, farAt, r, refResponse)
            const gInf = greenAt(g, r, 0, 0) - imageShift(modes, side, [r, 0, 0], coulombAt(side, r))

            measured.set(r, e)
            periodic.set(r, eN)
            uniform.set(r, greenAt(g, r, 0, 0) - greenAt(g, c, c, c))
            infinite.set(r, gInf)
            free.set(r, e - (eN - gInf))
          }

          const radii = reads.filter(r => r >= 4)
          const fit = (m: Map<number, number>): number =>
            profileSlope(
              radii,
              radii.map(r => m.get(r)!),
            )
          const formula = (r: number): number => predictedExcess(modes, r, Infinity)
          const formulaFit = profileSlope(radii, radii.map(formula))
          const rhoFormula = profileSlope(
            radii,
            radii.map(r => predictedExcess(modes, r, reference)),
          )
          const pairAt = (m: Map<number, number>, r: number): number => pairSlope(r - 1, m.get(r - 1)!, r + 1, m.get(r + 1)!)
          const pairs: Pair[] = reads
            .filter(r => r >= 3 && r + 1 <= reads[reads.length - 1]!)
            .map(r => ({
              r,
              measured: pairAt(measured, r),
              free: pairAt(free, r),
              formula: pairSlope(r - 1, formula(r - 1), r + 1, formula(r + 1)),
              local: derivedSlope(modes, r, Infinity),
              first: firstOrder(modes, r),
              lattice: pairAt(infinite, r),
            }))
          const measuredFit = fit(measured)
          const predicted = fit(periodic)

          points.push({
            warp: warp.name,
            layers,
            side,
            range: lightestRange(modes),
            beta: massiveWeight(modes),
            reference,
            measured: measuredFit,
            predicted,
            rhoFormula,
            uniform: fit(uniform),
            formulaFit,
            freeFit: fit(free),
            boxCost: formulaFit - predicted,
            rhoCost: formulaFit - rhoFormula,
            free,
            pairs,
          })
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
    const c0 = machine <= MACHINE
    const b1 = points.every(p => Math.abs(p.measured - p.predicted) <= B1_TOLERANCE)
    const shortest = points.filter(p => p.warp === 'lapse' && p.layers === 1)
    const farPairs = shortest.flatMap(p => p.pairs.filter(q => q.r >= FAR_X * p.range).map(q => ({ side: p.side, ...q })))
    const b2 = farPairs.length > 0 && farPairs.every(q => q.free > TARGET)
    const b3a = points.every(p => p.pairs.filter(q => q.r >= 4).every(q => Math.abs(q.free - q.formula) <= B3_TOLERANCE))
    const b3b = points.every(p => {
      const rising = p.pairs.filter(q => q.r >= Math.max(4, p.range))

      return rising.every((q, i) => i === 0 || q.free >= rising[i - 1]!.free)
    })
    const b3 = b3a && b3b
    const k = fieldSlope.every(s => Math.abs(s - FIELD_CENTER) <= FIELD_BAND)
    const rhoRefuses = points.some(p => Math.abs(p.measured - p.rhoFormula) > B1_TOLERANCE)
    const uniformRefuses = points.some(p => Math.abs(p.measured - p.uniform) > B1_TOLERANCE)
    const k2 = rhoRefuses && uniformRefuses
    const status = !c0 || !b1 || !k ? 'fail' : b2 && b3 && k2 ? 'pass' : 'partial'

    // REPORTED: the box-free excess's side independence, per stack, at r <= 6
    for (const warp of WARPS) {
      for (const layers of LAYERS) {
        const small = points.find(p => p.warp === warp.name && p.layers === layers && p.side === SIDES[0])!
        const big = points.find(p => p.warp === warp.name && p.layers === layers && p.side === SIDES[SIDES.length - 1])!
        let drift = 0

        for (const [r, e] of small.free) if (r <= 6) drift = Math.max(drift, Math.abs(e / big.free.get(r)! - 1))
        metrics[`${warp.name}_L${layers}_freeDrift`] = drift
        lines.push(`${warp.name} L${layers}: the box-free excess at r 2 .. 6 moves at most ${(100 * drift).toFixed(3)} percent between side ${SIDES[0]} and side ${SIDES[SIDES.length - 1]}`)
      }
    }

    points.forEach(p => {
      const key = `${p.warp}_L${p.layers}_side${p.side}`
      const worst = Math.max(0, ...p.pairs.filter(q => q.r >= 4).map(q => Math.abs(q.free - q.formula)))

      metrics[`${key}_range`] = p.range
      metrics[`${key}_measured`] = p.measured
      metrics[`${key}_predicted`] = p.predicted
      metrics[`${key}_off`] = p.measured - p.predicted
      metrics[`${key}_rhoFormula`] = p.rhoFormula
      metrics[`${key}_uniform`] = p.uniform
      metrics[`${key}_boxOverRho`] = p.boxCost / p.rhoCost
      metrics[`${key}_freeFit`] = p.freeFit
      metrics[`${key}_formulaFit`] = p.formulaFit
      metrics[`${key}_freeWorst`] = worst
      lines.push(
        `${key} (l ${p.range.toFixed(2)}, beta ${p.beta.toFixed(3)}, r_ref ${p.reference.toFixed(1)}): measured ${p.measured.toFixed(4)}, periodic ${p.predicted.toFixed(4)} (off ${(p.measured - p.predicted).toFixed(4)}), rho formula ${p.rhoFormula.toFixed(4)}, uniform background ${p.uniform.toFixed(4)}; box cost ${p.boxCost.toFixed(4)} = ${(p.boxCost / p.rhoCost).toFixed(3)} rho's; box-free fit ${p.freeFit.toFixed(4)} against the formula's ${p.formulaFit.toFixed(4)}; pairs r (r / l): measured / box-free / formula / local / first order / lattice kernel ${p.pairs.map(q => `${q.r} (${(q.r / p.range).toFixed(2)}): ${q.measured.toFixed(3)}/${q.free.toFixed(4)}/${q.formula.toFixed(4)}/${q.local.toFixed(4)}/${q.first.toFixed(4)}/${q.lattice.toFixed(4)}`).join(', ')}`,
      )
    })
    farPairs.forEach(q => (metrics[`B2_side${q.side}_r${q.r}`] = q.free))
    lines.push(`field criterion volume slope ${fieldSlope.map(s => s.toFixed(3)).join(', ')} on sides ${FIELD_SIDES.join(', ')}`)

    metrics.gate_C0 = c0 ? 1 : 0
    metrics.gate_B1 = b1 ? 1 : 0
    metrics.gate_B2 = b2 ? 1 : 0
    metrics.gate_B3 = b3 ? 1 : 0
    metrics.gate_B3a = b3a ? 1 : 0
    metrics.gate_B3b = b3b ? 1 : 0
    metrics.control_K = k ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.machine = machine
    metrics.worstB1 = Math.max(...points.map(p => Math.abs(p.measured - p.predicted)))
    metrics.worstB3 = Math.max(...points.flatMap(p => p.pairs.filter(q => q.r >= 4).map(q => Math.abs(q.free - q.formula))))
    metrics.lowestB2 = Math.min(...farPairs.map(q => q.free))
    fieldSlope.forEach((s, i) => (metrics[`field_side${FIELD_SIDES[i]}_slope`] = s))
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `the clock horizon's slope with the box taken out, on ${points.length} (stack, side) points: machinery ${machine.toExponential(1)} (gate ${MACHINE}); worst |measured - periodic| ${metrics.worstB1.toFixed(4)} (gate ${B1_TOLERANCE}); lapse L1 box-free pair slopes at r >= ${FAR_X} l lowest ${metrics.lowestB2.toFixed(4)} (gate ${TARGET}); worst |box-free - formula| ${metrics.worstB3.toFixed(4)} (gate ${B3_TOLERANCE}), rising ${b3b}; field criterion ${fieldSlope.map(s => s.toFixed(3)).join(', ')}`,
      metrics,
      control: { k: k ? 1 : 0, k2: k2 ? 1 : 0, rhoRefuses: rhoRefuses ? 1 : 0, uniformRefuses: uniformRefuses ? 1 : 0 },
      notes: `L1. C0 ${c0}, B1 ${b1}, B2 ${b2}, B3 ${b3} (a ${b3a}, b ${b3b}), K ${k}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
