// Deterministic evolution: variation plus persistence-selection, with no randomness. A population of variant
// patterns lives in a fixed environment. Fitness is resonance with the environment (the tone overlap), the
// model's persistence measure: a pattern aligned with its niche persists, a misaligned one does not. Each
// generation the fitter half survives and the rest are replaced by deterministic variants (structured site
// flips) of the survivors. Mean fitness rises toward the environment over generations (adaptation). Without
// selection (random-free replacement that ignores fitness) there is no rise, the control. Variation is a fixed
// function of the index, robustness comes from varying the size. Reused by the selection experiment, kept thin.

import { ternaryVector } from '@/code/model/deliberation'
import { toneOverlap } from '@/code/operator/hopfield'
import { makeRng } from '@/code/tool/rng'

// a deterministic variant of a parent: flip a fixed set of sites chosen by the parent index and generation
function variant(parent: Int8Array, tag: number): Int8Array {
  const child = Int8Array.from(parent)
  const n = child.length
  const flips = Math.max(1, Math.round(n * 0.05))

  for (let s = 0; s < flips; s++) {
    const i = (tag * 31 + s * 17) % n

    child[i] = -child[i]!
  }

  return child
}

export function evolvePopulation(input: {
  n: number
  populationSize: number
  generations: number
  select: boolean
}): { initialFitness: number; finalFitness: number } {
  const { n, populationSize, generations, select } = input

  // a fixed dense environment to adapt to, and a fixed initial population (deterministic seeds, varied by size)
  const environment = ternaryVector(
    n,
    makeRng({ seed: 70001 + n }),
  ).map(v => (v === 0 ? 1 : v))

  let population = Array.from({ length: populationSize }, (_, k) =>
    ternaryVector(n, makeRng({ seed: 80001 + k * 13 + n })).map(v =>
      v === 0 ? 1 : v,
    ),
  )

  const fitness = (p: Int8Array): number => toneOverlap(p, environment)
  const meanFitness = (pop: Int8Array[]): number =>
    pop.reduce((s, p) => s + fitness(p), 0) / pop.length

  const initialFitness = meanFitness(population)

  for (let g = 0; g < generations; g++) {
    if (select) {
      // rank by fitness, keep the top half, refill from variants of the survivors
      const ranked = [...population].sort(
        (a, b) => fitness(b) - fitness(a),
      )

      const keep = ranked.slice(
        0,
        Math.max(1, Math.floor(populationSize / 2)),
      )

      const offspring = keep.map((parent, k) =>
        variant(parent, g * 97 + k),
      )

      population = [...keep, ...offspring].slice(0, populationSize)
    } else {
      // the control: replace half without regard to fitness (variants of arbitrary members), so no adaptation
      const offspring = population
        .slice(0, Math.floor(populationSize / 2))
        .map((parent, k) => variant(parent, g * 97 + k))

      population = [
        ...population.slice(Math.floor(populationSize / 2)),
        ...offspring,
      ].slice(0, populationSize)
    }
  }

  return { initialFitness, finalFitness: meanFitness(population) }
}
