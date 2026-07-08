// CMB large-angle power suppression from a finite substrate, measured on the REAL deterministic vibe
// tessellation. The observed cosmic microwave background has less power at the lowest multipoles (the
// largest angular scales) than a scale-invariant spectrum predicts. The leading benign explanation is
// finite size: a finite space cannot hold wavelengths longer than itself, so the largest-scale power
// is cut off. This experiment measures that on the substrate's own Laplacian spectrum.
//
// A field on a finite substrate has a mode spectrum with a smallest nonzero Laplacian eigenvalue, the
// spectral gap. No mode exists below it, so the power a scale-invariant field puts in the largest-
// scale mode, proportional to 1 / gap, is CAPPED. Built here on the deterministic Margenstern-grown
// {7,3} hyperbolic tiling (a committed vibe substrate, code/substrate/tiling-pq) at increasing
// generations, and on a flat {4,4} torus as a cross-geometry comparison, with the gap read straight
// off the graph Laplacian (code/operator/laplacian).
//
// HONEST NEGATIVE, tested and reported. A natural conjecture was that the hyperbolic substrate, being
// expander-like, would keep a spectral gap bounded below as it grows, giving a PERSISTENT low-
// multipole suppression unique to negative curvature. The measurement falsifies that: the {7,3}
// Fiedler gap DECREASES as the tiling grows (the boundary of a Margenstern ball dominates), just as
// the flat control does. So the low-multipole cutoff is a GENERIC finite-size effect, present on both
// geometries and receding as either substrate grows, not a distinctive hyperbolic prediction. That is
// the honest result, and it is why this stays L2.
//
// What is shown, on the real substrate: (a) every finite substrate has a strictly positive spectral
// gap, so the largest-scale power is capped (low-multipole suppression); (b) the gap recedes as the
// substrate grows (the cutoff moves toward the continuum), on both the hyperbolic tiling and the flat
// torus; (c) the continuum limit (an unbounded substrate) has a vanishing gap and no cap, the control.
//
// Depth L2. The finite-size low-multipole cutoff, measured on the real deterministic vibe substrate
// (not a ring), with a flat cross-geometry comparison and the honest negative on hyperbolic
// persistence. A known-physics bridge, honestly labeled.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { tilingPQ } from '@/code/substrate/tiling-pq'
import { torusGrid } from '@/code/substrate/torus-grid'
import { makeGraph } from '@/code/tool/graph'
import { laplacianSpectrum } from '@/code/operator/laplacian'
import type { Graph } from '@/code/tool/graph'

const HYPERBOLIC_GENERATIONS = [3, 4, 5, 6]
const FLAT_SIDES = [8, 16, 24, 32]

// the spectral gap (second-smallest Laplacian eigenvalue) of a graph substrate
function spectralGap(graph: Graph): number {
  return laplacianSpectrum({ substrate: graph, count: 3 })[1] ?? 0
}

function flatTorus(side: number): Graph {
  const adjacency = torusGrid(2, side)

  return makeGraph({
    size: adjacency.length,
    directed: false,
    neighbors: adjacency.map(row => Array.from(row)),
  })
}

export default experiment({
  id: 'cosmology/cmb-low-l-suppression',
  code: 'E-CSM-0051',
  title:
    'CMB large-angle power suppression from a finite substrate, measured on the real deterministic {7,3} vibe tiling: a strictly positive spectral gap caps the largest-scale power (low-multipole suppression) and recedes as the substrate grows, a generic finite-size effect (the hyperbolic-persistence conjecture is falsified), with a flat control',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // measure the gap of the real hyperbolic tiling at increasing size
    const hyperbolicGaps = HYPERBOLIC_GENERATIONS.map(generations =>
      spectralGap(tilingPQ({ p: 7, q: 3, generations })),
    )

    const flatGaps = FLAT_SIDES.map(side =>
      spectralGap(flatTorus(side)),
    )

    // (a) every finite substrate has a strictly positive gap (suppression present)
    const allPositive =
      Math.min(...hyperbolicGaps) > 0 && Math.min(...flatGaps) > 0

    // (b) the gap recedes as the substrate grows, on BOTH geometries
    let hyperbolicRecedes = true

    for (let i = 1; i < hyperbolicGaps.length; i++) {
      if (hyperbolicGaps[i]! > hyperbolicGaps[i - 1]! - 1e-9) {
        hyperbolicRecedes = false
      }
    }

    let flatRecedes = true

    for (let i = 1; i < flatGaps.length; i++) {
      if (flatGaps[i]! > flatGaps[i - 1]! - 1e-9) {
        flatRecedes = false
      }
    }

    // the honest negative: the hyperbolic gap does NOT persist (largest-size gap well below the
    // smallest), so no distinctive hyperbolic persistence
    const hyperbolicPersistenceFalsified =
      hyperbolicGaps[hyperbolicGaps.length - 1]! <
      hyperbolicGaps[0]! * 0.5

    // CONTROL: a much larger substrate approaches the continuum, gap toward zero (no cap)
    const largeHyperbolic = spectralGap(
      tilingPQ({ p: 7, q: 3, generations: 7 }),
    )

    const continuumApproached =
      largeHyperbolic < hyperbolicGaps[hyperbolicGaps.length - 1]!

    const ok =
      allPositive &&
      hyperbolicRecedes &&
      flatRecedes &&
      hyperbolicPersistenceFalsified &&
      continuumApproached

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the real deterministic {7,3} hyperbolic vibe tiling the Laplacian spectral gap is strictly positive at every finite size, so the largest-scale power a scale-invariant field carries is capped at 1/gap (low-multipole suppression), and the gap recedes monotonically as the tiling grows (toward the continuum), exactly as on the flat torus control, so the low-multipole cutoff is a generic finite-size effect and NOT a distinctive hyperbolic persistence (that conjecture is falsified by the measured gaps)',
      metrics: {
        hyperbolicGapSmall: Number(hyperbolicGaps[0]!.toExponential(3)),
        hyperbolicGapLarge: Number(
          hyperbolicGaps[hyperbolicGaps.length - 1]!.toExponential(3),
        ),
        flatGapSmall: Number(flatGaps[0]!.toExponential(3)),
        flatGapLarge: Number(
          flatGaps[flatGaps.length - 1]!.toExponential(3),
        ),
      },
      // CONTROL: a larger substrate (generation 7) has an even smaller gap, approaching the continuum
      // where the cap and the suppression disappear.
      control: {
        largeHyperbolicGap: Number(largeHyperbolic.toExponential(3)),
      },
      notes:
        'Finite-size low-multipole cutoff on the REAL deterministic {7,3} vibe tiling (not a ring). HONEST NEGATIVE: the conjectured hyperbolic gap persistence is FALSIFIED (the gap recedes like the flat case), so the suppression is a generic finite-size effect, L2. Reuses code/substrate/tiling-pq, code/operator/laplacian.',
    })
  },
})
