// Least-squares regression measures used to read off scaling exponents from
// experiment data. The log-log slope is the power-law exponent: fit a line to
// (log x, log y) and return its slope. A flat profile gives zero, a 1/x falloff
// gives -1, and so on.

export function logLogSlope(xs: number[], ys: number[]): number {
  const lx = xs.map((x) => Math.log(x))
  const ly = ys.map((y) => Math.log(y))
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
  times: ReadonlyArray<number>
  spreads: ReadonlyArray<number>
}): number {
  const { times, spreads } = input
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0
  for (let i = 0; i < times.length; i++) {
    if ((spreads[i] ?? 0) <= 0) continue
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
  xs: ReadonlyArray<number>
  ys: ReadonlyArray<number>
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

// The log-log exponent of a series indexed by step, fit over an inclusive index window [lo, hi]. Fits
// log(t) versus log(values[t]) and returns the slope, dropping non-positive samples (no log). The
// mean-square-displacement exponent z (ballistic ~ 2, diffusive ~ 1) is read off this way.
export function loglogExponentWindow(input: {
  values: ReadonlyArray<number>
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
    if ((values[t] ?? 0) <= 0) continue
    const x = Math.log(t)
    const y = Math.log(values[t]!)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }
  return (m * sxy - sx * sy) / (m * sxx - sx * sx)
}
