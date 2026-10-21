// DOES THE LIGHT PAIR'S EXTRA QUARTIC FADE FOR LIGHTER, LARGER PAIRS? (E-MTR-0032, OPEN-MOT-01). E-MTR-0031 read the
// light register pair (m 0.284, a_B 12, the contact well removed) at total momentum K 0.2, 0.35, 0.5, 1.0 and found its
// quartic at rho = 2.21 +- 0.05 of relativity's, against its members' 1.77 and relativity's 1, through an instrument that
// missed its witness and stability gates. Here the instrument is fixed first, then rho is read at two more points with
// the same K set, to see whether the excess over the members fades the way the K^2 remainder did in E-MTR-0028.
//
// THE OBSERVABLE: as in E-MTR-0031, E(K) = E_gal(K) - rho (E_gal(K) - E_rel(K)) with E_gal = E0 + a K^2 and E_rel =
// sqrt(E0^2 + 2 a E0 K^2), E0 the solver's K = 0 ground and (a, rho) fitted over the four K
// (code/measure/pair-boost quarticFractionFit). The excess is Delta = rho - rho_member, rho_member the lone member's own
// fraction (code/measure/pair-boost memberQuarticFraction, each member at K / 2) averaged over the four K. The member
// is the control: its rho is read from its exact band, never from the pair.
//
// THE POINTS: P1 = E-MTR-0031's recorded read, m 0.283682 (ringUnit(-7, 2)) at a_B 12, m a_B 3.40, rho 2.2145 +- 0.0517
// (not rerun); P2 = m 0.283682 at a_B 8, m a_B 2.27 (the same member, a tighter pair); P3 = m 0.380251 (ringUnit(-2, 5),
// the ring member nearest 0.38) at a_B 10, m a_B 3.80. P2 against P1 varies a_B at fixed m. P3 separates two readings of
// E-MTR-0028's kind: a term in m a_B alone puts P3 BELOW P1 (larger m a_B), a lattice term (tan m / m - 1) / a_B puts it
// ABOVE (0.00507 against P1's 0.00231).
//
// THE INSTRUMENT, FIXED FIRST (tmp/mtr-fade-probe.ts, -witness.log, -stable.log, tmp/mtr-fade-wide.ts, -wide2.log, run on
// saved correlations only, before any new correlation was computed):
//  - Why E-MTR-0031's witness failed: at filter length S 2048 a spurious line 2.5e-4 above the ground (weight 0.056) pulls
//    it 2e-5 low, and window shifts of 0.003 move it by up to 2e-5. At S 3072 and 4096 the spurious line is gone and the
//    a_B 12 ground sits within 1.3e-6 and 1.2e-6 of the recorded read over the settings. On the a_B 8 m 0.284 K = 0 read
//    (E-SPN-0211's, tmp/spn-mass-m0284.json) S 2048 is 1.9e-5 off and S 4096 within 8e-9: there a real line 1.9e-4 above
//    the ground (weight 0.073) is what S 2048 could not separate, which is why that read was not clean.
//  - Why stability failed: at S 2048 window shifts of 0.003 bring in or drop lines 4e-4 to 7e-4 from the ground. So the
//    fix is the filter length: S 4096, which needs a correlation of 2 S = 8192 cycles a K (E-MTR-0031 had 4096).
//  - The window: E-MTR-0031's [E0 + 0.85 rise - 0.004, E0 + 1.02 rise + 0.004] (rise = the lone member's threshold rise,
//    code/measure/pair-boost thresholdRise) assumed the pair's inertia within 10% of its members'. A tighter pair (E-SPN-0211
//    read R 1.55 at P2) would rise only 0.66 as fast and leave that window. And widened on E-MTR-0031's K 1.0 read, the
//    heaviest line is 1.3111 (weight 0.53), above that window's top, while the lowest heavy line, 1.2817 (weight 0.23), is
//    the smooth continuation of K 0.2 to 0.5 (tmp/mtr-fade-window.log, S 2048). So here the window is wide, [E0 + 0.45
//    rise - 0.004, E0 + 1.05 rise + 0.004], still placed by the lone member only, and the ground is named by being lowest:
//    the lowest line of weight at least 0.1 (code/measure/pair-boost levelOverSettings), which on E-MTR-0031's reads names
//    the same lines its narrow window did. The heaviest line is reported beside it, not gated.
//  - The basis: J 60 over 0.02 made the Hermitian solve fail (QL did not converge) on wide windows at S 4096; 20 and 27
//    states per 0.02 read the a_B 12 ground on windows 0.02 to 0.12 wide within 4e-6 of each other. Settings: density 20,
//    density 27, and density 20 with the window moved by -0.003 and +0.003, all at S 4096.
//
// GATES, fixed before the run (the instrument gates are E-MTR-0031's values, unchanged):
//   W  WITNESS at P2 and P3: the solver's K = 0 ground, window [E_ref - 0.01, E_ref + 0.01], within 1e-5 of the Fourier read
//      E_ref of the same correlation (P2: E-SPN-0211's recorded 1.0842040881932993; P3: readZero's tracked line, run
//      here), and its spread over the settings at most 2e-5
//   I  INSTRUMENT at every K of P2 and P3: the ground has |z| within 1e-6 of 1, weight at least 0.3, and moves at most
//      2e-5 over the settings
//   F  THE FIT holds one rho at each point: rms at most 3 sigma_E (sigma_E the largest half-spread, floor 1e-6)
//   R  RESOLVED: sigma_rho at most 0.04 at P2 and P3
//   THE TREND, on Delta at P1, P2, P3 with errors sigma_rho:
//   FADING  (a) Delta(P2) - Delta(P1) > 2 sqrt(sigma_P2^2 + sigma_P1^2): it shrinks with a_B at fixed m, OR
//           (b) the weighted fit Delta = C + B / (m a_B) has B > 2 sigma_B: it shrinks with m a_B
//   FLAT    neither (a) nor (b), and the weighted constant fit has chi^2 at most 5.99 (2 degrees of freedom, 95%)
//   OTHER   neither (a) nor (b), and not flat (the excess grows, or the points disagree)
//   Verdict: fail if W or I fails at P2 or P3; otherwise partial if F or R fails; otherwise pass if FADING, fail if FLAT,
//   partial if OTHER.
// PREDICTED, for m 0.190126 (ringUnit(-1, 4)) at a_B 18 (m a_B 3.42): rho = rho_member(0.190) + Delta*, Delta* from the
// two one-parameter-pair forms fitted on the three points, Delta = C + B / (m a_B) and Delta = C + B (tan m / m - 1) / a_B,
// the primary being the form with the lower chi^2 (one degree of freedom each), the other reported. Both are linear
// fits, so the error is the fit's own (the intercept of the fit with its abscissa moved to the predicted point).
// No number for P2 or P3 is predicted: the question is the sign of the trend.
//
// THE RUN AND ITS COST, estimated before the run (tmp/mtr-fade-probe-time.log, -time2.log): C4v sectors of 26,170 (a_B 8)
// and 50,488 (a_B 10) states, 0.68 s and 1.28 s a cycle at 2 threads, so 8,192 cycles a K take 1.55 h at P2 and 2.9 h at
// P3. Three processes of 2 threads (6 in all): P2's four K plus P3's K = 0 read (O_h, 8,950 states, about 0.6 h) in one,
// about 6.8 h; P3's K 1.0 and 0.5 in a second and K 0.35 and 0.2 in a third, about 5.8 h each. Each run stops at 8 hours
// with whatever K have landed.
// RELAUNCH (disclosed, no gate or setting changed): the machine was shared, each process got about one core, and P3's
// K = 0 read took 83 minutes against the 36 estimated (2.3 times slower). At that rate the plan above lands only one or
// two K a point within 8 hours, so the K runs were stopped after 1.4 h (nothing saved from them) and relaunched as six
// one-thread processes (6 threads in all): P2's K {1.0, 0.35} and {0.5, 0.2}, and P3's four K one each.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the lone member's band is the
// control). DETERMINISM: no random numbers; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { softenContact } from '@/code/measure/contact-core'
import {
  boostCorrelation,
  levelOverSettings,
  memberQuarticFraction,
  quarticFractionFit,
  thresholdRise,
  type FilterSetting,
} from '@/code/measure/pair-boost'
import { weightedLinearFit } from '@/code/measure/regression'
import { readZero, setupFor, TRACK_PLAN, type Setup } from '@/code/measure/register-track'

export const MOMENTA: readonly number[] = [1.0, 0.5, 0.35, 0.2]
export const CYCLES = 8192
const S = 4096

export type FadePoint = { name: string; unit: readonly [number, number]; aB: number }

export const POINTS: readonly FadePoint[] = [
  { name: 'm0284a8', unit: [-7, 2], aB: 8 },
  { name: 'm0380a10', unit: [-2, 5], aB: 10 },
]
// E-MTR-0031's recorded read (tmp/mtr-light-verdict.log)
const P1 = { name: 'm0284a12', unit: [-7, 2] as const, aB: 12, rho: 2.2144820481509897, sigmaRho: 0.05168301850959985 }
const TARGET = { unit: [-1, 4] as const, aB: 18 }
const SETTINGS: readonly FilterSetting[] = [
  { S, density: 20, shift: 0 },
  { S, density: 27, shift: 0 },
  { S, density: 20, shift: -0.003 },
  { S, density: 20, shift: 0.003 },
]
const ZERO_HALF = 0.01
const LOW = 0.45
const HIGH = 1.05
const PAD = 0.004
const LEAST = 0.1
const WITNESS = 1e-5
const MODULUS = 1e-6
const WEIGHT = 0.3
const STABLE = 2e-5
const FIT = 3
const SIGMA_FLOOR = 1e-6
const RESOLUTION = 0.04
const TWO = 2
const FLAT = 5.99

type Correlation = { re: ArrayLike<number>; im: ArrayLike<number> }

const flag = (b: boolean): number => (b ? 1 : 0)
const lattice = (m: number, aB: number): number => (Math.tan(m) / m - 1) / aB
const memberMean = (su: Setup): number =>
  MOMENTA.reduce((s, K) => s + memberQuarticFraction(su, K), 0) / MOMENTA.length

export type PointRead = {
  name: string
  m: number
  aB: number
  E0: number
  W: boolean
  I: boolean
  F: boolean
  R: boolean
  rho: number
  sigmaRho: number
  rhoHeavy: number
  rhoMember: number
  delta: number
  text: string
  metrics: Record<string, number>
}

// one point: the witness, the four K reads, the fit, and the heaviest-line alternative
export function readPoint(input: {
  point: FadePoint
  zero: Correlation
  zeroRef: number
  reads: readonly { K: number; re: ArrayLike<number>; im: ArrayLike<number> }[]
}): PointRead {
  const { point } = input
  const su = setupFor(point.unit)
  const metrics: Record<string, number> = {}
  const text: string[] = []
  const g0 = levelOverSettings({
    x: input.zero,
    lo: input.zeroRef - ZERO_HALF,
    hi: input.zeroRef + ZERO_HALF,
    settings: SETTINGS,
    pick: 'lowest',
    least: LEAST,
  })
  const E0 = g0.line?.E ?? NaN
  const W = Math.abs(E0 - input.zeroRef) <= WITNESS && g0.half * 2 <= STABLE

  metrics.E0 = E0
  metrics.E0_off = E0 - input.zeroRef
  metrics.E0_half = g0.half

  let I = true
  let sigmaE = Math.max(SIGMA_FLOOR, g0.half)
  const points: { K: number; E: number }[] = []
  const heavy: { K: number; E: number }[] = []

  for (const r of input.reads) {
    const rise = thresholdRise(su, r.K)
    const lo = E0 + LOW * rise - PAD
    const hi = E0 + HIGH * rise + PAD
    const g = levelOverSettings({ x: r, lo, hi, settings: SETTINGS, pick: 'lowest', least: LEAST })
    const h = levelOverSettings({ x: r, lo, hi, settings: SETTINGS.slice(0, 1), pick: 'heaviest' })
    const l = g.line
    const ok =
      l !== undefined && Math.abs(l.modulus - 1) <= MODULUS && l.weight >= WEIGHT && g.half * 2 <= STABLE

    I = I && ok
    sigmaE = Math.max(sigmaE, g.half)
    points.push({ K: r.K, E: l?.E ?? NaN })
    heavy.push({ K: r.K, E: h.line?.E ?? NaN })
    metrics[`K${r.K}_E`] = l?.E ?? NaN
    metrics[`K${r.K}_weight`] = l?.weight ?? NaN
    metrics[`K${r.K}_modulus`] = l?.modulus ?? NaN
    metrics[`K${r.K}_half`] = g.half
    metrics[`K${r.K}_heavyE`] = h.line?.E ?? NaN
    metrics[`K${r.K}_heavyWeight`] = h.line?.weight ?? NaN
    metrics[`K${r.K}_rhoMember`] = memberQuarticFraction(su, r.K)
    text.push(
      `K ${r.K}: ground ${(l?.E ?? NaN).toFixed(8)} (weight ${(l?.weight ?? NaN).toFixed(3)}, |z| ${(l?.modulus ?? NaN).toFixed(8)}, half-spread ${g.half.toExponential(2)})${ok ? '' : ', not clean'}; heaviest ${(h.line?.E ?? NaN).toFixed(6)} (${(h.line?.weight ?? NaN).toFixed(3)}); lines ${g.lines
        .filter(x => x.weight >= 0.02)
        .map(x => `${x.E.toFixed(6)}/${x.weight.toFixed(3)}`)
        .join(' ')}`,
    )
  }

  const a0 = thresholdRise(su, 0.2) / 0.04
  const fit = quarticFractionFit({ E0, points, a0, sigma: sigmaE })
  const alt = quarticFractionFit({ E0, points: heavy, a0, sigma: sigmaE })
  const F = fit.rms <= FIT * sigmaE
  const R = fit.sigmaRho <= RESOLUTION
  const rhoMember = memberMean(su)

  for (const p of fit.perK) metrics[`K${p.K}_rho`] = p.rho
  metrics.W = flag(W)
  metrics.I = flag(I)
  metrics.F = flag(F)
  metrics.R = flag(R)
  metrics.a = fit.a
  metrics.Rinertia = 0.5 / (2 * fit.a * E0)
  metrics.rho = fit.rho
  metrics.sigmaRho = fit.sigmaRho
  metrics.rms = fit.rms
  metrics.sigmaE = sigmaE
  metrics.rhoHeavy = alt.rho
  metrics.rhoMember = rhoMember
  metrics.delta = fit.rho - rhoMember

  return {
    name: point.name,
    m: su.m,
    aB: point.aB,
    E0,
    W,
    I,
    F,
    R,
    rho: fit.rho,
    sigmaRho: fit.sigmaRho,
    rhoHeavy: alt.rho,
    rhoMember,
    delta: fit.rho - rhoMember,
    text: `${point.name} (m ${su.m.toFixed(4)}, a_B ${point.aB}): K = 0 ground ${E0.toFixed(9)} (ref ${input.zeroRef}), rho ${fit.rho.toFixed(3)} +- ${fit.sigmaRho.toFixed(3)} (member ${rhoMember.toFixed(3)}), a ${fit.a.toFixed(5)}, rms ${fit.rms.toExponential(2)}, W ${W} I ${I} F ${F} R ${R}; heaviest-line rho ${alt.rho.toFixed(3)}. ${text.join('. ')}`,
    metrics,
  }
}

// a two-parameter linear form Delta = C + B f, fitted with its abscissa moved to f*, so the intercept is the prediction
const formAt = (fs: number[], ds: number[], es: number[], at: number) => {
  const fit = weightedLinearFit({ xs: fs, ys: ds, errors: es })
  const moved = weightedLinearFit({ xs: fs.map(f => f - at), ys: ds, errors: es })

  return { ...fit, prediction: moved.intercept, predictionError: moved.interceptError }
}

export function combineFading(reads: readonly PointRead[]): Verdict {
  const su1 = setupFor(P1.unit)
  const suT = setupFor(TARGET.unit)
  const p1 = {
    name: P1.name,
    m: su1.m,
    aB: P1.aB,
    delta: P1.rho - memberMean(su1),
    sigma: P1.sigmaRho,
    rho: P1.rho,
    rhoMember: memberMean(su1),
  }
  const all = [p1, ...reads.map(r => ({ name: r.name, m: r.m, aB: r.aB, delta: r.delta, sigma: r.sigmaRho, rho: r.rho, rhoMember: r.rhoMember }))]
  const metrics: Record<string, number> = {}
  const p2 = all.find(p => p.name === 'm0284a8')
  const ds = all.map(p => p.delta)
  const es = all.map(p => p.sigma)
  const fadeA = p2 !== undefined && p2.delta - p1.delta > TWO * Math.hypot(p2.sigma, p1.sigma)
  const xForm = formAt(all.map(p => 1 / (p.m * p.aB)), ds, es, 1 / (suT.m * TARGET.aB))
  const lForm = formAt(all.map(p => lattice(p.m, p.aB)), ds, es, lattice(suT.m, TARGET.aB))
  const fadeB = xForm.slope > TWO * xForm.slopeError
  const wsum = es.reduce((s, e) => s + 1 / e ** 2, 0)
  const mean = ds.reduce((s, d, i) => s + d / es[i]! ** 2, 0) / wsum
  const chiFlat = ds.reduce((s, d, i) => s + ((d - mean) / es[i]!) ** 2, 0)
  const trend = fadeA || fadeB ? 'fading' : chiFlat <= FLAT ? 'flat' : 'other'
  const primary = xForm.chi2 <= lForm.chi2 ? 'm a_B' : 'lattice'
  const best = primary === 'm a_B' ? xForm : lForm
  const memberT = memberMean(suT)
  const rhoT = memberT + best.prediction
  const instrument = reads.every(r => r.W && r.I)
  const quality = reads.every(r => r.F && r.R)
  const status: Verdict['status'] = !instrument
    ? 'fail'
    : !quality
      ? 'partial'
      : trend === 'fading'
        ? 'pass'
        : trend === 'flat'
          ? 'fail'
          : 'partial'

  for (const r of reads) for (const [k, v] of Object.entries(r.metrics)) metrics[`${r.name}_${k}`] = v
  for (const p of all) {
    metrics[`${p.name}_rho`] = p.rho
    metrics[`${p.name}_delta`] = p.delta
    metrics[`${p.name}_sigma`] = p.sigma
  }
  metrics.fadeA = flag(fadeA)
  metrics.fadeB = flag(fadeB)
  metrics.chiFlat = chiFlat
  metrics.xC = xForm.intercept
  metrics.xB = xForm.slope
  metrics.xBerr = xForm.slopeError
  metrics.xChi2 = xForm.chi2
  metrics.lC = lForm.intercept
  metrics.lB = lForm.slope
  metrics.lChi2 = lForm.chi2
  metrics.memberTarget = memberT
  metrics.rhoTargetX = memberT + xForm.prediction
  metrics.rhoTargetXerr = xForm.predictionError
  metrics.rhoTargetL = memberT + lForm.prediction
  metrics.rhoTargetLerr = lForm.predictionError
  metrics.rhoTarget = rhoT

  return verdict({
    status,
    claim: `the light pair's excess quartic over its members, Delta = rho - rho_member, reads ${all.map(p => `${p.delta.toFixed(3)} +- ${p.sigma.toFixed(3)} at m ${p.m.toFixed(3)} a_B ${p.aB} (rho ${p.rho.toFixed(3)}, member ${p.rhoMember.toFixed(3)})`).join('; ')}: trend ${trend} (fixed-m clause ${fadeA}, m a_B slope ${xForm.slope.toFixed(3)} +- ${xForm.slopeError.toFixed(3)}, flat chi^2 ${chiFlat.toFixed(2)}); predicted rho at m ${suT.m.toFixed(3)} a_B ${TARGET.aB} ${rhoT.toFixed(3)} by the ${primary} form (m a_B form ${(memberT + xForm.prediction).toFixed(3)} +- ${xForm.predictionError.toFixed(3)}, lattice form ${(memberT + lForm.prediction).toFixed(3)} +- ${lForm.predictionError.toFixed(3)}, member ${memberT.toFixed(3)}); instrument ${instrument}`,
    metrics,
    control: Object.fromEntries(all.map(p => [`rhoMember_${p.name}`, p.rhoMember])),
    notes: `L2. ${reads.map(r => r.text).join(' | ')}`,
  })
}

const W_DIR = '/Users/lancepollard/base/crew/cluesurf/deck/vibe.worktree/experiment/moving-matter'

// the saved K = 0 reads: P2's from E-SPN-0211 (tmp/spn-mass-m0284.json), P3's from this run's part runner
export const savedZero = (name: string): { x: Correlation; ref: number } | null => {
  if (name === 'm0284a8') {
    const path = `${W_DIR}/tmp/spn-mass-m0284.json`

    if (!existsSync(path)) return null

    const z = JSON.parse(readFileSync(path, 'utf8')).zero

    return { x: z.x, ref: z.tracked.E }
  }

  const path = `${W_DIR}/tmp/mtr-fade-${name}-zero.json`

  if (!existsSync(path)) return null

  const z = JSON.parse(readFileSync(path, 'utf8'))

  return { x: z.x, ref: z.tracked.E }
}

const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

export default experiment({
  id: 'matter/light-pair-fading',
  code: 'E-MTR-0032',
  title:
    "explores whether the light register pair's extra quartic over its members fades for lighter, larger pairs: the instrument fixed first (filter length 4096, a wide member-placed window, the lowest heavy line as the ground), then the quartic fraction at m 0.284 a_B 8 and m 0.380 a_B 10 with E-MTR-0031's m 0.284 a_B 12, against each member's own band",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combineFading(
      POINTS.map(point => {
        const su = setupFor(point.unit)
        const p = TRACK_PLAN.find(x => x.aB === point.aB)!
        const z = readZero(su, p, NATIVE, () => {}, 1, softenContact)

        return readPoint({
          point,
          zero: z.x,
          zeroRef: z.tracked.E,
          reads: MOMENTA.map(K => boostCorrelation(su, p, K, CYCLES, NATIVE, softenContact)),
        })
      }),
    )
  },
})
