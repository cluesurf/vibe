// The position distribution of a discrete-time coined walk on a line, both the coherent (quantum) and the
// incoherent (classical) versions, started from a symmetric superposition at the centre. The lattice has
// width W = 2T + 3 with offset off = T + 1 so position x in [-T-1, T+1] maps to [0, W-1].
//
// The QUANTUM walk keeps a complex amplitude psi[c][x] for coin c in {0 = left, 1 = right}, applies the
// Hadamard coin then a coin-conditioned shift each step, and returns P = |psi|^2 plus the total norm
// (which stays 1, the Born-rule unitarity). Amplitudes can cancel, giving interference fringes and nodes.
// The CLASSICAL walk runs the SAME coin as incoherent probabilities (|Hadamard|^2 = a 50/50 split), so
// it only adds, giving a single smooth hump.

export function coinedWalkQuantumDistribution(input: {
  steps: number
}): {
  distribution: Float64Array
  norm: number
  offset: number
  width: number
} {
  const T = input.steps
  const W = 2 * T + 3
  const off = T + 1
  const re = [new Float64Array(W), new Float64Array(W)]
  const im = [new Float64Array(W), new Float64Array(W)]

  // symmetric start at x=0, (|L> + i|R>)/sqrt2 (a symmetric two-horned distribution)
  re[0]![off] = 1 / Math.SQRT2
  im[1]![off] = 1 / Math.SQRT2

  const h = 1 / Math.SQRT2

  for (let t = 0; t < T; t++) {
    const nr = [new Float64Array(W), new Float64Array(W)]
    const ni = [new Float64Array(W), new Float64Array(W)]

    for (let x = 1; x < W - 1; x++) {
      // Hadamard coin: (a,b) -> ((a+b)/sqrt2, (a-b)/sqrt2)
      const ar = re[0]![x]!
      const ai = im[0]![x]!
      const br = re[1]![x]!
      const bi = im[1]![x]!
      const c0r = h * (ar + br)
      const c0i = h * (ai + bi)
      const c1r = h * (ar - br)
      const c1i = h * (ai - bi)

      // shift: c0 (left) -> x-1, c1 (right) -> x+1
      nr[0]![x - 1]! += c0r
      ni[0]![x - 1]! += c0i
      nr[1]![x + 1]! += c1r
      ni[1]![x + 1]! += c1i
    }

    re[0] = nr[0]!
    re[1] = nr[1]!
    im[0] = ni[0]!
    im[1] = ni[1]!
  }

  const distribution = new Float64Array(W)

  let norm = 0

  for (let x = 0; x < W; x++) {
    distribution[x] =
      re[0]![x]! ** 2 +
      im[0]![x]! ** 2 +
      re[1]![x]! ** 2 +
      im[1]![x]! ** 2
    norm += distribution[x]!
  }

  return { distribution, norm, offset: off, width: W }
}

export function coinedWalkClassicalDistribution(input: {
  steps: number
}): { distribution: Float64Array; offset: number; width: number } {
  const T = input.steps
  const W = 2 * T + 3
  const off = T + 1
  const p = [new Float64Array(W), new Float64Array(W)]

  p[0]![off] = 0.5
  p[1]![off] = 0.5

  for (let t = 0; t < T; t++) {
    const np = [new Float64Array(W), new Float64Array(W)]

    for (let x = 1; x < W - 1; x++) {
      // incoherent coin: each component splits 50/50 (|Hadamard|^2)
      const a = p[0]![x]!
      const b = p[1]![x]!
      const c0 = 0.5 * a + 0.5 * b
      const c1 = 0.5 * a + 0.5 * b

      np[0]![x - 1]! += c0
      np[1]![x + 1]! += c1
    }

    p[0] = np[0]!
    p[1] = np[1]!
  }

  const distribution = new Float64Array(W)

  for (let x = 0; x < W; x++) distribution[x] = p[0]![x]! + p[1]![x]!

  return { distribution, offset: off, width: W }
}
