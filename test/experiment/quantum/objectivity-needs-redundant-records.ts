// Objectivity is redundancy, not decoherence: a definite classical fact is one that MANY
// independent fragments of the environment each record, so many observers reading disjoint pieces
// all agree. This is Zurek's quantum Darwinism, and it is the falsifiable version of "how a definite
// shared reality arises" that a consciousness-as-field proposal (AIP Adv. 15, 115319, retracted for
// having no measurable, falsifiable quantity) does not supply. The point of this experiment is the
// CONTROL, which the existing analytic measurement-chain (E-QTM-0066) does not carry: a record that
// decoheres the system just as strongly but is stored GLOBALLY, in a cat-state phase, so that no
// fragment short of the whole bath can read it. That record is not objective.
//
// Two couplings write the pointer of a system qubit into a bath of N cells, and every reduced state
// is read off the real partial trace (code/tool/density-matrix), not a factorized formula.
//
// - COPY (local, redundant): each cell imperfectly copies the pointer. Measured: a SINGLE cell
//   already distinguishes pointer 0 from pointer 1 with trace distance above 0.9, and all N cells
//   do, so the record is N-fold redundant and objective.
// - GLOBAL (the control): the two pointer-conditional bath states are the two GHZ phases. Measured:
//   the pointer distance is exactly zero on EVERY fragment short of the whole bath, and one only on
//   the whole, so there is zero redundancy and no objective record.
//
// Both decohere the system pointer to coherence ~ 0, so decoherence alone does NOT produce an
// objective fact. Redundant local records do. The contrast holds as the bath size N is varied, so
// it is a property of how the information is distributed, not of one size.
//
// Depth L2. This reproduces quantum Darwinism (objectivity from redundant records) on a built state,
// measured from the actual reduced density matrices, with a cat-state control where objectivity
// fails. It is a known-physics bridge, not an emergent claim, and is labeled as such.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildRecordChain } from '@/code/dynamics/record-chain'
import {
  systemCoherence,
  fragmentRecordDistance,
} from '@/code/tool/density-matrix'

const SIZES = [6, 8, 10]
const OVERLAP = 0.3 // per-cell overlap of the pointer-conditional states; smaller = more distinct
const REDUNDANCY_THRESHOLD = 0.9 // a cell "records" the pointer if it distinguishes it this well

// Trace distance between the two pointer-conditional states of a bath fragment (bath-indexed cells).
function pointerDistance(input: {
  chain: ReturnType<typeof buildRecordChain>
  fragment: number[]
}): number {
  return fragmentRecordDistance({
    stateA: input.chain.environmentGivenPointer0,
    stateB: input.chain.environmentGivenPointer1,
    fragment: input.fragment,
  })
}

// count disjoint single cells that each record the pointer above the threshold
function redundantCells(
  chain: ReturnType<typeof buildRecordChain>,
): number {
  let count = 0

  for (let cell = 0; cell < chain.environmentQubits.length; cell++) {
    if (
      pointerDistance({ chain, fragment: [cell] }) >=
      REDUNDANCY_THRESHOLD
    ) {
      count++
    }
  }

  return count
}

function coherenceOf(
  chain: ReturnType<typeof buildRecordChain>,
): number {
  return systemCoherence({
    real: chain.joint.real,
    imag: chain.joint.imag,
    qubitCount: chain.joint.qubitCount,
    systemQubit: chain.systemQubit,
  })
}

export default experiment({
  id: 'quantum/objectivity-needs-redundant-records',
  code: 'E-QTM-0070',
  title:
    'objectivity is redundancy not decoherence: a copied pointer is read by every single environment cell (N-fold redundant record) while a globally stored cat-state record decoheres the system just as strongly yet no fragment short of the whole bath can read it, so it is not objective',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    let worstCopySingleCell = 1
    let worstCopyRedundancy = Infinity
    let worstCopyCoherence = 0
    let worstGlobalSingleCell = 0
    let worstGlobalRedundancy = 0
    let worstGlobalCoherence = 0
    let worstGlobalFullBath = 1
    let largestFragmentGlobal = 0

    for (const n of SIZES) {
      const copy = buildRecordChain({
        environmentCount: n,
        overlap: OVERLAP,
        weight0: 0.5,
        weight1: 0.5,
        form: 'copy',
      })

      const global = buildRecordChain({
        environmentCount: n,
        overlap: OVERLAP,
        weight0: 0.5,
        weight1: 0.5,
        form: 'global',
      })

      // COPY: a single cell already records the pointer, and all N cells do
      worstCopySingleCell = Math.min(
        worstCopySingleCell,
        pointerDistance({ chain: copy, fragment: [0] }),
      )

      worstCopyRedundancy = Math.min(
        worstCopyRedundancy,
        redundantCells(copy),
      )

      worstCopyCoherence = Math.max(
        worstCopyCoherence,
        coherenceOf(copy),
      )

      // GLOBAL control: no fragment short of the whole records the pointer
      const allButOne: number[] = []

      for (let cell = 0; cell < n - 1; cell++) allButOne.push(cell)

      worstGlobalSingleCell = Math.max(
        worstGlobalSingleCell,
        pointerDistance({ chain: global, fragment: [0] }),
      )

      largestFragmentGlobal = Math.max(
        largestFragmentGlobal,
        pointerDistance({ chain: global, fragment: allButOne }),
      )

      worstGlobalRedundancy = Math.max(
        worstGlobalRedundancy,
        redundantCells(global),
      )

      worstGlobalCoherence = Math.max(
        worstGlobalCoherence,
        coherenceOf(global),
      )

      // the whole bath DOES record it (a global measurement recovers the pointer)
      const whole: number[] = []

      for (let cell = 0; cell < n; cell++) whole.push(cell)

      worstGlobalFullBath = Math.min(
        worstGlobalFullBath,
        pointerDistance({ chain: global, fragment: whole }),
      )
    }

    const copyIsRedundant =
      worstCopySingleCell >= REDUNDANCY_THRESHOLD &&
      worstCopyRedundancy >= Math.min(...SIZES)

    const copyDecoheres = worstCopyCoherence < 1e-2
    const globalHasNoRedundancy =
      worstGlobalSingleCell < 1e-6 &&
      largestFragmentGlobal < 1e-6 &&
      worstGlobalRedundancy === 0

    const globalDecoheres = worstGlobalCoherence < 1e-6
    const globalRecordExistsGlobally = worstGlobalFullBath > 0.99

    const ok =
      copyIsRedundant &&
      copyDecoheres &&
      globalHasNoRedundancy &&
      globalDecoheres &&
      globalRecordExistsGlobally

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a copied pointer is recorded redundantly, every single environment cell distinguishing pointer 0 from pointer 1 with trace distance above 0.9 so all N cells carry the record, while a cat-state record decoheres the system just as strongly yet leaves zero pointer information in every fragment short of the whole bath, so objectivity comes from redundant local records and not from decoherence alone, holding across bath sizes',
      metrics: {
        copyWorstSingleCellDistance: Number(
          worstCopySingleCell.toFixed(4),
        ),
        copyWorstRedundantCells: worstCopyRedundancy,
        copyWorstCoherence: Number(worstCopyCoherence.toExponential(2)),
        globalFullBathDistance: Number(worstGlobalFullBath.toFixed(4)),
      },
      // CONTROL: the global cat-state record. It decoheres the system just as much, but no fragment
      // short of the whole bath records the pointer, so no objective fact forms.
      control: {
        globalWorstSingleCellDistance: Number(
          worstGlobalSingleCell.toExponential(2),
        ),
        globalWorstRedundantCells: worstGlobalRedundancy,
        globalWorstCoherence: Number(
          worstGlobalCoherence.toExponential(2),
        ),
      },
      notes:
        'Quantum Darwinism (Zurek): objectivity is the redundancy of the record. The cat-state control is what makes the claim falsifiable, and answers the retracted consciousness-field paper (AIP Adv. 15, 115319): a definite shared fact needs redundant local records, not an observer field. L2 known physics, measured from real partial traces. L3 AUDIT: this uses a hand-built copy coupling; the plain coined walk gives MONOGAMOUS, distance-decaying entanglement (no redundant broadcast), so Darwinism does NOT emerge from the bare rule and the copy coupling is an extra ingredient, keeping this L2. The vibe-native objectivity on the real reversible rule is Herbert recoverability (E-GRV-0040).',
    })
  },
})
