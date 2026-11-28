/**
 * The evaluator: the one module that grades an attempt. It stands outside
 * every candidate, and since 2026-11-26 in
 * another thread and another realm: every candidate, solver, learner,
 * discoverer, genome realization or meta-learner, runs in an isolated
 * context inside a worker (code/intelligence/sandbox), built from a bundle of
 * its own modules only, with no file, module, process, clock or random
 * source, and talks to the evaluator only through plain data. A candidate is
 * named by a `CandidateSpec`: a module, the factory it exports, arguments as
 * data, and the sealed artifacts it may read.
 *
 * It trusts nothing a candidate says. Every published number comes from its
 * own meter; a candidate's ledger is only checked against it.
 *
 * - States. The evaluator owns the problem and every state. A candidate holds
 *   handles: the evaluator issues one for the initial state and one for each
 *   state an operator returns, and refuses any call on a handle it never
 *   issued. The candidate can read a state's key (its bytes), but cannot make
 *   the evaluator act on a state it built itself, so goal tests, distance
 *   reads and operator calls are all on issued states, and all are metered.
 * - Operators. A solve may use only operators the world registered as its
 *   primitives (`registerPrimitives`, called by the benchmark), plus macros
 *   from a sealed library, which the evaluator itself composes over its
 *   metered primitives, so a macro's inner steps are counted too. Anything
 *   else is a violation.
 * - Work. Every operator call is counted twice, once as a planning decision
 *   (a macro is one call) and once as primitive work (a macro's inner steps
 *   counted). Expansions are the distinct states, by their canonical key,
 *   that an operator was consulted on. Memory is a lower bound read from the
 *   call trace: an issued state is live from the call that made it to the
 *   last call that consulted it (or to the end, for the returned path), and
 *   no implementation can hold fewer states at once. A ledger below any of
 *   these is rejected, and the budget is charged with the larger of the two.
 *   Goal tests, distance reads, estimate and table reads are counted too.
 * - Answers. A solution and its ledger are read through fixed field lists,
 *   and any field outside them (in the solution, the ledger, its
 *   preprocessing, its quantum part or a learner's spent()) is a violation,
 *   never silently dropped. A quantum solver's own costs have a typed field,
 *   `ledger.quantum`: its states swept and goal tests must reach the meter,
 *   its success probability is an exact number of Q(zeta_9) in [0, 1] and its
 *   expected repeats at least 1/p, both ordered by certified sign.
 * - Preprocessing. Every table a solve may read is a sealed artifact: a
 *   benchmark's estimate (`sealEstimate`), a learned table and a macro
 *   library (both made only by `evaluateLearning` and `sealLibrary`). Each
 *   carries a charge only the evaluator records. A sealed table or estimate
 *   read during a solve is charged to that solve automatically, a library
 *   handed in is charged whole, and a ledger declaring less is rejected.
 *   The problem's own `distance` reaches the solver only when it is sealed;
 *   otherwise the solver sees the trivial bound 0.
 * - After the solve the candidate's context is closed: nothing of it runs
 *   after the meter is read, and nothing it cached reaches another solve.
 *
 * The returned path is replayed from the problem's own initial state on the
 * unmetered originals: each step's operator must exist and be applicable,
 * `apply` must be pure and deterministic, the listed state must equal the
 * replayed one, the cost is recomputed, the goal tested and the regime held.
 *
 * Learning runs through `evaluateLearning`: the evaluator runs the teacher's
 * solves, hands the learner (its own context, open for the phase) only
 * metered operators and the experiences it wrote itself, copies the learned
 * table out as plain data at hand-over, closes the learner's context,
 * measures the table's bytes, rejects a table entry for any state never met
 * through a metered channel, and rejects a learner reporting less work than
 * the meter saw.
 *
 * - Mesh rounds. A pair-rule layout on the brick line, the
 *   step a level-4 switch decision claims, runs only here: the candidate
 *   names a rule the evaluator knows, gives the layout as data and, per run,
 *   an input word and the issued state the decision is for; the evaluator
 *   executes every round (light cone and pair order as `lineBrickRun`),
 *   answers the read cells, and meters runs, rounds, pair updates and a frame
 *   digest per rule and layout (`Grade.mesh`). A judge reads that meter, so a
 *   decision counts as made by the mesh only when the evaluator ran it. The
 *   line's background tone (0, +1 or -1; 0 when the layout leaves it out) is
 *   part of the layout's data and is folded into the digest.
 *
 * Residual: a candidate's own computation that never touches the evaluator
 * (arithmetic on the keys it was handed) is unmetered; it can know only what
 * its bundle holds, and the bundle (sandbox/bundle.ts, at run time) and
 * check:layers (statically) keep the world, the oracle and the evaluator out
 * of every candidate's modules.
 */

import { type Ninth, ONE, mul, ninth } from '@/code/algebra/ninth-field'
import { compareReal, isReal, realSign } from '@/code/algebra/ninth-real-sign'
import type { Experience } from '@/code/intelligence/experience/experience'
import { isMacroId, macroId, primitiveSteps } from '@/code/intelligence/operator/discovery/macro'
import { compose, operatorIndex, type Operator } from '@/code/intelligence/operator/operator'
import type { Problem } from '@/code/intelligence/problem/problem'
import { toneKey } from '@/code/intelligence/problem/state'
import { candidateBundle, type CandidateKind } from '@/code/intelligence/sandbox/bundle'
import { CandidateError, openSession, type Handler, type Request, type Reply, type Session } from '@/code/intelligence/sandbox/channel'
import {
  R_APPLICABLE,
  R_APPLY,
  R_COST,
  R_DISTANCE,
  R_ESTIMATE,
  R_GOAL,
  R_LINKS,
  R_MESH_RUNS,
  R_TABLE_GET,
  R_TABLE_HAS,
  R_TABLE_SIZE,
} from '@/code/intelligence/sandbox/protocol'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import { meshDigestValue, meshEntrySeed, meshKeyHash, meshRequestFold, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import {
  NO_PREPROCESSING,
  type ExactValue,
  type Ledger,
  type Preprocessing,
  type QuantumLedger,
  type QuantumOutcome,
  type Solution,
  type WalkStop,
} from '@/code/intelligence/solver/solver'

/** Operator calls the evaluator counted itself. */
export interface CountedCalls {
  applicable: number
  apply: number
  cost: number
}

export function callTotal(calls: CountedCalls): number {
  return calls.applicable + calls.apply + calls.cost
}

// ---------------------------------------------------------------- candidates

/**
 * A candidate, named as data: a module of a candidate folder, the factory
 * it exports, the factory's arguments (plain data), and the artifacts it may
 * read by name (sealed estimates and tables; an unsealed one is served at no
 * charge, which only the evaluator side can hand in).
 */
export interface CandidateSpec {
  module: string
  export: string
  args?: unknown
  artifacts?: Readonly<Record<string, unknown>>
  /** a fixture tree laid out like this package, read first (the audits' probes) */
  root?: string
}

export function candidate(module: string, name: string, args?: unknown, artifacts?: Readonly<Record<string, unknown>>): CandidateSpec {
  return {
    module,
    export: name,
    ...(args === undefined ? {} : { args }),
    ...(artifacts === undefined ? {} : { artifacts }),
  }
}

/** What a solve may be handed: a solver factory, run in a fresh context for every solve. */
export type SolverSource = CandidateSpec

// ---------------------------------------------------------------- artifacts

/** Named pieces of preprocessing: a charge built from several artifacts counts each piece once. */
export type ChargeComponents = ReadonlyMap<string, Preprocessing>

/** Only this module can make a sealed artifact. */
const SEAL = Symbol('evaluator seal')

const ARTIFACTS = new WeakMap<object, { id: string; components: ChargeComponents }>()
const PRIMITIVES = new WeakSet<object>()
const JUDGED = new WeakMap<object, Preprocessing>()
const LEARNED = new WeakMap<object, { components: ChargeComponents; proposals: ReadonlySet<string> }>()
const HELD_OUT = new WeakSet<object>()

let sequence = 0
let heldOutGrades = 0

/** A fresh component name; a counter, so runs are deterministic. */
function nextName(prefix: string): string {
  sequence++

  return `${prefix}#${sequence}`
}

function addInto(into: Preprocessing, add: Preprocessing): void {
  into.expansions += add.expansions
  into.operatorCalls += add.operatorCalls
  into.memoryBytes += add.memoryBytes
}

/** The total of a set of components. */
export function chargeOf(components: ChargeComponents): Preprocessing {
  const total = { ...NO_PREPROCESSING }

  for (const part of components.values()) {
    addInto(total, part)
  }

  return total
}

function unite(into: Map<string, Preprocessing>, from: ChargeComponents): void {
  for (const [name, part] of from) {
    into.set(name, part)
  }
}

/** The charge the evaluator recorded for a sealed artifact, or null for anything it never sealed. */
export function artifactCharge(artifact: object): Preprocessing | null {
  const record = ARTIFACTS.get(artifact)

  return record === undefined ? null : chargeOf(record.components)
}

/** The id the evaluator recorded for a sealed artifact (as listed in `Grade.artifacts`), or null. */
export function artifactId(artifact: object): string | null {
  return ARTIFACTS.get(artifact)?.id ?? null
}

/**
 * Register a world's operators as its primitives. The benchmark that builds
 * a problem calls this; candidates cannot (they may not import this file).
 */
export function registerPrimitives<S>(operators: Operator<S>[]): Operator<S>[] {
  for (const operator of operators) {
    PRIMITIVES.add(operator)
  }

  return operators
}

/**
 * Tag problems as held out (test problems, graded only to report). The
 * evaluator counts every graded solve of a tagged problem, so a loop that
 * must never see them can be checked from outside (`heldOutGraded`).
 */
export function markHeldOut(problems: readonly object[]): void {
  for (const problem of problems) {
    HELD_OUT.add(problem)
  }
}

/** Graded solves of held-out problems so far. */
export function heldOutGraded(): number {
  return heldOutGrades
}

interface Context { used: Set<object> }

const contexts: Context[] = []

function touch(artifact: object): void {
  const context = contexts[contexts.length - 1]

  if (context !== undefined) {
    context.used.add(artifact)
  }
}

/**
 * A benchmark's estimate sealed with what building it cost. Any call during
 * a solve charges the solve; outside a solve it is free (the evaluator's own
 * bookkeeping).
 */
export function sealEstimate<S>(id: string, estimate: (state: S) => number, charge: Preprocessing): (state: S) => number {
  const sealed = (state: S): number => {
    touch(sealed)

    return estimate(state)
  }

  ARTIFACTS.set(sealed, { id, components: new Map([[nextName(`estimate:${id}`), { ...charge }]]) })

  return sealed
}

/** A learned table, copied out as plain data at hand-over. Every read during a solve charges the learning. */
export class SealedTable implements ReadonlyMap<string, number> {
  readonly #entries: Map<string, number>

  constructor(seal: typeof SEAL, entries: Map<string, number>, id: string, components: ChargeComponents) {
    if (seal !== SEAL) {
      throw new Error('SealedTable: only the evaluator seals a table')
    }

    this.#entries = entries
    ARTIFACTS.set(this, { id, components })
  }

  get size(): number {
    touch(this)

    return this.#entries.size
  }

  get(key: string): number | undefined {
    touch(this)

    return this.#entries.get(key)
  }

  has(key: string): boolean {
    touch(this)

    return this.#entries.has(key)
  }

  forEach(callback: (value: number, key: string, map: ReadonlyMap<string, number>) => void): void {
    touch(this)
    this.#entries.forEach((value, key) => callback(value, key, this))
  }

  entries(): MapIterator<[string, number]> {
    touch(this)

    return this.#entries.entries()
  }

  keys(): MapIterator<string> {
    touch(this)

    return this.#entries.keys()
  }

  values(): MapIterator<number> {
    touch(this)

    return this.#entries.values()
  }

  [Symbol.iterator](): MapIterator<[string, number]> {
    return this.entries()
  }
}

/** One operator of a sealed library: a fixed run of primitive steps, optionally guarded (controls only). */
export interface LibraryEntry {
  id: string
  steps: readonly string[]
  guard: ((state: unknown) => boolean) | null
}

/**
 * A macro library as names only. The evaluator composes the operators
 * itself, over its metered primitives, and charges the library whole to any
 * solve it is handed to.
 */
export class SealedLibrary {
  readonly id: string
  readonly entries: readonly LibraryEntry[]

  constructor(seal: typeof SEAL, id: string, entries: readonly LibraryEntry[], components: ChargeComponents) {
    if (seal !== SEAL) {
      throw new Error('SealedLibrary: only the evaluator seals a library')
    }

    this.id = id
    this.entries = Object.freeze(entries.map(entry => Object.freeze({ ...entry, steps: Object.freeze([...entry.steps]) })))
    ARTIFACTS.set(this, { id, components })
  }

  /** the step lists, in order */
  steps(): string[][] {
    return this.entries.map(entry => [...entry.steps])
  }
}

/** The evaluator's own account of judging work (a selection's validation solves), filled only by `evaluate`. */
export class Judging {
  readonly id: string

  constructor(seal: typeof SEAL, id: string) {
    if (seal !== SEAL) {
      throw new Error('Judging: only the evaluator opens an account')
    }

    this.id = id
    JUDGED.set(this, { ...NO_PREPROCESSING })
  }

  /** the work recorded so far */
  work(): Preprocessing {
    return { ...JUDGED.get(this)! }
  }
}

export function newJudging(id: string): Judging {
  return new Judging(SEAL, nextName(`judging:${id}`))
}

/** The bytes of a table as the evaluator measures them: two per UTF-16 code unit of each key, plus 8 per value. */
export function measuredTableBytes(table: ReadonlyMap<string, number>): number {
  let bytes = 0

  for (const key of table.keys()) {
    bytes += 2 * key.length + 8
  }

  return bytes
}

/**
 * A library of macros the outside selection kept. Every macro must be one a
 * source learning proposed under the meter. Its charge is the union of the
 * sources' charges (each piece once), the judging accounts' work, and the
 * bytes of the names it holds.
 */
export function sealLibrary(input: {
  id: string
  steps: readonly (readonly string[])[]
  sources: readonly object[]
  judging?: readonly Judging[]
}): SealedLibrary {
  const components = new Map<string, Preprocessing>()
  const proposed = new Set<string>()

  for (const source of input.sources) {
    const record = LEARNED.get(source)

    if (record === undefined) {
      throw new Error(`sealLibrary ${input.id}: a source is not a learning the evaluator graded`)
    }

    unite(components, record.components)
    record.proposals.forEach(id => proposed.add(id))
  }

  for (const account of input.judging ?? []) {
    const work = JUDGED.get(account)

    if (work === undefined) {
      throw new Error(`sealLibrary ${input.id}: a judging account the evaluator never opened`)
    }

    components.set(account.id, { ...work })
  }

  const entries: LibraryEntry[] = []
  let bytes = 0

  for (const steps of input.steps) {
    const id = macroId(steps)

    if (!proposed.has(id)) {
      throw new Error(`sealLibrary ${input.id}: ${id} was never proposed under the meter`)
    }

    entries.push({ id, steps, guard: null })
    bytes += 2 * id.length + 8
  }

  components.set(nextName(`library:${input.id}`), { expansions: 0, operatorCalls: 0, memoryBytes: bytes })

  return new SealedLibrary(SEAL, input.id, entries, components)
}

/**
 * A control library: guarded step runs at no charge, for experiments that
 * test whether selection catches an overfit operator. Entry ids are prefixed
 * `control:` so they never pass for a discovered macro. The guards run in the
 * evaluator, on its own states.
 */
export function sealControlLibrary<S>(
  id: string,
  entries: readonly { name: string; steps: readonly string[]; guard: (state: S) => boolean }[],
): SealedLibrary {
  return new SealedLibrary(
    SEAL,
    id,
    entries.map(entry => ({ id: `control:${entry.name}`, steps: entry.steps, guard: entry.guard as (state: unknown) => boolean })),
    new Map(),
  )
}

// ---------------------------------------------------------------- mesh rounds

/** A layout on the brick line, as data: window cell i sits at position start + i; the inputs are written per run. */
export interface MeshLayoutSpec {
  start: number
  window: readonly number[]
  /** window offsets of the input cells, in word order */
  inputs: readonly number[]
  /** the cell read (a position) after `readRound` rounds */
  readPosition: number
  readRound: number
  /**
   * the tone every cell outside the window holds at the start (0, +1 or -1). Left out, the vacuum 0: every layout
   * written before backgrounds existed runs exactly as it did. The evaluator's meter always states it.
   */
  background?: number
}

/** What the evaluator ran of one rule and layout in one solve. */
export interface MeshLayoutMeter {
  rule: string
  layout: MeshLayoutSpec
  runs: number
  /** brick rounds executed: runs times the read round */
  rounds: number
  pairUpdates: number
  /**
   * the first 48 bits of the entry's SHA-256 chain (solver/mesh/mesh-digest.ts): seeded by the rule and the whole layout,
   * background included, and folded request by request in request order, each request binding its step and every run's
   * named state, occurrence on that state, input word, final frame hash and read
   */
  frameDigest: number
  /** requests folded into the chain (a request with no run is not folded) */
  requests: number
}

/** Every mesh run the evaluator executed for one solve, one entry per rule and layout, in first-use order. */
export interface MeshMeter {
  layouts: MeshLayoutMeter[]
}

const MESH_LIMITS = { start: 64, width: 256, rounds: 64, step: 1_000_000 } as const

let meshRules: Map<string, Int8Array | null> | null = null

/** The pair rules the evaluator runs, by fiber name (a name two tables share is refused). */
function meshRule(name: string): Int8Array | null {
  if (meshRules === null) {
    meshRules = new Map()

    for (const rule of pairRulesFromFibers()) {
      meshRules.set(rule.name, meshRules.has(rule.name) ? null : Int8Array.from(rule.table))
    }
  }

  return meshRules.get(name) ?? null
}

/** The modulus of the frame hash. */
export const MESH_HASH_MODULUS = 1_000_003

/** A frame's hash: a polynomial over its tones (residues 0, 1, 2), mod 1,000,003. */
export function meshFrameHash(cells: Int8Array, length: number): number {
  let h = 7

  for (let i = 0; i < length; i++) {
    h = (h * 31 + cells[i]! + 1) % MESH_HASH_MODULUS
  }

  return h
}

/** The line length of a layout's run: start + width + 2 * pad, pad = 2 * readRound + 2 (as lineBrickRun). */
export function meshLineLength(layout: MeshLayoutSpec): number {
  return layout.start + layout.window.length + 2 * (2 * layout.readRound + 2)
}

/**
 * One run of `layout` on `word` in `cells` (length meshLineLength, overwritten), round for round as lineBrickRun:
 * pairs (2k, 2k + 1) then (2k + 1, 2k + 2), left cell first, only the pairs touching the light cone updated, every cell
 * outside the window starting at the layout's background (0 when left out). With `frames`, every round end (round 0 the
 * start) is pushed as a copy, for the experiment's certificate.
 */
export function meshLineRun(
  table: ArrayLike<number>,
  layout: MeshLayoutSpec,
  word: ArrayLike<number>,
  cells: Int8Array,
  frames?: Int8Array[],
): { value: number; frameHash: number; pairUpdates: number } {
  const rounds = layout.readRound
  const pad = 2 * rounds + 2
  const length = layout.start + layout.window.length + 2 * pad

  const background = layout.background ?? 0

  if (background !== -1 && background !== 0 && background !== 1) {
    throw new Error(`meshLineRun: background ${String(background)} is not a tone`)
  }

  cells.fill(background, 0, length)

  for (let i = 0; i < layout.window.length; i++) {
    cells[layout.start + i + pad] = layout.window[i]!
  }

  for (let j = 0; j < layout.inputs.length; j++) {
    cells[layout.start + layout.inputs[j]! + pad] = word[j]!
  }

  frames?.push(cells.slice(0, length))

  let lo = layout.start + pad
  let hi = layout.start + pad + layout.window.length - 1
  let pairUpdates = 0

  for (let t = 0; t < rounds; t++) {
    for (let color = 0; color < 2; color++) {
      let i = lo - 2 > 0 ? lo - 2 : 0

      if ((i & 1) !== color) {
        i++
      }

      for (; i + 1 < length && i <= hi; i += 2) {
        const q = table[(cells[i]! + 1) * 3 + cells[i + 1]! + 1]!
        const low = q % 3

        cells[i] = (q - low) / 3 - 1
        cells[i + 1] = low - 1
        pairUpdates++
      }

      lo = lo - 1 > 0 ? lo - 1 : 0
      hi = hi + 1 < length - 1 ? hi + 1 : length - 1
    }

    frames?.push(cells.slice(0, length))
  }

  return { value: cells[layout.readPosition + pad]!, frameHash: meshFrameHash(cells, length), pairUpdates }
}

const isTone = (value: unknown): value is number => value === -1 || value === 0 || value === 1
const isCount = (value: unknown, limit: number): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= limit

/** A layout read from a candidate's request, or the reason it is refused. */
function meshLayoutOf(raw: unknown): MeshLayoutSpec | string {
  const fields = raw as Record<string, unknown> | null
  const named = ['start', 'window', 'inputs', 'readPosition', 'readRound']

  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    return 'a mesh layout is five fields: start, window, inputs, readPosition, readRound, and an optional background'
  }

  const keys = Object.keys(fields)
  const declared = keys.includes('background')

  if (keys.length !== (declared ? 6 : 5) || !named.every(name => keys.includes(name))) {
    return 'a mesh layout is five fields: start, window, inputs, readPosition, readRound, and an optional background'
  }

  const { start, window, inputs, readPosition, readRound } = fields
  const background = declared ? fields.background : 0

  if (!isTone(background)) {
    return 'a mesh layout background is one tone: 0, +1 or -1'
  }

  if (!isCount(start, MESH_LIMITS.start) || !isCount(readRound, MESH_LIMITS.rounds) || readRound < 1) {
    return 'a mesh layout start or read round out of range'
  }

  if (!Array.isArray(window) || window.length < 1 || window.length > MESH_LIMITS.width || !window.every(isTone)) {
    return 'a mesh layout window is 1 to 256 tones'
  }

  // at least one input: a layout with none computes one constant read, whatever the word
  if (!Array.isArray(inputs) || inputs.length < 1 || !inputs.every(at => isCount(at, window.length - 1)) || new Set(inputs).size !== inputs.length) {
    return 'mesh layout inputs are one or more distinct window offsets'
  }

  const spec: MeshLayoutSpec = { start, window: [...window] as number[], inputs: [...inputs] as number[], readPosition: 0, readRound, background }

  // the read cell inside the final light cone: a tone moves at most one cell per pair update, two per
  // round, so a cell farther than 2 * readRound from the window holds the background whatever the input
  if (
    typeof readPosition !== 'number' ||
    !Number.isInteger(readPosition) ||
    readPosition < start - 2 * readRound ||
    readPosition > start + window.length - 1 + 2 * readRound
  ) {
    return 'a mesh layout read cell outside its final light cone'
  }

  spec.readPosition = readPosition

  return spec
}

interface MeshLedger {
  entries: Map<string, MeshLayoutMeter & { chain: Uint8Array; table: Int8Array; cells: Int8Array }>
  /** key hash per issued handle, computed once */
  keyHashes: Map<number, number>
}

function meshMeterOf(ledger: MeshLedger | null): MeshMeter {
  if (ledger === null) {
    return { layouts: [] }
  }

  return {
    layouts: Array.from(ledger.entries.values(), entry => ({
      rule: entry.rule,
      layout: { ...entry.layout, window: [...entry.layout.window], inputs: [...entry.layout.inputs] },
      runs: entry.runs,
      rounds: entry.rounds,
      pairUpdates: entry.pairUpdates,
      frameDigest: entry.frameDigest,
      requests: entry.requests,
    })),
  }
}

/**
 * Serve one R_MESH_RUNS request: run the layout once per named state, metered. The answer is JSON text: `v`, the read
 * cells as residue digits ('0', '1', '2' for 0, +1, -1), `p`, the pair updates of this request, `d`, the entry's digest
 * after this request (the chain is order-sensitive, so the last answer's `d` is the entry's digest).
 */
function serveMeshRuns<S>(ledger: MeshLedger, issued: Issued<S>, text: string): { answer: string } | { reason: string } {
  let raw: Record<string, unknown>

  try {
    raw = JSON.parse(text) as Record<string, unknown>
  } catch {
    return { reason: 'a mesh request that is not data' }
  }

  if (raw === null || typeof raw !== 'object' || typeof raw.rule !== 'string') {
    return { reason: 'a mesh request names no rule' }
  }

  const table = meshRule(raw.rule)

  if (table === null) {
    return { reason: `no pair rule named ${raw.rule} that the evaluator runs` }
  }

  const layout = meshLayoutOf(raw.layout)

  if (typeof layout === 'string') {
    return { reason: layout }
  }

  const { step, nodes, words } = raw
  const arity = layout.inputs.length

  if (!isCount(step, MESH_LIMITS.step)) {
    return { reason: 'a mesh request step out of range' }
  }

  if (!Array.isArray(nodes) || !Array.isArray(words) || words.length !== nodes.length * arity || !words.every(isTone)) {
    return { reason: 'a mesh request gives one word of input tones per named state' }
  }

  for (const node of nodes) {
    if (typeof node !== 'number' || !issued.has(node)) {
      return { reason: 'a mesh run named a state the evaluator never issued' }
    }
  }

  const name = JSON.stringify({ rule: raw.rule, layout })

  let entry = ledger.entries.get(name)

  if (entry === undefined) {
    const chain = meshEntrySeed(raw.rule, layout)

    entry = {
      rule: raw.rule,
      layout,
      runs: 0,
      rounds: 0,
      pairUpdates: 0,
      frameDigest: meshDigestValue(chain),
      requests: 0,
      chain,
      table,
      cells: new Int8Array(meshLineLength(layout)),
    }
    ledger.entries.set(name, entry)
  }

  const word = new Array<number>(arity)
  const values: string[] = new Array<string>(nodes.length)
  const runs: MeshDigestRun[] = new Array<MeshDigestRun>(nodes.length)

  let pairUpdates = 0

  const handles = nodes as number[]

  for (let n = 0; n < handles.length; n++) {
    const node = handles[n]!

    for (let j = 0; j < arity; j++) {
      word[j] = words[n * arity + j]!
    }

    const run = meshLineRun(table, layout, word, entry.cells)

    let hash = ledger.keyHashes.get(node)

    if (hash === undefined) {
      hash = meshKeyHash(issued.keys[node]!)
      ledger.keyHashes.set(node, hash)
    }

    pairUpdates += run.pairUpdates
    runs[n] = { keyHash: hash, word: word.slice(), frameHash: run.frameHash, value: run.value }
    values[n] = run.value === -1 ? '2' : run.value === 1 ? '1' : '0'
  }

  // a request with no run changes nothing (the chain binds every run to its step and decision, in order)
  if (handles.length > 0) {
    entry.chain = meshRequestFold(entry.chain, step, runs)
    entry.frameDigest = meshDigestValue(entry.chain)
    entry.requests++
  }

  entry.runs += nodes.length
  entry.rounds += nodes.length * layout.readRound
  entry.pairUpdates += pairUpdates

  return { answer: JSON.stringify({ v: values.join(''), p: pairUpdates, d: entry.frameDigest }) }
}

// ---------------------------------------------------------------- the meter

/** Reads a candidate made that are not operator calls. */
export interface Reads {
  goal: number
  distance: number
  estimate: number
  table: number
  links: number
}

interface Meter {
  /** calls on the operators handed over, a macro counting one: planning decisions */
  calls: CountedCalls
  /** calls that reached a primitive, a macro's inner steps included */
  elementary: CountedCalls
  /** the canonical keys of the states an operator was consulted on */
  probed: Set<string>
  /** keys of every state met through a metered channel (learning only) */
  seen: Set<string> | null
  clock: number
  /** handle to the clock of the call that made it, and of the last call that consulted it */
  born: Map<number, number> | null
  last: Map<number, number> | null
  revoked: boolean
  reads: Reads
}

function newMeter(seen: boolean, traceMemory: boolean): Meter {
  return {
    calls: { applicable: 0, apply: 0, cost: 0 },
    elementary: { applicable: 0, apply: 0, cost: 0 },
    probed: new Set<string>(),
    seen: seen ? new Set<string>() : null,
    clock: 0,
    born: traceMemory ? new Map<number, number>() : null,
    last: traceMemory ? new Map<number, number>() : null,
    revoked: false,
    reads: { goal: 0, distance: 0, estimate: 0, table: 0, links: 0 },
  }
}

function guardRevoked(meter: Meter, id: string): void {
  if (meter.revoked) {
    throw new Error(`operator ${id} called after the evaluator read its meter`)
  }
}

/** Count every call that reaches a primitive. */
function elementaryLayer<S>(operators: readonly Operator<S>[], meter: Meter): Operator<S>[] {
  return operators.map(operator => ({
    id: operator.id,
    applicable(state) {
      guardRevoked(meter, operator.id)
      meter.elementary.applicable++

      return operator.applicable(state)
    },
    apply(state) {
      guardRevoked(meter, operator.id)
      meter.elementary.apply++

      return operator.apply(state)
    },
    cost(state) {
      guardRevoked(meter, operator.id)
      meter.elementary.cost++

      return operator.cost(state)
    },
  }))
}

/** The operators of the libraries, composed over `primitives`; a macro naming a step the world lacks is left out. */
function libraryOperators<S>(
  libraries: readonly SealedLibrary[],
  primitives: readonly Operator<S>[],
  memo: boolean,
): Operator<S>[] {
  const index = new Map(primitives.map(operator => [operator.id, operator]))
  const out: Operator<S>[] = []
  const ids = new Set<string>()

  for (const library of libraries) {
    for (const entry of library.entries) {
      if (ids.has(entry.id)) {
        continue
      }

      const parts = entry.steps.map(step => index.get(step))

      if (parts.some(part => part === undefined)) {
        continue
      }

      const whole = compose(entry.id, parts as Operator<S>[], { memo })
      const guard = entry.guard

      ids.add(entry.id)
      out.push(
        guard === null
          ? whole
          : {
              id: entry.id,
              applicable: state => guard(state) && whole.applicable(state),
              apply: whole.apply,
              cost: whole.cost,
            },
      )
    }
  }

  return out
}

/** The operators a candidate is handed, in the evaluator: metered primitives, then the libraries' macros over them. */
function handOver<S>(operators: readonly Operator<S>[], libraries: readonly SealedLibrary[], meter: Meter): Operator<S>[] {
  const primitives = elementaryLayer(operators, meter)

  return [...primitives, ...libraryOperators(libraries, primitives, true)]
}

/** The states the evaluator issued to one candidate session, by handle. */
class Issued<S> {
  readonly states: S[] = []
  readonly keys: string[] = []
  readonly bytes: number[] = []
  readonly byKey = new Map<string, number>()

  issue(state: S, key: string, bytes: number): number {
    this.states.push(state)
    this.keys.push(key)
    this.bytes.push(bytes)

    return this.states.length - 1
  }

  /** one handle per state, by its canonical key (experiences list the same state many times, in many objects) */
  issueOnce(state: S, key: string, bytes: number): number {
    const known = this.byKey.get(key)

    if (known !== undefined) {
      return known
    }

    const handle = this.issue(state, key, bytes)

    this.byKey.set(key, handle)

    return handle
  }

  has(handle: number): boolean {
    return Number.isInteger(handle) && handle >= 0 && handle < this.states.length
  }

  record(handle: number): { handle: number; key: string; bytes: number } {
    return { handle, key: this.keys[handle]!, bytes: this.bytes[handle]! }
  }
}

interface ArtifactSlot {
  name: string
  kind: 'estimate' | 'table'
  value: unknown
}

function artifactSlots(artifacts: Readonly<Record<string, unknown>> | undefined, violations: string[]): ArtifactSlot[] {
  const out: ArtifactSlot[] = []

  for (const [name, value] of Object.entries(artifacts ?? {})) {
    if (typeof value === 'function') {
      out.push({ name, kind: 'estimate', value })
    } else if (value instanceof SealedTable || value instanceof Map) {
      out.push({ name, kind: 'table', value })
    } else {
      violations.push(`artifact ${name} is neither an estimate nor a table`)
    }
  }

  return out
}

/**
 * The evaluator's side of one session: every request names an issued state
 * and an operator or artifact by index, and is answered from the evaluator's
 * own states, through its meter. A request on anything it never issued is
 * refused and recorded.
 */
function serve<S>(input: {
  issued: Issued<S>
  handed: readonly Operator<S>[]
  meter: Meter
  key: (state: S) => string
  bytes: (state: S) => number
  links: ((state: S) => Int8Array | null) | null
  goal: ((state: S) => boolean) | null
  distance: ((state: S) => number) | null
  artifacts: readonly ArtifactSlot[]
  refusals: string[]
  /** the solve's mesh-round ledger; null where no mesh rounds may be run */
  mesh: MeshLedger | null
}): Handler {
  const { issued, handed, meter, refusals } = input

  const refuse = (reply: Reply, reason: string): void => {
    if (refusals.length < 20) {
      refusals.push(reason)
    }

    reply.fail(reason)
  }

  const stateOf = (handle: number): S | null => (issued.has(handle) ? issued.states[handle]! : null)

  return (request: Request, reply: Reply) => {
    switch (request.kind) {
      case R_APPLICABLE:
      case R_COST:
      case R_APPLY: {
        const operator = handed[request.a]
        const state = stateOf(request.b)

        if (operator === undefined) {
          refuse(reply, `an operator the evaluator never handed over (#${request.a})`)

          return
        }

        if (state === null) {
          refuse(reply, `operator ${operator.id} consulted on a state the evaluator never issued`)

          return
        }

        guardRevoked(meter, operator.id)
        meter.clock++
        meter.probed.add(issued.keys[request.b]!)
        meter.last?.set(request.b, meter.clock)

        if (request.kind === R_APPLICABLE) {
          meter.calls.applicable++
          reply.number(operator.applicable(state) ? 1 : 0)
        } else if (request.kind === R_COST) {
          meter.calls.cost++
          reply.number(operator.cost(state))
        } else {
          meter.calls.apply++

          const next = operator.apply(state)
          const key = input.key(next)
          const bytes = input.bytes(next)
          const handle = issued.issue(next, key, bytes)

          meter.born?.set(handle, meter.clock)
          meter.seen?.add(key)
          reply.handle(handle, bytes, key)
        }

        return
      }
      case R_GOAL:
      case R_DISTANCE:
      case R_LINKS: {
        const state = stateOf(request.b)

        if (state === null) {
          refuse(reply, 'a goal, distance or links read of a state the evaluator never issued')

          return
        }

        if (request.kind === R_GOAL) {
          if (input.goal === null) {
            refuse(reply, 'no goal here')

            return
          }

          meter.reads.goal++
          reply.number(input.goal(state) ? 1 : 0)
        } else if (request.kind === R_DISTANCE) {
          if (input.distance === null) {
            refuse(reply, 'no distance here')

            return
          }

          meter.reads.distance++
          reply.number(input.distance(state))
        } else {
          meter.reads.links++

          const links = input.links === null ? null : input.links(state)

          if (links === null) {
            reply.none()
          } else {
            reply.text(JSON.stringify(Array.from(links)))
          }
        }

        return
      }
      case R_ESTIMATE: {
        const slot = input.artifacts[request.a]
        const state = stateOf(request.b)

        if (slot?.kind !== 'estimate' || state === null) {
          refuse(reply, 'an estimate read of an artifact or state the evaluator never handed over')

          return
        }

        meter.reads.estimate++
        reply.number((slot.value as (state: S) => number)(state))

        return
      }
      case R_TABLE_GET:
      case R_TABLE_HAS:
      case R_TABLE_SIZE: {
        const slot = input.artifacts[request.a]

        if (slot?.kind !== 'table') {
          refuse(reply, 'a table read of an artifact the evaluator never handed over')

          return
        }

        const table = slot.value as ReadonlyMap<string, number>

        meter.reads.table++

        if (request.kind === R_TABLE_SIZE) {
          reply.number(table.size)
        } else if (request.kind === R_TABLE_HAS) {
          reply.number(table.has(request.text()) ? 1 : 0)
        } else {
          const value = table.get(request.text())

          if (value === undefined) {
            reply.none()
          } else {
            reply.number(value)
          }
        }

        return
      }
      case R_MESH_RUNS: {
        if (input.mesh === null) {
          refuse(reply, 'no mesh rounds here')

          return
        }

        guardRevoked(meter, 'mesh rounds')

        const served = serveMeshRuns(input.mesh, issued, request.text())

        if ('reason' in served) {
          refuse(reply, served.reason)
        } else {
          reply.text(served.answer)
        }

        return
      }
      default:
        refuse(reply, `an unknown request (${request.kind})`)
    }
  }
}

/** Most states, and bytes, live at once, read from the trace: a lower bound on what any implementation held. */
function peakLive(meter: Meter, bytesOf: readonly number[], kept: readonly number[]): { states: number; bytes: number } {
  const born = meter.born!
  const last = meter.last!
  const end = meter.clock + 1

  for (const handle of kept) {
    if (born.has(handle)) {
      last.set(handle, end)
    }
  }

  const states = new Int32Array(end + 2)
  const bytes = new Float64Array(end + 2)

  for (const [handle, from] of born) {
    const to = Math.max(from, last.get(handle) ?? from)
    const size = bytesOf[handle]!

    states[from]!++
    states[to + 1]!--
    bytes[from]! += size
    bytes[to + 1]! -= size
  }

  let liveStates = 0
  let liveBytes = 0
  let peakStates = 0
  let peakBytes = 0

  for (let time = 0; time <= end; time++) {
    liveStates += states[time]!
    liveBytes += bytes[time]!
    peakStates = Math.max(peakStates, liveStates)
    peakBytes = Math.max(peakBytes, liveBytes)
  }

  return { states: peakStates, bytes: peakBytes }
}

/** Open a candidate's session, or a reason it was refused. */
function sessionFor(spec: CandidateSpec, kind: CandidateKind): { session: Session } | { reason: string } {
  const fields = spec as unknown as Record<string, unknown> | null

  if (typeof fields?.module !== 'string' || typeof fields.export !== 'string') {
    return { reason: 'the candidate is not named as data (a module and the factory it exports); code objects are never run in the evaluator' }
  }

  const bundled = candidateBundle(spec.module, spec.export, kind, spec.root)

  if (!bundled.ok) {
    return { reason: `the candidate was refused: ${bundled.reason}` }
  }

  try {
    return { session: openSession(bundled.bundle) }
  } catch (error) {
    return { reason: `the candidate would not load: ${error instanceof Error ? error.message : String(error)}` }
  }
}

// ---------------------------------------------------------------- grading

/** What the evaluator measured of a solve. */
export interface Measured {
  /** distinct states, by canonical key, an operator was consulted on */
  expansions: number
  /** successor states made (apply calls) */
  generated: number
  /** most states live at once, from the call trace */
  peakStates: number
  /** most bytes live at once, from the call trace */
  peakBytes: number
}

export interface Grade<S> {
  solverId: string
  problemId: string
  /** verified: valid path, goal holds, regime held, within budget, no violations */
  solved: boolean
  /** what the solver said */
  claimedSolved: boolean
  pathValid: boolean
  goalHolds: boolean
  withinBudget: boolean
  /** the path cost as the evaluator recomputed it, or null when the path is invalid */
  cost: number | null
  steps: number
  /** planning decisions: calls on the operators handed over, a macro counting one */
  counted: CountedCalls
  /** primitive work: calls that reached a primitive, a macro's inner steps included */
  elementary: CountedCalls
  /** distinct states the solver consulted an operator on (= measured.expansions) */
  probedStates: number
  measured: Measured
  /** goal tests, distance, estimate, table and links reads the solver made */
  reads: Reads
  /** the mesh runs the evaluator executed for the solve, one entry per rule and layout */
  mesh: MeshMeter
  /** the preprocessing the evaluator charged this solve: every sealed artifact read or handed in, each piece once */
  charge: Preprocessing
  components: ChargeComponents
  /** ids of the sealed artifacts the solve read or was handed */
  artifacts: string[]
  ledger: Ledger
  /** every rule the attempt broke, empty when clean */
  violations: string[]
  /** the path, in the evaluator's own states */
  solution: Solution<S>
}

function linkKey(links: Int8Array | null): string | null {
  return links === null ? null : toneKey(links)
}

/** Replay a path against the problem and the original operators; returns the recomputed cost or null. */
function replay<S>(
  problem: Problem<S>,
  operators: readonly Operator<S>[],
  solution: Solution<S>,
  violations: string[],
): number | null {
  const index = operatorIndex(operators)

  if (solution.states.length !== solution.operators.length + 1) {
    violations.push(`path has ${solution.states.length} states for ${solution.operators.length} operators`)

    return null
  }

  const first = solution.states[0]

  if (first === undefined || problem.key(first) !== problem.key(problem.initial)) {
    violations.push('path does not start at the problem initial state')

    return null
  }

  const initialLinks = linkKey(problem.links(problem.initial))

  if (problem.regime === 'pure' && initialLinks !== null) {
    violations.push('pure regime: the initial state carries links')
  }

  let state = problem.initial
  let cost = 0

  for (let step = 0; step < solution.operators.length; step++) {
    const id = solution.operators[step]!
    const operator = index.get(id)

    if (operator === undefined) {
      violations.push(`step ${step}: unknown operator ${id}`)

      return null
    }

    if (!operator.applicable(state)) {
      violations.push(`step ${step}: ${id} is not applicable`)

      return null
    }

    const before = problem.key(state)
    const stepCost = operator.cost(state)

    if (!Number.isFinite(stepCost) || stepCost < 0) {
      violations.push(`step ${step}: ${id} cost ${stepCost} is not a finite nonnegative number`)

      return null
    }

    const next = operator.apply(state)
    const again = operator.apply(state)

    if (problem.key(state) !== before) {
      violations.push(`step ${step}: ${id} changed its input (not pure)`)

      return null
    }

    if (problem.key(next) !== problem.key(again)) {
      violations.push(`step ${step}: ${id} gave two results for one input (not deterministic)`)

      return null
    }

    const listed = solution.states[step + 1] as S

    if (problem.key(listed) !== problem.key(next)) {
      violations.push(`step ${step}: listed state differs from the replayed state`)

      return null
    }

    const links = linkKey(problem.links(next))

    if (problem.regime === 'pure' && links !== null) {
      violations.push(`step ${step}: pure regime gained links`)

      return null
    }

    if (problem.regime === 'relational' && links !== initialLinks) {
      violations.push(`step ${step}: relational regime changed a link`)

      return null
    }

    cost += stepCost
    state = next
  }

  return cost
}

const LEDGER_FIELDS = ['expansions', 'generated', 'operatorCalls', 'peakStates', 'peakBytes'] as const
const PREPROCESSING_FIELDS = ['expansions', 'operatorCalls', 'memoryBytes'] as const
const SOLUTION_FIELDS = ['states', 'operators', 'cost', 'solved', 'ledger'] as const
const QUANTUM_INTEGERS = [
  'statesExpanded',
  'states',
  'largestDegree',
  'degree',
  'walls',
  'marked',
  'goalTests',
  'beatsRun',
  'beats',
  'unitaryDefects',
  'amplitudeBytes',
  'graphBytes',
  'arcUpdates',
  'statesTouched',
  'cellsTouched',
] as const
const QUANTUM_OUTCOMES: readonly QuantumOutcome[] = ['found', 'initialGoal', 'noGoal', 'expansionBudget', 'memoryBudget']
const WALK_STOPS: readonly WalkStop[] = ['none', 'firstMaximum', 'cap', 'bytes']
const QUANTUM_FIELDS = [...QUANTUM_INTEGERS, 'outcome', 'stoppedBy', 'successProbability', 'expectedRepeats'] as const
const EXACT_FIELDS = ['n', 'd'] as const

/** the coordinates of Q(zeta_9) on 1, zeta, ..., zeta^5 */
const NINTH_DEGREE = 6
const INTEGER_TEXT = /^-?[0-9]+$/

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

/**
 * Refuse every field of a candidate's answer the evaluator does not read:
 * a field it dropped would be a cost nobody checked (a quantum walk's beats
 * once rode in the solver id for want of one). Fail-closed, by name.
 */
function refuseUnknown(raw: unknown, known: readonly string[], where: string, violations: string[]): void {
  for (const name of Object.keys(record(raw))) {
    if (!known.includes(name)) {
      violations.push(`unknown ${where} field ${name}: the evaluator refuses what it does not read`)
    }
  }
}

/**
 * An exact value read as a number of Q(zeta_9), or null when it is not one:
 * at most six integer coordinates and a positive integer denominator, each
 * a decimal string, nothing else.
 */
export function exactOf(raw: unknown): Ninth | null {
  const fields = record(raw)

  if (Object.keys(fields).some(name => !(EXACT_FIELDS as readonly string[]).includes(name))) {
    return null
  }

  const { n, d } = fields

  if (
    !Array.isArray(n) ||
    n.length === 0 ||
    n.length > NINTH_DEGREE ||
    !n.every(x => typeof x === 'string' && INTEGER_TEXT.test(x)) ||
    typeof d !== 'string' ||
    !INTEGER_TEXT.test(d) ||
    BigInt(d) <= 0n
  ) {
    return null
  }

  return ninth(
    (n as string[]).map(x => BigInt(x)),
    BigInt(d),
  )
}

/** An exact value copied out as plain data (the candidate's object is never kept), or null; a bad one is a violation. */
function exactField(raw: unknown, name: string, violations: string[]): ExactValue | null {
  if (raw === null) {
    return null
  }

  if (exactOf(raw) === null) {
    violations.push(`ledger quantum ${name} is not an exact value (decimal-string coordinates of Q(zeta_9) over a positive denominator)`)

    return null
  }

  const fields = record(raw)

  return { n: (fields.n as string[]).slice(), d: fields.d as string }
}

/** A quantum ledger read as data: unknown fields refused, integers NaN where not numbers (refused later), exact values checked. */
function quantumOf(raw: unknown, violations: string[]): QuantumLedger {
  const fields = record(raw)

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    violations.push('ledger quantum is not a record')
  }

  refuseUnknown(raw, QUANTUM_FIELDS, 'ledger.quantum', violations)

  for (const name of ['successProbability', 'expectedRepeats'] as const) {
    if (fields[name] === undefined) {
      violations.push(`ledger quantum ${name} is missing (null when there is none)`)
    }
  }

  const number = (value: unknown): number => (typeof value === 'number' ? value : Number.NaN)
  const outcome = QUANTUM_OUTCOMES.find(name => name === fields.outcome)
  const stoppedBy = WALK_STOPS.find(name => name === fields.stoppedBy)

  if (outcome === undefined) {
    violations.push(`ledger quantum outcome ${String(fields.outcome)} is not one of ${QUANTUM_OUTCOMES.join(', ')}`)
  }

  if (stoppedBy === undefined) {
    violations.push(`ledger quantum stoppedBy ${String(fields.stoppedBy)} is not one of ${WALK_STOPS.join(', ')}`)
  }

  const quantum = {
    outcome: outcome ?? 'found',
    stoppedBy: stoppedBy ?? 'none',
    successProbability: exactField(fields.successProbability ?? null, 'successProbability', violations),
    expectedRepeats: exactField(fields.expectedRepeats ?? null, 'expectedRepeats', violations),
  } as QuantumLedger

  for (const name of QUANTUM_INTEGERS) {
    quantum[name] = number(fields[name])
  }

  return quantum
}

/** A ledger read as data: every field a number, NaN where the candidate gave anything else (then refused as not an integer). */
function ledgerOf(raw: unknown, violations: string[]): Ledger {
  const fields = record(raw)
  const pre = record(fields.preprocessing)
  const number = (value: unknown): number => (typeof value === 'number' ? value : Number.NaN)
  const ledger = { preprocessing: {} } as Ledger

  refuseUnknown(raw, [...LEDGER_FIELDS, 'preprocessing', 'quantum'], 'ledger', violations)
  refuseUnknown(fields.preprocessing, PREPROCESSING_FIELDS, 'ledger.preprocessing', violations)

  for (const name of LEDGER_FIELDS) {
    ledger[name] = number(fields[name])
  }

  for (const name of PREPROCESSING_FIELDS) {
    ledger.preprocessing[name] = number(pre[name])
  }

  if (fields.quantum !== undefined) {
    ledger.quantum = quantumOf(fields.quantum, violations)
  }

  return ledger
}

function preprocessingOf(raw: unknown, violations: string[]): Preprocessing {
  const fields = record(raw)
  const number = (value: unknown): number => (typeof value === 'number' ? value : Number.NaN)

  refuseUnknown(raw, PREPROCESSING_FIELDS, 'spent', violations)

  return { expansions: number(fields.expansions), operatorCalls: number(fields.operatorCalls), memoryBytes: number(fields.memoryBytes) }
}

/**
 * Hold a quantum ledger to what the evaluator can meter or decide itself:
 * every count a nonnegative integer, states swept and goal tests never below
 * its own counts, the success probability a real number exactly in [0, 1],
 * and the expected repeats never below 1/p (absent exactly when p is absent
 * or 0). Orders are certified signs (ninth-real-sign), never floats. The
 * walk itself (beats, the probability's value) is a judge's to recompute.
 */
function checkQuantum(quantum: QuantumLedger, measured: Measured, reads: Reads, violations: string[]): void {
  for (const name of QUANTUM_INTEGERS) {
    const value = quantum[name]

    if (!Number.isInteger(value) || value < 0) {
      violations.push(`ledger quantum ${name} ${value} is not a nonnegative integer`)
    }
  }

  for (const [name, reported, metered] of [
    ['quantum statesExpanded', quantum.statesExpanded, measured.expansions],
    ['quantum goalTests', quantum.goalTests, reads.goal],
  ] as const) {
    if (reported < metered) {
      violations.push(`ledger reports ${name} ${reported}, the evaluator measured ${metered}`)
    }
  }

  if (quantum.beats > quantum.beatsRun) {
    violations.push(`ledger quantum measures at beat ${quantum.beats} of ${quantum.beatsRun} run`)
  }

  const p = quantum.successProbability === null ? null : exactOf(quantum.successProbability)
  const repeats = quantum.expectedRepeats === null ? null : exactOf(quantum.expectedRepeats)

  if (p !== null && !isReal(p)) {
    violations.push('ledger quantum successProbability is not a real number')

    return
  }

  if (p !== null && (realSign(p) < 0 || compareReal(p, ONE) > 0)) {
    violations.push('ledger quantum successProbability lies outside [0, 1]')

    return
  }

  if (p === null || realSign(p) === 0) {
    if (repeats !== null) {
      violations.push('ledger quantum expectedRepeats given where the success probability is absent or 0')
    }

    return
  }

  if (repeats === null) {
    violations.push('ledger quantum expectedRepeats missing for a success probability above 0')
  } else if (!isReal(repeats) || compareReal(mul(repeats, p), ONE) < 0) {
    violations.push('ledger quantum expectedRepeats below 1/p')
  }
}

/** The candidate's answer read back into the evaluator's own states; null where a handle was never issued. */
function solutionOf<S>(raw: unknown, issued: Issued<S>, violations: string[]): { solution: Solution<S>; handles: number[] } {
  const fields = record(raw)

  refuseUnknown(raw, SOLUTION_FIELDS, 'solution', violations)

  const handles = Array.isArray(fields.states) ? (fields.states as unknown[]) : []
  const ids = Array.isArray(fields.operators) ? (fields.operators as unknown[]) : []
  const states: S[] = []
  const kept: number[] = []
  let forged = false

  for (const handle of handles) {
    if (typeof handle === 'number' && issued.has(handle)) {
      states.push(issued.states[handle]!)
      kept.push(handle)
    } else {
      forged = true
    }
  }

  if (forged || !Array.isArray(fields.states)) {
    violations.push('the path names a state the evaluator never issued')
  }

  if (!ids.every(id => typeof id === 'string')) {
    violations.push('the path names an operator by something that is not a string')
  }

  return {
    solution: {
      states: forged ? [] : states,
      operators: ids.map(String),
      cost: typeof fields.cost === 'number' ? fields.cost : Number.NaN,
      solved: fields.solved === true,
      ledger: ledgerOf(fields.ledger, violations),
    },
    handles: kept,
  }
}

export interface EvaluateOptions {
  /**
   * A minimum the caller also requires of the ledger's preprocessing. It
   * never lowers the evaluator's own charge, which comes from the sealed
   * artifacts the solve read or was handed.
   */
  charge?: Preprocessing
  /** sealed macro libraries; the evaluator composes their operators itself and charges each whole */
  libraries?: readonly SealedLibrary[]
  /** a judging account to add this solve's measured work to */
  judging?: Judging
}

const ZERO_ESTIMATE = (): number => 0

function unsolvedAt<S>(problem: Problem<S>): Solution<S> {
  return {
    states: [problem.initial],
    operators: [],
    cost: 0,
    solved: false,
    ledger: { expansions: 0, generated: 0, operatorCalls: 0, peakStates: 0, peakBytes: 0, preprocessing: { ...NO_PREPROCESSING } },
  }
}

/**
 * Run a solver on `problem` and grade the attempt. The solver runs in a
 * fresh isolated context and sees only handles, metered operators (and the
 * libraries' macros) and the artifacts its spec names; the replay uses the
 * originals.
 */
export function evaluate<S>(
  source: SolverSource,
  problem: Problem<S>,
  operators: readonly Operator<S>[],
  options: EvaluateOptions = {},
): Grade<S> {
  const violations: string[] = []
  const libraries = options.libraries ?? []

  if (HELD_OUT.has(problem)) {
    heldOutGrades++
  }

  for (const operator of operators) {
    if (!PRIMITIVES.has(operator)) {
      violations.push(
        `operator ${operator.id} is not a registered primitive of this world (a macro or learned operator reaches a solve only through a sealed library)`,
      )
    }
  }

  for (const library of libraries) {
    if (!(library instanceof SealedLibrary) || !ARTIFACTS.has(library)) {
      violations.push('a library the evaluator never sealed')
    }
  }

  const meter = newMeter(false, true)
  const handed = handOver(operators, libraries, meter)
  const replayOperators = [...operators, ...libraryOperators(libraries, operators, false)]

  try {
    operatorIndex(handed)
  } catch (error) {
    violations.push(String(error))
  }

  const distance = ARTIFACTS.has(problem.distance) ? problem.distance : ZERO_ESTIMATE
  const context: Context = { used: new Set() }
  const initialKey = problem.key(problem.initial)
  const issued = new Issued<S>()
  const refusals: string[] = []
  const slots = artifactSlots(source.artifacts, violations)
  const mesh: MeshLedger = { entries: new Map(), keyHashes: new Map() }

  // the initial state is the problem's, not the solver's: a give-up answer that returns it holds nothing of its own
  const initial = issued.issue(problem.initial, initialKey, problem.bytes(problem.initial))

  let solverId = 'unknown'
  let solution = unsolvedAt(problem)
  let kept: number[] = [initial]

  const opened = sessionFor(source, 'solver')

  if ('reason' in opened) {
    violations.push(opened.reason)
  } else {
    contexts.push(context)

    try {
      const answer = record(
        opened.session.task(
          {
            op: 'solve',
            args: source.args ?? null,
            artifacts: slots.map(slot => ({ name: slot.name, kind: slot.kind })),
            operators: handed.map(operator => operator.id),
            problem: { id: problem.id, regime: problem.regime, budget: problem.budget, initial: issued.record(initial) },
          },
          serve({
            issued,
            handed,
            meter,
            key: problem.key,
            bytes: problem.bytes,
            links: problem.links,
            goal: problem.goal,
            distance,
            artifacts: slots,
            refusals,
            mesh,
          }),
        ),
      )

      solverId = typeof answer.solverId === 'string' ? answer.solverId : 'unknown'

      const read = solutionOf(answer.solution, issued, violations)

      solution = read.solution
      kept = read.handles
    } catch (error) {
      if (!(error instanceof CandidateError)) {
        throw error
      }

      violations.push(`the solver failed: ${error.message}`)
    } finally {
      contexts.pop()
      meter.revoked = true
      opened.session.close()
    }
  }

  for (const refusal of refusals) {
    violations.push(`refused: ${refusal}`)
  }

  const live = peakLive(meter, issued.bytes, kept)
  const measured: Measured = {
    expansions: meter.probed.size,
    generated: meter.calls.apply,
    peakStates: live.states,
    peakBytes: live.bytes,
  }

  if (problem.key(problem.initial) !== initialKey) {
    violations.push('the solve changed the problem initial state (an operator is not pure)')
  }

  const cost = replay(problem, replayOperators, solution, violations)
  const pathValid = cost !== null
  const last = solution.states[solution.states.length - 1]
  const goalHolds = pathValid && last !== undefined && problem.goal(last)

  if (pathValid && !(Math.abs(cost - solution.cost) <= 1e-9 * Math.max(1, Math.abs(cost)))) {
    violations.push(`claimed cost ${solution.cost} differs from replayed cost ${cost}`)
  }

  if (solution.solved && !goalHolds) {
    violations.push('claimed solved but the goal does not hold on the last state')
  }

  // the charge: every sealed artifact read during the solve or handed in, each piece once
  const components = new Map<string, Preprocessing>()
  const artifacts: string[] = []

  for (const artifact of [...context.used, ...libraries]) {
    const sealed = ARTIFACTS.get(artifact)

    if (sealed !== undefined && !artifacts.includes(sealed.id)) {
      artifacts.push(sealed.id)
      unite(components, sealed.components)
    }
  }

  const charge = chargeOf(components)

  if (options.charge !== undefined) {
    charge.expansions = Math.max(charge.expansions, options.charge.expansions)
    charge.operatorCalls = Math.max(charge.operatorCalls, options.charge.operatorCalls)
    charge.memoryBytes = Math.max(charge.memoryBytes, options.charge.memoryBytes)
  }

  const ledger = solution.ledger
  const countedTotal = callTotal(meter.calls)

  for (const [name, value] of [
    ['expansions', ledger.expansions],
    ['generated', ledger.generated],
    ['operatorCalls', ledger.operatorCalls],
    ['peakStates', ledger.peakStates],
    ['peakBytes', ledger.peakBytes],
    ['preprocessing.expansions', ledger.preprocessing.expansions],
    ['preprocessing.operatorCalls', ledger.preprocessing.operatorCalls],
    ['preprocessing.memoryBytes', ledger.preprocessing.memoryBytes],
  ] as const) {
    if (!Number.isInteger(value) || value < 0) {
      violations.push(`ledger ${name} ${value} is not a nonnegative integer`)
    }
  }

  for (const [name, reported, metered] of [
    ['search operator calls', ledger.operatorCalls, countedTotal],
    ['search expansions', ledger.expansions, measured.expansions],
    ['generated states', ledger.generated, measured.generated],
    ['peak states', ledger.peakStates, measured.peakStates],
    ['peak bytes', ledger.peakBytes, measured.peakBytes],
    ['preprocessing expansions', ledger.preprocessing.expansions, charge.expansions],
    ['preprocessing operatorCalls', ledger.preprocessing.operatorCalls, charge.operatorCalls],
    ['preprocessing memoryBytes', ledger.preprocessing.memoryBytes, charge.memoryBytes],
  ] as const) {
    if (reported < metered) {
      violations.push(`ledger reports ${name} ${reported}, the evaluator measured ${metered}`)
    }
  }

  if (ledger.quantum !== undefined) {
    checkQuantum(ledger.quantum, measured, meter.reads, violations)
  }

  // the budget, charged with the larger of the ledger and the meter in every part (a NaN ledger leaves the meter)
  const larger = (a: number, b: number): number => (Number.isFinite(a) ? Math.max(a, b) : b)
  const steps = solution.operators.length
  const budget = problem.budget
  const expansions = larger(ledger.expansions, measured.expansions) + larger(ledger.preprocessing.expansions, charge.expansions)
  const bytes = larger(ledger.peakBytes, measured.peakBytes) + larger(ledger.preprocessing.memoryBytes, charge.memoryBytes)
  const overruns: string[] = []

  if (steps > budget.steps) {
    overruns.push(`steps ${steps} > ${budget.steps}`)
  }

  if (expansions > budget.expansions) {
    overruns.push(`expansions ${expansions} > ${budget.expansions} (preprocessing counted)`)
  }

  if (bytes > budget.memoryBytes) {
    overruns.push(`bytes ${bytes} > ${budget.memoryBytes} (preprocessing counted)`)
  }

  const withinBudget = overruns.length === 0

  for (const overrun of overruns) {
    violations.push(`over budget: ${overrun}`)
  }

  if (options.judging !== undefined) {
    const account = JUDGED.get(options.judging)

    if (account === undefined) {
      violations.push('a judging account the evaluator never opened')
    } else {
      addInto(account, { expansions: measured.expansions, operatorCalls: callTotal(meter.elementary), memoryBytes: 0 })
    }
  }

  return {
    solverId,
    problemId: problem.id,
    solved: pathValid && goalHolds && withinBudget && violations.length === 0,
    claimedSolved: solution.solved,
    pathValid,
    goalHolds,
    withinBudget,
    cost,
    steps,
    counted: { ...meter.calls },
    elementary: { ...meter.elementary },
    probedStates: measured.expansions,
    measured,
    reads: { ...meter.reads },
    mesh: meshMeterOf(mesh),
    charge,
    components,
    artifacts,
    ledger,
    violations,
    solution,
  }
}

// ---------------------------------------------------------------- learning

export interface LearningGrade<S> {
  learnerId: string
  /** the learner reported at least what the meter saw, handed over plain data, and every table entry is backed */
  accepted: boolean
  violations: string[]
  /** the teacher's graded solves the experiences came from */
  training: Grade<S>[]
  experiences: Experience<S>[]
  /** the learned table, copied out at hand-over and sealed */
  table: SealedTable
  /** bytes of the table measured by the evaluator: two per key code unit plus 8 per entry */
  tableBytes: number
  /** the teacher's solves as the evaluator measured them: distinct states consulted, primitive calls */
  teacherMetered: Preprocessing
  /** what the teacher's solves read (the base estimate, a library), each piece once */
  teacherArtifacts: Preprocessing
  /** the learner's own work as the evaluator metered it (calls on the operators handed over), with the table bytes */
  learnerMetered: Preprocessing
  /** the learner's primitive calls, a macro's inner steps included */
  learnerElementary: number
  learnerReported: Preprocessing
  /**
   * the whole cost of learning, charged to every solve that reads the table
   * or uses the library: the teacher's solves and what they read, plus the
   * larger of the learner's metered and reported work
   */
  charge: Preprocessing
  components: ChargeComponents
  /** operators the learner proposed */
  proposed: number
  /** the ids of the operators proposed, in order */
  proposals: string[]
  /** the proposed macros, sealed by name (level 3 selects from them) */
  library: SealedLibrary
  /** the learner's report at hand-over, plain data, unread by the evaluator (null when none) */
  report: unknown
}

/**
 * Run a learning phase under the meter. The evaluator grades the teacher on
 * every training problem, writes each experience from its own grade (utility
 * 1 for a verified solve, 0 otherwise), and hands the learner, built in its
 * own context from `build` with metered operators (and the libraries'
 * macros) and the problems' key, nothing else. All training problems must
 * share one environment (one operator set and key).
 */
export function evaluateLearning<S>(input: {
  build: CandidateSpec
  teacher: SolverSource
  training: readonly Problem<S>[]
  operators: readonly Operator<S>[]
  libraries?: readonly SealedLibrary[]
}): LearningGrade<S> {
  const first = input.training[0]

  if (first === undefined) {
    throw new Error('evaluateLearning: no training problems')
  }

  const libraries = input.libraries ?? []
  const key = first.key
  const violations: string[] = []
  const meter = newMeter(true, false)
  const handed = handOver(input.operators, libraries, meter)
  const issued = new Issued<S>()
  const refusals: string[] = []
  const slots = artifactSlots(input.build.artifacts, violations)
  const handler = serve({
    issued,
    handed,
    meter,
    key,
    bytes: first.bytes,
    links: first.links,
    goal: null,
    distance: null,
    artifacts: slots,
    refusals,
    mesh: null,
  })

  let session: Session | null = null
  let learnerId = 'unknown'

  const fail = (what: string, error: unknown): void => {
    if (!(error instanceof CandidateError)) {
      throw error
    }

    violations.push(`the learner failed in ${what}: ${error.message}`)
    session?.close()
    session = null
  }

  const opened = sessionFor(input.build, 'learner')

  if ('reason' in opened) {
    violations.push(opened.reason)
  } else {
    session = opened.session

    try {
      const answer = record(
        session.task(
          { op: 'build', kind: 'learner', args: input.build.args ?? null, operators: handed.map(o => o.id), artifacts: slots.map(s => ({ name: s.name, kind: s.kind })) },
          handler,
        ),
      )

      learnerId = typeof answer.id === 'string' ? answer.id : 'unknown'
    } catch (error) {
      fail('build', error)
    }
  }

  const training: Grade<S>[] = []
  const experiences: Experience<S>[] = []
  const teacherMetered: Preprocessing = { ...NO_PREPROCESSING }
  const teacherComponents = new Map<string, Preprocessing>()

  for (const problem of input.training) {
    const grade = evaluate(input.teacher, problem, input.operators, { libraries })

    training.push(grade)
    teacherMetered.expansions += grade.measured.expansions
    teacherMetered.operatorCalls += callTotal(grade.elementary)
    unite(teacherComponents, grade.components)

    if (grade.violations.length > 0) {
      violations.push(`teacher on ${problem.id}: ${grade.violations[0]}`)
    }

    const solution = grade.solution
    const outcome = solution.states[solution.states.length - 1] ?? problem.initial
    const experience: Experience<S> = {
      problemId: problem.id,
      initial: problem.initial,
      solution,
      outcome,
      predictedCost: problem.distance(problem.initial),
      actualCost: grade.cost ?? Infinity,
      utility: grade.solved ? 1 : 0,
    }

    experiences.push(experience)

    for (const state of [problem.initial, ...solution.states, outcome]) {
      meter.seen!.add(key(state))
    }

    if (session !== null) {
      const handleOf = (state: S): number => issued.issueOnce(state, key(state), first.bytes(state))
      const before = issued.states.length
      const told = {
        problemId: experience.problemId,
        initial: handleOf(experience.initial),
        solution: {
          states: solution.states.map(handleOf),
          operators: solution.operators,
          cost: solution.cost,
          solved: solution.solved,
          ledger: solution.ledger,
        },
        outcome: handleOf(outcome),
        predictedCost: experience.predictedCost,
        actualCost: Number.isFinite(experience.actualCost) ? experience.actualCost : null,
        utility: experience.utility,
      }
      const fresh = issued.states.slice(before).map((_, index) => issued.record(before + index))

      try {
        session.task({ op: 'call', method: 'observe', experience: told, issued: fresh }, handler)
      } catch (error) {
        fail('observe', error)
      }
    }
  }

  let proposals: string[] = []
  let learnerReported: Preprocessing = { ...NO_PREPROCESSING }
  let report: unknown = null

  const entries = new Map<string, number>()

  if (session !== null) {
    try {
      const answer = record(session.task({ op: 'handOver' }, handler))
      const table = record(answer.table)

      proposals = Array.isArray(answer.proposals) ? (answer.proposals as unknown[]).map(String) : []
      learnerReported = preprocessingOf(answer.spent, violations)
      report = answer.report ?? null

      if (table.plain !== true) {
        violations.push('the learner handed over a table that is not a plain Map (it could compute at lookup time)')
      } else if (Array.isArray(table.entries)) {
        for (const pair of table.entries as unknown[]) {
          if (Array.isArray(pair) && typeof pair[0] === 'string') {
            entries.set(pair[0], typeof pair[1] === 'number' ? pair[1] : Number.NaN)
          } else {
            violations.push('the learned table holds an entry that is not a key and a value')
            break
          }
        }
      }
    } catch (error) {
      fail('hand-over', error)
    }
  }

  // hand-over: the meter is read and the learner's context is closed, so nothing of it runs on
  meter.revoked = true
  session?.close()

  for (const refusal of refusals) {
    violations.push(`refused: ${refusal}`)
  }

  const tableBytes = measuredTableBytes(entries)
  const learnerMetered: Preprocessing = {
    expansions: meter.probed.size,
    operatorCalls: callTotal(meter.calls),
    memoryBytes: tableBytes,
  }
  const learnerElementary = callTotal(meter.elementary)

  let unbacked = 0
  let badValues = 0

  for (const [entryKey, value] of entries) {
    if (!meter.seen!.has(entryKey)) {
      unbacked++
    }

    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      badValues++
    }
  }

  if (unbacked > 0) {
    violations.push(`${unbacked} table entries name states the learner never met through a metered channel`)
  }

  if (badValues > 0) {
    violations.push(`${badValues} table values are not finite nonnegative numbers`)
  }

  for (const name of PREPROCESSING_FIELDS) {
    const reported = learnerReported[name]

    if (!Number.isInteger(reported) || reported < learnerMetered[name]) {
      violations.push(`learner reports ${name} ${reported}, the evaluator metered ${learnerMetered[name]}`)
    }
  }

  const larger = (a: number, b: number): number => (Number.isFinite(a) ? Math.max(a, b) : b)
  const components = new Map<string, Preprocessing>(teacherComponents)

  components.set(nextName(`learning:${learnerId}`), {
    expansions: teacherMetered.expansions + larger(learnerReported.expansions, learnerMetered.expansions),
    operatorCalls: teacherMetered.operatorCalls + larger(learnerReported.operatorCalls, learnerElementary),
    memoryBytes: larger(learnerReported.memoryBytes, tableBytes),
  })

  const id = `${learnerId}@${first.id}`
  const macroEntries: LibraryEntry[] = proposals
    .filter(isMacroId)
    .map(proposal => ({ id: proposal, steps: primitiveSteps(proposal), guard: null }))
  const grade: LearningGrade<S> = {
    learnerId,
    accepted: violations.length === 0,
    violations,
    training,
    experiences,
    table: new SealedTable(SEAL, entries, `table:${id}`, components),
    tableBytes,
    teacherMetered,
    teacherArtifacts: chargeOf(teacherComponents),
    learnerMetered,
    learnerElementary,
    learnerReported,
    charge: chargeOf(components),
    components,
    proposed: proposals.length,
    proposals,
    library: new SealedLibrary(SEAL, `proposals:${id}`, macroEntries, components),
    report,
  }

  LEARNED.set(grade, { components, proposals: new Set(proposals) })

  return grade
}

// ---------------------------------------------------------------- other candidates

/**
 * A candidate object with a life longer than one call (a meta-learner):
 * built once in its own context, then asked by method name with plain data,
 * answering plain data. It is handed no operators and may make no request.
 */
export interface CandidateObject {
  readonly id: string
  call: (method: string, ...args: unknown[]) => unknown
  close: () => void
}

/** Build a candidate object in its own context; a refusal or a failure throws a CandidateError. */
export function openCandidate(spec: CandidateSpec): CandidateObject {
  const opened = sessionFor(spec, 'object')

  if ('reason' in opened) {
    throw new CandidateError(opened.reason)
  }

  const session = opened.session
  const built = record(session.task({ op: 'build', kind: 'object', args: spec.args ?? null }, null))

  return {
    id: typeof built.id === 'string' ? built.id : 'unknown',
    call: (method, ...args) => record(session.task({ op: 'call', method, callArgs: args }, null)).value,
    close: () => session.close(),
  }
}
