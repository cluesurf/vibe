// Clean emission into the massless quantum light (E-FRC-0237): the STAND-IN atom of E-FRC-0236 on a closed
// strip of 512 husk squares, run by the low-excitation restriction that E-FRC-0236 held to the exact rule
// (code/measure/few-quanta: the harmonic reading, at most two quanta, the coupling's matrix elements exact, no
// rotating-wave cut). E-FRC-0233's ladder could not show an exponential: its atom sat 0.29 above the lower edge
// of a narrow waveguide band and the decay came in steps of period 2 pi / (gap - omega_min).
//
// DERIVED before the first run.
//   (1) the rate        The golden rule into the closed strip (two directions, density L / (2 pi v_g)):
//                       Gamma = 4 g^2 d^2 hbar f sin^2(k*/2) / (sin(omega*) v_g), v_g = kappa sin k* / sin omega*,
//                       omega(k*) = the atom's gap, hbar = N / 2 pi, g = 4 pi c / M (code/measure/few-quanta)
//   (2) why it is clean  The massless band runs from 0 to arccos(1 - 2 kappa); the gap is placed at k* = pi / 3,
//                       about halfway, and the band's lower end is not a singularity (omega ~ sqrt(kappa) k, the
//                       coupling |u|^2 ~ k: an ohmic end). With Gamma / (distance to either end) near 0.07 at
//                       N = 25 and 0.04 at N = 49 (Gamma ~ 8 sqrt 2 pi d^2 sin^2(k*/2) / (sin k*) N^-3/2 at
//                       f / s = 1), the structured-continuum corrections are small and P_e is Z e^(-Gamma t)
//   (3) no return        The emitted quantum comes back only after L / v_g beats, beyond the fitted window
//   (4) the control      The same atom beside the open ladder's light (rails present, same split): its gap
//                       arccos(1 - kappa / 2) lies below the ladder's cutoff arccos(1 - kappa), so it has no
//                       channel and must keep its quantum. What the closed strip buys is a channel at low frequency
//
// Gates, fixed before the first run (no probe of this dynamics before this file; E-FRC-0236 had not been run
// when these were written):
// X1 the exponential: at N = 25 and 49 on L = 512, ln P_e over beats t in [1 / Gamma, 4 / Gamma] (Gamma the
//    golden rule (1)) is linear with largest residual below 0.02, and the fitted rate is within 0.9 to 1.1 of
//    the golden rule
// X2 no return: L / v_g exceeds 4 / Gamma at both N
// X3 the control: beside the open ladder (512 squares, the same split and atom), P_e stays at or above 0.95 over
//    the same beats at both N
// Reported: N = 11 (the column E-FRC-0236 validated at) against the golden rule, the fitted intercept (Z), the
//    sector norm, the two-quanta weight, and the ratio Gamma / (distance to the band ends).
// Status: pass if X1 to X3 pass; partial if X2 and X3 pass and X1's rate clause passes; fail otherwise.
//
// Depth L2: Wigner-Weisskopf decay with a STAND-IN atom into the model's massless light, restricted to two quanta.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loopSplit, ringCurl, ringOmega, type LoopSpec } from '@/code/rule/loop-ring'
import { classicalOmega } from '@/code/rule/plaquette-ladder'
import { atomBare } from '@/code/measure/quantum-ladder'
import { fewQuanta, fewQuantaBeat, fewQuantaRead, fewQuantaRun, fewQuantaStart, ringAtomSpec, stripGoldenRule, stripModes } from '@/code/measure/few-quanta'

const L = 512
const GATED = [25, 49]
const REPORTED = [11]
const RESIDUAL = 0.02
const RATE_BAND = [0.9, 1.1] as const

const ladderShape = (spec: LoopSpec) => ({ n: spec.n, plaquettes: spec.squares, root: spec.root, drift: spec.drift, force: spec.force, hop: spec.hop! })

type Decay = { population: Float64Array; normWorst: number; twoMax: number }

function decay(n: number, light: 'ring' | 'ladder', beats: number): Decay {
  const spec = ringAtomSpec(n, L)
  const { f, kappa } = loopSplit(spec)
  const bare = atomBare(ladderShape(spec))
  const g = (4 * Math.PI * spec.drift) / spec.root
  const js = light === 'ring' ? Array.from({ length: L - 1 }, (_, j) => j + 1) : Array.from({ length: L }, (_, j) => j)
  const omegaOf = light === 'ring' ? (k: number) => ringOmega(kappa, k) : (k: number) => classicalOmega(kappa, k, L)
  const modes = stripModes({ n, squares: L, f, js, omegaOf })
  const q = fewQuanta({ omega: modes.omega, u: modes.u, g, hop: spec.hop!, drift: spec.drift, root: spec.root })
  const run = fewQuantaRun(q)
  const population = new Float64Array(beats + 1)
  let normWorst = 0
  let twoMax = 0

  fewQuantaStart(q, run, bare.excited)

  for (let t = 0; t <= beats; t++) {
    const read = fewQuantaRead(q, run, bare.excited)

    population[t] = read.population
    normWorst = Math.max(normWorst, Math.abs(read.norm - 1))
    twoMax = Math.max(twoMax, read.two)

    if (t < beats) fewQuantaBeat(q, run)
  }

  return { population, normWorst, twoMax }
}

function fit(p: Float64Array, from: number, to: number): { rate: number; intercept: number; residual: number } {
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let count = 0

  for (let t = from; t <= to; t++) {
    const y = Math.log(p[t]!)

    sx += t
    sy += y
    sxx += t * t
    sxy += t * y
    count++
  }

  const slope = (count * sxy - sx * sy) / (count * sxx - sx * sx)
  const intercept = (sy - slope * sx) / count
  let residual = 0

  for (let t = from; t <= to; t++) residual = Math.max(residual, Math.abs(Math.log(p[t]!) - (intercept + slope * t)))

  return { rate: -slope, intercept, residual }
}

export default experiment({
  id: 'gauge/ring-golden-rule',
  code: 'E-FRC-0237',
  title:
    "clean emission into the massless quantum light: a STAND-IN atom beside a closed strip of 512 husk squares, run by the two-quantum restriction of the atom-light rule, decays exponentially at the golden-rule rate, where the open ladder's cutoff leaves the same atom no channel at all",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let x1 = true
    let x1rate = true
    let x2 = true
    let x3 = true

    for (const n of [...GATED, ...REPORTED]) {
      const tag = `N${n}`
      const spec = ringAtomSpec(n, L)
      const { f, kappa } = loopSplit(spec)
      const bare = atomBare(ladderShape(spec))
      const g = (4 * Math.PI * spec.drift) / spec.root
      const gr = stripGoldenRule({ n, f, kappa, g, dipole: bare.dipole, gap: bare.gap, curl: ringCurl, curlSlope: k => 2 * Math.sin(k) })
      const from = Math.ceil(1 / gr.rate)
      const to = Math.floor(4 / gr.rate)
      const beats = Math.ceil(5 / gr.rate)
      const ring = decay(n, 'ring', beats)
      const result = fit(ring.population, from, to)
      const top = ringOmega(kappa, Math.PI)
      const returnBeat = L / gr.velocity

      metrics[`gap${tag}`] = bare.gap
      metrics[`dipole${tag}`] = bare.dipole
      metrics[`coupling${tag}`] = g
      metrics[`goldenRule${tag}`] = gr.rate
      metrics[`kStar${tag}`] = gr.k
      metrics[`velocity${tag}`] = gr.velocity
      metrics[`bandTop${tag}`] = top
      metrics[`rateOverDistance${tag}`] = gr.rate / Math.min(bare.gap, top - bare.gap)
      metrics[`fitFrom${tag}`] = from
      metrics[`fitTo${tag}`] = to
      metrics[`fitRate${tag}`] = result.rate
      metrics[`fitRateOverGolden${tag}`] = result.rate / gr.rate
      metrics[`fitResidual${tag}`] = result.residual
      metrics[`fitIntercept${tag}`] = Math.exp(result.intercept)
      metrics[`returnBeat${tag}`] = returnBeat
      metrics[`sectorNormDrift${tag}`] = ring.normWorst
      metrics[`twoQuantaWeightMax${tag}`] = ring.twoMax
      metrics[`populationAtFrom${tag}`] = ring.population[from]!
      metrics[`populationAtTo${tag}`] = ring.population[to]!

      if (GATED.includes(n)) {
        const rateOk = result.rate / gr.rate >= RATE_BAND[0] && result.rate / gr.rate <= RATE_BAND[1]

        x1 &&= rateOk && result.residual < RESIDUAL
        x1rate &&= rateOk
        x2 &&= returnBeat > to

        const ladder = decay(n, 'ladder', to)
        let low = 1

        for (let t = 0; t <= to; t++) low = Math.min(low, ladder.population[t]!)

        metrics[`ladderLowest${tag}`] = low
        metrics[`ladderCutoff${tag}`] = classicalOmega(kappa, 0, L)
        x3 &&= low >= 0.95
      }
    }

    const gates = { X1: x1, X2: x2, X3: x3 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = x1 && x2 && x3 ? 'pass' : x2 && x3 && x1rate ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a pure excited STAND-IN atom beside a closed strip of ${L} husk squares decays at ${metrics.fitRateOverGoldenN25!.toFixed(4)} and ${metrics.fitRateOverGoldenN49!.toFixed(4)} of the golden rule (${metrics.goldenRuleN25!.toFixed(5)} and ${metrics.goldenRuleN49!.toFixed(5)} per beat at N = 25, 49), ln P_e linear over one to four lifetimes within ${metrics.fitResidualN25!.toFixed(4)} and ${metrics.fitResidualN49!.toFixed(4)} (intercept ${metrics.fitInterceptN25!.toFixed(4)}, ${metrics.fitInterceptN49!.toFixed(4)}), the emitted quantum returning only after ${metrics.returnBeatN25!.toFixed(0)} and ${metrics.returnBeatN49!.toFixed(0)} beats; beside the open ladder, whose cutoff lies above the same gap, it keeps P_e at ${metrics.ladderLowestN25!.toFixed(4)} and ${metrics.ladderLowestN49!.toFixed(4)} or above; at N = 11 (the column the restriction was checked against the exact rule at) the rate is ${metrics.fitRateOverGoldenN11!.toFixed(4)} of the golden rule with residual ${metrics.fitResidualN11!.toFixed(4)}`,
      metrics,
      control: { ladderLowestN25: metrics.ladderLowestN25!, ladderLowestN49: metrics.ladderLowestN49! },
      notes: 'FIRST RUN pending.',
    })
  },
})
