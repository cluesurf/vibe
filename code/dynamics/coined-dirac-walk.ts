// The one-dimensional two-component coined Dirac walk, defined ONCE. Before 2026-08-31 this walk was
// re-implemented six times (quantum-walk, dirac-scattering, klein-barrier, bloch-oscillation,
// quasiperiodic-walk, mass-domain-wall), each with its own complex helpers, against the methodology's
// own rule that a general capability lives in one place.
//
// What it is, stated plainly so nobody mistakes it for the base rule: a HAND-WRITTEN unitary model. The
// state is a complex right-mover amplitude R(x) and a complex left-mover amplitude L(x) on a line of
// `size` sites. One step is
//
//   coin   R' = cos(m_x) R - i sin(m_x) L,   L' = -i sin(m_x) R + cos(m_x) L    (a per-site mass rotation)
//   phase  R' *= e^{-i V_x},  L' *= e^{-i V_x}                                    (an optional per-site potential)
//   shift  R moves to x + 1, L moves to x - 1                                    (periodic, or open with loss)
//   damp   both *= (1 - leak)                                                    (optional, a lossy walk)
//
// It is NOT the single-particle sector of the lattice-gas rule. The rule (code/rule/lattice-gas,
// code/rule/collision) is a permutation of ternary Int8 slots with no amplitude, no phase and no
// superposition, and foundations/rule-has-no-amplitudes measures that directly. Every experiment built on
// this walk is therefore known quantum-walk physics (honest depth L2 at best), whatever it says about the
// {3,4,3,4} coin.

import { Complex, cMul } from '@/code/algebra/linear/complex'

export type CoinedWalk = {
  size: number
  rightRe: Float64Array
  rightIm: Float64Array
  leftRe: Float64Array
  leftIm: Float64Array
}

export function makeCoinedWalk(input: { size: number }): CoinedWalk {
  const size = input.size

  return {
    size,
    rightRe: new Float64Array(size),
    rightIm: new Float64Array(size),
    leftRe: new Float64Array(size),
    leftIm: new Float64Array(size),
  }
}

export function cloneCoinedWalk(walk: CoinedWalk): CoinedWalk {
  return {
    size: walk.size,
    rightRe: Float64Array.from(walk.rightRe),
    rightIm: Float64Array.from(walk.rightIm),
    leftRe: Float64Array.from(walk.leftRe),
    leftIm: Float64Array.from(walk.leftIm),
  }
}

// Add (not replace) a Gaussian packet e^{-(x - center)^2 / 2 width^2} e^{i momentum x} into one or both
// chiralities. `both` puts equal real weight in R and L (a packet at rest). Nothing is normalized here,
// call normalizeCoinedWalk when a unit norm is wanted, so two seeds can be superposed by adding twice.
export function addGaussianPacket(input: {
  walk: CoinedWalk
  center: number
  width: number
  momentum: number
  chirality: 'right' | 'left' | 'both'
}): void {
  const { walk, center, width, momentum, chirality } = input

  for (let x = 0; x < walk.size; x++) {
    const envelope = Math.exp(
      -((x - center) * (x - center)) / (2 * width * width),
    )

    const re = envelope * Math.cos(momentum * x)
    const im = envelope * Math.sin(momentum * x)

    if (chirality !== 'left') {
      walk.rightRe[x]! += re
      walk.rightIm[x]! += im
    }

    if (chirality !== 'right') {
      walk.leftRe[x]! += re
      walk.leftIm[x]! += im
    }
  }
}

// Add a unit amplitude at one site in one chirality (or 1/sqrt2 in each for `both`).
export function addPointSeed(input: {
  walk: CoinedWalk
  site: number
  chirality: 'right' | 'left' | 'both'
}): void {
  const { walk, site, chirality } = input

  if (chirality === 'both') {
    walk.rightRe[site]! += Math.SQRT1_2
    walk.leftRe[site]! += Math.SQRT1_2
  } else if (chirality === 'right') {
    walk.rightRe[site]! += 1
  } else {
    walk.leftRe[site]! += 1
  }
}

// |R(x)|^2 and |L(x)|^2, each as re^2 + im^2. The sums below add the two chiralities as
// (|R|^2) + (|L|^2), the association the original six copies used, so results match bit for bit.
function rightWeight(walk: CoinedWalk, x: number): number {
  return walk.rightRe[x]! * walk.rightRe[x]! + walk.rightIm[x]! * walk.rightIm[x]!
}

function leftWeight(walk: CoinedWalk, x: number): number {
  return walk.leftRe[x]! * walk.leftRe[x]! + walk.leftIm[x]! * walk.leftIm[x]!
}

export function coinedWalkNorm(walk: CoinedWalk): number {
  let norm = 0

  for (let x = 0; x < walk.size; x++) {
    norm += rightWeight(walk, x) + leftWeight(walk, x)
  }

  return norm
}

export function normalizeCoinedWalk(walk: CoinedWalk): void {
  const scale = 1 / Math.sqrt(coinedWalkNorm(walk))

  for (let x = 0; x < walk.size; x++) {
    walk.rightRe[x]! *= scale
    walk.rightIm[x]! *= scale
    walk.leftRe[x]! *= scale
    walk.leftIm[x]! *= scale
  }
}

// The per-site probability |R|^2 + |L|^2.
export function coinedWalkProbability(walk: CoinedWalk): Float64Array {
  const p = new Float64Array(walk.size)

  for (let x = 0; x < walk.size; x++) {
    p[x] = rightWeight(walk, x) + leftWeight(walk, x)
  }

  return p
}

// The total right-mover weight and left-mover weight, summed separately over the line.
export function coinedWalkWeights(walk: CoinedWalk): {
  right: number
  left: number
} {
  let right = 0
  let left = 0

  for (let x = 0; x < walk.size; x++) {
    right += rightWeight(walk, x)
    left += leftWeight(walk, x)
  }

  return { right, left }
}

// The chirality |R|^2 - |L|^2 summed over the line, the mean velocity of the walk.
export function coinedWalkChirality(walk: CoinedWalk): number {
  const { right, left } = coinedWalkWeights(walk)

  return right - left
}

// A per-site mass profile as its cosines and sines, precomputed once.
export function massProfile(input: {
  size: number
  massAt: (x: number) => number
}): { cosMass: Float64Array; sinMass: Float64Array } {
  const cosMass = new Float64Array(input.size)
  const sinMass = new Float64Array(input.size)

  for (let x = 0; x < input.size; x++) {
    const m = input.massAt(x)

    cosMass[x] = Math.cos(m)
    sinMass[x] = Math.sin(m)
  }

  return { cosMass, sinMass }
}

// A per-site potential V(x) as the phase factor e^{-i V(x)}, precomputed once.
export function potentialPhase(input: {
  size: number
  potentialAt: (x: number) => number
}): { phaseRe: Float64Array; phaseIm: Float64Array } {
  const phaseRe = new Float64Array(input.size)
  const phaseIm = new Float64Array(input.size)

  for (let x = 0; x < input.size; x++) {
    const v = input.potentialAt(x)

    phaseRe[x] = Math.cos(-v)
    phaseIm[x] = Math.sin(-v)
  }

  return { phaseRe, phaseIm }
}

// One step of the walk, in place: coin, optional phase, shift, optional damp. `boundary: 'open'` drops
// the amplitude that would leave the line (the packet must never reach an end for that to be harmless).
export function coinedWalkStep(input: {
  walk: CoinedWalk
  cosMass: Float64Array
  sinMass: Float64Array
  phaseRe?: Float64Array
  phaseIm?: Float64Array
  boundary: 'periodic' | 'open'
  damp?: number
}): void {
  const { walk, cosMass, sinMass, phaseRe, phaseIm } = input
  const size = walk.size
  const damp = input.damp ?? 1

  const nextRightRe = new Float64Array(size)
  const nextRightIm = new Float64Array(size)
  const nextLeftRe = new Float64Array(size)
  const nextLeftIm = new Float64Array(size)

  for (let x = 0; x < size; x++) {
    const c = cosMass[x]!
    const s = sinMass[x]!
    const r: Complex = { re: walk.rightRe[x]!, im: walk.rightIm[x]! }
    const l: Complex = { re: walk.leftRe[x]!, im: walk.leftIm[x]! }

    // -i s L = s (L.im, -L.re),  -i s R = s (R.im, -R.re)
    let coinedRight: Complex = {
      re: c * r.re + s * l.im,
      im: c * r.im - s * l.re,
    }

    let coinedLeft: Complex = {
      re: s * r.im + c * l.re,
      im: -s * r.re + c * l.im,
    }

    if (phaseRe && phaseIm) {
      const phase: Complex = { re: phaseRe[x]!, im: phaseIm[x]! }

      coinedRight = cMul(phase, coinedRight)
      coinedLeft = cMul(phase, coinedLeft)
    }

    // shift: right movers to x + 1, left movers to x - 1
    const toRight = x + 1
    const toLeft = x - 1

    if (input.boundary === 'periodic' || toRight < size) {
      const target = toRight % size

      nextRightRe[target] = coinedRight.re * damp
      nextRightIm[target] = coinedRight.im * damp
    }

    if (input.boundary === 'periodic' || toLeft >= 0) {
      const target = (toLeft + size) % size

      nextLeftRe[target] = coinedLeft.re * damp
      nextLeftIm[target] = coinedLeft.im * damp
    }
  }

  walk.rightRe.set(nextRightRe)
  walk.rightIm.set(nextRightIm)
  walk.leftRe.set(nextLeftRe)
  walk.leftIm.set(nextLeftIm)
}

// The number of sites whose probability exceeds a floor, the support of the walk.
export function coinedWalkSupport(input: {
  walk: CoinedWalk
  floor: number
}): number {
  const p = coinedWalkProbability(input.walk)

  let support = 0

  for (const probability of p) {
    if (probability > input.floor) {
      support++
    }
  }

  return support
}

// The signed displacement of a site from an origin on the periodic line, folded into (-size/2, size/2].
export function periodicOffset(input: {
  site: number
  origin: number
  size: number
}): number {
  const { site, origin, size } = input

  return ((site - origin + size + size / 2) % size) - size / 2
}

// The probability-weighted mean signed displacement from an origin, the packet centroid.
export function coinedWalkCentroid(input: {
  walk: CoinedWalk
  origin: number
}): number {
  const p = coinedWalkProbability(input.walk)
  const size = input.walk.size

  let weighted = 0
  let weight = 0

  for (let x = 0; x < size; x++) {
    const dx = periodicOffset({ site: x, origin: input.origin, size })

    weighted += dx * p[x]!
    weight += p[x]!
  }

  return weighted / (weight || 1)
}

// The centroids of the right-mover weight, the left-mover weight, and their sum, as signed displacements
// from an origin.
export function coinedWalkChiralityCentroids(input: {
  walk: CoinedWalk
  origin: number
}): { right: number; left: number; both: number } {
  const { walk, origin } = input
  const size = walk.size

  let rightWeighted = 0
  let rightTotal = 0
  let leftWeighted = 0
  let leftTotal = 0

  for (let x = 0; x < size; x++) {
    const dx = periodicOffset({ site: x, origin, size })

    rightWeighted += dx * rightWeight(walk, x)
    rightTotal += rightWeight(walk, x)
    leftWeighted += dx * leftWeight(walk, x)
    leftTotal += leftWeight(walk, x)
  }

  let bothWeighted = 0
  let bothTotal = 0

  for (let x = 0; x < size; x++) {
    const dx = periodicOffset({ site: x, origin, size })
    const w = rightWeight(walk, x) + leftWeight(walk, x)

    bothWeighted += dx * w
    bothTotal += w
  }

  return {
    right: rightWeighted / (rightTotal || 1),
    left: leftWeighted / (leftTotal || 1),
    both: bothWeighted / (bothTotal || 1),
  }
}

// The probability-weighted standard deviation of the signed displacement from an origin, the packet spread.
export function coinedWalkSpread(input: {
  walk: CoinedWalk
  origin: number
}): number {
  const p = coinedWalkProbability(input.walk)
  const size = input.walk.size

  let mean = 0
  let weight = 0

  for (let x = 0; x < size; x++) {
    const dx = periodicOffset({ site: x, origin: input.origin, size })

    mean += dx * p[x]!
    weight += p[x]!
  }

  mean /= weight || 1

  let variance = 0

  for (let x = 0; x < size; x++) {
    const dx = periodicOffset({ site: x, origin: input.origin, size })

    variance += (dx - mean) * (dx - mean) * p[x]!
  }

  variance /= weight || 1

  return Math.sqrt(variance)
}

// The probability inside a window of sites around a centre (inclusive, periodic), as a fraction of the total.
export function coinedWalkWindowFraction(input: {
  walk: CoinedWalk
  centre: number
  window: number
}): number {
  const p = coinedWalkProbability(input.walk)
  const size = input.walk.size

  let total = 0

  for (let x = 0; x < size; x++) {
    total += p[x]!
  }

  let inside = 0

  for (let x = input.centre - input.window; x <= input.centre + input.window; x++) {
    inside += p[((x % size) + size) % size]!
  }

  return inside / (total || 1)
}

// The probability in the half-open site range [from, to), no wrapping.
export function coinedWalkRangeProbability(input: {
  walk: CoinedWalk
  from: number
  to: number
}): number {
  const p = coinedWalkProbability(input.walk)

  let sum = 0

  for (let x = Math.max(0, input.from); x < Math.min(input.walk.size, input.to); x++) {
    sum += p[x]!
  }

  return sum
}

// The largest site-wise departure of the probability of a superposed pair from the sum of the two
// separate probabilities, max_x |p_AB(x) - p_A(x) - p_B(x)|. Zero means no interference anywhere.
export function coinedWalkInterference(input: {
  together: CoinedWalk
  a: CoinedWalk
  b: CoinedWalk
}): number {
  const pTogether = coinedWalkProbability(input.together)
  const pA = coinedWalkProbability(input.a)
  const pB = coinedWalkProbability(input.b)

  let worst = 0

  for (let x = 0; x < pTogether.length; x++) {
    worst = Math.max(worst, Math.abs(pTogether[x]! - pA[x]! - pB[x]!))
  }

  return worst
}
