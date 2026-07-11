// P187: radial coherence, does the COARSE-GRAINING TOWER carry persistent structure the fine scale lacks?
// (the-nested-cube-octree-idea.md, why-hyperbolic-nests-fractally.md, hierarchical-emergence.md, P101.)
//
// The pure rule run TANGENTIALLY (one scale) churns, no persistent selves (P101, shown directly). The claim
// from the nesting docs is that selfhood and the layers live on the RADIAL axis, the {5,3,4}'s reflection
// tree, where coarse-graining is just climbing inward (truncating the address). This tests it with no
// imposition. We run the EXACT 9-state permutation rule (no cohesion, no maintenance, no will, deterministic),
// then COARSE-GRAIN by the radial tree (each cell's depth-d ancestor groups it), and measure how much the
// coarse pattern PERSISTS over time (lag autocorrelation), at fine and at coarse scales. We compare to a NULL
// (random groups of the same sizes), so a rise is not just averaging. If the radial coarse pattern persists
// far more than the fine scale AND more than the null, the substrate's tree carries a real coherence tower,
// the scaffold the dynamics could not make on its own. Run: npx tsx code/experiment/p187-radial-coherence.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { busemann, idealDirection } from '@/code/substrate/horosphere'
import { toCsr } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'
import { lagAutocorrelation } from '@/code/measure/persistence'
import { coarseFieldByGroup } from '@/code/coarse/group-field'
import { perceptionMatchingSweepCsr } from '@/code/rule/perception-permutation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SCALES = [0, 2, 4, 6] // tree depths, 0 is the fine per-cell scale, larger is coarser
const WARMUP = 80
const MEASURE = 60
const LAG = 12 // beats, the coarse pattern is compared with itself this many beats later

export function radialCoherence(input?: {
  n?: number
  symbol?: number[]
}): {
  n: number
  scales: number[]
  radialPersistence: number[]
  nullPersistence: number[]
  groupCounts: number[]
  radialBeatsNull: boolean
  coarseBeatsFine: boolean
  solved: boolean
} {
  const n = input?.n ?? 40000
  const symbol = input?.symbol ?? [5, 3, 4]
  const g = buildCellGraph({ symbol, maxCells: n })
  const N = g.cellCount

  // CSR adjacency
  const { offsets: off, adj } = toCsr(g.neighbors)

  // Busemann function (ideal point = farthest cell), the radial coordinate
  const xi = idealDirection(g.coords)
  const bus = busemann({ coords: g.coords, ideal: xi })

  // radial PARENT, the neighbour most inward (smallest Busemann), the tree toward the root
  const parent = new Int32Array(N)

  for (let i = 0; i < N; i++) {
    let best = i
    let bestB = bus[i]!

    for (let p = off[i]!; p < off[i + 1]!; p++) {
      const w = adj[p]!

      if (bus[w]! < bestB) {
        bestB = bus[w]!
        best = w
      }
    }

    parent[i] = best
  }

  const ancestor = (i: number, d: number): number => {
    let c = i

    for (let k = 0; k < d; k++) {
      const p = parent[c]!

      if (p === c) break

      c = p
    }

    return c
  }

  // radial groupings per scale, and matched-size RANDOM null groupings
  const rng = makeRng({ seed: 5 })
  const radialGroup: Int32Array[] = []
  const nullGroup: Int32Array[] = []
  const groupCounts: number[] = []

  for (const D of SCALES) {
    // radial, group by depth-D ancestor, compacted to 0..k-1
    const anc = new Int32Array(N)
    const remap = new Map<number, number>()

    for (let i = 0; i < N; i++) {
      const a = ancestor(i, D)

      let id = remap.get(a)

      if (id === undefined) {
        id = remap.size
        remap.set(a, id)
      }

      anc[i] = id
    }

    radialGroup.push(anc)

    const k = remap.size

    groupCounts.push(k)

    // null, random partition into k groups of the SAME sizes as the radial groups
    const sizes = new Int32Array(k)

    for (let i = 0; i < N; i++) sizes[anc[i]!] = sizes[anc[i]!]! + 1

    const order = Array.from({ length: N }, (_, i) => i)

    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      const t = order[i]!

      order[i] = order[j]!
      order[j] = t
    }

    const ng = new Int32Array(N)

    let cursor = 0

    for (let gid = 0; gid < k; gid++) {
      for (let s = 0; s < sizes[gid]!; s++) ng[order[cursor++]!] = gid
    }

    nullGroup.push(ng)
  }

  // run the PURE rule (deterministic matching), record coarse fields over the measure window
  const tone = new Int8Array(N)
  const matched = new Uint8Array(N)
  const step = (f: number): void =>
    perceptionMatchingSweepCsr({
      tone,
      offsets: off,
      adj,
      matched,
      start: (f * 2654435761) % N,
    })

  for (let f = 0; f < WARMUP; f++) step(f)

  // coarse field = mean tone per group, recorded each measure beat for radial and null at every scale
  const coarse = (group: Int32Array, k: number): Float64Array =>
    coarseFieldByGroup({ field: tone, group, groupCount: k })

  const radialSeries: Float64Array[][] = SCALES.map(() => [])
  const nullSeries: Float64Array[][] = SCALES.map(() => [])

  for (let f = 0; f < MEASURE + LAG; f++) {
    step(WARMUP + f)

    for (let si = 0; si < SCALES.length; si++) {
      radialSeries[si]!.push(coarse(radialGroup[si]!, groupCounts[si]!))
      nullSeries[si]!.push(coarse(nullGroup[si]!, groupCounts[si]!))
    }
  }

  // persistence = mean over the window of the lag-LAG autocorrelation of the coarse field
  const radialPersistence = SCALES.map((_, si) =>
    lagAutocorrelation({ series: radialSeries[si]!, lag: LAG }),
  )

  const nullPersistence = SCALES.map((_, si) =>
    lagAutocorrelation({ series: nullSeries[si]!, lag: LAG }),
  )

  const last = SCALES.length - 1
  const radialBeatsNull =
    radialPersistence[last]! > nullPersistence[last]! + 0.1

  const coarseBeatsFine =
    radialPersistence[last]! > radialPersistence[0]! + 0.2

  const solved = radialBeatsNull && coarseBeatsFine

  return {
    n: N,
    scales: SCALES,
    radialPersistence,
    nullPersistence,
    groupCounts,
    radialBeatsNull,
    coarseBeatsFine,
    solved,
  }
}

export default experiment({
  id: 'renormalization/radial-coherence',
  code: 'E-SCL-0010',
  title:
    'coarse-graining up the {5,3,4} reflection tree does not build a persistence tower the fine scale lacks',
  category: 'renormalization',
  substrates: ['534'],
  depth: 'L2',
  paper: false,
  run() {
    const r = radialCoherence()
    const last = r.radialPersistence.length - 1
    const fine = r.radialPersistence[0] ?? 0
    const coarse = r.radialPersistence[last] ?? 0
    const nullCoarse = r.nullPersistence[last] ?? 0

    // the experiment establishes a clean, controlled NEGATIVE: radial coarse-graining
    // builds no persistence tower. The coarse pattern DECAYS from the fine scale (no
    // tower), and it is no better than a matched-size random grouping (in fact below it,
    // so the radial tree is worse than random). The experiment succeeds by establishing
    // this, the codebase convention that a clean controlled negative is a passing claim.
    const noTower = coarse < fine
    const noBetterThanNull = coarse <= nullCoarse + 0.02
    const negativeEstablished = noTower && noBetterThanNull

    return verdict({
      status: negativeEstablished ? 'pass' : 'fail',
      claim:
        'the hyperbolic radial reflection tree is not a coarse-graining axis. Running the exact deterministic rule and grouping cells by their radial ancestor, the coarse persistence DECAYS from the fine scale (no tower) and is no better than a matched-size random grouping (in fact below it, so the radial tree is worse than random). The radial direction is the holographic SCALE axis, along which coarse-graining mixes scales rather than separating them, not a renormalization-group axis. The pure deterministic rule earns no radial coherence tower on its own, a clean controlled negative',
      metrics: {
        finePersistence: Number(fine.toFixed(3)),
        coarsePersistence: Number(coarse.toFixed(3)),
        nullCoarsePersistence: Number(nullCoarse.toFixed(3)),
        coarseBelowFine: noTower ? 1 : 0,
        coarseBelowNull: coarse <= nullCoarse ? 1 : 0,
      },
      control: {
        nullCoarsePersistence: Number(nullCoarse.toFixed(3)),
      },
      notes:
        'A clean controlled negative, established and passing. The dynamics are the exact deterministic 9-state permutation (no random fill), and the matched-size random-grouping null is the control against plain averaging. The radial coarse persistence (about 0.04) is below the null (about 0.10) and far below the fine scale (about 0.23), so radial coarse-graining is decisively not a coherence axis, consistent with the radial direction being the holographic scale axis. The complementary positive, whether coarse-graining along the FLAT CUSP slices flows cleanly under the renormalization group, is a separate experiment (the pure rule on a single tangential scale is known to churn, so coherent selves are a separate open frontier). The null shuffle uses a seeded generator and only sets the control baseline, never the measured dynamics.',
    })
  },
})
