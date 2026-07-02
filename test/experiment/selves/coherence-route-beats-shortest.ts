// The good path is the one that keeps you whole, and the shortest path is not it.
// A self must cross the world to a goal region, and the middle of the world holds a
// standing decoherence hazard (a clamped minus strip that annihilates any plus
// charge walking into it) with one open corridor around it. Two guidance fields
// steer the same self with the same dynamics:
//   - the shortest field: distance-to-goal on the bare geometry, which routes
//     straight through the hazard because pure distance cannot see it,
//   - the coherence field: distance-to-goal with the hazard cells sensed as walls
//     (they are locally detectable, a standing minus region), which routes through
//     the corridor.
// The outcome is read from the dynamics, not the route: the surviving plus charge
// and the charge delivered to the goal region. The shortest route loses most of the
// body to the hazard, the coherence route delivers. The no-hazard control shows the
// two fields tie when the world is benign, so the coherence route's win is a
// property of the hazardous world, not of the field construction.
//
// This is the suite's formalization of the good-path claim: the route that
// preserves coherence is findable from the locally sensed signal, and the
// geometry-only plan walks the body into the hazard. The steering pump and the
// clamped hazard are declared model-layer ingredients (this is the selves layer,
// not base emergence).
//
// Grade L2: a controlled causal comparison at the model layer, the survival
// difference is measured from the dynamics, with the benign world as the control
// that could have said no.

import { flatGraph } from '@/code/model/self-kit'
import { plusCount } from '@/code/coarse/two-self'
import { edgesFromCsr, csrMultiSourceDistance } from '@/code/tool/graph'
import { conservingEdgeSweepSteered } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const L = 48
const BEATS = 260
const SEED = 7

// the standing hazard strip: columns 22..25, rows 8..47, with the corridor rows 0..7 open
function hazardCells(): number[] {
  const cells: number[] = []

  for (let y = 8; y < L; y++) {
    for (let x = 22; x <= 25; x++) {
      cells.push(y * L + x)
    }
  }

  return cells
}

// the body: a solid plus disk on the west side, mid-height
function stampBody(tone: Int8Array): void {
  const cx = 8
  const cy = 28

  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (dx * dx + dy * dy <= 18) {
        tone[(cy + dy) * L + (cx + dx)] = 1
      }
    }
  }
}

function goalCells(): number[] {
  const cells: number[] = []

  for (let y = 0; y < L; y++) {
    cells.push(y * L + (L - 2))
  }

  return cells
}

function runRoute(input: { aware: boolean; withHazard: boolean }): {
  survived: number
  delivered: number
} {
  const graph = flatGraph(L)
  const { eu, ev } = edgesFromCsr(
    graph.offsets,
    graph.adj,
    graph.cellCount,
  )

  const moved = new Uint8Array(graph.cellCount)
  const hazard = input.withHazard ? hazardCells() : []
  const blocked = new Uint8Array(graph.cellCount)

  // the sensed hazard includes a two-cell safety margin: a decohering region eats
  // whatever touches it, so a locally informed route keeps its distance, while the
  // geometry-only field knows nothing of the hazard at all
  for (const c of hazard) {
    const x = c % L
    const y = Math.floor(c / L)

    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx
        const ny = y + dy

        if (nx >= 0 && nx < L && ny >= 0 && ny < L) {
          blocked[ny * L + nx] = 1
        }
      }
    }
  }

  const goal = goalCells()
  const distGoal = csrMultiSourceDistance({
    offsets: graph.offsets,
    adj: graph.adj,
    size: graph.cellCount,
    sources: goal,
    blocked: input.aware ? blocked : undefined,
  })

  const tone = new Int8Array(graph.cellCount)
  stampBody(tone)

  const bodySize = plusCount(tone)
  const rng = makeRng({ seed: SEED })

  for (let b = 0; b < BEATS; b++) {
    // the standing hazard is re-clamped every beat, a fixed decohering region
    for (const c of hazard) {
      tone[c] = -1
    }

    conservingEdgeSweepSteered({
      tone,
      eu,
      ev,
      moved,
      rng,
      distGoal,
      towardSign: -1,
    })

    // the hazard is STATIC: the sweep lets minus charge hop, so any minus that
    // walked out of the strip this beat is removed before the next clamp. The
    // strip is a standing absorbing region (a declared open-system sink) that
    // eats exactly the plus charge that touches it, never a roaming eater.
    for (let c = 0; c < tone.length; c++) {
      if (tone[c] === -1) {
        tone[c] = 0
      }
    }
  }

  const survived = plusCount(tone) / bodySize

  // charge delivered near the goal region (within 4 cells of the goal column)
  let near = 0

  for (let c = 0; c < tone.length; c++) {
    if (tone[c] === 1 && (distGoal[c] ?? 1e9) <= 4) {
      near++
    }
  }

  const delivered = near / bodySize

  return { survived, delivered }
}

export default experiment({
  id: 'selves/coherence-route-beats-shortest',
  code: 'E-SLF-0156',
  title:
    'the coherence-preserving route beats the shortest route: steered through a hazardous world by pure distance the self walks into the standing decoherence strip and loses most of its body, steered by the locally sensed hazard-aware field it detours through the corridor and delivers its charge whole, while in the benign control world the two routes tie, so the good path is findable from the local signal and invisible to geometry-only planning',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const shortestHazard = runRoute({ aware: false, withHazard: true })
    const coherentHazard = runRoute({ aware: true, withHazard: true })
    const shortestBenign = runRoute({ aware: false, withHazard: false })
    const coherentBenign = runRoute({ aware: true, withHazard: false })

    // 1. in the hazardous world the shortest route loses most of the body
    const shortestLoses = shortestHazard.survived < 0.5

    // 2. the coherence route keeps the body nearly whole and delivers more
    const coherentKeeps = coherentHazard.survived > 0.8
    const coherentDelivers =
      coherentHazard.delivered >
      2 * Math.max(shortestHazard.delivered, 0.05)

    // 3. the control: in the benign world the two routes tie in survival
    const benignTies =
      Math.abs(shortestBenign.survived - coherentBenign.survived) < 0.05

    const solved =
      shortestLoses && coherentKeeps && coherentDelivers && benignTies

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'with the standing decoherence strip in the world the distance-only steering walks the self into the hazard and less than half the body survives, while the hazard-aware steering (the same dynamics, the field built with the locally sensed hazard as walls) routes through the corridor, keeps over eighty percent of the body, and delivers at least twice the charge to the goal region, and in the benign no-hazard control world the two steerings tie in survival, so the coherence-preserving path is real, reachable from local sensing, and strictly better than the geometric plan exactly when the world is hazardous',
      metrics: {
        shortestSurvivedHazard: Number(
          shortestHazard.survived.toFixed(3),
        ),
        coherentSurvivedHazard: Number(
          coherentHazard.survived.toFixed(3),
        ),
        shortestDeliveredHazard: Number(
          shortestHazard.delivered.toFixed(3),
        ),
        coherentDeliveredHazard: Number(
          coherentHazard.delivered.toFixed(3),
        ),
        shortestSurvivedBenign: Number(
          shortestBenign.survived.toFixed(3),
        ),
        coherentSurvivedBenign: Number(
          coherentBenign.survived.toFixed(3),
        ),
      },
      control: {
        // the benign world is the control: with no hazard the two fields give the
        // same survival, so the coherent route's win in the hazardous world is
        // caused by the hazard interaction, not by the field construction
        shortestSurvivedBenign: Number(
          shortestBenign.survived.toFixed(3),
        ),
        coherentSurvivedBenign: Number(
          coherentBenign.survived.toFixed(3),
        ),
      },
      notes:
        'L2 at the declared model layer: the steering pump (conservingEdgeSweepSteered) and the clamped hazard strip are added ingredients, stated plainly, this is the selves layer, not base emergence (E-SLF-0154 shows the bare rule does not navigate at all). The survival and delivery numbers are read from the dynamics, the routes are not asserted. The hazard-aware field treats the standing minus strip as walls, which is locally sensible information (a decohering region is detectable by contact), while the distance-only field is the geometry-only plan. Deterministic seeded sweep, same seed for all four runs.',
    })
  },
})
