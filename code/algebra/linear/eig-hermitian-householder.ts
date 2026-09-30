// The eigenvalues AND eigenvectors of a complex Hermitian matrix by Householder reduction to a real tridiagonal form
// and the implicit QL iteration with accumulated rotations (Wilkinson and Reinsch, "Handbook for Automatic Computation"
// II, tred2 / tql2, here with complex reflections). O(n^3) once. code/algebra/linear/eig-hermitian-tridiagonal returns
// the eigenvalues only, and code/algebra/linear/eig-hermitian's Jacobi solver costs a sweep of O(n^3) per iteration on
// the 2n real embedding, which is out of reach for a few thousand rows.
//
// THE REDUCTION. For column k the reflection H_k = I - 2 v v^dagger (v a unit vector on rows k + 1 .. n - 1) takes the
// column below the diagonal to (alpha, 0, .., 0). With p = A v and K = v^dagger p (real), H A H = A - 2 v w^dagger -
// 2 w v^dagger, w = p - K v. So A = Q T Q^dagger with Q = H_0 H_1 .. H_(n-3) and T tridiagonal with complex off-diagonals
// t_j = T_(j+1, j). THE PHASES. D = diag(delta), delta_0 = 1, delta_(j+1) = delta_j t_j / |t_j|, gives D^dagger T D the
// real symmetric tridiagonal with off-diagonals |t_j|. THE QL. tql2 on (diag, |t|) accumulates the rotations into Z, the
// real eigenvectors of that tridiagonal. So the eigenvectors of A are Q D Z, formed by applying the reflections to D Z in
// reverse order.
//
// A shift: the QL convergence test is relative, so a cluster of exact zeros can fail to converge; the solver runs on
// A + shift I (default 1) and subtracts the shift, which leaves the eigenvectors unchanged.
//
// Measurement only (floats). The matrix is given row-major as re and im, n x n, and is not modified. Returns the values
// ascending and the vectors as rows: vector i is (vectorsRe, vectorsIm)[i * n .. i * n + n - 1].

export type HermitianEigenRows = {
  readonly n: number
  readonly values: Float64Array
  readonly vectorsRe: Float64Array
  readonly vectorsIm: Float64Array
}

export function hermitianEigenRows(
  n: number,
  re: Float64Array,
  im: Float64Array,
  shift = 1,
): HermitianEigenRows {
  const ar = Float64Array.from(re)
  const ai = Float64Array.from(im)

  for (let i = 0; i < n; i++) {
    ar[i * n + i]! += shift
  }

  // the reflections, v_k stored as row k (entries k + 1 .. n - 1), and whether step k reflected
  const Vr = new Float64Array(n * n)
  const Vi = new Float64Array(n * n)
  const used = new Uint8Array(n)
  const pr = new Float64Array(n)
  const pi = new Float64Array(n)

  for (let k = 0; k < n - 2; k++) {
    let norm2 = 0

    for (let i = k + 1; i < n; i++) {
      norm2 += ar[i * n + k]! ** 2 + ai[i * n + k]! ** 2
    }

    if (norm2 === 0) {
      continue
    }

    const norm = Math.sqrt(norm2)
    const x0r = ar[(k + 1) * n + k]!
    const x0i = ai[(k + 1) * n + k]!
    const x0 = Math.hypot(x0r, x0i)
    const phr = x0 === 0 ? 1 : x0r / x0
    const phi = x0 === 0 ? 0 : x0i / x0
    const o = k * n

    for (let i = k + 1; i < n; i++) {
      Vr[o + i] = ar[i * n + k]!
      Vi[o + i] = ai[i * n + k]!
    }

    Vr[o + k + 1]! += phr * norm
    Vi[o + k + 1]! += phi * norm

    let vnorm2 = 0

    for (let i = k + 1; i < n; i++) {
      vnorm2 += Vr[o + i]! ** 2 + Vi[o + i]! ** 2
    }

    if (vnorm2 === 0) {
      continue
    }

    used[k] = 1

    const vs = 1 / Math.sqrt(vnorm2)

    for (let i = k + 1; i < n; i++) {
      Vr[o + i]! *= vs
      Vi[o + i]! *= vs
    }

    // p = A v on rows k .. n - 1
    for (let i = k; i < n; i++) {
      let sr = 0
      let si = 0
      const row = i * n

      for (let j = k + 1; j < n; j++) {
        const xr = ar[row + j]!
        const xi = ai[row + j]!
        const yr = Vr[o + j]!
        const yi = Vi[o + j]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      pr[i] = sr
      pi[i] = si
    }

    let K = 0

    for (let i = k + 1; i < n; i++) {
      K += Vr[o + i]! * pr[i]! + Vi[o + i]! * pi[i]!
    }

    for (let i = k; i < n; i++) {
      pr[i]! -= K * Vr[o + i]!
      pi[i]! -= K * Vi[o + i]!
    }

    // A <- A - 2 v w^dagger - 2 w v^dagger on rows and columns k .. n - 1 (v is 0 on row k)
    for (let i = k; i < n; i++) {
      const vri = Vr[o + i]!
      const vii = Vi[o + i]!
      const wri = pr[i]!
      const wii = pi[i]!
      const row = i * n

      for (let j = k; j < n; j++) {
        const vrj = Vr[o + j]!
        const vij = Vi[o + j]!
        const wrj = pr[j]!
        const wij = pi[j]!
        const r = vri * wrj + vii * wij + (wri * vrj + wii * vij)
        const s = vii * wrj - vri * wij + (wii * vrj - wri * vij)

        ar[row + j]! -= 2 * r
        ai[row + j]! -= 2 * s
      }
    }
  }

  const d = new Float64Array(n)
  const e = new Float64Array(n)
  // delta, the phases that make the off-diagonals real
  const dr = new Float64Array(n)
  const di = new Float64Array(n)

  dr[0] = 1

  for (let i = 0; i < n; i++) {
    d[i] = ar[i * n + i]!
  }

  for (let j = 0; j + 1 < n; j++) {
    const tr = ar[(j + 1) * n + j]!
    const ti = ai[(j + 1) * n + j]!
    const t = Math.hypot(tr, ti)

    e[j] = t

    const ur = t === 0 ? 1 : tr / t
    const ui = t === 0 ? 0 : ti / t

    dr[j + 1] = dr[j]! * ur - di[j]! * ui
    di[j + 1] = dr[j]! * ui + di[j]! * ur
  }

  // tql2: z holds the real eigenvectors of the tridiagonal as ROWS (z[i * n + k], vector i, component k), starting from
  // the identity; each plane rotation acts on two rows
  const z = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    z[i * n + i] = 1
  }

  tql2(d, e, z, n)

  // X = D Z as rows, then X <- H_k X for k = n - 3 .. 0
  const xr = new Float64Array(n * n)
  const xi = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let a = 0; a < n; a++) {
      const zz = z[i * n + a]!

      xr[i * n + a] = dr[a]! * zz
      xi[i * n + a] = di[a]! * zz
    }
  }

  for (let k = n - 3; k >= 0; k--) {
    if (!used[k]) {
      continue
    }

    const o = k * n

    for (let i = 0; i < n; i++) {
      const row = i * n

      // c = v^dagger x
      let cr = 0
      let ci = 0

      for (let a = k + 1; a < n; a++) {
        const vr = Vr[o + a]!
        const vi = Vi[o + a]!
        const yr = xr[row + a]!
        const yi = xi[row + a]!

        cr += vr * yr + vi * yi
        ci += vr * yi - vi * yr
      }

      cr *= 2
      ci *= 2

      for (let a = k + 1; a < n; a++) {
        const vr = Vr[o + a]!
        const vi = Vi[o + a]!

        xr[row + a]! -= vr * cr - vi * ci
        xi[row + a]! -= vr * ci + vi * cr
      }
    }
  }

  // sort ascending
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => d[a]! - d[b]!,
  )
  const values = new Float64Array(n)
  const vectorsRe = new Float64Array(n * n)
  const vectorsIm = new Float64Array(n * n)

  order.forEach((from, to) => {
    values[to] = d[from]! - shift
    vectorsRe.set(xr.subarray(from * n, from * n + n), to * n)
    vectorsIm.set(xi.subarray(from * n, from * n + n), to * n)
  })

  return { n, values, vectorsRe, vectorsIm }
}

// the implicit QL iteration on the real symmetric tridiagonal (d, e), e[i] between i and i + 1, accumulating the
// rotations into the rows of z (Numerical Recipes tqli, rows for columns)
function tql2(d: Float64Array, e: Float64Array, z: Float64Array, n: number): void {
  for (let l = 0; l < n; l++) {
    let iter = 0

    for (;;) {
      let m = l

      for (; m < n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)

        if (Math.abs(e[m]!) <= Number.EPSILON * dd) {
          break
        }
      }

      if (m === l) {
        break
      }

      if (++iter > 60) {
        throw new Error('eig-hermitian-householder: the QL iteration did not converge')
      }

      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)

      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? Math.abs(r) : -Math.abs(r)))

      let s = 1
      let c = 1
      let p = 0
      let i = m - 1

      for (; i >= l; i--) {
        let f = s * e[i]!

        const b = c * e[i]!

        r = Math.hypot(f, g)
        e[i + 1] = r

        if (r === 0) {
          d[i + 1] = d[i + 1]! - p
          e[m] = 0
          break
        }

        s = f / r
        c = g / r
        g = d[i + 1]! - p
        r = (d[i]! - g) * s + 2 * c * b
        p = s * r
        d[i + 1] = g + p
        g = c * r - b

        const ra = i * n
        const rb = (i + 1) * n

        for (let k = 0; k < n; k++) {
          f = z[rb + k]!
          z[rb + k] = s * z[ra + k]! + c * f
          z[ra + k] = c * z[ra + k]! - s * f
        }
      }

      if (r === 0 && i >= l) {
        continue
      }

      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
}

// the largest |A v_i - lambda_i v_i| over the vectors and the largest |<v_i, v_j> - delta_ij| over pairs among the
// first `sample` vectors (a check, O(n^2) per vector)
export function hermitianEigenCheck(
  n: number,
  re: Float64Array,
  im: Float64Array,
  eig: HermitianEigenRows,
  sample = n,
): { residual: number; orthogonality: number } {
  let residual = 0
  let orthogonality = 0
  const m = Math.min(sample, n)

  for (let i = 0; i < m; i++) {
    const o = i * n
    let worst = 0

    for (let a = 0; a < n; a++) {
      let sr = -eig.values[i]! * eig.vectorsRe[o + a]!
      let si = -eig.values[i]! * eig.vectorsIm[o + a]!
      const row = a * n

      for (let b = 0; b < n; b++) {
        const xr = re[row + b]!
        const xi = im[row + b]!
        const yr = eig.vectorsRe[o + b]!
        const yi = eig.vectorsIm[o + b]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      worst += sr * sr + si * si
    }

    residual = Math.max(residual, Math.sqrt(worst))

    for (let j = 0; j < m; j++) {
      let cr = 0
      let ci = 0
      const q = j * n

      for (let a = 0; a < n; a++) {
        cr += eig.vectorsRe[o + a]! * eig.vectorsRe[q + a]! + eig.vectorsIm[o + a]! * eig.vectorsIm[q + a]!
        ci += eig.vectorsRe[o + a]! * eig.vectorsIm[q + a]! - eig.vectorsIm[o + a]! * eig.vectorsRe[q + a]!
      }

      orthogonality = Math.max(orthogonality, Math.hypot(cr - (i === j ? 1 : 0), ci))
    }
  }

  return { residual, orthogonality }
}
