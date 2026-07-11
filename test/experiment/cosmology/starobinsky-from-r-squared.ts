// Frontier 5, Core 3: fixing the one remaining number alpha by the R-squared scalaron argument,
// evaluated as arithmetic on the known closed forms.
//
// E-CSM-0047 measured the inflaton shape CLASS (an alpha-attractor, from the mesh being
// hyperbolic), making n_s robust but leaving r = 12 alpha / N^2 with alpha free. This experiment
// evaluates what follows if alpha is fixed to 1 by a second route through the derived gravity.
//
// The argument (PROSE, not computation, see the honest scope below):
//   1. the emergent gravity is Einstein (E-GRV-0015, derived from the measured area law),
//   2. a DISCRETE substrate corrects Einstein by higher-curvature terms, and the LEADING correction
//      (lowest dimension, generic, Lorentz-invariant in the infrared) is R squared,
//   3. Einstein-plus-R-squared gravity carries a scalar degree of freedom, the scalaron, and the
//      scalaron drives Starobinsky inflation,
//   4. Starobinsky inflation IS the alpha = 1 attractor, exactly.
// GIVEN alpha = 1, the code below evaluates the known closed forms n_s = 1 - 2/N and r = 12/N^2
// at the chosen pivot N = 55 and compares them to Planck:
//   n_s = 1 - 2/N about 0.964 (Planck central 0.9649), and
//   r = 12 / N^2 about 0.004 at N = 55, inside the CMB-S4 detectable window (0.001 to 0.06).
//
// SENSITIVITY, made explicit: the Planck n_s agreement depends on the chosen N. The code scans N
// from 40 to 70 and reports the window over which |n_s - 0.9649| < 0.005 holds, which is N = 50 to
// 66. The N = 50 edge passes by only 0.0001, so the agreement is a property of the plausible
// pivot range 50 to 66, not of every N, and the chosen N = 55 sits inside it, not at a knife edge.
//
// HONEST scope: the alpha = 1 / R-squared / Starobinsky equivalences are exact known theory (Tier
// A), and this file only EVALUATES the closed forms at a chosen N, it computes no slow roll and no
// substrate quantity. The R-squared to alpha = 1 step (that the leading discreteness correction is
// R squared with the scalaron as the inflaton) is prose, generic for an emergent Lorentz-invariant
// gravity but not derived from the specific {3,4,3,4} microdynamics. The falsifiable statement
// kept is that r = 12/N^2 lies inside the CMB-S4 window for the whole N range considered.
//
// Grade L1: arithmetic on the known Starobinsky closed forms at a chosen pivot, with the Planck
// agreement window over N computed and reported, and a non-Starobinsky alpha as the control that
// the alpha = 1 value is specific.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const N_PIVOT = 55

// Starobinsky (alpha = 1) closed forms
function starobinsky(nEfolds: number): { ns: number; r: number } {
  return { ns: 1 - 2 / nEfolds, r: 12 / (nEfolds * nEfolds) }
}

export default experiment({
  id: 'cosmology/starobinsky-from-r-squared',
  code: 'E-CSM-0048',
  title:
    'if the inflaton is the R-squared scalaron of the emergent gravity (a prose argument fixing the alpha-attractor alpha = 1), the known closed forms give n_s = 1 - 2/N about 0.964 matching Planck for the whole pivot window N = 50 to 66 (computed by scan) and r = 12/N^2 about 0.004 inside the CMB-S4 window, arithmetic on the standard Starobinsky formulas at a chosen N, leaving only the amplitude scale free',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const o = starobinsky(N_PIVOT)

    // the r bound and the CMB-S4 detectable window
    const inCmbS4Window = o.r > 0.001 && o.r < 0.06

    // a non-Starobinsky alpha-attractor (say alpha = 8) gives a different r, so alpha = 1 is specific
    const rAlpha8 = (12 * 8) / (N_PIVOT * N_PIVOT)

    // SENSITIVITY scan: the N window over which the Planck n_s agreement holds, N from 40 to 70
    const nsTolerance = 0.005
    const passingN: number[] = []

    for (let n = 40; n <= 70; n++) {
      if (Math.abs(starobinsky(n).ns - 0.9649) < nsTolerance)
        passingN.push(n)
    }

    const nsWindowMinN = passingN[0] ?? 0
    const nsWindowMaxN = passingN[passingN.length - 1] ?? 0

    // r stays inside the CMB-S4 window across the whole scanned N range (the falsifiable part)
    let rInWindowAcrossScan = true

    for (let n = 40; n <= 70; n++) {
      const rn = starobinsky(n).r

      if (rn <= 0.001 || rn >= 0.06) rInWindowAcrossScan = false
    }

    // 1. n_s at the chosen pivot matches the Planck central value.
    const nsMatchesPlanck = Math.abs(o.ns - 0.9649) < nsTolerance

    // 2. the Planck agreement holds over a contiguous N window, not only at the chosen pivot,
    //    and the chosen pivot sits strictly inside it (not at the knife edge).
    const windowContiguous =
      passingN.length === nsWindowMaxN - nsWindowMinN + 1

    const pivotInsideWindow =
      windowContiguous &&
      N_PIVOT > nsWindowMinN &&
      N_PIVOT < nsWindowMaxN

    // 3. r is a specific number in the detectable window, and stays in the window across the scan.
    const rSharpAndDetectable =
      inCmbS4Window &&
      Math.abs(o.r - 0.004) < 0.001 &&
      rInWindowAcrossScan

    // 4. the value is specific: a different alpha gives a clearly different r (control).
    const alphaOneIsSpecific = Math.abs(rAlpha8 - o.r) > 0.02

    const solved =
      nsMatchesPlanck &&
      pivotInsideWindow &&
      rSharpAndDetectable &&
      alphaOneIsSpecific

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'given the prose argument that the emergent Einstein gravity (E-GRV-0015) picks up a leading R-squared discreteness correction whose scalaron drives Starobinsky inflation (the alpha = 1 attractor), the known closed forms evaluated here give n_s = 1 - 2/N about 0.964 at the chosen pivot N = 55, matching the Planck central value 0.9649 within 0.005 for every N in the scanned window 50 to 66 (computed, with N = 50 passing by only 0.0001, so the sensitivity is explicit), and r = 12/N^2 about 0.004 inside the CMB-S4 detectable window for the whole scanned range N = 40 to 70, with a different alpha (say 8) giving r about 0.03 as the control that alpha = 1 is specific, this being arithmetic on the standard Starobinsky formulas rather than a slow-roll or substrate computation',
      metrics: {
        ns: Number(o.ns.toFixed(4)),
        planckNs: 0.9649,
        r: Number(o.r.toFixed(5)),
        nsWindowMinN,
        nsWindowMaxN,
        rAlpha8Control: Number(rAlpha8.toFixed(4)),
        cmbS4WindowLow: 0.001,
        cmbS4WindowHigh: 0.06,
      },
      control: {
        // a non-Starobinsky alpha-attractor (alpha = 8) gives r about 0.03, clearly different from
        // the alpha = 1 value 0.004, so fixing alpha = 1 via the R-squared scalaron is a specific
        // claim, not a value that any alpha would give. The r prediction is sharp only because
        // alpha is pinned.
        rAlpha8Control: Number(rAlpha8.toFixed(4)),
        rAlpha1: Number(o.r.toFixed(5)),
      },
      notes:
        'L1. This file EVALUATES the known Starobinsky closed forms n_s = 1 - 2/N and r = 12/N^2 at a chosen pivot N = 55 and compares to Planck. It computes no slow roll and no substrate quantity, and the R-squared to alpha = 1 step (the leading discreteness correction being R squared with the scalaron as inflaton) is prose, generic for an emergent Lorentz-invariant gravity but not derived from the {3,4,3,4} microdynamics. The Tier-A content (the alpha = 1 / R-squared / Starobinsky equivalences) is exact known theory. Sensitivity made explicit: the scan over N from 40 to 70 reports the Planck-agreement window nsWindowMinN to nsWindowMaxN (50 to 66, with the N = 50 edge passing by only 0.0001), so the agreement holds across the plausible pivot range rather than at a knife edge, and the chosen N = 55 sits strictly inside it. The falsifiable statement kept: r = 12/N^2 stays inside the CMB-S4 window (0.001 to 0.06) for the entire scanned range, a near-term test. This agrees with the hyperbolic-field-space route (E-CSM-0047, where the attractor is measured by slow roll). The only free quantity is the R-squared coefficient, which sets the amplitude A_s, not the shape.',
    })
  },
})
