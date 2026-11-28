/**
 * The candidate's side of the sandbox. It is bundled with every candidate
 * and runs inside the candidate's own context, a fresh realm with code
 * generation from strings off, no process, no require, no import, no clock
 * and no random number source. It turns the shared buffer into the problem,
 * operators and artifacts a candidate expects, with states as handles.
 *
 * Nothing here is trusted. A candidate can patch any intrinsic of its own
 * realm, this bridge included, and the most it changes is what it says; the
 * evaluator, in another thread, issues every state, applies every operator,
 * meters every call and checks every answer.
 *
 * Tasks (JSON text the evaluator writes): `solve` builds a solver from the
 * factory and solves; `build` builds a learner or any other candidate
 * object; `call` calls a method of that object with data; `handOver` reads a
 * learner's proposals, table, spent work and report.
 */

import {
  FLAG_TO_PARENT,
  FLAG_TO_WORKER,
  INT_SLOTS,
  NUMBER_OFFSET,
  R_APPLICABLE,
  R_APPLY,
  R_COST,
  R_DISTANCE,
  R_DONE,
  R_ERROR,
  R_ESTIMATE,
  R_GOAL,
  R_LINKS,
  R_MESH_RUNS,
  R_TABLE_GET,
  R_TABLE_HAS,
  R_TABLE_SIZE,
  SLOT_A,
  SLOT_ANSWERS,
  SLOT_B,
  SLOT_C,
  SLOT_FLAG,
  SLOT_KIND,
  SLOT_LENGTH,
  SPINS,
  TEXT_CAPACITY,
  TEXT_OFFSET,
  W_FAIL,
} from '@/code/intelligence/sandbox/protocol'

type Handle = number

interface Issued { handle: Handle; key: string; bytes: number }

interface ArtifactRef { name: string; kind: 'estimate' | 'table' }

interface Channel {
  ints: Int32Array
  number: Float64Array
  text: Uint16Array
}

let channel: Channel | null = null
let factory: unknown = null
let built: Record<string, unknown> | null = null

const keys = new Map<Handle, string>()
const sizes = new Map<Handle, number>()

function wire(): Channel {
  if (channel === null) {
    throw new Error('sandbox bridge: not installed')
  }

  return channel
}

function writeText(value: string): void {
  const { ints, text } = wire()

  if (value.length > TEXT_CAPACITY) {
    throw new Error(`sandbox bridge: a message of ${value.length} code units is over the capacity`)
  }

  for (let index = 0; index < value.length; index++) {
    text[index] = value.charCodeAt(index)
  }

  ints[SLOT_LENGTH] = value.length
}

function readText(): string {
  const { ints, text } = wire()
  const length = ints[SLOT_LENGTH]!
  const parts: string[] = []

  for (let start = 0; start < length; start += 4096) {
    parts.push(String.fromCharCode.apply(null, Array.from(text.subarray(start, Math.min(length, start + 4096)))))
  }

  return parts.join('')
}

function waitForParent(): void {
  const { ints } = wire()

  for (let spin = 0; spin < SPINS; spin++) {
    if (Atomics.load(ints, SLOT_FLAG) === FLAG_TO_WORKER) {
      return
    }
  }

  while (Atomics.load(ints, SLOT_FLAG) !== FLAG_TO_WORKER) {
    Atomics.wait(ints, SLOT_FLAG, FLAG_TO_PARENT)
  }
}

/** Send a request and wait for the evaluator's reply; a refusal throws inside the candidate. */
function request(kind: number, a: number, b: number, text?: string): void {
  const { ints } = wire()

  ints[SLOT_KIND] = kind
  ints[SLOT_A] = a
  ints[SLOT_B] = b
  ints[SLOT_C] = 0

  if (text === undefined) {
    ints[SLOT_LENGTH] = 0
  } else {
    writeText(text)
  }

  Atomics.store(ints, SLOT_FLAG, FLAG_TO_PARENT)
  Atomics.notify(ints, SLOT_FLAG)
  waitForParent()

  if (ints[SLOT_KIND] === W_FAIL) {
    throw new Error(`refused by the evaluator: ${readText()}`)
  }
}

function finish(kind: number, text: string): void {
  const { ints } = wire()

  ints[SLOT_KIND] = kind
  writeText(text)
  ints[SLOT_ANSWERS] = ints[SLOT_ANSWERS]! + 1
  Atomics.store(ints, SLOT_FLAG, FLAG_TO_PARENT)
  Atomics.notify(ints, SLOT_FLAG)
}

/** the handle a value names, or -1, which the evaluator refuses */
function handleOf(state: unknown): number {
  return typeof state === 'number' && Number.isInteger(state) ? state : -1
}

function remember(issued: readonly Issued[]): void {
  for (const { handle, key, bytes } of issued) {
    keys.set(handle, key)
    sizes.set(handle, bytes)
  }
}

function keyOf(state: unknown): string {
  const key = keys.get(handleOf(state))

  if (key === undefined) {
    throw new Error('sandbox bridge: the key of a state the evaluator never issued')
  }

  return key
}

function bytesOf(state: unknown): number {
  const bytes = sizes.get(handleOf(state))

  if (bytes === undefined) {
    throw new Error('sandbox bridge: the bytes of a state the evaluator never issued')
  }

  return bytes
}

function numberReply(): number {
  return wire().number[0]!
}

function operatorViews(ids: readonly string[]): unknown[] {
  return ids.map((id, index) => ({
    id,
    applicable(state: unknown): boolean {
      request(R_APPLICABLE, index, handleOf(state))

      return numberReply() !== 0
    },
    cost(state: unknown): number {
      request(R_COST, index, handleOf(state))

      return numberReply()
    },
    apply(state: unknown): Handle {
      request(R_APPLY, index, handleOf(state))

      const { ints } = wire()
      const handle = ints[SLOT_A]!

      keys.set(handle, readText())
      sizes.set(handle, numberReply())

      return handle
    },
  }))
}

function hostOf(artifacts: readonly ArtifactRef[]): Record<string, unknown> {
  const index = (name: string, kind: ArtifactRef['kind']): number => {
    const at = artifacts.findIndex(artifact => artifact.name === name && artifact.kind === kind)

    if (at < 0) {
      throw new Error(`sandbox bridge: no ${kind} named ${name} was handed in`)
    }

    return at
  }

  return {
    estimate(name: string) {
      const at = index(name, 'estimate')

      return (state: unknown): number => {
        request(R_ESTIMATE, at, handleOf(state))

        return numberReply()
      }
    },
    table(name: string) {
      const at = index(name, 'table')
      const view = {
        get(key: string): number | undefined {
          request(R_TABLE_GET, at, 0, String(key))

          return wire().ints[SLOT_C] === 1 ? undefined : numberReply()
        },
        has(key: string): boolean {
          request(R_TABLE_HAS, at, 0, String(key))

          return numberReply() !== 0
        },
        get size(): number {
          request(R_TABLE_SIZE, at, 0)

          return numberReply()
        },
      }

      return view
    },
    has: (name: string): boolean => artifacts.some(artifact => artifact.name === name),
    key: keyOf,
    /**
     * Run a layout of the pair rule named `rule` on the brick line once per node: the evaluator executes and meters
     * every round and answers each run's read cell. `words` holds the input trits, run after run. A
     * layout may name its line's `background` tone (0, +1 or -1); left out (or undefined) it is the vacuum 0. Whatever
     * it names is sent as given, so the evaluator, never this side, decides whether it is a tone.
     */
    meshRuns(rule: string, layout: Record<string, unknown>, step: number, nodes: readonly unknown[], words: readonly number[]) {
      const spec: Record<string, unknown> = {
        start: layout.start,
        window: Array.from(layout.window as ArrayLike<number>),
        inputs: Array.from(layout.inputs as ArrayLike<number>),
        readPosition: layout.readPosition,
        readRound: layout.readRound,
      }

      if (layout.background !== undefined) {
        // null and every non-number survive JSON as themselves (NaN and Infinity become null): refused there
        spec.background = layout.background
      }

      request(R_MESH_RUNS, 0, 0, JSON.stringify({ rule: String(rule), layout: spec, step, nodes: Array.from(nodes, handleOf), words: Array.from(words) }))

      const reply = JSON.parse(readText()) as { v: string; p: number; d: number }
      const values: number[] = new Array<number>(reply.v.length)

      for (let at = 0; at < reply.v.length; at++) {
        const residue = reply.v.charCodeAt(at) - 48

        values[at] = residue === 2 ? -1 : residue
      }

      return { values, pairUpdates: reply.p, frameDigest: reply.d }
    },
  }
}

function problemView(problem: { id: string; regime: string; budget: unknown; initial: Issued }): Record<string, unknown> {
  remember([problem.initial])

  return {
    id: problem.id,
    regime: problem.regime,
    initial: problem.initial.handle,
    budget: problem.budget,
    goal(state: unknown): boolean {
      request(R_GOAL, 0, handleOf(state))

      return numberReply() !== 0
    },
    distance(state: unknown): number {
      request(R_DISTANCE, 0, handleOf(state))

      return numberReply()
    },
    key: keyOf,
    bytes: bytesOf,
    links(state: unknown): Int8Array | null {
      request(R_LINKS, 0, handleOf(state))

      if (wire().ints[SLOT_C] === 1) {
        return null
      }

      return Int8Array.from(JSON.parse(readText()) as number[])
    },
  }
}

type Callable = (...args: unknown[]) => unknown

function call(target: unknown, method: string, args: readonly unknown[]): unknown {
  const fn = (target as Record<string, unknown> | null)?.[method]

  if (typeof fn !== 'function') {
    throw new Error(`sandbox bridge: the candidate has no method ${method}`)
  }

  return (fn as Callable).apply(target, [...args])
}

/** A plain Map: Map's own prototype and no own properties, so nothing overrides a lookup. */
function plainMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map && Object.getPrototypeOf(value) === Map.prototype && Reflect.ownKeys(value).length === 0
}

function experienceOf(raw: Record<string, unknown>): Record<string, unknown> {
  const solution = raw.solution as Record<string, unknown>

  return {
    ...raw,
    actualCost: raw.actualCost === null ? Infinity : raw.actualCost,
    solution: { ...solution },
  }
}

interface Task {
  op: 'solve' | 'build' | 'call' | 'handOver'
  kind?: 'solver' | 'learner' | 'object'
  args?: unknown
  artifacts?: ArtifactRef[]
  operators?: string[]
  problem?: { id: string; regime: string; budget: unknown; initial: Issued }
  issued?: Issued[]
  method?: string
  callArgs?: unknown[]
  experience?: Record<string, unknown>
}

function run(task: Task): unknown {
  remember(task.issued ?? [])

  if (typeof factory !== 'function') {
    throw new Error('sandbox bridge: the candidate export is not a function')
  }

  const make = factory as Callable

  switch (task.op) {
    case 'solve': {
      const host = hostOf(task.artifacts ?? [])
      const solver = make(task.args, host) as { id: unknown; solve: Callable }
      const solution = solver.solve(problemView(task.problem!), operatorViews(task.operators ?? [])) as Record<string, unknown>

      return { solverId: String(solver.id), solution }
    }
    case 'build': {
      const host = hostOf(task.artifacts ?? [])

      built =
        task.kind === 'learner'
          ? (make(task.args, operatorViews(task.operators ?? []), keyOf, host) as Record<string, unknown>)
          : (make(task.args, host) as Record<string, unknown>)

      return { id: String(built.id) }
    }
    case 'call': {
      const args = task.method === 'observe' && task.experience !== undefined ? [experienceOf(task.experience)] : (task.callArgs ?? [])

      return { value: call(built, task.method!, args) ?? null }
    }
    case 'handOver': {
      const proposals = (call(built, 'proposeOperators', []) as { id: unknown }[]).map(operator => String(operator.id))
      const handed = call(built, 'table', [])

      let table: { plain: boolean; entries: [string, number][] }

      if (plainMap(handed)) {
        table = { plain: true, entries: Array.from(Map.prototype.entries.call(handed) as Iterable<[string, number]>) }
      } else {
        table = { plain: false, entries: [] }
      }

      const spent = call(built, 'spent', [])
      const report = typeof built?.report === 'function' ? call(built, 'report', []) : null

      return { proposals, table, spent, report }
    }
  }
}

/** Remove the realm's clock and random source, so a candidate that reaches for either fails at once. */
function determinize(): void {
  const refuse = (): never => {
    throw new Error('no random number or clock source in a candidate')
  }

  Object.defineProperty(Math, 'random', { value: refuse, writable: false, configurable: false })
  Object.defineProperty(globalThis, 'Date', { value: refuse, writable: false, configurable: false })
}

/**
 * Called once by the bundle in a fresh context: wire the buffer, take the
 * clock and random source away, then load the candidate (its module code
 * runs only now) and publish the entry.
 */
export function install(buffer: SharedArrayBuffer, load: () => unknown): void {
  channel = {
    ints: new Int32Array(buffer, 0, INT_SLOTS),
    number: new Float64Array(buffer, NUMBER_OFFSET, 1),
    text: new Uint16Array(buffer, TEXT_OFFSET, TEXT_CAPACITY),
  }
  determinize()
  factory = load()

  Object.defineProperty(globalThis, '__entry', {
    value: function entry(): void {
      try {
        const result = run(JSON.parse(readText()) as Task)

        finish(R_DONE, JSON.stringify(result ?? null))
      } catch (error) {
        finish(R_ERROR, error instanceof Error ? error.message : String(error))
      }
    },
  })
}
