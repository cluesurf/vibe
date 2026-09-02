// The correction to the traveller knit's transmission claim, found by widening the window. E-FND-0095
// measured the lineHop particle "transmitted through a one-beat-offset domain with support bounded by
// seven and its phase rotated one clock unit", at side 11 over 26 beats. Both numbers are real and both
// are artifacts of that window. Measured here with the same machinery, longer and at more sizes:
//
//   - The crossing itself is TRANSPARENT. On the first pass through the slab the difference support
//     stays exactly one and the phase stays exactly the free phase. No per-crossing rotation exists,
//     so the offset domain is NOT a Wilson-line gauge potential for the traveller, the reading the
//     higher-level gauge exploration hoped for.
//   - The crossing PLANTS A DELAYED WAKE. At a geometry-dependent later beat (23 at side 11, 11 at
//     side 13) the difference erupts and then grows without any sign of saturating (support 98 by
//     beat 35 at side 11, 149 by beat 32 at side 13). The rotated phase appears only transiently
//     during the eruption. Side 11 stays under support seven through beat 25, which is exactly why
//     the 26-beat window read it as clean transmission.
//   - The free particle is untouched by this correction: with no slab the support is one and the
//     phase is the single free phase at every beat, at every size tested.
//
// So the traveller knit still supplies free flight, superposition, the husk split and detection, but
// its domain crossing is transparent-then-wake rather than transmit-with-rotation, and the wake-free
// transmitting knit remains unfound. The window rule this file enforces on its predecessor: a support
// bound is only as good as the beats and sizes it was watched for. Depth L2, deterministic, the
// no-slab run the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { lineHop } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const ROOT3 = Math.sqrt(3)
const EXACT = 1e-9
const SEED_BEAT = 3

function slabRun(input: { side: number; slab: boolean; beats: number }): {
  supports: number[]
  phases: number[]
  eruption: number
} {
  const { side, slab, beats } = input
  const mesh = d4Mesh({ side })
  const rule = lineHop({ opposite: meshOpposites(mesh) })
  const coordinate = (c: number, axis: number): number =>
    Math.floor(c / side ** axis) % side
  const late = new Set<number>()

  if (slab) {
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = coordinate(cell, 0)

      if (x >= 5 && x <= 7) {
        late.add(cell)
      }
    }
  }

  const mid = Math.floor(side / 2)

  let seedCell = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (
      coordinate(cell, 0) === 1 &&
      coordinate(cell, 1) === mid &&
      coordinate(cell, 2) === mid &&
      coordinate(cell, 3) === mid
    ) {
      seedCell = cell
      break
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  const supports: number[] = []
  const phases = new Set<number>()

  let eruption = -1

  for (let t = 0; t < beats; t++) {
    if (t === SEED_BEAT) {
      seeded.data[seedCell * mesh.degree] = 1
    }

    const active = (cell: number): boolean =>
      late.has(cell) ? t >= 1 : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++
      }
    }

    supports.push(support)

    if (eruption === -1 && t > SEED_BEAT && support > 1) {
      eruption = t
    }

    const difference = pairSub(
      clockAmplitude(seeded),
      clockAmplitude(vacuum),
    )

    if (Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < EXACT) {
      phases.add(phaseDegrees(difference))
    }
  }

  return {
    supports,
    phases: [...phases].sort((a, b) => a - b),
    eruption,
  }
}

export default experiment({
  id: 'foundations/traveller-slab-window',
  code: 'E-FND-0096',
  title:
    "the traveller knit's transmission was a window artifact: the first pass through the one-beat-offset slab is exactly transparent (support one, free phase only, no per-crossing rotation, so the offset domain is not a Wilson line), the crossing plants a delayed wake that erupts at a geometry-dependent beat (23 at side 11, 11 at side 13) and grows without saturating (98 by beat 35, 149 by beat 32), side 11 stays under the old bound of seven exactly through the old 26-beat window, and the free particle stays clean at every size, so lineHop supplies free flight and detection but not wake-free transmission, correcting E-FND-0095",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const at11 = slabRun({ side: 11, slab: true, beats: 36 })
    const at13 = slabRun({ side: 13, slab: true, beats: 33 })
    const free11 = slabRun({ side: 11, slab: false, beats: 36 })
    const free13 = slabRun({ side: 13, slab: false, beats: 33 })

    // the old window at side 11: support never above seven through beat 25
    const oldWindowClean = at11.supports
      .slice(0, 26)
      .every(s => s <= 7)
    // the artifact exposed: the same run erupts later and keeps growing
    const grows11 = at11.supports[35]! > 50
    const grows13 = at13.supports[32]! > 100
    // side 13 erupts on the first pass, inside the old window length
    const earlyEruption13 = at13.eruption <= 14
    // the first pass is transparent: support stays one until the eruption beat
    const transparent11 = at11.supports
      .slice(SEED_BEAT, at11.eruption)
      .every(s => s === 1)
    const transparent13 = at13.supports
      .slice(SEED_BEAT, at13.eruption)
      .every(s => s === 1)
    // the free controls: support one, a single phase, no eruption ever
    const freeClean =
      free11.eruption === -1 &&
      free13.eruption === -1 &&
      free11.phases.length === 1 &&
      free13.phases.length === 1

    const ok =
      oldWindowClean &&
      grows11 &&
      grows13 &&
      earlyEruption13 &&
      transparent11 &&
      transparent13 &&
      freeClean

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the slab crossing is exactly transparent until a geometry-dependent eruption beat, the wake then grows past every earlier bound while the old 26-beat window at side 11 stays under seven, and the free particle never erupts at either size',
      metrics: {
        eruptionBeatSide11: at11.eruption,
        eruptionBeatSide13: at13.eruption,
        supportAtBeat25Side11: at11.supports[25]!,
        supportAtBeat35Side11: at11.supports[35]!,
        supportAtBeat32Side13: at13.supports[32]!,
        phasesSide11: at11.phases.length,
      },
      // CONTROL: the free particle, support one and a single phase forever, no eruption
      control: {
        freeEruption11: free11.eruption,
        freeEruption13: free13.eruption,
        freeMaxSupport11: Math.max(...free11.supports),
      },
      notes:
        'the consequence for the amplitude programme: lineHop keeps free flight, exact superposition, the husk split and offset-2 detection, but the transmit-with-rotation line of E-FND-0095 is corrected to transparent-then-wake, so the conjunction the sixth-thing hunt wants (ballistic transport AND wake-free domain crossing AND rotation) is still unmet and the offset domain is not a gauge potential for the traveller. The higher-level gauge exploration must find its link phase elsewhere.',
    })
  },
})
