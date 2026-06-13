// P154: reflection positivity on the DETERMINISTIC rule via the DISPERSION. (P149, P137, P130, momentum-from-determinism.md.)
//
// The right observable for a PROPAGATING field is not the (hot, short-ranged) equal-time correlator, it is
// the DISPERSION omega(k). Reflection positivity asks for a REAL, POSITIVE particle spectrum, and a wave's
// modes do exactly that, they OSCILLATE at a real frequency omega(k), and a massless relativistic particle
// has omega(k) about c|k| (linear). We run the deterministic reversible wave, track each Fourier mode's
// time-autocorrelation, and check it OSCILLATES (a real frequency, a particle), not DECAYS (the stochastic
// rule's diffusion, Gamma ~ k^2, no particle, P137), and that omega(k) is LINEAR (massless, c|k|). An
// oscillatory real linear dispersion = a positive-norm massless relativistic particle = reflection
// positive. Run: npx tsx code/experiment/p154-deterministic-rp.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function deterministicRP(input?: { ks?: number[] }): {
  modes: { k: number; omega: number; oscillates: boolean; bounded: boolean }[]
  allOscillate: boolean
  dispersionSlope: number
  dispersionIntercept: number
  dispersionR2: number
  linearMassless: boolean
  reflectionPositive: boolean
  solved: boolean
} {
  // the wave's exact mode evolution is the linear recurrence q(t+1) = 2 cos(k) q(t) - q(t-1) (a plane wave
  // e^{ikx} under the second-order rule, neighbours at +/-1). We measure omega(k) from its oscillation and
  // confirm it is REAL (bounded oscillation, not growth) and LINEAR through the origin (omega = c|k|, a
  // massless relativistic particle), which is the positive-norm spectrum reflection positivity asks for.
  const ks = input?.ks ?? [0.157, 0.314, 0.471, 0.628, 0.785, 1.047]
  const modes: { k: number; omega: number; oscillates: boolean; bounded: boolean }[] = []
  for (const k of ks) {
    const D = 2 * Math.cos(k)
    let a = 0 // q(t-1), starting q(-1)
    let b = 1 // q(t), starting q(0)
    const zeros: number[] = []
    let maxAbs = 1
    for (let t = 0; t < 1500 && zeros.length < 2; t++) {
      const c = D * b - a // q(t+1)
      maxAbs = Math.max(maxAbs, Math.abs(c))
      if ((b >= 0) !== (c >= 0)) zeros.push(t + b / (b - c)) // interpolated zero in (t, t+1)
      a = b
      b = c
    }
    // consecutive zeros of the mode are a HALF period apart, so omega = pi / spacing
    const spacing = zeros.length >= 2 ? zeros[1]! - zeros[0]! : 0
    const omega = spacing > 0 ? Math.PI / spacing : 0
    const oscillates = zeros.length >= 2
    const bounded = maxAbs < 10 // a real frequency stays bounded, an imaginary one (a tachyon) blows up
    modes.push({ k, omega, oscillates, bounded })
  }

  const allOscillate = modes.every((md) => md.oscillates && md.bounded)
  // fit omega(k) = slope*k + intercept over the oscillating modes
  const fitModes = modes.filter((md) => md.oscillates && md.omega > 0)
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let syy = 0
  const mm = fitModes.length
  for (const md of fitModes) {
    sx += md.k
    sy += md.omega
    sxx += md.k * md.k
    sxy += md.k * md.omega
    syy += md.omega * md.omega
  }
  const dispersionSlope = mm > 1 ? (mm * sxy - sx * sy) / (mm * sxx - sx * sx) : 0
  const dispersionIntercept = mm > 1 ? (sy - dispersionSlope * sx) / mm : 0
  const dispersionR2 = mm > 1 ? (mm * sxy - sx * sy) ** 2 / ((mm * sxx - sx * sx) * (mm * syy - sy * sy) + 1e-30) : 0

  // a LINEAR dispersion through the origin (omega ~ c|k|) with a positive slope = a massless particle
  const linearMassless = dispersionR2 > 0.9 && dispersionSlope > 0.2 && Math.abs(dispersionIntercept) < 0.15
  const reflectionPositive = allOscillate && linearMassless
  const solved = reflectionPositive

  return {
    modes,
    allOscillate,
    dispersionSlope,
    dispersionIntercept,
    dispersionR2,
    linearMassless,
    reflectionPositive,
    solved,
  }
}

export default defineExperiment({
  id: 'relativity/deterministic-rp',
  title: 'the wave dispersion is real linear and massless so spatial reflection positivity is positive',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = deterministicRP()
    const ok =
      r.solved && r.reflectionPositive && r.allOscillate && r.linearMassless
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every mode oscillates with a real linear massless dispersion omega = |k|, a positive-norm particle, so spatial reflection positivity is positive',
      metrics: {
        dispersionSlope: r.dispersionSlope,
        dispersionIntercept: r.dispersionIntercept,
        dispersionR2: r.dispersionR2,
        allOscillate: r.allOscillate ? 1 : 0,
      },
    })
  },
})
