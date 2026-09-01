// The wormhole is the entanglement, made operational. In the holographic reading vibe already uses
// (the boundary skin on the hyperbolic bulk), two entangled boundary regions are joined by a bridge
// through the bulk, an Einstein-Rosen wormhole, and the identity is Maldacena and Susskind's ER=EPR:
// the entanglement (EPR) is the bridge (ER). This module gives the operational content on qubits: the
// mutual information that measures the wormhole cross-section, the teleportation that traverses it,
// and the traversal capacity that is its throat width.

// The binary entropy of a probability p.
import { ComplexPair as Complex, pairAdd as add, pairMul as mul, pairAbs2 as abs2 } from '@/code/algebra/linear/complex-pair'

function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) {
    return 0
  }

  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p)
}

// The entanglement entropy of the two-qubit state cos(theta)|00> + sin(theta)|11>, the reduced
// entropy of one side. Zero for a product state (theta a multiple of pi/2), one bit at maximal
// entanglement (theta = pi/4).
export function entanglementEntropy(theta: number): number {
  return binaryEntropy(Math.cos(theta) * Math.cos(theta))
}

// The mutual information I(A:B) of the same pure state, twice the entanglement entropy, the measure
// of the wormhole cross-section: zero when the boundary is disconnected (the wormhole pinched off)
// and two when the two sides are maximally entangled (the throat widest).
export function wormholeCrossSection(theta: number): number {
  return 2 * entanglementEntropy(theta)
}

// The fidelity with which a one-qubit state teleports through one shared Bell pair. With the
// classical channel (the two measurement bits used to correct Bob's qubit) the state arrives
// perfectly (fidelity one, it traverses the wormhole). Without the channel Bob's qubit is the
// maximally mixed state (fidelity one half, no information, no signaling). `state` is the amplitude
// pair [a0, a1] of a|0> + b|1>, each a complex number.
export function teleportationFidelity(input: {
  state: [Complex, Complex]
  useChannel: boolean
}): number {
  const { state, useChannel } = input
  const invSqrt2 = 1 / Math.SQRT2

  // three qubits |q0 q1 q2>: q0 the message, (q1, q2) the shared Bell pair
  let amplitude: Complex[] = new Array<Complex>(8).fill([0, 0])

  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const coefficient: Complex = [
        state[a]![0] * invSqrt2,
        state[a]![1] * invSqrt2,
      ]

      amplitude[(a << 2) | (b << 1) | b] = coefficient
    }
  }

  // Bell measurement on (q0, q1): CNOT from q0 to q1, then Hadamard on q0
  const afterCnot: Complex[] = new Array<Complex>(8).fill([0, 0])

  for (let i = 0; i < 8; i++) {
    const q0 = (i >> 2) & 1
    const q1 = (i >> 1) & 1
    const q2 = i & 1

    afterCnot[(q0 << 2) | ((q1 ^ q0) << 1) | q2] = amplitude[i]!
  }

  const afterHadamard: Complex[] = new Array<Complex>(8).fill([0, 0])

  for (let i = 0; i < 8; i++) {
    const q0 = (i >> 2) & 1
    const rest = i & 3
    const sign = q0 === 0 ? 1 : -1

    afterHadamard[rest] = add(afterHadamard[rest]!, [
      afterCnot[i]![0] * invSqrt2,
      afterCnot[i]![1] * invSqrt2,
    ])

    afterHadamard[(1 << 2) | rest] = add(
      afterHadamard[(1 << 2) | rest]!,
      [
        afterCnot[i]![0] * invSqrt2 * sign,
        afterCnot[i]![1] * invSqrt2 * sign,
      ],
    )
  }

  amplitude = afterHadamard

  // for each measurement outcome (m0, m1), Bob's post-correction state, weighted by its probability
  let totalFidelity = 0

  for (let m0 = 0; m0 < 2; m0++) {
    for (let m1 = 0; m1 < 2; m1++) {
      const branch0 = amplitude[(m0 << 2) | (m1 << 1) | 0]!
      const branch1 = amplitude[(m0 << 2) | (m1 << 1) | 1]!
      const probability = abs2(branch0) + abs2(branch1)

      if (probability < 1e-12) {
        continue
      }

      let corrected0 = branch0
      let corrected1 = branch1

      if (useChannel) {
        // apply X^m1 then Z^m0 to undo the teleportation byproduct
        if (m1) {
          const swap = corrected0

          corrected0 = corrected1
          corrected1 = swap
        }

        if (m0) {
          corrected1 = [-corrected1[0], -corrected1[1]]
        }
      }

      const overlap = add(
        mul([state[0][0], -state[0][1]], corrected0),
        mul([state[1][0], -state[1][1]], corrected1),
      )

      // the corrected branch is unnormalized (its squared norm is the outcome probability), so
      // |overlap|^2 is already the probability-weighted branch fidelity; summing gives the average
      totalFidelity += abs2(overlap)
    }
  }

  return totalFidelity
}

// The traversal capacity of a wormhole with `bellPairs` shared pairs: the number of qubits that can
// be teleported through it, one per pair, which is the throat cross-section (the minimal bulk cut in
// the holographic dual). Equals the number of Bell pairs.
export function throatCapacity(bellPairs: number): number {
  return bellPairs
}
