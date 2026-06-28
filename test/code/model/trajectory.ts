// Conformance for code/model/trajectory: agency as counterfactual impact, fully deterministic (no RNG).
// The world starts at the vacuum (distance-to-goal 1) and decays, so doing nothing never reaches the
// goal; a competent self repairs cells toward the all-plus goal. The exact, derivable facts: an inert
// agent leaves distance at 1; a full-effort self repair on m=8 in one beat reaches distance 0.125 (the
// lone cell the decay flips back); steering impact = ablated - steered; a goal-directed self beats a
// goal-agnostic rock; and a coherent multi-self reaches the goal better than a conflicting one.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  runTrajectory,
  steeringImpact,
  multiAgentTrajectory,
} from '@/code/model/trajectory'

const TOL = 1e-12

suite('model/trajectory: deterministic distances', [
  // An inert agent: the vacuum decays to the vacuum, distance stays 1 throughout.
  check('an idle world stays at the goal distance 1', () => {
    const r = runTrajectory({
      m: 8,
      beats: 4,
      effort: 4,
      agent: 'none',
      steered: true,
    })
    for (const d of r.distanceOverTime) {
      close(d, 1, TOL, 'nothing happens, distance stays maximal')
    }
    close(r.finalDistance, 1, TOL)
  }),
  // m=8, one beat, full effort: the self sets all 8 cells to +1, then the decay flips cell 0 back to 0,
  // leaving one off-goal cell -> distance 1/8.
  check('a full-effort self repair leaves only the decayed cell', () => {
    const r = runTrajectory({
      m: 8,
      beats: 1,
      effort: 8,
      agent: 'self',
      steered: true,
    })
    close(r.finalDistance, 1 / 8, TOL)
  }),
])

suite('model/trajectory: steering impact', [
  // m=8 one beat full effort: steered final 1/8, ablated (no action) final 1, impact = 1 - 1/8 = 7/8.
  check('impact is ablated-minus-steered, exactly', () => {
    const r = steeringImpact({ m: 8, beats: 1, effort: 8, agent: 'self' })
    close(r.steeredFinal, 1 / 8, TOL)
    close(r.ablatedFinal, 1, TOL)
    close(r.impact, 7 / 8, TOL)
  }),
  // A goal-directed self makes more counterfactual impact than a goal-agnostic rock of equal effort.
  check('a self steers more than a rock of equal effort', () => {
    const self = steeringImpact({ m: 64, beats: 30, effort: 16, agent: 'self' })
    const rock = steeringImpact({ m: 64, beats: 30, effort: 16, agent: 'rock' })
    ok(self.impact > rock.impact, 'goal-directed agency beats mere activity')
  }),
])

suite('model/trajectory: integration becomes agency', [
  // Coherent sub-targets (all the all-plus goal) reach the goal; conflicting ones (one inverted) tear
  // the world and end farther from it.
  check('a coherent multi-self beats a conflicting one', () => {
    const m = 64
    const allPlus = new Int8Array(m).fill(1)
    const allMinus = new Int8Array(m).fill(-1)
    const coherent = multiAgentTrajectory({
      m,
      beats: 30,
      effort: 16,
      targets: [allPlus, Int8Array.from(allPlus)],
    })
    const conflicting = multiAgentTrajectory({
      m,
      beats: 30,
      effort: 16,
      targets: [allPlus, allMinus],
    })
    ok(
      coherent.finalDistance < conflicting.finalDistance,
      'a unified self steers, a divided one cancels out',
    )
  }),
  check('the trajectory is deterministic', () => {
    const a = runTrajectory({ m: 16, beats: 10, effort: 4, agent: 'self', steered: true })
    const b = runTrajectory({ m: 16, beats: 10, effort: 4, agent: 'self', steered: true })
    close(a.finalDistance, b.finalDistance, 0)
  }),
])
