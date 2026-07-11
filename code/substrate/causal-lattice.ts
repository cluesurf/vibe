// A 1+1 causal lattice: integer points in a Minkowski diamond, with the causal
// order dt > 0 and dt >= |dx|. Unlike a Poisson sprinkle this regular lattice has
// a rest frame, so its timelike links pile up at rapidity 0. Built as a Poset
// (covering relations via transitive reduction) carrying the integer (t, x)
// coordinates as a lorentzian embedding, so rapidity / dimension measures can read
// `poset.embedding.coords`.

import { Poset, makePosetFromRelation } from '@/code/tool/poset'
import { Embedding } from '@/code/tool/embedding'

export function causalLattice(input: { half: number }): Poset {
  const half = input.half
  const pts: [number, number][] = []

  for (let t = 0; t <= 2 * half; t++) {
    const reach = Math.min(t, 2 * half - t)

    for (let x = -reach; x <= reach; x++) pts.push([t, x])
  }

  const n = pts.length
  const coords = new Float64Array(n * 2)

  pts.forEach(([t, x], i) => {
    coords[i * 2] = t
    coords[i * 2 + 1] = x
  })

  const precedes = (pair: { a: number; b: number }): boolean => {
    const dt = pts[pair.b]![0] - pts[pair.a]![0]
    const dx = pts[pair.b]![1] - pts[pair.a]![1]

    return dt > 0 && dt >= Math.abs(dx)
  }

  const embedding: Embedding = {
    form: 'embedding',
    dimension: 2,
    signature: 'lorentzian',
    coords,
    manifold: { form: 'minkowski', dimension: 2 },
  }

  return makePosetFromRelation({ size: n, precedes, embedding })
}
