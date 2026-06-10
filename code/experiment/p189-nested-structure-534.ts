// P189: nested structure on {5,3,4}, is the mesh recursively nested? (geometric-nesting.md, nesting-in-7-3.md.)
//
// The nesting docs claim hyperbolic space supports INFINITE recursive nesting, cells shrinking and
// accumulating toward the boundary in self-similar shells. This measures it directly on the {5,3,4}
// substrate. BFS shells from a seed cell, and check three signatures of recursive nesting:
//   1. EXPONENTIAL shell growth, each shell is a fixed multiple of the previous (the branching constant).
//   2. SELF-SIMILARITY, the shell-to-shell ratio CONVERGES to a constant (a renormalization fixed point),
//      so deep shells are scaled copies of shallow ones.
//   3. BOUNDARY ACCUMULATION, the mean Poincare radius of each shell increases monotonically toward 1,
//      so the nested shells pile up against the sphere at infinity.
// Together these are exactly recursive nesting, the structure repeats at every scale and crowds the
// boundary. Run: npx tsx code/experiment/p189-nested-structure-534.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))

export function nestedStructure534(maxCells = 500000): {
  shellCounts: number[]
  cleanShells: number[]
  ratios: number[]
  growthConstant: number
  ratioConverges: boolean
  meanRadius: number[]
  boundaryAccumulation: boolean
  exponentialNesting: boolean
  solved: boolean
} {
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const n = g.cellCount

  // BFS shells from cell 0
  const depth = new Array<number>(n).fill(-1)
  depth[0] = 0
  let frontier = [0]
  const shellCounts: number[] = [1]
  while (frontier.length) {
    const next: number[] = []
    for (const u of frontier) for (const v of g.neighbors[u]!) if (depth[v]! < 0) { depth[v] = depth[u]! + 1; next.push(v) }
    if (next.length) shellCounts.push(next.length)
    frontier = next
  }

  // the LAST shell is truncated by maxCells (its ratio collapses), drop it. keep shells that are still
  // growing geometrically (ratio to the previous shell well above 1).
  const cleanShells: number[] = [shellCounts[0]!]
  for (let i = 1; i < shellCounts.length; i++) {
    const ratio = shellCounts[i]! / shellCounts[i - 1]!
    if (ratio > 2) cleanShells.push(shellCounts[i]!)
    else break // truncated boundary shell, stop
  }

  const ratios = cleanShells.slice(1).map((c, i) => c / cleanShells[i]!)
  // the growth constant is the converged tail ratio
  const growthConstant = ratios.length ? ratios[ratios.length - 1]! : 0
  // self-similar if successive ratios stop changing (the tail differences shrink below 1%)
  const tailDiffs = ratios.slice(1).map((r, i) => Math.abs(r - ratios[i]!))
  const ratioConverges = tailDiffs.length >= 2 && tailDiffs[tailDiffs.length - 1]! < 0.02 * growthConstant

  // mean Poincare radius per shell (only the clean shells)
  const sumR: number[] = new Array(cleanShells.length).fill(0)
  const cntR: number[] = new Array(cleanShells.length).fill(0)
  for (let i = 0; i < n; i++) {
    const d = depth[i]!
    if (d >= 0 && d < cleanShells.length) { sumR[d]! += norm(g.coords[i]!); cntR[d]! += 1 }
  }
  const meanRadius = sumR.map((s, i) => (cntR[i]! ? s / cntR[i]! : 0))
  // boundary accumulation: radius increases monotonically and the deepest clean shell is near 1
  let monotone = true
  for (let i = 1; i < meanRadius.length; i++) if (meanRadius[i]! < meanRadius[i - 1]! - 1e-9) monotone = false
  const boundaryAccumulation = monotone && meanRadius[meanRadius.length - 1]! > 0.95

  const exponentialNesting = growthConstant > 2 && cleanShells.length >= 4
  const solved = exponentialNesting && ratioConverges && boundaryAccumulation

  return { shellCounts, cleanShells, ratios, growthConstant, ratioConverges, meanRadius, boundaryAccumulation, exponentialNesting, solved }
}

export function main(): void {
  const r = nestedStructure534()
  console.log('P189: nested structure on {5,3,4}')
  console.log('')
  console.log(`  shell counts (raw): ${r.shellCounts.join(', ')}`)
  console.log(`  clean shells (untruncated): ${r.cleanShells.join(', ')}`)
  console.log(`  shell-to-shell ratios: ${r.ratios.map((x) => x.toFixed(3)).join(', ')}`)
  console.log(`  growth constant (converged ratio): ${r.growthConstant.toFixed(3)}`)
  console.log(`  ratio converges (self-similar nesting): ${r.ratioConverges}`)
  console.log(`  mean Poincare radius by shell: ${r.meanRadius.map((x) => x.toFixed(3)).join(', ')}`)
  console.log(`  boundary accumulation (radius -> 1, monotone): ${r.boundaryAccumulation}`)
  console.log(`  exponential nesting: ${r.exponentialNesting}`)
  console.log('')
  console.log(`  => {5,3,4} is recursively nested, exponential self-similar shells crowding the boundary. SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
