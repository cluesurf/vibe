// P135: self-organized criticality. (self-organized-criticality.md, conditions-for-automatic-intelligence.md.)
//
// The minimal feedback for automatic maximal intelligence: DEMAND-DRIVEN creation, the arrow fires where
// it is quiet and is suppressed where it is busy (c_local = c0 * (1 - local activity)). This is the
// homeostatic loop. We test the two SOC fingerprints:
//   (a) SELF-TUNING, from very different starting densities the activity converges to the SAME interior
//       level (the system finds its own set-point, no external tuning),
//   (b) SCALE-FREE AVALANCHES, perturbing the self-organized state produces damage of all sizes (a
//       heavy-tailed distribution), versus a uniform-creation control whose response is not scale-free.
// Run: npx tsx code/experiment/p135-self-organized-criticality.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// local activity around an edge = fraction of nonzero cells among the two endpoints' neighbors
function localActivity(tone: Int8Array, offsets: Int32Array, adj: Int32Array, v: number, w: number): number {
  let nz = 0
  let tot = 0
  for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    if (tone[adj[p]!] !== 0) nz++
    tot++
  }
  for (let p = offsets[w]!; p < offsets[w + 1]!; p++) {
    if (tone[adj[p]!] !== 0) nz++
    tot++
  }
  return tot > 0 ? nz / tot : 0
}

// SOC beat: share + hop + DEMAND-DRIVEN creation (c0*(1-localActivity)). uniform=true ignores the feedback.
function socBeat(tone: Int8Array, g: { offsets: Int32Array; adj: Int32Array }, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng, c0: number, uniform: boolean): void {
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
      // edge-seeking feedback: revive ONLY near-dead neighborhoods, so activity hovers just above the
      // absorbing edge (the critical point), rather than stabilizing a fixed level
      const quiet = localActivity(tone, g.offsets, g.adj, v, w) < 0.12
      const rate = uniform ? c0 * 0.5 : quiet ? c0 : 0
      if (rng.next() < rate) {
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

const density = (t: Int8Array): number => {
  let nz = 0
  for (let i = 0; i < t.length; i++) if (t[i] !== 0) nz++
  return nz / t.length
}

export function selfOrganizedCriticality(input?: { n?: number }): {
  n: number
  lowFinal: number
  highFinal: number
  setPoint: number
  selfTunes: boolean
  avalancheMedian: number
  avalancheMax: number
  avalancheScaleSpan: number
  controlScaleSpan: number
  scaleFree: boolean
  solved: boolean
} {
  const n = input?.n ?? 15000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const c0 = 0.02 // SLOW drive (timescale separation), so the system hovers near the absorbing edge

  // (a) self-tuning: run from low and high initial density, both should converge to the same set-point
  const runTo = (initRho: number, seed: number): { tone: Int8Array; finalRho: number } => {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed })
    for (let i = 0; i < N; i++) tone[i] = (rng.next() < initRho ? (rng.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
    let last = 0
    for (let t = 0; t < 160; t++) {
      socBeat(tone, g, eu, ev, moved, rng, c0, false)
      if (t >= 150) last += density(tone) / 10
    }
    return { tone, finalRho: last }
  }
  const low = runTo(0.05, 11)
  const high = runTo(0.7, 22)
  const lowFinal = low.finalRho
  const highFinal = high.finalRho
  const setPoint = (lowFinal + highFinal) / 2
  const selfTunes = Math.abs(lowFinal - highFinal) < 0.05 && setPoint > 0.03 && setPoint < 0.9

  // (b) avalanches via damage spreading at the self-organized state, and a uniform-creation control
  const avalancheSizes = (uniform: boolean): number[] => {
    const base = new Int8Array(N)
    const rng0 = makeRng({ seed: 5 })
    for (let i = 0; i < N; i++) base[i] = (rng0.next() < 0.1 ? (rng0.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
    for (let t = 0; t < 120; t++) socBeat(base, g, eu, ev, moved, rng0, c0, uniform) // settle
    const sizes: number[] = []
    const trials = 120
    const T = 22
    for (let tr = 0; tr < trials; tr++) {
      const s = base.slice()
      const s2 = base.slice()
      const pr = makeRng({ seed: 9000 + tr })
      const cell = Math.floor(pr.next() * N)
      s2[cell] = (s2[cell]! === 0 ? 1 : 0) as -1 | 0 | 1 // the perturbation
      const ra = makeRng({ seed: 333 + tr })
      const rb = makeRng({ seed: 333 + tr })
      // relax with creation OFF, so we measure the PURE perturbation cascade (the avalanche) through the
      // self-organized background, not creation noise
      for (let t = 0; t < T; t++) {
        socBeat(s, g, eu, ev, moved, ra, 0, uniform)
        socBeat(s2, g, eu, ev, moved, rb, 0, uniform)
      }
      let diff = 0
      for (let i = 0; i < N; i++) if (s[i] !== s2[i]) diff++
      sizes.push(diff)
    }
    return sizes.sort((a, b) => a - b)
  }
  const soc = avalancheSizes(false)
  const ctrl = avalancheSizes(true)
  const median = (a: number[]): number => a[Math.floor(a.length / 2)]!
  const avalancheMedian = median(soc)
  const avalancheMax = soc[soc.length - 1]!
  const avalancheScaleSpan = avalancheMax / Math.max(avalancheMedian, 1)
  const controlScaleSpan = ctrl[ctrl.length - 1]! / Math.max(median(ctrl), 1)
  // NOTE: the damage spreads BALLISTICALLY (the lightcone, P123), so a fixed-window perturbation reaches a
  // roughly fixed radius, the size span is narrow (not scale-free). This metric measures ballistic spread,
  // not terminating avalanches, so it does NOT resolve criticality, that needs a terminating-cascade
  // protocol the continuous hop dynamics resists. Criticality is therefore UNDETERMINED here.
  const scaleFree = avalancheScaleSpan > 5 && avalancheScaleSpan > controlScaleSpan * 1.5

  // the ROBUST, demonstrated result is SELF-ORGANIZATION (homeostasis to a set-point with no external
  // tuning). Whether that set-point is precisely critical is left open by the ballistic confound.
  const solved = selfTunes

  return { n: N, lowFinal, highFinal, setPoint, selfTunes, avalancheMedian, avalancheMax, avalancheScaleSpan, controlScaleSpan, scaleFree, solved }
}

export default defineExperiment({
  id: 'selves/self-organized-criticality',
  title: 'demand-driven creation self-tunes the activity to one interior set-point from any start',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: false,
  run() {
    const r = selfOrganizedCriticality({ n: 3000 })
    const ok = r.solved && r.selfTunes
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'demand-driven creation makes the activity self-tune to the same interior set-point from any starting density with no external knob',
      metrics: { lowFinal: r.lowFinal, highFinal: r.highFinal, setPoint: r.setPoint },
      notes:
        'whether the set-point is precisely critical is left open, the damage-spreading metric is confounded by ballistic propagation',
    })
  },
})
