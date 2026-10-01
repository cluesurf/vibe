// THE LOWEST EIGENPAIR OF A LARGE SYMMETRIC OPERATOR, BY EXPLICITLY RESTARTED LANCZOS (E-SPN-0185, E-SPN-0186). The
// operator is matrix free and symmetric for a caller's inner product (code/measure/gauss-orbit's orbit-weighted one);
// memory is `steps` vectors, not the whole Krylov history (eig-lanczos keeps every basis vector and returns values
// only). Each cycle runs `steps` Lanczos steps from the current vector with full reorthogonalization inside the cycle,
// diagonalizes the tridiagonal, and restarts from the lowest Ritz vector, until the Ritz residual estimate
// beta_m |s_m| falls under the tolerance; the returned residual is then measured with one more application,
// ||A x - lambda x||.
//
// DETERMINISM: the start vector is the caller's (no random numbers here). An optional `project` is applied after every
// application (a symmetry projection that the operator commutes with, against rounding drift).

import { symmetricEigen } from '@/code/measure/quantum-ladder'

export type LowestPair = {
  value: number
  vector: Float64Array
  residual: number
  applications: number
  cycles: number
  // the second Ritz value of the last cycle (an estimate of the next level inside the start's symmetry sector)
  next: number
}

export function lowestPair(input: {
  size: number
  apply: (x: Float64Array, out: Float64Array) => void
  inner: (a: Float64Array, b: Float64Array) => number
  start: Float64Array
  steps: number
  tolerance: number
  cycles: number
  project?: (v: Float64Array) => void
  log?: (line: string) => void
}): LowestPair {
  const { size, apply, inner, steps } = input

  const scale = (v: Float64Array, s: number): void => {
    for (let i = 0; i < size; i++) {
      v[i] = v[i]! * s
    }
  }

  const axpy = (y: Float64Array, a: number, x: Float64Array): void => {
    for (let i = 0; i < size; i++) {
      y[i] = y[i]! + a * x[i]!
    }
  }

  let x = Float64Array.from(input.start)

  input.project?.(x)
  scale(x, 1 / Math.sqrt(inner(x, x)))

  let applications = 0
  let value = NaN
  let next = NaN
  let cycle = 0

  const w = new Float64Array(size)

  for (cycle = 1; cycle <= input.cycles; cycle++) {
    const basis: Float64Array[] = [x]
    const alpha: number[] = []
    const beta: number[] = []

    for (let j = 0; j < steps; j++) {
      const v = basis[j]!

      apply(v, w)
      applications++
      input.project?.(w)

      const a = inner(w, v)

      alpha.push(a)

      // full reorthogonalization against the cycle's basis, twice; then the projection once more and a third pass, so
      // that rounding left outside the projected space cannot grow into a basis vector when w is small (such a vector
      // has <w, A w> near 0 and made a spurious Ritz value of 0 on the unfixed register)
      for (let pass = 0; pass < 3; pass++) {
        if (pass === 2) {
          input.project?.(w)
        }

        for (const b of basis) {
          axpy(w, -inner(w, b), b)
        }
      }

      const nb = Math.sqrt(inner(w, w))

      // an invariant subspace to rounding: stop the cycle (the relative test keeps noise from becoming a direction)
      if (j + 1 === steps || nb < 1e-10 * (Math.abs(a) + 1)) {
        beta.push(nb)
        break
      }

      beta.push(nb)

      const u = Float64Array.from(w)

      scale(u, 1 / nb)
      basis.push(u)
    }

    const m = alpha.length
    const T = new Float64Array(m * m)

    for (let j = 0; j < m; j++) {
      T[j * m + j] = alpha[j]!

      if (j + 1 < m) {
        T[j * m + j + 1] = beta[j]!
        T[(j + 1) * m + j] = beta[j]!
      }
    }

    const e = symmetricEigen(m, T)
    const s = Float64Array.from({ length: m }, (_, j) => e.vectors[j * m]!)
    const estimate = Math.abs(beta[m - 1]! * s[m - 1]!)

    value = e.values[0]!
    next = m > 1 ? e.values[1]! : NaN

    const y = new Float64Array(size)

    for (let j = 0; j < m; j++) {
      axpy(y, s[j]!, basis[j]!)
    }

    input.project?.(y)
    scale(y, 1 / Math.sqrt(inner(y, y)))
    x = y
    input.log?.(
      `lanczos cycle ${cycle}: ${m} steps, value ${value.toFixed(10)}, next ${next.toFixed(6)}, estimate ${estimate.toExponential(2)}`,
    )

    if (estimate <= input.tolerance) {
      break
    }
  }

  apply(x, w)
  applications++

  const lam = inner(w, x)

  axpy(w, -lam, x)

  return {
    value: lam,
    vector: x,
    residual: Math.sqrt(inner(w, w)),
    applications,
    cycles: Math.min(cycle, input.cycles),
    next,
  }
}
