// A lived trajectory: a deterministic self acting on a world over many beats, so the IMPACT of its steering can
// be measured as the gap between the life it steers and the same life with its steering cut.
//
// The world is a ring of ternary cells that, left alone, decays toward the vacuum (so doing nothing does NOT
// reach the goal). The goal is the all-plus pattern. A self acts each beat by repairing cells toward the goal
// (a competent, goal-directed policy). We can run the exact same start three ways:
//   - steered: the self's action is applied (it lives its choices).
//   - ablated: the self still computes its action but it is NOT applied (steering cut, the control for impact).
//   - rock: an agent that acts with the same effort but NOT goal-directedly (a fixed pattern), the control that
//     isolates goal-directed agency from mere activity.
// Everything is deterministic. The same inputs give the same trajectory, bit for bit. Robustness is by world
// SIZE, not by seeds. This is an L2 to L3 model of agency as counterfactual impact, not a base-emergence claim.

export type Tone = -1 | 0 | 1
export type Agent = 'self' | 'rock' | 'none'

// the goal the self steers toward: every cell at plus one
function distanceToGoal(env: Int8Array): number {
  let off = 0

  for (const cell of env) {
    if (cell !== 1) {
      off++
    }
  }

  return off / env.length
}

// the world's own dynamics: a gentle deterministic decay toward the vacuum. Each beat, one eighth of the cells
// (those whose shifted index hits the beat phase) relax one step toward zero. Left alone the world empties out,
// so reaching and HOLDING the goal requires steering, and a stronger effort holds more of it against the decay.
function worldStep(env: Int8Array, beat: number): void {
  for (let i = 0; i < env.length; i++) {
    if ((i + beat) % 8 === 0) {
      if (env[i]! > 0) {
        env[i] = (env[i]! - 1)
      } else if (env[i]! < 0) {
        env[i] = (env[i]! + 1)
      }
    }
  }
}

// the agent's action for this beat: which cells it writes and to what. Deterministic, no randomness.
// - self: scan from a moving offset and set the first `effort` non-goal cells toward the goal (competent repair).
// - rock: write `effort` cells with a fixed goal-agnostic pattern (helps half, hurts half, no net progress).
// - none: write nothing.
function act(
  env: Int8Array,
  beat: number,
  effort: number,
  agent: Agent,
): void {
  if (agent === 'none' || effort <= 0) {
    return
  }

  const m = env.length
  const offset = (beat * 13) % m

  let done = 0

  for (let s = 0; s < m && done < effort; s++) {
    const i = (offset + s) % m

    if (agent === 'self') {
      if (env[i] !== 1) {
        env[i] = 1
        done++
      }
    } else {
      // rock: a fixed pattern unrelated to the goal, only one third of its writes happen to land on the goal
      // value, the rest oppose it, so equal effort spent without goal-direction never reaches the goal
      env[i] = (i % 3 === 0 ? 1 : -1)
      done++
    }
  }
}

// a fixed, structured starting world (deterministic), the vacuum. Distance to the goal starts at one.
function initWorld(m: number): Int8Array {
  return new Int8Array(m)
}

// run one life: the world plus an agent, over `beats`, returning the distance-to-goal at each beat. With
// `steered` false the agent's action is withheld (it deliberates but does not act), the ablation control.
export function runTrajectory(input: {
  m: number
  beats: number
  effort: number
  agent: Agent
  steered: boolean
}): { distanceOverTime: number[]; finalDistance: number } {
  const env = initWorld(input.m)
  const distanceOverTime: number[] = []

  for (let beat = 0; beat < input.beats; beat++) {
    if (input.steered) {
      act(env, beat, input.effort, input.agent)
    }

    worldStep(env, beat)
    distanceOverTime.push(distanceToGoal(env))
  }

  return {
    distanceOverTime,
    finalDistance: distanceOverTime[distanceOverTime.length - 1] ?? 1,
  }
}

// a self made of several sub-policies (sub-selves), each writing toward its own target each beat on a shared
// world that decays. When the sub-targets agree (a coherent, integrated self) they reinforce and the world
// reaches the goal. When they disagree (a fragmented self) they overwrite each other and the world is torn.
// This is how integration becomes agency: a unified self steers, a divided one cancels itself out. Returns the
// final distance to the all-plus goal.
export function multiAgentTrajectory(input: {
  m: number
  beats: number
  effort: number
  targets: Int8Array[]
}): { finalDistance: number } {
  const env = initWorld(input.m)
  const k = input.targets.length
  const per = Math.max(1, Math.floor(input.effort / Math.max(1, k)))

  for (let beat = 0; beat < input.beats; beat++) {
    for (let j = 0; j < k; j++) {
      const target = input.targets[j]!
      const offset = (beat * 13 + j * 37) % input.m

      // each sub-policy spends its effort only where the world is not yet at its target (no wasted writes)
      let done = 0

      for (let s = 0; s < input.m && done < per; s++) {
        const i = (offset + s) % input.m

        if (env[i] !== target[i]) {
          env[i] = target[i]!
          done++
        }
      }
    }

    worldStep(env, beat)
  }

  return { finalDistance: distanceToGoal(env) }
}

// the impact of steering: how much closer to the goal the steered life ends than the same life unsteered. A
// positive number is real impact (the steering made a difference). Zero means the steering changed nothing.
export function steeringImpact(input: {
  m: number
  beats: number
  effort: number
  agent: Agent
}): {
  steeredFinal: number
  ablatedFinal: number
  impact: number
  gapOverTime: number[]
} {
  const steered = runTrajectory({ ...input, steered: true })
  const ablated = runTrajectory({ ...input, steered: false })
  const gapOverTime = steered.distanceOverTime.map(
    (d, i) => (ablated.distanceOverTime[i] ?? 1) - d,
  )

  return {
    steeredFinal: steered.finalDistance,
    ablatedFinal: ablated.finalDistance,
    impact: ablated.finalDistance - steered.finalDistance,
    gapOverTime,
  }
}
