// Scattering on the emergent Dirac walk, the first rung toward an asymptotic S-matrix. A wave packet
// with definite rightward momentum starts in the free region and runs into a mass-step barrier. The
// reversible walk sends the incoming state to an outgoing superposition of a transmitted packet
// (past the barrier) and a reflected packet (back into the free region), and because the walk is
// unitary the two outgoing probabilities sum to one: the emergent two-channel S-matrix is unitary.
// A lossy walk (amplitudes damped each step) loses probability, so the outgoing channels sum to less
// than one, the S-matrix is not unitary. The scattering is real: a taller barrier reflects more.

type Complex = readonly [number, number]

const add = (a: Complex, b: Complex): Complex => [
  a[0] + b[0],
  a[1] + b[1],
]

const mul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const abs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1]
const IMAG: Complex = [0, 1]

// Run the Dirac walk with a position-dependent mass (zero left of the barrier, `barrierMass` at and
// right of it) on an incoming rightward-momentum Gaussian packet. Returns the transmitted and
// reflected probabilities (norm past and before the barrier) and the total surviving norm.
export function diracScatter(input: {
  size: number
  barrierMass: number
  momentum: number
  width: number
  steps: number
  leak: number
}): { transmitted: number; reflected: number; total: number } {
  const { size: L, barrierMass, momentum, width, steps, leak } = input

  const barrier = L >> 1
  const start = L >> 2

  let right: Complex[] = new Array(L).fill([0, 0])
  let left: Complex[] = new Array(L).fill([0, 0])

  // an incoming rightward packet: a Gaussian envelope carrying momentum, in the right-mover channel
  let normalization = 0

  for (let x = 0; x < L; x++) {
    const envelope = Math.exp(
      -((x - start) * (x - start)) / (2 * width * width),
    )

    const phase = momentum * x

    right[x] = [envelope * Math.cos(phase), envelope * Math.sin(phase)]
    normalization += abs2(right[x]!)
  }

  const scale = 1 / Math.sqrt(normalization)

  for (let x = 0; x < L; x++)
    right[x] = [right[x]![0] * scale, right[x]![1] * scale]

  const massAt = (x: number): number => (x >= barrier ? barrierMass : 0)
  const damp = 1 - leak

  for (let t = 0; t < steps; t++) {
    const coinedRight: Complex[] = new Array(L)
    const coinedLeft: Complex[] = new Array(L)

    for (let x = 0; x < L; x++) {
      const cosMass = Math.cos(massAt(x))
      const sinMass = Math.sin(massAt(x))

      // the mass coin mixes the two chiralities
      coinedRight[x] = add(
        [cosMass * right[x]![0], cosMass * right[x]![1]],
        mul([-sinMass, 0], mul(IMAG, left[x]!)),
      )

      coinedLeft[x] = add(mul([-sinMass, 0], mul(IMAG, right[x]!)), [
        cosMass * left[x]![0],
        cosMass * left[x]![1],
      ])
    }

    // shift: right movers advance, left movers retreat. Open ends (no wrap): amplitude that would
    // leave the line is dropped, which is fine because the packet never reaches the ends.
    const nextRight: Complex[] = new Array(L).fill([0, 0])
    const nextLeft: Complex[] = new Array(L).fill([0, 0])

    for (let x = 0; x < L; x++) {
      if (x + 1 < L) {
        nextRight[x + 1] = [
          coinedRight[x]![0] * damp,
          coinedRight[x]![1] * damp,
        ]
      }

      if (x - 1 >= 0) {
        nextLeft[x - 1] = [
          coinedLeft[x]![0] * damp,
          coinedLeft[x]![1] * damp,
        ]
      }
    }

    right = nextRight
    left = nextLeft
  }

  let transmitted = 0
  let reflected = 0

  for (let x = 0; x < L; x++) {
    const probability = abs2(right[x]!) + abs2(left[x]!)

    if (x >= barrier) transmitted += probability
    else reflected += probability
  }

  return { transmitted, reflected, total: transmitted + reflected }
}

// The exact evanescent decay rate of the walk inside a mass barrier, from the walk's own
// dispersion cos(omega) = cos(mass) cos(k) continued to imaginary momentum k = i kappa:
// cosh(kappa) = cos(omega) / cos(mass), defined when the frequency sits below the mass gap.
export function walkTunnelKappa(input: {
  omega: number
  mass: number
}): number {
  return Math.acosh(Math.cos(input.omega) / Math.cos(input.mass))
}

// The continuum Dirac decay rate for the same sub-gap frequency, kappa = sqrt(m^2 - omega^2),
// the small-angle limit of the walk formula.
export function continuumTunnelKappa(input: {
  omega: number
  mass: number
}): number {
  return Math.sqrt(input.mass * input.mass - input.omega * input.omega)
}

// Run the Dirac walk through a FINITE mass barrier (width cells of mass `barrierMass`, massless
// elsewhere) with a wide rightward-momentum Gaussian packet (narrow momentum spread), and return
// the transmitted probability past the barrier. Used to measure the tunneling decay against the
// exact walk formula.
export function diracTunnel(input: {
  size: number
  barrierStart: number
  barrierWidth: number
  barrierMass: number
  momentum: number
  packetCenter: number
  packetWidth: number
  steps: number
}): number {
  const {
    size: L,
    barrierStart,
    barrierWidth,
    barrierMass,
    momentum,
    packetCenter,
    packetWidth,
    steps,
  } = input

  let right: Complex[] = new Array(L).fill([0, 0])
  let left: Complex[] = new Array(L).fill([0, 0])

  let normalization = 0

  for (let x = 0; x < L; x++) {
    const envelope = Math.exp(
      -((x - packetCenter) * (x - packetCenter)) /
        (2 * packetWidth * packetWidth),
    )

    const phase = momentum * x

    right[x] = [envelope * Math.cos(phase), envelope * Math.sin(phase)]
    normalization += abs2(right[x]!)
  }

  const scale = 1 / Math.sqrt(normalization)

  for (let x = 0; x < L; x++)
    right[x] = [right[x]![0] * scale, right[x]![1] * scale]

  const cosBarrier = Math.cos(barrierMass)
  const sinBarrier = Math.sin(barrierMass)

  for (let t = 0; t < steps; t++) {
    const coinedRight: Complex[] = new Array(L)
    const coinedLeft: Complex[] = new Array(L)

    for (let x = 0; x < L; x++) {
      const inBarrier =
        x >= barrierStart && x < barrierStart + barrierWidth

      const cosMass = inBarrier ? cosBarrier : 1
      const sinMass = inBarrier ? sinBarrier : 0

      coinedRight[x] = add(
        [cosMass * right[x]![0], cosMass * right[x]![1]],
        mul([-sinMass, 0], mul(IMAG, left[x]!)),
      )

      coinedLeft[x] = add(mul([-sinMass, 0], mul(IMAG, right[x]!)), [
        cosMass * left[x]![0],
        cosMass * left[x]![1],
      ])
    }

    const nextRight: Complex[] = new Array(L).fill([0, 0])
    const nextLeft: Complex[] = new Array(L).fill([0, 0])

    for (let x = 0; x < L; x++) {
      if (x + 1 < L) nextRight[x + 1] = coinedRight[x]!

      if (x - 1 >= 0) nextLeft[x - 1] = coinedLeft[x]!
    }

    right = nextRight
    left = nextLeft
  }

  let transmitted = 0

  for (let x = barrierStart + barrierWidth; x < L; x++)
    transmitted += abs2(right[x]!) + abs2(left[x]!)

  return transmitted
}
