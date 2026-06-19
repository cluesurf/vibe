import { relativeL2Error } from '@/code/measure/statistics'

// The deterministic reversible (leapfrog) wave on a periodic 1D line, in continuous amplitude. The
// second-order update with Courant number r (r2 = r^2):
//   next[i] = 2 u[i] - uPrev[i] + r2 (u[i-1] + u[i+1] - 2 u[i])
// is exactly reversible (it keeps the previous slice) and propagates at speed ~ r. Block-averaging
// the amplitude over consecutive cells is the coarse-graining used to climb the renormalization tower
// (evolve-then-coarsen vs coarsen-then-evolve), where the coarse wave obeys the same rule at the same
// Courant number, so the speed is scale-invariant.

// One leapfrog step on a periodic ring, returning the next slice.
export function leapfrogWaveStep(
  u: Float64Array,
  uPrev: Float64Array,
  r2: number,
): Float64Array {
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
    for (let j = 0; j < b; j++) {
      s += u[I * b + j]!
    }

    out[I] = s / b
  }

  return out
}

// Evolve the leapfrog wave for `steps` steps from a slice pair, returning the final slice (the previous
// slice is held internally). The reversible second-order update at squared Courant number r2.
export function evolveLeapfrogWave(input: {
  u: Float64Array
  uPrev: Float64Array
  r2: number
  steps: number
}): Float64Array {
  const { r2, steps } = input
  let u = input.u.slice()
  let uPrev = input.uPrev.slice()
  for (let t = 0; t < steps; t++) {
    const next = leapfrogWaveStep(u, uPrev, r2)
    uPrev = u
    u = next
  }

  return u
}

// The renormalization commuting-square error of the leapfrog wave at block size `b`: evolve the fine slice
// pair `b*K` steps then block-average (path A) versus block-average then evolve the coarse wave `K` steps at
// the same Courant number (path B), returning the relative L2 error between the two coarse final states. A
// small error means evolve-then-coarsen equals coarsen-then-evolve, the wave is an RG fixed point.
export function leapfrogWaveCommutingError(input: {
  u0: Float64Array
  uPrev0: Float64Array
  r2: number
  blockSize: number
  coarseSteps: number
}): number {
  const { u0, uPrev0, r2, blockSize: b, coarseSteps: K } = input
  // path A, evolve fine then coarse-grain
  const fine = evolveLeapfrogWave({
    u: u0,
    uPrev: uPrev0,
    r2,
    steps: b * K,
  })
  const A = blockAverage(fine, b)
  // path B, coarse-grain then evolve the coarse wave
  const B = evolveLeapfrogWave({
    u: blockAverage(u0, b),
    uPrev: blockAverage(uPrev0, b),
    r2,
    steps: K,
  })

  return relativeL2Error(A, B)
}

// The physical front speed of the leapfrog wave at coarse level `b`: block-average the slice pair by b,
// evolve `steps` coarse steps, and divide the displacement of the right-moving front (rightmost cell whose
// amplitude exceeds `threshold`) by the steps. The block-size factors cancel, so this is already the
// fine-cell-per-fine-step speed; it should be invariant across levels (~ the Courant number).
export function leapfrogWaveLevelSpeed(input: {
  u0: Float64Array
  uPrev0: Float64Array
  r2: number
  blockSize: number
  steps: number
  threshold: number
}): number {
  const { u0, uPrev0, r2, blockSize: b, steps, threshold } = input
  const frontOf = (arr: Float64Array): number => {
    let f = 0
    for (let i = 0; i < arr.length; i++) {
      if (Math.abs(arr[i]!) > threshold) {
        f = i
      }
    }

    return f
  }

  const start = blockAverage(u0, b)
  const f0 = frontOf(start)
  const end = evolveLeapfrogWave({
    u: start,
    uPrev: blockAverage(uPrev0, b),
    r2,
    steps,
  })
  const f1 = frontOf(end)

  return (f1 - f0) / steps
}
