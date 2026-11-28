// LOW-SYMMETRY closed quotients and SYMMETRY-MATCHED flat maps (item vibe-computation-models-0053): the controls that
// separate the curvature of a tiling from the symmetry group of the quotient it is read on. E-CMP-0046 found fewer
// standing modes on every hyperbolic quotient, but every one was a regular map (or the {3,4,3,4} congruence quotient,
// |Aut| about 3.6e14 against 786,432 for the D4 torus of equal size). Everything here is exact integer work; nothing
// moves.
//
// THE PIECES:
//
// - `subgroupQuotientMap`: a regular map's darts are the elements g of its rotation group G (faceNext g = g x, edgeMate
//   g = g x y, tiling-quotient.ts rotaryMap). Left multiplication by any subgroup H commutes with both, so the darts
//   modulo H (the orbits {h g}) form a map again. It is a {p,q} map, covered by the regular one, exactly when H acts
//   freely on faces, edges and vertices (no element of H but 1 is conjugate into <x>, <y> or <x y>); analyzeMap's gates
//   (face length p, vertex degree q, edgeMate without fixed points, a simple connected cell graph) read that condition.
//   When H is not normal the quotient is not regular: its orientation-preserving map automorphisms are N_G(H) / H.
// - `subgroupClasses`: the subgroups of G up to conjugacy, cyclic ones and those two elements generate, up to an order
//   cap, ascending packed keys (no random choice).
// - `cayleyStructure` and `leftCosetQuotient`: the {3,4,3,4} dock graph at a 2-adic level is the right Cayley graph of
//   the finite frame group (congruence-3434 enumerateFrames: neighbour k of dock g is g T_k). Each dock has a word from
//   dock 0 (its breadth-first path), so left multiplication L_g(x) is the walk of x's word from g; it is checked to be a
//   graph automorphism (gate) before it is used. The docks modulo a subgroup H on the left form a 24-regular quotient
//   (simple when no x T_k x^-1 or x T_k T_l^-1 x^-1 lies in H, read off the result).
// - `flatQuotient`: the flat tilings as periodic graphs (cell types times Z^d, a neighbour rule) modulo a translation
//   lattice in Hermite normal form (any torus, twisted tori included) or, in 2D, modulo a lattice and one glide
//   reflection (a flat Klein bottle). A torus has every translation as an automorphism, so |Aut| / N >= 1 there; the
//   Klein bottle keeps only the translations along its glide axis, which is how a flat map reaches a lower |Aut| / N.

import { analyzeMap, type DartMap, type ProjectiveGroup, type SurfaceAnalysis } from '@/code/substrate/tiling-quotient'

// ---- the regular map's group, from findRotaryMap's generators ----

export type RotationGroup = {
  readonly group: ProjectiveGroup
  // the elements of <x, y>, breadth first from the identity under right multiplication by x then y (the order
  // tiling-quotient.ts uses, so dart indices and cell indices agree with its regular map)
  readonly elements: readonly number[]
  readonly index: ReadonlyMap<number, number>
  readonly x: number
  readonly y: number
  readonly inverse: Int32Array
}

export function packEntries(m: number, entries: readonly [number, number, number, number]): number {
  const [a, b, c, d] = entries

  return ((a * m + b) * m + c) * m + d
}

export function rotationGroup(input: {
  group: ProjectiveGroup
  x: readonly [number, number, number, number]
  y: readonly [number, number, number, number]
}): RotationGroup {
  const { group } = input
  const m = group.modulus
  const x = packEntries(m, input.x)
  const y = packEntries(m, input.y)
  const seen = new Set<number>([group.identity])
  const elements = [group.identity]

  for (const g of elements) {
    for (const s of [x, y]) {
      const h = group.multiply(g, s)

      if (!seen.has(h)) {
        seen.add(h)
        elements.push(h)
      }
    }
  }

  const index = new Map(elements.map((g, i) => [g, i]))
  const inverse = new Int32Array(elements.length)

  for (let i = 0; i < elements.length; i++) {
    const g = elements[i]!

    let h = g
    let previous = group.identity

    while (h !== group.identity) {
      previous = h
      h = group.multiply(h, g)
    }

    // g^(order) = 1, so g^(order - 1) is the inverse; previous holds it when the loop stops
    inverse[i] = index.get(previous === group.identity ? g : previous)!
  }

  return { group, elements, index, x, y, inverse }
}

// ---- subgroups up to conjugacy ----

export type SubgroupClass = {
  // element indices of one representative, ascending
  readonly members: readonly number[]
  readonly order: number
  // the size of its conjugacy class of subgroups, so |N_G(H)| = |G| / classSize
  readonly classSize: number
  readonly normalizerOrder: number
  readonly cyclic: boolean
  // the generators that built it (element indices)
  readonly generators: readonly number[]
}

function closeSubgroup(r: RotationGroup, generators: readonly number[], limit: number): number[] | null {
  const { group, elements, index } = r
  const seen = new Set<number>([0])
  const list = [0]

  // index 0 is the identity (elements starts with it)
  for (const i of list) {
    for (const s of generators) {
      const j = index.get(group.multiply(elements[i]!, elements[s]!))!

      if (!seen.has(j)) {
        if (list.length >= limit) {
          return null
        }

        seen.add(j)
        list.push(j)
      }
    }
  }

  return list.sort((a, b) => a - b)
}

// Every subgroup of order 2 .. maxOrder that one element or two elements generate, one per conjugacy class, ascending by
// (order, smallest key). The two-generator pass takes the first generator from each cyclic class representative and the
// second from every element, so it finds every two-generated subgroup up to conjugacy.
export function subgroupClasses(r: RotationGroup, maxOrder: number): SubgroupClass[] {
  const { group, elements, index, inverse } = r
  const n = elements.length
  const known = new Set<string>()
  const classes: SubgroupClass[] = []

  const register = (members: number[], generators: number[], cyclic: boolean): void => {
    const key = members.join(',')

    if (known.has(key)) {
      return
    }

    let classSize = 0

    for (let g = 0; g < n; g++) {
      const conj = members
        .map(h => index.get(group.multiply(group.multiply(elements[g]!, elements[h]!), elements[inverse[g]!]!))!)
        .sort((a, b) => a - b)
      const k = conj.join(',')

      if (!known.has(k)) {
        known.add(k)
        classSize++
      }
    }

    classes.push({ members, order: members.length, classSize, normalizerOrder: n / classSize, cyclic, generators })
  }

  for (let g = 1; g < n; g++) {
    const members = closeSubgroup(r, [g], maxOrder + 1)

    if (members && members.length <= maxOrder) {
      register(members, [g], true)
    }
  }

  const cyclicReps = classes.map(c => c.generators[0]!)

  for (const a of cyclicReps) {
    for (let b = 1; b < n; b++) {
      const members = closeSubgroup(r, [a, b], maxOrder + 1)

      if (members && members.length <= maxOrder) {
        register(members, [a, b], false)
      }
    }
  }

  return classes.sort((p, q) => p.order - q.order || p.members[1]! - q.members[1]!)
}

// ---- the map modulo a subgroup ----

export type SubgroupQuotient = {
  readonly map: DartMap
  readonly analysis: SurfaceAnalysis
  // every analyzeMap gate holds: H acts freely and the cell graph is simple and connected
  readonly valid: boolean
}

export function subgroupQuotientMap(input: {
  rotation: RotationGroup
  map: DartMap
  members: readonly number[]
  p: number
  q: number
}): SubgroupQuotient {
  const { rotation, map, members, p, q } = input
  const { group, elements, index } = rotation
  const n = elements.length
  const orbit = new Int32Array(n).fill(-1)

  let count = 0

  for (let g = 0; g < n; g++) {
    if (orbit[g]! >= 0) {
      continue
    }

    for (const h of members) {
      orbit[index.get(group.multiply(elements[h]!, elements[g]!))!] = count
    }

    count++
  }

  const representative = new Int32Array(count).fill(-1)

  for (let g = 0; g < n; g++) {
    if (representative[orbit[g]!]! < 0) {
      representative[orbit[g]!] = g
    }
  }

  const faceNext = Int32Array.from(representative, g => orbit[map.faceNext[g]!]!)
  const edgeMate = Int32Array.from(representative, g => orbit[map.edgeMate[g]!]!)
  const quotient: DartMap = { faceNext, edgeMate }
  const analysis = analyzeMap(quotient, p, q)

  return { map: quotient, analysis, valid: count * members.length === n && Object.values(analysis.gates).every(Boolean) }
}

// ---- Cayley dock graphs and their left coset quotients ----

export type CayleyStructure = {
  readonly order: number
  readonly degree: number
  // the slot path from dock 0 to each dock
  readonly words: readonly Int32Array[]
  // inverseSlot[k]: the slot that undoes slot k (table[table[x][k]][inverseSlot[k]] = x)
  readonly inverseSlot: Int32Array
  multiply(g: number, h: number): number
  inverse(g: number): number
  // L_g is a graph automorphism: table[g h][k] = g table[h][k] for every h and k
  isLeftAutomorphism(g: number): boolean
}

export function cayleyStructure(neighbors: readonly (readonly number[])[]): CayleyStructure {
  const n = neighbors.length
  const degree = neighbors[0]!.length
  const parent = new Int32Array(n).fill(-1)
  const via = new Int32Array(n).fill(-1)
  const order = [0]

  parent[0] = 0

  for (const x of order) {
    neighbors[x]!.forEach((y, k) => {
      if (parent[y]! < 0) {
        parent[y] = x
        via[y] = k
        order.push(y)
      }
    })
  }

  if (order.length !== n) {
    throw new Error('low-symmetry-quotient: the dock graph is not connected')
  }

  const words: Int32Array[] = new Array<Int32Array>(n)

  words[0] = new Int32Array(0)

  for (const x of order.slice(1)) {
    const up = words[parent[x]!]!
    const w = new Int32Array(up.length + 1)

    w.set(up)
    w[up.length] = via[x]!
    words[x] = w
  }

  const inverseSlot = new Int32Array(degree).fill(-1)

  for (let k = 0; k < degree; k++) {
    const y = neighbors[0]![k]!

    inverseSlot[k] = neighbors[y]!.indexOf(0)
  }

  const walk = (from: number, word: Int32Array): number => {
    let x = from

    for (const k of word) {
      x = neighbors[x]![k]!
    }

    return x
  }

  const multiply = (g: number, h: number): number => walk(g, words[h]!)

  const inverse = (g: number): number => {
    const w = words[g]!

    let x = 0

    for (let i = w.length - 1; i >= 0; i--) {
      x = neighbors[x]![inverseSlot[w[i]!]!]!
    }

    return x
  }

  const isLeftAutomorphism = (g: number): boolean => {
    const image = Int32Array.from({ length: n }, (_, h) => multiply(g, h))
    const hit = new Uint8Array(n)

    for (let h = 0; h < n; h++) {
      if (hit[image[h]!]) {
        return false
      }

      hit[image[h]!] = 1

      for (let k = 0; k < degree; k++) {
        if (image[neighbors[h]![k]!] !== neighbors[image[h]!]![k]) {
          return false
        }
      }
    }

    return true
  }

  return { order: n, degree, words, inverseSlot, multiply, inverse, isLeftAutomorphism }
}

export type CosetQuotient = {
  readonly cells: number
  readonly neighbors: number[][]
  // every cell has `degree` distinct neighbours, none itself
  readonly simple: boolean
}

// The docks modulo the subgroup on the left: cell Hx, neighbour k of Hx is H (x T_k).
export function leftCosetQuotient(input: {
  neighbors: readonly (readonly number[])[]
  cayley: CayleyStructure
  members: readonly number[]
}): CosetQuotient {
  const { neighbors, cayley, members } = input
  const n = neighbors.length
  const coset = new Int32Array(n).fill(-1)
  const representatives: number[] = []

  for (let x = 0; x < n; x++) {
    if (coset[x]! >= 0) {
      continue
    }

    for (const h of members) {
      coset[cayley.multiply(h, x)] = representatives.length
    }

    representatives.push(x)
  }

  const rows = representatives.map(x => neighbors[x]!.map(y => coset[y]!))
  const simple = rows.every((row, c) => new Set(row).size === cayley.degree && !row.includes(c))

  return { cells: representatives.length, neighbors: rows, simple }
}

// Subgroups of a Cayley dock group of the given order, generated by one or two elements, one per conjugacy class, at
// most `limit` classes. The generators a, b run over `candidates` in the order given (a before b), so the search is
// fixed and bounded. A subgroup holding a word of length 1 or 2 folds a dock onto itself or two neighbours together,
// so candidates far from dock 0 (`farDocks`) are the useful ones.
export function cayleySubgroups(input: {
  cayley: CayleyStructure
  order: number
  candidates: readonly number[]
  limit: number
}): { members: number[]; classSize: number; normalizerOrder: number; generators: number[] }[] {
  const { cayley, order, candidates, limit } = input
  const n = cayley.order
  const known = new Set<string>()
  const found: { members: number[]; classSize: number; normalizerOrder: number; generators: number[] }[] = []

  const close = (gens: readonly number[]): number[] | null => {
    const seen = new Set<number>([0])
    const list = [0]

    for (const g of list) {
      for (const s of gens) {
        const h = cayley.multiply(g, s)

        if (!seen.has(h)) {
          if (list.length >= order) {
            return null
          }

          seen.add(h)
          list.push(h)
        }
      }
    }

    return list.length === order ? list.sort((a, b) => a - b) : null
  }

  const inverses = Int32Array.from({ length: n }, (_, g) => cayley.inverse(g))

  const register = (members: number[], generators: number[]): void => {
    const key = members.join(',')

    if (known.has(key)) {
      return
    }

    let classSize = 0

    for (let g = 0; g < n; g++) {
      const conj = members.map(h => cayley.multiply(cayley.multiply(g, h), inverses[g]!)).sort((a, b) => a - b)
      const k = conj.join(',')

      if (!known.has(k)) {
        known.add(k)
        classSize++
      }
    }

    found.push({ members, classSize, normalizerOrder: n / classSize, generators })
  }

  const top = Math.min(scan, n)

  for (let a = 1; a < top && found.length < limit; a++) {
    const single = close([a])

    if (single) {
      register(single, [a])
    }

    for (let b = a + 1; b < top && found.length < limit; b++) {
      const pair = close([a, b])

      if (pair) {
        register(pair, [a, b])
      }
    }
  }

  return found
}

// ---- flat periodic graphs modulo a lattice or a lattice and a glide ----

// a cell is a type and an integer vector; `step` lists its neighbours in a fixed order
export type PeriodicTiling = {
  readonly name: string
  readonly symbol: readonly number[]
  readonly dimension: number
  readonly types: number
  readonly degree: number
  // cells per unit of lattice determinant: the quotient by a lattice of determinant D has D * density cells
  readonly density: { readonly n: number; readonly d: number }
  step(type: number, v: readonly number[]): [number, number[]][]
  // the origin cell's vector must be a cell (D4 keeps even coordinate sums)
  readonly origin: readonly number[]
}

export const SQUARE_TILING: PeriodicTiling = {
  name: 'square',
  symbol: [4, 4],
  dimension: 2,
  types: 1,
  degree: 4,
  density: { n: 1, d: 1 },
  origin: [0, 0],
  step: (_, [i, j]) => [
    [0, [i! + 1, j!]],
    [0, [i!, j! + 1]],
    [0, [i! - 1, j!]],
    [0, [i!, j! - 1]],
  ],
}

// hexagon tiles = triangular lattice points in axial coordinates
export const HEXAGON_TILING: PeriodicTiling = {
  name: 'hexagon',
  symbol: [6, 3],
  dimension: 2,
  types: 1,
  degree: 6,
  density: { n: 1, d: 1 },
  origin: [0, 0],
  step: (_, [i, j]) => [
    [0, [i! + 1, j!]],
    [0, [i!, j! + 1]],
    [0, [i! - 1, j! + 1]],
    [0, [i! - 1, j!]],
    [0, [i!, j! - 1]],
    [0, [i! + 1, j! - 1]],
  ],
}

// triangle tiles: up (type 0) and down (type 1) at each lattice point (tiling-quotient.ts triangleTiling's adjacency)
export const TRIANGLE_TILING: PeriodicTiling = {
  name: 'triangle',
  symbol: [3, 6],
  dimension: 2,
  types: 2,
  degree: 3,
  density: { n: 2, d: 1 },
  origin: [0, 0],
  step: (s, [i, j]) =>
    s === 0
      ? [
          [1, [i!, j! - 1]],
          [1, [i!, j!]],
          [1, [i! - 1, j!]],
        ]
      : [
          [0, [i! + 1, j!]],
          [0, [i!, j! + 1]],
          [0, [i!, j!]],
        ],
}

const D4_ROOTS: number[][] = (() => {
  const roots: number[][] = []

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const r = [0, 0, 0, 0]

          r[a] = sa
          r[b] = sb
          roots.push(r)
        }
      }
    }
  }

  return roots
})()

// the 24-cell honeycomb {3,4,3,3}: docks are the D4 points (even coordinate sum), neighbours the 24 roots
export const D4_TILING: PeriodicTiling = {
  name: 'd4',
  symbol: [3, 4, 3, 3],
  dimension: 4,
  types: 1,
  degree: 24,
  density: { n: 1, d: 2 },
  origin: [0, 0, 0, 0],
  step: (_, v) => D4_ROOTS.map(r => [0, v.map((x, k) => x + r[k]!)] as [number, number[]]),
}

// a lattice in Hermite normal form: rows[i][i] > 0, rows[i][j] = 0 for j < i (upper triangular)
export type Lattice = readonly (readonly number[])[]

export function latticeDeterminant(rows: Lattice): number {
  return rows.reduce((a, row, i) => a * row[i]!, 1)
}

// the canonical representative of v modulo the lattice: 0 <= v[i] < rows[i][i]
export function reduceModLattice(rows: Lattice, v: readonly number[]): number[] {
  const out = [...v]

  rows.forEach((row, i) => {
    const q = Math.floor(out[i]! / row[i]!)

    if (q !== 0) {
      for (let k = i; k < out.length; k++) {
        out[k]! -= q * row[k]!
      }
    }
  })

  return out
}

// A flat Klein bottle in 2D: the glide g and the translation t generate the deck group, with g t g^-1 = t^-1 and g^2 a
// translation, so every deck element is t^m g^k. `canonical` returns the representative of a cell's orbit.
export type Glide = {
  readonly label: string
  // the cell count, for the gate
  readonly cells: number
  canonical(type: number, v: readonly number[]): [number, number[]]
}

// Square cells (i, j), glide g(i, j) = (-i - 1, j + b) (mirror x -> -x along the j axis, then b up), t(i, j) = (i + a,
// j): a b cells.
export function squareKleinGlide(a: number, b: number): Glide {
  return {
    label: `square-klein-${a}x${b}`,
    cells: a * b,
    canonical(type, [i, j]) {
      const k = Math.floor(j! / b)
      const flip = ((k % 2) + 2) % 2 === 1
      const ii = flip ? -i! - 1 : i!

      return [type, [((ii % a) + a) % a, j! - k * b]]
    },
  }
}

// Axial cells (i, j) of the hexagon or triangle tiling, the mirror (i, j) -> (j, i) (it keeps up and down triangles),
// glide g(i, j) = (j + c, i + c), t = (a, -a). In u = i + j, v = i - j: g adds 2c to u and negates v, t adds 2a to v.
// Cells: 2 a c lattice points (u and v of equal parity) times the tile types.
export function axialKleinGlide(a: number, c: number, types: number): Glide {
  return {
    label: `${types === 1 ? 'hexagon' : 'triangle'}-klein-${a}x${c}`,
    cells: 2 * a * c * types,
    canonical(type, [i, j]) {
      const u = i! + j!
      const v = i! - j!
      const k = Math.floor(u / (2 * c))
      const flip = ((k % 2) + 2) % 2 === 1
      const uu = u - 2 * c * k
      const vv = ((((flip ? -v : v) % (2 * a)) + 2 * a) % (2 * a))

      // uu and vv keep the parity of u and v (2 c k and 2 a multiples are even, negation keeps parity)
      return [type, [(uu + vv) / 2, (uu - vv) / 2]]
    },
  }
}

export type FlatQuotient = {
  readonly name: string
  readonly symbol: readonly number[]
  readonly cells: number
  readonly neighbors: number[][]
  readonly orientable: boolean
  // the cell count equals the deck group's index (determinant times density, or the glide's count)
  readonly countMatches: boolean
  // every cell has `degree` distinct neighbours, none itself
  readonly simple: boolean
  readonly construction: string
}

// Breadth-first from the origin cell over the canonical representatives.
export function flatQuotient(input: {
  tiling: PeriodicTiling
  lattice?: Lattice
  glide?: Glide
  name?: string
}): FlatQuotient {
  const { tiling, lattice, glide } = input

  if ((lattice === undefined) === (glide === undefined)) {
    throw new Error('low-symmetry-quotient: give a lattice or a glide')
  }

  const canonical = (type: number, v: readonly number[]): [number, number[]] =>
    glide ? glide.canonical(type, v) : [type, reduceModLattice(lattice!, v)]
  const key = (type: number, v: readonly number[]): string => `${type}:${v.join(',')}`
  const ids = new Map<string, number>()
  const cells: [number, number[]][] = []
  const start = canonical(0, tiling.origin)

  ids.set(key(...start), 0)
  cells.push(start)

  const neighbors: number[][] = []

  for (let head = 0; head < cells.length; head++) {
    const [type, v] = cells[head]!
    const row: number[] = []

    for (const [t, w] of tiling.step(type, v)) {
      const c = canonical(t, w)
      const k = key(...c)

      let id = ids.get(k)

      if (id === undefined) {
        id = cells.length
        ids.set(k, id)
        cells.push(c)
      }

      row.push(id)
    }

    neighbors.push(row)
  }

  const expected = glide
    ? glide.cells
    : (latticeDeterminant(lattice!) * tiling.density.n) / tiling.density.d
  const label = glide
    ? glide.label
    : `${tiling.name}-torus-${lattice!.map(row => row.join('.')).join('_')}`

  return {
    name: input.name ?? label,
    symbol: tiling.symbol,
    cells: cells.length,
    neighbors,
    orientable: glide === undefined,
    countMatches: cells.length === expected,
    simple: neighbors.every((row, c) => new Set(row).size === tiling.degree && !row.includes(c)),
    construction: glide
      ? `flat ${tiling.name} Klein bottle (lattice and one glide reflection), ${glide.label}`
      : `flat ${tiling.name} torus modulo the lattice with Hermite rows ${lattice!.map(row => `(${row.join(' ')})`).join(' ')}`,
  }
}
