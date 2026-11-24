// LIVE TWO-BODY 1/r DYNAMICAL GRAVITATIONAL ATTRACTION, ORBITAL MOTION, AND DEFLECTION
// FROM THE EXACT {3,4,3,4} PAIR-DENSITY WARPED CUSP GRAVITY OPERATOR (E-GRV-0158, gap B-52).
//
// Depth L2: exact {3,4,3,4} warped cusp Schur-complement Green's function (E-GRV-0157, zero free gravity
// parameters), Hockney zero-padded open-boundary 3D FFT on 64^3, strictly unitary time-reversible Strang
// split-step two-species Schrodinger-Poisson dynamics on 32^3, with raw unwarped bulk negative control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runTwoBodyDynamicalGravity } from '@/code/measure/two-body-dynamical-gravity'

export default experiment({
  id: 'gravity/two-body-dynamical-gravity',
  code: 'E-GRV-0158',
  title:
    'Live two-body dynamical 1/r^2 gravitational attraction, bound Keplerian orbit, and flyby deflection under exact {3,4,3,4} warped-cusp unitary Schrodinger-Poisson evolution',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runTwoBodyDynamicalGravity()

    // Gate 0: kernel & numerical invariants (unitarity, Newton's 3rd law, exact time-reversal, reciprocity, causality)
    const g0Invariants =
      res.kernelMaxImagErr < 1e-13 &&
      res.kernelContinuumFlatnessR6to10 <= 0.01 &&
      res.potentialReciprocityMaxErr < 1e-13 &&
      res.maxNormErrAll <= 1e-13 &&
      res.maxMomentumSumErrAll <= 1e-12 &&
      res.maxComDriftAll <= 1e-12 &&
      res.unequalMassMomentumSumErr <= 1e-12 &&
      res.unequalMassComDrift <= 1e-12 &&
      res.unequalMassAccelRatioErr <= 1e-4 &&
      res.timeReversalCentroidErr <= 1e-10 &&
      res.timeReversalStateOverlapErr <= 1e-11 &&
      res.showcaseMaxSpeedOverC < 0.5 &&
      res.orbitMaxSpeedOverC < 0.5 &&
      res.flybyMaxSpeedOverC < 0.6

    // Gate 1: Test 1A radial infall, inverse-square law slope within 5% of -2.00, dynamical G_dyn matches E-GRV-0157 G_eff
    const g1Infall =
      res.allAttractive &&
      Math.abs(res.inverseSquareSlopeR5to10 + 2) <= 0.1 &&
      Math.abs(res.inverseSquareSlopeR6to10 + 2) <= 0.08 &&
      res.gDynMeanRelErrR6to10 <= 0.04 &&
      res.gDynMaxRelErrR6to10 <= 0.05 &&
      res.showcaseShrinkage >= 1.0 &&
      res.showcaseEnergyRelDrift <= 0.02

    // Gate 2: Test 1B bound Keplerian orbital arc & positive inward weak-field gravitational deflection
    const g2OrbitAndFlyby =
      res.orbitAngleSweptRad >= 1.5 &&
      res.orbitRMin >= 0.85 * res.orbitR0 &&
      res.orbitRMax <= 1.2 * res.orbitR0 &&
      res.orbitOmegaEarlyRelErr <= 0.06 &&
      res.orbitLzRelDrift <= 0.02 &&
      res.orbitEnergyRelDrift <= 0.03 &&
      res.flybyDeflectionRad > 0.15 &&
      res.flybyFiniteRelErr <= 0.15 &&
      res.flybyInfRelErr <= 0.25

    // Gate 3: Test 1C negative control (raw unwarped bulk screened gravity collapses at r >= 6 & fails to bind orbit)
    const g3Control =
      res.rawToWarpAccelRatioR6 < 1e-2 &&
      res.rawToWarpAccelRatioR8 < 1e-3 &&
      res.rawOrbitExpansionRatio >= 1.5 &&
      res.rawToWarpFlybyRatio < 1e-2

    const ok = g0Invariants && g1Infall && g2OrbitAndFlyby && g3Control

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Live unitary two-body Schrodinger-Poisson evolution under the parameter-free {3,4,3,4} warped-cusp kernel ` +
        `(K_eff = ${res.kEff.toFixed(8)}, G_eff = ${res.gEff.toFixed(8)}, c_u = ${res.cUniversal.toFixed(8)}) ` +
        `yields mutual attraction across r_0 = 5..10 with inverse-square slope ${res.inverseSquareSlopeR6to10.toFixed(4)} ` +
        `(r=6..10) / ${res.inverseSquareSlopeR5to10.toFixed(4)} (r=5..10), dynamical coupling G_dyn = ${res.gDynMeanR6to10.toFixed(6)} ` +
        `(${(res.gDynMeanRelErrR6to10 * 100).toFixed(2)}% from G_eff), macroscopic infall shrinkage ${res.showcaseShrinkage.toFixed(3)} docks, ` +
        `exact unitarity (${res.maxNormErrAll.toExponential(2)}), Newton 3rd law (|p1+p2| = ${res.maxMomentumSumErrAll.toExponential(2)}, ` +
        `unequal-mass a1/a2 = ${res.unequalMassAccelRatio.toFixed(6)}), time reversal (${res.timeReversalCentroidErr.toExponential(2)}), ` +
        `bound orbit sweeping ${(res.orbitAngleSweptRad * 180 / Math.PI).toFixed(1)} deg (${res.orbitRMin.toFixed(2)} <= r <= ${res.orbitRMax.toFixed(2)}, ` +
        `omega error ${(res.orbitOmegaEarlyRelErr * 100).toFixed(2)}%, L_z drift ${(res.orbitLzRelDrift * 100).toFixed(3)}%), ` +
        `and inward flyby deflection ${res.flybyDeflectionRad.toFixed(4)} rad (finite weak-field theory ${res.flybyTheoryFiniteRad.toFixed(4)} rad), ` +
        `while raw bulk gravity collapses to |a_raw/a_warp| = ${res.rawToWarpAccelRatioR6.toExponential(2)} at r = 6 and leaves the orbit unbound (r = ${res.rawOrbitREnd.toFixed(2)}).`,
      metrics: {
        g0Invariants: g0Invariants ? 1 : 0,
        g1Infall: g1Infall ? 1 : 0,
        g2OrbitAndFlyby: g2OrbitAndFlyby ? 1 : 0,
        g3Control: g3Control ? 1 : 0,
        kEff: res.kEff,
        gEff: res.gEff,
        cUniversal: res.cUniversal,
        kernelMaxImagErr: res.kernelMaxImagErr,
        kernelContinuumFlatnessR6to10: res.kernelContinuumFlatnessR6to10,
        potentialReciprocityMaxErr: res.potentialReciprocityMaxErr,
        inverseSquareSlopeR5to10: res.inverseSquareSlopeR5to10,
        inverseSquareSlopeR6to10: res.inverseSquareSlopeR6to10,
        gDynMeanR6to10: res.gDynMeanR6to10,
        gDynMeanRelErrR6to10: res.gDynMeanRelErrR6to10,
        gDynMaxRelErrR6to10: res.gDynMaxRelErrR6to10,
        showcaseR0: res.showcaseR0,
        showcaseREnd: res.showcaseREnd,
        showcaseShrinkage: res.showcaseShrinkage,
        showcaseEnergyRelDrift: res.showcaseEnergyRelDrift,
        showcaseMaxSpeedOverC: res.showcaseMaxSpeedOverC,
        unequalMassAccelRatio: res.unequalMassAccelRatio,
        unequalMassAccelRatioErr: res.unequalMassAccelRatioErr,
        unequalMassMomentumSumErr: res.unequalMassMomentumSumErr,
        unequalMassComDrift: res.unequalMassComDrift,
        maxNormErrAll: res.maxNormErrAll,
        maxMomentumSumErrAll: res.maxMomentumSumErrAll,
        maxComDriftAll: res.maxComDriftAll,
        timeReversalCentroidErr: res.timeReversalCentroidErr,
        timeReversalStateOverlapErr: res.timeReversalStateOverlapErr,
        orbitR0: res.orbitR0,
        orbitRMin: res.orbitRMin,
        orbitRMax: res.orbitRMax,
        orbitAngleSweptRad: res.orbitAngleSweptRad,
        orbitOmegaTheory: res.orbitOmegaTheory,
        orbitOmegaMeasuredEarly: res.orbitOmegaMeasuredEarly,
        orbitOmegaMeasuredFull: res.orbitOmegaMeasuredFull,
        orbitOmegaEarlyRelErr: res.orbitOmegaEarlyRelErr,
        orbitLzInitial: res.orbitLzInitial,
        orbitLzRelDrift: res.orbitLzRelDrift,
        orbitMaxSpeedOverC: res.orbitMaxSpeedOverC,
        orbitEnergyRelDrift: res.orbitEnergyRelDrift,
        flybyImpactB: res.flybyImpactB,
        flybyVRel: res.flybyVRel,
        flybyDeflectionRad: res.flybyDeflectionRad,
        flybyTheoryWeakInfRad: res.flybyTheoryWeakInfRad,
        flybyTheoryFiniteRad: res.flybyTheoryFiniteRad,
        flybyTheoryExactHypRad: res.flybyTheoryExactHypRad,
        flybyFiniteRelErr: res.flybyFiniteRelErr,
        flybyInfRelErr: res.flybyInfRelErr,
        flybyMaxSpeedOverC: res.flybyMaxSpeedOverC,
      },
      control: {
        rawAccelR6: res.rawAccelR6,
        rawAccelR8: res.rawAccelR8,
        rawToWarpAccelRatioR6: res.rawToWarpAccelRatioR6,
        rawToWarpAccelRatioR8: res.rawToWarpAccelRatioR8,
        rawOrbitREnd: res.rawOrbitREnd,
        rawOrbitFreeStraightREnd: res.rawOrbitFreeStraightREnd,
        rawOrbitExpansionRatio: res.rawOrbitExpansionRatio,
        rawFlybyDeflectionRad: res.rawFlybyDeflectionRad,
        rawToWarpFlybyRatio: res.rawToWarpFlybyRatio,
      },
      notes:
        'Open-boundary Hockney 64^3 convolution eliminates periodic torus image bias. All two-body interactions exclude self-energy via distinct species wavefunctions, keeping nonlinear Strang split-step evolution strictly unitary and exactly time-reversible.',
    })
  },
})
