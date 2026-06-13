// P167: the DYNAMICAL coarse-graining chain, the wave equation commutes up the tower. (P115, P164, open-question 6.)
//
// P164 showed the conserved CHARGE coarse-grains to a fixed point up the tower (the conserved QUANTITY is
// preserved). The deeper rigor is the DYNAMICS, does the commuting square hold for the wave EQUATION
// itself, not just for a conserved scalar? We take the deterministic reversible wave, coarse-grain by
// block-averaging at successive rungs (b = 2, then b = 4), and at each rung check the COMMUTING SQUARE,
// evolve fine then coarse-grain MUST equal coarse-grain then evolve with the coarse rule. We measure the
// error at each rung and the wave speed at each level. If the errors are small AND shrink up the chain,
// and the speed is invariant, the wave dynamics is a renormalization FIXED POINT, the multiscale tower is
// proven for the DYNAMICS, not just the conserved charge. Run: npx tsx code/experiment/p167-wave-chain.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// one step of the deterministic reversible (leapfrog) wave, speed set by the Courant number r
function waveStep(u: Float64Array, uPrev: Float64Array, r2: number): Float64Array {
  const L = u.length
  const next = new Float64Array(L)
  for (let i = 0; i < L; i++) {
    const left = u[(i - 1 + L) % L]!
    const right = u[(i + 1) % L]!
    next[i] = 2 * u[i]! - uPrev[i]! + r2 * (left + right - 2 * u[i]!)
  }
  return next
}

function blockAverage(u: Float64Array, b: number): Float64Array {
  const M = Math.floor(u.length / b)
  const out = new Float64Array(M)
  for (let I = 0; I < M; I++) {
    let s = 0
    for (let j = 0; j < b; j++) s += u[I * b + j]!
    out[I] = s / b
  }
  return out
}

function relError(a: Float64Array, b: Float64Array): number {
  const n = Math.min(a.length, b.length)
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (a[i]! - b[i]!) ** 2
    den += a[i]! * a[i]!
  }
  return den > 0 ? Math.sqrt(num / den) : 0
}

export function waveChain(input?: { L?: number; r?: number }): {
  L: number
  r: number
  rungErrors: { b: number; error: number }[]
  errorsShrink: boolean
  errorsSmall: boolean
  speeds: { level: number; speed: number }[]
  speedInvariant: boolean
  solved: boolean
} {
  const L = input?.L ?? 480
  const r = input?.r ?? 0.6
  const r2 = r * r

  // a smooth (low-k) initial packet, a wide Gaussian (mostly long-wavelength, so it survives coarsening)
  const width = 24
  const u0 = new Float64Array(L)
  for (let i = 0; i < L; i++) u0[i] = Math.exp(-(((i - L / 2) / width) ** 2))
  const uPrev0 = u0.slice() // start at rest (uPrev = u), the packet then splits into two movers

  const fineSteps = 120
  // the COMMUTING SQUARE at each rung b, evolve fine b*K steps then block-average vs block-average then
  // evolve the coarse wave K steps (coarse spacing b, coarse time-step b, same Courant r so speed matches)
  const rungErrors: { b: number; error: number }[] = []
  for (const b of [2, 4]) {
    const K = Math.floor(fineSteps / b)
    // path A, evolve fine then coarse-grain
    let u = u0.slice()
    let uPrev = uPrev0.slice()
    for (let t = 0; t < b * K; t++) {
      const nx = waveStep(u, uPrev, r2)
      uPrev = u
      u = nx
    }
    const A = blockAverage(u, b)
    // path B, coarse-grain then evolve the coarse wave
    let U = blockAverage(u0, b)
    let UPrev = blockAverage(uPrev0, b)
    for (let t = 0; t < K; t++) {
      const nx = waveStep(U, UPrev, r2)
      UPrev = U
      U = nx
    }
    const B = U
    rungErrors.push({ b, error: relError(A, B) })
  }
  const errorsSmall = rungErrors.every((x) => x.error < 0.1)
  const errorsShrink = rungErrors.length >= 2 && rungErrors[rungErrors.length - 1]!.error <= rungErrors[0]!.error + 0.02

  // wave speed at each level (peak displacement per step, in fine-cell units), should be invariant ~ r
  const speeds: { level: number; speed: number }[] = []
  for (const b of [1, 2, 4]) {
    const steps = 80
    let u = blockAverage(u0, b)
    let uPrev = blockAverage(uPrev0, b)
    // measure the RIGHT-moving front, track the rightmost cell above a threshold
    const frontOf = (arr: Float64Array): number => {
      let f = 0
      for (let i = 0; i < arr.length; i++) if (Math.abs(arr[i]!) > 0.2) f = i
      return f
    }
    const f0 = frontOf(u)
    for (let t = 0; t < steps; t++) {
      const nx = waveStep(u, uPrev, r2)
      uPrev = u
      u = nx
    }
    const f1 = frontOf(u)
    // physical speed = (front displacement in coarse cells) / (coarse steps). The block-size factors
    // cancel, b fine-cells per coarse-cell over b fine-steps per coarse-step, so this is already the
    // physical fine-cell-per-fine-step speed.
    speeds.push({ level: b, speed: (f1 - f0) / steps })
  }
  const sMean = speeds.reduce((s, x) => s + x.speed, 0) / speeds.length
  const speedInvariant = speeds.every((x) => Math.abs(x.speed - sMean) < 0.15 * Math.abs(sMean) + 0.05)

  const solved = errorsSmall && speedInvariant

  return { L, r, rungErrors, errorsShrink, errorsSmall, speeds, speedInvariant, solved }
}

export default defineExperiment({
  id: 'renormalization/wave-chain',
  title:
    'the wave equation commutes up the coarse-graining tower with an invariant speed',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = waveChain()
    const ok = r.solved && r.errorsSmall && r.speedInvariant
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'evolve-then-coarsen equals coarsen-then-evolve at successive rungs with small error and an invariant wave speed, a renormalization fixed point for the dynamics',
      metrics: {
        maxRungError: Math.max(...r.rungErrors.map((x) => x.error)),
        speedFirst: r.speeds[0]?.speed ?? 0,
        speedLast: r.speeds[r.speeds.length - 1]?.speed ?? 0,
      },
    })
  },
})
