// Discrete-time coined quantum walk on a line, the unitary cousin of the classical random walk. A two-state
// coin at each site is rotated by theta, then the two components shift left and right. The hallmark is
// BALLISTIC spreading (mean-square displacement ~ t^2, exponent ~ 2) versus the classical diffusive ~ t, and
// its continuum dispersion is the Dirac one. Core dynamics for the relativity and quantum experiments.

import { linearFit } from '@/code/measure/regression'

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
      const p =
        reL[x * 2]! ** 2 +
        imL[x * 2]! ** 2 +
        reL[x * 2 + 1]! ** 2 +
        imL[x * 2 + 1]! ** 2

      m += p * (x - C) ** 2
      norm += p
    }

    msd.push(m / norm)

    if (t === steps) {
      break
    }

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
      const amp =
        (eig.vectors[center * n + k] ?? 0) *
        (eig.vectors[j * n + k] ?? 0)

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
      const amp =
        (eig.vectors[center * n + k] ?? 0) *
        (eig.vectors[j * n + k] ?? 0)

      const lambda = eig.values[k] ?? 0
      p += amp * Math.exp(-lambda * t)
    }

    prob[j] = Math.max(0, p)
    norm += prob[j] ?? 0
  }

  let msd = 0

  for (let j = 0; j < n; j++) {
    msd +=
      ((prob[j] ?? 0) / Math.max(norm, 1e-300)) *
      (j - center) *
      (j - center)
  }

  return msd
}

// The dispersion relation of the coined walk, omega(k) = arccos(cos(theta) cos(k)). Massless (theta = 0)
// gives omega = |k|, a pure lightcone of speed 1. Massive (theta > 0) gives a gap at k = 0 and a relativistic
// omega^2 ~ c^2 k^2 + m^2. omega(0) = theta is the mass gap.
export function coinedWalkDispersion(input: {
  theta: number
  k: number
}): number {
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

  for (let x = 0; x < size; x++) {
    right[x] = Math.cos(k * x)
  }

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

// A 1D two-component Dirac quantum walk with chirality tracking. The state is a
// right-mover psiR[x] and left-mover psiL[x] (complex). Each beat applies the mass
// coin (R' = cos(m) R - i sin(m) L, L' = -i sin(m) R + cos(m) L) then the shift (R
// to x+1, L to x-1) on a periodic ring. A localized seed at the centre is either
// 'symmetric' (equal weight in both chiralities, splits into +/- movers when
// massless) or 'right' (a pure right-mover). Massless: chirality (|R|^2 - |L|^2) is
// conserved and each chirality streams at +/- the light speed. A mass couples the
// chiralities so it oscillates. The walk is unitary so the norm stays one. Returns
// the per-beat chirality and norm series and the final signed packet centres.
export function diracQuantumWalk(input: {
  size: number
  mass: number
  steps: number
  seedMode: 'symmetric' | 'right'
}): {
  chirality: number[]
  centerR: number
  centerL: number
  center: number
  norm: number[]
} {
  const { size: L, mass, steps, seedMode } = input
  type C = readonly [number, number]
  const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
  const cmul = (a: C, b: C): C => [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0],
  ]

  const cabs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
  const I: C = [0, 1]
  const wrap = (x: number): number => ((x % L) + L) % L

  let R: C[] = new Array(L).fill([0, 0])
  let Lf: C[] = new Array(L).fill([0, 0])

  const x0 = L >> 1

  if (seedMode === 'symmetric') {
    R[x0] = [1 / Math.SQRT2, 0]
    Lf[x0] = [1 / Math.SQRT2, 0]
  } else {
    R[x0] = [1, 0]
    Lf[x0] = [0, 0]
  }

  const c = Math.cos(mass)
  const s = Math.sin(mass)
  const chirality: number[] = []
  const norm: number[] = []

  for (let t = 0; t < steps; t++) {
    // coin: mass mixes the two chiralities
    const R2: C[] = new Array(L)
    const L2: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R2[x] = cadd(
        [c * R[x]![0], c * R[x]![1]],
        cmul([-s, 0], cmul(I, Lf[x]!)),
      )
      L2[x] = cadd(cmul([-s, 0], cmul(I, R[x]!)), [
        c * Lf[x]![0],
        c * Lf[x]![1],
      ])
    }

    // shift: R moves +1, L moves -1
    const R3: C[] = new Array(L)
    const L3: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = R2[x]!
      L3[wrap(x - 1)] = L2[x]!
    }

    R = R3
    Lf = L3

    let chR = 0
    let chL = 0
    let nn = 0

    for (let x = 0; x < L; x++) {
      chR += cabs2(R[x]!)
      chL += cabs2(Lf[x]!)
      nn += cabs2(R[x]!) + cabs2(Lf[x]!)
    }

    chirality.push(chR - chL)
    norm.push(nn)
  }

  // centres of the two chiralities (signed displacement from x0)
  let cR = 0
  let wR = 0
  let cL = 0
  let wL = 0

  for (let x = 0; x < L; x++) {
    const dx = ((x - x0 + L + L / 2) % L) - L / 2
    cR += dx * cabs2(R[x]!)
    wR += cabs2(R[x]!)
    cL += dx * cabs2(Lf[x]!)
    wL += cabs2(Lf[x]!)
  }

  // combined packet centre (weighted by total probability)
  let cc = 0
  let wc = 0

  for (let x = 0; x < L; x++) {
    const dx = ((x - x0 + L + L / 2) % L) - L / 2
    const w = cabs2(R[x]!) + cabs2(Lf[x]!)
    cc += dx * w
    wc += w
  }

  return {
    chirality,
    centerR: cR / (wR || 1),
    centerL: cL / (wL || 1),
    center: cc / (wc || 1),
    norm,
  }
}

// RUNG-1 simulator: a single-particle Dirac coined quantum walk on a periodic line. A Gaussian
// right-moving packet (width 14, momentum k0) is evolved by a mass coin (rotation by m) then a shift
// (c0 to x-1, c1 to x+1). The probability centroid is tracked each step and linearly fit; a massive
// packet drifts SLOWER than the lightcone (slope < 0.99). Used to show a distributed field excitation
// coarse-grains to a point particle obeying free-particle motion (Ehrenfest).
export function singleParticleQuantumWalk(input: {
  mass: number
  momentum: number
  size: number
  steps: number
}): { speed: number; linearR2: number; massive: boolean } {
  const { mass: m, momentum: k0, size: L, steps } = input

  // psi[x][c], c in {0,1}. coin = rotation by mass m, then shift (c=0 left, c=1 right).
  let re = [new Float64Array(L), new Float64Array(L)]
  let im = [new Float64Array(L), new Float64Array(L)]

  const x0 = L / 2
  const w = 14

  for (let x = 0; x < L; x++) {
    const g = Math.exp(-(((x - x0) / w) ** 2))
    // a right-moving packet at momentum k0 (weight on the right coin), e^{i k0 x}
    re[1]![x] = g * Math.cos(k0 * x)
    im[1]![x] = g * Math.sin(k0 * x)
  }

  const cm = Math.cos(m)
  const sm = Math.sin(m)

  const centroid = (): number => {
    let s = 0
    let n = 0

    for (let x = 0; x < L; x++) {
      const p =
        re[0]![x]! ** 2 +
        im[0]![x]! ** 2 +
        re[1]![x]! ** 2 +
        im[1]![x]! ** 2

      s += x * p
      n += p
    }

    return s / n
  }

  const xs: number[] = []

  for (let t = 0; t < steps; t++) {
    xs.push(centroid())

    // coin
    const nr = [new Float64Array(L), new Float64Array(L)]
    const ni = [new Float64Array(L), new Float64Array(L)]

    for (let x = 0; x < L; x++) {
      const a0r = cm * re[0]![x]! - sm * re[1]![x]!
      const a0i = cm * im[0]![x]! - sm * im[1]![x]!
      const a1r = sm * re[0]![x]! + cm * re[1]![x]!
      const a1i = sm * im[0]![x]! + cm * im[1]![x]!
      // shift: c0 -> x-1, c1 -> x+1
      const xm = (x - 1 + L) % L
      const xp = (x + 1) % L
      nr[0]![xm]! += a0r
      ni[0]![xm]! += a0i
      nr[1]![xp]! += a1r
      ni[1]![xp]! += a1i
    }

    re = nr
    im = ni
  }

  // linear fit of centroid vs t (skip first few for transient)
  const ts: number[] = []
  const ys: number[] = []

  for (let t = 5; t < steps; t++) {
    ts.push(t)
    ys.push(xs[t]!)
  }

  const fit = linearFit({ xs: ts, ys })

  return {
    speed: Math.abs(fit.slope),
    linearR2: fit.r2,
    massive: Math.abs(fit.slope) < 0.99,
  }
}

// RUNG-2 simulator: a two-particle coined quantum walk with a contact interaction. State psi[x1][x2][c1][c2]
// (flattened), a Gaussian pair packet started close together with net CoM momentum k0. Each beat coins each
// particle (mass m), shifts each, then applies a contact phase theta where x1==x2. The CENTER OF MASS moves
// uniformly (momentum conserved) regardless of theta; the RELATIVE coordinate spread reports binding (an
// attractive phase keeps the pair tighter than free). Used to show two particles coarse-grain to one composite.
export function twoParticleQuantumWalk(input: {
  mass: number
  momentum: number
  size: number
  steps: number
  contactPhase: number
}): { comSpeed: number; comR2: number; relGrowth: number } {
  const {
    mass: m,
    momentum: k0,
    size: L,
    steps,
    contactPhase: theta,
  } = input

  // psi[x1][x2][c1][c2], flattened. coin on each particle, shift on each, contact phase when x1==x2.
  const N = L * L * 4

  let re = new Float64Array(N)
  let im = new Float64Array(N)

  const idx = (
    x1: number,
    x2: number,
    c1: number,
    c2: number,
  ): number => ((x1 * L + x2) * 2 + c1) * 2 + c2

  const cm = Math.cos(m)
  const sm = Math.sin(m)
  const w = 4
  const c1s = Math.floor(L * 0.3)
  const c2s = Math.floor(L * 0.4) // start close together, well inside the lattice (no boundary wrap)

  let norm = 0

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      const g = Math.exp(
        -(((x1 - c1s) / w) ** 2) - ((x2 - c2s) / w) ** 2,
      )

      const ph = k0 * (x1 + x2) // both moving right (net CoM momentum)
      const i = idx(x1, x2, 1, 1)
      re[i] = g * Math.cos(ph)
      im[i] = g * Math.sin(ph)
      norm += g * g
    }
  }

  const s = 1 / Math.sqrt(norm)

  for (let i = 0; i < N; i++) {
    re[i]! *= s
    im[i]! *= s
  }

  const comList: number[] = []
  const relList: number[] = []

  for (let t = 0; t < steps; t++) {
    let com = 0
    let rel = 0

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        let p = 0

        for (let c1 = 0; c1 < 2; c1++) {
          for (let c2 = 0; c2 < 2; c2++) {
            const i = idx(x1, x2, c1, c2)
            p += re[i]! ** 2 + im[i]! ** 2
          }
        }

        com += ((x1 + x2) / 2) * p
        rel += Math.abs(x1 - x2) * p
      }
    }

    comList.push(com)
    relList.push(rel)

    // coin on particle 1 (mix c1), then particle 2 (mix c2)
    const nr = new Float64Array(N)
    const ni = new Float64Array(N)

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let c2 = 0; c2 < 2; c2++) {
          const i0 = idx(x1, x2, 0, c2)
          const i1 = idx(x1, x2, 1, c2)
          const a0r = cm * re[i0]! - sm * re[i1]!
          const a0i = cm * im[i0]! - sm * im[i1]!
          const a1r = sm * re[i0]! + cm * re[i1]!
          const a1i = sm * im[i0]! + cm * im[i1]!
          nr[i0] = a0r
          ni[i0] = a0i
          nr[i1] = a1r
          ni[i1] = a1i
        }
      }
    }

    const mr = new Float64Array(N)
    const mi = new Float64Array(N)

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let c1 = 0; c1 < 2; c1++) {
          const i0 = idx(x1, x2, c1, 0)
          const i1 = idx(x1, x2, c1, 1)
          const a0r = cm * nr[i0]! - sm * nr[i1]!
          const a0i = cm * ni[i0]! - sm * ni[i1]!
          const a1r = sm * nr[i0]! + cm * nr[i1]!
          const a1i = sm * ni[i0]! + cm * ni[i1]!
          mr[i0] = a0r
          mi[i0] = a0i
          mr[i1] = a1r
          mi[i1] = a1i
        }
      }
    }

    // shift both particles, then contact phase when x1==x2
    re = new Float64Array(N)
    im = new Float64Array(N)

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let c1 = 0; c1 < 2; c1++) {
          for (let c2 = 0; c2 < 2; c2++) {
            const i = idx(x1, x2, c1, c2)
            const nx1 = (x1 + (c1 === 1 ? 1 : -1) + L) % L
            const nx2 = (x2 + (c2 === 1 ? 1 : -1) + L) % L

            let vr = mr[i]!
            let vi = mi[i]!

            if (theta !== 0 && nx1 === nx2) {
              const ct = Math.cos(theta)
              const st = Math.sin(theta)
              const r2 = ct * vr - st * vi
              const i2 = st * vr + ct * vi
              vr = r2
              vi = i2
            }

            const j = idx(nx1, nx2, c1, c2)
            re[j]! += vr
            im[j]! += vi
          }
        }
      }
    }
  }

  // CoM linear fit + relative-coordinate growth (bound vs free)
  const ts: number[] = []
  const ys: number[] = []

  for (let t = 3; t < steps; t++) {
    ts.push(t)
    ys.push(comList[t]!)
  }

  const fit = linearFit({ xs: ts, ys })
  const relGrowth = relList[steps - 1]! - relList[0]! // how much the pair spread apart

  return { comSpeed: Math.abs(fit.slope), comR2: fit.r2, relGrowth }
}

// The survival probability of a two-mode superposition on the emergent Dirac quantum
// walk, the observable that reads its dephasing (objective-collapse) time. Two
// positive-energy momentum eigenstates (at wavenumber indices a and b) are superposed
// with equal weight and evolved by the real position-space rule (shift then mass coin,
// the same rule measuredCoinedWalkFrequency uses). The survival probability
// P(t) = |<psi(0)|psi(t)>|^2 = (1 + cos(dE t)) / 2, where dE = |omega(a) - omega(b)| is the
// emergent dispersion energy gap, so P first reaches zero (the state becomes orthogonal
// to its start) at t = pi / dE. This is the energy-time uncertainty relation, of which
// Penrose's gravitational objective-reduction time t = h-bar / E_G is a specific instance:
// the dephasing time is set by the energy gap, deterministically, with no stochastic rate.
// Returns the survival series and the dispersion gap so a measured gap (from the series)
// can be checked against the dispersion one.
export function diracTwoModeSurvival(input: {
  indexA: number
  indexB: number
  size: number
  mass: number
  beats: number
}): { survival: number[]; dispersionGap: number; energyA: number; energyB: number } {
  const { indexA, indexB, size, mass, beats } = input
  type Complex = readonly [number, number]
  const add = (u: Complex, v: Complex): Complex => [u[0] + v[0], u[1] + v[1]]
  const mul = (u: Complex, v: Complex): Complex => [
    u[0] * v[0] - u[1] * v[1],
    u[0] * v[1] + u[1] * v[0],
  ]

  const conj = (u: Complex): Complex => [u[0], -u[1]]
  const expo = (t: number): Complex => [Math.cos(t), Math.sin(t)]

  const cm = Math.cos(mass)
  const sm = Math.sin(mass)

  // the positive-energy eigenvector of U(k) = coin * shift(k), normalized
  const eigen = (
    k: number,
  ): { right: Complex; left: Complex; energy: number } => {
    const energy = Math.acos(cm * Math.cos(k))
    const lambda = expo(-energy)
    const eik = expo(k)
    const right: Complex = [lambda[0] - cm * eik[0], lambda[1] - cm * eik[1]]
    const left: Complex = mul([sm, 0], expo(-k))
    const norm =
      Math.hypot(right[0], right[1], left[0], left[1]) || 1

    return {
      right: [right[0] / norm, right[1] / norm],
      left: [left[0] / norm, left[1] / norm],
      energy,
    }
  }

  const ka = (2 * Math.PI * indexA) / size
  const kb = (2 * Math.PI * indexB) / size
  const ea = eigen(ka)
  const eb = eigen(kb)

  const right: Complex[] = new Array(size).fill([0, 0])
  const left: Complex[] = new Array(size).fill([0, 0])

  for (let x = 0; x < size; x++) {
    const pa = expo(ka * x)
    const pb = expo(kb * x)
    right[x] = add(mul(ea.right, pa), mul(eb.right, pb))
    left[x] = add(mul(ea.left, pa), mul(eb.left, pb))
  }

  let normSquared = 0

  for (let x = 0; x < size; x++) {
    normSquared +=
      right[x]![0] ** 2 +
      right[x]![1] ** 2 +
      left[x]![0] ** 2 +
      left[x]![1] ** 2
  }

  const scale = Math.sqrt(normSquared) || 1

  for (let x = 0; x < size; x++) {
    right[x] = [right[x]![0] / scale, right[x]![1] / scale]
    left[x] = [left[x]![0] / scale, left[x]![1] / scale]
  }

  const right0 = right.map(c => [...c] as Complex)
  const left0 = left.map(c => [...c] as Complex)
  const rightNext: Complex[] = new Array(size).fill([0, 0])
  const leftNext: Complex[] = new Array(size).fill([0, 0])
  const survival: number[] = []

  for (let t = 0; t < beats; t++) {
    let overlapRe = 0
    let overlapIm = 0

    for (let x = 0; x < size; x++) {
      const a = mul(conj(right0[x]!), right[x]!)
      const b = mul(conj(left0[x]!), left[x]!)
      overlapRe += a[0] + b[0]
      overlapIm += a[1] + b[1]
    }

    survival.push(overlapRe * overlapRe + overlapIm * overlapIm)

    // shift: right moves +1, left moves -1
    for (let x = 0; x < size; x++) {
      rightNext[x] = right[(x - 1 + size) % size]!
      leftNext[x] = left[(x + 1) % size]!
    }

    // mass coin
    for (let x = 0; x < size; x++) {
      const r = rightNext[x]!
      const l = leftNext[x]!
      right[x] = [cm * r[0] - sm * l[0], cm * r[1] - sm * l[1]]
      left[x] = [sm * r[0] + cm * l[0], sm * r[1] + cm * l[1]]
    }
  }

  return {
    survival,
    dispersionGap: Math.abs(ea.energy - eb.energy),
    energyA: ea.energy,
    energyB: eb.energy,
  }
}

// The overlap between two states evolved by the emergent Dirac walk, the observable that
// witnesses unitarity and so the no-cloning theorem. Each state is a superposition of
// positive-energy momentum eigenstates (given as {index, weightReal, weightImag}). Both are
// evolved by the same real position-space rule (shift then mass coin). The magnitude of the
// inner product <psi1(t)|psi2(t)> is returned per beat. A unitary rule preserves it exactly, so
// two non-orthogonal states keep their overlap and cannot both be cloned (cloning would force
// the overlap to equal its own square). A `leak` (amplitude damped at the boundary each beat)
// makes the rule non-unitary and the overlap is no longer preserved.
export function diracOverlapEvolution(input: {
  statesA: { index: number; weightReal: number; weightImag: number }[]
  statesB: { index: number; weightReal: number; weightImag: number }[]
  size: number
  mass: number
  beats: number
  leak?: number
}): number[] {
  const { statesA, statesB, size, mass, beats } = input
  const leak = input.leak ?? 0
  type Complex = readonly [number, number]
  const add = (u: Complex, v: Complex): Complex => [u[0] + v[0], u[1] + v[1]]
  const mul = (u: Complex, v: Complex): Complex => [
    u[0] * v[0] - u[1] * v[1],
    u[0] * v[1] + u[1] * v[0],
  ]

  const conj = (u: Complex): Complex => [u[0], -u[1]]
  const expo = (t: number): Complex => [Math.cos(t), Math.sin(t)]
  const cm = Math.cos(mass)
  const sm = Math.sin(mass)

  const eigen = (k: number): { right: Complex; left: Complex } => {
    const energy = Math.acos(cm * Math.cos(k))
    const lambda = expo(-energy)
    const eik = expo(k)
    const right: Complex = [lambda[0] - cm * eik[0], lambda[1] - cm * eik[1]]
    const left: Complex = mul([sm, 0], expo(-k))
    const norm = Math.hypot(right[0], right[1], left[0], left[1]) || 1

    return {
      right: [right[0] / norm, right[1] / norm],
      left: [left[0] / norm, left[1] / norm],
    }
  }

  const build = (
    modes: { index: number; weightReal: number; weightImag: number }[],
  ): { right: Complex[]; left: Complex[] } => {
    const right: Complex[] = new Array(size).fill([0, 0])
    const left: Complex[] = new Array(size).fill([0, 0])

    for (const mode of modes) {
      const k = (2 * Math.PI * mode.index) / size
      const e = eigen(k)
      const weight: Complex = [mode.weightReal, mode.weightImag]

      for (let x = 0; x < size; x++) {
        const phase = expo(k * x)
        right[x] = add(right[x]!, mul(mul(e.right, phase), weight))
        left[x] = add(left[x]!, mul(mul(e.left, phase), weight))
      }
    }

    let normSquared = 0

    for (let x = 0; x < size; x++) {
      normSquared +=
        right[x]![0] ** 2 + right[x]![1] ** 2 + left[x]![0] ** 2 + left[x]![1] ** 2
    }

    const scale = Math.sqrt(normSquared) || 1

    for (let x = 0; x < size; x++) {
      right[x] = [right[x]![0] / scale, right[x]![1] / scale]
      left[x] = [left[x]![0] / scale, left[x]![1] / scale]
    }

    return { right, left }
  }

  const a = build(statesA)
  const b = build(statesB)

  const step = (state: { right: Complex[]; left: Complex[] }): void => {
    const rightNext: Complex[] = new Array(size).fill([0, 0])
    const leftNext: Complex[] = new Array(size).fill([0, 0])

    for (let x = 0; x < size; x++) {
      rightNext[x] = state.right[(x - 1 + size) % size]!
      leftNext[x] = state.left[(x + 1) % size]!
    }

    for (let x = 0; x < size; x++) {
      const r = rightNext[x]!
      const l = leftNext[x]!
      state.right[x] = [cm * r[0] - sm * l[0], cm * r[1] - sm * l[1]]
      state.left[x] = [sm * r[0] + cm * l[0], sm * r[1] + cm * l[1]]
    }

    if (leak > 0) {
      // damp the boundary cell, a non-unitary loss
      state.right[0] = [state.right[0]![0] * (1 - leak), state.right[0]![1] * (1 - leak)]
      state.left[0] = [state.left[0]![0] * (1 - leak), state.left[0]![1] * (1 - leak)]
    }
  }

  const overlaps: number[] = []

  for (let t = 0; t < beats; t++) {
    let re = 0
    let im = 0

    for (let x = 0; x < size; x++) {
      const p = mul(conj(a.right[x]!), b.right[x]!)
      const q = mul(conj(a.left[x]!), b.left[x]!)
      re += p[0] + q[0]
      im += p[1] + q[1]
    }

    overlaps.push(Math.hypot(re, im))
    step(a)
    step(b)
  }

  return overlaps
}
