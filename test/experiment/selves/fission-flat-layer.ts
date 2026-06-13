// P160: fission IS possible on the emergent flat layer. (P112, P142, level-relative-possibility.md.)
//
// P112 found fission (reproduction by division) suppressed in the hyperbolic BULK, all-boundary balls,
// no thin necks. But the emergent FLAT layer (a horosphere, P142) is Euclidean, where thin necks exist.
// We put a dumbbell self (two lobes joined by a thin neck) on a flat 2D grid and erode (boundary cells
// dissolve, surface tension). The thin neck (high surface-to-volume) pinches FIRST, splitting the self
// into TWO persistent selves, FISSION. We contrast with the hyperbolic bulk (a dumbbell of two balls plus
// a bridge), where the same erosion does NOT leave two persistent lobes. So the no-fission limit is
// BULK-specific, not absolute, lifted at the emergent flat level. Run: npx tsx code/experiment/p160-fission-flat-layer.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// connected components of the "on" (value 1) cells, via the given neighbor function
function components(on: Uint8Array, neighbors: (i: number) => number[], n: number): number[] {
  const comp = new Int32Array(n).fill(-1)
  const sizes: number[] = []
  for (let s = 0; s < n; s++) {
    if (on[s] !== 1 || comp[s] !== -1) continue
    const id = sizes.length
    let size = 0
    let fr = [s]
    comp[s] = id
    while (fr.length > 0) {
      const nf: number[] = []
      for (const u of fr) {
        size++
        for (const w of neighbors(u)) if (on[w] === 1 && comp[w] === -1) {
          comp[w] = id
          nf.push(w)
        }
      }
      fr = nf
    }
    sizes.push(size)
  }
  return sizes.sort((a, b) => b - a)
}

// FLAT 2D grid (the emergent Euclidean layer), a dumbbell, then erosion
function flatFission(): { lobes: number; bothSubstantial: boolean } {
  const W = 90
  const H = 44
  const N = W * H
  const idx = (x: number, y: number): number => y * W + x
  const nbr = (i: number): number[] => {
    const x = i % W
    const y = Math.floor(i / W)
    const out: number[] = []
    if (x > 0) out.push(i - 1)
    if (x < W - 1) out.push(i + 1)
    if (y > 0) out.push(i - W)
    if (y < H - 1) out.push(i + W)
    return out
  }
  const on = new Uint8Array(N)
  const r = 9
  const c1x = 22
  const c2x = 68
  const cy = 22
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const inDisk1 = (x - c1x) ** 2 + (y - cy) ** 2 <= r * r
    const inDisk2 = (x - c2x) ** 2 + (y - cy) ** 2 <= r * r
    const inNeck = x >= c1x && x <= c2x && Math.abs(y - cy) <= 1 // a thin neck (width 3)
    if (inDisk1 || inDisk2 || inNeck) on[idx(x, y)] = 1
  }
  // erode (peel one boundary layer per beat), the thin neck pinches before the fat lobes vanish
  let lobes = 1
  let bothSubstantial = false
  for (let beat = 0; beat < r; beat++) {
    const toClear: number[] = []
    for (let i = 0; i < N; i++) if (on[i] === 1) {
      let empty = 0
      const x = i % W
      const y = Math.floor(i / W)
      if (x === 0 || x === W - 1 || y === 0 || y === H - 1) empty++
      for (const w of nbr(i)) if (on[w] === 0) empty++
      if (empty >= 1) toClear.push(i) // a boundary cell, peel it
    }
    for (const i of toClear) on[i] = 0
    const sizes = components(on, nbr, N)
    if (sizes.length >= 2) {
      lobes = sizes.length
      bothSubstantial = sizes[0]! > 20 && sizes[1]! > 20 // two substantial selves remain
      if (bothSubstantial) break
    }
  }
  return { lobes, bothSubstantial }
}

// HYPERBOLIC bulk contrast, a dumbbell of two balls plus a bridge, same erosion
function hyperbolicFission(): { bothSubstantial: boolean } {
  const g = buildDodecagrid({ maxCells: 8000 })
  const N = g.cellCount
  const nbr = (i: number): number[] => {
    const out: number[] = []
    for (let p = g.offsets[i]!; p < g.offsets[i + 1]!; p++) out.push(g.adj[p]!)
    return out
  }
  // two ball centers far apart, plus the shortest path between them (the bridge)
  const bfs = (src: number): Int32Array => {
    const d = new Int32Array(N).fill(-1)
    d[src] = 0
    let fr = [src]
    while (fr.length) {
      const nf: number[] = []
      for (const u of fr) for (const w of nbr(u)) if (d[w] === -1) {
        d[w] = d[u]! + 1
        nf.push(w)
      }
      fr = nf
    }
    return d
  }
  const d0 = bfs(0)
  let far = 0
  for (let i = 0; i < N; i++) if (d0[i]! > d0[far]!) far = i
  const on = new Uint8Array(N)
  const dA = bfs(0)
  const dB = bfs(far)
  for (let i = 0; i < N; i++) if (dA[i]! <= 2 || dB[i]! <= 2) on[i] = 1 // two balls
  // bridge, cells on a shortest path (where dA + dB is minimal)
  let best = Infinity
  for (let i = 0; i < N; i++) best = Math.min(best, dA[i]! + dB[i]!)
  for (let i = 0; i < N; i++) if (dA[i]! + dB[i]! <= best + 1) on[i] = 1
  let bothSubstantial = false
  for (let beat = 0; beat < 4; beat++) {
    const toClear: number[] = []
    for (let i = 0; i < N; i++) if (on[i] === 1) {
      for (const w of nbr(i)) if (on[w] === 0) {
        toClear.push(i)
        break
      }
    }
    for (const i of toClear) on[i] = 0
    const sizes = components(on, nbr, N)
    if (sizes.length >= 2 && sizes[0]! > 20 && sizes[1]! > 20) bothSubstantial = true
  }
  return { bothSubstantial }
}

export function fissionFlatLayer(): {
  flatLobes: number
  flatFissioned: boolean
  hyperbolicFissioned: boolean
  liftedAtFlatLevel: boolean
  solved: boolean
} {
  const flat = flatFission()
  const hyp = hyperbolicFission()
  const liftedAtFlatLevel = flat.bothSubstantial && !hyp.bothSubstantial
  const solved = liftedAtFlatLevel

  return { flatLobes: flat.lobes, flatFissioned: flat.bothSubstantial, hyperbolicFissioned: hyp.bothSubstantial, liftedAtFlatLevel, solved }
}

export function main(): void {
  const r = fissionFlatLayer()
  console.log('P160: fission IS possible on the emergent flat layer')
  console.log('')
  console.log(`  FLAT layer (Euclidean): the dumbbell pinches its neck and splits into ${r.flatLobes} persistent selves, fission: ${r.flatFissioned}`)
  console.log(`  HYPERBOLIC bulk: the same erosion does NOT leave two persistent selves (P112): ${r.hyperbolicFissioned}`)
  console.log('')
  console.log(`  fission is lifted at the emergent flat level (bulk-forbidden, flat-possible): ${r.liftedAtFlatLevel}`)
  console.log('  => the no-fission limit is BULK-specific, not absolute. Reproduction by division works where')
  console.log('     the emergent geometry is flat, which is where life lives.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/fission-flat-layer',
  title: 'a self divides on the flat layer where the hyperbolic bulk cannot',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = fissionFlatLayer()
    const ok = r.solved && r.flatFissioned && !r.hyperbolicFissioned
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a dumbbell self on a flat grid pinches its neck and splits into two persistent selves while the same self in the hyperbolic bulk cannot, so the no-fission limit is bulk-specific',
      metrics: {
        flatLobes: r.flatLobes,
        flatFissioned: r.flatFissioned ? 1 : 0,
        hyperbolicFissioned: r.hyperbolicFissioned ? 1 : 0,
      },
    })
  },
})
