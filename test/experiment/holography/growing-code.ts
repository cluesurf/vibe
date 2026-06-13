// P127: the growing holographic code. (growing-holographic-code.md, P105, P109.)
//
// Claim to test: as the mesh grows, each new (larger) shell re-encodes a deep logical datum more
// redundantly, so the ERASURE THRESHOLD rises with shell radius (= age). We write a logical bit into the
// deep bulk (clamp the core to +1 or -1), let the perception rule spread it outward, and at each shell
// radius r measure f*(r), the maximum fraction of that shell we can erase and still recover the bit
// (sign of the surviving cells). If f*(r) RISES with r, the growing code protects its history better the
// older it gets. If it FALLS, the dynamics dilute the datum (a lossy encoder, the isometry gap).
// Run: npx tsx code/experiment/p126-growing-code.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { csrDistances, edgesFromCsr } from '@/code/tool/graph'
import { makeRng, Rng } from '@/code/tool/rng'
import { conservingHopSweep } from '@/code/dynamics/conserving-sweep'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// hop transport with the core re-clamped as a persistent source (arrow off, single sign, so share is inert)
function hopBeat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng): void {
  conservingHopSweep({ tone, eu, ev, moved, rng })
}

export function growingCode(input?: { n?: number; beats?: number }): {
  n: number
  maxRadius: number
  shells: { r: number; cells: number; marked: number; density: number; threshold: number }[]
  thresholdRises: boolean
  complementaryRecovery: boolean
  densityDilutes: boolean
  redundancyGrows: boolean
  solved: boolean
} {
  const n = input?.n ?? 200000
  const beats = input?.beats ?? 100
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  // BFS shells from the center
  const dist = csrDistances({ offsets: g.offsets, adj: g.adj, size: N, source: 0 })
  let R = 0
  for (let i = 0; i < N; i++) if (dist[i]! > R) R = dist[i]!
  const core: number[] = []
  for (let i = 0; i < N; i++) if (dist[i]! <= 1) core.push(i)
  const shellCells: number[][] = Array.from({ length: R + 1 }, () => [])
  for (let i = 0; i < N; i++) shellCells[dist[i]!]!.push(i)

  // run the encoder for both logical values, clamping the core as a persistent source
  const encode = (bit: 1 | -1): Int8Array => {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed: 5 })
    for (let t = 0; t < beats; t++) {
      for (const i of core) tone[i] = bit
      hopBeat(tone, eu, ev, moved, rng)
      for (const i of core) tone[i] = bit
    }
    return tone
  }
  const tonePos = encode(1)
  const toneNeg = encode(-1)

  // recover the bit from a shell after erasing a fraction f (sign of the surviving cells), success over
  // many random erasures and BOTH bits. f*(r) = the largest f with success rate >= 0.85.
  const rngE = makeRng({ seed: 21 })
  const recoverRate = (cells: number[], tone: Int8Array, bit: number, f: number): number => {
    let ok = 0
    const trials = 40
    for (let t = 0; t < trials; t++) {
      let sum = 0
      for (const c of cells) if (rngE.next() >= f) sum += tone[c]!
      if (Math.sign(sum) === bit) ok++
    }
    return ok / trials
  }
  // scan to EXTREME erasure, the absolute redundancy (count of marked cells) grows with radius even as
  // density dilutes, so the threshold should keep rising into the >95% regime
  const fGrid = [0.5, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.998, 0.999]
  const thresholdFor = (cells: number[]): number => {
    let best = 0
    for (const f of fGrid) {
      const rate = (recoverRate(cells, tonePos, 1, f) + recoverRate(cells, toneNeg, -1, f)) / 2
      if (rate >= 0.85) best = f
    }
    return best
  }

  const shells: { r: number; cells: number; marked: number; density: number; threshold: number }[] = []
  for (let r = 2; r <= R - 1; r++) {
    const cells = shellCells[r]!
    if (cells.length < 20) continue
    let nz = 0
    for (const c of cells) if (tonePos[c] !== 0) nz++
    shells.push({ r, cells: cells.length, marked: nz, density: nz / cells.length, threshold: thresholdFor(cells) })
  }

  // the threshold should be monotonically non-decreasing in radius, with the rim clearly above the core.
  // Near the ceiling the right gauge is the SURVIVAL fraction 1 - f*, which should keep shrinking.
  let monotonic = true
  for (let i = 1; i < shells.length; i++) if (shells[i]!.threshold < shells[i - 1]!.threshold - 1e-9) monotonic = false
  const first = shells[0]
  const last = shells[shells.length - 1]
  const thresholdRises = shells.length > 1 && monotonic && last!.threshold > first!.threshold + 0.02
  const complementaryRecovery = shells.length > 0 && last!.threshold >= 0.5
  const densityDilutes = shells.length > 1 && last!.density < first!.density * 0.5
  const redundancyGrows = shells.length > 1 && last!.marked > first!.marked // absolute redundancy rises
  const solved = thresholdRises && complementaryRecovery && redundancyGrows

  return { n: N, maxRadius: R, shells, thresholdRises, complementaryRecovery, densityDilutes, redundancyGrows, solved }
}

export default defineExperiment({
  id: 'holography/growing-code',
  title: 'the growing holographic code raises its erasure threshold with shell age',
  category: 'holography',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = growingCode({ n: 200000 })
    const ok =
      r.solved && r.thresholdRises && r.redundancyGrows && r.complementaryRecovery
    const first = r.shells[0]
    const last = r.shells[r.shells.length - 1]
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the erasure threshold rises with shell radius as the absolute redundancy grows even while density dilutes, with complementary recovery from the rim',
      metrics: {
        firstThreshold: first?.threshold ?? 0,
        lastThreshold: last?.threshold ?? 0,
        firstMarked: first?.marked ?? 0,
        lastMarked: last?.marked ?? 0,
      },
      control: { firstThreshold: first?.threshold ?? 0 },
    })
  },
})
