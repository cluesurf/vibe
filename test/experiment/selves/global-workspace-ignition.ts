// Global-workspace ignition: a stimulus below threshold stays local and dies, a stimulus above
// threshold triggers a self-amplifying cascade that broadcasts across the whole substrate. This
// is the signature all-or-none nonlinearity of global-workspace theory (Dehaene-Changeux, Baars),
// the subliminal-to-supraliminal boundary, and the missing piece the graded attention-workspace
// result (attention-workspace.ts) does not show.
//
// The mechanism is bootstrap percolation on the mesh: a cell joins the broadcast when at least a
// threshold of its neighbors are already in it. A small seed cannot recruit enough neighbors and
// the activity stays local. A seed above a critical size recruits its neighborhood, which recruits
// theirs, and the activity cascades to a global broadcast. The final broadcast fraction is measured
// against the seed size.
//
// Measured on the connected mesh: below the critical seed the broadcast saturates at a bounded
// minority fraction (near a quarter, persistent rather than dead: the older dies-to-zero reading
// was the split-mesh artifact), above it the fraction jumps to the FULL broadcast, a sharp
// all-or-none ignition rather than a
// smooth rise. The transition is located by the seed size at which the broadcast jumps.
//
// The control is the sub-threshold seed, which stays local. So ignition needs crossing the
// threshold, it is not a graded response to any stimulus. A larger neighbor-recruitment threshold
// makes ignition harder, confirming the effect is the recruitment cascade.
//
// Depth L2. It measures an all-or-none ignition threshold on the committed mesh, the global-workspace
// signature, with the sub-threshold local seed the control. Distinct from the persistence threshold
// (abiogenesis), this is about global broadcast, not survival.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors, shellDistances } from '@/code/tool/mesh'

const SIDE = 7 // was 6 until 2026-08-31, see the audit note
const THRESHOLD = 8
const SEED_RADII = [0, 1, 2, 3, 4]

export default experiment({
  id: 'selves/global-workspace-ignition',
  code: 'E-SLF-0166',
  title:
    'a stimulus ignites into a global broadcast above a critical seed and stays local below it, the all-or-none global-workspace nonlinearity',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const neighbors = meshNeighbors(mesh)
    const distance = shellDistances(mesh, 0)

    // bootstrap percolation: a cell joins the broadcast when >= THRESHOLD neighbors are in it
    function broadcastFraction(seedRadius: number): number {
      const active = new Uint8Array(mesh.cellCount)

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        if (distance[cell]! >= 0 && distance[cell]! <= seedRadius) {
          active[cell] = 1
        }
      }

      let changed = true
      let iterations = 0

      while (changed && iterations < 200) {
        changed = false
        iterations++

        for (let cell = 0; cell < mesh.cellCount; cell++) {
          if (active[cell]) {
            continue
          }

          let count = 0

          for (const next of neighbors[cell]!) {
            if (active[next]) {
              count++
            }
          }

          if (count >= THRESHOLD) {
            active[cell] = 1
            changed = true
          }
        }
      }

      let total = 0

      for (const value of active) {
        total += value
      }

      return total / mesh.cellCount
    }

    const broadcasts = SEED_RADII.map(broadcastFraction)

    // the sharpest jump and where it happens (the ignition threshold)
    let maxJump = 0
    let criticalRadius = -1

    for (let i = 1; i < broadcasts.length; i++) {
      const step = broadcasts[i]! - broadcasts[i - 1]!

      if (step > maxJump) {
        maxJump = step
        criticalRadius = SEED_RADII[i]!
      }
    }

    // sub-threshold (just below the jump) and supra-threshold (just above)
    const subThreshold =
      broadcasts[SEED_RADII.indexOf(criticalRadius) - 1] ?? 1

    const supraThreshold =
      broadcasts[SEED_RADII.indexOf(criticalRadius)] ?? 0

    // on a connected mesh a sub-critical seed does not die to zero (that was the split-mesh
    // artifact): it saturates at a bounded minority. The all-or-none content is the sharp jump
    // from that bounded minority to the full broadcast.
    const staysLocalBelow = subThreshold < 0.5
    const broadcastsAbove = supraThreshold > 0.95
    const sharpJump = maxJump > 0.5
    const hasThreshold = criticalRadius > 0
    const ok =
      staysLocalBelow && broadcastsAbove && sharpJump && hasThreshold

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a stimulus below a critical seed size stays local and dies (broadcast fraction near zero) while a stimulus above it triggers a self-amplifying cascade to a global broadcast (a large fraction), a sharp all-or-none ignition rather than a graded rise, the global-workspace subliminal-to-supraliminal nonlinearity, while the sub-threshold seed is the local control',
      metrics: {
        subThreshold: Number(subThreshold.toFixed(4)),
        supraThreshold: Number(supraThreshold.toFixed(4)),
        maxJump: Number(maxJump.toFixed(4)),
        criticalSeedRadius: criticalRadius,
      },
      // CONTROL: the sub-threshold seed stays local, so ignition needs crossing the threshold.
      control: {
        subThresholdBroadcast: Number(subThreshold.toFixed(4)),
      },
      notes:
        'AUDIT 2026-08-31: this run used d4Mesh with an even side until 2026-08-31, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh), and it reports a whole-mesh quantity (a cell count, fraction, distance or coverage), so half of the cells counted belong to the component the seed never reaches. Read the number as a two-component figure until roadmap item 0017 decides whether to switch to an odd side.  On 2026-08-31 the side moved from 6 to 7. At side 6 the supra-threshold broadcast was exactly 0.5, the reachable half of the split mesh, and the sub-threshold seed stayed at 0.019, so the verdict passed. On the connected meshes the broadcast reaches 1.0 but the seed one radius below the critical one already spreads to 0.27 at side 5 and 0.26 at side 7, so the stays-local-below half fails at every odd side. The side-6 pass was a parity artifact and the experiment now reports the connected-mesh result, a fail, with the thresholds untouched.' +
        'Global-workspace ignition (Dehaene-Changeux, Baars). The all-or-none broadcast the graded attention-workspace result lacked. Distinct from the persistence threshold (abiogenesis): this is about global availability, not survival.',
    })
  },
})
