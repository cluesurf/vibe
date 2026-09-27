// The eigenvalues of a complex Hermitian matrix by Householder reduction to a real tridiagonal form and the implicit
// QL iteration (Wilkinson and Reinsch, "Handbook for Automatic Computation" II, tred1 / tql1, here with complex
// reflections). O(n^3) once, where the Jacobi solvers of code/algebra/linear/eig-hermitian cost a sweep of that size
// per iteration on the 2n real embedding; used where thousands of reduced density matrices are diagonalized.
//
// THE REDUCTION. For column k the reflection H = I - 2 v v^dagger (v a unit vector on rows k + 1 .. n - 1) takes
// the column below the diagonal to (alpha, 0, .., 0), alpha = -e^(i arg x0) |x|. With p = A v and K = v^dagger p
// (real, A Hermitian), H A H = A - 2 v w^dagger - 2 w v^dagger, w = p - K v. The tridiagonal form left has complex
// off-diagonals e_j; a diagonal unitary makes them |e_j| without changing the spectrum, so the real symmetric QL runs
// on (d, |e|).
//
// Measurement only (floats). The matrix is given row-major as re and im, n x n, and is not modified.

export function hermitianEigenvaluesTridiagonal(n: number, re: Float64Array, im: Float64Array): number[] {
  const ar = Float64Array.from(re)
  const ai = Float64Array.from(im)
  const vr = new Float64Array(n)
  const vi = new Float64Array(n)
  const pr = new Float64Array(n)
  const pi = new Float64Array(n)

  for (let k = 0; k < n - 2; k++) {
    let norm2 = 0

    for (let i = k + 1; i < n; i++) norm2 += ar[i * n + k]! ** 2 + ai[i * n + k]! ** 2
    if (norm2 === 0) continue

    const norm = Math.sqrt(norm2)
    const x0r = ar[(k + 1) * n + k]!
    const x0i = ai[(k + 1) * n + k]!
    const x0 = Math.hypot(x0r, x0i)
    const phr = x0 === 0 ? 1 : x0r / x0
    const phi = x0 === 0 ? 0 : x0i / x0
    // v = x - alpha e1, alpha = -phase |x|
    let vnorm2 = 0

    vr.fill(0)
    vi.fill(0)

    for (let i = k + 1; i < n; i++) {
      vr[i] = ar[i * n + k]!
      vi[i] = ai[i * n + k]!
    }

    vr[k + 1] = vr[k + 1]! + phr * norm
    vi[k + 1] = vi[k + 1]! + phi * norm

    for (let i = k + 1; i < n; i++) vnorm2 += vr[i]! ** 2 + vi[i]! ** 2
    if (vnorm2 === 0) continue

    const vs = 1 / Math.sqrt(vnorm2)

    for (let i = k + 1; i < n; i++) {
      vr[i] = vr[i]! * vs
      vi[i] = vi[i]! * vs
    }

    // p = A v on rows k .. n - 1
    let K = 0

    for (let i = k; i < n; i++) {
      let sr = 0
      let si = 0

      for (let j = k + 1; j < n; j++) {
        const xr = ar[i * n + j]!
        const xi = ai[i * n + j]!

        sr += xr * vr[j]! - xi * vi[j]!
        si += xr * vi[j]! + xi * vr[j]!
      }

      pr[i] = sr
      pi[i] = si
    }

    // K = v^dagger p (real)
    for (let i = k + 1; i < n; i++) K += vr[i]! * pr[i]! + vi[i]! * pi[i]!

    // w = p - K v, stored in p
    for (let i = k; i < n; i++) {
      pr[i] = pr[i]! - K * vr[i]!
      pi[i] = pi[i]! - K * vi[i]!
    }

    // A <- A - 2 v w^dagger - 2 w v^dagger on rows and columns k .. n - 1
    for (let i = k; i < n; i++) {
      for (let j = k; j < n; j++) {
        // v_i conj(w_j) + w_i conj(v_j)
        const r = vr[i]! * pr[j]! + vi[i]! * pi[j]! + (pr[i]! * vr[j]! + pi[i]! * vi[j]!)
        const s = vi[i]! * pr[j]! - vr[i]! * pi[j]! + (pi[i]! * vr[j]! - pr[i]! * vi[j]!)

        ar[i * n + j] = ar[i * n + j]! - 2 * r
        ai[i * n + j] = ai[i * n + j]! - 2 * s
      }
    }
  }

  const d = new Float64Array(n)
  const e = new Float64Array(n)

  for (let i = 0; i < n; i++) d[i] = ar[i * n + i]!
  for (let i = 1; i < n; i++) e[i - 1] = Math.hypot(ar[i * n + i - 1]!, ai[i * n + i - 1]!)

  return tridiagonalEigenvalues(d, e)
}

// the eigenvalues of the real symmetric tridiagonal (d, e), e[i] between i and i + 1, by implicit QL (tql1)
export function tridiagonalEigenvalues(d0: Float64Array, e0: Float64Array): number[] {
  const n = d0.length
  const d = Float64Array.from(d0)
  const e = Float64Array.from(e0)

  for (let l = 0; l < n; l++) {
    let iter = 0

    for (;;) {
      let m = l

      for (; m < n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)

        if (Math.abs(e[m]!) <= Number.EPSILON * dd) break
      }

      if (m === l) break
      if (++iter > 60) throw new Error('eig-hermitian-tridiagonal: the QL iteration did not converge')

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
        f = 0
      }

      if (r === 0 && i >= l) continue

      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }

  return Array.from(d).sort((a, b) => a - b)
}
