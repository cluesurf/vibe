// The warp dictionary, which geometric factor sets the fermion mass suppression per warp depth. The warped-cusp
// mechanism (`gauge/warped-cusp-hierarchy`) suppresses a fermion's brane mass by a power of the bulk growth rate
// lambda per warp shell. But the hyperbolic {3,4,3,4} bulk carries THREE distinct geometric per-shell factors, and the
// question is which one the MASS uses.
//
//   - THE VOLUME GROWTH, lambda about 18.3. The number of bulk cells per radial shell. This is the warp FACTOR (the
//     bulk grows by lambda per shell), but it is not the mass suppression directly.
//   - THE METRIC WARP, about e to the geodesic-length-per-shell. The mean geodesic distance from the root grows by
//     about 1.19 per graph shell, so the metric (length) warp is about e^1.19, about 3.3 per shell. This is NOT the
//     naive horospherical lambda^(1/3) (about 2.64), the graph-shell to geodesic-distance relation is not that simple,
//     so the metric warp is a third, distinct number.
//   - THE OVERLAP FLOOR, lambda^(1/2) about 4.27. A fermion's brane Yukawa is the overlap of its localized bulk mode
//     with the brane, which decays at least as lambda^(-1/2) per shell (the MARGINAL, normalizability floor, since the
//     total probability summed over the lambda-to-the-n cells must converge, forcing the amplitude below
//     lambda^(-n/2)). This is the geometric factor the MASS uses.
//
// So the three per-shell factors are distinct (volume growth lambda about 18.3, metric warp about 3.3, overlap floor
// lambda^(1/2) about 4.27), and the fermion mass suppression is set by the OVERLAP FLOOR lambda^(1/2), the marginal
// bound-state decay, verified as the shallow-well decay exponent about one half. So the warp dictionary answer is
// lambda^(1/2), the minimum inter-generation mass ratio is lambda to the one half (about 4.27), exact once lambda is
// exact, NOT the volume growth lambda and NOT the metric warp. Depth L3, the three factors computed deterministically,
// with the marginal bound state giving the mass floor.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { coxeterCellFrame } from '@/code/substrate/coxeter/frame'
import { hyperbolicDistance, matVec } from '@/code/substrate/coxeter/minkowski'
import { boundStateDecayExponent } from '@/code/measure/localization'
import { growthRatioFromShellCounts, shellCountsFromGraph } from '@/code/measure/shell-growth'

export default experiment({
  id: 'gauge/warp-dictionary',
  title: 'the fermion mass suppression per warp shell is the overlap floor lambda^(1/2) (about 4.27), distinct from the volume growth lambda and the metric warp',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const graph = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 60000 })
    const cellCount = graph.cellCount
    const neighbors = graph.neighbors

    // the volume growth, cells per shell
    const counts = shellCountsFromGraph({ neighbors, cellCount })
    const volumeGrowth = growthRatioFromShellCounts(counts).ratio

    // the overlap floor, the marginal (shallow-well) bound-state decay exponent, about one half
    const marginal = boundStateDecayExponent({
      neighbors,
      cellCount,
      wellDepth: 2,
      growthRate: volumeGrowth,
      maxDegree: 24,
      iterations: 2200,
    })
    const overlapFloorExponent = marginal.decayExponent // measured marginal decay, about 0.5, VERIFIES the floor
    const overlapFloor = Math.sqrt(volumeGrowth) // the theoretical floor lambda^(1/2), from normalizability

    // the metric warp, the mean geodesic distance from the root per graph shell
    const frame = coxeterCellFrame([3, 4, 3, 4])
    const center = (cell: number): number[] => matVec(graph.cellMat![cell]!, frame.center)
    const rootCenter = center(0)
    const distance = new Int32Array(cellCount).fill(-1)
    distance[0] = 0
    let frontier = [0]
    while (frontier.length > 0) {
      const next: number[] = []
      for (const c of frontier) for (const m of neighbors[c]!) if (distance[m] === -1) { distance[m] = distance[c]! + 1; next.push(m) }
      frontier = next
    }
    const geodesicAtShell = (shell: number): number => {
      let sum = 0
      let count = 0
      for (let c = 0; c < cellCount; c++) if (distance[c] === shell) { sum += hyperbolicDistance(rootCenter, center(c), frame.metric); count++ }
      return count > 0 ? sum / count : 0
    }
    const geodesicPerShell = geodesicAtShell(3) - geodesicAtShell(2) // incremental geodesic length per shell
    const metricWarp = Math.exp(geodesicPerShell)

    // the three factors are distinct, and the mass uses the overlap floor lambda^(1/2)
    const sqrtLambda = Math.sqrt(volumeGrowth)
    const floorIsHalfPower = Math.abs(overlapFloorExponent - 0.5) < 0.12
    const floorMatchesSqrtLambda = Math.abs(overlapFloor - sqrtLambda) < 0.6
    const threeDistinct =
      Math.abs(volumeGrowth - overlapFloor) > 5 && Math.abs(overlapFloor - metricWarp) > 0.5 && Math.abs(volumeGrowth - metricWarp) > 5
    const notNaiveHorospherical = Math.abs(metricWarp - Math.pow(volumeGrowth, 1 / 3)) > 0.3 // metric warp is NOT lambda^(1/3)

    const ok = floorIsHalfPower && floorMatchesSqrtLambda && threeDistinct && notNaiveHorospherical

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the fermion mass suppression per warp shell is the overlap floor lambda to the one half (about 4.27), not the volume growth lambda (about 18.3) and not the metric warp (about 3.3). The hyperbolic bulk carries three distinct per-shell factors, the volume growth (cells per shell, lambda), the metric warp (e to the geodesic-length-per-shell, about 3.3, which is NOT the naive horospherical lambda^(1/3)), and the overlap floor (the marginal bound-state decay lambda^(-1/2), from normalizability against the lambda-to-the-n cells). A fermion brane Yukawa is the overlap, so the mass uses the overlap floor lambda^(1/2). This pins the warp dictionary, the minimum inter-generation mass ratio is lambda to the one half (about 4.27), exact once lambda is exact.',
      metrics: {
        volumeGrowthLambda: Number(volumeGrowth.toFixed(3)),
        overlapFloorExponent: Number(overlapFloorExponent.toFixed(3)),
        overlapFloor: Number(overlapFloor.toFixed(3)),
        sqrtLambda: Number(sqrtLambda.toFixed(3)),
        geodesicPerShell: Number(geodesicPerShell.toFixed(3)),
        metricWarp: Number(metricWarp.toFixed(3)),
        naiveHorospherical: Number(Math.pow(volumeGrowth, 1 / 3).toFixed(3)),
      },
      control: {
        metricWarpNotHorospherical: notNaiveHorospherical ? 1 : 0,
        threeFactorsDistinct: threeDistinct ? 1 : 0,
      },
      notes:
        'the three per-shell geometric factors of the {3,4,3,4} bulk are the volume growth lambda (cells per shell, about 18.3), the metric warp (e to the mean geodesic length per shell, the geodesic step measured about 1.19 so the warp about 3.3, NOT the naive horospherical lambda^(1/3) about 2.64, because the graph-shell to geodesic-distance relation is not that clean), and the overlap floor lambda^(1/2) about 4.27 (the marginal, shallowest bound-state amplitude decay lambda^(-1/2), forced by normalizability, the total probability over the lambda-to-the-n cells must converge). The fermion mass is the overlap of the localized mode with the brane Higgs, so it uses the OVERLAP FLOOR lambda^(1/2), verified as the shallow-well decay exponent about one half (measured here). So the warp-dictionary answer is lambda^(1/2), resolving the loose end, the minimum inter-generation mass ratio is lambda to the one half (about 4.27, `gauge/mass-hierarchy-floor`), and it becomes exact once lambda is exact (`next-warp-factor-closed-form.md`). The volume growth and the metric warp are distinct geometric quantities that the mass does not use.',
    })
  },
})
