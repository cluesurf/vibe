// A phase field on a ring, the minimal carrier of a topological winding (the spinor phase of the 8s/8c sector).
// Two dynamics, a DISSIPATIVE relaxation (the open/bath case, energy descends, a perturbation heals) and a
// REVERSIBLE wave (the closed case, energy is conserved, a perturbation recurs). The winding number is conserved
// by both, so it is a topological IDENTITY that survives even total turnover of the field. Used by the persistence
// experiment to separate genuine lasting (dissipative settle of a protected pattern) from mere Poincare recurrence
// (reversible oscillation) from decay (an unprotected pattern with no conserved identity).

const wrapAngle = (x: number): number =>
  Math.atan2(Math.sin(x), Math.cos(x))

// one dissipative relaxation step, theta_i += alpha (sin(theta_left - theta_i) + sin(theta_right - theta_i)). This
// is gradient descent of the XY phase energy, it heals local perturbations and locks the winding. Returns a new array.
export function phaseRelaxStep(
  theta: readonly number[],
  alpha: number,
): number[] {
  const n = theta.length
  const next = new Array<number>(n)

  for (let i = 0; i < n; i++) {
    const left = theta[(i - 1 + n) % n]!
    const right = theta[(i + 1) % n]!
    next[i] = wrapAngle(
      theta[i]! +
        alpha *
          (Math.sin(left - theta[i]!) + Math.sin(right - theta[i]!)),
    )
  }

  return next
}

// one reversible wave (leapfrog sine-Gordon) step IN PLACE, theta and vel are updated. Energy-conserving, so a
// perturbation disperses and recurs rather than settling. The winding is still conserved.
export function phaseWaveStep(
  theta: number[],
  velocity: number[],
  dt: number,
): void {
  const n = theta.length
  const acceleration = new Array<number>(n)

  for (let i = 0; i < n; i++) {
    acceleration[i] =
      Math.sin(theta[(i + 1) % n]! - theta[i]!) +
      Math.sin(theta[(i - 1 + n) % n]! - theta[i]!)
  }

  for (let i = 0; i < n; i++) {
    velocity[i]! += dt * acceleration[i]!
    theta[i] = wrapAngle(theta[i]! + dt * velocity[i]!)
  }
}

// the LOCAL structure of the field, the standard deviation of the nearest-neighbour phase gradient. High when a
// localized perturbation is present, low when the field has relaxed to a smooth winding kink or to uniform. Used as
// the over-time signal, monotone decay means a perturbation is healing (settling), oscillation means recurrence.
export function gradientStructure(theta: readonly number[]): number {
  const n = theta.length
  const gradient = new Array<number>(n)

  for (let i = 0; i < n; i++) {
    gradient[i] = Math.sin(theta[(i + 1) % n]! - theta[i]!)
  }

  const mean = gradient.reduce((sum, value) => sum + value, 0) / n

  return Math.sqrt(
    gradient.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n,
  )
}

// a winding-w kink with a localized lump perturbation at the centre, a deterministic non-equilibrium initial field.
export function windingKinkWithLump(input: {
  size: number
  winding: number
  lumpAmplitude: number
  lumpWidth?: number
}): number[] {
  const { size, winding, lumpAmplitude } = input
  const width = input.lumpWidth ?? 5
  const field = new Array<number>(size)

  for (let i = 0; i < size; i++) {
    const kink = (2 * Math.PI * winding * i) / size
    const lump =
      lumpAmplitude * Math.exp(-(((i - size / 2) / width) ** 2))

    field[i] = wrapAngle(kink + lump)
  }

  return field
}
