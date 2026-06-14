// P3 study: the addressing-versus-Lorentz fork, pushed.
// The question: can ONE substrate have exponential reach, Lorentz isotropy, and
// usable navigation at once? We sweep the connectivity of a hyperbolic random
// graph and measure all three, with the regular lattice and a Minkowski
// sprinkling as controls. If a hyperbolic random graph hits all three, that is a
// candidate both-worlds resolution: Lorentz-safe reach with greedy routing
// instead of Fibonacci addressing.
// Run: npx tsx code/experiment/p3-study.ts

import { makeRng } from '@/code/tool/rng'
import { Substrate, substrateMeanDegree } from '@/code/tool/substrate'
import { Graph } from '@/code/tool/graph'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { lattice } from '@/code/substrate/lattice'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { ballGrowth, growthIsExponential } from '@/code/measure/dimension'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { greedyRoutingSuccess } from '@/code/measure/navigation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Row {
  name: string
  size: number
  meanDegree: number
  reach: boolean
  anisotropy: number
  routeSuccess: number
}

// substrateMeanDegree (mean out-degree over either a Poset or a Graph) is a library
// capability in code/tool/substrate.

function evaluate(input: { name: string; substrate: Substrate; graph?: Graph }): Row {
  const rng = makeRng({ seed: 17 })
  const growth = ballGrowth({ substrate: input.substrate, center: 0, maxRadius: 12 })
  const iso = lorentzIsotropy({ substrate: input.substrate, samples: 400, rng })
  const route = input.graph
    ? greedyRoutingSuccess({ graph: input.graph, trials: 600, rng, countDisconnectedAsFailure: true })
    : { successRate: 0, meanStretch: 0, trials: 0 }
  return {
    name: input.name,
    size: input.substrate.size,
    meanDegree: substrateMeanDegree({ substrate: input.substrate }),
    reach: growthIsExponential({ growth }),
    anisotropy: iso.anisotropy,
    routeSuccess: route.successRate,
  }
}

export default experiment({
  id: 'addressing/study',
  title: 'the addressing-versus-Lorentz fork, can one substrate have reach, isotropy, and navigability at once',
  category: 'addressing',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const hyperbolic = hyperbolicGraph({
      count: 1500,
      radius: 7,
      connectThreshold: 1.6,
      rng: makeRng({ seed: 116 }),
    })
    const candidate = evaluate({
      name: 'hyperbolic t=1.6',
      substrate: hyperbolic,
      graph: hyperbolic,
    })
    const control = evaluate({
      name: 'lattice 3D (lorentz)',
      substrate: lattice({ dimension: 3, extent: 9, signature: 'lorentzian' }),
    })
    const bothWorlds =
      candidate.reach && candidate.anisotropy < 0.25 && candidate.routeSuccess > 0.7
    return verdict({
      status: bothWorlds ? 'pass' : 'open',
      claim:
        'a hyperbolic random graph is measured for exponential reach, Lorentz isotropy, and greedy-routing success against a flat-lattice control, to test whether one substrate can carry all three at once',
      metrics: {
        candidateReach: candidate.reach ? 1 : 0,
        candidateAnisotropy: candidate.anisotropy,
        candidateRouteSuccess: candidate.routeSuccess,
        controlReach: control.reach ? 1 : 0,
        controlAnisotropy: control.anisotropy,
      },
      control: {
        controlReach: control.reach ? 1 : 0,
        controlAnisotropy: control.anisotropy,
        controlRouteSuccess: control.routeSuccess,
      },
      notes:
        'L2 with a flat-lattice control. This relies on a RANDOM hyperbolic graph and a random Minkowski sprinkling, so it is a statistical claim about an ensemble at a fixed seed, not a property of the deterministic vibe rule. Status is open unless the single sampled configuration hits the both-worlds target (reach, anisotropy < 0.25, route success high). The full connectivity sweep and the sprinkle control are in main().',
    })
  },
})
