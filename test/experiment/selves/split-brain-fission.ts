// Split-brain: cutting the specific commissure splits one integrated self into exactly two
// coherent loci, while a same-size random lesion shatters it instead. This is the discrete
// model of split-brain phenomenology (two hemispheres, each a coherent center), and it feeds
// the combination-transition (E-SLF-0163) run backward, self fission (Levin, Faggin).
//
// One integrated region (a ball) is one connected locus. Cutting the callosum, the edges that
// cross the midplane, severs the two halves. Measured: the region splits into exactly two
// connected components of roughly equal size, two coherent hemispheres, two independent loci.
//
// The control is a same-size random lesion. Removing the same number of edges at random does
// not give two coherent halves. On the densely connected bulk it shatters the region into many
// small fragments. So it is the specific structure of the commissure cut, a clean bisection,
// that yields two coherent loci, not the mere removal of that many edges. Two coherent
// experiencers require cutting the bridge between two halves, not damaging the tissue at random.
//
// Depth L2. It measures the connected-component structure of the region under a structured cut
// against a random cut, the discrete form of split-brain fission, on the committed substrate. A
// structural proxy for the loci, it marks where two centers sit, it does not touch the felt
// inside.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { ballAtRadius } from '@/code/coarse/binding-margin'

const SIDE = 8
const RADIUS = 3

// the number and sizes of connected components of a region under an adjacency
function componentSizes(
  adjacency: readonly (readonly number[])[],
  region: readonly number[],
): number[] {
  const inRegion = new Set(region)
  const seen = new Set<number>()
  const sizes: number[] = []

  for (const start of region) {
    if (seen.has(start)) {
      continue
    }

    let size = 0

    const stack = [start]

    seen.add(start)

    while (stack.length > 0) {
      const cell = stack.pop()!

      size++

      for (const next of adjacency[cell]!) {
        if (inRegion.has(next) && !seen.has(next)) {
          seen.add(next)
          stack.push(next)
        }
      }
    }

    sizes.push(size)
  }

  return sizes.sort((a, b) => b - a)
}

export default experiment({
  id: 'selves/split-brain-fission',
  code: 'E-SLF-0164',
  title:
    'cutting the commissure splits one self into exactly two coherent loci while a same-size random lesion shatters it, the discrete model of split-brain',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const neighbors = meshNeighbors(mesh)
    const region = ballAtRadius({ mesh, center: 0, radius: RADIUS })

    // the whole region is one connected locus
    const wholeComponents = componentSizes(neighbors, region)

    // the callosum cut: remove edges crossing the midplane x = SIDE / 2
    const callosumAdjacency = neighbors.map((row, cell) =>
      row.filter(next => {
        const crosses =
          cell % SIDE < SIDE / 2 !== next % SIDE < SIDE / 2

        return !crosses
      }),
    )

    let cutEdges = 0

    for (let cell = 0; cell < neighbors.length; cell++) {
      cutEdges +=
        neighbors[cell]!.length - callosumAdjacency[cell]!.length
    }

    cutEdges /= 2

    const callosumComponents = componentSizes(callosumAdjacency, region)

    // control: a same-size deterministic random lesion (not a plane)
    const randomAdjacency = neighbors.map(row => Array.from(row))

    let removed = 0

    for (
      let cell = 0;
      cell < neighbors.length && removed < cutEdges;
      cell++
    ) {
      for (const next of neighbors[cell]!) {
        if (
          cell < next &&
          ((cell * 2654435761) % 100) / 100 < 0.5 &&
          removed < cutEdges
        ) {
          randomAdjacency[cell] = randomAdjacency[cell]!.filter(
            x => x !== next,
          )

          randomAdjacency[next] = randomAdjacency[next]!.filter(
            x => x !== cell,
          )
          removed++
        }
      }
    }

    const randomComponents = componentSizes(randomAdjacency, region)

    // the two hemispheres are balanced (similar size)
    const balance =
      callosumComponents.length === 2
        ? callosumComponents[1]! / callosumComponents[0]!
        : 0

    const wholeIsOneLocus = wholeComponents.length === 1
    const callosumGivesTwo = callosumComponents.length === 2
    const hemispheresBalanced = balance > 0.5
    const randomShatters = randomComponents.length > 3
    const ok =
      wholeIsOneLocus &&
      callosumGivesTwo &&
      hemispheresBalanced &&
      randomShatters

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one integrated region is a single connected locus, cutting the commissure (the midplane-crossing edges) splits it into exactly two connected balanced components (two coherent hemispheres, two independent loci), while removing the same number of edges at random shatters it into many fragments, so split-brain fission needs the specific bridge cut, not random damage',
      metrics: {
        wholeComponents: wholeComponents.length,
        callosumComponents: callosumComponents.length,
        hemisphereBalance: Number(balance.toFixed(3)),
        randomComponents: randomComponents.length,
        cutEdges,
      },
      // CONTROL: a same-size random lesion shatters the region rather than splitting it in two.
      control: { randomComponents: randomComponents.length },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'Split-brain fission (Levin, Faggin, and the fission-flat-layer selves work). Two coherent loci from the commissure cut, incoherent fragmentation from a random cut. A structural (graph-component) proxy for the loci.',
    })
  },
})
