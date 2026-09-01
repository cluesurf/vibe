// The many-body Fock structure of the emergent walk, at scale. For free dynamics the N-fermion
// amplitude is the Slater determinant of single-particle walk propagator entries. That single
// fact carries the whole second-quantized structure: antisymmetry, Pauli exclusion (a determinant
// with equal rows vanishes identically), norm preservation, and it removes the exponential cost,
// so the many-body sector scales. Verified two ways: the determinant formula against a brute-force
// two-particle antisymmetric evolution on the full tensor product (exact match at machine
// precision), then the formula at scale for six fermions on a lattice too large for brute force,
// where exclusion and normalization hold exactly.
//
// The control is the two-boson permanent versus the two-fermion determinant on the same
// propagator: bosons bunch (higher same-site weight) where fermions show the Pauli crater (zero),
// so the statistics sign is physical, not notation.
//
// Depth L2. It verifies the exact Fock reduction of the free walk (Slater determinants of the
// propagator) against brute force, and exercises it at a scale brute force cannot reach, the
// many-body structure of the emergent layer.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  propagatorColumn,
  walkStep,
  determinantN,
  cAbs2,
  cAdd,
  cMul,
  type Complex,
} from '@/code/measure/exchange-statistics'

const SMALL_SIZE = 6
const SMALL_BEATS = 5
const MASS = 0.3
const LARGE_SIZE = 32
const LARGE_BEATS = 12
const ORBITALS = [0, 5, 11, 17, 23, 29]

export default experiment({
  id: 'quantum/fock-structure',
  code: 'E-QTM-0064',
  title:
    'the N-fermion walk amplitude is the Slater determinant of propagator entries (matched to brute force at machine precision), giving exact Pauli exclusion and unit norm at six particles, while bosons bunch by the permanent',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const dimension = 2 * SMALL_SIZE

    // the single-particle propagator for the small lattice
    const propagator: Complex[][] = []

    for (let from = 0; from < dimension; from++) {
      const column = propagatorColumn({
        from,
        size: SMALL_SIZE,
        mass: MASS,
        beats: SMALL_BEATS,
      })

      for (let x = 0; x < dimension; x++) {
        ;(propagator[x] ??= [])[from] = column[x]!
      }
    }

    // brute force: the antisymmetric pair state evolved on the full tensor product
    let pair: Complex[][] = Array.from({ length: dimension }, () =>
      Array.from({ length: dimension }, () => [0, 0] as Complex),
    )

    pair[0]![4] = [1 / Math.SQRT2, 0]
    pair[4]![0] = [-1 / Math.SQRT2, 0]

    for (let s = 0; s < SMALL_BEATS; s++) {
      const afterFirst: Complex[][] = Array.from(
        { length: dimension },
        () =>
          Array.from({ length: dimension }, () => [0, 0] as Complex),
      )

      for (let second = 0; second < dimension; second++) {
        const evolved = walkStep({
          vector: pair.map(row => row[second]!),
          size: SMALL_SIZE,
          mass: MASS,
        })

        for (let first = 0; first < dimension; first++) {
          afterFirst[first]![second] = evolved[first]!
        }
      }

      pair = afterFirst.map(row =>
        walkStep({ vector: row, size: SMALL_SIZE, mass: MASS }),
      )
    }

    // the determinant formula against brute force, every coordinate pair
    let worstMatch = 0

    for (let x1 = 0; x1 < dimension; x1++) {
      for (let x2 = 0; x2 < dimension; x2++) {
        const det = determinantN([
          [propagator[x1]![0]!, propagator[x1]![4]!],
          [propagator[x2]![0]!, propagator[x2]![4]!],
        ])

        worstMatch = Math.max(
          worstMatch,
          Math.hypot(
            pair[x1]![x2]![0] - det[0] / Math.SQRT2,
            pair[x1]![x2]![1] - det[1] / Math.SQRT2,
          ),
        )
      }
    }

    // at scale: six fermions on the large lattice, exclusion and normalization exact
    const largeColumns = ORBITALS.map(from =>
      propagatorColumn({
        from,
        size: LARGE_SIZE,
        mass: MASS,
        beats: LARGE_BEATS,
      }),
    )

    // Pauli: a repeated coordinate gives a determinant with equal rows, exactly zero
    const repeated = [3, 3, 10, 20, 30, 40].map(x =>
      largeColumns.map(column => column[x]!),
    )

    const pauliAmplitude = Math.sqrt(cAbs2(determinantN(repeated)))

    // normalization: orthonormal orbitals evolve to orthonormal, checked via the Gram matrix
    let worstGram = 0

    for (let a = 0; a < ORBITALS.length; a++) {
      for (let b = 0; b < ORBITALS.length; b++) {
        let inner: Complex = [0, 0]

        for (let x = 0; x < 2 * LARGE_SIZE; x++) {
          inner = cAdd(
            inner,
            cMul(
              [largeColumns[a]![x]![0], -largeColumns[a]![x]![1]],
              largeColumns[b]![x]!,
            ),
          )
        }

        const expected = a === b ? 1 : 0

        worstGram = Math.max(
          worstGram,
          Math.hypot(inner[0] - expected, inner[1]),
        )
      }
    }

    // CONTROL: bosons bunch where fermions crater, on the same two-orbital propagator
    const sameSite = [7, 7].map(x => [
      propagator[x]![0]!,
      propagator[x]![4]!,
    ])

    const bosonSameSite = cAbs2(
      cAdd(
        cMul(sameSite[0]![0]!, sameSite[1]![1]!),
        cMul(sameSite[0]![1]!, sameSite[1]![0]!),
      ),
    )

    const fermionSameSite = cAbs2(determinantN(sameSite))

    const formulaExact = worstMatch < 1e-12
    const pauliExact = pauliAmplitude < 1e-12
    const unitary = worstGram < 1e-12
    const statisticsSplit =
      fermionSameSite < 1e-12 && bosonSameSite > 1e-6

    const ok = formulaExact && pauliExact && unitary && statisticsSplit

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the two-fermion walk amplitude equals the Slater determinant of single-particle propagator entries at every coordinate pair to machine precision against brute-force antisymmetric evolution on the full tensor product, and the formula then scales where brute force cannot: six fermions on the large lattice have exactly zero amplitude at any repeated coordinate (Pauli exclusion as a determinant identity) and exactly orthonormal evolved orbitals (unit norm), while the two-boson permanent on the same propagator is finite at the same site where the fermion determinant vanishes (bunching versus the Pauli crater), so the free many-body Fock structure of the emergent layer is exact and scalable',
      metrics: {
        bruteForceMatch: Number(worstMatch.toExponential(2)),
        pauliAmplitude: Number(pauliAmplitude.toExponential(2)),
        gramError: Number(worstGram.toExponential(2)),
        bosonSameSite: Number(bosonSameSite.toExponential(2)),
      },
      // CONTROL: bosons are finite exactly where fermions vanish, the statistics sign is physical.
      control: {
        fermionSameSite: Number(fermionSameSite.toExponential(2)),
      },
      notes:
        'Free-walk Fock structure via Slater determinants of the propagator, matched to brute force then scaled to six fermions. With Hong-Ou-Mandel (E-QTM-0063) and Fermi exclusion (E-SPN-0014) this closes the many-body item of the coverage map for free dynamics; interacting field theory remains the research program.',
    })
  },
})
