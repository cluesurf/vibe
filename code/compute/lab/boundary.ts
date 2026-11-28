// M9 self-maintaining boundaries (item vibe-computation-models-0020). Algebra: spin-one. A structure is an in-place
// species of a pair rule (a localized start that returns exactly within MAX_PERIOD rounds); its region B is every cell
// its orbit occupies after any single matching of one period. A perturbation changes one cell's tone at round 0; the
// forward rule alone runs on, and the state on B is compared with the unperturbed orbit at the same phase.
//
// Only the forward round exists in this module, by design: a repair must come from the forward dynamics and, on an open
// window, the outward sink. Nothing here restores a cell from outside the run.
//
// EXPORT. Every round is a bijection of finite-support states, so perturbed runs never meet each other or the
// unperturbed run. Repaired hits (perturbations inside B, wrong at some round, right again for the whole last window)
// agree on B at the horizon, so they differ outside B: the configuration outside B carries the whole perturbation
// ensemble. `exportReading` counts those exterior configurations exactly.
//
// Parameters are fixed before the first run (m9-boundaries.md, re-plan).

import {
  CensusRule,
  PairSpace,
  SPECIES_MAX_CELLS,
  Tones,
  clusters,
  sameTones,
  sparseRound,
} from '@/code/measure/particle-census'

export const STRUCTURE_ROUNDS = 100
export const MAX_PERIOD = 24
export const SEED_RADIUS = 2
export const MAX_STRUCTURES = 8
export const HORIZON = 64
export const WINDOW = 32
export const SUPPORT_CAP = 600
export const RETURN_CAP = 1024

export type BoundaryRun = {
  readonly space: PairSpace
  readonly colors: readonly number[]
  readonly rule: CensusRule
  readonly background: number
  readonly keepsExcitation: boolean
}

export function forwardRound(run: BoundaryRun, state: Tones): void {
  sparseRound({ space: run.space, colors: run.colors, rule: run.rule, background: run.background, state })
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

const byDistance = (space: PairSpace) => (a: number, b: number): number =>
  space.distance(a) - space.distance(b) || a - b

// cells within `depth` facets of `cell`, breadth first
function ballAround(space: PairSpace, cell: number, depth: number): number[] {
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

// ---- structures ----

export type Structure = {
  readonly start: Tones
  readonly period: number
  // round-end states at rounds 0 .. period - 1
  readonly orbit: readonly Tones[]
  // every cell occupied after any matching of one period, sorted by distance then id
  readonly region: readonly number[]
}

// The structure a start makes, or null when the run is not localized or does not return within MAX_PERIOD rounds.
export function structureOf(run: BoundaryRun, start: Tones): Structure | null {
  const state = new Map(start)
  const orbit: Tones[] = [new Map(start)]
  const region = new Set<number>(start.keys())

  for (let t = 1; t <= STRUCTURE_ROUNDS; t++) {
    for (const color of run.colors) {
      sparseRound({ space: run.space, colors: [color], rule: run.rule, background: run.background, state })

      if (t <= MAX_PERIOD) {
        for (const c of state.keys()) {
          region.add(c)
        }
      }
    }

    if (state.size === 0 || state.size > SPECIES_MAX_CELLS || clusters(run.space, state).length !== 1) {
      return null
    }

    if (sameTones(state, start)) {
      return t <= MAX_PERIOD
        ? { start: new Map(start), period: t, orbit, region: [...region].sort(byDistance(run.space)) }
        : null
    }

    orbit.push(new Map(state))
  }

  return null
}

// Every start of one or two cells containing the origin, both within SEED_RADIUS facets of it, every off-background
// tone, in breadth-first cell order then tone order; the first MAX_STRUCTURES that are structures.
export function findStructures(run: BoundaryRun): { seeds: number; structures: Structure[] } {
  const cells = ballAround(run.space, 0, SEED_RADIUS).sort(byDistance(run.space))
  const tones = [-1, 0, 1].filter(t => t !== run.background)
  const starts: Tones[] = []

  for (const a of tones) {
    starts.push(new Map([[0, a]]))
  }

  for (const c of cells) {
    if (c === 0) {
      continue
    }

    for (const a of tones) {
      for (const b of tones) {
        starts.push(
          new Map([
            [0, a],
            [c, b],
          ]),
        )
      }
    }
  }

  const structures: Structure[] = []

  for (const s of starts) {
    if (structures.length >= MAX_STRUCTURES) {
      break
    }

    const found = structureOf(run, s)

    if (found) {
      structures.push(found)
    }
  }

  return { seeds: starts.length, structures }
}

// ---- perturbations ----

export type Perturbation = {
  readonly kind: 'hit' | 'contact'
  readonly cell: number
  readonly tone: number
  // the tone the cell held at round 0
  readonly was: number
}

// Hits: every cell of B, each tone other than the one it holds; contacts: every cell one facet from B, each
// off-background tone. Cells by distance from the origin, tones -1, 0, +1.
export function perturbationFamily(run: BoundaryRun, structure: Structure): Perturbation[] {
  const inside = new Set(structure.region)
  const out: Perturbation[] = []

  for (const cell of structure.region) {
    const was = structure.start.get(cell) ?? run.background

    for (const tone of [-1, 0, 1]) {
      if (tone !== was) {
        out.push({ kind: 'hit', cell, tone, was })
      }
    }
  }

  const ring = new Set<number>()

  for (const c of structure.region) {
    for (const w of run.space.neighbors(c)) {
      if (!inside.has(w)) {
        ring.add(w)
      }
    }
  }

  for (const cell of [...ring].sort(byDistance(run.space))) {
    for (const tone of [-1, 0, 1]) {
      if (tone !== run.background) {
        out.push({ kind: 'contact', cell, tone, was: run.background })
      }
    }
  }

  return out
}

export function perturbedStart(run: BoundaryRun, structure: Structure, p: Perturbation): Tones {
  const state = new Map(structure.start)

  if (p.tone === run.background) {
    state.delete(p.cell)
  } else {
    state.set(p.cell, p.tone)
  }

  return state
}

export function regionMatches(input: {
  state: Tones
  structure: Structure
  round: number
  background: number
}): boolean {
  const { state, structure, round, background } = input
  const expected = structure.orbit[round % structure.period]!

  for (const c of structure.region) {
    if ((state.get(c) ?? background) !== (expected.get(c) ?? background)) {
      return false
    }
  }

  return true
}

export type Outcome = 'immune' | 'repaired' | 'broken' | 'budget'

export type PerturbationReading = {
  readonly perturbation: Perturbation
  readonly outcome: Outcome
  // the last round B read wrong (-1 when never)
  readonly lastWrong: number
  // the state at the horizon (the last completed round on a budget stop)
  readonly final: Tones
  readonly chargeKept: boolean
  readonly excitationKept: boolean
}

export function readPerturbation(run: BoundaryRun, structure: Structure, p: Perturbation): PerturbationReading {
  const state = perturbedStart(run, structure, p)
  const q0 = charge(state, run.background)
  const d0 = excitation(state, run.background)
  const matches = (t: number): boolean =>
    regionMatches({ state, structure, round: t, background: run.background })

  let lastWrong = matches(0) ? -1 : 0
  let chargeKept = true
  let excitationKept = true

  for (let t = 1; t <= HORIZON; t++) {
    forwardRound(run, state)
    chargeKept &&= charge(state, run.background) === q0
    excitationKept &&= excitation(state, run.background) === d0

    if (state.size > SUPPORT_CAP) {
      return { perturbation: p, outcome: 'budget', lastWrong, final: state, chargeKept, excitationKept }
    }

    if (!matches(t)) {
      lastWrong = t
    }
  }

  const outcome: Outcome = lastWrong < 0 ? 'immune' : lastWrong <= HORIZON - WINDOW ? 'repaired' : 'broken'

  return { perturbation: p, outcome, lastWrong, final: state, chargeKept, excitationKept }
}

// The unperturbed run read one phase ahead: whether B misreads at some round 0..HORIZON (a structure of period 1
// cannot misread).
export function phaseAheadMisreads(run: BoundaryRun, structure: Structure): boolean {
  const state = new Map(structure.start)

  for (let t = 0; t <= HORIZON; t++) {
    if (t > 0) {
      forwardRound(run, state)
    }

    if (!regionMatches({ state, structure, round: t + 1, background: run.background })) {
      return true
    }
  }

  return false
}

// ---- export ----

export const exteriorKey = (state: Tones, inside: ReadonlySet<number>): string =>
  [...state]
    .filter(([c]) => !inside.has(c))
    .sort((x, y) => x[0] - y[0])
    .map(([c, t]) => `${c}:${t}`)
    .join(',')

export type ExportReading = {
  // the ensemble: the unperturbed start plus every repaired hit
  readonly ensemble: number
  // multiplicities of the configurations outside B at the horizon, largest first
  readonly multiplicities: readonly number[]
  // at round 0 (all background outside B for hits)
  readonly multiplicitiesAtStart: readonly number[]
  // per repaired hit: Q and D outside B at the horizon, the perturbation's change of Q and D, debris cells outside B
  readonly charges: readonly { exportedQ: number; deltaQ: number; exportedD: number; deltaD: number; debris: number }[]
}

export function exportReading(input: {
  run: BoundaryRun
  structure: Structure
  repaired: readonly PerturbationReading[]
}): ExportReading {
  const { run, structure, repaired } = input
  const inside = new Set(structure.region)
  const nullFinal = structure.orbit[HORIZON % structure.period]!
  const keys = [exteriorKey(nullFinal, inside), ...repaired.map(r => exteriorKey(r.final, inside))]
  const startKeys = [
    exteriorKey(structure.start, inside),
    ...repaired.map(r => exteriorKey(perturbedStart(run, structure, r.perturbation), inside)),
  ]

  const count = (ks: readonly string[]): number[] => {
    const m = new Map<string, number>()

    for (const k of ks) {
      m.set(k, (m.get(k) ?? 0) + 1)
    }

    return [...m.values()].sort((a, b) => b - a)
  }

  const charges = repaired.map(r => {
    const ext: Tones = new Map([...r.final].filter(([c]) => !inside.has(c)))
    const p = r.perturbation

    return {
      exportedQ: charge(ext, run.background),
      deltaQ: p.tone - p.was,
      exportedD: excitation(ext, run.background),
      deltaD: p.tone * p.tone - p.was * p.was,
      debris: ext.size,
    }
  })

  return { ensemble: keys.length, multiplicities: count(keys), multiplicitiesAtStart: count(startKeys), charges }
}

// Shannon entropy in bits of a uniform ensemble grouped by the given multiplicities (display only: the exact datum is
// the integer list).
export function entropyBits(multiplicities: readonly number[]): number {
  const n = multiplicities.reduce((s, x) => s + x, 0)

  return n === 0 ? 0 : multiplicities.reduce((s, x) => s - (x / n) * Math.log2(x / n), 0)
}

// ---- the sink control ----

export type WalledReading = {
  // B read wrong at some round past HORIZON - WINDOW, up to RETURN_CAP
  readonly rebroken: boolean
  // the first such round (-1 when none)
  readonly rebrokenAt: number
  // the round the whole perturbed state came back exactly (0 when not within RETURN_CAP)
  readonly returned: number
  readonly budget: boolean
}

// The perturbed start run behind a wall (the caller passes the walled run): the same local schedule as the open window,
// a finite reversible box.
export function readWalled(run: BoundaryRun, structure: Structure, p: Perturbation): WalledReading {
  const start = perturbedStart(run, structure, p)
  const state = new Map(start)

  let rebrokenAt = -1
  let returned = 0

  for (let t = 1; t <= RETURN_CAP; t++) {
    forwardRound(run, state)

    if (state.size > SUPPORT_CAP) {
      return { rebroken: rebrokenAt > 0, rebrokenAt, returned, budget: true }
    }

    if (rebrokenAt < 0 && t > HORIZON - WINDOW && !regionMatches({ state, structure, round: t, background: run.background })) {
      rebrokenAt = t
    }

    if (sameTones(state, start)) {
      returned = t
      break
    }
  }

  return { rebroken: rebrokenAt > 0, rebrokenAt, returned, budget: false }
}
