// F1: ATTRACTOR recall is an EMERGENT-layer capability, NOT a base-rule one. The
// content-addressable search (the CAM) rides the reversible base rule, but Hopfield
// ATTRACTOR recall needs DISSIPATION, an energy that descends to a stored prototype.
// The bare reversible, charge-conserving rule has NO attractors and CANNOT clean up a
// noisy cue. So we show two things at once. The dissipative Hopfield (emergent) layer
// relaxes a corrupted cue back to its prototype at high rate. The bare reversible rule,
// run on the SAME corrupted cue, stays near chance, it conserves charge and never
// minimizes energy. The honest negative is part of the result, not a bug.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import {
  storedPatterns,
  hebbianFills,
  hopfieldStep,
  toneOverlap,
} from '@/code/operator/hopfield'
import { makeRng } from '@/code/tool/rng'
import { scaled } from '@/test/scaffold/scale'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Flip a fraction of the sites of a pattern to make a noisy cue. Deterministic given
// the rng, so the cue set is a fixed function of (seed, fraction).
function corrupt(input: {
  pattern: Int8Array
  fraction: number
  rng: ReturnType<typeof makeRng>
}): Int8Array {
  const { pattern, fraction, rng } = input
  const out = Int8Array.from(pattern)

  for (let i = 0; i < out.length; i++) {
    if (rng.next() < fraction) {
      out[i] = -(out[i] ?? 0)
    }
  }

  return out
}

// Relax a cue under the DISSIPATIVE Hopfield dynamics. Each beat sets every cell to the
// sign of its local Hebbian field, energy descends, so the state falls into the attractor.
function hopfieldRelax(input: {
  J: Int8Array[]
  cue: Int8Array
  beats: number
}): Int8Array {
  const { J, cue, beats } = input
  const zero = new Float64Array(cue.length)

  let state = Int8Array.from(cue)

  for (let t = 0; t < beats; t++) {
    state = hopfieldStep(J, state, zero, null)
  }

  return state
}

// Run the SAME cue under the BARE reversible, charge-conserving rule (the control). We
// load the cue as a single directional slot per cell on the D4 lattice gas, beat the
// conserving pair rule, then read the cue back out from that slot. The rule streams and
// permutes charge, it has no energy and no attractors, so it cannot clean the cue.
function bareRuleRecall(input: {
  cue: Int8Array
  side: number
  beats: number
}): Int8Array {
  const { cue, side, beats } = input
  const mesh = d4Mesh({ side })
  const collision = pairCollision({
    opposite: meshOpposites(mesh),
  })

  let will = makeWill(mesh)

  const slot = 0

  for (let c = 0; c < cue.length && c < mesh.cellCount; c++) {
    will.data[c * mesh.degree + slot] = cue[c] ?? 0
  }

  for (let t = 0; t < beats; t++) {
    will = beat(will, collision)
  }

  const out = new Int8Array(cue.length)

  for (let c = 0; c < cue.length && c < mesh.cellCount; c++) {
    const v = will.data[c * mesh.degree + slot] ?? 0

    out[c] = v > 0 ? 1 : v < 0 ? -1 : (cue[c] ?? 0)
  }

  return out
}

export function hopfieldEmergentRecall(input?: {
  maxCells?: number
  patternCount?: number
  fraction?: number
  trials?: number
}): {
  size: number
  patternCount: number
  hopfieldRecall: number
  bareRecall: number
  chance: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 256
  const patternCount = input?.patternCount ?? 6
  const fraction = input?.fraction ?? 0.2
  const trials = input?.trials ?? 4
  // Size the lattice gas to a perfect 4th power that covers the cell graph, so every
  // pattern site maps to one cell of the bare rule too.
  const side = Math.ceil(Math.pow(maxCells, 1 / 4))
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const size = g.cellCount

  const patternRng = makeRng({ seed: 1 })
  const patterns = storedPatterns(patternCount, size, patternRng)
  const J = hebbianFills(patterns, size)
  const chance = 1 / patternCount

  // Recall = CLEANUP, the dynamics must remove the corruption and land back on the exact
  // prototype (overlap to the true pattern near 1). A nearest-pattern vote is too weak,
  // a lightly noised cue is already nearest its own prototype, so it cannot tell an
  // attractor apart from a rule that does nothing. The cleanup criterion is the real test.
  const clean = 0.99

  let hopHits = 0
  let bareHits = 0
  let total = 0

  for (let m = 0; m < patternCount; m++) {
    for (let k = 0; k < trials; k++) {
      const cueRng = makeRng({ seed: 100 + m * 17 + k })
      const cue = corrupt({
        pattern: patterns[m]!,
        fraction,
        rng: cueRng,
      })

      const relaxed = hopfieldRelax({ J, cue, beats: 20 })
      const bare = bareRuleRecall({ cue, side, beats: 20 })

      if (toneOverlap(relaxed, patterns[m]!) >= clean) {
        hopHits++
      }

      if (toneOverlap(bare, patterns[m]!) >= clean) {
        bareHits++
      }

      total++
    }
  }

  const hopfieldRecall = hopHits / total
  const bareRecall = bareHits / total
  // PASS, the emergent dissipative layer cleans the cue to the prototype at high rate AND
  // the bare reversible rule does NOT (it conserves charge, scrambles, never reaches the
  // fixed point). The honest negative is required, both halves must hold.
  const solved =
    hopfieldRecall > 0.85 &&
    bareRecall < 0.15 &&
    hopfieldRecall > bareRecall + 0.4

  return {
    size,
    patternCount,
    hopfieldRecall,
    bareRecall,
    chance,
    solved,
  }
}

export default experiment({
  id: 'associative/hopfield-emergent-recall',
  code: 'E-MMR-0007',
  title:
    'attractor recall works on the dissipative Hopfield layer and fails on the bare reversible rule, the honest negative',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  scales: true,
  run(context) {
    const scale = context.scale ?? 1
    const r = hopfieldEmergentRecall({ maxCells: scaled(256, scale) })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'a corrupted cue is cleaned back to its stored prototype at high rate under the DISSIPATIVE Hopfield dynamics, while the bare reversible charge-conserving rule on the same cue never reaches the prototype, attractor recall is an emergent-layer capability the base rule cannot provide',
      metrics: {
        hopfieldRecall: r.hopfieldRecall,
        bareRecall: r.bareRecall,
        chance: r.chance,
        patternCount: r.patternCount,
        size: r.size,
      },
      control: { bareRecall: r.bareRecall, chance: r.chance },
      notes:
        'AUDIT 2026-08-31: the initial condition here is a hashed or seeded pseudo-random fill (hashRand, makeRng or a sprinkling), which the methodology does not admit as a foundational initial condition. Read this as an ensemble-style claim whose robustness comes from the size sweep, not from varying seeds. Replacing the fill with a structured pattern is roadmap item 0013. ' +
        'the bare-rule recall near chance IS the honest negative, the reversible rule conserves charge and has no energy descent, so it has no attractors and cannot clean a noisy cue',
    })
  },
})
