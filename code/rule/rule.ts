// A rule maps the current configuration to the next, reading only a bounded
// neighborhood per element. Some rules also rewrite the substrate.
//
// A rule reads nothing but the substrate, the configuration and the beat. Until 2026-09-25 the step
// input also carried a seeded generator, which the asynchronous rule's random order and the gauge
// rule's Metropolis sweep read while stepping. That is gone: a rule that needs a schedule derives it
// from the beat through code/tool/weyl, so the same state at the same beat always steps the same way.

import { Substrate } from '@/code/tool/substrate'
import { Configuration } from '@/code/tone/configuration'

export type RuleStepInput = {
  substrate: Substrate
  configuration: Configuration
  beat: number
}

export type RuleStepOutput = {
  configuration: Configuration
  substrate?: Substrate
}

export type Rule = {
  readonly form: 'rule'
  readonly name: string
  readonly scheme:
    | 'synchronous'
    | 'asynchronous'
    | 'reversible-even-odd'
  step(input: RuleStepInput): RuleStepOutput
}

// A local tone map: given a cell's own value and its neighbors' values, return
// the next value. The building block of the concrete rule schemes.
export type LocalMap = (input: {
  self: number
  neighborhood: readonly number[]
}) => number

// Run a rule for a number of beats, returning the final configuration and
// substrate (the substrate may evolve under a rewriting rule).
export function runRule(input: {
  rule: Rule
  substrate: Substrate
  configuration: Configuration
  beats: number
}): { configuration: Configuration; substrate: Substrate } {
  let configuration = input.configuration
  let substrate = input.substrate

  for (let beat = 0; beat < input.beats; beat++) {
    const out = input.rule.step({
      substrate,
      configuration,
      beat,
    })

    configuration = out.configuration

    if (out.substrate) {
      substrate = out.substrate
    }
  }

  return { configuration, substrate }
}
