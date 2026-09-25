// Locate a threshold by bisection: the point in [low, high] where a predicate that is false at low
// and true at high changes value. Each step halves the bracket, so `steps` evaluations pin the
// threshold to (high - low) / 2^steps. The predicate is evaluated at the endpoints first, and a
// bracket that does not change value is reported rather than bisected, so a caller cannot read a
// threshold out of a predicate that never switched.

export type Bracket = {
  readonly low: number
  readonly high: number
  // false when the predicate did not switch between the endpoints
  readonly switched: boolean
  readonly evaluations: number
}

export function bisectThreshold(input: {
  low: number
  high: number
  steps: number
  isAbove: (x: number) => boolean
}): Bracket {
  let low = input.low
  let high = input.high
  let evaluations = 2

  if (input.isAbove(low) || !input.isAbove(high)) {
    return { low, high, switched: false, evaluations }
  }

  for (let step = 0; step < input.steps; step++) {
    const middle = (low + high) / 2

    evaluations += 1

    if (input.isAbove(middle)) {
      high = middle
    } else {
      low = middle
    }
  }

  return { low, high, switched: true, evaluations }
}
