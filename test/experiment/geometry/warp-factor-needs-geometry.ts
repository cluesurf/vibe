// The warp factor is an unforced consequence of the {3,4,3,4} geometry, not of the degree or the alphabet.
// This is the L2-to-L3 upgrade by control. The bulk warp factor (the shell growth rate near 18.28, see
// geometry/bulk-warp-factor) is a clean geometric constant: the {3,4,3,4} cell graph grows by exact shells
// 1, 24, 456, 8376, with the shell-3 ratio 8376/456 about 18.37 converging to the warp factor. The question
// an L3 result must answer is whether that constant is forced by the geometry, or whether any degree-24 graph
// would give it.
//
// The control answers it. Take the SAME graph, keep every node's degree exactly, and scramble the wiring
// (a degree-preserving double-edge swap that destroys the hyperbolic structure). The scrambled graph is a
// degree-24 expander on the same nodes. Its shell ratio is the expander value near the degree minus one (about
// 23), NOT the warp factor, and its shell 2 is not 456. So the warp factor disappears the moment the geometry
// is scrambled, while the degree and the local alphabet are untouched. The flat D4 lattice (the same 24
// directions, no curvature) is the second control: it grows polynomially, ratio near one, no warp at all.
//
// So the warp factor 18.37 (about 18.28 in the limit) is a measured consequence of the {3,4,3,4} geometry
// specifically, it could have survived the scramble and did not, and it could have appeared on the flat lattice
// and did not. That is the L3 standard: a quantitative geometric constant that vanishes under the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import {
  shellCountsFromGraph,
  euclideanL1ShellRatio,
} from '@/code/measure/shell-growth'
import { scrambleNeighbors } from '@/code/control/scramble'
import { scaled } from '@/test/scaffold/scale'

// the warp-factor band, the shell-3 ratio 8376/456 = 18.368 sits well inside it
const WARP_LOW = 18
const WARP_HIGH = 19

export default experiment({
  id: 'geometry/warp-factor-needs-geometry',
  code: 'E-GMT-0028',
  title:
    'the {3,4,3,4} warp factor (shell ratio about 18.37) is a geometric consequence, it vanishes on a degree-preserving scramble and on the flat lattice (the L2-to-L3 control)',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  scales: true,
  run(context) {
    const scale = context.scale ?? 1
    // build the bulk far enough that shells 0..3 are complete (1 + 24 + 456 + 8376 = 8857 cells)
    const addressing = buildAddressing({ maxCells: scaled(30000, scale) })
    const neighbors = addressing.graph.neighbors
    const cellCount = addressing.graph.cellCount

    // the real {3,4,3,4} bulk, the exact early shells and the warp ratio
    const realCounts = shellCountsFromGraph({ neighbors, cellCount })
    const realShellsMatch =
      realCounts[1] === 24 &&
      realCounts[2] === 456 &&
      realCounts[3] === 8376

    const realRatio = (realCounts[3] ?? 0) / (realCounts[2] ?? 1)
    const realInBand = realRatio > WARP_LOW && realRatio < WARP_HIGH

    // the control, the same graph scrambled (degree preserved, geometry destroyed)
    const scrambled = scrambleNeighbors({
      neighbors,
      seed: 1,
      passes: 4,
    })

    const scrambleCounts = shellCountsFromGraph({
      neighbors: scrambled,
      cellCount,
    })

    const scrambleShell2 = scrambleCounts[2] ?? 0
    const scrambleRatio =
      (scrambleCounts[3] ?? 0) / (scrambleCounts[2] ?? 1)

    const scrambleInBand =
      scrambleRatio > WARP_LOW && scrambleRatio < WARP_HIGH

    // the degree is preserved, so shell 1 is still about 24, but shell 2 is not 456
    const scrambleShell1 = scrambleCounts[1] ?? 0
    const scrambleKeptDegree =
      scrambleShell1 >= 20 && scrambleShell1 <= 24

    // the second control, the flat D4 lattice grows polynomially (no warp)
    const flatRatio = euclideanL1ShellRatio({ dimension: 4, shell: 12 })
    const flatIsPolynomial = flatRatio < 2

    // L3: the warp factor is present on the real geometry and ABSENT on both controls
    const ok =
      realShellsMatch &&
      realInBand &&
      scrambleKeptDegree &&
      !scrambleInBand &&
      scrambleShell2 !== 456 &&
      flatIsPolynomial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} warp factor (the shell-growth ratio about 18.37, converging to the bulk warp factor about 18.28) is a consequence of the geometry, not of the degree or the local alphabet. The real bulk has the exact early shells 1, 24, 456, 8376 and a shell-3 ratio of 18.37. A degree-preserving scramble of the same graph keeps every node degree 24 but destroys the hyperbolic structure, and its shell ratio collapses to the expander value (near degree minus one, about 23), with shell 2 no longer 456, so the warp factor vanishes. The flat D4 lattice (same 24 directions, no curvature) grows polynomially with ratio near one, no warp. So the warp factor is an unforced geometric constant: it could have survived the scramble or appeared on the flat lattice, and it did neither. This is the L2-to-L3 upgrade by control.',
      metrics: {
        realShell1: realCounts[1] ?? 0,
        realShell2: realCounts[2] ?? 0,
        realShell3: realCounts[3] ?? 0,
        realRatio: Number(realRatio.toFixed(3)),
        scrambleShell1,
        scrambleShell2,
        scrambleRatio: Number(scrambleRatio.toFixed(3)),
        flatRatio: Number(flatRatio.toFixed(3)),
      },
      control: {
        scrambleRatio: Number(scrambleRatio.toFixed(3)),
        scrambleInBand: scrambleInBand ? 1 : 0,
        flatRatio: Number(flatRatio.toFixed(3)),
        flatIsPolynomial: flatIsPolynomial ? 1 : 0,
      },
      notes:
        'the scramble is a deterministic degree-preserving double-edge swap (code/control/scramble.ts), so the degree sequence is identical to the real graph and only the wiring changes. The real shell-3 ratio is 8376/456 = 18.368, inside the warp band, while the scramble gives an expander ratio near 23 (degree minus one) with shell 2 far from 456. This is a geometric-consequence L3, the warp constant is forced by the {3,4,3,4} geometry and absent on both the scramble and the flat-lattice controls, rather than a dynamical-rule L3. The same scramble control is the general tool for upgrading any geometry-dependent L2 measurement (isotropy order, dispersion, growth) to L3, run the measure on the substrate and on the scramble, and keep only what survives only on the geometry.',
    })
  },
})
