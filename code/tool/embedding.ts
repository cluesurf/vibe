// Optional provenance for a substrate that came from sprinkling a manifold.
// Coordinates are output only, used for validation and measurement (the Lorentz
// test), never read by a rule. This keeps the base discrete: real numbers are a
// measured shadow, not the foundation.

export type ElementId = number

export type WaveProfile = {
  readonly form: 'sech-squared'
  readonly amplitude: number
  readonly width: number
}

export type ManifoldSpec =
  | { readonly form: 'minkowski'; readonly dimension: number }
  | {
      readonly form: 'hyperbolic'
      readonly dimension: number
      readonly curvature: number
    }
  | {
      readonly form: 'desitter'
      readonly dimension: number
      readonly hubble: number
    }
  | {
      readonly form: 'wave-burst'
      readonly dimension: number
      readonly profile: WaveProfile
    }

export type Embedding = {
  readonly form: 'embedding'
  readonly dimension: number // spacetime dimension d
  readonly signature: 'lorentzian' | 'riemannian'
  // size * dimension, row major. coords[i * dimension] is the time axis.
  readonly coords: Float64Array
  readonly manifold: ManifoldSpec
}

export function coordOf(
  e: Embedding,
  input: { element: number; axis: number },
): number {
  return e.coords[input.element * e.dimension + input.axis] ?? 0
}
