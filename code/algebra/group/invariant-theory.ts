// Molien-style counting of the dimension of the space of degree-d invariant polynomials of a finite
// matrix group G acting on R^n. By Molien's theorem the dimension is the group average of the complete
// homogeneous symmetric polynomial h_d of the eigenvalues of each group element. We compute h_d from
// the power sums p_k = trace(g^k) via Newton's identities, avoiding any explicit eigen-decomposition.
// For the spatial-isotropy question, the count of degree-4 invariants above one (the isotropic |x|^4)
// is the anisotropy: B4 (signed permutations) has two, but the full 24-cell symmetry F4 has only one.

type SquareMatrix = number[][]

// The dimension of the degree-d invariant polynomials of the group, for d in {2, 4}. The caller
// supplies the group elements (n x n matrices), the matrix product, the trace, and the identity.
export function invariantPolynomialDimension(input: {
  group: SquareMatrix[]
  degree: 2 | 4
  identity: SquareMatrix
  multiply: (a: SquareMatrix, b: SquareMatrix) => SquareMatrix
  trace: (a: SquareMatrix) => number
}): number {
  const { group, degree, identity, multiply, trace } = input

  let total = 0

  for (const g of group) {
    // power sums p_k = trace(g^k), k = 1..4
    let gp = identity

    const p: number[] = [0, 0, 0, 0, 0]

    for (let k = 1; k <= 4; k++) {
      gp = multiply(gp, g)
      p[k] = trace(gp)
    }

    // elementary symmetric polynomials e_k via Newton's identities
    const e1 = p[1]!
    const e2 = (e1 * p[1]! - p[2]!) / 2
    const e3 = (e2 * p[1]! - e1 * p[2]! + p[3]!) / 3
    const e4 = (e3 * p[1]! - e2 * p[2]! + e1 * p[3]! - p[4]!) / 4
    // complete homogeneous symmetric polynomials h_k
    const h1 = e1
    const h2 = e1 * h1 - e2
    const h3 = e1 * h2 - e2 * h1 + e3
    const h4 = e1 * h3 - e2 * h2 + e3 * h1 - e4
    total += degree === 2 ? h2 : h4
  }

  return Math.round(total / group.length)
}
