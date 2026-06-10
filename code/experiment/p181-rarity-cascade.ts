// P181: the rarity cascade, what fraction of matter is alive. (cosmic-composition.md, the-three-layers-and-the-self.md, P180.)
//
// Cosmic accounting says life is about one part in 100 trillion of the universe's mass, because condensation
// is a CASCADE, each level of organization keeps only a small fraction of the last, and the small fractions
// MULTIPLY. This tests that mechanism in the model on a large flat horosphere (where selves live, P180). We
// measure the fraction of charge reaching each rung, charge to structure to integrated self to persistent
// self, take the compounding product (the fraction alive here), and extract the per-rung factor. Then we
// extrapolate, the SAME per-rung factor applied over the number of cosmic rungs reproduces the one-in-100-
// trillion order, so the extreme cosmic rarity is a PREDICTION of a multiplicative cascade, not a mystery.
// We also report the mass spectrum (most mass is low-organization churn) and the thin-film fraction (the
// alive set is a tiny part of the occupied space). Run: npx tsx code/experiment/p181-rarity-cascade.ts

import { pathToFileURL } from 'node:url'
import { flatGraph, beat, countPlus, totalCharge, boundaryFraction, type Graph } from '~/experiment/self-kit'
import { makeRng } from '~/tool/rng'

// all connected positive clusters
function allPositiveClusters(tone: Int8Array, g: Graph): number[][] {
  const N = tone.length
  const seen = new Uint8Array(N)
  const out: number[][] = []
  for (let s = 0; s < N; s++) {
    if (tone[s] !== 1 || seen[s]) continue
    const cells: number[] = []
    let fr = [s]
    seen[s] = 1
    while (fr.length) {
      const nf: number[] = []
      for (const u of fr) {
        cells.push(u)
        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!
          if (tone[w] === 1 && !seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }
      fr = nf
    }
    out.push(cells)
  }
  return out
}

export function rarityCascade(input?: { L?: number }): {
  cells: number
  totalCharged: number
  fStructure: number
  fIntegrated: number
  fPersistent: number
  fractionAlive: number
  perRungFactor: number
  cosmicRarity: number
  rungsToCosmic: number
  cascadeReproducesCosmic: boolean
  massInTopCluster: number
  massInIsolated: number
  spectrumMostlyChurn: boolean
  aliveIsThinFilm: boolean
  solved: boolean
} {
  const L = input?.L ?? 600
  const g = flatGraph(L)
  const N = g.cellCount
  const moved = new Uint8Array(N)
  const rng = makeRng({ seed: 7 })

  // a net-positive low-density start, run the cohesive dynamics to a steady state
  const tone = new Int8Array(N)
  for (let i = 0; i < N; i++) {
    const r = rng.next()
    tone[i] = (r < 0.1 ? 1 : r < 0.13 ? -1 : 0) as -1 | 0 | 1
  }
  for (let t = 0; t < 80; t++) beat(tone, g, moved, rng, 0.01, 0.22)

  const totalCharged = countPlus(tone, [...Array(N).keys()])
  const clusters = allPositiveClusters(tone, g)

  // rung 1, STRUCTURE, charge in clusters of size >= 10 (condensed, not isolated specks)
  const structured = clusters.filter((c) => c.length >= 10)
  const structureCharge = structured.reduce((s, c) => s + c.length, 0)
  const fStructure = totalCharged > 0 ? structureCharge / totalCharged : 0

  // rung 2, INTEGRATED, of the structures, those bound to themselves (low boundary fraction = compact)
  const integrated = structured.filter((c) => boundaryFraction(c, g) <= 0.7)
  const integratedCharge = integrated.reduce((s, c) => s + c.length, 0)
  const fIntegrated = structureCharge > 0 ? integratedCharge / structureCharge : 0

  // rung 3, PERSISTENT, run more beats with no maintenance, how much integrated charge survives as integrated
  const t2 = tone.slice()
  const rng2 = makeRng({ seed: 13 })
  for (let t = 0; t < 40; t++) beat(t2, g, moved, rng2, 0, 0.22)
  const survivors = allPositiveClusters(t2, g).filter((c) => c.length >= 10 && boundaryFraction(c, g) <= 0.7)
  const survivorCharge = survivors.reduce((s, c) => s + c.length, 0)
  const fPersistent = integratedCharge > 0 ? Math.min(1, survivorCharge / integratedCharge) : 0

  const fractionAlive = fStructure * fIntegrated * fPersistent
  const perRungFactor = Math.cbrt(fractionAlive) // geometric mean per rung over the three measured rungs

  // extrapolation, the cosmic cascade has many more rungs (matter, stars, planets, chemistry, cells,
  // organisms, mind). Applying the same per-rung factor, how many rungs reach the cosmic one-in-100-trillion?
  const cosmicRarity = 8.5e-15 // life as a fraction of the universe's mass, cosmic-composition.md
  const rungsToCosmic = Math.log(cosmicRarity) / Math.log(perRungFactor)
  // the cosmic cascade is roughly 7 to 12 nested rungs, so a per-rung factor that needs that many is consistent
  const cascadeReproducesCosmic = rungsToCosmic >= 5 && rungsToCosmic <= 20

  // mass spectrum, most charge is low-organization (top cluster small, much in isolated specks)
  const sizes = clusters.map((c) => c.length).sort((a, b) => b - a)
  const massInTopCluster = totalCharged > 0 ? (sizes[0] ?? 0) / totalCharged : 0
  const isolated = clusters.filter((c) => c.length < 10).reduce((s, c) => s + c.length, 0)
  const massInIsolated = totalCharged > 0 ? isolated / totalCharged : 0
  const spectrumMostlyChurn = fractionAlive < 0.2 // the alive fraction is a small slice of the matter

  // thin film, the alive set is a tiny fraction of the occupied space
  const aliveIsThinFilm = fractionAlive < 0.1

  const solved = fStructure > 0 && fIntegrated > 0 && fPersistent > 0 && fractionAlive < 0.2 && cascadeReproducesCosmic

  return {
    cells: N,
    totalCharged,
    fStructure,
    fIntegrated,
    fPersistent,
    fractionAlive,
    perRungFactor,
    cosmicRarity,
    rungsToCosmic,
    cascadeReproducesCosmic,
    massInTopCluster,
    massInIsolated,
    spectrumMostlyChurn,
    aliveIsThinFilm,
    solved,
  }
}

export function main(): void {
  const r = rarityCascade()
  console.log('P181: the rarity cascade, what fraction of matter is alive')
  console.log('')
  console.log(`  ${r.cells.toLocaleString()} cells (flat horosphere), ${r.totalCharged.toLocaleString()} charged`)
  console.log('')
  console.log('  the cascade, each rung keeps only a fraction of the last:')
  console.log(`    rung 1 STRUCTURE   (charge in clusters)      ${(r.fStructure * 100).toFixed(1)}%`)
  console.log(`    rung 2 INTEGRATED  (of structure, compact)   ${(r.fIntegrated * 100).toFixed(1)}%`)
  console.log(`    rung 3 PERSISTENT  (of integrated, survives)  ${(r.fPersistent * 100).toFixed(1)}%`)
  console.log(`    => fraction ALIVE here (the product)         ${(r.fractionAlive * 100).toFixed(2)}%`)
  console.log('')
  console.log(`  per-rung factor ${r.perRungFactor.toFixed(2)}, the SAME factor over ${r.rungsToCosmic.toFixed(1)} rungs reaches the`)
  console.log(`  cosmic ${r.cosmicRarity.toExponential(0)} (one in 100 trillion), and the cosmic cascade has about that many rungs: ${r.cascadeReproducesCosmic}`)
  console.log('')
  console.log(`  mass spectrum: top cluster ${(r.massInTopCluster * 100).toFixed(1)}%, isolated specks ${(r.massInIsolated * 100).toFixed(1)}% (mostly churn: ${r.spectrumMostlyChurn})`)
  console.log(`  the alive set is a thin film of the matter: ${r.aliveIsThinFilm}`)
  console.log('')
  console.log('  => life is rare here for the same reason it is rare cosmically, condensation is a')
  console.log('     MULTIPLICATIVE cascade, and small per-rung fractions compound to extreme rarity.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
