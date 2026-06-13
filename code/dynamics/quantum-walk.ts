// Discrete-time coined quantum walk on a line, the unitary cousin of the classical random walk. A two-state
// coin at each site is rotated by theta, then the two components shift left and right. The hallmark is
// BALLISTIC spreading (mean-square displacement ~ t^2, exponent ~ 2) versus the classical diffusive ~ t, and
// its continuum dispersion is the Dirac one. Core dynamics for the relativity and quantum experiments.

// Mean-square displacement of the walk after each step, starting localized at the center with a symmetric
// coin. size is the lattice length, theta the coin mixing angle (pi/4 is the Hadamard-like ballistic coin).
export function coinedWalkMSD(input: {
  size: number
  steps: number
  theta: number
}): { msd: number[] } {
  const { size: L, steps, theta } = input
  const C = Math.floor(L / 2) // center position
  const reL = new Float64Array(2 * L) // [x*2 + c] real
  const imL = new Float64Array(2 * L)
  reL[C * 2 + 0] = Math.SQRT1_2 // start localized at center, symmetric coin
  reL[C * 2 + 1] = Math.SQRT1_2
  const ct = Math.cos(theta)
  const st = Math.sin(theta)
  const msd: number[] = []
  const re2 = new Float64Array(2 * L)
  const im2 = new Float64Array(2 * L)
  for (let t = 0; t <= steps; t++) {
    // measure mean-square displacement from center
    let m = 0
    let norm = 0
    for (let x = 0; x < L; x++) {
      const p = reL[x * 2]! ** 2 + imL[x * 2]! ** 2 + reL[x * 2 + 1]! ** 2 + imL[x * 2 + 1]! ** 2
      m += p * (x - C) ** 2
      norm += p
    }
    msd.push(m / norm)
    if (t === steps) break
    // coin: rotation by theta mixing the two coin components
    // shift: left-component to x-1, right-component to x+1
    re2.fill(0)
    im2.fill(0)
    for (let x = 1; x < L - 1; x++) {
      const aR = reL[x * 2]!
      const aI = imL[x * 2]!
      const bR = reL[x * 2 + 1]!
      const bI = imL[x * 2 + 1]!
      const newAR = ct * aR + st * bR
      const newAI = ct * aI + st * bI
      const newBR = st * aR - ct * bR
      const newBI = st * aI - ct * bI
      re2[(x - 1) * 2 + 0]! += newAR
      im2[(x - 1) * 2 + 0]! += newAI
      re2[(x + 1) * 2 + 1]! += newBR
      im2[(x + 1) * 2 + 1]! += newBI
    }
    reL.set(re2)
    imL.set(im2)
  }
  return { msd }
}

// The dispersion relation of the coined walk, omega(k) = arccos(cos(theta) cos(k)). Massless (theta = 0)
// gives omega = |k|, a pure lightcone of speed 1. Massive (theta > 0) gives a gap at k = 0 and a relativistic
// omega^2 ~ c^2 k^2 + m^2. omega(0) = theta is the mass gap.
export function coinedWalkDispersion(input: { theta: number; k: number }): number {
  return Math.acos(Math.cos(input.theta) * Math.cos(input.k))
}
