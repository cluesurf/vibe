// P162: an integrated metacognitive agent, multi-step lookahead through its own forward model. (P143, P118, P157, open-question 5.)
//
// P143 showed planning-from-the-base crosses a single barrier (will + the rule as a one-step forward model
// + the arrow). The open piece is a SINGLE agent that chains MULTI-STEP lookahead through its own forward
// model on a real geometry, solving a task that needs genuine foresight, a DETOUR (a goal reachable only
// by first moving AWAY, around a wall). A purely reactive (greedy, depth-1) agent gets stuck at the wall.
// The integrated agent rolls out its forward model several steps, sees that the detour pays off, and
// reaches the goal. We show depth-K lookahead solves the detour while depth-1 (reactive) fails, end-to-end
// on the flat emergent layer (where directed action lives, P157). Run: npx tsx code/experiment/p162-integrated-agent.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a flat 2D grid with a WALL (a vertical barrier) that has a GAP near the top, the agent must DETOUR up
// and around to reach the goal on the far side.
function makeWorld(L: number): {
  blocked: Uint8Array
  start: number
  goal: number
} {
  const blocked = new Uint8Array(L * L)
  const wallX = Math.floor(L / 2)
  const gapY = L - 3 // the only opening, near the top

  for (let y = 0; y < L; y++) {
    if (y !== gapY && y !== gapY - 1) {
      blocked[y * L + wallX] = 1
    }
  }

  const start = Math.floor(L / 2) * L + 2 // left side, middle height
  const goal = Math.floor(L / 2) * L + (L - 3) // right side, middle height

  return { blocked, start, goal }
}

function dist(a: number, b: number, L: number): number {
  return (
    Math.abs((a % L) - (b % L)) +
    Math.abs(Math.floor(a / L) - Math.floor(b / L))
  )
}

function neighbors(
  p: number,
  L: number,
  blocked: Uint8Array,
): number[] {
  const x = p % L
  const y = Math.floor(p / L)
  const out: number[] = []

  if (x + 1 < L && !blocked[p + 1]) {
    out.push(p + 1)
  }

  if (x - 1 >= 0 && !blocked[p - 1]) {
    out.push(p - 1)
  }

  if (y + 1 < L && !blocked[p + L]) {
    out.push(p + L)
  }

  if (y - 1 >= 0 && !blocked[p - L]) {
    out.push(p - L)
  }

  return out
}

// the agent's FORWARD MODEL, simulate moving from p, exploring move-sequences of depth K, return the best
// (smallest final distance-to-goal) reachable endpoint and the first step toward it (the arrow scores the
// rollout, the will commits to the best first move). A bounded best-first lookahead.
function lookahead(
  p: number,
  goal: number,
  L: number,
  blocked: Uint8Array,
  depth: number,
): number {
  // BFS to `depth`, tracking for each frontier cell the FIRST move that led there, pick the first move
  // whose reachable set gets closest to the goal
  let bestScore = dist(p, goal, L)
  let bestFirst = p

  const seen = new Set<number>([p])

  let frontier: { cell: number; first: number }[] = neighbors(
    p,
    L,
    blocked,
  ).map(c => ({ cell: c, first: c }))

  for (const f of frontier) {
    seen.add(f.cell)
  }

  for (let d = 0; d < depth; d++) {
    for (const f of frontier) {
      const sc = dist(f.cell, goal, L)

      if (sc < bestScore) {
        bestScore = sc
        bestFirst = f.first
      }
    }

    const next: { cell: number; first: number }[] = []

    for (const f of frontier) {
      for (const c of neighbors(f.cell, L, blocked)) {
        if (!seen.has(c)) {
          seen.add(c)
          next.push({ cell: c, first: f.first })
        }
      }
    }

    frontier = next

    if (frontier.length === 0) {
      break
    }
  }

  return bestFirst
}

// run the agent, re-planning each step with the given lookahead depth (depth 1 = reactive/greedy)
function runAgent(
  L: number,
  depth: number,
  maxSteps: number,
): { reached: boolean; finalDist: number; steps: number } {
  const { blocked, start, goal } = makeWorld(L)

  let p = start
  let stuck = 0

  for (let t = 0; t < maxSteps; t++) {
    if (p === goal) {
      return { reached: true, finalDist: 0, steps: t }
    }

    const move = lookahead(p, goal, L, blocked, depth)

    if (move === p || dist(move, goal, L) >= dist(p, goal, L)) {
      // no improving first move found at this depth (greedy is stuck at the wall)
      stuck++

      if (stuck > 3 && depth <= 1) {
        break
      }

      if (move === p) {
        break
      }
    } else {
      stuck = 0
    }

    p = move
  }

  return {
    reached: p === goal,
    finalDist: dist(p, goal, L),
    steps: maxSteps,
  }
}

export function integratedAgent(input?: { L?: number }): {
  L: number
  reactiveDist: number
  reactiveReached: boolean
  plannerDist: number
  plannerReached: boolean
  depthNeeded: number
  multiStepSolves: boolean
  reactiveFails: boolean
  solved: boolean
} {
  const L = input?.L ?? 31
  const maxSteps = 6 * L
  const reactive = runAgent(L, 1, maxSteps) // depth-1 = greedy, gets stuck at the wall

  // find the smallest lookahead depth that reaches the goal (multi-step foresight)
  let depthNeeded = -1
  let planner = {
    reached: false,
    finalDist: dist(makeWorld(L).start, makeWorld(L).goal, L),
    steps: 0,
  }

  for (const depth of [2, 4, 8, 12, 18, 25]) {
    const r = runAgent(L, depth, maxSteps)

    if (r.reached) {
      depthNeeded = depth
      planner = r
      break
    }

    planner = r
  }

  const reactiveFails = !reactive.reached
  const multiStepSolves = planner.reached && depthNeeded >= 2
  const solved = multiStepSolves && reactiveFails

  return {
    L,
    reactiveDist: reactive.finalDist,
    reactiveReached: reactive.reached,
    plannerDist: planner.finalDist,
    plannerReached: planner.reached,
    depthNeeded,
    multiStepSolves,
    reactiveFails,
    solved,
  }
}

export default experiment({
  id: 'selves/p162-integrated-agent',
  code: 'E-SLF-0090',
  title:
    'multi-step lookahead through the forward model solves a detour the reactive agent cannot',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = integratedAgent({ L: 31 })
    const ok = r.solved && r.multiStepSolves && r.reactiveFails

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an agent chaining multi-step lookahead through its own forward model solves a detour where a reactive greedy agent gets stuck',
      metrics: { depthNeeded: r.depthNeeded },
      control: { reactiveDist: r.reactiveDist },
    })
  },
})
