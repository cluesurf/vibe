// THE KERNEL'S wasm BACKEND: the Rust crate kernel/ built for wasm32 with SIMD128 (task/kernel/build.ts writes it to
// kernel/host/vibe-kernel.wasm). code/kernel/
// One instance, one thread. A call copies its arrays into the module's memory, runs the primitive over all rows, and
// copies the outputs back: an engine's arrays live on the JS heap, and a wasm module can only read its own memory.
// That copy is part of the measured cost. The module's exports take a row range, so the route to threads is several
// instances over one shared memory (see the kernel note); it is not built, because the native backend is faster on this
// machine and needs no copy.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Kernel, PairOp, PairTables } from '@/code/kernel/types'

export const WASM_PATH = fileURLToPath(new URL('../../kernel/host/vibe-kernel.wasm', import.meta.url))

type Exports = {
  memory: WebAssembly.Memory
  vk_alloc(bytes: number): number
  vk_free(ptr: number, bytes: number): void
  vk_pair_op(...a: number[]): number
  vk_conv(...a: number[]): void
  vk_pair_beat(...a: number[]): void
  vk_cross_apply(...a: number[]): void
  vk_block_add(...a: number[]): void
  vk_block_inner(...a: number[]): void
  vk_axpy(...a: number[]): void
  vk_scale(...a: number[]): void
  vk_sea_piece(...a: number[]): void
  vk_sea_stream(...a: number[]): void
  vk_phase_sum(...a: number[]): void
}

type Typed = Float64Array | Int32Array | Int16Array | Int8Array

let wasm: Exports | null = null

export const wasmAvailable = (): boolean => existsSync(WASM_PATH)

function load(): Exports {
  if (!wasm) {
    if (!wasmAvailable()) {
      throw new Error(`vibe kernel: no wasm build at ${WASM_PATH}; run pnpm call task/kernel/build.ts`)
    }

    const module = new WebAssembly.Module(readFileSync(WASM_PATH))

    wasm = new WebAssembly.Instance(module, {}).exports as unknown as Exports
  }

  return wasm
}

// copy an array into the module (a fresh allocation, 16-aligned)
function place(w: Exports, a: Typed): number {
  const p = w.vk_alloc(a.byteLength)

  new Uint8Array(w.memory.buffer, p, a.byteLength).set(new Uint8Array(a.buffer, a.byteOffset, a.byteLength))

  return p
}

function back(w: Exports, p: number, a: Float64Array): void {
  a.set(new Float64Array(w.memory.buffer, p, a.length))
}

// run fn over the placed inputs, copy the listed outputs back, free everything
function call(w: Exports, arrays: Typed[], outputs: number[], fn: (ptrs: number[]) => void): void {
  const ptrs = arrays.map(a => place(w, a))

  try {
    fn(ptrs)
    outputs.forEach(k => back(w, ptrs[k]!, arrays[k] as Float64Array))
  } finally {
    ptrs.forEach((p, k) => w.vk_free(p, arrays[k]!.byteLength))
  }
}

export function wasmKernel(): Kernel {
  const w = load()

  return {
    backend: 'wasm',
    threads: 1,
    pairOp: (t: PairTables): PairOp => {
      // the tables stay in the module for the operator's life (a few hundred kilobytes; never freed)
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
      ].map(a => place(w, a))

      return {
        count: t.plusRep.length / 24,
        tables: t,
        wasm: w.vk_pair_op(t.plusRep.length / 24, t.src.length / 256, ...tables),
      }
    },
    conv: (op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger) =>
      call(w, [srcRe, srcIm, outRe, outIm], [2, 3], p =>
        w.vk_conv(op.wasm!, p[0]!, p[1]!, srcOff, srcStride, t, p[2]!, p[3]!, member, dagger ? 1 : 0, 0, op.count),
      ),
    pairBeat: (re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff) =>
      call(w, [re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta], [0, 1], p =>
        w.vk_pair_beat(...p.slice(0, 13), alr, ali, mainOff, 0, beta.length / 2),
      ),
    crossApply: (re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own) =>
      call(w, [re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross], [0, 1], p =>
        w.vk_cross_apply(...p, own, 0, cross.length / 2),
      ),
    blockAdd: (outRe, outIm, fr, fi, off) =>
      call(w, [outRe, outIm, fr, fi], [0, 1], p => w.vk_block_add(...p, off, 0, outRe.length / 256)),
    blockInner: (aRe, aIm, bRe, bIm, partRe, partIm) =>
      call(w, [aRe, aIm, bRe, bIm, partRe, partIm], [4, 5], p => w.vk_block_inner(...p, 0, partRe.length)),
    axpy: (yRe, yIm, xRe, xIm, fr, fi) =>
      call(w, [yRe, yIm, xRe, xIm], [0, 1], p => w.vk_axpy(...p, fr, fi, 0, yRe.length)),
    scale: (re, im, f) => call(w, [re, im], [0, 1], p => w.vk_scale(...p, f, 0, re.length)),
    seaPiece: (re, im, E, alpha, beta, phase) =>
      call(w, phase ? [re, im, E, alpha, beta, phase] : [re, im, E, alpha, beta], [0, 1], p =>
        w.vk_sea_piece(p[0]!, p[1]!, p[2]!, p[3]!, p[4]!, phase ? p[5]! : 0, 0, alpha.length / 2),
      ),
    seaStream: (sRe, sIm, oRe, oIm, move, opposite) =>
      call(w, [sRe, sIm, oRe, oIm, move, opposite], [2, 3], p =>
        w.vk_sea_stream(...p, 0, sRe.length / (192 * 192)),
      ),
    phaseSum: (re, im, c, s, width, mRe, mIm) =>
      call(w, [re, im, c, s, mRe, mIm], [4, 5], p =>
        w.vk_phase_sum(p[0]!, p[1]!, p[2]!, p[3]!, c.length, width, p[4]!, p[5]!, 0, width),
      ),
  }
}
