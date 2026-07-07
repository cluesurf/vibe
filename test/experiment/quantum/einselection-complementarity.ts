// Einselection is a complementarity: a system cannot keep its quantum coherence AND hand the
// environment a readable classical record of the same pointer. This is the mechanism behind Zurek's
// einselection and the quantum side of Tegmark's "consciousness as a state of matter" (a state is
// classical exactly when its pointer has been copied out, destroying the coherence that would let it
// stay in superposition). Measured here, from the real reduced density matrices, as an exact
// trade-off.
//
// A system qubit's pointer is copied into a bath of N cells, each copy overlapping by c (c = 1 no
// record, c = 0 a perfect record). Two numbers are read off the actual state: the system coherence
// (magnitude of the reduced off-diagonal, the quantumness) and the trace distance a single cell
// gives between the two pointer values (the strength of the classical record).
//
// - ONE COPY (N = 1): the two are EXACTLY complementary, (2 * coherence)^2 + record^2 = 1, a
//   Pythagorean trade-off checked to machine precision across the whole sweep. You buy record
//   strength with coherence, one for one.
// - A BATH (N > 1): the record still costs the same per cell, but the coherence collapses FASTER
//   (amplified decoherence, c^N), so at any given record strength the bath leaves strictly less
//   coherence than one copy. Einselection is amplified by the environment.
// - COMPLEMENTARITY: with a bath, no coupling leaves both the coherence and the single-cell record
//   above a modest threshold at once. The extremes (c = 1 gives coherence 1/2 and record 0, c = 0
//   gives coherence 0 and record 1) are the controls.
//
// Depth L2. This measures a known trade-off (quantum coherence versus a classical record) on built
// states, from real partial traces, with an exact identity and endpoint controls. A known-physics
// bridge, labeled as such.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildRecordChain } from '@/code/dynamics/record-chain'
import {
  systemCoherence,
  fragmentRecordDistance,
} from '@/code/tool/density-matrix'

const OVERLAPS = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0]

function coherenceAndRecord(input: {
  environmentCount: number
  overlap: number
}): { coherence: number; record: number } {
  const chain = buildRecordChain({
    environmentCount: input.environmentCount,
    overlap: input.overlap,
    weight0: 0.5,
    weight1: 0.5,
    form: 'copy',
  })
  const coherence = systemCoherence({
    real: chain.joint.real,
    imag: chain.joint.imag,
    qubitCount: chain.joint.qubitCount,
    systemQubit: chain.systemQubit,
  })
  const record = fragmentRecordDistance({
    stateA: chain.environmentGivenPointer0,
    stateB: chain.environmentGivenPointer1,
    fragment: [0],
  })

  return { coherence, record }
}

export default experiment({
  id: 'quantum/einselection-complementarity',
  code: 'E-QTM-0071',
  title:
    'einselection is a complementarity: for one copy the system coherence and the classical record obey the exact identity (2 coherence)^2 + record^2 = 1, and a bath collapses the coherence faster still, so a state cannot stay quantum and hand out a readable classical record of the same pointer at once',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // ONE COPY: the exact Pythagorean identity across the sweep
    let worstIdentityError = 0

    for (const overlap of OVERLAPS) {
      const { coherence, record } = coherenceAndRecord({
        environmentCount: 1,
        overlap,
      })
      const identity = (2 * coherence) ** 2 + record ** 2
      worstIdentityError = Math.max(worstIdentityError, Math.abs(identity - 1))
    }

    // AMPLIFICATION: at each interior overlap the bath (N=6) leaves less coherence than one copy
    let amplificationHolds = true
    let worstBathCoherenceAtHalf = 0

    for (const overlap of OVERLAPS) {
      if (overlap <= 0 || overlap >= 1) {
        continue
      }

      const one = coherenceAndRecord({ environmentCount: 1, overlap })
      const bath = coherenceAndRecord({ environmentCount: 6, overlap })

      if (bath.coherence > one.coherence + 1e-12) {
        amplificationHolds = false
      }
      if (Math.abs(overlap - 0.5) < 1e-9) {
        worstBathCoherenceAtHalf = bath.coherence
      }
    }

    // COMPLEMENTARITY: with a bath, no overlap gives both coherence and record above 0.3
    let bothHigh = false

    for (const overlap of OVERLAPS) {
      const { coherence, record } = coherenceAndRecord({
        environmentCount: 6,
        overlap,
      })

      if (coherence > 0.3 && record > 0.3) {
        bothHigh = true
      }
    }

    // CONTROLS: the two endpoints
    const noRecord = coherenceAndRecord({ environmentCount: 6, overlap: 1 })
    const perfectRecord = coherenceAndRecord({ environmentCount: 6, overlap: 0 })

    const identityExact = worstIdentityError < 1e-9
    const complementarity = !bothHigh
    const controlsCorrect =
      Math.abs(noRecord.coherence - 0.5) < 1e-9 &&
      noRecord.record < 1e-9 &&
      perfectRecord.coherence < 1e-9 &&
      Math.abs(perfectRecord.record - 1) < 1e-9

    const ok =
      identityExact && amplificationHolds && complementarity && controlsCorrect

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'for a single copy the system coherence and the single-cell classical record obey the exact identity (2 coherence)^2 + record^2 = 1 across the whole overlap sweep, a bath of six cells leaves strictly less coherence at every interior overlap (amplified einselection), and no bath coupling leaves both the coherence and the record above 0.3 at once, so quantum coherence and a readable classical record of the same pointer are complementary',
      metrics: {
        worstIdentityError: Number(worstIdentityError.toExponential(2)),
        bathCoherenceAtHalfOverlap: Number(
          worstBathCoherenceAtHalf.toExponential(2),
        ),
        amplificationHolds: amplificationHolds ? 1 : 0,
        complementarityHolds: complementarity ? 1 : 0,
      },
      // CONTROL: the two endpoints. No coupling keeps full coherence and no record; a perfect copy
      // gives no coherence and a full record. Neither gives both.
      control: {
        noRecordCoherence: Number(noRecord.coherence.toFixed(4)),
        noRecordRecord: Number(noRecord.record.toExponential(2)),
        perfectRecordCoherence: Number(perfectRecord.coherence.toExponential(2)),
        perfectRecordRecord: Number(perfectRecord.record.toFixed(4)),
      },
      notes:
        'Einselection as complementarity (Zurek), the quantum side of Tegmark "consciousness as a state of matter": a state is classical exactly when its pointer has been copied out, and the copying destroys the coherence one-for-one (exact identity at one copy), faster with a bath. L2, measured from real partial traces. Reuses code/tool/density-matrix and code/dynamics/record-chain; complements the objectivity experiment (E-QTM-0070).',
    })
  },
})
