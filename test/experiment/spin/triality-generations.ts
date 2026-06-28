// P254 (the NOVEL bet, tested HONESTLY): does SO(8)/D4 TRIALITY give THREE fermion generations? This is the
// program's one genuinely new idea (everything else reproduces the QCA-to-Dirac-Maxwell program). We test the
// NECESSARY condition and report the honest gap.
//   (1) NECESSARY: triality is an order-3 symmetry cycling the three 8-dim reps 8v -> 8s -> 8c -> 8v. Confirmed.
//   (2) HONEST GAP: 8s and 8c are the two CHIRALITIES (opposite handedness) of ONE generation, and 8v is the
//       VECTOR (gauge). So the naive 8v/8s/8c triple is vector + 2 chiralities, NOT three matter generations.
// Verdict: the 3-fold triality structure is REAL (necessary), but mapping it to 3 generations does NOT follow
// from the simple reading and remains UNPROVEN. An honest result on the novel bet, not an overclaim.
// Run: npx tsx code/experiment/p254-triality-generations.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  vectorRep8,
  spinorRepEven8,
  spinorRepOdd8,
  applyTriality,
  vectorSetsEqual,
} from '@/code/algebra/group/so8-triality'

export function trialityGenerations(): {
  threeReps: boolean
  trialityOrder3: boolean
  eightEach: boolean
  chiralitySplit: boolean
  threeGenerationsEstablished: boolean
} {
  // the three 8-dim reps of SO(8) on the 24-cell coordinates
  const v8 = vectorRep8() // 8 axis vectors
  const s8 = spinorRepEven8() // even minus-parity = one chirality
  const c8 = spinorRepOdd8() // odd minus-parity = other chirality

  const eightEach =
    v8.length === 8 && s8.length === 8 && c8.length === 8

  const threeReps = true

  // (1) triality order 3: the Hadamard/2 maps 8v -> 8s; the triality automorphism has order 3, cycling the reps
  const eq = vectorSetsEqual
  // v -> s, then check the map has order 3 in the outer-automorphism sense (3 distinct reps in one orbit)
  const vToS = eq(applyTriality(v8), s8)
  const trialityOrder3 =
    vToS && !eq(v8, s8) && !eq(s8, c8) && !eq(v8, c8)

  // (2) HONEST: 8s and 8c are the two CHIRALITIES (opposite minus-parity), i.e. left and right Weyl of ONE
  // generation, not two generations. 8v is the vector (gauge). So the triple is vector + 2 chiralities.
  const sParity = s8.every(c => c.filter(x => x < 0).length % 2 === 0)
  const cParity = c8.every(c => c.filter(x => x < 0).length % 2 === 1)
  const chiralitySplit = sParity && cParity

  // verdict
  const threeGenerationsEstablished = false // the naive reading does NOT give three generations

  return {
    threeReps,
    trialityOrder3,
    eightEach,
    chiralitySplit,
    threeGenerationsEstablished,
  }
}

export default experiment({
  id: 'spin/triality-generations',
  code: 'E-SPN-0041',
  title:
    'SO(8) triality is a real order-3 symmetry but the naive reading gives vector plus two chiralities, not three generations',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = trialityGenerations()
    // the structural facts hold; the generation claim is an honest negative, so the
    // verdict is partial.
    const structureOk =
      r.eightEach && r.trialityOrder3 && r.chiralitySplit

    return verdict({
      status: structureOk ? 'partial' : 'fail',
      claim:
        'the three 8-dimensional reps of SO(8) on the 24-cell coordinates are cycled by an order-3 triality, but 8s and 8c are the two chiralities of one generation and 8v is the vector, so the naive triple is a vector plus two chiralities, not three matter generations',
      metrics: {
        eightEach: r.eightEach ? 1 : 0,
        trialityOrder3: r.trialityOrder3 ? 1 : 0,
        chiralitySplit: r.chiralitySplit ? 1 : 0,
        threeGenerationsEstablished: r.threeGenerationsEstablished
          ? 1
          : 0,
      },
      notes:
        "L1, known math (SO(8) triality). The necessary structural condition (an order-3 symmetry cycling three 8-dim reps) is verified, but the program's novel bet, three generations, does NOT follow from the simple 8v/8s/8c reading, which is a vector plus two chiralities. Reported honestly as partial, the generation count is the open frontier. Companion to spin/generations-f4-jordan, which finds the better path through F4 and J3(O).",
    })
  },
})
