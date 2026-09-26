// The two g = 2 schedules of E-MTR-0017 through E-SPN-0053's token gates, before any Zeeman or hydrogen work
// uses them. (A STAND-IN, not the electron: code/rule/spinor-token. Its spin, charge and stability are put in.)
//
// E-MTR-0017 found that the model's coin allows an exactly Dirac g because C^3 = 1: copies three beats apart share
// a coin frame, so a Strang-symmetric period has no ordering term. Two schedules read g = 2 to 1e-12:
//   STRANG  x, y, z, x                                           4 beats
//   NESTED  z (up down) x (up down) y (up down) y (up down) x (up down) z   16 beats
// Its notes say what it did not show: neither had been through E-SPN-0053's other gates. This runs them, with
// E-SPN-0053's token (x, y, z, up, down, g = 4) beside them as the reference.
//
// PREDICTIONS, written before any run.
// - Both are massive (16 and 4 coins, neither a multiple of 3), and both pass the per-beat covariance and the 2 pi
//   sign, which are properties of the locked beat and the depth pair, not of the schedule.
// - Both are exact on the torus (norm, reversal, continuity, Gauss's law), for the same reason as the token: the
//   coin keeps each dock's weight and the stream moves weight along links.
// - STRANG fails mass isotropy (x is copied twice per period, y and z once) and the speed bound (four beats, two of
//   them x, so its fastest band is well over the token's 0.19 per beat), and has g = 2 only for a field along z
//   (in the x-y plane); in the y-z and z-x planes it is not 2.
// - NESTED passes every gate: each axis copied twice, every copy at a beat divisible by 3, and ten of its sixteen
//   beats are depth beats with no net motion, so it is slow. g = 2 in all three planes (E-MTR-0017).
// - Neither band is exactly symmetric under the husk turns beyond second order (reported, not gated).
//
// Gates, fixed before the first run, per schedule (the one that passes all is the chosen token):
// T1 rest gap 2 pi / 3 to 1e-12 (massive)
// T2 per-beat covariance: the locked axis beats covariant under all 12 turns to 1e-12 on 8 Weyl states of a 6^3
//    torus, and the depth pair the coin alone (up-down equals down-up to 1e-12); the spectator control fails
// T3 the 2 pi sign: every 120 degree turn cubed is -1 on the state space and six times +1, to 1e-12
// T4 mass isotropy: the spin-averaged particle band's Hessian at k = 0 has relative spread under 1e-6
// T5 exactness on a 6^3 torus, charge 1, uniform field along z, 10,000 beats (whole periods): norm drift under
//    1e-10, reversal under 1e-9, continuity under 1e-12 on every dock and beat, Gauss's law on a 4^3 cube under 1e-10
// T6 speed: the fastest group velocity over 512 Weyl wave vectors under the E-FRC-0179 photon, 0.2023 husk docks
//    per beat (and so under the husk stream, 1)
// T7 g = 2 to 1e-12 as a massive bowl in all three planes (E-MTR-0017's second-order g, the plane relabeled)
// SIZE: E-SPN-0053 ran its torus at 8^3 for 2,000 five-beat periods; this runs 6^3 for 10,000 beats per schedule
// for machine load (the exactness gates are structural and do not depend on the size).
//
// Depth L2, a stand-in walk against a fixed battery.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { tokenG, type TokenStep } from '@/code/measure/token-g-analytic'
import { type Step } from '@/code/rule/spinor-token'
import { bandHessian, bandTurnMismatch, beatCovariance, exactRun, fastestPerBeat, hessianSpread, restGap, twoPiSign } from '@/code/measure/token-gates'

const TOKEN: readonly Step[] = ['x', 'y', 'z', 'up', 'down']
const STRANG: readonly Step[] = ['x', 'y', 'z', 'x']
const NESTED: readonly Step[] = ['z', 'up', 'down', 'x', 'up', 'down', 'y', 'up', 'down', 'y', 'up', 'down', 'x', 'up', 'down', 'z']
const MODEL_COIN = Math.PI / 3
const EXACT = 1e-12
const SIDE = 6
const BEATS = 10000
const CUBE = 4
const SAMPLES = 512
const PHOTON_SPEED = 0.2023

// the plane (a, b) relabeled as the chain's (x, y), the field along the third, then read as TokenSteps (a z beat or
// a depth beat is the coin alone at k_z = 0)
function planeSteps(schedule: readonly Step[], a: 'x' | 'y' | 'z', b: 'x' | 'y' | 'z'): TokenStep[] {
  return schedule.map(s => ({ axis: s === a ? 'x' : s === b ? 'y' : 'none' }))
}

type Reading = {
  name: string
  restGap: number
  hessian: number[][]
  spread: number
  run: ReturnType<typeof exactRun>
  fastest: number
  turnMismatch: number
  planes: { plane: string; g: number; bowl: boolean; restGap: number }[]
}

function read(name: string, schedule: readonly Step[]): Reading {
  const hessian = bandHessian(schedule, 'locked')

  return {
    name,
    restGap: restGap(schedule, 'locked'),
    hessian,
    spread: hessianSpread(hessian),
    run: exactRun({ schedule, side: SIDE, beats: BEATS, cube: CUBE }),
    fastest: fastestPerBeat(schedule, 'locked', SAMPLES),
    turnMismatch: bandTurnMismatch(schedule, 'locked', 64),
    planes: (
      [
        ['xy', 'x', 'y'],
        ['yz', 'y', 'z'],
        ['zx', 'z', 'x'],
      ] as const
    ).map(([plane, a, b]) => {
      const r = tokenG({ schedule: planeSteps(schedule, a, b), mu: MODEL_COIN })

      return { plane, g: r.g, bowl: r.bowl, restGap: r.restGap }
    }),
  }
}

export default experiment({
  id: 'spin/g-two-token-gates',
  code: 'E-SPN-0064',
  title:
    'the two g = 2 schedules of E-MTR-0017 through E-SPN-0053\'s token gates, a STAND-IN: the 16-beat nested palindrome and x, y, z, x against rest mass, per-beat covariance under the 12 husk turns, the 2 pi sign, mass isotropy, exact continuity and Gauss\'s law, the speed of the E-FRC-0179 photon and g = 2 in every plane',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const locked = beatCovariance(SIDE, 'locked')
    const spectator = beatCovariance(SIDE, 'spectator')
    const sign = twoPiSign(SIDE)
    const third = (2 * Math.PI) / 3
    const readings = [read('strang', STRANG), read('nested', NESTED), read('token', TOKEN)]
    const shared = locked.worst < EXACT && locked.depthPairGap < EXACT && spectator.failures > 0 && sign.orderSix === 8 && sign.gap < EXACT
    const gates = readings.map(r => {
      const t = {
        T1: Math.abs(r.restGap - third) < EXACT,
        T2: locked.worst < EXACT && locked.depthPairGap < EXACT && spectator.failures > 0,
        T3: sign.orderSix === 8 && sign.gap < EXACT,
        T4: r.spread < 1e-6,
        T5: r.run.normDrift < 1e-10 && r.run.reversalGap < 1e-9 && r.run.continuity < EXACT && r.run.gaussGap < 1e-10,
        T6: r.fastest < PHOTON_SPEED,
        T7: r.planes.every(p => p.bowl && Math.abs(p.restGap) > 1e-9 && Math.abs(p.g - 2) < EXACT),
      }

      return { name: r.name, t, all: Object.values(t).every(Boolean) }
    })
    const chosen = gates.filter(g => g.name !== 'token' && g.all).map(g => g.name)
    const failing = gates.map(g => `${g.name}: ${Object.entries(g.t).filter(([, v]) => !v).map(([k]) => k).join(' ') || 'none'}`)
    const ok = shared && chosen.length > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `${chosen.length > 0 ? `the ${chosen.join(' and ')} schedule passes every token gate` : 'no g = 2 schedule passes every token gate'}: failing gates by schedule, ${failing.join('; ')}. Per-beat covariance ${locked.worst.toExponential(1)} (spectator fails ${spectator.failures} of 36), depth pair ${locked.depthPairGap.toExponential(1)}, 2 pi sign ${sign.gap.toExponential(1)} on ${sign.orderSix} order-6 turns; ${readings
        .map(
          r =>
            `${r.name}: rest gap ${r.restGap.toFixed(6)}, mass spread ${r.spread.toExponential(1)} (Hessian diagonal ${r.hessian.map((row, i) => (row[i] ?? 0).toFixed(4)).join(', ')}), norm ${r.run.normDrift.toExponential(1)}, reversal ${r.run.reversalGap.toExponential(1)}, continuity ${r.run.continuity.toExponential(1)}, Gauss ${r.run.gaussGap.toExponential(1)}, fastest ${r.fastest.toFixed(4)} per beat (${(r.fastest / PHOTON_SPEED).toFixed(3)} of the photon), g by plane ${r.planes.map(p => `${p.plane} ${Number.isNaN(p.g) ? 'saddle' : p.g.toFixed(6)}`).join(', ')}`,
        )
        .join('; ')}`,
      metrics: {
        chosenCount: chosen.length,
        nestedPassesAll: gates.find(g => g.name === 'nested')?.all ? 1 : 0,
        strangPassesAll: gates.find(g => g.name === 'strang')?.all ? 1 : 0,
        lockedCovarianceWorst: locked.worst,
        depthPairGap: locked.depthPairGap,
        twoPiSignGap: sign.gap,
        orderSixTurns: sign.orderSix,
        ...Object.fromEntries(
          readings.flatMap(r => [
            [`${r.name}_restGap`, r.restGap],
            [`${r.name}_hessianXX`, r.hessian[0]?.[0] ?? 0],
            [`${r.name}_hessianYY`, r.hessian[1]?.[1] ?? 0],
            [`${r.name}_hessianZZ`, r.hessian[2]?.[2] ?? 0],
            [`${r.name}_massSpread`, r.spread],
            [`${r.name}_normDrift`, r.run.normDrift],
            [`${r.name}_reversalGap`, r.run.reversalGap],
            [`${r.name}_continuity`, r.run.continuity],
            [`${r.name}_gaussGap`, r.run.gaussGap],
            [`${r.name}_chargeLeftCube`, r.run.chargeLeftCube],
            [`${r.name}_fastestPerBeat`, r.fastest],
            [`${r.name}_fastestOverPhoton`, r.fastest / PHOTON_SPEED],
            [`${r.name}_bandTurnMismatch`, r.turnMismatch],
            ...r.planes.flatMap(p => [
              [`${r.name}_g_${p.plane}`, p.g],
              [`${r.name}_bowl_${p.plane}`, p.bowl ? 1 : 0],
            ]),
          ]),
        ),
        ...Object.fromEntries(gates.flatMap(g => Object.entries(g.t).map(([k, v]) => [`${g.name}_${k}`, v ? 1 : 0]))),
      },
      control: {
        spectatorCovarianceFailures: spectator.failures,
        spectatorCovarianceWorst: spectator.worst,
      },
      notes: `L2, STAND-IN. The token (x, y, z, up, down, g = 4 from E-SPN-0053) is the reference column and is not a candidate. T2 and T3 are properties of the locked beat and the depth pair and hold for every schedule built of them; the schedule-dependent gates are T1, T4 to T7. The band's own symmetry under the turns (bandTurnMismatch, the largest difference of the period's spectrum at R k and at k over 64 Weyl wave vectors) is reported and not gated: per-beat covariance maps a schedule to its relabeled schedule, which is the same band only when the relabeling is a symmetry of the schedule. The torus runs at 6^3 for 10,000 beats where E-SPN-0053 ran 8^3 for 10,000, for machine load, fixed before the run. First run, recorded: the nested schedule passes all seven, x, y, z, x fails mass isotropy (its x curvature is four times its y and z), the photon bound (1.21 of the photon) and g in the y-z plane (a saddle there), and the reference token fails only T7 (g = 4, a saddle in the z-x plane). One written prediction was wrong: the nested band IS symmetric under all 12 husk turns to 2.5e-14, not only to second order, while x, y, z, x and the token are not (6.1 and 7.5). The nested band's eigenphase curvature has the opposite sign to the token's (-2.3094 against +0.5773 per period, in magnitude 4 / sqrt 3 against 1 / sqrt 3) because its antiparticle rest phase sits at +2 pi / 3 where the token's sits at -2 pi / 3, so its particle band is the upper one: both are bowls in energy about their own band edge.`,
    })
  },
})
