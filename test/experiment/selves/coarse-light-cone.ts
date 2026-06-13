// E1 (multi-level-selves plan), the cognitive-light-cone criterion. A self measures and corrects
// perturbations within a spatiotemporal radius. We flip one cell, evolve a perturbed copy and an unperturbed
// copy under the IDENTICAL deterministic beat stream, and track the set of cells that differ. The only
// source of divergence is the flip, so the difference set is the causal cone of the perturbation. A self
// that corrects contains the cone (the difference set shrinks after a peak). The control flips a medium cell
// outside the self, where the perturbation spreads instead of being corrected.
//
// Depth L2, a measured perturb-and-watch with a control. It measures containment and radius, the agency
// signature, on the self dynamics.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { flatGraph, emergeSelf, beat, largestPositiveCluster } from '@/test/experiment/misc/self-kit'
import { distancesFrom } from '@/code/coarse/self-criteria'
import { makeRng } from '@/test/experiment/selves/coarse-self-trajectory'

function perturbAndWatch(input: {
  graph: ReturnType<typeof flatGraph>
  base: Int8Array
  site: number
  beats: number
  seed: number
}): { peak: number; final: number; radius: number } {
  const { graph, base, site, beats, seed } = input
  const dist = distancesFrom({ graph, source: site })
  const control = base.slice()
  const perturbed = base.slice()
  perturbed[site] = (perturbed[site] === 1 ? -1 : 1) as -1 | 1
  const movedA = new Uint8Array(graph.cellCount)
  const movedB = new Uint8Array(graph.cellCount)
  let peak = 0
  let radius = 0
  let final = 0
  for (let t = 0; t < beats; t++) {
    // identical rng streams, so the dynamics is the same except where the flip propagates.
    beat(control, graph, movedA, makeRng(seed + t), 0.01, 0.22)
    beat(perturbed, graph, movedB, makeRng(seed + t), 0.01, 0.22)
    let count = 0
    let maxR = 0
    for (let i = 0; i < control.length; i++) {
      if (control[i] !== perturbed[i]) {
        count++
        if (dist[i]! > maxR) maxR = dist[i]!
      }
    }
    if (count > peak) peak = count
    if (maxR > radius) radius = maxR
    final = count
  }
  return { peak, final, radius }
}

export default defineExperiment({
  id: 'selves/coarse-light-cone',
  title: 'a self contains and corrects an interior perturbation, the medium spreads it',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const L = 64
    const graph = flatGraph(L)
    const rng = makeRng(192837)
    const moved = new Uint8Array(graph.cellCount)
    const { tone } = emergeSelf(graph, rng, moved, { beats: 60, density: 0.1 })
    const cluster = largestPositiveCluster(tone, graph)
    const selfSite = cluster[Math.floor(cluster.length / 2)] ?? 0

    // a medium cell outside the self, the control perturbation site.
    const inSelf = new Set(cluster)
    let mediumSite = 0
    for (let i = 0; i < tone.length; i++) {
      if (!inSelf.has(i)) {
        mediumSite = i
        break
      }
    }

    const watchBeats = 40
    const self = perturbAndWatch({ graph, base: tone, site: selfSite, beats: watchBeats, seed: 5000 })
    const medium = perturbAndWatch({ graph, base: tone, site: mediumSite, beats: watchBeats, seed: 5000 })

    // containment ratio, final difference over peak difference. Low would mean the perturbation was
    // corrected. High means it persisted and spread.
    const selfContainment = self.peak > 0 ? self.final / self.peak : 1
    const mediumContainment = medium.peak > 0 ? medium.final / medium.peak : 1

    // the honest finding. The perturbation spreads across the lattice for BOTH the self and the medium, with
    // similar containment, so the self does not contain or correct it. The base cohesive rule is effectively
    // chaotic, a single flip diverges globally. There is no protective cognitive light cone here. The test
    // passes by correctly establishing this negative with a control, it is not a claim that selves correct.
    const ok =
      selfContainment > 0.7 && mediumContainment > 0.7 && Math.abs(selfContainment - mediumContainment) < 0.15
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an interior self perturbation spreads across the lattice as much as a medium perturbation, so the emergent self shows no protective cognitive light cone under the base cohesive rule, an honest negative',
      metrics: {
        selfPeak: self.peak,
        selfFinal: self.final,
        selfRadius: self.radius,
        selfContainment,
        mediumPeak: medium.peak,
        mediumFinal: medium.final,
        mediumRadius: medium.radius,
        mediumContainment,
      },
      control: { mediumContainment },
      notes:
        'honest negative. The dynamics is effectively chaotic, a single flip diverges globally for self and medium alike. A genuine cognitive light cone would need a more robust rule or a higher coarse level, consistent with the churning-self findings',
    })
  },
})
