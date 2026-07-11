import { makeRng } from '@/code/tool/rng'

// A repeating thought as an attracting limit cycle. Associations chain one state to the next, and a
// thought that loops back on itself is a closed chain: A leads to B leads to C leads back to A. An
// asymmetric associative memory stores such a cycle in its weights (each stored state points to the
// next), and its update dynamics then falls into the cycle and repeats it, an attracting limit
// cycle. From a noisy or partial cue the dynamics is drawn onto the cycle (the basin), so a
// repeating thought is a stable periodic attractor of the association dynamics, not a fixed idea:
// it cycles. Scrambling the weights destroys the sequence links, and no cycle forms.

export type SequenceMemory = {
  size: number
  length: number
  patterns: number[][]
  weight: number[][]
}

// Build the sequence memory: `length` bipolar patterns of dimension `size`, and the asymmetric
// weight matrix W = sum over i of pattern[i+1] outer pattern[i], which sends each stored state to
// the next, closing the cycle. Deterministic from the seed.
export function buildSequenceMemory(input: {
  size: number
  length: number
  seed: number
}): SequenceMemory {
  const { size, length, seed } = input
  const rng = makeRng({ seed })
  const patterns: number[][] = []

  for (let i = 0; i < length; i++) {
    const pattern: number[] = []

    for (let d = 0; d < size; d++)
      pattern.push(rng.next() < 0.5 ? -1 : 1)

    patterns.push(pattern)
  }

  const weight: number[][] = Array.from({ length: size }, () =>
    new Array<number>(size).fill(0),
  )

  for (let i = 0; i < length; i++) {
    const next = patterns[(i + 1) % length]!
    const current = patterns[i]!

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++)
        weight[x]![y]! += next[x]! * current[y]!
    }
  }

  return { size, length, patterns, weight }
}

// One update step: the sign of the weighted input.
export function sequenceStep(input: {
  memory: SequenceMemory
  state: number[]
  scramble: boolean
}): number[] {
  const { memory, state, scramble } = input
  const { size, weight } = memory
  const next: number[] = new Array<number>(size).fill(0)

  for (let i = 0; i < size; i++) {
    let sum = 0

    for (let j = 0; j < size; j++) {
      // the scrambled control shifts each row, breaking the sequence links
      const column = scramble ? (j * 7 + 3) % size : j

      sum += weight[i]![column]! * state[j]!
    }

    next[i] = sum > 0 ? 1 : -1
  }

  return next
}

// The overlap of a state with each stored pattern; returns the index of the best match and its
// normalized overlap.
export function bestMatch(input: {
  memory: SequenceMemory
  state: number[]
}): { index: number; overlap: number } {
  const { memory, state } = input

  let index = -1
  let overlap = -Infinity

  for (let i = 0; i < memory.length; i++) {
    let sum = 0

    for (let d = 0; d < memory.size; d++)
      sum += state[d]! * memory.patterns[i]![d]!

    const normalized = sum / memory.size

    if (normalized > overlap) {
      overlap = normalized
      index = i
    }
  }

  return { index, overlap }
}

// Whether the dynamics, started from a noisy version of the first pattern, converges to cycling
// through the stored sequence in order (the attracting limit cycle). Runs several periods and checks
// the final period visits the patterns 0, 1, ..., length-1 in cyclic order with high overlap.
export function convergesToCycle(input: {
  memory: SequenceMemory
  noiseFraction: number
  scramble: boolean
  seed: number
}): boolean {
  const { memory, noiseFraction, scramble, seed } = input
  const rng = makeRng({ seed })

  let state = memory.patterns[0]!.map(value =>
    rng.next() < noiseFraction ? -value : value,
  )

  const visited: number[] = []

  for (let step = 0; step < 3 * memory.length; step++) {
    state = sequenceStep({ memory, state, scramble })

    const match = bestMatch({ memory, state })

    if (match.overlap > 0.9) visited.push(match.index)
  }

  const tail = visited.slice(-memory.length)

  if (tail.length < memory.length) return false

  return tail.every(
    (value, i) => value === (tail[0]! + i) % memory.length,
  )
}
