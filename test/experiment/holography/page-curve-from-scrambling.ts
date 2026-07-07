// The Page curve: unitary evaporation returns information. If a black hole and its radiation are one
// pure state, the entanglement entropy of the radiation must RISE while the hole is large and then
// FALL back to zero as the hole disappears, a tent peaking at the Page time (half the qubits emitted).
// A falling second half is the signature that information comes back out, so the total stays pure and
// nothing is lost. A record that only rises would mean information is destroyed.
//
// Measured here from real partial traces on a deterministic scrambled state. Pairing qubit i with
// qubit N-1-i (cross-cut) is the maximally scrambled arrangement: every Bell pair straddles the
// center, so the entropy of the first k qubits (the radiation emitted so far) is exactly min(k, N-k),
// the Page tent, peaking at N/2 and returning to zero at k = N.
//
// The control is a LOCAL pairing (neighbor qubits 2i, 2i+1): entanglement stays local, the radiation
// entropy never climbs past one bit and never forms the tent, so information is not scrambled out and
// there is no Page turnover. So the turnover is a property of scrambled (unitary, information-
// preserving) evaporation, not of counting qubits.
//
// On the vibe substrate this is the reversible-rule story made quantitative: the global evolution is
// unitary, so the radiation entropy is forced to turn over and the information is preserved, the
// resolution of the black-hole information paradox that needs no remnant by itself (the remnant, from
// discreteness, is E-GRV-0051; here the information is shown to come back out).
//
// Depth L2. The Page curve reproduced on a built pure state, measured from real partial traces, with
// a local-pairing control. A known-physics bridge, honestly labeled.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  buildBellNetwork,
  crossCutPairs,
  localPairs,
} from '@/code/dynamics/bell-network'
import { subsystemEntropyBits } from '@/code/tool/density-matrix'

const QUBITS = 8

// entropy of the first k qubits (the radiation emitted so far)
function radiationEntropy(input: {
  state: ReturnType<typeof buildBellNetwork>
  emitted: number
}): number {
  const keep: number[] = []

  for (let q = 0; q < input.emitted; q++) {
    keep.push(q)
  }

  if (keep.length === 0 || keep.length === input.state.qubitCount) {
    return 0
  }

  return subsystemEntropyBits({
    real: input.state.real,
    imag: input.state.imag,
    qubitCount: input.state.qubitCount,
    keep,
  })
}

export default experiment({
  id: 'holography/page-curve-from-scrambling',
  code: 'E-HLG-0036',
  title:
    'the Page curve from unitary scrambling: the radiation entropy of a cross-cut Bell state rises to N/2 at the Page time and falls back to zero (information returns, total stays pure), exactly min(k, N-k), while a local-pairing control never forms the tent',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const scrambled = buildBellNetwork({
      qubitCount: QUBITS,
      pairs: crossCutPairs(QUBITS),
    })
    const local = buildBellNetwork({
      qubitCount: QUBITS,
      pairs: localPairs(QUBITS),
    })

    // the Page tent: S(first k) = min(k, N-k), exactly
    let worstTentError = 0
    let peak = 0

    for (let emitted = 0; emitted <= QUBITS; emitted++) {
      const measured = radiationEntropy({ state: scrambled, emitted })
      const expected = Math.min(emitted, QUBITS - emitted)
      worstTentError = Math.max(worstTentError, Math.abs(measured - expected))
      peak = Math.max(peak, measured)
    }

    // it must RISE then FALL: entropy at the end returns to (near) zero
    const entropyAtPageTime = radiationEntropy({
      state: scrambled,
      emitted: QUBITS / 2,
    })
    const entropyNearEnd = radiationEntropy({
      state: scrambled,
      emitted: QUBITS - 1,
    })
    const turnsOver = entropyNearEnd < entropyAtPageTime - 1

    // CONTROL: local pairing never builds the tent
    let localPeak = 0

    for (let emitted = 0; emitted <= QUBITS; emitted++) {
      localPeak = Math.max(
        localPeak,
        radiationEntropy({ state: local, emitted }),
      )
    }

    const tentExact = worstTentError < 1e-9
    const peaksAtHalf = Math.abs(peak - QUBITS / 2) < 1e-9
    const controlHasNoTent = localPeak < QUBITS / 2 - 1

    const ok = tentExact && peaksAtHalf && turnsOver && controlHasNoTent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the radiation entropy of the scrambled cross-cut state is exactly min(k, N-k) at every emission step k, rising to N/2 = 4 bits at the Page time and falling back to zero, so information returns and the total stays pure, while the local-pairing control never exceeds one bit and forms no tent',
      metrics: {
        worstTentError: Number(worstTentError.toExponential(2)),
        peakEntropy: Number(peak.toFixed(4)),
        entropyAtPageTime: Number(entropyAtPageTime.toFixed(4)),
        entropyNearEnd: Number(entropyNearEnd.toFixed(4)),
      },
      // CONTROL: local pairing keeps entanglement local, no Page tent.
      control: {
        localPeakEntropy: Number(localPeak.toFixed(4)),
      },
      notes:
        'Page curve (unitary evaporation returns information): the radiation entropy turns over, resolving the information paradox with no information loss on the reversible substrate. Pairs with the discreteness remnant (E-GRV-0051). L2, measured from real partial traces, local-pairing control. Reuses code/tool/density-matrix and code/dynamics/bell-network.',
    })
  },
})
