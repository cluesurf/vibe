// P3 study: the addressing-versus-Lorentz fork, pushed.
// The question: can ONE substrate have exponential reach, Lorentz isotropy, and
// usable navigation at once? We sweep the connectivity of a hyperbolic random
// graph and measure all three, with the regular lattice and a Minkowski
// sprinkling as controls. If a hyperbolic random graph hits all three, that is a
// candidate both-worlds resolution: Lorentz-safe reach with greedy routing
// instead of Fibonacci addressing.
// Run: npx tsx code/experiment/p3-study.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { Substrate } from '~/core/substrate'
import { Graph } from '~/core/graph'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { lattice } from '~/substrate/lattice'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { ballGrowth, growthIsExponential } from '~/measure/dimension'
import { lorentzIsotropy } from '~/measure/lorentz'
import { greedyRoutingSuccess } from '~/measure/navigation'

interface Row {
  name: string
  size: number
  meanDegree: number
  reach: boolean
  anisotropy: number
  routeSuccess: number
}

function meanDegree(substrate: Substrate): number {
  if (substrate.form !== 'graph') {
    let total = 0
    for (let i = 0; i < substrate.size; i++) {
      total += (substrate.links[i] ?? new Uint32Array(0)).length
    }
    return total / Math.max(1, substrate.size)
  }
  let total = 0
  for (let i = 0; i < substrate.size; i++) {
    total += (substrate.neighbors[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, substrate.size)
}

function evaluate(input: { name: string; substrate: Substrate; graph?: Graph }): Row {
  const rng = makeRng({ seed: 17 })
  const growth = ballGrowth({ substrate: input.substrate, center: 0, maxRadius: 12 })
  const iso = lorentzIsotropy({ substrate: input.substrate, samples: 400, rng })
  const route = input.graph
    ? greedyRoutingSuccess({ graph: input.graph, trials: 600, rng })
    : { successRate: 0, meanStretch: 0, trials: 0 }
  return {
    name: input.name,
    size: input.substrate.size,
    meanDegree: meanDegree(input.substrate),
    reach: growthIsExponential({ growth }),
    anisotropy: iso.anisotropy,
    routeSuccess: route.successRate,
  }
}

export function main(): void {
  const rows: Row[] = []

  // The hyperbolic random graph at several connectivities.
  for (const threshold of [0.8, 1.2, 1.6, 2.2, 3.0]) {
    const rng = makeRng({ seed: 100 + Math.round(threshold * 10) })
    const g = hyperbolicGraph({
      count: 1500,
      radius: 7,
      connectThreshold: threshold,
      rng,
    })
    rows.push(evaluate({ name: `hyperbolic t=${threshold}`, substrate: g, graph: g }))
  }

  // Controls.
  rows.push(
    evaluate({
      name: 'lattice 3D (lorentz)',
      substrate: lattice({ dimension: 3, extent: 9, signature: 'lorentzian' }),
    }),
  )
  const rng = makeRng({ seed: 5 })
  rows.push(
    evaluate({
      name: 'sprinkle M^3',
      substrate: sprinkleMinkowski({ dimension: 3, count: 1200, rng }),
    }),
  )

  console.log('P3 study: reach + isotropy + navigability')
  console.log(
    '  substrate              size  meanDeg  reach   anisotropy  routeSuccess',
  )
  for (const r of rows) {
    console.log(
      `  ${r.name.padEnd(22)} ${String(r.size).padStart(4)}  ${r.meanDegree.toFixed(1).padStart(6)}  ${String(r.reach).padStart(5)}  ${r.anisotropy.toFixed(3).padStart(9)}  ${r.routeSuccess.toFixed(3).padStart(11)}`,
    )
  }
  console.log('')
  console.log('  both-worlds target: reach=true, anisotropy<0.25, routeSuccess high.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
