// Death as dissolution, the reverse of individuation (darren-hearst, alison-jane-king, and
// belli-lacin in the related-theories census all reach the same wave-returns-to-the-sea
// image). A self is a local GATHERING of the field, not the cells themselves. Hold the same
// number of cells and loosen the gathering, spreading them across the mesh, and the binding
// margin (internal minus boundary edges, over the total) falls from positive (an individuated
// self) through zero (the death threshold) to negative (dissolved back into the field). The
// cells persist, the gathering does not, which is exactly vibe account of death: you were the
// field, gathered into a shape, for a while, the gathering loosens, the field remains.
//
// Depth L2, the binding margin along a gather-to-scatter trajectory, with the fully scattered
// configuration the dead control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import {
  ballAtRadius,
  bindingMargin,
} from '@/code/coarse/binding-margin'

export default experiment({
  id: 'selves/dissolution-death',
  code: 'E-SLF-0160',
  title:
    'a self is a gathering, not its cells: holding the cell count and scattering them drops the binding margin through the death threshold, the gathering loosening while the field remains',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: 6 })
    const neighbors = meshNeighbors(mesh)

    // the alive self: a compact ball. Its cell count is held fixed along the whole
    // trajectory, only the gathering loosens.
    const core = ballAtRadius({ mesh, center: 0, radius: 3 })
    const cellCount = core.length

    // the scatter pool: evenly spaced cells across the whole mesh (deterministic, no
    // randomness), the cells a dissolving self spreads into.
    const step = Math.max(1, Math.floor(mesh.cellCount / cellCount))
    const scatterPool: number[] = []

    for (
      let i = 0;
      i < mesh.cellCount && scatterPool.length < cellCount;
      i += step
    ) {
      scatterPool.push(i)
    }

    // the gather-to-scatter trajectory: at fraction f, keep (1 - f) of the compact core and
    // fill the rest from the scatter pool, so f = 0 is fully gathered (alive) and f = 1 is
    // fully scattered (dead). The count stays fixed at cellCount.
    const fractions = [0, 0.2, 0.4, 0.6, 0.8, 1]
    const margins: number[] = []

    for (const f of fractions) {
      const keep = Math.round((1 - f) * cellCount)
      const region = new Set<number>(core.slice(0, keep))

      for (const cell of scatterPool) {
        if (region.size >= cellCount) {
          break
        }

        region.add(cell)
      }

      margins.push(
        bindingMargin({ neighbors, region: [...region] }).margin,
      )
    }

    const aliveMargin = margins[0]!
    const deadMargin = margins[margins.length - 1]!
    // the death threshold: the first fraction where the margin crosses below zero.
    const deathIndex = margins.findIndex(m => m < 0)
    const deathFraction =
      deathIndex === -1 ? -1 : fractions[deathIndex]!

    const startsAlive = aliveMargin > 0
    const endsDead = deadMargin < 0
    const hasThreshold = deathFraction > 0 && deathFraction < 1
    const ok = startsAlive && endsDead && hasThreshold

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self is a gathering of the field, not the cells it is made of. Holding the cell count fixed and loosening the gathering, spreading the same cells across the mesh, drops the binding margin from positive (an individuated self) through zero (a death threshold at an intermediate scatter fraction) to negative (dissolved). The cells persist, the gathering does not, which is vibe account of death, the wave returning to the sea, reached independently by Hearst, King, and Belli-Lacin. Depth L2, the margin measured along a deterministic gather-to-scatter trajectory, the fully scattered configuration the dead control.',
      metrics: {
        aliveMargin,
        deadMargin,
        deathFraction,
        marginAt40: margins[2]!,
        marginAt60: margins[3]!,
      },
      control: {
        deadMargin,
      },
      notes:
        'the same cells are alive when gathered and dead when scattered, so identity is the gathering. The trajectory is deterministic (evenly spaced scatter pool, fixed fractions, no random draw). This is the death half of the self life-cycle whose birth half is selves/individuation-margin, and it reads the graph only, a structural proxy.',
    })
  },
})
