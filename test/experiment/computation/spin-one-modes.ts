// M8 slice 2: collective modes of the reversible spin-1 Q2R rule (E-CMP-0044) on matched closed quotients, flat
// against degree-matched hyperbolic, under both schedule families (item vibe-computation-models-0052, plan.md M8).
// Criteria, measures, run lengths and the confound filter were fixed in
// note/project/vibe/computation/models/m8-resonance.md ("Slice 2") before the first run.
//
// Per graph, schedule family (greedy-bfs, greedy-reverse-bfs), crystal field (ising, low) and energy (k = 2, 3, 4 of 8
// between the ground and the infinite-temperature mean, identical per cell on both sides of a pair), one structured
// quenched start is run: the exact orbit period up to a declared cap, the magnetization Q(t) and energy channel D(t)
// along the orbit (exact series periods when the orbit closes), and over a fixed window the phase order (mean Q^2 /
// N^2), the integer-autocovariance memory lags of Q and D, the D fluctuation, and the frozen and blinker shares. A
// measure is curvature-sensitive only if the hyperbolic value lies outside the flat size-series range on the same side
// in every cell of the comparison; then it is still not credited if bipartiteness, systole, symmetry (|Aut| / N) or
// size explains it. Exact integers and bigint rationals only; floats appear in printed summaries. No random numbers.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { scanSource } from '@/code/check/determinism'
import { automorphismOrder } from '@/code/measure/graph-automorphism'
import {
  autocovariance,
  memoryLag,
  minimalSeriesPeriod,
  modeRun,
  oscillationLag,
  verifyPeriod,
  type MemoryLag,
  type ModeRun,
} from '@/code/measure/spin-one-modes'
import { compareFractions, fraction, fractionToNumber, isBipartite, type Fraction } from '@/code/measure/z3-resonance'
import {
  cellGraph,
  fibonacciState,
  groundEnergy,
  independentSetSchedule,
  quenchToEnergy,
  sweepStarts,
  totalEnergy,
  type BlumeCapel,
  type CellGraph,
  type ColoringMethod,
} from '@/code/rule/spin-one-q2r'
import {
  ballSystole,
  closedQuotients,
  d4Torus,
  findRotaryMap,
  hexagonTorus,
  REFERENCE_CELLS,
  referenceTiling,
  squareTorus,
  triangleTorus,
} from '@/code/substrate/tiling-quotient'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type Check = { name: string; ok: boolean }

// ---- declared parameters (m8-resonance.md, slice 2) ----

const BURN = 256
const WINDOW = 2048
const PERIOD_WORK = 2 ** 20
const LEVELS = [2, 3, 4] as const
const FAMILIES: readonly ColoringMethod[] = ['greedy-bfs', 'greedy-reverse-bfs']
const FIELDS = ['ising', 'low'] as const
const SERIES_SIZE = 6

type FieldLabel = (typeof FIELDS)[number]

const periodCap = (cells: number): number => Math.max(BURN + WINDOW, Math.floor(PERIOD_WORK / cells))

function crystalField(label: FieldLabel, z: number): number {
  return label === 'ising' ? -(z + 1) : Math.max(1, Math.floor(z / 4))
}

// ---- graphs ----

type Graph = {
  name: string
  curvature: 'flat' | 'hyperbolic'
  degree: number
  symbol: readonly number[]
  neighbors: number[][]
  graph: CellGraph
  loopSystole: number | null
  // the rotation group order of a regular map, for the Lagrange gate on |Aut|
  rotationOrder: number | null
}

type GraphFacts = { bipartite: boolean; aut: bigint | null; autLevels: number }

const referenceCache = new Map<string, number[][]>()

function reference(symbol: readonly number[]): number[][] {
  const key = symbol.join(',')

  let r = referenceCache.get(key)

  if (!r) {
    r = referenceTiling(symbol, key === '3,4,3,3' ? 20000 : REFERENCE_CELLS)
    referenceCache.set(key, r)
  }

  return r
}

function loopSystoleOf(neighbors: number[][], symbol: readonly number[], degree: number, transitive: boolean): number | null {
  return ballSystole({ neighbors, reference: reference(symbol), referenceDegree: degree, ...(transitive ? { centers: [0] } : {}) }).loopSystole
}

function makeGraph(input: Omit<Graph, 'graph'>): Graph {
  return { ...input, graph: cellGraph(input.neighbors) }
}

function torus(degree: number, a: number, b: number): Graph {
  const t = degree === 4 ? squareTorus(a, b) : degree === 6 ? hexagonTorus(a, b) : triangleTorus(a, b)
  const symbol = [t.p, t.q]
  const neighbors = t.analysis.neighbors

  return makeGraph({
    name: `${degree === 4 ? 'square' : degree === 6 ? 'hexagon' : 'triangle'}-${a}x${b}`,
    curvature: 'flat',
    degree,
    symbol,
    neighbors,
    loopSystole: loopSystoleOf(neighbors, symbol, degree, true),
    rotationOrder: null,
  })
}

function d4(side: number): Graph {
  const t = d4Torus(side)

  return makeGraph({
    name: `d4-side-${side}`,
    curvature: 'flat',
    degree: 24,
    symbol: [3, 4, 3, 3],
    neighbors: t.neighbors,
    loopSystole: loopSystoleOf(t.neighbors, [3, 4, 3, 3], 24, true),
    rotationOrder: null,
  })
}

// slice 1's flat series (within a fifth of n below 100 cells, a tenth above, aspect <= 1.6), cut to the SERIES_SIZE
// members nearest n (ties to the squarer torus), the partner's sides left out
function flatSeries(degree: number, n: number, partnerSides: readonly [number, number] | null): Graph[] {
  if (degree === 24) {
    return [4, 6, 8, 10].filter(s => s !== partnerSides?.[0]).map(d4)
  }

  const band = n < 100 ? n / 5 : n / 10
  const found: { a: number; b: number; cells: number }[] = []

  for (let a = 3; a * a <= n + band; a++) {
    for (let b = a; b <= 1.6 * a; b++) {
      const cells = degree === 3 ? 2 * a * b : a * b

      if (Math.abs(cells - n) > band) {
        continue
      }

      if (a === partnerSides?.[0] && b === partnerSides[1]) {
        continue
      }

      found.push({ a, b, cells })
    }
  }

  found.sort((x, y) => Math.abs(x.cells - n) - Math.abs(y.cells - n) || x.b - x.a - (y.b - y.a) || x.a - y.a)

  return found.slice(0, SERIES_SIZE).map(f => torus(degree, f.a, f.b))
}

type PairSpec = { label: string; hyperbolic: Graph; partner: Graph; series: Graph[] }

function pairSpecs(): PairSpec[] {
  const entries = closedQuotients()
  const byName = new Map(entries.map(e => [e.quotient.name, e]))
  const specs: PairSpec[] = []

  for (const e of entries) {
    const q = e.quotient

    if (q.curvature !== 'hyperbolic' || q.partner === null) {
      continue
    }

    const pe = byName.get(q.partner)!
    const p = pe.quotient
    const hyperbolic = makeGraph({
      name: q.name,
      curvature: 'hyperbolic',
      degree: q.degree,
      symbol: q.symbol,
      neighbors: q.neighbors,
      loopSystole: q.loopSystole,
      rotationOrder: e.rotary?.groupOrder ?? null,
    })
    const partner = makeGraph({
      name: p.name,
      curvature: 'flat',
      degree: p.degree,
      symbol: p.symbol,
      neighbors: p.neighbors,
      loopSystole: p.loopSystole,
      rotationOrder: null,
    })

    // the D4 torus of side s has s^4 / 2 cells
    let d4Side = 2

    while (d4Side ** 4 < 2 * p.cells) {
      d4Side += 2
    }

    const sides: [number, number] | null = pe.torus ? pe.torus.sides : q.degree === 24 ? [d4Side, d4Side] : null

    specs.push({ label: `${q.name}/${p.name}`, hyperbolic, partner, series: flatSeries(q.degree, q.cells, sides) })
  }

  // the two larger M2-B pairs
  for (const [p, qq, modulus, a, b] of [
    [4, 5, 11, 15, 22],
    [3, 7, 13, 13, 14],
  ] as const) {
    const rotary = findRotaryMap({ p, q: qq, moduli: [modulus], reference: reference([p, qq]), minSystole: 1 })

    if (!rotary) {
      throw new Error(`spin-one-modes: no {${p},${qq}} map in PGL(2,${modulus})`)
    }

    const neighbors = rotary.analysis.neighbors
    const hyperbolic = makeGraph({
      name: `surface-${p}-${qq}-pgl2-${modulus}-${rotary.analysis.faces}`,
      curvature: 'hyperbolic',
      degree: p,
      symbol: [p, qq],
      neighbors,
      loopSystole: loopSystoleOf(neighbors, [p, qq], p, false),
      rotationOrder: rotary.groupOrder,
    })
    const partner = torus(p, a, b)

    specs.push({ label: `${hyperbolic.name}/${partner.name}`, hyperbolic, partner, series: flatSeries(p, rotary.analysis.faces, [a, b]) })
  }

  return specs
}

// ---- runs ----

type RunKey = `${string}|${ColoringMethod}|${FieldLabel}|${number}`

type RunCell = { run: ModeRun | null; target: number; reached: number | null; start: Int8Array | null }

function energyTarget(graph: CellGraph, model: BlumeCapel, label: FieldLabel, k: number): number {
  const n = graph.cells
  const ground = groundEnergy(graph, model)

  // E_inf: Delta N in the Ising limit (every tone +-1), 2 Delta N / 3 at low; the target is
  // ground + floor(k (E_inf - ground) / 8), in integers
  return label === 'ising'
    ? ground + Math.floor((k * (model.crystalField * n - ground)) / 8)
    : ground + Math.floor((k * (2 * model.crystalField * n - 3 * ground)) / 24)
}

function runGraph(g: Graph, checks: Check[], into: Map<RunKey, RunCell>): void {
  for (const method of FAMILIES) {
    const schedule = independentSetSchedule({ graph: g.graph, method, colorOrder: 'forward' })

    for (const label of FIELDS) {
      const model: BlumeCapel = { coupling: 1, crystalField: crystalField(label, g.degree) }
      const starts = sweepStarts(label === 'ising')
      const warm = fibonacciState(g.graph, starts.warm)
      const hot = fibonacciState(g.graph, starts.hot)
      const warmEnergy = totalEnergy(g.graph, model, warm)

      for (const k of LEVELS) {
        const key: RunKey = `${g.name}|${method}|${label}|${k}`

        if (into.has(key)) {
          continue
        }

        const target = energyTarget(g.graph, model, label, k)
        const quenched = quenchToEnergy({ graph: g.graph, model, state: target <= warmEnergy ? warm : hot, target })

        if (!quenched) {
          into.set(key, { run: null, target, reached: null, start: null })
          continue
        }

        const run = modeRun({ graph: g.graph, model, schedule, state: quenched.state, burn: BURN, window: WINDOW, cap: periodCap(g.graph.cells) })
        const tag = `${g.name} ${method} ${label} k${k}`

        checks.push({ name: `G1 ${tag}: E kept, book-kept Q, D and fields exact, ${run.rounds} inverse rounds restore the start`, ok: run.gates.energyKept && run.gates.bookkeepingExact && run.gates.inverseRestores })

        if (label === 'ising') {
          checks.push({ name: `G2 ${tag}: D never changes in the Ising limit`, ok: run.gates.dConstant })
        }

        if (label === 'ising' && g.degree % 2 === 1) {
          checks.push({ name: `G5 ${tag}: the odd-degree Ising limit never moves`, ok: run.moves === 0 })
        }

        if (run.period !== null) {
          checks.push({ name: `G3 ${tag}: period ${run.period} re-verified on a fresh run`, ok: verifyPeriod({ graph: g.graph, model, schedule, state: quenched.state, period: run.period }) })
        }

        into.set(key, { run, target, reached: quenched.energy, start: quenched.state })
      }
    }
  }
}

// ---- placement and the criterion ----

type Placement = 'above' | 'below' | 'inside' | 'unresolved' | 'frozen' | 'missing'

const MEASURES = ['period', 'phaseOrder', 'tauQ', 'tauD', 'varD', 'frozen', 'blink'] as const

type Measure = (typeof MEASURES)[number]

// numbers: null = unresolved (an open upper end on the flat side); fractions compare exactly
type Value = { kind: 'number'; v: number | null } | { kind: 'fraction'; v: Fraction }

const lagValue = (x: MemoryLag): number | null => (typeof x === 'number' ? x : null)

function valueOf(run: ModeRun, m: Measure): Value {
  switch (m) {
    case 'period':
      return { kind: 'number', v: run.period }
    case 'phaseOrder':
      return { kind: 'fraction', v: run.phaseOrder }
    case 'tauQ':
      return { kind: 'number', v: lagValue(run.tauQ) }
    case 'tauD':
      return { kind: 'number', v: lagValue(run.tauD) }
    case 'varD':
      return { kind: 'fraction', v: run.varD }
    case 'frozen':
      return { kind: 'fraction', v: run.frozen }
    case 'blink':
      return { kind: 'fraction', v: run.blink }
  }
}

function place(h: Value, flat: readonly Value[]): Placement {
  if (h.kind === 'number') {
    const hv = h.v

    if (hv === null) {
      return 'unresolved'
    }

    const resolved = flat.map(f => (f.kind === 'number' ? f.v : null)).filter((v): v is number => v !== null)

    if (resolved.length === 0) {
      return 'unresolved'
    }

    if (hv < Math.min(...resolved)) {
      return 'below'
    }

    if (resolved.length === flat.length && hv > Math.max(...resolved)) {
      return 'above'
    }

    return 'inside'
  }

  const fs = flat.map(f => (f.kind === 'fraction' ? f.v : null)).filter((v): v is Fraction => v !== null)

  if (fs.every(f => compareFractions(h.v, f) < 0)) {
    return 'below'
  }

  if (fs.every(f => compareFractions(h.v, f) > 0)) {
    return 'above'
  }

  return 'inside'
}

type Comparison = { pair: string; method: ColoringMethod; field: FieldLabel; k: number; measure: Measure; placement: Placement }

function comparisons(pairs: readonly PairSpec[], runs: ReadonlyMap<RunKey, RunCell>, hyperbolicOf: (p: PairSpec) => Graph = p => p.hyperbolic): Comparison[] {
  const out: Comparison[] = []

  for (const p of pairs) {
    const hyp = hyperbolicOf(p)
    const flat = [p.partner, ...p.series]

    for (const method of FAMILIES) {
      for (const field of FIELDS) {
        for (const k of LEVELS) {
          const key = (g: Graph): RunKey => `${g.name}|${method}|${field}|${k}`
          const h = runs.get(key(hyp))!
          const fs = flat.map(g => runs.get(key(g))!)

          for (const measure of MEASURES) {
            if ((measure === 'tauD' || measure === 'varD') && field === 'ising') {
              continue
            }

            let placement: Placement

            if (h.run === null || fs.some(f => f.run === null)) {
              placement = 'missing'
            } else if (h.run.moves === 0 || fs.every(f => f.run!.moves === 0)) {
              placement = 'frozen'
            } else {
              placement = place(valueOf(h.run, measure), fs.map(f => valueOf(f.run!, measure)))
            }

            out.push({ pair: p.label, method, field, k, measure, placement })
          }
        }
      }
    }
  }

  return out
}

// the declared criterion: every non-frozen, non-missing placement the same one of above/below
function criterion(cs: readonly Comparison[], measure: Measure): 'above' | 'below' | 'none' {
  const live = cs.filter(c => c.measure === measure && c.placement !== 'frozen' && c.placement !== 'missing')
  const first = live[0]?.placement

  return first !== undefined && (first === 'above' || first === 'below') && live.every(c => c.placement === first) ? first : 'none'
}

type Confounds = { parity: boolean; systole: boolean; symmetry: boolean; size: boolean }

function confounds(pairs: readonly PairSpec[], facts: ReadonlyMap<string, GraphFacts>): Confounds & { perPair: (Confounds & { pair: string })[] } {
  const perPair = pairs.map(p => ({ pair: p.label, ...pairConfounds(p, facts) }))

  return {
    parity: perPair.some(c => c.parity),
    systole: perPair.some(c => c.systole),
    symmetry: perPair.some(c => c.symmetry),
    size: perPair.some(c => c.size),
    perPair,
  }
}

// the declared confound filter for one pair (m8-resonance.md, slice 2)
function pairConfounds(p: PairSpec, facts: ReadonlyMap<string, GraphFacts>): Confounds {
  const h = p.hyperbolic
  const hf = facts.get(h.name)!
  const flat = [p.partner, ...p.series]
  const hl = h.loopSystole
  const ha = hf.aut
  const hn = BigInt(h.graph.cells)
  const flatAut = flat.map(f => facts.get(f.name)!.aut)

  return {
    parity: !flat.some(f => facts.get(f.name)!.bipartite === hf.bipartite),
    // a null loop systole is a lower bound (long); a null hyperbolic one cannot be judged
    systole: hl === null || flat.every(f => f.loopSystole === null || f.loopSystole > hl),
    // an unresolved order cannot be judged; else the hyperbolic |Aut| / N above every flat member's
    symmetry: ha === null || flatAut.some(a => a === null) || flat.every((f, k) => ha * BigInt(f.graph.cells) > flatAut[k]! * hn),
    size: !flat.some(f => f.graph.cells < h.graph.cells) || !flat.some(f => f.graph.cells > h.graph.cells),
  }
}

// ---- planted gates ----

function petersen(): number[][] {
  const rows: number[][] = Array.from({ length: 10 }, () => [])

  const join2 = (a: number, b: number): void => {
    rows[a]!.push(b)
    rows[b]!.push(a)
  }

  for (let i = 0; i < 5; i++) {
    join2(i, (i + 1) % 5)
    join2(i, i + 5)
    join2(i + 5, ((i + 2) % 5) + 5)
  }

  return rows
}

function plantedGates(checks: Check[], negatives: Check[]): void {
  // exact series period
  const six = [0, 1, 2, 0, 1, 3]
  const twelve = [...six, ...six]

  checks.push({ name: 'P1 a period-6 series over a 12-round orbit reads 6', ok: minimalSeriesPeriod(twelve, 12) === 6 })

  const bent = [...twelve]

  bent[11] = 9
  negatives.push({ name: 'NP1 one changed entry makes the series not 6-periodic', ok: minimalSeriesPeriod(bent, 12) === 12 })

  // autocovariance
  const alternating = Array.from({ length: 64 }, (_, t) => (t % 2 === 0 ? 1 : -1))
  const square = Array.from({ length: 256 }, (_, t) => (t % 8 < 4 ? 1 : -1))
  const covA = autocovariance(alternating, 16)
  const covS = autocovariance(square, 64)

  checks.push({ name: 'P2 alternating +-1 has memory lag 1', ok: memoryLag(covA) === 1 })
  // by hand at tau = 2 (n = 254): sum x_t x_(t+2) = 2, sum x_t = 2, sum x_(t+2) = -2, so A(2) = 254 * 2 + 4 = 512 > 0
  // (the infinite wave's covariance at lag 2 is 0; the window's partial period keeps it positive), and A(3) < 0
  checks.push({ name: 'P3 a period-8 square wave over 256 rounds has A(2) = 512, memory lag 3 and oscillation lag 8', ok: covS[2] === 512n && memoryLag(covS) === 3 && oscillationLag(covS) === 8 })
  checks.push({ name: 'P4 a constant series reads constant', ok: memoryLag(autocovariance(new Array<number>(32).fill(5), 8)) === 'constant' })
  negatives.push({ name: 'NP2 the alternating series is not read as long memory', ok: memoryLag(covA) !== null && memoryLag(covA) !== 'constant' && (memoryLag(covA) as number) < 2 })

  // automorphism orders
  const order = (rows: number[][]): bigint | null => automorphismOrder({ neighbors: rows }).order

  checks.push({ name: 'P5 |Aut(Petersen)| = 120', ok: order(petersen()) === 120n })
  checks.push({ name: 'P6 |Aut(C5 x C6)| = 120 (5 x 6 square torus)', ok: order(squareTorus(5, 6).analysis.neighbors) === 120n })
  checks.push({ name: 'P7 |Aut(C6 x C6)| = 288', ok: order(squareTorus(6, 6).analysis.neighbors) === 288n })
  checks.push({ name: 'P8 |Aut(C4 x C4)| = 384 (the 4-cube)', ok: order(squareTorus(4, 4).analysis.neighbors) === 384n })

  const rigid = [[1], [0, 2], [1, 3, 5], [2, 4, 5], [3], [2, 3]]

  negatives.push({ name: 'NP3 a rigid six-vertex graph reads |Aut| = 1', ok: order(rigid) === 1n })
  negatives.push({ name: 'NP4 the 5 x 6 torus does not read the 6 x 6 order', ok: order(squareTorus(5, 6).analysis.neighbors) !== 288n })
}

// ---- the run ----

type Result = {
  pairs: PairSpec[]
  facts: Map<string, GraphFacts>
  runs: Map<RunKey, RunCell>
  cs: Comparison[]
  checks: Check[]
  negatives: Check[]
}

function serialize(pairs: readonly PairSpec[], runs: ReadonlyMap<RunKey, RunCell>): string {
  const names = new Set(pairs.flatMap(p => [p.hyperbolic, p.partner, ...p.series].map(g => g.name)))
  const rows = [...runs.entries()].filter(([key]) => names.has(key.split('|')[0]!)).map(([key, cell]) => [key, cell.reached, cell.run])

  return JSON.stringify(rows, (_, v: unknown) => (typeof v === 'bigint' ? v.toString() : v))
}

function spinOneModes(log: (line: string) => void): Result {
  const checks: Check[] = []
  const negatives: Check[] = []

  plantedGates(checks, negatives)

  const pairs = pairSpecs()

  log(`built ${pairs.length} pairs`)

  const facts = new Map<string, GraphFacts>()

  for (const p of pairs) {
    for (const g of [p.hyperbolic, p.partner, ...p.series]) {
      if (facts.has(g.name)) {
        continue
      }

      const aut = automorphismOrder({ neighbors: g.neighbors })

      facts.set(g.name, { bipartite: isBipartite(g.neighbors), aut: aut.order, autLevels: aut.levels.length })

      if (g.rotationOrder !== null) {
        checks.push({ name: `P9 ${g.name}: |Aut| ${aut.order ?? 'unresolved'} is a multiple of the rotation group order ${g.rotationOrder}`, ok: aut.order !== null && aut.order % BigInt(g.rotationOrder) === 0n })
      }
    }
  }

  log('automorphism orders done')

  const runs = new Map<RunKey, RunCell>()

  for (const p of pairs) {
    for (const g of [p.hyperbolic, p.partner, ...p.series]) {
      runGraph(g, checks, runs)
    }

    log(`runs done for ${p.label}`)
  }

  const cs = comparisons(pairs, runs)

  // negative: the criterion on a flat member placed against its own series reads no effect
  const first = pairs[0]!
  const selfCs = comparisons([first], runs, p => p.partner)

  negatives.push({ name: `NC1 the criterion on ${first.partner.name} against its own flat series reads no effect for any measure`, ok: MEASURES.every(m => criterion(selfCs, m) === 'none') })

  return { pairs, facts, runs, cs, checks, negatives }
}

function show(f: Fraction): string {
  return String(fractionToNumber(f))
}

function showLag(x: MemoryLag): string {
  return x === null ? 'unres' : String(x)
}

export function spinOneModesRun(): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)

  const r = spinOneModes(log)
  const checks = [...r.checks]
  const negatives = [...r.negatives]
  const metrics: Record<string, number> = {}

  // determinism: the first pair's graphs run again from scratch give identical bytes
  const first = r.pairs[0]!
  const again = new Map<RunKey, RunCell>()

  for (const g of [first.hyperbolic, first.partner, ...first.series]) {
    runGraph(g, [], again)
  }

  checks.push({ name: `G two runs of ${first.label} give identical bytes`, ok: serialize([first], r.runs) === serialize([first], again) })

  const root = join(import.meta.dirname, '..', '..', '..')
  const findings = ['code/measure/spin-one-modes.ts', 'code/measure/graph-automorphism.ts', 'test/experiment/computation/spin-one-modes.ts'].flatMap(file => scanSource(file, readFileSync(join(root, file), 'utf8')))

  checks.push({ name: `G no random draw in the new files (${findings.length} findings)`, ok: findings.length === 0 })

  // per-graph lines
  for (const p of r.pairs) {
    for (const g of [p.hyperbolic, p.partner, ...p.series]) {
      const f = r.facts.get(g.name)!

      log(`graph ${g.name} (${g.curvature}, N ${g.graph.cells}, z ${g.degree}, bipartite ${f.bipartite}, loop systole ${g.loopSystole ?? 'n/a'}, |Aut| ${f.aut ?? 'unres'}, |Aut|/N ${f.aut === null ? 'unres' : show(fraction(f.aut, g.graph.cells))})`)
      metrics[`aut.${g.name}`] = f.aut === null ? -1 : Number(f.aut)

      for (const method of FAMILIES) {
        for (const field of FIELDS) {
          const parts: string[] = []

          for (const k of LEVELS) {
            const cell = r.runs.get(`${g.name}|${method}|${field}|${k}`)!
            const run = cell.run

            if (!run) {
              parts.push(`k${k} missing`)
              continue
            }

            parts.push(
              `k${k} e/N ${(run.energy / run.cells).toFixed(3)} mv ${run.windowMoves} P ${run.period ?? 'unres'}${run.period !== null ? ` pQ ${run.seriesPeriodQ} pD ${run.seriesPeriodD}` : ''} m2 ${show(run.phaseOrder)} tQ ${showLag(run.tauQ)}${field === 'low' ? ` tD ${showLag(run.tauD)} vD ${show(run.varD)}` : ''} fr ${show(run.frozen)} bl ${show(run.blink)} osc ${run.oscillationQ ?? '-'}`,
            )
          }

          log(`  ${method} ${field}: ${parts.join(' | ')}`)
        }
      }
    }
  }

  // tallies and the criterion
  const credited: string[] = []
  const passing: string[] = []

  for (const m of MEASURES) {
    const mine = r.cs.filter(c => c.measure === m)
    const tally = (pl: Placement): number => mine.filter(c => c.placement === pl).length
    const verdictOf = criterion(r.cs, m)

    log(`measure ${m}: above ${tally('above')} below ${tally('below')} inside ${tally('inside')} unresolved ${tally('unresolved')} frozen ${tally('frozen')} missing ${tally('missing')} -> criterion ${verdictOf}`)

    for (const pl of ['above', 'below', 'inside', 'unresolved', 'frozen', 'missing'] as const) {
      metrics[`placement.${m}.${pl}`] = tally(pl)
    }

    metrics[`criterion.${m}`] = verdictOf === 'above' ? 1 : verdictOf === 'below' ? -1 : 0

    if (verdictOf !== 'none') {
      passing.push(`${m} (${verdictOf})`)
    }
  }

  for (const p of r.pairs) {
    for (const m of MEASURES) {
      const line = r.cs.filter(c => c.pair === p.label && c.measure === m).map(c => `${c.method === 'greedy-bfs' ? 'F' : 'R'}${c.field === 'ising' ? 'i' : 'l'}${c.k}:${c.placement}`)

      log(`pair ${p.label} ${m}: ${line.join(' ')}`)
    }
  }

  const conf = confounds(r.pairs, r.facts)

  for (const c of conf.perPair) {
    log(`confounds ${c.pair}: parity ${c.parity} systole ${c.systole} symmetry ${c.symmetry} size ${c.size}`)
  }

  log(`confounds: parity ${conf.parity} systole ${conf.systole} symmetry ${conf.symmetry} size ${conf.size}`)

  metrics['confound.parity'] = conf.parity ? 1 : 0
  metrics['confound.systole'] = conf.systole ? 1 : 0
  metrics['confound.symmetry'] = conf.symmetry ? 1 : 0
  metrics['confound.size'] = conf.size ? 1 : 0

  const anyConfound = conf.parity || conf.systole || conf.symmetry || conf.size

  if (!anyConfound) {
    credited.push(...passing)
  }

  let resolvedPeriods = 0
  let totalRuns = 0

  for (const cell of r.runs.values()) {
    if (cell.run) {
      totalRuns++
      resolvedPeriods += cell.run.period === null ? 0 : 1
    }
  }

  metrics.runs = totalRuns
  metrics.resolvedPeriods = resolvedPeriods

  const failed = [...checks, ...negatives].filter(c => !c.ok)

  for (const c of failed) {
    log(`FAILED ${c.name}`)
  }

  metrics.gates = checks.length
  metrics.controls = negatives.length
  metrics.failed = failed.length
  metrics.seconds = seconds()

  const confoundList = (['parity', 'systole', 'symmetry', 'size'] as const).filter(k => conf[k]).join(', ')

  return verdict({
    status: failed.length === 0 ? 'pass' : 'fail',
    claim: `M8 slice 2, the spin-1 Q2R rule on ${r.pairs.length} degree-matched closed pairs under two schedule families, two crystal fields and three energies (${totalRuns} exact runs, ${resolvedPeriods} orbit periods closed under the cap): ${passing.length === 0 ? 'no collective-mode measure (orbit period, phase order, magnetization and energy-channel memory, energy-channel fluctuation, frozen and blinker shares) leaves the flat size-series range on one side in every comparison' : `${passing.join(', ')} leave the flat size-series range on one side in every comparison`}; ${credited.length > 0 ? `credited to curvature: ${credited.join(', ')}` : `nothing is credited to curvature${passing.length > 0 && anyConfound ? ` (confounds present: ${confoundList})` : ''}`}`,
    metrics,
    control: { negativesTripped: negatives.filter(c => c.ok).length, negatives: negatives.length },
    notes:
      'L2, exact integers and bigint rationals. The round is a bijection, so a closed orbit is a pure cycle and its period exact; past the cap a period is unresolved, never a number. Window measures use one fixed burn and window on every graph. |Aut| is exact (stabilizer chain, complete backtracking). Both sides of every comparison run the same schedule family (audit-m1 F).',
  })
}

export default experiment({
  id: 'computation/spin-one-modes',
  code: 'E-CMP-0048',
  title: 'M8 slice 2: collective modes of the reversible spin-1 Q2R rule (exact orbit periods, magnetization and energy-channel series, integer autocovariance memory, phase order, frozen and blinker shares) on matched closed quotients against flat size series, with bipartiteness, systole and exact automorphism group orders',
  category: 'computation',
  substrates: ['{4,4}', '{6,3}', '{3,6}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  run() {
    return spinOneModesRun()
  },
})
