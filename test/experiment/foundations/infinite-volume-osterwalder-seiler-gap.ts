// E-FND-0189: EXACT INFINITE-VOLUME 4D D_4 OSTERWALDER-SEILER SITE-HYPERPLANE REFLECTION POSITIVITY &
// FULL-CHARACTER STRONG-COUPLING MASS GAP, EXACT 2D a -> 0 MIGDAL-WITTEN CONTINUUM LIMIT, AND
// 4D D_4 GAUGE-COVARIANT POLAR-PROJECTED APE LINK SMEARING.
//
// Part 1:
//   1A. Exact BigInt 4D D_4 vs Z^4 plaquette combinatorics enumerated directly from rootsD4() and
//       hypercubicAxes(4): D_4 has 8 triangles/link, 96 touching each vertex (32 unoriented / 64 oriented
//       per site), d_tri(D_4) = 21, 6 orthogonal squares/link, 72 touching each vertex (18 per site),
//       d_sq(D_4) = 20, matching Z^4 benchmark d_p(Z^4) = 20 and E-FRC-0329's 256/256 BigInt D_4 isotropy.
//   1B. Exact 4D D_4 site-hyperplane reflection positivity across x_0 = 0 (all 24 roots have |r_0| <= 1,
//       Theta(D_4) = D_4 preserves parity, straddlingTrianglesCount = 0 across origin-incident and slab
//       translates, with 200 in-hyperplane S_0 triangles so S = S_+ + S_0 + Theta S_+ = (S_+ + S_0/2) +
//       Theta(S_+ + S_0/2) holds for all beta >= 0 and all volumes) plus Z_3 transfer-matrix positivity
//       on dim = 9 ridge and dim = 27 ring against an alternating-sign negative control.
//   1C. Exact full-character multi-plaquette Kotecky-Preiss / Osterwalder-Seiler infinite-volume (V -> infinity)
//       convergence criterion ((d_p + 1) / (e * d_p)) * (u^{n_min} / (1 - u)) <= a (d_p + 1 = 22 on D_4 tri
//       with n_min = 4, d_p + 1 = 21 on Z^4/D_4 sq with n_min = 6), with A_{Z3} = 2 * u_{Z3} and
//       A_{SU3}^{(<=6)} = sum_{1 <= p+q <= 6} (dim R)^2 (c_R / c_0) via exact Weyl character formula,
//       cross-checked against exact all-irrep Seiler sup-norm M_{SU3} = exp(beta) / c_0(beta) - 1,
//       certifying strict multi-plaquette radii beta_OS_KP = 0.009348 (Z_3, D_4 tri) and beta_OS_KP = 0.009328
//       (SU(3), D_4 tri) (keeping 1/(e * d_p) strictly as a 1-plaquette monomer upper diagnostic only).
//       Rigorous mass-gap lower bounds m_KP(beta) = ln(A_KP / M(beta)) across beta in [0.001, 0.002, 0.004,
//       0.006, 0.008] strictly inside beta_OS_KP are explicitly asserted strictly below the walk ceiling
//       -ln(M(beta)) - ln(21), with leading-order tube/tetrahedron expressions labeled as estimates only.
//
// Part 2:
//   Exact 2D SU(2) and Z_3 Migdal-Witten heat-kernel solutions (live Haar subdivision check <= 1e-13,
//   exact Casimir scaling) plus exact a -> 0 Wilson continuum limit across a = 0.25 .. 0.0078125
//   at exact O(a^2) rate (ratio -> 4.000, final rel err < 1e-5) against a fixed-beta 1024x divergence control.
//
// Part 3:
//   Gauge-Covariant Polar-Projected APE Link Smearing on a 4D D_4 Torus (L = 4, 128 sites, 1536 links,
//   4096 triangles) and the 22-vertex 14-staple single-link neighborhood: certifies exact local SU(3) gauge
//   covariance <= 1e-14, strict UV plaquette contraction < 0.5, against naive no-transport (> 1.0) and
//   Gram-Schmidt controls. Same-lattice APE smearing certifies the gauge-covariant UV-contraction kernel,
//   while full multi-scale Balaban fine-to-coarse decimation across g ~ O(1) and uniform IR cluster expansion
//   to beta -> infinity remain open.
//
// Depth L2: flat 4D Euclidean D_4 lattice (d4-box), 100% deterministic, zero RNG, runtime <= 5 s.

import { analyzeInfiniteVolumeOsterwalderSeilerGap } from '@/code/measure/infinite-volume-osterwalder-seiler-gap'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/infinite-volume-osterwalder-seiler-gap',
  code: 'E-FND-0189',
  title:
    'Exact infinite-volume 4D D_4 site-hyperplane reflection positivity and full-character Osterwalder-Seiler strong-coupling mass gap, exact 2D a -> 0 Migdal-Witten continuum limit, and 4D D_4 polar-projected APE link smearing',
  category: 'foundations',
  substrates: ['d4-box'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeInfiniteVolumeOsterwalderSeilerGap()
    const p1a = r.part1A
    const p1b = r.part1B
    const rp4d = p1b.d4SiteHyperplaneRP
    const p1c = r.part1C
    const p2 = r.part2
    const p3 = r.part3

    // Gate 1: Part 1A exact BigInt 4D D_4 vs Z^4 plaquette combinatorics & E-FRC-0329 cross-check
    const g1Combinatorics =
      p1a.d4RootCount === 24n &&
      p1a.d4UndirectedLinksPerSite === 12n &&
      p1a.d4TrianglesPerLink === 8n &&
      p1a.d4TrianglesPerLinkUniform &&
      p1a.d4TrianglesTouchingVertex === 96n &&
      p1a.d4UnorientedTrianglesPerSite === 32n &&
      p1a.d4OrientedTrianglesPerSite === 64n &&
      p1a.d4TriangleNeighborsDP === 21n &&
      p1a.d4TriangleNeighborsUniform &&
      p1a.d4TriangleMultiLinkOverlapPairs === 0n &&
      p1a.d4Chordless4CyclesAllOrthogonalSquares &&
      p1a.d4SquaresPerLink === 6n &&
      p1a.d4SquaresPerLinkUniform &&
      p1a.d4SquaresTouchingVertex === 72n &&
      p1a.d4SquaresPerSite === 18n &&
      p1a.d4SquareNeighborsDP === 20n &&
      p1a.d4SquareNeighborsUniform &&
      p1a.d4SquareMultiLinkOverlapPairs === 0n &&
      p1a.z4AxisCount === 8n &&
      p1a.z4SquaresPerLink === 6n &&
      p1a.z4SquaresTouchingVertex === 24n &&
      p1a.z4SquaresPerSite === 6n &&
      p1a.z4SquareNeighborsDP === 20n &&
      p1a.z4SquareNeighborsUniform &&
      p1a.e329IsotropyCrossCheckExact

    // Gate 2: Part 1B exact 4D D_4 site-hyperplane reflection positivity across x_0 = 0 + dim = 9 & 27 Z_3 slices + control
    const g2ReflectionPositivity =
      rp4d.d4RootsChecked === 24 &&
      rp4d.maxAbsRootX0 === 1 &&
      rp4d.allRootsThetaClosed &&
      rp4d.thetaPreservesSiteParity &&
      rp4d.originIncidentTrianglesCount === 96 &&
      rp4d.originOrientedTrianglesPerSite === 64 &&
      rp4d.originStraddlingCount === 0 &&
      rp4d.slabMaxSpanX0 === 1 &&
      rp4d.straddlingTrianglesCount === 0 &&
      rp4d.thetaBijectionExact &&
      rp4d.minClosedPolymerTriangles === 4 &&
      rp4d.tetrahedraTouchingOriginCount === 96 &&
      p1b.ridgeDim9.allStrictlyPositiveDefinite &&
      p1b.ridgeDim9.allObservablesNonNegative &&
      p1b.ridgeDim9.maxSqrtReconErrRel <= 1e-14 &&
      p1b.ridgeDim9.maxJacobiResidualRel <= 1e-14 &&
      p1b.ringDim27.allStrictlyPositiveDefinite &&
      p1b.ringDim27.allObservablesNonNegative &&
      p1b.ringDim27.maxSqrtReconErrRel <= 1e-14 &&
      p1b.ringDim27.maxJacobiResidualRel <= 1e-14 &&
      p1b.negativeControl.dim9ViolatesReflectionPositivity &&
      p1b.negativeControl.dim27ViolatesReflectionPositivity

    // Gate 3: Part 1C airtight multi-plaquette Kotecky-Preiss + full-character (dim R)^2 + Seiler sup-norm gap bounds
    const maxRadiusRes = Math.max(
      p1c.kpD4TriThreshold.stationarityResidual,
      p1c.kpZ4SqThreshold.stationarityResidual,
      p1c.radii.z3Z4.criterionResidual,
      p1c.radii.z3D4Tri.criterionResidual,
      p1c.radii.z3D4Sq.criterionResidual,
      p1c.radii.su3Z4.criterionResidual,
      p1c.radii.su3D4Tri.criterionResidual,
      p1c.radii.su3D4Sq.criterionResidual,
      p1c.radii.su3Z4.seilerCriterionResidual,
      p1c.radii.su3D4Tri.seilerCriterionResidual,
      p1c.radii.su3D4Sq.seilerCriterionResidual,
    )
    const g3InfiniteVolumeGap =
      p1c.su3IrrepsIncludedCount === 27 &&
      p1c.su3HaarNormErr <= 1e-14 &&
      p1c.su3CharOrthoErrAtBeta0 <= 1e-12 &&
      p1c.su3QuadConvergence28vs36 <= 1e-12 &&
      p1c.su3SmallBetaU3SeriesErrAt001 < 1e-9 &&
      p1c.su3SmallBetaActivitySeriesErrAt001 < 1e-6 &&
      p1c.su3CharVsSupNormMaxDiff <= 1e-12 &&
      p1c.z3ActivityVsSupNormErr <= 1e-14 &&
      p1c.z3CrossCheckE188Err <= 1e-14 &&
      p1c.kpD4TriThreshold.incompatiblePlaqCount === 22 &&
      p1c.kpD4TriThreshold.nMinPolymer === 4 &&
      p1c.kpZ4SqThreshold.incompatiblePlaqCount === 21 &&
      p1c.kpZ4SqThreshold.nMinPolymer === 6 &&
      p1c.radii.z3Z4.betaOSKP > 0.011 &&
      p1c.radii.z3Z4.betaOSKP < 0.0112 &&
      p1c.radii.z3D4Tri.betaOSKP > 0.0093 &&
      p1c.radii.z3D4Tri.betaOSKP < 0.0094 &&
      p1c.radii.su3Z4.betaOSKP > 0.011 &&
      p1c.radii.su3Z4.betaOSKP < 0.0112 &&
      p1c.radii.su3D4Tri.betaOSKP > 0.0093 &&
      p1c.radii.su3D4Tri.betaOSKP < 0.0094 &&
      Math.abs(p1c.radii.su3D4Tri.betaOSKP - p1c.radii.su3D4Tri.betaOSKPSeilerSupNorm) < 1e-11 &&
      maxRadiusRes <= 1e-12 &&
      p1c.allZ3RowsInsideRadiusStrictlyPositive &&
      p1c.allSu3RowsInsideRadiusStrictlyPositive &&
      p1c.allBoundsStrictlyBelowWalkCeiling &&
      p1c.allLiveGapsDominateRigorousKpBounds

    // Gate 4: Part 2 exact 2D Migdal-Witten heat-kernel & Wilson a -> 0 continuum limit (O(a^2), rel err < 1e-5)
    const g4TwoDMigdalWitten =
      p2.su2QuadPrecision48vs64AtFinest <= 1e-14 &&
      p2.su2HeatKernelSubdivisionMaxRelErr <= 1e-13 &&
      p2.su2HeatKernelZSpacingInvarianceErr <= 1e-10 &&
      p2.su2CasimirScalingMaxErr <= 1e-14 &&
      Math.abs(p2.su2FinalErrRatio - 4.0) < 1e-3 &&
      p2.su2FinalRelErr < 1e-5 &&
      p2.su2WilsonAreaLawMaxErrFinest < 2e-5 &&
      p2.z3HeatKernelZSpacingInvarianceErr <= 1e-10 &&
      Math.abs(p2.z3FinalErrRatio - 4.0) < 1e-3 &&
      p2.z3FinalRelErr < 1e-5 &&
      p2.z3WilsonAreaLawMaxErrFinest < 2e-5 &&
      Math.abs(p2.controlDivergenceFactor - 1024) < 1e-9

    // Gate 5: Part 3 4D D_4 gauge-covariant polar-projected APE link smearing, UV contraction < 0.5, controls & honesty
    const contr05 = p3.torusContractionRows.find(row => row.alpha === 0.5)!
    const contr07 = p3.torusContractionRows.find(row => row.alpha === 0.7)!
    const g5ApeSmearingAndHonesty =
      p3.neighborhoodTriStaples === 8 &&
      p3.neighborhoodSqStaples === 6 &&
      p3.neighborhoodVertices === 22 &&
      p3.neighborhoodLinks === 35 &&
      p3.maxSu3GaugeCovErrAcrossAlphas <= 1e-14 &&
      p3.maxSu3UnitErrAcrossAlphas <= 1e-14 &&
      p3.maxSu3DetErrAcrossAlphas <= 1e-14 &&
      p3.allZ3ExactCovariant &&
      p3.z3DefectHealedAtAlpha07 &&
      p3.torusSites === 128 &&
      p3.torusUndirectedLinks === 1536 &&
      p3.torusTriangles === 4096 &&
      p3.torusGlobalGaugeCovErrAt05 <= 1e-14 &&
      contr05.contractionRatio < 0.25 &&
      contr07.contractionRatio < 0.12 &&
      p3.torusBestContractionRatio < 0.5 &&
      contr05.maxUnitErrFrob <= 1e-14 &&
      contr05.maxDetErr <= 1e-14 &&
      contr07.maxUnitErrFrob <= 1e-14 &&
      contr07.maxDetErr <= 1e-14 &&
      p3.controlNaiveNoTransportCovErrAt05 > 0.5 &&
      p3.controlNaiveNoTransportCovErrAt07 > 1.0 &&
      p3.controlGramSchmidtLeftCovErr > 1e-3 &&
      p3.clayMillenniumBoundary.infiniteVolumeD4ReflectionPositivityProved &&
      p3.clayMillenniumBoundary.infiniteVolumeStrongCouplingGapProved &&
      p3.clayMillenniumBoundary.exact2DContinuumLimitMassGapProved &&
      p3.clayMillenniumBoundary.fourDD4ApeCovariantSmearingProved &&
      p3.clayMillenniumBoundary.fourDMultiScaleBalabanDecimationOpen &&
      p3.clayMillenniumBoundary.fourDUniformIrClusterToBetaInfinityOpen &&
      r.totalSeconds <= 5.0

    const ok =
      g1Combinatorics &&
      g2ReflectionPositivity &&
      g3InfiniteVolumeGap &&
      g4TwoDMigdalWitten &&
      g5ApeSmearingAndHonesty

    const row001 = p1c.gapRows[0]!
    const row004 = p1c.gapRows[2]!
    const row008 = p1c.gapRows[4]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1A (exact BigInt 4D D_4 vs Z^4 plaquette combinatorics): D_4 has ${p1a.d4TrianglesPerLink} triangles/link (${p1a.d4TrianglesTouchingVertex} touching vertex, ${p1a.d4UnorientedTrianglesPerSite} unoriented / ${p1a.d4OrientedTrianglesPerSite} oriented per site, d_tri=${p1a.d4TriangleNeighborsDP}, Delta_p=d_tri+1=22) ` +
        `and ${p1a.d4SquaresPerLink} orthogonal squares/link (${p1a.d4SquaresTouchingVertex} touching vertex, d_sq=${p1a.d4SquareNeighborsDP}), matching Z^4 d_p=${p1a.z4SquareNeighborsDP}. ` +
        `Part 1B (exact 4D D_4 site-hyperplane reflection positivity across x_0=0 + Z_3 transfer slices): all 24 D_4 roots satisfy |r_0| <= ${rp4d.maxAbsRootX0} and Theta(D_4)=D_4, ` +
        `with ${rp4d.straddlingTrianglesCount} straddling triangles across all ${rp4d.originIncidentTrianglesCount} origin-incident triangles and ${rp4d.slabTrianglesEnumerated} slab translates (${rp4d.slabPositiveHalfCount} H_+ <-> ${rp4d.slabNegativeHalfCount} H_- exact bijection plus ${rp4d.slabHyperplaneX0Count} in-hyperplane S_0 triangles giving S = S_+ + S_0 + Theta S_+, minimal closed D_4 polymer = ${rp4d.minClosedPolymerTriangles}-triangle tetrahedron). ` +
        `Z_3 dim=9 and dim=27 transfer matrices are strictly positive-definite across beta in [0.05..8.0] (T=B^T B err <= ${Math.max(p1b.ridgeDim9.maxSqrtReconErrRel, p1b.ringDim27.maxSqrtReconErrRel).toExponential(1)}), while alternating-sign control violates RP (lambda_min=${p1b.negativeControl.dim9LambdaMin.toExponential(2)}). ` +
        `Part 1C (rigorous multi-plaquette Kotecky-Preiss V -> infinity convergence, Delta_p=d_p+1, n_min=4 on D_4 tri / n_min=6 on Z^4 sq, A_KP(D_4 tri)=${p1c.kpD4TriThreshold.activityKpCrit.toFixed(6)}): ` +
        `Z_3 full activity A_{Z3}=2 u_{Z3} gives beta_OS_KP(Z_3, D_4 tri)=${p1c.radii.z3D4Tri.betaOSKP.toFixed(6)}, beta_OS_KP(Z_3, Z^4)=${p1c.radii.z3Z4.betaOSKP.toFixed(6)}. ` +
        `SU(3) exact Weyl character sum over all ${p1c.su3IrrepsIncludedCount} irreps (1 <= p+q <= 6) agrees with Seiler sup-norm exp(beta)/c_0 - 1 to ${p1c.su3CharVsSupNormMaxDiff.toExponential(1)} and certifies ` +
        `beta_OS_KP(SU(3), D_4 tri)=${p1c.radii.su3D4Tri.betaOSKP.toFixed(6)} (Seiler ${p1c.radii.su3D4Tri.betaOSKPSeilerSupNorm.toFixed(6)}), beta_OS_KP(SU(3), Z^4)=${p1c.radii.su3Z4.betaOSKP.toFixed(6)} (1-plaquette monomer upper diagnostic 1/(e*21) gives beta=${p1c.radii.z3D4Tri.monomerBetaDiagnostic.toFixed(6)} only). ` +
        `All 5 test couplings beta in [0.001, 0.002, 0.004, 0.006, 0.008] lie strictly inside beta_OS_KP with rigorous walk-ceiling-safe KP lower bounds (at beta=0.004: Z_3 m_KP=${row004.z3MultiPlaqKpGapBound.toFixed(4)} < walkCeiling=${row004.z3WalkCeiling.toFixed(4)}, SU(3) m_KP=${row004.su3MultiPlaqKpGapBound.toFixed(4)} < walkCeiling=${row004.su3WalkCeiling.toFixed(4)}, rigorous P=3 tube KP=${row004.z3RigorousPerim3TubeKpBound.toFixed(4)}, live dim=27=${row004.liveGapDim27.toFixed(4)}; non-rigorous leading-order tube estimate=${row004.z3LeadingOrderTubeEstimate.toFixed(4)}). ` +
        `Part 2 (exact 2D a -> 0 Migdal-Witten continuum limit): SU(2) gluing err=${p2.su2HeatKernelSubdivisionMaxRelErr.toExponential(1)}, sigma_lat -> 3/8 at O(a^2) ratio=${p2.su2FinalErrRatio.toFixed(5)} (rel err=${p2.su2FinalRelErr.toExponential(2)}), Z_3 sigma_lat -> 0.5 at ratio=${p2.z3FinalErrRatio.toFixed(5)}. ` +
        `Part 3 (Gauge-Covariant Polar-Projected APE Link Smearing on a 4D D_4 Torus L=4, 128 sites): local SU(3) gauge covariance <= ${p3.maxSu3GaugeCovErrAcrossAlphas.toExponential(1)} (torus <= ${p3.torusGlobalGaugeCovErrAt05.toExponential(1)}), UV action shrinks by ${contr05.contractionRatio.toFixed(4)} (alpha=0.5) and ${contr07.contractionRatio.toFixed(4)} (alpha=0.7), against naive no-transport (${p3.controlNaiveNoTransportCovErrAt07.toFixed(3)}) and Gram-Schmidt controls, runtime=${r.totalSeconds.toFixed(3)}s. ` +
        `Honest boundary: multi-scale Balaban fine-to-coarse decimation across g ~ O(1) and extending 4D IR cluster expansion uniformly to beta -> infinity remain open`,
      metrics: {
        g1Combinatorics: g1Combinatorics ? 1 : 0,
        g2ReflectionPositivity: g2ReflectionPositivity ? 1 : 0,
        g3InfiniteVolumeGap: g3InfiniteVolumeGap ? 1 : 0,
        g4TwoDMigdalWitten: g4TwoDMigdalWitten ? 1 : 0,
        g5ApeSmearingAndHonesty: g5ApeSmearingAndHonesty ? 1 : 0,
        // Part 1A
        p1aD4TrianglesPerLink: Number(p1a.d4TrianglesPerLink),
        p1aD4TrianglesTouchingVertex: Number(p1a.d4TrianglesTouchingVertex),
        p1aD4UnorientedTrianglesPerSite: Number(p1a.d4UnorientedTrianglesPerSite),
        p1aD4OrientedTrianglesPerSite: Number(p1a.d4OrientedTrianglesPerSite),
        p1aD4TriangleNeighborsDP: Number(p1a.d4TriangleNeighborsDP),
        p1aD4SquaresPerLink: Number(p1a.d4SquaresPerLink),
        p1aD4SquaresTouchingVertex: Number(p1a.d4SquaresTouchingVertex),
        p1aD4SquareNeighborsDP: Number(p1a.d4SquareNeighborsDP),
        p1aZ4SquareNeighborsDP: Number(p1a.z4SquareNeighborsDP),
        // Part 1B (exact 4D D_4 site-hyperplane RP + transfer matrices)
        p1bD4MaxAbsRootX0: rp4d.maxAbsRootX0,
        p1bD4OriginTriangles: rp4d.originIncidentTrianglesCount,
        p1bD4SlabTriangles: rp4d.slabTrianglesEnumerated,
        p1bD4HyperplaneS0Triangles: rp4d.slabHyperplaneX0Count,
        p1bD4StraddlingTriangles: rp4d.straddlingTrianglesCount,
        p1bD4MinClosedPolymerTriangles: rp4d.minClosedPolymerTriangles,
        p1bD4TetrahedraTouchingOrigin: rp4d.tetrahedraTouchingOriginCount,
        p1bDim9GlobalMinLambda: p1b.ridgeDim9.globalMinLambda,
        p1bDim9MaxSqrtReconErr: p1b.ridgeDim9.maxSqrtReconErrRel,
        p1bDim27GlobalMinLambda: p1b.ringDim27.globalMinLambda,
        p1bDim27MaxSqrtReconErr: p1b.ringDim27.maxSqrtReconErrRel,
        // Part 1C (rigorous multi-plaquette KP + full character (dim R)^2 + Seiler sup-norm)
        p1cSu3IrrepsIncluded: p1c.su3IrrepsIncludedCount,
        p1cSu3HaarNormErr: p1c.su3HaarNormErr,
        p1cSu3CharOrthoErrAtBeta0: p1c.su3CharOrthoErrAtBeta0,
        p1cSu3QuadConvErr: p1c.su3QuadConvergence28vs36,
        p1cSu3CharVsSupNormMaxDiff: p1c.su3CharVsSupNormMaxDiff,
        p1cKpD4TriActivityCrit: Number(p1c.kpD4TriThreshold.activityKpCrit.toFixed(8)),
        p1cKpD4TriUStar: Number(p1c.kpD4TriThreshold.uStar.toFixed(8)),
        p1cKpD4TriAStar: Number(p1c.kpD4TriThreshold.aStar.toFixed(8)),
        p1cKpD4TriXMax: Number(p1c.kpD4TriThreshold.xMax.toFixed(8)),
        p1cKpZ4SqActivityCrit: Number(p1c.kpZ4SqThreshold.activityKpCrit.toFixed(8)),
        p1cBetaOsKpZ3Z4: Number(p1c.radii.z3Z4.betaOSKP.toFixed(6)),
        p1cBetaOsKpZ3D4Tri: Number(p1c.radii.z3D4Tri.betaOSKP.toFixed(6)),
        p1cBetaOsKpZ3D4Sq: Number(p1c.radii.z3D4Sq.betaOSKP.toFixed(6)),
        p1cBetaOsKpSu3Z4: Number(p1c.radii.su3Z4.betaOSKP.toFixed(6)),
        p1cBetaOsKpSu3D4Tri: Number(p1c.radii.su3D4Tri.betaOSKP.toFixed(6)),
        p1cBetaOsKpSu3D4TriSeiler: Number(p1c.radii.su3D4Tri.betaOSKPSeilerSupNorm.toFixed(6)),
        p1cBetaOsKpSu3D4Sq: Number(p1c.radii.su3D4Sq.betaOSKP.toFixed(6)),
        p1cZ3KpGapBoundBeta001: Number(row001.z3MultiPlaqKpGapBound.toFixed(6)),
        p1cZ3KpGapBoundBeta004: Number(row004.z3MultiPlaqKpGapBound.toFixed(6)),
        p1cZ3KpGapBoundBeta008: Number(row008.z3MultiPlaqKpGapBound.toFixed(6)),
        p1cZ3WalkCeilingBeta004: Number(row004.z3WalkCeiling.toFixed(6)),
        p1cSu3KpGapBoundBeta001: Number(row001.su3MultiPlaqKpGapBound.toFixed(6)),
        p1cSu3KpGapBoundBeta004: Number(row004.su3MultiPlaqKpGapBound.toFixed(6)),
        p1cSu3KpGapBoundBeta008: Number(row008.su3MultiPlaqKpGapBound.toFixed(6)),
        p1cSu3WalkCeilingBeta004: Number(row004.su3WalkCeiling.toFixed(6)),
        p1cZ3RigorousTubeP3KpBeta004: Number(row004.z3RigorousPerim3TubeKpBound.toFixed(6)),
        p1cZ3LeadingOrderTubeEstBeta004: Number(row004.z3LeadingOrderTubeEstimate.toFixed(6)),
        p1cZ3LeadingOrderTetEstBeta004: Number(row004.z3LeadingOrderTetrahedronEstimate.toFixed(6)),
        p1cLiveGapDim27Beta004: Number(row004.liveGapDim27.toFixed(6)),
        p1cLiveGapDim27Beta008: Number(row008.liveGapDim27.toFixed(6)),
        p1cAllBoundsStrictlyBelowWalkCeiling: p1c.allBoundsStrictlyBelowWalkCeiling ? 1 : 0,
        // Part 2
        p2Su2SigmaExact: p2.su2SigmaExact,
        p2Su2MPhysExact: Number(p2.su2MPhysExact.toFixed(8)),
        p2Su2QuadPrec48vs64: p2.su2QuadPrecision48vs64AtFinest,
        p2Su2HeatKernelSubdivRelErr: p2.su2HeatKernelSubdivisionMaxRelErr,
        p2Su2FinalErrRatio: Number(p2.su2FinalErrRatio.toFixed(6)),
        p2Su2FinalRelErr: p2.su2FinalRelErr,
        p2Z3SigmaExact: p2.z3SigmaExact,
        p2Z3FinalErrRatio: Number(p2.z3FinalErrRatio.toFixed(6)),
        p2Z3FinalRelErr: p2.z3FinalRelErr,
        // Part 3 (APE link smearing)
        p3NeighborhoodTriStaples: p3.neighborhoodTriStaples,
        p3NeighborhoodSqStaples: p3.neighborhoodSqStaples,
        p3MaxSu3GaugeCovErr: p3.maxSu3GaugeCovErrAcrossAlphas,
        p3MaxSu3UnitErr: p3.maxSu3UnitErrAcrossAlphas,
        p3MaxSu3DetErr: p3.maxSu3DetErrAcrossAlphas,
        p3TorusSites: p3.torusSites,
        p3TorusLinks: p3.torusUndirectedLinks,
        p3TorusTriangles: p3.torusTriangles,
        p3TorusGlobalGaugeCovErr: p3.torusGlobalGaugeCovErrAt05,
        p3TorusContractionAt05: Number(contr05.contractionRatio.toFixed(6)),
        p3TorusContractionAnalytic05: Number(contr05.analyticPrediction.toFixed(6)),
        p3TorusContractionAt07: Number(contr07.contractionRatio.toFixed(6)),
        p3TorusContractionAnalytic07: Number(contr07.analyticPrediction.toFixed(6)),
        totalSeconds: Number(r.totalSeconds.toFixed(4)),
      },
      control: {
        rpBadDim9LambdaMin: p1b.negativeControl.dim9LambdaMin,
        rpBadDim9WitnessQuadForm: p1b.negativeControl.dim9NegativeWitnessQuadForm,
        rpBadDim27LambdaMin: p1b.negativeControl.dim27LambdaMin,
        rpBadDim27WitnessQuadForm: p1b.negativeControl.dim27NegativeWitnessQuadForm,
        monomerUpperDiagnosticD4Tri: Number(p1c.kpD4TriThreshold.monomerUpperDiagnostic.toFixed(6)),
        monomerBetaDiagnosticZ3D4Tri: Number(p1c.radii.z3D4Tri.monomerBetaDiagnostic.toFixed(6)),
        monomerBetaDiagnosticSu3D4Tri: Number(p1c.radii.su3D4Tri.monomerBetaDiagnostic.toFixed(6)),
        mwControlFixedBeta: p2.controlFixedBeta,
        mwControlSigmaCoarse: Number(p2.controlFixedBetaSigmaAtCoarsest.toFixed(6)),
        mwControlSigmaFine: Number(p2.controlFixedBetaSigmaAtFinest.toFixed(4)),
        mwControlDivergenceFactor: p2.controlDivergenceFactor,
        apeNaiveNoTransportErr05: Number(p3.controlNaiveNoTransportCovErrAt05.toFixed(6)),
        apeNaiveNoTransportErr07: Number(p3.controlNaiveNoTransportCovErrAt07.toFixed(6)),
        apeGramSchmidtLeftCovErr: Number(p3.controlGramSchmidtLeftCovErr.toFixed(6)),
        fourDMultiScaleBalabanDecimationOpen: p3.clayMillenniumBoundary
          .fourDMultiScaleBalabanDecimationOpen
          ? 1
          : 0,
        fourDUniformIrClusterToBetaInfinityOpen: p3.clayMillenniumBoundary
          .fourDUniformIrClusterToBetaInfinityOpen
          ? 1
          : 0,
      },
      notes:
        'E-FND-0189 (flat 4D Euclidean D_4 lattice, substrates: d4-box, L2, 100% deterministic, zero RNG): ' +
        '(1) INFINITE-VOLUME 4D D_4 SITE-HYPERPLANE REFLECTION POSITIVITY & MULTI-PLAQUETTE KOTECKY-PREISS GAP: ' +
        `every D_4 root has |r_0| <= 1 and Theta(D_4) = D_4, yielding 0 straddling triangles across x_0 = 0 and ${rp4d.slabHyperplaneX0Count} in-hyperplane S_0 triangles (proving S = S_+ + S_0 + Theta S_+ = (S_+ + S_0/2) + Theta(S_+ + S_0/2) for all beta >= 0 and all volumes). ` +
        'Full character-weighted polymer activities A_{Z3} = 2 u_{Z3} and A_{SU3}^{(<=6)} = sum (dim R)^2 (c_R/c_0) cross-checked against Seiler sup-norm exp(beta)/c_0 - 1 ' +
        `with rigorous multi-plaquette KP (Delta_p = d_p + 1 = 22, n_min = 4 on D_4 tri; A_KP = ${p1c.kpD4TriThreshold.activityKpCrit.toFixed(6)}) certify beta_OS_KP(Z_3, D_4 tri) = ${p1c.radii.z3D4Tri.betaOSKP.toFixed(6)} and beta_OS_KP(SU(3), D_4 tri) = ${p1c.radii.su3D4Tri.betaOSKP.toFixed(6)} ` +
        '(1-plaquette monomer 1/(e*21) kept strictly as an upper diagnostic only). All 5 test couplings beta in [0.001, 0.002, 0.004, 0.006, 0.008] lie strictly inside beta_OS_KP with rigorous KP mass-gap lower bounds m_KP(beta) = ln(A_KP / M(beta)) strictly below the combinatorial walk ceiling -ln(M) - ln(21). ' +
        '(2) EXACT 2D a -> 0 MIGDAL-WITTEN CONTINUUM LIMIT: SU(2) and Z_3 Wilson actions converge at exact O(a^2) rate (ratio -> 4.000, rel err < 1e-5) against a 1024x fixed-beta divergence control. ' +
        '(3) GAUGE-COVARIANT POLAR-PROJECTED APE LINK SMEARING ON A 4D D_4 TORUS (L = 4, 128 sites): proves exact local SU(3) gauge covariance <= 1e-14 and UV action contraction < 0.5, ' +
        'certifying the gauge-covariant UV-contraction kernel used in blocking steps. ' +
        p3.clayMillenniumBoundary.summary,
    })
  },
})
