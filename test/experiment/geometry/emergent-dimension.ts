// P69: emergent spatial geometry from pure growth (bias-free).
// P38 measured the spatial dimension from a sprinkle, on a coordinate slice, and came out biased
// low. The fix is to read the dimension INTRINSICALLY from the grown connectivity, with no
// coordinates at all, and with the right estimator: the SHELL count, the number of vibes at
// exactly graph distance r. On a flat mesh of dimension d, grown by the local rule "join each
// cell to its axis neighbors", the shell grows as a power, |S(r)| ~ r^(d-1), so the slope of
// log|S| against log r is d-1, and the dimension is that plus one, recovered cleanly and without
// the bias that the cumulative ball carries. On a negatively-curved mesh (a Bethe lattice, the
// tree limit of a hyperbolic tessellation), the same shell instead grows EXPONENTIALLY, the
// fingerprint of curvature. Either way the geometry is read off the relations (P5), never from an
// embedding. Run: npx tsx code/experiment/p69-emergent-dimension.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { torusGrid } from '@/code/substrate/torus-grid'
import { betheTree } from '@/code/substrate/bethe-tree'
import { bfsShells } from '@/code/measure/shells'
import {
  shellDimension,
  shellExponentialFit,
  shellPowerR2,
} from '@/code/measure/dimension'

// The intrinsic geometry is read off the grown connectivity with no coordinates: the
// SHELL counts (nodes at exactly graph distance r) via bfsShells, then the shell-based
// dimension and curvature measures in code/measure/dimension. On a flat mesh the shell
// grows as r^(d-1) (shellDimension recovers d), on a curved mesh it grows
// exponentially (shellExponentialFit beats shellPowerR2).

export function emergentDimension(input: Record<string, never> = {}): {
  flat: { target: number; measured: number; r2: number }[]
  curved: { name: string; powerR2: number; exponentialR2: number; growthRatio: number }[]
  flatUnbiased: boolean
  curvedIsExponential: boolean
  solved: boolean
} {
  void input
  const flatSpecs = [
    { target: 2, L: 81, rLo: 3, rHi: 34 },
    { target: 3, L: 31, rLo: 3, rHi: 13 },
    { target: 4, L: 21, rLo: 4, rHi: 10 },
  ]
  const flat = flatSpecs.map((spec) => {
    const adj = torusGrid(spec.target, spec.L)
    const shell = bfsShells({ neighbors: adj, root: 0 }).shellCounts
    const sd = shellDimension({ shell, rLo: spec.rLo, rHi: spec.rHi })
    return { target: spec.target, measured: sd.dimension, r2: sd.r2 }
  })

  const treeSpecs = [
    { name: 'Bethe lattice {.,3}', q: 3, depth: 16, rLo: 3, rHi: 14 },
    { name: 'Bethe lattice {.,4}', q: 4, depth: 11, rLo: 3, rHi: 9 },
  ]
  const curved = treeSpecs.map((spec) => {
    const adj = betheTree(spec.q, spec.depth)
    const shell = bfsShells({ neighbors: adj, root: 0 }).shellCounts
    const ef = shellExponentialFit({ shell, rLo: spec.rLo, rHi: spec.rHi })
    return { name: spec.name, powerR2: shellPowerR2({ shell, rLo: spec.rLo, rHi: spec.rHi }), exponentialR2: ef.r2, growthRatio: ef.growthRatio }
  })

  const flatUnbiased = flat.every((f) => Math.abs(f.measured - f.target) < 0.2)
  const curvedIsExponential = curved.every((c) => c.exponentialR2 >= c.powerR2 && c.growthRatio > 1.8)

  return { flat, curved, flatUnbiased, curvedIsExponential, solved: flatUnbiased && curvedIsExponential }
}

export default experiment({
  id: 'geometry/emergent-dimension',
  title: 'emergent dimension, flat grids unbiased (2/3/4), curved meshes exponential',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = emergentDimension()
    const d2 = r.flat.find((x) => x.target === 2)
    const d3 = r.flat.find((x) => x.target === 3)
    const d4 = r.flat.find((x) => x.target === 4)
    const ok =
      r.solved &&
      r.flatUnbiased &&
      r.curvedIsExponential &&
      Math.abs((d2?.measured ?? 0) - 2) < 0.2 &&
      Math.abs((d3?.measured ?? 0) - 3) < 0.2 &&
      Math.abs((d4?.measured ?? 0) - 4) < 0.2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the dimension read intrinsically from grown shell connectivity is unbiased on flat grids and reads exponential on a negatively-curved mesh',
      metrics: {
        measured2: d2?.measured ?? 0,
        measured3: d3?.measured ?? 0,
        measured4: d4?.measured ?? 0,
      },
    })
  },
})
