// A prototype hyperbolic computer, dimension-general. It assembles the three planes of the combined architecture
// (see note/research/vibe/notes/theory-v0.8.0/notes/computation/13-combined-architecture.md) on a finite patch of
// a regular tiling:
//   substrate - the cell graph (degree = the cell's direction count: 7 in 2D {7,3}, 12 in 3D {5,3,4}, 24 in 4D
//               {3,4,3,4}, the 24-cell cell)
//   compute   - a ternary register machine (compile TypeScript, run it), plus the literal railway CA running on
//               the actual cell graph (a locomotive on a track loop)
//   memory    - associative, content-addressable: store a ternary word per cell, query by content, search in
//               O(log N) beats with exponentially growing capacity
// The per-dimension configs (2d/, 3d/, 4d/) just pick the tiling. This is the finite isolated chip, not the cosmos.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  compileMachine,
  runMachine,
  type Backend,
} from '@/code/compute/compile'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
  searchExact,
  broadcastWave,
  type AssociativeMemory,
} from '@/code/operator/associative-memory'
import { radiusCapacity } from '@/code/measure/associative-recall'
import { makeTrackLoop } from '@/code/compute/railway-ca'

export type VibeComputerReport = {
  symbol: number[]
  dimension: number
  cellCount: number
  degree: number // the cell's direction count (the dock's sites in the 4D case)
  compute: {
    program: string
    result: string
    cost: number
    backend: Backend
  }
  railway: { ran: boolean; cycleLength: number; head: number }
  memory: {
    wordBits: number
    stored: number
    queryCell: number
    found: boolean
    searchLatency: number // beats to first responder
    coverageBeat: number // beats to cover the whole patch (~ O(log N))
    capacityByRadius: number[] // cells within each radius (exponential on a hyperbolic patch)
  }
}

export type VibeComputer = {
  symbol: number[]
  dimension: number
  cellCount: number
  degree: number
  neighbors: number[][]
  memory: AssociativeMemory
  compute(
    source: string,
    inputs: number[],
    backend?: Backend,
  ): { result: bigint; cost: number }
  report(): VibeComputerReport
}

const DEMO_FIB = `function fib(n){ let a=0; let b=1; let t=0; while(n!==0){ n--; t=a; t+=b; a=b; b=t } return a }`

export function makeVibeComputer(input: {
  symbol: number[]
  maxCells?: number
  wordBits?: number
}): VibeComputer {
  const symbol = input.symbol
  const dimension = symbol.length
  const wordBits = input.wordBits ?? 21
  const graph = buildCellGraph({
    symbol,
    maxCells: input.maxCells ?? 2000,
  })
  const neighbors = graph.neighbors
  const memory = makeAssociativeMemory({ neighbors, wordBits })

  const compute = (
    source: string,
    inputs: number[],
    backend: Backend = 'ternary',
  ) => {
    return runMachine(compileMachine(source, { backend }), inputs)
  }

  const report = (): VibeComputerReport => {
    // compute plane (model): a ternary register machine computes Fibonacci
    const fib = compute(DEMO_FIB, [10], 'ternary')

    // compute plane (literal CA): a locomotive runs on a track loop laid in the actual cell graph
    const cycle = findCycle(neighbors)
    let railwayRan = false
    let head = -1
    if (cycle.length >= 4) {
      const ca = makeTrackLoop(cycle, graph.cellCount)
      const seen = new Set<number>()
      for (let t = 0; t < cycle.length; t++) {
        ca.step()
        seen.add(ca.headAt())
      }
      head = ca.headAt()
      railwayRan = seen.size === cycle.length // the locomotive visited every track cell of the loop
    }

    // data plane: store one distinct ternary word per cell, then recall one by content
    for (let c = 0; c < memory.cellCount; c++)
      storeWord(memory, c, ternaryWord(c, wordBits))
    const queryCell = Math.min(42, memory.cellCount - 1)
    const responders = searchExact({
      mem: memory,
      comparand: ternaryWord(queryCell, wordBits),
    })
    const found = responders.includes(queryCell)
    const wave = broadcastWave({
      neighbors,
      seed: 0,
      responders: [queryCell],
    })

    return {
      symbol,
      dimension,
      cellCount: graph.cellCount,
      degree: graph.facetCount,
      compute: {
        program: 'fib(10)',
        result: fib.result.toString(),
        cost: fib.cost,
        backend: 'ternary',
      },
      railway: { ran: railwayRan, cycleLength: cycle.length, head },
      memory: {
        wordBits,
        stored: memory.cellCount,
        queryCell,
        found,
        searchLatency: wave.firstResponderBeat,
        coverageBeat: wave.coverageBeat,
        capacityByRadius: radiusCapacity({ neighbors, seed: 0 }),
      },
    }
  }

  return {
    symbol,
    dimension,
    cellCount: graph.cellCount,
    degree: graph.facetCount,
    neighbors,
    memory,
    compute,
    report,
  }
}

// find a cycle in the cell graph (BFS tree plus the first non-tree edge, joined through their common ancestor),
// the track loop the locomotive runs on
function findCycle(neighbors: number[][]): number[] {
  const n = neighbors.length
  const parent = new Int32Array(n).fill(-2)
  parent[0] = -1
  const queue = [0]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]!
    for (const v of neighbors[u]!) {
      if (parent[v] === -2) {
        parent[v] = u
        queue.push(v)
        continue
      }
      if (v === parent[u] || v === u) continue
      // non-tree edge u-v: build the cycle through the common ancestor
      const up: number[] = []
      for (let x: number = u; x !== -1; x = parent[x]!) up.push(x)
      const vp: number[] = []
      for (let x: number = v; x !== -1; x = parent[x]!) vp.push(x)
      const seen = new Set(up)
      let lca = -1
      for (const x of vp)
        if (seen.has(x)) {
          lca = x
          break
        }
      if (lca < 0) continue
      const a: number[] = []
      for (const x of up) {
        a.push(x)
        if (x === lca) break
      }
      const b: number[] = []
      for (const x of vp) {
        if (x === lca) break
        b.push(x)
      }
      const cycle = [...a, ...b.reverse()]
      if (cycle.length >= 4) return cycle
    }
  }
  return []
}
