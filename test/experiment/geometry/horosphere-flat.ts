// P142: the horosphere is a FLAT layer inside the curved {5,3,4}. (coxeter-reflection-structures.md, P133, P137.)
//
// The QFT and Lorentz physics belong to an emergent FLAT geometry, not the hyperbolic scaffold (P133,
// P134, P137). The natural flat surface inside hyperbolic space is a HOROSPHERE. {5,3,4} is cocompact, so
// a horosphere is not a reflection subgroup, it is a flat SURFACE the cells cross aperiodically
// (buildHorosphere extracts it as a Busemann level set). This verifies the extracted sheet is genuinely
// FLAT, its cell count grows POLYNOMIALLY (like a Euclidean disk, count ~ r^2), in sharp contrast to the
// bulk, whose ball grows EXPONENTIALLY. Flat growth confirms the horosphere is the Euclidean layer.
// Run: npx tsx code/experiment/p142-horosphere-flat.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph, buildHorosphere } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// hyperbolic distance between two Poincare-ball points
function hdist(x: number[], y: number[]): number {
  let d2 = 0
  let rx = 0
  let ry = 0
  for (let k = 0; k < x.length; k++) {
    d2 += (x[k]! - y[k]!) ** 2
    rx += x[k]! * x[k]!
    ry += y[k]! * y[k]!
  }
  return Math.acosh(1 + (2 * d2) / Math.max(1e-12, (1 - rx) * (1 - ry)))
}

// nearest-neighbour proximity graph on a set of points (the INTRINSIC surface connectivity), connecting
// cells within a threshold ambient distance, chosen from the median nearest-neighbour distance
function proximityGraph(coords: number[][]): number[][] {
  const n = coords.length
  const nnDist: number[] = []
  for (let i = 0; i < n; i++) {
    let mn = Infinity
    for (let j = 0; j < n; j++) if (j !== i) {
      const d = hdist(coords[i]!, coords[j]!)
      if (d < mn) mn = d
    }
    nnDist.push(mn)
  }
  const sorted = [...nnDist].sort((a, b) => a - b)
  const median = sorted[Math.floor(n / 2)]!
  const threshold = 1.7 * median
  const neighbors: number[][] = coords.map(() => [])
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (hdist(coords[i]!, coords[j]!) < threshold) {
    neighbors[i]!.push(j)
    neighbors[j]!.push(i)
  }
  return neighbors
}

// BFS shell sizes from a seed in an adjacency list
function shells(neighbors: number[][], seed: number, maxR: number): number[] {
  const n = neighbors.length
  const dist = new Int32Array(n).fill(-1)
  dist[seed] = 0
  let fr = [seed]
  const sizes = [1]
  let r = 0
  while (fr.length > 0 && r < maxR) {
    r++
    const next: number[] = []
    for (const u of fr) for (const w of neighbors[u]!) if (dist[w] === -1) {
      dist[w] = r
      next.push(w)
    }
    if (next.length === 0) break
    sizes.push(next.length)
    fr = next
  }
  return sizes
}

// effective dimension d from cumulative count C(r) ~ r^d (log-log slope), and the avg shell-to-shell ratio
function growthFromShells(sizes: number[]): { dim: number; ratio: number } {
  const cum: number[] = []
  let s = 0
  for (const x of sizes) {
    s += x
    cum.push(s)
  }
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0
  for (let r = 1; r < cum.length; r++) {
    const x = Math.log(r + 1)
    const y = Math.log(cum[r]!)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }
  const dim = m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0
  let rs = 0
  let rc = 0
  for (let r = 2; r < sizes.length; r++) if (sizes[r - 1]! > 0) {
    rs += sizes[r]! / sizes[r - 1]!
    rc++
  }
  return { dim, ratio: rc > 0 ? rs / rc : 0 }
}

function centerNearestOrigin(coords: number[][]): number {
  let center = 0
  let best = Infinity
  for (let i = 0; i < coords.length; i++) {
    const r = coords[i]!.reduce((s, v) => s + v * v, 0)
    if (r < best) {
      best = r
      center = i
    }
  }
  return center
}

export function horosphereFlat(input?: { maxCells?: number }): {
  bulkCells: number
  horoCells: number
  horoDim: number
  horoRatio: number
  bulkRatio: number
  horoIsFlat: boolean
  bulkIsExponential: boolean
  flatterThanBulk: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 14000
  const bulk = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const horo = buildHorosphere({ symbol: [5, 3, 4], maxCells, bandHalfWidth: 0.3 })

  // bulk: intrinsic growth via the face-adjacency BFS shells (exponential on the hyperbolic crystal)
  const bulkG = growthFromShells(shells(bulk.neighbors, 0, 9))

  // horosphere: build the in-surface PROXIMITY graph, then BFS shells (linear if flat, exponential if curved)
  const prox = proximityGraph(horo.coords)
  const hc = centerNearestOrigin(horo.coords)
  const horoG = growthFromShells(shells(prox, hc, 14))

  // flat = POLYNOMIAL (finite-dimensional, sub-exponential) growth, the slab is a few cells thick so the
  // dimension sits a little above 2, the decisive signal is polynomial vs the bulk's exponential
  const horoIsFlat = horoG.dim > 1.4 && horoG.dim < 3.5 && horoG.ratio < 2.6
  const bulkIsExponential = bulkG.ratio > 1.8 // shells multiply
  const flatterThanBulk = horoG.ratio < bulkG.ratio - 1.5 // far flatter than the exponential bulk
  const solved = horoIsFlat && bulkIsExponential && flatterThanBulk

  return {
    bulkCells: bulk.cellCount,
    horoCells: horo.cellCount,
    horoDim: horoG.dim,
    horoRatio: horoG.ratio,
    bulkRatio: bulkG.ratio,
    horoIsFlat,
    bulkIsExponential,
    flatterThanBulk,
    solved,
  }
}

export function main(): void {
  const r = horosphereFlat()
  console.log('P142: the horosphere is a FLAT layer inside the curved {5,3,4}')
  console.log('')
  console.log(`  bulk: ${r.bulkCells} cells. BFS shell-to-shell ratio ${r.bulkRatio.toFixed(2)} (>1 = EXPONENTIAL, curved): ${r.bulkIsExponential}`)
  console.log(`  horosphere band: ${r.horoCells} cells (a Busemann level set), measured via the in-surface proximity graph`)
  console.log(`    effective dimension (cumulative ~ r^d) = ${r.horoDim.toFixed(2)} (near 2 = a flat 2D sheet)`)
  console.log(`    BFS shell-to-shell ratio ${r.horoRatio.toFixed(2)} (-> 1 = POLYNOMIAL, FLAT)`)
  console.log('')
  console.log(`  the horosphere is FLAT (polynomial near-2D growth): ${r.horoIsFlat}`)
  console.log(`  the bulk is exponential, and the horosphere is far flatter: ${r.flatterThanBulk}`)
  console.log('')
  console.log('  => a horosphere is the natural Euclidean FLAT sheet inside the curved hyperbolic crystal,')
  console.log('     the geometry where the emergent Lorentz/QFT physics belongs.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'geometry/horosphere-flat',
  title: 'a Busemann level set of {5,3,4} grows polynomially, a flat 2D sheet inside the curved crystal',
  category: 'geometry',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = horosphereFlat({ maxCells: 14000 })
    const ok = r.solved && r.horoIsFlat && r.bulkIsExponential && r.flatterThanBulk
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a horosphere of {5,3,4} grows polynomially with effective dimension near two while the bulk grows exponentially, the natural Euclidean flat layer inside the curved crystal',
      metrics: {
        horoDimension: r.horoDim,
        horoRatio: r.horoRatio,
      },
      control: {
        bulkRatio: r.bulkRatio,
      },
    })
  },
})
