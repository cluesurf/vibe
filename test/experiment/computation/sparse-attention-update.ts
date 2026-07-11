// The reversible rule engine is a sparse local-attention update, not a global all-pairs sweep. This names the
// engine's routing in the transformer terms the 6D / Informational-Physics framing borrows (attention, embedding,
// logits) and shows the optimization they point at is real and exact on this substrate.
//
//   - ONE-HOT ATTENTION. In the stream, each output slot reads exactly one input slot (its source along the same
//     line), so the bulk update's "attention matrix" is one nonzero per row. The routing is an O(cells x degree)
//     gather, not an O(cells^2) all-pairs interaction. The stream source table is that attention pattern.
//   - ACTIVITY PRUNING. For a rule whose vacuum is a fixed point, only the non-vacuum (active) cells need the
//     collide, so the rule work prunes from every cell to the active set. On a sparse state this is a large,
//     EXACT speedup, bit-identical to the full sweep.
//   - THE CONTROLS. A dense state has almost no vacuum, so the pruning saves nothing (speedup near one), which
//     shows the gain is genuine sparsity, not bookkeeping. And the committed creating rule (peace makes a pair)
//     has a LIVE vacuum, so activity pruning does NOT apply to it, reported honestly rather than hidden.
//
// So the engine routes information through a maximally sparse, one-hot, local attention pattern, and the activity
// pruning is an exact optimization on vacuum-fixed rules with a measured speedup that vanishes on a dense state.
// L1, an engineering equivalence (the pruned update reproduces the full sweep bit-for-bit) with a measured cost.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import {
  cloneWill,
  makeWill,
  fillWillPattern,
  gliderLine,
} from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import {
  isOneHotRouting,
  vacuumIsFixed,
  attentionBeat,
} from '@/code/rule/attention'

const sameData = (a: Int8Array, b: Int8Array): boolean => {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

export default experiment({
  id: 'computation/sparse-attention-update',
  code: 'E-CMP-0014',
  title:
    'the reversible rule is a sparse one-hot local-attention update, with exact activity pruning on vacuum-fixed rules (speedup vanishes on a dense state, and the creating rule has a live vacuum)',
  category: 'computation',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: 8 })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const rule = headOnRotate({ opposite })
    const beats = 5

    // the attention pattern is one-hot (each output slot reads exactly one input slot)
    const oneHot = isOneHotRouting(mesh)

    // the vacuum-fixed rule admits exact activity pruning
    const vacuumFixed = vacuumIsFixed(rule, mesh.degree)

    // a sparse state, a short glider, almost all cells are vacuum
    const sparse = gliderLine({
      mesh,
      start: 0,
      direction: 0,
      tone: 1,
      length: 4,
    }).will

    // full sweep, the reference
    let full = cloneWill(sparse)

    for (let step = 0; step < beats; step++) {
      full = beat(full, rule)
    }

    // attention update with activity pruning, count the collide ops
    let attn = cloneWill(sparse)
    let sparseOps = 0

    for (let step = 0; step < beats; step++) {
      const result = attentionBeat({ will: attn, collision: rule })

      attn = result.will
      sparseOps += result.collideOps
    }

    const identical = sameData(full.data, attn.data)
    const fullOps = mesh.cellCount * beats
    const sparseSpeedup = fullOps / Math.max(sparseOps, 1)
    const sparseFastEnough = sparseSpeedup > 10

    // the dense control, almost no vacuum, so pruning saves nothing
    const dense = makeWill(mesh)

    fillWillPattern(dense)

    let denseFull = cloneWill(dense)
    let denseAttn = cloneWill(dense)
    let denseOps = 0

    for (let step = 0; step < beats; step++) {
      denseFull = beat(denseFull, rule)

      const result = attentionBeat({ will: denseAttn, collision: rule })

      denseAttn = result.will
      denseOps += result.collideOps
    }

    const denseIdentical = sameData(denseFull.data, denseAttn.data)
    const denseSpeedup = fullOps / Math.max(denseOps, 1)
    const denseNoGain = denseSpeedup < 1.2

    // the creating-rule control, its vacuum is alive, so pruning does NOT apply
    const creatingRule = pairCollision({ opposite })
    const creatingVacuumLive = !vacuumIsFixed(creatingRule, mesh.degree)

    const ok =
      oneHot &&
      vacuumFixed &&
      identical &&
      sparseFastEnough &&
      denseIdentical &&
      denseNoGain &&
      creatingVacuumLive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible rule engine is a sparse local-attention update. In the stream every output slot reads exactly one input slot, so the routing is one-hot per row, an O(cells x degree) gather rather than an O(cells^2) all-pairs sweep. For a vacuum-fixed rule (here head-on rotate) the collide work prunes exactly to the active (non-vacuum) cells, so on a sparse glider the pruned update is bit-identical to the full sweep with a large speedup. The dense control has almost no vacuum, so the speedup falls to near one, showing the gain is real sparsity. The committed creating rule (peace makes a pair) has a live vacuum, so activity pruning does not apply to it, stated honestly. The transformer vocabulary maps cleanly: embedding is a cell token (its slots as a base-3 key), attention is the one-hot stream pattern, logits are the collided slots before the stream routes them.',
      metrics: {
        oneHotRouting: oneHot ? 1 : 0,
        vacuumFixed: vacuumFixed ? 1 : 0,
        identical: identical ? 1 : 0,
        sparseOps,
        fullOps,
        sparseSpeedup: Number(sparseSpeedup.toFixed(1)),
        denseOps,
        denseSpeedup: Number(denseSpeedup.toFixed(2)),
        creatingVacuumLive: creatingVacuumLive ? 1 : 0,
      },
      control: {
        denseSpeedup: Number(denseSpeedup.toFixed(2)),
        denseIdentical: denseIdentical ? 1 : 0,
        creatingVacuumLive: creatingVacuumLive ? 1 : 0,
      },
      notes:
        'the speedup is collide-op count of the full sweep (cells times beats) over the pruned count (active cells summed over beats). On the sparse glider almost every cell is vacuum, so the pruned update collides only a handful per beat, an exact match to the full sweep because head-on rotate fixes the vacuum. The dense state (fillWillPattern, every cell non-vacuum) gives speedup near one, the honest control that the gain is sparsity. The committed pair rule creates from vacuum, so its vacuum is not a fixed point and activity pruning is invalid for it, a real limit reported rather than hidden. The active set is rescanned here for measurement, a production engine maintains the active frontier incrementally as charges stream.',
    })
  },
})
