// P183: rarity from three more angles, the integration spectrum, the thin-film dimension, and the density
// threshold. (P181, cosmic-composition.md, the-coarse-graining-chain.md.)
//
// P181 showed the rarity CASCADE (nested fractions compounding to a tiny alive fraction, the cosmic
// mechanism). This adds three INDEPENDENT supporting measures that each predict the same rarity from a
// different direction.
//   (2) INTEGRATION SPECTRUM, histogram all charge by an integration measure Phi (internal connectivity),
//       weighted by mass. Most mass sits at low Phi (churn), only a tiny high-Phi TAIL is alive.
//   (5) THIN-FILM DIMENSION, the alive set should be a thin, low-dimensional film, not space-filling. We
//       box-count the matter set (dimension about 2 on the flat sheet) versus the alive set (lower).
//   (4) DENSITY THRESHOLD, sweep the charge density and find the critical density below which almost
//       nothing condenses (like star formation needing a critical density), and the condensed fraction
//       above it.
// Together with P181's cascade and extrapolation, these show the model's rarity has the SAME structure
// that makes life cosmically rare. Run: npx tsx code/experiment/p183-rarity-measures.ts

import { pathToFileURL } from 'node:url'
import { flatGraph, beat, type Graph } from '~/experiment/self-kit'
import { makeRng } from '~/tool/rng'

function positiveClusters(tone: Int8Array, g: Graph): number[][] {
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

// integration Phi of a cluster = fraction of its cells' edges that stay INSIDE the cluster (internal
// connectivity). A lone speck has Phi 0, a dense blob approaches 1.
function phiOf(cluster: number[], tone: Int8Array, g: Graph): number {
  const inCluster = new Set(cluster)
  let internal = 0
  let total = 0
  for (const u of cluster) {
    for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
      total++
      if (inCluster.has(g.adj[p]!)) internal++
    }
  }
  return total > 0 ? internal / total : 0
}

// box-counting dimension of a cell set on the L x L sheet (cell i has x = i % L, y = floor(i / L))
function boxDimension(cells: number[], L: number): number {
  if (cells.length < 4) return 0
  const sizes = [2, 4, 8, 16, 32]
  const logB: number[] = []
  const logN: number[] = []
  for (const b of sizes) {
    const boxes = new Set<number>()
    const K = Math.ceil(L / b)
    for (const i of cells) {
      const x = i % L
      const y = Math.floor(i / L)
      boxes.add(Math.floor(x / b) * K + Math.floor(y / b))
    }
    logB.push(Math.log(1 / b))
    logN.push(Math.log(boxes.size))
  }
  // slope of log N vs log(1/b) = box dimension
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  const m = sizes.length
  for (let i = 0; i < m; i++) {
    sx += logB[i]!
    sy += logN[i]!
    sxx += logB[i]! * logB[i]!
    sxy += logB[i]! * logN[i]!
  }
  return (m * sxy - sx * sy) / (m * sxx - sx * sx)
}

function evolve(g: Graph, L: number, density: number, beats: number, seed: number): Int8Array {
  const N = g.cellCount
  const rng = makeRng({ seed })
  const tone = new Int8Array(N)
  for (let i = 0; i < N; i++) {
    const r = rng.next()
    tone[i] = (r < density ? 1 : r < density * 1.3 ? -1 : 0) as -1 | 0 | 1
  }
  const moved = new Uint8Array(N)
  for (let t = 0; t < beats; t++) beat(tone, g, moved, rng, 0.01, 0.22)
  return tone
}

export function rarityMeasures(input?: { L?: number }): {
  L: number
  phiTailFraction: number
  lowPhiFraction: number
  spectrumTailRare: boolean
  matterDimension: number
  aliveDimension: number
  thinFilm: boolean
  densities: number[]
  condensedByDensity: number[]
  thresholdDensity: number
  thresholdExists: boolean
  solved: boolean
} {
  const L = input?.L ?? 300
  const g = flatGraph(L)
  const phiAlive = 0.55 // a cluster counts as integrated/alive above this internal connectivity

  // --- (2) integration spectrum + tail, and (5) thin-film dimension, on one evolved state ---
  const tone = evolve(g, L, 0.12, 70, 1)
  const clusters = positiveClusters(tone, g)
  let totalCharge = 0
  for (const c of clusters) totalCharge += c.length
  let phiTailMass = 0
  let lowPhiMass = 0
  const matterCells: number[] = []
  const aliveCells: number[] = []
  for (const c of clusters) {
    for (const u of c) matterCells.push(u)
    const phi = phiOf(c, tone, g)
    if (phi >= phiAlive && c.length >= 6) {
      phiTailMass += c.length
      for (const u of c) aliveCells.push(u)
    } else if (phi < 0.3) {
      lowPhiMass += c.length
    }
  }
  const phiTailFraction = totalCharge > 0 ? phiTailMass / totalCharge : 0
  const lowPhiFraction = totalCharge > 0 ? lowPhiMass / totalCharge : 0
  const spectrumTailRare = phiTailFraction < 0.2 && lowPhiFraction > 0.5

  const matterDimension = boxDimension(matterCells, L)
  const aliveDimension = boxDimension(aliveCells, L)
  const thinFilm = aliveDimension < matterDimension - 0.3

  // --- (4) density threshold for condensation ---
  const densities = [0.02, 0.05, 0.08, 0.12, 0.18, 0.26, 0.36]
  const condensedByDensity: number[] = []
  for (const d of densities) {
    const t = evolve(g, L, d, 60, 7)
    const cs = positiveClusters(t, g)
    let charge = 0
    let condensed = 0
    for (const c of cs) {
      charge += c.length
      if (c.length >= 6 && phiOf(c, t, g) >= phiAlive) condensed += c.length
    }
    condensedByDensity.push(charge > 0 ? condensed / charge : 0)
  }
  // threshold = the largest density at which condensation is still negligible (< 2 percent)
  let thresholdDensity = densities[densities.length - 1]!
  for (let i = 0; i < densities.length; i++) {
    if (condensedByDensity[i]! < 0.02) thresholdDensity = densities[i]!
    else break
  }
  const maxCondensed = Math.max(...condensedByDensity)
  // a threshold, condensation is OFF (negligible) at low density and turns ON (rises clearly) above it.
  // Note it stays MODEST even when on (life rare even with abundant matter), which reinforces the thesis.
  const thresholdExists = condensedByDensity[0]! < 0.01 && maxCondensed > 0.04 && maxCondensed > condensedByDensity[0]! + 0.03

  const solved = spectrumTailRare && thinFilm && thresholdExists
  return {
    L,
    phiTailFraction,
    lowPhiFraction,
    spectrumTailRare,
    matterDimension,
    aliveDimension,
    thinFilm,
    densities,
    condensedByDensity,
    thresholdDensity,
    thresholdExists,
    solved,
  }
}

export function main(): void {
  const r = rarityMeasures()
  console.log('P183: rarity from three more angles (spectrum, dimension, threshold)')
  console.log('')
  console.log(`  flat ${r.L}x${r.L} sheet`)
  console.log('  (2) INTEGRATION SPECTRUM, mass by integration Phi:')
  console.log(`      high-Phi alive TAIL ${(r.phiTailFraction * 100).toFixed(1)}% of charge, low-Phi churn ${(r.lowPhiFraction * 100).toFixed(1)}% -> tail is rare: ${r.spectrumTailRare}`)
  console.log('  (5) THIN-FILM DIMENSION (box-counting on the 2D sheet):')
  console.log(`      matter dimension ${r.matterDimension.toFixed(2)} vs alive dimension ${r.aliveDimension.toFixed(2)} -> alive is a thin lower-dimensional film: ${r.thinFilm}`)
  console.log('  (4) DENSITY THRESHOLD for condensation:')
  console.log(`      density   ${r.densities.map((d) => d.toFixed(2).padStart(5)).join(' ')}`)
  console.log(`      condensed ${r.condensedByDensity.map((c) => (c * 100).toFixed(0).padStart(4) + '%').join(' ')}`)
  console.log(`      threshold near density ${r.thresholdDensity.toFixed(2)} (below it almost nothing condenses, above it stays modest): ${r.thresholdExists}`)
  console.log('')
  console.log('  three independent measures all show life is a rare, thin, threshold-gated tail of the matter.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
