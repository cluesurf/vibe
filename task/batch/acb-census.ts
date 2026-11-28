// Batch driver: the extended seed census of id.ACB.id (and its conjugate id.BAC.id)
// on the closed quotients where the 60 seeds find no collidable pair, with the census's seed budget as a flag.
//
//   pnpm call task/batch/acb-census.ts [--budget 200000] [--rules id.ACB.id,id.BAC.id] [--only honeycomb-3-4-3-4]
//
// With no flags it prints exactly the lines of tmp/acb-census-probe.ts (tmp/acb-census.log), budget 200,000. The full-size
// run raises --budget to 1,000,000 so the {3,4,3,4} levels 4 and 5 reach level (2, 3).
import {
  COLOR_ORDERS,
  closedInstances,
  closedVariantInstances,
  EXTENDED_SEED_BUDGET,
  harnessReading,
  harnessRule,
} from '@/code/compute/lab/harness'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { flags, intFlag, listFlag, seconds, summary } from './args'

const f = flags()
const budget = intFlag(f, 'budget', EXTENDED_SEED_BUDGET)
const names = listFlag(f, 'rules', ['id.ACB.id', 'id.BAC.id'])
const only = listFlag(f, 'only', [])
const census = pairRuleCensus()
const rules = census.rules.filter(r => names.includes(r.name)).map(r => harnessRule(r))
const closed = closedInstances()
const catalog = [...closed, ...closedVariantInstances(closed)]
const targets = catalog.filter(
  i =>
    /torus-4-4|torus-6-3|torus-3-6|surface-3-7|honeycomb-3-4-3-4/.test(i.name) &&
    (only.length === 0 || only.some(o => i.name.includes(o))),
)
const rows: object[] = []
const start = performance.now()

console.log(`budget ${budget}, rules ${names.join(',')}, ${targets.length} instances`)

for (const inst of targets) {
  for (const rule of rules) {
    for (const order of COLOR_ORDERS) {
      const t0 = performance.now()
      const r = harnessReading({ rule, instance: inst, order, catalog, extendedBudget: budget })
      const n = r.result.numbers

      console.log(
        [
          rule.name,
          inst.name,
          order,
          r.result.label,
          JSON.stringify(n.seedKinds),
          `coll ${n.collisionsScattered}/${n.collisionsTested}`,
          JSON.stringify(r.extended ?? null),
          r.result.refused ?? '',
          `${((performance.now() - t0) / 1000).toFixed(1)}s`,
        ].join(' | '),
      )

      rows.push({
        rule: rule.name,
        instance: inst.name,
        order,
        label: r.result.label,
        collisions: [n.collisionsScattered, n.collisionsTested],
        extended: r.extended ?? null,
        refused: r.result.refused ?? null,
      })
    }
  }
}

summary({ driver: 'acb-census', budget, rules: names, seconds: seconds(start), rows })
