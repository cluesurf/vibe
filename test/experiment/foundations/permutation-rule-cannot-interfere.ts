// The exact reason the committed rule cannot interfere, stated as a measurement on the real mesh. Any
// deterministic rule pi on configurations lifts to a linear operator on formal superpositions of
// configurations (the Koopman lift), U |c> = |pi c>. A superposition psi = sum_c psi_c |c> becomes
// U psi = sum_c psi_c |pi c>, and the weight on a configuration d after the step is
//
//   |<d | U psi>|^2 = | sum over the c with pi c = d of psi_c |^2.
//
// If pi is a BIJECTION (the committed rule is a permutation of its slots), at most one c lands on each
// d, the sum has one term, and the weights are exactly relabelled: |<d|U psi>|^2 = |psi_{pi^-1 d}|^2.
// No two branches ever meet, so no cross term can appear, in any basis of configurations, for any choice
// of phases. Interference needs two distinct configurations to be sent to the same one, which is exactly
// what a reversible rule forbids. And a non-injective rule that does merge branches is not unitary (the
// merged weights do not add to one), so it buys interference by giving up conservation of the norm.
// A deterministic classical rule therefore cannot be BOTH unitary and interfering on its own
// configurations. Amplitudes with interference and a conserved norm have to live on a coarser variable
// whose phases are not the configuration's, which is the middle layer the program has not built.
//
// Measured on d4Mesh (odd side) with the momentum rule: 49 structured configurations (the vacuum and
// every single tone of either sign at the centre cell), each given a distinct cube-root-of-unity phase,
// pushed through four beats. Every image is distinct (no merge), the weight of every image equals the
// weight of its source to the last bit (cross term 0), and the norm is exactly conserved. The control is
// the conserving but irreversible sorting collision: the same 49 configurations merge (fewer distinct
// images than sources), the merged weights depart from the sources' weights by a nonzero cross term,
// and the pushed-forward norm changes. Depth L1: a known theorem about permutation matrices, measured
// on the committed rule and mesh, with a control that fails it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { Collision, headOnRotate } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { sortingCollision } from '@/code/control/conserving-irreversible-collision'
import { ComplexPair, pairAbs2, pairAdd, pairFromPhase } from '@/code/algebra/linear/complex-pair'

const SIDE = 5
const BEATS = 4

function configurationKey(will: Will): string {
  return Array.from(will.data).join('')
}

// push a set of (configuration, amplitude) branches through the rule and collect the image weights
function pushForward(input: {
  mesh: ReturnType<typeof d4Mesh>
  collision: Collision
  seeds: { will: Will; amplitude: ComplexPair }[]
}): {
  distinctImages: number
  worstCrossTerm: number
  normBefore: number
  normAfter: number
} {
  const images = new Map<string, { amplitude: ComplexPair; sourceWeight: number }>()

  let normBefore = 0

  for (const seed of input.seeds) {
    let will = { mesh: seed.will.mesh, data: Int8Array.from(seed.will.data) }

    for (let t = 0; t < BEATS; t++) {
      will = beat(will, input.collision)
    }

    const key = configurationKey(will)
    const weight = pairAbs2(seed.amplitude)

    normBefore += weight

    const existing = images.get(key)

    if (existing) {
      images.set(key, {
        amplitude: pairAdd(existing.amplitude, seed.amplitude),
        sourceWeight: existing.sourceWeight + weight,
      })
    } else {
      images.set(key, { amplitude: seed.amplitude, sourceWeight: weight })
    }
  }

  let worstCrossTerm = 0
  let normAfter = 0

  for (const image of images.values()) {
    const imageWeight = pairAbs2(image.amplitude)

    normAfter += imageWeight
    worstCrossTerm = Math.max(
      worstCrossTerm,
      Math.abs(imageWeight - image.sourceWeight),
    )
  }

  return {
    distinctImages: images.size,
    worstCrossTerm,
    normBefore,
    normAfter,
  }
}

export default experiment({
  id: 'foundations/permutation-rule-cannot-interfere',
  code: 'E-FND-0082',
  title:
    'the committed rule lifted to superpositions of configurations is a permutation matrix: 49 phased branches pushed through four beats land on 49 distinct configurations with every weight exactly relabelled (cross term 0) and the norm exactly conserved, so no basis of configurations can interfere, while a conserving irreversible rule merges branches, shows a nonzero cross term, and does not conserve the norm',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const degree = mesh.degree
    const centre = Math.floor(mesh.cellCount / 2)

    // 49 structured branches: the vacuum and each single tone of either sign at the centre cell
    const seeds: { will: Will; amplitude: ComplexPair }[] = []

    seeds.push({ will: makeWill(mesh), amplitude: pairFromPhase(0) })

    for (let direction = 0; direction < degree; direction++) {
      for (const tone of [1, -1] as const) {
        const will = makeWill(mesh)

        will.data[centre * degree + direction] = tone

        const index = seeds.length

        seeds.push({
          will,
          amplitude: pairFromPhase((2 * Math.PI * index) / 3),
        })
      }
    }

    const reversible = pushForward({
      mesh,
      collision: headOnRotate({ opposite }),
      seeds,
    })

    const irreversible = pushForward({
      mesh,
      collision: sortingCollision,
      seeds,
    })

    const noMerge = reversible.distinctImages === seeds.length
    const weightsRelabelled = reversible.worstCrossTerm === 0
    const normConserved = reversible.normAfter === reversible.normBefore
    const controlMerges = irreversible.distinctImages < seeds.length
    const controlInterferes = irreversible.worstCrossTerm > 1e-9
    const controlLosesNorm =
      Math.abs(irreversible.normAfter - irreversible.normBefore) > 1e-9

    const ok =
      noMerge &&
      weightsRelabelled &&
      normConserved &&
      controlMerges &&
      controlInterferes &&
      controlLosesNorm

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'forty-nine structured branches (the vacuum and every single tone of either sign at one cell), each with its own cube-root-of-unity phase, pushed four beats through the momentum-conserving knit on the odd-sided d4Mesh land on forty-nine distinct configurations, every image weight equals its source weight exactly, and the total weight is conserved exactly, so the lifted rule is a permutation matrix and no configuration basis can show a cross term for any phases, while the conserving irreversible sorting collision merges the same branches into fewer configurations, produces a nonzero cross term where they merge, and changes the total weight, so interference on configurations is available only to a rule that is not reversible',
      metrics: {
        branches: seeds.length,
        distinctImages: reversible.distinctImages,
        worstCrossTerm: reversible.worstCrossTerm,
        normBefore: Number(reversible.normBefore.toFixed(12)),
        normAfter: Number(reversible.normAfter.toFixed(12)),
      },
      control: {
        irreversibleDistinctImages: irreversible.distinctImages,
        irreversibleWorstCrossTerm: Number(
          irreversible.worstCrossTerm.toFixed(6),
        ),
        irreversibleNormAfter: Number(irreversible.normAfter.toFixed(6)),
      },
      notes:
        'The exact form of "the rule has no amplitudes": a reversible classical rule is a permutation matrix on its configurations, which relabels weights and never adds two branches. It follows that the middle layer the quantum program needs cannot be a phase assigned to configurations, it has to be a coarser variable whose evolution is not a permutation of its own values, such as a count or a density over many configurations. L1, a theorem measured on the committed rule with an irreversible control.',
    })
  },
})
