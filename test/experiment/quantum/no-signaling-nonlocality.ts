// No signaling despite the Tsirelson violation, the precise sense in which the emergent Bell
// correlations involve no action at a distance. The substrate's exchange dynamics violates CHSH at
// the quantum maximum (E-QTM-0011), and the coin's quaternion units supply the anticommuting pair
// that makes the maximum available (E-QTM-0038). The standing worry is that such correlations are
// "spooky action": Bob's choice of measurement seems to reach across to Alice. The operational
// content of that worry is signaling, and it is exactly testable: if Bob's setting choice moved
// Alice's outcome distribution by any amount, Bob could send Alice a message. It does not move it
// at all.
//
// Measured on the emergent singlet statistics: the CHSH value at the standard settings is the
// full Tsirelson bound 2 root 2 (the correlations are maximally nonlocal), while Alice's marginal
// probability is exactly one half for every pair of settings swept, independent of Bob's choice
// to machine precision (delta exactly zero). So the nonlocality lives entirely in the
// correlations and never in the marginals: no operation Bob performs changes anything Alice can
// observe locally, no action at a distance in the operational sense, exactly the no-signaling
// theorem on the emergent layer.
//
// The control is an explicit signaling model, a collapse-messenger toy where Bob's setting biases
// Alice's marginal by a cosine term. The same marginal test detects it immediately (the delta is
// large), so the null result on the emergent statistics is a live test, not a vacuous one.
//
// Depth L1. It confirms the no-signaling structure of the emergent singlet statistics exactly
// (Tsirelson correlations, setting-independent marginals) against a live signaling control, the
// known quantum no-signaling theorem at the emergent layer, companion to the dynamics-level
// Tsirelson result (E-QTM-0011).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  singletChsh,
  singletMarginalA,
} from '@/code/measure/bell-structure'

const ALICE_SETTINGS = [0, 0.7, Math.PI / 2, 2.1]
const BOB_SETTINGS = [0.2, Math.PI / 4, 1.9, 2.9]
const SIGNALING_BIAS = 0.3

export default experiment({
  id: 'quantum/no-signaling-nonlocality',
  code: 'E-QTM-0057',
  title:
    'the emergent singlet statistics violate CHSH at the full Tsirelson bound while Alice marginal is exactly independent of Bob setting (delta zero, no signaling), so the nonlocality carries no action at a distance, with a signaling toy detected by the same test',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const chsh = singletChsh()
    const tsirelson = 2 * Math.SQRT2

    // the worst marginal shift across every setting pair: Bob's choice never moves Alice
    let worstDelta = 0

    for (const thetaA of ALICE_SETTINGS) {
      const marginals = BOB_SETTINGS.map(thetaB =>
        singletMarginalA({ thetaA, thetaB }),
      )

      for (let i = 1; i < marginals.length; i++) {
        worstDelta = Math.max(
          worstDelta,
          Math.abs(marginals[i]! - marginals[0]!),
        )
      }
    }

    // CONTROL: a collapse-messenger toy where Bob's setting biases Alice's marginal
    const signalingMarginal = (thetaB: number): number =>
      (1 + SIGNALING_BIAS * Math.cos(thetaB)) / 2

    let controlDelta = 0

    for (let i = 1; i < BOB_SETTINGS.length; i++) {
      controlDelta = Math.max(
        controlDelta,
        Math.abs(
          signalingMarginal(BOB_SETTINGS[i]!) -
            signalingMarginal(BOB_SETTINGS[0]!),
        ),
      )
    }

    const atTsirelson = Math.abs(chsh - tsirelson) < 1e-12
    const noSignaling = worstDelta < 1e-14
    const controlDetected = controlDelta > 0.05

    const ok = atTsirelson && noSignaling && controlDetected

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the emergent singlet statistics reach the full Tsirelson bound 2 root 2 at the standard CHSH settings (maximally nonlocal correlations) while Alice marginal probability stays exactly one half for every setting pair swept, independent of Bob choice to machine precision, so no operation Bob performs changes anything Alice can observe locally and the nonlocality carries no action at a distance in the operational sense (the no-signaling theorem on the emergent layer), while an explicit collapse-messenger toy that biases Alice marginal by Bob setting is detected immediately by the same test, so the null is live',
      metrics: {
        chsh: Number(chsh.toFixed(6)),
        tsirelson: Number(tsirelson.toFixed(6)),
        worstMarginalDelta: worstDelta,
        controlMarginalDelta: Number(controlDelta.toFixed(3)),
      },
      // CONTROL: the signaling toy shifts the marginal and is detected by the same test.
      control: {
        controlMarginalDelta: Number(controlDelta.toFixed(3)),
      },
      notes:
        'The no-signaling theorem on the emergent statistics: Tsirelson correlations with setting-independent marginals. Companion to the dynamics-level CHSH (E-QTM-0011) and the coin anticommutation (E-QTM-0038). The correlations cannot carry messages, so no action at a distance.',
    })
  },
})
