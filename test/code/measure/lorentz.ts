// Conformance for code/measure/lorentz: the isotropy / Lorentz-safety probes (P3). A
// regular lattice singles out preferred axes; a Poisson sprinkling does not. The
// decisive checks: a square lattice's nearest links are all axis-aligned, so its
// 4-fold angular order parameter is exactly 1 (a hard preferred frame), while at long
// wavelength the lattice group speed is isotropic (anisotropy -> 0) and speed -> 1.

import { suite, check, close, equal, ok } from '@/test/code/harness'
import { lorentzIsotropy, lorentzSafety, latticeAnisotropy } from '@/code/measure/lorentz'
import { makeGraph, Graph } from '@/code/tool/graph'
import { Embedding } from '@/code/tool/embedding'
import { makeRng } from '@/code/tool/rng'

// A square lattice L x L (node = y*L + x), 4-connected, carrying a Riemannian
// embedding with the integer grid coordinates (x, y).
function squareLattice(L: number): Graph {
  const N = L * L
  const neighbors: number[][] = []
  const coords = new Float64Array(N * 2)

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const id = y * L + x
      const row: number[] = []
      if (x + 1 < L) row.push(y * L + x + 1)
      if (x - 1 >= 0) row.push(y * L + x - 1)
      if (y + 1 < L) row.push((y + 1) * L + x)
      if (y - 1 >= 0) row.push((y - 1) * L + x)
      neighbors[id] = row
      coords[id * 2] = x
      coords[id * 2 + 1] = y
    }
  }

  const embedding: Embedding = {
    form: 'embedding',
    dimension: 2,
    signature: 'riemannian',
    coords,
    manifold: { form: 'minkowski', dimension: 2 },
  }

  return makeGraph({ size: N, directed: false, neighbors, embedding })
}

suite('measure/lorentz: lorentzIsotropy', [
  check('a square lattice has a preferred frame with 4-fold anisotropy 1', () => {
    const out = lorentzIsotropy({
      substrate: squareLattice(12),
      samples: 144,
      rng: makeRng({ seed: 3 }),
    })
    // Every nearest link is axis-aligned (theta a multiple of pi/2), so the m=4
    // harmonic |<e^{i4theta}>| = 1 exactly.
    close(out.anisotropy, 1, 1e-9)
    ok(out.preferredFrame, 'a lattice must register a preferred frame')
  }),
  check('a substrate with no embedding reports the isotropic null', () => {
    const g = makeGraph({
      size: 4,
      directed: false,
      neighbors: [[1], [0, 2], [1, 3], [2]],
    })
    const out = lorentzIsotropy({ substrate: g, samples: 4, rng: makeRng({ seed: 1 }) })
    equal(out.preferredFrame, false)
    equal(out.anisotropy, 0)
  }),
  check('a single spatial axis is degenerate -> isotropic null', () => {
    const embedding: Embedding = {
      form: 'embedding',
      dimension: 1,
      signature: 'riemannian',
      coords: Float64Array.from([0, 1, 2, 3]),
      manifold: { form: 'minkowski', dimension: 1 },
    }
    const g = makeGraph({
      size: 4,
      directed: false,
      neighbors: [[1], [0, 2], [1, 3], [2]],
      embedding,
    })
    const out = lorentzIsotropy({ substrate: g, samples: 4, rng: makeRng({ seed: 1 }) })
    equal(out.preferredFrame, false)
    equal(out.anisotropy, 0)
  }),
])

suite('measure/lorentz: lorentzSafety', [
  check('a lattice is far more anisotropic than a Poisson sprinkle', () => {
    const { sprinkle, lattice } = lorentzSafety()
    ok(lattice > 0.5, `lattice 4-fold anisotropy ${lattice} should be strong`)
    ok(sprinkle < 0.3, `sprinkle anisotropy ${sprinkle} should be weak`)
    ok(lattice > sprinkle, 'a lattice must be more anisotropic than a sprinkle')
  }),
])

suite('measure/lorentz: latticeAnisotropy (group-speed)', [
  check('at long wavelength the lattice is isotropic with speed ~ 1', () => {
    const out = latticeAnisotropy(0.01)
    // omega^2 = 2(1-cos kx) + 2(1-cos ky) ~ |k|^2 as k -> 0, so speed -> 1 and the
    // direction dependence vanishes.
    close(out.meanSpeed, 1, 1e-2)
    ok(out.anisotropy < 1e-2, `long-wavelength anisotropy ${out.anisotropy} must be tiny`)
  }),
  check('anisotropy grows toward the Brillouin-zone edge', () => {
    const small = latticeAnisotropy(0.01).anisotropy
    const large = latticeAnisotropy(2.5).anisotropy
    ok(large > small, 'short-wavelength group speed must be more anisotropic')
  }),
])
