// Lowest eigenpairs (values AND vectors) of a symmetric LinearOperator by shifted power iteration
// with deflation. Power iterating on A = cI - H converges to the eigenvector of the LARGEST A
// eigenvalue, which is the LOWEST H eigenvalue once the shift c bounds the spectrum from above.
// Deflating each converged vector out of the next start gives the next-lowest, and so on. Used by
// the bound-state experiment, which needs the eigenVECTORS (to measure the wavefunction spread),
// not just the eigenvalues the Lanczos routine returns.

import { LinearOperator } from '@/code/algebra/linear/sparse'
import { makeRng } from '@/code/tool/rng'

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += a[i]! * b[i]!
  }

  return s
}

function normalize(a: Float64Array): void {
  const n = Math.sqrt(dot(a, a))

  for (let i = 0; i < a.length; i++) {
    a[i]! /= n || 1
  }
}

export interface Eigenpair {
  energy: number
  state: Float64Array
}

// The lowest `count` eigenpairs (ascending) of `operator`. `shift` is the spectral upper bound c
// so that cI - H is positive (callers compute it from the operator's diagonal / band). `seed`
// seeds the deterministic start vectors; `iterations` is the power-iteration count per pair.
export function lowestEigenpairs(input: {
  operator: LinearOperator
  count: number
  shift: number
  seed: number
  iterations?: number
}): Eigenpair[] {
  const { operator, count, shift } = input
  const iterations = input.iterations ?? 1500
  const n = operator.size
  const found: Eigenpair[] = []

  for (let j = 0; j < count; j++) {
    let phi = new Float64Array(n)

    const rng = makeRng({ seed: input.seed + j * 7919 })

    for (let r = 0; r < n; r++) {
      phi[r] = rng.next() - 0.5
    }

    normalize(phi)

    for (let iter = 0; iter < iterations; iter++) {
      const hPhi = operator.apply({ x: phi })
      const next = new Float64Array(n)

      for (let r = 0; r < n; r++) {
        next[r] = shift * phi[r]! - hPhi[r]!
      }

      for (const f of found) {
        const proj = dot(next, f.state)

        for (let r = 0; r < n; r++) {
          next[r]! -= proj * f.state[r]!
        }
      }

      normalize(next)
      phi = next
    }

    const energy = dot(phi, operator.apply({ x: phi }))
    found.push({ energy, state: phi })
  }

  return found
}
