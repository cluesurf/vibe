// CONGRUENCE QUOTIENTS of the {3,4,3,4} honeycomb at levels built from sqrt 2 and an odd integer (item
// vibe-roadmap-honeycomb-0016, decision 002). quotient-3434.ts reduces modulo a split odd prime, where the frame group
// K reduced (K_7) swallows all of W(F4) and has 276,595,200 docks. Here the ideal is I = (sqrt 2)^m (n), n odd, and
// the dock graph is the Cayley graph of K_I, the image of K in GL(5, Z[sqrt 2] / I): docks = elements, slot a = right
// multiplication by k_a. It is the coset graph N \ K of the congruence kernel N = K cap G(I), normal in K (G(I) is
// normal in G and K is normal in G), so N lies inside K and the slot labels are consistent by construction.
//
// THE RING: a + b sqrt 2 modulo I is held as (a mod A, b mod B) with A = n 2^ceil(m/2), B = n 2^floor(m/2). For m
// even I = (n 2^(m/2)); for m odd I = (n 2^k sqrt 2), k = (m - 1) / 2, whose elements are exactly a = 0 mod n 2^(k+1),
// b = 0 mod n 2^k. Products stay well defined: B divides A, and A divides 2B, so 2 b b' mod A depends only on b, b'
// mod B. A residue is canonical (a in [0, A), b in [0, B)), so equal residues are equal keys.
//
// THE PIECES, all exact:
//
// - `enumerateFrames`: K_I breadth-first from the identity, slot by slot in rootsD4() order (the order buildExactBall
//   numbers the exact ball), with packed keys in an open-addressing table. It refuses (returns `refused`) as soon as
//   more than `maxDocks` elements are found, so a level that does not fit costs at most maxDocks expansions.
// - `frameSystole`: the shells of the Cayley graph from the identity, and the largest r <= 4 whose r-ball equals the
//   honeycomb's labelled r-ball. The exact shells are 1, 24, 456, 8,376, 153,192 and the honeycomb graph is bipartite,
//   so the r-ball embeds exactly when the shells match through r and no edge joins two docks of one shell (as in
//   quotient-3434.ts). N is normal, so every dock has the same ball and the identity's systole is the quotient's.
// - `cuspCount`: the cusps of N \ H^4. A cusp is a class of (dock, ideal vertex) pairs: the 24 ideal vertices of the
//   base cell are W(F4) v (v = CUSP_VERTEX), vertex j lies on facet a exactly when B(n_a, w_j) = 0, and crossing facet
//   a from dock x to x k_a carries vertex w_j to k_a^-1 w_j = Z F_a w_j = Z w_j (F_a fixes w_j on its mirror). A
//   union-find over the pairs gives the cusps and, per cusp, its cube count (the cubes of its flat cross-section).
//
// NOTHING MOVES: this file builds tables and counts.

import {
  exactCell,
  matrixVector,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { CUSP_VERTEX } from '@/code/substrate/coxeter/exact-cusp'
import { EXACT_SHELLS, type Quotient3434 } from '@/code/substrate/coxeter/quotient-3434'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const DIM = 5
const ENTRIES = DIM * DIM
const SLOTS = 24

// the ideal (sqrt 2)^twoPower (odd), odd an odd integer >= 1, not both trivial
export type CongruenceLevel = { readonly twoPower: number; readonly odd: number }

export type LevelRing = {
  readonly level: CongruenceLevel
  readonly name: string
  // a mod modA, b mod modB
  readonly modA: number
  readonly modB: number
}

export function levelRing(level: CongruenceLevel): LevelRing {
  const { twoPower: m, odd: n } = level

  if (!Number.isInteger(m) || m < 0 || !Number.isInteger(n) || n < 1 || n % 2 === 0) {
    throw new Error(`levelRing: bad level ${JSON.stringify(level)}`)
  }

  if (m === 0 && n === 1) {
    throw new Error('levelRing: the unit ideal')
  }

  const modA = n * 2 ** Math.ceil(m / 2)
  const modB = n * 2 ** Math.floor(m / 2)
  const parts = [
    ...(m > 0 ? [m === 1 ? 'sqrt 2' : `(sqrt 2)^${m}`] : []),
    ...(n > 1 ? [`${n}`] : []),
  ]

  return { level, name: `(${parts.join(') (')})`, modA, modB }
}

const mod = (v: bigint, m: number): number => {
  const r = Number(v % BigInt(m))

  return r < 0 ? r + m : r
}

// an exact matrix as residues: a[25] then b[25]
export function reduceToLevel(m: ExactMatrix, ring: LevelRing): Int32Array {
  const out = new Int32Array(2 * ENTRIES)

  for (let e = 0; e < ENTRIES; e++) {
    out[e] = mod(m[2 * e]!, ring.modA)
    out[ENTRIES + e] = mod(m[2 * e + 1]!, ring.modB)
  }

  return out
}

// out = g t over the ring (canonical residues)
function levelProduct(g: Int32Array, t: Int32Array, ring: LevelRing, out: Int32Array): void {
  const A = ring.modA
  const B = ring.modB

  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
      let sa = 0
      let sb = 0

      for (let l = 0; l < DIM; l++) {
        const ga = g[i * DIM + l]!
        const gb = g[ENTRIES + i * DIM + l]!
        const ta = t[l * DIM + j]!
        const tb = t[ENTRIES + l * DIM + j]!

        sa += ga * ta + 2 * gb * tb
        sb += ga * tb + gb * ta
      }

      out[i * DIM + j] = sa % A
      out[ENTRIES + i * DIM + j] = sb % B
    }
  }
}

// ---- packed keys ----

type Packer = {
  readonly words: number
  pack(x: Int32Array, into: Uint32Array, at: number): void
  unpack(from: Uint32Array, at: number, x: Int32Array): void
}

function packer(ring: LevelRing): Packer {
  const bits = Math.max(1, Math.ceil(Math.log2(Math.max(ring.modA, 2))))
  const perWord = Math.floor(32 / bits)
  const values = 2 * ENTRIES
  const words = Math.ceil(values / perWord)
  const mask = bits === 32 ? 0xffffffff : (1 << bits) - 1

  return {
    words,
    pack(x, into, at) {
      for (let w = 0; w < words; w++) {
        let word = 0

        for (let s = 0; s < perWord; s++) {
          const v = w * perWord + s

          if (v < values) {
            word |= x[v]! << (s * bits)
          }
        }

        into[at + w] = word >>> 0
      }
    },
    unpack(from, at, x) {
      for (let v = 0; v < values; v++) {
        const w = Math.floor(v / perWord)
        const s = v % perWord

        x[v] = (from[at + w]! >>> (s * bits)) & mask
      }
    },
  }
}

function hashWords(keys: Uint32Array, at: number, words: number): number {
  let h = 0x811c9dc5

  for (let w = 0; w < words; w++) {
    h = Math.imul(h ^ keys[at + w]!, 0x01000193)
    h ^= h >>> 15
  }

  return h >>> 0
}

// ---- the enumeration ----

export type FrameEnumeration = {
  readonly ring: LevelRing
  // false when K_I has more than maxDocks elements (then order is only a lower bound and table is empty)
  readonly fits: boolean
  readonly order: number
  // order * 24, slot k of dock x at x * 24 + k, docks breadth-first from the identity (-1 past a radius)
  readonly table: Int32Array
  // the graph distance of each dock from the identity
  readonly distance: Int32Array
  // the dock of a frame given as residues, or -1 when it is not in K_I
  indexOf(x: Int32Array): number
  // the residues of dock i
  frame(i: number, out: Int32Array): void
}

export function enumerateFrames(input: {
  level: CongruenceLevel
  maxDocks: number
  // a ball: docks at this distance are not expanded (their slots stay -1)
  radius?: number
  cell?: ExactCell
}): FrameEnumeration {
  const cell = input.cell ?? exactCell()
  const ring = levelRing(input.level)
  const transports = cell.transports.map(t => reduceToLevel(t, ring))
  const pk = packer(ring)
  const W = pk.words
  const capacity = input.maxDocks + 1
  const radius = input.radius ?? Number.POSITIVE_INFINITY
  let distance = new Int32Array(Math.min(capacity, 1 << 16))
  let size = 1

  while (size < 2 * capacity) {
    size *= 2
  }

  const slots = new Int32Array(size).fill(-1)
  const keys = new Uint32Array(capacity * W)
  let table = new Int32Array(Math.min(capacity, 1 << 16) * SLOTS)
  let count = 0
  const scratch = new Uint32Array(W)

  const find = (probe: Uint32Array, at: number): { slot: number; id: number } => {
    let s = hashWords(probe, at, W) & (size - 1)

    for (;;) {
      const id = slots[s]!

      if (id < 0) {
        return { slot: s, id: -1 }
      }

      let same = true

      for (let w = 0; w < W && same; w++) {
        same = keys[id * W + w] === probe[at + w]
      }

      if (same) {
        return { slot: s, id }
      }

      s = (s + 1) & (size - 1)
    }
  }

  const one = new Int32Array(2 * ENTRIES)

  for (let i = 0; i < DIM; i++) {
    one[i * DIM + i] = 1 % ring.modA
  }

  pk.pack(one, keys, 0)
  slots[find(keys, 0).slot] = 0
  count = 1

  const g = new Int32Array(2 * ENTRIES)
  const next = new Int32Array(2 * ENTRIES)
  let fits = true

  for (let head = 0; head < count && fits; head++) {
    if ((head + 1) * SLOTS > table.length) {
      const grown = new Int32Array(Math.min(capacity * SLOTS, table.length * 2))

      grown.set(table)
      table = grown
    }

    if (distance[head]! >= radius) {
      table.fill(-1, head * SLOTS, (head + 1) * SLOTS)
      continue
    }

    pk.unpack(keys, head * W, g)

    for (let k = 0; k < SLOTS; k++) {
      levelProduct(g, transports[k]!, ring, next)
      pk.pack(next, scratch, 0)

      const hit = find(scratch, 0)
      let id = hit.id

      if (id < 0) {
        if (count >= capacity) {
          fits = false
          break
        }

        id = count++
        keys.set(scratch, id * W)
        slots[hit.slot] = id

        if (id >= distance.length) {
          const grown = new Int32Array(Math.min(capacity, distance.length * 2))

          grown.set(distance)
          distance = grown
        }

        distance[id] = distance[head]! + 1
      }

      table[head * SLOTS + k] = id
    }
  }

  const probe = new Uint32Array(W)

  return {
    ring,
    fits,
    order: count,
    table: fits ? table.slice(0, count * SLOTS) : new Int32Array(0),
    distance: distance.slice(0, count),
    indexOf(x) {
      pk.pack(x, probe, 0)

      return find(probe, 0).id
    },
    frame(i, out) {
      pk.unpack(keys, i * W, out)
    },
  }
}

// ---- the graph gates ----

export type GraphGates = {
  // neighbour(neighbour(x, a), OPPOSITE a) = x everywhere
  readonly returnsExactly: boolean
  readonly noSelfLoops: boolean
  // the 24 neighbours of every dock are distinct
  readonly distinctNeighbours: boolean
}

export function graphGates(table: Int32Array, docks: number): GraphGates {
  let returnsExactly = true
  let noSelfLoops = true
  let distinctNeighbours = true
  const seen = new Int32Array(docks).fill(-1)

  for (let x = 0; x < docks; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      returnsExactly &&= table[y * SLOTS + OPPOSITE[k]!] === x
      noSelfLoops &&= y !== x
      distinctNeighbours &&= seen[y] !== x
      seen[y] = x
    }
  }

  return { returnsExactly, noSelfLoops, distinctNeighbours }
}

// ---- the systole ----

export type FrameSystole = {
  // the largest r <= 4 whose reduced r-ball equals the honeycomb's labelled r-ball (-1 if not even r = 0)
  readonly systole: number
  // every shell of the Cayley graph from the identity, to its last dock (the diameter is length - 1)
  readonly shells: number[]
  readonly rows: { radius: number; shellsEqual: boolean; sameShellEdges: number }[]
}

export function frameSystole(table: Int32Array, docks: number, maxRadius = 4): FrameSystole {
  const distance = new Int32Array(docks).fill(-1)
  const queue = new Int32Array(docks)
  let tail = 1

  distance[0] = 0

  for (let head = 0; head < tail; head++) {
    const x = queue[head]!

    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (distance[y]! < 0) {
        distance[y] = distance[x]! + 1
        queue[tail++] = y
      }
    }
  }

  const shells: number[] = []

  for (let x = 0; x < docks; x++) {
    shells[distance[x]!] = (shells[distance[x]!] ?? 0) + 1
  }

  const sameShell = new Array<number>(shells.length).fill(0)

  for (let x = 0; x < docks; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (distance[y] === distance[x]) {
        sameShell[distance[x]!]!++
      }
    }
  }

  const rows: FrameSystole['rows'] = []
  let systole = -1

  for (let r = 0; r <= maxRadius; r++) {
    const shellsEqual = EXACT_SHELLS.slice(0, r + 1).every((n, d) => shells[d] === n) && r < EXACT_SHELLS.length
    const sameShellEdges = sameShell.slice(0, r + 1).reduce((s, v) => s + v, 0)

    if (shellsEqual && sameShellEdges === 0 && systole === r - 1) {
      systole = r
    }

    rows.push({ radius: r, shellsEqual, sameShellEdges })
  }

  return { systole, shells, rows }
}

// ---- the cusps ----

export type CuspIncidence = {
  // the 24 ideal vertices of the base cell, W(F4) v
  readonly vertices: ExactVector[]
  // facetVertices[a]: the vertices on the facet of label a
  readonly facetVertices: number[][]
  // antipode[j]: the index of Z w_j
  readonly antipode: number[]
  readonly gates: {
    twentyFourVertices: boolean
    sixPerFacet: boolean
    sixFacetsPerVertex: boolean
    antipodeFixedPointFree: boolean
    // j on facet a implies antipode j on facet OPPOSITE a
    antipodeCrossesToOpposite: boolean
  }
}

export function cuspIncidence(cell: ExactCell = exactCell()): CuspIncidence {
  const vertices: ExactVector[] = []
  const seen = new Map<string, number>()

  for (const h of cell.stabilizer) {
    const w = matrixVector(h, CUSP_VERTEX)
    const key = w.join(',')

    if (!seen.has(key)) {
      seen.set(key, vertices.length)
      vertices.push(w)
    }
  }

  const facetVertices = cell.faceOfLabel.map(face =>
    vertices
      .map((w, j) => ({ j, f: twiceForm(cell.normals[face]!, w) }))
      .filter(({ f }) => f[0] === 0n && f[1] === 0n)
      .map(({ j }) => j),
  )
  const antipode = vertices.map(w => seen.get(matrixVector(cell.inversion, w).join(',')) ?? -1)
  const perVertex = new Array<number>(vertices.length).fill(0)

  facetVertices.forEach(list => list.forEach(j => perVertex[j]!++))

  return {
    vertices,
    facetVertices,
    antipode,
    gates: {
      twentyFourVertices: vertices.length === 24,
      sixPerFacet: facetVertices.every(list => list.length === 6),
      sixFacetsPerVertex: perVertex.every(n => n === 6),
      antipodeFixedPointFree: antipode.every((a, j) => a >= 0 && a !== j && antipode[a] === j),
      antipodeCrossesToOpposite: facetVertices.every((list, a) =>
        list.every(j => facetVertices[OPPOSITE[a]!]!.includes(antipode[j]!)),
      ),
    },
  }
}

export type CuspCount = {
  readonly cusps: number
  // the distinct cube counts of the cusps (one value when every cusp is alike)
  readonly cubeCounts: number[]
  readonly incidences: number
}

export function cuspCount(table: Int32Array, docks: number, incidence: CuspIncidence): CuspCount {
  const V = incidence.vertices.length
  const parent = new Int32Array(docks * V)

  for (let i = 0; i < parent.length; i++) {
    parent[i] = i
  }

  const root = (i: number): number => {
    let r = i

    while (parent[r] !== r) {
      r = parent[r]!
    }

    let c = i

    while (parent[c] !== r) {
      const n = parent[c]!

      parent[c] = r
      c = n
    }

    return r
  }

  for (let x = 0; x < docks; x++) {
    for (let a = 0; a < SLOTS; a++) {
      const y = table[x * SLOTS + a]!

      for (const j of incidence.facetVertices[a]!) {
        const p = root(x * V + j)
        const q = root(y * V + incidence.antipode[j]!)

        if (p !== q) {
          parent[p] = q
        }
      }
    }
  }

  const sizes = new Map<number, number>()

  for (let i = 0; i < parent.length; i++) {
    const r = root(i)

    sizes.set(r, (sizes.get(r) ?? 0) + 1)
  }

  return {
    cusps: sizes.size,
    cubeCounts: [...new Set(sizes.values())].sort((a, b) => a - b),
    incidences: parent.length,
  }
}

// ---- the mesh ----

// The quotient as the Mesh the working rule takes (the shape of buildQuotient3434, so E-GMT-0042's rule run takes it).
export function quotientMesh(
  table: Int32Array,
  docks: number,
  id: string,
  cell: ExactCell = exactCell(),
): Quotient3434 {
  const gates = graphGates(table, docks)
  const oppositeIsKnitOpposite = cell.opposite.every((o, k) => o === OPPOSITE[k])
  const failed = Object.entries({ ...gates, oppositeIsKnitOpposite }).filter(([, ok]) => !ok)

  if (failed.length > 0) {
    throw new Error(`quotientMesh: fails ${failed.map(([n]) => n).join(', ')}`)
  }

  return {
    mesh: {
      id,
      degree: SLOTS,
      cellCount: docks,
      neighbour(c, direction) {
        return table[c * SLOTS + direction] ?? -1
      },
      opposite(direction) {
        return OPPOSITE[direction] ?? direction
      },
    },
    cells: docks,
    table,
    prime: 2,
    gates: { returnsExactly: gates.returnsExactly, oppositeIsKnitOpposite, noSelfLoops: gates.noSelfLoops },
  }
}

// the H = W(F4) elements whose reduction lies in K_I, and how many distinct reductions H has (H_I)
export function cellMeetsFrames(e: FrameEnumeration, cell: ExactCell = exactCell()): {
  cellImage: number
  cellInFrames: number
} {
  const keys = new Set<string>()
  let cellInFrames = 0

  for (const h of cell.stabilizer) {
    const x = reduceToLevel(h, e.ring)
    const key = x.join(',')

    if (!keys.has(key)) {
      keys.add(key)
      cellInFrames += e.indexOf(x) >= 0 ? 1 : 0
    }
  }

  return { cellImage: keys.size, cellInFrames }
}

// ---- the local systole of any table (slots of -1 ignored) ----

// The largest r <= maxRadius whose r-ball around `start` equals the honeycomb's labelled r-ball: shells 1, 24, 456,
// 8,376, 153,192 and no edge inside a shell. For a ball table it must be called with maxRadius below the ball's
// radius, so every expanded dock has all its slots.
export function localSystole(
  table: Int32Array,
  start: number,
  maxRadius = 4,
): { systole: number; shells: number[]; sameShellEdges: number[] } {
  const dist = new Map<number, number>([[start, 0]])
  const order = [start]

  for (let h = 0; h < order.length; h++) {
    const x = order[h]!
    const d = dist.get(x)!

    if (d >= maxRadius) {
      continue
    }

    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (y >= 0 && !dist.has(y)) {
        dist.set(y, d + 1)
        order.push(y)
      }
    }
  }

  const shells = new Array<number>(maxRadius + 1).fill(0)
  const sameShellEdges = new Array<number>(maxRadius + 1).fill(0)

  for (const x of order) {
    const d = dist.get(x)!

    shells[d]!++

    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (y >= 0 && dist.get(y) === d) {
        sameShellEdges[d]!++
      }
    }
  }

  let systole = -1

  for (let r = 0; r <= maxRadius && r < EXACT_SHELLS.length; r++) {
    if (shells[r] === EXACT_SHELLS[r] && sameShellEdges[r] === 0 && systole === r - 1) {
      systole = r
    }
  }

  return { systole, shells, sameShellEdges }
}

// ---- LAYERS: subgroups between two 2-adic levels ----
//
// For m >= j, the kernel K(m) = K cap G((sqrt 2)^m) modulo K(m + j) is abelian: n = 1 + eps X with eps = (sqrt 2)^m,
// and (1 + eps X)(1 + eps Y) = 1 + eps (X + Y) mod (sqrt 2)^(m + j) since eps^2 lies in (sqrt 2)^(2m). X_n = (n - 1) /
// eps is a 5 x 5 matrix over R_j = Z[sqrt 2] / (sqrt 2)^j (j <= 2, a ring of characteristic 2, so a matrix is a
// vector of 25 j bits). For an additive subgroup W, N_W = {n in K(m) : X_n in W} is a subgroup of K, between K(m + j)
// and K(m), with [K : N_W] = |K_m| [A : A cap W], A the image of n -> X_n. Conjugation acts as g X g^-1 (g reduced
// mod (sqrt 2)^j), so a W closed under the five reflections makes N_W normal in G, every dock and cusp alike.
//
// The right coset N_W g of a frame g (held mod (sqrt 2)^(m + j)) is keyed by g's level-m digits and the class of
// D g^-1 modulo W, where D is g's top j digits read as a matrix over R_j: if g' = n g then g' has the same level-m
// digits and D' = D + X_n g, so D' g'^-1 = D g^-1 + X_n (g' = g mod (sqrt 2)^j since m >= j).
//
// The short elements: n in K(m) with |n| <= 10 are exactly the n = w1 w2^-1 with w1, w2 in the radius-5 ball of K
// mod (sqrt 2)^(m + j) (graph distances there are the least word lengths of the cosets), equal level-m digits, and
// |w1| + |w2| = |n|; X_n = (D1 - D2) w2^-1.

const twoRing = (p: number): LevelRing => levelRing({ twoPower: p, odd: 1 })

function digit(a: number, b: number, p: number): number {
  return p % 2 === 0 ? (a >> (p / 2)) & 1 : (b >> ((p - 1) / 2)) & 1
}

// x (residues at level m + j) -> its level-m residues and its top j digits as a matrix over R_j
function splitLayer(x: Int32Array, m: number, j: number, low: Int32Array, top: Int32Array): void {
  const lowRing = twoRing(m)

  for (let e = 0; e < ENTRIES; e++) {
    const a = x[e]!
    const b = x[ENTRIES + e]!

    low[e] = a % lowRing.modA
    low[ENTRIES + e] = b % lowRing.modB
    top[e] = digit(a, b, m)
    top[ENTRIES + e] = j > 1 ? digit(a, b, m + 1) : 0
  }
}

// x (residues at a level >= j) reduced to level j
function toLevel(x: Int32Array, j: number, out: Int32Array): void {
  const ring = twoRing(j)

  for (let e = 0; e < ENTRIES; e++) {
    out[e] = x[e]! % ring.modA
    out[ENTRIES + e] = x[ENTRIES + e]! % ring.modB
  }
}

// a matrix over R_j (residues 0 or 1) as two 25-bit numbers
function bitsOf(x: Int32Array): [number, number] {
  let lo = 0
  let hi = 0

  for (let e = 0; e < ENTRIES; e++) {
    lo |= x[e]! << e
    hi |= x[ENTRIES + e]! << e
  }

  return [lo >>> 0, hi >>> 0]
}

function fromBits(lo: number, hi: number, out: Int32Array): void {
  for (let e = 0; e < ENTRIES; e++) {
    out[e] = (lo >>> e) & 1
    out[ENTRIES + e] = (hi >>> e) & 1
  }
}

const TWO_25 = 2 ** 25
const keyNumber = (lo: number, hi: number): number => lo + hi * TWO_25
const toBig = (key: number): bigint => BigInt(key % TWO_25) | (BigInt(Math.floor(key / TWO_25)) << 25n)
const bigToBits = (v: bigint): [number, number] => [
  Number(v & 0x1ffffffn),
  Number((v >> 25n) & 0x1ffffffn),
]

// the group K mod (sqrt 2)^j and each element's inverse, keyed by residues
function smallInverses(j: number, cell: ExactCell): Map<string, Int32Array> {
  const ring = twoRing(j)
  const e = enumerateFrames({ level: ring.level, maxDocks: 4096, cell })
  const elements: Int32Array[] = []

  for (let i = 0; i < e.order; i++) {
    const x = new Int32Array(2 * ENTRIES)

    e.frame(i, x)
    elements.push(x)
  }

  const one = new Int32Array(2 * ENTRIES)

  for (let i = 0; i < DIM; i++) {
    one[i * DIM + i] = 1
  }

  const product = new Int32Array(2 * ENTRIES)
  const out = new Map<string, Int32Array>()

  for (const x of elements) {
    const inv = elements.find(y => {
      levelProduct(x, y, ring, product)

      return product.every((v, i) => v === one[i])
    })

    if (!inv) {
      throw new Error('smallInverses: no inverse')
    }

    out.set(x.join(','), inv)
  }

  return out
}

export type LayerAnalysis = {
  readonly m: number
  readonly j: number
  // the radius-5 ball of K mod (sqrt 2)^(m + j): its docks and the systole around the identity
  readonly ballDocks: number
  readonly ballSystole: number
  readonly ballShells: number[]
  // the least length (<= 10) of an element of K(m) with each nonzero layer vector X (keyNumber of its bits)
  readonly lengths: Map<number, number>
  readonly pairs: number
}

export function analyzeLayer(input: {
  m: number
  j: number
  ballCap: number
  cell?: ExactCell
}): LayerAnalysis | undefined {
  const { m, j } = input
  const cell = input.cell ?? exactCell()

  if (j < 1 || j > 2 || m < j) {
    throw new Error(`analyzeLayer: need 1 <= j <= 2 and m >= j (m ${m}, j ${j})`)
  }

  const ball = enumerateFrames({ level: { twoPower: m + j, odd: 1 }, maxDocks: input.ballCap, radius: 5, cell })

  if (!ball.fits) {
    return undefined
  }

  const local = localSystole(ball.table, 0, 4)
  const inverses = smallInverses(j, cell)
  const classes = [...inverses.keys()]
  const classInverse = classes.map(k => inverses.get(k)!)
  const ringJ = twoRing(j)
  const n = ball.order
  const classOf = new Uint8Array(n)
  // P[i][c] = D_i (class c)^-1, as two 25-bit numbers each
  const pLo = new Uint32Array(n * classes.length)
  const pHi = new Uint32Array(n * classes.length)
  const h1 = new Uint32Array(n)
  const h2 = new Uint32Array(n)
  const x = new Int32Array(2 * ENTRIES)
  const low = new Int32Array(2 * ENTRIES)
  const top = new Int32Array(2 * ENTRIES)
  const small = new Int32Array(2 * ENTRIES)
  const product = new Int32Array(2 * ENTRIES)

  for (let i = 0; i < n; i++) {
    ball.frame(i, x)
    splitLayer(x, m, j, low, top)
    toLevel(x, j, small)

    const c = classes.indexOf(small.join(','))

    if (c < 0) {
      throw new Error('analyzeLayer: a frame outside K mod (sqrt 2)^j')
    }

    classOf[i] = c

    classInverse.forEach((inv, k) => {
      levelProduct(top, inv, ringJ, product)

      const [lo, hi] = bitsOf(product)

      pLo[i * classes.length + k] = lo
      pHi[i * classes.length + k] = hi
    })

    let a = 0x811c9dc5
    let b = 0x2545f491

    for (let e = 0; e < 2 * ENTRIES; e++) {
      a = Math.imul(a ^ low[e]!, 0x01000193)
      b = Math.imul(b ^ (low[e]! + 17 * e), 0x5bd1e995)
      b ^= b >>> 13
    }

    h1[i] = a >>> 0
    h2[i] = b >>> 0
  }

  const order = new Uint32Array(n)

  for (let i = 0; i < n; i++) {
    order[i] = i
  }

  order.sort((p, q) => h1[p]! - h1[q]! || h2[p]! - h2[q]!)

  const lengths = new Map<number, number>()
  const lowP = new Int32Array(2 * ENTRIES)
  const lowQ = new Int32Array(2 * ENTRIES)
  const C = classes.length
  let pairs = 0

  for (let start = 0; start < n; ) {
    let end = start + 1

    while (end < n && h1[order[end]!] === h1[order[start]!] && h2[order[end]!] === h2[order[start]!]) {
      end++
    }

    // the hashes agree; confirm the level-m digits do, for every member of the run
    ball.frame(order[start]!, x)
    splitLayer(x, m, j, lowP, top)

    for (let s = start + 1; s < end; s++) {
      ball.frame(order[s]!, x)
      splitLayer(x, m, j, lowQ, top)

      if (!lowP.every((v, e) => v === lowQ[e])) {
        throw new Error('analyzeLayer: a 64-bit hash collision between level-m classes')
      }
    }

    const near: number[] = []

    for (let t = start; t < end; t++) {
      if (ball.distance[order[t]!]! <= 4) {
        near.push(order[t]!)
      }
    }

    for (let s = start; s < end; s++) {
      const w1 = order[s]!
      const d1 = ball.distance[w1]!

      for (const w2 of near) {
        const d2 = ball.distance[w2]!

        if (w1 === w2 || d1 + d2 > 10) {
          continue
        }

        const c = classOf[w2]!
        const lo = (pLo[w1 * C + c]! ^ pLo[w2 * C + c]!) >>> 0
        const hi = (pHi[w1 * C + c]! ^ pHi[w2 * C + c]!) >>> 0
        const key = keyNumber(lo, hi)
        const before = lengths.get(key)

        pairs++

        if (before === undefined || d1 + d2 < before) {
          lengths.set(key, d1 + d2)
        }
      }
    }

    start = end
  }

  return {
    m,
    j,
    ballDocks: n,
    ballSystole: local.systole,
    ballShells: local.shells,
    lengths,
    pairs,
  }
}

// ---- subspaces over F_2 (bigints, echelon by highest bit) ----

type Echelon = { pivot: number; vec: bigint }[]

const highBit = (v: bigint): number => v.toString(2).length - 1

function reduceBy(basis: Echelon, v: bigint): bigint {
  let x = v

  for (const { pivot, vec } of basis) {
    if ((x >> BigInt(pivot)) & 1n) {
      x ^= vec
    }
  }

  return x
}

function insert(basis: Echelon, v: bigint): boolean {
  const r = reduceBy(basis, v)

  if (r === 0n) {
    return false
  }

  basis.push({ pivot: highBit(r), vec: r })
  basis.sort((a, b) => b.pivot - a.pivot)

  return true
}

export type LayerSubgroup = {
  readonly m: number
  readonly j: number
  // the target: every nonzero X of length <= 2 r + 1 avoided
  readonly radius: number
  readonly basis: bigint[]
  readonly dimension: number
  // the dimension of the span of every X found (lengths <= 10), a lower bound on dim A
  readonly spanDimension: number
}

// A W closed under conjugation by the five reflections, avoiding every X of length <= 2 r + 1, grown greedily from
// the longest X found (the longest first, then by value, so the result is deterministic).
export function layerSubgroup(analysis: LayerAnalysis, r: number, cell: ExactCell = exactCell()): LayerSubgroup {
  const ringJ = twoRing(analysis.j)
  const reflections = cell.reflections.map(s => reduceToLevel(s, ringJ))
  const bad: bigint[] = []
  const good: { key: number; length: number }[] = []
  const span: Echelon = []

  for (const [key, length] of analysis.lengths) {
    insert(span, toBig(key))

    if (length <= 2 * r + 1) {
      bad.push(toBig(key))
    } else {
      good.push({ key, length })
    }
  }

  good.sort((p, q) => q.length - p.length || p.key - q.key)

  const x = new Int32Array(2 * ENTRIES)
  const product = new Int32Array(2 * ENTRIES)
  const conj = new Int32Array(2 * ENTRIES)
  const conjugates = (v: bigint): bigint[] => {
    const [lo, hi] = bigToBits(v)

    fromBits(lo, hi, x)

    return reflections.map(s => {
      levelProduct(s, x, ringJ, product)
      levelProduct(product, s, ringJ, conj)

      const [clo, chi] = bitsOf(conj)

      return toBig(keyNumber(clo, chi))
    })
  }

  const closure = (basis: Echelon, v: bigint): Echelon => {
    const out = basis.slice()
    const queue = [v]

    while (queue.length > 0) {
      const w = queue.pop()!

      if (insert(out, w)) {
        queue.push(...conjugates(w))
      }
    }

    return out
  }

  let w: Echelon = []

  for (const { key } of good) {
    const v = toBig(key)

    if (reduceBy(w, v) === 0n) {
      continue
    }

    const next = closure(w, v)

    if (bad.every(b => reduceBy(next, b) !== 0n)) {
      w = next
    }
  }

  return {
    m: analysis.m,
    j: analysis.j,
    radius: r,
    basis: w.map(b => b.vec),
    dimension: w.length,
    spanDimension: span.length,
  }
}

// ---- the layered quotient K / N_W ----

export type LayeredEnumeration = {
  readonly fits: boolean
  readonly order: number
  readonly table: Int32Array
}

export function enumerateLayered(input: {
  subgroup: LayerSubgroup
  maxDocks: number
  cell?: ExactCell
}): LayeredEnumeration {
  const cell = input.cell ?? exactCell()
  const { m, j } = input.subgroup
  const ringM = twoRing(m + j)
  const ringJ = twoRing(j)
  const transports = cell.transports.map(t => reduceToLevel(t, ringM))
  const inverses = smallInverses(j, cell)
  const basis: Echelon = []

  input.subgroup.basis.forEach(v => insert(basis, v))

  const repPk = packer(ringM)
  const lowPk = packer(twoRing(m))
  const RW = repPk.words
  const KW = lowPk.words + 2
  const capacity = input.maxDocks + 1
  let size = 1

  while (size < 2 * capacity) {
    size *= 2
  }

  const slots = new Int32Array(size).fill(-1)
  const keys = new Uint32Array(capacity * KW)
  const reps = new Uint32Array(capacity * RW)
  let table = new Int32Array(Math.min(capacity, 1 << 16) * SLOTS)

  const low = new Int32Array(2 * ENTRIES)
  const top = new Int32Array(2 * ENTRIES)
  const small = new Int32Array(2 * ENTRIES)
  const product = new Int32Array(2 * ENTRIES)

  const keyOf = (x: Int32Array, out: Uint32Array): void => {
    splitLayer(x, m, j, low, top)
    toLevel(x, j, small)

    const inv = inverses.get(small.join(','))

    if (!inv) {
      throw new Error('enumerateLayered: a frame outside K mod (sqrt 2)^j')
    }

    levelProduct(top, inv, ringJ, product)

    const [lo, hi] = bitsOf(product)
    const [rlo, rhi] = bigToBits(reduceBy(basis, toBig(keyNumber(lo, hi))))

    lowPk.pack(low, out, 0)
    out[KW - 2] = rlo
    out[KW - 1] = rhi
  }

  const find = (probe: Uint32Array): { slot: number; id: number } => {
    let s = hashWords(probe, 0, KW) & (size - 1)

    for (;;) {
      const id = slots[s]!

      if (id < 0) {
        return { slot: s, id: -1 }
      }

      let same = true

      for (let w = 0; w < KW && same; w++) {
        same = keys[id * KW + w] === probe[w]
      }

      if (same) {
        return { slot: s, id }
      }

      s = (s + 1) & (size - 1)
    }
  }

  const one = new Int32Array(2 * ENTRIES)

  for (let i = 0; i < DIM; i++) {
    one[i * DIM + i] = 1
  }

  const scratch = new Uint32Array(KW)

  keyOf(one, scratch)
  keys.set(scratch, 0)
  repPk.pack(one, reps, 0)
  slots[find(scratch).slot] = 0

  let count = 1
  let fits = true
  const g = new Int32Array(2 * ENTRIES)
  const next = new Int32Array(2 * ENTRIES)

  for (let head = 0; head < count && fits; head++) {
    if ((head + 1) * SLOTS > table.length) {
      const grown = new Int32Array(Math.min(capacity * SLOTS, table.length * 2))

      grown.set(table)
      table = grown
    }

    repPk.unpack(reps, head * RW, g)

    for (let k = 0; k < SLOTS; k++) {
      levelProduct(g, transports[k]!, ringM, next)
      keyOf(next, scratch)

      const hit = find(scratch)
      let id = hit.id

      if (id < 0) {
        if (count >= capacity) {
          fits = false
          break
        }

        id = count++
        keys.set(scratch, id * KW)
        repPk.pack(next, reps, id * RW)
        slots[hit.slot] = id
      }

      table[head * SLOTS + k] = id
    }
  }

  return {
    fits,
    order: count,
    table: fits ? table.slice(0, count * SLOTS) : new Int32Array(0),
  }
}
