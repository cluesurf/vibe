// Batch driver: the E-CMP-0061 tiling Kleene layout search
// (code/compute/lab/gates.ts searchSpaceGates) with its bounds as flags: more constants, every input anchor in the
// ball, a wider ball, and the two two-law rules beside the four one-law cells.
//
//   pnpm call task/batch/tiling-gates.ts [--cells id.CAB.swap/1,...] [--spaces 4.4,4.5,...,5.4/m1,3.4.3.4/m1]
//                                     [--orders forward,reverse] [--neg 2] [--bin 2] [--neg4 2] [--bin4 1]
//                                     [--radius 2] [--radius4 1] [--anchors first|all]
//
// With no flags it runs exactly E-CMP-0061's tiling search (the four one-law cells, 13 spaces, both orders, neg 2 and
// min/max 2 constants in 2D, 2 and 1 in 4D, ball radius 2 (1 in 4D), the first input on the first wire): 401,002
// layouts, 0 gates. A space is written p.q for the coset tiling {p,q}/coset, or with /m1 for the M1 lazy tiling.
// Cells are name/background; --anchors all puts the first input on every wire of the ball in turn.
import { ballCells, gateRule, KLEENE_TARGETS, searchSpaceGates, SpaceRun, wireAt } from '@/code/compute/lab/gates'
import { lazySpaceFactory } from '@/code/compute/lab/harness'
import { cosetSpace, LazySpace, roundColors } from '@/code/compute/lab/lazy-space'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { flags, intFlag, listFlag, seconds, summary } from './args'

// E-CMP-0061's fixed parameters (test/experiment/computation/kleene-basis.ts)
const WIRE_ROUNDS = 24
const READ = 8
const HOLD = 8
const ONE_LAW = ['id.CAB.swap/1', 'id.BCA.swap/1', 'swap.BCA.id/-1', 'swap.CAB.id/-1']
const SPACES = ['4.4', '4.5', '3.6', '3.7', '6.3', '6.4', '7.3', '8.3', '5.4/m1', '6.4/m1', '6.3/m1', '3.4.3.3/m1', '3.4.3.4/m1']

type SpaceDef = { key: string; dimension: number; make: () => LazySpace }

function spaceDef(name: string): SpaceDef {
  if (name.endsWith('/m1')) {
    const key = `{${name.slice(0, -3).replaceAll('.', ',')}}` as '{5,4}'
    const make = lazySpaceFactory(key)

    if (!make) {
      throw new Error(`tiling-gates: no M1 lazy space ${key}`)
    }

    return { key, dimension: key.startsWith('{3,4,3') ? 4 : 2, make }
  }

  const [p, q] = name.split('.').map(Number) as [number, number]
  const key = `{${p},${q}}/coset`

  return { key, dimension: 2, make: () => cosetSpace({ name: key, p, q }) }
}

const f = flags()
const cells = listFlag(f, 'cells', ONE_LAW).map(c => {
  const [name, background] = c.split('/')

  return { name: name!, background: Number(background) }
})
const spaces = listFlag(f, 'spaces', SPACES).map(spaceDef)
const orders = listFlag(f, 'orders', ['forward', 'reverse']) as ('forward' | 'reverse')[]
const flat = { neg: intFlag(f, 'neg', 2), min: intFlag(f, 'bin', 2), max: intFlag(f, 'bin', 2) }
const four = { neg: intFlag(f, 'neg4', 2), min: intFlag(f, 'bin4', 1), max: intFlag(f, 'bin4', 1) }
const radius = intFlag(f, 'radius', 2)
const radius4 = intFlag(f, 'radius4', 1)
const anchors = f.get('anchors') ?? 'first'
const rules = new Map(pairRuleCensus().rules.map(r => [r.name, gateRule(r.name, r.table)]))
const rows: object[] = []
const start = performance.now()

let totalLayouts = 0
let totalGates = 0

console.log(
  `cells ${cells.map(c => `${c.name}/${c.background}`).join(',')}, ${spaces.length} spaces, orders ${orders.join(',')}, constants 2D ${JSON.stringify(flat)} 4D ${JSON.stringify(four)}, radius ${radius} (4D ${radius4}), anchors ${anchors}`,
)

for (const def of spaces) {
  for (const order of orders) {
    for (const { name, background } of cells) {
      const t0 = performance.now()
      const rule = rules.get(name)

      if (!rule) {
        throw new Error(`tiling-gates: no rule ${name}`)
      }

      const space = def.make()
      const colors = roundColors(space, order)
      const run: SpaceRun = { space, colors, rule, background }
      const ball = ballCells(space, 0, def.dimension === 4 ? radius4 : radius)
      const wires = ball.filter(c => wireAt(run, c, WIRE_ROUNDS).ternary)

      if (wires.length === 0) {
        continue
      }

      const firsts = anchors === 'all' ? wires : [wires[0]!]
      const gates: string[] = []

      let layouts = 0
      let runs = 0

      for (const first of firsts) {
        const s = searchSpaceGates({
          run,
          targets: KLEENE_TARGETS,
          first,
          second: wires,
          constantCells: ball,
          maxConstants: def.dimension === 4 ? four : flat,
          readRounds: READ,
          hold: HOLD,
        })

        layouts += Object.values(s.layouts).reduce((x, y) => x + y, 0)
        runs += s.runs
        gates.push(...s.gates.map(g => `${g.target}@${g.readRound} first ${first} inputs ${g.inputs.join(',')} constants ${JSON.stringify(g.constants)} read ${g.readCell}`))
      }

      totalLayouts += layouts
      totalGates += gates.length
      rows.push({ space: def.key, order, rule: name, background, ball: ball.length, wires: wires.length, anchors: firsts.length, layouts, runs, gates })
      console.log(`${def.key} ${order} ${name}/${background}: ball ${ball.length}, wires ${wires.length}, layouts ${layouts}, gates ${gates.length}, ${seconds(t0)}s`)

      for (const g of gates) {
        console.log(`  gate ${g}`)
      }
    }
  }
}

summary({
  driver: 'tiling-gates',
  cells: cells.map(c => `${c.name}/${c.background}`),
  constants: { flat, four },
  radius,
  radius4,
  anchors,
  seconds: seconds(start),
  layouts: totalLayouts,
  gates: totalGates,
  rows,
})
