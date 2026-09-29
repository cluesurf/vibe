// A FINITE-GROUP LINK REGISTER ON A SMALL HUSK PATCH, EVOLVED EXACTLY UNDER A SMALL-ANGLE BEAT (E-SPN-0154). The
// question is prethermal keeping (Abanin, De Roeck, Ho and Huveneers 2017): does a bounded-register Floquet beat hold the
// ground state of its Hamiltonian for a time that grows as exp(c / delta) as the beat angle delta shrinks. This module
// carries everything the question needs, general in the group (2I, Q8, the trivial group) and in the patch:
//
//   patches        a set of husk docks, its links (each a husk vector) and its triangles (each a husk triangle), with a
//                  spanning tree from dock 0 (breadth first). The register holds one group value on every link; the
//                  tree links are gauge fixed to the identity, so a gauge-fixed configuration is the tuple of values on
//                  the non-tree links (one digit each, G^loops configurations), and the residual gauge freedom is one
//                  global conjugation
//   the electric   on link l, psi(c) -> sum_h e(h) psi(T_l(h) c): a non-tree link's digit is left multiplied by h; a tree
//                  link (parent p, child v) is moved to h and gauge fixed back, which multiplies every non-tree digit
//                  with its tail in v's subtree by h on the left and every one with its head there by h^-1 on the
//                  right. e is a real class function with e(h) = e(h^-1), so the orientation convention drops out
//   the magnetic   diagonal: an integer class function n_B of each triangle's holonomy (tree links read the identity)
//   sectors        the global conjugation orbits (the Gauss sector) and their unions under the patch's automorphisms
//                  (dock permutations carrying links to links and triangles to triangles). The Hamiltonian is dense on
//                  the symmetric sector, built from ONE representative row per sector (every row of a sector is equal,
//                  checked exactly by a second representative)
//   the beat       F = E(theta) M(2 r theta) E(theta) (Strang), E = prod_l sum_R w^(n_R) P_R, M = prod_p w^(2 r n_B(U_p)),
//                  w = e^(i theta) a norm-one ring unit, so F = exp(i delta H_F) with delta = 2 |theta| and H_F = H + O(delta^2),
//                  H = H_E + r H_B. On the sector F is built in the eigenbasis of H_E, whose spectrum is integer
//   Floquet        F is complex symmetric and unitary, so Re F and Im F commute and its eigenvectors are real: they are
//                  those of Re F + t Im F (t the golden ratio's inverse), a cluster re-split with t = sqrt2 - 1, each pair
//                  checked by its residual |F u - lambda u|
//   survival       from the Floquet decomposition, the fidelity and the energy of the prepared state at any beat and their
//                  running means over beats 1..N in closed form
//   cross-checks   the same beat applied link by link on the whole gauge-fixed register (no sectors), and on the
//                  UNFIXED register (every link free, the real Gauss law at every dock) for a small group
//   exact          2I's characters in Z[phi] (class constancy, completeness, orthogonal idempotents under convolution,
//                  checked with integers), the ring units' norms (bigints), the magnetic exponents' integrality
//
// DETERMINISM: no random numbers; the Lanczos start is the Weyl stream (code/algebra/linear/eig-lanczos). EXACT: the rule's
// pieces (characters in Z[phi], units in Z[w][1/7], integer exponents); amplitudes, spectra and evolutions are float
// measurement of that exact unitary. NOTHING MOVES: a link holds a value, a plaquette reads the product around it.

import {
  huskVectors,
  nearest,
  type GaugeGroup,
} from '@/code/measure/hurwitz-gauge'
import {
  goldenParts,
  type GroupCharacters,
} from '@/code/measure/gauge-window'
import { symmetricEigen } from '@/code/measure/quantum-ladder'
import { ringUnit, unitNormExact } from '@/code/measure/swap-string'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

// ---------------------------------------------------------------------------------------------------------
// patches

export type Patch = {
  name: string
  docks: number[][]
  // (a, b) with a < b: the stored orientation a -> b
  links: [number, number][]
  triangles: [number, number, number][]
  tree: boolean[]
  // per dock: its tree parent and the tree link to it (-1 at the root, dock 0)
  parent: number[]
  parentLink: number[]
  // subtree[v][u]: u lies in the subtree of v
  subtree: boolean[][]
  // the non-tree links in order: the register's digits
  loops: number[]
  // every link a husk vector and every triangle three links of the patch
  husk: boolean
}

export function patchOf(
  name: string,
  docks: number[][],
  links: [number, number][],
  triangles: [number, number, number][],
): Patch {
  const V = docks.length
  const keys = new Set(huskVectors().map(v => v.join(',')))
  const linkIndex = new Map(links.map(([a, b], i) => [`${a},${b}`, i]))
  const findLink = (a: number, b: number): number =>
    linkIndex.get(`${Math.min(a, b)},${Math.max(a, b)}`) ?? -1

  let husk = links.every(
    ([a, b]) =>
      a < b &&
      keys.has(docks[b]!.map((x, k) => x - docks[a]![k]!).join(',')),
  )

  for (const [a, b, c] of triangles) {
    if (
      findLink(a, b) < 0 ||
      findLink(b, c) < 0 ||
      findLink(a, c) < 0
    ) {
      husk = false
    }
  }

  const parent = new Array<number>(V).fill(-1)
  const parentLink = new Array<number>(V).fill(-1)
  const tree = new Array<boolean>(links.length).fill(false)
  const seen = new Array<boolean>(V).fill(false)
  const queue = [0]

  seen[0] = true

  while (queue.length) {
    const p = queue.shift()!

    links.forEach(([a, b], l) => {
      const q = a === p ? b : b === p ? a : -1

      if (q < 0 || seen[q]) {
        return
      }

      seen[q] = true
      parent[q] = p
      parentLink[q] = l
      tree[l] = true
      queue.push(q)
    })
  }

  if (seen.some(s => !s)) {
    throw new Error(`prethermal-patch: ${name} is not connected`)
  }

  const subtree = docks.map((_, v) =>
    docks.map((__, u) => {
      for (let w = u; w >= 0; w = parent[w]!) {
        if (w === v) {
          return true
        }
      }

      return false
    }),
  )
  const loops = links.map((_, l) => l).filter(l => !tree[l])

  return {
    name,
    docks,
    links,
    triangles,
    tree,
    parent,
    parentLink,
    subtree,
    loops,
    husk,
  }
}

// the regular husk tetrahedron: four docks pairwise one face diagonal apart, its four faces equilateral husk triangles
const O = [0, 0, 0]
const A = [1, 1, 0]
const B = [1, 0, 1]
const C = [0, 1, 1]

export const huskTriangle = (): Patch =>
  patchOf(
    'triangle',
    [O, A, B],
    [
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    [[0, 1, 2]],
  )

export const huskRhombus = (): Patch =>
  patchOf(
    'rhombus',
    [O, A, B, C],
    [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [2, 3],
    ],
    [
      [0, 1, 2],
      [1, 2, 3],
    ],
  )

export const huskTetrahedron = (): Patch =>
  patchOf(
    'tetrahedron',
    [O, A, B, C],
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ],
    [
      [0, 1, 2],
      [0, 1, 3],
      [0, 2, 3],
      [1, 2, 3],
    ],
  )

// dock permutations carrying links to links and triangles to triangles (all V! tried; V is small)
export function patchAutomorphisms(p: Patch): number[][] {
  const V = p.docks.length
  const linkKeys = new Set(p.links.map(([a, b]) => `${a},${b}`))
  const triKeys = new Set(
    p.triangles.map(t => [...t].sort((x, y) => x - y).join(',')),
  )
  const out: number[][] = []
  const perm = (xs: number[]): number[][] =>
    xs.length <= 1
      ? [xs]
      : xs.flatMap((x, i) =>
          perm([...xs.slice(0, i), ...xs.slice(i + 1)]).map(r => [
            x,
            ...r,
          ]),
        )

  for (const s of perm([...Array(V).keys()])) {
    const linksOk = p.links.every(([a, b]) =>
      linkKeys.has(
        `${Math.min(s[a]!, s[b]!)},${Math.max(s[a]!, s[b]!)}`,
      ),
    )
    const trisOk = p.triangles.every(t =>
      triKeys.has(
        t
          .map(x => s[x]!)
          .sort((x, y) => x - y)
          .join(','),
      ),
    )

    if (linksOk && trisOk) {
      out.push(s)
    }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the gauge-fixed register

export type LinkOp = { digit: number; left: boolean; right: boolean }

export type Register = {
  group: GaugeGroup
  patch: Patch
  digits: number
  size: number
  // per link: the digits it moves and how (a non-tree link: its own digit on the left)
  ops: LinkOp[][]
  // the class index of every element
  classOf: Int16Array
  classes: number[][]
}

export function registerOf(
  group: GaugeGroup,
  patch: Patch,
  classes: number[][],
): Register {
  const digits = patch.loops.length
  const size = group.order ** digits
  const ops = patch.links.map((_, l) => {
    if (!patch.tree[l]) {
      return [
        { digit: patch.loops.indexOf(l), left: true, right: false },
      ]
    }

    // the child end of tree link l
    const v = patch.parentLink.indexOf(l)
    const sub = patch.subtree[v]!

    return patch.loops
      .map((k, d) => {
        const [a, b] = patch.links[k]!

        return { digit: d, left: sub[a]!, right: sub[b]! }
      })
      .filter(o => o.left || o.right)
  })
  const classOf = new Int16Array(group.order)

  classes.forEach((cl, i) => cl.forEach(x => (classOf[x] = i)))

  return { group, patch, digits, size, ops, classOf, classes }
}

export function decode(r: Register, c: number, out: Int16Array): void {
  const G = r.group.order

  for (let d = 0; d < r.digits; d++) {
    out[d] = c % G
    c = Math.floor(c / G)
  }
}

export function encode(r: Register, x: ArrayLike<number>): number {
  let c = 0

  for (let d = r.digits - 1; d >= 0; d--) {
    c = c * r.group.order + x[d]!
  }

  return c
}

const mul = (g: GaugeGroup, a: number, b: number): number =>
  g.table[a * g.order + b]!

// T_l(h) on a configuration's digits (x is read, y written)
export function moveDigits(
  r: Register,
  l: number,
  h: number,
  x: Int16Array,
  y: Int16Array,
): void {
  const g = r.group
  const hi = g.inverse[h]!

  y.set(x)

  for (const o of r.ops[l]!) {
    let v = x[o.digit]!

    if (o.left) {
      v = mul(g, h, v)
    }

    if (o.right) {
      v = mul(g, v, hi)
    }

    y[o.digit] = v
  }
}

// the value of link l in the fixed gauge (the identity on a tree link), oriented from a to b
function linkValue(
  r: Register,
  x: Int16Array,
  a: number,
  b: number,
): number {
  const p = r.patch
  const l = p.links.findIndex(
    ([s, t]) => (s === a && t === b) || (s === b && t === a),
  )

  if (l < 0) {
    throw new Error('prethermal-patch: no such link')
  }

  const v = p.tree[l] ? r.group.identity : x[p.loops.indexOf(l)]!

  return p.links[l]![0] === a ? v : r.group.inverse[v]!
}

export function holonomy(
  r: Register,
  x: Int16Array,
  t: readonly number[],
): number {
  let h = r.group.identity

  for (let i = 0; i < t.length; i++) {
    h = mul(r.group, h, linkValue(r, x, t[i]!, t[(i + 1) % t.length]!))
  }

  return h
}

// ---------------------------------------------------------------------------------------------------------
// the Hamiltonian's class functions

// the electric kernel of H_E on one link, e(h) = sum_R n_R d_R chi_R(h) / |G| (n_R an integer per irrep)
export function electricKernel(
  g: GaugeGroup,
  c: GroupCharacters,
  n: readonly number[],
): Float64Array {
  return Float64Array.from(
    { length: g.order },
    (_, h) =>
      c.chars.reduce(
        (s, row, R) => s + n[R]! * c.dims[R]! * row[h]!,
        0,
      ) / g.order,
  )
}

// the Cayley-graph Laplacian on one link (any group): |S| at the identity, -1 on the nearest elements S
export function cayleyKernel(g: GaugeGroup): Float64Array {
  const S = g.order > 1 ? nearest(g) : []
  const e = new Float64Array(g.order)

  e[g.identity] = S.length

  for (const s of S) {
    e[s] = -1
  }

  return e
}

// the integer magnetic exponent n_B = 5 (2 - a) - 8 b of chi_2 = 2 q0 = a + b phi (8/5 the Fibonacci approximant of
// phi, so n_B / 5 is Wilson's 2 - chi_2 to within 5% and increasing in 2 - chi_2); null where a or b is not an integer
export function magneticExponents(g: GaugeGroup): Int32Array | null {
  const out = new Int32Array(g.order)

  for (let x = 0; x < g.order; x++) {
    const p = goldenParts(2 * g.q0[x]!)

    if (!p || !Number.isInteger(p.a) || !Number.isInteger(p.b)) {
      return null
    }

    out[x] = 5 * (2 - p.a) - 8 * p.b
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// exact checks

export type ExactAlgebra = {
  integral: boolean
  classConstant: boolean
  completeness: boolean
  idempotents: boolean
  checked: number
}

type Golden = [number, number]

const gmul = (x: Golden, y: Golden): Golden => [
  x[0] * y[0] + x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] + x[1] * y[1],
]

// 2I's characters as integer pairs (a, b) = a + b phi: constant on classes, sum_R d_R chi_R = |G| delta_1, and chi_R *
// chi_S = delta_RS (|G| / d_R) chi_R under convolution. With these, E = sum_R w^(n_R) P_R (P_R = (d_R / |G|) chi_R *)
// is exactly unitary for any norm-one w and exactly a class function (Gauss)
export function exactCharacterAlgebra(
  g: GaugeGroup,
  c: GroupCharacters,
  classOf: Int16Array,
): ExactAlgebra {
  const K = c.chars.length
  const n = g.order
  const parts: Golden[][] = c.chars.map(row =>
    row.map(v => {
      const p = goldenParts(v)

      return p ? [p.a, p.b] : [NaN, NaN]
    }),
  )
  const integral = parts.every(row =>
    row.every(p => Number.isInteger(p[0]) && Number.isInteger(p[1])),
  )

  let classConstant = true

  for (let R = 0; R < K; R++) {
    const first = new Map<number, string>()

    for (let x = 0; x < n; x++) {
      const key = parts[R]![x]!.join(',')
      const cl = classOf[x]!
      const f = first.get(cl)

      if (f === undefined) {
        first.set(cl, key)
      } else if (f !== key) {
        classConstant = false
      }
    }
  }

  let completeness = true

  for (let x = 0; x < n; x++) {
    let s: Golden = [0, 0]

    for (let R = 0; R < K; R++) {
      const v = parts[R]![x]!
      const d = c.dims[R]!

      s = [s[0] + d * v[0], s[1] + d * v[1]]
    }

    if (s[0] !== (x === g.identity ? n : 0) || s[1] !== 0) {
      completeness = false
    }
  }

  let idempotents = true
  let checked = 0

  for (let R = 0; R < K; R++) {
    for (let S = 0; S < K; S++) {
      for (let x = 0; x < n; x++) {
        let s: Golden = [0, 0]

        for (let h = 0; h < n; h++) {
          const t = gmul(
            parts[R]![h]!,
            parts[S]![mul(g, g.inverse[h]!, x)]!,
          )

          s = [s[0] + t[0], s[1] + t[1]]
        }

        const want: Golden =
          R === S
            ? [
                parts[R]![x]![0] * (n / c.dims[R]!),
                parts[R]![x]![1] * (n / c.dims[R]!),
              ]
            : [0, 0]

        if (
          !Number.isSafeInteger(s[0]) ||
          !Number.isSafeInteger(s[1]) ||
          s[0] !== want[0] ||
          s[1] !== want[1]
        ) {
          idempotents = false
        }

        checked++
      }
    }
  }

  return { integral, classConstant, completeness, idempotents, checked }
}

// ---------------------------------------------------------------------------------------------------------
// small-angle ring units: w = ringUnit(k, j) = w^j ((3 + w)^2 / 7)^k, angle k theta1 + j pi / 3 (theta1 = 2 arg(3 + w),
// irrational in pi, so the angles are dense). For each target delta the least k with |2 angle - delta| <= tol delta

// the angle of an exact unit whose integers are too large for a float: both scaled down by the same power of 2
export function exactUnitAngle(u: RingUnit): number {
  const bits = u.den.toString(2).length
  const shift = BigInt(Math.max(0, bits - 60))
  const a = Number(u.num[0] >> shift)
  const b = Number(u.num[1] >> shift)

  return Math.atan2((b * Math.sqrt(3)) / 2, a - b / 2)
}

export type SmallUnit = {
  target: number
  k: number
  j: number
  theta: number
  delta: number
  exact: boolean
  angleGap: number
}

export function smallAngleUnits(
  targets: readonly number[],
  kMax: number,
  tol: number,
): SmallUnit[] {
  const theta1 = 2 * Math.atan2(Math.sqrt(3) / 2, 2.5)

  return targets.map(target => {
    for (let k = 1; k <= kMax; k++) {
      for (let j = 0; j < 6; j++) {
        // the angle reduced to (-pi, pi], carried as k theta1 + j pi/3 with the multiple of 2 pi removed exactly enough
        let t = (k * theta1 + (j * Math.PI) / 3) % (2 * Math.PI)

        if (t > Math.PI) {
          t -= 2 * Math.PI
        }

        if (Math.abs(2 * Math.abs(t) - target) <= tol * target) {
          const u = ringUnit(k, j)
          const exactTheta = exactUnitAngle(u)

          return {
            target,
            k,
            j,
            theta: exactTheta,
            delta: 2 * Math.abs(exactTheta),
            exact: unitNormExact(u),
            angleGap: Math.abs(exactTheta - t),
          }
        }
      }
    }

    throw new Error(
      `prethermal-patch: no unit within ${tol} of delta ${target} below k ${kMax}`,
    )
  })
}

// ---------------------------------------------------------------------------------------------------------
// sectors: conjugation orbits (Gauss) and their unions under the patch automorphisms

export type Sectors = {
  orbitOf: Int32Array
  orbitSize: Int32Array
  orbitRep: Int32Array
  orbits: number
  superOf: Int32Array
  // per symmetric sector: a representative configuration, a second one (or the same), and its configuration count
  rep: Int32Array
  rep2: Int32Array
  count: Float64Array
  n: number
  automorphisms: number[][]
}

// the automorphism s acting on a gauge-fixed configuration: the permuted register, gauge fixed again from dock 0
export function actAutomorphism(
  r: Register,
  s: readonly number[],
  x: Int16Array,
  y: Int16Array,
): void {
  const p = r.patch
  const g = r.group
  const V = p.docks.length
  const inv = new Array<number>(V)

  s.forEach((t, a) => (inv[t] = a))

  // the new register's value on the oriented pair (a, b): the old one on (inv a, inv b)
  const valueNew = (a: number, b: number): number =>
    linkValue(r, x, inv[a]!, inv[b]!)
  const gauge = new Array<number>(V).fill(g.identity)
  const order: number[] = [0]

  for (let i = 0; i < order.length; i++) {
    const q = order[i]!

    for (let v = 0; v < V; v++) {
      if (p.parent[v] !== q) {
        continue
      }

      gauge[v] = mul(g, gauge[q]!, valueNew(q, v))
      order.push(v)
    }
  }

  p.loops.forEach((l, d) => {
    const [a, b] = p.links[l]!

    y[d] = mul(
      g,
      mul(g, gauge[a]!, valueNew(a, b)),
      g.inverse[gauge[b]!]!,
    )
  })
}

export function sectorsOf(r: Register): Sectors {
  const g = r.group
  const size = r.size
  const orbitOf = new Int32Array(size).fill(-1)
  const sizes: number[] = []
  const reps: number[] = []
  const x = new Int16Array(r.digits)
  const y = new Int16Array(r.digits)

  for (let c = 0; c < size; c++) {
    if (orbitOf[c]! >= 0) {
      continue
    }

    const id = sizes.length

    let count = 0

    decode(r, c, x)

    for (let h = 0; h < g.order; h++) {
      const hi = g.inverse[h]!

      for (let d = 0; d < r.digits; d++) {
        y[d] = mul(g, mul(g, h, x[d]!), hi)
      }

      const c2 = encode(r, y)

      if (orbitOf[c2]! < 0) {
        orbitOf[c2] = id
        count++
      }
    }

    sizes.push(count)
    reps.push(c)
  }

  const automorphisms = patchAutomorphisms(r.patch)
  const orbits = sizes.length
  const root = Int32Array.from({ length: orbits }, (_, i) => i)

  const find = (i: number): number => {
    while (root[i] !== i) {
      root[i] = root[root[i]!]!
      i = root[i]!
    }

    return i
  }

  for (let o = 0; o < orbits; o++) {
    decode(r, reps[o]!, x)

    for (const s of automorphisms) {
      actAutomorphism(r, s, x, y)

      const a = find(o)
      const b = find(orbitOf[encode(r, y)]!)

      if (a !== b) {
        root[Math.max(a, b)] = Math.min(a, b)
      }
    }
  }

  const superOfOrbit = new Int32Array(orbits).fill(-1)

  let n = 0

  for (let o = 0; o < orbits; o++) {
    const f = find(o)

    if (superOfOrbit[f]! < 0) {
      superOfOrbit[f] = n++
    }

    superOfOrbit[o] = superOfOrbit[f]!
  }

  const superOf = new Int32Array(size)
  const rep = new Int32Array(n).fill(-1)
  const rep2 = new Int32Array(n).fill(-1)
  const count = new Float64Array(n)

  for (let c = 0; c < size; c++) {
    const s = superOfOrbit[orbitOf[c]!]!

    superOf[c] = s
    count[s] = count[s]! + 1

    if (rep[s]! < 0) {
      rep[s] = c
    }

    rep2[s] = c
  }

  return {
    orbitOf,
    orbitSize: Int32Array.from(sizes),
    orbitRep: Int32Array.from(reps),
    orbits,
    superOf,
    rep,
    rep2,
    count,
    n,
    automorphisms,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the sector Hamiltonian

export type SectorModel = {
  n: number
  // H_E on the sector (dense, row-major) and the magnetic energy of each sector (sum over triangles of n_B)
  HE: Float64Array
  hB: Float64Array
  // exact: every sector's row read from its second representative has the same (link, class, sector) counts, and n_B is
  // constant on every sector (checked at every configuration)
  rowsEqual: boolean
  magneticConstant: boolean
  // the largest |H_E - H_E^T|
  asymmetry: number
}

export function sectorModel(
  r: Register,
  s: Sectors,
  eH: Float64Array,
  nB: Int32Array,
): SectorModel {
  const n = s.n
  const G = r.group.order
  const HE = new Float64Array(n * n)
  const hB = new Float64Array(n)
  const x = new Int16Array(r.digits)
  const y = new Int16Array(r.digits)

  const rowKey = (c: number): Map<string, number> => {
    const m = new Map<string, number>()

    decode(r, c, x)

    for (let l = 0; l < r.patch.links.length; l++) {
      for (let h = 0; h < G; h++) {
        moveDigits(r, l, h, x, y)

        const key = `${r.classOf[h]},${s.superOf[encode(r, y)]}`

        m.set(key, (m.get(key) ?? 0) + 1)
      }
    }

    return m
  }

  const magneticOf = (c: number): number => {
    decode(r, c, x)

    return r.patch.triangles.reduce(
      (a, t) => a + nB[holonomy(r, x, t)]!,
      0,
    )
  }

  for (let S1 = 0; S1 < n; S1++) {
    const c = s.rep[S1]!

    decode(r, c, x)

    for (let l = 0; l < r.patch.links.length; l++) {
      for (let h = 0; h < G; h++) {
        moveDigits(r, l, h, x, y)

        const S = s.superOf[encode(r, y)]!

        HE[S1 * n + S] =
          HE[S1 * n + S]! +
          Math.sqrt(s.count[S1]! / s.count[S]!) * eH[h]!
      }
    }

    hB[S1] = magneticOf(c)
  }

  let rowsEqual = true

  for (let S1 = 0; S1 < n; S1++) {
    if (s.rep2[S1] === s.rep[S1]) {
      continue
    }

    const a = rowKey(s.rep[S1]!)
    const b = rowKey(s.rep2[S1]!)

    if (a.size !== b.size || [...a].some(([k, v]) => b.get(k) !== v)) {
      rowsEqual = false
    }
  }

  let magneticConstant = true

  for (let c = 0; c < r.size; c++) {
    if (magneticOf(c) !== hB[s.superOf[c]!]) {
      magneticConstant = false
    }
  }

  let asymmetry = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      asymmetry = Math.max(
        asymmetry,
        Math.abs(HE[i * n + j]! - HE[j * n + i]!),
      )
    }
  }

  return { n, HE, hB, rowsEqual, magneticConstant, asymmetry }
}

// ---------------------------------------------------------------------------------------------------------
// dense helpers (row-major n x n)

// C = A^T diag(d) A, A real
export function congruence(
  n: number,
  a: Float64Array,
  d: ArrayLike<number>,
): Float64Array {
  const c = new Float64Array(n * n)

  for (let k = 0; k < n; k++) {
    const dk = d[k]!

    if (dk === 0) {
      continue
    }

    const row = k * n

    for (let i = 0; i < n; i++) {
      const f = a[row + i]! * dk

      if (f === 0) {
        continue
      }

      const ci = i * n

      for (let j = 0; j < n; j++) {
        c[ci + j] = c[ci + j]! + f * a[row + j]!
      }
    }
  }

  return c
}

// C = A^T B (A n x n, B n x m)
export function transposeTimes(
  n: number,
  m: number,
  a: Float64Array,
  b: Float64Array,
): Float64Array {
  const c = new Float64Array(n * m)

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      const f = a[k * n + i]!

      if (f === 0) {
        continue
      }

      for (let j = 0; j < m; j++) {
        c[i * m + j] = c[i * m + j]! + f * b[k * m + j]!
      }
    }
  }

  return c
}

// C = A B (A n x n, B n x m)
export function times(
  n: number,
  m: number,
  a: Float64Array,
  b: Float64Array,
): Float64Array {
  const c = new Float64Array(n * m)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const f = a[i * n + k]!

      if (f === 0) {
        continue
      }

      for (let j = 0; j < m; j++) {
        c[i * m + j] = c[i * m + j]! + f * b[k * m + j]!
      }
    }
  }

  return c
}

// ---------------------------------------------------------------------------------------------------------
// the electric eigenbasis and the ground state

export type ElectricBasis = {
  n: number
  // columns: eigenvectors of H_E on the sector; m their (integer) eigenvalues
  V: Float64Array
  m: Float64Array
  // the largest distance of an H_E eigenvalue from an integer
  integerError: number
  // V^T diag(hB) V: the magnetic energy in the electric basis
  hBE: Float64Array
}

export function electricBasis(model: SectorModel): ElectricBasis {
  const n = model.n
  const e = symmetricEigen(n, Float64Array.from(model.HE))

  let integerError = 0

  const m = Float64Array.from(e.values, v => {
    integerError = Math.max(integerError, Math.abs(v - Math.round(v)))

    return Math.round(v)
  })

  return {
    n,
    V: e.vectors,
    m,
    integerError,
    hBE: congruence(n, e.vectors, model.hB),
  }
}

export type Ground = {
  E0: number
  E1: number
  Einf: number
  psi: Float64Array
  psiE: Float64Array
  H: Float64Array
  spread: number
}

// the ground state of H = H_E + r H_B on the sector (psi in the sector basis, psiE in the electric basis), the first
// excited level, the infinite-temperature energy Tr H / n, H itself in the electric basis, and H's spectral width
export function groundOf(
  model: SectorModel,
  basis: ElectricBasis,
  r: number,
): Ground {
  const n = model.n
  const H = Float64Array.from(model.HE)

  for (let i = 0; i < n; i++) {
    H[i * n + i] = H[i * n + i]! + r * model.hB[i]!
  }

  let trace = 0

  for (let i = 0; i < n; i++) {
    trace += H[i * n + i]!
  }

  const e = symmetricEigen(n, Float64Array.from(H))
  const psi = Float64Array.from(
    { length: n },
    (_, i) => e.vectors[i * n]!,
  )
  const psiE = new Float64Array(n)

  for (let j = 0; j < n; j++) {
    let s = 0

    for (let i = 0; i < n; i++) {
      s += basis.V[i * n + j]! * psi[i]!
    }

    psiE[j] = s
  }

  const HEb = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      HEb[i * n + j] =
        (i === j ? basis.m[i]! : 0) + r * basis.hBE[i * n + j]!
    }
  }

  return {
    E0: e.values[0]!,
    E1: e.values[1]!,
    Einf: trace / n,
    psi,
    psiE,
    H: HEb,
    spread: e.values[n - 1]! - e.values[0]!,
  }
}

// the mean over the patch's triangles of <q0(U_p)> in a sector state, and the same for a closed walk of docks
export function loopMean(
  r: Register,
  s: Sectors,
  psi: Float64Array,
  walks: readonly (readonly number[])[],
): number {
  const x = new Int16Array(r.digits)

  let total = 0

  for (let S = 0; S < s.n; S++) {
    decode(r, s.rep[S]!, x)

    let q = 0

    for (const w of walks) {
      q += r.group.q0[holonomy(r, x, w)]!
    }

    total += psi[S]! ** 2 * (q / walks.length)
  }

  return total
}

// the lowest eigenvalue of H on the whole Gauss sector (conjugation orbits, no automorphisms) by Lanczos, matrix free
export function gaussGround(
  r: Register,
  s: Sectors,
  eH: Float64Array,
  nB: Int32Array,
  coupling: number,
  steps: number,
): number {
  const G = r.group.order
  const x = new Int16Array(r.digits)
  const y = new Int16Array(r.digits)
  const diag = new Float64Array(s.orbits)
  // the rows: for each orbit, its (orbit, weight) pairs
  const cols: Int32Array[] = []
  const vals: Float64Array[] = []

  for (let o = 0; o < s.orbits; o++) {
    const c = s.orbitRep[o]!
    const acc = new Map<number, number>()

    decode(r, c, x)
    diag[o] =
      coupling *
      r.patch.triangles.reduce((a, t) => a + nB[holonomy(r, x, t)]!, 0)

    for (let l = 0; l < r.patch.links.length; l++) {
      for (let h = 0; h < G; h++) {
        moveDigits(r, l, h, x, y)

        const o2 = s.orbitOf[encode(r, y)]!

        acc.set(
          o2,
          (acc.get(o2) ?? 0) +
            Math.sqrt(s.orbitSize[o]! / s.orbitSize[o2]!) * eH[h]!,
        )
      }
    }

    cols.push(Int32Array.from(acc.keys()))
    vals.push(Float64Array.from(acc.values()))
  }

  const values = lowestEigenvalues({
    operator: {
      size: s.orbits,
      apply: ({ x: v }) => {
        const out = new Float64Array(s.orbits)

        for (let o = 0; o < s.orbits; o++) {
          const cs = cols[o]!
          const vs = vals[o]!

          let t = diag[o]! * v[o]!

          for (let k = 0; k < cs.length; k++) {
            t += vs[k]! * v[cs[k]!]!
          }

          out[o] = t
        }

        return out
      },
    },
    count: 1,
    steps,
  })

  return values[0]!
}

// ---------------------------------------------------------------------------------------------------------
// the Floquet beat on the sector, in the electric basis

export type Floquet = {
  n: number
  // Re F and Im F (symmetric), row-major
  Fre: Float64Array
  Fim: Float64Array
  // real orthonormal eigenvectors (columns) and phases (F u = e^(i phase) u)
  U: Float64Array
  phases: Float64Array
  residual: number
  unitarity: number
  clusters: number
}

// F = E(theta) M(2 r theta) E(theta): E is diagonal here (e^(i theta m)), M = V^T diag(e^(i 2 r theta hB)) V
export function floquetOf(
  model: SectorModel,
  basis: ElectricBasis,
  theta: number,
  r: number,
): Floquet {
  const n = model.n
  const C = congruence(
    n,
    basis.V,
    Float64Array.from(model.hB, b => Math.cos(2 * r * theta * b)),
  )
  const S = congruence(
    n,
    basis.V,
    Float64Array.from(model.hB, b => Math.sin(2 * r * theta * b)),
  )
  const Fre = new Float64Array(n * n)
  const Fim = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = theta * (basis.m[i]! + basis.m[j]!)
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const c = C[i * n + j]!
      const s = S[i * n + j]!

      Fre[i * n + j] = ca * c - sa * s
      Fim[i * n + j] = sa * c + ca * s
    }
  }

  const K = new Float64Array(n * n)

  for (let k = 0; k < n * n; k++) {
    K[k] = Fre[k]! + GOLDEN * Fim[k]!
  }

  const e = symmetricEigen(n, K)
  const U = e.vectors

  let clusters = 0
  let start = 0

  const scale = 1 + GOLDEN

  while (start < n) {
    let end = start + 1

    while (
      end < n &&
      e.values[end]! - e.values[end - 1]! <= 1e-9 * scale
    ) {
      end++
    }

    if (end - start > 1) {
      clusters++

      // re-split the cluster with t = sqrt2 - 1
      const k = end - start
      const W = new Float64Array(n * k)

      for (let i = 0; i < n; i++) {
        for (let a = 0; a < k; a++) {
          W[i * k + a] = U[i * n + start + a]!
        }
      }

      const AW = times(n, k, Fre, W)
      const BW = times(n, k, Fim, W)
      const Kb = new Float64Array(k * k)

      for (let a = 0; a < k; a++) {
        for (let b = 0; b < k; b++) {
          let sa = 0
          let sb = 0

          for (let i = 0; i < n; i++) {
            sa += W[i * k + a]! * AW[i * k + b]!
            sb += W[i * k + a]! * BW[i * k + b]!
          }

          Kb[a * k + b] = sa + SILVER * sb
        }
      }

      const eb = symmetricEigen(k, Kb)

      for (let i = 0; i < n; i++) {
        for (let b = 0; b < k; b++) {
          let t = 0

          for (let a = 0; a < k; a++) {
            t += W[i * k + a]! * eb.vectors[a * k + b]!
          }

          U[i * n + start + b] = t
        }
      }
    }

    start = end
  }

  const AU = times(n, n, Fre, U)
  const BU = times(n, n, Fim, U)
  const phases = new Float64Array(n)

  let residual = 0
  // F = U diag(lambda) U^T with U real orthogonal (the residuals small), so F is unitary exactly when every |lambda| = 1
  let unitarity = 0

  for (let j = 0; j < n; j++) {
    let lr = 0
    let li = 0

    for (let i = 0; i < n; i++) {
      lr += U[i * n + j]! * AU[i * n + j]!
      li += U[i * n + j]! * BU[i * n + j]!
    }

    unitarity = Math.max(unitarity, Math.abs(Math.hypot(lr, li) - 1))

    let r2 = 0

    for (let i = 0; i < n; i++) {
      r2 +=
        (AU[i * n + j]! - lr * U[i * n + j]!) ** 2 +
        (BU[i * n + j]! - li * U[i * n + j]!) ** 2
    }

    residual = Math.max(residual, Math.sqrt(r2))
    phases[j] = Math.atan2(li, lr)
  }

  return { n, Fre, Fim, U, phases, residual, unitarity, clusters }
}

// ---------------------------------------------------------------------------------------------------------
// survival from the Floquet decomposition

export type Survival = {
  // long-time means: fidelity sum p_n^2 and absorbed fraction (<H> - E0) / (Einf - E0)
  fidelityMean: number
  absorbedMean: number
  // the grid of beats and, on it, the fidelity and absorbed fraction and their running means over beats 1..N
  grid: number[]
  fidelity: number[]
  absorbed: number[]
  fidelityRun: number[]
  absorbedRun: number[]
  // the first grid beat whose running-mean fidelity is at most 1/2 (Infinity if none)
  tau: number
  // the first grid beat whose running-mean absorbed fraction is at least 1/4 (Infinity if none)
  tauEnergy: number
  // the Floquet components carrying the state, and the least phase gap among them
  components: number
  leastGap: number
}

const runMean = (N: number, d: number): number => {
  const s = Math.sin(d / 2)

  if (Math.abs(s) < 1e-15) {
    return 1
  }

  return (Math.sin((N * d) / 2) * Math.cos(((N + 1) * d) / 2)) / (N * s)
}

export function survivalOf(
  fl: Floquet,
  g: Ground,
  grid: readonly number[],
  floor = 1e-10,
): Survival {
  const n = fl.n
  const coef: number[] = []
  const idx: number[] = []

  for (let j = 0; j < n; j++) {
    let s = 0

    for (let i = 0; i < n; i++) {
      s += fl.U[i * n + j]! * g.psiE[i]!
    }

    if (Math.abs(s) > floor) {
      coef.push(s)
      idx.push(j)
    }
  }

  const J = idx.length
  const UJ = new Float64Array(n * J)

  for (let i = 0; i < n; i++) {
    for (let a = 0; a < J; a++) {
      UJ[i * J + a] = fl.U[i * n + idx[a]!]!
    }
  }

  const HU = times(n, J, g.H, UJ)
  const HJ = new Float64Array(J * J)

  for (let a = 0; a < J; a++) {
    for (let b = 0; b < J; b++) {
      let s = 0

      for (let i = 0; i < n; i++) {
        s += UJ[i * J + a]! * HU[i * J + b]!
      }

      HJ[a * J + b] = s
    }
  }

  const ph = idx.map(j => fl.phases[j]!)
  const p = coef.map(c => c * c)
  const span = g.Einf - g.E0

  let leastGap = Infinity

  for (let a = 0; a < J; a++) {
    for (let b = 0; b < a; b++) {
      let d = Math.abs(ph[a]! - ph[b]!) % (2 * Math.PI)

      d = Math.min(d, 2 * Math.PI - d)
      leastGap = Math.min(leastGap, d)
    }
  }

  // the long-time means (a pair closer than 1e-12 in phase counts as degenerate)
  let fbar = 0
  let ebar = 0

  for (let a = 0; a < J; a++) {
    for (let b = 0; b < J; b++) {
      let d = Math.abs(ph[a]! - ph[b]!) % (2 * Math.PI)

      d = Math.min(d, 2 * Math.PI - d)

      if (d > 1e-12) {
        continue
      }

      fbar += p[a]! * p[b]!
      ebar += coef[a]! * coef[b]! * HJ[a * J + b]!
    }
  }

  const at = (N: number, run: boolean): { f: number; e: number } => {
    let f = 0
    let e = 0

    // the sums are symmetric in (a, b): the diagonal once, each pair a > b twice
    for (let a = 0; a < J; a++) {
      f += p[a]! ** 2
      e += p[a]! * HJ[a * J + a]!

      for (let b = 0; b < a; b++) {
        const d = ph[a]! - ph[b]!
        const w = 2 * (run ? runMean(N, d) : Math.cos(N * d))

        f += p[a]! * p[b]! * w
        e += coef[a]! * coef[b]! * HJ[a * J + b]! * w
      }
    }

    return { f, e }
  }

  const fidelity: number[] = []
  const absorbed: number[] = []
  const fidelityRun: number[] = []
  const absorbedRun: number[] = []

  let tau = Infinity
  let tauEnergy = Infinity

  for (const N of grid) {
    const now = at(N, false)
    const run = at(N, true)

    fidelity.push(now.f)
    absorbed.push(span > 0 ? (now.e - g.E0) / span : 0)
    fidelityRun.push(run.f)
    absorbedRun.push(span > 0 ? (run.e - g.E0) / span : 0)

    if (tau === Infinity && run.f <= 0.5) {
      tau = N
    }

    if (
      tauEnergy === Infinity &&
      span > 0 &&
      (run.e - g.E0) / span >= 0.25
    ) {
      tauEnergy = N
    }
  }

  return {
    fidelityMean: fbar,
    absorbedMean: span > 0 ? (ebar - g.E0) / span : 0,
    grid: [...grid],
    fidelity,
    absorbed,
    fidelityRun,
    absorbedRun,
    tau,
    tauEnergy,
    components: J,
    leastGap,
  }
}

// the beats 1, then about `perDecade` a decade up to `top` (distinct integers)
export function beatGrid(top: number, perDecade: number): number[] {
  const out = new Set<number>([1])

  for (let j = 0; 10 ** (j / perDecade) <= top; j++) {
    out.add(Math.round(10 ** (j / perDecade)))
  }

  return [...out].sort((a, b) => a - b)
}

// the least-squares line y = a + c x and its largest residual
export function lineFit(
  x: readonly number[],
  y: readonly number[],
): { a: number; c: number; worst: number } {
  const N = x.length
  const mx = x.reduce((s, v) => s + v, 0) / N
  const my = y.reduce((s, v) => s + v, 0) / N

  let sxy = 0
  let sxx = 0

  for (let i = 0; i < N; i++) {
    sxy += (x[i]! - mx) * (y[i]! - my)
    sxx += (x[i]! - mx) ** 2
  }

  const c = sxy / sxx
  const a = my - c * mx

  return {
    a,
    c,
    worst: Math.max(...x.map((v, i) => Math.abs(y[i]! - a - c * v))),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the beat applied link by link on a whole register (the cross-checks)

export type CVec = { re: Float64Array; im: Float64Array }

// the unitary kernel u(h) of exp(i theta K) on one link, K the convolution by the class function e (real symmetric): u(h)
// = sum_i e^(i theta m_i) v_i(h) v_i(1). Also returns the spectrum's distance from the integers
export function linkUnitary(
  g: GaugeGroup,
  e: Float64Array,
  theta: number,
): { re: Float64Array; im: Float64Array; integerError: number } {
  const n = g.order
  const K = new Float64Array(n * n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      K[a * n + b] = e[mul(g, a, g.inverse[b]!)]!
    }
  }

  const ev = symmetricEigen(n, K)
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  let integerError = 0

  for (let i = 0; i < n; i++) {
    const m = ev.values[i]!

    integerError = Math.max(integerError, Math.abs(m - Math.round(m)))

    const c = Math.cos(theta * Math.round(m))
    const s = Math.sin(theta * Math.round(m))

    for (let h = 0; h < n; h++) {
      const w = ev.vectors[h * n + i]! * ev.vectors[g.identity * n + i]!

      re[h] = re[h]! + c * w
      im[h] = im[h]! + s * w
    }
  }

  return { re, im, integerError }
}

// psi(c) -> sum_h k(h) psi(T_l(h) c) on the gauge-fixed register (k complex)
export function applyLink(
  r: Register,
  l: number,
  kre: Float64Array,
  kim: Float64Array,
  v: CVec,
): CVec {
  const g = r.group
  const G = g.order
  const out = {
    re: new Float64Array(r.size),
    im: new Float64Array(r.size),
  }
  const x = new Int16Array(r.digits)
  const ops = r.ops[l]!
  const stride = ops.map(o => G ** o.digit)
  const live = [...Array(G).keys()].filter(
    h => kre[h] !== 0 || kim[h] !== 0,
  )

  for (let c = 0; c < r.size; c++) {
    decode(r, c, x)

    let sr = 0
    let si = 0

    for (const h of live) {
      const kr = kre[h]!
      const ki = kim[h]!
      const hi = g.inverse[h]!

      let c2 = c

      for (let k = 0; k < ops.length; k++) {
        const o = ops[k]!
        const old = x[o.digit]!

        let nv = old

        if (o.left) {
          nv = g.table[h * G + nv]!
        }

        if (o.right) {
          nv = g.table[nv * G + hi]!
        }

        c2 += (nv - old) * stride[k]!
      }

      const vr = v.re[c2]!
      const vi = v.im[c2]!

      sr += kr * vr - ki * vi
      si += kr * vi + ki * vr
    }

    out.re[c] = sr
    out.im[c] = si
  }

  return out
}

export function magneticTable(r: Register, nB: Int32Array): Int32Array {
  const x = new Int16Array(r.digits)
  const out = new Int32Array(r.size)

  for (let c = 0; c < r.size; c++) {
    decode(r, c, x)
    out[c] = r.patch.triangles.reduce(
      (a, t) => a + nB[holonomy(r, x, t)]!,
      0,
    )
  }

  return out
}

export function registerBeat(
  r: Register,
  u: { re: Float64Array; im: Float64Array },
  hB: Int32Array,
  theta: number,
  coupling: number,
  v: CVec,
): CVec {
  let w = v

  for (let l = 0; l < r.patch.links.length; l++) {
    w = applyLink(r, l, u.re, u.im, w)
  }

  const out = {
    re: new Float64Array(r.size),
    im: new Float64Array(r.size),
  }

  for (let c = 0; c < r.size; c++) {
    const a = 2 * coupling * theta * hB[c]!
    const ca = Math.cos(a)
    const sa = Math.sin(a)

    out.re[c] = ca * w.re[c]! - sa * w.im[c]!
    out.im[c] = sa * w.re[c]! + ca * w.im[c]!
  }

  w = out

  for (let l = 0; l < r.patch.links.length; l++) {
    w = applyLink(r, l, u.re, u.im, w)
  }

  return w
}

// <v|H|v> on the register
export function registerEnergy(
  r: Register,
  eH: Float64Array,
  hB: Int32Array,
  coupling: number,
  v: CVec,
): number {
  const zero = new Float64Array(r.group.order)

  let e = 0

  for (let l = 0; l < r.patch.links.length; l++) {
    const w = applyLink(r, l, eH, zero, v)

    for (let c = 0; c < r.size; c++) {
      e += v.re[c]! * w.re[c]! + v.im[c]! * w.im[c]!
    }
  }

  for (let c = 0; c < r.size; c++) {
    e += coupling * hB[c]! * (v.re[c]! ** 2 + v.im[c]! ** 2)
  }

  return e
}

// the largest |psi(c) - psi(g c g^-1)| over the group (the residual Gauss law of the fixed gauge)
export function conjugationDefect(r: Register, v: CVec): number {
  const g = r.group
  const x = new Int16Array(r.digits)
  const y = new Int16Array(r.digits)

  let worst = 0

  for (let c = 0; c < r.size; c++) {
    decode(r, c, x)

    for (let h = 0; h < g.order; h++) {
      const hi = g.inverse[h]!

      for (let d = 0; d < r.digits; d++) {
        y[d] = mul(g, mul(g, h, x[d]!), hi)
      }

      const c2 = encode(r, y)

      worst = Math.max(
        worst,
        Math.hypot(v.re[c]! - v.re[c2]!, v.im[c]! - v.im[c2]!),
      )
    }
  }

  return worst
}

// a sector state (real, sector basis) spread over the register: psi(c) = psi_S / sqrt(N_S)
export function sectorToRegister(
  r: Register,
  s: Sectors,
  psi: Float64Array,
): CVec {
  const out = {
    re: new Float64Array(r.size),
    im: new Float64Array(r.size),
  }

  for (let c = 0; c < r.size; c++) {
    const S = s.superOf[c]!

    out.re[c] = psi[S]! / Math.sqrt(s.count[S]!)
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the UNFIXED register: every link free, the Gauss law at every dock (a small group only)

export type FreeRegister = {
  group: GaugeGroup
  patch: Patch
  links: number
  size: number
}

export const freeRegisterOf = (
  group: GaugeGroup,
  patch: Patch,
): FreeRegister => ({
  group,
  patch,
  links: patch.links.length,
  size: group.order ** patch.links.length,
})

// the gauge-fixed configuration of a free one (g_0 = 1, g_v = g_parent U_(parent, v) down the tree)
export function fixFree(
  f: FreeRegister,
  r: Register,
  U: Int16Array,
  x: Int16Array,
): void {
  const g = f.group
  const p = f.patch
  const V = p.docks.length

  const value = (a: number, b: number): number => {
    const l = p.links.findIndex(
      ([s, t]) => (s === a && t === b) || (s === b && t === a),
    )
    const v = U[l]!

    return p.links[l]![0] === a ? v : g.inverse[v]!
  }

  const gauge = new Array<number>(V).fill(g.identity)
  const order = [0]

  for (let i = 0; i < order.length; i++) {
    const q = order[i]!

    for (let v = 0; v < V; v++) {
      if (p.parent[v] !== q) {
        continue
      }

      gauge[v] = mul(g, gauge[q]!, value(q, v))
      order.push(v)
    }
  }

  p.loops.forEach((l, d) => {
    const [a, b] = p.links[l]!

    x[d] = mul(g, mul(g, gauge[a]!, U[l]!), g.inverse[gauge[b]!]!)
  })

  if (x.length !== r.digits) {
    throw new Error('prethermal-patch: digit count')
  }
}

export function freeFromFixed(
  f: FreeRegister,
  r: Register,
  v: CVec,
): CVec {
  const out = {
    re: new Float64Array(f.size),
    im: new Float64Array(f.size),
  }
  const U = new Int16Array(f.links)
  const x = new Int16Array(r.digits)
  const norm = Math.sqrt(f.group.order ** (f.patch.docks.length - 1))

  for (let c = 0; c < f.size; c++) {
    let t = c

    for (let l = 0; l < f.links; l++) {
      U[l] = t % f.group.order
      t = Math.floor(t / f.group.order)
    }

    fixFree(f, r, U, x)

    const c2 = encode(r, x)

    out.re[c] = v.re[c2]! / norm
    out.im[c] = v.im[c2]! / norm
  }

  return out
}

// the free register restricted to tree links at the identity, rescaled: the gauge-fixed state it holds
export function fixedFromFree(
  f: FreeRegister,
  r: Register,
  v: CVec,
): CVec {
  const out = {
    re: new Float64Array(r.size),
    im: new Float64Array(r.size),
  }
  const x = new Int16Array(r.digits)
  const norm = Math.sqrt(f.group.order ** (f.patch.docks.length - 1))

  for (let c = 0; c < r.size; c++) {
    decode(r, c, x)

    let idx = 0

    for (let l = f.links - 1; l >= 0; l--) {
      idx =
        idx * f.group.order +
        (f.patch.tree[l]
          ? f.group.identity
          : x[f.patch.loops.indexOf(l)]!)
    }

    out.re[c] = v.re[idx]! * norm
    out.im[c] = v.im[idx]! * norm
  }

  return out
}

export function freeBeat(
  f: FreeRegister,
  u: { re: Float64Array; im: Float64Array },
  nB: Int32Array,
  theta: number,
  coupling: number,
  v: CVec,
): CVec {
  const g = f.group
  const G = g.order
  const U = new Int16Array(f.links)

  const unpack = (c: number): void => {
    for (let l = 0; l < f.links; l++) {
      U[l] = c % G
      c = Math.floor(c / G)
    }
  }

  const electric = (w: CVec): CVec => {
    let cur = w

    for (let l = 0; l < f.links; l++) {
      const out = {
        re: new Float64Array(f.size),
        im: new Float64Array(f.size),
      }
      const stride = G ** l

      for (let c = 0; c < f.size; c++) {
        const own = Math.floor(c / stride) % G

        let sr = 0
        let si = 0

        for (let h = 0; h < G; h++) {
          const c2 = c + (mul(g, h, own) - own) * stride
          const kr = u.re[h]!
          const ki = u.im[h]!

          sr += kr * cur.re[c2]! - ki * cur.im[c2]!
          si += kr * cur.im[c2]! + ki * cur.re[c2]!
        }

        out.re[c] = sr
        out.im[c] = si
      }

      cur = out
    }

    return cur
  }

  const p = f.patch

  const value = (a: number, b: number): number => {
    const l = p.links.findIndex(
      ([s, t]) => (s === a && t === b) || (s === b && t === a),
    )
    const x = U[l]!

    return p.links[l]![0] === a ? x : g.inverse[x]!
  }

  let w = electric(v)

  const out = {
    re: new Float64Array(f.size),
    im: new Float64Array(f.size),
  }

  for (let c = 0; c < f.size; c++) {
    unpack(c)

    let e = 0

    for (const t of p.triangles) {
      let h = g.identity

      for (let i = 0; i < 3; i++) {
        h = mul(g, h, value(t[i]!, t[(i + 1) % 3]!))
      }

      e += nB[h]!
    }

    const a = 2 * coupling * theta * e
    const ca = Math.cos(a)
    const sa = Math.sin(a)

    out.re[c] = ca * w.re[c]! - sa * w.im[c]!
    out.im[c] = sa * w.re[c]! + ca * w.im[c]!
  }

  w = electric(out)

  return w
}

// the largest |psi(U) - psi(g_v U)| over every dock v and group element g (the Gauss law at every dock)
export function freeGaussDefect(f: FreeRegister, v: CVec): number {
  const g = f.group
  const G = g.order
  const U = new Int16Array(f.links)

  let worst = 0

  for (let c = 0; c < f.size; c++) {
    let t = c

    for (let l = 0; l < f.links; l++) {
      U[l] = t % G
      t = Math.floor(t / G)
    }

    for (let dock = 0; dock < f.patch.docks.length; dock++) {
      for (let h = 0; h < G; h++) {
        let idx = 0

        for (let l = f.links - 1; l >= 0; l--) {
          const [a, b] = f.patch.links[l]!

          let x = U[l]!

          if (a === dock) {
            x = mul(g, h, x)
          }

          if (b === dock) {
            x = mul(g, x, g.inverse[h]!)
          }

          idx = idx * G + x
        }

        worst = Math.max(
          worst,
          Math.hypot(v.re[c]! - v.re[idx]!, v.im[c]! - v.im[idx]!),
        )
      }
    }
  }

  return worst
}

export function cvecInner(a: CVec, b: CVec): [number, number] {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

export function cvecGap(a: CVec, b: CVec): number {
  let worst = 0

  for (let k = 0; k < a.re.length; k++) {
    worst = Math.max(
      worst,
      Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!),
    )
  }

  return worst
}
