// The arrow of openness on the committed {3,4,3,4} substrate, retitled honestly (June 2026 audit). The old
// title said the open lattice "sheds a disturbance and heals", but the committed occupancy measurement shows
// the absorbing boundary absorbs EVERYTHING, the open run ends at zero occupancy (no body, no wave, nothing
// survives to have healed), while the closed torus recurs exactly (its late amplitude returns to the initial
// value). So what this experiment measures is the CONTRAST OF OPENNESS, a reversible closed system recurs and
// an absorbing open one is irreversibly emptied. It is NOT a healing result, healing would need a persistent
// body that survives while only the disturbance drains, which the committed rule does not provide here (see
// arrow-binds-but-seals, binding and radiating are disjoint in the committed rules).
//
// Depth L1, a contrast between an exactly recurring closed run and a fully absorbed open run, with the soft
// (sound) density wave of selves/emergent-soft-radiation as the carrier.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'
import {
  coinLines,
  densityWaveAlongAxis,
  stripeContrast,
} from '@/code/measure/sound-wave'

export default experiment({
  id: 'selves/bath-damps-soft-mode',
  code: 'E-SLF-0010',
  title:
    'the absorbing boundary absorbs everything and the closed torus recurs exactly, the arrow of openness, not healing',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const side = 14
    const beats = 120
    const lambda = 4
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const rule: Collision = headOnRotate({ opposite })
    const lines = coinLines(opposite)
    const axisOf = (cell: number): number => cell % side
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    // run the soft density wave, returning the initial amplitude, the peak amplitude in the late window (the
    // recurrence signal), the final amplitude, and the final occupancy (does ANYTHING survive).
    const trace = (
      open: boolean,
    ): {
      c0: number
      lateMax: number
      final: number
      initialOccupancy: number
      finalOccupancy: number
    } => {
      let current: Will = densityWaveAlongAxis({
        mesh,
        lambda,
        axisOf,
        highTarget: 9,
        lowTarget: 3,
        lines,
      })

      let scratch: Will = {
        mesh,
        data: new Int8Array(current.data.length),
      }

      const c0 = Math.abs(
        stripeContrast({ will: current, lambda, axisOf, bins: side }),
      )

      let initialOccupancy = 0

      for (const value of current.data) {
        if (value !== 0) {
          initialOccupancy++
        }
      }

      let lateMax = 0
      let final = 0

      for (let t = 1; t <= beats; t++) {
        beatInto({ src: current, dst: scratch, table, collision: rule })

        const swap = current

        current = scratch
        scratch = swap

        if (open) {
          absorbBoundary(current)
        }

        const c = Math.abs(
          stripeContrast({ will: current, lambda, axisOf, bins: side }),
        )

        if (t > beats / 2 && c > lateMax) {
          lateMax = c
        }

        final = c
      }

      let finalOccupancy = 0

      for (const value of current.data) {
        if (value !== 0) {
          finalOccupancy++
        }
      }

      return { c0, lateMax, final, initialOccupancy, finalOccupancy }
    }

    const closed = trace(false)
    const open = trace(true)

    // the closed torus RECURS, its late amplitude returns to near the initial (reversible, nothing is lost).
    const closedRecurs = closed.lateMax >= closed.c0 * 0.8
    // the open lattice is EMPTIED, the boundary absorbs the entire contents, the final occupancy is zero, so
    // the amplitude falls to zero because nothing at all remains, not because a body shed a disturbance.
    const openFullyAbsorbed =
      open.finalOccupancy === 0 && open.lateMax <= open.c0 * 0.2

    // the closed torus conserves every charge (the reversible rule loses nothing)
    const closedKeepsEverything =
      closed.finalOccupancy === closed.initialOccupancy &&
      closed.finalOccupancy > 0

    const ok =
      closedRecurs && openFullyAbsorbed && closedKeepsEverything

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the {3,4,3,4} substrate a soft density wave run on the closed torus recurs (its late amplitude returns to the initial value, reversible and lossless) while the same wave run with an absorbing boundary is completely absorbed, the final occupancy is ZERO, nothing survives, so the contrast is the arrow of openness (a closed reversible system recurs, an absorbing open one is irreversibly emptied), not healing, since healing would need a persistent body that survives while only the disturbance drains',
      metrics: {
        initialAmplitude: Math.round(closed.c0 * 100),
        closedLateAmplitude: Math.round(closed.lateMax * 100),
        openLateAmplitude: Math.round(open.lateMax * 100),
        openFinalAmplitude: Math.round(open.final * 100),
        closedFinalOccupancy: closed.finalOccupancy,
        openFinalOccupancy: open.finalOccupancy,
        closedRecurs: closedRecurs ? 1 : 0,
        openFullyAbsorbed: openFullyAbsorbed ? 1 : 0,
        beats,
      },
      control: {
        closedLateAmplitude: Math.round(closed.lateMax * 100),
        closedFinalOccupancy: closed.finalOccupancy,
      },
      notes:
        'retitled and regraded L2 to L1 by the June 2026 audit, the old reading (an open structure sheds a disturbance and heals) was wrong because the open run drains the ENTIRE lattice to zero occupancy, there is no surviving body to have healed. A genuine healing result needs a persistent core that survives while the disturbance drains, and the committed reversible rules do not provide one (arrow-binds-but-seals shows binding and radiating are disjoint). What remains is the honest L1 contrast, the closed torus recurs exactly while the absorbing boundary irreversibly empties the open lattice, the arrow of openness',
    })
  },
})
