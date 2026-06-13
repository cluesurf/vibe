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

import { pathToFileURL } from 'node:url'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The committed signed-majority rule, run on an explicit adjacency: each vibe's next tone is
// the sign of the fill-weighted vote of its neighbors. Ternary tones, ternary fills.
function runSignedMajority(input: {
  neighbors: number[][]
  beats: number
  seed: number
}): { settledFraction: number; toneHistogram: { minus: number; zero: number; plus: number } } {
  const { neighbors, beats } = input
  const n = neighbors.length
  const rng = makeRng({ seed: input.seed })
  const tone = new Int8Array(n)
  for (let i = 0; i < n; i++) tone[i] = (rng.nextInt({ max: 3 }) - 1) as number
  // symmetric ternary fill per undirected note
  const fill: Map<number, number>[] = Array.from({ length: n }, () => new Map<number, number>())
  for (let a = 0; a < n; a++) {
    for (const b of neighbors[a]!) {
      if (b > a) {
        const f = rng.nextInt({ max: 3 }) - 1
        fill[a]!.set(b, f)
        fill[b]!.set(a, f)
      }
    }
  }
  let changedLast = n
  for (let beat = 0; beat < beats; beat++) {
    let changed = 0
    for (let s = 0; s < n; s++) {
      const v = rng.nextInt({ max: n })
      let h = 0
      for (const w of neighbors[v]!) h += (fill[v]!.get(w) ?? 0) * (tone[w] ?? 0)
      const next = h > 0 ? 1 : h < 0 ? -1 : 0
      if (next !== tone[v]) changed++
      tone[v] = next as number
    }
    changedLast = changed
  }
  let minus = 0
  let zero = 0
  let plus = 0
  for (let i = 0; i < n; i++) {
    const t = tone[i] ?? 0
    if (t < 0) minus++
    else if (t === 0) zero++
    else plus++
  }
  return { settledFraction: 1 - changedLast / n, toneHistogram: { minus, zero, plus } }
}

export function coxeterEngine(): {
  facetCounts: { symbol: string; geometry: string; cells: number; facetCount: number; expected: number }[]
  allFacetsCorrect: boolean
  dodecagridGenerations: { generation: number; newCells: number; total: number }[]
  dodecagridExplodes: boolean
  dodecagridDynamics: { settledFraction: number; toneHistogram: { minus: number; zero: number; plus: number } }
  solved: boolean
} {
  // T2: facet counts for the standard tilings, the true degree from full adjacency.
  const cases: { symbol: number[]; expected: number; depth: number; maxChambers: number }[] = [
    { symbol: [7, 3], expected: 7, depth: 14, maxChambers: 30000 },
    { symbol: [5, 4], expected: 5, depth: 14, maxChambers: 30000 },
    { symbol: [8, 3], expected: 8, depth: 14, maxChambers: 30000 },
    { symbol: [5, 3, 4], expected: 12, depth: 22, maxChambers: 70000 },
    { symbol: [4, 3, 5], expected: 6, depth: 22, maxChambers: 70000 },
    { symbol: [3, 5, 3], expected: 20, depth: 22, maxChambers: 70000 },
  ]
  const facetCounts = cases.map((c) => {
    const mesh = buildCoxeterMesh({ symbol: c.symbol, depth: c.depth, maxChambers: c.maxChambers })
    return {
      symbol: `{${c.symbol.join(',')}}`,
      geometry: mesh.geometry,
      cells: mesh.cellCount,
      facetCount: mesh.facetCount,
      expected: c.expected,
    }
  })
  const allFacetsCorrect = facetCounts.every((f) => f.facetCount === f.expected)

  // T3 + T5: build the real dodecagrid, read its parallel generation growth, run the rule.
  const dodeca = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 22, maxChambers: 70000 })
  const perGen = new Map<number, number>()
  for (const g of dodeca.generation) perGen.set(g, (perGen.get(g) ?? 0) + 1)
  const gens = [...perGen.keys()].filter((g) => g >= 0).sort((a, b) => a - b)
  let cum = 0
  const dodecagridGenerations = gens.map((g) => {
    const newCells = perGen.get(g) ?? 0
    cum += newCells
    return { generation: g, newCells, total: cum }
  })
  // explodes: each early generation grows by more than the last (super-linear)
  const dodecagridExplodes =
    dodecagridGenerations.length >= 4 &&
    (dodecagridGenerations[3]?.newCells ?? 0) > (dodecagridGenerations[2]?.newCells ?? 0) &&
    (dodecagridGenerations[2]?.newCells ?? 0) > (dodecagridGenerations[1]?.newCells ?? 0)

  const dodecagridDynamics = runSignedMajority({ neighbors: dodeca.neighbors, beats: 200, seed: 7 })

  const solved =
    allFacetsCorrect &&
    dodecagridExplodes &&
    dodecagridDynamics.settledFraction > 0.9 &&
    facetCounts.find((f) => f.symbol === '{5,3,4}')?.facetCount === 12

  return {
    facetCounts,
    allFacetsCorrect,
    dodecagridGenerations,
    dodecagridExplodes,
    dodecagridDynamics,
    solved,
  }
}

export function main(): void {
  const r = coxeterEngine()
  console.log('P85: the general Coxeter engine, the real dodecagrid, parallel growth')
  console.log('')
  console.log('  T2: full facet-adjacency, the true neighbor count per cell:')
  for (const f of r.facetCounts) {
    const ok = f.facetCount === f.expected ? 'OK' : 'XX'
    console.log(
      `    ${f.symbol.padEnd(9)} ${f.geometry.padEnd(11)} cells=${String(f.cells).padStart(5)}  neighbors=${f.facetCount} (expected ${f.expected}) ${ok}`,
    )
  }
  console.log(`  all facet counts correct: ${r.allFacetsCorrect}`)
  console.log('')
  console.log('  T5: parallel reflection growth of the dodecagrid {5,3,4}, cells per generation:')
  for (const g of r.dodecagridGenerations.slice(0, 8)) {
    console.log(`    gen ${g.generation}: +${String(g.newCells).padStart(4)} new, ${g.total} total`)
  }
  console.log(`  explodes (super-linear): ${r.dodecagridExplodes}`)
  console.log('')
  console.log('  T3: signed-majority rule run on the real dodecagrid (12 neighbors per cell):')
  console.log(`    settled fraction: ${r.dodecagridDynamics.settledFraction.toFixed(3)}`)
  const h = r.dodecagridDynamics.toneHistogram
  console.log(`    tone histogram: -1=${h.minus}  0=${h.zero}  +1=${h.plus}`)
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'geometry/coxeter-engine',
  title: 'Coxeter engine, full facet-adjacency exact (heptagrid 7, dodecagrid 12), dodecagrid runs',
  category: 'geometry',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = coxeterEngine()
    const dodeca = r.facetCounts.find((f) => f.symbol === '{5,3,4}')
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
