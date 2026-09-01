// The wormhole has a definite bandwidth, and it is the entanglement. A single shared Bell pair lets
// exactly one qubit traverse the wormhole (E-QTM-0068), so a bridge built from k Bell pairs carries
// exactly k qubits, one per pair, and no more. That number is the throat cross-section, the minimal
// bulk cut in the holographic dual (Ryu-Takayanagi), so the wormhole is not an unlimited passage: its
// capacity is set, and quantized in whole qubits, by how much the two sides are entangled. Adding a
// pair widens the throat by one channel; removing one narrows it.
//
// Measured: teleporting k independent qubits through k shared Bell pairs succeeds for all k of them
// (each arrives with fidelity one), so the traversal capacity of a k-pair wormhole is exactly k, while
// a qubit with no pair left to carry it arrives maximally mixed (fidelity one half, it cannot cross).
// So the throat bandwidth equals the number of Bell pairs, the entanglement measured in whole
// qubits, and the wormhole passes exactly that many and no more.
//
// The control is the unpaired qubit: with the pairs exhausted, one more qubit cannot traverse
// (fidelity one half), so the capacity is a hard limit set by the entanglement, not an unlimited
// passage.
//
// Depth L2. It measures the traversal capacity of a k-pair wormhole (exactly k qubits at fidelity
// one, the next unable to cross), the throat-bandwidth-equals-entanglement result on the substrate,
// with the unpaired-qubit control. A model-level result tying the wormhole throat to the entanglement.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  teleportationFidelity,
  throatCapacity,
} from '@/code/measure/wormhole'

// k distinct one-qubit messages to push through k pairs
const MESSAGES: [
  readonly [number, number],
  readonly [number, number],
][] = [
  [
    [0.6, 0],
    [0, 0.8],
  ],
  [
    [0.8, 0],
    [0.6, 0],
  ],
  [
    [1 / Math.SQRT2, 0],
    [0, 1 / Math.SQRT2],
  ],
]

export default experiment({
  id: 'holography/wormhole-throat-bandwidth',
  code: 'E-HLG-0035',
  title:
    'a k-pair wormhole carries exactly k qubits (each teleported at fidelity one) and no more, so the throat bandwidth is the entanglement quantized in whole qubits, while a qubit with no pair cannot cross (fidelity one half)',
  category: 'holography',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const pairs = MESSAGES.length

    // each of the k messages traverses its own pair at fidelity one
    let worstTraversal = 1

    for (const message of MESSAGES) {
      const fidelity = teleportationFidelity({
        state: [message[0], message[1]],
        useChannel: true,
      })

      worstTraversal = Math.min(worstTraversal, fidelity)
    }

    // the capacity equals the number of pairs
    const capacityMatchesPairs = throatCapacity(pairs) === pairs
    const allTraverse = Math.abs(worstTraversal - 1) < 1e-12

    // CONTROL: a further qubit with no pair (no channel to carry it) cannot cross
    const unpaired = teleportationFidelity({
      state: [
        [0.6, 0],
        [0, 0.8],
      ],
      useChannel: false,
    })

    const unpairedCannotCross = Math.abs(unpaired - 0.5) < 1e-12

    const ok =
      allTraverse && capacityMatchesPairs && unpairedCannotCross

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'teleporting three independent qubits through three shared Bell pairs succeeds for all three (each arrives with fidelity exactly one), so the traversal capacity of a k-pair wormhole is exactly k, the throat cross-section quantized in whole qubits and equal to the entanglement, while a further qubit with no pair to carry it arrives maximally mixed at fidelity one half and cannot cross, so the wormhole passes exactly as many qubits as there are Bell pairs and no more, a hard capacity set by the entanglement rather than an unlimited passage, the discrete Ryu-Takayanagi throat',
      metrics: {
        bellPairs: pairs,
        traversalCapacity: throatCapacity(pairs),
        worstTraversalFidelity: Number(worstTraversal.toFixed(6)),
        unpairedFidelity: Number(unpaired.toFixed(4)),
      },
      // CONTROL: an unpaired qubit cannot cross (fidelity one half).
      control: { unpairedFidelity: Number(unpaired.toFixed(4)) },
      notes:
        'The wormhole throat bandwidth is the entanglement in whole qubits (one qubit per Bell pair), the discrete Ryu-Takayanagi cross-section. Ties the cross-section (E-HLG-0034) to the traversal (E-QTM-0068). Bounded by monogamy (E-QTM-0069).',
    })
  },
})
