// P58: the emergent macro-rule (the renormalization fixed point).
// P57 showed the higher vibe is a derived aggregate of the micro-tones, but the higher
// level obeyed the same rule only weakly (emergence about 0.10) with a naive coarse-graining.
// The fix is a proper renormalization. The naive rule threw away two things: the COUPLING
// MAGNITUDES (it kept only the sign of the summed cross-fills) and the cluster's SELF-
// COUPLING (its internal cohesion, the inertia that keeps a cluster's majority in place).
// Restoring both, via a mean-field closure (a cluster's members are approximated by their
// majority), gives the effective coarse rule:
//   super'(c) = sign( Jself(c) * super(c) + sum over d of Jcross(c,d) * super(d) )
// with Jself the sum of intra-cluster fills and Jcross the (real) sum of cross-cluster
// fills. We show this renormalized rule has the same FORM (signed-majority) and reproduces
// the aggregated micro-dynamics far better than the naive one, so the rule is a fixed point
// of coarse-graining up to coupling renormalization. That is the scale-invariance P57 left
// open. Run: npx tsx code/experiment/p58-emergent-macro-rule.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { signedMajorityStep } from '@/code/operator/signed-majority'
import {
  agreementFraction,
  clusterMajority,
} from '@/code/measure/agreement'
import {
  geometricBlocks,
  coherentFills,
} from '@/code/dynamics/renormalization-blocks'
import {
  effectiveCouplings,
  naiveMacroStep,
  renormMacroStep,
} from '@/code/operator/macro-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function emergentMacroRule(input: {
  count: number
  seed: number
}): {
  orderedRenorm: number
  orderedNaive: number
  frustratedRenorm: number
  coherenceSweep: { p: number; renorm: number; naive: number }[]
  blockCount: number
  emergesInOrderedRegime: boolean
  failsWhenFrustrated: boolean
  beatsNaive: boolean
  solved: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({
    count: input.count,
    radius: 7,
    connectThreshold: 3.0,
    rng,
  })

  // The CRITICAL fix: coarse-grain along GEOMETRIC blocks (BFS balls from random seeds), defined
  // WITHOUT looking at the tones, so the mean-field closure is not exact by construction. Then test
  // whether the renormalized macro-rule holds the coarse-grained fixed point.
  const { cl, K } = geometricBlocks(
    g,
    14,
    makeRng({ seed: input.seed + 2 }),
  )

  const measure = (p: number): { renorm: number; naive: number } => {
    // Coherence-tunable fills: +1 with probability p, else -1. p = 0.5 is frustrated (spin-glass, no
    // coherent domains), p -> 1 is ordered (ferromagnetic). Emergence of a coarse rule requires order.
    const fills = coherentFills(
      g,
      p,
      makeRng({ seed: input.seed + 10 }),
    )

    let base = new Int8Array(g.size)

    const r0 = makeRng({ seed: input.seed + 20 })

    for (let i = 0; i < g.size; i++) {
      base[i] = r0.nextInt({ max: 3 }) - 1
    }

    for (let b = 0; b < 200; b++) {
      base = signedMajorityStep({
        neighbors: g.neighbors,
        fills,
        tone: base,
        keepOnTie: true,
      })
    }

    const eff = effectiveCouplings(g, fills, cl, K)
    const superTone = clusterMajority(cl, K, base)

    return {
      renorm: agreementFraction(
        superTone,
        renormMacroStep(superTone, eff),
      ),
      naive: agreementFraction(
        superTone,
        naiveMacroStep(superTone, eff),
      ),
    }
  }

  const coherenceSweep = [0.5, 0.7, 0.85, 1.0].map(p => ({
    p,
    ...measure(p),
  }))

  const ordered = measure(0.85)
  const frustrated = measure(0.5)
  const orderedRenorm = ordered.renorm
  const orderedNaive = ordered.naive
  const frustratedRenorm = frustrated.renorm

  const emergesInOrderedRegime = orderedRenorm > 0.8
  const beatsNaive = orderedRenorm > orderedNaive + 0.15
  const failsWhenFrustrated = frustratedRenorm < orderedRenorm - 0.2

  return {
    orderedRenorm,
    orderedNaive,
    frustratedRenorm,
    coherenceSweep,
    blockCount: K,
    emergesInOrderedRegime,
    failsWhenFrustrated,
    beatsNaive,
    // Solved: on GEOMETRIC (tone-independent) blocks, the renormalized signed-majority rule emerges
    // as the coarse description in the ordered regime, far beyond the naive rule, and honestly fails
    // in the frustrated regime (so it is real emergence, not a same-tone-cluster tautology).
    solved: emergesInOrderedRegime && beatsNaive && failsWhenFrustrated,
  }
}

export default experiment({
  id: 'renormalization/emergent-macro-rule',
  code: 'E-SCL-0007',
  title:
    'a renormalized macro-rule emerges on tone-independent blocks in the ordered regime and fails when frustrated',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = emergentMacroRule({ count: 1500, seed: 1 })
    const ok =
      r.solved &&
      r.emergesInOrderedRegime &&
      r.beatsNaive &&
      r.failsWhenFrustrated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the renormalized signed-majority macro-rule holds the coarse-grained fixed point in the ordered regime far beyond the naive rule and honestly fails when frustrated',
      metrics: {
        orderedRenorm: r.orderedRenorm,
        frustratedRenorm: r.frustratedRenorm,
      },
      control: {
        orderedNaive: r.orderedNaive,
      },
    })
  },
})
