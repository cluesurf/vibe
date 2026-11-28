/**
 * The evaluator's end of the sandbox: one worker thread, started on first
 * use, holding one fresh context per candidate session, and a synchronous
 * channel to it through a shared buffer. Grading stays synchronous: the
 * evaluator sends a task and then serves the candidate's requests (operator
 * calls, goal tests, estimate and table reads) one by one until the
 * candidate answers. Only one task is ever outstanding.
 *
 * The worker gets an empty environment and a memory cap. If it falls silent
 * for longer than SILENCE_MS the channel throws: a candidate that never
 * answers fails closed instead of hanging the run.
 *
 * Evaluator side.
 */

import { Worker } from 'node:worker_threads'
import { hostScript, type Bundle } from '@/code/intelligence/sandbox/bundle'
import {
  BUFFER_BYTES,
  FLAG_TO_PARENT,
  FLAG_TO_WORKER,
  INT_SLOTS,
  NUMBER_OFFSET,
  R_DONE,
  R_ERROR,
  R_READY,
  SLOT_A,
  SLOT_B,
  SLOT_C,
  SLOT_FLAG,
  SLOT_KIND,
  SLOT_LENGTH,
  SPINS,
  TEXT_CAPACITY,
  TEXT_OFFSET,
  W_CLOSE,
  W_FAIL,
  W_OPEN,
  W_REPLY,
  W_TASK,
} from '@/code/intelligence/sandbox/protocol'

/** how long the worker may stay silent before the channel gives up */
const SILENCE_MS = 600_000
/** one wait on the flag, so silence is measured in steps, never by a clock */
const WAIT_STEP_MS = 50

/** A request from a candidate: kind, two integers and text. The handler answers through `Reply`. */
export interface Request { kind: number; a: number; b: number; text: () => string }

export interface Reply {
  number: (value: number) => void
  /** an absent value (a table miss, no links) */
  none: () => void
  /** a new state handle with its bytes and key */
  handle: (handle: number, bytes: number, key: string) => void
  text: (value: string) => void
  /** refuse the request: the candidate's call throws */
  fail: (reason: string) => void
}

export type Handler = (request: Request, reply: Reply) => void

/** A candidate's failure: it threw, or answered with something that is not data. */
export class CandidateError extends Error {}

class Channel {
  readonly ints: Int32Array
  readonly number: Float64Array
  readonly text: Uint16Array
  readonly worker: Worker
  readonly sent = new Set<string>()
  busy = false
  nextSession = 1
  /** requests served and sessions opened, for the cost of isolation */
  served = 0
  sessions = 0

  constructor() {
    const buffer = new SharedArrayBuffer(BUFFER_BYTES)

    this.ints = new Int32Array(buffer, 0, INT_SLOTS)
    this.number = new Float64Array(buffer, NUMBER_OFFSET, 1)
    this.text = new Uint16Array(buffer, TEXT_OFFSET, TEXT_CAPACITY)
    this.worker = new Worker(hostScript(), {
      eval: true,
      workerData: buffer,
      env: {},
      stdout: false,
      stderr: false,
      resourceLimits: { maxOldGenerationSizeMb: 4096 },
    })
    this.worker.unref()

    if (this.awaitWorker() !== R_READY) {
      throw new Error(`sandbox: the worker did not start: ${this.readText()}`)
    }
  }

  readText(): string {
    const length = this.ints[SLOT_LENGTH]!
    const parts: string[] = []

    for (let start = 0; start < length; start += 4096) {
      parts.push(String.fromCharCode.apply(null, Array.from(this.text.subarray(start, Math.min(length, start + 4096)))))
    }

    return parts.join('')
  }

  writeText(value: string): void {
    if (value.length > TEXT_CAPACITY) {
      throw new Error(`sandbox: a message of ${value.length} code units is over the capacity`)
    }

    for (let index = 0; index < value.length; index++) {
      this.text[index] = value.charCodeAt(index)
    }

    this.ints[SLOT_LENGTH] = value.length
  }

  /** Wait until the worker has written a message; returns its kind. */
  awaitWorker(): number {
    const ints = this.ints

    for (let spin = 0; spin < SPINS; spin++) {
      if (Atomics.load(ints, SLOT_FLAG) === FLAG_TO_PARENT) {
        return ints[SLOT_KIND]!
      }
    }

    // wait on the value just read (a write between the read and the wait returns at once); count only real time-outs
    for (let waited = 0, now = Atomics.load(ints, SLOT_FLAG); now !== FLAG_TO_PARENT; now = Atomics.load(ints, SLOT_FLAG)) {
      if (waited > SILENCE_MS) {
        throw new Error(`sandbox: the worker was silent for ${SILENCE_MS} ms`)
      }

      if (Atomics.wait(ints, SLOT_FLAG, now, WAIT_STEP_MS) === 'timed-out') {
        waited += WAIT_STEP_MS
      }
    }

    return ints[SLOT_KIND]!
  }

  post(kind: number, a: number, text: string | null): void {
    this.ints[SLOT_KIND] = kind
    this.ints[SLOT_A] = a
    this.ints[SLOT_B] = 0
    this.ints[SLOT_C] = 0

    if (text === null) {
      this.ints[SLOT_LENGTH] = 0
    } else {
      this.writeText(text)
    }

    Atomics.store(this.ints, SLOT_FLAG, FLAG_TO_WORKER)
    Atomics.notify(this.ints, SLOT_FLAG)
  }

  /** Send a message and serve the candidate's requests until it answers; the answer's text. */
  exchange(kind: number, a: number, text: string | null, handler: Handler | null): string {
    if (this.busy) {
      throw new Error('sandbox: a task is already outstanding (no candidate runs inside another)')
    }

    this.busy = true

    try {
      this.post(kind, a, text)

      const ints = this.ints
      const number = this.number
      const readText = (): string => this.readText()
      const writeText = (value: string): void => this.writeText(value)
      const request: Request = { kind: 0, a: 0, b: 0, text: readText }
      let answered = false
      const answer = (): void => {
        answered = true
        Atomics.store(ints, SLOT_FLAG, FLAG_TO_WORKER)
        Atomics.notify(ints, SLOT_FLAG)
      }
      const reply: Reply = {
        number(value) {
          ints[SLOT_KIND] = W_REPLY
          ints[SLOT_C] = 0
          number[0] = value
          answer()
        },
        none() {
          ints[SLOT_KIND] = W_REPLY
          ints[SLOT_C] = 1
          answer()
        },
        handle(handle, bytes, key) {
          ints[SLOT_KIND] = W_REPLY
          ints[SLOT_A] = handle
          ints[SLOT_C] = 0
          number[0] = bytes
          writeText(key)
          answer()
        },
        text(value) {
          ints[SLOT_KIND] = W_REPLY
          ints[SLOT_C] = 0
          writeText(value)
          answer()
        },
        fail(reason) {
          ints[SLOT_KIND] = W_FAIL
          writeText(reason)
          answer()
        },
      }

      for (;;) {
        const got = this.awaitWorker()

        if (got === R_DONE) {
          return this.readText()
        }

        if (got === R_ERROR) {
          throw new CandidateError(this.readText())
        }

        if (handler === null) {
          throw new CandidateError(`a request of kind ${got} where none may be made`)
        }

        this.served++
        request.kind = got
        request.a = ints[SLOT_A]!
        request.b = ints[SLOT_B]!
        answered = false

        try {
          handler(request, reply)
        } catch (error) {
          if (!answered) {
            reply.fail(error instanceof Error ? error.message : String(error))
          }
        }

        if (!answered) {
          reply.fail('the evaluator gave no answer')
        }
      }
    } finally {
      this.busy = false
    }
  }
}

let channel: Channel | null = null

function theChannel(): Channel {
  channel ??= new Channel()

  return channel
}

/** One candidate in its own fresh context. */
export interface Session {
  readonly id: number
  /** run one task (JSON text) and serve its requests; the answer, parsed */
  task: (task: unknown, handler: Handler | null) => unknown
  close: () => void
}

/** Open a session on a bundle; a bundle that will not load (its module code throws) throws a CandidateError. */
export function openSession(bundle: Bundle): Session {
  const wire = theChannel()
  const id = wire.nextSession++
  const message = wire.sent.has(bundle.id) ? { id: bundle.id } : { id: bundle.id, code: bundle.code }

  wire.exchange(W_OPEN, id, JSON.stringify(message), null)
  wire.sent.add(bundle.id)
  wire.sessions++

  let open = true

  return {
    id,
    task(task, handler) {
      if (!open) {
        throw new Error(`sandbox: session ${id} is closed`)
      }

      const answer = wire.exchange(W_TASK, id, JSON.stringify(task), handler)

      try {
        return JSON.parse(answer) as unknown
      } catch {
        throw new CandidateError('the candidate answered with text that is not data')
      }
    },
    close() {
      if (open) {
        open = false
        wire.exchange(W_CLOSE, id, null, null)
      }
    },
  }
}

/** Requests served and sessions opened so far: the cost of isolation, in messages. */
export function isolationCounts(): { requests: number; sessions: number } {
  return channel === null ? { requests: 0, sessions: 0 } : { requests: channel.served, sessions: channel.sessions }
}
