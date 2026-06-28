// P67: synchronicity (correlated transitions from shared ancestry, no link).
// Synchronicity is a meaningful coincidence between things with no causal link between them now.
// The model's honest account: two subsystems that share a deep ancestry (a common root in the
// tree-like mesh, P49) inherited a correlated structure, so under the same ambient rhythm they
// undergo correlated transitions, with no signal passing between them. This is the shared-substrate
// mechanism that gives the Bell correlations without signaling (P7): the correlation was established
// in the shared past, not transmitted now.
//
// The earlier version made subsystem B an EXACT COPY of A and clamped both to the same vectors, so
// the "100% correlation" was forced and tautological. This version is genuine: A and B share a
// common ANCESTOR (root memory patterns) but have DIVERGED, each = root with its own independent
// mutations. They are genuinely different systems with no link. We show their synchronized-transition
// correlation TRACKS the shared ancestry: it falls from near 1 (little divergence) toward the
// unrelated baseline as the two diverge from their common root, and equals the inherited pattern
// overlap at every point. So the correlation is inherited, not transmitted.
// Run: npx tsx code/experiment/p67-synchronicity.ts

import { makeRng } from '@/code/tool/rng'
import {
  storedPatterns,
  mutatePattern,
  bankOverlap as patternOverlap,
  runHopfieldPair as runPair,
} from '@/code/operator/hopfield'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The two-subsystem Hopfield pair (no link, shared rhythm) lives in code/operator/hopfield as
// runHopfieldPair, imported here under the name this experiment has always used.

export function synchronicity(input: { seed: number }): {
  sharedCorrelation: number
  unrelatedCorrelation: number
  divergenceSweep: {
    d: number
    correlation: number
    ancestry: number
  }[]
  tracksAncestry: boolean
  monotoneDecreasing: boolean
  hasDirectLink: boolean
  solved: boolean
} {
  const size = 120
  const K = 4
  const windows = 16
  const root = storedPatterns(K, size, makeRng({ seed: input.seed }))
  const modeSeq = Array.from({ length: windows }, (_, i) =>
    makeRng({ seed: input.seed + 7 + i }).nextInt({ max: K }),
  )

  const sweep = [0, 0.15, 0.3, 0.5, 0.75].map(d => {
    const pA = root.map((p, i) =>
      mutatePattern({
        pattern: p,
        rate: d,
        rng: makeRng({ seed: input.seed + 100 + i }),
      }),
    )

    const pB = root.map((p, i) =>
      mutatePattern({
        pattern: p,
        rate: d,
        rng: makeRng({ seed: input.seed + 200 + i }),
      }),
    )

    return {
      d,
      correlation: runPair({
        size,
        pA,
        pB,
        modeSeq,
        seed: input.seed + 10,
      }),
      ancestry: patternOverlap(pA, pB),
    }
  })

  // "Shared" uses a GENUINE divergence (d = 0.15): A and B are different systems (about 71% overlap),
  // not a copy, yet still strongly correlated through their common root.
  const sharedCorrelation = sweep[1]?.correlation ?? 0
  const uA = storedPatterns(
    K,
    size,
    makeRng({ seed: input.seed + 300 }),
  )

  const uB = storedPatterns(
    K,
    size,
    makeRng({ seed: input.seed + 400 }),
  )

  const unrelatedCorrelation = runPair({
    size,
    pA: uA,
    pB: uB,
    modeSeq,
    seed: input.seed + 10,
  })

  // The correlation tracks the inherited ancestry (|corr - overlap| small at every divergence).
  const tracksAncestry = sweep.every(
    s => Math.abs(s.correlation - s.ancestry) < 0.1,
  )

  // And it falls monotonically as the two diverge from the common root.
  let monotoneDecreasing = true

  for (let i = 1; i < sweep.length; i++) {
    if (
      (sweep[i]?.correlation ?? 0) >
      (sweep[i - 1]?.correlation ?? 1) + 0.02
    ) {
      monotoneDecreasing = false
    }
  }

  return {
    sharedCorrelation,
    unrelatedCorrelation,
    divergenceSweep: sweep,
    tracksAncestry,
    monotoneDecreasing,
    hasDirectLink: false, // the two subsystems have no edges between them, by construction
    // Solved: genuinely different subsystems sharing a common ancestor are strongly correlated
    // (well above the unrelated baseline), the correlation tracks the inherited ancestry and falls
    // with divergence, and there is no link carrying it.
    solved:
      sharedCorrelation > 0.5 &&
      sharedCorrelation > unrelatedCorrelation + 0.4 &&
      tracksAncestry &&
      monotoneDecreasing,
  }
}

export default experiment({
  id: 'quantum/synchronicity',
  code: 'E-QTM-0027',
  title: 'diverged-but-related subsystems correlate without a link',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = synchronicity({ seed: 1 })
    const ok =
      r.solved &&
      r.sharedCorrelation > 0.5 &&
      r.sharedCorrelation > r.unrelatedCorrelation + 0.4 &&
      r.tracksAncestry &&
      r.monotoneDecreasing &&
      !r.hasDirectLink

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two unlinked subsystems sharing a diverged ancestry correlate, tracking inherited ancestry and fading with divergence',
      metrics: {
        sharedCorrelation: r.sharedCorrelation,
        unrelatedCorrelation: r.unrelatedCorrelation,
      },
    })
  },
})
