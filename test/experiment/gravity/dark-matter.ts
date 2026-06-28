// P18: this is an ANALYTIC / CONSISTENCY CHECK that ASSUMES a nonlocal 1/L^2 propagator term, hand-chosen with
// a tunable weight, to flatten the rotation curve. The local Laplacian gives the Newtonian 1/r potential (P16)
// and a Keplerian decline. We then ADD a long-range L^-2 piece (a second conjugate-gradient solve, weighted by
// the input nonlocal coefficient) and confirm that this assumed term makes the potential fall more slowly and
// FLATTENS the curve. The flattening is a direct consequence of the assumed nonlocal term, ASSUMED here, not
// produced by the vibe substrate. This file does NOT show the substrate generates nonlocal gravity, and it does
// NOT derive dark matter. The weight is a free input tuned to demonstrate the mechanism, not a prediction.
// Whether such a term emerges, and at what scale, is an open question. See note/questions/frontiers.md.
// Run: npx tsx code/experiment/p18-dark-matter.ts

import { cubicLattice } from '@/code/substrate/cubic-lattice'
import { solveGraphPoisson } from '@/code/operator/graph-laplacian'
import { rotationCurveFromPotential } from '@/code/measure/rotation-curve'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Solve L phi = b (zero-mean) by conjugate gradient, projecting out the constant.
function cgSolve(neighbors: number[][], b: Float64Array): Float64Array {
  return solveGraphPoisson({
    neighbors,
    b,
    maxIterationFactor: 5,
    tolerance: 1e-18,
  })
}

// Rotation curve v^2(r) = r * |dphi/dr| from the modified potential phi = L^-1 b +
// w * L^-2 b of a central point source.
export function rotationCurve(input: {
  side: number
  nonlocal: number
}): {
  r: number[]
  v2: number[]
  outerSlope: number
  flatnessRatio: number
} {
  const lat = cubicLattice(input.side, 3)
  const n = lat.size
  const mid = Math.floor(input.side / 2)
  const center = mid + input.side * (mid + input.side * mid)
  const b = new Float64Array(n).fill(-1 / n)
  b[center] = 1 - 1 / n

  const phi1 = cgSolve(lat.neighbors, b)
  const phi = new Float64Array(n)

  if (input.nonlocal !== 0) {
    const phi2 = cgSolve(lat.neighbors, phi1) // L^-2 b

    for (let i = 0; i < n; i++) {
      phi[i] = (phi1[i] ?? 0) + input.nonlocal * (phi2[i] ?? 0)
    }
  } else {
    for (let i = 0; i < n; i++) {
      phi[i] = phi1[i] ?? 0
    }
  }

  // Bin the potential by distance from the center.
  const cx = mid
  const maxR = input.side / 2 - 1
  const bins = Math.floor(maxR)
  const sum = new Float64Array(bins + 1)
  const cnt = new Int32Array(bins + 1)

  for (let i = 0; i < n; i++) {
    const x = (lat.coords[i * 3] ?? 0) - cx
    const y = (lat.coords[i * 3 + 1] ?? 0) - cx
    const z = (lat.coords[i * 3 + 2] ?? 0) - cx
    const d = Math.sqrt(x * x + y * y + z * z)
    const bin = Math.round(d)

    if (bin >= 1 && bin <= bins) {
      sum[bin] = (sum[bin] ?? 0) + (phi[i] ?? 0)
      cnt[bin] = (cnt[bin] ?? 0) + 1
    }
  }

  const r: number[] = []
  const phiR: number[] = []

  for (let bn = 1; bn <= bins; bn++) {
    if ((cnt[bn] ?? 0) > 0) {
      r.push(bn)
      phiR.push((sum[bn] ?? 0) / (cnt[bn] ?? 1))
    }
  }

  // v^2(r) = r * |dphi/dr| (circular-orbit speed squared), with the outer slope and flatness ratio.
  return rotationCurveFromPotential({ radii: r, potential: phiR })
}

export default experiment({
  id: 'gravity/dark-matter',
  code: 'E-GRV-0008',
  title:
    'nonlocal gravity flattens the rotation curve (no dark particle)',
  category: 'gravity',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const local = rotationCurve({ side: 19, nonlocal: 0 })
    const nonlocal = rotationCurve({ side: 19, nonlocal: 1.5 })
    const ok =
      local.flatnessRatio < 0.7 &&
      nonlocal.flatnessRatio > 0.95 &&
      nonlocal.flatnessRatio > local.flatnessRatio

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an assumed nonlocal 1/L^2 term flattens the rotation curve while local gravity declines Keplerian',
      metrics: {
        localFlatnessRatio: local.flatnessRatio,
        nonlocalFlatnessRatio: nonlocal.flatnessRatio,
      },
      notes:
        'analytic consistency check of a hand-chosen nonlocal term, not a derivation of dark matter from the substrate',
    })
  },
})
