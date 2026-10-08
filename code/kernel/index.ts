// THE KERNEL LAYER'S ENTRY: pick a backend. code/kernel/
// kernel('js') is the reference and always works. kernel('native', threads) and kernel('wasm') need the Rust crate
// kernel/ built (pnpm call task/kernel/build.ts); they throw with that instruction when it is not. kernel('hip'),
// kernel('cuda') and kernel('gpu-emu') need the addon built with that feature (task/kernel/build.ts native hip) and, for
// hip and cuda, the GPU and its runtime. Every backend gives the bytes js gives, at every thread count (pnpm call
// task/kernel/check.ts proves it). See note/project/vibe/kernel.md.

import { gpuAvailable, gpuKernel } from '@/code/kernel/gpu'
import { jsKernel } from '@/code/kernel/js'
import { nativeAvailable, nativeKernel } from '@/code/kernel/native'
import type { Backend, Kernel } from '@/code/kernel/types'
import { wasmAvailable, wasmKernel } from '@/code/kernel/wasm'
import { wasmThreadsAvailable, wasmThreadsKernel } from '@/code/kernel/wasm-threads'

export type { Backend, Kernel, PairOp, PairTables } from '@/code/kernel/types'
export { onDevice } from '@/code/kernel/device'

// the options an engine takes to run on a kernel (absent: the engine's own JavaScript, unchanged). threads is the CPU
// thread count, ignored by the GPU backends
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
    case 'hip':
    case 'cuda':
    case 'gpu-emu':
      return gpuKernel(backend)
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
    case 'hip':
    case 'cuda':
    case 'gpu-emu':
      return gpuAvailable(backend)
  }
}
