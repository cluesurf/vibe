// P140: the detour task, planning (lookahead) beats reactive (greedy) on a barrier. (verifying-planning-could-evolve.md.)
//
// NOT EMERGENT. This ADDS an explicit K-step lookahead/search algorithm, coded here by hand, which is NOT
// one of the five base things. So this is NOT an emergent test of the pure vibe substrate and does NOT show
// the substrate produces planning. It only tests the LOGIC of planning, that hand-coded lookahead beats
// greedy on a barrier. What is from the base, the value landscape IS the arrow (a value-direction toward a
// goal), and the greedy agent IS the gap-closing rule. What is ADDED is the lookahead itself, not derived
// from the mesh dynamics. So this shows IF the substrate had lookahead it could plan, it does not show the
// lookahead comes from the base. A from-the-base version (P142) must build the lookahead from the EMERGENT
// forward model (P118) and will (P113), adding nothing new. See computable-to-intentional.md and
// verifying-planning-could-evolve.md.
//
// A value landscape rises to a LOCAL peak, dips through a VALLEY, then rises to the GLOBAL peak at the
// goal. Greedy climbs to the local peak and STOPS. A planner whose lookahead spans the barrier sees the
// higher ground beyond and commits to the detour, reaching the goal. Run: npx tsx code/experiment/p140-detour-planning.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// value landscape over positions 0..L: rise to a local peak, dip through a valley (barrier), rise to the
// global peak at the goal. The goal (global max) is past the barrier.
function makeLandscape(L: number): {
  V: number[]
  start: number
  goal: number
  localPeak: number
  barrierWidth: number
} {
  const localPeak = Math.floor(L * 0.25)
  const valley = Math.floor(L * 0.5)
  const goal = L
  const V = new Array<number>(L + 1).fill(0)

  for (let p = 0; p <= L; p++) {
    if (p <= localPeak) V[p] = 0.6 * (p / localPeak)
    // rise to local peak 0.6
    else if (p <= valley)
      V[p] = 0.6 - 0.4 * ((p - localPeak) / (valley - localPeak))
    // dip to 0.2
    else V[p] = 0.2 + 0.8 * ((p - valley) / (goal - valley))
    // rise to global peak 1.0 at the goal
  }

  const start = Math.floor(L * 0.1)
  // the lookahead must see from the local peak to where the value RECOVERS above the local peak (past the
  // valley), that crossing distance is what the planner's horizon must span
  const localPeakV = V[localPeak]!

  let recover = goal

  for (let p = valley; p <= goal; p++) {
    if (V[p]! > localPeakV) {
      recover = p
      break
    }
  }

  const barrierWidth = recover - localPeak

  return { V, start, goal, localPeak, barrierWidth }
}

// an agent with lookahead horizon K. At each step it looks up to K positions in each direction and moves
// toward the direction with the higher BEST-reachable value within the horizon. K=1 is pure greedy.
function runAgent(
  V: number[],
  start: number,
  K: number,
): { finalPos: number; finalV: number; steps: number } {
  const L = V.length - 1

  let pos = start

  for (let step = 0; step < 4 * L; step++) {
    const horizonBest = (dir: number): number => {
      let best = -Infinity

      for (let k = 1; k <= K; k++) {
        const q = pos + dir * k

        if (q < 0 || q > L) break

        if (V[q]! > best) best = V[q]!
      }

      return best
    }

    const up = horizonBest(1)
    const down = horizonBest(-1)
    const here = V[pos]!

    // move toward the better horizon, only if it beats staying (otherwise stuck at a local optimum)
    if (up <= here && down <= here) break
    // stuck, no reachable improvement within the horizon

    pos += up >= down ? 1 : -1
  }

  return { finalPos: pos, finalV: V[pos]!, steps: 0 }
}

export function detourPlanning(input?: { L?: number }): {
  L: number
  goal: number
  barrierWidth: number
  greedyPos: number
  greedyReachedGoal: boolean
  plannerPos: number
  plannerReachedGoal: boolean
  thresholdK: number
  scan: { K: number; reachedGoal: boolean }[]
  plannerBeatsGreedy: boolean
  thresholdMatchesBarrier: boolean
  solved: boolean
} {
  const L = input?.L ?? 40
  const { V, start, goal, barrierWidth } = makeLandscape(L)

  const greedy = runAgent(V, start, 1)
  const greedyReachedGoal = greedy.finalPos >= goal - 1

  // scan lookahead horizon K, find the threshold where planning succeeds
  const scan: { K: number; reachedGoal: boolean }[] = []

  let thresholdK = -1

  for (let K = 1; K <= L; K++) {
    const r = runAgent(V, start, K)
    const reached = r.finalPos >= goal - 1

    scan.push({ K, reachedGoal: reached })

    if (reached && thresholdK < 0) thresholdK = K
  }

  const plannerK = Math.max(thresholdK, barrierWidth + 2)
  const planner = runAgent(V, start, plannerK)
  const plannerReachedGoal = planner.finalPos >= goal - 1

  const plannerBeatsGreedy = plannerReachedGoal && !greedyReachedGoal
  // the planner needs to see ACROSS the barrier, the threshold horizon should be about the barrier width
  const thresholdMatchesBarrier =
    thresholdK > 1 && Math.abs(thresholdK - barrierWidth) <= 3

  const solved = plannerBeatsGreedy && thresholdMatchesBarrier

  return {
    L,
    goal,
    barrierWidth,
    greedyPos: greedy.finalPos,
    greedyReachedGoal,
    plannerPos: planner.finalPos,
    plannerReachedGoal,
    thresholdK,
    scan,
    plannerBeatsGreedy,
    thresholdMatchesBarrier,
    solved,
  }
}

export default experiment({
  id: 'selves/detour-planning',
  code: 'E-SLF-0038',
  title:
    'lookahead beats greedy on a barrier when the horizon spans it',
  category: 'selves',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const r = detourPlanning({ L: 40 })
    const ok =
      r.solved && r.plannerBeatsGreedy && r.thresholdMatchesBarrier

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hand-coded lookahead planner crosses a barrier a greedy agent gets stuck at, and planning switches on exactly when the horizon spans the barrier',
      metrics: {
        greedyPos: r.greedyPos,
        plannerPos: r.plannerPos,
        goal: r.goal,
        thresholdK: r.thresholdK,
        barrierWidth: r.barrierWidth,
      },
      notes:
        'this adds an explicit hand-coded K-step lookahead, not one of the five base things, so it tests the logic of planning and not emergence from the substrate',
    })
  },
})
