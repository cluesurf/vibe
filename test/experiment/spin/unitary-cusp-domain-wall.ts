// EXACT DISCRETE-TIME UNITARY CUSP DOMAIN WALL IN Z[zeta_9][1/6] (E-SPN-0222).
// Lifts E-SPN-0221's Hermitian Kaplan/Shamir domain wall to a true discrete-time split-step unitary quantum walk
// U(k) = (V_1(k) V_2(k) V_1(k) (x) I_2) * S_husk(k) on a one-sided cusp column D = 0..23 (matching {3,4,3,4}'s
// 18-down / 0-up cusp boundary).
//
// Every coin at k = 0 and all 7 3D Brillouin-zone doublers is an exact algebraic element of Vibe Theory's ring
// Z[zeta_9][1/6] (constructed from the working rule's coin C = (1/2)[[1+w, 1-w], [1-w, 1+w]], half-coin D with
// D^2 = C, and zeta_18 = -zeta_9^5 rotations R_x(2m pi / 9)):
//   - At k = 0: C_1 = R_x(2pi/9), C_2 = R_x(4pi/3) = w^2 C^dag -> bulk winding (nu_0, nu_pi) = (1, 0), exact
//     Left-handed cusp mode localized at D <= 2 (> 0.999 weight, analytic decay |rho| = tan(pi/9)/tan(pi/3) = 0.2101),
//     Right-handed mirror twin pushed to D = 23 (< 1e-12 on D <= 2, chirality asymmetry > 0.999999999).
//   - At all 7 3D doublers: C_1 = R_x(2pi/3) = (-w) C, C_2 = I -> bulk winding (nu_0, nu_pi) = (0, 0), zero edge
//     modes, every doubler gapped by >= pi/3 > 1.04 rad from both E = 0 and E = pi.
//   - At small |k| = 0.05, 0.10 along (1,0,0), (1,1,0), (1,1,1): isotropic 3D chiral Weyl cone E(k) = v_F |k|
//     (v_F = 1) matching arccos(cos kx cos ky cos kz) to < 1e-12 and linear |k| to < 1e-3.
//
// Depth L2: exact Q(zeta_9) symbolic unitarity & chiral certificates plus full 96x96 unitary Floquet spectrum.
// Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { analyzeUnitaryCuspWall } from '@/code/measure/unitary-cusp-wall'

export default experiment({
  id: 'spin/unitary-cusp-domain-wall',
  code: 'E-SPN-0222',
  title:
    'Exact discrete-time split-step unitary cusp domain wall in Z[zeta_9][1/6] localizes one chiral Weyl cone at D=0, gaps all 7 3D doublers, and verifies symbolic Q(zeta_9) unitarity',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeUnitaryCuspWall(24)
    const g = r.gammaPoint

    const minConeLeftHusk = Math.min(...r.weylCone.map(w => w.leftHuskWeight))
    const maxConeRightHusk = Math.max(...r.weylCone.map(w => w.rightHuskWeight))

    const ok =
      r.algebraic.allExact &&
      r.maxUnitarityErr <= 1e-14 &&
      r.maxEigResidual <= 1e-12 &&
      g.winding.nu0 === 1 &&
      g.winding.nuPi === 0 &&
      g.minQuasienergyAbs < 1e-12 &&
      g.leftHuskWeight > 0.999 &&
      g.rightHuskWeight < 1e-12 &&
      g.rightFloorWeight > 0.999 &&
      g.leftFloorWeight < 1e-12 &&
      g.huskChiralityAsymmetry > 0.999999999 &&
      r.allDoublersTrivialWinding &&
      r.minDoublerZeroGap > 1.0 &&
      r.minDoublerPiGap > 1.0 &&
      r.maxWeylLinearRelErr < 1e-3 &&
      r.maxWeylStrangErr < 1e-11 &&
      r.maxWeylIsotropySpread < 1e-3 &&
      minConeLeftHusk > 0.99 &&
      maxConeRightHusk < 1e-10

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Exact Z[zeta_9][1/6] split-step unitary cusp walk (N=24, dim=96): symbolic Q(zeta_9) unitarity/chiral ` +
        `certificate=${r.algebraic.allExact}, max ||U^dag U - I||_inf = ${r.maxUnitarityErr.toExponential(2)}; ` +
        `k=0 winding (nu0=${g.winding.nu0}, nuPi=${g.winding.nuPi}) gives quasienergy gap ` +
        `${g.minQuasienergyAbs.toExponential(2)}, Left cusp weight (D<=2) = ${g.leftHuskWeight.toFixed(6)} vs Right = ` +
        `${g.rightHuskWeight.toExponential(2)} (asymmetry ${g.huskChiralityAsymmetry.toFixed(12)}, Right mirror on ` +
        `D>=21 = ${g.rightFloorWeight.toFixed(6)}); all 7 3D doublers trivial (nu0=nuPi=0, min 0-gap = ` +
        `${r.minDoublerZeroGap.toFixed(4)}, min pi-gap = ${r.minDoublerPiGap.toFixed(4)}); small-k (0.05, 0.10 along ` +
        `(1,0,0), (1,1,0), (1,1,1)) obeys isotropic 3D chiral Weyl cone (max linear rel err = ` +
        `${r.maxWeylLinearRelErr.toExponential(2)}, isotropy spread = ${r.maxWeylIsotropySpread.toExponential(2)}, ` +
        `exact discrete-cone err = ${r.maxWeylStrangErr.toExponential(2)})`,
      metrics: {
        algebraicAllExact: r.algebraic.allExact ? 1 : 0,
        maxUnitarityErr: r.maxUnitarityErr,
        maxEigResidual: r.maxEigResidual,
        gammaNu0: g.winding.nu0,
        gammaNuPi: g.winding.nuPi,
        gammaZeroGap: g.minQuasienergyAbs,
        gammaBulkGap: g.bulkGapFromZero,
        leftHuskWeight: g.leftHuskWeight,
        rightHuskWeight: g.rightHuskWeight,
        rightFloorWeight: g.rightFloorWeight,
        leftFloorWeight: g.leftFloorWeight,
        huskChiralityAsymmetry: g.huskChiralityAsymmetry,
        allDoublersTrivialWinding: r.allDoublersTrivialWinding ? 1 : 0,
        minDoublerZeroGap: r.minDoublerZeroGap,
        minDoublerPiGap: r.minDoublerPiGap,
        maxWeylLinearRelErr: r.maxWeylLinearRelErr,
        maxWeylStrangErr: r.maxWeylStrangErr,
        maxWeylIsotropySpread: r.maxWeylIsotropySpread,
        minConeLeftHusk,
        maxConeRightHusk,
      },
    })
  },
})
