// Why the spinor token reads g = 4: derived from its symbol before any run, then checked on its Landau ladders.
// (A STAND-IN, not the electron: code/rule/spinor-token.)
//
// E-MTR-0015 measured g = 4.000 in the zero-field limit for the token x, y, z, up, down with the model's fear
// coin, its spin-favored ladder half a spacing BELOW the rest energy, and left the cause open. Three hypotheses
// were on the table: the locked spin doubles the orbital coupling, the token is effectively spin 1, or the heavy
// coin (Compton length 0.74 dock) shifts it.
//
// THE DERIVATION (in the plane of a field along z, where z and depth beats are the coin alone). Every beat is the
// coin C = e^(i mu) e^(-i mu tau_x) then its stream e^(-i pi_a Gamma_a), Gamma_a = tau_z sigma_a. Moving every coin
// to the front, U = C^N e^(-i pi_y Gamma~_y) e^(-i pi_x Gamma~_x) with Gamma~_a = C^(-n_a) Gamma_a C^(n_a) =
// sigma_a (tau_z cos theta_a + tau_y sin theta_a), theta_a = 2 mu n_a: each stream is seen in a slot frame the
// coins have turned. On the particle band (tau_x = +1, eigenvalue 1 of C^N) against the antiparticle band
// (e^(i phi), phi = 2 N mu the rest gap), second-order perturbation theory in the kinetic momenta, [pi_x, pi_y] =
// i beta, gives
//
//   H = (kappa / 2) (pi_x^2 + pi_y^2) + (kappa sin delta - cos delta) sigma_z sym(pi_x pi_y)
//       - (1/2) (sin delta + kappa cos delta) beta sigma_z,          kappa = cot(phi / 2), delta = theta_y - theta_x.
//
// The last term is the Zeeman term, and it has two sources: the second-order hop through the antiparticle band
// (the Dirac one, kappa cos delta) and the ORDERING of the two streams, the commutator of an x copy followed by a
// y copy in frames delta apart (sin delta). With X = kappa cos delta + sin delta = cos(delta - phi/2) / sin(phi/2),
// the Landau levels give
//
//   g = 2 |X| / sqrt(X^2 - 1),     a bowl exactly when X^2 > 1, a saddle otherwise.
//
// PREDICTIONS, written before any run.
// - The token at the model coin, mu = pi / 3: n_x = 1, n_y = 2, so delta = 2 pi / 3; N = 5, phi = 10 pi / 3, phi / 2
//   = 5 pi / 3, kappa = -1 / sqrt 3. The anisotropic term vanishes (kappa sin delta = -1/2 = cos delta), X = 2 / sqrt 3,
//   and g = 4 EXACTLY: H = -(1 / (2 sqrt 3)) pi^2 - (beta / sqrt 3) sigma_z, levels (n + 1/2 -+ 1) omega_c, the
//   (n - 1/2) and (n + 3/2) ladders E-MTR-0015 saw, cyclotron |kappa| = 1 / sqrt 3 per unit field
// - The light coins of E-MTR-0015 read 2.0724 (pi / 60) and 2.3511 (pi / 30), pi / 20 reads 3.2871, pi / 12 is a
//   saddle (why E-MTR-0015's probe found the estimator failing between the light coins and pi / 3)
// - Every massive schedule with one x stream and one y stream at the model coin has delta = 2 pi Delta / 3 and phi /2
//   = N pi / 3, so X^2 is 4/3 or 1/3: g = 4 or a saddle, never anything else
// - The palindrome x, y, y, x at the model coin reads g = 1 (from code/measure/token-g-analytic, general schedule)
// So none of the three hypotheses: the spin is a doublet (two ladders, a whole spacing apart), the orbital
// coupling is the ordinary one (the cyclotron is kappa), and the coin's weight enters only through kappa. The 4 is
// the ordering commutator of two sequential streams in frames the coin turned 120 degrees apart.
//
// Gates, fixed before the first run:
// G1 the general perturbation theory (code/measure/token-g-analytic) equals the closed form for the token at mu =
//    pi / 3, pi / 20, pi / 30, pi / 60 to 1e-9, both say saddle at pi / 12, and on every one the first-order band
//    term, the anti-Hermitian residue and the sigma_z off-diagonals are under 1e-12
// G2 at the model coin: g = 4, A = B = -1 / (2 sqrt 3), C = 0 and Zeeman coefficients -+ 1 / sqrt 3, all to 1e-12
// G3 every schedule over {x, y, -} of length 2 to 8 with exactly one x and one y, massive (rest gap above 1e-9) at the
//    model coin, is a bowl with g = 4 to 1e-9 or a saddle; at least one of each
// G4 the Landau witness (E-MTR-0015's estimator, now code/measure/token-g-landau): the zero-field g_lo = 2 g(192) -
//    g(96) is within 0.02 of the analytic value for the token at pi / 3, pi / 20 and pi / 30 and for x, y, y, x at pi / 3
// DISCLOSED: a probe (tmp/probe-g-landau.ts, tmp/electron2-probe-g-landau-192.log) ran the four Landau cases at L =
// 96 and 192 before these gates were written, to learn whether the estimator applies at those fields; its misses
// were 0.0002, 0.0001, 0.0039 and 0.0056. The analytic values were derived first and did not change.
//
// Depth L2: second-order Floquet perturbation theory, a known method, on a constructed stand-in; the check is a
// second, independent method (the full Landau chain).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { tokenG, twoStreamG, type TokenStep } from '@/code/measure/token-g-analytic'
import { bandSignOf, landauG } from '@/code/measure/token-g-landau'
import { type Step } from '@/code/rule/spinor-token'

const MODEL_COIN = Math.PI / 3
const TOKEN: readonly Step[] = ['x', 'y', 'z', 'up', 'down']
const PALINDROME: readonly Step[] = ['x', 'y', 'y', 'x']
const EXACT = 1e-12
const CLOSE = 1e-9
const WITNESS = 0.02
const SIDES = [96, 192]

const asToken = (schedule: readonly Step[]): TokenStep[] => schedule.map(s => ({ axis: s === 'x' ? 'x' : s === 'y' ? 'y' : 'none' }))

export default experiment({
  id: 'matter/token-g-derived',
  code: 'E-MTR-0016',
  title:
    'why the spinor token reads g = 4, a STAND-IN: second-order perturbation theory on its symbol gives g = 2 |X| / sqrt(X^2 - 1), X = cos(delta - phi/2) / sin(phi/2), the Zeeman term fed by the ordering commutator of an x copy and a y copy in coin frames delta apart as well as by the Dirac hop; at the model coin every one-x one-y schedule is g = 4 exactly or a saddle, and the Landau ladders confirm the formula at four coins and schedules',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1: general perturbation theory against the closed form
    const coins = [MODEL_COIN, Math.PI / 20, Math.PI / 30, Math.PI / 60]
    const tokenSteps = asToken(TOKEN)
    const rows = coins.map(mu => {
      const general = tokenG({ schedule: tokenSteps, mu })
      const closed = twoStreamG({ delta: 2 * mu, phi: 10 * mu })

      return { mu, general, closed }
    })
    const saddleGeneral = tokenG({ schedule: tokenSteps, mu: Math.PI / 12 })
    const saddleClosed = twoStreamG({ delta: Math.PI / 6, phi: (10 * Math.PI) / 12 })
    const closedGap = Math.max(...rows.map(r => Math.abs(r.general.g - r.closed.g)))
    const consistency = Math.max(...[...rows.map(r => r.general), saddleGeneral].flatMap(r => [r.firstOrder, r.antiHermitian, r.offDiagonal]))
    const g1 = closedGap < CLOSE && rows.every(r => r.general.bowl) && !saddleGeneral.bowl && Number.isNaN(saddleClosed.g) && consistency < EXACT

    // G2: the model coin in closed form
    const model = rows[0]?.general
    const up = model?.sectors[0]
    const down = model?.sectors[1]
    const sqrt3 = Math.sqrt(3)
    const g2Gap = Math.max(
      Math.abs((model?.g ?? 0) - 4),
      Math.abs((up?.a ?? 0) + 1 / (2 * sqrt3)),
      Math.abs((up?.b ?? 0) + 1 / (2 * sqrt3)),
      Math.abs(up?.c ?? 1),
      Math.abs(Math.abs(up?.zeeman ?? 0) - 1 / sqrt3),
      Math.abs((up?.zeeman ?? 0) + (down?.zeeman ?? 0)),
      Math.abs((down?.a ?? 0) - (up?.a ?? 1)),
    )
    const g2 = g2Gap < EXACT

    // G3: every one-x one-y schedule at the model coin
    let twoStreamMassive = 0
    let twoStreamBowls = 0
    let twoStreamSaddles = 0
    let twoStreamOther = 0

    for (let length = 2; length <= 8; length++) {
      for (let x = 0; x < length; x++) {
        for (let y = 0; y < length; y++) {
          if (x === y) {
            continue
          }

          const schedule: TokenStep[] = Array.from({ length }, (_, k) => ({ axis: k === x ? 'x' : k === y ? 'y' : 'none' }))
          const r = tokenG({ schedule, mu: MODEL_COIN })

          if (Math.abs(r.restGap) < CLOSE) {
            continue
          }

          twoStreamMassive++

          if (r.bowl) {
            twoStreamBowls++
            twoStreamOther += Math.abs(r.g - 4) < CLOSE ? 0 : 1
          } else {
            twoStreamSaddles++
          }
        }
      }
    }

    const g3 = twoStreamOther === 0 && twoStreamBowls > 0 && twoStreamSaddles > 0

    // G4: the Landau witness
    const witnessCases: { name: string; schedule: readonly Step[]; mu: number }[] = [
      { name: 'tokenModel', schedule: TOKEN, mu: MODEL_COIN },
      { name: 'tokenPi20', schedule: TOKEN, mu: Math.PI / 20 },
      { name: 'tokenPi30', schedule: TOKEN, mu: Math.PI / 30 },
      { name: 'palindromeModel', schedule: PALINDROME, mu: MODEL_COIN },
    ]
    const witness = witnessCases.map(c => {
      const analytic = tokenG({ schedule: asToken(c.schedule), mu: c.mu }).g
      const sign = bandSignOf({ schedule: c.schedule, mode: 'locked', coinAngle: c.mu })
      const readings = SIDES.map(side => landauG({ schedule: c.schedule, mode: 'locked', coinAngle: c.mu, side, sign }))
      const zeroField = 2 * (readings[1]?.gLo ?? 0) - (readings[0]?.gLo ?? 0)

      return { ...c, analytic, readings, zeroField, miss: Math.abs(zeroField - analytic) }
    })
    const g4 = witness.every(w => w.miss < WITNESS)

    const ok = g1 && g2 && g3 && g4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `second-order perturbation theory on the token's symbol equals the closed form g = 2|X|/sqrt(X^2 - 1) at four coins (gap ${closedGap.toExponential(1)}, consistency residue ${consistency.toExponential(1)}) and both call pi/12 a saddle; at the model coin the token's band is H = -(1/(2 sqrt 3)) pi^2 -+ (beta/sqrt 3) sigma_z with no anisotropic term, so g = ${model?.g.toFixed(12)}; of ${twoStreamMassive} massive one-x one-y schedules up to 8 beats at the model coin ${twoStreamBowls} are bowls with g = 4 and ${twoStreamSaddles} are saddles, ${twoStreamOther} anything else; and the Landau ladders extrapolated to zero field read ${witness.map(w => `${w.name} ${w.zeroField.toFixed(4)} against ${w.analytic.toFixed(4)}`).join(', ')}`,
      metrics: {
        closedFormGap: closedGap,
        consistencyResidue: consistency,
        ...Object.fromEntries(rows.map(r => [`analyticG_mu${(Math.PI / r.mu).toFixed(0)}`, Number(r.general.g.toFixed(9))])),
        ...Object.fromEntries(rows.map(r => [`closedX_mu${(Math.PI / r.mu).toFixed(0)}`, Number(r.closed.x.toFixed(9))])),
        modelCoinG: model?.g ?? NaN,
        modelCoinCurvature: up?.a ?? NaN,
        modelCoinAnisotropic: up?.c ?? NaN,
        modelCoinZeeman: up?.zeeman ?? NaN,
        modelCoinCyclotronPerField: model?.cyclotron[0] ?? NaN,
        modelCoinGapResidue: g2Gap,
        twoStreamMassive,
        twoStreamBowls,
        twoStreamSaddles,
        twoStreamOther,
        ...Object.fromEntries(
          witness.flatMap(w => [
            [`${w.name}_analytic`, Number(w.analytic.toFixed(6))],
            [`${w.name}_zeroField`, Number(w.zeroField.toFixed(6))],
            [`${w.name}_miss`, Number(w.miss.toFixed(6))],
            ...w.readings.map(r => [`${w.name}_L${r.side}_gLo`, Number(r.gLo.toFixed(6))]),
          ]),
        ),
      },
      control: {
        saddleCoinBowl: saddleGeneral.bowl ? 1 : 0,
        saddleCoinClosedX: saddleClosed.x,
      },
      notes:
        'L2, STAND-IN. The token\'s g = 4 is derived, not fitted: in the frame where the coins are moved to the front, the y stream is seen 2 mu = 120 degrees from the x stream, and the second-order Zeeman term collects the ordering commutator of the two copies (sin delta) besides the Dirac hop through the antiparticle band (kappa cos delta). At the model coin these are sqrt 3 / 2 and (-1/sqrt 3)(-1/2) = 1 / (2 sqrt 3), total 2 / sqrt 3 against a kinetic 1 / sqrt 3, twice the Dirac ratio. The three hypotheses of E-MTR-0015 all fail: the spin is a doublet (two ladders one whole spacing apart, E-MTR-0015\'s own sectors), the orbital coupling is the ordinary kappa (the cyclotron per unit field is 1 / sqrt 3 exactly, the value E-MTR-0015 and E-FRC-0176 approached from below at finite field), and the heavy coin enters only through kappa and delta. What the model coin does fix is the discreteness: with C^3 = 1, every one-x one-y schedule has X^2 in {4/3, 1/3}, so g = 4 or no bowl at all. The light coins approach 2 as g - 2 = 1/X^2 + ..., X = cos 3 mu / sin 5 mu for this token, which is why E-MTR-0015\'s witness read 2.10 and not 2. The same formula names the saddle that broke E-MTR-0015\'s estimator between pi/30 and pi/3 (pi/12: X = 0.73). E-MTR-0017 asks what makes g = 2 exactly.',
    })
  },
})
