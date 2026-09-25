// What would a local rule need in order to carry SU(3) colour? E-FRC-0093 to 0097 found the committed
// rule has none. This asks whether ANY deterministic permutation rule could, and what the smallest
// addition is that does.
//
// Four exact measurements on three-state slots:
//
// 1. Every permutation of the 3^k joint slot states that commutes with the colour algebra, found by an
//    exhaustive search (and for a pair, by brute force over all 9! = 362,880). Colour-symmetric
//    classical rules are only relabellings of slots: identity and swap for a pair of triplets, the
//    identity alone for a triplet and an antitriplet, the six slot orders for three triplets.
// 2. The colour-symmetric pair unitaries form a circle, U(phase) = P_sym + e^{i phase} P_anti (or with
//    the singlet projector for a triplet and antitriplet). Every member keeps the full 9-dimensional
//    u(3) symmetry. Scanning the circle, the members that are permutations are exactly phase 0 and pi
//    (identity and swap), and every other member entangles colour, with entangling power up to 1/4.
//    So amplitudes are the one addition that lets a colour-symmetric rule DO something.
// 3. A tone that is both the clock and the colour breaks colour: the rule's vacuum clock (the tone
//    cycle t -> t + 1) commutes with only a 3-dimensional abelian part of u(3). A slot that is a clock
//    trit times a separate colour qutrit keeps all nine.
//
// Controls: the Cartan-only condition (what a clock phase alone asks) admits 8 pair permutations, so
// the search does find permutations when the symmetry is smaller. The qubit square root of swap gives
// entangling power 1/6, Zanardi's published value.
//
// Depth L1: known mathematics (Schur-Weyl duality, the commutant of U(d) on two slots), measured by
// code, and its consequence for the base stated with the numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  asPermutation,
  bruteForceColourPermutations,
  colourPermutations,
  entanglingPower,
  identityOperator,
  kroneckerOperator,
  pairExchangeUnitary,
  permutationOperator,
  symmetryDimension,
  type Operator,
  type SlotKind,
} from '@/code/measure/colour-symmetry'

const STEPS = 360

type Scan = { permutationPhases: number[]; smallestSymmetry: number; largestPower: number; phaseOfLargest: number; weakestInterior: number }

function scanFamily(kind: SlotKind): Scan {
  const scan: Scan = { permutationPhases: [], smallestSymmetry: 9, largestPower: 0, phaseOfLargest: 0, weakestInterior: 1 }

  for (let step = 0; step < STEPS; step++) {
    const phase = (2 * Math.PI * step) / STEPS
    const operator = pairExchangeUnitary({ d: 3, kind, phase })
    const power = entanglingPower({ operator, d: 3 })
    const classical = asPermutation({ operator }) !== undefined

    scan.smallestSymmetry = Math.min(scan.smallestSymmetry, symmetryDimension({ operator, d: 3, slots: ['plain', kind] }))

    if (classical) {
      scan.permutationPhases.push(step / STEPS)
    } else {
      scan.weakestInterior = Math.min(scan.weakestInterior, power)
    }

    if (power > scan.largestPower) {
      scan.largestPower = power
      scan.phaseOfLargest = step / STEPS
    }
  }

  return scan
}

export default experiment({
  id: 'gauge/colour-needs-amplitudes',
  code: 'E-FRC-0100',
  title:
    'a colour-symmetric permutation rule can only relabel slots (2 of 9! pair permutations, 1 for a colour-anticolour pair, 6 for three slots), the colour-symmetric pair unitaries are a circle whose only classical points are identity and swap, every other point entangles, and a tone that is also the clock keeps only 3 of the 9 colour generators',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const pairPlain = colourPermutations({ d: 3, slots: ['plain', 'plain'] }).length
    const pairMixed = colourPermutations({ d: 3, slots: ['plain', 'conjugate'] }).length
    const triple = colourPermutations({ d: 3, slots: ['plain', 'plain', 'plain'] }).length
    const bruteForcePlain = bruteForceColourPermutations({ d: 3, slots: ['plain', 'plain'] })
    const bruteForceMixed = bruteForceColourPermutations({ d: 3, slots: ['plain', 'conjugate'] })

    const plain = scanFamily('plain')
    const mixed = scanFamily('conjugate')

    // the rule's vacuum clock, the tone cycle t -> t + 1, as colour, then as a separate factor
    const clock = permutationOperator({ map: [1, 2, 0] })
    const clockAsColour = symmetryDimension({ operator: clock, d: 3, slots: ['plain'] })
    const colourIdentity = identityOperator({ size: 3 })
    const clockBesideColour = symmetryDimension({
      operator: kroneckerOperator(clock, colourIdentity),
      d: 3,
      slots: ['plain'],
      lift: (generator: Operator) => kroneckerOperator(colourIdentity, generator),
    })

    const cartanPairs = colourPermutations({ d: 3, slots: ['plain', 'plain'], diagonal: true }).length
    const qubitRootSwap = entanglingPower({ operator: pairExchangeUnitary({ d: 2, kind: 'plain', phase: Math.PI / 2 }), d: 2 })

    const classicalIsRelabelling =
      pairPlain === 2 && pairMixed === 1 && triple === 6 && bruteForcePlain === 2 && bruteForceMixed === 1
    const circleIsSymmetric = plain.smallestSymmetry === 9 && mixed.smallestSymmetry === 9
    const onlyEndpointsClassical =
      plain.permutationPhases.join() === '0,0.5' && mixed.permutationPhases.join() === '0'
    const interiorEntangles = plain.weakestInterior > 1e-6 && mixed.weakestInterior > 1e-6
    const clockSplits = clockAsColour === 3 && clockBesideColour === 9
    const controlsWork = cartanPairs === 8 && Math.abs(qubitRootSwap - 1 / 6) < 1e-12
    const ok = classicalIsRelabelling && circleIsSymmetric && onlyEndpointsClassical && interiorEntangles && clockSplits && controlsWork

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'of the 9! = 362,880 reversible maps of a pair of three-state slots, exactly 2 (identity and swap) commute with SU(3), 1 does for a triplet and an antitriplet, and 6 of the 27! for three triplets, so a colour-symmetric classical rule can only move colour around and never mix it. The colour-symmetric pair unitaries form a circle, every point of it keeps all 9 u(3) generators, and its only classical points are identity and swap: every other point entangles colour, with entangling power up to 1/4. A tone that is also the rule\'s clock keeps 3 of the 9 generators, a separate colour factor beside the clock keeps all 9',
      metrics: {
        pairPermutationsTriplets: pairPlain,
        pairPermutationsTripletAntitriplet: pairMixed,
        tripletPermutations: triple,
        bruteForcePairTriplets: bruteForcePlain,
        bruteForcePairTripletAntitriplet: bruteForceMixed,
        classicalPhasesTriplets: plain.permutationPhases.length,
        classicalPhasesTripletAntitriplet: mixed.permutationPhases.length,
        largestEntanglingPowerTriplets: plain.largestPower,
        phaseOfLargestTriplets: plain.phaseOfLargest,
        largestEntanglingPowerTripletAntitriplet: mixed.largestPower,
        phaseOfLargestTripletAntitriplet: mixed.phaseOfLargest,
        smallestSymmetryOnTheCircle: Math.min(plain.smallestSymmetry, mixed.smallestSymmetry),
        clockAsColourSymmetry: clockAsColour,
        clockBesideColourSymmetry: clockBesideColour,
      },
      control: {
        cartanOnlyPairPermutations: cartanPairs,
        qubitRootSwapEntanglingPower: qubitRootSwap,
        publishedQubitRootSwap: 1 / 6,
        weakestInteriorPowerTriplets: plain.weakestInterior,
        weakestInteriorPowerTripletAntitriplet: mixed.weakestInterior,
      },
      notes:
        'L1, known mathematics measured exactly, with no random numbers (exhaustive search, a fixed phase grid of 360 points). It answers what the base would need for colour. A deterministic permutation rule that respects SU(3) can only stream and exchange colour, never rotate it, so gluon dynamics cannot be a symmetry of any tone permutation. The minimal addition is one phase on the exchange, which is an amplitude, the same missing ingredient E-FND-0080 found for the quantum sector. The clock measurement says the colour cannot be the same three values the rule already uses as its period-three clock, it has to be a second factor beside it. The 1/4 maximum is for three-state slots and is reached where the antisymmetric part picks up a phase of pi / 2, the colour analogue of the square root of swap.',
    })
  },
})
