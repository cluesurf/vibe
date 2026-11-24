// UNIVERSAL LIMITING SPEED c_light = c_matter = c_grav ON THE WARPED {3,4,3,4} CUSP COLUMN
// VS GW170817 (6e-15 BOUND) (E-RLT-0125, gaps B-41, m-29).
//
// Depth L2: exact {3,4,3,4} pair-density warped column (N_D = 1, 18, 330, 6034; w(D) = 1/N_D^2;
// K_eff = 1.0312370835 from E-GRV-0157; M_eff = sum 1/N_D = 1.0587611...), explicit multi-component
// spin-2 TT graviton (6*(F+1)), spin-1 lattice curl-curl Maxwell photon (3*(F+1)), and spin-1/2
// square-root chiral Weyl fermion (2*(F+1)) eigenproblems across (1,0,0), (1,1,0), (1,1,1), plus
// exact discrete-time unitary wave evolution and CFL-stable symplectic leapfrog. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { GW170817_BOUND, runUniversalSpeedLock } from '@/code/measure/universal-speed-lock'

export default experiment({
  id: 'relativity/universal-speed-lock',
  code: 'E-RLT-0125',
  title:
    'Universal limiting speed c_light = c_matter = c_grav to <= 1e-15 (beating GW170817 6e-15) on the shared {3,4,3,4} 1/N_D^2 warped cusp column, with decoupled negative control and exact unitary wave evolution',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runUniversalSpeedLock()
    const u = res.unitaryCheck

    // Gate 0: Numerical, operator, and polarization integrity
    const g0Integrity =
      res.hVertDirectMaxDiffF16 < 1e-14 &&
      res.qOrthoErrF16 < 1e-14 &&
      res.hVertDiagErrF16 < 1e-13 &&
      res.maxGravDegeneracyErr < 1e-14 &&
      res.maxGravGaugeZeroEig < 1e-14 &&
      res.maxGravTTIdentityErr < 1e-14 &&
      res.maxGravTTPurityErr < 1e-14 &&
      res.maxLightDegeneracyErr < 1e-14 &&
      res.maxLightGaugeZeroEig < 1e-14 &&
      res.maxLightGaugeLongitudinalErr < 1e-14 &&
      res.maxLightTransversalityErr < 1e-14 &&
      res.maxMatterChiralSymErr < 1e-14 &&
      res.maxMatterSquareMatchErr < 1e-13 &&
      res.maxMatterHelicityErr < 1e-14

    // Gate 1: Decoupled negative control fails GW170817 by > 12 orders of magnitude (~1.3% mismatch)
    const g1Control =
      Math.abs(res.cRawUnwarpedWeyl - 1) < 1e-14 &&
      res.decoupledMismatchFrac > 0.01 &&
      res.decoupledMismatchFrac < 0.02 &&
      res.decoupledViolationFactorVsGW170817 > 1e12

    // Gate 2: Shared warped-cusp column universality c_grav = c_light = c_matter to <= 1e-15 (< 6e-15)
    const g2SpeedLock =
      res.maxGravVsLightRelDiff <= 1e-15 &&
      res.maxMatterVsLightRelDiff <= 1e-15 &&
      res.maxGravVsMatterRelDiff <= 1e-15 &&
      res.maxSpeciesRelDiff < GW170817_BOUND

    // Gate 3: 3D rotational isotropy <= 1e-10 and floor independence F = 12 vs F = 16 <= 1e-14
    const g3IsotropyAndFloor =
      res.maxIsotropySpread <= 1e-10 && res.maxFloorDiffF16VsF12 <= 1e-14

    // Gate 4: Zero extra light Horava scalar mode (unique k = 0 zero mode, all bulk KK modes > 0.5)
    const g4NoHoravaScalar =
      res.zeroModeCountF16 === 1 && res.zeroModeMaxErrF16 < 1e-14 && res.mKKMinF16 > 0.5

    // Gate 5: Exact discrete-time unitary wave evolution, symplectic leapfrog, strict causality,
    // and exact match to E-GRV-0157 static stiffness K_eff
    const g5UnitaryAndCausal =
      u.uWarpUnitarityErr <= 1e-14 &&
      u.uWarpNormDrift1Beat <= 1e-14 &&
      u.uWarpNormDrift10Beats <= 1e-14 &&
      u.uWarpNormDrift100Beats <= 1e-13 &&
      u.uWarpNormDrift1000Beats <= 1e-12 &&
      u.uLeapUnitarityErr <= 1e-14 &&
      u.leapfrogMaxStabilityRatio < 1 &&
      u.leapfrogEnergyDrift100Steps <= 1e-14 &&
      u.leapfrogEnergyDrift600Steps <= 1e-13 &&
      u.uWarpSpeedRelErrVsUniversal <= 1e-10 &&
      u.leapfrogSpeedRelErrVsUniversal <= 1e-10 &&
      u.strictlyCausal &&
      u.staticStiffnessDiffVsEGrv0157 <= 1e-14 &&
      u.cSqMVsEGrv0157Diff <= 1e-14

    const ok =
      g0Integrity &&
      g1Control &&
      g2SpeedLock &&
      g3IsotropyAndFloor &&
      g4NoHoravaScalar &&
      g5UnitaryAndCausal

    const d100 = res.directionsF16[0]!
    const d110 = res.directionsF16[1]!
    const d111 = res.directionsF16[2]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Decoupled unwarped husk light/matter (c_raw = ${res.cRawUnwarpedWeyl.toFixed(10)}) vs warped {3,4,3,4} graviton ` +
        `(c_grav = sqrt(K_eff/M_eff) = ${res.cGravWarpedAnalytical.toFixed(10)}) yields a ${(res.decoupledMismatchFrac * 100).toFixed(4)}% ` +
        `mismatch (${res.decoupledViolationFactorVsGW170817.toExponential(2)}x past GW170817 6e-15). ` +
        `Placing spin-2 TT graviton, spin-1 lattice Maxwell photon, and spin-1/2 chiral Weyl fermion on the EXACT SAME ` +
        `1/N_D^2 warped cusp column (F = 16, K_eff = ${res.kEffF16.toFixed(10)}, M_eff = ${res.mEffF16.toFixed(10)}) locks ` +
        `|c_grav - c_light|/c_light <= ${res.maxGravVsLightRelDiff.toExponential(2)} and ` +
        `|c_matter - c_light|/c_light <= ${res.maxMatterVsLightRelDiff.toExponential(2)} across (1,0,0), (1,1,0), (1,1,1) ` +
        `(beating GW170817 6e-15), with 3D isotropy spread ${res.maxIsotropySpread.toExponential(2)}, ` +
        `floor convergence |c(16)-c(12)| <= ${res.maxFloorDiffF16VsF12.toExponential(2)}, unique k=0 zero mode ` +
        `(m_KK_min = ${res.mKKMinF16.toFixed(4)} > 0.5, no light Horava scalar), strict causality c_universal < 1 dock/beat, ` +
        `unitary norm drift ${u.uWarpNormDrift1Beat.toExponential(2)} (1 beat) / ${u.uWarpNormDrift10Beats.toExponential(2)} (10 beats) / ${u.uWarpNormDrift1000Beats.toExponential(2)} (1000 beats), and static E-GRV-0157 K_eff match ` +
        `${u.staticStiffnessDiffVsEGrv0157.toExponential(2)}`,
      metrics: {
        g0Integrity: g0Integrity ? 1 : 0,
        g1Control: g1Control ? 1 : 0,
        g2SpeedLock: g2SpeedLock ? 1 : 0,
        g3IsotropyAndFloor: g3IsotropyAndFloor ? 1 : 0,
        g4NoHoravaScalar: g4NoHoravaScalar ? 1 : 0,
        g5UnitaryAndCausal: g5UnitaryAndCausal ? 1 : 0,
        kEffF16: res.kEffF16,
        kEffRiccatiF16: res.kEffRiccatiF16,
        mEffF16: res.mEffF16,
        cUniversalF16: res.cUniversalF16,
        cUniversalF12: res.cUniversalF12,
        cGrav100: d100.cGrav,
        cLight100: d100.cLight,
        cMatter100: d100.cMatter,
        cGrav110: d110.cGrav,
        cLight110: d110.cLight,
        cMatter110: d110.cMatter,
        cGrav111: d111.cGrav,
        cLight111: d111.cLight,
        cMatter111: d111.cMatter,
        maxGravVsLightRelDiff: res.maxGravVsLightRelDiff,
        maxMatterVsLightRelDiff: res.maxMatterVsLightRelDiff,
        maxGravVsMatterRelDiff: res.maxGravVsMatterRelDiff,
        gravIsotropySpread: res.gravIsotropySpread,
        lightIsotropySpread: res.lightIsotropySpread,
        matterIsotropySpread: res.matterIsotropySpread,
        maxIsotropySpread: res.maxIsotropySpread,
        floorDiffGravF16VsF12: res.floorDiffGravF16VsF12,
        floorDiffLightF16VsF12: res.floorDiffLightF16VsF12,
        floorDiffMatterF16VsF12: res.floorDiffMatterF16VsF12,
        maxFloorDiffF16VsF12: res.maxFloorDiffF16VsF12,
        zeroModeCountF16: res.zeroModeCountF16,
        zeroModeMaxErrF16: res.zeroModeMaxErrF16,
        mKKMinF16: res.mKKMinF16,
        mKKMaxF16: res.mKKMaxF16,
        hVertDirectMaxDiffF16: res.hVertDirectMaxDiffF16,
        qOrthoErrF16: res.qOrthoErrF16,
        hVertDiagErrF16: res.hVertDiagErrF16,
        maxGravDegeneracyErr: res.maxGravDegeneracyErr,
        maxGravGaugeZeroEig: res.maxGravGaugeZeroEig,
        maxGravTTIdentityErr: res.maxGravTTIdentityErr,
        maxGravTTPurityErr: res.maxGravTTPurityErr,
        maxLightDegeneracyErr: res.maxLightDegeneracyErr,
        maxLightGaugeZeroEig: res.maxLightGaugeZeroEig,
        maxLightGaugeLongitudinalErr: res.maxLightGaugeLongitudinalErr,
        maxLightTransversalityErr: res.maxLightTransversalityErr,
        maxMatterChiralSymErr: res.maxMatterChiralSymErr,
        maxMatterSquareMatchErr: res.maxMatterSquareMatchErr,
        maxMatterHelicityErr: res.maxMatterHelicityErr,
        uWarpUnitarityErr: u.uWarpUnitarityErr,
        uWarpNormDrift1Beat: u.uWarpNormDrift1Beat,
        uWarpNormDrift10Beats: u.uWarpNormDrift10Beats,
        uWarpNormDrift100Beats: u.uWarpNormDrift100Beats,
        uWarpNormDrift1000Beats: u.uWarpNormDrift1000Beats,
        uWarpSpeedAtSmallK: u.uWarpSpeedAtSmallK,
        uWarpSpeedRelErrVsUniversal: u.uWarpSpeedRelErrVsUniversal,
        leapfrogDt: u.leapfrogDt,
        leapfrogMaxStabilityRatio: u.leapfrogMaxStabilityRatio,
        uLeapUnitarityErr: u.uLeapUnitarityErr,
        leapfrogEnergyDrift100Steps: u.leapfrogEnergyDrift100Steps,
        leapfrogEnergyDrift600Steps: u.leapfrogEnergyDrift600Steps,
        leapfrogSpeedAtSmallK: u.leapfrogSpeedAtSmallK,
        leapfrogSpeedRelErrVsUniversal: u.leapfrogSpeedRelErrVsUniversal,
        staticStiffnessDiffVsEGrv0157: u.staticStiffnessDiffVsEGrv0157,
        cSqMVsEGrv0157Diff: u.cSqMVsEGrv0157Diff,
      },
      control: {
        cRawUnwarpedWeyl: res.cRawUnwarpedWeyl,
        decoupledMismatchFrac: res.decoupledMismatchFrac,
        decoupledViolationFactorVsGW170817: res.decoupledViolationFactorVsGW170817,
        naiveLinearDiracSpeed: res.naiveLinearDiracSpeed,
        naiveLinearDiracMismatchFrac: res.naiveLinearDiracMismatchFrac,
      },
      notes:
        'All three physical species are explicitly constructed and diagonalized on the exact same {3,4,3,4} 1/N_D^2 warped cusp column: 6*(F+1) symmetric metric with TT spin-2 projector, 3*(F+1) complex Hermitian lattice Maxwell curl-curl operator, and 2*(F+1) complex Hermitian square-root chiral Weyl operator. The bonus naiveLinearDirac control also proves that a site-local linear velocity <v_0|V_lat|v_0> misses sqrt(K_eff/M_eff) by 0.23% via Cauchy-Schwarz; exact speed lock requires the shared warped-column operator H_warp(k) = M_warp^{-1/2} L_warp(k) M_warp^{-1/2}.',
    })
  },
})
