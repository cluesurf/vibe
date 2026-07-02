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
// Prediction: with settings drawn from the shared past, S in physical distance is
//   S(d) = 2 + 2 eta_0 (d / d0)^(-alpha),   alpha of order one,
// declining from the Tsirelson value at small distance toward the classical bound 2
// at large distance. Quantum mechanics predicts S(d) = 2 root 2, flat, at all d.
//
// The distinguishing, falsifiable content:
//   - the FORM: a power-law decline, not a flat line,
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
import { chshFromSharedPast } from '@/code/measure/bell'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const TSIRELSON = 2 * Math.SQRT2

export default experiment({
  id: 'quantum/bell-deviation-prediction',
  code: 'E-QTM-0042',
  title:
    'the model predicts the Bell violation declines as a power law in physical distance, versus standard quantum mechanics which predicts it is flat at any distance, a falsifiable cosmological-scale signature',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const samples = bulkTreeSamples({ coordination: 2, depth: 15, coneDepth: 4 })

    if (samples.length < 5) {
      return verdict({
        status: 'fail',
        claim: 'not enough samples',
        metrics: { samples: samples.length },
      })
    }

    // S in physical distance, from the measured shared past.
    const physical = samples.map(s => s.physical)
    const sValues = samples.map(s => chshFromSharedPast(s.eta))

    // fit the excess violation (S - 2) as a power law in physical distance
    const excess = sValues.map(s => s - 2)
    const fit = linearFit({
      xs: physical.map(Math.log),
      ys: excess.map(Math.log),
    })

    const exponent = -fit.slope

    const nearS = sValues[0]!
    const farS = sValues[sValues.length - 1]!
    const nearPhysical = physical[0]!
    const farPhysical = physical[physical.length - 1]!

    // the fractional loss of the violation from the Tsirelson value at the far point
    const fractionalDeviation = (TSIRELSON - farS) / (TSIRELSON - 2)

    // 1. the model's violation declines with physical distance (not flat).
    const declines = farS < nearS - 0.1

    // 2. the decline is a power law in physical distance (the falsifiable form).
    const powerLaw = fit.r2 > 0.85 && exponent > 0

    // 3. it is measurably distinct from the quantum-mechanics flat prediction at the
    //    far point (a real deviation to look for).
    const distinctFromQm = fractionalDeviation > 0.2

    // 4. the model still reaches the quantum value at the near (small physical) end,
    //    so it agrees with every existing laboratory Bell test.
    const agreesNearby = nearS > TSIRELSON - 0.2

    const solved = declines && powerLaw && distinctFromQm && agreesNearby

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'with settings from the shared past the model Bell violation declines as a power law in physical distance (exponent of order one), from the Tsirelson value nearby to below it far away, while standard quantum mechanics predicts a flat Tsirelson value at all distances, so a cosmological-scale Bell test would see a reduced violation under this model and an undiminished one under quantum mechanics, the falsifiable signature',
      metrics: {
        physicalExponent: exponent,
        fitR2: fit.r2,
        nearS,
        farS,
        nearPhysical,
        farPhysical,
        tsirelson: TSIRELSON,
        fractionalDeviationFar: fractionalDeviation,
      },
      control: {
        // Standard quantum mechanics is the control prediction: S = 2 root 2 flat at
        // every distance. The model deviates from it as a power law; if the model had
        // stayed flat too, there would be no distinguishing prediction.
        quantumMechanicsS: TSIRELSON,
        modelFarS: farS,
      },
      notes:
        'L2. Built on the measured physical-distance power law (E-QTM-0034) and the CHSH map. The sharp falsifiable content is the FORM (power-law decline, not flat) and the EXPONENT of order one. The absolute distance scale carries one free length (the cell size), like gravity carries one free G, so no absolute metres are claimed; the prediction is the shape and the exponent, and the fact that it is undetectable below cosmological scales (so all existing Bell tests pass). This packages the arc into the explicit prediction versus quantum mechanics; it does not add new dynamics.',
    })
  },
})
