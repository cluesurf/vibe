// EXACT UNSCREENED 1/r SLOPE & GEOMETRIC NEWTON COUPLING G_eff FROM PARAMETER-FREE PAIR-DENSITY WARP 1/N_D^2
// (E-GRV-0157, gaps B-52, m-10; resolves the small-box G(L/2) subtraction bias in E-GRV-0156).
//
// Depth L2: exact {3,4,3,4} column counts (N_D = 1, 18, 330, 6034; canonical unaliased single-face lateral links
// [1, 4, 20, 100], cumulative m_D = 5^D), exact Riccati Schur complement,
// exact 1/48 octahedral-wedge momentum sum on side = 32 & 64 with Madelung finite-size correction. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runPairDensityGravitySlope } from '@/code/measure/pair-density-gravity-slope'

export default experiment({
  id: 'gravity/pair-density-gravity-slope',
  code: 'E-GRV-0157',
  title:
    'Exact unscreened 1/r slope, floor-independent geometric Newton coupling G_eff, and 1/r^2 2-body force from parameter-free pair-density warp w(D) = 1/N_D^2 on side = 64',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runPairDensityGravitySlope()

    // Gate 0: numerical integrity (1/48 wedge matches full sum, Watson G_3D(0) & Bessel reference exact, side 32->64 converges)
    const i0 =
      res.orbitCountOk64 &&
      res.wedgeVsFullMaxErr16 < 1e-14 &&
      res.watsonOriginRelErr64 < 1e-5 &&
      res.besselMassiveCheckRelErr < 1e-10 &&
      res.maxRelDiffSide32Vs64InfR1to6 < 1e-3

    // Gate 1: exact unscreened 1/r gravity on side = 64:
    //   - continuum far-field slope (r = 4..12 and r = 6..12) within -1.00 +- 0.03,
    //   - near+mid slopes (r = 1..8, r = 2..10) match exact 3D simple cubic lattice G_3D(r)/K_eff to < 1e-3,
    //   - flatness within 1% of 1.000: both |4*pi*K_eff*r*G(r) - 1| < 1% for r = 6..12 AND |G_warped/(G_3D/K_eff) - 1| < 1e-3 for r = 2..10
    const g1Slope =
      Math.abs(res.slope4to12Madelung64 + 1) <= 0.03 &&
      Math.abs(res.slope4to12Inf64 + 1) <= 0.03 &&
      Math.abs(res.slope6to12Inf64 + 1) <= 0.03 &&
      Math.abs(res.slope1to8Side64 - res.slope1to8Cubic3D64) < 1e-3 &&
      Math.abs(res.slope2to10Side64 - res.slope2to10Cubic3D64) < 1e-3
    const g1Flat =
      res.maxContinuumFlatnessErrR6to12 <= 0.01 &&
      res.maxLatticeMatchErrR2to10 <= 1e-3

    // Gate 2: floor-independent geometric stiffness K_eff & Newton coupling G_eff across F = 6, 9, 12, 16
    const rList = res.floorConvergence.map(e => e.resistanceToFloor)
    const resDiverges =
      rList[1]! > rList[0]! && rList[2]! > rList[1]! && rList[3]! > rList[2]!
    const g2Floor =
      resDiverges &&
      res.kEffDiffF16VsF12 < 1e-10 &&
      res.maxFieldDiffF16VsF12 < 1e-10

    // Gate 3: 2-body pair-overlap potential V_12(r) = -G_warped(r) monotonic attraction & 1/r^2 force
    const g3Force =
      res.strictlyMonotonicAttraction &&
      Math.abs(res.forceSlopeCtrR6to12 + 2) <= 0.08 &&
      Math.abs(res.forceSlopeMidR5to12 + 2) <= 0.08 &&
      res.maxForceLatticeMatchErrR2to10 <= 1e-3

    // Gate 4: unweighted raw bulk control w(D) = 1 screens exponentially on the exact same side = 64 grid
    const g4Control = res.rawRatio5to1 < 1e-4

    const ok = i0 && g1Slope && g1Flat && g2Floor && g3Force && g4Control

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Parameter-free pair-density warp w(D) = 1/N_D^2 on side = 64 (1/48 wedge: ${res.wedgePoints64} points, Madelung-corrected) ` +
        `matches the exact infinite-volume 3D simple cubic lattice Green's function G_3D(r)/K_eff to ` +
        `${(res.maxLatticeMatchErrR2to10 * 100).toFixed(4)}% across r=2..10, recovers exact continuum 1/r slope ` +
        `${res.slope4to12Madelung64.toFixed(4)} (r=4..12 Madelung) / ${res.slope6to12Inf64.toFixed(4)} (r=6..12 inf) ` +
        `with 4*pi*K_eff*r*G(r) within ${(res.maxContinuumFlatnessErrR6to12 * 100).toFixed(2)}% of 1.000 (r=6..12), ` +
        `floor-independent geometric stiffness K_eff = ${res.kEffF16.toFixed(8)} (|K(16)-K(12)| = ${res.kEffDiffF16VsF12.toExponential(2)}), ` +
        `dimensionless Newton coupling G_eff = ${res.gEffF16.toFixed(8)}, and strictly monotonic 2-body attraction with ` +
        `1/r^2 force slope ${res.forceSlopeCtrR6to12.toFixed(4)} (ctr r=6..12) / ${res.forceSlopeMidR5to12.toFixed(4)} (mid r=5..12) ` +
        `vs raw bulk control G(5)/G(1) = ${res.rawRatio5to1.toExponential(2)}`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1Slope: g1Slope ? 1 : 0,
        g1Flat: g1Flat ? 1 : 0,
        g2Floor: g2Floor ? 1 : 0,
        g3Force: g3Force ? 1 : 0,
        g4Control: g4Control ? 1 : 0,
        wedgePoints64: res.wedgePoints64,
        wedgeVsFullMaxErr16: res.wedgeVsFullMaxErr16,
        watsonOriginRelErr64: res.watsonOriginRelErr64,
        besselMassiveCheckRelErr: res.besselMassiveCheckRelErr,
        kEffF12: res.kEffF12,
        kEffF16: res.kEffF16,
        kEffInfiniteSeries: res.kEffInfiniteSeries,
        kEffDiffF16VsF12: res.kEffDiffF16VsF12,
        gEffF16: res.gEffF16,
        maxFieldDiffF16VsF12: res.maxFieldDiffF16VsF12,
        maxRelDiffSide32Vs64MadelungR1to6: res.maxRelDiffSide32Vs64MadelungR1to6,
        maxRelDiffSide32Vs64InfR1to6: res.maxRelDiffSide32Vs64InfR1to6,
        slope1to8Side64: res.slope1to8Side64,
        slope1to8Cubic3D64: res.slope1to8Cubic3D64,
        slope2to10Side64: res.slope2to10Side64,
        slope2to10Cubic3D64: res.slope2to10Cubic3D64,
        slope3to10Madelung64: res.slope3to10Madelung64,
        slope4to12Madelung64: res.slope4to12Madelung64,
        slope4to12Inf64: res.slope4to12Inf64,
        slope6to12Inf64: res.slope6to12Inf64,
        maxLatticeMatchErrR2to10: res.maxLatticeMatchErrR2to10,
        maxContinuumFlatnessErrR6to12: res.maxContinuumFlatnessErrR6to12,
        forceSlopeCtrR2to9: res.forceSlopeCtrR2to9,
        forceSlopeCtrCubic3DR2to9: res.forceSlopeCtrCubic3DR2to9,
        forceSlopeCtrR6to12: res.forceSlopeCtrR6to12,
        forceSlopeMidR5to12: res.forceSlopeMidR5to12,
        maxForceLatticeMatchErrR2to10: res.maxForceLatticeMatchErrR2to10,
        warpedResF6: rList[0]!,
        warpedResF9: rList[1]!,
        warpedResF12: rList[2]!,
        warpedResF16: rList[3]!,
      },
      control: {
        period2TorusKEffF16: res.period2TorusComparison.kEffF16,
        period2TorusGEffF16: res.period2TorusComparison.gEffF16,
        period2TorusKEffRelShiftVsCanonical: res.period2TorusComparison.kEffRelShiftVsCanonical,
        rawResistanceF12: res.rawResistanceF12,
        rawHuskG1: res.rawHuskG1,
        rawHuskG2: res.rawHuskG2,
        rawHuskG5: res.rawHuskG5,
        rawRatio2to1: res.rawRatio2to1,
        rawRatio5to1: res.rawRatio5to1,
      },
      notes:
        'At r = 1..2 along the cubic axis (r,0,0), even the exact massless 3D simple cubic lattice Green function G_3D has an O(1/r^2) quadrupole UV correction (+8.15% at r=1, +7.79% at r=2) and centered difference -(V(r+1)-V(r-1))/2 of 1/r equals 1/(r^2-1). G_warped matches exact G_3D/K_eff to 0.0013% across r=2..10 and enters the <1% continuum 1/r and 1/r^2 regime for r >= 6.',
    })
  },
})
