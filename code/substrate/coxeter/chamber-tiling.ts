// EXACT tile balls of a regular tiling, grown on demand from a Coxeter group alone: no coordinates, no floating point,
// no rounding, only integer chamber ids and the Coxeter matrix. It lifts the float precision wall of buildCellGraph
// (about 15,000 cells), so a ball's radius is limited only by memory (item vibe-computation-models-0027, decision 003).
//
// THE CHAMBER COMPLEX. A chamber is an element w of a Coxeter group W = <s_0..s_n | (s_i s_j)^m_ij> (m_ij may be
// infinite: no relation), and w s_i is its neighbour across panel i. Chambers are built in shells of word length L.
// Every edge joins lengths L and L + 1 (the length always changes by one), so processing shell L means: for each
// chamber w of length L and each generator k whose edge is still undefined, the chamber x = w s_k is NEW at length
// L + 1, unless it is already known through another parent. The other parents of x are exactly the chambers x s_l of
// length L, one per further descent l of x, and they are found by a walk, never a search:
//
//   for l != k with m_kl finite, walk from w through the letters l, k, l, k, ... (2 m_kl - 2 of them). The walk ends
//   at w (s_l s_k)^(m_kl - 1) = x s_k (s_l s_k)^(m_kl - 1) = x s_l, a group identity by (s_k s_l)^m_kl = 1.
//
// If l is a descent of x, x is the top of its {k,l} residue (a 2 m_kl-gon), every other chamber of that residue has
// length at most L, and every edge among chambers of length at most L is already defined (its lower end was
// processed), so the walk succeeds and ends at the parent x s_l, which is then linked to x. If l is not a descent, x s_l
// has length L + 2, which is never built, so the walk meets an undefined edge and stops (with m_kl infinite, s_k s_l
// has infinite order and x is never the top of a {k,l} residue). Every defined edge is a true group relation, so a walk
// that succeeds is correct whatever chambers it passes. The construction is therefore the exact Cayley graph ball of W,
// shell by shell (Tits: the rank-2 relations are all the relations). Gates that throw rather than continue: a walk
// ending at a chamber whose length is not L (impossible by parity), and a parent whose edge l is already taken.
//
// TILES. A tile is a coset w W_J of the cell stabilizer W_J = <s_j : j in J>, and two tiles are facet neighbours when a
// chamber of one is the s_g neighbour, g outside J, of a chamber of the other. The tile of a chamber is set when it is
// created: a coset holds a unique shortest element u, and every other element u v (v in W_J, v != 1) has a J-descent
// whose parent is in the same coset and already built, so a chamber with a J-parent takes that parent's tile (all its
// J-parents must agree, a gate), and a chamber without one is a coset's shortest element and opens a new tile. A tile
// is COMPLETE once all |W_J| of its chambers exist and every one of them has been processed, so its facet neighbours are
// known exactly.
//
// THE SYSTEMS (`tilingSystem`). One regular tiling is the tile graph of several Coxeter systems, and the cheapest is the
// one whose word length is closest to the tile distance, because shells grow by word length:
//
// - 'tile': when every dihedral angle of the tile is pi / k, the tiles themselves are the chambers of the reflection
//   group of one tile (J empty), and word length IS the facet distance, so nothing is built outside the ball. {p,q} with
//   q even: the p-gon group, m = q / 2 for adjacent sides, infinite for the rest ({5,4}, {6,4}: right-angled).
//   {3,4,3,4}: the right-angled 24-cell, 24 generators in rootsD4() order, m = 2 when two facets share a triangle (root
//   dot product 1) and infinite otherwise (they meet at an ideal vertex or not at all).
// - 'sector': {p,q} with p even: the tile cut into p triangles from its center, the triangle group (p/2, q, q), J the
//   two center mirrors (|W_J| = p), the outward generator the tile edge.
// - 'chamber': any {p,q}: the (2, p, q) triangle group of the linear symbol, J = {s_0, s_1} (|W_J| = 2p).
//
// Two systems of one tiling are two independent constructions of the same tile graph, so the exactness experiment
// checks them against each other.
//
// LAZY. A complex grows only as far as a caller asks: `tileBall(radius)` adds chamber shells until every tile within
// `radius` facet steps of the origin tile is complete, and the complex keeps what it built for the next, larger ask.
// With `maxCells` it stops and throws as soon as the ball is known to hold more tiles than that.
//
// `skipPair` drops the residue walk for one generator pair. It exists ONLY so a negative control can show that the
// gates catch a broken closure, and the lab never passes it.

import { rootsD4 } from '@/code/algebra/group/root-system'

export type SystemKind = 'tile' | 'sector' | 'chamber'

export type CoxeterSystem = {
  readonly name: string
  readonly kind: SystemKind
  // the tiling it builds
  readonly symbol: readonly number[]
  // m_ij, Infinity for no relation, 1 on the diagonal
  readonly coxeter: readonly (readonly number[])[]
  // the cell stabilizer's generators J; every other generator crosses a facet
  readonly cellGenerators: readonly number[]
}

export type TileBall = {
  readonly system: string
  readonly radius: number
  // tile neighbours inside the ball, tiles numbered in breadth-first order from the origin tile (tile 0)
  readonly neighbors: number[][]
  readonly distance: Int32Array
  readonly shellSizes: number[]
  // the complex's own tile id of each ball cell
  readonly tiles: Int32Array
  // chambers the complex held when the ball was cut, and the longest chamber word built
  readonly chambers: number
  readonly chamberLength: number
}

export class TileBallTooLarge extends Error {
  constructor(
    readonly system: string,
    readonly radius: number,
    readonly atLeast: number,
    readonly maxCells: number,
  ) {
    super(
      `chamber-tiling: ${system} ball of radius ${radius} holds at least ${atLeast} tiles, over the cap ${maxCells}`,
    )
  }
}

const NONE = -1

function symbolKey(symbol: readonly number[]): string {
  return `{${symbol.join(',')}}`
}

// The Coxeter system of one kind for a tiling, or null when that kind does not apply.
export function tilingSystem(
  symbol: readonly number[],
  kind: SystemKind,
): CoxeterSystem | null {
  const name = `${symbolKey(symbol)}/${kind}`

  if (symbol.join(',') === '3,4,3,4') {
    if (kind !== 'tile') {
      return null
    }

    const roots = rootsD4()
    const coxeter = roots.map((a, i) =>
      roots.map((b, j) => {
        if (i === j) {
          return 1
        }

        let dot = 0

        a.forEach((x, t) => {
          dot += x * b[t]!
        })

        return dot === 1 ? 2 : Number.POSITIVE_INFINITY
      }),
    )

    return { name, kind, symbol: [...symbol], coxeter, cellGenerators: [] }
  }

  if (symbol.length !== 2) {
    return null
  }

  const [p, q] = symbol as [number, number]

  if (!Number.isInteger(p) || !Number.isInteger(q) || p < 3 || q < 3) {
    throw new Error(`chamber-tiling: ${symbolKey(symbol)} is not a tiling symbol`)
  }

  if (kind === 'tile') {
    if (q % 2 !== 0) {
      return null
    }

    const coxeter = Array.from({ length: p }, (_, i) =>
      Array.from({ length: p }, (_, j) => {
        if (i === j) {
          return 1
        }

        const gap = Math.abs(i - j)

        return gap === 1 || gap === p - 1 ? q / 2 : Number.POSITIVE_INFINITY
      }),
    )

    return { name, kind, symbol: [p, q], coxeter, cellGenerators: [] }
  }

  if (kind === 'sector') {
    if (p % 2 !== 0) {
      return null
    }

    return {
      name,
      kind,
      symbol: [p, q],
      coxeter: [
        [1, p / 2, q],
        [p / 2, 1, q],
        [q, q, 1],
      ],
      cellGenerators: [0, 1],
    }
  }

  return {
    name,
    kind,
    symbol: [p, q],
    coxeter: [
      [1, p, 2],
      [p, 1, q],
      [2, q, 1],
    ],
    cellGenerators: [0, 1],
  }
}

// The cheapest system for a tiling: 'tile', else 'sector', else 'chamber'.
export function bestSystem(symbol: readonly number[]): CoxeterSystem {
  for (const kind of ['tile', 'sector', 'chamber'] as const) {
    const s = tilingSystem(symbol, kind)

    if (s) {
      return s
    }
  }

  throw new Error(`chamber-tiling: no Coxeter system for ${symbolKey(symbol)}`)
}

export class ChamberComplex {
  readonly system: CoxeterSystem
  readonly rank: number
  // |W_J|, chambers per tile (0 when tiles are not tracked)
  readonly tileOrder: number
  private readonly coxeter: number[][]
  private readonly inJ: Uint8Array
  private readonly outward: number[]
  private readonly tracksTiles: boolean
  private readonly skip: readonly [number, number] | null
  private edge: Int32Array
  private lengthOf: Int32Array
  private tileOf: Int32Array
  private nextInTile: Int32Array
  private tileHead: Int32Array
  private tileSize: Int32Array
  private tileTop: Int32Array
  // the coset's shortest chamber, the one that opened the tile
  private tileFirst: Int32Array
  chamberCount = 0
  tileCount = 0
  // shellStart[L] = the first chamber of length L; shellStart[top + 1] = chamberCount
  readonly shellStart: number[] = [0]
  // the longest word built; every chamber shorter than `top` has all its edges defined
  top = 0

  constructor(input: {
    system: CoxeterSystem
    tiles?: boolean
    skipPair?: readonly [number, number]
  }) {
    this.system = input.system
    this.coxeter = input.system.coxeter.map(row => [...row])
    this.rank = this.coxeter.length
    this.tracksTiles = input.tiles ?? true
    this.skip = input.skipPair ?? null
    this.inJ = new Uint8Array(this.rank)

    for (const j of input.system.cellGenerators) {
      this.inJ[j] = 1
    }

    this.outward = []

    for (let g = 0; g < this.rank; g++) {
      if (!this.inJ[g]) {
        this.outward.push(g)
      }
    }

    this.coxeter.forEach((row, i) => {
      if (row.length !== this.rank) {
        throw new Error('chamber-tiling: the Coxeter matrix is not square')
      }

      row.forEach((m, j) => {
        const ok =
          i === j
            ? m === 1
            : m === Number.POSITIVE_INFINITY || (Number.isInteger(m) && m >= 2)

        if (!ok || this.coxeter[j]![i] !== m) {
          throw new Error(`chamber-tiling: Coxeter entry (${i}, ${j}) = ${m} is not valid`)
        }
      })
    })

    const capacity = 1024

    this.edge = new Int32Array(capacity * this.rank).fill(NONE)
    this.lengthOf = new Int32Array(capacity)
    this.tileOf = new Int32Array(capacity).fill(NONE)
    this.nextInTile = new Int32Array(capacity).fill(NONE)
    this.tileHead = new Int32Array(capacity).fill(NONE)
    this.tileSize = new Int32Array(capacity)
    this.tileTop = new Int32Array(capacity)
    this.tileFirst = new Int32Array(capacity).fill(NONE)
    this.tileOrder = this.tracksTiles
      ? finiteCoxeterOrder(
          input.system.cellGenerators.map(i =>
            input.system.cellGenerators.map(j => input.system.coxeter[i]![j]!),
          ),
        )
      : 0

    const identity = this.newChamber(0)

    if (this.tracksTiles) {
      this.openTile(identity)
    }

    this.shellStart.push(this.chamberCount)
  }

  // the chamber across panel `generator` of `chamber`, -1 while undefined
  neighbor(chamber: number, generator: number): number {
    return this.edge[chamber * this.rank + generator]!
  }

  length(chamber: number): number {
    return this.lengthOf[chamber]!
  }

  tile(chamber: number): number {
    return this.tileOf[chamber]!
  }

  // chambers of each word length built so far, lengths 0..top
  chamberShells(): number[] {
    const out: number[] = []

    for (let L = 0; L <= this.top; L++) {
      out.push(this.shellStart[L + 1]! - this.shellStart[L]!)
    }

    return out
  }

  // Process the top shell: define every edge of every chamber of length `top`, creating length top + 1. Returns the
  // number of chambers created (0 once a finite group's longest element is reached).
  growShell(): number {
    const L = this.top
    const start = this.shellStart[L]!
    const end = this.shellStart[L + 1]!
    const before = this.chamberCount
    const rank = this.rank

    for (let w = start; w < end; w++) {
      for (let k = 0; k < rank; k++) {
        if (this.edge[w * rank + k]! !== NONE) {
          continue
        }

        const x = this.newChamber(L + 1)

        this.link(w, k, x)

        let tile = this.tracksTiles && this.inJ[k] ? this.tileOf[w]! : NONE

        const row = this.coxeter[k]!

        for (let l = 0; l < rank; l++) {
          const m = row[l]!

          if (l === k || m === Number.POSITIVE_INFINITY || this.skipped(k, l)) {
            continue
          }

          const z = this.walk(w, l, k, 2 * m - 2)

          if (z === NONE) {
            continue
          }

          if (this.lengthOf[z]! !== L) {
            throw new Error(
              `chamber-tiling: a residue walk ended at length ${this.lengthOf[z]}, not ${L}`,
            )
          }

          if (this.edge[z * rank + l]! !== NONE) {
            throw new Error('chamber-tiling: a parent edge is already taken (duplicate chamber)')
          }

          this.link(z, l, x)

          if (this.tracksTiles && this.inJ[l]) {
            const t = this.tileOf[z]!

            if (tile === NONE) {
              tile = t
            } else if (t !== tile) {
              throw new Error('chamber-tiling: J-parents disagree on the tile')
            }
          }
        }

        if (this.tracksTiles) {
          if (tile === NONE) {
            this.openTile(x)
          } else {
            this.joinTile(x, tile)
          }

          if (!this.inJ[k] && this.tileOf[x] === this.tileOf[w]) {
            throw new Error('chamber-tiling: an outward step stayed inside its tile')
          }
        }
      }
    }

    this.top = L + 1
    this.shellStart.push(this.chamberCount)

    return this.chamberCount - before
  }

  // A tile is complete when all |W_J| chambers exist and all of them have every edge defined.
  tileComplete(tile: number): boolean {
    return (
      this.tileSize[tile] === this.tileOrder && this.tileTop[tile]! < this.top
    )
  }

  // The facet neighbours of a complete tile. In 2D they come in cyclic order with ONE orientation for every tile (a
  // rotation system): around the tile's shortest chamber u, alternating the two cell mirrors (or the polygon's sides in
  // generator order), reversed when u has odd length, since every reflection reverses orientation. In higher dimension:
  // chambers in build order, outward generators in index order.
  tileNeighbors(tile: number): number[] {
    if (!this.tileComplete(tile)) {
      throw new Error(`chamber-tiling: tile ${tile} is not complete`)
    }

    if (this.system.symbol.length === 2) {
      return this.cyclicNeighbors(tile)
    }

    const chambers: number[] = []

    for (let c = this.tileHead[tile]!; c !== NONE; c = this.nextInTile[c]!) {
      chambers.push(c)
    }

    chambers.sort((a, b) => a - b)

    const out: number[] = []

    for (const c of chambers) {
      for (const g of this.outward) {
        const across = this.tileOf[this.edge[c * this.rank + g]!]!

        if (!out.includes(across)) {
          out.push(across)
        }
      }
    }

    return out
  }

  // For a system whose tiles are its chambers (J empty): the ball's neighbour table, ball cell x generator, -1 where
  // the neighbour lies outside the ball. Slot g of every tile is the image of the base tile's facet g.
  slotTable(ball: TileBall): Int32Array {
    if (this.system.cellGenerators.length !== 0) {
      throw new Error('chamber-tiling: slot tables need tiles that are chambers')
    }

    const index = new Map<number, number>()

    ball.tiles.forEach((t, i) => index.set(t, i))

    const rank = this.rank
    const out = new Int32Array(ball.tiles.length * rank).fill(NONE)

    ball.tiles.forEach((t, i) => {
      const c = this.tileFirst[t]!

      for (let g = 0; g < rank; g++) {
        out[i * rank + g] = index.get(this.tileOf[this.edge[c * rank + g]!]!) ?? NONE
      }
    })

    return out
  }

  private cyclicNeighbors(tile: number): number[] {
    const u = this.tileFirst[tile]!
    const rank = this.rank

    let out: number[] = []

    if (this.system.cellGenerators.length === 0) {
      out = this.outward.map(g => this.tileOf[this.edge[u * rank + g]!]!)
    } else {
      const [m0, m1] = this.system.cellGenerators as [number, number]
      const g = this.outward[0]!

      if (this.system.cellGenerators.length !== 2 || this.outward.length !== 1) {
        throw new Error('chamber-tiling: a 2D system needs two cell mirrors and one outward generator')
      }

      let c = u

      for (let t = 0; t < this.tileOrder; t++) {
        const across = this.tileOf[this.edge[c * rank + g]!]!

        if (out[out.length - 1] !== across) {
          out.push(across)
        }

        c = this.edge[c * rank + (t % 2 === 0 ? m0 : m1)]!
      }

      if (c !== u) {
        throw new Error('chamber-tiling: the walk around a tile did not close')
      }

      if (out.length > 1 && out[0] === out[out.length - 1]) {
        out.pop()
      }
    }

    if (new Set(out).size !== out.length) {
      throw new Error('chamber-tiling: a tile meets one neighbour across two sides')
    }

    return this.lengthOf[u]! % 2 === 1 ? out.reverse() : out
  }

  // The ball of tiles within `radius` facet steps of the origin tile, grown until every one of them is complete.
  tileBall(input: { radius: number; maxCells?: number }): TileBall {
    const { radius } = input
    const maxCells = input.maxCells ?? Number.POSITIVE_INFINITY

    if (!this.tracksTiles) {
      throw new Error('chamber-tiling: this complex does not track tiles')
    }

    if (!Number.isInteger(radius) || radius < 0) {
      throw new Error('chamber-tiling: a ball needs an integer radius >= 0')
    }

    for (;;) {
      const attempt = this.tryBall(radius, maxCells)

      if (attempt) {
        return attempt
      }

      if (this.growShell() === 0) {
        throw new Error('chamber-tiling: the group is finite and the ball never closed')
      }
    }
  }

  private tryBall(radius: number, maxCells: number): TileBall | null {
    const index = new Map<number, number>([[0, 0]])
    const order: number[] = [0]
    const distance: number[] = [0]
    const rows: number[][] = []

    for (let i = 0; i < order.length; i++) {
      const t = order[i]!

      if (!this.tileComplete(t)) {
        if (order.length > maxCells) {
          throw new TileBallTooLarge(this.system.name, radius, order.length, maxCells)
        }

        return null
      }

      const row = this.tileNeighbors(t)

      rows.push(row)

      if (distance[i]! >= radius) {
        continue
      }

      for (const u of row) {
        if (!index.has(u)) {
          index.set(u, order.length)
          order.push(u)
          distance.push(distance[i]! + 1)
        }
      }
    }

    if (order.length > maxCells) {
      throw new TileBallTooLarge(this.system.name, radius, order.length, maxCells)
    }

    const neighbors = rows.map(row =>
      row.filter(u => index.has(u)).map(u => index.get(u)!),
    )
    const shellSizes: number[] = []

    for (const d of distance) {
      shellSizes[d] = (shellSizes[d] ?? 0) + 1
    }

    return {
      system: this.system.name,
      radius,
      neighbors,
      distance: Int32Array.from(distance),
      shellSizes,
      tiles: Int32Array.from(order),
      chambers: this.chamberCount,
      chamberLength: this.top,
    }
  }

  private skipped(k: number, l: number): boolean {
    const s = this.skip

    return s !== null && ((s[0] === k && s[1] === l) || (s[0] === l && s[1] === k))
  }

  private walk(from: number, l: number, k: number, steps: number): number {
    let cur = from

    for (let i = 0; i < steps; i++) {
      cur = this.edge[cur * this.rank + (i % 2 === 0 ? l : k)]!

      if (cur === NONE) {
        return NONE
      }
    }

    return cur
  }

  private link(a: number, generator: number, b: number): void {
    this.edge[a * this.rank + generator] = b
    this.edge[b * this.rank + generator] = a
  }

  private newChamber(length: number): number {
    const id = this.chamberCount

    if (id >= this.lengthOf.length) {
      const size = this.lengthOf.length * 2

      this.edge = grow(this.edge, size * this.rank, NONE)
      this.lengthOf = grow(this.lengthOf, size, 0)
      this.tileOf = grow(this.tileOf, size, NONE)
      this.nextInTile = grow(this.nextInTile, size, NONE)
    }

    this.lengthOf[id] = length
    this.chamberCount++

    return id
  }

  private openTile(chamber: number): void {
    const t = this.tileCount

    if (t >= this.tileHead.length) {
      const size = this.tileHead.length * 2

      this.tileHead = grow(this.tileHead, size, NONE)
      this.tileSize = grow(this.tileSize, size, 0)
      this.tileTop = grow(this.tileTop, size, 0)
      this.tileFirst = grow(this.tileFirst, size, NONE)
    }

    this.tileFirst[t] = chamber
    this.tileCount++
    this.joinTile(chamber, t)
  }

  private joinTile(chamber: number, tile: number): void {
    this.tileOf[chamber] = tile
    this.nextInTile[chamber] = this.tileHead[tile]!
    this.tileHead[tile] = chamber
    this.tileSize[tile] = this.tileSize[tile]! + 1
    this.tileTop[tile] = Math.max(this.tileTop[tile]!, this.lengthOf[chamber]!)

    if (this.tileSize[tile] > this.tileOrder) {
      throw new Error(`chamber-tiling: tile ${tile} holds more than ${this.tileOrder} chambers`)
    }
  }
}

function grow(a: Int32Array, size: number, fill: number): Int32Array {
  const out = new Int32Array(size).fill(fill)

  out.set(a)

  return out
}

// The order of a finite Coxeter group given by its matrix, by building all of it (the empty matrix gives 1).
export function finiteCoxeterOrder(
  coxeter: readonly (readonly number[])[],
  cap = 1_000_000,
): number {
  if (coxeter.length === 0) {
    return 1
  }

  const complex = new ChamberComplex({
    system: {
      name: 'parabolic',
      kind: 'chamber',
      symbol: [],
      coxeter,
      cellGenerators: [],
    },
    tiles: false,
  })

  while (complex.growShell() > 0) {
    if (complex.chamberCount > cap) {
      throw new Error(`chamber-tiling: a parabolic subgroup is not finite under ${cap} chambers`)
    }
  }

  return complex.chamberCount
}

// One lazily grown complex per system, kept for later and larger asks.
const complexes = new Map<string, ChamberComplex>()

export function chamberComplex(system: CoxeterSystem): ChamberComplex {
  let complex = complexes.get(system.name)

  if (!complex) {
    complex = new ChamberComplex({ system })
    complexes.set(system.name, complex)
  }

  return complex
}

// The exact tile ball of radius `radius` of the regular tiling `symbol`, from the shared lazy complex of its cheapest
// system (or of the system `kind` names).
export function exactTileBall(input: {
  symbol: readonly number[]
  radius: number
  maxCells?: number
  kind?: SystemKind
}): TileBall {
  const system = input.kind
    ? tilingSystem(input.symbol, input.kind)
    : bestSystem(input.symbol)

  if (!system) {
    throw new Error(`chamber-tiling: no ${input.kind} system for ${symbolKey(input.symbol)}`)
  }

  return chamberComplex(system).tileBall({
    radius: input.radius,
    ...(input.maxCells === undefined ? {} : { maxCells: input.maxCells }),
  })
}

// Drop the cached complexes (their memory) once a caller is done.
export function clearChamberComplexes(): void {
  complexes.clear()
}
