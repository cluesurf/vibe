// M4 memory (item vibe-computation-models-0014). Algebra: spin-one. A trit is written into the mesh by setting one cell's
// tone, it is left to the fixed pair rule for T rounds, and a decoder outside the mesh reads it back.
//
// WRITE. On a uniform background b the rule fixes, the trit v is written at a slot cell by giving that cell the tone v;
// v = b leaves the cell on the background (the empty slot). This is the M3 lone excitation (code/measure/
// particle-census.ts) used as the carrier. A slot is usable for IN-PLACE memory when both off-background lone writes at
// it are in-place species: localized (at most SPECIES_MAX_CELLS cells, one cluster) and exactly periodic with a period
// of at most CODE_MAX_PERIOD rounds within CODE_ROUNDS. A write that moves away is not in-place; on a closed box it
// may come back (a DELAY LINE: the whole state returns exactly after its period, which is finite on any finite box).
//
// DECODER (added structure, declared outside the mesh). For each slot the decoder holds a table: the lone run of every
// value at that slot for one period, and the slot's read region, the union of every cell those runs occupy at a round
// end. At round t it reads the state on the region and returns the value whose lone run at phase t mod P matches it
// exactly, or null (erased). So the decoder needs the slot positions, the lone-run table and a clock (the phase): the
// phase-aware read has latency 0. The phase-blind decoder (no clock) compares the region with the written pattern only,
// and has to wait up to P - 1 rounds for the pattern to come round again: that wait is the read latency.
//
// RECOVERY. A forward read uses the rule only. An inverse read runs the inverse rule (the inverse pair table, colors
// in reverse order) back to round 0 and reads the written pattern there; every result says which one it used.
//
// BOXES. An open window is the infinite tiling (lazy-space.ts) or the line; a walled box is the same tiling and the same
// schedule cut at a radius, every pair that crosses the wall left out (a reflecting wall), which is a finite closed
// reversible box under exactly the open window's local schedule; a closed quotient is a finite surface with its own
// schedule. On every finite box the round is a bijection of a finite set, so no state is an attractor
// (thm_ms_reversible_no_global_contraction): a damaged register can read right again only when the damage has gone
// somewhere the decoder does not look, and on a finite box the damage keeps coming back.

import {
  CensusRule,
  PairSpace,
  SPECIES_MAX_CELLS,
  Tones,
  clusters,
  sameTones,
  sparseRound,
} from '@/code/measure/particle-census'

// ---- parameters, fixed before the first run ----

export const CODE_ROUNDS = 100
export const CODE_MAX_PERIOD = 24
export const REGISTER_SLOTS = 4
export const MAX_SPACING = 3
export const CANDIDATE_RADIUS = 6
export const READ_ROUNDS = 48
export const DAMAGE_ROUND = 8
export const DAMAGE_RADIUS = 1
export const HEAL_ROUNDS = 96
export const HEAL_WINDOW = 32
export const RETURN_CAP = 512
export const SUPPORT_CAP = 4000
export const INVERSE_ROUNDS = 32

export type MemoryRule = {
  readonly forward: CensusRule
  readonly inverse: CensusRule
  // the rule keeps D = sum s^2
  readonly keepsExcitation: boolean
}

export type Run = {
  readonly space: PairSpace
  readonly colors: readonly number[]
  readonly rule: MemoryRule
  readonly background: number
}

const reversed = (colors: readonly number[]): number[] => [...colors].reverse()

export function forwardRound(run: Run, state: Tones): void {
  sparseRound({ space: run.space, colors: run.colors, rule: run.rule.forward, background: run.background, state })
}

export function inverseRound(run: Run, state: Tones): void {
  sparseRound({ space: run.space, colors: reversed(run.colors), rule: run.rule.inverse, background: run.background, state })
}

export function charge(state: Tones, background: number): number {
  let q = 0

  for (const t of state.values()) {
    q += t - background
  }

  return q
}

export function excitation(state: Tones, background: number): number {
  let d = 0

  for (const t of state.values()) {
    d += t * t - background * background
  }

  return d
}

// ---- boxes ----

// The same tiling and schedule cut at `radius` from the origin: a pair with a cell beyond the wall is left out.
export function walledSpace(space: PairSpace, radius: number): PairSpace {
  return {
    colorCount: space.colorCount,
    partner: (color, cell) => {
      if (space.distance(cell) > radius) {
        return -1
      }

      const v = space.partner(color, cell)

      return v >= 0 && space.distance(v) <= radius ? v : -1
    },
    isFirst: (color, cell) => space.isFirst(color, cell),
    distance: cell => space.distance(cell),
    neighbors: cell => space.neighbors(cell).filter(w => space.distance(w) <= radius),
  }
}

// The cells within `depth` facets of `cell`, breadth first.
export function ballAround(space: PairSpace, cell: number, depth: number): number[] {
  const seen = new Map<number, number>([[cell, 0]])
  const queue = [cell]

  for (const u of queue) {
    if (seen.get(u)! >= depth) {
      continue
    }

    for (const w of space.neighbors(u)) {
      if (!seen.has(w)) {
        seen.set(w, seen.get(u)! + 1)
        queue.push(w)
      }
    }
  }

  return queue
}

// ---- lone writes and slot codes ----

export type LoneWrite = {
  readonly tone: number
  // localized at every round end of CODE_ROUNDS
  readonly localized: boolean
  // the exact period (0 when none within CODE_ROUNDS or not localized)
  readonly period: number
  readonly inPlace: boolean
  // the states at rounds 0 .. period - 1 (in-place writes only)
  readonly orbit: readonly Tones[]
}

export function loneWrite(run: Run, anchor: number, tone: number): LoneWrite {
  const start: Tones = new Map([[anchor, tone]])
  const state = new Map(start)
  const orbit: Tones[] = [new Map(start)]

  let period = 0
  let localized = true

  for (let t = 1; t <= CODE_ROUNDS; t++) {
    forwardRound(run, state)

    if (state.size > SPECIES_MAX_CELLS || state.size === 0 || clusters(run.space, state).length !== 1) {
      localized = false
      break
    }

    if (sameTones(state, start)) {
      period = t
      break
    }

    if (t < CODE_MAX_PERIOD) {
      orbit.push(new Map(state))
    }
  }

  const inPlace = localized && period > 0 && period <= CODE_MAX_PERIOD

  return { tone, localized, period: localized ? period : 0, inPlace, orbit: inPlace ? orbit.slice(0, period) : [] }
}

export type SlotCode = {
  readonly anchor: number
  // the cells the decoder reads
  readonly region: readonly number[]
  // per value -1, 0, +1 (index v + 1): its period and lone states at each phase; the background value is the empty
  // slot, period 1 and the empty state
  readonly periods: readonly number[]
  readonly orbits: readonly (readonly Tones[])[]
}

// The decoder's table for one slot, or null when a lone write at the anchor is not in place.
export function slotCode(run: Run, anchor: number): SlotCode | null {
  const periods: number[] = []
  const orbits: Tones[][] = []
  const region = new Set<number>([anchor])

  for (const v of [-1, 0, 1]) {
    if (v === run.background) {
      periods.push(1)
      orbits.push([new Map<number, number>()])
      continue
    }

    const w = loneWrite(run, anchor, v)

    if (!w.inPlace) {
      return null
    }

    periods.push(w.period)
    orbits.push([...w.orbit])

    for (const s of w.orbit) {
      for (const c of s.keys()) {
        region.add(c)
      }
    }
  }

  return { anchor, region: [...region].sort((x, y) => x - y), periods, orbits }
}

// The kind of the lone writes at one cell: both in place, or what the first failing tone does.
export type WriteKind = 'in_place' | 'moves' | 'spreads'

export function writeKind(run: Run, anchor: number): { kind: WriteKind; periods: number[] } {
  const periods: number[] = []

  let kind: WriteKind = 'in_place'

  for (const v of [-1, 0, 1]) {
    if (v === run.background) {
      continue
    }

    const w = loneWrite(run, anchor, v)

    periods.push(w.period)

    if (!w.inPlace && kind === 'in_place') {
      kind = w.localized ? 'moves' : 'spreads'
    }
  }

  return { kind, periods }
}

// ---- the register and its decoder ----

export type Decoder = {
  readonly background: number
  readonly slots: readonly SlotCode[]
  // cell -> the slots whose region holds it
  readonly cellSlots: ReadonlyMap<number, readonly number[]>
}

export function makeDecoder(background: number, slots: readonly SlotCode[]): Decoder {
  const cellSlots = new Map<number, number[]>()

  slots.forEach((s, k) => {
    for (const c of s.region) {
      const list = cellSlots.get(c) ?? []

      list.push(k)
      cellSlots.set(c, list)
    }
  })

  return { background, slots, cellSlots }
}

// The anchors of a register: cells in breadth-first order from the origin within CANDIDATE_RADIUS, each at least
// `spacing` facets from every earlier anchor and with an in-place code, the first `count` of them (fewer when the
// candidates run out). `limit` caps the candidates read (closed boxes: every cell).
export function pickSlots(input: {
  run: Run
  spacing: number
  count: number
  candidates: readonly number[]
}): SlotCode[] {
  const { run, spacing, count, candidates } = input
  const chosen: SlotCode[] = []
  const blocked = new Set<number>()

  for (const c of candidates) {
    if (chosen.length >= count) {
      break
    }

    if (blocked.has(c)) {
      continue
    }

    const code = slotCode(run, c)

    if (!code) {
      continue
    }

    chosen.push(code)

    for (const w of ballAround(run.space, c, spacing - 1)) {
      blocked.add(w)
    }
  }

  return chosen
}

export function writeWord(decoder: Decoder, word: readonly number[]): Tones {
  const state: Tones = new Map()

  decoder.slots.forEach((s, k) => {
    const v = word[k]!

    if (v !== decoder.background) {
      state.set(s.anchor, v)
    }
  })

  return state
}

const restrictedEquals = (state: Tones, region: readonly number[], expected: Tones, background: number): boolean => {
  for (const c of region) {
    if ((state.get(c) ?? background) !== (expected.get(c) ?? background)) {
      return false
    }
  }

  return true
}

// The value one slot reads at round t (phase-aware), or null when no value's lone run matches.
export function readSlot(decoder: Decoder, k: number, state: Tones, round: number): number | null {
  const s = decoder.slots[k]!
  const found: number[] = []

  for (const v of [-1, 0, 1]) {
    const orbit = s.orbits[v + 1]!
    const expected = orbit[round % s.periods[v + 1]!]!

    if (restrictedEquals(state, s.region, expected, decoder.background)) {
      found.push(v)
    }
  }

  return found.length === 1 ? found[0]! : null
}

// Whether every slot reads `word` at round t. Only slots touched by the state or expected non-empty are read in full:
// an empty slot whose region holds no off-background cell reads empty.
export function readsWord(decoder: Decoder, word: readonly number[], state: Tones, round: number): boolean {
  const toRead = new Set<number>()

  word.forEach((v, k) => {
    if (v !== decoder.background) {
      toRead.add(k)
    }
  })

  for (const c of state.keys()) {
    for (const k of decoder.cellSlots.get(c) ?? []) {
      toRead.add(k)
    }
  }

  for (const k of toRead) {
    if (readSlot(decoder, k, state, round) !== word[k]) {
      return false
    }
  }

  return true
}

// ---- capacity ----

export type RegisterReading = {
  // every word read right at every round 0..rounds
  readonly correct: boolean
  // the first round some slot read wrong (-1 when none)
  readonly firstWrong: number
  // the exact return round of the whole state within the rounds (0 when none): with `correct`, the word is kept forever
  readonly returned: number
  readonly chargeKept: boolean
  readonly excitationKept: boolean
}

export function readRegister(run: Run, decoder: Decoder, word: readonly number[], rounds: number): RegisterReading {
  const start = writeWord(decoder, word)
  const state = new Map(start)
  const q0 = charge(start, run.background)
  const d0 = excitation(start, run.background)

  let firstWrong = readsWord(decoder, word, state, 0) ? -1 : 0
  let returned = 0
  let chargeKept = true
  let excitationKept = true

  for (let t = 1; t <= rounds; t++) {
    forwardRound(run, state)
    chargeKept &&= charge(state, run.background) === q0
    excitationKept &&= excitation(state, run.background) === d0

    if (firstWrong < 0 && !readsWord(decoder, word, state, t)) {
      firstWrong = t
    }

    if (returned === 0 && sameTones(state, start)) {
      returned = t
    }
  }

  return { correct: firstWrong < 0, firstWrong, returned, chargeKept, excitationKept }
}

// every word over {-1, 0, 1} of length n, in lexicographic order
export function allWords(n: number): number[][] {
  const out: number[][] = [[]]

  for (let i = 0; i < n; i++) {
    const next: number[][] = []

    for (const w of out) {
      for (const v of [-1, 0, 1]) {
        next.push([...w, v])
      }
    }

    out.splice(0, out.length, ...next)
  }

  return out
}

// the declared word set of a large register: the three constant words, the three cyclic words, and every word with one
// non-empty slot among the first `singletons` slots
export function structuredWords(n: number, background: number, singletons: number): number[][] {
  const out: number[][] = []

  for (const v of [-1, 0, 1]) {
    out.push(Array.from({ length: n }, () => v))
  }

  for (let j = 0; j < 3; j++) {
    out.push(Array.from({ length: n }, (_, k) => ((k + j) % 3) - 1))
  }

  for (let k = 0; k < Math.min(n, singletons); k++) {
    for (const v of [-1, 0, 1]) {
      if (v !== background) {
        out.push(Array.from({ length: n }, (_, i) => (i === k ? v : background)))
      }
    }
  }

  return out
}

export type WordsReading = {
  readonly words: number
  readonly wrong: number
  // words read right whose whole state returned exactly within the rounds (kept forever)
  readonly forever: number
  readonly chargeFailures: number
  readonly excitationFailures: number
}

export function readWords(run: Run, decoder: Decoder, words: readonly (readonly number[])[], rounds: number): WordsReading {
  let wrong = 0
  let forever = 0
  let chargeFailures = 0
  let excitationFailures = 0

  for (const w of words) {
    const r = readRegister(run, decoder, w, rounds)

    wrong += r.correct ? 0 : 1
    forever += r.correct && r.returned > 0 ? 1 : 0
    chargeFailures += r.chargeKept ? 0 : 1
    excitationFailures += !run.rule.keepsExcitation || r.excitationKept ? 0 : 1
  }

  return { words: words.length, wrong, forever, chargeFailures, excitationFailures }
}

// ---- damage ----

export type DamageOutcome = 'immune' | 'healed' | 'corrupted' | 'budget'

export type DamageReading = {
  readonly cell: number
  readonly tone: number
  // facet distance from the nearest anchor (0: the damage hits a slot cell)
  readonly reach: number
  readonly outcome: DamageOutcome
  // the last round some slot read wrong (-1 when none)
  readonly lastWrong: number
  // the inverse rule run back from the end to round 0 reads the written word there
  readonly inverseReads: boolean
}

// The written word is run DAMAGE_ROUND rounds, one cell is set to another tone, and the run goes on to HEAL_ROUNDS.
// immune: every round after the damage reads right; healed: some round reads wrong and the last HEAL_WINDOW rounds all
// read right; corrupted: some round of the last window reads wrong; budget: the support passed SUPPORT_CAP.
export function damageRun(input: {
  run: Run
  decoder: Decoder
  word: readonly number[]
  cell: number
  tone: number
  reach: number
}): DamageReading {
  const { run, decoder, word, cell, tone, reach } = input
  const state = writeWord(decoder, word)

  for (let t = 1; t <= DAMAGE_ROUND; t++) {
    forwardRound(run, state)
  }

  if (tone === run.background) {
    state.delete(cell)
  } else {
    state.set(cell, tone)
  }

  let lastWrong = readsWord(decoder, word, state, DAMAGE_ROUND) ? -1 : DAMAGE_ROUND
  let budget = false

  for (let t = DAMAGE_ROUND + 1; t <= HEAL_ROUNDS; t++) {
    forwardRound(run, state)

    if (state.size > SUPPORT_CAP) {
      budget = true
      break
    }

    if (!readsWord(decoder, word, state, t)) {
      lastWrong = t
    }
  }

  if (budget) {
    return { cell, tone, reach, outcome: 'budget', lastWrong, inverseReads: false }
  }

  const outcome: DamageOutcome =
    lastWrong < 0 ? 'immune' : lastWrong <= HEAL_ROUNDS - HEAL_WINDOW ? 'healed' : 'corrupted'

  for (let t = 0; t < HEAL_ROUNDS; t++) {
    inverseRound(run, state)
  }

  return { cell, tone, reach, outcome, lastWrong, inverseReads: readsWord(decoder, word, state, 0) }
}

// Every damage of the declared set: each cell within DAMAGE_RADIUS of an anchor, each tone other than the one it holds
// at the damage round.
export function damageSet(run: Run, decoder: Decoder, word: readonly number[]): DamageReading[] {
  const reach = new Map<number, number>()

  for (const s of decoder.slots) {
    for (const c of ballAround(run.space, s.anchor, DAMAGE_RADIUS)) {
      const d = c === s.anchor ? 0 : 1

      reach.set(c, Math.min(reach.get(c) ?? d, d))
    }
  }

  const at = writeWord(decoder, word)

  for (let t = 1; t <= DAMAGE_ROUND; t++) {
    forwardRound(run, at)
  }

  const out: DamageReading[] = []

  for (const [cell, r] of [...reach].sort((x, y) => x[0] - y[0])) {
    const now = at.get(cell) ?? run.background

    for (const tone of [-1, 0, 1]) {
      if (tone !== now) {
        out.push(damageRun({ run, decoder, word, cell, tone, reach: r }))
      }
    }
  }

  return out
}

// ---- delay lines and the inverse rule ----

// The exact return round of a start within `cap` rounds (0 when none, -1 when the support passed SUPPORT_CAP).
export function returnTime(run: Run, start: Tones, cap: number): number {
  const state = new Map(start)

  for (let t = 1; t <= cap; t++) {
    forwardRound(run, state)

    if (state.size > SUPPORT_CAP) {
      return -1
    }

    if (sameTones(state, start)) {
      return t
    }
  }

  return 0
}

// Forward `rounds` rounds and back with the inverse rule: whether the start comes back exactly.
export function inverseRecovers(run: Run, start: Tones, rounds: number): boolean {
  const state = new Map(start)

  for (let t = 0; t < rounds; t++) {
    forwardRound(run, state)
  }

  for (let t = 0; t < rounds; t++) {
    inverseRound(run, state)
  }

  return sameTones(state, start)
}

// The farthest the support of a start gets from the origin within `rounds` rounds, and its distance at the end.
export function excursion(run: Run, start: Tones, rounds: number): { farthest: number; last: number } {
  const state = new Map(start)
  const far = (): number => Math.max(0, ...[...state.keys()].map(c => run.space.distance(c)))

  let farthest = far()

  for (let t = 1; t <= rounds; t++) {
    forwardRound(run, state)

    if (state.size > SUPPORT_CAP) {
      break
    }

    farthest = Math.max(farthest, far())
  }

  return { farthest, last: far() }
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

export function lcm(values: readonly number[]): number {
  return values.reduce((a, b) => (a * b) / gcd(a, b), 1)
}
