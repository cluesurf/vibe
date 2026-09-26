// Pauli's pairing of a cluster's role content with its space: which role states the lightest charged clusters
// may hold when the loves are identical fermions (E-SPN-0067).
//
// Four (or three) identical fermion loves must be antisymmetric under every permutation acting on role and space
// at once. So a role state of symmetric-group irrep mu pairs only with a spatial state of the conjugate irrep
// mu^T (the role (x) space product holds the sign irrep exactly when the two irreps are conjugate). The fear, a
// different vibe, is not permuted. Which spatial irrep is lowest is a question about the binding:
//  - in one dimension, for any Hamiltonian that does not read the role, Lieb and Mattis (1962) order the lowest
//    level of each spatial irrep by dominance: the more symmetric the diagram, the lower
//  - in a three-dimensional oscillator shell, by the fewest quanta the irrep needs
// This module supplies: the symmetric groups' character tables for n = 3, 4 (standard tables, checked orthonormal
// by the caller), conjugate partitions, the joint (2T, S_n) content of a role cluster's neutral space from
// code/algebra/role-cluster, the oscillator quanta each spatial irrep first needs (by enumeration, not typed in),
// and a direct check of the one-dimensional ordering: the lowest level of each spatial irrep of n identical
// particles (plus one distinguishable particle, optionally) on a ring, by a Lanczos run inside the irrep.
//
// Measurement code: it uses reals (characters, eigenvalues). It holds no rule of the model.

import { type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import { makeDense, denseSet } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { binaryTetrahedralCharacters, cycleType, heisenbergGroup, neutralCharacter, permutations, spinTurns, type Complex } from '@/code/algebra/role-cluster'
import { makeWeyl } from '@/code/tool/weyl'

export type SymmetricIrrep = { readonly partition: readonly number[]; readonly dimension: number; readonly values: Readonly<Record<string, number>> }

// the character tables, by cycle type (sorted descending, joined by commas)
export const S3_IRREPS: readonly SymmetricIrrep[] = [
  { partition: [3], dimension: 1, values: { '1,1,1': 1, '2,1': 1, '3': 1 } },
  { partition: [2, 1], dimension: 2, values: { '1,1,1': 2, '2,1': 0, '3': -1 } },
  { partition: [1, 1, 1], dimension: 1, values: { '1,1,1': 1, '2,1': -1, '3': 1 } },
]

export const S4_IRREPS: readonly SymmetricIrrep[] = [
  { partition: [4], dimension: 1, values: { '1,1,1,1': 1, '2,1,1': 1, '2,2': 1, '3,1': 1, '4': 1 } },
  { partition: [3, 1], dimension: 3, values: { '1,1,1,1': 3, '2,1,1': 1, '2,2': -1, '3,1': 0, '4': -1 } },
  { partition: [2, 2], dimension: 2, values: { '1,1,1,1': 2, '2,1,1': 0, '2,2': 2, '3,1': -1, '4': 0 } },
  { partition: [2, 1, 1], dimension: 3, values: { '1,1,1,1': 3, '2,1,1': -1, '2,2': -1, '3,1': 0, '4': 1 } },
  { partition: [1, 1, 1, 1], dimension: 1, values: { '1,1,1,1': 1, '2,1,1': -1, '2,2': 1, '3,1': 1, '4': -1 } },
]

export function irrepsOf(n: number): readonly SymmetricIrrep[] {
  if (n === 3) return S3_IRREPS
  if (n === 4) return S4_IRREPS

  throw new Error(`no symmetric group table for n = ${n}`)
}

export const partitionName = (p: readonly number[]): string => `[${p.join(',')}]`

// the conjugate partition (rows and columns of the Young diagram exchanged)
export function conjugate(p: readonly number[]): number[] {
  const out: number[] = []

  for (let c = 0; c < (p[0] ?? 0); c++) out.push(p.filter(r => r > c).length)

  return out
}

// the largest deviation of the table from orthonormality, (1/n!) sum_s chi_a(s) chi_b(s) = delta
export function tableOrthonormalGap(n: number): number {
  const irreps = irrepsOf(n)
  const perms = permutations(n)
  let gap = 0

  for (const a of irreps) {
    for (const b of irreps) {
      let s = 0

      for (const p of perms) {
        const key = cycleType(p).join(',')

        s += (a.values[key] ?? 0) * (b.values[key] ?? 0)
      }

      gap = Math.max(gap, Math.abs(s / perms.length - (a === b ? 1 : 0)))
    }
  }

  return gap
}

// the joint content of the neutral space of n roles and m antiroles under 2T x S_n: multiplicity of every
// (2T irrep, S_n irrep) pair, with the 2T irrep's sign at the 2 pi turn
export type JointEntry = { readonly spin: string; readonly spinDimension: number; readonly twoPiSign: number; readonly partition: readonly number[]; readonly multiplicity: number }

export function jointContent(input: { roles: number; antiroles: number }): { entries: JointEntry[]; rank: number; wholeGap: number } {
  const { roles, antiroles } = input
  const group = heisenbergGroup()
  const { turns, lambda } = spinTurns()
  const characters = binaryTetrahedralCharacters({ turns, lambda })
  const perms = permutations(roles)
  const table = new Map<string, Complex[]>()

  for (const p of perms) {
    const key = cycleType(p).join(',')

    if (!table.has(key)) table.set(key, turns.map(t => neutralCharacter({ group, turn: t.unitary as ComplexMatrix, cycles: key.split(',').map(Number), antiroles })))
  }

  const identity = turns.findIndex(t => t.order === 1)
  const central = turns.findIndex(t => t.order === 2)
  const entries: JointEntry[] = []
  let wholeGap = 0

  for (const c of characters) {
    for (const s of irrepsOf(roles)) {
      let re = 0
      let im = 0

      for (const p of perms) {
        const key = cycleType(p).join(',')
        const chi = table.get(key) ?? []
        const x = s.values[key] ?? 0

        turns.forEach((_, i) => {
          const a = chi[i] ?? [0, 0]
          const b = c.values[i] ?? [0, 0]

          // a times conj(b)
          re += x * (a[0] * b[0] + a[1] * b[1])
          im += x * (a[1] * b[0] - a[0] * b[1])
        })
      }

      re /= perms.length * turns.length
      im /= perms.length * turns.length
      wholeGap = Math.max(wholeGap, Math.abs(re - Math.round(re)), Math.abs(im))

      const m = Math.round(re)

      if (m !== 0) {
        const at1 = c.values[identity]?.[0] ?? 1
        const at2 = c.values[central]?.[0] ?? 1

        entries.push({ spin: c.name, spinDimension: c.dimension, twoPiSign: Math.sign(at2 / at1), partition: s.partition, multiplicity: m })
      }
    }
  }

  const rank = table.get(new Array<number>(roles).fill(1).join(','))?.[identity]?.[0] ?? Number.NaN

  return { entries, rank, wholeGap }
}

// the fewest oscillator quanta at which spatial irrep p of n particles first appears, for single-particle levels
// of degeneracy 1 (one dimension) or (N + 1)(N + 2)/2 (three dimensions), by enumerating product states
export function minimalQuanta(input: { n: number; dimension: 1 | 3; maxQuanta: number }): Map<string, number> {
  const { n, dimension, maxQuanta } = input
  const orbitals: number[] = []

  for (let level = 0; level <= maxQuanta; level++) {
    const g = dimension === 1 ? 1 : ((level + 1) * (level + 2)) / 2

    for (let k = 0; k < g; k++) orbitals.push(level)
  }

  const perms = permutations(n)
  const irreps = irrepsOf(n)
  const found = new Map<string, number>()

  for (let total = 0; total <= maxQuanta; total++) {
    // the permutation character on product states of this total: tuples fixed by the permutation
    const fixed = new Map<string, number>()
    const tuple = new Array<number>(n).fill(0)
    const count = orbitals.length ** n

    for (let code = 0; code < count; code++) {
      let c = code
      let sum = 0

      for (let i = 0; i < n; i++) {
        tuple[i] = c % orbitals.length
        c = Math.floor(c / orbitals.length)
        sum += orbitals[tuple[i] as number] as number
      }

      if (sum !== total) continue

      for (const p of perms) {
        if (tuple.every((o, i) => tuple[p[i] as number] === o)) {
          const key = p.join(',')

          fixed.set(key, (fixed.get(key) ?? 0) + 1)
        }
      }
    }

    for (const s of irreps) {
      const name = partitionName(s.partition)

      if (found.has(name)) continue

      let m = 0

      for (const p of perms) m += (s.values[cycleType(p).join(',')] ?? 0) * (fixed.get(p.join(',')) ?? 0)

      if (m / perms.length > 0.5) found.set(name, total)
    }
  }

  return found
}

// The lowest level of each spatial irrep of `identical` particles, plus `extra` (0 or 1) distinguishable ones,
// on a ring of `ring` docks: H = -hop (sum of nearest-neighbor moves of every particle) + like (sum over identical
// pairs sharing a dock) + unlike (sum over identical-extra pairs sharing a dock). The Hamiltonian never reads a
// label, so it commutes with the permutations of the identical particles, and a Lanczos run started inside an
// irrep's isotypic part stays there (re-projected every step against rounding).
export type RingSectors = { readonly energies: Map<string, number>; readonly dimension: number }

export function ringSectorEnergies(input: { ring: number; identical: number; extra: 0 | 1; hop: number; like: number; unlike: number; steps?: number }): RingSectors {
  const { ring, identical, extra, hop, like, unlike } = input
  const particles = identical + extra
  const dimension = ring ** particles
  const decode = (index: number, out: Int32Array): void => {
    let c = index

    for (let i = 0; i < particles; i++) {
      out[i] = c % ring
      c = Math.floor(c / ring)
    }
  }
  const encode = (pos: Int32Array): number => {
    let index = 0

    for (let i = particles - 1; i >= 0; i--) index = index * ring + (pos[i] as number)

    return index
  }
  const diagonal = new Float64Array(dimension)
  const neighbors = new Int32Array(dimension * particles * 2)
  const pos = new Int32Array(particles)

  for (let index = 0; index < dimension; index++) {
    decode(index, pos)

    let e = 0

    for (let i = 0; i < identical; i++) {
      for (let j = i + 1; j < identical; j++) if (pos[i] === pos[j]) e += like
      if (extra === 1 && pos[i] === pos[identical]) e += unlike
    }

    diagonal[index] = e

    for (let i = 0; i < particles; i++) {
      const at = pos[i] as number

      pos[i] = (at + 1) % ring
      neighbors[(index * particles + i) * 2] = encode(pos)
      pos[i] = (at + ring - 1) % ring
      neighbors[(index * particles + i) * 2 + 1] = encode(pos)
      pos[i] = at
    }
  }

  const apply = (v: Float64Array, out: Float64Array): void => {
    for (let index = 0; index < dimension; index++) {
      let s = (diagonal[index] as number) * (v[index] as number)
      const base = index * particles * 2

      for (let k = 0; k < particles * 2; k++) s -= hop * (v[neighbors[base + k] as number] as number)

      out[index] = s
    }
  }

  // the permutations of the identical particles as index maps
  const perms = permutations(identical)
  const maps = perms.map(p => {
    const map = new Int32Array(dimension)
    const moved = new Int32Array(particles)

    for (let index = 0; index < dimension; index++) {
      decode(index, pos)

      for (let i = 0; i < identical; i++) moved[p[i] as number] = pos[i] as number
      if (extra === 1) moved[identical] = pos[identical] as number

      map[index] = encode(moved)
    }

    return { key: cycleType(p).join(','), map }
  })
  const project = (irrep: SymmetricIrrep, v: Float64Array): Float64Array => {
    const out = new Float64Array(dimension)

    for (const { key, map } of maps) {
      const c = ((irrep.values[key] ?? 0) * irrep.dimension) / perms.length

      if (c === 0) continue

      for (let index = 0; index < dimension; index++) out[map[index] as number] = (out[map[index] as number] as number) + c * (v[index] as number)
    }

    return out
  }
  const dot = (a: Float64Array, b: Float64Array): number => {
    let s = 0

    for (let i = 0; i < a.length; i++) s += (a[i] as number) * (b[i] as number)

    return s
  }
  const steps = input.steps ?? 90
  const energies = new Map<string, number>()

  for (const irrep of irrepsOf(identical)) {
    const stream = makeWeyl({ start: 0 })
    const w = new Float64Array(dimension)

    for (let i = 0; i < dimension; i++) w[i] = stream.next() - 0.5

    let v = project(irrep, w)
    let norm = Math.sqrt(dot(v, v))

    if (norm < 1e-12) {
      energies.set(partitionName(irrep.partition), Number.NaN)
      continue
    }

    v = v.map(x => x / norm)

    const basis: Float64Array[] = [v]
    const alpha: number[] = []
    const beta: number[] = []
    const hv = new Float64Array(dimension)

    for (let k = 0; k < steps; k++) {
      apply(basis[k] as Float64Array, hv)

      let r = project(irrep, hv)
      const a = dot(r, basis[k] as Float64Array)

      alpha.push(a)

      for (const b of basis) {
        const c = dot(r, b)

        for (let i = 0; i < dimension; i++) r[i] = (r[i] as number) - c * (b[i] as number)
      }

      norm = Math.sqrt(dot(r, r))

      if (norm < 1e-10 || k === steps - 1) break

      beta.push(norm)
      r = r.map(x => x / norm)
      basis.push(r)
    }

    const m = alpha.length
    const t = makeDense({ rows: m, cols: m })

    for (let i = 0; i < m; i++) {
      denseSet(t, { row: i, col: i, value: alpha[i] as number })

      if (i + 1 < m) {
        denseSet(t, { row: i, col: i + 1, value: beta[i] as number })
        denseSet(t, { row: i + 1, col: i, value: beta[i] as number })
      }
    }

    energies.set(partitionName(irrep.partition), Math.min(...eigSymmetric({ matrix: t }).values))
  }

  return { energies, dimension }
}
