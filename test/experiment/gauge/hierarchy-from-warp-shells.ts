// Frontier 2 and 5, the two remaining free scales, restated: the absolute electroweak-Planck
// hierarchy and the inflation amplitude scale, re-expressed as logarithms base lambda (the bulk
// warp factor, E-GMT-0003), are modest order-ten shell counts. This is a REFORMULATION, not a
// generation: the shell counts are the observed hierarchies rewritten as log base lambda of the
// observed ratios, nothing here is produced by dynamics.
//
// The Randall-Sundrum framing is the INTERPRETATION, and the de-exponentiation reading is still
// worth stating: if a field sits d warp shells deep in the warped cusp (E-FRC-0053), its scale is
// M_Planck times lambda^(-d), so a tuning of one part in 1e17 reads as a shell count of about 13.
// Reading the observed scales this way:
//   - the electroweak scale v = 246 GeV sits at v / M_Planck about 2e-17, which is lambda to the
//     power minus 13.2, so about 13 warp shells below the Planck scale,
//   - the electron mass sits at about 4e-23, lambda to the minus 17.7, about 18 shells,
//   - the inflation amplitude scale, the R-squared scalaron mass about 1e-5 M_Planck (E-CSM-0048),
//     sits at lambda to the minus 4.0, about 4 shells.
// The reformulation reduces the fine-tuning question to a shell-count question, it does not answer
// it: the shell counts (13, 18, 4) are read off the data, and nothing in this experiment derives
// them. Randall-Sundrum leaves the brane separation to a stabilization mechanism (Goldberger-Wise)
// and this theory leaves it to the mesh depth.
//
// The audit point, recorded honestly: the pass gates accept any lambda from about 8 to 2183 (the
// lambdaSensitivity metrics below measure this range in code), so the specific lambda about 18.3
// does no work in the verdict. Any warp factor in that wide window would pass, which is exactly
// what a log restatement means.
//
// Grade L1: a consistency reformulation. The observed hierarchies re-expressed as warp-shell
// counts, with the Randall-Sundrum de-exponentiation as the interpretation and the direct 1e-17
// fine-tuning as the comparison, no quantity produced by dynamics.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const M_PLANCK = 1.22e28 // eV
const V_EW = 246e9 // electroweak scale, eV
const M_ELECTRON = 0.511e6 // eV
const INFLATION_SCALE = 1e-5 * M_PLANCK // R-squared scalaron mass (E-CSM-0048)
const LAMBDA = 18.278 // bulk warp factor per shell (E-GMT-0003)

// the warp depth (shell count) that a scale corresponds to under a given warp factor
function warpShellsFor(scale: number, lambda: number): number {
  return Math.log(M_PLANCK / scale) / Math.log(lambda)
}

// the warp depth under the theory's lambda
function warpShells(scale: number): number {
  return warpShellsFor(scale, LAMBDA)
}

// the pass gates as a function of lambda, so the sensitivity of the verdict to lambda is measured
// in code rather than asserted
function gatesPass(lambda: number): boolean {
  const electroweak = warpShellsFor(V_EW, lambda)
  const electron = warpShellsFor(M_ELECTRON, lambda)
  const inflation = warpShellsFor(INFLATION_SCALE, lambda)

  return (
    electroweak > 5 &&
    electroweak < 25 &&
    electron > 5 &&
    electron < 25 &&
    inflation > 1 &&
    inflation < 10 &&
    electroweak < 20
  )
}

// scan lambda on a fine deterministic log grid and record the passing range
function lambdaPassRange(): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY
  let max = 0

  const steps = 20000
  const logLow = Math.log(2)
  const logHigh = Math.log(10000)

  for (let i = 0; i <= steps; i++) {
    const lambda = Math.exp(logLow + ((logHigh - logLow) * i) / steps)

    if (gatesPass(lambda)) {
      if (lambda < min) {
        min = lambda
      }

      if (lambda > max) {
        max = lambda
      }
    }
  }

  return { min, max }
}

export default experiment({
  id: 'gauge/hierarchy-from-warp-shells',
  code: 'E-FRC-0068',
  title:
    'the electroweak-Planck hierarchy and the inflation amplitude scale, re-expressed as logarithms base lambda, are modest shell counts (about 13 and 4), a Randall-Sundrum style reformulation that reduces the fine-tuning question to a shell-count question, not a generation of the hierarchy, and the pass gates accept any lambda from about 8 to 2183 so lambda itself does no work here',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const electroweakShells = warpShells(V_EW)
    const electronShells = warpShells(M_ELECTRON)
    const inflationShells = warpShells(INFLATION_SCALE)

    // the direct fine-tuning (the comparison): the electroweak/Planck ratio in orders of magnitude
    const electroweakTuningDigits = Math.log10(M_PLANCK / V_EW)

    // the de-exponentiation reading: 17 tuning digits read as a shell count of about 13
    const deExponentiationFactor =
      electroweakTuningDigits / electroweakShells

    // the lambda sensitivity of the verdict: the range of warp factors the gates accept
    const passRange = lambdaPassRange()
    const lambdaSensitivity = passRange.max / passRange.min

    // 1. the electroweak scale, in log base lambda, is a modest shell count (order ten).
    const electroweakIsModestShells =
      electroweakShells > 5 && electroweakShells < 25

    // 2. the electron and the inflation scale are also modest shell counts in the same reading.
    const allModestShells =
      electronShells > 5 &&
      electronShells < 25 &&
      inflationShells > 1 &&
      inflationShells < 10

    // 3. the de-exponentiation reading holds: 17 tuning digits correspond to a shell count of 13
    //    (comparison: the direct tuning). This is a restatement of the same observed ratio.
    const deExponentiated =
      electroweakTuningDigits > 15 && electroweakShells < 20

    const solved =
      electroweakIsModestShells && allModestShells && deExponentiated

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the electroweak scale sits about 13 warp shells below the Planck scale (the observed ratio 2e-17 equals the warp factor lambda to the power minus 13.2), the electron about 18 shells, and the inflation amplitude scale about 4 shells, where the shell counts are the observed hierarchies re-expressed as logarithms base lambda, a reformulation rather than a generation, whose Randall-Sundrum interpretation (a field d shells deep in the warped cusp is suppressed by lambda to the minus d) reduces the fine-tuning question of one part in 1e17 to a shell-count question of about 13, with the shell counts read off the data and not derived, and with the pass gates accepting any lambda from about 8 to 2183 so lambda itself does no work in the verdict',
      metrics: {
        electroweakShells: Number(electroweakShells.toFixed(1)),
        electronShells: Number(electronShells.toFixed(1)),
        inflationShells: Number(inflationShells.toFixed(1)),
        electroweakTuningDigits: Number(
          electroweakTuningDigits.toFixed(1),
        ),
        deExponentiationFactor: Number(
          deExponentiationFactor.toFixed(2),
        ),
        lambda: LAMBDA,
        lambdaPassMin: Number(passRange.min.toFixed(1)),
        lambdaPassMax: Number(passRange.max.toFixed(0)),
        lambdaSensitivity: Number(lambdaSensitivity.toFixed(0)),
      },
      control: {
        // without the warp reading, setting the electroweak scale requires tuning a dimensionless
        // ratio to 2e-17, about 17 orders of magnitude. In log base lambda the same ratio reads as
        // a shell count of about 13. The de-exponentiation is a re-expression of the same number.
        electroweakTuningDigits: Number(
          electroweakTuningDigits.toFixed(1),
        ),
        electroweakShells: Number(electroweakShells.toFixed(1)),
      },
      notes:
        'L1, a reformulation. The observed electroweak/Planck ratio (2e-17) is lambda to the minus 13.2, the electron 4e-23 is lambda to the minus 17.7, and the inflation scale 1e-5 M_Planck is lambda to the minus 4.0 (lambda from E-GMT-0003, warp mechanism from E-FRC-0053). These shell counts are the observed hierarchies re-expressed as logarithms base lambda, nothing here is produced by dynamics. The Randall-Sundrum framing is the interpretation, and the de-exponentiation reading is worth stating: a 1e-17 tuning becomes a shell-count question of about 13. But the reformulation reduces the fine-tuning question to a shell-count question, it does not answer it: the shell counts (13, 18, 4) are read off the data, the residual Randall-Sundrum leaves to a stabilization mechanism and this theory leaves to the mesh depth. Lambda sensitivity, measured in code: the pass gates accept any lambda from about 8 (lambdaPassMin) to about 2183 (lambdaPassMax), a factor of about 280 (lambdaSensitivity), so the specific lambda 18.3 does no work in the verdict. That wide window is what a log restatement means.',
    })
  },
})
