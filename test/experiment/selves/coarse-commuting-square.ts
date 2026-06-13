// E3 (multi-level-selves plan), the commuting square. An effective rule is valid when coarse-graining then
// evolving matches evolving then coarse-graining. We learn the effective rule as the most-probable-next bin
// of the measured Markov model, then test the square on real tone snapshots, one micro beat versus the macro
// rule. The control is a RANDOM macro rule on the same coarse map, which does not commute. A low structured
// error against a high random error shows the learned effective rule actually predicts the coarse dynamics.
//
// Depth L2, a known renormalization validity check (the commuting square) on this substrate, with a control.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { countMatrix, rowStochastic } from '@/code/coarse/transition-matrix'
import { commutingSquareError, mostProbableNext } from '@/code/coarse/validator'
import { beat } from '@/code/model/self-kit'
import { selfTrajectory, positionBin, makeRng } from '@/code/coarse/self-trajectory'

export default defineExperiment({
  id: 'selves/coarse-commuting-square',
  title: 'the learned effective rule commutes with one micro beat far better than a random rule',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const bins = 8
    const L = 64
    const traj = selfTrajectory({ L, beats: 800, bins, seed: 13579, snapshotEvery: 6 })
    const tpm = rowStochastic(countMatrix({ trajectory: traj.labels, stateCount: bins, lag: 1 }))
    const learned = mostProbableNext(tpm)

    // a random effective rule on the same coarse map, the control.
    const rng = makeRng(4321)
    const random = Array.from({ length: bins }, () => Math.floor(rng.next() * bins))

    const stepRng = makeRng(2468)
    const graph = traj.graph
    const moved = new Uint8Array(graph.cellCount)
    const microStep = (tone: Int8Array): Int8Array => {
      const copy = tone.slice()
      beat(copy, graph, moved, stepRng, 0.01, 0.22)
      return copy
    }
    const coarseMap = (tone: Int8Array): number => positionBin({ tone, L, bins })

    const errorStructured = commutingSquareError({
      states: traj.snapshots,
      microStep,
      coarseMap,
      macroStep: (bin) => learned[bin]!,
    })
    const errorRandom = commutingSquareError({
      states: traj.snapshots,
      microStep,
      coarseMap,
      macroStep: (bin) => random[bin]!,
    })

    const ok = errorStructured < errorRandom - 0.1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the learned most-probable-next effective rule commutes with a micro beat, with lower error than a random rule on the same coarse map',
      metrics: { errorStructured, errorRandom, bins, snapshots: traj.snapshots.length },
      control: { errorRandom },
      notes: 'statistical, one realization, L2 validity check of the effective rule, not a clean-level claim',
    })
  },
})
