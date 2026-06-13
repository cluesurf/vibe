// P184: lazy on-demand neighbor computation, Stage 0 of the WebGPU billion-cell plan. (P104, cell-scale.ts, note/plan/vibe-webgpu-billion-cell-sim.md.)
//
// The plan to reach a billion cells needs neighbors computed ON DEMAND, not stored. This proves the
// mechanism is correct. The lazy engine computes a cell's 12 neighbors purely from the cell's own group
// matrices (by the 12 face reflections, exact mod two primes), with NO stored adjacency. We check, (1) a
// lazy breadth-first build reproduces the exact same graph as the stored buildDodecagrid, byte for byte, and
// (2) RANDOM ACCESS, walk to an arbitrary deep cell and get its neighbors on demand without ever building or
// storing the graph, the consistency check being that the cell we came from is among the computed neighbors.
// Honest note, carrying the matrix is not itself the memory win (the matrix is bigger than a neighbor list),
// the win comes from compact formula addressing (the plan's Stage 1), this stage proves on-demand neighbor
// CORRECTNESS, the seed the shader port builds on. Run: npx tsx code/experiment/p183-lazy-neighbors.ts

import { buildDodecagrid, makeLazyEngine, type LazyCell } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { toCsr } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// build the graph LAZILY, mirroring the stored build's BFS but getting neighbors from the lazy engine only
function lazyBuild(maxCells: number): { offsets: Uint32Array; adj: Uint32Array; cellCount: number } {
  const eng = makeLazyEngine()
  const cells: LazyCell[] = [eng.origin]
  const idOf = new Map<string, number>([[eng.fingerprint(eng.origin), 0]])
  const nbr: number[][] = [[]]
  let hit = false
  for (let head = 0; head < cells.length; head++) {
    const ns = eng.neighbors(cells[head]!) // computed on demand, no stored graph
    for (const nc of ns) {
      const k = eng.fingerprint(nc)
      let id = idOf.get(k)
      if (id === undefined) {
        if (cells.length >= maxCells) {
          hit = true
          continue
        }
        id = cells.length
        idOf.set(k, id)
        cells.push(nc)
        nbr.push([])
      }
      if (id !== head && !nbr[head]!.includes(id)) {
        nbr[head]!.push(id)
        nbr[id]!.push(head)
      }
    }
    if (hit) break
  }
  const n = cells.length
  const { offsets, adj } = toCsr(nbr)
  return { offsets, adj, cellCount: n }
}

export function lazyNeighbors(input?: { n?: number }): {
  n: number
  lazyCellCount: number
  storedCellCount: number
  graphsIdentical: boolean
  randomAccessDepth: number
  randomAccessNeighbors: number
  cameFromIsNeighbor: boolean
  noGraphStored: boolean
  solved: boolean
} {
  const n = input?.n ?? 20000

  // (1) lazy build reproduces the stored graph exactly
  const lazy = lazyBuild(n)
  const stored = buildDodecagrid({ maxCells: n })
  let identical = lazy.cellCount === stored.cellCount && lazy.offsets.length === stored.offsets.length && lazy.adj.length === stored.adj.length
  if (identical) {
    for (let i = 0; i < lazy.offsets.length; i++) if (lazy.offsets[i] !== stored.offsets[i]) { identical = false; break }
  }
  if (identical) {
    for (let i = 0; i < lazy.adj.length; i++) if (lazy.adj[i] !== stored.adj[i]) { identical = false; break }
  }

  // (2) RANDOM ACCESS, walk to a deep cell via a random sequence of face steps, then compute its neighbors
  // on demand. Carry only a couple of matrices, never a graph. The cell we came from must be a neighbor.
  const eng = makeLazyEngine()
  const rng = makeRng({ seed: 5 })
  const depth = 9
  let prev: LazyCell | null = null
  let cur = eng.origin
  for (let step = 0; step < depth; step++) {
    const ns = eng.neighbors(cur)
    let pick = ns[Math.floor(rng.next() * ns.length)]!
    // avoid immediately bouncing back, so the walk goes genuinely deep
    if (prev && eng.fingerprint(pick) === eng.fingerprint(prev)) pick = ns[(ns.indexOf(pick) + 1) % ns.length]!
    prev = cur
    cur = pick
  }
  const deepNeighbors = eng.neighbors(cur) // computed with no graph in memory
  const prevFp = eng.fingerprint(prev!)
  const cameFromIsNeighbor = deepNeighbors.some((nc) => eng.fingerprint(nc) === prevFp)
  const randomAccessNeighbors = new Set(deepNeighbors.map((nc) => eng.fingerprint(nc))).size

  const noGraphStored = true // lazyNeighbors of a cell uses only that cell's matrices, no adjacency array
  const solved = identical && lazy.cellCount === stored.cellCount && cameFromIsNeighbor && randomAccessNeighbors === eng.faceCount

  return {
    n,
    lazyCellCount: lazy.cellCount,
    storedCellCount: stored.cellCount,
    graphsIdentical: identical,
    randomAccessDepth: depth,
    randomAccessNeighbors,
    cameFromIsNeighbor,
    noGraphStored,
    solved,
  }
}

export default defineExperiment({
  id: 'addressing/lazy-neighbors',
  title: 'on-demand neighbor computation reproduces the exact dodecagrid graph with no stored adjacency',
  category: 'addressing',
  substrates: ['534'],
  depth: 'L0',
  paper: false,
  run() {
    const r = lazyNeighbors({ n: 20000 })
    const ok =
      r.solved &&
      r.graphsIdentical &&
      r.cameFromIsNeighbor &&
      r.lazyCellCount === r.storedCellCount
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a lazy BFS computing neighbors on demand from each cell reproduces the exact buildDodecagrid graph byte for byte and supports random access to a deep cell',
      metrics: {
        lazyCellCount: r.lazyCellCount,
        storedCellCount: r.storedCellCount,
        randomAccessDepth: r.randomAccessDepth,
        randomAccessNeighbors: r.randomAccessNeighbors,
      },
    })
  },
})
