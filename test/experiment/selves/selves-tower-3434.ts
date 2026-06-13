// Robust head-to-head test of the NESTED-SELF (coherence tower) question on {3,4,3,4}, in BOTH the flat 3D
// cusp and the hyperbolic 4D bulk, with the same conserving rule, the same persistence measure, and the
// same nulls. It consolidates and strengthens p197 (cusp tower), p187 (bulk radial), and p208 (controls),
// and ties the BULK coarse-graining to the new {3,4,3,4} ADDRESSING tree (coarse-graining = truncating the
// address, climbing inward), which is the cleanest possible radial blocking.
//
// A "self" here is a region that holds its FORM, its net charge persisting over time (lag autocorrelation).
// A coherence TOWER means that persistence RISES as you coarse-grain (bigger blocks hold their form longer
// than fine cells) AND beats a same-size random-grouping null. That is hierarchical, nested structure, the
// scaffold higher selves would live on.
//
// What the theory says about selves (selves-are-fuzzy-not-discrete.md, self-model-must-emerge.md,
// self-organized-criticality.md): selves are FUZZY density peaks, not crisp cells, so the tower is a
// continuum of density fields above the one discrete base, not lattices stacked on lattices. The pure rule
// run at ONE scale CHURNS (p101). The question is whether COARSE-GRAINING reveals persistent form the fine
// scale lacks, on the cusp and/or in the bulk.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/selves-tower-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import { buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'

// the exact 9-state conserving perception permutation on an ordered pair (the rule's collision)
function perm(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]
  if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]
  if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]
  if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return [1, -1]
  if (a === 1 && b === -1) return [-1, 1]
  return [0, 0] // (-1, 1)
}

function pearson(a: number[], b: number[]): number {
  const n = a.length
  let ma = 0
  let mb = 0
  for (let i = 0; i < n; i++) { ma += a[i]!; mb += b[i]! }
  ma /= n
  mb /= n
  let num = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < n; i++) { const da = a[i]! - ma; const db = b[i]! - mb; num += da * db; va += da * da; vb += db * db }
  return va > 1e-9 && vb > 1e-9 ? num / Math.sqrt(va * vb) : 0
}

type StepFn = (tone: Int8Array, offsets: Int32Array, adj: Int32Array, rng: { next: () => number }) => void

// one beat on a CSR graph: a random maximal matching of cells, each matched pair updated by `pairOp` (so
// charge is exactly conserved, every cell acts at most once per beat). perm = the perception rule; swap =
// the pure-diffusion control (conserved-charge transport with NO perception structure).
function makeStep(pairOp: (a: number, b: number) => [number, number]): StepFn {
  return (tone, offsets, adj, rng) => {
    const n = tone.length
    const used = new Uint8Array(n)
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); const t = order[i]!; order[i] = order[j]!; order[j] = t }
    for (const v of order) {
      if (used[v]) continue
      const start = offsets[v]!
      const deg = offsets[v + 1]! - start
      const off = Math.floor(rng.next() * deg)
      for (let s = 0; s < deg; s++) {
        const w = adj[start + ((off + s) % deg)]!
        if (used[w] || w === v) continue
        const [na, nb] = pairOp(tone[v]!, tone[w]!)
        tone[v] = na as -1 | 0 | 1
        tone[w] = nb as -1 | 0 | 1
        used[v] = 1
        used[w] = 1
        break
      }
    }
  }
}
const stepPerception = makeStep(perm)
// pure-diffusion control: swap the two tones (conserves total charge and the multiset, no perception logic).
// This is dumb transport. If it shows the SAME tower, the tower is a generic conserved-field slow mode.
const stepDiffusion = makeStep((a, b) => [b, a])

// form-persistence: lag-LAG autocorrelation of the per-group net charge, averaged over a run.
function formPersistence(
  tone: Int8Array,
  offsets: Int32Array,
  adj: Int32Array,
  groupOf: number[], // group index per cell, for ONE coarse scale
  rng: { next: () => number },
  opts: { lag: number; frames: number; step: StepFn },
): number {
  let numGroups = 0
  for (const gi of groupOf) if (gi + 1 > numGroups) numGroups = gi + 1
  const series: number[][] = []
  for (let f = 0; f < opts.frames + opts.lag; f++) {
    opts.step(tone, offsets, adj, rng)
    const g = new Array<number>(numGroups).fill(0)
    for (let i = 0; i < tone.length; i++) g[groupOf[i]!] = g[groupOf[i]!]! + tone[i]!
    series.push(g)
  }
  let acc = 0
  let c = 0
  for (let t = 0; t + opts.lag < series.length; t++) { acc += pearson(series[t]!, series[t + opts.lag]!); c++ }
  return acc / c
}

// a same-size random-grouping null (so a rise is not just block-averaging)
function shuffledGroups(groupOf: number[], rng: { next: () => number }): number[] {
  const perm2 = groupOf.slice()
  for (let i = perm2.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); const t = perm2[i]!; perm2[i] = perm2[j]!; perm2[j] = t }
  return perm2
}

// ---------- the cusp test: {4,3,4} = Z^3, coarse by spatial cubic blocks ----------

function cuspTower(): { real: number[]; diff: number[]; nul: number[]; blocks: number[]; beatsDiffusion: boolean } {
  const L = 24
  const g = buildEuclideanLattice({ symbol: [4, 3, 4], maxCells: L * L * L * 2 })
  const n = g.cellCount
  const offsets = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(offsets[n]!)
  { let p = 0; for (let i = 0; i < n; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  // block-of-size-b grouping from integer coords
  const groupAt = (b: number): number[] => {
    const idx = new Map<string, number>()
    return g.coords.map((c) => {
      const k = `${Math.floor(c[0]! / b)},${Math.floor(c[1]! / b)},${Math.floor(c[2]! / b)}`
      if (!idx.has(k)) idx.set(k, idx.size)
      return idx.get(k)!
    })
  }
  const rng = makeRng({ seed: 11 })
  const tone = new Int8Array(n)
  for (let i = 0; i < n; i++) tone[i] = (rng.nextInt({ max: 3 }) - 1) as -1 | 0 | 1
  for (let f = 0; f < 40; f++) stepPerception(tone, offsets, adj, rng) // settle
  const blocks = [1, 2, 4, 6]
  const real: number[] = []
  const diff: number[] = []
  const nul: number[] = []
  for (const b of blocks) {
    const grp = groupAt(b)
    real.push(formPersistence(tone.slice(), offsets, adj, grp, makeRng({ seed: 5 }), { lag: 8, frames: 24, step: stepPerception }))
    diff.push(formPersistence(tone.slice(), offsets, adj, grp, makeRng({ seed: 5 }), { lag: 8, frames: 24, step: stepDiffusion }))
    nul.push(formPersistence(tone.slice(), offsets, adj, shuffledGroups(grp, rng), makeRng({ seed: 5 }), { lag: 8, frames: 24, step: stepPerception }))
  }
  const r = (x: number[]): number[] => x.map((v) => Math.round(v * 100) / 100)
  // a tower is only GENUINE if the perception rule beats the pure-diffusion control (else it is a generic
  // conserved-field slow mode, NOT selfhood). p208 found it does NOT beat diffusion.
  const beatsDiffusion = real[real.length - 1]! > diff[diff.length - 1]! + 0.1
  return { real: r(real), diff: r(diff), nul: r(nul), blocks, beatsDiffusion }
}

// ---------- the bulk test: actual {3,4,3,4} cell graph, coarse by the ADDRESS tree ----------

function bulkTower(): { real: number[]; diff: number[]; nul: number[]; depths: number[]; beatsDiffusion: boolean } {
  const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 20000 })
  const n = a.graph.cellCount
  const offsets = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i]! + a.graph.neighbors[i]!.length
  const adj = new Int32Array(offsets[n]!)
  { let p = 0; for (let i = 0; i < n; i++) for (const w of a.graph.neighbors[i]!) adj[p++] = w }
  // coarse-grain by truncating the ADDRESS to depth d (climb inward up the Fibonacci tree). d large = fine,
  // d small = coarse. Cells shallower than d join their own singleton (kept distinct).
  const groupAtDepth = (d: number): number[] => {
    const idx = new Map<string, number>()
    return a.address.map((addr) => {
      const k = addr.slice(0, d).join('.') || 'root'
      if (!idx.has(k)) idx.set(k, idx.size)
      return idx.get(k)!
    })
  }
  const rng = makeRng({ seed: 13 })
  const tone = new Int8Array(n)
  for (let i = 0; i < n; i++) tone[i] = (rng.nextInt({ max: 3 }) - 1) as -1 | 0 | 1
  for (let f = 0; f < 40; f++) stepPerception(tone, offsets, adj, rng)
  const depths = [4, 3, 2, 1] // fine -> coarse (address-prefix length)
  const real: number[] = []
  const diff: number[] = []
  const nul: number[] = []
  for (const d of depths) {
    const grp = groupAtDepth(d)
    real.push(formPersistence(tone.slice(), offsets, adj, grp, makeRng({ seed: 5 }), { lag: 8, frames: 24, step: stepPerception }))
    diff.push(formPersistence(tone.slice(), offsets, adj, grp, makeRng({ seed: 5 }), { lag: 8, frames: 24, step: stepDiffusion }))
    nul.push(formPersistence(tone.slice(), offsets, adj, shuffledGroups(grp, rng), makeRng({ seed: 5 }), { lag: 8, frames: 24, step: stepPerception }))
  }
  const r = (x: number[]): number[] => x.map((v) => Math.round(v * 100) / 100)
  const beatsDiffusion = real[real.length - 1]! > diff[diff.length - 1]! + 0.1
  return { real: r(real), diff: r(diff), nul: r(nul), depths, beatsDiffusion }
}

// Head-to-head, the perception rule against a pure-diffusion control on both the flat cusp
// and the hyperbolic bulk. If perception does not beat diffusion, the form-tower is a slow mode.
export function selvesTower(): {
  cuspBeatsDiffusion: boolean
  bulkBeatsDiffusion: boolean
  cuspRealCoarse: number
  cuspDiffCoarse: number
  bulkRealCoarse: number
  bulkDiffCoarse: number
} {
  const cusp = cuspTower()
  const bulk = bulkTower()
  return {
    cuspBeatsDiffusion: cusp.beatsDiffusion,
    bulkBeatsDiffusion: bulk.beatsDiffusion,
    cuspRealCoarse: cusp.real[cusp.real.length - 1] ?? 0,
    cuspDiffCoarse: cusp.diff[cusp.diff.length - 1] ?? 0,
    bulkRealCoarse: bulk.real[bulk.real.length - 1] ?? 0,
    bulkDiffCoarse: bulk.diff[bulk.diff.length - 1] ?? 0,
  }
}

export default defineExperiment({
  id: 'selves/selves-tower-3434',
  title: 'the coarse-grained form-tower on {3,4,3,4} does not beat a pure-diffusion control',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = selvesTower()
    const ok = !r.cuspBeatsDiffusion && !r.bulkBeatsDiffusion
    return verdict({
      status: ok ? 'pass' : 'partial',
      claim:
        'on both the flat cusp and the hyperbolic bulk of {3,4,3,4} the perception rule form-persistence does not beat plain diffusion, so the coarse-grained form-tower is a generic conserved-field slow mode and not hierarchical selfhood',
      metrics: {
        cuspBeatsDiffusion: r.cuspBeatsDiffusion ? 1 : 0,
        bulkBeatsDiffusion: r.bulkBeatsDiffusion ? 1 : 0,
        cuspRealCoarse: r.cuspRealCoarse,
        bulkRealCoarse: r.bulkRealCoarse,
      },
      control: {
        cuspDiffusionCoarse: r.cuspDiffCoarse,
        bulkDiffusionCoarse: r.bulkDiffCoarse,
      },
      notes:
        'L2 with a diffusion control and a shuffle null. The honest negative, net charge per block is the wrong measure for a self, and the rise it shows is reproduced by plain diffusion. A self is a propagating coherent pattern, not a charge correlation. Relies on a pseudo-random initial fill, so it is an ensemble statement, not a property of the deterministic rule.',
    })
  },
})
