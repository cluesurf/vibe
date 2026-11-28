// A proper p-edge-coloring of the infinite tiling {p,q}, each color a perfect matching, defined LOCALLY: lifted from a
// finite quotient of the triangle group.
//
// WHY A QUOTIENT. A tile group's generators color the tile graph for free (right-angled-tiling.ts), but with q odd no
// group acts simply transitively on the tiles, and a coloring by the generators of the chamber group would need p | q
// (a map to the dihedral group sending s_2 to s_0). So the coloring is declared structure, chosen once
// on a finite quotient and pulled back.
//
// THE QUOTIENT. Reducing the integer coefficients of the geometric representation (coset-tiling.ts) modulo l is a
// ring homomorphism, so w -> (matrix of w mod l) is a homomorphism from W onto a finite group G. Tiles map to the cosets
// g H (H the image of W_J), edges to the cosets g E (E the image of <s_0, s_2>), and edge k of the tile w_T to the edge
// coset of (w_T rho^k). A candidate G is kept when rho has order exactly p (H is dihedral of order 2p), s_2 is not in H,
// E has order 4, every edge coset joins two DIFFERENT tile cosets, and every tile coset's p edge slots are p DIFFERENT
// edge cosets. A coloring of the quotient's edges in which every tile coset sees all p colors then lifts to the
// infinite tiling: the p edges of a tile get the colors of its p distinct quotient edges, and an edge gets one color
// from both ends (its two chambers lie in one edge coset). Every color class is therefore a perfect matching.
//
// THE SEARCH. Moduli l = 2, 3, 4, ... in order (a composite modulus is still a ring homomorphism), each group enumerated by breadth-first search from the identity under
// right multiplication by the generators, capped; the quotient's 1-factorization by depth-first search with the most
// constrained edge first and a step budget. No randomness: the first candidate that passes, in this fixed order, is
// the coloring.
//
// VARIANTS. The schedule is declared structure, so a label read under one coloring
// must be checked under another. Variant k is the k-th coloring in the same fixed order: every 1-factorization the
// search finds at a modulus, in search order, then the next passing modulus. Tile 0's slots always take colors 0..p-1,
// so two variants of one quotient are never one coloring with its colors renamed; and the lift is onto the quotient's
// edges, so different quotient colorings lift to different colorings of the tiling. Variant 0 is the coloring above.

import { CosetTiling } from '@/code/substrate/coxeter/coset-tiling'

const RANK = 3
// every modulus 2..64 in order: composite ones too (a flat torus mod an odd prime has an odd number of tiles, and no
// perfect matching)
const MODULI = Array.from({ length: 63 }, (_, i) => i + 2)
const GROUP_CAP = 120_000
const SEARCH_BUDGET = 2_000_000

export type LiftedColoring = {
  // the coloring's place in the search order (0 the first)
  readonly variant: number
  readonly modulus: number
  readonly groupOrder: number
  readonly quotientTiles: number
  readonly quotientEdges: number
  readonly searchSteps: number
  // candidates rejected before this one, with the reason
  readonly rejected: readonly string[]
  // slotOfColor[g * p + c]: the edge slot of color c at a tile whose representative maps to group element g
  readonly slotOfColor: Uint8Array
  readonly slotColor: Uint8Array
  readonly elementIndex: ReadonlyMap<string, number>
}

// the group element of a matrix, as its key
export function reduceKey(m: readonly bigint[], modulus: number): string {
  const l = BigInt(modulus)

  return m.map(c => (((c % l) + l) % l).toString()).join(',')
}

type Group = {
  keys: string[]
  // mul[g * RANK + s]
  mul: Int32Array
}

function enumerateGroup(tiling: CosetTiling, modulus: number): Group | null {
  const identity = new Array<bigint>(tiling.width).fill(0n)
  const size = tiling.ring.size

  for (let i = 0; i < RANK; i++) {
    identity[(i * RANK + i) * size] = 1n
  }

  const l = BigInt(modulus)
  const reduce = (m: bigint[]): bigint[] => m.map(c => ((c % l) + l) % l)
  const elements: bigint[][] = [identity]
  const index = new Map<string, number>([[identity.join(','), 0]])
  const mul: number[] = []

  for (let g = 0; g < elements.length; g++) {
    for (let s = 0; s < RANK; s++) {
      const m = [...elements[g]!]

      tiling.rightMultiply(m, s)

      const r = reduce(m)
      const key = r.join(',')

      let h = index.get(key)

      if (h === undefined) {
        if (elements.length >= GROUP_CAP) {
          return null
        }

        h = elements.length
        elements.push(r)
        index.set(key, h)
      }

      mul[g * RANK + s] = h
    }
  }

  const keys: string[] = []

  index.forEach((g, key) => {
    keys[g] = key
  })

  return { keys, mul: Int32Array.from(mul) }
}

// the coset of every element under right multiplication by the generators `gens`, numbered in element order
function cosets(group: Group, gens: readonly number[]): { of: Int32Array; count: number } {
  const n = group.keys.length
  const of = new Int32Array(n).fill(-1)

  let count = 0

  for (let g = 0; g < n; g++) {
    if (of[g]! >= 0) {
      continue
    }

    const stack = [g]

    of[g] = count

    while (stack.length > 0) {
      const x = stack.pop()!

      for (const s of gens) {
        const y = group.mul[x * RANK + s]!

        if (of[y]! < 0) {
          of[y] = count
          stack.push(y)
        }
      }
    }

    count++
  }

  return { of, count }
}

// a 1-factorization of the multigraph (edges as tile pairs, every tile of degree p), or null on the budget
// skip: how many complete factorizations to pass over first; the result says how many were still to skip when the
// search ran out (null colors), so the caller can carry the rest to the next modulus
function factorize(input: {
  tiles: number
  ends: Int32Array
  slots: Int32Array
  p: number
  skip: number
}): { colors: Int8Array | null; steps: number; skipLeft: number } | null {
  const { tiles, ends, slots, p } = input

  let skipLeft = input.skip

  const edges = ends.length / 2
  const colors = new Int8Array(edges).fill(-1)
  const used = new Int32Array(tiles)
  const full = (1 << p) - 1

  const popcount = (x: number): number => {
    let v = x
    let n = 0

    while (v) {
      v &= v - 1
      n++
    }

    return n
  }

  const free = (e: number): number => full & ~(used[ends[2 * e]!]! | used[ends[2 * e + 1]!]!)

  const set = (e: number, c: number): void => {
    colors[e] = c
    used[ends[2 * e]!] = used[ends[2 * e]!]! | (1 << c)
    used[ends[2 * e + 1]!] = used[ends[2 * e + 1]!]! | (1 << c)
  }

  const unset = (e: number, c: number): void => {
    colors[e] = -1
    used[ends[2 * e]!] = used[ends[2 * e]!]! & ~(1 << c)
    used[ends[2 * e + 1]!] = used[ends[2 * e + 1]!]! & ~(1 << c)
  }

  // symmetry: tile 0's slots take colors 0..p-1
  for (let k = 0; k < p; k++) {
    set(slots[k]!, k)
  }

  let steps = 0

  // each frame: the edge, the colors still to try
  const stack: { e: number; options: number }[] = []

  // edges in breadth-first order from tile 0, so ties go to the edge nearest the colored region
  const order: number[] = []
  const seenEdge = new Uint8Array(edges)
  const seenTile = new Uint8Array(tiles)
  const queue = [0]

  seenTile[0] = 1

  for (const t of queue) {
    for (let k = 0; k < p; k++) {
      const e = slots[t * p + k]!

      if (!seenEdge[e]) {
        seenEdge[e] = 1
        order.push(e)
      }

      const other = ends[2 * e] === t ? ends[2 * e + 1]! : ends[2 * e]!

      if (!seenTile[other]) {
        seenTile[other] = 1
        queue.push(other)
      }
    }
  }

  for (let e = 0; e < edges; e++) {
    if (!seenEdge[e]) {
      order.push(e)
    }
  }

  const pick = (): number => {
    let best = -1
    let bestCount = p + 1

    for (const e of order) {
      if (colors[e]! < 0) {
        const c = popcount(free(e))

        if (c < bestCount) {
          best = e
          bestCount = c

          if (c <= 1) {
            break
          }
        }
      }
    }

    return best
  }

  let e = pick()

  if (e < 0) {
    if (skipLeft === 0) {
      return { colors, steps, skipLeft }
    }

    return { colors: null, steps, skipLeft: skipLeft - 1 }
  }

  stack.push({ e, options: free(e) })

  while (stack.length > 0) {
    if (++steps > SEARCH_BUDGET) {
      return null
    }

    const top = stack[stack.length - 1]!

    if (colors[top.e]! >= 0) {
      unset(top.e, colors[top.e]!)
    }

    if (top.options === 0) {
      stack.pop()
      continue
    }

    const c = 31 - Math.clz32(top.options & -top.options)

    top.options &= ~(1 << c)
    set(top.e, c)
    e = pick()

    if (e < 0) {
      if (skipLeft === 0) {
        return { colors, steps, skipLeft }
      }

      // a complete factorization to pass over: keep searching from the same frame
      skipLeft--
      continue
    }

    stack.push({ e, options: free(e) })
  }

  return { colors: null, steps, skipLeft }
}

// one coloring per Coxeter matrix (the search is deterministic, so a cache changes nothing but time)
const cache = new Map<string, LiftedColoring>()

function cacheKey(tiling: CosetTiling, variant: number): string {
  return `${tiling.coxeter.map(row => row.join(',')).join(';')}#${variant}`
}

export function liftedColoring(tiling: CosetTiling, variant = 0): LiftedColoring {
  const { p } = tiling
  const rejected: string[] = []

  let skip = variant

  const hit = cache.get(cacheKey(tiling, variant))

  if (hit) {
    return hit
  }

  for (const modulus of MODULI) {
    const group = enumerateGroup(tiling, modulus)

    if (!group) {
      rejected.push(`${modulus}: over ${GROUP_CAP} elements`)
      continue
    }

    const n = group.keys.length
    const rho = (g: number): number => group.mul[group.mul[g * RANK]! * RANK + 1]!

    let order = 1

    for (let g = rho(0); g !== 0 && order <= p; g = rho(g)) {
      order++
    }

    if (order !== p) {
      rejected.push(`${modulus}: rho has order ${order}`)
      continue
    }

    const tilesOf = cosets(group, [0, 1])
    const edgesOf = cosets(group, [0, 2])

    if (n % (2 * p) !== 0 || tilesOf.count !== n / (2 * p) || edgesOf.count !== n / 4) {
      rejected.push(`${modulus}: H or E has the wrong order`)
      continue
    }

    if (tilesOf.count % 2 !== 0) {
      rejected.push(`${modulus}: ${tilesOf.count} tiles, odd, so no perfect matching`)
      continue
    }

    const ends = new Int32Array(2 * edgesOf.count).fill(-1)

    let loop = false

    for (let g = 0; g < n; g++) {
      const e = edgesOf.of[g]!

      if (ends[2 * e]! < 0) {
        ends[2 * e] = tilesOf.of[g]!
        ends[2 * e + 1] = tilesOf.of[group.mul[g * RANK + 2]!]!
        loop ||= ends[2 * e] === ends[2 * e + 1]
      }
    }

    if (loop) {
      rejected.push(`${modulus}: an edge joins a tile to itself`)
      continue
    }

    // slots of each quotient tile from its first element
    const rep = new Int32Array(tilesOf.count).fill(-1)

    for (let g = 0; g < n; g++) {
      if (rep[tilesOf.of[g]!]! < 0) {
        rep[tilesOf.of[g]!] = g
      }
    }

    const slots = new Int32Array(tilesOf.count * p)

    let glued = false

    rep.forEach((g, t) => {
      let x = g

      for (let k = 0; k < p; k++) {
        slots[t * p + k] = edgesOf.of[x]!
        x = rho(x)
      }

      glued ||= new Set(slots.subarray(t * p, t * p + p)).size !== p
    })

    if (glued) {
      rejected.push(`${modulus}: a tile meets one edge twice`)
      continue
    }

    const found = factorize({ tiles: tilesOf.count, ends, slots, p, skip })

    if (!found) {
      rejected.push(`${modulus}: no 1-factorization within ${SEARCH_BUDGET} steps`)
      continue
    }

    if (!found.colors) {
      rejected.push(`${modulus}: ${skip - found.skipLeft} factorizations passed over (variant ${variant})`)
      skip = found.skipLeft
      continue
    }

    const colors = found.colors

    const slotColor = new Uint8Array(n * p)
    const slotOfColor = new Uint8Array(n * p)

    for (let g = 0; g < n; g++) {
      let x = g
      let seen = 0

      for (let k = 0; k < p; k++) {
        const c = colors[edgesOf.of[x]!]!

        slotColor[g * p + k] = c
        slotOfColor[g * p + c] = k
        seen |= 1 << c
        x = rho(x)
      }

      if (seen !== (1 << p) - 1) {
        throw new Error('lifted-coloring: a tile coset misses a color')
      }
    }

    const out: LiftedColoring = {
      variant,
      modulus,
      groupOrder: n,
      quotientTiles: tilesOf.count,
      quotientEdges: edgesOf.count,
      searchSteps: found.steps,
      rejected,
      slotOfColor,
      slotColor,
      elementIndex: new Map(group.keys.map((k, g) => [k, g])),
    }

    cache.set(cacheKey(tiling, variant), out)

    return out
  }

  throw new Error(
    `lifted-coloring: no quotient of {${tiling.p},${tiling.q}} gave variant ${variant} (${rejected.join('; ')})`,
  )
}
