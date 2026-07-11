// Locality range (P1, operational form). Operationally measures how far the
// influence of a perturbation reaches in one step of the rule: perturb a node's
// tone, step the rule once on the perturbed and the baseline configuration, and
// see which nodes changed differently. The effective interaction radius is the
// graph distance to the farthest affected node.
//
// This is an operational locality proxy. The full Pauli-expansion locality
// profile of a Hamiltonian (testbed 04, localityProfile) is a future addition.

import { Rule } from '@/code/rule/rule'
import { Substrate } from '@/code/tool/substrate'
import {
  Configuration,
  cloneConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { valueCount } from '@/code/tone/alphabet'
import { Rng, makeRng } from '@/code/tool/rng'
import { graphDistance } from '@/code/measure/distance'

// Build a fresh deterministic Rng from a seed, so a baseline run and a perturbed
// run share an identical random stream and differ only by the perturbation.
function rngFromSeed(seed: number): Rng {
  return makeRng({ seed })
}

// Apply one rule step to a configuration, returning the next configuration.
function stepOnce(input: {
  rule: Rule
  substrate: Substrate
  configuration: Configuration
  rng: Rng
}): Configuration {
  const out = input.rule.step({
    substrate: input.substrate,
    configuration: input.configuration,
    beat: 0,
    rng: input.rng,
  })

  return out.configuration
}

// Estimate the effective interaction radius averaged over sampled perturbations.
// 1 means strictly nearest-neighbor influence. Returns 0 if no perturbation ever
// changed the outcome (an inert rule) or the substrate is empty.
export function ruleLocalityRange(input: {
  rule: Rule
  substrate: Substrate
  configuration: Configuration
  sampleSize: number
  rng: Rng
}): number {
  const size = input.substrate.size

  if (size === 0) {
    return 0
  }

  const distinct = valueCount(input.configuration.alphabet)
  const slots = input.configuration.slots

  const radii: number[] = []
  const sampleCount = Math.min(input.sampleSize, size)

  for (let s = 0; s < sampleCount; s++) {
    const center = input.rng.nextInt({ max: size })

    // Both paired runs must share an identical random stream so they differ
    // only by the perturbation, not by rule-internal randomness. Draw one seed
    // and build two independent Rngs from it.
    const stepSeed = Math.floor(input.rng.next() * 0xffffffff) >>> 0
    const baselineNext = stepOnce({
      rule: input.rule,
      substrate: input.substrate,
      configuration: input.configuration,
      rng: rngFromSeed(stepSeed),
    })

    // Perturb the center: flip every slot to a different value.
    const perturbed = cloneConfiguration(input.configuration)

    for (let slot = 0; slot < slots; slot++) {
      const current = getTone(perturbed, { element: center, slot })
      const shifted = distinct > 1 ? (current + 1) % distinct : current

      setTone(perturbed, { element: center, slot, value: shifted })
    }

    const perturbedNext = stepOnce({
      rule: input.rule,
      substrate: input.substrate,
      configuration: perturbed,
      rng: rngFromSeed(stepSeed),
    })

    // Find the farthest node whose next tone differs between the two runs.
    let maxRadius = 0

    for (let node = 0; node < size; node++) {
      let changed = false

      for (let slot = 0; slot < slots; slot++) {
        if (
          getTone(baselineNext, { element: node, slot }) !==
          getTone(perturbedNext, { element: node, slot })
        ) {
          changed = true
          break
        }
      }

      if (!changed) {
        continue
      }

      const distance = graphDistance({
        substrate: input.substrate,
        from: center,
        to: node,
      })

      if (distance > maxRadius) {
        maxRadius = distance
      }
    }

    if (maxRadius > 0) {
      radii.push(maxRadius)
    }
  }

  if (radii.length === 0) {
    return 0
  }

  return radii.reduce((sum, r) => sum + r, 0) / radii.length
}
