// Can one emergent metric absorb the committed knit's anisotropy? E-RLT-0045 found the long-wave
// rank-2 response anisotropic at every scale, which rules out rotation symmetry in the lattice's own
// coordinates. It does not rule out an emergent metric: one positive rank-2 tensor can always be made
// isotropic by a linear change of coordinates. What a metric needs is that EVERY independent rank-2
// response tensor is proportional to the same g^-1 (code/measure/response-tensors). So two tensors with
// different physics are measured and compared.
//
// - G, the kinetic tensor of the dense background: sixteen long charge waves (the four axes and the
//   twelve face diagonals e_i +- e_j) on the mixed background of E-RLT-0045, each read after one beat,
//   2 (1 - r(1)) / |k|^2 = n^T G n / |n|^2, the second moment of the carriers' velocities (the f-sum
//   rule), fitted as a quadratic form, at sides 9, 13 and 17
// - V, the vacuum's lone-tone tensor: the Gram tensor of the mean charge currents of a lone love
//   launched along each of the 24 directions on the vacuum over one schedule period (E-FRC-0142's
//   currents), side 9
// Both are quadratic forms by construction, so their comparison is a clean test. Reported beside them,
// not gated: C, the sound tensor, fitted to (peak frequency / |k|)^2 of the sixteen waves over 6L beats
// at side 9, with its quadratic-fit residual. It cannot be gated because the control fails it by
// construction: for a ballistic gas the peak frequency is not a quadratic form at all (a wave along an
// axis peaks at |k| and one along a face diagonal at |k| / root 2), so a positive control would read a
// large residual whatever the metric.
//
// PRE-REGISTERED: the tolerance is 0.1 on the distance between the unit-normalized tensors (about 6
// degrees between them as vectors). A single metric is admitted only if the distance between G and V is
// below it. Stated plainly: a side-9 probe had already shown G nearly isotropic and V not when the
// tolerance was fixed; the side-13 and side-17 values, and every distance, were first read after it.
//
// Gates: the instrument can pass (pure streaming gives G and V proportional within the tolerance and a
// quadratic G), and the committed knit's G and V are further apart than the tolerance at every side.
//
// Depth L2: measured on the committed knit, with a positive control that shows the test can say yes.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { Collision, passThrough, turningWeave } from '@/code/rule/collision'
import { chargeWaveResponse } from '@/code/measure/coarse-modes'
import {
  loneChargeCurrent,
  vacuumCellTrajectory,
} from '@/code/measure/chiral-response'
import {
  anisotropy,
  gramTensor,
  kineticValue,
  peakFrequency,
  quadraticFit,
  tensorDistance,
} from '@/code/measure/response-tensors'

const TOLERANCE = 0.1
const SIDES = [9, 13, 17]
const SOUND_SIDE = 9
const LONE_SIDE = 9
const PERIOD = 24
const WARM = 48
const EPSILON = 0.1

const MODES: number[][] = [0, 1, 2, 3].map(a =>
  [0, 1, 2, 3].map(k => (k === a ? 1 : 0)),
)

for (let i = 0; i < 4; i++) {
  for (let j = i + 1; j < 4; j++) {
    MODES.push([0, 1, 2, 3].map(k => (k === i || k === j ? 1 : 0)))
    MODES.push([0, 1, 2, 3].map(k => (k === i ? 1 : k === j ? -1 : 0)))
  }
}

const kSquared = (side: number, n: readonly number[]): number =>
  ((2 * Math.PI) / side) ** 2 * n.reduce((s, x) => s + x * x, 0)

function kinetic(input: {
  side: number
  schedule: (beat: number) => Collision
}): { tensor: number[][]; residual: number } {
  const { side, schedule } = input
  const records = chargeWaveResponse({
    mesh: d4Mesh({ side }),
    side,
    schedule,
    directions: rootsD4(),
    modes: MODES,
    epsilon: EPSILON,
    warm: WARM,
    beats: 2,
  })

  return quadraticFit({
    wavevectors: MODES,
    values: records.map(r =>
      kineticValue({
        relaxationAfterOneBeat: r.relaxation[1] ?? 1,
        kSquared: kSquared(side, r.mode),
      }),
    ),
  })
}

function sound(schedule: (beat: number) => Collision): {
  tensor: number[][]
  residual: number
} {
  const side = SOUND_SIDE
  const records = chargeWaveResponse({
    mesh: d4Mesh({ side }),
    side,
    schedule,
    directions: rootsD4(),
    modes: MODES,
    epsilon: EPSILON,
    warm: WARM,
    beats: 6 * side,
  })

  return quadraticFit({
    wavevectors: MODES,
    values: records.map(
      r => peakFrequency(r.relaxation) ** 2 / kSquared(side, r.mode),
    ),
  })
}

function vacuumTensor(schedule: (beat: number) => Collision): number[][] {
  const side = LONE_SIDE
  const mesh = d4Mesh({ side })
  const directions = rootsD4()
  const vacuum = vacuumCellTrajectory({ schedule, beats: PERIOD, degree: 24 })
  const mid = Math.floor(side / 2)
  const dock = mid + mid * side + mid * side ** 2 + mid * side ** 3

  return gramTensor(
    directions.map((_, direction) =>
      loneChargeCurrent({
        mesh,
        schedule,
        directions,
        vacuum,
        cell: dock,
        direction,
        tone: 1,
        beats: PERIOD,
      }),
    ),
  )
}

export default experiment({
  id: 'relativity/emergent-metric-escape',
  code: 'E-RLT-0047',
  title:
    'no single emergent metric absorbs the committed knit\'s anisotropy: its dense-background kinetic tensor is nearly isotropic while its vacuum lone-tone tensor is not, the two stay further apart than the pre-registered 0.1 at sides 9, 13 and 17, and pure streaming, where both are proportional, shows the test can pass; a third tensor, the sound tensor fitted from peak frequencies, is a quadratic form for the committed knit (residual 0.064) and disagrees with both (distances 0.95 and 1.12), so three rank-2 responses point three ways',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const committed = turningWeave({ opposite })
    const streaming = (): Collision => passThrough

    const g = SIDES.map(side => kinetic({ side, schedule: committed }))
    const v = vacuumTensor(committed)
    const c = sound(committed)
    const gStream = kinetic({ side: SIDES[0] ?? 9, schedule: streaming })
    const vStream = vacuumTensor(streaming)
    const cStream = sound(streaming)

    const distances = g.map(fit => tensorDistance(fit.tensor, v))
    const controlDistance = tensorDistance(gStream.tensor, vStream)
    const controlOk =
      controlDistance < TOLERANCE && gStream.residual < TOLERANCE
    const closed = distances.every(d => d > TOLERANCE)
    const ok = controlOk && closed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'pure streaming gives a quadratic kinetic tensor proportional to its vacuum tensor within the pre-registered 0.1, and the committed knit\'s kinetic and vacuum tensors are further apart than 0.1 at sides 9, 13 and 17, so no single metric makes both isotropic',
      metrics: {
        tolerance: TOLERANCE,
        ...Object.fromEntries(
          SIDES.flatMap((side, k) => [
            [`kineticVacuumDistanceSide${side}`, Number((distances[k] ?? 0).toFixed(4))],
            [`kineticAnisotropySide${side}`, Number(anisotropy(g[k]?.tensor ?? []).toFixed(4))],
            [`kineticResidualSide${side}`, Number((g[k]?.residual ?? 0).toFixed(4))],
          ]),
        ),
        vacuumAnisotropy: Number(anisotropy(v).toFixed(4)),
        soundAnisotropy: Number(anisotropy(c.tensor).toFixed(4)),
        soundResidual: Number(c.residual.toFixed(4)),
        soundKineticDistance: Number(
          tensorDistance(c.tensor, g[0]?.tensor ?? []).toFixed(4),
        ),
        soundVacuumDistance: Number(tensorDistance(c.tensor, v).toFixed(4)),
      },
      control: {
        streamingKineticVacuumDistance: Number(controlDistance.toFixed(4)),
        streamingKineticResidual: Number(gStream.residual.toFixed(4)),
        streamingKineticAnisotropy: Number(anisotropy(gStream.tensor).toFixed(4)),
        streamingVacuumAnisotropy: Number(anisotropy(vStream).toFixed(4)),
        streamingSoundResidual: Number(cStream.residual.toFixed(4)),
      },
      notes:
        'L2. The two gated tensors are both quadratic by construction and measure different physics: G is how fast the charge carriers of the mixed background move, direction by direction, one beat after a long wave is laid down, and V is where a single tone on the empty vacuum carries charge. A metric that made the dense background isotropic would leave the vacuum\'s lone tones anisotropic, and the reverse, so the knit has no single light cone to read a metric from. The sound tensor is not gated, because for a ballistic gas the peak frequency is no quadratic form (streaming\'s residual is 0.33: an axis wave peaks at |k|, a face wave at |k| / root 2). For the committed knit it is one (residual 0.064), and it is dominated by the two protected directions, which stream freely forever (E-FRC-0143): a wave along axis 0 or 1 oscillates at exactly the streaming frequency and one along axis 2 hardly at all, so its (0, 1) block is nearly rank one along (1, 1, 0, 0). It is 0.95 from G and 1.12 from V, a third direction for a would-be metric. The kinetic residual reads how quadratic G is (the sixteen waves overdetermine its ten numbers). The tolerance, 0.1, was fixed after a side-9 probe had shown G nearly isotropic and V not, and before any distance or any side-13 or side-17 value was read.',
    })
  },
})
