// Bloch band functions for tight-binding models on periodic 2D lattices, in
// momentum space. The honeycomb two-site model is the graphene Hamiltonian
// H(k) = [[m, f(k)], [conj(f(k)), -m]] with off-diagonal hopping sum
// f(k) = 1 + exp(i k.a1) + exp(i k.a2), whose bands are E = +-sqrt(|f|^2 + m^2)
// (Wallace 1947, Semenoff 1984). The square single-site band cos kx + cos ky is
// the standard comparison substrate. Hopping t = 1 and nearest-neighbour
// distance a = 1 throughout, so every energy is in units of t and every
// momentum in units of 1/a.

import {
  Complex,
  cAbs,
  cAdd,
  cFromPhase,
} from '@/code/algebra/linear/complex'

export type Vector2 = {
  x: number
  y: number
}

// The two primitive lattice vectors of the honeycomb Bravais lattice, for
// nearest-neighbour distance 1 (so the Bravais lattice constant is sqrt(3)).
export const honeycombLatticeVectors: { a1: Vector2; a2: Vector2 } = {
  a1: { x: 3 / 2, y: Math.sqrt(3) / 2 },
  a2: { x: 3 / 2, y: -Math.sqrt(3) / 2 },
}

// The reciprocal basis of any 2D Bravais lattice: b_i . a_j = 2 pi delta_ij.
export function reciprocalVectors(input: {
  a1: Vector2
  a2: Vector2
}): { b1: Vector2; b2: Vector2 } {
  const { a1, a2 } = input
  const det = a1.x * a2.y - a1.y * a2.x
  const c = (2 * Math.PI) / det

  return {
    b1: { x: c * a2.y, y: -c * a2.x },
    b2: { x: -c * a1.y, y: c * a1.x },
  }
}

// The off-diagonal Bloch amplitude f(k) = 1 + exp(i k.a1) + exp(i k.a2) of the
// honeycomb two-site unit cell, at a Cartesian momentum.
export function honeycombBlochF(input: {
  kx: number
  ky: number
}): Complex {
  const { kx, ky } = input
  const { a1, a2 } = honeycombLatticeVectors
  const one: Complex = { re: 1, im: 0 }
  const hop1 = cFromPhase({ phase: kx * a1.x + ky * a1.y })
  const hop2 = cFromPhase({ phase: kx * a2.x + ky * a2.y })

  return cAdd(cAdd(one, hop1), hop2)
}

// The positive band energy E(k) = sqrt(|f(k)|^2 + m^2) of the honeycomb model
// with a staggered on-site mass m (the Semenoff term, +m on sublattice A and
// -m on B). With m = 0 this is the massless graphene band |f(k)|.
export function honeycombBandEnergy(input: {
  kx: number
  ky: number
  mass?: number
}): number {
  const mass = input.mass ?? 0

  return Math.hypot(
    cAbs(honeycombBlochF({ kx: input.kx, ky: input.ky })),
    mass,
  )
}

// The same off-diagonal amplitude in reciprocal fractions, k = s1 b1 + s2 b2,
// where it reads f = 1 + exp(2 pi i s1) + exp(2 pi i s2). The Brillouin zone
// is the unit torus (s1, s2) in [0, 1)^2, which is what the zero scans walk.
export function honeycombBlochFTorus(input: {
  s1: number
  s2: number
}): Complex {
  const one: Complex = { re: 1, im: 0 }
  const hop1 = cFromPhase({ phase: 2 * Math.PI * input.s1 })
  const hop2 = cFromPhase({ phase: 2 * Math.PI * input.s2 })

  return cAdd(cAdd(one, hop1), hop2)
}

// The two inequivalent Dirac points K and K' in Cartesian momentum,
// constructed from their reciprocal fractions (1/3, 2/3) and (2/3, 1/3),
// where 1 + exp(2 pi i s1) + exp(2 pi i s2) = 1 + exp(2 pi i / 3)
// + exp(4 pi i / 3) = 0. Nothing is hardcoded in Cartesian form, the
// coordinates come out of the reciprocal basis.
export function honeycombDiracPoints(): Vector2[] {
  const { b1, b2 } = reciprocalVectors(honeycombLatticeVectors)
  const fractions: [number, number][] = [
    [1 / 3, 2 / 3],
    [2 / 3, 1 / 3],
  ]

  return fractions.map(([s1, s2]) => ({
    x: s1 * b1.x + s2 * b2.x,
    y: s1 * b1.y + s2 * b2.y,
  }))
}

// The single-site square-lattice band cos kx + cos ky (nearest-neighbour
// hopping, energy measured from half filling). Its zero set is the diamond
// Fermi LINE |kx| + |ky| = pi, not isolated points, which is what makes it the
// negative control against the honeycomb cones.
export function squareLatticeBand(input: {
  kx: number
  ky: number
}): number {
  return Math.cos(input.kx) + Math.cos(input.ky)
}
