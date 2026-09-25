// Can the committed rule's design space carry the triality rotation that would select a colour plane
// (E-FRC-0106)? The turning weave was adopted for two properties the earlier rules lacked: universality
// (over its schedule the swaps connect all 12 lines into one species graph) and CPT (a palindromic
// schedule, charge conjugation with time reversal and identity spatial parity, E-FND-0117). Each of
// its beats pairs the 12 lines into 6 couples.
//
// The measurement is combinatorial and exact.
//
// 1. A colour-selecting triality sigma (an order-three element of W(F4) fixing exactly an A2) acts on
//    the 12 lines with 3 fixed lines, the colour plane, and the other 9 in three 3-cycles.
// 2. Invariant beats. No perfect matching of the 12 lines into couples is sigma-invariant (a fixed line
//    must be coupled to a fixed line, and there are 3). A beat that leaves lines uncoupled can be
//    invariant, but then no couple joins a fixed line to a moved one, so in an invariant schedule the
//    swap graph never connects the colour plane to the other nine lines.
// 3. Why every beat must be invariant. If the schedule is sigma-covariant with a beat shift s
//    (C_{t+s} = sigma C_t sigma^-1) and palindromic with a spatial parity pi that commutes with sigma
//    (the adopted identity parity, or the full inversion -I), the two relations compose to
//    sigma^2 C_t sigma^-2 = C_t, and since sigma has order three, sigma C_t sigma^-1 = C_t at every
//    beat. The commuting parities are counted here, and only a parity that turns sigma into its inverse
//    escapes, which is neither the adopted CPT nor full inversion.
// 4. What would reconcile them. The smallest sigma-invariant block of lines that contains a colour
//    line and a moved line has four lines: the colour line and a whole sigma-orbit of three.
//
// Controls: a fixed-point-free order-three element of W(F4) (48 of them, none of them selects a colour
// plane) does admit invariant perfect matchings, so the matching count can come out nonzero.
//
// Depth L2: an exact structural measurement of the design space the committed rule was drawn from.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import { permutationOrder, weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'

const keyOf = (list: readonly number[]): string => [...list].sort((a, b) => a - b).join(',')

// the 12 lines, each a pair of opposite directions, and the permutation of lines a direction
// permutation induces
function linesOf(opposite: readonly number[]): number[][] {
  const lines: number[][] = []

  for (let d = 0; d < opposite.length; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  return lines
}

function linePermutation(permutation: readonly number[], lines: readonly number[][]): number[] {
  return lines.map(line => lines.findIndex(other => keyOf(other) === keyOf(line.map(d => permutation[d] ?? d))))
}

// every perfect matching of 12 items into 6 unordered pairs (10,395 of them)
function perfectMatchings(items: readonly number[]): number[][][] {
  if (items.length === 0) {
    return [[]]
  }

  const [first, ...rest] = items
  const out: number[][][] = []

  rest.forEach((partner, k) => {
    const remaining = rest.filter((_, j) => j !== k)

    for (const matching of perfectMatchings(remaining)) {
      out.push([[first ?? 0, partner], ...matching])
    }
  })

  return out
}

function invariantMatchings(matchings: readonly number[][][], lineMap: readonly number[]): number {
  return matchings.filter(matching => {
    const keys = new Set(matching.map(pair => keyOf(pair)))

    return matching.every(pair => keys.has(keyOf(pair.map(l => lineMap[l] ?? l))))
  }).length
}

// the size of the smallest sigma-invariant set of lines holding a fixed line and a moved one
function smallestJoiningBlock(lineMap: readonly number[]): number {
  const fixed = lineMap.map((image, l) => (image === l ? l : -1)).filter(l => l >= 0)
  const moved = lineMap.map((image, l) => (image === l ? -1 : l)).filter(l => l >= 0)
  let best = Number.POSITIVE_INFINITY

  for (const f of fixed) {
    for (const m of moved) {
      // the invariant closure of {f, m}
      const block = new Set([f, m])
      let grew = true

      while (grew) {
        grew = false

        for (const l of [...block]) {
          const image = lineMap[l] ?? l

          if (!block.has(image)) {
            block.add(image)
            grew = true
          }
        }
      }

      best = Math.min(best, block.size)
    }
  }

  return best
}

export default experiment({
  id: 'gauge/triality-against-universality',
  code: 'E-FRC-0107',
  title:
    'no schedule of line couples can keep the triality that selects a colour plane and also connect all twelve lines, under the CPT the committed rule was adopted with: triality fixes the three colour-plane lines, none of the 10,395 ways to couple all twelve lines is invariant, CPT with a parity that commutes with triality forces every beat to be invariant, and an invariant beat never couples a colour line to another, so joining them symmetrically needs a four-line block',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const opposite = meshOpposites(d4Mesh({ side: 3 }))
    const lines = linesOf(opposite)
    const permutations = weylF4DirectionPermutations({ directions: roots })
    const triangles = zeroSumTriangles({ directions: roots })
    const planes = new Set(triangles.map(t => keyOf([...t, ...t.map(d => opposite[d] ?? d)])))
    const orderThree = permutations.filter(p => permutationOrder({ permutation: p }) === 3)
    const fixedOf = (p: readonly number[]): number[] => p.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0)
    const selectors = orderThree.filter(p => fixedOf(p).length === 6 && planes.has(keyOf(fixedOf(p))))
    const fixedPointFree = orderThree.filter(p => fixedOf(p).length === 0)
    const matchings = perfectMatchings(lines.map((_, l) => l))

    // 1 and 2, over every selector
    const lineMaps = selectors.map(p => linePermutation(p, lines))
    const cycleTypesRight = lineMaps.every(map => {
      const fixedLines = map.filter((image, l) => image === l).length

      return fixedLines === 3
    })
    const invariantPerfect = lineMaps.reduce((sum, map) => sum + invariantMatchings(matchings, map), 0)
    const joiningBlock = Math.min(...lineMaps.map(smallestJoiningBlock))

    // the control: fixed-point-free order-three elements admit invariant perfect matchings
    const controlInvariant = linePermutation(fixedPointFree[0] ?? [], lines)
    const controlCount = invariantMatchings(matchings, controlInvariant)

    // 3. which spatial parities commute with a selector, and which invert it
    const identity = roots.map((_, d) => d)
    const inversion = roots.map(root => roots.findIndex(other => other.every((x, k) => x === -(root[k] ?? 0))))
    const compose = (a: readonly number[], b: readonly number[]): number[] => b.map(d => a[d] ?? d)
    const sigma = selectors[0] ?? identity
    const sigmaInverse = compose(sigma, sigma)
    const commutes = (pi: readonly number[]): boolean => keyOf(compose(pi, sigma).map((v, k) => v * 100 + k)) === keyOf(compose(sigma, pi).map((v, k) => v * 100 + k))
    const inverts = (pi: readonly number[]): boolean =>
      compose(compose(pi, sigma), pi.map((_, d) => pi.indexOf(d))).every((v, k) => v === sigmaInverse[k])
    const identityCommutes = commutes(identity)
    const inversionCommutes = commutes(inversion)
    const inverting = permutations.filter(inverts).length

    const ok =
      selectors.length === 32 &&
      cycleTypesRight &&
      matchings.length === 10395 &&
      invariantPerfect === 0 &&
      joiningBlock === 4 &&
      controlCount > 0 &&
      identityCommutes &&
      inversionCommutes &&
      inverting > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'each of the 32 colour-selecting trialities fixes exactly the 3 colour-plane lines and cycles the other 9, none of the 10,395 perfect couplings of the 12 lines is invariant under any of them, the adopted identity parity and the full inversion both commute with them so a covariant palindromic schedule must be invariant beat by beat, an invariant beat never couples a colour line to a moved one, and the smallest invariant block that joins them holds 4 lines, while a fixed-point-free order-three element admits invariant couplings',
      metrics: {
        colourSelectingTrialities: selectors.length,
        fixedLinesPerTriality: 3,
        perfectCouplings: matchings.length,
        invariantPerfectCouplings: invariantPerfect,
        smallestJoiningBlock: joiningBlock,
        parityCommutesIdentity: identityCommutes ? 1 : 0,
        parityCommutesInversion: inversionCommutes ? 1 : 0,
        paritiesInvertingTriality: inverting,
      },
      control: {
        fixedPointFreeOrderThree: fixedPointFree.length,
        controlInvariantPerfectCouplings: controlCount,
      },
      notes:
        'L2, exact and combinatorial, no random numbers. It decides the design question E-FRC-0106 left: within the family the committed rule was drawn from (every beat couples lines in pairs, CPT palindromic with identity spatial parity), colour cannot be selected by triality, because the colour plane holds three lines, an odd number, so a symmetric coupling can never reach them, and the property the turning weave was adopted for, one connected species graph, then fails. The escape routes are named, not taken: a CPT whose parity inverts the triality (the count is printed, none is the identity or the full inversion), or an interaction block of four lines, one colour line with a whole triality orbit of three. The second is the same kind of object as the three-line vertex E-FRC-0094 found absent, so the pairs-against-threes obstruction returns at the level of the schedule. Adopting either would be a change to the base and a decision, not a measurement.',
    })
  },
})
