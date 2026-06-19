// A Bethe lattice: a regular tree of coordination number q, grown outward from a root to the given
// depth. The cleanest discrete negatively-curved space, the tree limit of a hyperbolic
// tessellation, where geodesic shells grow EXPONENTIALLY (|S(r)| ~ (q-1)^r) rather than as a
// power. The root has q children, every later cell has q-1, and the result is returned as a
// neighbors adjacency list (each row holds the parent plus its children).

export function betheTree(q: number, depth: number): Uint32Array[] {
  const adj: number[][] = [[]]

  let frontier = [0]
  let curDepth = 0

  while (curDepth < depth) {
    const next: number[] = []

    for (const parent of frontier) {
      const children = curDepth === 0 ? q : q - 1

      for (let c = 0; c < children; c++) {
        const id = adj.length
        adj.push([parent])
        adj[parent]!.push(id)
        next.push(id)
      }
    }

    frontier = next
    curDepth++
  }

  return adj.map(row => Uint32Array.from(row))
}
