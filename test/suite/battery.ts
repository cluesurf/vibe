// The suite batteries. Each is a selection over the experiment registry, so the
// code and the suites can never disagree. regression is everything, paper is the
// headline results, crown-jewels is the small set of deepest emergent claims that
// the whole framework rests on.

import { allExperiments, Experiment } from '@/test/scaffold/suite'

// Every registered experiment. The default gate.
export function regression(): Experiment[] {
  return allExperiments()
}

// The results that carry a paper claim.
export function paper(): Experiment[] {
  return allExperiments().filter((experiment) => experiment.paper)
}

// The deepest emergent results, the L3 claims that carry a control. These are the
// ones a reader should check first, the load-bearing claims of the framework.
export function crownJewels(): Experiment[] {
  return allExperiments().filter(
    (experiment) => experiment.depth === 'L3' && experiment.paper,
  )
}
