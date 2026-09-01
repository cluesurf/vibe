// The band structure of the coined Dirac walk (code/dynamics/coined-dirac-walk) with a uniform mass m
// and no potential. In momentum space one step is U(k) = diag(e^{-ik}, e^{ik}) C(m) with the coin
// C = [[cos m, -i sin m], [-i sin m, cos m]], so the quasienergies are +-E(k) with
//
//   cos E(k) = cos m cos k,   v(k) = dE/dk = cos m sin k / sin E(k),
//
// the positive band being the eigenvector of U(k) with eigenvalue e^{-iE}. A packet built from that
// band alone is a positive-energy particle, which is what a classical comparison needs: the Gaussian
// seeds in coined-dirac-walk put weight in both bands (a packet "at rest" with equal chiralities is
// half positive, half negative energy) and its centroid does not follow one classical trajectory.
// This is a hand-written unitary model, not the lattice-gas rule (see rule-has-no-amplitudes).

import {
  type ComplexPair,
  pairAbs2,
  pairAdd,
  pairFromPhase,
  pairMul,
  pairScale,
  pairSub,
} from '@/code/algebra/linear/complex-pair'
import type { CoinedWalk } from '@/code/dynamics/coined-dirac-walk'

// The positive quasienergy at momentum k.
export function walkBandEnergy(k: number, mass: number): number {
  return Math.acos(Math.cos(mass) * Math.cos(k))
}

// The group velocity of the positive band at momentum k.
export function walkGroupVelocity(k: number, mass: number): number {
  const energy = walkBandEnergy(k, mass)

  return (Math.cos(mass) * Math.sin(k)) / Math.sin(energy)
}

// The normalized positive-band spinor (right, left) at momentum k, the eigenvector of U(k) with
// eigenvalue e^{-iE(k)}. From the first row of (U - lambda) u = 0:
//   (e^{-ik} cos m - lambda) r + (-i e^{-ik} sin m) l = 0.
export function walkPositiveBandSpinor(
  k: number,
  mass: number,
): { right: ComplexPair; left: ComplexPair } {
  const lambda = pairFromPhase(-walkBandEnergy(k, mass))
  const shift = pairFromPhase(-k)
  const a = pairSub(pairScale(shift, Math.cos(mass)), lambda)
  // b = -i e^{-ik} sin m
  const b = pairMul([0, -1], pairScale(shift, Math.sin(mass)))
  // l = -a r / b with r = 1: multiply by the conjugate of b over |b|^2
  const bAbs2 = pairAbs2(b)
  const left: ComplexPair =
    bAbs2 > 0
      ? pairScale(pairMul([-a[0], -a[1]], [b[0], -b[1]]), 1 / bAbs2)
      : [0, 0]
  const norm = Math.sqrt(1 + pairAbs2(left))

  return { right: [1 / norm, 0], left: pairScale(left, 1 / norm) }
}

// Add a Gaussian packet of positive-band Bloch states, weights e^{-(k - k0)^2 width^2 / 2} over the
// lattice momenta k_n = 2 pi n / size, so the position width is about `width` sites and every
// component carries positive energy. Nothing is normalized here.
export function addPositiveBandPacket(input: {
  walk: CoinedWalk
  center: number
  width: number
  momentum: number
  mass: number
}): void {
  const { walk, center, width, momentum, mass } = input
  const size = walk.size

  for (let n = 0; n < size; n++) {
    let k = (2 * Math.PI * n) / size

    if (k > Math.PI) {
      k -= 2 * Math.PI
    }

    const dk = k - momentum
    const weight = Math.exp(-(dk * dk * width * width) / 2)

    if (weight < 1e-12) {
      continue
    }

    const spinor = walkPositiveBandSpinor(k, mass)

    for (let x = 0; x < size; x++) {
      const wave = pairScale(pairFromPhase(k * (x - center)), weight)
      const right = pairMul(wave, spinor.right)
      const left = pairMul(wave, spinor.left)

      walk.rightRe[x]! += right[0]
      walk.rightIm[x]! += right[1]
      walk.leftRe[x]! += left[0]
      walk.leftIm[x]! += left[1]
    }
  }
}

// The momentum-space amplitudes of both chiralities at every lattice momentum k_n = 2 pi n / size.
function momentumAmplitudes(walk: CoinedWalk): {
  right: ComplexPair[]
  left: ComplexPair[]
} {
  const size = walk.size
  const right: ComplexPair[] = []
  const left: ComplexPair[] = []

  for (let n = 0; n < size; n++) {
    const k = (2 * Math.PI * n) / size

    let r: ComplexPair = [0, 0]
    let l: ComplexPair = [0, 0]

    for (let x = 0; x < size; x++) {
      const phase = pairFromPhase(-k * x)

      r = pairAdd(r, pairMul(phase, [walk.rightRe[x]!, walk.rightIm[x]!]))
      l = pairAdd(l, pairMul(phase, [walk.leftRe[x]!, walk.leftIm[x]!]))
    }

    right.push(r)
    left.push(l)
  }

  return { right, left }
}

// The circular mean momentum of the walk, the angle of the probability-weighted sum of e^{ik}, which
// is the right average on the periodic Brillouin zone.
export function walkMeanMomentum(walk: CoinedWalk): number {
  const { right, left } = momentumAmplitudes(walk)
  const size = walk.size

  let re = 0
  let im = 0

  for (let n = 0; n < size; n++) {
    const k = (2 * Math.PI * n) / size
    const weight = pairAbs2(right[n]!) + pairAbs2(left[n]!)

    re += weight * Math.cos(k)
    im += weight * Math.sin(k)
  }

  return Math.atan2(im, re)
}

// The fraction of the walk's weight in the positive band, by projecting each momentum component on the
// positive-band spinor. What is not positive is negative, the two bands span the space at every k.
export function walkPositiveBandFraction(
  walk: CoinedWalk,
  mass: number,
): number {
  const { right, left } = momentumAmplitudes(walk)
  const size = walk.size

  let positive = 0
  let total = 0

  for (let n = 0; n < size; n++) {
    let k = (2 * Math.PI * n) / size

    if (k > Math.PI) {
      k -= 2 * Math.PI
    }

    const spinor = walkPositiveBandSpinor(k, mass)
    // overlap = conj(u) . phi
    const overlap = pairAdd(
      pairMul([spinor.right[0], -spinor.right[1]], right[n]!),
      pairMul([spinor.left[0], -spinor.left[1]], left[n]!),
    )

    positive += pairAbs2(overlap)
    total += pairAbs2(right[n]!) + pairAbs2(left[n]!)
  }

  return total > 0 ? positive / total : 0
}

// The momentum distribution |phi(k_n)|^2 of the walk at every lattice momentum, as (k, weight) pairs
// with k folded into (-pi, pi]. This is what the Ehrenfest prediction is averaged over.
export function walkMomentumDistribution(
  walk: CoinedWalk,
): { k: number; weight: number }[] {
  const { right, left } = momentumAmplitudes(walk)
  const size = walk.size
  const out: { k: number; weight: number }[] = []

  let total = 0

  for (let n = 0; n < size; n++) {
    total += pairAbs2(right[n]!) + pairAbs2(left[n]!)
  }

  for (let n = 0; n < size; n++) {
    let k = (2 * Math.PI * n) / size

    if (k > Math.PI) {
      k -= 2 * Math.PI
    }

    out.push({
      k,
      weight: (pairAbs2(right[n]!) + pairAbs2(left[n]!)) / total,
    })
  }

  return out
}

// The Ehrenfest centroid trajectory of a positive-band packet under a constant force: the momentum
// distribution shifts rigidly by -force per step (a linear potential is a momentum translation, applied
// between the coin and the shift, so each step sees the midpoint momentum), and
// the centroid advances by the distribution-averaged group velocity, and the Berry-connection offset
// of the band moves with the momentum (the anomalous shift). Returns the displacement from the initial
// centroid after each of `steps` steps.
export function ehrenfestTrajectory(input: {
  distribution: { k: number; weight: number }[]
  mass: number
  force: number
  steps: number
}): number[] {
  const { distribution, mass, force, steps } = input
  const out: number[] = []

  let x = 0
  let berryStart = 0

  for (const { k, weight } of distribution) {
    berryStart += weight * walkBerryConnection(k, mass)
  }

  for (let t = 0; t < steps; t++) {
    let velocity = 0
    let berry = 0

    // the momentum kick lands between the coin and the shift, so the step sees the midpoint momentum
    const midpoint = force * (t + 0.5)

    for (const { k, weight } of distribution) {
      velocity += weight * walkGroupVelocity(k - midpoint, mass)
      berry += weight * walkBerryConnection(k - midpoint, mass)
    }

    x += velocity
    out.push(x + berry - berryStart)
  }

  return out
}

// The Berry connection of the positive band in the gauge walkPositiveBandSpinor fixes (right component
// real and positive), A(k) = i u(k)^dagger du/dk by a central difference. With psi(x) = sum phi(k) e^{ikx}
// the position operator is i d/dk, so a packet with real momentum weights sits at <A> relative to its
// nominal centre, and under a force that offset moves with k, the anomalous shift the Ehrenfest
// trajectory must include.
export function walkBerryConnection(k: number, mass: number): number {
  const delta = 1e-5
  const u = walkPositiveBandSpinor(k, mass)
  const plus = walkPositiveBandSpinor(k + delta, mass)
  const minus = walkPositiveBandSpinor(k - delta, mass)
  const dRight = pairScale(pairSub(plus.right, minus.right), 1 / (2 * delta))
  const dLeft = pairScale(pairSub(plus.left, minus.left), 1 / (2 * delta))
  const inner = pairAdd(
    pairMul([u.right[0], -u.right[1]], dRight),
    pairMul([u.left[0], -u.left[1]], dLeft),
  )

  // i (a + ib) = -b + ia, real part -b
  return -inner[1]
}
