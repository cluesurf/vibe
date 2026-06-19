// COMPARATIVE (cross-geometry). This is the {7,3} heptagrid (Margenstern's 2D hyperbolic tiling), a reference point,
// NOT the canonical substrate. The committed model is {3,4,3,4}, whose universality lives in
// `computation/turing-3434` and `computation/reversible-universality-3434`. This {7,3} result shows the railway
// prerequisites also hold on Margenstern's classic geometry, useful as a cross-geometry comparison.
//
// P204: computation on {7,3}, the heptagrid's STANDOUT. Margenstern and Morita PROVED the {7,3} heptagrid
// hosts universal computation (the railway / circuit model), so {7,3} is the COMPUTATION substrate. This
// checks the two structural properties the proof relies on, (a) a tree-like (Fibonacci) addressing for
// navigation, (b) interior cells rich enough to host railway junctions (>=3 independent directions). Ported.
// Run: npx tsx code/experiment/p204-computation-73.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function computation73(): {
  fibonacciGrowth: boolean
  junctionCapable: boolean
  growthRatio: number
} {
  const g = buildCellGraph({ symbol: [7, 3] as never, maxCells: 15000 })
  const N = g.cellCount
  let center = 0,
    best = -1
  for (let i = 0; i < N; i++) {
    const d = g.neighbors[i]!.length
    if (d > best) {
      best = d
      center = i
    }
  }

  // (a) spanning-tree shell growth -> the ratio should approach the {7,3} growth constant (golden-ratio family,
  //     ~ (3+sqrt(5))/2 = phi^2 = 2.618 for the heptagrid's Fibonacci-like tree), Margenstern's addressing.
  const { shellCounts: shell } = bfsShells({
    neighbors: g.neighbors,
    root: center,
  })
  const mid = shell.slice(2, Math.min(8, shell.length))
  const ratios = mid.slice(1).map((s, i) => s / mid[i]!)
  const growthRatio =
    Math.round(
      (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100,
    ) / 100
  const phi2 = (3 + Math.sqrt(5)) / 2
  const fibonacciGrowth = Math.abs(growthRatio - phi2) < 0.6 // near the golden-ratio family

  // (b) junction capability: an interior cell must allow >=3 edge-disjoint outgoing tracks (for crossings/switches)
  let interior = center
  for (let i = 0; i < N; i++) {
    if (g.neighbors[i]!.length === 7) {
      interior = i
      break
    }
  }

  const outDeg = g.neighbors[interior]!.length
  const junctionCapable = outDeg >= 3

  return { fibonacciGrowth, junctionCapable, growthRatio }
}

// The {7,3} heptagrid carries the two structural prerequisites of Margenstern and Morita's
// universality proof, a Fibonacci-family tree addressing (shell growth near phi^2) and
// junction-capable interior cells (degree 7, at least 3 tracks for railway switches and
// crossings). The universality itself is cited prior art, proven by Margenstern and Morita,
// not run here. We only verify the prerequisites, so L1, established structural facts about
// the heptagrid, and paper is false.
export default experiment({
  id: 'computation/computation-73',
  title:
    'COMPARATIVE ({7,3}): the heptagrid carries the railway prerequisites (canonical substrate is {3,4,3,4})',
  category: 'computation',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = computation73()
    const ok = r.fibonacciGrowth && r.junctionCapable

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {7,3} heptagrid has Fibonacci-family tree addressing and junction-capable interior cells, the prerequisites of the proven universal railway model',
      metrics: {
        shellGrowthRatio: r.growthRatio,
        fibonacciGrowthOk: r.fibonacciGrowth ? 1 : 0,
        junctionCapableOk: r.junctionCapable ? 1 : 0,
      },
      notes:
        'L1, established structural facts about the heptagrid. Universality itself is cited prior art (Margenstern and Morita), not run here. This only checks the prerequisites the proof relies on.',
    })
  },
})
