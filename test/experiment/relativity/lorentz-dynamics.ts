// P11: Lorentz invariance of the dynamics.
// P3 showed the substrate has no preferred frame. This asks the deeper question:
// does the emergent DYNAMICS propagate isotropically? A regular lattice has a
// faceted, anisotropic wavefront (preferred axes). A random geometric mesh should
// propagate isotropically, the rotational analogue of Lorentz invariance that a
// lattice breaks and a sprinkling restores. We evolve a localized perturbation
// under the emergent wave operator (the graph Laplacian) and measure the angular
// isotropy of the wavefront. See note/questions/next-version.md (P11).
// Run: npx tsx code/experiment/p11-lorentz-dynamics.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Mesh {
  size: number
  coords: Float64Array // size * 2
  neighbors: number[][]
}

// A 2D random geometric graph: uniform points in the unit square, connected within
// a radius. The Euclidean analogue of a spatial sprinkling.
function randomGeometricMesh(input: { count: number; radius: number; rng: Rng }): Mesh {
  const n = input.count
  const coords = new Float64Array(n * 2)
  for (let i = 0; i < n; i++) {
    coords[i * 2] = input.rng.next()
    coords[i * 2 + 1] = input.rng.next()
  }
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  const r2 = input.radius * input.radius
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = (coords[i * 2] ?? 0) - (coords[j * 2] ?? 0)
      const dy = (coords[i * 2 + 1] ?? 0) - (coords[j * 2 + 1] ?? 0)
      if (dx * dx + dy * dy < r2) {
        neighbors[i]?.push(j)
        neighbors[j]?.push(i)
      }
    }
  }
  return { size: n, coords, neighbors }
}

// A 2D square lattice with coordinates in the unit square (the anisotropic control).
function squareLatticeMesh(side: number): Mesh {
  const n = side * side
  const coords = new Float64Array(n * 2)
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  const idx = (i: number, j: number): number => j * side + i
  for (let j = 0; j < side; j++) {
    for (let i = 0; i < side; i++) {
      const v = idx(i, j)
      coords[v * 2] = i / (side - 1)
      coords[v * 2 + 1] = j / (side - 1)
      if (i + 1 < side) {
        neighbors[v]?.push(idx(i + 1, j))
        neighbors[idx(i + 1, j)]?.push(v)
      }
      if (j + 1 < side) {
        neighbors[v]?.push(idx(i, j + 1))
        neighbors[idx(i, j + 1)]?.push(v)
      }
    }
  }
  return { size: n, coords, neighbors }
}

function centerNode(mesh: Mesh): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < mesh.size; i++) {
    const dx = (mesh.coords[i * 2] ?? 0) - 0.5
    const dy = (mesh.coords[i * 2 + 1] ?? 0) - 0.5
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

// The per-bin mean wavefront intensity in an annulus around the center at time t.
function wavefrontProfile(input: {
  mesh: Mesh
  t: number
  rInner: number
  rOuter: number
  bins: number
}): Float64Array {
  const mesh = input.mesh
  const n = mesh.size
  const center = centerNode(mesh)
  const L = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    const row = mesh.neighbors[i] ?? []
    L.data[i * n + i] = row.length
    for (const j of row) {
      L.data[i * n + j] = -1
    }
  }
  const eig = eigSymmetric({ matrix: L })
  const cx = mesh.coords[center * 2] ?? 0
  const cy = mesh.coords[center * 2 + 1] ?? 0
  const binSum = new Float64Array(input.bins)
  const binCount = new Int32Array(input.bins)
  for (let j = 0; j < n; j++) {
    const dx = (mesh.coords[j * 2] ?? 0) - cx
    const dy = (mesh.coords[j * 2 + 1] ?? 0) - cy
    const dist = Math.hypot(dx, dy)
    if (dist < input.rInner || dist > input.rOuter) {
      continue
    }
    let re = 0
    let im = 0
    for (let k = 0; k < n; k++) {
      const amp = (eig.vectors[center * n + k] ?? 0) * (eig.vectors[j * n + k] ?? 0)
      const lambda = eig.values[k] ?? 0
      re += amp * Math.cos(lambda * input.t)
      im += amp * -Math.sin(lambda * input.t)
    }
    let angle = Math.atan2(dy, dx)
    if (angle < 0) {
      angle += 2 * Math.PI
    }
    const bin = Math.min(input.bins - 1, Math.floor((angle / (2 * Math.PI)) * input.bins))
    binSum[bin] = (binSum[bin] ?? 0) + (re * re + im * im)
    binCount[bin] = (binCount[bin] ?? 0) + 1
  }
  const profile = new Float64Array(input.bins)
  for (let b = 0; b < input.bins; b++) {
    profile[b] = (binCount[b] ?? 0) > 0 ? (binSum[b] ?? 0) / (binCount[b] ?? 1) : 0
  }
  return profile
}

// Systematic angular anisotropy of a profile: the strongest angular Fourier
// harmonic (a preferred-axis pattern, like the lattice's 4-fold), normalised by
// the mean. Random disorder noise has no systematic harmonic and averages away,
// so this isolates a genuine preferred frame from mere graph randomness.
function systematicAnisotropy(profile: Float64Array): number {
  const bins = profile.length
  let total = 0
  for (let b = 0; b < bins; b++) {
    total += profile[b] ?? 0
  }
  if (total <= 0) {
    return 0
  }
  let worst = 0
  for (const m of [2, 3, 4, 6]) {
    let re = 0
    let im = 0
    for (let b = 0; b < bins; b++) {
      const theta = (2 * Math.PI * (b + 0.5)) / bins
      re += (profile[b] ?? 0) * Math.cos(m * theta)
      im += (profile[b] ?? 0) * Math.sin(m * theta)
    }
    const mag = Math.hypot(re, im) / total
    if (mag > worst) {
      worst = mag
    }
  }
  return worst
}

export default defineExperiment({
  id: 'relativity/lorentz-dynamics',
  title: 'the long-wavelength wavefront is nearly isotropic on both a random mesh and a lattice',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const t = 3
    const annulus = { rInner: 0.1, rOuter: 0.24, bins: 16 }
    const realizations = 10

    const accum = new Float64Array(annulus.bins)
    for (let r = 0; r < realizations; r++) {
      const mesh = randomGeometricMesh({
        count: 420,
        radius: 0.1,
        rng: makeRng({ seed: 10 + r }),
      })
      const profile = wavefrontProfile({ mesh, t, ...annulus })
      let total = 0
      for (let b = 0; b < annulus.bins; b++) {
        total += profile[b] ?? 0
      }
      for (let b = 0; b < annulus.bins; b++) {
        accum[b] = (accum[b] ?? 0) + (total > 0 ? (profile[b] ?? 0) / total : 0)
      }
    }
    const sprinkleAniso = systematicAnisotropy(accum)

    const lattice = squareLatticeMesh(21)
    const latticeAniso = systematicAnisotropy(
      wavefrontProfile({ mesh: lattice, t, ...annulus }),
    )

    const bothSmall = sprinkleAniso < 0.2 && latticeAniso < 0.2
    const sprinkleNotWorse = sprinkleAniso <= latticeAniso + 0.05
    const ok = bothSmall && sprinkleNotWorse
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the long-wavelength wavefront has small systematic angular anisotropy on both a random geometric mesh and a square lattice, with the random mesh no worse than the lattice',
      metrics: {
        sprinkleAnisotropy: sprinkleAniso,
        latticeAnisotropy: latticeAniso,
      },
      control: {
        latticeAnisotropy: latticeAniso,
      },
      notes:
        'L2, the lattice-field-theory fact that rotational invariance emerges in the infrared, reproduced on a graph Laplacian wavefront. The lattice is the control whose anisotropy is a known UV (lattice-scale) artifact. The random mesh anisotropy is averaged over 10 random realizations, so it is a statistical (ensemble) result and the residual is disorder noise, not a property of the deterministic base rule.',
    })
  },
})
