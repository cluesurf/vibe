// THE DOCK'S SYMMETRY GROUP, BUILT FROM THE DOCK'S OWN ROOTS (E-GMT-0039). Every reading here starts from a finite
// set of vectors (the dock's 24 slot roots, or a control's) and never from a named Coxeter diagram: the group is every
// orthogonal map of R^4 that permutes the set, found by sending a basis of the set to every tuple of the set with the
// same Gram matrix and keeping the maps that close the set exactly.
//
//   rootSymmetries      the group: each element's 4 x 4 matrix, its permutation of the vectors, its register action
//                       (so the package's molien and evenAction read it), checked exact (entries on the half-integer
//                       grid, M^T M = I and M r a member for every r, in exact double arithmetic)
//   reflectionsOf       the elements with det -1 and trace 2 (an orthogonal map with those is a reflection), with each
//                       one's mirror normal, the primitive integer direction of a nonzero column of I - M
//   generatedSize       the size of the subgroup some elements generate, by closure on the permutations
//   conjugacyClasses    the classes by orbits under conjugation, and the count again by Burnside (commuting pairs / |G|)
//   peelDegrees         the degrees a Molien series would have if the invariants were a polynomial ring: the least n
//                       where the series exceeds 1 / prod (1 - t^d) so far is added as a degree, repeated; then the
//                       whole series is compared. A group whose invariants are not a polynomial ring fails the compare
//                       or needs more degrees than the dimension
//   frameAction         each element's permutation of the three frames (the dock's pair partitions of the four axes),
//                       and whether every frame's roots go to one frame
//
// DETERMINISM: no random numbers. EXACT: every matrix entry is a multiple of 1/2 and every vector integral, so every
// product used in a verdict is exact in doubles.

import { closure, type GroupOps } from '@/code/algebra/group/finite-group'
import { degreeSeries } from '@/code/algebra/group/hurwitz-f4'
import { evenAction, type GroupElement } from '@/code/measure/spinor-register'
import { frameOf } from '@/code/measure/chiral-register'

type Vectors = readonly (readonly number[])[]

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

const keyOf = (v: readonly number[]): string => v.join(',')

// the rank of a set of 4-vectors, by elimination in doubles (small integers: exact enough for a rank)
function rank(vs: Vectors): number {
  const m = vs.map(v => [...v])

  let r = 0

  for (let c = 0; c < 4 && r < m.length; c++) {
    let p = r

    while (p < m.length && Math.abs(m[p]![c]!) < 1e-12) {
      p++
    }

    if (p === m.length) {
      continue
    }

    ;[m[p], m[r]] = [m[r]!, m[p]!]

    for (let i = 0; i < m.length; i++) {
      if (i === r) {
        continue
      }

      const f = m[i]![c]! / m[r]![c]!

      for (let j = 0; j < 4; j++) {
        m[i]![j]! -= f * m[r]![j]!
      }
    }

    r++
  }

  return r
}

// the inverse of a 4 x 4 matrix (Gauss-Jordan, doubles)
function inverse4(a: readonly (readonly number[])[]): number[][] {
  const m = a.map((r, i) => [...r, ...[0, 1, 2, 3].map(j => (i === j ? 1 : 0))])

  for (let c = 0; c < 4; c++) {
    let p = c

    while (Math.abs(m[p]![c]!) < 1e-12) {
      p++
    }

    ;[m[p], m[c]] = [m[c]!, m[p]!]

    const d = m[c]![c]!

    for (let j = 0; j < 8; j++) {
      m[c]![j]! /= d
    }

    for (let i = 0; i < 4; i++) {
      if (i === c) {
        continue
      }

      const f = m[i]![c]!

      for (let j = 0; j < 8; j++) {
        m[i]![j]! -= f * m[c]![j]!
      }
    }
  }

  return m.map(r => r.slice(4))
}

export type Symmetries = {
  elements: GroupElement[]
  // the largest |x - round(2 x) / 2| over every matrix entry before it was snapped to the half-integer grid
  snap: number
  // every kept element checked: M^T M = I exactly and M r an exact member for every r
  exact: boolean
}

// every orthogonal map of R^4 permuting `vectors` (which must span R^4)
export function rootSymmetries(vectors: Vectors): Symmetries {
  const n = vectors.length
  const index = new Map(vectors.map((v, i) => [keyOf(v), i]))
  const basis: number[] = []

  for (let i = 0; i < n && basis.length < 4; i++) {
    if (rank([...basis.map(b => vectors[b]!), vectors[i]!]) === basis.length + 1) {
      basis.push(i)
    }
  }

  if (basis.length !== 4) {
    throw new Error('the vectors do not span R^4')
  }

  const B = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => vectors[basis[j]!]![i]!))
  const Binv = inverse4(B)
  const gram = basis.map(a => basis.map(b => dot(vectors[a]!, vectors[b]!)))
  const elements: GroupElement[] = []
  const seen = new Set<string>()

  let snap = 0
  let exact = true

  const tuple: number[] = []

  const search = (depth: number): void => {
    if (depth === 4) {
      const C = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => vectors[tuple[j]!]![i]!))
      const raw = C.map(row =>
        [0, 1, 2, 3].map(j => row.reduce((s, x, k) => s + x * Binv[k]![j]!, 0)),
      )
      const M = raw.map(row => row.map(x => Math.round(2 * x) / 2))

      raw.forEach((row, i) => row.forEach((x, j) => (snap = Math.max(snap, Math.abs(x - M[i]![j]!)))))

      const slots = new Int32Array(n)

      for (let d = 0; d < n; d++) {
        const image = [0, 1, 2, 3].map(i => dot(M[i]!, vectors[d]!))
        const at = index.get(keyOf(image))

        if (at === undefined) {
          return
        }

        slots[d] = at
      }

      if (new Set(slots).size !== n) {
        return
      }

      const orthogonal = [0, 1, 2, 3].every(i =>
        [0, 1, 2, 3].every(j => [0, 1, 2, 3].reduce((s, k) => s + M[k]![i]! * M[k]![j]!, 0) === (i === j ? 1 : 0)),
      )

      if (!orthogonal) {
        exact = false

        return
      }

      const key = keyOf(Array.from(slots))

      if (!seen.has(key)) {
        seen.add(key)
        elements.push({ matrix: M, slots, register: evenAction(M) })
      }

      return
    }

    for (let c = 0; c < n; c++) {
      const v = vectors[c]!

      if (dot(v, v) !== gram[depth]![depth]) {
        continue
      }

      if (tuple.some((t, j) => dot(vectors[t]!, v) !== gram[j]![depth])) {
        continue
      }

      tuple.push(c)
      search(depth + 1)
      tuple.pop()
    }
  }

  search(0)

  return { elements, snap, exact }
}

const det4 = (m: readonly (readonly number[])[]): number => {
  const a = m.map(r => [...r])

  let d = 1

  for (let c = 0; c < 4; c++) {
    let p = c

    while (p < 4 && a[p]![c] === 0) {
      p++
    }

    if (p === 4) {
      return 0
    }

    if (p !== c) {
      ;[a[p], a[c]] = [a[c]!, a[p]!]
      d = -d
    }

    d *= a[c]![c]!

    for (let i = c + 1; i < 4; i++) {
      const f = a[i]![c]! / a[c]![c]!

      for (let j = c; j < 4; j++) {
        a[i]![j]! -= f * a[c]![j]!
      }
    }
  }

  return Math.round(d)
}

export const determinant = det4

export type Reflection = {
  element: GroupElement
  // the primitive integer mirror normal (sign fixed: first nonzero entry positive), scaled to clear halves
  normal: number[]
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function reflectionsOf(elements: readonly GroupElement[]): Reflection[] {
  const out: Reflection[] = []

  for (const e of elements) {
    const m = e.matrix
    const tr = m.reduce((s, r, i) => s + r[i]!, 0)

    if (tr !== 2 || det4(m) !== -1) {
      continue
    }

    // I - M has rank 1: its nonzero column is a multiple of the normal
    const col = [0, 1, 2, 3]
      .map(j => [0, 1, 2, 3].map(i => 2 * ((i === j ? 1 : 0) - m[i]![j]!)))
      .find(c => c.some(x => x !== 0))!
    const g = col.reduce((s, x) => gcd(s, x), 0)
    const v = col.map(x => x / g)
    const lead = v.find(x => x !== 0)!

    out.push({ element: e, normal: v.map(x => (lead < 0 ? -x : x)) })
  }

  return out
}

const permOps = (n: number): GroupOps<Int32Array> => ({
  multiply: (a, b) => {
    const o = new Int32Array(n)

    for (let d = 0; d < n; d++) {
      o[d] = a[b[d]!]!
    }

    return o
  },
  inverse: a => {
    const o = new Int32Array(n)

    for (let d = 0; d < n; d++) {
      o[a[d]!] = d
    }

    return o
  },
  key: a => a.join(','),
})

// the subgroup generated by `generators`, as permutation keys (the trivial group when there are none)
export function generatedKeys(generators: readonly GroupElement[]): Set<string> {
  if (generators.length === 0) {
    return new Set(['identity'])
  }

  const ops = permOps(generators[0]!.slots.length)

  return new Set(
    closure(
      generators.map(g => g.slots),
      ops,
    ).map(p => ops.key(p)),
  )
}

export const generatedSize = (generators: readonly GroupElement[]): number => generatedKeys(generators).size

export type Classes = {
  // class sizes, largest first
  sizes: number[]
  // the class count again, by Burnside: commuting ordered pairs over |G|
  burnside: number
}

export function conjugacyClasses(elements: readonly GroupElement[]): Classes {
  const n = elements[0]!.slots.length
  const ops = permOps(n)
  const perms = elements.map(e => e.slots)
  const keys = perms.map(p => ops.key(p))
  const indexOf = new Map(keys.map((k, i) => [k, i]))
  const inverses = perms.map(p => ops.inverse(p))
  const seen = new Uint8Array(perms.length)
  const sizes: number[] = []

  for (let i = 0; i < perms.length; i++) {
    if (seen[i]) {
      continue
    }

    let size = 0

    for (let h = 0; h < perms.length; h++) {
      const c = ops.multiply(ops.multiply(perms[h]!, perms[i]!), inverses[h]!)
      const j = indexOf.get(ops.key(c))

      if (j === undefined) {
        throw new Error('the elements are not closed under conjugation')
      }

      if (!seen[j]) {
        seen[j] = 1
        size++
      }
    }

    sizes.push(size)
  }

  let commuting = 0

  for (const pa of perms) {
    for (const pb of perms) {
      const x = ops.multiply(pa, pb)
      const y = ops.multiply(pb, pa)

      if (x.every((v, d) => v === y[d])) {
        commuting++
      }
    }
  }

  return { sizes: sizes.sort((a, b) => b - a), burnside: commuting / perms.length }
}

export type Peel = {
  degrees: number[]
  // the series equals 1 / prod (1 - t^d) for the peeled degrees through the last coefficient
  matches: boolean
  // the first coefficient where the series fell BELOW the product so far (not a polynomial ring), or -1
  below: number
}

// the degrees of a polynomial ring with this Hilbert series, read greedily, and whether the series is that ring's
export function peelDegrees(series: readonly bigint[]): Peel {
  const N = series.length - 1
  const degrees: number[] = []

  let below = -1

  for (let n = 1; n <= N; n++) {
    let s = degreeSeries(degrees, N)

    while (BigInt(s[n]!) < series[n]!) {
      degrees.push(n)
      s = degreeSeries(degrees, N)
    }

    if (BigInt(s[n]!) > series[n]! && below < 0) {
      below = n
    }
  }

  const s = degreeSeries(degrees, N)

  return {
    degrees,
    matches: s.every((x, n) => BigInt(x) === series[n]),
    below,
  }
}

export type FrameAction = {
  // [element][frame] the frame it goes to
  images: number[][]
  // every element sends all 8 roots of each frame into one frame
  consistent: boolean
}

// the action on the three frames of the dock (the pair partitions 01|23, 02|13, 03|12 of the roots' support)
export function frameAction(elements: readonly GroupElement[], roots: Vectors): FrameAction {
  const frames = roots.map(frameOf)

  let consistent = true

  const images = elements.map(e => {
    const image = [-1, -1, -1]

    roots.forEach((_, d) => {
      const to = frames[e.slots[d]!]!
      const from = frames[d]!

      if (image[from]! < 0) {
        image[from] = to
      } else if (image[from] !== to) {
        consistent = false
      }
    })

    return image
  })

  return { images, consistent }
}
