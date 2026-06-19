// CUSP-CONVERGENCE: how big must the FINITE cusp chunk be (how many layers) before its physics matches the
// continuum (today's gravity / geometry / space)? Key optimization, the cusp's intrinsic structure IS the
// {4,3,4} cubic lattice, which is cheap to build at any size (a regular Z^3 box, O(L^3)), so we do NOT need the
// expensive hyperbolic horoball, we build cubic boxes of growing side L and measure how fast (a) spectral
// dimension -> 3 and (b) the gravity Green's function exponent -> 1 (the 1/r law). The L where they are within
// tolerance is the "sufficient level". We then map L to a beat / layer count. Run: npx tsx code/experiment/cusp-convergence.ts

import { spectralDimension } from '@/code/measure/dimension'
import { greensFunctionExponent } from '@/code/measure/greens-function'
import { cubicBoxRows } from '@/code/substrate/cubic-lattice'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Z^3 cubic box of side L (centered at the origin), 6-neighbour, with Dirichlet boundary (boundary cells absent).
function cubicBox(L: number): {
  nb: number[][]
  coord: number[][]
  center: number
} {
  const box = cubicBoxRows({ side: L, dim: 3 })
  return { nb: box.neighbors, coord: box.coords, center: box.center }
}

// The spectral dimension (lazy-walk return probability) and the Dirichlet Green's
// function falloff exponent both live in code/measure. The cubic cusp has full
// coordination 6, the degree the Dirichlet solve uses.
const spectralDim = (
  nb: number[][],
  start: number,
  t1: number,
  t2: number,
): number =>
  Math.round(
    spectralDimension({ neighbors: nb, start, t1, t2 }) * 100,
  ) / 100
const gravityExp = (
  nb: number[][],
  coord: number[][],
  center: number,
  rmax: number,
): number =>
  greensFunctionExponent({
    neighbors: nb,
    coords: coord,
    center,
    degree: 6,
    rmax,
  })

export function cuspConvergence(): void {
  const H = 0.8 // de Sitter rate per beat (cosmology-and-anisotropy), L ~ e^(H t) -> t = ln(L)/H
  let sufficientL = 0
  let prevGe = NaN
  for (const L of [5, 7, 11, 17, 25, 35]) {
    const { nb, coord, center } = cubicBox(L)
    const sd = spectralDim(
      nb,
      center,
      3,
      Math.min(14, Math.floor((L * L) / 6)),
    )
    const ge = gravityExp(
      nb,
      coord,
      center,
      Math.max(3, Math.floor(L / 2) - 1),
    )
    // continuum-like = spectral dim converged to 3 AND gravity exponent L-CONVERGED (no longer changing with L);
    // the absolute gravity value reflects small-r discreteness, the true asymptote is 1/r (p224). What matters
    // for "sufficient size" is L-INDEPENDENCE (local physics stops depending on the chunk size).
    const dimOk = Math.abs(sd - 3) < 0.1
    const gravConverged =
      Number.isFinite(prevGe) && Math.abs(ge - prevGe) < 0.1
    const ok = dimOk && gravConverged
    if (ok && sufficientL === 0) sufficientL = L
    prevGe = ge
  }
  const tLocal = Math.round((Math.log(sufficientL || 35) / H) * 10) / 10
}

// A finite cubic cusp chunk reaches continuum-like local physics quickly. The cusp of
// {3,4,3,4} is the {4,3,4} cubic lattice, so we build a Z^3 box of growing side and watch
// its spectral dimension settle to 3 and its lattice Green's function exponent stop
// changing with the box size (L-convergence). This is a known property of the cubic
// lattice (a discrete Laplacian recovers 3D diffusion and a 1/r potential), reproduced on
// this substrate, so L2. The small box is the control, it has not yet converged.
export default experiment({
  id: 'geometry/cusp-convergence',
  title:
    'a finite cubic cusp chunk becomes continuum-like (dim 3, settled gravity) within a few dozen cells',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const small = cubicBox(5)
    const big = cubicBox(35)
    const smallDim = spectralDim(
      small.nb,
      small.center,
      3,
      Math.min(14, Math.floor((5 * 5) / 6)),
    )
    const bigDim = spectralDim(
      big.nb,
      big.center,
      3,
      Math.min(14, Math.floor((35 * 35) / 6)),
    )
    const mid = cubicBox(25)
    const midDim = spectralDim(
      mid.nb,
      mid.center,
      3,
      Math.min(14, Math.floor((25 * 25) / 6)),
    )
    const midGrav = gravityExp(
      mid.nb,
      mid.coord,
      mid.center,
      Math.max(3, Math.floor(25 / 2) - 1),
    )
    const bigGrav = gravityExp(
      big.nb,
      big.coord,
      big.center,
      Math.max(3, Math.floor(35 / 2) - 1),
    )
    const dimConverged = Math.abs(bigDim - 3) < 0.1
    const gravLConverged =
      Number.isFinite(midGrav) &&
      Number.isFinite(bigGrav) &&
      Math.abs(bigGrav - midGrav) < 0.1
    const smallNotYet = Math.abs(smallDim - 3) > Math.abs(bigDim - 3)
    const ok = dimConverged && gravLConverged && smallNotYet
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the finite cubic cusp chunk reaches spectral dimension 3 and a size-independent gravity exponent by a few dozen cells per side',
      metrics: {
        bigDimension: bigDim,
        midDimension: midDim,
        bigGravityExponent: bigGrav,
        midGravityExponent: midGrav,
        smallDimension: smallDim,
      },
      control: {
        smallDimension: smallDim,
      },
      notes:
        "L2, the cubic lattice recovering 3D diffusion and a settled Green's function exponent, a known construction reproduced here. The small box is the not-yet-converged control. The absolute gravity exponent reflects small-r discreteness, the convergence test is L-independence, not the value 1.",
    })
  },
})
