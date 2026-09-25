// The continuous symmetry of a collision acting on the ternary tone. A tone has three values, so a
// colour triplet would be the tone read as a vector in C^3 with SU(3) turning it. Such a symmetry
// acts the same way on every slot: g in U(3) acts on a block of k slots as g x g x ... x g, and it is
// a symmetry when it commutes with the block map P (a permutation of the 3^k tone states, read as a
// permutation matrix). The infinitesimal version is a Lie algebra,
//
//   L(P) = { X in u(3) : [X_1 + X_2 + ... + X_k, P] = 0 },   X_i = X acting on slot i,
//
// and the continuous tone symmetry of a whole collision is the intersection of L over its blocks
// (the blocks act on disjoint slots, so the commutators live in independent tensor factors and each
// must vanish on its own). dim L = 9 is all of u(3), SU(3) included. dim L = 1 is the overall phase
// only. The number is computed as the null space of the linear constraints, never assumed.
//
// Tone t is basis index t + 1, so the basis is (-1, 0, +1).

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import {
  blockTones,
  blockIndex,
} from '@/code/measure/collision-anatomy'

type Complex3 = { re: number[][]; im: number[][] }

// The nine real generators of u(3), anti-Hermitian: i E_jj, E_jk - E_kj, i (E_jk + E_kj).
export function unitaryAlgebraBasis(): Complex3[] {
  const zero = (): number[][] => [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const basis: Complex3[] = []

  for (let j = 0; j < 3; j++) {
    const im = zero()

    im[j]![j] = 1
    basis.push({ re: zero(), im })
  }

  for (let j = 0; j < 3; j++) {
    for (let k = j + 1; k < 3; k++) {
      const re = zero()

      re[j]![k] = 1
      re[k]![j] = -1
      basis.push({ re, im: zero() })

      const im = zero()

      im[j]![k] = 1
      im[k]![j] = 1
      basis.push({ re: zero(), im })
    }
  }

  return basis
}

// How one slot carries the triplet: in the tone basis relabelled by `relabel` (relabel[i] is the
// basis index that index i is sent to), and as the conjugate representation when `conjugate` is set,
// so g acts there as its complex conjugate (an antitriplet, the other end of a line). The generator on
// the slot is X' = R Y R^-1 with Y = X or conj(X).
export type SlotRepresentation = {
  readonly relabel: readonly [number, number, number]
  readonly conjugate: boolean
}

const PLAIN: SlotRepresentation = {
  relabel: [0, 1, 2],
  conjugate: false,
}

// All twelve ways one slot can carry a triplet relative to another: six basis relabellings, each
// plain or conjugate.
export function slotRepresentations(): SlotRepresentation[] {
  const relabels: [number, number, number][] = [
    [0, 1, 2],
    [2, 1, 0],
    [1, 0, 2],
    [0, 2, 1],
    [1, 2, 0],
    [2, 0, 1],
  ]

  return [false, true].flatMap(conjugate =>
    relabels.map(relabel => ({ relabel, conjugate })),
  )
}

function generatorEntry(input: {
  generator: Complex3
  representation: SlotRepresentation
  to: number
  from: number
}): [number, number] {
  const { generator, representation } = input
  const inverse = [0, 0, 0]

  representation.relabel.forEach((image, i) => {
    inverse[image] = i
  })

  const row = inverse[input.to] ?? 0
  const column = inverse[input.from] ?? 0
  const re = generator.re[row]?.[column] ?? 0
  const im = generator.im[row]?.[column] ?? 0

  return [re, representation.conjugate ? -im : im]
}

// The constraint vector of one generator X against one block map P: every entry, real and imaginary,
// of [X_1 + ... + X_k, P] as a flat real array, X_i the generator as slot i carries it.
function commutatorEntries(input: {
  generator: Complex3
  map: readonly number[]
  representations?: readonly SlotRepresentation[]
}): number[] {
  const { generator, map } = input
  const representations = input.representations ?? []
  const states = map.length
  const size = Math.round(Math.log(states) / Math.log(3))

  // D(X) applied to basis state s, as a sparse list of (target, re, im)
  const act = (s: number): Map<number, [number, number]> => {
    const tones = blockTones({ index: s, size })
    const out = new Map<number, [number, number]>()

    for (let slot = 0; slot < size; slot++) {
      const from = (tones[slot] ?? 0) + 1

      for (let to = 0; to < 3; to++) {
        const [re, im] = generatorEntry({
          generator,
          representation: representations[slot] ?? PLAIN,
          to,
          from,
        })

        if (re === 0 && im === 0) {
          continue
        }

        const moved = tones.slice()

        moved[slot] = to - 1

        const target = blockIndex({ tones: moved })
        const current = out.get(target) ?? [0, 0]

        out.set(target, [current[0] + re, current[1] + im])
      }
    }

    return out
  }

  const entries = new Float64Array(states * states * 2)

  for (let s = 0; s < states; s++) {
    // column s of D P: D applied to P|s> = |map[s]>
    for (const [target, [re, im]] of act(map[s] ?? 0)) {
      entries[(target * states + s) * 2] =
        (entries[(target * states + s) * 2] ?? 0) + re

      entries[(target * states + s) * 2 + 1] =
        (entries[(target * states + s) * 2 + 1] ?? 0) + im
    }

    // column s of P D: P applied to D|s>, P|t> = |map[t]>
    for (const [target, [re, im]] of act(s)) {
      const row = map[target] ?? 0

      entries[(row * states + s) * 2] =
        (entries[(row * states + s) * 2] ?? 0) - re

      entries[(row * states + s) * 2 + 1] =
        (entries[(row * states + s) * 2 + 1] ?? 0) - im
    }
  }

  return [...entries]
}

// The Lie algebra of tone symmetries shared by every map, as its dimension and a real basis of
// coefficient vectors over unitaryAlgebraBasis (so a caller can see WHICH generators survive).
export function toneSymmetryAlgebra(input: {
  maps: readonly (readonly number[])[]
  // per map, per block slot: how that slot carries the triplet (plain in the tone basis by default)
  representations?: readonly (readonly SlotRepresentation[])[]
}): {
  dimension: number
  basis: number[][]
  smallestNonzero: number
} {
  const generators = unitaryAlgebraBasis()
  const gram = makeDense({ rows: 9, cols: 9 })

  for (let m = 0; m < input.maps.length; m++) {
    const map = input.maps[m] ?? []
    const representations = input.representations?.[m] ?? []
    const columns = generators.map(generator =>
      commutatorEntries({ generator, map, representations }),
    )

    for (let a = 0; a < 9; a++) {
      for (let b = 0; b < 9; b++) {
        const ca = columns[a] ?? []
        const cb = columns[b] ?? []

        let dot = 0

        for (let k = 0; k < ca.length; k++) {
          dot += (ca[k] ?? 0) * (cb[k] ?? 0)
        }

        gram.data[a * 9 + b] = (gram.data[a * 9 + b] ?? 0) + dot
      }
    }
  }

  const { values, vectors } = eigSymmetric({ matrix: gram })
  const scale = Math.max(1, ...values)
  const basis: number[][] = []

  let smallestNonzero = Number.POSITIVE_INFINITY

  for (let j = 0; j < 9; j++) {
    const value = values[j] ?? 0

    if (value < 1e-9 * scale) {
      basis.push(
        Array.from({ length: 9 }, (_, i) => vectors[i * 9 + j] ?? 0),
      )
    } else {
      smallestNonzero = Math.min(smallestNonzero, value)
    }
  }

  return { dimension: basis.length, basis, smallestNonzero }
}

// The largest tone symmetry a two-slot line map admits over every way its second slot can carry the
// triplet relative to its first (twelve representations). An upper bound on the continuous tone
// symmetry of any rule that runs this map on a line, whatever representation each slot is given,
// because relabelling the first slot too is only a change of generator basis.
export function largestLineSymmetry(input: {
  map: readonly number[]
}): {
  dimension: number
  representation: SlotRepresentation
} {
  let best = { dimension: -1, representation: PLAIN }

  for (const representation of slotRepresentations()) {
    const { dimension } = toneSymmetryAlgebra({
      maps: [input.map],
      representations: [[PLAIN, representation]],
    })

    if (dimension > best.dimension) {
      best = { dimension, representation }
    }
  }

  return best
}

// A pair table (the 9-state map of one line) as a block map over its two slots, local state
// index = (left + 1) + 3 (right + 1).
export function pairTableMap(input: {
  table: readonly (readonly [number, number])[]
}): number[] {
  const map: number[] = []

  for (let x = 0; x < 9; x++) {
    const [left, right] = blockTones({ index: x, size: 2 })
    // the collision module keys its tables as (left + 1) * 3 + (right + 1)
    const image = input.table[
      ((left ?? 0) + 1) * 3 + ((right ?? 0) + 1)
    ] ?? [0, 0]

    map.push(blockIndex({ tones: [image[0], image[1]] }))
  }

  return map
}

// The complex dimension of the space of operators on C^3 x C^3 that commute with g x g for every g
// in U(3), and how far a given pair map sits from that space. Commuting with the connected group is
// the same as commuting with its Lie algebra, so the constraints are [X x 1 + 1 x X, M] = 0 for the
// nine basis generators X of u(3): a finite, exhaustive set, no sampling of the group. Schur-Weyl
// duality says the space is spanned by the identity and the swap, so the dimension is 2 and every
// U(3)-covariant pair interaction is a combination of doing nothing and exchanging the two tones.
// The SU(3) answer is the same, since the overall phase commutes with everything.
export function covariantPairSpace(input: { map: readonly number[] }): {
  complexDimension: number
  distance: number
} {
  const n = 9
  const unknowns = 2 * n * n
  const gram = makeDense({ rows: unknowns, cols: unknowns })
  const constraintRows: number[][] = []

  for (const generator of unitaryAlgebraBasis()) {
    // G = X x 1 + 1 x X on the 9-dimensional pair space, basis index = first + 3 second
    const G = (row: number, col: number): [number, number] => {
      const [r1, r2] = [row % 3, Math.floor(row / 3)]
      const [c1, c2] = [col % 3, Math.floor(col / 3)]
      const first: [number, number] =
        r2 === c2
          ? [generator.re[r1]?.[c1] ?? 0, generator.im[r1]?.[c1] ?? 0]
          : [0, 0]
      const second: [number, number] =
        r1 === c1
          ? [generator.re[r2]?.[c2] ?? 0, generator.im[r2]?.[c2] ?? 0]
          : [0, 0]

      return [first[0] + second[0], first[1] + second[1]]
    }

    // (G M - M G)_{ij} as a linear form in the unknowns M_{kl} = u[2(kn+l)] + i u[2(kn+l)+1]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const realRow = new Array<number>(unknowns).fill(0)
        const imagRow = new Array<number>(unknowns).fill(0)

        const add = (
          k: number,
          l: number,
          cr: number,
          ci: number,
        ): void => {
          // (cr + i ci)(u_re + i u_im)
          const p = 2 * (k * n + l)

          realRow[p] = (realRow[p] ?? 0) + cr
          realRow[p + 1] = (realRow[p + 1] ?? 0) - ci
          imagRow[p] = (imagRow[p] ?? 0) + ci
          imagRow[p + 1] = (imagRow[p + 1] ?? 0) + cr
        }

        for (let k = 0; k < n; k++) {
          const [gr, gi] = G(i, k)

          add(k, j, gr, gi)

          const [hr, hi] = G(k, j)

          add(i, k, -hr, -hi)
        }

        constraintRows.push(realRow, imagRow)
      }
    }
  }

  for (const row of constraintRows) {
    for (let a = 0; a < unknowns; a++) {
      const ra = row[a] ?? 0

      if (ra === 0) {
        continue
      }

      for (let b = 0; b < unknowns; b++) {
        gram.data[a * unknowns + b] =
          (gram.data[a * unknowns + b] ?? 0) + ra * (row[b] ?? 0)
      }
    }
  }

  const { values, vectors } = eigSymmetric({ matrix: gram })
  const scale = Math.max(1, ...values)
  const nullVectors: number[][] = []

  for (let j = 0; j < unknowns; j++) {
    if ((values[j] ?? 0) < 1e-8 * scale) {
      nullVectors.push(
        Array.from(
          { length: unknowns },
          (_, i) => vectors[i * unknowns + j] ?? 0,
        ),
      )
    }
  }

  // the permutation matrix of the map as a real vector over the unknowns, M_{map[x], x} = 1
  const target = new Array<number>(unknowns).fill(0)

  input.map.forEach((image, x) => {
    target[2 * (image * n + x)] = 1
  })

  // project onto the null space (orthonormal eigenvectors) and measure what is left over
  const projection = new Array<number>(unknowns).fill(0)

  for (const v of nullVectors) {
    let dot = 0

    for (let k = 0; k < unknowns; k++) {
      dot += (v[k] ?? 0) * (target[k] ?? 0)
    }

    for (let k = 0; k < unknowns; k++) {
      projection[k] = (projection[k] ?? 0) + dot * (v[k] ?? 0)
    }
  }

  let residual = 0
  let norm = 0

  for (let k = 0; k < unknowns; k++) {
    residual += ((target[k] ?? 0) - (projection[k] ?? 0)) ** 2
    norm += (target[k] ?? 0) ** 2
  }

  return {
    complexDimension: nullVectors.length / 2,
    distance: Math.sqrt(residual / norm),
  }
}
