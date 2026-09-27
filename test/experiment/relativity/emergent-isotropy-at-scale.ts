// Does rotation symmetry emerge at scale in a knit that has exact CPT without having it forced? E-RLT-0051
// proves that no knit keeps exact local color with momentum exchange as free as the scatter weave's while
// its symmetry forces isotropy, and builds the quaternion knit, which buys forced isotropy and CPT at the
// cost of three more momentum invariants and a runaway dressing. The remaining route is isotropy that no
// symmetry forces: the anisotropy of a CPT knit decaying with scale.
//
// Measured, on the integer torus (d4Mesh) at sides 9, 13, 17, 21 and 25, the long-wave charge response of
// E-RLT-0045: the rank-2 kernel's traceless part over its isotropic part, and the axis-shell spread of the
// four axis waves, with the kernel averaged over 8 start times 3 beats apart (one 24-beat period), and also
// over the first 2 of them, to tell a structural anisotropy (unchanged by averaging) from noise (falling
// with it):
// - the combined knit (code/rule/combined-knit COMBINED_DEFAULT, E-FRC-0158: the head-on turn weave with
//   the scatter block), which keeps CPT exactly and has a reducible period group (E-RLT-0050)
// - the quaternion knit (E-RLT-0051), whose Q8 symmetry forces rank-2 isotropy in the mean; on one
//   background its reading is noise, which the same averaging must shrink
// - pure streaming, the instrument's floor
//
// Gates, fixed before the run. Emergence: the combined knit's 8-sample anisotropy at side 25 is under
// 1.5 (9 / 25)^2 = 0.19 of its side-9 value (at least as fast as a lattice correction). Persistence: it keeps
// more than 0.7 of its side-9 value at side 25, and at every side its 8-sample value is at least 0.8 of its
// 2-sample value (structural, not noise). The verdict passes when one of the two holds and names which, and
// fails when neither does. Controls: streaming under 0.1 at every side; the quaternion knit's 8-sample
// anisotropy under 0.8 of its 2-sample value at every side (its reading is noise that averaging removes).
//
// Depth L2: a measured scaling, with a forced-isotropic control on the same instrument.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { type Collision, passThrough } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { quaternionKnit } from '@/code/rule/quaternion-knit'
import { chargeWaveResponse, curveSpread, kernelParts, responseKernel } from '@/code/measure/coarse-modes'

const SIDES = (process.env.RLT0053_SIDES ?? '9,13,17,21,25').split(',').map(Number)
const PHASES = 8
const FEW = 2
const STEP = 3
const WARM = 48
const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))

type Reading = { anisotropy: number; fewAnisotropy: number; isotropic: number; axisSpread: number }

function reading(side: number, schedule: (t: number) => Collision): Reading {
  const mesh = d4Mesh({ side })
  let sum: number[][][] | undefined
  let curves: number[][] | undefined
  let few = 0

  for (let j = 0; j < PHASES; j++) {
    const records = chargeWaveResponse({ mesh, side, schedule, directions: rootsD4(), modes: AXES, epsilon: 0.1, warm: WARM + STEP * j, beats: 2 * side })
    const kernel = responseKernel(records)

    sum = sum ? sum.map((m, t) => m.map((row, i) => row.map((x, k) => x + (kernel[t]?.[i]?.[k] ?? 0)))) : kernel
    curves = curves ? curves.map((c, m) => c.map((x, t) => x + (records[m]?.relaxation[t] ?? 0))) : records.map(r => [...r.relaxation])

    if (j === FEW - 1) {
      const parts = kernelParts(sum.map(m => m.map(row => row.map(x => x / FEW))))

      few = parts.anisotropic / parts.isotropic
    }
  }

  const parts = kernelParts((sum ?? []).map(m => m.map(row => row.map(x => x / PHASES))))

  return {
    anisotropy: parts.anisotropic / parts.isotropic,
    fewAnisotropy: few,
    isotropic: parts.isotropic,
    axisSpread: curveSpread((curves ?? []).map(c => c.map(x => x / PHASES))),
  }
}

export default experiment({
  id: 'relativity/emergent-isotropy-at-scale',
  code: 'E-RLT-0053',
  title:
    'rotation symmetry does not emerge at scale in the CPT knit: the combined knit\'s long-wave anisotropy, averaged over a full period of start times, reads 0.80, 0.77, 0.76, 0.77 and 0.76 at sides 9, 13, 17, 21 and 25 (0.96 of itself kept, where a lattice correction would keep under 0.19), unchanged by averaging (0.83 over 2 starts at side 9), while the forced-isotropic quaternion knit\'s reading is noise that halves with averaging and falls with volume (1.35 to 0.32), against a streaming floor of 0.03 or less',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const rows = SIDES.map(side => {
      const opposite = meshOpposites(d4Mesh({ side }))

      return {
        side,
        combined: reading(side, combinedCollision({ spec: COMBINED_DEFAULT, opposite })),
        quaternion: reading(side, quaternionKnit({ opposite })),
        streaming: reading(side, () => passThrough),
      }
    })
    const first = rows[0]
    const last = rows[rows.length - 1]
    const kept = (last?.combined.anisotropy ?? 0) / (first?.combined.anisotropy ?? 1)
    const lattice = 1.5 * ((first?.side ?? 9) / (last?.side ?? 25)) ** 2
    const emergent = kept < lattice
    const structural = rows.every(r => r.combined.anisotropy >= 0.8 * r.combined.fewAnisotropy)
    const persistent = kept > 0.7 && structural
    const floor = rows.every(r => r.streaming.anisotropy < 0.1)
    const quaternionNoise = rows.every(r => r.quaternion.anisotropy < 0.8 * r.quaternion.fewAnisotropy)
    const ok = floor && quaternionNoise && (emergent || persistent)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: emergent
        ? 'the combined knit\'s anisotropy falls faster than a lattice correction from side 9 to the largest side: isotropy emerges'
        : persistent
          ? 'the combined knit\'s anisotropy keeps more than 0.7 of its side-9 value at the largest side and is unchanged by averaging at every side, so it is structural and does not decay; the quaternion knit\'s reading shrinks with averaging at every side, and streaming stays under 0.1'
          : 'neither the emergence nor the persistence gate holds at these sizes',
      metrics: {
        emergent: emergent ? 1 : 0,
        persistent: persistent ? 1 : 0,
        structural: structural ? 1 : 0,
        keptFromFirstToLast: Number(kept.toFixed(4)),
        latticeCorrectionThreshold: Number(lattice.toFixed(4)),
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`combinedAnisotropySide${r.side}`, Number(r.combined.anisotropy.toFixed(4))],
            [`combinedTwoSampleAnisotropySide${r.side}`, Number(r.combined.fewAnisotropy.toFixed(4))],
            [`combinedIsotropicSide${r.side}`, Number(r.combined.isotropic.toFixed(4))],
            [`combinedAxisSpreadSide${r.side}`, Number(r.combined.axisSpread.toFixed(4))],
          ]),
        ),
      },
      control: {
        quaternionNoise: quaternionNoise ? 1 : 0,
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`quaternionAnisotropySide${r.side}`, Number(r.quaternion.anisotropy.toFixed(4))],
            [`quaternionTwoSampleAnisotropySide${r.side}`, Number(r.quaternion.fewAnisotropy.toFixed(4))],
            [`quaternionIsotropicSide${r.side}`, Number(r.quaternion.isotropic.toFixed(4))],
            [`streamingAnisotropySide${r.side}`, Number(r.streaming.anisotropy.toFixed(4))],
          ]),
        ),
      },
      notes:
        'L2, 1,336 s. Sides 9 to 25 are 6,561 to 390,625 docks, run densely: the difference engine of code/compute (E-CMP-0015) follows a disturbance on the vacuum, and this instrument needs a dense background, so it does not apply. The combined knit\'s isotropic part grows with side (1.03 to 1.49) while its traceless part keeps pace, and its axis-shell spread stays at 0.15 to 0.16: a fixed shape of the response, not a finite-size term. The quaternion knit\'s isotropic part stays near 0.25 to 0.28 and its anisotropy falls at every step, as noise around an isotropic mean does, which is what its Q8 symmetry forces. Together with E-RLT-0045 (the committed knit, 1.60 to 1.31 over sides 9 to 17) the CPT knits built so far are anisotropic at every size run, and the one knit with forced isotropy pays for it in dressing and momentum exchange (E-RLT-0051). This is a measurement to side 25, not a proof about the infinite limit: an anisotropy that decays only beyond side 25 is not excluded.',
    })
  },
})
