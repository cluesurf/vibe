// Traversing the wormhole is quantum teleportation, and it needs the classical channel. An
// Einstein-Rosen bridge built from entanglement (E-HLG-0034) is not by itself traversable: a bare
// wormhole carries no message, or it would signal faster than light. It becomes traversable only when
// the two sides are coupled by a classical channel, and then a state thrown into one side emerges
// perfectly from the other. This is exactly quantum teleportation, and it is the substrate's version
// of the Gao-Jafferis-Wall and Maldacena-Qi traversable wormhole, where a double-trace coupling opens
// the throat for a signal.
//
// Measured: a one-qubit state teleported through one shared Bell pair (the wormhole) arrives with
// fidelity exactly one when the two classical correction bits are sent and used (the state traverses
// the wormhole perfectly), and with fidelity exactly one half, the maximally mixed state carrying no
// information, when the classical channel is withheld. So the entanglement bridge is traversable only
// with the channel, and the channel alone (without the entanglement) would carry only the two random
// bits, so it is the entanglement plus the channel together that lets the state cross.
//
// The control is the withheld channel: the same protocol without the classical bits gives fidelity
// one half (no information), so the traversal is specifically the payoff of the channel opening the
// entanglement bridge, and a bare wormhole transmits nothing, which is exactly why ER=EPR does not
// violate causality (the bare wormhole here carries no message).
//
// Depth L2. It measures the teleportation traversal of the entanglement wormhole (fidelity one with
// the classical channel, one half without), the traversable-wormhole picture on the substrate, with
// the withheld-channel control. A model-level result on the emergent entanglement structure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { teleportationFidelity } from '@/code/measure/wormhole'

// a few one-qubit states to teleport, each a|0> + b|1> as complex amplitude pairs
const STATES: [readonly [number, number], readonly [number, number]][] =
  [
    [
      [0.6, 0],
      [0, 0.8],
    ],
    [
      [1 / Math.SQRT2, 0],
      [1 / Math.SQRT2, 0],
    ],
    [
      [0.5, 0.5],
      [0.5, -0.5],
    ],
  ]

export default experiment({
  id: 'quantum/traversable-wormhole-teleportation',
  code: 'E-QTM-0068',
  title:
    'a qubit traverses the entanglement wormhole perfectly (teleportation fidelity exactly one) only when the classical channel is used, and arrives maximally mixed (fidelity one half) without it, the traversable-wormhole picture where a coupling opens the throat',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    let worstWithChannel = 1
    let worstWithoutError = 0

    for (const state of STATES) {
      const withChannel = teleportationFidelity({
        state: [state[0], state[1]],
        useChannel: true,
      })

      const withoutChannel = teleportationFidelity({
        state: [state[0], state[1]],
        useChannel: false,
      })

      worstWithChannel = Math.min(worstWithChannel, withChannel)
      worstWithoutError = Math.max(
        worstWithoutError,
        Math.abs(withoutChannel - 0.5),
      )
    }

    const traversesWithChannel = Math.abs(worstWithChannel - 1) < 1e-12
    const noTraversalWithoutChannel = worstWithoutError < 1e-12

    const ok = traversesWithChannel && noTraversalWithoutChannel

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a one-qubit state teleported through one shared Bell pair, the entanglement wormhole, arrives with fidelity exactly one for every test state when the two classical correction bits are sent and used (the state traverses the wormhole perfectly), and with fidelity exactly one half, the maximally mixed state carrying no information, when the classical channel is withheld, so the entanglement bridge is traversable only when a classical channel couples the two sides, exactly the Gao-Jafferis-Wall and Maldacena-Qi traversable wormhole where a coupling opens the throat and exactly quantum teleportation, while a bare wormhole with no channel transmits nothing so ER=EPR does not violate causality',
      metrics: {
        worstFidelityWithChannel: Number(worstWithChannel.toFixed(6)),
        worstDeviationFromHalfWithout: Number(
          worstWithoutError.toExponential(2),
        ),
        statesTested: STATES.length,
      },
      // CONTROL: without the classical channel the fidelity is one half, no traversal.
      control: {
        worstDeviationFromHalfWithout: Number(
          worstWithoutError.toExponential(2),
        ),
      },
      notes:
        'Traversable wormhole as teleportation (Gao-Jafferis-Wall, Maldacena-Qi): fidelity one with the classical channel, one half without. The throat opens only under coupling. Pairs with the cross-section (E-HLG-0034), the throat bandwidth (E-HLG-0035), and the wormhole monogamy (E-QTM-0069).',
    })
  },
})
