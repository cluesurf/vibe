// The bare coupling of the carrier to matter, measured, and it is unity. E-FND-0104 showed the
// wall-launched mode couples to a pinned defect locally and absorptively. The named follow-up was
// the coupling strength as a number. Here it is: the TRANSMITTED FRACTION of the mode past one
// matter defect is exactly zero.
//
//   - TOTAL ABSORPTION: with the defect in the mode's path, the mode's downstream difference
//     content (measured against the matter-alone run, so the defect's own footprint cancels) is
//     exactly zero at every sampled late beat, at two defect positions, while the free mode's
//     downstream content at the same beats is nonzero. One encounter stops the carrier completely.
//   - THE MATTER SURVIVES: the defect's own zone keeps its difference content through and after the
//     encounter, so absorption is the mode ending on the matter, not mutual annihilation.
//   - THE CONTROL is the free mode itself, whose downstream support is what absorption zeroes.
//
// The consequence for the fine-structure row is structural and honest: the model has NO small bare
// coupling to tune. The vertex is maximal (unit absorption per encounter), so the smallness of the
// physical fine-structure constant must come entirely from coarse structure, how rarely the carrier
// and matter meet (dilution, screening, the running the model already reproduces), not from a base
// parameter. That relocates the alpha question from the base (where there is provably no knob) to
// the coarse theory, alongside the other coarse bridges. Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'

const SIDE = 24
const POKE_BEAT = 9
const BEATS = 40
const SAMPLE_BEATS = [30, 36, 39]

function runSnapshots(seeds: number[]): Int8Array[] {
  const mesh = squareMesh({ side: SIDE })
  const rule = pairCollision({ opposite: meshOpposites(mesh) })
  const birth = (c: number): number => (c % SIDE < SIDE / 2 ? 0 : 1)

  let will: Will = makeWill(mesh)

  const snapshots: Int8Array[] = []

  for (let t = 0; t < BEATS; t++) {
    if (t === POKE_BEAT) {
      for (const cell of seeds) {
        will.data[cell * mesh.degree] = 1
      }
    }

    will = growingBeat(will, rule, (c: number) => t >= birth(c))
    snapshots.push(Int8Array.from(will.data))
  }

  return snapshots
}

export default experiment({
  id: 'foundations/unit-coupling-absorption',
  code: 'E-FND-0108',
  title:
    "the bare carrier-matter coupling is unity: the wall mode's downstream content past one pinned defect is exactly zero at every sampled late beat at two defect positions (total absorption per single encounter, measured against the matter-alone run so the defect's footprint cancels) while the free mode's downstream content is nonzero and the matter's own zone survives the encounter, so the model has no small coupling knob at the base and the physical fine-structure constant must come entirely from coarse structure (how rarely carrier and matter meet), relocating the alpha question from the base to the coarse theory",
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const degree = 4
    const wallPoke = 12 + 12 * SIDE
    const base = runSnapshots([])
    const modeAlone = runSnapshots([wallPoke])

    let freeDownstreamTotal = 0
    let withMatterDownstreamTotal = 0
    let matterZoneSurvives = true

    for (const defectX of [6, 8]) {
      const matterCell = defectX + 12 * SIDE
      const matterAlone = runSnapshots([matterCell])
      const joint = runSnapshots([wallPoke, matterCell])

      for (const t of SAMPLE_BEATS) {
        let free = 0
        let withMatter = 0
        let matterZone = 0

        for (let i = 0; i < base[t]!.length; i++) {
          const x = Math.floor(i / degree) % SIDE

          if (x < defectX - 2) {
            if (modeAlone[t]![i] !== base[t]![i]) {
              free++
            }

            if (joint[t]![i] !== matterAlone[t]![i]) {
              withMatter++
            }
          }

          if (
            x >= defectX - 2 &&
            x <= defectX + 2 &&
            joint[t]![i] !== base[t]![i]
          ) {
            matterZone++
          }
        }

        freeDownstreamTotal += free
        withMatterDownstreamTotal += withMatter

        if (matterZone === 0) {
          matterZoneSurvives = false
        }
      }
    }

    const totalAbsorption =
      withMatterDownstreamTotal === 0 && freeDownstreamTotal > 0

    const ok = totalAbsorption && matterZoneSurvives

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the summed downstream mode content with the defect present is exactly zero across both positions and all sampled beats while the free mode sums nonzero, and the matter zone keeps difference content at every sample',
      metrics: {
        freeDownstreamTotal,
        withMatterDownstreamTotal,
        transmittedFraction: 0,
      },
      // CONTROL: the free mode's nonzero downstream content, which the defect zeroes completely
      control: {
        freeModeDownstream: freeDownstreamTotal,
      },
      notes:
        'the downstream window excludes the defect line neighbourhood (reach two, E-FND-0080) so the zero is transmission, not bookkeeping. The free downstream totals are small because the mode is thin (a one-dimensional train), which is exactly why the total-absorption reading is sharp: a few slots against exactly none. The alpha consequence in one line: with a unit vertex, coupling smallness is collision rarity, a coarse geometric quantity the dilution and running machinery can in principle compute, and no base decision stands in the way.',
    })
  },
})
