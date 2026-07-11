// Entropic optimal transport. The Sinkhorn-regularized Wasserstein-1 distance between two uniform
// distributions over equal-size supports, given a cost matrix C. Alternating row/column scaling
// (Sinkhorn iterations) converges the transport plan, then the plan is integrated against the cost
// to read off the W1 distance. The entropy parameter eps trades accuracy for numerical stability,
// and the iteration count caps the work. The transport engine behind Ollivier-Ricci curvature,
// where C holds the graph distances between the neighbor clouds of two endpoints.

export function sinkhornW1(
  C: number[][],
  eps: number,
  iters: number,
): number {
  const n = C.length
  const m = C[0]!.length
  const K = C.map(row => row.map(c => Math.exp(-c / eps)))
  const u = new Array(n).fill(1)
  const v = new Array(m).fill(1)

  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < n; i++) {
      let s = 0

      for (let j = 0; j < m; j++) s += K[i]![j]! * v[j]!

      u[i] = 1 / n / (s || 1e-300)
    }

    for (let j = 0; j < m; j++) {
      let s = 0

      for (let i = 0; i < n; i++) s += K[i]![j]! * u[i]!

      v[j] = 1 / m / (s || 1e-300)
    }
  }

  let w = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++)
      w += u[i]! * K[i]![j]! * v[j]! * C[i]![j]!
  }

  return w
}
