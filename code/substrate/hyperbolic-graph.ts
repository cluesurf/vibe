// Hyperbolic random graph: random (so possibly Lorentz-safe) yet hyperbolic (so
// exponential reach). The both-worlds candidate where P3 is decided. Sprinkle the
// hyperbolic disc with the hyperbolic area measure, then connect by hyperbolic
// proximity.

import { Rng } from '~/core/rng'
import { Embedding, ManifoldSpec } from '~/core/embedding'
import { Graph, makeGraph } from '~/core/graph'

export function hyperbolicGraph(input: {
  count: number
  radius: number
  connectThreshold: number
  rng: Rng
}): Graph {
  const n = input.count
  const R = input.radius

  const r = new Float64Array(n)
  const theta = new Float64Array(n)

  // coshR - 1 is the normalizing constant of the radial inverse-CDF. The
  // hyperbolic area measure has density proportional to sinh(r) on [0, R], whose
  // CDF inverts to r = arccosh(1 + u * (cosh R - 1)).
  const coshRminus1 = Math.cosh(R) - 1

  for (let i = 0; i < n; i++) {
    const u = input.rng.next()
    r[i] = Math.acosh(1 + u * coshRminus1)
    theta[i] = input.rng.next() * 2 * Math.PI
  }

  // Connect by hyperbolic proximity using the hyperbolic law of cosines:
  // cosh(d) = cosh(r1) cosh(r2) - sinh(r1) sinh(r2) cos(theta1 - theta2).
  const coshThreshold = Math.cosh(input.connectThreshold)
  const neighbors: number[][] = []
  for (let i = 0; i < n; i++) {
    neighbors.push([])
  }

  const coshR = new Float64Array(n)
  const sinhR = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    coshR[i] = Math.cosh(r[i] ?? 0)
    sinhR[i] = Math.sinh(r[i] ?? 0)
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dTheta = (theta[i] ?? 0) - (theta[j] ?? 0)
      const coshD =
        (coshR[i] ?? 0) * (coshR[j] ?? 0) -
        (sinhR[i] ?? 0) * (sinhR[j] ?? 0) * Math.cos(dTheta)
      // coshD < coshThreshold iff hyperbolic distance < connectThreshold,
      // since cosh is monotone increasing on [0, inf).
      if (coshD < coshThreshold) {
        neighbors[i]?.push(j)
        neighbors[j]?.push(i)
      }
    }
  }

  // Poincare-disc embedding: map (r, theta) to disc coords via the standard
  // radial compression x = tanh(r / 2) cos(theta), y = tanh(r / 2) sin(theta).
  // Dimension 2, no time axis (signature riemannian).
  const dimension = 2
  const coords = new Float64Array(n * dimension)
  for (let i = 0; i < n; i++) {
    const rho = Math.tanh((r[i] ?? 0) / 2)
    coords[i * dimension] = rho * Math.cos(theta[i] ?? 0)
    coords[i * dimension + 1] = rho * Math.sin(theta[i] ?? 0)
  }

  const manifold: ManifoldSpec = {
    form: 'hyperbolic',
    dimension: 2,
    curvature: -1,
  }
  const embedding: Embedding = {
    form: 'embedding',
    dimension,
    signature: 'riemannian',
    coords,
    manifold,
  }

  return makeGraph({ size: n, directed: false, neighbors, embedding })
}
