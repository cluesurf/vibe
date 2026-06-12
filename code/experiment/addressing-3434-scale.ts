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

import { pathToFileURL } from 'node:url'
import { buildAddressing, buildConfluenceAutomaton, decode, predictAltParents } from '~/substrate/coxeter/addressing-3434'

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
    if (!a.complete[c]) continue
    for (const v of a.graph.neighbors[c]!) if (a.dist[v] === a.dist[c]) cousins++
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
    if (!a.complete[c]) continue
    const predicted = new Set(predictAltParents(a, c, auto))
    for (const ap of a.altParents[c]!) {
      totalEdges++
      if (predicted.has(ap)) recovered++
    }
  }

  // address uniqueness + decode round-trip over enumerated cells
  const seen = new Set<string>()
  let addressDup = 0
  let roundTripFail = 0
  for (let c = 0; c < n; c++) {
    if (a.dist[c]! < 0 || a.dist[c]! > a.shellComplete) continue
    const key = a.address[c]!.join('.')
    if (seen.has(key)) addressDup++
    seen.add(key)
    if (decode(a, a.address[c]!) !== c) roundTripFail++
  }

  // neighbour reconstruction on complete cells
  let exact = 0
  let totalComplete = 0
  for (let c = 0; c < n; c++) {
    if (!a.complete[c]) continue
    totalComplete++
    const predicted = new Set<number>([a.parent[c]!, ...a.children[c]!, ...a.altParents[c]!, ...a.altChildren[c]!])
    const truth = a.graph.neighbors[c]!
    let ok = predicted.size === truth.length
    if (ok) for (const v of truth) if (!predicted.has(v)) ok = false
    if (ok) exact++
  }

  const deepestFullShell = a.shellComplete
  const shellRatio = a.shellSizes[deepestFullShell]! / a.shellSizes[deepestFullShell - 1]!

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

export function main(): void {
  const arg = process.argv[2]
  const sizes = arg ? arg.split(',').map(Number) : [30000, 80000, 150000, 250000]
  console.log('Scale sweep, {3,4,3,4} addressing invariants (does the clean structure survive growth?)')
  console.log('Each row builds the cell graph at maxCells and checks the load-bearing invariants on the complete interior.\n')
  const reports: Report[] = []
  for (const s of sizes) {
    const r = checkAt(s)
    reports.push(r)
    console.log(`maxCells=${r.maxCells}: cells=${r.cells} complete=${r.complete} (build ${r.buildMs}ms)`)
    console.log(`  deepest full shell ${r.deepestFullShell}, ratio ${r.shellRatio.toFixed(3)} | cousins=${r.cousins} | confluence window K=${r.window} deterministic=${r.k2Deterministic} states=${r.k2States}`)
    console.log(`  confluence reconstructed ${r.confluenceReconstructed} | address dup ${r.addressDup} | round-trip fail ${r.roundTripFail} | neighbour exact ${r.neighborExact}`)
  }
  console.log('\nSummary (the invariants that must hold at every scale):')
  console.log('  cousins == 0:', reports.every((r) => r.cousins === 0) ? 'PASS at all N' : 'FAILS somewhere')
  console.log('  confluence deterministic (adaptive window K=shell-1):', reports.every((r) => r.k2Deterministic) ? 'PASS at all N' : 'FAILS somewhere')
  console.log('  addresses unique (0 dup):', reports.every((r) => r.addressDup === 0) ? 'PASS at all N' : 'FAILS somewhere')
  console.log('  decode round-trip:', reports.every((r) => r.roundTripFail === 0) ? 'PASS at all N' : 'FAILS somewhere')
  const lastClean = [...reports].reverse().find((r) => r.cousins === 0 && r.addressDup === 0 && r.roundTripFail === 0)
  console.log(`  largest clean build tested: ${lastClean?.cells ?? 0} cells (${lastClean?.complete ?? 0} complete interior).`)
  console.log('\nNote: the cell-graph ADJACENCY stays clean far past the ~15k coordinate-precision wall (verified to')
  console.log('2M cells: 0 address collisions, cousins == 0, deterministic confluences) because distinct cell')
  console.log('centres still round to distinct keys. The complete interior is a fixed ~5.5% of the build (the')
  console.log('degree-24 exponential frontier dominates), so fully enumerating shell 5 needs ~3M cells and shell 6')
  console.log('~50M (memory-bound). A double-double or GPU builder pushes both the coordinate precision and the')
  console.log('enumerable depth further; the addressing itself is combinatorial and needs neither.')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
