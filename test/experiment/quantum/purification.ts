// EXTERNAL THEORY: Chiribella, D'Ariano, Perinotti, the purification postulate, the decisive axiom of the
// informational reconstruction of quantum theory (author-bridges/giulio-chiribella.md and
// dariano-perinotti.md, experiment E-QM-04 / E-QM-23). Their claim: every mixed state is the marginal of a
// pure, reversible whole. Nothing is fundamentally lost, only entangled with something ignored. Vibe's base
// is reversible, so the classical form should hold: a local observer sees an apparently mixed marginal while
// the global state stays one definite (pure) configuration, and the whole is exactly recoverable.
//
// Tested on the committed knit (collide then stream, reversible) on the {3,4,3,4} d4 mesh. (1) the reversible
// knit recovers the exact start after forward-then-backward beats (roundtrip Hamming = 0), (2) a subregion's
// tone histogram on the evolved state has positive Shannon entropy (looks mixed), (3) so the local mixedness
// is purificational, recoverable, not loss. CONTROL: the erasing (lossy) collision must NOT recover (positive
// roundtrip Hamming), the case purification forbids. Honest scope: the classical-reversibility form on the
// deterministic base, not full quantum purification (that lives at the emergent quantum layer).

import { d4Mesh } from '@/code/tool/mesh'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import { roundtrip } from '@/code/check/reversibility'
import { ternaryToneEntropyBits } from '@/code/measure/tone-entropy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/purification',
  code: 'E-QTM-0020',
  title:
    "vibe's reversible knit realizes purification, a mixed local marginal is the recoverable view of a pure reversible whole (Chiribella, D'Ariano), with a lossy control that fails",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const side = 6
    const mesh = d4Mesh({ side })
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++)
      opposite.push(mesh.opposite(d))

    const collision = headOnRotate({ opposite })
    const degree = mesh.degree
    const beats = 12

    // a deterministic PURE initial configuration, a fixed coordinate pattern, no randomness.
    const coordinate = (cell: number, axis: number): number =>
      Math.floor(cell / side ** axis) % side

    const start = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      for (let d = 0; d < degree; d++) {
        start.data[cell * degree + d] =
          ((coordinate(cell, 0) + 2 * coordinate(cell, 1) + d) % 3) - 1
      }
    }

    // (1) the reversible knit recovers the exact start; capture the evolved marginal for (2).
    const real = roundtrip({ will: start, collision, beats })
    const reversibleRecovers = real.roundtripHamming === 0

    // (2) the local marginal looks mixed: positive Shannon entropy over a subregion of the evolved state.
    const region: number[] = []

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      if (coordinate(cell, 0) < side / 2) {
        for (let d = 0; d < degree; d++) region.push(cell * degree + d)
      }
    }

    const localEntropyBits = ternaryToneEntropyBits(
      real.evolved,
      region,
    )

    const localLooksMixed = localEntropyBits > 0.5

    // CONTROL: the lossy rule must NOT recover (information genuinely lost, not purificational).
    const lossy = roundtrip({
      will: start,
      collision: erasingCollision,
      beats,
    })

    const lossyRecovers = lossy.roundtripHamming === 0

    const ok = reversibleRecovers && localLooksMixed && !lossyRecovers

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on vibe's reversible knit a subregion's tone histogram looks mixed (positive Shannon entropy) while the global state stays one definite configuration, and the whole is exactly recovered by running backward, so the local mixedness is the discarded-part view of a pure reversible whole (purification), while a lossy rule fails to recover, validating the Chiribella-D'Ariano purification axiom in its classical-reversibility form",
      metrics: {
        cells: mesh.cellCount,
        localEntropyBits,
        reversibleRecovers: reversibleRecovers ? 1 : 0,
      },
      control: {
        lossyRecovers: lossyRecovers ? 1 : 0,
        lossyRoundtripHamming: lossy.roundtripHamming,
      },
      notes:
        'L2, the classical-reversibility form of the purification postulate on the deterministic base, not full quantum purification (that would live at the emergent quantum layer). The reversible knit (collide, an involution, then stream, a bijection) loses nothing, so any local mixedness is ignorance of the complement, recoverable by the backward run. The erasing collision is the lossy control, which destroys information so the backward run cannot recover. Determinism is exact (integer equality), no randomness, the initial condition is a fixed coordinate pattern.',
    })
  },
})
