// P41: the Margenstern hyperbolic tilings, surveyed.
// Maurice Margenstern's program on hyperbolic cellular automata centers on two families:
// the {p,4} family (the pentagrid {5,4} and its relatives) and the {p,3} family (the
// heptagrid {7,3} and its relatives). P40 showed {5,4} and {7,3} are Lorentz-safe. Here
// we survey the rest of both families, to have the same data for all of them. The claim
// from P40 (hyperbolic curvature, not disorder, buys Lorentz safety) predicts they are
// all Lorentz-safe.
// See note/deterministic-substrate.md. Run: npx tsx code/experiment/p41-margenstern-tilings.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicTiling } from '@/code/substrate/hyperbolic-graph'
import { Graph, meanDegree } from '@/code/tool/graph'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { reachIsExponential } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// meanDegree lives in code/tool/graph, the exponential-reach classifier in
// code/measure/dimension.
const reachExponential = (g: Graph): boolean => reachIsExponential({ substrate: g, maxRadius: 16 })

interface TilingSpec {
  name: string
  p: number
  q: number
  depth: number
  threshold: number
}

const TILINGS: TilingSpec[] = [
  { name: 'pentagrid {5,4}', p: 5, q: 4, depth: 6, threshold: 0.9 },
  { name: '{6,4}', p: 6, q: 4, depth: 6, threshold: 1.1 },
  { name: '{8,4}', p: 8, q: 4, depth: 4, threshold: 1.5 },
  { name: 'heptagrid {7,3}', p: 7, q: 3, depth: 5, threshold: 0.8 },
  { name: '{8,3}', p: 8, q: 3, depth: 6, threshold: 0.85 },
  { name: '{9,3}', p: 9, q: 3, depth: 6, threshold: 0.85 },
]

export function margensternTilings(input: { seed: number }): Record<
  string,
  { size: number; degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }
> {
  const out: Record<string, { size: number; degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }> = {}
  for (const t of TILINGS) {
    const g = hyperbolicTiling({ p: t.p, q: t.q, depth: t.depth, connectThreshold: t.threshold, maxVertices: 2500 })
    const aniso = lorentzIsotropy({ substrate: g, samples: 3000, rng: makeRng({ seed: input.seed }) })
    out[t.name] = {
      size: g.size,
      degree: meanDegree(g),
      anisotropy: aniso.anisotropy,
      reach: reachExponential(g),
      lorentzSafe: aniso.anisotropy < 0.25,
    }
  }
  return out
}

export default experiment({
  id: 'substrate-survey/margenstern-tilings',
  title:
    'all the Margenstern {p,4} and {p,3} tilings are Lorentz-safe with exponential reach',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = margensternTilings({ seed: 2 })
    const all = Object.values(r)
    const allSafe = all.every((e) => e.lorentzSafe && e.anisotropy < 0.12 && e.reach)
    const ok = all.length === 6 && allSafe
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'both the {p,4} and {p,3} tiling families are Lorentz-safe across the board with small anisotropy and exponential reach',
      metrics: {
        tilingCount: all.length,
        maxAnisotropy: Math.max(...all.map((e) => e.anisotropy)),
      },
    })
  },
})
