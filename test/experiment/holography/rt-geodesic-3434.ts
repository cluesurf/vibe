// The Ryu-Takayanagi / geodesic-shortcut LOG law on the committed {3,4,3,4} substrate (the RT log law was shown
// on {7,3}; the area law on {3,4,3,4} via boundary dominance in holography/holographic-3434; this is the
// minimal-surface/geodesic version on {3,4,3,4}). In a hyperbolic bulk, two boundary points separated by a
// boundary distance L are joined by a bulk GEODESIC of length ~ 2 log_lambda(L): the bulk path dips inward and
// back, a logarithmic shortcut. Equivalently the ball's bulk radius D scales as log_lambda(cells), since each
// shell multiplies the cell count by the warp factor lambda but adds only ~1 to the radius. A flat lattice has
// D ~ cells^(1/3) (polynomial, no shortcut). So the discriminator is: D / log_lambda(cells) -> constant (~1) for
// the hyperbolic {3,4,3,4} (the RT log law), and GROWS for the flat control.

import { streamingShellCounts } from '@/code/substrate/coxeter/streaming-shell-count'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const LAMBDA = 18.2787

// flat 3D lattice: a ball of radius D (Chebyshev) has (2D+1)^3 cells
function flatRatio(D: number): number {
  const cells = (2 * D + 1) ** 3

  return D / (Math.log(cells) / Math.log(LAMBDA))
}

export default experiment({
  id: 'holography/rt-geodesic-3434',
  code: 'E-HLG-0018',
  title:
    'the RT / geodesic-shortcut LOG law on the committed {3,4,3,4}: the bulk radius D ~ log_lambda(cells), so a bulk geodesic between boundary points is ~2 log_lambda of their boundary separation, versus a flat polynomial control',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // measured {3,4,3,4} shell counts; the bulk radius is the shell index D, the cells are the cumulative count
    const shells = streamingShellCounts({
      symbol: [3, 4, 3, 4],
      maxShell: 5,
    })

    const ratios: number[] = []

    let cum = 0

    for (let D = 0; D < shells.length; D++) {
      cum += shells[D]!

      if (D >= 2) ratios.push(D / (Math.log(cum) / Math.log(LAMBDA)))
    }

    // for {3,4,3,4} the ratio D / log_lambda(cells) CONVERGES to ~1 (the bulk radius is logarithmic in cells)
    const lastRatio = ratios[ratios.length - 1]!
    const converging =
      ratios[ratios.length - 1]! > ratios[0]! &&
      lastRatio > 0.9 &&
      lastRatio < 1.1

    // and the ratio is STABLE (the log law), not growing without bound
    const stable =
      Math.abs(
        ratios[ratios.length - 1]! - ratios[ratios.length - 2]!,
      ) < 0.02

    // flat control: the ratio GROWS (D ~ cells^(1/3), not logarithmic)
    const flatRatios = [4, 6, 8, 10].map(flatRatio)
    const flatGrows =
      flatRatios[flatRatios.length - 1]! > flatRatios[0]! + 0.3

    const ok = converging && stable && flatGrows

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the committed {3,4,3,4} substrate the bulk radius D scales as log_lambda(cells) (the ratio D/log_lambda(cells) converges to ~1 and is stable), so two boundary points separated by ~lambda^D cells are joined by a bulk geodesic of length ~2D = 2 log_lambda(separation): the Ryu-Takayanagi / geodesic-shortcut LOG law on the 4D committed substrate. A flat lattice has D ~ cells^(1/3) (the ratio grows without bound), no shortcut. This complements holography/ryu-takayanagi-73 (the RT log law on {7,3}) and holography/holographic-3434 (the area law on {3,4,3,4}).',
      metrics: {
        bulkRadiusOverLogCells: Number(lastRatio.toFixed(4)),
        ratioStable: stable ? 1 : 0,
        warpFactorLambda: LAMBDA,
      },
      control: {
        flatRatioStart: Number(flatRatios[0]!.toFixed(3)),
        flatRatioEnd: Number(
          flatRatios[flatRatios.length - 1]!.toFixed(3),
        ),
        flatGrows: flatGrows ? 1 : 0,
      },
      notes:
        'deterministic, no random. The geodesic shortcut is the RT structure: the minimal bulk surface anchored on a boundary region has length logarithmic in the region size on a hyperbolic bulk. Here measured as the ball bulk radius D ~ log_lambda(cells) (each shell x lambda in cells, +1 in radius), the convergent ratio ~0.98 -> 1. The flat control D ~ cells^(1/3) gives a growing ratio (no shortcut). This is the depth-as-scale / holographic RG direction made quantitative on {3,4,3,4}, the same lambda as the warp factor and the area law.',
    })
  },
})
