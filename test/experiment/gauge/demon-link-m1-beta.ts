// m1 OF F35 AT MATCHED DEMON TEMPERATURE ON THE TWO PERIOD-4 FLOORS. Every gate was
// registered before this file existed (gate f7ed3bbfb661, 2026-11-17T05:25:46Z), and every run
// goes through task/pre-register.
//
// THE QUESTION. E-FRC-0318 compared m1's string on period 4 floor 1 (I-A) and floor 2 (I-C) at the
// same fill, and chi22 moved 29 percent at f 0.12; but at the same fill the floor-2 layer was hotter, so fill is not
// the same temperature on the two floors. A recorded decision kept the string tension floor-dependent and asked for the
// comparison at the same demon temperature. This file reruns 0041's two period-4 grids (fills 0.08 to 0.20), takes
// each confining point's measured demon beta as a target, finds by bisection on fill the point of the OTHER floor at
// that beta (the hot branch, within 1 percent), and gates chi22 between the two floors at each matched beta.
//
// READ-ACROSS, fixed before the run: PASS means the string tension is a property of m1 at fixed temperature (0041's
// floor dependence was fill not tracking temperature); FAIL means it depends on the floor even at matched
// temperature and a recorded decision stands; PARTIAL leaves 011 unchanged.
//
// GRADE mirrored (the floor is felt). Depth L2.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

import {
  colorGroup,
  cuspGraph,
  familyF35,
  i2Holds,
  instrumentGates,
  makeField,
  runPoint,
  type RunReading,
} from '@/test/experiment/gauge/demon-link-family'
import { FINE_FILLS, fineGates, type FinePart } from '@/test/experiment/gauge/demon-link-m1-fine'

const BETA_TOLERANCE = 0.01
const MAX_BISECTIONS = 12
const EDGE_LOW = 0.02
const EDGE_HIGH = 0.4
const FLOOR_TOLERANCE = 0.25
const PASS_PAIRS = 3

export const FLOORS = [
  { name: 'I-A', period: 4, floor: 1 },
  { name: 'I-C', period: 4, floor: 2 },
] as const

export type FloorName = (typeof FLOORS)[number]['name']

export type BetaRun = RunReading & { role: 'grid' | 'edge' | 'bisect' }

export type Match = {
  // the floor the target comes from, and its grid fill
  source: FloorName
  sourceFill: number
  target: number
  // the floor searched, and the fill found (null when not matched within the tolerance)
  other: FloorName
  fill: number | null
  beta: number | null
  bisections: number
}

export type BetaPart = {
  group: { order: number; centre: number }
  instruments: Record<string, Record<string, number>>
  runs: BetaRun[]
  matches: Match[]
}

const strip = ({ state: _, ...reading }: RunReading & { state: unknown }): RunReading => reading

const within = (beta: number, target: number): boolean =>
  Math.abs(beta - target) <= BETA_TOLERANCE * Math.abs(target)

// the highest-fill pair of adjacent evaluated fills whose betas straddle the target (the hot, melted branch)
function straddle(runs: readonly BetaRun[], target: number): [BetaRun, BetaRun] | null {
  const sorted = [...runs].sort((a, b) => a.fill - b.fill)

  for (let k = sorted.length - 2; k >= 0; k--) {
    const a = sorted[k]!
    const b = sorted[k + 1]!

    if ((a.beta - target) * (b.beta - target) <= 0) {
      return [a, b]
    }
  }

  return null
}

export function betaPart(log: (line: string) => void): BetaPart {
  const color = colorGroup()
  const m1 = familyF35(color)[0]!
  const instruments: BetaPart['instruments'] = {}
  const runs: BetaRun[] = []
  const matches: Match[] = []
  const shapes = FLOORS.map(shape => {
    const graph = cuspGraph({ period: shape.period, floor: shape.floor })
    const field = makeField(graph)
    const gates = instrumentGates(graph, field)

    instruments[shape.name] = gates
    log(`${shape.name} ${JSON.stringify(gates)}`)

    return { ...shape, field }
  })
  const point = (name: FloorName, fill: number, role: BetaRun['role']): BetaRun => {
    const shape = shapes.find(s => s.name === name)!
    const reading = strip(runPoint({ field: shape.field, color, member: m1, fill, log }))
    const run: BetaRun = { ...reading, instrument: name, role }

    runs.push(run)

    return run
  }

  // step 1: each floor on 0041's fills
  for (const shape of FLOORS) {
    for (const fill of FINE_FILLS) {
      point(shape.name, fill, 'grid')
    }
  }

  // step 2: every confining grid point of either floor is a target on the other
  const targets = FLOORS.flatMap(shape =>
    runs
      .filter(r => r.role === 'grid' && r.instrument === shape.name && fineGates(r).string)
      .sort((a, b) => a.fill - b.fill)
      .map(r => ({ source: shape.name, sourceFill: r.fill, target: r.beta })),
  )

  for (const { source, sourceFill, target } of targets) {
    const other: FloorName = source === 'I-A' ? 'I-C' : 'I-A'
    const on = (): BetaRun[] => runs.filter(r => r.instrument === other)

    let pair = straddle(on(), target)

    if (pair === null) {
      for (const edge of [EDGE_LOW, EDGE_HIGH]) {
        if (!on().some(r => r.fill === edge)) {
          point(other, edge, 'edge')
        }
      }

      pair = straddle(on(), target)
    }

    let found: BetaRun | null = null
    let bisections = 0

    if (pair !== null) {
      const ends = pair.filter(r => within(r.beta, target)).sort((a, b) => Math.abs(a.beta - target) - Math.abs(b.beta - target))

      found = ends[0] ?? null

      let [low, high] = pair

      while (found === null && bisections < MAX_BISECTIONS) {
        const run = point(other, (low.fill + high.fill) / 2, 'bisect')

        bisections += 1

        if (within(run.beta, target)) {
          found = run
        } else if ((run.beta - target) * (low.beta - target) > 0) {
          low = run
        } else {
          high = run
        }
      }
    }

    const match: Match = {
      source,
      sourceFill,
      target,
      other,
      fill: found?.fill ?? null,
      beta: found?.beta ?? null,
      bisections,
    }

    matches.push(match)
    log(`match ${JSON.stringify(match)}`)
  }

  return { group: { order: color.group.order, centre: color.centre.length }, instruments, runs, matches }
}

const fmt = (x: number | null | undefined, d = 3): string =>
  x === null || x === undefined || !Number.isFinite(x) ? 'none' : x.toFixed(d)

export type MatchedPair = {
  match: Match
  a: BetaRun
  c: BetaRun
  both: boolean
  shift: number
  stable: boolean
}

export function matchedPairs(part: BetaPart): MatchedPair[] {
  const find = (name: FloorName, fill: number): BetaRun =>
    part.runs.find(r => r.instrument === name && r.fill === fill)!

  return part.matches
    .filter(m => m.fill !== null)
    .map(match => {
      const own = find(match.source, match.sourceFill)
      const found = find(match.other, match.fill!)
      const [a, c] = match.source === 'I-A' ? [own, found] : [found, own]
      const both = fineGates(a).string && fineGates(c).string
      const shift = Math.abs(c.chi22.value - a.chi22.value) / Math.abs(a.chi22.value)

      return { match, a, c, both, shift, stable: both && shift <= FLOOR_TOLERANCE }
    })
}

// R: the step-1 grid equals 0041's I-A and I-C runs (beta, chi22, layer plaquette) bit for bit
export function reproduces(part: BetaPart, reference: FinePart | null): boolean {
  if (reference === null) {
    return false
  }

  const grid = part.runs.filter(r => r.role === 'grid')
  const old = reference.runs.filter(r => r.instrument === 'I-A' || r.instrument === 'I-C')

  return (
    grid.length === old.length &&
    grid.every(r => {
      const o = old.find(x => x.instrument === r.instrument && x.fill === r.fill)

      return (
        o !== undefined &&
        o.beta === r.beta &&
        o.chi22.value === r.chi22.value &&
        o.chi22.error === r.chi22.error &&
        o.layerPlaquette === r.layerPlaquette
      )
    })
  )
}

export function betaVerdict(input: { part: BetaPart; reference: FinePart | null }): Verdict {
  const { part, reference } = input
  const gates = FLOORS.map(f => part.instruments[f.name]!)
  const i1 = part.group.order === 648 && part.group.centre === 3
  const i2 = gates.every(i2Holds)
  const i3 = gates.every(g => g.classConflicts === 0)
  const i4 = gates.every(g => g.bipartiteConflicts === 0)
  const i6 = part.runs.every(r => r.energyDrift === 0)
  const loopsClean = part.runs.every(r => r.loopFailures === 0)
  const r = reproduces(part, reference)
  const instrumentsHold = i1 && i2 && i3 && i4 && i6 && loopsClean && r
  const pairs = matchedPairs(part)
  const both = pairs.filter(p => p.both)
  const beyond = both.filter(p => !p.stable)
  const unmatched = part.matches.filter(m => m.fill === null)
  const status: Verdict['status'] = !instrumentsHold
    ? 'partial'
    : beyond.length > 0
      ? 'fail'
      : both.length >= PASS_PAIRS
        ? 'pass'
        : 'partial'
  const grid = (name: FloorName): BetaRun[] =>
    part.runs.filter(x => x.role === 'grid' && x.instrument === name).sort((a, b) => a.fill - b.fill)
  const fillRows = FINE_FILLS.map(fill => {
    const a = grid('I-A').find(x => x.fill === fill)!
    const c = grid('I-C').find(x => x.fill === fill)!
    const confine = fineGates(a).string && fineGates(c).string

    return { fill, a, c, confine, shift: Math.abs(c.chi22.value - a.chi22.value) / Math.abs(a.chi22.value) }
  })
  const metrics: Record<string, number> = {
    i1: i1 ? 1 : 0,
    i2: i2 ? 1 : 0,
    i3: i3 ? 1 : 0,
    i4: i4 ? 1 : 0,
    i6: i6 ? 1 : 0,
    loopsClean: loopsClean ? 1 : 0,
    reproduces: r ? 1 : 0,
    runs: part.runs.length,
    targets: part.matches.length,
    matched: pairs.length,
    unmatched: unmatched.length,
    bothConfining: both.length,
    beyondTolerance: beyond.length,
    maxShift: both.length > 0 ? Math.max(...both.map(p => p.shift)) : Number.NaN,
  }

  for (const x of part.runs) {
    const key = `${x.instrument}_f${x.fill}`

    metrics[`${key}_beta`] = x.beta
    metrics[`${key}_energyPerLink`] = x.energyPerLink
    metrics[`${key}_layerPlaquette`] = x.layerPlaquette
    metrics[`${key}_chi22`] = x.chi22.value
    metrics[`${key}_chi22Error`] = x.chi22.error
    metrics[`${key}_string`] = fineGates(x).string ? 1 : 0
  }

  pairs.forEach((p, k) => {
    metrics[`pair${k}_target`] = p.match.target
    metrics[`pair${k}_shift`] = p.shift
    metrics[`pair${k}_both`] = p.both ? 1 : 0
  })

  const pairText = (p: MatchedPair): string =>
    `beta ${fmt(p.match.target)} (from ${p.match.source} f ${p.match.sourceFill}): I-A f ${fmt(p.a.fill, 4)} E/link ${fmt(p.a.energyPerLink)} chi22 ${fmt(p.a.chi22.value)} +- ${fmt(p.a.chi22.error)} string ${fineGates(p.a).string ? 1 : 0}, I-C f ${fmt(p.c.fill, 4)} E/link ${fmt(p.c.energyPerLink)} chi22 ${fmt(p.c.chi22.value)} +- ${fmt(p.c.chi22.error)} string ${fineGates(p.c).string ? 1 : 0}, shift ${fmt(p.shift)}`

  return verdict({
    status,
    claim: `m1 at matched demon temperature on the period-4 cusp, floor 1 (I-A) against floor 2 (I-C): ${part.matches.length} targets, ${pairs.length} matched within ${BETA_TOLERANCE * 100} percent, ${both.length} with both points confining, ${beyond.length} beyond the ${FLOOR_TOLERANCE * 100} percent gate. Matched pairs: ${pairs.map(pairText).join('; ')}. Unmatched: ${unmatched.map(m => `beta ${fmt(m.target)} from ${m.source} f ${m.sourceFill}`).join(', ') || 'none'}. At matched fill (0041, not gated): ${fillRows.map(x => `f ${x.fill} beta ${fmt(x.a.beta)} / ${fmt(x.c.beta)} confine ${x.confine ? 1 : 0} shift ${fmt(x.shift)}`).join('; ')}. Instruments ${instrumentsHold ? 'hold' : 'FAIL'}`,
    metrics,
    control: { reproduces: r ? 1 : 0 },
    notes: `L2, mirrored grade. Gates registered before the run, gate f7ed3bbfb661. Instruments: ${JSON.stringify(part.instruments)}.`,
  })
}

// 0041's period-4 runs, left by its long run in the deck's tmp/ (the fetch may have put the file one folder down)
export function readReference(): FinePart | null {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'tmp', 'demon-link-m1-fine', 'floor.json')
  const inner = join(file, 'floor.json')
  const path = existsSync(inner) ? inner : existsSync(file) ? file : null

  return path === null ? null : (JSON.parse(readFileSync(path, 'utf8')) as FinePart)
}

export default experiment({
  id: 'gauge/demon-link-m1-beta',
  code: 'E-FRC-0319',
  title:
    'm1 of F35 (E-FRC-0110 itself) on the two period-4 floors of the {3,4,3,4} cusp at matched demon temperature instead of matched fill, pass (gates fixed before the run): 6 confining points matched within 1 percent in beta on the other floor; where both floors confine (beta 0.683, 0.626, 0.615) chi22 moves 15.5, 18.0 and 1.9 percent, inside the 25 percent gate, although the matched energies differ by about 1 unit per link (I-A 3.39 to 3.67, I-C 2.43 to 2.64), so the string tension follows the demon temperature, not the floor; the melt still moves with the floor: floor 1 confines down to beta 0.825 while floor 2 is still frozen there (its melted branch ends near beta 0.733); the grid reproduces E-FRC-0318 bit for bit and every instrument gate holds; orientation joining not claimed',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const log = (line: string): void => console.error(line)

    return betaVerdict({ part: betaPart(log), reference: readReference() })
  },
})
