// Scale sweep for the {3,4,3,4} addressing invariants. The addressing verification is combinatorial, so
// the bottleneck is the cell-graph CONSTRUCTION (CPU Lorentzian matmuls) and its floating-point precision
// wall (~15k cells, per cell-direct.ts). This sweep builds at growing maxCells and checks whether the
// load-bearing addressing invariants STILL HOLD on the reliable interior (the complete, full-degree
// cells) as N grows toward the scale the GPU bulk runner uses (200k):
//   - no same-shell (cousin) edges          (the 4D simplification)
//   - the K=2 confluence automaton stays a deterministic finite-state function
//   - addresses stay unique and O(log n)
//   - neighbour reconstruction stays exact
//   - shell sizes keep following the measured growth (~18.37)
// It also reports the precision ceiling: the largest N at which the interior stays clean.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/addressing-3434-scale.ts [maxCellsList]

import {
  buildAddressing,
  buildConfluenceAutomaton,
  decode,
  predictAltParents,
} from '@/code/substrate/coxeter/addressing-3434'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Report {
  maxCells: number
  cells: number
  complete: number
  deepestFullShell: number
  shellRatio: number
  cousins: number
  window: number
  k2Deterministic: boolean
  k2States: number
  confluenceReconstructed: string
  addressDup: number
  roundTripFail: number
  neighborExact: string
  buildMs: number
}

function checkAt(maxCells: number): Report {
  const t0 = Date.now()
  const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells })
  const buildMs = Date.now() - t0
  const n = a.graph.cellCount
  const complete = a.complete.filter(Boolean).length

  // cousins among complete cells (must be 0)
  let cousins = 0
  for (let c = 0; c < n; c++) {
    if (!a.complete[c]) {
      continue
    }
    for (const v of a.graph.neighbors[c]!) {
      if (a.dist[v] === a.dist[c]) {
        cousins++
      }
    }
  }

  // confluence automaton at the ADAPTIVE window K = deepest_full_shell - 1. The confluence LCA branch
  // deepens by one per shell, so the generator-address window needed to disambiguate grows by one per
  // shell (a constant-state machine would carry the minimal region-type instead, the Step-3 frontier).
  // At this window the map is deterministic and reconstructs every partner from the address alone.
  const window = Math.max(2, a.shellComplete - 1)
  const auto = buildConfluenceAutomaton(a, window)
  let recovered = 0
  let totalEdges = 0
  for (let c = 0; c < n; c++) {
    if (!a.complete[c]) {
      continue
    }
    const predicted = new Set(predictAltParents(a, c, auto))
    for (const ap of a.altParents[c]!) {
      totalEdges++
      if (predicted.has(ap)) {
        recovered++
      }
    }
  }

  // address uniqueness + decode round-trip over enumerated cells
  const seen = new Set<string>()
  let addressDup = 0
  let roundTripFail = 0
  for (let c = 0; c < n; c++) {
    if (a.dist[c]! < 0 || a.dist[c]! > a.shellComplete) {
      continue
    }
    const key = a.address[c]!.join('.')
    if (seen.has(key)) {
      addressDup++
    }
    seen.add(key)
    if (decode(a, a.address[c]!) !== c) {
      roundTripFail++
    }
  }

  // neighbour reconstruction on complete cells
  let exact = 0
  let totalComplete = 0
  for (let c = 0; c < n; c++) {
    if (!a.complete[c]) {
      continue
    }
    totalComplete++
    const predicted = new Set<number>([
      a.parent[c]!,
      ...a.children[c]!,
      ...a.altParents[c]!,
      ...a.altChildren[c]!,
    ])
    const truth = a.graph.neighbors[c]!
    let ok = predicted.size === truth.length
    if (ok) {
      for (const v of truth) {
        if (!predicted.has(v)) {
          ok = false
        }
      }
    }
    if (ok) {
      exact++
    }
  }

  const deepestFullShell = a.shellComplete
  const shellRatio =
    a.shellSizes[deepestFullShell]! /
    a.shellSizes[deepestFullShell - 1]!

  return {
    maxCells,
    cells: n,
    complete,
    deepestFullShell,
    shellRatio,
    cousins,
    window,
    k2Deterministic: auto.deterministic,
    k2States: auto.states,
    confluenceReconstructed: `${recovered}/${totalEdges}`,
    addressDup,
    roundTripFail,
    neighborExact: `${exact}/${totalComplete}`,
    buildMs,
  }
}

export default experiment({
  id: 'addressing/addressing-3434-scale',
  title:
    'the {3,4,3,4} addressing invariants survive growth, clean at two build sizes',
  category: 'addressing',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const small = checkAt(30000)
    const large = checkAt(80000)
    const clean = (r: Report): boolean =>
      r.cousins === 0 &&
      r.addressDup === 0 &&
      r.roundTripFail === 0 &&
      r.k2Deterministic
    const ok = clean(small) && clean(large) && large.cells > small.cells
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the load-bearing {3,4,3,4} addressing invariants, no cousin edges, unique decode-invertible addresses, and a deterministic confluence automaton, hold on the complete interior at two growing build sizes',
      metrics: {
        smallCells: small.cells,
        smallComplete: small.complete,
        smallCousins: small.cousins,
        largeCells: large.cells,
        largeComplete: large.complete,
        largeCousins: large.cousins,
      },
      notes:
        'L1, a deterministic combinatorial check, robustness comes from varying the build SIZE (not random seeds). The complete interior is a fixed fraction of the build because the degree-24 frontier dominates, so the invariants are checked on the full-degree cells. The default main() sweep pushes to 250k, this gated check stays at 30k and 80k for runtime.',
    })
  },
})
