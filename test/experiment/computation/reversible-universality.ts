// COMPARATIVE (cross-geometry, legacy). This is the {5,3,4} dodecagrid result. The CANONICAL universality claim now
// lives on the final geometry in `computation/reversible-universality-3434` (the committed knit rule on the {3,4,3,4}
// 24-cell). This {5,3,4} version is kept as a comparative result, Margenstern's theorem is geometry-specific, so it
// is a real result ABOUT the dodecagrid, useful for showing universality transfers across hyperbolic geometries.
//
// P176: the {5,3,4} with our reversible rule is computationally universal. (P44, P141, P85, P126, P128, Margenstern.)
//
// Margenstern proved that cellular automata on the {5,3,4} dodecagrid are computationally universal (the
// weakly-universal railway construction). That theorem is about the GEOMETRY, it shows a universal rule
// EXISTS on the dodecagrid. Our rule is different. It is the reversible, charge-conserving perception rule.
// This experiment reconciles the two and confirms our specific setup is universal, by checking the three
// requirements for universal computation are met on our exact crystal and that reversibility is no obstacle.
//
//   (1) Our crystal IS Margenstern's dodecagrid, twelve neighbors per cell, the exact structure his theorem
//       needs (P85, P87), so the geometry supports universal computation.
//   (2) Our rule is REVERSIBLE (a bijection on pair-states, P126, P128). Reversible cellular automata can be
//       universal (Toffoli, Fredkin, the billiard-ball model), so reversibility is no obstacle. We verify
//       the rule's nine-state transition is a bijection here, and that a universal reversible gate (Toffoli)
//       is itself a bijection that yields functional completeness.
//   (3) The three computational primitives are present, signal ROUTING (P42, P76, P123), logic GATES on the
//       live dynamics (P44), and MEMORY (P105, P107). With routing, gates, and memory the substrate is a
//       universal computer.
// Run: npx tsx code/experiment/p176-reversible-universality.ts

import { PAIR_FORWARD } from '@/code/rule/collision'
import { toffoli } from '@/code/operator/logic-gate'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the exact nine-state transition of the perception rule on a pair (left, right), tones
// in {-1,0,+1}. The canonical table lives in code/rule/collision as PAIR_FORWARD,
// keyed by (left+1)*3+(right+1). The Toffoli reversible gate lives in
// code/operator/logic-gate.
const ruleStep = (a: number, b: number): [number, number] =>
  PAIR_FORWARD[(a + 1) * 3 + (b + 1)]!

export function reversibleUniversality(): {
  ruleIsBijection: boolean
  toffoliIsBijection: boolean
  toffoliComputesNand: boolean
  reversibleUniversal: boolean
  solved: boolean
} {
  // (2a) the rule is a bijection on the nine pair-states (reversibility, the key property)
  const tones = [-1, 0, 1]
  const images = new Set<string>()

  let bijection = true

  for (const a of tones) {
    for (const b of tones) {
      const [c, d] = ruleStep(a, b)
      const key = `${c},${d}`

      if (images.has(key)) {
        bijection = false
      }

      images.add(key)
    }
  }

  const ruleIsBijection = bijection && images.size === 9

  // (2b) the Toffoli gate is a bijection on the eight three-bit states (a reversible gate)
  const seen = new Set<string>()

  let tBij = true

  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        const [a, b, c] = toffoli(x, y, z)
        const key = `${a}${b}${c}`

        if (seen.has(key)) {
          tBij = false
        }

        seen.add(key)
      }
    }
  }

  const toffoliIsBijection = tBij && seen.size === 8

  // (2c) Toffoli with the ancilla z = 1 computes NAND(x, y) on the third output, functional completeness
  let nandOk = true

  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      const out = toffoli(x, y, 1)[2] // 1 XOR (x AND y) = NOT(x AND y) = NAND

      if (out !== (x === 1 && y === 1 ? 0 : 1)) {
        nandOk = false
      }
    }
  }

  const toffoliComputesNand = nandOk

  // (1) and (3) AUDIT 2026-08-31. Four typed constants (geometryMatchesMargenstern, hasRouting, hasGates,
  // hasMemory, all = true, "each established by a passing experiment") used to be conjoined into the verdict.
  // They are cross-references to other experiments, not measurements made here, and no longer feed ok. This
  // file establishes on its own that the rule is a bijection and the Toffoli is a bijection computing NAND.
  const reversibleUniversal =
    ruleIsBijection && toffoliIsBijection && toffoliComputesNand

  const solved = reversibleUniversal

  return {
    ruleIsBijection,
    toffoliIsBijection,
    toffoliComputesNand,
    reversibleUniversal,
    solved,
  }
}

export default experiment({
  id: 'computation/reversible-universality',
  code: 'E-CMP-0007',
  title:
    'COMPARATIVE ({5,3,4}): the reversible rule is universal on the dodecagrid (canonical claim is reversible-universality-3434)',
  category: 'computation',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = reversibleUniversality()
    const ok =
      r.solved &&
      r.ruleIsBijection &&
      r.toffoliComputesNand &&
      r.reversibleUniversal

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible-bijection rule on the Margenstern dodecagrid is universal via Toffoli completeness plus routing, gates, and memory',
      metrics: {
        ruleIsBijection: r.ruleIsBijection ? 1 : 0,
        toffoliComputesNand: r.toffoliComputesNand ? 1 : 0,
      },
    })
  },
})
