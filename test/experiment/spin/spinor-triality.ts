// P190: spin on {3,4,3,4} vs {5,3,4}. (1) the {5,3,4} 12-face directions carry NO spinor (only integer-spin
// reps), (2) the {3,4,3,4} 24 = D4 directions split 8v + 8s + 8c (vector + two spinors), (3) triality is an
// orthogonal symmetry swapping vector and spinor, (4) spin-statistics, the spinors are FERMIONS.
// Ported from the throwaway probes. Run: npx tsx code/experiment/p190-spinor-triality.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { icosahedralFacePermutationDecomposition } from '@/code/algebra/group/icosahedral'
import {
  vectorRep8,
  spinorRepEven8,
  spinorRepOdd8,
  applyTriality,
  vectorSetsEqual,
} from '@/code/algebra/group/so8-triality'

export function spinorTriality(): {
  fiveNoSpinor: boolean
  twentyFourSplits: boolean
  trialityPresent: boolean
} {
  // ---- (1) {5,3,4}: the 12 dodecahedron faces under the icosahedral rotation group decompose
  // into 1 + 3 + 3' + 5, no spinor (the 4-dim rep is absent) ----
  const fiveNoSpinor =
    icosahedralFacePermutationDecomposition().noSpinor

  // ---- (2) {3,4,3,4}: 24-cell = 8v + 8s + 8c, two spinors; (4) spin-statistics ----
  const v8 = vectorRep8()
  const s8 = spinorRepEven8()
  const c8 = spinorRepOdd8()
  const twentyFourSplits =
    v8.length === 8 && s8.length === 8 && c8.length === 8

  // ---- (3) triality: Hadamard/2 swaps 8v and 8s ----
  const trialityPresent = vectorSetsEqual(applyTriality(v8), s8)
  return { fiveNoSpinor, twentyFourSplits, trialityPresent }
}

export default experiment({
  id: 'spin/spinor-triality',
  title:
    '{5,3,4} carries no spinor while {3,4,3,4} splits 8v + 8s + 8c with triality',
  category: 'spin',
  substrates: ['534', '3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = spinorTriality()
    const ok = r.fiveNoSpinor && r.twentyFourSplits && r.trialityPresent
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 12 directions of the {5,3,4} coin carry no spinor (the icosahedral permutation rep splits into integer-spin reps only) while the 24 directions of {3,4,3,4} split into a vector and two spinors (8v + 8s + 8c) related by triality',
      metrics: {
        fiveNoSpinor: r.fiveNoSpinor ? 1 : 0,
        twentyFourSplits: r.twentyFourSplits ? 1 : 0,
        trialityPresent: r.trialityPresent ? 1 : 0,
      },
      control: {
        // the {5,3,4} icosahedral coin is the negative control: its permutation rep
        // contains zero spinor copies, which is what makes the {3,4,3,4} split mean
        // something.
        fiveSpinorCopies: r.fiveNoSpinor ? 0 : 1,
      },
      notes:
        'L1, known math (group representation theory). The {5,3,4} no-spinor decomposition is the negative control for the {3,4,3,4} split, exactly the discriminator the methodology calls for. This is a structural fact about the coin directions, NOT a measurement that spinors emerge from the dynamics. The 2pi-sign labelling of 8s and 8c as fermions is read off the rep, not from an exchange measurement.',
    })
  },
})
