// What exclusion gives in the base, in two places.
//
// 1. EXCHANGE IS FEAR ON COINCIDENCE. The fermion's exchange sign is not a classical thing: a classical
//    state of identical tones is a set, and swapping two members changes nothing. Where does the sign
//    live? On the phase space of the roles (the 3 x 3 grid of a qutrit, E-FRC-0104, E-FRC-0120), a
//    state is a real weight on the points, and the negative weight a classical mixture cannot have is
//    what E-FRC-0120 called fear. Here the uniform mixtures over the SYMMETRIC (boson) and the
//    ANTISYMMETRIC (fermion) subspaces of two and of three qutrits are written on their 81 and 729
//    points (code/measure/qutrit-exchange), in whole units of love and fear. Measured: how many fears
//    each needs, and WHERE the fears sit. The three-qutrit antisymmetric state is the color singlet,
//    so its count is a second, independent computation of E-FRC-0120's (54 units, 72 loves, 18 fears).
//    Pauli's principle is read off the role marginal: the probability that two fermions hold the same
//    role must be exactly zero.
// 2. THE SLOT GAS. In the committed rule a slot holds one tone, so exclusion is the state space. What
//    does it do dynamically? A dense deterministic fill with a charge bias is run under the committed
//    turning weave, and each direction's occupation compared with the law a slot must obey once only
//    the charge is remembered: p(love) p(fear) = p(calm)^2 (code/measure/slot-statistics). Two fills
//    and two sizes. Control: pure streaming (no collision), which keeps every direction's initial
//    occupations, so its ratio stays where the fill put it.
//
// Depth L1 for part 1 (exact phase-space arithmetic of known states) and L2 for part 2 (a measured
// statistic of the committed rule).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { Collision, passThrough, turningWeave } from '@/code/rule/collision'
import {
  allCoincide,
  exchangeSubspace,
  hasCoincidence,
  lovesAndFears,
  roleMarginal,
  wignerOfMixture,
} from '@/code/measure/qutrit-exchange'
import {
  directionCounts,
  goldenFill,
  massActionRatio,
} from '@/code/measure/slot-statistics'

const BEATS = 960
const FILLS = [
  { side: 9, love: 0.4, fear: 0.1 },
  { side: 11, love: 0.2, fear: 0.35 },
]

type SlotRun = {
  initialRatio: number
  frozen: number[]
  pooledInteracting: number
  withinTwoPercent: number
  interacting: number
}

function slotRun(input: {
  side: number
  love: number
  fear: number
  schedule: (beat: number) => Collision
}): SlotRun {
  const mesh = d4Mesh({ side: input.side })
  const table = streamSourceTable(mesh)
  let src: Will = makeWill(mesh)
  let dst: Will = makeWill(mesh)

  goldenFill({ will: src, love: input.love, fear: input.fear })

  const initial = directionCounts(src)
  const unchanged = new Array<boolean>(24).fill(true)
  const sums = Array.from({ length: 24 }, () => [0, 0, 0])

  for (let t = 0; t < BEATS; t++) {
    beatInto({ src, dst, table, collision: input.schedule(t) })

    const swap = src

    src = dst
    dst = swap

    const counts = directionCounts(src)

    counts.forEach((row, d) => {
      if (row.some((c, k) => c !== initial[d]?.[k])) {
        unchanged[d] = false
      }

      if (t >= BEATS / 2) {
        row.forEach((c, k) => {
          ;(sums[d] as number[])[k] = (sums[d]?.[k] ?? 0) + c
        })
      }
    })
  }

  const frozen = unchanged
    .map((u, d) => (u ? d : -1))
    .filter(d => d >= 0)
  const interacting = sums.filter((_, d) => !frozen.includes(d))
  const pooled = [0, 1, 2].map(k =>
    interacting.reduce((s, row) => s + (row[k] ?? 0), 0),
  )

  return {
    initialRatio: massActionRatio(
      [0, 1, 2].map(k => initial.reduce((s, row) => s + (row[k] ?? 0), 0)),
    ),
    frozen,
    pooledInteracting: massActionRatio(pooled),
    withinTwoPercent: interacting.filter(
      row => Math.abs(massActionRatio(row) - 1) < 0.02,
    ).length,
    interacting: interacting.length,
  }
}

export default experiment({
  id: 'spin/exchange-fear-and-slot-exclusion',
  code: 'E-SPN-0045',
  title:
    'exclusion in the base, twice: on the role phase space the fermion pair needs fear and the boson pair none, and every fear sits where the two fermions coincide (18 fears in 54 units on the 9 coincident points of 81, the three-fermion singlet the same 72 loves and 18 fears E-FRC-0120 found), with a zero probability of two fermions in one role; and under the committed rule a charge-biased slot gas relaxes toward the one-tone-per-slot law p(love) p(fear) = p(calm)^2 in its interacting directions while the two protected directions keep their fill exactly',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. exchange on the role phase space
    const cases = [2, 3].flatMap(n =>
      (['symmetric', 'antisymmetric'] as const).map(symmetry => {
        const mixture = exchangeSubspace({ n, symmetry })
        const wigner = wignerOfMixture({ n, mixture })
        const negative = wigner
          .map((w, x) => (w < -1e-12 ? x : -1))
          .filter(x => x >= 0)
        const marginal = roleMarginal({ n, wigner })
        // the probability that some two particles hold the same role
        let sameRole = 0

        marginal.forEach((p, index) => {
          const roles = Array.from(
            { length: n },
            (_, k) => Math.floor(index / 3 ** (n - 1 - k)) % 3,
          )

          if (roles.some((r, k) => roles.indexOf(r) !== k)) {
            sameRole += p
          }
        })

        return {
          n,
          symmetry,
          dimension: mixture.length,
          total: wigner.reduce((a, b) => a + b, 0),
          ...lovesAndFears(wigner),
          negative: negative.length,
          negativeCoincident: negative.filter(x => hasCoincidence(x, n))
            .length,
          negativeAllCoincide: negative.filter(x => allCoincide(x, n)).length,
          sameRole,
        }
      }),
    )
    const find = (
      n: number,
      symmetry: string,
    ): (typeof cases)[number] | undefined =>
      cases.find(c => c.n === n && c.symmetry === symmetry)
    const bosonPair = find(2, 'symmetric')
    const fermionPair = find(2, 'antisymmetric')
    const bosonTriple = find(3, 'symmetric')
    const singlet = find(3, 'antisymmetric')
    const exchangeOk =
      cases.every(c => Math.abs(c.total - 1) < 1e-9) &&
      bosonPair?.fears === 0 &&
      bosonTriple?.fears === 0 &&
      (fermionPair?.fears ?? 0) > 0 &&
      fermionPair?.negative === fermionPair?.negativeCoincident &&
      Math.abs(fermionPair?.sameRole ?? 1) < 1e-9 &&
      Math.abs(singlet?.sameRole ?? 1) < 1e-9 &&
      (bosonPair?.sameRole ?? 0) > 0 &&
      singlet?.units === 54 &&
      singlet?.loves === 72 &&
      singlet?.fears === 18

    // 2. the slot gas
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const committed = turningWeave({ opposite })
    const runs = FILLS.map(fill =>
      slotRun({ ...fill, schedule: committed }),
    )
    const controls = FILLS.map(fill =>
      slotRun({ ...fill, schedule: () => passThrough }),
    )
    const slotOk =
      runs.every(
        r =>
          r.frozen.length === 2 &&
          Math.abs(r.pooledInteracting - 1) < 0.1 &&
          Math.abs(r.initialRatio - 1) > 0.3,
      ) &&
      controls.every(c => c.frozen.length === 24)

    const ok = exchangeOk && slotOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the symmetric states of two and three qutrits need no fear, the antisymmetric pair needs fear and every one of its negative points is a coincidence of the two points, two fermions never share a role, the three-fermion singlet is 54 units of 72 loves and 18 fears, and under the committed rule the interacting directions of two biased fills pool within 0.1 of the slot law while exactly 2 directions keep their fill and pure streaming keeps all 24',
      metrics: {
        bosonPairUnits: bosonPair?.units ?? -1,
        bosonPairFears: bosonPair?.fears ?? -1,
        fermionPairUnits: fermionPair?.units ?? -1,
        fermionPairLoves: fermionPair?.loves ?? -1,
        fermionPairFears: fermionPair?.fears ?? -1,
        fermionPairNegativePoints: fermionPair?.negative ?? -1,
        fermionPairNegativeCoincident: fermionPair?.negativeCoincident ?? -1,
        fermionPairSameRole: Number((fermionPair?.sameRole ?? -1).toFixed(12)),
        bosonPairSameRole: Number((bosonPair?.sameRole ?? -1).toFixed(6)),
        bosonTripleUnits: bosonTriple?.units ?? -1,
        bosonTripleFears: bosonTriple?.fears ?? -1,
        singletUnits: singlet?.units ?? -1,
        singletLoves: singlet?.loves ?? -1,
        singletFears: singlet?.fears ?? -1,
        singletNegativePoints: singlet?.negative ?? -1,
        singletNegativeAllCoincide: singlet?.negativeAllCoincide ?? -1,
        ...Object.fromEntries(
          runs.flatMap((r, k) => [
            [`fill${k + 1}InitialRatio`, Number(r.initialRatio.toFixed(4))],
            [`fill${k + 1}PooledRatio`, Number(r.pooledInteracting.toFixed(4))],
            [`fill${k + 1}FrozenDirections`, r.frozen.length],
            [`fill${k + 1}InteractingWithinTwoPercent`, r.withinTwoPercent],
            [`fill${k + 1}Interacting`, r.interacting],
          ]),
        ),
      },
      control: {
        ...Object.fromEntries(
          controls.flatMap((c, k) => [
            [`streamingFill${k + 1}FrozenDirections`, c.frozen.length],
            [`streamingFill${k + 1}Ratio`, Number(c.initialRatio.toFixed(4))],
          ]),
        ),
      },
      notes: `Part 1 is L1: the negative weight of the antisymmetric pair is -1/27 on each coincident point and +1/54 elsewhere, which follows from Tr A(x) A(y) = 3 delta(x, y), so the exchange sign of a fermion is a fear placed exactly where two particles would coincide, and the boson pair has none. This is the Pauli principle written in the model's signed weights, not a result of the rule: the committed rule carries no amplitudes (E-FND-0080), so it does not produce the sign. Part 2 is the rule's own exclusion. The frozen directions are ${runs.map(r => r.frozen.join(' and ')).join('; ')}, the leading ends of the two lines the vacuum never occupies (E-FRC-0143): a protected species never thermalizes, it streams its initial fill forever. The interacting directions relax toward the law but not all the way in ${BEATS} beats: ${runs.map((r, k) => `fill ${k + 1} has ${r.withinTwoPercent} of ${r.interacting} within 2 percent`).join(', ')}, and a 1,920-beat probe at side 9 left four directions (13, 14, 17, 18) 8 to 21 percent off, so the rule mixes slowly or keeps more than the charge in those directions, reported rather than gated. What this does NOT show is Fermi-Dirac statistics: a one-tone slot with a particle and an antiparticle state is a three-state site, and its law is the one tested.`,
    })
  },
})
