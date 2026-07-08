// Bloch oscillations, read off the knit's OWN coined Dirac walk. A particle on a periodic lattice
// under a CONSTANT force does not accelerate away forever, the way a free particle would. The lattice
// band is periodic in momentum, so the force sweeps the momentum around the band and the group velocity
// changes sign, and the particle OSCILLATES in position at a fixed frequency set by the force. That
// frequency is the Bloch frequency omega_B = F (in lattice units where the cell size and the step are
// one), and the spatial amplitude is the band width divided by the force, so a stronger force gives
// FASTER, SMALLER oscillations. This is a pure consequence of the discrete lattice band, with no
// continuum analogue.
//
// Measured on the {3,4,3,4} coin's single-particle sector, the two-component coined Dirac walk: a
// constant force enters as a linear on-site potential V(x) = F * x, applied as a per-step phase to both
// chiralities. The probability centroid is tracked each step. With a force it oscillates; with zero
// force (the control) it drifts ballistically.

type Complex = readonly [number, number]

const cadd = (a: Complex, b: Complex): Complex => [
  a[0] + b[0],
  a[1] + b[1],
]

const cmul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cabs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1]
const IMAG: Complex = [0, 1]

// The centroid (mean position, signed from the launch site) of the coined Dirac walk under a constant
// force F, tracked for each step. A localized packet is launched at rest (symmetric coin) at the
// centre; the force tilts the lattice so the centroid oscillates (Bloch) rather than drifting.
export function blochCentroidTrace(input: {
  size: number
  steps: number
  mass: number
  force: number
  width: number
}): number[] {
  const { size: L, steps, mass, force, width: sigma } = input
  const wrap = (x: number): number => ((x % L) + L) % L
  const x0 = L >> 1

  // localized Gaussian packet at rest: equal weight in both chiralities (symmetric)
  let R: Complex[] = new Array(L).fill([0, 0])
  let Lf: Complex[] = new Array(L).fill([0, 0])
  let seedNorm = 0

  for (let x = 0; x < L; x++) {
    const g = Math.exp(-((x - x0) * (x - x0)) / (2 * sigma * sigma))
    R[x] = [g, 0]
    Lf[x] = [g, 0]
    seedNorm += cabs2(R[x]!) + cabs2(Lf[x]!)
  }

  const inv = 1 / Math.sqrt(seedNorm)

  for (let x = 0; x < L; x++) {
    R[x] = [R[x]![0] * inv, R[x]![1] * inv]
    Lf[x] = [Lf[x]![0] * inv, Lf[x]![1] * inv]
  }

  const c = Math.cos(mass)
  const s = Math.sin(mass)

  // per-site force phase e^{-i F (x - x0)} (linear potential tilt, centred so it is antisymmetric)
  const forceRe = new Float64Array(L)
  const forceIm = new Float64Array(L)

  for (let x = 0; x < L; x++) {
    const v = force * (x - x0)
    forceRe[x] = Math.cos(-v)
    forceIm[x] = Math.sin(-v)
  }

  const centroid: number[] = []

  for (let t = 0; t < steps; t++) {
    // coin: mass mixes the two chiralities
    const R2: Complex[] = new Array(L)
    const L2: Complex[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R2[x] = cadd(
        [c * R[x]![0], c * R[x]![1]],
        cmul([-s, 0], cmul(IMAG, Lf[x]!)),
      )
      L2[x] = cadd(cmul([-s, 0], cmul(IMAG, R[x]!)), [
        c * Lf[x]![0],
        c * Lf[x]![1],
      ])
    }

    // constant force: linear on-site phase to both chiralities
    if (force !== 0) {
      for (let x = 0; x < L; x++) {
        const pr = forceRe[x]!
        const pi = forceIm[x]!
        R2[x] = cmul([pr, pi], R2[x]!)
        L2[x] = cmul([pr, pi], L2[x]!)
      }
    }

    // shift: R moves +1, L moves -1
    const R3: Complex[] = new Array(L).fill([0, 0])
    const L3: Complex[] = new Array(L).fill([0, 0])

    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = R2[x]!
      L3[wrap(x - 1)] = L2[x]!
    }

    R = R3
    Lf = L3

    // signed centroid from the launch site
    let cc = 0
    let wc = 0

    for (let x = 0; x < L; x++) {
      const dx = ((x - x0 + L + L / 2) % L) - L / 2
      const w = cabs2(R[x]!) + cabs2(Lf[x]!)
      cc += dx * w
      wc += w
    }

    centroid.push(cc / (wc || 1))
  }

  return centroid
}

// The dominant oscillation frequency of the centroid trace, by a DFT of the mean-subtracted trace with
// parabolic interpolation around the peak bin. For a force F this is the Bloch frequency ~ F; for zero
// force the trace drifts monotonically and no clean peak frequency is reported (returns 0).
export function blochFrequency(input: {
  size: number
  steps: number
  mass: number
  force: number
  width: number
}): number {
  const trace = blochCentroidTrace(input)
  const n = trace.length
  const mean = trace.reduce((a, b) => a + b, 0) / n

  const power = (f: number): number => {
    let re = 0
    let im = 0

    for (let t = 0; t < n; t++) {
      const phase = (2 * Math.PI * f * t) / n
      re += (trace[t]! - mean) * Math.cos(phase)
      im += (trace[t]! - mean) * Math.sin(phase)
    }

    return re * re + im * im
  }

  let peak = 1
  let peakPower = 0

  for (let f = 1; f < n / 2; f++) {
    const p = power(f)

    if (p > peakPower) {
      peakPower = p
      peak = f
    }
  }

  const yLeft = Math.log(power(peak - 1) + 1e-30)
  const yMid = Math.log(peakPower + 1e-30)
  const yRight = Math.log(power(peak + 1) + 1e-30)
  const denom = yLeft - 2 * yMid + yRight
  const delta = denom !== 0 ? (0.5 * (yLeft - yRight)) / denom : 0
  const refined = peak + delta

  return (2 * Math.PI * refined) / n
}
