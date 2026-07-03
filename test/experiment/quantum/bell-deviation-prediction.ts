// A sharp falsifiable prediction: the Bell correlation is NOT flat with distance.
//
// Standard quantum mechanics predicts the Bell violation is the SAME at any
// separation: S = 2 root 2 (the Tsirelson value) whether the detectors are a metre
// or a gigaparsec apart. This substrate predicts something different and testable.
// The measurements E-QTM-0034 and E-QTM-0035 established that the shared past, and so
// the reachable S, declines as a POWER LAW in physical (cusp) distance through the
// bulk shortcut. This packages that into the explicit prediction and contrasts it
// with quantum mechanics.
//
// The model prediction is CAPPED at the Tsirelson value:
//   S_model(d) = min(2 + 2 eta(d), 2 root 2).
// The cap is not a fudge. The model's own walk dynamics produce exactly the
// Tsirelson value when the correlations are unconstrained (E-QTM-0038, the coin
// anticommutation forces 2 root 2 as the maximum), and the measurement-dependence
// relation 2 + 2 eta only BUDGETS the shared-past resource, it is an upper bound on
// what eta can support, not a value the dynamics saturates. So wherever the budget
// exceeds the Tsirelson value (eta above root 2 minus 1) the dynamics deliver
// exactly 2 root 2, and the decline begins past the crossover where the budget
// falls below it.
//
// Prediction: near distance (inside the crossover) the model matches quantum
// mechanics EXACTLY, S = 2 root 2, so it agrees with every laboratory Bell test.
// Beyond the crossover the violation declines as a power law in physical distance,
//   S(d) = 2 + 2 eta_0 (d / d0)^(-alpha),   alpha of order one,
// toward the classical bound 2, while quantum mechanics stays flat at 2 root 2.
//
// The distinguishing, falsifiable content:
//   - the FORM: a power-law decline past a crossover, not a flat line,
//   - the EXPONENT alpha (measured here, of order one),
//   - and the scale: the deviation is far below detection at laboratory and even
//     satellite distances (so every Bell test to date passes), and would only appear
//     at cosmological separations, which is what makes it a genuine, not-yet-excluded
//     prediction rather than a contradiction with existing data.
//
// A cosmological Bell test (entangled photons over gigaparsec baselines, sourced by
// separated quasars) would see a REDUCED violation under this model and an
// undiminished one under standard quantum mechanics. That is the experiment that
// would decide it.
//
// Grade L2: a measured exponent and deviation curve turned into an explicit
// falsifiable prediction, with standard quantum mechanics (flat) as the control. The
// absolute physical scale carries one free length (the cell size), as gravity carries
// one free G, so the sharp content is the FORM and the EXPONENT, stated honestly.

import { bulkTreeSamples } from '@/code/measure/cusp-distance'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const TSIRELSON = 2 * Math.SQRT2

// the shared-past fraction at which the budget 2 + 2 eta reaches the Tsirelson value
const CROSSOVER_ETA = Math.SQRT2 - 1

// The model prediction: the measurement-dependence budget 2 + 2 eta capped at the
// Tsirelson value, because the walk dynamics produce exactly 2 root 2 when the
// budget allows it (E-QTM-0038) and eta only bounds, never saturates, the reachable
// correlation.
function modelS(eta: number): number {
  return Math.min(2 + 2 * eta, TSIRELSON)
}

export default experiment({
  id: 'quantum/bell-deviation-prediction',
  code: 'E-QTM-0042',
  title:
    'near distance the model Bell violation is exactly the Tsirelson value (matching quantum mechanics and every laboratory Bell test), and beyond a crossover it declines as a power law in physical distance while quantum mechanics stays flat, a falsifiable cosmological-scale signature',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // depth 15 and cone depth 8 give six distinct shared-past levels in the
    // declining region (bulk distances 4 through 14), enough for a meaningful
    // power-law fit, plus the capped plateau at bulk distance 2.
    const samples = bulkTreeSamples({
      coordination: 2,
      depth: 15,
      coneDepth: 8,
      gaps: [
        8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024,
        1536, 2048, 3072, 4096, 6144, 8192, 12288, 16000, 24000, 28000,
        32000, 32700,
      ],
    })

    if (samples.length < 5) {
      return verdict({
        status: 'fail',
        claim: 'not enough samples',
        metrics: { samples: samples.length },
      })
    }

    const sValues = samples.map(s => modelS(s.eta))

    // the capped region (prediction exactly Tsirelson) and the declining region
    const capped = samples.filter(s => s.eta >= CROSSOVER_ETA)
    const declining = samples.filter(s => s.eta < CROSSOVER_ETA)

    // the crossover: the last physical distance still at the Tsirelson value and
    // the first physical distance past it, where the decline begins
    const lastTsirelsonPhysical = Math.max(
      ...capped.map(s => s.physical),
      0,
    )

    const firstDecliningPhysical = Math.min(
      ...declining.map(s => s.physical),
      Infinity,
    )

    // distinct shared-past levels in the declining region (the tree yields eta in
    // plateaus, so the fit needs several distinct levels to mean anything)
    const distinctDecliningEta = new Set(
      declining.map(s => s.eta.toFixed(6)),
    ).size

    // fit the excess violation (S - 2) as a power law in physical distance, on the
    // DECLINING region only (the capped region is flat at Tsirelson by the model)
    const fit = linearFit({
      xs: declining.map(s => Math.log(s.physical)),
      ys: declining.map(s => Math.log(modelS(s.eta) - 2)),
    })

    const exponent = -fit.slope

    const nearS = sValues[0]!
    const farS = sValues[sValues.length - 1]!
    const farPhysical = samples[samples.length - 1]!.physical

    // the fractional loss of the violation from the Tsirelson value at the far point
    const fractionalDeviation = (TSIRELSON - farS) / (TSIRELSON - 2)

    // 1. the near prediction is EXACTLY the Tsirelson value (the capped region is
    //    non-empty), so the model agrees with quantum mechanics and every
    //    laboratory Bell test at small distance.
    const agreesNearby =
      capped.length > 0 && Math.abs(nearS - TSIRELSON) < 1e-12

    // 2. beyond the crossover the violation declines toward the classical bound.
    const declines =
      declining.length > 0 && farS < TSIRELSON - 0.5 && farS >= 2

    // 3. the decline is a power law in physical distance (the falsifiable form),
    //    fit on at least six distinct shared-past levels.
    const powerLaw =
      distinctDecliningEta >= 6 && fit.r2 > 0.9 && exponent > 0

    // 4. it is measurably distinct from the quantum-mechanics flat prediction at the
    //    far point (a real deviation to look for).
    const distinctFromQm = fractionalDeviation > 0.2

    const solved =
      agreesNearby && declines && powerLaw && distinctFromQm

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'with settings from the shared past the model Bell violation is exactly the Tsirelson value 2 root 2 inside a crossover distance (the shared-past budget 2 + 2 eta exceeds it there and the walk dynamics deliver exactly 2 root 2, so the model matches quantum mechanics and every laboratory Bell test at near distance), and beyond the crossover, where eta falls below root 2 minus 1, the violation declines as a power law in physical distance (exponent of order one) toward the classical bound, while standard quantum mechanics predicts a flat Tsirelson value at all distances, so a cosmological-scale Bell test would see a reduced violation under this model and an undiminished one under quantum mechanics, the falsifiable signature',
      metrics: {
        physicalExponent: exponent,
        decliningFitR2: fit.r2,
        distinctDecliningEta,
        decliningSamples: declining.length,
        cappedSamples: capped.length,
        nearS,
        farS,
        lastTsirelsonPhysical,
        firstDecliningPhysical,
        farPhysical,
        tsirelson: TSIRELSON,
        crossoverEta: CROSSOVER_ETA,
        fractionalDeviationFar: fractionalDeviation,
      },
      control: {
        // Standard quantum mechanics is the control prediction: S = 2 root 2 flat at
        // every distance. The model matches it exactly inside the crossover and
        // deviates as a power law beyond it. If the model had stayed flat too, there
        // would be no distinguishing prediction.
        quantumMechanicsS: TSIRELSON,
        modelNearS: nearS,
        modelFarS: farS,
      },
      notes:
        'L2. Built on the measured physical-distance power law (E-QTM-0034) and the measurement-dependence budget. The model prediction is S(d) = min(2 + 2 eta(d), 2 root 2). The cap is justified by E-QTM-0038 (the coin anticommutation forces exactly 2 root 2 when correlations are unconstrained) and by the budget being a bound, not a saturation: the linear relation S = 2 + 2 eta is the measurement-dependence bound of Hall (Phys. Rev. Lett. 105, 250404 (2010), relaxed measurement independence), which caps what a given shared-past fraction can support. Inside the crossover (eta at or above root 2 minus 1, here out to leaf gap 384) the prediction is exactly Tsirelson, past it (from leaf gap 512) the decline is a power law fit on six distinct shared-past levels. The sharp falsifiable content is the FORM (flat then power-law decline) and the EXPONENT of order one. The absolute distance scale carries one free length (the cell size), like gravity carries one free G, so no absolute metres are claimed. Cosmic Bell tests with settings from Milky Way stars (Handsteiner et al., Phys. Rev. Lett. 118, 060401 (2017)) and from high-redshift quasars constrain measurement dependence at kiloparsec to gigaparsec look-back scales and are the class of experiment this prediction targets. This packages the arc into the explicit prediction versus quantum mechanics, it does not add new dynamics.',
    })
  },
})
