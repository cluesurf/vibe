// P137: the dynamic dispersion of the conserved charge, the gapless hydrodynamic mode. (P136, quantization-status.md.)
//
// P136 showed there is no STATIC gapless critical point, the charge two-point function is contact-dominated
// everywhere. But a conserved charge ALWAYS has a gapless DYNAMIC mode, the k=0 mode is the exactly
// conserved total charge (relaxation rate zero), and the small-k modes relax slowly (the hydrodynamic
// mode protected by the conservation law). This measures that mode, the spatial Fourier component q_k(t)
// of the charge, its time-correlation C_k(tau), and the relaxation rate Gamma(k). Fitting Gamma(k) ~ k^z
// gives the DYNAMIC EXPONENT, z = 2 is DIFFUSIVE (omega ~ D k^2, non-relativistic), z = 1 is a PROPAGATING
// / sound / relativistic mode (omega ~ c |k|, a massless relativistic particle, the photon-like mode we
// want). This decides whether the gapless mode is relativistic. Run: npx tsx code/experiment/p137-dynamic-dispersion.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { conservingChainSweep } from '@/code/dynamics/conserving-sweep'
import { logLogSlope } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function beat(
  tone: Int8Array,
  L: number,
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
): void {
  conservingChainSweep({ tone, length: L, moved, rng, arrow })
}

export function dynamicDispersion(input?: {
  L?: number
  arrow?: number
}): {
  L: number
  modes: {
    n: number
    k: number
    relaxRate: number
    relaxTime: number
    propagating: boolean
  }[]
  dynamicExponent: number
  gapless: boolean
  diffusive: boolean
  relativistic: boolean
  solved: boolean
} {
  const L = input?.L ?? 2400
  const arrow = input?.arrow ?? 0.1
  // larger k (shorter wavelengths) so the modes relax within the time window, the small-k modes relax
  // over thousands of beats (nearly conserved) and are not measurable here
  const ns = [40, 60, 90, 140, 220, 340]
  const ks = ns.map(n => (2 * Math.PI * n) / L)
  const cosTab = ks.map(k => new Float64Array(L))
  const sinTab = ks.map(k => new Float64Array(L))
  for (let m = 0; m < ks.length; m++) {
    for (let x = 0; x < L; x++) {
      cosTab[m]![x] = Math.cos(ks[m]! * x)
      sinTab[m]![x] = Math.sin(ks[m]! * x)
    }
  }

  const tone = new Int8Array(L)
  const moved = new Uint8Array(L)
  const rng = makeRng({ seed: 19 })
  for (let i = 0; i < L; i++) {
    tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0) as
      | -1
      | 0
      | 1
  }
  for (let t = 0; t < 400; t++) {
    beat(tone, L, moved, rng, arrow)
  }

  // record the real and imaginary Fourier amplitudes of the charge for each mode over a trajectory
  const T = 9000
  const qRe: Float64Array[] = ks.map(() => new Float64Array(T))
  const qIm: Float64Array[] = ks.map(() => new Float64Array(T))
  for (let t = 0; t < T; t++) {
    for (let m = 0; m < ks.length; m++) {
      let re = 0
      let im = 0
      const ct = cosTab[m]!
      const st = sinTab[m]!
      for (let x = 0; x < L; x++) {
        const s = tone[x]!
        if (s !== 0) {
          re += s * ct[x]!
          im -= s * st[x]!
        }
      }
      qRe[m]![t] = re
      qIm[m]![t] = im
    }
    beat(tone, L, moved, rng, arrow)
  }

  const maxTau = 300
  const modes: {
    n: number
    k: number
    relaxRate: number
    relaxTime: number
    propagating: boolean
  }[] = []
  for (let m = 0; m < ks.length; m++) {
    const re = qRe[m]!
    const im = qIm[m]!
    const c: number[] = []
    for (let tau = 0; tau <= maxTau; tau++) {
      let s = 0
      let cnt = 0
      for (let t = 0; t + tau < T; t++) {
        s += re[t]! * re[t + tau]! + im[t]! * im[t + tau]!
        cnt++
      }
      c.push(s / cnt)
    }
    const c0 = c[0]!
    const norm = c.map(v => v / c0)
    // relaxation time, where the normalized correlation first drops below 1/e
    let relaxTime = maxTau
    for (let tau = 1; tau <= maxTau; tau++) {
      if (norm[tau]! < Math.exp(-1)) {
        // linear interpolation between tau-1 and tau
        const a0 = norm[tau - 1]!
        const a1 = norm[tau]!
        relaxTime = tau - 1 + (a0 - Math.exp(-1)) / (a0 - a1)
        break
      }
    }
    // propagating if the correlation goes clearly negative (oscillation) before decaying
    let propagating = false
    for (let tau = 1; tau <= maxTau; tau++) {
      if (norm[tau]! < -0.15) {
        propagating = true
      }
    }
    modes.push({
      n: ns[m]!,
      k: ks[m]!,
      relaxRate: 1 / relaxTime,
      relaxTime,
      propagating,
    })
  }

  // dynamic exponent z from Gamma(k) ~ k^z (log-log fit), only over modes that actually RELAXED within
  // the window (relax time well below the ceiling), capped modes would bias the slope
  const relaxed = modes.filter(
    md =>
      md.relaxRate > 0 &&
      isFinite(md.relaxRate) &&
      md.relaxTime <= maxTau * 0.8,
  )
  const dynamicExponent =
    relaxed.length > 1
      ? logLogSlope(
          relaxed.map(md => md.k),
          relaxed.map(md => md.relaxRate),
        )
      : 0

  // the k=0 mode is exactly conserved, so the mode is gapless by construction. Check Gamma falls toward 0
  const gapless =
    modes[0]!.relaxRate < modes[modes.length - 1]!.relaxRate // smallest k relaxes slowest
  const diffusive =
    dynamicExponent > 1.6 &&
    dynamicExponent < 2.4 &&
    !modes.some(md => md.propagating)
  const relativistic = dynamicExponent > 0.7 && dynamicExponent < 1.3
  const solved = gapless && (diffusive || relativistic)

  return {
    L,
    modes,
    dynamicExponent,
    gapless,
    diffusive,
    relativistic,
    solved,
  }
}

export default experiment({
  id: 'gauge/dynamic-dispersion',
  title:
    'the conserved charge has a gapless hydrodynamic mode but it is diffusive not relativistic',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = dynamicDispersion({ L: 2400 })
    const ok = r.solved && r.gapless && r.diffusive
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the conserved charge has a gapless hydrodynamic mode with dynamic exponent z near two, so it is diffusive and a relativistic z one mode would need momentum conservation or inertia',
      metrics: {
        dynamicExponent: r.dynamicExponent,
        gapless: r.gapless ? 1 : 0,
        diffusive: r.diffusive ? 1 : 0,
      },
    })
  },
})
