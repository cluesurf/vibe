// Cyclotron motion, read off a 2D coined walk in a synthetic magnetic field. A charged particle in a
// uniform magnetic field does not fly straight, it orbits: the field bends its velocity, and it circles
// at the cyclotron frequency, which grows with the field. On a lattice the field is a Peierls phase, a
// phase picked up on each hop that encodes the enclosed flux (Landau gauge A = (0, B x, 0), so a y-hop
// at column x carries the phase B x). A wave packet launched with momentum then curves into a cyclotron
// orbit: its transverse (y) centroid OSCILLATES at the cyclotron frequency omega_c, proportional to B,
// and the orbit radius shrinks as B grows. With no field it flies straight (ballistic, unbounded).
//
// This is a two-dimensional walk, closer to the genuinely 2D substrate than the 1D single-particle
// sector. Each step: coin, spin-dependent x-shift, coin, spin-dependent y-shift carrying the Peierls
// phase. The transverse centroid is tracked, and its dominant frequency is the cyclotron frequency.

type Complex = [number, number]

function coinRotate(
  up: Complex,
  down: Complex,
  theta: number,
): [Complex, Complex] {
  const c = Math.cos(theta / 2)
  const s = Math.sin(theta / 2)

  return [
    [c * up[0] - s * down[0], c * up[1] - s * down[1]],
    [s * up[0] + c * down[0], s * up[1] + c * down[1]],
  ]
}

function applyPhase(z: Complex, angle: number): Complex {
  const c = Math.cos(angle)
  const s = Math.sin(angle)

  return [z[0] * c - z[1] * s, z[0] * s + z[1] * c]
}

// The transverse (y) centroid trace of a momentum packet on the 2D coined walk in a synthetic magnetic
// field of strength `field` (the Peierls phase per unit column per y-hop). With a field the trace
// oscillates (cyclotron orbit); with zero field it drifts ballistically.
export function cyclotronCentroidTrace(input: {
  size: number
  steps: number
  field: number
  coinAngle: number
  momentum: number
}): number[] {
  const {
    size: L,
    steps,
    field: B,
    coinAngle: theta,
    momentum: kx,
  } = input

  const wrap = (n: number): number => ((n % L) + L) % L
  const x0 = L >> 1
  const y0 = L >> 1
  const N = L * L
  const idx = (x: number, y: number): number => x * L + y

  // Gaussian packet with x-momentum, seeded in the up-mover (a definite launch velocity)
  let up: Complex[] = Array.from({ length: N }, () => [0, 0] as Complex)
  let down: Complex[] = Array.from(
    { length: N },
    () => [0, 0] as Complex,
  )

  const w = 6

  let norm = 0

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      const g = Math.exp(
        -(((x - x0) ** 2 + (y - y0) ** 2) / (2 * w * w)),
      )

      const phase = kx * x

      up[idx(x, y)] = [g * Math.cos(phase), g * Math.sin(phase)]
      norm += g * g
    }
  }

  const s = 1 / Math.sqrt(norm)

  for (let i = 0; i < N; i++) {
    up[i] = [up[i]![0] * s, up[i]![1] * s]
  }

  const trace: number[] = []

  for (let t = 0; t < steps; t++) {
    // coin
    const u1: Complex[] = new Array(N)
    const d1: Complex[] = new Array(N)

    for (let i = 0; i < N; i++) {
      const [nu, nd] = coinRotate(up[i]!, down[i]!, theta)

      u1[i] = nu
      d1[i] = nd
    }

    // x-shift: up -> x+1, down -> x-1
    const u2: Complex[] = Array.from(
      { length: N },
      () => [0, 0] as Complex,
    )

    const d2: Complex[] = Array.from(
      { length: N },
      () => [0, 0] as Complex,
    )

    for (let x = 0; x < L; x++) {
      for (let y = 0; y < L; y++) {
        u2[idx(wrap(x + 1), y)] = u1[idx(x, y)]!
        d2[idx(wrap(x - 1), y)] = d1[idx(x, y)]!
      }
    }

    // coin
    const u3: Complex[] = new Array(N)
    const d3: Complex[] = new Array(N)

    for (let i = 0; i < N; i++) {
      const [nu, nd] = coinRotate(u2[i]!, d2[i]!, theta)

      u3[i] = nu
      d3[i] = nd
    }

    // y-shift with Peierls phase e^{+/- i B x} (Landau gauge): up -> y+1, down -> y-1
    const u4: Complex[] = Array.from(
      { length: N },
      () => [0, 0] as Complex,
    )

    const d4: Complex[] = Array.from(
      { length: N },
      () => [0, 0] as Complex,
    )

    for (let x = 0; x < L; x++) {
      const dx = x - x0

      for (let y = 0; y < L; y++) {
        u4[idx(x, wrap(y + 1))] = applyPhase(u3[idx(x, y)]!, B * dx)
        d4[idx(x, wrap(y - 1))] = applyPhase(d3[idx(x, y)]!, -B * dx)
      }
    }

    up = u4
    down = d4

    // transverse (y) centroid
    let cy = 0
    let ww = 0

    for (let i = 0; i < N; i++) {
      const p =
        up[i]![0] ** 2 +
        up[i]![1] ** 2 +
        down[i]![0] ** 2 +
        down[i]![1] ** 2

      const y = i % L

      cy += (y - y0) * p
      ww += p
    }

    trace.push(cy / (ww || 1))
  }

  return trace
}

// The dominant oscillation frequency of the transverse centroid, by a DFT of the mean-subtracted trace
// with parabolic interpolation around the peak bin. For a field B this is the cyclotron frequency,
// proportional to B.
export function cyclotronFrequency(input: {
  size: number
  steps: number
  field: number
  coinAngle: number
  momentum: number
}): number {
  const trace = cyclotronCentroidTrace(input)
  const n = trace.length
  const mean = trace.reduce((a, b) => a + b, 0) / n

  const power = (f: number): number => {
    let re = 0
    let im = 0

    for (let t = 0; t < n; t++) {
      const a = (2 * Math.PI * f * t) / n

      re += (trace[t]! - mean) * Math.cos(a)
      im += (trace[t]! - mean) * Math.sin(a)
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

  return (2 * Math.PI * (peak + delta)) / n
}

// The peak-to-peak span of the transverse centroid: a bounded cyclotron orbit under a field, an
// unbounded ballistic drift with no field.
export function transverseSpan(input: {
  size: number
  steps: number
  field: number
  coinAngle: number
  momentum: number
}): number {
  const trace = cyclotronCentroidTrace(input)

  return Math.max(...trace) - Math.min(...trace)
}
