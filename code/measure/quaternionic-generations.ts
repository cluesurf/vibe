// The threefold family structure of the octonions read off the quaternionic subalgebras,
// a route distinct from the exceptional Jordan algebra (generation-structure.ts) and from
// SO(8) triality (so8-triality.ts). The octonions have seven quaternionic subalgebras, the
// seven lines of the Fano plane, each a triple of imaginary units {e_i, e_j, e_k} with
// e_i e_j = +/- e_k that closes with the real line into a copy of the quaternions H.
//
// Through any single fixed imaginary unit there pass exactly three of these lines (three
// lines through a point in the Fano plane), so fixing a preferred imaginary direction
// selects exactly three quaternionic subalgebras. This is the Dray-Manogue style family
// mechanism. If the substrate's arrow picks the preferred octonion direction, the octonions
// force exactly three families, each a faithful copy of H, and the three are cyclically
// permuted by an octonion automorphism (the family symmetry). The count is specific to the
// octonions: the quaternions have only one quaternionic subalgebra, so one family.

import {
  octonionUnit,
  octonionMultiply,
  octonionEquals,
  octonionScale,
} from '@/code/algebra/octonion'

// find the signed product e_i e_j among the imaginary units, as {index, sign}, or null
function signedProduct(
  i: number,
  j: number,
): { index: number; sign: number } | null {
  const product = octonionMultiply(octonionUnit(i), octonionUnit(j))

  for (let k = 1; k <= 7; k++) {
    if (octonionEquals(product, octonionUnit(k))) {
      return { index: k, sign: 1 }
    }

    if (octonionEquals(product, octonionScale(octonionUnit(k), -1))) {
      return { index: k, sign: -1 }
    }
  }

  return null
}

// the seven quaternionic subalgebras of the octonions, as sorted triples of imaginary units
export function octonionFanoLines(): [number, number, number][] {
  const lines: [number, number, number][] = []

  for (let i = 1; i <= 7; i++) {
    for (let j = i + 1; j <= 7; j++) {
      const product = signedProduct(i, j)

      if (product && product.index !== i && product.index !== j) {
        const triple = [i, j, product.index].sort((a, b) => a - b) as [
          number,
          number,
          number,
        ]

        const seen = lines.some(
          line =>
            line[0] === triple[0] &&
            line[1] === triple[1] &&
            line[2] === triple[2],
        )

        if (!seen) {
          lines.push(triple)
        }
      }
    }
  }

  return lines
}

// the quaternionic subalgebras that contain a fixed imaginary unit (the preferred direction)
export function subalgebrasThroughUnit(
  unit: number,
): [number, number, number][] {
  return octonionFanoLines().filter(line => line.includes(unit))
}

// whether a set of imaginary units, with the real line, closes into a quaternion algebra
export function closesAsQuaternion(units: readonly number[]): boolean {
  const basis = [0, ...units]

  for (const i of basis) {
    for (const j of basis) {
      const product = octonionMultiply(octonionUnit(i), octonionUnit(j))

      let closed = false

      for (const k of basis) {
        if (
          octonionEquals(product, octonionUnit(k)) ||
          octonionEquals(product, octonionScale(octonionUnit(k), -1))
        ) {
          closed = true
        }
      }

      if (!closed) {
        return false
      }
    }
  }

  return true
}

// whether a permutation of the imaginary units preserves the octonion multiplication up to
// sign, a signed automorphism. The family symmetry that permutes the subalgebras must be one.
export function isSignedOctonionAutomorphism(
  perm: Record<number, number>,
): boolean {
  for (let i = 1; i <= 7; i++) {
    for (let j = 1; j <= 7; j++) {
      if (i === j) {
        continue
      }

      const product = signedProduct(i, j)

      if (!product) {
        continue
      }

      const mapped = octonionMultiply(
        octonionUnit(perm[i]!),
        octonionUnit(perm[j]!),
      )

      const targetPlus = octonionUnit(perm[product.index]!)
      const targetMinus = octonionScale(
        octonionUnit(perm[product.index]!),
        -1,
      )

      if (
        !octonionEquals(mapped, targetPlus) &&
        !octonionEquals(mapped, targetMinus)
      ) {
        return false
      }
    }
  }

  return true
}

// search for the family symmetry: a signed octonion automorphism that fixes the preferred
// unit and cyclically permutes its three quaternionic subalgebras (an order-three family
// symmetry). Returns the permutation, or null if none exists.
export function familyPermutation(
  unit: number,
): Record<number, number> | null {
  const pairs = subalgebrasThroughUnit(unit).map(line =>
    line.filter(u => u !== unit),
  )

  if (pairs.length !== 3) {
    return null
  }

  const [p0, p1, p2] = pairs as [number[], number[], number[]]

  // try each alignment of the 3-cycle p0 -> p1 -> p2 -> p0 on the pair elements
  for (const flip1 of [false, true]) {
    for (const flip2 of [false, true]) {
      const perm: Record<number, number> = { [unit]: unit }
      const a = p1[flip1 ? 1 : 0]!
      const b = p1[flip1 ? 0 : 1]!
      perm[p0[0]!] = a
      perm[p0[1]!] = b

      const c = p2[flip2 ? 1 : 0]!
      const d = p2[flip2 ? 0 : 1]!
      perm[a] = c
      perm[b] = d
      perm[c] = p0[0]!
      perm[d] = p0[1]!

      const image = new Set(Object.values(perm))

      if (image.size === 7 && isSignedOctonionAutomorphism(perm)) {
        return perm
      }
    }
  }

  return null
}

// The principal angles (in degrees) between two quaternionic subalgebras, each spanned by the real
// line and its Fano-line imaginary units. The basis vectors are orthonormal coordinate axes, so the
// overlap is exact: shared axes give an angle of zero and every non-shared pair is orthogonal (an
// angle of ninety). Returns the sorted list of the four principal angles. Two generation subalgebras
// (which share the real line and the preferred unit) return [0, 0, 90, 90], so there is no
// intermediate mixing angle in the geometry.
export function subalgebraPrincipalAngles(
  lineA: readonly number[],
  lineB: readonly number[],
): number[] {
  const axesA = new Set<number>([0, ...lineA])
  const axesB = new Set<number>([0, ...lineB])

  let shared = 0

  for (const axis of axesA) {
    if (axesB.has(axis)) {
      shared++
    }
  }

  const angles: number[] = []

  for (let i = 0; i < shared; i++) {
    angles.push(0)
  }

  for (let i = 0; i < axesA.size - shared; i++) {
    angles.push(90)
  }

  return angles.sort((a, b) => a - b)
}
