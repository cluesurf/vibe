// The renderer-agnostic intermediate representation (the "scene").
//
// A generator (honeycomb, tiling, wave field, ...) produces a Scene. A renderer ADAPTER (the node rasterizer,
// a future three.js / react adapter, a future webgpu adapter) consumes a Scene and draws it. Keeping this
// middle layer plain (no three.js, no react, no GPU types) is what lets one geometry feed many renderers.
//
// All positions are points in the Poincare ball or disk, so each coordinate array has length `dim` (2 for a
// tiling, 3 for a honeycomb) and a norm below 1. The boundary of the ball is the sphere/circle at infinity.

// a point in the Poincare ball or disk, length equal to the scene's dim
export type Vec = number[]

// a struct (edge) of the tessellation, two endpoints in the ball
export type SceneEdge = {
  a: Vec
  b: Vec
}

// a filled cell face, its boundary vertices in cyclic order (ball points) and a fill color. Used to color
// cells by a cellular-automaton state, the "see the computer animating" view.
export type SceneFace = {
  polygon: Vec[]
  color: [number, number, number]
}

// a generated tessellation ready to render
export type Scene = {
  // the ball dimension, 2 for a tiling (disk) or 3 for a honeycomb (ball)
  dim: number
  // the Schlafli symbol that produced it, e.g. [7,3] or [5,3,4]
  symbol: number[]
  // every edge (strut) of the tessellation
  edges: SceneEdge[]
  // optional filled cell faces (for cellular-automaton coloring), drawn under the edges
  faces?: SceneFace[]
  // how many cells were enumerated to build it
  cellCount: number
  // each cell's center in the ball (same recentering and orientation as the edges), the lattice points. The
  // central cell's center is the origin. Used to find the translation period for a seamless walking loop.
  centers?: Vec[]
}

// the Euclidean norm of a ball point
export function ballNorm(v: Vec): number {
  let s = 0
  for (const x of v) {
    s += x * x
  }
  return Math.sqrt(s)
}
