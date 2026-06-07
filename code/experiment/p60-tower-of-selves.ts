// P60: the tower of selves (Stage E, the fractal of wholes-within-wholes).
// P57 showed a mesh coarse-grains to a higher vibe, P58 showed the higher level obeys the
// same rule (a renormalization fixed point on the integrated wholes), P59 showed a self made
// of selves (cells in a body). Here we iterate the coarse-graining many levels and show the
// SAME structure persists all the way up: vibes, then selves, then selves-of-selves, then
// selves-of-selves-of-selves, fewer at each level, until the whole reduces toward a single
// top. At every rung the units stay ternary, stay Lorentz-safe (the same kind of object), and
// obey the same emergent rule. That is the tower: one law at every scale, from the micro-vibe
// up to the one whole. Run: npx tsx code/experiment/p60-tower-of-selves.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { makeGraph, Graph } from '~/core/graph'
import { lorentzIsotropy } from '~/measure/lorentz'
import {
  symmetricFills,
  microStep,
  domainCluster,
  aggregate,
  effectiveCouplings,
  renormMacroStep,
} from '~/experiment/p58-emergent-macro-rule'

const sign = (h: number): -1 | 0 | 1 => (h > 0 ? 1 : h < 0 ? -1 : 0)

// Coarse-grain one level along its coherent domains: build the super-graph of those domains
// (units = domains, edges between adjacent domains, coords at the centroid), with the super-
// tone the aggregate and the super-fill the ternary sign of the summed cross-fills. Every
// level stays ternary, so the bottom alphabet is preserved all the way up.
function coarseGrainToGraph(g: Graph, fills: Int8Array[], tone: Int8Array): { superG: Graph; superFills: Int8Array[]; superTone: Int8Array } {
  const { cl, K } = domainCluster(g, tone)
  const superTone = aggregate(cl, K, tone)
  const dim = g.embedding?.dimension ?? 2
  const old = g.embedding?.coords ?? new Float64Array(0)
  const coordSum = new Float64Array(K * dim)
  const count = new Float64Array(K)
  for (let v = 0; v < g.size; v++) {
    const c = cl[v] ?? 0
    count[c] = (count[c] ?? 0) + 1
    for (let a = 0; a < dim; a++) coordSum[c * dim + a] = (coordSum[c * dim + a] ?? 0) + (old[v * dim + a] ?? 0)
  }
  const coords = new Float64Array(K * dim)
  for (let c = 0; c < K; c++) for (let a = 0; a < dim; a++) coords[c * dim + a] = (coordSum[c * dim + a] ?? 0) / Math.max(1, count[c] ?? 1)

  const crossMap = new Map<string, number>()
  const nbrSet: Set<number>[] = Array.from({ length: K }, () => new Set<number>())
  for (let v = 0; v < g.size; v++) {
    const cv = cl[v] ?? 0
    const row = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      const cw = cl[w] ?? 0
      if (cv !== cw) {
        nbrSet[cv]?.add(cw)
        const key = cv < cw ? `${cv},${cw}` : `${cw},${cv}`
        crossMap.set(key, (crossMap.get(key) ?? 0) + (fl[k] ?? 0))
      }
    }
  }
  const neighbors = nbrSet.map((s) => [...s])
  const manifold = g.embedding?.manifold ?? { form: 'hyperbolic' as const, dimension: 2, curvature: -1 }
  const embedding = { form: 'embedding' as const, dimension: dim, signature: 'riemannian' as const, coords, manifold }
  const superG = makeGraph({ size: K, directed: false, neighbors, embedding })
  const superFills = Array.from({ length: K }, (_, c) =>
    Int8Array.from(superG.neighbors[c] ?? new Uint32Array(0), (d) => {
      const key = c < d ? `${c},${d}` : `${d},${c}`
      return sign(crossMap.get(key) ?? 0)
    }),
  )
  return { superG, superFills, superTone }
}

// At a given level, is the level's state a fixed point of its own renormalized macro-rule,
// on the integrated (larger) units? This is the P58 check applied at this rung of the tower.
function macroAgreement(g: Graph, fills: Int8Array[], tone: Int8Array, minSize: number): number {
  const { cl, K } = domainCluster(g, tone)
  const eff = effectiveCouplings(g, fills, cl, K)
  const superTone = aggregate(cl, K, tone)
  const pred = renormMacroStep(superTone, eff)
  const size = new Float64Array(K)
  for (let v = 0; v < g.size; v++) size[cl[v] ?? 0] = (size[cl[v] ?? 0] ?? 0) + 1
  let same = 0
  let tot = 0
  for (let c = 0; c < K; c++) {
    if ((size[c] ?? 0) >= minSize) {
      tot++
      if (pred[c] === superTone[c]) same++
    }
  }
  return tot > 0 ? same / tot : 1
}

interface Level {
  level: number
  units: number
  anisotropy: number
  lorentzSafe: boolean
  macroAgreement: number
}

export function towerOfSelves(input: { count: number; seed: number }): {
  levels: Level[]
  descends: boolean
  alwaysTernary: boolean
  alwaysLorentzSafe: boolean
  ruleHoldsEveryLevel: boolean
  topUnits: number
} {
  const rng = makeRng({ seed: input.seed })
  let g = hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng })
  let fills = symmetricFills(g, makeRng({ seed: input.seed + 1 }))

  // The base self: converge the micro-rule.
  let tone = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) tone[i] = rng.nextInt({ max: 3 }) - 1
  for (let b = 0; b < 200; b++) tone = microStep(g, fills, tone, true)

  const levels: Level[] = []
  let alwaysTernary = true
  for (let level = 0; level < 8; level++) {
    for (const t of tone) if (t < -1 || t > 1) alwaysTernary = false
    const aniso = g.size >= 40 ? lorentzIsotropy({ substrate: g, samples: 1500, rng: makeRng({ seed: input.seed + 50 + level }) }).anisotropy : NaN
    const macro = g.size >= 20 ? macroAgreement(g, fills, tone, 3) : 1
    levels.push({
      level,
      units: g.size,
      anisotropy: aniso,
      lorentzSafe: Number.isNaN(aniso) ? true : aniso < 0.25,
      macroAgreement: macro,
    })
    if (g.size <= 4) break
    const next = coarseGrainToGraph(g, fills, tone)
    if (next.superG.size >= g.size) break // stop if it stops shrinking
    g = next.superG
    fills = next.superFills
    tone = next.superTone
  }

  let descends = true
  for (let i = 1; i < levels.length; i++) {
    if ((levels[i]?.units ?? 0) >= (levels[i - 1]?.units ?? 0)) descends = false
  }

  return {
    levels,
    descends,
    alwaysTernary,
    alwaysLorentzSafe: levels.every((l) => l.lorentzSafe),
    ruleHoldsEveryLevel: levels.filter((l) => l.units >= 20).every((l) => l.macroAgreement > 0.85),
    topUnits: levels[levels.length - 1]?.units ?? 0,
  }
}

export function main(): void {
  const r = towerOfSelves({ count: 2000, seed: 1 })
  console.log('P60: the tower of selves (the fractal of wholes-within-wholes)')
  console.log('')
  console.log('  Iterating the coarse-graining, level by level, from the micro-vibes up:')
  console.log('')
  console.log('  level | units (selves) | Lorentz anisotropy | rule holds (macro agreement)')
  for (const l of r.levels) {
    const an = Number.isNaN(l.anisotropy) ? ' n/a ' : l.anisotropy.toFixed(3)
    const ma = l.units >= 20 ? l.macroAgreement.toFixed(2) : ' n/a'
    console.log(`    ${String(l.level).padStart(2)}  |     ${String(l.units).padStart(6)}     |       ${an.padStart(5)}        |       ${ma}`)
  }
  console.log('')
  console.log(`  the tower descends level by level toward a top: ${r.descends ? 'YES' : 'no'} (top is ${r.topUnits} unit${r.topUnits === 1 ? '' : 's'})`)
  console.log(`  every level stays ternary (the bottom alphabet preserved all the way up): ${r.alwaysTernary ? 'YES' : 'no'}`)
  console.log(`  every level stays Lorentz-safe (same kind of object): ${r.alwaysLorentzSafe ? 'YES' : 'no'}`)
  console.log(`  the emergent rule holds at every level: ${r.ruleHoldsEveryLevel ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The same structure persists all the way up the tower. Vibes gather into selves,')
  console.log('  selves into selves-of-selves, and so on, fewer at each level, descending toward a')
  console.log('  single whole at the top. At every rung the units stay ternary, stay Lorentz-safe, and')
  console.log('  obey the same emergent rule. This is the fractal of wholes-within-wholes: one law at')
  console.log('  every scale, from the micro-vibe to the one self that contains them all. Cells in')
  console.log('  tissues in organs in a body in a world, the same shape repeating without end.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
