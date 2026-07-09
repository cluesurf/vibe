// The Lyapunov exponent of the arrow-driven conserving rule, the measured strength of the
// measurement amplifier. Pulled out of E-QTM-0088 so any experiment that needs the chaos rate of
// the rule (the amplifier that turns a microstate into a macroscopic record, or the eraser that
// scrambles a coherent record) reads the one measure instead of re-rolling the fit.

import {
  conservingEdgeSweepHashed,
  hashRand,
} from '@/code/dynamics/conserving-sweep'

// A deterministic generic microstate: a fixed ternary fill (about 30 percent minus, 30 percent
// plus, 40 percent peace) from the stateless position hash, varied by `salt` (a different
// microstate) not by a seed stream. No randomness, fully reproducible. The initial condition the
// chaos diagnostics run on.
export function deterministicMicrostate(input: {
  size: number
  salt: number
}): Int8Array {
  const { size, salt } = input
  const tone = new Int8Array(size)

  for (let i = 0; i < size; i++) {
    const r = hashRand(i, 0, salt)
    tone[i] = r < 0.3 ? -1 : r < 0.6 ? 1 : 0
  }

  return tone
}

// The fitted Lyapunov exponent of the arrow-driven conserving rule on an edge graph: flip one cell
// of a deterministic microstate, evolve the base and the flipped copy under the SAME hashed rule
// (both see identical creation events, so only the seed's difference propagates), and fit the
// least-squares slope of ln(differing-cell count) versus beat over the clean exponential-growth
// window (the count between 2 and `capFraction` of the mesh). Essentially zero for a non-chaotic
// rule (the reversible arrow-zero rule), clearly positive for a chaotic one. This is a chaos
// diagnostic of the discrete rule, the growth rate of the coarse differing-cell count, not a
// continuum Lyapunov number.
export function perturbationLyapunovExponent(input: {
  size: number
  eu: Int32Array
  ev: Int32Array
  salt: number
  arrow: number
  beats?: number
  capFraction?: number
}): number {
  const { size, eu, ev, salt, arrow } = input
  const beats = input.beats ?? 200
  const capFraction = input.capFraction ?? 0.15
  const a = deterministicMicrostate({ size, salt })
  const b = Int8Array.from(a)
  b[0] = b[0] === 1 ? -1 : 1

  const movedA = new Uint8Array(size)
  const movedB = new Uint8Array(size)
  const cap = capFraction * size

  const xs: number[] = []
  const ys: number[] = []

  for (let t = 1; t <= beats; t++) {
    conservingEdgeSweepHashed({
      tone: a,
      eu,
      ev,
      moved: movedA,
      beat: t,
      arrow,
    })
    conservingEdgeSweepHashed({
      tone: b,
      eu,
      ev,
      moved: movedB,
      beat: t,
      arrow,
    })

    let h = 0

    for (let i = 0; i < size; i++) {
      if (a[i] !== b[i]) {
        h++
      }
    }

    if (h >= 2 && h < cap) {
      xs.push(t)
      ys.push(Math.log(h))
    }

    if (h >= cap) {
      break
    }
  }

  const n = xs.length

  if (n < 5) {
    return 0
  }

  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0

  for (let i = 0; i < n; i++) {
    sx += xs[i]!
    sy += ys[i]!
    sxx += xs[i]! * xs[i]!
    sxy += xs[i]! * ys[i]!
  }

  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}
