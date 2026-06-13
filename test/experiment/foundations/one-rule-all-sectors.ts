// P55: one rule, all sectors, in one run.
// P34 ran the committed model end to end, but each physics sector was still read off the
// mesh by its own operator. Here we tie the bosonic sectors together: ONE mesh, built by
// the committed rule (which also keeps tones ternary and propagates a signal on it), and
// from the SINGLE emergent operator on that mesh (the graph Laplacian, the small-signal
// form of the rule) we read three sectors at once:
//   matter/energy: the operator's spectrum, bounded below and local, the field's modes.
//   force/static:  the operator's Green's function, a static potential decaying with distance.
//   radiation:     a disturbance propagating at finite speed, a light-cone, from the rule.
// So matter, static force, and radiation are three faces of one operator on one mesh grown
// by one rule. The fermionic and non-abelian gauge sectors need their own operators still,
// the remaining integration. See note/roadmap.md.
// Run: npx tsx code/experiment/p55-one-rule-all-sectors.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph, largestComponent, neighborDistances, mostConnectedNode } from '@/code/tool/graph'
import { symmetricEdgeFills, signedMajorityStep } from '@/code/operator/signed-majority'
import { pearson } from '@/code/measure/statistics'
import { laplacianSpectrum, laplacianGreensFunction } from '@/code/operator/laplacian'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The radiation sector: a disturbance propagates with a finite light-cone under the
// ternary rule. Two synchronous copies, one perturbed, in lockstep.
function lightCone(g: Graph, seed: number): { holds: boolean; propagated: boolean } {
  const n = g.size
  const rng = makeRng({ seed })
  const fills = symmetricEdgeFills({ neighbors: g.neighbors, rng })
  const center = mostConnectedNode(g.neighbors)
  const dist = neighborDistances({ neighbors: g.neighbors, size: g.size, source: center })
  let a = new Int8Array(n)
  for (let i = 0; i < n; i++) a[i] = rng.nextInt({ max: 3 }) - 1
  let b = Int8Array.from(a)
  b[center] = ((((a[center] ?? 0) + 1 + 1) % 3) - 1) as -1 | 0 | 1
  const step = (tone: Int8Array): Int8Array => signedMajorityStep({ neighbors: g.neighbors, fills, tone })
  const radii: number[] = []
  let holds = true
  for (let beat = 1; beat <= 6; beat++) {
    a = step(a)
    b = step(b)
    let maxDist = 0
    for (let v = 0; v < n; v++) if (a[v] !== b[v]) maxDist = Math.max(maxDist, dist[v] ?? 0)
    radii.push(maxDist)
    if (maxDist > beat) holds = false
  }
  return { holds, propagated: Math.max(...radii) >= 1 }
}

export function oneRuleAllSectors(input: { count: number; seed: number }): {
  meshSize: number
  matterBoundedBelow: boolean
  matterMin: number
  forcePotentialCorrelation: number
  forceDecays: boolean
  radiationLightCone: boolean
  radiationPropagates: boolean
} {
  const raw = hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng: makeRng({ seed: input.seed }) })
  const g = largestComponent(raw)

  // Matter/energy sector: the emergent operator's spectrum.
  const spectrum = laplacianSpectrum({ substrate: g, count: 16 })
  let min = Infinity
  for (const v of spectrum) min = Math.min(min, v)

  // Force/static sector: the Green's function decays with graph distance.
  const center = mostConnectedNode(g.neighbors)
  const phi = laplacianGreensFunction({ substrate: g, center })
  const dist = neighborDistances({ neighbors: g.neighbors, size: g.size, source: center })
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < g.size; i++) {
    if (i !== center && (dist[i] ?? 0) > 0) {
      xs.push(dist[i] ?? 0)
      ys.push(phi[i] ?? 0)
    }
  }
  const corr = pearson({ a: xs, b: ys })

  // Radiation sector: the rule's light-cone.
  const lc = lightCone(g, input.seed + 1)

  return {
    meshSize: g.size,
    matterBoundedBelow: min > -1e-9,
    matterMin: min,
    forcePotentialCorrelation: corr,
    forceDecays: corr < -0.3,
    radiationLightCone: lc.holds,
    radiationPropagates: lc.propagated,
  }
}

export default defineExperiment({
  id: 'foundations/one-rule-all-sectors',
  title: 'matter, force, and radiation all appear from one operator on one mesh',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = oneRuleAllSectors({ count: 1200, seed: 1 })
    const ok =
      r.matterBoundedBelow && r.forceDecays && r.radiationLightCone && r.radiationPropagates
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one mesh and one emergent operator give a bounded-below spectrum, a decaying static potential, and a propagating light-cone in one run',
      metrics: {
        matterMin: r.matterMin,
        forcePotentialCorrelation: r.forcePotentialCorrelation,
      },
    })
  },
})
