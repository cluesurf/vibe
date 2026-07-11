// P179: autonomous (autopoietic) self-maintenance, the self repairs itself with no outside knower. (P178, P116, P113.)
//
// P178's maintenance still cheated in one way, it iterated a GLOBAL list of the self's target cells, an
// outside operator that knew where the self's body should be. This removes that hand. The repair is a LOCAL
// rule, each cell looks only at its own neighborhood, and a cell that is locally interior to a self (a hole
// surrounded by same-sign charge) completes itself, by the arrow's balanced creation. No global target list is
// ever consulted. The self's cell list is used only to MEASURE fidelity.
//
// Honest scope (June 2026 audit): the repair rule and the cohesion 0.22 hop bias are ADDED maintenance
// ingredients beyond the base rule, so this is L2, an added-mechanism demonstration, not a base-emergence
// result. And the original single-seed pass (fidelity 0.6057 over a 0.6 bar) was a knife-edge, under harmless
// seed and size perturbations the fidelity ranges roughly 0.45 to 0.61 (and drops to 0.34 at repair threshold
// 5), so the maintained-over-unmaintained gap is real but does not robustly clear the old bar. The verdict is
// set from the measured range across 3 seed pairs and 2 sizes, all deterministic seeded.

import {
  bulkGraph,
  beat,
  emergeSelf,
  countPlus,
  totalCharge,
  sameSignNeighbors,
  type Graph,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the autonomous repair, purely local. It NEVER reads the self's cell list, only each cell's neighborhood.
// A hole locally interior to a +self (many +neighbors, not outnumbered by -) completes to +1, balanced by a
// -1 placed at a quiet empty cell (few +neighbors), a conserving local creation.
function autonomousRepair(
  tone: Int8Array,
  g: Graph,
  rng: { next: () => number },
  threshold: number,
): number {
  const N = tone.length

  let work = 0
  let netAdded = 0

  for (let c = 0; c < N; c++) {
    if (tone[c] === 1) continue

    const plus = sameSignNeighbors(tone, g, c, 1)
    const minus = sameSignNeighbors(tone, g, c, -1)

    if (plus >= threshold && plus > minus) {
      netAdded += 1 - tone[c]!
      tone[c] = 1
      work++
    }
  }

  // dump the exact balancing -1 into quiet empty cells (few +neighbors), a conserving local creation
  let need = netAdded
  let guard = 0

  while (need > 0 && guard < N * 4) {
    guard++

    const e = Math.floor(rng.next() * N)

    if (tone[e] === 0 && sameSignNeighbors(tone, g, e, 1) < 2) {
      tone[e] = -1
      need--
    }
  }

  return work
}

export function autonomousSelf(input?: {
  n?: number
  emergeSeed?: number
  decaySeed?: number
  threshold?: number
}): {
  n: number
  emergent: number
  maintainedFidelity: number
  unmaintainedFidelity: number
  conserved: boolean
  workPerBeat: number
} {
  const n = input?.n ?? 20000
  const emergeSeed = input?.emergeSeed ?? 11
  const decaySeed = input?.decaySeed ?? 41
  const threshold = input?.threshold ?? 4
  const g = bulkGraph(n)
  const moved = new Uint8Array(g.cellCount)
  const rng = makeRng({ seed: emergeSeed })
  const { tone, cluster } = emergeSelf(g, rng, moved)
  const emergent = cluster.length

  // the self's cells are used ONLY to MEASURE fidelity, never by the repair rule itself
  const run = (
    maintaining: boolean,
  ): { fidelity: number; work: number; q: number } => {
    const t2 = tone.slice()
    const q0 = totalCharge(t2)
    const rng2 = makeRng({ seed: decaySeed })

    let work = 0

    const beats = 60

    for (let b = 0; b < beats; b++) {
      if (maintaining) work += autonomousRepair(t2, g, rng2, threshold)

      beat(t2, g, moved, rng2, 0, 0.22)
    }

    return {
      fidelity: countPlus(t2, cluster) / cluster.length,
      work: work / beats,
      q: totalCharge(t2) - q0,
    }
  }

  const maintained = run(true)
  const unmaintained = run(false)

  return {
    n: g.cellCount,
    emergent,
    maintainedFidelity: maintained.fidelity,
    unmaintainedFidelity: unmaintained.fidelity,
    conserved: maintained.q === 0,
    workPerBeat: maintained.work,
  }
}

export default experiment({
  id: 'selves/autonomous-self',
  code: 'E-SLF-0007',
  title:
    'a purely local repair rule raises the self fidelity over the unmaintained control, but not robustly over a 0.6 bar',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    // the perturbation set, 3 seed pairs and 2 sizes, all deterministic seeded
    const cases = [
      { n: 20000, emergeSeed: 11, decaySeed: 41 },
      { n: 20000, emergeSeed: 12, decaySeed: 41 },
      { n: 20000, emergeSeed: 11, decaySeed: 43 },
      { n: 24000, emergeSeed: 11, decaySeed: 41 },
    ]

    const runs = cases.map(c => autonomousSelf(c))
    const fidelities = runs.map(r => r.maintainedFidelity)
    const gaps = runs.map(
      r => r.maintainedFidelity - r.unmaintainedFidelity,
    )

    const minFidelity = Math.min(...fidelities)
    const maxFidelity = Math.max(...fidelities)
    const minGap = Math.min(...gaps)
    const allConserved = runs.every(r => r.conserved)

    // a stricter repair threshold, reported to document the sensitivity, not part of the range verdict
    const strict = autonomousSelf({
      n: 20000,
      emergeSeed: 11,
      decaySeed: 41,
      threshold: 5,
    })

    // the repair always helps (a positive gap in every run) and charge is exactly conserved, but the
    // fidelity does not robustly clear the 0.6 bar across the set, so the verdict is partial
    const alwaysHelps = minGap > 0.1
    const robustOverBar = minFidelity > 0.6 && minGap > 0.3

    const status = !(alwaysHelps && allConserved)
      ? 'fail'
      : robustOverBar
        ? 'pass'
        : 'partial'

    const committed = runs[0]!

    return verdict({
      status,
      claim:
        'a purely local repair rule that reads only each cell own neighborhood raises the self fidelity over the unmaintained control in every seeded perturbation with charge exactly conserved, but the effect is not robust over the old 0.6 fidelity bar, the maintained fidelity ranges from about 0.45 to 0.61 across 3 seed pairs and 2 sizes, so the result is a real but knife-edge maintenance gain from an added local mechanism',
      metrics: {
        minMaintainedFidelity: minFidelity,
        maxMaintainedFidelity: maxFidelity,
        minMaintainedMinusUnmaintainedGap: minGap,
        thresholdFiveFidelity: strict.maintainedFidelity,
        committedMaintainedFidelity: committed.maintainedFidelity,
        workPerBeat: committed.workPerBeat,
        conserved: allConserved ? 1 : 0,
      },
      control: {
        committedUnmaintainedFidelity: committed.unmaintainedFidelity,
      },
      notes:
        'partial by the June 2026 audit, the original 0.6057 pass rode a 0.6 bar and fails under every harmless perturbation (emergence seed 12 gives about 0.45, decay seed 43 about 0.59, n=24000 about 0.58, repair threshold 5 about 0.34). The repair rule reads only per-cell neighborhoods (a property of its code, no global target list is consulted), but autonomousRepair plus the cohesion 0.22 hop bias are ADDED maintenance ingredients beyond the base rule, so this is L2, not base emergence. Prior art: Toom self-stabilizing cellular automata (local majority rules that repair a phase against noise)',
    })
  },
})
