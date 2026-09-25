// Multi-shift conjugate gradient: solve (A + sigma_s) x_s = b for several shifts sigma_s at the cost
// of one Krylov sequence, A Hermitian positive semi-definite. The Krylov space of A + sigma is the
// same for every sigma, so the shifted solutions are read off the base iteration by the
// recurrences of Jegerlehner (hep-lat/9612014). The smallest shift is the hardest system and drives
// the convergence.
//
// Vectors are complex, interleaved (re, im) in a Float64Array. A must be Hermitian, so every inner
// product the iteration needs is real.

export type LinearMap = (input: { from: Float64Array; out: Float64Array }) => void

function realDot(a: Float64Array, b: Float64Array): number {
  let total = 0

  for (let k = 0; k < a.length; k++) {
    total += (a[k] ?? 0) * (b[k] ?? 0)
  }

  return total
}

export type MultiShiftResult = {
  // one solution per shift, in the order the shifts were given
  readonly solutions: Float64Array[]
  readonly iterations: number
  // |b - (A + sigma_s) x_s| / |b|, recomputed from the solutions, not from the recurrence
  readonly residuals: number[]
}

export function multiShiftConjugateGradient(input: {
  apply: LinearMap
  source: Float64Array
  shifts: readonly number[]
  tolerance: number
  maxIterations: number
}): MultiShiftResult {
  const { apply, source, shifts, tolerance, maxIterations } = input
  const length = source.length
  const base = Math.min(...shifts)
  const deltas = shifts.map(shift => shift - base)
  const baseApply = (from: Float64Array, out: Float64Array): void => {
    apply({ from, out })

    for (let k = 0; k < length; k++) {
      out[k] = (out[k] ?? 0) + base * (from[k] ?? 0)
    }
  }

  const x = shifts.map(() => new Float64Array(length))
  const p = shifts.map(() => new Float64Array(source))
  const r = new Float64Array(source)
  const baseP = new Float64Array(source)
  const q = new Float64Array(length)
  const zetaPrevious = shifts.map(() => 1)
  const zeta = shifts.map(() => 1)
  const active = shifts.map(() => true)
  const sourceNorm = Math.sqrt(realDot(source, source)) || 1

  let rr = realDot(r, r)
  let alphaPrevious = 1
  let betaPrevious = 0
  let iterations = 0

  for (; iterations < maxIterations; iterations++) {
    if (Math.sqrt(rr) / sourceNorm < tolerance) {
      break
    }

    baseApply(baseP, q)

    const alpha = rr / realDot(baseP, q)

    for (let k = 0; k < length; k++) {
      r[k] = (r[k] ?? 0) - alpha * (q[k] ?? 0)
    }

    const rrNext = realDot(r, r)
    const beta = rrNext / rr

    shifts.forEach((_, s) => {
      if (!active[s]) {
        return
      }

      const delta = deltas[s] ?? 0
      const z = zeta[s] ?? 1
      const zp = zetaPrevious[s] ?? 1
      const zNext =
        (z * zp * alphaPrevious) /
        (alpha * betaPrevious * (zp - z) + zp * alphaPrevious * (1 + delta * alpha))
      const alphaShift = (alpha * zNext) / z
      const betaShift = beta * (zNext / z) ** 2
      const xs = x[s] ?? new Float64Array(0)
      const ps = p[s] ?? new Float64Array(0)

      for (let k = 0; k < length; k++) {
        xs[k] = (xs[k] ?? 0) + alphaShift * (ps[k] ?? 0)
        ps[k] = zNext * (r[k] ?? 0) + betaShift * (ps[k] ?? 0)
      }

      zetaPrevious[s] = z
      zeta[s] = zNext

      // a shifted residual is zeta times the base residual, so a converged shift stops early
      if ((Math.abs(zNext) * Math.sqrt(rrNext)) / sourceNorm < tolerance) {
        active[s] = false
      }
    })

    for (let k = 0; k < length; k++) {
      baseP[k] = (r[k] ?? 0) + beta * (baseP[k] ?? 0)
    }

    alphaPrevious = alpha
    betaPrevious = beta
    rr = rrNext
  }

  const residuals = shifts.map((shift, s) => {
    const xs = x[s] ?? new Float64Array(0)

    apply({ from: xs, out: q })

    let norm = 0

    for (let k = 0; k < length; k++) {
      const difference = (source[k] ?? 0) - (q[k] ?? 0) - shift * (xs[k] ?? 0)

      norm += difference * difference
    }

    return Math.sqrt(norm) / sourceNorm
  })

  return { solutions: x, iterations, residuals }
}
