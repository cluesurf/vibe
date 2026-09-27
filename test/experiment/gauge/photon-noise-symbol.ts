// Where the carried-remainder noise goes, derived through the symbol before any shaped rule runs (E-FRC-0183).
//
// E-FRC-0181 made husk light exact in the mean with a first-order error-diffusion force, and left a zero-mean
// quantization kick of about one flux unit per plaquette per beat that heats (722 per beat against the
// E-FRC-0164 rule's 570 on its F1 protocol), drives all 8 husk branches and fools the lagged estimator. This
// file computes, from the exact leapfrog symbol alone, what each candidate shaping does to that noise on the
// photon and massive branches (code/measure/photon-noise): the noise a mode of eigenvalue lambda absorbs is
// 1/2 lambda sigma^2 |NTF(e^(i omega))|^2 per beat, at its own frequency 4 sin^2(omega / 2) = kappa lambda.
//
// Candidates, as noise transfer functions (z the one-beat delay):
// - first order, 1 - z (E-FRC-0181): |NTF|^2 = kappa lambda
// - second and third order in time, (1 - z)^2 and (1 - z)^3: (kappa lambda)^2 and (kappa lambda)^3
// - the best monic FIR of order 2 and 3 in time, fitted to this band by least squares
// - the wave form, spatial error diffusion joined to second order: 1 - (2 - kappa M) z + z^2, the leapfrog's
//   own operator, zero on every shell
// - the gauge kernel, candidate 2 as first posed: impossible, because every kick is a curl and C g = 0 on a
//   pure-gauge g, so curl noise is orthogonal to the gauge by construction and a gauge-directed kick would
//   break Gauss's law. Checked as |M(k) g(k)| = 0
//
// Choices, fixed before the run: kappa = p / q = 4021 / 65536 (E-FRC-0181), sigma^2 = 1 / 12 (a uniform fresh
// error), the E-FRC-0181 F1 box (D4 side 4) and F2 box (side 8), the husk of the side-8 box.
//
// Gates, fixed before the run:
// G1 the wave NTF vanishes on every shell: the largest |NTF| over every branch of every mode is under 1e-12,
//    on the side-4 and side-8 bulk and the side-8 husk
// G2 no curl reaches the gauge: max over the nonzero modes of the side-8 bulk of |M(k) g(k)| / |g(k)| under
//    1e-12
// G3 the witness is calibrated: the white-noise model's first-order heating on the side-4 box lies within 30
//    percent of E-FRC-0181's measured F1 growth, 722 per beat. If G3 fails, only the RATIOS between forms are
//    carried forward as predictions, never the absolute numbers
// Predictions registered here and tested in E-FRC-0184 (time shaping) and E-FRC-0185 (the wave form), not
// gated here: the F1 heating of each form as 722 times its ratio to first order, against the half-of-E-FRC-0164
// gate of 285 per beat.
//
// Depth L2: a closed-form spectral argument on the exact symbol, checked numerically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import { makeHusk } from '@/code/measure/photon-husk'
import { leapfrogOmega } from '@/code/measure/photon-modes'
import { bulkSpectrum, heating, huskSpectrum, NOISE_FORMS, notchCoefficient, ntfPower, optimalTaps, type BranchSpectrum } from '@/code/measure/photon-noise'

const Q = 65536
const P = 4021
const KAPPA = P / Q
const SIGMA2 = 1 / 12
const MEASURED_FIRST_F1 = 722
const E164_F1 = 570

export default experiment({
  id: 'gauge/photon-noise-symbol',
  code: 'E-FRC-0183',
  title:
    'where the carried-remainder noise goes, through the symbol: the heating each noise transfer function leaves on the photon and massive branches, time shaping of order 1 to 3 against the wave form 1 - (2 - kappa M) z + z^2, which vanishes on every shell, and why no curl kick can put noise into the gauge',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const bulk4 = photonLatticeD4({ side: 4 })
    const bulk8 = photonLatticeD4({ side: 8 })
    const husk8 = makeHusk(bulk8)
    const spectra: [string, BranchSpectrum, number[]][] = [
      ['husk8', huskSpectrum(husk8), [1, 2]],
      ['bulk4', bulkSpectrum(bulk4), [1, 2, 3]],
      ['bulk8', bulkSpectrum(bulk8), [1, 2, 3]],
    ]

    let waveLargest = 0

    for (const [tag, spectrum, light] of spectra) {
      const first = heating(spectrum, NOISE_FORMS[1]!, KAPPA, SIGMA2, light).total
      let traceM = 0

      spectrum.lambda.forEach(v => (traceM += v))

      for (const form of NOISE_FORMS) {
        const h = heating(spectrum, form, KAPPA, SIGMA2, light)

        metrics[`${tag}${form.name}Heating`] = h.total
        metrics[`${tag}${form.name}LightHeating`] = h.light
        metrics[`${tag}${form.name}MassiveHeating`] = h.massive
        metrics[`${tag}${form.name}OverFirst`] = h.total / first
        metrics[`${tag}${form.name}LightOverFirstLight`] = h.light / heating(spectrum, NOISE_FORMS[1]!, KAPPA, SIGMA2, light).light

        if (form.name === 'wave') {
          waveLargest = Math.max(waveLargest, h.largestOnShell)
          metrics[`${tag}WaveLargestOnShell`] = h.largestOnShell
        }
      }

      // what the wave form leaves: the rounding of its spatial term, white at 1 / (12 q^2)
      metrics[`${tag}WaveRoundingHeating`] = (0.5 * traceM) / (12 * Q * Q)
      metrics[`${tag}TraceM`] = traceM

      for (const order of [2, 3]) {
        const taps = optimalTaps(spectrum, KAPPA, order)
        const h = heating(spectrum, { taps, spread: false }, KAPPA, SIGMA2, light)

        taps.forEach((t, j) => (metrics[`${tag}OptimalOrder${order}Tap${j + 1}`] = t))
        metrics[`${tag}OptimalOrder${order}OverFirst`] = h.total / first
      }

      // the best reversible notch 1 - c z + z^2 (added after the first run, no gate changed)
      const c = notchCoefficient(spectrum, KAPPA)
      const notch = heating(spectrum, { taps: [-c, 1], spread: false }, KAPPA, SIGMA2, light)

      metrics[`${tag}NotchCoefficient`] = c
      metrics[`${tag}NotchOverFirst`] = notch.total / first
      metrics[`${tag}NotchLightOverFirstLight`] = notch.light / heating(spectrum, NOISE_FORMS[1]!, KAPPA, SIGMA2, light).light

      if (spectrum.gaugeLeak >= 0) {
        metrics[`${tag}GaugeLeak`] = spectrum.gaugeLeak
      }
    }

    // the 9 husk branches at m1 = (1, 0, 0): lambda and |NTF|^2 of each form
    const husk = spectra[0]![1]
    const m1 = 1

    for (let b = 0; b < 9; b++) {
      const lambda = husk.lambda[m1 * 9 + b] ?? 0

      metrics[`m1Branch${b}Lambda`] = lambda
      metrics[`m1Branch${b}Omega`] = leapfrogOmega(KAPPA, lambda)

      for (const form of NOISE_FORMS.slice(1)) {
        metrics[`m1Branch${b}${form.name}Power`] = ntfPower(form, leapfrogOmega(KAPPA, lambda), lambda, KAPPA)
      }
    }

    const firstF1 = metrics['bulk4firstHeating'] ?? 0
    const calibration = firstF1 / MEASURED_FIRST_F1

    metrics['g3PredictedFirstF1'] = firstF1
    metrics['g3PredictedOverMeasured'] = calibration

    for (const name of ['second', 'third', 'wave']) {
      metrics[`predictedF1${name}`] = MEASURED_FIRST_F1 * (metrics[`bulk4${name}OverFirst`] ?? 0)
    }

    metrics['predictedF1OptimalOrder2'] = MEASURED_FIRST_F1 * (metrics['bulk4OptimalOrder2OverFirst'] ?? 0)
    metrics['predictedF1OptimalOrder3'] = MEASURED_FIRST_F1 * (metrics['bulk4OptimalOrder3OverFirst'] ?? 0)
    metrics['predictedF1Notch'] = MEASURED_FIRST_F1 * (metrics['bulk4NotchOverFirst'] ?? 0)
    metrics['heatingGate'] = E164_F1 / 2

    const gaugeLeak = metrics['bulk8GaugeLeak'] ?? 1
    const okG1 = waveLargest < 1e-12
    const okG2 = gaugeLeak < 1e-12
    const okG3 = Math.abs(calibration - 1) <= 0.3

    return verdict({
      status: okG1 && okG2 && okG3 ? 'pass' : okG1 && okG2 ? 'partial' : 'fail',
      claim:
        "the wave form's noise transfer function vanishes on every branch's shell of the bulk and the husk, no curl kick reaches a pure-gauge direction, and the white-noise model reproduces E-FRC-0181's first-order heating within 30 percent, so the ratios it gives for every other form are predictions worth testing",
      metrics: { ...metrics, gateG1: okG1 ? 1 : 0, gateG2: okG2 ? 1 : 0, gateG3: okG3 ? 1 : 0 },
      notes:
        "L2, exact symbol, deterministic. Run 1 (tmp/frc0183.log) passed all three gates. The notch section (the best reversible 1 - c z + z^2) was added after run 1 and reported in run 2 (tmp/frc0183-run2.log), no gate changed. G1: the wave NTF is at most 3.8e-16 on every shell of the side-4 and side-8 bulk and the side-8 husk. G2: max |M g| / |g| = 2.3e-14 on the side-8 bulk, so no curl kick has a gauge part. G3: the white-noise model gives first-order heating kappa tr(M^2) / 24 = 628.28 per beat on the F1 box against E-FRC-0181's measured 722 (ratio 0.87). Ratios to first order on the side-4 box: (1 - z)^2 0.663, (1 - z)^3 0.462 (F1 predicted 478 and 333, both above the 285 gate), the notch 0.0491 (c = 1.38644, F1 predicted 35, but 0.43 of first order's noise still on the photon branches), the best free FIR of order 2 and 3 0.048 and 0.020 (not reversible: last tap 0.971 and -0.768), the wave form exactly 0 plus its rounding, 2.4e-7 per beat. On the husk the same ratios hold within 3 percent. Why time shaping alone stalls: at husk m1 the photon has kappa lambda = 0.0248 but the six massive branches have kappa lambda 0.71 to 0.74 (omega 0.87 to 0.89 rad), and 94 percent of the first-order heating is massive, so each order of (1 - z) removes only about a quarter of it.",
    })
  },
})
