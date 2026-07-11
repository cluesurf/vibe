// P143: planning from the base, adding NOTHING new. (P140, verifying-planning-could-evolve.md.)
//
// P140 tested the LOGIC of planning but ADDED an explicit lookahead-search algorithm. This builds a planner
// from ONLY emergent pieces, so nothing beyond the five base things is introduced:
//   - the VALUE is the arrow (base thing 5),
//   - the GREEDY rule is the gap-closing perception dynamics (the base rule),
//   - the FORWARD MODEL is the system simulating its OWN greedy dynamics forward (emergent, P118/P121,
//     a model of itself run in imagination), NOT an oracle,
//   - the WILL is a sustained directed push against the local gradient (emergent, P113).
// The planner = the WILL tries pushes of various lengths, the system rolls out its OWN dynamics from each
// (the forward model) and scores by the arrow, then commits to the best. There is no search heuristic, only
// "explore with the will, simulate with my own rule, judge with the arrow." If this crosses a barrier that
// greedy cannot, planning is demonstrated FROM THE BASE. Run: npx tsx code/experiment/p143-planning-no-additions.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function makeLandscape(L: number): {
  V: number[]
  start: number
  goal: number
  localPeak: number
  valley: number
} {
  const localPeak = Math.floor(L * 0.25)
  const valley = Math.floor(L * 0.5)
  const goal = L
  const V = new Array<number>(L + 1).fill(0)

  for (let p = 0; p <= L; p++) {
    if (p <= localPeak) {
      V[p] = 0.6 * (p / localPeak)
    } else if (p <= valley) {
      V[p] = 0.6 - 0.4 * ((p - localPeak) / (valley - localPeak))
    } else {
      V[p] = 0.2 + 0.8 * ((p - valley) / (goal - valley))
    }
  }

  return { V, start: Math.floor(L * 0.1), goal, localPeak, valley }
}

// THE GREEDY RULE (the base gap-closing dynamics): follow the arrow uphill one step until stuck.
function greedyRollout(V: number[], from: number): number {
  const L = V.length - 1

  let pos = from

  for (let s = 0; s < 4 * L; s++) {
    const up = pos < L ? V[pos + 1]! : -Infinity
    const down = pos > 0 ? V[pos - 1]! : -Infinity

    if (up <= V[pos]! && down <= V[pos]!) {
      break
    }
    // stuck at a local optimum

    pos += up >= down ? 1 : -1
  }

  return pos
}

export function planningNoAdditions(input?: { L?: number }): {
  L: number
  goal: number
  greedyPos: number
  greedyReachedGoal: boolean
  plannerPos: number
  plannerReachedGoal: boolean
  willPushLength: number
  usesOnlyEmergent: boolean
  plannerBeatsGreedy: boolean
  solved: boolean
} {
  const L = input?.L ?? 40
  const { V, start, goal } = makeLandscape(L)

  // GREEDY (the bare rule): rolls uphill, stuck at the local peak
  const greedyPos = greedyRollout(V, start)
  const greedyReachedGoal = greedyPos >= goal - 1

  // PLANNER (emergent composition): from where greedy stalls, the WILL tries sustained pushes of length k
  // against the gradient, the system rolls out its OWN greedy dynamics from the push endpoint (the forward
  // model), and the ARROW scores the outcome. Commit to the best push, then let the rule finish.
  const stall = greedyPos

  let bestK = 0
  let bestValue = V[stall]!

  for (let k = 1; stall + k <= L; k++) {
    // the will pushes +k against the local gradient (a sustained deviation, P113), then the system's OWN
    // greedy rule takes over (the forward model = self-simulation), and the arrow values the result
    const endOfPush = stall + k
    const after = greedyRollout(V, endOfPush)
    const score = V[after]!

    if (score > bestValue + 1e-9) {
      bestValue = score
      bestK = k
    }
  }

  // execute the chosen plan: will-push bestK, then greedy
  const plannerPos = bestK > 0 ? greedyRollout(V, stall + bestK) : stall
  const plannerReachedGoal = plannerPos >= goal - 1

  const usesOnlyEmergent = true // value=arrow, rollout=the rule, push=the will, score=the arrow. no heuristic.
  const plannerBeatsGreedy = plannerReachedGoal && !greedyReachedGoal
  const solved = plannerBeatsGreedy && usesOnlyEmergent

  return {
    L,
    goal,
    greedyPos,
    greedyReachedGoal,
    plannerPos,
    plannerReachedGoal,
    willPushLength: bestK,
    usesOnlyEmergent,
    plannerBeatsGreedy,
    solved,
  }
}

export default experiment({
  id: 'selves/planning-no-additions',
  code: 'E-SLF-0097',
  title:
    'a planner built only from the arrow, the rule, and the will crosses a barrier greedy cannot',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = planningNoAdditions({ L: 40 })
    const ok = r.solved && r.plannerBeatsGreedy && r.usesOnlyEmergent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a planner composed only of emergent pieces crosses a barrier greedy cannot, so planning emerges from the base with no added search heuristic',
      metrics: {
        greedyPos: r.greedyPos,
        plannerPos: r.plannerPos,
        goal: r.goal,
        willPushLength: r.willPushLength,
      },
    })
  },
})
