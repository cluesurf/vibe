// SM6 / C2, THE WEAK MIXING ANGLE at M_Z from the 3/8 unification condition. The bare value
// sin^2(theta_W) = 3/8 at unification is pure group theory from the so(10) 16-spinor charges
// (gauge/electroweak-prediction, L1). This experiment runs it down to M_Z with the known
// Georgi-Quinn-Weinberg one-loop machinery: demanding that the three couplings meet at one scale
// and taking the two measured couplings alpha_em and alpha_s as input, sin^2(theta_W) at M_Z is
// the output of the running.
//
// HONEST accounting of the inputs: the one-loop beta coefficients are typed in as a discrete
// content CHOICE. With the MSSM-like coefficients (33/5, 1, -3) the output is near the measured
// 0.231, with the bare Standard Model coefficients (41/10, -19/6, -7) it is near 0.207 (the known
// miss). The choice between the two content sets is what selects 0.231 over 0.207, a one-bit fit.
// This is the classic result that MSSM content unifies where SM content does not
// (Amaldi, de Boer, Furstenau 1991), reproduced here, not a new derivation. The discriminating
// control, a wrong hypercharge normalization (a hand-altered charge assignment), predicts a
// clearly wrong angle, so the 3/8 structure is doing real work in the computation.
//
// Grade L2: correct known physics (Georgi-Quinn-Weinberg running from the group-theoretic 3/8)
// with a one-bit content choice as input, matching the measured angle, with a discriminating
// control on the hypercharge normalization.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weinbergAngleAtUnification } from '@/code/measure/standard-model-charges'
import { predictWeinbergAngle } from '@/code/dynamics/renormalization-group'

// measured inputs at M_Z (these two only, sin^2 is NOT an input)
const ALPHA_EM_INVERSE = 127.95
const ALPHA_STRONG_INVERSE = 1 / 0.1184
const BETA_SM: [number, number, number] = [41 / 10, -19 / 6, -7]
const BETA_MSSM: [number, number, number] = [33 / 5, 1, -3]

export default experiment({
  id: 'gauge/weak-angle-prediction',
  code: 'E-FRC-0054',
  title:
    'the weak mixing angle at M_Z from 3/8 unification via the known Georgi-Quinn-Weinberg one-loop running, near 0.231 with MSSM-like beta coefficients typed in as a discrete content choice (the choice is what selects 0.231 over the SM 0.207, a one-bit fit)',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const bare = weinbergAngleAtUnification() // 3/8 from the so(10) charges
    const bareIsThreeEighths = Math.abs(bare - 3 / 8) < 1e-9

    // the output, sin^2(theta_W) at M_Z from the two measured couplings + the unification structure
    const predictedMSSM = predictWeinbergAngle({
      alphaEmInverse: ALPHA_EM_INVERSE,
      alphaStrongInverse: ALPHA_STRONG_INVERSE,
      beta: BETA_MSSM,
    })

    const predictedSM = predictWeinbergAngle({
      alphaEmInverse: ALPHA_EM_INVERSE,
      alphaStrongInverse: ALPHA_STRONG_INVERSE,
      beta: BETA_SM,
    })

    // the control, a WRONG hypercharge normalization (not the so(10) 3/5) predicts a clearly different angle
    const predictedWrongCharge = predictWeinbergAngle({
      alphaEmInverse: ALPHA_EM_INVERSE,
      alphaStrongInverse: ALPHA_STRONG_INVERSE,
      beta: BETA_MSSM,
      hyperchargeNorm: 1,
    })

    const measured = 0.2312
    const mssmMatches = Math.abs(predictedMSSM - measured) < 0.005 // within the running's uncertainty
    const controlIsWrong =
      Math.abs(predictedWrongCharge - measured) > 0.02 // the altered charge misses

    const ok = bareIsThreeEighths && mssmMatches && controlIsWrong

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the bare value is exactly 3/8 at unification from the so(10) 16-spinor charges, and the known Georgi-Quinn-Weinberg one-loop running (taking the measured alpha_em and alpha_s as input and demanding the three couplings unify) gives sin^2(theta_W) at M_Z of about 0.231 with MSSM-like beta coefficients and about 0.207 with bare Standard Model coefficients, where the beta coefficients are typed in as a discrete content choice, the one-bit fit that selects 0.231 over 0.207 (the Amaldi-de Boer-Furstenau 1991 MSSM unification result reproduced), while a hand-altered hypercharge normalization predicts a clearly wrong angle, so the 3/8 structure does real work in the computation',
      metrics: {
        bareTimes1000: Math.round(bare * 1000),
        predictedMSSMTimes10000: Math.round(predictedMSSM * 10000),
        predictedSMTimes10000: Math.round(predictedSM * 10000),
        measuredTimes10000: Math.round(measured * 10000),
        wrongChargeTimes10000: Math.round(predictedWrongCharge * 10000),
      },
      control: {
        wrongChargeTimes10000: Math.round(predictedWrongCharge * 10000),
      },
      notes:
        'L2. This is the known Georgi-Quinn-Weinberg one-loop running from the group-theoretic 3/8, with the beta coefficients typed in as a discrete content choice: MSSM-like content (33/5, 1, -3) gives 0.231, bare SM content (41/10, -19/6, -7) gives 0.207 (the known miss, consistent with gauge/rg-unification). The content choice is what selects 0.231 over 0.207, a one-bit fit, the classic Amaldi-de Boer-Furstenau 1991 MSSM unification result, reproduced here rather than newly derived. Only alpha_em and alpha_s are continuous inputs. The bare 3/8 is from gauge/electroweak-prediction. The wrong-hypercharge prediction is the discriminating control.',
    })
  },
})
