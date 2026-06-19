// P87: the exact word-problem engine. (Implements the word-engine upgrade.)
//
// The coordinate engine (P85) dedupes chambers by rounded position, which is fast but crowds and
// drifts at depth. The word engine instead names each chamber by a word in the reflection
// generators and dedupes by its ShortLex normal form (Tits' theorem: cancellation plus braid
// moves), so it is EXACT, integer-only, with no rim crowding. Decisive checks:
//   - Finite (spherical) Coxeter groups are enumerated to their exact order: A2=6, B2=8,
//     I2(7)=14, A3=S4=24, B3=48, H3=120 (the dodecahedron's symmetry). The coordinate engine
//     cannot do this, the word engine gets it on the nose.
//   - Hyperbolic crystals give the exact cell facet count with no floating point: heptagrid
//     {7,3}=7, pentagrid {5,4}=5, dodecagrid {5,3,4}=12, by contracting the cell-stabilizer
//     cosets and reading the outward-generator edges.
//   - Exact chamber ball-growth (the growth function), integer for integer.
// Run: npx tsx code/experiment/p87-word-engine.ts

import { buildWordMesh } from '@/code/substrate/coxeter/word'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function wordEngine(): {
  finiteOrders: {
    symbol: string
    name: string
    chambers: number
    expected: number
  }[]
  finiteAllExact: boolean
  cellFacets: {
    symbol: string
    facet: number
    expected: number
    cells: number
  }[]
  facetsAllExact: boolean
  heptagridBallGrowth: number[]
  dodecagridFacet: number
  solved: boolean
} {
  // Finite (spherical) groups, enumerated to their exact order.
  const finiteCases: {
    symbol: number[]
    name: string
    expected: number
  }[] = [
    { symbol: [3], name: 'A2', expected: 6 },
    { symbol: [4], name: 'B2', expected: 8 },
    { symbol: [7], name: 'I2(7)', expected: 14 },
    { symbol: [3, 3], name: 'A3=S4', expected: 24 },
    { symbol: [4, 3], name: 'B3', expected: 48 },
    { symbol: [5, 3], name: 'H3', expected: 120 },
  ]

  const finiteOrders = finiteCases.map(c => {
    const w = buildWordMesh({
      symbol: c.symbol,
      maxLength: 30,
      maxChambers: 5000,
    })

    return {
      symbol: `{${c.symbol.join(',')}}`,
      name: c.name,
      chambers: w.chamberCount,
      expected: c.expected,
    }
  })

  const finiteAllExact = finiteOrders.every(
    f => f.chambers === f.expected,
  )

  // Hyperbolic crystals, exact cell facet count by coset contraction.
  const facetCases: {
    symbol: number[]
    expected: number
    maxLength: number
    maxChambers: number
  }[] = [
    { symbol: [7, 3], expected: 7, maxLength: 10, maxChambers: 8000 },
    { symbol: [5, 4], expected: 5, maxLength: 9, maxChambers: 8000 },
    {
      symbol: [5, 3, 4],
      expected: 12,
      maxLength: 12,
      maxChambers: 60000,
    },
  ]

  const cellFacets = facetCases.map(c => {
    const w = buildWordMesh({
      symbol: c.symbol,
      maxLength: c.maxLength,
      maxChambers: c.maxChambers,
    })

    return {
      symbol: `{${c.symbol.join(',')}}`,
      facet: w.cellFacetCount,
      expected: c.expected,
      cells: w.cellCount,
    }
  })

  const facetsAllExact = cellFacets.every(f => f.facet === f.expected)

  const hepta = buildWordMesh({
    symbol: [7, 3],
    maxLength: 10,
    maxChambers: 8000,
  })

  const dodecaFacet =
    cellFacets.find(f => f.symbol === '{5,3,4}')?.facet ?? 0

  const solved = finiteAllExact && facetsAllExact && dodecaFacet === 12

  return {
    finiteOrders,
    finiteAllExact,
    cellFacets,
    facetsAllExact,
    heptagridBallGrowth: hepta.ballGrowth,
    dodecagridFacet: dodecaFacet,
    solved,
  }
}

export default experiment({
  id: 'addressing/word-engine',
  title:
    'ShortLex normal forms give exact finite group orders and exact cell facet counts',
  category: 'addressing',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = wordEngine()
    const ok =
      r.solved &&
      r.finiteAllExact &&
      r.facetsAllExact &&
      r.dodecagridFacet === 12

    const h3 = r.finiteOrders.find(f => f.name === 'H3')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the word-problem engine enumerates finite Coxeter groups to exact order with H3 = 120 and gives exact cell facet counts with the dodecagrid at 12, coordinate-free',
      metrics: {
        h3Chambers: h3?.chambers ?? 0,
        dodecagridFacet: r.dodecagridFacet,
        finiteAllExact: r.finiteAllExact ? 1 : 0,
        facetsAllExact: r.facetsAllExact ? 1 : 0,
      },
    })
  },
})
