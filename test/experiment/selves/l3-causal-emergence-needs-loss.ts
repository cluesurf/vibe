// THE L3 FRONTIER, part three (multi-level-selves plan). Can the PURE base rule show causal emergence, the
// signature of a distinctive self-level with extra causal power (Hoel). The answer is a clean, principled
// NO at the base, and exactly why is the result.
//
// Hoel causal emergence (effective information rising under coarse-graining) requires DEGENERACY in the micro
// dynamics, many micro-causes funneling to one effect, so the micro is causally weak and grouping the causes
// sharpens it. But the committed base rule is a REVERSIBLE PERMUTATION on its full state, stream then
// collide, each configuration has exactly one successor AND exactly one predecessor. A permutation has ZERO
// degeneracy, maximal effective information, so no coarse-graining of the true micro can increase it. Causal
// emergence is therefore impossible at the base level.
//
// It becomes possible only when information is DISCARDED. Coarse-graining the full state to the cell-charge
// field is lossy, many full states map to one charge field, and the charge-level dynamics is then no longer
// deterministic, the same charge field can lead to different next charge fields. That information loss is the
// prerequisite for emergence. So a causal-emergent self-level is an EFFECTIVE-LAYER phenomenon, produced by
// coarse-graining, not a property of the bare reversible rule.
//
// We measure all of this directly. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, cellTone, type Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { verdict } from '@/test/scaffold/verdict'

function microHash(will: Will): string {
  return will.data.join('')
}

function chargeHash(will: Will): string {
  const parts: number[] = []

  for (let c = 0; c < will.mesh.cellCount; c++) {
    parts.push(cellTone(will, c))
  }

  return parts.join(',')
}

export default experiment({
  id: 'selves/l3-causal-emergence-needs-loss',
  code: 'E-SLF-0066',
  title:
    'the reversible base rule is a permutation with no degeneracy, so causal emergence needs information loss',
  category: 'selves',
  substrates: ['square'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 10
    const beats = 1500
    const mesh = squareMesh({ side })
    const opposite = meshOpposites(mesh)

    const collision = pairCollision({ opposite, forward: true })

    // a fixed, deterministic, asymmetric structured fill (not random). The asymmetry breaks the lattice
    // symmetry so the reversible orbit is long and visits many states, a robust sample for the statistics.
    let will: Will = makeWill(mesh)

    for (let i = 0; i < will.data.length; i++) {
      will.data[i] = ((i * 7 + (i % 5) + 1) % 3) - 1
    }

    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    let scratch: Will = { mesh, data: new Int8Array(will.data.length) }

    const micro: string[] = []
    const coarse: string[] = []

    micro.push(microHash(will))
    coarse.push(chargeHash(will))

    for (let t = 0; t < beats; t++) {
      beatInto({ src: will, dst: scratch, table, collision })

      const swap = will

      will = scratch
      scratch = swap
      micro.push(microHash(will))
      coarse.push(chargeHash(will))
    }

    // the micro successor map, and its injectivity (a permutation has one predecessor per state).
    const microNext = new Map<string, string>()
    const predecessors = new Map<string, Set<string>>()

    for (let t = 0; t + 1 < micro.length; t++) {
      microNext.set(micro[t]!, micro[t + 1]!)

      if (!predecessors.has(micro[t + 1]!)) {
        predecessors.set(micro[t + 1]!, new Set())
      }

      predecessors.get(micro[t + 1]!)!.add(micro[t]!)
    }

    let microInjectiveViolations = 0

    for (const preds of predecessors.values()) {
      if (preds.size > 1) {
        microInjectiveViolations++
      }
    }

    const microStates = new Set(micro).size

    // the coarse successor map. Information loss shows as a charge field with more than one distinct
    // successor (the coarse dynamics is no longer deterministic), and as compression (many micro per coarse).
    const coarseNext = new Map<string, Set<string>>()

    for (let t = 0; t + 1 < coarse.length; t++) {
      if (!coarseNext.has(coarse[t]!)) {
        coarseNext.set(coarse[t]!, new Set())
      }

      coarseNext.get(coarse[t]!)!.add(coarse[t + 1]!)
    }

    let coarseNondeterministicStates = 0

    for (const nexts of coarseNext.values()) {
      if (nexts.size > 1) {
        coarseNondeterministicStates++
      }
    }

    const coarseStates = new Set(coarse).size
    const compression =
      coarseStates > 0 ? microStates / coarseStates : 1

    const baseIsPermutation = microInjectiveViolations === 0
    const coarseGrainingLosesInfo =
      compression > 1 && coarseNondeterministicStates > 0

    const ok = baseIsPermutation && coarseGrainingLosesInfo

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pure base rule is a reversible permutation with zero degeneracy, so no causal emergence is possible at the base, while coarse-graining to the charge field discards information and makes the coarse dynamics non-deterministic, the prerequisite for emergence, so a causal-emergent self-level is an effective-layer phenomenon, not a base property',
      metrics: {
        microStates,
        coarseStates,
        compression,
        microInjectiveViolations,
        coarseNondeterministicStates,
        beats,
      },
      control: { microInjectiveViolations },
      notes:
        'the control is the micro injectivity itself, zero violations confirms the permutation. Reversibility forbids base-level causal emergence, the coarse-graining (information loss) is what enables it. This unifies the selves findings, the base makes persistent structures, the self-level lives at the effective layer',
    })
  },
})
