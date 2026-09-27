// TIME DILATION (E-MTR-0025): does a moving clock tick slower by gamma = 1 / sqrt(1 - v^2 / c^2), c the photon's?
//
// A clock is two levels of one state beating against each other: its tick rate is the energy difference
// Delta E(K) = E2(K) - E1(K) at a common total momentum K. Special relativity with one c says each level is
// sqrt(E_i^2 + c^2 K^2), so Delta E(K) / Delta E(0) = r_SR(K) = (sqrt(E2^2 + c^2 K^2) - sqrt(E1^2 + c^2 K^2)) /
// (E2 - E1), which is 1 / gamma to first order in the splitting, and at small K is 1 - alpha K^2 with
// alpha_SR = c^2 / (2 E1 E2).
//
// DERIVED before the first run. For the lazy root token (E-MTR-0023, 0024) with two mass phases mu1 < mu2 each band
// is cos E = cos(mu_i)(1 - L / Q), E_i ~ mu_i + (c^2 K^2 / 2) cot(mu_i), so alpha / alpha_SR = mu1 mu2 (cot mu1 -
// cot mu2) / (mu2 - mu1) = 1 + mu1 mu2 / 3 + ...: a light clock dilates as relativity says, with the photon's c.
//
// Gates, fixed before the first run:
// T1 the lazy root token clock (a STAND-IN: one token whose mass phase is one of two values, mu1 = pi / M and
//    mu2 = 2 pi / M, M = 2 (2D + 1)^2), husk, D = 2 .. 6, along an axis, a face and a body diagonal, at
//    c K = x sqrt(mu1 mu2) for x = 0.1, 0.3, 0.6: both levels read off the token's spectrum, and
//    |r(K) / r_SR(K) - 1| <= 0.01 with c the photon's husk c; the test is informative only if r_SR at x = 0.6 is at
//    least 5 percent below 1 (checked, and reported)
// T2 the flux-string bound state (E-SPN-0077's three locked loves, a STAND-IN on one husk line) at D = 1 .. 4: the
//    lightest and the next particle-sector level (E-SPN-0076's ranking) followed from K = 0 to 0.24 by overlap,
//    E_i = 3 (pi / 3) + unwrapped; r(K) fitted as 1 - alpha K^2 + beta K^4; pass if |alpha / alpha_SR - 1| <= 0.1
//    at all four D, alpha_SR = c_photon^2 / (2 E1 E2)
// PREDICTED: T1 passes; T2 FAILS: the bound state's levels are made of whole-copy tokens (E-MTR-0023) and its
// splitting moves with K through the lattice's own relative motion, not through gamma; E-MTR-0024 reads its band.
// Reported: the bound state's own self-consistent alpha (c from its lightest level's curvature, E-MTR-0024's c_bound),
// the sign of its alpha, and the group velocities the lazy clock reaches (v / c).
// Status: pass if T1 and T2 hold; partial if T1 holds; fail otherwise.
//
// Depth L2: both clocks are stand-ins.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { portCount } from '@/code/rule/lazy-root-token'
import { huskLightSpeed, lazyEnergyFromSpectrum, evenFit } from '@/code/measure/one-light-speed'
import { BOUND_KS, rankedParticleLevels, threeLoves, trackLevels } from '@/code/measure/bound-dispersion'

const DIRS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [1, 1, 0],
  [1, 1, 1],
]

const unit = (d: readonly number[], s: number): number[] => {
  const n = Math.hypot(...d)

  return d.map(x => (x * s) / n)
}

export default experiment({
  id: 'matter/moving-clock',
  code: 'E-MTR-0025',
  title:
    "time dilation: a clock made of the lazy root token's two light mass levels (a STAND-IN) ticks slower by the Lorentz factor with the photon's c, and the beat between the flux-string bound state's two lowest levels (a STAND-IN on locked tokens) is tested against the same factor",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const metrics: Record<string, number> = {}

    // ---- T1: the lazy clock ----
    let t1Gap = 0
    let informative = Infinity
    let topVelocity = 0

    for (let D = 2; D <= 6; D++) {
      const N = 2 * D + 1
      const M = 2 * N * N
      const Q = portCount(D)
      const c = huskLightSpeed(D)
      const mu1 = Math.PI / M
      const mu2 = (2 * Math.PI) / M
      const d0 = lazyEnergyFromSpectrum(Q, 2 * mu2, [0, 0, 0]) - lazyEnergyFromSpectrum(Q, 2 * mu1, [0, 0, 0])
      let worst = 0

      for (const d of DIRS) {
        for (const x of [0.1, 0.3, 0.6]) {
          const K = (x * Math.sqrt(mu1 * mu2)) / c
          const E1 = lazyEnergyFromSpectrum(Q, 2 * mu1, unit(d, K))
          const E2 = lazyEnergyFromSpectrum(Q, 2 * mu2, unit(d, K))
          const r = (E2 - E1) / d0
          const rSR = (Math.sqrt(mu2 * mu2 + c * c * K * K) - Math.sqrt(mu1 * mu1 + c * c * K * K)) / (mu2 - mu1)

          worst = Math.max(worst, Math.abs(r / rSR - 1))

          if (x === 0.6) informative = Math.min(informative, 1 - rSR)

          // the lighter level's group velocity
          const g = (lazyEnergyFromSpectrum(Q, 2 * mu1, unit(d, K + 1e-5)) - lazyEnergyFromSpectrum(Q, 2 * mu1, unit(d, K - 1e-5))) / 2e-5

          topVelocity = Math.max(topVelocity, g / c)
        }
      }

      metrics[`lazyClockGap_D${D}`] = worst
      t1Gap = Math.max(t1Gap, worst)
    }

    metrics.lazyClockGapWorst = t1Gap
    metrics.lazyClockSrDropAtX06 = informative
    metrics.lazyClockTopVelocityOverC = topVelocity

    const t1 = t1Gap <= 0.01 && informative >= 0.05

    log('t1')

    // ---- T2: the bound state's clock ----
    const rows = [1, 2, 3, 4].map(D => {
      const ranked = rankedParticleLevels(threeLoves(D), 4 * D + 6)
      const track = trackLevels(threeLoves(D), BOUND_KS, ranked.slice(0, 2))
      const e1 = track.energies[0]!
      const e2 = track.energies[1]!
      const ratio = BOUND_KS.map((_, i) => (e2[i]! - e1[i]!) / (e2[0]! - e1[0]!))
      const [, b] = evenFit(BOUND_KS, ratio)
      const alpha = -b
      const E1 = Math.PI + e1[0]!
      const E2 = Math.PI + e2[0]!
      const c = huskLightSpeed(D)
      const alphaSR = (c * c) / (2 * E1 * E2)
      const [, b1] = evenFit(BOUND_KS, e1)
      const cSelf2 = E1 * 2 * b1
      const alphaSelf = cSelf2 / (2 * E1 * E2)

      log(`t2 D ${D}`)

      return { D, alpha, alphaSR, alphaSelf, E1, E2, split: e2[0]! - e1[0]!, ratioEnd: ratio[ratio.length - 1]!, minOverlap: Math.min(...track.minOverlap), distinct: track.distinct }
    })
    const t2 = rows.every(r => Math.abs(r.alpha / r.alphaSR - 1) <= 0.1)

    for (const r of rows) {
      metrics[`bound_D${r.D}_split`] = r.split
      metrics[`bound_D${r.D}_alpha`] = r.alpha
      metrics[`bound_D${r.D}_alphaSR`] = r.alphaSR
      metrics[`bound_D${r.D}_alphaOverSR`] = r.alpha / r.alphaSR
      metrics[`bound_D${r.D}_alphaOverSelf`] = r.alpha / r.alphaSelf
      metrics[`bound_D${r.D}_ratioAtK024`] = r.ratioEnd
      metrics[`bound_D${r.D}_minOverlap`] = r.minOverlap
    }

    for (const [g, ok] of Object.entries({ T1: t1, T2: t2 })) metrics[`gate${g}`] = ok ? 1 : 0

    metrics.seconds = (Date.now() - started) / 1000

    const status = t1 && t2 ? 'pass' : t1 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a clock of the lazy root token's two light mass levels (a STAND-IN, husk) ticks at ${(1 - informative).toFixed(3)} of its rest rate or slower at the fastest point tried (v up to ${topVelocity.toFixed(2)} c) and follows the Lorentz factor with the photon's c to ${(100 * t1Gap).toFixed(3)} percent at D = 2 to 6; the beat between the flux-string bound state's two lowest levels (three locked loves, a STAND-IN) changes with momentum at ${rows.map(r => r.alpha.toExponential(2)).join(', ')} per K^2 against relativity's ${rows.map(r => r.alphaSR.toExponential(2)).join(', ')} at D = 1 to 4 (ratio ${rows.map(r => (r.alpha / r.alphaSR).toFixed(2)).join(', ')}): its clock ${t2 ? 'dilates' : 'does not dilate'} as relativity says`,
      metrics,
      control: Object.fromEntries(rows.map(r => [`bound_D${r.D}_alphaSelf`, r.alphaSelf])),
      notes: `L2. Gates T1 ${t1}, T2 ${t2}. FIRST RUN 2026-09-26 (tmp/sr-mtr25-run1.log, 6.1 s): PARTIAL, as predicted, no gate moved; the record run differs only in this sentence. T2 fails more strongly than predicted: at D = 2, 3, 4 the bound state's beat RISES with momentum (alpha negative, the moving clock ticks faster), and at D = 1 it falls four times faster than relativity says. Over the band the bound state reaches (group velocity at most 0.039 docks per beat, under a tenth of c) relativity asks a change of at most half a percent, and the lattice's own relative motion moves the beat by more than that, in either direction. HUSK FIRST: every c here is the photon's husk c, sqrt(4 / (3 (2D + 1))). The lazy clock: the SR drop at x = 0.6 is at least ${(100 * informative).toFixed(1)} percent (informative), and the measured ticks follow it to ${t1Gap.toExponential(1)} (by D: ${[2, 3, 4, 5, 6].map(D => (metrics[`lazyClockGap_D${D}`] ?? 0).toExponential(1)).join(', ')}; mu cot mu predicts a residue of order mu1 mu2 / 3). The bound state's clock by D: ${rows.map(r => `D ${r.D}: E1 ${r.E1.toFixed(4)}, E2 ${r.E2.toFixed(4)}, splitting ${r.split.toFixed(4)}, alpha ${r.alpha.toExponential(3)}, relativity with the photon's c ${r.alphaSR.toExponential(3)}, with its own c ${r.alphaSelf.toExponential(3)}, tick ratio at K = 0.24 ${r.ratioEnd.toFixed(5)}, min overlap ${r.minOverlap.toFixed(3)}, tracks distinct ${r.distinct}`).join('; ')}. MEANING: time dilation is not a separate law here: a clock dilates by the Lorentz factor exactly when both its levels share the photon's c and are light against the beat (E-MTR-0023, 0024). The lazy token's two levels do; the bound state's levels, built from whole-copy tokens of mass pi / 3, do not.`,
    })
  },
})
