// AUDIT 2026-08-31: regraded from L3 to L2. this experiment is a selection model, with no substrate or rule in it. Honest depth L2, which is what the notes below already said in words while the depth field said L3.
// Deterministic evolution: variation plus persistence-selection, no randomness. A population of variant patterns
// in a fixed environment adapts toward it: the fitter (more resonant, more persistent) half survives and seeds
// deterministic variants, and mean fitness rises over generations. Without selection there is no rise. So
// directed evolution needs no fundamental randomness, only deterministic variation and differential persistence.
//
// L3 with a control (no selection, no adaptation), deterministic, robustness by size. Compute in code/model/selection.

import { evolvePopulation } from '@/code/model/selection'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'selves/selection-by-persistence',
  code: 'E-SLF-0110',
  title:
    'deterministic variation plus persistence-selection adapts a population toward its environment, with no randomness',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [80, 120, 160]
    const runs = sizes.map(n => ({
      selected: evolvePopulation({
        n,
        populationSize: 24,
        generations: 50,
        select: true,
      }),
      control: evolvePopulation({
        n,
        populationSize: 24,
        generations: 50,
        select: false,
      }),
    }))

    const adapts = runs.every(
      r => r.selected.finalFitness > r.selected.initialFitness + 0.25,
    )

    const controlFlat = runs.every(
      r => r.control.finalFitness < r.control.initialFitness + 0.1,
    )

    const ok = adapts && controlFlat

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with selection the population mean fitness (resonance with the environment) rises substantially over generations, while without selection it stays flat, so directed evolution arises from deterministic variation and persistence-selection with no fundamental randomness',
      metrics: {
        initialFitness: last.selected.initialFitness,
        finalFitness: last.selected.finalFitness,
      },
      control: { noSelectionFinalFitness: last.control.finalFitness },
      notes:
        'AUDIT 2026-08-31: this experiment is a selection model, with no substrate or rule in it. Honest depth L2, which is what the notes below already said in words while the depth field said L3. ' +
        'L3 deterministic evolution, fitness is persistence (resonance with the niche), variation is structured site flips, robustness by size not seeds',
    })
  },
})
