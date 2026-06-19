// The 1D Jackiw-Rebbi Dirac Hamiltonian, a two-component fermion in a kink (soliton) mass background.
// H = [[m(x), -D], [D, -m(x)]] with m(x) = m0 tanh((x - x0) / R) the kink profile and D the central
// first-difference (an antisymmetric hopping), built as a real-symmetric 2N x 2N matrix (u and v
// components interleaved per site). Its filled negative-energy spectrum is the Dirac sea, whose energy
// as a function of the soliton width R measures the fermion-induced gradient stiffness (the Skyrme
// sign in this tractable 1D proxy).

export function jackiwRebbiHamiltonian(input: {
  sites: number
  mass: number
  width: number
}): number[][] {
  const N = input.sites
  const n = 2 * N
  const H: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )

  const m = (i: number): number =>
    input.mass * Math.tanh((i - N / 2) / input.width)

  for (let i = 0; i < N; i++) {
    H[2 * i]![2 * i] = m(i)
    H[2 * i + 1]![2 * i + 1] = -m(i)

    if (i + 1 < N) {
      // -D on (u, v), +D on (v, u); the central difference D[i][i+1] = +1/2
      H[2 * i]![2 * (i + 1) + 1] = -0.5
      H[2 * (i + 1) + 1]![2 * i] = -0.5
      H[2 * i + 1]![2 * (i + 1)] = 0.5
      H[2 * (i + 1)]![2 * i + 1] = 0.5
    }
  }

  return H
}
