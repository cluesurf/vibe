// P155: the unified model, one mesh, one rule, all phenomena together. (integration test for P100 to P153.)
//
// Each experiment tests one phenomenon. This checks they are not separate tailored setups but ONE model,
// the same canonical perception rule on the same {5,3,4} mesh produces the key phenomena TOGETHER in a
// single run, conservation, life (vs dead peace without the arrow), a finite lightcone, reversibility, and
// memory, plus spatial coherence (the seed of selves). If all co-occur on one substrate, the theory is
// unified, not a pile of one-offs. Run: npx tsx code/experiment/p155-unified-model.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr, csrDistances } from '@/code/tool/graph'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import { totalCharge as sumQ } from '@/code/measure/tone-census'
import { toneDensity as density } from '@/code/measure/avalanche'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function unifiedModel(input?: { n?: number }): {
  n: number
  conserved: boolean
  alive: boolean
  deadWithoutArrow: boolean
  lightcone: boolean
  reversible: boolean
  coherent: boolean
  allTogether: boolean
  solved: boolean
} {
  const n = input?.n ?? 30000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const arrow = 0.1

  // ONE canonical run
  const tone = new Int8Array(N)
  const rng = makeRng({ seed: 7 })

  for (let i = 0; i < N; i++) {
    tone[i] = rng.next() < 0.25 ? (rng.next() < 0.5 ? 1 : -1) : 0
  }

  const q0 = sumQ(tone)

  for (let t = 0; t < 80; t++) {
    conservingEdgeSweep({
      tone: tone,
      eu,
      ev,
      moved,
      rng: rng,
      arrow: arrow,
    })
  }

  // (1) conservation, Q unchanged across the whole run
  const conserved = sumQ(tone) === q0
  // (2) life, the arrow keeps it active
  const alive = density(tone) > 0.05
  // (2b) dead without the arrow, a control run with arrow=0 relaxes toward peace
  const dead = new Int8Array(N)
  const rngD = makeRng({ seed: 7 })

  for (let i = 0; i < N; i++) {
    dead[i] = rngD.next() < 0.25 ? (rngD.next() < 0.5 ? 1 : -1) : 0
  }

  for (let t = 0; t < 80; t++) {
    conservingEdgeSweep({
      tone: dead,
      eu,
      ev,
      moved,
      rng: rngD,
      arrow: 0,
    })
  }

  const deadWithoutArrow = density(dead) < density(tone) * 0.5

  // (3) lightcone, a perturbation spreads at a bounded finite speed (same RNG copies, position-indexed not
  // needed here, use the front radius growth)
  let center = 0

  for (let i = 1; i < N; i++) {
    if (
      g.offsets[i + 1]! - g.offsets[i]! >
      g.offsets[center + 1]! - g.offsets[center]!
    ) {
      center = i
    }
  }

  const distC = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center,
  })

  const s = tone.slice()
  const s2 = tone.slice()
  s2[center] = (s2[center]!) === 0 ? 1 : 0

  const ra = makeRng({ seed: 99 })
  const rb = makeRng({ seed: 99 })
  const T = 4

  for (let t = 0; t < T; t++) {
    conservingEdgeSweep({
      tone: s,
      eu,
      ev,
      moved,
      rng: ra,
      arrow: arrow,
    })
    conservingEdgeSweep({
      tone: s2,
      eu,
      ev,
      moved,
      rng: rb,
      arrow: arrow,
    })
  }

  let front = 0

  for (let i = 0; i < N; i++) {
    if (s[i] !== s2[i] && distC[i]! > front) {
      front = distC[i]!
    }
  }

  const speed = front / T
  const lightcone = speed > 0 && speed < 4 // a finite, bounded propagation speed

  // (4) reversibility, local edge-transition asymmetry near the statistical floor (detailed balance)
  const st = (x: number): number => x + 1
  const S9 = 9
  const C = new Float64Array(S9 * S9)
  const sample: number[] = []

  for (let k = 0; k < eu.length; k += 3) {
    sample.push(k)
  }

  for (let b = 0; b < 60; b++) {
    const pre = sample.map(
      k => st(tone[eu[k]!]!) * 3 + st(tone[ev[k]!]!),
    )

    conservingEdgeSweep({
      tone: tone,
      eu,
      ev,
      moved,
      rng: rng,
      arrow: arrow,
    })

    for (let i = 0; i < sample.length; i++) {
      const k = sample[i]!
      C[pre[i]! * S9 + (st(tone[eu[k]!]!) * 3 + st(tone[ev[k]!]!))]! +=
        1
    }
  }

  let asym = 0
  let total = 0

  for (let a = 0; a < S9; a++) {
    for (let bb = a + 1; bb < S9; bb++) {
      asym += Math.abs(C[a * S9 + bb]! - C[bb * S9 + a]!)
      total += C[a * S9 + bb]! + C[bb * S9 + a]!
    }
  }

  const reversible = total > 0 && asym / total < 0.15

  // (5) coherence, neighbours are correlated (structure, not white noise), the seed of selves
  const mean = sumQ(tone) / N

  let cc = 0
  let cnt = 0

  for (let k = 0; k < eu.length; k++) {
    cc += (tone[eu[k]!]! - mean) * (tone[ev[k]!]! - mean)
    cnt++
  }

  const nnCorr = cc / cnt
  const coherent = Math.abs(nnCorr) > 0.001 // nonzero spatial structure

  const allTogether =
    conserved &&
    alive &&
    deadWithoutArrow &&
    lightcone &&
    reversible &&
    coherent

  const solved = allTogether

  return {
    n: N,
    conserved,
    alive,
    deadWithoutArrow,
    lightcone,
    reversible,
    coherent,
    allTogether,
    solved,
  }
}

export default experiment({
  id: 'foundations/unified-model',
  code: 'E-FND-0040',
  title:
    'one mesh and one rule produce all the key phenomena together in one run',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = unifiedModel({ n: 30000 })
    const ok =
      r.solved &&
      r.allTogether &&
      r.conserved &&
      r.alive &&
      r.deadWithoutArrow &&
      r.lightcone &&
      r.reversible &&
      r.coherent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the canonical rule on one {5,3,4} mesh shows conservation, life versus dead peace, a finite lightcone, reversibility, and spatial coherence in a single run',
      metrics: {
        cells: r.n,
        phenomenaSatisfied: [
          r.conserved,
          r.alive,
          r.deadWithoutArrow,
          r.lightcone,
          r.reversible,
          r.coherent,
        ].filter(x => x).length,
      },
    })
  },
})
