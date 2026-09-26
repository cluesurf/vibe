// Small dense complex matrices: product, inverse, exponential and logarithm near the identity.
//
// A matrix is { re, im }, row-major n * n. These serve the hydrodynamic generators of
// code/coarse/knit-hydrodynamics, which are a handful of rows, so the methods are the plain ones: Gauss-
// Jordan for the inverse, scaling and squaring with a Taylor series for the exponential, and the series of
// log(I + E) for a matrix within a small distance of the identity.

export type ComplexMatrix = { readonly re: Float64Array; readonly im: Float64Array; readonly n: number }

export function complexIdentity(n: number): ComplexMatrix {
  const re = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    re[i * n + i] = 1
  }

  return { re, im: new Float64Array(n * n), n }
}

export function complexMultiply(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const xr = a.re[i * n + k] ?? 0
      const xi = a.im[i * n + k] ?? 0

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const yr = b.re[k * n + j] ?? 0
        const yi = b.im[k * n + j] ?? 0

        re[i * n + j] = (re[i * n + j] ?? 0) + xr * yr - xi * yi
        im[i * n + j] = (im[i * n + j] ?? 0) + xr * yi + xi * yr
      }
    }
  }

  return { re, im, n }
}

// a * s + b * t for complex scalars s = [sr, si] and t = [tr, ti]
export function complexCombine(a: ComplexMatrix, s: readonly [number, number], b: ComplexMatrix, t: readonly [number, number]): ComplexMatrix {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n * n; i++) {
    const ar = a.re[i] ?? 0
    const ai = a.im[i] ?? 0
    const br = b.re[i] ?? 0
    const bi = b.im[i] ?? 0

    re[i] = ar * s[0] - ai * s[1] + br * t[0] - bi * t[1]
    im[i] = ar * s[1] + ai * s[0] + br * t[1] + bi * t[0]
  }

  return { re, im, n }
}

export function complexInverse(a: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const w = 2 * n
  const mr = new Float64Array(n * w)
  const mi = new Float64Array(n * w)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      mr[r * w + c] = a.re[r * n + c] ?? 0
      mi[r * w + c] = a.im[r * n + c] ?? 0
    }

    mr[r * w + n + r] = 1
  }

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) {
      if (Math.hypot(mr[r * w + c] ?? 0, mi[r * w + c] ?? 0) > Math.hypot(mr[p * w + c] ?? 0, mi[p * w + c] ?? 0)) {
        p = r
      }
    }

    for (let k = 0; k < w; k++) {
      const tr = mr[c * w + k] ?? 0
      const ti = mi[c * w + k] ?? 0

      mr[c * w + k] = mr[p * w + k] ?? 0
      mi[c * w + k] = mi[p * w + k] ?? 0
      mr[p * w + k] = tr
      mi[p * w + k] = ti
    }

    const pr = mr[c * w + c] ?? 0
    const pi = mi[c * w + c] ?? 0
    const den = pr * pr + pi * pi

    if (den === 0) {
      throw new Error('complexInverse: singular matrix')
    }

    // scale the pivot row by 1 / p
    for (let k = 0; k < w; k++) {
      const xr = mr[c * w + k] ?? 0
      const xi = mi[c * w + k] ?? 0

      mr[c * w + k] = (xr * pr + xi * pi) / den
      mi[c * w + k] = (xi * pr - xr * pi) / den
    }

    for (let r = 0; r < n; r++) {
      if (r === c) {
        continue
      }

      const fr = mr[r * w + c] ?? 0
      const fi = mi[r * w + c] ?? 0

      if (fr === 0 && fi === 0) {
        continue
      }

      for (let k = 0; k < w; k++) {
        const xr = mr[c * w + k] ?? 0
        const xi = mi[c * w + k] ?? 0

        mr[r * w + k] = (mr[r * w + k] ?? 0) - (fr * xr - fi * xi)
        mi[r * w + k] = (mi[r * w + k] ?? 0) - (fr * xi + fi * xr)
      }
    }
  }

  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      re[r * n + c] = mr[r * w + n + c] ?? 0
      im[r * n + c] = mi[r * w + n + c] ?? 0
    }
  }

  return { re, im, n }
}

function norm1(a: ComplexMatrix): number {
  let worst = 0

  for (let c = 0; c < a.n; c++) {
    let s = 0

    for (let r = 0; r < a.n; r++) {
      s += Math.hypot(a.re[r * a.n + c] ?? 0, a.im[r * a.n + c] ?? 0)
    }

    worst = Math.max(worst, s)
  }

  return worst
}

// e^A by scaling and squaring, a Taylor series of 16 terms on A / 2^s with |A / 2^s| below 1 / 2
export function complexExp(a: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const size = norm1(a)
  const squarings = size > 0.5 ? Math.ceil(Math.log2(size / 0.5)) : 0
  const scale = 2 ** -squarings
  const scaled = complexCombine(a, [scale, 0], a, [0, 0])

  let sum = complexIdentity(n)
  let term = complexIdentity(n)

  for (let j = 1; j <= 16; j++) {
    term = complexMultiply(term, scaled)
    term = complexCombine(term, [1 / j, 0], term, [0, 0])
    sum = complexCombine(sum, [1, 0], term, [1, 0])
  }

  for (let s = 0; s < squarings; s++) {
    sum = complexMultiply(sum, sum)
  }

  return sum
}

// log(A) for A near the identity: the series of log(I + E), E = A - I, to 60 terms; throws when |E| is
// not below 1 / 2
export function complexLogNearIdentity(a: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const e = complexCombine(a, [1, 0], complexIdentity(n), [-1, 0])

  if (norm1(e) >= 0.5) {
    throw new Error('complexLogNearIdentity: matrix is not near the identity')
  }

  let sum = complexCombine(e, [0, 0], e, [0, 0])
  let power = complexIdentity(n)

  for (let j = 1; j <= 60; j++) {
    power = complexMultiply(power, e)
    sum = complexCombine(sum, [1, 0], power, [(j % 2 === 1 ? 1 : -1) / j, 0])
  }

  return sum
}

// A x for a complex vector
export function complexApply(a: ComplexMatrix, x: { re: ArrayLike<number>; im: ArrayLike<number> }): { re: Float64Array; im: Float64Array } {
  const n = a.n
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k] ?? 0
      const ai = a.im[i * n + k] ?? 0
      const xr = x.re[k] ?? 0
      const xi = x.im[k] ?? 0

      re[i] = (re[i] ?? 0) + ar * xr - ai * xi
      im[i] = (im[i] ?? 0) + ar * xi + ai * xr
    }
  }

  return { re, im }
}
