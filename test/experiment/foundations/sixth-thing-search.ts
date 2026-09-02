// The sixth-thing search: the rule space brute-forced, and what exists in it. Everything here is
// CANDIDATE dynamics under test, never the committed base; adopting any of it is a base-model decision
// recorded separately. The specification being hunted (from the Madelung gap and the failed minimal
// coupling): a reversible conserving collision whose vacuum keeps a cancelling clock while a lone
// matter defect MOVES with its coarse magnitude preserved.
//
// The search family (task/rule-search.ts, the staged harness): the twelve lines of a cell split into
// six matter lines and six clock wires; the wire always runs the committed charge table; the matter
// line applies one of the 24 conserving pair tables chosen by the wire's state class. 13824 rules in
// the full space, and the harness's full run reports: 8704 with a closing, cancelling vacuum cycle,
// 2804 compact movers, and a hard ceiling, the best rules reach EXACT magnitude preservation with two
// phases and a maximum travel distance of 2 at the survey size, and NOT ONE is ballistic. This
// experiment re-verifies a documented slice of that space (the identity-on-empty subfamily) and then
// measures the two designed candidates the family and its boundary suggested:
//
//   - THE WANDERER (matter: swap on empty wire, charge-then-swap on marked, identity on anti): a lone
//     defect keeps magnitude sqrt 3 EXACTLY at every one of 24 beats while wandering out to distance 3
//     and back with two clock phases, the family's ceiling made concrete.
//   - THE PARK RULE (outside the family: the matter and wire LINES swap whenever exactly one holds a
//     lone tone and the other is the marked pair, a symmetric self-inverse condition, then the wire
//     clock runs): a lone tone travels BALLISTICALLY, distance 7 by beat 6 at side 9, with the
//     difference recohering to exactly sqrt 3 at two of every three beats and charge conserved. The
//     first ballistic magnitude-recohering excitation in the program.
//
// So transport without amplification exists (bounded in the family, ballistic just outside it), and
// what no rule tried supplies yet is the phase ROTATION along the path. Depth L2: exhaustive search
// plus designed candidates, all measured exactly, the committed charge rule (pinned defect) as the
// control throughout.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will, charge } from '@/code/tone/will'
import { Collision, PAIR_FORWARD, pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'
import {
  ATOMS,
  candidateCollision,
  scoreRule,
  stage1,
} from '@/task/rule-search'

const ROOT3 = Math.sqrt(3)
const EXACT = 1e-9

const pairKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

// the couples of a mesh: (matter line, clock wire) pairs, the search family's split
function couplesOf(mesh: ReturnType<typeof d4Mesh>): [[number, number], [number, number]][] {
  const opposite = meshOpposites(mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < mesh.degree; d++) {
    const o = opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const couples: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {
    couples.push([lines[k]!, lines[k + 1]!])
  }

  return couples
}

// the park rule: swap the whole matter and wire lines when exactly one is a lone tone and the other
// the marked pair (a symmetric condition, so the swap is an involution), then run the wire clock
function parkRule(mesh: ReturnType<typeof d4Mesh>): Collision {
  const couples = couplesOf(mesh)
  const lone = (a: number, b: number): boolean => (a === 0) !== (b === 0)
  const marked = (a: number, b: number): boolean => a === 1 && b === -1

  return (slots, base) => {
    for (const [line, wire] of couples) {
      const a0 = slots[base + line[0]]!
      const a1 = slots[base + line[1]]!
      const w0 = slots[base + wire[0]]!
      const w1 = slots[base + wire[1]]!

      if (
        (lone(a0, a1) && marked(w0, w1)) ||
        (lone(w0, w1) && marked(a0, a1))
      ) {
        slots[base + line[0]] = w0
        slots[base + line[1]] = w1
        slots[base + wire[0]] = a0
        slots[base + wire[1]] = a1
      }

      const wa = slots[base + wire[0]]!
      const wb = slots[base + wire[1]]!
      const image = PAIR_FORWARD[pairKey(wa, wb)]!

      slots[base + wire[0]] = image[0]
      slots[base + wire[1]] = image[1]
    }
  }
}

// trace a lone matter defect: per-beat magnitude, phase, support size and reach
function trace(input: {
  mesh: ReturnType<typeof d4Mesh>
  rule: Collision
  beats: number
}): { magnitudes: number[]; phases: number[]; reaches: number[]; supports: number[]; charge: number } {
  const { mesh, rule, beats } = input
  const centre = Math.floor(mesh.cellCount / 2)
  const distance = shellDistances(mesh, centre)
  const matterSlot = couplesOf(mesh)[0]![0][0]

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  seeded.data[centre * mesh.degree + matterSlot] = 1

  const magnitudes: number[] = []
  const phases: number[] = []
  const reaches: number[] = []
  const supports: number[] = []

  for (let t = 0; t < beats; t++) {
    vacuum = beat(vacuum, rule)
    seeded = beat(seeded, rule)

    const cells = new Set<number>()

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        cells.add(Math.floor(i / mesh.degree))
      }
    }

    const difference = pairSub(
      clockAmplitude(seeded),
      clockAmplitude(vacuum),
    )
    const magnitude = Math.sqrt(pairAbs2(difference))

    magnitudes.push(magnitude)

    if (magnitude > EXACT) {
      phases.push(phaseDegrees(difference))
    }

    reaches.push(Math.max(0, ...[...cells].map(c => distance[c] ?? 0)))
    supports.push(cells.size)
  }

  return { magnitudes, phases, reaches, supports, charge: charge(seeded) }
}

export default experiment({
  id: 'foundations/sixth-thing-search',
  code: 'E-FND-0093',
  title:
    'the sixth-thing rule search: in the 13824-rule wire-conditioned family the harness finds 8704 clocked vacuums and 2804 compact movers with a hard ceiling (exact magnitude, distance 2, two phases, none ballistic, re-verified here on the identity-on-empty slice), the wanderer candidate holds exactly sqrt 3 for 24 beats while roaming to distance 3, and the park rule outside the family travels ballistically to distance 7 by beat 6 with the difference recohering to exactly sqrt 3 at two of every three beats, so transport without amplification exists and only the phase rotation along the path is still unsupplied, all as candidate dynamics against the committed rule whose defect never leaves its own line neighbourhood',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1. the documented slice of the family: c0 = identity on the empty wire class, 576 rules
    const n = ATOMS.length

    let sliceTotal = 0
    let sliceClocked = 0
    let sliceBallistic = 0
    let sliceBestDistance = 0
    let sliceExactMagnitude = 0

    for (let c1 = 0; c1 < n; c1++) {
      for (let c2 = 0; c2 < n; c2++) {
        const choice = [0, c1, c2, c2]

        sliceTotal++

        if (!stage1(choice)) {
          continue
        }

        sliceClocked++

        const score = scoreRule(5, 16, choice)

        if (!score.compact) {
          continue
        }

        if (score.ballistic) {
          sliceBallistic++
        }

        if (score.exactMagnitude && score.maxDistance >= 2) {
          sliceExactMagnitude++
        }

        sliceBestDistance = Math.max(sliceBestDistance, score.maxDistance)
      }
    }

    // 2. the wanderer at side 7 over 24 beats
    const wandererMesh = d4Mesh({ side: 7 })
    const wanderer = trace({
      mesh: wandererMesh,
      rule: candidateCollision(wandererMesh, [1, 8, 0, 0]),
      beats: 24,
    })

    const wandererExact = wanderer.magnitudes.every(
      m => Math.abs(m - ROOT3) < EXACT,
    )
    const wandererRoams =
      Math.max(...wanderer.reaches) >= 3 &&
      new Set(wanderer.phases).size >= 2 &&
      wanderer.supports.every(s => s <= 2)

    // 3. the park rule at side 9 over 18 beats
    const parkMesh = d4Mesh({ side: 9 })
    const park = trace({
      mesh: parkMesh,
      rule: parkRule(parkMesh),
      beats: 18,
    })

    const parkBallistic =
      park.reaches[6]! >= 7 && Math.max(...park.reaches) >= 7
    const recoherent = park.magnitudes.filter(
      m => Math.abs(m - ROOT3) < EXACT,
    ).length
    const parkRecoheres = recoherent >= 10 && park.charge === 1

    // CONTROL: the committed charge rule pins its defect to its cell pair
    const controlMesh = d4Mesh({ side: 7 })
    const control = trace({
      mesh: controlMesh,
      rule: pairCollision({ opposite: meshOpposites(controlMesh) }),
      beats: 12,
    })
    const controlPinned = Math.max(...control.reaches) <= 2

    const ok =
      sliceBallistic === 0 &&
      sliceBestDistance <= 2 &&
      sliceExactMagnitude > 0 &&
      wandererExact &&
      wandererRoams &&
      parkBallistic &&
      parkRecoheres &&
      controlPinned

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the identity-on-empty slice of the wire-conditioned family (576 rules) no rule is ballistic and the best compact mover reaches distance 2, with exact-magnitude movers existing; the wanderer candidate keeps its coarse magnitude at exactly sqrt 3 for all 24 beats while roaming to distance 3 on at most two cells with two clock phases; the park rule travels to distance 7 by beat 6 and its difference returns to exactly sqrt 3 at ten or more of eighteen beats with charge conserved; and the committed charge rule holds its defect within distance 2 throughout (the hop along its own line, as the no-amplitudes result recorded), so the family ceiling, the exact-magnitude wanderer, and the ballistic recoherer are all real and measured',
      metrics: {
        sliceTotal,
        sliceClocked,
        sliceBallistic,
        sliceBestDistance,
        sliceExactMagnitudeMovers: sliceExactMagnitude,
        wandererExactMagnitude: wandererExact ? 1 : 0,
        wandererMaxReach: Math.max(...wanderer.reaches),
        parkMaxReach: Math.max(...park.reaches),
        parkReachAtBeat6: park.reaches[6]!,
        parkRecoherentBeats: recoherent,
        parkCharge: park.charge,
      },
      // CONTROL: the committed rule's defect never travels
      control: {
        committedMaxReach: Math.max(...control.reaches),
        committedMagnitude: Number(control.magnitudes[0]!.toFixed(6)),
      },
      notes:
        'Roadmap: the sixth-thing search. All dynamics here are CANDIDATES, never the base: adopting any collision change is a base-model decision the discussion note records, and nothing in the committed rule set is altered by this experiment. The full 13824-rule search lives in task/rule-search.ts (the staged harness: vacuum algebra, then side-5 scoring) and its full-space output (8704 clocked, 2804 compact movers, zero ballistic, ceiling distance 2) is what the slice re-verifies in miniature. The park rule shows ballistic recohering transport exists with the EXISTING state and a changed collision only; no new fields, no second time slice, no delay registers were needed for transport, and the remaining unsupplied ingredient is the phase rotation along the path.',
    })
  },
})
