// THE KERNEL LAYER'S ENTRY: pick a backend. code/kernel/
// kernel('js') is the reference and always works. kernel('native', threads) and kernel('wasm') need the Rust crate
// kernel/ built (pnpm call task/kernel/build.ts); they throw with that instruction when it is not. Every backend gives
// the bytes js gives, at every thread count (pnpm call task/kernel/check.ts proves it). See note/research/vibe/kernel.md.

import { jsKernel } from '@/code/kernel/js'
import { nativeAvailable, nativeKernel } from '@/code/kernel/native'
import type { Backend, Kernel } from '@/code/kernel/types'
import { wasmAvailable, wasmKernel } from '@/code/kernel/wasm'
import { wasmThreadsAvailable, wasmThreadsKernel } from '@/code/kernel/wasm-threads'

export type { Backend, Kernel, PairOp, PairTables } from '@/code/kernel/types'

// the options an engine takes to run on a kernel (absent: the engine's own JavaScript, unchanged)
export type KernelOptions = { backend?: Backend; threads?: number }

export function kernel(backend: Backend = 'js', threads = 1): Kernel {
  switch (backend) {
    case 'js':
      return jsKernel()
    case 'native':
      return nativeKernel(threads)
    case 'wasm':
      return wasmKernel()
    case 'wasm-threads':
      return wasmThreadsKernel(threads)
  }
}

export function available(backend: Backend): boolean {
  switch (backend) {
    case 'js':
      return true
    case 'native':
      return nativeAvailable()
    case 'wasm':
      return wasmAvailable()
    case 'wasm-threads':
      return wasmThreadsAvailable()
  }
}
