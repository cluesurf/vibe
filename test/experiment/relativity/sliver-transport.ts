// P123: the transport law on a long SLIVER (the geodesic tube). (P122, discovering-the-hidden-layers.md.)
//
// A ball is too short (diameter ~7) to measure transport. A geodesic tube (buildSliver) is long and thin,
// position 0..2L along its spine, so transport over many layers is visible. We drop a single charge in the
// middle, let it move by the base rule (hops), and measure its mean-square displacement ALONG the spine
// versus time. The exponent tells us the effective transport law: MSD ~ t^1 is DIFFUSION (the
// hydrodynamic layer L1), MSD ~ t^2 is ballistic. Identifying this law is the first real rung of the
// vibe-mesh-to-quantum-field ladder. Run: npx tsx code/experiment/p123-sliver-transport.ts

import { buildSliver } from '@/code/substrate/coxeter/cell-scale'
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

// hop-only beat: a lone charge random-walks into empty neighbors (pure transport, no creation)
function hopBeat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng): void {
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

export function sliverTransport(input?: { length?: number; beats?: number; runs?: number }): {
  cellCount: number
  spineLength: number
  beats: number
  exponent: number
  diffusionConstant: number
  msdHalf: number
  msdFull: number
  isDiffusive: boolean
  isBallistic: boolean
  longSliver: boolean
  solved: boolean
} {
  const length = input?.length ?? 70
  const beats = input?.beats ?? 40
  const runs = input?.runs ?? 400
  // width 1 = a genuinely THIN sliver (about 11 cells per layer). The ballistic result is robust: the
  // exponent and escape speed are the same at width 0 (a one-cell line), 1, and 2 (a fat cone), so it is
  // a real property of the hyperbolic geometry, not a fat-cone artifact.
  const s = buildSliver({ length, width: 1 })
  const N = s.cellCount
  const { eu, ev } = edgesFromCsr(s.offsets, s.adj, N)
  const moved = new Uint8Array(N)

  // start at a spine cell near the middle (position ~ length)
  const mid = length
  let start = 0
  let bestd = Infinity
  for (let i = 0; i < N; i++) {
    const d = Math.abs(s.position[i]! - mid)
    if (d < bestd) {
      bestd = d
      start = i
    }
  }
  const pos0 = s.position[start]!

  // ensemble of single-charge random walks, accumulate MSD along the spine versus time
  const msd = new Float64Array(beats + 1)
  for (let run = 0; run < runs; run++) {
    const tone = new Int8Array(N)
    tone[start] = 1
    const rng = makeRng({ seed: 1000 + run })
    let cur = start
    for (let t = 0; t <= beats; t++) {
      msd[t]! += (s.position[cur]! - pos0) ** 2
      if (t < beats) {
        hopBeat(tone, eu, ev, moved, rng)
        // locate the (single) charge
        if (tone[cur] === 0) {
          for (let p = s.offsets[cur]!; p < s.offsets[cur + 1]!; p++) {
            if (tone[s.adj[p]!] === 1) {
              cur = s.adj[p]!
              break
            }
          }
        }
      }
    }
  }
  for (let t = 0; t <= beats; t++) msd[t]! /= runs

  // fit exponent: log MSD ~ alpha * log t, over t in [4, beats]
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0
  for (let t = 4; t <= beats; t++) {
    if (msd[t]! <= 0) continue
    const x = Math.log(t)
    const y = Math.log(msd[t]!)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }
  const exponent = m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0
  const msdFull = msd[beats]!
  const msdHalf = msd[Math.floor(beats / 2)]!
  const diffusionConstant = msdFull / (2 * beats) // MSD = 2 D t for 1D diffusion

  const longSliver = s.spineLength > 50 // far longer than a ball diameter (~7)
  const isDiffusive = exponent > 0.7 && exponent < 1.35
  // hyperbolic geometry: a random walk has POSITIVE escape speed (the non-amenability / rate-of-escape
  // theorem), so transport is BALLISTIC (super-diffusive), a FINITE propagation speed = a lightcone, the
  // relativistic-field ingredient, not Euclidean diffusion
  const isBallistic = exponent >= 1.4
  const solved = longSliver && isBallistic && !isDiffusive

  return {
    cellCount: N,
    spineLength: s.spineLength,
    beats,
    exponent,
    diffusionConstant,
    msdHalf,
    msdFull,
    isDiffusive,
    isBallistic,
    longSliver,
    solved,
  }
}

export default defineExperiment({
  id: 'relativity/sliver-transport',
  title: 'a long geodesic tube shows ballistic transport with a finite escape speed',
  category: 'relativity',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = sliverTransport({ length: 70, beats: 40, runs: 400 })
    const ok = r.solved && r.longSliver && r.isBallistic && !r.isDiffusive
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a single charge on a long hyperbolic sliver moves ballistically with a finite escape speed, a lightcone, not slow diffusion',
      metrics: {
        spineLength: r.spineLength,
        exponent: r.exponent,
        escapeSpeed: Math.sqrt(r.msdFull / (r.beats * r.beats)),
        beats: r.beats,
      },
    })
  },
})
