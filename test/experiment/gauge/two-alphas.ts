// THE TWO ALPHAS, READ FROM ONE LIGHT (E-FRC-0266). OPEN-LGT-03: the model carries two definitions of alpha that
// differ by exactly sqrt 24 at every split rho and column size N:
//   alpha_C  = sqrt(3 / (2 rho)) / (12 N)   the static energy of two charges on the husk over the light's speed
//                                           (E-FRC-0242, 0261: C = s / (12 N), c = sqrt(2 kappa / 3))
//   alpha_GR = 1 / (2 N sqrt rho)           E-FRC-0240's closed form, g_KS^2 / (4 pi) with g_KS^2 = sqrt(A / B),
//                                           A = 2 pi s / N and B = f N / (2 pi), whose long-wave golden rule on a
//                                           closed STRIP of husk squares is 4 pi alpha d^2 omega
// Closing the item takes both read from one exact run and the factor traced: a convention (per link against per
// dock, a normalization of charge or of the column) or a real disagreement.
//
// DERIVED BEFORE THE GATE RUN. No probe was run; the code was typechecked before the run.
// 1. WHAT EACH DEFINITION READS. Write a light's field energy as (a/2) sum_l e_l^2 / w_l plus its magnetic part,
//    with a = 2 pi s / N (the quantum light's drift phase per unit of 1/2 e^2 / w). Two numbers of the light's
//    long-wave limit fix alpha: the static permittivity eps (a +1, -1 pair holds a / (4 pi eps r), the Gauss
//    operator eps(k) = sum_l w_l |1 - e^(i k.v_l)|^2 -> eps k^2) and the speed c. Then alpha = a / (4 pi eps c)
//    read statically. Read from emission, a one-link dimer radiates at omega^3 |d|^2 / (3 pi eps_R c^3), and in any
//    isotropic linear medium eps_R = eps, because the far field of a dipole and the field of a charge are set by
//    the same field energy. So on one light the static alpha and the golden-rule alpha are the same number.
// 2. THE STRIP'S FORM IS THE ALPHA OF A DIFFERENT LATTICE. g_KS^2 / (4 pi) = a / (4 pi sqrt(a b)) is alpha exactly
//    for a lattice with eps = 1 (one weight-1 link carrying the whole field along each axis, the simple cubic
//    lattice, whose Gauss operator is k^2) and speed sqrt(kappa) (the strip's and the cubic lattice's, kappa = s f).
//    The husk has neither:
//    - eps = 6: sum_h w_h (k-hat . v_h)^2 = 6 for every direction (the axis along k carries weight 2, four face
//      diagonals with a component along it carry 1 each). A unit field threads six weighted links per dock
//      (E-FRC-0241's 1 / (24 pi r) = 1 / (4 pi 6 r); code/measure/husk-emission's eps0 = 6)
//    - c^2 = 2 kappa / 3 (E-FRC-0179, 0212)
//    So alpha_GR / alpha_C = 6 sqrt(2/3) = sqrt 24 EXACTLY: the factor 6 is per link against per dock (the field
//    energy a charge's flux spreads over), the factor sqrt(2/3) is the husk's speed against the strip's at one
//    kappa. Neither is a normalization of the charge or of the column: s, N and a are the same in both.
// 3. PREDICTED, on the husk light read off the bulk rule's own beats (code/measure/husk-emission readHuskStencil):
//    c^2 / kappa = 2/3, eps_C = 6, and eps_R = 6 for a dimer on every one of the 9 link directions; on the simple
//    cubic control: 1, 1 and 1; on the strip (the closed ring of squares, E-FRC-0240's light): c^2 / kappa = 1.
//    Hence alpha_R = alpha_C on the husk (the model has ONE alpha, the Coulomb form), and alpha_GR is the cubic
//    lattice's alpha, carried to the husk without the husk's geometry. A REAL DISAGREEMENT would be the husk's
//    own golden rule giving alpha_GR, which needs eps_R = c_strip / c_husk = sqrt(3/2) = 1.2247, not 6.
//
// GATES, fixed before the gate run. The long-wave constants are read at k radius 2e-3 and 1e-3 on a 16 by 32
// Gauss-Legendre sphere and Richardson-extrapolated (code/measure/two-alphas longWave).
// S1 HUSK SPEED: |c^2 / kappa - 2/3| <= 1e-7, spread over directions and photons <= 1e-5, the gauge eigenvalue
//    over k^2 <= 1e-7 (a double's eigenvalue error, about 4e-15, is 4e-9 of a photon eigenvalue at k = 1e-3)
// S2 HUSK STATIC: |eps_C - 6| <= 1e-8
// S3 HUSK EMISSION: |eps_R - 6| <= 1e-6 for each of the 9 link directions
// S4 CUBIC CONTROL: |c^2 / kappa - 1|, |eps_C - 1| and every |eps_R - 1| <= 1e-6
// S5 STRIP: the ring's c^2 / kappa = (2 - 2 cos k) / k^2 extrapolated from k = 2e-3, 1e-3 is 1 within 1e-8 (the
//    cancellation in 1 - cos k costs about 2e-10)
// S6 ALPHAS: at D = 4, 11, 16 (N = 2D + 1) and rho = 3, 3/8, 9/20 (kappa = 3/16; kappa cancels), alpha read from
//    the husk's measured eps_C and c, and from each of its 9 eps_R, equals sqrt(3 / (2 rho)) / (12 N) within 1e-6
//    relative; alpha read from the cubic control's measured constants (static and every radiative) equals
//    1 / (2 N sqrt rho) within 1e-6; and the measured trace eps_C sqrt((c^2/kappa)_husk / (c^2/kappa)_strip)
//    equals sqrt 24 within 1e-6
// R1 A SECOND METHOD: the finite-omega golden rule on rays (code/measure/husk-emission goldenRule, the leapfrog's
//    own band found by bisection, E-FRC-0190's method) at omega = 0.01, kappa the rule's, on a 48 by 96 grid,
//    for dimers on an axis link and a diagonal link, is within 2e-2 of omega^3 |d|^2 / (3 pi 6 c^3) (and so NOT
//    within 50 percent of the disagreement's eps 1.2247)
// READ: the grid check (24 by 48 against 16 by 32), every eps_R, the alphas at the husk's measured balance
// 0.4613818, and alpha_GR / alpha_C per point.
// Status: pass if every gate holds (one alpha on the husk, the sqrt 24 traced to eps and c); fail otherwise.
//
// FIRST RUN 2026-09-29 (in the experiment/light-balance worktree, tmp/two-alphas-run1.log, 83 s): PASS, all seven gates held, no gate moved, no probe before
// it. Husk c^2 / kappa 0.666666664 (spread 1.9e-8), eps_C 5.99999999997, eps_R 5.99999995 to 6.00000003 on the 9
// directions (grid check 3e-9); cubic 1, 1, 1 to 1e-11; strip 0.99999999997. alpha against the Coulomb form: static
// 1.9e-9, radiative 1.0e-8; the cubic control against 1 / (2 N sqrt rho): 1.1e-11. Trace 4.898979476 (sqrt 24 to
// 9e-9). On rays at omega = 0.01: 1.0046 (axis) and 1.0077 (diagonal) of eps = 6, 0.205 of the disagreement's rate.
//
// Depth L2 (the identities are L1): the husk light is the bulk rule's own stencil; the golden rule is read from
// its photon modes and the static coefficient from its Gauss operator; the cubic lattice is a control, not the
// model. No start family: every claim is about the light's constants.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  goldenRule,
  HUSK_KAPPA,
  huskSymbolizer,
  leapfrogMu,
  readHuskStencil,
  sphereGrid,
} from '@/code/measure/husk-emission'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { ringCurl } from '@/code/rule/loop-ring'
import {
  alphaGoldenRule,
  alphaOfBalance,
} from '@/code/measure/light-split-origin'
import {
  alphaOfLight,
  cubicSymbolizer,
  longWave,
} from '@/code/measure/two-alphas'

const RADIUS = 2e-3
const DEPTHS = [4, 11, 16]
const SPLITS = [3, 3 / 8, 9 / 20]
const HUSK_BALANCE = 0.4613818
const KAPPA = 3 / 16
const SQRT24 = Math.sqrt(24)

export function twoAlphasRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}

  const husk = huskSymbolizer(readHuskStencil(8))
  const cubic = cubicSymbolizer()
  const grid = sphereGrid(16, 32)
  const fine = sphereGrid(24, 48)
  const h = longWave(husk, grid, RADIUS)
  const hFine = longWave(husk, fine, RADIUS)
  const q = longWave(cubic, grid, RADIUS)

  metrics.huskSpeedSquared = h.speedSquared
  metrics.huskSpeedSpread = h.speedSpread
  metrics.huskGaugeLeak = h.gaugeLeak
  metrics.huskStatic = h.staticPermittivity
  metrics.huskStaticSpread = h.staticSpread
  h.radiativePermittivity.forEach(
    (x, k) => (metrics[`huskRadiative_h${k}`] = x),
  )
  metrics.cubicSpeedSquared = q.speedSquared
  metrics.cubicStatic = q.staticPermittivity
  q.radiativePermittivity.forEach(
    (x, k) => (metrics[`cubicRadiative_h${k}`] = x),
  )
  metrics.gridCheckRadiative = Math.max(
    ...h.radiativePermittivity.map((x, k) =>
      Math.abs(x - (hFine.radiativePermittivity[k] ?? 0)),
    ),
  )

  const s1 =
    Math.abs(h.speedSquared - 2 / 3) <= 1e-7 &&
    h.speedSpread <= 1e-5 &&
    h.gaugeLeak <= 1e-7
  const s2 = Math.abs(h.staticPermittivity - 6) <= 1e-8
  const s3 = h.radiativePermittivity.every(x => Math.abs(x - 6) <= 1e-6)
  const s4 =
    Math.abs(q.speedSquared - 1) <= 1e-6 &&
    Math.abs(q.staticPermittivity - 1) <= 1e-6 &&
    q.radiativePermittivity.every(x => Math.abs(x - 1) <= 1e-6)

  // S5, the strip's (ring's) speed
  const ringAt = (k: number): number => ringCurl(k) / (k * k)
  const strip = (4 * ringAt(RADIUS / 2) - ringAt(RADIUS)) / 3
  const s5 = Math.abs(strip - 1) <= 1e-8

  metrics.stripSpeedSquared = strip

  // S6, the alphas
  let worstCoulomb = 0
  let worstRadiative = 0
  let worstCubic = 0

  const alphaAt = (
    n: number,
    rho: number,
    permittivity: number,
    speedSquared: number,
  ): number =>
    alphaOfLight({
      n,
      s: Math.sqrt(KAPPA / rho),
      kappa: KAPPA,
      permittivity,
      speedSquared,
    })

  for (const d of DEPTHS) {
    const n = 2 * d + 1

    for (const rho of [...SPLITS, HUSK_BALANCE]) {
      const coulomb = alphaAt(n, rho, h.staticPermittivity, h.speedSquared)
      const formulaC = alphaOfBalance(n, rho)
      const formulaGR = alphaGoldenRule(n, rho)
      const tag = `D${d}_rho${rho.toFixed(4)}`

      metrics[`alphaCoulomb_${tag}`] = coulomb
      metrics[`inverseAlphaCoulomb_${tag}`] = 1 / coulomb
      metrics[`goldenOverCoulomb_${tag}`] = formulaGR / coulomb

      if (rho === HUSK_BALANCE) {
        continue
      }

      worstCoulomb = Math.max(worstCoulomb, Math.abs(coulomb / formulaC - 1))

      for (const eps of h.radiativePermittivity) {
        worstRadiative = Math.max(
          worstRadiative,
          Math.abs(alphaAt(n, rho, eps, h.speedSquared) / formulaC - 1),
        )
      }

      for (const eps of [q.staticPermittivity, ...q.radiativePermittivity]) {
        worstCubic = Math.max(
          worstCubic,
          Math.abs(alphaAt(n, rho, eps, q.speedSquared) / formulaGR - 1),
        )
      }
    }
  }

  const trace =
    h.staticPermittivity * Math.sqrt(h.speedSquared / strip)

  metrics.worstCoulombAgainstFormula = worstCoulomb
  metrics.worstRadiativeAgainstFormula = worstRadiative
  metrics.worstCubicAgainstGoldenForm = worstCubic
  metrics.traceMeasured = trace
  metrics.traceMiss = trace - SQRT24

  const s6 =
    worstCoulomb <= 1e-6 &&
    worstRadiative <= 1e-6 &&
    worstCubic <= 1e-6 &&
    Math.abs(trace - SQRT24) <= 1e-6

  // R1, the golden rule on rays at finite omega (E-FRC-0190's method)
  const omega = 0.01
  const c = Math.sqrt((2 * HUSK_KAPPA) / 3)
  const rays = sphereGrid(48, 96)
  const dimer = (link: number): number =>
    goldenRule({
      symbol: husk,
      couplings: [
        [
          {
            x: [0, 0, 0],
            h: link,
            re: 0,
            im: omega / (2 * (HUSK_WEIGHTS[link] ?? 1)),
          },
        ],
      ],
      omega,
      grid: rays,
    }).rates[0]!

  let r1 = true

  for (const link of [0, 3]) {
    const d = Math.hypot(...(HUSK_VECTORS[link] ?? [0, 0, 0])) / 2
    const rate = dimer(link)
    const expected = (omega ** 3 * d * d) / (3 * Math.PI * 6 * c ** 3)
    const disagreement =
      (omega ** 3 * d * d) / (3 * Math.PI * Math.sqrt(3 / 2) * c ** 3)

    metrics[`raysRatio_h${link}`] = rate / expected
    metrics[`raysOverDisagreement_h${link}`] = rate / disagreement
    r1 &&=
      Math.abs(rate / expected - 1) <= 2e-2 &&
      Math.abs(rate / disagreement - 1) > 0.5
  }

  metrics.raysMuTarget = leapfrogMu(HUSK_KAPPA, omega)

  const gates = { S1: s1, S2: s2, S3: s3, S4: s4, S5: s5, S6: s6, R1: r1 }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.seconds = (Date.now() - started) / 1000

  const f = (x: number | undefined, digits = 9): string =>
    (x ?? Number.NaN).toFixed(digits)

  return verdict({
    status: Object.values(gates).every(Boolean) ? 'pass' : 'fail',
    claim: `one husk light (the bulk rule's own stencil), read in the long-wave limit: c^2 / kappa = ${f(h.speedSquared)}, the static permittivity ${f(h.staticPermittivity)} from its Gauss operator, and the radiative permittivity ${f(Math.min(...h.radiativePermittivity))} to ${f(Math.max(...h.radiativePermittivity))} from a one-link dimer's golden rule on all 9 link directions, so the Coulomb alpha and the golden-rule alpha of the husk are one number, sqrt(3 / (2 rho)) / (12 N) (worst ${worstRadiative.toExponential(1)}); the simple cubic control reads 1, 1 and 1 and its alpha is E-FRC-0240's 1 / (2 N sqrt rho) (worst ${worstCubic.toExponential(1)}); the strip's c^2 / kappa is ${f(strip, 12)}; so the sqrt 24 = eps x c_husk / c_strip = ${f(trace)} is the husk's six weighted links per direction against the strip's one, times its speed sqrt(2/3) against the strip's at one kappa: a convention of which lattice the per-link coupling is read on, not a disagreement; finite omega on rays reads ${f(metrics.raysRatio_h0, 4)} (axis) and ${f(metrics.raysRatio_h3, 4)} (diagonal) of eps = 6`,
    metrics,
    control: {
      cubicStatic: q.staticPermittivity,
      cubicSpeedSquared: q.speedSquared,
      stripSpeedSquared: strip,
    },
    notes: `L2, deterministic (Gauss-Legendre spheres, a Richardson step, bisection on the band; no draw). Gates: ${JSON.stringify(gates)}. The husk light has one alpha, the Coulomb form; E-FRC-0240's form is the per-link Kogut-Susskind coupling, which is alpha only on a lattice with eps = 1 and speed sqrt(kappa).`,
  })
}

export default experiment({
  id: 'gauge/two-alphas',
  code: 'E-FRC-0266',
  title:
    "the two alphas read from one light: on the husk light the static permittivity from Gauss's law and the radiative one from a dimer's golden rule are both 6 and c^2 = 2 kappa / 3, so the Coulomb and golden-rule alphas are one number, sqrt(3 / (2 rho)) / (12 N); E-FRC-0240's 1 / (2 N sqrt rho) is the alpha of a lattice with one link per axis and speed sqrt(kappa) (the cubic control and the strip), and the sqrt 24 between them is 6 times sqrt(2/3), per link against per dock and the husk's speed, a convention and not a disagreement",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return twoAlphasRun()
  },
})
