// The deterministic reversible (leapfrog) wave on a periodic 1D line, in continuous amplitude. The
// second-order update with Courant number r (r2 = r^2):
//   next[i] = 2 u[i] - uPrev[i] + r2 (u[i-1] + u[i+1] - 2 u[i])
// is exactly reversible (it keeps the previous slice) and propagates at speed ~ r. Block-averaging
// the amplitude over consecutive cells is the coarse-graining used to climb the renormalization tower
// (evolve-then-coarsen vs coarsen-then-evolve), where the coarse wave obeys the same rule at the same
// Courant number, so the speed is scale-invariant.

// One leapfrog step on a periodic ring, returning the next slice.
export function leapfrogWaveStep(u: Float64Array, uPrev: Float64Array, r2: number): Float64Array {
  const L = u.length
  const next = new Float64Array(L)
  for (let i = 0; i < L; i++) {
    const left = u[(i - 1 + L) % L]!
    const right = u[(i + 1) % L]!
    next[i] = 2 * u[i]! - uPrev[i]! + r2 * (left + right - 2 * u[i]!)
  }
  return next
}

// Block-average a 1D field over consecutive blocks of size b (real-space coarse-graining).
export function blockAverage(u: Float64Array, b: number): Float64Array {
  const M = Math.floor(u.length / b)
  const out = new Float64Array(M)
  for (let I = 0; I < M; I++) {
    let s = 0
    for (let j = 0; j < b; j++) s += u[I * b + j]!
    out[I] = s / b
  }
  return out
}
