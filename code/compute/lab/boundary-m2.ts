// M9 slice 2: self-maintaining boundaries read over ANY forward dynamics that is a
// bijection of finite-support states built from independent pieces (the matchings of a pair rule, the independent
// vertex sets of the Q2R rule). Algebra: spin-one tones, read by each rule in its own algebra (integers for the M1 pair
// rules and Q2R, residues mod 3 for the Z3-linear rules).
//
// Slice 1 (code/compute/lab/boundary.ts, imported unchanged) fixed the predicate, the horizon, the region and the export
// count for the M1 pair rules at phase 0 and one changed cell. This module carries the same criteria
// (slice 2) to:
//   - any dynamics: a `Dynamics` gives a background, a space and `pieces` ordered pieces of one round;
//   - starts of up to three cells, with orbits found twice skipped;
//   - a perturbation at every phase of the period, and two-cell hits on the cells a structure holds;
//   - each hit classed held / orbit / transit by its cell, so self-maintenance (a repaired held hit) is never confused
//     with debris that flies off a transit cell (slice 1's trap);
//   - every kept quantity of the rule as a `Ledger`, whose exterior share must equal the perturbation's change.
//
// Only the forward round exists here, by design: a repair must come from the forward dynamics and the open sink.

import {
  HORIZON,
  MAX_PERIOD,
  RETURN_CAP,
  SEED_RADIUS,
  STRUCTURE_ROUNDS,
  SUPPORT_CAP,
  Structure,
  WINDOW,
  exteriorKey,
  regionMatches,
} from '@/code/compute/lab/boundary'
import { CensusRule, PairSpace, Tones, clusters, sameTones, sparseRound } from '@/code/measure/particle-census'
import { BlumeCapel, q2rMove } from '@/code/rule/spin-one-q2r'
import { CanonicalVertexColoring } from '@/code/substrate/coxeter/canonical-vertex-coloring'
import { fromZ3, toZ3 } from '@/code/tone/algebra'

export const START_CELLS_MAX_SMALL = 4
export const START_CELLS_MAX_LARGE = 8
export const MAX_STRUCTURES_PER_SIZE = 8
export const WALL_RADIUS = 6
// a lazy space that has created more cells than this is replaced by a fresh one between runs (results compare by address)
export const CELL_BUDGET = 4_000_000
// the largest support allowed after any piece of a round (roundWithin)
export const PIECE_CAP = 100_000

// ---- spaces and dynamics ----

export type BoxSpace = PairSpace & {
  readonly degree: number
  // cells created so far, for lazy spaces
  cells?(): number
  compare(a: number, b: number): number
  address(cell: number): string
  fromAddress(address: string): number
}

// A quantity the rule keeps. `of` is a function of the whole finite-support state relative to the background.
export type Ledger = {
  readonly name: string
  // 0: an integer; 3: a residue mod 3
  readonly modulus: number
  // >= 0 on every exterior and 0 only on the empty one, so the D theorem applies
  readonly positive: boolean
  of(state: Tones): number
}

export type Dynamics = {
  readonly background: number
  readonly space: BoxSpace
  readonly pieces: number
  // apply piece k of a round in place
  piece(state: Tones, k: number): void
  // after piece k: a lower bound on the support at the end of this round, exact arithmetic (see each dynamics)
  settled(state: Tones, k: number): number
  readonly ledgers: readonly Ledger[]
}

export function round(dyn: Dynamics, state: Tones): void {
  for (let k = 0; k < dyn.pieces; k++) {
    dyn.piece(state, k)
  }
}

// One round that stops (false, the state left mid-round and never read) as soon as the round end is sure to hold more
// than `cap` cells (`settled` passes it), or the support passes PIECE_CAP after a piece. On the 4D boxes a spreading
// rule doubles its support at each of 24 pieces and would fill 2^24 cells inside one round. The `settled` stop changes
// no reading: the round end would pass `cap` anyway. The PIECE_CAP stop is a memory guard, the same budget outcome.
export function roundWithin(dyn: Dynamics, state: Tones, cap: number): boolean {
  for (let k = 0; k < dyn.pieces; k++) {
    dyn.piece(state, k)

    if (state.size > PIECE_CAP || dyn.settled(state, k) > cap) {
      return false
    }
  }

  return true
}

// A pair rule on matchings: piece k is the matching colors[k] (slice 1's sparseRound, one color at a time).
export function pairDynamics(input: {
  space: BoxSpace
  colors: readonly number[]
  rule: CensusRule
  background: number
  ledgers: readonly Ledger[]
}): Dynamics {
  const { space, colors, rule, background } = input

  return {
    background,
    space,
    pieces: colors.length,
    piece: (state, k) => sparseRound({ space, colors: [colors[k]!], rule, background, state }),
    // a matching at most halves the support (the rule is a bijection fixing the background pair, so no other pair
    // becomes it), so the round end holds at least size / 2^(pieces left)
    settled: (state, k) => Math.ceil(state.size / 2 ** (colors.length - 1 - k)),
    ledgers: input.ledgers,
  }
}

// The Q2R (Blume-Capel) rule on the independent sets of a proper vertex coloring, on a uniform background b that the
// rule fixes (checked by the caller). Piece k updates every cell of color k that is off background or next to one: a
// background cell whose neighbours are all background has field b z and stays. With `wall`, cells farther than `wall`
// from the origin never update and keep the background, so the box is finite and each set's update is still an
// involution (every field it reads is fixed while the set updates).
export function q2rDynamics(input: {
  space: BoxSpace
  coloring: CanonicalVertexColoring
  model: BlumeCapel
  background: number
  wall: number | null
  ledgers: readonly Ledger[]
}): Dynamics {
  const { space, coloring, model, background, wall } = input
  const inside = (c: number): boolean => wall === null || space.distance(c) <= wall

  const field = (state: Tones, cell: number): number => {
    let h = 0

    for (const w of coloring.neighbors(cell)) {
      h += state.get(w) ?? background
    }

    return h
  }

  return {
    background,
    space,
    pieces: coloring.colors,
    // a cell of a color already updated this round keeps its tone to the round end
    settled: (state, k) => {
      let n = 0

      for (const c of state.keys()) {
        if (inside(c) && coloring.colorOf(c) <= k) {
          n++
        }
      }

      return n
    },
    piece: (state, k) => {
      const touched = new Set<number>()

      for (const cell of state.keys()) {
        if (inside(cell) && coloring.colorOf(cell) === k) {
          touched.add(cell)
        }

        for (const n of coloring.neighbors(cell)) {
          if (inside(n) && coloring.colorOf(n) === k) {
            touched.add(n)
          }
        }
      }

      const next: [number, number][] = []

      for (const cell of [...touched].sort((a, b) => a - b)) {
        next.push([cell, q2rMove(state.get(cell) ?? background, field(state, cell), model)])
      }

      for (const [cell, t] of next) {
        if (t === background) {
          state.delete(cell)
        } else {
          state.set(cell, t)
        }
      }
    },
    ledgers: input.ledgers,
  }
}

// ---- ledgers ----

export function chargeLedger(background: number): Ledger {
  return {
    name: 'Q',
    modulus: 0,
    positive: false,
    of: state => {
      let q = 0

      for (const t of state.values()) {
        q += t - background
      }

      return q
    },
  }
}

export function excitationLedger(background: number): Ledger {
  return {
    name: 'D',
    modulus: 0,
    positive: background === 0,
    of: state => {
      let d = 0

      for (const t of state.values()) {
        d += t * t - background * background
      }

      return d
    },
  }
}

// the sum of residues mod 3, relative to the background
export function residueSumLedger(background: number): Ledger {
  return {
    name: 'sum3',
    modulus: 3,
    positive: false,
    of: state => {
      let s = 0

      for (const t of state.values()) {
        s += toZ3(t) - toZ3(background)
      }

      return ((s % 3) + 3) % 3
    },
  }
}

// the number of off-background cells
export const COUNT_LEDGER: Ledger = { name: 'count', modulus: 0, positive: true, of: state => state.size }

// Twice the Blume-Capel energy relative to the uniform background, exact: 2 (E(state) - E(background)) =
// -J sum over cells c off background, over neighbours w, of (s_c s_w - b^2) weighted 1 when w is off background (that
// edge is met from both ends) and 2 otherwise, plus 2 Delta sum (s_c^2 - b^2).
export function energyLedger(input: { model: BlumeCapel; background: number; neighbors: (cell: number) => readonly number[] }): Ledger {
  const { model, background: b, neighbors } = input

  return {
    name: 'E2',
    modulus: 0,
    positive: false,
    of: state => {
      let bonds = 0
      let squares = 0

      for (const [c, s] of state) {
        for (const w of neighbors(c)) {
          const t = state.get(w)

          bonds += t === undefined ? 2 * (s * b - b * b) : s * t - b * b
        }

        squares += s * s - b * b
      }

      return -model.coupling * bonds + 2 * model.crystalField * squares
    },
  }
}

const sameMod = (a: number, b: number, m: number): boolean => (m === 0 ? a === b : (((a - b) % m) + m) % m === 0)

// ---- structures ----

export type SizedStructure = Structure & { readonly size: number }

export const stateKey = (state: Tones): string =>
  [...state]
    .sort((x, y) => x[0] - y[0])
    .map(([c, t]) => `${c}:${t}`)
    .join(',')

const byDistance = (space: BoxSpace) => (a: number, b: number): number => space.distance(a) - space.distance(b) || a - b

function ballAround(space: BoxSpace, cell: number, depth: number): number[] {
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

// The structure a start makes: localized (one cluster, at most maxCells) at every round end and back exactly within
// MAX_PERIOD rounds; its region is every cell occupied after any piece of one period. Slice 1 reads to
// STRUCTURE_ROUNDS = 100 but accepts only a return by MAX_PERIOD, so a start not back by MAX_PERIOD is refused there
// either way: stopping at MAX_PERIOD gives the same structures, and a mover no longer runs 100 rounds into a lazy
// tiling that keeps every cell it creates.
export function structureOf(dyn: Dynamics, start: Tones, maxCells: number): Structure | null {
  const state = new Map(start)
  const orbit: Tones[] = [new Map(start)]
  const region = new Set<number>(start.keys())

  for (let t = 1; t <= Math.min(MAX_PERIOD, STRUCTURE_ROUNDS); t++) {
    for (let k = 0; k < dyn.pieces; k++) {
      dyn.piece(state, k)

      if (state.size > PIECE_CAP || dyn.settled(state, k) > maxCells) {
        return null
      }

      for (const c of state.keys()) {
        region.add(c)
      }
    }

    if (state.size === 0 || state.size > maxCells || clusters(dyn.space, state).length !== 1) {
      return null
    }

    if (sameTones(state, start)) {
      return { start: new Map(start), period: t, orbit, region: [...region].sort(byDistance(dyn.space)) }
    }

    orbit.push(new Map(state))
  }

  return null
}

// cells a lazy space has created so far (0 for a space that does not count)
export const createdCells = (dyn: Dynamics): number => dyn.space.cells?.() ?? 0

// A state carried from one space to another through addresses.
export function carry(state: Tones, from: BoxSpace, to: BoxSpace): Tones {
  return new Map([...state].map(([c, t]) => [to.fromAddress(from.address(c)), t]))
}

const addressStateKey = (space: BoxSpace, state: Tones): string =>
  [...state]
    .map(([c, t]) => `${space.address(c)}=${t}`)
    .sort()
    .join(';')

// k-subsets of `items` (as index lists, lexicographic)
function subsets(n: number, k: number): number[][] {
  const out: number[][] = []
  const pick: number[] = []

  const walk = (from: number): void => {
    if (pick.length === k) {
      out.push([...pick])

      return
    }

    for (let i = from; i < n; i++) {
      pick.push(i)
      walk(i + 1)
      pick.pop()
    }
  }

  walk(0)

  return out
}

// Every start of each size in `sizes` holding the origin, all cells within SEED_RADIUS, every off-background tone; sizes
// ascending, cells breadth first, tones -1, 0, +1; a start that is a round-end state of a structure already found is
// skipped (same orbit); at most MAX_STRUCTURES_PER_SIZE per size.
//
// With `fresh`, the candidate runs go to a scratch copy of the dynamics, rebuilt whenever its lazy space has created more
// than CELL_BUDGET cells (a mover on the 4D hyperbolic tiling creates a new cell at nearly every piece, and hundreds of
// thousands of three-cell starts overflow one space's tables). Starts and orbits are compared by address, and a found
// structure is rebuilt on `dyn`, so the result is the same as without `fresh`.
export function findStructures(
  dyn: Dynamics,
  sizes: readonly number[],
  fresh?: () => Dynamics,
): { seeds: Record<number, number>; structures: SizedStructure[] } {
  const cells = ballAround(dyn.space, 0, SEED_RADIUS)
    .sort(byDistance(dyn.space))
    .filter(c => c !== 0)
  const tones = [-1, 0, 1].filter(t => t !== dyn.background)
  const seen = new Set<string>()
  const seeds: Record<number, number> = {}
  const structures: SizedStructure[] = []

  let work = dyn

  for (const k of [...sizes].sort((a, b) => a - b)) {
    const maxCells = k <= 2 ? START_CELLS_MAX_SMALL : START_CELLS_MAX_LARGE

    let found = 0

    seeds[k] = 0

    for (const others of subsets(cells.length, k - 1)) {
      if (found >= MAX_STRUCTURES_PER_SIZE) {
        break
      }

      const where = [0, ...others.map(i => cells[i]!)]
      const total = tones.length ** k

      for (let code = 0; code < total && found < MAX_STRUCTURES_PER_SIZE; code++) {
        const start: Tones = new Map()

        let rest = code

        for (let i = k - 1; i >= 0; i--) {
          start.set(where[i]!, tones[rest % tones.length]!)
          rest = Math.floor(rest / tones.length)
        }

        seeds[k]++

        if (seen.has(addressStateKey(dyn.space, start))) {
          continue
        }

        if (fresh && createdCells(work) > CELL_BUDGET) {
          work = fresh()
        }

        const s = structureOf(work, work === dyn ? start : carry(start, dyn.space, work.space), maxCells)

        if (s) {
          const mine = work === dyn ? s : structureOf(dyn, start, maxCells)

          if (mine?.period !== s.period || mine.region.length !== s.region.length) {
            throw new Error('boundary-m2: a structure found on the scratch space differs on the main space')
          }

          for (const o of s.orbit) {
            seen.add(addressStateKey(work.space, o))
          }

          structures.push({ ...mine, size: k })
          found++
        }
      }
    }
  }

  return { seeds, structures }
}

// ---- perturbations ----

export type CellClass = 'held' | 'orbit' | 'transit' | 'rim'

export type Change = { readonly cell: number; readonly tone: number; readonly was: number }

export type Perturbation = {
  readonly kind: 'hit' | 'double' | 'contact'
  readonly phase: number
  readonly changes: readonly Change[]
  readonly cellClass: CellClass
}

// The family at one phase: single hits on every cell of B, contacts on every cell one facet from B, and (with
// `doubles`) two-cell hits on every pair of cells held at that phase, each cell to each tone other than its own.
export function perturbationFamily(dyn: Dynamics, s: Structure, phase: number, doubles: boolean): Perturbation[] {
  const b = dyn.background
  const now = s.orbit[phase]!
  const orbitCells = new Set(s.orbit.flatMap(o => [...o.keys()]))
  const inside = new Set(s.region)
  const out: Perturbation[] = []
  const classOf = (c: number): CellClass => (now.has(c) ? 'held' : orbitCells.has(c) ? 'orbit' : 'transit')

  for (const cell of s.region) {
    const was = now.get(cell) ?? b

    for (const tone of [-1, 0, 1]) {
      if (tone !== was) {
        out.push({ kind: 'hit', phase, changes: [{ cell, tone, was }], cellClass: classOf(cell) })
      }
    }
  }

  if (doubles) {
    const held = s.region.filter(c => now.has(c))

    for (let i = 0; i < held.length; i++) {
      for (let j = i + 1; j < held.length; j++) {
        const [u, v] = [held[i]!, held[j]!]
        const [a, c] = [now.get(u)!, now.get(v)!]

        for (const x of [-1, 0, 1].filter(t => t !== a)) {
          for (const y of [-1, 0, 1].filter(t => t !== c)) {
            out.push({
              kind: 'double',
              phase,
              changes: [
                { cell: u, tone: x, was: a },
                { cell: v, tone: y, was: c },
              ],
              cellClass: 'held',
            })
          }
        }
      }
    }
  }

  const ring = new Set<number>()

  for (const c of s.region) {
    for (const w of dyn.space.neighbors(c)) {
      if (!inside.has(w)) {
        ring.add(w)
      }
    }
  }

  for (const cell of [...ring].sort(byDistance(dyn.space))) {
    for (const tone of [-1, 0, 1]) {
      if (tone !== b) {
        out.push({ kind: 'contact', phase, changes: [{ cell, tone, was: b }], cellClass: 'rim' })
      }
    }
  }

  return out
}

export function applyChanges(state: Tones, changes: readonly Change[], background: number): Tones {
  const out = new Map(state)

  for (const { cell, tone } of changes) {
    if (tone === background) {
      out.delete(cell)
    } else {
      out.set(cell, tone)
    }
  }

  return out
}

export type Outcome = 'immune' | 'repaired' | 'broken' | 'budget'

export type Reading = {
  readonly perturbation: Perturbation
  readonly outcome: Outcome
  // the last round B read wrong (-1 when never)
  readonly lastWrong: number
  // the state at the horizon (the last completed round on a budget stop)
  readonly final: Tones
  // per ledger: kept at every round
  readonly kept: readonly boolean[]
}

// Run the perturbed state forward HORIZON rounds and compare B with the unperturbed orbit from the same phase.
export function readPerturbation(dyn: Dynamics, s: Structure, p: Perturbation): Reading {
  const state = applyChanges(s.orbit[p.phase]!, p.changes, dyn.background)
  const values = dyn.ledgers.map(l => l.of(state))
  const kept = dyn.ledgers.map(() => true)
  const matches = (t: number): boolean =>
    regionMatches({ state, structure: s, round: p.phase + t, background: dyn.background })

  let lastWrong = matches(0) ? -1 : 0

  for (let t = 1; t <= HORIZON; t++) {
    if (!roundWithin(dyn, state, SUPPORT_CAP)) {
      return { perturbation: p, outcome: 'budget', lastWrong, final: state, kept }
    }

    dyn.ledgers.forEach((l, i) => {
      kept[i] &&= sameMod(l.of(state), values[i]!, l.modulus)
    })

    if (state.size > SUPPORT_CAP) {
      return { perturbation: p, outcome: 'budget', lastWrong, final: state, kept }
    }

    if (!matches(t)) {
      lastWrong = t
    }
  }

  const outcome: Outcome = lastWrong < 0 ? 'immune' : lastWrong <= HORIZON - WINDOW ? 'repaired' : 'broken'

  return { perturbation: p, outcome, lastWrong, final: state, kept }
}

// The unperturbed run read one phase ahead: whether B misreads at some round 0..HORIZON.
export function phaseAheadMisreads(dyn: Dynamics, s: Structure): boolean {
  const state = new Map(s.start)

  for (let t = 0; t <= HORIZON; t++) {
    if (t > 0) {
      round(dyn, state)
    }

    if (!regionMatches({ state, structure: s, round: t + 1, background: dyn.background })) {
      return true
    }
  }

  return false
}

// ---- export ----

export type LedgerExport = { readonly name: string; readonly exported: number; readonly change: number; readonly equal: boolean }

export type ExportReading = {
  readonly phase: number
  // the unperturbed state plus every repaired hit at this phase
  readonly ensemble: number
  // multiplicities of the configurations outside B at the horizon, largest first
  readonly multiplicities: readonly number[]
  // per repaired hit: each ledger's exterior share against the perturbation's change, and the debris cells outside B
  readonly hits: readonly { ledgers: readonly LedgerExport[]; debris: number; positiveChange: boolean[] }[]
}

const restrict = (state: Tones, cells: ReadonlySet<number>): Tones => new Map([...state].filter(([c]) => cells.has(c)))

export function exportReading(dyn: Dynamics, s: Structure, phase: number, repaired: readonly Reading[]): ExportReading {
  const inside = new Set(s.region)
  const unperturbed = s.orbit[phase]!
  const nullFinal = s.orbit[(phase + HORIZON) % s.period]!
  const keys = [exteriorKey(nullFinal, inside), ...repaired.map(r => exteriorKey(r.final, inside))]
  const m = new Map<string, number>()

  for (const k of keys) {
    m.set(k, (m.get(k) ?? 0) + 1)
  }

  const hits = repaired.map(r => {
    const start = applyChanges(unperturbed, r.perturbation.changes, dyn.background)
    const ledgers = dyn.ledgers.map(l => {
      const exported = l.of(r.final) - l.of(restrict(r.final, inside))
      const change = l.of(start) - l.of(unperturbed)

      return { name: l.name, exported, change, equal: sameMod(exported, change, l.modulus) }
    })

    return {
      ledgers,
      debris: [...r.final.keys()].filter(c => !inside.has(c)).length,
      positiveChange: dyn.ledgers.map((l, i) => !l.positive || ledgers[i]!.change > 0),
    }
  })

  return { phase, ensemble: keys.length, multiplicities: [...m.values()].sort((a, b) => b - a), hits }
}

// ---- Z3 superposition ----

// The run of the perturbation alone under a Z3-linear rule: the deviation of each changed cell, residue minus residue,
// run on the vacuum (deviations evolve by the same matrix, the background pair being fixed).
export function deviationStart(changes: readonly Change[]): Tones {
  const out: Tones = new Map()

  for (const { cell, tone, was } of changes) {
    const d = fromZ3(toZ3(tone) - toZ3(was))

    if (d !== 0) {
      out.set(cell, d)
    }
  }

  return out
}

// the residue-wise sum of a state and a deviation state, as tones on `background`
export function addDeviation(state: Tones, deviation: Tones, background: number): Tones {
  const out = new Map(state)

  for (const [c, d] of deviation) {
    const t = fromZ3(toZ3(state.get(c) ?? background) + toZ3(d))

    if (t === background) {
      out.delete(c)
    } else {
      out.set(c, t)
    }
  }

  return out
}

// ---- the sink control ----

export type WalledReading = {
  readonly rebroken: boolean
  readonly rebrokenAt: number
  // the round the whole perturbed state came back exactly (0 when not within RETURN_CAP)
  readonly returned: number
  readonly budget: boolean
}

export function readWalled(walled: Dynamics, s: Structure, p: Perturbation): WalledReading {
  const start = applyChanges(s.orbit[p.phase]!, p.changes, walled.background)
  const state = new Map(start)

  let rebrokenAt = -1

  for (let t = 1; t <= RETURN_CAP; t++) {
    if (!roundWithin(walled, state, SUPPORT_CAP) || state.size > SUPPORT_CAP) {
      return { rebroken: rebrokenAt > 0, rebrokenAt, returned: 0, budget: true }
    }

    if (
      rebrokenAt < 0 &&
      t > HORIZON - WINDOW &&
      !regionMatches({ state, structure: s, round: p.phase + t, background: walled.background })
    ) {
      rebrokenAt = t
    }

    if (sameTones(state, start)) {
      return { rebroken: rebrokenAt > 0, rebrokenAt, returned: t, budget: false }
    }
  }

  return { rebroken: rebrokenAt > 0, rebrokenAt, returned: 0, budget: false }
}
