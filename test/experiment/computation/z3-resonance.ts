// M8 slice 1: resonance and collective modes of the second-order Z3 wave, flat against degree-matched hyperbolic
// (item vibe-computation-models-0019, plan.md M8, algebra Z3 cyclic). Re-plan, measures and criteria were fixed in
// note/project/vibe/computation/models/m8-resonance.md before the first run.
//
// Part A re-checks E-CMP-0041's one credited curvature effect, the mean lit share of the wave front, over the COMMON
// step range of each pair (t = 1 .. min(R_flat, R_hyperbolic)), with exact rationals: step mean and pooled share.
// Survives only if both are strictly higher on the hyperbolic side in all four pairs. If it survives, the explanation
// is tested: exact geodesic counts on the front (bigint), Lucas's theorem on {4,4} and {6,3} (lit(t) = k (L3(t) - 1)),
// the unique-geodesic share u on both sides (explanation holds if u is higher on the hyperbolic side in every pair).
//
// Part B reads exact modes on closed quotients over F3: the orbit period P of one source, the degree k of the minimal
// polynomial of A' on the source (the standing modes it excites), the period mean of the Z3 order parameter
// M^2 / N^2 (phase order), and the uniform mode (degree alone). A measure is credited to curvature only if in every
// pair the hyperbolic value lies outside the range of a flat size series of the same degree, on the same side in all
// pairs, under both laws (self 0 and self 1). Bipartiteness and systole are reported beside every pair.
//
// The wave has no schedule and no orientation, so both sides of every pair run the same update (audit-m1 F).
// Exact integers mod 3 and bigint rationals only; floats appear only in printed summaries. No random numbers.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { scanSource } from '@/code/check/determinism'
import {
  addFractions,
  compareFractions,
  evaluatePolynomialOn,
  fraction,
  fractionToNumber,
  geodesicCounts,
  isBipartite,
  krylovMinimalPolynomial,
  lucasNonzeroCount,
  shiftedAdjacencyMinimalPolynomial,
  uniformModePeriod,
  waveMap,
  waveOrbit,
  type Fraction,
} from '@/code/measure/z3-resonance'
import { secondOrderZ3Run } from '@/code/rule/second-order-z3'
import { labGeometry, type LabGeometryName } from '@/code/substrate/lab-geometry'
import {
  closedQuotients,
  d4Torus,
  findRotaryMap,
  hexagonTorus,
  referenceTiling,
  squareTorus,
  triangleTorus,
} from '@/code/substrate/tiling-quotient'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type Check = { name: string; ok: boolean }

// ---- Part A: the front ----

// the same exact open-ball radii as E-CMP-0041
const RADIUS: Readonly<Record<string, number>> = {
  '{4,4}': 40,
  '{6,3}': 40,
  '{3,6}': 40,
  '{3,4,3,3}': 6,
  '{4,5}': 11,
  '{6,4}': 8,
  '{3,7}': 20,
  '{3,4,3,4}': 3,
}

const PAIRS: readonly (readonly [LabGeometryName, LabGeometryName])[] = [
  ['{4,4}', '{4,5}'],
  ['{6,3}', '{6,4}'],
  ['{3,6}', '{3,7}'],
  ['{3,4,3,3}', '{3,4,3,4}'],
]

type FrontStep = { lit: number; shell: number; unique: number; nonUniqueLit: number }

type FrontSeries = {
  name: LabGeometryName
  radius: number
  cells: number
  bipartite: boolean
  // index t = 0 .. radius
  steps: FrontStep[]
}

function frontSeries(name: LabGeometryName, checks: Check[]): FrontSeries {
  const radius = RADIUS[name]!
  const geometry = labGeometry({ name, boundary: 'openBall', radius, exact: true, maxCells: 90000 })
  const neighbors: number[][] = geometry.graph.neighbors.map(row => Array.from(row))
  const n = neighbors.length
  const distance = geometry.distance
  const counts = geodesicCounts({ neighbors, distance, origin: 0 })
  const previous = new Uint8Array(n)
  const current = new Uint8Array(n)

  current[0] = 1

  const slices = secondOrderZ3Run({ neighbors, previous, current, law: { kind: 'linear', self: 0 }, steps: radius })
  const steps: FrontStep[] = []

  let theorem = true

  for (let t = 0; t <= radius; t++) {
    const s = slices[t + 1]!
    const step: FrontStep = { lit: 0, shell: 0, unique: 0, nonUniqueLit: 0 }

    for (let c = 0; c < n; c++) {
      if (distance[c] !== t) {
        continue
      }

      const count = counts[c]!
      const residue = Number(count % 3n)

      if (s[c] !== residue) {
        theorem = false
      }

      step.shell++

      if (s[c] !== 0) {
        step.lit++
      }

      if (count === 1n) {
        step.unique++
      } else if (residue !== 0) {
        step.nonUniqueLit++
      }
    }

    if (step.shell !== (geometry.shellSizes[t] ?? -1)) {
      theorem = false
    }

    steps.push(step)
  }

  checks.push({ name: `A1 ${name} r${radius}: front tone equals the exact geodesic count mod 3 at every step`, ok: theorem })

  return { name, radius, cells: n, bipartite: isBipartite(neighbors), steps }
}

type FrontWindow = { stepMean: Fraction; pooled: Fraction; unique: Fraction; nonUniqueLit: Fraction | null }

function frontWindow(series: FrontSeries, tc: number): FrontWindow {
  let stepMean = fraction(0)
  let lit = 0
  let shell = 0
  let unique = 0
  let nonUnique = 0
  let nonUniqueLit = 0

  for (let t = 1; t <= tc; t++) {
    const s = series.steps[t]!

    stepMean = addFractions(stepMean, fraction(s.lit, s.shell))
    lit += s.lit
    shell += s.shell
    unique += s.unique
    nonUnique += s.shell - s.unique
    nonUniqueLit += s.nonUniqueLit
  }

  return {
    stepMean: fraction(stepMean.n, stepMean.d * BigInt(tc)),
    pooled: fraction(lit, shell),
    unique: fraction(unique, shell),
    nonUniqueLit: nonUnique === 0 ? null : fraction(nonUniqueLit, nonUnique),
  }
}

type PairFront = {
  pair: string
  tc: number
  flat: FrontWindow
  hyperbolic: FrontWindow
  flatFull: FrontWindow
  stepsHigher: number
  stepsLower: number
  stepsEqual: number
  bipartite: [boolean, boolean]
}

function comparePair(flat: FrontSeries, hyperbolic: FrontSeries): PairFront {
  const tc = Math.min(flat.radius, hyperbolic.radius)

  let stepsHigher = 0
  let stepsLower = 0
  let stepsEqual = 0

  for (let t = 1; t <= tc; t++) {
    const f = flat.steps[t]!
    const h = hyperbolic.steps[t]!
    const sign = compareFractions(fraction(h.lit, h.shell), fraction(f.lit, f.shell))

    if (sign > 0) {
      stepsHigher++
    } else if (sign < 0) {
      stepsLower++
    } else {
      stepsEqual++
    }
  }

  return {
    pair: `${flat.name}/${hyperbolic.name}`,
    tc,
    flat: frontWindow(flat, tc),
    hyperbolic: frontWindow(hyperbolic, tc),
    flatFull: frontWindow(flat, flat.radius),
    stepsHigher,
    stepsLower,
    stepsEqual,
    bipartite: [flat.bipartite, hyperbolic.bipartite],
  }
}

// the declared survival criterion: step mean AND pooled strictly higher on the second side in every pair
function frontSurvives(pairs: readonly PairFront[]): boolean {
  return pairs.every(p => compareFractions(p.hyperbolic.stepMean, p.flat.stepMean) > 0 && compareFractions(p.hyperbolic.pooled, p.flat.pooled) > 0)
}

// ---- Part B: closed quotients ----

type Graph = { name: string; curvature: 'flat' | 'hyperbolic'; degree: number; neighbors: number[][]; systole: number | null; loopSystole: number | null }

type ModeReading = { period: number; krylov: number; phaseOrder: Fraction | null }

type GraphReading = Graph & { cells: number; bipartite: boolean; laws: Record<'self0' | 'self1', ModeReading> }

const SIGMA = { self0: 0, self1: 1 } as const

function readGraph(g: Graph, checks: Check[], negatives: Check[]): GraphReading {
  const n = g.neighbors.length
  const delta = new Uint8Array(n)

  delta[0] = 1

  const laws = {} as Record<'self0' | 'self1', ModeReading>

  for (const law of ['self0', 'self1'] as const) {
    const sigma = SIGMA[law]
    const m = shiftedAdjacencyMinimalPolynomial({ neighbors: g.neighbors, sigma, seed: delta })
    const killed = evaluatePolynomialOn(g.neighbors, sigma, m, delta).every(v => v === 0)
    const truncated = evaluatePolynomialOn(g.neighbors, sigma, m.slice(1), delta).every(v => v === 0)

    checks.push({ name: `B1 ${g.name} ${law}: the Krylov polynomial (degree ${m.length - 1}) kills the source`, ok: killed })
    negatives.push({ name: `NB1 ${g.name} ${law}: the polynomial with its constant term dropped and degree lowered does not`, ok: !truncated })

    // the T-orbit lives in a 2k-dimensional cyclic space: checked by a direct Krylov run of T on small graphs
    if (n <= 60) {
      const seed = new Uint8Array(2 * n)

      seed[n] = 1

      const mt = krylovMinimalPolynomial({ apply: waveMap(g.neighbors, sigma), seed, maxDegree: 2 * n })

      checks.push({ name: `B2 ${g.name} ${law}: T's cyclic space from (0, delta) has dimension 2k = ${2 * (m.length - 1)}`, ok: mt !== null && mt.length - 1 === 2 * (m.length - 1) })
    }

    const cap = Math.max(2000, Math.floor(1.2e7 / (n * (g.degree + 1))))
    const orbit = waveOrbit({ neighbors: g.neighbors, sigma, previous: new Uint8Array(n), current: delta, cap })

    laws[law] = { period: orbit.period, krylov: m.length - 1, phaseOrder: orbit.phaseOrder }

    // the uniform mode: stays uniform and follows x(t+1) = (p + sigma) x(t) - x(t-1)
    const uniformPeriod = uniformModePeriod(g.degree + sigma)
    const ones = new Uint8Array(n).fill(1)
    const uniform = waveOrbit({ neighbors: g.neighbors, sigma, previous: new Uint8Array(n), current: ones, cap: 20 })

    checks.push({ name: `B3 ${g.name} ${law}: the uniform mode returns at the recurrence period ${uniformPeriod}`, ok: uniform.period === uniformPeriod })
  }

  return { ...g, cells: n, bipartite: isBipartite(g.neighbors), laws }
}

type PairSpec = { label: string; hyperbolic: Graph; partner: Graph; series: Graph[] }

function torusGraph(name: string, degree: number, neighbors: number[][]): Graph {
  return { name, curvature: 'flat', degree, neighbors, systole: null, loopSystole: null }
}

// flat tori of one degree with cell counts within a tenth of n (a fifth for small n), aspect at most 1.6
function flatSeries(degree: number, n: number): Graph[] {
  const band = n < 100 ? n / 5 : n / 10
  const out: Graph[] = []

  for (let a = 3; a * a <= n + band; a++) {
    for (let b = a; b <= 1.6 * a; b++) {
      const cells = degree === 3 ? 2 * a * b : a * b

      if (Math.abs(cells - n) > band) {
        continue
      }

      if (degree === 4) {
        out.push(torusGraph(`square-${a}x${b}`, 4, squareTorus(a, b).analysis.neighbors))
      } else if (degree === 6) {
        out.push(torusGraph(`hexagon-${a}x${b}`, 6, hexagonTorus(a, b).analysis.neighbors))
      } else if (degree === 3) {
        out.push(torusGraph(`triangle-${a}x${b}`, 3, triangleTorus(a, b).analysis.neighbors))
      }
    }
  }

  return out
}

function pairSpecs(): PairSpec[] {
  const entries = closedQuotients()
  const byName = new Map(entries.map(e => [e.quotient.name, e.quotient]))
  const specs: PairSpec[] = []

  for (const e of entries) {
    const q = e.quotient

    if (q.curvature !== 'hyperbolic' || q.partner === null) {
      continue
    }

    const partner = byName.get(q.partner)!
    const hyperbolic: Graph = { name: q.name, curvature: 'hyperbolic', degree: q.degree, neighbors: q.neighbors, systole: q.systole, loopSystole: q.loopSystole }
    const flat: Graph = { name: partner.name, curvature: 'flat', degree: partner.degree, neighbors: partner.neighbors, systole: partner.systole, loopSystole: partner.loopSystole }
    const series =
      q.degree === 24
        ? [4, 6, 8, 10].map(side => torusGraph(`d4-side-${side}`, 24, d4Torus(side).neighbors))
        : flatSeries(q.degree, q.cells)

    specs.push({ label: `${q.name}/${partner.name}`, hyperbolic, partner: flat, series })
  }

  // the two larger M2-B pairs
  for (const [p, qq, modulus, torus, torusName] of [
    [4, 5, 11, squareTorus(15, 22), 'square-15x22'],
    [3, 7, 13, triangleTorus(13, 14), 'triangle-13x14'],
  ] as const) {
    const rotary = findRotaryMap({ p, q: qq, moduli: [modulus], reference: referenceTiling([p, qq], 6000), minSystole: 1 })

    if (!rotary) {
      throw new Error(`z3-resonance: no {${p},${qq}} map in PGL(2,${modulus})`)
    }

    const n = rotary.analysis.faces
    const hyperbolic: Graph = { name: `surface-${p}-${qq}-pgl2-${modulus}-${n}`, curvature: 'hyperbolic', degree: p, neighbors: rotary.analysis.neighbors, systole: null, loopSystole: null }
    const partner = torusGraph(torusName, p, torus.analysis.neighbors)

    specs.push({ label: `${hyperbolic.name}/${torusName}`, hyperbolic, partner, series: flatSeries(p, n) })
  }

  return specs
}

type PairModes = { label: string; hyperbolic: GraphReading; partner: GraphReading; series: GraphReading[] }

type Placement = 'above' | 'below' | 'inside' | 'unresolved'

// where the hyperbolic value sits against the flat series range (an unresolved flat value is an open upper end)
function placeNumber(h: number, flat: readonly number[]): Placement {
  if (h < 0) {
    return 'unresolved'
  }

  const resolved = flat.filter(v => v >= 0)
  const open = resolved.length < flat.length

  if (resolved.length === 0) {
    return 'unresolved'
  }

  if (h < Math.min(...resolved)) {
    return 'below'
  }

  if (!open && h > Math.max(...resolved)) {
    return 'above'
  }

  return 'inside'
}

function placeFraction(h: Fraction | null, flat: readonly (Fraction | null)[]): Placement {
  if (h === null) {
    return 'unresolved'
  }

  const resolved = flat.filter((v): v is Fraction => v !== null)

  if (resolved.length === 0) {
    return 'unresolved'
  }

  if (resolved.every(v => compareFractions(h, v) < 0)) {
    return 'below'
  }

  if (resolved.length === flat.length && resolved.every(v => compareFractions(h, v) > 0)) {
    return 'above'
  }

  return 'inside'
}

const MODE_MEASURES = ['period', 'krylovShare', 'phaseOrder'] as const

type ModeMeasure = (typeof MODE_MEASURES)[number]

function placement(p: PairModes, law: 'self0' | 'self1', measure: ModeMeasure): Placement {
  const flat = [p.partner, ...p.series]

  if (measure === 'period') {
    return placeNumber(p.hyperbolic.laws[law].period, flat.map(f => f.laws[law].period))
  }

  if (measure === 'krylovShare') {
    return placeFraction(fraction(p.hyperbolic.laws[law].krylov, p.hyperbolic.cells), flat.map(f => fraction(f.laws[law].krylov, f.cells)))
  }

  return placeFraction(p.hyperbolic.laws[law].phaseOrder, flat.map(f => f.laws[law].phaseOrder))
}

// the declared criterion: same side (above or below) in every pair under both laws
function modeCredited(pairs: readonly PairModes[], measure: ModeMeasure): Placement {
  const places = pairs.flatMap(p => (['self0', 'self1'] as const).map(law => placement(p, law, measure)))
  const first = places[0]

  return first !== undefined && (first === 'above' || first === 'below') && places.every(x => x === first) ? first : 'inside'
}

// ---- the run ----

type Result = { fronts: FrontSeries[]; pairs: PairFront[]; modes: PairModes[]; checks: Check[]; negatives: Check[]; serialized: string }

function z3Resonance(): Result {
  const checks: Check[] = []
  const negatives: Check[] = []
  const fronts = Object.keys(RADIUS).map(name => frontSeries(name as LabGeometryName, checks))
  const byName = new Map(fronts.map(f => [f.name, f]))
  const pairs = PAIRS.map(([f, h]) => comparePair(byName.get(f)!, byName.get(h)!))

  // Lucas on the flat side: lit(t) = k (L3(t) - 1) on {4,4} (k 4) and {6,3} (k 6); base 2 must fail somewhere
  for (const [name, k] of [
    ['{4,4}', 4],
    ['{6,3}', 6],
  ] as const) {
    const s = byName.get(name)!

    let lucas = true
    let base2 = true

    for (let t = 1; t <= s.radius; t++) {
      lucas &&= s.steps[t]!.lit === k * (lucasNonzeroCount(t, 3) - 1) && s.steps[t]!.shell === k * t
      base2 &&= s.steps[t]!.lit === k * (lucasNonzeroCount(t, 2) - 1)
    }

    checks.push({ name: `A2 ${name}: front lit count equals ${k} (L3(t) - 1) for t = 1..${s.radius} (Lucas)`, ok: lucas })
    negatives.push({ name: `NA2 ${name}: the base-2 Lucas count fails`, ok: !base2 })
  }

  // the criterion on a flat geometry against itself reads no difference
  const self = comparePair(byName.get('{4,4}')!, byName.get('{4,4}')!)

  negatives.push({ name: 'NA3 the survival criterion on {4,4} against itself reads no difference', ok: !frontSurvives([self]) })

  const modes: PairModes[] = pairSpecs().map(spec => ({
    label: spec.label,
    hyperbolic: readGraph(spec.hyperbolic, checks, negatives),
    partner: readGraph(spec.partner, checks, negatives),
    series: spec.series.map(g => readGraph(g, checks, negatives)),
  }))

  // the uniform period depends on the degree alone (B3 on every graph); a different degree gives a different period
  negatives.push({ name: 'NB4 degree 4 and degree 6 give different uniform-mode periods (self 0)', ok: uniformModePeriod(4) !== uniformModePeriod(6) })

  const serialized = JSON.stringify(
    { pairs, modes: modes.map(m => ({ ...m, hyperbolic: { ...m.hyperbolic, neighbors: undefined }, partner: { ...m.partner, neighbors: undefined }, series: m.series.map(s => ({ ...s, neighbors: undefined })) })) },
    (_, v: unknown) => (typeof v === 'bigint' ? v.toString() : v),
  )

  return { fronts, pairs, modes, checks, negatives, serialized }
}

function show(f: Fraction | null): string {
  return f === null ? 'n/a' : String(fractionToNumber(f))
}

export function z3ResonanceRun(): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)

  const r = z3Resonance()
  const again = z3Resonance()
  const checks = [...r.checks]
  const negatives = [...r.negatives]
  const metrics: Record<string, number> = {}

  checks.push({ name: 'G two runs give identical bytes', ok: r.serialized === again.serialized })

  const root = join(import.meta.dirname, '..', '..', '..')
  const findings = ['code/measure/z3-resonance.ts', 'test/experiment/computation/z3-resonance.ts'].flatMap(file => scanSource(file, readFileSync(join(root, file), 'utf8')))

  checks.push({ name: `G no random draw in the new files (${findings.length} findings)`, ok: findings.length === 0 })

  const survives = frontSurvives(r.pairs)

  for (const p of r.pairs) {
    log(
      `front ${p.pair} tc=${p.tc} bipartite ${p.bipartite.join('/')}: stepMean ${show(p.flat.stepMean)}/${show(p.hyperbolic.stepMean)} pooled ${show(p.flat.pooled)}/${show(p.hyperbolic.pooled)} (flat full-window stepMean ${show(p.flatFull.stepMean)}) steps h>f ${p.stepsHigher} h<f ${p.stepsLower} = ${p.stepsEqual}; unique ${show(p.flat.unique)}/${show(p.hyperbolic.unique)} nonUniqueLit ${show(p.flat.nonUniqueLit)}/${show(p.hyperbolic.nonUniqueLit)}`,
    )
    metrics[`front.${p.pair}.tc`] = p.tc
    metrics[`front.${p.pair}.flat.stepMean`] = fractionToNumber(p.flat.stepMean)
    metrics[`front.${p.pair}.hyperbolic.stepMean`] = fractionToNumber(p.hyperbolic.stepMean)
    metrics[`front.${p.pair}.flat.pooled`] = fractionToNumber(p.flat.pooled)
    metrics[`front.${p.pair}.hyperbolic.pooled`] = fractionToNumber(p.hyperbolic.pooled)
    metrics[`front.${p.pair}.flat.unique`] = fractionToNumber(p.flat.unique)
    metrics[`front.${p.pair}.hyperbolic.unique`] = fractionToNumber(p.hyperbolic.unique)
    metrics[`front.${p.pair}.stepsHigher`] = p.stepsHigher
    metrics[`front.${p.pair}.stepsLower`] = p.stepsLower
  }

  const uniqueExplains = survives && r.pairs.every(p => compareFractions(p.hyperbolic.unique, p.flat.unique) > 0)

  metrics['front.survives'] = survives ? 1 : 0
  metrics['front.uniqueExplains'] = uniqueExplains ? 1 : 0

  for (const p of r.modes) {
    for (const g of [p.hyperbolic, p.partner, ...p.series]) {
      log(
        `modes ${g.name} (${g.curvature}, N ${g.cells}, degree ${g.degree}, bipartite ${g.bipartite}, systole ${g.systole ?? 'n/a'}/${g.loopSystole ?? 'n/a'}): ${(['self0', 'self1'] as const).map(l => `${l} P ${g.laws[l].period} k ${g.laws[l].krylov} M2 ${show(g.laws[l].phaseOrder)}`).join('; ')}`,
      )
      metrics[`modes.${g.name}.self0.period`] = g.laws.self0.period
      metrics[`modes.${g.name}.self0.krylov`] = g.laws.self0.krylov
      metrics[`modes.${g.name}.self1.period`] = g.laws.self1.period
      metrics[`modes.${g.name}.self1.krylov`] = g.laws.self1.krylov
    }

    for (const law of ['self0', 'self1'] as const) {
      log(`pair ${p.label} ${law}: ${MODE_MEASURES.map(m => `${m} ${placement(p, law, m)}`).join(', ')}`)
    }
  }

  const credited = {} as Record<ModeMeasure, Placement>

  for (const m of MODE_MEASURES) {
    credited[m] = modeCredited(r.modes, m)
    metrics[`modes.curvature.${m}`] = credited[m] === 'above' ? 1 : credited[m] === 'below' ? -1 : 0
  }

  const failed = [...checks, ...negatives].filter(c => !c.ok)

  for (const c of failed) {
    log(`FAILED ${c.name}`)
  }

  metrics.gates = checks.length
  metrics.controls = negatives.length
  metrics.failed = failed.length
  metrics.seconds = seconds()

  const creditedList = MODE_MEASURES.filter(m => credited[m] !== 'inside')
  const modeSentence =
    creditedList.length === 0
      ? 'no closed-quotient mode measure (period, excited-mode share, phase order) leaves the flat size-series range on one side in every pair'
      : `${creditedList.map(m => `${m} (${credited[m]} the flat range)`).join(', ')} leave the flat size-series range on one side in every pair under the declared criterion, read after the run as the mode degeneracy of regular maps whose rotation groups are non-abelian (flat deck groups are abelian), so not credited to the curvature of the infinite tiling`

  return verdict({
    status: failed.length === 0 ? 'pass' : 'fail',
    claim: `M8 slice 1, the Z3 wave: E-CMP-0041's front-lit effect over the common step range of each pair ${survives ? 'survives' : 'does not survive'} (step mean and pooled share both required; ${r.pairs.filter(p => compareFractions(p.hyperbolic.pooled, p.flat.pooled) <= 0).map(p => `${p.pair} pooled ${show(p.flat.pooled)}/${show(p.hyperbolic.pooled)}`).join(', ') || 'every pair higher'}); ${survives ? (uniqueExplains ? 'it is explained by a higher unique-geodesic share on the hyperbolic side in every pair' : 'the unique-geodesic share does not explain it in every pair') : `the unique-geodesic share is higher on the hyperbolic side in ${r.pairs.filter(p => compareFractions(p.hyperbolic.unique, p.flat.unique) > 0).length} of 4 pairs`}, and Lucas's count of the flat front is exact on {4,4} and {6,3}; ${modeSentence}`,
    metrics,
    control: { negativesTripped: negatives.filter(c => c.ok).length, negatives: negatives.length },
    notes:
      'L2, exact integers mod 3 and bigint rationals. The front tone is the geodesic count mod 3 (re-gated), so the front share is a property of the geometry read through the wave; bipartiteness cannot touch it (front tiles are all at distance t). Closed-quotient modes are read against flat size series of the same degree (traps.md: a closed quotient reads its arithmetic). No schedule exists, so audit-m1 F holds by construction.',
  })
}

export default experiment({
  id: 'computation/z3-resonance',
  code: 'E-CMP-0046',
  title: 'M8 slice 1: exact resonance of the second-order Z3 wave (orbit periods, excited standing modes over F3, Z3 phase order, the uniform mode) on matched closed quotients against flat size series, and the front-lit re-check over common step ranges',
  category: 'computation',
  substrates: ['{4,4}', '{6,3}', '{3,6}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  run() {
    return z3ResonanceRun()
  },
})
