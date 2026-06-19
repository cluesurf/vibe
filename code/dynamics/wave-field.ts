// A reduced integer second-order field, a discrete wave equation with an on-site force, on a 1D chain. The update
// is u(t+1) = left + right - u(t-1) + accel(u(t)), which is the discrete Klein-Gordon / sine-Gordon scheme at wave
// speed one. It is exactly reversible for ANY integer accel (u(t-1) = left + right - u(t+1) + accel(u(t))) and uses
// only integers, no real or decimal values. With a double-well accel (two vacua) its KINK is a candidate
// topological soliton (the 2A route in plans/bound-body-base-modifications). The catch this exposes, the
// speed-one scheme is only marginally stable, so any on-site force pushes the zone-edge modes unstable, a bounded
// force makes the field SHATTER into turbulence and an unbounded one makes it BLOW UP. Stabilizing would need
// sub-unity (real) coefficients, which the discrete commitment forbids.

export type WaveField = {
  prev: Int32Array
  curr: Int32Array
  size: number
}

// the on-site acceleration, the negative gradient of the on-site potential. Integer-valued.
export type Acceleration = (value: number) => number

export type WaveBoundary =
  | { form: 'periodic' }
  | { form: 'absorbing'; left: number; right: number; margin?: number }

export function makeWaveField(input: {
  size: number
  fill: (index: number) => number
}): WaveField {
  const { size, fill } = input
  const u = new Int32Array(size)
  for (let x = 0; x < size; x++) u[x] = fill(x)
  return { prev: u.slice(), curr: u.slice(), size }
}

export function stepWaveField(input: {
  field: WaveField
  accel: Acceleration
  boundary: WaveBoundary
}): WaveField {
  const { field, accel, boundary } = input
  const { size, curr, prev } = field
  const next = new Int32Array(size)
  const periodic = boundary.form === 'periodic'
  const leftVacuum = boundary.form === 'absorbing' ? boundary.left : 0
  const rightVacuum = boundary.form === 'absorbing' ? boundary.right : 0
  for (let x = 0; x < size; x++) {
    const left =
      x === 0 ? (periodic ? curr[size - 1]! : leftVacuum) : curr[x - 1]!
    const right =
      x === size - 1
        ? periodic
          ? curr[0]!
          : rightVacuum
        : curr[x + 1]!
    next[x] = left + right - prev[x]! + accel(curr[x]!)
  }
  if (boundary.form === 'absorbing') {
    const margin = boundary.margin ?? 6
    for (let x = 0; x < margin; x++) next[x] = leftVacuum
    for (let x = size - margin; x < size; x++) next[x] = rightVacuum
  }
  return { prev: curr, curr: next, size }
}

// a double-well acceleration with minima (vacua) at +-amplitude and a barrier at zero. `saturating` caps the force
// at +-1 (bounded), otherwise the pull-back beyond a vacuum is linear (unbounded).
export function doubleWellAccel(input: {
  amplitude: number
  saturating: boolean
}): Acceleration {
  const { amplitude, saturating } = input
  return (value: number): number => {
    if (value === 0) return 0
    const sign = Math.sign(value)
    const magnitude = Math.abs(value)
    if (magnitude === amplitude) return 0
    if (magnitude < amplitude) return sign // push out toward the vacuum
    return saturating ? -sign : -sign * (magnitude - amplitude) // pull back beyond the vacuum
  }
}

export function fieldMaxAbs(u: Int32Array): number {
  let max = 0
  for (let x = 0; x < u.length; x++) {
    const a = Math.abs(u[x]!)
    if (a > max) max = a
  }
  return max
}

// the number of sign changes between non-zero cells, the count of domain walls (a clean single kink is one).
export function domainWallCount(u: Int32Array): number {
  let count = 0
  for (let x = 0; x < u.length - 1; x++) {
    if (
      u[x] !== 0 &&
      u[x + 1] !== 0 &&
      Math.sign(u[x]!) !== Math.sign(u[x + 1]!)
    )
      count++
  }
  return count
}
