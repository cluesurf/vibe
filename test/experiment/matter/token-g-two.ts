// What gives the spinor token g = 2 exactly, and whether the model's own coin allows it. (A STAND-IN, not the
// electron: code/rule/spinor-token.)
//
// E-MTR-0016 derived the token's g from its symbol. Per spin sector the particle band is H = sum pi_a pi_b M_ab
// with M a 2 x 2 Hermitian matrix (code/measure/token-g-analytic), and its Landau levels give
//
//   g = 2 |Im M_xy| / sqrt(det M + (Im M_xy)^2),
//
// so g = 2 EXACTLY when det M = 0, that is when M = w w^dagger is rank one and the band is a perfect square
// |pi_x w_x + pi_y w_y|^2, the Pauli form (sigma . pi)^2. Moving the coins to the front, M = (kappa / 2) Z Z^dagger
// + T, where Z_a sums the frames e^(-i Theta_j) of the axis-a streams and T is the ORDERING term, a sum over pairs of
// streams of sgn(j - l) times their frame overlap. The first part is rank one by construction, so the question is
// T. T vanishes when every axis's streams sit symmetrically about the others (a Strang splitting, x y x rather than
// x y) and each mirrored pair shares one coin frame.
//
// PREDICTIONS, written before any run.
// - One x and one y stream can never do it: g = 2 |X| / sqrt(X^2 - 1) > 2 for every finite X, and |X| <= 1 / |sin(phi
//   / 2)| gives the bound g >= 2 / |cos(phi / 2)| = 2 sec(phi / 2), phi the rest gap per period, for EVERY coin and
//   every lock angle (the slot combination tau_z cos psi + tau_y sin psi the spin steers). Equality needs phi = 0: a
//   massless walk. At the model coin phi = 2 pi / 3 and the bound is 4, met by the token itself
// - A light coin gives 2 only in the limit: along the token family g - 2 falls as mu^2 (g - 2 = 1 / X^2 + ..., X ~
//   1 / (5 mu))
// - THE MODEL'S COIN ALLOWS IT, because C^3 = 1: the coin frame returns every three beats, so two copies of one axis
//   three beats apart share a frame with no lock angle needed. The four-beat schedule x, y, z, x (x at beats 0 and 3,
//   y between them, z the coin alone at k_z = 0) has T = 0 and g = 2 exactly. For the husk as a whole, the 16-beat
//   nested palindrome z (up down) x (up down) y (up down) y (up down) x (up down) z puts every stream at a beat
//   divisible by 3, so every stream shares one frame; T = 0 in each of the three planes, the three cyclotron
//   frequencies are equal (4 / sqrt 3 per unit field) and g = 2 for a field along any axis. It is massive: 16 coins,
//   phi = 32 pi / 3 = 2 pi / 3 mod 2 pi. Its fillers are depth pairs, which return every column
// - The Landau witness reads g_lo = 2 on these at every field, not only in the limit (the Dirac zero mode sits
//   exactly at the rest energy), where the token reads 4.2, 4.1, 4.06
// - Of the schedules over {x, y, -} of length up to 8 at the model coin, none of length 2 or 3 has g = 2 and some of
//   length 4 do
//
// Gates, fixed before the first run:
// G1 the two-stream bound: on 4,096 Kronecker points (mu, psi_x, psi_y) of the schedule x, y, -, -, - (golden, silver
//    and sqrt 3 - 1 rotations), every massive bowl has g >= 2 sec(phi / 2) - 1e-9, and every one has g > 2
// G2 the light-coin limit: along the token family g > 2 at mu = pi / k for k = 60, 100, 200, 400, and the slope of
//    log(g - 2) against log mu over k = 100, 200, 400 is 2 to 0.05
// G3 at the model coin, x, y, z, x and the 16-beat schedule in each of its three planes are massive bowls with g = 2
//    to 1e-12 (general perturbation theory); the 16-beat's three planes have equal cyclotron frequency and zero
//    anisotropic term, to 1e-12
// G4 the Landau witness: g_lo within 1e-6 of 2 at L = 48, 96, 192 for x, y, z, x and the 16-beat's three planes,
//    where the token (the control) reads g_lo more than 1 away from 2 at the same sizes
// G5 no schedule over {x, y, -} of length 2 or 3 is a massive bowl with g = 2 at the model coin, and at least one of
//    length 4 is; reported: how many of every length up to 8
// DISCLOSED: a probe (tmp/probe-g-search.ts, tmp/probe-g-landau.ts) found x, y, z, x and the 16-beat schedule
// before these gates were written, and read g_lo = 2.0000 on both at L = 96 and 192. The rank-one criterion and
// the same-frame construction were derived before the probe; the probe located the shortest instance.
//
// Depth L2: a stand-in walk, second-order Floquet perturbation theory and its Landau chain. What is new is the
// structural statement: the model's coin, through C^3 = 1, is what makes an exactly Dirac g available.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { tokenG, type TokenStep } from '@/code/measure/token-g-analytic'
import { bandSignOf, landauG } from '@/code/measure/token-g-landau'
import { type Step } from '@/code/rule/spinor-token'

const MODEL_COIN = Math.PI / 3
const TOKEN: readonly Step[] = ['x', 'y', 'z', 'up', 'down']
const STRANG: readonly Step[] = ['x', 'y', 'z', 'x']
const NESTED: readonly Step[] = ['z', 'up', 'down', 'x', 'up', 'down', 'y', 'up', 'down', 'y', 'up', 'down', 'x', 'up', 'down', 'z']
const SAMPLES = 4096
const SIDES = [48, 96, 192]
const EXACT = 1e-12
const ZERO_MODE = 1e-6
const THIRD = Math.sqrt(3) - 1

const asToken = (schedule: readonly Step[]): TokenStep[] => schedule.map(s => ({ axis: s === 'x' ? 'x' : s === 'y' ? 'y' : 'none' }))

// relabel the husk axes so that the plane (a, b) becomes the chain's (x, y), the field along the third
function relabel(schedule: readonly Step[], a: 'x' | 'y' | 'z', b: 'x' | 'y' | 'z'): Step[] {
  const c = (['x', 'y', 'z'] as const).find(k => k !== a && k !== b) ?? 'z'
  const map: Record<string, Step> = { [a]: 'x', [b]: 'y', [c]: 'z', up: 'up', down: 'down' }

  return schedule.map(s => map[s] ?? s)
}

export default experiment({
  id: 'matter/token-g-two',
  code: 'E-MTR-0017',
  title:
    'what gives the spinor token g = 2 exactly, a STAND-IN: g = 2 exactly when the band is a perfect square (rank-one M), which one x and one y stream never are (g >= 2 sec(phi/2), 4 at the model coin, 2 only when massless or in the light-coin limit), while a Strang-symmetric schedule whose mirrored copies share a coin frame is; the model coin allows it because C^3 = 1 returns the frame every three beats, so x, y, z, x and a 16-beat nested palindrome read g = 2 exactly, isotropically, with an exact zero mode at every field',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1: the two-stream bound over coins and lock angles
    let boundViolations = 0
    let belowOrAtTwo = 0
    let bowls = 0
    let tightest = Infinity

    for (let i = 1; i <= SAMPLES; i++) {
      const mu = (Math.PI / 2) * weyl(i, GOLDEN)
      const schedule: TokenStep[] = [
        { axis: 'x', lock: 2 * Math.PI * weyl(i, SILVER) },
        { axis: 'y', lock: 2 * Math.PI * weyl(i, THIRD) },
        { axis: 'none' },
        { axis: 'none' },
        { axis: 'none' },
      ]
      const r = tokenG({ schedule, mu })

      if (!r.bowl || Math.abs(r.restGap) < 1e-9) {
        continue
      }

      bowls++

      const bound = 2 / Math.abs(Math.cos(r.restGap / 2))

      boundViolations += r.g >= bound - 1e-9 ? 0 : 1
      belowOrAtTwo += r.g > 2 ? 0 : 1
      tightest = Math.min(tightest, r.g / bound)
    }

    const g1 = bowls > 0 && boundViolations === 0 && belowOrAtTwo === 0

    // G2: the light-coin limit
    const lightG = [60, 100, 200, 400].map(k => ({ k, g: tokenG({ schedule: asToken(TOKEN), mu: Math.PI / k }).g }))
    const fitPoints = lightG.filter(p => p.k >= 100).map(p => [Math.log(Math.PI / p.k), Math.log(p.g - 2)] as const)
    const meanX = fitPoints.reduce((s, p) => s + p[0], 0) / fitPoints.length
    const meanY = fitPoints.reduce((s, p) => s + p[1], 0) / fitPoints.length
    const slope =
      fitPoints.reduce((s, p) => s + (p[0] - meanX) * (p[1] - meanY), 0) / fitPoints.reduce((s, p) => s + (p[0] - meanX) ** 2, 0)
    const g2 = lightG.every(p => p.g > 2) && Math.abs(slope - 2) < 0.05

    // G3: the model coin's exactly Dirac schedules
    const planes: [string, Step[]][] = [
      ['strang', [...STRANG]],
      ['nestedXY', relabel(NESTED, 'x', 'y')],
      ['nestedYZ', relabel(NESTED, 'y', 'z')],
      ['nestedZX', relabel(NESTED, 'z', 'x')],
    ]
    const analytic = planes.map(([name, schedule]) => ({ name, schedule, r: tokenG({ schedule: asToken(schedule), mu: MODEL_COIN }) }))
    const nested = analytic.filter(a => a.name.startsWith('nested'))
    const cyclotrons = nested.flatMap(a => a.r.cyclotron)
    const cyclotronSpread = Math.max(...cyclotrons) - Math.min(...cyclotrons)
    const anisotropy = Math.max(...nested.flatMap(a => a.r.sectors.map(s => Math.abs(s.c))))
    const g3 =
      analytic.every(a => a.r.bowl && Math.abs(a.r.restGap) > 1e-9 && Math.abs(a.r.g - 2) < EXACT) && cyclotronSpread < EXACT && anisotropy < EXACT

    // G4: the Landau witness, with the token as the control
    const landau = [...planes, ['tokenControl', [...TOKEN]] as [string, Step[]]].map(([name, schedule]) => {
      const sign = bandSignOf({ schedule, mode: 'locked', coinAngle: MODEL_COIN })

      return { name, readings: SIDES.map(side => landauG({ schedule, mode: 'locked', coinAngle: MODEL_COIN, side, sign })) }
    })
    const dirac = landau.filter(l => l.name !== 'tokenControl')
    const control = landau.find(l => l.name === 'tokenControl')
    const zeroModeMiss = Math.max(...dirac.flatMap(l => l.readings.map(r => Math.abs(r.gLo - 2))))
    const g4 = zeroModeMiss < ZERO_MODE && (control?.readings ?? []).every(r => Math.abs(r.gLo - 2) > 1)

    // G5: the shortest exactly Dirac schedules at the model coin
    const exactByLength: number[] = []
    const bowlsByLength: number[] = []

    for (let length = 2; length <= 8; length++) {
      let exact = 0
      let massiveBowls = 0

      for (let code = 0; code < 3 ** length; code++) {
        const letters = Array.from({ length }, (_, k) => 'xy-'[Math.floor(code / 3 ** k) % 3] ?? '-')

        if (!letters.includes('x') || !letters.includes('y')) {
          continue
        }

        const r = tokenG({ schedule: letters.map(c => ({ axis: c === '-' ? 'none' : (c as 'x' | 'y') })), mu: MODEL_COIN })

        if (!r.bowl || Math.abs(r.restGap) < 1e-9) {
          continue
        }

        massiveBowls++
        exact += Math.abs(r.g - 2) < 1e-9 ? 1 : 0
      }

      exactByLength.push(exact)
      bowlsByLength.push(massiveBowls)
    }

    const g5 = exactByLength[0] === 0 && exactByLength[1] === 0 && (exactByLength[2] ?? 0) > 0

    const ok = g1 && g2 && g3 && g4 && g5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `one x and one y stream never reach g = 2: over ${bowls} massive bowls of ${SAMPLES} (coin, lock, lock) points, ${boundViolations} fall below 2 sec(phi/2) and ${belowOrAtTwo} reach 2 (tightest g over the bound ${tightest.toFixed(6)}); along the token family g - 2 falls as mu^${slope.toFixed(3)}; at the model coin ${analytic.map(a => `${a.name} g = ${a.r.g.toFixed(12)}`).join(', ')}, the 16-beat's three planes sharing one cyclotron (spread ${cyclotronSpread.toExponential(1)}, ${cyclotrons[0]?.toFixed(6)} per unit field) with no anisotropic term (${anisotropy.toExponential(1)}); the Landau ladders read g_lo within ${zeroModeMiss.toExponential(1)} of 2 at L = ${SIDES.join(', ')} on all four, where the token reads ${(control?.readings ?? []).map(r => r.gLo.toFixed(4)).join(', ')}; exactly Dirac massive bowls by length 2 to 8: ${exactByLength.join(', ')} of ${bowlsByLength.join(', ')}`,
      metrics: {
        twoStreamSamples: SAMPLES,
        twoStreamBowls: bowls,
        twoStreamBoundViolations: boundViolations,
        twoStreamAtOrBelowTwo: belowOrAtTwo,
        twoStreamTightestRatio: tightest,
        ...Object.fromEntries(lightG.map(p => [`tokenG_muPiOver${p.k}`, Number(p.g.toFixed(9))])),
        lightCoinSlope: slope,
        ...Object.fromEntries(analytic.flatMap(a => [[`${a.name}_g`, a.r.g], [`${a.name}_restGap`, a.r.restGap], [`${a.name}_cyclotron`, a.r.cyclotron[0] ?? NaN]])),
        nestedCyclotronSpread: cyclotronSpread,
        nestedAnisotropy: anisotropy,
        zeroModeMiss,
        ...Object.fromEntries(dirac.flatMap(l => l.readings.map(r => [`${l.name}_L${r.side}_gLo`, r.gLo]))),
        ...Object.fromEntries(exactByLength.map((n, i) => [`exactDiracLength${i + 2}`, n])),
        ...Object.fromEntries(bowlsByLength.map((n, i) => [`massiveBowlsLength${i + 2}`, n])),
      },
      control: {
        ...Object.fromEntries((control?.readings ?? []).map(r => [`token_L${r.side}_gLo`, Number(r.gLo.toFixed(6))])),
      },
      notes:
        'L2, STAND-IN. The answer to "light coin or different spin locking": neither. With one x and one y stream per period no coin and no lock angle gets below 2 sec(phi/2): the lock angle only moves delta, and the best delta (the isotropic one, delta = phi/2) gives exactly the bound, which at the model coin is the token\'s own 4. A light coin approaches 2 only as mu^2. What makes g = 2 is the ORDER of the copies: the Zeeman excess is the ordering commutator of an x copy then a y copy, and a Strang-symmetric period cancels it when each mirrored pair of copies is seen in one coin frame. The model\'s coin is the reason that is free: C^3 = 1, so copies three beats apart share a frame, and the locked mode needs no change. x, y, z, x is the shortest such period in the plane (not husk-symmetric: x twice, y once). The 16-beat nested palindrome z..x..y..y..x..z with depth pairs between the copies is the husk-isotropic one, g = 2 for a field along any axis. The Landau zero mode sits exactly at the rest energy at every field tried, which a second-order argument alone does not promise; it is reported as measured, not explained. What this does NOT show: the 16-beat token has not been run through E-SPN-0053\'s other gates (beat-by-beat covariance, Gauss\'s law, the group-velocity bound, the 2 pi sign), its band beyond second order is not measured, and it is still a stand-in whose spin and charge are put in.',
    })
  },
})
