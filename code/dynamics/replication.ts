// Deterministic self-replication: a constructor that copies a template pattern, the basis of heredity. Each
// generation, every existing copy is read and an identical copy is written, so the population of copies grows
// while every copy stays bit-identical to the template (faithful inheritance). A lossy constructor (one that
// flips a site as it copies) breaks the identity, so fidelity is the special property that makes heredity work.
// No randomness: the template is fixed and the lossy error is a deterministic site flip. Reused by the
// replication experiment, kept here so the experiment stays thin.

// the fraction of `copy` sites that match the template (1 means a faithful copy)
function identityTo(template: Int8Array, copy: Int8Array): number {
  let same = 0

  for (let i = 0; i < template.length; i++) {
    if (template[i] === copy[i]) {
      same++
    }
  }

  return same / template.length
}

export function replicate(input: {
  template: Int8Array
  generations: number
  faithful: boolean
}): { copies: number; meanIdentity: number; allIdentical: boolean } {
  let population: Int8Array[] = [Int8Array.from(input.template)]

  for (let g = 0; g < input.generations; g++) {
    const offspring: Int8Array[] = []

    for (const parent of population) {
      const child = Int8Array.from(parent)

      if (!input.faithful) {
        // a deterministic copy error: flip one site, chosen by the child's length and generation
        const site = (g * 7 + 3) % child.length
        child[site] = -child[site]! as -1 | 0 | 1
      }

      offspring.push(child)
    }

    population = [...population, ...offspring]
  }

  const identities = population.map(c => identityTo(input.template, c))
  const meanIdentity =
    identities.reduce((s, v) => s + v, 0) / identities.length

  return {
    copies: population.length,
    meanIdentity,
    allIdentical: identities.every(v => v === 1),
  }
}
