// P153: the integrated metacognitive agent. (P143, P118, P121, P113, open question 5.)
//
// P143 showed planning emerges from the base (will + own-rule rollout + arrow) but as a ONE-SHOT plan
// across a single barrier. A full agent runs the closed loop, PERCEIVE the gap, PLAN (simulate forward
// with the forward model), ACT (the will), then REPEAT, re-planning whenever it stalls. We give it a task
// that needs SUSTAINED metacognition, a goal beyond a SEQUENCE of barriers. A reactive agent stalls at the
// first barrier, a one-shot planner crosses one and stalls at the next, and only the INTEGRATED
// re-planning loop reaches the distant goal. Every piece is emergent (arrow value, rule rollout, will), so
// the agent is the base running end-to-end. Run: npx tsx code/experiment/p153-integrated-agent.ts

import { pathToFileURL } from 'node:url'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a landscape that rises overall toward the goal but has B downward DIPS (barriers), each making a local
// peak just before it where a greedy climber stalls
function multiBarrier(L: number, B: number): { V: number[]; start: number; goal: number } {
  const V = new Array<number>(L + 1).fill(0)
  const amp = 0.25
  const width = L / (B * 4)
  const dips: number[] = []
  for (let k = 1; k <= B; k++) dips.push((k * L) / (B + 1))
  for (let p = 0; p <= L; p++) {
    let v = p / L // overall rising trend, global max at the goal (p=L)
    for (const d of dips) v -= amp * Math.exp(-(((p - d) / width) ** 2))
    V[p] = v
  }
  return { V, start: 2, goal: L }
}

// the bare greedy rule, climb uphill one step until stuck at a local optimum
function greedyRollout(V: number[], from: number): number {
  const L = V.length - 1
  let pos = from
  for (let s = 0; s < 4 * L; s++) {
    const up = pos < L ? V[pos + 1]! : -Infinity
    const down = pos > 0 ? V[pos - 1]! : -Infinity
    if (up <= V[pos]! && down <= V[pos]!) break
    pos += up >= down ? 1 : -1
  }
  return pos
}

// the emergent planner (P143), at a stall, the will tries a sustained push (up to a bounded lookahead
// HORIZON H, finite foresight), the own-rule rolls out, the arrow scores, commit to the push that lands
// highest. A bounded horizon can cross at most ONE barrier per plan, so a sequence of barriers REQUIRES
// re-planning. Returns the next stall position (or the same if no push within the horizon helps).
function planStep(V: number[], stall: number, horizon: number): number {
  const L = V.length - 1
  let bestEnd = stall
  let bestValue = V[stall]!
  for (let k = 1; k <= horizon && stall + k <= L; k++) {
    const after = greedyRollout(V, stall + k) // forward model = run my own rule from the push endpoint
    if (V[after]! > bestValue + 1e-9) {
      bestValue = V[after]!
      bestEnd = after
    }
  }
  return bestEnd
}

export function integratedAgent(input?: { L?: number; B?: number }): {
  L: number
  B: number
  goal: number
  reactivePos: number
  oneShotPos: number
  integratedPos: number
  reactiveReached: boolean
  oneShotReached: boolean
  integratedReached: boolean
  integratedReplans: number
  solved: boolean
} {
  const L = input?.L ?? 80
  const B = input?.B ?? 4
  const { V, start, goal } = multiBarrier(L, B)
  const horizon = Math.ceil(L / (B + 1)) + 6 // bounded foresight, enough to cross one barrier, not all

  // reactive, greedy only
  const reactivePos = greedyRollout(V, start)
  // one-shot, greedy then a single bounded plan, then greedy, then STOP (no re-plan)
  const oneShotPos = greedyRollout(V, planStep(V, reactivePos, horizon))
  // integrated, the closed loop, re-plan at every stall until the goal or no progress
  let pos = greedyRollout(V, start)
  let replans = 0
  for (let iter = 0; iter < 2 * B + 4; iter++) {
    if (pos >= goal - 1) break
    const planned = planStep(V, pos, horizon)
    if (planned <= pos) break // no push within the horizon helps, genuinely stuck
    pos = greedyRollout(V, planned)
    replans++
  }
  const integratedPos = pos

  const reactiveReached = reactivePos >= goal - 1
  const oneShotReached = oneShotPos >= goal - 1
  const integratedReached = integratedPos >= goal - 1
  // success, the integrated agent reaches the goal across all barriers, strictly beats both simpler agents
  // (which stall earlier), and took several re-plans (sustained metacognition, the closed loop)
  const solved = integratedReached && !reactiveReached && integratedPos > oneShotPos && replans >= B - 1

  return {
    L,
    B,
    goal,
    reactivePos,
    oneShotPos,
    integratedPos,
    reactiveReached,
    oneShotReached,
    integratedReached,
    integratedReplans: replans,
    solved,
  }
}

export function main(): void {
  const r = integratedAgent()
  console.log('P153: the integrated metacognitive agent (the closed perceive-plan-act loop)')
  console.log('')
  console.log(`  landscape length ${r.L}, ${r.B} barriers in sequence, goal at ${r.goal}`)
  console.log('')
  console.log(`  REACTIVE (greedy only): stalls at ${r.reactivePos}, reached goal: ${r.reactiveReached}`)
  console.log(`  ONE-SHOT planner (one detour): reaches ${r.oneShotPos}, reached goal: ${r.oneShotReached}`)
  console.log(`  INTEGRATED agent (re-plans at each stall, ${r.integratedReplans} times): reaches ${r.integratedPos}/${r.goal}, reached goal: ${r.integratedReached}`)
  console.log('')
  console.log('  => the integrated agent runs the closed loop (perceive gap, plan with the forward model,')
  console.log('     act with the will, repeat) and crosses a SEQUENCE of barriers, mind end-to-end from the base.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/p153-integrated-agent',
  title: 'the closed perceive-plan-act loop crosses a sequence of barriers, beating reactive and one-shot',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = integratedAgent({ L: 80, B: 4 })
    const ok =
      r.solved && r.integratedReached && !r.reactiveReached && r.integratedReplans >= r.B - 1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an agent of emergent pieces with bounded foresight re-plans at each stall and crosses a sequence of barriers to a distant goal that reactive and one-shot agents cannot',
      metrics: {
        integratedPos: r.integratedPos,
        goal: r.goal,
        integratedReplans: r.integratedReplans,
      },
      control: { reactivePos: r.reactivePos, oneShotPos: r.oneShotPos },
    })
  },
})
