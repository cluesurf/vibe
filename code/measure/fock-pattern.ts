// Fock's four-sphere and its finite restrictions (E-MTR-0003). Fock (1935) showed that hydrogen's shell n is the
// space of harmonics of degree l = n - 1 on the unit three-sphere S^3 in momentum space, dimension n^2, carried
// by SO(4). A symmetry group G smaller than SO(4) splits a shell into multiplets whose sizes are the dimensions
// of the G-irreps in that space. This file computes those sizes for any finite G given as 4 x 4 orthogonal
// matrices, with no character table: it averages one fixed generic symmetric operator over G, so the average
// commutes with G, and a generic G-invariant operator's eigenvalues are degenerate exactly along the irreps
// (each isotypic block of multiplicity m giving m distinct levels of the irrep's size).
//
// The groups, each as its matrices on R^4 = the space S^3 sits in:
//   Oh3:   the husk's own cubic group acting on (xi1, xi2, xi3) and fixing xi4, Fock's energy axis (3D rotations
//          act on S^3 this way under Fock's stereographic map)
//   2T:    the 24 Hurwitz units acting by left quaternion multiplication (the model's turn group, E-MTH-0009)
//   W(D4): the 192 signed permutations with an even number of signs
//   W(F4): W(D4) with the other signed permutations and the reflection in (1, 1, 1, 1) / 2, closed (1,152)
// The operator's entries are fixed numbers from the golden Weyl sequence (code/tool/weyl): no random numbers.

import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import { eigenSymmetricSmall } from '@/code/measure/husk-emission'

export type Matrix4 = number[][]

const identity4 = (): Matrix4 => [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0)))

function multiply(a: Matrix4, b: Matrix4): Matrix4 {
  return a.map(row => [0, 1, 2, 3].map(j => row.reduce((s, x, k) => s + x * b[k]![j]!, 0)))
}

const keyOf = (m: Matrix4): string => m.map(row => row.map(x => Math.round(2 * x)).join(',')).join(';')

// the closure of a set of generators (entries in multiples of 1/2)
export function closure(generators: Matrix4[]): Matrix4[] {
  const seen = new Map<string, Matrix4>()
  const queue: Matrix4[] = [identity4()]

  seen.set(keyOf(identity4()), identity4())

  while (queue.length > 0) {
    const m = queue.shift()!

    for (const g of generators) {
      const p = multiply(g, m)
      const k = keyOf(p)

      if (!seen.has(k)) {
        seen.set(k, p)
        queue.push(p)
      }
    }
  }

  return [...seen.values()]
}

// signed permutations of the first `axes` coordinates, the rest fixed; `even` keeps an even number of signs
function signedPermutations(axes: number, even: boolean): Matrix4[] {
  const out: Matrix4[] = []
  const perms: number[][] = []
  const permute = (prefix: number[], rest: number[]): void => {
    if (rest.length === 0) {
      perms.push(prefix)

      return
    }

    rest.forEach((r, i) => permute([...prefix, r], rest.filter((_, j) => j !== i)))
  }

  permute(
    [],
    Array.from({ length: axes }, (_, i) => i),
  )

  for (const perm of perms) {
    for (let s = 0; s < 1 << axes; s++) {
      let minus = 0

      for (let i = 0; i < axes; i++) {
        minus += (s >> i) & 1
      }

      if (even && minus % 2 === 1) {
        continue
      }

      const m = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

      for (let i = 0; i < axes; i++) {
        m[perm[i]!]![i] = (s >> i) & 1 ? -1 : 1
      }

      for (let i = axes; i < 4; i++) {
        m[i]![i] = 1
      }

      out.push(m)
    }
  }

  return out
}

export function groupOh3(): Matrix4[] {
  return signedPermutations(3, false)
}

export function groupWD4(): Matrix4[] {
  return signedPermutations(4, true)
}

export function groupWF4(): Matrix4[] {
  const reflection = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0) - 0.5))

  return closure([...signedPermutations(4, false), reflection])
}

// left multiplication by the quaternion (a, b, c, d) on (1, i, j, k) coordinates
function leftMultiplication(q: readonly number[]): Matrix4 {
  const [a, b, c, d] = q as [number, number, number, number]

  return [
    [a, -b, -c, -d],
    [b, a, -d, c],
    [c, d, a, -b],
    [d, -c, b, a],
  ]
}

export function group2T(): Matrix4[] {
  const units: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (const s of [1, -1]) {
      const q = [0, 0, 0, 0]

      q[i] = s
      units.push(q)
    }
  }

  for (let s = 0; s < 16; s++) {
    units.push([0, 1, 2, 3].map(i => ((s >> i) & 1 ? -0.5 : 0.5)))
  }

  return units.map(leftMultiplication)
}

// the representation of G on the harmonics of degree l = 1 (R^4 itself) or l = 2 (symmetric traceless 4 x 4
// matrices, S -> g S g^T, in an orthonormal basis)
function harmonicBasis2(): Matrix4[] {
  const basis: Matrix4[] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const m = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

      m[i]![j] = Math.SQRT1_2
      m[j]![i] = Math.SQRT1_2
      basis.push(m)
    }
  }

  // the three traceless diagonals, orthonormalized
  const diagonals = [
    [1, -1, 0, 0],
    [1, 1, -2, 0],
    [1, 1, 1, -3],
  ]

  for (const d of diagonals) {
    const n = Math.hypot(...d)
    const m = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

    d.forEach((x, i) => {
      m[i]![i] = x / n
    })
    basis.push(m)
  }

  return basis
}

export function representation(g: Matrix4, degree: 1 | 2): number[][] {
  if (degree === 1) {
    return g.map(row => [...row])
  }

  const basis = harmonicBasis2()
  const n = basis.length
  const out = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const gt = g[0]!.map((_, j) => g.map(row => row[j]!))

  basis.forEach((b, j) => {
    const image = multiply(multiply(g, b), gt)

    basis.forEach((c, i) => {
      let s = 0

      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          s += c[x]![y]! * image[x]![y]!
        }
      }

      out[i]![j] = s
    })
  })

  return out
}

// the multiplet sizes a group splits the shell into: the degeneracies of the group average of a generic
// symmetric operator, largest gap tolerance `tolerance` (relative)
export function multipletSizes(group: readonly Matrix4[], degree: 1 | 2, tolerance = 1e-9): number[] {
  const n = degree === 1 ? 4 : 9
  const generic = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i <= j ? weyl(1 + i * n + j, GOLDEN) + weyl(1 + j * n + i, SILVER) : 0)))

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      generic[i]![j] = generic[j]![i]!
    }
  }

  const average = new Float64Array(n * n)

  for (const g of group) {
    const r = representation(g, degree)

    // r M r^T
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0

        for (let k = 0; k < n; k++) {
          for (let l = 0; l < n; l++) {
            s += r[i]![k]! * generic[k]![l]! * r[j]![l]!
          }
        }

        average[i * n + j] = average[i * n + j]! + s / group.length
      }
    }
  }

  const values = Array.from(eigenSymmetricSmall(average, n, false).values).sort((a, b) => a - b)
  const scale = Math.max(...values.map(Math.abs), 1)
  const sizes: number[] = []
  let run = 1

  for (let i = 1; i <= values.length; i++) {
    if (i < values.length && Math.abs(values[i]! - values[i - 1]!) <= tolerance * scale) {
      run += 1
    } else {
      sizes.push(run)
      run = 1
    }
  }

  return sizes.sort((a, b) => a - b)
}
