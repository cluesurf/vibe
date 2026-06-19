// The Coxeter mirror normals for a Schlafli symbol, in a canonical Minkowski basis with the timelike axis LAST,
// so the metric is diag(1, ..., 1, -1). `mirrorFrame` returns the timelike axis at an arbitrary index, but the
// fold WGSL math (code/render/fold.wgsl.ts) assumes it is last, so the columns are reordered to put every
// spacelike axis first and the one timelike axis last. The J-inner product of the normals still reproduces the
// Gram matrix, so the reflection group is unchanged. Shared by the headless runners and the browser engine.

import { mirrorFrame } from '@/code/substrate/coxeter/schlafli'

export function canonicalMirrors(symbol: number[]): number[][] {
  const frame = mirrorFrame(symbol)
  const dim = frame.metric.length
  const order: number[] = []
  for (let a = 0; a < dim; a++)
    if ((frame.metric[a] ?? 1) > 0) order.push(a)
  for (let a = 0; a < dim; a++)
    if ((frame.metric[a] ?? 1) < 0) order.push(a)
  return frame.normals.map(row => order.map(a => row[a] ?? 0))
}
