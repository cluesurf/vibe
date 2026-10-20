// EXTERNAL COMPARISON MODEL, NOT A VIBE BASE THING. The cyclic step machine of the "Matter As Machine" model,
// built literally as a control for E-RLT-0113: a particle is a looped list of instructions, each one unit step
// along one of six axis directions (right, left, up, down, forward, back = +x, -x, +y, -y, +z, -z). Every beat
// it executes the next instruction and moves one step, and after the last it returns to the first, forever.
// Space is taxicab: axis steps only. Nothing here is drawn from Vibe's mesh, tone, rule, growth or arrow; it
// lives in code/control/ because its job is to be a model that gives a different answer.
//
// What the model reads off a loop of N steps with net step counts n = (n_x, n_y, n_z): its velocity n / N docks
// a beat, its "rest" share the steps that cancel (a +x and a -x pair takes two beats and goes nowhere), and its
// top speed 1, reached only by a loop of one direction (RRRR moves at c, RRRRLLL at c / 7).
//
// Deterministic and integer: positions are whole steps, and a velocity is a ratio of whole numbers.

export const AXIS_STEPS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// the model's own letters, in AXIS_STEPS order
const LETTERS = 'RLUDFB'

export type CyclicMachine = {
  // the looped instruction list, each entry an index into AXIS_STEPS
  readonly loop: Int8Array
}

// a machine from the model's letters, as in "RRRRLLL"
export function machineFromLetters(letters: string): CyclicMachine {
  return {
    loop: Int8Array.from(letters, letter => {
      const i = LETTERS.indexOf(letter)

      if (i < 0) {
        throw new Error(`no axis step named ${letter}`)
      }

      return i
    }),
  }
}

// run the machine from the origin for `beats` beats: its integer position after every beat (3 per beat)
export function runMachine(input: {
  machine: CyclicMachine
  beats: number
}): Int32Array {
  const { loop } = input.machine
  const out = new Int32Array(input.beats * 3)
  const at = [0, 0, 0]

  for (let t = 0; t < input.beats; t++) {
    const step = AXIS_STEPS[loop[t % loop.length]!]!

    for (let i = 0; i < 3; i++) {
      at[i] = at[i]! + step[i]!
      out[t * 3 + i] = at[i]!
    }
  }

  return out
}

// the displacement after `periods` whole loops, measured by running, and the beats taken
export function measuredDisplacement(input: {
  machine: CyclicMachine
  periods: number
}): { displacement: [number, number, number]; beats: number } {
  const beats = input.periods * input.machine.loop.length
  const path = runMachine({ machine: input.machine, beats })

  return {
    displacement: [
      path[(beats - 1) * 3]!,
      path[(beats - 1) * 3 + 1]!,
      path[(beats - 1) * 3 + 2]!,
    ],
    beats,
  }
}

// the step counts the loop holds, per AXIS_STEPS entry
export function stepCounts(machine: CyclicMachine): number[] {
  const out = [0, 0, 0, 0, 0, 0]

  for (const s of machine.loop) {
    out[s] = out[s]! + 1
  }

  return out
}

// A loop of `length` steps heading along `direction` as closely as whole steps allow, with `rest` cancelling
// pairs (rest is even: rest / 2 of +x and of -x). The moving steps are shared over the axes in proportion to
// |u_i| by largest remainder (ties to the lower axis), and interleaved by an error accumulator so the loop
// is spread evenly; both are deterministic. This is the model's best try at a direction it has no step for
export function machineToward(input: {
  direction: readonly number[]
  length: number
  rest: number
}): CyclicMachine {
  const { direction, length, rest } = input

  if (rest % 2 !== 0 || rest > length) {
    throw new Error('rest must be even and at most the length')
  }

  const moving = length - rest
  const weight = [0, 1, 2].map(i => Math.abs(direction[i] ?? 0))
  const total = weight[0]! + weight[1]! + weight[2]!
  const exact = weight.map(w => (moving * w) / total)
  const counts = exact.map(Math.floor)

  let left = moving - counts[0]! - counts[1]! - counts[2]!

  const order = [0, 1, 2].sort(
    (a, b) =>
      exact[b]! - counts[b]! - (exact[a]! - counts[a]!) || a - b,
  )

  for (const i of order) {
    if (left === 0) {
      break
    }

    counts[i] = counts[i]! + 1
    left--
  }

  // the per-step list: the moving steps of each axis plus rest / 2 of +x and of -x
  const want = [0, 0, 0, 0, 0, 0]

  for (let i = 0; i < 3; i++) {
    const negative = (direction[i] ?? 0) < 0

    want[2 * i + (negative ? 1 : 0)] = counts[i]!
  }

  want[0] = want[0]! + rest / 2
  want[1] = want[1]! + rest / 2

  // interleave: at each beat take the step whose share is furthest behind its quota
  const loop = new Int8Array(length)
  const taken = [0, 0, 0, 0, 0, 0]

  for (let t = 0; t < length; t++) {
    let best = -1
    let lag = -Infinity

    for (let s = 0; s < 6; s++) {
      if (taken[s]! >= want[s]!) {
        continue
      }

      const behind = ((t + 1) * want[s]!) / length - taken[s]!

      if (behind > lag) {
        lag = behind
        best = s
      }
    }

    loop[t] = best
    taken[best] = taken[best]! + 1
  }

  return { loop }
}
