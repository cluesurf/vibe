// A WALKABLE tiling, abstract over HOW its cells come into being. This is the seam the cellwalker rides on, so
// the same navigation code drives an eager finite cell graph, a LAZY infinite one that grows as you walk, or
// (Phase 2) a Margenstern address grid. Cells are integer handles, assigned as they are discovered, so the
// space can be unbounded, ids just keep counting up.
//
// Faces (edges in 2D, facets in 3D) are indexed by a local SPIN 0..degree-1. In 2D the spin is the cyclic
// edge index around the cell (counterclockwise), so rotating the spin turns to the next edge, exactly the
// HyperRogue cellwalker convention. Each step is self-reciprocal, stepping across a face and then back across
// the reciprocal face returns to the start. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

export interface FaceStep {
  // the neighbor cell reached across this face
  readonly cell: number
  // the spin at the neighbor that points back across the same face, so wstep can re-seat
  readonly back: number
  // whether the step flips local orientation (always false for orientable {p,q} tilings, reserved for the
  // non-orientable arbitrary tilings Phase 2 loads from .tes)
  readonly mirror: boolean
}

export interface TileSource {
  // the Schlafli symbol this tiling realizes, e.g. [7,3]
  readonly symbol: number[]
  // the starting cell, handle 0
  readonly origin: number
  // how many faces this cell has (constant for a regular tiling)
  degree(cell: number): number
  // the cell center in the Poincare ball/disk, for rendering and for measuring direction
  position(cell: number): number[]
  // step across the face at local spin, generating the neighbor on demand if it does not exist yet
  step(cell: number, spin: number): FaceStep
  // how many cells have been materialized so far (grows as you walk a lazy tiling)
  readonly size: number
}
