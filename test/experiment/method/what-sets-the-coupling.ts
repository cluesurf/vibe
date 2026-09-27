// What sets the U(1) coupling in the model: alpha on the husk derived from the link sector's own Hamiltonian,
// read off its Green's function and its photon, and shown to be a free function of three choices.
//
// The link sector (E-FRC-0164) is H = sum E^2 / 2 + (K N / 2 pi) sum (1 - cos(2 pi B / N)) with the integer
// angle A conjugate to the integer flux E. Written with the angle theta = 2 pi A / N, the pair (theta, E) is
// canonical at hbar = 1 per beat and the energy is H' = (a / 2) sum E^2 + K sum (1 - cos theta_p), a = 2 pi / N.
// Two numbers make a fine-structure constant, a Coulomb law and a speed of light, both read on the husk:
//
// - COULOMB. A +1, -1 pair of vibes costs U = a (G(0) - G(r)). On the husk, past the column of D bulk docks
//   over each husk dock, G(r) -> 1 / (24 pi D r) (code/measure/coupling-candidates: the husk symbol is 6 k^2,
//   and the column shares the flux among its D docks). So U = C / r with C = a / (24 pi D).
// - LIGHT. The photon's curl-curl eigenvalue is lambda = (2/3) k^2 at small k (E-FRC-0179), so
//   c = sqrt(2 kappa / 3), kappa = a K = 2 pi K / N: 0.20225 per beat at the committed K = 80, N = 8192.
//
// alpha = C / (hbar c) = 1 / (12 N D c) for a vibe of charge 1, times e^2 for the rule's `charge` e. With
// c = sqrt(4 pi K / 3 N): alpha^-1 = 12 D sqrt(4 pi K N / 3) / e^2. If a single vibe is a third of the
// electron's charge (Q = (love - fear) / 3, E-FRC-0170), the electron's alpha is 9 times the vibe's.
//
// The prediction, written before the run: the husk coupling is the bulk coupling divided by the column depth
// D, the 3D Kaluza-Klein (Randall-Sundrum) dilution, so on the flat box alpha depends on K, N, e AND the
// depth of the box, and no part of the knit fixes any of them. At the committed K, N, e = 1 and the side-12
// husk box of E-FRC-0168 (D = 12), alpha^-1 = 238,580 per vibe.
//
// Gates, fixed before the run:
// G1 on the D4 torus with husk period 96 and column depth D = 1, 2, 4: the husk Coulomb coefficient
//    C(D) = (G(8) - G(16)) / (1/8 - 1/16) (torus background removed) satisfies |24 pi D C(D) - 1| < 0.01
// G2 the dilution, the control: C(1) / C(4) within 1 percent of 4. A husk coupling equal to the bulk's
//    (no dilution) gives 1, so this gate can fail
// G3 the photon: on the side-16 D4 box, the three smallest nonzero curl-curl eigenvalues over k^2 at the
//    smallest wave vector along each of two box directions and at twice it, extrapolated to k = 0 by
//    Richardson ((4 r(k) - r(2k)) / 3), are within 1 percent of 2/3
//
// Depth L2: lattice electrostatics and the leapfrog photon, textbook, applied to the model's own sector. The
// result is the negative the roadmap needs stated: the coupling is chosen, and the choice has three knobs.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import { linearWaveEigenvalues, waveVector } from '@/code/measure/photon-modes'
import { columnPairEnergy } from '@/code/measure/coupling-candidates'

const N = 8192
const K = 80
const P = 96
const DEPTHS = [1, 2, 4]
const NEAR = 8
const FAR = 16
const PHOTON_SIDE = 16
const HUSK_BOX_DEPTH = 12

export default experiment({
  id: 'method/what-sets-the-coupling',
  code: 'E-MTH-0020',
  title:
    'what sets the U(1) coupling: on the husk the link sector gives alpha = 1 / (12 N D c) per vibe, the Coulomb coefficient 1 / (24 pi D) read off the D4 column Green\'s function (the husk coupling is the bulk one divided by the column depth D) and c = sqrt(2 kappa / 3) off the photon, so alpha^-1 = 12 D sqrt(4 pi K N / 3) / e^2 is a free function of the chosen K, N, charge e and box depth, 238,580 at the committed rule on the side-12 husk box, and nothing in the knit fixes it',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const coefficients = DEPTHS.map(depth => {
      const [near, far] = columnPairEnergy({ p: P, depth, separations: [NEAR, FAR] })

      return ((far ?? 0) - (near ?? 0)) / (1 / NEAR - 1 / FAR)
    })
    const normalized = coefficients.map((c, i) => 24 * Math.PI * DEPTHS[i]! * c)
    const coulomb = normalized.every(x => Math.abs(x - 1) < 0.01)
    const dilution = coefficients[0]! / coefficients[2]!
    const diluted = Math.abs(dilution / 4 - 1) < 0.01

    const lattice = photonLatticeD4({ side: PHOTON_SIDE })
    // lambda / k^2 of the photon branches at wave numbers n and 2 n, extrapolated to k = 0 by Richardson
    // (the lattice correction is order k^2)
    const ratios = (n: readonly number[]): number[] => {
      const k = waveVector(lattice, n)
      const k2 = k.reduce((s, x) => s + x * x, 0)

      return linearWaveEigenvalues(lattice, n)
        .filter(v => v > 1e-9)
        .slice(0, 3)
        .map(v => v / k2)
    }
    const photonRatios = [
      [1, 0, 0, 0],
      [0, 0, 1, 0],
    ].flatMap(n => {
      const one = ratios(n)
      const two = ratios(n.map(x => 2 * x))

      return one.map((r, i) => (4 * r - (two[i] ?? 0)) / 3)
    })
    const photon = photonRatios.length === 6 && photonRatios.every(r => Math.abs(r / (2 / 3) - 1) < 0.01)

    const kappa = (2 * Math.PI * K) / N
    const c = Math.sqrt((2 * kappa) / 3)
    const inverseAlpha = (depth: number, charge: number): number => (12 * N * depth * c) / (charge * charge)
    const ok = coulomb && diluted && photon

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the husk fine-structure constant of the link sector is alpha = 1 / (12 N D c) per vibe: the D4 column Green\'s function gives the husk Coulomb coefficient 1 / (24 pi D) in units of a = 2 pi / N, the husk coupling being the bulk coupling divided by the column depth D, and the photon gives c = sqrt(2 kappa / 3), so alpha^-1 = 12 D sqrt(4 pi K N / 3) / e^2, set by the chosen force scale K, angle resolution N, charge e and box depth, none of which the knit fixes',
      metrics: {
        coulombDepthOne: normalized[0]!,
        coulombDepthTwo: normalized[1]!,
        coulombDepthFour: normalized[2]!,
        dilutionOneOverFour: dilution,
        photonRatioMin: Math.min(...photonRatios),
        photonRatioMax: Math.max(...photonRatios),
        kappa,
        lightSpeed: c,
        inverseAlphaPerVibeDepthOne: inverseAlpha(1, 1),
        inverseAlphaPerVibeHuskBox: inverseAlpha(HUSK_BOX_DEPTH, 1),
        inverseAlphaElectronThirdsHuskBox: inverseAlpha(HUSK_BOX_DEPTH, 1) / 9,
        // what the column depth would have to be for 1/137.036 per vibe at the committed K and N
        depthForObservedPerVibe: 137.035999177 / inverseAlpha(1, 1),
      },
      control: {
        noDilutionRatio: 1,
        dilutionOneOverFour: dilution,
      },
      notes:
        'L2. The Green\'s function is summed exactly over the torus modes (deterministic, no sampling); the torus background r^2 / (36 D P^3) is subtracted analytically. First run, 2026-09-25, pass: 24 pi D C(D) = 0.99958, 0.99960 and 1.00695 for D = 1, 2, 4, the last carrying the column\'s own tail at r = 8 = 2 D (the lightest depth mode decays as exp(-2 pi r / 2 D)), so the dilution C(1) / C(4) = 3.971 clears its 1 percent gate by 0.3 percent, and the Richardson photon ratio is 0.666688 on both directions. hbar = 1 because the flux is an integer and the angle is periodic in 2 pi: the pair (2 pi A / N, E) is canonical, so the energy in beats is (2 pi / N) times the rule\'s H. The charge in the Coulomb law is the vibe (love +1, fear -1); if a vibe is a third of the electron\'s charge (E-FRC-0170), the electron\'s alpha^-1 is the per-vibe value over 9. The flat box has no bottom along the depth, so D is its size; in the hyperbolic cusp the columns shrink by the warp factor per layer and the sum would converge (E-FRC-0177 weighed the layers and broke the husk Gauss\'s law), which E-MTH-0021 judges as a candidate. The knobs: N sets the angle resolution, K the force scale (kappa = 2 pi K / N is held below the stability bound 4 / lambda_max = 1/4 by choice), e the flux per vibe, D the box. Even the depth needed for 1/137 at the committed K and N is a fraction of a dock (reported), so the committed sector is not near the observed coupling in any geometry.',
    })
  },
})
