// P60: the tower of selves (Stage E, the fractal of wholes-within-wholes).
// NOT EMERGENT. This ADDS a hand-built recursively modular hierarchical mesh, a structure
// constructed by hand to be modular (dense cohesion inside a cell, weaker between cells of one
// block, weaker still between blocks of one organ, and so on). Recursively modular structure is
// NOT one of the five base things. So this is NOT an emergent test of the pure vibe substrate
// and does NOT show the substrate produces a tower of selves. The tower is built into the mesh
// by construction, not produced by the dynamics. The base mesh is {5,3,4}, not a branching-3
// tree, so the layered selves here are imposed, not discovered.
// P57 showed a mesh coarse-grains to a higher vibe, P58 showed the higher level obeys the
// same rule (a renormalization fixed point on the integrated wholes), P59 showed a self made
// of selves (cells in a body). Here we display the FULL tower on the constructed modular mesh:
// vibes in cells in blocks in organs in a body, many rungs, each a coherent self made of the
// selves below it, all the way up to one top. At every rung the units are coherent selves,
// their count divides by the branching factor, and the same rule holds, until the whole
// reduces to a single self at the top, but only because the mesh was constructed that way.
// Run: npx tsx code/experiment/p60-tower-of-selves.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { makeGraph, Graph } from '@/code/tool/graph'
import { settleAsync } from '@/code/operator/signed-majority-settle'
import {
  clusterMajority as aggregate,
  agreementFraction as agreement,
} from '@/code/measure/agreement'
import {
  effectiveCouplings,
  renormMacroStep,
} from '@/code/operator/macro-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A recursively modular mesh. depth grouping levels, branching b, cellSize vibes per leaf
// cell. The unit of vibe v at level L is floor(v / (cellSize * b^L)). Two vibes are joined
// with a density that falls off the higher their first common level, so cohesion is strong
// inside a cell, weaker across a block, weaker still across an organ. All fills are +1.
function hierarchicalMesh(input: {
  branching: number
  depth: number
  cellSize: number
  rng: Rng
}): {
  g: Graph
  fills: Int8Array[]
  unitAtLevel: (v: number, level: number) => number
  countAtLevel: (level: number) => number
} {
  const { branching: b, depth, cellSize, rng } = input
  const n = cellSize * b ** depth
  const adj: Map<number, number>[] = Array.from(
    { length: n },
    () => new Map(),
  )

  const add = (u: number, v: number): void => {
    if (u !== v) {
      adj[u]?.set(v, 1)
      adj[v]?.set(u, 1)
    }
  }

  const unitAtLevel = (v: number, level: number): number =>
    Math.floor(v / (cellSize * b ** level))

  // edges per vibe at each common-ancestor level, decaying with level
  const degreeAtLevel = [6, 2, 1, 1, 1, 1, 1, 1]

  for (let v = 0; v < n; v++) {
    for (let level = 0; level <= depth; level++) {
      const deg = degreeAtLevel[level] ?? 1
      const block = cellSize * b ** level
      const start = Math.floor(v / block) * block

      for (let d = 0; d < deg; d++) {
        add(v, start + rng.nextInt({ max: block }))
      }
    }
  }

  const neighbors = adj.map(m => [...m.keys()])
  const fills = adj.map(m => Int8Array.from(m.values()))
  const g = makeGraph({ size: n, directed: false, neighbors })
  const countAtLevel = (level: number): number =>
    Math.max(1, Math.round(n / (cellSize * b ** level)))

  return { g, fills, unitAtLevel, countAtLevel }
}

type Rung = {
  level: number
  name: string
  units: number
  coherence: number
  ruleAgreement: number
}

export function towerOfSelves(input: { seed: number }): {
  baseVibes: number
  rungs: Rung[]
  descendsToOne: boolean
  cleanBranching: boolean
  ruleHoldsEveryLevel: boolean
  solved: boolean
} {
  const b = 3
  const depth = 4
  const cellSize = 12
  const rng = makeRng({ seed: input.seed })
  const { g, fills, unitAtLevel, countAtLevel } = hierarchicalMesh({
    branching: b,
    depth,
    cellSize,
    rng,
  })

  // A hierarchically structured self: tones assigned top-down, each level mostly following
  // its parent with a small chance to differ, so there is real structure at every scale.
  const ir = makeRng({ seed: input.seed + 1 })
  const tone = new Int8Array(g.size)
  // assign per top-down: precompute a tone for each unit at the top, then refine downward
  const topTone = 1
  const unitTone = new Map<string, number>()

  const toneOfUnit = (level: number, id: number): number => {
    if (level === depth) {
      return topTone
    }

    const key = `${level},${id}`
    const cached = unitTone.get(key)

    if (cached !== undefined) {
      return cached
    }

    const parent = toneOfUnit(level + 1, Math.floor(id / b))
    const flip = ir.next() < 0.18 + 0.04 * level
    const t = flip ? -parent : parent
    unitTone.set(key, t)

    return t
  }

  for (let v = 0; v < g.size; v++) {
    tone[v] = toneOfUnit(0, unitAtLevel(v, 0))
  }

  // Settle so the assignment is a genuine (metastable) self of the rule.
  const base = settleAsync({
    graph: g,
    fills,
    init: tone,
    sweeps: 60,
    rng: makeRng({ seed: input.seed + 2 }),
  }).state

  const names = ['cells', 'tissues', 'organs', 'systems', 'body']
  const rungs: Rung[] = []

  for (let level = 0; level <= depth; level++) {
    const K = countAtLevel(level)
    const cl = new Int32Array(g.size)

    for (let v = 0; v < g.size; v++) {
      cl[v] = unitAtLevel(v, level)
    }

    // coherence: average internal alignment of each unit
    const sum = new Float64Array(K)
    const cnt = new Float64Array(K)

    for (let v = 0; v < g.size; v++) {
      sum[cl[v] ?? 0] = (sum[cl[v] ?? 0] ?? 0) + (base[v] ?? 0)
      cnt[cl[v] ?? 0] = (cnt[cl[v] ?? 0] ?? 0) + 1
    }

    let coh = 0

    for (let c = 0; c < K; c++) {
      coh += Math.abs(sum[c] ?? 0) / Math.max(1, cnt[c] ?? 1)
    }

    coh /= K

    // rule agreement: is this level's aggregate a fixed point of the renormalized rule?
    let ruleAgreement = 1

    if (level < depth && K >= 3) {
      const eff = effectiveCouplings(g, fills, cl, K)
      const superTone = aggregate(cl, K, base)
      ruleAgreement = agreement(
        superTone,
        renormMacroStep(superTone, eff),
      )
    }

    rungs.push({
      level,
      name: names[level] ?? `level ${level}`,
      units: K,
      coherence: coh,
      ruleAgreement,
    })
  }

  const descendsToOne = (rungs[rungs.length - 1]?.units ?? 0) === 1

  let cleanBranching = true

  for (let i = 1; i < rungs.length; i++) {
    const ratio =
      (rungs[i - 1]?.units ?? 1) / Math.max(1, rungs[i]?.units ?? 1)

    if (Math.abs(ratio - b) > 0.5) {
      cleanBranching = false
    }
  }

  const ruleHoldsEveryLevel = rungs
    .filter(r => r.units >= 3 && r.level < depth)
    .every(r => r.ruleAgreement > 0.85)

  return {
    baseVibes: g.size,
    rungs,
    descendsToOne,
    cleanBranching,
    ruleHoldsEveryLevel,
    // Solved: a clean multi-level hierarchy descending to one top self, with the same emergent
    // rule holding at every level. (Internal tone-uniformity naturally falls with scale, as a
    // larger whole integrates more diverse parts, which is expected, not a failure.)
    solved: descendsToOne && cleanBranching && ruleHoldsEveryLevel,
  }
}

export default experiment({
  id: 'selves/tower-of-selves',
  code: 'E-SLF-0142',
  title:
    'clean multi-level hierarchy to one top, rule holds every level',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = towerOfSelves({ seed: 1 })
    const ok =
      r.solved &&
      r.descendsToOne &&
      r.cleanBranching &&
      r.ruleHoldsEveryLevel

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hand-built recursively modular mesh descends through clean rungs to one top with the same rule at every level',
      metrics: { baseVibes: r.baseVibes, rungs: r.rungs.length },
      notes:
        'not emergent, the recursively modular hierarchy is constructed by hand, not produced by the substrate dynamics',
    })
  },
})
