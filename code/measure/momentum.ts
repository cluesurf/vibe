// The momentum current of the directional lattice gas: the vector sum, over every site, of its tone times the
// site's direction vector (a D4 root). This is the second conserved quantity beyond charge. A relativistic
// continuum face needs a conserved momentum current as well as a conserved charge, so testing that the knit
// conserves it exactly is a step on the relativity rung.

import { Will } from '@/code/tone/will'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

// the total momentum 4-vector of a will, sum over sites of tone times direction.
export function totalMomentum(will: Will): number[] {
  const degree = will.mesh.degree
  const data = will.data
  const p = [0, 0, 0, 0]

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree

    for (let d = 0; d < degree; d++) {
      const t = data[base + d]!

      if (t === 0) continue

      const root = ROOTS[d] ?? [0, 0, 0, 0]

      for (let a = 0; a < 4; a++) p[a] = p[a]! + t * (root[a] ?? 0)
    }
  }

  return p
}

// the largest absolute component difference between two momentum vectors, the drift.
export function momentumDrift(a: number[], b: number[]): number {
  let m = 0

  for (let i = 0; i < a.length; i++)
    m = Math.max(m, Math.abs((a[i] ?? 0) - (b[i] ?? 0)))

  return m
}
