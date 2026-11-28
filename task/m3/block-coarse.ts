// Batch driver: the E-CMP-0066 block coarse-graining with its enumeration cap, block
// sizes and coarse steps as flags, to decide the cases the smaller run left at 'cap' and to add b = 4 contracts and tau 3.
//
//   pnpm call task/batch/block-coarse.ts [--cap 3^12] [--taus 1,2] [--lump-blocks 2,3,4] [--contract-blocks 2,3]
//                                     [--contracts true] [--only id.ABC.id,...] [--schedules brick2,...]
//
// With no flags it reads exactly E-CMP-0066's cases and prints its metrics. Every lumpability case whose fine window
// is wider than 12 cells (the ones a 3^12 cap can leave undecided) is logged with its verdict, and the closing
// SUMMARY line holds the metrics and those rows.
import { LINE_SCHEDULES } from '@/code/compute/lab/coarse-block'
import { blockCoarseGraining } from '@/test/experiment/computation/block-coarse-graining'
import { flags, intFlag, intListFlag, listFlag, seconds, summary } from './args'

const f = flags()
const cap = intFlag(f, 'cap', 3 ** 12)
const taus = intListFlag(f, 'taus', [1, 2])
const lumpBlocks = intListFlag(f, 'lump-blocks', [2, 3, 4])
const contractBlocks = intListFlag(f, 'contract-blocks', [2, 3])
const contracts = f.get('contracts') !== 'false'
const only = f.has('only') ? listFlag(f, 'only', []) : undefined
const scheduleNames = listFlag(f, 'schedules', LINE_SCHEDULES.map(s => s.name))
const schedules = LINE_SCHEDULES.filter(s => scheduleNames.includes(s.name))
const start = performance.now()

console.log(
  `cap ${cap}, taus ${taus.join(',')}, lump blocks ${lumpBlocks.join(',')}, contract blocks ${contractBlocks.join(',')}, contracts ${contracts}, schedules ${schedules.map(s => s.name).join(',')}${only ? `, only ${only.join(',')}` : ''}`,
)

const r = blockCoarseGraining({ schedules, taus, contracts, cap, lumpBlocks, contractBlocks, only })
const wide = r.lump.filter(x => x.windowCells > 12)

for (const x of wide) {
  console.log(
    [x.rule, x.schedule, `b${x.b}`, `o${x.offset}`, `t${x.tau}`, x.map, `w${x.windowCells}`, x.verdict, x.effective ?? '', `read ${x.windowsRead}`, x.byNegation ? 'by negation' : ''].join(' | '),
  )
}

const lumpable = r.lump.filter(x => x.verdict === 'lumpable')
const caps = r.lump.filter(x => x.verdict === 'cap')
const pairNamed = r.nontrivial.filter(x => x.effective.startsWith('pair'))
const metrics = {
  lumpCases: r.lump.length,
  lumpable: lumpable.length,
  lumpableNonIdentity: lumpable.filter(x => x.rule !== 'id.ABC.id').length,
  spinLumpableNontrivial: lumpable.filter(x => x.family === 'spin1' && x.effective !== 'identity').length,
  notLumpable: r.lump.filter(x => x.verdict === 'not').length,
  cap: caps.length,
  spinCaps: caps.filter(x => x.family === 'spin1' && x.rule !== 'id.ABC.id').length,
  contractGroups: r.groups.length,
  sectionsTested: r.groups.reduce((s, g) => s + g.sectionsTested, 0),
  contracts: r.groups.reduce((s, g) => s + g.contracts, 0),
  nontrivialContracts: r.nontrivial.length,
  pairNamedContracts: pairNamed.length,
  fixedPoints: r.nontrivial.filter(x => x.fixedPoint).length,
  newSpeedContracts: r.nontrivial.filter(x => x.speedNew === true).length,
  newConservedContracts: r.nontrivial.filter(x => x.newConserved.length > 0).length,
  ringCheckedContracts: r.ringChecks.contracts,
  ringConfigs: r.ringChecks.configs,
  ringMismatches: r.ringChecks.mismatches,
  capDecidedByNegation: r.lump.filter(x => x.byNegation).length,
  witnessesUnchecked: r.lump.filter(x => x.witness !== null && x.witnessChecked !== true).length,
}

console.log(JSON.stringify(metrics))
summary({
  driver: 'block-coarse',
  cap,
  taus,
  lumpBlocks,
  contractBlocks,
  seconds: seconds(start),
  metrics,
  wide: wide.map(x => ({
    rule: x.rule,
    schedule: x.schedule,
    b: x.b,
    offset: x.offset,
    tau: x.tau,
    map: x.map,
    windowCells: x.windowCells,
    verdict: x.verdict,
    effective: x.effective,
    witness: x.witness,
    byNegation: x.byNegation ?? false,
  })),
  nontrivial: r.nontrivial.filter(x => x.b > 3 || x.tau > 2),
})
