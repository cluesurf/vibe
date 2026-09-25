// The log determinant of a Hermitian positive-definite complex matrix, exactly, by Cholesky
// factorization K = L L^dag: ln det K = 2 sum_i ln L_ii, the diagonal of L being real and positive.
// Built column by column from a linear map, so a sparse operator (a fermion matrix) can be handed in
// as a function and turned dense only here, for the small boxes where an exact determinant is
// affordable.

export function hermitianLogDeterminant(input: {
  size: number
  // out = K e_j, the j-th column, for a unit vector with a one in complex slot j
  column: (j: number, out: Float64Array) => void
}): number {
  const { size } = input
  const a = new Float64Array(2 * size * size)
  const column = new Float64Array(2 * size)

  for (let j = 0; j < size; j++) {
    input.column(j, column)

    for (let i = 0; i < size; i++) {
      a[2 * (i * size + j)] = column[2 * i] ?? 0
      a[2 * (i * size + j) + 1] = column[2 * i + 1] ?? 0
    }
  }

  let logDeterminant = 0

  for (let j = 0; j < size; j++) {
    // L_jj^2 = A_jj - sum_k |L_jk|^2
    let diagonal = a[2 * (j * size + j)] ?? 0

    for (let k = 0; k < j; k++) {
      diagonal -=
        (a[2 * (j * size + k)] ?? 0) ** 2 +
        (a[2 * (j * size + k) + 1] ?? 0) ** 2
    }

    if (!(diagonal > 0)) {
      return Number.NaN
    }

    const pivot = Math.sqrt(diagonal)

    a[2 * (j * size + j)] = pivot
    a[2 * (j * size + j) + 1] = 0
    logDeterminant += 2 * Math.log(pivot)

    // L_ij = (A_ij - sum_k L_ik conj(L_jk)) / L_jj for i > j
    for (let i = j + 1; i < size; i++) {
      let re = a[2 * (i * size + j)] ?? 0
      let im = a[2 * (i * size + j) + 1] ?? 0

      for (let k = 0; k < j; k++) {
        const xr = a[2 * (i * size + k)] ?? 0
        const xi = a[2 * (i * size + k) + 1] ?? 0
        const yr = a[2 * (j * size + k)] ?? 0
        const yi = -(a[2 * (j * size + k) + 1] ?? 0)

        re -= xr * yr - xi * yi
        im -= xr * yi + xi * yr
      }

      a[2 * (i * size + j)] = re / pivot
      a[2 * (i * size + j) + 1] = im / pivot
    }
  }

  return logDeterminant
}
