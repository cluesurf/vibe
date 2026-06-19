// SM6 / C2, THE WEAK MIXING ANGLE as a genuine prediction (the crown jewel, the one clean falsifiable number). The
// bare value sin^2(theta_W) = 3/8 at unification is pure group theory from the so(10) 16-spinor charges
// (gauge/electroweak-prediction, L1). This experiment elevates it to a PREDICTION of the LOW-energy value at M_Z.
// Demanding that the three couplings meet at one scale (the 3/8 unification condition) and taking only the two
// measured couplings alpha_em and alpha_s as input, sin^2(theta_W) at M_Z is an OUTPUT, not an input (the
// Georgi-Quinn-Weinberg prediction). With the substrate's MSSM-like content it comes out near the measured 0.231,
// with the bare Standard Model content near 0.207 (the known small miss). The discriminating control, a wrong
// hypercharge normalization (a hand-altered charge assignment) predicts a clearly wrong angle, so the 3/8 structure
// is doing the work. This is C2 of the discovery bets realized, a dimensionless real-world number that could have
// come out wrong, derived not fitted.

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
  title:
    'the weak mixing angle is predicted (not fitted) from 3/8 unification, running to near 0.231 at the Z scale',
  category: 'gauge',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const bare = weinbergAngleAtUnification() // 3/8 from the so(10) charges
    const bareIsThreeEighths = Math.abs(bare - 3 / 8) < 1e-9

    // the prediction, sin^2(theta_W) at M_Z as an output of the two measured couplings + the unification structure
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
        'the weak mixing angle is a genuine prediction, the bare value is exactly 3/8 at unification from the so(10) 16-spinor charges, and taking only the measured alpha_em and alpha_s as input and demanding the three couplings unify, the predicted low-energy sin^2(theta_W) at M_Z is about 0.231 with the substrate MSSM-like content (about 0.207 with the bare Standard Model, the known small miss), matching the measured 0.2312, while a hand-altered hypercharge normalization predicts a clearly wrong angle, so the value is forced by the 3/8 structure and could have come out wrong',
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
        'C2 realized, the one clean falsifiable number. sin^2 is an OUTPUT, not an input (only alpha_em and alpha_s are inputs), so it could have been wrong. The MSSM-content prediction matches 0.231, the bare-SM content gives 0.207 (the known miss, consistent with gauge/rg-unification). The bare 3/8 is from gauge/electroweak-prediction. The wrong-hypercharge prediction is the discriminating control.',
    })
  },
})
