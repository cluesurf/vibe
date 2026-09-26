// Eigenvalues of a general (non-Hermitian) complex square matrix.
//
// The matrix is reduced to upper Hessenberg form by Householder reflections, then the Hessenberg matrix
// is driven to upper triangular form by the shifted QR iteration (Givens rotations, a Wilkinson shift
// from the trailing two by two block, deflation from the bottom whenever a subdiagonal entry falls below
// the working precision of its neighbours, and an exceptional shift every tenth iteration without a
// deflation). Eigenvalues only, no vectors. Written for the small (tens of rows) period maps of a linear
// lattice Boltzmann equation (code/coarse/knit-boltzmann), where the matrix is not normal and its slow
// eigenvalues sit near the unit circle.
//
// The matrix is given as two row-major arrays (real and imaginary parts, n * n each) and is not modified.

export type ComplexEigenvalues = { readonly re: number[]; readonly im: number[] }

export function complexEigenvalues(input: { re: ArrayLike<number>; im: ArrayLike<number>; n: number; maxIterations?: number }): ComplexEigenvalues {
  const n = input.n
  const ar = Float64Array.from(input.re)
  const ai = Float64Array.from(input.im)
  const at = (r: number, c: number): number => r * n + c

  // Householder reduction to Hessenberg form: A <- H A H with H = I - 2 v v*
  for (let k = 0; k < n - 2; k++) {
    let norm = 0

    for (let r = k + 1; r < n; r++) {
      norm += (ar[at(r, k)] ?? 0) ** 2 + (ai[at(r, k)] ?? 0) ** 2
    }

    norm = Math.sqrt(norm)

    if (norm < 1e-300) {
      continue
    }

    const x0r = ar[at(k + 1, k)] ?? 0
    const x0i = ai[at(k + 1, k)] ?? 0
    const x0 = Math.hypot(x0r, x0i)
    // alpha = -e^{i arg x0} |x|
    const pr = x0 > 0 ? x0r / x0 : 1
    const pi = x0 > 0 ? x0i / x0 : 0
    const vr = new Float64Array(n)
    const vi = new Float64Array(n)

    for (let r = k + 1; r < n; r++) {
      vr[r] = ar[at(r, k)] ?? 0
      vi[r] = ai[at(r, k)] ?? 0
    }

    vr[k + 1] = (vr[k + 1] ?? 0) + pr * norm
    vi[k + 1] = (vi[k + 1] ?? 0) + pi * norm

    let vnorm = 0

    for (let r = k + 1; r < n; r++) {
      vnorm += (vr[r] ?? 0) ** 2 + (vi[r] ?? 0) ** 2
    }

    vnorm = Math.sqrt(vnorm)

    for (let r = k + 1; r < n; r++) {
      vr[r] = (vr[r] ?? 0) / vnorm
      vi[r] = (vi[r] ?? 0) / vnorm
    }

    // left: A <- A - 2 v (v* A)
    for (let c = 0; c < n; c++) {
      let sr = 0
      let si = 0

      for (let r = k + 1; r < n; r++) {
        const a = ar[at(r, c)] ?? 0
        const b = ai[at(r, c)] ?? 0
        const u = vr[r] ?? 0
        const w = vi[r] ?? 0

        // conj(v) * A
        sr += u * a + w * b
        si += u * b - w * a
      }

      for (let r = k + 1; r < n; r++) {
        const u = vr[r] ?? 0
        const w = vi[r] ?? 0

        ar[at(r, c)] = (ar[at(r, c)] ?? 0) - 2 * (u * sr - w * si)
        ai[at(r, c)] = (ai[at(r, c)] ?? 0) - 2 * (u * si + w * sr)
      }
    }

    // right: A <- A - 2 (A v) v*
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0

      for (let c = k + 1; c < n; c++) {
        const a = ar[at(r, c)] ?? 0
        const b = ai[at(r, c)] ?? 0
        const u = vr[c] ?? 0
        const w = vi[c] ?? 0

        sr += a * u - b * w
        si += a * w + b * u
      }

      for (let c = k + 1; c < n; c++) {
        const u = vr[c] ?? 0
        const w = vi[c] ?? 0

        // (A v) conj(v)
        ar[at(r, c)] = (ar[at(r, c)] ?? 0) - 2 * (sr * u + si * w)
        ai[at(r, c)] = (ai[at(r, c)] ?? 0) - 2 * (si * u - sr * w)
      }
    }

    for (let r = k + 2; r < n; r++) {
      ar[at(r, k)] = 0
      ai[at(r, k)] = 0
    }
  }

  const outRe: number[] = []
  const outIm: number[] = []
  const maxIterations = input.maxIterations ?? 100 * n
  const cs = new Float64Array(n)
  const snr = new Float64Array(n)
  const sni = new Float64Array(n)

  let hi = n - 1
  let iterations = 0
  let sinceDeflation = 0

  while (hi >= 0) {
    if (hi === 0) {
      outRe.push(ar[0] ?? 0)
      outIm.push(ai[0] ?? 0)
      hi--
      continue
    }

    // find the start of the unreduced block
    let lo = hi

    while (lo > 0) {
      const sub = Math.hypot(ar[at(lo, lo - 1)] ?? 0, ai[at(lo, lo - 1)] ?? 0)
      const scale = Math.hypot(ar[at(lo, lo)] ?? 0, ai[at(lo, lo)] ?? 0) + Math.hypot(ar[at(lo - 1, lo - 1)] ?? 0, ai[at(lo - 1, lo - 1)] ?? 0)

      if (sub <= 1e-15 * (scale > 0 ? scale : 1)) {
        ar[at(lo, lo - 1)] = 0
        ai[at(lo, lo - 1)] = 0
        break
      }

      lo--
    }

    if (lo === hi) {
      outRe.push(ar[at(hi, hi)] ?? 0)
      outIm.push(ai[at(hi, hi)] ?? 0)
      hi--
      sinceDeflation = 0
      continue
    }

    iterations++
    sinceDeflation++

    if (iterations > maxIterations) {
      throw new Error('complexEigenvalues: QR iteration did not converge')
    }

    // Wilkinson shift: the eigenvalue of the trailing 2x2 nearer its last diagonal entry
    const a = [ar[at(hi - 1, hi - 1)] ?? 0, ai[at(hi - 1, hi - 1)] ?? 0]
    const b = [ar[at(hi - 1, hi)] ?? 0, ai[at(hi - 1, hi)] ?? 0]
    const c = [ar[at(hi, hi - 1)] ?? 0, ai[at(hi, hi - 1)] ?? 0]
    const d = [ar[at(hi, hi)] ?? 0, ai[at(hi, hi)] ?? 0]
    let shift: number[]

    if (sinceDeflation % 10 === 0) {
      // exceptional shift
      const m = Math.hypot(c[0] ?? 0, c[1] ?? 0)

      shift = [(d[0] ?? 0) + 0.75 * m, (d[1] ?? 0) + 0.4 * m]
    } else {
      // roots of z^2 - (a + d) z + (a d - b c)
      const hr = ((a[0] ?? 0) - (d[0] ?? 0)) / 2
      const hiP = ((a[1] ?? 0) - (d[1] ?? 0)) / 2
      // disc = h^2 + b c
      const dr = hr * hr - hiP * hiP + ((b[0] ?? 0) * (c[0] ?? 0) - (b[1] ?? 0) * (c[1] ?? 0))
      const di = 2 * hr * hiP + ((b[0] ?? 0) * (c[1] ?? 0) + (b[1] ?? 0) * (c[0] ?? 0))
      const mod = Math.hypot(dr, di)
      let sr = Math.sqrt((mod + dr) / 2)
      let si = Math.sqrt(Math.max(0, (mod - dr) / 2)) * (di < 0 ? -1 : 1)

      // choose the root z = d + h - s or d + h + s nearer d, that is the sign making (h - s) small
      if (hr * sr + hiP * si > 0) {
        sr = -sr
        si = -si
      }

      shift = [(d[0] ?? 0) + hr + sr, (d[1] ?? 0) + hiP + si]
    }

    for (let k = lo; k <= hi; k++) {
      ar[at(k, k)] = (ar[at(k, k)] ?? 0) - (shift[0] ?? 0)
      ai[at(k, k)] = (ai[at(k, k)] ?? 0) - (shift[1] ?? 0)
    }

    // QR by Givens on rows lo..hi, columns within the active block
    for (let j = lo; j < hi; j++) {
      const xr = ar[at(j, j)] ?? 0
      const xi = ai[at(j, j)] ?? 0
      const yr = ar[at(j + 1, j)] ?? 0
      const yi = ai[at(j + 1, j)] ?? 0
      const xa = Math.hypot(xr, xi)
      const r = Math.hypot(xa, Math.hypot(yr, yi))
      let cj: number
      let sr: number
      let si: number

      if (r === 0) {
        cj = 1
        sr = 0
        si = 0
      } else if (xa === 0) {
        cj = 0
        sr = 1
        si = 0
      } else {
        cj = xa / r
        // s = (x / |x|) conj(y) / r
        const ur = xr / xa
        const ui = xi / xa

        sr = (ur * yr + ui * yi) / r
        si = (ui * yr - ur * yi) / r
      }

      cs[j] = cj
      snr[j] = sr
      sni[j] = si

      for (let col = j; col <= hi; col++) {
        const pr = ar[at(j, col)] ?? 0
        const pim = ai[at(j, col)] ?? 0
        const qr = ar[at(j + 1, col)] ?? 0
        const qi = ai[at(j + 1, col)] ?? 0

        // row j: c p + s q; row j+1: -conj(s) p + c q
        ar[at(j, col)] = cj * pr + (sr * qr - si * qi)
        ai[at(j, col)] = cj * pim + (sr * qi + si * qr)
        ar[at(j + 1, col)] = -(sr * pr + si * pim) + cj * qr
        ai[at(j + 1, col)] = -(sr * pim - si * pr) + cj * qi
      }
    }

    // R Q: right-multiply by each G_j*
    for (let j = lo; j < hi; j++) {
      const cj = cs[j] ?? 1
      const sr = snr[j] ?? 0
      const si = sni[j] ?? 0

      for (let row = lo; row <= Math.min(j + 2, hi); row++) {
        const xr = ar[at(row, j)] ?? 0
        const xi = ai[at(row, j)] ?? 0
        const yr = ar[at(row, j + 1)] ?? 0
        const yi = ai[at(row, j + 1)] ?? 0

        // [x y] G* = [x c + y conj(s), -x s + y c]
        ar[at(row, j)] = xr * cj + (yr * sr + yi * si)
        ai[at(row, j)] = xi * cj + (yi * sr - yr * si)
        ar[at(row, j + 1)] = -(xr * sr - xi * si) + yr * cj
        ai[at(row, j + 1)] = -(xr * si + xi * sr) + yi * cj
      }
    }

    for (let k = lo; k <= hi; k++) {
      ar[at(k, k)] = (ar[at(k, k)] ?? 0) + (shift[0] ?? 0)
      ai[at(k, k)] = (ai[at(k, k)] ?? 0) + (shift[1] ?? 0)
    }
  }

  return { re: outRe, im: outIm }
}

// Solve (A - shift I) x = b by Gaussian elimination with partial pivoting, complex throughout. A is
// row-major n * n (real and imaginary parts), b a complex vector. A shift equal to an eigenvalue makes the
// system singular only to working precision, which is what inverse iteration wants: the pivot is floored
// at 1e-300 rather than refused.
export function complexShiftedSolve(input: {
  re: ArrayLike<number>
  im: ArrayLike<number>
  n: number
  shift: readonly [number, number]
  b: { re: ArrayLike<number>; im: ArrayLike<number> }
}): { re: Float64Array; im: Float64Array } {
  const n = input.n
  const w = n + 1
  const mr = new Float64Array(n * w)
  const mi = new Float64Array(n * w)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      mr[r * w + c] = (input.re[r * n + c] ?? 0) - (r === c ? input.shift[0] : 0)
      mi[r * w + c] = (input.im[r * n + c] ?? 0) - (r === c ? input.shift[1] : 0)
    }

    mr[r * w + n] = input.b.re[r] ?? 0
    mi[r * w + n] = input.b.im[r] ?? 0
  }

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) {
      if (Math.hypot(mr[r * w + c] ?? 0, mi[r * w + c] ?? 0) > Math.hypot(mr[p * w + c] ?? 0, mi[p * w + c] ?? 0)) {
        p = r
      }
    }

    if (p !== c) {
      for (let k = 0; k < w; k++) {
        const tr = mr[c * w + k] ?? 0
        const ti = mi[c * w + k] ?? 0

        mr[c * w + k] = mr[p * w + k] ?? 0
        mi[c * w + k] = mi[p * w + k] ?? 0
        mr[p * w + k] = tr
        mi[p * w + k] = ti
      }
    }

    let pr = mr[c * w + c] ?? 0
    let pi = mi[c * w + c] ?? 0

    if (Math.hypot(pr, pi) < 1e-300) {
      pr = 1e-300
      pi = 0
      mr[c * w + c] = pr
      mi[c * w + c] = 0
    }

    const den = pr * pr + pi * pi

    for (let r = c + 1; r < n; r++) {
      const ar = mr[r * w + c] ?? 0
      const ai = mi[r * w + c] ?? 0

      if (ar === 0 && ai === 0) {
        continue
      }

      // f = a / p
      const fr = (ar * pr + ai * pi) / den
      const fi = (ai * pr - ar * pi) / den

      for (let k = c; k < w; k++) {
        const xr = mr[c * w + k] ?? 0
        const xi = mi[c * w + k] ?? 0

        mr[r * w + k] = (mr[r * w + k] ?? 0) - (fr * xr - fi * xi)
        mi[r * w + k] = (mi[r * w + k] ?? 0) - (fr * xi + fi * xr)
      }
    }
  }

  const xr = new Float64Array(n)
  const xi = new Float64Array(n)

  for (let r = n - 1; r >= 0; r--) {
    let sr = mr[r * w + n] ?? 0
    let si = mi[r * w + n] ?? 0

    for (let k = r + 1; k < n; k++) {
      const ar = mr[r * w + k] ?? 0
      const ai = mi[r * w + k] ?? 0

      sr -= ar * (xr[k] ?? 0) - ai * (xi[k] ?? 0)
      si -= ar * (xi[k] ?? 0) + ai * (xr[k] ?? 0)
    }

    const pr = mr[r * w + r] ?? 1
    const pi = mi[r * w + r] ?? 0
    const den = pr * pr + pi * pi

    xr[r] = (sr * pr + si * pi) / den
    xi[r] = (si * pr - sr * pi) / den
  }

  return { re: xr, im: xi }
}

// The right eigenvector of an eigenvalue, by three steps of inverse iteration from a fixed start, unit
// norm.
export function complexEigenvector(input: { re: ArrayLike<number>; im: ArrayLike<number>; n: number; value: readonly [number, number] }): {
  re: Float64Array
  im: Float64Array
} {
  const n = input.n
  // perturb the shift off the eigenvalue so the solve stays finite
  const shift: [number, number] = [input.value[0] + 1e-10, input.value[1] + 1e-10]

  let x = { re: Float64Array.from({ length: n }, (_, i) => 1 + 0.1 * i), im: new Float64Array(n) }

  for (let step = 0; step < 3; step++) {
    const y = complexShiftedSolve({ re: input.re, im: input.im, n, shift, b: x })
    let norm = 0

    for (let i = 0; i < n; i++) {
      norm += (y.re[i] ?? 0) ** 2 + (y.im[i] ?? 0) ** 2
    }

    norm = Math.sqrt(norm)
    x = { re: y.re.map(v => v / norm), im: y.im.map(v => v / norm) }
  }

  return x
}
