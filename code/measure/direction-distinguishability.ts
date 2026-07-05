// The canonical, Chentsov-forced distinguishability on the 24 directions. The 24 directions of
// the coin carry the 24-cell symmetry, so a state's per-direction occupancy is a distribution on
// the 24-direction simplex, and Chentsov's theorem says the Fisher-Rao metric is the UNIQUE metric
// on a probability simplex invariant under the symmetry (the relabelings the group performs). So
// the distinguishability measure is not an ad-hoc per-cell scalar to be chosen, it is FORCED to be
// Fisher-Rao, the same theorem that makes TD's primitive non-arbitrary. This module builds the
// direction distribution, the 24-cell symmetry as permutations of the directions, and lets an
// experiment check that Fisher-Rao is invariant under the symmetry while an ad-hoc weighted
// measure is not.

import { fisherRaoDistance } from '@/code/measure/fisher-rao'

// the 24 directions of the D4 coin, the vectors +-e_a +-e_b
export function d4Directions(): number[][] {
  const directions: number[][] = []

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (const signA of [1, -1]) {
        for (const signB of [1, -1]) {
          const vector = [0, 0, 0, 0]
          vector[a] = signA
          vector[b] = signB
          directions.push(vector)
        }
      }
    }
  }

  return directions
}

const directionKey = (vector: number[]): string => vector.join(',')

// the permutation of the 24 directions induced by a signed coordinate permutation (a 24-cell
// symmetry): each direction vector is mapped by the symmetry and matched to its new index.
function directionPermutation(input: {
  permutation: number[]
  sign: number[]
}): number[] {
  const directions = d4Directions()
  const index = new Map(directions.map((v, i) => [directionKey(v), i]))
  const { permutation, sign } = input

  return directions.map(vector => {
    const image = [0, 0, 0, 0]

    for (let coordinate = 0; coordinate < 4; coordinate++) {
      image[permutation[coordinate]!] =
        sign[permutation[coordinate]!]! * vector[coordinate]!
    }

    return index.get(directionKey(image))!
  })
}

// a set of 24-cell (B4) symmetry generators, as permutations of the 24 directions: three
// coordinate transpositions, a sign flip, and the central inversion (the opposite map).
export function d4SymmetryPermutations(): number[][] {
  return [
    directionPermutation({ permutation: [1, 0, 2, 3], sign: [1, 1, 1, 1] }),
    directionPermutation({ permutation: [0, 2, 1, 3], sign: [1, 1, 1, 1] }),
    directionPermutation({ permutation: [0, 1, 3, 2], sign: [1, 1, 1, 1] }),
    directionPermutation({ permutation: [0, 1, 2, 3], sign: [-1, 1, 1, 1] }),
    directionPermutation({ permutation: [0, 1, 2, 3], sign: [-1, -1, -1, -1] }),
  ]
}

// apply a direction permutation to a distribution over the 24 directions
export function permuteDistribution(
  distribution: number[],
  permutation: number[],
): number[] {
  const result = new Array<number>(distribution.length).fill(0)

  for (let i = 0; i < distribution.length; i++) {
    result[permutation[i]!] = distribution[i]!
  }

  return result
}

// normalize a set of nonnegative direction weights into a distribution on the simplex
export function normalizeDistribution(weights: number[]): number[] {
  const total = weights.reduce((s, w) => s + w, 0)

  return total === 0 ? weights.slice() : weights.map(w => w / total)
}

// the maximum change in the Fisher-Rao distance between two distributions under the 24-cell
// symmetry, which is ZERO (Fisher-Rao is invariant under the group relabelings, so it is the
// canonical distinguishability by Chentsov's theorem).
export function fisherRaoSymmetryDeviation(input: {
  p: number[]
  q: number[]
}): number {
  const { p, q } = input
  const base = fisherRaoDistance(p, q)
  let maxDeviation = 0

  for (const symmetry of d4SymmetryPermutations()) {
    const distance = fisherRaoDistance(
      permuteDistribution(p, symmetry),
      permuteDistribution(q, symmetry),
    )
    maxDeviation = Math.max(maxDeviation, Math.abs(distance - base))
  }

  return maxDeviation
}

// an AD-HOC distinguishability: a weighted L1 distance with non-uniform per-direction weights.
// This is NOT invariant under the symmetry (the weights privilege particular directions), so its
// value changes under a group relabeling, which is exactly why an ad-hoc measure is not canonical.
export function adHocSymmetryDeviation(input: {
  p: number[]
  q: number[]
  weights: number[]
}): number {
  const { p, q, weights } = input

  const weightedL1 = (a: number[], b: number[]): number => {
    let sum = 0

    for (let i = 0; i < a.length; i++) {
      sum += weights[i]! * Math.abs(a[i]! - b[i]!)
    }

    return sum
  }

  const base = weightedL1(p, q)
  let maxDeviation = 0

  for (const symmetry of d4SymmetryPermutations()) {
    const distance = weightedL1(
      permuteDistribution(p, symmetry),
      permuteDistribution(q, symmetry),
    )
    maxDeviation = Math.max(maxDeviation, Math.abs(distance - base))
  }

  return maxDeviation
}
