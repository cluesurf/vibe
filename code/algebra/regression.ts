// Ordinary least-squares straight-line fit y = slope * x + intercept. Returns the
// slope, intercept, the sum of squared residuals, and the coefficient of
// determination r2. The single most reinvented numeric routine across the scaling
// experiments (log-log slopes, area-versus-volume residual contrasts, conformal
// central-charge fits all reduce to this).

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
