// A LAZY EXACT tiling for every regular tiling whose tile is a right-angled Coxeter polytope: the tiles are the elements
// of a right-angled Coxeter group W (every m_ij is 2 or infinite: {5,4}, {6,4}, the right-angled 24-cell {3,4,3,4}),
// created one at a time as a caller asks for a neighbour, never a ball at a time (item vibe-computation-models-0028).
// No coordinates and no floating point: a tile is a canonical normal form, built from the Coxeter matrix alone.
//
// THE NORMAL FORM. In a right-angled Coxeter group two reduced words name the same element exactly when one turns into
// the other by swapping adjacent commuting letters (Tits: every braid move is a commutation when m_ij = 2), so an
// element is a reduced TRACE, and its Foata normal form is canonical: the word cut into steps F_1 .. F_k, each step a
// set of pairwise commuting letters, every letter of F_(j+1) blocked (not commuting, or equal) by some letter of F_j.
// Right multiplication by a generator s reads the steps from the end:
//
//   walk back over the steps that commute with s (no letter of the step blocks s) to the last step F_i that blocks s.
//   - F_i holds s: s is a right descent (it can be moved to the end), so ws is w with that s deleted. The steps after
//     F_i commute with s, so none of their letters was blocked only by s, and the form stays Foata.
//   - F_i blocks s without holding it: ws is longer, and s joins F_(i+1) (a new last step when i = k). The steps after
//     F_i commute with s and none holds s, so F_(i+1) + s is still a set of commuting letters.
//   - no step blocks s: s joins F_1.
//
// The word length of the element is the number of letters, and since the tile's own reflection group is the group (J
// empty, chamber-tiling.ts 'tile' system) the word length IS the facet distance from the origin tile.
//
// STORAGE. A form is a chain of step nodes linked from its LAST step, hash-consed by (previous node, step mask): two
// elements are equal exactly when their last nodes are the same integer, so a tile id is a node id. A multiplication
// rebuilds only the steps it walked back over, so memory per new tile is a few nodes, bounded by the tiles a run
// touches. Node ids depend on the order tiles were asked for; `compare` gives a canonical order (length first, then the
// step masks read from the end) that does not.

export class RightAngledTiling {
  readonly rank: number
  readonly coxeter: readonly (readonly number[])[]
  // blocker[g]: the generators that do NOT commute with g, g itself included, as a bit mask
  readonly blocker: Int32Array
  private prevOf: Int32Array
  private maskOf: Int32Array
  private lengthOf: Int32Array
  private neighborOf: Int32Array
  private readonly index = new Map<number, number>()
  count = 1
  // multiplications computed (cache misses) and step nodes walked back over, for the light-cone accounting
  multiplications = 0
  walked = 0

  constructor(coxeter: readonly (readonly number[])[]) {
    const rank = coxeter.length

    if (rank < 1 || rank > 30) {
      throw new Error('right-angled-tiling: the rank must be 1..30 (a step is a 32-bit mask)')
    }

    this.rank = rank
    this.coxeter = coxeter.map(row => [...row])
    this.blocker = new Int32Array(rank)

    coxeter.forEach((row, i) => {
      if (row.length !== rank) {
        throw new Error('right-angled-tiling: the Coxeter matrix is not square')
      }

      row.forEach((m, j) => {
        if (coxeter[j]![i] !== m) {
          throw new Error('right-angled-tiling: the Coxeter matrix is not symmetric')
        }

        if (i === j) {
          if (m !== 1) {
            throw new Error('right-angled-tiling: the diagonal must be 1')
          }

          this.blocker[i] = this.blocker[i]! | (1 << j)
        } else if (m === Number.POSITIVE_INFINITY) {
          this.blocker[i] = this.blocker[i]! | (1 << j)
        } else if (m !== 2) {
          throw new Error(`right-angled-tiling: m(${i},${j}) = ${m} is not right-angled`)
        }
      })
    })

    const capacity = 1024

    this.prevOf = new Int32Array(capacity).fill(-1)
    this.maskOf = new Int32Array(capacity)
    this.lengthOf = new Int32Array(capacity)
    this.neighborOf = new Int32Array(capacity * rank).fill(-1)
  }

  // the word length of a tile, its facet distance from the origin tile (node 0, the identity)
  length(tile: number): number {
    return this.lengthOf[tile]!
  }

  // the tile across facet g of `tile`: the element tile * s_g
  neighbor(tile: number, g: number): number {
    const slot = tile * this.rank + g
    const cached = this.neighborOf[slot]!

    if (cached >= 0) {
      return cached
    }

    const out = this.multiply(tile, g)

    this.neighborOf[tile * this.rank + g] = out
    this.neighborOf[out * this.rank + g] = tile

    return out
  }

  // the steps of a tile's Foata form as masks, first step first
  steps(tile: number): number[] {
    const out: number[] = []

    for (let n = tile; n !== 0; n = this.prevOf[n]!) {
      out.push(this.maskOf[n]!)
    }

    return out.reverse()
  }

  // one reduced word of a tile (each step's letters in increasing order)
  word(tile: number): number[] {
    const out: number[] = []

    for (const m of this.steps(tile)) {
      for (let g = 0; g < this.rank; g++) {
        if (m & (1 << g)) {
          out.push(g)
        }
      }
    }

    return out
  }

  // the tile a word names, read from the identity
  fromWord(word: readonly number[]): number {
    let t = 0

    for (const g of word) {
      t = this.neighbor(t, g)
    }

    return t
  }

  // a canonical total order: length, then the step masks compared from the last step back
  compare(a: number, b: number): number {
    if (a === b) {
      return 0
    }

    const d = this.lengthOf[a]! - this.lengthOf[b]!

    if (d !== 0) {
      return d
    }

    let x = a
    let y = b

    while (x !== y) {
      const mx = this.maskOf[x]! >>> 0
      const my = this.maskOf[y]! >>> 0

      if (mx !== my) {
        return mx < my ? -1 : 1
      }

      x = this.prevOf[x]!
      y = this.prevOf[y]!
    }

    // equal lengths, equal masks from the end, and the chains met: unreachable for a ≠ b (the nodes are hash-consed)
    throw new Error('right-angled-tiling: two different nodes compare equal')
  }

  private multiply(w: number, s: number): number {
    const bit = 1 << s
    const block = this.blocker[s]!
    const walkedSteps: number[] = []

    this.multiplications++

    let node = w

    while (node !== 0 && (this.maskOf[node]! & block) === 0) {
      walkedSteps.push(this.maskOf[node]!)
      node = this.prevOf[node]!
    }

    this.walked += walkedSteps.length

    let base: number

    if (node === 0) {
      // no step blocks s: it joins the first step
      base =
        walkedSteps.length === 0
          ? this.intern(0, bit)
          : this.intern(0, walkedSteps.pop()! | bit)
    } else if (this.maskOf[node]! & bit) {
      // a right descent: delete s from its step
      const rest = this.maskOf[node]! & ~bit

      if (rest === 0 && walkedSteps.length > 0) {
        throw new Error('right-angled-tiling: a step after a lone descent was left unblocked')
      }

      base = rest === 0 ? this.prevOf[node]! : this.intern(this.prevOf[node]!, rest)
    } else {
      base =
        walkedSteps.length === 0
          ? this.intern(node, bit)
          : this.intern(node, walkedSteps.pop()! | bit)
    }

    while (walkedSteps.length > 0) {
      base = this.intern(base, walkedSteps.pop()!)
    }

    return base
  }

  private intern(prev: number, mask: number): number {
    const key = prev * 2 ** this.rank + (mask >>> 0)
    const found = this.index.get(key)

    if (found !== undefined) {
      return found
    }

    const id = this.count

    if (id >= this.prevOf.length) {
      const size = this.prevOf.length * 2

      this.prevOf = grow(this.prevOf, size, -1)
      this.maskOf = grow(this.maskOf, size, 0)
      this.lengthOf = grow(this.lengthOf, size, 0)
      this.neighborOf = grow(this.neighborOf, size * this.rank, -1)
    }

    this.prevOf[id] = prev
    this.maskOf[id] = mask
    this.lengthOf[id] = this.lengthOf[prev]! + popcount(mask)
    this.index.set(key, id)
    this.count++

    return id
  }
}

function popcount(x: number): number {
  let v = x >>> 0
  let n = 0

  while (v !== 0) {
    v &= v - 1
    n++
  }

  return n
}

function grow(a: Int32Array, size: number, fill: number): Int32Array {
  const out = new Int32Array(size).fill(fill)

  out.set(a)

  return out
}

// The word length of the element a word names, by the same Foata reduction on a plain array of steps (no nodes are
// stored), so a distance between two far tiles costs no memory.
export function reducedLength(blocker: Int32Array, word: readonly number[]): number {
  const steps: number[] = []

  let length = 0

  for (const s of word) {
    const bit = 1 << s
    const block = blocker[s]!

    let i = steps.length - 1

    while (i >= 0 && (steps[i]! & block) === 0) {
      i--
    }

    if (i >= 0 && steps[i]! & bit) {
      steps[i] = steps[i]! & ~bit
      length--

      if (steps[i] === 0) {
        steps.splice(i, 1)
      }
    } else {
      if (i + 1 < steps.length) {
        steps[i + 1] = steps[i + 1]! | bit
      } else {
        steps.push(bit)
      }

      length++
    }
  }

  return length
}

// The growth series of a right-angled Coxeter group, shell sizes |S(n)| for n = 0..count - 1, exact. Steinberg's
// formula for a right-angled group sums over the cliques T of commuting generators (the finite parabolics, (Z/2)^|T|):
// 1 / W(t) = sum over T of (-t / (1 + t))^|T|. With n the largest clique, P(t) = (1 + t)^n / W(t) = sum over T of
// (-t)^|T| (1 + t)^(n - |T|) is a polynomial with P(0) = 1, so W = (1 + t)^n / P gives a linear recurrence with bigint
// coefficients: no division, nothing rounded.
export function rightAngledGrowth(
  coxeter: readonly (readonly number[])[],
  count: number,
): bigint[] {
  const rank = coxeter.length
  const bySize: number[] = []

  const visit = (clique: number[], next: number): void => {
    bySize[clique.length] = (bySize[clique.length] ?? 0) + 1

    for (let g = next; g < rank; g++) {
      if (clique.every(h => coxeter[h]![g] === 2)) {
        clique.push(g)
        visit(clique, g + 1)
        clique.pop()
      }
    }
  }

  visit([], 0)

  const n = bySize.length - 1

  const binomial = (a: number, b: number): bigint => {
    if (b < 0 || b > a) {
      return 0n
    }

    let out = 1n

    for (let i = 0; i < b; i++) {
      out = (out * BigInt(a - i)) / BigInt(i + 1)
    }

    return out
  }

  const p: bigint[] = new Array<bigint>(n + 1).fill(0n)

  bySize.forEach((c, k) => {
    for (let j = 0; j <= n - k; j++) {
      const sign = k % 2 === 0 ? 1n : -1n

      p[k + j] = p[k + j]! + sign * BigInt(c) * binomial(n - k, j)
    }
  })

  if (p[0] !== 1n) {
    throw new Error('right-angled-tiling: the growth denominator does not start at 1')
  }

  const out: bigint[] = []

  for (let k = 0; k < count; k++) {
    let v = binomial(n, k)

    for (let i = 1; i <= n && i <= k; i++) {
      v -= p[i]! * out[k - i]!
    }

    out.push(v)
  }

  return out
}
