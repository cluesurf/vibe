// Does the committed rule carry the spin-one-half double cover, or only the coin it runs on?
// E-SPN-0029, E-SPN-0031 and E-SPN-0042 show that the 24 coin directions ARE the binary tetrahedral
// group 2T, the double cover, where a 2 pi turn is the quaternion -1. None of them runs the rule. Here
// the same question is asked of the committed turning weave, four ways.
//
// 1. WHERE THE -1 LIVES ON THE COIN (instrument, L1). The directions, scaled to unit length, are the
//    coset 2T u with u = (1 + i) / sqrt 2: every direction is g u for exactly one g in 2T, so left
//    multiplication by 2T is a free and transitive action on them, the spinor (regular) action of
//    SU(2)_L. Its -1 sends every direction to its opposite. Conjugation, the vector action, fixes all
//    24 under the same -1. So a 2 pi turn of SU(2)_L is the point inversion x -> -x of four-space.
// 2. THE RULE'S OWN TURN. The couple partition precesses under G_TURN, a permutation of the 12 lines.
//    The two coin elements with that line action are factored x -> l x conj(r). The orders of l and r
//    say what a closed loop of turns lifts to: the loop closes on lines after 4 turns, and its lift is
//    (l^4, r^4) in SU(2)_L x SU(2)_R. Control: the mirror-conjugated element, whose factors swap.
// 3. THE SCHEDULE'S HOLONOMY. The committed schedule walks the partition out and back (positions
//    0 1 2 3 3 2 1 0), so over a period its net turn is G^0. The cyclic schedule, the rejected control
//    of E-FND-0117, turns once per beat for 12 beats, net G^12. Both lifted.
// 4. IS THE 2 PI TURN A SYMMETRY OF THE DYNAMICS? A spinor's -1 is a sign on a state the laws cannot
//    otherwise tell apart. Here the -1 of SU(2)_L is the point inversion, a spatial map, so the test is
//    whether the rule is invariant under it (code/measure/rule-symmetry-ledger, the coin part -I and
//    the identity, every tone relabelling, every time shift and mirror phase, forward and reversal),
//    and dynamically whether a lone love launched along d and one launched along -d have opposite
//    mean charge currents (code/measure/chiral-response). Controls: the pair rule, which keeps -I
//    combined with charge conjugation, and pure streaming, where the two currents are exactly opposite.
//
// Depth L2: exact group arithmetic on the coin and exact measurements of the constructed rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  binaryTetrahedralGroup,
  quaternionMultiply,
  quaternionsClose,
  vectorAction,
  type Quaternion,
} from '@/code/algebra/binary-tetrahedral'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import {
  Collision,
  G_TURN,
  TURN_POS_MIRROR,
  pairCollision,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import {
  CHARGE_CONJUGATION,
  symmetryLedger,
} from '@/code/measure/rule-symmetry-ledger'
import {
  isoclinicFactors,
  loneChargeCurrent,
  quaternionOrder,
  vacuumCellTrajectory,
} from '@/code/measure/chiral-response'
import { linearMapOf } from '@/code/substrate/d4-box'

const PERIOD = 24
const SIDE = 9
const CYCLIC_PERIOD = 12

function power(q: Quaternion, n: number): Quaternion {
  let out: Quaternion = [1, 0, 0, 0]

  for (let k = 0; k < n; k++) {
    out = quaternionMultiply(out, q)
  }

  return out
}

// +1 or -1 when q is that scalar, 0 otherwise
function scalarSign(q: Quaternion): number {
  if (quaternionsClose(q, [1, 0, 0, 0])) {
    return 1
  }

  if (quaternionsClose(q, [-1, 0, 0, 0])) {
    return -1
  }

  return 0
}

function antipodalMismatch(input: {
  schedule: (beat: number) => Collision
  opposite: readonly number[]
}): { mismatch: number; total: number; exactPairs: number } {
  const mesh = d4Mesh({ side: SIDE })
  const directions = rootsD4()
  const vacuum = vacuumCellTrajectory({
    schedule: input.schedule,
    beats: PERIOD,
    degree: 24,
  })
  const mid = Math.floor(SIDE / 2)
  const cell = mid + mid * SIDE + mid * SIDE ** 2 + mid * SIDE ** 3
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
  let mismatch = 0
  let total = 0
  let exactPairs = 0

  currents.forEach((v, d) => {
    const w = currents[input.opposite[d] ?? d] ?? []
    const gap = Math.hypot(...v.map((x, k) => x + (w[k] ?? 0)))

    mismatch += gap
    total += Math.hypot(...v)

    if (gap < 1e-12) {
      exactPairs++
    }
  })

  return { mismatch, total, exactPairs }
}

export default experiment({
  id: 'spin/double-cover-on-the-rule',
  code: 'E-SPN-0044',
  title:
    'the committed rule does not carry the spinor sign: the coin directions are a 2T torsor on which the 2 pi turn of SU(2)_L is the point inversion, the rule\'s own turn lifts after four steps to that 2 pi turn in SU(2)_L alone, the palindromic schedule retraces it to a net lift of +1 where the rejected cyclic schedule nets -1, and the point inversion is no symmetry of the rule except joined to charge conjugation and time reversal, so a lone love and its 2 pi image run different histories',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const opposite = meshOpposites(d4Mesh({ side: 5 }))

    // 1. the coin as a 2T torsor
    const group = binaryTetrahedralGroup()
    const u: Quaternion = [Math.SQRT1_2, Math.SQRT1_2, 0, 0]
    const unit = (root: readonly number[]): Quaternion => [
      (root[0] ?? 0) * Math.SQRT1_2,
      (root[1] ?? 0) * Math.SQRT1_2,
      (root[2] ?? 0) * Math.SQRT1_2,
      (root[3] ?? 0) * Math.SQRT1_2,
    ]
    const torsorHits = roots.map(
      root =>
        group.filter(g => quaternionsClose(quaternionMultiply(g, u), unit(root)))
          .length,
    )
    const minusOne: Quaternion = [-1, 0, 0, 0]
    const leftAntipode = roots.filter((root, d) =>
      quaternionsClose(
        quaternionMultiply(minusOne, unit(root)),
        unit(roots[opposite[d] ?? d] ?? []),
      ),
    ).length
    const conjugationFixed = roots.filter(root =>
      quaternionsClose(vectorAction(minusOne, unit(root)), unit(root)),
    ).length

    // 2. the rule's turn
    const permutations = weylF4DirectionPermutations({ directions: roots })
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
    const factors = turns.map(p => isoclinicFactors(linearMapOf(p) ?? []))
    const mirror = roots.map(root =>
      roots.findIndex(other =>
        other.every((x, k) => x === (k === 2 ? -(root[k] ?? 0) : root[k])),
      ),
    )
    const mirroredFactors = turns.map(p =>
      isoclinicFactors(
        linearMapOf(roots.map((_, d) => mirror[p[mirror[d] ?? 0] ?? 0] ?? 0)) ??
          [],
      ),
    )
    const first = factors[0]
    const left = first?.left ?? [0, 0, 0, 0]
    const right = first?.right ?? [0, 0, 0, 0]
    const fourthPower = turns.map(p => {
      let image = roots.map((_, d) => d)

      for (let k = 0; k < 4; k++) {
        image = image.map(d => p[d] ?? d)
      }

      return image.every((d, k) => d === opposite[k])
    })

    // 3. schedule holonomy: the unwrapped number of turns over one period. The partition at beat t is
    // G^k(t) of the beat-zero partition, and each beat's step k(t + 1) - k(t) is read mod 4 into
    // {-1, 0, 1, 2} and summed, so a walk out and back nets zero and a steady turn nets its count.
    const netTurns = (position: (beat: number) => number, period: number): number => {
      let net = 0

      for (let t = 0; t < period; t++) {
        const step = (((position(t + 1) - position(t)) % 4) + 4) % 4

        net += step === 3 ? -1 : step
      }

      return net
    }
    const committedNet = netTurns(
      t => TURN_POS_MIRROR[t % TURN_POS_MIRROR.length] ?? 0,
      PERIOD,
    )
    const cyclicNet = netTurns(t => t % 4, CYCLIC_PERIOD)
    const lift = (net: number): number[] => [
      scalarSign(power(left, ((net % 8) + 8) % 8)),
      scalarSign(power(right, ((net % 8) + 8) % 8)),
    ]
    const committedLift = lift(committedNet)
    const cyclicLift = lift(cyclicNet)

    // 4. is the point inversion a symmetry
    const identity = roots.map((_, d) => d)
    const candidates = [identity, [...opposite]]
    const committedLedger = symmetryLedger({
      forward: turningWeave({ opposite }),
      inverse: turningWeave({ opposite, forward: false }),
      period: PERIOD,
      permutations: candidates,
      degree: 24,
    })
    const pairLedger = symmetryLedger({
      forward: () => pairCollision({ opposite }),
      inverse: () => pairCollision({ opposite, forward: false }),
      period: 1,
      permutations: candidates,
      degree: 24,
    })
    // forward entries with coin part -I are the point inversion as a symmetry
    const committedInversion = committedLedger.filter(
      e => e.kind === 'forward' && e.p === 1,
    ).length
    // a reversal with coin part the identity is, on the lattice, the inversion with time reversal
    const committedInversionWithCt = committedLedger.filter(
      e => e.kind === 'reversal' && e.p === 0 && e.tau === CHARGE_CONJUGATION,
    ).length
    const pairInversionWithC = pairLedger.filter(
      e => e.kind === 'forward' && e.p === 1 && e.tau === CHARGE_CONJUGATION,
    ).length
    const committedAntipodal = antipodalMismatch({
      schedule: turningWeave({ opposite }),
      opposite,
    })
    const streamingAntipodal = antipodalMismatch({
      schedule: () => passThrough,
      opposite,
    })

    const ok =
      torsorHits.every(h => h === 1) &&
      leftAntipode === 24 &&
      conjugationFixed === 24 &&
      turns.length === 2 &&
      factors.every(f => !!f) &&
      fourthPower.every(Boolean) &&
      scalarSign(power(left, 4)) === -1 &&
      scalarSign(power(right, 4)) === 1 &&
      mirroredFactors.every(
        f =>
          !!f &&
          scalarSign(power(f.left, 4)) === 1 &&
          scalarSign(power(f.right, 4)) === -1,
      ) &&
      committedNet === 0 &&
      cyclicNet === CYCLIC_PERIOD &&
      committedLift[0] === 1 &&
      committedLift[1] === 1 &&
      cyclicLift[0] === -1 &&
      cyclicLift[1] === 1 &&
      committedInversion === 0 &&
      committedInversionWithCt === 1 &&
      pairInversionWithC === 1 &&
      streamingAntipodal.mismatch === 0 &&
      committedAntipodal.mismatch > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every direction is g u for exactly one g in 2T, the left -1 is the antipode on all 24 and conjugation by -1 fixes all 24; both elements carrying the rule\'s turn have fourth power the point inversion, lifting to (-1, +1) in SU(2)_L x SU(2)_R, and their mirror images to (+1, -1); the committed schedule nets zero turns (lift +1, +1) and the cyclic control twelve (lift -1, +1); the point inversion is no forward symmetry of the rule and appears only joined to charge conjugation and reversal, while the pair rule keeps it with charge conjugation; and the lone-love currents of antipodal launches fail to be opposite under the rule and are exactly opposite under pure streaming',
      metrics: {
        directionsAsTorsor: torsorHits.filter(h => h === 1).length,
        leftMinusOneIsAntipode: leftAntipode,
        conjugationMinusOneFixes: conjugationFixed,
        turnElements: turns.length,
        turnLeftOrder: quaternionOrder(left),
        turnRightOrder: quaternionOrder(right),
        turnFourthPowerIsInversion: fourthPower.filter(Boolean).length,
        committedNetTurns: committedNet,
        cyclicNetTurns: cyclicNet,
        committedLiftLeft: committedLift[0] ?? 0,
        committedLiftRight: committedLift[1] ?? 0,
        cyclicLiftLeft: cyclicLift[0] ?? 0,
        cyclicLiftRight: cyclicLift[1] ?? 0,
        committedInversionSymmetries: committedInversion,
        committedInversionWithChargeAndReversal: committedInversionWithCt,
        committedAntipodalMismatch: Number(
          committedAntipodal.mismatch.toFixed(6),
        ),
        committedCurrentTotal: Number(committedAntipodal.total.toFixed(6)),
        committedExactlyOppositePairs: committedAntipodal.exactPairs,
      },
      control: {
        mirroredTurnLeftOrder: quaternionOrder(
          mirroredFactors[0]?.left ?? [0, 0, 0, 0],
        ),
        mirroredTurnRightOrder: quaternionOrder(
          mirroredFactors[0]?.right ?? [0, 0, 0, 0],
        ),
        pairInversionWithChargeConjugation: pairInversionWithC,
        streamingAntipodalMismatch: streamingAntipodal.mismatch,
        streamingExactlyOppositePairs: streamingAntipodal.exactPairs,
      },
      notes:
        'L2. The coin carries the double cover as geometry: a direction label is acted on freely by SU(2)_L, and the 2 pi turn of that factor is the antipode. The rule does not carry it as a symmetry: the committed rule keeps no rotation at all (E-FRC-0113, E-FRC-0142), so there is no rotation group under which a lone vibe could transform as spin one half, and the one symmetry it keeps, charge conjugation with reversal, has the point inversion as its spatial part. In four Euclidean dimensions that is the familiar shape of the CRT theorem (the inversion lies in the connected rotation group), stated here as a structural match, not a derivation. The rule\'s own loop of turns lifts to the 2 pi turn of SU(2)_L alone, but the palindrome that CPT required (E-FND-0117) walks it out and back, so a label carried by the schedule returns with +1; the rejected cyclic schedule would have carried -1 every period, and it acts on unoriented lines, where the -1 is invisible anyway. Exchange: two identical lone tones are a set, so exchanging them changes nothing and has no sign; the fermion sign lives only in the signed weights (E-SPN-0045). The role grid carries SL(2, 3) = 2T faithfully (the -1 negates 8 of 9 role points) and E-FRC-0117 measured an exact local frame symmetry there, a gauge 2T rather than a rotation, not re-measured here.',
    })
  },
})
