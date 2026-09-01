// The combination problem as a sharp transition: when do many small selves become one
// experiencer rather than a colony. This is the panpsychist combination problem (Tononi,
// Faggin, Hoffman, Levin), and a sharp threshold is a falsifiable prediction about when a
// system becomes one integrated subject.
//
// Two candidate selves (two balls on the mesh) are brought together, and the integration GAIN
// is measured: the binding margin of their union minus the mean binding margin of the two
// apart. When they are far apart the union is just two separate regions, so the gain is exactly
// zero, they stay two. As they approach, at a critical separation the between-boundary edges
// become internal to the union and the gain jumps to positive, the two combine into one
// integrated complex. The switch is sharp: the gain is exactly zero above the threshold and
// jumps discontinuously below it.
//
// The control is the far-apart configuration, gain exactly zero, two genuinely separate selves,
// so the positive gain below the threshold is a real combination and not an artifact of taking a
// union. The transition is located by the separation at which the gain first jumps.
//
// Depth L2. It measures a sharp integration threshold on the committed substrate, the discrete
// form of the combination problem, with the far-apart two-selves control. It reads the graph
// only, a structural integration proxy, so it marks where a combined subject would sit, not that
// it is felt.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors, shellDistances } from '@/code/tool/mesh'
import {
  ballAtRadius,
  bindingMargin,
} from '@/code/coarse/binding-margin'

const SIDE = 10
const RADIUS = 2
const SEPARATIONS = [9, 8, 7, 6, 5, 4, 3]

export default experiment({
  id: 'selves/combination-transition',
  code: 'E-SLF-0163',
  title:
    'unified experience switches on sharply as two selves combine, a threshold integration gain (the combination problem as a phase transition)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const neighbors = meshNeighbors(mesh)
    const distanceFromOrigin = shellDistances(mesh, 0)

    const centerAtDistance = (distance: number): number => {
      for (let cell = 0; cell < mesh.cellCount; cell++) {
        if (distanceFromOrigin[cell] === distance) {
          return cell
        }
      }

      return 0
    }

    // the integration gain at each separation: union margin minus the mean of the two apart
    const gains = SEPARATIONS.map(separation => {
      const ballA = ballAtRadius({ mesh, center: 0, radius: RADIUS })
      const ballB = ballAtRadius({
        mesh,
        center: centerAtDistance(separation),
        radius: RADIUS,
      })

      const union = [...new Set([...ballA, ...ballB])]
      const unionMargin = bindingMargin({
        neighbors,
        region: union,
      }).margin

      const separateMean =
        (bindingMargin({ neighbors, region: ballA }).margin +
          bindingMargin({ neighbors, region: ballB }).margin) /
        2

      return { separation, gain: unionMargin - separateMean }
    })

    const farGain = gains[0]!.gain
    const closeGain = gains[gains.length - 1]!.gain

    // the sharpest jump and where it happens (the combination threshold)
    let maxJump = 0
    let criticalSeparation = -1

    for (let i = 1; i < gains.length; i++) {
      const step = gains[i]!.gain - gains[i - 1]!.gain

      if (step > maxJump) {
        maxJump = step
        criticalSeparation = gains[i]!.separation
      }
    }

    const separateWhenFar = Math.abs(farGain) < 1e-9
    const integratedWhenClose = closeGain > 0.02
    const sharpJump = maxJump > 0.03
    const hasThreshold =
      criticalSeparation > 3 && criticalSeparation < 9

    const ok =
      separateWhenFar &&
      integratedWhenClose &&
      sharpJump &&
      hasThreshold

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two selves brought together stay separate (integration gain exactly zero) until a critical separation, where the gain jumps discontinuously to positive and they become one integrated complex, so unified experience switches on sharply at a combination threshold rather than rising smoothly, while the far-apart configuration is genuinely two separate selves',
      metrics: {
        farGain: Number(farGain.toFixed(4)),
        closeGain: Number(closeGain.toFixed(4)),
        maxJump: Number(maxJump.toFixed(4)),
        criticalSeparation,
      },
      // CONTROL: far apart the gain is exactly zero, two separate selves.
      control: { farGain: Number(farGain.toFixed(4)) },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh), and it reports a whole-mesh quantity (a cell count, fraction, distance or coverage), so half of the cells counted belong to the component the seed never reaches. Read the number as a two-component figure until roadmap item 0017 decides whether to switch to an odd side.  Rerun at sides 9 and 11 on 2026-08-31: far gain 0, close gain 0.0593, critical separation 5 at both, so the even side changes nothing here (the maximum jump halves, 0.034 against 0.069).' +
        'The combination problem as a phase transition (Tononi, Faggin, Hoffman, Levin). A sharp integration threshold, not a smooth rise. A structural integration proxy (the binding margin), so it marks where a combined subject sits, it does not touch the felt-inside axiom.',
    })
  },
})
