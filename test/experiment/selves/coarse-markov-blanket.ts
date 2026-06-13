// E1 (multi-level-selves plan), the Markov-blanket criterion. A genuine self screens its interior from its
// exterior through its shell. We track the emergent self each beat, record the interior, shell, and exterior
// charge series, and measure how much conditioning on the shell removes the interior-exterior coupling. The
// control is a fixed medium region (a ball in the bulk of the lattice that is not a maintained self). A self
// should screen more cleanly than undifferentiated medium.
//
// Depth L2, a measured screening test with a control. The screening is a documented partial-correlation
// proxy for the conditional mutual information, not the full transfer entropy.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { flatGraph, emergeSelf, beat, largestPositiveCluster, ball } from '@/code/model/self-kit'
import { regionPartition, blanketScreening } from '@/code/coarse/self-criteria'
import { makeRng } from '@/code/coarse/self-trajectory'

function sumTone(tone: Int8Array, cells: number[]): number {
  let s = 0
  for (const c of cells) s += tone[c]!
  return s
}

export default defineExperiment({
  id: 'selves/coarse-markov-blanket',
  title: 'an emergent self screens interior from exterior through its shell more cleanly than medium',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const L = 64
    const beats = 160
    const graph = flatGraph(L)
    const rng = makeRng(8675309)
    const moved = new Uint8Array(graph.cellCount)
    const { tone } = emergeSelf(graph, rng, moved, { beats: 60, density: 0.1 })

    // a fixed medium region near a corner, unlikely to coincide with the wandering self.
    const controlBall = ball(graph, 5 * L + 5, 4)
    const controlPart = regionPartition({ cluster: controlBall, graph })

    const selfI: number[] = []
    const selfS: number[] = []
    const selfE: number[] = []
    const ctrlI: number[] = []
    const ctrlS: number[] = []
    const ctrlE: number[] = []
    for (let t = 0; t < beats; t++) {
      beat(tone, graph, moved, rng, 0.01, 0.22)
      const cluster = largestPositiveCluster(tone, graph)
      if (cluster.length >= 8) {
        const part = regionPartition({ cluster, graph })
        if (part.interior.length > 0 && part.exterior.length > 0) {
          selfI.push(sumTone(tone, part.interior))
          selfS.push(sumTone(tone, part.shell))
          selfE.push(sumTone(tone, part.exterior))
        }
      }
      ctrlI.push(sumTone(tone, controlPart.interior))
      ctrlS.push(sumTone(tone, controlPart.shell))
      ctrlE.push(sumTone(tone, controlPart.exterior))
    }

    const self = blanketScreening({ interior: selfI, shell: selfS, exterior: selfE })
    const control = blanketScreening({ interior: ctrlI, shell: ctrlS, exterior: ctrlE })

    const ok = self.reduction > control.reduction + 0.1 && self.reduction > 0.3
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'conditioning on the shell removes more of the interior-exterior coupling for the emergent self than for a non-self medium region',
      metrics: {
        selfRaw: self.raw,
        selfScreened: self.screened,
        selfReduction: self.reduction,
        controlReduction: control.reduction,
        samples: selfI.length,
      },
      control: { controlReduction: control.reduction },
      notes: 'partial-correlation screening proxy, self tracked each beat, control is a fixed medium ball',
    })
  },
})
