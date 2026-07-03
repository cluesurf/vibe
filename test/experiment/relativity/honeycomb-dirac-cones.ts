// E-RLT-0040: the honeycomb two-site tight-binding model has exactly two isolated Dirac cones with
// linear isotropic dispersion, and both the square-lattice band (a Fermi LINE of zeros) and the
// staggered-mass model (a full gap) fail the same machinery. The Bloch off-diagonal is
// f(k) = 1 + exp(i k.a1) + exp(i k.a2), the band |E| = sqrt(|f|^2 + m^2). We MEASURE, on grids and
// rings, never assume: (a) |f(K)| = 0 to machine precision at the two computed K points and a
// two-resolution Brillouin-zone scan finds exactly two near-zero clusters, isolated (pixel count
// stays O(1) as the threshold scales down with resolution) and centred on the K points, (b) fits of
// |E| = v q through the origin on rays out of each cone give v = 3/2 (the exact tight-binding value
// in units of hopping times nearest-neighbour distance) with r^2 near 1, (c) the velocity is the
// same in 24 directions at small q, with the trigonal warping at larger q reported honestly.
// Controls that genuinely fail: the square lattice cos kx + cos ky puts its zeros on a LINE (one
// cluster whose pixel count grows with resolution, and a flat direction with v near 0), and a
// staggered mass m removes every zero (band minimum = m, no clusters), which is the sharp statement
// that the masslessness is protected by the sublattice symmetry (Semenoff 1984).
//
// L1: this is the known tight-binding mathematics of graphene (Wallace 1947), verified by
// measurement on the known Bloch Hamiltonian, not a dynamics on a lattice.

import {
  honeycombBandEnergy,
  honeycombBlochF,
  honeycombBlochFTorus,
  honeycombDiracPoints,
  squareLatticeBand,
} from '@/code/operator/bloch-band'
import { cAbs } from '@/code/algebra/linear/complex'
import {
  directionalConeVelocities,
  scanTorusZeroSet,
  torusFractionDistance,
} from '@/code/measure/brillouin-zone'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the exact tight-binding cone velocity, v = (3/2) t a for f = 1 + e^{ik.a1} + e^{ik.a2}
const EXACT_VELOCITY = 3 / 2

// two grid resolutions, coprime to 3 so no grid point sits on a K point by construction
const COARSE = 601
const FINE = 1201

// the near-zero threshold scales as 1/resolution, so an isolated conical zero keeps an O(1)
// pixel count while a zero line grows linearly
const thresholdFor = (resolution: number): number => 8 / resolution

// the reciprocal fractions of the two inequivalent Dirac points, where
// 1 + e^{2 pi i s1} + e^{2 pi i s2} = 0
const K_FRACTIONS = [
  { s1: 1 / 3, s2: 2 / 3 },
  { s1: 2 / 3, s2: 1 / 3 },
]

const DIRECTION_COUNT = 24
const SMALL_RADII = [0.001, 0.002, 0.003, 0.004, 0.005, 0.006]
const WARP_RADII = [0.4, 0.5, 0.6]

const massless = (kx: number, ky: number): number =>
  honeycombBandEnergy({ kx, ky })

const spread = (values: number[]): number => {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  return (max - min) / mean
}

export default experiment({
  id: 'relativity/honeycomb-dirac-cones',
  code: 'E-RLT-0040',
  title:
    'the honeycomb two-site cell gives exactly two isolated linear Dirac cones with v = 3/2, the square lattice gives a Fermi line and a staggered mass gaps them out',
  category: 'relativity',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    // (a) the two K points, computed from the reciprocal basis, kill f to machine precision
    const kPoints = honeycombDiracPoints()
    const fAtK = kPoints.map(k =>
      cAbs(honeycombBlochF({ kx: k.x, ky: k.y })),
    )

    const kPointsExact = fAtK.every(v => v < 1e-12)

    // (a) the Brillouin-zone scan at two resolutions: exactly two clusters, O(1) pixels, on K
    const scanHoneycomb = (resolution: number) =>
      scanTorusZeroSet({
        band: (s1, s2) => cAbs(honeycombBlochFTorus({ s1, s2 })),
        resolution,
        threshold: thresholdFor(resolution),
      })

    const coarse = scanHoneycomb(COARSE)
    const fine = scanHoneycomb(FINE)

    const twoZeros =
      coarse.clusterCount === 2 && fine.clusterCount === 2

    const isolated =
      Math.max(...coarse.clusterSizes, ...fine.clusterSizes) <= 40

    const centroidError = Math.max(
      ...K_FRACTIONS.map(expected =>
        Math.min(
          ...fine.clusterCentroids.map(c =>
            torusFractionDistance(c, expected),
          ),
        ),
      ),
    )

    const onKPoints = centroidError < 3 / FINE

    // (b) linear dispersion through the origin around each cone, v = 3/2
    const coneFits = kPoints.map(k =>
      directionalConeVelocities({
        energy: massless,
        centerX: k.x,
        centerY: k.y,
        radii: SMALL_RADII,
        directionCount: DIRECTION_COUNT,
      }),
    )

    const allVelocities = coneFits.flatMap(fit => fit.velocities)
    const worstR2 = Math.min(...coneFits.flatMap(fit => fit.rSquares))
    const velocityMean =
      allVelocities.reduce((a, b) => a + b, 0) / allVelocities.length

    const velocityError =
      Math.abs(velocityMean - EXACT_VELOCITY) / EXACT_VELOCITY

    const linear = worstR2 > 0.99999 && velocityError < 1e-3

    // (c) isotropy at small q, and the honest trigonal warping at larger q
    const isotropySmallQ = Math.max(
      ...coneFits.map(fit => spread(fit.velocities)),
    )

    const warpFit = directionalConeVelocities({
      energy: massless,
      centerX: kPoints[0]!.x,
      centerY: kPoints[0]!.y,
      radii: WARP_RADII,
      directionCount: DIRECTION_COUNT,
    })

    const warpSpreadLargeQ = spread(warpFit.velocities)
    const isotropic = isotropySmallQ < 5e-3

    // CONTROL 1: the square-lattice band, zeros form a line, not two isolated points.
    // Same scan, same thresholds: the cluster count is not 2, the pixel count grows with
    // resolution, and the point (pi/2, pi/2) on the zero line has a flat direction.
    const scanSquare = (resolution: number) =>
      scanTorusZeroSet({
        band: (s1, s2) =>
          squareLatticeBand({
            kx: 2 * Math.PI * s1,
            ky: 2 * Math.PI * s2,
          }),
        resolution,
        threshold: thresholdFor(resolution),
      })

    const squareCoarse = scanSquare(COARSE)
    const squareFine = scanSquare(FINE)
    const squareGrowth =
      (squareFine.clusterSizes[0] ?? 0) /
      Math.max(1, squareCoarse.clusterSizes[0] ?? 0)

    const squareFit = directionalConeVelocities({
      energy: (kx, ky) => Math.abs(squareLatticeBand({ kx, ky })),
      centerX: Math.PI / 2,
      centerY: Math.PI / 2,
      radii: SMALL_RADII,
      directionCount: DIRECTION_COUNT,
    })

    const squareMinVelocity = Math.min(...squareFit.velocities)
    const squareMaxVelocity = Math.max(...squareFit.velocities)

    const squareFails =
      squareCoarse.clusterCount !== 2 &&
      (squareCoarse.clusterSizes[0] ?? 0) > 200 &&
      squareGrowth > 1.5 &&
      squareMinVelocity < 0.01

    // CONTROL 2: a staggered on-site mass m opens the gap, sqrt(|f|^2 + m^2) >= m > 0
    // everywhere, so the same scan finds NO zeros and the band minimum is the mass.
    const mass = 0.1
    const massScan = scanTorusZeroSet({
      band: (s1, s2) =>
        Math.hypot(cAbs(honeycombBlochFTorus({ s1, s2 })), mass),
      resolution: COARSE,
      threshold: thresholdFor(COARSE),
    })

    const massBandMinimum = massScan.minimumOutsideClusters
    const massGapped =
      massScan.clusterCount === 0 &&
      massBandMinimum >= mass &&
      massBandMinimum < mass * 1.01

    const ok =
      kPointsExact &&
      twoZeros &&
      isolated &&
      onKPoints &&
      linear &&
      isotropic &&
      squareFails &&
      massGapped

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the honeycomb Bloch band has exactly two isolated zeros at the computed K points, the dispersion around each is linear and isotropic with measured v = 3/2 in hopping units, the square lattice yields a growing Fermi-line cluster with a flat direction instead, and a staggered mass 0.1 removes every zero with band minimum equal to the mass',
      metrics: {
        fAtK1: fAtK[0]!,
        fAtK2: fAtK[1]!,
        clusterCountCoarse: coarse.clusterCount,
        clusterCountFine: fine.clusterCount,
        largestClusterCoarse: coarse.clusterSizes[0] ?? 0,
        largestClusterFine: fine.clusterSizes[0] ?? 0,
        centroidError,
        velocityMean,
        velocityErrorVsExact: velocityError,
        worstR2,
        isotropySpreadSmallQ: isotropySmallQ,
        warpSpreadLargeQ,
      },
      control: {
        squareClusterCountCoarse: squareCoarse.clusterCount,
        squareLargestClusterCoarse: squareCoarse.clusterSizes[0] ?? 0,
        squareLargestClusterFine: squareFine.clusterSizes[0] ?? 0,
        squareClusterGrowth: squareGrowth,
        squareMinVelocity,
        squareMaxVelocity,
        massBandMinimum,
        massZeroClusters: massScan.clusterCount,
      },
      notes:
        'L1, the known tight-binding mathematics of the honeycomb lattice (Wallace 1947, Semenoff 1984, Castro Neto et al 2009), verified by measurement on the Bloch Hamiltonian, not derived from a dynamics. The two cones and v = 3/2 come from the two-site unit cell alone, and the mass control shows the masslessness is protected by sublattice symmetry, not fine-tuned. Trigonal warping at q of order 0.5 is real and reported in warpSpreadLargeQ. The vibe-side reading, stated as a reading, is that graphene is a laboratory case of Dirac transport emerging from a discrete lattice, the coarse-graining thesis observed in a real material.',
    })
  },
})
