// INTERFERENCE ROUTING AND GATES FOUND IN BARE U (Q3).
// Every element here is a process the bare beat performs on a declared initial state, read
// off exactly from code/rule/bare-beat with nothing inserted: no layer edited, no gate placed, no schedule beyond the
// beat. What a caller chooses is the initial state and, declared as added structure, the excitation layout (which line,
// which coordinates and directions, which species, a spectator vibe in a dock).
//
// Vocabulary. A line frame is the mesh line through dock 0 along a slot, with line coordinates k. A vibe on the slot
// moves to k + 1 each beat (forward), one on the opposite slot to k - 1. Two vibes are in contact when they sit in one
// dock on its two slots of the line; the seven per-dock layers then act on the full line, and the stream carries them
// apart. A canonical word reads the roles of the vibes on a line in order of k, the forward vibe first inside a dock
// (so the word keeps the left-to-right order at a contact).
//
//   lineFrame, lineVibe, lineKet, readLine   the line frame and states written on it
//   speciesDefects                           configurations whose (tone, role) multiset differs from the start's
//   wireRun                                  a lone vibe of each species along its line: off-line weight, species
//                                            independence, the cone-front weight and the best single-dock delivery
//   coinElement                              the line coin as a two-port beam splitter (ports: the two directions)
//   contactBlock                             the one-beat block of a head-on contact on a declared register of port
//                                            assignments, with leakage, optionally with a spectator vibe in the dock
//   routerElement                            an identical pair: the amplitude to stay on its line and to turn onto
//                                            each of the 11 other lines, with or without a spectator
//   parityPassDefects                        a pair on one line against the product of its lone runs, beat by beat
//   scheduledMeeting                         the weight of two vibes released at -d and +d meeting at beat d
//   averageGateFidelity                      (Tr M^dag M + |Tr G^dag M|^2) / (d (d + 1)), exact
//   liftPairToSector                         a two-role block lifted to positions (p, q) of a spin sector
//   contactWordGate, wordGate, historyFraction, cursorRun   the Feynman-cursor test
//
// DETERMINISM: no random numbers, no floating point, no host Math call.

import {
  type Ninth,
  type NinthMatrix,
  ONE,
  ZERO,
  add,
  conj,
  dagger,
  equals,
  identityMatrix,
  isZero,
  keyOf,
  matMul,
  mul,
  sameMatrix,
  scale,
  sub,
  trace,
} from '@/code/algebra/ninth-field'
import { compareReal } from '@/code/algebra/ninth-real-sign'
import type { SpinSector } from '@/code/compute/quantum/gate-set'
import { type Species, lineChain } from '@/code/compute/quantum/particles'
import {
  type BeatState,
  type Vibe,
  LINE_OF_SLOT,
  OPPOSITE_SLOT,
  amplitudeOf,
  applyBeat,
  basisKet,
  decodeConfig,
  encodeConfig,
} from '@/code/rule/bare-beat'

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

const weight = (a: Ninth): Ninth => mul(a, conj(a))

const sum = (xs: Iterable<Ninth>): Ninth => {
  let s = ZERO

  for (const x of xs) {
    s = add(s, x)
  }

  return s
}

// ---------------------------------------------------------------------------------------------------------------------
// The line frame
// ---------------------------------------------------------------------------------------------------------------------

export type LineFrame = {
  readonly slot: number
  readonly reach: number
  readonly coordinate: ReadonlyMap<number, number>
  readonly dockAt: ReadonlyMap<number, number>
}

export type LineVibe = readonly [k: number, forward: boolean, tone: 1 | -1, role: number]

export function lineFrame(slot: number, reach: number): LineFrame {
  const coordinate = lineChain(0, slot, reach)
  const dockAt = new Map([...coordinate].map(([dock, k]) => [k, dock] as const))

  return { slot, reach, coordinate, dockAt }
}

export function lineVibe(frame: LineFrame, [k, forward, tone, role]: LineVibe): Vibe {
  const dock = frame.dockAt.get(k)

  assertExact(dock !== undefined, `coordinate ${k} outside the frame (reach ${frame.reach})`)

  return [dock!, forward ? frame.slot : OPPOSITE_SLOT[frame.slot]!, tone, role]
}

export const lineKet = (frame: LineFrame, vibes: readonly LineVibe[]): BeatState =>
  basisKet(vibes.map(v => lineVibe(frame, v)))

const lineOrder = (a: LineVibe, b: LineVibe): number =>
  a[0] - b[0] || (a[1] === b[1] ? 0 : a[1] ? -1 : 1) || a[2] - b[2] || a[3] - b[3]

// The vibes of a configuration in canonical line order, or undefined when one of them is off the frame line.
export function readLine(frame: LineFrame, vibes: readonly Vibe[]): LineVibe[] | undefined {
  const out: LineVibe[] = []

  for (const [dock, slot, tone, role] of vibes) {
    const k = frame.coordinate.get(dock)

    if (k === undefined) {
      return undefined
    }

    if (slot === frame.slot) {
      out.push([k, true, tone, role])
    } else if (slot === OPPOSITE_SLOT[frame.slot]) {
      out.push([k, false, tone, role])
    } else {
      return undefined
    }
  }

  return out.sort(lineOrder)
}

const speciesKey = (vibes: readonly Vibe[]): string =>
  vibes
    .map(v => `${v[2]}:${v[3]}`)
    .sort()
    .join(',')

// Configurations of `state` whose multiset of species (tone, role) differs from `start`'s. Every layer keeps it: D, K
// and the stream move slots, M_meet swaps roles between two vibes of one tone, M_pair moves an identical pair.
export function speciesDefects(state: BeatState, start: readonly Vibe[]): number {
  const want = speciesKey(start)

  let defects = 0

  for (const key of state.amp.keys()) {
    if (speciesKey(decodeConfig(key)) !== want) {
      defects++
    }
  }

  return defects
}

// ---------------------------------------------------------------------------------------------------------------------
// E1 the wire: a lone vibe on its line
// ---------------------------------------------------------------------------------------------------------------------

export type WireReading = {
  readonly beat: number
  readonly offLine: number
  readonly speciesTableDefects: number
  readonly norm: Ninth
  // weight at |k| = beat (the one-hop cone front)
  readonly front: Ninth
  // the largest weight on one dock of the line, and its coordinate (the most negative on a tie)
  readonly best: Ninth
  readonly bestK: number
  readonly table: string
}

export function wireRun(frame: LineFrame, species: readonly Species[], beats: number): WireReading[] {
  assertExact(beats <= frame.reach, 'wire run longer than the frame reach')

  const states = species.map(([tone, role]) => lineKet(frame, [[0, true, tone, role]]))
  const out: WireReading[] = []

  for (let beat = 1; beat <= beats; beat++) {
    let offLine = 0

    const tables: string[] = []
    const siteWeights = new Map<number, Ninth>()

    states.forEach((state, i) => {
      const next = applyBeat(state)

      states[i] = next

      const entries: string[] = []

      for (const key of next.amp.keys()) {
        const line = readLine(frame, decodeConfig(key))

        if (line?.length !== 1) {
          offLine++
          continue
        }

        const [k, forward] = line[0]!
        const amp = amplitudeOf(next, key)

        entries.push(`${k}${forward ? '+' : '-'}=${keyOf(amp)}`)

        if (i === 0) {
          siteWeights.set(k, add(siteWeights.get(k) ?? ZERO, weight(amp)))
        }
      }

      tables.push(entries.sort().join(' '))
    })

    let best = ZERO
    let bestK = 0

    for (const k of [...siteWeights.keys()].sort((a, b) => a - b)) {
      if (compareReal(siteWeights.get(k)!, best) > 0) {
        best = siteWeights.get(k)!
        bestK = k
      }
    }

    out.push({
      beat,
      offLine,
      speciesTableDefects: tables.filter(t => t !== tables[0]).length,
      norm: sum(siteWeights.values()),
      front: add(siteWeights.get(beat) ?? ZERO, siteWeights.get(-beat) ?? ZERO),
      best,
      bestK,
      table: tables[0]!,
    })
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------------------
// E2 the beam splitter: the line coin on the two direction ports
// ---------------------------------------------------------------------------------------------------------------------

export type CoinElement = {
  // rows: out to (1, forward), out to (-1, backward); columns: in on (0, forward), (0, backward)
  readonly matrix: Ninth[][]
  readonly leakage: Ninth
  readonly unitary: boolean
  // smallest n in 1..12 with matrix^n = I, 0 if none
  readonly order: number
}

export function coinElement(frame: LineFrame): CoinElement {
  const inputs: LineVibe[] = [
    [0, true, 1, 0],
    [0, false, 1, 0],
  ]
  const outputs: LineVibe[] = [
    [1, true, 1, 0],
    [-1, false, 1, 0],
  ]
  const matrix = outputs.map(() => inputs.map(() => ZERO))

  let kept = ZERO

  inputs.forEach((input, c) => {
    const next = applyBeat(lineKet(frame, [input]))

    outputs.forEach((output, r) => {
      const amp = amplitudeOf(next, encodeConfig([lineVibe(frame, output)]))

      matrix[r]![c] = amp
      kept = add(kept, weight(amp))
    })
  })

  let power: NinthMatrix = matrix
  let order = 0

  for (let n = 1; n <= 12; n++) {
    if (sameMatrix(power, identityMatrix(2))) {
      order = n
      break
    }

    power = matMul(power, matrix)
  }

  return {
    matrix,
    leakage: sub(ONE, scale(kept, 1, 2)),
    unitary: sameMatrix(matMul(dagger(matrix), matrix), identityMatrix(2)),
    order,
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Spectators: a vibe in the contact dock on another line, factored out exactly
// ---------------------------------------------------------------------------------------------------------------------

// The amplitudes of `state` with the spectator's one-beat image factored out: B(rest) = sum_s conj(c_s) a(rest, s),
// where c_s are the spectator's lone amplitudes (sum |c_s|^2 = 1). factorDefects counts entries with a(rest, s) !=
// c_s B(rest), and configurations holding no spectator image.
function stripSpectator(state: BeatState, spectator: Vibe | undefined): { rest: Map<string, Ninth>; factorDefects: number } {
  const rest = new Map<string, Ninth>()

  if (spectator === undefined) {
    for (const key of state.amp.keys()) {
      rest.set(key, amplitudeOf(state, key))
    }

    return { rest, factorDefects: 0 }
  }

  const lone = applyBeat(basisKet([spectator]))
  const coin = new Map([...lone.amp.keys()].map(key => [key, amplitudeOf(lone, key)] as const))
  const grouped = new Map<string, Map<string, Ninth>>()

  let factorDefects = 0

  for (const key of state.amp.keys()) {
    const vibes = decodeConfig(key)
    const index = vibes.findIndex(v => coin.has(encodeConfig([v])))

    if (index < 0) {
      factorDefects++
      continue
    }

    const spectatorKey = encodeConfig([vibes[index]!])
    const restKey = encodeConfig(vibes.filter((_, i) => i !== index))
    const amp = amplitudeOf(state, key)

    if (!grouped.has(spectatorKey)) {
      grouped.set(spectatorKey, new Map())
    }

    grouped.get(spectatorKey)!.set(restKey, amp)
    rest.set(restKey, add(rest.get(restKey) ?? ZERO, mul(conj(coin.get(spectatorKey)!), amp)))
  }

  for (const [spectatorKey, c] of coin) {
    const group = grouped.get(spectatorKey) ?? new Map<string, Ninth>()

    for (const [restKey, b] of rest) {
      if (!equals(group.get(restKey) ?? ZERO, mul(c, b))) {
        factorDefects++
      }
    }
  }

  return { rest, factorDefects }
}

// ---------------------------------------------------------------------------------------------------------------------
// E3 to E5: head-on contacts as gates on a register of port assignments
// ---------------------------------------------------------------------------------------------------------------------

// A register entry: the species on the forward slot (came from the left) and on the backward slot of dock 0.
export type PortPair = readonly [forward: Species, backward: Species]

export type ContactBlock = {
  // block[j][i]: input register entry i to output entry j, where the output entry reads the species at (1, forward)
  // and at (-1, backward)
  readonly block: Ninth[][]
  // per input: weight outside the register (off the line, or a port assignment not in the register)
  readonly leakage: Ninth[]
  readonly averageLeakage: Ninth
  readonly leakConfigurations: number
  readonly factorDefects: number
  readonly speciesDefects: number
}

const portKey = ([[t1, r1], [t2, r2]]: PortPair): string => `${t1}:${r1}|${t2}:${r2}`

export function contactBlock(frame: LineFrame, register: readonly PortPair[], spectator?: Vibe): ContactBlock {
  const index = new Map(register.map((p, i) => [portKey(p), i] as const))
  const block = register.map(() => register.map(() => ZERO))
  const leakage: Ninth[] = []

  let leakConfigurations = 0
  let factorDefects = 0
  let speciesDefectCount = 0

  register.forEach(([[tf, rf], [tb, rb]], i) => {
    const start: Vibe[] = [lineVibe(frame, [0, true, tf, rf]), lineVibe(frame, [0, false, tb, rb])]

    if (spectator !== undefined) {
      assertExact(
        spectator[0] === start[0]![0] && LINE_OF_SLOT[spectator[1]] !== LINE_OF_SLOT[frame.slot],
        'a spectator sits in the contact dock on another line',
      )
      start.push(spectator)
    }

    const next = applyBeat(basisKet(start))

    speciesDefectCount += speciesDefects(next, start)

    const stripped = stripSpectator(next, spectator)

    factorDefects += stripped.factorDefects

    let leak = ZERO

    for (const [key, amp] of stripped.rest) {
      const line = readLine(frame, decodeConfig(key))
      const shape =
        line?.length === 2 &&
        line[0]![0] === -1 &&
        !line[0]![1] &&
        line[1]![0] === 1 &&
        line[1]![1]
      const j = shape ? index.get(portKey([[line[1]![2], line[1]![3]], [line[0]![2], line[0]![3]]])) : undefined

      if (j === undefined) {
        leak = add(leak, weight(amp))
        leakConfigurations++
      } else {
        block[j]![i] = add(block[j]![i]!, amp)
      }
    }

    leakage.push(leak)
  })

  return {
    block,
    leakage,
    averageLeakage: scale(sum(leakage), 1, register.length),
    leakConfigurations,
    factorDefects,
    speciesDefects: speciesDefectCount,
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// E6 the line router: an identical pair turning onto the other lines
// ---------------------------------------------------------------------------------------------------------------------

export type RouterElement = {
  readonly stay: Ninth
  // by target line (the pair's own line excluded), ascending line index
  readonly turns: Ninth[]
  readonly turnWeight: Ninth
  readonly isotropic: boolean
  readonly otherConfigurations: number
  readonly factorDefects: number
}

export function routerElement(frame: LineFrame, [tone, role]: Species, spectator?: Vibe): RouterElement {
  const start: Vibe[] = [lineVibe(frame, [0, true, tone, role]), lineVibe(frame, [0, false, tone, role])]

  if (spectator !== undefined) {
    start.push(spectator)
  }

  const stripped = stripSpectator(applyBeat(basisKet(start)), spectator)
  const ownLine = LINE_OF_SLOT[frame.slot]!
  const byLine = new Map<number, Ninth>()

  let otherConfigurations = 0

  for (const [key, amp] of stripped.rest) {
    const vibes = decodeConfig(key)
    const lines = new Set(vibes.map(v => LINE_OF_SLOT[v[1]]!))

    if (vibes.length !== 2 || lines.size !== 1) {
      otherConfigurations++
      continue
    }

    const line = [...lines][0]!

    byLine.set(line, add(byLine.get(line) ?? ZERO, amp))
  }

  const turns = [...byLine.keys()]
    .filter(l => l !== ownLine)
    .sort((a, b) => a - b)
    .map(l => byLine.get(l)!)

  return {
    stay: byLine.get(ownLine) ?? ZERO,
    turns,
    turnWeight: sum(turns.map(weight)),
    isotropic: turns.every(t => equals(t, turns[0]!)),
    otherConfigurations,
    factorDefects: stripped.factorDefects,
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// E7 the parity switch, and the scheduled meeting
// ---------------------------------------------------------------------------------------------------------------------

// A at (0, forward), B at (separation, backward); per beat, the configurations where the pair's amplitude differs from
// the product of the two lone runs (the union of both supports).
export function parityPassDefects(frame: LineFrame, separation: number, a: Species, b: Species, beats: number): number[] {
  const va: LineVibe = [0, true, a[0], a[1]]
  const vb: LineVibe = [separation, false, b[0], b[1]]

  let pair = lineKet(frame, [va, vb])
  let loneA = lineKet(frame, [va])
  let loneB = lineKet(frame, [vb])

  const out: number[] = []

  for (let beat = 1; beat <= beats; beat++) {
    pair = applyBeat(pair)
    loneA = applyBeat(loneA)
    loneB = applyBeat(loneB)

    const product = new Map<string, Ninth>()

    for (const ka of loneA.amp.keys()) {
      for (const kb of loneB.amp.keys()) {
        const vibes = [...decodeConfig(ka), ...decodeConfig(kb)]

        if (vibes[0]![0] === vibes[1]![0] && vibes[0]![1] === vibes[1]![1]) {
          continue
        }

        const key = encodeConfig(vibes)

        product.set(key, add(product.get(key) ?? ZERO, mul(amplitudeOf(loneA, ka), amplitudeOf(loneB, kb))))
      }
    }

    let defects = 0

    for (const key of new Set([...pair.amp.keys(), ...product.keys()])) {
      if (!equals(amplitudeOf(pair, key), product.get(key) ?? ZERO)) {
        defects++
      }
    }

    out.push(defects)
  }

  return out
}

// Two vibes released at (-d, forward) and (d, backward): the weight of the configurations, after d beats, where they
// sit in one dock of the line (so the contact acts at beat d + 1).
export function scheduledMeeting(frame: LineFrame, d: number, a: Species, b: Species): Ninth {
  const state = Array.from({ length: d }).reduce<BeatState>(
    s => applyBeat(s),
    lineKet(frame, [
      [-d, true, a[0], a[1]],
      [d, false, b[0], b[1]],
    ]),
  )

  let meet = ZERO

  for (const key of state.amp.keys()) {
    const line = readLine(frame, decodeConfig(key))

    if (line?.length === 2 && line[0]![0] === line[1]![0]) {
      meet = add(meet, weight(amplitudeOf(state, key)))
    }
  }

  return meet
}

// ---------------------------------------------------------------------------------------------------------------------
// Gate measures
// ---------------------------------------------------------------------------------------------------------------------

// The average gate fidelity of a (possibly leaky) block M against a unitary target G on d levels.
export function averageGateFidelity(m: NinthMatrix, g: NinthMatrix): Ninth {
  const d = m.length
  const overlap = trace(matMul(dagger(g), m))

  return scale(add(trace(matMul(dagger(m), m)), weight(overlap)), 1, d * (d + 1))
}

// A block on two two-level roles (index r_p * 2 + r_q) lifted to positions (p, q) of a spin sector (a word lists the
// positions in role 1). The block must keep the number of role-1 positions.
export function liftPairToSector(block: NinthMatrix, sector: SpinSector, p: number, q: number): Ninth[][] {
  const size = sector.words.length
  const out = Array.from({ length: size }, () => Array.from({ length: size }, () => ZERO))

  sector.words.forEach((word, c) => {
    const bp = word.includes(p) ? 1 : 0
    const bq = word.includes(q) ? 1 : 0
    const input = bp * 2 + bq
    const others = word.filter(x => x !== p && x !== q)

    for (let o = 0; o < 4; o++) {
      const amp = block[o]![input]!

      if (isZero(amp)) {
        continue
      }

      const op = o >> 1
      const oq = o & 1
      const moved = [...others, ...(op ? [p] : []), ...(oq ? [q] : [])].sort((x, y) => x - y)
      const r = sector.index.get(moved.join(','))

      assertExact(r !== undefined, 'the lifted block changes the number of role-1 positions')
      out[r!]![c] = amp
    }
  })

  return out
}

// ---------------------------------------------------------------------------------------------------------------------
// The Feynman-cursor test
// ---------------------------------------------------------------------------------------------------------------------

// A sparse vector over canonical role words (roles joined by ',').
export type WordVector = Map<string, Ninth>

export type WordGate = { readonly keep: Ninth; readonly swap: Ninth }

// The contact of two like-tone vibes of distinct roles x and y read on canonical words: input word (x, y) (x came from
// the left), output word read in line order after the beat. leak counts weight outside the two words.
export function contactWordGate(frame: LineFrame, tone: 1 | -1, x: number, y: number): WordGate & { leak: Ninth } {
  assertExact(x !== y, 'the word gate is read on distinct roles')

  const next = applyBeat(
    lineKet(frame, [
      [0, true, tone, x],
      [0, false, tone, y],
    ]),
  )

  let keep = ZERO
  let swap = ZERO
  let leak = ZERO

  for (const key of next.amp.keys()) {
    const line = readLine(frame, decodeConfig(key))
    const amp = amplitudeOf(next, key)
    const word = line?.map(v => v[3]).join(',')

    if (line?.length !== 2 || line[0]![0] !== -1 || line[1]![0] !== 1) {
      leak = add(leak, weight(amp))
    } else if (word === `${x},${y}`) {
      keep = add(keep, amp)
    } else if (word === `${y},${x}`) {
      swap = add(swap, amp)
    } else {
      leak = add(leak, weight(amp))
    }
  }

  return { keep, swap, leak }
}

// The word gate on letters (position, position + 1) of every word of a vector.
export function wordGate(gate: WordGate, position: number, vector: WordVector): WordVector {
  const out: WordVector = new Map()

  const put = (word: string, amp: Ninth): void => {
    const next = add(out.get(word) ?? ZERO, amp)

    if (isZero(next)) {
      out.delete(word)
    } else {
      out.set(word, next)
    }
  }

  for (const [word, amp] of vector) {
    const letters = word.split(',')

    assertExact(position + 1 < letters.length, 'word gate past the end of the word')
    assertExact(letters[position] !== letters[position + 1], 'word gate on equal letters')
    put(word, mul(gate.keep, amp))

    const swapped = [...letters]

    swapped[position] = letters[position + 1]!
    swapped[position + 1] = letters[position]!
    put(swapped.join(','), mul(gate.swap, amp))
  }

  return out
}

const innerWords = (a: WordVector, b: WordVector): Ninth => {
  let s = ZERO

  for (const [word, x] of a) {
    const y = b.get(word)

    if (y !== undefined) {
      s = add(s, mul(conj(x), y))
    }
  }

  return s
}

export type HistoryReading = {
  readonly configurations: number
  // weight (averaged over the register inputs) of the configurations whose conditional register vectors are, jointly
  // over the inputs, proportional to one prefix product P_k applied to the inputs
  readonly history: Ninth
  readonly prefixWeights: Ninth[]
  readonly total: Ninth
}

// conditional.get(X)[r]: the register vector of input r on spatial configuration X; ideal[k][r] = P_k applied to input
// r. Proportionality of the stacked vectors V and U is the Cauchy-Schwarz equality |<U,V>|^2 = <U,U> <V,V>, exact.
export function historyFraction(
  conditional: ReadonlyMap<string, readonly WordVector[]>,
  ideal: readonly (readonly WordVector[])[],
): HistoryReading {
  const inputs = ideal[0]!.length
  const prefixWeights = ideal.map(() => ZERO)

  let history = ZERO
  let total = ZERO

  for (const vectors of conditional.values()) {
    const vv = sum(vectors.map(v => innerWords(v, v)))

    total = add(total, vv)

    const k = ideal.findIndex(us => {
      const uu = sum(us.map(u => innerWords(u, u)))
      const uv = sum(us.map((u, r) => innerWords(u, vectors[r] ?? new Map<string, Ninth>())))

      return equals(weight(uv), mul(uu, vv))
    })

    if (k >= 0) {
      history = add(history, vv)
      prefixWeights[k] = add(prefixWeights[k]!, vv)
    }
  }

  return {
    configurations: conditional.size,
    history: scale(history, 1, inputs),
    prefixWeights: prefixWeights.map(w => scale(w, 1, inputs)),
    total: scale(total, 1, inputs),
  }
}

export type CursorLayout = {
  // the cursor at (k, forward, tone); its role is the register, one run per role
  readonly cursor: readonly [k: number, forward: boolean, tone: 1 | -1]
  readonly registerRoles: readonly number[]
  readonly program: readonly LineVibe[]
}

export type CursorBeat = HistoryReading & { readonly beat: number; readonly offLine: number; readonly speciesDefects: number }

// Run the cursor and the program on one line; at every beat, the register (canonical role word) conditioned on the
// spatial configuration (coordinates, directions, tones), against the ideal prefix products.
export function cursorRun(
  frame: LineFrame,
  layout: CursorLayout,
  ideal: readonly (readonly WordVector[])[],
  beats: number,
): CursorBeat[] {
  const starts = layout.registerRoles.map(role => [
    lineVibe(frame, [layout.cursor[0], layout.cursor[1], layout.cursor[2], role]),
    ...layout.program.map(v => lineVibe(frame, v)),
  ])
  const states = starts.map(start => basisKet(start))
  const out: CursorBeat[] = []

  for (let beat = 1; beat <= beats; beat++) {
    const conditional = new Map<string, WordVector[]>()

    let offLine = 0
    let defects = 0

    states.forEach((state, r) => {
      const next = applyBeat(state)

      states[r] = next
      defects += speciesDefects(next, starts[r]!)

      for (const key of next.amp.keys()) {
        const line = readLine(frame, decodeConfig(key))

        if (line === undefined) {
          offLine++
          continue
        }

        const spatial = line.map(([k, forward, tone]) => `${k}${forward ? '+' : '-'}${tone}`).join(' ')
        const word = line.map(v => v[3]).join(',')

        if (!conditional.has(spatial)) {
          conditional.set(
            spatial,
            states.map(() => new Map<string, Ninth>()),
          )
        }

        conditional.get(spatial)![r]!.set(word, amplitudeOf(next, key))
      }
    })

    out.push({ beat, offLine, speciesDefects: defects, ...historyFraction(conditional, ideal) })
  }

  return out
}
