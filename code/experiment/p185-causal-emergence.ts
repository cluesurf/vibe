// P185: causal emergence, the macro (self) level has MORE causal power than the micro substrate. (Hoel causal emergence, P116, P168, related-works.md theme 11/13.)
//
// The free-will and downward-causation story needs one rigorous fact, a coarse-grained MACRO level (a self)
// can be a more powerful CAUSE than the micro substrate beneath it, even though the macro is just a
// coarse-graining of the micro (no new ingredient, no base change). Hoel's measure is EFFECTIVE INFORMATION
// (EI), the information an intervention that sets the state gives about the next state. The driver of
// emergence is DEGENERACY, when MANY micro-states funnel to the SAME future, the effect cannot tell the
// causes apart, so the micro is causally weak. Grouping the degenerate causes into ONE macro-state removes
// the degeneracy, and the macro becomes a sharper cause. We model the churning substrate as many micro
// configurations of a self all funneling to one attractor (the self's macro state), and show
// EI(macro) > EI(micro), growing with the degeneracy. This makes the self a genuine author atop a fixed
// micro rule, the legitimacy the macro-compatibilist free will needs (Conway-Kochen is about MICRO
// determinism, this is a MACRO claim). Run: npx tsx code/experiment/p185-causal-emergence.ts

import { pathToFileURL } from 'node:url'

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

export function main(): void {
  const r = causalEmergence()
  console.log('P185: causal emergence, the macro (self) level has more causal power than the micro substrate')
  console.log('')
  console.log(`  ${r.microN} micro-states (${r.K} interchangeable self-configurations funneling to one attractor) grouped into 2 macro-states`)
  console.log(`  effective information, MICRO ${r.eiMicro.toFixed(2)} bits vs MACRO ${r.eiMacro.toFixed(2)} bits`)
  console.log(`  causal emergence (macro minus micro) = ${r.emergence.toFixed(2)} bits -> the macro is the stronger cause: ${r.emerges}`)
  console.log('')
  console.log('  the emergence GROWS with the degeneracy (more interchangeable micro configurations):')
  for (const x of r.byDegeneracy) console.log(`    ${x.K} configurations -> causal emergence ${x.emergence.toFixed(2)} bits`)
  console.log(`  grows with degeneracy: ${r.growsWithDegeneracy}`)
  console.log('')
  console.log('  => a coarse-grained self can be the real author of its dynamics atop a fixed micro rule, no base change.')
  console.log('     this is a MACRO claim, so it does not conflict with micro determinism (the Conway-Kochen tension).')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
