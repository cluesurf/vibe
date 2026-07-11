// The P1 evolution operator and Hamiltonian. For a small number of cells we
// enumerate the full finite state space and build the global one-step operator
// of a deterministic rule as a PERMUTATION of that space. The energy spectrum is
// read off the permutation's cycle structure as eigen-phases, avoiding any
// complex matrix logarithm.

import { Substrate } from '@/code/tool/substrate'
import { Rule } from '@/code/rule/rule'
import { Alphabet, valueCount } from '@/code/tone/alphabet'
import {
  Configuration,
  makeConfiguration,
  getTone,
  setTone,
} from '@/code/tone/configuration'
import { makeRng } from '@/code/tool/rng'

// The finite state space of `cells` elements over an alphabet. The full space
// has dimension valueCount(alphabet)^cells, so callers keep `cells` small.
export type StateSpace = {
  readonly form: 'state-space'
  readonly cells: number
  readonly alphabet: Alphabet
  readonly dimension: number
}

export function makeStateSpace(input: {
  cells: number
  alphabet: Alphabet
}): StateSpace {
  const base = valueCount(input.alphabet)

  let dimension = 1

  for (let i = 0; i < input.cells; i++) dimension *= base

  return {
    form: 'state-space',
    cells: input.cells,
    alphabet: input.alphabet,
    dimension,
  }
}

// Build the permutation perm[state] = nextState induced by one synchronous step
// of the rule. A global state is encoded as a base-`valueCount` number over
// `cells` slots (slot 0 is the least significant digit). The substrate size
// must equal space.cells. Stored values are mapped to a canonical 0..base-1
// digit via the alphabet's value layout.
export function permutationOfRule(input: {
  rule: Rule
  substrate: Substrate
  space: StateSpace
}): Int32Array {
  const space = input.space
  const base = valueCount(space.alphabet)
  const cells = space.cells
  // The encoder assumes each element stores a single slot. Spinor alphabets are
  // multi-slot and are out of scope for this small-space enumeration.
  const rng = makeRng({ seed: 1 })

  // Map a stored tone value to a canonical 0..base-1 digit and back. boolean and
  // clock store 0..base-1 directly. ternary / spinor store -1..+1, offset by 1.
  const offset =
    space.alphabet.form === 'ternary' ||
    space.alphabet.form === 'spinor'
      ? 1
      : 0

  const perm = new Int32Array(space.dimension)
  const config: Configuration = makeConfiguration({
    alphabet: space.alphabet,
    size: cells,
  })

  for (let state = 0; state < space.dimension; state++) {
    // Decode state into the configuration.
    let rest = state

    for (let cell = 0; cell < cells; cell++) {
      const digit = rest % base

      rest = Math.floor(rest / base)
      setTone(config, { element: cell, value: digit - offset })
    }

    // Apply one synchronous step.
    const out = input.rule.step({
      substrate: input.substrate,
      configuration: config,
      beat: 0,
      rng,
    })

    // Encode the result.
    let next = 0
    let place = 1

    for (let cell = 0; cell < cells; cell++) {
      const digit =
        getTone(out.configuration, { element: cell }) + offset

      next += digit * place
      place *= base
    }

    perm[state] = next
  }

  return perm
}

// Recover the Hamiltonian spectrum from the permutation's cycle structure. A
// cycle of length L is a discrete clock: its eigenvalues are e^{i theta} with
// theta = 2*pi*k/L for k = 0..L-1, so the energies are those theta in [0, 2*pi).
// All energies are collected and sorted ascending.
//
// boundedBelow is set to isPermutation: when the rule is a genuine bijection the
// energies live in the bounded interval [0, 2*pi), so a stable lowest state
// exists. Whether the resulting H is also LOCAL (a sum of bounded-range terms)
// is a separate, harder question flagged in the spec and not decided here.
export function hamiltonianFromPermutation(input: {
  perm: Int32Array
}): {
  eigenvalues: Float64Array
  boundedBelow: boolean
  isPermutation: boolean
} {
  const perm = input.perm
  const n = perm.length

  // Verify bijection: every target hit exactly once and within range.
  const seen = new Uint8Array(n)

  let isPermutation = true

  for (let i = 0; i < n; i++) {
    const target = perm[i] ?? -1

    if (target < 0 || target >= n || (seen[target] ?? 0) === 1) {
      isPermutation = false
      break
    }

    seen[target] = 1
  }

  if (!isPermutation) {
    return {
      eigenvalues: new Float64Array(0),
      boundedBelow: false,
      isPermutation: false,
    }
  }

  // Decompose into cycles, accumulating eigen-phases per cycle length.
  const visited = new Uint8Array(n)
  const energies: number[] = []

  for (let start = 0; start < n; start++) {
    if ((visited[start] ?? 0) === 1) continue

    let length = 0
    let cursor = start

    while ((visited[cursor] ?? 0) === 0) {
      visited[cursor] = 1
      cursor = perm[cursor] ?? cursor
      length++
    }

    for (let k = 0; k < length; k++)
      energies.push((2 * Math.PI * k) / length)
  }

  energies.sort((a, b) => a - b)

  return {
    eigenvalues: Float64Array.from(energies),
    boundedBelow: isPermutation,
    isPermutation,
  }
}
