// Does rotation symmetry come back at coarse scale under the committed rule? Gravity and the
// electroweak reading both wait on this: an emergent metric needs the long-wavelength response to be
// isotropic (or at least to define one metric), and the rule's chirality (E-FRC-0142) only matters
// if it survives into that regime (E-RLT-0046).
//
// 1. WHICH RANK IS EVIDENCE. A symmetry forces a rank-r tensor to be isotropic when every invariant
//    polynomial of degree r is a multiple of |x|^r. Measured by averaging a generic (a . x)^r over the
//    group and sampling it on unit vectors (code/measure/coarse-modes forcedIsotropySpread):
//    - W(B4), the 384 point symmetries of the integer torus the rule runs on: forces rank 2, not 4
//    - W(F4), all 1152 coin symmetries: forces ranks 2 and 4 (the 24-cell is a 5-design), not 6
//    - {I, -I}, everything the committed rule keeps (E-FRC-0142: the identity, and charge conjugation
//      with reversal whose spatial part is the point inversion): forces nothing, rank 2 included
//    So for a symmetric rule an isotropic rank-2 response is no evidence and the test is rank 4 or 6,
//    but for the committed rule rank 2 is already unforced, and it is the lowest rank that can tell.
//    Pure streaming keeps the whole torus group, so its rank-2 response is forced isotropic: the
//    control reads the noise floor of the instrument, not a result.
// 2. THE COARSE RESPONSE. Long-wavelength charge waves on a mixed dense background
//    (code/measure/coarse-modes chargeWaveResponse), k = 2 pi n / L with n the four axes and the six
//    face diagonals e_i + e_j, at sides L = 9, 13 and 17 (k falling from 0.70 to 0.37), each run for
//    2L beats so time scales with the wavelength. Three readings:
//    - the current-response kernel K(t) from the four axis waves: the norm of its symmetric
//      traceless part over the norm of its isotropic part, over the whole window and over the first
//      L beats (the beat-count dependence)
//    - the axis-shell spread: how far the four axis waves' relaxation curves disagree, relative to
//      how far they relax (the diagonal of the relaxation and sound tensor)
//    - the face-shell spread, the same for the six face waves (its off-diagonal part), sides 9 and 13
//    Controls: pure streaming at every side, where all three are forced to the noise floor.
//    The side-17 run is limited to the axis waves for time (about three minutes).
//
// Gates: the forcing pattern exactly as stated; the streaming readings under 0.1 at every side; the
// committed readings above ten times the streaming floor at every side; and the scale test proper,
// that the committed rule's rank-2 anisotropy does NOT fall like a lattice correction: from side 9 to
// side 17 a 1/L term would keep 0.53 of itself and a k^2 term 0.28, and the gate is that the kernel
// anisotropy keeps more than 0.7 and the axis-shell spread more than 0.8.
//
// Depth L2: measured on the committed rule with an instrument whose forced values are shown.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { linearMapOf } from '@/code/substrate/d4-box'
import { Collision, passThrough, turningWeave } from '@/code/rule/collision'
import {
  chargeWaveResponse,
  curveSpread,
  forcedIsotropySpread,
  kernelParts,
  powerLawExponent,
  responseKernel,
  unitSamples,
  type ModeRecord,
} from '@/code/measure/coarse-modes'

const SIDES = [9, 13, 17]
const FACE_SIDES = [9, 13]
const EPSILON = 0.1
const WARM = 48
const GENERIC = [0.31, -0.74, 0.52, 0.29]

type Reading = {
  side: number
  kernel: number
  kernelFirstHalf: number
  axisSpread: number
  faceSpread: number
}

const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))
const FACES: number[][] = []

for (let i = 0; i < 4; i++) {
  for (let j = i + 1; j < 4; j++) {
    FACES.push([0, 1, 2, 3].map(k => (k === i || k === j ? 1 : 0)))
  }
}

function reading(input: {
  side: number
  schedule: (beat: number) => Collision
  faces: boolean
}): Reading {
  const { side, schedule, faces } = input
  const mesh = d4Mesh({ side })
  const records: ModeRecord[] = chargeWaveResponse({
    mesh,
    side,
    schedule,
    directions: rootsD4(),
    modes: faces ? [...AXES, ...FACES] : AXES,
    epsilon: EPSILON,
    warm: WARM,
    beats: 2 * side,
  })
  const axis = records.slice(0, 4)
  const kernel = responseKernel(axis)
  const whole = kernelParts(kernel)
  const early = kernelParts(kernel.slice(0, side))

  return {
    side,
    kernel: whole.anisotropic / whole.isotropic,
    kernelFirstHalf: early.anisotropic / early.isotropic,
    axisSpread: curveSpread(axis.map(r => r.relaxation)),
    faceSpread: faces
      ? curveSpread(records.slice(4).map(r => r.relaxation))
      : -1,
  }
}

export default experiment({
  id: 'relativity/coarse-isotropy-of-the-rule',
  code: 'E-RLT-0045',
  title:
    'rotation symmetry does not come back at coarse scale under the committed rule: the rule keeps no rotation, so rank 2 is the lowest unforced rank (the torus group forces it, W(F4) forces rank 4 too, the rule\'s own {I, -I} forces nothing), and the rank-2 response of long charge waves stays anisotropic from side 9 to 17 (kernel 1.60, 1.34, 1.31, axis-shell spread 0.31, 0.33, 0.34), keeping over 0.8 of itself where a lattice correction would keep 0.53 or 0.28, against a streaming floor of a few hundredths',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. forcing
    const roots = rootsD4()
    const f4 = weylF4DirectionPermutations({ directions: roots })
      .map(p => linearMapOf(p))
      .filter((m): m is number[][] => !!m)
    const b4 = f4.filter(m =>
      m.every(row => row.every(x => Math.abs(x - Math.round(x)) < 1e-9)),
    )
    const identity = [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j => (i === j ? 1 : 0)),
    )
    const committedGroup = [identity, identity.map(row => row.map(x => -x))]
    const samples = unitSamples(200)
    const spread = (
      group: readonly (readonly (readonly number[])[])[],
      rank: number,
    ): number =>
      forcedIsotropySpread({ group, rank, generic: GENERIC, samples })
    const forcing = {
      b4Rank2: spread(b4, 2),
      b4Rank4: spread(b4, 4),
      f4Rank2: spread(f4, 2),
      f4Rank4: spread(f4, 4),
      f4Rank6: spread(f4, 6),
      committedRank2: spread(committedGroup, 2),
    }
    // forced means rounding level (about 1e-15 here), unforced means structurally nonzero: the two are
    // separated by the six orders between 1e-12 and 1e-6
    const forced = (x: number): boolean => x < 1e-12
    const unforced = (x: number): boolean => x > 1e-6
    const forcingOk =
      f4.length === 1152 &&
      b4.length === 384 &&
      forced(forcing.b4Rank2) &&
      unforced(forcing.b4Rank4) &&
      forced(forcing.f4Rank2) &&
      forced(forcing.f4Rank4) &&
      unforced(forcing.f4Rank6) &&
      unforced(forcing.committedRank2)

    // 2. the coarse response
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const committedSchedule = turningWeave({ opposite })
    const committed = SIDES.map(side =>
      reading({
        side,
        schedule: committedSchedule,
        faces: FACE_SIDES.includes(side),
      }),
    )
    const streaming = SIDES.map(side =>
      reading({ side, schedule: () => passThrough, faces: true }),
    )
    const floorOk = streaming.every(
      r => r.kernel < 0.1 && r.axisSpread < 0.1 && r.faceSpread < 0.1,
    )
    const aboveFloor = committed.every((r, k) => {
      const s = streaming[k]

      return (
        !!s &&
        r.kernel > 10 * s.kernel &&
        r.axisSpread > 10 * s.axisSpread &&
        (r.faceSpread < 0 || r.faceSpread > 10 * s.faceSpread)
      )
    })
    const first = committed[0]
    const last = committed[committed.length - 1]
    const kernelKept = (last?.kernel ?? 0) / (first?.kernel ?? 1)
    const axisKept = (last?.axisSpread ?? 0) / (first?.axisSpread ?? 1)
    const persists = kernelKept > 0.7 && axisKept > 0.8

    const ok = forcingOk && floorOk && aboveFloor && persists

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the torus group forces rank 2 and not rank 4, W(F4) forces ranks 2 and 4 and not 6, and the committed rule\'s {I, -I} forces nothing; pure streaming reads under 0.1 at every side; and the committed rule\'s rank-2 kernel anisotropy and axis-shell spread sit more than ten times above that floor at sides 9, 13 and 17 and keep more than 0.7 and 0.8 of their side-9 values at side 17',
      metrics: {
        ...Object.fromEntries(
          committed.flatMap(r => [
            [`kernelAnisotropySide${r.side}`, Number(r.kernel.toFixed(4))],
            [
              `kernelAnisotropyFirstHalfSide${r.side}`,
              Number(r.kernelFirstHalf.toFixed(4)),
            ],
            [`axisSpreadSide${r.side}`, Number(r.axisSpread.toFixed(4))],
            ...(r.faceSpread >= 0
              ? [[`faceSpreadSide${r.side}`, Number(r.faceSpread.toFixed(4))]]
              : []),
          ]),
        ),
        kernelKeptSide17OverSide9: Number(kernelKept.toFixed(4)),
        axisSpreadKeptSide17OverSide9: Number(axisKept.toFixed(4)),
        kernelExponent: Number(
          powerLawExponent(
            SIDES,
            committed.map(r => r.kernel),
          ).toFixed(3),
        ),
        axisSpreadExponent: Number(
          powerLawExponent(
            SIDES,
            committed.map(r => r.axisSpread),
          ).toFixed(3),
        ),
      },
      control: {
        forcingB4Rank2: Number(forcing.b4Rank2.toExponential(3)),
        forcingB4Rank4: Number(forcing.b4Rank4.toExponential(3)),
        forcingF4Rank2: Number(forcing.f4Rank2.toExponential(3)),
        forcingF4Rank4: Number(forcing.f4Rank4.toExponential(3)),
        forcingF4Rank6: Number(forcing.f4Rank6.toExponential(3)),
        forcingCommittedRank2: Number(forcing.committedRank2.toExponential(3)),
        ...Object.fromEntries(
          streaming.flatMap(r => [
            [`streamingKernelSide${r.side}`, Number(r.kernel.toFixed(4))],
            [`streamingAxisSpreadSide${r.side}`, Number(r.axisSpread.toFixed(4))],
            [`streamingFaceSpreadSide${r.side}`, Number(r.faceSpread.toFixed(4))],
          ]),
        ),
        lossForOneOverL: Number((SIDES[0]! / SIDES[2]!).toFixed(4)),
        lossForKSquared: Number(((SIDES[0]! / SIDES[2]!) ** 2).toFixed(4)),
      },
      notes:
        'L2. The anisotropy is in the leading, rank-2 term of the response, the term a lattice with symmetry would force to be isotropic and this rule does not, so coarse-graining cannot remove it: shrinking k only removes higher-order terms, and the kernel anisotropy levels near 1.3 while the axis-shell spread does not fall at all. The axis waves show the direction ordering directly: a wave along axis 0 relaxes furthest and one along axis 3 hardly relaxes (E-FRC-0143\'s protected directions 0 and 1 stream in the plane of axes 0 and 1). Rank 2 anisotropy could still be a metric (a linear change of coordinates makes one positive rank-2 tensor isotropic), so what is ruled out is rotation symmetry in the lattice\'s own coordinates, not an emergent metric; that needs two independent rank-2 tensors to agree, not measured here. A lone tone on the vacuum does not spread (it is a dressed ballistic particle, E-FND-0120), so it has no coarse spreading tensor, and the long-wave relaxation stands in for the diffusion tensor. Deterministic fills and perturbations throughout; the streaming floor is the imbalance of which slots happened to be calm.',
    })
  },
})
