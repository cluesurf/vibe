// The acceptance battery of E-FRC-0125, for any scheduled collision on the D4 box.
//
// E-FRC-0125 asked it of two wire tables inside its own file. The search for a color-local rule that
// dresses no more than the committed one (E-FRC-0136, E-FRC-0137) asks it of many schedules, so the items
// are here, each a function of a rule factory, and each computed exactly as E-FRC-0125 computes it. The
// one change of method is dressing, which is followed sparsely (code/measure/lone-dressing), an exact
// equivalent of the dense difference that E-FRC-0137 checks against the dense count on the committed and
// hop-free tables (33, 160, 565, 1,508 and 51, 331, 1,319, 2,587, the numbers E-FRC-0125 printed).
//
// 1. Reversal and charge (side 5). 2. CPT at the collision level: the first mirror phase, or -1.
// 3. The empty vacuum's period over three schedule periods (side 7). 4. Line-graph components of a lone
// tone's disturbance, on the vacuum and on a dense background (side 5). 5. Worst superposition defect
// of the clock amplitude (side 11). 6. Walls: settled content a whole number of sheets (side 9).
// 7. Dressing: largest support per period over every direction (side 9), for a love and for a fear.
// 8. Travel: how far a lone tone's disturbance reaches in 6 beats (side 13).

import { type Collision } from '@/code/rule/collision'
import { collide, growingBeat, inverseBeat, streamSourceTable } from '@/code/rule/lattice-gas'
import { backgroundRun, loneDressing, neighbourTable, perturbationOn, vacuumCells } from '@/code/measure/lone-dressing'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxCoordinates, d4BoxDistance, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites, type Mesh } from '@/code/tool/mesh'

export type ScheduledRule = (opposite: number[], forward: boolean) => (t: number) => Collision

export const ACCEPTANCE_PERIOD = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2
const LATE_BY = 1
const TRAVEL_BEATS = 6

type Built = { mesh: Mesh; forward: (t: number) => Collision; backward: (t: number) => Collision }

const MESHES = new Map<number, Mesh>()

function meshOf(side: number): Mesh {
  const cached = MESHES.get(side)

  if (cached) {
    return cached
  }

  const mesh = d4BoxMesh({ side })

  MESHES.set(side, mesh)

  return mesh
}

const NEIGHBOURS = new Map<number, Int32Array>()

function neighboursOf(side: number): Int32Array {
  const cached = NEIGHBOURS.get(side)

  if (cached) {
    return cached
  }

  const table = neighbourTable(meshOf(side))

  NEIGHBOURS.set(side, table)

  return table
}

function build(rule: ScheduledRule, side: number): Built {
  const mesh = meshOf(side)
  const opposite = meshOpposites(mesh)

  return { mesh, forward: rule(opposite, true), backward: rule(opposite, false) }
}

// beat of code/rule/lattice-gas (collide, then stream), streaming through the mesh's cached gather table
function beat(will: Will, collision: Collision): Will {
  const table = streamSourceTable(will.mesh)
  const out = new Int8Array(will.data.length)

  collide(will, collision)

  for (let i = 0; i < table.length; i++) {
    out[i] = will.data[table[i] ?? 0] ?? 0
  }

  return { mesh: will.mesh, data: out }
}

function difference(a: Will, b: Will): number {
  let count = 0

  for (let i = 0; i < a.data.length; i++) {
    count += a.data[i] === b.data[i] ? 0 : 1
  }

  return count
}

function dense(mesh: Mesh): Will {
  const will = makeWill(mesh)

  for (let i = 0; i < will.data.length; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    will.data[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
  }

  return will
}

export function reversalAndCharge(rule: ScheduledRule): { reverses: boolean; chargeKept: boolean } {
  const five = build(rule, 5)
  const start = dense(five.mesh)
  const charge = (w: Will): number => w.data.reduce((a, b) => a + b, 0)

  let s = dense(five.mesh)
  let chargeKept = true

  for (let t = 0; t < ACCEPTANCE_PERIOD; t++) {
    s = beat(s, five.forward(t))
    chargeKept = chargeKept && charge(s) === charge(start)
  }

  for (let t = ACCEPTANCE_PERIOD - 1; t >= 0; t--) {
    s = inverseBeat(s, five.backward(t))
  }

  return { reverses: s.data.every((x, i) => x === start.data[i]), chargeKept }
}

export function cptMirrorPhase(rule: ScheduledRule): number {
  const five = build(rule, 5)
  const applyCell = (collision: Collision, v: Int8Array): Int8Array => {
    const out = Int8Array.from(v)

    collision(out, 0, 24)

    return out
  }

  for (let c = 0; c < ACCEPTANCE_PERIOD; c++) {
    let holds = true

    for (let t = 0; t < ACCEPTANCE_PERIOD && holds; t++) {
      const mirror = (((c - t) % ACCEPTANCE_PERIOD) + ACCEPTANCE_PERIOD) % ACCEPTANCE_PERIOD

      for (let n = 0; n < 400 && holds; n++) {
        const v = new Int8Array(24)

        for (let i = 0; i < 24; i++) {
          v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1

          if (n % 2 === 0 && (n + i) % 5 !== 0) {
            v[i] = 0
          }
        }

        const rhs = applyCell(five.forward(t), v)
        const lhs = applyCell(five.backward(mirror), Int8Array.from(v, x => -x))

        holds = lhs.every((x, k) => -x === rhs[k])
      }
    }

    if (holds) {
      return c
    }
  }

  return -1
}

// the empty vacuum's period over three schedule periods, 0 if none up to one period. The vacuum stays
// the same in every cell, so this is the dense count of E-FRC-0125 read on one cell (checked equal there)
export function vacuumPeriod(rule: ScheduledRule): number {
  const seven = build(rule, 7)
  const cells = vacuumCells({ forward: seven.forward, beats: 3 * ACCEPTANCE_PERIOD })
  const states = ['1'.repeat(24), ...cells.map(c => Array.from(c, x => x + 1).join(''))]

  for (let p = 1; p <= ACCEPTANCE_PERIOD; p++) {
    if (states.every((x, t) => t + p >= states.length || x === states[t + p])) {
      return p
    }
  }

  return 0
}

// Line-graph components. The background runs once and each direction's flip is followed only where it
// differs from it (code/measure/lone-dressing, perturbationOn), which gives the dense count exactly;
// `dense: true` runs both states in full for every direction, as E-FRC-0125 does, for checking that
export function lineComponents(rule: ScheduledRule, withDense: boolean, input: { dense?: boolean } = {}): number {
  if (!input.dense) {
    return sparseComponents(rule, withDense)
  }

  const five = build(rule, 5)
  const opposite5 = meshOpposites(five.mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < (opposite5[d] ?? d)) {
      lines.push([d, opposite5[d] ?? d])
    }
  }

  const lineOf = (d: number): number => lines.findIndex(([a, b]) => a === d || b === d)
  const center5 = 2 * (1 + 5 + 25 + 125)
  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))

  for (let direction = 0; direction < 24; direction++) {
    let vac: Will = withDense ? dense(five.mesh) : makeWill(five.mesh)
    let seeded: Will = withDense ? dense(five.mesh) : makeWill(five.mesh)
    const slot = center5 * 24 + direction
    const touched = new Set<number>()

    seeded.data[slot] = seeded.data[slot] === 1 ? -1 : 1

    for (let t = 0; t < ACCEPTANCE_PERIOD; t++) {
      vac = beat(vac, five.forward(t))
      seeded = beat(seeded, five.forward(t))

      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vac.data[i]) {
          touched.add(lineOf(i % 24))
        }
      }
    }

    for (const line of touched) {
      parent[find(line)] = find(lineOf(direction))
    }
  }

  return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
}

function sparseComponents(rule: ScheduledRule, withDense: boolean): number {
  const five = build(rule, 5)
  const opposite5 = meshOpposites(five.mesh)
  const lineOf: number[] = []
  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < (opposite5[d] ?? d)) {
      lines.push([d, opposite5[d] ?? d])
    }
  }

  for (let d = 0; d < 24; d++) {
    lineOf.push(lines.findIndex(([a, b]) => a === d || b === d))
  }

  const center5 = 2 * (1 + 5 + 25 + 125)
  const start = withDense ? dense(five.mesh).data : new Int8Array(five.mesh.cellCount * 24)
  const background = backgroundRun({ neighbours: neighboursOf(5), forward: five.forward, start, beats: ACCEPTANCE_PERIOD })
  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))

  for (let direction = 0; direction < 24; direction++) {
    const touched = new Set<number>()
    const slot = center5 * 24 + direction

    perturbationOn({
      neighbours: neighboursOf(5),
      forward: five.forward,
      background,
      cell: center5,
      direction,
      value: start[slot] === 1 ? -1 : 1,
      beats: ACCEPTANCE_PERIOD,
      watch: (_, live, entering) => {
        for (const [y, state] of live) {
          for (let d = 0; d < 24; d++) {
            if (state[d] !== entering[y * 24 + d]) {
              touched.add(lineOf[d] ?? 0)
            }
          }
        }
      },
    })

    for (const line of touched) {
      parent[find(line)] = find(lineOf[direction] ?? 0)
    }
  }

  return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
}

export function additivityWorst(rule: ScheduledRule): number {
  const eleven = build(rule, 11)
  const seedA = d4BoxCell({ coordinates: [1, 1, 1, 1], side: 11 })
  const seedB = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 11 })
  const branch = (seeds: number[]): [number, number][] => {
    let vac: Will = makeWill(eleven.mesh)
    let seeded: Will = makeWill(eleven.mesh)
    const out: [number, number][] = []

    for (const cell of seeds) {
      seeded.data[cell * 24] = 1
    }

    for (let t = 0; t < 6; t++) {
      vac = beat(vac, eleven.forward(t))
      seeded = beat(seeded, eleven.forward(t))

      const a = clockAmplitude(seeded)
      const b = clockAmplitude(vac)

      out.push([a[0] - b[0], a[1] - b[1]])
    }

    return out
  }
  const a = branch([seedA])
  const b = branch([seedB])
  const joint = branch([seedA, seedB])

  return Math.max(...joint.map((j, t) => Math.hypot(j[0] - (a[t]?.[0] ?? 0) - (b[t]?.[0] ?? 0), j[1] - (a[t]?.[1] ?? 0) - (b[t]?.[1] ?? 0))))
}

export function walls(rule: ScheduledRule): { quantized: boolean; settledMax: number } {
  const nine = build(rule, 9)
  const late = (cell: number): boolean => (d4BoxCoordinates({ cell, side: 9 })[0] ?? 0) >= 5

  let staggered: Will = makeWill(nine.mesh)
  let uniform: Will = makeWill(nine.mesh)

  const wall: number[] = []

  // once every cell is born, growingBeat is the plain beat, so the plain one runs from then on
  for (let t = 0; t < 8 * ACCEPTANCE_PERIOD; t++) {
    staggered = t < LATE_BY ? growingBeat(staggered, nine.forward(t), cell => !late(cell)) : beat(staggered, nine.forward(t))
    uniform = beat(uniform, nine.forward(t))
    wall.push(difference(staggered, uniform))
  }

  const sheet = 9 ** 3
  const settled = wall.slice(3 * ACCEPTANCE_PERIOD)

  return { quantized: settled.every(x => x % sheet === 0), settledMax: Math.max(...settled) }
}

export type Dressing = {
  // largest support in each period, over every direction
  readonly periodLargest: number[]
  // per direction, the largest support over all the periods run
  readonly perDirection: number[]
  // directions whose support is exactly 1 for the whole first period
  readonly protectedSpecies: number
  // the worst ratio of last-period to first-period support, as E-FRC-0125 reports
  readonly worstGrowth: number
  // the first period whose cap was exceeded, or -1. When a cap stops the run, the numbers above cover
  // only what was run before it
  readonly overCapAt: number
}

// A lone tone on every direction at the center of the side-9 box (or of `side`, for robustness). `caps`, when given, stops as soon as
// the support in period p exceeds caps[p], so a search can reject a rule after the period it fails in.
export function dressing(
  rule: ScheduledRule,
  input: { tone?: number; periods?: number; caps?: readonly number[]; side?: number } = {},
): Dressing {
  const periods = input.periods ?? 4
  const side = input.side ?? 9
  const middle = Math.floor(side / 2)
  const nine = build(rule, side)
  const neighbours = neighboursOf(side)
  const vacuum = vacuumCells({ forward: nine.forward, beats: periods * ACCEPTANCE_PERIOD })
  const center9 = d4BoxCell({ coordinates: [middle, middle, middle, middle], side })
  const periodLargest = Array.from({ length: periods }, () => 0)
  const perDirection: number[] = []

  const caps = input.caps

  let protectedSpecies = 0
  let worstGrowth = 0
  let overCapAt = -1

  for (let direction = 0; direction < 24 && overCapAt < 0; direction++) {
    const run = loneDressing({
      neighbours,
      forward: nine.forward,
      vacuum,
      cell: center9,
      direction,
      beats: periods * ACCEPTANCE_PERIOD,
      tone: input.tone ?? 1,
      stop: caps ? (t, support) => support > (caps[Math.floor(t / ACCEPTANCE_PERIOD)] ?? Number.POSITIVE_INFINITY) : undefined,
    })
    const support = run.map(b => b.support)

    protectedSpecies += support.slice(0, ACCEPTANCE_PERIOD).every(x => x === 1) ? 1 : 0

    for (let p = 0; p < periods; p++) {
      const window = support.slice(p * ACCEPTANCE_PERIOD, (p + 1) * ACCEPTANCE_PERIOD)

      periodLargest[p] = Math.max(periodLargest[p] ?? 0, ...window, 0)
    }

    perDirection.push(Math.max(...support))

    if (support.length < periods * ACCEPTANCE_PERIOD) {
      overCapAt = Math.floor((support.length - 1) / ACCEPTANCE_PERIOD)
    } else {
      worstGrowth = Math.max(
        worstGrowth,
        Math.max(...support.slice(-ACCEPTANCE_PERIOD)) / Math.max(1, Math.max(...support.slice(0, ACCEPTANCE_PERIOD))),
      )
    }
  }

  return { periodLargest, perDirection, protectedSpecies, worstGrowth, overCapAt }
}

export function travel(rule: ScheduledRule): { travellers: number; meanReach: number } {
  const thirteen = build(rule, 13)
  const center13 = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 13 })
  const free = Math.SQRT2 * TRAVEL_BEATS
  const reaches = Array.from({ length: 24 }, (_, direction) => {
    let vac: Will = makeWill(thirteen.mesh)
    let seeded: Will = makeWill(thirteen.mesh)

    seeded.data[center13 * 24 + direction] = 1

    for (let t = 0; t < TRAVEL_BEATS; t++) {
      vac = beat(vac, thirteen.forward(t))
      seeded = beat(seeded, thirteen.forward(t))
    }

    let farthest = 0

    for (let i = 0; i < seeded.data.length; i += 24) {
      for (let d = 0; d < 24; d++) {
        if (seeded.data[i + d] !== vac.data[i + d]) {
          farthest = Math.max(farthest, d4BoxDistance({ a: i / 24, b: center13, side: 13 }))
          break
        }
      }
    }

    return farthest
  })

  return { travellers: reaches.filter(r => r >= free / 2).length, meanReach: reaches.reduce((x, y) => x + y, 0) / reaches.length }
}

export type Acceptance = {
  readonly reverses: boolean
  readonly chargeKept: boolean
  readonly cptPhase: number
  readonly vacuumPeriod: number
  readonly vacuumComponents: number
  readonly denseComponents: number
  readonly additivityWorst: number
  readonly wallQuantized: boolean
  readonly wallMax: number
  readonly love: Dressing
  readonly fear: Dressing
  readonly travellers: number
  readonly meanReach: number
}

export function acceptance(rule: ScheduledRule): Acceptance {
  const { reverses, chargeKept } = reversalAndCharge(rule)
  const wall = walls(rule)
  const moving = travel(rule)

  return {
    reverses,
    chargeKept,
    cptPhase: cptMirrorPhase(rule),
    vacuumPeriod: vacuumPeriod(rule),
    vacuumComponents: lineComponents(rule, false),
    denseComponents: lineComponents(rule, true),
    additivityWorst: additivityWorst(rule),
    wallQuantized: wall.quantized,
    wallMax: wall.settledMax,
    love: dressing(rule, { tone: 1 }),
    fear: dressing(rule, { tone: -1 }),
    travellers: moving.travellers,
    meanReach: moving.meanReach,
  }
}

export const STAGED_GATES = [
  'dressing',
  'cpt',
  'vacuumPeriod',
  'vacuumComponents',
  'denseComponents',
  'superposition',
  'reversal',
  'walls',
] as const

export type StagedGate = (typeof STAGED_GATES)[number]

export type Staged = {
  // the first gate failed, in the order of STAGED_GATES, or undefined when every gate passes
  readonly failed: StagedGate | undefined
  // the love's dressing as far as it ran (to the period that broke the cap, or all four)
  readonly love: Dressing
  // the other measured values, filled as far as the stages ran
  readonly values: Readonly<Record<string, number>>
}

// The gates of passesAgainst in increasing cost, stopping at the first that fails, so a search pays for
// the expensive items only on the members that clear the cheap ones. The reference is passed as its
// measured numbers, so every gate here is the same comparison passesAgainst makes.
export function stagedAcceptance(rule: ScheduledRule, reference: Acceptance): Staged {
  const values: Record<string, number> = {}
  const love = dressing(rule, { caps: reference.love.periodLargest })
  const done = (failed: StagedGate | undefined): Staged => ({ failed, love, values })

  if (love.overCapAt >= 0) {
    return done('dressing')
  }

  values.cptPhase = cptMirrorPhase(rule)

  if (values.cptPhase < 0 && reference.cptPhase >= 0) {
    return done('cpt')
  }

  values.vacuumPeriod = vacuumPeriod(rule)

  if (values.vacuumPeriod <= 0 && reference.vacuumPeriod > 0) {
    return done('vacuumPeriod')
  }

  values.vacuumComponents = lineComponents(rule, false)

  if (values.vacuumComponents > reference.vacuumComponents) {
    return done('vacuumComponents')
  }

  values.denseComponents = lineComponents(rule, true)

  if (values.denseComponents > reference.denseComponents) {
    return done('denseComponents')
  }

  values.additivityWorst = additivityWorst(rule)

  if (values.additivityWorst >= 1e-9 && reference.additivityWorst < 1e-9) {
    return done('superposition')
  }

  const reversal = reversalAndCharge(rule)

  values.reverses = reversal.reverses ? 1 : 0
  values.chargeKept = reversal.chargeKept ? 1 : 0

  if ((!reversal.reverses && reference.reverses) || (!reversal.chargeKept && reference.chargeKept)) {
    return done('reversal')
  }

  const wall = walls(rule)

  values.wallQuantized = wall.quantized ? 1 : 0
  values.wallMax = wall.settledMax

  if (!(wall.quantized && wall.settledMax > 0) && reference.wallQuantized && reference.wallMax > 0) {
    return done('walls')
  }

  return done(undefined)
}

// how far past the reference's dressing a structural search follows a member before stopping
export const FRONTIER = 1.5

export type Structural = {
  // the first structural gate failed, or undefined when all of them pass
  readonly failed: StagedGate | undefined
  readonly values: Readonly<Record<string, number>>
  // the love's dressing when the structural gates pass (stopped at FRONTIER times the reference), and
  // the fear's in full when the love's passes
  readonly love: Dressing | undefined
  readonly fear: Dressing | undefined
}

// The other order: CPT, the vacuum's period and both line graphs first, then the dressing of a love on
// every member that passes those (and of a fear where the love's passes), then superposition, reversal and charge, and walls on
// the members whose love dresses no more than the reference. It answers what the smallest dressing is
// among the rules whose interaction structure is acceptable, and pays for the costly wall item only
// where it could decide the outcome.
export function structuralAcceptance(rule: ScheduledRule, reference: Acceptance): Structural {
  const values: Record<string, number> = {}

  let love: Dressing | undefined
  let fear: Dressing | undefined

  const done = (failed: StagedGate | undefined): Structural => ({ failed, values, love, fear })

  values.cptPhase = cptMirrorPhase(rule)

  if (values.cptPhase < 0 && reference.cptPhase >= 0) {
    return done('cpt')
  }

  values.vacuumPeriod = vacuumPeriod(rule)

  if (values.vacuumPeriod <= 0 && reference.vacuumPeriod > 0) {
    return done('vacuumPeriod')
  }

  values.vacuumComponents = lineComponents(rule, false)

  if (values.vacuumComponents > reference.vacuumComponents) {
    return done('vacuumComponents')
  }

  values.denseComponents = lineComponents(rule, true)

  if (values.denseComponents > reference.denseComponents) {
    return done('denseComponents')
  }

  // followed in full up to FRONTIER times the reference in every period, so the members near the gate
  // are measured exactly and a member far past it stops early (overCapAt says where)
  love = dressing(rule, { tone: 1, caps: reference.love.periodLargest.map(x => x * FRONTIER) })

  if (love.overCapAt >= 0 || !love.periodLargest.every((x, p) => x <= (reference.love.periodLargest[p] ?? 0))) {
    return done('dressing')
  }

  fear = dressing(rule, { tone: -1 })

  values.additivityWorst = additivityWorst(rule)

  if (values.additivityWorst >= 1e-9 && reference.additivityWorst < 1e-9) {
    return done('superposition')
  }

  const reversal = reversalAndCharge(rule)

  if ((!reversal.reverses && reference.reverses) || (!reversal.chargeKept && reference.chargeKept)) {
    return done('reversal')
  }

  const wall = walls(rule)

  values.wallMax = wall.settledMax

  if (!(wall.quantized && wall.settledMax > 0) && reference.wallQuantized && reference.wallMax > 0) {
    return done('walls')
  }

  return done(undefined)
}

// every gate of E-FRC-0125, the candidate against the reference: at least as good wherever the reference
// passes, fewer or as many line components, and a love's dressing no larger in any period. `bothSigns`
// also asks it of a fear, which E-FRC-0125 did not
export function passesAgainst(candidate: Acceptance, reference: Acceptance, input: { bothSigns?: boolean } = {}): boolean {
  const atLeast = (ok: boolean, ref: boolean): boolean => ok || !ref
  const dressedNoMore = (a: Dressing, b: Dressing): boolean => a.periodLargest.every((x, p) => x <= (b.periodLargest[p] ?? 0))

  return (
    atLeast(candidate.reverses, reference.reverses) &&
    atLeast(candidate.chargeKept, reference.chargeKept) &&
    atLeast(candidate.cptPhase >= 0, reference.cptPhase >= 0) &&
    atLeast(candidate.vacuumPeriod > 0, reference.vacuumPeriod > 0) &&
    candidate.vacuumComponents <= reference.vacuumComponents &&
    candidate.denseComponents <= reference.denseComponents &&
    atLeast(candidate.additivityWorst < 1e-9, reference.additivityWorst < 1e-9) &&
    atLeast(candidate.wallQuantized && candidate.wallMax > 0, reference.wallQuantized && reference.wallMax > 0) &&
    dressedNoMore(candidate.love, reference.love) &&
    (!input.bothSigns || dressedNoMore(candidate.fear, reference.fear))
  )
}
