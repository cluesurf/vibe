// E = m c^2 (E-MTR-0024): does a massive state's rest energy equal its mass times the PHOTON's c^2, with m read
// from the curvature of its own band?
//
// The reading. A band E(K) with rest energy E0 = E(0) and curvature E'' = E''(0) has, if it is Lorentz's
// sqrt(m^2 c^4 + c^2 K^2), m = 1 / E'' (per c^2) and E0 = m c^2, so c_rest^2 := E0 E'' is the c the state carries. E = m c^2
// with one relativity is c_rest = c_photon = sqrt(4 / (3 (2D + 1))) (E-MTR-0023, husk).
//
// DERIVED before the first run. A band of the form cos E = cos(mu) f(K), f(0) = 1, f ~ 1 - c0^2 K^2 / 2 (every
// coin-phase mass in this model: the locked token with f = cos K, c0 = 1; the lazy root token with f = 1 - L / Q,
// c0 = c_photon) has E0 = mu and E'' = c0^2 cot(mu), so c_rest^2 = c0^2 mu cot(mu) = c0^2 (1 - mu^2 / 3 - ...).
// E = m c^2 holds with the photon's c exactly when c0 = c_photon (E-MTR-0023's lazy token) AND the mass is light
// against the beat, mu << 1. The locked token has both wrong: c0 = 1 and mu = pi / 3 (the coin's order-3 phase),
// c_rest^2 = (pi / 3) / sqrt 3 = 0.6046.
//
// Gates, fixed before the first run:
// E1 the lazy root token (a STAND-IN, husk, code/rule/lazy-root-token) with the mass phase phi = 2 mu:
//    (a) at D = 1 .. 6 and phi in {2 pi / M (M = 2 (2D + 1)^2, the light's drift phase unit), 2 pi / 3}, its rest
//        energy read off its spectrum is mu = phi / 2 within 1e-12
//    (b) its c_rest^2 (curvature by a 1e-3 difference along an axis, a face and a body diagonal) is c_photon^2 mu cot(mu)
//        within 1e-5 relative
//    (c) E = m c^2 with the photon's c: at phi = 2 pi / M and D = 2 .. 6, |c_rest^2 / c_photon^2 - 1| <= 0.01
//    (d) the Lorentz shape: at phi = 2 pi / M, D = 2 .. 6, 13 directions, c_photon K / mu = 0.25, 0.5 and 1, the band
//        from its spectrum is sqrt(mu^2 + c_photon^2 K^2) within 1 percent
// E2 the flux-string bound state (E-SPN-0077's three locked loves, a STAND-IN on one husk line) at D = 1 .. 4: its
//    lightest level followed from K = 0 to 0.24 in steps of 0.04 (by overlap), E'' from a fit E = a + b K^2 + c K^4,
//    rest energy E0 = 3 (pi / 3) + its unwrapped energy (each locked token's Dirac rest energy pi / 3 plus the
//    E-SPN-0076 level energy measured from the free band bottom); pass if |c_bound / c_photon - 1| <= 0.05 at all four
// PREDICTED: E1 passes (derived above); E2 FAILS. The bound state is made of whole-copy tokens (c0 = 1) of mass
// pi / 3 each, so nothing ties its c to the photon's; its band's width (0.078 to 0.080 over K in [0, pi] at D = 2 to
// 4) was visible in E-SPN-0077's registered log before this gate was written (disclosed), so c_bound is expected
// nearly flat in D while c_photon falls as (2D + 1)^(-1/2), crossing it at most once.
// Reported: the love-fear pair (E-SPN-0076's state, E0 = 2 pi / 3 + unwrapped) read the same way; the bound state's
// c_bound against the locked token's own c (0.7776); E2 with the rest energy read as the unwrapped energy alone.
// Status: pass if E1 and E2 hold; partial if E1 holds; fail otherwise.
//
// Depth L2: both states are stand-ins (the lazy token is spinless, the bound state lives on locked tokens on one
// line); the closed form c_rest^2 = c0^2 mu cot(mu) is L1.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { portCount } from '@/code/rule/lazy-root-token'
import {
  huskLightSpeed,
  lazyEnergyFromSpectrum,
  evenFit,
} from '@/code/measure/one-light-speed'
import {
  BOUND_KS,
  loveFear,
  rankedParticleLevels,
  threeLoves,
  trackLevels,
} from '@/code/measure/bound-dispersion'
import { type BlochSpec } from '@/code/measure/flux-store-bloch'

const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, 1, 1],
]
const CURVATURE_DIRECTIONS = [0, 3, 9]

const unit = (d: readonly number[], s: number): number[] => {
  const n = Math.hypot(...d)

  return d.map(x => (x * s) / n)
}

function boundCurvature(
  spec: BlochSpec,
  restPerToken: number,
): {
  E0: number
  unwrapped: number
  curvature: number
  minOverlap: number
  fitResidual: number
  next: number
  nextCurvature: number
  distinct: boolean
} {
  const D = spec.depth
  const ranked = rankedParticleLevels(spec, 4 * D + 6)
  const track = trackLevels(spec, BOUND_KS, ranked.slice(0, 2))
  const [a, b, c] = evenFit(BOUND_KS, track.energies[0]!)

  let fitResidual = 0

  BOUND_KS.forEach((k, i) => {
    fitResidual = Math.max(
      fitResidual,
      Math.abs(a + b * k * k + c * k ** 4 - track.energies[0]![i]!),
    )
  })

  const second = track.energies[1]
    ? evenFit(BOUND_KS, track.energies[1])
    : [Number.NaN, Number.NaN, Number.NaN]
  const n = spec.kinds.length

  return {
    E0: n * restPerToken + ranked[0]!.unwrapped,
    unwrapped: ranked[0]!.unwrapped,
    curvature: 2 * b,
    minOverlap: Math.min(...track.minOverlap),
    fitResidual,
    next: n * restPerToken + (ranked[1]?.unwrapped ?? Number.NaN),
    nextCurvature: 2 * second[1]!,
    distinct: track.distinct,
  }
}

export default experiment({
  id: 'matter/rest-energy',
  code: 'E-MTR-0024',
  title:
    "E = m c^2: a coin-phase mass mu on a band of massless speed c0 has rest energy m c_rest^2 with c_rest^2 = c0^2 mu cot(mu); the lazy root token (a STAND-IN, c0 the photon's) meets E = m c^2 with the photon's c for a light mass and has the Lorentz band, while the flux-string bound state of three locked loves (a STAND-IN) does not carry the photon's c",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const metrics: Record<string, number> = {}
    const h = 1e-3

    // ---- E1: the lazy root token ----
    let restGap = 0
    let closedGap = 0
    let emc2 = 0
    let shape = 0

    for (let D = 1; D <= 6; D++) {
      const N = 2 * D + 1
      const M = 2 * N * N
      const Q = portCount(D)
      const c = huskLightSpeed(D)

      for (const [tag, phi] of [
        ['light', (2 * Math.PI) / M],
        ['third', (2 * Math.PI) / 3],
      ] as const) {
        const mu = phi / 2
        const E0 = lazyEnergyFromSpectrum(Q, phi, [0, 0, 0])

        restGap = Math.max(restGap, Math.abs(E0 - mu))

        let worst = 0
        let mean = 0

        for (const di of CURVATURE_DIRECTIONS) {
          const Eh = lazyEnergyFromSpectrum(
            Q,
            phi,
            unit(DIRECTIONS[di]!, h),
          )
          const curvature = (2 * (Eh - E0)) / (h * h)
          const ratio =
            (E0 * curvature) /
            (c * c * mu * (Math.cos(mu) / Math.sin(mu)))

          worst = Math.max(worst, Math.abs(ratio - 1))
          mean += (E0 * curvature) / 3
        }

        closedGap = Math.max(closedGap, worst)
        metrics[`lazy_${tag}_D${D}_mu`] = mu
        metrics[`lazy_${tag}_D${D}_cRest2OverPhoton2`] = mean / (c * c)

        if (tag === 'light' && D >= 2) {
          emc2 = Math.max(emc2, Math.abs(mean / (c * c) - 1))

          for (const d of DIRECTIONS) {
            for (const x of [0.25, 0.5, 1]) {
              const K = (x * mu) / c
              const E = lazyEnergyFromSpectrum(Q, phi, unit(d, K))

              shape = Math.max(
                shape,
                Math.abs(E / Math.sqrt(mu * mu + c * c * K * K) - 1),
              )
            }
          }
        }
      }
    }

    // DIAGNOSTIC, added after the first run and not a gate: gate E1 (b)'s 1e-3 step is not small against the light
    // mass's Compton wavenumber mu / c, and a difference of sqrt(mu^2 + c^2 K^2) over a step h reads the curvature
    // low by (c h / mu)^2 / 4; the same closed form read with the step scaled to the mass, h = 0.002 mu / c
    let scaledGap = 0

    for (let D = 1; D <= 6; D++) {
      const N = 2 * D + 1
      const Q = portCount(D)
      const c = huskLightSpeed(D)
      const phi = (2 * Math.PI) / (2 * N * N)
      const mu = phi / 2
      const hs = (0.002 * mu) / c
      const E0 = lazyEnergyFromSpectrum(Q, phi, [0, 0, 0])

      for (const di of CURVATURE_DIRECTIONS) {
        const curvature =
          (2 *
            (lazyEnergyFromSpectrum(Q, phi, unit(DIRECTIONS[di]!, hs)) -
              E0)) /
          (hs * hs)

        scaledGap = Math.max(
          scaledGap,
          Math.abs(
            (E0 * curvature) /
              (c * c * mu * (Math.cos(mu) / Math.sin(mu))) -
              1,
          ),
        )
      }
    }

    metrics.lazyRestGap = restGap
    metrics.lazyClosedFormGap = closedGap
    metrics.lazyEmc2GapLight = emc2
    metrics.lazyLorentzShapeGap = shape

    const e1 =
      restGap <= 1e-12 &&
      closedGap <= 1e-5 &&
      emc2 <= 0.01 &&
      shape <= 0.01

    log('e1')

    // ---- E2: the flux-string bound state ----
    const rest = Math.PI / 3
    const rows = [1, 2, 3, 4].map(D => {
      const r = boundCurvature(threeLoves(D), rest)

      log(`e2 three D ${D}`)

      return {
        D,
        ...r,
        c: Math.sqrt(r.E0 * r.curvature),
        cAlt: Math.sqrt(Math.abs(r.unwrapped * r.curvature)),
        photon: huskLightSpeed(D),
      }
    })
    const pairs = [1, 2, 3, 4].map(D => {
      const r = boundCurvature(loveFear(D), rest)

      log(`e2 pair D ${D}`)

      return {
        D,
        ...r,
        c: Math.sqrt(r.E0 * r.curvature),
        photon: huskLightSpeed(D),
      }
    })
    const e2 = rows.every(r => Math.abs(r.c / r.photon - 1) <= 0.05)

    for (const r of rows) {
      metrics[`three_D${r.D}_E0`] = r.E0
      metrics[`three_D${r.D}_curvature`] = r.curvature
      metrics[`three_D${r.D}_cBound`] = r.c
      metrics[`three_D${r.D}_cBoundOverPhoton`] = r.c / r.photon
      metrics[`three_D${r.D}_cBoundOverLockedToken`] =
        r.c / Math.sqrt(Math.PI / 3 / Math.sqrt(3))
      metrics[`three_D${r.D}_minOverlap`] = r.minOverlap
      metrics[`three_D${r.D}_fitResidual`] = r.fitResidual
    }

    for (const r of pairs) {
      metrics[`pair_D${r.D}_E0`] = r.E0
      metrics[`pair_D${r.D}_curvature`] = r.curvature
      metrics[`pair_D${r.D}_cBoundOverPhoton`] = r.c / r.photon
      metrics[`pair_D${r.D}_minOverlap`] = r.minOverlap
    }

    for (const [g, ok] of Object.entries({ E1: e1, E2: e2 })) {
      metrics[`gate${g}`] = ok ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const status = e1 && e2 ? 'pass' : e1 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a coin-phase mass mu on a band of massless speed c0 carries c_rest^2 = E0 E'' = c0^2 mu cot(mu) (lazy root token: rest energy to ${restGap.toExponential(1)}, closed form to ${closedGap.toExponential(1)} at D = 1 to 6); with c0 the photon's and the light mass mu = pi / (2 (2D + 1)^2) the lazy token (a STAND-IN) meets E = m c^2 with the photon's husk c to ${(100 * emc2).toFixed(2)} percent and has the Lorentz band sqrt(m^2 c^4 + c^2 K^2) to ${(100 * shape).toFixed(2)} percent up to K = m c at D = 2 to 6, while at mu = pi / 3 (the model's own coin phase) c_rest^2 is ${(metrics.lazy_third_D2_cRest2OverPhoton2 ?? 0).toFixed(4)} of c^2, the same deficit the locked token has; the flux-string bound state of three locked loves (a STAND-IN) carries c_bound = ${rows.map(r => r.c.toFixed(4)).join(', ')} against the photon's ${rows.map(r => r.photon.toFixed(4)).join(', ')} at D = 1 to 4 (ratio ${rows.map(r => (r.c / r.photon).toFixed(3)).join(', ')}): E = m c^2 with the photon's c ${e2 ? 'holds' : 'fails'} there`,
      metrics,
      control: {
        lazyClosedFormGapScaledStepDiagnostic: scaledGap,
        lockedTokenC: Math.sqrt(Math.PI / 3 / Math.sqrt(3)),
        ...Object.fromEntries(
          rows.map(r => [`three_D${r.D}_cBoundUnwrappedOnly`, r.cAlt]),
        ),
        ...Object.fromEntries(
          pairs.map(r => [`pair_D${r.D}_cBound`, r.c]),
        ),
      },
      notes: `L2 (the closed form is L1). Gates E1 ${e1}, E2 ${e2}. FIRST RUN 2026-09-26 (tmp/sr-mtr24-run1.log, 6.1 s): FAIL. E1 (a), (c), (d) hold (rest energy to 1.8e-15, E = m c^2 with the photon's c to 0.13 percent at D = 2 to 6, the Lorentz band to 0.056 percent), but E1 (b) fails at 3.0e-4 against its 1e-5 tolerance through a FLAW IN THE GATE: its fixed 1e-3 difference step is not small against the light mass's Compton wavenumber mu / c (0.029 at D = 6), and the difference reads the curvature low by (c h / mu)^2 / 4 = 3.0e-4 there, exactly the gap. Diagnosed after the run; NO GATE MOVED and the status stands. A diagnostic added after the run (not a gate) reads the same closed form with the step scaled to the mass, h = 0.002 mu / c: gap ${scaledGap.toExponential(1)}. E2 fails as predicted, but the prediction's reason was half wrong: the love-fear pair's c_bound is nearly flat in D and near the locked token's own c (0.70 to 0.73 against 0.7776), while the three loves' c_bound falls with D (0.49 to 0.31), 0.70 to 0.86 of the photon's, tracking neither. The record run differs from the first only in the diagnostic and this sentence. HUSK FIRST: the photon's c is its husk c, sqrt(4 / (3 (2D + 1))); the lazy token lives on the husk; the bound state lives on one husk line and is compared with the same c (the husk photon is isotropic). Lazy token c_rest^2 / c^2 by D (light mass): ${[1, 2, 3, 4, 5, 6].map(D => (metrics[`lazy_light_D${D}_cRest2OverPhoton2`] ?? 0).toFixed(6)).join(', ')} (mu cot mu predicts 1 - mu^2 / 3); at mu = pi / 3: ${[1, 2, 3, 4, 5, 6].map(D => (metrics[`lazy_third_D${D}_cRest2OverPhoton2`] ?? 0).toFixed(6)).join(', ')} ((pi / 3) / sqrt 3 = 0.604600). Three loves by D: ${rows.map(r => `D ${r.D}: E0 ${r.E0.toFixed(4)} (unwrapped ${r.unwrapped.toFixed(4)}), E'' ${r.curvature.toFixed(5)}, c_bound ${r.c.toFixed(4)}, photon ${r.photon.toFixed(4)}, locked token 0.7776, next level ${r.next.toFixed(4)} with E'' ${r.nextCurvature.toFixed(5)}, min overlap ${r.minOverlap.toFixed(3)}, fit residual ${r.fitResidual.toExponential(1)}, tracks distinct ${r.distinct}`).join('; ')}. Love-fear pair by D: ${pairs.map(r => `D ${r.D}: E0 ${r.E0.toFixed(4)}, E'' ${r.curvature.toFixed(5)}, c_bound ${r.c.toFixed(4)} (${(r.c / r.photon).toFixed(3)} of the photon's), min overlap ${r.minOverlap.toFixed(3)}`).join('; ')}. MEANING: E = m c^2 with one c needs two things the locked tokens lack, a massless speed equal to the photon's (E-MTR-0023) and a mass light against the beat; the model's natural mass, the coin's third of a turn, costs 40 percent of c^2 on ANY band (mu cot mu at pi / 3), so a lattice-light electron needs a mass phase from a finer ring, such as the light's own drift unit 2 pi / (2 (2D + 1)^2) used here.`,
    })
  },
})
