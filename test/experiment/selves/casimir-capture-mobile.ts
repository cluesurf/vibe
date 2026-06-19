// O0.1 completion, the mobile-capture confirmation. selves/casimir-vacuum-attraction showed the active vacuum
// exerts an inward Casimir pressure between two RIGID walls, and that the pressure strengthens as the gap narrows.
// A force that is always inward and grows as bodies approach must drive them together to contact. Here we confirm
// it mechanically, two MOVABLE plates, free to slide along x, are driven by the very pressure they feel, and we
// watch their separation.
//
// Each beat, each plate feels a net force equal to the vacuum density just OUTSIDE it minus the density just
// INSIDE it (toward the gap). The active vacuum suppresses the gap, so the inside density is lower, so the net
// force is inward, and the plate accumulates that force and steps inward when it crosses a threshold. Under the
// active vacuum the plates should CLOSE the gap (capture). Under the inert vacuum (create off, no churn) there is
// no density and no force, so the plates stay put (the control).
//
// Depth L2, the Casimir force shown to do mechanical work (drive mobile plates together), with the inert vacuum
// as the no-force control. It confirms the attraction from the five things can actually capture.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'
import {
  pairCollision,
  passThrough,
  type Collision,
} from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { chargeDensityProfile } from '@/code/measure/profile'

export default experiment({
  id: 'selves/casimir-capture-mobile',
  title:
    'the vacuum Casimir pressure drives two mobile plates together (capture), the inert vacuum leaves them fixed',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 20
    const beats = 400
    const threshold = 3 // accumulated force to step a plate one cell
    const minGap = 2 // plates stop when this close (contact)
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )
    const binOf = (cell: number): number => cell % side
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for both runs

    // run the movable-plate dynamics under a collision, return the gap over time.
    const runPlates = (
      collision: Collision,
    ): { gapStart: number; gapEnd: number; gapMin: number } => {
      let left = 5
      let right = 14
      const gapStart = right - left
      let accLeft = 0
      let accRight = 0
      let gapMin = gapStart
      const imposeWalls = (will: Will): void => {
        for (let cell = 0; cell < mesh.cellCount; cell++) {
          const x = cell % side
          if (x === left || x === right) {
            const base = cell * degree
            for (let d = 0; d < degree; d++) {
              will.data[base + d] = 1
            }
          }
        }
      }

      let current = makeWill(mesh)
      let scratch: Will = {
        mesh,
        data: new Int8Array(current.data.length),
      }
      imposeWalls(current)
      for (let t = 0; t < beats; t++) {
        beatInto({ src: current, dst: scratch, table, collision })
        const swap = current
        current = scratch
        scratch = swap
        imposeWalls(current)
        const prof = chargeDensityProfile({
          will: current,
          binOf,
          bins: side,
        })
        // net inward force = density just outside minus density just inside (toward the gap)
        const forceLeft = (prof[left - 1] ?? 0) - (prof[left + 1] ?? 0)
        const forceRight =
          (prof[right + 1] ?? 0) - (prof[right - 1] ?? 0)
        accLeft += forceLeft
        accRight += forceRight
        if (accLeft > threshold && right - left > minGap) {
          left += 1
          accLeft = 0
        }

        if (accRight > threshold && right - left > minGap) {
          right -= 1
          accRight = 0
        }

        const gap = right - left
        if (gap < gapMin) {
          gapMin = gap
        }
      }

      return { gapStart, gapEnd: right - left, gapMin }
    }

    const active = runPlates(pairCollision({ opposite, forward: true })) // the create vacuum (Casimir)
    const inert = runPlates(passThrough) // no churn, no force (control)

    // the active vacuum closes the gap (capture), the inert vacuum leaves it unchanged.
    const captured = active.gapEnd < active.gapStart - 2
    const inertStaysFixed = inert.gapEnd === inert.gapStart

    const ok = captured && inertStaysFixed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two movable plates driven by the vacuum pressure they feel CLOSE the gap between them under the active create vacuum (the Casimir force does mechanical work, a capture), while under the inert vacuum (no churn, no force) they stay fixed, confirming the attraction from the five things can actually pull mobile structures together',
      metrics: {
        activeGapStart: active.gapStart,
        activeGapEnd: active.gapEnd,
        activeGapMin: active.gapMin,
        inertGapStart: inert.gapStart,
        inertGapEnd: inert.gapEnd,
        captured: captured ? 1 : 0,
        inertStaysFixed: inertStaysFixed ? 1 : 0,
        beats,
      },
      control: { inertGapEnd: inert.gapEnd },
      notes:
        'the Casimir pressure from the arrow vacuum drives mobile plates together (capture), the inert vacuum leaves them fixed (no force). This completes O0.1, the emergent attraction does mechanical work. The plates are rigid mode-excluders, the next refinement is genuinely deformable matter structures, but the capture mechanism from the five things is confirmed',
    })
  },
})
