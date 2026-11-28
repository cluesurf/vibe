// M3 driver (item vibe-computation-models-0051): the size series of every degree-matched pair for the spin-one Q2R
// Blume-Capel readings of E-CMP-0044 (test/experiment/computation/spin-one-q2r.ts), so the genus and the systole of a
// closed quotient can be told apart from its curvature. For each pair ({4,5}/{4,4}, {6,4}/{6,3}, {3,7}/{3,6},
// {3,4,3,4}/{3,4,3,3}) it builds quotients at several sizes, runs the unchanged rule (code/rule/spin-one-q2r.ts) with
// the same schedule family on both sides, and reads every run with E-CMP-0044's frozen equilibrium criterion and its
// pair verdict, with the genus, Euler characteristic, injectivity radius r and loop systole L of both sides printed
// beside every reading.
//
//   pnpm call task/m3/q2r-size-series.ts [--set reference|series] [--pairs 4.5,6.4,3.7,3.4.3.4] [--cells 1710,364]
//                                        [--max-cells 1100000] [--levels 4,5,6]
//
// --set reference (the default) runs exactly E-CMP-0044's six matched pairs (30, 330, 220, 56, 364 and 2048 cells),
// built by the same calls, and prints its geometry and curvature rows byte for byte. --set series adds every regular
// map in PGL(2, m) for the moduli below (one per distinct group order, genus, r and L, so maps of one size and genus
// with different systoles are read apart), each against the flat torus of equal cell count by the catalog's rule, and
// the {3,4,3,4} 2-adic levels 4, 5, 6 (2048, 16384, 1048576 docks; levels 1 to 3 repeat neighbours) against flat D4
// boxes of equal size (8^4, 8 x 16^3, 32^3 x 64, over 2). --cells keeps only the
// quotients of those cell counts, --max-cells drops larger ones.
//
// FROZEN AS IN E-CMP-0044, never re-tuned: the equilibrium thresholds, the crystal fields per degree, the rounds per
// size, the sweep (8 steps, burn = measure = rounds), the |m| = 1/2 bracket and the per-family pair verdict. The
// experiment exports none of them, so they are copied here between `pin:start` and `pin:end` markers, and the driver
// refuses to run unless every pinned block occurs in the experiment's source (whitespace collapsed). A change on
// either side stops the run instead of drifting.
//
// The closing SUMMARY line holds every geometry with its systole and genus, every reading (pair x size x map x
// crystal field) with both sides' systole and genus beside it, every run point, and the gate failures. Exit code 1
// when a gate fails.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  cellGraph,
  checkIndependentSchedule,
  energySweep,
  independentSetSchedule,
  inverseRestores,
  sweepStarts,
  type BlumeCapel,
  type CellGraph,
  type ColoringMethod,
  type SweepPoint,
} from '@/code/rule/spin-one-q2r'
import {
  ballSystole,
  d4Torus,
  findRotaryMap,
  HONEYCOMB_MAX_DOCKS,
  honeycombQuotient3434,
  QUOTIENT_MODULI,
  REFERENCE_CELLS,
  referenceTiling,
  type FlatTorus,
} from '@/code/substrate/tiling-quotient'
import { flags, intFlag, intListFlag, listFlag, seconds, summary } from './args'
import {
  d4Box,
  d4BoxSides,
  flatPartnerOf,
  HYPERBOLIC_REFERENCE_CELLS,
  regularMapSeries,
} from './q2r-size-series-quotients'

// ---- the frozen reading of E-CMP-0044 (each block pinned to the experiment's source) ----

// pin:start methods
const METHODS: readonly ColoringMethod[] = ['greedy-bfs', 'greedy-reverse-bfs']
// pin:end methods

// pin:start equilibrated
function equilibrated(point: SweepPoint, model: BlumeCapel): boolean {
  const t = point.temperature
  const b = Math.abs(t.betaFlip)
  const flip = t.flipPoints.length >= 2 && t.flipSpread <= 0.05 + 0.05 * b
  const mixed = model.crystalField !== 0 && point.run.occupation < 1
  const vacancy =
    !mixed ||
    (t.vacancyPoints.length >= 1 &&
      t.vacancySpread <= 0.05 + 0.1 * b &&
      Math.abs(t.betaFlip - t.betaVacancy) <= 0.03 + 0.05 * b)

  return point.run.moves > 0 && flip && vacancy
}
// pin:end equilibrated

// pin:start crystalFields
function crystalFields(z: number): { label: 'ising' | 'low' | 'high'; delta: number }[] {
  return [
    { label: 'ising', delta: -(z + 1) },
    { label: 'low', delta: Math.max(1, Math.floor(z / 4)) },
    { label: 'high', delta: Math.ceil((3 * z) / 4) },
  ]
}
// pin:end crystalFields

// pin:start roundsFor
const roundsFor = (cells: number): number => Math.min(40000, Math.max(2000, Math.ceil(4e6 / cells)))
// pin:end roundsFor

// pin:start curveAt
function curveAt(points: readonly { beta: number; m: number }[], beta: number): number {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!

    if (beta >= a.beta && beta <= b.beta) {
      return b.beta === a.beta ? (a.m + b.m) / 2 : a.m + ((beta - a.beta) / (b.beta - a.beta)) * (b.m - a.m)
    }
  }

  return Number.NaN
}
// pin:end curveAt

// pin:start curveGap
function curveGap(a: readonly { beta: number; m: number }[], b: readonly { beta: number; m: number }[]): number {
  let gap = Number.NaN
  let shared = 0

  for (const beta of [...a, ...b].map(p => p.beta)) {
    const ma = curveAt(a, beta)
    const mb = curveAt(b, beta)

    if (Number.isFinite(ma) && Number.isFinite(mb)) {
      shared++
      gap = Number.isNaN(gap) ? Math.abs(ma - mb) : Math.max(gap, Math.abs(ma - mb))
    }
  }

  return shared >= 2 ? gap : Number.NaN
}
// pin:end curveGap

// pin:start halfBracket
function halfBracket(points: readonly { beta: number; m: number }[]): { lo: number; hi: number } | null {
  if (points.length === 0) {
    return null
  }

  const below = points.filter(p => p.m < 0.5).map(p => p.beta)
  const above = points.filter(p => p.m >= 0.5).map(p => p.beta)
  const a = below.length > 0 ? Math.max(...below) : Number.NEGATIVE_INFINITY
  const b = above.length > 0 ? Math.min(...above) : Number.POSITIVE_INFINITY

  return { lo: Math.min(a, b), hi: Math.max(a, b) }
}
// pin:end halfBracket

// pin:start fmt
const fmt = (x: number, d = 3): string => (Number.isFinite(x) ? x.toFixed(d) : '-')
// pin:end fmt

// the pinned blocks of this file: methods, equilibrated, crystalFields, roundsFor, curveAt, curveGap, halfBracket,
// fmt, sweep, curve, row, verdict, pairRow
const PINNED_BLOCKS = 13

// Every pinned block must occur in the experiment's source, whitespace collapsed; otherwise the run stops.
function checkPins(): string[] {
  const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim()
  const own = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  const experiment = collapse(
    readFileSync(fileURLToPath(new URL('../../test/experiment/computation/spin-one-q2r.ts', import.meta.url)), 'utf8'),
  )
  const blocks = [...own.matchAll(/\/\/ pin:start (\S+)\n([\s\S]*?)\/\/ pin:end \1\n/g)]
  const missing = blocks.filter(m => !experiment.includes(collapse(m[2]!))).map(m => m[1]!)

  if (blocks.length !== PINNED_BLOCKS) {
    missing.push(`${blocks.length} pinned blocks found, expected ${PINNED_BLOCKS}`)
  }

  return missing
}

// ---- geometries ----

type Side = {
  name: string
  symbol: string
  curvature: 'flat' | 'hyperbolic'
  dimension: 2 | 4
  graph: CellGraph
  genus: number | null
  euler: number | null
  // the injectivity radius r, whether it is only a lower bound, and the loop systole L
  systole: number
  systoleLowerBound: boolean
  loopSystole: number | null
  construction: string
}

type Pair = { key: string; cells: number; reference: boolean; hyperbolic: Side; flat: Side }

const surfaceName = (symbol: readonly number[], genus: number): string =>
  `${genus === 1 ? 'torus' : 'surface'}-${symbol.join('-')}-genus-${genus}`

function torusSide(torus: FlatTorus): Side {
  const symbol = [torus.p, torus.q]
  const cells = torus.analysis.faces
  // a torus is cell-transitive, so cell 0 reads the systole; the patch reaches past its loops
  const sys = ballSystole({
    neighbors: torus.analysis.neighbors,
    reference: referenceTiling(symbol, Math.max(REFERENCE_CELLS, 8 * cells)),
    referenceDegree: torus.p,
    centers: [0],
  })

  return {
    name: `${surfaceName(symbol, 1)}-${torus.sides.join('x')}`,
    symbol: `{${symbol.join(',')}}`,
    curvature: 'flat',
    dimension: 2,
    graph: cellGraph(torus.analysis.neighbors),
    genus: torus.analysis.genus,
    euler: torus.analysis.euler,
    systole: sys.systole,
    systoleLowerBound: sys.lowerBound,
    loopSystole: sys.loopSystole,
    construction: `flat {${symbol.join(',')}} torus of ${torus.sides.join(' x ')} ${torus.p === 3 ? 'rhombi' : 'tiles'}`,
  }
}

type RegularMap = {
  modulus: number
  groupOrder: number
  x: readonly number[]
  y: readonly number[]
  analysis: { faces: number; genus: number; euler: number; neighbors: number[][] }
}

function mapSide(p: number, q: number, map: RegularMap, name: string): Side {
  const sys = ballSystole({
    neighbors: map.analysis.neighbors,
    reference: referenceTiling([p, q], HYPERBOLIC_REFERENCE_CELLS),
    referenceDegree: p,
    centers: [0],
  })

  return {
    name,
    symbol: `{${p},${q}}`,
    curvature: 'hyperbolic',
    dimension: 2,
    graph: cellGraph(map.analysis.neighbors),
    genus: map.analysis.genus,
    euler: map.analysis.euler,
    systole: sys.systole,
    systoleLowerBound: sys.lowerBound,
    loopSystole: sys.loopSystole,
    construction: `regular map of the (2,${p},${q}) rotation group in PGL(2,${map.modulus}), order ${map.groupOrder}, x = [${map.x.join(' ')}], y = [${map.y.join(' ')}]`,
  }
}

// the pairs of one 2D degree class: E-CMP-0044's maps (the catalog's, plus its larger {4,5} and {3,7} pairs), then in
// the series every other regular map of the moduli
const SURFACE_PAIRS = [
  { key: '4.5', p: 4, q: 5, extraModulus: 11, moduli: [5, 11, 19, 29, 31, 41] },
  { key: '6.4', p: 6, q: 4, extraModulus: null, moduli: [11, 13, 17, 19, 23, 29, 31, 37, 41, 43] },
  { key: '3.7', p: 3, q: 7, extraModulus: 13, moduli: [7, 13, 29, 41, 43] },
] as const

function surfacePairs(input: { key: string; p: number; q: number; extraModulus: number | null; moduli: readonly number[] }, series: boolean, maxCells: number): Pair[] {
  const { p, q } = input
  const pairs: Pair[] = []
  const seen = new Set<string>()

  const add = (map: RegularMap, reference: boolean): void => {
    const flat = flatPartnerOf(p, map.analysis.faces)

    if (!flat) {
      console.log(`no flat partner of {${p},${q}} with ${map.analysis.faces} cells: skipped`)

      return
    }

    const base = surfaceName([p, q], map.analysis.genus)
    const draft = mapSide(p, q, map, base)
    const id = `${map.groupOrder}:${map.analysis.genus}:${draft.systole}:${draft.loopSystole}`

    if (seen.has(id)) {
      return
    }

    seen.add(id)

    const hyperbolic = reference ? draft : { ...draft, name: `${base}-r${draft.systole}-L${draft.loopSystole ?? 'open'}` }

    pairs.push({ key: input.key, cells: map.analysis.faces, reference, hyperbolic, flat: torusSide(flat) })
  }

  // the catalog's map (closedQuotients: QUOTIENT_MODULI, REFERENCE_CELLS, minSystole 1) and E-CMP-0044's extra pair
  const catalog = findRotaryMap({ p, q, moduli: QUOTIENT_MODULI, reference: referenceTiling([p, q], REFERENCE_CELLS), minSystole: 1 })

  if (catalog) {
    add(catalog, true)
  }

  if (input.extraModulus !== null) {
    const extra = findRotaryMap({ p, q, moduli: [input.extraModulus], reference: referenceTiling([p, q], 6000), minSystole: 1 })

    if (!extra) {
      throw new Error(`q2r-size-series: no {${p},${q}} map mod ${input.extraModulus}`)
    }

    add(extra, true)
  }

  if (series) {
    for (const map of regularMapSeries({ p, q, moduli: input.moduli, maxCells, minSystole: 1 })) {
      add(map, false)
    }
  }

  return pairs
}

function honeycombPairs(levels: readonly number[], maxCells: number, failures: string[]): Pair[] {
  const pairs: Pair[] = []

  for (const twoPower of levels) {
    const honeycomb = honeycombQuotient3434({ twoPower, maxDocks: twoPower <= 5 ? HONEYCOMB_MAX_DOCKS : maxCells })

    if (!honeycomb) {
      console.log(`{3,4,3,4} level ${twoPower} has more than the cell cap: skipped`)
      continue
    }

    if (!honeycomb.gates.distinctNeighbours) {
      console.log(`{3,4,3,4} level ${twoPower} has repeated neighbours: skipped`)
      continue
    }

    const reference = twoPower === 4
    const sides = d4BoxSides(honeycomb.docks)

    if (!sides) {
      console.log(`{3,4,3,4} level ${twoPower} (${honeycomb.docks} docks) has no D4 box of equal size: skipped`)
      continue
    }

    const cube = sides.every(s => s === sides[0])
    // E-CMP-0044's partner is the library cube; any other size is a box from this driver's quotient file
    const box = cube ? { neighbors: d4Torus(sides[0]).neighbors } : d4Box(sides)

    if (cube) {
      const own = d4Box(sides).neighbors
      const agrees = own.length === box.neighbors.length && own.every((row, c) => row.every((y, k) => y === box.neighbors[c]![k]))

      if (!agrees) {
        failures.push(`d4Box(${sides.join('x')}) differs from d4Torus(${sides[0]})`)
      }
    }

    const sys = ballSystole({
      neighbors: box.neighbors,
      // 300,000 cells are complete only to radius 15, short of the 16 that the 32-sided box's loop needs; 600,000
      // reach it. A smaller patch only makes r a lower bound (printed with a +)
      reference: referenceTiling([3, 4, 3, 3], Math.min(600_000, Math.max(20000, 2 * honeycomb.docks))),
      referenceDegree: 24,
      centers: [0],
    })

    pairs.push({
      key: '3.4.3.4',
      cells: honeycomb.docks,
      reference,
      hyperbolic: {
        name: `honeycomb-3-4-3-4-level-${twoPower}`,
        symbol: '{3,4,3,4}',
        curvature: 'hyperbolic',
        dimension: 4,
        graph: cellGraph(honeycomb.neighbors),
        genus: null,
        euler: honeycomb.euler,
        systole: honeycomb.systole,
        systoleLowerBound: honeycomb.systoleLowerBound,
        loopSystole: honeycomb.loopSystole,
        construction: `frame group K of the {3,4,3,4} honeycomb modulo (sqrt 2)^${twoPower}, ${honeycomb.docks} docks`,
      },
      flat: {
        name: cube ? `torus-3-4-3-3-side-${sides[0]}` : `torus-3-4-3-3-box-${sides.join('x')}`,
        symbol: '{3,4,3,3}',
        curvature: 'flat',
        dimension: 4,
        graph: cellGraph(box.neighbors),
        genus: null,
        euler: 0,
        systole: sys.systole,
        systoleLowerBound: sys.lowerBound,
        loopSystole: sys.loopSystole,
        construction: `flat D4 lattice (24-cell honeycomb {3,4,3,3}) modulo ${sides.join(' x ')}, even-sum points`,
      },
    })
  }

  return pairs
}

// ---- the run ----

type Curve = { beta: number; m: number; occupation: number; energy: number }

const finite = (x: number): number | null => (Number.isFinite(x) ? x : null)

const options = flags()
const set = options.get('set') ?? 'reference'
const pairKeys = listFlag(options, 'pairs', ['4.5', '6.4', '3.7', '3.4.3.4'])
const onlyCells = new Set(intListFlag(options, 'cells', []))
const maxCells = intFlag(options, 'max-cells', 1_100_000)
const levels = intListFlag(options, 'levels', set === 'reference' ? [4] : [4, 5, 6])
const start = performance.now()
const log = (line: string): void => console.log(`${line} (${seconds(start)} s)`)

if (set !== 'reference' && set !== 'series') {
  throw new Error(`q2r-size-series: --set must be reference or series, got ${set}`)
}

const missingPins = checkPins()

if (missingPins.length > 0) {
  throw new Error(`q2r-size-series: the frozen E-CMP-0044 blocks drifted, refusing to run: ${missingPins.join(', ')}`)
}

const failures: string[] = []
const pairs: Pair[] = []

for (const spec of SURFACE_PAIRS) {
  if (pairKeys.includes(spec.key)) {
    pairs.push(...surfacePairs(spec, set === 'series', maxCells))
  }
}

if (pairKeys.includes('3.4.3.4')) {
  pairs.push(...honeycombPairs(levels, maxCells, failures))
}

const chosen = pairs
  .filter(p => p.cells <= maxCells && (onlyCells.size === 0 || onlyCells.has(p.cells)))
  .sort((a, b) => a.cells - b.cells)

console.log(`set ${set}, pairs ${pairKeys.join(',')}, ${chosen.length} matched quotients, max cells ${maxCells}${onlyCells.size > 0 ? `, cells ${[...onlyCells].join(',')}` : ''}`)

const sides = new Map<string, Side>()

for (const p of chosen) {
  for (const s of [p.hyperbolic, p.flat]) {
    sides.set(s.name, s)
  }

  if (p.hyperbolic.graph.cells !== p.flat.graph.cells || p.hyperbolic.graph.maxDegree !== p.flat.graph.maxDegree) {
    failures.push(`pair ${p.hyperbolic.name} / ${p.flat.name}: equal cells and degree`)
  }

  console.log(
    `pair ${p.hyperbolic.symbol} ${p.hyperbolic.name} (genus ${p.hyperbolic.genus ?? '-'}, Euler ${p.hyperbolic.euler ?? '-'}, r ${p.hyperbolic.systole}${p.hyperbolic.systoleLowerBound ? '+' : ''}, L ${p.hyperbolic.loopSystole ?? '-'}) / ${p.flat.symbol} ${p.flat.name} (genus ${p.flat.genus ?? '-'}, r ${p.flat.systole}${p.flat.systoleLowerBound ? '+' : ''}, L ${p.flat.loopSystole ?? '-'}), ${p.cells} cells${p.reference ? ', E-CMP-0044' : ''}`,
  )
}

log('geometries built')

const curves = new Map<string, Curve[]>()
const rows: string[] = []
const runs: object[] = []

for (const g of sides.values()) {
  const z = g.graph.maxDegree

  if (g.graph.minDegree !== z) {
    failures.push(`${g.name}: not ${z}-regular`)
  }

  const rounds = roundsFor(g.graph.cells)

  for (const method of METHODS) {
    const schedule = independentSetSchedule({ graph: g.graph, method, colorOrder: 'forward' })
    const sc = checkIndependentSchedule(g.graph, schedule)

    if (!(sc.independent && sc.covers)) {
      failures.push(`${g.name} ${method}: schedule not proper or not covering`)
    }

    for (const { label, delta } of crystalFields(z)) {
      // pin:start sweep
      const model: BlumeCapel = { coupling: 1, crystalField: delta }
      const points = energySweep({
        graph: g.graph,
        model,
        schedule,
        starts: sweepStarts(label === 'ising'),
        steps: 8,
        burn: rounds,
        measure: rounds,
      })
      const key = `${g.name}|${method}|${label}`
      const eqPoints = points.filter(p => equilibrated(p, model))
      // pin:end sweep

      if (!points.every(p => p.run.energyConserved && p.run.bookkeepingExact)) {
        failures.push(`${key}: a run broke E conservation or its books`)
      }

      if (label === 'ising' && z % 2 === 1 && !points.every(p => p.run.moves === 0)) {
        failures.push(`${key}: the odd-degree Ising limit moved`)
      }

      const mid = points[Math.floor(points.length / 2)]

      if (mid && method === 'greedy-bfs' && !inverseRestores({ graph: g.graph, model, schedule, state: mid.run.finalState, rounds: 300 })) {
        failures.push(`${key}: 300 rounds forward and back did not restore`)
      }

      curves.set(
        key,
        eqPoints
          // pin:start curve
          .map(p => ({ beta: p.temperature.betaFlip, m: p.run.absMagnetization, occupation: p.run.occupation, energy: p.run.energyPerCell }))
          .sort((a, b) => a.beta - b.beta),
        // pin:end curve
      )

      rows.push(
        // pin:start row
        `${key} (N ${g.graph.cells}, z ${z}, c ${schedule.colors}, Delta ${delta}, ${rounds}+${rounds} rounds): ${eqPoints.length}/${points.length} equilibrated; ${points
          .map(p => `[${fmt(p.run.energyPerCell, 2)}: b ${fmt(p.temperature.betaFlip)}${label === 'ising' ? '' : `/${fmt(p.temperature.betaVacancy)}`} m ${fmt(p.run.absMagnetization, 2)} q ${fmt(p.run.occupation, 2)}${equilibrated(p, model) ? '' : ' x'}]`)
          .join(' ')}`,
        // pin:end row
      )

      runs.push({
        geometry: g.name,
        symbol: g.symbol,
        cells: g.graph.cells,
        genus: g.genus,
        euler: g.euler,
        systole: g.systole,
        loopSystole: g.loopSystole,
        method,
        colors: schedule.colors,
        field: label,
        delta,
        rounds,
        equilibrated: eqPoints.length,
        points: points.map(p => ({
          step: p.step,
          energyPerCell: p.run.energyPerCell,
          betaFlip: finite(p.temperature.betaFlip),
          betaVacancy: finite(p.temperature.betaVacancy),
          absMagnetization: p.run.absMagnetization,
          occupation: p.run.occupation,
          moves: p.run.moves,
          equilibrated: equilibrated(p, model),
        })),
      })
    }
  }

  log(`geometry ${g.name} done`)
}

for (const row of rows) {
  console.log(row)
}

// ---- matched pairs, one schedule family on both sides ----

const readings: object[] = []
const pairRows: string[] = []
const verdicts: Record<string, number> = { differs: 0, agrees: 0, unresolved: 0 }

const sideMeta = (s: Side): object => ({
  name: s.name,
  cells: s.graph.cells,
  genus: s.genus,
  euler: s.euler,
  systole: s.systole,
  systoleLowerBound: s.systoleLowerBound,
  loopSystole: s.loopSystole,
  construction: s.construction,
})

for (const pair of chosen) {
  const h = pair.hyperbolic
  const f = pair.flat

  for (const label of ['ising', 'low', 'high'] as const) {
    const get = (g: Side, m: ColoringMethod): Curve[] => curves.get(`${g.name}|${m}|${label}`) ?? []
    // pin:start verdict
    const gaps = METHODS.map(m => curveGap(get(h, m), get(f, m)))
    const spreads = [h, f].map(g => curveGap(get(g, METHODS[0]!), get(g, METHODS[1]!)))
    const gap = Math.min(...gaps.map(x => (Number.isFinite(x) ? x : Number.POSITIVE_INFINITY)))
    const spread = Math.max(...spreads.map(s => (Number.isFinite(s) ? s : 0)))
    // per schedule family: the beta interval holding the |m| = 1/2 crossing on each side, then disjoint or not
    const relations = METHODS.map(m => {
      const a = halfBracket(get(h, m))
      const b = halfBracket(get(f, m))

      if (!a || !b) {
        return 'unresolved'
      }

      if (a.hi < b.lo) {
        return 'hyperbolicHotter'
      }

      if (b.hi < a.lo) {
        return 'flatHotter'
      }

      return 'overlap'
    })
    const result = relations.every(r => r === 'overlap')
      ? 'agrees'
      : relations.every(r => r === relations[0]) && relations[0] !== 'unresolved'
        ? 'differs'
        : 'unresolved'
    const crossings = [h, f].map(g =>
      METHODS.map(m => {
        const b = halfBracket(get(g, m))

        return b ? `${fmt(b.lo)}..${fmt(b.hi)}` : '-'
      }).join(' / '),
    )
    // pin:end verdict

    verdicts[result]!++

    // pin:start pairRow
    pairRows.push(`${h.symbol} ${h.name} / ${f.symbol} ${f.name} (${h.graph.cells} cells, z ${h.graph.maxDegree}) ${label}: ${result} [${relations.join(', ')}], beta of |m| = 1/2 (greedy-bfs / greedy-reverse-bfs) hyperbolic ${crossings[0]} flat ${crossings[1]}; |m| gap ${fmt(gap)} [${gaps.map(x => fmt(x)).join(', ')}], schedule spread ${fmt(spread)}`)
    // pin:end pairRow
    console.log(`curvature: ${pairRows.at(-1)}`)
    console.log(
      `systole: ${h.name} genus ${h.genus ?? '-'} r ${h.systole} L ${h.loopSystole ?? '-'} / ${f.name} genus ${f.genus ?? '-'} r ${f.systole} L ${f.loopSystole ?? '-'} ${label}: ${result}`,
    )

    readings.push({
      pair: pair.key,
      cells: pair.cells,
      reference: pair.reference,
      field: label,
      verdict: result,
      relations,
      hyperbolic: { ...sideMeta(h), brackets: METHODS.map(m => halfBracket(get(h, m))).map(b => (b ? [finite(b.lo), finite(b.hi)] : null)), equilibrated: METHODS.map(m => get(h, m).length) },
      flat: { ...sideMeta(f), brackets: METHODS.map(m => halfBracket(get(f, m))).map(b => (b ? [finite(b.lo), finite(b.hi)] : null)), equilibrated: METHODS.map(m => get(f, m).length) },
      gap: finite(gap),
      gaps: gaps.map(finite),
      scheduleSpread: spread,
    })
  }
}

for (const failure of failures) {
  log(`FAILED ${failure}`)
}

summary({
  item: 'vibe-computation-models-0051',
  set,
  pairs: pairKeys,
  levels,
  maxCells,
  cells: [...onlyCells],
  seconds: seconds(start),
  failed: failures,
  verdicts,
  geometries: [...sides.values()].map(s => ({ ...sideMeta(s), symbol: s.symbol, curvature: s.curvature, dimension: s.dimension, degree: s.graph.maxDegree })),
  readings,
  runs,
})

if (failures.length > 0) {
  process.exitCode = 1
}
