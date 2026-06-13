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

interface SpectralOperator {
  values: number[] | Float64Array
  vectors: Float64Array // columns: vectors[i * n + k] is component i of eigenvector k
}

// Mean-square displacement of a CONTINUOUS-time quantum walk e^{-iAt} on a graph, from `center`, from
// the eigendecomposition of the hopping operator A. Amplitudes interfere, so the spread is BALLISTIC
// (width ~ t). The amplitude to reach site j is sum_k v[center,k] v[j,k] e^{-i lambda_k t}.
export function continuousQuantumWalkMsd(input: {
  eig: SpectralOperator
  n: number
  center: number
  t: number
}): number {
  const { eig, n, center, t } = input
  let msd = 0
  for (let j = 0; j < n; j++) {
    let re = 0
    let im = 0
    for (let k = 0; k < n; k++) {
      const amp = (eig.vectors[center * n + k] ?? 0) * (eig.vectors[j * n + k] ?? 0)
      const lambda = eig.values[k] ?? 0
      re += amp * Math.cos(lambda * t)
      im += amp * -Math.sin(lambda * t)
    }
    const prob = re * re + im * im
    msd += prob * (j - center) * (j - center)
  }
  return msd
}

// Mean-square displacement of a CONTINUOUS-time classical random walk (heat kernel e^{-Lt}) on a graph,
// from `center`, from the eigendecomposition of the graph Laplacian L. Probabilities (not amplitudes)
// propagate, so the spread is DIFFUSIVE (width ~ sqrt t). The distribution is renormalized to sum to 1.
export function continuousClassicalWalkMsd(input: {
  eig: SpectralOperator
  n: number
  center: number
  t: number
}): number {
  const { eig, n, center, t } = input
  const prob = new Float64Array(n)
  let norm = 0
  for (let j = 0; j < n; j++) {
    let p = 0
    for (let k = 0; k < n; k++) {
      const amp = (eig.vectors[center * n + k] ?? 0) * (eig.vectors[j * n + k] ?? 0)
      const lambda = eig.values[k] ?? 0
      p += amp * Math.exp(-lambda * t)
    }
    prob[j] = Math.max(0, p)
    norm += prob[j] ?? 0
  }
  let msd = 0
  for (let j = 0; j < n; j++) {
    msd += ((prob[j] ?? 0) / Math.max(norm, 1e-300)) * (j - center) * (j - center)
  }
  return msd
}

// The dispersion relation of the coined walk, omega(k) = arccos(cos(theta) cos(k)). Massless (theta = 0)
// gives omega = |k|, a pure lightcone of speed 1. Massive (theta > 0) gives a gap at k = 0 and a relativistic
// omega^2 ~ c^2 k^2 + m^2. omega(0) = theta is the mass gap.
export function coinedWalkDispersion(input: { theta: number; k: number }): number {
  return Math.acos(Math.cos(input.theta) * Math.cos(input.k))
}

// The MEASURED dispersion frequency E of the two-component (left/right mover) coined
// walk at a given wavenumber, simulated from a real plane-wave seed and read off by
// DFT. The right-mover is seeded as cos(k x), the left-mover at zero; each beat
// applies the exact discrete shift (R moves +1, L moves -1) and then the mass coin
// (a rotation by `mass`, with mass = 0 the identity, a pure discrete shift). One
// cell's right-mover component is tracked for `beats` steps and its dominant DFT
// frequency bin gives E. Massless gives E = k (the lightcone); massive gives the
// Dirac relation cos E = cos(mass) cos(k). This MEASURES the dispersion from the
// simulated rule rather than assuming the analytic coinedWalkDispersion.
export function measuredCoinedWalkFrequency(input: {
  wavenumberIndex: number
  size: number
  mass: number
  beats: number
}): number {
  const { wavenumberIndex, size, mass, beats } = input
  const k = (2 * Math.PI * wavenumberIndex) / size
  const right = new Float64Array(size)
  const left = new Float64Array(size)
  for (let x = 0; x < size; x++) right[x] = Math.cos(k * x)
  const series = new Float64Array(beats)
  const rightNext = new Float64Array(size)
  const leftNext = new Float64Array(size)
  const cm = Math.cos(mass)
  const sm = Math.sin(mass)
  for (let t = 0; t < beats; t++) {
    series[t] = right[0]! // track one cell's right-mover component
    // SHIFT (exactly discrete, a permutation): R moves +1, L moves -1
    for (let x = 0; x < size; x++) {
      rightNext[x] = right[(x - 1 + size) % size]!
      leftNext[x] = left[(x + 1) % size]!
    }
    // COIN / MASS (massless = identity = pure discrete shift)
    if (mass === 0) {
      right.set(rightNext)
      left.set(leftNext)
    } else {
      for (let x = 0; x < size; x++) {
        const r = rightNext[x]!
        const l = leftNext[x]!
        right[x] = cm * r - sm * l
        left[x] = sm * r + cm * l
      }
    }
  }
  // DFT: find the dominant frequency bin
  let bestFrequency = 0
  let bestPower = -1
  for (let f = 1; f < beats / 2; f++) {
    let re = 0
    let im = 0
    for (let t = 0; t < beats; t++) {
      const phase = (-2 * Math.PI * f * t) / beats
      re += series[t]! * Math.cos(phase)
      im += series[t]! * Math.sin(phase)
    }
    const power = re * re + im * im
    if (power > bestPower) {
      bestPower = power
      bestFrequency = f
    }
  }
  return (2 * Math.PI * bestFrequency) / beats
}
