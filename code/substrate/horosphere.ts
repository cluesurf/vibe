// Horosphere and cusp helpers, the geometry of the bulk-to-cusp projection. Every {5,3,4} render and a few
// experiments reinlined these (the ideal direction, the Busemann height field, the projection basis, the
// horocyclic un-crushing map, the band extraction). One home, built on the real-vector kit. Coordinates are
// Poincare-ball points (norm < 1), as produced by cell-direct.

import {
  type Vec,
  dot,
  norm,
  normalize,
  sub,
} from '@/code/algebra/vector'

// The ideal point (direction) of the farthest cell, the boundary point a cusp sits at.
export function idealDirection(coords: Vec[]): Vec {
  let far = 0
  let farR = -1

  for (let i = 0; i < coords.length; i++) {
    const r = norm(coords[i]!)

    if (r > farR) {
      farR = r
      far = i
    }
  }

  const fc = coords[far]!

  return normalize(fc)
}

// The Busemann height of each cell toward the ideal point xi, b(x) = log(|x - xi|^2 / (1 - |x|^2)). Level
// sets are horospheres tangent at xi.
export function busemann(input: {
  coords: Vec[]
  ideal: Vec
}): number[] {
  const { coords, ideal } = input

  return coords.map(x => {
    let d2 = 0

    for (let k = 0; k < x.length; k++) {
      d2 += (x[k]! - ideal[k]!) ** 2
    }

    return Math.log(d2 / Math.max(1e-12, 1 - dot(x, x)))
  })
}

// An orthonormal basis of the plane perpendicular to the ideal direction (dim - 1 vectors), the chart of the
// horosphere.
export function horoFrame(ideal: Vec): Vec[] {
  const dim = ideal.length
  const basis: Vec[] = []
  // Gram-Schmidt the standard axes against xi and against each other, keep the dim-1 best ones
  const axes = Array.from({ length: dim }, (_, k) => k).sort(
    (a, b) => Math.abs(ideal[a]!) - Math.abs(ideal[b]!),
  )

  for (const k of axes) {
    let v: Vec = Array.from({ length: dim }, (_, i) =>
      i === k ? 1 : 0,
    )

    v = sub(v, ideal, dot(v, ideal))

    for (const e of basis) {
      v = sub(v, e, dot(v, e))
    }

    if (norm(v) > 1e-9) {
      basis.push(normalize(v))
    }

    if (basis.length === dim - 1) {
      break
    }
  }

  return basis
}

// The horocyclic flat coordinate of a point, invert about the ideal point (un-crushes the hyperbolic
// crowding near xi), then project onto the horosphere frame. Returns one coordinate per frame vector.
export function horocyclicProject(input: {
  point: Vec
  ideal: Vec
  frame: Vec[]
}): number[] {
  const d = sub(input.point, input.ideal)
  const dd = dot(d, d) || 1e-9
  const inv = d.map(x => x / dd)

  return input.frame.map(e => dot(inv, e))
}

// The cells of a thin band around a Busemann level, the cusp slice (their indices into the coords array).
export function extractBand(input: {
  busemann: number[]
  level?: number
  half?: number
}): number[] {
  const level = input.level ?? 0
  const half = input.half ?? 0.5
  const out: number[] = []

  for (let i = 0; i < input.busemann.length; i++) {
    if (Math.abs(input.busemann[i]! - level) < half) {
      out.push(i)
    }
  }

  return out
}
