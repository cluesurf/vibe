// M3 driver (item vibe-computation-models-0069 part a): the exact Grover search of E-CMP-0039 (Q5,
// test/experiment/computation/bare-u-walk-search.ts) on every 2D degree-matched pair at many sizes, flat torus against
// closed hyperbolic quotient of equal cell count and degree, to test whether the hyperbolic side's lower R = T^2/(PN)
// is a scaling law or a single-size reading (P52 of m12-predictions.md).
//
//   pnpm call task/m3/grover-size-series.ts [--set reference|series] [--pairs 4.5,6.4,3.7] [--max-cells 30000]
//                                           [--cells 330,364] [--systole true]
//
// --set reference (the default) rebuilds E-CMP-0039's three 2D closed pairs (closedQuotients, as the experiment) and
// its two near-square shape controls, and prints each row in the experiment's format, so the run can be compared with
// the experiment's notes byte for byte. --set series adds, for each pair, every {p,q} regular map whose rotation group
// lies in PGL(2, m) for the moduli below (task/m3/q2r-size-series-quotients.ts regularMapSeries: one map per distinct
// group order, genus, injectivity radius r and loop systole L), each against the flat torus of equal cell count by the
// catalog's rule (flatPartnerOf, factor pair closest to square). --cells keeps only those cell counts, --max-cells drops
// larger maps. --systole false skips the flat tori's systole (the maps always carry theirs).
//
// The walk, the first-maximum rule and the classical controls are code/compute/quantum/walk.ts (groverSearch,
// dephasedSearch, bfsDistances, searchCap) unchanged. searchRow, rowText and seriesReading are file-local in the
// experiment, so they are copied here between pin markers and the driver refuses to run unless each copied block occurs
// in the experiment's source (whitespace collapsed).
//
// READING RULE, declared 2026-11-27 before any series run (item 0069 asks for it before the run):
// - per side of a pair, the experiment's series reading over its sizes: R = T^2/(PN) at each size, 'quadratic' when R at
//   the largest N is at most twice R at the smallest, 'slower' when more, only when N grows at least 16-fold from
//   N >= 16 ('short' otherwise, 'no peak' when a size never reaches 2/N). Where several hyperbolic maps share one cell
//   count (different systoles), the hyperbolic side reads quadratic only if EVERY map at the largest N has R at most
//   twice the SMALLEST R at the smallest N, and slower if any exceeds it (the reading least favourable to a
//   hyperbolic advantage);
// - per size, the advantage A = R_flat / R_hyp for every hyperbolic map at that size;
// - per pair: 'advantage scales' when the hyperbolic side reads quadratic, the flat side reads slower and A > 1 at every
//   size; 'advantage shrinks' when A <= 1 for some map at the largest N (which falsifies P52); 'unresolved' otherwise.
//   A reading over finite sizes, not an asymptotic law. Systole r, L and genus are printed beside every row, since a
//   hyperbolic map of short systole is not the infinite tiling at any radius past r.
//
// Gates, each able to fail: unitarity (total weight q^(2t) d N every beat), the classical mass and union bound, a
// connected graph, the no-oracle control (with no marked cell P stays exactly 1/N for 20 beats), equal cell count and
// degree in every pair, and every map's analysis gates (regularMapSeries keeps only maps that pass them). The closing
// SUMMARY line holds every row, the per-pair readings and the gate failures. Exit code 1 when a gate fails.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { type Ninth, keyOf, ninth } from '@/code/algebra/ninth-field'
import { compareReal } from '@/code/algebra/ninth-real-sign'
import { arcGraph, bfsDistances, dephasedSearch, displayRational, groverSearch, searchCap } from '@/code/compute/quantum/walk'
import {
  ballSystole,
  closedQuotients,
  hexagonTorus,
  referenceTiling,
  REFERENCE_CELLS,
  triangleTorus,
  type ClosedQuotient,
  type FlatTorus,
} from '@/code/substrate/tiling-quotient'
import { flags, intFlag, intListFlag, listFlag, seconds, summary } from './args'
import { flatPartnerOf, regularMapSeries } from './q2r-size-series-quotients'

const NO_ORACLE_BEATS = 20

const sha = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 16)
const show = (x: number): string => String(Number(x.toPrecision(6)))
const rat = (n: number | bigint, d: number | bigint): Ninth => ninth([BigInt(n)], BigInt(d))

// pin:start row
type Row = {
  name: string
  cells: number
  degree: number
  walls: number
  firstBeat: number | null
  firstP: number | null
  ratio: number | null
  classicalAtFirst: number | null
  unionBeats: number | null
  eccentricity: number
  exact: string
}
// pin:end row

type Report = { ok: Record<string, boolean> }

// pin:start toLists
function toLists(neighbors: readonly ArrayLike<number>[]): number[][] {
  return neighbors.map(row => Array.from(row))
}
// pin:end toLists

// the experiment's searchRow returns the row only; this copy also keeps the exact first maximum for the log
const firstMaxima = new Map<string, string>()

// pin:start searchRow
// One search row: the Grover search, its classical controls and the readings.
function searchRow(name: string, neighbors: number[][], degree: number, marked: number, ok: Record<string, boolean>): Row {
  const graph = arcGraph(neighbors, degree)
  const search = groverSearch({ graph, marked, cap: searchCap(graph.cells) })
  const firstBeat = search.firstMaximumBeat
  const classical = dephasedSearch({ graph, marked, beats: firstBeat ?? search.beats })
  const distance = bfsDistances(neighbors, marked)

  let eccentricity = 0

  for (const r of distance) {
    eccentricity = r > eccentricity ? r : eccentricity
  }

  ok[`unitary_${name}`] = search.unitaryDefects === 0
  ok[`classicalMass_${name}`] = classical.massDefects === 0 && classical.stochastic
  ok[`unionBound_${name}`] = classical.unionBoundViolations === 0
  ok[`connected_${name}`] = !distance.includes(-1)

  const firstP = search.firstMaximum ? displayRational(search.firstMaximum) : null
  const n = graph.cells
// pin:end searchRow

  firstMaxima.set(name, search.firstMaximum ? keyOf(search.firstMaximum) : 'none')

// pin:start unionBeats
  // classical beats needed to reach the quantum peak probability, from the union bound: t + 1 >= P N
  let unionBeats: number | null = null

  if (search.firstMaximum) {
    let t = 0

    while (compareReal(rat(t + 1, n), search.firstMaximum) < 0) {
      t++
    }

    unionBeats = t
  }

  return {
    name,
    cells: n,
    degree,
    walls: graph.walls,
    firstBeat,
    firstP,
    ratio: firstBeat !== null && firstP !== null ? (firstBeat * firstBeat) / (firstP * n) : null,
    classicalAtFirst: firstBeat !== null ? displayRational(classical.found[firstBeat]!) : null,
    unionBeats,
    eccentricity,
    exact: sha(search.probability.map(keyOf).join(' ')),
  }
}
// pin:end unionBeats

// pin:start rowText
function rowText(r: Row): string {
  return `${r.name}: N ${r.cells}${r.walls ? ` (walls ${r.walls})` : ''}, ecc ${r.eccentricity}, T ${r.firstBeat ?? 'none'}, P ${r.firstP === null ? 'none' : show(r.firstP)}, T^2/(PN) ${r.ratio === null ? '-' : show(r.ratio)}, classical found at T ${r.classicalAtFirst === null ? '-' : show(r.classicalAtFirst)}, classical beats >= ${r.unionBeats ?? '-'}`
}
// pin:end rowText

// pin:start seriesReading
function seriesReading(rows: readonly Row[]): 'quadratic' | 'slower' | 'short' | 'no peak' {
  if (rows.some(r => r.ratio === null)) {
    return 'no peak'
  }

  const first = rows[0]!
  const last = rows[rows.length - 1]!

  if (first.cells < 16 || last.cells < 16 * first.cells) {
    return 'short'
  }

  return last.ratio! <= 2 * first.ratio! ? 'quadratic' : 'slower'
}
// pin:end seriesReading

const PINNED_BLOCKS = 6

function checkPins(): string[] {
  const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim()
  const own = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  const experiment = collapse(
    readFileSync(fileURLToPath(new URL('../../test/experiment/computation/bare-u-walk-search.ts', import.meta.url)), 'utf8'),
  )
  const blocks = [...own.matchAll(/\/\/ pin:start (\S+)\n([\s\S]*?)\/\/ pin:end \1\n/g)]
  const missing = blocks.filter(m => !experiment.includes(collapse(m[2]!))).map(m => m[1]!)

  if (blocks.length !== PINNED_BLOCKS) {
    missing.push(`${blocks.length} pinned blocks found, expected ${PINNED_BLOCKS}`)
  }

  return missing
}

// ---- the graphs ----

type Side = {
  name: string
  curvature: 'flat' | 'hyperbolic'
  neighbors: number[][]
  degree: number
  cells: number
  genus: number | null
  systole: number | null
  loopSystole: number | null
  construction: string
}

type Pair = { key: string; label: string; reference: boolean; flat: Side; hyperbolic: Side }

function quotientSide(q: ClosedQuotient): Side {
  return {
    name: q.name,
    curvature: q.curvature,
    neighbors: q.neighbors,
    degree: q.degree,
    cells: q.cells,
    genus: q.genus,
    systole: q.systole,
    loopSystole: q.loopSystole,
    construction: 'catalog (closedQuotients)',
  }
}

function torusSide(torus: FlatTorus, withSystole: boolean): Side {
  const symbol = [torus.p, torus.q]
  const cells = torus.analysis.faces
  const sys = withSystole
    ? ballSystole({
        neighbors: torus.analysis.neighbors,
        reference: referenceTiling(symbol, Math.max(REFERENCE_CELLS, 8 * cells)),
        referenceDegree: torus.p,
        centers: [0],
      })
    : null

  return {
    name: `torus-${symbol.join('-')}-genus-1-${torus.sides.join('x')}`,
    curvature: 'flat',
    neighbors: toLists(torus.analysis.neighbors),
    degree: torus.p,
    cells,
    genus: 1,
    systole: sys ? sys.systole : null,
    loopSystole: sys ? sys.loopSystole : null,
    construction: `flat {${symbol.join(',')}} torus of ${torus.sides.join(' x ')} ${torus.p === 3 ? 'rhombi' : 'tiles'}`,
  }
}

// the 2D pairs of E-CMP-0039 (flat symbol / hyperbolic symbol), and the moduli of their regular-map series (the same
// moduli as the models-0051 size series)
const PAIRS = [
  { key: '4.5', label: '{4,4}/{4,5}', p: 4, q: 5, flatName: 'torus-4-4-genus-1-5x6', hyperName: 'surface-4-5-genus-4', moduli: [5, 11, 19, 29, 31, 41] },
  { key: '6.4', label: '{6,3}/{6,4}', p: 6, q: 4, flatName: 'torus-6-3-genus-1-11x20', hyperName: 'surface-6-4-genus-56', moduli: [11, 13, 17, 19, 23, 29, 31, 37, 41, 43] },
  { key: '3.7', label: '{3,6}/{3,7}', p: 3, q: 7, flatName: 'torus-3-6-genus-1-4x7', hyperName: 'surface-3-7-genus-3', moduli: [7, 13, 29, 41, 43] },
] as const

const f = flags()
const set = f.get('set') ?? 'reference'
const pairKeys = listFlag(f, 'pairs', ['4.5', '6.4', '3.7'])
const onlyCells = new Set(intListFlag(f, 'cells', []))
const maxCells = intFlag(f, 'max-cells', 30_000)
const withSystole = (f.get('systole') ?? 'true') === 'true'
const start = performance.now()
const log = (line: string): void => console.log(`${line} (${seconds(start)} s)`)

if (set !== 'reference' && set !== 'series') {
  throw new Error(`grover-size-series: --set must be reference or series, got ${set}`)
}

const missingPins = checkPins()

if (missingPins.length > 0) {
  throw new Error(`grover-size-series: pinned blocks differ from the experiment's source: ${missingPins.join(', ')}`)
}

const report: Report = { ok: {} }
const failures: string[] = []
const pairs: Pair[] = []
const catalog = closedQuotients().map(e => e.quotient)

const named = (name: string): ClosedQuotient => {
  const q = catalog.find(e => e.name === name)

  if (!q) {
    throw new Error(`grover-size-series: closed quotient ${name} missing`)
  }

  return q
}

log(`set ${set}, pairs ${pairKeys.join(',')}, max cells ${maxCells}${onlyCells.size ? `, cells ${[...onlyCells].join(',')}` : ''}`)

for (const def of PAIRS.filter(d => pairKeys.includes(d.key))) {
  pairs.push({ key: def.key, label: def.label, reference: true, flat: quotientSide(named(def.flatName)), hyperbolic: quotientSide(named(def.hyperName)) })

  if (set !== 'series') {
    continue
  }

  const t0 = performance.now()
  const maps = regularMapSeries({ p: def.p, q: def.q, moduli: def.moduli, maxCells, minSystole: 1 })

  log(`${def.label}: ${maps.length} regular maps up to ${maxCells} cells in ${seconds(t0)} s`)

  for (const map of maps) {
    const cells = map.analysis.faces

    if (onlyCells.size > 0 && !onlyCells.has(cells)) {
      continue
    }

    // the catalog's map is the reference pair already (same size, genus, r and L)
    const ref = pairs.find(p => p.key === def.key && p.reference)!.hyperbolic

    if (cells === ref.cells && map.analysis.genus === ref.genus && map.systole === ref.systole && map.loopSystole === ref.loopSystole) {
      continue
    }

    const flat = flatPartnerOf(def.p, cells)

    if (!flat) {
      log(`${def.label}: no flat partner with ${cells} cells, skipped`)
      continue
    }

    pairs.push({
      key: def.key,
      label: def.label,
      reference: false,
      flat: torusSide(flat, withSystole),
      hyperbolic: {
        name: `surface-${def.p}-${def.q}-genus-${map.analysis.genus}-r${map.systole}-L${map.loopSystole ?? 'open'}`,
        curvature: 'hyperbolic',
        neighbors: toLists(map.analysis.neighbors),
        degree: def.p,
        cells,
        genus: map.analysis.genus,
        systole: map.systole,
        loopSystole: map.loopSystole,
        construction: `regular map of the (2,${def.p},${def.q}) rotation group in PGL(2,${map.modulus}), order ${map.groupOrder}, x = [${map.x.join(' ')}], y = [${map.y.join(' ')}]`,
      },
    })
  }
}

// one row per graph, run once per distinct graph name (a flat torus can partner several maps of one size)
const rows = new Map<string, Row>()

const rowFor = (side: Side): Row => {
  const known = rows.get(side.name)

  if (known) {
    return known
  }

  const t0 = performance.now()
  const row = searchRow(side.name, side.neighbors, side.degree, 0, report.ok)
  const quiet = groverSearch({ graph: arcGraph(side.neighbors, side.degree), marked: null, cap: NO_ORACLE_BEATS, runToCap: true })

  report.ok[`noOracle_${side.name}`] = quiet.probability.every(p => compareReal(p, rat(1, side.cells)) === 0)
  rows.set(side.name, row)
  log(`${rowText(row)}; exact P ${firstMaxima.get(side.name)}; genus ${side.genus ?? '-'}, r ${side.systole ?? '-'}, L ${side.loopSystole ?? '-'}; ${seconds(t0)} s`)

  return row
}

const pairRecords: object[] = []

for (const pair of pairs) {
  if (pair.flat.cells !== pair.hyperbolic.cells || pair.flat.degree !== pair.hyperbolic.degree) {
    failures.push(`${pair.label} ${pair.hyperbolic.name}: not matched (${pair.flat.cells}/${pair.flat.degree} against ${pair.hyperbolic.cells}/${pair.hyperbolic.degree})`)
  }

  const fr = rowFor(pair.flat)
  const hr = rowFor(pair.hyperbolic)
  const advantage = fr.ratio !== null && hr.ratio !== null ? fr.ratio / hr.ratio : null

  if (pair.reference) {
    console.log(`${pair.label}: flat ${rowText(fr)} | hyperbolic ${rowText(hr)}`)
  }

  pairRecords.push({
    key: pair.key,
    reference: pair.reference,
    cells: pair.flat.cells,
    advantage,
    flat: { ...fr, genus: pair.flat.genus, systole: pair.flat.systole, loopSystole: pair.flat.loopSystole, construction: pair.flat.construction, exactP: firstMaxima.get(pair.flat.name) },
    hyperbolic: { ...hr, genus: pair.hyperbolic.genus, systole: pair.hyperbolic.systole, loopSystole: pair.hyperbolic.loopSystole, construction: pair.hyperbolic.construction, exactP: firstMaxima.get(pair.hyperbolic.name) },
  })
}

if (set === 'reference') {
  const shape = [
    rowFor({ ...torusSide(hexagonTorus(15, 15), false), name: 'hexagon torus 15x15' }),
    rowFor({ ...torusSide(triangleTorus(5, 5), false), name: 'triangle torus 5x5' }),
  ]

  console.log(`Shape controls: ${shape.map(rowText).join('; ')}`)
}

// ---- the declared reading ----

const readings: object[] = []

for (const def of PAIRS.filter(d => pairKeys.includes(d.key))) {
  // the series reading uses the series maps plus the reference pair (one graph per name)
  const own = pairs.filter(p => p.key === def.key)
  const flatRows = [...new Map(own.map(p => [p.flat.name, rows.get(p.flat.name)!])).values()].sort((a, b) => a.cells - b.cells)
  const hyperRows = [...new Map(own.map(p => [p.hyperbolic.name, rows.get(p.hyperbolic.name)!])).values()].sort((a, b) => a.cells - b.cells)

  if (hyperRows.length === 0) {
    continue
  }

  const smallest = hyperRows[0]!.cells
  const largest = hyperRows[hyperRows.length - 1]!.cells
  const atSmall = hyperRows.filter(r => r.cells === smallest)
  const atLarge = hyperRows.filter(r => r.cells === largest)
  const flatSeries = seriesReading([...new Map(flatRows.map(r => [r.cells, r])).values()])

  let hyperSeries: string

  if (hyperRows.some(r => r.ratio === null)) {
    hyperSeries = 'no peak'
  } else if (smallest < 16 || largest < 16 * smallest) {
    hyperSeries = 'short'
  } else {
    const floor = atSmall.reduce((m, r) => (r.ratio! < m ? r.ratio! : m), Number.POSITIVE_INFINITY)

    hyperSeries = atLarge.every(r => r.ratio! <= 2 * floor) ? 'quadratic' : 'slower'
  }

  const advantages = own.map(p => {
    const fr = rows.get(p.flat.name)!
    const hr = rows.get(p.hyperbolic.name)!

    return { cells: p.flat.cells, map: p.hyperbolic.name, advantage: fr.ratio !== null && hr.ratio !== null ? fr.ratio / hr.ratio : null }
  })
  const shrinks = advantages.some(a => a.cells === largest && (a.advantage === null || a.advantage <= 1))
  const allAbove = advantages.every(a => a.advantage !== null && a.advantage > 1)
  const verdict = shrinks
    ? 'advantage shrinks'
    : hyperSeries === 'quadratic' && flatSeries === 'slower' && allAbove
      ? 'advantage scales'
      : 'unresolved'

  readings.push({ pair: def.label, sizes: [...new Set(advantages.map(a => a.cells))], flatSeries, hyperSeries, advantages, verdict })
  log(`${def.label}: flat ${flatSeries}, hyperbolic ${hyperSeries}, A per size ${advantages.map(a => `${a.cells}:${a.advantage === null ? '-' : show(a.advantage)}`).join(' ')}; ${verdict}`)
}

for (const [k, v] of Object.entries(report.ok)) {
  if (!v) {
    failures.push(k)
  }
}

log(`gates: ${Object.keys(report.ok).length} checked, ${failures.length} failed${failures.length ? `: ${failures.join(', ')}` : ''}`)

summary({
  item: 'vibe-computation-models-0069',
  part: 'a',
  set,
  maxCells,
  pairs: pairRecords,
  readings,
  failures,
  seconds: seconds(start),
})

if (failures.length > 0) {
  process.exitCode = 1
}
