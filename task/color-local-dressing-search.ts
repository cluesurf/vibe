// The color-local dressing search, one sweep or one slice of one, for running in parallel.
//
//   npx tsx task/color-local-dressing-search.ts <sweep> [slice] [slices] [list]
//
// Sweeps: the six of code/rule/color-local-family (tables, schedule, turn, condition, couple, none),
// tables-cpt, and the second-stage ones that take a comma list: turn-schedule (turn indices),
// table-schedule (table sequences) and schedule-tables (swap orders). A slice takes every member whose
// index is the slice number mod the slice count. Each member runs structuralAcceptance against the
// committed rule, measured at the start, and prints one line:
//
//   X <id> <first gate failed> <values>
//   Q <id> <first gate failed, or pass> love <per period> fear <per period or -> <values> <love cap>
//
// A Q line is a member whose CPT, vacuum and both line graphs passed. Its last field is -1 when its
// love was followed through all four periods, and the period it passed FRONTIER times the committed
// dressing in otherwise. E-FRC-0136 runs the first stage itself; this runs the rest at scale.

import { colorLocalCollision, colorLocalSpec, PAIR_TABLE, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import {
  cptTableSweep,
  familySweep,
  scheduleTableSweep,
  tableScheduleSweep,
  turnScheduleSweep,
} from '@/code/rule/color-local-family'
import { acceptance, structuralAcceptance, type ScheduledRule } from '@/code/measure/weave-acceptance'

const rule = (spec: ColorLocalSpec): ScheduledRule => (opposite, forward) => colorLocalCollision({ spec, opposite, forward })
const [sweep = 'none', sliceText = '0', slicesText = '1', listText = ''] = process.argv.slice(2)
const slice = Number(sliceText)
const slices = Number(slicesText)
const list = listText.split(',').filter(x => x.length > 0)
const all =
  sweep === 'turn-schedule'
    ? turnScheduleSweep(list.map(Number))
    : sweep === 'table-schedule'
      ? tableScheduleSweep(list)
      : sweep === 'schedule-tables'
        ? scheduleTableSweep(list)
        : sweep === 'tables-cpt'
          ? cptTableSweep()
          : familySweep(sweep)
const members = all.filter((_, i) => i % slices === slice)
const reference = acceptance(rule(colorLocalSpec({ tables: [PAIR_TABLE] })))
const started = Date.now()
const counts = new Map<string, number>()

for (const member of members) {
  const result = structuralAcceptance(rule(member.spec), reference)
  const key = result.failed ?? 'pass'

  counts.set(key, (counts.get(key) ?? 0) + 1)

  if (result.love) {
    console.log(
      `Q ${member.id} ${key} love ${result.love.periodLargest.join(',')} fear ${result.fear?.periodLargest.join(',') ?? '-'} ${JSON.stringify(result.values)} ${result.love.overCapAt}`,
    )
  } else {
    console.log(`X ${member.id} ${key} ${JSON.stringify(result.values)}`)
  }
}

console.log(`DONE ${sweep} ${slice}/${slices} members ${members.length} ${JSON.stringify([...counts])} ${Date.now() - started}ms`)
