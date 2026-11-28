/**
 * The worker's own loop: it opens a fresh context for each candidate
 * session, runs the session's bundle in it, hands each task to the
 * context's entry, and closes the context when the evaluator says so.
 *
 * A context is a new realm (vm, not contextified) with code generation from
 * strings and WebAssembly off. The only thing of this realm it ever holds is
 * the shared buffer, stripped of its prototype; the entry is called with no
 * arguments. Before any candidate runs, the worker drops what an escape into
 * this realm could reach for (the builtin module loader, process bindings),
 * as a second line behind the context.
 *
 * It runs from a bundle (sandbox/bundle.ts, `hostScript`) in a worker made
 * with an empty environment; only it may require node builtins.
 */

import * as vm from 'node:vm'
import * as threads from 'node:worker_threads'
import {
  FLAG_TO_PARENT,
  FLAG_TO_WORKER,
  INT_SLOTS,
  R_DONE,
  R_ERROR,
  R_READY,
  SLOT_A,
  SLOT_ANSWERS,
  SLOT_FLAG,
  SLOT_KIND,
  SLOT_LENGTH,
  SPINS,
  TEXT_CAPACITY,
  TEXT_OFFSET,
  W_CLOSE,
  W_OPEN,
  W_TASK,
} from '@/code/intelligence/sandbox/protocol'

const buffer = threads.workerData as SharedArrayBuffer
const ints = new Int32Array(buffer, 0, INT_SLOTS)
const text = new Uint16Array(buffer, TEXT_OFFSET, TEXT_CAPACITY)

const scripts = new Map<string, vm.Script>()
const entries = new Map<number, () => void>()

// the buffer a context receives carries no prototype, so nothing on it leads back to this realm
const shared = buffer
Object.setPrototypeOf(shared, null)

function readText(): string {
  const length = ints[SLOT_LENGTH]!
  const parts: string[] = []

  for (let start = 0; start < length; start += 4096) {
    parts.push(String.fromCharCode.apply(null, Array.from(text.subarray(start, Math.min(length, start + 4096)))))
  }

  return parts.join('')
}

function reply(kind: number, message: string): void {
  const length = Math.min(message.length, TEXT_CAPACITY)

  for (let index = 0; index < length; index++) {
    text[index] = message.charCodeAt(index)
  }

  ints[SLOT_LENGTH] = length
  ints[SLOT_KIND] = kind
  Atomics.store(ints, SLOT_FLAG, FLAG_TO_PARENT)
  Atomics.notify(ints, SLOT_FLAG)
}

function waitForParent(): void {
  for (let spin = 0; spin < SPINS; spin++) {
    if (Atomics.load(ints, SLOT_FLAG) === FLAG_TO_WORKER) {
      return
    }
  }

  // wait on the value just read: if the parent writes between the read and the wait, the wait returns at once
  for (let now = Atomics.load(ints, SLOT_FLAG); now !== FLAG_TO_WORKER; now = Atomics.load(ints, SLOT_FLAG)) {
    Atomics.wait(ints, SLOT_FLAG, now)
  }
}

function open(session: number, message: { id: string; code?: string }): void {
  let script = scripts.get(message.id)

  if (script === undefined) {
    if (message.code === undefined) {
      throw new Error(`no code for bundle ${message.id}`)
    }

    script = new vm.Script(message.code, { filename: message.id })
    scripts.set(message.id, script)
  }

  const context = vm.createContext(vm.constants.DONT_CONTEXTIFY, {
    codeGeneration: { strings: false, wasm: false },
  }) as Record<string, unknown>
  const start = script.runInContext(context) as (buffer: SharedArrayBuffer) => void

  start(shared)

  const entry = Object.getOwnPropertyDescriptor(context, '__entry')?.value as unknown

  if (typeof entry !== 'function') {
    throw new Error('the bundle published no entry')
  }

  entries.set(session, entry as () => void)
}

/** What an escape from a context into this realm could reach for, removed before any candidate runs. */
function strip(): void {
  const host = process as unknown as Record<string, unknown>

  for (const name of ['getBuiltinModule', 'binding', '_linkedBinding', 'dlopen', 'chdir', 'kill', 'exit', 'abort']) {
    try {
      Object.defineProperty(host, name, { value: undefined, configurable: false, writable: false })
    } catch {
      // a property the platform will not redefine stays as it is
    }
  }
}

strip()
reply(R_READY, '')

for (;;) {
  waitForParent()

  const kind = ints[SLOT_KIND]!
  const session = ints[SLOT_A]!
  // only this thread writes the answer count, so it tells whether a task was answered without racing the parent
  const answers = ints[SLOT_ANSWERS]!

  try {
    if (kind === W_OPEN) {
      open(session, JSON.parse(readText()) as { id: string; code?: string })
      reply(R_DONE, '')
    } else if (kind === W_TASK) {
      const entry = entries.get(session)

      if (entry === undefined) {
        reply(R_ERROR, `no open session ${session}`)
      } else {
        entry()

        // the entry replies itself; one that returned without replying is an error
        if (ints[SLOT_ANSWERS] === answers) {
          reply(R_ERROR, 'the candidate returned without an answer')
        }
      }
    } else if (kind === W_CLOSE) {
      entries.delete(session)
      reply(R_DONE, '')
    } else {
      reply(R_ERROR, `unknown message ${kind}`)
    }
  } catch (error) {
    if (ints[SLOT_ANSWERS] === answers) {
      reply(R_ERROR, error instanceof Error ? error.message : String(error))
    }
  }
}
