// Geodesics of an effective metric, traced as rays in a graded-index medium. A ray entering a region
// of varying refractive index n(x, y) bends toward higher index, following the graded-index ray
// equation d(n t)/ds = grad n. With an index field built from a mass potential this is gravitational
// lensing: the deflection of light by an effective metric. The caller supplies the index field and its
// gradient, so the integrator stays a pure dynamics independent of the chosen potential.

type Vector2 = [number, number]

// Trace a ray entering from the left edge (x = -halfLength) at height `impact`, moving in +x, and
// integrate the graded-index ray equation through the medium. Returns the final tangent direction.
// The tangent is renormalized each step so the ray stays unit-speed. Bending toward a mass at the
// origin shows up as the tangent turning toward it.
export function traceGradedIndexRay(input: {
  impact: number
  index: (x: number, y: number) => number
  indexGradient: (x: number, y: number) => Vector2
  halfLength?: number
  step?: number
}): { tangentX: number; tangentY: number; x: number; y: number } {
  const halfLength = input.halfLength ?? 40
  const step = input.step ?? 0.02
  let x = -halfLength
  let y = input.impact
  let tx = 1
  let ty = 0
  const steps = Math.floor((2 * halfLength) / step)
  for (let s = 0; s < steps && x < halfLength; s++) {
    const n = input.index(x, y)
    const [gx, gy] = input.indexGradient(x, y)
    const dot = tx * gx + ty * gy
    // turn the tangent toward the perpendicular component of grad n, scaled by 1/n
    tx += ((gx - tx * dot) / n) * step
    ty += ((gy - ty * dot) / n) * step
    const norm = Math.hypot(tx, ty)
    tx /= norm
    ty /= norm
    x += tx * step
    y += ty * step
  }

  return { tangentX: tx, tangentY: ty, x, y }
}

// The deflection of a ray crossing the medium, the angle it turns away from its incoming +x heading.
// A ray entering above the origin (ty = 0) and bending toward a mass there ends with ty negative, so
// the deflection toward the mass is -ty. Positive means it bent toward the matter.
export function rayDeflection(input: {
  impact: number
  index: (x: number, y: number) => number
  indexGradient: (x: number, y: number) => Vector2
  halfLength?: number
  step?: number
}): number {
  return -traceGradedIndexRay(input).tangentY
}

// The softened 1/r refractive-index field of a point mass at the origin and its analytic gradient:
//   n(x, y) = 1 + mass / (r + soft),   r = hypot(x, y),
// the standard effective-metric / weak-lensing index built from a softened Newtonian potential. The
// softening keeps the well finite at the centre. Higher near the mass, so rays bend toward it.
export function softenedMassIndexField(input: {
  mass: number
  soft?: number
}): {
  index: (x: number, y: number) => number
  indexGradient: (x: number, y: number) => Vector2
} {
  const { mass } = input
  const soft = input.soft ?? 1

  return {
    index: (x, y) => 1 + mass / (Math.hypot(x, y) + soft),
    indexGradient: (x, y) => {
      const r = Math.hypot(x, y)
      if (r < 1e-9) {
        return [0, 0]
      }

      const g = -mass / ((r + soft) * (r + soft))

      return [g * (x / r), g * (y / r)]
    },
  }
}
