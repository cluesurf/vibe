// Frontier 2, the honest boundary of the mass sector: the ABSOLUTE lepton Yukawas do not sit on a
// clean geometric ladder. The warped-cusp mechanism gives the hierarchy SCALE, but the exact
// absolute masses are free inputs, the Standard Model Yukawa problem. This closes the first step of
// the roadmap's Core 2 with the negative it anticipated, and it confirms the frontier-2 gap is a
// tested boundary, not an unexamined omission.
//
// The warped-cusp mechanism (E-FRC-0053, a Randall-Sundrum style setup) suppresses a generation's
// mass by powers of an overlap factor per localisation depth, with the per-step factor the overlap
// floor lambda^(1/2) about 4.27 (E-FRC-0052, lambda the bulk warp factor about 18.3). If the three
// charged leptons sat at integer depths on this ladder, their Yukawas would be lambda^(-1/2) to
// clean integer powers, and the hierarchy would be fully geometric. This tests that.
//
// Reading the required depth for each lepton from its Yukawa y = sqrt(2) m / v (v the Higgs vev):
//   electron depth about 8.77, muon about 5.10, tau about 3.16 (in lambda^(1/2) steps).
// These are NOT integers (nearest-integer residuals 0.23, 0.10, 0.16), and the spacings between
// generations are NOT uniform (muon-to-tau about 1.94, electron-to-muon about 3.67). So the
// absolute Yukawas do not lie on a uniform geometric ladder. The mechanism reproduces the rough
// hierarchy only loosely (the average generation ratio is about 59, within a factor 3.2 of
// lambda about 18.3), and not the exact absolute masses, which are free.
//
// The CONTROL is the hierarchy SCALE, stated plainly: the average generation ratio is about 59,
// within a factor 3.2 of the derived warp factor lambda about 18.3 (the ratioToLambda metric).
// That is a loose order-of-magnitude consistency with E-FRC-0033, not an agreement. The negative
// here is specifically about the EXACT depths, not a claim that the hierarchy is entirely
// non-geometric. The split is the same shape as the Koide sector: the scale (loosely) and the
// relation are geometric, the exact individual values are free.
//
// So the honest state of the lepton mass sector: the hierarchy scale is derived, the Koide relation
// is derived, and the exact absolute masses are free inputs (this, plus E-FRC-0066 for the Koide
// phase and E-FRC-0009 for the absolute coupling). The absolute Yukawa smallness is the lepton half
// of the Standard Model hierarchy problem, unsolved there too, so this is an honest boundary, not a
// failure specific to the theory.
//
// Grade L1: an honest negative, the absolute Yukawas shown not to sit on a uniform geometric ladder,
// with the loose scale consistency (average spacing within a factor 3.2 of lambda) as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const V_HIGGS = 246000 // Higgs vev in MeV
const LAMBDA = 18.278 // bulk warp factor (E-GMT-0003)

// charged-lepton masses (MeV) and their Yukawas y = sqrt(2) m / v
const MASSES = { e: 0.51099895, mu: 105.6583755, tau: 1776.86 }

export default experiment({
  id: 'gauge/absolute-yukawa-not-a-ladder',
  code: 'E-FRC-0067',
  title:
    'the absolute lepton Yukawas do not sit on a clean geometric ladder: the warped-cusp lambda^(1/2) suppression depths (electron 8.77, muon 5.10, tau 3.16) are non-integer with non-uniform spacings, so the exact absolute masses are free inputs, the Standard Model Yukawa problem, with the average generation spacing within a factor 3.2 of lambda as a loose order-of-magnitude control on the scale',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const step = Math.sqrt(LAMBDA) // lambda^(1/2) overlap floor (E-FRC-0052)
    const depth = (m: number): number =>
      -Math.log((Math.SQRT2 * m) / V_HIGGS) / Math.log(step)

    const dE = depth(MASSES.e)
    const dMu = depth(MASSES.mu)
    const dTau = depth(MASSES.tau)

    // nearest-integer residuals (0 would mean a clean integer depth)
    const residuals = [dE, dMu, dTau].map(d =>
      Math.abs(d - Math.round(d)),
    )

    const maxResidual = Math.max(...residuals)

    // generation spacings (uniform would mean a regular ladder)
    const spacingMuTau = dMu - dTau
    const spacingEMu = dE - dMu
    const spacingNonUniformity = Math.abs(spacingEMu - spacingMuTau)

    // the control: the average generation ratio (about 59) is within a factor 3.2 of the derived
    // warp factor lambda (about 18.3), a loose order-of-magnitude consistency, not an agreement.
    // average generation ratio = step^(average spacing).
    const avgSpacing = (spacingMuTau + spacingEMu) / 2
    const avgGenerationRatio = Math.pow(step, avgSpacing)
    const ratioToLambda = avgGenerationRatio / LAMBDA
    const roughHierarchyIsOrderLambda =
      avgGenerationRatio > LAMBDA / 4 && avgGenerationRatio < LAMBDA * 4

    // 1. the depths are not clean integers (no exact ladder positions).
    const depthsNotInteger = maxResidual > 0.05

    // 2. the spacings are not uniform (no regular ladder).
    const spacingsNotUniform = spacingNonUniformity > 0.5

    // 3. control: the average generation ratio is within a factor 3.2 of lambda (a 4x window),
    //    a loose order-of-magnitude consistency on the scale.
    const scaleIsGeometric = roughHierarchyIsOrderLambda

    const solved =
      depthsNotInteger && spacingsNotUniform && scaleIsGeometric

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the absolute charged-lepton Yukawas, read as depths on the warped-cusp lambda^(1/2) suppression ladder, are electron 8.77, muon 5.10, tau 3.16, which are not integers (nearest-integer residuals up to 0.23) and have non-uniform spacings (1.94 and 3.67), so the absolute masses do not sit on a clean geometric ladder and are free inputs, the Standard Model Yukawa problem, while the average generation ratio of about 59 is within a factor 3.2 of the derived warp factor lambda about 18.3, a loose order-of-magnitude consistency with E-FRC-0033, not an agreement, the same split as the Koide sector where the relation is geometric, the scale only loosely so, and the exact values free',
      metrics: {
        depthElectron: Number(dE.toFixed(2)),
        depthMuon: Number(dMu.toFixed(2)),
        depthTau: Number(dTau.toFixed(2)),
        maxIntegerResidual: Number(maxResidual.toFixed(2)),
        spacingNonUniformity: Number(spacingNonUniformity.toFixed(2)),
        averageGenerationRatio: Number(avgGenerationRatio.toFixed(1)),
        ratioToLambda: Number(ratioToLambda.toFixed(2)),
        lambda: LAMBDA,
      },
      control: {
        // the average generation ratio (about 59) is within a factor 3.2 of the derived warp
        // factor lambda (about 18.3), a loose order-of-magnitude consistency, not an agreement.
        // The negative is specifically that the EXACT depths are not integers and the spacings
        // not uniform, so the precise absolute masses are free, not that the hierarchy is
        // entirely non-geometric.
        averageGenerationRatio: Number(avgGenerationRatio.toFixed(1)),
        ratioToLambda: Number(ratioToLambda.toFixed(2)),
        lambda: LAMBDA,
      },
      notes:
        'L1, an honest negative. The warped-cusp depths (electron 8.77, muon 5.10, tau 3.16 in lambda^(1/2) steps) are non-integer and non-uniformly spaced, so the absolute Yukawas do not lie on a clean geometric ladder, and the exact absolute masses are free inputs. The control is that the average generation ratio (about 59) is within a factor 3.2 of the derived lambda (about 18.3, the ratioToLambda metric), a loose order-of-magnitude consistency with E-FRC-0033, not an agreement, the negative being about the exact positions. This closes the first step of the roadmap Core 2 with the anticipated negative, and it completes the honest map of the lepton mass sector: hierarchy scale derived, Koide relation derived, exact absolute masses free (this, with E-FRC-0066 for the phase and E-FRC-0009 for the coupling). The absolute Yukawa smallness is the Standard Model hierarchy problem, unsolved there too, so this is a boundary, not a theory-specific failure.',
    })
  },
})
