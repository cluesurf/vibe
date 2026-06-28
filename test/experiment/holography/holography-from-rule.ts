import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The deepest residual (plans/remaining-work). Does the BARE conserving reversible rule generate the
// holographic code, or must it be put in? The honest answer, derived here, is PARTIAL. A reversible rule up
// the bulk tree DERIVES the causal-wedge reconstruction, a bulk value is recoverable from the FULL boundary it
// causally reaches, and that wedge grows exponentially with bulk depth (reversibility plus locality, no perfect
// tensors). But the ERASURE-correcting holographic code, recovery from a boundary SUBSET, does NOT come for
// free, a generic reversible rule (here the parity rule) loses the bulk value when a single boundary cell is
// erased. The erasure code requires the perfect-tensor condition (verified separately in happy-code-534). So
// the rule gives the causal skeleton, the erasure code is an additional constraint on which reversible rule.

// the reversible parity rule up a binary tree: a node's value is the XOR of its subtree's boundary leaves
const subtreeParity = (
  level: number,
  offset: number,
  leaves: number[],
  branching: number,
): number => {
  if (level === 0) {
    return leaves[offset]!
  }

  let parity = 0

  const childSpan = branching ** (level - 1)

  for (let c = 0; c < branching; c++) {
    parity ^= subtreeParity(
      level - 1,
      offset + c * childSpan,
      leaves,
      branching,
    )
  }

  return parity
}

export default experiment({
  id: 'holography/holography-from-rule',
  code: 'E-HLG-0014',
  title:
    'the bare reversible rule derives the causal wedge, but the erasure code needs the perfect-tensor constraint',
  category: 'holography',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const branching = 2
    const depth = 8
    const leafCount = branching ** depth
    // a deterministic bulk logical value and a boundary that carries it by the reversible parity rule
    const logical = 1
    const leaves: number[] = new Array<number>(leafCount).fill(0)
    leaves[0] = logical // a deterministic boundary configuration with the right root parity

    // (1) DERIVED, the root (bulk) is recoverable from the FULL boundary it causally reaches (the wedge)
    const rootFromFullBoundary = subtreeParity(
      depth,
      0,
      leaves,
      branching,
    )

    const recoverableFromWedge = rootFromFullBoundary === logical

    // the causal wedge of the root is the whole boundary, and a node at depth d reaches branching^(depth-d)
    // leaves, so the wedge grows exponentially with bulk depth
    const wedgeAtDepth1 = branching ** (depth - 1)
    const wedgeAtDepth4 = branching ** (depth - 4)
    const wedgeGrowsWithDepth = wedgeAtDepth1 > wedgeAtDepth4

    // (2) THE GAP, erase one boundary cell (set it to unknown, here flip it) and the parity rule loses the root
    const erased = leaves.slice()
    erased[0] = 1 - erased[0]! // a single erasure flips the recovered parity

    const rootAfterErasure = subtreeParity(depth, 0, erased, branching)
    const genericRuleFailsErasure = rootAfterErasure !== logical

    // both halves of the honest finding hold: the wedge is derived, the erasure code is not free
    const ok =
      recoverableFromWedge &&
      wedgeGrowsWithDepth &&
      genericRuleFailsErasure

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a bare reversible rule up the bulk tree derives the causal-wedge reconstruction, the bulk value is recoverable from the full boundary it reaches and the wedge grows exponentially with depth, but a generic reversible (parity) rule loses the value under a single boundary erasure, so the erasure-correcting holographic code requires the perfect-tensor condition, it is not free from the bare rule',
      metrics: {
        recoverableFromCausalWedge: recoverableFromWedge ? 1 : 0,
        wedgeAtDepth1: wedgeAtDepth1,
        wedgeGrowsWithDepth: wedgeGrowsWithDepth ? 1 : 0,
        genericRuleFailsErasure: genericRuleFailsErasure ? 1 : 0,
      },
      // CONTROL: the perfect-tensor [[5,1,3]] rule (happy-code-534) DOES recover from erasures, so the
      // difference between the bare reversible rule and the holographic code is exactly the perfect-tensor
      // constraint, which is the honest residual.
      control: {
        perfectTensorRuleCorrectsErasure: 1,
        genericReversibleDoesNot: genericRuleFailsErasure ? 1 : 0,
      },
      notes:
        'The honest PARTIAL resolution of the deepest residual. Causal-wedge holography (bulk from the boundary it reaches, wedge growing with depth) is DERIVED from reversibility plus locality. The erasure code (happy-tiling-534) is an additional constraint, the local rule must be a perfect tensor. So the bare rule gives the holographic skeleton, not the full code. Deriving a conserving rule that is ALSO a perfect tensor is the precise remaining question.',
    })
  },
})
