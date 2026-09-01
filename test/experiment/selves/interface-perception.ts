// Hoffman's interface theory of perception, made measurable: a perception tuned to fitness
// carries more of what matters (information about survival) than a perception tuned to truth
// (the world state), for the same bandwidth, when fitness is not a monotonic function of the
// world. Hoffman argues perception evolved to guide fit action, not to report the truth, and
// that a fitness-tuned interface out-competes a veridical one. This is the decisive form of
// Hoffman's fork for a substrate-first theory: a vibe self perceives to persist, its fitness is
// its survival, and its perception should track that, not the true substrate state.
//
// A limited-bandwidth perceiver bins a hundred world states into four perceptual categories. A
// TRUTH perceiver bins by the world-state magnitude (evenly), a FITNESS perceiver bins by the
// fitness level. The information each perception carries about fitness is the mutual information
// between its category and the fitness level.
//
// Measured on a non-monotonic fitness landscape (two peaks, so high and low world states can share
// a fitness): the fitness-tuned perception carries almost two bits about fitness, the truth-tuned
// under half a bit, an advantage of about one and a half bits. The fitness interface wins.
//
// The control is a MONOTONIC fitness landscape, where fitness rises with the world state so truth
// and fitness are aligned. There the two perceptions carry the same information about fitness (two
// bits each), no advantage. So the interface advantage is specifically the payoff of fitness being
// non-monotonic in the world, exactly Hoffman's claim, and it disappears when truth happens to
// equal fitness.
//
// Depth L2. It measures the interface advantage as mutual information on two fitness landscapes, a
// model of Hoffman's interface theory read against vibe's persist-not-report-the-truth self. A
// model-level result about perception, not a claim about the felt inside.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const WORLD_STATES = 100
const CATEGORIES = 4

// two-peak (non-monotonic) fitness: high and low world states can share fitness
function nonMonotonicFitness(state: number): number {
  return (
    Math.exp(-((state - 30) ** 2) / 200) +
    Math.exp(-((state - 70) ** 2) / 200)
  )
}

// monotonic fitness (the control): fitness rises with the world state
function monotonicFitness(state: number): number {
  return state / WORLD_STATES
}

// discretize a fitness function into CATEGORIES levels
function fitnessLevel(
  fitness: (state: number) => number,
): (state: number) => number {
  let maximum = 0

  for (let s = 0; s < WORLD_STATES; s++) {
    maximum = Math.max(maximum, fitness(s))
  }

  return (state: number) =>
    Math.min(
      CATEGORIES - 1,
      Math.floor((fitness(state) * CATEGORIES) / (maximum * 1.0001)),
    )
}

// the mutual information (bits) between a perceptual category and the fitness level, uniform prior
function mutualInformation(
  category: (state: number) => number,
  level: (state: number) => number,
): number {
  const joint = new Map<string, number>()
  const marginalCategory = new Map<number, number>()
  const marginalLevel = new Map<number, number>()

  for (let s = 0; s < WORLD_STATES; s++) {
    const c = category(s)
    const f = level(s)

    joint.set(
      `${c},${f}`,
      (joint.get(`${c},${f}`) ?? 0) + 1 / WORLD_STATES,
    )

    marginalCategory.set(
      c,
      (marginalCategory.get(c) ?? 0) + 1 / WORLD_STATES,
    )
    marginalLevel.set(f, (marginalLevel.get(f) ?? 0) + 1 / WORLD_STATES)
  }

  let information = 0

  for (const [key, probability] of joint) {
    const [c, f] = key.split(',').map(Number) as [number, number]

    information +=
      probability *
      Math.log2(
        probability /
          (marginalCategory.get(c)! * marginalLevel.get(f)!),
      )
  }

  return information
}

// the interface advantage on a landscape: fitness-tuned info minus truth-tuned info
function interfaceAdvantage(fitness: (state: number) => number): {
  truthInfo: number
  fitnessInfo: number
  advantage: number
} {
  const level = fitnessLevel(fitness)
  const truthCategory = (state: number) =>
    Math.floor((state * CATEGORIES) / WORLD_STATES)

  const fitnessCategory = (state: number) => level(state)
  const truthInfo = mutualInformation(truthCategory, level)
  const fitnessInfo = mutualInformation(fitnessCategory, level)

  return { truthInfo, fitnessInfo, advantage: fitnessInfo - truthInfo }
}

export default experiment({
  id: 'selves/interface-perception',
  code: 'E-SLF-0168',
  title:
    'a fitness-tuned perception carries more information about fitness than a truth-tuned one when fitness is non-monotonic, Hoffman interface theory measured',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const nonMonotonic = interfaceAdvantage(nonMonotonicFitness)
    const monotonic = interfaceAdvantage(monotonicFitness)

    const interfaceWins = nonMonotonic.advantage > 0.5
    const controlNoAdvantage = Math.abs(monotonic.advantage) < 0.01
    const ok = interfaceWins && controlNoAdvantage

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on a non-monotonic fitness landscape a fitness-tuned perception carries about one and a half more bits about fitness than a truth-tuned perception of the same bandwidth (about two bits versus under half a bit), so the fitness interface beats the veridical one, while on a monotonic landscape (truth aligned with fitness) the two carry the same information and there is no advantage, exactly Hoffman interface theory',
      metrics: {
        nonMonotonicTruthInfo: Number(
          nonMonotonic.truthInfo.toFixed(3),
        ),
        nonMonotonicFitnessInfo: Number(
          nonMonotonic.fitnessInfo.toFixed(3),
        ),
        nonMonotonicAdvantage: Number(
          nonMonotonic.advantage.toFixed(3),
        ),
        monotonicAdvantage: Number(monotonic.advantage.toFixed(3)),
      },
      // CONTROL: monotonic fitness (truth equals fitness) gives no interface advantage.
      control: {
        monotonicAdvantage: Number(monotonic.advantage.toFixed(3)),
      },
      notes:
        'Hoffman interface theory of perception, a model-level result. A vibe self perceives to persist, so its perception tracks fitness, not the true substrate state. The advantage is specifically the payoff of non-monotonic fitness. Grounds Hoffman fitness-beats-truth on the persist-not-report self.',
    })
  },
})
