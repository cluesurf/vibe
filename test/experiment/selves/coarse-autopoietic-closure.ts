// E1 (multi-level-selves plan), the autopoietic-closure criterion, the third of the self triple. A self is
// autopoietic when its organization persists while its matter flows through, the interior continually
// regenerates the boundary so the form is maintained even as individual cells turn over. We track the self
// over many beats and measure three things, persistence (does the form survive), turnover (do the cells
// flow), and size stability (is the organization maintained). The control runs the SAME emerged self with
// the cohesion turned off, where the blob is not maintained.
//
// Depth L2. Honest caveat, the maintenance comes from the cohesion term of the perception beat, an effective
// ingredient, not one of the pure base elements. So this shows autopoiesis given cohesion, and the control
// shows it fails without it.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { flatGraph, emergeSelf, beat, largestPositiveCluster } from '@/code/model/self-kit'
import { makeRng } from '@/test/experiment/selves/coarse-self-trajectory'
import { jaccardDistance } from '@/code/measure/point-set'

function maintain(input: { L: number; beats: number; cohesion: number; seed: number }): {
  persistence: number
  turnover: number
  meanSize: number
} {
  const { L, beats, cohesion, seed } = input
  const graph = flatGraph(L)
  const rng = makeRng(seed)
  const moved = new Uint8Array(graph.cellCount)
  // emerge the self with cohesion on, then test the maintenance phase at the given cohesion.
  const { tone, cluster } = emergeSelf(graph, rng, moved, { beats: 60, density: 0.1 })
  const initial = Math.max(1, cluster.length)
  const sizes: number[] = []
  let prev = new Set(cluster)
  let turnoverSum = 0
  let survived = 0
  for (let t = 0; t < beats; t++) {
    beat(tone, graph, moved, rng, 0.01, cohesion)
    const c = largestPositiveCluster(tone, graph)
    sizes.push(c.length)
    if (c.length >= 0.5 * initial) survived++
    const cur = new Set(c)
    turnoverSum += jaccardDistance(prev, cur)
    prev = cur
  }
  const meanSize = sizes.reduce((a, b) => a + b, 0) / sizes.length
  return {
    persistence: survived / beats,
    turnover: turnoverSum / beats,
    meanSize,
  }
}

export default defineExperiment({
  id: 'selves/coarse-autopoietic-closure',
  title: 'the self maintains a stable organization while its cells turn over, the cohesion-off control does not',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const cohesive = maintain({ L: 64, beats: 120, cohesion: 0.22, seed: 246810 })
    const diffusive = maintain({ L: 64, beats: 120, cohesion: 0, seed: 246810 })

    // autopoiesis, the cohesive self maintains a far larger coherent organization than diffusion (its
    // interior keeps regenerating the body) while its member cells keep turning over (the matter flows
    // through). Diffusion without cohesion fragments into small bits, no maintained body.
    const ok =
      cohesive.persistence > 0.8 &&
      cohesive.turnover > 0.05 &&
      cohesive.meanSize > diffusive.meanSize * 1.5
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the cohesive self maintains a much larger coherent body than diffusion while its member cells turn over, an autopoietic regeneration of the form, which the cohesion-off control does not sustain',
      metrics: {
        cohesivePersistence: cohesive.persistence,
        cohesiveTurnover: cohesive.turnover,
        cohesiveMeanSize: cohesive.meanSize,
        diffusivePersistence: diffusive.persistence,
        diffusiveTurnover: diffusive.turnover,
        diffusiveMeanSize: diffusive.meanSize,
      },
      control: { diffusiveMeanSize: diffusive.meanSize },
      notes:
        'maintenance comes from the cohesion term, an effective ingredient, not a pure base element. Autopoiesis here is given cohesion, the control shows the body is not sustained without it',
    })
  },
})
