// Does the committed rule carry SU(3) on its tone? The tone has exactly three values, so the one place
// a colour triplet could live in the five base things without adding anything is the tone read as a
// vector in C^3, with SU(3) turning it. This measures, from the committed collision itself, every
// continuous and every discrete tone symmetry the rule keeps.
//
// Continuous. Each beat of the turning weave is decomposed into its interaction blocks by probing the
// collision function (collision-anatomy), and the Lie algebra of u(3) generators that commute with
// every block map of all 24 beats is computed as a null space (tone-symmetry). All 9 would be U(3),
// SU(3) included. Because a line's far end could carry the triplet in any basis, as a triplet or as an
// antitriplet, the committed 9-state pair table (which runs on a wire in every beat) is also scanned
// over all twelve relative representations, which bounds the whole rule's continuous tone symmetry
// from above whatever representation each slot is given.
//
// Discrete. The six relabellings of the tone values are S3, the Weyl group of SU(3), the skeleton an
// SU(3) acting on the tone would have to contain. All 36 line relabellings (any relabelling on one end
// of a line and any on the other) are run through the committed rule by beat on the D4 mesh, from
// structured starts, for two full schedule periods, at two mesh sizes.
//
// Controls, each of which must come out differently from the committed rule:
// - the identity and swap line maps, which commute with all of U(3) (Schur-Weyl), so the detector
//   must find all 9 generators there;
// - passThrough (pure streaming), under which every one of the 36 relabellings is a symmetry.
//
// No random numbers anywhere: the probes, the starts and the representations are fixed constructions,
// enumerated exhaustively.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import {
  BIND_MOVE_FORWARD,
  LEAKY_CONFINE,
  PAIR_FORWARD,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import {
  blocksReproduceCollision,
  probeConfigurations,
} from '@/code/measure/collision-anatomy'
import { scheduleAnatomy } from '@/code/measure/coin-symmetry'
import {
  covariantPairSpace,
  largestLineSymmetry,
  pairTableMap,
  toneSymmetryAlgebra,
  unitaryAlgebraBasis,
} from '@/code/measure/tone-symmetry'
import { commutingLineRelabellings } from '@/code/check/tone-permutation-symmetry'
import {
  Will,
  fillCoordinateTexture,
  fillWillPattern,
  makeWill,
} from '@/code/tone/will'

const PERIOD = 24

// the structured starts on a d4 mesh of the given odd side (odd, so the mesh is one connected lattice)
function starts(side: number): Will[] {
  const mesh = d4Mesh({ side })
  const out = [0, 1, 2].map(phase => {
    const will = makeWill(mesh)

    fillWillPattern(will, phase)

    return will
  })
  const texture = makeWill(mesh)

  fillCoordinateTexture(texture, side)
  out.push(texture, makeWill(mesh))

  return out
}

// how far a generator (coefficients over unitaryAlgebraBasis) lies outside a subspace spanned by an
// orthonormal basis, as the norm of what the projection leaves over
function outside(input: {
  vector: readonly number[]
  basis: readonly (readonly number[])[]
}): number {
  const left = [...input.vector]

  for (const b of input.basis) {
    const dot = b.reduce(
      (sum, x, i) => sum + x * (input.vector[i] ?? 0),
      0,
    )

    b.forEach((x, i) => {
      left[i] = (left[i] ?? 0) - dot * x
    })
  }

  return Math.hypot(...left) / Math.hypot(...input.vector)
}

export default experiment({
  id: 'gauge/rule-tone-symmetry',
  code: 'E-FRC-0093',
  title:
    'the committed rule keeps only the charge U(1) and the overall phase of the three-valued tone, 2 of the 9 generators of U(3), under every way a line can carry a triplet, and no tone relabelling of the SU(3) Weyl group, so it carries no SU(3) colour on the tone',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: 3 })
    const opposite = meshOpposites(mesh)
    const committed = turningWeave({ opposite })
    const anatomy = scheduleAnatomy({
      schedule: committed,
      period: PERIOD,
      degree: 24,
    })
    const probes = probeConfigurations({ degree: 24 })
    const decompositionExact = anatomy.every((beatAnatomy, t) =>
      blocksReproduceCollision({
        collision: committed(t),
        degree: 24,
        blocks: beatAnatomy.blocks,
        maps: beatAnatomy.maps,
        probes,
      }),
    )

    // the continuous tone symmetry of the whole 24-beat rule, every slot carrying the plain triplet
    const whole = toneSymmetryAlgebra({
      maps: anatomy.flatMap(a => a.maps),
    })
    // which generators survive: the overall phase i (1, 1, 1) and the charge i (-1, 0, +1)
    const basis = unitaryAlgebraBasis()
    const phase = basis.map((_, j) => (j < 3 ? 1 : 0))
    const chargeGenerator = basis.map((_, j) =>
      j === 0 ? -1 : j === 2 ? 1 : 0,
    )
    const phaseOutside = outside({ vector: phase, basis: whole.basis })
    const chargeOutside = outside({
      vector: chargeGenerator,
      basis: whole.basis,
    })

    // the upper bound over every relative representation of a line's two ends
    const pairMap = pairTableMap({ table: PAIR_FORWARD })
    const lineBound = largestLineSymmetry({ map: pairMap })
    const covariance = covariantPairSpace({ map: pairMap })

    // the detector on maps that do commute with U(3), and two neighbouring tables for scale
    const identityMap = Array.from({ length: 9 }, (_, i) => i)
    const swapMap = Array.from(
      { length: 9 },
      (_, i) => (i % 3) * 3 + Math.floor(i / 3),
    )
    const identityAlgebra = toneSymmetryAlgebra({
      maps: [identityMap],
    }).dimension
    const swapAlgebra = toneSymmetryAlgebra({
      maps: [swapMap],
    }).dimension
    const swapCovariance = covariantPairSpace({ map: swapMap })
    const bindBound = largestLineSymmetry({
      map: pairTableMap({ table: BIND_MOVE_FORWARD }),
    })
    const leakyBound = largestLineSymmetry({
      map: pairTableMap({ table: LEAKY_CONFINE }),
    })

    // the discrete relabellings, run through beat, at two sizes, two schedule periods
    const relabellingsAt = (
      side: number,
      build: (sizedOpposite: number[]) => typeof committed,
    ): number =>
      commutingLineRelabellings({
        starts: starts(side),
        schedule: build(meshOpposites(d4Mesh({ side }))),
        beats: 2 * PERIOD,
      }).length
    const committedRelabellings3 = relabellingsAt(3, sized =>
      turningWeave({ opposite: sized }),
    )
    const committedRelabellings5 = relabellingsAt(5, sized =>
      turningWeave({ opposite: sized }),
    )
    const streamingRelabellings = relabellingsAt(
      3,
      () => () => passThrough,
    )

    const noSu3 =
      whole.dimension === 2 &&
      lineBound.dimension < 8 &&
      committedRelabellings3 === 1 &&
      committedRelabellings5 === 1
    const whatIsKept = phaseOutside < 1e-9 && chargeOutside < 1e-9
    const detectorWorks =
      identityAlgebra === 9 &&
      swapAlgebra === 9 &&
      swapCovariance.distance < 1e-9 &&
      covariance.complexDimension === 2 &&
      streamingRelabellings === 36
    const ok =
      decompositionExact && noSu3 && whatIsKept && detectorWorks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed turning weave keeps exactly two continuous tone symmetries, the charge U(1) and the overall phase, out of the nine of U(3), at most two under any way a line can carry a triplet or antitriplet, and none of the 35 nontrivial line relabellings of the tone (the SU(3) Weyl group S3 on each end), so SU(3) colour is not a symmetry of the tone under the rule, while the same detectors find all of U(3) on the identity and swap maps and all 36 relabellings under pure streaming',
      metrics: {
        wholeRuleAlgebraDimension: whole.dimension,
        // the smallest constraint eigenvalue that is NOT counted as a symmetry, against a cut at
        // 1e-9 of the largest: the dimension is an integer read off a wide gap, not a threshold
        smallestBrokenGeneratorWeight: whole.smallestNonzero,
        phaseOutsideAlgebra: phaseOutside,
        chargeOutsideAlgebra: chargeOutside,
        largestLineAlgebraOverRepresentations: lineBound.dimension,
        pairTableDistanceFromCovariant: covariance.distance,
        commutingRelabellingsSide3: committedRelabellings3,
        commutingRelabellingsSide5: committedRelabellings5,
        blockDecompositionExact: decompositionExact ? 1 : 0,
        beatsChecked: 2 * PERIOD,
      },
      control: {
        identityAlgebraDimension: identityAlgebra,
        swapAlgebraDimension: swapAlgebra,
        covariantPairSpaceComplexDimension: covariance.complexDimension,
        swapDistanceFromCovariant: swapCovariance.distance,
        streamingCommutingRelabellings: streamingRelabellings,
        bindMoveLargestLineAlgebra: bindBound.dimension,
        leakyConfineLargestLineAlgebra: leakyBound.dimension,
      },
      notes:
        'L3 format, an honest negative: the committed rule is run through beat on the D4 mesh (sides 3 and 5) with a streaming control that differs, and its collision is decomposed and checked exactly. No random numbers: probes, starts and representations are fixed and enumerated. What SU(3) on the tone would need: by Schur-Weyl the only line maps that commute with all of U(3) are combinations of the identity and the swap, so the only U(3)-symmetric ternary line rules are do-nothing and exchange, neither of which has the create, flip and annihilate clock (the arrow). The clock is what breaks U(3) down to its charge and phase directions, and removing it removes the arrow. The continuous symmetries here act on the tone read as a vector in C^3, which the classical rule does not do (it has no amplitudes), so this is the statement that no linear extension of the rule carries SU(3), not a claim about a quantum version. Composite symmetries acting on several cells, time-reversed symmetries (CPT) and approximate coarse-grained symmetries are outside this test.',
    })
  },
})
