// CROSS-TESSELLATION PATTERN, worked example (build any tessellation). To make an experiment run against
// ALL the regular hyperbolic tessellations, not one pinned substrate, see `note/cross-tessellation-experiments.md`.
// In short: loop `TESSELLATIONS` from `@/code/substrate/tessellation-catalog`, build each with the Coxeter
// engine (this file shows the true-facet-adjacency build; `buildCoxeterMatrixMesh` is the uniform one), and
// measure each with `measureTessellation` from `@/code/measure/tessellation-battery`. `dimension.ts` is the
// companion "take one measure across the catalog" example, and `substrate-survey/tessellation-survey` is the
// canonical full survey.
//
// P85: the general Coxeter engine, the real dodecagrid, and parallel reflection growth.
// (Implements todos T2, T3, T5.)
//
// T2: one engine builds any regular tiling {p,q} or honeycomb {p,q,r} by reflecting the
//     fundamental chamber, dedupes coincident chambers (so cousin links appear and the mesh
//     is whole), and reads off the FULL facet-adjacency. It replaces the spanning-tree
//     generators. The neighbor count comes out exactly: heptagrid {7,3} = 7, pentagrid
//     {5,4} = 5, octagrid {8,3} = 8, dodecagrid {5,3,4} = 12, cube honeycomb {4,3,5} = 6,
//     icosahedral honeycomb {3,5,3} = 20.
// T3: the real 3D dodecagrid {5,3,4} (twelve neighbors per cell) is built and the
//     signed-majority rule is run on it, reaching a stable configuration.
// T5: growth is parallel: each generation reflects the whole frontier at once, and coincident
//     chambers dedupe (local ring-closure), so the cell count explodes generation by
//     generation while the mesh stays whole.
// Run: npx tsx code/experiment/p85-coxeter-engine.ts

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { runAsynchronousSignedMajority } from '@/code/operator/signed-majority'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function coxeterEngine(): {
  facetCounts: {
    symbol: string
    geometry: string
    cells: number
    facetCount: number
    expected: number
  }[]
  allFacetsCorrect: boolean
  dodecagridGenerations: {
    generation: number
    newCells: number
    total: number
  }[]
  dodecagridExplodes: boolean
  dodecagridDynamics: {
    settledFraction: number
    toneHistogram: { minus: number; zero: number; plus: number }
  }
  solved: boolean
} {
  // T2: facet counts for the standard tilings, the true degree from full adjacency.
  const cases: {
    symbol: number[]
    expected: number
    depth: number
    maxChambers: number
  }[] = [
    { symbol: [7, 3], expected: 7, depth: 14, maxChambers: 30000 },
    { symbol: [5, 4], expected: 5, depth: 14, maxChambers: 30000 },
    { symbol: [8, 3], expected: 8, depth: 14, maxChambers: 30000 },
    { symbol: [5, 3, 4], expected: 12, depth: 18, maxChambers: 20000 },
    { symbol: [4, 3, 5], expected: 6, depth: 18, maxChambers: 20000 },
    { symbol: [3, 5, 3], expected: 20, depth: 18, maxChambers: 20000 },
  ]

  const facetCounts = cases.map(c => {
    const mesh = buildCoxeterMesh({
      symbol: c.symbol,
      depth: c.depth,
      maxChambers: c.maxChambers,
    })

    return {
      symbol: `{${c.symbol.join(',')}}`,
      geometry: mesh.geometry,
      cells: mesh.cellCount,
      facetCount: mesh.facetCount,
      expected: c.expected,
    }
  })

  const allFacetsCorrect = facetCounts.every(
    f => f.facetCount === f.expected,
  )

  // T3 + T5: build the real dodecagrid, read its parallel generation growth, run the rule.
  const dodeca = buildCoxeterMesh({
    symbol: [5, 3, 4],
    depth: 18,
    maxChambers: 20000,
  })

  const perGen = new Map<number, number>()

  for (const g of dodeca.generation) {
    perGen.set(g, (perGen.get(g) ?? 0) + 1)
  }

  const gens = [...perGen.keys()]
    .filter(g => g >= 0)
    .sort((a, b) => a - b)

  let cum = 0

  const dodecagridGenerations = gens.map(g => {
    const newCells = perGen.get(g) ?? 0

    cum += newCells

    return { generation: g, newCells, total: cum }
  })

  // explodes: each early generation grows by more than the last (super-linear)
  const dodecagridExplodes =
    dodecagridGenerations.length >= 4 &&
    (dodecagridGenerations[3]?.newCells ?? 0) >
      (dodecagridGenerations[2]?.newCells ?? 0) &&
    (dodecagridGenerations[2]?.newCells ?? 0) >
      (dodecagridGenerations[1]?.newCells ?? 0)

  const dodecagridDynamics = runAsynchronousSignedMajority({
    neighbors: dodeca.neighbors,
    beats: 200,
    seed: 7,
  })

  const solved =
    allFacetsCorrect &&
    dodecagridExplodes &&
    dodecagridDynamics.settledFraction > 0.9 &&
    facetCounts.find(f => f.symbol === '{5,3,4}')?.facetCount === 12

  return {
    facetCounts,
    allFacetsCorrect,
    dodecagridGenerations,
    dodecagridExplodes,
    dodecagridDynamics,
    solved,
  }
}

export default experiment({
  id: 'geometry/coxeter-engine',
  code: 'E-GMT-0004',
  title:
    'Coxeter engine, full facet-adjacency exact (heptagrid 7, dodecagrid 12), dodecagrid runs',
  category: 'geometry',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = coxeterEngine()
    const dodeca = r.facetCounts.find(f => f.symbol === '{5,3,4}')
    const ok =
      r.solved &&
      r.allFacetsCorrect &&
      dodeca?.facetCount === 12 &&
      r.dodecagridExplodes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the general engine builds tilings with their true facet-adjacency, the dodecagrid cell has twelve neighbors, and the signed-majority rule runs on the real 3D dodecagrid',
      metrics: {
        dodecagridFacetCount: dodeca?.facetCount ?? 0,
        dodecagridSettledFraction: r.dodecagridDynamics.settledFraction,
      },
    })
  },
})
