// Conformance for code/model/selection: deterministic variation-plus-selection. The module has no seed
// argument, so a run is a pure function of its parameters (reproducible, bit for bit). The load-bearing
// CONTROL comparison: persistence-selection raises mean fitness above the no-selection baseline run
// from the same initial population (selection adapts; the control does not). Both checked on a concrete
// case, re-derived as a differential rather than against a hand-computed scalar.

import { suite, check, equal, ok } from '@/test/code/harness'
import { evolvePopulation } from '@/code/model/selection'

suite('model/selection: determinism', [
  check('a run is reproducible for fixed parameters', () => {
    const opts = { n: 40, populationSize: 20, generations: 12, select: true }
    const a = evolvePopulation(opts)
    const b = evolvePopulation(opts)
    equal(a.initialFitness, b.initialFitness, 'same initial fitness')
    equal(a.finalFitness, b.finalFitness, 'same final fitness')
  }),
])

suite('model/selection: selection beats the control', [
  // Same initial population (deterministic seeds), with vs without selection. Selection must end fitter.
  check('selection adapts above the no-selection control', () => {
    const base = { n: 60, populationSize: 24, generations: 20 }
    const selected = evolvePopulation({ ...base, select: true })
    const control = evolvePopulation({ ...base, select: false })
    equal(
      selected.initialFitness,
      control.initialFitness,
      'both start from the same population',
    )
    ok(
      selected.finalFitness > selected.initialFitness,
      'selection raises mean fitness',
    )
    ok(
      selected.finalFitness > control.finalFitness,
      'selection ends fitter than the unselected control',
    )
  }),
])
