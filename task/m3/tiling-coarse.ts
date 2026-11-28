// M3 driver (item vibe-computation-models-0070): the E-CMP-0069 tiling coarse-graining with the contract node budget,
// the contract steps and the bounded witness search as flags, so the tau 2 contracts can run with no class undecided
// on either side of a pair, and the lumpability search can pass 3 excitations on the radius-1 ball.
//
//   pnpm call task/m3/tiling-coarse.ts [--contract-taus 1] [--budget 400000] [--ball1 3] [--ball2 2]
//                                      [--pairs 4.4/4.5,6.3/6.4,3.6/3.7] [--variants 0,1] [--orientations radial,lifted]
//                                      [--contracts true]
//
// With no flags it reads exactly E-CMP-0069's cases and prints its metrics. The closing SUMMARY line holds the
// metrics, the contract counts per side, variant, step and kind, the undecided classes per tiling, and every lump row
// that is not decided ('clean').
import { Orientation } from '@/code/compute/lab/coarse-tiling'
import { tilingCoarseGraining } from '@/test/experiment/computation/tiling-coarse-graining'
import { flags, intFlag, intListFlag, listFlag, seconds, summary } from './args'

const f = flags()
const contractTaus = intListFlag(f, 'contract-taus', [1])
const contractBudget = intFlag(f, 'budget', 400_000)
const searchBall1 = intFlag(f, 'ball1', 3)
const searchBall2 = intFlag(f, 'ball2', 2)
const contracts = f.get('contracts') !== 'false'
const variants = intListFlag(f, 'variants', [0, 1])
const orientations = listFlag(f, 'orientations', ['radial', 'lifted']) as Orientation[]
const pairNames = listFlag(f, 'pairs', ['4.4/4.5', '6.3/6.4', '3.6/3.7'])
const pairs = pairNames.map(name => {
  const [flat, hyperbolic] = name.split('/').map(t => t.split('.').map(Number) as [number, number]) as [[number, number], [number, number]]

  return { flat, hyperbolic }
})
const start = performance.now()

console.log(
  `contract taus ${contractTaus.join(',')}, budget ${contractBudget}, search ${searchBall1} on ball 1 and ${searchBall2} on ball 2, pairs ${pairNames.join(',')}, variants ${variants.join(',')}, orientations ${orientations.join(',')}, contracts ${contracts}`,
)

const r = tilingCoarseGraining({
  pairs,
  contracts,
  variants,
  orientations,
  knobs: { contractTaus, contractBudget, searchBall1, searchBall2 },
})

const countBy = <T>(xs: readonly T[], key: (x: T) => string): Record<string, number> => {
  const out: Record<string, number> = {}

  for (const x of xs) {
    out[key(x)] = (out[key(x)] ?? 0) + 1
  }

  return out
}

const s = r.stats
const transportBySide = countBy(
  r.lump.filter(x => x.how === 'transport'),
  x => x.side,
)
const readMaps = new Set(['majority', 'netSign', 'netResidue'])
const readNotNot = r.lump.filter(x => x.representative !== 'id.ABC.id' && readMaps.has(x.map) && x.verdict !== 'not')
const kept = countBy(
  r.splits.filter(x => !x.split),
  x => x.side,
)
const metrics = {
  quotientClasses: s.classes,
  blockingTauCases: r.splits.length,
  keptFlat: kept.flat ?? 0,
  keptHyperbolic: kept.hyperbolic ?? 0,
  lumpRows: r.lump.length,
  notTheorem: r.lump.filter(x => x.how === 'theorem').length,
  notSearch: r.lump.filter(x => x.how === 'search').length,
  provedIdentity: r.lump.filter(x => x.how === 'identity').length,
  provedOccupancy: r.lump.filter(x => x.how === 'occupancy').length,
  provedTransportFlat: transportBySide.flat ?? 0,
  provedTransportHyperbolic: transportBySide.hyperbolic ?? 0,
  clean: r.lump.filter(x => x.verdict === 'clean').length,
  readingRowsNotRefused: readNotNot.length,
  trackChecks: s.trackChecks,
  trackFailures: s.trackFailures,
  theoremSplits: s.theoremSplits,
  theoremUnconfirmed: s.theoremUnconfirmed,
  witnesses: s.witnesses,
  witnessFailures: s.witnessFailures,
  provedContradictions: s.provedContradictions,
  contractGroups: r.groups.length,
  sectionsTested: r.groups.reduce((n, g) => n + g.tested, 0),
  contracts: r.contracts.length,
  nonIdentityContracts: r.contracts.filter(x => x.kind !== 'identity').length,
  onsiteContracts: r.contracts.filter(x => x.kind === 'onsite').length,
  transportContracts: r.contracts.filter(x => x.kind === 'transport').length,
  localContracts: r.contracts.filter(x => x.kind === 'local').length,
  transportOffLoneTrack: r.contracts.filter(x => x.kind === 'transport' && x.loneSpeed === false).length,
  contractCaps: r.groups.reduce((n, g) => n + g.caps, 0),
  denseContractChecks: s.denseChecks,
  denseContractMismatches: s.denseMismatches,
  identityControlFailures: s.identityControlFailures,
}
const capsByTiling: Record<string, number> = {}

for (const g of r.groups) {
  const key = `${g.tiling} v${g.variant} t${g.tau}`

  capsByTiling[key] = (capsByTiling[key] ?? 0) + g.caps
}

console.log(JSON.stringify(metrics))
console.log(`caps per tiling ${JSON.stringify(capsByTiling)}`)
console.log(`contracts per side ${JSON.stringify(countBy(r.contracts, x => `${x.tiling} ${x.side} v${x.variant} t${x.tau} ${x.kind}`))}`)
summary({
  item: 'vibe-computation-models-0070',
  knobs: { contractTaus, contractBudget, searchBall1, searchBall2 },
  pairs: pairNames,
  variants,
  orientations,
  seconds: seconds(start),
  metrics,
  capsByTiling,
  contractsBySide: countBy(r.contracts, x => `${x.tiling} ${x.side} v${x.variant} t${x.tau} ${x.kind}`),
  clean: r.lump
    .filter(x => x.verdict === 'clean')
    .map(x => `${x.tiling} v${x.variant} ${x.orientation} ${x.rule} ${x.blocking} t${x.tau} ${x.map}`),
})
