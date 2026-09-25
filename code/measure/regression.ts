// Least-squares regression measures used to read off scaling exponents from
// experiment data. The log-log slope is the power-law exponent: fit a line to
// (log x, log y) and return its slope. A flat profile gives zero, a 1/x falloff
// gives -1, and so on.

export function logLogSlope(xs: number[], ys: number[]): number {
  const lx = xs.map(x => Math.log(x))
  const ly = ys.map(y => Math.log(y))
  const n = lx.length
  const mx = lx.reduce((a, b) => a + b, 0) / n
  const my = ly.reduce((a, b) => a + b, 0) / n

  let num = 0
  let den = 0

  for (let i = 0; i < n; i++) {
    num += ((lx[i] ?? 0) - mx) * ((ly[i] ?? 0) - my)
    den += ((lx[i] ?? 0) - mx) * ((lx[i] ?? 0) - mx)
  }

  return den === 0 ? 0 : num / den
}

// The power-law exponent of a spread-versus-time curve, the scaling-experiment
// workhorse. Same log-log slope as logLogSlope but it DROPS non-positive samples
// (a zero or negative spread has no log), so an early all-zero transient does not
// poison the fit. Returns 0 when fewer than two usable points remain. This is the
// exponent that separates ballistic (z=1) from diffusive (z=2) transport.
export function powerLawExponent(input: {
  times: readonly number[]
  spreads: readonly number[]
}): number {
  const { times, spreads } = input

  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0

  for (let i = 0; i < times.length; i++) {
    if ((spreads[i] ?? 0) <= 0) {
      continue
    }

    const x = Math.log(times[i]!)
    const y = Math.log(spreads[i]!)

    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }

  return m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0
}

// Fit y ~ a * f(x) + c by ordinary least squares over a single basis function f,
// the intercept c absorbing any constant offset (a finite-box potential shift, a
// baseline). Returns the slope coefficient `a` and the coefficient of
// determination `r2`. Used to rank candidate falloff laws (1/r vs 1/r^2 vs log)
// against measured data: the best-fitting form has the highest r2.
export function fitForm(
  x: number[],
  y: number[],
  f: (value: number) => number,
): { a: number; r2: number } {
  const g = x.map(f)
  const n = g.length
  const mg = g.reduce((a, b) => a + b, 0) / n
  const mp = y.reduce((a, b) => a + b, 0) / n

  let cov = 0
  let varg = 0

  for (let i = 0; i < n; i++) {
    cov += ((g[i] ?? 0) - mg) * ((y[i] ?? 0) - mp)
    varg += ((g[i] ?? 0) - mg) * ((g[i] ?? 0) - mg)
  }

  const a = varg === 0 ? 0 : cov / varg
  const c = mp - a * mg

  let ssRes = 0
  let ssTot = 0

  for (let i = 0; i < n; i++) {
    const pred = a * (g[i] ?? 0) + c

    ssRes += ((y[i] ?? 0) - pred) * ((y[i] ?? 0) - pred)
    ssTot += ((y[i] ?? 0) - mp) * ((y[i] ?? 0) - mp)
  }

  return { a, r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot }
}

// Ordinary least-squares straight-line fit y = slope * x + intercept. Returns the slope, intercept, the sum
// of squared residuals, and the coefficient of determination r2. The general line fit behind log-log slopes,
// area-versus-volume residual contrasts, and conformal central-charge fits.
export function linearFit(input: {
  xs: readonly number[]
  ys: readonly number[]
}): { slope: number; intercept: number; residual: number; r2: number } {
  const { xs, ys } = input
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n

  let cov = 0
  let varx = 0

  for (let i = 0; i < n; i++) {
    cov += ((xs[i] ?? 0) - mx) * ((ys[i] ?? 0) - my)
    varx += ((xs[i] ?? 0) - mx) * ((xs[i] ?? 0) - mx)
  }

  const slope = varx === 0 ? 0 : cov / varx
  const intercept = my - slope * mx

  let residual = 0
  let ssTot = 0

  for (let i = 0; i < n; i++) {
    const pred = slope * (xs[i] ?? 0) + intercept

    residual += ((ys[i] ?? 0) - pred) ** 2
    ssTot += ((ys[i] ?? 0) - my) ** 2
  }

  const r2 = ssTot > 0 ? 1 - residual / ssTot : 0

  return { slope, intercept, residual, r2 }
}

// Inverse-variance weighted straight-line fit y = slope * x + intercept, for measurements that carry
// their own standard errors. Returns the standard errors of both parameters and the chi^2 of the
// fit, so a caller can tell a line the data follow from a line forced through scattered points
// (chi^2 near the number of points minus two for a good fit).
export function weightedLinearFit(input: {
  xs: readonly number[]
  ys: readonly number[]
  errors: readonly number[]
}): {
  slope: number
  intercept: number
  slopeError: number
  interceptError: number
  chi2: number
} {
  const { xs, ys, errors } = input

  let s = 0
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0

  for (let i = 0; i < xs.length; i++) {
    const w = 1 / (errors[i] ?? 1) ** 2
    const x = xs[i] ?? 0
    const y = ys[i] ?? 0

    s += w
    sx += w * x
    sy += w * y
    sxx += w * x * x
    sxy += w * x * y
  }

  const determinant = s * sxx - sx * sx
  const slope = (s * sxy - sx * sy) / determinant
  const intercept = (sxx * sy - sx * sxy) / determinant

  let chi2 = 0

  for (let i = 0; i < xs.length; i++) {
    const residual = (ys[i] ?? 0) - slope * (xs[i] ?? 0) - intercept

    chi2 += (residual / (errors[i] ?? 1)) ** 2
  }

  return {
    slope,
    intercept,
    slopeError: Math.sqrt(s / determinant),
    interceptError: Math.sqrt(sxx / determinant),
    chi2,
  }
}

// Inverse-variance weighted least squares for any model linear in its parameters,
// y_i = sum_k c_k f_k(x_i), given the design rows [f_1(x_i), ..., f_K(x_i)]. Returns the
// coefficients, their standard errors from the inverse normal matrix, and the chi^2. The Cornell
// potential V = V0 - e / R + sigma R is one such model, with rows [1, 1 / R, R].
export function weightedLeastSquares(input: {
  rows: readonly (readonly number[])[]
  ys: readonly number[]
  errors: readonly number[]
}): { coefficients: number[]; errors: number[]; chi2: number } {
  const { rows, ys, errors } = input
  const k = rows[0]?.length ?? 0
  const normal = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const right = new Array<number>(k).fill(0)

  rows.forEach((row, i) => {
    const w = 1 / (errors[i] ?? 1) ** 2

    for (let a = 0; a < k; a++) {
      right[a] = (right[a] ?? 0) + w * (row[a] ?? 0) * (ys[i] ?? 0)

      for (let b = 0; b < k; b++) {
        const line = normal[a]

        if (line !== undefined) {
          line[b] = (line[b] ?? 0) + w * (row[a] ?? 0) * (row[b] ?? 0)
        }
      }
    }
  })

  const inverse = invertSymmetric(normal)
  const coefficients = inverse.map(line =>
    line.reduce((sum, value, b) => sum + value * (right[b] ?? 0), 0),
  )
  const chi2 = rows.reduce((sum, row, i) => {
    const model = row.reduce((s, f, a) => s + f * (coefficients[a] ?? 0), 0)

    return sum + (((ys[i] ?? 0) - model) / (errors[i] ?? 1)) ** 2
  }, 0)

  return {
    coefficients,
    errors: inverse.map((line, a) => Math.sqrt(Math.max(0, line[a] ?? 0))),
    chi2,
  }
}

// Gauss-Jordan inverse with partial pivoting, for the small normal matrices of a fit.
function invertSymmetric(matrix: readonly (readonly number[])[]): number[][] {
  const k = matrix.length
  const work = matrix.map((line, i) => [
    ...line,
    ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0)),
  ])

  for (let column = 0; column < k; column++) {
    let pivot = column

    for (let row = column + 1; row < k; row++) {
      if (Math.abs(work[row]?.[column] ?? 0) > Math.abs(work[pivot]?.[column] ?? 0)) {
        pivot = row
      }
    }

    const hold = work[column] ?? []

    work[column] = work[pivot] ?? []
    work[pivot] = hold

    const head = work[column]?.[column] ?? 0

    if (head === 0) {
      return Array.from({ length: k }, () => new Array<number>(k).fill(Number.NaN))
    }

    for (let row = 0; row < k; row++) {
      if (row === column) {
        continue
      }

      const factor = (work[row]?.[column] ?? 0) / head

      for (let j = 0; j < 2 * k; j++) {
        const line = work[row]

        if (line !== undefined) {
          line[j] = (line[j] ?? 0) - factor * (work[column]?.[j] ?? 0)
        }
      }
    }
  }

  return work.map((line, i) => line.slice(k).map(v => v / (work[i]?.[i] ?? 1)))
}

// Least-squares fit y = slope * x THROUGH THE ORIGIN, no intercept. Returns the slope and the
// coefficient of determination r2 (residuals against the constrained line, total variance about the
// mean). The fit for a strictly linear dispersion E = v q out of a band-touching point, where an
// intercept would hide a gap.
export function proportionalFit(input: {
  xs: readonly number[]
  ys: readonly number[]
}): { slope: number; r2: number } {
  const { xs, ys } = input

  let sxy = 0
  let sxx = 0

  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] ?? 0) * (ys[i] ?? 0)
    sxx += (xs[i] ?? 0) * (xs[i] ?? 0)
  }

  const slope = sxx === 0 ? 0 : sxy / sxx
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  let ssRes = 0
  let ssTot = 0

  for (let i = 0; i < xs.length; i++) {
    ssRes += ((ys[i] ?? 0) - slope * (xs[i] ?? 0)) ** 2
    ssTot += ((ys[i] ?? 0) - my) ** 2
  }

  return { slope, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 }
}

// Ordinary least-squares parabola fit y = a x^2 + b x + c, by the 3x3 normal equations with partial
// pivoting. Returns the coefficients, the sum of squared residuals, and r2. The channel-flow (Poiseuille)
// profile fit: a viscous flow profile across a channel is quadratic in the cross-channel coordinate with
// NEGATIVE curvature a (a centerline maximum), so the sign of `a` and the residual against a flat fit are
// the discriminating numbers.
export function quadraticFit(input: {
  xs: readonly number[]
  ys: readonly number[]
}): { a: number; b: number; c: number; residual: number; r2: number } {
  const { xs, ys } = input
  const n = xs.length

  let s1 = 0
  let s2 = 0
  let s3 = 0
  let s4 = 0
  let t0 = 0
  let t1 = 0
  let t2 = 0

  for (let i = 0; i < n; i++) {
    const x = xs[i] ?? 0
    const y = ys[i] ?? 0
    const xx = x * x

    s1 += x
    s2 += xx
    s3 += xx * x
    s4 += xx * xx
    t0 += y
    t1 += x * y
    t2 += xx * y
  }

  // solve [[s4,s3,s2],[s3,s2,s1],[s2,s1,n]] (a,b,c) = (t2,t1,t0) by Gauss-Jordan with partial pivoting
  const m = [
    [s4, s3, s2, t2],
    [s3, s2, s1, t1],
    [s2, s1, n, t0],
  ]

  for (let col = 0; col < 3; col++) {
    let pivot = col

    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(m[row]![col]!) > Math.abs(m[pivot]![col]!)) {
        pivot = row
      }
    }

    const hold = m[col]!

    m[col] = m[pivot]!
    m[pivot] = hold

    const head = m[col]![col]!

    if (head === 0) {
      return { a: 0, b: 0, c: 0, residual: 0, r2: 0 }
    }

    for (let row = 0; row < 3; row++) {
      if (row === col) {
        continue
      }

      const factor = m[row]![col]! / head

      for (let k = col; k < 4; k++) {
        m[row]![k]! -= factor * m[col]![k]!
      }
    }
  }

  const a = m[0]![3]! / m[0]![0]!
  const b = m[1]![3]! / m[1]![1]!
  const c = m[2]![3]! / m[2]![2]!
  const mean = t0 / n

  let residual = 0
  let ssTot = 0

  for (let i = 0; i < n; i++) {
    const x = xs[i] ?? 0
    const y = ys[i] ?? 0
    const predicted = a * x * x + b * x + c

    residual += (y - predicted) ** 2
    ssTot += (y - mean) ** 2
  }

  return {
    a,
    b,
    c,
    residual,
    r2: ssTot > 0 ? 1 - residual / ssTot : 0,
  }
}

// The log-log exponent of a series indexed by step, fit over an inclusive index window [lo, hi]. Fits
// log(t) versus log(values[t]) and returns the slope, dropping non-positive samples (no log). The
// mean-square-displacement exponent z (ballistic ~ 2, diffusive ~ 1) is read off this way.
export function loglogExponentWindow(input: {
  values: readonly number[]
  lo: number
  hi: number
}): number {
  const { values, lo, hi } = input

  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0

  for (let t = lo; t <= hi; t++) {
    if ((values[t] ?? 0) <= 0) {
      continue
    }

    const x = Math.log(t)
    const y = Math.log(values[t]!)

    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }

  // Guard the degenerate fit (fewer than two usable points, or a zero-variance x
  // window) the same way powerLawExponent does, so a flat or empty window returns a
  // defined 0 instead of letting a NaN propagate into a verdict.
  const denominator = m * sxx - sx * sx

  return m > 1 && denominator !== 0
    ? (m * sxy - sx * sy) / denominator
    : 0
}

// A power-law fit over (x, y) in log-log space: the slope (exponent) plus the largest
// deviation of any sample from the fit line, measured in log y. A small maxDeviation
// means the data hug a single power law with no special or critical point, the
// "is this a clean power law" measure.
export function powerLawFit(input: {
  xs: readonly number[]
  ys: readonly number[]
}): { exponent: number; maxDeviation: number } {
  const { xs, ys } = input
  const logX = xs.map(x => Math.log(x))
  const logY = ys.map(y => Math.log(y))
  const n = logX.length
  const meanX = logX.reduce((a, b) => a + b, 0) / n
  const meanY = logY.reduce((a, b) => a + b, 0) / n

  let cov = 0
  let varx = 0

  for (let i = 0; i < n; i++) {
    cov += (logX[i]! - meanX) * (logY[i]! - meanY)
    varx += (logX[i]! - meanX) * (logX[i]! - meanX)
  }

  // varx is 0 only when every x is identical (a single distinct radius), where no
  // exponent is defined; return 0 rather than a NaN, matching the other fits.
  const exponent = varx === 0 ? 0 : cov / varx

  let maxDeviation = 0

  for (let i = 0; i < n; i++) {
    const predicted = meanY + exponent * (logX[i]! - meanX)

    maxDeviation = Math.max(
      maxDeviation,
      Math.abs(logY[i]! - predicted),
    )
  }

  return { exponent, maxDeviation }
}

// The local force-law exponent d ln(force) / d ln(r) of a potential at radius r, where force = -dG/dr.
// Both the force (a central difference of the potential) and the exponent (a centered log-log slope
// across r) are taken numerically. An inverse-square force gives -2, a 4D short-range force gives -3.
export function localForceLawExponent(input: {
  potential: (r: number) => number
  r: number
  derivativeFraction?: number
  exponentFraction?: number
}): number {
  const { potential, r } = input
  const h = r * (input.derivativeFraction ?? 0.01)
  const force = (rr: number): number =>
    -(potential(rr + h) - potential(rr - h)) / (2 * h)

  const f = input.exponentFraction ?? 0.05

  return (
    (Math.log(force(r * (1 + f))) - Math.log(force(r * (1 - f)))) /
    (Math.log(r * (1 + f)) - Math.log(r * (1 - f)))
  )
}
