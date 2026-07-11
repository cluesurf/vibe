// Where the strong two-ended correlation must come from: the classical ceiling.
//
// E-QTM-0037 showed the two-ended mechanism is real and causal: a future point in the
// common future of two spacelike past points correlates them, a disconnected point
// does not. The natural next question is whether that correlation can be STRENGTHENED
// into the strong, flat correlation a Bell pair needs, by fixing more of the future
// boundary. This measures it, and finds a ceiling.
//
// The connected three-point correlation of the past pair with a future region, as a
// function of the region size:
//   - a causally-connected single cell gives a small nonzero correlation (E-QTM-0037),
//   - a causally-disconnected region gives exactly zero (the causal control), and
//   - ENLARGING the connected future region does NOT strengthen the correlation, it
//     washes it out toward zero (the collective charge of a larger region averages
//     over the fine correlation).
//
// So the classical reversible rule's two-ended correlation is real and causal but
// bounded weak, and it does not grow with the future boundary. The strong, flat
// version cannot come from the classical two-ended route. It has to come from the
// emergent quantum layer, the same owed piece as the single definite outcome. This
// experiment does not solve that, it LOCATES it: the two-ended strength lives at the
// quantum layer, not in the classical rule.
//
// Grade L2: a measured ceiling on the classical two-ended correlation, with the
// causal control (disconnected region gives zero) and the size control (a larger
// connected region does not strengthen it). Deterministic ensemble, no random.

import { squareMesh, meshNeighbors } from '@/code/tool/mesh'
import { makeWill, cellTone, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIDE = 61
const T_MID = 5
const T_FINAL = 14
const SEPARATION = 4
const REGION_SIDES = [1, 3, 5, 7, 9]

export default experiment({
  id: 'quantum/two-ended-classical-ceiling',
  code: 'E-QTM-0040',
  title:
    'the classical two-ended correlation is causal but does not strengthen with a larger future boundary (it washes out), so the strong flat correlation must come from the emergent quantum layer, not the classical rule',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const mesh = squareMesh({ side: SIDE })

    meshNeighbors(mesh)

    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const collision = pairCollision({ opposite })
    const centre = SIDE >> 1
    const cellAt = (x: number, y: number): number =>
      (((y % SIDE) + SIDE) % SIDE) * SIDE + (((x % SIDE) + SIDE) % SIDE)

    const sign = (cell: number, state: Will): number => {
      const value = cellTone(state, cell)

      return value > 0 ? 1 : value < 0 ? -1 : 0
    }

    const regionCharge = (
      state: Will,
      cx: number,
      cy: number,
      side: number,
    ): number => {
      const half = (side - 1) / 2

      let charge = 0

      for (let yy = -half; yy <= half; yy++) {
        for (let xx = -half; xx <= half; xx++)
          charge += cellTone(state, cellAt(cx + xx, cy + yy))
      }

      return charge > 0 ? 1 : charge < 0 ? -1 : 0
    }

    type Record = {
      a: number
      b: number
      near: Map<number, number> // connected future region charge sign, by side
      far: Map<number, number> // disconnected future region charge sign, by side
    }
    const records: Record[] = []

    for (let dy = -9; dy <= 9; dy++) {
      for (let dx = -9; dx <= 9; dx++) {
        for (let phase = 0; phase < 3; phase++) {
          const will = makeWill(mesh)

          for (let yy = -1; yy <= 1; yy++) {
            for (let xx = -1; xx <= 1; xx++) {
              const cell = cellAt(centre + dx + xx, centre + dy + yy)
              const base = cell * mesh.degree

              for (let k = 0; k < mesh.degree; k++) {
                will.data[base + k] =
                  ((((xx + yy + k + phase) % 3) + 3) % 3) - 1
              }
            }
          }

          let mid = will

          for (let t = 0; t < T_MID; t++) mid = beat(mid, collision)

          let future: Will = { ...mid, data: mid.data.slice() }

          for (let t = T_MID; t < T_FINAL; t++)
            future = beat(future, collision)

          const near = new Map<number, number>()
          const far = new Map<number, number>()

          for (const side of REGION_SIDES) {
            near.set(side, regionCharge(future, centre, centre, side))
            far.set(
              side,
              regionCharge(future, centre + 22, centre + 22, side),
            )
          }

          records.push({
            a: sign(
              cellAt(centre - Math.ceil(SEPARATION / 2), centre),
              mid,
            ),
            b: sign(
              cellAt(centre + Math.floor(SEPARATION / 2), centre),
              mid,
            ),
            near,
            far,
          })
        }
      }
    }

    const mean = (xs: number[]): number =>
      xs.reduce((s, x) => s + x, 0) / xs.length

    const connectedTriple = (q: number[]): number => {
      const a = records.map(r => r.a)
      const b = records.map(r => r.b)
      const meanA = mean(a)
      const meanB = mean(b)
      const meanQ = mean(q)
      const ab = mean(records.map(r => r.a * r.b))
      const abq = mean(records.map((r, j) => r.a * r.b * (q[j] ?? 0)))
      const bq = mean(records.map((r, j) => r.b * (q[j] ?? 0)))
      const aq = mean(records.map((r, j) => r.a * (q[j] ?? 0)))

      return (
        abq -
        meanA * bq -
        meanB * aq -
        meanQ * ab +
        2 * meanA * meanB * meanQ
      )
    }

    const singleConnected = Math.abs(
      connectedTriple(records.map(r => r.near.get(1) ?? 0)),
    )

    const largestConnected = Math.abs(
      connectedTriple(
        records.map(
          r => r.near.get(REGION_SIDES[REGION_SIDES.length - 1]!) ?? 0,
        ),
      ),
    )

    let disconnectedMax = 0

    for (const side of REGION_SIDES) {
      disconnectedMax = Math.max(
        disconnectedMax,
        Math.abs(
          connectedTriple(records.map(r => r.far.get(side) ?? 0)),
        ),
      )
    }

    // 1. The causally-connected single future cell gives a nonzero correlation.
    const causalEffectPresent = singleConnected > 0.002

    // 2. A causally-disconnected future region gives essentially none (the control).
    const disconnectedIsZero = disconnectedMax < 0.001

    // 3. Enlarging the connected region does NOT strengthen it, it washes out.
    const doesNotStrengthen = largestConnected < 0.5 * singleConnected

    const solved =
      causalEffectPresent && disconnectedIsZero && doesNotStrengthen

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the classical two-ended correlation between a spacelike past pair and a future region is causal (nonzero for a connected single cell, exactly zero for a disconnected region) but it does not strengthen as the connected future boundary grows, it washes out, so the classical reversible rule has a ceiling and the strong flat correlation must come from the emergent quantum layer',
      metrics: {
        singleCellConnected: singleConnected,
        largestRegionConnected: largestConnected,
        disconnectedMax,
        ensemble: records.length,
      },
      control: {
        // Two controls: the disconnected region gives zero (causality), and the
        // larger region does not strengthen the effect (the size control). Both must
        // hold for the ceiling claim, and both could have failed.
        disconnectedMax,
        largestRegionConnected: largestConnected,
      },
      notes:
        'L2, deterministic (seed swept over a position grid and three phases). The connected three-point function avoids post-selection. The result is an honest ceiling: the classical two-ended effect is real and causal but weak and does not grow with the future boundary, so it cannot supply the strong flat correlation. That strength is the emergent quantum layer, the same owed piece as the single definite outcome (E-QTM-0016). This locates the frontier, it does not cross it.',
    })
  },
})
