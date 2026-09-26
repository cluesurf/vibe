// One renormalization step of the knit: block it, measure the coarse rule the blocks follow, and set its
// couplings beside the fine ones. The step the multiscale ladder needs between the knit and a fluid.
//
// E-SCL-0016 found that a block average of the committed knit hides almost all of its information and
// still follows a law of its own to the accuracy of the law of large numbers. This asks what that law is,
// on the scatter weave that reaches hydrodynamics (E-FLD-0026: the pair clock, matched, 36 scatterings a
// beat), with the lattice Boltzmann equation of E-FLD-0030 as the prediction (code/coarse/knit-boltzmann,
// 400,000 draws a phase under two salts, averaged).
//
// THE RUN. The knit at L = 24 (the even side E-FLD-0026 used, so two parity sublattices; every block of
// side 2 or more holds both) from a product start at occupation 2/3, the background it relaxes to
// (productState, independent slots), with no imposed flow: the coarse rule is read off the equilibrium
// fluctuations, which by Onsager's regression hypothesis relax as imposed disturbances do. Coarse steps
// start at t0 = 24, 30, ..., 192 (29 starts, schedule phases 0, 6, 12 and 18 in turn), 208 beats in all.
// The control is pure streaming from the same start, where the Boltzmann description is exact.
//
// 1. WHICH FIELDS THE COARSE RULE KEEPS. The whole-mesh sum of charge, the four components of P, the line
//    sum S and the tone count at every beat: a coarse field is conserved exactly when its sum never moves.
// 2. THE COARSE RULE. For each component of P and for the count, at block sizes b = 2 (the D4-natural
//    block, 2^4 docks, eight of each parity), 3 and 4 with tau = b^2 beats a coarse step (the diffusive
//    scaling): the least-squares kernel G(X, t + tau) = a G(X, t) + sum over j of c_j (G(X + e_j, t) +
//    G(X - e_j, t)) over every block and start (code/coarse/block-renormalization), its standard errors,
//    and its cross share s = a + 2 sum c_j. On white equilibrium fields the kernel is the block propagator,
//    the share of a block's fluctuation found at each offset tau beats later. The same kernel predicted in
//    closed form by the equation from the product background's one-body covariance, averaged over the
//    same four start phases.
// 3. THE FINE COUPLINGS AND THE FLOW. The equation's hydrodynamic transport matrix along each axis
//    (code/coarse/knit-hydrodynamics, k0 = 0.005) gives the diffusivity a regression of P_a on its own
//    neighbours sees, D_eff = (D^(j) Sigma)_aa / Sigma_aa (Sigma the densities' equilibrium covariance in a
//    dock, which couples P to S). A density that spreads as a Gaussian with those diffusivities has a
//    block kernel that is the same at every b under tau = b^2 (diffusiveFixedPoint): the fixed point of the
//    step. Each measured or predicted kernel is also read back as the diffusivity its c_j / a amounts to
//    (effectiveDiffusivity), the coupling at that block size in the fine units, beside D_eff.
//
// Gates, fixed before this ran. What had been seen: only the streaming control (the prediction exact,
// every coefficient zero at b = 2 and 3 at L = 12) and the fixed point of an isotropic D = 0.47 (a =
// 0.021, c = 0.013, s = 0.125), both while writing the code. An earlier version of this file fitted a
// Laplacian rule instead of the kernel; the streaming probe showed that form reads 1/9 on every axis from
// white fluctuations whatever moves them, so it was replaced before any knit run of it was read.
// - C1: the whole-mesh sums of charge, P0 to P3 and S never move over the 208 beats and the count's does;
// - C2: every kernel coefficient (a, c_0..c_3) of P0 to P3 and of the count at b = 2, 3 and 4 (75 numbers)
//   is within max(0.005, 4 standard errors) of its Boltzmann prediction;
// - C3: the predicted P0 kernel is nearer the fixed point at b = 4 than at b = 2 (largest coefficient
//   difference), and the streaming control's cross share is within 4 standard errors of zero at every b.
// Reported: every coefficient measured and predicted, the fixed point, the effective diffusivities
// against D_eff, the count's kernel, r2 against b.
//
// After the first run (C2 and C3 failed, every number the same as the second run's), a second knit run
// from an independent start was added as a diagnostic, not a gate: it says whether a gap between knit and
// prediction is sampling or systematic. The gates were not changed.
//
// Depth L2: a block renormalization step of a lattice gas, measured, and predicted by its kinetic equation.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { passThrough } from '@/code/rule/collision'
import { makeWill } from '@/code/tone/will'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { CHARGE_VECTOR, COUNT_VECTOR, LINE_SUM_VECTOR, linearizedSchedule, momentumVector, productState, uniformBackground } from '@/code/coarse/knit-boltzmann'
import { hydrodynamicGenerator } from '@/code/coarse/knit-hydrodynamics'
import {
  accumulateKernel,
  blockFields,
  densityCovariance,
  diffusiveFixedPoint,
  effectiveDiffusivity,
  emptyKernel,
  predictedKernels,
  solveKernel,
  type BlockKernel,
  type KernelSums,
} from '@/code/coarse/block-renormalization'

const SIDE = 24
const SAMPLES = 400000
const SALTS = [11, 29]
const STARTS = Array.from({ length: 29 }, (_, i) => 24 + 6 * i)
const PHASES = [0, 6, 12, 18]
const BLOCKS = [2, 3, 4]
const K0 = 0.005
const OCCUPATION = 2 / 3
const START_SALT = 3
const REPLICATE_SALT = 5
const OPPOSITE = rootsD4().map((r, _, all) => all.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))

const MOMENTA = [0, 1, 2, 3].map(a => momentumVector([0, 1, 2, 3].map(i => (i === a ? 1 : 0))))
// the kernel fields: the four momenta and the count
const KERNEL_FIELDS: readonly (readonly [string, Float64Array])[] = [
  ['p0', MOMENTA[0] as Float64Array],
  ['p1', MOMENTA[1] as Float64Array],
  ['p2', MOMENTA[2] as Float64Array],
  ['p3', MOMENTA[3] as Float64Array],
  ['count', COUNT_VECTOR],
]
const SUMMED: readonly (readonly [string, Float64Array])[] = [['charge', CHARGE_VECTOR], ...KERNEL_FIELDS.slice(0, 4), ['line', LINE_SUM_VECTOR], ['count', COUNT_VECTOR]]
const CONSERVED = ['charge', 'p0', 'p1', 'p2', 'p3', 'line']

type Run = { kernels: BlockKernel[][]; drifts: number[] }

// run a scheduled collision from the start and fit the kernels, with the whole-mesh drift of every sum
function runKernels(collision: (t: number) => (slots: Int8Array, base: number, degree: number) => void, startSalt = START_SALT): Run {
  const mesh = d4Mesh({ side: SIDE })
  const table = streamSourceTable(mesh)
  const lefts = KERNEL_FIELDS.map(([, v]) => v)
  const wanted = new Map<number, Set<number>>()

  for (const t0 of STARTS) {
    for (const b of BLOCKS) {
      wanted.set(t0, new Set([...(wanted.get(t0) ?? []), b]))
      wanted.set(t0 + b * b, new Set([...(wanted.get(t0 + b * b) ?? []), b]))
    }
  }

  const stored = new Map<string, Float64Array[]>()
  const sums: KernelSums[][] = KERNEL_FIELDS.map(() => BLOCKS.map(() => emptyKernel()))
  const first = new Float64Array(SUMMED.length)
  const drifts = new Array<number>(SUMMED.length).fill(0)
  const lastBeat = Math.max(...STARTS) + Math.max(...BLOCKS) ** 2

  let current = { mesh, data: productState({ docks: mesh.cellCount, background: uniformBackground(OCCUPATION), salt: startSalt }) }
  let scratch = makeWill(mesh)

  for (let t = 0; t <= lastBeat; t++) {
    if (t > 0) {
      beatInto({ src: current, dst: scratch, table, collision: collision(t - 1) })
      ;[current, scratch] = [scratch, current]
    }

    // the whole-mesh count of love and fear on each slot direction, then each density's sum
    const totals = new Float64Array(48)

    for (let i = 0; i < current.data.length; i++) {
      const v = current.data[i] ?? 0

      if (v !== 0) {
        const at = (i % 24) * 2 + (v > 0 ? 0 : 1)

        totals[at] = (totals[at] ?? 0) + 1
      }
    }

    SUMMED.forEach(([, left], q) => {
      const v = totals.reduce((acc, c, i) => acc + c * (left[i] ?? 0), 0)

      if (t === 0) {
        first[q] = v
      }

      drifts[q] = Math.max(drifts[q] ?? 0, Math.abs(v - (first[q] ?? 0)))
    })

    for (const b of wanted.get(t) ?? []) {
      stored.set(`${t}:${b}`, blockFields({ data: current.data, side: SIDE, block: b, lefts }))
    }

    // close every pair that ends at this beat; no end beat is also a start (tau = 4, 9, 16 against starts
    // 6 apart), so both fields are dropped once used
    for (const t0 of STARTS) {
      for (const b of BLOCKS) {
        if (t0 + b * b !== t) {
          continue
        }

        const before = stored.get(`${t0}:${b}`)
        const after = stored.get(`${t}:${b}`)

        if (before && after) {
          lefts.forEach((_, q) => accumulateKernel(sums[q]?.[BLOCKS.indexOf(b)] as KernelSums, before[q] as Float64Array, after[q] as Float64Array, SIDE / b))
        }

        stored.delete(`${t0}:${b}`)
        stored.delete(`${t}:${b}`)
      }
    }
  }

  return { kernels: sums.map(row => row.map(solveKernel)), drifts }
}

export default experiment({
  id: 'renormalization/knit-block-step',
  code: 'E-SCL-0017',
  title:
    'one block step of the scatter weave: its block sums keep exactly charge, P and the line sum and not the count (which moves by 4,490 and has no block memory), and the coarse rule they follow, the block propagator of the equilibrium fluctuations under tau = b^2, is predicted by the knit lattice Boltzmann equation to 2 to 5 percent, but not to the knit own precision at b = 2: there the knit blocks forget faster than molecular chaos allows (self share 0.0836 against 0.0869 for P0, 0.1408 against 0.1484 for P3, the same sign in two independent runs, the gap 3.5 times the replicate spread), a closure error that is within noise by b = 3 and 4; the predicted kernel halves its distance to the diffusive fixed point from b = 2 to 4',
  category: 'renormalization',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
    const spec: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
    const background = uniformBackground(OCCUPATION)
    const rule = scatterCollision({ spec, opposite: OPPOSITE })
    const [ma, mb] = SALTS.map(salt => linearizedSchedule({ rule, period: 24, background, samples: SAMPLES, salt }))
    const matrices = (ma ?? []).map((m, t) => m.map((v, i) => (v + (mb?.[t]?.[i] ?? 0)) / 2))

    const knitRule = scatterCollision({ spec, opposite: meshOpposites(d4Mesh({ side: SIDE })) })
    const knit = runKernels(knitRule)
    const replicate = runKernels(knitRule, REPLICATE_SALT)
    const streaming = runKernels(() => passThrough)
    const predicted = predictedKernels({ matrices, background, lefts: KERNEL_FIELDS.map(([, v]) => v), side: SIDE, steps: BLOCKS.map(b => ({ block: b, tau: b * b })), phases: PHASES })

    // the fine couplings: D_eff per axis for each momentum component, and each component's fixed point
    const densities: Record<string, Float64Array> = { charge: CHARGE_VECTOR, p0: MOMENTA[0] as Float64Array, p1: MOMENTA[1] as Float64Array, p2: MOMENTA[2] as Float64Array, p3: MOMENTA[3] as Float64Array, line: LINE_SUM_VECTOR }
    const names = Object.keys(densities)
    const sigma = names.map(p => names.map(q => densityCovariance(background, densities[p] as Float64Array, densities[q] as Float64Array)))
    const generators = [0, 1, 2, 3].map(j => hydrodynamicGenerator({ matrices, direction: [0, 1, 2, 3].map(i => (i === j ? 1 : 0)), k0: K0, densities }))
    const deff = [0, 1, 2, 3].map(a => {
      const q = names.indexOf(`p${a}`)

      return generators.map(h => {
        let s = 0

        for (let p = 0; p < names.length; p++) {
          s += (h.transport.re[q * names.length + p] ?? 0) * (sigma[p]?.[q] ?? 0)
        }

        return s / (sigma[q]?.[q] ?? 1)
      })
    })
    const fixedPoints = deff.map(d => diffusiveFixedPoint(d))

    const metrics: Record<string, number> = {}
    const coefficientsOf = (k: BlockKernel): number[] => [k.self, ...Array.from(k.neighbours)]
    const errorsOf = (k: BlockKernel): number[] => [k.selfError, ...Array.from(k.neighbourErrors)]
    const labels = ['a', 'c0', 'c1', 'c2', 'c3']

    let c2 = true
    let worstStandardized = 0

    KERNEL_FIELDS.forEach(([name], q) => {
      BLOCKS.forEach((b, s) => {
        const m = knit.kernels[q]?.[s] as BlockKernel
        const p = predicted[q]?.[s] as BlockKernel
        const mc = coefficientsOf(m)
        const pc = coefficientsOf(p)
        const me = errorsOf(m)

        labels.forEach((label, i) => {
          metrics[`${name}_b${b}_${label}_knit`] = mc[i] ?? 0
          metrics[`${name}_b${b}_${label}_se`] = me[i] ?? 0
          metrics[`${name}_b${b}_${label}_predicted`] = pc[i] ?? 0

          const gap = Math.abs((mc[i] ?? 0) - (pc[i] ?? 0))

          c2 = c2 && gap <= Math.max(0.005, 4 * (me[i] ?? 0))
          worstStandardized = Math.max(worstStandardized, gap / Math.max(1e-12, me[i] ?? 0))
        })
        metrics[`${name}_b${b}_cross_knit`] = m.cross
        metrics[`${name}_b${b}_cross_predicted`] = p.cross
        metrics[`${name}_b${b}_r2_knit`] = m.r2
        metrics[`${name}_b${b}_r2_predicted`] = p.r2

        if (q < 4) {
          for (let j = 0; j < 4; j++) {
            metrics[`${name}_b${b}_axis${j}_diffusivityKnit`] = effectiveDiffusivity((m.neighbours[j] ?? 0) / m.self)
            metrics[`${name}_b${b}_axis${j}_diffusivityPredicted`] = effectiveDiffusivity((p.neighbours[j] ?? 0) / p.self)
          }
        }

        metrics[`streaming_${name}_b${b}_cross`] = streaming.kernels[q]?.[s]?.cross ?? 0
      })

      if (q < 4) {
        const fp = fixedPoints[q] as BlockKernel

        coefficientsOf(fp).forEach((v, i) => (metrics[`${name}_fixedPoint_${labels[i]}`] = v))
        metrics[`${name}_fixedPoint_cross`] = fp.cross
        deff[q]?.forEach((v, j) => (metrics[`${name}_axis${j}_deff`] = v))
      }
    })

    SUMMED.forEach(([name], q) => {
      metrics[`drift_${name}`] = knit.drifts[q] ?? 0
    })

    // the replicate diagnostic: per block size, the single-run spread from two independent starts
    // (rms of their difference over sqrt 2, over the 25 coefficients), the rms gap of their mean to the
    // prediction, and the mean gap of the self share a over the four momenta, in each run
    BLOCKS.forEach((b, s) => {
      let spread = 0
      let gap = 0
      let count = 0
      let selfA = 0
      let selfB = 0

      KERNEL_FIELDS.forEach((_, q) => {
        const ka = coefficientsOf(knit.kernels[q]?.[s] as BlockKernel)
        const kb = coefficientsOf(replicate.kernels[q]?.[s] as BlockKernel)
        const kp = coefficientsOf(predicted[q]?.[s] as BlockKernel)

        ka.forEach((v, i) => {
          spread += (v - (kb[i] ?? 0)) ** 2 / 2
          gap += ((v + (kb[i] ?? 0)) / 2 - (kp[i] ?? 0)) ** 2
          count++
        })

        if (q < 4) {
          selfA += ((ka[0] ?? 0) - (kp[0] ?? 0)) / 4
          selfB += ((kb[0] ?? 0) - (kp[0] ?? 0)) / 4
        }
      })

      metrics[`replicate_b${b}_singleRunSpread`] = Math.sqrt(spread / count)
      metrics[`replicate_b${b}_meanGapRms`] = Math.sqrt(gap / count)
      metrics[`replicate_b${b}_expectedGapFromSpread`] = Math.sqrt(spread / count / 2)
      metrics[`replicate_b${b}_selfShareGapRunA`] = selfA
      metrics[`replicate_b${b}_selfShareGapRunB`] = selfB
    })

    const c1 = SUMMED.every(([name], q) => (CONSERVED.includes(name) ? (knit.drifts[q] ?? 1) === 0 : (knit.drifts[q] ?? 0) > 0))
    const distance = (s: number): number => {
      const pc = coefficientsOf(predicted[0]?.[s] as BlockKernel)
      const fc = coefficientsOf(fixedPoints[0] as BlockKernel)

      return Math.max(...pc.map((v, i) => Math.abs(v - (fc[i] ?? 0))))
    }
    const streamingZero = KERNEL_FIELDS.every((_, q) =>
      BLOCKS.every((_, s) => {
        const k = streaming.kernels[q]?.[s] as BlockKernel
        const crossError = Math.sqrt(k.selfError ** 2 + 4 * Array.from(k.neighbourErrors).reduce((acc, e) => acc + e * e, 0))

        return Math.abs(k.cross) <= 4 * crossError
      }),
    )
    const c3 = distance(BLOCKS.length - 1) < distance(0) && streamingZero

    metrics.p0DistanceToFixedPointB2 = distance(0)
    metrics.p0DistanceToFixedPointB4 = distance(BLOCKS.length - 1)
    metrics.worstStandardizedGap = worstStandardized
    metrics.c1ConservedFields = c1 ? 1 : 0
    metrics.c2KernelPredicted = c2 ? 1 : 0
    metrics.c3FlowAndControl = c3 ? 1 : 0

    return verdict({
      status: c1 && c2 && c3 ? 'pass' : 'fail',
      claim:
        'the block sums keep exactly charge, P and the line sum and not the count; the 75 block-kernel coefficients of the four momenta and the count at b = 2, 3, 4 (tau = b^2) agree with the lattice Boltzmann prediction within max(0.005, 4 standard errors); the predicted momentum kernel moves toward the diffusive fixed point from b = 2 to 4, and the streaming control leaves no block memory',
      metrics,
      notes:
        'L2, an honest fail on two of three gates. C1 passes: the whole-mesh sums of charge, P0 to P3 and S never move in 208 beats, the count moves by up to 4,490, and its block kernel is zero to the noise (cross share -0.04 at b = 2, predicted -0.043), so the coarse rule keeps exactly the knit six additive invariants and nothing else. C2 fails, and the failure is the finding. A second knit run from an independent start (REPLICATE) sets the scale: the single-run spread of a coefficient is 0.0008 at b = 2, matching the least-squares standard error 0.0009, so the errors are honest for the knit. Against the Boltzmann prediction the rms gap of the two-run mean is 0.0020 at b = 2 (expected 0.0006 from the spread), 0.0018 at b = 3 (0.0011) and 0.0031 at b = 4 (0.0032). So at b = 2 there is a systematic gap, almost all in the self share a, lower on the knit in both runs (mean over the four momenta -0.0036 and -0.0041, about 4 percent of a): over 4 beats the knit moves a block fluctuation out of the block faster than independent collisions do, the recollision (ring) correlations the Boltzmann average drops, visible at the 2^4 block and 4 beats and not beyond. By b = 3 and 4 the gap is at the noise. C3 fails on its control, not its flow: the predicted P0 kernel halves its largest-coefficient distance to the diffusive fixed point (0.066 at b = 2, 0.030 at b = 4), but the streaming control cross share exceeds 4 of its standard errors at b = 3 (-0.047 for P3, -0.041 for the count) because under pure streaming the 29 start beats see the same fluctuations translated, so their residuals are not independent and the least-squares error is too small for that control; its values scatter around zero at every b (-0.047 to 0.046). THE FLOW. The kernel explains 0.3 to 2 percent of a block field variance a coarse step later (r2 0.003 to 0.022): the block field is mostly fresh noise, and what the rule transmits is the conserved part. The cross share of P0 is 0.165, 0.186, 0.150 at b = 2, 3, 4 against the fixed point 0.120 (P3: 0.266, 0.303, 0.307 against 0.311); read back as diffusivities the couplings are far below D_eff at b = 2 (P0 along axis 1: 0.021 against 0.473) and climb toward it (0.13 at b = 3, 0.11 at b = 4): at the block scale the knit is still kinetic, with the fixed point near but not reached by b = 4. D_eff itself is anisotropic: P0 1.43, 0.47, 0.35, 0.17 along axes 0 to 3, the longitudinal value largest and the S coupling included.',
    })
  },
})
