// Unitary time evolution of a complex state under a Hermitian (here real-symmetric)
// Hamiltonian H, via its eigendecomposition: psi(t) = e^{-iHt} psi(0). Project the
// state onto the eigenbasis, phase-rotate each amplitude by e^{-i lambda_k t}, and
// project back. The eigenvectors are the columns of `vectors` in flat row-major
// form (vectors[i * n + k] = component i of eigenvector k), the shape eigSymmetric
// returns. Exact (no Trotter error) for a time-independent H.

export function evolveByEigendecomposition(input: {
  eig: { values: number[] | Float64Array; vectors: Float64Array }
  n: number
  re0: Float64Array
  im0: Float64Array
  t: number
}): { re: Float64Array; im: Float64Array } {
  const { eig, n, re0, im0, t } = input
  // Project onto eigenbasis.
  const cRe = new Float64Array(n)
  const cIm = new Float64Array(n)

  for (let k = 0; k < n; k++) {
    let ar = 0
    let ai = 0

    for (let i = 0; i < n; i++) {
      const v = eig.vectors[i * n + k] ?? 0

      ar += v * (re0[i] ?? 0)
      ai += v * (im0[i] ?? 0)
    }

    const lambda = eig.values[k] ?? 0
    const c = Math.cos(lambda * t)
    const s = Math.sin(lambda * t)

    // multiply (ar + i ai) by e^{-i lambda t} = c - i s
    cRe[k] = ar * c + ai * s
    cIm[k] = ai * c - ar * s
  }

  // Project back to the site basis.
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let r = 0
    let m = 0

    for (let k = 0; k < n; k++) {
      const v = eig.vectors[i * n + k] ?? 0

      r += v * (cRe[k] ?? 0)
      m += v * (cIm[k] ?? 0)
    }

    re[i] = r
    im[i] = m
  }

  return { re, im }
}
