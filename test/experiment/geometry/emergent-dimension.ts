// P69: emergent spatial geometry from pure growth (bias-free).
// P38 measured the spatial dimension from a sprinkle, on a coordinate slice, and came out biased
// low. The fix is to read the dimension INTRINSICALLY from the grown connectivity, with no
// coordinates at all, and with the right estimator: the SHELL count, the number of vibes at
// exactly graph distance r. On a flat mesh of dimension d, grown by the local rule "join each
// cell to its axis neighbors", the shell grows as a power, |S(r)| ~ r^(d-1), so the slope of
// log|S| against log r is d-1, and the dimension is that plus one, recovered cleanly and without
// the bias that the cumulative ball carries. On a negatively-curved mesh (a Bethe lattice, the
// tree limit of a hyperbolic tessellation), the same shell instead grows EXPONENTIALLY, the
// fingerprint of curvature. Either way the geometry is read off the relations (P5), never from an
// embedding. Run: npx tsx code/experiment/p69-emergent-dimension.ts

import { pathToFileURL } from 'node:url'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A flat d-dimensional mesh grown by the local rule: each cell joins its two neighbors along
// each axis (periodic, so there is no boundary to truncate the shells).
function torusGrid(d: number, L: number): Uint32Array[] {
  const n = Math.pow(L, d)
  const pow = Array.from({ length: d }, (_, a) => Math.pow(L, a))
  const neighbors: Uint32Array[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const ns: number[] = []
    for (let a = 0; a < d; a++) {
      const stride = pow[a] ?? 1
      const coord = Math.floor(i / stride) % L
      const base = i - coord * stride
      ns.push(base + ((coord + 1) % L) * stride)
      ns.push(base + ((coord - 1 + L) % L) * stride)
    }
    neighbors[i] = Uint32Array.from(ns)
  }
  return neighbors
}

// A Bethe lattice (regular tree of degree q): the cleanest discrete negatively-curved space, the
// tree limit of a hyperbolic tessellation. Grown outward from a root.
function betheTree(q: number, depth: number): Uint32Array[] {
  const adj: number[][] = [[]]
  let frontier = [0]
  let curDepth = 0
  while (curDepth < depth) {
    const next: number[] = []
    for (const parent of frontier) {
      const children = curDepth === 0 ? q : q - 1
      for (let c = 0; c < children; c++) {
        const id = adj.length
        adj.push([parent])
        adj[parent]!.push(id)
        next.push(id)
      }
    }
    frontier = next
    curDepth++
  }
  return adj.map((row) => Uint32Array.from(row))
}

// Average shell sizes |S(r)| from a source, by breadth-first search in graph hops.
function shellFrom(adjacency: ReadonlyArray<Uint32Array>, source: number, maxR: number): number[] {
  const n = adjacency.length
  const dist = new Int32Array(n).fill(-1)
  dist[source] = 0
  let frontier = [source]
  const shells = [1]
  let r = 0
  while (frontier.length > 0 && r < maxR) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of adjacency[v] ?? new Uint32Array(0)) {
        if (dist[w] === -1) {
          dist[w] = r + 1
          next.push(w)
        }
      }
    }
    r++
    shells.push(next.length)
    frontier = next
  }
  return shells
}

function linFit(xs: number[], ys: number[]): { slope: number; r2: number } {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my)
    sxx += (xs[i]! - mx) ** 2
    syy += (ys[i]! - my) ** 2
  }
  return { slope: sxy / sxx, r2: syy === 0 ? 1 : (sxy * sxy) / (sxx * syy) }
}

function shellDimension(shell: number[], rLo: number, rHi: number): { dimension: number; r2: number } {
  const xs: number[] = []
  const ys: number[] = []
  for (let r = rLo; r <= rHi; r++) {
    xs.push(Math.log(r))
    ys.push(Math.log(shell[r] ?? 1))
  }
  const f = linFit(xs, ys)
  return { dimension: f.slope + 1, r2: f.r2 }
}

function powerR2(shell: number[], rLo: number, rHi: number): number {
  const xs: number[] = []
  const ys: number[] = []
  for (let r = rLo; r <= rHi; r++) {
    xs.push(Math.log(r))
    ys.push(Math.log(shell[r] ?? 1))
  }
  return linFit(xs, ys).r2
}

function exponentialFit(shell: number[], rLo: number, rHi: number): { growthRatio: number; r2: number } {
  const xs: number[] = []
  const ys: number[] = []
  for (let r = rLo; r <= rHi; r++) {
    xs.push(r)
    ys.push(Math.log(shell[r] ?? 1))
  }
  const f = linFit(xs, ys)
  return { growthRatio: Math.exp(f.slope), r2: f.r2 }
}

export function emergentDimension(input: Record<string, never> = {}): {
  flat: { target: number; measured: number; r2: number }[]
  curved: { name: string; powerR2: number; exponentialR2: number; growthRatio: number }[]
  flatUnbiased: boolean
  curvedIsExponential: boolean
  solved: boolean
} {
  void input
  const flatSpecs = [
    { target: 2, L: 81, rLo: 3, rHi: 34 },
    { target: 3, L: 31, rLo: 3, rHi: 13 },
    { target: 4, L: 21, rLo: 4, rHi: 10 },
  ]
  const flat = flatSpecs.map((spec) => {
    const adj = torusGrid(spec.target, spec.L)
    const shell = shellFrom(adj, 0, spec.rHi + 1)
    const sd = shellDimension(shell, spec.rLo, spec.rHi)
    return { target: spec.target, measured: sd.dimension, r2: sd.r2 }
  })

  const treeSpecs = [
    { name: 'Bethe lattice {.,3}', q: 3, depth: 16, rLo: 3, rHi: 14 },
    { name: 'Bethe lattice {.,4}', q: 4, depth: 11, rLo: 3, rHi: 9 },
  ]
  const curved = treeSpecs.map((spec) => {
    const adj = betheTree(spec.q, spec.depth)
    const shell = shellFrom(adj, 0, spec.rHi + 1)
    const ef = exponentialFit(shell, spec.rLo, spec.rHi)
    return { name: spec.name, powerR2: powerR2(shell, spec.rLo, spec.rHi), exponentialR2: ef.r2, growthRatio: ef.growthRatio }
  })

  const flatUnbiased = flat.every((f) => Math.abs(f.measured - f.target) < 0.2)
  const curvedIsExponential = curved.every((c) => c.exponentialR2 >= c.powerR2 && c.growthRatio > 1.8)

  return { flat, curved, flatUnbiased, curvedIsExponential, solved: flatUnbiased && curvedIsExponential }
}

export function main(): void {
  const r = emergentDimension()
  console.log('P69: emergent spatial geometry from pure growth (bias-free)')
  console.log('')
  console.log('  Dimension read INTRINSICALLY from grown connectivity (shell growth in hops, no coordinates).')
  console.log('')
  console.log('  grown flat mesh | target dimension | measured dimension | fit quality')
  for (const f of r.flat) {
    console.log(`        ${f.target}D         |        ${f.target}         |        ${f.measured.toFixed(2)}        |   r2 = ${f.r2.toFixed(3)}`)
  }
  console.log('')
  console.log(`  flat dimension is unbiased (matches the target): ${r.flatUnbiased ? 'YES' : 'no'}`)
  console.log('')
  console.log('  grown curved mesh | power-law fit | exponential fit | per-ring growth')
  for (const c of r.curved) {
    console.log(`  ${c.name.padEnd(20)} | r2 = ${c.powerR2.toFixed(3)}  | r2 = ${c.exponentialR2.toFixed(3)}    | x${c.growthRatio.toFixed(2)} per ring`)
  }
  console.log('')
  console.log(`  the curved mesh grows EXPONENTIALLY (negative curvature), not as a power: ${r.curvedIsExponential ? 'YES' : 'no'}`)
  console.log(`  emergent spatial geometry from pure growth solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The spatial geometry is read off the grown connectivity alone, with no embedding and')
  console.log('  no coordinates. On a grown flat mesh the shell of vibes at distance r grows as a power')
  console.log('  of r, and that power plus one IS the dimension, recovered cleanly and without bias')
  console.log('  (where P38, from a sprinkle on a coordinate slice, came out biased low). On a grown')
  console.log('  negatively-curved mesh (the tree limit of a hyperbolic tessellation) the same shell')
  console.log('  grows exponentially, the fingerprint of curvature. Space, its dimension and its')
  console.log('  curvature alike, is a property of who-notes-whom, not of any container the vibes sit in.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'geometry/emergent-dimension',
  title: 'emergent dimension, flat grids unbiased (2/3/4), curved meshes exponential',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = emergentDimension()
    const d2 = r.flat.find((x) => x.target === 2)
    const d3 = r.flat.find((x) => x.target === 3)
    const d4 = r.flat.find((x) => x.target === 4)
    const ok =
      r.solved &&
      r.flatUnbiased &&
      r.curvedIsExponential &&
      Math.abs((d2?.measured ?? 0) - 2) < 0.2 &&
      Math.abs((d3?.measured ?? 0) - 3) < 0.2 &&
      Math.abs((d4?.measured ?? 0) - 4) < 0.2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the dimension read intrinsically from grown shell connectivity is unbiased on flat grids and reads exponential on a negatively-curved mesh',
      metrics: {
        measured2: d2?.measured ?? 0,
        measured3: d3?.measured ?? 0,
        measured4: d4?.measured ?? 0,
      },
    })
  },
})
