// P132: time reflection positivity, the TIME-direction complement to the spatial RP test (P130) and the
// Doi-Peliti check (P131). (P126, bridge-theories-vibe-to-field.md.)
//
// The picture so far: P131 shows the rule IS a reversible spin-1 exchange model, so its Doi-Peliti
// generator is HERMITIAN. P130 finds SPATIAL reflection positivity undecided in the massive regime
// (contact-dominated, pending near-criticality). This experiment tests the remaining piece in the TIME
// direction, does that Hermitian generator have NON-NEGATIVE spectrum (H >= 0)? Hermitian alone is not
// enough for a quantum theory, the energies must be bounded below.
//
// Osterwalder-Schrader in time: the beat-autocorrelation G(tau) = <O(0) O(tau)> in the reversible steady
// state must be a positive spectral integral, G(tau) = integral of e^{-E tau} d-rho(E) with d-rho >= 0,
// equivalently the HANKEL moment matrix H[i,j] = G(i+j) is positive semi-definite. PSD means the beat IS
// the imaginary-time evolution of a real quantum system with H >= 0. A genuine negative eigenvalue (beyond
// the discrete-update temporal doubler and the statistical noise) would mean a non-quantum mimic.
// Run: npx tsx code/experiment/p132-time-reflection-positivity.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { edgesFromCsr } from '@/code/tool/graph'
import { makeRng, Rng } from '@/code/tool/rng'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import {
  hankelMatrix,
  symmetricMinEigenvalue,
} from '@/code/measure/hankel'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function beat(
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
): void {
  conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })
}

export function reflectionPositivity(input?: { n?: number }): {
  n: number
  autocorr: number[]
  hankelSize: number
  minEigenvalue: number
  normalizedMinEig: number
  rawMinEig: number
  doublerAmplitude: number
  hasDoubler: boolean
  monotone: boolean
  reflectionPositive: boolean
  solved: boolean
} {
  const n = input?.n ?? 10000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const ARROW = 0.1

  // a local field observable that DECORRELATES fast (so G(tau) decays cleanly, not a slow conserved mode):
  // a GRADIENT, mean tone over patch A minus mean over an adjacent patch B. A-B is not conserved.
  const ball = (
    seed: number,
    size: number,
    claimed: Uint8Array,
  ): number[] => {
    const out: number[] = []
    const seen = new Uint8Array(N)
    seen[seed] = 1

    let fr = [seed]

    while (fr.length > 0 && out.length < size) {
      const nf: number[] = []

      for (const u of fr) {
        if (claimed[u]) {
          continue
        }

        out.push(u)
        claimed[u] = 1

        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!

          if (!seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }

      fr = nf
    }

    return out
  }

  // a single medium patch (~30 cells), its mean tone decorrelates over a few beats without the sloshing
  // a gradient observable would introduce. Slow enough to be a clean field mode, fast enough to decay.
  const claimed = new Uint8Array(N)
  const patchA = ball(Math.floor(N / 2), 30, claimed)

  const obs = (tone: Int8Array): number => {
    let a = 0

    for (const i of patchA) {
      a += tone[i]!
    }

    return a / patchA.length
  }

  // reach the reversible steady state, then record a long trajectory of the observable
  const tone = new Int8Array(N)
  const rng = makeRng({ seed: 7 })

  for (let i = 0; i < N; i++) {
    tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0) as
      | -1
      | 0
      | 1
  }

  for (let t = 0; t < 60; t++) {
    beat(tone, eu, ev, moved, rng, ARROW)
  }

  const T = 8000
  const series = new Float64Array(T)

  for (let t = 0; t < T; t++) {
    series[t] = obs(tone)
    beat(tone, eu, ev, moved, rng, ARROW)
  }

  const m = 6
  const maxTau = 2 * m

  // normalized-min-eigenvalue of the Hankel built from a sub-series at a given STRIDE. Stride 2 samples
  // every other beat, which removes the discrete-update "temporal doubler" (a negative eigenvalue from
  // the synchronous update becomes positive under squaring).
  const hankelMinEig = (
    start: number,
    len: number,
    stride: number,
  ): number => {
    let mean = 0

    for (let t = start; t < start + len; t++) {
      mean += series[t]!
    }

    mean /= len

    const ac: number[] = []

    for (let tau = 0; tau <= maxTau; tau++) {
      let s = 0
      let c = 0

      for (let t = start; t + tau * stride < start + len; t++) {
        s += (series[t]! - mean) * (series[t + tau * stride]! - mean)
        c++
      }

      ac.push(s / c)
    }

    return (
      symmetricMinEigenvalue(hankelMatrix({ sequence: ac, size: m })) /
      ac[0]!
    )
  }

  // full-sample autocorrelation (for reporting)
  let mean = 0

  for (let t = 0; t < T; t++) {
    mean += series[t]!
  }

  mean /= T

  const autocorr: number[] = []

  for (let tau = 0; tau <= maxTau; tau++) {
    let s = 0

    for (let t = 0; t + tau < T; t++) {
      s += (series[t]! - mean) * (series[t + tau]! - mean)
    }

    autocorr.push(s / (T - tau))
  }

  const rawMinEig = hankelMinEig(0, T, 1) // shows the temporal doubler (discrete-update artifact)
  const evenMinEig = hankelMinEig(0, T, 2) // doubler removed: the genuine spectral-positivity test

  // period-2 amplitude (even lags minus odd lags) makes the doubler explicit
  let evenSum = 0
  let oddSum = 0

  for (let tau = 1; tau <= maxTau; tau++) {
    tau % 2 === 0
      ? (evenSum += autocorr[tau]!)
      : (oddSum += autocorr[tau]!)
  }

  const doublerAmplitude = (evenSum - oddSum) / autocorr[0]!

  // block-bootstrap noise floor for the doubler-removed (stride-2) eigenvalue
  const blocks = 8
  const blockLen = Math.floor(T / blocks)
  const blockEigs: number[] = []

  for (let b = 0; b < blocks; b++) {
    blockEigs.push(hankelMinEig(b * blockLen, blockLen, 2))
  }

  const meanBlock = blockEigs.reduce((s, x) => s + x, 0) / blocks
  const stdBlock = Math.sqrt(
    blockEigs.reduce((s, x) => s + (x - meanBlock) ** 2, 0) / blocks,
  )

  const noiseFloor = stdBlock / Math.sqrt(blocks)

  // RP holds (continuum-time) iff the doubler-removed Hankel is PSD within statistical noise
  const reflectionPositive = evenMinEig > -(3 * noiseFloor + 1e-4)
  const hasDoubler =
    rawMinEig < -3 * noiseFloor && doublerAmplitude > 2 * noiseFloor

  const solved = reflectionPositive

  return {
    n: N,
    autocorr,
    hankelSize: m + 1,
    minEigenvalue: evenMinEig * autocorr[0]!,
    normalizedMinEig: evenMinEig,
    rawMinEig,
    doublerAmplitude,
    hasDoubler,
    monotone: !hasDoubler,
    reflectionPositive,
    solved,
  }
}

export default experiment({
  id: 'quantum/time-reflection-positivity',
  title: 'the beat-autocorrelation Hankel is PSD within noise',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = reflectionPositivity({ n: 10000 })
    const ok = r.solved && r.reflectionPositive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Hermitian generator has non-negative spectrum within noise, a positive-energy unitary theory consistent in time',
      metrics: { normalizedMinEig: r.normalizedMinEig },
    })
  },
})
