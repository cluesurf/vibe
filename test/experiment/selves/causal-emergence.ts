// P185: causal emergence, the macro (self) level has MORE causal power than the micro substrate. (Hoel causal emergence, P116, P168, related-works.md theme 11/13.)
//
// NOT EMERGENT. This ADDS a transition matrix hand-built to be degenerate (the funnel, where every leaf
// micro-state is forced to map to one sink). A degenerate transition matrix is NOT one of the five base
// things, and it is not produced by the vibe substrate. So this is NOT an emergent test of the pure vibe
// substrate and does NOT show the substrate produces causal emergence. The degeneracy that drives the
// result is constructed by hand here, not discovered in the mesh dynamics. The math below is a correct
// demonstration of Hoel's EFFECTIVE INFORMATION measure on a CONSTRUCTED degenerate dynamics, nothing more.
// Hoel's measure is EFFECTIVE INFORMATION (EI), the information an intervention that sets the state gives
// about the next state. The driver of emergence is DEGENERACY, when MANY micro-states funnel to the SAME
// future, the effect cannot tell the causes apart, so the micro is causally weak. Grouping the degenerate
// causes into ONE macro-state removes the degeneracy, and the macro becomes a sharper cause. We model the
// churning substrate as many micro configurations of a self all funneling to one attractor (the self's
// macro state), and show EI(macro) > EI(micro), growing with the degeneracy. IF the substrate produced
// such degeneracy this would make the self a genuine author atop a fixed micro rule, but that funneling is
// assumed here, not derived. Run: npx tsx code/experiment/p185-causal-emergence.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// effective information of a row-stochastic transition matrix, in bits. EI = average over states of the
// KL divergence of that state's output distribution from the average output distribution.
function effectiveInformation(tpm: number[][]): number {
  const n = tpm.length
  const avg = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) avg[j]! += tpm[i]![j]! / n
  let ei = 0
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const p = tpm[i]![j]!
    if (p > 1e-12 && avg[j]! > 1e-12) ei += (p * Math.log2(p / avg[j]!)) / n
  }
  return ei
}

// a DEGENERATE micro dynamics, K "leaf" micro-states (the self's interchangeable churning configurations)
// all funnel to one SINK state (the self's attractor), and the sink redistributes uniformly back to the
// leaves. The leaves are causally indistinguishable, the hallmark of degeneracy.
function buildFunnel(K: number): { P: number[][]; groups: number[] } {
  const N = K + 1
  const sink = K
  const P: number[][] = Array.from({ length: N }, () => new Array<number>(N).fill(0))
  for (let i = 0; i < K; i++) P[i]![sink] = 1 // every leaf -> sink (degenerate)
  for (let j = 0; j < K; j++) P[sink]![j] = 1 / K // sink -> uniform over leaves
  const groups = new Array<number>(N)
  for (let i = 0; i < K; i++) groups[i] = 0 // the leaves are one macro-state (the self)
  groups[sink] = 1 // the sink is the other macro-state
  return { P, groups }
}

// coarse-grain by a group-label array, the macro TPM averages each group's rows and sums its columns
function coarseGrain(P: number[][], groups: number[]): number[][] {
  const M = Math.max(...groups) + 1
  const size = new Array<number>(M).fill(0)
  for (const g of groups) size[g]!++
  const Q: number[][] = Array.from({ length: M }, () => new Array<number>(M).fill(0))
  for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) Q[groups[i]!]![groups[j]!]! += P[i]![j]!
  for (let a = 0; a < M; a++) for (let b = 0; b < M; b++) Q[a]![b]! /= size[a]! // average over the group's micro-states
  return Q
}

export function causalEmergence(input?: { K?: number }): {
  K: number
  microN: number
  eiMicro: number
  eiMacro: number
  emergence: number
  emerges: boolean
  byDegeneracy: { K: number; emergence: number }[]
  growsWithDegeneracy: boolean
  solved: boolean
} {
  const K = input?.K ?? 16
  const { P, groups } = buildFunnel(K)
  const Q = coarseGrain(P, groups)
  const eiMicro = effectiveInformation(P)
  const eiMacro = effectiveInformation(Q)
  const emergence = eiMacro - eiMicro
  const emerges = emergence > 0.3

  // the emergence should GROW with the degeneracy K (more interchangeable micro configurations funneling)
  const byDegeneracy: { K: number; emergence: number }[] = []
  for (const k of [2, 4, 8, 16, 32]) {
    const f = buildFunnel(k)
    byDegeneracy.push({ K: k, emergence: effectiveInformation(coarseGrain(f.P, f.groups)) - effectiveInformation(f.P) })
  }
  const growsWithDegeneracy = byDegeneracy[byDegeneracy.length - 1]!.emergence > byDegeneracy[0]!.emergence + 0.2

  const solved = emerges && growsWithDegeneracy
  return { K, microN: K + 1, eiMicro, eiMacro, emergence, emerges, byDegeneracy, growsWithDegeneracy, solved }
}

export default defineExperiment({
  id: 'selves/causal-emergence',
  title: 'a coarse-grained macro has more effective information than the degenerate micro',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = causalEmergence({ K: 16 })
    const ok = r.solved && r.emerges && r.growsWithDegeneracy
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'grouping degenerate micro configurations into a macro-state removes the degeneracy so the macro effective information exceeds the micro, growing with the degeneracy',
      metrics: {
        eiMicro: r.eiMicro,
        eiMacro: r.eiMacro,
        emergence: r.emergence,
        maxEmergence: r.byDegeneracy[r.byDegeneracy.length - 1]?.emergence ?? 0,
      },
      notes:
        'this adds a hand-built degenerate transition matrix, not one of the five base things, so it grounds the logic of downward causation rather than deriving it from the substrate',
    })
  },
})
