// The angular profile of a wave packet's intensity in an annulus around a source.
// A localized impulse at the centre node is evolved under the emergent wave
// operator (the graph Laplacian) by exact spectral evolution, psi(t) =
// e^{-iLt} delta_center. The intensity |psi_j(t)|^2 at each node j inside an
// annulus [rInner, rOuter] is averaged into angular bins, giving the wavefront
// profile whose angular harmonics reveal anisotropy (a faceted lattice front
// versus an isotropic random-mesh front).

import { Mesh, centerNode } from '@/code/substrate/geometric-mesh'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { evolveByEigendecomposition } from '@/code/operator/unitary-evolution'

export function wavefrontProfile(input: {
  mesh: Mesh
  t: number
  rInner: number
  rOuter: number
  bins: number
}): Float64Array {
  const mesh = input.mesh
  const n = mesh.size
  const center = centerNode(mesh)

  // Graph Laplacian L = D - A as a dense symmetric matrix.
  const laplacian = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    const row = mesh.neighbors[i] ?? []
    laplacian.data[i * n + i] = row.length
    for (const j of row) {
      laplacian.data[i * n + j] = -1
    }
  }
  const eig = eigSymmetric({ matrix: laplacian })

  // Exact spectral evolution of a unit impulse at the centre node.
  const re0 = new Float64Array(n)
  const im0 = new Float64Array(n)
  re0[center] = 1
  const evolved = evolveByEigendecomposition({ eig, n, re0, im0, t: input.t })

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
    const re = evolved.re[j] ?? 0
    const im = evolved.im[j] ?? 0
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
