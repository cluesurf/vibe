// An emergent unitary S-matrix, the first rung toward asymptotic scattering. Quantum field theory
// packages every scattering process into an S-matrix that maps incoming asymptotic states to
// outgoing ones and must be unitary (total probability is conserved, the rows and columns are
// normalized). On the emergent Dirac walk a wave packet with definite rightward momentum runs into a
// mass-step barrier and splits into a transmitted and a reflected packet, the two outgoing channels
// of a two-channel S-matrix. Because the walk is the reversible substrate rule, the S-matrix is
// unitary: the transmitted and reflected probabilities sum to one for every barrier height.
//
// Measured across a sweep of barrier masses: the outgoing probabilities sum to one to better than a
// part in ten thousand at every mass (the unitary S-matrix), and the reflection rises monotonically
// from almost nothing at zero mass (a transparent barrier, the S-matrix is the identity channel) to
// almost everything at high mass (an opaque barrier), a real scattering response to the barrier
// height.
//
// The control is a lossy walk with the amplitudes damped each step. It loses probability, so the
// outgoing channels sum to far less than one, a non-unitary S-matrix. So the unitary S-matrix is
// specifically the payoff of the reversible rule, the same lesson as emergent no-cloning
// (E-FND-0065): unitarity is inherited from reversibility.
//
// Depth L2. It measures the two-channel S-matrix on the emergent Dirac walk, its unitarity across a
// barrier sweep, and the physical rise of reflection with barrier height, against a lossy control. A
// scattering result reproduced from the substrate rule. Distinct from the speed-limit and no-cloning
// results, which read other unitary invariants.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { diracScatter } from '@/code/dynamics/dirac-scattering'

const SIZE = 400
const MOMENTUM = 1.0
const WIDTH = 14
const STEPS = 120
const MASSES = [0, 0.3, 0.6, 1.0, 1.4]

export default experiment({
  id: 'quantum/emergent-s-matrix',
  code: 'E-QTM-0053',
  title:
    'the emergent Dirac walk gives a unitary two-channel S-matrix (transmission plus reflection sum to one across a barrier sweep, reflection rising with barrier height) while a lossy walk loses probability',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const scattering = MASSES.map(mass =>
      diracScatter({
        size: SIZE,
        barrierMass: mass,
        momentum: MOMENTUM,
        width: WIDTH,
        steps: STEPS,
        leak: 0,
      }),
    )

    // the outgoing channels sum to one at every barrier height (unitary S-matrix)
    const worstUnitarityError = Math.max(
      ...scattering.map(result => Math.abs(result.total - 1)),
    )

    const unitary = worstUnitarityError < 1e-4

    // reflection rises monotonically with barrier height, from transparent to opaque
    const reflections = scattering.map(result => result.reflected)

    let monotone = true

    for (let i = 1; i < reflections.length; i++) {
      if (reflections[i]! < reflections[i - 1]! - 1e-9) {
        monotone = false
      }
    }

    const transparentAtZero = reflections[0]! < 0.05
    const opaqueAtHigh = reflections[reflections.length - 1]! > 0.9
    const realScattering = monotone && transparentAtZero && opaqueAtHigh

    // CONTROL: a lossy walk loses probability, the S-matrix is not unitary
    const lossy = diracScatter({
      size: SIZE,
      barrierMass: 0.6,
      momentum: MOMENTUM,
      width: WIDTH,
      steps: STEPS,
      leak: 0.01,
    })

    const lossyNonUnitary = lossy.total < 0.5

    const ok = unitary && realScattering && lossyNonUnitary

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a rightward-momentum packet on the emergent Dirac walk scatters off a mass-step barrier into a transmitted and a reflected channel whose probabilities sum to one to better than a part in ten thousand at every barrier height, a unitary two-channel S-matrix, and the reflection rises monotonically from below five percent at zero mass (a transparent barrier, the identity channel) to above ninety percent at high mass (an opaque barrier), a real scattering response, while a lossy walk with damped amplitudes loses more than half the probability so its S-matrix is not unitary, exactly as unitarity is inherited from the reversible rule',
      metrics: {
        worstUnitarityError: Number(
          worstUnitarityError.toExponential(2),
        ),
        reflectionAtZeroMass: Number(reflections[0]!.toFixed(4)),
        reflectionAtHighMass: Number(
          reflections[reflections.length - 1]!.toFixed(4),
        ),
        lossyTotal: Number(lossy.total.toFixed(4)),
      },
      // CONTROL: the lossy walk loses probability, a non-unitary S-matrix.
      control: { lossyTotal: Number(lossy.total.toFixed(4)) },
      notes:
        'Emergent unitary S-matrix, the first rung toward asymptotic scattering. Unitarity is inherited from the reversible rule, as in emergent no-cloning (E-FND-0065). A lossy rule breaks it.',
    })
  },
})
