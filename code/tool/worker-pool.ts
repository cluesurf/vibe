// Deterministic multi-core worker pool built on Node's worker_threads.
//
// Maps a readonly list of independent inputs across a bounded pool of worker
// threads (capped by default at max(1, min(cpus - 2, 8)) so laptops stay
// responsive) and returns results in the exact input index order regardless of
// worker completion order. Supports structured-cloneable payloads and
// zero-copy ArrayBuffer transfer in both directions, forwards tsx's TypeScript
// loader and tsconfig configuration to workers, and terminates every worker
// cleanly on completion or failure so the event loop never hangs.

import { createRequire } from 'node:module'
import { cpus } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  Worker,
  isMainThread,
  parentPort,
  type TransferListItem,
} from 'node:worker_threads'

export type MapParallelOptions<T = unknown> = {
  // Maximum concurrent workers. Defaults to max(1, min(cpus - 2, 8)).
  maxWorkers?: number
  // Additional environment variables merged on top of process.env.
  env?: Record<string, string>
  // Transfer ArrayBuffers from main thread to worker without copying.
  // Pass true to auto-collect owned ArrayBuffers from each item, or a
  // selector returning the exact transferList for that item.
  transfer?:
    | boolean
    | ((item: T, index: number) => readonly TransferListItem[])
}

export type WorkerHandlerOptions = {
  // Automatically transfer owned ArrayBuffers in returned values back to
  // the main thread with zero-copy IPC. Defaults to true.
  transferOutput?: boolean
}

type SerializedError = {
  name: string
  message: string
  stack?: string
}

type MainToWorkerMessage<T> =
  | { type: 'task'; index: number; item: T }
  | { type: 'shutdown' }

type WorkerToMainMessage<R> =
  | { type: 'result'; index: number; value: R }
  | { type: 'error'; index: number; error: SerializedError }

const TS_EXTENSIONS = new Set(['.ts', '.mts', '.cts'])

const VALUE_FLAGS = new Set([
  '--import',
  '--loader',
  '--experimental-loader',
  '--require',
  '-r',
  '--conditions',
  '-C',
  '--disable-warning',
  '--no-warnings',
])

const FLAG_PREFIXES = [
  '--import=',
  '--loader=',
  '--experimental-loader=',
  '--require=',
  '--conditions=',
  '--disable-warning=',
  '--no-warnings=',
  '--enable-source-maps',
  '--experimental-strip-types',
  '--no-experimental-strip-types',
]

export function defaultMaxWorkers(): number {
  return Math.max(1, Math.min(cpus().length - 2, 8))
}

function resolveWorkerScript(workerScript: string): string {
  if (workerScript.startsWith('file://')) {
    return fileURLToPath(workerScript)
  }

  return path.resolve(workerScript)
}

function buildWorkerExecArgv(resolvedScript: string): string[] {
  const forwarded: string[] = []
  const argv = process.execArgv

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === undefined) {
      continue
    }

    if (VALUE_FLAGS.has(arg)) {
      const next = argv[i + 1]

      if (arg === '--no-warnings') {
        forwarded.push(arg)
        continue
      }

      if (next !== undefined && !next.startsWith('-')) {
        forwarded.push(arg, next)
        i++
      }

      continue
    }

    if (FLAG_PREFIXES.some(prefix => arg.startsWith(prefix))) {
      forwarded.push(arg)
    }
  }

  const ext = path.extname(resolvedScript).toLowerCase()

  if (TS_EXTENSIONS.has(ext)) {
    const hasTsxLoader = forwarded.some(arg =>
      arg.toLowerCase().includes('tsx'),
    )

    if (!hasTsxLoader) {
      const req = createRequire(import.meta.url)

      try {
        const tsxLoader = req.resolve('tsx')

        forwarded.push('--import', pathToFileURL(tsxLoader).href)
      } catch {
        // Fall back to Node's native TypeScript execution when tsx is absent.
      }
    }
  }

  return forwarded
}

function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value)

  return proto === null || proto === Object.prototype
}

// Collect unique, owned ArrayBuffers from a structured payload for zero-copy
// postMessage transfer. Views that slice a shared slab (such as pooled Node
// Buffers or subarrays with byteOffset > 0 or partial byteLength) are skipped
// so unrelated views are never detached.
export function collectTransferables(value: unknown): ArrayBuffer[] {
  const found = new Set<ArrayBuffer>()
  const seen = new WeakSet<object>()

  const visit = (node: unknown): void => {
    if (node === null || typeof node !== 'object') {
      return
    }

    if (node instanceof ArrayBuffer) {
      if (node.byteLength > 0) {
        found.add(node)
      }

      return
    }

    if (ArrayBuffer.isView(node)) {
      const buf = node.buffer

      if (
        buf instanceof ArrayBuffer &&
        buf.byteLength > 0 &&
        node.byteOffset === 0 &&
        node.byteLength === buf.byteLength
      ) {
        found.add(buf)
      }

      return
    }

    if (seen.has(node)) {
      return
    }

    seen.add(node)

    if (Array.isArray(node)) {
      for (const entry of node) {
        visit(entry)
      }

      return
    }

    if (node instanceof Map) {
      for (const [k, v] of node.entries()) {
        visit(k)
        visit(v)
      }

      return
    }

    if (node instanceof Set) {
      for (const entry of node.values()) {
        visit(entry)
      }

      return
    }

    if (isPlainObject(node)) {
      for (const entry of Object.values(node)) {
        visit(entry)
      }
    }
  }

  visit(value)

  return Array.from(found)
}

function dedupeTransferList(
  list: readonly TransferListItem[],
): TransferListItem[] {
  if (list.length <= 1) {
    return list.length === 1 && list[0] !== undefined ? [list[0]] : []
  }

  return Array.from(new Set(list))
}

function serializeError(err: unknown): SerializedError {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  }

  return {
    name: 'Error',
    message: String(err),
  }
}

function deserializeError(serialized: SerializedError, index: number): Error {
  const err = new Error(serialized.message)

  err.name = serialized.name || 'Error'

  if (serialized.stack) {
    err.stack = `Worker task #${index} failed: ${serialized.stack}`
  }

  return err
}

export async function mapParallel<T, R>(
  items: readonly T[],
  workerScript: string,
  options?: MapParallelOptions<T>,
): Promise<R[]> {
  if (items.length === 0) {
    return []
  }

  let requestedMax = defaultMaxWorkers()

  if (options?.maxWorkers !== undefined) {
    if (!Number.isFinite(options.maxWorkers) || options.maxWorkers < 1) {
      throw new RangeError(
        `worker-pool: maxWorkers must be a finite integer >= 1 (got ${options.maxWorkers})`,
      )
    }

    requestedMax = Math.floor(options.maxWorkers)
  }

  const workerCount = Math.max(1, Math.min(requestedMax, items.length))
  const resolvedScript = resolveWorkerScript(workerScript)
  const execArgv = buildWorkerExecArgv(resolvedScript)
  const env: NodeJS.ProcessEnv = options?.env
    ? { ...process.env, ...options.env }
    : { ...process.env }

  return new Promise<R[]>((resolve, reject) => {
    const results = new Array<R>(items.length)
    const workers: Worker[] = []
    const activeTaskByWorker = new Map<Worker, number>()

    let nextIndex = 0
    let completed = 0
    let settled = false
    let shuttingDown = false

    const terminateAll = async (): Promise<void> => {
      if (shuttingDown) {
        return
      }

      shuttingDown = true

      for (const worker of workers) {
        try {
          const msg: MainToWorkerMessage<T> = { type: 'shutdown' }

          worker.postMessage(msg)
        } catch {
          // Worker may already be exiting or terminated.
        }
      }

      await Promise.allSettled(workers.map(worker => worker.terminate()))
    }

    const fail = (err: Error): void => {
      if (settled) {
        return
      }

      settled = true

      void terminateAll().finally(() => {
        reject(err)
      })
    }

    const succeed = (): void => {
      if (settled) {
        return
      }

      settled = true

      void terminateAll().finally(() => {
        resolve(results)
      })
    }

    const dispatchNext = (worker: Worker): void => {
      if (settled) {
        return
      }

      if (nextIndex >= items.length) {
        activeTaskByWorker.delete(worker)

        return
      }

      const index = nextIndex++
      const item = items[index] as T

      activeTaskByWorker.set(worker, index)

      const message: MainToWorkerMessage<T> = {
        type: 'task',
        index,
        item,
      }

      let transferList: TransferListItem[] | undefined

      if (options?.transfer === true) {
        const collected = collectTransferables(item)

        if (collected.length > 0) {
          transferList = collected
        }
      } else if (typeof options?.transfer === 'function') {
        const selected = dedupeTransferList(options.transfer(item, index))

        if (selected.length > 0) {
          transferList = selected
        }
      }

      try {
        if (transferList && transferList.length > 0) {
          worker.postMessage(message, transferList)
        } else {
          worker.postMessage(message)
        }
      } catch (err) {
        fail(err instanceof Error ? err : new Error(String(err)))
      }
    }

    try {
      for (let w = 0; w < workerCount; w++) {
        const worker = new Worker(resolvedScript, {
          execArgv,
          env,
        })

        workers.push(worker)

        worker.on('message', (msg: WorkerToMainMessage<R>) => {
          if (settled) {
            return
          }

          if (msg.type === 'result') {
            results[msg.index] = msg.value
            activeTaskByWorker.delete(worker)
            completed++

            if (completed === items.length) {
              succeed()
            } else {
              dispatchNext(worker)
            }

            return
          }

          if (msg.type === 'error') {
            fail(deserializeError(msg.error, msg.index))
          }
        })

        worker.on('error', err => {
          fail(err instanceof Error ? err : new Error(String(err)))
        })

        worker.on('exit', code => {
          if (settled) {
            return
          }

          const activeIndex = activeTaskByWorker.get(worker)

          if (code !== 0 || activeIndex !== undefined) {
            const suffix =
              activeIndex !== undefined
                ? ` while executing task #${activeIndex}`
                : ''

            fail(
              new Error(
                `worker-pool: worker exited unexpectedly with code ${code}${suffix}`,
              ),
            )
          }
        })

        dispatchNext(worker)
      }
    } catch (err) {
      fail(err instanceof Error ? err : new Error(String(err)))
    }
  })
}

export function runWorkerHandler<T, R>(
  fn: (item: T) => R | Promise<R>,
  options?: WorkerHandlerOptions,
): void {
  if (isMainThread || !parentPort) {
    return
  }

  const port = parentPort
  const transferOutput = options?.transferOutput ?? true

  port.on('message', (msg: MainToWorkerMessage<T>) => {
    if (msg.type === 'shutdown') {
      port.close()

      return
    }

    if (msg.type !== 'task') {
      return
    }

    void (async () => {
      try {
        const value = await fn(msg.item)
        const response: WorkerToMainMessage<R> = {
          type: 'result',
          index: msg.index,
          value,
        }
        const transferList = transferOutput
          ? collectTransferables(value)
          : []

        if (transferList.length > 0) {
          port.postMessage(response, transferList)
        } else {
          port.postMessage(response)
        }
      } catch (err) {
        const response: WorkerToMainMessage<R> = {
          type: 'error',
          index: msg.index,
          error: serializeError(err),
        }

        port.postMessage(response)
      }
    })()
  })
}
