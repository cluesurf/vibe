// P115: the renormalization keystone, slice-invariance of the effective field. (the-multiscale-shortcut.md.)
//
// The practical keystone of the multiscale shortcut: the field's EFFECTIVE PARAMETERS, measured on a
// small SLICE, must equal those measured on a much larger one. If they match, the slice's effective
// theory IS the universe's effective theory, which is exactly what justifies "test a slice, assume it
// scales." We measure three robust intensive parameters of the field vacuum (the vacuum density, the
// nearest-neighbour connected correlation, the pair structure, and the causal lightcone speed) on a
// small and a large slice and check they agree.
//
// Honest note on full RG: the vacuum field is MASSIVE (short correlation length, about two cells), so
// coarse-graining beyond that length trivially decorrelates it, the standard flow of a gapped field
// toward a trivial fixed point. A scale-invariant (massless) field would be a tunable critical point.
// Slice-invariance of the intensive parameters is the robust statement, and is what the shortcut needs.
// Run: npx tsx code/experiment/p115-renormalization.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function edgesFromCsr(offsets: Int32Array, adj: Int32Array, n: number): { eu: Int32Array; ev: Int32Array } {
  const eu: number[] = []
  const ev: number[] = []
  for (let v = 0; v < n; v++) for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    const w = adj[p]!
    if (w > v) {
      eu.push(v)
      ev.push(w)
    }
  }
  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev) }
}

function bfsDist(offsets: Int32Array, adj: Int32Array, n: number, src: number, maxR: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  let r = 0
  while (fr.length > 0 && r < maxR) {
    r++
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = r
        next.push(w)
      }
    }
    fr = next
  }
  return dist
}

function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng, arrow: number): void {
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrow) {
        if (rng.next() < 0.5) {
          tone[v] = 1
          tone[w] = -1
        } else {
          tone[v] = -1
          tone[w] = 1
        }
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

type FieldParams = { n: number; density: number; c1: number; coneSpeed: number }

function measureField(n: number, seed: number): FieldParams {
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const ARROW = 0.1
  const tone = new Int8Array(N)
  const rng = makeRng({ seed })
  for (let b = 0; b < 80; b++) beat(tone, eu, ev, moved, rng, ARROW)

  let nz = 0
  let sum = 0
  for (let i = 0; i < N; i++) {
    if (tone[i] !== 0) nz++
    sum += tone[i]!
  }
  const density = nz / N
  const mean = sum / N
  // nearest-neighbour connected correlation (the pair structure), robust over all edges
  let c1 = 0
  for (let k = 0; k < eu.length; k++) c1 += (tone[eu[k]!]! - mean) * (tone[ev[k]!]! - mean)
  c1 /= eu.length

  // causal lightcone via butterfly front
  let center = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[center + 1]! - g.offsets[center]!) center = i
  const dcenter = bfsDist(g.offsets, g.adj, N, center, 12)
  const base = tone.slice()
  const pert = tone.slice()
  pert[center] = base[center]! === 0 ? 1 : 0
  const T = 5
  const rb = makeRng({ seed: seed + 1 })
  const rp = makeRng({ seed: seed + 1 })
  for (let b = 0; b < T; b++) beat(base, eu, ev, moved, rb, ARROW)
  for (let b = 0; b < T; b++) beat(pert, eu, ev, moved, rp, ARROW)
  let front = 0
  for (let i = 0; i < N; i++) if (base[i] !== pert[i]) {
    const r = dcenter[i]!
    if (r > front) front = r
  }
  const coneSpeed = front / T

  return { n: N, density, c1, coneSpeed }
}

export function renormalization(input?: { small?: number; large?: number }): {
  small: FieldParams
  large: FieldParams
  densityMatch: boolean
  c1Match: boolean
  coneMatch: boolean
  pairStructure: boolean
  sliceInvariant: boolean
  solved: boolean
} {
  const small = measureField(input?.small ?? 30000, 7)
  const large = measureField(input?.large ?? 150000, 13)

  const rel = (a: number, b: number): number => Math.abs(a - b) / (Math.abs(a) + Math.abs(b) + 1e-9)
  const densityMatch = rel(small.density, large.density) < 0.1
  const c1Match = rel(small.c1, large.c1) < 0.2
  const coneMatch = Math.abs(small.coneSpeed - large.coneSpeed) <= 0.5
  const pairStructure = small.c1 < 0 && large.c1 < 0 // both show pair anti-correlation
  const sliceInvariant = densityMatch && c1Match && coneMatch && pairStructure
  const solved = sliceInvariant

  return { small, large, densityMatch, c1Match, coneMatch, pairStructure, sliceInvariant, solved }
}

export default defineExperiment({
  id: 'renormalization/renormalization-keystone',
  title:
    'the effective field parameters measured on a small slice match those of a much larger field',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = renormalization({ small: 30000, large: 150000 })
    const ok =
      r.solved &&
      r.sliceInvariant &&
      r.densityMatch &&
      r.c1Match &&
      r.coneMatch &&
      r.pairStructure
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the field intensive parameters are slice-invariant so a slice equals the large field, justifying test-a-slice-assume-all-scales',
      metrics: {
        smallDensity: r.small.density,
        smallPairCorrelation: r.small.c1,
        smallConeSpeed: r.small.coneSpeed,
      },
      control: {
        largeDensity: r.large.density,
        largePairCorrelation: r.large.c1,
        largeConeSpeed: r.large.coneSpeed,
      },
    })
  },
})
