// Q5 of the quantum ladder (item vibe-computation-models-0036; decisions 001, 003 and 004 of vibe/computation/models):
// quantum walks and spatial search, exact, with degree-matched controls. Library: code/compute/quantum/walk.
//
// Two walks.
// - The bare beat U on {3,4,3,4} against the flat {3,4,3,3} (bare-beat withGeometry): a lone vibe's spreading (second
//   moment), return and monitored hitting, and a marked-dock oracle (sign -1 on dock 0) interleaved with U. A lone vibe
//   never leaves its line (Q2), so the search collects only weight that starts on the 12 lines through the marked dock.
// - The exact Grover walk (coin (2/d) J - I, flip-flop shift, marked coin -I, uniform start) on the four degree-matched
//   pairs {4,4}/{4,5}, {6,3}/{6,4}, {3,6}/{3,7}, {3,4,3,3}/{3,4,3,4}: closed quotients of equal size (tiling-quotient),
//   a near-square flat torus as a shape control, and open balls (reflecting walls) of growing radius for the beat count
//   against N. Degrees 5 and 7 have no exact coin and are reported, not run.
//
// Classical controls on the same graphs: the dephased walk (|G_ij|^2, marked cell absorbing, exact found probability at
// the quantum peak beat, and the union bound found_t <= (t + 1)/N that it must obey), and BFS (the marked cell's
// eccentricity).
//
// Declared before the first full run (after a probe of the controls and the closed pairs, W/tmp/walk-probe2.ts):
// - first maximum: the running maximum of the marked-cell probability when the probability first falls below half of it,
//   counted only once that maximum has reached 2/N (walk.groverSearch);
// - speedup reading of a series of sizes: with R = T^2 / (P N) at each size (T the first-maximum beat, P its
//   probability; amplitude amplification would need about T / sqrt(P) beats, so R bounded is the quadratic speedup),
//   a series reads 'quadratic' when R at its largest N is at most twice R at its smallest, 'slower' when more than
//   twice, both only when N grows at least 16-fold from N >= 16; else 'short'. A reading over finite sizes, not a proof
//   of an asymptotic law;
// - calibration (instrument gates): the hypercube series must read quadratic, the square torus series slower (the
//   known log factor of two-dimensional search), the cycle must never reach 2/N, and with no marked cell the probability
//   stays exactly 1/N.
//
// Gates, each able to fail: exact coin unitarity on every exact degree (a wrong coin fails); the exact degree set
// {2, 3, 4, 6, 8, 24} among the lab degrees; total weight exactly q^(2t) d N every beat of every run; mass kept plus
// absorbed exactly 1 and the union bound in every classical run; the one-hop cone and no early hit in every localized
// run; bare U: the lone vibe's basis return 0, 9/16, 0, 9/256 (Q2), lines geodesic to radius 3, every term of the
// oracle search on the line of its slot, norm exact, a start off the marked dock's lines never reaching it (negative
// control), and the same line readings on both meshes.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { type Ninth, isZero, keyOf, ninth } from '@/code/algebra/ninth-field'
import { compareReal } from '@/code/algebra/ninth-real-sign'
import { scanSource } from '@/code/check/determinism'
import { lineChain } from '@/code/compute/quantum/particles'
import {
  type ArcGraph,
  arcGraph,
  bareLineSearch,
  bareLoneSpread,
  bareMonitoredHit,
  bfsDistances,
  coinSquareDefects,
  completeNeighbors,
  cycleNeighbors,
  dephasedSearch,
  displayRational,
  groverCoin,
  groverHitting,
  groverSearch,
  groverSpread,
  hypercubeNeighbors,
  searchCap,
} from '@/code/compute/quantum/walk'
import { hopDistances } from '@/code/measure/quantum-lab-measures'
import { type BeatGeometry, BEAT_GEOMETRIES, LINES, LINE_OF_SLOT, stepDock, withGeometry } from '@/code/rule/bare-beat'
import { type LabGeometryName, labGeometry } from '@/code/substrate/lab-geometry'
import {
  type ClosedQuotient,
  closedQuotients,
  d4Torus,
  hexagonTorus,
  squareTorus,
  triangleTorus,
} from '@/code/substrate/tiling-quotient'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULES = ['code/compute/quantum/walk.ts', 'test/experiment/computation/bare-u-walk-search.ts']
const MATH_CALL = /\bMath\s*\.\s*\w+/

const LAB_DEGREES = [2, 3, 4, 5, 6, 7, 8, 24]
const EXACT_LAB_DEGREES = '2,3,4,6,8,24'
const BARE_BEATS = 16
const BARE_SEARCH_RADIUS = 3
const BARE_SEARCH_BEATS = 16
const BARE_HIT_COORDINATE = 2
const NO_ORACLE_BEATS = 20

const sha = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 16)
const show = (x: number): string => String(Number(x.toPrecision(6)))
const rat = (n: number | bigint, d: number | bigint): Ninth => ninth([BigInt(n)], BigInt(d))

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

type Report = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  text: Record<string, string>
}

function toLists(neighbors: readonly ArrayLike<number>[]): number[][] {
  return neighbors.map(row => Array.from(row))
}

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

function rowText(r: Row): string {
  return `${r.name}: N ${r.cells}${r.walls ? ` (walls ${r.walls})` : ''}, ecc ${r.eccentricity}, T ${r.firstBeat ?? 'none'}, P ${r.firstP === null ? 'none' : show(r.firstP)}, T^2/(PN) ${r.ratio === null ? '-' : show(r.ratio)}, classical found at T ${r.classicalAtFirst === null ? '-' : show(r.classicalAtFirst)}, classical beats >= ${r.unionBeats ?? '-'}`
}

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

function quotientNamed(entries: readonly ClosedQuotient[], name: string): ClosedQuotient {
  const q = entries.find(e => e.name === name)

  if (!q) {
    throw new Error(`FAIL: closed quotient ${name} missing`)
  }

  return q
}

// ---- bare U on one mesh ----

type BareReport = {
  ok: Record<string, boolean>
  text: Record<string, string>
  lineKey: string
  ballSizes: number[]
  markedOracle: readonly Ninth[]
  markedFree: readonly Ninth[]
}

function measureBare(geometry: BeatGeometry): BareReport {
  return withGeometry(geometry, () => {
    const ok: Record<string, boolean> = {}
    const text: Record<string, string> = {}

    // hop distances to radius 3 (traps.md: radius 4 builds 162,033 docks); lines through dock 0 are geodesic there
    const distance = hopDistances(0, BARE_SEARCH_RADIUS)
    const ballSizes = [0, 0, 0, 0]

    for (const r of distance.values()) {
      for (let R = r; R <= BARE_SEARCH_RADIUS; R++) {
        ballSizes[R]!++
      }
    }

    let geodesicDefects = 0

    for (const [slotA] of LINES) {
      for (const [dock, k] of lineChain(0, slotA, BARE_SEARCH_RADIUS)) {
        if (distance.get(dock) !== (k < 0 ? -k : k)) {
          geodesicDefects++
        }
      }
    }

    ok.geodesicLines = geodesicDefects === 0

    // a lone vibe (slot 0, tone +1, role 0)
    const lone = bareLoneSpread(0, 1, 0, BARE_BEATS)
    const q2Return = [rat(0, 1), rat(9, 16), rat(0, 1), rat(9, 256)]

    ok.loneReturnQ2 = q2Return.every((x, i) => compareReal(x, lone.basisReturn[i]!) === 0)
    ok.loneCone = lone.supportRadius.every((r, i) => r === i + 1)

    const onLine = stepDock(stepDock(0, 0), 0)
    const offSlot = LINES.find(([a]) => LINE_OF_SLOT[a] !== LINE_OF_SLOT[0])![0]
    const offLine = stepDock(0, offSlot)
    const hit = bareMonitoredHit({ slot: 0, tone: 1, role: 0, target: onLine, beats: BARE_BEATS, targetDistance: 2 })
    const miss = bareMonitoredHit({ slot: 0, tone: 1, role: 0, target: offLine, beats: BARE_BEATS, targetDistance: 1 })

    ok.bareHitCone = hit.earlyHits === 0
    ok.bareOffLineNeverHit = miss.hit.every(isZero)

    // the oracle search on the lines through dock 0, and the start off them (negative control)
    const withOracle = bareLineSearch({ radius: BARE_SEARCH_RADIUS, beats: BARE_SEARCH_BEATS, oracle: true })
    const free = bareLineSearch({ radius: BARE_SEARCH_RADIUS, beats: BARE_SEARCH_BEATS, oracle: false })
    const off = bareLineSearch({ radius: BARE_SEARCH_RADIUS, beats: BARE_SEARCH_BEATS, oracle: true, offLines: true })

    ok.bareSearchOnLines = withOracle.offLineTerms === 0 && free.offLineTerms === 0 && off.offLineTerms === 0
    ok.bareSearchNorm = withOracle.normDefects === 0 && free.normDefects === 0 && off.normDefects === 0
    ok.bareSearchStart = withOracle.startStates === 96 * (1 + 2 * BARE_SEARCH_RADIUS)
    ok.bareOffLinesNeverReach = off.markedWeight.every(isZero)

    const lineKey = [
      ...lone.secondMoment.map(keyOf),
      ...lone.dockReturn.map(keyOf),
      ...hit.hit.map(keyOf),
      ...withOracle.markedWeight.map(keyOf),
      ...free.markedWeight.map(keyOf),
    ].join(' ')

    text.ballSizes = ballSizes.join(',')
    text.secondMoment = lone.secondMoment.map(keyOf).join(', ')
    text.secondMomentDisplay = lone.secondMoment.map(x => show(displayRational(x))).join(', ')
    text.dockReturn = lone.dockReturn.map(keyOf).join(', ')
    text.basisReturn = lone.basisReturn.slice(0, 8).map(keyOf).join(', ')
    text.hit = hit.hit.map(keyOf).join(', ')
    text.hitCumulative = `${keyOf(hit.cumulative)} (${show(displayRational(hit.cumulative))})`

    return { ok, text, lineKey, ballSizes, markedOracle: withOracle.markedWeight, markedFree: free.markedWeight }
  })
}

// ---- the whole report ----

function compute(scale: number): Report {
  const ok: Record<string, boolean> = {}
  const numbers: Record<string, number> = {}
  const text: Record<string, string> = {}
  const large = scale >= 1.5

  // ---- coins ----
  const coins = LAB_DEGREES.map(groverCoin)

  text.exactDegrees = coins
    .filter(c => c.exact)
    .map(c => c.degree)
    .join(',')

  text.inexactDegrees = coins
    .filter(c => !c.exact)
    .map(c => c.degree)
    .join(',')

  ok.exactDegreeSet = text.exactDegrees === EXACT_LAB_DEGREES
  ok.coinUnitary = coins.filter(c => c.exact).every(c => coinSquareDefects(c) === 0)
  numbers.wrongCoinDefects = coinSquareDefects({ ...groverCoin(4), c: 2n })
  ok.coinControl = numbers.wrongCoinDefects > 0

  // a degree-5 graph is refused (fail closed)
  let refused = false

  try {
    groverSearch({ graph: arcGraph(completeNeighbors(6), 5), marked: 0, cap: 4 })
  } catch {
    refused = true
  }

  ok.inexactRefused = refused

  // ---- calibration series ----
  const hypercube = [4, 6, 8, 12].map(n => searchRow(`Q${n}`, hypercubeNeighbors(n), n, 0, ok))
  const complete = [5, 7, 9, 13, 25].map(n => searchRow(`K${n}`, completeNeighbors(n), n - 1, 0, ok))
  const square = [4, 8, 16, 32].map(L => searchRow(`square torus ${L}x${L}`, toLists(squareTorus(L, L).analysis.neighbors), 4, 0, ok))
  const cycles = [16, 32, 64].map(n => searchRow(`C${n}`, cycleNeighbors(n), 2, 0, ok))

  text.hypercube = hypercube.map(rowText).join('; ')
  text.complete = complete.map(rowText).join('; ')
  text.square = square.map(rowText).join('; ')
  text.cycles = cycles.map(rowText).join('; ')
  text.hypercubeReading = seriesReading(hypercube)
  text.squareReading = seriesReading(square)
  ok.calibrationHypercube = text.hypercubeReading === 'quadratic'
  ok.calibrationSquare = text.squareReading === 'slower'
  ok.calibrationCycle = cycles.every(r => r.firstBeat === null)

  // ---- closed quotients ----
  const catalog = closedQuotients().map(e => e.quotient)
  const pairs: [string, ClosedQuotient, ClosedQuotient][] = [
    ['{4,4}/{4,5}', quotientNamed(catalog, 'torus-4-4-genus-1-5x6'), quotientNamed(catalog, 'surface-4-5-genus-4')],
    ['{6,3}/{6,4}', quotientNamed(catalog, 'torus-6-3-genus-1-11x20'), quotientNamed(catalog, 'surface-6-4-genus-56')],
    ['{3,6}/{3,7}', quotientNamed(catalog, 'torus-3-6-genus-1-4x7'), quotientNamed(catalog, 'surface-3-7-genus-3')],
    [
      '{3,4,3,3}/{3,4,3,4}',
      quotientNamed(catalog, 'torus-3-4-3-3-side-8'),
      quotientNamed(catalog, 'honeycomb-3-4-3-4-level-4'),
    ],
  ]
  const closedRows: string[] = []
  const curvatureDiffs: string[] = []

  for (const [label, flat, hyper] of pairs) {
    ok[`matched_${label}`] = flat.cells === hyper.cells && flat.degree === hyper.degree

    const f = searchRow(flat.name, flat.neighbors, flat.degree, 0, ok)
    const h = searchRow(hyper.name, hyper.neighbors, hyper.degree, 0, ok)

    closedRows.push(`${label}: flat ${rowText(f)} | hyperbolic ${rowText(h)}`)
    curvatureDiffs.push(
      `${label} N ${f.cells}: P ${show(f.firstP ?? 0)} vs ${show(h.firstP ?? 0)}, T ${f.firstBeat} vs ${h.firstBeat}, T^2/(PN) ${show(f.ratio ?? 0)} vs ${show(h.ratio ?? 0)}`,
    )
    numbers[`closedP_flat_${label}`] = f.firstP ?? 0
    numbers[`closedP_hyper_${label}`] = h.firstP ?? 0
    numbers[`closedT_flat_${label}`] = f.firstBeat ?? 0
    numbers[`closedT_hyper_${label}`] = h.firstBeat ?? 0
  }

  text.closed = closedRows.join('; ')
  text.curvature = curvatureDiffs.join('; ')

  // shape controls: a near-square flat torus of nearby size, and the unmatched {8,3} surface
  const shape = [
    searchRow('hexagon torus 15x15', toLists(hexagonTorus(15, 15).analysis.neighbors), 6, 0, ok),
    searchRow('triangle torus 5x5', toLists(triangleTorus(5, 5).analysis.neighbors), 3, 0, ok),
    searchRow('{8,3} surface genus 8 (no flat partner)', quotientNamed(catalog, 'surface-8-3-genus-8').neighbors, 8, 0, ok),
  ]

  text.shape = shape.map(rowText).join('; ')

  // the D_4 pair across sizes: flat tori of side 4, 6, 8 (and 10), the {3,4,3,4} level-4 quotient (and level 5)
  const d4Sides = large ? [4, 6, 8, 10] : [4, 6, 8]
  const d4 = d4Sides.map(side => searchRow(`D4 torus side ${side}`, d4Torus(side).neighbors, 24, 0, ok))
  const honeycombRows = [searchRow('{3,4,3,4} level 4', quotientNamed(catalog, 'honeycomb-3-4-3-4-level-4').neighbors, 24, 0, ok)]

  if (large) {
    honeycombRows.push(searchRow('{3,4,3,4} level 5', quotientNamed(catalog, 'honeycomb-3-4-3-4-level-5').neighbors, 24, 0, ok))
  }

  text.d4Series = d4.map(rowText).join('; ')
  text.honeycombSeries = honeycombRows.map(rowText).join('; ')
  text.d4Reading = seriesReading(d4)

  // no marked cell: the uniform state is fixed, so the probability stays exactly 1/N (negative control)
  let noOracleDefects = 0

  for (const q of [...pairs.flatMap(([, f, h]) => [f, h])]) {
    const s = groverSearch({ graph: arcGraph(q.neighbors, q.degree), marked: null, cap: NO_ORACLE_BEATS, runToCap: true })

    noOracleDefects += s.probability.filter(p => compareReal(p, rat(1, q.cells)) !== 0).length
  }

  numbers.noOracleDefects = noOracleDefects
  ok.noOracleUniform = noOracleDefects === 0

  // ---- open balls with reflecting walls: the beat count against N ----
  const ballRadii: [LabGeometryName, number[]][] = [
    // every series starts at the first radius with N >= 16 (the reading rule's floor)
    ['{4,4}', [3, 6, 12, 24]],
    ['{4,5}', large ? [2, 3, 4, 5, 6, 7, 8] : [2, 3, 4, 5, 6]],
    ['{6,3}', [2, 4, 8, 12]],
    ['{6,4}', large ? [2, 3, 4, 5, 6] : [2, 3, 4, 5]],
    ['{3,6}', [3, 6, 12, 24]],
    ['{3,7}', [3, 6, 8, 10, 12]],
    ['{3,4,3,3}', large ? [1, 2, 3, 4, 5] : [1, 2, 3]],
    ['{3,4,3,4}', large ? [1, 2, 3] : [1, 2]],
  ]
  const ballReadings: string[] = []

  for (const [name, radii] of ballRadii) {
    const rows = radii.map(r => {
      const g = labGeometry({ name, radius: r, exact: true, maxCells: 20000 })

      return searchRow(`${name} ball r${r}`, toLists(g.graph.neighbors), g.spec.degree, 0, ok)
    })

    text[`balls_${name}`] = rows.map(rowText).join('; ')
    ballReadings.push(`${name} ${seriesReading(rows)}`)
  }

  text.ballReadings = ballReadings.join(', ')

  // ---- a walker started on one cell: spreading, return, hitting (balls of radius >= beats: no wall reached) ----
  const spreadPairs: [string, LabGeometryName, LabGeometryName, number][] = [
    ['{4,4}/{4,5}', '{4,4}', '{4,5}', 8],
    ['{6,3}/{6,4}', '{6,3}', '{6,4}', 6],
    ['{3,6}/{3,7}', '{3,6}', '{3,7}', 12],
    ['{3,4,3,3}/{3,4,3,4}', '{3,4,3,3}', '{3,4,3,4}', 3],
  ]
  const spreadRows: string[] = []

  for (const [label, flatName, hyperName, beats] of spreadPairs) {
    const parts: string[] = []

    for (const name of [flatName, hyperName]) {
      const g = labGeometry({ name, radius: beats, exact: true, maxCells: 20000 })
      const graph: ArcGraph = arcGraph(toLists(g.graph.neighbors), g.spec.degree)
      const spread = groverSpread({ graph, distance: g.distance, beats })
      const target = g.distance.indexOf(2)
      const hit = groverHitting({ graph, distance: g.distance, target, beats })

      ok[`spreadUnitary_${name}`] = spread.unitaryDefects === 0
      ok[`spreadCone_${name}`] = spread.coneExcess === 0 && hit.earlyHits === 0

      parts.push(
        `${name} second moment ${spread.secondMoment.map(x => show(displayRational(x))).join(', ')}; over t^2 at t = ${beats}: ${show(displayRational(spread.secondMoment[beats - 1]!) / (beats * beats))}; return ${spread.returnProbability.map(x => show(displayRational(x))).join(', ')}; hit at distance 2 per beat ${hit.hit.map(x => show(displayRational(x))).join(', ')}, total ${show(displayRational(hit.cumulative))}`,
      )
    }

    spreadRows.push(`${label}: ${parts.join(' | ')}`)
  }

  text.spread = spreadRows.join('; ')

  // ---- bare U on both meshes ----
  const [hyperBare, flatBare] = BEAT_GEOMETRIES.map(measureBare) as [BareReport, BareReport]

  for (const [tag, b] of [
    ['h', hyperBare],
    ['f', flatBare],
  ] as const) {
    for (const [k, v] of Object.entries(b.ok)) {
      ok[`${tag}_${k}`] = v
    }

    for (const [k, v] of Object.entries(b.text)) {
      text[`${tag}_${k}`] = v
    }
  }

  ok.bareSameLines = hyperBare.lineKey === flatBare.lineKey

  // ball-normalized success: weight / (96 |B_R|); its best times |B_R| against 1 (a uniform guess)
  for (const [tag, b] of [
    ['h', hyperBare],
    ['f', flatBare],
  ] as const) {
    const ball = b.ballSizes[BARE_SEARCH_RADIUS]!
    const norm = 96 * ball
    const pOracle = b.markedOracle.map(w => displayRational(w) / norm)
    const pFree = b.markedFree.map(w => displayRational(w) / norm)

    // the best beat t >= 1, decided exactly on the weights
    let bestBeat = 1

    for (let t = 2; t < b.markedOracle.length; t++) {
      if (compareReal(b.markedOracle[t]!, b.markedOracle[bestBeat]!) > 0) {
        bestBeat = t
      }
    }

    const best = pOracle[bestBeat]!

    let freeBeat = 1

    for (let t = 2; t < b.markedFree.length; t++) {
      if (compareReal(b.markedFree[t]!, b.markedFree[freeBeat]!) > 0) {
        freeBeat = t
      }
    }

    numbers[`${tag}_bareFreeBestBeat`] = freeBeat
    numbers[`${tag}_bareFreeBestTimesN`] = pFree[freeBeat]! * ball
    numbers[`${tag}_bareOracleBelowFree`] =
      compareReal(b.markedOracle[bestBeat]!, b.markedFree[freeBeat]!) < 0 ? 1 : 0

    numbers[`${tag}_bareBall`] = ball
    numbers[`${tag}_bareBestBeat`] = bestBeat
    numbers[`${tag}_bareBestP`] = best
    numbers[`${tag}_bareBestTimesN`] = best * ball
    numbers[`${tag}_bareBoundTimesN`] = 1 + 2 * BARE_SEARCH_RADIUS
    text[`${tag}_bareSearch`] = pOracle.map(show).join(', ')
    text[`${tag}_bareFree`] = pFree.map(show).join(', ')
    text[`${tag}_bareSearchWeight`] = b.markedOracle.map(keyOf).join(', ')
  }

  // ---- determinism of the new sources ----
  let sourceFindings = 0

  for (const file of NEW_MODULES) {
    const source = readFileSync(resolve(BASE, file), 'utf8')

    sourceFindings += scanSource(file, source).length + (MATH_CALL.test(source) ? 1 : 0)
  }

  numbers.sourceFindings = sourceFindings
  ok.sourceClean = sourceFindings === 0

  return { ok, numbers, text }
}

const INSTRUMENT = [
  'exactDegreeSet',
  'coinUnitary',
  'coinControl',
  'inexactRefused',
  'calibrationHypercube',
  'calibrationSquare',
  'calibrationCycle',
  'noOracleUniform',
  'bareSameLines',
  'h_loneReturnQ2',
  'f_loneReturnQ2',
  'h_bareOffLinesNeverReach',
  'f_bareOffLinesNeverReach',
  'sourceClean',
]

export default experiment({
  id: 'computation/bare-u-walk-search',
  code: 'E-CMP-0039',
  title:
    'quantum walks and spatial search, exact, with degree-matched controls (Q5): bare U spreads a lone vibe on one line only, the same on {3,4,3,4} and the flat {3,4,3,3}, so a marked-dock oracle with U collects at most (1 + 2R)/|B_R| (no search speedup on either mesh); the exact Grover walk (degrees 2, 3, 4, 6, 8, 24; none for 5 and 7) searches closed quotients of equal size and degree, where the hyperbolic {4,5}, {6,4}, {3,7} surfaces concentrate more than their flat tori and the {3,4,3,4} level-4 quotient equals the flat D4 torus, against the dephased walk and BFS',
  category: 'computation',
  substrates: ['{3,4,3,4}', '{3,4,3,3}', '{4,4}', '{4,5}', '{6,3}', '{6,4}', '{3,6}', '{3,7}', '{8,3}'],
  depth: 'L2',
  paper: false,
  // context.scale >= 1.5 adds the larger sizes (D4 torus side 10, {3,4,3,4} level 5 and ball radius 3, more balls);
  // not declared `scales`, so the perturbation check leaves it alone. Those runs belong on the M3 machine (q-ladder.md).
  run(context) {
    const scale = context.scale ?? 1
    const firstRun = compute(scale)
    const secondRun = compute(scale)
    const identical = JSON.stringify(firstRun) === JSON.stringify(secondRun)
    const failed = Object.entries(firstRun.ok)
      .filter(([, v]) => !v)
      .map(([k]) => k)
    const instrument = identical && INSTRUMENT.every(k => firstRun.ok[k] === true)
    const allPass = failed.length === 0 && identical
    const n = firstRun.numbers
    const t = firstRun.text

    return verdict({
      status: !instrument ? 'fail' : allPass ? 'pass' : 'partial',
      claim: !instrument
        ? `an instrument gate failed (${failed.join(', ') || (identical ? 'none' : 'two runs differ')})`
        : `exact Grover coins on degrees ${t.exactDegrees}, none on ${t.inexactDegrees}; calibration: hypercube ${t.hypercubeReading}, square torus ${t.squareReading}, cycle never above 1/N. Closed pairs of equal size and degree (flat vs hyperbolic): ${t.curvature}. Balls: ${t.ballReadings}. Bare U: a lone vibe spreads on its line only, identical on both meshes; the oracle search reaches at best ${show(n.h_bareBestTimesN!)}/N on {3,4,3,4} (N = ${n.h_bareBall}) and ${show(n.f_bareBestTimesN!)}/N on {3,4,3,3} (N = ${n.f_bareBall}), ${n.h_bareOracleBelowFree === 1 ? 'below' : 'not below'} the ${show(n.h_bareFreeBestTimesN!)}/N the same start reaches with no oracle, bound ${n.h_bareBoundTimesN}/N${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`,
      metrics: n,
      control: {
        identicalBytes: identical ? 1 : 0,
        wrongCoinDefects: n.wrongCoinDefects!,
        noOracleDefects: n.noOracleDefects!,
      },
      notes: `L2, exact (Grover amplitudes in Z[1/6], bare U in Z[zeta_9][1/6]; displayed decimals only). Hypercube: ${t.hypercube}. Complete: ${t.complete}. Square tori: ${t.square}. Cycles: ${t.cycles}. Closed pairs: ${t.closed}. Shape controls: ${t.shape}. D4 tori: ${t.d4Series} (${t.d4Reading}); {3,4,3,4}: ${t.honeycombSeries}. Balls {4,4}: ${t['balls_{4,4}']}; {4,5}: ${t['balls_{4,5}']}; {6,3}: ${t['balls_{6,3}']}; {6,4}: ${t['balls_{6,4}']}; {3,6}: ${t['balls_{3,6}']}; {3,7}: ${t['balls_{3,7}']}; {3,4,3,3}: ${t['balls_{3,4,3,3}']}; {3,4,3,4}: ${t['balls_{3,4,3,4}']}. Spreading from one cell: ${t.spread}. Bare U ({3,4,3,4}): balls ${t.h_ballSizes}; lone vibe second moment ${t.h_secondMoment} (${t.h_secondMomentDisplay}); dock return ${t.h_dockReturn}; basis return ${t.h_basisReturn}; monitored hit at line coordinate ${BARE_HIT_COORDINATE}: ${t.h_hit}, total ${t.h_hitCumulative}; oracle search P per beat ${t.h_bareSearch} (exact weights ${t.h_bareSearchWeight}); without oracle ${t.h_bareFree}. Flat {3,4,3,3}: balls ${t.f_ballSizes}; oracle search ${t.f_bareSearch}. Failed checks: ${failed.join(', ') || 'none'}.`,
    })
  },
})
