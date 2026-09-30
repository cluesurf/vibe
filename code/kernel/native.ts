// THE KERNEL'S native BACKEND: the Rust crate kernel/ built as a Node-API addon (task/kernel/build.ts writes it to
// kernel/host/vibe-kernel.node). code/kernel/
// The addon reads and writes the engine's own typed arrays in place, and splits every primitive's rows over a pool of
// std::thread workers; the thread count is process-wide in the addon, set on each call here so two kernels with
// different counts can share one process.

import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import type { Kernel, PairOp, PairTables } from '@/code/kernel/types'

type Addon = {
  threads(n: number): number
  pairOp(...tables: unknown[]): unknown
  conv(...args: unknown[]): void
  pairBeat(...args: unknown[]): void
  crossApply(...args: unknown[]): void
  blockAdd(...args: unknown[]): void
  blockInner(...args: unknown[]): void
  axpy(...args: unknown[]): void
  scale(...args: unknown[]): void
  seaPiece(...args: unknown[]): void
  seaStream(...args: unknown[]): void
  phaseSum(...args: unknown[]): void
  holeOneBody(...args: unknown[]): void
  holeBand(...args: unknown[]): void
  holePair(...args: unknown[]): void
}

// VIBE_KERNEL_NATIVE names another build of the addon (the check's negative control loads a contracting build this way)
export const NATIVE_PATH =
  process.env.VIBE_KERNEL_NATIVE ?? fileURLToPath(new URL('../../kernel/host/vibe-kernel.node', import.meta.url))

let addon: Addon | null = null

export const nativeAvailable = (): boolean => existsSync(NATIVE_PATH)

function load(): Addon {
  if (!addon) {
    if (!nativeAvailable()) {
      throw new Error(`vibe kernel: no native build at ${NATIVE_PATH}; run pnpm call task/kernel/build.ts`)
    }

    addon = createRequire(import.meta.url)(NATIVE_PATH) as Addon
  }

  return addon
}


export function nativeKernel(threads: number): Kernel {
  const a = load()
  const n = Math.max(1, Math.min(64, Math.floor(threads)))
  const set = (): void => {
    a.threads(n)
  }

  return {
    backend: 'native',
    threads: n,
    pairOp: (t: PairTables): PairOp => ({
      count: t.plusRep.length / 24,
      tables: t,
      native: a.pairOp(
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
      set()
      a.conv(op.native, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger ? 1 : 0)
    },
    pairBeat: (...args) => {
      set()
      a.pairBeat(...args)
    },
    crossApply: (...args) => {
      set()
      a.crossApply(...args)
    },
    blockAdd: (...args) => {
      set()
      a.blockAdd(...args)
    },
    blockInner: (...args) => {
      set()
      a.blockInner(...args)
    },
    axpy: (...args) => {
      set()
      a.axpy(...args)
    },
    scale: (...args) => {
      set()
      a.scale(...args)
    },
    seaPiece: (...args) => {
      set()
      a.seaPiece(...args)
    },
    seaStream: (...args) => {
      set()
      a.seaStream(...args)
    },
    phaseSum: (...args) => {
      set()
      a.phaseSum(...args)
    },
    holeOneBody: (...args) => {
      set()
      a.holeOneBody(...args)
    },
    holeBand: (...args) => {
      set()
      a.holeBand(...args)
    },
    holePair: (re, im, F, P, ph) => {
      set()
      a.holePair(
        re,
        im,
        F.scales,
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
      )
    },
  }
}
