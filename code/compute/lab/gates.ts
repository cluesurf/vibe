// M5, routing and gates. Algebra: balanced ternary, read through the tones of the
// spin-one pair rules of M1 (code/rule/pair-rule.ts) and the particles of M3 (code/measure/particle-census.ts). Nothing
// here adds a cell kind, a weight or a rule: a construction is a LAYOUT, a finite set of cells given tones on a uniform
// background the rule fixes, under the declared partition schedule. The layout is the one ingredient an outside programmer
// supplies (added structure `programmer_layout`), as in Q3.
//
// ENCODING (declared before the first run). A trit is the tone of one slot: a cell at a round end. On background b the
// value b means the slot is empty. A slot is a WIRE when a lone tone of either off-background value placed there travels
// as one cell, never static, along the SAME cell track for both values (so the track carries a trit, not a bit). An
// output rides a wire when, for every input, the slot's tone then follows that lone track for the declared hold rounds
// in the joint run.
//
// TARGETS. Kleene logic on {-1, 0, +1}: neg x = -x, min, max. Charge Q is conserved by every rule, and min + max = x + y,
// so a gate with garbage is a layout whose run puts the target's value in one output slot for every input while the
// rest of the final state (the garbage) carries whatever Q and the bijection force.
//
// LINE SEARCH. On the infinite line under the brick schedule (color 0 pairs (2k, 2k + 1), color 1 pairs (2k + 1, 2k + 2),
// left cell first) a layout of width W at start parity s is every assignment of the non-input window cells to the
// three tones. Every layout is run for every input (exhaustive truth tables) by an exact dense run whose array covers the
// light cone (each color moves a tone at most one cell), and every (cell, round) is read for the targets. The search is
// complete for its widths: a target absent from every layout of width at most W is absent from all of them.
//
// TILINGS. On a lazy window (code/compute/lab/lazy-space.ts) the same objects are read from exact sparse runs: lone
// tracks, a mover meeting an obstacle species (reflected, transmitted, turned, or broken), and the two-mover meeting as
// a two-trit gate with its exhaustive table.

import {
  PairSpace,
  Tones,
  sameTones,
  sparseRound,
} from '@/code/measure/particle-census'
import { PairTable, pairTones } from '@/code/rule/pair-rule'

export type GateRule = {
  readonly name: string
  readonly table: PairTable
  readonly first: Int8Array
  readonly second: Int8Array
}

export function gateRule(name: string, table: PairTable): GateRule {
  const first = new Int8Array(9)
  const second = new Int8Array(9)

  for (let p = 0; p < 9; p++) {
    const [a, b] = pairTones(table[p]!)

    first[p] = a
    second[p] = b
  }

  return { name, table, first, second }
}

export function fixesUniform(rule: GateRule, background: number): boolean {
  const p = (background + 1) * 4

  return rule.first[p] === background && rule.second[p] === background
}

// ---- balanced ternary targets ----

export const TRITS = [-1, 0, 1] as const

export type Target = {
  readonly name: string
  readonly arity: number
  readonly table: Int8Array
}

// the inputs of an arity-k table, in order: input i has digits (i / 3^j) mod 3 - 1, first input least significant
export function inputsOf(arity: number): number[][] {
  const out: number[][] = []

  for (let i = 0; i < 3 ** arity; i++) {
    out.push(Array.from({ length: arity }, (_, j) => (Math.floor(i / 3 ** j) % 3) - 1))
  }

  return out
}

export function truthTable(arity: number, f: (x: readonly number[]) => number): Int8Array {
  return Int8Array.from(inputsOf(arity).map(f))
}

export const KLEENE_TARGETS: readonly Target[] = [
  { name: 'neg', arity: 1, table: truthTable(1, ([x]) => -x!) },
  { name: 'min', arity: 2, table: truthTable(2, ([x, y]) => Math.min(x!, y!)) },
  { name: 'max', arity: 2, table: truthTable(2, ([x, y]) => Math.max(x!, y!)) },
]

// Positive controls for the search instruments: |x| and -|x| are reachable by an occupancy-blind rule (on each
// occupancy class they are one constant), so a search that misses them is broken.
export const CONTROL_TARGETS: readonly Target[] = [
  { name: 'abs', arity: 1, table: truthTable(1, ([x]) => Math.abs(x!)) },
  { name: 'negAbs', arity: 1, table: truthTable(1, ([x]) => -Math.abs(x!)) },
]

export const tableKey =(t: ArrayLike<number>): string => Array.from(t).join(',')

// ---- the line, dense and exact ----

export type LineRun = {
  // array index = position + pad (pad even, so index parity = position parity)
  pad: number
  // the tones at every round end, round 0 the start
  frames: Int8Array[]
}

export function lineBrickRun(input: {
  rule: GateRule
  background: number
  start: number
  window: ArrayLike<number>
  rounds: number
}): LineRun {
  const { rule, background, start, window, rounds } = input
  const pad = 2 * rounds + 2
  const length = start + window.length + 2 * pad
  const cells = new Int8Array(length).fill(background)

  for (let i = 0; i < window.length; i++) {
    cells[start + i + pad] = window[i]!
  }

  const frames = [Int8Array.from(cells)]

  let lo = start + pad
  let hi = start + pad + window.length - 1

  for (let t = 0; t < rounds; t++) {
    for (let color = 0; color < 2; color++) {
      // pairs (i, i + 1) with i of the color's parity that touch the support [lo, hi]
      let i = Math.max(0, lo - 2)

      if ((i & 1) !== color) {
        i++
      }

      for (; i + 1 < length && i <= hi; i += 2) {
        const p = (cells[i]! + 1) * 3 + cells[i + 1]! + 1

        cells[i] = rule.first[p]!
        cells[i + 1] = rule.second[p]!
      }

      lo = Math.max(0, lo - 1)
      hi = Math.min(length - 1, hi + 1)
    }

    frames.push(Int8Array.from(cells))
  }

  return { pad, frames }
}

// The lone track of tone `tone` started at a cell of parity `parity`: the displacement at every round end, or null when
// the tone does not stay one cell. On the line every lone track is fixed by parity (the schedule repeats every 2 cells).
export function lineLoneTrack(input: {
  rule: GateRule
  background: number
  parity: number
  tone: number
  rounds: number
}): number[] | null {
  const run = lineBrickRun({
    rule: input.rule,
    background: input.background,
    start: input.parity,
    window: [input.tone],
    rounds: input.rounds,
  })
  const home = input.parity + run.pad
  const out: number[] = []

  for (const frame of run.frames) {
    let at = -1

    for (let i = 0; i < frame.length; i++) {
      if (frame[i] !== input.background) {
        if (at >= 0 || frame[i] !== input.tone) {
          return null
        }

        at = i
      }
    }

    if (at < 0) {
      return null
    }

    out.push(at - home)
  }

  return out
}

export type LineWire = {
  background: number
  parity: number
  // displacement per round end for each off-background tone (null: not one cell)
  tracks: Record<string, number[] | null>
  // both off-background tones move as one cell along the same track
  ternary: boolean
  // displacement per round, when the shared track is straight
  velocity: number | null
}

export function lineWire(input: { rule: GateRule; background: number; parity: number; rounds: number }): LineWire {
  const tones = TRITS.filter(t => t !== input.background)
  const tracks: Record<string, number[] | null> = {}

  for (const t of tones) {
    tracks[t] = lineLoneTrack({ ...input, tone: t })
  }

  const a = tracks[tones[0]!] ?? null
  const b = tracks[tones[1]!] ?? null
  const shared = a !== null && b !== null && a.every((x, i) => x === b[i]) ? a : null
  const moves = shared?.some(x => x !== 0) === true
  const v = (shared?.length ?? 0) > 1 ? shared![1]! - shared![0]! : 0
  const straight = shared !== null && moves && shared.every((x, i) => x === shared[0]! + v * i)

  return {
    background: input.background,
    parity: input.parity,
    tracks,
    ternary: moves,
    velocity: straight && v !== 0 ? v : null,
  }
}

export type LineGate = {
  target: string
  rule: string
  background: number
  start: number
  width: number
  // the window's tones, inputs written as null
  window: (number | null)[]
  inputs: number[]
  constants: number
  readPosition: number
  readRound: number
  velocity: number
  // the final state of every input outside the read slot, as position:tone lists (the garbage)
  garbage: string[]
  // layouts of this width that compute the target, and layouts of this width tried
  found: number
  tried: number
}

export type LineSearch = {
  rule: string
  background: number
  gates: LineGate[]
  // per target, the widest width tried with no layout found
  absent: Record<string, number>
  // when collecting: every table that rides a wire, keyed `arity:table`, with the smallest width that reached it
  reachable: Map<string, number>
  layouts: number
  runs: number
}

const positionsOf = (width: number, k: number): number[][] => {
  const out: number[][] = []

  const pick = (from: number, acc: number[]): void => {
    if (acc.length === k) {
      out.push([...acc])

      return
    }

    for (let i = from; i < width; i++) {
      acc.push(i)
      pick(i + 1, acc)
      acc.pop()
    }
  }

  pick(0, [])

  return out
}

// Exhaustive search for each target on the line, the smallest width first; the first width with a layout ends the
// search for that target. A read slot counts only when it rides a wire for `hold` rounds after the read round. With
// `collect`, every width to maxWidth is run and every riding table of each arity is recorded.
export function searchLineGates(input: {
  rule: GateRule
  background: number
  targets: readonly Target[]
  maxWidth: number
  readRounds: number
  hold: number
  collect?: boolean
}): LineSearch {
  const { rule, background, targets, maxWidth, readRounds, hold } = input
  const rounds = readRounds + hold
  const tones = TRITS.filter(t => t !== background)
  const trackOf = new Map<string, number[] | null>()

  for (const parity of [0, 1]) {
    for (const t of tones) {
      trackOf.set(`${parity}|${t}`, lineLoneTrack({ rule, background, parity, tone: t, rounds }))
    }
  }

  const gates: LineGate[] = []
  const absent: Record<string, number> = {}
  const reachable = new Map<string, number>()

  let layouts = 0
  let runs = 0

  for (const arity of [...new Set(targets.map(t => t.arity))].sort()) {
    const inputs = inputsOf(arity)
    const open = new Set(targets.filter(t => t.arity === arity))

    for (let width = arity; width <= maxWidth && (open.size > 0 || input.collect); width++) {
      const free = width - arity
      const found = new Map<Target, number>()
      const best = new Map<Target, LineGate>()

      let tried = 0

      for (const start of [0, 1]) {
        for (const slots of positionsOf(width, arity)) {
          for (let code = 0; code < 3 ** free; code++) {
            tried++
            layouts++

            const window = new Int8Array(width)
            const shown: (number | null)[] = []

            let constants = 0
            let k = 0

            for (let i = 0; i < width; i++) {
              if (slots.includes(i)) {
                shown.push(null)
                continue
              }

              const tone = (Math.floor(code / 3 ** k) % 3) - 1

              k++
              window[i] = tone
              shown.push(tone)
              constants += tone === background ? 0 : 1
            }

            const runsOf: LineRun[] = inputs.map(x => {
              const w = Int8Array.from(window)

              slots.forEach((s, j) => {
                w[s] = x[j]!
              })
              runs++

              return lineBrickRun({ rule, background, start, window: w, rounds })
            })
            const pad = runsOf[0]!.pad
            const length = runsOf[0]!.frames[0]!.length
            const hits = new Map<Target, { index: number; round: number; velocity: number }>()

            for (let t = 0; t <= readRounds; t++) {
              for (let i = 0; i < length; i++) {
                const values = Int8Array.from(runsOf.map(r => r.frames[t]![i]!))

                if (values.every(v => v === background)) {
                  continue
                }

                const key = tableKey(values)
                const wanted = [...open].filter(g => !hits.has(g) && tableKey(g.table) === key)
                const seen = reachable.has(`${arity}:${key}`)

                if (wanted.length === 0 && (!input.collect || seen)) {
                  continue
                }

                const velocity = ridesLine({ runsOf, index: i, round: t, rounds, trackOf, background, values })

                if (velocity === null) {
                  continue
                }

                if (!seen) {
                  reachable.set(`${arity}:${key}`, width)
                }

                for (const g of wanted) {
                  hits.set(g, { index: i, round: t, velocity })
                }
              }
            }

            for (const [target, hit] of hits) {
              found.set(target, (found.get(target) ?? 0) + 1)

              const gate: LineGate = {
              target: target.name,
              rule: rule.name,
              background,
              start,
              width,
              window: shown,
              inputs: slots,
              constants,
              readPosition: hit.index - pad,
              readRound: hit.round,
              velocity: hit.velocity,
              garbage: runsOf.map(r => {
                const frame = r.frames[hit.round]!
                const cells: string[] = []

                frame.forEach((tone, i) => {
                  if (tone !== background && i !== hit.index) {
                    cells.push(`${i - pad}:${tone}`)
                  }
                })

                return cells.join(' ')
              }),
              found: 0,
              tried: 0,
            }
              const prior = best.get(target)

              if (
                !prior ||
                gate.constants < prior.constants ||
                (gate.constants === prior.constants && gate.readRound < prior.readRound)
              ) {
                best.set(target, gate)
              }
            }
          }
        }
      }

      for (const target of [...open]) {
        const gate = best.get(target)

        if (gate) {
          gates.push({ ...gate, found: found.get(target)!, tried })
          open.delete(target)
        } else {
          absent[target.name] = width
        }
      }
    }
  }

  return { rule: rule.name, background, gates, absent, reachable, layouts, runs }
}

// Whether the slot (index, round) rides a wire: for every input whose value there is off the background, the tone
// follows its lone track for the remaining rounds; both off-background values must share one moving track. Returns the
// velocity (cells per round, from the track's first step) or null.
function ridesLine(input: {
  runsOf: readonly LineRun[]
  index: number
  round: number
  rounds: number
  trackOf: ReadonlyMap<string, number[] | null>
  background: number
  values: Int8Array
}): number | null {
  const { runsOf, index, round, rounds, trackOf, background, values } = input
  const parity = (index - runsOf[0]!.pad) & 1
  const used = [...new Set(Array.from(values).filter(v => v !== background))]

  if (used.length === 0) {
    return null
  }

  const tracks = used.map(v => trackOf.get(`${parity}|${v}`) ?? null)

  if (tracks.some(t => t === null)) {
    return null
  }

  const track = tracks[0]!

  if (tracks.some(t => t!.some((x, i) => x !== track[i])) || track.every(x => x === 0)) {
    return null
  }

  for (let n = 0; n < runsOf.length; n++) {
    const v = values[n]!

    if (v === background) {
      continue
    }

    for (let s = 1; round + s <= rounds; s++) {
      const at = index + track[s]! - track[0]!
      const frame = runsOf[n]!.frames[round + s]!

      if (at < 0 || at >= frame.length || frame[at] !== v) {
        return null
      }
    }
  }

  return track[1]! - track[0]!
}

// ---- sparse runs on any pair space (the line or a lazy window) ----

export type SpaceRun = {
  space: PairSpace
  colors: readonly number[]
  rule: GateRule
  background: number
}

export function runRounds(run: SpaceRun, state: Tones, rounds: number): Tones[] {
  const s = new Map(state)
  const out = [new Map(s)]

  for (let t = 0; t < rounds; t++) {
    sparseRound({ ...run, state: s })
    out.push(new Map(s))
  }

  return out
}

// the lone track of a tone from a cell: its cell at every round end, or null when it does not stay one cell of that tone
export function loneTrack(run: SpaceRun, cell: number, tone: number, rounds: number): number[] | null {
  const out: number[] = []

  for (const s of runRounds(run, new Map([[cell, tone]]), rounds)) {
    if (s.size !== 1) {
      return null
    }

    const [[c, t]] = [...s.entries()] as [[number, number]]

    if (t !== tone) {
      return null
    }

    out.push(c)
  }

  return out
}

export type Wire = {
  cell: number
  ternary: boolean
  track: number[] | null
  // round-end distance from the origin of the track, per round
  radius: number[]
}

export function wireAt(run: SpaceRun, cell: number, rounds: number): Wire {
  const tones = TRITS.filter(t => t !== run.background)
  const a = loneTrack(run, cell, tones[0]!, rounds)
  const b = loneTrack(run, cell, tones[1]!, rounds)
  // a wire never comes back to a cell it held at a round end (a tone circling a face is confined, not a wire)
  const ternary =
    a !== null && b !== null && a.every((c, i) => c === b[i]) && new Set(a).size === a.length

  return {
    cell,
    ternary,
    track: ternary ? a : null,
    radius: ternary ? a.map(c => run.space.distance(c)) : [],
  }
}

// A lone tone's cell at every matching (color by color), with whether it was the first cell of its pair there; null when
// it does not stay one cell of its tone.
export function matchingTrack(
  run: SpaceRun,
  cell: number,
  tone: number,
  rounds: number,
): { cells: number[]; first: boolean[] } | null {
  const s: Tones = new Map([[cell, tone]])
  const cells: number[] = []
  const first: boolean[] = []

  for (let t = 0; t < rounds; t++) {
    for (const color of run.colors) {
      const [[at]] = [...s.entries()] as [[number, number]]

      cells.push(at)
      first.push(run.space.partner(color, at) >= 0 && run.space.isFirst(color, at))
      sparseRound({ ...run, colors: [color], state: s })

      if (s.size !== 1 || [...s.values()][0] !== tone) {
        return null
      }
    }
  }

  return { cells, first }
}

// pull a lone tone back `rounds` rounds with the inverse rule and the reversed colors
export function pullBack(run: SpaceRun & { inverse: GateRule }, state: Tones, rounds: number): Tones {
  const back = [...run.colors].reverse()
  const s = new Map(state)

  for (let t = 0; t < rounds; t++) {
    sparseRound({ space: run.space, colors: back, rule: run.inverse, background: run.background, state: s })
  }

  return s
}

// ---- a mover meeting an obstacle ----

export type EncounterKind = 'transmitted' | 'reflected' | 'turned' | 'broken' | 'missed'

export type Encounter = {
  kind: EncounterKind
  // the obstacle stands as it would alone after the run (a static or periodic species comes back to itself)
  obstacleKept: boolean
  // the mover's tone survived as one cell
  moverKept: boolean
}

// The mover (tone, lone track `track`) and the obstacle (a state that alone returns to itself every `obstaclePeriod`
// rounds) run together for `rounds` rounds. Reflected: after contact the mover retraces its incoming track in reverse,
// cell for cell, with one fixed lag. Transmitted: it stays on its lone track. Turned: it leaves on a track that is
// neither, still one cell, the obstacle intact, its distance from the contact growing. Broken: anything else.
export function encounter(input: {
  run: SpaceRun
  tone: number
  track: readonly number[]
  obstacle: Tones
  obstaclePeriod: number
  rounds: number
}): Encounter {
  const { run, tone, track, obstacle, obstaclePeriod, rounds } = input
  const start = new Map(obstacle)

  if (start.has(track[0]!)) {
    return { kind: 'broken', obstacleKept: false, moverKept: false }
  }

  start.set(track[0]!, tone)

  const joint = runRounds(run, start, rounds)
  const alone = runRounds(run, obstacle, rounds)

  // the round the joint run first differs from the union of the lone runs
  let contact = -1

  for (let t = 0; t <= rounds && contact < 0; t++) {
    const union = new Map(alone[t])

    if (union.has(track[t]!)) {
      contact = t
      break
    }

    union.set(track[t]!, tone)

    if (!sameTones(union, joint[t]!)) {
      contact = t
    }
  }

  if (contact < 0) {
    return { kind: 'missed', obstacleKept: true, moverKept: true }
  }

  const end = joint[rounds]!
  const obstacleEnd = alone[rounds - (rounds % obstaclePeriod)]!
  const rest = new Map(end)

  let obstacleKept = true

  for (const [c, t] of obstacleEnd) {
    if (rest.get(c) !== t) {
      obstacleKept = false
    }

    rest.delete(c)
  }

  const moverKept = rest.size === 1 && [...rest.values()][0] === tone

  if (!obstacleKept || !moverKept) {
    return { kind: 'broken', obstacleKept, moverKept }
  }

  // the mover's cell at every round after contact, read off the joint state minus the obstacle's lone state
  const mover: number[] = []

  for (let t = contact; t <= rounds; t++) {
    const left = new Map(joint[t])

    for (const c of alone[t]!.keys()) {
      left.delete(c)
    }

    if (left.size !== 1) {
      return { kind: 'broken', obstacleKept, moverKept }
    }

    mover.push([...left.keys()][0]!)
  }

  const late = Math.floor(mover.length / 2)
  const transmitted = mover.slice(late).every((c, i) => c === track[contact + late + i])

  if (transmitted) {
    return { kind: 'transmitted', obstacleKept, moverKept }
  }

  for (let lag = 0; lag <= 2 * contact; lag++) {
    let retrace = true

    for (let i = late; i < mover.length && retrace; i++) {
      const back = lag - (contact + i)

      retrace = back >= 0 && mover[i] === track[back]
    }

    if (retrace) {
      return { kind: 'reflected', obstacleKept, moverKept }
    }
  }

  const growing =
    run.space.distance(mover[mover.length - 1]!) > run.space.distance(mover[late]!) ||
    mover.slice(late).some(c => !alone[rounds]!.has(c))

  return { kind: growing ? 'turned' : 'broken', obstacleKept, moverKept }
}

// the cells within `radius` facets of `center`, in breadth-first order (center first)
export function ballCells(space: PairSpace, center: number, radius: number): number[] {
  const depth = new Map<number, number>([[center, 0]])
  const queue = [center]

  for (const u of queue) {
    if (depth.get(u)! >= radius) {
      continue
    }

    for (const w of space.neighbors(u)) {
      if (!depth.has(w)) {
        depth.set(w, depth.get(u)! + 1)
        queue.push(w)
      }
    }
  }

  return queue
}

export type InPlace = {
  state: Tones
  period: number
}

// The obstacles: every start of one or two cells, the first at `center` and the second within `radius` facets, with
// every off-background tone, that returns to itself exactly within `maxPeriod` rounds (static or periodic in place, so
// periodic forever: every round is a bijection).
export function inPlaceSpecies(run: SpaceRun, center: number, radius: number, maxPeriod: number): InPlace[] {
  const tones = TRITS.filter(t => t !== run.background)
  const starts: Tones[] = tones.map(t => new Map([[center, t]]))

  for (const c of ballCells(run.space, center, radius).slice(1)) {
    for (const t of tones) {
      for (const u of tones) {
        starts.push(new Map([[center, t], [c, u]]))
      }
    }
  }

  const out: InPlace[] = []

  for (const start of starts) {
    const s = new Map(start)

    for (let t = 1; t <= maxPeriod; t++) {
      sparseRound({ ...run, state: s })

      if (s.size > 2 * start.size + 2) {
        break
      }

      if (sameTones(s, start)) {
        out.push({ state: start, period: t })
        break
      }
    }
  }

  return out
}

export type ElementKind = 'reflector' | 'turn' | 'transmitter' | 'tone-dependent' | 'breaker'

export type ElementReading = {
  obstacle: string
  period: number
  moverStart: number
  // the outcome for each off-background tone of the mover, in TRITS order
  outcomes: EncounterKind[]
  kind: ElementKind | null
}

// Every wire start within `reach` facets of the obstacle's first cell, run against the obstacle for each off-background
// tone. A TRIT element acts alike on both tones and keeps the obstacle: reflector, turn, transmitter. Tone-dependent: the
// two tones get different outcomes. Breaker: the obstacle or the mover does not survive. Missed starts are dropped.
export function elementReadings(input: {
  run: SpaceRun
  obstacle: InPlace
  reach: number
  rounds: number
}): ElementReading[] {
  const { run, obstacle, reach, rounds } = input
  const tones = TRITS.filter(t => t !== run.background)
  const center = [...obstacle.state.keys()][0]!
  const out: ElementReading[] = []
  const name = [...obstacle.state.entries()].map(([c, t]) => `${c}:${t}`).join(' ')

  for (const cell of ballCells(run.space, center, reach)) {
    if (obstacle.state.has(cell)) {
      continue
    }

    const wire = wireAt(run, cell, rounds)

    if (!wire.ternary) {
      continue
    }

    const outcomes = tones.map(
      tone =>
        encounter({
          run,
          tone,
          track: wire.track!,
          obstacle: obstacle.state,
          obstaclePeriod: obstacle.period,
          rounds,
        }).kind,
    )

    if (outcomes.every(o => o === 'missed')) {
      continue
    }

    const same = outcomes.every(o => o === outcomes[0])
    const kind: ElementKind | null = !same
      ? 'tone-dependent'
      : outcomes[0] === 'reflected'
        ? 'reflector'
        : outcomes[0] === 'turned'
          ? 'turn'
          : outcomes[0] === 'transmitted'
            ? 'transmitter'
            : 'breaker'

    out.push({ obstacle: name, period: obstacle.period, moverStart: cell, outcomes, kind })
  }

  return out
}

// ---- the two-mover meeting as a two-trit gate ----

export type MeetingGate = {
  // the table at each read cell (9 entries, inputs (x, y) in inputsOf(2) order), only cells some input leaves off the
  // background
  cells: Map<number, Int8Array>
  // the ports: where x and y stand alone at the end
  portA: number
  portB: number
  tableA: Int8Array
  tableB: Int8Array
  // every input gave a different final state (the gate with its garbage is a bijection onto its image)
  injective: boolean
  // the final states keep the charge of their inputs
  chargeKept: boolean
  // the final state of every input
  finals: Tones[]
}

// Mover x starts at aStart; mover y is placed at round `meet` on the cell `bAtMeet` and pulled back. The lone tracks are
// tone-independent (ternary wires), checked by the caller. The joint run lasts meet + after rounds.
export function meetingGate(input: {
  run: SpaceRun & { inverse: GateRule }
  aStart: number
  bStart: number
  rounds: number
  portA: number
  portB: number
}): MeetingGate {
  const { run, aStart, bStart, rounds, portA, portB } = input
  const inputs = inputsOf(2)
  const finals = inputs.map(([x, y]) => {
    const s: Tones = new Map()

    if (x !== run.background) {
      s.set(aStart, x!)
    }

    if (y !== run.background) {
      s.set(bStart, y!)
    }

    return runRounds(run, s, rounds)[rounds]!
  })
  const cellSet = new Set<number>([portA, portB])

  for (const f of finals) {
    for (const c of f.keys()) {
      cellSet.add(c)
    }
  }

  const cells = new Map<number, Int8Array>()

  for (const c of [...cellSet].sort((a, b) => a - b)) {
    cells.set(
      c,
      Int8Array.from(finals.map(f => f.get(c) ?? run.background)),
    )
  }

  const keys = new Set(finals.map(f => [...f.entries()].sort((a, b) => a[0] - b[0]).join(';')))
  const chargeKept = finals.every((f, n) => {
    const q = [...f.values()].reduce((s, t) => s + t - run.background, 0)
    const [x, y] = inputs[n]!

    return q === x! - run.background + y! - run.background
  })

  return {
    cells,
    portA,
    portB,
    tableA: cells.get(portA)!,
    tableB: cells.get(portB)!,
    injective: keys.size === inputs.length,
    chargeKept,
    finals,
  }
}

// Whether a read cell rides a wire on a pair space: for every input whose value there is off the background, the tone
// follows its lone track from that cell for `hold` rounds in the joint run, and both off-background values share one
// moving track.
export function ridesWire(input: {
  run: SpaceRun
  finals: readonly Tones[]
  cell: number
  table: ArrayLike<number>
  hold: number
}): boolean {
  const { run, finals, cell, table, hold } = input
  const used = [...new Set(Array.from(table).filter(v => v !== run.background))]

  if (used.length === 0) {
    return false
  }

  const tracks = used.map(v => loneTrack(run, cell, v, hold))

  if (tracks.some(t => t === null)) {
    return false
  }

  const track = tracks[0]!

  if (tracks.some(t => t!.some((c, i) => c !== track[i])) || track.every(c => c === cell)) {
    return false
  }

  return finals.every((f, n) => {
    const v = table[n]!

    if (v === run.background) {
      return true
    }

    const states = runRounds(run, f, hold)

    return states.every((s, k) => s.get(track[k]!) === v)
  })
}

// ---- bounded layout search on any pair space ----

export type SpaceGate = {
  target: string
  inputs: number[]
  constants: [number, number][]
  readCell: number
  readRound: number
}

export type SpaceSearch = {
  gates: SpaceGate[]
  layouts: Record<string, number>
  runs: number
}

// Every layout with the target's inputs on the given input cells (the first input on `first`, the second on any of
// `second`) and at most `maxConstants` constants on `constantCells` with every off-background tone; every input run
// `readRounds + hold` rounds, every occupied cell at every round to `readRounds` read, a hit kept when it rides a wire.
export function searchSpaceGates(input: {
  run: SpaceRun
  targets: readonly Target[]
  first: number
  second: readonly number[]
  constantCells: readonly number[]
  maxConstants: Record<string, number>
  readRounds: number
  hold: number
}): SpaceSearch {
  const { run, targets, first, second, constantCells, maxConstants, readRounds, hold } = input
  const tones = TRITS.filter(t => t !== run.background)
  const gates: SpaceGate[] = []
  const layouts: Record<string, number> = {}

  let runs = 0

  const constantSets = (cells: readonly number[], k: number): [number, number][][] => {
    const out: [number, number][][] = [[]]

    const grow = (from: number, acc: [number, number][]): void => {
      if (acc.length === k) {
        return
      }

      for (let i = from; i < cells.length; i++) {
        for (const t of tones) {
          acc.push([cells[i]!, t])
          out.push([...acc])
          grow(i + 1, acc)
          acc.pop()
        }
      }
    }

    grow(0, [])

    return out
  }

  for (const target of targets) {
    const inputs = inputsOf(target.arity)
    const places: number[][] = target.arity === 1 ? [[first]] : second.filter(c => c !== first).map(c => [first, c])

    layouts[target.name] = 0

    for (const place of places) {
      const free = constantCells.filter(c => !place.includes(c))

      for (const constants of constantSets(free, maxConstants[target.name] ?? 0)) {
        layouts[target.name]!++

        const histories = inputs.map(x => {
          const s: Tones = new Map(constants)

          place.forEach((c, j) => {
            if (x[j] !== run.background) {
              s.set(c, x[j]!)
            }
          })
          runs++

          return runRounds(run, s, readRounds)
        })

        let hit: SpaceGate | null = null

        for (let t = 0; t <= readRounds && !hit; t++) {
          const cells = new Set<number>()

          for (const h of histories) {
            for (const c of h[t]!.keys()) {
              cells.add(c)
            }
          }

          for (const cell of [...cells].sort((a, b) => a - b)) {
            const table = histories.map(h => h[t]!.get(cell) ?? run.background)

            if (
              table.every((v, n) => v === target.table[n]) &&
              ridesWire({ run, finals: histories.map(h => h[t]!), cell, table, hold })
            ) {
              hit = { target: target.name, inputs: place, constants, readCell: cell, readRound: t }
              break
            }
          }
        }

        if (hit) {
          gates.push(hit)
        }
      }
    }
  }

  return { gates, layouts, runs }
}

// ---- the occupancy no-go ----
//
// A rule is OCCUPANCY-BLIND on background b when, for each of the four occupancy patterns of a pair (which of its two
// cells are off b), one fixed permutation of the two cells sends every pair of that pattern to its image. Then a round
// moves tones by a permutation of cells that depends only on which cells are occupied, and occupancy itself evolves
// without reading the tones; so at every round end every cell holds b or the start tone of one cell, chosen by the
// start occupancy alone. A layout then computes a target only if, on every class of inputs with one occupancy pattern
// (with the constants fixed, occupancy is that of the inputs), the target is one fixed value or one input. The check
// below is brute force over the nine pairs and over the target's table, so it holds on every graph, schedule and layout.

export function occupancyBlind(rule: GateRule, background: number): boolean {
  const sigma = new Map<string, string>()

  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      const p = (a + 1) * 3 + b + 1
      const x = rule.first[p]!
      const y = rule.second[p]!
      const pattern = `${a !== background ? 1 : 0}${b !== background ? 1 : 0}`
      const keep = x === a && y === b
      const swap = x === b && y === a
      const options = `${keep ? 'k' : ''}${swap ? 's' : ''}`

      if (options === '') {
        return false
      }

      const prior = sigma.get(pattern)
      const common = prior === undefined ? options : [...options].filter(o => prior.includes(o)).join('')

      if (common === '') {
        return false
      }

      sigma.set(pattern, common)
    }
  }

  return true
}

// The lemma, run live: from the occupied cells `cells`, every assignment of off-background tones gives after `rounds`
// rounds one occupied set, and each occupied cell holds the start tone of one fixed start cell in every assignment.
export function occupancyPermutes(run: SpaceRun, cells: readonly number[], rounds: number): boolean {
  const tones = TRITS.filter(t => t !== run.background)
  const finals: Tones[] = []
  const starts: Tones[] = []

  for (let code = 0; code < 2 ** cells.length; code++) {
    const s: Tones = new Map(cells.map((c, i) => [c, tones[(code >> i) & 1]!]))

    starts.push(s)
    finals.push(runRounds(run, s, rounds)[rounds]!)
  }

  const occupied = [...finals[0]!.keys()].sort((a, b) => a - b).join(',')

  if (finals.some(f => [...f.keys()].sort((a, b) => a - b).join(',') !== occupied)) {
    return false
  }

  return [...finals[0]!.keys()].every(c =>
    cells.some(source => finals.every((f, n) => f.get(c) === starts[n]!.get(source))),
  )
}

export type MeetingKind = 'exchange' | 'cross' | 'other'

// exchange: each port gets the other mover's tone whenever both are present (the movers trade tracks: a reflection
// head-on, a turn otherwise); cross: each port keeps its own mover's tone (a crossing); other: anything else.
export function meetingKind(gate: MeetingGate, background: number): MeetingKind {
  const inputs = inputsOf(2)

  const port = (table: Int8Array, own: number, other: number): 'own' | 'other' | 'mixed' => {
    let kind: 'own' | 'other' | null = null

    for (let n = 0; n < inputs.length; n++) {
      const x = inputs[n]!

      if (x[0] === background || x[1] === background) {
        continue
      }

      const k: 'own' | 'other' | 'mixed' | null =
        table[n] === x[own] && table[n] === x[other]
          ? kind
          : table[n] === x[own]
            ? 'own'
            : table[n] === x[other]
              ? 'other'
              : 'mixed'

      if (k === 'mixed') {
        return 'mixed'
      }

      if (k !== null) {
        if (kind !== null && kind !== k) {
          return 'mixed'
        }

        kind = k
      }
    }

    return kind ?? 'mixed'
  }

  const a = port(gate.tableA, 0, 1)
  const b = port(gate.tableB, 1, 0)

  return a === 'other' && b === 'other' ? 'exchange' : a === 'own' && b === 'own' ? 'cross' : 'other'
}

// Whether two tracks meet head-on at round `meet`: after it, A's lone track runs back along B's lone track before it,
// each cell equal or adjacent to B's cell with one fixed lag (so B's tone, put on A's track by an exchange, goes back
// the way it came: a reflection). Adjacent, not equal: on the line the two directions use cells of opposite parity.
export function headOn(
  space: PairSpace,
  trackA: readonly number[],
  trackB: readonly number[],
  meet: number,
  span: number,
): boolean {
  for (let lag = 0; lag <= 2; lag++) {
    let ok = true

    for (let k = 1; k <= span && ok; k++) {
      const back = meet - k + lag

      ok =
        back >= 0 &&
        meet + k < trackA.length &&
        (trackA[meet + k] === trackB[back] || space.neighbors(trackA[meet + k]!).includes(trackB[back]!))
    }

    if (ok) {
      return true
    }
  }

  return false
}

// Whether a target can be met by a tone permutation chosen by occupancy: on every occupancy class of its inputs the
// table must be one constant value, or equal to one input throughout the class.
export function occupancyCompatible(target: Target, background: number): boolean {
  return occupancyRouted(target.table, target.arity, background)
}

// The same test on any table: on every occupancy class of its inputs it is one value or one input.
export function occupancyRouted(table: ArrayLike<number>, arity: number, background: number): boolean {
  const target = { table, arity }
  const inputs = inputsOf(arity)
  const classes = new Map<string, number[]>()

  inputs.forEach((x, n) => {
    const key = x.map(v => (v === background ? 0 : 1)).join('')
    const list = classes.get(key) ?? []

    list.push(n)
    classes.set(key, list)
  })

  for (const members of classes.values()) {
    const values = members.map(n => target.table[n]!)
    const constant = values.every(v => v === values[0])
    const projection = Array.from({ length: target.arity }, (_, j) => j).some(j =>
      members.every(n => target.table[n] === inputs[n]![j]),
    )

    if (!constant && !projection) {
      return false
    }
  }

  return true
}
