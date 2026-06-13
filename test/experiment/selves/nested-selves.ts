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

import { makeRng } from '@/code/tool/rng'
import { settleAsync } from '@/code/operator/signed-majority-settle'
import { modularMesh } from '@/code/substrate/modular-mesh'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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
  base = settleAsync({ graph: g, fills, init: base, sweeps: 40, rng: makeRng({ seed: input.seed + 1 }) }).state

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
      const settled = settleAsync({ graph: g, fills, init: perturbed, sweeps: 50, rng: pr }).state
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
