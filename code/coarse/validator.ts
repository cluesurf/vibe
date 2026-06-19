// The validator of the coarse-graining engine, the commuting square (see the multi-level-selves plan, E3).
// An effective rule is correct when coarse-graining then evolving equals evolving then coarse-graining,
// within a bounded error. This is the honest measure of how much the compression loses. A level with large
// commuting-square error is not a clean level.

// The commuting-square error for a macro rule. For each sampled micro state s, compare two paths.
//   path A, evolve then coarse:   macro = coarseMap(microStep(s))
//   path B, coarse then evolve:   macro = macroStep(coarseMap(s))
// The error is the fraction of samples where the two macro states disagree (a discrete coarse map), so 0 is
// a perfect effective rule and a value near the random-guess rate is a failed one.
export function commutingSquareError<State>(input: {
  states: State[]
  microStep: (state: State) => State
  coarseMap: (state: State) => number
  macroStep: (macro: number) => number
}): number {
  const { states, microStep, coarseMap, macroStep } = input
  if (states.length === 0) {
    return 1
  }

  let disagree = 0
  for (const s of states) {
    const evolveThenCoarse = coarseMap(microStep(s))
    const coarseThenEvolve = macroStep(coarseMap(s))
    if (evolveThenCoarse !== coarseThenEvolve) {
      disagree++
    }
  }

  return disagree / states.length
}

// The most-probable-next macro state for each macro state, read off a transition matrix. This is the
// simplest effective rule, the deterministic skeleton of the learned Markov model, used by the
// commuting-square test as macroStep.
export function mostProbableNext(tpm: number[][]): number[] {
  return tpm.map(row => {
    let best = 0
    let bestValue = -1
    for (let j = 0; j < row.length; j++) {
      if (row[j]! > bestValue) {
        bestValue = row[j]!
        best = j
      }
    }

    return best
  })
}
