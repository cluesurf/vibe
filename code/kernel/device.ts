// DEVICE RESIDENCY: keeping an engine's state on a GPU across cycles. code/kernel/
// A GPU backend (code/kernel/gpu.ts) copies every array it is handed to the device, and every output back, on every
// call, unless the array is HELD: then the device copy is used in place and the host copy is stale until released.
// Copying a 100 MB state across PCIe twenty times a cycle would cost more than the cycle, so an engine's cycle loop holds
// its state, runs, and releases (one upload at the start, one download at the end).
//
// On a backend without a device (js, native, wasm) both helpers are the plain operation, so an engine calls them
// unconditionally.

import type { Kernel, Typed } from '@/code/kernel/types'

// run body with `arrays` held on the device, then download them (their host copies are valid again after)
export function onDevice<T>(k: Kernel, arrays: readonly (Typed | null | undefined)[], body: () => T): T {
  const d = k.device

  if (!d) {
    return body()
  }

  const list = arrays.filter((a): a is Typed => Boolean(a))

  d.hold(list)

  try {
    return body()
  } finally {
    d.release(list)
  }
}

// dst.set(src), wherever each lives
export function setInto(k: Kernel, dst: Float64Array, src: Float64Array): void {
  if (k.device) {
    k.device.copy(dst, src)
  } else {
    dst.set(src)
  }
}

// a held array's host copy, current (a no-op for an array not held, or a backend without a device)
export const fetchHost = (k: Kernel, arrays: readonly Typed[]): void => k.device?.fetch(arrays)

// a held array's device copy, current after the host changed it
export const putHost = (k: Kernel, arrays: readonly Typed[]): void => k.device?.put(arrays)
