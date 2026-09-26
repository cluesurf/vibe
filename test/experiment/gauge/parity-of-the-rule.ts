// Does the committed rule tell left from right? The weak force does: it acts on one of the two SU(2)
// factors of SO(4) = SU(2)_L x SU(2)_R / Z_2 and not the other, so its world and its mirror image obey
// different laws. Three measurements on the committed turning weave, each with a control that can
// give the other answer.
//
// 1. THE LEDGER. Every coin permutation (1152), every tone relabelling (6), every time shift and
//    every mirror phase (24), as a forward symmetry and as a reversal symmetry of the cell collision
//    (code/measure/rule-symmetry-ledger). Each entry's orientation is the determinant of its coin
//    part, the same on the lattice for a reversal (whose spatial part is minus the coin part, and
//    det(-q) = det(q) in four dimensions). E-FRC-0113 ran the forward half; the reversal half is new.
//    Control: the pair rule (the previous committed knit), which the same search must find
//    reflections in.
// 2. THE TURN. The schedule precesses the couple partition under G_TURN, a line permutation. The
//    two coin elements with that line action are factored as x -> l x conj(r), and the SO(3) angles
//    of l and r compared. A rotation whose two factors turn by different angles is not conjugate to
//    its own mirror image. Control: the mirror-conjugated element, whose angles must swap.
// 3. THE RESPONSE. A lone love launched along each of the 24 directions on the vacuum; its mean
//    charge current over one schedule period (24 beats), exact integer arithmetic
//    (code/measure/chiral-response). The 4 x 4 response sum_d current(d) direction(d)^T has an
//    antisymmetric part, a two-form, whose self-dual and anti-self-dual halves are the su(2)_L and
//    su(2)_R components. A reflection swaps them, so a mirror-symmetric rule has equal halves.
//    Controls: the pair rule (reflection symmetric, halves must be equal exactly), and the committed
//    rule conjugated by a reflection (halves must swap exactly). Two sizes, 9 and 13.
//
// Depth L2: exhaustive symmetry search and exact response measurement on a constructed rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import {
  Collision,
  G_TURN,
  pairCollision,
  turningWeave,
} from '@/code/rule/collision'
import {
  CHARGE_CONJUGATION,
  conjugateCollision,
  orientationOf,
  symmetryLedger,
  type LedgerEntry,
} from '@/code/measure/rule-symmetry-ledger'
import {
  isoclinicFactors,
  loneChargeCurrent,
  responseMatrix,
  selfDualSplit,
  so3AngleDegrees,
  vacuumCellTrajectory,
} from '@/code/measure/chiral-response'
import { linearMapOf } from '@/code/substrate/d4-box'

const PERIOD = 24
const SIZES = [9, 13]

type Split = { selfDual: number; antiSelfDual: number }

function responseSplit(input: {
  side: number
  schedule: (beat: number) => Collision
}): Split {
  const mesh = d4Mesh({ side: input.side })
  const directions = rootsD4()
  const vacuum = vacuumCellTrajectory({
    schedule: input.schedule,
    beats: PERIOD,
    degree: 24,
  })
  const mid = Math.floor(input.side / 2)
  const cell =
    mid + mid * input.side + mid * input.side ** 2 + mid * input.side ** 3
  const currents = directions.map((_, direction) =>
    loneChargeCurrent({
      mesh,
      schedule: input.schedule,
      directions,
      vacuum,
      cell,
      direction,
      tone: 1,
      beats: PERIOD,
    }),
  )
  const split = selfDualSplit(
    responseMatrix({ currents, directions }),
  )

  return {
    selfDual: Math.hypot(...split.selfDual),
    antiSelfDual: Math.hypot(...split.antiSelfDual),
  }
}

export default experiment({
  id: 'gauge/parity-of-the-rule',
  code: 'E-FRC-0142',
  title:
    'the committed rule tells left from right: its only symmetries are the identity and the charge-conjugated reversal whose spatial part is the point inversion (a rotation in four dimensions), none of 1152 x 6 x 24 forward or reversal candidates reverses orientation where the pair rule keeps 12 that do, its turn is a chiral rotation (left and right factors turning 90 and 180 degrees), and a lone love\'s current response has a self-dual half 4.1 and 4.7 times its anti-self-dual half at sides 9 and 13, swapped exactly by the mirrored rule, where the reflection-symmetric pair rule gives equal halves exactly',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const roots = rootsD4()
    const permutations = weylF4DirectionPermutations({ directions: roots })
    const identityIndex = permutations.findIndex(p =>
      p.every((image, d) => image === d),
    )

    // 1. the ledger
    const committedSchedule = turningWeave({ opposite })
    const committedInverse = turningWeave({ opposite, forward: false })
    const committed = symmetryLedger({
      forward: committedSchedule,
      inverse: committedInverse,
      period: PERIOD,
      permutations,
      degree: 24,
    })
    const pair = symmetryLedger({
      forward: () => pairCollision({ opposite }),
      inverse: () => pairCollision({ opposite, forward: false }),
      period: 1,
      permutations,
      degree: 24,
    })
    const reflections = (entries: LedgerEntry[]): number =>
      entries.filter(e => orientationOf(permutations[e.p] ?? []) === -1)
        .length
    const committedCpt = committed.filter(
      e =>
        e.kind === 'reversal' &&
        e.p === identityIndex &&
        e.tau === CHARGE_CONJUGATION,
    )
    const committedIdentity = committed.some(
      e => e.kind === 'forward' && e.p === identityIndex && e.tau === 0,
    )

    // 2. the turn
    const lines: [number, number][] = []

    for (let d = 0; d < 24; d++) {
      if (d < (opposite[d] ?? d)) {
        lines.push([d, opposite[d] ?? d])
      }
    }

    const lineOf = new Array<number>(24).fill(-1)

    lines.forEach(([a, b], l) => {
      lineOf[a] = l
      lineOf[b] = l
    })

    const turns = permutations.filter(p =>
      lines.every(([a], l) => lineOf[p[a] ?? 0] === G_TURN[l]),
    )
    const angles = turns.map(p => {
      const factors = isoclinicFactors(linearMapOf(p) ?? [])

      return factors
        ? [so3AngleDegrees(factors.left), so3AngleDegrees(factors.right)]
        : [-1, -1]
    })
    // the reflection x_2 -> -x_2, a symmetry of the integer torus, as a direction permutation
    const mirror = roots.map(root =>
      roots.findIndex(other =>
        other.every((x, k) => x === (k === 2 ? -(root[k] ?? 0) : root[k])),
      ),
    )
    const mirrorOf = (p: readonly number[]): number[] => {
      // mirror p mirror, mirror an involution
      return roots.map((_, d) => mirror[p[mirror[d] ?? 0] ?? 0] ?? 0)
    }
    const mirroredAngles = turns.map(p => {
      const factors = isoclinicFactors(linearMapOf(mirrorOf(p)) ?? [])

      return factors
        ? [so3AngleDegrees(factors.left), so3AngleDegrees(factors.right)]
        : [-1, -1]
    })
    const turnChiral = angles.every(
      ([l, r]) => (l ?? 0) >= 0 && Math.abs((l ?? 0) - (r ?? 0)) > 1e-6,
    )
    const turnMirrorSwaps = angles.every(
      ([l, r], k) =>
        Math.abs((l ?? 0) - (mirroredAngles[k]?.[1] ?? -9)) < 1e-9 &&
        Math.abs((r ?? 0) - (mirroredAngles[k]?.[0] ?? -9)) < 1e-9,
    )

    // 3. the response
    const pairSchedule = (): Collision => pairCollision({ opposite })
    const mirroredSchedule = (t: number): Collision =>
      conjugateCollision({
        collision: committedSchedule(t),
        permutation: mirror,
      })
    const committedSplits = SIZES.map(side =>
      responseSplit({ side, schedule: committedSchedule }),
    )
    const mirrored = responseSplit({
      side: SIZES[0] ?? 9,
      schedule: mirroredSchedule,
    })
    const pairSplit = responseSplit({
      side: SIZES[0] ?? 9,
      schedule: pairSchedule,
    })
    const small = committedSplits[0] ?? { selfDual: 0, antiSelfDual: 0 }
    const mirrorSwaps =
      Math.abs(mirrored.selfDual - small.antiSelfDual) < 1e-9 &&
      Math.abs(mirrored.antiSelfDual - small.selfDual) < 1e-9
    const pairEqual =
      Math.abs(pairSplit.selfDual - pairSplit.antiSelfDual) < 1e-9
    const ratios = committedSplits.map(s => s.selfDual / s.antiSelfDual)
    const chiralAtEverySize = ratios.every(r => r > 2)

    const ok =
      committedIdentity &&
      committedCpt.length === 1 &&
      committed.length === 2 &&
      reflections(committed) === 0 &&
      reflections(pair) > 0 &&
      turns.length === 2 &&
      turnChiral &&
      turnMirrorSwaps &&
      mirrorSwaps &&
      pairEqual &&
      chiralAtEverySize

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed rule keeps exactly two entries of the ledger (the identity and the charge-conjugated reversal at one mirror phase), none orientation reversing, where the pair rule keeps reflections; both coin elements carrying its turn have unequal left and right angles that swap under a mirror; and its lone-tone response has a self-dual half more than twice its anti-self-dual half at sides 9 and 13, the mirrored rule swapping them exactly and the pair rule giving equal halves exactly',
      metrics: {
        committedLedgerEntries: committed.length,
        committedReflections: reflections(committed),
        committedCptMirrorPhase: committedCpt[0]?.phase ?? -1,
        pairLedgerEntries: pair.length,
        pairReflections: reflections(pair),
        turnElements: turns.length,
        turnOrderOnDirections: permutationOrder({
          permutation: turns[0] ?? [],
        }),
        turnLeftAngle: Number((angles[0]?.[0] ?? -1).toFixed(6)),
        turnRightAngle: Number((angles[0]?.[1] ?? -1).toFixed(6)),
        ...Object.fromEntries(
          SIZES.flatMap((side, k) => [
            [
              `selfDualSide${side}`,
              Number((committedSplits[k]?.selfDual ?? 0).toFixed(6)),
            ],
            [
              `antiSelfDualSide${side}`,
              Number((committedSplits[k]?.antiSelfDual ?? 0).toFixed(6)),
            ],
            [`chiralRatioSide${side}`, Number((ratios[k] ?? 0).toFixed(4))],
          ]),
        ),
      },
      control: {
        pairSelfDual: Number(pairSplit.selfDual.toFixed(6)),
        pairAntiSelfDual: Number(pairSplit.antiSelfDual.toFixed(6)),
        mirroredSelfDual: Number(mirrored.selfDual.toFixed(6)),
        mirroredAntiSelfDual: Number(mirrored.antiSelfDual.toFixed(6)),
        mirroredTurnLeftAngle: Number(
          (mirroredAngles[0]?.[0] ?? -1).toFixed(6),
        ),
        mirroredTurnRightAngle: Number(
          (mirroredAngles[0]?.[1] ?? -1).toFixed(6),
        ),
      },
      notes:
        'L2, exhaustive and exact. The reversal the committed rule keeps has coin part the identity and tone map fear <-> love, which on the lattice is charge conjugation with time reversal and the point inversion x -> -x: that inversion has determinant +1 in four dimensions (it is the element (-1, 1) of SU(2)_L x SU(2)_R), so the rule\'s CPT contains no parity at all, and nothing else survives. Self-dual and anti-self-dual are fixed by the orientation of the rootsD4 coordinates, epsilon_0123 = +1, and which half is called left is that convention. The chirality is not the weak interaction\'s: the rule breaks every rotation too (the ledger keeps none), so the handedness sits on top of a total anisotropy, and the symmetric part of the response is anisotropic as well. What is established is that a mirror-image world runs a different law, and that the rotational part of the response lies mostly in one SU(2) factor. The pair-rule control is weaker than it looks: its halves are equal because both are zero (its response has no antisymmetric part at all), so the mirrored committed rule, which swaps 2.43 and 0.59 exactly, is the control that carries the weight. The lone-tone current counts pair radiation, so it is a response, not a particle velocity. Earlier E-SPN-0037 states that P is exact on {3,4,3,4}: that is the hand-built Dirac walk, not this rule.',
    })
  },
})
