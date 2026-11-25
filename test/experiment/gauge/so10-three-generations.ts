// FRONTIER 7: COMPLETE 16-STATE SO(10) GENERATION x 3 TRIALITY FRAMES (48 WEYL FERMIONS),
// EXACT 6/6 BIGINT-RATIONAL ANOMALY CANCELLATION, WEINBERG ANGLE, AND DYNAMICAL S_3 TRIALITY BREAKING
// (E-FRC-0324, gaps B-25 and m-11).
//
// Part 1: Completes each 8-slot D4 triality frame of the 24-cell (8_+ paired with antipodal conjugate 8_-)
// into the exact 16-dimensional chiral Weyl spinor 16 of Spin(10) via 5 fermionic oscillators (a_1..a_5)
// of Cl(10), giving 3 x 16 = 48 chiral Weyl fermions. Verifies all 100 Clifford relations, all 990
// exact so(10) Lie brackets, SU(3)_C x SU(2)_L x SU(2)_R x U(1)_Y closure and mutual commutators,
// exact Q = T_3 + Y charge quantization with zero fractional-charge exotics, and exact triality
// universality across the 48-state lift.
//
// Part 2: Exact zero-float BigInt rational verification of all 6/6 anomalies (grav-U(1), U(1)^3,
// SU(2)^2 U(1), SU(3)^2 U(1) over all 64 pairs, SU(3)^3 over all 512 triples, and Witten SU(2) global
// parity: 4 doublets per generation, 12 total) on 1 and 3 generations. Derives exact unification
// sin^2(theta_W)_GUT = Tr(T_3^2)/Tr(Q^2) = 3/8 (BigInt rational), compares with standard 1-loop SM RG
// running toward 0.2312 (clearly marked as textbook SM RG, not lattice-derived), and verifies negative
// controls (removing e_R^c, shifting u_R^c by +1/6, removing L_L) break anomaly cancellation and 3/8.
//
// Part 3: Exhaustive 6^3 = 216 minimization of an explicitly S_3-permutation-symmetric free energy
// F(D_1, D_2, D_3) built from {3,4,3,4} cusp binding E_bind(D) and symmetric E-SPN-0222 zero-mode
// Pauli + 1/N_D bottleneck crowding repulsion. Proves exact S_3 invariance (maxS3Err = 0), spontaneous
// S_3 breaking into a 6-fold staggered multiplet {permutations of (0, 2, 3)}, automatic generation of
// m_3/m_1 > 1000 + unitary hierarchical CKM + Jarlskog CP from the dynamically selected shells, and
// negative control V_rep = 0 collapsing back to unbroken (0, 0, 0) with m_3/m_1 = 1.000.
//
// Depth L2: exact BigInt Q(i, sqrt(3)) certificates, exhaustive 216-state minimization, exact 3x3 SVD.
// Zero random numbers.

import {
  analyzeSo10ThreeGenerations,
  ratEq,
  ratFormat,
  ratIsZero,
  ratToNumber,
  rat,
} from '@/code/measure/so10-three-generations'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/so10-three-generations',
  code: 'E-FRC-0324',
  title:
    'Complete 16-state Spin(10) generation x 3 D4 triality frames (48 Weyl fermions), exact 6/6 BigInt-rational anomaly cancellation, sin^2(theta_W) = 3/8, and spontaneous dynamical S_3 triality breaking on {3,4,3,4} cusp shells (B-25, m-11)',
  category: 'gauge',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeSo10ThreeGenerations(20)
    const f = r.framesCert
    const s = r.spin10
    const a1 = r.anomalies1Gen
    const a3 = r.anomalies3Gen
    const w = r.weinberg
    const ac = r.anomalyControls
    const sb = r.s3Breaking

    // Part 1 gates: exact 16 = 8_+ + 8_- Spin(10) representation x 3 frames = 48 Weyl fermions
    const part1Ok =
      f.disjointCover &&
      f.trialityOrder3 &&
      f.trialityCyclesFrames &&
      s.cliffordRelationExact &&
      s.spin10GeneratorsCount === 45 &&
      s.spin10AllPreserveChirality &&
      s.spin10AllHermitian &&
      s.spin10AllTraceless &&
      s.spin10CommutatorsChecked === 990 &&
      s.spin10LieClosureExact &&
      s.su3LieClosureExact &&
      s.su2LLieClosureExact &&
      s.su2RLieClosureExact &&
      s.su3CommutesWithSu2LExact &&
      s.su3CommutesWithSu2RExact &&
      s.su2LCommutesWithSu2RExact &&
      s.yCommutesWithSu3Exact &&
      s.yCommutesWithSu2LExact &&
      s.qEqualsT3PlusYExact &&
      s.trialityCommutesWithAllGauge48Exact &&
      s.decompositionMatchesExact &&
      s.zeroFractionalChargeExotics &&
      s.totalWeylFermions === 48

    // Part 2 gates: exact BigInt 6/6 anomaly cancellation, exact 3/8 Weinberg angle, negative controls
    const part2Ok =
      a1.allSixCancelExact &&
      a3.allSixCancelExact &&
      a1.su3CubicTriplesChecked === 512 &&
      a1.su2LDoubletCount === 4 &&
      a3.su2LDoubletCount === 12 &&
      ratEq(w.sin2ThetaWGutExact, rat(3n, 8n)) &&
      ratEq(w.sin2ThetaWGut3GenExact, rat(3n, 8n)) &&
      ratEq(w.gutNormK1, rat(5n, 3n)) &&
      ratIsZero(w.trT3Y1Gen) &&
      w.smRgDirectionDownward &&
      ac.allControlsBreak

    // Part 3 gates: exact S_3 invariance, spontaneous 6-fold staggered breaking, Yukawa hierarchy & CKM, V_rep=0 control
    const part3Ok =
      sb.totalConfigsEnumerated === 216 &&
      sb.maxS3PermutationErr === 0 &&
      sb.globalMinMultiplicity === 6 &&
      sb.allPermutationsOfStaggeredTriplet &&
      sb.strictlyDistinctShells &&
      sb.energyDropFromSymmetric > 10 &&
      sb.gapToSecondOrbit > 0.1 &&
      sb.downRatio3To1 > 1000 &&
      sb.upRatio3To1 > 1000 &&
      sb.ckmUnitarityErr <= 1e-14 &&
      sb.ckmHierarchicalOrdering &&
      Math.abs(sb.jarlskogCP) > 1e-7 &&
      sb.controlVrepZeroMinMultiplicity === 1 &&
      sb.controlVrepZeroShells[0] === 0 &&
      sb.controlVrepZeroShells[1] === 0 &&
      sb.controlVrepZeroShells[2] === 0 &&
      Math.abs(sb.controlVrepZeroDownRatio3To1 - 1) < 1e-12 &&
      Math.abs(sb.controlVrepZeroUpRatio3To1 - 1) < 1e-12 &&
      sb.controlVrepZeroCkmVus < 1e-12 &&
      Math.abs(sb.controlVrepZeroJarlskogCP) < 1e-14

    const ok = part1Ok && part2Ok && part3Ok

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 (exact Q(i,sqrt(3))): each 8-slot D4 triality frame paired with its antipodal conjugate forms ` +
        `the exact 16 = 8_+ + 8_- chiral Weyl spinor of Spin(10) via 5 Cl(10) oscillators (all 100 Clifford ` +
        `relations and all 990 so(10) Lie brackets exact), yielding 3 x 16 = ${s.totalWeylFermions} Weyl fermions ` +
        `with exact decomposition Q_L(6)+u_R^c(3)+d_R^c(3)+L_L(2)+e_R^c(1)+nu_R^c(1) and zero fractional-charge ` +
        `exotics. Part 2 (exact BigInt rationals): all 6/6 anomalies vanish identically on 16 and 48 states ` +
        `(Tr(Y)=0, Tr(Y^3)=0, SU(2)^2U(1)=0, SU(3)^2U(1)=0 on 64 pairs, SU(3)^3=0 on 512 triples, Witten doublets ` +
        `${a1.su2LDoubletCount}/gen and ${a3.su2LDoubletCount}/3-gen even), sin^2(theta_W)_GUT = ` +
        `${ratFormat(w.sin2ThetaWGutExact)} exact (standard 1-loop SM RG runs downward toward 0.2312: ` +
        `${w.sm1LoopSin2ThetaWAt1e15GeV.toFixed(4)} at 10^15 GeV), and all 3 mutation controls break cancellation. ` +
        `Part 3 (216-state exact minimization): strictly S_3-symmetric free energy (maxS3Err=${sb.maxS3PermutationErr}) ` +
        `spontaneously breaks S_3 into the 6-fold staggered multiplet (${sb.selectedSortedShells.join(',')}) ` +
        `(gap=${sb.gapToSecondOrbit.toFixed(3)}), generating down m3/m1=${sb.downRatio3To1.toFixed(0)}, up ` +
        `m3/m1=${sb.upRatio3To1.toFixed(0)}, unitary hierarchical CKM (|V_us|=${sb.ckmVus.toFixed(4)}, ` +
        `J_CP=${sb.jarlskogCP.toExponential(3)}), while V_rep=0 collapses back to unbroken (0,0,0) with m3/m1=1.000`,
      metrics: {
        // Part 1
        chiralSpinorDim: s.chiralSpinorDim,
        spin8PlusCount: s.spin8PlusCount,
        spin8MinusCount: s.spin8MinusCount,
        totalWeylFermions: s.totalWeylFermions,
        spin10GeneratorsCount: s.spin10GeneratorsCount,
        spin10CommutatorsChecked: s.spin10CommutatorsChecked,
        spin10AlgebraAllExact: part1Ok ? 1 : 0,
        zeroFractionalChargeExotics: s.zeroFractionalChargeExotics ? 1 : 0,
        // Part 2
        anomalies1GenAllZero: a1.allSixCancelExact ? 1 : 0,
        anomalies3GenAllZero: a3.allSixCancelExact ? 1 : 0,
        su3CubicTriplesChecked: a1.su3CubicTriplesChecked,
        wittenDoublets1Gen: a1.su2LDoubletCount,
        wittenDoublets3Gen: a3.su2LDoubletCount,
        trT3Sq1Gen: ratToNumber(w.trT3Sq1Gen),
        trYSq1Gen: Number(ratToNumber(w.trYSq1Gen).toFixed(6)),
        trQSq1Gen: Number(ratToNumber(w.trQSq1Gen).toFixed(6)),
        gutNormK1: Number(ratToNumber(w.gutNormK1).toFixed(6)),
        sin2ThetaWGutExact: w.sin2ThetaWGutFloat,
        sm1LoopSin2ThetaWAt1e15GeV: Number(w.sm1LoopSin2ThetaWAt1e15GeV.toFixed(5)),
        sm1LoopLog10M12GeV: Number(Math.log10(w.sm1LoopMeetingScaleM12GeV).toFixed(3)),
        // Part 3
        totalConfigsEnumerated: sb.totalConfigsEnumerated,
        maxS3PermutationErr: sb.maxS3PermutationErr,
        criticalLambdaFirstBreak: sb.criticalLambdaFirstBreak,
        criticalLambdaFullStagger: sb.criticalLambdaFullStagger,
        energyDegenerate000: Number(sb.energyDegenerate000.toFixed(4)),
        globalMinEnergy: Number(sb.globalMinEnergy.toFixed(4)),
        gapToSecondOrbit: Number(sb.gapToSecondOrbit.toFixed(4)),
        globalMinMultiplicity: sb.globalMinMultiplicity,
        selectedShellA: sb.selectedSortedShells[0],
        selectedShellB: sb.selectedSortedShells[1],
        selectedShellC: sb.selectedSortedShells[2],
        downRatio3To2: Number(sb.downRatio3To2.toFixed(3)),
        downRatio2To1: Number(sb.downRatio2To1.toFixed(3)),
        downRatio3To1: Number(sb.downRatio3To1.toFixed(2)),
        downKoideQ: Number(sb.downKoideQ.toFixed(6)),
        upRatio3To2: Number(sb.upRatio3To2.toFixed(3)),
        upRatio2To1: Number(sb.upRatio2To1.toFixed(3)),
        upRatio3To1: Number(sb.upRatio3To1.toFixed(2)),
        upKoideQ: Number(sb.upKoideQ.toFixed(6)),
        ckmUnitarityErr: sb.ckmUnitarityErr,
        ckmVud: Number(sb.ckmVud.toFixed(5)),
        ckmVus: Number(sb.ckmVus.toFixed(5)),
        ckmVub: Number(sb.ckmVub.toFixed(5)),
        ckmVcs: Number(sb.ckmVcs.toFixed(5)),
        ckmVcb: Number(sb.ckmVcb.toFixed(5)),
        ckmVtb: Number(sb.ckmVtb.toFixed(5)),
        ckmHierarchicalOrdering: sb.ckmHierarchicalOrdering ? 1 : 0,
        jarlskogCP: sb.jarlskogCP,
      },
      control: {
        // Part 2 anomaly negative controls
        removeErTrY: ratToNumber(ac.removeErTrY),
        removeErTrY3: ratToNumber(ac.removeErTrY3),
        removeErSin2ThetaW: Number(ratToNumber(ac.removeErSin2ThetaW).toFixed(6)),
        shiftUcTrY: ratToNumber(ac.shiftUcTrY),
        shiftUcTrY3: Number(ratToNumber(ac.shiftUcTrY3).toFixed(6)),
        shiftUcSu3SqU1: Number(ratToNumber(ac.shiftUcSu3SqU1).toFixed(6)),
        shiftUcSin2ThetaW: Number(ratToNumber(ac.shiftUcSin2ThetaW).toFixed(6)),
        removeLlWittenParity: ac.removeLlWittenParity,
        removeLlSu2SqU1: ratToNumber(ac.removeLlSu2SqU1),
        // Part 3 V_rep = 0 unbroken S_3 control
        vRepZeroMinMultiplicity: sb.controlVrepZeroMinMultiplicity,
        vRepZeroDownRatio3To1: sb.controlVrepZeroDownRatio3To1,
        vRepZeroUpRatio3To1: sb.controlVrepZeroUpRatio3To1,
        vRepZeroCkmVus: sb.controlVrepZeroCkmVus,
        vRepZeroJarlskogCP: sb.controlVrepZeroJarlskogCP,
      },
      notes:
        'Honest boundary audit (L2, zero random numbers): ' +
        '(1) EXACT ALGEBRAIC PROOFS (BigInt Q(i, sqrt(3)), zero floats): 16 = 8_+ + 8_- Spin(10) spinor ' +
        'completion of each 8-slot D4 frame gives 3 x 16 = 48 Weyl fermions, all 100 Cl(10) relations and ' +
        'all 990 so(10) commutators close exactly, SU(3)_C x SU(2)_L x U(1)_Y closes inside Spin(10), ' +
        'Q = T_3 + Y quantizes electric charges with zero exotics, all 6/6 anomalies vanish identically on ' +
        '16 and 48 states (512 SU(3)^3 triples, 64 SU(3)^2 U(1) pairs, 9 SU(2)^2 U(1) pairs, 4 and 12 Witten ' +
        'doublets), and sin^2(theta_W)_GUT = 3/8 exact. ' +
        '(2) STANDARD 1-LOOP SM RG COMPARISON (not a lattice-derived scale): textbook 1-loop SM beta ' +
        'functions (b_1=41/10, b_2=-19/6, b_3=-7) run sin^2(theta_W) downward from 3/8 = 0.375 toward the ' +
        'observed 0.2312 (0.2054 at M_GUT = 10^15 GeV, meeting at M_12 = 1.03e13 GeV; the known non-SUSY ' +
        'threshold mismatch is reported openly). ' +
        '(3) SPONTANEOUS S_3 BREAKING BOUNDARY: the 216-state minimization proves that a strictly S_3-invariant ' +
        'free energy built from {3,4,3,4} cusp binding and E-SPN-0222 zero-mode crowding repulsion spontaneously ' +
        'selects the 6-fold staggered multiplet (0, 2, 3) with zero hand-picked asymmetry, driving m_3/m_1 > 1000 ' +
        'and hierarchical unitary CKM; deriving the effective crowding couplings (g_pauli, g_cusp) from the full ' +
        'microscopic 4D gauge-Higgs action and precision PDG fermion masses remain open dynamical targets.',
    })
  },
})
