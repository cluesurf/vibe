// A flat d-dimensional periodic mesh (a discrete torus) of side length L, grown by the local rule
// "each cell joins its two neighbors along every axis". Periodic wraparound means there is no
// boundary to truncate geodesic shells, so it is the clean control substrate for reading an
// intrinsic spatial dimension off shell growth: |S(r)| ~ r^(d-1) with no edge bias. Sites are
// indexed row-major, index = sum_a c_a * L^a, and every cell has exactly 2d neighbors.

export function torusGrid(d: number, L: number): Uint32Array[] {
  const n = Math.pow(L, d)
  const pow = Array.from({ length: d }, (_, a) => Math.pow(L, a))
  const neighbors: Uint32Array[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const ns: number[] = []
    for (let a = 0; a < d; a++) {
      const stride = pow[a] ?? 1
      const coord = Math.floor(i / stride) % L
      const base = i - coord * stride
      ns.push(base + ((coord + 1) % L) * stride)
      ns.push(base + ((coord - 1 + L) % L) * stride)
    }

    neighbors[i] = Uint32Array.from(ns)
  }

  return neighbors
}
