// A Higgs-like vacuum in the committed rule? The electroweak pattern has three parts: a symmetry
// group SU(2) x U(1) that the laws respect, a vacuum that does not (a condensate whose order parameter
// picks a direction), and masses for exactly the species that couple to the condensate. This asks for
// each part in the committed turning weave.
//
// 1. SU(2) ON THE VIBE. The vibes fear, calm, love carry charges -1, 0, +1, the weights of spin one,
//    so a slot is a spin-one site and J_z is the charge. For a permutation of the 9 states of two
//    slots, the part of su(2) it respects is computed exactly (code/measure/vibe-su2). All 9! =
//    362,880 permutations are counted: how many respect all of SU(2), and how many respect the charge.
//    Then every interaction block of every beat of the committed rule is read off the collision
//    (code/measure/collision-anatomy) and tested. Controls: the identity and the swap of two slots,
//    which respect all of it.
// 2. THE VACUUM. The empty state is not fixed (calm and calm create a love and a fear), so the vacuum
//    is a condensate, uniform in space, and exactly the cell collision iterated from zero. Its period,
//    its charge, which of the 12 lines it ever occupies, whether that set depends on the phase of the
//    schedule at birth (24 births), and whether the condensate is carried to itself by the one
//    reversal the rule keeps (charge conjugation with time reversal, E-FND-0117, E-FRC-0142).
// 3. THE MASSES. A lone love on each of the 24 directions on the vacuum: exactly free (one slot,
//    one step per beat, for a whole schedule period) or not, and its mean charge current. The Higgs
//    reading predicts that the massless species are the ones the condensate leaves alone.
//
// Depth L2: exact measurements of a constructed rule, the SU(2) count exhaustive.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { PAIR_FORWARD, turningWeave } from '@/code/rule/collision'
import {
  forEachPermutation,
  respectedSu2Dimension,
  toneAt,
} from '@/code/measure/vibe-su2'
import {
  blockMap,
  interactionBlocks,
  probeConfigurations,
} from '@/code/measure/collision-anatomy'
import {
  loneChargeCurrent,
  loneTravel,
  selfDualSplit,
  vacuumCellTrajectory,
} from '@/code/measure/chiral-response'

const PERIOD = 24
const SIDE = 9

// respects J_z when the form's charge row vanishes
function respectsCharge(form: readonly (readonly number[])[]): boolean {
  return [0, 1, 2].every(k => Math.abs(form[2]?.[k] ?? 0) < 1e-9)
}

export default experiment({
  id: 'gauge/vacuum-condensate-and-su2',
  code: 'E-FRC-0143',
  title:
    'the committed rule has a Higgs-like vacuum without a Higgs mechanism: of the 9! reversible maps of two vibes exactly 2 respect SU(2) (identity and swap) and every block of the rule respects only the charge U(1), so the arrow breaks SU(2) explicitly; the vacuum is a condensate of period 24 that occupies 10 of 12 lines and leaves one plane empty at every one of 24 birth phases and is carried to itself by the rule\'s reversal, so nothing is broken spontaneously; and the only exactly free lone tones are the 2 leading directions of that empty plane',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. SU(2) on the vibe
    let fullCount = 0
    let chargeCount = 0
    let anyCount = 0
    let fullAndCharge = 0

    forEachPermutation(9, permutation => {
      const { dimension, form } = respectedSu2Dimension({
        permutation,
        slots: 2,
      })
      const charge = respectsCharge(form)

      if (dimension === 3) {
        fullCount++
      }

      if (dimension >= 1) {
        anyCount++
      }

      if (charge) {
        chargeCount++
      }

      if (charge && dimension === 3) {
        fullAndCharge++
      }
    })

    const identity = Array.from({ length: 9 }, (_, x) => x)
    const swap = identity.map(
      x => toneAt(x, 1) + 1 + (toneAt(x, 0) + 1) * 3,
    )
    // PAIR_FORWARD is keyed (left + 1) * 3 + (right + 1), left the leading slot, digit 0 here
    const pairTable = identity.map(x => {
      const left = toneAt(x, 0)
      const right = toneAt(x, 1)
      const [a, b] = PAIR_FORWARD[(left + 1) * 3 + (right + 1)] ?? [0, 0]

      return a + 1 + (b + 1) * 3
    })
    const identityDimension = respectedSu2Dimension({
      permutation: identity,
      slots: 2,
    }).dimension
    const swapDimension = respectedSu2Dimension({
      permutation: swap,
      slots: 2,
    }).dimension
    const pairResult = respectedSu2Dimension({
      permutation: pairTable,
      slots: 2,
    })

    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const schedule = turningWeave({ opposite })
    const probes = probeConfigurations({ degree: 24 })
    let blocks = 0
    let blocksChargeOnly = 0

    for (let t = 0; t < PERIOD; t++) {
      const collision = schedule(t)

      for (const block of interactionBlocks({
        collision,
        degree: 24,
        probes,
      })) {
        if (block.length < 2) {
          continue
        }

        const { dimension, form } = respectedSu2Dimension({
          permutation: blockMap({ collision, degree: 24, block }),
          slots: block.length,
        })

        blocks++

        if (dimension === 1 && respectsCharge(form)) {
          blocksChargeOnly++
        }
      }
    }

    // 2. the vacuum
    const vacuum = vacuumCellTrajectory({
      schedule,
      beats: 2 * PERIOD,
      degree: 24,
    })
    const same = (a: Int8Array | undefined, b: Int8Array | undefined): boolean =>
      !!a && !!b && a.every((x, k) => x === b[k])
    const period =
      [1, 2, 3, 4, 6, 8, 12, 24].find(p =>
        Array.from({ length: PERIOD }, (_, t) => t).every(t =>
          same(vacuum[t], vacuum[t + p]),
        ),
      ) ?? -1
    const chargeZero = vacuum.every(v => v.reduce((s, x) => s + x, 0) === 0)
    const lines: [number, number][] = []

    for (let d = 0; d < 24; d++) {
      if (d < (opposite[d] ?? d)) {
        lines.push([d, opposite[d] ?? d])
      }
    }

    const emptyLinesOf = (trajectory: readonly Int8Array[]): number[] =>
      lines
        .map(([a, b], l) =>
          trajectory.every(v => v[a] === 0 && v[b] === 0) ? l : -1,
        )
        .filter(l => l >= 0)
    const emptyLines = emptyLinesOf(vacuum.slice(0, PERIOD))
    const birthsAgreeing = Array.from({ length: PERIOD }, (_, t0) =>
      vacuumCellTrajectory({
        schedule: t => schedule(t + t0),
        beats: PERIOD,
        degree: 24,
      }),
    ).filter(
      trajectory => emptyLinesOf(trajectory).join(',') === emptyLines.join(','),
    ).length
    // the reversal carries the condensate to itself: v_t = -v_(m - t) for every t
    const mirrorPhases = Array.from({ length: PERIOD }, (_, m) => m).filter(
      m =>
        Array.from({ length: PERIOD }, (_, t) => t).every(t => {
          const a = vacuum[t]
          const b = vacuum[(((m - t) % PERIOD) + PERIOD) % PERIOD]

          return !!a && !!b && a.every((x, k) => x === -(b[k] ?? 0))
        }),
    )
    const occupiedBeats = lines.map(([a, b]) =>
      vacuum
        .slice(0, PERIOD)
        .filter(v => v[a] !== 0 || v[b] !== 0).length,
    )
    // the empty plane as a two-form, split into its su(2)_L and su(2)_R halves
    const roots = rootsD4()
    const planeRoots = emptyLines.map(l => roots[lines[l]?.[0] ?? 0] ?? [])
    const unit = (v: readonly number[]): number[] => {
      const n = Math.hypot(...v)

      return v.map(x => x / n)
    }
    const u = unit(planeRoots[0] ?? [1, 0, 0, 0])
    const w = unit(planeRoots[1] ?? [0, 1, 0, 0])
    const plane = [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j => (u[i] ?? 0) * (w[j] ?? 0) - (w[i] ?? 0) * (u[j] ?? 0)),
    )
    const planeSplit = selfDualSplit(plane)

    // 3. the masses
    const mesh = d4Mesh({ side: SIDE })
    const mid = Math.floor(SIDE / 2)
    const cell = mid + mid * SIDE + mid * SIDE ** 2 + mid * SIDE ** 3
    const free: number[] = []
    const pinned: number[] = []

    for (let d = 0; d < 24; d++) {
      const travel = loneTravel({
        mesh,
        schedule,
        vacuum,
        cell,
        direction: d,
        tone: 1,
        beats: PERIOD,
      })

      if (travel.exactlyFree) {
        free.push(d)
      }

      const current = loneChargeCurrent({
        mesh,
        schedule,
        directions: roots,
        vacuum,
        cell,
        direction: d,
        tone: 1,
        beats: PERIOD,
      })

      if (current.every(x => x === 0)) {
        pinned.push(d)
      }
    }

    const emptyDirections = emptyLines.flatMap(l => lines[l] ?? [])
    const freeOnEmpty = free.filter(d => emptyDirections.includes(d)).length

    const ok =
      identityDimension === 3 &&
      swapDimension === 3 &&
      fullCount === 2 &&
      fullAndCharge === 2 &&
      pairResult.dimension === 1 &&
      respectsCharge(pairResult.form) &&
      blocks > 0 &&
      blocksChargeOnly === blocks &&
      period === PERIOD &&
      chargeZero &&
      emptyLines.length > 0 &&
      birthsAgreeing === PERIOD &&
      mirrorPhases.length > 0 &&
      free.length > 0 &&
      freeOnEmpty === free.length

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'exactly 2 of the 9! two-vibe maps respect SU(2), both charge preserving, the committed pair table and every interaction block of every beat respect exactly the charge U(1), the vacuum is a charge-neutral condensate of period 24 whose empty lines are the same at all 24 birth phases and which the reversal carries to itself, and every exactly free lone tone lies on an empty line',
      metrics: {
        permutationsRespectingSu2: fullCount,
        permutationsRespectingCharge: chargeCount,
        permutationsRespectingSomeU1: anyCount,
        pairTableRespectedDimension: pairResult.dimension,
        ruleBlocks: blocks,
        ruleBlocksRespectingOnlyCharge: blocksChargeOnly,
        vacuumPeriod: period,
        vacuumEmptyLines: emptyLines.length,
        vacuumEmptyLineFirst: emptyLines[0] ?? -1,
        vacuumEmptyLineSecond: emptyLines[1] ?? -1,
        birthPhasesWithSameEmptyLines: birthsAgreeing,
        vacuumReversalPhases: mirrorPhases.length,
        vacuumReversalPhase: mirrorPhases[0] ?? -1,
        busiestLineBeats: Math.max(...occupiedBeats),
        quietestOccupiedLineBeats: Math.min(
          ...occupiedBeats.filter(n => n > 0),
        ),
        emptyPlaneSelfDual: Number(
          Math.hypot(...planeSplit.selfDual).toFixed(6),
        ),
        emptyPlaneAntiSelfDual: Number(
          Math.hypot(...planeSplit.antiSelfDual).toFixed(6),
        ),
        freeDirections: free.length,
        freeDirectionsOnEmptyLines: freeOnEmpty,
        emptyLineDirections: emptyDirections.length,
        pinnedDirections: pinned.length,
      },
      control: {
        identityRespectedDimension: identityDimension,
        swapRespectedDimension: swapDimension,
        su2RespectingThatConserveCharge: fullAndCharge,
      },
      notes: `L2. Free directions ${free.join(', ')}; pinned (zero mean current over the period) ${pinned.join(', ')}; empty lines ${emptyLines.map(l => (lines[l] ?? []).join('-')).join(', ')}; beats each line is occupied in one period ${occupiedBeats.join(', ')}. Read against the Higgs pattern: the symmetry is broken, but EXPLICITLY, by the arrow (calm + calm -> love + fear is a charge-preserving map and not the identity or the swap, and those two are the only charge-preserving maps SU(2) allows), not by the vacuum. The condensate's shape is fixed by the rule: the two empty lines are the two lowest-indexed lines, which the sorted couple labels make the matter member of every couple they sit in, so they are never clocked, at every birth phase. The rule keeps no symmetry for a vacuum to break except its reversal (E-FRC-0142), and the condensate respects that. Masslessness needs an empty line (every free direction is on one) but is not given by it: the trailing ends of the same two lines are swapped into the busy wires and dressed. The empty plane is a simple two-form with equal self-dual and anti-self-dual halves, so the condensate itself is not chiral, while the response of E-FRC-0142 is. No doublet, no massive vector boson and no Yukawa coupling are measured here, and the rule's per-species masses (E-FND-0120) are dressing, not a coupling times a vacuum value.`,
    })
  },
})
