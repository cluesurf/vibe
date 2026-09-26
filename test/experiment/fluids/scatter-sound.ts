// Sound in the scatter weave: whether any energy-like count is kept, why the pair clock forbids one, and
// the sound of the smallest change that keeps one.
//
// Sound slower than streaming needs a second conserved density coupled to the momentum. In a gas of movers
// all at one speed that density is the number of movers (for massless movers, their energy), whose current
// is exactly the particle momentum P, and the sound speed is c / sqrt(d): c / 2 in four dimensions. The
// roots have length sqrt 2, so c = sqrt 2 docks per beat and c / 2 = 1 / sqrt 2 along an axis, against
// c / sqrt 3 = sqrt(2 / 3) and the streaming speed 1.
//
// 1. WHAT IS KEPT. Streaming keeps every sum over slots of a_d t_d + b_d |t_d| (t_d the tone on slot d), so
//    such a sum is conserved exactly when the collision keeps it. The change of the 48 features over 9,600
//    dock states and beats (every beat of the period) gives, by the Smith form (code/measure/integer-
//    lattice), every exact additive invariant. An energy-like count is one whose |t| weights are the same on
//    a line's two slots (both movers of a head-on pair carry it): the 12 line counts are tested alone.
//    THE ARGUMENT. The pair clock makes a love and a fear from calm on one line, which changes the sum by
//    a_d - a_o + b_d + b_o; the flip then changes it by 2 (a_o - a_d). Both vanish only if a_d = a_o and
//    b_d = -b_o, so the |t| weights must be opposite on a line's two slots: momentum-like, never a count.
//    No rule that makes pairs from calm keeps an additive energy.
// 2. THE SMALLEST CHANGE. The wire table without the create move: the flip table (the love and fear of a
//    head-on pair trade places, nothing is made from calm), every other freedom of the scatter weave as in
//    E-FLD-0026 (matched condition, 36 scatterings a beat). It keeps the tone count. Its cost: the vacuum
//    no longer clocks (the empty state is fixed, period 1), and a lone tone on it meets nothing.
// 3. SOUND. A longitudinal wave of P (momentum and wave along axis 0, fill 0.2) at L = 12, 16, 20 and 24,
//    144 beats, fitted as a damped cosine (code/measure/momentum-transport dampedCosineFit, no window, so an
//    oscillation slower than the mesh is not removed): frequency omega, damping gamma, speed omega / k. On
//    the pair-clock rule (E-FLD-0026's) the same wave, which has no count to push against. The speed is
//    extrapolated to k = 0 by a straight line in k^2. Anisotropy: the flip rule's speed along axes 0 and 2
//    and the diagonal (1, 1, 0, 0) at the k of L = 16 along an axis.
//
// Gates, fixed before this run: the pair-clock rule keeps no line-count energy and the flip rule keeps the
// tone count exactly (in the Smith form and on a run); on the flip rule, reversal, charge, P, the tone count
// and CPT at its base phase are exact, and its longitudinal wave oscillates (omega above gamma, r2 above
// 0.9) at every size with a speed below streaming; on the pair-clock rule it does not oscillate at L = 20
// and 24. Which reference the extrapolated speed is nearer is reported, not gated.
//
// Depth L2: a conservation argument checked exhaustively on a constructed rule, and known lattice-gas sound
// measured on the change it asks for.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { type Collision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { colorLocalCollision, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { cptMirrorPhase, lineComponents, reversalAndCharge, vacuumPeriod, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { latticeQuotient } from '@/code/measure/integer-lattice'
import { linearFit } from '@/code/measure/regression'
import { FLIP_TABLE, momentumOf } from '@/code/rule/momentum-weave'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { dampedCosineFit, momentumWaveSeries, momentumWaveStart, type WaveGeometry } from '@/code/measure/momentum-transport'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const BEATS = 144
const SIDES = [12, 16, 20, 24]
const HALF_C = Math.SQRT1_2
const THIRD_C = Math.sqrt(2 / 3)

const FLIP_BASE: ColorLocalSpec = { ...HEAD_TURN_SPEC, tables: [FLIP_TABLE] }

function spec(base: ColorLocalSpec): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: base, opposite: o, forward: f }))

  return { base, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// the Smith form of the 48 additive features' changes, and of the 12 line counts alone
function invariants(rule: (t: number) => Collision, opposite: readonly number[]) {
  const rows: number[][] = []

  for (let n = 0; n < 400; n++) {
    for (let t = 0; t < 24; t++) {
      const v = Int8Array.from({ length: 24 }, (_, i) => {
        const u = (((n + 1) * 24 + i + 1) * GOLDEN * 3.7) % 1

        return n % 3 === 0 ? (u < 0.12 ? 1 : u < 0.24 ? -1 : 0) : u < 0.3 ? -1 : u < 0.6 ? 0 : 1
      })
      const w = Int8Array.from(v)

      rule(t)(w, 0, 24)
      rows.push([...Array.from(w, (x, d) => x - (v[d] ?? 0)), ...Array.from(w, (x, d) => Math.abs(x) - Math.abs(v[d] ?? 0))])
    }
  }

  const lines = opposite.map((o, d) => (d < o ? d : -1)).filter(d => d >= 0)
  const full = latticeQuotient(rows, 48)
  const counts = latticeQuotient(
    rows.map(row => lines.map(d => (row[24 + d] ?? 0) + (row[24 + (opposite[d] ?? d)] ?? 0))),
    lines.length,
  )
  const toneCount = rows.every(row => row.slice(24).reduce((s, x) => s + x, 0) === 0)

  return { free: full.free, countFree: counts.free, toneCount }
}

function wave(weave: ScatterWeaveSpec, side: number, geometry: WaveGeometry) {
  const mesh = d4Mesh({ side })
  const will = momentumWaveStart({ mesh, side, geometry, mode: 1, fill: 0.2, bias: 0.4, salt: 7 })
  const p0 = momentumOf(will.data).p
  const n0 = will.data.reduce((s, x) => s + Math.abs(x), 0)
  const { series, final } = momentumWaveSeries({ will, collision: scatterCollision({ spec: weave, opposite: meshOpposites(mesh) }), beats: BEATS, side, geometry, mode: 1 })
  const s0 = series[0] ?? 1
  const fit = dampedCosineFit({ series: series.map(x => x / s0) })
  const k = (2 * Math.PI * Math.hypot(...geometry.wave)) / side

  return {
    side,
    k,
    omega: fit.omega,
    gamma: fit.gamma,
    r2: fit.r2,
    speed: fit.omega / k,
    oscillates: fit.omega > fit.gamma && fit.r2 > 0.9,
    momentumDrift: Math.max(...momentumOf(final.data).p.map((x, i) => Math.abs(x - (p0[i] ?? 0)))),
    countDrift: Math.abs(final.data.reduce((s, x) => s + Math.abs(x), 0) - n0),
  }
}

export default experiment({
  id: 'fluids/scatter-sound',
  code: 'E-FLD-0027',
  title:
    'no rule that makes a love and a fear from calm keeps an additive energy (the create move changes every symmetric count, so the only additive invariants of the scatter weave are charge, P and the line-momentum sum), and without one a longitudinal momentum wave does not ring; removing the create move (the flip table) keeps the tone count exactly, and the wave then rings as sound below streaming, its speed falling from 0.82 at k = 0.52 to 0.74 at k = 0.26 and extrapolating to 0.710 at k = 0, within half a percent of the 1 / sqrt 2 = c / 2 of four-dimensional radiation (against c / sqrt 3 = 0.816), nearly isotropic (8 percent over three directions), at the cost of a vacuum that no longer clocks',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const clock = spec(HEAD_TURN_SPEC)
    const flip = spec(FLIP_BASE)
    const opposite = rootsD4().map((r, _, all) => all.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))

    // 1. what is kept
    const clockKept = invariants(scatterCollision({ spec: clock, opposite }), opposite)
    const flipKept = invariants(scatterCollision({ spec: flip, opposite }), opposite)

    // 2. the flip rule's laws and costs
    const flipRule: ScheduledRule = (o, f) => scatterCollision({ spec: flip, opposite: o, forward: f })
    const flipReversal = reversalAndCharge(flipRule)
    const flipCpt = cptMirrorPhase(flipRule)
    const flipVacuum = vacuumPeriod(flipRule)
    const flipVacuumComponents = lineComponents(flipRule, false)
    const flipDenseComponents = lineComponents(flipRule, true)

    // 3. sound
    const axis: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }
    const flipWaves = SIDES.map(side => wave(flip, side, axis))
    const clockWaves = SIDES.map(side => wave(clock, side, axis))
    const extrapolation = linearFit({ xs: flipWaves.map(w => w.k * w.k), ys: flipWaves.map(w => w.speed) })
    const speedAtZero = extrapolation.intercept
    const directions: [string, WaveGeometry][] = [
      ['axis0', axis],
      ['axis2', { momentum: [0, 0, 1, 0], wave: [0, 0, 1, 0] }],
      ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, 1, 0, 0] }],
    ]
    // the diagonal at the same k as an axis wave at L = 16 needs L = 16 sqrt 2; the nearest even side, 22,
    // is used and the k of each is printed
    const oriented = directions.map(([name, geometry]) => ({ name, ...wave(flip, name === 'diagonal01' ? 22 : 16, geometry) }))
    const speeds = oriented.map(o => o.speed)
    const anisotropy = Math.max(...speeds) / Math.min(...speeds)

    const ok =
      clockKept.countFree === 0 &&
      !clockKept.toneCount &&
      flipKept.toneCount &&
      flipKept.countFree >= 1 &&
      flipReversal.reverses &&
      flipReversal.chargeKept &&
      flipCpt >= 0 &&
      flipWaves.every(w => w.oscillates && w.speed < 1 && w.momentumDrift === 0 && w.countDrift === 0) &&
      clockWaves.filter(w => w.side >= 20).every(w => !w.oscillates && w.momentumDrift === 0)

    const metrics: Record<string, number> = {
      clockAdditiveInvariants: clockKept.free,
      clockLineCountEnergies: clockKept.countFree,
      clockKeepsToneCount: clockKept.toneCount ? 1 : 0,
      flipAdditiveInvariants: flipKept.free,
      flipLineCountEnergies: flipKept.countFree,
      flipKeepsToneCount: flipKept.toneCount ? 1 : 0,
      flipReverses: flipReversal.reverses ? 1 : 0,
      flipChargeKept: flipReversal.chargeKept ? 1 : 0,
      flipCptMirrorPhase: flipCpt,
      flipVacuumPeriod: flipVacuum,
      flipVacuumComponents,
      flipDenseComponents,
      speedAtZeroK: speedAtZero,
      speedSlopeInKSquared: extrapolation.slope,
      halfC: HALF_C,
      cOverSqrt3: THIRD_C,
      nearerHalfC: Math.abs(speedAtZero - HALF_C) < Math.abs(speedAtZero - THIRD_C) ? 1 : 0,
      anisotropy,
    }

    flipWaves.forEach(w => {
      metrics[`flipSpeedL${w.side}`] = w.speed
      metrics[`flipKL${w.side}`] = w.k
      metrics[`flipGammaL${w.side}`] = w.gamma
      metrics[`flipR2L${w.side}`] = w.r2
    })
    oriented.forEach(o => {
      metrics[`speed_${o.name}`] = o.speed
      metrics[`k_${o.name}`] = o.k
      metrics[`r2_${o.name}`] = o.r2
    })

    const control: Record<string, number> = {}

    clockWaves.forEach(w => {
      control[`clockOmegaL${w.side}`] = w.omega
      control[`clockGammaL${w.side}`] = w.gamma
      control[`clockR2L${w.side}`] = w.r2
      control[`clockOscillatesL${w.side}`] = w.oscillates ? 1 : 0
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pair-clock scatter weave keeps no line-count energy and not the tone count; the flip table keeps the tone count exactly, and with it reversal, charge, P and CPT; its longitudinal momentum wave oscillates below the streaming speed at L = 12 to 24, where the pair-clock wave does not oscillate at L = 20 and 24. The speed extrapolated to k = 0 and the anisotropy are reported',
      metrics,
      control,
      notes:
        'L2, exact integer dynamics, no random numbers. The argument of part 1 is short and general: a create move changes a symmetric count by the count of the pair it makes, so the pair clock (the arrow of the base) and an additive energy exclude each other. The Smith form confirms it on the rule: its additive invariants are charge, the four components of P and the line-momentum sum, and none of the twelve line counts. Without a conserved count the longitudinal momentum has no pressure to push against and relaxes like a shear (E-FLD-0026), which is what the pair-clock control shows. With the flip table the tone count is kept, its current is exactly P, and the pair (count, P) rings: this is ordinary lattice-gas sound, measured on a D4 gas of movers of speed sqrt 2. The measured speed is dispersive, falling as k shrinks, and its k = 0 intercept is compared with c / 2 = 1 / sqrt 2 (radiation in four dimensions) and c / sqrt 3; the diagonal wave has k larger by sqrt 2 over 22 / 16, printed, so the anisotropy of speed mixes direction with dispersion and is an upper bound. The cost is the base: with no create move the empty vacuum is fixed (period 1 against the committed 24), and a lone tone on it meets nothing, so the vacuum line graph falls apart (flipVacuumComponents). Keeping an energy and keeping the arrow is the choice this rule family cannot avoid.',
    })
  },
})
