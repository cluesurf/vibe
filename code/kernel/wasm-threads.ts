// THE KERNEL'S wasm BACKEND WITH THREADS: the Rust crate kernel/ built for wasm32 with atomics and a SHARED memory
// (task/kernel/build.ts wasm-threads writes kernel/host/vibe-kernel-threads.wasm), one instance on this thread and one
// on each worker_thread, every instance over the same memory. code/kernel/
//
// The route, since wasm32-unknown-unknown has no thread spawning of its own: the module imports its memory, so N
// instances can share one; each worker instance gets its own stack (a region vk_alloc hands out, written into the
// exported __stack_pointer) and its own thread-local block (__wasm_init_tls), and the shared data segments are
// initialized once (the linker guards them with an atomic flag). A call writes the primitive's number and arguments
// into a shared control block, wakes the workers with Atomics.notify, computes range 0 itself, and waits for the rest:
// the same fixed split of rows as the native pool (k * rows / parts), so the same bytes.
//
// Arrays allocated with alloc() live in the module's memory and are passed with no copy; any other array is copied in
// and, when it is an output, back out, as the single-threaded wasm backend does.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'
import { holePairShape, holeRowsShape } from '@/code/kernel/holes'
import type { Kernel, PairOp, PairTables } from '@/code/kernel/types'

export const WASM_THREADS_PATH = fileURLToPath(new URL('../../kernel/host/vibe-kernel-threads.wasm', import.meta.url))

export const wasmThreadsAvailable = (): boolean => existsSync(WASM_THREADS_PATH)

// the exports a worker may run, by number in the control block
const FNS = [
  'vk_conv',
  'vk_pair_beat',
  'vk_cross_apply',
  'vk_block_add',
  'vk_block_inner',
  'vk_axpy',
  'vk_scale',
  'vk_sea_piece',
  'vk_sea_stream',
  'vk_phase_sum',
  'vk_hole_one_body',
  'vk_hole_band',
  'vk_hole_pair',
] as const

type Fn = (typeof FNS)[number]

type Exports = {
  [K in Fn]: (...a: number[]) => void
} & {
  vk_alloc(bytes: number): number
  vk_free(ptr: number, bytes: number): void
  vk_pair_op(...a: number[]): number
  __stack_pointer: WebAssembly.Global
  __wasm_init_tls?: (ptr: number) => void
  __tls_size?: WebAssembly.Global
  __tls_align?: WebAssembly.Global
}

// vk_hole_pair takes 27 before its row range
const MAX_ARGS = 32
const STACK = 1 << 20

// control block: [0] generation, [1] remaining, [2] function, [3] parts, [4] rows, [5] argument count
const WORKER = `
const { workerData } = require('node:worker_threads')
const { module, memory, ctrl, args, id, stackTop, tls, fns, born } = workerData
const inst = new WebAssembly.Instance(module, { env: { memory } })
const ex = inst.exports
ex.__stack_pointer.value = stackTop
if (ex.__wasm_init_tls && tls) ex.__wasm_init_tls(tls)
const table = fns.map(n => ex[n])
let seen = born
for (;;) {
  Atomics.wait(ctrl, 0, seen)
  const gen = Atomics.load(ctrl, 0)
  if (gen === seen) continue
  seen = gen
  const parts = ctrl[3]
  if (id < parts) {
    const rows = ctrl[4]
    const n = ctrl[5]
    const a = Array.from(args.subarray(0, n))
    table[ctrl[2]](...a, Math.floor((id * rows) / parts), Math.floor(((id + 1) * rows) / parts))
  }
  // every worker acknowledges every call, working or not, so the main thread never writes the next call's parameters
  // while a worker may still be reading this one's
  if (Atomics.sub(ctrl, 1, 1) === 1) Atomics.notify(ctrl, 1)
}
`

type Typed = Float64Array | Int32Array | Int16Array | Int8Array

type Pool = {
  ex: Exports
  memory: WebAssembly.Memory
  buffers: WeakSet<ArrayBufferLike>
  ctrl: Int32Array
  args: Float64Array
  workers: Worker[]
  module: WebAssembly.Module
}

let pool: Pool | null = null

function start(): Pool {
  if (pool) {
    return pool
  }

  if (!wasmThreadsAvailable()) {
    throw new Error(`vibe kernel: no threaded wasm build at ${WASM_THREADS_PATH}; run pnpm call task/kernel/build.ts wasm-threads`)
  }

  const module = new WebAssembly.Module(readFileSync(WASM_THREADS_PATH))
  const need = WebAssembly.Module.imports(module).find(i => i.kind === 'memory')

  if (!need) {
    throw new Error('vibe kernel: the threaded wasm build does not import its memory')
  }

  const memory = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: true })
  const ex = new WebAssembly.Instance(module, { env: { memory } }).exports as unknown as Exports

  // this thread's instance keeps the linker's stack; it gets its own thread-local block like every worker
  if (ex.__wasm_init_tls && ex.__tls_size && Number(ex.__tls_size.value) > 0) {
    ex.__wasm_init_tls(ex.vk_alloc(Number(ex.__tls_size.value)))
  }

  pool = {
    ex,
    memory,
    buffers: new WeakSet([memory.buffer]),
    ctrl: new Int32Array(new SharedArrayBuffer(4 * 8)),
    args: new Float64Array(new SharedArrayBuffer(8 * MAX_ARGS)),
    workers: [],
    module,
  }

  return pool
}

function grow(p: Pool, threads: number): void {
  while (p.workers.length + 1 < threads) {
    const id = p.workers.length + 1
    const stack = p.ex.vk_alloc(STACK)
    const tlsSize = p.ex.__tls_size ? Number(p.ex.__tls_size.value) : 0
    const tls = tlsSize > 0 ? p.ex.vk_alloc(tlsSize) : 0
    const w = new Worker(WORKER, {
      eval: true,
      workerData: {
        module: p.module,
        memory: p.memory,
        ctrl: p.ctrl,
        args: p.args,
        id,
        stackTop: stack + STACK,
        tls,
        fns: FNS,
        // the generation at birth, so a worker started after earlier calls does not rerun the last one
        born: Atomics.load(p.ctrl, 0),
      },
    })

    w.unref()
    p.workers.push(w)
  }
}

// a Float64Array view of the module's memory (valid after the memory grows: a shared buffer is never detached)
function view(p: Pool, ptr: number, n: number): Float64Array {
  const buffer = p.memory.buffer

  p.buffers.add(buffer)

  return new Float64Array(buffer, ptr, n)
}

// an allocation is freed when its view is collected (FinalizationRegistry is ES2021, past this project's lib setting,
// so it is read off globalThis). A finalizer runs as its own task, never inside a kernel call, so no worker is using
// the allocator then
type Held = { ptr: number; bytes: number }
type Registry = { register(target: object, held: Held): void }

const RegistryOf = (globalThis as unknown as { FinalizationRegistry: new (free: (h: Held) => void) => Registry })
  .FinalizationRegistry

let registry: Registry | null = null

function allocView(p: Pool, n: number): Float64Array {
  registry ??= new RegistryOf(h => p.ex.vk_free(h.ptr, h.bytes))

  const ptr = p.ex.vk_alloc(8 * n)
  const out = view(p, ptr, n)

  registry.register(out, { ptr, bytes: 8 * n })

  return out
}

export function wasmThreadsKernel(threads: number): Kernel & { alloc(n: number): Float64Array } {
  const p = start()
  const n = Math.max(1, Math.min(64, Math.floor(threads)))

  grow(p, n)

  const run = (fn: Fn, args: number[], rows: number, grain: number): void => {
    const most = grain > 0 ? Math.ceil(rows / grain) : rows
    const parts = Math.max(1, Math.min(n, most))
    const f = p.ex[fn]

    if (parts <= 1) {
      f(...args, 0, rows)
      return
    }

    p.args.set(args)
    p.ctrl[2] = FNS.indexOf(fn)
    p.ctrl[3] = parts
    p.ctrl[4] = rows
    p.ctrl[5] = args.length
    // every worker in the pool acknowledges (not only the parts - 1 that work), see WORKER
    Atomics.store(p.ctrl, 1, p.workers.length)
    Atomics.add(p.ctrl, 0, 1)
    Atomics.notify(p.ctrl, 0)
    f(...args, 0, Math.floor(rows / parts))

    for (;;) {
      const left = Atomics.load(p.ctrl, 1)

      if (left === 0) {
        break
      }

      Atomics.wait(p.ctrl, 1, left)
    }
  }

  // an array's address in the module: its own when it lives there, else a copy (copied back after, if an output)
  const call = (arrays: Typed[], outputs: number[], body: (ptrs: number[]) => void): void => {
    const placed: { ptr: number; copy: boolean }[] = arrays.map(a => {
      if (p.buffers.has(a.buffer)) {
        return { ptr: a.byteOffset, copy: false }
      }

      const ptr = p.ex.vk_alloc(a.byteLength)

      new Uint8Array(p.memory.buffer, ptr, a.byteLength).set(new Uint8Array(a.buffer, a.byteOffset, a.byteLength))

      return { ptr, copy: true }
    })

    try {
      body(placed.map(x => x.ptr))
      outputs.forEach(k => {
        if (placed[k]!.copy) {
          ;(arrays[k] as Float64Array).set(new Float64Array(p.memory.buffer, placed[k]!.ptr, arrays[k]!.length))
        }
      })
    } finally {
      placed.forEach((x, k) => {
        if (x.copy) {
          p.ex.vk_free(x.ptr, arrays[k]!.byteLength)
        }
      })
    }
  }

  return {
    backend: 'wasm-threads',
    threads: n,
    alloc: (count: number): Float64Array => allocView(p, count),
    pairOp: (t: PairTables): PairOp => {
      const place = (a: Typed): number => {
        const ptr = p.ex.vk_alloc(a.byteLength)

        new Uint8Array(p.memory.buffer, ptr, a.byteLength).set(new Uint8Array(a.buffer, a.byteOffset, a.byteLength))

        return ptr
      }
      const tables = [
        t.plusRep,
        t.plusG,
        t.minusRep,
        t.minusG,
        t.src,
        t.sgn,
        t.off,
        t.row,
        t.col,
        t.val,
        t.offT,
        t.rowT,
        t.colT,
        t.valT,
        t.halfRe,
        t.halfIm,
      ].map(place)

      return { count: t.plusRep.length / 24, tables: t, wasm: p.ex.vk_pair_op(t.plusRep.length / 24, t.src.length / 256, ...tables) }
    },
    conv: (op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger) =>
      call([srcRe, srcIm, outRe, outIm], [2, 3], q =>
        run('vk_conv', [op.wasm!, q[0]!, q[1]!, srcOff, srcStride, t, q[2]!, q[3]!, member, dagger ? 1 : 0], op.count, 4),
      ),
    pairBeat: (re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff) =>
      call([re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta], [0, 1], q =>
        run('vk_pair_beat', [...q, alr, ali, mainOff], beta.length / 2, 16),
      ),
    crossApply: (re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own) =>
      call([re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross], [0, 1], q => run('vk_cross_apply', [...q, own], cross.length / 2, 16)),
    blockAdd: (outRe, outIm, fr, fi, off) =>
      call([outRe, outIm, fr, fi], [0, 1], q => run('vk_block_add', [...q, off], outRe.length / 256, 64)),
    blockInner: (aRe, aIm, bRe, bIm, partRe, partIm) =>
      call([aRe, aIm, bRe, bIm, partRe, partIm], [4, 5], q => run('vk_block_inner', q, partRe.length, 64)),
    axpy: (yRe, yIm, xRe, xIm, fr, fi) =>
      call([yRe, yIm, xRe, xIm], [0, 1], q => run('vk_axpy', [...q, fr, fi], yRe.length, 1 << 14)),
    scale: (re, im, f) => call([re, im], [0, 1], q => run('vk_scale', [...q, f], re.length, 1 << 14)),
    seaPiece: (re, im, E, alpha, beta, phase) =>
      call(phase ? [re, im, E, alpha, beta, phase] : [re, im, E, alpha, beta], [0, 1], q =>
        run('vk_sea_piece', [q[0]!, q[1]!, q[2]!, q[3]!, q[4]!, phase ? q[5]! : 0], alpha.length / 2, 1),
      ),
    seaStream: (sRe, sIm, oRe, oIm, move, opposite) =>
      call([sRe, sIm, oRe, oIm, move, opposite], [2, 3], q => run('vk_sea_stream', q, sRe.length / (192 * 192), 1)),
    phaseSum: (re, im, c, s, width, mRe, mIm) =>
      call([re, im, c, s, mRe, mIm], [4, 5], q =>
        run('vk_phase_sum', [q[0]!, q[1]!, q[2]!, q[3]!, c.length, width, q[4]!, q[5]!], width, 1024),
      ),
    holeOneBody: (re, im, mom, nh, f, aRe, aIm) => {
      const rows = holeRowsShape(re, im, mom, nh, f, aRe, aIm)

      call([re, im, mom, aRe, aIm], [0, 1], q =>
        run('vk_hole_one_body', [q[0]!, q[1]!, q[2]!, nh, f, q[3]!, q[4]!], rows, 1),
      )
    },
    holeBand: (re, im, mom, nh, f, pRe, pIm, part) => {
      const rows = holeRowsShape(re, im, mom, nh, f, pRe, pIm)

      if (part.length !== rows * nh) {
        throw new Error('vibe kernel: holeBand part size')
      }

      call([re, im, mom, pRe, pIm, part], [5], q =>
        run('vk_hole_band', [q[0]!, q[1]!, q[2]!, nh, f, q[3]!, q[4]!, q[5]!], rows, 1),
      )
    },
    holePair: (re, im, F, P, ph) => {
      const sh = holePairShape(re, im, F, P, ph)
      const arrays: Typed[] = [
        re,
        im,
        F.classOfGrid,
        F.gridOfSite,
        F.gridOfClass,
        F.cos,
        F.sin,
        P.rowOf,
        P.permOf,
        P.psign,
        P.fbOf,
        P.pattern,
        P.writeOff,
        P.writeC,
        P.writeTau,
        P.tOf,
        ph.cos,
        ph.sin,
        ph.skip,
      ]

      call(arrays, [0, 1], q =>
        run(
          'vk_hole_pair',
          [q[0]!, q[1]!, sh.L, sh.N, sh.axes, sh.rows, sh.nperm, F.scales[0]!, F.scales[1]!, ...q.slice(2), sh.block],
          sh.orbits,
          1,
        ),
      )
    },
  }
}
