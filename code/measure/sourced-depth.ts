// The bounded depth field's beat with its source given directly (E-GRV-0153). code/rule/step-depth's stepBeat reads its
// source only as the divergence of the lines, rho = div f, and on a closed box every line field has total divergence 0
// (each link adds +1 at its tail and -1 at its head), so the lines cannot hold a uniform source at all. To ask what a
// uniform source would do to the depth, this beat takes the source per dock in register units (rhoUnits = Q^L times the
// content) in place of Q^L div f, and is otherwise stepBeat line for line: the same integer division with its carried
// rest, the same wrap of rate and step into the window. With rhoUnits = Q^L div f it is stepBeat bit for bit (gated in
// the experiment). A MEASUREMENT HELPER: it is not a rule of the model, and stepBeat is unchanged.
//
// DETERMINISM: integers held in doubles below 2^53; nothing is drawn.

import { radionWeight, type RadionMesh } from '@/code/rule/trit-radion'
import {
  divergence,
  type StepRule,
  type StepScratch,
  type StepState,
  type StepTally,
} from '@/code/rule/step-depth'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

// the value v wrapped into the rule's window
export const wrapWindow = (rule: StepRule, v: number): number =>
  mod(v + rule.top, rule.span) - rule.top

// one beat of the step rule with the source given per dock in register units, in place
export function sourcedBeat(
  mesh: RadionMesh,
  rule: StepRule,
  s: StepState,
  rhoUnits: ArrayLike<number>,
  scratch: StepScratch,
  tally?: StepTally,
): void {
  const { a, q, h } = rule

  divergence(mesh, s.step, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (rhoUnits[y]! - scratch.divStep[y]!)
    const w = floorDiv(x + s.rest[y]! + h, q)
    const raw = s.rate[y]! + w

    s.rest[y] = x + s.rest[y]! - q * w
    s.rate[y] = wrapWindow(rule, raw)

    if (tally && s.rate[y] !== raw) {
      tally.vWraps++
    }
  }

  for (let y = 0; y < mesh.docks; y++) {
    const vy = s.rate[y]!

    for (let k = 0; k < 9; k++) {
      const l = y * 9 + k
      const raw =
        s.step[l]! +
        radionWeight(k) * (vy - s.rate[mesh.neighbour[l]!]!)

      s.step[l] = wrapWindow(rule, raw)

      if (tally && s.step[l] !== raw) {
        tally.fWraps++
      }
    }
  }
}
