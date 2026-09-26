// Does composite light thermalize to Planck (E-FRC-0187)? Asked by the coordinator after E-SPN-0058 found the
// link field at equilibrium is a classical Rayleigh-Jeans field (T / 2 per mode, Planck missed by up to a
// factor of 9): the links are Clifford and carry no quantum of action, so a photon may have to be built from
// the quantum slots. E-FRC-0186 builds it as a bilinear of two fear walks and finds no isolated mode; this
// file asks the second question anyway: do the pair modes' occupations relax toward Bose-Einstein
// n(omega) = 1 / (e^(omega / T) - 1), with Rayleigh-Jeans T / omega as the control?
//
// What the symbol says first: two FREE walks carry the pair amplitude R_p by U(p + K) R_p U(p)^dagger, which
// multiplies each pair eigenmode by a phase. So the occupation of every pair mode is conserved exactly: the
// pair sector is integrable mode by mode, and nothing relaxes to Planck, to Rayleigh-Jeans or to anything
// else. Thermalization needs an interaction between walks (the fear beat against the cold vacuum), which the
// free walk leaves out (code/rule/fear-walk: a lone vibe on a ring with no vacuum). And a walk's frequency is
// a quasi-energy, an angle in (-pi, pi], so a Gibbs state of the constituents is not even defined without an
// energy bounded below. The prediction is FAIL, by conservation.
//
// Setup, fixed before the run: the husk walk of E-FRC-0186 (palindrome x y z z y x), side 16, K = (2 pi / 16)
// (1, 0, 0), a non-thermal start R_p = a_p sigma_2 + b_p sigma_3 with a_p = frac((p + 1) golden) and b_p =
// frac((p + 1) silver) - 1/2 (deterministic Weyl weights, code/tool/weyl), 1,000 beats carried by repeated
// multiplication. The positive-frequency same-branch pair modes are binned into 16 bins of omega; each model's
// temperature is fitted by a scan of T over 200 log-spaced values from 1e-3 to 10.
//
// Gates, fixed before the run:
// G0 conservation: every pair mode's occupation after 1,000 beats equals its start to 1e-10 of the total
// G1 the hypothesis: after 1,000 beats Bose-Einstein fits the binned occupation with a relative rms residual
//    under 10 percent AND better than it did at beat 0 (the modes moved toward Planck)
// Status: pass if G1 passes, fail otherwise. Reported: both models' residuals at beat 0 and 1,000, and the
// share of the pair weight at negative frequency, which a Bose-Einstein law cannot hold.
//
// Depth L2: exact conservation law of a free two-walk sector, from the symbol.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { pairOccupation } from '@/code/measure/composite-light'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'

const SIDE = 16
const BEATS = 1000
const BINS = 16

type Fit = { residual: number; temperature: number }

function fit(centers: number[], values: number[], model: (w: number, t: number) => number): Fit {
  let best: Fit = { residual: Infinity, temperature: Number.NaN }

  for (let i = 0; i < 200; i++) {
    const t = 1e-3 * 10 ** ((4 * i) / 199)
    // the best overall scale for this T, then the relative rms residual
    const m = centers.map(w => model(w, t))
    const scale = values.reduce((s, v, j) => s + v * m[j]!, 0) / m.reduce((s, x) => s + x * x, 0)
    const residual = Math.sqrt(values.reduce((s, v, j) => s + (v / (scale * m[j]!) - 1) ** 2, 0) / values.length)

    if (residual < best.residual) {
      best = { residual, temperature: t }
    }
  }

  return best
}

export default experiment({
  id: 'gauge/composite-light-thermal',
  code: 'E-FRC-0187',
  title:
    'does composite light thermalize to Planck: the pair modes of two free fear walks keep their occupations exactly, so a bilinear photon relaxes neither to Bose-Einstein nor to Rayleigh-Jeans, and a walk has no Gibbs state to relax to',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const start = (p: number): [[number, number], [number, number], [number, number], [number, number]] => {
      const a = weyl(p + 1, GOLDEN)
      const b = weyl(p + 1, SILVER) - 0.5

      // a sigma_2 + b sigma_3 = [[b, -i a], [i a, -b]]
      return [[b, 0], [0, -a], [0, a], [-b, 0]]
    }
    const before = pairOccupation(SIDE, [1, 0, 0], start, 0)
    const after = pairOccupation(SIDE, [1, 0, 0], start, BEATS)
    const total = before.occupation.reduce((s, x) => s + x, 0)

    let change = 0
    let negative = 0

    for (let i = 0; i < before.occupation.length; i++) {
      change = Math.max(change, Math.abs((after.occupation[i] ?? 0) - (before.occupation[i] ?? 0)))
      negative += (before.omega[i] ?? 0) < 0 ? (before.occupation[i] ?? 0) : 0
    }

    metrics['g0LargestChangeOverTotal'] = change / total
    metrics['negativeFrequencyShare'] = negative / total

    const binned = (o: { omega: Float64Array; occupation: Float64Array }): { centers: number[]; values: number[] } => {
      let top = 0

      for (let i = 0; i < o.omega.length; i++) {
        // same-branch pairs sit at i mod 4 in {0, 3}
        if ((i % 4 === 0 || i % 4 === 3) && (o.omega[i] ?? 0) > 0) {
          top = Math.max(top, o.omega[i] ?? 0)
        }
      }

      const sums = new Float64Array(BINS)
      const counts = new Float64Array(BINS)

      for (let i = 0; i < o.omega.length; i++) {
        const w = o.omega[i] ?? 0

        if ((i % 4 === 0 || i % 4 === 3) && w > 0) {
          const b = Math.min(BINS - 1, Math.floor((w / top) * BINS))

          sums[b] = (sums[b] ?? 0) + (o.occupation[i] ?? 0)
          counts[b] = (counts[b] ?? 0) + 1
        }
      }

      const centers: number[] = []
      const values: number[] = []

      for (let b = 0; b < BINS; b++) {
        if ((counts[b] ?? 0) > 0 && (sums[b] ?? 0) > 0) {
          centers.push(((b + 0.5) * top) / BINS)
          values.push((sums[b] ?? 0) / (counts[b] ?? 1))
        }
      }

      return { centers, values }
    }

    const planck = (w: number, t: number): number => 1 / Math.expm1(w / t)
    const rayleigh = (w: number, t: number): number => t / w
    const results: Record<string, Fit> = {}

    for (const [tag, o] of [
      ['Beat0', before],
      ['Beat1000', after],
    ] as const) {
      const { centers, values } = binned(o)

      results[`planck${tag}`] = fit(centers, values, planck)
      results[`rayleigh${tag}`] = fit(centers, values, rayleigh)
      metrics[`planck${tag}Residual`] = results[`planck${tag}`]!.residual
      metrics[`planck${tag}Temperature`] = results[`planck${tag}`]!.temperature
      metrics[`rayleigh${tag}Residual`] = results[`rayleigh${tag}`]!.residual
      metrics[`bins${tag}`] = centers.length
    }

    const okG0 = change / total < 1e-10
    const okG1 = results['planckBeat1000']!.residual < 0.1 && results['planckBeat1000']!.residual < results['planckBeat0']!.residual

    metrics['gateG0'] = okG0 ? 1 : 0
    metrics['gateG1'] = okG1 ? 1 : 0

    return verdict({
      status: okG1 ? 'pass' : 'fail',
      claim: 'the pair modes of two fear walks relax toward a Bose-Einstein occupation within 1,000 beats, fitting it within 10 percent and better than at the start',
      metrics,
      notes:
        "L2, exact, deterministic (Weyl start weights, no seeds). Added at the coordinator's request after E-SPN-0058, gates fixed before the run. First run (tmp/frc0187.log, 0.6 s), FAIL as predicted. G0 passes: after 1,000 beats carried by repeated multiplication every pair mode's occupation equals its start to 4.5e-16 of the total, so the free pair sector is integrable mode by mode and cannot thermalize. G1 fails: the binned occupation of the positive-frequency same-branch modes fits Bose-Einstein with a relative rms residual of 36.9 and Rayleigh-Jeans 36.0, identical at beat 0 and beat 1,000 to 1e-12, and Planck's best temperature sits at the top of the scan (T = 10, where it becomes Rayleigh-Jeans): nothing moved toward either law. Half of the pair weight (0.5000) sits at negative pair frequency, which no Bose-Einstein occupation can hold, because a walk's frequency is a quasi-energy on a circle and has no ground. What a quantum-of-action photon from the slots needs, then, is not a better bilinear: it needs (1) an interaction that binds the pair into an isolated branch (E-FRC-0186 found none for free walks) and (2) a coupling to a bath with an energy bounded below (the cold vacuum's fear beat), neither of which free walks have.",
    })
  },
})
