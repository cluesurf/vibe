// FRONTIER 5: UNIFIED COUPLED-SECTORS LIVE 4D UNITARY SIMULATION (E-FND-0186).
//
// Depth L2: Runs all five verified Vibe Theory sectors simultaneously inside ONE single live
// discrete-time reversible unitary state vector on the {3,4,3,4} 1/N_D^2 warped cusp column:
//   U_total = U_grav * U_gauge * U_pair_odd * U_wall_stream * U_coin
// verifying (1) gravitational refraction from E-GRV-0157's 1/N_D^2 warped Green's function,
// (2) Z[zeta_9][1/6] chiral cusp domain wall trapping L on D <= 2 (> 0.99) and banishing R (< 1e-8),
// (3) exact Z_3-center gauge transport with zero local Gauss violations and exact 2*pi/3 Aharonov-Bohm
// Wilson-loop phase shift, (4) two-body M_pair(zeta_18) + ODD scattering, entanglement, quantum
// interference (> 0.85 vs <= 0.1 dephased) and coherent C-asymmetry with exact global CP balance,
// (5) exact unitarity, adjoint reversibility (<= 1e-13), strict causal light-cone bound, and full
// sector-by-sector ablation negative controls. Deterministic, zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runUnifiedCoupledSectors } from '@/code/measure/unified-coupled-sectors'

export default experiment({
  id: 'foundations/unified-coupled-sectors',
  code: 'E-FND-0186',
  title:
    'Unified live 4D unitary simulation coupling {3,4,3,4} 1/N_D^2 warped gravity, Z[zeta_9][1/6] chiral cusp domain wall, exact Z_3-center Gauss-law gauge transport, and two-body M_pair(zeta_18) + ODD interference inside one reversible state vector',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = runUnifiedCoupledSectors()

    // Gate 0: Exact Q(zeta_9) algebraic certificate & exhaustive Peierls Gauss-law audit
    const g0AlgebraAndGaussAudit =
      r.algebraic.allExact &&
      r.peierlsGaussTransitionsChecked > 0 &&
      r.peierlsGaussViolations === 0 &&
      r.peierlsCurrentContinuityViolations === 0 &&
      r.pairInteractionGaussViolations === 0 &&
      r.plaquetteLoopGaussViolations === 0 &&
      r.gEffDiffVsF16 < 1e-8 &&
      r.cUniversalDiffVsF16 < 1e-8

    // Gate 1: Warped {3,4,3,4} 1/N_D^2 gravitational deflection toward source vs zero-source control
    const g1GravityRefraction =
      r.gravDeflectionRightSource > 0.05 &&
      r.gravDeflectionLeftSource < -0.05 &&
      r.gravBidirectionalSymErr < 1e-12 &&
      Math.abs(r.gravDeflectionZeroSource) <= 1e-14

    // Gate 2: Unitary Z[zeta_9][1/6] chiral cusp domain wall holds under full 5-sector coupling
    const g2ChiralWall =
      r.minLeftSurfaceWeightAllBeats > 0.99 &&
      r.maxRightSurfaceWeightAllBeats < 1e-8 &&
      r.wallChiralityAsymOn > 0.3 &&
      Math.abs(r.wallChiralityAsymOff) <= 1e-14

    // Gate 3: Exact Z_3 gauge transport, dynamical flux, Gauss law <= 1e-14 & exact 2*pi/3 AB shift
    const g3GaugeAndAB =
      r.maxGaussErrAllBeats <= 1e-14 &&
      r.abPhaseErr <= 1e-12 &&
      Math.abs(r.abPhaseFluxOff) <= 1e-14 &&
      Math.abs(r.abPhaseNeutralControl) <= 1e-14 &&
      r.gaugeFluxShiftOn > 1e-4 &&
      Math.abs(r.gaugeFluxShiftOff) <= 1e-14

    // Gate 4: Two-body M_pair(zeta_18) + ODD scattering, entanglement, interference & C/CP balance
    const g4TwoBodyAndODD =
      r.interferenceVisibility > 0.85 &&
      r.dephasedVisibility <= 0.1 &&
      r.pairScatteringProbOn > 0.001 &&
      Math.abs(r.pairScatteringProbOff) <= 1e-14 &&
      r.entanglementInitial <= 1e-14 &&
      r.entanglementPurePairOn > 0.005 &&
      r.entanglementPurePairOff <= 1e-12 &&
      Math.abs(r.entanglementPairOn - r.entanglementPairOff) > 1e-3 &&
      Math.abs(r.cAsymmetryOddOn) > 0.01 &&
      r.cpGlobalBalanceErr <= 1e-14 &&
      Math.abs(r.cAsymmetryOddOff) <= 1e-14 &&
      Math.abs(r.cAsymmetryPairOff) <= 1e-14

    // Gate 5: Exact global unitarity, adjoint reversibility, strict causal light-cone & all 6 ablations
    const allAblationsPassed = r.ablations.every(row => row.vanishesWhenOff)
    const g5UnitarityCausalityAblations =
      r.maxNormErrAllBeats <= 1e-13 &&
      r.adjointReversalErr <= 1e-13 &&
      r.lightConeMaxOutsideAmp16 === 0 &&
      r.lightConeMaxFrontRadius16 <= r.beatsMain &&
      r.lightConeMaxFrontRadius16 >= r.beatsMain - 1 &&
      allAblationsPassed

    const ok =
      g0AlgebraAndGaussAudit &&
      g1GravityRefraction &&
      g2ChiralWall &&
      g3GaugeAndAB &&
      g4TwoBodyAndODD &&
      g5UnitarityCausalityAblations

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `All five Vibe Theory sectors run simultaneously inside one live reversible unitary state vector ` +
        `(dim = ${r.hilbertDimMain}, F = ${r.floorF}, G_eff = ${r.gEffF8.toFixed(8)}, c_universal = ${r.cUniversalF8.toFixed(6)}): ` +
        `warped 1/N_D^2 gravity deflects a chiral wavepacket by ${r.gravDeflectionRightSource.toFixed(5)} docks toward the source ` +
        `(${r.gravDeflectionZeroSource.toExponential(1)} with gravity off), ` +
        `the Z[zeta_9][1/6] cusp wall traps L on D <= 2 (min weight ${r.minLeftSurfaceWeightAllBeats.toFixed(6)} > 0.99) ` +
        `while banishing R (max weight ${r.maxRightSurfaceWeightAllBeats.toExponential(2)} < 1e-8), ` +
        `Z_3 Peierls gauge transport keeps local Gauss error at ${r.maxGaussErrAllBeats.toExponential(1)} across all beats ` +
        `with exact Aharonov-Bohm phase ${r.abPhaseExtracted.toFixed(12)} rad (err ${r.abPhaseErr.toExponential(2)} vs 2*pi/3), ` +
        `two-body M_pair(zeta_18) + ODD scattering produces interference visibility V = ${r.interferenceVisibility.toFixed(6)} ` +
        `(dephased ${r.dephasedVisibility.toFixed(6)}), genuine entanglement S_ent = ${r.entanglementPurePairOn.toFixed(5)} nats ` +
        `(0 with M_pair off), and coherent C-asymmetry ${r.cAsymmetryOddOn.toFixed(5)} with global CP balance error ` +
        `${r.cpGlobalBalanceErr.toExponential(2)}, while preserving norm error ${r.maxNormErrAllBeats.toExponential(2)}, ` +
        `16-beat adjoint reversal error ${r.adjointReversalErr.toExponential(2)}, strict light-cone outside amplitude ` +
        `${r.lightConeMaxOutsideAmp16}, and all 6 sector ablations`,
      metrics: {
        g0AlgebraAndGaussAudit: g0AlgebraAndGaussAudit ? 1 : 0,
        g1GravityRefraction: g1GravityRefraction ? 1 : 0,
        g2ChiralWall: g2ChiralWall ? 1 : 0,
        g3GaugeAndAB: g3GaugeAndAB ? 1 : 0,
        g4TwoBodyAndODD: g4TwoBodyAndODD ? 1 : 0,
        g5UnitarityCausalityAblations: g5UnitarityCausalityAblations ? 1 : 0,
        algebraicAllExact: r.algebraic.allExact ? 1 : 0,
        peierlsGaussTransitionsChecked: r.peierlsGaussTransitionsChecked,
        peierlsGaussViolations: r.peierlsGaussViolations,
        peierlsCurrentContinuityViolations: r.peierlsCurrentContinuityViolations,
        pairInteractionGaussViolations: r.pairInteractionGaussViolations,
        plaquetteLoopGaussViolations: r.plaquetteLoopGaussViolations,
        floorF: r.floorF,
        lxMain: r.lxMain,
        lxLightCone: r.lxLightCone,
        beatsMain: r.beatsMain,
        hilbertDimMain: r.hilbertDimMain,
        kEffF8: r.kEffF8,
        gEffF8: r.gEffF8,
        cUniversalF8: r.cUniversalF8,
        gEffDiffVsF16: r.gEffDiffVsF16,
        cUniversalDiffVsF16: r.cUniversalDiffVsF16,
        gravDeflectionRightSource: r.gravDeflectionRightSource,
        gravDeflectionLeftSource: r.gravDeflectionLeftSource,
        gravBidirectionalSymErr: r.gravBidirectionalSymErr,
        minLeftSurfaceWeightAllBeats: r.minLeftSurfaceWeightAllBeats,
        maxRightSurfaceWeightAllBeats: r.maxRightSurfaceWeightAllBeats,
        surfaceInjectionLeftWeightOn: r.surfaceInjectionLeftWeightOn,
        surfaceInjectionRightWeightOn: r.surfaceInjectionRightWeightOn,
        wallChiralityAsymOn: r.wallChiralityAsymOn,
        abProbFluxOff: r.abProbFluxOff,
        abProbFluxOn: r.abProbFluxOn,
        abProbRatio: r.abProbRatio,
        abPhaseExtracted: r.abPhaseExtracted,
        abPhaseErr: r.abPhaseErr,
        gaugeFluxShiftOn: r.gaugeFluxShiftOn,
        interferencePMax: r.interferencePMax,
        interferencePMin: r.interferencePMin,
        interferenceVisibility: r.interferenceVisibility,
        pairScatteringProbOn: r.pairScatteringProbOn,
        entanglementInitial: r.entanglementInitial,
        entanglementPairOn: r.entanglementPairOn,
        entanglementPairOff: r.entanglementPairOff,
        entanglementPurePairOn: r.entanglementPurePairOn,
        cAsymmetryOddOn: r.cAsymmetryOddOn,
        cAsymmetryCPPartner: r.cAsymmetryCPPartner,
        cpGlobalBalanceErr: r.cpGlobalBalanceErr,
        maxNormErrAllBeats: r.maxNormErrAllBeats,
        maxGaussErrAllBeats: r.maxGaussErrAllBeats,
        adjointReversalErr: r.adjointReversalErr,
        lightConeMaxOutsideAmp16: r.lightConeMaxOutsideAmp16,
        lightConeMaxFrontRadius16: r.lightConeMaxFrontRadius16,
        ablationsPassedCount: r.ablations.filter(row => row.vanishesWhenOff).length,
      },
      control: {
        gravDeflectionZeroSource: r.gravDeflectionZeroSource,
        wallChiralityAsymOff: r.wallChiralityAsymOff,
        abPhaseFluxOff: r.abPhaseFluxOff,
        abPhaseNeutralControl: r.abPhaseNeutralControl,
        gaugeFluxShiftOff: r.gaugeFluxShiftOff,
        dephasedVisibility: r.dephasedVisibility,
        pairScatteringProbOff: r.pairScatteringProbOff,
        entanglementPurePairOff: r.entanglementPurePairOff,
        cAsymmetryOddOff: r.cAsymmetryOddOff,
        cAsymmetryPairOff: r.cAsymmetryPairOff,
      },
      notes:
        'Single live unitary state vector |x1, x2, D, chi, s1, s2, cPair, phiE> stepped by U_total = U_grav * U_gauge * U_pair_odd * U_wall_stream * U_coin. All discrete algebraic gates (U_depth, U_B, U_E, M_pair(zeta_18), U_odd, Z_3 Peierls phases) are certified unitary inside Z[zeta_9][1/6] in exact Q(zeta_9) arithmetic. Every sector is verified non-decorative by toggling it off one at a time and confirming its physical observable vanishes.',
    })
  },
})
