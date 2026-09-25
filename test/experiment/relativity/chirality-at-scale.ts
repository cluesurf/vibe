// Does the committed rule's handedness survive coarse-graining? E-FRC-0142 found that a lone love's
// current response on the vacuum is 4.1 to 4.7 times more self-dual than anti-self-dual: the
// rotational part of the rule's response lies mostly in one SU(2) factor of SO(4). That response is
// the sum over all 24 launch directions of a point source, so it is dominated by the lattice scale.
// Here the same split is read at long wavelength, where a coarse theory would live.
//
// The instrument is the current-response kernel K(t) of long charge waves along the four axes
// (code/measure/coarse-modes), k = 2 pi / L at L = 9, 13, 17, run for 2L beats. Its antisymmetric
// part, the current driven across a gradient, is a two-form, and its self-dual and anti-self-dual
// norms (summed in square over the window) are the su(2)_L and su(2)_R parts. Readings:
//   - the lattice-scale reference: the lone-love split on the vacuum at side 9 over 24 beats,
//     recomputed here (E-FRC-0142's number)
//   - the long-wave split on the mixed dense background at each side, and the antisymmetric part's
//     size relative to the isotropic part
//   - the long-wave split on the vacuum itself (no fill, a weaker perturbation) at sides 9 and 13,
//     over the whole window and over the first L beats, so the lone-tone setting and the long-wave
//     setting differ only in wavelength
// Controls: the mirrored rule (the committed rule conjugated by x_2 -> -x_2) on the same backgrounds
// at sides 9 and 13, which must swap the two halves if the instrument sees handedness at all, and pure
// streaming, whose antisymmetric part is forced to zero and reads the noise floor.
//
// Gates: the lattice-scale split is above 2 (the reference reproduces); the mirrored rule swaps the
// long-wave halves to within 10 percent at sides 9 and 13 (the instrument resolves the split); and the
// survival test, stated as a bound that could fail: at every long-wave reading the ratio of the larger
// half to the smaller is below 2, where the lattice-scale ratio is above 4, and the dense background's
// antisymmetric part shrinks relative to the isotropic part from side 9 to side 17.
//
// Depth L2: measured on the committed rule, the mirror the control that the split is resolvable.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { Collision, passThrough, turningWeave } from '@/code/rule/collision'
import { conjugateCollision } from '@/code/measure/rule-symmetry-ledger'
import {
  loneChargeCurrent,
  responseMatrix,
  selfDualSplit,
  vacuumCellTrajectory,
} from '@/code/measure/chiral-response'
import {
  chargeWaveResponse,
  kernelParts,
  responseKernel,
} from '@/code/measure/coarse-modes'

const SIDES = [9, 13, 17]
const MIRROR_SIDES = [9, 13]
const VACUUM_SIDES = [9, 13]
const LONE_SIDE = 9
const PERIOD = 24
const WARM = 48
const DENSE = { love: 0.3, fear: 0.3, epsilon: 0.1 }
const EMPTY = { love: 0, fear: 0, epsilon: 0.02 }

type Split = {
  selfDual: number
  antiSelfDual: number
  antisymmetricOverIsotropic: number
  firstHalfSelfDual: number
  firstHalfAntiSelfDual: number
}

const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))

function longWaveSplit(input: {
  side: number
  schedule: (beat: number) => Collision
  background: { love: number; fear: number; epsilon: number }
}): Split {
  const { side, schedule, background } = input
  const records = chargeWaveResponse({
    mesh: d4Mesh({ side }),
    side,
    schedule,
    directions: rootsD4(),
    modes: AXES,
    epsilon: background.epsilon,
    warm: WARM,
    beats: 2 * side,
    fill: { love: background.love, fear: background.fear },
  })
  const kernel = responseKernel(records)
  const whole = kernelParts(kernel)
  const early = kernelParts(kernel.slice(0, side))

  return {
    selfDual: whole.selfDual,
    antiSelfDual: whole.antiSelfDual,
    antisymmetricOverIsotropic:
      Math.hypot(whole.selfDual, whole.antiSelfDual) / whole.isotropic,
    firstHalfSelfDual: early.selfDual,
    firstHalfAntiSelfDual: early.antiSelfDual,
  }
}

// the larger half over the smaller: 1 for no handedness
function imbalance(a: number, b: number): number {
  return Math.max(a, b) / Math.min(a, b)
}

export default experiment({
  id: 'relativity/chirality-at-scale',
  code: 'E-RLT-0046',
  title:
    'the committed rule\'s handedness does not survive coarse-graining: the lone-love response at the lattice scale is 4.1 times more self-dual than anti-self-dual, but the long-wave current response at k = 2 pi / L for L = 9, 13, 17 splits within a factor of 1.5 on the dense background and on the vacuum, with no stable sign, while its antisymmetric part shrinks from 0.45 to 0.19 of the isotropic part; partial, because the mirror control swaps the halves to 2 percent at side 9 but reproduces their size only to about 25 percent at side 13, so the long-wave split is bounded well below the lattice-scale 4.1, not resolved to 10 percent',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const roots = rootsD4()
    const committed = turningWeave({ opposite })
    const mirror = roots.map(root =>
      roots.findIndex(other =>
        other.every((x, k) => x === (k === 2 ? -(root[k] ?? 0) : root[k])),
      ),
    )
    const mirrored = (t: number): Collision =>
      conjugateCollision({ collision: committed(t), permutation: mirror })

    // the lattice-scale reference
    const loneMesh = d4Mesh({ side: LONE_SIDE })
    const vacuum = vacuumCellTrajectory({
      schedule: committed,
      beats: PERIOD,
      degree: 24,
    })
    const mid = Math.floor(LONE_SIDE / 2)
    const cell =
      mid + mid * LONE_SIDE + mid * LONE_SIDE ** 2 + mid * LONE_SIDE ** 3
    const currents = roots.map((_, direction) =>
      loneChargeCurrent({
        mesh: loneMesh,
        schedule: committed,
        directions: roots,
        vacuum,
        cell,
        direction,
        tone: 1,
        beats: PERIOD,
      }),
    )
    const lone = selfDualSplit(responseMatrix({ currents, directions: roots }))
    const loneSelfDual = Math.hypot(...lone.selfDual)
    const loneAntiSelfDual = Math.hypot(...lone.antiSelfDual)
    const loneRatio = loneSelfDual / loneAntiSelfDual

    // long waves
    const dense = SIDES.map(side =>
      longWaveSplit({ side, schedule: committed, background: DENSE }),
    )
    const denseMirror = MIRROR_SIDES.map(side =>
      longWaveSplit({ side, schedule: mirrored, background: DENSE }),
    )
    const empty = VACUUM_SIDES.map(side =>
      longWaveSplit({ side, schedule: committed, background: EMPTY }),
    )
    const streaming = longWaveSplit({
      side: SIDES[0] ?? 9,
      schedule: () => passThrough,
      background: DENSE,
    })

    const longImbalances = [
      ...dense.map(s => imbalance(s.selfDual, s.antiSelfDual)),
      ...empty.map(s => imbalance(s.selfDual, s.antiSelfDual)),
      ...empty.map(s =>
        imbalance(s.firstHalfSelfDual, s.firstHalfAntiSelfDual),
      ),
    ]
    const shrinks =
      (dense[dense.length - 1]?.antisymmetricOverIsotropic ?? 1) <
      (dense[0]?.antisymmetricOverIsotropic ?? 0)

    const survivalBound =
      loneRatio > 2 && longImbalances.every(x => x < 2) && shrinks
    const mirrorSwapsAt = denseMirror.map((m, k) => {
      const c = dense[k]

      return (
        !!c &&
        Math.abs(m.selfDual - c.antiSelfDual) < 0.1 * c.antiSelfDual &&
        Math.abs(m.antiSelfDual - c.selfDual) < 0.1 * c.selfDual
      )
    })
    const mirrorSwaps = mirrorSwapsAt.every(Boolean)
    const ok = survivalBound && mirrorSwaps

    // the survival bound is the claim, the mirror swap the control that the split is resolved: with the
    // bound met and the control failing the result is partial, never a pass
    return verdict({
      status: ok ? 'pass' : survivalBound ? 'partial' : 'fail',
      claim: ok
        ? 'the lone-love split at the lattice scale is above 2, the mirrored rule swaps the long-wave halves to within 10 percent at sides 9 and 13, every long-wave split on the dense background and on the vacuum is below a factor of 2, and the dense antisymmetric part shrinks relative to the isotropic part from side 9 to side 17'
        : `the lone-love split at the lattice scale is ${loneRatio.toFixed(2)}, every long-wave split on the dense background and on the vacuum is below a factor of 2 (largest ${Math.max(...longImbalances).toFixed(2)}), and the dense antisymmetric part shrinks from side 9 to side 17, but the mirror control swaps the halves within 10 percent only at side${mirrorSwapsAt.filter(Boolean).length === 1 ? '' : 's'} ${MIRROR_SIDES.filter((_, k) => mirrorSwapsAt[k]).join(' and ') || 'none'}, so the long-wave split is bounded, not resolved to 10 percent everywhere`,
      metrics: {
        loneSelfDual: Number(loneSelfDual.toFixed(4)),
        loneAntiSelfDual: Number(loneAntiSelfDual.toFixed(4)),
        loneRatio: Number(loneRatio.toFixed(4)),
        ...Object.fromEntries(
          dense.flatMap((s, k) => [
            [`denseSelfDualSide${SIDES[k]}`, Number(s.selfDual.toFixed(4))],
            [
              `denseAntiSelfDualSide${SIDES[k]}`,
              Number(s.antiSelfDual.toFixed(4)),
            ],
            [
              `denseRatioSide${SIDES[k]}`,
              Number((s.selfDual / s.antiSelfDual).toFixed(4)),
            ],
            [
              `denseAntisymmetricOverIsotropicSide${SIDES[k]}`,
              Number(s.antisymmetricOverIsotropic.toFixed(4)),
            ],
          ]),
        ),
        ...Object.fromEntries(
          empty.flatMap((s, k) => [
            [
              `vacuumWaveRatioSide${VACUUM_SIDES[k]}`,
              Number((s.selfDual / s.antiSelfDual).toFixed(4)),
            ],
            [
              `vacuumWaveFirstHalfRatioSide${VACUUM_SIDES[k]}`,
              Number(
                (s.firstHalfSelfDual / s.firstHalfAntiSelfDual).toFixed(4),
              ),
            ],
            [
              `vacuumWaveAntisymmetricOverIsotropicSide${VACUUM_SIDES[k]}`,
              Number(s.antisymmetricOverIsotropic.toFixed(4)),
            ],
          ]),
        ),
        largestLongWaveImbalance: Number(
          Math.max(...longImbalances).toFixed(4),
        ),
      },
      control: {
        ...Object.fromEntries(
          denseMirror.flatMap((s, k) => [
            [
              `mirroredSelfDualSide${MIRROR_SIDES[k]}`,
              Number(s.selfDual.toFixed(4)),
            ],
            [
              `mirroredAntiSelfDualSide${MIRROR_SIDES[k]}`,
              Number(s.antiSelfDual.toFixed(4)),
            ],
          ]),
        ),
        streamingAntisymmetricOverIsotropic: Number(
          streaming.antisymmetricOverIsotropic.toFixed(4),
        ),
      },
      notes:
        'L2, partial. The mirror control: at side 9 the mirrored rule on the same background gives self-dual 0.2082 and anti-self-dual 0.1982 against the committed 0.1942 and 0.2122, a swap to 2 percent; at side 13 it gives 0.1054 and 0.1018 against 0.1466 and 0.1401, balanced like the committed rule (ratio 1.035 against 1.047, where an exact swap predicts 0.955) but about 25 percent smaller. The background is not mirrored, so the two histories differ, and the antisymmetric part\'s size is reproducible to about 25 percent and its ratio to about 8 percent at side 13. That still bounds the long-wave split far below the lattice-scale 4.1, which is the survival question, but it does not resolve a split of 10 percent. A mirrored background, or several backgrounds, would make the control exact. The two responses differ only in the wavelength they probe: the lone tone is a point source, all wavevectors at once and dominated by the lattice scale, and the long wave is one wavevector well below it. The 4-to-1 self-dual excess is a lattice-scale property; at long wavelength the halves are balanced within the stated bound and the sign moves with side, background and window, so no handedness is carried into a coarse theory. The antisymmetric response itself is real at long wavelength (well above the streaming floor), a current driven across a gradient, and on the dense background it shrinks with the wavelength. This is a statement about the charge current response; a chirality could hide in an observable not measured here (a spin-carrying current, a rank-3 tensor), and E-RLT-0045 shows the symmetric part stays anisotropic, so what is balanced is the handedness, not the isotropy.',
    })
  },
})
