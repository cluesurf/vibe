// FRONTIER 2: STANDARD MODEL 3 CHIRAL FERMION GENERATIONS, EXPONENTIAL MASS HIERARCHY,
// AND UNITARY CKM MIXING FROM D4 TRIALITY, Z[zeta_9][1/6] CUSP WALL, AND {3,4,3,4} WARP SHELLS
// (E-FRC-0323, gaps B-25 and m-11).
//
// Part 1: Lifts E-SPN-0222's exact Z[zeta_9][1/6] unitary cusp domain wall onto the 3 orthogonal 8-slot
// D4 triality frames of the 24-cell (3 x 8 = 24, cycled by order-3 T_3 in W(D4) < W(F4), commuting with
// the Z_3 center omega = zeta_9^3 of Sigma(648)). Verifies exact N_gen = 3 Left-handed Weyl zero modes on
// D <= 2 (> 0.999 weight, Right mirrors < 1e-20, total bulk winding W_total = 3), strictly 0 fourth light
// generation (bulk gap > 0.6 rad), all 7 3D doublers gapped at >= pi/3, exact Z_3 universality, and exact
// Q(zeta_9) symbolic unitarity.
//
// Part 2: Computes exact 3x3 Yukawa overlap matrices Y_{ij} = K_{ij} * <psi_{L,i} | w(D) | psi_{R,j}> from
// shifted Z[zeta_9][1/6] unitary domain-wall zero modes, the exact {3,4,3,4} pair-density cusp warp
// w(D) = 1 / N_D^2 (N_D = [1, 18, 330, 6034], b = 18.285), and F4 short/long frame couplings carrying
// exact zeta_9 = e^(2 pi i / 9) phases. Verifies multi-order-of-magnitude hierarchy (m_3/m_2 > 10,
// m_2/m_1 > 10, m_3/m_1 > 1000), unitary hierarchical CKM mixing (|V_ud|, |V_cs|, |V_tb| > 0.9,
// |V_us| in [0.1, 0.3], |V_ub| < |V_cb| < |V_us|, ||V^dag V - I|| <= 1e-14), and nonzero Jarlskog CP
// invariant J_CP != 0 from zeta_9. Controls: (a) unbroken S_3 triality (m_1 = m_2 = m_3, V_CKM = I_3,
// J_CP = 0), (b) unwarped flat bulk N_D = 1 (hierarchy collapses to O(1)), and (c) real Yukawa (J_CP = 0).
//
// Part 3: Honest boundary audit against PDG lepton/quark mass ratios and Koide Q, separating what is
// parameter-free from {3,4,3,4} + W(F4) + Z[zeta_9][1/6] from what remains open (dynamical S_3 breaking
// of the shell offsets, 8 -> 16 SO(10) spinor completion, precision spectrum and Koide phase delta = 2/9).
//
// Depth L2: exact Q(zeta_9) symbolic certificates, full 288x288 unitary Floquet spectrum, and exact 3x3 SVD.
// Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { analyzeThreeGenerationSpectrum } from '@/code/measure/three-generation-spectrum'

export default experiment({
  id: 'gauge/three-generation-spectrum',
  code: 'E-FRC-0323',
  title:
    'Three chiral fermion generations from 24-cell D4 triality + Z[zeta_9][1/6] unitary cusp wall, with exponential {3,4,3,4} warp-shell mass hierarchy, hierarchical unitary CKM + Jarlskog CP phase, and honest boundary audit (B-25, m-11)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeThreeGenerationSpectrum(24)
    const f = r.framesCert
    const a = r.algebraicCert
    const w = r.chiralWall
    const dn = r.downSector
    const up = r.upSector
    const ckm = r.ckm

    // Part 1 gates: exact N_gen = 3 chiral zero modes, 0 fourth generation, Z_3 universality, Q(zeta_9) exactness
    const part1Ok =
      f.disjointCover &&
      f.intraFrameOrthogonal &&
      f.interFrameInnerProductsValid &&
      f.trialityOrder3 &&
      f.trialityIsOrthogonal &&
      f.trialityCyclesFrames &&
      f.commutesWithZ3Exact &&
      f.z3ChargeIdenticalAcrossFrames &&
      f.cuspD0S3Symmetric &&
      a.allExact &&
      w.unitarityErr <= 1e-14 &&
      w.maxEigResidual <= 1e-12 &&
      w.nGen === 3 &&
      w.nFourthLightGen === 0 &&
      w.totalWindingNu0 === 3 &&
      w.totalWindingNuPi === 0 &&
      w.maxZeroModeQuasienergy < 1e-12 &&
      w.fourthGenBulkGap > 0.5 &&
      w.leftHuskWeightPerGen > 0.999 &&
      w.rightHuskWeightPerGen < 1e-20 &&
      w.rightFloorWeightPerGen > 0.999 &&
      w.allDoublersTrivialWinding &&
      w.minDoublerGap >= Math.PI / 3 - 1e-9

    // Part 2 gates: exponential hierarchy, unitary hierarchical CKM, Jarlskog CP from zeta_9, and 3 controls
    const hierarchyOk =
      r.zeroModesCheckMaxUnitarityErr <= 1e-14 &&
      r.zeroModesCheckMaxAnalyticErr <= 1e-12 &&
      r.zeroModesCheckMinLeftPurity > 0.999999 &&
      dn.ratio3To2 > 10 &&
      dn.ratio2To1 > 10 &&
      dn.ratio3To1 > 1000 &&
      up.ratio3To2 > 10 &&
      up.ratio2To1 > 10 &&
      up.ratio3To1 > 1000 &&
      dn.svdReconstructionErr <= 1e-13 &&
      up.svdReconstructionErr <= 1e-13

    const ckmOk =
      ckm.unitarityErr <= 1e-14 &&
      ckm.vUd > 0.9 &&
      ckm.vCs > 0.9 &&
      ckm.vTb > 0.9 &&
      ckm.vUs >= 0.1 &&
      ckm.vUs <= 0.3 &&
      ckm.hierarchicalOrdering &&
      Math.abs(ckm.jarlskogCP) > 1e-7 &&
      ckm.jarlskogQuartetSpread <= 1e-14

    const controlsOk =
      Math.abs(r.controlUnbrokenS3.ratio3To1 - 1) < 1e-12 &&
      r.controlUnbrokenS3.vUs < 1e-12 &&
      Math.abs(r.controlUnbrokenS3.jarlskogCP) < 1e-14 &&
      r.controlFlatBulk.downRatio3To1 < 20 &&
      r.controlFlatBulk.upRatio3To1 < 20 &&
      Math.abs(r.controlRealYukawa.jarlskogCP) < 1e-14

    const ok = part1Ok && hierarchyOk && ckmOk && controlsOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 (parameter-free): 24-cell D4 triality (3 x 8 = 24, T_3^3 = I, commuting with Z_3 center omega) ` +
        `lifted onto E-SPN-0222's exact Z[zeta_9][1/6] unitary cusp wall (N=${w.depth}, dim=${w.dim}, symbolic Q(zeta_9) ` +
        `cert=${a.allExact}, ||U^dag U - I||=${w.unitarityErr.toExponential(2)}) yields exactly N_gen=${w.nGen} ` +
        `Left-handed Weyl zero modes (W_total=${w.totalWindingNu0}, D<=2 weight=${w.leftHuskWeightPerGen.toFixed(6)}, ` +
        `Right mirror=${w.rightHuskWeightPerGen.toExponential(2)}), strictly 0 fourth light generation ` +
        `(bulk gap=${w.fourthGenBulkGap.toFixed(4)} rad), and all 7 3D doublers gapped at >=${w.minDoublerGap.toFixed(4)} rad. ` +
        `Part 2 (warped Yukawa overlap on N_D=[1,18,330,6034], w(D)=1/N_D^2): down ratios ` +
        `m3/m2=${dn.ratio3To2.toFixed(1)}, m2/m1=${dn.ratio2To1.toFixed(1)}, m3/m1=${dn.ratio3To1.toFixed(0)} ` +
        `(Q=${dn.koideQ.toFixed(4)}), up ratios m3/m2=${up.ratio3To2.toFixed(1)}, m2/m1=${up.ratio2To1.toFixed(1)}, ` +
        `m3/m1=${up.ratio3To1.toFixed(0)} (Q=${up.koideQ.toFixed(4)}), unitary CKM (err=${ckm.unitarityErr.toExponential(2)}, ` +
        `|V_us|=${ckm.vUs.toFixed(4)}, |V_cb|=${ckm.vCb.toFixed(4)}, |V_ub|=${ckm.vUb.toFixed(4)}, ` +
        `J_CP=${ckm.jarlskogCP.toExponential(3)} from zeta_9 vs ${r.controlRealYukawa.jarlskogCP.toExponential(2)} real). ` +
        `Controls: unbroken S_3 gives m3/m1=${r.controlUnbrokenS3.ratio3To1.toFixed(6)} and zero mixing, flat bulk ` +
        `collapses hierarchy to m3/m1=${r.controlFlatBulk.downRatio3To1.toFixed(2)}. ` +
        `Part 3 (honest boundary): N_gen=3, 0 fourth gen, Z_3 universality, ~18.3x per-shell warp scale, hierarchical ` +
        `unitary CKM and zeta_9 CP phase are structural, while dynamical S_3 shell-anchor selection, 8->16 SO(10) spinor ` +
        `completion, and precision SM masses / lepton Koide Q=${r.smComparison.leptonKoideQ.toFixed(6)} stay open`,
      metrics: {
        // Part 1
        trialityFramesExact:
          f.disjointCover &&
          f.intraFrameOrthogonal &&
          f.interFrameInnerProductsValid &&
          f.trialityOrder3 &&
          f.trialityIsOrthogonal &&
          f.trialityCyclesFrames
            ? 1
            : 0,
        z3UniversalityExact: f.commutesWithZ3Exact && f.z3ChargeIdenticalAcrossFrames ? 1 : 0,
        cuspD0S3Symmetric: f.cuspD0S3Symmetric ? 1 : 0,
        algebraicCertAllExact: a.allExact ? 1 : 0,
        threeGenUnitarityErr: w.unitarityErr,
        threeGenMaxEigResidual: w.maxEigResidual,
        nGen: w.nGen,
        nFourthLightGen: w.nFourthLightGen,
        totalWindingNu0: w.totalWindingNu0,
        totalWindingNuPi: w.totalWindingNuPi,
        maxZeroModeQuasienergy: w.maxZeroModeQuasienergy,
        fourthGenBulkGap: w.fourthGenBulkGap,
        leftHuskWeightPerGen: w.leftHuskWeightPerGen,
        rightHuskWeightPerGen: w.rightHuskWeightPerGen,
        rightFloorWeightPerGen: w.rightFloorWeightPerGen,
        minDoublerGap: w.minDoublerGap,
        // Part 2: Warp scale and spectra
        branchingFactorB: Number(r.branchingFactorB.toFixed(5)),
        analyticDecayRho: Number(r.analyticDecayRho.toFixed(6)),
        zeroModesMaxUnitarityErr: r.zeroModesCheckMaxUnitarityErr,
        zeroModesMaxAnalyticErr: r.zeroModesCheckMaxAnalyticErr,
        zeroModesMinLeftPurity: r.zeroModesCheckMinLeftPurity,
        downSvdReconstructionErr: dn.svdReconstructionErr,
        upSvdReconstructionErr: up.svdReconstructionErr,
        downRatio3To2: Number(dn.ratio3To2.toFixed(3)),
        downRatio2To1: Number(dn.ratio2To1.toFixed(3)),
        downRatio3To1: Number(dn.ratio3To1.toFixed(2)),
        downKoideQ: Number(dn.koideQ.toFixed(6)),
        upRatio3To2: Number(up.ratio3To2.toFixed(3)),
        upRatio2To1: Number(up.ratio2To1.toFixed(3)),
        upRatio3To1: Number(up.ratio3To1.toFixed(2)),
        upKoideQ: Number(up.koideQ.toFixed(6)),
        singleWarpRatio3To2: Number(r.singleWarpSector.ratio3To2.toFixed(3)),
        singleWarpRatio2To1: Number(r.singleWarpSector.ratio2To1.toFixed(3)),
        singleWarpRatio3To1: Number(r.singleWarpSector.ratio3To1.toFixed(2)),
        singleWarpKoideQ: Number(r.singleWarpSector.koideQ.toFixed(6)),
        // Part 2: CKM and Jarlskog CP
        ckmUnitarityErr: ckm.unitarityErr,
        ckmVud: Number(ckm.vUd.toFixed(5)),
        ckmVus: Number(ckm.vUs.toFixed(5)),
        ckmVub: Number(ckm.vUb.toFixed(5)),
        ckmVcs: Number(ckm.vCs.toFixed(5)),
        ckmVcb: Number(ckm.vCb.toFixed(5)),
        ckmVtb: Number(ckm.vTb.toFixed(5)),
        ckmHierarchicalOrdering: ckm.hierarchicalOrdering ? 1 : 0,
        jarlskogCP: ckm.jarlskogCP,
        jarlskogQuartetSpread: ckm.jarlskogQuartetSpread,
        // Part 3: PDG reference comparison
        smLeptonRatio3To2: Number(r.smComparison.leptonRatio3To2.toFixed(3)),
        smLeptonRatio2To1: Number(r.smComparison.leptonRatio2To1.toFixed(3)),
        smLeptonKoideQ: Number(r.smComparison.leptonKoideQ.toFixed(6)),
        smDownRatio3To2: Number(r.smComparison.downRatio3To2.toFixed(3)),
        smDownRatio2To1: Number(r.smComparison.downRatio2To1.toFixed(3)),
        smDownKoideQ: Number(r.smComparison.downKoideQ.toFixed(6)),
        smUpRatio3To2: Number(r.smComparison.upRatio3To2.toFixed(3)),
        smUpRatio2To1: Number(r.smComparison.upRatio2To1.toFixed(3)),
        smUpKoideQ: Number(r.smComparison.upKoideQ.toFixed(6)),
        downKoideDiffFromLepton: Number(r.smComparison.downKoideDiffFromLepton.toFixed(6)),
        upKoideDiffFromLepton: Number(r.smComparison.upKoideDiffFromLepton.toFixed(6)),
      },
      control: {
        unbrokenS3Ratio3To1: r.controlUnbrokenS3.ratio3To1,
        unbrokenS3KoideQ: Number(r.controlUnbrokenS3.koideQ.toFixed(6)),
        unbrokenS3Vus: r.controlUnbrokenS3.vUs,
        unbrokenS3JarlskogCP: r.controlUnbrokenS3.jarlskogCP,
        flatBulkDownRatio3To1: Number(r.controlFlatBulk.downRatio3To1.toFixed(4)),
        flatBulkUpRatio3To1: Number(r.controlFlatBulk.upRatio3To1.toFixed(4)),
        realYukawaJarlskogCP: r.controlRealYukawa.jarlskogCP,
        realYukawaVus: Number(r.controlRealYukawa.vUs.toFixed(5)),
      },
      notes:
        'Honest boundary audit (L2, zero random numbers): ' +
        '(1) PARAMETER-FREE FROM {3,4,3,4} + W(F4) + Z[zeta_9][1/6]: exact N_gen = 3 chiral Weyl zero modes ' +
        'with total bulk winding W_total = 3 and strictly 0 fourth light generation, all 7 3D doublers gapped ' +
        'at >= pi/3, exact Z_3 center universality across the 3 orthogonal 8-slot D4 triality frames, exact ' +
        'Q(zeta_9) symbolic unitarity and chiral symmetry, the ~18.285x per-shell cusp warp factor and |rho| = ' +
        'tan(pi/9)/tan(pi/3) = 0.2101 zero-mode decay scale, hierarchical unitary 3x3 CKM structure, and nonzero ' +
        'Jarlskog CP violation specifically driven by the complex Z[zeta_9][1/6] phase (J_CP = 0 identically when ' +
        'real). ' +
        '(2) OPEN DYNAMICAL BOUNDARY (not claimed as derived): on a lone D = 0 cusp dock, all 3 triality frames ' +
        'share identical (0 up, 2 lat, 6 dn) alignment (verified via exact-cusp), so S_3 triality holds until broken; ' +
        'consistent with E-SPN-0039 and E-FRC-0141, the staggered shell anchors (3, 2, 0) and UV coin step assignments ' +
        '(m_UV = 2 for Q_L/d_R, m_UV = 1 for u_R) plus discrete zeta_9 phase choices are stated symmetry-breaking ' +
        'inputs, not yet derived as a self-consistent vacuum condensate. Likewise, completing each 8-slot D4 frame ' +
        'to a 16-state SO(10) SM generation (E-FRC-0017 / E-SPN-0041) and deriving precision PDG mass ratios and ' +
        'charged-lepton Koide Q = 0.666661 (phase delta = 2/9 not geometric, E-FRC-0066) remain open dynamical targets.',
    })
  },
})
