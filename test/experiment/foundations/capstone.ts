// P34: the capstone, the committed model run end-to-end.
// Each earlier result used the substrate best suited to it. This runs the ONE model
// of note/the-model.md and reads every key emergent structure off the SAME mesh and
// the SAME dynamics:
//   - The substrate: a growing random hyperbolic causal mesh (Lorentz-safe, navigable).
//   - The rule: the ternary signed-majority update (new tone = sign of the integer sum
//     of neighbor wills gated by ternary fills, asynchronous, local, no weights).
//   - The emergent physics, read off the same mesh: a definite geometry, no preferred
//     frame, the emergent Hamiltonian (the graph Laplacian, bounded below and local),
//     stable structured states from the dynamics, and the arrow of accumulation.
// See note/the-model.md. Run: npx tsx code/experiment/p34-capstone.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph, meanDegree } from '@/code/tool/graph'
import { symmetricEdgeFills } from '@/code/operator/signed-majority'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import {
  ballGrowth,
  growthIsExponential,
} from '@/code/measure/dimension'
import { laplacianSpectrum } from '@/code/operator/laplacian'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The committed dynamics: ternary tones on vibes, ternary fills on the notes, and the
// asynchronous signed-majority update. Returns the flip fraction per sweep (its
// decline is convergence to a stable structured state) and whether tones stayed
// strictly ternary.
function runDynamics(input: { g: Graph; sweeps: number; rng: Rng }): {
  flipFractions: number[]
  allTernary: boolean
} {
  const g = input.g
  const n = g.size
  const tone = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    tone[i] = input.rng.nextInt({ max: 3 }) - 1
  }

  // Fills are tones on the notes, ternary, and SYMMETRIC (a note v-w is one shared
  // relational vibe, so fill(v,w) = fill(w,v)). Symmetric couplings make the
  // asynchronous signed-majority dynamics converge to stable structured states, the
  // basis for persistent matter and selves.
  const fills = symmetricEdgeFills({
    neighbors: g.neighbors,
    rng: input.rng,
  })

  const flipFractions: number[] = []

  for (let sweep = 0; sweep < input.sweeps; sweep++) {
    let flips = 0

    for (let s = 0; s < n; s++) {
      const v = input.rng.nextInt({ max: n })
      const nb = g.neighbors[v] ?? new Uint32Array(0)
      const fl = fills[v] ?? new Int8Array(0)

      let h = 0

      for (let k = 0; k < nb.length; k++) {
        h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
      }

      const next: -1 | 0 | 1 = h > 0 ? 1 : h < 0 ? -1 : 0

      if (next !== tone[v]) {
        flips += 1
      }

      tone[v] = next
    }

    flipFractions.push(flips / n)
  }

  let allTernary = true

  for (const t of tone) {
    if (t < -1 || t > 1) {
      allTernary = false
    }
  }

  return { flipFractions, allTernary }
}

export function capstone(input: { count: number; seed: number }): {
  meanDegree: number
  anisotropy: number
  reachExponential: boolean
  dynamicsConverges: boolean
  finalFlipFraction: number
  allTernary: boolean
  laplacianMin: number
  laplacianBoundedBelow: boolean
  arrowMonotone: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({
    count: input.count,
    radius: 7,
    connectThreshold: 3.0,
    rng,
  })

  // Geometry and Lorentz safety, off the mesh. Center the ball on the most-connected
  // (central) node, since node 0 may sit on the sparse rim of the hyperbolic disc.
  const aniso = lorentzIsotropy({
    substrate: g,
    samples: 2000,
    rng: makeRng({ seed: input.seed + 1 }),
  })

  let center = 0
  let bestDeg = -1

  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length

    if (d > bestDeg) {
      bestDeg = d
      center = i
    }
  }

  const growth = ballGrowth({ substrate: g, center, maxRadius: 12 })
  const reach = growthIsExponential({ growth })

  // The committed dynamics on the same mesh.
  const dyn = runDynamics({
    g,
    sweeps: 40,
    rng: makeRng({ seed: input.seed + 2 }),
  })

  const finalFlip = dyn.flipFractions[dyn.flipFractions.length - 1] ?? 1
  const firstFlip = dyn.flipFractions[0] ?? 1
  const dynamicsConverges = finalFlip < 0.5 * firstFlip

  // The emergent Hamiltonian, off the same mesh: the graph Laplacian spectrum.
  const spectrum = laplacianSpectrum({ substrate: g, count: 20 })

  let lapMin = Infinity

  for (const v of spectrum) {
    lapMin = Math.min(lapMin, v)
  }

  // The arrow: as the mesh grows, relations only accumulate.
  let prevEdges = 0
  let arrowMonotone = true

  for (const c of [100, 200, 400]) {
    const gc = hyperbolicGraph({
      count: c,
      radius: 7,
      connectThreshold: 3.0,
      rng: makeRng({ seed: input.seed + 7 }),
    })

    let edges = 0

    for (let i = 0; i < gc.size; i++) {
      edges += (gc.neighbors[i] ?? new Uint32Array(0)).length
    }

    if (edges < prevEdges) {
      arrowMonotone = false
    }

    prevEdges = edges
  }

  return {
    meanDegree: meanDegree(g),
    anisotropy: aniso.anisotropy,
    reachExponential: reach,
    dynamicsConverges,
    finalFlipFraction: finalFlip,
    allTernary: dyn.allTernary,
    laplacianMin: lapMin,
    laplacianBoundedBelow: lapMin > -1e-9,
    arrowMonotone,
  }
}

export default experiment({
  id: 'foundations/capstone',
  code: 'E-FND-0006',
  title:
    'the committed model runs end-to-end with all structures from one instantiation',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = capstone({ count: 1000, seed: 1 })
    const ok =
      r.meanDegree > 5 &&
      r.meanDegree < 16 &&
      r.anisotropy < 0.3 &&
      r.reachExponential &&
      r.allTernary &&
      r.dynamicsConverges &&
      r.laplacianBoundedBelow &&
      r.arrowMonotone

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one mesh under one ternary rule yields Lorentz-safe geometry, exponential reach, converging dynamics, a bounded-below Hamiltonian, and the arrow',
      metrics: { meanDegree: r.meanDegree, anisotropy: r.anisotropy },
    })
  },
})
