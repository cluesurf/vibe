// Quantum unitarity from the deterministic reversible knit, the configuration-space view (the
// Bisio-D'Ariano quantum-cellular-automaton framework). The knit is a bijection on the finite set
// of configurations (reversibility), and a bijection induces a PERMUTATION matrix on the Hilbert
// space spanned by the configurations, which is UNITARY (a permutation matrix satisfies U dagger U
// equal to the identity). So the deterministic reversible rule acts unitarily on amplitudes over
// configurations, and quantum superposition is the amplitude a coarse-grained observer, who cannot
// see the exact microstate, assigns over configurations. This module builds the finite orbit of a
// state (a single cycle, on which the knit is a cyclic permutation), and measures that a complex
// superposition over the orbit keeps its norm exactly, while a lossy rule fails injectivity and so
// is not a permutation and not unitary.

import { beat } from '@/code/rule/lattice-gas'
import { cloneWill, type Will } from '@/code/tone/will'
import type { Collision } from '@/code/rule/collision'

function stateKey(will: Will): string {
  return will.data.join(',')
}

// the orbit of a state under a rule: the sequence of distinct states until it returns, and the
// period. Under the reversible knit this is a single cycle, the invariant subspace the knit acts
// on as a cyclic permutation.
export function stateOrbit(input: {
  will: Will
  collision: Collision
  maxBeats: number
}): { states: string[]; period: number } {
  const startKey = stateKey(input.will)
  const states: string[] = [startKey]
  let current = cloneWill(input.will)

  for (let t = 1; t <= input.maxBeats; t++) {
    current = beat(current, input.collision)
    const key = stateKey(current)

    if (key === startKey) {
      return { states, period: t }
    }

    states.push(key)
  }

  return { states, period: -1 }
}

// the L2 norm of a complex amplitude vector over the orbit, after ONE beat of the cyclic
// permutation (the amplitudes shift by one position). Returns the start and end norms, which are
// equal for a permutation (unitary), the quantum-mechanical norm conservation.
export function superpositionNormAfterBeat(input: {
  period: number
  real: number[]
  imaginary: number[]
}): { startNorm: number; endNorm: number } {
  const { period, real, imaginary } = input

  const norm = (re: number[], im: number[]): number => {
    let sum = 0

    for (let i = 0; i < period; i++) {
      sum += re[i]! * re[i]! + im[i]! * im[i]!
    }

    return sum
  }

  // the cyclic permutation: amplitude at position i moves to position (i+1) mod period
  const shiftedReal = new Array<number>(period)
  const shiftedImaginary = new Array<number>(period)

  for (let i = 0; i < period; i++) {
    shiftedReal[(i + 1) % period] = real[i]!
    shiftedImaginary[(i + 1) % period] = imaginary[i]!
  }

  return {
    startNorm: norm(real, imaginary),
    endNorm: norm(shiftedReal, shiftedImaginary),
  }
}

// whether a rule is INJECTIVE on a set of distinct states: apply one beat to each and count the
// distinct images. A permutation (the reversible knit) keeps the count; a lossy rule merges states
// (fewer distinct images), so it is not a permutation and not unitary.
export function ruleInjectivity(input: {
  stateWills: Will[]
  collision: Collision
}): { inputCount: number; distinctImages: number; injective: boolean } {
  const images = new Set<string>()

  for (const will of input.stateWills) {
    const next = beat(cloneWill(will), input.collision)
    images.add(stateKey(next))
  }

  return {
    inputCount: input.stateWills.length,
    distinctImages: images.size,
    injective: images.size === input.stateWills.length,
  }
}
