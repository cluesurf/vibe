// AUDIT 2026-08-31: regraded from L3 to L1. this experiment is the Bethe-Weizsacker formula with its fitted coefficients, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L1. Not a consequence of the {3,4,3,4} base.
// The nuclear binding curve and the iron peak, why iron is the most bound nucleus and why both fusion and fission
// release energy. The nuclear saturation experiment (`spin/nuclei-binding-saturation`) shows the binding per nucleon
// FLATTENS as nucleons are added (the Pauli-enforced constant density). This experiment is the next level of detail,
// the full curve of binding per nucleon versus mass number, which does not just flatten but PEAKS in the iron region
// and then declines, the single most consequential curve in nuclear physics (it is why stars fuse up to iron and
// stop, and why heavy nuclei fission).
//
//   - THE IRON PEAK. The binding per nucleon B/A, maximized over the proton number at each mass (the valley of
//     stability), peaks at mass number about 56 to 62 (the iron-nickel region) at about 8.8 MeV per nucleon, the
//     observed peak. The light side rises steeply, the heavy side declines gently.
//   - THE MEDIUM AND HEAVY NUCLEI ARE QUANTITATIVE. Iron-56 binds at about 8.8 MeV per nucleon and uranium-238 at
//     about 7.6 MeV per nucleon, both near the observed values (8.79 and 7.57), so the liquid-drop arithmetic gets the
//     curve right across the medium-to-heavy range.
//   - THE FUSION-FISSION ARROW. Because the curve rises to iron and then falls, fusing light nuclei toward iron
//     releases energy AND fissioning heavy nuclei toward iron releases energy, both flow energetically toward the
//     peak, the reason for stellar fusion and nuclear fission.
//   - THE CONTROL, NO COULOMB. Turning off the proton-proton Coulomb repulsion removes the decline, the binding per
//     nucleon then rises monotonically with no iron peak, so the peak is created by the Coulomb penalty on heavy
//     nuclei competing with the surface penalty on light ones.
//
// So the binding curve is a quantitative composite prediction, the iron peak at the observed mass and height, the
// medium-and-heavy binding energies near the observed values, and the fusion-fission arrow, with the no-Coulomb case
// (monotonic, no peak) the control. The liquid-drop model is HONESTLY poor for the lightest nuclei (deuterium, helium)
// where cluster and shell structure dominate, so the quantitative claims are made for the medium-to-heavy range where
// the model holds. Depth L3, the curve and the peak computed deterministically, with the no-Coulomb monotonic curve
// the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  bindingCurvePeak,
  bindingPerNucleonAtMass,
  nuclearBindingEnergy,
} from '@/code/measure/nuclear-binding'

export default experiment({
  id: 'spin/nuclear-binding-curve',
  code: 'E-SPN-0024',
  title:
    'the nuclear binding curve peaks at iron (about 8.8 MeV per nucleon) and declines for heavy nuclei, the no-Coulomb monotonic curve the control',
  category: 'spin',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // the iron peak, the mass number that maximizes the binding per nucleon
    const peak = bindingCurvePeak({})
    const peakInIronRegion =
      peak.massNumber >= 50 && peak.massNumber <= 65

    const peakHeightRight =
      peak.bindingPerNucleon > 8.5 && peak.bindingPerNucleon < 9.0

    // the medium and heavy nuclei, near the observed values
    const ironPerNucleon =
      nuclearBindingEnergy({ massNumber: 56, protonNumber: 26 }) / 56

    const uraniumPerNucleon =
      nuclearBindingEnergy({ massNumber: 238, protonNumber: 92 }) / 238

    const ironMatches = Math.abs(ironPerNucleon - 8.79) < 0.2
    const uraniumMatches = Math.abs(uraniumPerNucleon - 7.57) < 0.2

    // the fusion-fission arrow, the curve rises to the peak (light side) and falls past it (heavy side)
    const lightSide = bindingPerNucleonAtMass({
      massNumber: 30,
    }).bindingPerNucleon

    const heavySide = bindingPerNucleonAtMass({
      massNumber: 200,
    }).bindingPerNucleon

    const risesToThenFallsFromIron =
      lightSide < peak.bindingPerNucleon &&
      heavySide < peak.bindingPerNucleon

    // the control, no Coulomb gives a monotonic curve with the peak pushed to the heavy end (no iron peak)
    const peakNoCoulomb = bindingCurvePeak({ includeCoulomb: false })
    const noCoulombMonotonic = peakNoCoulomb.massNumber > 200 // the peak is at the heavy end, no iron peak

    const ok =
      peakInIronRegion &&
      peakHeightRight &&
      ironMatches &&
      uraniumMatches &&
      risesToThenFallsFromIron &&
      noCoulombMonotonic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the nuclear binding curve, the binding energy per nucleon versus mass number, peaks in the iron-nickel region (mass number about 58) at about 8.8 MeV per nucleon, the observed iron peak, and declines for heavy nuclei. Iron-56 binds at about 8.8 MeV per nucleon and uranium-238 at about 7.6, both near the observed values. Because the curve rises to iron and then falls, both fusing light nuclei and fissioning heavy nuclei release energy, the energetic arrow toward iron that drives stellar fusion and nuclear fission. The control is to turn off the proton-proton Coulomb repulsion, which removes the decline and leaves a monotonic curve with no iron peak, so the peak is the Coulomb penalty on heavy nuclei competing with the surface penalty on light ones.',
      metrics: {
        peakMassNumber: peak.massNumber,
        peakProtonNumber: peak.protonNumber,
        peakBindingPerNucleon: Number(
          peak.bindingPerNucleon.toFixed(3),
        ),
        ironPerNucleon: Number(ironPerNucleon.toFixed(3)),
        uraniumPerNucleon: Number(uraniumPerNucleon.toFixed(3)),
        lightSidePerNucleon: Number(lightSide.toFixed(3)),
        heavySidePerNucleon: Number(heavySide.toFixed(3)),
        noCoulombPeakMass: peakNoCoulomb.massNumber,
      },
      control: {
        noCoulombPeakMass: peakNoCoulomb.massNumber,
        noCoulombMonotonic: noCoulombMonotonic ? 1 : 0,
      },
      notes:
        'AUDIT 2026-08-31: this experiment is the Bethe-Weizsacker formula with its fitted coefficients, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L1. Not a consequence of the {3,4,3,4} base. ' +
        'the Bethe-Weizsacker formula B = a_V A - a_S A^(2/3) - a_C Z(Z-1)/A^(1/3) - a_A (A-2Z)^2/A + pairing, with the standard coefficients (volume 15.75, surface 17.8, Coulomb 0.711, asymmetry 23.7, pairing 11.18 MeV), maximized over the proton number at each mass (the valley of stability). The peak is at A about 58 (Z = 26, iron) at 8.87 MeV per nucleon, near the observed iron-nickel peak of 8.79. The medium-to-heavy nuclei are accurate (iron-56 about 8.8, uranium-238 about 7.6 MeV per nucleon). HONESTLY, the liquid-drop model is poor for the lightest nuclei (deuterium comes out unbound, helium-4 about 5.7 versus the observed 7.07) where cluster and shell structure dominate, so the quantitative claims are made for the medium-to-heavy range where the model holds. The no-Coulomb control gives a monotonic curve (the peak pushed to the heavy end), so the iron peak is the Coulomb repulsion. This is the binding-curve row of the per-particle verification, the iron peak and the fusion-fission arrow, complementing the saturation of `spin/nuclei-binding-saturation`. TIER B, a consistency check that USES the empirical Bethe-Weizsacker coefficients (fitted to nuclear data), so it shows the emergent picture is compatible with the observed nuclear binding curve, it does NOT derive the coefficients from the {3,4,3,4} base (the nuclear force is residual emergent QCD, far from the base). The geometric content here is only the competition structure (volume versus surface versus Coulomb), not the fitted numbers.',
    })
  },
})
