// Batch driver: M9 slice 2 at the full size, the same code as the experiment
// E-CMP-0097 (code/compute/lab/boundary-m2-lab.ts boundarySlice), wider boxes and starts.
//
//   pnpm call task/batch/m2-boundaries.ts [--columns line,4.4,4.5,3.6,3.7,6.3,6.4] [--families z3,q2r,m1]
//                                      [--line-start 3] [--tiling-start 3] [--deltas 1,2] [--doubles true]
//                                      [--walled true] [--rules name,...] [--reproduce true]
//
// With no flags it reads exactly the experiment's slice (its BOUNDED_SIZES), so every count in its claim
// reproduces. The full-size run adds the 4D pair (--columns ...,3.4.3.3,3.4.3.4) and start size 3 on every tiling. Each cell
// prints one line; the closing SUMMARY holds the totals per family, every repairing structure, the curvature readings
// and the gate counts.
import {
  ALL_COLUMNS,
  Family,
  BOUNDED_SIZES,
  SliceSizes,
  boundarySlice,
  columnName,
  familyTotals,
  isQ2rControl,
  reproduceSlice1,
} from '@/code/compute/lab/boundary-m2-lab'
import { flags, intFlag, intListFlag, listFlag, seconds, summary } from './args'

const f = flags()
const known = new Set(['columns', 'families', 'line-start', 'tiling-start', 'deltas', 'doubles', 'walled', 'rules', 'reproduce'])

for (const name of f.keys()) {
  if (!known.has(name)) {
    throw new Error(`m2-boundaries: unknown flag --${name}`)
  }
}

const bool = (name: string, fallback: boolean): boolean => {
  const raw = f.get(name)

  if (raw === undefined) {
    return fallback
  }

  if (raw !== 'true' && raw !== 'false') {
    throw new Error(`m2-boundaries: --${name} must be true or false, got ${raw}`)
  }

  return raw === 'true'
}

const columns = listFlag(f, 'columns', BOUNDED_SIZES.columns.map(c => (c === 'line' ? c : c.slice(1, -1).split(',').join('.')))).map(columnName)

for (const c of columns) {
  if (!ALL_COLUMNS.includes(c)) {
    throw new Error(`m2-boundaries: unknown column ${c}`)
  }
}

const families = listFlag(f, 'families', BOUNDED_SIZES.families) as Family[]

for (const fam of families) {
  if (!['m1', 'z3', 'q2r'].includes(fam)) {
    throw new Error(`m2-boundaries: unknown family ${fam}`)
  }
}

const rules = f.get('rules')
const sizes: SliceSizes = {
  columns,
  families,
  lineStart: intFlag(f, 'line-start', BOUNDED_SIZES.lineStart),
  tilingStart: intFlag(f, 'tiling-start', BOUNDED_SIZES.tilingStart),
  doubles: bool('doubles', BOUNDED_SIZES.doubles),
  walled: bool('walled', BOUNDED_SIZES.walled),
  deltas: intListFlag(f, 'deltas', BOUNDED_SIZES.deltas),
  ...(rules === undefined ? {} : { rules: rules.split(',') }),
}

const t0 = performance.now()

console.log(`m2-boundaries: ${JSON.stringify(sizes)}`)

const repro = bool('reproduce', true) ? reproduceSlice1() : null
const lab = boundarySlice(sizes, line => console.log(`${seconds(t0)} s ${line}`))
const all = lab.cells.flatMap(c => c.structures.map(s => ({ cell: c, s })))
const sum = (pick: (s: (typeof all)[number]['s']) => number): number => all.reduce((t, x) => t + pick(x.s), 0)
const repairedOf = (s: (typeof all)[number]['s']): number => s.repaired.held + s.repaired.orbit + s.repaired.transit + s.repaired.double

summary({
  sizes,
  seconds: seconds(t0),
  censuses: { m1: [lab.m1RuleCount, lab.m1ClassCount], z3: [lab.z3RuleCount, lab.z3ClassCount] },
  reproduction: repro,
  totals: {
    all: familyTotals(lab.cells, 'all'),
    z3: familyTotals(lab.cells, 'z3'),
    q2r: familyTotals(lab.cells, 'q2r'),
    m1: familyTotals(lab.cells, 'm1'),
  },
  repairing: all
    .filter(x => !x.cell.identity && repairedOf(x.s) > 0)
    .map(x => ({
      box: x.cell.box,
      rule: x.cell.rule,
      background: x.cell.background,
      start: x.s.start,
      size: x.s.size,
      period: x.s.period,
      region: x.s.regionSize,
      hits: x.s.hits,
      repaired: x.s.repaired,
      repairs: x.s.repairs,
      exports: x.s.exports,
      walled: x.s.walled,
      walledOrbitSame: x.s.walledOrbitSame,
    })),
  q2rControlRepaired: all.filter(x => isQ2rControl(x.cell.rule)).reduce((t, x) => t + repairedOf(x.s), 0),
  curvature: lab.curvature.filter(c => c.reading !== 'same'),
  credited: lab.credited,
  skipped: lab.skipped,
  gates: {
    coloringConflicts: lab.coloringConflicts.reduce((t, c) => t + c.conflicts, 0),
    ledgerFailures: sum(s => s.ledgerFailures),
    notDistinctPhases: sum(s => s.notDistinctPhases),
    exportMismatches: sum(s => s.exportMismatches),
    superpositionChecked: sum(s => s.superpositionChecked),
    superpositionFailures: sum(s => s.superpositionFailures),
    theoremFailures: sum(s => s.theoremFailures),
    replayFailures: sum(s => s.replayFailures),
    phaseTried: all.filter(x => x.s.period > 1).length,
    phaseMissed: all.filter(x => x.s.phaseAheadMissed).length,
    identityFailures: all.filter(x => x.cell.identity && (repairedOf(x.s) > 0 || x.s.keptContacts !== x.s.contacts)).length,
  },
})
