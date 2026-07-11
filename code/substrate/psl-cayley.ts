// The Cayley graph of a projective special linear group PSL(2, p) over the finite
// field F_p, a boundary-free closed hyperbolic lattice. Elements are 2x2 matrices
// [a, b, c, d] over F_p taken modulo the centre {+-I} (PSL = SL / {+-I}), the group is
// BFS-generated to closure from a generator set, and the Cayley graph joins each
// element to its neighbours across each generator. For p = 7 with the standard
// S / T generators this is PSL(2,7) (order 168, the Klein-quartic symmetry, a quotient
// of the (2,3,7) triangle group): vertex-transitive, degree 4, no boundary.

export type ProjectiveMatrix = [number, number, number, number] // [a, b, c, d] over F_p

// Multiply two 2x2 matrices modulo p.
export function projectiveMultiply(
  A: ProjectiveMatrix,
  B: ProjectiveMatrix,
  p: number,
): ProjectiveMatrix {
  const mod = (x: number): number => ((x % p) + p) % p

  return [
    mod(A[0] * B[0] + A[1] * B[2]),
    mod(A[0] * B[1] + A[1] * B[3]),
    mod(A[2] * B[0] + A[3] * B[2]),
    mod(A[2] * B[1] + A[3] * B[3]),
  ]
}

// The canonical PSL representative key of a matrix: choose between M and -M the one
// whose first nonzero entry is <= p/2 (here <= 3 for p = 7), so M and -M collapse to
// one element.
export function projectiveCanonicalKey(
  M: ProjectiveMatrix,
  p: number,
): string {
  const mod = (x: number): number => ((x % p) + p) % p
  const neg: ProjectiveMatrix = [
    mod(-M[0]),
    mod(-M[1]),
    mod(-M[2]),
    mod(-M[3]),
  ]

  const lead = (m: ProjectiveMatrix): number => m.find(x => x !== 0)!
  const chosen = lead(M) <= Math.floor(p / 2) ? M : neg

  return chosen.join(',')
}

// The standard four PSL(2,p) generators S, S^-1, T, T^-1 (the upper/lower triangular
// unipotents), for the common closed-manifold construction.
export function standardPslGenerators(p: number): ProjectiveMatrix[] {
  const m = ((-1 % p) + p) % p

  return [
    [1, 1, 0, 1],
    [1, m, 0, 1],
    [0, m, 1, 0],
    [0, 1, m, 0],
  ]
}

// BFS-generate PSL(2, p) from the generators and build its Cayley graph. Returns the
// element matrices, the per-element adjacency (the de-duplicated neighbour indices
// across the generators), and the canonical keys in index order.
export function pslCayleyGraph(input: {
  p: number
  generators: ProjectiveMatrix[]
}): {
  matrices: ProjectiveMatrix[]
  adjacency: number[][]
  keys: string[]
} {
  const { p, generators } = input
  const identity: ProjectiveMatrix = [1, 0, 0, 1]
  const key = (M: ProjectiveMatrix): string =>
    projectiveCanonicalKey(M, p)

  const elems = new Map<string, ProjectiveMatrix>([
    [key(identity), identity],
  ])

  const queue: ProjectiveMatrix[] = [identity]

  while (queue.length) {
    const g = queue.shift()!

    for (const gen of generators) {
      const h = projectiveMultiply(gen, g, p)
      const k = key(h)

      if (!elems.has(k)) {
        elems.set(k, h)
        queue.push(h)
      }
    }
  }

  const keys = [...elems.keys()]
  const id = new Map(keys.map((k, i) => [k, i]))
  const matrices = keys.map(k => elems.get(k)!)
  const adjacency = matrices.map(M => {
    const ns = new Set<number>()

    for (const gen of generators)
      ns.add(id.get(key(projectiveMultiply(gen, M, p)))!)

    return [...ns]
  })

  return { matrices, adjacency, keys }
}
