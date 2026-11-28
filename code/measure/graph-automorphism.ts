// The exact order of a graph's automorphism group, by individualization and refinement (the method of McKay's nauty,
// written small): item vibe-computation-models-0052, so a symmetry confound can be read beside a curvature comparison.
//
// |Aut(G)| = product over a base b_0, b_1, ... of the orbit size of b_i under the pointwise stabilizer of b_0 .. b_(i-1).
// The orbit of b_i is found by testing each candidate image w (a vertex of b_i's cell in the refined partition with
// b_0 .. b_(i-1) individualized) for an automorphism that fixes the prefix and sends b_i to w. A test individualizes b_i
// on one side and w on the other, refines both colourings together (colour refinement with a shared signature table,
// failing the moment the two colour histograms differ), and, until the colouring is discrete, individualizes one more
// vertex of the smallest non-singleton cell against each vertex of the same cell on the other side, recursively. A
// discrete pair of colourings is one bijection, re-checked edge by edge. Candidates already reached by automorphisms
// found at the level are skipped. The base stops once the prefix-individualized partition is discrete (the stabilizer is
// then trivial). Exact integers; the order is a bigint, or null when the refinement budget runs out (never a guess).

export type Neighbors = readonly (readonly number[])[]

export type AutomorphismCount = {
  readonly order: bigint | null
  // the base points with an orbit larger than one, and their orbit sizes
  readonly levels: readonly { readonly base: number; readonly orbit: number }[]
  readonly generators: number
  // colour refinements spent
  readonly refinements: number
}

const AUTOMORPHISM_BUDGET = 200_000

export function automorphismOrder(input: { neighbors: Neighbors; budget?: number }): AutomorphismCount {
  const rows = input.neighbors.map((row, x) => [...new Set(row)].filter(y => y !== x))
  const n = rows.length
  const budget = input.budget ?? AUTOMORPHISM_BUDGET
  const adjacency = rows.map(row => new Set(row))

  for (let a = 0; a < n; a++) {
    for (const b of rows[a]!) {
      if (!adjacency[b]!.has(a)) {
        throw new Error('graph-automorphism: the graph is not symmetric')
      }
    }
  }

  let refinements = 0

  // Refine two colourings together to their coarsest equitable refinement. A vertex's signature is its colour and the
  // sorted colours of its neighbours; equal signatures on either side get one new colour. False the moment the two
  // sides' colour histograms differ (no colour-preserving bijection can exist). Colours come out as 0 .. k-1.
  const refinePair = (left: Int32Array, right: Int32Array): boolean => {
    refinements++

    let classes = -1

    for (;;) {
      const table = new Map<string, number>()
      const nextLeft = new Int32Array(n)
      const nextRight = new Int32Array(n)

      const signature = (colour: Int32Array, v: number): string => {
        const around = rows[v]!.map(u => colour[u]!).sort((a, b) => a - b)

        return `${colour[v]}:${around.join(',')}`
      }

      for (let v = 0; v < n; v++) {
        const key = signature(left, v)

        let id = table.get(key)

        if (id === undefined) {
          id = table.size
          table.set(key, id)
        }

        nextLeft[v] = id
      }

      for (let v = 0; v < n; v++) {
        const id = table.get(signature(right, v))

        if (id === undefined) {
          return false
        }

        nextRight[v] = id
      }

      const count = new Int32Array(table.size)

      for (let v = 0; v < n; v++) {
        count[nextLeft[v]!]!++
        count[nextRight[v]!]!--
      }

      if (count.some(c => c !== 0)) {
        return false
      }

      left.set(nextLeft)
      right.set(nextRight)

      if (table.size === classes) {
        return true
      }

      classes = table.size
    }
  }

  const isAutomorphism = (g: Int32Array): boolean => {
    const seen = new Uint8Array(n)

    for (let x = 0; x < n; x++) {
      if (g[x]! < 0 || seen[g[x]!]) {
        return false
      }

      seen[g[x]!] = 1

      for (const y of rows[x]!) {
        if (!adjacency[g[x]!]!.has(g[y]!)) {
          return false
        }
      }
    }

    return true
  }

  const classCount = (colour: Int32Array): number => new Set(colour).size

  // A colour-preserving automorphism between two refined colourings, or null; 'budget' when the budget runs out.
  // Colours are 0 .. k-1 after a refinement, so n is free for a fresh individualized colour.
  const search = (left: Int32Array, right: Int32Array): Int32Array | null | 'budget' => {
    if (refinements > budget) {
      return 'budget'
    }

    if (classCount(left) === n) {
      const at = new Int32Array(n)

      for (let x = 0; x < n; x++) {
        at[right[x]!] = x
      }

      const g = Int32Array.from(left, c => at[c]!)

      return isAutomorphism(g) ? g : null
    }

    // the smallest non-singleton cell (lowest colour on ties); v its first vertex on the left
    const size = new Int32Array(n)

    for (let x = 0; x < n; x++) {
      size[left[x]!]!++
    }

    let target = -1

    for (let c = 0; c < n; c++) {
      if (size[c]! > 1 && (target < 0 || size[c]! < size[target]!)) {
        target = c
      }
    }

    const v = left.indexOf(target)

    for (let x = 0; x < n; x++) {
      if (right[x] !== target) {
        continue
      }

      const l = Int32Array.from(left)
      const r = Int32Array.from(right)

      l[v] = n
      r[x] = n

      if (!refinePair(l, r)) {
        continue
      }

      const found = search(l, r)

      if (found !== null) {
        return found
      }
    }

    return null
  }

  // the base: breadth-first order from vertex 0 over every component
  const order: number[] = []
  const seen = new Uint8Array(n)

  for (let s = 0; s < n; s++) {
    if (seen[s]) {
      continue
    }

    seen[s] = 1
    order.push(s)

    for (let head = order.length - 1; head < order.length; head++) {
      for (const y of rows[order[head]!]!) {
        if (!seen[y]) {
          seen[y] = 1
          order.push(y)
        }
      }
    }
  }

  // the partition with the prefix individualized, starting from the degrees
  const prefix = Int32Array.from(rows, row => row.length)

  refinePair(prefix, Int32Array.from(prefix))

  const levels: { base: number; orbit: number }[] = []

  let total = 1n
  let generators = 0

  for (const b of order) {
    if (classCount(prefix) === n) {
      break
    }

    const cell: number[] = []

    for (let x = 0; x < n; x++) {
      if (prefix[x] === prefix[b]) {
        cell.push(x)
      }
    }

    if (cell.length > 1) {
      const gens: Int32Array[] = []
      const inOrbit = new Uint8Array(n)
      const orbit = [b]

      inOrbit[b] = 1

      for (const w of cell) {
        if (inOrbit[w]) {
          continue
        }

        const l = Int32Array.from(prefix)
        const r = Int32Array.from(prefix)

        l[b] = n
        r[w] = n

        const g = refinePair(l, r) ? search(l, r) : null

        if (g === 'budget') {
          return { order: null, levels, generators, refinements }
        }

        if (g === null) {
          continue
        }

        gens.push(g)
        generators++

        // close the orbit of b under every automorphism found at this level (for-of visits the appended points too)
        for (const point of orbit) {
          for (const h of gens) {
            const y = h[point]!

            if (!inOrbit[y]) {
              inOrbit[y] = 1
              orbit.push(y)
            }
          }
        }
      }

      if (orbit.length > 1) {
        levels.push({ base: b, orbit: orbit.length })
        total *= BigInt(orbit.length)
      }
    }

    // individualize b in the prefix partition
    prefix[b] = n
    refinePair(prefix, Int32Array.from(prefix))
  }

  return { order: total, levels, generators, refinements }
}
