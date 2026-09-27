// E-FRC-0190. Spontaneous emission on the husk: a STAND-IN emitter coupled minimally to the EXACTLY LINEAR husk
// U(1) leapfrog of E-FRC-0179 (the linear rule, labeled so: the integer rule of E-FRC-0180 is not linear), its
// decay rate A against omega^3 |d|^2 with the husk photon density of states read off the symbol. The emitters are
// STAND-INS (a charge hopping on one husk link, and the stand-in hydrogen of E-MTR-0001); nothing here is L3.
//
// PREDICTION, written before the first run. The linear husk leapfrog has photons of speed c = sqrt(2 kappa / 3)
// (lambda / k^2 = 2/3, E-FRC-0179) and field energy 1/2 sum e^2 / w, whose long-wave permittivity is eps0 = 6
// (sum_h w_h u_h u_h^T = 6 I). The golden rule over the symbol's two photon branches, each with vacuum angle
// variance 1 / (2 sin omega) (the leapfrog's exact invariant, code/measure/husk-emission), then tends at small
// omega to
//   A = omega^3 |d|^2 / (3 pi eps0 c^3) = omega^3 |d|^2 / (18 pi c^3)          (the husk: 3 space dimensions)
// and in the D4 bulk, 4 space dimensions, 3 polarizations, the 12 root directions summing to 6 I again,
//   A = omega^4 |d|^2 / (64 pi c^4)                                             (the bulk, beside it)
// The photon density of states is the ray measure s^2 / |d omega / ds| of the symbol's own branches, exact.
//
// Method (code/measure/stand-in-light): the golden rule on rays (Gauss-Legendre by uniform azimuth, 24 x 48 on the
// husk, 8 x 8 x 16 on S^3 for the bulk), the crossing of each photon branch found by bisection on the symbol's
// eigenvalue. Emitters: (1) the DIMER, a charge q = 1 hopping on one husk link with levels split by omega, coupled
// through the Peierls phase q a / w on its one link, F = i q omega / (2 w), dipole |u| / 2, on an axis link and
// on a face diagonal; the same on one bulk root link; (2) the STAND-IN ATOM's 2p -> 1s transition at a = 2.5 and
// a = 4 (side-64 husk torus), its transition current density J = (q / 2){v, delta(x - X)} with v = grad T, lifted
// onto the husk links, every multipole kept, against its own omega = E_2p - E_1s and d = <1s|x|2p_x>. No random
// numbers anywhere; hermitianEigen (the degenerate-safe solver) gives every photon eigenvector.
//
// Gates, fixed before the first run. A machinery probe (tmp/emission-probe.ts, tmp/atom-emit-probe.ts) had run the
// axis dimer at omega = 0.005 to 0.3 (ratio to the continuum 1.0000 to 1.21) before these were written:
// 1. THE HUSK LAW: for the axis dimer, A / (omega^3 |d|^2 / (18 pi c^3)) within 1 percent of 1 at omega = 0.01
//    and 0.02, and the slope of ln A against ln omega over 0.01 to 0.04 within 0.02 of 3
// 2. ISOTROPY: the face-diagonal dimer's A / |d|^2 within 1 percent of the axis dimer's at omega = 0.02
// 3. THE STAND-IN ATOM: its velocity and length forms agree (|J(0)| = omega |d|) to 1e-4, and its full-current
//    A within 5 percent of omega^3 |d|^2 / (18 pi c^3) at a = 2.5 and a = 4
// 4. THE BULK BESIDE IT: the bulk dimer's slope over omega = 0.02 to 0.04 within 0.05 of 4, and its ratio to
//    omega^4 |d|^2 / (64 pi c^4) within 3 percent of 1 at omega = 0.02
// Pass: all four. Partial: 1 and 3. Fail: otherwise.
//
// Depth L2: the golden rule of a chosen stand-in emitter in the model's exact linear light.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { HUSK_SPEED, goldenRule, huskSymbolizer, hypersphereGrid, readHuskStencil, sphereGrid } from '@/code/measure/husk-emission'
import { bandGradient, bulkSymbolizer, currentAmplitude, goldenRuleCurrents, transitionCurrent } from '@/code/measure/stand-in-light'
import { HUSK_ATOM, ROWS, lowestLevels, makeAtom, positionElement } from '@/code/measure/stand-in-atom'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'

const DIMER_OMEGAS = [0.01, 0.02, 0.04, 0.08, 0.16, 0.3]

const huskContinuum = (omega: number, d: number): number => (omega ** 3 * d * d) / (18 * Math.PI * HUSK_SPEED ** 3)
const bulkContinuum = (omega: number, d: number): number => (omega ** 4 * d * d) / (64 * Math.PI * HUSK_SPEED ** 4)

export default experiment({
  id: 'gauge/husk-emission-rate',
  code: 'E-FRC-0190',
  title:
    'spontaneous emission into the exactly linear husk light: a stand-in emitter decays at A = omega^3 |d|^2 / (18 pi c^3), the rate the husk symbol predicts with c = sqrt(2 kappa / 3) and eps0 = 6, isotropic across link directions, for a one-link dimer and for the stand-in hydrogen 2p -> 1s, where the D4 bulk beside it goes as omega^4',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const stencil = readHuskStencil(8)
    const symbol = huskSymbolizer(stencil)
    const grid = sphereGrid(24, 48)
    const dimerRate = (h: number, omega: number): number => goldenRule({ symbol, couplings: [[{ x: [0, 0, 0], h, re: 0, im: omega / (2 * HUSK_WEIGHTS[h]!) }]], omega, grid }).rates[0]!
    const axis = DIMER_OMEGAS.map(omega => {
      const a = dimerRate(0, omega)

      metrics[`axisDimer_w${omega}_ratio`] = a / huskContinuum(omega, 0.5)

      return a
    })
    const huskSlope = Math.log(axis[2]! / axis[0]!) / Math.log(DIMER_OMEGAS[2]! / DIMER_OMEGAS[0]!)
    const diagonal = dimerRate(3, 0.02)
    const diagonalD = Math.hypot(...HUSK_VECTORS[3]!) / 2
    const isotropy = diagonal / diagonalD ** 2 / (axis[1]! / 0.25)

    metrics.huskSlope = huskSlope
    metrics.diagonalOverAxisPerDipole = isotropy

    // the stand-in atom
    let gate3 = true

    for (const a of [2.5, 4]) {
      const atom = makeAtom({ kind: HUSK_ATOM, side: 64, a })
      const s = lowestLevels({ atom, row: ROWS.A1g!, count: 1 })
      const p = lowestLevels({ atom, row: ROWS.T1u!, count: 1 })
      const omega = p.values[0]! - s.values[0]!
      const d = positionElement(64, s.vectors[0]!, p.vectors[0]!, 0)
      const current = transitionCurrent(atom, bandGradient(atom), s.vectors[0]!, p.vectors[0]!)
      const amplitude = currentAmplitude(64, current)
      const j0 = amplitude([0, 0, 0])
      const velocity = Math.hypot(...j0.re, ...j0.im)
      const rate = goldenRuleCurrents({ symbol, currents: [amplitude], omega, grid, lift: 6 }).rates[0]!
      const continuum = huskContinuum(omega, d)

      metrics[`atom_a${a}_omega`] = omega
      metrics[`atom_a${a}_dipole`] = d
      metrics[`atom_a${a}_velocityOverLength`] = velocity / (omega * Math.abs(d))
      metrics[`atom_a${a}_rate`] = rate
      metrics[`atom_a${a}_rateOverContinuum`] = rate / continuum
      gate3 = gate3 && Math.abs(velocity / (omega * Math.abs(d)) - 1) <= 1e-4 && Math.abs(rate / continuum - 1) <= 0.05
    }

    // the bulk beside it
    const bulk = bulkSymbolizer()
    const bulkGrid = hypersphereGrid(8, 8, 16)
    const bulkRate = (omega: number): number =>
      goldenRule({ symbol: bulk, couplings: [[{ x: [0, 0, 0], h: 0, re: 0, im: omega / 2 }]], omega, grid: bulkGrid, cap: { c0: HUSK_SPEED, factor: 3 } }).rates[0]!
    const b2 = bulkRate(0.02)
    const b4 = bulkRate(0.04)
    const bulkD = Math.hypot(...bulk.vector(0)) / 2
    const bulkSlope = Math.log(b4 / b2) / Math.log(2)

    metrics.bulkSlope = bulkSlope
    metrics.bulkRatioAt002 = b2 / bulkContinuum(0.02, bulkD)
    metrics.bulkRatioAt004 = b4 / bulkContinuum(0.04, bulkD)

    const gate1 = Math.abs(metrics['axisDimer_w0.01_ratio']! - 1) <= 0.01 && Math.abs(metrics['axisDimer_w0.02_ratio']! - 1) <= 0.01 && Math.abs(huskSlope - 3) <= 0.02
    const gate2 = Math.abs(isotropy - 1) <= 0.01
    const gate4 = Math.abs(bulkSlope - 4) <= 0.05 && Math.abs(metrics.bulkRatioAt002 - 1) <= 0.03
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate3 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a stand-in emitter in the exactly linear husk light decays at A = omega^${huskSlope.toFixed(3)} law with A / (omega^3 |d|^2 / 18 pi c^3) = ${metrics['axisDimer_w0.01_ratio']!.toFixed(4)} at omega = 0.01 (${metrics['axisDimer_w0.3_ratio']!.toFixed(3)} at 0.3, the lattice photon), the same per |d|^2 along a face diagonal (${isotropy.toFixed(4)}), and the stand-in hydrogen's 2p -> 1s at ${metrics['atom_a2.5_rateOverContinuum']!.toFixed(4)} and ${metrics.atom_a4_rateOverContinuum!.toFixed(4)} of the continuum rate at a = 2.5 and 4, where the D4 bulk beside it goes as omega^${bulkSlope.toFixed(3)}`,
      metrics: {
        ...metrics,
        gateHuskLaw: gate1 ? 1 : 0,
        gateIsotropy: gate2 ? 1 : 0,
        gateStandInAtom: gate3 ? 1 : 0,
        gateBulkBeside: gate4 ? 1 : 0,
      },
      notes:
        'L2, STAND-IN emitters (a one-link dimer, the band-projected stand-in hydrogen) in the LINEAR rule (the exactly linear husk leapfrog, the idealization E-FRC-0179 derived; the integer rule is not linear, E-FRC-0180). Husk first: the omega^3 law is the husk rate; the omega^4 bulk rate is the substrate beside it. A machinery probe ran the axis dimer before the gates (disclosed in the header). FIRST RUN (2026-09-26), status fail. The dimer follows omega^2.995 with ratios 1.007, 1.012, 1.001, 1.013 at omega = 0.01 to 0.08 (1.052 at 0.16, 1.215 at 0.3); gate 1 asked for 1 percent at 0.02 and the 24 x 48 ray grid gives 1.2 (tmp/emission-probe.ts had shown this grid carrying about 1 percent of quadrature error, 0.17 percent on 48 x 96), so the miss is the grid, and the gate was a knife edge. Isotropy read 0.985 against 1 percent, the same grid. The stand-in atom FAILS for a physical reason: its 2p -> 1s rate is 0.433 and 0.857 of the dipole rate at a = 2.5 and 4, because the atom is not small against its own light. The photons of the linear rule run at c = sqrt(2 kappa / 3) = 0.2023 per beat at the committed kappa, while the orbital speed of the stand-in is alpha = 1 / (sqrt 3 a) = 0.23 at a = 2.5: the stand-in moves faster than husk light, and k a = omega a / c = 1.1. The dipole regime needs a far beyond 1 / (sqrt 3 c) = 2.9. The bulk beside it goes as omega^4.028 (ratio 0.985), as derived.',
    })
  },
})
