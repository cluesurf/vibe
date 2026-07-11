// The position-momentum uncertainty product of a lattice wave packet. The position spread is read
// from the probability distribution, the momentum spread from the discrete Fourier transform, and
// the product obeys the Heisenberg bound of one half (in lattice units with hbar one), saturated
// by the Gaussian packet and exceeded by every other shape.

// The uncertainty product sigma_x times sigma_p of a real envelope packet on a ring of `size`
// cells: a Gaussian of the given width, or a flat-top (square) packet of the same half-width when
// `square` is set.
export function packetUncertaintyProduct(input: {
  size: number
  width: number
  square: boolean
}): number {
  const { size, width, square } = input
  const center = size / 2

  const amplitude = new Array<number>(size).fill(0)

  let normalization = 0

  for (let x = 0; x < size; x++) {
    const value = square
      ? Math.abs(x - center) <= width
        ? 1
        : 0
      : Math.exp(-((x - center) * (x - center)) / (4 * width * width))

    amplitude[x] = value
    normalization += value * value
  }

  const scale = 1 / Math.sqrt(normalization)

  for (let x = 0; x < size; x++) amplitude[x] = amplitude[x]! * scale

  let meanX = 0
  let meanX2 = 0

  for (let x = 0; x < size; x++) {
    const p = amplitude[x]! * amplitude[x]!

    meanX += x * p
    meanX2 += x * x * p
  }

  const sigmaX = Math.sqrt(Math.max(0, meanX2 - meanX * meanX))

  // the momentum distribution from the discrete Fourier transform
  let meanP = 0
  let meanP2 = 0
  let total = 0

  for (let q = 0; q < size; q++) {
    let real = 0
    let imaginary = 0

    for (let x = 0; x < size; x++) {
      const theta = (-2 * Math.PI * q * x) / size

      real += amplitude[x]! * Math.cos(theta)
      imaginary += amplitude[x]! * Math.sin(theta)
    }

    const p = (real * real + imaginary * imaginary) / size
    const momentum =
      q <= size / 2
        ? (2 * Math.PI * q) / size
        : (2 * Math.PI * (q - size)) / size

    meanP += momentum * p
    meanP2 += momentum * momentum * p
    total += p
  }

  meanP /= total
  meanP2 /= total

  const sigmaP = Math.sqrt(Math.max(0, meanP2 - meanP * meanP))

  return sigmaX * sigmaP
}
