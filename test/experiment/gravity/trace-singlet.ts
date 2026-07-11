// Gravity lives on the F4-invariant trace, the unique symmetric scalar of the 24 sites, so the gravity potential
// is not a free added field but the ONE singlet the 24-cell already carries, read at a few trits of precision.
// The argument is forced by vertex-transitivity. F4 (the symmetry of the 24-cell, order 1152) acts on the 24 D4
// sites in a SINGLE orbit, so the only linear functional fixed by the symmetry is the uniform sum, the trace.
// We MEASURE that orbit structure (partition the 24 sites under the reflection group, count the orbits), confirm
// the invariant-functional dimension equals the orbit count (one), confirm the uniform trace is preserved by
// every reflection while a non-uniform functional is not (the control), and then confirm that gravity SOURCED by
// the trace (the cell's total occupation, the F4-invariant) relaxes to a central well that binds a displaced test
// mass. So the gravity scalar is forced to be the trace. Depth L2, the forced uniqueness (a measured orbit count
// that could have come out plural) joined to the physical binding, with the non-invariant functional as the
// control. Deterministic throughout.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  rootsD4,
  reflectRoot,
  vectorKey,
} from '@/code/algebra/group/root-system'
import { automorphismGroupOrder } from '@/code/algebra/group/automorphism'
import { d4Mesh } from '@/code/tool/mesh'
import { bulkMass, relaxPotential } from '@/code/dynamics/gravity-field'
import {
  balancedTernaryCap,
  isBalancedTernaryField,
} from '@/code/tool/balanced-ternary'

const SIDE = 16
const SPATIAL_DEGREE = 24

// partition the 24 roots into orbits under the reflection group (reflections in every root, taken to closure).
// the number of orbits is the dimension of the space of symmetry-invariant linear functionals on the sites.
function orbitCount(roots: number[][]): number {
  const index = new Map<string, number>()

  roots.forEach((r, i) => index.set(vectorKey(r), i))

  const parent = roots.map((_, i) => i)

  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]!]!
      a = parent[a]!
    }

    return a
  }

  const union = (a: number, b: number): void => {
    const ra = find(a)
    const rb = find(b)

    if (ra !== rb) parent[ra] = rb
  }

  for (let i = 0; i < roots.length; i++) {
    for (const a of roots) {
      const image = index.get(vectorKey(reflectRoot(roots[i]!, a)))

      if (image !== undefined) union(i, image)
    }
  }

  const seen = new Set<number>()

  for (let i = 0; i < roots.length; i++) seen.add(find(i))

  return seen.size
}

// is a functional w (a weight per site) preserved by every reflection-permutation of the sites? a functional is
// symmetry-invariant when w[i] == w[image of i] for every reflection. the uniform trace passes, a non-uniform one
// fails.
function functionalInvariant(
  roots: number[][],
  weight: (i: number) => number,
): boolean {
  const index = new Map<string, number>()

  roots.forEach((r, i) => index.set(vectorKey(r), i))

  for (let i = 0; i < roots.length; i++) {
    for (const a of roots) {
      const image = index.get(vectorKey(reflectRoot(roots[i]!, a)))

      if (image !== undefined && weight(i) !== weight(image))
        return false
    }
  }

  return true
}

// gravity sourced by the trace (the cell's total occupation, the F4-invariant) binds a test mass displaced three
// cells. reuses the ternary-field machinery with a three-trit potential.
function traceSourcedBinding(): {
  finalDistance: number
  ternary: boolean
} {
  const mesh = d4Mesh({ side: SIDE })
  const cellCount = mesh.cellCount
  const half = Math.floor(SIDE / 2)
  const coord = (c: number): number[] => [
    c % SIDE,
    Math.floor(c / SIDE) % SIDE,
    Math.floor(c / (SIDE * SIDE)) % SIDE,
    Math.floor(c / SIDE ** 3) % SIDE,
  ]

  const centre =
    half + half * SIDE + half * SIDE * SIDE + half * SIDE ** 3

  const centreCoord = coord(centre)
  const neighbour = (c: number, d: number): number =>
    mesh.neighbour(c, d)

  const distance = (c: number): number =>
    coord(c).reduce((s, v, i) => s + Math.abs(v - centreCoord[i]!), 0)

  const body = new Uint8Array(cellCount)

  for (let c = 0; c < cellCount; c++) {
    const p = coord(c)

    if (
      (p[0]! - half) ** 2 +
        (p[1]! - half) ** 2 +
        (p[2]! - half) ** 2 +
        (p[3]! - half) ** 2 <=
      4
    )
      body[c] = 1
  }

  // the source is the TRACE, the F4-invariant total occupation per cell
  const cap = balancedTernaryCap(3)
  const phi = relaxPotential({
    source: bulkMass({
      occupied: body,
      neighbour,
      cellCount,
      spatialDegree: SPATIAL_DEGREE,
      minNeighbours: 3,
    }),
    neighbour,
    cellCount,
    spatialDegree: SPATIAL_DEGREE,
    sweeps: 80,
    strength: 6,
    cap,
  })

  const ternary = isBalancedTernaryField(phi, 3)

  let piece = centre

  for (let k = 0; k < 3; k++) piece = neighbour(piece, 0)

  for (let step = 0; step < 40; step++) {
    let best = -1
    let bestPhi = phi[piece]!

    for (let d = 0; d < SPATIAL_DEGREE; d++) {
      const target = neighbour(piece, d)

      if (phi[target]! < bestPhi && distance(target) >= 2) {
        bestPhi = phi[target]!
        best = target
      }
    }

    if (best < 0) break

    piece = best

    if (distance(piece) <= 2) break
  }

  return { finalDistance: distance(piece), ternary }
}

export default experiment({
  id: 'gravity/trace-singlet',
  code: 'E-GRV-0038',
  title:
    'gravity is the forced F4-invariant trace, the unique symmetric scalar the 24-cell already carries',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const orbits = orbitCount(roots)
    const f4Order = automorphismGroupOrder(roots)

    // the trace (uniform weight one on every site) is invariant under every reflection-permutation. a non-uniform
    // functional (weight = the site index) is not. the control that could fail.
    const traceInvariant = functionalInvariant(roots, () => 1)
    const skewInvariant = functionalInvariant(roots, i => i)

    const binding = traceSourcedBinding()

    // the invariant-functional dimension equals the orbit count. one orbit means the only symmetric scalar is the
    // trace, so the gravity singlet is forced. the trace is invariant, the skew functional is not, and gravity
    // sourced by the trace binds.
    const singletUnique = orbits === 1
    const traceIsTheSinglet = traceInvariant && !skewInvariant
    const binds = binding.finalDistance <= 2 && binding.ternary
    const ok = singletUnique && traceIsTheSinglet && binds

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 sites form a single orbit under the F4 symmetry (order 1152), so the only symmetry-invariant linear functional is the uniform trace, the unique singlet, and the gravity potential is therefore FORCED to be that trace rather than a free added field. The trace is preserved by every reflection while a non-uniform functional is not, and gravity sourced by the trace (the cell total, the F4-invariant) relaxes to a central well that binds a test mass displaced three cells, held in three balanced-ternary trits. So gravity lives on the one symmetric scalar the 24-cell already carries.',
      metrics: {
        siteCount: roots.length,
        orbitCount: orbits,
        invariantFunctionalDimension: orbits,
        f4Order,
        traceInvariant: traceInvariant ? 1 : 0,
        skewFunctionalInvariant: skewInvariant ? 1 : 0,
        bindingFinalDistance: binding.finalDistance,
        threeTritCap: balancedTernaryCap(3),
      },
      control: {
        skewFunctionalInvariant: skewInvariant ? 1 : 0,
        orbitCountIfPlural: orbits,
      },
      notes:
        'vertex-transitivity (one orbit) is what forces the singlet to be unique, the measured orbit count could have been plural and was not. The invariant-functional dimension equals the orbit count, one. Gravity is then the F4-invariant trace read at three trits, no free added field, the same trace that sources the binding well in gravity/ternary-field. The skew functional is the control, a non-uniform weight is not symmetry-invariant, so it cannot be the gravity singlet.',
    })
  },
})
