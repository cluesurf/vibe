// The linearized curvature pipeline in momentum space, Christoffel -> Ricci -> Einstein, built from a
// spatial metric perturbation h_ij at wavevector k (delta metric for raising indices). The graviton
// operator is derived through geometry rather than typed in as a formula. On a transverse-traceless
// perturbation the Einstein operator has eigenvalue (1/2)|k|^2 (the two massless graviton modes), and
// it annihilates pure-gauge perturbations h = k xi + xi k (diffeomorphism invariance).

type Tensor3 = number[][]

// Linearized Christoffel symbol Gamma^l_ij = (1/2)( k_i h_lj + k_j h_li - k_l h_ij ).
export function linearizedChristoffel(
  h: Tensor3,
  k: number[],
): number[][][] {
  const G: number[][][] = [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ]

  for (let l = 0; l < 3; l++) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        G[l]![i]![j] =
          0.5 *
          ((k[i] ?? 0) * (h[l]?.[j] ?? 0) +
            (k[j] ?? 0) * (h[l]?.[i] ?? 0) -
            (k[l] ?? 0) * (h[i]?.[j] ?? 0))
      }
    }
  }

  return G
}

// Linearized Ricci R_ij = -( k_l Gamma^l_ij - k_j Gamma^l_il ). The overall minus is the i^2 from the
// two derivatives carried by the momentum factors.
export function linearizedRicci(h: Tensor3, k: number[]): Tensor3 {
  const G = linearizedChristoffel(h, k)
  const R: Tensor3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let klG = 0

      for (let l = 0; l < 3; l++) {
        klG += (k[l] ?? 0) * (G[l]?.[i]?.[j] ?? 0)
      }

      let trG = 0

      for (let l = 0; l < 3; l++) {
        trG += G[l]?.[i]?.[l] ?? 0
      }

      R[i]![j] = -(klG - (k[j] ?? 0) * trG)
    }
  }

  return R
}

// Linearized Einstein operator G_ij = R_ij - (1/2) delta_ij R, derived through the pipeline above.
export function linearizedEinsteinTensor(
  h: Tensor3,
  k: number[],
): Tensor3 {
  const R = linearizedRicci(h, k)

  let tr = 0

  for (let i = 0; i < 3; i++) {
    tr += R[i]?.[i] ?? 0
  }

  const E: Tensor3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      E[i]![j] = (R[i]?.[j] ?? 0) - (i === j ? 0.5 * tr : 0)
    }
  }

  return E
}
