// THE KERNEL'S GPU BACKENDS: hip (AMD), cuda (NVIDIA) and gpu-emu (the same kernels on one CPU thread). code/kernel/
// The native addon built with a cargo feature (pnpm call task/kernel/build.ts native hip, or cuda, or emu) carries a GPU
// binding (kernel/src/gpu.rs) that compiles kernel/src/gpu.cu for the device at load and launches it. This file is the
// Kernel on top of it: which arrays live on the device, and when they move.
//
// THREE KINDS OF ARRAY, by what a primitive does with it:
//   held     an array an engine put on the device with Kernel.device.hold (code/kernel/device.ts onDevice): used in
//            place, never copied, until released. An engine's state and scratch across a cycle loop
//   table    an argument that is a TABLE by the primitive's contract (the sea's E, move and opposite, a beat's beta, the
//            cross factor, the holes' momenta, transfers, Fourier, pair and phase tables): uploaded the first time the
//            array is seen and reused by identity after, as the native backend's pairOp copies its tables once. A
//            table must not change after it is first passed (the engines build theirs once and never write them)
//   copied   anything else: uploaded before the call, and downloaded after it when the primitive writes it
// So every primitive is correct on host arrays with no ceremony (the check calls them exactly as it calls native), and
// fast once the engine holds its state.
//
// Index CONTENTS are checked here, on the host copy, before a device ever reads them (the binding checks every size):
// the pair operator's tables by the binding itself, a table's range once when it is first uploaded, and the hole
// primitives' shapes by the same checks the wasm backends run (code/kernel/holes).
//
// Nothing here computes a float: every value a kernel reads was computed in TypeScript or by another kernel.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { holePairShape, holeRowsShape } from '@/code/kernel/holes'
import type { Device, GpuBackend, Kernel, PairOp, PairTables, Typed } from '@/code/kernel/types'

const SOURCE = fileURLToPath(new URL('../../kernel/src/gpu.cu', import.meta.url))
const HOST = fileURLToPath(new URL('../../kernel/host', import.meta.url))

// the FMA control: the kernels compiled WITH contraction, which the check must catch
export const GPU_CONTRACT = process.env.VIBE_KERNEL_GPU_CONTRACT === '1'

type Buf = { readonly gpuBuffer: true }

type GpuAddon = {
  gpuInit(kind: number, contract: number, arg: string): string
  gpuAlloc(bytes: number): Buf
  gpuFree(b: Buf): void
  gpuUpload(b: Buf, a: Typed): void
  gpuDownload(b: Buf, a: Typed): void
  gpuCopy(dst: Buf, src: Buf): void
  gpuPairOp(...tables: Typed[]): unknown
  gpuConv(...a: unknown[]): void
  gpuPairBeat(...a: unknown[]): void
  gpuCrossApply(...a: unknown[]): void
  gpuBlockAdd(...a: unknown[]): void
  gpuBlockInner(...a: unknown[]): void
  gpuAxpy(...a: unknown[]): void
  gpuScale(...a: unknown[]): void
  gpuSeaPiece(...a: unknown[]): void
  gpuSeaStream(...a: unknown[]): void
  gpuPhaseSum(...a: unknown[]): void
  gpuHoleOneBody(...a: unknown[]): void
  gpuHoleBand(...a: unknown[]): void
  gpuHolePair(...a: unknown[]): void
}

// ---- the runtime, once per process ----

let started: { kind: GpuBackend; info: string; addon: GpuAddon } | null = null

// the addon built with a GPU feature is its own file (task/kernel/build.ts native hip writes vibe-kernel-gpu.node), so
// the plain native addon is never rebuilt for it; VIBE_KERNEL_GPU_ADDON names another build (the check's controls)
export const GPU_ADDON_PATH =
  process.env.VIBE_KERNEL_GPU_ADDON ?? fileURLToPath(new URL('../../kernel/host/vibe-kernel-gpu.node', import.meta.url))

let loaded: GpuAddon | null | undefined

function gpuAddon(): GpuAddon | null {
  if (loaded === undefined) {
    loaded = null

    if (existsSync(GPU_ADDON_PATH)) {
      const a = createRequire(import.meta.url)(GPU_ADDON_PATH) as Record<string, unknown>

      loaded = typeof a.gpuInit === 'function' ? (a as unknown as GpuAddon) : null
    }
  }

  return loaded
}

// the AMD architecture to compile for: VIBE_KERNEL_GPU_ARCH, else the first GPU agent ROCm lists
function hipArch(): string {
  const set = process.env.VIBE_KERNEL_GPU_ARCH

  if (set) {
    return set
  }

  const rocm = process.env.ROCM_PATH ?? '/opt/rocm'

  for (const tool of ['rocm_agent_enumerator', join(rocm, 'bin', 'rocm_agent_enumerator'), 'amdgpu-arch']) {
    try {
      const out = execFileSync(tool, [], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      const arch = out
        .split('\n')
        .map(x => x.trim())
        .find(x => /^gfx[0-9a-f]+/.test(x) && x !== 'gfx000')

      if (arch) {
        return arch
      }
    } catch {
      // the next tool
    }
  }

  throw new Error('vibe kernel: no AMD GPU architecture found; set VIBE_KERNEL_GPU_ARCH (gfx942 for an MI300X)')
}

// the emulator: gpu.cu compiled by the host C++ compiler with -DVK_EMU, rebuilt when the source is newer. The control
// build compiles WITH contraction (and, on x86_64, with FMA instructions available, which the baseline lacks)
export function emuLibrary(contract = GPU_CONTRACT): string {
  const ext = process.platform === 'darwin' ? 'dylib' : 'so'
  const out = join(HOST, `vibe-kernel-emu${contract ? '-fma' : ''}.${ext}`)

  if (existsSync(out) && statSync(out).mtimeMs >= statSync(SOURCE).mtimeMs) {
    return out
  }

  mkdirSync(HOST, { recursive: true })
  execFileSync(
    process.env.CXX ?? 'c++',
    [
      '-x',
      'c++',
      '-std=c++17',
      '-O2',
      '-fPIC',
      process.platform === 'darwin' ? '-dynamiclib' : '-shared',
      '-DVK_EMU',
      ...(contract
        ? ['-ffp-contract=fast', '-DVK_CONTRACT', ...(process.arch === 'x64' ? ['-mfma'] : [])]
        : ['-ffp-contract=off']),
      '-o',
      out,
      SOURCE,
    ],
    { stdio: 'inherit' },
  )

  return out
}

function start(kind: GpuBackend): { info: string; addon: GpuAddon } {
  const a = gpuAddon()

  if (!a) {
    throw new Error(
      `vibe kernel: no GPU build at ${GPU_ADDON_PATH}; build it with a feature: pnpm call task/kernel/build.ts native hip (or cuda, or emu)`,
    )
  }

  if (started) {
    if (started.kind !== kind) {
      throw new Error(`vibe kernel: this process already runs the ${started.kind} backend`)
    }

    return started
  }

  const code = kind === 'hip' ? 0 : kind === 'cuda' ? 1 : 2
  const arg = kind === 'hip' ? hipArch() : kind === 'cuda' ? (process.env.VIBE_KERNEL_GPU_ARCH ?? '') : emuLibrary()
  const info = a.gpuInit(code, GPU_CONTRACT ? 1 : 0, arg)

  started = { kind, info, addon: a }

  return started
}

export function gpuAvailable(kind: GpuBackend): boolean {
  try {
    start(kind)

    return true
  } catch {
    return false
  }
}

// the line the binding printed when it loaded the device (what compiled, for which device, with which options)
export const gpuInfo = (kind: GpuBackend): string => start(kind).info

// ---- residency, shared by every GPU kernel in the process ----

const held = new Map<Typed, { buf: Buf; refs: number }>()
const tables = new WeakMap<Typed, { buf: Buf; min: number; max: number }>()

// ---- the kernel ----

export function gpuKernel(kind: GpuBackend): Kernel {
  const { addon: a } = start(kind)

  const upload = (x: Typed): Buf => {
    const b = a.gpuAlloc(x.byteLength)

    a.gpuUpload(b, x)

    return b
  }

  // a table's device copy, uploaded on first sight, with its value range (for the index checks)
  const table = (x: Typed): { buf: Buf; min: number; max: number } => {
    const h = held.get(x)

    if (h) {
      return { buf: h.buf, ...range(x) }
    }

    let t = tables.get(x)

    if (!t) {
      t = { buf: upload(x), ...range(x) }
      tables.set(x, t)
    }

    return t
  }

  // one call: every argument's device buffer (held, a table, or a copy made here), the call, then the copies of the
  // arrays it writes brought back and every copy freed
  type Use = readonly [Typed, 'in' | 'out' | 'table']

  const call = (uses: readonly Use[], body: (b: Buf[]) => void): void => {
    const temps = new Map<Typed, Buf>()
    const outs = new Set<Typed>()
    const bufs = uses.map(([x, how]) => {
      const h = held.get(x)

      if (h) {
        return h.buf
      }

      if (how === 'table') {
        return table(x).buf
      }

      if (how === 'out') {
        outs.add(x)
      }

      let t = temps.get(x)

      if (!t) {
        t = upload(x)
        temps.set(x, t)
      }

      return t
    })

    try {
      body(bufs)
      outs.forEach(x => a.gpuDownload(temps.get(x)!, x))
    } finally {
      temps.forEach(b => a.gpuFree(b))
    }
  }

  const device: Device = {
    hold: arrays =>
      arrays.forEach(x => {
        const h = held.get(x)

        if (h) {
          h.refs++
        } else {
          held.set(x, { buf: upload(x), refs: 1 })
        }
      }),
    release: arrays =>
      arrays.forEach(x => {
        const h = held.get(x)

        if (!h) {
          return
        }

        h.refs--

        if (h.refs === 0) {
          held.delete(x)
          a.gpuDownload(h.buf, x)
          a.gpuFree(h.buf)
        }
      }),
    fetch: arrays =>
      arrays.forEach(x => {
        const h = held.get(x)

        if (h) {
          a.gpuDownload(h.buf, x)
        }
      }),
    put: arrays =>
      arrays.forEach(x => {
        const h = held.get(x)

        if (h) {
          a.gpuUpload(h.buf, x)
        }
      }),
    copy: (dst, src) => {
      if (dst.length !== src.length) {
        throw new Error('vibe kernel: copy between arrays of different lengths')
      }

      const d = held.get(dst)
      const s = held.get(src)

      if (d && s) {
        a.gpuCopy(d.buf, s.buf)
      } else if (d) {
        a.gpuUpload(d.buf, src)
      } else if (s) {
        a.gpuDownload(s.buf, dst)
      } else {
        dst.set(src)
      }
    },
  }

  const docksOf = (n: number): number => n / (192 * 192)

  return {
    backend: kind,
    threads: 1,
    device,
    pairOp: (t: PairTables): PairOp => ({
      count: t.plusRep.length / 24,
      tables: t,
      gpu: a.gpuPairOp(
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
      ),
    }),
    conv: (op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger) => {
      if (op.gpu === undefined) {
        throw new Error('vibe kernel: a pair operator from another backend')
      }

      call(
        [
          [srcRe, 'in'],
          [srcIm, 'in'],
          [outRe, 'out'],
          [outIm, 'out'],
        ],
        b => a.gpuConv(op.gpu, b[0], b[1], srcOff, srcStride, t, b[2], b[3], member, dagger ? 1 : 0),
      )
    },
    pairBeat: (re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff) =>
      call(
        [
          [re, 'out'],
          [im, 'out'],
          ...[t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi].map(x => [x, 'in'] as const),
          [beta, 'table'],
        ],
        b => a.gpuPairBeat(...b.slice(0, 13), alr, ali, mainOff),
      ),
    crossApply: (re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own) =>
      call(
        [
          [re, 'out'],
          [im, 'out'],
          ...[t1r, t1i, t2r, t2i, t4r, t4i].map(x => [x, 'in'] as const),
          [cross, 'table'],
        ],
        b => a.gpuCrossApply(...b, own),
      ),
    blockAdd: (outRe, outIm, fr, fi, off) =>
      call(
        [
          [outRe, 'out'],
          [outIm, 'out'],
          [fr, 'in'],
          [fi, 'in'],
        ],
        b => a.gpuBlockAdd(...b, off),
      ),
    blockInner: (aRe, aIm, bRe, bIm, partRe, partIm) =>
      call(
        [
          [aRe, 'in'],
          [aIm, 'in'],
          [bRe, 'in'],
          [bIm, 'in'],
          [partRe, 'out'],
          [partIm, 'out'],
        ],
        b => a.gpuBlockInner(...b),
      ),
    axpy: (yRe, yIm, xRe, xIm, fr, fi) =>
      call(
        [
          [yRe, 'out'],
          [yIm, 'out'],
          [xRe, 'in'],
          [xIm, 'in'],
        ],
        b => a.gpuAxpy(...b, fr, fi),
      ),
    scale: (re, im, f) =>
      call(
        [
          [re, 'out'],
          [im, 'out'],
        ],
        b => a.gpuScale(...b, f),
      ),
    seaPiece: (re, im, E, alpha, beta, phase) =>
      call(
        [
          [re, 'out'],
          [im, 'out'],
          [E, 'table'],
          [alpha, 'in'],
          [beta, 'in'],
          ...(phase ? [[phase, 'in'] as const] : []),
        ],
        b => a.gpuSeaPiece(b[0], b[1], b[2], b[3], b[4], phase ? b[5] : null),
      ),
    seaStream: (sRe, sIm, oRe, oIm, move, opposite) => {
      const docks = docksOf(sRe.length)
      const mv = table(move)
      const op = table(opposite)

      if (!Number.isInteger(docks) || mv.min < 0 || mv.max >= docks || op.min < 0 || op.max >= 24) {
        throw new Error('vibe kernel: seaStream index out of range')
      }

      call(
        [
          [sRe, 'in'],
          [sIm, 'in'],
          [oRe, 'out'],
          [oIm, 'out'],
          [move, 'table'],
          [opposite, 'table'],
        ],
        b => a.gpuSeaStream(...b),
      )
    },
    phaseSum: (re, im, c, s, width, mRe, mIm) =>
      call(
        [
          [re, 'in'],
          [im, 'in'],
          [c, 'in'],
          [s, 'in'],
          [mRe, 'out'],
          [mIm, 'out'],
        ],
        b => a.gpuPhaseSum(b[0], b[1], b[2], b[3], width, b[4], b[5]),
      ),
    holeOneBody: (re, im, mom, n, f, aRe, aIm) => {
      holeRowsShape(re, im, mom, n, f, aRe, aIm)
      call(
        [
          [re, 'out'],
          [im, 'out'],
          [mom, 'table'],
          [aRe, 'table'],
          [aIm, 'table'],
        ],
        b => a.gpuHoleOneBody(b[0], b[1], b[2], n, f, b[3], b[4]),
      )
    },
    holeBand: (re, im, mom, n, f, pRe, pIm, part) => {
      const rows = holeRowsShape(re, im, mom, n, f, pRe, pIm)

      if (part.length !== rows * n) {
        throw new Error('vibe kernel: holeBand part size')
      }

      call(
        [
          [re, 'in'],
          [im, 'in'],
          [mom, 'table'],
          [pRe, 'table'],
          [pIm, 'table'],
          [part, 'out'],
        ],
        b => a.gpuHoleBand(b[0], b[1], b[2], n, f, b[3], b[4], b[5]),
      )
    },
    holePair: (re, im, F, P, ph) => {
      holePairShape(re, im, F, P, ph)
      call(
        [
          [re, 'out'],
          [im, 'out'],
          ...[
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
          ].map(x => [x, 'table'] as const),
        ],
        b => a.gpuHolePair(...b, F.scales[0]!, F.scales[1]!),
      )
    },
  }
}

// a table's smallest and largest value (for an index table's range check)
function range(x: Typed): { min: number; max: number } {
  let min = Infinity
  let max = -Infinity

  if (x instanceof Float64Array) {
    return { min, max }
  }

  for (let i = 0; i < x.length; i++) {
    const v = x[i]!

    if (v < min) {
      min = v
    }

    if (v > max) {
      max = v
    }
  }

  return { min, max }
}
