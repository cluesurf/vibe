// P59: nested selves (cells in a body).
// Stage D of the recursion. A self is a stable attractor. A higher self is made of lower
// selves: cells in a body, where the body is itself a self. Nested selves need MODULAR
// structure, exactly like biology: a cell is strongly bound inside (its parts hold together)
// and weakly coupled to other cells. So we build a modular mesh (dense, cohesive cells, sparse
// links between them) and test what happens when a PART is perturbed:
//   - a small wound inside a cell HEALS: the cell's internal cohesion pulls the flipped parts
//     back (homeostasis).
//   - flipping a whole cell PERSISTS as a new identity: its cohesion makes the flipped state
//     stable too, and the weak outside coupling cannot undo it (autonomy), like a cell holding
//     its type, or a growth that no longer obeys the body.
//   - the rest of the body is undisturbed (modularity gives locality), so the higher self
//     keeps its identity through the wound.
// The crossover from healed to autonomous is a threshold in how much of the cell is hit, the
// same integration logic that makes a cluster a genuine higher vibe (P57, P58).
// Run: npx tsx code/experiment/p59-nested-selves.ts

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '@/code/tool/rng'
import { makeGraph, Graph } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A modular mesh: numCells cohesive cells of cellSize vibes each, dense inside (fill +1, the
// cohesion that makes a cell a self), sparse and weak between cells (a few +1 links).
export function modularMesh(input: { numCells: number; cellSize: number; intraDegree: number; interPerCell: number; rng: Rng }): {
  g: Graph
  fills: Int8Array[]
  cellOf: Int32Array
} {
  const { numCells, cellSize, intraDegree, interPerCell, rng } = input
  const n = numCells * cellSize
  const adj: Map<number, number>[] = Array.from({ length: n }, () => new Map())
  const addEdge = (u: number, v: number, f: number): void => {
    if (u === v) return
    adj[u]?.set(v, f)
    adj[v]?.set(u, f)
  }
  const cellOf = new Int32Array(n)
  for (let c = 0; c < numCells; c++) {
    for (let i = 0; i < cellSize; i++) cellOf[c * cellSize + i] = c
    // dense intra-cell edges, fill +1 (strong cohesion)
    for (let i = 0; i < cellSize; i++) {
      const u = c * cellSize + i
      for (let d = 0; d < intraDegree; d++) {
        const v = c * cellSize + rng.nextInt({ max: cellSize })
        addEdge(u, v, 1)
      }
    }
  }
  // sparse inter-cell edges, fill +1 (weak coupling)
  for (let c = 0; c < numCells; c++) {
    for (let e = 0; e < interPerCell; e++) {
      const u = c * cellSize + rng.nextInt({ max: cellSize })
      const other = (c + 1 + rng.nextInt({ max: numCells - 1 })) % numCells
      const v = other * cellSize + rng.nextInt({ max: cellSize })
      addEdge(u, v, 1)
    }
  }
  const neighbors: number[][] = adj.map((m) => [...m.keys()])
  const fills: Int8Array[] = adj.map((m) => Int8Array.from(m.values()))
  const g = makeGraph({ size: n, directed: false, neighbors })
  return { g, fills, cellOf }
}

function settleAsync(g: Graph, fills: Int8Array[], init: Int8Array, sweeps: number, rng: Rng): Int8Array {
  const n = g.size
  const t = Int8Array.from(init)
  for (let sweep = 0; sweep < sweeps; sweep++) {
    for (let s = 0; s < n; s++) {
      const v = rng.nextInt({ max: n })
      const nb = g.neighbors[v] ?? new Uint32Array(0)
      const fl = fills[v] ?? new Int8Array(0)
      let h = 0
      for (let k = 0; k < nb.length; k++) h += (fl[k] ?? 0) * (t[nb[k] ?? 0] ?? 0)
      t[v] = h > 0 ? 1 : h < 0 ? -1 : (t[v] ?? 0)
    }
  }
  return t
}

export function nestedSelves(input: { seed: number }): {
  byFraction: { fraction: number; cellRecovery: number; bodyIntegrity: number }[]
  smallWoundHeals: number
  wholeCellPersists: number
  bodyIntegrity: number
  solved: boolean
} {
  const numCells = 30
  const cellSize = 24
  const rng = makeRng({ seed: input.seed })
  const { g, fills, cellOf } = modularMesh({ numCells, cellSize, intraDegree: 6, interPerCell: 2, rng })

  // The body's coherent self: all cells aligned. Converge to confirm it is a fixed point.
  let base = new Int8Array(g.size).fill(1)
  base = settleAsync(g, fills, base, 40, makeRng({ seed: input.seed + 1 }))

  const members: number[][] = Array.from({ length: numCells }, () => [])
  for (let v = 0; v < g.size; v++) members[cellOf[v] ?? 0]?.push(v)

  // Perturb a varying fraction of one cell, re-settle, measure how much of the cell returns
  // to the body's pattern (absorbed) and how intact the rest of the body stays. Average over
  // several cells.
  const fractions = [0.1, 0.25, 0.5, 0.75, 1.0]
  const byFraction = fractions.map((fraction) => {
    const recs: number[] = []
    const integ: number[] = []
    for (let c = 0; c < numCells; c++) {
      const mem = members[c] ?? []
      const k = Math.max(1, Math.round(fraction * mem.length))
      const pr = makeRng({ seed: input.seed + 1000 * c + Math.round(fraction * 100) })
      const perturbed = Int8Array.from(base)
      // flip the first k members (order is arbitrary and fixed, so reproducible)
      for (let i = 0; i < k; i++) {
        const v = mem[i] ?? 0
        perturbed[v] = (-(base[v] ?? 0)) as -1 | 0 | 1
      }
      const settled = settleAsync(g, fills, perturbed, 50, pr)
      let cellBack = 0
      for (const v of mem) if (settled[v] === base[v]) cellBack++
      recs.push(cellBack / mem.length)
      const cellSet = new Set(mem)
      let bodySame = 0
      let bodyTot = 0
      for (let v = 0; v < g.size; v++) {
        if (cellSet.has(v)) continue
        bodyTot++
        if (settled[v] === base[v]) bodySame++
      }
      integ.push(bodySame / Math.max(1, bodyTot))
    }
    const mean = (a: number[]): number => a.reduce((x, y) => x + y, 0) / a.length
    return { fraction, cellRecovery: mean(recs), bodyIntegrity: mean(integ) }
  })

  const at = (f: number): { cellRecovery: number; bodyIntegrity: number } => byFraction.find((b) => b.fraction === f) ?? { cellRecovery: NaN, bodyIntegrity: NaN }
  const smallWoundHeals = at(0.1).cellRecovery
  const wholeCellPersists = at(1.0).cellRecovery
  const bodyIntegrity = byFraction.reduce((s, b) => s + b.bodyIntegrity, 0) / byFraction.length

  return {
    byFraction,
    smallWoundHeals,
    wholeCellPersists,
    bodyIntegrity,
    // Solved: a small wound heals (homeostasis), a whole-cell flip persists (autonomy), and
    // the body away from the wound is undisturbed (the higher self keeps its identity).
    solved: smallWoundHeals > 0.85 && wholeCellPersists < 0.2 && bodyIntegrity > 0.95,
  }
}

export function main(): void {
  const r = nestedSelves({ seed: 1 })
  console.log('P59: nested selves (cells in a body)')
  console.log('')
  console.log('  A modular mesh of 30 cohesive cells (a self made of cells). Flip a fraction of one')
  console.log('  cell, re-settle, and watch how much returns to the body and how intact the rest stays.')
  console.log('')
  console.log('  fraction of cell flipped | cell returns to body | rest of body intact')
  for (const b of r.byFraction) {
    console.log(`            ${(b.fraction * 100).toFixed(0).padStart(3)}%          |        ${b.cellRecovery.toFixed(2)}         |       ${b.bodyIntegrity.toFixed(2)}`)
  }
  console.log('')
  console.log(`  small wound heals (homeostasis):     ${r.smallWoundHeals.toFixed(2)}`)
  console.log(`  whole-cell flip persists (autonomy): ${r.wholeCellPersists.toFixed(2)} returns, so it KEEPS its new identity`)
  console.log(`  body away from the wound undisturbed: ${r.bodyIntegrity.toFixed(2)}`)
  console.log(`  nested selves solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  A small wound inside a cell heals: the cell\'s internal cohesion pulls the flipped')
  console.log('  parts back to the body\'s pattern (homeostasis). Flipping a whole cell persists: its')
  console.log('  cohesion makes the flipped state stable too, and the weak outside coupling cannot')
  console.log('  undo it, so the cell keeps a new identity (autonomy), like a cell holding its type or')
  console.log('  a growth that no longer obeys the body. The crossover from healed to autonomous is a')
  console.log('  threshold in how much of the cell is hit, the same integration logic that makes a')
  console.log('  cluster a genuine higher vibe. And the body away from the wound is undisturbed, so')
  console.log('  the higher self keeps its identity through it. A self made of selves: cells in a body,')
  console.log('  and the same shape repeats for organs in a being and beings in a greater whole.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'selves/nested-selves',
  title: 'small wounds heal, whole-cell flips persist, body stays intact',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = nestedSelves({ seed: 1 })
    const ok =
      r.solved &&
      r.smallWoundHeals > 0.85 &&
      r.wholeCellPersists < 0.2 &&
      r.bodyIntegrity > 0.95
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a small wound inside a cell heals, a whole-cell flip persists as a new identity, and the rest of the body stays intact',
      metrics: {
        smallWoundHeals: r.smallWoundHeals,
        wholeCellPersists: r.wholeCellPersists,
        bodyIntegrity: r.bodyIntegrity,
      },
    })
  },
})
