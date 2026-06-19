// Is there an EMERGENT bound body in the pure momentum-conserving gas? A self needs a body that stays localized
// (so disturbances can radiate off it while it persists). A density blob diffuses (no binding). The strongest
// remaining candidate is a VORTEX, which carries conserved circulation, the best shot at a localized structure
// that resists spreading. We test it in a 2D square gas (a clean reduced model), a localized counterclockwise
// swirl under the momentum-conserving collision.
//
// It is NOT a bound body. The vortex fully DISPERSES, its charges spread from radius 6 to the whole lattice (the
// confined fraction drops to zero). It only REASSEMBLES because the integrable gas is exactly reversible and
// recurs (the circulation returns to its full value periodically). That recurrence is an artifact of the special
// integrable dynamics, not steady confinement, on a mixing gas the dispersed charges would not return. So the pure
// gas has no binding mechanism, a near-ideal gas cannot trap energy locally, consistent with the finding that the
// pure base produces churn and no selves. A bound body would need an attractive interaction the base does not
// have, and adding one would be a cheat.
//
// This LOCATES the bound body honestly. Identity is base (conserved charge), the radiation channel and bath are
// emergent and demonstrated (selves/emergent-soft-radiation, selves/bath-damps-soft-mode), but the bound,
// self-repairing body is the genuine open frontier, it does not emerge from the pure conserving gas.
//
// Depth L2, an honest negative, even a vortex disperses, the apparent persistence is reversible recurrence.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'

export default experiment({
  id: 'selves/no-emergent-bound-body',
  title:
    'no emergent bound body: even a vortex disperses, its persistence is only reversible recurrence',
  category: 'selves',
  substrates: ['square'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 40
    const beats = 120
    const radius = 6
    const mesh: Mesh = squareMesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )
    const rule: Collision = headOnRotate({ opposite })
    // square coin directions, 0 is +x, 1 is -x, 2 is +y, 3 is -y (verified from the mesh neighbour map).
    const dirVec: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    const cx = side / 2
    const cy = side / 2
    const boundary = side / 2
    const xy = (cell: number): [number, number] => [
      cell % side,
      Math.floor(cell / side),
    ]

    // a localized counterclockwise vortex, each cell within the radius gets a charge in its tangential direction.
    const vortex = (): Will => {
      const will = makeWill(mesh)
      for (let c = 0; c < mesh.cellCount; c++) {
        const [x, y] = xy(c)
        const dx = x - cx
        const dy = y - cy
        if (dx * dx + dy * dy > radius * radius) {
          continue
        }

        const tx = -dy
        const ty = dx
        let best = 0
        let bestDot = -Infinity
        for (let d = 0; d < degree; d++) {
          const dot = dirVec[d]![0] * tx + dirVec[d]![1] * ty
          if (dot > bestDot) {
            bestDot = dot
            best = d
          }
        }

        will.data[c * degree + best] = 1
      }

      return will
    }

    const circulation = (will: Will): number => {
      let L = 0
      for (let c = 0; c < mesh.cellCount; c++) {
        const [x, y] = xy(c)
        const dx = x - cx
        const dy = y - cy
        let px = 0
        let py = 0
        const b = c * degree
        for (let d = 0; d < degree; d++) {
          const t = will.data[b + d]!
          if (t !== 0) {
            px += t * dirVec[d]![0]
            py += t * dirVec[d]![1]
          }
        }

        L += dx * py - dy * px
      }

      return L
    }

    const confinedFraction = (
      will: Will,
    ): { ext: number; confined: number } => {
      let ext = 0
      let inside = 0
      let total = 0
      for (let c = 0; c < mesh.cellCount; c++) {
        const [x, y] = xy(c)
        const dx = x - cx
        const dy = y - cy
        const b = c * degree
        let on = false
        for (let d = 0; d < degree; d++) {
          if (will.data[b + d] !== 0) {
            on = true
            break
          }
        }

        if (!on) {
          continue
        }

        const r = Math.sqrt(dx * dx + dy * dy)
        if (r > ext) {
          ext = r
        }

        total++
        if (r <= 2 * radius) {
          inside++
        }
      }

      return { ext, confined: total > 0 ? inside / total : 0 }
    }

    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat
    let current = vortex()
    let scratch: Will = {
      mesh,
      data: new Int8Array(current.data.length),
    }
    const l0 = circulation(current)
    let maxExtent = 0
    let minConfined = 1
    let lateCirculationMax = 0
    for (let t = 1; t <= beats; t++) {
      beatInto({ src: current, dst: scratch, table, collision: rule })
      const swap = current
      current = scratch
      scratch = swap
      const will = current
      const { ext, confined } = confinedFraction(will)
      if (ext > maxExtent) {
        maxExtent = ext
      }

      if (confined < minConfined) {
        minConfined = confined
      }

      const ratio = Math.abs(circulation(will) / l0)
      if (t > beats / 2 && ratio > lateCirculationMax) {
        lateCirculationMax = ratio
      }
    }

    // the honest negative, the vortex DISPERSES (extent reaches the boundary, confined fraction drops to zero) and
    // its persistence is only reversible RECURRENCE (the circulation returns to near full late in the run), not
    // steady confinement, so the pure gas has no emergent bound body. PASS means we demonstrated this cleanly.
    const disperses = maxExtent >= boundary * 0.9
    const notConfined = minConfined <= 0.1
    const recurrenceArtifact = lateCirculationMax >= 0.8
    const ok = disperses && notConfined && recurrenceArtifact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pure momentum-conserving gas has no emergent bound body, even a vortex (the strongest candidate, carrying conserved circulation) fully disperses, its charges spread from the localized radius to the whole lattice (the confined fraction drops to zero), and it only reassembles because the integrable gas is exactly reversible and recurs (the circulation returns to near its full value late in the run), which is an artifact of the special dynamics not steady confinement, so a near-ideal gas cannot trap energy locally and a bound body would need an attractive interaction the base does not have, consistent with the pure base producing churn and no selves',
      metrics: {
        initialCirculation: l0,
        maxExtent: Math.round(maxExtent * 10),
        boundary,
        minConfinedFractionTimes100: Math.round(minConfined * 100),
        lateCirculationMaxTimes100: Math.round(
          lateCirculationMax * 100,
        ),
        disperses: disperses ? 1 : 0,
        notConfined: notConfined ? 1 : 0,
        recurrenceArtifact: recurrenceArtifact ? 1 : 0,
        beats,
      },
      control: { maxExtent: Math.round(maxExtent * 10), boundary },
      notes:
        'honest negative that LOCATES the bound body. Identity is base, the radiation channel and bath are emergent and demonstrated, but the bound self-repairing body does NOT emerge from the pure conserving gas (it disperses, the recurrence is a reversible artifact). A bound body needs an attractive interaction the base lacks, adding one is a cheat. The substrate self is identity (base) plus an emergent agency channel, the fully bound body remains the open frontier',
    })
  },
})
