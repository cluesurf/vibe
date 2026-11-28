// A LAZY EXACT tiling for every regular tiling {p,q}, right-angled or not: the tiles are the cosets w W_J of the cell
// subgroup W_J = <s_0, s_1> (the dihedral group of the p-gon, order 2p) in the triangle group
// W = <s_0, s_1, s_2 | (s_0 s_1)^p, (s_1 s_2)^q, (s_0 s_2)^2>, created one at a time as a caller asks for a neighbour
// It covers {7,3}, {8,3}, {4,5}, {3,7}, where q is odd and no tile group acts
// simply transitively on the tiles (so the Foata forms of right-angled-tiling.ts do not apply), and every other {p,q}.
//
// ELEMENTS. A group element w is its matrix in the geometric (Tits) representation on the root basis: column j is
// w(alpha_j), with entries in Z[2cos(pi/m)] (cosine-ring.ts), integer coefficients, nothing rounded. Right
// multiplication by s_s is a column operation: w s(alpha_j) = w(alpha_j) + 2cos(pi/m_sj) w(alpha_s), w s(alpha_s) =
// -w(alpha_s). s is a right descent of w (l(w s) < l(w)) exactly when w(alpha_s) is a negative root (Tits), decided by
// the certified sign of one nonzero coordinate (every coordinate of a root has the same sign).
//
// TILES. A coset holds one shortest element, its minimal representative w_T, the element with no right descent in J.
// Stripping J-descents from any element (w := w s while s in J is a right descent) ends at w_T, and the matrix of w_T is
// the tile's canonical name. The frame of a tile is w_T applied to the origin tile's frame: edge k of the tile is the
// panel s_2 of the chambers w_T rho^k and w_T rho^k s_0 (rho = s_0 s_1, k = 0..p-1, in cyclic order around the tile),
// so neighbour k is the coset of w_T rho^k s_2.
//
// DISTANCE (proven here, checked by the experiment). The facet distance from the origin tile to T is the least number
// of s_2 letters in a reduced word of w_T. Proof by folding: a tile path from W_J to T is a gallery of chambers from 1
// to a chamber of T whose cost is its s_2 steps (steps inside a tile are free). Take a cheapest gallery, and among those
// one with fewest steps. Folding along a root alpha (chambers outside alpha reflected in), which sends steps to steps of
// the same type or to stutters, (a) removes any wall crossed twice (fold the part before the last crossing), so the
// gallery is minimal, a reduced word, and (b) removes any last stretch across a wall of T's own stabilizer (fold the
// tail, s_alpha keeps T), so it ends at w_T. Then, since w_T has no right descent in J, its only right descent is s_2,
// and the least s_2 count of any element x equals the distance of x's tile (a reduced word of w_T followed by one of
// the J part is reduced). Hence
//
//   d(T) = 1 + d(T'), T' the tile of w_T s_2,
//
// a canonical PARENT, one facet away. The distance of any chamber x's tile is therefore the number of s_2 letters
// removed when x is reduced to 1 by stripping J-descents first, then s_2. The parent chain is the tile's address
// (the edge of each parent it leaves by) and gives a canonical order: distance, then the parents', then the edge.
//
// STORAGE. Per tile: the matrix, distance, chamber length of w_T, parent, the parent edge (and the J element u with
// w_T s_2 = w_parent u), and the p neighbour slots once asked. Lookups go through a map from the matrix to the tile.

import { CosineRing, addTimes, cosineRing, ringSign } from '@/code/substrate/coxeter/cosine-ring'

const RANK = 3

// A J element rho^r s_0^f (rho = s_0 s_1).
export type Dihedral = { r: number; f: number }

export class CosetTiling {
  readonly p: number
  readonly q: number
  readonly coxeter: readonly (readonly number[])[]
  readonly ring: CosineRing
  // coefficients per matrix
  readonly width: number
  private readonly matrices: bigint[][] = []
  private readonly distanceOf: number[] = []
  private readonly lengthOf: number[] = []
  private readonly parentOf: number[] = []
  private readonly edgeOf: number[] = []
  private readonly flipOf: number[] = []
  private neighborOf: Int32Array
  private readonly index = new Map<string, number>()
  // sign tests and matrix multiplications, for the cost accounting
  signTests = 0
  multiplications = 0

  constructor(input: { p: number; q: number; coxeter?: readonly (readonly number[])[] }) {
    const { p, q } = input

    if (!Number.isInteger(p) || !Number.isInteger(q) || p < 3 || q < 3) {
      throw new Error(`coset-tiling: {${p},${q}} is not a tiling symbol`)
    }

    this.p = p
    this.q = q
    // a caller may pass another matrix only to build a negative control
    this.coxeter = (
      input.coxeter ?? [
        [1, p, 2],
        [p, 1, q],
        [2, q, 1],
      ]
    ).map(row => [...row])

    if (this.coxeter[0]![1] !== p) {
      throw new Error('coset-tiling: m(s_0, s_1) must be p (the frame walks rho = s_0 s_1)')
    }

    this.ring = cosineRing(this.coxeter.flat().filter(m => m >= 2))
    this.width = RANK * RANK * this.ring.size
    this.neighborOf = new Int32Array(1024 * p).fill(-1)

    const identity = new Array<bigint>(this.width).fill(0n)

    for (let i = 0; i < RANK; i++) {
      identity[this.at(i, i)] = 1n
    }

    this.register(identity, { parent: -1, edge: -1, flip: 0, distance: 0, length: 0 })
  }

  get count(): number {
    return this.matrices.length
  }

  distance(tile: number): number {
    return this.distanceOf[tile]!
  }

  // the word length of the tile's minimal representative
  chamberLength(tile: number): number {
    return this.lengthOf[tile]!
  }

  parent(tile: number): number {
    return this.parentOf[tile]!
  }

  parentEdge(tile: number): number {
    return this.edgeOf[tile]!
  }

  matrix(tile: number): readonly bigint[] {
    return this.matrices[tile]!
  }

  // the tile across edge k of `tile`
  neighbor(tile: number, k: number): number {
    const slot = tile * this.p + k
    const cached = this.neighborOf[slot]!

    if (cached >= 0) {
      return cached
    }

    const m = [...this.matrices[tile]!]

    this.rotate(m, k)
    this.rightMultiply(m, 2)

    const { tile: across, u } = this.tileOf(m)
    const back = across * this.p + u.r
    const seen = this.neighborOf[back]!

    if (seen >= 0 && seen !== tile) {
      throw new Error('coset-tiling: an edge leads back to a different tile')
    }

    this.neighborOf[tile * this.p + k] = across
    this.neighborOf[across * this.p + u.r] = tile

    return across
  }

  // the edge indices from the origin down to `tile`, through its parents
  address(tile: number): number[] {
    const out: number[] = []

    for (let t = tile; t !== 0; t = this.parentOf[t]!) {
      out.push(this.edgeOf[t]!)
    }

    return out.reverse()
  }

  fromAddress(edges: readonly number[]): number {
    let t = 0

    for (const k of edges) {
      t = this.neighbor(t, k)
    }

    return t
  }

  // canonical order: distance, then the parents' order, then the parent edge
  compare(a: number, b: number): number {
    if (a === b) {
      return 0
    }

    const d = this.distanceOf[a]! - this.distanceOf[b]!

    if (d !== 0) {
      return d
    }

    let x = a
    let y = b

    for (;;) {
      const px = this.parentOf[x]!
      const py = this.parentOf[y]!

      if (px === py) {
        const e = this.edgeOf[x]! - this.edgeOf[y]!

        if (e === 0) {
          throw new Error('coset-tiling: two tiles share a parent and an edge')
        }

        return e
      }

      x = px
      y = py
    }
  }

  // a word (not always reduced) for the tile's minimal representative
  word(tile: number): number[] {
    const out: number[] = []
    const chain: number[] = []

    for (let t = tile; t !== 0; t = this.parentOf[t]!) {
      chain.push(t)
    }

    for (const t of chain.reverse()) {
      out.push(...this.dihedralWord({ r: this.edgeOf[t]!, f: this.flipOf[t]! }), 2)
    }

    return out
  }

  // facet distance between two tiles: the distance of the tile of w_a^-1 w_b from the origin
  distanceBetween(a: number, b: number): number {
    if (a === b) {
      return 0
    }

    if (a === 0) {
      return this.distanceOf[b]!
    }

    const x = [...this.matrices[b]!]

    for (const s of this.word(a)) {
      this.leftMultiply(x, s)
    }

    return this.chamberDistance(x)
  }

  // the distance of the tile holding the chamber with matrix x (x is consumed)
  chamberDistance(x: bigint[]): number {
    let count = 0

    for (;;) {
      if (this.descent(x, 0)) {
        this.rightMultiply(x, 0)
      } else if (this.descent(x, 1)) {
        this.rightMultiply(x, 1)
      } else if (this.descent(x, 2)) {
        this.rightMultiply(x, 2)
        count++
      } else {
        return count
      }
    }
  }

  // the tile of an element (its matrix is consumed) and the J element u with element = w_T u
  tileOf(m: bigint[]): { tile: number; u: Dihedral } {
    const { u } = this.strip(m)

    return { tile: this.tileOfMinimal(m), u }
  }

  // ---- representation ----

  private at(row: number, col: number): number {
    return (row * RANK + col) * this.ring.size
  }

  rightMultiply(m: bigint[], s: number): void {
    this.multiplications++

    for (let j = 0; j < RANK; j++) {
      if (j !== s) {
        const mm = this.coxeter[s]![j]!

        for (let i = 0; i < RANK; i++) {
          addTimes(this.ring, mm, m, this.at(i, j), m, this.at(i, s))
        }
      }
    }

    for (let i = 0; i < RANK; i++) {
      const o = this.at(i, s)

      for (let c = 0; c < this.ring.size; c++) {
        m[o + c] = -m[o + c]!
      }
    }
  }

  leftMultiply(m: bigint[], s: number): void {
    this.multiplications++

    for (let col = 0; col < RANK; col++) {
      const o = this.at(s, col)

      for (let c = 0; c < this.ring.size; c++) {
        m[o + c] = -m[o + c]!
      }

      for (let j = 0; j < RANK; j++) {
        if (j !== s) {
          addTimes(this.ring, this.coxeter[s]![j]!, m, o, m, this.at(j, col))
        }
      }
    }
  }

  // whether s is a right descent: w(alpha_s) is a negative root
  descent(m: readonly bigint[], s: number): boolean {
    for (let i = 0; i < RANK; i++) {
      this.signTests++

      const sign = ringSign(this.ring, m, this.at(i, s))

      if (sign !== 0) {
        return sign < 0
      }
    }

    throw new Error('coset-tiling: a column of the representation is zero')
  }

  // ---- tiles ----

  private dihedralWord(u: Dihedral): number[] {
    const out: number[] = []
    const { p } = this

    if (u.r <= p - u.r) {
      for (let i = 0; i < u.r; i++) {
        out.push(0, 1)
      }
    } else {
      for (let i = 0; i < p - u.r; i++) {
        out.push(1, 0)
      }
    }

    if (u.f) {
      out.push(0)
    }

    return out
  }

  // m := m rho^k, by the shorter of (s_0 s_1)^k and (s_1 s_0)^(p - k)
  private rotate(m: bigint[], k: number): void {
    for (const s of this.dihedralWord({ r: k, f: 0 })) {
      this.rightMultiply(m, s)
    }
  }

  // strip J-descents in place; returns u with (original) = (stripped) u and the letters stripped
  private strip(m: bigint[]): { u: Dihedral; stripped: number } {
    let u: Dihedral = { r: 0, f: 0 }
    let stripped = 0

    for (;;) {
      let s = -1

      if (this.descent(m, 0)) {
        s = 0
      } else if (this.descent(m, 1)) {
        s = 1
      }

      if (s < 0) {
        return { u, stripped }
      }

      this.rightMultiply(m, s)
      stripped++
      // the original is (stripped so far) s u_old... read right to left: new u = s u
      u = this.compose(this.letter(s), u)
    }
  }

  private letter(s: number): Dihedral {
    return s === 0 ? { r: 0, f: 1 } : { r: this.p - 1, f: 1 }
  }

  // (rho^a s0^f)(rho^b s0^g) = rho^(a + (-1)^f b) s0^(f + g)
  private compose(x: Dihedral, y: Dihedral): Dihedral {
    const r = (((x.r + (x.f ? -y.r : y.r)) % this.p) + this.p) % this.p

    return { r, f: x.f ^ y.f }
  }

  private key(m: readonly bigint[]): string {
    return m.join(',')
  }

  // the tile whose minimal representative has matrix m (m is kept as the tile's matrix when new)
  private tileOfMinimal(m: bigint[]): number {
    const key = this.key(m)
    const found = this.index.get(key)

    if (found !== undefined) {
      return found
    }

    if (!this.descent(m, 2)) {
      throw new Error('coset-tiling: a minimal representative other than 1 has no s_2 descent')
    }

    const up = [...m]

    this.rightMultiply(up, 2)

    const { u, stripped } = this.strip(up)
    const parent = this.tileOfMinimal(up)

    return this.register(m, {
      parent,
      edge: u.r,
      flip: u.f,
      distance: this.distanceOf[parent]! + 1,
      length: this.lengthOf[parent]! + stripped + 1,
    })
  }

  private register(
    m: bigint[],
    input: { parent: number; edge: number; flip: number; distance: number; length: number },
  ): number {
    const id = this.matrices.length

    this.matrices.push(m)
    this.parentOf.push(input.parent)
    this.edgeOf.push(input.edge)
    this.flipOf.push(input.flip)
    this.distanceOf.push(input.distance)
    this.lengthOf.push(input.length)
    this.index.set(this.key(m), id)

    if ((id + 1) * this.p > this.neighborOf.length) {
      const out = new Int32Array(this.neighborOf.length * 2).fill(-1)

      out.set(this.neighborOf)
      this.neighborOf = out
    }

    return id
  }
}
