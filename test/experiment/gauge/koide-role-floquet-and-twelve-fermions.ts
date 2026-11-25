// BOUNDARY #1 & FULL FLAVOR AUDIT (E-FRC-0327): ALGEBRAIC OBSTRUCTION FOR e^{i 2/9},
// EXACT 9-STATE QUTRIT ROLE FLOQUET SYNTHESIS IN Z[w][1/2], AND FULL 12-FERMION + CKM + PMNS
// UNIFIED TEXTURE AUDIT WITH STRICT PARAMETER-COUNT HONESTY.
//
// Part 1:
//   1A. Symbolic obstruction theorem (Q(zeta_9) + BigInt): i*(2/9) satisfies irreducible 81 x^2 + 4 = 0,
//       so by Lindemann-Weierstrass e^{i 2/9} is strictly transcendental and CANNOT lie in Z[zeta_9][1/6]
//       (degree <= 6 over Q) or equal any root of unity zeta_N^k (arg in pi Q). Audits all 18 elements
//       of {2 pi k / 18}: closest cyclotomic angle pi/9 = 0.3491 rad misses 2/9 = 0.2222 rad by 57.08%
//       and lies outside the Koide positivity window [-pi/12, pi/12].
//   1B. Physical 9-state qutrit role-grid Floquet mechanism: exact Q(zeta_9) Sigma(648) Heisenberg-Weyl
//       algebra of projective order 9, normalized rational 9x9 Hermitian role generator
//       H_role = (1/9)(X_3 (x) I_3 + X_3^dag (x) I_3) with exact rational eigenvalues {+2/9 (x3), -1/9 (x6)}
//       generating U_role = exp(-i H_role) with exact phase exp(-i * 2/9) (rational radians, zero pi factor).
//   1C. Exact BigInt Z[w][1/2] MITM synthesis of R_z(2 * (2/9)) = exp(-i (2/9) sigma_z) over
//       {W_1, W_1^dag, W_2, W_2^dag} at L = 6, 10, 14, 18, 22: monotonic convergence to |delta_synth - 2/9|
//       < 1e-6 rad, verified exact BigInt det = 1 and U^dag U = I, giving charged-lepton m_mu/m_e within
//       < 0.002%, m_tau/m_mu within < 0.01%, and Q_synth = 2/3 to < 1e-14.
//
// Part 2:
//   Unified Spin(10) + {3,4,3,4} warp + F4 triality audit across ALL 12 fermions + CKM + PMNS:
//     - Charged leptons: single-cusp F4 S(sqrt(2), delta_synth)^2 (1 scale v_e).
//     - Up & down quarks + CKM: staggered (0, 2, 3) warp-dressed Koide S_q = W_q S(sqrt(2), delta_q) W_q
//       plus F4 1/sqrt(2) zeta_9-phased off-diagonal misalignment, unitary CKM (<= 1e-14), Jarlskog J_CP.
//     - Neutrinos + PMNS: Type-I seesaw M_nu = -M_D^T M_R^{-1} M_D with S_3/TBM + Z[zeta_9] Majorana M_R
//       at M_PS, large PMNS angles, normal ordering, Delta m^2_21 / Delta m^2_31 ~ 0.030, and Q_nu < 2/3
//       bypassing E-FRC-0325's Dirac warp no-go.
//     - Four negative controls + strict 22-observable parameter-count ledger separating 0-parameter
//       algebraic theorems from discrete inputs and continuous texture fits.
//
// Depth L2: exact BigInt Z[w][1/2] + Q(zeta_9) symbolic certificates, 4D MITM, dense Hermitian/Takagi.
// Zero random numbers.

import {
  analyzeKoideRoleFloquetAndTwelveFermions,
  rat,
  ratEq,
  ratFormat,
} from '@/code/measure/koide-role-floquet-and-twelve-fermions'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/koide-role-floquet-and-twelve-fermions',
  code: 'E-FRC-0327',
  title:
    'Algebraic obstruction for e^{i 2/9}, exact 9-state qutrit role Floquet synthesis in Z[w][1/2], and full 12-fermion + CKM + PMNS unified texture audit with strict parameter-count honesty',
  category: 'gauge',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeKoideRoleFloquetAndTwelveFermions()
    const p1a = r.part1A
    const p1b = r.part1B
    const p1c = r.part1C
    const p2 = r.part2

    // Part 1A gates: symbolic obstruction, all 18 roots of unity audited, pi/9 misses 2/9 by 57.08%
    const part1AOk =
      p1a.cyclotomicPolyPhi9ZeroExact &&
      p1a.extensionDegreePhi9 === 6 &&
      p1a.exponentMinPolyExact &&
      p1a.lindemannWeierstrassTranscendental &&
      p1a.all18RootsDistinctInNinth &&
      p1a.all18Order18Exact &&
      p1a.all18UnitCircleExact &&
      p1a.rootsAudit.length === 18 &&
      p1a.closestNontrivialK === 1 &&
      Math.abs(p1a.closestNontrivialAngleRad - Math.PI / 9) <= 1e-14 &&
      p1a.closestNontrivialRelErr > 0.57 &&
      p1a.closestNontrivialRelErr < 0.58 &&
      p1a.trivialDegenerateCubeRootsCount === 3 &&
      p1a.nonDegenerateRootsInPositivityWindow === 0 &&
      p1a.controlPiOver9MinEigenvalue < -0.05 &&
      p1a.controlPiOver9MaxLeptonRatioErr > 0.5

    // Part 1B gates: exact Q(zeta_9) Sigma(648) Heisenberg-Weyl order 9 + 9x9 Floquet U = exp(-i H_role)
    const part1BOk =
      p1b.heisenbergWeylCommutationExact &&
      p1b.heisenbergWeylGroupOrder === 27 &&
      p1b.projectiveRoleGridOrder === 9 &&
      p1b.roleOperatorsOrthogonalExact &&
      p1b.sigma648FourierNormalizesExact &&
      ratEq(p1b.generatorSymmetricEigenvalueExact, rat(2n, 9n)) &&
      ratEq(p1b.generatorExcitedEigenvalueExact, rat(-1n, 9n)) &&
      ratEq(p1b.generatorTraceExact, rat(0n)) &&
      ratEq(p1b.twoExcitedProjectorNormalizedTraceExact, rat(2n, 9n)) &&
      p1b.symmetricSubspaceMultiplicity === 3 &&
      p1b.generatorHermiticityErr <= 1e-15 &&
      p1b.numericSymmetricEigenvalueErr <= 1e-14 &&
      p1b.floquetUnitarityErr <= 1e-14 &&
      p1b.floquetPhaseAbsErrFromMinusTwoNinths <= 1e-14 &&
      p1b.floquetEigenstateResidual <= 1e-14

    // Part 1C gates: exact BigInt Z[w][1/2] synthesis of exp(-i (2/9) sigma_z) across L = 6..22
    const part1COk =
      p1c.allGeneratorsExactSU2 &&
      p1c.allWinningWordsExactSU2 &&
      p1c.allWinningWordsMod3CongruenceExact &&
      p1c.curve.length === 5 &&
      p1c.phaseErrStrictlyMonotonic &&
      p1c.fullSU2OpDistStrictlyMonotonic &&
      p1c.bestDeltaAbsErrRad < 1e-6 &&
      p1c.bestPhaseWordOpDistToRz < 0.025 &&
      p1c.bestPhaseWordAxisNz > 0.99 &&
      p1c.bestLeptonQErrFromTwoThirds <= 1e-14 &&
      p1c.bestLeptonMuOverERelErr < 2e-5 &&
      p1c.bestLeptonTauOverMRelErr < 1e-4

    // Part 2 gates: all 12 fermions + CKM + PMNS + negative controls + strict parameter-count ledger
    const leptonsOk =
      p2.leptons.maxRelErr < 1e-4 &&
      Math.abs(p2.leptons.koideQ - 2 / 3) <= 1e-14 &&
      p2.leptons.uLeptonUnitarityErr <= 1e-14

    const quarksOk =
      p2.downQuarks.exactDetFeasible &&
      p2.upQuarks.exactDetFeasible &&
      p2.quarksMzAudit.bothDetFeasible &&
      p2.downQuarks.maxRatioRelErr < 1e-10 &&
      p2.upQuarks.maxRatioRelErr < 1e-10 &&
      p2.downQuarks.unitarityErr <= 1e-14 &&
      p2.upQuarks.unitarityErr <= 1e-14 &&
      p2.ckm.unitarityErr <= 1e-14 &&
      p2.ckm.jarlskogQuartetSpread <= 1e-14 &&
      p2.ckm.relErrVus < 0.05 &&
      p2.ckm.relErrVcb < 0.05 &&
      p2.ckm.relErrVub < 0.05 &&
      p2.ckm.jarlskogCP > 2.5e-5 &&
      p2.ckm.jarlskogCP < 3.5e-5

    const neutrinosOk =
      p2.neutrinos.normalOrdering &&
      p2.neutrinos.bypassesDiracWarpNoGo &&
      p2.neutrinos.koideQNu < 2 / 3 &&
      p2.neutrinos.sumMassesEv < 0.12 &&
      p2.neutrinos.dmRatio21Over31 > 0.025 &&
      p2.neutrinos.dmRatio21Over31 < 0.036 &&
      p2.neutrinos.sin2Theta12 > 0.25 &&
      p2.neutrinos.sin2Theta12 < 0.36 &&
      p2.neutrinos.sin2Theta23 > 0.42 &&
      p2.neutrinos.sin2Theta23 < 0.60 &&
      p2.neutrinos.sin2Theta13 > 0.018 &&
      p2.neutrinos.sin2Theta13 < 0.026 &&
      p2.neutrinos.pmnsUnitarityErr <= 1e-14 &&
      p2.neutrinos.takagiReconErr <= 1e-13 &&
      p2.neutrinos.seesawInvErr <= 1e-14 &&
      p2.neutrinos.jarlskogQuartetSpread <= 1e-14 &&
      Math.abs(p2.neutrinos.jarlskogPMNS) > 1e-3

    const controlsAndLedgerOk =
      Math.abs(p2.controls.zeroWarpQuarksQDown - 2 / 3) <= 1e-14 &&
      Math.abs(p2.controls.zeroWarpQuarksQUp - 2 / 3) <= 1e-14 &&
      Math.abs(p2.controls.realYukawaCkmJarlskog) <= 1e-14 &&
      Math.abs(p2.controls.realMajoranaPmnsJarlskog) <= 1e-14 &&
      Math.abs(p2.controls.unperturbedTbmSin2Theta12 - 1 / 3) <= 1e-13 &&
      Math.abs(p2.controls.unperturbedTbmSin2Theta23 - 0.5) <= 1e-13 &&
      p2.controls.unperturbedTbmSin2Theta13 <= 1e-14 &&
      Math.abs(p2.controls.unperturbedTbmJarlskog) <= 1e-14 &&
      p2.ledger.nObservables === 22 &&
      p2.ledger.nContinuousFreeParams > 0 &&
      p2.ledger.netOverdeterminationContinuous > 0

    const ok = part1AOk && part1BOk && part1COk && leptonsOk && quarksOk && neutrinosOk && controlsAndLedgerOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1A (obstruction theorem, exact Q(zeta_9) + BigInt): i*(2/9) satisfies irreducible 81 x^2 + 4 = 0, ` +
        `so by Lindemann-Weierstrass e^{i 2/9} is strictly transcendental and cannot lie in Z[zeta_9][1/6] ` +
        `(degree ${p1a.extensionDegreePhi9}) or equal any root of unity zeta_N^k. Across all 18 roots zeta_18^k, ` +
        `closest nontrivial angle pi/9 = ${p1a.closestNontrivialAngleRad.toFixed(4)} rad misses 2/9 = 0.2222 rad by ` +
        `${(p1a.closestNontrivialRelErr * 100).toFixed(2)}% and lies outside [-pi/12, pi/12]. ` +
        `Part 1B (9-state qutrit role Floquet): exact Sigma(648) Heisenberg-Weyl algebra (group order ` +
        `${p1b.heisenbergWeylGroupOrder}, projective role grid ${p1b.projectiveRoleGridOrder}) carries normalized ` +
        `rational generator H_role = (1/9)(X_3 (x) I_3 + X_3^dag (x) I_3) with exact eigenvalue ` +
        `${ratFormat(p1b.generatorSymmetricEigenvalueExact)} (multiplicity ${p1b.symmetricSubspaceMultiplicity}), ` +
        `generating one-beat Floquet unitary U_role = exp(-i H_role) (unitarity err ${p1b.floquetUnitarityErr.toExponential(2)}) ` +
        `with exact phase ${p1b.floquetSymmetricStatePhaseRad.toFixed(6)} rad (err ${p1b.floquetPhaseAbsErrFromMinusTwoNinths.toExponential(2)}). ` +
        `Part 1C (exact BigInt Z[w][1/2] MITM synthesis of exp(-i (2/9) sigma_z) at L = 6..22): strict monotonic ` +
        `convergence to |delta_synth - 2/9| = ${p1c.bestDeltaAbsErrRad.toExponential(3)} rad ` +
        `(R_z cone op dist ${p1c.bestPhaseWordOpDistToRz.toFixed(4)}, full-SU(2) op dist ${p1c.bestFullSU2OpDistAt22.toExponential(3)}, ` +
        `exact BigInt SU(2) = ${p1c.allWinningWordsExactSU2}), giving charged-lepton m_mu/m_e = ` +
        `${p1c.bestLeptonMuOverE.toFixed(4)} (${(p1c.bestLeptonMuOverERelErr * 100).toFixed(5)}%), ` +
        `m_tau/m_mu = ${p1c.bestLeptonTauOverMu.toFixed(4)} (${(p1c.bestLeptonTauOverMRelErr * 100).toFixed(5)}%), ` +
        `and Q_synth = 2/3 (err ${p1c.bestLeptonQErrFromTwoThirds.toExponential(2)}). ` +
        `Part 2 (12-fermion + CKM + PMNS unified texture audit): leptons match PDG to ${(p2.leptons.maxRelErr * 100).toFixed(4)}%, ` +
        `staggered (0,2,3) warp-Koide quarks match PDG down (m_b/m_s=${p2.downQuarks.ratioBs.toFixed(2)}, m_s/m_d=${p2.downQuarks.ratioSd.toFixed(2)}, ` +
        `Q_d=${p2.downQuarks.koideQ.toFixed(4)}, eta_d=${p2.downQuarks.eta.toFixed(4)}) and up (m_t/m_c=${p2.upQuarks.ratioTc.toFixed(2)}, ` +
        `m_c/m_u=${p2.upQuarks.ratioCu.toFixed(1)}, Q_u=${p2.upQuarks.koideQ.toFixed(4)}, eta_u=${p2.upQuarks.eta.toFixed(4)}), ` +
        `unitary CKM (err ${p2.ckm.unitarityErr.toExponential(2)}, |V_us|=${p2.ckm.vUs.toFixed(4)}, |V_cb|=${p2.ckm.vCb.toFixed(4)}, ` +
        `|V_ub|=${p2.ckm.vUb.toFixed(5)}, J_CP=${p2.ckm.jarlskogCP.toExponential(3)}), and Spin(10) Type-I seesaw neutrinos ` +
        `(M_PS=${p2.neutrinos.mPsGeV.toExponential(2)} GeV, normal ordering, dm21/dm31=${p2.neutrinos.dmRatio21Over31.toFixed(4)}, ` +
        `Q_nu=${p2.neutrinos.koideQNu.toFixed(4)} < 2/3 bypassing Dirac warp no-go, sin^2 t12=${p2.neutrinos.sin2Theta12.toFixed(4)}, ` +
        `sin^2 t23=${p2.neutrinos.sin2Theta23.toFixed(4)}, sin^2 t13=${p2.neutrinos.sin2Theta13.toFixed(5)}, ` +
        `delta_CP=${p2.neutrinos.deltaCpDeg.toFixed(1)} deg, J_PMNS=${p2.neutrinos.jarlskogPMNS.toExponential(3)}, ` +
        `unitarity err ${p2.neutrinos.pmnsUnitarityErr.toExponential(2)}). Honest ledger: ${p2.ledger.nContinuousFreeParams} continuous ` +
        `parameters + ${p2.ledger.nDiscreteStructuralInputs} discrete inputs across ${p2.ledger.nObservables} SM observables`,
      metrics: {
        // Part 1A
        phi9ZeroExact: p1a.cyclotomicPolyPhi9ZeroExact ? 1 : 0,
        exponentMinPolyExact: p1a.exponentMinPolyExact ? 1 : 0,
        all18RootsExact: p1a.all18RootsDistinctInNinth && p1a.all18Order18Exact && p1a.all18UnitCircleExact ? 1 : 0,
        closestCyclotomicAngleRad: Number(p1a.closestNontrivialAngleRad.toFixed(6)),
        closestCyclotomicRelErrPct: Number((p1a.closestNontrivialRelErr * 100).toFixed(3)),
        trivialDegenerateCubeRootsCount: p1a.trivialDegenerateCubeRootsCount,
        nonDegenerateRootsInWindow: p1a.nonDegenerateRootsInPositivityWindow,
        // Part 1B
        heisenbergWeylGroupOrder: p1b.heisenbergWeylGroupOrder,
        projectiveRoleGridOrder: p1b.projectiveRoleGridOrder,
        roleOperatorsOrthogonalExact: p1b.roleOperatorsOrthogonalExact ? 1 : 0,
        sigma648FourierNormalizesExact: p1b.sigma648FourierNormalizesExact ? 1 : 0,
        symmetricSubspaceMultiplicity: p1b.symmetricSubspaceMultiplicity,
        floquetUnitarityErr: p1b.floquetUnitarityErr,
        floquetSymmetricStatePhaseRad: Number(p1b.floquetSymmetricStatePhaseRad.toFixed(8)),
        floquetPhaseAbsErr: p1b.floquetPhaseAbsErrFromMinusTwoNinths,
        // Part 1C
        synthAllExactSU2: p1c.allWinningWordsExactSU2 ? 1 : 0,
        synthAllMod3CongruenceExact: p1c.allWinningWordsMod3CongruenceExact ? 1 : 0,
        synthDeltaErrL6: Number(p1c.curve[0]!.deltaAbsErrRad.toExponential(3)),
        synthDeltaErrL10: Number(p1c.curve[1]!.deltaAbsErrRad.toExponential(3)),
        synthDeltaErrL14: Number(p1c.curve[2]!.deltaAbsErrRad.toExponential(3)),
        synthDeltaErrL18: Number(p1c.curve[3]!.deltaAbsErrRad.toExponential(3)),
        synthDeltaErrL22: Number(p1c.curve[4]!.deltaAbsErrRad.toExponential(3)),
        synthDeltaEigErrL22: Number(p1c.bestDeltaEigAbsErrRad.toExponential(3)),
        synthFullSU2OpDistL6: Number(p1c.curve[0]!.bestFullSU2OpDist.toExponential(3)),
        synthFullSU2OpDistL10: Number(p1c.curve[1]!.bestFullSU2OpDist.toExponential(3)),
        synthFullSU2OpDistL14: Number(p1c.curve[2]!.bestFullSU2OpDist.toExponential(3)),
        synthFullSU2OpDistL18: Number(p1c.curve[3]!.bestFullSU2OpDist.toExponential(3)),
        synthFullSU2OpDistL22: Number(p1c.curve[4]!.bestFullSU2OpDist.toExponential(3)),
        synthBestDeltaRad: Number(p1c.bestDeltaSynthRad.toFixed(9)),
        synthPhaseWordOpDistL22: Number(p1c.bestPhaseWordOpDistToRz.toFixed(5)),
        synthPhaseWordAxisNzL22: Number(p1c.bestPhaseWordAxisNz.toFixed(6)),
        synthLeptonQErr: p1c.bestLeptonQErrFromTwoThirds,
        synthLeptonMuOverE: Number(p1c.bestLeptonMuOverE.toFixed(5)),
        synthLeptonMuOverERelErrPct: Number((p1c.bestLeptonMuOverERelErr * 100).toFixed(5)),
        synthLeptonTauOverMu: Number(p1c.bestLeptonTauOverMu.toFixed(5)),
        synthLeptonTauOverMuRelErrPct: Number((p1c.bestLeptonTauOverMRelErr * 100).toFixed(5)),
        // Part 2: Leptons
        leptonMeMeV: Number(p2.leptons.massesMeV[0].toFixed(6)),
        leptonMmuMeV: Number(p2.leptons.massesMeV[1].toFixed(5)),
        leptonMtauMeV: Number(p2.leptons.massesMeV[2].toFixed(3)),
        leptonMaxRelErrPct: Number((p2.leptons.maxRelErr * 100).toFixed(5)),
        leptonKoideQ: Number(p2.leptons.koideQ.toFixed(8)),
        // Part 2: Quarks & CKM
        downEta: Number(p2.downQuarks.eta.toFixed(5)),
        downDeltaRad: Number(p2.downQuarks.deltaRad.toFixed(5)),
        downKoideQ: Number(p2.downQuarks.koideQ.toFixed(6)),
        downRatioBs: Number(p2.downQuarks.ratioBs.toFixed(3)),
        downRatioSd: Number(p2.downQuarks.ratioSd.toFixed(3)),
        upEta: Number(p2.upQuarks.eta.toFixed(5)),
        upDeltaRad: Number(p2.upQuarks.deltaRad.toFixed(5)),
        upDeltaDiffFromTwoNinths: Number(p2.upQuarks.deltaDiffFromTwoNinths.toFixed(5)),
        upKoideQ: Number(p2.upQuarks.koideQ.toFixed(6)),
        upRatioTc: Number(p2.upQuarks.ratioTc.toFixed(3)),
        upRatioCu: Number(p2.upQuarks.ratioCu.toFixed(2)),
        ckmBareVus: Number(p2.ckmBare.vUs.toFixed(5)),
        ckmBareVcb: Number(p2.ckmBare.vCb.toFixed(5)),
        ckmBareVub: Number(p2.ckmBare.vUb.toFixed(5)),
        ckmBareJarlskog: Number(p2.ckmBare.jarlskogCP.toExponential(3)),
        ckmVus: Number(p2.ckm.vUs.toFixed(5)),
        ckmVcb: Number(p2.ckm.vCb.toFixed(5)),
        ckmVub: Number(p2.ckm.vUb.toFixed(5)),
        ckmJarlskogCP: Number(p2.ckm.jarlskogCP.toExponential(3)),
        ckmUnitarityErr: p2.ckm.unitarityErr,
        ckmJarlskogQuartetSpread: p2.ckm.jarlskogQuartetSpread,
        // Part 2: Neutrinos & PMNS
        nuMass1Ev: Number(p2.neutrinos.lightNeutrinoMassesEv[0].toFixed(6)),
        nuMass2Ev: Number(p2.neutrinos.lightNeutrinoMassesEv[1].toFixed(6)),
        nuMass3Ev: Number(p2.neutrinos.lightNeutrinoMassesEv[2].toFixed(6)),
        nuSumMassesEv: Number(p2.neutrinos.sumMassesEv.toFixed(5)),
        nuDm21SqEv2: Number(p2.neutrinos.dm21SqEv2.toExponential(4)),
        nuDm31SqEv2: Number(p2.neutrinos.dm31SqEv2.toExponential(4)),
        nuDmRatio21Over31: Number(p2.neutrinos.dmRatio21Over31.toFixed(5)),
        nuKoideQ: Number(p2.neutrinos.koideQNu.toFixed(5)),
        pmnsSin2Theta12: Number(p2.neutrinos.sin2Theta12.toFixed(5)),
        pmnsSin2Theta23: Number(p2.neutrinos.sin2Theta23.toFixed(5)),
        pmnsSin2Theta13: Number(p2.neutrinos.sin2Theta13.toFixed(5)),
        pmnsDeltaCpDeg: Number(p2.neutrinos.deltaCpDeg.toFixed(2)),
        pmnsJarlskogCP: Number(p2.neutrinos.jarlskogPMNS.toExponential(3)),
        pmnsUnitarityErr: p2.neutrinos.pmnsUnitarityErr,
        nuTakagiReconErr: p2.neutrinos.takagiReconErr,
        nuSeesawInvErr: p2.neutrinos.seesawInvErr,
        // Parameter ledger
        nObservables: p2.ledger.nObservables,
        nContinuousFreeParams: p2.ledger.nContinuousFreeParams,
        nDiscreteStructuralInputs: p2.ledger.nDiscreteStructuralInputs,
        nZeroParamTheorems: p2.ledger.nZeroParamTheorems,
        netOverdeterminationContinuous: p2.ledger.netOverdeterminationContinuous,
      },
      control: {
        piOver9MinEigenvalue: Number(p1a.controlPiOver9MinEigenvalue.toFixed(6)),
        piOver9MaxLeptonRatioErr: Number(p1a.controlPiOver9MaxLeptonRatioErr.toFixed(4)),
        zeroWarpQuarksQDown: Number(p2.controls.zeroWarpQuarksQDown.toFixed(8)),
        zeroWarpQuarksQUp: Number(p2.controls.zeroWarpQuarksQUp.toFixed(8)),
        realYukawaCkmJarlskog: p2.controls.realYukawaCkmJarlskog,
        realMajoranaPmnsJarlskog: p2.controls.realMajoranaPmnsJarlskog,
        unperturbedTbmSin2Theta12: Number(p2.controls.unperturbedTbmSin2Theta12.toFixed(6)),
        unperturbedTbmSin2Theta23: Number(p2.controls.unperturbedTbmSin2Theta23.toFixed(6)),
        unperturbedTbmSin2Theta13: p2.controls.unperturbedTbmSin2Theta13,
        unperturbedTbmJarlskog: p2.controls.unperturbedTbmJarlskog,
      },
      notes:
        'Strict scientific honesty audit (L2, zero random numbers): ' +
        '(1) EXACT 0-PARAMETER ALGEBRAIC THEOREMS: (a) Lindemann-Weierstrass proves e^{i 2/9} is strictly transcendental ' +
        'and cannot appear as a single entry in Z[zeta_9][1/6] or any root of unity zeta_N^k (all 18 roots zeta_18^k ' +
        'audited in exact Q(zeta_9), closest pi/9 misses 2/9 by 57.08% and all 15 non-degenerate roots fall outside ' +
        'the Koide positivity window). ' +
        '(b) On the 9-state qutrit role space of Sigma(648) (order-27 Heisenberg-Weyl group, 9 orthogonal role operators), ' +
        'the normalized rational generator H_role = (1/9)(X_3 (x) I_3 + X_3^dag (x) I_3) has exact eigenvalue 2/9 on the ' +
        '3-fold symmetric generation subspace and yields one-beat Floquet unitary phase exp(-i * 2/9) with zero pi factor, ' +
        'resolving the 1/pi algebraic puzzle. (c) Dense exact BigInt Z[w][1/2] rule words over {W_1, W_1^dag, W_2, W_2^dag} ' +
        `synthesize exp(-i (2/9) sigma_z) monotonically across L = 6..22 to |delta_synth - 2/9| = ${p1c.bestDeltaAbsErrRad.toExponential(3)} rad ` +
        '(exact BigInt det = 1 and U^dag U = I, Euler z-phase -arg(U_00) inside constant R_z cone op dist <= 0.022, ' +
        `axis alignment n_z = ${p1c.bestPhaseWordAxisNz.toFixed(6)}), while exact dyadic half-trace obeys the Eisenstein ` +
        `congruence 2 a_0 - a_1 = 2^{p+1} mod 3 and strict 3-DOF full-SU(2) operator distance scales honestly as 3^{-L/3} ` +
        `to ${p1c.bestFullSU2OpDistAt22.toExponential(3)} at L = 22. ` +
        '(2) HONEST TEXTURE FITS AND OPEN DYNAMICS: Across 22 SM flavor observables (12 masses, 4 CKM, 4 PMNS, 2 Koide ' +
        `relations), this unified texture uses ${p2.ledger.nContinuousFreeParams} continuous fitted parameters (1 lepton scale v_e, ` +
        '3 down-quark params v_d/eta_d/delta_d, 3 up-quark params v_u/eta_u/delta_u, 3 CKM misalignment couplings multiplying ' +
        'the F4 1/sqrt(2) zeta_9^7 off-diagonal misalignment, and 4 Type-I seesaw Majorana params M_PS/alpha_R/beta_R/epsilon_R) ' +
        `plus ${p2.ledger.nDiscreteStructuralInputs} discrete structural inputs (delta_9 = 2/9 and Z[zeta_9] CP phase exponents ` +
        'zeta_9^7 for CKM and zeta_9^2 for PMNS), yielding net overdetermination of 8 observables without claiming ' +
        'zero-parameter derivation of Yukawa fits. Why vacuum dynamics selects H_role = 2/9, the sector warp exponents ' +
        '(eta_d, eta_u), and the Pati-Salam Majorana couplings remain open dynamical targets.',
    })
  },
})
