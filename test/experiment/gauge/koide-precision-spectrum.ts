// OPEN PROBLEM #2 (E-FRC-0325): EXACT KOIDE Q = 2/3 FROM F4'S SQRT(2) ROOT RATIO,
// Z[zeta_9] PHASE ANALYSIS (arg(zeta_9)/pi = 2/9), PRECISION LEPTON / QUARK / NEUTRINO AUDIT,
// STRICT LOOK-ELSEWHERE NULL CONTROLS, AND COMBINED KOIDE + {3,4,3,4} WARP-SHELL THEOREM.
//
// Part 1 (exact parameter-free theorem, BigInt rationals + Q(zeta_9) symbolic + dense 3x3 Hermitian):
//   On the 24-cell F4 root system (24 short norm^2 = 1, 24 long norm^2 = 2, r_F4 = sqrt(2)) with
//   order-3 D4 triality T_3 (T_3^3 = I, eigenvalues {1, omega, omega^2}), the Hermitian operator
//   S(r, delta) = v_0 (I + (r/2)(e^{i delta} T_3 + e^{-i delta} T_3^dag)) and M = S^2 satisfy
//   Q(M) = (3 + 3 r^2 / 2) / 9 = (2 + r^2) / 6 identically across the positivity window
//   |delta mod 2pi/3| <= pi/12 = pi/3 - acos(1/sqrt(2)) (to <= 1e-15). Thus Q = 2/3 IF AND ONLY IF
//   r = sqrt(2). Negative controls: r = 1 (A/D/E) -> Q = 1/2, r = sqrt(3) (G2) -> Q = 5/6, swapped
//   r = 2*sqrt(2) -> Q_signed = 5/3, outside-window delta = pi/6 -> negative eigenvalue & unsigned Q < 2/3.
//
// Part 2 (Z[zeta_9] phase analysis + pre-registered look-elsewhere null control, confronting E-FRC-0066):
//   Tests BOTH delta = arg(zeta_9) = 2*pi/9 rad (FAILS: outside positivity window, negative eigenvalue)
//   and delta_9 = arg(zeta_9)/pi = 2/9 rad (MATCHES PDG 2024 charged leptons: m_mu/m_e to 0.0008%,
//   m_tau/m_mu to 0.0061%, m_tau/m_e to 0.0070%, Q to 0.0009%, phase-free m_tau = 1776.969 MeV).
//   Runs a deterministic look-elsewhere sweep over all 45 reduced rationals p/q (1 <= p < q <= 12),
//   all F4 / Z[zeta_9] geometric angles, all pi/n (n = 2..40), and a 20,000-point continuous scan
//   over (0, pi/12). Honestly flags the unexplained 1/pi bridge between arg(zeta_9) and 2/9 rad.
//
// Part 3 (full fermion sector audit + exact Koide + {3,4,3,4} warp-shell theorem):
//   Proves in BigInt rationals and dense Hermitian eigensolver (<= 1e-15) that for S_eff = W S W
//   with any positive diagonal warp W = diag(w_0, w_1, w_2) and delta in (-pi/12, pi/12):
//     Q(S_eff^2) = 2/3 + sum_{i<j}(w_i^2 - w_j^2)^2 / (6 (sum_i w_i^2)^2) in [2/3, 1),
//   phase-independent, with Q = 2/3 iff w_0 = w_1 = w_2 (single-cusp leptons). Staggered {3,4,3,4}
//   shells (0, 2, 3) from E-FRC-0324 push Q strictly upward through Q_down = 0.7314 and Q_up = 0.8490,
//   while neutrinos (Q <= 0.584 < 2/3) are provably unreachable by any diagonal warp.
//
// Depth L2: exact BigInt rational + Q(zeta_9) certificates, dense Hermitian spectra, deterministic null sweep.
// Zero random numbers.

import {
  analyzeKoidePrecisionSpectrum,
  rat,
  ratEq,
  ratFormat,
  ratToNumber,
} from '@/code/measure/koide-precision-spectrum'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/koide-precision-spectrum',
  code: 'E-FRC-0325',
  title:
    'Exact Koide Q = 2/3 theorem from F4 sqrt(2) root ratio and D4 triality T_3, Z[zeta_9] phase analysis (arg(zeta_9)/pi = 2/9) with strict look-elsewhere null controls, and exact Koide + {3,4,3,4} warp-shell upward-shift theorem across leptons, quarks, and neutrinos',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeKoidePrecisionSpectrum(16)
    const p1 = r.part1
    const p2 = r.part2
    const p3 = r.part3

    // Part 1 gates: exact F4 + D4 triality theorem, BigInt rational uniqueness, <= 1e-15 numerical sweep, negative controls
    const ctrlADE = p1.rootFamilyControls[0]!
    const ctrlF4 = p1.rootFamilyControls[1]!
    const ctrlG2 = p1.rootFamilyControls[2]!
    const ctrlSwap = p1.rootFamilyControls[3]!

    const part1Ok =
      p1.framesCert.disjointCover &&
      p1.framesCert.trialityOrder3 &&
      p1.framesCert.trialityCyclesFrames &&
      p1.f4TotalRoots === 48 &&
      p1.f4ShortRootsCount === 24 &&
      p1.f4LongRootsCount === 24 &&
      ratEq(p1.f4RatioSqExact, rat(2n)) &&
      p1.t3SymbolicUnitaryExact &&
      p1.t3SymbolicOrder3Exact &&
      p1.t3SymbolicTracelessExact &&
      p1.t3SymbolicEigenvaluesExact &&
      p1.symbolicQF4EqualsTwoThirds &&
      ratEq(p1.uniqueRSquaredForTwoThirds, rat(2n)) &&
      p1.positivityWindowFormulaErr <= 1e-15 &&
      p1.phaseSweepMaxHermiticityErr <= 1e-15 &&
      p1.phaseSweepMaxAnalyticErr <= 1e-14 &&
      p1.phaseSweepMaxEigResidual <= 1e-13 &&
      p1.phaseSweepMaxQErrUnsigned <= 1e-14 &&
      p1.phaseSweepMaxQErrSigned <= 1e-14 &&
      p1.phaseSweepMinEigenvalue >= -1e-14 &&
      p1.scaleInvarianceMaxQErr <= 1e-14 &&
      p1.outsideWindowMinEigenvalue < -0.1 &&
      Math.abs(p1.outsideWindowQSigned - 2 / 3) <= 1e-14 &&
      p1.outsideWindowQUnsigned < 2 / 3 - 0.05 &&
      ratEq(ctrlADE.qExact, rat(1n, 2n)) &&
      ratEq(ctrlF4.qExact, rat(2n, 3n)) &&
      ratEq(ctrlG2.qExact, rat(5n, 6n)) &&
      ratEq(ctrlSwap.qExact, rat(5n, 3n)) &&
      p1.onlySqrt2GivesTwoThirds

    // Part 2 gates: exact Z[zeta_9] distinction, precision charged-lepton match, deterministic look-elsewhere null control
    const part2Ok =
      p2.zeta9ArgOverPiExactErr <= 1e-15 &&
      !p2.directZeta9AngleInWindow &&
      p2.directZeta9MinEigenvalue < -0.1 &&
      p2.directZeta9MaxRatioRelErr > 0.5 &&
      p2.qRelErr < 2e-5 &&
      p2.relErrMuOverE < 5e-4 &&
      p2.relErrTauOverMu < 5e-4 &&
      p2.relErrTauOverE < 5e-4 &&
      p2.phaseFreeKoideMtauRelErr < 1e-4 &&
      p2.rationalTotalCount === 45 &&
      p2.rationalHits005Pct === 1 &&
      p2.rationalNullFalsePositives005Pct === 0 &&
      p2.bestRationalLabel === '2/9' &&
      p2.runnerUpRationalMaxErr > 0.05 &&
      p2.geometricAnglesHits005Pct === 0 &&
      p2.piFractionHits005Pct === 0 &&
      p2.bestPiFractionDeltaDiff > 1e-3 &&
      p2.continuousSecondaryIslands005Pct === 0 &&
      p2.lookElsewhereProb45Rationals005Pct < 0.01 &&
      p2.lookElsewhereProb45RationalsAtObservedErr > 0 &&
      p2.lookElsewhereProb45RationalsAtObservedErr < 0.002

    // Part 3 gates: full sector audit, exact BigInt + numerical Koide + {3,4,3,4} warp-shell upward-shift theorem
    const part3Ok =
      Math.abs(p3.qChargedLeptonsPdg - 2 / 3) < 1e-5 &&
      p3.qDownQuarksPdg > 0.72 &&
      p3.qDownQuarksPdg < 0.75 &&
      p3.qUpQuarksPdg > 0.83 &&
      p3.qUpQuarksPdg < 0.87 &&
      !p3.neutrinoPositiveRootReachesTwoThirds &&
      p3.neutrinoMaxQNormalOrdering < 0.6 &&
      p3.neutrinoMaxQInvertedOrdering < 0.52 &&
      p3.warpTheoremBigIntFormulaMatchExact &&
      ratEq(p3.warpTheoremBigIntUniformQExact, rat(2n, 3n)) &&
      ratToNumber(p3.warpTheoremBigIntStaggeredShellCountsQExact) > 0.99 &&
      p3.warpTheoremPhaseInvarianceMaxErr <= 1e-14 &&
      p3.warpTheoremStrictlyPositiveDefinite &&
      p3.warpSweepMonotonicIncreasing &&
      Math.abs(p3.warpAtEtaZero.qNumerical - 2 / 3) <= 1e-14 &&
      Math.abs(p3.warpAtDownMatch.qNumerical - p3.qDownQuarksPdg) < 1e-6 &&
      Math.abs(p3.warpAtUpMatch.qNumerical - p3.qUpQuarksPdg) < 1e-6 &&
      p3.warpAtDownMatch.eta > 0 &&
      p3.warpAtUpMatch.eta > p3.warpAtDownMatch.eta

    const ok = part1Ok && part2Ok && part3Ok

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 (exact theorem, BigInt + Q(zeta_9)): on the 24-cell F4 root system (24 short norm^2=1, ` +
        `24 long norm^2=2, r_F4=sqrt(2)) with order-3 D4 triality T_3 (T_3^3=I, eigenvalues {1,omega,omega^2}), ` +
        `the Hermitian circulant S(r,delta) = v_0(I + (r/2)(e^{i delta} T_3 + e^{-i delta} T_3^dag)) and M=S^2 ` +
        `satisfy Q(M) = (2+r^2)/6 identically across |delta mod 2pi/3| <= pi/12 (max numerical err=` +
        `${p1.phaseSweepMaxQErrUnsigned.toExponential(2)}), uniquely selecting r^2=${ratFormat(p1.uniqueRSquaredForTwoThirds)} ` +
        `for Q=${ratFormat(p1.symbolicQF4Exact)} (controls: r=1 gives Q=${ratFormat(ctrlADE.qExact)}, ` +
        `r=sqrt(3) gives Q=${ratFormat(ctrlG2.qExact)}, swapped r=2*sqrt(2) gives Q_signed=${ratFormat(ctrlSwap.qExact)}). ` +
        `Part 2 (Z[zeta_9] phase & strict look-elsewhere null): direct angle delta=arg(zeta_9)=2*pi/9 rad ` +
        `FAILS (outside positivity window, min eig=${p2.directZeta9MinEigenvalue.toFixed(4)}, max ratio err=` +
        `${(p2.directZeta9MaxRatioRelErr * 100).toFixed(1)}%), whereas normalized fraction delta_9=arg(zeta_9)/pi=2/9 rad ` +
        `matches PDG charged leptons with m_mu/m_e=${p2.predMuOverE.toFixed(3)} vs ${p2.pdgMuOverE.toFixed(3)} ` +
        `(${(p2.relErrMuOverE * 100).toFixed(4)}%), m_tau/m_mu=${p2.predTauOverMu.toFixed(4)} vs ${p2.pdgTauOverMu.toFixed(4)} ` +
        `(${(p2.relErrTauOverMu * 100).toFixed(4)}%), phase-free m_tau=${p2.phaseFreeKoideMtauMeV.toFixed(3)} MeV ` +
        `(${(p2.phaseFreeKoideMtauRelErr * 100).toFixed(4)}%), and is the UNIQUE hit among all ${p2.rationalTotalCount} ` +
        `reduced rationals p/q (q<=12) at <0.05% (0/${p2.rationalTotalCount - 1} null false positives, in-window runner-up ` +
        `${p2.runnerUpInWindowRationalLabel} at ${(p2.runnerUpInWindowRationalMaxErr * 100).toFixed(1)}%, 0/6 F4/Z[zeta_9] ` +
        `angles, 0/39 pi/n, exact Bonferroni p_LEE=${p2.lookElsewhereProb45Rationals005Pct.toExponential(2)} at 0.05% and ` +
        `${p2.lookElsewhereProb45RationalsAtObservedErr.toExponential(2)} at observed err), with the 1/pi bridge ` +
        `explicitly flagged as an open empirical boundary (E-FRC-0066). ` +
        `Part 3 (exact Koide + {3,4,3,4} warp-shell theorem): for S_eff = W S(sqrt(2),delta) W with any positive ` +
        `diagonal warp W, Q(S_eff^2) = 2/3 + sum(w_i^2-w_j^2)^2/(6(sum w_i^2)^2) in [2/3, 1) identically and ` +
        `phase-independently (max err=${p3.warpTheoremPhaseInvarianceMaxErr.toExponential(2)}), keeping single-cusp ` +
        `leptons at Q=2/3, shifting staggered (0,2,3) quarks strictly upward through Q_down=${p3.qDownQuarksPdg.toFixed(4)} ` +
        `(eta=${p3.warpAtDownMatch.eta.toFixed(4)}) and Q_up=${p3.qUpQuarksPdg.toFixed(4)} (eta=${p3.warpAtUpMatch.eta.toFixed(4)}), ` +
        `and proving neutrinos (max Q_NO=${p3.neutrinoMaxQNormalOrdering.toFixed(4)}, Q_IO=${p3.neutrinoMaxQInvertedOrdering.toFixed(4)} < 2/3) ` +
        `cannot arise from any diagonal warp of S(sqrt(2),delta)`,
      metrics: {
        // Part 1
        f4TotalRoots: p1.f4TotalRoots,
        f4ShortRootsCount: p1.f4ShortRootsCount,
        f4LongRootsCount: p1.f4LongRootsCount,
        f4RatioFloat: Number(p1.f4RatioFloat.toFixed(6)),
        t3SymbolicAllExact:
          p1.t3SymbolicUnitaryExact &&
          p1.t3SymbolicOrder3Exact &&
          p1.t3SymbolicTracelessExact &&
          p1.t3SymbolicEigenvaluesExact
            ? 1
            : 0,
        symbolicQF4Float: Number(ratToNumber(p1.symbolicQF4Exact).toFixed(6)),
        positivityHalfWidthRad: Number(p1.positivityHalfWidthRad.toFixed(6)),
        phaseSweepCount: p1.phaseSweepCount,
        phaseSweepMaxQErrUnsigned: p1.phaseSweepMaxQErrUnsigned,
        phaseSweepMaxQErrSigned: p1.phaseSweepMaxQErrSigned,
        phaseSweepMaxAnalyticErr: p1.phaseSweepMaxAnalyticErr,
        scaleInvarianceMaxQErr: p1.scaleInvarianceMaxQErr,
        // Part 2
        zeta9ArgRad: Number(p2.zeta9ArgRad.toFixed(6)),
        zeta9ArgOverPi: Number(p2.zeta9ArgOverPi.toFixed(6)),
        pdgExtractedDeltaRad: Number(p2.pdgExtractedDeltaRad.toFixed(6)),
        delta9AbsDiffFromPdg: Number(p2.delta9AbsDiffFromPdg.toExponential(3)),
        pdgQ: Number(p2.pdgQ.toFixed(6)),
        predQ: Number(p2.predQ.toFixed(6)),
        qRelErrPct: Number((p2.qRelErr * 100).toFixed(5)),
        pdgMuOverE: Number(p2.pdgMuOverE.toFixed(4)),
        predMuOverE: Number(p2.predMuOverE.toFixed(4)),
        relErrMuOverEPct: Number((p2.relErrMuOverE * 100).toFixed(5)),
        pdgTauOverMu: Number(p2.pdgTauOverMu.toFixed(4)),
        predTauOverMu: Number(p2.predTauOverMu.toFixed(4)),
        relErrTauOverMuPct: Number((p2.relErrTauOverMu * 100).toFixed(5)),
        pdgTauOverE: Number(p2.pdgTauOverE.toFixed(3)),
        predTauOverE: Number(p2.predTauOverE.toFixed(3)),
        relErrTauOverEPct: Number((p2.relErrTauOverE * 100).toFixed(5)),
        predMeFromMuonScaleMeV: Number(p2.predMeFromMuonScaleMeV.toFixed(6)),
        predMtauFromMuonScaleMeV: Number(p2.predMtauFromMuonScaleMeV.toFixed(3)),
        phaseFreeKoideMtauMeV: Number(p2.phaseFreeKoideMtauMeV.toFixed(3)),
        phaseFreeKoideMtauRelErrPct: Number((p2.phaseFreeKoideMtauRelErr * 100).toFixed(5)),
        rationalTotalCount: p2.rationalTotalCount,
        rationalInWindowCount: p2.rationalInWindowCount,
        rationalHits005Pct: p2.rationalHits005Pct,
        rationalNullFalsePositives005Pct: p2.rationalNullFalsePositives005Pct,
        rationalEmpiricalHitRate005Pct: Number(p2.rationalEmpiricalHitRate005Pct.toFixed(5)),
        runnerUpRationalMaxErrPct: Number((p2.runnerUpRationalMaxErr * 100).toFixed(3)),
        runnerUpInWindowRationalMaxErrPct: Number(
          (p2.runnerUpInWindowRationalMaxErr * 100).toFixed(3),
        ),
        geometricAnglesHits005Pct: p2.geometricAnglesHits005Pct,
        piFractionHits005Pct: p2.piFractionHits005Pct,
        bestPiFractionMaxRatioErrPct: Number((p2.bestPiFractionMaxRatioErr * 100).toFixed(3)),
        continuousSecondaryIslands005Pct: p2.continuousSecondaryIslands005Pct,
        continuousAcceptanceWidthRad005Pct: Number(
          p2.continuousAcceptanceWidthRad005Pct.toExponential(3),
        ),
        continuousAcceptanceFraction005Pct: Number(
          p2.continuousAcceptanceFraction005Pct.toExponential(3),
        ),
        lookElsewhereProb45Rationals005Pct: Number(
          p2.lookElsewhereProb45Rationals005Pct.toExponential(3),
        ),
        lookElsewhereProbInWindowRationals005Pct: Number(
          p2.lookElsewhereProbInWindowRationals005Pct.toExponential(3),
        ),
        continuousAcceptanceWidthRadAtObservedErr: Number(
          p2.continuousAcceptanceWidthRadAtObservedErr.toExponential(3),
        ),
        lookElsewhereProb45AtObservedErr: Number(
          p2.lookElsewhereProb45RationalsAtObservedErr.toExponential(3),
        ),
        // Part 3
        qDownQuarksPdg: Number(p3.qDownQuarksPdg.toFixed(6)),
        qUpQuarksPdg: Number(p3.qUpQuarksPdg.toFixed(6)),
        qHeavyQuarksMixedPdg: Number(p3.qHeavyQuarksMixedPdg.toFixed(6)),
        neutrinoMaxQNormalOrdering: Number(p3.neutrinoMaxQNormalOrdering.toFixed(5)),
        neutrinoMaxQInvertedOrdering: Number(p3.neutrinoMaxQInvertedOrdering.toFixed(5)),
        warpTheoremPhaseInvarianceMaxErr: p3.warpTheoremPhaseInvarianceMaxErr,
        warpEtaDownMatch: Number(p3.warpAtDownMatch.eta.toFixed(5)),
        warpEtaUpMatch: Number(p3.warpAtUpMatch.eta.toFixed(5)),
        warpDownMatchedRatio3To2: Number(p3.warpAtDownMatch.ratio3To2.toFixed(3)),
        warpDownMatchedRatio2To1: Number(p3.warpAtDownMatch.ratio2To1.toFixed(3)),
        warpUpMatchedRatio3To2: Number(p3.warpAtUpMatch.ratio3To2.toFixed(3)),
        warpUpMatchedRatio2To1: Number(p3.warpAtUpMatch.ratio2To1.toFixed(3)),
        warpZeroModeEtaDown: Number(p3.warpFromZeroModeOverlapsEtaDown.toFixed(5)),
        warpZeroModeEtaUp: Number(p3.warpFromZeroModeOverlapsEtaUp.toFixed(5)),
        qcdRunningDownQAtMz: Number(p3.qcdRunningDownQAtMz.toFixed(5)),
        qcdRunningDownQAtGut: Number(p3.qcdRunningDownQAtGut.toFixed(5)),
        qcdRunningUpQAtMz: Number(p3.qcdRunningUpQAtMz.toFixed(5)),
        qcdRunningUpQAtGut: Number(p3.qcdRunningUpQAtGut.toFixed(5)),
      },
      control: {
        // Part 1 negative controls: non-sqrt(2) root ratios & outside-window phase
        qSimplyLacedR1: Number(ctrlADE.qFloat.toFixed(6)),
        qG2RSqrt3: Number(ctrlG2.qFloat.toFixed(6)),
        qSwappedR2Sqrt2Signed: Number(ctrlSwap.qFloat.toFixed(6)),
        outsideWindowMinEigenvalue: Number(p1.outsideWindowMinEigenvalue.toFixed(6)),
        outsideWindowQSigned: Number(p1.outsideWindowQSigned.toFixed(6)),
        outsideWindowQUnsigned: Number(p1.outsideWindowQUnsigned.toFixed(6)),
        // Part 2 negative controls: direct arg(zeta_9)=2*pi/9 rad fails, null rationals & geometric angles fail
        directZeta9MinEigenvalue: Number(p2.directZeta9MinEigenvalue.toFixed(6)),
        directZeta9MaxRatioRelErr: Number(p2.directZeta9MaxRatioRelErr.toFixed(4)),
        rationalNullFalsePositives005Pct: p2.rationalNullFalsePositives005Pct,
        geometricAnglesHits005Pct: p2.geometricAnglesHits005Pct,
        piFractionHits005Pct: p2.piFractionHits005Pct,
        // Part 3 controls: uniform warp gives exact 2/3, neutrinos stay strictly below 2/3
        warpEtaZeroQ: Number(p3.warpAtEtaZero.qNumerical.toFixed(6)),
        neutrinoMaxQNormalOrdering: Number(p3.neutrinoMaxQNormalOrdering.toFixed(5)),
        neutrinoMaxQInvertedOrdering: Number(p3.neutrinoMaxQInvertedOrdering.toFixed(5)),
      },
      notes:
        'Strict scientific honesty audit (L2, zero random numbers): ' +
        '(1) EXACT PARAMETER-FREE THEOREM (Tier A): S(r, delta) = v_0(I + (r/2)(e^{i delta} T_3 + e^{-i delta} T_3^dag)) ' +
        'with M = S^2 proves in exact BigInt rationals and Q(zeta_9) that Q(M) = (2 + r^2) / 6 identically across the ' +
        'positivity window |delta mod 2pi/3| <= pi/12, uniquely selecting r = sqrt(2) (F4 / B_n / C_n root-length ratio, ' +
        'with F4 being the unique 4D exceptional root system whose 24 long roots carry D4 triality) for Q = 2/3. ' +
        'Negative controls confirm r = 1 (A/D/E) -> Q = 1/2, r = sqrt(3) (G2) -> Q = 5/6, swapped r = 2*sqrt(2) -> Q_signed = 5/3. ' +
        'As noted in E-FRC-0061/0062, identifying diagonal = long-root scale and off-diagonal = short-root scale is the ' +
        'nearest-neighbour tight-binding scale assignment. ' +
        '(2) HONEST PHASE BOUNDARY (confronting E-FRC-0066): in Z[zeta_9][1/6], the direct root-of-unity angle is ' +
        'arg(zeta_9) = 2*pi/9 = 0.6981 rad, which lies OUTSIDE (-pi/12, pi/12) and FAILS badly (negative eigenvalue, ' +
        'mass ratios off by >50%). By contrast, the dimensionless fraction arg(zeta_9)/pi = 2/9 = 0.222222 taken in radians ' +
        `predicts charged-lepton mass ratios to ${(p2.relErrMuOverE * 100).toFixed(4)}% (m_mu/m_e) and ` +
        `${(p2.relErrTauOverMu * 100).toFixed(4)}% (m_tau/m_mu) and passes a strict ` +
        `look-elsewhere null sweep (unique hit out of 45 reduced rationals p/q with q <= 12, 0/6 F4/Z[zeta_9] angles, ` +
        `0/39 simple pi/n, exact Bonferroni p_LEE = ${p2.lookElsewhereProb45Rationals005Pct.toExponential(2)} at 0.05% ` +
        `and ${p2.lookElsewhereProb45RationalsAtObservedErr.toExponential(2)} at observed err). However, cos(2/9) is transcendental and NOT in Q(zeta_9): ` +
        'why the dimensionless fraction 2/9 enters in radians (an unexplained 1/pi bridge) remains an open dynamical question, ' +
        'not a geometric derivation. ' +
        '(3) WARP-SHELL SHIFT THEOREM & QUARK/NEUTRINO BOUNDARY: the exact identity Q(W S(sqrt(2), delta) W) = ' +
        '2/3 + sum_{i<j}(w_i^2 - w_j^2)^2 / (6 (sum w_i^2)^2) in [2/3, 1) proves without parameters that single-cusp-aligned ' +
        'leptons (W proportional to I_3) stay at Q = 2/3, any staggered {3,4,3,4} warp (such as E-FRC-0324 shells (0, 2, 3)) ' +
        'pushes Q strictly upward in the exact direction of Q_down = 0.7314 and Q_up = 0.8490, and neutrinos (Q <= 0.584 < 2/3) ' +
        'are provably unreachable by any diagonal warp (requiring Majorana/seesaw structure). The sector warp exponents ' +
        'eta_down and eta_up that match Q_down and Q_up are phenomenological fits, and individual quark mass ratios at those ' +
        'points still differ from PDG (down/up hierarchies require distinct sector Yukawa/QCD dynamics beyond a single W).',
    })
  },
})
