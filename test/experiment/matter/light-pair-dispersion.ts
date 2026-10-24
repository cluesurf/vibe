// DOES BINDING REPAIR THE MEMBERS' LATTICE DISPERSION, OR INHERIT IT? THE LIGHT PAIR ALONG ITS CURVE (E-MTR-0031,
// OPEN-MOT-01). The light register pair (m 0.284, a_B 12, the contact well removed, E-SPN-0212's clean level) is read at
// total momentum K 0.2, 0.35, 0.5 and 1.0 by the sector eigensolver of E-MTR-0030 (code/measure/pair-boost
// boostCorrelation, then code/algebra/linear/filter-diagonalization), instead of the Fourier read that failed in
// E-MTR-0029.
//
// THE OBSERVABLE: the pair's quartic as a fraction of relativity's. For a curve with rest energy E0 and curvature a,
// the Galilean form is E0 + a K^2 and the relativistic one sqrt(E0^2 + 2 a E0 K^2). Write
//   E(K) = E_gal(K) - rho (E_gal(K) - E_rel(K)),
// so rho 1 is relativity and rho 0 Galileo. The lone member's own band (control, test/record/E-MTR-0031/mtr-light-probe.log) has rho
// 1.772, 1.771, 1.770, 1.768 at k = K / 2 for K 0.2, 0.35, 0.5, 1.0, constant to 0.3%. The pair's rho is fitted the same
// way, as one constant with a free: E0 is the solver's K = 0 ground, and (a, rho) are least squares over the four K
// (two degrees of freedom). Why a is fitted, not taken from E-SPN-0212's K 0.04 and 0.02 read: that read's a carries
// about 2e-3 relative error, which alone moves rho by 0.16 at K 0.35. The fitted a is reported against it as a
// consistency check (R 1.1278 there).
//
// THE TWO HYPOTHESES. INHERIT: a bound pair carries its members' band (a rigid composite carries rho_member exactly),
// rho = 1.77. REPAIR: binding makes a relativistic composite, rho = 1.
//
// GATES, fixed before the run:
//   W  WITNESS: the solver's K = 0 ground on E-SPN-0212's recorded correlation (S 2048, J 60, window [1.105, 1.125]) within
//      1e-5 of the recorded read 1.1141074420257853 (E-MTR-0030 showed about 1e-6 at S 4096; 2048 is what the K reads use)
//   I  INSTRUMENT at every K: the ground (the heaviest line in the window) has |z| within 1e-6 of 1, weight at least
//      0.3, and moves at most 2e-5 over the settings (J 60 and 80, the window moved by -0.003 and +0.003)
//   F  THE FIT holds one rho: residual rms at most 3 sigma_E, sigma_E the largest per-K half-spread (floor 1e-6)
//   Bands on the fitted rho, with its fit error sigma_rho:
//   pass     |rho - 1| <= 0.12 (three times the 0.04 resolution): binding repairs the dispersion
//   partial  1.12 < rho < 1.65: binding repairs part of it
//   fail     otherwise, including |rho - 1.77| <= 0.12: the pair inherits its members' band
//   Verdict: the band's, if W, I and F hold and sigma_rho <= 0.04; fail if W or I fails; partial at most if F fails
//   or sigma_rho > 0.04 (the per-K rho then reported).
// PREDICTED: no number is predicted. The rigid-composite argument (E-MTR-0029's header) gives 1.77; a pair whose inertia
// exceeds its members' (R 1.128 against 1.028) is not rigid, so the outcome is open.
// The 2s-like clock is skipped unless a clean second line (weight at least 0.05, |z| within 1e-6 of 1, stable to 2e-5)
// shows in every window; if it does, it is reported, not gated.
//
// THE RUN AND ITS COST, estimated before the run: 1.54 s a cycle at 6 threads on the a_B 12 C4v sector (86,420 states,
// test/record/E-MTR-0031/mtr-light-probe.log), 4,096 cycles a K, so 1.75 hours a K and 7 hours for four, as two processes of 3 threads.
// The run stops at 8 hours with whatever K have landed.
//
// FIRST RUN (2026-10-21 00:19 to 04:38, test/record/E-MTR-0031/mtr-light-a.log and -b.log, two processes of test/record/E-MTR-0031/run/mtr-light-part.ts at 3
// threads on a loaded machine, 2.1 hours a K; the verdict by combineLight in test/record/E-MTR-0031/run/mtr-light-combine.ts,
// test/record/E-MTR-0031/mtr-light-verdict.log): FAIL on W and I. No gate moved. The fit itself holds (F).
//  - W fails: at S 2048 the solver's K = 0 ground is 1.11408757, 2.0e-5 below the recorded 1.11410744, against a 1e-5
//    gate, with a half-spread of 1.0e-5 over the settings. This was knowable before the run and was not checked.
//  - I fails at every K on stability (half-spreads 3.1e-5, 1.8e-5, 8.6e-5, 2.3e-4 at K 0.2, 0.35, 0.5, 1.0, against a
//    1e-5 half-spread gate), and at K 1.0 on weight too (0.168, the ground spread over its multiplet). The moduli are
//    within 6e-6 of 1.
//  - THE NUMBER: one rho fits all four K, rms 1.5e-5 (F holds): rho = 2.21 +- 0.05, the error taken from the largest
//    per-K spread (2.3e-4), so it is conservative. Per K: 1.95, 2.31, 2.20, 2.21 at K 0.2, 0.35, 0.5, 1.0 (K 0.2
//    resolves rho only to about 0.4). The lone member reads 1.77 at every K. The fitted curvature is 0.20204 (R 1.111),
//    1.5% above the small-K Fourier read's 0.19897 (R 1.128). a and rho are correlated in the fit, and the E0 offset of
//    2e-5 moves rho by under 0.002 at K 1.0.
//  - Band: fail, and outside BOTH hypotheses: rho is 0.44 above the members' 1.77 (8 sigma) and 1.2 above relativity.
//    No clean 2s-like line showed, so the clock was skipped.
// MEANING. Binding does not repair the members' lattice dispersion, and it does not simply inherit it: the light pair
// bends away from relativity more than its members do, its quartic 2.2 times relativity's against their 1.77. A pair
// whose binding changes with K (its levels mixing with a multiplet at large K, as at K 1.0) adds its own non-relativistic
// quartic. This holds at m 0.284 and a_B 12 only, and is read through an instrument that failed its own gates at the
// 1e-5 level. The rho it gives is robust to that level, since the Galilean and relativistic forms differ by 1.5e-2 at
// K 1.0.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the lone member's band is the
// control). DETERMINISM: no random numbers; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { filterDiagonalize, type FilterLine } from '@/code/algebra/linear/filter-diagonalization'
import { softenContact } from '@/code/measure/contact-core'
import {
  boostCorrelation,
  galileanEnergy,
  relativisticEnergy,
  thresholdRise,
} from '@/code/measure/pair-boost'
import { diracPhase } from '@/code/measure/spinor-register'
import { weightedLeastSquares } from '@/code/measure/regression'
import { setupFor, TRACK_PLAN } from '@/code/measure/register-track'

export const UNIT: readonly [number, number] = [-7, 2]
export const A_B = 12
export const MOMENTA: readonly number[] = [1.0, 0.5, 0.35, 0.2]
export const CYCLES = 4096
const S = 2048
const RECORDED_E0 = 1.1141074420257853
const RECORDED_A = (4 * (0.00007951948335205294 / 0.02 ** 2) - 0.00031724216442130526 / 0.04 ** 2) / 3
const ZERO_WINDOW = [1.105, 1.125] as const
const WITNESS = 1e-5
const MODULUS = 1e-6
const WEIGHT = 0.3
const STABLE = 2e-5
const FIT = 3
const SIGMA_FLOOR = 1e-6
const RESOLUTION = 0.04
const PASS = 0.12
const PARTIAL = [1.12, 1.65] as const
const SETTINGS: readonly (readonly [number, number])[] = [
  [60, 0],
  [80, 0],
  [60, -0.003],
  [60, 0.003],
]

type Correlation = { re: ArrayLike<number>; im: ArrayLike<number> }

const flag = (b: boolean): number => (b ? 1 : 0)
const heaviest = (ls: FilterLine[]): FilterLine | undefined =>
  ls.length === 0 ? undefined : ls.reduce((b, l) => (l.weight > b.weight ? l : b))

// the window for the ground at K, placed by the lone member's threshold rise, never by the pair
export function windowAt(K: number, E0: number): [number, number] {
  const su = setupFor(UNIT)
  const rise = thresholdRise(su, K)

  return [E0 + 0.85 * rise - 0.004, E0 + 1.02 * rise + 0.004]
}

// the ground over the settings: the main read (first setting), its half-spread, and the main line
export function groundOf(x: Correlation, lo: number, hi: number): {
  line: FilterLine | undefined
  half: number
  reads: number[]
} {
  const reads = SETTINGS.map(([J, d]) =>
    heaviest(filterDiagonalize({ x, lo: lo + d, hi: hi + d, basis: J, length: S })),
  )
  const Es = reads.map(l => l?.E ?? NaN)

  return {
    line: reads[0],
    half: (Math.max(...Es) - Math.min(...Es)) / 2,
    reads: Es,
  }
}

export function combineLight(input: {
  zero: Correlation
  reads: readonly { K: number; re: ArrayLike<number>; im: ArrayLike<number> }[]
}): Verdict {
  const su = setupFor(UNIT)
  const cm2 = 2 * su.aMember * su.M0
  const metrics: Record<string, number> = {}
  const text: string[] = []
  const g0 = groundOf(input.zero, ZERO_WINDOW[0], ZERO_WINDOW[1])
  const E0 = g0.line?.E ?? NaN
  const W = Math.abs(E0 - RECORDED_E0) <= WITNESS

  metrics.E0 = E0
  metrics.E0_off = E0 - RECORDED_E0
  metrics.E0_half = g0.half

  let I = true
  let sigmaE = Math.max(SIGMA_FLOOR, g0.half)
  const points: { K: number; E: number }[] = []

  for (const r of input.reads) {
    const [lo, hi] = windowAt(r.K, E0)
    const g = groundOf(r, lo, hi)
    const l = g.line
    const ok =
      l !== undefined &&
      Math.abs(l.modulus - 1) <= MODULUS &&
      l.weight >= WEIGHT &&
      g.half * 2 <= STABLE

    I = I && ok
    sigmaE = Math.max(sigmaE, g.half)
    points.push({ K: r.K, E: l?.E ?? NaN })

    const Em = diracPhase([r.K / 2, 0, 0, 0], su.M0)
    const ga = su.M0 + (cm2 / (2 * su.M0)) * (r.K / 2) ** 2
    const re = Math.sqrt(su.M0 ** 2 + cm2 * (r.K / 2) ** 2)

    metrics[`K${r.K}_E`] = l?.E ?? NaN
    metrics[`K${r.K}_weight`] = l?.weight ?? NaN
    metrics[`K${r.K}_modulus`] = l?.modulus ?? NaN
    metrics[`K${r.K}_half`] = g.half
    metrics[`K${r.K}_rhoMember`] = (ga - Em) / (ga - re)
    text.push(
      `K ${r.K}: ground ${(l?.E ?? NaN).toFixed(8)} (weight ${(l?.weight ?? NaN).toFixed(3)}, |z| ${(l?.modulus ?? NaN).toFixed(8)}, half-spread ${g.half.toExponential(2)})${ok ? '' : ', not clean'}`,
    )
  }

  // the constant-rho fit: E = E0 + a K^2 - rho (E_gal - E_rel), nonlinear in a, so Gauss-Newton from the recorded a
  let a = RECORDED_A
  let rho = 1.5
  let cov = [NaN, NaN]
  let rms = NaN

  for (let it = 0; it < 50; it++) {
    const model = (aa: number, rr: number, K: number): number =>
      galileanEnergy({ E0, a: aa, K }) -
      rr * (galileanEnergy({ E0, a: aa, K }) - relativisticEnergy({ E0, a: aa, K }))
    const h = 1e-7
    const rows = points.map(p => [
      (model(a + h, rho, p.K) - model(a - h, rho, p.K)) / (2 * h),
      galileanEnergy({ E0, a, K: p.K }) === relativisticEnergy({ E0, a, K: p.K })
        ? 0
        : -(galileanEnergy({ E0, a, K: p.K }) - relativisticEnergy({ E0, a, K: p.K })),
    ])
    const ys = points.map(p => p.E - model(a, rho, p.K))
    const step = weightedLeastSquares({ rows, ys, errors: points.map(() => 1) })

    a += step.coefficients[0] ?? 0
    rho += step.coefficients[1] ?? 0

    const resid = points.map(p => p.E - model(a, rho, p.K))

    rms = Math.sqrt(resid.reduce((s, x) => s + x * x, 0) / points.length)

    const scale = Math.max(sigmaE, Math.sqrt(resid.reduce((s, x) => s + x * x, 0) / Math.max(1, points.length - 2)))

    cov = step.errors.map(e => e * scale)

    if (Math.abs(step.coefficients[0] ?? 0) < 1e-14 && Math.abs(step.coefficients[1] ?? 0) < 1e-12) break
  }

  const sigmaRho = cov[1] ?? NaN
  const F = rms <= FIT * sigmaE
  const band =
    Math.abs(rho - 1) <= PASS
      ? 'pass'
      : rho > PARTIAL[0] && rho < PARTIAL[1]
        ? 'partial'
        : 'fail'
  const status: Verdict['status'] =
    !W || !I
      ? 'fail'
      : F && sigmaRho <= RESOLUTION
        ? band
        : band === 'pass'
          ? 'partial'
          : band

  for (const p of points) {
    const gal = galileanEnergy({ E0, a, K: p.K })
    const rel = relativisticEnergy({ E0, a, K: p.K })

    metrics[`K${p.K}_rho`] = (gal - p.E) / (gal - rel)
  }

  metrics.W = flag(W)
  metrics.I = flag(I)
  metrics.F = flag(F)
  metrics.a = a
  metrics.aRecorded = RECORDED_A
  metrics.R = 0.5 / (2 * a * E0)
  metrics.rho = rho
  metrics.sigmaRho = sigmaRho
  metrics.rms = rms
  metrics.sigmaE = sigmaE

  return verdict({
    status,
    claim: `the light pair's quartic is ${rho.toFixed(3)} +- ${sigmaRho.toFixed(3)} of relativity's (its members' 1.77, relativity 1), fitted over K ${points.map(p => p.K).join(', ')} with a ${a.toFixed(5)} (recorded ${RECORDED_A.toFixed(5)}), rms ${rms.toExponential(2)}: W ${W}, I ${I}, F ${F}, band ${band}`,
    metrics,
    control: Object.fromEntries(points.map(p => [`rhoMember_K${p.K}`, metrics[`K${p.K}_rhoMember`] ?? NaN])),
    notes: `L2. K = 0 ground ${E0.toFixed(9)} (recorded ${RECORDED_E0}). ${text.join('. ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 6 }
const W_DIR = `${import.meta.dirname}/../../..`

// E-SPN-0212's recorded K = 0 correlation, for a part run and a combine
export const recordedZeroCorrelation = (): Correlation | null => {
  const path = `${W_DIR}/test/record/E-SPN-0212/spn-light-m0284-a12.json`

  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).zero.x : null
}

export default experiment({
  id: 'matter/light-pair-dispersion',
  code: 'E-MTR-0031',
  title:
    "explores whether binding repairs or inherits the members' lattice dispersion: the light register pair (m 0.284, a_B 12, contact well removed) read by the sector eigensolver at K 0.2, 0.35, 0.5, 1.0, its quartic as a fraction of relativity's against its members' 1.77: fail on the instrument gates, and the fitted fraction 2.21 +- 0.05 lies outside both hypotheses, so binding neither repairs nor simply inherits the members' band",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const su = setupFor(UNIT)
    const p = TRACK_PLAN.find(x => x.aB === A_B)!
    const zero = boostCorrelation(su, p, 0, 8448, NATIVE, softenContact)

    return combineLight({
      zero,
      reads: MOMENTA.map(K => boostCorrelation(su, p, K, CYCLES, NATIVE, softenContact)),
    })
  },
})
