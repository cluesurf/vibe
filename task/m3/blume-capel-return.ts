// M3 driver (item vibe-computation-models-0071): the E-CMP-0067 boxes rebuilt from the library exactly as the
// experiment builds them, measuring the exact return time of every walled completion (WalledBlumeCapel.returnTime) up
// to a cap, and how long every open completion keeps its word (OpenBlumeCapel.persists) up to a round.
//
//   pnpm call task/m3/blume-capel-return.ts [--boxes walled,open] [--return-cap 512] [--persist-until 96]
//                                           [--columns 6.4,...] [--colorings greedy,greedy-shifted] [--deltas 1,2]
//                                           [--support-cap 40000] [--shard 0/1]
//
// The defaults are E-CMP-0067's (return within 512, persistence to round 96, wall radius 7, support budget 40,000), so
// each box's completion count, returned count and persistent count reproduce the experiment's per-box notes. The M3
// run raises --return-cap to 2^20 and --persist-until to 384.
import { regionCensus, regionCues } from '@/code/compute/lab/association'
import { LazySpace, cosetSpace } from '@/code/compute/lab/lazy-space'
import {
  OpenBlumeCapel,
  OpenRunStats,
  WalledBlumeCapel,
  openBlumeCapelSystem,
  walledBlumeCapelSystem,
} from '@/code/compute/lab/open-blume-capel'
import { CanonicalColoringKind, CanonicalGraph, CanonicalVertexColoring } from '@/code/substrate/coxeter/canonical-vertex-coloring'
import { LabGeometryName } from '@/code/substrate/lab-geometry'
import { flags, intFlag, intListFlag, listFlag, seconds, summary } from './args'

// E-CMP-0067's fixed parameters (test/experiment/computation/blume-capel-open-window.ts)
const WALL_RADIUS = 7
const FRONT_ROUNDS = 48
const COLUMNS: readonly { column: LabGeometryName; p: number; q: number }[] = [
  { column: '{4,4}', p: 4, q: 4 },
  { column: '{4,5}', p: 4, q: 5 },
  { column: '{3,6}', p: 3, q: 6 },
  { column: '{3,7}', p: 3, q: 7 },
  { column: '{6,3}', p: 6, q: 3 },
  { column: '{6,4}', p: 6, q: 4 },
]

const f = flags()
const boxes = listFlag(f, 'boxes', ['walled'])
const returnCap = intFlag(f, 'return-cap', 512)
const persistUntil = intFlag(f, 'persist-until', 96)
const supportCap = intFlag(f, 'support-cap', 40_000)
// tilings written p.q (3.7 for {3,7}), comma-separated
const columnNames = listFlag(f, 'columns', COLUMNS.map(c => `${c.p}.${c.q}`)).map(name => `{${name.replace('.', ',')}}`)
const colorings = listFlag(f, 'colorings', ['greedy', 'greedy-shifted']) as CanonicalColoringKind[]
const deltas = intListFlag(f, 'deltas', [1, 2])
// --shard k/n measures return times only for completions whose index is k mod n (the others read -1), so the
// 2^20-round checks of one big box can run as n parallel jobs
const [shardIndex, shardCount] = (f.get('shard') ?? '0/1').split('/').map(Number) as [number, number]

if (!Number.isInteger(shardIndex) || !Number.isInteger(shardCount) || shardCount < 1 || shardIndex < 0 || shardIndex >= shardCount) {
  throw new Error(`blume-capel-return: --shard must be k/n with 0 <= k < n, got ${f.get('shard')}`)
}

function canonicalGraph(space: LazySpace): CanonicalGraph {
  return {
    degree: space.degree,
    neighbors: c => space.neighbors(c),
    distance: c => space.distance(c),
    compare: (a, b) => space.compare(a, b),
  }
}

type BoxRow = {
  box: string
  crystalField: number
  refused: string | null
  completions: number
  // walled: completions returning within the cap, and each return time (0 = not within the cap)
  returned?: number
  returnTimes?: number[]
  // open: completions keeping their word to the round, and the last round each kept it
  persistent?: number
  lastRounds?: number[]
  stopped: number
  seconds: number
}

const rows: BoxRow[] = []
const start = performance.now()

console.log(
  `boxes ${boxes.join(',')}, shard ${shardIndex}/${shardCount}, return cap ${returnCap}, persist until ${persistUntil}, support cap ${supportCap}, columns ${columnNames.join(',')}, colorings ${colorings.join(',')}, deltas ${deltas.join(',')}`,
)

for (const col of COLUMNS.filter(c => columnNames.includes(c.column))) {
  for (const kind of colorings) {
    const space = cosetSpace({ name: col.column, p: col.p, q: col.q })
    const coloring = new CanonicalVertexColoring({ graph: canonicalGraph(space), kind })
    const region = [0, ...[...space.neighbors(0)].sort((a, b) => space.compare(a, b))]
    const cues = regionCues(region.length, 0)

    for (const boxKind of ['open', 'walled'] as const) {
      if (!boxes.includes(boxKind)) {
        continue
      }

      for (const crystalField of deltas) {
        const t0 = performance.now()
        const box = `${boxKind}:${col.column}~${kind}`
        const stats: OpenRunStats = { stopped: [], energyFailures: 0, maxSupport: 0 }
        const model = { coupling: 1, crystalField }

        if (boxKind === 'walled') {
          const dense = new WalledBlumeCapel({ model, coloring, distance: c => space.distance(c), wall: WALL_RADIUS, colorOrder: 'forward' })
          const census = regionCensus(walledBlumeCapelSystem(dense, region, stats), cues)
          const returnTimes = census.completions.map((c, i) =>
            i % shardCount === shardIndex ? dense.returnTime(c.start, returnCap) : -1,
          )
          const row: BoxRow = {
            box,
            crystalField,
            refused: null,
            completions: census.completions.length,
            returned: returnTimes.filter(t => t > 0).length,
            returnTimes,
            stopped: stats.stopped.length,
            seconds: seconds(t0),
          }

          rows.push(row)
          console.log(`${box} D${crystalField}: completions ${row.completions}, returned within ${returnCap} ${row.returned}, longest return ${Math.max(0, ...returnTimes)}, ${row.seconds}s`)
          continue
        }

        const make = (): OpenBlumeCapel =>
          new OpenBlumeCapel({ model, coloring, distance: c => space.distance(c), wall: null, supportCap, colorOrder: 'forward' })
        // the front gate: a lone +1 at the origin must stay within the budget for 48 rounds
        const gate = make()
        const lone = new Map<number, number>([[0, 1]])

        let refused: string | null = null

        for (let t = 1; t <= FRONT_ROUNDS && refused === null; t++) {
          if (!gate.round(lone)) {
            refused = `the lone +1 at the origin passes ${supportCap} cells at round ${t}`
          }
        }

        if (refused) {
          rows.push({ box, crystalField, refused, completions: 0, stopped: 0, seconds: seconds(t0) })
          console.log(`${box} D${crystalField}: refused (${refused})`)
          continue
        }

        const rule = make()
        const census = regionCensus(openBlumeCapelSystem(rule, region, stats), cues)
        const lastRounds = census.completions.map(c => rule.persists({ final: c.final, region, word: c.target, until: persistUntil }).lastRound)
        const row: BoxRow = {
          box,
          crystalField,
          refused: null,
          completions: census.completions.length,
          persistent: lastRounds.filter(t => t === persistUntil).length,
          lastRounds,
          stopped: stats.stopped.length,
          seconds: seconds(t0),
        }

        rows.push(row)
        console.log(`${box} D${crystalField}: completions ${row.completions}, persist to ${persistUntil} ${row.persistent}, stopped ${row.stopped}, ${row.seconds}s`)
      }
    }
  }
}

const walled = rows.filter(r => r.returnTimes)
const open = rows.filter(r => r.lastRounds)

summary({
  item: 'vibe-computation-models-0071',
  returnCap,
  persistUntil,
  supportCap,
  seconds: seconds(start),
  walledCompletions: walled.reduce((n, r) => n + r.completions, 0),
  walledReturned: walled.reduce((n, r) => n + r.returned!, 0),
  openCompletions: open.reduce((n, r) => n + r.completions, 0),
  openPersistent: open.reduce((n, r) => n + r.persistent!, 0),
  refused: rows.filter(r => r.refused).length,
  rows,
})
