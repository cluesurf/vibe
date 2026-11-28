// Whether two balls (cell graphs with a marked origin, cell 0) are isomorphic by a map sending origin to origin, PROVEN
// by the map returned: a bijection under which every edge of one ball is an edge of the other, with equal edge counts.
// How a candidate map is found does not matter to the proof, only how fast it is found, and both finders here are
// linear once a small choice at the origin is made:
//
// - rotationIsomorphism, for 2D balls with a rotation system (each cell's neighbours in cyclic order, one orientation
//   for all): the map is fixed by the image of one origin neighbour and an orientation, so the 2 p choices are each
//   propagated breadth-first, cyclic order to cyclic order.
// - labeledIsomorphism, for balls whose cells carry slot labels (a neighbour table, cell x slot): the map follows
//   slot a of a cell to slot relabel(a, depth) of its image, breadth-first. A refined search (colour refinement,
//   extension by common neighbours) was tried first and is not used: hyperbolic balls are tree-like, so refinement
//   leaves every pair of mirror-image siblings unresolved and the search depth grows with the ball.
//
// Used to check that the exact tile balls (chamber-tiling.ts) equal the float-built ones (buildCellGraph) wherever both
// exist, and the right-angled 24-cell group against exact-3434.ts.

import { mobiusAdd, negate } from '@/code/render/geometry/isometry'

export type BallIsomorphism = {
  readonly verdict: 'isomorphic' | 'different'
  // mapping[a] = the cell of the second ball that cell a of the first goes to (when isomorphic)
  readonly mapping: Int32Array | null
  readonly branches: number
  readonly reason: string
}

type Adjacency = readonly (readonly number[])[]

// A rotation system for a REFERENCE ball built in floating point (buildCellGraph), from its Poincare disk positions:
// each cell's neighbours sorted counterclockwise as seen from the cell, after the Mobius translation that takes the
// cell to the center. Floats only order a reference graph's neighbours here; rotationIsomorphism verifies any map it
// finds edge by edge, so a misordered row can only make a check fail, never pass.
export function rotationFromPositions(
  positions: readonly (readonly number[])[],
  neighbors: Adjacency,
): number[][] {
  return neighbors.map((row, u) => {
    const here = negate([...positions[u]!])

    return row
      .map(v => {
        const local = mobiusAdd(here, [...positions[v]!])

        return { v, angle: Math.atan2(local[1] ?? 0, local[0] ?? 0) }
      })
      .sort((x, y) => x.angle - y.angle)
      .map(x => x.v)
  })
}

// Whether two 2D balls are isomorphic, using their ROTATION SYSTEMS: rotation[u] lists u's neighbours in cyclic order,
// the same orientation at every cell, for every cell of full degree (the interior); a boundary cell's list may be
// short and is never propagated from.
export function rotationIsomorphism(input: {
  first: Adjacency
  firstRotation: Adjacency
  second: Adjacency
  secondRotation: Adjacency
  degree: number
}): BallIsomorphism {
  const { first: a, second: b, firstRotation: ra, secondRotation: rb, degree } = input
  const n = a.length

  if (b.length !== n || countEdges(a) !== countEdges(b)) {
    return different('cell or edge counts differ')
  }

  const p = degree

  let branches = 0

  if ((ra[0]?.length ?? 0) !== p || (rb[0]?.length ?? 0) !== p) {
    return different('an origin is not of full degree')
  }

  for (let start = 0; start < p; start++) {
    for (const orient of [1, -1]) {
      branches++

      const map = new Int32Array(n).fill(-1)
      const inverse = new Int32Array(n).fill(-1)

      const set = (x: number, y: number): boolean => {
        if (map[x] === -1 && inverse[y] === -1) {
          map[x] = y
          inverse[y] = x

          return true
        }

        return map[x] === y
      }

      set(0, 0)

      const queue = [0]
      const reference = new Int32Array(n).fill(-1)

      reference[0] = ra[0]![0]!

      let ok = true

      for (let i = 0; i < queue.length && ok; i++) {
        const u = queue[i]!
        const image = map[u]!
        const rowA = ra[u]!
        const rowB = rb[image]!

        if (rowA.length !== p) {
          continue
        }

        if (rowB.length !== p) {
          ok = false
          break
        }

        const v = reference[u]!
        const k = rowA.indexOf(v)
        // the origin's first neighbour goes to its `start`-th; every other cell keeps the neighbour it was reached from
        const kb = u === 0 ? start : rowB.indexOf(map[v]!)

        if (k < 0 || kb < 0) {
          ok = false
          break
        }

        for (let j = 0; j < p && ok; j++) {
          const x = rowA[(k + j) % p]!
          const y = rowB[(((kb + orient * j) % p) + p) % p]!
          const fresh = map[x] === -1

          if (!set(x, y)) {
            ok = false
          } else if (fresh) {
            reference[x] = u
            queue.push(x)
          }
        }
      }

      if (!ok || queue.length !== n) {
        continue
      }

      if (preserves(a, b, map)) {
        return { verdict: 'isomorphic', mapping: map, branches, reason: 'rotation map verified edge by edge' }
      }
    }
  }

  return {
    verdict: 'different',
    mapping: null,
    branches,
    reason: `none of the ${2 * p} rotation maps preserves the edges`,
  }
}

// Whether two slot-labelled balls are isomorphic under a slot rule: first[c * slots + a] is the neighbour of cell c
// across slot a (-1 outside the ball), and the map sends it to second[image * slots + relabel(a, depth of c)].
export function labeledIsomorphism(input: {
  first: Int32Array
  second: Int32Array
  slots: number
  relabel: (slot: number, depth: number) => number
}): BallIsomorphism {
  const { first, second, slots: k, relabel } = input
  const n = first.length / k

  if (second.length !== first.length) {
    return different('cell counts differ')
  }

  const map = new Int32Array(n).fill(-1)
  const inverse = new Int32Array(n).fill(-1)
  const depth = new Int32Array(n).fill(-1)
  const queue = [0]

  map[0] = 0
  inverse[0] = 0
  depth[0] = 0

  // a for-of over an array that grows while it runs visits the pushed cells too, which is the BFS queue
  for (const c of queue) {
    const image = map[c]!

    for (let a = 0; a < k; a++) {
      const x = first[c * k + a]!
      const y = second[image * k + relabel(a, depth[c]!)]!

      if (x < 0 || y < 0) {
        if ((x < 0) !== (y < 0)) {
          return different(`slot ${a} of cell ${c} leaves one ball only`)
        }

        continue
      }

      if (map[x] === -1 && inverse[y] === -1) {
        map[x] = y
        inverse[y] = x
        depth[x] = depth[c]! + 1
        queue.push(x)
      } else if (map[x] !== y) {
        return different(`cell ${x} would go to two cells`)
      }
    }
  }

  const rows = (table: Int32Array): number[][] =>
    Array.from({ length: n }, (_, c) =>
      Array.from(table.subarray(c * k, c * k + k)).filter(v => v >= 0),
    )

  if (queue.length !== n || !preserves(rows(first), rows(second), map)) {
    return different('the slot map is not an edge-preserving bijection')
  }

  return { verdict: 'isomorphic', mapping: map, branches: 1, reason: 'slot map verified edge by edge' }
}

// Every bijection tau of the vertices of two small graphs with i ~ j exactly when tau i ~ tau j, in a fixed search
// order, up to `limit` of them. Used to match two labellings of one cell's facets by which pairs of facets meet.
export function graphMatches(input: {
  first: readonly (readonly boolean[])[]
  second: readonly (readonly boolean[])[]
  limit: number
}): number[][] {
  const { first, second, limit } = input
  const n = first.length
  const tau: number[] = []
  const used = new Uint8Array(n)
  const out: number[][] = []

  const extend = (): void => {
    if (out.length >= limit) {
      return
    }

    const i = tau.length

    if (i === n) {
      out.push([...tau])

      return
    }

    for (let t = 0; t < n; t++) {
      if (used[t]) {
        continue
      }

      let ok = true

      for (let j = 0; j < i && ok; j++) {
        ok = first[i]![j] === second[t]![tau[j]!]
      }

      if (ok) {
        used[t] = 1
        tau.push(t)
        extend()
        tau.pop()
        used[t] = 0
      }
    }
  }

  if (second.length === n) {
    extend()
  }

  return out
}

function different(reason: string): BallIsomorphism {
  return { verdict: 'different', mapping: null, branches: 0, reason }
}

function countEdges(g: Adjacency): number {
  let e = 0

  for (const row of g) {
    e += row.length
  }

  return e
}

function preserves(a: Adjacency, b: Adjacency, mapping: Int32Array): boolean {
  const image = new Set<number>(mapping)

  if (
    a.length !== b.length ||
    countEdges(a) !== countEdges(b) ||
    image.size !== a.length ||
    mapping.some(y => y < 0)
  ) {
    return false
  }

  const edgesB = new Set<string>()

  b.forEach((row, u) => {
    for (const v of row) {
      edgesB.add(`${u},${v}`)
    }
  })

  for (let u = 0; u < a.length; u++) {
    for (const v of a[u]!) {
      if (!edgesB.has(`${mapping[u]},${mapping[v]}`)) {
        return false
      }
    }
  }

  return true
}
